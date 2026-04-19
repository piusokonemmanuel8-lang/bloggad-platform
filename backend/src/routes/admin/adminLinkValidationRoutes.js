const express = require('express');
const {
  getAllValidationLogs,
  getFailedValidationLogs,
  getPassedValidationLogs,
  getValidationLogSummary,
  getSingleValidationLog,
  deleteValidationLog,
  clearAllValidationLogs,
} = require('../../controllers/admin/adminLinkValidationController');
const { protect, adminOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Admin link validation routes working',
  });
});

router.get('/', protect, adminOnly, getAllValidationLogs);
router.get('/failed', protect, adminOnly, getFailedValidationLogs);
router.get('/passed', protect, adminOnly, getPassedValidationLogs);
router.get('/summary', protect, adminOnly, getValidationLogSummary);
router.get('/:id', protect, adminOnly, getSingleValidationLog);

router.delete('/:id', protect, adminOnly, deleteValidationLog);
router.delete('/', protect, adminOnly, clearAllValidationLogs);

module.exports = router;