const express = require('express');
const {
  getAffiliateDashboard,
} = require('../../controllers/affiliate/affiliateDashboardController');
const {
  getAffiliateMonetizationSettings,
  saveAffiliateMonetizationSettings,
  submitAffiliateMonetizationForReview,
} = require('../../controllers/affiliate/affiliateMonetizationController');
const { protect, affiliateOnly } = require('../../middleware/authMiddleware');
const { paidWriterOnly } = require('../../middleware/writerPaidPlanMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Affiliate dashboard routes working',
  });
});

router.get('/', protect, affiliateOnly, getAffiliateDashboard);

router.get(
  '/monetization/settings',
  protect,
  affiliateOnly,
  getAffiliateMonetizationSettings
);

router.put(
  '/monetization/settings',
  protect,
  affiliateOnly,
  paidWriterOnly,
  saveAffiliateMonetizationSettings
);

router.post(
  '/monetization/submit-review',
  protect,
  affiliateOnly,
  paidWriterOnly,
  submitAffiliateMonetizationForReview
);

module.exports = router;