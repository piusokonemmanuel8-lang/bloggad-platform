const express = require('express');
const {
  getMySubscriptionOverview,
  getMySubscriptionHistory,
  getAvailablePlans,
  startFreeTrial,
  requestPlanChange,
} = require('../../controllers/affiliate/affiliateSubscriptionController');
const {
  getCheckoutOptions,
  initializeCheckout,
  getCheckoutStatus,
  paystackCallback,
  flutterwaveCallback,
  paypalCallback,
  paypalCancel,
} = require('../../controllers/writerSubscriptionPaymentController');
const { protect, affiliateOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Affiliate subscription routes working',
  });
});

router.get('/checkout/callback/paystack', paystackCallback);
router.get('/checkout/callback/flutterwave', flutterwaveCallback);
router.get('/checkout/callback/paypal', paypalCallback);
router.get('/checkout/cancel/paypal', paypalCancel);

router.get('/', protect, affiliateOnly, getMySubscriptionOverview);
router.get('/history', protect, affiliateOnly, getMySubscriptionHistory);
router.get('/plans', protect, affiliateOnly, getAvailablePlans);
router.get('/checkout/options', protect, affiliateOnly, getCheckoutOptions);
router.get(
  '/checkout/status/:reference',
  protect,
  affiliateOnly,
  getCheckoutStatus
);

router.post('/start-trial', protect, affiliateOnly, startFreeTrial);
router.post('/checkout/initialize', protect, affiliateOnly, initializeCheckout);
router.post('/change-plan', protect, affiliateOnly, requestPlanChange);

module.exports = router;
