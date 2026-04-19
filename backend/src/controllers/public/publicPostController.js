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
    website: {
      id: row.website_id,
      website_name: row.website_name,
      slug: row.website_slug,
    },
    product: row.product_id
      ? {
          id: row.product_id,
          title: row.product_title,
          slug: row.product_slug,
          product_image: row.product_image,
          pricing_type: row.pricing_type,
          price: row.price !== null ? Number(row.price) : null,
          min_price: row.min_price !== null ? Number(row.min_price) : null,
          max_price: row.max_price !== null ? Number(row.max_price) : null,
          affiliate_buy_url: row.affiliate_buy_url,
        }
      : null,
    category: row.category_id
      ? {
          id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
        }
      : null,
    template: row.template_id
      ? {
          id: row.template_id,
          name: row.template_name,
          slug: row.template_slug,
          template_code_key: row.template_code_key,
        }
      : null,
    url: `/${row.website_slug}/post/${row.slug}`,
  };
}

function sanitizeTemplateField(row) {
  return {
    id: row.id,
    post_id: row.post_id,
    field_key: row.field_key,
    field_type: row.field_type,
    field_value: row.field_value,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function sanitizeCtaButton(row) {
  return {
    id: row.id,
    post_id: row.post_id,
    button_key: row.button_key,
    button_label: row.button_label,
    button_url: row.button_url,
    button_style: row.button_style,
    open_in_new_tab: !!row.open_in_new_tab,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function trackPostView(postId, productId, websiteId, req) {
  try {
    await pool.query(
      `
      INSERT INTO analytics_post_views
      (
        post_id,
        product_id,
        website_id,
        referrer,
        ip_address,
        user_agent,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        postId,
        productId,
        websiteId,
        req.get('referer') || null,
        req.ip || null,
        req.get('user-agent') || null,
      ]
    );
  } catch (error) {
    console.error('trackPostView error:', error.message);
  }
}

async function getPublicPostBySlug(websiteSlug, postSlug) {
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

      aw.website_name,
      aw.slug AS website_slug,

      p.title AS product_title,
      p.slug AS product_slug,
      p.product_image,
      p.pricing_type,
      p.price,
      p.min_price,
      p.max_price,
      p.affiliate_buy_url,

      c.name AS category_name,
      c.slug AS category_slug,

      bt.name AS template_name,
      bt.slug AS template_slug,
      bt.template_code_key

    FROM product_posts pp
    INNER JOIN affiliate_websites aw
      ON aw.id = pp.website_id
     AND aw.status = 'active'
    INNER JOIN users u
      ON u.id = pp.user_id
     AND u.role = 'affiliate'
     AND u.status = 'active'
    LEFT JOIN products p
      ON p.id = pp.product_id
     AND p.status = 'published'
    LEFT JOIN categories c
      ON c.id = pp.category_id
     AND c.status = 'active'
    LEFT JOIN blog_templates bt
      ON bt.id = pp.template_id
     AND bt.status = 'active'
    WHERE aw.slug = ?
      AND pp.slug = ?
      AND pp.status = 'published'
    LIMIT 1
    `,
    [websiteSlug, postSlug]
  );

  return rows[0] || null;
}

async function getPostTemplateFields(postId) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      post_id,
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

  return rows.map(sanitizeTemplateField);
}

async function getPostCtaButtons(postId) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      post_id,
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

  return rows.map(sanitizeCtaButton);
}

async function getRelatedPosts(websiteId, currentPostId, categoryId, websiteSlug, limit = 6) {
  let sql = `
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

      ? AS website_name,
      ? AS website_slug,

      p.title AS product_title,
      p.slug AS product_slug,
      p.product_image,
      p.pricing_type,
      p.price,
      p.min_price,
      p.max_price,
      p.affiliate_buy_url,

      c.name AS category_name,
      c.slug AS category_slug,

      bt.name AS template_name,
      bt.slug AS template_slug,
      bt.template_code_key

    FROM product_posts pp
    LEFT JOIN products p
      ON p.id = pp.product_id
     AND p.status = 'published'
    LEFT JOIN categories c
      ON c.id = pp.category_id
     AND c.status = 'active'
    LEFT JOIN blog_templates bt
      ON bt.id = pp.template_id
     AND bt.status = 'active'
    WHERE pp.website_id = ?
      AND pp.status = 'published'
      AND pp.id <> ?
  `;

  const params = [null, websiteSlug, websiteId, currentPostId];

  if (categoryId) {
    sql += ` AND pp.category_id = ?`;
    params.push(categoryId);
  }

  sql += ` ORDER BY pp.id DESC LIMIT ?`;
  params.push(limit);

  const [rows] = await pool.query(sql, params);
  return rows.map(sanitizePost);
}

async function getPublicPost(req, res) {
  try {
    const websiteSlug = String(req.params.websiteSlug || '').trim().toLowerCase();
    const postSlug = String(req.params.slug || '').trim().toLowerCase();

    if (!websiteSlug || !postSlug) {
      return res.status(400).json({
        ok: false,
        message: 'Website slug and post slug are required',
      });
    }

    const post = await getPublicPostBySlug(websiteSlug, postSlug);

    if (!post) {
      return res.status(404).json({
        ok: false,
        message: 'Post not found',
      });
    }

    await trackPostView(post.id, post.product_id || null, post.website_id, req);

    const [template_fields, cta_buttons, related_posts] = await Promise.all([
      getPostTemplateFields(post.id),
      getPostCtaButtons(post.id),
      getRelatedPosts(post.website_id, post.id, post.category_id, post.website_slug),
    ]);

    return res.status(200).json({
      ok: true,
      post: sanitizePost(post),
      template_fields,
      cta_buttons,
      related_posts,
    });
  } catch (error) {
    console.error('getPublicPost error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch post',
      error: error.message,
    });
  }
}

async function getWebsitePublishedPosts(req, res) {
  try {
    const websiteSlug = String(req.params.websiteSlug || '').trim().toLowerCase();

    if (!websiteSlug) {
      return res.status(400).json({
        ok: false,
        message: 'Website slug is required',
      });
    }

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

        aw.website_name,
        aw.slug AS website_slug,

        p.title AS product_title,
        p.slug AS product_slug,
        p.product_image,
        p.pricing_type,
        p.price,
        p.min_price,
        p.max_price,
        p.affiliate_buy_url,

        c.name AS category_name,
        c.slug AS category_slug,

        bt.name AS template_name,
        bt.slug AS template_slug,
        bt.template_code_key

      FROM product_posts pp
      INNER JOIN affiliate_websites aw
        ON aw.id = pp.website_id
       AND aw.status = 'active'
      INNER JOIN users u
        ON u.id = pp.user_id
       AND u.role = 'affiliate'
       AND u.status = 'active'
      LEFT JOIN products p
        ON p.id = pp.product_id
       AND p.status = 'published'
      LEFT JOIN categories c
        ON c.id = pp.category_id
       AND c.status = 'active'
      LEFT JOIN blog_templates bt
        ON bt.id = pp.template_id
       AND bt.status = 'active'
      WHERE aw.slug = ?
        AND pp.status = 'published'
      ORDER BY pp.id DESC
      `,
      [websiteSlug]
    );

    return res.status(200).json({
      ok: true,
      posts: rows.map(sanitizePost),
    });
  } catch (error) {
    console.error('getWebsitePublishedPosts error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch website posts',
      error: error.message,
    });
  }
}

module.exports = {
  getPublicPost,
  getWebsitePublishedPosts,
};