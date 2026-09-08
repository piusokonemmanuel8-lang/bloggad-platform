const pool = require('../config/db');
const {
  positiveInt,
  getCurrentWebinarSubscription,
  countWriterWebinars,
} = require('./webinarSubscriptionService');

function nonNegativeInt(value, fallback = 0) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : fallback;
}

function signedSafeInt(value, fallback = 0) {
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : fallback;
}

function percent(used, limit) {
  if (limit === null || limit === undefined) return null;
  if (Number(limit) <= 0) return 100;
  return Math.min(100, Number(((Number(used) / Number(limit)) * 100).toFixed(2)));
}

function remaining(used, limit) {
  if (limit === null || limit === undefined) return null;
  return Math.max(0, Number(limit) - Number(used));
}

function sanitizeUsage(row) {
  if (!row) return null;

  return {
    id: Number(row.id),
    subscription_id: Number(row.subscription_id),
    writer_user_id: Number(row.writer_user_id),
    period_start: row.period_start,
    period_end: row.period_end,
    bandwidth_bytes: Number(row.bandwidth_bytes || 0),
    storage_bytes: Number(row.storage_bytes || 0),
    playback_seconds: Number(row.playback_seconds || 0),
    viewer_sessions: Number(row.viewer_sessions || 0),
    bandwidth_limit_reached_at: row.bandwidth_limit_reached_at || null,
    storage_limit_reached_at: row.storage_limit_reached_at || null,
    updated_at: row.updated_at,
  };
}

async function ensureUsagePeriod(subscription, connection = pool) {
  if (!subscription) return null;

  await connection.query(
    `
    INSERT INTO webinar_usage_periods (
      subscription_id,
      writer_user_id,
      period_start,
      period_end,
      bandwidth_bytes,
      storage_bytes,
      playback_seconds,
      viewer_sessions,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, 0, 0, 0, 0, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      period_end = VALUES(period_end),
      updated_at = NOW()
    `,
    [
      subscription.id,
      subscription.writer_user_id,
      subscription.current_period_start,
      subscription.current_period_end,
    ]
  );

  const [rows] = await connection.query(
    `
    SELECT *
    FROM webinar_usage_periods
    WHERE subscription_id = ?
      AND period_start = ?
    LIMIT 1
    `,
    [subscription.id, subscription.current_period_start]
  );

  return sanitizeUsage(rows[0] || null);
}

async function getWebinarSubscriptionOverview(writerUserId) {
  const cleanWriterUserId = positiveInt(writerUserId);

  if (!cleanWriterUserId) {
    const error = new Error('Valid Writer user id is required.');
    error.status = 400;
    throw error;
  }

  const subscription = await getCurrentWebinarSubscription(cleanWriterUserId);

  if (!subscription) {
    return {
      subscription: null,
      usage: null,
      entitlement: {
        can_create: false,
        can_upload: false,
        can_stream: false,
        reason: 'subscription_required',
      },
    };
  }

  const usage = await ensureUsagePeriod(subscription);
  const plan = subscription.plan;
  const webinarCount = await countWriterWebinars(cleanWriterUserId);

  const bandwidthExceeded =
    plan.bandwidth_limit_bytes !== null &&
    usage.bandwidth_bytes >= plan.bandwidth_limit_bytes;

  const storageExceeded =
    plan.storage_limit_bytes !== null &&
    usage.storage_bytes >= plan.storage_limit_bytes;

  const webinarCountExceeded =
    plan.max_webinars !== null &&
    webinarCount >= plan.max_webinars;

  let reason = null;

  if (bandwidthExceeded) reason = 'bandwidth_limit_reached';
  else if (storageExceeded) reason = 'storage_limit_reached';
  else if (webinarCountExceeded) reason = 'webinar_limit_reached';

  return {
    subscription,
    usage: {
      ...usage,
      webinar_count: webinarCount,
      limits: {
        bandwidth_bytes: plan.bandwidth_limit_bytes,
        storage_bytes: plan.storage_limit_bytes,
        max_webinars: plan.max_webinars,
        max_video_duration_seconds: plan.max_video_duration_seconds,
      },
      remaining: {
        bandwidth_bytes: remaining(
          usage.bandwidth_bytes,
          plan.bandwidth_limit_bytes
        ),
        storage_bytes: remaining(
          usage.storage_bytes,
          plan.storage_limit_bytes
        ),
        webinars:
          plan.max_webinars === null
            ? null
            : Math.max(0, plan.max_webinars - webinarCount),
      },
      percent_used: {
        bandwidth: percent(
          usage.bandwidth_bytes,
          plan.bandwidth_limit_bytes
        ),
        storage: percent(
          usage.storage_bytes,
          plan.storage_limit_bytes
        ),
        webinars: percent(webinarCount, plan.max_webinars),
      },
    },
    entitlement: {
      can_create: !storageExceeded && !webinarCountExceeded,
      can_upload: !storageExceeded,
      can_stream: !bandwidthExceeded,
      reason,
    },
  };
}

