const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connection = require('./db'); // الاتصال بقاعدة البيانات من ملف db.js
const authRoute = require('./routes/auth'); // مسار تسجيل الدخول
const userRoute = require('./routes/userRoutes'); // مسار المستخدمين
const itemRoutes = require('./routes/itemRoutes'); // This should be the correct relative path
const userRoutes = require('./routes/userRoutes'); // This should be the correct relative path
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
app.use(express.json());

dotenv.config(); // تحميل الإعدادات من ملف .env

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));





console.log("Starting server...");
// وبعد كل استخدام للمسار
console.log("Auth Route Loaded");
app.use('/auth1', authRoute);

console.log("User Route Loaded");
app.use('/api', itemRoutes);
app.use('/api2', userRoutes); // ربط المسارات

console.log("Item Routes Loaded");
app.use('/api', bookingRoutes);
console.log("Booking Routes Loaded"); 


// تحديد منفذ الاستماع للخادم
const port = process.env.PORT || 6005;

const server = app.listen(port, () => console.log(`App listening on port ${port}!`));

module.exports = app;
