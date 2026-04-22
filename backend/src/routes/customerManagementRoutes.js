const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getAdminCustomers,
  getAffiliateCustomers,
  adminUpdateCustomerStatus,
} = require('../controllers/customerManagementController');

const router = express.Router();

router.get('/admin/customers', protect, getAdminCustomers);
router.get('/affiliate/customers', protect, getAffiliateCustomers);
router.patch('/admin/customers/:customerId/status', protect, adminUpdateCustomerStatus);

module.exports = router;