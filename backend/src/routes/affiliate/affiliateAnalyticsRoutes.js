const express = require('express');
const {
  getAnalyticsOverview,
  getProductAnalytics,
  getPostAnalytics,
} = require('../../controllers/affiliate/affiliateAnalyticsController');
const { protect, affiliateOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Affiliate analytics routes working',
  });
});

router.get('/', protect, affiliateOnly, getAnalyticsOverview);
router.get('/products/:productId', protect, affiliateOnly, getProductAnalytics);
router.get('/posts/:postId', protect, affiliateOnly, getPostAnalytics);

module.exports = router;