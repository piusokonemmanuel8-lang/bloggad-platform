const pool = require('../config/db');

function toPositiveInt(value) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) return null;
  return num;
}

async function getCustomerById(customerId) {
  const [rows] = await pool.query(
    `
    SELECT id, role, status
    FROM users
    WHERE id = ?
      AND role = 'customer'
    LIMIT 1
    `,
    [customerId]
  );

  return rows[0] || null;
}

async function getPostDetails(postId) {
  const [rows] = await pool.query(
    `
    SELECT
      pp.id,
      pp.user_id AS affiliate_id,
      pp.website_id
    FROM product_posts pp
    WHERE pp.id = ?
    LIMIT 1
    `,
    [postId]
  );

  return rows[0] || null;
}

async function getProductDetails(productId) {
  const [rows] = await pool.query(
    `
    SELECT
      p.id,
      p.user_id AS affiliate_id,
      p.website_id
    FROM products p
    WHERE p.id = ?
    LIMIT 1
    `,
    [productId]
  );

  return rows[0] || null;
}

async function savePost(req, res) {
  try {
    const customerId = req.user?.id;
    const postId = toPositiveInt(req.body?.post_id);

    if (!customerId) {
      return res.status(401).json({
        ok: false,
        message: 'Unauthorized.',
      });
    }

    if (!postId) {
      return res.status(400).json({
        ok: false,
        message: 'post_id is required.',
      });
    }

    const customer = await getCustomerById(customerId);

    if (!customer || customer.status !== 'active') {
      return res.status(403).json({
        ok: false,
        message: 'Customer account is not active.',
      });
    }

    const post = await getPostDetails(postId);

    if (!post) {
      return res.status(404).json({
        ok: false,
        message: 'Post not found.',
      });
    }

    await pool.query(
      `
      INSERT INTO customer_saved_posts (
        customer_id,
        post_id,
        affiliate_id,
        website_id,
        created_at
      )
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        created_at = VALUES(created_at)
      `,
      [customerId, post.id, post.affiliate_id, post.website_id]
    );

    return res.status(200).json({
      ok: true,
      message: 'Post saved successfully.',
    });
  } catch (error) {
    console.error('savePost error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to save post.',
      error: error.message,
    });
  }
}

async function unsavePost(req, res) {
  try {
    const customerId = req.user?.id;
    const postId = toPositiveInt(req.params?.postId || req.body?.post_id);

    if (!customerId) {
      return res.status(401).json({
        ok: false,
        message: 'Unauthorized.',
      });
    }

    if (!postId) {
      return res.status(400).json({
        ok: false,
        message: 'post_id is required.',
      });
    }

    await pool.query(
      `
      DELETE FROM customer_saved_posts
      WHERE customer_id = ?
        AND post_id = ?
      `,
      [customerId, postId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Post removed from saved list.',
    });
  } catch (error) {
    console.error('unsavePost error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to remove saved post.',
      error: error.message,
    });
  }
}

