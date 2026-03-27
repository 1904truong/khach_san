const express = require('express');
const router = express.Router();
const { getRevenueStats, getOccupancyStats, getAdvancedStats, getDetailedReports } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/revenue', protect, authorize('admin'), getRevenueStats);
router.get('/occupancy', protect, authorize('admin'), getOccupancyStats);
router.get('/stats/advanced', protect, authorize('admin'), getAdvancedStats);
router.get('/stats/reports', protect, authorize('admin'), getDetailedReports);

module.exports = router;
