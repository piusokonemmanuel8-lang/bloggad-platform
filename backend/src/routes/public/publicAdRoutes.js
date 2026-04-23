const express = require('express');
const {
  servePublicAd,
  trackPublicAdImpression,
  trackPublicAdClick,
} = require('../../controllers/public/publicAdServeController');

const router = express.Router();

router.get('/serve', servePublicAd);
router.post('/impression', trackPublicAdImpression);
router.post('/click', trackPublicAdClick);

module.exports = router;