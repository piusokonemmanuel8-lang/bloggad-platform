const pool = require('../../config/db');
const {
  positiveInt,
  sanitizePlan,
} = require('../../services/webinarSubscriptionService');

function sendError(res, error, fallback) {
  const status = Number(error?.status || 500);
  const safeStatus =
    Number.isInteger(status) && status >= 400 && status <= 599
      ? status
      : 500;

  return res.status(safeStatus).json({
    ok: false,
    message: error?.message || fallback,
  });
}

function normalizePlanInput(body, existing = null) {
  const source = body || {};
  const current = existing || {};

  const planKey = String(
    source.plan_key ?? current.plan_key ?? ''
  )
    .trim()
    .toLowerCase();

  const name = String(source.name ?? current.name ?? '').trim();
  const price = Number(source.price_usd ?? current.price_usd);
  const billingCycle = String(
    source.billing_cycle ?? current.billing_cycle ?? 'monthly'
  )
    .trim()
    .toLowerCase();
  const status = String(source.status ?? current.status ?? 'inactive')
    .trim()
    .toLowerCase();
  const sortOrder = Number(source.sort_order ?? current.sort_order ?? 0);
  const ticketPlatformFeePercent = Number(
    source.ticket_platform_fee_percent ??
      current.ticket_platform_fee_percent ??
      0
  );

  if (!/^[a-z0-9][a-z0-9_-]{1,78}[a-z0-9]$/.test(planKey)) {
    const error = new Error(
      'plan_key must use lowercase letters, numbers, hyphens, or underscores.'
    );
    error.status = 400;
    throw error;
  }

  if (!name || name.length > 120) {
    const error = new Error('Valid webinar plan name is required.');
    error.status = 400;
    throw error;
  }

  if (!Number.isFinite(price) || price < 0 || price > 99999999) {
    const error = new Error('Valid webinar plan price_usd is required.');
    error.status = 400;
    throw error;
  }

  if (!['monthly', 'yearly'].includes(billingCycle)) {
    const error = new Error(
      'billing_cycle must be monthly or yearly.'
    );
    error.status = 400;
    throw error;
  }

  if (!['active', 'inactive'].includes(status)) {
    const error = new Error('status must be active or inactive.');
    error.status = 400;
    throw error;
  }

  if (!Number.isSafeInteger(sortOrder)) {
    const error = new Error('sort_order must be an integer.');
    error.status = 400;
    throw error;
  }

  if (
    !Number.isFinite(ticketPlatformFeePercent) ||
    ticketPlatformFeePercent < 0 ||
    ticketPlatformFeePercent > 100
  ) {
    const error = new Error(
      'ticket_platform_fee_percent must be between 0 and 100.'
    );
    error.status = 400;
    throw error;
  }

  function optionalPositive(field) {
    const raw = source[field] ?? current[field];

    if (raw === null || raw === undefined || raw === '') return null;

    const number = Number(raw);

    if (!Number.isSafeInteger(number) || number <= 0) {
      const error = new Error(`${field} must be a positive integer or null.`);
      error.status = 400;
      throw error;
    }

    return number;
  }

  let features = source.features ?? source.features_json ?? current.features_json;

  if (features === null || features === undefined || features === '') {
    features = null;
  } else if (typeof features === 'string') {
    try {
      features = JSON.parse(features);
    } catch {
      const error = new Error('features must be valid JSON.');
      error.status = 400;
      throw error;
    }
  }

  if (
    features !== null &&
    (typeof features !== 'object' || Array.isArray(features))
  ) {
    const error = new Error('features must be a JSON object.');
    error.status = 400;
    throw error;
  }

  return {
    plan_key: planKey,
    name,
    price_usd: price.toFixed(2),
    billing_cycle: billingCycle,
    bandwidth_limit_bytes: optionalPositive('bandwidth_limit_bytes'),
    storage_limit_bytes: optionalPositive('storage_limit_bytes'),
    max_webinars: optionalPositive('max_webinars'),
    max_concurrent_attendees: optionalPositive(
      'max_concurrent_attendees'
    ),
    monthly_playback_seconds_limit: optionalPositive(
      'monthly_playback_seconds_limit'
    ),
    max_video_duration_seconds: optionalPositive(
      'max_video_duration_seconds'
    ),
    ticket_platform_fee_percent: ticketPlatformFeePercent.toFixed(2),
    features_json: features ? JSON.stringify(features) : null,
    status,
    sort_order: sortOrder,
  };
}

