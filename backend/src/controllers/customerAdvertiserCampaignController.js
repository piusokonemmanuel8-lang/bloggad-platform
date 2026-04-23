const pool = require('../config/db');

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function cleanText(value, max = 255) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  if (!text) return null;
  return text.slice(0, max);
}

function cleanLongText(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
}

function cleanDecimal(value, fallback = 0) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return num;
}

function cleanEnum(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function makeCampaignSlug(name) {
  const base = String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  const suffix = Date.now();
  return `${base || 'campaign'}-${suffix}`;
}

async function getAdvertiserProfileAndWalletByUserId(userId) {
  const [profileRows] = await pool.query(
    `
      SELECT *
      FROM customer_advertiser_profiles
      WHERE user_id = ?
      LIMIT 1
    `,
    [userId]
  );

  const profile = profileRows[0] || null;

  if (!profile) {
    throw new Error('Advertiser profile not found.');
  }

  const [walletRows] = await pool.query(
    `
      SELECT *
      FROM advertiser_wallets
      WHERE advertiser_profile_id = ?
      LIMIT 1
    `,
    [profile.id]
  );

  const wallet = walletRows[0] || null;

  if (!wallet) {
    throw new Error('Advertiser wallet not found.');
  }

  return { profile, wallet };
}

async function getCustomerAdvertiserCampaigns(req, res) {
  try {
    const userId = toNumber(req.user?.id);

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Unauthorized.',
      });
    }

    const { profile, wallet } = await getAdvertiserProfileAndWalletByUserId(userId);

    const [campaigns] = await pool.query(
      `
        SELECT
          id,
          advertiser_profile_id,
          advertiser_wallet_id,
          campaign_name,
          campaign_slug,
          campaign_type,
          buying_model,
          objective,
          destination_url,
          display_url,
          headline,
          description_text,
          call_to_action,
          budget_total,
          budget_daily,
          bid_amount,
          spent_amount,
          impressions_count,
          clicks_count,
          conversion_count,
          start_at,
          end_at,
          approval_status,
          delivery_status,
          rejection_reason,
          approved_by_user_id,
          approved_at,
          created_at,
          updated_at
        FROM advertiser_campaigns
        WHERE advertiser_profile_id = ?
        ORDER BY id DESC
      `,
      [profile.id]
    );

    return res.status(200).json({
      ok: true,
      advertiser_profile: profile,
      wallet,
      campaigns,
    });
  } catch (error) {
    console.error('getCustomerAdvertiserCampaigns error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch advertiser campaigns.',
      error: error.message,
    });
  }
}

async function getCustomerAdvertiserCampaignById(req, res) {
  try {
    const userId = toNumber(req.user?.id);
    const campaignId = toNumber(req.params?.campaignId);

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Unauthorized.',
      });
    }

    if (!campaignId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid campaignId is required.',
      });
    }

    const { profile, wallet } = await getAdvertiserProfileAndWalletByUserId(userId);

    const [campaignRows] = await pool.query(
      `
        SELECT *
        FROM advertiser_campaigns
        WHERE id = ? AND advertiser_profile_id = ?
        LIMIT 1
      `,
      [campaignId, profile.id]
    );

    const campaign = campaignRows[0] || null;

    if (!campaign) {
      return res.status(404).json({
        ok: false,
        message: 'Campaign not found.',
      });
    }

    const [placements] = await pool.query(
      `
        SELECT
          id,
          campaign_id,
          placement_key,
          page_type,
          target_mode,
          category_id,
          website_id,
          affiliate_user_id,
          post_id,
          priority_score,
          is_active,
          created_at,
          updated_at
        FROM advertiser_campaign_placements
        WHERE campaign_id = ?
        ORDER BY id DESC
      `,
      [campaign.id]
    );

    const [creatives] = await pool.query(
      `
        SELECT
          id,
          campaign_id,
          creative_type,
          asset_url,
          thumbnail_url,
          headline,
          body_text,
          button_text,
          html_code,
          width_px,
          height_px,
          alt_text,
          is_primary,
          approval_status,
          rejection_reason,
          approved_by_user_id,
          approved_at,
          created_at,
          updated_at
        FROM advertiser_campaign_creatives
        WHERE campaign_id = ?
        ORDER BY is_primary DESC, id DESC
      `,
      [campaign.id]
    );

    return res.status(200).json({
      ok: true,
      advertiser_profile: profile,
      wallet,
      campaign,
      placements,
      creatives,
    });
  } catch (error) {
    console.error('getCustomerAdvertiserCampaignById error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch advertiser campaign.',
      error: error.message,
    });
  }
}

