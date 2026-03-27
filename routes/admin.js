
const express = require('express');
const { auth, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

const router = express.Router();

// All routes here are admin-protected
router.use(auth, adminOnly);

// Manage rooms
router.get('/rooms', async (req, res) => {
  const rooms = await Room.findAll();
  return res.json(rooms);
});

router.post('/rooms', async (req, res) => {
  try {
    const room = await Room.create(req.body);
    return res.status(201).json(room);
  } catch (err) {
    return res.status(400).json({ message: 'Create room failed' });
  }
});

router.put('/rooms/:id', async (req, res) => {
  const room = await Room.findByPk(req.params.id);
  if (!room) return res.status(404).json({ message: 'Room not found' });
  await room.update(req.body);
  return res.json(room);
});

router.delete('/rooms/:id', async (req, res) => {
  const room = await Room.findByPk(req.params.id);
  if (!room) return res.status(404).json({ message: 'Room not found' });
  await room.destroy();
  return res.status(204).end();
});

// Manage bookings
router.get('/bookings', async (req, res) => {
  const bookings = await Booking.findAll({ include: [User, Room] });
  return res.json(bookings);
});

router.put('/bookings/:id', async (req, res) => {
  const booking = await Booking.findByPk(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  await booking.update(req.body);
  return res.json(booking);
});

// Manage users
router.get('/users', async (req, res) => {
  const users = await User.findAll();
  return res.json(users);
});

router.put('/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  await user.update(req.body);
  return res.json(user);
});

router.delete('/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  await user.destroy();
  return res.status(204).end();
});

module.exports = router;