const express = require('express');
const {
  getWriterAnalyticsOverview,
  getWriterPostAnalytics,
} = require('../controllers/writerAnalyticsController');
const { protect, affiliateOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Writer analytics routes working',
  });
});

router.get('/', protect, affiliateOnly, getWriterAnalyticsOverview);
router.get('/posts/:postId', protect, affiliateOnly, getWriterPostAnalytics);

// BLOGGAD_V74_WRITER_REPORT_ROUTE
// Disabled until the analytics database has been verified.
if (process.env.BLOGGAD_SALES_LANDING_REPORT_ENABLED === 'true') {
  const { createWriterSalesLandingReportHandler } = require('../controllers/writerSalesLandingAnalyticsController');
  const reportDb = require('../config/db');
  router.get('/sales-landing/:pageId', protect, affiliateOnly,
    createWriterSalesLandingReportHandler({ db: reportDb }));
}
module.exports = router;