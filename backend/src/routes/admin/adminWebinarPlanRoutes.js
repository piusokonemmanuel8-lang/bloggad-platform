const express = require('express');
const {
  getAllPlans,
  getSinglePlan,
  createPlan,
  updatePlan,
  updatePlanStatus,
} = require('../../controllers/admin/adminWebinarPlanController');
const {
  protect,
  adminOnly,
} = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'Admin webinar plan routes working',
  });
});

router.get('/', protect, adminOnly, getAllPlans);
router.get('/:id', protect, adminOnly, getSinglePlan);
router.post('/', protect, adminOnly, createPlan);
router.put('/:id', protect, adminOnly, updatePlan);
router.put('/:id/status', protect, adminOnly, updatePlanStatus);

module.exports = router;
