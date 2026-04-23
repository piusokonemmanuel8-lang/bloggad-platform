const express = require('express');
const {
  getAdminBlogPulseSettings,
  updateAdminBlogPulseSettings,
  getAdminBlogPulsePolicy,
  getAdminMonetizationSubmissions,
  reviewAdminMonetizationSubmission,
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

module.exports = router;