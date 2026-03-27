const Booking = require('../models/Booking');

const generateAccessCode = async (req, res) => {
  try {
    const { booking_id } = req.body;
    const booking = await Booking.findByPk(booking_id);
    
    if (!booking || booking.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Valid paid booking required for smart lock code' });
    }

    // Simulate code generation
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    res.json({ 
      message: 'Access code generated', 
      accessCode,
      room_id: booking.room_id 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const openLock = async (req, res) => {
  const { accessCode, room_id } = req.body;
  // Simulate opening lock
  res.json({ message: `Lock for room ${room_id} opened successfully with code ${accessCode}` });
};

module.exports = { generateAccessCode, openLock };
