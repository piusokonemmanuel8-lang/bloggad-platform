const express = require('express');
const {
  getMyProducts,
  getMyProductById,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
} = require('../../controllers/affiliate/affiliateProductController');
const { protect, affiliateOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Affiliate product routes working',
  });
});

router.get('/', protect, affiliateOnly, getMyProducts);
router.get('/:id', protect, affiliateOnly, getMyProductById);

router.post('/', protect, affiliateOnly, createProduct);
router.put('/:id', protect, affiliateOnly, updateProduct);
router.put('/:id/status', protect, affiliateOnly, updateProductStatus);

router.delete('/:id', protect, affiliateOnly, deleteProduct);

module.exports = router;