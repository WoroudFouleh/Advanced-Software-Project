const db = require('../db');

// دالة لحساب السعر الإجمالي
function calculateTotalPrice(startDate, endDate, basePricePerHour, basePricePerDay) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationInHours = Math.ceil((end - start) / (1000 * 60 * 60)); // مدة الإيجار بالساعات
    const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // مدة الإيجار بالأيام

    let totalPrice = 0;
    if (durationInDays > 1) {
        totalPrice = durationInDays * basePricePerDay;
    } else {
        totalPrice = durationInHours * basePricePerHour;
    }
    return totalPrice;
}

// دالة إنشاء حجز مع حساب السعر الإجمالي والتحقق من التداخل
const createBooking = (req, res) => {
    const itemId = req.body.item_id || null;
    const userId = req.body.user_id || null;
    const startDate = req.body.start_date || null;
    const endDate = req.body.end_date || null;

    console.log("item_id:", itemId);
    console.log("user_id:", userId);
    console.log("start_date:", startDate);
    console.log("end_date:", endDate);

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

        const query = 'SELECT basePricePerHour, basePricePerDay FROM items WHERE id = ?';
        db.execute(query, [itemId], (error, results) => {
            if (error) return res.status(500).send("Database error.");
            if (results.length === 0) return res.status(404).send("Item not found.");

            const { basePricePerHour, basePricePerDay } = results[0];
            console.log("Base Price Per Hour:", basePricePerHour);
            console.log("Base Price Per Day:", basePricePerDay);

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

// دالة استرجاع جميع الحجوزات
const getAllBookings = (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send("Access denied.");

    const query = 'SELECT * FROM bookings';
    db.execute(query, (error, results) => {
        if (error) return res.status(500).send("Database error.");
        res.status(200).json(results);
    });
};

// دالة استرجاع حجز معين حسب معرفه
const getBookingById = (req, res) => {
    const bookingId = req.params.id;

    const query = 'SELECT * FROM bookings WHERE id = ?';
    db.execute(query, [bookingId], (error, results) => {
        if (error) return res.status(500).send("Database error.");
        if (results.length === 0) return res.status(404).send("Booking not found.");
        res.status(200).json(results[0]);
    });
};

// دالة تحديث حجز معين
const updateBooking = (req, res) => {
    const bookingId = req.params.id;
    const { start_date, end_date } = req.body;

    const query = 'UPDATE bookings SET start_date = ?, end_date = ? WHERE id = ?';
    db.execute(query, [start_date, end_date, bookingId], (error, results) => {
        if (error) return res.status(500).send("Database error.");
        res.status(200).send("Booking updated successfully.");
    });
};

// دالة حذف حجز معين
const deleteBooking = (req, res) => {
    const bookingId = req.params.id;

    const query = 'DELETE FROM bookings WHERE id = ?';
    db.execute(query, [bookingId], (error, results) => {
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

/*
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


*/