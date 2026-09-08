// BLOGGAD_PRO_POST_ANALYTICS_V1
import {
  BarChart3,
  Clock3,
  Globe2,
  Link2,
  MousePointerClick,
  Smartphone,
  Users,
  X,
} from 'lucide-react';

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Number(value || 0));
}

function formatSeconds(value) {
  const seconds = Math.max(0, Math.round(Number(value || 0)));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  if (!minutes) return `${remainder}s`;
  if (!remainder) return `${minutes}m`;
  return `${minutes}m ${remainder}s`;
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function countryName(code) {
  const value = String(code || 'ZZ').toUpperCase();
  if (value === 'ZZ') return 'Unknown';

  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return displayNames.of(value) || value;
  } catch (error) {
    return value;
  }
}

function Metric({ label, value, hint, icon: Icon }) {
  return (
    <article className="wpa-metric">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {hint ? <small>{hint}</small> : null}
      </div>
      <Icon size={17} />
    </article>
  );
}

function Breakdown({ title, rows, labelFor = (row) => row.label }) {
  return (
    <section className="wpa-section">
      <div className="wpa-section-head">
        <h3>{title}</h3>
      </div>

      {rows?.length ? (
        <div className="wpa-breakdown">
          {rows.map((row, index) => (
            <div className="wpa-breakdown-row" key={`${labelFor(row)}-${index}`}>
              <div>
                <strong>{labelFor(row)}</strong>
                <span>{formatNumber(row.readers || row.clicks || 0)}</span>
              </div>
              <div className="wpa-bar">
                <span style={{ width: `${Math.max(2, Number(row.percent || 0))}%` }} />
              </div>
              <b>{formatPercent(row.percent || 0)}</b>
            </div>
          ))}
        </div>
      ) : (
        <div className="wpa-empty">No data yet.</div>
      )}
    </section>
  );
}

