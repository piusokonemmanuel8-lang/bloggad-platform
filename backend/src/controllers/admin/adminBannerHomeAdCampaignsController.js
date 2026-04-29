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

function sanitizeCampaign(row) {
  if (!row) return null;

  return {
    id: row.id,
    owner_type: row.owner_type,
    affiliate_id: row.affiliate_id,
    affiliate_name: row.affiliate_name || null,
    affiliate_email: row.affiliate_email || null,
    website_id: row.website_id,
    website_name: row.website_name || null,
    website_slug: row.website_slug || null,
    created_by: row.created_by,

    campaign_title: row.campaign_title,
    campaign_description: row.campaign_description,
    internal_note: row.internal_note,

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

    currency: row.currency,
    total_budget: Number(row.total_budget || 0),
    remaining_budget: Number(row.remaining_budget || 0),
    daily_budget_cap:
      row.daily_budget_cap !== null && row.daily_budget_cap !== undefined
        ? Number(row.daily_budget_cap || 0)
        : null,

    today_spent: Number(row.today_spent || 0),
    today_spent_date: row.today_spent_date,

    cost_per_view: Number(row.cost_per_view || 0),
    cost_per_click: Number(row.cost_per_click || 0),

    total_views: Number(row.total_views || 0),
    total_clicks: Number(row.total_clicks || 0),
    total_spent: Number(row.total_spent || 0),

    start_date: row.start_date,
    end_date: row.end_date,

    status: row.status,
    approval_status: row.approval_status,
    payment_status: row.payment_status,

    admin_note: row.admin_note,
    rejection_reason: row.rejection_reason,

    approved_by: row.approved_by,
    approved_at: row.approved_at,
    rejected_at: row.rejected_at,
    paused_at: row.paused_at,
    exhausted_at: row.exhausted_at,
    ended_at: row.ended_at,
    last_funded_at: row.last_funded_at,

    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function getAdminBannerHomeAdCampaigns(req, res) {
  try {
    const status = cleanText(req.query.status);
    const approvalStatus = cleanText(req.query.approval_status);
    const ownerType = cleanText(req.query.owner_type);
    const search = cleanText(req.query.search);
    const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 200);

    const where = [];
    const params = [];

    if (status) {
      where.push('c.status = ?');
      params.push(status);
    }

    if (approvalStatus) {
      where.push('c.approval_status = ?');
      params.push(approvalStatus);
    }

    if (ownerType) {
      where.push('c.owner_type = ?');
      params.push(ownerType);
    }

    if (search) {
      where.push(
        `(
          c.campaign_title LIKE ?
          OR c.title LIKE ?
          OR c.cta_url LIKE ?
          OR u.name LIKE ?
          OR u.email LIKE ?
          OR aw.website_name LIKE ?
        )`
      );

      const keyword = `%${search}%`;

      params.push(keyword, keyword, keyword, keyword, keyword, keyword);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `
      SELECT
        c.*,
        u.name AS affiliate_name,
        u.email AS affiliate_email,
        aw.website_name,
        aw.slug AS website_slug
      FROM banner_home_ads_campaigns c
      LEFT JOIN users u
        ON u.id = c.affiliate_id
      LEFT JOIN affiliate_websites aw
        ON aw.id = c.website_id
      ${whereSql}
      ORDER BY c.id DESC
      LIMIT ?
      `,
      [...params, limit]
    );

    return res.status(200).json({
      ok: true,
      campaigns: rows.map(sanitizeCampaign),
    });
  } catch (error) {
    console.error('getAdminBannerHomeAdCampaigns error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch banner home ad campaigns',
      error: error.message,
    });
  }
}

