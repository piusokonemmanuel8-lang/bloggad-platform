const express = require('express');
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const {
  getWriterWallet,
  requestWriterWithdrawal,
} = require('../controllers/writerReaderFinanceController');

const router = express.Router();

async function activeWriterOnly(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        message: 'Not authorized.',
      });
    }

    if (req.user.status !== 'active') {
      return res.status(403).json({
        ok: false,
        message: 'Active Writer account required.',
      });
    }

    if (req.user.role === 'affiliate') {
      return next();
    }

    const [rows] = await pool.query(
      `
      SELECT id
      FROM writer_pages
      WHERE user_id = ?
        AND status = 'active'
      LIMIT 1
      `,
      [req.user.id]
    );

    if (!rows[0]) {
      return res.status(403).json({
        ok: false,
        message: 'Active Writer account required.',
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Writer wallet routes working',
  });
});

router.get('/', protect, activeWriterOnly, getWriterWallet);
router.post(
  '/withdrawals',
  protect,
  activeWriterOnly,
  requestWriterWithdrawal
);

module.exports = router;