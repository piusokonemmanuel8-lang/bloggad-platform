const pool = require('../../config/db');

function safeImageUrl(value) {
  const raw = String(value || '').trim();

  if (!raw) return null;

  // Do not send huge base64 images to homepage. It makes homepage slow/fail.
  if (raw.startsWith('data:image')) return null;

  return raw;
}

function sanitizeHomepageProduct(row) {
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    product_image: safeImageUrl(row.product_image),
    pricing_type: row.pricing_type,
    price: row.price !== null ? Number(row.price) : null,
    min_price: row.min_price !== null ? Number(row.min_price) : null,
    max_price: row.max_price !== null ? Number(row.max_price) : null,
    homepage_cta_label: row.homepage_cta_label,
    storefront_cta_label: row.storefront_cta_label,
    short_description: row.short_description,
    visit_count: Number(row.visit_count || 0),
    product_score: row.product_score !== null ? Number(row.product_score) : 4.1,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    affiliate: {
      id: row.affiliate_id,
      name: row.affiliate_name,
      website_slug: row.website_slug,
      website_name: row.website_name,
    },
    category: row.category_id
      ? {
          id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
        }
      : null,
    read_more_url: row.website_slug ? `/${row.website_slug}/product/${row.slug}` : null,
    website_url: row.website_slug ? `/${row.website_slug}` : null,
  };
}

function sanitizeHomepageCategory(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon,
    sort_order: row.sort_order,
    total_products: Number(row.total_products || 0),
  };
}

function sanitizeHomepageWebsite(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.website_name || row.name || 'Website',
    website_name: row.website_name || row.name || 'Website',
    slug: row.slug,
    website_slug: row.slug,
    logo: safeImageUrl(row.logo),
    status: row.status,
    campaign_id: row.campaign_id || null,
    campaign_status: row.campaign_status || null,
    approval_status: row.approval_status || null,
    remaining_budget:
      row.remaining_budget !== null && row.remaining_budget !== undefined
        ? Number(row.remaining_budget)
        : null,
    affiliate: {
      id: row.affiliate_id,
      name: row.affiliate_name,
    },
  };
}

async function getHomepageProducts(limit = 24) {
  const safeLimit = Number.isInteger(Number(limit)) && Number(limit) > 0 ? Number(limit) : 24;

  const [rows] = await pool.query(
    `
    SELECT
      p.id,
      p.title,
      p.slug,
      p.product_image,
      p.pricing_type,
      p.price,
      p.min_price,
      p.max_price,
      p.homepage_cta_label,
      p.storefront_cta_label,
      p.short_description,
      COALESCE(p.visit_count, 0) AS visit_count,
      COALESCE(p.product_score, 4.1) AS product_score,
      p.status,
      p.created_at,
      p.updated_at,

      u.id AS affiliate_id,
      u.name AS affiliate_name,

      aw.website_name,
      aw.slug AS website_slug,

      c.id AS category_id,
      c.name AS category_name,
      c.slug AS category_slug

    FROM products p
    INNER JOIN users u
      ON u.id = p.user_id
     AND u.role = 'affiliate'
     AND u.status = 'active'
    INNER JOIN affiliate_websites aw
      ON aw.id = p.website_id
     AND aw.status = 'active'
    LEFT JOIN categories c
      ON c.id = p.category_id
     AND c.status = 'active'
    WHERE p.status = 'published'
      AND EXISTS (
        SELECT 1
        FROM affiliate_subscriptions paid_s
        INNER JOIN subscription_plans paid_p
          ON paid_p.id = paid_s.plan_id
         AND paid_p.status = 'active'
         AND paid_p.price > 0
        WHERE paid_s.user_id = aw.user_id
          AND paid_s.status = 'active'
          AND paid_s.amount_paid > 0
          AND (paid_s.start_date IS NULL OR paid_s.start_date <= NOW())
          AND (paid_s.end_date IS NULL OR paid_s.end_date > NOW())
      )
    ORDER BY p.id DESC
    LIMIT ?
    `,
    [safeLimit]
  );

  return rows.map(sanitizeHomepageProduct);
}

