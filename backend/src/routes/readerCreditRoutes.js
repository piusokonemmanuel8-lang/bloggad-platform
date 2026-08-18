const express = require('express');
const { protect, readerOrWriter } = require('../middleware/authMiddleware');
const {
  getReaderCreditWallet,
  createReaderAppreciation,
} = require('../controllers/writerReaderFinanceController');
const {
  getTopUpOptions,
  initializeTopUp,
  getTopUpStatus,
  paystackCallback,
  flutterwaveCallback,
  paypalCallback,
  paypalCancel,
} = require('../controllers/readerCreditPaymentController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Reader credit routes working',
  });
});

router.get('/top-up/callback/paystack', paystackCallback);
router.get('/top-up/callback/flutterwave', flutterwaveCallback);
router.get('/top-up/callback/paypal', paypalCallback);
router.get('/top-up/cancel/paypal', paypalCancel);

router.get('/top-up/options', protect, readerOrWriter, getTopUpOptions);
router.post('/top-up/initialize', protect, readerOrWriter, initializeTopUp);
router.get(
  '/top-up/status/:reference',
  protect,
  readerOrWriter,
  getTopUpStatus
);

router.get('/', protect, readerOrWriter, getReaderCreditWallet);
router.post('/appreciate', protect, readerOrWriter, createReaderAppreciation);

module.exports = router;
