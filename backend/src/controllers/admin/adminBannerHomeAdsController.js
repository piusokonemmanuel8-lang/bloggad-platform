const pool = require('../../config/db');

function cleanText(value) {
  return String(value || '').trim();
}

function normalizeNullable(value) {
  const text = cleanText(value);
  return text || null;
}

function toMoney(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return fallback;
  return Number(number.toFixed(4));
}

function toPositiveInt(value, fallback = 1) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) return fallback;
  return number;
}

function sanitizeSettings(row) {
  if (!row) return null;

  return {
    id: row.id,
    setting_key: row.setting_key,
    minimum_budget: Number(row.minimum_budget || 0),
    minimum_daily_cap: Number(row.minimum_daily_cap || 0),
    cost_per_view: Number(row.cost_per_view || 0),
    cost_per_click: Number(row.cost_per_click || 0),
    ad_insert_position: Number(row.ad_insert_position || 5),
    max_admin_slides: Number(row.max_admin_slides || 4),
    max_active_ads: Number(row.max_active_ads || 1),
    allow_image: Number(row.allow_image || 0) === 1,
    allow_video: Number(row.allow_video || 0) === 1,
    video_autoplay: Number(row.video_autoplay || 0) === 1,
    approval_required: Number(row.approval_required || 0) === 1,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function sanitizeAdminSlide(row) {
  if (!row) return null;

  return {
    id: row.id,
    slot_position: Number(row.slot_position || 1),
    media_type: row.media_type,
    image_url: row.image_url,
    video_url: row.video_url,
    poster_url: row.poster_url,
    eyebrow_text: row.eyebrow_text,
    title: row.title,
    subtitle: row.subtitle,
    promo_text: row.promo_text,
    cta_label: row.cta_label,
    cta_url: row.cta_url,
    secondary_cta_label: row.secondary_cta_label,
    secondary_cta_url: row.secondary_cta_url,
    theme_key: row.theme_key,
    background_color: row.background_color,
    text_color: row.text_color,
    sort_order: Number(row.sort_order || 0),
    status: row.status,
    created_by: row.created_by,
    updated_by: row.updated_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function getSettingsRow() {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM banner_home_ads_settings
    WHERE setting_key = 'default'
    LIMIT 1
    `
  );

  if (rows.length) return rows[0];

  await pool.query(
    `
    INSERT INTO banner_home_ads_settings
      (
        setting_key,
        minimum_budget,
        minimum_daily_cap,
        cost_per_view,
        cost_per_click,
        ad_insert_position,
        max_admin_slides,
        max_active_ads,
        allow_image,
        allow_video,
        video_autoplay,
        approval_required,
        status
      )
    VALUES
      ('default', 200.0000, 20.0000, 0.0500, 1.0000, 5, 4, 1, 1, 1, 1, 1, 'active')
    `
  );

  const [newRows] = await pool.query(
    `
    SELECT *
    FROM banner_home_ads_settings
    WHERE setting_key = 'default'
    LIMIT 1
    `
  );

  return newRows[0] || null;
}

async function getBannerHomeAdsSettings(req, res) {
  try {
    const settings = await getSettingsRow();

    return res.status(200).json({
      ok: true,
      settings: sanitizeSettings(settings),
    });
  } catch (error) {
    console.error('getBannerHomeAdsSettings error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch banner home ads settings',
      error: error.message,
    });
  }
}

async function updateBannerHomeAdsSettings(req, res) {
  try {
    const {
      minimum_budget,
      minimum_daily_cap,
      cost_per_view,
      cost_per_click,
      ad_insert_position,
      max_active_ads,
      allow_image,
      allow_video,
      video_autoplay,
      approval_required,
      status,
    } = req.body;

    const cleanMinimumBudget = toMoney(minimum_budget, 200);
    const cleanMinimumDailyCap = toMoney(minimum_daily_cap, 20);
    const cleanCostPerView = toMoney(cost_per_view, 0.05);
    const cleanCostPerClick = toMoney(cost_per_click, 1);
    const cleanAdInsertPosition = Math.min(Math.max(toPositiveInt(ad_insert_position, 5), 1), 5);
    const cleanMaxActiveAds = Math.min(Math.max(toPositiveInt(max_active_ads, 1), 1), 10);
    const cleanStatus = ['active', 'inactive'].includes(status) ? status : 'active';

    await getSettingsRow();

    await pool.query(
      `
      UPDATE banner_home_ads_settings
      SET
        minimum_budget = ?,
        minimum_daily_cap = ?,
        cost_per_view = ?,
        cost_per_click = ?,
        ad_insert_position = ?,
        max_admin_slides = 4,
        max_active_ads = ?,
        allow_image = ?,
        allow_video = ?,
        video_autoplay = ?,
        approval_required = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE setting_key = 'default'
      `,
      [
        cleanMinimumBudget,
        cleanMinimumDailyCap,
        cleanCostPerView,
        cleanCostPerClick,
        cleanAdInsertPosition,
        cleanMaxActiveAds,
        allow_image ? 1 : 0,
        allow_video ? 1 : 0,
        video_autoplay ? 1 : 0,
        approval_required ? 1 : 0,
        cleanStatus,
      ]
    );

    const settings = await getSettingsRow();

    return res.status(200).json({
      ok: true,
      message: 'Banner home ads settings updated successfully',
      settings: sanitizeSettings(settings),
    });
  } catch (error) {
    console.error('updateBannerHomeAdsSettings error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update banner home ads settings',
      error: error.message,
    });
  }
}

async function getAdminSlides(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM banner_home_admin_slides
      ORDER BY slot_position ASC, sort_order ASC, id ASC
      `
    );

    return res.status(200).json({
      ok: true,
      slides: rows.map(sanitizeAdminSlide),
    });
  } catch (error) {
    console.error('getAdminSlides error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch admin homepage slides',
      error: error.message,
    });
  }
}

async function getAdminSlideById(req, res) {
  try {
    const slideId = Number(req.params.id);

    if (!Number.isInteger(slideId) || slideId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid slide id',
      });
    }

    const [rows] = await pool.query(
      `
      SELECT *
      FROM banner_home_admin_slides
      WHERE id = ?
      LIMIT 1
      `,
      [slideId]
    );

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Slide not found',
      });
    }

    return res.status(200).json({
      ok: true,
      slide: sanitizeAdminSlide(rows[0]),
    });
  } catch (error) {
    console.error('getAdminSlideById error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch admin homepage slide',
      error: error.message,
    });
  }
}

