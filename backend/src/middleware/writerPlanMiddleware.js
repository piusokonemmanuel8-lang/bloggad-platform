const {
  getCurrentPaidWriterSubscription,
} = require('../services/writerReaderAccessService');

async function requireActivePaidWriterPlan(req, res, next) {
  try {
    if (req.user?.role === 'admin') {
      return next();
    }

    const writerUserId = Number(req.user?.id || 0);

    if (!Number.isInteger(writerUserId) || writerUserId <= 0) {
      return res.status(401).json({
        ok: false,
        code: 'WRITER_AUTH_REQUIRED',
        message: 'Writer authentication is required.',
      });
    }

    const plan = await getCurrentPaidWriterSubscription(writerUserId);

    if (!plan) {
      return res.status(403).json({
        ok: false,
        code: 'WRITER_PAID_PLAN_REQUIRED',
        message:
          'An active paid Writer plan is required for Storefront and Store tools.',
        upgrade_url: '/writer/plan',
      });
    }

    req.writerPlan = plan;
    return next();
  } catch (error) {
    console.error('requireActivePaidWriterPlan error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Unable to verify Writer plan access.',
    });
  }
}

module.exports = {
  requireActivePaidWriterPlan,
};