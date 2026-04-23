const express = require('express');
const {
  getAffiliateBlogPulseEarnings,
} = require('../../controllers/affiliate/affiliateBlogPulseEarningsController');
const { protect, affiliateOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Affiliate BlogPulse earnings routes working',
  });
});

router.get('/', protect, affiliateOnly, getAffiliateBlogPulseEarnings);

module.exports = router;