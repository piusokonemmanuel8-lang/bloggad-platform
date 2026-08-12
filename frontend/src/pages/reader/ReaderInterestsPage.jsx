import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import ReaderUnifiedShell from '../../components/reader/ReaderUnifiedShell';
import './ReaderInterestsApproved.css';

function flattenBranch(node) {
  if (!node) return [];

  return [
    node,
    ...(node.children || []).flatMap((child) => flattenBranch(child)),
  ];
}

export default function ReaderInterestsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const onboardingMode = location.pathname === '/reader/onboarding';

  const [tree, setTree] = useState([]);
  const [selected, setSelected] = useState([]);
  const [maxInterests, setMaxInterests] = useState(5);
  const [readerTier, setReaderTier] = useState('free');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');

      const { data } = await api.get('/api/reader/reading/interests');

      setTree(data?.tree || []);
      setSelected((data?.selected_category_ids || []).map(Number));
      setMaxInterests(Math.max(5, Number(data?.max_interests || 5)));
      setReaderTier(
        data?.plan_tier === 'premium'
          ? 'premium'
          : data?.plan_tier === 'basic'
            ? 'basic'
            : 'free'
      );
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load interests.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  function toggle(id) {
    const categoryId = Number(id);

    if (selectedSet.has(categoryId)) {
      setSelected((prev) => prev.filter((item) => item !== categoryId));
      setNotice('');
      return;
    }

    if (selected.length >= maxInterests) {
      setError(`Your ${readerTier === 'premium' ? 'Premium' : readerTier === 'basic' ? 'Basic' : 'Free'} Reader tier allows up to ${maxInterests} interests.`);
      return;
    }

    setError('');
    setNotice('');
    setSelected((prev) => [...prev, categoryId]);
  }

  async function save() {
    if (selected.length < 3 || selected.length > maxInterests) {
      setError(`Choose between 3 and ${maxInterests} interests.`);
      return;
    }

    try {
      setSaving(true);
      setError('');
      setNotice('');

      const { data } = await api.put('/api/reader/reading/interests', {
        category_ids: selected,
      });

      setSelected((data?.selected_category_ids || selected).map(Number));
      setMaxInterests(Math.max(5, Number(data?.max_interests || maxInterests)));
      setReaderTier(
        data?.plan_tier === 'premium'
          ? 'premium'
          : data?.plan_tier === 'basic'
            ? 'basic'
            : readerTier
      );
      setNotice('Reading interests saved.');

      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save interests.');
    } finally {
      setSaving(false);
    }
  }

  const selectionValid = selected.length >= 3 && selected.length <= maxInterests;

  return (
    <ReaderUnifiedShell
      title="Interests"
      subtitle={onboardingMode ? 'Finish Reader setup' : 'Shape your For You feed'}
    >
      <main className="reader-interests-page">
        <section className="reader-interests-heading">
          <div>
            <h1>Choose your interests</h1>
            <p className="reader-interests-desktop-copy">
              Pick the topics you care about most. Bloggad will use these choices
              to improve what appears in your For You feed.
            </p>
            <p className="reader-interests-mobile-copy">
              Pick 3 to {maxInterests} topics to personalize your For You feed.
            </p>
          </div>

          <span
            className={`reader-interests-count ${
              selectionValid ? 'is-ready' : ''
            }`}
          >
            {selected.length} of {maxInterests} selected
          </span>
        </section>

        {error ? (
          <section className="reader-interests-alert is-warning" role="alert">
            <span className="reader-interests-alert-icon" aria-hidden="true">
              !
            </span>
            <div>
              <strong>{error}</strong>
              <span>Adjust your selections and try again.</span>
            </div>
          </section>
        ) : notice ? (
          <section className="reader-interests-alert is-success" role="status">
            <span className="reader-interests-alert-icon" aria-hidden="true">
              i
            </span>
            <div>
              <strong>{notice}</strong>
              <span>Your For You feed will use your latest selections.</span>
            </div>
          </section>
        ) : (
          <section className="reader-interests-alert is-info">
            <span className="reader-interests-alert-icon" aria-hidden="true">
              i
            </span>
            <div>
              <strong>Your interests shape your For You feed</strong>
              <span className="reader-interests-desktop-copy">
                Choose 3 to {maxInterests} topics. You can update these any time.
              </span>
              <span className="reader-interests-mobile-copy">
                You can change these choices any time.
              </span>
            </div>
          </section>
        )}

        <section className="reader-interests-topics" aria-label="Reading interests">
          {loading ? (
            <div className="reader-interests-state">Loading interests...</div>
          ) : tree.length ? (
            <div className="reader-interests-groups">
              {tree.map((group) => (
                <section className="reader-interests-group" key={group.id}>
                  <h2>{group.name}</h2>

                  <div className="reader-interests-options">
                    {flattenBranch(group).map((category) => {
                      const categoryId = Number(category.id);
                      const active = selectedSet.has(categoryId);

                      return (
                        <button
                          key={category.id}
                          type="button"
                          className={`reader-interests-option ${
                            active ? 'is-selected' : ''
                          }`}
                          aria-pressed={active}
                          onClick={() => toggle(categoryId)}
                        >
                          {category.name}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="reader-interests-state">
              No active interests are available yet.
            </div>
          )}
        </section>

        <section className="reader-interests-save-card">
          <div className="reader-interests-save-copy">
            <strong>{selected.length} of {maxInterests} selected</strong>
            <span>
              {selectionValid
                ? 'Your feed is ready to personalize.'
                : 'Choose at least 3 topics before saving.'}
            </span>
          </div>

          <button
            type="button"
            className="reader-interests-save"
            disabled={saving || loading}
            onClick={save}
          >
            {saving ? 'Saving...' : 'Save interests'}
          </button>
        </section>
      </main>
    </ReaderUnifiedShell>
  );
}