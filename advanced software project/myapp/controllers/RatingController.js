const User = require('../models/User'); // If you're not using Sequelize, you can remove this
const Item = require('../models/Items'); // Ensure this path is correct
const db = require('../db'); // Ensure this path is correct

module.exports = {
    createRating: async (req, res) => {
        const { userId, itemId, rating, comment } = req.body;

        try {
            // Check if the user exists
            const roleSql = `SELECT role FROM users WHERE id = ?`;
            const roleParams = [userId];
            const [roleResults] = await db.query(roleSql, roleParams); // Query for the user's role
    
            if (roleResults.length === 0) {
                return res.status(404).json({ message: 'User not found.' });
            }
    
            const userRole = roleResults[0].role;
    
            // If the role is not "user", return an error or handle accordingly
            if (userRole !== 'user') {
                return res.status(403).json({ message: 'Not authorized to perform this action.' });
            }



            const userSql = `SELECT * FROM users WHERE id = ?`;
            const userParams = [userId];
            const [userResults] = await db.query(userSql, userParams); // Using promise-based query

            if (userResults.length === 0) {
                return res.status(404).json({ message: 'User not found.' });
            }

            // Check if the item exists
            const itemSql = `SELECT * FROM items WHERE id = ?`;
            const itemParams = [itemId];
            const [itemResults] = await db.query(itemSql, itemParams); // Using promise-based query

            if (itemResults.length === 0) {
                return res.status(404).json({ message: 'Item not found.' });
            }

            // Create new rating using raw SQL query
            const sql = `INSERT INTO reviews (id, itemId, rating, comment) VALUES (?, ?, ?, ?)`;
            const parameters = [userId, itemId, rating, comment];

            // Log the parameters for debugging
            console.log('Parameters:', parameters);

            await db.query(sql, parameters); // Using promise-based query

            res.status(201).json({ status: true, message: "Rating created successfully" });

        } catch (error) {
            console.error('Caught error:', error);
            res.status(500).json({ status: false, message: error.message });
        }
    },


    deleteRating: async (req, res) => {
        const { userId, itemId,} = req.body;

        try {
            // Check if the user exists
            const roleSql = `SELECT role FROM users WHERE id = ?`;
            const roleParams = [userId];
            const [roleResults] = await db.query(roleSql, roleParams); // Query for the user's role
    
            if (roleResults.length === 0) {
                return res.status(404).json({ message: 'User not found.' });
            }
    
            const userRole = roleResults[0].role;
    
            // If the role is not "user", return an error or handle accordingly
            if (userRole !== 'user') {
                return res.status(403).json({ message: 'Not authorized to perform this action.' });
            }


            
            const userSql = `SELECT * FROM users WHERE id = ?`;
            const userParams = [userId];
            const [userResults] = await db.query(userSql, userParams); // Using promise-based query

            if (userResults.length === 0) {
                return res.status(404).json({ message: 'User not found.' });
            }

            const reviewSql = `SELECT * FROM reviews WHERE id = ? AND itemId = ?`;
            const reviewParams = [userId, itemId];
            const [reviewResults] = await db.query(reviewSql, reviewParams); // Query for the user's review
        
            if (reviewResults.length === 0) {
                // User has not reviewed the item
                return res.status(404).json({ message: "You didn't review this item." });
            }
        
            // Delete the user's review
            const deleteReviewSql = `DELETE FROM reviews WHERE id = ? AND itemId = ?`;
            await db.query(deleteReviewSql, reviewParams); // Delete the review
        
            return res.status(200).json({ message: 'Review deleted successfully.' });


        } catch (error) {
            console.error('Caught error:', error);
            res.status(500).json({ status: false, message: error.message });
        }
    }




















};
