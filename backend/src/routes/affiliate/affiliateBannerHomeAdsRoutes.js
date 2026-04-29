const express = require('express');
const {
  getMyBannerHomeAds,
  getMyBannerHomeAdById,
  createBannerHomeAd,
  updateBannerHomeAd,
  updateBannerHomeAdStatus,
  topUpBannerHomeAd,
  deleteBannerHomeAd,
} = require('../../controllers/affiliate/affiliateBannerHomeAdsController');
const { protect, affiliateOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Affiliate banner home ads routes working',
  });
});

router.get('/', protect, affiliateOnly, getMyBannerHomeAds);
router.get('/:id', protect, affiliateOnly, getMyBannerHomeAdById);

router.post('/', protect, affiliateOnly, createBannerHomeAd);
router.put('/:id', protect, affiliateOnly, updateBannerHomeAd);
router.put('/:id/status', protect, affiliateOnly, updateBannerHomeAdStatus);
router.post('/:id/top-up', protect, affiliateOnly, topUpBannerHomeAd);

router.delete('/:id', protect, affiliateOnly, deleteBannerHomeAd);

module.exports = router;