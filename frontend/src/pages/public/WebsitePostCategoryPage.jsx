import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

function makeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function resolveSponsoredPostUrl(ad, fallbackWebsiteSlug = '') {
  const websiteSlug = ad?.website_slug || fallbackWebsiteSlug;
  const postSlug = ad?.post_slug || '';

  if (websiteSlug && postSlug) return `/${websiteSlug}/post/${postSlug}`;
  if (postSlug) return `/post/${postSlug}`;
  return '#';
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

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            width: 'fit-content',
            padding: '7px 12px',
            borderRadius: 999,
            background: '#eff6ff',
            color: '#2563eb',
            fontSize: 12,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 12,
          }}
        >
          <Tag size={13} />
          {post?.category?.name || 'Post'}
        </span>

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
            fontSize: 14,
            color: '#475569',
            lineHeight: 1.75,
            marginBottom: 14,
          }}
        >
          {post?.excerpt || 'No excerpt'}
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

function SponsoredPostCard({ ad, websiteSlug, onView, onClick }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onView(ad);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [ad, onView]);

  const image = ad?.target_image || ad?.campaign_image || '';
  const title = ad?.target_title || ad?.campaign_title || 'Sponsored Post';
  const description = ad?.campaign_description || 'Promoted article from this category.';

  return (
    <article
      ref={cardRef}
      style={{
        background: '#ffffff',
        border: '1px solid #bfdbfe',
        borderRadius: 22,
        overflow: 'hidden',
        boxShadow: '0 16px 36px rgba(37, 99, 235, 0.08)',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 14,
          top: 14,
          zIndex: 2,
          display: 'inline-flex',
          padding: '7px 11px',
          borderRadius: 999,
          background: '#dbeafe',
          color: '#1d4ed8',
          fontSize: 11,
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        Sponsored
      </div>

      {image ? (
        <img
          src={image}
          alt={title}
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
            background: '#0f172a',
            color: '#ffffff',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 900,
            fontSize: 28,
          }}
        >
          AD
        </div>
      )}

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            width: 'fit-content',
            padding: '7px 12px',
            borderRadius: 999,
            background: '#eff6ff',
            color: '#2563eb',
            fontSize: 12,
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 12,
          }}
        >
          <Tag size={13} />
          Promoted Post
        </span>

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
          {title}
        </h2>

        <div
          style={{
            fontSize: 14,
            color: '#475569',
            lineHeight: 1.75,
            marginBottom: 14,
          }}
        >
          {description}
        </div>

        <button
          type="button"
          onClick={() => onClick(ad, websiteSlug)}
          style={{
            marginTop: 'auto',
            border: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            minHeight: 50,
            borderRadius: 16,
            background: 'linear-gradient(90deg, #2563eb 0%, #5644f4 100%)',
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 900,
            cursor: 'pointer',
          }}
        >
          Read Sponsored Post
          <ChevronRight size={16} />
        </button>
      </div>
    </article>
  );
}

