const express = require('express');
const {
  getAdminDashboardOverview,
} = require('../../controllers/admin/adminDashboardController');
const { protect, adminOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Admin dashboard routes working',
  });
});

router.get('/', protect, adminOnly, getAdminDashboardOverview);

module.exports = router;