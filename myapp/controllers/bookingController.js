const db = require('../db');

// دالة للحصول على نسبة الخصم بناءً على نقاط المستخدم
async function getDiscountPercentage(userPoints) {
    try {
        console.log("User points:", userPoints);  // عرض النقاط

        const query = `
            SELECT discount_percentage 
            FROM discount_levels 
            WHERE min_points <= ? 
            ORDER BY min_points DESC 
            LIMIT 1
        `;

        const [results] = await db.execute(query, [userPoints]);

        console.log("Discount query results:", results);  // عرض نتائج الاستعلام

        const discount = results.length > 0 ? results[0].discount_percentage : 0;
        console.log("Applicable discount:", discount);  // عرض النسبة النهائية
        return discount;
    } catch (error) {
        console.error("Error fetching discount percentage:", error);
        return 0;  // في حال وجود خطأ، لا يتم تطبيق خصم
    }
}

// دالة لحساب السعر الكلي ورسوم المنصة
function calculateTotalAndPlatformFee(startDate, endDate, basePricePerHour, basePricePerDay) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationInHours = Math.ceil((end - start) / (1000 * 60 * 60)); // مدة الإيجار بالساعات
    const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // مدة الإيجار بالأيام

    let totalPrice = durationInDays > 1 ? durationInDays * basePricePerDay : durationInHours * basePricePerHour;

    // حساب رسوم المنصة (10%)
    const platformFeePercentage = 0.10; // 10% رسوم
    const platformFee = totalPrice * platformFeePercentage;

    // حساب الإيرادات الكلية
    const totalRevenue = totalPrice + platformFee;

    return { totalPrice, platformFee, totalRevenue, durationInHours };
}

// دالة لتحديث نقاط المستخدم
async function updateUserPoints(userId, bookingId, durationInHours) {
    const pointsPerHour = 5;
    const earnedPoints = durationInHours * pointsPerHour;

    console.log("Updating user points:", { userId, bookingId, earnedPoints });

    try {
        const updateUserQuery = `
            UPDATE users 
            SET reward_points = reward_points + ?
            WHERE id = ?
        `;

        await db.execute(updateUserQuery, [earnedPoints, userId]);
        console.log("User points updated successfully.");

        // إضافة سجل في user_points_history
        const insertHistoryQuery = `
            INSERT INTO user_points_history (user_id, booking_id, points_earned)
            VALUES (?, ?, ?)
        `;
        await db.execute(insertHistoryQuery, [userId, bookingId, earnedPoints]);
        console.log("Points history inserted successfully.");
    } catch (error) {
        console.error("Error updating user points or inserting points history:", error);
    }
}

