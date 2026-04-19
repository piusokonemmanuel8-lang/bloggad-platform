const express = require('express');
const {
  getMySubscriptionOverview,
  getMySubscriptionHistory,
  getAvailablePlans,
  startFreeTrial,
  requestPlanChange,
} = require('../../controllers/affiliate/affiliateSubscriptionController');
const { protect, affiliateOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Affiliate subscription routes working',
  });
});

router.get('/', protect, affiliateOnly, getMySubscriptionOverview);
router.get('/history', protect, affiliateOnly, getMySubscriptionHistory);
router.get('/plans', protect, affiliateOnly, getAvailablePlans);

router.post('/start-trial', protect, affiliateOnly, startFreeTrial);
router.post('/change-plan', protect, affiliateOnly, requestPlanChange);

module.exports = router;