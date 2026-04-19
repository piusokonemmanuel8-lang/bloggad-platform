const express = require('express');
const {
  getAllPlans,
  getActivePlans,
  getSinglePlan,
  createPlan,
  updatePlan,
  updatePlanStatus,
  deletePlan,
} = require('../../controllers/admin/adminPlanController');
const { protect, adminOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Admin plan routes working',
  });
});

router.get('/', protect, adminOnly, getAllPlans);
router.get('/active', protect, adminOnly, getActivePlans);
router.get('/:id', protect, adminOnly, getSinglePlan);

router.post('/', protect, adminOnly, createPlan);
router.put('/:id', protect, adminOnly, updatePlan);
router.put('/:id/status', protect, adminOnly, updatePlanStatus);

router.delete('/:id', protect, adminOnly, deletePlan);

module.exports = router;