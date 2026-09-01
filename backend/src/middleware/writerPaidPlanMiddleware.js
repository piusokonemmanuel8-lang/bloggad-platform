const {
  getCurrentPaidWriterSubscription,
} = require('../services/writerReaderAccessService');

async function paidWriterOnly(req, res, next) {
  try {
    const userId = req.user?.id || req.user?.user_id || null;

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Not authorized.',
      });
    }

    const paidPlan = await getCurrentPaidWriterSubscription(userId);

    if (!paidPlan) {
      return res.status(403).json({
        ok: false,
        message: 'An active paid Writer plan is required for advertising tools.',
      });
    }

    req.paidWriterPlan = paidPlan;
    return next();
  } catch (error) {
    console.error('paidWriterOnly error:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Unable to verify Writer plan access.',
    });
  }
}

module.exports = {
  paidWriterOnly,
};
