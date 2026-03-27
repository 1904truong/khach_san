const express = require('express');
const router = express.Router();
const { extractIdInfo, getStatus } = require('../controllers/ocrController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/extract', protect, upload.single('id_card'), extractIdInfo);
router.get('/status', protect, getStatus);

module.exports = router;
