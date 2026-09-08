const pool = require('../config/db');

function positiveInt(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function nullablePositiveInt(value) {
  if (value === null || value === undefined || value === '') return null;
  return positiveInt(value);
}

function moneyString(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return number.toFixed(2);
}

function parseFeatures(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function sanitizePlan(row) {
  if (!row) return null;

  return {
    id: Number(row.id),
    plan_key: row.plan_key,
    name: row.name,
    price_usd: moneyString(row.price_usd),
    billing_cycle: row.billing_cycle,
    bandwidth_limit_bytes:
      row.bandwidth_limit_bytes === null
        ? null
        : Number(row.bandwidth_limit_bytes),
    storage_limit_bytes:
      row.storage_limit_bytes === null
        ? null
        : Number(row.storage_limit_bytes),
    max_webinars:
      row.max_webinars === null ? null : Number(row.max_webinars),
    max_video_duration_seconds:
      row.max_video_duration_seconds === null
        ? null
        : Number(row.max_video_duration_seconds),
    features: parseFeatures(row.features_json),
    status: row.status,
    sort_order: Number(row.sort_order || 0),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function sanitizeSubscription(row) {
  if (!row) return null;

  return {
    id: Number(row.id),
    writer_user_id: Number(row.writer_user_id),
    plan_id: Number(row.plan_id),
    purchase_id: row.purchase_id ? Number(row.purchase_id) : null,
    status: row.status,
    current_period_start: row.current_period_start,
    current_period_end: row.current_period_end,
    amount_paid_usd: moneyString(row.amount_paid_usd),
    provider: row.provider || null,
    provider_reference: row.provider_reference || null,
    cancelled_at: row.cancelled_at || null,
    suspended_reason: row.suspended_reason || null,
    plan: row.plan_key
      ? sanitizePlan({
          id: row.plan_id,
          plan_key: row.plan_key,
          name: row.plan_name,
          price_usd: row.plan_price_usd,
          billing_cycle: row.plan_billing_cycle,
          bandwidth_limit_bytes: row.bandwidth_limit_bytes,
          storage_limit_bytes: row.storage_limit_bytes,
          max_webinars: row.max_webinars,
          max_video_duration_seconds: row.max_video_duration_seconds,
          features_json: row.features_json,
          status: row.plan_status,
          sort_order: row.plan_sort_order,
        })
      : null,
  };
}

async function listActiveWebinarPlans() {
  const [rows] = await pool.query(`
    SELECT *
    FROM webinar_subscription_plans
    WHERE status = 'active'
    ORDER BY sort_order ASC, price_usd ASC, id ASC
  `);

  return rows.map(sanitizePlan);
}

async function getWebinarPlanById(planId, { activeOnly = false } = {}) {
  const cleanPlanId = positiveInt(planId);

  if (!cleanPlanId) {
    const error = new Error('Valid webinar plan id is required.');
    error.status = 400;
    throw error;
  }

  const [rows] = await pool.query(
    `
    SELECT *
    FROM webinar_subscription_plans
    WHERE id = ?
      ${activeOnly ? "AND status = 'active'" : ''}
    LIMIT 1
    `,
    [cleanPlanId]
  );

  return sanitizePlan(rows[0] || null);
}

async function getCurrentWebinarSubscription(
  writerUserId,
  { connection = pool, forUpdate = false } = {}
) {
  const cleanWriterUserId = positiveInt(writerUserId);

  if (!cleanWriterUserId) {
    const error = new Error('Valid Writer user id is required.');
    error.status = 400;
    throw error;
  }

  const [rows] = await connection.query(
    `
    SELECT
      ws.*,
      p.plan_key,
      p.name AS plan_name,
      p.price_usd AS plan_price_usd,
      p.billing_cycle AS plan_billing_cycle,
      p.bandwidth_limit_bytes,
      p.storage_limit_bytes,
      p.max_webinars,
      p.max_video_duration_seconds,
      p.features_json,
      p.status AS plan_status,
      p.sort_order AS plan_sort_order
    FROM webinar_subscriptions ws
    INNER JOIN webinar_subscription_plans p
      ON p.id = ws.plan_id
    WHERE ws.writer_user_id = ?
      AND ws.status = 'active'
      AND ws.current_period_start <= NOW()
      AND ws.current_period_end > NOW()
    ORDER BY ws.current_period_end DESC, ws.id DESC
    LIMIT 1
    ${forUpdate ? 'FOR UPDATE' : ''}
    `,
    [cleanWriterUserId]
  );

  return sanitizeSubscription(rows[0] || null);
}

async function expireEndedWebinarSubscriptions(writerUserId = null) {
  const params = [];
  let writerFilter = '';

  if (writerUserId !== null && writerUserId !== undefined) {
    const cleanWriterUserId = positiveInt(writerUserId);

    if (!cleanWriterUserId) {
      const error = new Error('Valid Writer user id is required.');
      error.status = 400;
      throw error;
    }

    writerFilter = ' AND writer_user_id = ?';
    params.push(cleanWriterUserId);
  }

  const [result] = await pool.query(
    `
    UPDATE webinar_subscriptions
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active'
      AND current_period_end <= NOW()
      ${writerFilter}
    `,
    params
  );

  return Number(result.affectedRows || 0);
}

async function countWriterWebinars(writerUserId) {
  const cleanWriterUserId = positiveInt(writerUserId);

  if (!cleanWriterUserId) return 0;

  const [rows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM webinars
    WHERE user_id = ?
      AND status <> 'archived'
    `,
    [cleanWriterUserId]
  );

  return Number(rows[0]?.total || 0);
}

module.exports = {
  positiveInt,
  nullablePositiveInt,
  moneyString,
  sanitizePlan,
  sanitizeSubscription,
  listActiveWebinarPlans,
  getWebinarPlanById,
  getCurrentWebinarSubscription,
  expireEndedWebinarSubscriptions,
  countWriterWebinars,
};
