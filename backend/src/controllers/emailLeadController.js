const pool = require('../config/db');

function toPositiveInt(value) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) return null;
  return num;
}

function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function isAdmin(user) {
  return user?.role === 'admin';
}

function isAffiliate(user) {
  return user?.role === 'affiliate';
}

function normalizeDisplayMode(value = '') {
  const mode = String(value || '').trim().toLowerCase();

  if (['popup', 'footer', 'both'].includes(mode)) {
    return mode;
  }

  if (['after_seconds', 'on_entry', 'manual_only'].includes(mode)) {
    return 'popup';
  }

  return 'popup';
}

async function getWebsiteById(websiteId) {
  const [rows] = await pool.query(
    `
    SELECT
      aw.id,
      aw.user_id AS affiliate_id,
      aw.website_name,
      aw.slug,
      aw.status
    FROM affiliate_websites aw
    WHERE aw.id = ?
    LIMIT 1
    `,
    [websiteId]
  );

  return rows[0] || null;
}

async function getWebsiteBySlug(slug) {
  const [rows] = await pool.query(
    `
    SELECT
      aw.id,
      aw.user_id AS affiliate_id,
      aw.website_name,
      aw.slug,
      aw.status
    FROM affiliate_websites aw
    WHERE aw.slug = ?
    LIMIT 1
    `,
    [slug]
  );

  return rows[0] || null;
}

async function getAffiliateOwnedWebsite(affiliateId, websiteId) {
  const [rows] = await pool.query(
    `
    SELECT
      aw.id,
      aw.user_id AS affiliate_id,
      aw.website_name,
      aw.slug,
      aw.status
    FROM affiliate_websites aw
    WHERE aw.id = ?
      AND aw.user_id = ?
    LIMIT 1
    `,
    [websiteId, affiliateId]
  );

  return rows[0] || null;
}

async function getEmailListSettingsForWebsite(websiteId) {
  const [rows] = await pool.query(
    `
    SELECT
      wels.id,
      wels.website_id,
      wels.affiliate_id,
      wels.enabled,
      wels.selected_template_id,
      wels.show_mode,
      wels.delay_seconds,
      wels.show_once_per_session,
      wels.title,
      wels.subtitle,
      wels.placeholder_text,
      wels.button_text,
      wels.success_message,
      wels.created_at,
      wels.updated_at,
      ept.name AS template_name,
      ept.template_key,
      ept.preview_image,
      ept.description,
      ept.template_json,
      ept.status AS template_status
    FROM website_email_list_settings wels
    LEFT JOIN email_popup_templates ept
      ON ept.id = wels.selected_template_id
    WHERE wels.website_id = ?
    LIMIT 1
    `,
    [websiteId]
  );

  return rows[0] || null;
}

