const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const dotenv = require('dotenv');
const connection = require('./db'); // الاتصال بقاعدة البيانات من ملف db.js
const authRoute = require('./routes/auth'); // مسار تسجيل الدخول
const userRoute = require('./routes/userRoutes'); // مسار المستخدمين
const itemRoutes = require('./routes/itemRoutes'); // This should be the correct relative path
const userRoutes = require('./routes/userRoutes'); // This should be the correct relative path
const bookingRoutes = require('./routes/bookingRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const discountLevelRoutes = require('./routes/discountLevelRoutes');  // Adjust the path as needed
const userPointsHistoryRoutes = require('./routes/userPointsHistoryRoutes');
const messageRoutes = require('./routes/MessageRoutes');
const rentalPeriodRoutes= require('./routes/rentalRoutes')
const pricingRulesRoute = require('./routes/pricingRulesRoute');
const notificationsRoutes = require('./routes/notificationsRoutes');
const discountRoutes = require('./routes/discountRoutes');
const seasonRoutes = require('./routes/seasonRoutes');
const insuranceRoutes = require('./routes/insuranceRoutes');
const RatingRoute= require('./routes/Rating');
const logisticsRoutes = require('./routes/logistics');
const cartRoutes = require('./routes/cartRoutes'); // استيراد مسارات السلة
const requestIp = require('request-ip');
const pickupRoutes = require('./routes/pickupRoutes'); // Import the route file


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
app.use('/api/statistics', statisticsRoutes);
console.log("statistics Routes Loaded"); 
app.use('/api/discount-levels', discountLevelRoutes);  // Integrate the discount levels routes
app.use('/api/user-points-history', userPointsHistoryRoutes);
// إعداد مسارات الرسائل
app.use('/api3', messageRoutes);


app.use('/api', insuranceRoutes);
app.use('/api/users', RatingRoute);



app.use('/api/logistics', logisticsRoutes);
console.log("logistics Routes Loaded");
app.use('/api', cartRoutes); // ربط مسارات السلة




app.use('/api/rentalPeriods', rentalPeriodRoutes);
console.log("Rental Period Routes Loaded");


app.use('/api/season', seasonRoutes);
console.log("season Routes Loaded"); 

app.use('/api', discountRoutes);

app.use('/api', pricingRulesRoute)
console.log("Pricing Rules Routes Loaded");

app.use('/api/notifications', notificationsRoutes);
app.use('/api', pickupRoutes);


// تحديد منفذ الاستماع للخادم
const port = process.env.PORT || 6005;

const server = app.listen(port, () => console.log(`App listening on port ${port}!`));

module.exports = app;