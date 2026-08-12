import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios';
import ReaderUnifiedShell from '../../components/reader/ReaderUnifiedShell';
import './ReaderFollowingApproved.css';

function formatFollowerCount(value) {
  const count = Number(value || 0);

  if (!Number.isFinite(count)) return '0';

  return new Intl.NumberFormat(undefined, {
    notation: count >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(count);
}

function formatFollowedDate(value) {
  if (!value) return 'Followed recently';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Followed recently';

  return `Followed ${date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

function initialsFor(value) {
  const words = String(value || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return 'W';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();

  return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
}

function ReaderFollowingSkeleton() {
  return (
    <section className="reader-following-grid" aria-label="Loading followed Writers">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="reader-following-card reader-following-skeleton-card" key={index}>
          <div className="reader-following-skeleton-line wide" />
          <div className="reader-following-skeleton-line medium" />
          <div className="reader-following-skeleton-line full" />
        </div>
      ))}
    </section>
  );
}

export default function ReaderFollowingPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const { data } = await api.get('/api/reader/social/following');
      setRows(Array.isArray(data?.following) ? data.following : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load followed Writers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function unfollow(writerId) {
    if (!writerId || busyId) return;

    try {
      setBusyId(writerId);
      setError('');

      await api.post(`/api/reader/social/writers/${writerId}/follow`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update follow.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <ReaderUnifiedShell title="Following" subtitle="Your Reader library">
      <main className="reader-following-page">
        <section className="reader-following-heading">
          <div>
            <h1>Following Writers</h1>
            <p>Writers you follow, newest first.</p>
          </div>
          {!loading && rows.length > 0 ? (
            <span className="reader-following-count">
              {rows.length} {rows.length === 1 ? 'Writer' : 'Writers'}
            </span>
          ) : null}
        </section>

        <section className="reader-following-info">
          <span className="reader-following-info-icon" aria-hidden="true">i</span>
          <div>
            <strong>Following helps shape your For You feed</strong>
            <span>
              Posts from Writers you follow can be prioritized alongside your reading interests.
            </span>
          </div>
        </section>

        {error ? (
          <section className="reader-following-error" role="alert">
            <div>
              <strong>Following could not be loaded.</strong>
              <span>{error}</span>
            </div>
            <button type="button" onClick={load}>Retry</button>
          </section>
        ) : null}

        {loading ? <ReaderFollowingSkeleton /> : null}

        {!loading && !error && rows.length === 0 ? (
          <section className="reader-following-empty">
            <span className="reader-following-empty-icon" aria-hidden="true">..</span>
            <h2>You are not following any Writers yet.</h2>
            <p>
              When you follow a Writer, they will appear here with their follower count
              and the date you followed them.
            </p>
          </section>
        ) : null}

        {!loading && rows.length > 0 ? (
          <>
            <section className="reader-following-grid" aria-label="Followed Writers">
              {rows.map((item) => {
                const writerId = Number(item?.writer_user_id);
                const writerName = item?.writer_name || `Writer ${writerId || ''}`.trim();
                const isBusy = busyId === writerId;

                return (
                  <article className="reader-following-card" key={writerId || writerName}>
                    <div className="reader-following-card-row">
                      <span className="reader-following-writer-avatar" aria-hidden="true">
                        {initialsFor(writerName)}
                      </span>

                      <div className="reader-following-writer-copy">
                        <strong>{writerName}</strong>
                        <div className="reader-following-writer-meta">
                          <span>{formatFollowerCount(item?.follower_count)} followers</span>
                          <i aria-hidden="true" />
                          <span>{formatFollowedDate(item?.followed_at)}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="reader-following-unfollow"
                        onClick={() => unfollow(writerId)}
                        disabled={isBusy}
                      >
                        {isBusy ? 'Updating...' : 'Unfollow'}
                      </button>
                    </div>

                    <p className="reader-following-card-note">
                      Posts from this Writer may appear higher in your Reader feed while you follow them.
                    </p>
                  </article>
                );
              })}
            </section>

            <p className="reader-following-footer-note">
              Showing all {rows.length} followed {rows.length === 1 ? 'Writer' : 'Writers'}
            </p>
          </>
        ) : null}
      </main>
    </ReaderUnifiedShell>
  );
}
