const express = require("express");
const router = express.Router();
const Battle = require("../models/Battle");
const Team = require("../models/Team");
const User = require("../models/User");
const verifyToken = require("../middlewares/auth");
const { Op } = require("sequelize");

router.post("/create", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado" });

        const activeBattle = await Battle.findOne({
            where: {
                status: ["waiting", "ongoing"],
                [Op.or]: [
                    { player1Username: user.username },
                    { player2Username: user.username }
                ]
            }
        });
        if (activeBattle) {
            return res.status(400).json({ success: false, message: "Ya tienes una batalla activa" });
        }

        const team = await Team.findOne({ where: { userId } });
        if (!team) {
            return res.status(400).json({ success: false, message: "El jugador no tiene equipo" });
        }
        const teamData = JSON.parse(team.data);
        if (!Array.isArray(teamData) || teamData.length !== 6) {
            return res.status(400).json({ success: false, message: "El equipo debe tener exactamente 6 Pokémon" });
        }

        const battle = await Battle.create({
            player1Username: user.username,
            status: "waiting"
        });

        req.io.emit("battleCreated", battle);

        res.status(201).json({ success: true, battle });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error creando la sala" });
    }
});

router.post("/join/:id", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado" });

        const { id } = req.params;
        const battle = await Battle.findByPk(id);
        if (!battle) return res.status(404).json({ success: false, message: "Sala no encontrada" });

        const activeBattle = await Battle.findOne({
            where: {
                status: ["waiting", "ongoing"],
                [Op.or]: [
                    { player1Username: user.username },
                    { player2Username: user.username }
                ]
            }
        });
        if (activeBattle) {
            return res.status(400).json({ success: false, message: "Ya tienes una batalla activa" });
        }

        if (battle.status !== "waiting") {
            return res.status(400).json({ success: false, message: "La sala ya está ocupada o finalizada" });
        }
        if (battle.player1Username === user.username) {
            return res.status(400).json({ success: false, message: "No puedes unirte a tu propia sala" });
        }
        if (battle.player2Username) {
            return res.status(400).json({ success: false, message: "La sala ya tiene un segundo jugador" });
        }

        const team = await Team.findOne({ where: { userId } });
        if (!team) {
            return res.status(400).json({ success: false, message: "El jugador no tiene equipo" });
        }
        const teamData = JSON.parse(team.data);
        if (!Array.isArray(teamData) || teamData.length !== 6) {
            return res.status(400).json({ success: false, message: "El equipo debe tener exactamente 6 Pokémon" });
        }

        battle.player2Username = user.username;
        battle.status = "ongoing";
        await battle.save();

        req.io.emit("battleJoined", battle);

        res.json({ success: true, battle });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error uniéndose a la sala" });
    }
});

router.delete("/cancel/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const battle = await Battle.findByPk(id);
        if (!battle) return res.status(404).json({ success: false, message: "Sala no encontrada" });

        await battle.destroy();

        req.io.emit("battleCancelled", { id });

        res.json({ success: true, message: "Sala cancelada" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error cancelando la sala" });
    }
});

router.post("/finish/:id", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado" });

        const { id } = req.params;
        const battle = await Battle.findByPk(id);
        if (!battle) return res.status(404).json({ success: false, message: "Batalla no encontrada" });

        if (battle.status === "finished") {
            return res.status(400).json({ success: false, message: "La batalla ya está finalizada" });
        }

        battle.status = "finished";
        battle.winnerUsername = user.username;
        await battle.save();

        res.json({ success: true, battle });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error finalizando la batalla" });
    }
});

router.get("/waiting", verifyToken, async (req, res) => {
    try {
        const battles = await Battle.findAll({
            where: { status: "waiting" }
        });
        res.json({ success: true, battles });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error listando salas" });
    }
});

router.get("/:id/teams", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const user = await User.findByPk(userId);

        const battle = await Battle.findByPk(id);
        if (!battle) {
            return res.status(404).json({ success: false, message: "Batalla no encontrada" });
        }

        const player1 = await User.findOne({ where: { username: battle.player1Username } });
        if (!player1) {
            return res.status(404).json({ success: false, message: "Jugador 1 no encontrado" });
        }
        const team1 = await Team.findOne({ where: { userId: player1.id } });
        const team1Data = team1 ? JSON.parse(team1.data) : [];

        let player2 = null;
        let team2Data = [];
        if (battle.player2Username) {
            player2 = await User.findOne({ where: { username: battle.player2Username } });
            if (!player2) {
                return res.status(404).json({ success: false, message: "Jugador 2 no encontrado" });
            }
            const team2 = await Team.findOne({ where: { userId: player2.id } });
            team2Data = team2 ? JSON.parse(team2.data) : [];
        }

        res.json({
            success: true,
            currentUserUsername: user.username,
            battle: {
                id: battle.id,
                status: battle.status,
                player1: { username: battle.player1Username, pokemons: team1Data },
                player2: { username: battle.player2Username, pokemons: team2Data }
            }
        });

    } catch (error) {
        console.error("Error fetching teams for battle:", error);
        res.status(500).json({ success: false, message: "Error al obtener los equipos de la batalla" });
    }
});

module.exports = router;
