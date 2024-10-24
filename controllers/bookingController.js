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
    const itemId = req.body.item_id || null;
    const userId = req.body.user_id || null;
    const startDate = req.body.start_date || null;
    const endDate = req.body.end_date || null;

    console.log("item_id:", itemId);
    console.log("user_id:", userId);
    console.log("start_date:", startDate);
    console.log("end_date:", endDate);

    // تحقق مما إذا كان هناك حجز متداخل
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

            const { basePricePerHour, basePricePerDay } = results[0]; // استخدم الأسماء الصحيحة هنا
            
            // طباعة الأسعار للتأكد
            console.log("Base Price Per Hour:", basePricePerHour);
            console.log("Base Price Per Day:", basePricePerDay);
            
            // تحقق من أن الأسعار ليست undefined
            if (basePricePerHour === undefined || basePricePerDay === undefined) {
                return res.status(500).send("Price information is missing for the item.");
            }

            const totalPrice = calculateTotalPrice(startDate, endDate, basePricePerHour, basePricePerDay);

            const insertQuery = 'INSERT INTO bookings (item_id, user_id, start_date, end_date, total_price) VALUES (?, ?, ?, ?, ?)';
            db.execute(insertQuery, [itemId, userId, startDate, endDate, totalPrice], (error) => {
                if (error) return res.status(500).send("Error creating booking.");
                res.status(201).send("Booking created successfully.");
            });
        });
    });
};

// دالة لاسترجاع جميع الحجوزات
const getAllBookings = (req, res) => {
    const query = 'SELECT * FROM bookings';
    db.execute(query, (error, results) => {
        if (error) return res.status(500).send("Database error.");
        res.status(200).json(results);
    });
};

// دالة لاسترجاع حجز معين حسب الـ ID
const getBookingById = (req, res) => {
    const bookingId = req.params.id;
    const query = 'SELECT * FROM bookings WHERE id = ?';
    db.execute(query, [bookingId], (error, results) => {
        if (error) return res.status(500).send("Database error.");
        if (results.length === 0) return res.status(404).send("Booking not found.");
        res.status(200).json(results[0]);
    });
};

const updateBooking = (req, res) => {
    const bookingId = req.params.id;
    const { startDate, endDate } = req.body;

    // التحقق من وجود القيم قبل المتابعة
    if (!startDate || !endDate) {
        return res.status(400).send("startDate and endDate are required.");
    }

    const query = 'SELECT basePricePerHour, basePricePerDay FROM items WHERE id = (SELECT item_id FROM bookings WHERE id = ?)';
    db.execute(query, [bookingId], (error, results) => {
        if (error) return res.status(500).send("Database error.");
        if (results.length === 0) return res.status(404).send("Item not found for the booking.");

        const { basePricePerHour, basePricePerDay } = results[0];

        // التأكد من أن الأسعار ليست غير معرفة
        if (!basePricePerHour || !basePricePerDay) {
            return res.status(500).send("Price information missing for the item.");
        }

        const totalPrice = calculateTotalPrice(startDate, endDate, basePricePerHour, basePricePerDay);

        const updateQuery = 'UPDATE bookings SET start_date = ?, end_date = ?, total_price = ? WHERE id = ?';
        db.execute(updateQuery, [startDate, endDate, totalPrice, bookingId], (error) => {
            if (error) return res.status(500).send("Error updating booking.");
            res.status(200).send("Booking updated successfully.");
        });
    });
};


// دالة لحذف حجز
const deleteBooking = (req, res) => {
    const bookingId = req.params.id;
    const query = 'DELETE FROM bookings WHERE id = ?';
    db.execute(query, [bookingId], (error) => {
        if (error) return res.status(500).send("Database error.");
        res.status(200).send("Booking deleted successfully.");
    });
};

module.exports = {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
    deleteBooking
};



/*const db = require('../db');

// دالة لحساب السعر الإجمالي
function calculateTotalPrice(startDate, endDate, basePricePerHour, basePricePerDay) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationInHours = Math.ceil((end - start) / (1000 * 60 * 60)); // مدة الإيجار بالساعات
    const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // مدة الإيجار بالأيام

    // طباعة القيم المدخلة
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
    console.log("Duration in Hours:", durationInHours);
    console.log("Duration in Days:", durationInDays);
    console.log("Base Price Per Hour:", basePricePerHour);
    console.log("Base Price Per Day:", basePricePerDay);

    // حساب السعر بناءً على الساعات أو الأيام
    let totalPrice = 0;
    if (durationInDays > 1) {
        totalPrice = durationInDays * basePricePerDay;
        console.log("Total Price (calculated by days):", totalPrice);
    } else {
        totalPrice = durationInHours * basePricePerHour;
        console.log("Total Price (calculated by hours):", totalPrice);
    }

    return totalPrice;
}


// دالة لإنشاء حجز مع حساب السعر الإجمالي
const createBooking = (req, res) => {
    const itemId = req.body.item_id || null;
    const userId = req.body.user_id || null;
    const startDate = req.body.start_date || null;
    const endDate = req.body.end_date || null;

    console.log("item_id:", itemId);
    console.log("user_id:", userId);
    console.log("start_date:", startDate);
    console.log("end_date:", endDate);

    // الحصول على سعر العنصر من قاعدة البيانات
    const query = 'SELECT basePricePerHour, basePricePerDay FROM items WHERE id = ?';
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

// دالة لاسترجاع جميع الحجوزات
const getAllBookings = (req, res) => {
    const query = 'SELECT * FROM bookings';
    db.execute(query, (error, results) => {
        if (error) return res.status(500).send("Database error.");
        res.status(200).json(results);
    });
};

// دالة لاسترجاع حجز معين حسب الـ ID
const getBookingById = (req, res) => {
    const bookingId = req.params.id;
    const query = 'SELECT * FROM bookings WHERE id = ?';
    db.execute(query, [bookingId], (error, results) => {
        if (error) return res.status(500).send("Database error.");
        if (results.length === 0) return res.status(404).send("Booking not found.");
        res.status(200).json(results[0]);
    });
};

// دالة لتحديث حجز
const updateBooking = (req, res) => {
    const bookingId = req.params.id;
    const { startDate, endDate } = req.body;

    const query = 'SELECT price_per_hour, price_per_day FROM items WHERE id = (SELECT item_id FROM bookings WHERE id = ?)';
    db.execute(query, [bookingId], (error, results) => {
        if (error) return res.status(500).send("Database error.");
        if (results.length === 0) return res.status(404).send("Item not found for the booking.");

        const { price_per_hour, price_per_day } = results[0];
        const totalPrice = calculateTotalPrice(startDate, endDate, price_per_hour, price_per_day);

        const updateQuery = 'UPDATE bookings SET start_date = ?, end_date = ?, total_price = ? WHERE id = ?';
        db.execute(updateQuery, [startDate, endDate, totalPrice, bookingId], (error) => {
            if (error) return res.status(500).send("Error updating booking.");
            res.status(200).send("Booking updated successfully.");
        });
    });
};

// دالة لحذف حجز
const deleteBooking = (req, res) => {
    const bookingId = req.params.id;
    const query = 'DELETE FROM bookings WHERE id = ?';
    db.execute(query, [bookingId], (error) => {
        if (error) return res.status(500).send("Database error.");
        res.status(200).send("Booking deleted successfully.");
    });
};

module.exports = {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
    deleteBooking
};
*/