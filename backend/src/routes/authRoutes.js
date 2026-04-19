const express = require('express');
const {
  registerAffiliate,
  loginUser,
  getMe,
  logoutUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Auth routes working',
  });
});

router.post('/register', registerAffiliate);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);

module.exports = router;