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
const { paidWriterOnly } = require('../../middleware/writerPaidPlanMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Affiliate ads routes working',
  });
});

router.get('/options', protect, affiliateOnly, paidWriterOnly, getAffiliateAdsOptions);

router.get('/', protect, affiliateOnly, paidWriterOnly, getAffiliateAds);

router.post('/', protect, affiliateOnly, paidWriterOnly, createAffiliateAd);

router.put('/:id', protect, affiliateOnly, paidWriterOnly, updateAffiliateAd);

router.post('/:id/top-up', protect, affiliateOnly, paidWriterOnly, topUpAffiliateAd);

router.put('/:id/pause', protect, affiliateOnly, paidWriterOnly, pauseAffiliateAd);

router.put('/:id/resume', protect, affiliateOnly, paidWriterOnly, resumeAffiliateAd);

module.exports = router;