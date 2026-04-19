const express = require('express');
const {
  getMyMenus,
  getMyMenuById,
  createMenu,
  updateMenu,
  saveMenuItems,
  deleteMenu,
} = require('../../controllers/affiliate/affiliateMenuController');
const { protect, affiliateOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Affiliate menu routes working',
  });
});

router.get('/', protect, affiliateOnly, getMyMenus);
router.get('/:id', protect, affiliateOnly, getMyMenuById);

router.post('/', protect, affiliateOnly, createMenu);
router.put('/:id', protect, affiliateOnly, updateMenu);
router.put('/:id/items', protect, affiliateOnly, saveMenuItems);

router.delete('/:id', protect, affiliateOnly, deleteMenu);

module.exports = router;