async function getSavedPosts(req, res) {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        ok: false,
        message: 'Unauthorized.',
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
        csp.id AS saved_id,
        csp.created_at AS saved_at,
        csp.post_id,
        csp.affiliate_id,
        csp.website_id,

        pp.title,
        pp.slug,
        pp.excerpt,
        pp.featured_image,
        pp.created_at AS post_created_at,

        u.name AS affiliate_name,
        aw.website_name,
        aw.slug AS website_slug
      FROM customer_saved_posts csp
      INNER JOIN product_posts pp
        ON pp.id = csp.post_id
      LEFT JOIN users u
        ON u.id = csp.affiliate_id
      LEFT JOIN affiliate_websites aw
        ON aw.id = csp.website_id
      WHERE csp.customer_id = ?
      ORDER BY csp.created_at DESC
      `,
      [customerId]
    );

    return res.status(200).json({
      ok: true,
      items: rows.map((row) => ({
        saved_id: row.saved_id,
        saved_at: row.saved_at,
        post: {
          id: row.post_id,
          title: row.title,
          slug: row.slug,
          excerpt: row.excerpt,
          featured_image: row.featured_image,
          created_at: row.post_created_at,
        },
        affiliate: {
          id: row.affiliate_id,
          name: row.affiliate_name,
        },
        website: {
          id: row.website_id,
          website_name: row.website_name,
          slug: row.website_slug,
        },
      })),
    });
  } catch (error) {
    console.error('getSavedPosts error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch saved posts.',
      error: error.message,
    });
  }
}

async function saveProduct(req, res) {
  try {
    const customerId = req.user?.id;
    const productId = toPositiveInt(req.body?.product_id);

    if (!customerId) {
      return res.status(401).json({
        ok: false,
        message: 'Unauthorized.',
      });
    }

    if (!productId) {
      return res.status(400).json({
        ok: false,
        message: 'product_id is required.',
      });
    }

    const customer = await getCustomerById(customerId);

    if (!customer || customer.status !== 'active') {
      return res.status(403).json({
        ok: false,
        message: 'Customer account is not active.',
      });
    }

    const product = await getProductDetails(productId);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: 'Product not found.',
      });
    }

    await pool.query(
      `
      INSERT INTO customer_saved_products (
        customer_id,
        product_id,
        affiliate_id,
        website_id,
        created_at
      )
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        created_at = VALUES(created_at)
      `,
      [customerId, product.id, product.affiliate_id, product.website_id]
    );

    return res.status(200).json({
      ok: true,
      message: 'Product saved successfully.',
    });
  } catch (error) {
    console.error('saveProduct error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to save product.',
      error: error.message,
    });
  }
}

async function unsaveProduct(req, res) {
  try {
    const customerId = req.user?.id;
    const productId = toPositiveInt(req.params?.productId || req.body?.product_id);

    if (!customerId) {
      return res.status(401).json({
        ok: false,
        message: 'Unauthorized.',
      });
    }

    if (!productId) {
      return res.status(400).json({
        ok: false,
        message: 'product_id is required.',
      });
    }

    await pool.query(
      `
      DELETE FROM customer_saved_products
      WHERE customer_id = ?
        AND product_id = ?
      `,
      [customerId, productId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Product removed from saved list.',
    });
  } catch (error) {
    console.error('unsaveProduct error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to remove saved product.',
      error: error.message,
    });
  }
}

async function getSavedProducts(req, res) {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        ok: false,
        message: 'Unauthorized.',
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
        csp.id AS saved_id,
        csp.created_at AS saved_at,
        csp.product_id,
        csp.affiliate_id,
        csp.website_id,

        p.name,
        p.slug,
        p.featured_image,
        p.price,
        p.sale_price,
        p.created_at AS product_created_at,

        u.name AS affiliate_name,
        aw.website_name,
        aw.slug AS website_slug
      FROM customer_saved_products csp
      INNER JOIN products p
        ON p.id = csp.product_id
      LEFT JOIN users u
        ON u.id = csp.affiliate_id
      LEFT JOIN affiliate_websites aw
        ON aw.id = csp.website_id
      WHERE csp.customer_id = ?
      ORDER BY csp.created_at DESC
      `,
      [customerId]
    );

    return res.status(200).json({
      ok: true,
      items: rows.map((row) => ({
        saved_id: row.saved_id,
        saved_at: row.saved_at,
        product: {
          id: row.product_id,
          name: row.name,
          slug: row.slug,
          featured_image: row.featured_image,
          price: row.price,
          sale_price: row.sale_price,
          created_at: row.product_created_at,
        },
        affiliate: {
          id: row.affiliate_id,
          name: row.affiliate_name,
        },
        website: {
          id: row.website_id,
          website_name: row.website_name,
          slug: row.website_slug,
        },
      })),
    });
  } catch (error) {
    console.error('getSavedProducts error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch saved products.',
      error: error.message,
    });
  }
}

module.exports = {
  savePost,
  unsavePost,
  getSavedPosts,
  saveProduct,
  unsaveProduct,
  getSavedProducts,
};