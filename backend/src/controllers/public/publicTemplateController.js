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

  const [paidRows] = await pool.query(
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
      AND s.status = 'active'
      AND p.status = 'active'
      AND p.price > 0
      AND s.amount_paid > 0
      AND (s.start_date IS NULL OR s.start_date <= NOW())
      AND (s.end_date IS NULL OR s.end_date > NOW())
    ORDER BY s.id DESC
    LIMIT 1
    `,
    [userId]
  );

  if (paidRows[0]) return paidRows[0];

  const [freeRows] = await pool.query(
    `
    SELECT
      NULL AS subscription_id,
      ? AS user_id,
      p.id AS plan_id,
      'free' AS subscription_status,
      p.name AS plan_name,
      p.premium_templates_only,
      p.blog_templates_mode
    FROM subscription_plans p
    WHERE p.status = 'active'
      AND p.price = 0
    ORDER BY p.id ASC
    LIMIT 1
    `,
    [userId]
  );

  return freeRows[0] || null;
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
      templates = templates.filter(
        (item) => item.template_code_key === 'simple_writer_template_v1'
      );
    } else {
      const mode = String(
        latestPlan.blog_templates_mode || 'unlimited'
      ).toLowerCase();

      if (mode === 'specific') {
        const allowedTemplateIds = await getAllowedBlogTemplateIdsByPlanId(
          latestPlan.plan_id
        );

        templates = templates.filter((item) =>
          allowedTemplateIds.includes(Number(item.id))
        );
      } else if (!latestPlan.premium_templates_only) {
        templates = templates.filter((item) => !item.is_premium);
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