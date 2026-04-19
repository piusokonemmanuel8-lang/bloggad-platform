const express = require('express');
const {
  getAllPosts,
  getSinglePost,
  updatePostStatus,
  deletePost,
} = require('../../controllers/admin/adminPostController');
const { protect, adminOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Admin post routes working',
  });
});

router.get('/', protect, adminOnly, getAllPosts);
router.get('/:id', protect, adminOnly, getSinglePost);

router.put('/:id/status', protect, adminOnly, updatePostStatus);

router.delete('/:id', protect, adminOnly, deletePost);

module.exports = router;