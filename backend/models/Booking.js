const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Room = require('./Room');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
  },
  room_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Room,
      key: 'id',
    },
  },
  check_in: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  check_out: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  booking_type: {
    type: DataTypes.STRING,
    allowNull: false, // 'hourly', 'daily'
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  payment_status: {
    type: DataTypes.STRING,
    defaultValue: 'unpaid',
  },
  access_code: {
    type: DataTypes.STRING(6),
    allowNull: true,
  },
  cancel_reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  user_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'bookings',
  timestamps: true,
  underscored: true,
});

// Associations
Booking.belongsTo(User, { foreignKey: 'user_id' });
Booking.belongsTo(Room, { foreignKey: 'room_id' });
User.hasMany(Booking, { foreignKey: 'user_id' });
Room.hasMany(Booking, { foreignKey: 'room_id' });

module.exports = Booking;
