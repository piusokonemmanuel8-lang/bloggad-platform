const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  savePost,
  unsavePost,
  getSavedPosts,
  saveProduct,
  unsaveProduct,
  getSavedProducts,
} = require('../controllers/customerSavedController');

const router = express.Router();

router.get('/posts', protect, getSavedPosts);
router.post('/posts', protect, savePost);
router.delete('/posts/:postId', protect, unsavePost);

router.get('/products', protect, getSavedProducts);
router.post('/products', protect, saveProduct);
router.delete('/products/:productId', protect, unsaveProduct);

module.exports = router;