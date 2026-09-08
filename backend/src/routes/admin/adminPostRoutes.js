const express = require('express');
const {
  getAllPosts,
  getSinglePost,
  updatePostStatus,
  bulkUpdatePostStatus,
  startBulkLinkScan,
  getBulkLinkScanStatus,
  resolveBulkLinkReview,
  approveBulkAfterLinkScan,
  deletePost,
  bulkDeletePosts,
} = require('../../controllers/admin/adminPostController');
const { protect, adminOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ ok: true, message: 'Admin post routes working' });
});

router.get('/', protect, adminOnly, getAllPosts);

router.post('/bulk/link-scan', protect, adminOnly, startBulkLinkScan);
router.get('/bulk/link-scan/:jobId', protect, adminOnly, getBulkLinkScanStatus);
router.post('/bulk/link-review', protect, adminOnly, resolveBulkLinkReview);
router.post('/bulk/approve-after-scan', protect, adminOnly, approveBulkAfterLinkScan);

router.post('/bulk/status', protect, adminOnly, bulkUpdatePostStatus);
router.post('/bulk/delete', protect, adminOnly, bulkDeletePosts);

router.get('/:id', protect, adminOnly, getSinglePost);
router.put('/:id/status', protect, adminOnly, updatePostStatus);
router.delete('/:id', protect, adminOnly, deletePost);

module.exports = router;
