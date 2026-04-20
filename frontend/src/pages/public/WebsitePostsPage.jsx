import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CalendarDays,
  ChevronRight,
  Loader2,
  Search,
  Tag,
  User2,
} from 'lucide-react';
import api from '../../api/axios';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function makeDummyPosts(websiteSlug) {
  const imagePool = [
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1400&q=80',
  ];

  return Array.from({ length: 9 }, (_, index) => ({
    id: `dummy-post-${index + 1}`,
    slug: `dummy-post-${index + 1}`,
    title: `Bloggad Post ${index + 1}`,
    excerpt: 'Premium website post card ready for your real published blog posts feed.',
    featured_image: imagePool[index % imagePool.length],
    published_at: new Date().toISOString(),
    product: {
      title: `Featured Product ${index + 1}`,
    },
    category: {
      name: index % 2 === 0 ? 'Reviews' : 'Guides',
    },
    website: {
      website_name: 'Bloggad Store',
      slug: websiteSlug,
    },
  }));
}

function PostCard({ post, websiteSlug }) {
  return (
    <article
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 22,
        overflow: 'hidden',
        boxShadow: '0 14px 32px rgba(15, 23, 42, 0.05)',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {post?.featured_image ? (
        <img
          src={post.featured_image}
          alt={post.title}
          style={{
            width: '100%',
            height: 240,
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: 240,
            background: '#f8fafc',
            borderBottom: '1px solid #eef2f7',
          }}
        />
      )}

      <div
        style={{
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
            marginBottom: 12,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              borderRadius: 999,
              background: '#eff6ff',
              color: '#2563eb',
              fontSize: 12,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            <Tag size={13} />
            {post?.category?.name || 'Post'}
          </span>
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: 22,
            lineHeight: 1.32,
            fontWeight: 900,
            color: '#111827',
            letterSpacing: '-0.02em',
            marginBottom: 12,
          }}
        >
          {post?.title || 'Post'}
        </h2>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
            fontSize: 13,
            color: '#64748b',
            fontWeight: 600,
            marginBottom: 14,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <CalendarDays size={14} />
            {formatDate(post?.published_at)}
          </span>

          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <User2 size={14} />
            {post?.website?.website_name || 'Website'}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gap: 8,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: '#475569',
              lineHeight: 1.75,
            }}
          >
            {post?.excerpt || 'No excerpt'}
          </div>

          <div
            style={{
              fontSize: 14,
              color: '#64748b',
            }}
          >
            <strong style={{ color: '#111827' }}>Product:</strong> {post?.product?.title || '-'}
          </div>

          <div
            style={{
              fontSize: 14,
              color: '#64748b',
            }}
          >
            <strong style={{ color: '#111827' }}>Category:</strong> {post?.category?.name || '-'}
          </div>
        </div>

        <Link
          to={`/${websiteSlug}/post/${post.slug}`}
          style={{
            marginTop: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            minHeight: 50,
            borderRadius: 16,
            background: 'linear-gradient(90deg, #6d4aff 0%, #5644f4 100%)',
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 800,
            textDecoration: 'none',
          }}
        >
          Read Post
          <ChevronRight size={16} />
        </Link>
      </div>
    </article>
  );
}

export default function WebsitePostsPage() {
  const { websiteSlug } = useParams();

  const [postsData, setPostsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError('');
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

  const website = postsData?.website;
  const rawPosts = postsData?.posts || [];
  const posts = useMemo(() => {
    if (rawPosts.length) return rawPosts;
    return makeDummyPosts(websiteSlug);
  }, [rawPosts, websiteSlug]);

  const filteredPosts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return posts;

    return posts.filter((post) => {
      const title = String(post?.title || '').toLowerCase();
      const excerpt = String(post?.excerpt || '').toLowerCase();
      const product = String(post?.product?.title || '').toLowerCase();
      const category = String(post?.category?.name || '').toLowerCase();

      return (
        title.includes(keyword) ||
        excerpt.includes(keyword) ||
        product.includes(keyword) ||
        category.includes(keyword)
      );
    });
  }, [posts, searchTerm]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f5f7fb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 18,
            padding: 22,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: '#334155',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)',
          }}
        >
          <Loader2 size={18} className="spin-soft" />
          <span>Loading website posts...</span>
        </div>

        <style>{`
          .spin-soft {
            animation: spinSoft 0.9s linear infinite;
          }
          @keyframes spinSoft {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f7fb',
      }}
    >
      <style>{`
        .website-posts-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }

        @media (max-width: 1200px) {
          .website-posts-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .website-posts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div
        style={{
          width: 'min(1480px, calc(100% - 24px))',
          margin: '0 auto',
          padding: '20px 0 40px',
        }}
      >
        <header
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 22,
            boxShadow: '0 12px 28px rgba(15, 23, 42, 0.04)',
            overflow: 'hidden',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              padding: '18px 20px',
              borderBottom: '1px solid #eef2f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#2563eb',
                  marginBottom: 8,
                }}
              >
                Website Blog Archive
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                  lineHeight: 1.08,
                  fontWeight: 900,
                  color: '#111827',
                  letterSpacing: '-0.04em',
                }}
              >
                {website?.website_name || 'Website Posts'}
              </h1>

              <p
                style={{
                  margin: '10px 0 0',
                  color: '#64748b',
                  fontSize: 15,
                  lineHeight: 1.7,
                }}
              >
                Browse all published posts from this affiliate website.
              </p>
            </div>

            <div
              style={{
                flex: '1 1 340px',
                maxWidth: 440,
                position: 'relative',
              }}
            >
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search website posts"
                style={{
                  width: '100%',
                  height: 52,
                  borderRadius: 999,
                  border: '1px solid #dbe1ea',
                  background: '#f8fafc',
                  padding: '0 18px 0 48px',
                  fontSize: 15,
                  color: '#111827',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
                color: '#64748b',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>
                Home
              </Link>
              <ChevronRight size={14} />
              {websiteSlug ? (
                <Link to={`/${websiteSlug}`} style={{ color: '#64748b', textDecoration: 'none' }}>
                  {website?.website_name || websiteSlug}
                </Link>
              ) : null}
              <ChevronRight size={14} />
              <span style={{ color: '#111827', fontWeight: 800 }}>Posts</span>
            </div>

            <div
              style={{
                color: '#64748b',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {filteredPosts.length} posts
            </div>
          </div>
        </header>

        {error ? (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #fecaca',
              borderLeft: '4px solid #dc2626',
              color: '#991b1b',
              borderRadius: 14,
              padding: 16,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        ) : null}

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 22,
            boxShadow: '0 12px 28px rgba(15, 23, 42, 0.04)',
            padding: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
              marginBottom: 20,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#2563eb',
                  marginBottom: 8,
                }}
              >
                Published Articles
              </div>
              <h2
                style={{
                  margin: 0,
                  color: '#111827',
                  fontSize: 30,
                  lineHeight: 1.1,
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                }}
              >
                Posts
              </h2>
            </div>
          </div>

          <div className="website-posts-grid">
            {filteredPosts.length ? (
              filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} websiteSlug={websiteSlug} />
              ))
            ) : (
              <div
                style={{
                  gridColumn: '1 / -1',
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: 18,
                  padding: 24,
                  color: '#64748b',
                }}
              >
                No published posts found.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}