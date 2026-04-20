import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Globe2,
  Loader2,
  Search,
  Share2,
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

function renderField(field) {
  if (!field) return null;

  if (field.field_type === 'image' && field.field_value) {
    return (
      <img
        src={field.field_value}
        alt={field.field_key}
        style={{
          width: '100%',
          maxHeight: 520,
          objectFit: 'cover',
          borderRadius: 18,
          marginTop: 14,
          border: '1px solid #e5e7eb',
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
        style={{
          color: '#2563eb',
          wordBreak: 'break-word',
          fontWeight: 700,
        }}
      >
        {field.field_value}
      </a>
    );
  }

  return (
    <div
      style={{
        whiteSpace: 'pre-wrap',
        color: '#334155',
        lineHeight: 1.9,
        fontSize: 16,
      }}
    >
      {field.field_value || '-'}
    </div>
  );
}

function cardStyle(extra = {}) {
  return {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 18,
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)',
    ...extra,
  };
}

function ArticleCard({ item, websiteSlug }) {
  return (
    <div style={cardStyle({ overflow: 'hidden' })}>
      {item?.featured_image ? (
        <img
          src={item.featured_image}
          alt={item.title}
          style={{
            width: '100%',
            height: 220,
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: 220,
            background: '#f8fafc',
            borderBottom: '1px solid #e5e7eb',
          }}
        />
      )}

      <div style={{ padding: 18 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#2563eb',
            marginBottom: 10,
          }}
        >
          Bloggad Article
        </div>

        <div
          style={{
            fontSize: 20,
            lineHeight: 1.35,
            fontWeight: 900,
            color: '#111827',
            marginBottom: 10,
          }}
        >
          {item?.title || 'Related post'}
        </div>

        <div
          style={{
            fontSize: 14,
            lineHeight: 1.8,
            color: '#64748b',
            marginBottom: 16,
          }}
        >
          {item?.excerpt || 'No excerpt'}
        </div>

        <Link
          to={`/${websiteSlug}/post/${item.slug}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: '#111827',
            fontWeight: 800,
          }}
        >
          Read Post
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}

export default function PostPage() {
  const { websiteSlug, slug } = useParams();

  const [postData, setPostData] = useState(null);
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError('');

        const [postRes, homeRes] = await Promise.all([
          api.get(`/api/public/posts/${websiteSlug}/post/${slug}`),
          api.get('/api/public/home'),
        ]);

        setPostData(postRes?.data || null);
        setHomeData(homeRes?.data || null);
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

  const post = postData?.post;
  const templateFields = postData?.template_fields || [];
  const ctaButtons = postData?.cta_buttons || [];
  const relatedPosts = postData?.related_posts || [];
  const categories = homeData?.categories || [];

  const filteredCategories = useMemo(() => {
    const keyword = sidebarSearch.trim().toLowerCase();
    if (!keyword) return categories;

    return categories.filter((item) =>
      String(item?.name || '')
        .toLowerCase()
        .includes(keyword)
    );
  }, [categories, sidebarSearch]);

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
          <span>Loading post...</span>
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
        .post-layout-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 28px;
        }

        .post-related-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        @media (max-width: 1200px) {
          .post-layout-grid,
          .post-related-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div
        style={{
          width: 'min(1460px, calc(100% - 24px))',
          margin: '0 auto',
          padding: '18px 0 40px',
        }}
      >
        <header
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 18,
            boxShadow: '0 10px 28px rgba(15, 23, 42, 0.04)',
            marginBottom: 18,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid #eef2f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                color: '#111827',
                fontWeight: 900,
                fontSize: 28,
                letterSpacing: '-0.03em',
              }}
            >
              Bloggad
            </div>

            <div
              style={{
                flex: '1 1 520px',
                maxWidth: 720,
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
                placeholder="Search Bloggad articles"
                style={{
                  width: '100%',
                  height: 52,
                  borderRadius: 14,
                  border: '1px solid #dbe1ea',
                  background: '#f8fafc',
                  padding: '0 16px 0 48px',
                  fontSize: 15,
                  color: '#111827',
                  outline: 'none',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                color: '#111827',
                fontWeight: 700,
                flexWrap: 'wrap',
              }}
            >
              <span>Blog</span>
              <span>About Us</span>
              <span>Contact Us</span>
              <span>FAQs</span>
            </div>
          </div>
        </header>

        {error ? (
          <div
            style={{
              ...cardStyle({
                padding: 16,
                borderLeft: '4px solid #dc2626',
                color: '#991b1b',
                marginBottom: 18,
              }),
            }}
          >
            {error}
          </div>
        ) : null}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            color: '#64748b',
            fontSize: 14,
            marginBottom: 18,
            fontWeight: 600,
          }}
        >
          <Link to="/" style={{ color: '#64748b' }}>
            Home
          </Link>
          <span>/</span>
          <span>{post?.category?.name || 'Category'}</span>
          <span>/</span>
          <span style={{ color: '#111827', fontWeight: 800 }}>{post?.title || 'Post'}</span>
        </div>

        <div className="post-layout-grid" style={{ marginBottom: 28 }}>
          <main>
            <article style={cardStyle({ overflow: 'hidden', marginBottom: 24 })}>
              {post?.featured_image ? (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  style={{
                    width: '100%',
                    maxHeight: 560,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              ) : null}

              <div style={{ padding: 26 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: 999,
                    background: '#eff6ff',
                    color: '#2563eb',
                    fontWeight: 800,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 16,
                  }}
                >
                  <Tag size={13} />
                  {post?.category?.name || 'Bloggad Story'}
                </div>

                <h1
                  style={{
                    margin: '0 0 16px',
                    fontSize: 'clamp(2rem, 4vw, 3.4rem)',
                    lineHeight: 1.08,
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    color: '#111827',
                  }}
                >
                  {post?.title || 'Post'}
                </h1>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    flexWrap: 'wrap',
                    marginBottom: 18,
                    color: '#64748b',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <User2 size={15} />
                    {post?.website?.website_name || 'Bloggad'}
                  </span>

                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <CalendarDays size={15} />
                    {formatDate(post?.published_at)}
                  </span>

                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Clock3 size={15} />
                    6 min read
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 18,
                    lineHeight: 1.85,
                    color: '#475569',
                    marginBottom: 18,
                  }}
                >
                  {post?.excerpt || 'No excerpt'}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                    paddingTop: 14,
                    borderTop: '1px solid #eef2f7',
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      color: '#111827',
                      fontWeight: 800,
                    }}
                  >
                    <Share2 size={16} />
                    Share
                  </span>

                  <button
                    type="button"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 999,
                      border: '1px solid #e5e7eb',
                      background: '#ffffff',
                      color: '#111827',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Globe2 size={16} />
                  </button>

                  <button
                    type="button"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 999,
                      border: '1px solid #e5e7eb',
                      background: '#ffffff',
                      color: '#111827',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Share2 size={16} />
                  </button>

                  <button
                    type="button"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 999,
                      border: '1px solid #e5e7eb',
                      background: '#ffffff',
                      color: '#111827',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </article>

            <section style={cardStyle({ padding: 24, marginBottom: 24 })}>
              <div
                style={{
                  fontSize: 24,
                  lineHeight: 1.2,
                  fontWeight: 900,
                  color: '#111827',
                  marginBottom: 18,
                }}
              >
                Article Content
              </div>

              <div style={{ display: 'grid', gap: 22 }}>
                {templateFields.length ? (
                  templateFields.map((field) => (
                    <div
                      key={field.id}
                      style={{
                        paddingBottom: 20,
                        borderBottom: '1px solid #eef2f7',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 900,
                          color: '#111827',
                          marginBottom: 12,
                          textTransform: 'capitalize',
                        }}
                      >
                        {field.field_key}
                      </div>
                      {renderField(field)}
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#64748b' }}>No post content fields available.</div>
                )}
              </div>
            </section>

            <section style={cardStyle({ padding: 24 })}>
              <div
                style={{
                  fontSize: 24,
                  lineHeight: 1.2,
                  fontWeight: 900,
                  color: '#111827',
                  marginBottom: 18,
                }}
              >
                Call To Action
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {ctaButtons.length ? (
                  ctaButtons.map((button) => (
                    <a
                      key={button.id}
                      href={button.button_url || '#'}
                      target={button.open_in_new_tab ? '_blank' : '_self'}
                      rel={button.open_in_new_tab ? 'noreferrer' : undefined}
                      style={{
                        padding: '12px 18px',
                        borderRadius: 14,
                        border:
                          button.button_style === 'secondary'
                            ? '1px solid #d1d5db'
                            : '1px solid #2563eb',
                        background:
                          button.button_style === 'secondary' ? '#ffffff' : '#2563eb',
                        color: button.button_style === 'secondary' ? '#111827' : '#ffffff',
                        fontWeight: 800,
                      }}
                    >
                      {button.button_label}
                    </a>
                  ))
                ) : (
                  <div style={{ color: '#64748b' }}>No CTA buttons available.</div>
                )}
              </div>
            </section>
          </main>

          <aside style={{ display: 'grid', gap: 20, alignSelf: 'start' }}>
            <div style={cardStyle({ padding: 20 })}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: '#111827',
                  marginBottom: 16,
                }}
              >
                Search
              </div>

              <div style={{ position: 'relative' }}>
                <Search
                  size={18}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                  }}
                />
                <input
                  type="text"
                  value={sidebarSearch}
                  onChange={(event) => setSidebarSearch(event.target.value)}
                  placeholder="Search categories"
                  style={{
                    width: '100%',
                    height: 48,
                    borderRadius: 14,
                    border: '1px solid #dbe1ea',
                    background: '#f8fafc',
                    padding: '0 14px 0 44px',
                    fontSize: 14,
                    color: '#111827',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={cardStyle({ padding: 20 })}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: '#111827',
                  marginBottom: 16,
                }}
              >
                Categories
              </div>

              <div style={{ display: 'grid', gap: 6 }}>
                {filteredCategories.length ? (
                  filteredCategories.map((item) => (
                    <Link
                      key={item.id}
                      to={`/category/${item.slug}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: '12px 12px',
                        borderRadius: 12,
                        color: '#111827',
                        fontWeight: 700,
                        background: '#ffffff',
                      }}
                    >
                      <span>{item.name}</span>
                      <ChevronRight size={15} />
                    </Link>
                  ))
                ) : (
                  <div style={{ color: '#64748b' }}>No categories found.</div>
                )}
              </div>
            </div>

            <div style={cardStyle({ padding: 20 })}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: '#111827',
                  marginBottom: 16,
                }}
              >
                About This Post
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                <div
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    background: '#f8fafc',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Website</div>
                  <div style={{ fontWeight: 800, color: '#111827' }}>
                    {post?.website?.website_name || 'Bloggad'}
                  </div>
                </div>

                <div
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    background: '#f8fafc',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Product</div>
                  <div style={{ fontWeight: 800, color: '#111827' }}>
                    {post?.product?.title || '-'}
                  </div>
                </div>

                <div
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    background: '#f8fafc',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Template</div>
                  <div style={{ fontWeight: 800, color: '#111827' }}>
                    {post?.template?.name || '-'}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section>
          <div
            style={{
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
              marginBottom: 18,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#2563eb',
                  marginBottom: 8,
                }}
              >
                Bloggad
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 30,
                  lineHeight: 1.1,
                  fontWeight: 900,
                  color: '#111827',
                  letterSpacing: '-0.03em',
                }}
              >
                Related Posts
              </h2>
            </div>
          </div>

          <div className="post-related-grid">
            {relatedPosts.length ? (
              relatedPosts.map((item) => (
                <ArticleCard key={item.id} item={item} websiteSlug={websiteSlug} />
              ))
            ) : (
              <div
                style={{
                  ...cardStyle({
                    padding: 20,
                    color: '#64748b',
                  }),
                }}
              >
                No related posts found.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}