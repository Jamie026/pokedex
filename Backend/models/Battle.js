// models/Battle.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/db");

const Battle = sequelize.define("Battle", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    player1Username: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    player2Username: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM("waiting", "ongoing", "finished"),
        allowNull: false,
        defaultValue: "waiting"
    },
    winnerUsername: {
        type: DataTypes.STRING(50),
        allowNull: true
    }
}, {
    tableName: "battles",
    timestamps: false
});

module.exports = Battle;