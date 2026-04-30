const pool = require('../../config/db')

function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

function getDaysPassedInMonth(date = new Date()) {
  return date.getDate()
}

function getTotalDaysInMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

function calculatePossibleMonthlyValue(value, date = new Date()) {
  const daysPassed = Math.max(getDaysPassedInMonth(date), 1)
  const totalDays = getTotalDaysInMonth(date)

  return Number(((Number(value || 0) / daysPassed) * totalDays).toFixed(2))
}

function calculateLeaderboardScore({
  monthlyTraffic = 0,
  ctaClicks = 0,
  productClicks = 0,
  confirmedEarnings = 0,
  publishedPosts = 0,
}) {
  return Number(
    (
      Number(monthlyTraffic || 0) +
      Number(ctaClicks || 0) * 5 +
      Number(productClicks || 0) * 3 +
      Number(confirmedEarnings || 0) * 10 +
      Number(publishedPosts || 0) * 20
    ).toFixed(2)
  )
}

function getBadgeByRank(rank) {
  if (rank === 1) return 'Monthly Champion'
  if (rank >= 2 && rank <= 5) return 'Top Performer'
  if (rank >= 6 && rank <= 20) return 'Fast Mover'
  if (rank >= 21 && rank <= 50) return 'Rising Affiliate'
  return 'Keep Climbing'
}

function normalizeUserId(req) {
  return req.user?.id || req.user?.user_id || req.user?.affiliate_id || null
}

function safeNumber(value) {
  return Number(value || 0)
}

function clampZero(value) {
  return Math.max(Number(value || 0), 0)
}

async function tableExists(connection, tableName) {
  const [rows] = await connection.query(
    `
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
    LIMIT 1
    `,
    [tableName]
  )

  return rows.length > 0
}

async function getBlogPulseRate(connection) {
  const [rows] = await connection.query(
    `
    SELECT default_rate_per_view
    FROM blogpulse_settings
    ORDER BY id ASC
    LIMIT 1
    `
  )

  return Number(rows[0]?.default_rate_per_view || 0)
}

async function getMonthlyCountByWebsiteOwner(connection, {
  table,
  monthKey,
  dateColumn = 'created_at',
}) {
  const exists = await tableExists(connection, table)

  if (!exists) return {}

  const [rows] = await connection.query(
    `
    SELECT
      aw.user_id AS affiliate_id,
      COUNT(*) AS total_count
    FROM \`${table}\` t
    INNER JOIN affiliate_websites aw ON aw.id = t.website_id
    WHERE DATE_FORMAT(t.\`${dateColumn}\`, '%Y-%m') = ?
    GROUP BY aw.user_id
    `,
    [monthKey]
  )

  return rows.reduce((map, row) => {
    map[row.affiliate_id] = Number(row.total_count || 0)
    return map
  }, {})
}

async function getMonthlyPublishedPostsMap(connection, monthKey) {
  const exists = await tableExists(connection, 'product_posts')

  if (!exists) return {}

  const [rows] = await connection.query(
    `
    SELECT
      aw.user_id AS affiliate_id,
      COUNT(*) AS published_posts
    FROM product_posts pp
    INNER JOIN affiliate_websites aw ON aw.id = pp.website_id
    WHERE DATE_FORMAT(pp.created_at, '%Y-%m') = ?
    GROUP BY aw.user_id
    `,
    [monthKey]
  )

  return rows.reduce((map, row) => {
    map[row.affiliate_id] = Number(row.published_posts || 0)
    return map
  }, {})
}

async function getMonthlySponsoredEarningsMap(connection, monthKey) {
  const exists = await tableExists(connection, 'affiliate_ad_revenue_ledger')

  if (!exists) return {}

  const [rows] = await connection.query(
    `
    SELECT
      publisher_affiliate_id AS affiliate_id,
      COALESCE(SUM(publisher_amount), 0) AS sponsored_earnings
    FROM affiliate_ad_revenue_ledger
    WHERE DATE_FORMAT(created_at, '%Y-%m') = ?
      AND settlement_status IN ('pending', 'settled', 'paid', 'approved')
    GROUP BY publisher_affiliate_id
    `,
    [monthKey]
  )

  return rows.reduce((map, row) => {
    map[row.affiliate_id] = Number(row.sponsored_earnings || 0)
    return map
  }, {})
}

