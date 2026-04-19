const pool = require('../../config/db');

function sanitizeDesignSettings(row) {
  if (!row) return null;

  return {
    id: row.id,
    website_id: row.website_id,
    website_template_id: row.website_template_id,
    header_layout: row.header_layout,
    footer_layout: row.footer_layout,
    mobile_menu_style: row.mobile_menu_style,
    color_scheme: row.color_scheme,
    primary_color: row.primary_color,
    secondary_color: row.secondary_color,
    accent_color: row.accent_color,
    font_family: row.font_family,
    button_style: row.button_style,
    card_style: row.card_style,
    show_search: !!row.show_search,
    show_categories_menu: !!row.show_categories_menu,
    show_featured_slider: !!row.show_featured_slider,
    custom_css: row.custom_css,
    created_at: row.created_at,
    updated_at: row.updated_at,
    website_template: row.website_template_id
      ? {
          id: row.website_template_id,
          name: row.template_name,
          slug: row.template_slug,
          preview_image: row.template_preview_image,
          template_code_key: row.template_code_key,
          is_premium: !!row.template_is_premium,
          status: row.template_status,
        }
      : null,
  };
}

function normalizeNullable(value) {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str ? str : null;
}

function normalizeBooleanFlag(value, fallback = 0) {
  if (value === undefined) return fallback;
  if (value === true || value === 1 || value === '1' || value === 'true') return 1;
  if (value === false || value === 0 || value === '0' || value === 'false') return 0;
  return fallback;
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

async function getWebsiteTemplateById(templateId) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      slug,
      preview_image,
      template_code_key,
      is_premium,
      status
    FROM website_templates
    WHERE id = ?
    LIMIT 1
    `,
    [templateId]
  );

  return rows[0] || null;
}

async function getWebsiteDesignSettings(websiteId) {
  const [rows] = await pool.query(
    `
    SELECT
      wds.id,
      wds.website_id,
      wds.website_template_id,
      wds.header_layout,
      wds.footer_layout,
      wds.mobile_menu_style,
      wds.color_scheme,
      wds.primary_color,
      wds.secondary_color,
      wds.accent_color,
      wds.font_family,
      wds.button_style,
      wds.card_style,
      wds.show_search,
      wds.show_categories_menu,
      wds.show_featured_slider,
      wds.custom_css,
      wds.created_at,
      wds.updated_at,

      wt.name AS template_name,
      wt.slug AS template_slug,
      wt.preview_image AS template_preview_image,
      wt.template_code_key,
      wt.is_premium AS template_is_premium,
      wt.status AS template_status

    FROM website_design_settings wds
    LEFT JOIN website_templates wt
      ON wt.id = wds.website_template_id
    WHERE wds.website_id = ?
    LIMIT 1
    `,
    [websiteId]
  );

  return rows[0] || null;
}

async function getMyDesignSettings(req, res) {
  try {
    const website = await getAffiliateWebsite(req.user.id);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate website not found',
      });
    }

    const settings = await getWebsiteDesignSettings(website.id);

    return res.status(200).json({
      ok: true,
      settings: settings ? sanitizeDesignSettings(settings) : null,
    });
  } catch (error) {
    console.error('getMyDesignSettings error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch design settings',
      error: error.message,
    });
  }
}

async function saveMyDesignSettings(req, res) {
  try {
    const website = await getAffiliateWebsite(req.user.id);

    if (!website) {
      return res.status(400).json({
        ok: false,
        message: 'Create your website first before saving design settings',
      });
    }

    const existingSettings = await getWebsiteDesignSettings(website.id);

    const {
      website_template_id,
      header_layout,
      footer_layout,
      mobile_menu_style,
      color_scheme,
      primary_color,
      secondary_color,
      accent_color,
      font_family,
      button_style,
      card_style,
      show_search,
      show_categories_menu,
      show_featured_slider,
      custom_css,
    } = req.body;

    let cleanWebsiteTemplateId = existingSettings?.website_template_id || null;

    if (website_template_id !== undefined) {
      if (website_template_id === null || website_template_id === '') {
        cleanWebsiteTemplateId = null;
      } else {
        cleanWebsiteTemplateId = Number(website_template_id);

        if (!Number.isInteger(cleanWebsiteTemplateId) || cleanWebsiteTemplateId <= 0) {
          return res.status(400).json({
            ok: false,
            message: 'Invalid website template id',
          });
        }

        const template = await getWebsiteTemplateById(cleanWebsiteTemplateId);

        if (!template || template.status !== 'active') {
          return res.status(400).json({
            ok: false,
            message: 'Selected website template is invalid or inactive',
          });
        }
      }
    }

    const payload = {
      website_template_id: cleanWebsiteTemplateId,
      header_layout:
        header_layout !== undefined
          ? normalizeNullable(header_layout)
          : existingSettings?.header_layout || null,
      footer_layout:
        footer_layout !== undefined
          ? normalizeNullable(footer_layout)
          : existingSettings?.footer_layout || null,
      mobile_menu_style:
        mobile_menu_style !== undefined
          ? normalizeNullable(mobile_menu_style)
          : existingSettings?.mobile_menu_style || null,
      color_scheme:
        color_scheme !== undefined
          ? normalizeNullable(color_scheme)
          : existingSettings?.color_scheme || null,
      primary_color:
        primary_color !== undefined
          ? normalizeNullable(primary_color)
          : existingSettings?.primary_color || null,
      secondary_color:
        secondary_color !== undefined
          ? normalizeNullable(secondary_color)
          : existingSettings?.secondary_color || null,
      accent_color:
        accent_color !== undefined
          ? normalizeNullable(accent_color)
          : existingSettings?.accent_color || null,
      font_family:
        font_family !== undefined
          ? normalizeNullable(font_family)
          : existingSettings?.font_family || null,
      button_style:
        button_style !== undefined
          ? normalizeNullable(button_style)
          : existingSettings?.button_style || null,
      card_style:
        card_style !== undefined
          ? normalizeNullable(card_style)
          : existingSettings?.card_style || null,
      show_search: normalizeBooleanFlag(show_search, existingSettings?.show_search ? 1 : 0),
      show_categories_menu: normalizeBooleanFlag(
        show_categories_menu,
        existingSettings?.show_categories_menu ? 1 : 0
      ),
      show_featured_slider: normalizeBooleanFlag(
        show_featured_slider,
        existingSettings?.show_featured_slider ? 1 : 0
      ),
      custom_css:
        custom_css !== undefined
          ? normalizeNullable(custom_css)
          : existingSettings?.custom_css || null,
    };

    if (!existingSettings) {
      await pool.query(
        `
        INSERT INTO website_design_settings
        (
          website_id,
          website_template_id,
          header_layout,
          footer_layout,
          mobile_menu_style,
          color_scheme,
          primary_color,
          secondary_color,
          accent_color,
          font_family,
          button_style,
          card_style,
          show_search,
          show_categories_menu,
          show_featured_slider,
          custom_css,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [
          website.id,
          payload.website_template_id,
          payload.header_layout,
          payload.footer_layout,
          payload.mobile_menu_style,
          payload.color_scheme,
          payload.primary_color,
          payload.secondary_color,
          payload.accent_color,
          payload.font_family,
          payload.button_style,
          payload.card_style,
          payload.show_search,
          payload.show_categories_menu,
          payload.show_featured_slider,
          payload.custom_css,
        ]
      );
    } else {
      await pool.query(
        `
        UPDATE website_design_settings
        SET
          website_template_id = ?,
          header_layout = ?,
          footer_layout = ?,
          mobile_menu_style = ?,
          color_scheme = ?,
          primary_color = ?,
          secondary_color = ?,
          accent_color = ?,
          font_family = ?,
          button_style = ?,
          card_style = ?,
          show_search = ?,
          show_categories_menu = ?,
          show_featured_slider = ?,
          custom_css = ?,
          updated_at = NOW()
        WHERE website_id = ?
        `,
        [
          payload.website_template_id,
          payload.header_layout,
          payload.footer_layout,
          payload.mobile_menu_style,
          payload.color_scheme,
          payload.primary_color,
          payload.secondary_color,
          payload.accent_color,
          payload.font_family,
          payload.button_style,
          payload.card_style,
          payload.show_search,
          payload.show_categories_menu,
          payload.show_featured_slider,
          payload.custom_css,
          website.id,
        ]
      );
    }

    const savedSettings = await getWebsiteDesignSettings(website.id);

    return res.status(200).json({
      ok: true,
      message: existingSettings
        ? 'Design settings updated successfully'
        : 'Design settings created successfully',
      settings: sanitizeDesignSettings(savedSettings),
    });
  } catch (error) {
    console.error('saveMyDesignSettings error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to save design settings',
      error: error.message,
    });
  }
}

async function getAvailableWebsiteTemplates(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        id,
        name,
        slug,
        preview_image,
        template_code_key,
        description,
        is_premium,
        status,
        created_at,
        updated_at
      FROM website_templates
      WHERE status = 'active'
      ORDER BY id DESC
      `
    );

    return res.status(200).json({
      ok: true,
      templates: rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        preview_image: row.preview_image,
        template_code_key: row.template_code_key,
        description: row.description,
        is_premium: !!row.is_premium,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
      })),
    });
  } catch (error) {
    console.error('getAvailableWebsiteTemplates error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch website templates',
      error: error.message,
    });
  }
}

module.exports = {
  getMyDesignSettings,
  saveMyDesignSettings,
  getAvailableWebsiteTemplates,
};