async function getTemplateById(templateId) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      template_key,
      preview_image,
      description,
      template_json,
      status,
      created_at,
      updated_at
    FROM email_popup_templates
    WHERE id = ?
    LIMIT 1
    `,
    [templateId]
  );

  return rows[0] || null;
}

async function getTemplates({ status = null } = {}) {
  let sql = `
    SELECT
      id,
      name,
      template_key,
      preview_image,
      description,
      template_json,
      status,
      created_at,
      updated_at
    FROM email_popup_templates
  `;
  const params = [];

  if (status) {
    sql += ` WHERE status = ? `;
    params.push(status);
  }

  sql += ` ORDER BY id DESC `;

  const [rows] = await pool.query(sql, params);
  return rows;
}

function sanitizeTemplate(template) {
  if (!template) return null;

  return {
    id: template.id,
    name: template.name,
    template_key: template.template_key,
    preview_image: template.preview_image,
    description: template.description,
    template_json: template.template_json,
    status: template.status,
    created_at: template.created_at,
    updated_at: template.updated_at,
  };
}

function sanitizeSettings(settings) {
  if (!settings) return null;

  const displayMode = normalizeDisplayMode(settings.show_mode);

  return {
    id: settings.id,
    website_id: settings.website_id,
    affiliate_id: settings.affiliate_id,
    enabled: !!settings.enabled,
    selected_template_id: settings.selected_template_id,
    display_mode: displayMode,
    show_mode: displayMode,
    delay_seconds: Number(settings.delay_seconds || 0),
    popup_delay_seconds: Number(settings.delay_seconds || 0),
    show_once_per_session: !!settings.show_once_per_session,
    popup_cooldown_minutes: 10,
    page_target: 'post_only',
    title: settings.title,
    subtitle: settings.subtitle,
    placeholder_text: settings.placeholder_text,
    button_text: settings.button_text,
    success_message: settings.success_message,
    created_at: settings.created_at,
    updated_at: settings.updated_at,
    template: settings.selected_template_id
      ? {
          id: settings.selected_template_id,
          name: settings.template_name,
          template_key: settings.template_key,
          preview_image: settings.preview_image,
          description: settings.description,
          template_json: settings.template_json,
          status: settings.template_status,
        }
      : null,
  };
}

async function createEmailPopupTemplate(req, res) {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({
        ok: false,
        message: 'Only admin can create email templates.',
      });
    }

    const name = String(req.body?.name || '').trim();
    const templateKey = String(req.body?.template_key || '').trim();
    const previewImage = String(req.body?.preview_image || '').trim() || null;
    const description = String(req.body?.description || '').trim() || null;
    const templateJson =
      req.body?.template_json !== undefined && req.body?.template_json !== null
        ? typeof req.body.template_json === 'string'
          ? req.body.template_json
          : JSON.stringify(req.body.template_json)
        : null;
    const status = String(req.body?.status || 'active').trim();

    if (!name) {
      return res.status(400).json({
        ok: false,
        message: 'name is required.',
      });
    }

    if (!templateKey) {
      return res.status(400).json({
        ok: false,
        message: 'template_key is required.',
      });
    }

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid status.',
      });
    }

    const [existing] = await pool.query(
      `
      SELECT id
      FROM email_popup_templates
      WHERE template_key = ?
      LIMIT 1
      `,
      [templateKey]
    );

    if (existing[0]) {
      return res.status(409).json({
        ok: false,
        message: 'This template_key already exists.',
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO email_popup_templates (
        name,
        template_key,
        preview_image,
        description,
        template_json,
        status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [name, templateKey, previewImage, description, templateJson, status]
    );

    const template = await getTemplateById(result.insertId);

    return res.status(201).json({
      ok: true,
      message: 'Email popup template created successfully.',
      template: sanitizeTemplate(template),
    });
  } catch (error) {
    console.error('createEmailPopupTemplate error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to create email popup template.',
      error: error.message,
    });
  }
}

async function updateEmailPopupTemplate(req, res) {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({
        ok: false,
        message: 'Only admin can update email templates.',
      });
    }

    const templateId = toPositiveInt(req.params?.templateId);

    if (!templateId) {
      return res.status(400).json({
        ok: false,
        message: 'templateId is required.',
      });
    }

    const existing = await getTemplateById(templateId);

    if (!existing) {
      return res.status(404).json({
        ok: false,
        message: 'Template not found.',
      });
    }

    const name =
      req.body?.name !== undefined ? String(req.body.name).trim() : existing.name;

    const templateKey =
      req.body?.template_key !== undefined
        ? String(req.body.template_key).trim()
        : existing.template_key;

    const previewImage =
      req.body?.preview_image !== undefined
        ? String(req.body.preview_image || '').trim() || null
        : existing.preview_image;

    const description =
      req.body?.description !== undefined
        ? String(req.body.description || '').trim() || null
        : existing.description;

    const templateJson =
      req.body?.template_json !== undefined
        ? req.body.template_json === null
          ? null
          : typeof req.body.template_json === 'string'
          ? req.body.template_json
          : JSON.stringify(req.body.template_json)
        : existing.template_json;

    const status =
      req.body?.status !== undefined
        ? String(req.body.status).trim()
        : existing.status;

    if (!name) {
      return res.status(400).json({
        ok: false,
        message: 'name is required.',
      });
    }

    if (!templateKey) {
      return res.status(400).json({
        ok: false,
        message: 'template_key is required.',
      });
    }

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid status.',
      });
    }

    const [duplicateRows] = await pool.query(
      `
      SELECT id
      FROM email_popup_templates
      WHERE template_key = ?
        AND id <> ?
      LIMIT 1
      `,
      [templateKey, templateId]
    );

    if (duplicateRows[0]) {
      return res.status(409).json({
        ok: false,
        message: 'This template_key already exists.',
      });
    }

    await pool.query(
      `
      UPDATE email_popup_templates
      SET
        name = ?,
        template_key = ?,
        preview_image = ?,
        description = ?,
        template_json = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [name, templateKey, previewImage, description, templateJson, status, templateId]
    );

    const template = await getTemplateById(templateId);

    return res.status(200).json({
      ok: true,
      message: 'Email popup template updated successfully.',
      template: sanitizeTemplate(template),
    });
  } catch (error) {
    console.error('updateEmailPopupTemplate error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update email popup template.',
      error: error.message,
    });
  }
}

