const slugify = require('slugify');
const pool = require('../../config/db');
const { assertAndLogSupgadUrl } = require('../../services/linkValidationService');

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
    product_title: row.product_title,
    product_slug: row.product_slug,
    website_name: row.website_name,
    website_slug: row.website_slug,
    category_name: row.category_name,
    category_slug: row.category_slug,
    template_name: row.template_name,
    template_slug: row.template_slug,
  };
}

function makeSlug(value) {
  return slugify(String(value || '').trim(), {
    lower: true,
    strict: true,
    trim: true,
  });
}

function normalizeNullable(value) {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str ? str : null;
}

function normalizeFieldValue(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') return value.trim();
  return JSON.stringify(value);
}

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

async function getOwnedProduct(productId, userId) {
  const [rows] = await pool.query(
    `
    SELECT
      p.id,
      p.user_id,
      p.website_id,
      p.category_id,
      p.title,
      p.slug,
      p.status
    FROM products p
    WHERE p.id = ?
      AND p.user_id = ?
    LIMIT 1
    `,
    [productId, userId]
  );

  return rows[0] || null;
}

async function getCategoryById(categoryId) {
  if (!categoryId) return null;

  const [rows] = await pool.query(
    `
    SELECT id, name, slug, status
    FROM categories
    WHERE id = ?
    LIMIT 1
    `,
    [categoryId]
  );

  return rows[0] || null;
}

async function getBlogTemplateById(templateId) {
  const [rows] = await pool.query(
    `
    SELECT id, name, slug, status
    FROM blog_templates
    WHERE id = ?
    LIMIT 1
    `,
    [templateId]
  );

  return rows[0] || null;
}

async function ensureUniquePostSlug(baseSlug, websiteId, currentPostId = null) {
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const params = [websiteId, candidate];
    let sql = `
      SELECT id
      FROM product_posts
      WHERE website_id = ?
        AND slug = ?
    `;

    if (currentPostId) {
      sql += ` AND id <> ?`;
      params.push(currentPostId);
    }

    sql += ` LIMIT 1`;

    const [rows] = await pool.query(sql, params);

    if (!rows.length) {
      return candidate;
    }

    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
}

async function getOwnedPostById(postId, userId) {
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
      p.title AS product_title,
      p.slug AS product_slug,
      w.website_name,
      w.slug AS website_slug,
      c.name AS category_name,
      c.slug AS category_slug,
      bt.name AS template_name,
      bt.slug AS template_slug
    FROM product_posts pp
    INNER JOIN products p ON p.id = pp.product_id
    INNER JOIN affiliate_websites w ON w.id = pp.website_id
    LEFT JOIN categories c ON c.id = pp.category_id
    INNER JOIN blog_templates bt ON bt.id = pp.template_id
    WHERE pp.id = ?
      AND pp.user_id = ?
    LIMIT 1
    `,
    [postId, userId]
  );

  return rows[0] || null;
}

async function getTemplateFields(postId) {
  const [rows] = await pool.query(
    `
    SELECT id, field_key, field_type, field_value, sort_order, created_at, updated_at
    FROM post_template_fields
    WHERE post_id = ?
    ORDER BY sort_order ASC, id ASC
    `,
    [postId]
  );

  return rows;
}

async function getPostCtaButtons(postId) {
  const [rows] = await pool.query(
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

  return rows.map((row) => ({
    id: row.id,
    button_key: row.button_key,
    button_label: row.button_label,
    button_url: row.button_url,
    button_style: row.button_style,
    open_in_new_tab: !!row.open_in_new_tab,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

async function replaceTemplateFields(postId, fields = []) {
  await pool.query(`DELETE FROM post_template_fields WHERE post_id = ?`, [postId]);

  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    const fieldKey = normalizeNullable(field.field_key || field.key);
    const fieldType = normalizeNullable(field.field_type || field.type) || 'text';
    const fieldValue = normalizeFieldValue(field.field_value ?? field.value);
    const sortOrder =
      Number.isInteger(Number(field.sort_order)) ? Number(field.sort_order) : index + 1;

    if (!fieldKey) continue;

    await pool.query(
      `
      INSERT INTO post_template_fields
      (post_id, field_key, field_type, field_value, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [postId, fieldKey, fieldType, fieldValue, sortOrder]
    );
  }
}

