// models/Item.js
const db = require('../db'); // Adjust the path if needed

const Item = {
    id: {
        type: 'INTEGER',
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: 'STRING',
        allowNull: false,
    },
    description: {
        type: 'TEXT',
        allowNull: false,
    },
    basePricePerDay: {
        type: 'FLOAT',
        allowNull: false,
    },
    basePricePerHour: {
        type: 'FLOAT',
        allowNull: true, // The hourly price can be optional
    },
    ownerId: {
        type: 'INTEGER',
        allowNull: false,
    },
    availabilityStartDate: {
        type: 'DATE',
        allowNull: false,
    },
    availabilityEndDate: {
        type: 'DATE',
        allowNull: false,
    },
    status: {
        type: 'ENUM',
        values: ["available", "rented", "unavailable"],
        defaultValue: "available",
    },
};

// Export the Item model
module.exports = Item;
