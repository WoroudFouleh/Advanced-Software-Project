const connection = require('../db'); // استيراد الاتصال بقاعدة البيانات
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendNotification = async (userId, message) => {
    try {
        // Fetch the user's email from the database
        const [user] = await connection.query('SELECT email FROM users WHERE id = ?', [userId]);

        if (user.length > 0) {
            const userEmail = user[0].email;

            // Setup email options
            const mailOptions = {
                from: process.env.EMAIL_USER, // استخدم البريد الإلكتروني من ملف .env
                to: userEmail,
                subject: 'Logistics Update',
                text: message
            };

            // Send the email
            await transporter.sendMail(mailOptions);
            console.log('Notification email sent successfully to:', userEmail);
        } else {
            console.log('No user found with the given ID.');
        }
    } catch (error) {
        console.error('Error sending email notification:', error);
    }
};

module.exports = { sendNotification };
