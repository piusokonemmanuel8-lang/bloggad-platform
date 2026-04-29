const express = require('express');
const { protect } = require('../../middleware/authMiddleware');

const {
  getAffiliateMonetizationSettings,
  saveAffiliateMonetizationSettings,
  submitAffiliateMonetizationForReview,
} = require('../../controllers/affiliate/affiliateMonetizationController');

const router = express.Router();

router.get('/settings', protect, getAffiliateMonetizationSettings);
router.post('/settings', protect, saveAffiliateMonetizationSettings);
router.post('/submit', protect, submitAffiliateMonetizationForReview);

module.exports = router;