// BLOGGAD_V74_WRITER_REPORT_CONTROLLER
'use strict';

const {
  getSalesLandingWriterReport
} = require('../services/salesLandingAnalyticsReportService');

function createWriterSalesLandingReportHandler({ db, reportService = getSalesLandingWriterReport }) {
  if (!db || typeof db.query !== 'function') {
    throw new Error('REPORT_DB_REQUIRED');
  }
  if (typeof reportService !== 'function') {
    throw new Error('REPORT_SERVICE_REQUIRED');
  }

  return async function writerSalesLandingReport(req, res) {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ ok: false, code: 'UNAUTHENTICATED' });
    }

    const pageId = req.params && req.params.pageId;
    const from = req.query && req.query.from;
    const to = req.query && req.query.to;

    try {
      const report = await reportService({
        db,
        writerId: req.user.id,
        pageId,
        from,
        to
      });

      return res.status(200).json({ ok: true, report });
    } catch (error) {
      const code = error && error.message;

      if (code === 'REPORT_PAGE_NOT_OWNED') {
        return res.status(404).json({ ok: false, code: 'PAGE_NOT_FOUND' });
      }

      if (
        code === 'INVALID_REPORT_ID' ||
        code === 'INVALID_REPORT_DATE' ||
        code === 'INVALID_REPORT_RANGE'
      ) {
        return res.status(400).json({ ok: false, code: 'INVALID_REPORT_REQUEST' });
      }

      return res.status(503).json({ ok: false, code: 'REPORT_UNAVAILABLE' });
    }
  };
}

module.exports = { createWriterSalesLandingReportHandler };