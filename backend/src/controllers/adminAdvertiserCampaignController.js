const pool = require('../config/db');

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function cleanLongText(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
}

async function getAdminAdvertiserCampaigns(req, res) {
  try {
    const status = String(req.query?.status || '').trim();
    const search = String(req.query?.search || '').trim();

    let sql = `
      SELECT
        ac.id,
        ac.advertiser_profile_id,
        ac.advertiser_wallet_id,
        ac.campaign_name,
        ac.campaign_slug,
        ac.campaign_type,
        ac.buying_model,
        ac.objective,
        ac.destination_url,
        ac.display_url,
        ac.headline,
        ac.call_to_action,
        ac.budget_total,
        ac.budget_daily,
        ac.bid_amount,
        ac.spent_amount,
        ac.impressions_count,
        ac.clicks_count,
        ac.conversion_count,
        ac.start_at,
        ac.end_at,
        ac.approval_status,
        ac.delivery_status,
        ac.rejection_reason,
        ac.approved_by_user_id,
        ac.approved_at,
        ac.created_at,
        ac.updated_at,
        cap.business_name,
        cap.contact_name,
        cap.contact_email,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email
      FROM advertiser_campaigns ac
      INNER JOIN customer_advertiser_profiles cap
        ON cap.id = ac.advertiser_profile_id
      INNER JOIN users u
        ON u.id = cap.user_id
      WHERE 1 = 1
    `;

    const params = [];

    if (status) {
      sql += ` AND ac.approval_status = ? `;
      params.push(status);
    }

    if (search) {
      sql += `
        AND (
          ac.campaign_name LIKE ?
          OR ac.campaign_slug LIKE ?
          OR cap.business_name LIKE ?
          OR cap.contact_name LIKE ?
          OR cap.contact_email LIKE ?
          OR u.name LIKE ?
          OR u.email LIKE ?
        )
      `;
      const like = `%${search}%`;
      params.push(like, like, like, like, like, like, like);
    }

    sql += ` ORDER BY ac.id DESC `;

    const [campaigns] = await pool.query(sql, params);

    return res.status(200).json({
      ok: true,
      campaigns,
    });
  } catch (error) {
    console.error('getAdminAdvertiserCampaigns error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch advertiser campaigns.',
      error: error.message,
    });
  }
}

async function getAdminAdvertiserCampaignById(req, res) {
  try {
    const campaignId = toNumber(req.params?.campaignId);

    if (!campaignId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid campaignId is required.',
      });
    }

    const [campaignRows] = await pool.query(
      `
        SELECT
          ac.*,
          cap.business_name,
          cap.contact_name,
          cap.contact_email,
          cap.contact_phone,
          cap.website_url,
          cap.brand_name,
          cap.business_type,
          cap.verification_status,
          u.id AS user_id,
          u.name AS user_name,
          u.email AS user_email
        FROM advertiser_campaigns ac
        INNER JOIN customer_advertiser_profiles cap
          ON cap.id = ac.advertiser_profile_id
        INNER JOIN users u
          ON u.id = cap.user_id
        WHERE ac.id = ?
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
      placements,
      creatives,
    });
  } catch (error) {
    console.error('getAdminAdvertiserCampaignById error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch advertiser campaign.',
      error: error.message,
    });
  }
}

async function approveAdminAdvertiserCampaign(req, res) {
  try {
    const campaignId = toNumber(req.params?.campaignId);
    const adminUserId = toNumber(req.user?.id);

    if (!campaignId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid campaignId is required.',
      });
    }

    const [campaignRows] = await pool.query(
      `
        SELECT id, approval_status
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

    await pool.query(
      `
        UPDATE advertiser_campaigns
        SET
          approval_status = 'approved',
          delivery_status = CASE
            WHEN start_at IS NULL OR start_at <= NOW() THEN 'serving'
            ELSE 'not_started'
          END,
          rejection_reason = NULL,
          approved_by_user_id = ?,
          approved_at = NOW(),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [adminUserId || null, campaignId]
    );

    await pool.query(
      `
        UPDATE advertiser_campaign_creatives
        SET
          approval_status = 'approved',
          rejection_reason = NULL,
          approved_by_user_id = ?,
          approved_at = NOW(),
          updated_at = CURRENT_TIMESTAMP
        WHERE campaign_id = ?
          AND approval_status IN ('draft', 'pending', 'rejected')
      `,
      [adminUserId || null, campaignId]
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
      message: 'Campaign approved successfully.',
      campaign: updatedRows[0] || null,
    });
  } catch (error) {
    console.error('approveAdminAdvertiserCampaign error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to approve advertiser campaign.',
      error: error.message,
    });
  }
}

async function rejectAdminAdvertiserCampaign(req, res) {
  try {
    const campaignId = toNumber(req.params?.campaignId);
    const adminUserId = toNumber(req.user?.id);
    const rejectionReason = cleanLongText(req.body?.rejection_reason);

    if (!campaignId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid campaignId is required.',
      });
    }

    if (!rejectionReason) {
      return res.status(400).json({
        ok: false,
        message: 'rejection_reason is required.',
      });
    }

    const [campaignRows] = await pool.query(
      `
        SELECT id
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

    await pool.query(
      `
        UPDATE advertiser_campaigns
        SET
          approval_status = 'rejected',
          delivery_status = 'stopped',
          rejection_reason = ?,
          approved_by_user_id = ?,
          approved_at = NOW(),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [rejectionReason, adminUserId || null, campaignId]
    );

    await pool.query(
      `
        UPDATE advertiser_campaign_creatives
        SET
          approval_status = 'rejected',
          rejection_reason = ?,
          approved_by_user_id = ?,
          approved_at = NOW(),
          updated_at = CURRENT_TIMESTAMP
        WHERE campaign_id = ?
      `,
      [rejectionReason, adminUserId || null, campaignId]
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
      message: 'Campaign rejected successfully.',
      campaign: updatedRows[0] || null,
    });
  } catch (error) {
    console.error('rejectAdminAdvertiserCampaign error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to reject advertiser campaign.',
      error: error.message,
    });
  }
}

async function pauseAdminAdvertiserCampaign(req, res) {
  try {
    const campaignId = toNumber(req.params?.campaignId);

    if (!campaignId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid campaignId is required.',
      });
    }

    const [campaignRows] = await pool.query(
      `
        SELECT id
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

    await pool.query(
      `
        UPDATE advertiser_campaigns
        SET
          approval_status = 'paused',
          delivery_status = 'paused',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
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
      message: 'Campaign paused successfully.',
      campaign: updatedRows[0] || null,
    });
  } catch (error) {
    console.error('pauseAdminAdvertiserCampaign error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to pause advertiser campaign.',
      error: error.message,
    });
  }
}

module.exports = {
  getAdminAdvertiserCampaigns,
  getAdminAdvertiserCampaignById,
  approveAdminAdvertiserCampaign,
  rejectAdminAdvertiserCampaign,
  pauseAdminAdvertiserCampaign,
};