export default function WebsitePostCategoryPage() {
  const { websiteSlug, categorySlug } = useParams();

  const [postsData, setPostsData] = useState(null);
  const [sponsoredAds, setSponsoredAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const trackedSponsoredViewsRef = useRef(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError('');

        const { data } = await api.get(`/api/public/posts/${websiteSlug}/posts`);
        const allPosts = Array.isArray(data?.posts) ? data.posts : [];

        const matchedCategoryPost = allPosts.find((post) => {
          const postCategorySlug =
            post?.category?.slug ||
            post?.category_slug ||
            makeSlug(post?.category?.name);

          return postCategorySlug === categorySlug;
        });

        const categoryId =
          matchedCategoryPost?.category?.id ||
          matchedCategoryPost?.category_id ||
          null;

        setPostsData(data || null);
        setSearchTerm('');
        setSponsoredAds([]);
        trackedSponsoredViewsRef.current = new Set();

        if (categoryId) {
          try {
            const adsRes = await api.get('/api/public/affiliate-ads', {
              params: {
                ad_type: 'post',
                category_id: categoryId,
                placement_key: 'website_post_category_top',
                limit: 3,
              },
            });

            setSponsoredAds(Array.isArray(adsRes?.data?.ads) ? adsRes.data.ads : []);
          } catch (adsError) {
            setSponsoredAds([]);
          }
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load post category');
      } finally {
        setLoading(false);
      }
    };

    if (websiteSlug && categorySlug) {
      fetchPosts();
    }
  }, [websiteSlug, categorySlug]);

  const website = postsData?.website;
  const rawPosts = postsData?.posts || [];

  const categoryPosts = useMemo(() => {
    return rawPosts.filter((post) => {
      const postCategorySlug =
        post?.category?.slug ||
        post?.category_slug ||
        makeSlug(post?.category?.name);

      return postCategorySlug === categorySlug;
    });
  }, [rawPosts, categorySlug]);

  const currentCategoryName =
    categoryPosts?.[0]?.category?.name ||
    categorySlug
      ?.split('-')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') ||
    'Category';

  const filteredPosts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return categoryPosts;

    return categoryPosts.filter((post) => {
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
  }, [categoryPosts, searchTerm]);

  const trackSponsoredView = useCallback(async (ad) => {
    if (!ad?.id || trackedSponsoredViewsRef.current.has(ad.id)) return;

    trackedSponsoredViewsRef.current.add(ad.id);

    try {
      await api.post(`/api/public/affiliate-ads/${ad.id}/view`, {
        placement_key: 'website_post_category_top',
        page_url: window.location.href,
      });
    } catch (err) {
      // ignore ad tracking failure
    }
  }, []);

  const trackSponsoredClick = useCallback(async (ad, fallbackWebsiteSlug = '') => {
    if (!ad?.id) return;

    const targetUrl = resolveSponsoredPostUrl(ad, fallbackWebsiteSlug);

    try {
      await api.post(`/api/public/affiliate-ads/${ad.id}/click`, {
        placement_key: 'website_post_category_top',
        page_url: window.location.href,
        destination_url: targetUrl,
      });
    } catch (err) {
      // ignore ad tracking failure
    }

    if (targetUrl && targetUrl !== '#') {
      window.location.href = targetUrl;
    }
  }, []);

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
          <span>Loading post category...</span>
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
    <div style={{ minHeight: '100vh', background: '#f5f7fb' }}>
      <style>{`
        .website-post-category-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }

        .website-post-category-sponsored-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }

        @media (max-width: 1200px) {
          .website-post-category-grid,
          .website-post-category-sponsored-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .website-post-category-grid,
          .website-post-category-sponsored-grid {
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
                Post Category
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
                {currentCategoryName}
                {website?.website_name ? ` • ${website.website_name}` : ''}
              </h1>

              <p
                style={{
                  margin: '10px 0 0',
                  color: '#64748b',
                  fontSize: 15,
                  lineHeight: 1.7,
                }}
              >
                Sponsored posts from this exact category appear first.
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
                placeholder="Search posts in this category"
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

              <Link to={`/${websiteSlug}`} style={{ color: '#64748b', textDecoration: 'none' }}>
                {website?.website_name || websiteSlug}
              </Link>

              <ChevronRight size={14} />

              <Link
                to={`/${websiteSlug}/posts`}
                style={{ color: '#64748b', textDecoration: 'none' }}
              >
                Posts
              </Link>

              <ChevronRight size={14} />

              <span style={{ color: '#111827', fontWeight: 800 }}>{currentCategoryName}</span>
            </div>

            <div style={{ color: '#64748b', fontSize: 14, fontWeight: 700 }}>
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
          {sponsoredAds.length ? (
            <div
              style={{
                marginBottom: 24,
                background:
                  'linear-gradient(135deg, rgba(239,246,255,0.95), rgba(255,255,255,0.98))',
                border: '1px solid #bfdbfe',
                borderRadius: 22,
                padding: 18,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                  marginBottom: 16,
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'inline-flex',
                      padding: '7px 10px',
                      borderRadius: 999,
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      fontSize: 11,
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: 8,
                    }}
                  >
                    Sponsored
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      color: '#111827',
                      fontSize: 24,
                      fontWeight: 900,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    Promoted {currentCategoryName} Posts
                  </h2>
                </div>

                <p style={{ margin: 0, color: '#64748b', fontSize: 14, fontWeight: 700 }}>
                  These promoted posts match this exact category.
                </p>
              </div>

              <div className="website-post-category-sponsored-grid">
                {sponsoredAds.map((ad) => (
                  <SponsoredPostCard
                    key={ad.id}
                    ad={ad}
                    websiteSlug={websiteSlug}
                    onView={trackSponsoredView}
                    onClick={trackSponsoredClick}
                  />
                ))}
              </div>
            </div>
          ) : null}

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
                Category Articles
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

          <div className="website-post-category-grid">
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
                No posts found in this category.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}