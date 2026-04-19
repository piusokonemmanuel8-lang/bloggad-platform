import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState('');
  const [postDetails, setPostDetails] = useState(null);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">Admin Posts</h1>
          <p className="page-subtitle">
            Review affiliate posts, inspect fields and CTA buttons, change status, and delete posts.
          </p>
        </div>

        <div className="grid-2">
          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Post List</h2>

            <div className="form-stack">
              {posts.length ? (
                posts.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    className="surface-card surface-card-padding"
                    onClick={() => handleSelectPost(post)}
                    style={{
                      textAlign: 'left',
                      cursor: 'pointer',
                      border:
                        String(selectedPostId) === String(post.id)
                          ? '1px solid rgba(122, 92, 255, 0.9)'
                          : '1px solid rgba(255,255,255,0.08)',
                      background:
                        String(selectedPostId) === String(post.id)
                          ? 'rgba(122, 92, 255, 0.12)'
                          : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{post.title}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Affiliate: {post.affiliate?.name || '-'}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Product: {post.product?.title || '-'}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Status: {post.status}
                    </div>
                  </button>
                ))
              ) : (
                <div>No posts found.</div>
              )}
            </div>
          </div>

          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Post Details</h2>

            {detailsLoading ? (
              <div>Loading post details...</div>
            ) : postDetails ? (
              <div className="form-stack">
                <div className="surface-card surface-card-padding">
                  {postDetails.featured_image ? (
                    <img
                      src={postDetails.featured_image}
                      alt={postDetails.title}
                      style={{
                        width: '100%',
                        height: 240,
                        objectFit: 'cover',
                        borderRadius: 16,
                        marginBottom: 14,
                      }}
                    />
                  ) : null}

                  <div><strong>Title:</strong> {postDetails.title}</div>
                  <div><strong>Slug:</strong> {postDetails.slug}</div>
                  <div><strong>Status:</strong> {postDetails.status}</div>
                  <div><strong>Affiliate:</strong> {postDetails.affiliate?.name || '-'}</div>
                  <div><strong>Website:</strong> {postDetails.website?.website_name || '-'}</div>
                  <div><strong>Product:</strong> {postDetails.product?.title || '-'}</div>
                  <div><strong>Category:</strong> {postDetails.category?.name || '-'}</div>
                  <div><strong>Template:</strong> {postDetails.template?.name || '-'}</div>
                  <div><strong>Published At:</strong> {postDetails.published_at || '-'}</div>
                </div>

                <div className="surface-card surface-card-padding">
                  <h3 className="section-title">Excerpt</h3>
                  <div>{postDetails.excerpt || 'No excerpt'}</div>
                </div>

                <div className="surface-card surface-card-padding">
                  <h3 className="section-title">SEO</h3>
                  <div><strong>SEO Title:</strong> {postDetails.seo_title || '-'}</div>
                  <div><strong>SEO Description:</strong> {postDetails.seo_description || '-'}</div>
                </div>

                <div className="surface-card surface-card-padding">
                  <h3 className="section-title">Template Fields</h3>

                  <div className="form-stack">
                    {(postDetails.template_fields || []).length ? (
                      postDetails.template_fields.map((field) => (
                        <div key={field.id} className="surface-card surface-card-padding">
                          <div><strong>Key:</strong> {field.field_key}</div>
                          <div><strong>Type:</strong> {field.field_type}</div>
                          <div><strong>Value:</strong> {field.field_value || '-'}</div>
                        </div>
                      ))
                    ) : (
                      <div>No template fields.</div>
                    )}
                  </div>
                </div>

                <div className="surface-card surface-card-padding">
                  <h3 className="section-title">CTA Buttons</h3>

                  <div className="form-stack">
                    {(postDetails.cta_buttons || []).length ? (
                      postDetails.cta_buttons.map((button) => (
                        <div key={button.id} className="surface-card surface-card-padding">
                          <div><strong>Label:</strong> {button.button_label}</div>
                          <div><strong>URL:</strong> {button.button_url || '-'}</div>
                          <div><strong>Style:</strong> {button.button_style || '-'}</div>
                          <div>
                            <strong>New Tab:</strong> {button.open_in_new_tab ? 'Yes' : 'No'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div>No CTA buttons.</div>
                    )}
                  </div>
                </div>

                <div className="surface-card surface-card-padding">
                  <h3 className="section-title">Actions</h3>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => handleStatusChange('published')}
                      disabled={statusSaving}
                    >
                      Publish
                    </button>

                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => handleStatusChange('draft')}
                      disabled={statusSaving}
                    >
                      Set Draft
                    </button>

                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => handleStatusChange('inactive')}
                      disabled={statusSaving}
                    >
                      Set Inactive
                    </button>

                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : 'Delete Post'}
                    </button>
                  </div>
                </div>

                {error ? (
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: 'rgba(255, 80, 80, 0.12)',
                      border: '1px solid rgba(255, 80, 80, 0.22)',
                    }}
                  >
                    {error}
                  </div>
                ) : null}

                {success ? (
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: 'rgba(80, 200, 120, 0.12)',
                      border: '1px solid rgba(80, 200, 120, 0.22)',
                    }}
                  >
                    {success}
                  </div>
                ) : null}
              </div>
            ) : (
              <div>Select a post to view details.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}