async function assertWebinarEntitlement(
  writerUserId,
  capability = 'stream'
) {
  const overview = await getWebinarSubscriptionOverview(writerUserId);
  const key = `can_${capability}`;

  if (!overview.entitlement[key]) {
    const error = new Error(
      overview.entitlement.reason === 'subscription_required'
        ? 'An active webinar subscription is required.'
        : 'The webinar subscription usage limit has been reached.'
    );

    error.status = 403;
    error.code =
      overview.entitlement.reason === 'subscription_required'
        ? 'WEBINAR_SUBSCRIPTION_REQUIRED'
        : 'WEBINAR_USAGE_LIMIT_REACHED';
    error.entitlement = overview.entitlement;
    throw error;
  }

  return overview;
}

async function recordWebinarUsage({
  writerUserId,
  usageKey,
  eventType = 'mixed',
  bandwidthBytes = 0,
  storageBytesDelta = 0,
  playbackSeconds = 0,
  viewerSessions = 0,
  metadata = null,
}) {
  const cleanWriterUserId = positiveInt(writerUserId);
  const cleanUsageKey = String(usageKey || '').trim().slice(0, 190);

  if (!cleanWriterUserId || !cleanUsageKey) {
    const error = new Error('Valid Writer user id and usage key are required.');
    error.status = 400;
    throw error;
  }

  const cleanBandwidth = nonNegativeInt(bandwidthBytes);
  const cleanStorageDelta = signedSafeInt(storageBytesDelta);
  const cleanPlayback = nonNegativeInt(playbackSeconds);
  const cleanSessions = nonNegativeInt(viewerSessions);

  const allowedTypes = new Set([
    'bandwidth',
    'storage',
    'playback',
    'session',
    'mixed',
  ]);

  const cleanEventType = allowedTypes.has(String(eventType))
    ? String(eventType)
    : 'mixed';

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const subscription = await getCurrentWebinarSubscription(
      cleanWriterUserId,
      {
        connection,
        forUpdate: true,
      }
    );

    if (!subscription) {
      const error = new Error('An active webinar subscription is required.');
      error.status = 403;
      error.code = 'WEBINAR_SUBSCRIPTION_REQUIRED';
      throw error;
    }

    const usage = await ensureUsagePeriod(subscription, connection);

    const [existingRows] = await connection.query(
      `
      SELECT id
      FROM webinar_usage_events
      WHERE usage_key = ?
      LIMIT 1
      `,
      [cleanUsageKey]
    );

    if (existingRows[0]) {
      await connection.commit();
      return getWebinarSubscriptionOverview(cleanWriterUserId);
    }

    await connection.query(
      `
      INSERT INTO webinar_usage_events (
        usage_period_id,
        subscription_id,
        writer_user_id,
        usage_key,
        event_type,
        bandwidth_bytes_delta,
        storage_bytes_delta,
        playback_seconds_delta,
        viewer_sessions_delta,
        metadata_json,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        usage.id,
        subscription.id,
        cleanWriterUserId,
        cleanUsageKey,
        cleanEventType,
        cleanBandwidth,
        cleanStorageDelta,
        cleanPlayback,
        cleanSessions,
        metadata ? JSON.stringify(metadata) : null,
      ]
    );

    await connection.query(
      `
      UPDATE webinar_usage_periods
      SET
        bandwidth_bytes = bandwidth_bytes + ?,
        storage_bytes = GREATEST(0, storage_bytes + ?),
        playback_seconds = playback_seconds + ?,
        viewer_sessions = viewer_sessions + ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        cleanBandwidth,
        cleanStorageDelta,
        cleanPlayback,
        cleanSessions,
        usage.id,
      ]
    );

    const [updatedRows] = await connection.query(
      `
      SELECT *
      FROM webinar_usage_periods
      WHERE id = ?
      LIMIT 1
      `,
      [usage.id]
    );

    const updated = sanitizeUsage(updatedRows[0] || null);
    const plan = subscription.plan;

    const bandwidthReached =
      plan.bandwidth_limit_bytes !== null &&
      updated.bandwidth_bytes >= plan.bandwidth_limit_bytes;

    const storageReached =
      plan.storage_limit_bytes !== null &&
      updated.storage_bytes >= plan.storage_limit_bytes;

    if (bandwidthReached || storageReached) {
      await connection.query(
        `
        UPDATE webinar_usage_periods
        SET
          bandwidth_limit_reached_at = CASE
            WHEN ? = 1 THEN COALESCE(bandwidth_limit_reached_at, NOW())
            ELSE bandwidth_limit_reached_at
          END,
          storage_limit_reached_at = CASE
            WHEN ? = 1 THEN COALESCE(storage_limit_reached_at, NOW())
            ELSE storage_limit_reached_at
          END,
          updated_at = NOW()
        WHERE id = ?
        `,
        [bandwidthReached ? 1 : 0, storageReached ? 1 : 0, usage.id]
      );
    }

    await connection.commit();
    return getWebinarSubscriptionOverview(cleanWriterUserId);
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}

    if (error?.code === 'ER_DUP_ENTRY') {
      return getWebinarSubscriptionOverview(cleanWriterUserId);
    }

    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  ensureUsagePeriod,
  getWebinarSubscriptionOverview,
  assertWebinarEntitlement,
  recordWebinarUsage,
};
