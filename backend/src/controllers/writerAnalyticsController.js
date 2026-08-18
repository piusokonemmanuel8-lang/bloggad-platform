const pool = require('../config/db');

function normalizeTrendDays(value) {
  const requested = Number(value);
  return [7, 30, 90].includes(requested) ? requested : 30;
}

function addUtcDays(dateKey, offset) {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function buildTrendComparison(currentPoints, previousPoints, key) {
  const current = currentPoints.reduce((sum, point) => sum + Number(point?.[key] || 0), 0);
  const previous = previousPoints.reduce((sum, point) => sum + Number(point?.[key] || 0), 0);

  let changePercent = 0;

  if (previous > 0) {
    changePercent = ((current - previous) / previous) * 100;
  } else if (current > 0) {
    changePercent = 100;
  }

  return {
    current,
    previous,
    change_percent: Number(changePercent.toFixed(2)),
    direction: current > previous ? 'up' : current < previous ? 'down' : 'flat',
  };
}

async function getWriterOverview(userId) {
  const [[productRow]] = await pool.query(
    `SELECT COUNT(*) AS total_products FROM products WHERE user_id = ?`,
    [userId]
  );

  const [[postRow]] = await pool.query(
    `SELECT COUNT(*) AS total_posts FROM product_posts WHERE user_id = ?`,
    [userId]
  );

  const [[productViewRow]] = await pool.query(
    `
    SELECT COUNT(*) AS total_product_views
    FROM analytics_product_views apv
    INNER JOIN products p ON p.id = apv.product_id
    WHERE p.user_id = ?
    `,
    [userId]
  );

  const [[productClickRow]] = await pool.query(
    `
    SELECT COUNT(*) AS total_product_clicks
    FROM analytics_product_clicks apc
    INNER JOIN products p ON p.id = apc.product_id
    WHERE p.user_id = ?
    `,
    [userId]
  );

  const [[postViewRow]] = await pool.query(
    `
    SELECT COUNT(*) AS total_post_views
    FROM analytics_post_views apv
    INNER JOIN product_posts pp ON pp.id = apv.post_id
    WHERE pp.user_id = ?
    `,
    [userId]
  );

  const [[sliderClickRow]] = await pool.query(
    `
    SELECT COUNT(*) AS total_slider_clicks
    FROM analytics_slider_clicks ascx
    WHERE ascx.website_id IN (
      SELECT aw.id
      FROM affiliate_websites aw
      WHERE aw.user_id = ?
    )
    `,
    [userId]
  );

  return {
    total_products: Number(productRow?.total_products || 0),
    total_posts: Number(postRow?.total_posts || 0),
    total_product_views: Number(productViewRow?.total_product_views || 0),
    total_product_clicks: Number(productClickRow?.total_product_clicks || 0),
    total_post_views: Number(postViewRow?.total_post_views || 0),
    total_slider_clicks: Number(sliderClickRow?.total_slider_clicks || 0),
  };
}

async function getWriterTopProducts(userId) {
  const [rows] = await pool.query(
    `
    SELECT
      p.id,
      p.title,
      p.slug,
      p.status,
      p.product_image,
      (
        SELECT COUNT(*)
        FROM analytics_product_views apv
        WHERE apv.product_id = p.id
      ) AS total_views,
      (
        SELECT COUNT(*)
        FROM analytics_product_clicks apc
        WHERE apc.product_id = p.id
      ) AS total_clicks,
      (
        SELECT COUNT(*)
        FROM product_posts pp
        WHERE pp.product_id = p.id
      ) AS total_posts
    FROM products p
    WHERE p.user_id = ?
    ORDER BY total_clicks DESC, total_views DESC, p.id DESC
    LIMIT 10
    `,
    [userId]
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    product_image: row.product_image,
    total_views: Number(row.total_views || 0),
    total_clicks: Number(row.total_clicks || 0),
    total_posts: Number(row.total_posts || 0),
  }));
}

