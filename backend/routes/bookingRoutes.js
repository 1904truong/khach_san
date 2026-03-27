const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getAllBookings, cancelBooking, hideBookingHistory } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/all', protect, authorize('admin'), getAllBookings);
router.delete('/:id', protect, cancelBooking);
router.patch('/:id/hide', protect, hideBookingHistory);

module.exports = router;
