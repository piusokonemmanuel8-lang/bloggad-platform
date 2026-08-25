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
const { requireActivePaidWriterPlan } = require('../../middleware/writerPlanMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Affiliate menu routes working',
  });
});

router.get('/', protect, affiliateOnly, getMyMenus);
router.get('/:id', protect, affiliateOnly, getMyMenuById);

router.post('/', protect, affiliateOnly, requireActivePaidWriterPlan, createMenu);
router.put('/:id', protect, affiliateOnly, requireActivePaidWriterPlan, updateMenu);
router.put('/:id/items', protect, affiliateOnly, requireActivePaidWriterPlan, saveMenuItems);

router.delete('/:id', protect, affiliateOnly, requireActivePaidWriterPlan, deleteMenu);

module.exports = router;