async function getHomepageCategories(limit = 20) {
  const safeLimit = Number.isInteger(Number(limit)) && Number(limit) > 0 ? Number(limit) : 20;

  const [rows] = await pool.query(
    `
    SELECT
      c.id,
      c.name,
      c.slug,
      c.icon,
      c.sort_order,
      COUNT(CASE WHEN aw.id IS NOT NULL AND u.id IS NOT NULL THEN p.id END) AS total_products
    FROM categories c
    LEFT JOIN products p
      ON p.category_id = c.id
     AND p.status = 'published'
    LEFT JOIN affiliate_websites aw
      ON aw.id = p.website_id
     AND aw.status = 'active'
     AND EXISTS (
       SELECT 1
       FROM affiliate_subscriptions paid_s
       INNER JOIN subscription_plans paid_p
         ON paid_p.id = paid_s.plan_id
        AND paid_p.status = 'active'
        AND paid_p.price > 0
       WHERE paid_s.user_id = aw.user_id
         AND paid_s.status = 'active'
         AND paid_s.amount_paid > 0
         AND (paid_s.start_date IS NULL OR paid_s.start_date <= NOW())
         AND (paid_s.end_date IS NULL OR paid_s.end_date > NOW())
     )
    LEFT JOIN users u
      ON u.id = p.user_id
     AND u.role = 'affiliate'
     AND u.status = 'active'
    WHERE c.status = 'active'
    GROUP BY c.id, c.name, c.slug, c.icon, c.sort_order
    ORDER BY c.sort_order ASC, c.name ASC
    LIMIT ?
    `,
    [safeLimit]
  );

  return rows.map(sanitizeHomepageCategory);
}

