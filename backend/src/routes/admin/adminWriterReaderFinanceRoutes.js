const express = require('express');
const { protect, adminOnly } = require('../../middleware/authMiddleware');
const {
  grantReaderCredits,
  listWriterWithdrawals,
  reviewWriterWithdrawal,
} = require('../../controllers/writerReaderFinanceController');
const {
  getPaymentGateways,
  savePaymentGateway,
  getReaderCreditPurchaseSettings,
  saveReaderCreditPurchaseSettings,
} = require('../../controllers/adminPaymentGatewayController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Admin Writer and Reader finance routes working',
  });
});

router.get('/payment-gateways', protect, adminOnly, getPaymentGateways);
router.put(
  '/payment-gateways/:provider',
  protect,
  adminOnly,
  savePaymentGateway
);
router.get(
  '/reader-credit-purchase-settings',
  protect,
  adminOnly,
  getReaderCreditPurchaseSettings
);
router.put(
  '/reader-credit-purchase-settings',
  protect,
  adminOnly,
  saveReaderCreditPurchaseSettings
);

router.post('/reader-credits/grant', protect, adminOnly, grantReaderCredits);
router.get('/withdrawals', protect, adminOnly, listWriterWithdrawals);
router.patch(
  '/withdrawals/:withdrawalId/:action',
  protect,
  adminOnly,
  reviewWriterWithdrawal
);

module.exports = router;
