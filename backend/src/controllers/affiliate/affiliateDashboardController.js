const pool = require('../../config/db');

async function getAffiliateWebsite(userId) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      user_id,
      website_name,
      slug,
      custom_domain,
      logo,
      banner,
      meta_title,
      meta_description,
      homepage_template,
      header_style,
      footer_style,
      status,
      created_at,
      updated_at
    FROM affiliate_websites
    WHERE user_id = ?
    LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}

async function getLatestSubscription(userId) {
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

  return rows[0] || null;
}

function parseFeaturesJson(value) {
  if (!value) return null;

  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

async function getAffiliateDashboard(req, res) {
  try {
    const userId = req.user.id;
    const website = await getAffiliateWebsite(userId);
    const subscription = await getLatestSubscription(userId);

    const [[productStats]] = await pool.query(
      `
      SELECT
        COUNT(*) AS total_products,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS total_published_products,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS total_draft_products,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS total_inactive_products
      FROM products
      WHERE user_id = ?
      `,
      [userId]
    );

    const [[postStats]] = await pool.query(
      `
      SELECT
        COUNT(*) AS total_posts,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS total_published_posts,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS total_draft_posts,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS total_inactive_posts
      FROM product_posts
      WHERE user_id = ?
      `,
      [userId]
    );

    const [[menuStats]] = await pool.query(
      `
      SELECT COUNT(*) AS total_menus
      FROM website_menus
      WHERE website_id = ?
      `,
      [website?.id || 0]
    );

    const [[sliderStats]] = await pool.query(
      `
      SELECT
        COUNT(*) AS total_sliders,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS total_active_sliders,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS total_inactive_sliders
      FROM website_sliders
      WHERE website_id = ?
      `,
      [website?.id || 0]
    );

    const [[mediaStats]] = await pool.query(
      `
      SELECT COUNT(*) AS total_media
      FROM media_library
      WHERE user_id = ?
      `,
      [userId]
    );

    const [[productViewStats]] = await pool.query(
      `
      SELECT COUNT(*) AS total_product_views
      FROM analytics_product_views
      WHERE website_id = ?
      `,
      [website?.id || 0]
    );

    const [[productClickStats]] = await pool.query(
      `
      SELECT COUNT(*) AS total_product_clicks
      FROM analytics_product_clicks
      WHERE website_id = ?
      `,
      [website?.id || 0]
    );

    const [[postViewStats]] = await pool.query(
      `
      SELECT COUNT(*) AS total_post_views
      FROM analytics_post_views
      WHERE website_id = ?
      `,
      [website?.id || 0]
    );

    const [[sliderClickStats]] = await pool.query(
      `
      SELECT COUNT(*) AS total_slider_clicks
      FROM analytics_slider_clicks
      WHERE website_id = ?
      `,
      [website?.id || 0]
    );

    const [recentProducts] = await pool.query(
      `
      SELECT
        id,
        title,
        slug,
        status,
        pricing_type,
        price,
        min_price,
        max_price,
        product_image,
        created_at,
        updated_at
      FROM products
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 8
      `,
      [userId]
    );

    const [recentPosts] = await pool.query(
      `
      SELECT
        pp.id,
        pp.product_id,
        pp.title,
        pp.slug,
        pp.status,
        pp.featured_image,
        pp.created_at,
        pp.updated_at,
        p.title AS product_title
      FROM product_posts pp
      LEFT JOIN products p
        ON p.id = pp.product_id
      WHERE pp.user_id = ?
      ORDER BY pp.id DESC
      LIMIT 8
      `,
      [userId]
    );

    const [recentSliders] = await pool.query(
      `
      SELECT
        id,
        image,
        title,
        subtitle,
        link_type,
        status,
        sort_order,
        created_at,
        updated_at
      FROM website_sliders
      WHERE website_id = ?
      ORDER BY id DESC
      LIMIT 8
      `,
      [website?.id || 0]
    );

    const [recentMenus] = await pool.query(
      `
      SELECT
        id,
        name,
        location,
        created_at,
        updated_at
      FROM website_menus
      WHERE website_id = ?
      ORDER BY id DESC
      LIMIT 8
      `,
      [website?.id || 0]
    );

    const [recentMedia] = await pool.query(
      `
      SELECT
        id,
        file_name,
        file_path,
        file_type,
        mime_type,
        file_size,
        source_type,
        created_at,
        updated_at
      FROM media_library
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 8
      `,
      [userId]
    );

    return res.status(200).json({
      ok: true,
      dashboard: {
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          status: req.user.status,
          email_verified_at: req.user.email_verified_at,
          last_login_at: req.user.last_login_at,
          created_at: req.user.created_at,
          updated_at: req.user.updated_at,
        },
        website: website
          ? {
              id: website.id,
              website_name: website.website_name,
              slug: website.slug,
              custom_domain: website.custom_domain,
              logo: website.logo,
              banner: website.banner,
              meta_title: website.meta_title,
              meta_description: website.meta_description,
              homepage_template: website.homepage_template,
              header_style: website.header_style,
              footer_style: website.footer_style,
              status: website.status,
              created_at: website.created_at,
              updated_at: website.updated_at,
              public_url: `/${website.slug}`,
            }
          : null,
        subscription: subscription
          ? {
              id: subscription.id,
              user_id: subscription.user_id,
              plan_id: subscription.plan_id,
              trial_start: subscription.trial_start,
              trial_end: subscription.trial_end,
              start_date: subscription.start_date,
              end_date: subscription.end_date,
              status: subscription.status,
              amount_paid: subscription.amount_paid !== null ? Number(subscription.amount_paid) : null,
              created_at: subscription.created_at,
              updated_at: subscription.updated_at,
              plan: subscription.plan_id
                ? {
                    id: subscription.plan_id,
                    name: subscription.plan_name,
                    price: subscription.plan_price !== null ? Number(subscription.plan_price) : null,
                    billing_cycle: subscription.billing_cycle,
                    product_limit: subscription.product_limit,
                    post_limit: subscription.post_limit,
                    website_limit: subscription.website_limit,
                    slider_limit: subscription.slider_limit,
                    menu_limit: subscription.menu_limit,
                    premium_templates_only: !!subscription.premium_templates_only,
                    features_json: parseFeaturesJson(subscription.features_json),
                    status: subscription.plan_status,
                  }
                : null,
            }
          : null,
        stats: {
          products: {
            total_products: Number(productStats?.total_products || 0),
            total_published_products: Number(productStats?.total_published_products || 0),
            total_draft_products: Number(productStats?.total_draft_products || 0),
            total_inactive_products: Number(productStats?.total_inactive_products || 0),
          },
          posts: {
            total_posts: Number(postStats?.total_posts || 0),
            total_published_posts: Number(postStats?.total_published_posts || 0),
            total_draft_posts: Number(postStats?.total_draft_posts || 0),
            total_inactive_posts: Number(postStats?.total_inactive_posts || 0),
          },
          menus: {
            total_menus: Number(menuStats?.total_menus || 0),
          },
          sliders: {
            total_sliders: Number(sliderStats?.total_sliders || 0),
            total_active_sliders: Number(sliderStats?.total_active_sliders || 0),
            total_inactive_sliders: Number(sliderStats?.total_inactive_sliders || 0),
          },
          media: {
            total_media: Number(mediaStats?.total_media || 0),
          },
          analytics: {
            total_product_views: Number(productViewStats?.total_product_views || 0),
            total_product_clicks: Number(productClickStats?.total_product_clicks || 0),
            total_post_views: Number(postViewStats?.total_post_views || 0),
            total_slider_clicks: Number(sliderClickStats?.total_slider_clicks || 0),
          },
        },
        recent: {
          products: recentProducts.map((row) => ({
            ...row,
            price: row.price !== null ? Number(row.price) : null,
            min_price: row.min_price !== null ? Number(row.min_price) : null,
            max_price: row.max_price !== null ? Number(row.max_price) : null,
          })),
          posts: recentPosts,
          sliders: recentSliders,
          menus: recentMenus,
          media: recentMedia.map((row) => ({
            ...row,
            file_size: row.file_size !== null ? Number(row.file_size) : null,
          })),
        },
      },
    });
  } catch (error) {
    console.error('getAffiliateDashboard error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch affiliate dashboard',
      error: error.message,
    });
  }
}

module.exports = {
  getAffiliateDashboard,
};