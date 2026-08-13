const express = require('express');
const {
  protect,
  adminOnly,
} = require('../../middleware/authMiddleware');
const {
  getSupgadIntegrationSettings,
  saveSupgadIntegrationSettings,
} = require('../../controllers/adminSupgadIntegrationController');

const router = express.Router();

router.get('/', protect, adminOnly, getSupgadIntegrationSettings);
router.put('/', protect, adminOnly, saveSupgadIntegrationSettings);

module.exports = router;