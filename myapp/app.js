const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connection = require('./db'); // الاتصال بقاعدة البيانات من ملف db.js
const authRoute = require('./routes/auth'); // مسار تسجيل الدخول
const userRoute = require('./routes/user'); // مسار المستخدمين
const itemRoutes = require('./routes/itemRoutes'); // This should be the correct relative path

const app = express();
app.use(express.json());

dotenv.config(); // تحميل الإعدادات من ملف .env

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));





console.log("Starting server...");
// وبعد كل استخدام للمسار
console.log("Auth Route Loaded");
console.log("User Route Loaded");
app.use('/api', itemRoutes);
console.log("Item Routes Loaded");


// تحديد منفذ الاستماع للخادم
const port = process.env.PORT || 8002;

const server = app.listen(port, () => console.log(`App listening on port ${port}!`));

module.exports = app;