async function getAdminEmailPopupTemplates(req, res) {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({
        ok: false,
        message: 'Only admin can view email templates.',
      });
    }

    const status =
      req.query?.status && ['active', 'inactive'].includes(String(req.query.status))
        ? String(req.query.status)
        : null;

    const templates = await getTemplates({ status });

    return res.status(200).json({
      ok: true,
      templates: templates.map(sanitizeTemplate),
    });
  } catch (error) {
    console.error('getAdminEmailPopupTemplates error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch email popup templates.',
      error: error.message,
    });
  }
}

async function getPublicEmailPopupTemplates(req, res) {
  try {
    const templates = await getTemplates({ status: 'active' });

    return res.status(200).json({
      ok: true,
      templates: templates.map(sanitizeTemplate),
    });
  } catch (error) {
    console.error('getPublicEmailPopupTemplates error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch public email popup templates.',
      error: error.message,
    });
  }
}

async function getAffiliateEmailListSettings(req, res) {
  try {
    if (!isAffiliate(req.user) && !isAdmin(req.user)) {
      return res.status(403).json({
        ok: false,
        message: 'Unauthorized role.',
      });
    }

    const websiteId = toPositiveInt(req.params?.websiteId || req.query?.website_id);

    if (!websiteId) {
      return res.status(400).json({
        ok: false,
        message: 'website_id is required.',
      });
    }

    let website = null;

    if (isAffiliate(req.user)) {
      website = await getAffiliateOwnedWebsite(req.user.id, websiteId);
    } else {
      website = await getWebsiteById(websiteId);
    }

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Website not found.',
      });
    }

    const settings = await getEmailListSettingsForWebsite(websiteId);

    return res.status(200).json({
      ok: true,
      website,
      settings: sanitizeSettings(settings),
    });
  } catch (error) {
    console.error('getAffiliateEmailListSettings error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch email list settings.',
      error: error.message,
    });
  }
}

