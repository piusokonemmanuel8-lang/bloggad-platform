const { refreshLeaderboardData } = require('../controllers/affiliate/affiliateLeaderboardController')

let leaderboardJobStarted = false
let leaderboardJobTimer = null

function getMillisecondsUntilNextRun(hour = 1, minute = 0) {
  const now = new Date()
  const nextRun = new Date(now)

  nextRun.setHours(hour, minute, 0, 0)

  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1)
  }

  return nextRun.getTime() - now.getTime()
}

async function runLeaderboardRefresh(reason = 'scheduled') {
  try {
    console.log(`[leaderboard-job] Running leaderboard refresh: ${reason}`)

    const result = await refreshLeaderboardData()

    console.log(
      `[leaderboard-job] Completed leaderboard refresh for ${result.month}. Total affiliates: ${result.total_affiliates}`
    )
  } catch (error) {
    console.error('[leaderboard-job] Failed to refresh leaderboard:', error.message)
  }
}

function scheduleNextLeaderboardRefresh() {
  const delay = getMillisecondsUntilNextRun(1, 0)

  leaderboardJobTimer = setTimeout(async () => {
    await runLeaderboardRefresh('daily_auto')

    leaderboardJobTimer = setInterval(async () => {
      await runLeaderboardRefresh('daily_auto')
    }, 24 * 60 * 60 * 1000)
  }, delay)

  console.log('[leaderboard-job] Daily leaderboard refresh scheduled for 1:00 AM server time')
}

function startLeaderboardDailyJob() {
  if (leaderboardJobStarted) return

  leaderboardJobStarted = true

  runLeaderboardRefresh('server_startup')
  scheduleNextLeaderboardRefresh()
}

function stopLeaderboardDailyJob() {
  if (leaderboardJobTimer) {
    clearTimeout(leaderboardJobTimer)
    clearInterval(leaderboardJobTimer)
  }

  leaderboardJobStarted = false
  leaderboardJobTimer = null
}

module.exports = {
  startLeaderboardDailyJob,
  stopLeaderboardDailyJob,
  runLeaderboardRefresh,
}