const pool = require('../../config/db');

function sanitizeHomepageProduct(row) {
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
    short_description: row.short_description,
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

async function getHomepageProducts(limit = 24) {
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
    ORDER BY p.id DESC
    LIMIT ?
    `,
    [limit]
  );

  return rows.map(sanitizeHomepageProduct);
}

async function getHomepageCategories(limit = 20) {
  const [rows] = await pool.query(
    `
    SELECT
      c.id,
      c.name,
      c.slug,
      c.icon,
      c.sort_order,
      COUNT(p.id) AS total_products
    FROM categories c
    LEFT JOIN products p
      ON p.category_id = c.id
     AND p.status = 'published'
    LEFT JOIN affiliate_websites aw
      ON aw.id = p.website_id
     AND aw.status = 'active'
    LEFT JOIN users u
      ON u.id = p.user_id
     AND u.role = 'affiliate'
     AND u.status = 'active'
    WHERE c.status = 'active'
    GROUP BY c.id, c.name, c.slug, c.icon, c.sort_order
    ORDER BY c.sort_order ASC, c.name ASC
    LIMIT ?
    `,
    [limit]
  );

  return rows.map(sanitizeHomepageCategory);
}

async function getHomepageStats() {
  const [[productRow]] = await pool.query(
    `
    SELECT COUNT(*) AS total_products
    FROM products p
    INNER JOIN affiliate_websites aw
      ON aw.id = p.website_id
     AND aw.status = 'active'
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
    INNER JOIN affiliate_websites aw
      ON aw.id = pp.website_id
     AND aw.status = 'active'
    INNER JOIN users u
      ON u.id = pp.user_id
     AND u.role = 'affiliate'
     AND u.status = 'active'
    WHERE pp.status = 'published'
    `
  );

  return {
    total_products: Number(productRow?.total_products || 0),
    total_websites: Number(websiteRow?.total_websites || 0),
    total_categories: Number(categoryRow?.total_categories || 0),
    total_posts: Number(postRow?.total_posts || 0),
  };
}

async function getHomepage(req, res) {
  try {
    const products = await getHomepageProducts();
    const categories = await getHomepageCategories();
    const stats = await getHomepageStats();

    return res.status(200).json({
      ok: true,
      page: {
        name: 'Bloggad Homepage',
        label: 'Block Marketplace',
      },
      stats,
      categories,
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