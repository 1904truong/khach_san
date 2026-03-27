const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const { Op } = require('sequelize');

const createBooking = async (req, res) => {
  try {
    const { room_id, check_in, check_out, booking_type, total_price } = req.body;
    const user_id = req.user.id;

    // Check for overlapping bookings
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const overlap = await Booking.findOne({
      where: {
        room_id,
        [Op.or]: [
          // Active bookings
          { status: { [Op.ne]: 'cancelled' } },
          // Recently cancelled bookings by other users (hold period)
          {
            [Op.and]: [
              { status: 'cancelled' },
              { cancelled_at: { [Op.gt]: oneHourAgo } },
              { user_id: { [Op.ne]: user_id } }
            ]
          }
        ],
        [Op.and]: [
          { check_in: { [Op.lt]: check_out } },
          { check_out: { [Op.gt]: check_in } }
        ],
      },
    });

    if (overlap) {
      if (overlap.status === 'cancelled' && overlap.user_id !== user_id) {
        return res.status(400).json({ message: 'Phòng đang được giữ cho người dùng khác trong thời gian chờ (1 giờ)' });
      }
      return res.status(400).json({ message: 'Room is already booked for this period' });
    }

    const booking = await Booking.create({
      user_id,
      room_id,
      check_in,
      check_out,
      booking_type,
      total_price,
      status: req.body.bypass_payment ? 'confirmed' : 'pending',
      payment_status: req.body.bypass_payment ? 'paid' : 'unpaid',
      access_code: req.body.bypass_payment ? Math.floor(100000 + Math.random() * 900000).toString() : null
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { 
        user_id: req.user.id,
        user_deleted: false
      },
      include: [Room],
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: Room }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: 'Vui lòng cung cấp lý do hủy' });
    }

    const booking = await Booking.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt phòng' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Đơn đặt phòng đã được hủy trước đó' });
    }

    await booking.update({ 
      status: 'cancelled',
      cancel_reason: reason,
      cancelled_at: new Date()
    });
    res.json({ message: 'Hủy đặt phòng thành công. Slot của bạn sẽ được giữ trong 1 giờ.', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const hideBookingHistory = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt phòng' });
    }

    await booking.update({ user_deleted: true });
    res.json({ message: 'Đã ẩn đơn đặt phòng khỏi lịch sử' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBooking, getMyBookings, getAllBookings, cancelBooking, hideBookingHistory };
