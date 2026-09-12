const express = require('express');

const {
  protect,
  authorize,
} = require('../../middleware/authMiddleware');

const {
  settings,
  saveSettings,
  status,
} = require('../../controllers/admin/adminWebinarInfrastructureController');

const router = express.Router();

router.use(
  protect,
  authorize('admin')
);

router.get('/settings', settings);
router.put('/settings', saveSettings);
router.get('/status', status);

module.exports = router;