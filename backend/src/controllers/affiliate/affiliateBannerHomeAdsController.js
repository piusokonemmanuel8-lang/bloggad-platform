const pool = require('../../config/db');
const { assertAndLogSupgadUrl } = require('../../services/linkValidationService');

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
    website_id: row.website_id,

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

function sanitizeSettings(row) {
  if (!row) {
    return {
      minimum_budget: 200,
      minimum_daily_cap: 20,
      cost_per_view: 0.05,
      cost_per_click: 1,
      ad_insert_position: 5,
      allow_image: true,
      allow_video: true,
      video_autoplay: true,
      approval_required: true,
      status: 'active',
    };
  }

  return {
    minimum_budget: Number(row.minimum_budget || 200),
    minimum_daily_cap: Number(row.minimum_daily_cap || 20),
    cost_per_view: Number(row.cost_per_view || 0.05),
    cost_per_click: Number(row.cost_per_click || 1),
    ad_insert_position: Number(row.ad_insert_position || 5),
    max_admin_slides: Number(row.max_admin_slides || 4),
    max_active_ads: Number(row.max_active_ads || 1),
    allow_image: Number(row.allow_image || 0) === 1,
    allow_video: Number(row.allow_video || 0) === 1,
    video_autoplay: Number(row.video_autoplay || 0) === 1,
    approval_required: Number(row.approval_required || 0) === 1,
    status: row.status || 'active',
  };
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

async function getSettings() {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM banner_home_ads_settings
    WHERE setting_key = 'default'
    LIMIT 1
    `
  );

  return sanitizeSettings(rows[0]);
}

async function getCampaignById(campaignId, affiliateId) {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM banner_home_ads_campaigns
    WHERE id = ?
      AND affiliate_id = ?
      AND owner_type = 'affiliate'
    LIMIT 1
    `,
    [campaignId, affiliateId]
  );

  return rows[0] || null;
}

