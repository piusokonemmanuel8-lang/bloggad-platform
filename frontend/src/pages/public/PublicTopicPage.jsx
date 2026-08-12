import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Bookmark,
  BookOpen,
  Home,
  Menu,
  MoreHorizontal,
  PenSquare,
  Plus,
  Search,
  Share2,
  Tags,
  User,
  Users,
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import './HomePageFeed.css';
import './PublicTopicPage.css';

function SidebarItem({ active = false, to, icon: Icon, label }) {
  return (
    <Link className={`bh-sidebar-item ${active ? 'active' : ''}`} to={to}>
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
}

function formatCompact(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number <= 0) return '0';
  if (number >= 1000000) return `${(number / 1000000).toFixed(number >= 10000000 ? 0 : 1)}M`;
  if (number >= 1000) return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1)}K`;
  return String(number);
}

function relativeDate(value) {
  if (!value) return '';
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  if (!Number.isFinite(diff)) return '';
  const days = Math.max(0, Math.floor(diff / 86400000));
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  return `${days}d ago`;
}

function postUrl(post) {
  if (post?.writer_page_slug && post?.slug) {
    return `/page/${encodeURIComponent(post.writer_page_slug)}/post/${encodeURIComponent(post.slug)}`;
  }

  if (post?.website_slug && post?.slug) {
    const raw = String(post.website_slug);
    if (raw.startsWith('page/')) {
      return `/${raw}/post/${encodeURIComponent(post.slug)}`;
    }
    return `/${encodeURIComponent(raw)}/post/${encodeURIComponent(post.slug)}`;
  }

  return '#';
}

function writerUrl(post) {
  if (post?.writer_page_slug) {
    return `/page/${encodeURIComponent(post.writer_page_slug)}`;
  }

  if (post?.website_slug) {
    const raw = String(post.website_slug);
    if (raw.startsWith('page/')) return `/${raw}`;
    return `/${encodeURIComponent(raw)}`;
  }

  return '#';
}

function TopicStoryCard({ post }) {
  const url = postUrl(post);
  const writer = post?.writer_name || post?.website_name || 'Writer';
  const likeCount = Number(post?.love_count || post?.likes_count || 0);
  const commentCount = Number(post?.comment_count || post?.comments_count || 0);
  const applaudCount = Number(post?.applaud_count || 0);

  async function shareStory() {
    const absoluteUrl = `${window.location.origin}${url}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: post?.title || 'Bloggad story',
          text: post?.excerpt || post?.title || '',
          url: absoluteUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(absoluteUrl);
    } catch {
      // Share cancellation or unavailable clipboard should not break the feed.
    }
  }

  return (
    <article className="btf-story">
      <div className="btf-story-copy">
        <div className="btf-story-meta">
          <Link to={writerUrl(post)}>{writer}</Link>
          <span>-</span>
          <span>{relativeDate(post?.published_at || post?.created_at)}</span>
        </div>

        <Link className="btf-story-title" to={url}>
          {post?.title || 'Untitled story'}
        </Link>

        {post?.excerpt ? (
          <p className="btf-story-excerpt">{post.excerpt}</p>
        ) : null}

        <div className="btf-story-bottom">
          <div className="btf-story-counts">
            <span>* {formatCompact(likeCount)}</span>
            <span>o {formatCompact(commentCount)}</span>
            <span>+ {formatCompact(applaudCount)}</span>
          </div>

          <div className="btf-story-actions">
            <Link to={`${url}#responses`} aria-label="Comments">-</Link>
            <button type="button" onClick={shareStory} aria-label="Share">
              <Share2 size={15} />
            </button>
            <Link to="/reader/saved" aria-label="Saved stories">
              <Bookmark size={15} />
            </Link>
            <button type="button" aria-label="More story actions">
              <MoreHorizontal size={17} />
            </button>
          </div>
        </div>
      </div>

      <Link className={`btf-thumb${post?.featured_image ? '' : ' empty'}`} to={url}>
        {post?.featured_image ? <img alt="" src={post.featured_image} /> : <span />}
      </Link>
    </article>
  );
}

