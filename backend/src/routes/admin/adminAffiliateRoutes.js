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

router.delete('/:id', protect, adminOnly, deleteAffiliate);

module.exports = router;