async function getAdjustmentMap(month) {
  const [rows] = await pool.query(
    `
    SELECT
      affiliate_id,
      leaderboard_month,
      traffic_adjustment,
      cta_clicks_adjustment,
      product_clicks_adjustment,
      published_posts_adjustment,
      earnings_adjustment,
      score_adjustment,
      reason,
      adjusted_by,
      updated_at
    FROM bloggad_leaderboard_adjustments
    WHERE leaderboard_month = ?
    `,
    [month]
  )

  return rows.reduce((map, row) => {
    map[row.affiliate_id] = row
    return map
  }, {})
}

function applyLeaderboardAdjustment(row, adjustment = null, rank = null) {
  const trafficAdjustment = safeNumber(adjustment?.traffic_adjustment)
  const ctaAdjustment = safeNumber(adjustment?.cta_clicks_adjustment)
  const productAdjustment = safeNumber(adjustment?.product_clicks_adjustment)
  const postsAdjustment = safeNumber(adjustment?.published_posts_adjustment)
  const earningsAdjustment = safeNumber(adjustment?.earnings_adjustment)
  const scoreAdjustment = safeNumber(adjustment?.score_adjustment)

  const originalMonthlyTraffic = safeNumber(row.monthly_traffic)
  const originalCtaClicks = safeNumber(row.cta_clicks)
  const originalProductClicks = safeNumber(row.product_clicks)
  const originalPublishedPosts = safeNumber(row.published_posts)
  const originalConfirmedEarnings = safeNumber(row.confirmed_earnings)
  const originalPossibleMonthlyEarnings = safeNumber(row.possible_monthly_earnings)
  const originalPossibleMonthlyTraffic = safeNumber(row.possible_monthly_traffic)
  const originalScore = safeNumber(row.leaderboard_score)

  const adjustedMonthlyTraffic = clampZero(originalMonthlyTraffic + trafficAdjustment)
  const adjustedCtaClicks = clampZero(originalCtaClicks + ctaAdjustment)
  const adjustedProductClicks = clampZero(originalProductClicks + productAdjustment)
  const adjustedPublishedPosts = clampZero(originalPublishedPosts + postsAdjustment)
  const adjustedConfirmedEarnings = clampZero(originalConfirmedEarnings + earningsAdjustment)

  const recalculatedScore = calculateLeaderboardScore({
    monthlyTraffic: adjustedMonthlyTraffic,
    ctaClicks: adjustedCtaClicks,
    productClicks: adjustedProductClicks,
    confirmedEarnings: adjustedConfirmedEarnings,
    publishedPosts: adjustedPublishedPosts,
  })

  const adjustedScore = clampZero(recalculatedScore + scoreAdjustment)

  return {
    ...row,

    original_monthly_traffic: originalMonthlyTraffic,
    original_cta_clicks: originalCtaClicks,
    original_product_clicks: originalProductClicks,
    original_published_posts: originalPublishedPosts,
    original_confirmed_earnings: originalConfirmedEarnings,
    original_possible_monthly_earnings: originalPossibleMonthlyEarnings,
    original_possible_monthly_traffic: originalPossibleMonthlyTraffic,
    original_leaderboard_score: originalScore,
    original_rank: row.current_rank,

    monthly_traffic: adjustedMonthlyTraffic,
    cta_clicks: adjustedCtaClicks,
    product_clicks: adjustedProductClicks,
    published_posts: adjustedPublishedPosts,
    confirmed_earnings: adjustedConfirmedEarnings,
    possible_monthly_earnings: calculatePossibleMonthlyValue(adjustedConfirmedEarnings),
    possible_monthly_traffic: Math.round(calculatePossibleMonthlyValue(adjustedMonthlyTraffic)),
    leaderboard_score: adjustedScore,
    current_rank: rank || row.current_rank,
    badge: rank ? getBadgeByRank(rank) : row.badge,

    has_admin_adjustment: Boolean(adjustment),
    adjustment: adjustment
      ? {
          traffic_adjustment: trafficAdjustment,
          cta_clicks_adjustment: ctaAdjustment,
          product_clicks_adjustment: productAdjustment,
          published_posts_adjustment: postsAdjustment,
          earnings_adjustment: earningsAdjustment,
          score_adjustment: scoreAdjustment,
          reason: adjustment.reason || '',
          adjusted_by: adjustment.adjusted_by || null,
          updated_at: adjustment.updated_at || null,
        }
      : null,
  }
}

