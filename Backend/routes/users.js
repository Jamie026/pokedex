const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { Op } = require("sequelize");

const User = require("../models/User");
const verifyToken = require("../middlewares/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { name, lastname, username, password, email } = req.body;

        if (!name || !lastname || !username || !password || !email) {
            return res.status(400).json({ message: "Todos los campos son requeridos." });
        }

        const existingUser = await User.findOne({ where: { username } });
        const existingEmail = await User.findOne({ where: { email } });

        if (existingUser) return res.status(400).json({ message: "El nombre de usuario ya existe." });
        if (existingEmail) return res.status(400).json({ message: "El email ya está registrado." });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            lastname,
            username,
            password: hashedPassword,
            email,
        });

        res.status(201).json({
            message: "Usuario registrado con éxito.",
            user: {
                id: newUser.id,
                name: newUser.name,
                lastname: newUser.lastname,
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;

        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username: usernameOrEmail },
                    { email: usernameOrEmail },
                ],
            },
        });

        if (!user) return res.status(400).json({ message: "Usuario o email no encontrado." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Contraseña incorrecta." });

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES }
        );

        res.json({
            message: "Inicio de sesión exitoso.",
            token,
            user: {
                id: user.id,
                name: user.name,
                lastname: user.lastname,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

router.get("/", verifyToken, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ["password"] },
        });
        res.json(users);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

router.get("/current", verifyToken, async (req, res) => {
    res.json({ userId: req.user.id });
})

module.exports = router;
