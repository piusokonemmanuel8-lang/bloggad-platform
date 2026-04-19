const express = require('express');
const {
  getMyPosts,
  getMyPostById,
  getMyPostsByProductId,
  createPost,
  updatePost,
  updatePostStatus,
  deletePost,
} = require('../../controllers/affiliate/affiliatePostController');
const { protect, affiliateOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Affiliate post routes working',
  });
});

router.get('/', protect, affiliateOnly, getMyPosts);
router.get('/product/:productId', protect, affiliateOnly, getMyPostsByProductId);
router.get('/:id', protect, affiliateOnly, getMyPostById);

router.post('/', protect, affiliateOnly, createPost);
router.put('/:id', protect, affiliateOnly, updatePost);
router.put('/:id/status', protect, affiliateOnly, updatePostStatus);

router.delete('/:id', protect, affiliateOnly, deletePost);

module.exports = router;