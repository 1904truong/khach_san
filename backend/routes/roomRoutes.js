const express = require('express');
const router = express.Router();
const { getRooms, createRoom } = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getRooms);
router.post('/', protect, authorize('admin'), createRoom);

module.exports = router;
