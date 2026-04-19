import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

  if (value === 'published' || value === 'active') return 'affiliate-product-posts-status active';
  if (value === 'draft' || value === 'pending') return 'affiliate-product-posts-status draft';
  if (value === 'inactive') return 'affiliate-product-posts-status inactive';
  if (value === 'rejected' || value === 'suspended') return 'affiliate-product-posts-status danger';

  return 'affiliate-product-posts-status neutral';
}

function PostCard({ post }) {
  return (
    <div className="affiliate-product-posts-card">
      <div className="affiliate-product-posts-image-wrap">
        {post.featured_image ? (
          <img
            src={post.featured_image}
            alt={post.title}
            className="affiliate-product-posts-image"
          />
        ) : (
          <div className="affiliate-product-posts-image-placeholder">
            <FileText size={28} />
            <span>No image</span>
          </div>
        )}
      </div>

      <div className="affiliate-product-posts-card-body">
        <div className="affiliate-product-posts-card-top">
          <h3 className="affiliate-product-posts-card-title">{post.title}</h3>
          <span className={getStatusClass(post.status)}>{post.status || 'draft'}</span>
        </div>

        <div className="affiliate-product-posts-meta-grid">
          <div className="affiliate-product-posts-meta-box">
            <span className="affiliate-product-posts-meta-label">Template</span>
            <strong>{post.template_name || '-'}</strong>
          </div>

          <div className="affiliate-product-posts-meta-box">
            <span className="affiliate-product-posts-meta-label">Category</span>
            <strong>{post.category_name || '-'}</strong>
          </div>
        </div>

        <div className="affiliate-product-posts-actions">
          <Link
            className="affiliate-product-posts-btn secondary"
            to={`/affiliate/posts/${post.id}/edit`}
          >
            <Pencil size={16} />
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AffiliateProductPostsPage() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchProductPosts = async (isRefresh = false) => {
    try {
      setError('');

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await api.get(`/api/affiliate/posts/product/${id}`);
      const rows = data?.posts || [];
      setProduct(data?.product || null);
      setPosts(rows);
      setFilteredPosts(rows);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load product posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProductPosts();
  }, [id]);

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

      return (
        title.includes(keyword) ||
        status.includes(keyword) ||
        templateName.includes(keyword) ||
        categoryName.includes(keyword)
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
      <div className="affiliate-product-posts-page">
        <style>{styles}</style>

        <div className="affiliate-product-posts-loading-wrap">
          <div className="affiliate-product-posts-loading-card">
            <div className="affiliate-product-posts-spinner" />
            <p>Loading product posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-product-posts-page">
      <style>{styles}</style>

      <section className="affiliate-product-posts-hero">
        <div className="affiliate-product-posts-hero-copy">
          <div className="affiliate-product-posts-badge">Product content</div>
          <h1 className="affiliate-product-posts-title">Product Posts</h1>
          <p className="affiliate-product-posts-subtitle">
            {product
              ? `Manage posts for ${product.title}.`
              : 'Manage posts for this product.'}
          </p>
        </div>

        <div className="affiliate-product-posts-hero-actions">
          <button
            type="button"
            className="affiliate-product-posts-btn secondary"
            onClick={() => fetchProductPosts(true)}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <Link
            className="affiliate-product-posts-btn primary"
            to={`/affiliate/posts/create?product_id=${id}`}
          >
            <Plus size={16} />
            Create Post
          </Link>
        </div>
      </section>

      <section className="affiliate-product-posts-stats">
        <div className="affiliate-product-posts-stat-card">
          <div className="affiliate-product-posts-stat-top">
            <div>
              <p className="affiliate-product-posts-stat-label">Total Posts</p>
              <h3 className="affiliate-product-posts-stat-value">{totals.total}</h3>
            </div>
            <div className="affiliate-product-posts-stat-icon">
              <FileText size={20} />
            </div>
          </div>
        </div>

        <div className="affiliate-product-posts-stat-card">
          <div className="affiliate-product-posts-stat-top">
            <div>
              <p className="affiliate-product-posts-stat-label">Published</p>
              <h3 className="affiliate-product-posts-stat-value">{totals.published}</h3>
            </div>
            <div className="affiliate-product-posts-stat-icon">
              <LayoutTemplate size={20} />
            </div>
          </div>
        </div>

        <div className="affiliate-product-posts-stat-card">
          <div className="affiliate-product-posts-stat-top">
            <div>
              <p className="affiliate-product-posts-stat-label">Draft / Pending</p>
              <h3 className="affiliate-product-posts-stat-value">{totals.drafts}</h3>
            </div>
            <div className="affiliate-product-posts-stat-icon">
              <FolderKanban size={20} />
            </div>
          </div>
        </div>
      </section>

      {product ? (
        <section className="affiliate-product-posts-product-strip">
          <div className="affiliate-product-posts-product-pill">
            <Package size={16} />
            <span>Product:</span>
            <strong>{product.title}</strong>
          </div>
        </section>
      ) : null}

      <section className="affiliate-product-posts-toolbar">
        <div className="affiliate-product-posts-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search posts by title, status, template, or category"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </section>

      {error ? (
        <div className="affiliate-product-posts-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      {filteredPosts.length ? (
        <section className="affiliate-product-posts-grid">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      ) : (
        <section className="affiliate-product-posts-empty">
          <FileText size={32} />
          <h3>{posts.length ? 'No matching posts found' : 'No posts yet for this product'}</h3>
          <p>
            {posts.length
              ? 'Try another search keyword.'
              : 'Create the first content piece for this product.'}
          </p>

          {!posts.length ? (
            <Link
              className="affiliate-product-posts-btn primary"
              to={`/affiliate/posts/create?product_id=${id}`}
            >
              <Plus size={16} />
              Create Post
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

  .affiliate-product-posts-page {
    width: 100%;
  }

  .affiliate-product-posts-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-product-posts-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-product-posts-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliateProductPostsSpin 0.8s linear infinite;
  }

  @keyframes affiliateProductPostsSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: affiliateProductPostsSpin 0.8s linear infinite;
  }

  .affiliate-product-posts-hero {
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

  .affiliate-product-posts-badge {
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

  .affiliate-product-posts-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-product-posts-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-product-posts-hero-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-product-posts-btn {
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

  .affiliate-product-posts-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-product-posts-btn.secondary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .affiliate-product-posts-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .affiliate-product-posts-stat-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 22px;
    padding: 20px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-product-posts-stat-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .affiliate-product-posts-stat-label {
    margin: 0 0 10px;
    font-size: 13px;
    color: #6b7280;
    font-weight: 700;
  }

  .affiliate-product-posts-stat-value {
    margin: 0;
    font-size: 30px;
    line-height: 1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-product-posts-stat-icon {
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

  .affiliate-product-posts-product-strip {
    margin-bottom: 20px;
  }

  .affiliate-product-posts-product-pill {
    width: fit-content;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 42px;
    padding: 0 14px;
    border-radius: 999px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
    color: #111827;
    font-size: 14px;
  }

  .affiliate-product-posts-product-pill span {
    color: #6b7280;
    font-weight: 700;
  }

  .affiliate-product-posts-product-pill strong {
    font-weight: 900;
  }

  .affiliate-product-posts-toolbar {
    margin-bottom: 20px;
  }

  .affiliate-product-posts-search {
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

  .affiliate-product-posts-search input {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: #111827;
    font-size: 14px;
  }

  .affiliate-product-posts-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 20px;
  }

  .affiliate-product-posts-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-product-posts-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .affiliate-product-posts-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-product-posts-image-wrap {
    width: 100%;
    height: 240px;
    background: #f8fafc;
    border-bottom: 1px solid #eef2f7;
  }

  .affiliate-product-posts-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .affiliate-product-posts-image-placeholder {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    color: #6b7280;
    gap: 8px;
    text-align: center;
  }

  .affiliate-product-posts-card-body {
    padding: 18px;
  }

  .affiliate-product-posts-card-top {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 14px;
  }

  .affiliate-product-posts-card-title {
    margin: 0;
    font-size: 18px;
    line-height: 1.35;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-product-posts-status {
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

  .affiliate-product-posts-status.active {
    background: #ecfdf3;
    color: #027a48;
    border-color: #abefc6;
  }

  .affiliate-product-posts-status.inactive {
    background: #fff7ed;
    color: #b54708;
    border-color: #fed7aa;
  }

  .affiliate-product-posts-status.draft {
    background: #f8fafc;
    color: #475467;
    border-color: #e4e7ec;
  }

  .affiliate-product-posts-status.danger {
    background: #fef2f2;
    color: #b42318;
    border-color: #fecaca;
  }

  .affiliate-product-posts-status.neutral {
    background: #eef2f7;
    color: #344054;
    border-color: #dbe2ea;
  }

  .affiliate-product-posts-meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .affiliate-product-posts-meta-box {
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 16px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-product-posts-meta-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .affiliate-product-posts-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .affiliate-product-posts-empty {
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

  .affiliate-product-posts-empty h3 {
    margin: 0;
    color: #111827;
    font-weight: 900;
  }

  .affiliate-product-posts-empty p {
    margin: 0 0 8px;
    color: #6b7280;
    line-height: 1.6;
    max-width: 420px;
  }

  @media (max-width: 1200px) {
    .affiliate-product-posts-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 991px) {
    .affiliate-product-posts-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-product-posts-title {
      font-size: 26px;
    }

    .affiliate-product-posts-stats {
      grid-template-columns: 1fr;
    }

    .affiliate-product-posts-hero-actions {
      width: 100%;
    }
  }

  @media (max-width: 767px) {
    .affiliate-product-posts-grid,
    .affiliate-product-posts-meta-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-product-posts-title {
      font-size: 22px;
    }

    .affiliate-product-posts-subtitle {
      font-size: 14px;
    }

    .affiliate-product-posts-hero-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-product-posts-btn {
      width: 100%;
    }

    .affiliate-product-posts-image-wrap {
      height: 220px;
    }
  }
`;