const express = require('express');
const {
  getAdminBannerHomeAdCampaigns,
  getAdminBannerHomeAdCampaignById,
  approveBannerHomeAdCampaign,
  rejectBannerHomeAdCampaign,
  pauseBannerHomeAdCampaign,
  resumeBannerHomeAdCampaign,
  createAdminOwnedBannerHomeAd,
} = require('../../controllers/admin/adminBannerHomeAdCampaignsController');
const { protect, adminOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Admin banner home ad campaigns routes working',
  });
});

router.get('/', protect, adminOnly, getAdminBannerHomeAdCampaigns);
router.get('/:id', protect, adminOnly, getAdminBannerHomeAdCampaignById);

router.post('/', protect, adminOnly, createAdminOwnedBannerHomeAd);

router.put('/:id/approve', protect, adminOnly, approveBannerHomeAdCampaign);
router.put('/:id/reject', protect, adminOnly, rejectBannerHomeAdCampaign);
router.put('/:id/pause', protect, adminOnly, pauseBannerHomeAdCampaign);
router.put('/:id/resume', protect, adminOnly, resumeBannerHomeAdCampaign);

module.exports = router;