function validateSlidePayload(body) {
  const mediaType = ['image', 'video'].includes(body.media_type) ? body.media_type : 'image';
  const title = cleanText(body.title);
  const ctaLabel = cleanText(body.cta_label) || 'Shop Now';
  const ctaUrl = cleanText(body.cta_url);

  if (!title) {
    return {
      ok: false,
      message: 'Slide title is required',
    };
  }

  if (!ctaUrl) {
    return {
      ok: false,
      message: 'CTA URL is required',
    };
  }

  if (mediaType === 'image' && !cleanText(body.image_url)) {
    return {
      ok: false,
      message: 'Image URL is required for image slide',
    };
  }

  if (mediaType === 'video' && !cleanText(body.video_url)) {
    return {
      ok: false,
      message: 'Video URL is required for video slide',
    };
  }

  return {
    ok: true,
    mediaType,
    title,
    ctaLabel,
    ctaUrl,
  };
}

async function createAdminSlide(req, res) {
  try {
    const settings = await getSettingsRow();

    const [countRows] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM banner_home_admin_slides
      `
    );

    const totalSlides = Number(countRows[0]?.total || 0);

    if (totalSlides >= 4) {
      return res.status(400).json({
        ok: false,
        message: 'Admin can only create 4 default homepage slides',
      });
    }

    const validation = validateSlidePayload(req.body);

    if (!validation.ok) {
      return res.status(400).json({
        ok: false,
        message: validation.message,
      });
    }

    const slotPosition = Math.min(Math.max(toPositiveInt(req.body.slot_position, totalSlides + 1), 1), 4);

    const [existingSlot] = await pool.query(
      `
      SELECT id
      FROM banner_home_admin_slides
      WHERE slot_position = ?
      LIMIT 1
      `,
      [slotPosition]
    );

    if (existingSlot.length) {
      return res.status(400).json({
        ok: false,
        message: `Slot ${slotPosition} already has a slide`,
      });
    }

    if (validation.mediaType === 'image' && !Number(settings.allow_image || 0)) {
      return res.status(400).json({
        ok: false,
        message: 'Image slides are disabled in settings',
      });
    }

    if (validation.mediaType === 'video' && !Number(settings.allow_video || 0)) {
      return res.status(400).json({
        ok: false,
        message: 'Video slides are disabled in settings',
      });
    }

    const cleanStatus = ['active', 'inactive'].includes(req.body.status)
      ? req.body.status
      : 'active';

    const [result] = await pool.query(
      `
      INSERT INTO banner_home_admin_slides
        (
          slot_position,
          media_type,
          image_url,
          video_url,
          poster_url,
          eyebrow_text,
          title,
          subtitle,
          promo_text,
          cta_label,
          cta_url,
          secondary_cta_label,
          secondary_cta_url,
          theme_key,
          background_color,
          text_color,
          sort_order,
          status,
          created_by,
          updated_by,
          created_at,
          updated_at
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      [
        slotPosition,
        validation.mediaType,
        normalizeNullable(req.body.image_url),
        normalizeNullable(req.body.video_url),
        normalizeNullable(req.body.poster_url),
        normalizeNullable(req.body.eyebrow_text),
        validation.title,
        normalizeNullable(req.body.subtitle),
        normalizeNullable(req.body.promo_text),
        validation.ctaLabel,
        validation.ctaUrl,
        normalizeNullable(req.body.secondary_cta_label),
        normalizeNullable(req.body.secondary_cta_url),
        normalizeNullable(req.body.theme_key),
        normalizeNullable(req.body.background_color),
        normalizeNullable(req.body.text_color),
        Number.isInteger(Number(req.body.sort_order)) ? Number(req.body.sort_order) : slotPosition,
        cleanStatus,
        req.user?.id || null,
        req.user?.id || null,
      ]
    );

    const [rows] = await pool.query(
      `
      SELECT *
      FROM banner_home_admin_slides
      WHERE id = ?
      LIMIT 1
      `,
      [result.insertId]
    );

    return res.status(201).json({
      ok: true,
      message: 'Admin homepage slide created successfully',
      slide: sanitizeAdminSlide(rows[0]),
    });
  } catch (error) {
    console.error('createAdminSlide error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to create admin homepage slide',
      error: error.message,
    });
  }
}

