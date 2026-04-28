const express = require('express');

const {
  getAffiliateAdsOptions,
  getAffiliateAds,
  createAffiliateAd,
  updateAffiliateAd,
  topUpAffiliateAd,
  pauseAffiliateAd,
  resumeAffiliateAd,
} = require('../../controllers/affiliate/affiliateAdsController');

const { protect, affiliateOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Affiliate ads routes working',
  });
});

router.get('/options', protect, affiliateOnly, getAffiliateAdsOptions);

router.get('/', protect, affiliateOnly, getAffiliateAds);

router.post('/', protect, affiliateOnly, createAffiliateAd);

router.put('/:id', protect, affiliateOnly, updateAffiliateAd);

router.post('/:id/top-up', protect, affiliateOnly, topUpAffiliateAd);

router.put('/:id/pause', protect, affiliateOnly, pauseAffiliateAd);

router.put('/:id/resume', protect, affiliateOnly, resumeAffiliateAd);

module.exports = router;