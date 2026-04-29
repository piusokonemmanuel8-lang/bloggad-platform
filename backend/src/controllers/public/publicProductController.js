const pool = require('../../config/db');

function sanitizeProduct(row) {
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    product_image: row.product_image,
    pricing_type: row.pricing_type,
    price: row.price !== null ? Number(row.price) : null,
    min_price: row.min_price !== null ? Number(row.min_price) : null,
    max_price: row.max_price !== null ? Number(row.max_price) : null,
    homepage_cta_label: row.homepage_cta_label,
    storefront_cta_label: row.storefront_cta_label,
    affiliate_buy_url: row.affiliate_buy_url,
    short_description: row.short_description,
    visit_count: Number(row.visit_count || 0),
    product_score: row.product_score !== null ? Number(row.product_score) : 4.1,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    affiliate: {
      id: row.affiliate_id,
      name: row.affiliate_name,
      website_name: row.website_name,
      website_slug: row.website_slug,
    },
    category: row.category_id
      ? {
          id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
        }
      : null,
    read_more_url: `/${row.website_slug}/product/${row.slug}`,
    posts_url: `/${row.website_slug}/product/${row.slug}/posts`,
  };
}

function sanitizePost(row) {
  if (!row) return null;

  return {
    id: row.id,
    product_id: row.product_id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    featured_image: row.featured_image,
    status: row.status,
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    template: row.template_id
      ? {
          id: row.template_id,
          name: row.template_name,
          slug: row.template_slug,
        }
      : null,
    category: row.category_id
      ? {
          id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
        }
      : null,
    url: `/${row.website_slug}/post/${row.slug}`,
  };
}

function normalizeClickType(value = '') {
  const clickType = String(value || '').trim().toLowerCase();

  const allowedTypes = new Set([
    'buy_now',
    'read_more',
    'learn_more',
    'quick_view',
    'save',
    'share',
    'visit_website',
    'impression',
    'product_visit',
  ]);

  return allowedTypes.has(clickType) ? clickType : '';
}

function getVisitIncrement(clickType) {
  if (clickType === 'quick_view') return 1;

  if (['buy_now', 'read_more', 'learn_more', 'visit_website', 'product_visit'].includes(clickType)) {
    return 5;
  }

  return 0;
}

function calculateProductScore(visitCount) {
  const visits = Number(visitCount || 0);

  if (visits >= 1000000) return 5.0;
  if (visits >= 500000) return 4.9;
  if (visits >= 100000) return 4.8;
  if (visits >= 50000) return 4.7;
  if (visits >= 10000) return 4.6;
  if (visits >= 5000) return 4.5;
  if (visits >= 1000) return 4.4;
  if (visits >= 500) return 4.3;
  if (visits >= 100) return 4.2;

  return 4.1;
}

function getRedirectUrlForClick(product, clickType) {
  if (!product) return '#';

  if (clickType === 'buy_now') {
    return product.affiliate_buy_url || `/${product.website_slug}/product/${product.slug}`;
  }

  if (clickType === 'visit_website') {
    return product.website_slug ? `/${product.website_slug}` : '#';
  }

  if (clickType === 'quick_view' || clickType === 'save' || clickType === 'share' || clickType === 'impression') {
    return '#';
  }

  return `/${product.website_slug}/product/${product.slug}`;
}

async function increaseProductVisitCount(productId, increment = 5) {
  const safeIncrement = Number(increment || 0);

  if (!safeIncrement || safeIncrement < 1) {
    return getProductVisitData(productId);
  }

  await pool.query(
    `
    UPDATE products
    SET visit_count = COALESCE(visit_count, 0) + ?
    WHERE id = ?
    LIMIT 1
    `,
    [safeIncrement, productId]
  );

  const [[visitRow]] = await pool.query(
    `
    SELECT COALESCE(visit_count, 0) AS visit_count
    FROM products
    WHERE id = ?
    LIMIT 1
    `,
    [productId]
  );

  const visitCount = Number(visitRow?.visit_count || 0);
  const productScore = calculateProductScore(visitCount);

  await pool.query(
    `
    UPDATE products
    SET product_score = ?
    WHERE id = ?
    LIMIT 1
    `,
    [productScore, productId]
  );

  return {
    visit_count: visitCount,
    product_score: productScore,
  };
}