async function getWriterTopPosts(userId) {
  const [rows] = await pool.query(
    `
    SELECT
      pp.id,
      pp.title,
      pp.slug,
      pp.status,
      pp.featured_image,
      p.id AS product_id,
      p.title AS product_title,
      (
        SELECT COUNT(*)
        FROM analytics_post_views apv
        WHERE apv.post_id = pp.id
      ) AS total_views,
      (
        SELECT COUNT(*)
        FROM post_cta_buttons pcb
        WHERE pcb.post_id = pp.id
      ) AS total_cta_buttons
    FROM product_posts pp
    LEFT JOIN products p ON p.id = pp.product_id
    WHERE pp.user_id = ?
    ORDER BY total_views DESC, pp.id DESC
    LIMIT 10
    `,
    [userId]
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    featured_image: row.featured_image,
    product: row.product_id
      ? {
          id: row.product_id,
          title: row.product_title,
        }
      : null,
    total_views: Number(row.total_views || 0),
    total_cta_buttons: Number(row.total_cta_buttons || 0),
  }));
}

async function getWriterClickBreakdown(userId) {
  const [rows] = await pool.query(
    `
    SELECT
      apc.click_type,
      COUNT(*) AS total
    FROM analytics_product_clicks apc
    INNER JOIN products p ON p.id = apc.product_id
    WHERE p.user_id = ?
    GROUP BY apc.click_type
    ORDER BY apc.click_type ASC
    `,
    [userId]
  );

  const result = {
    buy_now: 0,
    read_more: 0,
    learn_more: 0,
  };

  rows.forEach((row) => {
    result[row.click_type] = Number(row.total || 0);
  });

  return result;
}

async function getWriterRecentActivity(userId) {
  const [productClicks] = await pool.query(
    `
    SELECT
      'product_click' AS activity_type,
      apc.id,
      apc.click_type,
      apc.created_at,
      p.id AS product_id,
      p.title AS product_title,
      NULL AS post_id,
      NULL AS post_title
    FROM analytics_product_clicks apc
    INNER JOIN products p ON p.id = apc.product_id
    WHERE p.user_id = ?
    ORDER BY apc.id DESC
    LIMIT 10
    `,
    [userId]
  );

  const [postViews] = await pool.query(
    `
    SELECT
      'post_view' AS activity_type,
      apv.id,
      NULL AS click_type,
      apv.created_at,
      NULL AS product_id,
      NULL AS product_title,
      pp.id AS post_id,
      pp.title AS post_title
    FROM analytics_post_views apv
    INNER JOIN product_posts pp ON pp.id = apv.post_id
    WHERE pp.user_id = ?
    ORDER BY apv.id DESC
    LIMIT 10
    `,
    [userId]
  );

  const [sliderClicks] = await pool.query(
    `
    SELECT
      'slider_click' AS activity_type,
      ascx.id,
      NULL AS click_type,
      ascx.created_at,
      NULL AS product_id,
      NULL AS product_title,
      NULL AS post_id,
      NULL AS post_title
    FROM analytics_slider_clicks ascx
    WHERE ascx.website_id IN (
      SELECT aw.id
      FROM affiliate_websites aw
      WHERE aw.user_id = ?
    )
    ORDER BY ascx.id DESC
    LIMIT 10
    `,
    [userId]
  );

  const merged = [...productClicks, ...postViews, ...sliderClicks]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 15);

  return merged.map((row) => ({
    activity_type: row.activity_type,
    id: row.id,
    click_type: row.click_type,
    created_at: row.created_at,
    product: row.product_id
      ? {
          id: row.product_id,
          title: row.product_title,
        }
      : null,
    post: row.post_id
      ? {
          id: row.post_id,
          title: row.post_title,
        }
      : null,
  }));
}

