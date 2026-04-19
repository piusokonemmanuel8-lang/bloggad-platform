const express = require('express');
const {
  createOrUpdateAffiliateWebsite,
  getMyAffiliateWebsite,
  getMyAffiliateWebsitePublicPreview,
  updateAffiliateWebsiteBranding,
  updateAffiliateWebsiteSeo,
  updateAffiliateWebsiteStatus,
} = require('../../controllers/affiliate/affiliateWebsiteController');
const { protect, affiliateOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Affiliate website routes working',
  });
});

router.get('/me', protect, affiliateOnly, getMyAffiliateWebsite);
router.get('/me/preview', protect, affiliateOnly, getMyAffiliateWebsitePublicPreview);

router.post('/me', protect, affiliateOnly, createOrUpdateAffiliateWebsite);
router.put('/me', protect, affiliateOnly, createOrUpdateAffiliateWebsite);

router.put('/me/branding', protect, affiliateOnly, updateAffiliateWebsiteBranding);
router.put('/me/seo', protect, affiliateOnly, updateAffiliateWebsiteSeo);
router.put('/me/status', protect, affiliateOnly, updateAffiliateWebsiteStatus);

module.exports = router;