async function getMyBannerHomeAds(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM banner_home_ads_campaigns
      WHERE affiliate_id = ?
        AND owner_type = 'affiliate'
      ORDER BY id DESC
      `,
      [req.user.id]
    );

    const settings = await getSettings();

    return res.status(200).json({
      ok: true,
      settings,
      campaigns: rows.map(sanitizeCampaign),
    });
  } catch (error) {
    console.error('getMyBannerHomeAds error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch homepage slider ads',
      error: error.message,
    });
  }
}

async function getMyBannerHomeAdById(req, res) {
  try {
    const campaignId = Number(req.params.id);

    if (!Number.isInteger(campaignId) || campaignId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid campaign id',
      });
    }

    const campaign = await getCampaignById(campaignId, req.user.id);

    if (!campaign) {
      return res.status(404).json({
        ok: false,
        message: 'Homepage slider ad not found',
      });
    }

    const settings = await getSettings();

    return res.status(200).json({
      ok: true,
      settings,
      campaign: sanitizeCampaign(campaign),
    });
  } catch (error) {
    console.error('getMyBannerHomeAdById error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch homepage slider ad',
      error: error.message,
    });
  }
}

async function validateDestinationUrl({ value, userId, websiteId, campaignId = null }) {
  const validated = await assertAndLogSupgadUrl({
    value,
    fieldName: 'Homepage slider ad CTA URL',
    required: true,
    allowEmpty: false,
    userId,
    websiteId,
    sourceType: 'banner_home_ad',
    sourceId: campaignId,
  });

  return validated.submitted_link;
}

function validateMediaAndText(body, settings) {
  const mediaType = ['image', 'video'].includes(body.media_type) ? body.media_type : 'image';

  if (mediaType === 'image' && !settings.allow_image) {
    return {
      ok: false,
      message: 'Image homepage slider ads are disabled by admin',
    };
  }

  if (mediaType === 'video' && !settings.allow_video) {
    return {
      ok: false,
      message: 'Video homepage slider ads are disabled by admin',
    };
  }

  if (mediaType === 'image' && !cleanText(body.image_url)) {
    return {
      ok: false,
      message: 'Image URL is required for image slider ad',
    };
  }

  if (mediaType === 'video' && !cleanText(body.video_url)) {
    return {
      ok: false,
      message: 'Video URL is required for video slider ad',
    };
  }

  if (!cleanText(body.campaign_title)) {
    return {
      ok: false,
      message: 'Campaign title is required',
    };
  }

  if (!cleanText(body.title)) {
    return {
      ok: false,
      message: 'Slider headline is required',
    };
  }

  if (!cleanText(body.cta_label)) {
    return {
      ok: false,
      message: 'CTA label is required',
    };
  }

  if (!cleanText(body.cta_url)) {
    return {
      ok: false,
      message: 'CTA URL is required',
    };
  }

  return {
    ok: true,
    mediaType,
  };
}

async function createBannerHomeAd(req, res) {
  try {
    const website = await getAffiliateWebsite(req.user.id);

    if (!website) {
      return res.status(400).json({
        ok: false,
        message: 'Create your affiliate website before creating homepage slider ads',
      });
    }

    const settings = await getSettings();

    if (settings.status !== 'active') {
      return res.status(400).json({
        ok: false,
        message: 'Homepage slider ads are currently disabled',
      });
    }

    const validation = validateMediaAndText(req.body, settings);

    if (!validation.ok) {
      return res.status(400).json({
        ok: false,
        message: validation.message,
      });
    }

    const totalBudget = toMoney(req.body.total_budget, 0);
    const dailyBudgetCap =
      req.body.daily_budget_cap === null ||
      req.body.daily_budget_cap === undefined ||
      req.body.daily_budget_cap === ''
        ? null
        : toMoney(req.body.daily_budget_cap, 0);

    if (totalBudget < settings.minimum_budget) {
      return res.status(400).json({
        ok: false,
        message: `Minimum homepage slider ad budget is ${settings.currency || 'USD'} ${settings.minimum_budget}`,
      });
    }

    if (dailyBudgetCap !== null && dailyBudgetCap < settings.minimum_daily_cap) {
      return res.status(400).json({
        ok: false,
        message: `Minimum daily cap is ${settings.minimum_daily_cap}`,
      });
    }

    const cleanCtaUrl = await validateDestinationUrl({
      value: req.body.cta_url,
      userId: req.user.id,
      websiteId: website.id,
      campaignId: null,
    });

    let cleanSecondaryCtaUrl = null;

    if (cleanText(req.body.secondary_cta_url)) {
      const validated = await assertAndLogSupgadUrl({
        value: req.body.secondary_cta_url,
        fieldName: 'Homepage slider ad secondary CTA URL',
        required: false,
        allowEmpty: true,
        userId: req.user.id,
        websiteId: website.id,
        sourceType: 'banner_home_ad_secondary',
        sourceId: null,
      });

      cleanSecondaryCtaUrl = validated.submitted_link;
    }

    const approvalStatus = settings.approval_required ? 'pending' : 'approved';
    const status = settings.approval_required ? 'pending' : 'active';

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
          last_funded_at,
          created_at,
          updated_at
        )
      VALUES
        (
          'affiliate',
          ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          'USD',
          ?, ?, ?,
          ?, ?,
          ?, ?,
          ?, ?,
          'paid',
          NOW(),
          NOW(),
          NOW()
        )
      `,
      [
        req.user.id,
        website.id,
        req.user.id,
        cleanText(req.body.campaign_title),
        normalizeNullable(req.body.campaign_description),
        normalizeNullable(req.body.internal_note),
        validation.mediaType,
        normalizeNullable(req.body.image_url),
        normalizeNullable(req.body.video_url),
        normalizeNullable(req.body.poster_url),
        normalizeNullable(req.body.eyebrow_text),
        cleanText(req.body.title),
        normalizeNullable(req.body.subtitle),
        normalizeNullable(req.body.promo_text),
        cleanText(req.body.cta_label),
        cleanCtaUrl,
        normalizeNullable(req.body.secondary_cta_label),
        cleanSecondaryCtaUrl,
        totalBudget,
        totalBudget,
        dailyBudgetCap,
        settings.cost_per_view,
        settings.cost_per_click,
        normalizeNullable(req.body.start_date),
        normalizeNullable(req.body.end_date),
        status,
        approvalStatus,
      ]
    );

    await pool.query(
      `
      INSERT INTO banner_home_ads_funding_logs
        (
          campaign_id,
          affiliate_id,
          created_by,
          amount,
          currency,
          balance_before,
          balance_after,
          funding_type,
          payment_reference,
          note,
          created_at
        )
      VALUES
        (?, ?, ?, ?, 'USD', 0.0000, ?, 'initial', ?, ?, NOW())
      `,
      [
        result.insertId,
        req.user.id,
        req.user.id,
        totalBudget,
        totalBudget,
        normalizeNullable(req.body.payment_reference),
        'Initial homepage slider ad funding',
      ]
    );

    const campaign = await getCampaignById(result.insertId, req.user.id);

    return res.status(201).json({
      ok: true,
      message: settings.approval_required
        ? 'Homepage slider ad submitted for admin approval'
        : 'Homepage slider ad created successfully',
      settings,
      campaign: sanitizeCampaign(campaign),
    });
  } catch (error) {
    console.error('createBannerHomeAd error:', error);

    return res.status(error.status || 500).json({
      ok: false,
      message: error.message || 'Failed to create homepage slider ad',
      error: error.status ? undefined : error.message,
    });
  }
}

