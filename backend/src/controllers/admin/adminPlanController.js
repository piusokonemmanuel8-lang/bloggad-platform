const pool = require('../../config/db');

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
    features_json:
      typeof row.features_json === 'string'
        ? safeJsonParse(row.features_json)
        : row.features_json,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function safeJsonParse(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
}

function normalizeNullableNumber(value) {
  if (value === undefined || value === null || value === '') return null;

  const num = Number(value);
  if (!Number.isFinite(num)) return null;

  return num;
}

function normalizeLimit(value) {
  if (value === undefined || value === null || value === '') return null;

  const num = Number(value);
  if (!Number.isInteger(num) || num < 0) return null;

  return num;
}

function normalizeFeaturesJson(features) {
  if (features === undefined) return undefined;
  if (features === null || features === '') return null;

  if (typeof features === 'string') {
    try {
      JSON.parse(features);
      return features;
    } catch (error) {
      return JSON.stringify({ raw: features });
    }
  }

  try {
    return JSON.stringify(features);
  } catch (error) {
    return null;
  }
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
      status,
      created_at,
      updated_at
    FROM subscription_plans
    WHERE id = ?
    LIMIT 1
    `,
    [planId]
  );

  return rows[0] || null;
}

async function getAllPlans(req, res) {
  try {
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
        status,
        created_at,
        updated_at
      FROM subscription_plans
      ORDER BY price ASC, id ASC
      `
    );

    return res.status(200).json({
      ok: true,
      plans: rows.map(sanitizePlan),
    });
  } catch (error) {
    console.error('getAllPlans error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch plans',
      error: error.message,
    });
  }
}

async function getActivePlans(req, res) {
  try {
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
        status,
        created_at,
        updated_at
      FROM subscription_plans
      WHERE status = 'active'
      ORDER BY price ASC, id ASC
      `
    );

    return res.status(200).json({
      ok: true,
      plans: rows.map(sanitizePlan),
    });
  } catch (error) {
    console.error('getActivePlans error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch active plans',
      error: error.message,
    });
  }
}

async function getSinglePlan(req, res) {
  try {
    const planId = Number(req.params.id);

    if (!Number.isInteger(planId) || planId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid plan id',
      });
    }

    const plan = await getPlanById(planId);

    if (!plan) {
      return res.status(404).json({
        ok: false,
        message: 'Plan not found',
      });
    }

    return res.status(200).json({
      ok: true,
      plan: sanitizePlan(plan),
    });
  } catch (error) {
    console.error('getSinglePlan error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch plan',
      error: error.message,
    });
  }
}

async function createPlan(req, res) {
  try {
    const {
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
      status,
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        ok: false,
        message: 'Plan name is required',
      });
    }

    const cleanPrice = normalizeNullableNumber(price);

    if (cleanPrice === null || cleanPrice < 0) {
      return res.status(400).json({
        ok: false,
        message: 'Valid plan price is required',
      });
    }

    const cleanBillingCycle = ['yearly'].includes(billing_cycle)
      ? billing_cycle
      : 'yearly';

    const cleanProductLimit = normalizeLimit(product_limit);
    const cleanPostLimit = normalizeLimit(post_limit);
    const cleanWebsiteLimit = normalizeLimit(website_limit);
    const cleanSliderLimit = normalizeLimit(slider_limit);
    const cleanMenuLimit = normalizeLimit(menu_limit);
    const cleanPremiumTemplatesOnly = premium_templates_only ? 1 : 0;
    const cleanFeaturesJson = normalizeFeaturesJson(features_json);
    const cleanStatus = ['active', 'inactive'].includes(status) ? status : 'active';

    const [result] = await pool.query(
      `
      INSERT INTO subscription_plans
      (
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
        status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        String(name).trim(),
        cleanPrice,
        cleanBillingCycle,
        cleanProductLimit,
        cleanPostLimit,
        cleanWebsiteLimit,
        cleanWebsiteLimit === null ? 1 : cleanWebsiteLimit,
        cleanSliderLimit,
        cleanMenuLimit,
        cleanPremiumTemplatesOnly,
        cleanFeaturesJson,
        cleanStatus,
      ]
    );

    const plan = await getPlanById(result.insertId);

    return res.status(201).json({
      ok: true,
      message: 'Plan created successfully',
      plan: sanitizePlan(plan),
    });
  } catch (error) {
    console.error('createPlan error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to create plan',
      error: error.message,
    });
  }
}

