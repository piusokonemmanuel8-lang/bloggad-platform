import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  BookOpen,
  Bookmark,
  ChevronRight,
  Home,
  LayoutGrid,
  Menu,
  Search,
  Tags,
  User,
  Users,
} from 'lucide-react';
import api from '../../api/axios';
import './HomePageFeed.css';
import './PublicCategoriesPage.css';

function SidebarItem({ active = false, to, icon: Icon, label }) {
  return (
    <Link className={`bh-sidebar-item ${active ? 'active' : ''}`} to={to}>
      <Icon size={21} strokeWidth={1.8} />
      <span>{label}</span>
    </Link>
  );
}

function categoryDescription(category) {
  return (
    category?.description ||
    category?.short_description ||
    `Explore products and discoveries in ${category?.name || 'this category'}.`
  );
}

export default function PublicCategoriesPage() {
  const [homeData, setHomeData] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setError('');
        const { data } = await api.get('/api/public/home');
        if (active) setHomeData(data || null);
      } catch (err) {
        if (active) {
          setError(err?.response?.data?.message || 'Failed to load categories.');
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const source = Array.isArray(homeData?.categories)
      ? homeData.categories.filter(Boolean)
      : [];

    const q = search.trim().toLowerCase();
    if (!q) return source;

    return source.filter((category) => {
      const name = String(category?.name || '').toLowerCase();
      const description = String(
        category?.description || category?.short_description || ''
      ).toLowerCase();

      return name.includes(q) || description.includes(q);
    });
  }, [homeData, search]);
return (
    <div className="bh-page categories-directory-page">
      <aside className="bh-sidebar">
        <div className="bh-sidebar-brand">
          <Menu size={24} strokeWidth={1.8} />
          <Link to="/">Bloggad</Link>
        </div>

        <nav className="bh-sidebar-nav">
          <SidebarItem to="/" icon={Home} label="Home" />
          <SidebarItem to="/reader/saved" icon={Bookmark} label="Library" />
          <SidebarItem to="/reader/profile" icon={User} label="Profile" />
          <SidebarItem to="/writer/posts" icon={BookOpen} label="Stories" />
          <SidebarItem to="/topics" icon={Tags} label="Topics" />
          <SidebarItem active to="/categories" icon={LayoutGrid} label="Categories" />
          <SidebarItem to="/writer/analytics" icon={BarChart3} label="Stats" />
        </nav>

        <div className="bh-sidebar-divider" />

        <nav className="bh-sidebar-nav">
          <SidebarItem to="/reader/following" icon={Users} label="Following" />
        </nav>

        <div className="bh-sidebar-suggestion">
          <span>+</span>
          <div>
            <p>Find writers and publications to follow.</p>
            <Link to="/topics">See suggestions</Link>
          </div>
        </div>
      </aside>

      <header className="bh-header">
        <label className="bh-search">
          <Search size={16} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search categories"
          />
        </label>

        <div className="bh-header-actions">
          <button type="button" className="bh-get-app">Get app</button>
          <Link className="bh-write-link" to="/writer/posts/create">Write</Link>
          <Bell className="bh-header-icon" size={20} />
          <Link className="bh-profile-circle" to="/reader/profile">
            <User size={18} />
          </Link>
        </div>
      </header>

      <main className="bh-main categories-directory-main">
        <section className="categories-directory-content">
          <div className="categories-directory-hero">
            <span className="categories-directory-kicker">Discover</span>
            <h1>Browse Categories</h1>
            <p>
              Explore every Bloggad marketplace category and choose what you want to discover.
            </p>
          </div>

          <label className="categories-directory-mobile-search">
            <Search size={16} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search categories"
            />
          </label>

          {error ? <div className="categories-directory-state error">{error}</div> : null}

          {!error && categories.length ? (
            <div className="categories-directory-grid">
              {categories.map((category) => (
                <Link
                  key={category.id || category.slug}
                  className="categories-directory-card"
                  to={`/category/${encodeURIComponent(category.slug || '')}`}
                >
                  <div className="categories-directory-card-icon">
                    <LayoutGrid size={20} strokeWidth={1.8} />
                  </div>

                  <div className="categories-directory-card-copy">
                    <h2>{category.name || 'Category'}</h2>
                    <p>{categoryDescription(category)}</p>
                  </div>

                  <ChevronRight size={18} strokeWidth={1.8} />
                </Link>
              ))}
            </div>
          ) : null}

          {!error && homeData && !categories.length ? (
            <div className="categories-directory-state">
              {search ? 'No categories match your search.' : 'No public categories are available yet.'}
            </div>
          ) : null}
        </section>
      </main>

      <nav className="bh-mobile-bottom">
        <Link to="/"><Home size={19} /><span>Home</span></Link>
        <Link to="/reader/saved"><Bookmark size={19} /><span>Library</span></Link>
        <Link className="active" to="/categories"><LayoutGrid size={19} /><span>Categories</span></Link>
        <Link to="/reader/profile"><User size={19} /><span>Profile</span></Link>
      </nav>
    </div>
  );
}