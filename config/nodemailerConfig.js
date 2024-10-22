const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // استخدم خدمة البريد الإلكتروني المناسبة
    auth: {
        user: 's12027619@@stu.najah.edu', // بريدك الإلكتروني
        pass: 'nxua aneq ktoz yole' // كلمة المرور أو رمز التطبيق
    }
});

module.exports = transporter;