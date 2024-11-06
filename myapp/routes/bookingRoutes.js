const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');
const checkPermissions = require('../middleware/checkPermissions');

router.post('/addBooking', checkPermissions, BookingController.createBooking);

router.get('/getAllBookings', checkPermissions, BookingController.getAllBookings);

router.get('/getBookingById/:id', checkPermissions, BookingController.getBookingById);

router.put('/updateBooking/:id', checkPermissions, BookingController.updateBooking);

router.delete('/deleteBooking/:id', checkPermissions, BookingController.deleteBooking);

router.get('/users/booking/statistics',checkPermissions, BookingController.getBookingStatistics);


module.exports = router;