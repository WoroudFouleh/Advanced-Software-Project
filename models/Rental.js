
const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Rental = sequelize.define("Rental", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    renterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    rentalStartDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    rentalEndDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    totalPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("active", "completed", "canceled"),
        defaultValue: "active",
    }
}, {
    timestamps: true,
});

module.exports = Rental;
