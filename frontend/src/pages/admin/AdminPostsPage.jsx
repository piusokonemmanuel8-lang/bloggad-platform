import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  SquarePen,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import api from '../../api/axios';
import './AdminPostsPage.css';

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function cleanStatus(value) {
  return String(value || '').trim().toLowerCase();
}

function StatusBadge({ status }) {
  const clean = cleanStatus(status);
  return <span className={`ap-badge ap-badge-${clean || 'neutral'}`}>{status || '-'}</span>;
}

function ReviewBadge({ status }) {
  const clean = cleanStatus(status).replaceAll('_', '-');
  return (
    <span className={`ap-badge ap-review-${clean || 'neutral'}`}>
      {String(status || 'not_checked').replaceAll('_', ' ')}
    </span>
  );
}

function ScorePill({ label, value, reversed = false, suffix = '' }) {
  const numeric = Number(value || 0);
  const effective = reversed ? 100 - numeric : numeric;
  const tone = effective >= 75 ? 'good' : effective >= 60 ? 'warn' : 'bad';

  return (
    <span className={`ap-score ap-score-${tone}`}>
      <span>{label}</span>
      <strong>{Math.round(numeric)}{suffix}</strong>
    </span>
  );
}

function EmptyState({ children }) {
  return <div className="ap-empty">{children}</div>;
}

