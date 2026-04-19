const express = require('express');
const {
  getAllCategories,
  getActiveCategories,
  getSingleCategory,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
} = require('../../controllers/admin/adminCategoryController');
const { protect, adminOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Admin category routes working',
  });
});

router.get('/', protect, adminOnly, getAllCategories);
router.get('/active', protect, adminOnly, getActiveCategories);
router.get('/:id', protect, adminOnly, getSingleCategory);

router.post('/', protect, adminOnly, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.put('/:id/status', protect, adminOnly, updateCategoryStatus);

router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;