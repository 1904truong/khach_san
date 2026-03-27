const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  room_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  room_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price_per_hour: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  price_per_day: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'available',
  },
  housekeeping_status: {
    type: DataTypes.STRING,
    defaultValue: 'cleaned',
  },
}, {
  tableName: 'rooms',
  timestamps: true,
  underscored: true,
});

module.exports = Room;