async function getAdjustedLeaderboardRows(month) {
  const [rows] = await pool.query(
    `
    SELECT
      lbs.id,
      lbs.affiliate_id,
      lbs.leaderboard_month,
      lbs.leaderboard_date,
      lbs.monthly_traffic,
      lbs.cta_clicks,
      lbs.product_clicks,
      lbs.published_posts,
      lbs.confirmed_earnings,
      lbs.possible_monthly_earnings,
      lbs.possible_monthly_traffic,
      lbs.leaderboard_score,
      lbs.current_rank,
      lbs.badge,
      lbs.is_disqualified,
      lbs.disqualified_reason,
      u.name,
      u.name AS full_name,
      u.email
    FROM bloggad_leaderboard_snapshots lbs
    INNER JOIN (
      SELECT
        affiliate_id,
        leaderboard_month,
        MAX(leaderboard_date) AS latest_date
      FROM bloggad_leaderboard_snapshots
      WHERE leaderboard_month = ?
      GROUP BY affiliate_id, leaderboard_month
    ) latest
      ON latest.affiliate_id = lbs.affiliate_id
      AND latest.leaderboard_month = lbs.leaderboard_month
      AND latest.latest_date = lbs.leaderboard_date
    LEFT JOIN users u ON u.id = lbs.affiliate_id
    WHERE lbs.leaderboard_month = ?
    `,
    [month, month]
  )

  const adjustmentMap = await getAdjustmentMap(month)

  const adjustedRows = rows
    .map((row) => applyLeaderboardAdjustment(row, adjustmentMap[row.affiliate_id]))
    .sort((a, b) => {
      if (Number(b.leaderboard_score) !== Number(a.leaderboard_score)) {
        return Number(b.leaderboard_score) - Number(a.leaderboard_score)
      }

      return Number(b.monthly_traffic) - Number(a.monthly_traffic)
    })
    .map((row, index) => applyLeaderboardAdjustment(row, adjustmentMap[row.affiliate_id], index + 1))

  return adjustedRows
}

