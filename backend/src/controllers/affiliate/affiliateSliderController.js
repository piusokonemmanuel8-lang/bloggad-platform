const pool = require('../../config/db');
const { assertAndLogSupgadUrl } = require('../../services/linkValidationService');

function sanitizeSlider(row) {
  if (!row) return null;

  return {
    id: row.id,
    website_id: row.website_id,
    image: row.image,
    media_id: row.media_id,
    title: row.title,
    subtitle: row.subtitle,
    link_type: row.link_type,
    linked_post_id: row.linked_post_id,
    linked_product_id: row.linked_product_id,
    external_url: row.external_url,
    sort_order: row.sort_order,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    linked_post: row.linked_post_id
      ? {
          id: row.linked_post_id,
          title: row.post_title,
          slug: row.post_slug,
          status: row.post_status,
        }
      : null,
    linked_product: row.linked_product_id
      ? {
          id: row.linked_product_id,
          title: row.product_title,
          slug: row.product_slug,
          status: row.product_status,
        }
      : null,
  };
}

function normalizeNullable(value) {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str ? str : null;
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

async function getOwnedPost(postId, userId) {
  const [rows] = await pool.query(
    `
    SELECT id, title, slug, status
    FROM product_posts
    WHERE id = ?
      AND user_id = ?
    LIMIT 1
    `,
    [postId, userId]
  );

  return rows[0] || null;
}

async function getOwnedProduct(productId, userId) {
  const [rows] = await pool.query(
    `
    SELECT id, title, slug, status
    FROM products
    WHERE id = ?
      AND user_id = ?
    LIMIT 1
    `,
    [productId, userId]
  );

  return rows[0] || null;
}

async function getSliderById(sliderId, websiteId) {
  const [rows] = await pool.query(
    `
    SELECT
      ws.id,
      ws.website_id,
      ws.image,
      ws.media_id,
      ws.title,
      ws.subtitle,
      ws.link_type,
      ws.linked_post_id,
      ws.linked_product_id,
      ws.external_url,
      ws.sort_order,
      ws.status,
      ws.created_at,
      ws.updated_at,
      pp.title AS post_title,
      pp.slug AS post_slug,
      pp.status AS post_status,
      p.title AS product_title,
      p.slug AS product_slug,
      p.status AS product_status
    FROM website_sliders ws
    LEFT JOIN product_posts pp
      ON pp.id = ws.linked_post_id
    LEFT JOIN products p
      ON p.id = ws.linked_product_id
    WHERE ws.id = ?
      AND ws.website_id = ?
    LIMIT 1
    `,
    [sliderId, websiteId]
  );

  return rows[0] || null;
}

async function getSlidersForWebsite(websiteId) {
  const [rows] = await pool.query(
    `
    SELECT
      ws.id,
      ws.website_id,
      ws.image,
      ws.media_id,
      ws.title,
      ws.subtitle,
      ws.link_type,
      ws.linked_post_id,
      ws.linked_product_id,
      ws.external_url,
      ws.sort_order,
      ws.status,
      ws.created_at,
      ws.updated_at,
      pp.title AS post_title,
      pp.slug AS post_slug,
      pp.status AS post_status,
      p.title AS product_title,
      p.slug AS product_slug,
      p.status AS product_status
    FROM website_sliders ws
    LEFT JOIN product_posts pp
      ON pp.id = ws.linked_post_id
    LEFT JOIN products p
      ON p.id = ws.linked_product_id
    WHERE ws.website_id = ?
    ORDER BY ws.sort_order ASC, ws.id DESC
    `,
    [websiteId]
  );

  return rows.map(sanitizeSlider);
}

async function getMySliders(req, res) {
  try {
    const website = await getAffiliateWebsite(req.user.id);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate website not found',
      });
    }

    const sliders = await getSlidersForWebsite(website.id);

    return res.status(200).json({
      ok: true,
      sliders,
    });
  } catch (error) {
    console.error('getMySliders error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch sliders',
      error: error.message,
    });
  }
}

async function getMySliderById(req, res) {
  try {
    const sliderId = Number(req.params.id);

    if (!Number.isInteger(sliderId) || sliderId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid slider id',
      });
    }

    const website = await getAffiliateWebsite(req.user.id);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate website not found',
      });
    }

    const slider = await getSliderById(sliderId, website.id);

    if (!slider) {
      return res.status(404).json({
        ok: false,
        message: 'Slider not found',
      });
    }

    return res.status(200).json({
      ok: true,
      slider: sanitizeSlider(slider),
    });
  } catch (error) {
    console.error('getMySliderById error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch slider',
      error: error.message,
    });
  }
}

