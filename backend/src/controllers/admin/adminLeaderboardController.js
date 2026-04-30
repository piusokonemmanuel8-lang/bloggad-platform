const pool = require('../../config/db')
const {
  refreshLeaderboardData,
  getAdjustedLeaderboardRows,
} = require('../affiliate/affiliateLeaderboardController')

function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function normalizeAdminId(req) {
  return req.user?.id || req.user?.user_id || null
}

function safeNumber(value) {
  return Number(value || 0)
}

async function getAdminLeaderboard(req, res) {
  try {
    const month = req.query.month || getMonthKey()
    const limit = Math.min(Number(req.query.limit || 1000), 5000)

    const rows = await getAdjustedLeaderboardRows(month)

    return res.json({
      ok: true,
      month,
      leaderboard: rows.slice(0, limit),
    })
  } catch (error) {
    console.error('Admin get leaderboard error:', error)

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch admin leaderboard.',
    })
  }
}

async function refreshAdminLeaderboard(req, res) {
  try {
    const result = await refreshLeaderboardData()

    return res.json({
      ok: true,
      message: 'Leaderboard refreshed successfully.',
      ...result,
    })
  } catch (error) {
    console.error('Admin refresh leaderboard error:', error)

    return res.status(500).json({
      ok: false,
      message: 'Failed to refresh leaderboard.',
    })
  }
}

async function saveLeaderboardAdjustment(req, res) {
  try {
    const { affiliateId } = req.params
    const month = req.body?.month || req.query.month || getMonthKey()
    const adminId = normalizeAdminId(req)

    if (!affiliateId) {
      return res.status(400).json({
        ok: false,
        message: 'Affiliate ID is required.',
      })
    }

    const trafficAdjustment = safeNumber(req.body?.traffic_adjustment)
    const ctaClicksAdjustment = safeNumber(req.body?.cta_clicks_adjustment)
    const productClicksAdjustment = safeNumber(req.body?.product_clicks_adjustment)
    const publishedPostsAdjustment = safeNumber(req.body?.published_posts_adjustment)
    const earningsAdjustment = safeNumber(req.body?.earnings_adjustment)
    const scoreAdjustment = safeNumber(req.body?.score_adjustment)
    const reason = String(req.body?.reason || '').trim()

    await pool.query(
      `
      INSERT INTO bloggad_leaderboard_adjustments (
        affiliate_id,
        leaderboard_month,
        traffic_adjustment,
        cta_clicks_adjustment,
        product_clicks_adjustment,
        published_posts_adjustment,
        earnings_adjustment,
        score_adjustment,
        reason,
        adjusted_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        traffic_adjustment = VALUES(traffic_adjustment),
        cta_clicks_adjustment = VALUES(cta_clicks_adjustment),
        product_clicks_adjustment = VALUES(product_clicks_adjustment),
        published_posts_adjustment = VALUES(published_posts_adjustment),
        earnings_adjustment = VALUES(earnings_adjustment),
        score_adjustment = VALUES(score_adjustment),
        reason = VALUES(reason),
        adjusted_by = VALUES(adjusted_by),
        updated_at = CURRENT_TIMESTAMP
      `,
      [
        affiliateId,
        month,
        trafficAdjustment,
        ctaClicksAdjustment,
        productClicksAdjustment,
        publishedPostsAdjustment,
        earningsAdjustment,
        scoreAdjustment,
        reason,
        adminId,
      ]
    )

    return res.json({
      ok: true,
      message: 'Leaderboard adjustment saved.',
    })
  } catch (error) {
    console.error('Admin save leaderboard adjustment error:', error)

    return res.status(500).json({
      ok: false,
      message: 'Failed to save leaderboard adjustment.',
    })
  }
}

async function clearLeaderboardAdjustment(req, res) {
  try {
    const { affiliateId } = req.params
    const month = req.body?.month || req.query.month || getMonthKey()

    if (!affiliateId) {
      return res.status(400).json({
        ok: false,
        message: 'Affiliate ID is required.',
      })
    }

    await pool.query(
      `
      DELETE FROM bloggad_leaderboard_adjustments
      WHERE affiliate_id = ?
        AND leaderboard_month = ?
      `,
      [affiliateId, month]
    )

    return res.json({
      ok: true,
      message: 'Leaderboard adjustment cleared.',
    })
  } catch (error) {
    console.error('Admin clear leaderboard adjustment error:', error)

    return res.status(500).json({
      ok: false,
      message: 'Failed to clear leaderboard adjustment.',
    })
  }
}

async function disqualifyLeaderboardAffiliate(req, res) {
  try {
    const { affiliateId } = req.params
    const { reason = 'Disqualified by admin' } = req.body || {}
    const month = req.body?.month || req.query.month || getMonthKey()

    if (!affiliateId) {
      return res.status(400).json({
        ok: false,
        message: 'Affiliate ID is required.',
      })
    }

    await pool.query(
      `
      UPDATE bloggad_leaderboard_snapshots
      SET
        is_disqualified = 1,
        disqualified_reason = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE affiliate_id = ?
        AND leaderboard_month = ?
      `,
      [reason, affiliateId, month]
    )

    return res.json({
      ok: true,
      message: 'Affiliate disqualified from leaderboard.',
    })
  } catch (error) {
    console.error('Admin disqualify leaderboard affiliate error:', error)

    return res.status(500).json({
      ok: false,
      message: 'Failed to disqualify affiliate.',
    })
  }
}

async function restoreLeaderboardAffiliate(req, res) {
  try {
    const { affiliateId } = req.params
    const month = req.body?.month || req.query.month || getMonthKey()

    if (!affiliateId) {
      return res.status(400).json({
        ok: false,
        message: 'Affiliate ID is required.',
      })
    }

    await pool.query(
      `
      UPDATE bloggad_leaderboard_snapshots
      SET
        is_disqualified = 0,
        disqualified_reason = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE affiliate_id = ?
        AND leaderboard_month = ?
      `,
      [affiliateId, month]
    )

    return res.json({
      ok: true,
      message: 'Affiliate restored to leaderboard.',
    })
  } catch (error) {
    console.error('Admin restore leaderboard affiliate error:', error)

    return res.status(500).json({
      ok: false,
      message: 'Failed to restore affiliate.',
    })
  }
}

module.exports = {
  getAdminLeaderboard,
  refreshAdminLeaderboard,
  saveLeaderboardAdjustment,
  clearLeaderboardAdjustment,
  disqualifyLeaderboardAffiliate,
  restoreLeaderboardAffiliate,
}