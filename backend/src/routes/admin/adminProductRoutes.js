const express = require('express');
const {
  getAllProducts,
  getSingleProduct,
  updateProductStatus,
  deleteProduct,
} = require('../../controllers/admin/adminProductController');
const { protect, adminOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Admin product routes working',
  });
});

router.get('/', protect, adminOnly, getAllProducts);
router.get('/:id', protect, adminOnly, getSingleProduct);

router.put('/:id/status', protect, adminOnly, updateProductStatus);

router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;