async function updatePlan(req, res) {
  try {
    const planId = Number(req.params.id);

    if (!Number.isInteger(planId) || planId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid plan id',
      });
    }

    const existingPlan = await getPlanById(planId);

    if (!existingPlan) {
      return res.status(404).json({
        ok: false,
        message: 'Plan not found',
      });
    }

    const {
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
      status,
    } = req.body;

    const cleanName =
      name !== undefined ? String(name).trim() : existingPlan.name;

    if (!cleanName) {
      return res.status(400).json({
        ok: false,
        message: 'Plan name is required',
      });
    }

    const cleanPrice =
      price !== undefined ? normalizeNullableNumber(price) : Number(existingPlan.price);

    if (cleanPrice === null || cleanPrice < 0) {
      return res.status(400).json({
        ok: false,
        message: 'Valid plan price is required',
      });
    }

    const cleanBillingCycle = ['yearly'].includes(billing_cycle)
      ? billing_cycle
      : existingPlan.billing_cycle;

    const cleanProductLimit =
      product_limit !== undefined ? normalizeLimit(product_limit) : existingPlan.product_limit;

    const cleanPostLimit =
      post_limit !== undefined ? normalizeLimit(post_limit) : existingPlan.post_limit;

    const cleanWebsiteLimit =
      website_limit !== undefined ? normalizeLimit(website_limit) : existingPlan.website_limit;

    const cleanSliderLimit =
      slider_limit !== undefined ? normalizeLimit(slider_limit) : existingPlan.slider_limit;

    const cleanMenuLimit =
      menu_limit !== undefined ? normalizeLimit(menu_limit) : existingPlan.menu_limit;

    const cleanPremiumTemplatesOnly =
      premium_templates_only !== undefined
        ? (premium_templates_only ? 1 : 0)
        : Number(existingPlan.premium_templates_only);

    const cleanFeaturesJson =
      features_json !== undefined
        ? normalizeFeaturesJson(features_json)
        : typeof existingPlan.features_json === 'string'
          ? existingPlan.features_json
          : JSON.stringify(existingPlan.features_json || null);

    const cleanStatus =
      ['active', 'inactive'].includes(status) ? status : existingPlan.status;

    await pool.query(
      `
      UPDATE subscription_plans
      SET
        name = ?,
        price = ?,
        billing_cycle = ?,
        product_limit = ?,
        post_limit = ?,
        website_limit = ?,
        slider_limit = ?,
        menu_limit = ?,
        premium_templates_only = ?,
        features_json = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        cleanName,
        cleanPrice,
        cleanBillingCycle,
        cleanProductLimit,
        cleanPostLimit,
        cleanWebsiteLimit,
        cleanSliderLimit,
        cleanMenuLimit,
        cleanPremiumTemplatesOnly,
        cleanFeaturesJson,
        cleanStatus,
        planId,
      ]
    );

    const updatedPlan = await getPlanById(planId);

    return res.status(200).json({
      ok: true,
      message: 'Plan updated successfully',
      plan: sanitizePlan(updatedPlan),
    });
  } catch (error) {
    console.error('updatePlan error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update plan',
      error: error.message,
    });
  }
}

async function updatePlanStatus(req, res) {
  try {
    const planId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(planId) || planId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid plan id',
      });
    }

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid plan status',
      });
    }

    const existingPlan = await getPlanById(planId);

    if (!existingPlan) {
      return res.status(404).json({
        ok: false,
        message: 'Plan not found',
      });
    }

    await pool.query(
      `
      UPDATE subscription_plans
      SET
        status = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [status, planId]
    );

    const updatedPlan = await getPlanById(planId);

    return res.status(200).json({
      ok: true,
      message: 'Plan status updated successfully',
      plan: sanitizePlan(updatedPlan),
    });
  } catch (error) {
    console.error('updatePlanStatus error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update plan status',
      error: error.message,
    });
  }
}

async function deletePlan(req, res) {
  try {
    const planId = Number(req.params.id);

    if (!Number.isInteger(planId) || planId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid plan id',
      });
    }

    const existingPlan = await getPlanById(planId);

    if (!existingPlan) {
      return res.status(404).json({
        ok: false,
        message: 'Plan not found',
      });
    }

    await pool.query(
      `
      DELETE FROM subscription_plans
      WHERE id = ?
      `,
      [planId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Plan deleted successfully',
    });
  } catch (error) {
    console.error('deletePlan error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to delete plan',
      error: error.message,
    });
  }
}

module.exports = {
  getAllPlans,
  getActivePlans,
  getSinglePlan,
  createPlan,
  updatePlan,
  updatePlanStatus,
  deletePlan,
};