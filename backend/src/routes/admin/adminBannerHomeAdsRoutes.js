const express = require('express');
const {
  getBannerHomeAdsSettings,
  updateBannerHomeAdsSettings,
  getAdminSlides,
  getAdminSlideById,
  createAdminSlide,
  updateAdminSlide,
  updateAdminSlideStatus,
  deleteAdminSlide,
} = require('../../controllers/admin/adminBannerHomeAdsController');
const { protect, adminOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Admin banner home ads routes working',
  });
});

router.get('/settings', protect, adminOnly, getBannerHomeAdsSettings);
router.put('/settings', protect, adminOnly, updateBannerHomeAdsSettings);

router.get('/slides', protect, adminOnly, getAdminSlides);
router.get('/slides/:id', protect, adminOnly, getAdminSlideById);
router.post('/slides', protect, adminOnly, createAdminSlide);
router.put('/slides/:id', protect, adminOnly, updateAdminSlide);
router.put('/slides/:id/status', protect, adminOnly, updateAdminSlideStatus);
router.delete('/slides/:id', protect, adminOnly, deleteAdminSlide);

module.exports = router;