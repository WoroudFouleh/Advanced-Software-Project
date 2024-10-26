const db = require('../db');  // استيراد قاعدة البيانات

// جلب إجمالي الإيرادات وعدد الحجوزات ورسوم المنصة
const getRevenueStatistics = async (req, res) => {
    const query = `
        SELECT 
            COUNT(*) AS total_bookings,
            SUM(total_revenue) AS total_revenue,
            SUM(platform_fee) AS total_platform_fee
        FROM bookings
    `;

    try {
        const [results] = await db.execute(query);
        res.status(200).json(results[0]);  // إرسال البيانات كـ JSON للواجهة
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
};

// إيرادات يومية مع الحجز ورسوم المنصة
const getDailyRevenue = async (req, res) => {
    const query = `
        SELECT 
            DATE(start_date) AS booking_date,
            COUNT(*) AS daily_bookings,
            SUM(total_revenue) AS daily_revenue,
            SUM(platform_fee) AS daily_platform_fee
        FROM bookings
        GROUP BY DATE(start_date)
    `;

    try {
        const [results] = await db.execute(query);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
};

module.exports = {
    getRevenueStatistics,
    getDailyRevenue
};