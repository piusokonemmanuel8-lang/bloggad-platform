const express = require('express');
const {
  getPlans,
  getMyOverview,
  getCheckoutOptions,
  initializeCheckout,
  getCheckoutStatus,
  paystackCallback,
  flutterwaveCallback,
  paypalCallback,
  paypalCancel,
} = require('../controllers/writerWebinarSubscriptionController');
const {
  protect,
  affiliateOnly,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'Writer webinar subscription routes working',
  });
});

router.get('/checkout/callback/paystack', paystackCallback);
router.get('/checkout/callback/flutterwave', flutterwaveCallback);
router.get('/checkout/callback/paypal', paypalCallback);
router.get('/checkout/cancel/paypal', paypalCancel);

router.get('/plans', protect, affiliateOnly, getPlans);
router.get('/me', protect, affiliateOnly, getMyOverview);
router.get(
  '/checkout/options',
  protect,
  affiliateOnly,
  getCheckoutOptions
);
router.get(
  '/checkout/status/:reference',
  protect,
  affiliateOnly,
  getCheckoutStatus
);
router.post(
  '/checkout/initialize',
  protect,
  affiliateOnly,
  initializeCheckout
);

module.exports = router;
