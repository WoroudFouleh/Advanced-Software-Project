const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Owner = sequelize.define("Owner", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    timestamps: true,
});

module.exports = Owner;
