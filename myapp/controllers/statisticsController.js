// statisticsController.js
const db = require('../db');  // استيراد قاعدة البيانات

// جلب إجمالي الإيرادات وعدد الحجوزات ورسوم المنصة
const getRevenueStatistics = (req, res) => {
    const query = `
        SELECT 
            COUNT(*) AS total_bookings,
            SUM(total_revenue) AS total_revenue,
            SUM(platform_fee) AS total_platform_fee
        FROM bookings
    `;

    db.execute(query, (error, results) => {
        if (error) return res.status(500).json({ error: "Database error" });

        res.status(200).json(results[0]);  // إرسال البيانات كـ JSON للواجهة
    });
};


// إيرادات يومية مع الحجز ورسوم المنصة
const getDailyRevenue = (req, res) => {
    const query = `
        SELECT 
            DATE(start_date) AS booking_date,
            COUNT(*) AS daily_bookings,
            SUM(total_revenue) AS daily_revenue,
            SUM(platform_fee) AS daily_platform_fee
        FROM bookings
        GROUP BY DATE(start_date)
    `;

    db.execute(query, (error, results) => {
        if (error) return res.status(500).json({ error: "Database error" });

        res.status(200).json(results);
    });
};

module.exports = {
    getRevenueStatistics,
    getDailyRevenue
};