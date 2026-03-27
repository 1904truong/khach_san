const User = require('../models/User');
const Booking = require('../models/Booking');
const CustomerId = require('../models/CustomerId');
const bcrypt = require('bcryptjs');

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: CustomerId, attributes: ['full_name', 'id_number', 'dob', 'id_image_url'] }]
    });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Lấy thống kê đặt phòng
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id }
    });

    const totalBookings = bookings.length;
    const totalSpent = bookings.reduce((sum, b) => sum + (b.status !== 'cancelled' ? parseFloat(b.total_price) : 0), 0);
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;

    res.json({
      user,
      stats: {
        totalBookings,
        confirmedBookings,
        totalSpent
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Kiểm tra email trùng (nếu đổi email)
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email đã được sử dụng bởi người dùng khác' });
      }
    }

    await user.update({ username, email });

    res.json({
      message: 'Cập nhật hồ sơ thành công',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mật khẩu cũ không chính xác' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile, changePassword };
