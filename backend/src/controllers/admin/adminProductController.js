const pool = require('../../config/db');

function sanitizeProduct(row) {
  if (!row) return null;

  return {
    id: row.id,
    user_id: row.user_id,
    website_id: row.website_id,
    category_id: row.category_id,
    title: row.title,
    slug: row.slug,
    product_image: row.product_image,
    media_id: row.media_id,
    pricing_type: row.pricing_type,
    price: row.price !== null ? Number(row.price) : null,
    min_price: row.min_price !== null ? Number(row.min_price) : null,
    max_price: row.max_price !== null ? Number(row.max_price) : null,
    homepage_cta_label: row.homepage_cta_label,
    storefront_cta_label: row.storefront_cta_label,
    affiliate_buy_url: row.affiliate_buy_url,
    short_description: row.short_description,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    affiliate: {
      id: row.affiliate_id,
      name: row.affiliate_name,
      email: row.affiliate_email,
      status: row.affiliate_status,
    },
    website: row.website_id
      ? {
          id: row.website_id,
          website_name: row.website_name,
          slug: row.website_slug,
          status: row.website_status,
        }
      : null,
    category: row.category_id
      ? {
          id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
          status: row.category_status,
        }
      : null,
    stats: {
      total_posts: Number(row.total_posts || 0),
    },
  };
}

async function getAdminProductById(productId) {
  const [rows] = await pool.query(
    `
    SELECT
      p.id,
      p.user_id,
      p.website_id,
      p.category_id,
      p.title,
      p.slug,
      p.product_image,
      p.media_id,
      p.pricing_type,
      p.price,
      p.min_price,
      p.max_price,
      p.homepage_cta_label,
      p.storefront_cta_label,
      p.affiliate_buy_url,
      p.short_description,
      p.status,
      p.created_at,
      p.updated_at,

      u.id AS affiliate_id,
      u.name AS affiliate_name,
      u.email AS affiliate_email,
      u.status AS affiliate_status,

      aw.website_name,
      aw.slug AS website_slug,
      aw.status AS website_status,

      c.name AS category_name,
      c.slug AS category_slug,
      c.status AS category_status,

      (
        SELECT COUNT(*)
        FROM product_posts pp
        WHERE pp.product_id = p.id
      ) AS total_posts

    FROM products p
    INNER JOIN users u
      ON u.id = p.user_id
    LEFT JOIN affiliate_websites aw
      ON aw.id = p.website_id
    LEFT JOIN categories c
      ON c.id = p.category_id
    WHERE p.id = ?
    LIMIT 1
    `,
    [productId]
  );

  return rows[0] || null;
}

async function getAllProducts(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        p.id,
        p.user_id,
        p.website_id,
        p.category_id,
        p.title,
        p.slug,
        p.product_image,
        p.media_id,
        p.pricing_type,
        p.price,
        p.min_price,
        p.max_price,
        p.homepage_cta_label,
        p.storefront_cta_label,
        p.affiliate_buy_url,
        p.short_description,
        p.status,
        p.created_at,
        p.updated_at,

        u.id AS affiliate_id,
        u.name AS affiliate_name,
        u.email AS affiliate_email,
        u.status AS affiliate_status,

        aw.website_name,
        aw.slug AS website_slug,
        aw.status AS website_status,

        c.name AS category_name,
        c.slug AS category_slug,
        c.status AS category_status,

        (
          SELECT COUNT(*)
          FROM product_posts pp
          WHERE pp.product_id = p.id
        ) AS total_posts

      FROM products p
      INNER JOIN users u
        ON u.id = p.user_id
      LEFT JOIN affiliate_websites aw
        ON aw.id = p.website_id
      LEFT JOIN categories c
        ON c.id = p.category_id
      ORDER BY p.id DESC
      `
    );

    return res.status(200).json({
      ok: true,
      products: rows.map(sanitizeProduct),
    });
  } catch (error) {
    console.error('getAllProducts error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
}

async function getSingleProduct(req, res) {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid product id',
      });
    }

    const product = await getAdminProductById(productId);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: 'Product not found',
      });
    }

    const [postRows] = await pool.query(
      `
      SELECT
        id,
        product_id,
        title,
        slug,
        status,
        published_at,
        created_at,
        updated_at
      FROM product_posts
      WHERE product_id = ?
      ORDER BY id DESC
      `,
      [productId]
    );

    return res.status(200).json({
      ok: true,
      product: {
        ...sanitizeProduct(product),
        posts: postRows,
      },
    });
  } catch (error) {
    console.error('getSingleProduct error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch product',
      error: error.message,
    });
  }
}

async function updateProductStatus(req, res) {
  try {
    const productId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid product id',
      });
    }

    if (!['draft', 'published', 'inactive'].includes(status)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid product status',
      });
    }

    const existingProduct = await getAdminProductById(productId);

    if (!existingProduct) {
      return res.status(404).json({
        ok: false,
        message: 'Product not found',
      });
    }

    await pool.query(
      `
      UPDATE products
      SET
        status = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [status, productId]
    );

    const updatedProduct = await getAdminProductById(productId);

    return res.status(200).json({
      ok: true,
      message: 'Product status updated successfully',
      product: sanitizeProduct(updatedProduct),
    });
  } catch (error) {
    console.error('updateProductStatus error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update product status',
      error: error.message,
    });
  }
}

async function deleteProduct(req, res) {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid product id',
      });
    }

    const existingProduct = await getAdminProductById(productId);

    if (!existingProduct) {
      return res.status(404).json({
        ok: false,
        message: 'Product not found',
      });
    }

    await pool.query(
      `
      DELETE FROM products
      WHERE id = ?
      `,
      [productId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('deleteProduct error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to delete product',
      error: error.message,
    });
  }
}

module.exports = {
  getAllProducts,
  getSingleProduct,
  updateProductStatus,
  deleteProduct,
};