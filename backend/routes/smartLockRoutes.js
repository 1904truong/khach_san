const express = require('express');
const router = express.Router();
const { generateAccessCode, openLock } = require('../controllers/smartLockController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, generateAccessCode);
router.post('/open', protect, openLock);

module.exports = router;