async function getAllPlans(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM webinar_subscription_plans
      ORDER BY sort_order ASC, id ASC
    `);

    return res.status(200).json({
      ok: true,
      plans: rows.map(sanitizePlan),
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load webinar plans.');
  }
}

async function getSinglePlan(req, res) {
  try {
    const id = positiveInt(req.params.id);

    if (!id) {
      return res.status(400).json({
        ok: false,
        message: 'Valid webinar plan id is required.',
      });
    }

    const [rows] = await pool.query(
      `
      SELECT *
      FROM webinar_subscription_plans
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!rows[0]) {
      return res.status(404).json({
        ok: false,
        message: 'Webinar plan not found.',
      });
    }

    return res.status(200).json({
      ok: true,
      plan: sanitizePlan(rows[0]),
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load webinar plan.');
  }
}

async function createPlan(req, res) {
  try {
    const plan = normalizePlanInput(req.body);

    const [result] = await pool.query(
      `
      INSERT INTO webinar_subscription_plans (
        plan_key,
        name,
        price_usd,
        billing_cycle,
        bandwidth_limit_bytes,
        storage_limit_bytes,
        max_webinars,
        max_concurrent_attendees,
        monthly_playback_seconds_limit,
        max_video_duration_seconds,
        ticket_platform_fee_percent,
        features_json,
        status,
        sort_order,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        plan.plan_key,
        plan.name,
        plan.price_usd,
        plan.billing_cycle,
        plan.bandwidth_limit_bytes,
        plan.storage_limit_bytes,
        plan.max_webinars,
        plan.max_concurrent_attendees,
        plan.monthly_playback_seconds_limit,
        plan.max_video_duration_seconds,
        plan.ticket_platform_fee_percent,
        plan.features_json,
        plan.status,
        plan.sort_order,
      ]
    );

    req.params.id = String(result.insertId);
    return getSinglePlan(req, res);
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') {
      error.status = 409;
      error.message = 'A webinar plan with this plan_key already exists.';
    }

    return sendError(res, error, 'Failed to create webinar plan.');
  }
}

async function updatePlan(req, res) {
  try {
    const id = positiveInt(req.params.id);

    if (!id) {
      const error = new Error('Valid webinar plan id is required.');
      error.status = 400;
      throw error;
    }

    const [rows] = await pool.query(
      `
      SELECT *
      FROM webinar_subscription_plans
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!rows[0]) {
      const error = new Error('Webinar plan not found.');
      error.status = 404;
      throw error;
    }

    const plan = normalizePlanInput(req.body, rows[0]);

    await pool.query(
      `
      UPDATE webinar_subscription_plans
      SET
        plan_key = ?,
        name = ?,
        price_usd = ?,
        billing_cycle = ?,
        bandwidth_limit_bytes = ?,
        storage_limit_bytes = ?,
        max_webinars = ?,
        max_concurrent_attendees = ?,
        monthly_playback_seconds_limit = ?,
        max_video_duration_seconds = ?,
        ticket_platform_fee_percent = ?,
        features_json = ?,
        status = ?,
        sort_order = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        plan.plan_key,
        plan.name,
        plan.price_usd,
        plan.billing_cycle,
        plan.bandwidth_limit_bytes,
        plan.storage_limit_bytes,
        plan.max_webinars,
        plan.max_concurrent_attendees,
        plan.monthly_playback_seconds_limit,
        plan.max_video_duration_seconds,
        plan.ticket_platform_fee_percent,
        plan.features_json,
        plan.status,
        plan.sort_order,
        id,
      ]
    );

    return getSinglePlan(req, res);
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') {
      error.status = 409;
      error.message = 'A webinar plan with this plan_key already exists.';
    }

    return sendError(res, error, 'Failed to update webinar plan.');
  }
}

async function updatePlanStatus(req, res) {
  try {
    const id = positiveInt(req.params.id);
    const status = String(req.body?.status || '').trim().toLowerCase();

    if (!id || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        ok: false,
        message: 'Valid plan id and active/inactive status are required.',
      });
    }

    const [result] = await pool.query(
      `
      UPDATE webinar_subscription_plans
      SET status = ?, updated_at = NOW()
      WHERE id = ?
      `,
      [status, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        ok: false,
        message: 'Webinar plan not found.',
      });
    }

    req.params.id = String(id);
    return getSinglePlan(req, res);
  } catch (error) {
    return sendError(
      res,
      error,
      'Failed to update webinar plan status.'
    );
  }
}

module.exports = {
  getAllPlans,
  getSinglePlan,
  createPlan,
  updatePlan,
  updatePlanStatus,
};
