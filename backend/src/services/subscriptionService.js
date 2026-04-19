const pool = require('../config/db');

function parseFeaturesJson(value) {
  if (!value) return null;

  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function sanitizePlan(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    price: row.price !== null ? Number(row.price) : null,
    billing_cycle: row.billing_cycle,
    product_limit: row.product_limit,
    post_limit: row.post_limit,
    website_limit: row.website_limit,
    slider_limit: row.slider_limit,
    menu_limit: row.menu_limit,
    premium_templates_only: !!row.premium_templates_only,
    features_json: parseFeaturesJson(row.features_json),
    status: row.status,
  };
}

function sanitizeSubscription(row) {
  if (!row) return null;

  return {
    id: row.id,
    user_id: row.user_id,
    plan_id: row.plan_id,
    trial_start: row.trial_start,
    trial_end: row.trial_end,
    start_date: row.start_date,
    end_date: row.end_date,
    status: row.status,
    amount_paid: row.amount_paid !== null ? Number(row.amount_paid) : null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    plan: row.plan_id
      ? {
          id: row.plan_id,
          name: row.plan_name,
          price: row.plan_price !== null ? Number(row.plan_price) : null,
          billing_cycle: row.billing_cycle,
          product_limit: row.product_limit,
          post_limit: row.post_limit,
          website_limit: row.website_limit,
          slider_limit: row.slider_limit,
          menu_limit: row.menu_limit,
          premium_templates_only: !!row.premium_templates_only,
          features_json: parseFeaturesJson(row.features_json),
          status: row.plan_status,
        }
      : null,
  };
}

async function getPlanById(planId) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      price,
      billing_cycle,
      product_limit,
      post_limit,
      website_limit,
      slider_limit,
      menu_limit,
      premium_templates_only,
      features_json,
      status
    FROM subscription_plans
    WHERE id = ?
    LIMIT 1
    `,
    [planId]
  );

  return rows[0] ? sanitizePlan(rows[0]) : null;
}

async function getActivePlans() {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      price,
      billing_cycle,
      product_limit,
      post_limit,
      website_limit,
      slider_limit,
      menu_limit,
      premium_templates_only,
      features_json,
      status
    FROM subscription_plans
    WHERE status = 'active'
    ORDER BY price ASC, id ASC
    `
  );

  return rows.map(sanitizePlan);
}

async function getLatestSubscriptionByUserId(userId) {
  const [rows] = await pool.query(
    `
    SELECT
      s.id,
      s.user_id,
      s.plan_id,
      s.trial_start,
      s.trial_end,
      s.start_date,
      s.end_date,
      s.status,
      s.amount_paid,
      s.created_at,
      s.updated_at,

      p.name AS plan_name,
      p.price AS plan_price,
      p.billing_cycle,
      p.product_limit,
      p.post_limit,
      p.website_limit,
      p.slider_limit,
      p.menu_limit,
      p.premium_templates_only,
      p.features_json,
      p.status AS plan_status
    FROM affiliate_subscriptions s
    LEFT JOIN subscription_plans p
      ON p.id = s.plan_id
    WHERE s.user_id = ?
    ORDER BY s.id DESC
    LIMIT 1
    `,
    [userId]
  );

  return rows[0] ? sanitizeSubscription(rows[0]) : null;
}

async function getSubscriptionHistoryByUserId(userId) {
  const [rows] = await pool.query(
    `
    SELECT
      s.id,
      s.user_id,
      s.plan_id,
      s.trial_start,
      s.trial_end,
      s.start_date,
      s.end_date,
      s.status,
      s.amount_paid,
      s.created_at,
      s.updated_at,

      p.name AS plan_name,
      p.price AS plan_price,
      p.billing_cycle,
      p.product_limit,
      p.post_limit,
      p.website_limit,
      p.slider_limit,
      p.menu_limit,
      p.premium_templates_only,
      p.features_json,
      p.status AS plan_status
    FROM affiliate_subscriptions s
    LEFT JOIN subscription_plans p
      ON p.id = s.plan_id
    WHERE s.user_id = ?
    ORDER BY s.id DESC
    `,
    [userId]
  );

  return rows.map(sanitizeSubscription);
}

async function hasAnySubscription(userId) {
  const [rows] = await pool.query(
    `
    SELECT id
    FROM affiliate_subscriptions
    WHERE user_id = ?
    LIMIT 1
    `,
    [userId]
  );

  return rows.length > 0;
}

async function startFreeTrialForUser(userId, planId = null) {
  if (await hasAnySubscription(userId)) {
    const error = new Error('Subscription already exists for this affiliate');
    error.status = 400;
    throw error;
  }

  let selectedPlan = null;

  if (planId) {
    selectedPlan = await getPlanById(planId);
    if (!selectedPlan || selectedPlan.status !== 'active') {
      const error = new Error('Selected plan not found or inactive');
      error.status = 404;
      throw error;
    }
  } else {
    const plans = await getActivePlans();
    selectedPlan = plans[0] || null;

    if (!selectedPlan) {
      const error = new Error('No active subscription plan found');
      error.status = 404;
      throw error;
    }
  }

  const trialDays = Number(selectedPlan.features_json?.trial_days || 30);

  const [result] = await pool.query(
    `
    INSERT INTO affiliate_subscriptions
    (
      user_id,
      plan_id,
      trial_start,
      trial_end,
      start_date,
      end_date,
      status,
      amount_paid,
      created_at,
      updated_at
    )
    VALUES
    (
      ?,
      ?,
      NOW(),
      DATE_ADD(NOW(), INTERVAL ? DAY),
      NULL,
      NULL,
      'trial',
      0,
      NOW(),
      NOW()
    )
    `,
    [userId, selectedPlan.id, trialDays]
  );

  return {
    insertId: result.insertId,
    subscription: await getLatestSubscriptionByUserId(userId),
  };
}

async function activateYearlyPlanForUser(userId, planId) {
  const selectedPlan = await getPlanById(planId);

  if (!selectedPlan || selectedPlan.status !== 'active') {
    const error = new Error('Selected plan not found or inactive');
    error.status = 404;
    throw error;
  }

  const [result] = await pool.query(
    `
    INSERT INTO affiliate_subscriptions
    (
      user_id,
      plan_id,
      trial_start,
      trial_end,
      start_date,
      end_date,
      status,
      amount_paid,
      created_at,
      updated_at
    )
    VALUES
    (
      ?,
      ?,
      NULL,
      NULL,
      NOW(),
      DATE_ADD(NOW(), INTERVAL 1 YEAR),
      'active',
      ?,
      NOW(),
      NOW()
    )
    `,
    [userId, selectedPlan.id, Number(selectedPlan.price || 0)]
  );

  return {
    insertId: result.insertId,
    subscription: await getLatestSubscriptionByUserId(userId),
  };
}

module.exports = {
  getPlanById,
  getActivePlans,
  getLatestSubscriptionByUserId,
  getSubscriptionHistoryByUserId,
  hasAnySubscription,
  startFreeTrialForUser,
  activateYearlyPlanForUser,
};