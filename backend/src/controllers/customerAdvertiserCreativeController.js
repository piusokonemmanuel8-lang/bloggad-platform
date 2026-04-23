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

function cleanInteger(value, fallback = null) {
  if (value === undefined || value === null || value === '') return fallback;
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.round(num);
}

function cleanBooleanFlag(value) {
  return Number(value) === 1 || value === true || value === '1';
}

function cleanEnum(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

async function getAdvertiserProfileByUserId(userId) {
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

  return profile;
}

async function getOwnedCampaign(profileId, campaignId) {
  const [campaignRows] = await pool.query(
    `
      SELECT *
      FROM advertiser_campaigns
      WHERE id = ? AND advertiser_profile_id = ?
      LIMIT 1
    `,
    [campaignId, profileId]
  );

  return campaignRows[0] || null;
}

async function getCustomerAdvertiserCreatives(req, res) {
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

    const profile = await getAdvertiserProfileByUserId(userId);
    const campaign = await getOwnedCampaign(profile.id, campaignId);

    if (!campaign) {
      return res.status(404).json({
        ok: false,
        message: 'Campaign not found.',
      });
    }

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
      [campaignId]
    );

    return res.status(200).json({
      ok: true,
      campaign,
      creatives,
    });
  } catch (error) {
    console.error('getCustomerAdvertiserCreatives error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch advertiser creatives.',
      error: error.message,
    });
  }
}

