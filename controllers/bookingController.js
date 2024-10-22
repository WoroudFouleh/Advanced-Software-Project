// bookingController.js

const db = require('../db');

// دالة لحساب السعر الإجمالي
function calculateTotalPrice(startDate, endDate, basePricePerHour, basePricePerDay) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationInHours = Math.ceil((end - start) / (1000 * 60 * 60)); // مدة الإيجار بالساعات
    const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // مدة الإيجار بالأيام

    // حساب السعر بناءً على الساعات أو الأيام
    let totalPrice = 0;
    if (durationInDays > 1) {
        totalPrice = durationInDays * basePricePerDay;
    } else {
        totalPrice = durationInHours * basePricePerHour;
    }
    return totalPrice;
}

// دالة لإنشاء حجز مع حساب السعر الإجمالي
const createBooking = (req, res) => {
    const { itemId, userId, startDate, endDate } = req.body;

    // الحصول على سعر العنصر من قاعدة البيانات
    const query = 'SELECT price_per_hour, price_per_day FROM items WHERE id = ?';
    db.execute(query, [itemId], (error, results) => {
        if (error) return res.status(500).send("Database error.");
        if (results.length === 0) return res.status(404).send("Item not found.");

        const { price_per_hour, price_per_day } = results[0];
        const totalPrice = calculateTotalPrice(startDate, endDate, price_per_hour, price_per_day);

        // الآن يمكنك استخدام totalPrice عند إنشاء الحجز
        const insertQuery = 'INSERT INTO bookings (item_id, user_id, start_date, end_date, total_price) VALUES (?, ?, ?, ?, ?)';
        db.execute(insertQuery, [itemId, userId, startDate, endDate, totalPrice], (error) => {
            if (error) return res.status(500).send("Error creating booking.");
            res.status(201).send("Booking created successfully.");
        });
    });
};

module.exports = {
    createBooking,
    calculateTotalPrice // إذا كنت بحاجة لاستخدامها في مكان آخر
};
