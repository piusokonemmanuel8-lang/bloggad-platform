const express = require('express');
const {
  getMyDesignSettings,
  saveMyDesignSettings,
  getAvailableWebsiteTemplates,
} = require('../../controllers/affiliate/affiliateDesignController');
const { protect, authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Affiliate design routes working',
  });
});

router.get('/debug-user', protect, (req, res) => {
  return res.status(200).json({
    ok: true,
    user: req.user,
  });
});

router.get('/', protect, authorize('affiliate', 'admin'), getMyDesignSettings);
router.get('/templates', protect, authorize('affiliate', 'admin'), getAvailableWebsiteTemplates);

router.post('/', protect, authorize('affiliate', 'admin'), saveMyDesignSettings);
router.put('/', protect, authorize('affiliate', 'admin'), saveMyDesignSettings);

module.exports = router;