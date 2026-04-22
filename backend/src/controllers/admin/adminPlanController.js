const pool = require('../../config/db');

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

function normalizeBooleanFlag(value, fallback = 0) {
  if (value === undefined) return fallback;

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  if (typeof value === 'number') {
    return value ? 1 : 0;
  }

  const normalized = String(value).trim().toLowerCase();

  if (['1', 'true', 'yes', 'on'].includes(normalized)) return 1;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return 0;

  return fallback;
}

function normalizeTemplateMode(value, fallback = 'unlimited') {
  const clean = String(value || '').trim().toLowerCase();
  return ['specific', 'unlimited'].includes(clean) ? clean : fallback;
}

function normalizeIdArray(values = []) {
  if (!Array.isArray(values)) return [];

  return [...new Set(
    values
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0)
  )];
}

async function getWebsiteTemplateById(templateId) {
  const [rows] = await pool.query(
    `
    SELECT id, name, status
    FROM website_templates
    WHERE id = ?
    LIMIT 1
    `,
    [templateId]
  );

  return rows[0] || null;
}

async function getBlogTemplateById(templateId) {
  const [rows] = await pool.query(
    `
    SELECT id, name, status
    FROM blog_templates
    WHERE id = ?
    LIMIT 1
    `,
    [templateId]
  );

  return rows[0] || null;
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
      wt.status
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
    name: row.name,
    slug: row.slug,
    preview_image: row.preview_image,
    template_code_key: row.template_code_key,
    description: row.description,
    is_premium: !!row.is_premium,
    status: row.status,
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
      bt.status
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
    name: row.name,
    slug: row.slug,
    preview_image: row.preview_image,
    template_code_key: row.template_code_key,
    description: row.description,
    is_premium: !!row.is_premium,
    status: row.status,
  }));
}

async function replacePlanAllowedWebsiteTemplates(planId, templateIds = []) {
  await pool.query(`DELETE FROM plan_allowed_website_templates WHERE plan_id = ?`, [planId]);

  if (!templateIds.length) return;

  for (const templateId of templateIds) {
    await pool.query(
      `
      INSERT INTO plan_allowed_website_templates
      (
        plan_id,
        website_template_id,
        created_at,
        updated_at
      )
      VALUES (?, ?, NOW(), NOW())
      `,
      [planId, templateId]
    );
  }
}

async function replacePlanAllowedBlogTemplates(planId, templateIds = []) {
  await pool.query(`DELETE FROM plan_allowed_blog_templates WHERE plan_id = ?`, [planId]);

  if (!templateIds.length) return;

  for (const templateId of templateIds) {
    await pool.query(
      `
      INSERT INTO plan_allowed_blog_templates
      (
        plan_id,
        blog_template_id,
        created_at,
        updated_at
      )
      VALUES (?, ?, NOW(), NOW())
      `,
      [planId, templateId]
    );
  }
}

async function validateWebsiteTemplateIds(templateIds = []) {
  for (const templateId of templateIds) {
    const template = await getWebsiteTemplateById(templateId);

    if (!template || template.status !== 'active') {
      const error = new Error(`Website template ${templateId} is invalid or inactive`);
      error.status = 400;
      throw error;
    }
  }
}

async function validateBlogTemplateIds(templateIds = []) {
  for (const templateId of templateIds) {
    const template = await getBlogTemplateById(templateId);

    if (!template || template.status !== 'active') {
      const error = new Error(`Blog template ${templateId} is invalid or inactive`);
      error.status = 400;
      throw error;
    }
  }
}

