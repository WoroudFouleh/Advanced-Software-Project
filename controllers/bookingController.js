// controllers/bookingController.js
const Booking = require('../models/bookingModel');

// إنشاء حجز جديد
exports.createBooking = (req, res) => {
    const bookingData = req.body;

    Booking.create(bookingData, (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json({ message: "Booking created successfully.", result });
    });
};

// استرجاع جميع الحجوزات
exports.getAllBookings = (req, res) => {
    Booking.getAll((error, results) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json(results);
    });
};

// استرجاع حجز بواسطة ID
exports.getBookingById = (req, res) => {
    const bookingId = req.params.id;

    Booking.getById(bookingId, (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        if (!result) return res.status(404).json({ message: "Booking not found." });
        res.status(200).json(result);
    });
};

// تحديث حجز
exports.updateBooking = (req, res) => {
    const bookingId = req.params.id;
    const bookingData = req.body;

    Booking.update(bookingId, bookingData, (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json({ message: "Booking updated successfully." });
    });
};

// حذف حجز
exports.deleteBooking = (req, res) => {
    const bookingId = req.params.id;

    Booking.delete(bookingId, (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json({ message: "Booking deleted successfully." });
    });
};
