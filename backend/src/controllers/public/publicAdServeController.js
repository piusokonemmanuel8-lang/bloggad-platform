const pool = require('../../config/db');

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function cleanText(value, max = 255) {
  if (value === undefined || value === null) return '';
  return String(value).trim().slice(0, max);
}

function parseJsonSafe(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function pickCreativeMarkup(campaign, creative) {
  if (!creative) return null;

  if (creative.creative_type === 'html' && creative.html_code) {
    return {
      type: 'html',
      html_code: creative.html_code,
    };
  }

  return {
    type: creative.creative_type || 'image',
    asset_url: creative.asset_url || null,
    thumbnail_url: creative.thumbnail_url || null,
    headline: creative.headline || campaign.headline || null,
    body_text: creative.body_text || campaign.description_text || null,
    button_text: creative.button_text || campaign.call_to_action || null,
    alt_text: creative.alt_text || creative.headline || campaign.campaign_name || 'Advertisement',
  };
}

async function getWebsiteMonetizationSettings(websiteId) {
  if (!websiteId) return null;

  const [rows] = await pool.query(
    `
      SELECT *
      FROM affiliate_monetization_settings
      WHERE website_id = ?
      LIMIT 1
    `,
    [websiteId]
  );

  return rows[0] || null;
}

function resolvePlacementEnabled(settingsRow, slotKey) {
  if (!settingsRow || !slotKey) return false;

  const directFlag = settingsRow[`${slotKey}_enabled`];
  if (typeof directFlag === 'number') return Number(directFlag) === 1;
  if (typeof directFlag === 'boolean') return directFlag;

  const placements = parseJsonSafe(settingsRow.placements, {});
  const platformPlacements = parseJsonSafe(settingsRow.platform_placements, {});
  const directPlacements = parseJsonSafe(settingsRow.direct_placements, {});

  const merged = {
    ...placements,
    ...platformPlacements,
    ...directPlacements,
  };

  const slot = merged?.[slotKey];

  if (!slot) return false;
  if (typeof slot === 'object') {
    if (slot.enabled === false) return false;
    if (slot.is_enabled === false) return false;
    if (slot.active === false) return false;
    return true;
  }

  return Boolean(slot);
}

async function findEligibleCampaign({
  slotKey,
  websiteId = null,
  affiliateUserId = null,
  postId = null,
  productId = null,
}) {
  const params = [slotKey];
  let sql = `
    SELECT
      ac.id AS campaign_id,
      ac.advertiser_profile_id,
      ac.campaign_name,
      ac.campaign_slug,
      ac.campaign_type,
      ac.buying_model,
      ac.objective,
      ac.destination_url,
      ac.display_url,
      ac.headline,
      ac.description_text,
      ac.call_to_action,
      ac.budget_total,
      ac.budget_daily,
      ac.bid_amount,
      ac.spent_amount,
      ac.impressions_count,
      ac.clicks_count,
      ac.start_at,
      ac.end_at,
      ac.approval_status,
      ac.delivery_status,
      acp.id AS placement_id,
      acp.placement_key,
      acp.page_type,
      acp.target_mode,
      acp.category_id,
      acp.website_id,
      acp.affiliate_user_id,
      acp.post_id,
      acp.priority_score,
      acc.id AS creative_id,
      acc.creative_type,
      acc.asset_url,
      acc.thumbnail_url,
      acc.headline AS creative_headline,
      acc.body_text,
      acc.button_text,
      acc.html_code,
      acc.width_px,
      acc.height_px,
      acc.alt_text,
      acc.is_primary
    FROM advertiser_campaign_placements acp
    INNER JOIN advertiser_campaigns ac
      ON ac.id = acp.campaign_id
    LEFT JOIN advertiser_campaign_creatives acc
      ON acc.campaign_id = ac.id
     AND acc.approval_status = 'approved'
    WHERE acp.is_active = 1
      AND acp.placement_key = ?
      AND ac.approval_status = 'approved'
      AND ac.delivery_status IN ('serving', 'not_started')
      AND (ac.start_at IS NULL OR ac.start_at <= NOW())
      AND (ac.end_at IS NULL OR ac.end_at >= NOW())
      AND (ac.budget_total <= 0 OR ac.spent_amount < ac.budget_total)
      AND (
        acp.target_mode = 'all'
  `;

  if (websiteId) {
    sql += ` OR (acp.target_mode = 'specific_website' AND acp.website_id = ?) `;
    params.push(websiteId);
  }

  if (affiliateUserId) {
    sql += ` OR (acp.target_mode = 'specific_affiliate' AND acp.affiliate_user_id = ?) `;
    params.push(affiliateUserId);
  }

  if (postId) {
    sql += ` OR (acp.target_mode = 'specific_post' AND acp.post_id = ?) `;
    params.push(postId);
  }

  sql += `
      )
    ORDER BY
      acp.priority_score DESC,
      acc.is_primary DESC,
      ac.id DESC
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, params);
  return rows[0] || null;
}

async function servePublicAd(req, res) {
  try {
    const slotKey = cleanText(req.query?.slot_key || req.params?.slotKey, 100);
    const websiteId = toNumber(req.query?.website_id);
    const affiliateUserId = toNumber(req.query?.affiliate_user_id);
    const postId = toNumber(req.query?.post_id);
    const productId = toNumber(req.query?.product_id);

    if (!slotKey) {
      return res.status(400).json({
        ok: false,
        message: 'slot_key is required.',
      });
    }

    const monetizationSettings = await getWebsiteMonetizationSettings(websiteId);

    if (!monetizationSettings) {
      return res.status(200).json({
        ok: true,
        ad: null,
        message: 'No monetization settings found for this website.',
      });
    }

    if (Number(monetizationSettings.ad_system_enabled) !== 1) {
      return res.status(200).json({
        ok: true,
        ad: null,
        message: 'Ad system is disabled.',
      });
    }

    if (!resolvePlacementEnabled(monetizationSettings, slotKey)) {
      return res.status(200).json({
        ok: true,
        ad: null,
        message: 'Placement is disabled.',
      });
    }

    const campaignRow = await findEligibleCampaign({
      slotKey,
      websiteId: websiteId || null,
      affiliateUserId: affiliateUserId || null,
      postId: postId || null,
      productId: productId || null,
    });

    if (!campaignRow) {
      return res.status(200).json({
        ok: true,
        ad: null,
        message: 'No eligible ad found.',
      });
    }

    const creativePayload = pickCreativeMarkup(
      {
        headline: campaignRow.headline,
        description_text: campaignRow.description_text,
        call_to_action: campaignRow.call_to_action,
        campaign_name: campaignRow.campaign_name,
      },
      {
        creative_type: campaignRow.creative_type,
        html_code: campaignRow.html_code,
        asset_url: campaignRow.asset_url,
        thumbnail_url: campaignRow.thumbnail_url,
        headline: campaignRow.creative_headline,
        body_text: campaignRow.body_text,
        button_text: campaignRow.button_text,
        alt_text: campaignRow.alt_text,
      }
    );

    return res.status(200).json({
      ok: true,
      ad: {
        campaign_id: campaignRow.campaign_id,
        creative_id: campaignRow.creative_id,
        placement_id: campaignRow.placement_id,
        placement_key: campaignRow.placement_key,
        campaign_name: campaignRow.campaign_name,
        campaign_type: campaignRow.campaign_type,
        buying_model: campaignRow.buying_model,
        destination_url: campaignRow.destination_url,
        display_url: campaignRow.display_url,
        headline: campaignRow.creative_headline || campaignRow.headline || null,
        description_text: campaignRow.body_text || campaignRow.description_text || null,
        call_to_action: campaignRow.button_text || campaignRow.call_to_action || null,
        creative: creativePayload,
      },
    });
  } catch (error) {
    console.error('servePublicAd error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to serve ad.',
      error: error.message,
    });
  }
}

async function trackPublicAdImpression(req, res) {
  try {
    const campaignId = toNumber(req.body?.campaign_id);
    const creativeId = toNumber(req.body?.creative_id, null);
    const placementId = toNumber(req.body?.placement_id, null);
    const slotKey = cleanText(req.body?.placement_key, 100);
    const websiteId = toNumber(req.body?.website_id, null);
    const affiliateUserId = toNumber(req.body?.affiliate_user_id, null);
    const postId = toNumber(req.body?.post_id, null);
    const productId = toNumber(req.body?.product_id, null);
    const viewerCustomerId = toNumber(req.user?.id, null);

    if (!campaignId || !slotKey) {
      return res.status(400).json({
        ok: false,
        message: 'campaign_id and placement_key are required.',
      });
    }

    await pool.query(
      `
        INSERT INTO advertiser_ad_impressions
        (
          campaign_id,
          creative_id,
          placement_id,
          placement_key,
          website_id,
          affiliate_user_id,
          post_id,
          product_id,
          viewer_customer_id,
          ip_address,
          user_agent,
          referrer_url,
          page_url,
          cost_amount
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.000000)
      `,
      [
        campaignId,
        creativeId,
        placementId,
        slotKey,
        websiteId,
        affiliateUserId,
        postId,
        productId,
        viewerCustomerId,
        cleanText(req.ip, 64),
        cleanLongText(req.headers['user-agent']),
        cleanText(req.body?.referrer_url),
        cleanText(req.body?.page_url),
      ]
    );

    await pool.query(
      `
        UPDATE advertiser_campaigns
        SET
          impressions_count = impressions_count + 1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [campaignId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Ad impression tracked successfully.',
    });
  } catch (error) {
    console.error('trackPublicAdImpression error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to track ad impression.',
      error: error.message,
    });
  }
}