async function enrichPlanRow(row) {
  if (!row) return null;

  const allowedWebsiteTemplates = await getPlanAllowedWebsiteTemplates(row.id);
  const allowedBlogTemplates = await getPlanAllowedBlogTemplates(row.id);

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
    allow_external_links: !!row.allow_external_links,
    website_templates_mode: row.website_templates_mode || 'unlimited',
    blog_templates_mode: row.blog_templates_mode || 'unlimited',
    allowed_website_templates: allowedWebsiteTemplates,
    allowed_blog_templates: allowedBlogTemplates,
    allowed_website_template_ids: allowedWebsiteTemplates.map((item) => item.id),
    allowed_blog_template_ids: allowedBlogTemplates.map((item) => item.id),
    features_json:
      typeof row.features_json === 'string'
        ? safeJsonParse(row.features_json)
        : row.features_json,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
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
      allow_external_links,
      website_templates_mode,
      blog_templates_mode,
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
        allow_external_links,
        website_templates_mode,
        blog_templates_mode,
        features_json,
        status,
        created_at,
        updated_at
      FROM subscription_plans
      ORDER BY price ASC, id ASC
      `
    );

    const plans = await Promise.all(rows.map(enrichPlanRow));

    return res.status(200).json({
      ok: true,
      plans,
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
        allow_external_links,
        website_templates_mode,
        blog_templates_mode,
        features_json,
        status,
        created_at,
        updated_at
      FROM subscription_plans
      WHERE status = 'active'
      ORDER BY price ASC, id ASC
      `
    );

    const plans = await Promise.all(rows.map(enrichPlanRow));

    return res.status(200).json({
      ok: true,
      plans,
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
      plan: await enrichPlanRow(plan),
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
      allow_external_links,
      website_templates_mode,
      blog_templates_mode,
      allowed_website_template_ids,
      allowed_blog_template_ids,
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
    const cleanPremiumTemplatesOnly = normalizeBooleanFlag(premium_templates_only, 0);
    const cleanAllowExternalLinks = normalizeBooleanFlag(allow_external_links, 0);
    const cleanWebsiteTemplatesMode = normalizeTemplateMode(website_templates_mode, 'unlimited');
    const cleanBlogTemplatesMode = normalizeTemplateMode(blog_templates_mode, 'unlimited');
    const cleanAllowedWebsiteTemplateIds = normalizeIdArray(allowed_website_template_ids);
    const cleanAllowedBlogTemplateIds = normalizeIdArray(allowed_blog_template_ids);
    const cleanFeaturesJson = normalizeFeaturesJson(features_json);
    const cleanStatus = ['active', 'inactive'].includes(status) ? status : 'active';

    await validateWebsiteTemplateIds(cleanAllowedWebsiteTemplateIds);
    await validateBlogTemplateIds(cleanAllowedBlogTemplateIds);

    if (cleanWebsiteTemplatesMode === 'specific' && !cleanAllowedWebsiteTemplateIds.length) {
      return res.status(400).json({
        ok: false,
        message: 'Select at least one website template when website template mode is specific',
      });
    }

    if (cleanBlogTemplatesMode === 'specific' && !cleanAllowedBlogTemplateIds.length) {
      return res.status(400).json({
        ok: false,
        message: 'Select at least one blog template when blog template mode is specific',
      });
    }

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
        allow_external_links,
        website_templates_mode,
        blog_templates_mode,
        features_json,
        status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        String(name).trim(),
        cleanPrice,
        cleanBillingCycle,
        cleanProductLimit,
        cleanPostLimit,
        cleanWebsiteLimit,
        cleanSliderLimit,
        cleanMenuLimit,
        cleanPremiumTemplatesOnly,
        cleanAllowExternalLinks,
        cleanWebsiteTemplatesMode,
        cleanBlogTemplatesMode,
        cleanFeaturesJson,
        cleanStatus,
      ]
    );

    await replacePlanAllowedWebsiteTemplates(result.insertId, cleanAllowedWebsiteTemplateIds);
    await replacePlanAllowedBlogTemplates(result.insertId, cleanAllowedBlogTemplateIds);

    const plan = await getPlanById(result.insertId);

    return res.status(201).json({
      ok: true,
      message: 'Plan created successfully',
      plan: await enrichPlanRow(plan),
    });
  } catch (error) {
    console.error('createPlan error:', error);

    return res.status(error.status || 500).json({
      ok: false,
      message: error.message || 'Failed to create plan',
      error: error.status ? undefined : error.message,
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

    const existingWebsiteTemplates = await getPlanAllowedWebsiteTemplates(planId);
    const existingBlogTemplates = await getPlanAllowedBlogTemplates(planId);

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
      allow_external_links,
      website_templates_mode,
      blog_templates_mode,
      allowed_website_template_ids,
      allowed_blog_template_ids,
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
        ? normalizeBooleanFlag(premium_templates_only, Number(existingPlan.premium_templates_only))
        : Number(existingPlan.premium_templates_only);

    const cleanAllowExternalLinks =
      allow_external_links !== undefined
        ? normalizeBooleanFlag(allow_external_links, Number(existingPlan.allow_external_links))
        : Number(existingPlan.allow_external_links);

    const cleanWebsiteTemplatesMode =
      website_templates_mode !== undefined
        ? normalizeTemplateMode(website_templates_mode, existingPlan.website_templates_mode || 'unlimited')
        : existingPlan.website_templates_mode || 'unlimited';

    const cleanBlogTemplatesMode =
      blog_templates_mode !== undefined
        ? normalizeTemplateMode(blog_templates_mode, existingPlan.blog_templates_mode || 'unlimited')
        : existingPlan.blog_templates_mode || 'unlimited';

    const cleanAllowedWebsiteTemplateIds =
      allowed_website_template_ids !== undefined
        ? normalizeIdArray(allowed_website_template_ids)
        : existingWebsiteTemplates.map((item) => item.id);

    const cleanAllowedBlogTemplateIds =
      allowed_blog_template_ids !== undefined
        ? normalizeIdArray(allowed_blog_template_ids)
        : existingBlogTemplates.map((item) => item.id);

    await validateWebsiteTemplateIds(cleanAllowedWebsiteTemplateIds);
    await validateBlogTemplateIds(cleanAllowedBlogTemplateIds);

    if (cleanWebsiteTemplatesMode === 'specific' && !cleanAllowedWebsiteTemplateIds.length) {
      return res.status(400).json({
        ok: false,
        message: 'Select at least one website template when website template mode is specific',
      });
    }

    if (cleanBlogTemplatesMode === 'specific' && !cleanAllowedBlogTemplateIds.length) {
      return res.status(400).json({
        ok: false,
        message: 'Select at least one blog template when blog template mode is specific',
      });
    }

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
        allow_external_links = ?,
        website_templates_mode = ?,
        blog_templates_mode = ?,
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
        cleanAllowExternalLinks,
        cleanWebsiteTemplatesMode,
        cleanBlogTemplatesMode,
        cleanFeaturesJson,
        cleanStatus,
        planId,
      ]
    );

    await replacePlanAllowedWebsiteTemplates(planId, cleanAllowedWebsiteTemplateIds);
    await replacePlanAllowedBlogTemplates(planId, cleanAllowedBlogTemplateIds);

    const updatedPlan = await getPlanById(planId);

    return res.status(200).json({
      ok: true,
      message: 'Plan updated successfully',
      plan: await enrichPlanRow(updatedPlan),
    });
  } catch (error) {
    console.error('updatePlan error:', error);

    return res.status(error.status || 500).json({
      ok: false,
      message: error.message || 'Failed to update plan',
      error: error.status ? undefined : error.message,
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
      plan: await enrichPlanRow(updatedPlan),
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

    await pool.query(`DELETE FROM plan_allowed_website_templates WHERE plan_id = ?`, [planId]);
    await pool.query(`DELETE FROM plan_allowed_blog_templates WHERE plan_id = ?`, [planId]);

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