const pool = require('../../config/db');

function parseFeaturesJson(value) {
  if (!value) return null;

  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

async function getPlanAllowedWebsiteTemplates(planId) {
  const [rows] = await pool.query(
    `
    SELECT
      pat.website_template_id AS id,
      wt.name,
      wt.slug,
      wt.preview_image,
      wt.template_code_key,
      wt.description,
      wt.is_premium,
      wt.status,
      wt.created_at,
      wt.updated_at
    FROM plan_allowed_website_templates pat
    INNER JOIN website_templates wt
      ON wt.id = pat.website_template_id
    WHERE pat.plan_id = ?
    ORDER BY pat.id ASC
    `,
    [planId]
  );

  return rows.map((row) => ({
    id: row.id,
    type: 'website',
    name: row.name,
    slug: row.slug,
    preview_image: row.preview_image,
    template_code_key: row.template_code_key,
    description: row.description,
    is_premium: !!row.is_premium,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

async function getPlanAllowedBlogTemplates(planId) {
  const [rows] = await pool.query(
    `
    SELECT
      pat.blog_template_id AS id,
      bt.name,
      bt.slug,
      bt.preview_image,
      bt.template_code_key,
      bt.description,
      bt.is_premium,
      bt.status,
      bt.created_at,
      bt.updated_at
    FROM plan_allowed_blog_templates pat
    INNER JOIN blog_templates bt
      ON bt.id = pat.blog_template_id
    WHERE pat.plan_id = ?
    ORDER BY pat.id ASC
    `,
    [planId]
  );

  return rows.map((row) => ({
    id: row.id,
    type: 'blog',
    name: row.name,
    slug: row.slug,
    preview_image: row.preview_image,
    template_code_key: row.template_code_key,
    description: row.description,
    is_premium: !!row.is_premium,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

async function sanitizePlan(row) {
  if (!row) return null;

  const allowedWebsiteTemplates = await getPlanAllowedWebsiteTemplates(row.plan_id || row.id);
  const allowedBlogTemplates = await getPlanAllowedBlogTemplates(row.plan_id || row.id);

  return {
    id: row.plan_id || row.id,
    name: row.plan_name || row.name,
    price: (row.plan_price ?? row.price) !== null ? Number(row.plan_price ?? row.price) : null,
    billing_cycle: row.billing_cycle,
    product_limit: row.product_limit,
    post_limit: row.post_limit,
    website_limit: row.website_limit,
    slider_limit: row.slider_limit,
    menu_limit: row.menu_limit,
    premium_templates_only: !!row.premium_templates_only,
    allow_external_links: !!row.allow_external_links,
    website_templates_mode: row.website_templates_mode || 'unlimited',
    blog_templates_mode: row.blog_templates_mode || 'unlimited',
    allowed_website_templates: allowedWebsiteTemplates,
    allowed_blog_templates: allowedBlogTemplates,
    allowed_website_template_ids: allowedWebsiteTemplates.map((item) => item.id),
    allowed_blog_template_ids: allowedBlogTemplates.map((item) => item.id),
    features_json: parseFeaturesJson(row.features_json),
    status: row.plan_status || row.status,
  };
}

async function sanitizeSubscription(row) {
  if (!row) return null;

  return {
    id: row.subscription_id,
    user_id: row.user_id,
    plan_id: row.plan_id,
    trial_start: row.trial_start,
    trial_end: row.trial_end,
    start_date: row.start_date,
    end_date: row.end_date,
    status: row.subscription_status,
    amount_paid: row.amount_paid !== null ? Number(row.amount_paid) : null,
    created_at: row.subscription_created_at,
    updated_at: row.subscription_updated_at,
    plan: await sanitizePlan(row),
  };
}

async function getLatestSubscriptionByUserId(userId) {
  const [rows] = await pool.query(
    `
    SELECT
      s.id AS subscription_id,
      s.user_id,
      s.plan_id,
      s.trial_start,
      s.trial_end,
      s.start_date,
      s.end_date,
      s.status AS subscription_status,
      s.amount_paid,
      s.created_at AS subscription_created_at,
      s.updated_at AS subscription_updated_at,

      p.name AS plan_name,
      p.price AS plan_price,
      p.billing_cycle,
      p.product_limit,
      p.post_limit,
      p.website_limit,
      p.slider_limit,
      p.menu_limit,
      p.premium_templates_only,
      p.allow_external_links,
      p.website_templates_mode,
      p.blog_templates_mode,
      p.features_json,
      p.status AS plan_status

    FROM affiliate_subscriptions s
    INNER JOIN subscription_plans p
      ON p.id = s.plan_id
    WHERE s.user_id = ?
    ORDER BY s.id DESC
    LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}

async function getAllActivePlans() {
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
      allow_external_links,
      website_templates_mode,
      blog_templates_mode,
      features_json,
      status
    FROM subscription_plans
    WHERE status = 'active'
    ORDER BY price ASC, id ASC
    `
  );

  return Promise.all(rows.map((row) => sanitizePlan(row)));
}

async function getSubscriptionHistoryByUserId(userId) {
  const [rows] = await pool.query(
    `
    SELECT
      s.id AS subscription_id,
      s.user_id,
      s.plan_id,
      s.trial_start,
      s.trial_end,
      s.start_date,
      s.end_date,
      s.status AS subscription_status,
      s.amount_paid,
      s.created_at AS subscription_created_at,
      s.updated_at AS subscription_updated_at,

      p.name AS plan_name,
      p.price AS plan_price,
      p.billing_cycle,
      p.product_limit,
      p.post_limit,
      p.website_limit,
      p.slider_limit,
      p.menu_limit,
      p.premium_templates_only,
      p.allow_external_links,
      p.website_templates_mode,
      p.blog_templates_mode,
      p.features_json,
      p.status AS plan_status

    FROM affiliate_subscriptions s
    INNER JOIN subscription_plans p
      ON p.id = s.plan_id
    WHERE s.user_id = ?
    ORDER BY s.id DESC
    `,
    [userId]
  );

  return Promise.all(rows.map((row) => sanitizeSubscription(row)));
}

async function getMySubscriptionOverview(req, res) {
  try {
    const userId = req.user.id;
    const currentSubscriptionRow = await getLatestSubscriptionByUserId(userId);
    const availablePlans = await getAllActivePlans();

    return res.status(200).json({
      ok: true,
      current_subscription: currentSubscriptionRow
        ? await sanitizeSubscription(currentSubscriptionRow)
        : null,
      available_plans: availablePlans,
    });
  } catch (error) {
    console.error('getMySubscriptionOverview error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch subscription overview',
      error: error.message,
    });
  }
}

async function getMySubscriptionHistory(req, res) {
  try {
    const userId = req.user.id;
    const history = await getSubscriptionHistoryByUserId(userId);

    return res.status(200).json({
      ok: true,
      subscriptions: history,
    });
  } catch (error) {
    console.error('getMySubscriptionHistory error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch subscription history',
      error: error.message,
    });
  }
}

async function getAvailablePlans(req, res) {
  try {
    const availablePlans = await getAllActivePlans();

    return res.status(200).json({
      ok: true,
      plans: availablePlans,
    });
  } catch (error) {
    console.error('getAvailablePlans error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch available plans',
      error: error.message,
    });
  }
}

async function startFreeTrial(req, res) {
  try {
    const userId = req.user.id;

    const existingSubscription = await getLatestSubscriptionByUserId(userId);

    if (existingSubscription) {
      return res.status(400).json({
        ok: false,
        message: 'Subscription already exists for this affiliate',
      });
    }

    const [starterPlans] = await pool.query(
      `
      SELECT
        id,
        name,
        price,
        features_json
      FROM subscription_plans
      WHERE status = 'active'
      ORDER BY price ASC, id ASC
      LIMIT 1
      `
    );

    if (!starterPlans.length) {
      return res.status(404).json({
        ok: false,
        message: 'No active subscription plan found',
      });
    }

    const selectedPlan = starterPlans[0];
    const features = parseFeaturesJson(selectedPlan.features_json);
    const trialDays = Number(features?.trial_days || 30);

    await pool.query(
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

    const createdSubscription = await getLatestSubscriptionByUserId(userId);

    return res.status(201).json({
      ok: true,
      message: 'Free trial started successfully',
      subscription: await sanitizeSubscription(createdSubscription),
    });
  } catch (error) {
    console.error('startFreeTrial error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to start free trial',
      error: error.message,
    });
  }
}

async function requestPlanChange(req, res) {
  try {
    const userId = req.user.id;
    const { plan_id } = req.body;

    const planId = Number(plan_id);

    if (!Number.isInteger(planId) || planId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Valid plan id is required',
      });
    }

    const [plans] = await pool.query(
      `
      SELECT
        id,
        name,
        price,
        billing_cycle,
        status
      FROM subscription_plans
      WHERE id = ?
      LIMIT 1
      `,
      [planId]
    );

    if (!plans.length || plans[0].status !== 'active') {
      return res.status(404).json({
        ok: false,
        message: 'Selected plan not found or inactive',
      });
    }

    const currentSubscription = await getLatestSubscriptionByUserId(userId);

    if (!currentSubscription) {
      return res.status(400).json({
        ok: false,
        message: 'Start free trial first before changing plan',
      });
    }

    await pool.query(
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
      [userId, planId, Number(plans[0].price || 0)]
    );

    const updatedSubscription = await getLatestSubscriptionByUserId(userId);

    return res.status(201).json({
      ok: true,
      message: 'Plan changed successfully',
      subscription: await sanitizeSubscription(updatedSubscription),
    });
  } catch (error) {
    console.error('requestPlanChange error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to change subscription plan',
      error: error.message,
    });
  }
}

module.exports = {
  getMySubscriptionOverview,
  getMySubscriptionHistory,
  getAvailablePlans,
  startFreeTrial,
  requestPlanChange,
};