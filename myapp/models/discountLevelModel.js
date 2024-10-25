const db = require('../db');  // Adjust the path as needed

class DiscountLevel {
    static async getAll() {
        const query = 'SELECT * FROM discount_levels';
        return new Promise((resolve, reject) => {
            db.execute(query, (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    }

    static async getById(id) {
        const query = 'SELECT * FROM discount_levels WHERE id = ?';
        return new Promise((resolve, reject) => {
            db.execute(query, [id], (error, results) => {
                if (error) return reject(error);
                resolve(results[0]);
            });
        });
    }

    static async create(min_points, discount_percentage) {
        const query = 'INSERT INTO discount_levels (min_points, discount_percentage) VALUES (?, ?)';
        return new Promise((resolve, reject) => {
            db.execute(query, [min_points, discount_percentage], (error, result) => {
                if (error) return reject(error);
                resolve(result.insertId);
            });
        });
    }

    static async update(id, min_points, discount_percentage) {
        const query = 'UPDATE discount_levels SET min_points = ?, discount_percentage = ? WHERE id = ?';
        return new Promise((resolve, reject) => {
            db.execute(query, [min_points, discount_percentage, id], (error) => {
                if (error) return reject(error);
                resolve();
            });
        });
    }

    static async delete(id) {
        const query = 'DELETE FROM discount_levels WHERE id = ?';
        return new Promise((resolve, reject) => {
            db.execute(query, [id], (error) => {
                if (error) return reject(error);
                resolve();
            });
        });
    }
}

module.exports = DiscountLevel;
