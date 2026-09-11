const pool = require('../config/db');

function positiveInt(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function normalizeAdjustment(value) {
  const number = Number(value);
  if (!Number.isInteger(number)) return null;
  return Math.max(-1000000000, Math.min(1000000000, number));
}

async function getWriterFollowerCounts(writerUserId, executor = pool) {
  const id = positiveInt(writerUserId);
  if (!id) return null;

  const [rows] = await executor.query(
    `SELECT u.id AS writer_user_id,
            COUNT(wf.id) AS real_follower_count,
            COALESCE(u.writer_follower_adjustment, 0) AS follower_adjustment,
            GREATEST(0, COUNT(wf.id) + COALESCE(u.writer_follower_adjustment, 0)) AS follower_count
       FROM users u
       LEFT JOIN writer_follows wf ON wf.writer_user_id = u.id
      WHERE u.id = ? AND u.role = 'affiliate'
      GROUP BY u.id, u.writer_follower_adjustment
      LIMIT 1`,
    [id]
  );

  const row = rows[0];
  if (!row) return null;
  return {
    writer_user_id: Number(row.writer_user_id),
    real_follower_count: Number(row.real_follower_count || 0),
    follower_adjustment: Number(row.follower_adjustment || 0),
    follower_count: Number(row.follower_count || 0),
  };
}

async function applyWriterFollowerAdjustment(writerUserId, adjustmentDelta, executor = pool) {
  const id = positiveInt(writerUserId);
  const delta = normalizeAdjustment(adjustmentDelta);
  if (!id || delta === null || delta === 0) return null;

  const [result] = await executor.query(
    `UPDATE users
        SET writer_follower_adjustment = GREATEST(
              -1000000000,
              LEAST(1000000000, COALESCE(writer_follower_adjustment, 0) + ?)
            ),
            updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND role = 'affiliate'`,
    [delta, id]
  );
  if (!result.affectedRows) return null;
  return getWriterFollowerCounts(id, executor);
}

module.exports = {
  getWriterFollowerCounts,
  applyWriterFollowerAdjustment,
};