async function refreshLeaderboardData() {
  const connection = await pool.getConnection()

  try {
    const now = new Date()
    const monthKey = getMonthKey(now)
    const dateKey = getDateKey(now)

    await connection.beginTransaction()

    const [affiliates] = await connection.query(
      `
      SELECT id AS affiliate_id
      FROM users
      WHERE role = 'affiliate'
        AND status = 'active'
      `
    )

    const ratePerView = await getBlogPulseRate(connection)

    const postViewsMap = await getMonthlyCountByWebsiteOwner(connection, {
      table: 'analytics_post_views',
      monthKey,
    })

    const productViewsMap = await getMonthlyCountByWebsiteOwner(connection, {
      table: 'analytics_product_views',
      monthKey,
    })

    const productClicksMap = await getMonthlyCountByWebsiteOwner(connection, {
      table: 'analytics_product_clicks',
      monthKey,
    })

    const sliderClicksMap = await getMonthlyCountByWebsiteOwner(connection, {
      table: 'analytics_slider_clicks',
      monthKey,
    })

    const publishedPostsMap = await getMonthlyPublishedPostsMap(connection, monthKey)
    const sponsoredEarningsMap = await getMonthlySponsoredEarningsMap(connection, monthKey)

    const preparedRows = affiliates.map((item) => {
      const affiliateId = item.affiliate_id

      const postViews = Number(postViewsMap[affiliateId] || 0)
      const productViews = Number(productViewsMap[affiliateId] || 0)
      const productClicks = Number(productClicksMap[affiliateId] || 0)
      const sliderClicks = Number(sliderClicksMap[affiliateId] || 0)
      const publishedPosts = Number(publishedPostsMap[affiliateId] || 0)

      const platformEstimatedRevenue = Number((postViews * ratePerView).toFixed(8))
      const sponsoredEarnings = Number(sponsoredEarningsMap[affiliateId] || 0)
      const confirmedEarnings = Number((platformEstimatedRevenue + sponsoredEarnings).toFixed(8))

      const monthlyTraffic = postViews + productViews
      const ctaClicks = productClicks + sliderClicks

      return {
        affiliate_id: affiliateId,
        monthly_traffic: monthlyTraffic,
        cta_clicks: ctaClicks,
        product_clicks: productClicks,
        published_posts: publishedPosts,
        confirmed_earnings: confirmedEarnings,
        possible_monthly_earnings: calculatePossibleMonthlyValue(confirmedEarnings, now),
        possible_monthly_traffic: Math.round(calculatePossibleMonthlyValue(monthlyTraffic, now)),
        leaderboard_score: calculateLeaderboardScore({
          monthlyTraffic,
          ctaClicks,
          productClicks,
          confirmedEarnings,
          publishedPosts,
        }),
      }
    })

    preparedRows.sort((a, b) => b.leaderboard_score - a.leaderboard_score)

    for (let index = 0; index < preparedRows.length; index += 1) {
      const row = preparedRows[index]
      const rank = index + 1
      const badge = getBadgeByRank(rank)

      await connection.query(
        `
        INSERT INTO bloggad_leaderboard_snapshots (
          affiliate_id,
          leaderboard_month,
          leaderboard_date,
          monthly_traffic,
          cta_clicks,
          product_clicks,
          published_posts,
          confirmed_earnings,
          possible_monthly_earnings,
          possible_monthly_traffic,
          leaderboard_score,
          current_rank,
          badge
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          monthly_traffic = VALUES(monthly_traffic),
          cta_clicks = VALUES(cta_clicks),
          product_clicks = VALUES(product_clicks),
          published_posts = VALUES(published_posts),
          confirmed_earnings = VALUES(confirmed_earnings),
          possible_monthly_earnings = VALUES(possible_monthly_earnings),
          possible_monthly_traffic = VALUES(possible_monthly_traffic),
          leaderboard_score = VALUES(leaderboard_score),
          current_rank = VALUES(current_rank),
          badge = VALUES(badge),
          updated_at = CURRENT_TIMESTAMP
        `,
        [
          row.affiliate_id,
          monthKey,
          dateKey,
          row.monthly_traffic,
          row.cta_clicks,
          row.product_clicks,
          row.published_posts,
          row.confirmed_earnings,
          row.possible_monthly_earnings,
          row.possible_monthly_traffic,
          row.leaderboard_score,
          rank,
          badge,
        ]
      )
    }

    await connection.commit()

    return {
      ok: true,
      month: monthKey,
      date: dateKey,
      total_affiliates: preparedRows.length,
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

async function refreshLeaderboard(req, res) {
  try {
    const result = await refreshLeaderboardData()

    return res.json({
      ok: true,
      message: 'Leaderboard refreshed successfully.',
      ...result,
    })
  } catch (error) {
    console.error('Refresh leaderboard error:', error)

    return res.status(500).json({
      ok: false,
      message: 'Failed to refresh leaderboard.',
    })
  }
}

async function getLeaderboard(req, res) {
  try {
    const month = req.query.month || getMonthKey()
    const limit = Math.min(Number(req.query.limit || 50), 100)

    const adjustedRows = await getAdjustedLeaderboardRows(month)

    const rows = adjustedRows
      .filter((row) => Number(row.is_disqualified || 0) === 0)
      .slice(0, limit)

    return res.json({
      ok: true,
      month,
      leaderboard: rows,
    })
  } catch (error) {
    console.error('Get leaderboard error:', error)

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch leaderboard.',
    })
  }
}

async function getMyLeaderboardRank(req, res) {
  try {
    const affiliateId = normalizeUserId(req)
    const month = req.query.month || getMonthKey()

    if (!affiliateId) {
      return res.status(401).json({
        ok: false,
        message: 'Unauthorized.',
      })
    }

    const adjustedRows = await getAdjustedLeaderboardRows(month)
    const visibleRows = adjustedRows.filter((row) => Number(row.is_disqualified || 0) === 0)
    const myRank = visibleRows.find((row) => Number(row.affiliate_id) === Number(affiliateId)) || null

    let pointsAwayFromTop50 = 0

    if (myRank && Number(myRank.current_rank || 0) > 50) {
      const top50 = visibleRows.find((row) => Number(row.current_rank) === 50)

      if (top50) {
        pointsAwayFromTop50 = Math.max(
          Number(top50.leaderboard_score || 0) - Number(myRank.leaderboard_score || 0),
          0
        )
      }
    }

    return res.json({
      ok: true,
      month,
      rank: myRank,
      points_away_from_top_50: pointsAwayFromTop50,
    })
  } catch (error) {
    console.error('Get my leaderboard rank error:', error)

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch your leaderboard rank.',
    })
  }
}

module.exports = {
  refreshLeaderboardData,
  refreshLeaderboard,
  getLeaderboard,
  getMyLeaderboardRank,
  getAdjustedLeaderboardRows,
}