async function updateBannerHomeAd(req, res) {
  try {
    const campaignId = Number(req.params.id);

    if (!Number.isInteger(campaignId) || campaignId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid campaign id',
      });
    }

    const existing = await getCampaignById(campaignId, req.user.id);

    if (!existing) {
      return res.status(404).json({
        ok: false,
        message: 'Homepage slider ad not found',
      });
    }

    if (['active', 'ended', 'exhausted'].includes(existing.status)) {
      return res.status(400).json({
        ok: false,
        message: 'Active, ended, or exhausted homepage slider ads cannot be edited. Pause or create a new one.',
      });
    }

    const settings = await getSettings();

    const merged = {
      ...existing,
      ...req.body,
    };

    const validation = validateMediaAndText(merged, settings);

    if (!validation.ok) {
      return res.status(400).json({
        ok: false,
        message: validation.message,
      });
    }

    const cleanCtaUrl =
      req.body.cta_url !== undefined
        ? await validateDestinationUrl({
            value: req.body.cta_url,
            userId: req.user.id,
            websiteId: existing.website_id,
            campaignId,
          })
        : existing.cta_url;

    let cleanSecondaryCtaUrl = existing.secondary_cta_url;

    if (req.body.secondary_cta_url !== undefined) {
      if (cleanText(req.body.secondary_cta_url)) {
        const validated = await assertAndLogSupgadUrl({
          value: req.body.secondary_cta_url,
          fieldName: 'Homepage slider ad secondary CTA URL',
          required: false,
          allowEmpty: true,
          userId: req.user.id,
          websiteId: existing.website_id,
          sourceType: 'banner_home_ad_secondary',
          sourceId: campaignId,
        });

        cleanSecondaryCtaUrl = validated.submitted_link;
      } else {
        cleanSecondaryCtaUrl = null;
      }
    }

    const cleanStatus = settings.approval_required ? 'pending' : 'active';
    const cleanApprovalStatus = settings.approval_required ? 'pending' : 'approved';

    await pool.query(
      `
      UPDATE banner_home_ads_campaigns
      SET
        campaign_title = ?,
        campaign_description = ?,
        internal_note = ?,
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
        start_date = ?,
        end_date = ?,
        status = ?,
        approval_status = ?,
        admin_note = NULL,
        rejection_reason = NULL,
        rejected_at = NULL,
        updated_at = NOW()
      WHERE id = ?
        AND affiliate_id = ?
        AND owner_type = 'affiliate'
      `,
      [
        cleanText(merged.campaign_title),
        normalizeNullable(merged.campaign_description),
        normalizeNullable(merged.internal_note),
        validation.mediaType,
        normalizeNullable(merged.image_url),
        normalizeNullable(merged.video_url),
        normalizeNullable(merged.poster_url),
        normalizeNullable(merged.eyebrow_text),
        cleanText(merged.title),
        normalizeNullable(merged.subtitle),
        normalizeNullable(merged.promo_text),
        cleanText(merged.cta_label),
        cleanCtaUrl,
        normalizeNullable(merged.secondary_cta_label),
        cleanSecondaryCtaUrl,
        normalizeNullable(merged.start_date),
        normalizeNullable(merged.end_date),
        cleanStatus,
        cleanApprovalStatus,
        campaignId,
        req.user.id,
      ]
    );

    const campaign = await getCampaignById(campaignId, req.user.id);

    return res.status(200).json({
      ok: true,
      message: settings.approval_required
        ? 'Homepage slider ad updated and resubmitted for approval'
        : 'Homepage slider ad updated successfully',
      settings,
      campaign: sanitizeCampaign(campaign),
    });
  } catch (error) {
    console.error('updateBannerHomeAd error:', error);

    return res.status(error.status || 500).json({
      ok: false,
      message: error.message || 'Failed to update homepage slider ad',
      error: error.status ? undefined : error.message,
    });
  }
}