async function createSlider(req, res) {
  try {
    const website = await getAffiliateWebsite(req.user.id);

    if (!website) {
      return res.status(400).json({
        ok: false,
        message: 'Create your website first before adding sliders',
      });
    }

    const {
      image,
      media_id,
      title,
      subtitle,
      link_type,
      linked_post_id,
      linked_product_id,
      external_url,
      sort_order,
      status,
    } = req.body;

    if (!image || !String(image).trim()) {
      return res.status(400).json({
        ok: false,
        message: 'Slider image is required',
      });
    }

    const cleanLinkType = ['internal_post', 'external_url', 'product'].includes(link_type)
      ? link_type
      : 'internal_post';

    let cleanLinkedPostId = null;
    let cleanLinkedProductId = null;
    let cleanExternalUrl = null;

    if (cleanLinkType === 'internal_post') {
      cleanLinkedPostId = Number(linked_post_id);

      if (!Number.isInteger(cleanLinkedPostId) || cleanLinkedPostId <= 0) {
        return res.status(400).json({
          ok: false,
          message: 'Valid linked post is required for internal_post slider',
        });
      }

      const post = await getOwnedPost(cleanLinkedPostId, req.user.id);

      if (!post) {
        return res.status(404).json({
          ok: false,
          message: 'Linked post not found',
        });
      }
    }

    if (cleanLinkType === 'product') {
      cleanLinkedProductId = Number(linked_product_id);

      if (!Number.isInteger(cleanLinkedProductId) || cleanLinkedProductId <= 0) {
        return res.status(400).json({
          ok: false,
          message: 'Valid linked product is required for product slider',
        });
      }

      const product = await getOwnedProduct(cleanLinkedProductId, req.user.id);

      if (!product) {
        return res.status(404).json({
          ok: false,
          message: 'Linked product not found',
        });
      }
    }

    if (cleanLinkType === 'external_url') {
      const validated = await assertAndLogSupgadUrl({
        value: external_url,
        fieldName: 'Slider external URL',
        required: true,
        allowEmpty: false,
        userId: req.user.id,
        websiteId: website.id,
        sourceType: 'slider',
        sourceId: null,
      });

      cleanExternalUrl = validated.submitted_link;
    }

    const cleanSortOrder =
      Number.isInteger(Number(sort_order)) ? Number(sort_order) : 0;

    const cleanStatus = ['active', 'inactive'].includes(status) ? status : 'active';

    const [result] = await pool.query(
      `
      INSERT INTO website_sliders
      (
        website_id,
        image,
        media_id,
        title,
        subtitle,
        link_type,
        linked_post_id,
        linked_product_id,
        external_url,
        sort_order,
        status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        website.id,
        String(image).trim(),
        media_id || null,
        normalizeNullable(title),
        normalizeNullable(subtitle),
        cleanLinkType,
        cleanLinkedPostId,
        cleanLinkedProductId,
        cleanExternalUrl,
        cleanSortOrder,
        cleanStatus,
      ]
    );

    const slider = await getSliderById(result.insertId, website.id);

    return res.status(201).json({
      ok: true,
      message: 'Slider created successfully',
      slider: sanitizeSlider(slider),
    });
  } catch (error) {
    console.error('createSlider error:', error);

    return res.status(error.status || 500).json({
      ok: false,
      message: error.message || 'Failed to create slider',
      error: error.status ? undefined : error.message,
    });
  }
}

async function updateSlider(req, res) {
  try {
    const sliderId = Number(req.params.id);

    if (!Number.isInteger(sliderId) || sliderId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid slider id',
      });
    }

    const website = await getAffiliateWebsite(req.user.id);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate website not found',
      });
    }

    const existingSlider = await getSliderById(sliderId, website.id);

    if (!existingSlider) {
      return res.status(404).json({
        ok: false,
        message: 'Slider not found',
      });
    }

    const {
      image,
      media_id,
      title,
      subtitle,
      link_type,
      linked_post_id,
      linked_product_id,
      external_url,
      sort_order,
      status,
    } = req.body;

    const cleanLinkType = ['internal_post', 'external_url', 'product'].includes(link_type)
      ? link_type
      : existingSlider.link_type;

    let cleanLinkedPostId = null;
    let cleanLinkedProductId = null;
    let cleanExternalUrl = null;

    if (cleanLinkType === 'internal_post') {
      cleanLinkedPostId =
        linked_post_id !== undefined ? Number(linked_post_id) : existingSlider.linked_post_id;

      if (!Number.isInteger(cleanLinkedPostId) || cleanLinkedPostId <= 0) {
        return res.status(400).json({
          ok: false,
          message: 'Valid linked post is required for internal_post slider',
        });
      }

      const post = await getOwnedPost(cleanLinkedPostId, req.user.id);

      if (!post) {
        return res.status(404).json({
          ok: false,
          message: 'Linked post not found',
        });
      }
    }

    if (cleanLinkType === 'product') {
      cleanLinkedProductId =
        linked_product_id !== undefined
          ? Number(linked_product_id)
          : existingSlider.linked_product_id;

      if (!Number.isInteger(cleanLinkedProductId) || cleanLinkedProductId <= 0) {
        return res.status(400).json({
          ok: false,
          message: 'Valid linked product is required for product slider',
        });
      }

      const product = await getOwnedProduct(cleanLinkedProductId, req.user.id);

      if (!product) {
        return res.status(404).json({
          ok: false,
          message: 'Linked product not found',
        });
      }
    }

    if (cleanLinkType === 'external_url') {
      const urlValue =
        external_url !== undefined ? external_url : existingSlider.external_url;

      const validated = await assertAndLogSupgadUrl({
        value: urlValue,
        fieldName: 'Slider external URL',
        required: true,
        allowEmpty: false,
        userId: req.user.id,
        websiteId: website.id,
        sourceType: 'slider',
        sourceId: existingSlider.id,
      });

      cleanExternalUrl = validated.submitted_link;
    }

    const cleanSortOrder =
      sort_order !== undefined && Number.isInteger(Number(sort_order))
        ? Number(sort_order)
        : existingSlider.sort_order;

    const cleanStatus =
      ['active', 'inactive'].includes(status) ? status : existingSlider.status;

    await pool.query(
      `
      UPDATE website_sliders
      SET
        image = ?,
        media_id = ?,
        title = ?,
        subtitle = ?,
        link_type = ?,
        linked_post_id = ?,
        linked_product_id = ?,
        external_url = ?,
        sort_order = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
        AND website_id = ?
      `,
      [
        image !== undefined ? String(image).trim() : existingSlider.image,
        media_id !== undefined ? media_id || null : existingSlider.media_id,
        title !== undefined ? normalizeNullable(title) : existingSlider.title,
        subtitle !== undefined ? normalizeNullable(subtitle) : existingSlider.subtitle,
        cleanLinkType,
        cleanLinkedPostId,
        cleanLinkedProductId,
        cleanExternalUrl,
        cleanSortOrder,
        cleanStatus,
        sliderId,
        website.id,
      ]
    );

    const updatedSlider = await getSliderById(sliderId, website.id);

    return res.status(200).json({
      ok: true,
      message: 'Slider updated successfully',
      slider: sanitizeSlider(updatedSlider),
    });
  } catch (error) {
    console.error('updateSlider error:', error);

    return res.status(error.status || 500).json({
      ok: false,
      message: error.message || 'Failed to update slider',
      error: error.status ? undefined : error.message,
    });
  }
}

async function updateSliderStatus(req, res) {
  try {
    const sliderId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(sliderId) || sliderId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid slider id',
      });
    }

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid slider status',
      });
    }

    const website = await getAffiliateWebsite(req.user.id);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate website not found',
      });
    }

    const existingSlider = await getSliderById(sliderId, website.id);

    if (!existingSlider) {
      return res.status(404).json({
        ok: false,
        message: 'Slider not found',
      });
    }

    await pool.query(
      `
      UPDATE website_sliders
      SET
        status = ?,
        updated_at = NOW()
      WHERE id = ?
        AND website_id = ?
      `,
      [status, sliderId, website.id]
    );

    const updatedSlider = await getSliderById(sliderId, website.id);

    return res.status(200).json({
      ok: true,
      message: 'Slider status updated successfully',
      slider: sanitizeSlider(updatedSlider),
    });
  } catch (error) {
    console.error('updateSliderStatus error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update slider status',
      error: error.message,
    });
  }
}

async function deleteSlider(req, res) {
  try {
    const sliderId = Number(req.params.id);

    if (!Number.isInteger(sliderId) || sliderId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid slider id',
      });
    }

    const website = await getAffiliateWebsite(req.user.id);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate website not found',
      });
    }

    const existingSlider = await getSliderById(sliderId, website.id);

    if (!existingSlider) {
      return res.status(404).json({
        ok: false,
        message: 'Slider not found',
      });
    }

    await pool.query(
      `
      DELETE FROM website_sliders
      WHERE id = ?
        AND website_id = ?
      `,
      [sliderId, website.id]
    );

    return res.status(200).json({
      ok: true,
      message: 'Slider deleted successfully',
    });
  } catch (error) {
    console.error('deleteSlider error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to delete slider',
      error: error.message,
    });
  }
}

module.exports = {
  getMySliders,
  getMySliderById,
  createSlider,
  updateSlider,
  updateSliderStatus,
  deleteSlider,
};