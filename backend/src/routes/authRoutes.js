const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

const router = express.Router();

function missingHandler(name) {
  return (req, res) => {
    return res.status(500).json({
      ok: false,
      message: `Auth controller handler "${name}" is missing or not exported as a function.`,
    });
  };
}

const registerHandler =
  authController.register ||
  authController.registerUser ||
  authController.signup ||
  missingHandler('register');

const loginHandler =
  authController.login ||
  authController.loginUser ||
  authController.signin ||
  missingHandler('login');

const getMeHandler =
  authController.getMe ||
  authController.me ||
  authController.getProfile ||
  missingHandler('getMe');

router.get('/test', (req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'auth routes working',
    handlers: {
      register: typeof registerHandler === 'function',
      login: typeof loginHandler === 'function',
      getMe: typeof getMeHandler === 'function',
    },
  });
});

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.get('/me', protect, getMeHandler);

module.exports = router;