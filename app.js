const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connection = require('./db'); // الاتصال بقاعدة البيانات من ملف db.js
const authRoute = require('./routes/auth'); // مسار تسجيل الدخول
const userRoute = require('./routes/user'); // مسار المستخدمين

const app = express();
app.use(express.json());

dotenv.config(); // تحميل الإعدادات من ملف .env

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// تعريف المسارات
app.use('/api/', authRoute);
app.use('/api/users', userRoute);

// تحديد منفذ الاستماع للخادم
const port = process.env.PORT || 8008;

const server = app.listen(port, () => console.log(`App listening on port ${port}!`));

module.exports = app;