async function getHomepageFeaturedWebsites(limit = 10) {
  const safeLimit = Number.isInteger(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10;

  const [rows] = await pool.query(
    `
    SELECT
      aw.id,
      aw.website_name,
      aw.slug,
      aw.logo,
      aw.status,

      u.id AS affiliate_id,
      u.name AS affiliate_name,

      MAX(c.id) AS campaign_id,
      MAX(c.status) AS campaign_status,
      MAX(c.approval_status) AS approval_status,
      MAX(c.remaining_budget) AS remaining_budget

    FROM affiliate_ads_campaigns c
    INNER JOIN affiliate_websites aw
      ON aw.id = c.target_id
     AND aw.status = 'active'
     AND EXISTS (
       SELECT 1
       FROM affiliate_subscriptions paid_s
       INNER JOIN subscription_plans paid_p
         ON paid_p.id = paid_s.plan_id
        AND paid_p.status = 'active'
        AND paid_p.price > 0
       WHERE paid_s.user_id = aw.user_id
         AND paid_s.status = 'active'
         AND paid_s.amount_paid > 0
         AND (paid_s.start_date IS NULL OR paid_s.start_date <= NOW())
         AND (paid_s.end_date IS NULL OR paid_s.end_date > NOW())
     )
    INNER JOIN users u
      ON u.id = aw.user_id
     AND u.role = 'affiliate'
     AND u.status = 'active'
    WHERE c.ad_type = 'website'
      AND c.status = 'active'
      AND c.approval_status = 'approved'
      AND COALESCE(c.remaining_budget, 0) > 0
      AND (
        c.start_date IS NULL
        OR c.start_date <= CURDATE()
      )
      AND (
        c.end_date IS NULL
        OR c.end_date >= CURDATE()
      )
      AND (
        c.daily_budget_cap IS NULL
        OR c.today_spent_date IS NULL
        OR c.today_spent_date <> CURDATE()
        OR COALESCE(c.today_spent, 0) < COALESCE(c.daily_budget_cap, 0)
      )
    GROUP BY
      aw.id,
      aw.website_name,
      aw.slug,
      aw.logo,
      aw.status,
      u.id,
      u.name
    ORDER BY MAX(c.id) DESC
    LIMIT ?
    `,
    [safeLimit]
  );

  return rows.map(sanitizeHomepageWebsite);
}

async function getHomepageStats() {
  const [[productRow]] = await pool.query(
    `
    SELECT COUNT(*) AS total_products
    FROM products p
    INNER JOIN affiliate_websites aw
      ON aw.id = p.website_id
     AND aw.status = 'active'
     AND EXISTS (
       SELECT 1
       FROM affiliate_subscriptions paid_s
       INNER JOIN subscription_plans paid_p
         ON paid_p.id = paid_s.plan_id
        AND paid_p.status = 'active'
        AND paid_p.price > 0
       WHERE paid_s.user_id = aw.user_id
         AND paid_s.status = 'active'
         AND paid_s.amount_paid > 0
         AND (paid_s.start_date IS NULL OR paid_s.start_date <= NOW())
         AND (paid_s.end_date IS NULL OR paid_s.end_date > NOW())
     )
    INNER JOIN users u
      ON u.id = p.user_id
     AND u.role = 'affiliate'
     AND u.status = 'active'
    WHERE p.status = 'published'
    `
  );

  const [[websiteRow]] = await pool.query(
    `
    SELECT COUNT(*) AS total_websites
    FROM affiliate_websites aw
    INNER JOIN users u
      ON u.id = aw.user_id
     AND u.role = 'affiliate'
     AND u.status = 'active'
    WHERE aw.status = 'active'
      AND EXISTS (
        SELECT 1
        FROM affiliate_subscriptions paid_s
        INNER JOIN subscription_plans paid_p
          ON paid_p.id = paid_s.plan_id
         AND paid_p.status = 'active'
         AND paid_p.price > 0
        WHERE paid_s.user_id = aw.user_id
          AND paid_s.status = 'active'
          AND paid_s.amount_paid > 0
          AND (paid_s.start_date IS NULL OR paid_s.start_date <= NOW())
          AND (paid_s.end_date IS NULL OR paid_s.end_date > NOW())
      )
    `
  );

  const [[featuredWebsiteRow]] = await pool.query(
    `
    SELECT COUNT(DISTINCT aw.id) AS total_featured_websites
    FROM affiliate_ads_campaigns c
    INNER JOIN affiliate_websites aw
      ON aw.id = c.target_id
     AND aw.status = 'active'
     AND EXISTS (
       SELECT 1
       FROM affiliate_subscriptions paid_s
       INNER JOIN subscription_plans paid_p
         ON paid_p.id = paid_s.plan_id
        AND paid_p.status = 'active'
        AND paid_p.price > 0
       WHERE paid_s.user_id = aw.user_id
         AND paid_s.status = 'active'
         AND paid_s.amount_paid > 0
         AND (paid_s.start_date IS NULL OR paid_s.start_date <= NOW())
         AND (paid_s.end_date IS NULL OR paid_s.end_date > NOW())
     )
    INNER JOIN users u
      ON u.id = aw.user_id
     AND u.role = 'affiliate'
     AND u.status = 'active'
    WHERE c.ad_type = 'website'
      AND c.status = 'active'
      AND c.approval_status = 'approved'
      AND COALESCE(c.remaining_budget, 0) > 0
      AND (
        c.start_date IS NULL
        OR c.start_date <= CURDATE()
      )
      AND (
        c.end_date IS NULL
        OR c.end_date >= CURDATE()
      )
      AND (
        c.daily_budget_cap IS NULL
        OR c.today_spent_date IS NULL
        OR c.today_spent_date <> CURDATE()
        OR COALESCE(c.today_spent, 0) < COALESCE(c.daily_budget_cap, 0)
      )
    `
  );

  const [[categoryRow]] = await pool.query(
    `
    SELECT COUNT(*) AS total_categories
    FROM categories
    WHERE status = 'active'
    `
  );

  const [[postRow]] = await pool.query(
    `
    SELECT COUNT(*) AS total_posts
    FROM product_posts pp
    LEFT JOIN affiliate_websites aw
      ON aw.id = pp.website_id
     AND aw.status = 'active'
    INNER JOIN users u
      ON u.id = pp.user_id
     AND u.status = 'active'
    WHERE pp.status = 'published'
    `
  );

  return {
    total_products: Number(productRow?.total_products || 0),
    total_websites: Number(websiteRow?.total_websites || 0),
    total_featured_websites: Number(featuredWebsiteRow?.total_featured_websites || 0),
    total_categories: Number(categoryRow?.total_categories || 0),
    total_posts: Number(postRow?.total_posts || 0),
  };
}

function sanitizeHomepageStory(row) {
  if (!row) return null;

  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    featured_image: safeImageUrl(row.featured_image),
    content_type: row.content_type || 'story',
    published_at: row.published_at,
    created_at: row.created_at,
    website_id: row.website_id,
    website_name: row.website_name,
    website_slug: row.website_slug,
    writer_name: row.writer_name || row.website_name || 'Writer',
    writer_page_slug: row.writer_page_slug || null,
    writer_avatar_url: safeImageUrl(
      row.writer_page_logo_url || row.writer_avatar_url || null
    ),
    love_count: Number(row.love_count || 0),
    applaud_count: Number(row.applaud_count || 0),
    comment_count: Number(row.comment_count || 0),
    gift_count: Number(row.gift_count || 0),
  };
}

