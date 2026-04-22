const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  registerCustomer,
  loginCustomer,
  getCustomerMe,
  forgotCustomerPassword,
  resetCustomerPassword,
} = require('../controllers/customerAuthController');

const router = express.Router();

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/forgot-password', forgotCustomerPassword);
router.post('/reset-password', resetCustomerPassword);
router.get('/me', protect, getCustomerMe);

module.exports = router;