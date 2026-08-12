const express = require('express');
const { protect, customerOnly } = require('../middleware/authMiddleware');
const {
  getReaderPost,
  getReaderSubscription,
  getReaderMemberships,
  getReaderPlans,
} = require('../controllers/writerReaderAccessController');
const {
  getCheckoutOptions,
  initializeCheckout,
  getCheckoutStatus,
  paystackCallback,
  flutterwaveCallback,
  paypalCallback,
  paypalCancel,
} = require('../controllers/readerSubscriptionPaymentController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Reader access routes working',
  });
});

router.get('/plans', protect, customerOnly, getReaderPlans);
router.get('/subscription', protect, customerOnly, getReaderSubscription);
router.get('/memberships', protect, customerOnly, getReaderMemberships);
router.get('/checkout/options', protect, customerOnly, getCheckoutOptions);
router.post('/checkout/initialize', protect, customerOnly, initializeCheckout);
router.get(
  '/checkout/status/:reference',
  protect,
  customerOnly,
  getCheckoutStatus
);
router.get('/checkout/callback/paystack', paystackCallback);
router.get('/checkout/callback/flutterwave', flutterwaveCallback);
router.get('/checkout/callback/paypal', paypalCallback);
router.get('/checkout/cancel/paypal', paypalCancel);
router.get('/posts/:postId', protect, customerOnly, getReaderPost);

module.exports = router;
