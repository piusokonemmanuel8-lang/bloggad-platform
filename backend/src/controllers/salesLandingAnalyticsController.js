'use strict';

// BLOGGAD_V54_SALES_ANALYTICS_API_FOUNDATION
// This handler is not mounted by V54.
// No untrusted browser event can claim a completed payment.

const { validateLandingAnalyticsEvent } =
  require('../services/salesLandingAnalyticsService');

const MAX_BODY_BYTES = 4096;
const MAX_PAGE_ID = Number.MAX_SAFE_INTEGER;

function validPageId(input) {
  if (typeof input !== 'string' || !/^[1-9][0-9]*$/.test(input)) {
    return null;
  }
  const id = Number(input);
  return Number.isSafeInteger(id) && id <= MAX_PAGE_ID ? id : null;
}

function createSalesLandingAnalyticsHandler({ recorder, db }) {
  if (typeof recorder !== 'function') {
    throw new Error('RECORDER_REQUIRED');
  }

  return async function ingestSalesLandingAnalytics(req, res) {
    const pageId = validPageId(req.params && req.params.pageId);
    if (!pageId) {
      return res.status(400).json({ ok: false, code: 'INVALID_PAGE_ID' });
    }

    if (
      !req.body ||
      typeof req.body !== 'object' ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({ ok: false, code: 'INVALID_BODY' });
    }

    let bodySize;
    try {
      bodySize = Buffer.byteLength(JSON.stringify(req.body), 'utf8');
    } catch (_) {
      return res.status(400).json({ ok: false, code: 'INVALID_BODY' });
    }

    if (bodySize > MAX_BODY_BYTES) {
      return res.status(413).json({ ok: false, code: 'EVENT_TOO_LARGE' });
    }

    let event;
    try {
      event = validateLandingAnalyticsEvent(req.body);
    } catch (_) {
      return res.status(400).json({ ok: false, code: 'INVALID_EVENT' });
    }

    try {
      const result = await recorder({
        pageId,
        rawEvent: event,
        db
      });

      return res.status(202).json({
        ok: true,
        accepted: true,
        duplicate: Boolean(result && result.duplicate)
      });
    } catch (error) {
      if (error && error.message === 'LANDING_PAGE_NOT_PUBLISHED') {
        return res.status(404).json({
          ok: false,
          code: 'PAGE_NOT_FOUND'
        });
      }
      if (error && error.message === 'ANALYTICS_SESSION_VISITOR_MISMATCH') {
        return res.status(409).json({
          ok: false,
          code: 'SESSION_CONFLICT'
        });
      }
      console.error('Sales landing analytics ingestion failed:', error.message);
      return res.status(503).json({
        ok: false,
        code: 'ANALYTICS_UNAVAILABLE'
      });
    }
  };
}

module.exports = {
  MAX_BODY_BYTES,
  validPageId,
  createSalesLandingAnalyticsHandler
};