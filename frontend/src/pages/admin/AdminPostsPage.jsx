import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  ExternalLink,
  FileText,
  Globe,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  SquarePen,
  Tag,
  Trash2,
  User2,
  XCircle,
} from 'lucide-react';
import api from '../../api/axios';

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function cardStyle(extra = {}) {
  return {
    background: '#ffffff',
    border: '1px solid #dcdcde',
    borderRadius: 0,
    boxShadow: 'none',
    ...extra,
  };
}

function badgeStyle(status) {
  const clean = String(status || '').toLowerCase();

  if (clean === 'published') {
    return {
      border: '1px solid #b7e4c7',
      background: '#ecfdf3',
      color: '#166534',
    };
  }

  if (clean === 'draft') {
    return {
      border: '1px solid #f3d28b',
      background: '#fff7e6',
      color: '#9a6700',
    };
  }

  if (clean === 'inactive') {
    return {
      border: '1px solid #f1b5b8',
      background: '#fff1f2',
      color: '#b42318',
    };
  }

  return {
    border: '1px solid #dcdcde',
    background: '#f6f7f7',
    color: '#50575e',
  };
}

function reviewBadgeStyle(status) {
  const clean = String(status || '').toLowerCase();

  if (clean === 'approved') {
    return {
      border: '1px solid #b7e4c7',
      background: '#ecfdf3',
      color: '#166534',
    };
  }

  if (clean === 'needs_revision') {
    return {
      border: '1px solid #f3d28b',
      background: '#fff7e6',
      color: '#9a6700',
    };
  }

  if (clean === 'rejected') {
    return {
      border: '1px solid #f1b5b8',
      background: '#fff1f2',
      color: '#b42318',
    };
  }

  if (clean === 'pending_review') {
    return {
      border: '1px solid #b6d7ff',
      background: '#eef6ff',
      color: '#0b57d0',
    };
  }

  return {
    border: '1px solid #dcdcde',
    background: '#f6f7f7',
    color: '#50575e',
  };
}

function scoreBadgeStyle(score, reversed = false) {
  const value = Number(score || 0);
  const effective = reversed ? 100 - value : value;

  if (effective >= 75) {
    return {
      border: '1px solid #b7e4c7',
      background: '#ecfdf3',
      color: '#166534',
    };
  }

  if (effective >= 60) {
    return {
      border: '1px solid #f3d28b',
      background: '#fff7e6',
      color: '#9a6700',
    };
  }

  return {
    border: '1px solid #f1b5b8',
    background: '#fff1f2',
    color: '#b42318',
  };
}

