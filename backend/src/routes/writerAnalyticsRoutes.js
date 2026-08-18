const express = require('express');
const {
  getWriterAnalyticsOverview,
} = require('../controllers/writerAnalyticsController');
const { protect, affiliateOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Writer analytics routes working',
  });
});

router.get('/', protect, affiliateOnly, getWriterAnalyticsOverview);

module.exports = router;