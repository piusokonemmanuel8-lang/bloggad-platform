const express = require('express');
const {
  protect,
  adminOnly,
} = require('../../middleware/authMiddleware');
const {
  getAdminReadingConfig,
  updatePublishRule,
} = require('../../controllers/readingCoreController');
const {
  listPostReports,
  updatePostReport,
} = require('../../controllers/admin/readingModerationController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ ok: true, message: 'Admin Reading Core routes working' });
});

router.get('/config', protect, adminOnly, getAdminReadingConfig);
router.put('/publish-rules/:contentType', protect, adminOnly, updatePublishRule);
router.get('/reports', protect, adminOnly, listPostReports);
router.patch('/reports/:reportId', protect, adminOnly, updatePostReport);

module.exports = router;