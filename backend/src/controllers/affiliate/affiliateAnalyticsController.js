const pool = require('../../config/db');

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

async function getOverviewStats(userId, websiteId) {
  const [[productRow]] = await pool.query(
    `
    SELECT COUNT(*) AS total_products
    FROM products
    WHERE user_id = ?
      AND website_id = ?
    `,
    [userId, websiteId]
  );

  const [[postRow]] = await pool.query(
    `
    SELECT COUNT(*) AS total_posts
    FROM product_posts
    WHERE user_id = ?
      AND website_id = ?
    `,
    [userId, websiteId]
  );

  const [[productViewRow]] = await pool.query(
    `
    SELECT COUNT(*) AS total_product_views
    FROM analytics_product_views
    WHERE website_id = ?
    `,
    [websiteId]
  );

  const [[productClickRow]] = await pool.query(
    `
    SELECT COUNT(*) AS total_product_clicks
    FROM analytics_product_clicks
    WHERE website_id = ?
    `,
    [websiteId]
  );

  const [[postViewRow]] = await pool.query(
    `
    SELECT COUNT(*) AS total_post_views
    FROM analytics_post_views
    WHERE website_id = ?
    `,
    [websiteId]
  );

  const [[sliderClickRow]] = await pool.query(
    `
    SELECT COUNT(*) AS total_slider_clicks
    FROM analytics_slider_clicks
    WHERE website_id = ?
    `,
    [websiteId]
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

async function getTopProducts(websiteId) {
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
    WHERE p.website_id = ?
    ORDER BY total_clicks DESC, total_views DESC, p.id DESC
    LIMIT 10
    `,
    [websiteId]
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

async function getTopPosts(websiteId) {
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
    LEFT JOIN products p
      ON p.id = pp.product_id
    WHERE pp.website_id = ?
    ORDER BY total_views DESC, pp.id DESC
    LIMIT 10
    `,
    [websiteId]
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

async function getClickBreakdown(websiteId) {
  const [rows] = await pool.query(
    `
    SELECT
      click_type,
      COUNT(*) AS total
    FROM analytics_product_clicks
    WHERE website_id = ?
    GROUP BY click_type
    ORDER BY click_type ASC
    `,
    [websiteId]
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

async function getRecentAnalyticsActivity(websiteId) {
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
    LEFT JOIN products p
      ON p.id = apc.product_id
    WHERE apc.website_id = ?
    ORDER BY apc.id DESC
    LIMIT 10
    `,
    [websiteId]
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
    LEFT JOIN product_posts pp
      ON pp.id = apv.post_id
    WHERE apv.website_id = ?
    ORDER BY apv.id DESC
    LIMIT 10
    `,
    [websiteId]
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
    WHERE ascx.website_id = ?
    ORDER BY ascx.id DESC
    LIMIT 10
    `,
    [websiteId]
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

async function getAnalyticsOverview(req, res) {
  try {
    const website = await getAffiliateWebsite(req.user.id);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate website not found',
      });
    }

    const overview = await getOverviewStats(req.user.id, website.id);
    const click_breakdown = await getClickBreakdown(website.id);
    const top_products = await getTopProducts(website.id);
    const top_posts = await getTopPosts(website.id);
    const recent_activity = await getRecentAnalyticsActivity(website.id);

    return res.status(200).json({
      ok: true,
      analytics: {
        website: {
          id: website.id,
          website_name: website.website_name,
          slug: website.slug,
          status: website.status,
        },
        overview,
        click_breakdown,
        top_products,
        top_posts,
        recent_activity,
      },
    });
  } catch (error) {
    console.error('getAnalyticsOverview error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch analytics overview',
      error: error.message,
    });
  }
}

async function getProductAnalytics(req, res) {
  try {
    const website = await getAffiliateWebsite(req.user.id);
    const productId = Number(req.params.productId);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate website not found',
      });
    }

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid product id',
      });
    }

    const [[product]] = await pool.query(
      `
      SELECT
        id,
        title,
        slug,
        status,
        product_image
      FROM products
      WHERE id = ?
        AND website_id = ?
        AND user_id = ?
      LIMIT 1
      `,
      [productId, website.id, req.user.id]
    );

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: 'Product not found',
      });
    }

    const [[viewRow]] = await pool.query(
      `
      SELECT COUNT(*) AS total_views
      FROM analytics_product_views
      WHERE product_id = ?
      `,
      [productId]
    );

    const [clickRows] = await pool.query(
      `
      SELECT
        click_type,
        COUNT(*) AS total
      FROM analytics_product_clicks
      WHERE product_id = ?
      GROUP BY click_type
      ORDER BY click_type ASC
      `,
      [productId]
    );

    const clickBreakdown = {
      buy_now: 0,
      read_more: 0,
      learn_more: 0,
    };

    clickRows.forEach((row) => {
      clickBreakdown[row.click_type] = Number(row.total || 0);
    });

    const [[postCountRow]] = await pool.query(
      `
      SELECT COUNT(*) AS total_posts
      FROM product_posts
      WHERE product_id = ?
      `,
      [productId]
    );

    return res.status(200).json({
      ok: true,
      product_analytics: {
        product: {
          id: product.id,
          title: product.title,
          slug: product.slug,
          status: product.status,
          product_image: product.product_image,
        },
        total_views: Number(viewRow?.total_views || 0),
        total_posts: Number(postCountRow?.total_posts || 0),
        click_breakdown: clickBreakdown,
        total_clicks:
          clickBreakdown.buy_now +
          clickBreakdown.read_more +
          clickBreakdown.learn_more,
      },
    });
  } catch (error) {
    console.error('getProductAnalytics error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch product analytics',
      error: error.message,
    });
  }
}

async function getPostAnalytics(req, res) {
  try {
    const website = await getAffiliateWebsite(req.user.id);
    const postId = Number(req.params.postId);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate website not found',
      });
    }

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
        p.id AS product_id,
        p.title AS product_title
      FROM product_posts pp
      LEFT JOIN products p
        ON p.id = pp.product_id
      WHERE pp.id = ?
        AND pp.website_id = ?
        AND pp.user_id = ?
      LIMIT 1
      `,
      [postId, website.id, req.user.id]
    );

    if (!post) {
      return res.status(404).json({
        ok: false,
        message: 'Post not found',
      });
    }

    const [[viewRow]] = await pool.query(
      `
      SELECT COUNT(*) AS total_views
      FROM analytics_post_views
      WHERE post_id = ?
      `,
      [postId]
    );

    const [[ctaRow]] = await pool.query(
      `
      SELECT COUNT(*) AS total_cta_buttons
      FROM post_cta_buttons
      WHERE post_id = ?
      `,
      [postId]
    );

    const [fieldRows] = await pool.query(
      `
      SELECT
        field_key,
        field_type
      FROM post_template_fields
      WHERE post_id = ?
      ORDER BY sort_order ASC, id ASC
      `,
      [postId]
    );

    return res.status(200).json({
      ok: true,
      post_analytics: {
        post: {
          id: post.id,
          title: post.title,
          slug: post.slug,
          status: post.status,
          featured_image: post.featured_image,
          product: post.product_id
            ? {
                id: post.product_id,
                title: post.product_title,
              }
            : null,
        },
        total_views: Number(viewRow?.total_views || 0),
        total_cta_buttons: Number(ctaRow?.total_cta_buttons || 0),
        template_fields_count: fieldRows.length,
        template_fields: fieldRows,
      },
    });
  } catch (error) {
    console.error('getPostAnalytics error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch post analytics',
      error: error.message,
    });
  }
}

module.exports = {
  getAnalyticsOverview,
  getProductAnalytics,
  getPostAnalytics,
};