const express = require('express');
const {
  getMyDesignSettings,
  saveMyDesignSettings,
  getAvailableWebsiteTemplates,
} = require('../../controllers/affiliate/affiliateDesignController');
const { protect, affiliateOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Affiliate design routes working',
  });
});

router.get('/', protect, affiliateOnly, getMyDesignSettings);
router.get('/templates', protect, affiliateOnly, getAvailableWebsiteTemplates);

router.post('/', protect, affiliateOnly, saveMyDesignSettings);
router.put('/', protect, affiliateOnly, saveMyDesignSettings);

module.exports = router;