function StatCard({ label, value, icon: Icon, tone = 'default' }) {
  const iconTone =
    tone === 'primary'
      ? { background: '#2271b1', color: '#fff', border: '1px solid #2271b1' }
      : tone === 'success'
      ? { background: '#ecfdf3', color: '#166534', border: '1px solid #b7e4c7' }
      : tone === 'warning'
      ? { background: '#fff7e6', color: '#9a6700', border: '1px solid #f3d28b' }
      : { background: '#f6f7f7', color: '#1d2327', border: '1px solid #dcdcde' };

  return (
    <div style={cardStyle({ padding: 20 })}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: '#646970', marginBottom: 10 }}>{label}</div>
          <div style={{ fontSize: 34, lineHeight: 1, fontWeight: 700, color: '#1d2327' }}>
            {value}
          </div>
        </div>

        <div
          style={{
            width: 44,
            height: 44,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...iconTone,
          }}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, toneStyle }) {
  return (
    <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }), ...toneStyle }}>
      <div style={{ fontSize: 12, marginBottom: 8 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 24, lineHeight: 1, color: 'inherit' }}>{value}</div>
    </div>
  );
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState('');
  const [postDetails, setPostDetails] = useState(null);
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPosts = async () => {
    const { data } = await api.get('/api/admin/posts');
    setPosts(data?.posts || []);
  };

  const fetchSinglePost = async (postId) => {
    const { data } = await api.get(`/api/admin/posts/${postId}`);
    setPostDetails(data?.post || null);
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError('');
        await fetchPosts();
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleSelectPost = async (post) => {
    try {
      setDetailsLoading(true);
      setSelectedPostId(String(post.id));
      setError('');
      setSuccess('');
      await fetchSinglePost(post.id);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load post details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const refreshAll = async (targetId = null) => {
    await fetchPosts();

    const chosenId = targetId || selectedPostId;
    if (chosenId) {
      await fetchSinglePost(chosenId);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError('');
      setSuccess('');
      await refreshAll();
      setSuccess('Posts refreshed successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to refresh posts');
    } finally {
      setRefreshing(false);
    }
  };

  const handleStatusChange = async (status) => {
    if (!selectedPostId) return;

    try {
      setStatusSaving(true);
      setError('');
      setSuccess('');

      const { data } = await api.put(`/api/admin/posts/${selectedPostId}/status`, {
        status,
      });

      await refreshAll(selectedPostId);
      setSuccess(data?.message || 'Post status updated successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update post status');
    } finally {
      setStatusSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPostId) return;

    const confirmed = window.confirm('Are you sure you want to delete this post?');
    if (!confirmed) return;

    try {
      setDeleting(true);
      setError('');
      setSuccess('');

      const { data } = await api.delete(`/api/admin/posts/${selectedPostId}`);
      setSelectedPostId('');
      setPostDetails(null);
      await fetchPosts();
      setSuccess(data?.message || 'Post deleted successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return posts;

    return posts.filter((post) => {
      const title = String(post?.title || '').toLowerCase();
      const affiliate = String(post?.affiliate?.name || '').toLowerCase();
      const product = String(post?.product?.title || '').toLowerCase();
      const status = String(post?.status || '').toLowerCase();
      const reviewStatus = String(post?.review_status || post?.quality_review?.review_status || '').toLowerCase();
      const blockedReason = String(post?.quality_blocked_reason || '').toLowerCase();

      return (
        title.includes(keyword) ||
        affiliate.includes(keyword) ||
        product.includes(keyword) ||
        status.includes(keyword) ||
        reviewStatus.includes(keyword) ||
        blockedReason.includes(keyword)
      );
    });
  }, [posts, search]);

  const stats = useMemo(() => {
    const total = posts.length;
    const published = posts.filter(
      (item) => String(item?.status || '').toLowerCase() === 'published'
    ).length;
    const draft = posts.filter(
      (item) => String(item?.status || '').toLowerCase() === 'draft'
    ).length;
    const inactive = posts.filter(
      (item) => String(item?.status || '').toLowerCase() === 'inactive'
    ).length;

    return { total, published, draft, inactive };
  }, [posts]);

  const qualityReview = postDetails?.quality_review || null;
  const reviewStatus = qualityReview?.review_status || postDetails?.review_status || '-';
  const qualityScore = Number(qualityReview?.quality_score ?? postDetails?.quality_score ?? 0);
  const riskScore = Number(qualityReview?.risk_score ?? postDetails?.risk_score ?? 0);
  const similarityScore = Number(qualityReview?.similarity_score ?? postDetails?.similarity_score ?? 0);
  const blockedReason = qualityReview?.blocked_reason || postDetails?.quality_blocked_reason || '';
  const fieldScores = Array.isArray(qualityReview?.field_scores) ? qualityReview.field_scores : [];
  const warnings = Array.isArray(qualityReview?.warnings) ? qualityReview.warnings : [];

  if (loading) {
    return (
      <div style={cardStyle({ padding: 20 })}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#646970' }}>
          <Loader2 size={18} className="spin-soft" />
          <span>Loading posts...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        .admin-post-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }
        .admin-post-main-grid {
          display: grid;
          grid-template-columns: 380px minmax(0, 1fr);
          gap: 20px;
        }
        .admin-post-split-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 20px;
        }
        .admin-post-two-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .admin-post-three-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }
        .spin-soft {
          animation: spinSoft 0.9s linear infinite;
        }
        @keyframes spinSoft {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1200px) {
          .admin-post-grid-4,
          .admin-post-main-grid,
          .admin-post-split-grid,
          .admin-post-two-grid,
          .admin-post-three-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ marginBottom: 22 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 10,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                lineHeight: 1.2,
                fontWeight: 700,
                color: '#1d2327',
              }}
            >
              Posts
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#646970' }}>
              Review affiliate posts, inspect content details, verify CTA buttons, and manage status.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              border: '1px solid #2271b1',
              background: refreshing ? '#f6f7f7' : '#ffffff',
              color: '#2271b1',
              padding: '10px 16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <RefreshCw size={16} className={refreshing ? 'spin-soft' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error ? (
        <div
          style={{
            ...cardStyle({
              padding: 14,
              borderLeft: '4px solid #d63638',
              color: '#b42318',
              marginBottom: 20,
            }),
          }}
        >
          {error}
        </div>
      ) : null}

      {success ? (
        <div
          style={{
            ...cardStyle({
              padding: 14,
              borderLeft: '4px solid #00a32a',
              color: '#166534',
              marginBottom: 20,
            }),
          }}
        >
          {success}
        </div>
      ) : null}

      <div style={{ ...cardStyle({ padding: 16, marginBottom: 20, borderLeft: '4px solid #72aee6' }) }}>
        Post records control article content, SEO fields, template fields, CTA button setup, and quality review data.
      </div>

      <div className="admin-post-grid-4" style={{ marginBottom: 20 }}>
        <StatCard label="Total Posts" value={stats.total} icon={FileText} tone="primary" />
        <StatCard label="Published" value={stats.published} icon={BadgeCheck} tone="success" />
        <StatCard label="Draft" value={stats.draft} icon={SquarePen} tone="warning" />
        <StatCard label="Inactive" value={stats.inactive} icon={ShieldAlert} />
      </div>

      <div className="admin-post-main-grid">
        <section style={cardStyle()}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327', marginBottom: 6 }}>
                  Post List
                </div>
                <div style={{ fontSize: 13, color: '#646970' }}>
                  Select a post to inspect full details.
                </div>
              </div>

              <div
                style={{
                  padding: '6px 10px',
                  background: '#f6f7f7',
                  border: '1px solid #dcdcde',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#50575e',
                }}
              >
                {filteredPosts.length} shown
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#646970',
                }}
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, affiliate, product, status..."
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  border: '1px solid #8c8f94',
                  background: '#fff',
                  color: '#1d2327',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ maxHeight: 900, overflowY: 'auto', padding: 18 }}>
            {filteredPosts.length ? (
              filteredPosts.map((post) => {
                const selected = String(selectedPostId) === String(post.id);
                const listReviewStatus = post?.review_status || post?.quality_review?.review_status || 'not_checked';
                const listQualityScore = Number(post?.quality_score || 0);
                const listRiskScore = Number(post?.risk_score || 0);
                const listSimilarityScore = Number(post?.similarity_score || 0);

                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => handleSelectPost(post)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      marginBottom: 12,
                      padding: 16,
                      cursor: 'pointer',
                      background: selected ? '#f0f6fc' : '#ffffff',
                      border: selected ? '1px solid #72aee6' : '1px solid #dcdcde',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 12, minWidth: 0 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#f6f7f7',
                            border: '1px solid #dcdcde',
                            color: '#1d2327',
                            flexShrink: 0,
                          }}
                        >
                          <FileText size={18} />
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: 600,
                              color: '#1d2327',
                              marginBottom: 4,
                              wordBreak: 'break-word',
                            }}
                          >
                            {post.title}
                          </div>
                          <div style={{ fontSize: 13, color: '#646970', wordBreak: 'break-word' }}>
                            Affiliate: {post.affiliate?.name || '-'}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          padding: '5px 10px',
                          fontSize: 12,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          ...badgeStyle(post.status),
                        }}
                      >
                        {post.status || '-'}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: 8, fontSize: 13, color: '#646970' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                        }}
                      >
                        <span>Product</span>
                        <strong style={{ color: '#1d2327' }}>
                          {post.product?.title || '-'}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            padding: '5px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                            ...reviewBadgeStyle(listReviewStatus),
                          }}
                        >
                          Review: {listReviewStatus}
                        </span>

                        <span
                          style={{
                            display: 'inline-flex',
                            padding: '5px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                            ...scoreBadgeStyle(listQualityScore),
                          }}
                        >
                          Quality {Math.round(listQualityScore)}
                        </span>

                        <span
                          style={{
                            display: 'inline-flex',
                            padding: '5px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                            ...scoreBadgeStyle(listRiskScore, true),
                          }}
                        >
                          Risk {Math.round(listRiskScore)}
                        </span>

                        <span
                          style={{
                            display: 'inline-flex',
                            padding: '5px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                            ...scoreBadgeStyle(listSimilarityScore, true),
                          }}
                        >
                          Similarity {Math.round(listSimilarityScore)}%
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div style={{ padding: 18, color: '#646970' }}>No posts found.</div>
            )}
          </div>
        </section>

        <section>
          {detailsLoading ? (
            <div style={cardStyle({ padding: 20 })}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#646970' }}>
                <Loader2 size={18} className="spin-soft" />
                <span>Loading post details...</span>
              </div>
            </div>
          ) : postDetails ? (
            <>
              <div style={{ ...cardStyle(), marginBottom: 20, overflow: 'hidden' }}>
                {postDetails.featured_image ? (
                  <div style={{ borderBottom: '1px solid #dcdcde', background: '#f6f7f7' }}>
                    <img
                      src={postDetails.featured_image}
                      alt={postDetails.title}
                      style={{
                        width: '100%',
                        height: 260,
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      height: 180,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f6f7f7',
                      borderBottom: '1px solid #dcdcde',
                      color: '#646970',
                    }}
                  >
                    <ImageIcon size={28} />
                  </div>
                )}

                <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327', marginBottom: 6 }}>
                    Post Details
                  </div>
                  <div style={{ fontSize: 13, color: '#646970' }}>
                    Content identity, source details, SEO fields, and action controls.
                  </div>
                </div>

                <div className="admin-post-two-grid" style={{ padding: 18 }}>
                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7', gridColumn: '1 / -1' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Title</div>
                    <div style={{ fontWeight: 600, color: '#1d2327' }}>{postDetails.title || '-'}</div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Slug</div>
                    <div style={{ fontWeight: 600, color: '#1d2327', wordBreak: 'break-word' }}>
                      {postDetails.slug || '-'}
                    </div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Status</div>
                    <div
                      style={{
                        display: 'inline-flex',
                        padding: '5px 10px',
                        fontSize: 12,
                        fontWeight: 600,
                        ...badgeStyle(postDetails.status),
                      }}
                    >
                      {postDetails.status || '-'}
                    </div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Affiliate</div>
                    <div style={{ fontWeight: 600, color: '#1d2327' }}>
                      {postDetails.affiliate?.name || '-'}
                    </div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Website</div>
                    <div style={{ fontWeight: 600, color: '#1d2327' }}>
                      {postDetails.website?.website_name || '-'}
                    </div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Product</div>
                    <div style={{ fontWeight: 600, color: '#1d2327' }}>
                      {postDetails.product?.title || '-'}
                    </div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Category</div>
                    <div style={{ fontWeight: 600, color: '#1d2327' }}>
                      {postDetails.category?.name || '-'}
                    </div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Template</div>
                    <div style={{ fontWeight: 600, color: '#1d2327' }}>
                      {postDetails.template?.name || '-'}
                    </div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Published At</div>
                    <div style={{ fontWeight: 600, color: '#1d2327' }}>
                      {formatDateTime(postDetails.published_at)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-post-split-grid">
                <div>
                  <div style={{ ...cardStyle(), marginBottom: 20 }}>
                    <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327' }}>
                        Quality Review
                      </div>
                    </div>

                    <div style={{ padding: 18 }}>
                      <div className="admin-post-three-grid" style={{ marginBottom: 16 }}>
                        <MetricCard
                          label="Quality Score"
                          value={Math.round(qualityScore)}
                          toneStyle={scoreBadgeStyle(qualityScore)}
                        />
                        <MetricCard
                          label="Risk Score"
                          value={Math.round(riskScore)}
                          toneStyle={scoreBadgeStyle(riskScore, true)}
                        />
                        <MetricCard
                          label="Similarity"
                          value={`${Math.round(similarityScore)}%`}
                          toneStyle={scoreBadgeStyle(similarityScore, true)}
                        />
                      </div>

                      <div className="admin-post-two-grid" style={{ marginBottom: 16 }}>
                        <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                          <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Review Status</div>
                          <div
                            style={{
                              display: 'inline-flex',
                              padding: '5px 10px',
                              fontSize: 12,
                              fontWeight: 600,
                              ...reviewBadgeStyle(reviewStatus),
                            }}
                          >
                            {reviewStatus}
                          </div>
                        </div>

                        <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                          <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Blocked Reason</div>
                          <div style={{ fontWeight: 600, color: '#1d2327', wordBreak: 'break-word' }}>
                            {blockedReason || '-'}
                          </div>
                        </div>
                      </div>

                      {warnings.length ? (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#1d2327', marginBottom: 10 }}>
                            Warnings
                          </div>

                          {warnings.map((warning, index) => (
                            <div
                              key={warning.id || `${warning.field_key}-${index}`}
                              style={{
                                border: '1px solid #dcdcde',
                                background: '#fff7e6',
                                padding: 14,
                                marginBottom: 10,
                              }}
                            >
                              <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>
                                {warning.field_key || warning.warning_type || 'Warning'}
                              </div>
                              <div style={{ fontWeight: 600, color: '#1d2327', marginBottom: 8 }}>
                                {warning.message || '-'}
                              </div>
                              {warning.suggestion ? (
                                <div style={{ fontSize: 13, color: '#646970' }}>{warning.suggestion}</div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {fieldScores.length ? (
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#1d2327', marginBottom: 10 }}>
                            Field Scores
                          </div>

                          {fieldScores.map((field) => (
                            <div
                              key={field.id || field.field_key}
                              style={{
                                border: '1px solid #dcdcde',
                                background: '#ffffff',
                                padding: 14,
                                marginBottom: 12,
                              }}
                            >
                              <div className="admin-post-three-grid">
                                <div>
                                  <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Field</div>
                                  <div style={{ fontWeight: 600, color: '#1d2327' }}>
                                    {field.field_label || field.field_key || '-'}
                                  </div>
                                </div>

                                <div>
                                  <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Quality</div>
                                  <div
                                    style={{
                                      display: 'inline-flex',
                                      padding: '5px 10px',
                                      fontSize: 12,
                                      fontWeight: 600,
                                      ...scoreBadgeStyle(field.quality_score),
                                    }}
                                  >
                                    {Math.round(Number(field.quality_score || 0))}
                                  </div>
                                </div>

                                <div>
                                  <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Similarity</div>
                                  <div
                                    style={{
                                      display: 'inline-flex',
                                      padding: '5px 10px',
                                      fontSize: 12,
                                      fontWeight: 600,
                                      ...scoreBadgeStyle(field.similarity_score, true),
                                    }}
                                  >
                                    {Math.round(Number(field.similarity_score || 0))}%
                                  </div>
                                </div>
                              </div>

                              {field.warning_message ? (
                                <div style={{ marginTop: 12, fontSize: 13, color: '#646970' }}>
                                  {field.warning_message}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ color: '#646970' }}>No field score details returned yet.</div>
                      )}
                    </div>
                  </div>

                  <div style={{ ...cardStyle(), marginBottom: 20 }}>
                    <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327' }}>Excerpt</div>
                    </div>
                    <div style={{ padding: 18, fontSize: 14, lineHeight: 1.7, color: '#1d2327' }}>
                      {postDetails.excerpt || 'No excerpt'}
                    </div>
                  </div>

                  <div style={{ ...cardStyle(), marginBottom: 20 }}>
                    <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327' }}>SEO</div>
                    </div>

                    <div style={{ padding: 18, display: 'grid', gap: 12 }}>
                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>SEO Title</div>
                        <div style={{ fontWeight: 600, color: '#1d2327' }}>
                          {postDetails.seo_title || '-'}
                        </div>
                      </div>

                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>SEO Description</div>
                        <div style={{ fontWeight: 600, color: '#1d2327' }}>
                          {postDetails.seo_description || '-'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ ...cardStyle(), marginBottom: 20 }}>
                    <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327' }}>
                        Template Fields
                      </div>
                    </div>

                    <div style={{ padding: 18 }}>
                      {(postDetails.template_fields || []).length ? (
                        postDetails.template_fields.map((field) => (
                          <div
                            key={field.id}
                            style={{
                              border: '1px solid #dcdcde',
                              background: '#ffffff',
                              padding: 14,
                              marginBottom: 12,
                            }}
                          >
                            <div className="admin-post-two-grid">
                              <div>
                                <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Key</div>
                                <div style={{ fontWeight: 600, color: '#1d2327' }}>
                                  {field.field_key || '-'}
                                </div>
                              </div>

                              <div>
                                <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Type</div>
                                <div style={{ fontWeight: 600, color: '#1d2327' }}>
                                  {field.field_type || '-'}
                                </div>
                              </div>

                              <div style={{ gridColumn: '1 / -1' }}>
                                <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Value</div>
                                <div style={{ fontWeight: 600, color: '#1d2327', wordBreak: 'break-word' }}>
                                  {field.field_value || '-'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ color: '#646970' }}>No template fields.</div>
                      )}
                    </div>
                  </div>

                  <div style={cardStyle()}>
                    <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327' }}>
                        CTA Buttons
                      </div>
                    </div>

                    <div style={{ padding: 18 }}>
                      {(postDetails.cta_buttons || []).length ? (
                        postDetails.cta_buttons.map((button) => (
                          <div
                            key={button.id}
                            style={{
                              border: '1px solid #dcdcde',
                              background: '#ffffff',
                              padding: 14,
                              marginBottom: 12,
                            }}
                          >
                            <div className="admin-post-two-grid">
                              <div>
                                <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Label</div>
                                <div style={{ fontWeight: 600, color: '#1d2327' }}>
                                  {button.button_label || '-'}
                                </div>
                              </div>

                              <div>
                                <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Style</div>
                                <div style={{ fontWeight: 600, color: '#1d2327' }}>
                                  {button.button_style || '-'}
                                </div>
                              </div>

                              <div style={{ gridColumn: '1 / -1' }}>
                                <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>URL</div>
                                <div
                                  style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    gap: 10,
                                  }}
                                >
                                  <div style={{ fontWeight: 600, color: '#1d2327', wordBreak: 'break-word' }}>
                                    {button.button_url || '-'}
                                  </div>

                                  {button.button_url ? (
                                    <a
                                      href={button.button_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        border: '1px solid #dcdcde',
                                        background: '#ffffff',
                                        color: '#1d2327',
                                        padding: '6px 10px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        fontSize: 12,
                                        fontWeight: 600,
                                      }}
                                    >
                                      <ExternalLink size={12} />
                                      Open
                                    </a>
                                  ) : null}
                                </div>
                              </div>

                              <div>
                                <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>New Tab</div>
                                <div style={{ fontWeight: 600, color: '#1d2327' }}>
                                  {button.open_in_new_tab ? 'Yes' : 'No'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ color: '#646970' }}>No CTA buttons.</div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ ...cardStyle(), marginBottom: 20 }}>
                    <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327' }}>
                        Quick Summary
                      </div>
                    </div>

                    <div style={{ padding: 18, display: 'grid', gap: 12 }}>
                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#ffffff',
                              border: '1px solid #dcdcde',
                              color: '#1d2327',
                            }}
                          >
                            <User2 size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: '#646970', marginBottom: 4 }}>Affiliate</div>
                            <div style={{ fontWeight: 600, color: '#1d2327' }}>
                              {postDetails.affiliate?.name || '-'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#ffffff',
                              border: '1px solid #dcdcde',
                              color: '#1d2327',
                            }}
                          >
                            <Globe size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: '#646970', marginBottom: 4 }}>Website</div>
                            <div style={{ fontWeight: 600, color: '#1d2327' }}>
                              {postDetails.website?.website_name || '-'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#ffffff',
                              border: '1px solid #dcdcde',
                              color: '#1d2327',
                            }}
                          >
                            <Tag size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: '#646970', marginBottom: 4 }}>Category</div>
                            <div style={{ fontWeight: 600, color: '#1d2327' }}>
                              {postDetails.category?.name || '-'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#ffffff',
                              border: '1px solid #dcdcde',
                              color: '#1d2327',
                            }}
                          >
                            <FileText size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: '#646970', marginBottom: 4 }}>Quality</div>
                            <div style={{ fontWeight: 600, color: '#1d2327' }}>
                              {Math.round(qualityScore)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#ffffff',
                              border: '1px solid #dcdcde',
                              color: '#1d2327',
                            }}
                          >
                            <ShieldAlert size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: '#646970', marginBottom: 4 }}>Risk</div>
                            <div style={{ fontWeight: 600, color: '#1d2327' }}>
                              {Math.round(riskScore)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#ffffff',
                              border: '1px solid #dcdcde',
                              color: '#1d2327',
                            }}
                          >
                            <Search size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: '#646970', marginBottom: 4 }}>Similarity</div>
                            <div style={{ fontWeight: 600, color: '#1d2327' }}>
                              {Math.round(similarityScore)}%
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#ffffff',
                              border: '1px solid #dcdcde',
                              color: '#1d2327',
                            }}
                          >
                            <BadgeCheck size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: '#646970', marginBottom: 4 }}>Review Status</div>
                            <div style={{ fontWeight: 600, color: '#1d2327' }}>
                              {reviewStatus}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={cardStyle()}>
                    <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327' }}>
                        Actions
                      </div>
                    </div>

                    <div style={{ padding: 18, display: 'grid', gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => handleStatusChange('published')}
                        disabled={statusSaving}
                        style={{
                          border: '1px solid #00a32a',
                          background: '#ffffff',
                          color: '#00a32a',
                          padding: '10px 14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                        <BadgeCheck size={16} />
                        Publish
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange('draft')}
                        disabled={statusSaving}
                        style={{
                          border: '1px solid #dba617',
                          background: '#ffffff',
                          color: '#9a6700',
                          padding: '10px 14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                        <SquarePen size={16} />
                        Set Draft
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange('inactive')}
                        disabled={statusSaving}
                        style={{
                          border: '1px solid #d63638',
                          background: '#ffffff',
                          color: '#d63638',
                          padding: '10px 14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                        <XCircle size={16} />
                        Set Inactive
                      </button>

                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        style={{
                          border: '1px solid #d63638',
                          background: '#fff1f2',
                          color: '#d63638',
                          padding: '10px 14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                        <Trash2 size={16} />
                        {deleting ? 'Deleting...' : 'Delete Post'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={cardStyle({ padding: 40, textAlign: 'center', color: '#646970' })}>
              Choose a post from the left panel to inspect full details and manage its status.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}