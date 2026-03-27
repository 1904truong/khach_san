const Booking = require('../models/Booking');
const Room = require('../models/Room');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

const getRevenueStats = async (req, res) => {
  try {
    // For development/test visibility, we count all 'confirmed' bookings as revenue
    // even if payment_status is not 'paid' yet (since user uses bypass_payment)
    const totalRevenue = await Booking.sum('total_price', {
      where: { 
        status: 'confirmed'
      }
    });
    
    const totalBookings = await Booking.count({
      where: { status: { [Op.ne]: 'cancelled' } }
    });

    res.json({
      totalRevenue: parseFloat(totalRevenue) || 0,
      totalBookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOccupancyStats = async (req, res) => {
  try {
    const totalRooms = await Room.count();
    const now = new Date();

    // DYNAMIC Occupancy: Count rooms that have a 'confirmed' booking right now
    const occupiedBookings = await Booking.findAll({
      where: {
        status: 'confirmed',
        check_in: { [Op.lte]: now },
        check_out: { [Op.gte]: now }
      },
      attributes: ['room_id'],
      group: ['room_id']
    });

    const occupiedCount = occupiedBookings.length;
    const occupancyRate = totalRooms > 0 ? (occupiedCount / totalRooms) * 100 : 0;

    res.json({
      totalRooms,
      occupiedRooms: occupiedCount,
      occupancyRate: Math.round(occupancyRate)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdvancedStats = async (req, res) => {
  try {
    const now = new Date();

    // 1. Daily Revenue (Last 7 days) - Group by Date
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Using CAST for date to be more compatible
    const dailyRevenue = await Booking.findAll({
      attributes: [
        [sequelize.fn('date', sequelize.col('check_in')), 'date'],
        [sequelize.fn('SUM', sequelize.col('total_price')), 'revenue']
      ],
      where: {
        status: 'confirmed',
        check_in: { [Op.gte]: sevenDaysAgo }
      },
      group: [sequelize.fn('date', sequelize.col('check_in'))],
      order: [[sequelize.fn('date', sequelize.col('check_in')), 'ASC']]
    });

    // 2. Monthly Revenue (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRevenue = await Booking.findAll({
      attributes: [
        [sequelize.fn('date_trunc', 'month', sequelize.col('check_in')), 'month'],
        [sequelize.fn('SUM', sequelize.col('total_price')), 'revenue']
      ],
      where: {
        status: 'confirmed',
        check_in: { [Op.gte]: sixMonthsAgo }
      },
      group: [sequelize.fn('date_trunc', 'month', sequelize.col('check_in'))],
      order: [[sequelize.fn('date_trunc', 'month', sequelize.col('check_in')), 'ASC']]
    });

    // 3. Room Occupancy Rate by Type (Dynamic)
    const roomTypes = await Room.findAll({
      attributes: [
        'room_type',
        [sequelize.fn('COUNT', sequelize.col('Room.id')), 'total_count']
      ],
      group: ['room_type'],
      raw: true
    });

    const activeBookings = await Booking.findAll({
      where: {
        status: 'confirmed',
        check_in: { [Op.lte]: now },
        check_out: { [Op.gte]: now }
      },
      include: [{ model: Room, attributes: ['room_type'] }],
      raw: true,
      nest: true
    });

    const occupancyByType = roomTypes.map(rt => {
      const occupiedInType = activeBookings.filter(b => b.Room.room_type === rt.room_type).length;
      return {
        type: rt.room_type,
        occupancy: rt.total_count > 0 ? Math.round((occupiedInType / rt.total_count) * 100) : 0
      };
    });

    // 4. Top Booked Rooms (Based on count of bookings)
    const topRooms = await Booking.findAll({
      attributes: [
        'room_id',
        [sequelize.fn('COUNT', sequelize.col('Booking.id')), 'booking_count']
      ],
      include: [{ 
        model: Room, 
        attributes: ['room_number', 'room_type'] 
      }],
      group: ['room_id', 'Room.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('Booking.id')), 'DESC']],
      limit: 5,
      raw: true,
      nest: true
    });

    res.json({
      dailyRevenue: dailyRevenue.map(d => d.toJSON()),
      monthlyRevenue: monthlyRevenue.map(m => {
        const data = m.toJSON();
        return {
          month: new Date(data.month).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }),
          revenue: data.revenue
        };
      }),
      roomOccupancy: occupancyByType,
      topRooms: topRooms.map(tr => ({
        ...tr,
        booking_count: parseInt(tr.booking_count)
      }))
    });
  } catch (error) {
    console.error('Advanced Stats Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getDetailedReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause = {
      status: 'confirmed'
    };

    if (startDate && endDate) {
      whereClause.check_in = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const reports = await Booking.findAll({
      where: whereClause,
      include: [{ model: Room, attributes: ['room_number', 'room_type'] }],
      order: [['check_in', 'DESC']]
    });

    // Summary stats for the period
    const totalRevenue = reports.reduce((sum, b) => sum + parseFloat(b.total_price), 0);
    const totalBookings = reports.length;
    
    // Revenue by room type
    const revenueByType = {};
    reports.forEach(b => {
      const type = b.Room.room_type;
      revenueByType[type] = (revenueByType[type] || 0) + parseFloat(b.total_price);
    });

    res.json({
      summary: {
        totalRevenue,
        totalBookings,
        period: { startDate, endDate }
      },
      revenueByType: Object.keys(revenueByType).map(type => ({ type, revenue: revenueByType[type] })),
      details: reports
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRevenueStats, getOccupancyStats, getAdvancedStats, getDetailedReports };
