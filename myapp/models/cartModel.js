// models/cartModel.js

const db = require('../db');

const Cart = {
    addItem: async (userId, itemId, quantity) => {
        const query = `
            INSERT INTO cart_items (user_id, item_id, quantity)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + ?
        `;
        const [result] = await db.execute(query, [userId, itemId, quantity, quantity]);
        return result;
    },

    getItemsByUser: async (userId) => {
        const query = `
            SELECT ci.*, i.name, i.description, i.basePricePerHour, i.basePricePerDay
            FROM cart_items ci
            JOIN items i ON ci.item_id = i.id
            WHERE ci.user_id = ?
        `;
        const [rows] = await db.execute(query, [userId]);
        return rows;
    },

    updateItemQuantity: async (userId, itemId, quantity) => {
        const query = `
            UPDATE cart_items
            SET quantity = ?
            WHERE user_id = ? AND item_id = ?
        `;
        const [result] = await db.execute(query, [quantity, userId, itemId]);
        return result;
    },

    removeItem: async (userId, itemId) => {
        const query = `
            DELETE FROM cart_items
            WHERE user_id = ? AND item_id = ?
        `;
        const [result] = await db.execute(query, [userId, itemId]);
        return result;
    },

    clearCart: async (userId) => {
        const query = `
            DELETE FROM cart_items
            WHERE user_id = ?
        `;
        const [result] = await db.execute(query, [userId]);
        return result;
    }
};

module.exports = Cart;
