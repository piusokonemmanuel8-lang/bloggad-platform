import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import ReaderUnifiedShell from '../../components/reader/ReaderUnifiedShell';
import './ReaderReadingControlsApproved.css';

function getInitials(value) {
  const words = String(value || 'Publication')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return 'P';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0] || ''}${words[1][0] || ''}`.toUpperCase();
}

export default function ReaderReadingControlsPage() {
  const [data, setData] = useState({
    publication_follows: [],
    mutes: [],
    highlights: [],
  });
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    try {
      setError('');
      const response = await api.get('/api/reader/reading/controls');
      setData({
        publication_follows: response?.data?.publication_follows || [],
        mutes: response?.data?.mutes || [],
        highlights: response?.data?.highlights || [],
      });
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Failed to load reading controls.'
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function unfollowPublication(websiteId) {
    try {
      setBusy(`publication-${websiteId}`);
      setError('');
      setNotice('');
      await api.post(
        `/api/reader/reading/publications/${websiteId}/follow`
      );
      setNotice('Publication follow updated.');
      await load();
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Failed to update publication.'
      );
    } finally {
      setBusy('');
    }
  }

  async function unmute(item) {
    try {
      setBusy(`mute-${item.id}`);
      setError('');
      setNotice('');
      await api.post(
        `/api/reader/reading/mutes/${item.target_type}/${item.target_id}`
      );
      setNotice('Mute removed.');
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update mute.');
    } finally {
      setBusy('');
    }
  }

  async function removeHighlight(highlightId) {
    try {
      setBusy(`highlight-${highlightId}`);
      setError('');
      setNotice('');
      await api.delete(
        `/api/reader/reading/highlights/${highlightId}`
      );
      setNotice('Highlight removed.');
      await load();
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Failed to remove highlight.'
      );
    } finally {
      setBusy('');
    }
  }

  const publicationCount = data.publication_follows.length;
  const muteCount = data.mutes.length;
  const highlightCount = data.highlights.length;

  return (
    <ReaderUnifiedShell
      title="Reading Controls"
      subtitle="Manage followed Publications, muted reading and highlights"
    >
      <main className="rrc-approved-page">
        <section className="rrc-approved-heading">
          <div>
            <h1>Your reading controls</h1>
            <p>
              Keep followed Publications, muted sources and saved highlights
              organized in one place.
            </p>
          </div>

          <div className="rrc-approved-summary" aria-label="Reading control totals">
            <span>
              <strong>{publicationCount}</strong>
              Publications
            </span>
            <span className="is-muted">
              <strong>{muteCount}</strong>
              Muted
            </span>
            <span className="is-highlight">
              <strong>{highlightCount}</strong>
              Highlights
            </span>
          </div>
        </section>

        {notice ? (
          <div className="rrc-approved-notice is-success" role="status">
            {notice}
          </div>
        ) : null}

        {error ? (
          <div className="rrc-approved-notice is-error" role="alert">
            {error}
          </div>
        ) : null}

        <div className="rrc-approved-grid">
          <div className="rrc-approved-column">
            <section className="rrc-approved-panel">
              <div className="rrc-approved-panel-head">
                <div>
                  <h2>Followed Publications</h2>
                  <p>Publications shaping your personalized feed.</p>
                </div>
                <span>{publicationCount}</span>
              </div>

              <div className="rrc-approved-list">
                {data.publication_follows.map((item) => (
                  <article
                    className="rrc-approved-publication"
                    key={item.website_id}
                  >
                    <div className="rrc-approved-publication-info">
                      <span className="rrc-approved-avatar" aria-hidden="true">
                        {getInitials(item.website_name)}
                      </span>
                      <div>
                        <strong>
                          {item.website_name || 'Publication'}
                        </strong>
                        <span>{item.writer_name || 'Writer'}</span>
                      </div>
                    </div>

                    <div className="rrc-approved-actions">
                      {item.website_slug ? (
                        <Link
                          className="rrc-approved-button"
                          to={`/${item.website_slug}`}
                        >
                          Open
                        </Link>
                      ) : null}

                      <button
                        className="rrc-approved-button is-danger"
                        type="button"
                        disabled={
                          busy === `publication-${item.website_id}`
                        }
                        onClick={() =>
                          unfollowPublication(item.website_id)
                        }
                      >
                        {busy === `publication-${item.website_id}`
                          ? 'Updating...'
                          : 'Unfollow'}
                      </button>
                    </div>
                  </article>
                ))}

                {!data.publication_follows.length ? (
                  <div className="rrc-approved-empty">
                    No followed publications yet.
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rrc-approved-panel">
              <div className="rrc-approved-panel-head">
                <div>
                  <h2>Muted Reading</h2>
                  <p>Sources and topics hidden from your reading feed.</p>
                </div>
                <span>{muteCount}</span>
              </div>

              <div className="rrc-approved-list">
                {data.mutes.map((item) => (
                  <article
                    className="rrc-approved-mute"
                    key={item.id}
                  >
                    <div>
                      <strong>
                        {item.target_name ||
                          `${item.target_type} ${item.target_id}`}
                      </strong>
                      <span className="rrc-approved-type">
                        {item.target_type}
                      </span>
                    </div>

                    <button
                      className="rrc-approved-button is-dark"
                      type="button"
                      disabled={busy === `mute-${item.id}`}
                      onClick={() => unmute(item)}
                    >
                      {busy === `mute-${item.id}`
                        ? 'Updating...'
                        : 'Unmute'}
                    </button>
                  </article>
                ))}

                {!data.mutes.length ? (
                  <div className="rrc-approved-empty">
                    You have not muted any reading sources or topics.
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          <section className="rrc-approved-panel rrc-approved-highlights-panel">
            <div className="rrc-approved-panel-head">
              <div>
                <h2>Highlights</h2>
                <p>Passages you saved while reading.</p>
              </div>
              <span>{highlightCount}</span>
            </div>

            <div className="rrc-approved-highlight-list">
              {data.highlights.map((item) => (
                <article
                  className="rrc-approved-highlight"
                  key={item.id}
                >
                  <strong>{item.post_title || 'Story'}</strong>

                  <blockquote>{item.selected_text}</blockquote>

                  <div className="rrc-approved-actions">
                    {item.website_slug && item.post_slug ? (
                      <Link
                        className="rrc-approved-button"
                        to={`/${item.website_slug}/post/${item.post_slug}`}
                      >
                        Open story
                      </Link>
                    ) : null}

                    <button
                      className="rrc-approved-button is-danger"
                      type="button"
                      disabled={busy === `highlight-${item.id}`}
                      onClick={() => removeHighlight(item.id)}
                    >
                      {busy === `highlight-${item.id}`
                        ? 'Removing...'
                        : 'Remove highlight'}
                    </button>
                  </div>
                </article>
              ))}

              {!data.highlights.length ? (
                <div className="rrc-approved-empty">
                  No saved highlights yet.
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </main>
    </ReaderUnifiedShell>
  );
}