const express = require('express');

const {
  getAffiliateAdsSettings,
  updateAffiliateAdsSettings,
} = require('../../controllers/admin/adminAffiliateAdsSettingsController');

const { protect, adminOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Admin affiliate ads settings routes working',
  });
});

router.get('/', protect, adminOnly, getAffiliateAdsSettings);

router.put('/', protect, adminOnly, updateAffiliateAdsSettings);

module.exports = router;