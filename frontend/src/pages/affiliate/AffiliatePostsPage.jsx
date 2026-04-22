import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  RefreshCw,
  AlertCircle,
  Search,
  Pencil,
  LayoutTemplate,
  FolderKanban,
  Package,
} from 'lucide-react';
import api from '../../api/axios';

function getStatusClass(status = '') {
  const value = String(status).toLowerCase();

  if (value === 'published' || value === 'active') return 'affiliate-posts-status active';
  if (value === 'draft' || value === 'pending') return 'affiliate-posts-status draft';
  if (value === 'inactive') return 'affiliate-posts-status inactive';
  if (value === 'rejected' || value === 'suspended') return 'affiliate-posts-status danger';

  return 'affiliate-posts-status neutral';
}

function PostCard({ post }) {
  return (
    <div className="affiliate-posts-card">
      <div className="affiliate-posts-image-wrap">
        {post.featured_image ? (
          <img
            src={post.featured_image}
            alt={post.title}
            className="affiliate-posts-image"
          />
        ) : (
          <div className="affiliate-posts-image-placeholder">
            <FileText size={28} />
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
            <strong>{post.slug || '-'}</strong>
          </div>
        </div>

        <div className="affiliate-posts-actions">
          <Link
            className="affiliate-posts-btn secondary"
            to={`/affiliate/posts/${post.id}/edit`}
          >
            <Pencil size={16} />
            Edit
          </Link>

          {post.product_id ? (
            <Link
              className="affiliate-posts-btn secondary"
              to={`/affiliate/products/${post.product_id}/posts`}
            >
              <Package size={16} />
              Product Posts
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function AffiliatePostsPage() {
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
          <div className="affiliate-posts-badge">All content</div>
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
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <Link
            className="affiliate-posts-btn primary"
            to="/affiliate/products"
          >
            <Plus size={16} />
            Create From Product
          </Link>
        </div>
      </section>

      <section className="affiliate-posts-stats">
        <div className="affiliate-posts-stat-card">
          <div className="affiliate-posts-stat-top">
            <div>
              <p className="affiliate-posts-stat-label">Total Posts</p>
              <h3 className="affiliate-posts-stat-value">{totals.total}</h3>
            </div>
            <div className="affiliate-posts-stat-icon">
              <FileText size={20} />
            </div>
          </div>
        </div>

        <div className="affiliate-posts-stat-card">
          <div className="affiliate-posts-stat-top">
            <div>
              <p className="affiliate-posts-stat-label">Published</p>
              <h3 className="affiliate-posts-stat-value">{totals.published}</h3>
            </div>
            <div className="affiliate-posts-stat-icon">
              <LayoutTemplate size={20} />
            </div>
          </div>
        </div>

        <div className="affiliate-posts-stat-card">
          <div className="affiliate-posts-stat-top">
            <div>
              <p className="affiliate-posts-stat-label">Draft / Pending</p>
              <h3 className="affiliate-posts-stat-value">{totals.drafts}</h3>
            </div>
            <div className="affiliate-posts-stat-icon">
              <FolderKanban size={20} />
            </div>
          </div>
        </div>
      </section>

      <section className="affiliate-posts-toolbar">
        <div className="affiliate-posts-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search posts by title, product, template, category, slug, or status"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </section>

      {error ? (
        <div className="affiliate-posts-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      {filteredPosts.length ? (
        <section className="affiliate-posts-grid">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      ) : (
        <section className="affiliate-posts-empty">
          <FileText size={32} />
          <h3>{posts.length ? 'No matching posts found' : 'No posts yet'}</h3>
          <p>
            {posts.length
              ? 'Try another search keyword.'
              : 'Create your first post from a product page.'}
          </p>

          {!posts.length ? (
            <Link
              className="affiliate-posts-btn primary"
              to="/affiliate/products"
            >
              <Plus size={16} />
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
  }

  .affiliate-posts-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-posts-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-posts-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliatePostsSpin 0.8s linear infinite;
  }

  @keyframes affiliatePostsSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: affiliatePostsSpin 0.8s linear infinite;
  }

  .affiliate-posts-hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.05);
    margin-bottom: 20px;
  }

  .affiliate-posts-badge {
    display: inline-flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 999px;
    background: #111827;
    color: #ffffff;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .affiliate-posts-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-posts-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-posts-hero-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-posts-btn {
    height: 46px;
    padding: 0 16px;
    border-radius: 14px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    color: #111827;
    font-size: 14px;
    font-weight: 800;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .affiliate-posts-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-posts-btn.secondary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .affiliate-posts-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .affiliate-posts-stat-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 22px;
    padding: 20px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-posts-stat-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .affiliate-posts-stat-label {
    margin: 0 0 10px;
    font-size: 13px;
    color: #6b7280;
    font-weight: 700;
  }

  .affiliate-posts-stat-value {
    margin: 0;
    font-size: 30px;
    line-height: 1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-posts-stat-icon {
    width: 46px;
    height: 46px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    color: #111827;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .affiliate-posts-toolbar {
    margin-bottom: 20px;
  }

  .affiliate-posts-search {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 52px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    padding: 0 14px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-posts-search input {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: #111827;
    font-size: 14px;
  }

  .affiliate-posts-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 20px;
  }

  .affiliate-posts-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-posts-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .affiliate-posts-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-posts-image-wrap {
    width: 100%;
    height: 240px;
    background: #f8fafc;
    border-bottom: 1px solid #eef2f7;
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
    color: #6b7280;
    gap: 8px;
    text-align: center;
  }

  .affiliate-posts-card-body {
    padding: 18px;
  }

  .affiliate-posts-card-top {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 14px;
  }

  .affiliate-posts-card-title {
    margin: 0;
    font-size: 18px;
    line-height: 1.35;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-posts-status {
    display: inline-flex;
    width: fit-content;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
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
    background: #eef2f7;
    color: #344054;
    border-color: #dbe2ea;
  }

  .affiliate-posts-meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .affiliate-posts-meta-box {
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 16px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-posts-meta-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .affiliate-posts-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .affiliate-posts-empty {
    min-height: 320px;
    border: 1px dashed #dbe2ea;
    background: #ffffff;
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
    padding: 24px;
  }

  .affiliate-posts-empty h3 {
    margin: 0;
    color: #111827;
    font-weight: 900;
  }

  .affiliate-posts-empty p {
    margin: 0 0 8px;
    color: #6b7280;
    line-height: 1.6;
    max-width: 420px;
  }

  @media (max-width: 1200px) {
    .affiliate-posts-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 991px) {
    .affiliate-posts-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-posts-title {
      font-size: 26px;
    }

    .affiliate-posts-stats {
      grid-template-columns: 1fr;
    }

    .affiliate-posts-hero-actions {
      width: 100%;
    }
  }

  @media (max-width: 767px) {
    .affiliate-posts-grid,
    .affiliate-posts-meta-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-posts-title {
      font-size: 22px;
    }

    .affiliate-posts-subtitle {
      font-size: 14px;
    }

    .affiliate-posts-hero-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-posts-btn {
      width: 100%;
    }

    .affiliate-posts-image-wrap {
      height: 220px;
    }
  }
`;