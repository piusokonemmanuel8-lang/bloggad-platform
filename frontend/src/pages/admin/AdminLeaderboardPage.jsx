import { useEffect, useMemo, useState } from 'react'
import {
  clearLeaderboardAdjustment,
  disqualifyLeaderboardAffiliate,
  fetchAdminLeaderboard,
  refreshAdminLeaderboard,
  restoreLeaderboardAffiliate,
  saveLeaderboardAdjustment,
} from '../../api/adminLeaderboardApi'
import './AdminLeaderboardPage.css'

const PAGE_SIZE = 20

function formatNumber(value) {
  return Number(value || 0).toLocaleString()
}

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatCompactNumber(value) {
  const number = Number(value || 0)

  if (number < 1000) return formatNumber(number)

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

function buildAdjustmentForm(item) {
  const adjustment = item?.adjustment || {}

  return {
    traffic_adjustment: adjustment.traffic_adjustment || 0,
    cta_clicks_adjustment: adjustment.cta_clicks_adjustment || 0,
    product_clicks_adjustment: adjustment.product_clicks_adjustment || 0,
    published_posts_adjustment: adjustment.published_posts_adjustment || 0,
    earnings_adjustment: adjustment.earnings_adjustment || 0,
    score_adjustment: adjustment.score_adjustment || 0,
    reason: adjustment.reason || '',
  }
}

export default function AdminLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([])
  const [month, setMonth] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [adjustmentForm, setAdjustmentForm] = useState(buildAdjustmentForm(null))
  const [savingAdjustment, setSavingAdjustment] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadLeaderboard() {
    try {
      setLoading(true)
      setError('')

      const data = await fetchAdminLeaderboard({ limit: 5000 })

      setLeaderboard(data.leaderboard || [])
      setMonth(data.month || '')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load admin leaderboard.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRefresh() {
    try {
      setRefreshing(true)
      setError('')
      setSuccess('')

      await refreshAdminLeaderboard()
      await loadLeaderboard()

      setSuccess('Leaderboard refreshed successfully.')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to refresh leaderboard.')
    } finally {
      setRefreshing(false)
    }
  }

  function openAdjustmentModal(item) {
    setEditingItem(item)
    setAdjustmentForm(buildAdjustmentForm(item))
    setError('')
    setSuccess('')
  }

  function closeAdjustmentModal() {
    setEditingItem(null)
    setAdjustmentForm(buildAdjustmentForm(null))
    setSavingAdjustment(false)
  }

  function updateAdjustmentField(name, value) {
    setAdjustmentForm((prev) => ({
      ...prev,
      [name]: name === 'reason' ? value : Number(value || 0),
    }))
  }

  async function handleSaveAdjustment() {
    if (!editingItem) return

    try {
      setSavingAdjustment(true)
      setError('')
      setSuccess('')

      await saveLeaderboardAdjustment(editingItem.affiliate_id, {
        month,
        ...adjustmentForm,
      })

      await loadLeaderboard()
      setSuccess('Leaderboard adjustment saved.')
      closeAdjustmentModal()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save leaderboard adjustment.')
    } finally {
      setSavingAdjustment(false)
    }
  }

  async function handleClearAdjustment() {
    if (!editingItem) return

    const confirmed = window.confirm('Clear this affiliate adjustment and return to original automatic values?')
    if (!confirmed) return

    try {
      setSavingAdjustment(true)
      setError('')
      setSuccess('')

      await clearLeaderboardAdjustment(editingItem.affiliate_id, { month })

      await loadLeaderboard()
      setSuccess('Leaderboard adjustment cleared.')
      closeAdjustmentModal()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to clear leaderboard adjustment.')
    } finally {
      setSavingAdjustment(false)
    }
  }

  async function handleDisqualify(item) {
    const reason = window.prompt(
      `Reason for disqualifying ${item.name || item.full_name || item.email || 'this affiliate'}?`,
      'Suspicious or spam activity'
    )

    if (!reason) return

    try {
      setActionLoadingId(item.affiliate_id)
      setError('')
      setSuccess('')

      await disqualifyLeaderboardAffiliate(item.affiliate_id, {
        month,
        reason,
      })

      await loadLeaderboard()
      setSuccess('Affiliate disqualified from leaderboard.')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to disqualify affiliate.')
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleRestore(item) {
    try {
      setActionLoadingId(item.affiliate_id)
      setError('')
      setSuccess('')

      await restoreLeaderboardAffiliate(item.affiliate_id, {
        month,
      })

      await loadLeaderboard()
      setSuccess('Affiliate restored to leaderboard.')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to restore affiliate.')
    } finally {
      setActionLoadingId(null)
    }
  }

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const filteredLeaderboard = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) return leaderboard

    return leaderboard.filter((item) => {
      const name = String(item.name || item.full_name || '').toLowerCase()
      const email = String(item.email || '').toLowerCase()
      const affiliateId = String(item.affiliate_id || '').toLowerCase()

      return name.includes(query) || email.includes(query) || affiliateId.includes(query)
    })
  }, [leaderboard, searchTerm])

  const totalPages = Math.max(Math.ceil(filteredLeaderboard.length / PAGE_SIZE), 1)

  const paginatedLeaderboard = useMemo(() => {
    const safePage = Math.min(Math.max(currentPage, 1), totalPages)
    const start = (safePage - 1) * PAGE_SIZE

    return filteredLeaderboard.slice(start, start + PAGE_SIZE)
  }, [filteredLeaderboard, currentPage, totalPages])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const stats = useMemo(() => {
    const totalAffiliates = leaderboard.length
    const activeAffiliates = leaderboard.filter((item) => !item.is_disqualified).length
    const adjustedAffiliates = leaderboard.filter((item) => item.has_admin_adjustment).length
    const disqualifiedAffiliates = leaderboard.filter((item) => item.is_disqualified).length
    const totalScore = leaderboard.reduce(
      (sum, item) => sum + Number(item.leaderboard_score || 0),
      0
    )

    return {
      totalAffiliates,
      activeAffiliates,
      adjustedAffiliates,
      disqualifiedAffiliates,
      totalScore,
    }
  }, [leaderboard])

  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages)

  return (
    <div className="admin-lb-page">
      <div className="admin-lb-hero">
        <div>
          <p className="admin-lb-kicker">Admin Control</p>
          <h1>Bloggad Monthly Leaderboard</h1>
          <p>
            View all affiliates, refresh rankings, adjust suspicious spikes for one affiliate,
            and keep original analytics untouched.
          </p>
        </div>

        <button
          type="button"
          className="admin-lb-refresh-btn"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Leaderboard'}
        </button>
      </div>

      {error ? <div className="admin-lb-alert admin-lb-error">{error}</div> : null}
      {success ? <div className="admin-lb-alert admin-lb-success">{success}</div> : null}

      <div className="admin-lb-stats">
        <div>
          <span>Total Ranked</span>
          <strong>{formatCompactNumber(stats.totalAffiliates)}</strong>
        </div>

        <div>
          <span>Visible Affiliates</span>
          <strong>{formatCompactNumber(stats.activeAffiliates)}</strong>
        </div>

        <div>
          <span>Adjusted</span>
          <strong>{formatCompactNumber(stats.adjustedAffiliates)}</strong>
        </div>

        <div>
          <span>Total Score</span>
          <strong title={formatNumber(stats.totalScore)}>{formatCompactNumber(stats.totalScore)}</strong>
        </div>
      </div>

      <div className="admin-lb-table-card">
        <div className="admin-lb-table-head admin-lb-table-head-tools">
          <div>
            <h2>Full Leaderboard</h2>
            <p>
              {month || 'Current Month'} · Showing {paginatedLeaderboard.length} of {filteredLeaderboard.length} affiliates
            </p>
          </div>

          <div className="admin-lb-search-wrap">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, email, or ID"
            />
          </div>
        </div>

        {loading ? (
          <div className="admin-lb-empty">Loading leaderboard...</div>
        ) : filteredLeaderboard.length === 0 ? (
          <div className="admin-lb-empty">
            No leaderboard record found.
          </div>
        ) : (
          <>
            <div className="admin-lb-table-wrap">
              <table className="admin-lb-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Affiliate</th>
                    <th>Traffic</th>
                    <th>CTA</th>
                    <th>Product Clicks</th>
                    <th>Posts</th>
                    <th>Earnings</th>
                    <th>Score</th>
                    <th>Adjustment</th>
                    <th>Status</th>
                    <th>Control</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedLeaderboard.map((item) => (
                    <tr
                      key={item.id}
                      className={item.is_disqualified ? 'admin-lb-row-muted' : ''}
                    >
                      <td>
                        <span className="admin-lb-rank">#{item.current_rank || '-'}</span>
                      </td>

                      <td>
                        <div className="admin-lb-user">
                          <div className="admin-lb-avatar">
                            {(item.name || item.full_name || 'A').charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {item.name || item.full_name || `Affiliate ${item.affiliate_id}`}
                            </strong>
                            <span>{item.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <strong>{formatCompactNumber(item.monthly_traffic)}</strong>
                        {item.has_admin_adjustment ? (
                          <small>Original: {formatCompactNumber(item.original_monthly_traffic)}</small>
                        ) : null}
                      </td>

                      <td>
                        <strong>{formatCompactNumber(item.cta_clicks)}</strong>
                        {item.has_admin_adjustment ? (
                          <small>Original: {formatCompactNumber(item.original_cta_clicks)}</small>
                        ) : null}
                      </td>

                      <td>
                        <strong>{formatCompactNumber(item.product_clicks)}</strong>
                        {item.has_admin_adjustment ? (
                          <small>Original: {formatCompactNumber(item.original_product_clicks)}</small>
                        ) : null}
                      </td>

                      <td>
                        <strong>{formatCompactNumber(item.published_posts)}</strong>
                        {item.has_admin_adjustment ? (
                          <small>Original: {formatCompactNumber(item.original_published_posts)}</small>
                        ) : null}
                      </td>

                      <td>
                        <strong>{formatMoney(item.confirmed_earnings)}</strong>
                        {item.has_admin_adjustment ? (
                          <small>Original: {formatMoney(item.original_confirmed_earnings)}</small>
                        ) : null}
                      </td>

                      <td>
                        <strong title={formatNumber(item.leaderboard_score)}>
                          {formatCompactNumber(item.leaderboard_score)}
                        </strong>
                        {item.has_admin_adjustment ? (
                          <small>
                            Original: {formatCompactNumber(item.original_leaderboard_score)}
                          </small>
                        ) : null}
                      </td>

                      <td>
                        {item.has_admin_adjustment ? (
                          <span className="admin-lb-status admin-lb-status-warn">
                            Adjusted
                          </span>
                        ) : (
                          <span className="admin-lb-status admin-lb-status-good">
                            Auto
                          </span>
                        )}
                        {item.adjustment?.reason ? <small>{item.adjustment.reason}</small> : null}
                      </td>

                      <td>
                        {item.is_disqualified ? (
                          <span className="admin-lb-status admin-lb-status-bad">
                            Disqualified
                          </span>
                        ) : (
                          <span className="admin-lb-status admin-lb-status-good">
                            Visible
                          </span>
                        )}

                        {item.disqualified_reason ? <small>{item.disqualified_reason}</small> : null}
                      </td>

                      <td>
                        <div className="admin-lb-actions">
                          <button
                            type="button"
                            className="admin-lb-action admin-lb-edit"
                            onClick={() => openAdjustmentModal(item)}
                          >
                            Edit
                          </button>

                          {item.is_disqualified ? (
                            <button
                              type="button"
                              className="admin-lb-action admin-lb-restore"
                              disabled={actionLoadingId === item.affiliate_id}
                              onClick={() => handleRestore(item)}
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="admin-lb-action admin-lb-disqualify"
                              disabled={actionLoadingId === item.affiliate_id}
                              onClick={() => handleDisqualify(item)}
                            >
                              Disqualify
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-lb-pagination">
              <div>
                Page {safeCurrentPage} of {totalPages}
              </div>

              <div className="admin-lb-pagination-actions">
                <button
                  type="button"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {editingItem ? (
        <div className="admin-lb-modal-backdrop">
          <div className="admin-lb-modal">
            <div className="admin-lb-modal-head">
              <div>
                <p>Edit One Affiliate Only</p>
                <h2>{editingItem.name || editingItem.full_name || `Affiliate ${editingItem.affiliate_id}`}</h2>
              </div>

              <button type="button" onClick={closeAdjustmentModal}>
                ×
              </button>
            </div>

            <div className="admin-lb-original-grid">
              <div>
                <span>Original Traffic</span>
                <strong>{formatCompactNumber(editingItem.original_monthly_traffic ?? editingItem.monthly_traffic)}</strong>
              </div>
              <div>
                <span>Original CTA</span>
                <strong>{formatCompactNumber(editingItem.original_cta_clicks ?? editingItem.cta_clicks)}</strong>
              </div>
              <div>
                <span>Original Product Clicks</span>
                <strong>{formatCompactNumber(editingItem.original_product_clicks ?? editingItem.product_clicks)}</strong>
              </div>
              <div>
                <span>Original Earnings</span>
                <strong>{formatMoney(editingItem.original_confirmed_earnings ?? editingItem.confirmed_earnings)}</strong>
              </div>
            </div>

            <div className="admin-lb-form-grid">
              <label>
                Traffic Adjustment
                <input
                  type="number"
                  value={adjustmentForm.traffic_adjustment}
                  onChange={(e) => updateAdjustmentField('traffic_adjustment', e.target.value)}
                  placeholder="-100"
                />
              </label>

              <label>
                CTA Clicks Adjustment
                <input
                  type="number"
                  value={adjustmentForm.cta_clicks_adjustment}
                  onChange={(e) => updateAdjustmentField('cta_clicks_adjustment', e.target.value)}
                  placeholder="-50"
                />
              </label>

              <label>
                Product Clicks Adjustment
                <input
                  type="number"
                  value={adjustmentForm.product_clicks_adjustment}
                  onChange={(e) => updateAdjustmentField('product_clicks_adjustment', e.target.value)}
                  placeholder="-50"
                />
              </label>

              <label>
                Posts Adjustment
                <input
                  type="number"
                  value={adjustmentForm.published_posts_adjustment}
                  onChange={(e) => updateAdjustmentField('published_posts_adjustment', e.target.value)}
                  placeholder="0"
                />
              </label>

              <label>
                Earnings Adjustment ($)
                <input
                  type="number"
                  step="0.00000001"
                  value={adjustmentForm.earnings_adjustment}
                  onChange={(e) => updateAdjustmentField('earnings_adjustment', e.target.value)}
                  placeholder="-0.05"
                />
              </label>

              <label>
                Extra Score Adjustment
                <input
                  type="number"
                  step="0.01"
                  value={adjustmentForm.score_adjustment}
                  onChange={(e) => updateAdjustmentField('score_adjustment', e.target.value)}
                  placeholder="-300"
                />
              </label>
            </div>

            <label className="admin-lb-reason-label">
              Reason
              <textarea
                value={adjustmentForm.reason}
                onChange={(e) => updateAdjustmentField('reason', e.target.value)}
                placeholder="Example: suspicious traffic spike after investigation"
              />
            </label>

            <div className="admin-lb-modal-note">
              Use negative numbers to reduce values. Example: traffic adjustment -126 changes 526 to 400.
              Original analytics remain untouched.
            </div>

            <div className="admin-lb-modal-actions">
              <button type="button" className="admin-lb-modal-cancel" onClick={closeAdjustmentModal}>
                Cancel
              </button>

              <button
                type="button"
                className="admin-lb-modal-clear"
                onClick={handleClearAdjustment}
                disabled={savingAdjustment || !editingItem.has_admin_adjustment}
              >
                Clear Adjustment
              </button>

              <button
                type="button"
                className="admin-lb-modal-save"
                onClick={handleSaveAdjustment}
                disabled={savingAdjustment}
              >
                {savingAdjustment ? 'Saving...' : 'Save Adjustment'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}