// دالة لإنشاء حجز مع حساب السعر الكلي ورسوم المنصة وتحديث نقاط المستخدم
const createBooking = async (req, res) => {
    try {
        const itemId = req.body.item_id || null;
        const userId = req.body.user_id || null;
        const startDate = req.body.start_date || null;
        const endDate = req.body.end_date || null;

        // التحقق مما إذا كان هناك حجز متداخل
        const checkQuery = `
            SELECT * FROM bookings 
            WHERE item_id = ? 
            AND (
                (start_date < ? AND end_date > ?) OR 
                (start_date < ? AND end_date > ?)
            )
        `;

        const [results] = await db.execute(checkQuery, [itemId, endDate, startDate, startDate, endDate]);

        if (results.length > 0) {
            return res.status(400).send("Booking already exists for this item in the selected time period.");
        }

        // الحصول على سعر العنصر من قاعدة البيانات
        const query = 'SELECT basePricePerHour, basePricePerDay FROM items WHERE id = ?';
        const [itemResults] = await db.execute(query, [itemId]);

        if (itemResults.length === 0) {
            return res.status(404).send("Item not found.");
        }

        const { basePricePerHour, basePricePerDay } = itemResults[0];

        // حساب السعر الكلي، رسوم المنصة، والإيرادات الكلية ومدة الحجز بالساعات
        const { totalPrice, platformFee, totalRevenue, durationInHours } = calculateTotalAndPlatformFee(startDate, endDate, basePricePerHour, basePricePerDay);

        // الحصول على نقاط المستخدم
        const userPointsQuery = 'SELECT reward_points FROM users WHERE id = ?';
        const [userResults] = await db.execute(userPointsQuery, [userId]);

        if (userResults.length === 0) {
            return res.status(404).send("User not found.");
        }

        const userPoints = userResults[0].reward_points;
        console.log(userPoints);

        // الحصول على نسبة الخصم بناءً على النقاط
        const discountPercentage = await getDiscountPercentage(userPoints);

        // تطبيق الخصم على السعر الكلي
        const discountAmount = totalPrice * (discountPercentage / 100);
        const discountedTotalPrice = totalPrice - discountAmount;

        // إدخال الحجز مع الخصم ورسوم المنصة والإيرادات في قاعدة البيانات
        const insertQuery = `
            INSERT INTO bookings (item_id, user_id, start_date, end_date, total_price, platform_fee, total_revenue, discount_percentage, discount_amount) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(insertQuery, [itemId, userId, startDate, endDate, discountedTotalPrice, platformFee, totalRevenue, discountPercentage, discountAmount]);

        const bookingId = result.insertId;

        // تحديث نقاط المستخدم بعد إنشاء الحجز
        await updateUserPoints(userId, bookingId, durationInHours);

        res.status(201).json({
            message: "Booking created successfully.",
            originalTotalPrice: totalPrice,
            discountPercentage,
            discountAmount,
            finalTotalPrice: discountedTotalPrice,
            platformFee,
            totalRevenue
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).send("Server error.");
    }
};

// دالة لاسترجاع جميع حجوزات اليوزر أو المالك
const getAllBookings = async (req, res) => {
    try {
        const username = req.user.username;  // اسم المستخدم
        const role = req.user.role;  // دور المستخدم (User أو Owner)

        let query;
        let params;

        if (role === 'user') {
            // جلب الحجوزات التي قام بها المستخدم
            query = 'SELECT * FROM bookings WHERE user_id = ?';
            params = [username];
        } else if (role === 'owner') {
            // جلب الحجوزات المرتبطة بممتلكات المالك باستخدام username
            query = `
                SELECT b.* FROM bookings b
                JOIN items i ON b.item_id = i.id
                WHERE i.username = ?
            `;
            params = [username];
        } else if (role === 'admin') {
            // جلب جميع الحجوزات
            query = 'SELECT * FROM bookings';
            params = [];
        } else {
            return res.status(403).send("Access denied.");
        }

        const [results] = await db.execute(query, params);
        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).send("Server error.");
    }
};

// دالة لاسترجاع حجز معين (اليوزر أو المالك)
const getBookingById = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const username = req.user.username;  // اسم المستخدم
        const role = req.user.role;  // دور المستخدم

        let query;
        let params;

        if (role === 'user') {
            // اليوزر يسترجع حجز يخصه فقط
            query = `
                SELECT id, item_id, user_id, start_date, end_date, total_price, platform_fee, total_revenue 
                FROM bookings 
                WHERE id = ? AND user_id = ?
            `;
            params = [bookingId, username];
        } else if (role === 'owner') {
            // المالك يسترجع حجز مرتبط بممتلكاته باستخدام username
            query = `
                SELECT b.id, b.item_id, b.user_id, b.start_date, b.end_date, b.total_price, b.platform_fee, b.total_revenue 
                FROM bookings b
                JOIN items i ON b.item_id = i.id
                WHERE b.id = ? AND i.username = ?
            `;
            params = [bookingId, username];
        } else if (role === 'admin') {
            // جلب الحجز المحدد
            query = 'SELECT * FROM bookings WHERE id = ?';
            params = [bookingId];
        } else {
            return res.status(403).send("Access denied.");
        }

        const [results] = await db.execute(query, params);
        if (results.length === 0) return res.status(404).send("Booking not found.");

        res.status(200).json({
            booking: results[0],
            message: "Booking retrieved successfully."
        });
    } catch (error) {
        console.error("Error fetching booking:", error);
        res.status(500).send("Server error.");
    }
};

// دالة لتحديث حجز (اليوزر أو المالك)
const updateBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const username = req.user.username;
        const role = req.user.role;
        const startDate = req.body.start_date;
        const endDate = req.body.end_date;

        // التحقق من الحقول المطلوبة
        if (!startDate || !endDate) {
            return res.status(400).send("Start date and end date are required.");
        }

        let query;
        let params;

        if (role === 'user') {
            query = 'SELECT * FROM bookings WHERE id = ? AND user_id = ?';
            params = [bookingId, username];
        } else if (role === 'owner') {
            query = `
                SELECT b.* FROM bookings b
                JOIN items i ON b.item_id = i.id
                WHERE b.id = ? AND i.username = ?
            `;
            params = [bookingId, username];
        } else if (role === 'admin') {
            query = 'SELECT * FROM bookings WHERE id = ?';
            params = [bookingId];
        } else {
            return res.status(403).send("Access denied.");
        }

        const [results] = await db.execute(query, params);
        if (results.length === 0) return res.status(404).send("Booking not found or unauthorized.");

        // التحقق من الحجوزات المتداخلة
        const checkQuery = `
            SELECT * FROM bookings 
            WHERE item_id = ? 
            AND id != ?  -- استبعاد الحجز الحالي
            AND (
                (start_date < ? AND end_date > ?) OR 
                (start_date < ? AND end_date > ?)
            )
        `;

        const itemId = results[0].item_id; // الحصول على item_id للتحقق من التداخل
        const [checkResults] = await db.execute(checkQuery, [itemId, bookingId, endDate, startDate, startDate, endDate]);
        if (checkResults.length > 0) return res.status(400).send("Booking already exists for this item in the selected time period.");

        // تحديث الحجز
        const updateQuery = 'UPDATE bookings SET start_date = ?, end_date = ? WHERE id = ?';
        await db.execute(updateQuery, [startDate, endDate, bookingId]);

        res.status(200).send("Booking updated successfully.");
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).send("Server error.");
    }
};

// دالة لحذف حجز (اليوزر أو المالك)
const deleteBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const username = req.user.username;
        const role = req.user.role;

        let query;
        let params;

        if (role === 'user') {
            // اليوزر يحذف حجوزاته فقط
            query = 'DELETE FROM bookings WHERE id = ? AND user_id = ?';
            params = [bookingId, username];
        } else if (role === 'owner') {
            // المالك يحذف الحجوزات المرتبطة بممتلكاته باستخدام username
            query = `
                DELETE b FROM bookings b
                JOIN items i ON b.item_id = i.id
                WHERE b.id = ? AND i.username = ?
            `;
            params = [bookingId, username];
        } else if (role === 'admin') {
            // المدير يحذف أي حجز
            query = 'DELETE FROM bookings WHERE id = ?';
            params = [bookingId];
        } else {
            return res.status(403).send("Access denied.");
        }

        const [results] = await db.execute(query, params);
        if (results.affectedRows === 0) return res.status(404).send("Booking not found or unauthorized.");

        res.status(200).send("Booking deleted successfully.");
    } catch (error) {
        console.error("Error deleting booking:", error);
        res.status(500).send("Server error.");
    }
};

// تصدير الدوال
module.exports = {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
    deleteBooking,
};
