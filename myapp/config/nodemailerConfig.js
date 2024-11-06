const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: 's12027619@@stu.najah.edu', 
        pass: 'nxua aneq ktoz yole' 
    }
});

module.exports = transporter;
