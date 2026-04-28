const pool = require('../../config/db');

function getAdminId(req) {
  return req.user?.id || req.user?.user_id || null;
}

function cleanText(value) {
  return String(value || '').trim();
}

async function getAdminAffiliateAds(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.*,
        u.name AS affiliate_name,
        u.email AS affiliate_email
      FROM affiliate_ads_campaigns c
      LEFT JOIN users u ON u.id = c.affiliate_id
      ORDER BY
        CASE
          WHEN c.approval_status = 'pending' THEN 0
          WHEN c.status = 'active' THEN 1
          ELSE 2
        END ASC,
        c.created_at DESC
    `);

    return res.status(200).json({
      ok: true,
      campaigns: rows,
    });
  } catch (error) {
    next(error);
  }
}

async function approveAffiliateAd(req, res, next) {
  try {
    const adminId = getAdminId(req);
    const campaignId = Number(req.params.id);
    const adminNote = cleanText(req.body.admin_note);

    if (!campaignId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid campaign ID is required.',
      });
    }

    const [rows] = await pool.query(
      `
        SELECT *
        FROM affiliate_ads_campaigns
        WHERE id = ?
        LIMIT 1
      `,
      [campaignId]
    );

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate ad campaign not found.',
      });
    }

    const campaign = rows[0];

    const nextStatus = Number(campaign.remaining_budget) > 0 ? 'active' : 'approved';

    await pool.query(
      `
        UPDATE affiliate_ads_campaigns
        SET
          status = ?,
          approval_status = 'approved',
          payment_status = 'paid',
          admin_note = ?,
          rejection_reason = NULL,
          approved_by = ?,
          approved_at = NOW(),
          rejected_at = NULL
        WHERE id = ?
      `,
      [nextStatus, adminNote || null, adminId, campaignId]
    );

    const [updatedRows] = await pool.query(
      `
        SELECT *
        FROM affiliate_ads_campaigns
        WHERE id = ?
        LIMIT 1
      `,
      [campaignId]
    );

    return res.status(200).json({
      ok: true,
      message:
        nextStatus === 'active'
          ? 'Affiliate ad approved and activated successfully.'
          : 'Affiliate ad approved successfully. It needs funding before running.',
      campaign: updatedRows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function rejectAffiliateAd(req, res, next) {
  try {
    const adminId = getAdminId(req);
    const campaignId = Number(req.params.id);
    const rejectionReason = cleanText(req.body.rejection_reason || req.body.reason);
    const adminNote = cleanText(req.body.admin_note);

    if (!campaignId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid campaign ID is required.',
      });
    }

    if (!rejectionReason) {
      return res.status(400).json({
        ok: false,
        message: 'Rejection reason is required.',
      });
    }

    const [rows] = await pool.query(
      `
        SELECT id
        FROM affiliate_ads_campaigns
        WHERE id = ?
        LIMIT 1
      `,
      [campaignId]
    );

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate ad campaign not found.',
      });
    }

    await pool.query(
      `
        UPDATE affiliate_ads_campaigns
        SET
          status = 'rejected',
          approval_status = 'rejected',
          admin_note = ?,
          rejection_reason = ?,
          approved_by = ?,
          approved_at = NULL,
          rejected_at = NOW()
        WHERE id = ?
      `,
      [adminNote || null, rejectionReason, adminId, campaignId]
    );

    const [updatedRows] = await pool.query(
      `
        SELECT *
        FROM affiliate_ads_campaigns
        WHERE id = ?
        LIMIT 1
      `,
      [campaignId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Affiliate ad rejected successfully.',
      campaign: updatedRows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function pauseAffiliateAdByAdmin(req, res, next) {
  try {
    const campaignId = Number(req.params.id);

    if (!campaignId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid campaign ID is required.',
      });
    }

    await pool.query(
      `
        UPDATE affiliate_ads_campaigns
        SET
          status = 'paused',
          paused_at = NOW()
        WHERE id = ?
          AND approval_status = 'approved'
      `,
      [campaignId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Affiliate ad paused successfully.',
    });
  } catch (error) {
    next(error);
  }
}

async function resumeAffiliateAdByAdmin(req, res, next) {
  try {
    const campaignId = Number(req.params.id);

    if (!campaignId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid campaign ID is required.',
      });
    }

    const [rows] = await pool.query(
      `
        SELECT *
        FROM affiliate_ads_campaigns
        WHERE id = ?
        LIMIT 1
      `,
      [campaignId]
    );

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate ad campaign not found.',
      });
    }

    const campaign = rows[0];

    if (campaign.approval_status !== 'approved') {
      return res.status(400).json({
        ok: false,
        message: 'Only approved ads can be resumed.',
      });
    }

    if (Number(campaign.remaining_budget) <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'This ad has no remaining balance.',
      });
    }

    await pool.query(
      `
        UPDATE affiliate_ads_campaigns
        SET
          status = 'active',
          paused_at = NULL,
          exhausted_at = NULL
        WHERE id = ?
      `,
      [campaignId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Affiliate ad resumed successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAdminAffiliateAds,
  approveAffiliateAd,
  rejectAffiliateAd,
  pauseAffiliateAdByAdmin,
  resumeAffiliateAdByAdmin,
};