const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');
const checkPermissions = require('../middleware/checkPermissions');

// إنشاء حجز جديد
router.post('/addBooking', checkPermissions, BookingController.createBooking);

// استرجاع جميع الحجوزات
router.get('/getAllBookings', checkPermissions, BookingController.getAllBookings);

// استرجاع حجز معين
router.get('/:id', checkPermissions, BookingController.getBookingById);

// تحديث حجز
router.put('/:id', checkPermissions, BookingController.updateBooking);

// حذف حجز
router.delete('/:id', checkPermissions, BookingController.deleteBooking);

module.exports = router;
