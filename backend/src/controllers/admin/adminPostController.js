const pool = require('../../config/db');

function sanitizePost(row) {
  if (!row) return null;

  return {
    id: row.id,
    product_id: row.product_id,
    user_id: row.user_id,
    website_id: row.website_id,
    category_id: row.category_id,
    template_id: row.template_id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    featured_image: row.featured_image,
    media_id: row.media_id,
    status: row.status,
    published_at: row.published_at,
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
    product: row.product_id
      ? {
          id: row.product_id,
          title: row.product_title,
          slug: row.product_slug,
          status: row.product_status,
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
    template: row.template_id
      ? {
          id: row.template_id,
          name: row.template_name,
          slug: row.template_slug,
          status: row.template_status,
        }
      : null,
    stats: {
      total_template_fields: Number(row.total_template_fields || 0),
      total_cta_buttons: Number(row.total_cta_buttons || 0),
    },
  };
}

async function getAdminPostById(postId) {
  const [rows] = await pool.query(
    `
    SELECT
      pp.id,
      pp.product_id,
      pp.user_id,
      pp.website_id,
      pp.category_id,
      pp.template_id,
      pp.title,
      pp.slug,
      pp.excerpt,
      pp.seo_title,
      pp.seo_description,
      pp.featured_image,
      pp.media_id,
      pp.status,
      pp.published_at,
      pp.created_at,
      pp.updated_at,

      u.id AS affiliate_id,
      u.name AS affiliate_name,
      u.email AS affiliate_email,
      u.status AS affiliate_status,

      aw.website_name,
      aw.slug AS website_slug,
      aw.status AS website_status,

      p.title AS product_title,
      p.slug AS product_slug,
      p.status AS product_status,

      c.name AS category_name,
      c.slug AS category_slug,
      c.status AS category_status,

      bt.name AS template_name,
      bt.slug AS template_slug,
      bt.status AS template_status,

      (
        SELECT COUNT(*)
        FROM post_template_fields ptf
        WHERE ptf.post_id = pp.id
      ) AS total_template_fields,

      (
        SELECT COUNT(*)
        FROM post_cta_buttons pcb
        WHERE pcb.post_id = pp.id
      ) AS total_cta_buttons

    FROM product_posts pp
    INNER JOIN users u
      ON u.id = pp.user_id
    LEFT JOIN affiliate_websites aw
      ON aw.id = pp.website_id
    LEFT JOIN products p
      ON p.id = pp.product_id
    LEFT JOIN categories c
      ON c.id = pp.category_id
    LEFT JOIN blog_templates bt
      ON bt.id = pp.template_id
    WHERE pp.id = ?
    LIMIT 1
    `,
    [postId]
  );

  return rows[0] || null;
}

async function getAllPosts(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        pp.id,
        pp.product_id,
        pp.user_id,
        pp.website_id,
        pp.category_id,
        pp.template_id,
        pp.title,
        pp.slug,
        pp.excerpt,
        pp.seo_title,
        pp.seo_description,
        pp.featured_image,
        pp.media_id,
        pp.status,
        pp.published_at,
        pp.created_at,
        pp.updated_at,

        u.id AS affiliate_id,
        u.name AS affiliate_name,
        u.email AS affiliate_email,
        u.status AS affiliate_status,

        aw.website_name,
        aw.slug AS website_slug,
        aw.status AS website_status,

        p.title AS product_title,
        p.slug AS product_slug,
        p.status AS product_status,

        c.name AS category_name,
        c.slug AS category_slug,
        c.status AS category_status,

        bt.name AS template_name,
        bt.slug AS template_slug,
        bt.status AS template_status,

        (
          SELECT COUNT(*)
          FROM post_template_fields ptf
          WHERE ptf.post_id = pp.id
        ) AS total_template_fields,

        (
          SELECT COUNT(*)
          FROM post_cta_buttons pcb
          WHERE pcb.post_id = pp.id
        ) AS total_cta_buttons

      FROM product_posts pp
      INNER JOIN users u
        ON u.id = pp.user_id
      LEFT JOIN affiliate_websites aw
        ON aw.id = pp.website_id
      LEFT JOIN products p
        ON p.id = pp.product_id
      LEFT JOIN categories c
        ON c.id = pp.category_id
      LEFT JOIN blog_templates bt
        ON bt.id = pp.template_id
      ORDER BY pp.id DESC
      `
    );

    return res.status(200).json({
      ok: true,
      posts: rows.map(sanitizePost),
    });
  } catch (error) {
    console.error('getAllPosts error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch posts',
      error: error.message,
    });
  }
}

async function getSinglePost(req, res) {
  try {
    const postId = Number(req.params.id);

    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid post id',
      });
    }

    const post = await getAdminPostById(postId);

    if (!post) {
      return res.status(404).json({
        ok: false,
        message: 'Post not found',
      });
    }

    const [templateFields] = await pool.query(
      `
      SELECT
        id,
        field_key,
        field_type,
        field_value,
        sort_order,
        created_at,
        updated_at
      FROM post_template_fields
      WHERE post_id = ?
      ORDER BY sort_order ASC, id ASC
      `,
      [postId]
    );

    const [ctaButtons] = await pool.query(
      `
      SELECT
        id,
        button_key,
        button_label,
        button_url,
        button_style,
        open_in_new_tab,
        sort_order,
        created_at,
        updated_at
      FROM post_cta_buttons
      WHERE post_id = ?
      ORDER BY sort_order ASC, id ASC
      `,
      [postId]
    );

    return res.status(200).json({
      ok: true,
      post: {
        ...sanitizePost(post),
        template_fields: templateFields,
        cta_buttons: ctaButtons.map((row) => ({
          ...row,
          open_in_new_tab: !!row.open_in_new_tab,
        })),
      },
    });
  } catch (error) {
    console.error('getSinglePost error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch post',
      error: error.message,
    });
  }
}

async function updatePostStatus(req, res) {
  try {
    const postId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid post id',
      });
    }

    if (!['draft', 'published', 'inactive'].includes(status)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid post status',
      });
    }

    const existingPost = await getAdminPostById(postId);

    if (!existingPost) {
      return res.status(404).json({
        ok: false,
        message: 'Post not found',
      });
    }

    const publishedAt =
      status === 'published'
        ? existingPost.published_at || new Date()
        : null;

    await pool.query(
      `
      UPDATE product_posts
      SET
        status = ?,
        published_at = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [status, publishedAt, postId]
    );

    const updatedPost = await getAdminPostById(postId);

    return res.status(200).json({
      ok: true,
      message: 'Post status updated successfully',
      post: sanitizePost(updatedPost),
    });
  } catch (error) {
    console.error('updatePostStatus error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update post status',
      error: error.message,
    });
  }
}

async function deletePost(req, res) {
  try {
    const postId = Number(req.params.id);

    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid post id',
      });
    }

    const existingPost = await getAdminPostById(postId);

    if (!existingPost) {
      return res.status(404).json({
        ok: false,
        message: 'Post not found',
      });
    }

    await pool.query(
      `
      DELETE FROM product_posts
      WHERE id = ?
      `,
      [postId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('deletePost error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to delete post',
      error: error.message,
    });
  }
}

module.exports = {
  getAllPosts,
  getSinglePost,
  updatePostStatus,
  deletePost,
};