const express = require('express');
const {
  servePublicAd,
  trackPublicAdImpression,
  trackPublicAdClick,
} = require('../../controllers/public/publicAdServeController');
const {
  requestFeaturedAd,
  qualifyFeaturedAdImpression,
  clickFeaturedAd,
} = require('../../controllers/public/publicSupgadFeaturedAdsController');

const router = express.Router();

router.get('/serve', servePublicAd);
router.post('/impression', trackPublicAdImpression);
router.post('/click', trackPublicAdClick);

router.post('/supgad/request', requestFeaturedAd);
router.post(
  '/supgad/impressions/:impressionToken/qualify',
  qualifyFeaturedAdImpression
);
router.post('/supgad/click', clickFeaturedAd);

module.exports = router;
