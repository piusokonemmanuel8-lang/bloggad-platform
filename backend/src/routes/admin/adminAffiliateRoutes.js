const express = require('express');
const {
  getAllAffiliates,
  getSingleAffiliate,
  updateAffiliateStatus,
  updateAffiliateWebsiteStatus,
  assignSubscriptionToAffiliate,
  deleteAffiliate,
} = require('../../controllers/admin/adminAffiliateController');
const { protect, adminOnly } = require('../../middleware/authMiddleware');
const {
  getWriterVerification,
  updateWriterVerification,
} = require('../../controllers/admin/adminWriterVerificationController');
const {
  getWriterFollowerAdjustment,
  updateWriterFollowerAdjustment,
} = require('../../controllers/admin/adminWriterFollowerAdjustmentController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Admin affiliate routes working',
  });
});

router.get('/', protect, adminOnly, getAllAffiliates);
router.get('/:id', protect, adminOnly, getSingleAffiliate);

router.put('/:id/status', protect, adminOnly, updateAffiliateStatus);
router.put('/:id/website-status', protect, adminOnly, updateAffiliateWebsiteStatus);
router.post('/:id/subscription', protect, adminOnly, assignSubscriptionToAffiliate);
router.get('/:id/verification', protect, adminOnly, getWriterVerification);
router.put('/:id/verification', protect, adminOnly, updateWriterVerification);
router.get('/:id/follower-adjustment', protect, adminOnly, getWriterFollowerAdjustment);
router.put('/:id/follower-adjustment', protect, adminOnly, updateWriterFollowerAdjustment);

router.delete('/:id', protect, adminOnly, deleteAffiliate);

module.exports = router;