const pool = require('../../config/db');

let monetizationTableReady = false;
let blogPulseSettingsReady = false;

async function tableExists(tableName) {
  const [rows] = await pool.query(
    `
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
      LIMIT 1
    `,
    [tableName]
  );

  return rows.length > 0;
}

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

async function getSponsoredAdRevenueSummary(userId, websiteId) {
  const ledgerReady = await tableExists('affiliate_ad_revenue_ledger');

  if (!ledgerReady) {
    return {
      total_sponsored_gross: 0,
      total_sponsored_earnings: 0,
      pending_sponsored_earnings: 0,
      settled_sponsored_earnings: 0,
      rejected_sponsored_earnings: 0,
      total_sponsored_views: 0,
      total_sponsored_clicks: 0,
      pending_events: 0,
      settled_events: 0,
    };
  }

  const [[row]] = await pool.query(
    `
      SELECT
        COALESCE(SUM(gross_amount), 0) AS total_sponsored_gross,
        COALESCE(SUM(publisher_amount), 0) AS total_sponsored_earnings,

        COALESCE(SUM(
          CASE
            WHEN settlement_status = 'pending'
            THEN publisher_amount
            ELSE 0
          END
        ), 0) AS pending_sponsored_earnings,

        COALESCE(SUM(
          CASE
            WHEN settlement_status IN ('settled', 'paid', 'approved')
            THEN publisher_amount
            ELSE 0
          END
        ), 0) AS settled_sponsored_earnings,

        COALESCE(SUM(
          CASE
            WHEN settlement_status IN ('rejected', 'cancelled', 'failed')
            THEN publisher_amount
            ELSE 0
          END
        ), 0) AS rejected_sponsored_earnings,

        COALESCE(SUM(
          CASE
            WHEN event_type = 'view'
            THEN 1
            ELSE 0
          END
        ), 0) AS total_sponsored_views,

        COALESCE(SUM(
          CASE
            WHEN event_type = 'click'
            THEN 1
            ELSE 0
          END
        ), 0) AS total_sponsored_clicks,

        COALESCE(SUM(
          CASE
            WHEN settlement_status = 'pending'
            THEN 1
            ELSE 0
          END
        ), 0) AS pending_events,

        COALESCE(SUM(
          CASE
            WHEN settlement_status IN ('settled', 'paid', 'approved')
            THEN 1
            ELSE 0
          END
        ), 0) AS settled_events

      FROM affiliate_ad_revenue_ledger
      WHERE publisher_affiliate_id = ?
        AND (
          publisher_website_id = ?
          OR publisher_website_id IS NULL
        )
    `,
    [userId, websiteId]
  );

  return {
    total_sponsored_gross: formatCurrencyNumber(row?.total_sponsored_gross || 0),
    total_sponsored_earnings: formatCurrencyNumber(row?.total_sponsored_earnings || 0),
    pending_sponsored_earnings: formatCurrencyNumber(row?.pending_sponsored_earnings || 0),
    settled_sponsored_earnings: formatCurrencyNumber(row?.settled_sponsored_earnings || 0),
    rejected_sponsored_earnings: formatCurrencyNumber(row?.rejected_sponsored_earnings || 0),
    total_sponsored_views: Number(row?.total_sponsored_views || 0),
    total_sponsored_clicks: Number(row?.total_sponsored_clicks || 0),
    pending_events: Number(row?.pending_events || 0),
    settled_events: Number(row?.settled_events || 0),
  };
}

