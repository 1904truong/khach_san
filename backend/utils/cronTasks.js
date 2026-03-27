const { Op } = require('sequelize');
const Booking = require('../models/Booking');

/**
 * Releases (deletes) cancelled bookings that have exceeded the 1-hour hold period.
 */
const cleanupExpiredBookings = async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    // Find cancelled bookings that were cancelled more than 1 hour ago
    const deletedCount = await Booking.destroy({
      where: {
        status: 'cancelled',
        cancelled_at: {
          [Op.lt]: oneHourAgo
        }
      }
    });

    if (deletedCount > 0) {
      console.log(`[Scheduled Task] Released ${deletedCount} expired cancelled bookings.`);
    }
  } catch (error) {
    console.error('[Scheduled Task Error]', error.message);
  }
};

/**
 * Starts the background cleanup task.
 * @param {number} intervalMs - Frequency in milliseconds (default: 5 minutes)
 */
const initScheduledTasks = (intervalMs = 5 * 60 * 1000) => {
  console.log(`[Scheduled Task] Initialized cleanup task every ${intervalMs / 1000 / 60} minutes.`);
  setInterval(cleanupExpiredBookings, intervalMs);
};

module.exports = { initScheduledTasks };