async function saveAffiliateEmailListSettings(req, res) {
  try {
    if (!isAffiliate(req.user) && !isAdmin(req.user)) {
      return res.status(403).json({
        ok: false,
        message: 'Unauthorized role.',
      });
    }

    const websiteId = toPositiveInt(req.body?.website_id || req.params?.websiteId);

    if (!websiteId) {
      return res.status(400).json({
        ok: false,
        message: 'website_id is required.',
      });
    }

    let website = null;

    if (isAffiliate(req.user)) {
      website = await getAffiliateOwnedWebsite(req.user.id, websiteId);
    } else {
      website = await getWebsiteById(websiteId);
    }

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Website not found.',
      });
    }

    const enabled = Number(req.body?.enabled ? 1 : 0);
    const selectedTemplateId =
      req.body?.selected_template_id !== undefined &&
      req.body?.selected_template_id !== null &&
      req.body?.selected_template_id !== ''
        ? toPositiveInt(req.body.selected_template_id)
        : null;

    const displayMode = normalizeDisplayMode(req.body?.show_mode || req.body?.display_mode);
    const delaySeconds = Math.max(0, Number(req.body?.delay_seconds ?? req.body?.popup_delay_seconds ?? 8) || 0);
    const showOncePerSession = Number(req.body?.show_once_per_session ? 1 : 0);
    const title = String(req.body?.title || '').trim() || null;
    const subtitle = String(req.body?.subtitle || '').trim() || null;
    const placeholderText =
      String(req.body?.placeholder_text || '').trim() || 'Enter your email';
    const buttonText = String(req.body?.button_text || '').trim() || 'Subscribe';
    const successMessage =
      String(req.body?.success_message || '').trim() || 'Saved successfully';

    if (selectedTemplateId) {
      const template = await getTemplateById(selectedTemplateId);

      if (!template || template.status !== 'active') {
        return res.status(400).json({
          ok: false,
          message: 'Selected template is invalid or inactive.',
        });
      }
    }

    const [existingRows] = await pool.query(
      `
      SELECT id
      FROM website_email_list_settings
      WHERE website_id = ?
      LIMIT 1
      `,
      [websiteId]
    );

    if (existingRows[0]) {
      await pool.query(
        `
        UPDATE website_email_list_settings
        SET
          affiliate_id = ?,
          enabled = ?,
          selected_template_id = ?,
          show_mode = ?,
          delay_seconds = ?,
          show_once_per_session = ?,
          title = ?,
          subtitle = ?,
          placeholder_text = ?,
          button_text = ?,
          success_message = ?,
          updated_at = NOW()
        WHERE website_id = ?
        `,
        [
          website.affiliate_id,
          enabled,
          selectedTemplateId,
          displayMode,
          delaySeconds,
          showOncePerSession,
          title,
          subtitle,
          placeholderText,
          buttonText,
          successMessage,
          websiteId,
        ]
      );
    } else {
      await pool.query(
        `
        INSERT INTO website_email_list_settings (
          website_id,
          affiliate_id,
          enabled,
          selected_template_id,
          show_mode,
          delay_seconds,
          show_once_per_session,
          title,
          subtitle,
          placeholder_text,
          button_text,
          success_message,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [
          websiteId,
          website.affiliate_id,
          enabled,
          selectedTemplateId,
          displayMode,
          delaySeconds,
          showOncePerSession,
          title,
          subtitle,
          placeholderText,
          buttonText,
          successMessage,
        ]
      );
    }

    const settings = await getEmailListSettingsForWebsite(websiteId);

    return res.status(200).json({
      ok: true,
      message: 'Email list settings saved successfully.',
      settings: sanitizeSettings(settings),
    });
  } catch (error) {
    console.error('saveAffiliateEmailListSettings error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to save email list settings.',
      error: error.message,
    });
  }
}

async function getPublicWebsiteEmailPopup(req, res) {
  try {
    const websiteId = toPositiveInt(req.query?.website_id);
    const websiteSlug = String(req.query?.website_slug || '').trim();

    let website = null;

    if (websiteId) {
      website = await getWebsiteById(websiteId);
    } else if (websiteSlug) {
      website = await getWebsiteBySlug(websiteSlug);
    }

    if (!website || website.status !== 'active') {
      return res.status(404).json({
        ok: false,
        message: 'Storefront not found.',
      });
    }

    const settings = await getEmailListSettingsForWebsite(website.id);

    if (!settings || !settings.enabled) {
      return res.status(200).json({
        ok: true,
        enabled: false,
        website: {
          id: website.id,
          affiliate_id: website.affiliate_id,
          website_name: website.website_name,
          slug: website.slug,
        },
        capture: null,
      });
    }

    const sanitized = sanitizeSettings(settings);

    return res.status(200).json({
      ok: true,
      enabled: true,
      website: {
        id: website.id,
        affiliate_id: website.affiliate_id,
        website_name: website.website_name,
        slug: website.slug,
      },
      capture: sanitized,
      popup: sanitized,
    });
  } catch (error) {
    console.error('getPublicWebsiteEmailPopup error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch storefront email popup.',
      error: error.message,
    });
  }
}

async function captureStorefrontEmailLead(req, res) {
  try {
    const websiteId = toPositiveInt(req.body?.website_id);
    const websiteSlug = String(req.body?.website_slug || '').trim();
    const email = normalizeEmail(req.body?.email);
    const sourceType = String(req.body?.source_type || 'popup').trim();

    if (!email) {
      return res.status(400).json({
        ok: false,
        message: 'Email is required.',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        ok: false,
        message: 'Please enter a valid email address.',
      });
    }

    if (!['popup', 'footer', 'inline', 'manual'].includes(sourceType)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid source_type.',
      });
    }

    let website = null;

    if (websiteId) {
      website = await getWebsiteById(websiteId);
    } else if (websiteSlug) {
      website = await getWebsiteBySlug(websiteSlug);
    }

    if (!website || website.status !== 'active') {
      return res.status(404).json({
        ok: false,
        message: 'Storefront not found.',
      });
    }

    const settings = await getEmailListSettingsForWebsite(website.id);

    if (!settings || !settings.enabled) {
      return res.status(400).json({
        ok: false,
        message: 'Email capture is not enabled for this storefront.',
      });
    }

    const customerUserId = req.user?.role === 'customer' ? req.user.id : null;

    await pool.query(
      `
      INSERT INTO storefront_email_leads (
        affiliate_id,
        website_id,
        customer_user_id,
        email,
        source_type,
        template_id,
        captured_at,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        customer_user_id = VALUES(customer_user_id),
        source_type = VALUES(source_type),
        template_id = VALUES(template_id),
        captured_at = NOW()
      `,
      [
        website.affiliate_id,
        website.id,
        customerUserId,
        email,
        sourceType,
        settings.selected_template_id || null,
      ]
    );

    return res.status(200).json({
      ok: true,
      message: settings.success_message || 'Saved successfully',
    });
  } catch (error) {
    console.error('captureStorefrontEmailLead error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to capture email lead.',
      error: error.message,
    });
  }
}

async function getAffiliateEmailLeads(req, res) {
  try {
    if (!isAffiliate(req.user) && !isAdmin(req.user)) {
      return res.status(403).json({
        ok: false,
        message: 'Unauthorized role.',
      });
    }

    const websiteId = toPositiveInt(req.query?.website_id);
    const affiliateId = isAdmin(req.user)
      ? toPositiveInt(req.query?.affiliate_id)
      : req.user.id;

    let sql = `
      SELECT
        sel.id,
        sel.affiliate_id,
        sel.website_id,
        sel.customer_user_id,
        sel.email,
        sel.source_type,
        sel.template_id,
        sel.captured_at,
        sel.created_at,
        aw.website_name,
        aw.slug AS website_slug,
        u.name AS customer_name,
        u.email AS customer_account_email,
        ept.name AS template_name,
        ept.template_key
      FROM storefront_email_leads sel
      LEFT JOIN affiliate_websites aw
        ON aw.id = sel.website_id
      LEFT JOIN users u
        ON u.id = sel.customer_user_id
      LEFT JOIN email_popup_templates ept
        ON ept.id = sel.template_id
      WHERE 1 = 1
    `;
    const params = [];

    if (affiliateId) {
      sql += ` AND sel.affiliate_id = ? `;
      params.push(affiliateId);
    }

    if (websiteId) {
      sql += ` AND sel.website_id = ? `;
      params.push(websiteId);
    }

    sql += ` ORDER BY sel.captured_at DESC `;

    const [rows] = await pool.query(sql, params);

    return res.status(200).json({
      ok: true,
      leads: rows.map((row) => ({
        id: row.id,
        affiliate_id: row.affiliate_id,
        website_id: row.website_id,
        customer_user_id: row.customer_user_id,
        email: row.email,
        source_type: row.source_type,
        template_id: row.template_id,
        captured_at: row.captured_at,
        created_at: row.created_at,
        website: {
          id: row.website_id,
          website_name: row.website_name,
          slug: row.website_slug,
        },
        customer: row.customer_user_id
          ? {
              id: row.customer_user_id,
              name: row.customer_name,
              email: row.customer_account_email,
            }
          : null,
        template: row.template_id
          ? {
              id: row.template_id,
              name: row.template_name,
              template_key: row.template_key,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error('getAffiliateEmailLeads error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch email leads.',
      error: error.message,
    });
  }
}

async function getAdminEmailLeadStats(req, res) {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({
        ok: false,
        message: 'Only admin can view lead stats.',
      });
    }

    const [[totalsRow]] = await pool.query(
      `
      SELECT
        COUNT(*) AS total_leads,
        COUNT(DISTINCT affiliate_id) AS total_affiliates_with_leads,
        COUNT(DISTINCT website_id) AS total_websites_with_leads
      FROM storefront_email_leads
      `
    );

    const [byAffiliate] = await pool.query(
      `
      SELECT
        sel.affiliate_id,
        u.name AS affiliate_name,
        u.email AS affiliate_email,
        COUNT(*) AS total_leads
      FROM storefront_email_leads sel
      LEFT JOIN users u
        ON u.id = sel.affiliate_id
      GROUP BY sel.affiliate_id, u.name, u.email
      ORDER BY total_leads DESC, sel.affiliate_id DESC
      `
    );

    return res.status(200).json({
      ok: true,
      totals: {
        total_leads: Number(totalsRow?.total_leads || 0),
        total_affiliates_with_leads: Number(totalsRow?.total_affiliates_with_leads || 0),
        total_websites_with_leads: Number(totalsRow?.total_websites_with_leads || 0),
      },
      by_affiliate: byAffiliate.map((row) => ({
        affiliate_id: row.affiliate_id,
        affiliate_name: row.affiliate_name,
        affiliate_email: row.affiliate_email,
        total_leads: Number(row.total_leads || 0),
      })),
    });
  } catch (error) {
    console.error('getAdminEmailLeadStats error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch lead stats.',
      error: error.message,
    });
  }
}

module.exports = {
  createEmailPopupTemplate,
  updateEmailPopupTemplate,
  getAdminEmailPopupTemplates,
  getPublicEmailPopupTemplates,
  getAffiliateEmailListSettings,
  saveAffiliateEmailListSettings,
  getPublicWebsiteEmailPopup,
  captureStorefrontEmailLead,
  getAffiliateEmailLeads,
  getAdminEmailLeadStats,
};