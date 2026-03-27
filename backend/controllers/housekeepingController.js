const Room = require('../models/Room');

const updateHousekeeping = async (req, res) => {
  try {
    const { room_id, status } = req.body; // 'not_cleaned', 'cleaning', 'cleaned'
    const room = await Room.findByPk(room_id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    room.housekeeping_status = status;
    if (status === 'cleaned') {
      room.status = 'available';
    } else {
      room.status = 'maintenance';
    }
    
    await room.save();
    res.json({ message: 'Housekeeping status updated', room });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { updateHousekeeping };