async function updateAdminSlide(req, res) {
  try {
    const slideId = Number(req.params.id);

    if (!Number.isInteger(slideId) || slideId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid slide id',
      });
    }

    const [existingRows] = await pool.query(
      `
      SELECT *
      FROM banner_home_admin_slides
      WHERE id = ?
      LIMIT 1
      `,
      [slideId]
    );

    if (!existingRows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Slide not found',
      });
    }

    const existing = existingRows[0];
    const mergedBody = {
      ...existing,
      ...req.body,
    };

    const validation = validateSlidePayload(mergedBody);

    if (!validation.ok) {
      return res.status(400).json({
        ok: false,
        message: validation.message,
      });
    }

    const settings = await getSettingsRow();

    if (validation.mediaType === 'image' && !Number(settings.allow_image || 0)) {
      return res.status(400).json({
        ok: false,
        message: 'Image slides are disabled in settings',
      });
    }

    if (validation.mediaType === 'video' && !Number(settings.allow_video || 0)) {
      return res.status(400).json({
        ok: false,
        message: 'Video slides are disabled in settings',
      });
    }

    const slotPosition = Math.min(Math.max(toPositiveInt(mergedBody.slot_position, existing.slot_position), 1), 4);

    const [slotRows] = await pool.query(
      `
      SELECT id
      FROM banner_home_admin_slides
      WHERE slot_position = ?
        AND id <> ?
      LIMIT 1
      `,
      [slotPosition, slideId]
    );

    if (slotRows.length) {
      return res.status(400).json({
        ok: false,
        message: `Slot ${slotPosition} already has another slide`,
      });
    }

    const cleanStatus = ['active', 'inactive'].includes(mergedBody.status)
      ? mergedBody.status
      : existing.status;

    await pool.query(
      `
      UPDATE banner_home_admin_slides
      SET
        slot_position = ?,
        media_type = ?,
        image_url = ?,
        video_url = ?,
        poster_url = ?,
        eyebrow_text = ?,
        title = ?,
        subtitle = ?,
        promo_text = ?,
        cta_label = ?,
        cta_url = ?,
        secondary_cta_label = ?,
        secondary_cta_url = ?,
        theme_key = ?,
        background_color = ?,
        text_color = ?,
        sort_order = ?,
        status = ?,
        updated_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        slotPosition,
        validation.mediaType,
        normalizeNullable(mergedBody.image_url),
        normalizeNullable(mergedBody.video_url),
        normalizeNullable(mergedBody.poster_url),
        normalizeNullable(mergedBody.eyebrow_text),
        validation.title,
        normalizeNullable(mergedBody.subtitle),
        normalizeNullable(mergedBody.promo_text),
        validation.ctaLabel,
        validation.ctaUrl,
        normalizeNullable(mergedBody.secondary_cta_label),
        normalizeNullable(mergedBody.secondary_cta_url),
        normalizeNullable(mergedBody.theme_key),
        normalizeNullable(mergedBody.background_color),
        normalizeNullable(mergedBody.text_color),
        Number.isInteger(Number(mergedBody.sort_order)) ? Number(mergedBody.sort_order) : slotPosition,
        cleanStatus,
        req.user?.id || null,
        slideId,
      ]
    );

    const [rows] = await pool.query(
      `
      SELECT *
      FROM banner_home_admin_slides
      WHERE id = ?
      LIMIT 1
      `,
      [slideId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Admin homepage slide updated successfully',
      slide: sanitizeAdminSlide(rows[0]),
    });
  } catch (error) {
    console.error('updateAdminSlide error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update admin homepage slide',
      error: error.message,
    });
  }
}

async function updateAdminSlideStatus(req, res) {
  try {
    const slideId = Number(req.params.id);
    const status = cleanText(req.body.status);

    if (!Number.isInteger(slideId) || slideId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid slide id',
      });
    }

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid slide status',
      });
    }

    await pool.query(
      `
      UPDATE banner_home_admin_slides
      SET
        status = ?,
        updated_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [status, req.user?.id || null, slideId]
    );

    const [rows] = await pool.query(
      `
      SELECT *
      FROM banner_home_admin_slides
      WHERE id = ?
      LIMIT 1
      `,
      [slideId]
    );

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Slide not found',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Admin homepage slide status updated successfully',
      slide: sanitizeAdminSlide(rows[0]),
    });
  } catch (error) {
    console.error('updateAdminSlideStatus error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update admin homepage slide status',
      error: error.message,
    });
  }
}

async function deleteAdminSlide(req, res) {
  try {
    const slideId = Number(req.params.id);

    if (!Number.isInteger(slideId) || slideId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid slide id',
      });
    }

    const [result] = await pool.query(
      `
      DELETE FROM banner_home_admin_slides
      WHERE id = ?
      `,
      [slideId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        ok: false,
        message: 'Slide not found',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Admin homepage slide deleted successfully',
    });
  } catch (error) {
    console.error('deleteAdminSlide error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to delete admin homepage slide',
      error: error.message,
    });
  }
}

module.exports = {
  getBannerHomeAdsSettings,
  updateBannerHomeAdsSettings,
  getAdminSlides,
  getAdminSlideById,
  createAdminSlide,
  updateAdminSlide,
  updateAdminSlideStatus,
  deleteAdminSlide,
};