async function hydrateHomepageStorySocialCounts(rows) {
  const storyRows = Array.isArray(rows) ? rows : [];
  const postIds = storyRows
    .map((row) => Number(row?.id || 0))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (!postIds.length) {
    return storyRows.map(sanitizeHomepageStory);
  }

  const placeholders = postIds.map(() => '?').join(',');

  const [reactionResult, commentResult, giftResult] = await Promise.all([
    pool.query(
      `
      SELECT
        post_id,
        SUM(CASE WHEN reaction_type = 'love' THEN 1 ELSE 0 END) AS love_count,
        SUM(CASE WHEN reaction_type = 'applaud' THEN 1 ELSE 0 END) AS applaud_count
      FROM post_reactions
      WHERE post_id IN (${placeholders})
      GROUP BY post_id
      `,
      postIds
    ),
    pool.query(
      `
      SELECT
        post_id,
        COUNT(*) AS comment_count
      FROM post_comments
      WHERE post_id IN (${placeholders})
        AND status = 'active'
      GROUP BY post_id
      `,
      postIds
    ),
    pool.query(
      `
      SELECT
        post_id,
        COUNT(*) AS gift_count
      FROM writer_appreciations
      WHERE post_id IN (${placeholders})
        AND status = 'completed'
      GROUP BY post_id
      `,
      postIds
    ),
  ]);

  const countsByPost = new Map();

  for (const postId of postIds) {
    countsByPost.set(postId, {
      love_count: 0,
      applaud_count: 0,
      comment_count: 0,
      gift_count: 0,
    });
  }

  for (const row of reactionResult[0] || []) {
    const current = countsByPost.get(Number(row.post_id));
    if (!current) continue;
    current.love_count = Number(row.love_count || 0);
    current.applaud_count = Number(row.applaud_count || 0);
  }

  for (const row of commentResult[0] || []) {
    const current = countsByPost.get(Number(row.post_id));
    if (!current) continue;
    current.comment_count = Number(row.comment_count || 0);
  }

  for (const row of giftResult[0] || []) {
    const current = countsByPost.get(Number(row.post_id));
    if (!current) continue;
    current.gift_count = Number(row.gift_count || 0);
  }

  return storyRows.map((row) =>
    sanitizeHomepageStory({
      ...row,
      ...(countsByPost.get(Number(row?.id || 0)) || {}),
    })
  );
}

