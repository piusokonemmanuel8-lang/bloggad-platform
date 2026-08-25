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
const { requireActivePaidWriterPlan } = require('../../middleware/writerPlanMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Affiliate product routes working',
  });
});

router.get('/', protect, affiliateOnly, getMyProducts);
router.get('/:id', protect, affiliateOnly, getMyProductById);

router.post('/', protect, affiliateOnly, requireActivePaidWriterPlan, createProduct);
router.put('/:id', protect, affiliateOnly, requireActivePaidWriterPlan, updateProduct);
router.put('/:id/status', protect, affiliateOnly, requireActivePaidWriterPlan, updateProductStatus);

router.delete('/:id', protect, affiliateOnly, requireActivePaidWriterPlan, deleteProduct);

module.exports = router;