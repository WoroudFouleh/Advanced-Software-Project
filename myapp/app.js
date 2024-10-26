const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connection = require('./db'); // الاتصال بقاعدة البيانات من ملف db.js
const authRoute = require('./routes/auth'); // مسار تسجيل الدخول
const itemRoutes = require('./routes/itemRoutes'); // This should be the correct relative path
const userRoutes = require('./routes/userRoutes'); // This should be the correct relative path
const logisticsRoutes = require('./routes/logistics');
const bookingRoutes = require('./routes/bookingRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const discountLevelRoutes = require('./routes/discountLevelRoutes');  // Adjust the path as needed
const userPointsHistoryRoutes = require('./routes/userPointsHistoryRoutes');
const cartRoutes = require('./routes/cartRoutes'); // استيراد مسارات السلة


app.use(express.json()); // To handle JSON requests

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
app.use('/api/logistics', logisticsRoutes);
console.log("logistics Routes Loaded");

app.use('/api', bookingRoutes);
console.log("Booking Routes Loaded"); 
app.use('/api/statistics', statisticsRoutes);
console.log("statistics Routes Loaded"); 
app.use('/api/discount-levels', discountLevelRoutes);  // Integrate the discount levels routes
app.use('/api/user-points-history', userPointsHistoryRoutes)

app.use('/api', cartRoutes); // ربط مسارات السلة

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