async function getHomepageStories(limit = 40) {
  const safeLimit =
    Number.isInteger(Number(limit)) && Number(limit) > 0
      ? Math.min(Number(limit), 80)
      : 40;

  try {
    const [rows] = await pool.query(
      `
      SELECT
        pp.id,
        pp.user_id,
        pp.website_id,
        pp.title,
        pp.slug,
        pp.excerpt,
        pp.featured_image,
        pp.content_type,
        pp.published_at,
        pp.created_at,

        aw.website_name,
        aw.slug AS website_slug,

        u.name AS writer_name,

        (
          SELECT wp.slug
          FROM writer_pages wp
          WHERE wp.user_id = pp.user_id
          ORDER BY wp.is_primary DESC, wp.id DESC
          LIMIT 1
        ) AS writer_page_slug,

        (
          SELECT wp.logo_url
          FROM writer_pages wp
          WHERE wp.user_id = pp.user_id
          ORDER BY wp.is_primary DESC, wp.id DESC
          LIMIT 1
        ) AS writer_page_logo_url,

        (
          SELECT wrp.avatar_url
          FROM writer_profiles wrp
          WHERE wrp.user_id = pp.user_id
            AND wrp.status = 'active'
          ORDER BY wrp.id DESC
          LIMIT 1
        ) AS writer_avatar_url

      FROM product_posts pp
      LEFT JOIN affiliate_websites aw
        ON aw.id = pp.website_id
       AND aw.status = 'active'
      INNER JOIN users u
        ON u.id = pp.user_id
       AND u.status = 'active'
      WHERE pp.status = 'published'
      ORDER BY COALESCE(pp.published_at, pp.created_at) DESC, pp.id DESC
      LIMIT ?
      `,
      [safeLimit]
    );

    return hydrateHomepageStorySocialCounts(rows);
  } catch (error) {
    const [rows] = await pool.query(
      `
      SELECT
        pp.id,
        pp.user_id,
        pp.website_id,
        pp.title,
        pp.slug,
        pp.excerpt,
        pp.featured_image,
        pp.content_type,
        pp.published_at,
        pp.created_at,

        aw.website_name,
        aw.slug AS website_slug,

        u.name AS writer_name,

        NULL AS writer_page_slug,

        NULL AS writer_page_logo_url,

        (
          SELECT wrp.avatar_url
          FROM writer_profiles wrp
          WHERE wrp.user_id = pp.user_id
            AND wrp.status = 'active'
          ORDER BY wrp.id DESC
          LIMIT 1
        ) AS writer_avatar_url

      FROM product_posts pp
      LEFT JOIN affiliate_websites aw
        ON aw.id = pp.website_id
       AND aw.status = 'active'
      INNER JOIN users u
        ON u.id = pp.user_id
       AND u.status = 'active'
      WHERE pp.status = 'published'
      ORDER BY COALESCE(pp.published_at, pp.created_at) DESC, pp.id DESC
      LIMIT ?
      `,
      [safeLimit]
    );

    return hydrateHomepageStorySocialCounts(rows);
  }
}
async function getHomepage(req, res) {
  try {
    const posts = await getHomepageStories();
    const products = await getHomepageProducts();
    const categories = await getHomepageCategories();
    const featured_websites = await getHomepageFeaturedWebsites();
    const stats = await getHomepageStats();

    return res.status(200).json({
      ok: true,
      page: {
        name: 'Bloggad Homepage',
        label: 'Block Marketplace',
      },
      stats,
      categories,
      featured_websites,
      posts,
      products,
    });
  } catch (error) {
    console.error('getHomepage error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch homepage data',
      error: error.message,
    });
  }
}

async function getHomepageFeaturedProducts(req, res) {
  try {
    const limit =
      Number.isInteger(Number(req.query.limit)) && Number(req.query.limit) > 0
        ? Number(req.query.limit)
        : 12;

    const products = await getHomepageProducts(limit);

    return res.status(200).json({
      ok: true,
      posts,
      products,
    });
  } catch (error) {
    console.error('getHomepageFeaturedProducts error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch featured products',
      error: error.message,
    });
  }
}

async function getHomepageCategoriesList(req, res) {
  try {
    const limit =
      Number.isInteger(Number(req.query.limit)) && Number(req.query.limit) > 0
        ? Number(req.query.limit)
        : 20;

    const categories = await getHomepageCategories(limit);

    return res.status(200).json({
      ok: true,
      categories,
    });
  } catch (error) {
    console.error('getHomepageCategoriesList error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch homepage categories',
      error: error.message,
    });
  }
}

module.exports = {
  getHomepage,
  getHomepageFeaturedProducts,
  getHomepageCategoriesList,
};
