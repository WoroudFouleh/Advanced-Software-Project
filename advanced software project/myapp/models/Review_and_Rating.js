const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const { Sequelize } = require("sequelize");

const Review = sequelize.define("Review", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        
    },
    itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    reviewerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        
        validate: { min: 1, max: 5 },
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    timestamps: true,
});

module.exports = Review;