async function trackPublicAdClick(req, res) {
  try {
    const campaignId = toNumber(req.body?.campaign_id);
    const creativeId = toNumber(req.body?.creative_id, null);
    const placementId = toNumber(req.body?.placement_id, null);
    const slotKey = cleanText(req.body?.placement_key, 100);
    const websiteId = toNumber(req.body?.website_id, null);
    const affiliateUserId = toNumber(req.body?.affiliate_user_id, null);
    const postId = toNumber(req.body?.post_id, null);
    const productId = toNumber(req.body?.product_id, null);
    const viewerCustomerId = toNumber(req.user?.id, null);

    if (!campaignId || !slotKey) {
      return res.status(400).json({
        ok: false,
        message: 'campaign_id and placement_key are required.',
      });
    }

    const [campaignRows] = await pool.query(
      `
        SELECT id, bid_amount, spent_amount, budget_total
        FROM advertiser_campaigns
        WHERE id = ?
        LIMIT 1
      `,
      [campaignId]
    );

    const campaign = campaignRows[0] || null;

    if (!campaign) {
      return res.status(404).json({
        ok: false,
        message: 'Campaign not found.',
      });
    }

    const costAmount = Number(campaign.bid_amount || 0);
    const nextSpent = Number(campaign.spent_amount || 0) + costAmount;

    await pool.query(
      `
        INSERT INTO advertiser_ad_clicks
        (
          campaign_id,
          creative_id,
          placement_id,
          placement_key,
          website_id,
          affiliate_user_id,
          post_id,
          product_id,
          viewer_customer_id,
          ip_address,
          user_agent,
          referrer_url,
          page_url,
          cost_amount
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        campaignId,
        creativeId,
        placementId,
        slotKey,
        websiteId,
        affiliateUserId,
        postId,
        productId,
        viewerCustomerId,
        cleanText(req.ip, 64),
        cleanLongText(req.headers['user-agent']),
        cleanText(req.body?.referrer_url),
        cleanText(req.body?.page_url),
        costAmount,
      ]
    );

    await pool.query(
      `
        UPDATE advertiser_campaigns
        SET
          clicks_count = clicks_count + 1,
          spent_amount = ?,
          delivery_status = CASE
            WHEN budget_total > 0 AND ? >= budget_total THEN 'budget_exhausted'
            ELSE delivery_status
          END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [nextSpent, nextSpent, campaignId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Ad click tracked successfully.',
      cost_amount: costAmount,
    });
  } catch (error) {
    console.error('trackPublicAdClick error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to track ad click.',
      error: error.message,
    });
  }
}

module.exports = {
  servePublicAd,
  trackPublicAdImpression,
  trackPublicAdClick,
};