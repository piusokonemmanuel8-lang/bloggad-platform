const pool = require('../../../config/db');
const { BUILT_IN_WEBSITE_TEMPLATES } = require('./designTemplateRegistry');
const { normalizeCodeKey } = require('./designUtils');

async function getWebsiteTemplateById(templateId) {
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
    WHERE id = ?
    LIMIT 1
    `,
    [templateId]
  );

  return rows[0] || null;
}

async function ensureBuiltInWebsiteTemplates() {
  for (const template of BUILT_IN_WEBSITE_TEMPLATES) {
    const [existingRows] = await pool.query(
      `
      SELECT id
      FROM website_templates
      WHERE LOWER(slug) = LOWER(?) OR LOWER(template_code_key) = LOWER(?)
      LIMIT 1
      `,
      [template.slug, template.template_code_key]
    );

    if (!existingRows.length) {
      await pool.query(
        `
        INSERT INTO website_templates
        (
          name,
          slug,
          preview_image,
          template_code_key,
          description,
          is_premium,
          status,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [
          template.name,
          template.slug,
          template.preview_image,
          normalizeCodeKey(template.template_code_key),
          template.description,
          template.is_premium,
          template.status,
        ]
      );
    }
  }
}

async function getAffiliateWebsite(userId) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      user_id,
      website_name,
      slug,
      status,
      created_at,
      updated_at
    FROM affiliate_websites
    WHERE user_id = ?
    LIMIT 1
    `,
    [userId]
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
      wds.template_settings_json,
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

module.exports = {
  getWebsiteTemplateById,
  ensureBuiltInWebsiteTemplates,
  getAffiliateWebsite,
  getWebsiteDesignSettings,
};