function StaffPick({ post }) {
  return (
    <article className="btf-staff-pick">
      <span>{post?.writer_name || post?.website_name || 'Writer'}</span>
      <Link to={postUrl(post)}>{post?.title || 'Story'}</Link>
      <small>* &nbsp; {relativeDate(post?.published_at || post?.created_at)}</small>
    </article>
  );
}

function WriterRow({ writer, onFollow, busy }) {
  const id = Number(writer?.id || writer?.user_id || 0);
  const name = writer?.name || writer?.writer_name || writer?.display_name || `Writer ${id}`;
  const initial = String(name).slice(0, 1).toUpperCase();
  const topic = writer?.topic || writer?.category_name || 'Writer on Bloggad';

  return (
    <div className="btf-writer-row">
      <span className="btf-writer-avatar">{initial}</span>
      <div>
        <strong>{name}</strong>
        <small>{topic}</small>
      </div>
      <button type="button" disabled={!id || busy === id} onClick={() => onFollow(id)}>
        {busy === id ? '...' : 'Follow'}
      </button>
    </div>
  );
}

export default function PublicTopicPage() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [topic, setTopic] = useState(null);
  const [children, setChildren] = useState([]);
  const [posts, setPosts] = useState([]);
  const [homeData, setHomeData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [followBusy, setFollowBusy] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadTopic() {
      try {
        setLoading(true);
        setError('');

        const [topicResult, homeResult] = await Promise.allSettled([
          api.get(`/api/public/reading/topics/${encodeURIComponent(slug || '')}`),
          api.get('/api/public/home'),
        ]);

        if (!active) return;

        if (topicResult.status !== 'fulfilled') {
          throw topicResult.reason;
        }

        const data = topicResult.value?.data || {};
        setTopic(data?.topic || null);
        setChildren(Array.isArray(data?.children) ? data.children : []);
        setPosts(Array.isArray(data?.posts) ? data.posts : []);

        if (homeResult.status === 'fulfilled') {
          setHomeData(homeResult.value?.data || {});
        }
      } catch (err) {
        if (active) {
          setError(err?.response?.data?.message || 'Failed to load this topic.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTopic();

    return () => {
      active = false;
    };
  }, [slug]);

  const visiblePosts = useMemo(() => {
    const text = String(search || '').trim().toLowerCase();
    if (!text) return posts;

    return posts.filter((post) =>
      [
        post?.title,
        post?.excerpt,
        post?.writer_name,
        post?.website_name,
        ...(Array.isArray(post?.topics) ? post.topics : []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(text)
    );
  }, [posts, search]);

  const homePosts = Array.isArray(homeData?.posts) ? homeData.posts : [];
  const categories = Array.isArray(homeData?.categories) ? homeData.categories : [];
  const writers = Array.isArray(homeData?.writers) ? homeData.writers.slice(0, 3) : [];
  const staffPicks = homePosts.slice(0, 3);

  async function followWriter(writerId) {
    if (!writerId) return;

    if (!isAuthenticated) {
      window.location.assign('/reader/login');
      return;
    }

    try {
      setFollowBusy(writerId);
      await api.post(`/api/reader/social/writers/${writerId}/follow`);
    } catch (actionError) {
      if (Number(actionError?.response?.status || 0) === 401) {
        window.location.assign('/reader/login');
      }
    } finally {
      setFollowBusy(0);
    }
  }

  return (
    <div className="bh-page">
      <aside className="bh-sidebar">
        <div className="bh-sidebar-brand">
          <Menu size={22} />
          <Link to="/">Bloggad</Link>
        </div>

        <nav className="bh-sidebar-nav">
          <SidebarItem to="/" icon={Home} label="Home" />
          <SidebarItem to="/reader/saved" icon={Bookmark} label="Library" />
          <SidebarItem to="/reader/profile" icon={User} label="Profile" />
          <SidebarItem to="/writer/posts" icon={BookOpen} label="Stories" />
          <SidebarItem active to="/topics" icon={Tags} label="Topics" />
          <SidebarItem to="/writer/analytics" icon={BarChart3} label="Stats" />
        </nav>

        <div className="bh-sidebar-divider" />

        <nav className="bh-sidebar-nav">
          <SidebarItem to="/reader/following" icon={Users} label="Following" />
        </nav>

        <div className="bh-find-writers">
          <Plus size={19} />
          <div>
            <span>Find writers and publications to follow.</span>
            <Link to="/topics">See suggestions</Link>
          </div>
        </div>
      </aside>

      <header className="bh-header">
        <Link className="bh-mobile-brand" to="/">Bloggad</Link>

        <label className="bh-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
          />
        </label>

        <div className="bh-header-actions">
          <button className="bh-get-app" type="button" disabled title="Bloggad app coming soon">
            Get app
          </button>

          <Link className="bh-write-link" to="/writer/posts/create">
            <PenSquare size={18} />
            <span>Write</span>
          </Link>

          <Bell className="bh-header-icon" size={20} />

          {isAuthenticated && user ? (
            <Link className="bh-profile-circle" to="/reader/profile">
              {String(user?.name || user?.email || 'U').slice(0, 1).toUpperCase()}
            </Link>
          ) : (
            <Link className="bh-profile-circle" to="/reader/login">
              <User size={16} />
            </Link>
          )}
        </div>
      </header>

<main className="bh-main">
        <section className="bh-feed-column btf-feed-column">
          {loading ? <div className="btf-state">Loading topic...</div> : null}
          {error ? <div className="btf-state error">{error}</div> : null}

          {!loading && !error && topic ? (
            <>
              <header className="btf-topic-head">
                <div className="btf-eyebrow">Topic</div>
                <h1>{topic.name}</h1>
                <p>
                  Fresh reporting, analysis and practical ideas from Writers covering
                  {` ${String(topic.name || '').toLowerCase()}`} and its impact.
                </p>

                {children.length ? (
                  <div className="btf-child-topics">
                    {children.map((child) => (
                      <Link key={child.id} to={`/topic/${encodeURIComponent(child.slug)}`}>
                        {child.name}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </header>

              <div className="btf-story-list">
                {visiblePosts.map((post) => (
                  <TopicStoryCard key={post.id} post={post} />
                ))}

                {!visiblePosts.length ? (
                  <div className="btf-empty">
                    No published reading is available in this topic yet.
                  </div>
                ) : null}
              </div>

              {visiblePosts.length ? (
                <div className="btf-more">More stories load as you scroll</div>
              ) : null}
            </>
          ) : null}
        </section>

        <aside className="bh-right-rail">
          <section className="bh-rail-section">
            <h2>Staff Picks</h2>
            <div className="bh-staff-list">
              {staffPicks.map((post) => (
                <StaffPick key={post.id} post={post} />
              ))}
            </div>
            <Link className="bh-rail-link" to="/">See the full list</Link>
          </section>

          <section className="bh-rail-section bh-topics-section">
            <h2>Related topics</h2>
            <div className="bh-topic-pills">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id || category.slug}
                  to={`/topic/${encodeURIComponent(category.slug || '')}`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </section>

          {writers.length ? (
            <section className="bh-rail-section">
              <h2>Who to follow</h2>
              <div className="btf-writer-list">
                {writers.map((writer) => (
                  <WriterRow
                    key={writer.id || writer.user_id}
                    writer={writer}
                    busy={followBusy}
                    onFollow={followWriter}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className="bh-rail-section bh-reading-list">
            <h2>Reading list</h2>
            <p>Save stories you want to return to and keep your reading organized.</p>
            <Link to="/reader/saved">Open Library</Link>
          </section>
        </aside>
      </main>

      <nav className="bh-mobile-bottom">
        <Link to="/"><Home size={19} /><span>Home</span></Link>
        <Link to="/reader/saved"><Bookmark size={19} /><span>Library</span></Link>
        <Link to="/writer/posts/create"><PenSquare size={19} /><span>Write</span></Link>
        <Link to="/reader/profile"><User size={19} /><span>Profile</span></Link>
      </nav>
    </div>
  );
}