async function updateBannerHomeAdStatus(req, res) {
  try {
    const campaignId = Number(req.params.id);
    const action = cleanText(req.body.action);

    if (!Number.isInteger(campaignId) || campaignId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid campaign id',
      });
    }

    if (!['pause', 'resume'].includes(action)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid action',
      });
    }

    const campaign = await getCampaignById(campaignId, req.user.id);

    if (!campaign) {
      return res.status(404).json({
        ok: false,
        message: 'Homepage slider ad not found',
      });
    }

    if (action === 'pause') {
      if (!['active', 'daily_paused'].includes(campaign.status)) {
        return res.status(400).json({
          ok: false,
          message: 'Only active homepage slider ads can be paused',
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
          AND affiliate_id = ?
          AND owner_type = 'affiliate'
        `,
        [campaignId, req.user.id]
      );
    }

    if (action === 'resume') {
      if (campaign.status !== 'paused') {
        return res.status(400).json({
          ok: false,
          message: 'Only paused homepage slider ads can be resumed',
        });
      }

      if (campaign.approval_status !== 'approved') {
        return res.status(400).json({
          ok: false,
          message: 'Only approved homepage slider ads can be resumed',
        });
      }

      if (Number(campaign.remaining_budget || 0) <= 0) {
        return res.status(400).json({
          ok: false,
          message: 'Top up this homepage slider ad before resuming',
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
          AND affiliate_id = ?
          AND owner_type = 'affiliate'
        `,
        [campaignId, req.user.id]
      );
    }

    const updated = await getCampaignById(campaignId, req.user.id);

    return res.status(200).json({
      ok: true,
      message: action === 'pause' ? 'Homepage slider ad paused' : 'Homepage slider ad resumed',
      campaign: sanitizeCampaign(updated),
    });
  } catch (error) {
    console.error('updateBannerHomeAdStatus error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update homepage slider ad status',
      error: error.message,
    });
  }
}

async function topUpBannerHomeAd(req, res) {
  try {
    const campaignId = Number(req.params.id);
    const amount = toMoney(req.body.amount, 0);

    if (!Number.isInteger(campaignId) || campaignId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid campaign id',
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Top-up amount is required',
      });
    }

    const campaign = await getCampaignById(campaignId, req.user.id);

    if (!campaign) {
      return res.status(404).json({
        ok: false,
        message: 'Homepage slider ad not found',
      });
    }

    const balanceBefore = Number(campaign.remaining_budget || 0);
    const balanceAfter = Number((balanceBefore + amount).toFixed(4));

    await pool.query(
      `
      UPDATE banner_home_ads_campaigns
      SET
        total_budget = total_budget + ?,
        remaining_budget = remaining_budget + ?,
        status = CASE
          WHEN status = 'exhausted' AND approval_status = 'approved' THEN 'active'
          ELSE status
        END,
        exhausted_at = CASE
          WHEN status = 'exhausted' THEN NULL
          ELSE exhausted_at
        END,
        last_funded_at = NOW(),
        updated_at = NOW()
      WHERE id = ?
        AND affiliate_id = ?
        AND owner_type = 'affiliate'
      `,
      [amount, amount, campaignId, req.user.id]
    );

    await pool.query(
      `
      INSERT INTO banner_home_ads_funding_logs
        (
          campaign_id,
          affiliate_id,
          created_by,
          amount,
          currency,
          balance_before,
          balance_after,
          funding_type,
          payment_reference,
          note,
          created_at
        )
      VALUES
        (?, ?, ?, ?, 'USD', ?, ?, 'topup', ?, ?, NOW())
      `,
      [
        campaignId,
        req.user.id,
        req.user.id,
        amount,
        balanceBefore,
        balanceAfter,
        normalizeNullable(req.body.payment_reference),
        normalizeNullable(req.body.note) || 'Homepage slider ad top-up',
      ]
    );

    const updated = await getCampaignById(campaignId, req.user.id);

    return res.status(200).json({
      ok: true,
      message: 'Homepage slider ad topped up successfully',
      campaign: sanitizeCampaign(updated),
    });
  } catch (error) {
    console.error('topUpBannerHomeAd error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to top up homepage slider ad',
      error: error.message,
    });
  }
}

async function deleteBannerHomeAd(req, res) {
  try {
    const campaignId = Number(req.params.id);

    if (!Number.isInteger(campaignId) || campaignId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid campaign id',
      });
    }

    const campaign = await getCampaignById(campaignId, req.user.id);

    if (!campaign) {
      return res.status(404).json({
        ok: false,
        message: 'Homepage slider ad not found',
      });
    }

    if (['active', 'daily_paused'].includes(campaign.status)) {
      return res.status(400).json({
        ok: false,
        message: 'Active homepage slider ads cannot be deleted. Pause it first.',
      });
    }

    await pool.query(
      `
      DELETE FROM banner_home_ads_campaigns
      WHERE id = ?
        AND affiliate_id = ?
        AND owner_type = 'affiliate'
      `,
      [campaignId, req.user.id]
    );

    return res.status(200).json({
      ok: true,
      message: 'Homepage slider ad deleted successfully',
    });
  } catch (error) {
    console.error('deleteBannerHomeAd error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to delete homepage slider ad',
      error: error.message,
    });
  }
}

module.exports = {
  getMyBannerHomeAds,
  getMyBannerHomeAdById,
  createBannerHomeAd,
  updateBannerHomeAd,
  updateBannerHomeAdStatus,
  topUpBannerHomeAd,
  deleteBannerHomeAd,
};