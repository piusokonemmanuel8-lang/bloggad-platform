import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
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

function getWriterRankTone(rank) {
  if (rank === 1) return 'gold'
  if (rank === 2) return 'silver'
  if (rank === 3) return 'bronze'
  return 'standard'
}

function getWriterName(item) {
  return item?.full_name || item?.name || `Writer ${item?.affiliate_id || ''}`.trim()
}

function WriterMetric({ label, value, helper }) {
  return (
    <article className="writer-lb-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{helper}</small>
    </article>
  )
}

export default function AffiliateLeaderboardPage() {
  const location = useLocation()
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
  const isWriterRoute = location.pathname === '/writer/leaderboard'

  if (isWriterRoute) {
    const rankValue = myRank?.current_rank ? `#${myRank.current_rank}` : '#--'
    const scoreValue = myRank ? formatCompactNumber(myRank.leaderboard_score) : '--'
    const earningsValue = myRank ? formatMoney(myRank.possible_monthly_earnings) : '$--'
    const badgeValue = myRank?.badge || 'Keep Climbing'

    return (
      <div className="writer-lb-page">
        <style>{writerLeaderboardStyles}</style>

        <div className="writer-lb-mobile-title">Leaderboard</div>

        <section className="writer-lb-month-bar">
          <div>
            <strong className="writer-lb-desktop-month">Bloggad Monthly Leaderboard</strong>
            <strong className="writer-lb-mobile-month">Monthly Leaderboard</strong>
            <span>{month || 'Current month'} - rankings update automatically each day</span>
          </div>

          <span className="writer-lb-auto-pill">
            <span className="writer-lb-desktop-auto">Daily Auto Ranking</span>
            <span className="writer-lb-mobile-auto">Daily Auto</span>
          </span>
        </section>

        {error ? <div className="writer-lb-error">{error}</div> : null}

        <section className="writer-lb-metrics">
          <WriterMetric
            label="Your Rank This Month"
            value={rankValue}
            helper="Monthly position"
          />
          <WriterMetric
            label="Your Score"
            value={scoreValue}
            helper="Leaderboard score"
          />
          <WriterMetric
            label="Possible Monthly Earnings"
            value={earningsValue}
            helper="Current estimate"
          />
          <WriterMetric
            label="Badge"
            value={badgeValue}
            helper="Current badge"
          />
        </section>

        {myRank && Number(myRank.current_rank || 0) > 50 ? (
          <div className="writer-lb-progress">
            You are {formatCompactNumber(pointsAway)} points away from entering the Top 50.
          </div>
        ) : null}

        {!loading && topThree.length > 0 ? (
          <section className="writer-lb-podium">
            {topThree.map((item) => (
              <article
                key={item.id}
                className={`writer-lb-podium-card ${getWriterRankTone(Number(item.current_rank))}`}
              >
                <span className="writer-lb-podium-rank">#{item.current_rank}</span>
                <div>
                  <strong>{getWriterName(item)}</strong>
                  <span>{item.badge}</span>
                  <b title={formatNumber(item.leaderboard_score)}>
                    {formatCompactNumber(item.leaderboard_score)} pts
                  </b>
                </div>
              </article>
            ))}
          </section>
        ) : null}

        <section className="writer-lb-list-card">
          <header className="writer-lb-list-heading">
            <div>
              <strong>Leaderboard</strong>
              <span>{month || 'Current Month'}</span>
            </div>
            <span className="writer-lb-top-pill">Top 50</span>
          </header>

          {loading ? (
            <div className="writer-lb-state">Loading leaderboard...</div>
          ) : leaderboard.length === 0 ? (
            <div className="writer-lb-state">
              No leaderboard data yet. The system will generate rankings automatically.
            </div>
          ) : (
            <>
              <div className="writer-lb-desktop-table-wrap">
                <table className="writer-lb-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Writer</th>
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
                          <span className={`writer-lb-rank-chip ${getWriterRankTone(Number(item.current_rank))}`}>
                            #{item.current_rank}
                          </span>
                        </td>
                        <td>
                          <div className="writer-lb-user">
                            <div className="writer-lb-avatar">
                              {getWriterName(item).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong>{getWriterName(item)}</strong>
                              <span>{item.email || '-'}</span>
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
                          <span className="writer-lb-badge">{item.badge}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="writer-lb-mobile-list">
                {leaderboard.map((item) => (
                  <article className="writer-lb-mobile-card" key={item.id}>
                    <div className="writer-lb-mobile-card-head">
                      <div className="writer-lb-mobile-writer">
                        <span className={`writer-lb-rank-chip ${getWriterRankTone(Number(item.current_rank))}`}>
                          #{item.current_rank}
                        </span>
                        <div>
                          <strong>{getWriterName(item)}</strong>
                          <small>{item.email || '-'}</small>
                        </div>
                      </div>

                      <span className="writer-lb-badge">{item.badge}</span>
                    </div>

                    <div className="writer-lb-mobile-details">
                      <div>
                        <span>Traffic</span>
                        <strong>{formatCompactNumber(item.monthly_traffic)}</strong>
                      </div>
                      <div>
                        <span>CTA Clicks</span>
                        <strong>{formatCompactNumber(item.cta_clicks)}</strong>
                      </div>
                      <div>
                        <span>Product Clicks</span>
                        <strong>{formatCompactNumber(item.product_clicks)}</strong>
                      </div>
                      <div>
                        <span>Possible Earnings</span>
                        <strong>{formatMoney(item.possible_monthly_earnings)}</strong>
                      </div>
                      <div>
                        <span>Score</span>
                        <strong title={formatNumber(item.leaderboard_score)}>
                          {formatCompactNumber(item.leaderboard_score)}
                        </strong>
                      </div>
                      <div>
                        <span>Month</span>
                        <strong>{month || 'Current'}</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    )
  }

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

const writerLeaderboardStyles = `
  * {
    box-sizing: border-box;
  }

  .writer-lb-page {
    width: 100%;
    min-width: 0;
    color: #161a20;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .writer-lb-mobile-title,
  .writer-lb-mobile-month,
  .writer-lb-mobile-auto,
  .writer-lb-mobile-list {
    display: none;
  }

  .writer-lb-month-bar,
  .writer-lb-metric,
  .writer-lb-podium-card,
  .writer-lb-list-card,
  .writer-lb-mobile-card {
    background: #ffffff;
    border: 1px solid #e3e6ea;
    box-shadow: none;
  }

  .writer-lb-month-bar {
    min-height: 64px;
    margin-bottom: 12px;
    padding: 12px 14px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .writer-lb-month-bar > div {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .writer-lb-month-bar strong {
    color: #161a20;
    font-size: 12px;
    line-height: 1.3;
    font-weight: 600;
  }

  .writer-lb-month-bar > div > span {
    color: #68707c;
    font-size: 10px;
    line-height: 1.4;
  }

  .writer-lb-auto-pill {
    min-height: 28px;
    padding: 0 14px;
    border: 1px solid #abefc6;
    border-radius: 999px;
    background: #ecfdf3;
    color: #027a48;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    line-height: 1;
    font-weight: 600;
    white-space: nowrap;
  }

  .writer-lb-error {
    margin-bottom: 12px;
    padding: 11px 13px;
    border: 1px solid #fecdca;
    border-radius: 10px;
    background: #fef3f2;
    color: #b42318;
    font-size: 12px;
    line-height: 1.45;
    font-weight: 600;
  }

  .writer-lb-metrics {
    margin-bottom: 12px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .writer-lb-metric {
    min-width: 0;
    min-height: 88px;
    padding: 13px 14px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .writer-lb-metric > span {
    color: #68707c;
    font-size: 11px;
    line-height: 1.25;
    font-weight: 600;
  }

  .writer-lb-metric > strong {
    min-width: 0;
    color: #161a20;
    font-size: 22px;
    line-height: 1.08;
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  .writer-lb-metric > small {
    margin-top: auto;
    color: #98a2b3;
    font-size: 10px;
    line-height: 1.3;
  }

  .writer-lb-progress {
    min-height: 46px;
    margin-bottom: 12px;
    padding: 0 14px;
    border: 1px solid #b2ddff;
    border-radius: 10px;
    background: #eff8ff;
    color: #175cd3;
    display: flex;
    align-items: center;
    font-size: 11px;
    line-height: 1.4;
    font-weight: 600;
  }

  .writer-lb-podium {
    margin-bottom: 12px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .writer-lb-podium-card {
    min-width: 0;
    min-height: 126px;
    padding: 14px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .writer-lb-podium-card.gold {
    background: #fff8e7;
  }

  .writer-lb-podium-card.silver {
    background: #f3f4f6;
  }

  .writer-lb-podium-card.bronze {
    background: #fff1e8;
  }

  .writer-lb-podium-rank {
    flex: 0 0 auto;
    width: 48px;
    height: 48px;
    border: 1px solid #e3e6ea;
    border-radius: 12px;
    background: #ffffff;
    color: #161a20;
    display: grid;
    place-items: center;
    font-size: 16px;
    line-height: 1;
    font-weight: 700;
  }

  .writer-lb-podium-card > div {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .writer-lb-podium-card > div > strong {
    color: #161a20;
    font-size: 13px;
    line-height: 1.3;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .writer-lb-podium-card > div > span {
    color: #68707c;
    font-size: 10px;
    line-height: 1.3;
  }

  .writer-lb-podium-card > div > b {
    color: #161a20;
    font-size: 12px;
    line-height: 1.3;
    font-weight: 700;
  }

  .writer-lb-list-card {
    min-width: 0;
    padding: 14px;
    border-radius: 12px;
  }

  .writer-lb-list-heading {
    min-height: 38px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .writer-lb-list-heading > div {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .writer-lb-list-heading > div > strong {
    color: #161a20;
    font-size: 14px;
    line-height: 1.3;
    font-weight: 700;
  }

  .writer-lb-list-heading > div > span {
    color: #68707c;
    font-size: 10px;
    line-height: 1.3;
  }

  .writer-lb-top-pill,
  .writer-lb-badge,
  .writer-lb-rank-chip {
    min-height: 28px;
    padding: 0 11px;
    border: 1px solid #e3e6ea;
    border-radius: 999px;
    background: #f8fafc;
    color: #68707c;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    line-height: 1;
    font-weight: 600;
    white-space: nowrap;
  }

  .writer-lb-rank-chip {
    min-width: 46px;
    color: #161a20;
    background: #ffffff;
  }

  .writer-lb-rank-chip.gold {
    background: #fff8e7;
  }

  .writer-lb-rank-chip.silver {
    background: #f3f4f6;
  }

  .writer-lb-rank-chip.bronze {
    background: #fff1e8;
  }

  .writer-lb-state {
    min-height: 180px;
    padding: 24px;
    border: 1px dashed #cbd5e1;
    border-radius: 10px;
    background: #f8fafc;
    color: #68707c;
    display: grid;
    place-items: center;
    text-align: center;
    font-size: 12px;
    line-height: 1.5;
  }

  .writer-lb-desktop-table-wrap {
    width: 100%;
    overflow-x: auto;
  }

  .writer-lb-table {
    width: 100%;
    min-width: 980px;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .writer-lb-table thead {
    background: #f8fafc;
  }

  .writer-lb-table th {
    height: 38px;
    padding: 0 8px;
    color: #68707c;
    font-size: 10px;
    line-height: 1.2;
    font-weight: 700;
    text-align: left;
  }

  .writer-lb-table th:nth-child(1) {
    width: 70px;
  }

  .writer-lb-table th:nth-child(2) {
    width: 220px;
  }

  .writer-lb-table th:nth-child(3),
  .writer-lb-table th:nth-child(4) {
    width: 104px;
  }

  .writer-lb-table th:nth-child(5) {
    width: 120px;
  }

  .writer-lb-table th:nth-child(6) {
    width: 146px;
  }

  .writer-lb-table th:nth-child(7) {
    width: 92px;
  }

  .writer-lb-table th:nth-child(8) {
    width: 145px;
  }

  .writer-lb-table td {
    height: 62px;
    padding: 0 8px;
    border-bottom: 1px solid #e3e6ea;
    color: #68707c;
    font-size: 10px;
    line-height: 1.35;
    vertical-align: middle;
  }

  .writer-lb-table tbody tr:last-child td {
    border-bottom: 0;
  }

  .writer-lb-table td > strong {
    color: #161a20;
    font-size: 10px;
    font-weight: 600;
  }

  .writer-lb-user {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .writer-lb-avatar {
    flex: 0 0 auto;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #1e2329;
    color: #ffffff;
    display: grid;
    place-items: center;
    font-size: 10px;
    font-weight: 700;
  }

  .writer-lb-user > div:last-child {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .writer-lb-user strong {
    color: #161a20;
    font-size: 11px;
    line-height: 1.25;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .writer-lb-user span {
    color: #98a2b3;
    font-size: 9px;
    line-height: 1.25;
    overflow-wrap: anywhere;
  }

  @media (max-width: 767px) {
    .writer-lb-mobile-title {
      min-height: 46px;
      margin-bottom: 10px;
      padding: 0 10px;
      border: 1px solid #e3e6ea;
      border-radius: 10px;
      background: #ffffff;
      color: #161a20;
      display: flex;
      align-items: center;
      font-size: 13px;
      line-height: 1.2;
      font-weight: 600;
    }

    .writer-lb-month-bar {
      min-height: 74px;
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 10px;
    }

    .writer-lb-desktop-month,
    .writer-lb-desktop-auto,
    .writer-lb-desktop-table-wrap {
      display: none;
    }

    .writer-lb-mobile-month,
    .writer-lb-mobile-auto,
    .writer-lb-mobile-list {
      display: block;
    }

    .writer-lb-month-bar strong {
      font-size: 11px;
    }

    .writer-lb-month-bar > div > span {
      max-width: 180px;
      font-size: 9px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .writer-lb-auto-pill {
      min-height: 28px;
      padding: 0 12px;
      font-size: 10px;
    }

    .writer-lb-error {
      margin-bottom: 10px;
      font-size: 10px;
    }

    .writer-lb-metrics {
      margin-bottom: 10px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .writer-lb-metric {
      min-height: 82px;
      padding: 11px 12px;
      border-radius: 10px;
    }

    .writer-lb-metric > span {
      font-size: 10px;
    }

    .writer-lb-metric > strong {
      font-size: 20px;
    }

    .writer-lb-metric > small {
      font-size: 9px;
    }

    .writer-lb-progress {
      min-height: 48px;
      margin-bottom: 10px;
      padding: 0 10px;
      font-size: 9px;
    }

    .writer-lb-podium {
      margin-bottom: 10px;
      gap: 6px;
    }

    .writer-lb-podium-card {
      min-height: 108px;
      padding: 9px;
      border-radius: 10px;
      display: block;
    }

    .writer-lb-podium-rank {
      width: auto;
      height: auto;
      margin-bottom: 6px;
      border: 0;
      border-radius: 0;
      background: transparent;
      display: block;
      font-size: 13px;
    }

    .writer-lb-podium-card > div {
      gap: 4px;
    }

    .writer-lb-podium-card > div > strong {
      font-size: 10px;
    }

    .writer-lb-podium-card > div > span {
      font-size: 8px;
    }

    .writer-lb-podium-card > div > b {
      font-size: 9px;
    }

    .writer-lb-list-card {
      padding: 10px;
      border-radius: 10px;
    }

    .writer-lb-list-heading {
      min-height: 34px;
      margin-bottom: 8px;
    }

    .writer-lb-list-heading > div > strong {
      font-size: 12px;
    }

    .writer-lb-list-heading > div > span {
      display: none;
    }

    .writer-lb-top-pill,
    .writer-lb-badge,
    .writer-lb-rank-chip {
      min-height: 28px;
      padding: 0 10px;
      font-size: 10px;
    }

    .writer-lb-state {
      min-height: 140px;
      padding: 18px;
      font-size: 10px;
    }

    .writer-lb-mobile-list {
      display: grid;
      gap: 8px;
    }

    .writer-lb-mobile-card {
      padding: 10px;
      border-radius: 9px;
      background: #f8fafc;
    }

    .writer-lb-mobile-card-head {
      min-width: 0;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .writer-lb-mobile-writer {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .writer-lb-mobile-writer > div {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .writer-lb-mobile-writer strong {
      color: #161a20;
      font-size: 11px;
      line-height: 1.25;
      font-weight: 600;
      overflow-wrap: anywhere;
    }

    .writer-lb-mobile-writer small {
      max-width: 140px;
      color: #98a2b3;
      font-size: 8px;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .writer-lb-mobile-details {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;
    }

    .writer-lb-mobile-details > div {
      min-width: 0;
      min-height: 42px;
      padding: 4px 6px;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .writer-lb-mobile-details span {
      color: #98a2b3;
      font-size: 8px;
      line-height: 1.2;
    }

    .writer-lb-mobile-details strong {
      color: #161a20;
      font-size: 10px;
      line-height: 1.25;
      font-weight: 600;
      overflow-wrap: anywhere;
    }
  }
`
