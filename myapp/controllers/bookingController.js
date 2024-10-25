const db = require('../db');


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

    return { totalPrice, platformFee, totalRevenue };
}

// دالة لإنشاء حجز مع حساب السعر الكلي ورسوم المنصة
const createBooking = (req, res) => {
    const itemId = req.body.item_id || null;
    const userId = req.body.user_id || null;
    const startDate = req.body.start_date || null;
    const endDate = req.body.end_date || null;

    console.log("item_id:", itemId);
    console.log("user_id:", userId);
    console.log("start_date:", startDate);
    console.log("end_date:", endDate);

    // التحقق مما إذا كان هناك حجز متداخل
    const checkQuery = `
        SELECT * FROM bookings 
        WHERE item_id = ? 
        AND (
            (start_date < ? AND end_date > ?) OR 
            (start_date < ? AND end_date > ?)
        )
    `;

    db.execute(checkQuery, [itemId, endDate, startDate, startDate, endDate], (error, results) => {
        if (error) return res.status(500).send("Database error.");
        if (results.length > 0) return res.status(400).send("Booking already exists for this item in the selected time period.");

        // الحصول على سعر العنصر من قاعدة البيانات
        const query = 'SELECT basePricePerHour, basePricePerDay FROM items WHERE id = ?';
        db.execute(query, [itemId], (error, results) => {
            if (error) return res.status(500).send("Database error.");
            if (results.length === 0) return res.status(404).send("Item not found.");

            const { basePricePerHour, basePricePerDay } = results[0];

            // طباعة الأسعار للتأكد
            console.log("Base Price Per Hour:", basePricePerHour);
            console.log("Base Price Per Day:", basePricePerDay);

            // التحقق من أن الأسعار ليست undefined
            if (basePricePerHour === undefined || basePricePerDay === undefined) {
                return res.status(500).send("Price information is missing for the item.");
            }

            // حساب السعر الكلي، رسوم المنصة، والإيرادات الكلية
            const { totalPrice, platformFee, totalRevenue } = calculateTotalAndPlatformFee(startDate, endDate, basePricePerHour, basePricePerDay);

            // إدخال الحجز مع رسوم المنصة والإيرادات في قاعدة البيانات
            const insertQuery = `
                INSERT INTO bookings (item_id, user_id, start_date, end_date, total_price, platform_fee, total_revenue) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            db.execute(insertQuery, [itemId, userId, startDate, endDate, totalPrice, platformFee, totalRevenue], (error) => {
                if (error) return res.status(500).send("Error creating booking.");
                res.status(201).json({
                    message: "Booking created successfully.",
                    totalPrice,
                    platformFee,
                    totalRevenue
                });
            });
        });
    });
};

// دالة لاسترجاع جميع حجوزات اليوزر أو المالك
const getAllBookings = (req, res) => {
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
    }  else if (role === 'admin') {
        // جلب الحجوزات المرتبطة بممتلكات المالك باستخدام username
        query = `
            SELECT * FROM bookings
        `;
        params = [username];
    } 
    else {
        return res.status(403).send("Access denied.");
    }

    db.execute(query, params, (error, results) => {
        if (error) return res.status(500).send("Database error.");
        res.status(200).json(results);
    });
};

// دالة لاسترجاع حجز معين (اليوزر أو المالك)
const getBookingById = (req, res) => {
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
        // جلب الحجوزات المرتبطة بممتلكات المالك باستخدام username
        query = `
            SELECT * FROM bookings WHERE id=?
        `;
        params = [bookingId];
    } 
    else {
        return res.status(403).send("Access denied.");
    }

    db.execute(query, params, (error, results) => {
        if (error) return res.status(500).send("Database error.");
        if (results.length === 0) return res.status(404).send("Booking not found.");
        
        // إرسال بيانات الحجز مع رسوم المنصة والإيرادات
        res.status(200).json({
            booking: results[0],
            message: "Booking retrieved successfully."
        });
    });
};

// دالة لتحديث حجز (اليوزر أو المالك)
const updateBooking = (req, res) => {
    const bookingId = req.params.id;
    const username = req.user.username;
    const role = req.user.role;
    const startDate = req.body.start_date; 
    const endDate = req.body.end_date; 

    // Check for required fields
    if (!startDate || !endDate) {
        return res.status(400).send("Start date and end date are required.");
    }

    let query;
    let params;

    if (role === 'user') {
        query = 'SELECT * FROM bookings WHERE id = ? AND user_id = ?';
        params = [bookingId, username];
    } else if (role === 'owner') {
        query = `SELECT b.* FROM bookings b
                  JOIN items i ON b.item_id = i.id
                  WHERE b.id = ? AND i.username = ?`;
        params = [bookingId, username];
    } else if (role === 'admin') {
        query = 'SELECT * FROM bookings WHERE id = ?';
        params = [bookingId];
    } else {
        return res.status(403).send("Access denied.");
    }

    db.execute(query, params, (error, results) => {
        if (error) return res.status(500).send("Database error.");
        if (results.length === 0) return res.status(404).send("Booking not found or unauthorized.");

        // Check for overlapping bookings
        const checkQuery = `
            SELECT * FROM bookings 
            WHERE item_id = ? 
            AND id != ?  -- Exclude the current booking
            AND (
                (start_date < ? AND end_date > ?) OR 
                (start_date < ? AND end_date > ?)
            )
        `;

        const itemId = results[0].item_id; // Get the item_id of the booking to check for overlaps
        db.execute(checkQuery, [itemId, bookingId, endDate, startDate, startDate, endDate], (error, checkResults) => {
            if (error) return res.status(500).send("Database error.");
            if (checkResults.length > 0) return res.status(400).send("Booking already exists for this item in the selected time period.");

            // Now we can safely update the booking
            const updateQuery = 'UPDATE bookings SET start_date = ?, end_date = ? WHERE id = ?';
            db.execute(updateQuery, [startDate, endDate, bookingId], (error) => {
                if (error) return res.status(500).send("Error updating booking.");
                res.status(200).send("Booking updated successfully.");
            });
        });
    });
};


// دالة لحذف حجز (اليوزر أو المالك)
const deleteBooking = (req, res) => {
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
        // المالك يحذف الحجوزات المرتبطة بممتلكاته باستخدام username
        query = `
            DELETE FROM bookings WHERE id=?
        `;
        params = [bookingId];
    }
    else {
        return res.status(403).send("Access denied.");
    }
    db.execute(query, params, (error, results) => {
        if (error) {
            console.error("Error details:", error); // طباعة تفاصيل الخطأ
            return res.status(500).send("Database error.");
        }
        if (results.affectedRows === 0) return res.status(404).send("Booking not found or unauthorized.");
        
        res.status(200).send("Booking deleted successfully.");
    });
    
};

// تصدير الدوال
module.exports = {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
    deleteBooking,
};
