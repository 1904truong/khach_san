const express = require('express');
const router = express.Router();
const { updateHousekeeping } = require('../controllers/housekeepingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/update', protect, authorize('admin', 'staff'), updateHousekeeping);

module.exports = router;
