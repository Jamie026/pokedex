const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/db");

const Team = sequelize.define("Team", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "users", 
            key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    },
    data: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: "teams",
    timestamps: false
});

module.exports = Team;
