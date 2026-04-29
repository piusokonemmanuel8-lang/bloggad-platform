const express = require('express');
const {
  getAdminBlogPulseSettings,
  updateAdminBlogPulseSettings,
  getAdminBlogPulsePolicy,
  getAdminMonetizationSubmissions,
  reviewAdminMonetizationSubmission,
  getAdminContentQualityReviews,
  reviewAdminContentQuality,
} = require('../../controllers/admin/adminBlogPulseController');
const { protect, adminOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/settings', getAdminBlogPulseSettings);
router.put('/settings', updateAdminBlogPulseSettings);
router.patch('/settings', updateAdminBlogPulseSettings);
router.get('/policy', getAdminBlogPulsePolicy);

router.get('/submissions', getAdminMonetizationSubmissions);
router.patch('/submissions/:submissionId/review', reviewAdminMonetizationSubmission);

router.get('/content-quality', getAdminContentQualityReviews);
router.patch('/content-quality/:userId/review', reviewAdminContentQuality);

module.exports = router;