async function createCustomerAdvertiserCreative(req, res) {
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

    const profile = await getAdvertiserProfileByUserId(userId);
    const campaign = await getOwnedCampaign(profile.id, campaignId);

    if (!campaign) {
      return res.status(404).json({
        ok: false,
        message: 'Campaign not found.',
      });
    }

    if (!['draft', 'rejected', 'paused'].includes(campaign.approval_status)) {
      return res.status(400).json({
        ok: false,
        message: 'You can only add creatives to draft, rejected, or paused campaigns.',
      });
    }

    const creativeType = cleanEnum(
      req.body?.creative_type,
      ['image', 'html', 'text', 'native'],
      'image'
    );
    const assetUrl = cleanText(req.body?.asset_url);
    const thumbnailUrl = cleanText(req.body?.thumbnail_url);
    const headline = cleanText(req.body?.headline);
    const bodyText = cleanLongText(req.body?.body_text);
    const buttonText = cleanText(req.body?.button_text, 100);
    const htmlCode = cleanLongText(req.body?.html_code);
    const widthPx = cleanInteger(req.body?.width_px);
    const heightPx = cleanInteger(req.body?.height_px);
    const altText = cleanText(req.body?.alt_text);
    const isPrimary = cleanBooleanFlag(req.body?.is_primary);

    if (creativeType === 'image' && !assetUrl) {
      return res.status(400).json({
        ok: false,
        message: 'asset_url is required for image creative.',
      });
    }

    if (creativeType === 'html' && !htmlCode) {
      return res.status(400).json({
        ok: false,
        message: 'html_code is required for html creative.',
      });
    }

    if (['text', 'native'].includes(creativeType) && !headline && !bodyText) {
      return res.status(400).json({
        ok: false,
        message: 'headline or body_text is required for this creative type.',
      });
    }

    if (isPrimary) {
      await pool.query(
        `
          UPDATE advertiser_campaign_creatives
          SET is_primary = 0
          WHERE campaign_id = ?
        `,
        [campaignId]
      );
    }

    const [result] = await pool.query(
      `
        INSERT INTO advertiser_campaign_creatives
        (
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
          approval_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
      `,
      [
        campaignId,
        creativeType,
        assetUrl,
        thumbnailUrl,
        headline,
        bodyText,
        buttonText,
        htmlCode,
        widthPx,
        heightPx,
        altText,
        isPrimary ? 1 : 0,
      ]
    );

    const [creativeRows] = await pool.query(
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
        WHERE id = ?
        LIMIT 1
      `,
      [result.insertId]
    );

    return res.status(201).json({
      ok: true,
      message: 'Creative created successfully.',
      creative: creativeRows[0] || null,
    });
  } catch (error) {
    console.error('createCustomerAdvertiserCreative error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to create advertiser creative.',
      error: error.message,
    });
  }
}

async function updateCustomerAdvertiserCreative(req, res) {
  try {
    const userId = toNumber(req.user?.id);
    const campaignId = toNumber(req.params?.campaignId);
    const creativeId = toNumber(req.params?.creativeId);

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Unauthorized.',
      });
    }

    if (!campaignId || !creativeId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid campaignId and creativeId are required.',
      });
    }

    const profile = await getAdvertiserProfileByUserId(userId);
    const campaign = await getOwnedCampaign(profile.id, campaignId);

    if (!campaign) {
      return res.status(404).json({
        ok: false,
        message: 'Campaign not found.',
      });
    }

    const [creativeRows] = await pool.query(
      `
        SELECT *
        FROM advertiser_campaign_creatives
        WHERE id = ? AND campaign_id = ?
        LIMIT 1
      `,
      [creativeId, campaignId]
    );

    const creative = creativeRows[0] || null;

    if (!creative) {
      return res.status(404).json({
        ok: false,
        message: 'Creative not found.',
      });
    }

    if (!['draft', 'rejected'].includes(creative.approval_status)) {
      return res.status(400).json({
        ok: false,
        message: 'Only draft or rejected creatives can be updated.',
      });
    }

    const creativeType = cleanEnum(
      req.body?.creative_type,
      ['image', 'html', 'text', 'native'],
      creative.creative_type
    );
    const assetUrl =
      req.body?.asset_url !== undefined ? cleanText(req.body?.asset_url) : creative.asset_url;
    const thumbnailUrl =
      req.body?.thumbnail_url !== undefined
        ? cleanText(req.body?.thumbnail_url)
        : creative.thumbnail_url;
    const headline =
      req.body?.headline !== undefined ? cleanText(req.body?.headline) : creative.headline;
    const bodyText =
      req.body?.body_text !== undefined ? cleanLongText(req.body?.body_text) : creative.body_text;
    const buttonText =
      req.body?.button_text !== undefined
        ? cleanText(req.body?.button_text, 100)
        : creative.button_text;
    const htmlCode =
      req.body?.html_code !== undefined ? cleanLongText(req.body?.html_code) : creative.html_code;
    const widthPx =
      req.body?.width_px !== undefined ? cleanInteger(req.body?.width_px) : creative.width_px;
    const heightPx =
      req.body?.height_px !== undefined ? cleanInteger(req.body?.height_px) : creative.height_px;
    const altText =
      req.body?.alt_text !== undefined ? cleanText(req.body?.alt_text) : creative.alt_text;
    const isPrimary =
      req.body?.is_primary !== undefined
        ? cleanBooleanFlag(req.body?.is_primary)
        : Number(creative.is_primary) === 1;

    if (creativeType === 'image' && !assetUrl) {
      return res.status(400).json({
        ok: false,
        message: 'asset_url is required for image creative.',
      });
    }

    if (creativeType === 'html' && !htmlCode) {
      return res.status(400).json({
        ok: false,
        message: 'html_code is required for html creative.',
      });
    }

    if (['text', 'native'].includes(creativeType) && !headline && !bodyText) {
      return res.status(400).json({
        ok: false,
        message: 'headline or body_text is required for this creative type.',
      });
    }

    if (isPrimary) {
      await pool.query(
        `
          UPDATE advertiser_campaign_creatives
          SET is_primary = 0
          WHERE campaign_id = ?
        `,
        [campaignId]
      );
    }

    await pool.query(
      `
        UPDATE advertiser_campaign_creatives
        SET
          creative_type = ?,
          asset_url = ?,
          thumbnail_url = ?,
          headline = ?,
          body_text = ?,
          button_text = ?,
          html_code = ?,
          width_px = ?,
          height_px = ?,
          alt_text = ?,
          is_primary = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND campaign_id = ?
      `,
      [
        creativeType,
        assetUrl,
        thumbnailUrl,
        headline,
        bodyText,
        buttonText,
        htmlCode,
        widthPx,
        heightPx,
        altText,
        isPrimary ? 1 : 0,
        creativeId,
        campaignId,
      ]
    );

    const [updatedRows] = await pool.query(
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
        WHERE id = ?
        LIMIT 1
      `,
      [creativeId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Creative updated successfully.',
      creative: updatedRows[0] || null,
    });
  } catch (error) {
    console.error('updateCustomerAdvertiserCreative error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to update advertiser creative.',
      error: error.message,
    });
  }
}

module.exports = {
  getCustomerAdvertiserCreatives,
  createCustomerAdvertiserCreative,
  updateCustomerAdvertiserCreative,
};