export default function WriterPostAnalyticsDrawer({
  post,
  data,
  loading,
  error,
  onClose,
  onRetry,
}) {
  if (!post) return null;

  const analytics = data?.post_analytics || null;
  const access = analytics?.access || null;
  const advanced = analytics?.advanced || null;
  const summary = advanced?.summary || {};
  const funnel = advanced?.completion_funnel || {};
  const readerTypes = advanced?.reader_types || {};
  const links = Array.isArray(advanced?.links) ? advanced.links : [];

  return (
    <div className="wpa-backdrop" onMouseDown={onClose}>
      <style>{styles}</style>

      <aside
        className="wpa-drawer"
        onMouseDown={(event) => event.stopPropagation()}
        aria-label="Post analytics"
      >
        <header className="wpa-head">
          <div>
            <span>Post Analytics</span>
            <h2>{analytics?.post?.title || post?.title || 'Post'}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close analytics">
            <X size={18} />
          </button>
        </header>

        {loading ? (
          <div className="wpa-state">
            <div className="wpa-spinner" />
            <strong>Loading post analytics...</strong>
          </div>
        ) : error ? (
          <div className="wpa-state error">
            <strong>{error}</strong>
            <button type="button" onClick={onRetry}>Retry</button>
          </div>
        ) : analytics ? (
          <div className="wpa-content">
            <section className="wpa-basic">
              <Metric
                label="Total views"
                value={formatNumber(analytics.total_views || 0)}
                hint="Existing basic post analytics"
                icon={BarChart3}
              />
            </section>

            {!access?.advanced_post_analytics ? (
              <section className="wpa-lock">
                <span>PRO POST ANALYTICS</span>
                <h3>Advanced reader behavior analytics</h3>
                <p>
                  Your normal analytics remain available. Advanced post analytics,
                  including reading time, completion, audience countries, traffic
                  sources, devices, and link behavior, is included with Pro and
                  Unlimited Writer plans.
                </p>
                <a href="/writer/plan">View Pro plans</a>
              </section>
            ) : (
              <>
                <div className="wpa-pro-label">
                  <span>PRO POST ANALYTICS</span>
                  <strong>{access?.plan?.name || 'Pro'} access active</strong>
                </div>

                <section className="wpa-metrics">
                  <Metric
                    label="Unique readers"
                    value={formatNumber(summary.unique_readers)}
                    hint={`${formatNumber(summary.sessions)} reading sessions`}
                    icon={Users}
                  />
                  <Metric
                    label="Engaged readers"
                    value={formatNumber(summary.engaged_readers)}
                    hint={`${formatPercent(summary.engagement_rate)} engagement`}
                    icon={Users}
                  />
                  <Metric
                    label="Average read time"
                    value={formatSeconds(summary.average_reading_time_seconds)}
                    hint={
                      summary.estimated_read_seconds
                        ? `Estimated post read: ${formatSeconds(summary.estimated_read_seconds)}`
                        : 'Measured active reading time'
                    }
                    icon={Clock3}
                  />
                  <Metric
                    label="Completion rate"
                    value={formatPercent(summary.completion_rate)}
                    hint={`${formatNumber(summary.completed_readers)} completed readers`}
                    icon={BarChart3}
                  />
                  <Metric
                    label="Link clicks"
                    value={formatNumber(summary.total_link_clicks)}
                    hint={`${formatPercent(summary.link_ctr)} reader CTR`}
                    icon={MousePointerClick}
                  />
                  <Metric
                    label="Average scroll"
                    value={formatPercent(summary.average_scroll_percent)}
                    hint="Average furthest reading depth"
                    icon={BarChart3}
                  />
                </section>

                <section className="wpa-section">
                  <div className="wpa-section-head">
                    <h3>Reading completion</h3>
                    <span>Where readers reached in the post</span>
                  </div>

                  <div className="wpa-funnel">
                    {[
                      ['25%', funnel.reached_25],
                      ['50%', funnel.reached_50],
                      ['75%', funnel.reached_75],
                      ['100%', funnel.reached_100],
                    ].map(([label, value]) => {
                      const total = Number(summary.unique_readers || 0);
                      const percent = total ? (Number(value || 0) / total) * 100 : 0;

                      return (
                        <div key={label}>
                          <span>{label}</span>
                          <div><b style={{ width: `${Math.max(2, percent)}%` }} /></div>
                          <strong>{formatNumber(value || 0)}</strong>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <div className="wpa-grid">
                  <Breakdown
                    title="Readers by country"
                    rows={advanced.countries || []}
                    labelFor={(row) => countryName(row.country_code)}
                  />

                  <Breakdown
                    title="Device breakdown"
                    rows={advanced.devices || []}
                    labelFor={(row) => {
                      const value = String(row.device_type || 'unknown');
                      return value.charAt(0).toUpperCase() + value.slice(1);
                    }}
                  />
                </div>

                <div className="wpa-grid">
                  <Breakdown
                    title="Traffic sources"
                    rows={advanced.traffic_sources || []}
                    labelFor={(row) => row.source || 'Other'}
                  />

                  <section className="wpa-section">
                    <div className="wpa-section-head">
                      <h3>New vs returning readers</h3>
                    </div>

                    <div className="wpa-reader-types">
                      <div>
                        <span>New readers</span>
                        <strong>{formatNumber(readerTypes.new_readers)}</strong>
                      </div>
                      <div>
                        <span>Returning readers</span>
                        <strong>{formatNumber(readerTypes.returning_readers)}</strong>
                      </div>
                    </div>
                  </section>
                </div>

                <section className="wpa-section">
                  <div className="wpa-section-head">
                    <h3>Link performance</h3>
                    <span>Links clicked inside the post content</span>
                  </div>

                  {links.length ? (
                    <div className="wpa-links">
                      <div className="wpa-link-head">
                        <span>Link</span>
                        <span>Clicks</span>
                        <span>Unique</span>
                        <span>CTR</span>
                      </div>

                      {links.map((link) => (
                        <div className="wpa-link-row" key={link.link_hash}>
                          <div>
                            <strong>{link.link_text || link.link_url}</strong>
                            <small title={link.link_url}>{link.link_url}</small>
                          </div>
                          <b>{formatNumber(link.clicks)}</b>
                          <b>{formatNumber(link.unique_clickers)}</b>
                          <b>{formatPercent(link.ctr)}</b>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="wpa-empty">
                      No post-content link clicks have been recorded yet.
                    </div>
                  )}
                </section>

                {Number(summary.unknown_country_readers || 0) > 0 ? (
                  <p className="wpa-note">
                    Country is reported when the hosting or proxy layer provides a
                    trusted country header. Readers without that header are shown
                    as Unknown.
                  </p>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </aside>
    </div>
  );
}

const styles = `
  .wpa-backdrop,
  .wpa-backdrop * {
    box-sizing: border-box;
  }

  .wpa-backdrop {
    position: fixed;
    inset: 0;
    z-index: 2400;
    display: flex;
    justify-content: flex-end;
    background: rgba(15, 23, 42, 0.35);
  }

  .wpa-drawer {
    width: min(760px, 92vw);
    height: 100%;
    overflow-y: auto;
    background: #f8fafc;
    border-left: 1px solid #dfe3e8;
    box-shadow: -18px 0 48px rgba(15, 23, 42, 0.12);
  }

  .wpa-head {
    position: sticky;
    top: 0;
    z-index: 3;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    padding: 20px 22px;
    border-bottom: 1px solid #e5e7eb;
    background: rgba(255, 255, 255, 0.98);
  }

  .wpa-head span,
  .wpa-pro-label span,
  .wpa-lock > span {
    color: #6b7280;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.07em;
  }

  .wpa-head h2 {
    margin: 5px 0 0;
    color: #111827;
    font-size: 19px;
    line-height: 1.3;
  }

  .wpa-head button {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    border: 1px solid #dfe3e8;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
  }

  .wpa-content {
    padding: 18px 20px 28px;
  }

  .wpa-state {
    min-height: 320px;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 12px;
    color: #475569;
  }

  .wpa-state.error {
    color: #991b1b;
  }

  .wpa-state button,
  .wpa-lock a {
    min-height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 14px;
    border: 1px solid #111827;
    border-radius: 7px;
    background: #111827;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
  }

  .wpa-spinner {
    width: 26px;
    height: 26px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    border-radius: 50%;
    animation: wpaSpin .75s linear infinite;
  }

  @keyframes wpaSpin {
    to { transform: rotate(360deg); }
  }

  .wpa-basic {
    margin-bottom: 14px;
  }

  .wpa-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 14px;
  }

  .wpa-metric {
    min-width: 0;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    padding: 14px;
    border: 1px solid #e1e5e9;
    border-radius: 9px;
    background: #fff;
  }

  .wpa-metric span,
  .wpa-metric small {
    display: block;
    color: #7b8490;
    font-size: 9px;
  }

  .wpa-metric strong {
    display: block;
    margin: 7px 0 6px;
    color: #111827;
    font-size: 21px;
  }

  .wpa-metric svg {
    flex: 0 0 auto;
    color: #6b7280;
  }

  .wpa-pro-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 0 0 12px;
    padding: 10px 12px;
    border: 1px solid #dfe3e8;
    border-radius: 8px;
    background: #fff;
  }

  .wpa-pro-label strong {
    color: #166534;
    font-size: 10px;
  }

  .wpa-lock {
    padding: 24px;
    border: 1px solid #dfe3e8;
    border-radius: 10px;
    background: #fff;
  }

  .wpa-lock h3 {
    margin: 7px 0 8px;
    color: #111827;
    font-size: 18px;
  }

  .wpa-lock p {
    max-width: 620px;
    margin: 0 0 16px;
    color: #667085;
    font-size: 12px;
    line-height: 1.7;
  }

  .wpa-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 12px;
  }

  .wpa-section {
    min-width: 0;
    margin-bottom: 12px;
    padding: 16px;
    border: 1px solid #e1e5e9;
    border-radius: 9px;
    background: #fff;
  }

  .wpa-section-head {
    margin-bottom: 13px;
  }

  .wpa-section-head h3 {
    margin: 0 0 4px;
    color: #111827;
    font-size: 13px;
  }

  .wpa-section-head span {
    color: #8a94a1;
    font-size: 9px;
  }

  .wpa-funnel {
    display: grid;
    gap: 9px;
  }

  .wpa-funnel > div {
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr) 52px;
    align-items: center;
    gap: 9px;
  }

  .wpa-funnel span,
  .wpa-funnel strong {
    font-size: 10px;
  }

  .wpa-funnel > div > div {
    height: 7px;
    overflow: hidden;
    border-radius: 999px;
    background: #eef1f4;
  }

  .wpa-funnel b {
    height: 100%;
    display: block;
    border-radius: inherit;
    background: #252a31;
  }

  .wpa-breakdown {
    display: grid;
    gap: 10px;
  }

  .wpa-breakdown-row {
    display: grid;
    grid-template-columns: minmax(100px, 1fr) minmax(80px, 1fr) 44px;
    align-items: center;
    gap: 9px;
  }

  .wpa-breakdown-row > div:first-child {
    min-width: 0;
  }

  .wpa-breakdown-row strong,
  .wpa-breakdown-row span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 9px;
  }

  .wpa-breakdown-row span {
    margin-top: 2px;
    color: #98a1ab;
  }

  .wpa-breakdown-row b {
    font-size: 9px;
    text-align: right;
  }

  .wpa-bar {
    height: 6px;
    overflow: hidden;
    border-radius: 999px;
    background: #eef1f4;
  }

  .wpa-bar span {
    height: 100%;
    display: block;
    border-radius: inherit;
    background: #475569;
  }

  .wpa-reader-types {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 9px;
  }

  .wpa-reader-types > div {
    padding: 13px;
    border: 1px solid #edf0f2;
    border-radius: 8px;
  }

  .wpa-reader-types span {
    display: block;
    color: #8a94a1;
    font-size: 9px;
  }

  .wpa-reader-types strong {
    display: block;
    margin-top: 7px;
    font-size: 19px;
  }

  .wpa-links {
    overflow-x: auto;
  }

  .wpa-link-head,
  .wpa-link-row {
    min-width: 590px;
    display: grid;
    grid-template-columns: minmax(250px, 1fr) 70px 70px 70px;
    gap: 10px;
    align-items: center;
  }

  .wpa-link-head {
    padding: 0 8px 8px;
    color: #8a94a1;
    font-size: 9px;
    font-weight: 700;
  }

  .wpa-link-row {
    padding: 10px 8px;
    border-top: 1px solid #edf0f2;
  }

  .wpa-link-row > div {
    min-width: 0;
  }

  .wpa-link-row strong,
  .wpa-link-row small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .wpa-link-row strong {
    font-size: 10px;
  }

  .wpa-link-row small {
    margin-top: 3px;
    color: #98a1ab;
    font-size: 8px;
  }

  .wpa-link-row b {
    font-size: 9px;
  }

  .wpa-empty,
  .wpa-note {
    color: #8a94a1;
    font-size: 10px;
    line-height: 1.6;
  }

  .wpa-note {
    margin: 4px 0 0;
    padding: 10px 12px;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    background: #fff;
  }

  @media (max-width: 760px) {
    .wpa-drawer {
      width: 100vw;
    }

    .wpa-content {
      padding: 14px;
    }

    .wpa-metrics,
    .wpa-grid {
      grid-template-columns: 1fr;
    }

    .wpa-head {
      padding: 16px;
    }

    .wpa-head h2 {
      font-size: 16px;
    }
  }
`;
