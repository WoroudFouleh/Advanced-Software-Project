// models/User.js
const db = require('../db'); // Adjust the path if needed
const { DataTypes } = require('mysql2');

const User = {
    id: {
        type:'INTEGER',
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: 'STRING',
        allowNull: false,
        unique: true,
    },
    password: {
        type: 'STRING',
        allowNull: false,
    },
    role: {
        type: 'ENUM',
        values: ["admin", "owner", "user", "delivery"],
        allowNull: false,
    },
    created_at: {
        type:'TIMESTAMP',
        defaultValue: "NOW",
    }


 
};

module.exports = User;

