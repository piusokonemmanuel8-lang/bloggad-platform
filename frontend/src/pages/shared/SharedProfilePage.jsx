import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  Bookmark,
  CircleDollarSign,
  FileText,
  Home,
  LayoutDashboard,
  LayoutGrid,
  PenSquare,
  Settings,
  Tags,
  UserRound,
  Users,
} from 'lucide-react';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import RoleSwitcher from '../../components/shared/RoleSwitcher';
import './SharedProfilePage.css';

function initialFor(value) {
  const clean = String(value || '').trim();
  return clean ? clean.charAt(0).toUpperCase() : 'B';
}

function displayName(user, writer, page) {
  return (
    writer?.public_name ||
    writer?.display_name ||
    writer?.pen_name ||
    user?.display_name ||
    user?.full_name ||
    user?.name ||
    page?.name ||
    user?.email ||
    'Bloggad member'
  );
}

function SidebarItem({ to, icon: Icon, label, active = false }) {
  return (
    <Link className={`shared-profile-nav-item${active ? ' active' : ''}`} to={to}>
      <Icon size={20} strokeWidth={1.8} />
      <span>{label}</span>
    </Link>
  );
}

function ActionCard({ to, icon: Icon, title, text }) {
  return (
    <Link className="shared-profile-action-card" to={to}>
      <span className="shared-profile-action-icon">
        <Icon size={19} strokeWidth={1.8} />
      </span>
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
    </Link>
  );
}