async function replacePostCtaButtons({ postId, buttons = [], userId, websiteId }) {
  await pool.query(`DELETE FROM post_cta_buttons WHERE post_id = ?`, [postId]);

  for (let index = 0; index < buttons.length; index += 1) {
    const button = buttons[index];
    const buttonKey = normalizeNullable(button.button_key || button.key) || `button_${index + 1}`;
    const buttonLabel = normalizeNullable(button.button_label || button.label);
    const buttonStyle = normalizeNullable(button.button_style || button.style);
    const buttonUrl = normalizeNullable(button.button_url || button.url);
    const openInNewTab = button.open_in_new_tab ? 1 : 0;
    const sortOrder =
      Number.isInteger(Number(button.sort_order)) ? Number(button.sort_order) : index + 1;

    if (!buttonLabel) continue;

    let validatedUrl = null;

    if (buttonUrl) {
      const result = await assertAndLogSupgadUrl({
        value: buttonUrl,
        fieldName: `CTA Button URL (${buttonLabel})`,
        required: true,
        allowEmpty: false,
        userId,
        websiteId,
        sourceType: 'cta_button',
        sourceId: postId,
      });

      validatedUrl = result.submitted_link;
    }

    await pool.query(
      `
      INSERT INTO post_cta_buttons
      (
        post_id,
        button_key,
        button_label,
        button_url,
        button_style,
        open_in_new_tab,
        sort_order,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [postId, buttonKey, buttonLabel, validatedUrl, buttonStyle, openInNewTab, sortOrder]
    );
  }
}

async function validateTemplateLinkFields({
  fields = [],
  userId,
  websiteId,
  postId = null,
}) {
  for (const field of fields) {
    const fieldType = String(field.field_type || field.type || '').trim().toLowerCase();
    const fieldKey = normalizeNullable(field.field_key || field.key) || 'field';
    const fieldValue = normalizeNullable(field.field_value ?? field.value);

    const looksLikeLinkField =
      fieldType.includes('url') ||
      fieldType.includes('link') ||
      fieldKey.toLowerCase().includes('url') ||
      fieldKey.toLowerCase().includes('link') ||
      fieldKey.toLowerCase().includes('cta');

    if (!looksLikeLinkField || !fieldValue) continue;

    await assertAndLogSupgadUrl({
      value: fieldValue,
      fieldName: `Template field (${fieldKey})`,
      required: true,
      allowEmpty: false,
      userId,
      websiteId,
      sourceType: 'template_field',
      sourceId: postId,
    });
  }
}

async function buildFullPostResponse(postId, userId) {
  const post = await getOwnedPostById(postId, userId);

  if (!post) return null;

  const fields = await getTemplateFields(postId);
  const ctaButtons = await getPostCtaButtons(postId);

  return {
    ...sanitizePost(post),
    template_fields: fields,
    cta_buttons: ctaButtons,
  };
}

async function getMyPosts(req, res) {
  try {
    const userId = req.user.id;

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
        p.title AS product_title,
        p.slug AS product_slug,
        w.website_name,
        w.slug AS website_slug,
        c.name AS category_name,
        c.slug AS category_slug,
        bt.name AS template_name,
        bt.slug AS template_slug
      FROM product_posts pp
      INNER JOIN products p ON p.id = pp.product_id
      INNER JOIN affiliate_websites w ON w.id = pp.website_id
      LEFT JOIN categories c ON c.id = pp.category_id
      INNER JOIN blog_templates bt ON bt.id = pp.template_id
      WHERE pp.user_id = ?
      ORDER BY pp.id DESC
      `,
      [userId]
    );

    return res.status(200).json({
      ok: true,
      posts: rows.map(sanitizePost),
    });
  } catch (error) {
    console.error('getMyPosts error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch posts',
      error: error.message,
    });
  }
}

