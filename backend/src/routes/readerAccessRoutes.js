const express = require('express');
const { protect, readerOrWriter } = require('../middleware/authMiddleware');
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

router.get('/plans', protect, readerOrWriter, getReaderPlans);
router.get('/subscription', protect, readerOrWriter, getReaderSubscription);
router.get('/memberships', protect, readerOrWriter, getReaderMemberships);
router.get('/checkout/options', protect, readerOrWriter, getCheckoutOptions);
router.post('/checkout/initialize', protect, readerOrWriter, initializeCheckout);
router.get(
  '/checkout/status/:reference',
  protect,
  readerOrWriter,
  getCheckoutStatus
);
router.get('/checkout/callback/paystack', paystackCallback);
router.get('/checkout/callback/flutterwave', flutterwaveCallback);
router.get('/checkout/callback/paypal', paypalCallback);
router.get('/checkout/cancel/paypal', paypalCancel);
router.get('/posts/:postId', protect, readerOrWriter, getReaderPost);

module.exports = router;
