require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: false,
    }
);

async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log("✅ Conexión a la base de datos establecida correctamente.");

        await sequelize.sync({ alter: false });
        console.log("✅ Modelos sincronizados con la base de datos.");
    } catch (error) {
        console.error("❌ Error al conectar a la base de datos:", error);
        process.exit(1);
    }
}

module.exports = { sequelize, connectDB };
