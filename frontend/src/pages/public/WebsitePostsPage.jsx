import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';

export default function WebsitePostsPage() {
  const { websiteSlug } = useParams();

  const [postsData, setPostsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/public/posts/${websiteSlug}/posts`);
        setPostsData(data || null);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load website posts');
      } finally {
        setLoading(false);
      }
    };

    if (websiteSlug) {
      fetchPosts();
    }
  }, [websiteSlug]);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading website posts...</div>
      </div>
    );
  }

  const posts = postsData?.posts || [];

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">Website Posts</h1>
          <p className="page-subtitle">
            Browse all published posts from this affiliate website.
          </p>
        </div>

        {error ? (
          <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
            {error}
          </div>
        ) : null}

        <div className="grid-3">
          {posts.length ? (
            posts.map((post) => (
              <div key={post.id} className="surface-card surface-card-padding">
                {post.featured_image ? (
                  <img
                    src={post.featured_image}
                    alt={post.title}
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
                  <div style={{ fontWeight: 700 }}>{post.title}</div>
                  <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                    Product: {post.product?.title || '-'}
                  </div>
                  <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                    Category: {post.category?.name || '-'}
                  </div>
                  <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                    {post.excerpt || 'No excerpt'}
                  </div>

                  <Link className="btn btn-primary" to={`/${websiteSlug}/post/${post.slug}`}>
                    Read Post
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="surface-card surface-card-padding">No published posts found.</div>
          )}
        </div>
      </div>
    </div>
  );
}