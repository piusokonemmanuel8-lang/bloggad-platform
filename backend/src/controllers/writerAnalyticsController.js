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


// BLOGGAD_PRO_POST_ANALYTICS_V1
function parseAnalyticsFeatures(value) {
  if (!value) return {};

  if (typeof value === 'object') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return {};
  }
}

async function getWriterAdvancedAnalyticsAccess(userId) {
  const [rows] = await pool.query(
    `
    SELECT
      p.id,
      p.name,
      p.price,
      p.billing_cycle,
      p.features_json
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

  const plan = rows[0] || null;
  const features = parseAnalyticsFeatures(plan?.features_json);
  const enabled =
    features?.advanced_post_analytics === true ||
    features?.advanced_post_analytics === 1 ||
    String(features?.advanced_post_analytics || '').toLowerCase() === 'true';

  return {
    advanced_post_analytics: enabled,
    plan: plan
      ? {
          id: plan.id,
          name: plan.name,
          price: plan.price !== null ? Number(plan.price) : null,
          billing_cycle: plan.billing_cycle,
        }
      : null,
  };
}

function classifyAnalyticsReferrer(value) {
  const raw = String(value || '').trim();

  if (!raw) {
    return 'Direct';
  }

  let url;

  try {
    url = new URL(raw);
  } catch (error) {
    return 'External';
  }

  const host = String(url.hostname || '').toLowerCase();
  const path = String(url.pathname || '').toLowerCase();

  if (host === 'bloggad.com' || host.endsWith('.bloggad.com')) {
    if (path === '/' || path.startsWith('/reader/feed')) {
      return 'Bloggad feed';
    }

    if (path.startsWith('/page/')) {
      return 'Writer Page';
    }

    if (path.includes('/post/')) {
      return 'Other Bloggad posts';
    }

    return 'Bloggad internal';
  }

  if (
    host.includes('google.') ||
    host.includes('bing.') ||
    host.includes('yahoo.') ||
    host.includes('duckduckgo.')
  ) {
    return 'Search';
  }

  if (
    host.includes('facebook.') ||
    host.includes('instagram.') ||
    host.includes('linkedin.') ||
    host.includes('tiktok.') ||
    host.includes('youtube.') ||
    host.includes('reddit.') ||
    host.includes('twitter.') ||
    host === 'x.com' ||
    host.endsWith('.x.com') ||
    host.includes('whatsapp.')
  ) {
    return 'Social';
  }

  return 'External';
}

function percentage(part, total) {
  const safePart = Number(part || 0);
  const safeTotal = Number(total || 0);
  return safeTotal > 0 ? Number(((safePart / safeTotal) * 100).toFixed(1)) : 0;
}

async function getWriterPostAnalytics(req, res) {
  try {
    const userId = Number(req.user.id);
    const postId = Number(req.params.postId);

    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid post id',
      });
    }

    const [[post]] = await pool.query(
      `
      SELECT
        pp.id,
        pp.title,
        pp.slug,
        pp.status,
        pp.featured_image,
        pp.website_id,
        aw.website_name,
        aw.slug AS website_slug
      FROM product_posts pp
      LEFT JOIN affiliate_websites aw
        ON aw.id = pp.website_id
      WHERE pp.id = ?
        AND pp.user_id = ?
      LIMIT 1
      `,
      [postId, userId]
    );

    if (!post) {
      return res.status(404).json({
        ok: false,
        message: 'Post not found',
      });
    }

    const [[viewRow], access] = await Promise.all([
      pool
        .query(
          `
          SELECT COUNT(*) AS total_views
          FROM analytics_post_views
          WHERE post_id = ?
          `,
          [postId]
        )
        .then(([rows]) => rows),
      getWriterAdvancedAnalyticsAccess(userId),
    ]);

    const totalViews = Number(viewRow?.total_views || 0);

    const basePayload = {
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status,
        featured_image: post.featured_image,
        website: post.website_id
          ? {
              id: post.website_id,
              name: post.website_name,
              slug: post.website_slug,
            }
          : null,
      },
      total_views: totalViews,
      access,
      advanced: null,
    };

    if (!access.advanced_post_analytics) {
      return res.status(200).json({
        ok: true,
        post_analytics: basePayload,
      });
    }

    const [
      [summaryRows],
      [funnelRows],
      [countryRows],
      [deviceRows],
      [referrerRows],
      [readerTypeRows],
      [linkSummaryRows],
      [linkRows],
    ] = await Promise.all([
      pool.query(
        `
        SELECT
          COUNT(*) AS sessions,
          COUNT(DISTINCT visitor_key) AS unique_readers,
          COUNT(
            DISTINCT CASE
              WHEN engaged_seconds >= 10 OR max_scroll_percent >= 25
              THEN visitor_key
              ELSE NULL
            END
          ) AS engaged_readers,
          ROUND(AVG(engaged_seconds), 1) AS average_reading_time_seconds,
          ROUND(AVG(max_scroll_percent), 1) AS average_scroll_percent,
          MAX(estimated_read_seconds) AS estimated_read_seconds,
          COUNT(
            DISTINCT CASE
              WHEN completed = 1 OR max_scroll_percent >= 95
              THEN visitor_key
              ELSE NULL
            END
          ) AS completed_readers,
          COUNT(
            DISTINCT CASE
              WHEN country_code = 'ZZ'
              THEN visitor_key
              ELSE NULL
            END
          ) AS unknown_country_readers
        FROM analytics_post_engagements
        WHERE post_id = ?
        `,
        [postId]
      ),
      pool.query(
        `
        SELECT
          COUNT(DISTINCT CASE WHEN max_scroll_percent >= 25 THEN visitor_key END) AS reached_25,
          COUNT(DISTINCT CASE WHEN max_scroll_percent >= 50 THEN visitor_key END) AS reached_50,
          COUNT(DISTINCT CASE WHEN max_scroll_percent >= 75 THEN visitor_key END) AS reached_75,
          COUNT(
            DISTINCT CASE
              WHEN completed = 1 OR max_scroll_percent >= 95
              THEN visitor_key
            END
          ) AS reached_100
        FROM analytics_post_engagements
        WHERE post_id = ?
        `,
        [postId]
      ),
      pool.query(
        `
        SELECT
          country_code,
          COUNT(DISTINCT visitor_key) AS readers
        FROM analytics_post_engagements
        WHERE post_id = ?
        GROUP BY country_code
        ORDER BY readers DESC, country_code ASC
        LIMIT 40
        `,
        [postId]
      ),
      pool.query(
        `
        SELECT
          device_type,
          COUNT(DISTINCT visitor_key) AS readers
        FROM analytics_post_engagements
        WHERE post_id = ?
        GROUP BY device_type
        ORDER BY readers DESC, device_type ASC
        `,
        [postId]
      ),
      pool.query(
        `
        SELECT
          COALESCE(referrer, '') AS referrer,
          COUNT(DISTINCT visitor_key) AS readers
        FROM analytics_post_engagements
        WHERE post_id = ?
        GROUP BY referrer
        ORDER BY readers DESC
        LIMIT 100
        `,
        [postId]
      ),
      pool.query(
        `
        SELECT
          SUM(CASE WHEN visits = 1 THEN 1 ELSE 0 END) AS new_readers,
          SUM(CASE WHEN visits > 1 THEN 1 ELSE 0 END) AS returning_readers
        FROM (
          SELECT visitor_key, COUNT(*) AS visits
          FROM analytics_post_engagements
          WHERE post_id = ?
          GROUP BY visitor_key
        ) reader_visits
        `,
        [postId]
      ),
      pool.query(
        `
        SELECT
          COUNT(*) AS total_link_clicks,
          COUNT(DISTINCT visitor_key) AS unique_link_clickers
        FROM analytics_post_link_clicks
        WHERE post_id = ?
        `,
        [postId]
      ),
      pool.query(
        `
        SELECT
          link_hash,
          MAX(link_url) AS link_url,
          MAX(link_text) AS link_text,
          COUNT(*) AS clicks,
          COUNT(DISTINCT visitor_key) AS unique_clickers
        FROM analytics_post_link_clicks
        WHERE post_id = ?
        GROUP BY link_hash
        ORDER BY clicks DESC, unique_clickers DESC
        LIMIT 50
        `,
        [postId]
      ),
    ]);

    const summaryRow = summaryRows[0] || {};
    const funnelRow = funnelRows[0] || {};
    const readerTypeRow = readerTypeRows[0] || {};
    const linkSummaryRow = linkSummaryRows[0] || {};
    const uniqueReaders = Number(summaryRow.unique_readers || 0);
    const engagedReaders = Number(summaryRow.engaged_readers || 0);
    const completedReaders = Number(summaryRow.completed_readers || 0);
    const uniqueLinkClickers = Number(linkSummaryRow.unique_link_clickers || 0);

    const trafficMap = new Map();

    referrerRows.forEach((row) => {
      const source = classifyAnalyticsReferrer(row.referrer);
      trafficMap.set(
        source,
        Number(trafficMap.get(source) || 0) + Number(row.readers || 0)
      );
    });

    const trafficSources = Array.from(trafficMap.entries())
      .map(([source, readers]) => ({
        source,
        readers,
        percent: percentage(readers, uniqueReaders),
      }))
      .sort((a, b) => b.readers - a.readers);

    const countries = countryRows.map((row) => ({
      country_code: row.country_code || 'ZZ',
      readers: Number(row.readers || 0),
      percent: percentage(row.readers, uniqueReaders),
    }));

    const devices = deviceRows.map((row) => ({
      device_type: row.device_type || 'unknown',
      readers: Number(row.readers || 0),
      percent: percentage(row.readers, uniqueReaders),
    }));

    const links = linkRows.map((row) => ({
      link_hash: row.link_hash,
      link_url: row.link_url,
      link_text: row.link_text,
      clicks: Number(row.clicks || 0),
      unique_clickers: Number(row.unique_clickers || 0),
      ctr: percentage(row.unique_clickers, uniqueReaders),
    }));

    return res.status(200).json({
      ok: true,
      post_analytics: {
        ...basePayload,
        advanced: {
          summary: {
            total_views: totalViews,
            sessions: Number(summaryRow.sessions || 0),
            unique_readers: uniqueReaders,
            engaged_readers: engagedReaders,
            engagement_rate: percentage(engagedReaders, uniqueReaders),
            average_reading_time_seconds: Number(
              summaryRow.average_reading_time_seconds || 0
            ),
            estimated_read_seconds: Number(summaryRow.estimated_read_seconds || 0),
            average_scroll_percent: Number(summaryRow.average_scroll_percent || 0),
            completed_readers: completedReaders,
            completion_rate: percentage(completedReaders, uniqueReaders),
            total_link_clicks: Number(linkSummaryRow.total_link_clicks || 0),
            unique_link_clickers: uniqueLinkClickers,
            link_ctr: percentage(uniqueLinkClickers, uniqueReaders),
            unknown_country_readers: Number(
              summaryRow.unknown_country_readers || 0
            ),
          },
          completion_funnel: {
            reached_25: Number(funnelRow.reached_25 || 0),
            reached_50: Number(funnelRow.reached_50 || 0),
            reached_75: Number(funnelRow.reached_75 || 0),
            reached_100: Number(funnelRow.reached_100 || 0),
          },
          countries,
          devices,
          traffic_sources: trafficSources,
          reader_types: {
            new_readers: Number(readerTypeRow.new_readers || 0),
            returning_readers: Number(readerTypeRow.returning_readers || 0),
          },
          links,
        },
      },
    });
  } catch (error) {
    console.error('getWriterPostAnalytics error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch post analytics',
      error: error.message,
    });
  }
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
  getWriterPostAnalytics,
};