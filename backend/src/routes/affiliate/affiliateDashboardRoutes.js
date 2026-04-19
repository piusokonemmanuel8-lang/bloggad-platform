const express = require('express');
const {
  getAffiliateDashboard,
} = require('../../controllers/affiliate/affiliateDashboardController');
const { protect, affiliateOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Affiliate dashboard routes working',
  });
});

router.get('/', protect, affiliateOnly, getAffiliateDashboard);

module.exports = router;