async function getProductVisitData(productId) {
  const [[row]] = await pool.query(
    `
    SELECT
      COALESCE(visit_count, 0) AS visit_count,
      COALESCE(product_score, 4.1) AS product_score
    FROM products
    WHERE id = ?
    LIMIT 1
    `,
    [productId]
  );

  return {
    visit_count: Number(row?.visit_count || 0),
    product_score: row?.product_score !== null ? Number(row?.product_score || 4.1) : 4.1,
  };
}

async function trackProductView(productId, websiteId, req) {
  try {
    await pool.query(
      `
      INSERT INTO analytics_product_views
      (
        product_id,
        website_id,
        user_id,
        ip_address,
        referrer,
        user_agent,
        created_at
      )
      VALUES (?, ?, NULL, ?, ?, ?, NOW())
      `,
      [
        productId,
        websiteId,
        req.ip || null,
        req.get('referer') || null,
        req.get('user-agent') || null,
      ]
    );
  } catch (error) {
    console.error('trackProductView error:', error.message);
  }
}

async function getPublicProductBySlug(websiteSlug, productSlug) {
  const [rows] = await pool.query(
    `
    SELECT
      p.id,
      p.website_id,
      p.user_id,
      p.category_id,
      p.title,
      p.slug,
      p.product_image,
      p.pricing_type,
      p.price,
      p.min_price,
      p.max_price,
      p.homepage_cta_label,
      p.storefront_cta_label,
      p.affiliate_buy_url,
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
      aw.status AS website_status,

      c.name AS category_name,
      c.slug AS category_slug

    FROM products p
    INNER JOIN affiliate_websites aw
      ON aw.id = p.website_id
     AND aw.status = 'active'
    INNER JOIN users u
      ON u.id = p.user_id
     AND u.role = 'affiliate'
     AND u.status = 'active'
    LEFT JOIN categories c
      ON c.id = p.category_id
     AND c.status = 'active'
    WHERE aw.slug = ?
      AND p.slug = ?
      AND p.status = 'published'
    LIMIT 1
    `,
    [websiteSlug, productSlug]
  );

  return rows[0] || null;
}

async function getPublishedPostsForProduct(productId, websiteSlug) {
  const [rows] = await pool.query(
    `
    SELECT
      pp.id,
      pp.product_id,
      pp.category_id,
      pp.template_id,
      pp.title,
      pp.slug,
      pp.excerpt,
      pp.seo_title,
      pp.seo_description,
      pp.featured_image,
      pp.status,
      pp.published_at,
      pp.created_at,
      pp.updated_at,
      bt.name AS template_name,
      bt.slug AS template_slug,
      c.name AS category_name,
      c.slug AS category_slug,
      ? AS website_slug
    FROM product_posts pp
    LEFT JOIN blog_templates bt
      ON bt.id = pp.template_id
    LEFT JOIN categories c
      ON c.id = pp.category_id
     AND c.status = 'active'
    WHERE pp.product_id = ?
      AND pp.status = 'published'
    ORDER BY pp.id DESC
    `,
    [websiteSlug, productId]
  );

  return rows.map(sanitizePost);
}

async function getRelatedProducts(websiteId, categoryId, currentProductId, websiteSlug, limit = 8) {
  let sql = `
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
      p.affiliate_buy_url,
      p.short_description,
      COALESCE(p.visit_count, 0) AS visit_count,
      COALESCE(p.product_score, 4.1) AS product_score,
      p.status,
      p.created_at,
      p.updated_at,
      p.category_id,

      u.id AS affiliate_id,
      u.name AS affiliate_name,

      aw.website_name,
      aw.slug AS website_slug,

      c.name AS category_name,
      c.slug AS category_slug
    FROM products p
    INNER JOIN affiliate_websites aw
      ON aw.id = p.website_id
     AND aw.status = 'active'
    INNER JOIN users u
      ON u.id = p.user_id
     AND u.role = 'affiliate'
     AND u.status = 'active'
    LEFT JOIN categories c
      ON c.id = p.category_id
     AND c.status = 'active'
    WHERE p.website_id = ?
      AND p.status = 'published'
      AND p.id <> ?
  `;

  const params = [websiteId, currentProductId];

  if (categoryId) {
    sql += ` AND p.category_id = ?`;
    params.push(categoryId);
  }

  sql += ` ORDER BY p.id DESC LIMIT ?`;
  params.push(limit);

  const [rows] = await pool.query(sql, params);

  return rows.map((row) =>
    sanitizeProduct({
      ...row,
      website_slug: websiteSlug,
    })
  );
}