async function createCustomerAdvertiserCampaign(req, res) {
  const connection = await pool.getConnection();

  try {
    const userId = toNumber(req.user?.id);

    if (!userId) {
      connection.release();
      return res.status(401).json({
        ok: false,
        message: 'Unauthorized.',
      });
    }

    const { profile, wallet } = await getAdvertiserProfileAndWalletByUserId(userId);

    const campaignName = cleanText(req.body?.campaign_name);
    const campaignType = cleanEnum(
      req.body?.campaign_type,
      ['banner', 'native', 'text', 'html', 'image'],
      'banner'
    );
    const buyingModel = cleanEnum(
      req.body?.buying_model,
      ['cpc', 'cpm', 'fixed'],
      'cpc'
    );
    const objective = cleanEnum(
      req.body?.objective,
      ['traffic', 'awareness', 'conversion', 'engagement'],
      'traffic'
    );

    const destinationUrl = cleanText(req.body?.destination_url);
    const displayUrl = cleanText(req.body?.display_url);
    const headline = cleanText(req.body?.headline);
    const descriptionText = cleanLongText(req.body?.description_text);
    const callToAction = cleanText(req.body?.call_to_action, 100);

    const budgetTotal = cleanDecimal(req.body?.budget_total, 0);
    const budgetDaily = cleanDecimal(req.body?.budget_daily, 0);
    const bidAmount = cleanDecimal(req.body?.bid_amount, 0);

    const startAt = req.body?.start_at || null;
    const endAt = req.body?.end_at || null;

    const placementKeys = Array.isArray(req.body?.placement_keys)
      ? req.body.placement_keys.map((item) => cleanText(item, 100)).filter(Boolean)
      : [];

    if (!campaignName) {
      connection.release();
      return res.status(400).json({
        ok: false,
        message: 'campaign_name is required.',
      });
    }

    if (!destinationUrl) {
      connection.release();
      return res.status(400).json({
        ok: false,
        message: 'destination_url is required.',
      });
    }

    if (budgetTotal <= 0) {
      connection.release();
      return res.status(400).json({
        ok: false,
        message: 'budget_total must be greater than 0.',
      });
    }

    if (budgetDaily < 0) {
      connection.release();
      return res.status(400).json({
        ok: false,
        message: 'budget_daily cannot be negative.',
      });
    }

    await connection.beginTransaction();

    const campaignSlug = makeCampaignSlug(campaignName);

    const [insertResult] = await connection.query(
      `
        INSERT INTO advertiser_campaigns
        (
          advertiser_profile_id,
          advertiser_wallet_id,
          campaign_name,
          campaign_slug,
          campaign_type,
          buying_model,
          objective,
          destination_url,
          display_url,
          headline,
          description_text,
          call_to_action,
          budget_total,
          budget_daily,
          bid_amount,
          start_at,
          end_at,
          approval_status,
          delivery_status
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', 'not_started')
      `,
      [
        profile.id,
        wallet.id,
        campaignName,
        campaignSlug,
        campaignType,
        buyingModel,
        objective,
        destinationUrl,
        displayUrl,
        headline,
        descriptionText,
        callToAction,
        budgetTotal,
        budgetDaily,
        bidAmount,
        startAt,
        endAt,
      ]
    );

    const campaignId = insertResult.insertId;

    if (placementKeys.length) {
      for (const placementKey of placementKeys) {
        await connection.query(
          `
            INSERT INTO advertiser_campaign_placements
            (
              campaign_id,
              placement_key,
              page_type,
              target_mode,
              priority_score,
              is_active
            )
            VALUES
            (?, ?, 'storefront', 'all', 100, 1)
          `,
          [campaignId, placementKey]
        );
      }
    }

    await connection.commit();

    const [campaignRows] = await pool.query(
      `
        SELECT *
        FROM advertiser_campaigns
        WHERE id = ?
        LIMIT 1
      `,
      [campaignId]
    );

    const [placements] = await pool.query(
      `
        SELECT
          id,
          campaign_id,
          placement_key,
          page_type,
          target_mode,
          category_id,
          website_id,
          affiliate_user_id,
          post_id,
          priority_score,
          is_active,
          created_at,
          updated_at
        FROM advertiser_campaign_placements
        WHERE campaign_id = ?
        ORDER BY id DESC
      `,
      [campaignId]
    );

    connection.release();

    return res.status(201).json({
      ok: true,
      message: 'Advertiser campaign created successfully.',
      campaign: campaignRows[0] || null,
      placements,
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error('createCustomerAdvertiserCampaign rollback error:', rollbackError);
    }
    connection.release();

    console.error('createCustomerAdvertiserCampaign error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to create advertiser campaign.',
      error: error.message,
    });
  }
}

