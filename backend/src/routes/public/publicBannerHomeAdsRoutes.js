const express = require('express');
const {
  getPublicBannerHomeSlides,
  trackBannerHomeAdView,
  trackBannerHomeAdClick,
} = require('../../controllers/public/publicBannerHomeAdsController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Public banner home ads routes working',
  });
});

router.get('/slides', getPublicBannerHomeSlides);
router.post('/ads/:id/view', trackBannerHomeAdView);
router.post('/ads/:id/click', trackBannerHomeAdClick);

module.exports = router;