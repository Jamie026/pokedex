const express = require("express");
require("dotenv").config();

const Team = require("../models/Team");
const verifyToken = require("../middlewares/auth");

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
    try {
        const id = req.user.id
        const team = await Team.findOne({ where: { userId: id } });

        if (!team) {
            return res.status(404).json({ message: "No se encontró un equipo para este usuario" });
        }

        const dataArray = JSON.parse(team.data || "[]");

        res.json({ userId: team.userId, data: dataArray });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el equipo" });
    }
});

router.post("/", verifyToken, async (req, res) => {
    try {
        const { pokemonId } = req.body;

        const userId = req.user.id

        if (!userId || !pokemonId) {
            return res.status(400).json({ message: "Faltan datos requeridos" });
        }

        let team = await Team.findOne({ where: { userId } });

        if (!team) {
            team = await Team.create({
                userId,
                data: JSON.stringify([pokemonId])
            });
            return res.status(201).json({ message: "Equipo creado", data: [pokemonId] });
        }

        let dataArray = [];
        try {
            dataArray = JSON.parse(team.data || "[]");
        } catch {
            dataArray = [];
        }

        if (dataArray.includes(pokemonId)) {
            return res.status(400).json({ message: "Este Pokémon ya está en el equipo" });
        }

        if (dataArray.length >= 6) {
            return res.status(400).json({ message: "El equipo ya tiene el máximo de 6 Pokémon" });
        }

        dataArray.push(pokemonId);

        await team.update({ data: JSON.stringify(dataArray) });

        res.json({ message: "Pokémon agregado al equipo", data: dataArray });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al agregar Pokémon al equipo" });
    }
});

router.delete("/:pokemonId", verifyToken, async (req, res) => {
    try {
        const { pokemonId } = req.params;

        const userId = req.user.id

        if (!userId || !pokemonId) {
            return res.status(400).json({ message: "Faltan datos requeridos" });
        }

        let team = await Team.findOne({ where: { userId } });

        if (!team) {
            return res.status(404).json({ message: "No se encontró un equipo para este usuario" });
        }
        
        let dataArray = [];
        try {
            dataArray = JSON.parse(team.data || "[]");
        } catch {
            dataArray = [];
        }
    
        if (!dataArray.includes(parseInt(pokemonId))) {
            return res.status(400).json({ message: "Este Pokémon no está en el equipo" });
        }

        dataArray = dataArray.filter(id => id != pokemonId);

        await team.update({ data: JSON.stringify(dataArray) });

        res.json({ message: "Pokémon eliminado del equipo", data: dataArray });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar Pokémon del equipo" });
    }
});

module.exports = router;
