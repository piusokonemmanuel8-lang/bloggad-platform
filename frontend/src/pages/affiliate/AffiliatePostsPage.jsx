import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../api/axios';

function getStatusClass(status = '') {
  const value = String(status).toLowerCase();

  if (value === 'published' || value === 'active') return 'affiliate-posts-status active';
  if (value === 'draft' || value === 'pending') return 'affiliate-posts-status draft';
  if (value === 'inactive') return 'affiliate-posts-status inactive';
  if (value === 'rejected' || value === 'suspended') return 'affiliate-posts-status danger';

  return 'affiliate-posts-status neutral';
}

function PostCard({ post, routeRoot }) {
  return (
    <article className="affiliate-posts-card">
      <div className="affiliate-posts-image-wrap">
        {post.featured_image ? (
          <img
            src={post.featured_image}
            alt={post.title}
            className="affiliate-posts-image"
          />
        ) : (
          <div className="affiliate-posts-image-placeholder" aria-label="No featured image">
            <span>No image</span>
          </div>
        )}
      </div>

      <div className="affiliate-posts-card-body">
        <div className="affiliate-posts-card-top">
          <h3 className="affiliate-posts-card-title">{post.title}</h3>
          <span className={getStatusClass(post.status)}>{post.status || 'draft'}</span>
        </div>

        <div className="affiliate-posts-meta-grid">
          <div className="affiliate-posts-meta-box">
            <span className="affiliate-posts-meta-label">Product</span>
            <strong>{post.product_title || '-'}</strong>
          </div>

          <div className="affiliate-posts-meta-box">
            <span className="affiliate-posts-meta-label">Template</span>
            <strong>{post.template_name || '-'}</strong>
          </div>

          <div className="affiliate-posts-meta-box">
            <span className="affiliate-posts-meta-label">Category</span>
            <strong>{post.category_name || '-'}</strong>
          </div>

          <div className="affiliate-posts-meta-box">
            <span className="affiliate-posts-meta-label">Slug</span>
            <strong title={post.slug || '-'}>{post.slug || '-'}</strong>
          </div>
        </div>

        <div className="affiliate-posts-actions">
          <Link
            className="affiliate-posts-btn secondary"
            to={`${routeRoot}/posts/${post.id}/edit`}
          >
            Edit
          </Link>

          {post.product_id ? (
            <Link
              className="affiliate-posts-btn secondary"
              to={`${routeRoot}/products/${post.product_id}/posts`}
            >
              Product Posts
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function AffiliatePostsPage() {
  const location = useLocation();
  const routeRoot = location.pathname.startsWith('/writer') ? '/writer' : '/affiliate';

  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchPosts = async (isRefresh = false) => {
    try {
      setError('');

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await api.get('/api/affiliate/posts');
      const rows = data?.posts || [];
      setPosts(rows);
      setFilteredPosts(rows);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      setFilteredPosts(posts);
      return;
    }

    const nextRows = posts.filter((post) => {
      const title = String(post?.title || '').toLowerCase();
      const status = String(post?.status || '').toLowerCase();
      const templateName = String(post?.template_name || '').toLowerCase();
      const categoryName = String(post?.category_name || '').toLowerCase();
      const productTitle = String(post?.product_title || '').toLowerCase();
      const slug = String(post?.slug || '').toLowerCase();

      return (
        title.includes(keyword) ||
        status.includes(keyword) ||
        templateName.includes(keyword) ||
        categoryName.includes(keyword) ||
        productTitle.includes(keyword) ||
        slug.includes(keyword)
      );
    });

    setFilteredPosts(nextRows);
  }, [search, posts]);

  const totals = useMemo(() => {
    const total = posts.length;
    const published = posts.filter((item) =>
      ['published', 'active'].includes(String(item.status || '').toLowerCase())
    ).length;
    const drafts = posts.filter((item) =>
      ['draft', 'pending'].includes(String(item.status || '').toLowerCase())
    ).length;

    return { total, published, drafts };
  }, [posts]);

  if (loading) {
    return (
      <div className="affiliate-posts-page">
        <style>{styles}</style>

        <div className="affiliate-posts-loading-wrap">
          <div className="affiliate-posts-loading-card">
            <div className="affiliate-posts-spinner" />
            <p>Loading posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-posts-page">
      <style>{styles}</style>

      <section className="affiliate-posts-hero">
        <div className="affiliate-posts-hero-copy">
          <div className="affiliate-posts-eyebrow">All content</div>
          <h1 className="affiliate-posts-title">My Posts</h1>
          <p className="affiliate-posts-subtitle">
            View and manage all posts you have created across all products.
          </p>
        </div>

        <div className="affiliate-posts-hero-actions">
          <button
            type="button"
            className="affiliate-posts-btn secondary"
            onClick={() => fetchPosts(true)}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <Link
            className="affiliate-posts-btn primary"
            to={`${routeRoot}/products`}
          >
            Create From Product
          </Link>
        </div>
      </section>

      <section className="affiliate-posts-stats" aria-label="Post summary">
        <div className="affiliate-posts-stat-card">
          <p className="affiliate-posts-stat-label">Total Posts</p>
          <p className="affiliate-posts-stat-value">{totals.total}</p>
        </div>

        <div className="affiliate-posts-stat-card">
          <p className="affiliate-posts-stat-label">Published</p>
          <p className="affiliate-posts-stat-value">{totals.published}</p>
        </div>

        <div className="affiliate-posts-stat-card">
          <p className="affiliate-posts-stat-label">Draft / Pending</p>
          <p className="affiliate-posts-stat-value">{totals.drafts}</p>
        </div>
      </section>

      <section className="affiliate-posts-toolbar">
        <label className="affiliate-posts-search">
          <span className="affiliate-posts-sr-only">Search posts</span>
          <input
            type="search"
            placeholder="Search posts by title, product, template, category, slug, or status"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </section>

      {error ? (
        <div className="affiliate-posts-alert error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="affiliate-posts-alert-action"
            onClick={() => fetchPosts(true)}
            disabled={refreshing}
          >
            Retry
          </button>
        </div>
      ) : null}

      {filteredPosts.length ? (
        <section className="affiliate-posts-grid">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} routeRoot={routeRoot} />
          ))}
        </section>
      ) : (
        <section className="affiliate-posts-empty">
          <div className="affiliate-posts-empty-mark" aria-hidden="true" />
          <h3>{posts.length ? 'No matching posts found' : 'No posts yet'}</h3>
          <p>
            {posts.length
              ? 'Try another search keyword.'
              : 'Create your first post from a product page.'}
          </p>

          {!posts.length ? (
            <Link
              className="affiliate-posts-btn primary"
              to={`${routeRoot}/products`}
            >
              Go To Products
            </Link>
          ) : null}
        </section>
      )}
    </div>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .affiliate-posts-page {
    width: 100%;
    color: #111827;
  }

  .affiliate-posts-page,
  .affiliate-posts-page button,
  .affiliate-posts-page input {
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .affiliate-posts-sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .affiliate-posts-loading-wrap {
    min-height: 58vh;
    display: grid;
    place-items: center;
  }

  .affiliate-posts-loading-card {
    min-width: 240px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 24px 22px;
    text-align: center;
  }

  .affiliate-posts-loading-card p {
    margin: 12px 0 0;
    color: #6b7280;
    font-size: 13px;
    font-weight: 600;
  }

  .affiliate-posts-spinner {
    width: 34px;
    height: 34px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto;
    animation: affiliatePostsSpin 0.8s linear infinite;
  }

  @keyframes affiliatePostsSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .affiliate-posts-hero {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    min-height: 132px;
    padding: 20px 22px;
    margin-bottom: 12px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
  }

  .affiliate-posts-hero-copy {
    min-width: 0;
  }

  .affiliate-posts-eyebrow {
    margin-bottom: 6px;
    color: #6b7280;
    font-size: 10px;
    line-height: 1.3;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .affiliate-posts-title {
    margin: 0;
    color: #111827;
    font-size: 28px;
    line-height: 1.15;
    font-weight: 700;
    letter-spacing: -0.025em;
  }

  .affiliate-posts-subtitle {
    max-width: 720px;
    margin: 6px 0 0;
    color: #6b7280;
    font-size: 13px;
    line-height: 1.55;
    font-weight: 400;
  }

  .affiliate-posts-hero-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
  }

  .affiliate-posts-btn {
    min-height: 38px;
    padding: 0 14px;
    border-radius: 10px;
    border: 1px solid #d1d5db;
    background: #ffffff;
    color: #111827;
    font-size: 13px;
    line-height: 1;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      border-color 160ms ease,
      color 160ms ease,
      opacity 160ms ease;
  }

  .affiliate-posts-btn:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  .affiliate-posts-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-posts-btn.primary:hover {
    background: #1f2937;
    border-color: #1f2937;
  }

  .affiliate-posts-btn:focus-visible,
  .affiliate-posts-search:focus-within,
  .affiliate-posts-alert-action:focus-visible {
    outline: 2px solid #111827;
    outline-offset: 2px;
  }

  .affiliate-posts-btn:disabled,
  .affiliate-posts-alert-action:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .affiliate-posts-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 12px;
  }

  .affiliate-posts-stat-card {
    min-height: 96px;
    padding: 16px 18px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
  }

  .affiliate-posts-stat-label {
    margin: 0 0 8px;
    color: #6b7280;
    font-size: 12px;
    line-height: 1.3;
    font-weight: 500;
  }

  .affiliate-posts-stat-value {
    margin: 0;
    color: #111827;
    font-size: 28px;
    line-height: 1;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .affiliate-posts-toolbar {
    margin-bottom: 12px;
  }

  .affiliate-posts-search {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 48px;
    padding: 0 14px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
  }

  .affiliate-posts-search input {
    width: 100%;
    min-width: 0;
    height: 46px;
    padding: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: #111827;
    font-size: 12px;
    font-weight: 400;
  }

  .affiliate-posts-search input::placeholder {
    color: #9ca3af;
    opacity: 1;
  }

  .affiliate-posts-search input::-webkit-search-cancel-button {
    cursor: pointer;
  }

  .affiliate-posts-alert {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    min-height: 48px;
    padding: 10px 14px;
    margin-bottom: 12px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
  }

  .affiliate-posts-alert.error {
    background: #fffaf5;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-posts-alert-action {
    padding: 7px 10px;
    border: 1px solid currentColor;
    border-radius: 8px;
    background: transparent;
    color: inherit;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }

  .affiliate-posts-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    align-items: start;
  }

  .affiliate-posts-card {
    min-width: 0;
    overflow: hidden;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
  }

  .affiliate-posts-image-wrap {
    width: 100%;
    height: 168px;
    overflow: hidden;
    background: #f3f4f6;
    border-bottom: 1px solid #f1f2f4;
  }

  .affiliate-posts-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .affiliate-posts-image-placeholder {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    color: #9ca3af;
    font-size: 11px;
    font-weight: 600;
  }

  .affiliate-posts-card-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
  }

  .affiliate-posts-card-top {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .affiliate-posts-card-title {
    width: 100%;
    margin: 0;
    overflow-wrap: anywhere;
    color: #111827;
    font-size: 15px;
    line-height: 1.35;
    font-weight: 700;
    letter-spacing: -0.012em;
  }

  .affiliate-posts-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    min-height: 24px;
    padding: 0 9px;
    border-radius: 999px;
    font-size: 10px;
    line-height: 1;
    font-weight: 600;
    text-transform: capitalize;
    border: 1px solid transparent;
  }

  .affiliate-posts-status.active {
    background: #ecfdf3;
    color: #027a48;
    border-color: #abefc6;
  }

  .affiliate-posts-status.inactive {
    background: #fff7ed;
    color: #b54708;
    border-color: #fed7aa;
  }

  .affiliate-posts-status.draft {
    background: #f8fafc;
    color: #475467;
    border-color: #e4e7ec;
  }

  .affiliate-posts-status.danger {
    background: #fef2f2;
    color: #b42318;
    border-color: #fecaca;
  }

  .affiliate-posts-status.neutral {
    background: #f3f4f6;
    color: #4b5563;
    border-color: #e5e7eb;
  }

  .affiliate-posts-meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .affiliate-posts-meta-box {
    min-width: 0;
    min-height: 58px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow: hidden;
    background: #f8fafc;
    border: 1px solid #eef2f7;
    border-radius: 10px;
  }

  .affiliate-posts-meta-label {
    color: #6b7280;
    font-size: 9px;
    line-height: 1.2;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .affiliate-posts-meta-box strong {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #111827;
    font-size: 11px;
    line-height: 1.35;
    font-weight: 600;
    white-space: nowrap;
  }

  .affiliate-posts-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .affiliate-posts-empty {
    min-height: 320px;
    padding: 28px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
    background: #ffffff;
    border: 1px dashed #d1d5db;
    border-radius: 16px;
  }

  .affiliate-posts-empty-mark {
    width: 46px;
    height: 46px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #f3f4f6;
  }

  .affiliate-posts-empty h3 {
    margin: 0;
    color: #111827;
    font-size: 16px;
    font-weight: 700;
  }

  .affiliate-posts-empty p {
    max-width: 420px;
    margin: 0 0 4px;
    color: #6b7280;
    font-size: 13px;
    line-height: 1.55;
  }

  @media (max-width: 1200px) {
    .affiliate-posts-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 991px) {
    .affiliate-posts-hero {
      min-height: 0;
      flex-direction: column;
      padding: 18px;
    }

    .affiliate-posts-hero-actions {
      width: 100%;
      align-items: flex-start;
    }

    .affiliate-posts-stats {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .affiliate-posts-stat-card {
      min-height: 88px;
    }
  }

  @media (max-width: 767px) {
    .affiliate-posts-hero {
      gap: 14px;
      padding: 16px;
      margin-bottom: 8px;
      border-radius: 14px;
    }

    .affiliate-posts-title {
      font-size: 24px;
    }

    .affiliate-posts-subtitle {
      max-width: 100%;
      font-size: 12px;
    }

    .affiliate-posts-hero-actions {
      flex-direction: column;
      gap: 8px;
    }

    .affiliate-posts-stats {
      margin-bottom: 8px;
    }

    .affiliate-posts-toolbar {
      margin-bottom: 8px;
    }

    .affiliate-posts-search {
      min-height: 46px;
    }

    .affiliate-posts-search input {
      height: 44px;
    }

    .affiliate-posts-search input {
      font-size: 12px;
    }

    .affiliate-posts-search input:placeholder-shown {
      text-overflow: ellipsis;
    }

    .affiliate-posts-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .affiliate-posts-card {
      border-radius: 16px;
    }

    .affiliate-posts-image-wrap {
      height: 168px;
    }

    .affiliate-posts-meta-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .affiliate-posts-alert {
      align-items: flex-start;
      flex-direction: column;
    }
  }

  @media (max-width: 420px) {
    .affiliate-posts-meta-box strong {
      font-size: 10px;
    }

    .affiliate-posts-btn {
      min-height: 36px;
      padding: 0 12px;
      font-size: 12px;
    }
  }
`;