async function updateCustomerAdvertiserCampaign(req, res) {
  try {
    const userId = toNumber(req.user?.id);
    const campaignId = toNumber(req.params?.campaignId);

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Unauthorized.',
      });
    }

    if (!campaignId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid campaignId is required.',
      });
    }

    const { profile } = await getAdvertiserProfileAndWalletByUserId(userId);

    const [campaignRows] = await pool.query(
      `
        SELECT *
        FROM advertiser_campaigns
        WHERE id = ? AND advertiser_profile_id = ?
        LIMIT 1
      `,
      [campaignId, profile.id]
    );

    const campaign = campaignRows[0] || null;

    if (!campaign) {
      return res.status(404).json({
        ok: false,
        message: 'Campaign not found.',
      });
    }

    if (!['draft', 'rejected', 'paused'].includes(campaign.approval_status)) {
      return res.status(400).json({
        ok: false,
        message: 'Only draft, rejected, or paused campaigns can be edited here.',
      });
    }

    const campaignName = cleanText(req.body?.campaign_name) || campaign.campaign_name;
    const campaignType = cleanEnum(
      req.body?.campaign_type,
      ['banner', 'native', 'text', 'html', 'image'],
      campaign.campaign_type
    );
    const buyingModel = cleanEnum(
      req.body?.buying_model,
      ['cpc', 'cpm', 'fixed'],
      campaign.buying_model
    );
    const objective = cleanEnum(
      req.body?.objective,
      ['traffic', 'awareness', 'conversion', 'engagement'],
      campaign.objective
    );

    const destinationUrl = cleanText(req.body?.destination_url) || campaign.destination_url;
    const displayUrl =
      req.body?.display_url !== undefined ? cleanText(req.body?.display_url) : campaign.display_url;
    const headline =
      req.body?.headline !== undefined ? cleanText(req.body?.headline) : campaign.headline;
    const descriptionText =
      req.body?.description_text !== undefined
        ? cleanLongText(req.body?.description_text)
        : campaign.description_text;
    const callToAction =
      req.body?.call_to_action !== undefined
        ? cleanText(req.body?.call_to_action, 100)
        : campaign.call_to_action;

    const budgetTotal =
      req.body?.budget_total !== undefined
        ? cleanDecimal(req.body?.budget_total, campaign.budget_total)
        : Number(campaign.budget_total || 0);

    const budgetDaily =
      req.body?.budget_daily !== undefined
        ? cleanDecimal(req.body?.budget_daily, campaign.budget_daily)
        : Number(campaign.budget_daily || 0);

    const bidAmount =
      req.body?.bid_amount !== undefined
        ? cleanDecimal(req.body?.bid_amount, campaign.bid_amount)
        : Number(campaign.bid_amount || 0);

    const startAt = req.body?.start_at !== undefined ? req.body.start_at : campaign.start_at;
    const endAt = req.body?.end_at !== undefined ? req.body.end_at : campaign.end_at;

    await pool.query(
      `
        UPDATE advertiser_campaigns
        SET
          campaign_name = ?,
          campaign_type = ?,
          buying_model = ?,
          objective = ?,
          destination_url = ?,
          display_url = ?,
          headline = ?,
          description_text = ?,
          call_to_action = ?,
          budget_total = ?,
          budget_daily = ?,
          bid_amount = ?,
          start_at = ?,
          end_at = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND advertiser_profile_id = ?
      `,
      [
        campaignName,
        campaignType,
        buyingModel,
        objective,
        destinationUrl,
        displayUrl,
        headline,
        descriptionText,
        callToAction,
        budgetTotal,
        budgetDaily,
        bidAmount,
        startAt,
        endAt,
        campaignId,
        profile.id,
      ]
    );

    const [updatedRows] = await pool.query(
      `
        SELECT *
        FROM advertiser_campaigns
        WHERE id = ?
        LIMIT 1
      `,
      [campaignId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Advertiser campaign updated successfully.',
      campaign: updatedRows[0] || null,
    });
  } catch (error) {
    console.error('updateCustomerAdvertiserCampaign error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to update advertiser campaign.',
      error: error.message,
    });
  }
}

