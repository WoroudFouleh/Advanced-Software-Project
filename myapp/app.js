const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connection = require('./db'); // الاتصال بقاعدة البيانات من ملف db.js
const authRoute = require('./routes/auth'); // مسار تسجيل الدخول
const userRoute = require('./routes/user'); // مسار المستخدمين
const itemRoutes = require('./routes/itemRoutes'); // This should be the correct relative path
const logisticsRoutes = require('./routes/logistics');

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
console.log("Item Routes Loaded");
app.use('/api/logistics', logisticsRoutes);
console.log("logistics Routes Loaded");

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
