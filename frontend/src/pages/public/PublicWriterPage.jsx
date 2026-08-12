import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import './PublicWriterPageApproved.css';

function compactNumber(value) {
  const number = Number(value || 0);

  if (!Number.isFinite(number)) return '0';

  try {
    return new Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(number);
  } catch {
    return String(number);
  }
}

function initials(value) {
  const text = String(value || 'Writer').trim();

  if (!text) return 'W';

  return text
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function isAuthError(error) {
  const status = Number(error?.response?.status || 0);
  return status === 401 || status === 403;
}

function IconBase({ children, size = 18 }) {
  return (
    <svg
      aria-hidden="true"
      className="pwp-icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {children}
    </svg>
  );
}

function MessageIcon() {
  return (
    <IconBase>
      <path d="M5 5.5h14v10H9l-4 3v-13Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </IconBase>
  );
}

function ThumbIcon() {
  return (
    <IconBase>
      <path d="M9.5 20H6.2a1.7 1.7 0 0 1-1.7-1.7v-7.1a1.7 1.7 0 0 1 1.7-1.7h3.3V20Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9.5 10.2 12.7 4c.5-1 1.9-.8 2.1.3l.5 3.9h3.1c1.2 0 2.1 1.1 1.8 2.2l-1.8 7.4c-.3 1.3-1.5 2.2-2.9 2.2h-6V10.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </IconBase>
  );
}

function ClapIcon() {
  return (
    <IconBase>
      <path d="M8.4 12.4 6.7 9.2a1.2 1.2 0 0 0-2.1 1.1l3 5.7c1.1 2.1 3.3 3.4 5.7 3.4h.9c2.1 0 4-1.1 5.1-2.9l.8-1.4a2.1 2.1 0 0 0-.1-2.3l-3.3-5a1.2 1.2 0 0 0-2 1.3l1.5 2.3-2.7-4.7a1.2 1.2 0 0 0-2.1 1.2l2.4 4.2-2.9-4.7a1.2 1.2 0 0 0-2 1.3l2.7 4.5-2.2-3.5a1.2 1.2 0 0 0-2 1.3l1 1.4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m5.1 5.2-1.4-1.5M10 3.8V1.7M15 5.1l1.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </IconBase>
  );
}

function ShareIcon() {
  return (
    <IconBase>
      <path d="M8.8 12.6 15.7 8M8.8 12.6l6.9 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="6.5" cy="12.6" r="2.2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.6" cy="6.8" r="2.2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.6" cy="18.2" r="2.2" stroke="currentColor" strokeWidth="1.7" />
    </IconBase>
  );
}

function MoreIcon() {
  return (
    <IconBase>
      <circle cx="5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" />
    </IconBase>
  );
}

const WRITER_CONTENT_TAB_DEFINITIONS = [
  { key: 'article', label: 'Article' },
  { key: 'story', label: 'Story' },
  { key: 'tutorial', label: 'Tutorial' },
  { key: 'course', label: 'Course', special: true },
  { key: 'course_lesson', label: 'Course Lessons' },
  { key: 'review', label: 'Review' },
  { key: 'news', label: 'News' },
  { key: 'opinion', label: 'Opinion' },
  { key: 'product_post', label: 'Product Post' },
];
function PageAvatar({ page, writer, sizeClass = '' }) {
  const source = page?.logo_url || writer?.avatar_url || '';
  const label = page?.name || writer?.public_name || 'Writer';

  if (source) {
    return <img alt="" className={`pwp-avatar-image ${sizeClass}`} src={source} />;
  }

  return <div className={`pwp-avatar-fallback ${sizeClass}`}>{initials(label)}</div>;
}

function WriterStats({ writer, compact = false }) {
  const rows = [
    {
      key: 'followers',
      icon: <span className="pwp-stat-dot pwp-stat-dot-blue" />,
      label: `${compactNumber(writer?.follower_count)} followers`,
      show: true,
    },
    {
      key: 'members',
      icon: <span className="pwp-stat-dot pwp-stat-dot-green" />,
      label: `${compactNumber(writer?.member_count)} paid subscribers`,
      show: Number(writer?.member_count || 0) > 0,
    },
    {
      key: 'applaud',
      icon: <ClapIcon />,
      label: `${compactNumber(writer?.applaud_count)} applause`,
      show: !compact,
    },
    {
      key: 'likes',
      icon: <ThumbIcon />,
      label: `${compactNumber(writer?.love_count)} likes`,
      show: !compact,
    },
    {
      key: 'appreciations',
      icon: <span className="pwp-stat-dot pwp-stat-dot-red" />,
      label: `${compactNumber(writer?.appreciation_count)} appreciations`,
      show: !compact,
    },
  ];

  return (
    <div className="pwp-stat-list">
      {rows.filter((row) => row.show).map((row) => (
        <div className="pwp-stat-row" key={row.key}>
          <span className="pwp-stat-icon">{row.icon}</span>
          <span>{row.label}</span>
        </div>
      ))}
    </div>
  );
}

function PostCard({
  page,
  writer,
  post,
  onReact,
  onShare,
  reactionBusy,
  reactionState,
}) {
  const state = reactionState?.[post.id] || {};
  const likes = Number(state.love ?? post?.love_count ?? 0);
  const applause = Number(state.applaud ?? post?.applaud_count ?? 0);
  const postPath = `/page/${encodeURIComponent(page.slug)}/post/${encodeURIComponent(post.slug)}`;

  return (
    <article className="pwp-post-card">
      <header className="pwp-post-head">
        <PageAvatar page={page} writer={writer} sizeClass="pwp-post-avatar" />
        <div className="pwp-post-author">
          <strong>{page?.name || writer?.public_name || 'Writer Page'}</strong>
          <span>{String(post?.content_type || 'article').replace(/_/g, ' ').toUpperCase()} - Public</span>
        </div>
      </header>

      <Link className="pwp-post-title" to={postPath}>
        {post.title}
      </Link>

      {post.excerpt ? <p className="pwp-post-excerpt">{post.excerpt}</p> : null}

      {post.featured_image ? (
        <Link className="pwp-post-media-link" to={postPath}>
          <img alt="" className="pwp-post-media" src={post.featured_image} />
        </Link>
      ) : null}

      <div className="pwp-post-counts">
        <span><ThumbIcon /> {compactNumber(likes)} likes</span>
        <span><ClapIcon /> {compactNumber(applause)} applause</span>
      </div>

      <div className="pwp-post-actions">
        <button
          disabled={reactionBusy === `${post.id}:love`}
          onClick={() => onReact(post, 'love')}
          type="button"
        >
          <ThumbIcon />
          <span>Like</span>
        </button>

        <button
          disabled={reactionBusy === `${post.id}:applaud`}
          onClick={() => onReact(post, 'applaud')}
          type="button"
        >
          <ClapIcon />
          <span>Applaud</span>
        </button>

        <Link to={postPath}>Comment</Link>

        <button onClick={() => onShare(post)} type="button">
          <ShareIcon />
          <span>Share</span>
        </button>
      </div>

      <Link className="pwp-read-link" to={postPath}>
        Read full post
      </Link>
    </article>
  );
}

export default function PublicWriterPage() {
  const { pageSlug } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [membership, setMembership] = useState(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageBusy, setMessageBusy] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [notice, setNotice] = useState('');
  const [reactionBusy, setReactionBusy] = useState('');
  const [reactionState, setReactionState] = useState({});
  const [photosOpen, setPhotosOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');

    api
      .get(`/api/public/writer-pages/${encodeURIComponent(pageSlug || '')}`)
      .then((response) => {
        if (active) setData(response.data);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError?.response?.data?.message ||
              requestError?.message ||
              'Failed to load Writer Page.'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [pageSlug]);

  const page = data?.page || {};
  const writer = data?.writer || {};
  const posts = Array.isArray(data?.posts) ? data.posts : [];
  const store = data?.storefront || null;
  const writerId = Number(writer?.user_id || page?.user_id || 0);
  useEffect(() => {
    const websiteSlug = String(store?.slug || '').trim();

    if (!websiteSlug) {
      setCourses([]);
      setCoursesLoading(false);
      return;
    }

    let active = true;
    setCoursesLoading(true);

    api
      .get(`/api/public/courses/${encodeURIComponent(websiteSlug)}`)
      .then((response) => {
        if (!active) return;
        setCourses(Array.isArray(response?.data?.courses) ? response.data.courses : []);
      })
      .catch(() => {
        if (active) setCourses([]);
      })
      .finally(() => {
        if (active) setCoursesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [store?.slug]);

  useEffect(() => {
    if (!writerId) return;

    let active = true;

    api
      .get(`/api/public/access/writers/${writerId}/membership`)
      .then((response) => {
        if (active) setMembership(response?.data?.membership || null);
      })
      .catch(() => {
        if (active) setMembership(null);
      });

    api
      .get('/api/reader/social/following')
      .then((response) => {
        if (!active) return;

        const rows = Array.isArray(response?.data?.following)
          ? response.data.following
          : [];

        const matched = rows.some((item) => {
          const id = Number(
            item?.writer_user_id ||
              item?.user_id ||
              item?.writer?.id ||
              item?.id ||
              0
          );

          return id === writerId;
        });

        setFollowing(matched);
      })
      .catch(() => {
      });

    return () => {
      active = false;
    };
  }, [writerId]);

  const headerSummary = useMemo(() => {
    const parts = [`${compactNumber(writer?.follower_count)} followers`];

    if (Number(writer?.member_count || 0) > 0) {
      parts.push(`${compactNumber(writer.member_count)} paid subscribers`);
    }

    return parts.join(' - ');
  }, [writer?.follower_count, writer?.member_count]);
  const photoItems = useMemo(() => {
    const seen = new Set();
    return posts.reduce((items, post) => {
      const url = String(post?.featured_image || '').trim();
      if (!url || seen.has(url)) return items;
      seen.add(url);
      items.push({ id: post.id, title: post.title, slug: post.slug, url });
      return items;
    }, []);
  }, [posts]);
  const availableContentTabs = useMemo(() => {
    const postTypes = new Set(
      posts
        .map((post) => String(post?.content_type || '').trim().toLowerCase())
        .filter(Boolean)
    );

    return WRITER_CONTENT_TAB_DEFINITIONS.filter((item) =>
      item.special ? courses.length > 0 : postTypes.has(item.key)
    );
  }, [posts, courses.length]);

  const pageTabs = useMemo(
    () => [
      { key: 'posts', label: 'Posts' },
      ...availableContentTabs.map((item) => ({
        key: item.special ? 'course' : `type:${item.key}`,
        label: item.label,
      })),
      { key: 'about', label: 'About' },
      { key: 'more', label: 'More' },
    ],
    [availableContentTabs]
  );

  const activeContentType = activeTab.startsWith('type:')
    ? activeTab.slice(5)
    : '';

  const filteredPosts = useMemo(
    () =>
      activeContentType
        ? posts.filter(
            (post) =>
              String(post?.content_type || '').trim().toLowerCase() ===
              activeContentType
          )
        : posts,
    [posts, activeContentType]
  );

  const isPostFeedTab = activeTab === 'posts' || Boolean(activeContentType);

  async function toggleFollow() {
    if (!writerId || followBusy) return;

    setFollowBusy(true);
    setNotice('');

    try {
      const response = await api.post(`/api/reader/social/writers/${writerId}/follow`);
      const payload = response?.data || {};

      setFollowing(Boolean(payload.following));

      setData((current) => ({
        ...current,
        writer: {
          ...(current?.writer || {}),
          follower_count: Number(
            payload.follower_count ?? current?.writer?.follower_count ?? 0
          ),
        },
      }));
    } catch (requestError) {
      if (isAuthError(requestError)) {
        navigate('/reader/login');
        return;
      }

      setNotice(
        requestError?.response?.data?.message ||
          requestError?.message ||
          'Follow action failed.'
      );
    } finally {
      setFollowBusy(false);
    }
  }

  function openMessage() {
    if (!writerId) return;

    setMessageError('');
    setMessageOpen(true);
  }

  async function sendMessage(event) {
    event.preventDefault();

    if (!messageText.trim() || messageBusy) return;

    if (!store?.slug && !store?.id) {
      setMessageError('This Writer does not have an active Store context for messaging.');
      return;
    }

    setMessageBusy(true);
    setMessageError('');

    try {
      const response = await api.post('/api/customer-affiliate-chats', {
        affiliate_id: writerId,
        website_id: store?.id || null,
        website_slug: store?.slug || null,
        chat_type: 'general',
        subject: `Message to ${writer?.public_name || 'Writer'}`,
        message: messageText.trim(),
      });

      setMessageText('');
      setMessageOpen(false);
      setNotice(response?.data?.message || 'Message sent.');
    } catch (requestError) {
      if (isAuthError(requestError)) {
        navigate('/reader/login');
        return;
      }

      setMessageError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          'Message could not be sent.'
      );
    } finally {
      setMessageBusy(false);
    }
  }

  async function toggleReaction(post, type) {
    if (!post?.id || reactionBusy) return;

    const key = `${post.id}:${type}`;
    setReactionBusy(key);
    setNotice('');

    try {
      const response = await api.post(
        `/api/reader/social/posts/${post.id}/reactions/${type}`
      );

      const counts = response?.data?.counts || {};

      setReactionState((current) => ({
        ...current,
        [post.id]: {
          ...(current[post.id] || {}),
          love: Number(
            counts.love ??
              counts.love_count ??
              current[post.id]?.love ??
              post.love_count ??
              0
          ),
          applaud: Number(
            counts.applaud ??
              counts.applaud_count ??
              current[post.id]?.applaud ??
              post.applaud_count ??
              0
          ),
        },
      }));
    } catch (requestError) {
      if (isAuthError(requestError)) {
        navigate('/reader/login');
        return;
      }

      setNotice(
        requestError?.response?.data?.message ||
          requestError?.message ||
          'Reaction failed.'
      );
    } finally {
      setReactionBusy('');
    }
  }

  async function sharePost(post) {
    const path = `/page/${encodeURIComponent(page.slug)}/post/${encodeURIComponent(post.slug)}`;
    const url = `${window.location.origin}${path}`;

    setNotice('');

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          url,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setNotice('Post link copied.');
        return;
      }

      setNotice(url);
    } catch (shareError) {
      if (shareError?.name !== 'AbortError') {
        setNotice('Could not share this post.');
      }
    }
  }

  if (loading) {
    return <main className="pwp-status">Loading Writer Page...</main>;
  }

  if (error || !page?.id) {
    return <main className="pwp-status">{error || 'Writer Page not found.'}</main>;
  }

  const cover = page?.banner_url || writer?.cover_url || '';
  const membershipAvailable = Boolean(membership?.available && membership?.offer);

  return (
    <main className="public-writer-page">
      {notice ? (
        <button className="pwp-notice" onClick={() => setNotice('')} type="button">
          {notice}
        </button>
      ) : null}

      <section className="pwp-profile-shell">
        <div className={`pwp-cover ${cover ? 'has-image' : ''}`}>
          {cover ? <img alt="" src={cover} /> : <span>Cover photo</span>}
        </div>

        <div className="pwp-profile-row">
          <div className="pwp-profile-avatar-wrap">
            <PageAvatar page={page} writer={writer} sizeClass="pwp-profile-avatar" />
          </div>

          <div className="pwp-profile-copy">
            <h1>{page.name}</h1>
            <div className="pwp-byline">By {writer?.public_name || 'Writer'}</div>
            <div className="pwp-header-summary">{headerSummary}</div>
          </div>

          <div className="pwp-profile-actions">
            <button
              className="pwp-action-primary"
              disabled={followBusy}
              onClick={toggleFollow}
              type="button"
            >
              {followBusy ? 'Updating...' : following ? 'Following' : 'Follow'}
            </button>

            <button className="pwp-action-secondary" onClick={openMessage} type="button">
              <MessageIcon />
              <span>Message</span>
            </button>

            {store ? (
              <Link className="pwp-action-secondary pwp-store-action" to={`/${store.slug}`}>
                Visit Store
              </Link>
            ) : null}

            <button
              aria-label="More"
              className="pwp-action-secondary pwp-more-action"
              onClick={() => setActiveTab('more')}
              type="button"
            >
              <MoreIcon />
            </button>
          </div>
        </div>

        <nav className="pwp-tabs" aria-label="Writer Page sections">
          {pageTabs.map((tab) => (
            <button
              className={activeTab === tab.key ? 'active' : ''}
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </section>

      <section className={`pwp-content pwp-tab-${activeTab}`}>
        {isPostFeedTab ? (
          <>
            <aside className="pwp-sidebar">
              <section className="pwp-side-card">
                <h2>Intro</h2>

                {page?.bio ? <p>{page.bio}</p> : writer?.bio ? <p>{writer.bio}</p> : null}

                <WriterStats writer={writer} />

                {store ? (
                  <Link className="pwp-side-link" to={`/${store.slug}`}>
                    Visit {store.name || 'Store'}
                  </Link>
                ) : null}
              </section>

              <section className="pwp-side-card pwp-details-card">
                <h2>Details</h2>

                <div>
                  <span>Writer</span>
                  <strong>{writer?.public_name || 'Writer'}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong className="pwp-active-text">Active</strong>
                </div>

                <div>
                  <span>Page</span>
                  <strong>{page?.is_primary ? 'Primary Page' : 'Writer Page'}</strong>
                </div>
              </section>
              <section className="pwp-side-card pwp-photos-card">
                <div className="pwp-photos-head">
                  <h2>Photos</h2>
                  {photoItems.length > 9 ? (
                    <button onClick={() => setPhotosOpen(true)} type="button">See All Photos</button>
                  ) : null}
                </div>

                {photoItems.length ? (
                  <div className="pwp-photo-grid">
                    {photoItems.slice(0, 9).map((photo) => (
                      <Link
                        aria-label={photo.title || 'Open photo post'}
                        className="pwp-photo-tile"
                        key={photo.id}
                        to={`/page/${encodeURIComponent(page.slug)}/post/${encodeURIComponent(photo.slug)}`}
                      >
                        <img alt="" src={photo.url} />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="pwp-photo-empty">No published photos yet.</div>
                )}
              </section>
            </aside>

            <div className="pwp-feed">
              {posts.length ? (
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    onReact={toggleReaction}
                    onShare={sharePost}
                    page={page}
                    post={post}
                    reactionBusy={reactionBusy}
                    reactionState={reactionState}
                    writer={writer}
                  />
                ))
              ) : (
                <section className="pwp-empty-card">
                  {activeContentType
                    ? `No ${WRITER_CONTENT_TAB_DEFINITIONS.find((item) => item.key === activeContentType)?.label || 'matching'} posts published on this Page yet.`
                    : 'No published posts on this Page yet.'}
                </section>
              )}
            </div>
          </>
        ) : null}

        {activeTab === 'course' ? (
          <section className="pwp-course-tab">
            <div className="pwp-course-tab-head">
              <h2>Courses</h2>
              <span>{courses.length} published</span>
            </div>

            {coursesLoading ? (
              <section className="pwp-empty-card">Loading courses...</section>
            ) : courses.length ? (
              <div className="pwp-course-grid">
                {courses.map((course) => (
                  <article className="pwp-course-card" key={course.id}>
                    <div className="pwp-course-card-label">COURSE</div>
                    <h3>{course.title}</h3>
                    {course.description ? <p>{course.description}</p> : null}
                    <div className="pwp-course-meta">
                      <span>{Number(course.module_count || 0)} modules</span>
                      <span>{Number(course.lesson_count || 0)} lessons</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <section className="pwp-empty-card">No published courses yet.</section>
            )}
          </section>
        ) : null}
        {activeTab === 'about' ? (
          <section className="pwp-tab-card pwp-about-card">
            <h2>About</h2>
            <p>{page?.about_text || page?.bio || writer?.bio || 'No About information yet.'}</p>
          </section>
        ) : null}

        {activeTab === 'more' ? (
          <section className="pwp-tab-card pwp-more-card">
            <h2>More</h2>

            <WriterStats writer={writer} />

            <div className="pwp-more-details">
              <div>
                <span>Writer</span>
                <strong>{writer?.public_name || 'Writer'}</strong>
              </div>
              <div>
                <span>Page</span>
                <strong>{page?.is_primary ? 'Primary Page' : 'Writer Page'}</strong>
              </div>
            </div>

            {membershipAvailable ? (
              <div className="pwp-membership-note">
                <strong>Paid membership available</strong>
                <span>
                  ${Number(membership.offer.monthly_price_usd || 0).toFixed(2)} / month
                </span>
                <Link to="/reader/premium">View Reader Premium</Link>
              </div>
            ) : null}

            {store ? (
              <Link className="pwp-side-link" to={`/${store.slug}`}>
                Visit {store.name || 'Store'}
              </Link>
            ) : null}
          </section>
        ) : null}
      </section>

      {photosOpen ? (
        <div className="pwp-modal-backdrop" onMouseDown={() => setPhotosOpen(false)}>
          <section className="pwp-photo-modal" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <div className="pwp-photo-modal-head">
              <strong>Photos</strong>
              <button onClick={() => setPhotosOpen(false)} type="button">Close</button>
            </div>
            <div className="pwp-photo-modal-grid">
              {photoItems.map((photo) => (
                <Link
                  key={photo.id}
                  onClick={() => setPhotosOpen(false)}
                  to={`/page/${encodeURIComponent(page.slug)}/post/${encodeURIComponent(photo.slug)}`}
                >
                  <img alt="" src={photo.url} />
                </Link>
              ))}
            </div>
          </section>
        </div>
      ) : null}
      {messageOpen ? (
        <div className="pwp-modal-backdrop" onMouseDown={() => setMessageOpen(false)}>
          <section
            aria-modal="true"
            className="pwp-message-modal"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="pwp-message-modal-head">
              <div>
                <strong>Message {writer?.public_name || 'Writer'}</strong>
                <span>Your first message may require Writer approval.</span>
              </div>
              <button onClick={() => setMessageOpen(false)} type="button">
                Close
              </button>
            </div>

            <form onSubmit={sendMessage}>
              <textarea
                autoFocus
                maxLength={4000}
                onChange={(event) => setMessageText(event.target.value)}
                placeholder="Write your message..."
                rows={6}
                value={messageText}
              />

              {messageError ? <div className="pwp-message-error">{messageError}</div> : null}

              <div className="pwp-message-actions">
                <button onClick={() => setMessageOpen(false)} type="button">
                  Cancel
                </button>
                <button
                  className="primary"
                  disabled={messageBusy || !messageText.trim()}
                  type="submit"
                >
                  {messageBusy ? 'Sending...' : 'Send message'}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  );
}
