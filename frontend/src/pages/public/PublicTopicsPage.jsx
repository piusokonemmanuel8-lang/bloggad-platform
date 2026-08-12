import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Bookmark,
  BookOpen,
  Home,
  Menu,
  PenSquare,
  Plus,
  Search,
  Tags,
  User,
  Users,
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import './HomePageFeed.css';
import './PublicTopicsPage.css';

function SidebarItem({ active = false, to, icon: Icon, label }) {
  return (
    <Link className={`bh-sidebar-item ${active ? 'active' : ''}`} to={to}>
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
}

function cleanTopics(tree, query) {
  const text = String(query || '').trim().toLowerCase();
  if (!text) return tree;

  return tree
    .map((topic) => {
      const children = Array.isArray(topic?.children) ? topic.children : [];
      const topicMatch = String(topic?.name || '').toLowerCase().includes(text);
      const matchingChildren = children.filter((child) =>
        String(child?.name || '').toLowerCase().includes(text)
      );

      if (!topicMatch && !matchingChildren.length) return null;

      return {
        ...topic,
        children: topicMatch ? children : matchingChildren,
      };
    })
    .filter(Boolean);
}

function postUrl(post) {
  if (post?.writer_page_slug && post?.slug) {
    return `/page/${encodeURIComponent(post.writer_page_slug)}/post/${encodeURIComponent(post.slug)}`;
  }

  if (post?.website_slug && post?.slug) {
    return `/${encodeURIComponent(post.website_slug)}/post/${encodeURIComponent(post.slug)}`;
  }

  return '#';
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function TopicGroup({ topic }) {
  const children = Array.isArray(topic?.children) ? topic.children : [];

  return (
    <article className="bt-topic-group">
      <Link className="bt-topic-title" to={`/topic/${encodeURIComponent(topic.slug)}`}>
        <span>{topic.name}</span>
        <span className="bt-topic-arrow">&gt;</span>
      </Link>

      {children.length ? (
        <div className="bt-subtopics">
          {children.map((child) => (
            <Link
              className="bt-subtopic"
              key={child.id}
              to={`/topic/${encodeURIComponent(child.slug)}`}
            >
              <span>{child.name}</span>
              <span className="bt-subtopic-arrow">&gt;</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bt-empty-subtopic">No subtopics yet.</div>
      )}
    </article>
  );
}

function TopicStaffPick({ post }) {
  return (
    <article className="bt-staff-pick">
      <div className="bt-staff-writer">
        {post?.writer_name || post?.website_name || 'Writer'}
      </div>
      <Link to={postUrl(post)}>{post?.title || 'Published story'}</Link>
      <div className="bt-staff-date">
        {formatDate(post?.published_at || post?.created_at)}
      </div>
    </article>
  );
}

export default function PublicTopicsPage() {
  const { user, isAuthenticated } = useAuth();
  const [topics, setTopics] = useState([]);
  const [homeData, setHomeData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;

    async function loadPage() {
      try {
        setError('');

        const [topicsResult, homeResult] = await Promise.allSettled([
          api.get('/api/public/reading/topics'),
          api.get('/api/public/home'),
        ]);

        if (!active) return;

        if (topicsResult.status === 'fulfilled') {
          setTopics(Array.isArray(topicsResult.value?.data?.tree) ? topicsResult.value.data.tree : []);
        } else {
          throw topicsResult.reason;
        }

        if (homeResult.status === 'fulfilled') {
          setHomeData(homeResult.value?.data || {});
        }
      } catch (err) {
        if (active) {
          setError(err?.response?.data?.message || 'Failed to load topics.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPage();

    return () => {
      active = false;
    };
  }, []);

  const visibleTopics = useMemo(
    () => cleanTopics(topics, search),
    [topics, search]
  );

  const posts = Array.isArray(homeData?.posts) ? homeData.posts : [];
  const categories = Array.isArray(homeData?.categories) ? homeData.categories : [];
  const staffPicks = posts.slice(0, 3);

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
        <section className="bh-feed-column bt-feed-column">
          <section className="bt-hero">
            <div className="bt-eyebrow">Bloggad Reading</div>
            <h1>Explore topics</h1>
            <p>
              Find writing by subject, then move straight into the conversations
              that matter to you.
            </p>
          </section>

          <section className="bt-directory">
            <div className="bt-directory-head">
              <h2>Browse all topics</h2>
              <p>Choose a main topic or go directly to a subtopic.</p>
            </div>

            {loading ? <div className="bt-state">Loading topics...</div> : null}
            {error ? <div className="bt-state bt-error">{error}</div> : null}

            {!loading && !error && visibleTopics.length ? (
              <div className="bt-grid">
                {visibleTopics.map((topic) => (
                  <TopicGroup key={topic.id} topic={topic} />
                ))}
              </div>
            ) : null}

            {!loading && !error && !visibleTopics.length ? (
              <div className="bt-state">
                {search ? 'No topics match your search.' : 'No active topics are available yet.'}
              </div>
            ) : null}
          </section>

          <p className="bt-footnote">
            Topics are managed by Bloggad and used across Reader discovery and Writer publishing.
          </p>
        </section>

        <aside className="bh-right-rail">
          <section className="bh-rail-section">
            <h2>Staff Picks</h2>
            <div className="bh-staff-list">
              {staffPicks.map((post) => (
                <TopicStaffPick key={post.id} post={post} />
              ))}
            </div>
            <Link className="bh-rail-link" to="/">See the full list</Link>
          </section>

          <section className="bh-rail-section bh-topics-section">
            <h2>Recommended topics</h2>
            <div className="bh-topic-pills">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id || category.slug}
                  to={`/category/${encodeURIComponent(category.slug || '')}`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </section>

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