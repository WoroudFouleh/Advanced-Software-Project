const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');
const checkPermissions = require('../middleware/checkPermissions');

// إنشاء حجز جديد
router.post('/addBooking', checkPermissions, BookingController.createBooking);

// استرجاع جميع الحجوزات
router.get('/getAllBookings', checkPermissions, BookingController.getAllBookings);

// استرجاع حجز معين
router.get('/getBookingById/:id', checkPermissions, BookingController.getBookingById);

// تحديث حجز
router.put('/updateBooking/:id', checkPermissions, BookingController.updateBooking);

// حذف حجز
router.delete('/deleteBooking/:id', checkPermissions, BookingController.deleteBooking);

module.exports = router;