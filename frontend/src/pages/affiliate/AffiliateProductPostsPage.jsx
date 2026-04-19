import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';

export default function AffiliateProductPostsPage() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProductPosts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/affiliate/posts/product/${id}`);
        setProduct(data?.product || null);
        setPosts(data?.posts || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load product posts');
      } finally {
        setLoading(false);
      }
    };

    fetchProductPosts();
  }, [id]);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading product posts...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div
          className="surface-card surface-card-padding"
          style={{
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <div>
            <h1 className="page-title">Product Posts</h1>
            <p className="page-subtitle">
              {product ? `Manage posts for ${product.title}` : 'Manage posts for this product.'}
            </p>
          </div>

          <Link className="btn btn-primary" to={`/affiliate/posts/create?product_id=${id}`}>
            Create Post
          </Link>
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
                  <div style={{ fontSize: '1.08rem', fontWeight: 700 }}>{post.title}</div>
                  <div style={{ color: 'rgba(245,247,251,0.7)' }}>Status: {post.status}</div>
                  <div style={{ color: 'rgba(245,247,251,0.7)' }}>
                    Template: {post.template_name || '-'}
                  </div>
                  <div style={{ color: 'rgba(245,247,251,0.7)' }}>
                    Category: {post.category_name || '-'}
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                    <Link className="btn btn-secondary" to={`/affiliate/posts/${post.id}/edit`}>
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="surface-card surface-card-padding">No posts yet for this product.</div>
          )}
        </div>
      </div>
    </div>
  );
}