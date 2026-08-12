const express = require('express');
const { protect, affiliateOnly } = require('../middleware/authMiddleware');
const {
  getWriterWallet,
  requestWriterWithdrawal,
} = require('../controllers/writerReaderFinanceController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Writer wallet routes working',
  });
});

router.get('/', protect, affiliateOnly, getWriterWallet);
router.post('/withdrawals', protect, affiliateOnly, requestWriterWithdrawal);

module.exports = router;