function FieldValue({ value }) {
  return <div className="ap-field-value">{value || '-'}</div>;
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([]);
  const [counts, setCounts] = useState({ total: 0, published: 0, draft: 0, inactive: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, total_pages: 1 });
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [reviewFilter, setReviewFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [scanOpen, setScanOpen] = useState(false);
  const [scanJob, setScanJob] = useState(null);
  const [scanResults, setScanResults] = useState([]);
  const [scanError, setScanError] = useState('');
  const [scanApproving, setScanApproving] = useState(false);
  const [resolvingDomain, setResolvingDomain] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState('');
  const [postDetails, setPostDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadPosts = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      setError('');
      const { data } = await api.get('/api/admin/posts', {
        params: {
          page,
          limit,
          search: search || undefined,
          status: statusFilter || undefined,
          review_status: reviewFilter || undefined,
        },
      });
      setPosts(Array.isArray(data?.posts) ? data.posts : []);
      setCounts(data?.counts || { total: 0, published: 0, draft: 0, inactive: 0 });
      setPagination(data?.pagination || {
        page,
        limit,
        total: Number(data?.posts?.length || 0),
        total_pages: 1,
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load posts');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchSinglePost = async (postId) => {
    const { data } = await api.get(`/api/admin/posts/${postId}`);
    setPostDetails(data?.post || null);
  };

  useEffect(() => {
    loadPosts();
  }, [page, limit, search, statusFilter, reviewFilter]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  const allPageSelected = useMemo(
    () => posts.length > 0 && posts.every((post) => selectedIds.includes(Number(post.id))),
    [posts, selectedIds]
  );

  const qualityReview = postDetails?.quality_review || null;
  const reviewStatus = qualityReview?.review_status || postDetails?.review_status || 'not_checked';
  const qualityScore = Number(qualityReview?.quality_score ?? postDetails?.quality_score ?? 0);
  const riskScore = Number(qualityReview?.risk_score ?? postDetails?.risk_score ?? 0);
  const similarityScore = Number(qualityReview?.similarity_score ?? postDetails?.similarity_score ?? 0);
  const blockedReason = qualityReview?.blocked_reason || postDetails?.quality_blocked_reason || '';
  const fieldScores = Array.isArray(qualityReview?.field_scores) ? qualityReview.field_scores : [];
  const warnings = Array.isArray(qualityReview?.warnings) ? qualityReview.warnings : [];

  const clearSelection = () => {
    setSelectedIds([]);
    setBulkAction('');
  };

  const changeStatusFilter = (nextStatus) => {
    clearSelection();
    setStatusFilter(nextStatus);
    setPage(1);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    clearSelection();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setSuccess('');
      setError('');
      await loadPosts({ silent: true });
      if (drawerOpen && selectedPostId) await fetchSinglePost(selectedPostId);
      setSuccess('Posts refreshed successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to refresh posts');
    } finally {
      setRefreshing(false);
    }
  };

  const openModeration = async (post) => {
    try {
      setSelectedPostId(String(post.id));
      setDrawerOpen(true);
      setPostDetails(null);
      setDetailsLoading(true);
      setError('');
      setSuccess('');
      await fetchSinglePost(post.id);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load post details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const togglePost = (postId) => {
    const numericId = Number(postId);
    setSelectedIds((current) => current.includes(numericId)
      ? current.filter((id) => id !== numericId)
      : [...current, numericId]);
  };

  const toggleAllPage = () => {
    const pageIds = posts.map((post) => Number(post.id));
    setSelectedIds((current) => {
      if (posts.length && posts.every((post) => current.includes(Number(post.id)))) {
        return current.filter((id) => !pageIds.includes(id));
      }
      return Array.from(new Set([...current, ...pageIds]));
    });
  };

  const handleStatusChange = async (status) => {
    if (!selectedPostId) return;
    try {
      setStatusSaving(true);
      setError('');
      setSuccess('');
      const { data } = await api.put(`/api/admin/posts/${selectedPostId}/status`, { status });
      await Promise.all([loadPosts({ silent: true }), fetchSinglePost(selectedPostId)]);
      setSuccess(data?.message || 'Post status updated successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update post status');
    } finally {
      setStatusSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPostId) return;
    const confirmed = window.confirm('Delete this post permanently? This cannot be undone.');
    if (!confirmed) return;
    try {
      setDeleting(true);
      setError('');
      setSuccess('');
      const { data } = await api.delete(`/api/admin/posts/${selectedPostId}`);
      setDrawerOpen(false);
      setSelectedPostId('');
      setPostDetails(null);
      setSelectedIds((current) => current.filter((id) => String(id) !== String(selectedPostId)));
      await loadPosts({ silent: true });
      setSuccess(data?.message || 'Post deleted successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  const flattenScanLinks = (results = scanResults) =>
    results.flatMap((post) =>
      (post.links || []).map((link) => ({
        ...link,
        post_id: post.post_id,
        post_title: post.title,
      }))
    );

  const pollScanJob = async (jobId) => {
    try {
      const { data } = await api.get(`/api/admin/posts/bulk/link-scan/${jobId}`);
      const job = data?.job || null;
      setScanJob(job);

      if (job?.status === 'completed') {
        setScanResults(Array.isArray(job.results) ? job.results : []);
        return;
      }

      if (job?.status === 'failed') {
        setScanError(job?.error || 'Link scan failed');
        return;
      }

      window.setTimeout(() => pollScanJob(jobId), 450);
    } catch (err) {
      setScanError(err?.response?.data?.message || 'Failed to read scan progress');
    }
  };

  const startBulkLinkScan = async () => {
    if (!selectedIds.length) {
      setError('Select at least one pending post to scan');
      return;
    }

    if (selectedIds.length > 20) {
      setError('A maximum of 20 posts can be scanned at once');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setScanError('');
      setScanResults([]);
      setScanOpen(true);
      setScanJob({ status: 'starting', total: selectedIds.length, completed: 0, progress: 0 });

      const { data } = await api.post('/api/admin/posts/bulk/link-scan', { ids: selectedIds });
      const job = data?.job || null;
      setScanJob(job);

      if (job?.id) {
        pollScanJob(job.id);
      } else {
        setScanError('Link scan did not start');
      }
    } catch (err) {
      setScanError(err?.response?.data?.message || 'Failed to start link scan');
    }
  };

  const copyLink = async (value) => {
    try {
      await navigator.clipboard.writeText(String(value || ''));
      setSuccess('Link copied');
    } catch {
      setError('Could not copy link');
    }
  };

  const openExternalLink = (value) => {
    const url = String(value || '').trim();
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const resolveScannedDomain = async (link, decision) => {
    const domain = String(link?.host || '').trim();
    if (!domain) return;

    try {
      setResolvingDomain(domain);
      setScanError('');

      await api.post('/api/admin/posts/bulk/link-review', {
        domain,
        decision,
        reason: decision === 'allow'
          ? 'Admin marked this domain as not suspicious during post moderation'
          : 'Admin blocked this domain during post moderation',
      });

      setScanResults((current) =>
        current.map((post) => {
          const nextLinks = (post.links || []).map((item) =>
            String(item.host || '').toLowerCase() === domain.toLowerCase()
              ? {
                  ...item,
                  verdict: decision === 'allow' ? 'clear' : 'blocked',
                  reasons: [
                    decision === 'allow'
                      ? 'Admin marked this domain as not suspicious'
                      : 'Admin blocked this domain',
                  ],
                }
              : item
          );

          return {
            ...post,
            links: nextLinks,
            clear: nextLinks.every((item) => item.verdict === 'clear'),
          };
        })
      );
    } catch (err) {
      setScanError(err?.response?.data?.message || 'Failed to update domain decision');
    } finally {
      setResolvingDomain('');
    }
  };

  const approveScannedPosts = async () => {
    if (!selectedIds.length) return;

    try {
      setScanApproving(true);
      setScanError('');

      const { data } = await api.post('/api/admin/posts/bulk/approve-after-scan', {
        ids: selectedIds,
      });

      setScanOpen(false);
      setScanJob(null);
      setScanResults([]);
      clearSelection();
      await loadPosts({ silent: true });
      setSuccess(data?.message || 'Selected posts approved and published');
    } catch (err) {
      const results = err?.response?.data?.results;
      if (Array.isArray(results)) {
        setScanResults(results);
      }
      setScanError(
        err?.response?.data?.message ||
          'Some links still require review before these posts can be published'
      );
    } finally {
      setScanApproving(false);
    }
  };

  const applyBulkAction = async () => {
    if (!bulkAction || selectedIds.length === 0) return;
    const actionLabel = bulkAction === 'delete' ? 'delete permanently'
      : bulkAction === 'draft' ? 'set as draft'
      : 'set inactive';
    const confirmed = window.confirm(
      `${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)} ${selectedIds.length} selected post(s)?`
    );
    if (!confirmed) return;

    try {
      setBulkSaving(true);
      setError('');
      setSuccess('');
      let data;
      if (bulkAction === 'delete') {
        const response = await api.post('/api/admin/posts/bulk/delete', { ids: selectedIds });
        data = response.data;
      } else {
        const response = await api.post('/api/admin/posts/bulk/status', {
          ids: selectedIds,
          status: bulkAction,
        });
        data = response.data;
      }

      const selectedAffected = selectedPostId && selectedIds.includes(Number(selectedPostId));
      if (bulkAction === 'delete' && selectedAffected) {
        setDrawerOpen(false);
        setSelectedPostId('');
        setPostDetails(null);
      } else if (drawerOpen && selectedAffected) {
        await fetchSinglePost(selectedPostId);
      }

      clearSelection();
      await loadPosts({ silent: true });
      setSuccess(data?.message || 'Bulk action completed successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Bulk action failed');
    } finally {
      setBulkSaving(false);
    }
  };

  const currentPage = Number(pagination?.page || page || 1);
  const totalPages = Math.max(1, Number(pagination?.total_pages || 1));
  const filteredTotal = Number(pagination?.total || 0);

  return (
    <div className="admin-posts-page">
      <div className="ap-page-heading">
        <div>
          <h1>Posts</h1>
          <p>High-volume post moderation, publishing, quality review, and bulk administration.</p>
        </div>
        <button type="button" className="ap-button ap-button-secondary" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={16} className={refreshing ? 'spin-soft' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error ? <div className="ap-notice ap-notice-error">{error}</div> : null}
      {success ? <div className="ap-notice ap-notice-success">{success}</div> : null}

      <div className="ap-status-tabs" role="tablist" aria-label="Post status filters">
        <button type="button" className={!statusFilter ? 'active' : ''} onClick={() => changeStatusFilter('')}>
          All <strong>{counts.total}</strong>
        </button>
        <button type="button" className={statusFilter === 'published' ? 'active' : ''} onClick={() => changeStatusFilter('published')}>
          Published <strong>{counts.published}</strong>
        </button>
        <button type="button" className={statusFilter === 'draft' ? 'active' : ''} onClick={() => changeStatusFilter('draft')}>
          Draft <strong>{counts.draft}</strong>
        </button>
        <button type="button" className={statusFilter === 'inactive' ? 'active' : ''} onClick={() => changeStatusFilter('inactive')}>
          Inactive <strong>{counts.inactive}</strong>
        </button>
      </div>

      <div className="ap-table-shell">
        <div className="ap-toolbar">
          <div className="ap-bulk-tools">
            <select value={bulkAction} onChange={(event) => setBulkAction(event.target.value)} aria-label="Bulk action">
              <option value="">Bulk actions</option>
              <option value="draft">Set Draft</option>
              <option value="inactive">Set Inactive</option>
              <option value="delete">Delete permanently</option>
            </select>
            <button type="button" className="ap-button ap-button-secondary" onClick={applyBulkAction}
              disabled={!bulkAction || selectedIds.length === 0 || bulkSaving}>
              {bulkSaving ? 'Applying...' : 'Apply'}
            </button>
            <button
              type="button"
              className="ap-button ap-button-scan"
              onClick={startBulkLinkScan}
              disabled={selectedIds.length === 0 || selectedIds.length > 20}
            >
              <ShieldAlert size={16} />
              Scan Links
            </button>
            <span className="ap-selected-count">
              {selectedIds.length ? `${selectedIds.length} selected` : 'No posts selected'}
            </span>
          </div>

          <div className="ap-filter-tools">
            <select value={reviewFilter} onChange={(event) => { clearSelection(); setReviewFilter(event.target.value); setPage(1); }} aria-label="Review status filter">
              <option value="">All review states</option>
              <option value="not_checked">Not checked</option>
              <option value="pending_review">Pending review</option>
              <option value="approved">Approved</option>
              <option value="needs_revision">Needs revision</option>
              <option value="rejected">Rejected</option>
            </select>
            <form className="ap-search" onSubmit={handleSearchSubmit}>
              <Search size={16} />
              <input type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search posts..." />
              <button type="submit">Search</button>
            </form>
          </div>
        </div>

        {loading ? (
          <div className="ap-loading"><Loader2 size={18} className="spin-soft" />Loading posts...</div>
        ) : (
          <div className="ap-table-scroll">
            <table className="ap-post-table">
              <thead>
                <tr>
                  <th className="ap-check-col"><input type="checkbox" checked={allPageSelected} onChange={toggleAllPage} aria-label="Select all posts on this page" /></th>
                  <th>Post</th><th>Writer</th><th>Category</th><th>Status</th><th>Review</th><th>Quality</th><th>Date</th><th className="ap-action-col">Action</th>
                </tr>
              </thead>
              <tbody>
                {posts.length ? posts.map((post) => {
                  const rowReview = post?.review_status || 'not_checked';
                  const selected = selectedIds.includes(Number(post.id));
                  return (
                    <tr key={post.id} className={selected ? 'is-selected' : ''}>
                      <td className="ap-check-col"><input type="checkbox" checked={selected} onChange={() => togglePost(post.id)} aria-label={`Select ${post.title || `post ${post.id}`}`} /></td>
                      <td className="ap-title-cell">
                        <div className="ap-title-wrap">
                          <div className="ap-thumb">{post.featured_image ? <img src={post.featured_image} alt="" /> : <ImageIcon size={18} />}</div>
                          <div className="ap-title-copy">
                            <button type="button" onClick={() => openModeration(post)}>{post.title || `Post #${post.id}`}</button>
                            <div>ID {post.id}{post.product?.title ? ` | ${post.product.title}` : ''}</div>
                          </div>
                        </div>
                      </td>
                      <td><div className="ap-cell-primary">{post.affiliate?.name || '-'}</div><div className="ap-cell-secondary">{post.affiliate?.email || ''}</div></td>
                      <td>{post.category?.name || '-'}</td>
                      <td><StatusBadge status={post.status} /></td>
                      <td><ReviewBadge status={rowReview} /></td>
                      <td><div className="ap-quality-stack"><ScorePill label="Q" value={post.quality_score} /><ScorePill label="R" value={post.risk_score} reversed /></div></td>
                      <td><div className="ap-cell-primary">{formatDateTime(post.created_at)}</div>{post.published_at ? <div className="ap-cell-secondary">Published {formatDateTime(post.published_at)}</div> : null}</td>
                      <td className="ap-action-col"><button type="button" className="ap-link-button" onClick={() => openModeration(post)}>Moderate</button></td>
                    </tr>
                  );
                }) : <tr><td colSpan="9"><EmptyState>No posts match the current filters.</EmptyState></td></tr>}
              </tbody>
            </table>
          </div>
        )}

        <div className="ap-table-footer">
          <div className="ap-footer-meta"><strong>{filteredTotal}</strong> matching post{filteredTotal === 1 ? '' : 's'}</div>
          <div className="ap-pagination">
            <label>Per page
              <select value={limit} disabled>
                <option value="20">20</option>
              </select>
            </label>
            <button type="button" className="ap-icon-button" onClick={() => { clearSelection(); setPage((current) => Math.max(1, current - 1)); }} disabled={currentPage <= 1} aria-label="Previous page"><ChevronLeft size={17} /></button>
            <span>Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></span>
            <button type="button" className="ap-icon-button" onClick={() => { clearSelection(); setPage((current) => Math.min(totalPages, current + 1)); }} disabled={currentPage >= totalPages} aria-label="Next page"><ChevronRight size={17} /></button>
          </div>
        </div>
      </div>

      {scanOpen ? (
        <div className="ap-scan-layer" role="dialog" aria-modal="true" aria-label="Bulk link scan">
          <div className="ap-scan-card">
            <div className="ap-scan-head">
              <div>
                <div className="ap-eyebrow">Bulk moderation</div>
                <h2>Link scan</h2>
                <p>Scanning up to 20 selected posts before approval.</p>
              </div>
              <button type="button" className="ap-icon-button" onClick={() => setScanOpen(false)} aria-label="Close link scan">
                <X size={18} />
              </button>
            </div>

            <div className="ap-scan-body">
              {scanJob && scanJob.status !== 'completed' && scanJob.status !== 'failed' ? (
                <div className="ap-scan-progress-card">
                  <div className="ap-scan-progress-copy">
                    <strong>Scanning...</strong>
                    <span>{Number(scanJob.completed || 0)} / {Number(scanJob.total || selectedIds.length)} posts</span>
                  </div>
                  <div className="ap-progress-track">
                    <div className="ap-progress-bar" style={{ width: `${Math.max(2, Number(scanJob.progress || 0))}%` }} />
                  </div>
                </div>
              ) : null}

              {scanError ? <div className="ap-notice ap-notice-error">{scanError}</div> : null}

              {scanJob?.status === 'completed' ? (
                <>
                  {flattenScanLinks().filter((link) => link.verdict !== 'clear').length === 0 ? (
                    <div className="ap-scan-clean">
                      <BadgeCheck size={18} />
                      <div>
                        <strong>No suspicious link signals found</strong>
                        <span>{scanResults.length} post(s) scanned. You can approve and publish them together.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="ap-scan-warning">
                      <ShieldAlert size={18} />
                      <div>
                        <strong>Some links need attention</strong>
                        <span>Investigate only the flagged links, then mark the domain safe or block it.</span>
                      </div>
                    </div>
                  )}

                  <div className="ap-scan-results">
                    {scanResults.map((post) => (
                      <section className="ap-scan-post" key={post.post_id}>
                        <div className="ap-scan-post-head">
                          <div>
                            <strong>{post.title || `Post #${post.post_id}`}</strong>
                            <span>{(post.links || []).length} link(s)</span>
                          </div>
                          <span className={`ap-link-verdict ${post.clear ? 'is-clear' : 'is-review'}`}>
                            {post.clear ? 'No suspicious signals' : 'Needs attention'}
                          </span>
                        </div>

                        {(post.links || []).length ? (
                          <div className="ap-scan-links">
                            {post.links.map((link, index) => (
                              <div className="ap-scan-link" key={`${post.post_id}-${link.normalized_url || link.url}-${index}`}>
                                <div className="ap-scan-link-main">
                                  <div className="ap-scan-link-top">
                                    <span className={`ap-link-verdict is-${link.verdict}`}>
                                      {link.verdict === 'clear' ? 'No suspicious signals' : link.verdict}
                                    </span>
                                    <span>{String(link.protocol || '').replace(':', '').toUpperCase() || '-'}</span>
                                    <span>{link.host || '-'}</span>
                                  </div>
                                  <div className="ap-scan-url">{link.normalized_url || link.url}</div>
                                  <small>{(link.reasons || []).join(' | ') || 'No suspicious signals found by Bloggad checks'}</small>
                                </div>

                                <div className="ap-scan-link-actions">
                                  <button type="button" onClick={() => openExternalLink(link.normalized_url || link.url)}>Open</button>
                                  <button type="button" onClick={() => copyLink(link.normalized_url || link.url)}>Copy</button>
                                  {link.verdict !== 'clear' ? (
                                    <button type="button" onClick={() => resolveScannedDomain(link, 'allow')} disabled={resolvingDomain === link.host}>
                                      Not suspicious
                                    </button>
                                  ) : null}
                                  <button type="button" className="danger" onClick={() => resolveScannedDomain(link, 'block')} disabled={resolvingDomain === link.host}>
                                    Block
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="ap-empty ap-scan-empty">No outbound links found in this post.</div>
                        )}
                      </section>
                    ))}
                  </div>
                </>
              ) : null}
            </div>

            <div className="ap-scan-footer">
              <div>
                {scanJob?.status === 'completed'
                  ? `${flattenScanLinks().length} total link(s) found`
                  : 'Keep this window open while Bloggad scans the selected posts.'}
              </div>
              <div className="ap-scan-footer-actions">
                <button type="button" className="ap-button ap-button-secondary" onClick={() => setScanOpen(false)}>Close</button>
                {scanJob?.status === 'completed' ? (
                  <button
                    type="button"
                    className="ap-button ap-button-publish"
                    onClick={approveScannedPosts}
                    disabled={scanApproving || flattenScanLinks().some((link) => link.verdict !== 'clear')}
                  >
                    <BadgeCheck size={16} />
                    {scanApproving ? 'Approving...' : 'Approve & Publish All'}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {drawerOpen ? (
        <div className="ap-drawer-layer" role="presentation">
          <button type="button" className="ap-drawer-backdrop" aria-label="Close moderation panel" onClick={() => setDrawerOpen(false)} />
          <aside className="ap-drawer" aria-label="Post moderation panel">
            <div className="ap-drawer-topbar">
              <div><div className="ap-eyebrow">Post moderation</div><div className="ap-drawer-heading">{postDetails?.title || (detailsLoading ? 'Loading...' : 'Post details')}</div></div>
              <button type="button" className="ap-icon-button" onClick={() => setDrawerOpen(false)} aria-label="Close moderation panel"><X size={18} /></button>
            </div>

            <div className="ap-drawer-scroll">
              {detailsLoading ? <div className="ap-loading"><Loader2 size={18} className="spin-soft" />Loading moderation details...</div>
              : postDetails ? (
                <>
                  <div className="ap-feature">{postDetails.featured_image ? <img src={postDetails.featured_image} alt={postDetails.title || ''} /> : <div className="ap-feature-empty"><ImageIcon size={30} /><span>No featured image</span></div>}</div>

                  <section className="ap-section">
                    <div className="ap-section-title-row"><div><h2>{postDetails.title || '-'}</h2><div className="ap-inline-badges"><StatusBadge status={postDetails.status} /><ReviewBadge status={reviewStatus} /></div></div></div>
                    <div className="ap-meta-grid">
                      <div><span>Writer</span><strong>{postDetails.affiliate?.name || '-'}</strong><small>{postDetails.affiliate?.email || ''}</small></div>
                      <div><span>Category</span><strong>{postDetails.category?.name || '-'}</strong></div>
                      <div><span>Product</span><strong>{postDetails.product?.title || '-'}</strong></div>
                      <div><span>Website</span><strong>{postDetails.website?.website_name || '-'}</strong></div>
                      <div><span>Template</span><strong>{postDetails.template?.name || '-'}</strong></div>
                      <div><span>Published</span><strong>{formatDateTime(postDetails.published_at)}</strong></div>
                    </div>
                  </section>

                  <section className="ap-section">
                    <div className="ap-section-heading"><h3>Quality review</h3><span>Existing quality and similarity checks</span></div>
                    <div className="ap-score-grid"><div><span>Quality score</span><strong>{Math.round(qualityScore)}</strong></div><div><span>Risk score</span><strong>{Math.round(riskScore)}</strong></div><div><span>Similarity</span><strong>{Math.round(similarityScore)}%</strong></div></div>
                    {blockedReason ? <div className="ap-warning-block"><strong>Blocked reason</strong><span>{blockedReason}</span></div> : null}
                    {warnings.length ? <div className="ap-stack"><h4>Warnings</h4>{warnings.map((warning, index) => <div key={warning.id || `${warning.field_key || 'warning'}-${index}`} className="ap-warning-item"><strong>{warning.field_key || warning.warning_type || 'Warning'}</strong><span>{warning.message || '-'}</span>{warning.suggestion ? <small>{warning.suggestion}</small> : null}</div>)}</div> : null}
                    <div className="ap-stack"><h4>Field scores</h4>{fieldScores.length ? (
                      <div className="ap-field-score-table-wrap"><table className="ap-field-score-table"><thead><tr><th>Field</th><th>Quality</th><th>Risk</th><th>Similarity</th><th>Warning</th></tr></thead><tbody>{fieldScores.map((field) => <tr key={field.id || field.field_key}><td>{field.field_label || field.field_key || '-'}</td><td>{Math.round(Number(field.quality_score || 0))}</td><td>{Math.round(Number(field.risk_score || 0))}</td><td>{Math.round(Number(field.similarity_score || 0))}%</td><td>{field.warning_message || '-'}</td></tr>)}</tbody></table></div>
                    ) : <EmptyState>No field score details returned yet.</EmptyState>}</div>
                  </section>

                  <section className="ap-section">
                    <div className="ap-section-heading"><h3>Post content summary</h3></div>
                    <div className="ap-content-block"><span>Excerpt</span><p>{postDetails.excerpt || 'No excerpt'}</p></div>
                    <div className="ap-content-grid">
                      <div className="ap-content-block"><span>SEO title</span><FieldValue value={postDetails.seo_title} /></div>
                      <div className="ap-content-block"><span>SEO description</span><FieldValue value={postDetails.seo_description} /></div>
                      <div className="ap-content-block"><span>Slug</span><FieldValue value={postDetails.slug} /></div>
                      <div className="ap-content-block"><span>Total words</span><FieldValue value={qualityReview?.total_words || postDetails.total_words || 0} /></div>
                    </div>
                  </section>

                  <section className="ap-section">
                    <div className="ap-section-heading"><h3>Template fields</h3><span>{postDetails.template_fields?.length || 0} fields</span></div>
                    {(postDetails.template_fields || []).length ? <div className="ap-stack">{postDetails.template_fields.map((field) => <div className="ap-record" key={field.id}><div className="ap-record-head"><strong>{field.field_key || '-'}</strong><span>{field.field_type || '-'}</span></div><div className="ap-record-value">{field.field_value || '-'}</div></div>)}</div> : <EmptyState>No template fields.</EmptyState>}
                  </section>

                  <section className="ap-section">
                    <div className="ap-section-heading"><h3>CTA buttons and links</h3><span>{postDetails.cta_buttons?.length || 0} buttons</span></div>
                    {(postDetails.cta_buttons || []).length ? <div className="ap-stack">{postDetails.cta_buttons.map((button) => <div className="ap-record" key={button.id}><div className="ap-record-head"><strong>{button.button_label || '-'}</strong><span>{button.button_style || '-'}</span></div><div className="ap-url-row"><span>{button.button_url || '-'}</span>{button.button_url ? <a href={button.button_url} target="_blank" rel="noreferrer" title="Open link"><ExternalLink size={14} />Open</a> : null}</div><small>Open in new tab: {button.open_in_new_tab ? 'Yes' : 'No'}</small></div>)}</div> : <EmptyState>No CTA buttons.</EmptyState>}
                  </section>
                </>
              ) : <EmptyState>Post details could not be loaded.</EmptyState>}
            </div>

            {postDetails ? <div className="ap-drawer-actions">
              <button type="button" className="ap-button ap-button-publish" onClick={() => handleStatusChange('published')} disabled={statusSaving}><BadgeCheck size={16} />Scan & Publish</button>
              <button type="button" className="ap-button ap-button-secondary" onClick={() => handleStatusChange('draft')} disabled={statusSaving}><SquarePen size={16} />Set Draft</button>
              <button type="button" className="ap-button ap-button-secondary-danger" onClick={() => handleStatusChange('inactive')} disabled={statusSaving}><XCircle size={16} />Set Inactive</button>
              <button type="button" className="ap-button ap-button-danger" onClick={handleDelete} disabled={deleting}><Trash2 size={16} />{deleting ? 'Deleting...' : 'Delete'}</button>
            </div> : null}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
