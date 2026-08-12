import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, BookOpen } from 'lucide-react';
import ReaderUnifiedShell from '../../components/reader/ReaderUnifiedShell';
import './CustomerSavedPostsApproved.css';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  '';

function getApiUrl(path) {
  if (!API_BASE) return path;
  return `${API_BASE}${path}`;
}

function getStoredToken() {
  return (
    localStorage.getItem('customerToken') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('token') ||
    ''
  );
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}

function formatSavedDate(value) {
  if (!value) return 'Saved';

  const saved = new Date(value);
  if (Number.isNaN(saved.getTime())) return 'Saved';

  const now = new Date();
  const savedDay = new Date(saved.getFullYear(), saved.getMonth(), saved.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((today.getTime() - savedDay.getTime()) / 86400000);

  if (diffDays === 0) return 'Saved today';
  if (diffDays === 1) return 'Saved yesterday';

  return `Saved ${saved.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })}`;
}

function getReadPath(item) {
  if (item?.post?.url) return item.post.url;

  const websiteSlug = item?.website?.slug;
  const postSlug = item?.post?.slug;

  if (websiteSlug && postSlug) {
    return `/${websiteSlug}/post/${postSlug}`;
  }

  if (postSlug) return `/posts/${postSlug}`;
  return '#';
}

export default function CustomerSavedPostsPage() {
  const navigate = useNavigate();
  const token = useMemo(() => getStoredToken(), []);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/reader/login', { replace: true });
      return undefined;
    }

    let active = true;

    async function fetchSavedPosts() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(getApiUrl('/api/customer/saved/posts'), {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        const data = await safeJson(response);

        if (!response.ok || !data?.ok) {
          throw new Error(data?.message || 'Failed to fetch saved posts.');
        }

        if (!active) return;
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to fetch saved posts.');
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchSavedPosts();

    return () => {
      active = false;
    };
  }, [navigate, token]);

  async function handleRemove(postId) {
    if (!postId || busyId) return;

    setBusyId(postId);
    setError('');

    try {
      const response = await fetch(getApiUrl(`/api/customer/saved/posts/${postId}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const data = await safeJson(response);

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || 'Failed to remove saved post.');
      }

      setItems((prev) => prev.filter((item) => item?.post?.id !== postId));
    } catch (err) {
      setError(err.message || 'Failed to remove saved post.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <ReaderUnifiedShell title="Saved Posts" subtitle="Your Reader library">
      <main className="reader-saved-page">
        <section className="reader-saved-hero">
          <div>
            <h2 className="reader-saved-desktop-heading">Reading list</h2>
            <h2 className="reader-saved-mobile-heading">Saved Posts</h2>
            <p className="reader-saved-desktop-subtitle">
              Keep the stories you want to revisit in one clean reading list.
            </p>
            <p className="reader-saved-mobile-subtitle">Posts you saved to read again.</p>
          </div>
          <span className="reader-saved-count">
            {items.length} saved {items.length === 1 ? 'post' : 'posts'}
          </span>
        </section>

        <div className="reader-saved-info">
          <Bookmark size={15} aria-hidden="true" />
          <span>Saved posts stay here until you remove them. Open any card to continue reading.</span>
        </div>

        {error ? (
          <div className="reader-saved-alert error" role="alert">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="reader-saved-loading" role="status">
            <span className="reader-saved-loading-dot" />
            Loading saved posts...
          </div>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <section className="reader-saved-empty">
            <div className="reader-saved-empty-icon" aria-hidden="true">S</div>
            <h3>No saved posts yet</h3>
            <p>When you save a post, it will be kept here until you remove it.</p>
          </section>
        ) : null}

        {!loading && items.length > 0 ? (
          <section className="reader-saved-grid" aria-label="Saved posts">
            {items.map((item) => {
              const post = item?.post || {};
              const writer = item?.affiliate?.name || 'Writer';
              const readPath = getReadPath(item);

              return (
                <article className="reader-saved-card" key={item.saved_id || post.id}>
                  <Link
                    to={readPath}
                    className="reader-saved-card-media"
                    aria-label={`Read ${post.title || 'saved post'}`}
                  >
                    {post.featured_image ? (
                      <img src={post.featured_image} alt={post.title || 'Saved post'} />
                    ) : (
                      <span className="reader-saved-no-image">
                        <BookOpen size={24} aria-hidden="true" />
                        <span>Saved post</span>
                      </span>
                    )}
                  </Link>

                  <div className="reader-saved-card-body">
                    <div className="reader-saved-card-meta">
                      <span className="reader-saved-date">{formatSavedDate(item.saved_at)}</span>
                      <span className="reader-saved-writer">{writer}</span>
                    </div>

                    <h3>{post.title || 'Untitled post'}</h3>
                    <p>{post.excerpt || 'No excerpt available for this post.'}</p>

                    <div className="reader-saved-card-actions">
                      <Link to={readPath} className="reader-saved-read-button">
                        Read post
                      </Link>
                      <button
                        type="button"
                        className="reader-saved-remove-button"
                        onClick={() => handleRemove(post.id)}
                        disabled={busyId === post.id}
                      >
                        {busyId === post.id ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : null}
      </main>
    </ReaderUnifiedShell>
  );
}
