import { useEffect, useMemo, useState } from 'react'
import './AffiliateLeaderboardPage.css'
import {
  fetchAffiliateLeaderboard,
  fetchMyLeaderboardRank,
} from '../../api/affiliateLeaderboardApi'

function formatNumber(value) {
  return Number(value || 0).toLocaleString()
}

function formatCompactNumber(value) {
  const number = Number(value || 0)

  if (number < 1000) {
    return formatNumber(number)
  }

  const units = [
    { value: 1_000_000_000_000, suffix: 't' },
    { value: 1_000_000_000, suffix: 'b' },
    { value: 1_000_000, suffix: 'm' },
    { value: 1_000, suffix: 'k' },
  ]

  const unit = units.find((item) => number >= item.value)

  if (!unit) return formatNumber(number)

  const compact = Math.floor((number / unit.value) * 10) / 10

  return `${compact.toLocaleString(undefined, {
    minimumFractionDigits: compact % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  })}${unit.suffix}`
}

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function getRankClass(rank) {
  if (rank === 1) return 'ali-lb-rank ali-lb-rank-gold'
  if (rank === 2) return 'ali-lb-rank ali-lb-rank-silver'
  if (rank === 3) return 'ali-lb-rank ali-lb-rank-bronze'
  return 'ali-lb-rank'
}

export default function AffiliateLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [pointsAway, setPointsAway] = useState(0)
  const [month, setMonth] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadLeaderboard() {
    try {
      setLoading(true)
      setError('')

      const [leaderboardRes, myRankRes] = await Promise.all([
        fetchAffiliateLeaderboard({ limit: 50 }),
        fetchMyLeaderboardRank(),
      ])

      setLeaderboard(leaderboardRes.leaderboard || [])
      setMonth(leaderboardRes.month || '')
      setMyRank(myRankRes.rank || null)
      setPointsAway(myRankRes.points_away_from_top_50 || 0)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Failed to load leaderboard. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const topThree = useMemo(() => leaderboard.slice(0, 3), [leaderboard])

  return (
    <div className="ali-lb-page">
      <div className="ali-lb-hero">
        <div>
          <p className="ali-lb-kicker">Bloggad Monthly Leaderboard</p>
          <h1>Top 50 Affiliates This Month</h1>
          <p className="ali-lb-subtitle">
            Rankings update daily from real traffic, clicks, posts, and BlogPulse monetization earnings.
          </p>
        </div>

        <div className="ali-lb-auto-pill">Daily Auto Ranking</div>
      </div>

      {error ? <div className="ali-lb-error">{error}</div> : null}

      {myRank ? (
        <div className="ali-lb-my-rank">
          <div>
            <span>Your Rank This Month</span>
            <strong>#{myRank.current_rank || '-'}</strong>
          </div>

          <div>
            <span>Your Score</span>
            <strong title={formatNumber(myRank.leaderboard_score)}>
              {formatCompactNumber(myRank.leaderboard_score)}
            </strong>
          </div>

          <div>
            <span>Possible Monthly Earnings</span>
            <strong>{formatMoney(myRank.possible_monthly_earnings)}</strong>
          </div>

          <div>
            <span>Badge</span>
            <strong>{myRank.badge || 'Keep Climbing'}</strong>
          </div>
        </div>
      ) : null}

      {myRank && Number(myRank.current_rank || 0) > 50 ? (
        <div className="ali-lb-encourage">
          You are {formatCompactNumber(pointsAway)} points away from entering the Top 50.
        </div>
      ) : null}

      {!loading && topThree.length > 0 ? (
        <div className="ali-lb-podium">
          {topThree.map((item) => (
            <div key={item.id} className="ali-lb-podium-card">
              <div className={getRankClass(Number(item.current_rank))}>
                #{item.current_rank}
              </div>

              <h3>{item.full_name || item.name || `Affiliate ${item.affiliate_id}`}</h3>
              <p>{item.badge}</p>
              <strong title={formatNumber(item.leaderboard_score)}>
                {formatCompactNumber(item.leaderboard_score)} pts
              </strong>
            </div>
          ))}
        </div>
      ) : null}

      <div className="ali-lb-table-card">
        <div className="ali-lb-table-head">
          <div>
            <h2>Leaderboard</h2>
            <p>{month || 'Current Month'}</p>
          </div>
        </div>

        {loading ? (
          <div className="ali-lb-empty">Loading leaderboard...</div>
        ) : leaderboard.length === 0 ? (
          <div className="ali-lb-empty">
            No leaderboard data yet. The system will generate rankings automatically.
          </div>
        ) : (
          <div className="ali-lb-table-wrap">
            <table className="ali-lb-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Affiliate</th>
                  <th>Traffic</th>
                  <th>CTA Clicks</th>
                  <th>Product Clicks</th>
                  <th>Possible Earnings</th>
                  <th>Score</th>
                  <th>Badge</th>
                </tr>
              </thead>

              <tbody>
                {leaderboard.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className={getRankClass(Number(item.current_rank))}>
                        #{item.current_rank}
                      </span>
                    </td>

                    <td>
                      <div className="ali-lb-user">
                        <div className="ali-lb-avatar">
                          {(item.full_name || item.name || 'A').charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {item.full_name || item.name || `Affiliate ${item.affiliate_id}`}
                          </strong>
                          <span>{item.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>{formatCompactNumber(item.monthly_traffic)}</td>
                    <td>{formatCompactNumber(item.cta_clicks)}</td>
                    <td>{formatCompactNumber(item.product_clicks)}</td>
                    <td>{formatMoney(item.possible_monthly_earnings)}</td>

                    <td>
                      <strong title={formatNumber(item.leaderboard_score)}>
                        {formatCompactNumber(item.leaderboard_score)}
                      </strong>
                    </td>

                    <td>
                      <span className="ali-lb-badge">{item.badge}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}