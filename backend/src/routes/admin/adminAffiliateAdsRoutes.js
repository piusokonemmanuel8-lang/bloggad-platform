const express = require('express');

const {
  getAdminAffiliateAds,
  approveAffiliateAd,
  rejectAffiliateAd,
  pauseAffiliateAdByAdmin,
  resumeAffiliateAdByAdmin,
} = require('../../controllers/admin/adminAffiliateAdsController');

const { protect, adminOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Admin affiliate ads routes working',
  });
});

router.get('/', protect, adminOnly, getAdminAffiliateAds);

router.put('/:id/approve', protect, adminOnly, approveAffiliateAd);

router.put('/:id/reject', protect, adminOnly, rejectAffiliateAd);

router.put('/:id/pause', protect, adminOnly, pauseAffiliateAdByAdmin);

router.put('/:id/resume', protect, adminOnly, resumeAffiliateAdByAdmin);

module.exports = router;