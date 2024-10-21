const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');

router.post('/create', BookingController.createBooking);
router.get('/', BookingController.getAllBookings);
router.get('/:id', BookingController.getBookingById);
router.put('/update/:id', BookingController.updateBooking);
router.delete('/delete/:id', BookingController.deleteBooking);

module.exports = router;

