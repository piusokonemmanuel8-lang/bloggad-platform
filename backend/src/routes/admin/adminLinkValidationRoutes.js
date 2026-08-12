const express = require('express');
const {
  getDomainRules,
  createDomainRule,
  updateDomainRule,
  deleteDomainRule,
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

router.get('/domains', protect, adminOnly, getDomainRules);
router.post('/domains', protect, adminOnly, createDomainRule);
router.put('/domains/:ruleId', protect, adminOnly, updateDomainRule);
router.delete('/domains/:ruleId', protect, adminOnly, deleteDomainRule);

router.get('/', protect, adminOnly, getAllValidationLogs);
router.get('/failed', protect, adminOnly, getFailedValidationLogs);
router.get('/passed', protect, adminOnly, getPassedValidationLogs);
router.get('/summary', protect, adminOnly, getValidationLogSummary);
router.get('/:id', protect, adminOnly, getSingleValidationLog);

router.delete('/:id', protect, adminOnly, deleteValidationLog);
router.delete('/', protect, adminOnly, clearAllValidationLogs);

module.exports = router;