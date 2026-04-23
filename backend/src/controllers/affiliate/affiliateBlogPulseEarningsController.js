const pool = require('../../config/db');

let monetizationTableReady = false;
let blogPulseSettingsReady = false;

async function ensureAffiliateMonetizationTable() {
  if (monetizationTableReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS affiliate_monetization_settings (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NOT NULL,
      monetization_mode ENUM('individual', 'platform') NOT NULL DEFAULT 'individual',

      provider_name VARCHAR(255) DEFAULT NULL,
      provider_type ENUM('adsense', 'generic', 'manual') DEFAULT NULL,
      publisher_id VARCHAR(255) DEFAULT NULL,
      head_code LONGTEXT DEFAULT NULL,
      notes TEXT DEFAULT NULL,

      storefront_top_enabled TINYINT(1) NOT NULL DEFAULT 1,
      storefront_sidebar_enabled TINYINT(1) NOT NULL DEFAULT 0,
      storefront_bottom_enabled TINYINT(1) NOT NULL DEFAULT 1,
      post_top_enabled TINYINT(1) NOT NULL DEFAULT 1,
      post_middle_enabled TINYINT(1) NOT NULL DEFAULT 1,
      post_bottom_enabled TINYINT(1) NOT NULL DEFAULT 1,
      post_sidebar_enabled TINYINT(1) NOT NULL DEFAULT 0,

      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

      PRIMARY KEY (id),
      UNIQUE KEY uniq_affiliate_monetization_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  monetizationTableReady = true;
}

async function ensureBlogPulseSettingsTable() {
  if (blogPulseSettingsReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS blogpulse_settings (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      is_enabled TINYINT(1) NOT NULL DEFAULT 0,
      premium_only TINYINT(1) NOT NULL DEFAULT 1,
      default_rate_per_view DECIMAL(18,8) NOT NULL DEFAULT 0.00010000,
      minimum_view_seconds INT NOT NULL DEFAULT 15,
      minimum_scroll_percent INT NOT NULL DEFAULT 10,
      ip_repeat_window_hours INT NOT NULL DEFAULT 24,
      fingerprint_repeat_window_hours INT NOT NULL DEFAULT 24,
      daily_ip_view_cap INT NOT NULL DEFAULT 5,
      withdrawal_threshold DECIMAL(18,2) NOT NULL DEFAULT 10.00,
      count_only_if_ad_loaded TINYINT(1) NOT NULL DEFAULT 0,
      block_vpn_proxy_traffic TINYINT(1) NOT NULL DEFAULT 0,
      block_suspicious_user_agents TINYINT(1) NOT NULL DEFAULT 1,
      allow_individual_monetization TINYINT(1) NOT NULL DEFAULT 1,
      individual_requires_admin_approval TINYINT(1) NOT NULL DEFAULT 1,
      individual_premium_only TINYINT(1) NOT NULL DEFAULT 1,
      allow_custom_html_ad_code TINYINT(1) NOT NULL DEFAULT 0,
      allow_network_js_code TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const [[existing]] = await pool.query(
    `SELECT id FROM blogpulse_settings ORDER BY id ASC LIMIT 1`
  );

  if (!existing) {
    await pool.query(`
      INSERT INTO blogpulse_settings
      (
        is_enabled,
        premium_only,
        default_rate_per_view,
        minimum_view_seconds,
        minimum_scroll_percent,
        ip_repeat_window_hours,
        fingerprint_repeat_window_hours,
        daily_ip_view_cap,
        withdrawal_threshold,
        count_only_if_ad_loaded,
        block_vpn_proxy_traffic,
        block_suspicious_user_agents,
        allow_individual_monetization,
        individual_requires_admin_approval,
        individual_premium_only,
        allow_custom_html_ad_code,
        allow_network_js_code
      )
      VALUES
      (0, 1, 0.00010000, 15, 10, 24, 24, 5, 10.00, 0, 0, 1, 1, 1, 1, 0, 1)
    `);
  }

  blogPulseSettingsReady = true;
}

async function getAffiliateWebsite(userId) {
  const [rows] = await pool.query(
    `
      SELECT id, user_id, website_name, slug, status
      FROM affiliate_websites
      WHERE user_id = ?
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}

async function getMonetizationSettings(userId) {
  const [rows] = await pool.query(
    `
      SELECT
        monetization_mode,
        storefront_top_enabled,
        storefront_sidebar_enabled,
        storefront_bottom_enabled,
        post_top_enabled,
        post_middle_enabled,
        post_bottom_enabled,
        post_sidebar_enabled
      FROM affiliate_monetization_settings
      WHERE user_id = ?
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}

async function getBlogPulseSettings() {
  const [rows] = await pool.query(
    `
      SELECT
        is_enabled,
        premium_only,
        default_rate_per_view,
        withdrawal_threshold
      FROM blogpulse_settings
      ORDER BY id ASC
      LIMIT 1
    `
  );

  return rows[0] || null;
}

async function getTrackedTotals(websiteId) {
  const [[postViewRow]] = await pool.query(
    `
      SELECT COUNT(*) AS total
      FROM analytics_post_views
      WHERE website_id = ?
    `,
    [websiteId]
  );

  const [[productViewRow]] = await pool.query(
    `
      SELECT COUNT(*) AS total
      FROM analytics_product_views
      WHERE website_id = ?
    `,
    [websiteId]
  );

  const [[productClickRow]] = await pool.query(
    `
      SELECT COUNT(*) AS total
      FROM analytics_product_clicks
      WHERE website_id = ?
    `,
    [websiteId]
  );

  const [[sliderClickRow]] = await pool.query(
    `
      SELECT COUNT(*) AS total
      FROM analytics_slider_clicks
      WHERE website_id = ?
    `,
    [websiteId]
  );

  const [[postCountRow]] = await pool.query(
    `
      SELECT COUNT(*) AS total
      FROM product_posts
      WHERE website_id = ?
    `,
    [websiteId]
  );

  return {
    total_post_views: Number(postViewRow?.total || 0),
    total_product_views: Number(productViewRow?.total || 0),
    total_product_clicks: Number(productClickRow?.total || 0),
    total_slider_clicks: Number(sliderClickRow?.total || 0),
    total_posts: Number(postCountRow?.total || 0),
  };
}

async function getDailyPostViews(websiteId, days = 7) {
  const [rows] = await pool.query(
    `
      SELECT
        DATE(created_at) AS day,
        COUNT(*) AS total_views
      FROM analytics_post_views
      WHERE website_id = ?
        AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `,
    [websiteId, days]
  );

  const map = new Map();
  rows.forEach((row) => {
    const key = new Date(row.day).toISOString().slice(0, 10);
    map.set(key, Number(row.total_views || 0));
  });

  const points = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - offset);
    const key = d.toISOString().slice(0, 10);
    points.push({
      date: key,
      label: d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
      post_views: map.get(key) || 0,
    });
  }

  return points;
}

async function getTopEarningPosts(websiteId, ratePerView) {
  const [rows] = await pool.query(
    `
      SELECT
        pp.id,
        pp.title,
        pp.slug,
        COUNT(apv.id) AS total_views
      FROM product_posts pp
      LEFT JOIN analytics_post_views apv
        ON apv.post_id = pp.id
      WHERE pp.website_id = ?
      GROUP BY pp.id, pp.title, pp.slug
      ORDER BY total_views DESC, pp.id DESC
      LIMIT 5
    `,
    [websiteId]
  );

  return rows.map((row) => {
    const views = Number(row.total_views || 0);
    const estimated = Number((views * ratePerView).toFixed(8));

    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      total_views: views,
      estimated_earnings: estimated,
    };
  });
}

function formatCurrencyNumber(value) {
  return Number(Number(value || 0).toFixed(8));
}

async function getAffiliateBlogPulseEarnings(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Not authorized.',
      });
    }

    await ensureAffiliateMonetizationTable();
    await ensureBlogPulseSettingsTable();

    const website = await getAffiliateWebsite(userId);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate website not found.',
      });
    }

    const monetization = await getMonetizationSettings(userId);
    const blogPulse = await getBlogPulseSettings();
    const totals = await getTrackedTotals(website.id);
    const chart = await getDailyPostViews(website.id, 7);

    const monetizationMode = monetization?.monetization_mode === 'platform'
      ? 'platform'
      : 'individual';

    const ratePerView = Number(blogPulse?.default_rate_per_view || 0);
    const trackedMonetizableViews = totals.total_post_views;
    const estimatedRevenue = formatCurrencyNumber(trackedMonetizableViews * ratePerView);
    const top_posts = await getTopEarningPosts(website.id, ratePerView);

    return res.status(200).json({
      ok: true,
      earnings: {
        website: {
          id: website.id,
          website_name: website.website_name,
          slug: website.slug,
          status: website.status,
        },
        monetization: {
          monetization_mode: monetizationMode,
          platform_enabled: Number(blogPulse?.is_enabled || 0),
          premium_only: Number(blogPulse?.premium_only || 0),
          rate_per_view: ratePerView,
          withdrawal_threshold: Number(blogPulse?.withdrawal_threshold || 0),
        },
        overview: {
          tracked_post_views: totals.total_post_views,
          tracked_product_views: totals.total_product_views,
          tracked_product_clicks: totals.total_product_clicks,
          tracked_slider_clicks: totals.total_slider_clicks,
          total_posts: totals.total_posts,
          estimated_revenue: estimatedRevenue,
        },
        chart,
        top_posts,
        summary_table: {
          today: chart[chart.length - 1]
            ? {
                label: 'Today',
                tracked_post_views: chart[chart.length - 1].post_views,
                estimated_revenue: formatCurrencyNumber(
                  chart[chart.length - 1].post_views * ratePerView
                ),
              }
            : {
                label: 'Today',
                tracked_post_views: 0,
                estimated_revenue: 0,
              },
          last_7_days: {
            label: 'Last 7 Days',
            tracked_post_views: trackedMonetizableViews,
            estimated_revenue: estimatedRevenue,
          },
        },
      },
    });
  } catch (error) {
    console.error('getAffiliateBlogPulseEarnings error:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch BlogPulse earnings.',
      error: error.message,
    });
  }
}

module.exports = {
  getAffiliateBlogPulseEarnings,
};