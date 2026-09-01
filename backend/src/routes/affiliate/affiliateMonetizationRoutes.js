const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const { paidWriterOnly } = require('../../middleware/writerPaidPlanMiddleware');

const {
  getAffiliateMonetizationSettings,
  saveAffiliateMonetizationSettings,
  submitAffiliateMonetizationForReview,
} = require('../../controllers/affiliate/affiliateMonetizationController');

const router = express.Router();

router.get('/settings', protect, getAffiliateMonetizationSettings);
router.post('/settings', protect, paidWriterOnly, saveAffiliateMonetizationSettings);
router.post('/submit', protect, paidWriterOnly, submitAffiliateMonetizationForReview);

module.exports = router;