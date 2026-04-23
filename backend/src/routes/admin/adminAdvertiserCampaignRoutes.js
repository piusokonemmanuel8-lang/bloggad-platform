const express = require('express');
const { protect, adminOnly } = require('../../middleware/authMiddleware');
const {
  getAdminAdvertiserCampaigns,
  getAdminAdvertiserCampaignById,
  approveAdminAdvertiserCampaign,
  rejectAdminAdvertiserCampaign,
  pauseAdminAdvertiserCampaign,
} = require('../../controllers/adminAdvertiserCampaignController');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/', getAdminAdvertiserCampaigns);
router.get('/:campaignId', getAdminAdvertiserCampaignById);
router.patch('/:campaignId/approve', approveAdminAdvertiserCampaign);
router.patch('/:campaignId/reject', rejectAdminAdvertiserCampaign);
router.patch('/:campaignId/pause', pauseAdminAdvertiserCampaign);

module.exports = router;