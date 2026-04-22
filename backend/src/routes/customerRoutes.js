const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getCustomerDashboard,
  getCustomerSettings,
  saveCustomerSettings,
} = require('../controllers/customerController');

const router = express.Router();

router.get('/dashboard', protect, getCustomerDashboard);
router.get('/settings', protect, getCustomerSettings);
router.put('/settings', protect, saveCustomerSettings);

module.exports = router;