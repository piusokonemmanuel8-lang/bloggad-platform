const pool = require('../../config/db');
const {
  normalizeNullable,
  normalizeBooleanFlag,
} = require('./design/designUtils');
const {
  sanitizeDesignSettings,
  buildTemplateSettingsJsonPayload,
} = require('./design/designSanitizers');
const {
  ensureBuiltInWebsiteTemplates,
  getAffiliateWebsite,
  getWebsiteDesignSettings,
  getWebsiteTemplateById,
} = require('./design/designQueries');

function isAdmin(user) {
  return user?.role === 'admin';
}

async function getLatestSubscriptionPlanByUserId(userId) {
  const [rows] = await pool.query(
    `
    SELECT
      s.id AS subscription_id,
      s.user_id,
      s.plan_id,
      s.status AS subscription_status,
      p.name AS plan_name,
      p.premium_templates_only,
      p.website_templates_mode
    FROM affiliate_subscriptions s
    INNER JOIN subscription_plans p
      ON p.id = s.plan_id
    WHERE s.user_id = ?
    ORDER BY s.id DESC
    LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}

async function getAllowedWebsiteTemplateIdsByPlanId(planId) {
  if (!planId) return [];

  const [rows] = await pool.query(
    `
    SELECT website_template_id
    FROM plan_allowed_website_templates
    WHERE plan_id = ?
    ORDER BY id ASC
    `,
    [planId]
  );

  return rows
    .map((row) => Number(row.website_template_id))
    .filter((value) => Number.isInteger(value) && value > 0);
}

async function canUserUseWebsiteTemplate({ userId, templateId }) {
  const template = await getWebsiteTemplateById(templateId);

  if (!template || template.status !== 'active') {
    return {
      ok: false,
      message: 'Selected website template is invalid or inactive',
    };
  }

  const latestPlan = await getLatestSubscriptionPlanByUserId(userId);

  if (!latestPlan) {
    if (template.is_premium) {
      return {
        ok: false,
        message: 'Start a subscription plan before using this premium website template',
      };
    }

    return {
      ok: true,
      template,
      plan: null,
    };
  }

  const premiumTemplatesOnly = !!latestPlan.premium_templates_only;
  const websiteTemplatesMode = String(latestPlan.website_templates_mode || 'unlimited').toLowerCase();

  if (!premiumTemplatesOnly && template.is_premium) {
    return {
      ok: false,
      message: 'Your current plan does not allow premium website templates',
    };
  }

  if (websiteTemplatesMode === 'specific') {
    const allowedTemplateIds = await getAllowedWebsiteTemplateIdsByPlanId(latestPlan.plan_id);

    if (!allowedTemplateIds.includes(Number(templateId))) {
      return {
        ok: false,
        message: 'This website template is not included in your current plan',
      };
    }
  }

  return {
    ok: true,
    template,
    plan: latestPlan,
  };
}

async function getMyDesignSettings(req, res) {
  try {
    await ensureBuiltInWebsiteTemplates();

    if (isAdmin(req.user)) {
      return res.status(200).json({
        ok: true,
        settings: null,
      });
    }

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
    await ensureBuiltInWebsiteTemplates();

    if (isAdmin(req.user)) {
      return res.status(200).json({
        ok: true,
        message: 'Admin design page loaded successfully',
        settings: null,
      });
    }

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
      template_settings_json,
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

        const access = await canUserUseWebsiteTemplate({
          userId: req.user.id,
          templateId: cleanWebsiteTemplateId,
        });

        if (!access.ok) {
          return res.status(400).json({
            ok: false,
            message: access.message,
          });
        }
      }
    }

    const mergedTemplateSettingsJson = buildTemplateSettingsJsonPayload(
      template_settings_json || {},
      existingSettings?.template_settings_json || {}
    );

    const payload = {
      website_template_id: cleanWebsiteTemplateId,
      header_layout: normalizeNullable(header_layout),
      footer_layout: normalizeNullable(footer_layout),
      mobile_menu_style: normalizeNullable(mobile_menu_style),
      color_scheme: normalizeNullable(color_scheme),
      primary_color: normalizeNullable(primary_color),
      secondary_color: normalizeNullable(secondary_color),
      accent_color: normalizeNullable(accent_color),
      font_family: normalizeNullable(font_family),
      button_style: normalizeNullable(button_style),
      card_style: normalizeNullable(card_style),
      show_search: normalizeBooleanFlag(
        show_search,
        existingSettings ? Number(existingSettings.show_search) : 1
      ),
      show_categories_menu: normalizeBooleanFlag(
        show_categories_menu,
        existingSettings ? Number(existingSettings.show_categories_menu) : 1
      ),
      show_featured_slider: normalizeBooleanFlag(
        show_featured_slider,
        existingSettings ? Number(existingSettings.show_featured_slider) : 1
      ),
      custom_css: normalizeNullable(custom_css),
      template_settings_json: JSON.stringify(mergedTemplateSettingsJson),
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
          template_settings_json,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
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
          payload.template_settings_json,
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
          template_settings_json = ?,
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
          payload.template_settings_json,
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
    await ensureBuiltInWebsiteTemplates();

    if (isAdmin(req.user)) {
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
        ORDER BY is_premium ASC, id DESC
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
    }

    const latestPlan = await getLatestSubscriptionPlanByUserId(req.user.id);

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
      ORDER BY is_premium ASC, id DESC
      `
    );

    let templates = rows.map((row) => ({
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
    }));

    if (!latestPlan) {
      templates = templates.filter((item) => !item.is_premium);
    } else {
      if (!latestPlan.premium_templates_only) {
        templates = templates.filter((item) => !item.is_premium);
      }

      if (String(latestPlan.website_templates_mode || 'unlimited').toLowerCase() === 'specific') {
        const allowedTemplateIds = await getAllowedWebsiteTemplateIdsByPlanId(latestPlan.plan_id);
        templates = templates.filter((item) => allowedTemplateIds.includes(Number(item.id)));
      }
    }

    return res.status(200).json({
      ok: true,
      templates,
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