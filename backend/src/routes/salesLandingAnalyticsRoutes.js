'use strict';

// BLOGGAD_V54_UNMOUNTED_ROUTE
// Do not mount until migration and anti-inflation gates pass.

const express = require('express');
const { rateLimit } = require('express-rate-limit');
const pool = require('../config/db');
const {
  recordLandingAnalyticsEvent
} = require('../services/salesLandingAnalyticsRecorder');
const {
  createSalesLandingAnalyticsHandler
} = require('../controllers/salesLandingAnalyticsController');

const router = express.Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, code: 'ANALYTICS_RATE_LIMIT' }
});

router.post(
  '/public/:pageId/events',
  limiter,
  createSalesLandingAnalyticsHandler({
    recorder: recordLandingAnalyticsEvent,
    db: pool
  })
);

module.exports = router;