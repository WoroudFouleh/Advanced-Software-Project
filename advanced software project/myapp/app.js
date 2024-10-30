const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connection = require('./db'); // الاتصال بقاعدة البيانات من ملف db.js
const authRoute = require('./routes/auth'); // مسار تسجيل الدخول
const userRoutes = require('./routes/userRoutes'); // مسار المستخدمين
const RatingRoute= require('./routes/Rating');
const itemRoutes = require('./routes/itemRoutes'); // Adjust the path if necessary
const bookingRoutes = require('./routes/bookingRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const discountLevelRoutes = require('./routes/discountLevelRoutes');  // Adjust the path as needed
const userPointsHistoryRoutes = require('./routes/userPointsHistoryRoutes');
const insuranceRoutes = require('./routes/insuranceRoutes');
const app = express();
app.use(express.json());

dotenv.config(); // تحميل الإعدادات من ملف .env

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// تعريف المسارات

app.use('/api/users', RatingRoute);
app.use('/auth1', authRoute);

console.log("User Route Loaded");
app.use('/api', itemRoutes);
app.use('/api2', userRoutes); // ربط المسارات
app.use('/api', insuranceRoutes);
console.log("Item Routes Loaded");
app.use('/api', bookingRoutes);
console.log("Booking Routes Loaded"); 
// تحديد منفذ الاستماع للخادم
app.use('/api/statistics', statisticsRoutes);
console.log("statistics Routes Loaded"); 
app.use('/api/discount-levels', discountLevelRoutes);  // Integrate the discount levels routes
app.use('/api/user-points-history', userPointsHistoryRoutes);
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


module.exports = app;