async function submitCustomerAdvertiserCampaignForReview(req, res) {
  try {
    const userId = toNumber(req.user?.id);
    const campaignId = toNumber(req.params?.campaignId);

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Unauthorized.',
      });
    }

    if (!campaignId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid campaignId is required.',
      });
    }

    const { profile } = await getAdvertiserProfileAndWalletByUserId(userId);

    const [campaignRows] = await pool.query(
      `
        SELECT *
        FROM advertiser_campaigns
        WHERE id = ? AND advertiser_profile_id = ?
        LIMIT 1
      `,
      [campaignId, profile.id]
    );

    const campaign = campaignRows[0] || null;

    if (!campaign) {
      return res.status(404).json({
        ok: false,
        message: 'Campaign not found.',
      });
    }

    if (!['draft', 'rejected', 'paused'].includes(campaign.approval_status)) {
      return res.status(400).json({
        ok: false,
        message: 'Only draft, rejected, or paused campaigns can be submitted for review.',
      });
    }

    const [creativeRows] = await pool.query(
      `
        SELECT COUNT(*) AS total
        FROM advertiser_campaign_creatives
        WHERE campaign_id = ?
      `,
      [campaignId]
    );

    const creativesCount = Number(creativeRows?.[0]?.total || 0);

    if (creativesCount < 1) {
      return res.status(400).json({
        ok: false,
        message: 'Add at least one creative before submitting for review.',
      });
    }

    const [placementRows] = await pool.query(
      `
        SELECT COUNT(*) AS total
        FROM advertiser_campaign_placements
        WHERE campaign_id = ? AND is_active = 1
      `,
      [campaignId]
    );

    const placementsCount = Number(placementRows?.[0]?.total || 0);

    if (placementsCount < 1) {
      return res.status(400).json({
        ok: false,
        message: 'Add at least one active placement before submitting for review.',
      });
    }

    await pool.query(
      `
        UPDATE advertiser_campaigns
        SET
          approval_status = 'pending',
          delivery_status = 'not_started',
          rejection_reason = NULL,
          approved_by_user_id = NULL,
          approved_at = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND advertiser_profile_id = ?
      `,
      [campaignId, profile.id]
    );

    await pool.query(
      `
        UPDATE advertiser_campaign_creatives
        SET
          approval_status = 'pending',
          rejection_reason = NULL,
          approved_by_user_id = NULL,
          approved_at = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE campaign_id = ?
      `,
      [campaignId]
    );

    const [updatedRows] = await pool.query(
      `
        SELECT *
        FROM advertiser_campaigns
        WHERE id = ?
        LIMIT 1
      `,
      [campaignId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Campaign submitted for review successfully.',
      campaign: updatedRows[0] || null,
    });
  } catch (error) {
    console.error('submitCustomerAdvertiserCampaignForReview error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to submit advertiser campaign for review.',
      error: error.message,
    });
  }
}

module.exports = {
  getCustomerAdvertiserCampaigns,
  getCustomerAdvertiserCampaignById,
  createCustomerAdvertiserCampaign,
  updateCustomerAdvertiserCampaign,
  submitCustomerAdvertiserCampaignForReview,
};