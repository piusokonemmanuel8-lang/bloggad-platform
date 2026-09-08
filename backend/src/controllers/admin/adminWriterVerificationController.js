const pool = require('../../config/db');
const {
  resolveWriterVerificationBadge,
} = require('../../services/writerVerificationBadgeService');

function toPositiveInt(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

async function getWriter(writerUserId, executor = pool) {
  const [rows] = await executor.query(
    `SELECT id, name, email, role, status
       FROM users
      WHERE id = ? AND role = 'affiliate'
      LIMIT 1`,
    [writerUserId]
  );
  return rows[0] || null;
}

async function getVerification(writerUserId, executor = pool) {
  const [rows] = await executor.query(
    `SELECT id, writer_user_id, badge_type, entity_type, legal_name, public_name,
            status, reviewed_by_user_id, reviewed_at, issued_at, created_at, updated_at
       FROM writer_identity_verifications
      WHERE writer_user_id = ?
      ORDER BY id DESC
      LIMIT 1`,
    [writerUserId]
  );
  return rows[0] || null;
}

async function hasGoldSubscription(writerUserId, executor = pool) {
  const [rows] = await executor.query(
    `SELECT s.id
       FROM affiliate_subscriptions s
       INNER JOIN subscription_plans p ON p.id = s.plan_id
      WHERE s.user_id = ?
        AND s.status = 'active'
        AND p.status = 'active'
        AND p.price >= 499
        AND (s.start_date IS NULL OR s.start_date <= NOW())
        AND (s.end_date IS NULL OR s.end_date > NOW())
      ORDER BY s.id DESC
      LIMIT 1`,
    [writerUserId]
  );
  return Boolean(rows[0]);
}

async function getWriterVerification(req, res) {
  try {
    const writerUserId = toPositiveInt(req.params.id);
    if (!writerUserId) {
      return res.status(400).json({ ok: false, message: 'Invalid writer id' });
    }

    const writer = await getWriter(writerUserId);
    if (!writer) {
      return res.status(404).json({ ok: false, message: 'Writer not found' });
    }

    const [verification, badge, goldEligible] = await Promise.all([
      getVerification(writerUserId),
      resolveWriterVerificationBadge(writerUserId),
      hasGoldSubscription(writerUserId),
    ]);

    return res.status(200).json({
      ok: true,
      writer,
      verification,
      badge,
      gold_eligible: goldEligible,
    });
  } catch (error) {
    console.error('getWriterVerification error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch writer verification',
      error: error.message,
    });
  }
}

async function updateWriterVerification(req, res) {
  const writerUserId = toPositiveInt(req.params.id);
  const action = String(req.body?.action || '').trim().toLowerCase();

  if (!writerUserId) {
    return res.status(400).json({ ok: false, message: 'Invalid writer id' });
  }
  if (!['gold', 'official', 'remove'].includes(action)) {
    return res.status(400).json({
      ok: false,
      message: 'Action must be gold, official or remove',
    });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const writer = await getWriter(writerUserId, connection);
    if (!writer) {
      await connection.rollback();
      return res.status(404).json({ ok: false, message: 'Writer not found' });
    }

    if (action === 'gold' && !(await hasGoldSubscription(writerUserId, connection))) {
      await connection.rollback();
      return res.status(409).json({
        ok: false,
        message: 'Gold verification requires an active $499 organization subscription',
      });
    }

    if (action === 'remove') {
      await connection.query(
        `UPDATE writer_identity_verifications
            SET status = 'revoked', reviewed_by_user_id = ?, reviewed_at = NOW(), updated_at = NOW()
          WHERE writer_user_id = ? AND status = 'approved'`,
        [req.user.id, writerUserId]
      );
    } else {
      const badgeType = action;
      const entityType = action === 'official' ? 'platform' : 'organization';
      const legalName = String(req.body?.legal_name || writer.name || '').trim();
      const publicName = String(req.body?.public_name || writer.name || '').trim();

      await connection.query(
        `INSERT INTO writer_identity_verifications
          (writer_user_id, badge_type, entity_type, legal_name, public_name, status,
           reviewed_by_user_id, reviewed_at, issued_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'approved', ?, NOW(), NOW(), NOW(), NOW())
         ON DUPLICATE KEY UPDATE
           badge_type = VALUES(badge_type),
           entity_type = VALUES(entity_type),
           legal_name = VALUES(legal_name),
           public_name = VALUES(public_name),
           status = 'approved',
           reviewed_by_user_id = VALUES(reviewed_by_user_id),
           reviewed_at = NOW(),
           issued_at = NOW(),
           updated_at = NOW()`,
        [writerUserId, badgeType, entityType, legalName, publicName, req.user.id]
      );
    }

    await connection.commit();
    const verification = await getVerification(writerUserId);
    const badge = await resolveWriterVerificationBadge(writerUserId);
    return res.status(200).json({
      ok: true,
      message: action === 'remove' ? 'Manual verification removed' : `${action} verification approved`,
      verification,
      badge,
    });
  } catch (error) {
    try { await connection.rollback(); } catch (_) {}
    console.error('updateWriterVerification error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to update writer verification',
      error: error.message,
    });
  } finally {
    connection.release();
  }
}

module.exports = {
  getWriterVerification,
  updateWriterVerification,
};