export default function SharedProfilePage() {
  const { isAuthenticated, user, bootstrapping } = useContext(AuthContext);
  const [writerPayload, setWriterPayload] = useState(null);
  const [writerLoading, setWriterLoading] = useState(false);

  const isWriter = user?.role === 'affiliate';
  const isReader = user?.role === 'customer';
  const supportedRole = isWriter || isReader;

  useEffect(() => {
    let active = true;
    const userId = Number(user?.id || 0);

    if (!userId || !supportedRole) {
      setWriterPayload(null);
      return undefined;
    }

    setWriterLoading(true);

    api
      .get(`/api/public/writer-pages/writers/${encodeURIComponent(userId)}/primary`, {
        skipGlobalLoader: true,
      })
      .then(async (response) => {
        const page = response?.data?.page || null;

        if (!page?.slug) {
          if (active) setWriterPayload(null);
          return;
        }

        try {
          const full = await api.get(
            `/api/public/writer-pages/${encodeURIComponent(page.slug)}`,
            { skipGlobalLoader: true }
          );

          if (active) {
            setWriterPayload({
              page: full?.data?.page || page,
              writer: full?.data?.writer || null,
            });
          }
        } catch (error) {
          if (active) {
            setWriterPayload({ page, writer: null });
          }
        }
      })
      .catch(() => {
        if (active) setWriterPayload(null);
      })
      .finally(() => {
        if (active) setWriterLoading(false);
      });

    return () => {
      active = false;
    };
  }, [supportedRole, user?.id]);

  const page = writerPayload?.page || null;
  const writer = writerPayload?.writer || null;
  const name = useMemo(() => displayName(user, writer, page), [page, user, writer]);
  const avatar = writer?.avatar_url || page?.logo_url || user?.avatar_url || '';
  const cover = writer?.cover_url || page?.banner_url || '';
  const currentRoleLabel = isWriter ? 'Writer' : 'Reader';

  if (bootstrapping) {
    return <div className="shared-profile-loading">Loading profile...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/reader/login" replace />;
  }

  if (!supportedRole) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="shared-profile-shell">
      <aside className="shared-profile-sidebar">
        <div className="shared-profile-brand">
          <Link to="/">Bloggad</Link>
        </div>

        <nav className="shared-profile-nav" aria-label="Profile navigation">
          {isWriter ? (
            <>
              <SidebarItem to="/" icon={Home} label="Home" />
              <SidebarItem to="/writer/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <SidebarItem to="/writer/posts" icon={FileText} label="Posts" />
              <SidebarItem to="/writer/posts/create" icon={PenSquare} label="Write" />
              <SidebarItem to="/writer/profile" icon={UserRound} label="Profile" active />
              <SidebarItem to="/writer/analytics" icon={BarChart3} label="Analytics" />
              <SidebarItem to="/writer/settings" icon={Settings} label="Settings" />
            </>
          ) : (
            <>
              <SidebarItem to="/" icon={Home} label="Home" />
              <SidebarItem to="/reader/saved-posts" icon={Bookmark} label="Library" />
              <SidebarItem to="/reader/profile" icon={UserRound} label="Profile" active />
              <SidebarItem to="/reader/following" icon={Users} label="Following" />
              <SidebarItem to="/topics" icon={Tags} label="Topics" />
              <SidebarItem to="/categories" icon={LayoutGrid} label="Categories" />
              <SidebarItem to="/reader/settings" icon={Settings} label="Settings" />
            </>
          )}
        </nav>
      </aside>

      <section className="shared-profile-workspace">
        <header className="shared-profile-topbar">
          <div>
            <strong>Profile</strong>
            <span>{currentRoleLabel} access</span>
          </div>

          <RoleSwitcher
            currentRole={isWriter ? 'writer' : 'reader'}
            compact
          />
        </header>

        <main className="shared-profile-main">
          <section className="shared-profile-hero">
            <div
              className="shared-profile-cover"
              style={cover ? { backgroundImage: `url("${cover}")` } : undefined}
            />

            <div className="shared-profile-identity">
              <div className="shared-profile-avatar">
                {avatar ? <img src={avatar} alt="" /> : <span>{initialFor(name)}</span>}
              </div>

              <div className="shared-profile-identity-copy">
                <div className="shared-profile-name-row">
                  <h1>{name}</h1>
                  <span className="shared-profile-role-badge">{currentRoleLabel}</span>
                </div>
                <p>{user?.email || 'Signed in to Bloggad'}</p>
                {writer?.tagline ? <small>{writer.tagline}</small> : null}
              </div>

              <div className="shared-profile-hero-actions">
                {page?.slug ? (
                  <Link className="shared-profile-primary-button" to={`/page/${page.slug}`}>
                    View Writer Page
                  </Link>
                ) : null}

                <Link
                  className="shared-profile-secondary-button"
                  to={isWriter ? '/writer/settings' : '/reader/settings'}
                >
                  Account settings
                </Link>
              </div>
            </div>
          </section>

          <section className="shared-profile-grid">
            <article className="shared-profile-card shared-profile-account-card">
              <div className="shared-profile-card-heading">
                <div>
                  <span>ACCOUNT</span>
                  <h2>Your Bloggad identity</h2>
                </div>
              </div>

              <div className="shared-profile-account-list">
                <div>
                  <span>Name</span>
                  <strong>{user?.name || name}</strong>
                </div>
                <div>
                  <span>Email</span>
                  <strong>{user?.email || '-'}</strong>
                </div>
                <div>
                  <span>Active role</span>
                  <strong>{currentRoleLabel}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{user?.status || 'active'}</strong>
                </div>
              </div>
            </article>

            <article className="shared-profile-card">
              <div className="shared-profile-card-heading">
                <div>
                  <span>{isWriter ? 'WRITER' : 'READER'}</span>
                  <h2>{isWriter ? 'Writer workspace' : 'Reader workspace'}</h2>
                </div>
              </div>

              <div className="shared-profile-actions-grid">
                {isWriter ? (
                  <>
                    <ActionCard
                      to="/writer/dashboard"
                      icon={LayoutDashboard}
                      title="Dashboard"
                      text="Open your Writer workspace."
                    />
                    <ActionCard
                      to="/writer/posts"
                      icon={FileText}
                      title="Posts"
                      text="Manage published and draft posts."
                    />
                    <ActionCard
                      to="/writer/posts/create"
                      icon={PenSquare}
                      title="Write"
                      text="Create a new story or post."
                    />
                    <ActionCard
                      to="/writer/analytics"
                      icon={BarChart3}
                      title="Analytics"
                      text="Review audience and content performance."
                    />
                  </>
                ) : (
                  <>
                    <ActionCard
                      to="/reader/dashboard"
                      icon={LayoutDashboard}
                      title="Overview"
                      text="Open your Reader dashboard."
                    />
                    <ActionCard
                      to="/reader/saved-posts"
                      icon={Bookmark}
                      title="Library"
                      text="Return to your saved reading."
                    />
                    <ActionCard
                      to="/reader/following"
                      icon={Users}
                      title="Following"
                      text="See Writers you follow."
                    />
                    <ActionCard
                      to="/reader/credits"
                      icon={CircleDollarSign}
                      title="Credits"
                      text="View and manage Reader credits."
                    />
                  </>
                )}
              </div>
            </article>

            <article className="shared-profile-card shared-profile-writer-card">
              <div className="shared-profile-card-heading">
                <div>
                  <span>WRITER IDENTITY</span>
                  <h2>{page ? page.name || 'Your Writer Page' : 'Writer Page'}</h2>
                </div>
                {page?.slug ? <span className="shared-profile-ready">Active</span> : null}
              </div>

              {writerLoading ? (
                <p className="shared-profile-muted">Checking your Writer identity...</p>
              ) : page ? (
                <>
                  <p className="shared-profile-writer-bio">
                    {page.bio || writer?.bio || 'Your active Writer Page is connected to this same Bloggad account.'}
                  </p>

                  <div className="shared-profile-writer-stats">
                    <div>
                      <strong>{Number(writer?.follower_count || 0).toLocaleString()}</strong>
                      <span>Followers</span>
                    </div>
                    <div>
                      <strong>{Number(writer?.love_count || 0).toLocaleString()}</strong>
                      <span>Likes</span>
                    </div>
                    <div>
                      <strong>{Number(writer?.applaud_count || 0).toLocaleString()}</strong>
                      <span>Applaud</span>
                    </div>
                  </div>

                  <div className="shared-profile-inline-actions">
                    <Link to={`/page/${page.slug}`}>Open public Page</Link>
                    {isWriter ? <Link to="/writer/pages">Manage Pages</Link> : null}
                  </div>
                </>
              ) : (
                <div className="shared-profile-empty">
                  <BookOpen size={22} strokeWidth={1.7} />
                  <div>
                    <strong>No active Writer Page found</strong>
                    <span>
                      {isWriter
                        ? 'Open Writer Pages to create or activate your public Page.'
                        : 'Switch to Writer when you want to publish under this same account.'}
                    </span>
                  </div>
                  {isWriter ? <Link to="/writer/pages">Open Writer Pages</Link> : null}
                </div>
              )}
            </article>
          </section>
        </main>

        <nav className="shared-profile-mobile-nav" aria-label="Profile mobile navigation">
          {isWriter ? (
            <>
              <Link to="/"><Home size={19} /><span>Home</span></Link>
              <Link to="/writer/posts"><FileText size={19} /><span>Posts</span></Link>
              <Link className="shared-profile-mobile-write" to="/writer/posts/create">
                <PenSquare size={19} /><span>Write</span>
              </Link>
              <Link className="active" to="/writer/profile"><UserRound size={19} /><span>Profile</span></Link>
            </>
          ) : (
            <>
              <Link to="/"><Home size={19} /><span>Home</span></Link>
              <Link to="/reader/saved-posts"><Bookmark size={19} /><span>Library</span></Link>
              <Link to="/reader/following"><Users size={19} /><span>Following</span></Link>
              <Link className="active" to="/reader/profile"><UserRound size={19} /><span>Profile</span></Link>
            </>
          )}
        </nav>
      </section>
    </div>
  );
}