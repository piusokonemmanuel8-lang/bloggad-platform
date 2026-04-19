const pool = require('../../config/db');

async function getAdminDashboardOverview(req, res) {
  try {
    const [[usersRow]] = await pool.query(`
      SELECT
        COUNT(*) AS total_users,
        SUM(CASE WHEN role = 'affiliate' THEN 1 ELSE 0 END) AS total_affiliates,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS total_admins,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS total_active_users,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS total_inactive_users,
        SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) AS total_suspended_users
      FROM users
    `);

    const [[websiteRow]] = await pool.query(`
      SELECT
        COUNT(*) AS total_websites,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS total_active_websites,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS total_draft_websites,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS total_inactive_websites,
        SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) AS total_suspended_websites
      FROM affiliate_websites
    `);

    const [[productRow]] = await pool.query(`
      SELECT
        COUNT(*) AS total_products,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS total_published_products,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS total_draft_products,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS total_inactive_products
      FROM products
    `);

    const [[postRow]] = await pool.query(`
      SELECT
        COUNT(*) AS total_posts,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS total_published_posts,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS total_draft_posts,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS total_inactive_posts
      FROM product_posts
    `);

    const [[categoryRow]] = await pool.query(`
      SELECT
        COUNT(*) AS total_categories,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS total_active_categories,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS total_inactive_categories
      FROM categories
    `);

    const [[planRow]] = await pool.query(`
      SELECT
        COUNT(*) AS total_plans,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS total_active_plans,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS total_inactive_plans
      FROM subscription_plans
    `);

    const [[subscriptionRow]] = await pool.query(`
      SELECT
        COUNT(*) AS total_subscriptions,
        SUM(CASE WHEN status = 'trial' THEN 1 ELSE 0 END) AS total_trial_subscriptions,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS total_active_subscriptions,
        SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) AS total_expired_subscriptions,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS total_cancelled_subscriptions
      FROM affiliate_subscriptions
    `);

    const [[analyticsRow]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM analytics_product_views) AS total_product_views,
        (SELECT COUNT(*) FROM analytics_product_clicks) AS total_product_clicks,
        (SELECT COUNT(*) FROM analytics_post_views) AS total_post_views,
        (SELECT COUNT(*) FROM analytics_slider_clicks) AS total_slider_clicks
    `);

    const [[validationRow]] = await pool.query(`
      SELECT
        COUNT(*) AS total_validation_logs,
        SUM(CASE WHEN is_allowed = 1 THEN 1 ELSE 0 END) AS total_passed_logs,
        SUM(CASE WHEN is_allowed = 0 THEN 1 ELSE 0 END) AS total_failed_logs
      FROM link_validation_logs
    `);

    const [recentAffiliates] = await pool.query(`
      SELECT
        id,
        name,
        email,
        role,
        status,
        created_at
      FROM users
      WHERE role = 'affiliate'
      ORDER BY id DESC
      LIMIT 10
    `);

    const [recentProducts] = await pool.query(`
      SELECT
        p.id,
        p.title,
        p.slug,
        p.status,
        p.created_at,
        u.name AS affiliate_name,
        aw.website_name,
        aw.slug AS website_slug
      FROM products p
      INNER JOIN users u
        ON u.id = p.user_id
      LEFT JOIN affiliate_websites aw
        ON aw.id = p.website_id
      ORDER BY p.id DESC
      LIMIT 10
    `);

    const [recentPosts] = await pool.query(`
      SELECT
        pp.id,
        pp.title,
        pp.slug,
        pp.status,
        pp.created_at,
        u.name AS affiliate_name,
        aw.website_name,
        aw.slug AS website_slug
      FROM product_posts pp
      INNER JOIN users u
        ON u.id = pp.user_id
      LEFT JOIN affiliate_websites aw
        ON aw.id = pp.website_id
      ORDER BY pp.id DESC
      LIMIT 10
    `);

    return res.status(200).json({
      ok: true,
      dashboard: {
        users: {
          total_users: Number(usersRow?.total_users || 0),
          total_affiliates: Number(usersRow?.total_affiliates || 0),
          total_admins: Number(usersRow?.total_admins || 0),
          total_active_users: Number(usersRow?.total_active_users || 0),
          total_inactive_users: Number(usersRow?.total_inactive_users || 0),
          total_suspended_users: Number(usersRow?.total_suspended_users || 0),
        },
        websites: {
          total_websites: Number(websiteRow?.total_websites || 0),
          total_active_websites: Number(websiteRow?.total_active_websites || 0),
          total_draft_websites: Number(websiteRow?.total_draft_websites || 0),
          total_inactive_websites: Number(websiteRow?.total_inactive_websites || 0),
          total_suspended_websites: Number(websiteRow?.total_suspended_websites || 0),
        },
        products: {
          total_products: Number(productRow?.total_products || 0),
          total_published_products: Number(productRow?.total_published_products || 0),
          total_draft_products: Number(productRow?.total_draft_products || 0),
          total_inactive_products: Number(productRow?.total_inactive_products || 0),
        },
        posts: {
          total_posts: Number(postRow?.total_posts || 0),
          total_published_posts: Number(postRow?.total_published_posts || 0),
          total_draft_posts: Number(postRow?.total_draft_posts || 0),
          total_inactive_posts: Number(postRow?.total_inactive_posts || 0),
        },
        categories: {
          total_categories: Number(categoryRow?.total_categories || 0),
          total_active_categories: Number(categoryRow?.total_active_categories || 0),
          total_inactive_categories: Number(categoryRow?.total_inactive_categories || 0),
        },
        plans: {
          total_plans: Number(planRow?.total_plans || 0),
          total_active_plans: Number(planRow?.total_active_plans || 0),
          total_inactive_plans: Number(planRow?.total_inactive_plans || 0),
        },
        subscriptions: {
          total_subscriptions: Number(subscriptionRow?.total_subscriptions || 0),
          total_trial_subscriptions: Number(subscriptionRow?.total_trial_subscriptions || 0),
          total_active_subscriptions: Number(subscriptionRow?.total_active_subscriptions || 0),
          total_expired_subscriptions: Number(subscriptionRow?.total_expired_subscriptions || 0),
          total_cancelled_subscriptions: Number(subscriptionRow?.total_cancelled_subscriptions || 0),
        },
        analytics: {
          total_product_views: Number(analyticsRow?.total_product_views || 0),
          total_product_clicks: Number(analyticsRow?.total_product_clicks || 0),
          total_post_views: Number(analyticsRow?.total_post_views || 0),
          total_slider_clicks: Number(analyticsRow?.total_slider_clicks || 0),
        },
        link_validation: {
          total_validation_logs: Number(validationRow?.total_validation_logs || 0),
          total_passed_logs: Number(validationRow?.total_passed_logs || 0),
          total_failed_logs: Number(validationRow?.total_failed_logs || 0),
        },
        recent_affiliates: recentAffiliates,
        recent_products: recentProducts,
        recent_posts: recentPosts,
      },
    });
  } catch (error) {
    console.error('getAdminDashboardOverview error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch admin dashboard overview',
      error: error.message,
    });
  }
}

module.exports = {
  getAdminDashboardOverview,
};