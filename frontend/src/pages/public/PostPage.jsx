import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';

function renderField(field) {
  if (!field) return null;

  if (field.field_type === 'image' && field.field_value) {
    return (
      <img
        src={field.field_value}
        alt={field.field_key}
        style={{
          width: '100%',
          maxHeight: 420,
          objectFit: 'cover',
          borderRadius: 16,
          marginTop: 10,
        }}
      />
    );
  }

  if (field.field_type === 'url' && field.field_value) {
    return (
      <a
        href={field.field_value}
        target="_blank"
        rel="noreferrer"
        style={{ color: '#9ec5ff', wordBreak: 'break-word' }}
      >
        {field.field_value}
      </a>
    );
  }

  return <div style={{ whiteSpace: 'pre-wrap' }}>{field.field_value || '-'}</div>;
}

export default function PostPage() {
  const { websiteSlug, slug } = useParams();

  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/public/posts/${websiteSlug}/post/${slug}`);
        setPostData(data || null);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    if (websiteSlug && slug) {
      fetchPost();
    }
  }, [websiteSlug, slug]);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading post...</div>
      </div>
    );
  }

  const post = postData?.post;
  const templateFields = postData?.template_fields || [];
  const ctaButtons = postData?.cta_buttons || [];
  const relatedPosts = postData?.related_posts || [];

  return (
    <div className="page-shell">
      <div className="container section-space">
        {error ? (
          <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
            {error}
          </div>
        ) : null}

        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          {post?.featured_image ? (
            <img
              src={post.featured_image}
              alt={post.title}
              style={{
                width: '100%',
                maxHeight: 420,
                objectFit: 'cover',
                borderRadius: 18,
                marginBottom: 20,
              }}
            />
          ) : null}

          <h1 className="page-title">{post?.title || 'Post'}</h1>
          <p className="page-subtitle">
            {post?.website?.website_name || '-'} • {post?.product?.title || '-'}
          </p>

          <div className="form-stack" style={{ marginTop: 20 }}>
            <div>
              <strong>Category:</strong> {post?.category?.name || '-'}
            </div>
            <div>
              <strong>Template:</strong> {post?.template?.name || '-'}
            </div>
            <div>
              <strong>Published:</strong> {post?.published_at || '-'}
            </div>
            <div>
              <strong>Excerpt:</strong> {post?.excerpt || 'No excerpt'}
            </div>
          </div>
        </div>

        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h2 className="section-title">Post Content</h2>

          <div className="form-stack">
            {templateFields.length ? (
              templateFields.map((field) => (
                <div key={field.id} className="surface-card surface-card-padding">
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>
                    {field.field_key}
                  </div>
                  {renderField(field)}
                </div>
              ))
            ) : (
              <div>No post content fields available.</div>
            )}
          </div>
        </div>

        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h2 className="section-title">Call To Action</h2>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {ctaButtons.length ? (
              ctaButtons.map((button) => (
                <a
                  key={button.id}
                  className={button.button_style === 'secondary' ? 'btn btn-secondary' : 'btn btn-primary'}
                  href={button.button_url || '#'}
                  target={button.open_in_new_tab ? '_blank' : '_self'}
                  rel={button.open_in_new_tab ? 'noreferrer' : undefined}
                >
                  {button.button_label}
                </a>
              ))
            ) : (
              <div>No CTA buttons available.</div>
            )}
          </div>
        </div>

        <div className="surface-card surface-card-padding">
          <h2 className="section-title">Related Posts</h2>

          <div className="grid-3">
            {relatedPosts.length ? (
              relatedPosts.map((item) => (
                <div key={item.id} className="surface-card surface-card-padding">
                  {item.featured_image ? (
                    <img
                      src={item.featured_image}
                      alt={item.title}
                      style={{
                        width: '100%',
                        height: 220,
                        objectFit: 'cover',
                        borderRadius: 16,
                        marginBottom: 14,
                      }}
                    />
                  ) : null}

                  <div style={{ display: 'grid', gap: 8 }}>
                    <div style={{ fontWeight: 700 }}>{item.title}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      {item.excerpt || 'No excerpt'}
                    </div>

                    <Link className="btn btn-secondary" to={`/${websiteSlug}/post/${item.slug}`}>
                      Read Post
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div>No related posts found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}