async function getAdminBannerHomeAdCampaignById(req, res) {
  try {
    const campaignId = Number(req.params.id);

    if (!Number.isInteger(campaignId) || campaignId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid campaign id',
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
        c.*,
        u.name AS affiliate_name,
        u.email AS affiliate_email,
        aw.website_name,
        aw.slug AS website_slug
      FROM banner_home_ads_campaigns c
      LEFT JOIN users u
        ON u.id = c.affiliate_id
      LEFT JOIN affiliate_websites aw
        ON aw.id = c.website_id
      WHERE c.id = ?
      LIMIT 1
      `,
      [campaignId]
    );

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Banner home ad campaign not found',
      });
    }

    return res.status(200).json({
      ok: true,
      campaign: sanitizeCampaign(rows[0]),
    });
  } catch (error) {
    console.error('getAdminBannerHomeAdCampaignById error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch banner home ad campaign',
      error: error.message,
    });
  }
}

async function approveBannerHomeAdCampaign(req, res) {
  try {
    const campaignId = Number(req.params.id);
    const adminNote = normalizeNullable(req.body.admin_note);

    if (!Number.isInteger(campaignId) || campaignId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid campaign id',
      });
    }

    const [rows] = await pool.query(
      `
      SELECT *
      FROM banner_home_ads_campaigns
      WHERE id = ?
      LIMIT 1
      `,
      [campaignId]
    );

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Banner home ad campaign not found',
      });
    }

    const campaign = rows[0];

    if (Number(campaign.remaining_budget || 0) <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Campaign cannot be approved because it has no remaining budget',
      });
    }

    await pool.query(
      `
      UPDATE banner_home_ads_campaigns
      SET
        approval_status = 'approved',
        status = CASE
          WHEN payment_status = 'paid'
            AND remaining_budget > 0
          THEN 'active'
          ELSE 'pending'
        END,
        admin_note = ?,
        rejection_reason = NULL,
        approved_by = ?,
        approved_at = NOW(),
        rejected_at = NULL,
        updated_at = NOW()
      WHERE id = ?
      `,
      [adminNote, req.user?.id || null, campaignId]
    );

    const [updatedRows] = await pool.query(
      `
      SELECT
        c.*,
        u.name AS affiliate_name,
        u.email AS affiliate_email,
        aw.website_name,
        aw.slug AS website_slug
      FROM banner_home_ads_campaigns c
      LEFT JOIN users u
        ON u.id = c.affiliate_id
      LEFT JOIN affiliate_websites aw
        ON aw.id = c.website_id
      WHERE c.id = ?
      LIMIT 1
      `,
      [campaignId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Banner home ad campaign approved successfully',
      campaign: sanitizeCampaign(updatedRows[0]),
    });
  } catch (error) {
    console.error('approveBannerHomeAdCampaign error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to approve banner home ad campaign',
      error: error.message,
    });
  }
}

async function rejectBannerHomeAdCampaign(req, res) {
  try {
    const campaignId = Number(req.params.id);
    const rejectionReason = cleanText(req.body.rejection_reason);
    const adminNote = normalizeNullable(req.body.admin_note);

    if (!Number.isInteger(campaignId) || campaignId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid campaign id',
      });
    }

    if (!rejectionReason) {
      return res.status(400).json({
        ok: false,
        message: 'Rejection reason is required',
      });
    }

    await pool.query(
      `
      UPDATE banner_home_ads_campaigns
      SET
        approval_status = 'rejected',
        status = 'rejected',
        rejection_reason = ?,
        admin_note = ?,
        rejected_at = NOW(),
        approved_by = NULL,
        approved_at = NULL,
        updated_at = NOW()
      WHERE id = ?
      `,
      [rejectionReason, adminNote, campaignId]
    );

    const [updatedRows] = await pool.query(
      `
      SELECT
        c.*,
        u.name AS affiliate_name,
        u.email AS affiliate_email,
        aw.website_name,
        aw.slug AS website_slug
      FROM banner_home_ads_campaigns c
      LEFT JOIN users u
        ON u.id = c.affiliate_id
      LEFT JOIN affiliate_websites aw
        ON aw.id = c.website_id
      WHERE c.id = ?
      LIMIT 1
      `,
      [campaignId]
    );

    if (!updatedRows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Banner home ad campaign not found',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Banner home ad campaign rejected successfully',
      campaign: sanitizeCampaign(updatedRows[0]),
    });
  } catch (error) {
    console.error('rejectBannerHomeAdCampaign error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to reject banner home ad campaign',
      error: error.message,
    });
  }
}

async function pauseBannerHomeAdCampaign(req, res) {
  try {
    const campaignId = Number(req.params.id);

    if (!Number.isInteger(campaignId) || campaignId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid campaign id',
      });
    }

    await pool.query(
      `
      UPDATE banner_home_ads_campaigns
      SET
        status = 'paused',
        paused_at = NOW(),
        updated_at = NOW()
      WHERE id = ?
        AND status IN ('active', 'daily_paused')
      `,
      [campaignId]
    );

    const [rows] = await pool.query(
      `
      SELECT
        c.*,
        u.name AS affiliate_name,
        u.email AS affiliate_email,
        aw.website_name,
        aw.slug AS website_slug
      FROM banner_home_ads_campaigns c
      LEFT JOIN users u
        ON u.id = c.affiliate_id
      LEFT JOIN affiliate_websites aw
        ON aw.id = c.website_id
      WHERE c.id = ?
      LIMIT 1
      `,
      [campaignId]
    );

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Banner home ad campaign not found',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Banner home ad campaign paused successfully',
      campaign: sanitizeCampaign(rows[0]),
    });
  } catch (error) {
    console.error('pauseBannerHomeAdCampaign error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to pause banner home ad campaign',
      error: error.message,
    });
  }
}

async function resumeBannerHomeAdCampaign(req, res) {
  try {
    const campaignId = Number(req.params.id);

    if (!Number.isInteger(campaignId) || campaignId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid campaign id',
      });
    }

    const [rows] = await pool.query(
      `
      SELECT *
      FROM banner_home_ads_campaigns
      WHERE id = ?
      LIMIT 1
      `,
      [campaignId]
    );

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Banner home ad campaign not found',
      });
    }

    const campaign = rows[0];

    if (campaign.approval_status !== 'approved') {
      return res.status(400).json({
        ok: false,
        message: 'Only approved campaigns can be resumed',
      });
    }

    if (Number(campaign.remaining_budget || 0) <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Campaign has no remaining budget',
      });
    }

    await pool.query(
      `
      UPDATE banner_home_ads_campaigns
      SET
        status = 'active',
        paused_at = NULL,
        updated_at = NOW()
      WHERE id = ?
      `,
      [campaignId]
    );

    const [updatedRows] = await pool.query(
      `
      SELECT
        c.*,
        u.name AS affiliate_name,
        u.email AS affiliate_email,
        aw.website_name,
        aw.slug AS website_slug
      FROM banner_home_ads_campaigns c
      LEFT JOIN users u
        ON u.id = c.affiliate_id
      LEFT JOIN affiliate_websites aw
        ON aw.id = c.website_id
      WHERE c.id = ?
      LIMIT 1
      `,
      [campaignId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Banner home ad campaign resumed successfully',
      campaign: sanitizeCampaign(updatedRows[0]),
    });
  } catch (error) {
    console.error('resumeBannerHomeAdCampaign error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to resume banner home ad campaign',
      error: error.message,
    });
  }
}

async function createAdminOwnedBannerHomeAd(req, res) {
  try {
    const mediaType = ['image', 'video'].includes(req.body.media_type) ? req.body.media_type : 'image';
    const title = cleanText(req.body.title);
    const campaignTitle = cleanText(req.body.campaign_title);
    const ctaLabel = cleanText(req.body.cta_label) || 'Shop Now';
    const ctaUrl = cleanText(req.body.cta_url);

    if (!campaignTitle) {
      return res.status(400).json({
        ok: false,
        message: 'Campaign title is required',
      });
    }

    if (!title) {
      return res.status(400).json({
        ok: false,
        message: 'Slider title is required',
      });
    }

    if (!ctaUrl) {
      return res.status(400).json({
        ok: false,
        message: 'CTA URL is required',
      });
    }

    if (mediaType === 'image' && !cleanText(req.body.image_url)) {
      return res.status(400).json({
        ok: false,
        message: 'Image URL is required',
      });
    }

    if (mediaType === 'video' && !cleanText(req.body.video_url)) {
      return res.status(400).json({
        ok: false,
        message: 'Video URL is required',
      });
    }

    const totalBudget = toMoney(req.body.total_budget, 999999);
    const costPerView = toMoney(req.body.cost_per_view, 0);
    const costPerClick = toMoney(req.body.cost_per_click, 0);

    const [result] = await pool.query(
      `
      INSERT INTO banner_home_ads_campaigns
        (
          owner_type,
          affiliate_id,
          website_id,
          created_by,
          campaign_title,
          campaign_description,
          internal_note,
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
          currency,
          total_budget,
          remaining_budget,
          daily_budget_cap,
          cost_per_view,
          cost_per_click,
          start_date,
          end_date,
          status,
          approval_status,
          payment_status,
          approved_by,
          approved_at,
          last_funded_at,
          created_at,
          updated_at
        )
      VALUES
        (
          'admin',
          NULL,
          NULL,
          ?,
          ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          'USD',
          ?, ?, ?,
          ?, ?,
          ?, ?,
          'active',
          'approved',
          'paid',
          ?,
          NOW(),
          NOW(),
          NOW(),
          NOW()
        )
      `,
      [
        req.user?.id || null,
        campaignTitle,
        normalizeNullable(req.body.campaign_description),
        normalizeNullable(req.body.internal_note),
        mediaType,
        normalizeNullable(req.body.image_url),
        normalizeNullable(req.body.video_url),
        normalizeNullable(req.body.poster_url),
        normalizeNullable(req.body.eyebrow_text),
        title,
        normalizeNullable(req.body.subtitle),
        normalizeNullable(req.body.promo_text),
        ctaLabel,
        ctaUrl,
        normalizeNullable(req.body.secondary_cta_label),
        normalizeNullable(req.body.secondary_cta_url),
        totalBudget,
        totalBudget,
        req.body.daily_budget_cap === '' || req.body.daily_budget_cap === undefined
          ? null
          : toMoney(req.body.daily_budget_cap, 0),
        costPerView,
        costPerClick,
        normalizeNullable(req.body.start_date),
        normalizeNullable(req.body.end_date),
        req.user?.id || null,
      ]
    );

    const [rows] = await pool.query(
      `
      SELECT *
      FROM banner_home_ads_campaigns
      WHERE id = ?
      LIMIT 1
      `,
      [result.insertId]
    );

    return res.status(201).json({
      ok: true,
      message: 'Admin banner home ad created successfully',
      campaign: sanitizeCampaign(rows[0]),
    });
  } catch (error) {
    console.error('createAdminOwnedBannerHomeAd error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to create admin banner home ad',
      error: error.message,
    });
  }
}

module.exports = {
  getAdminBannerHomeAdCampaigns,
  getAdminBannerHomeAdCampaignById,
  approveBannerHomeAdCampaign,
  rejectBannerHomeAdCampaign,
  pauseBannerHomeAdCampaign,
  resumeBannerHomeAdCampaign,
  createAdminOwnedBannerHomeAd,
};