async function getSponsoredAdDailyRevenue(userId, websiteId, days = 7) {
  const ledgerReady = await tableExists('affiliate_ad_revenue_ledger');

  if (!ledgerReady) {
    const points = [];

    for (let offset = days - 1; offset >= 0; offset -= 1) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - offset);
      const key = d.toISOString().slice(0, 10);

      points.push({
        date: key,
        sponsored_earnings: 0,
        sponsored_views: 0,
        sponsored_clicks: 0,
      });
    }

    return points;
  }

  const [rows] = await pool.query(
    `
      SELECT
        DATE(created_at) AS day,
        COALESCE(SUM(publisher_amount), 0) AS sponsored_earnings,
        COALESCE(SUM(CASE WHEN event_type = 'view' THEN 1 ELSE 0 END), 0) AS sponsored_views,
        COALESCE(SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END), 0) AS sponsored_clicks
      FROM affiliate_ad_revenue_ledger
      WHERE publisher_affiliate_id = ?
        AND (
          publisher_website_id = ?
          OR publisher_website_id IS NULL
        )
        AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `,
    [userId, websiteId, days]
  );

  const map = new Map();

  rows.forEach((row) => {
    const key = new Date(row.day).toISOString().slice(0, 10);
    map.set(key, {
      sponsored_earnings: formatCurrencyNumber(row.sponsored_earnings || 0),
      sponsored_views: Number(row.sponsored_views || 0),
      sponsored_clicks: Number(row.sponsored_clicks || 0),
    });
  });

  const points = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - offset);
    const key = d.toISOString().slice(0, 10);
    const item = map.get(key);

    points.push({
      date: key,
      sponsored_earnings: item?.sponsored_earnings || 0,
      sponsored_views: item?.sponsored_views || 0,
      sponsored_clicks: item?.sponsored_clicks || 0,
    });
  }

  return points;
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
    const sponsoredSummary = await getSponsoredAdRevenueSummary(userId, website.id);
    const sponsoredDaily = await getSponsoredAdDailyRevenue(userId, website.id, 7);

    const monetizationMode = monetization?.monetization_mode === 'platform'
      ? 'platform'
      : 'individual';

    const ratePerView = Number(blogPulse?.default_rate_per_view || 0);
    const trackedMonetizableViews = totals.total_post_views;
    const platformEstimatedRevenue = formatCurrencyNumber(trackedMonetizableViews * ratePerView);
    const top_posts = await getTopEarningPosts(website.id, ratePerView);

    const mergedChart = chart.map((point) => {
      const sponsoredPoint = sponsoredDaily.find((item) => item.date === point.date) || {};

      return {
        ...point,
        platform_estimated_revenue: formatCurrencyNumber(point.post_views * ratePerView),
        sponsored_earnings: sponsoredPoint.sponsored_earnings || 0,
        sponsored_views: sponsoredPoint.sponsored_views || 0,
        sponsored_clicks: sponsoredPoint.sponsored_clicks || 0,
        total_estimated_earnings: formatCurrencyNumber(
          point.post_views * ratePerView + Number(sponsoredPoint.sponsored_earnings || 0)
        ),
      };
    });

    const totalEstimatedRevenue = formatCurrencyNumber(
      platformEstimatedRevenue + sponsoredSummary.total_sponsored_earnings
    );

    const availableWalletLikeBalance = formatCurrencyNumber(
      platformEstimatedRevenue + sponsoredSummary.settled_sponsored_earnings
    );

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

          platform_estimated_revenue: platformEstimatedRevenue,
          sponsored_pending_revenue: sponsoredSummary.pending_sponsored_earnings,
          sponsored_settled_revenue: sponsoredSummary.settled_sponsored_earnings,
          sponsored_total_revenue: sponsoredSummary.total_sponsored_earnings,

          estimated_revenue: totalEstimatedRevenue,
          wallet_available_estimate: availableWalletLikeBalance,
        },
        sponsored_ads: {
          total_gross: sponsoredSummary.total_sponsored_gross,
          total_earnings: sponsoredSummary.total_sponsored_earnings,
          pending_earnings: sponsoredSummary.pending_sponsored_earnings,
          settled_earnings: sponsoredSummary.settled_sponsored_earnings,
          rejected_earnings: sponsoredSummary.rejected_sponsored_earnings,
          total_views: sponsoredSummary.total_sponsored_views,
          total_clicks: sponsoredSummary.total_sponsored_clicks,
          pending_events: sponsoredSummary.pending_events,
          settled_events: sponsoredSummary.settled_events,
        },
        chart: mergedChart,
        top_posts,
        summary_table: {
          today: mergedChart[mergedChart.length - 1]
            ? {
                label: 'Today',
                tracked_post_views: mergedChart[mergedChart.length - 1].post_views,
                platform_estimated_revenue: mergedChart[mergedChart.length - 1].platform_estimated_revenue,
                sponsored_earnings: mergedChart[mergedChart.length - 1].sponsored_earnings,
                estimated_revenue: mergedChart[mergedChart.length - 1].total_estimated_earnings,
              }
            : {
                label: 'Today',
                tracked_post_views: 0,
                platform_estimated_revenue: 0,
                sponsored_earnings: 0,
                estimated_revenue: 0,
              },
          last_7_days: {
            label: 'Last 7 Days',
            tracked_post_views: trackedMonetizableViews,
            platform_estimated_revenue: platformEstimatedRevenue,
            sponsored_earnings: sponsoredSummary.total_sponsored_earnings,
            pending_sponsored_earnings: sponsoredSummary.pending_sponsored_earnings,
            settled_sponsored_earnings: sponsoredSummary.settled_sponsored_earnings,
            estimated_revenue: totalEstimatedRevenue,
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