const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: 'noorsayeh009@gmail.com', 
        pass: 'aoob ypdn jjuo unub', 
    }
});

module.exports = transporter;