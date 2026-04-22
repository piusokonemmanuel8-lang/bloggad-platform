const pool = require('../../config/db');

function sanitizeTemplate(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    preview_image: row.preview_image,
    template_code_key: row.template_code_key,
    description: row.description,
    is_premium: !!row.is_premium,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function getLatestSubscriptionPlanByUserId(userId) {
  if (!userId) return null;

  const [rows] = await pool.query(
    `
    SELECT
      s.id AS subscription_id,
      s.user_id,
      s.plan_id,
      s.status AS subscription_status,
      p.name AS plan_name,
      p.premium_templates_only,
      p.blog_templates_mode
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

async function getAllowedBlogTemplateIdsByPlanId(planId) {
  if (!planId) return [];

  const [rows] = await pool.query(
    `
    SELECT blog_template_id
    FROM plan_allowed_blog_templates
    WHERE plan_id = ?
    ORDER BY id ASC
    `,
    [planId]
  );

  return rows
    .map((row) => Number(row.blog_template_id))
    .filter((value) => Number.isInteger(value) && value > 0);
}

async function getPublicBlogTemplates(req, res) {
  try {
    const userId = req.user?.id || null;
    const latestPlan = await getLatestSubscriptionPlanByUserId(userId);

    const [rows] = await pool.query(
      `
      SELECT
        id,
        name,
        slug,
        preview_image,
        template_code_key,
        description,
        is_premium,
        status,
        created_at,
        updated_at
      FROM blog_templates
      WHERE status = 'active'
      ORDER BY is_premium ASC, id DESC
      `
    );

    let templates = rows.map(sanitizeTemplate);

    if (!latestPlan) {
      templates = templates.filter((item) => !item.is_premium);
    } else {
      if (!latestPlan.premium_templates_only) {
        templates = templates.filter((item) => !item.is_premium);
      }

      if (String(latestPlan.blog_templates_mode || 'unlimited').toLowerCase() === 'specific') {
        const allowedTemplateIds = await getAllowedBlogTemplateIdsByPlanId(latestPlan.plan_id);
        templates = templates.filter((item) => allowedTemplateIds.includes(Number(item.id)));
      }
    }

    return res.status(200).json({
      ok: true,
      templates,
    });
  } catch (error) {
    console.error('getPublicBlogTemplates error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch blog templates',
      error: error.message,
    });
  }
}

module.exports = {
  getPublicBlogTemplates,
};