async function getMyPostsByProductId(req, res) {
  try {
    const userId = req.user.id;
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid product id',
      });
    }

    const product = await getOwnedProduct(productId, userId);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: 'Product not found',
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
        p.title AS product_title,
        p.slug AS product_slug,
        w.website_name,
        w.slug AS website_slug,
        c.name AS category_name,
        c.slug AS category_slug,
        bt.name AS template_name,
        bt.slug AS template_slug
      FROM product_posts pp
      INNER JOIN products p ON p.id = pp.product_id
      INNER JOIN affiliate_websites w ON w.id = pp.website_id
      LEFT JOIN categories c ON c.id = pp.category_id
      INNER JOIN blog_templates bt ON bt.id = pp.template_id
      WHERE pp.user_id = ?
        AND pp.product_id = ?
      ORDER BY pp.id DESC
      `,
      [userId, productId]
    );

    return res.status(200).json({
      ok: true,
      product: {
        id: product.id,
        title: product.title,
        slug: product.slug,
      },
      posts: rows.map(sanitizePost),
    });
  } catch (error) {
    console.error('getMyPostsByProductId error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch product posts',
      error: error.message,
    });
  }
}

async function getMyPostById(req, res) {
  try {
    const userId = req.user.id;
    const postId = Number(req.params.id);

    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid post id',
      });
    }

    const post = await buildFullPostResponse(postId, userId);

    if (!post) {
      return res.status(404).json({
        ok: false,
        message: 'Post not found',
      });
    }

    return res.status(200).json({
      ok: true,
      post,
    });
  } catch (error) {
    console.error('getMyPostById error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch post',
      error: error.message,
    });
  }
}

async function createPost(req, res) {
  try {
    const userId = req.user.id;
    const website = await getAffiliateWebsite(userId);

    if (!website) {
      return res.status(400).json({
        ok: false,
        message: 'Create your website first before adding posts',
      });
    }

    const {
      product_id,
      category_id,
      template_id,
      title,
      slug,
      excerpt,
      seo_title,
      seo_description,
      featured_image,
      media_id,
      status,
      template_fields = [],
      cta_buttons = [],
    } = req.body;

    const productId = Number(product_id);
    const templateId = Number(template_id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Valid product id is required',
      });
    }

    if (!Number.isInteger(templateId) || templateId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Valid template id is required',
      });
    }

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        ok: false,
        message: 'Post title is required',
      });
    }

    const product = await getOwnedProduct(productId, userId);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: 'Product not found',
      });
    }

    const template = await getBlogTemplateById(templateId);

    if (!template || template.status !== 'active') {
      return res.status(400).json({
        ok: false,
        message: 'Selected template is invalid or inactive',
      });
    }

    let cleanCategoryId = product.category_id || null;
    if (category_id !== undefined && category_id !== null && category_id !== '') {
      cleanCategoryId = Number(category_id);

      if (!Number.isInteger(cleanCategoryId) || cleanCategoryId <= 0) {
        return res.status(400).json({
          ok: false,
          message: 'Invalid category id',
        });
      }

      const category = await getCategoryById(cleanCategoryId);

      if (!category || category.status !== 'active') {
        return res.status(400).json({
          ok: false,
          message: 'Selected category is invalid or inactive',
        });
      }
    }

    const cleanTitle = String(title).trim();
    const desiredSlug = normalizeNullable(slug) || cleanTitle;
    const baseSlug = makeSlug(desiredSlug);

    if (!baseSlug) {
      return res.status(400).json({
        ok: false,
        message: 'A valid post slug could not be generated',
      });
    }

    const uniqueSlug = await ensureUniquePostSlug(baseSlug, website.id);

    const cleanStatus = ['draft', 'published', 'inactive'].includes(status)
      ? status
      : 'draft';

    await validateTemplateLinkFields({
      fields: Array.isArray(template_fields) ? template_fields : [],
      userId,
      websiteId: website.id,
      postId: null,
    });

    const [result] = await pool.query(
      `
      INSERT INTO product_posts
      (
        product_id,
        user_id,
        website_id,
        category_id,
        template_id,
        title,
        slug,
        excerpt,
        seo_title,
        seo_description,
        featured_image,
        media_id,
        status,
        published_at,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        productId,
        userId,
        website.id,
        cleanCategoryId,
        templateId,
        cleanTitle,
        uniqueSlug,
        normalizeNullable(excerpt),
        normalizeNullable(seo_title),
        normalizeNullable(seo_description),
        normalizeNullable(featured_image),
        media_id || null,
        cleanStatus,
        cleanStatus === 'published' ? new Date() : null,
      ]
    );

    const postId = result.insertId;

    await replaceTemplateFields(postId, Array.isArray(template_fields) ? template_fields : []);
    await replacePostCtaButtons({
      postId,
      buttons: Array.isArray(cta_buttons) ? cta_buttons : [],
      userId,
      websiteId: website.id,
    });

    const fullPost = await buildFullPostResponse(postId, userId);

    return res.status(201).json({
      ok: true,
      message: 'Post created successfully',
      post: fullPost,
    });
  } catch (error) {
    console.error('createPost error:', error);

    return res.status(error.status || 500).json({
      ok: false,
      message: error.message || 'Failed to create post',
      error: error.status ? undefined : error.message,
    });
  }
}

