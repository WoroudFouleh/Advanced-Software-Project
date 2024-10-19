// models/User.js
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's120WOROUD#',
    database: 'worouddb'
});

db.connect(err => {
    if (err) throw err;
    console.log('Database connected!');
});

const User = {
    create: (username, password, role, callback) => {
        const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        db.query(query, [username, password, role], callback);
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
        // إعداد استعلام SQL مع استخدام COALESCE للحفاظ على القيم القديمة إذا لم يتم تقديم قيمة جديدة
        const query = `
            UPDATE users 
            SET 
                username = COALESCE(?, username), 
                password = COALESCE(?, password), 
                role = COALESCE(?, role) 
            WHERE id = ?
        `;
    
        const values = [updates.username || null, updates.password || null, updates.role || null, userId];
    
        // تنفيذ الاستعلام
        db.query(query, values, (error, results) => {
            if (error) {
                console.error('Error executing query:', error); // طباعة الخطأ في التيرمنال
                return callback(error);
            }
            callback(null, results);
        });
    },

    
    findByRoleOrUsername: (searchTerm, callback) => {
        const query = 'SELECT * FROM users WHERE role = ? OR username = ?';
        db.query(query, [searchTerm, searchTerm], callback);
    },
    findById: (userId, callback) => {
        const query = 'SELECT * FROM users WHERE id = ?';
        db.query(query, [userId], callback);
        exports.update = (userId, updates, callback) => {
            // إعداد استعلام SQL مع استخدام COALESCE للحفاظ على القيم القديمة إذا لم يتم تقديم قيمة جديدة
            const query = `
                UPDATE users 
                SET 
                    username = COALESCE(?, username), 
                    password = COALESCE(?, password), 
                    role = COALESCE(?, role) 
                WHERE id = ?
            `;
        
            const values = [updates.username, updates.password, updates.role, userId];
        
            // تنفيذ الاستعلام
            db.query(query, values, (error, results) => {
                if (error) {
                    console.error('Error executing query:', error); // طباعة الخطأ في التيرمنال
                    return callback(error);
                }
                callback(null, results);
            });
        };    }
};


module.exports = User;
