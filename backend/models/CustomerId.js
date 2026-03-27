const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const CustomerId = sequelize.define('CustomerId', {
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
    allowNull: false,
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  id_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  id_image_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'customer_ids',
  timestamps: true,
  underscored: true,
});

// Associations
CustomerId.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(CustomerId, { foreignKey: 'user_id' });

module.exports = CustomerId;