async function updatePost(req, res) {
  try {
    const userId = req.user.id;
    const postId = Number(req.params.id);

    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid post id',
      });
    }

    const existingPost = await getOwnedPostById(postId, userId);

    if (!existingPost) {
      return res.status(404).json({
        ok: false,
        message: 'Post not found',
      });
    }

    const {
      product_id,
      category_id,
      template_id,
      title,
      slug,
      excerpt,
      seo_title,
      seo_description,
      featured_image,
      media_id,
      status,
      template_fields,
      cta_buttons,
    } = req.body;

    let productId = existingPost.product_id;
    if (product_id !== undefined) {
      productId = Number(product_id);

      if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({
          ok: false,
          message: 'Invalid product id',
        });
      }

      const product = await getOwnedProduct(productId, userId);

      if (!product) {
        return res.status(404).json({
          ok: false,
          message: 'Product not found',
        });
      }
    }

    let templateId = existingPost.template_id;
    if (template_id !== undefined) {
      templateId = Number(template_id);

      if (!Number.isInteger(templateId) || templateId <= 0) {
        return res.status(400).json({
          ok: false,
          message: 'Invalid template id',
        });
      }

      const template = await getBlogTemplateById(templateId);

      if (!template || template.status !== 'active') {
        return res.status(400).json({
          ok: false,
          message: 'Selected template is invalid or inactive',
        });
      }
    }

    let cleanCategoryId = existingPost.category_id;
    if (category_id !== undefined) {
      if (category_id === null || category_id === '') {
        cleanCategoryId = null;
      } else {
        cleanCategoryId = Number(category_id);

        if (!Number.isInteger(cleanCategoryId) || cleanCategoryId <= 0) {
          return res.status(400).json({
            ok: false,
            message: 'Invalid category id',
          });
        }

        const category = await getCategoryById(cleanCategoryId);

        if (!category || category.status !== 'active') {
          return res.status(400).json({
            ok: false,
            message: 'Selected category is invalid or inactive',
          });
        }
      }
    }

    const cleanTitle = title !== undefined ? String(title).trim() : existingPost.title;

    if (!cleanTitle) {
      return res.status(400).json({
        ok: false,
        message: 'Post title is required',
      });
    }

    const desiredSlug = slug !== undefined ? normalizeNullable(slug) || cleanTitle : existingPost.slug;
    const baseSlug = makeSlug(desiredSlug);

    if (!baseSlug) {
      return res.status(400).json({
        ok: false,
        message: 'A valid post slug could not be generated',
      });
    }

    const uniqueSlug = await ensureUniquePostSlug(baseSlug, existingPost.website_id, existingPost.id);

    const cleanStatus = ['draft', 'published', 'inactive'].includes(status)
      ? status
      : existingPost.status;

    const publishedAt =
      cleanStatus === 'published'
        ? existingPost.published_at || new Date()
        : null;

    if (Array.isArray(template_fields)) {
      await validateTemplateLinkFields({
        fields: template_fields,
        userId,
        websiteId: existingPost.website_id,
        postId: existingPost.id,
      });
    }

    await pool.query(
      `
      UPDATE product_posts
      SET
        product_id = ?,
        category_id = ?,
        template_id = ?,
        title = ?,
        slug = ?,
        excerpt = ?,
        seo_title = ?,
        seo_description = ?,
        featured_image = ?,
        media_id = ?,
        status = ?,
        published_at = ?,
        updated_at = NOW()
      WHERE id = ?
        AND user_id = ?
      `,
      [
        productId,
        cleanCategoryId,
        templateId,
        cleanTitle,
        uniqueSlug,
        excerpt !== undefined ? normalizeNullable(excerpt) : existingPost.excerpt,
        seo_title !== undefined ? normalizeNullable(seo_title) : existingPost.seo_title,
        seo_description !== undefined ? normalizeNullable(seo_description) : existingPost.seo_description,
        featured_image !== undefined ? normalizeNullable(featured_image) : existingPost.featured_image,
        media_id !== undefined ? media_id || null : existingPost.media_id,
        cleanStatus,
        publishedAt,
        existingPost.id,
        userId,
      ]
    );

    if (Array.isArray(template_fields)) {
      await replaceTemplateFields(existingPost.id, template_fields);
    }

    if (Array.isArray(cta_buttons)) {
      await replacePostCtaButtons({
        postId: existingPost.id,
        buttons: cta_buttons,
        userId,
        websiteId: existingPost.website_id,
      });
    }

    const fullPost = await buildFullPostResponse(existingPost.id, userId);

    return res.status(200).json({
      ok: true,
      message: 'Post updated successfully',
      post: fullPost,
    });
  } catch (error) {
    console.error('updatePost error:', error);

    return res.status(error.status || 500).json({
      ok: false,
      message: error.message || 'Failed to update post',
      error: error.status ? undefined : error.message,
    });
  }
}

async function updatePostStatus(req, res) {
  try {
    const userId = req.user.id;
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

    const existingPost = await getOwnedPostById(postId, userId);

    if (!existingPost) {
      return res.status(404).json({
        ok: false,
        message: 'Post not found',
      });
    }

    await pool.query(
      `
      UPDATE product_posts
      SET
        status = ?,
        published_at = ?,
        updated_at = NOW()
      WHERE id = ?
        AND user_id = ?
      `,
      [
        status,
        status === 'published' ? existingPost.published_at || new Date() : null,
        postId,
        userId,
      ]
    );

    const fullPost = await buildFullPostResponse(postId, userId);

    return res.status(200).json({
      ok: true,
      message: 'Post status updated successfully',
      post: fullPost,
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
    const userId = req.user.id;
    const postId = Number(req.params.id);

    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid post id',
      });
    }

    const existingPost = await getOwnedPostById(postId, userId);

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
        AND user_id = ?
      `,
      [postId, userId]
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
  getMyPosts,
  getMyPostById,
  getMyPostsByProductId,
  createPost,
  updatePost,
  updatePostStatus,
  deletePost,
};