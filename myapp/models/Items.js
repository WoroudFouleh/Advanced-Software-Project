const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Item = sequelize.define("Item", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    basePricePerDay: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    basePricePerHour: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    availabilityStartDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    availabilityEndDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("available", "rented", "unavailable"),
        defaultValue: "available",
    }
}, {
    timestamps: true,
});

module.exports = Item; // تأكد من أن الملف يقوم بتصدير النموذج بشكل صحيح
