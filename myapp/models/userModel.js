// models/User.js
const mysql = require('mysql2');

const db = require('../db'); 


db.connect(err => {
    if (err) throw err;
    console.log('Database connected!');
});

const User = {
    create: (username, password, email, role, callback) => {
        const query = 'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)';
        db.query(query, [username, password, email, role], callback);
    },
    findByUsername: (username, callback) => {
        const query = 'SELECT * FROM users WHERE username = ?';
        db.query(query, [username], callback);
    },
    
    findAll: (callback) => {
        const query = 'SELECT id, username, role FROM users';
        db.query(query, callback);
    },
    deleteById: (userId, callback) => {
        const query = 'DELETE FROM users WHERE id = ?';
        db.query(query, [userId], callback);
    },
    
    update: (query, values, callback) => {
        db.query(query, values, callback);
    },
    
    update2: (userId, updates, callback) => {
        const query = `
            UPDATE users 
            SET 
                username = COALESCE(?, username), 
                password = COALESCE(?, password), 
                email = COALESCE(?, email), 

                role = COALESCE(?, role) 
            WHERE id = ?
        `;
    
        const values = [updates.username || null, updates.password || null,updates.email || null,  updates.role || null, userId];
    
        db.query(query, values, (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                return callback(error);
            }
            callback(null, results);
        });
    },

    findByEmail: (email, callback) => {
        const query = 'SELECT * FROM users WHERE email = ?';
        db.query(query, [email], callback);
    },
    updatePassword: (username, hashedPassword, callback) => {
        const query = 'UPDATE users SET password = ? WHERE username = ?';
        db.query(query, [hashedPassword, username], callback);
    },
    
    findByRoleOrUsername: (searchTerm, callback) => {
        const query = 'SELECT * FROM users WHERE role = ? OR username = ?';
        db.query(query, [searchTerm, searchTerm], callback);
    },
    findById: (userId, callback) => {
        const query = 'SELECT * FROM users WHERE id = ?';
        db.query(query, [userId], callback);
    },

    getRoleCounts: (callback) => {
        const query = `
            SELECT 
                COUNT(*) AS total,
                SUM(role = 'admin') AS admin,
                SUM(role = 'owner') AS owner,
                SUM(role = 'user') AS regularUser,
                SUM(role = 'delivery') AS delivery
            FROM users;
        `;

        db.query(query, (error, results) => {
            if (error) return callback(error, null);
            callback(null, results[0]);
        });
    }
};

module.exports = User;
