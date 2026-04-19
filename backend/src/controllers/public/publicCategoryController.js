const pool = require('../../config/db');

function sanitizeCategory(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon,
    status: row.status,
    sort_order: row.sort_order,
    total_products: Number(row.total_products || 0),
  };
}

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
    short_description: row.short_description,
    status: row.status,
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

async function getAllPublicCategories(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        c.id,
        c.name,
        c.slug,
        c.icon,
        c.status,
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
      GROUP BY c.id, c.name, c.slug, c.icon, c.status, c.sort_order
      ORDER BY c.sort_order ASC, c.name ASC
      `
    );

    return res.status(200).json({
      ok: true,
      categories: rows.map(sanitizeCategory),
    });
  } catch (error) {
    console.error('getAllPublicCategories error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
}

async function getPublicCategoryBySlug(req, res) {
  try {
    const categorySlug = String(req.params.slug || '').trim().toLowerCase();

    if (!categorySlug) {
      return res.status(400).json({
        ok: false,
        message: 'Category slug is required',
      });
    }

    const [categoryRows] = await pool.query(
      `
      SELECT
        c.id,
        c.name,
        c.slug,
        c.icon,
        c.status,
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
      WHERE c.slug = ?
        AND c.status = 'active'
      GROUP BY c.id, c.name, c.slug, c.icon, c.status, c.sort_order
      LIMIT 1
      `,
      [categorySlug]
    );

    if (!categoryRows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Category not found',
      });
    }

    const [productRows] = await pool.query(
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
      INNER JOIN categories c
        ON c.id = p.category_id
       AND c.status = 'active'
      WHERE c.slug = ?
        AND p.status = 'published'
      ORDER BY p.id DESC
      `,
      [categorySlug]
    );

    return res.status(200).json({
      ok: true,
      category: sanitizeCategory(categoryRows[0]),
      products: productRows.map(sanitizeProduct),
    });
  } catch (error) {
    console.error('getPublicCategoryBySlug error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch category',
      error: error.message,
    });
  }
}

async function getWebsiteCategoryProducts(req, res) {
  try {
    const websiteSlug = String(req.params.websiteSlug || '').trim().toLowerCase();
    const categorySlug = String(req.params.slug || '').trim().toLowerCase();

    if (!websiteSlug || !categorySlug) {
      return res.status(400).json({
        ok: false,
        message: 'Website slug and category slug are required',
      });
    }

    const [websiteRows] = await pool.query(
      `
      SELECT
        aw.id,
        aw.website_name,
        aw.slug,
        aw.status
      FROM affiliate_websites aw
      INNER JOIN users u
        ON u.id = aw.user_id
       AND u.role = 'affiliate'
       AND u.status = 'active'
      WHERE aw.slug = ?
        AND aw.status = 'active'
      LIMIT 1
      `,
      [websiteSlug]
    );

    if (!websiteRows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Website not found',
      });
    }

    const [categoryRows] = await pool.query(
      `
      SELECT
        c.id,
        c.name,
        c.slug,
        c.icon,
        c.status,
        c.sort_order,
        COUNT(p.id) AS total_products
      FROM categories c
      LEFT JOIN products p
        ON p.category_id = c.id
       AND p.website_id = ?
       AND p.status = 'published'
      WHERE c.slug = ?
        AND c.status = 'active'
      GROUP BY c.id, c.name, c.slug, c.icon, c.status, c.sort_order
      LIMIT 1
      `,
      [websiteRows[0].id, categorySlug]
    );

    if (!categoryRows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Category not found for this website',
      });
    }

    const [productRows] = await pool.query(
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
      INNER JOIN categories c
        ON c.id = p.category_id
       AND c.status = 'active'
      WHERE aw.slug = ?
        AND c.slug = ?
        AND p.status = 'published'
      ORDER BY p.id DESC
      `,
      [websiteSlug, categorySlug]
    );

    return res.status(200).json({
      ok: true,
      website: {
        id: websiteRows[0].id,
        website_name: websiteRows[0].website_name,
        slug: websiteRows[0].slug,
      },
      category: sanitizeCategory(categoryRows[0]),
      products: productRows.map(sanitizeProduct),
    });
  } catch (error) {
    console.error('getWebsiteCategoryProducts error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch website category products',
      error: error.message,
    });
  }
}

module.exports = {
  getAllPublicCategories,
  getPublicCategoryBySlug,
  getWebsiteCategoryProducts,
};