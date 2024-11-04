const User = require('../models/userModel');
const Item = require('../models/Items');
const connection = require('../db');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'noorsayeh009@gmail.com',
        pass: 'aoob ypdn jjuo unub',
    },
    logger: true,
    debug: true,
});

module.exports = {
    createRating: async (req, res) => {
        const { itemId, rating, comment } = req.body;
        const username = req.user.username;
        const userRole = req.user.role;

        if (userRole !== 'user') {
            return res.status(403).json({ message: 'Not authorized to perform this action.' });
        }

        try {
            // Check if the item exists
            const [itemResults] = await connection.execute(
                `SELECT * FROM items WHERE id = ?`, [itemId]
            );
            if (itemResults.length === 0) {
                return res.status(404).json({ message: 'Item not found.' });
            }

            // Insert new review
            await connection.execute(
                `INSERT INTO reviews (username, itemId, rating, comment) VALUES (?, ?, ?, ?)`,
                [username, itemId, rating, comment]
            );

            res.status(201).json({ status: true, message: "Rating created successfully" });

            // Send email if the rating is low
            if (rating < 3) {
                const itemOwnerUsername = itemResults[0].username;

                const [ownerEmailResults] = await connection.execute(
                    `SELECT email FROM users WHERE username = ?`, [itemOwnerUsername]
                );

                if (ownerEmailResults.length > 0) {
                    const ownerEmail = ownerEmailResults[0].email;
                    const mailOptions = {
                        from: 'Admin',
                        to: ownerEmail,
                        subject: 'New Low Rating Alert',
                        text: `The item "${itemResults[0].name}" received a low rating of ${rating}. Comment: "${comment}". Enhance your item.`,
                    };

                    try {
                        await transporter.sendMail(mailOptions);
                    } catch (err) {
                        console.error('Error sending email:', err);
                        return res.status(500).json({ message: 'Error sending email.', error: err.message });
                    }
                }
            }
        } catch (error) {
            console.error('Caught error:', error);
            res.status(500).json({ status: false, message: error.message });
        }
    },

    deleteRating: async (req, res) => {
        const { itemId } = req.body;
        const username = req.user.username;
        const userRole = req.user.role;

        if (userRole !== 'user') {
            return res.status(403).json({ message: 'Not authorized to perform this action.' });
        }

        try {
            const [reviewResults] = await connection.execute(
                `SELECT * FROM reviews WHERE username = ? AND itemId = ?`, [username, itemId]
            );

            if (reviewResults.length === 0) {
                return res.status(404).json({ message: "Review not found." });
            }

            await connection.execute(
                `DELETE FROM reviews WHERE username = ? AND itemId = ?`, [username, itemId]
            );

            res.status(200).json({ message: 'Review deleted successfully.' });
        } catch (error) {
            console.error('Caught error:', error);
            res.status(500).json({ status: false, message: error.message });
        }
    },

    getAllRating: async (req, res) => {
        const userRole = req.user.role;

        if (userRole !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to perform this action.' });
        }

        try {
            const [reviewsResults] = await connection.execute(`
                SELECT r.reviewerId, r.username, r.itemId, r.rating, r.comment, i.name AS itemName, i.description AS itemDescription 
                FROM reviews r
                JOIN items i ON r.itemId = i.id
            `);

            if (reviewsResults.length === 0) {
                return res.status(404).json({ message: 'No reviews found.' });
            }

            res.status(200).json({ status: true, data: reviewsResults });
        } catch (error) {
            console.error('Caught error:', error);
            res.status(500).json({ status: false, message: error.message });
        }
    },

    admindeleteRating: async (req, res) => {
        const { reviewerId, itemId } = req.body;
        const userRole = req.user.role;

        if (userRole !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to perform this action.' });
        }

        try {
            const [reviewResults] = await connection.execute(
                `SELECT * FROM reviews WHERE reviewerId = ? AND itemId = ?`, [reviewerId, itemId]
            );

            if (reviewResults.length === 0) {
                return res.status(404).json({ message: "Review not found." });
            }

            await connection.execute(
                `DELETE FROM reviews WHERE reviewerId = ? AND itemId = ?`, [reviewerId, itemId]
            );

            res.status(200).json({ message: 'Review deleted successfully.' });
        } catch (error) {
            console.error('Caught error:', error);
            res.status(500).json({ status: false, message: error.message });
        }
    },

    updateReview: async (req, res) => {
        const { itemId, rating, comment } = req.body;
        const username = req.user.username;
        const userRole = req.user.role;

        if (userRole !== 'user') {
            return res.status(403).json({ message: 'Only users can update reviews.' });
        }

        try {
            const [reviewResults] = await connection.execute(
                `SELECT * FROM reviews WHERE username = ? AND itemId = ?`, [username, itemId]
            );

            if (reviewResults.length === 0) {
                return res.status(404).json({ message: "Review not found for this item by this user." });
            }

            await connection.execute(
                `UPDATE reviews SET rating = ?, comment = ? WHERE username = ? AND itemId = ?`,
                [rating, comment, username, itemId]
            );

            res.status(200).json({ message: 'Review updated successfully.' });
        } catch (error) {
            console.error('Caught error:', error);
            res.status(500).json({ status: false, message: error.message });
        }
    },

    getRatingsByItemId: async (req, res) => {
        const { itemId } = req.body;

        try {
            const [itemResults] = await connection.execute(
                `SELECT name, description FROM items WHERE id = ?`, [itemId]
            );

            if (itemResults.length === 0) {
                return res.status(404).json({ message: 'Item not found.' });
            }

            const [reviewsResults] = await connection.execute(
                `SELECT r.reviewerId, r.username, r.rating, r.comment FROM reviews r WHERE r.itemId = ?`, [itemId]
            );

            if (reviewsResults.length === 0) {
                return res.status(404).json({ message: 'No reviews found for this item.' });
            }

            res.status(200).json({
                status: true,
                item: itemResults[0],
                reviews: reviewsResults,
            });
        } catch (error) {
            console.error('Caught error:', error);
            res.status(500).json({ status: false, message: error.message });
        }
    },
};