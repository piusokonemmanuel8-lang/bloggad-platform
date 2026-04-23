const express = require('express');
const { protect, adminOnly } = require('../../middleware/authMiddleware');
const {
  getAdminAdvertiserPayments,
  getAdminAdvertiserPaymentById,
  approveAdminAdvertiserPayment,
  rejectAdminAdvertiserPayment,
} = require('../../controllers/adminAdvertiserPaymentController');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/', getAdminAdvertiserPayments);
router.get('/:paymentId', getAdminAdvertiserPaymentById);
router.patch('/:paymentId/approve', approveAdminAdvertiserPayment);
router.patch('/:paymentId/reject', rejectAdminAdvertiserPayment);

module.exports = router;