async function getWriterTrafficTrend(userId, days = 30) {
  const safeDays = normalizeTrendDays(days);
  const windowDays = safeDays * 2;
  const historyDays = windowDays - 1;

  const [[todayRow]] = await pool.query(
    `SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS today`
  );

  const [rows] = await pool.query(
    `
    SELECT
      DATE_FORMAT(DATE(event_time), '%Y-%m-%d') AS day,
      SUM(CASE WHEN event_type = 'product_view' THEN 1 ELSE 0 END) AS product_views,
      SUM(CASE WHEN event_type = 'product_click' THEN 1 ELSE 0 END) AS product_clicks,
      SUM(CASE WHEN event_type = 'post_view' THEN 1 ELSE 0 END) AS post_views,
      SUM(CASE WHEN event_type = 'slider_click' THEN 1 ELSE 0 END) AS slider_clicks
    FROM (
      SELECT apv.created_at AS event_time, 'product_view' AS event_type
      FROM analytics_product_views apv
      INNER JOIN products p ON p.id = apv.product_id
      WHERE p.user_id = ?
        AND apv.created_at >= DATE_SUB(CURDATE(), INTERVAL ${historyDays} DAY)

      UNION ALL

      SELECT apc.created_at AS event_time, 'product_click' AS event_type
      FROM analytics_product_clicks apc
      INNER JOIN products p ON p.id = apc.product_id
      WHERE p.user_id = ?
        AND apc.created_at >= DATE_SUB(CURDATE(), INTERVAL ${historyDays} DAY)

      UNION ALL

      SELECT apv.created_at AS event_time, 'post_view' AS event_type
      FROM analytics_post_views apv
      INNER JOIN product_posts pp ON pp.id = apv.post_id
      WHERE pp.user_id = ?
        AND apv.created_at >= DATE_SUB(CURDATE(), INTERVAL ${historyDays} DAY)

      UNION ALL

      SELECT ascx.created_at AS event_time, 'slider_click' AS event_type
      FROM analytics_slider_clicks ascx
      WHERE ascx.website_id IN (
        SELECT aw.id
        FROM affiliate_websites aw
        WHERE aw.user_id = ?
      )
        AND ascx.created_at >= DATE_SUB(CURDATE(), INTERVAL ${historyDays} DAY)
    ) analytics_events
    GROUP BY DATE(event_time)
    ORDER BY DATE(event_time) ASC
    `,
    [userId, userId, userId, userId]
  );

  const byDay = new Map(
    rows.map((row) => [
      String(row.day),
      {
        product_views: Number(row.product_views || 0),
        product_clicks: Number(row.product_clicks || 0),
        post_views: Number(row.post_views || 0),
        slider_clicks: Number(row.slider_clicks || 0),
      },
    ])
  );

  const today = String(todayRow?.today || new Date().toISOString().slice(0, 10));

  const allPoints = Array.from({ length: windowDays }, (_, index) => {
    const date = addUtcDays(today, index - (windowDays - 1));
    const values = byDay.get(date) || {
      product_views: 0,
      product_clicks: 0,
      post_views: 0,
      slider_clicks: 0,
    };

    const totalActivity =
      Number(values.product_views || 0) +
      Number(values.product_clicks || 0) +
      Number(values.post_views || 0) +
      Number(values.slider_clicks || 0);

    return {
      date,
      product_views: Number(values.product_views || 0),
      product_clicks: Number(values.product_clicks || 0),
      post_views: Number(values.post_views || 0),
      slider_clicks: Number(values.slider_clicks || 0),
      total_activity: totalActivity,
    };
  });

  const previousPoints = allPoints.slice(0, safeDays);
  const currentPoints = allPoints.slice(safeDays);

  return {
    days: safeDays,
    points: currentPoints,
    comparison: {
      total_activity: buildTrendComparison(currentPoints, previousPoints, 'total_activity'),
      product_views: buildTrendComparison(currentPoints, previousPoints, 'product_views'),
      product_clicks: buildTrendComparison(currentPoints, previousPoints, 'product_clicks'),
      post_views: buildTrendComparison(currentPoints, previousPoints, 'post_views'),
      slider_clicks: buildTrendComparison(currentPoints, previousPoints, 'slider_clicks'),
    },
  };
}

async function getWriterAnalyticsOverview(req, res) {
  try {
    const userId = Number(req.user.id);

    const [
      overview,
      click_breakdown,
      top_products,
      top_posts,
      recent_activity,
      trend,
    ] = await Promise.all([
      getWriterOverview(userId),
      getWriterClickBreakdown(userId),
      getWriterTopProducts(userId),
      getWriterTopPosts(userId),
      getWriterRecentActivity(userId),
      getWriterTrafficTrend(userId, req.query?.days),
    ]);

    return res.status(200).json({
      ok: true,
      analytics: {
        scope: 'writer',
        website: null,
        overview,
        click_breakdown,
        top_products,
        top_posts,
        recent_activity,
        trend,
      },
    });
  } catch (error) {
    console.error('getWriterAnalyticsOverview error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch Writer analytics',
      error: error.message,
    });
  }
}

module.exports = {
  getWriterAnalyticsOverview,
};