async function getPublicProduct(req, res) {
  try {
    const websiteSlug = String(req.params.websiteSlug || '').trim().toLowerCase();
    const productSlug = String(req.params.slug || '').trim().toLowerCase();

    if (!websiteSlug || !productSlug) {
      return res.status(400).json({
        ok: false,
        message: 'Website slug and product slug are required',
      });
    }

    const product = await getPublicProductBySlug(websiteSlug, productSlug);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: 'Product not found',
      });
    }

    await trackProductView(product.id, product.website_id, req);

    const [posts, related_products] = await Promise.all([
      getPublishedPostsForProduct(product.id, product.website_slug),
      getRelatedProducts(
        product.website_id,
        product.category_id,
        product.id,
        product.website_slug
      ),
    ]);

    return res.status(200).json({
      ok: true,
      product: sanitizeProduct(product),
      posts,
      related_products,
    });
  } catch (error) {
    console.error('getPublicProduct error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch product',
      error: error.message,
    });
  }
}

async function getPublicProductPosts(req, res) {
  try {
    const websiteSlug = String(req.params.websiteSlug || '').trim().toLowerCase();
    const productSlug = String(req.params.slug || '').trim().toLowerCase();

    if (!websiteSlug || !productSlug) {
      return res.status(400).json({
        ok: false,
        message: 'Website slug and product slug are required',
      });
    }

    const product = await getPublicProductBySlug(websiteSlug, productSlug);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: 'Product not found',
      });
    }

    const posts = await getPublishedPostsForProduct(product.id, product.website_slug);

    return res.status(200).json({
      ok: true,
      product: sanitizeProduct(product),
      posts,
    });
  } catch (error) {
    console.error('getPublicProductPosts error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch product posts',
      error: error.message,
    });
  }
}

async function trackPublicProductClick(req, res) {
  try {
    const websiteSlug = String(req.params.websiteSlug || '').trim().toLowerCase();
    const productSlug = String(req.params.slug || '').trim().toLowerCase();
    const clickType = normalizeClickType(req.body?.click_type || 'product_visit');

    if (!websiteSlug || !productSlug) {
      return res.status(400).json({
        ok: false,
        message: 'Website slug and product slug are required',
      });
    }

    if (!clickType) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid click type',
      });
    }

    const product = await getPublicProductBySlug(websiteSlug, productSlug);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: 'Product not found',
      });
    }

    await pool.query(
      `
      INSERT INTO analytics_product_clicks
      (
        product_id,
        website_id,
        click_type,
        referrer,
        ip_address,
        user_agent,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        product.id,
        product.website_id,
        clickType,
        req.get('referer') || null,
        req.ip || null,
        req.get('user-agent') || null,
      ]
    );

    const visitIncrement = getVisitIncrement(clickType);
    const visitData = visitIncrement > 0
      ? await increaseProductVisitCount(product.id, visitIncrement)
      : await getProductVisitData(product.id);

    return res.status(200).json({
      ok: true,
      message: visitIncrement > 0
        ? 'Product visit tracked successfully'
        : 'Product event tracked successfully',
      visit_increment: visitIncrement,
      visit_count: visitData.visit_count,
      product_score: visitData.product_score,
      redirect_url: getRedirectUrlForClick(product, clickType),
    });
  } catch (error) {
    console.error('trackPublicProductClick error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to track product click',
      error: error.message,
    });
  }
}

module.exports = {
  getPublicProduct,
  getPublicProductPosts,
  trackPublicProductClick,
};