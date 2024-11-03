// services/paymentNotification.js
const nodemailer = require('nodemailer');
const connection = require('../db'); // Assuming your database connection is needed

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const paymentNotification = async (userId, message) => {
    try {
        const [user] = await connection.query('SELECT email FROM users WHERE id = ?', [userId]);
        if (user.length > 0) {
            const userEmail = user[0].email;
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: userEmail,
                subject: 'Payment Confirmation',
                text: message
            };
            await transporter.sendMail(mailOptions);
            console.log('Notification email sent successfully to:', userEmail);
        } else {
            console.log('No user found with the given ID.');
        }
    } catch (error) {
        console.error('Error sending email notification:', error);
    }
};

module.exports = paymentNotification; // Ensure it's exported correctly