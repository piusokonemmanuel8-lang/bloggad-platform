const {
  getWriterFollowerCounts,
  applyWriterFollowerAdjustment,
} = require('../../services/writerFollowerCountService');

function validWriterId(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

async function getWriterFollowerAdjustment(req, res) {
  try {
    const writerId = validWriterId(req.params.id);
    if (!writerId) return res.status(400).json({ ok: false, message: 'Invalid Writer ID.' });
    const counts = await getWriterFollowerCounts(writerId);
    if (!counts) return res.status(404).json({ ok: false, message: 'Writer account not found.' });
    return res.json({ ok: true, counts });
  } catch (error) {
    console.error('getWriterFollowerAdjustment error:', error);
    return res.status(500).json({ ok: false, message: 'Failed to load Writer follower counts.' });
  }
}

async function updateWriterFollowerAdjustment(req, res) {
  try {
    const writerId = validWriterId(req.params.id);
    const adjustmentDelta = Number(req.body?.adjustment_delta);
    if (!writerId) return res.status(400).json({ ok: false, message: 'Invalid Writer ID.' });
    if (!Number.isInteger(adjustmentDelta) || adjustmentDelta === 0) {
      return res.status(400).json({ ok: false, message: 'Adjustment must be a non-zero whole number.' });
    }
    const counts = await applyWriterFollowerAdjustment(writerId, adjustmentDelta);
    if (!counts) return res.status(404).json({ ok: false, message: 'Writer account not found.' });
    return res.json({ ok: true, message: 'Writer follower adjustment updated.', counts });
  } catch (error) {
    console.error('updateWriterFollowerAdjustment error:', error);
    return res.status(500).json({ ok: false, message: 'Failed to update Writer follower adjustment.' });
  }
}

module.exports = {
  getWriterFollowerAdjustment,
  updateWriterFollowerAdjustment,
};
