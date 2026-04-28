const express = require('express');

const {
  getPublicAffiliateAds,
  trackAffiliateAdView,
  trackAffiliateAdClick,
} = require('../../controllers/public/publicAffiliateAdsController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Public affiliate ads routes working',
  });
});

router.get('/', getPublicAffiliateAds);

router.post('/:id/view', trackAffiliateAdView);

router.post('/:id/click', trackAffiliateAdClick);

module.exports = router;