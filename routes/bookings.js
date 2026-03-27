const express = require('express');
const { Op } = require('sequelize');
const { auth } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Room = require('../models/Room');

const router = express.Router();

// Helper: check availability & prevent double booking
async function isRoomAvailable(roomId, checkIn, checkOut) {
  const overlapping = await Booking.findOne({
    where: {
      roomId,
      status: { [Op.not]: 'cancelled' },
      [Op.or]: [
        {
          checkIn: { [Op.lt]: checkOut },
          checkOut: { [Op.gt]: checkIn },
        },
      ],
    },
  });
  return !overlapping;
}

// Create booking
router.post('/', auth, async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.body;

    const room = await Room.findByPk(roomId);
    if (!room || !room.isActive)
      return res.status(404).json({ message: 'Room not found' });

    const available = await isRoomAvailable(roomId, checkIn, checkOut);
    if (!available)
      return res.status(400).json({ message: 'Room not available' });

    const nights =
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
      (1000 * 60 * 60 * 24);
    if (nights <= 0)
      return res.status(400).json({ message: 'Invalid dates' });

    const totalPrice = (Number(room.pricePerNight) * nights).toFixed(2);

    const booking = await Booking.create({
      userId: req.user.id,
      roomId,
      checkIn,
      checkOut,
      totalPrice,
      status: 'confirmed',
    });

    return res.status(201).json(booking);
  } catch (err) {
    return res.status(500).json({ message: 'Create booking failed' });
  }
});

// Get my bookings
router.get('/me', auth, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [Room],
    });
    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load bookings' });
  }
});

// Simple check-in / check-out endpoints
router.post('/:id/check-in', auth, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking || booking.userId !== req.user.id)
      return res.status(404).json({ message: 'Booking not found' });
    booking.status = 'confirmed';
    await booking.save();
    return res.json(booking);
  } catch (err) {
    return res.status(500).json({ message: 'Check-in failed' });
  }
});

router.post('/:id/check-out', auth, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking || booking.userId !== req.user.id)
      return res.status(404).json({ message: 'Booking not found' });
    booking.status = 'completed';
    await booking.save();
    return res.json(booking);
  } catch (err) {
    return res.status(500).json({ message: 'Check-out failed' });
  }
});

module.exports = router;