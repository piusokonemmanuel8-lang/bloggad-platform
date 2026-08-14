import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Bookmark,
  BookOpen,
  Gift,
  Hand,
  Heart,
  Home,
  LayoutGrid,
  Menu,
  MessageCircle,
  MoreHorizontal,
  PenSquare,
  Plus,
  Search,
  Share2,
  Star,
  Tags,
  User,
  UserPlus,
  Users
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import './HomePageFeed.css';

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
    return `/${encodeURIComponent(post.website_slug)}/post/${encodeURIComponent(post.slug)}`;
  }
  return '#';
}

function writerUrl(post) {
  if (post?.writer_page_slug) {
    return `/page/${encodeURIComponent(post.writer_page_slug)}`;
  }
  if (post?.website_slug) {
    return `/${encodeURIComponent(post.website_slug)}`;
  }
  return '#';
}

function authRedirect(error) {
  if (Number(error?.response?.status || 0) === 401) {
    window.location.assign('/reader/login');
    return true;
  }
  return false;
}

function SidebarItem({ to, icon: Icon, label, active = false }) {
  return (
    <Link className={`bh-sidebar-item ${active ? 'active' : ''}`} to={to}>
      <Icon size={21} strokeWidth={1.6} />
      <span>{label}</span>
    </Link>
  );
}

function ClapIcon({ size = 17 }) {
  return (
    <svg
      aria-hidden="true"
      className="bh-clap-icon"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <path d="M7.4 12.7 4.9 10.2a1.45 1.45 0 0 1 2.05-2.05l2.28 2.28" />
      <path d="m9.2 10.4-3.05-3.05A1.45 1.45 0 1 1 8.2 5.3l3.05 3.05" />
      <path d="m11.2 8.4-2.1-2.1a1.45 1.45 0 0 1 2.05-2.05l5.5 5.5" />
      <path d="m14.1 7.2-.85-.85a1.45 1.45 0 0 1 2.05-2.05l3.5 3.5c2.75 2.75 2.75 7.2 0 9.95l-.4.4c-2.75 2.75-7.2 2.75-9.95 0l-3.6-3.6a1.45 1.45 0 1 1 2.05-2.05l1.85 1.85" />
      <path d="M3.5 4.7 2.2 3.4M4.2 1.8l.15 1.85M1.6 7.1l1.85.05" />
      <path d="m19.6 4.1 1.3-1.3M20.1 7l1.8-.55" />
    </svg>
  );
}
function StoryCard({
  post,
  stats,
  saved,
  loved,
  applauded,
  following,
  hidden,
  menuOpen,
  onLike,
  onApplaud,
  onComment,
  onGift,
  onFollow,
  onSave,
  onShare,
  onHide,
  onMore,
}) {
  if (hidden) return null;

  const url = postUrl(post);
  const author = post?.writer_name || post?.website_name || 'Writer';

  return (
    <article className="bh-story-card">
      <div className="bh-story-main">
        <div className="bh-story-author">
          <Link
            className="bh-story-author-avatar"
            to={writerUrl(post)}
            aria-label={`${author} profile`}
            title={`${author} profile`}
          >
            {post?.writer_avatar_url ? (
              <img src={post.writer_avatar_url} alt="" />
            ) : (
              <span>{String(author || 'W').slice(0, 1).toUpperCase()}</span>
            )}
          </Link>

          <Link className="bh-story-author-name" to={writerUrl(post)}>{author}</Link>

          <button
            type="button"
            className={`bh-inline-follow ${following ? 'active' : ''}`}
            onClick={() => onFollow(post)}
          >
            <UserPlus size={12} />
            <span>{following ? 'Following' : 'Follow'}</span>
          </button>

          <span className="bh-author-dot">-</span>
          <span>{relativeDate(post?.published_at || post?.created_at)}</span>
        </div>

        <Link className="bh-story-title" to={url}>
          {post?.title || 'Untitled story'}
        </Link>

        {post?.excerpt ? (
          <p className="bh-story-excerpt">{post.excerpt}</p>
        ) : null}

        <div className="bh-story-bottom bh-story-social-bar">
          <div className="bh-story-stats bh-primary-social">
            <button
              type="button"
              className={loved ? 'active' : ''}
              title="Like"
              aria-label="Like"
              onClick={() => onLike(post)}
            >
              <Heart size={17} fill={loved ? 'currentColor' : 'none'} />
              <span className="bh-action-label">Like</span>
              <span className="bh-action-count">{formatCompact(stats?.love)}</span>
            </button>

            <button
              type="button"
              className={applauded ? 'active' : ''}
              title="Applaud"
              aria-label="Applaud"
              onClick={() => onApplaud(post)}
            >
              <ClapIcon size={18} />
              <span className="bh-action-label">Applaud</span>
              <span className="bh-action-count">{formatCompact(stats?.applaud)}</span>
            </button>

            <button
              type="button"
              title="Comment"
              aria-label="Comment"
              onClick={() => onComment(post)}
            >
              <MessageCircle size={17} />
              <span className="bh-action-label">Comment</span>
              <span className="bh-action-count">{formatCompact(stats?.comments)}</span>
            </button>

            <button
              type="button"
              className="bh-gift-action"
              title="Gift this Writer"
              aria-label="Gift this Writer"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onGift(post);
              }}
            >
              <Gift size={17} />
              <span
                className="bh-action-label"
                style={{
                  position: 'relative',
                  display: 'inline-block',
                }}
              >
                Gift
                {Number(stats?.gifts || 0) > 0 ? (
                  <span
                    aria-label={String(Number(stats?.gifts || 0)) + ' Gifts'}
                    style={{
                      position: 'absolute',
                      top: -10,
                      right: -6,
                      minWidth: 13,
                      height: 13,
                      padding: '0 2px',
                      borderRadius: 999,
                      border: '1.5px solid #ffffff',
                      background: '#9a6700',
                      color: '#ffffff',
                      fontSize: 8,
                      fontWeight: 900,
                      lineHeight: '11px',
                      textAlign: 'center',
                      boxSizing: 'border-box',
                      boxShadow: '0 1px 2px rgba(17, 24, 39, 0.18)',
                      pointerEvents: 'none',
                      transform: 'translate(0, 0)',
                      zIndex: 1,
                    }}
                  >
                    {Number(stats?.gifts || 0) > 99
                      ? '99+'
                      : Number(stats?.gifts || 0)}
                  </span>
                ) : null}
              </span>
            </button>
          </div>

          <div className="bh-story-actions bh-secondary-social">
            <button
              type="button"
              title="Share"
              aria-label="Share"
              onClick={() => onShare(post)}
            >
              <Share2 size={18} />
            </button>

            <button
              type="button"
              className={saved ? 'active' : ''}
              title={saved ? 'Saved' : 'Save'}
              aria-label={saved ? 'Saved' : 'Save'}
              onClick={() => onSave(post)}
            >
              <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
            </button>

            <div className="bh-more-wrap">
              <button
                type="button"
                title="More"
                aria-label="More"
                onClick={() => onMore(post)}
              >
                <MoreHorizontal size={20} />
              </button>

              {menuOpen ? (
                <div className="bh-story-menu">
                  <button type="button" onClick={() => onHide(post)}>
                    Show less like this
                  </button>
                  <Link to={url}>Open story</Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {post?.featured_image ? (
        <Link className="bh-story-thumb" to={url}>
          <img src={post.featured_image} alt="" />
        </Link>
      ) : (
        <Link className="bh-story-thumb bh-story-thumb-empty" to={url} aria-label={post?.title || 'Story'} />
      )}
    </article>
  );
}
function StaffPick({ post }) {
  return (
    <Link className="bh-staff-pick" to={postUrl(post)}>
      <span className="bh-staff-author">{post?.writer_name || post?.website_name || 'Writer'}</span>
      <strong>{post?.title || 'Story'}</strong>
      <span className="bh-staff-date">? &nbsp; {relativeDate(post?.published_at || post?.created_at)}</span>
    </Link>
  );
}

function WriterRow({ writer, following, onFollow }) {
  return (
    <div className="bh-writer-row">
      <Link className="bh-writer-avatar" to={writer.url}>
        {String(writer.name || 'W').slice(0, 1).toUpperCase()}
      </Link>

      <div className="bh-writer-copy">
        <Link to={writer.url}>{writer.name}</Link>
        <span>{writer.topic || 'Writer on Bloggad'}</span>
      </div>

      <button type="button" onClick={() => onFollow(writer)} className={following ? 'active' : ''}>
        {following ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();

  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('for-you');
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  const [personalizedPosts, setPersonalizedPosts] = useState(null);
  const [postStats, setPostStats] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
  const [following, setFollowing] = useState({});
  const [postReactionActive, setPostReactionActive] = useState({});
  const [hiddenPosts, setHiddenPosts] = useState({});
  const [openStoryMenuId, setOpenStoryMenuId] = useState(null);
  const [giftPost, setGiftPost] = useState(null);
  const [giftWallet, setGiftWallet] = useState(null);
  const [giftAmount, setGiftAmount] = useState('');
  const [giftBusy, setGiftBusy] = useState('');
  const [giftError, setGiftError] = useState('');
  const [giftNotice, setGiftNotice] = useState('');
  const giftRequestKeyRef = useRef('');
  const loaderRef = useRef(null);

  useEffect(() => {
    let active = true;

    api.get('/api/public/home')
      .then(({ data }) => {
        if (!active) return;
        setPageData(data || null);
        setError('');
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError?.response?.data?.message || 'Failed to load homepage.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

    useEffect(() => {
    if (!isAuthenticated) {
      setPersonalizedPosts(null);
      return undefined;
    }

    let active = true;

    async function loadPersonalizedHomeFeed() {
      try {
        const { data } = await api.get('/api/reader/reading/feed', {
          skipGlobalLoader: true,
        });

        if (!active) return;

        const feed = Array.isArray(data?.feed)
          ? data.feed.filter(Boolean)
          : Array.isArray(data?.posts)
            ? data.posts.filter(Boolean)
            : [];

        setPersonalizedPosts(feed.length ? feed : null);
      } catch {
        if (active) {
          setPersonalizedPosts(null);
        }
      }
    }

    loadPersonalizedHomeFeed();

    return () => {
      active = false;
    };
  }, [isAuthenticated]);
const allPosts = useMemo(() => {
    const source = Array.isArray(personalizedPosts)
      ? personalizedPosts
      : Array.isArray(pageData?.posts)
        ? pageData.posts
        : [];

    return source.filter(Boolean);
  }, [pageData, personalizedPosts]);

  const categories = useMemo(
    () => (Array.isArray(pageData?.categories) ? pageData.categories.filter(Boolean) : []),
    [pageData]
  );

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    let list = activeTab === 'featured'
      ? allPosts.filter((post) => post?.featured_image)
      : allPosts;

    if (query) {
      list = list.filter((post) => {
        const haystack = [
          post?.title,
          post?.excerpt,
          post?.writer_name,
          post?.website_name,
          post?.content_type,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(query);
      });
    }

    return list;
  }, [activeTab, allPosts, search]);

  const visiblePosts = useMemo(
    () => filteredPosts.slice(0, visibleCount),
    [filteredPosts, visibleCount]
  );

  useEffect(() => {
    const ids = visiblePosts
      .map((post) => Number(post?.id || 0))
      .filter((id) => id > 0 && !postStats[id]);

    if (!ids.length) return;

    let active = true;

    Promise.all(
      ids.map((id) =>
        api
          .get(`/api/public/social/posts/${id}`, {
            skipGlobalLoader: true,
          })
          .then(({ data }) => ({ id, data }))
          .catch(() => ({ id, data: null }))
      )
    ).then((results) => {
      if (!active) return;

      setPostStats((current) => {
        const next = { ...current };

        results.forEach(({ id, data }) => {
          next[id] = {
            love: Number(data?.counts?.love || 0),
            applaud: Number(data?.counts?.applaud || 0),
            comments: Number(data?.counts?.comments || 0),
            gifts: Number(data?.counts?.gifts || 0),
            writer_id: Number(data?.writer?.id || 0),
          };
        });

        return next;
      });
    });

    return () => {
      active = false;
    };
  }, [visiblePosts, postStats]);

  useEffect(() => {
    if (!loaderRef.current || visibleCount >= filteredPosts.length) return;

    const target = loaderRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((count) => Math.min(count + 8, filteredPosts.length));
        }
      },
      { rootMargin: '240px 0px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [filteredPosts.length, visibleCount]);

  useEffect(() => {
    setVisibleCount(10);
  }, [activeTab, search]);

  const staffPicks = useMemo(() => {
    const indexes = [0, 2, 4];
    return indexes.map((index) => allPosts[index]).filter(Boolean);
  }, [allPosts]);

  const writers = useMemo(() => {
    const seen = new Set();
    const list = [];

    allPosts.forEach((post) => {
      const id = Number(post?.user_id || 0);
      if (!id || seen.has(id) || list.length >= 4) return;

      seen.add(id);
      list.push({
        id,
        name: post?.writer_name || post?.website_name || 'Writer',
        topic: post?.content_type
          ? String(post.content_type).replace(/_/g, ' ')
          : 'Writer on Bloggad',
        url: writerUrl(post),
      });
    });

    return list;
  }, [allPosts]);

  useEffect(() => {
    if (!isAuthenticated || !visiblePosts.length) return;

    let active = true;

    Promise.all(
      visiblePosts.map((post) =>
        api
          .get(`/api/reader/social/posts/${Number(post?.id || 0)}`, {
            skipGlobalLoader: true,
          })
          .then(({ data }) => ({ post, data }))
          .catch(() => ({ post, data: null }))
      )
    ).then((rows) => {
      if (!active) return;

      setPostReactionActive((current) => {
        const next = { ...current };

        rows.forEach(({ post, data }) => {
          const id = Number(post?.id || 0);
          if (!id || !data) return;

          next[id] = {
            love: !!data?.loved,
            applaud: !!data?.applauded,
          };
        });

        return next;
      });

      setFollowing((current) => {
        const next = { ...current };

        rows.forEach(({ post, data }) => {
          const writerId = Number(post?.user_id || 0);
          if (!writerId || !data) return;
          next[writerId] = !!data?.following;
        });

        return next;
      });
    });

    return () => {
      active = false;
    };
  }, [isAuthenticated, visiblePosts]);

  async function loadHomepageReaderState() {
    return true;
  }
  async function togglePostReaction(post, type) {
    const id = Number(post?.id || 0);
    if (!id) return;

    try {
      const { data } = await api.post(`/api/reader/social/posts/${id}/reactions/${type}`);

      setPostStats((current) => ({
        ...current,
        [id]: {
          ...(current[id] || {}),
          love: Number(data?.counts?.love ?? current[id]?.love ?? 0),
          applaud: Number(data?.counts?.applaud ?? current[id]?.applaud ?? 0),
          comments: Number(current[id]?.comments || 0),
        },
      }));

      setPostReactionActive((current) => ({
        ...current,
        [id]: {
          ...(current[id] || {}),
          [type]: !!data?.active,
        },
      }));
    } catch (actionError) {
      authRedirect(actionError);
    }
  }

  function hideHomepageStory(post) {
    const id = Number(post?.id || 0);
    if (!id) return;

    setHiddenPosts((current) => ({
      ...current,
      [id]: true,
    }));

    setOpenStoryMenuId(null);
  }

  function toggleHomepageStoryMenu(post) {
    const id = Number(post?.id || 0);
    if (!id) return;

    setOpenStoryMenuId((current) => (current === id ? null : id));
  }

  function openHomepageComments(post) {
    const target = postUrl(post);
    if (!target || target === '#') return;
    window.location.assign(`${target}#responses`);
  }
  async function shareHomepageStory(post) {
    const path = postUrl(post);
    const url = `${window.location.origin}${path}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: post?.title || 'Bloggad story',
          text: post?.excerpt || '',
          url,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      }
    } catch (shareError) {
      if (shareError?.name !== 'AbortError') {
        // Keep homepage usable if browser sharing is unavailable.
      }
    } finally {
      setOpenStoryMenuId(null);
    }
  }

  function makeHomepageGiftKey(writerId, postId) {
    const random =
      globalThis.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    return `reader-gift-${writerId}-${postId}-${random}`;
  }

  async function openHomepageGift(post) {
    const postId = Number(post?.id || 0);

    if (!postId) return;

    let writerId = Number(
      post?.user_id ||
        post?.writer_user_id ||
        post?.writer_id ||
        post?.author_user_id ||
        post?.writer_page_user_id ||
        postStats[postId]?.writer_id ||
        0
    );

    setGiftPost({
      ...(post || {}),
      __gift_writer_user_id: writerId,
    });
    setGiftWallet(null);
    setGiftAmount('');
    setGiftError('');
    setGiftNotice('');
    giftRequestKeyRef.current = '';

    try {
      setGiftBusy('load');

      if (!writerId) {
        const { data: socialData } = await api.get(
          '/api/public/social/posts/' + postId,
          { skipGlobalLoader: true }
        );

        writerId = Number(socialData?.writer?.id || 0);

        setPostStats((current) => ({
          ...current,
          [postId]: {
            ...(current[postId] || {}),
            writer_id: writerId,
          },
        }));

        setGiftPost((current) =>
          current
            ? {
                ...current,
                __gift_writer_user_id: writerId,
              }
            : current
        );
      }

      if (!writerId) {
        setGiftError('Could not resolve the Writer account for this post.');
        return;
      }

      const { data } = await api.get('/api/reader/credits');
      const settings = data?.appreciation_settings || {};
      const minimum = Math.max(1, Number(settings?.minimum_credits || 1));

      setGiftWallet({
        ...(data?.wallet || {}),
        appreciation_settings: settings,
      });
      setGiftAmount(String(minimum));
    } catch (actionError) {
      if (!authRedirect(actionError)) {
        setGiftError(
          actionError?.response?.data?.message || 'Could not load Gift.'
        );
      }
    } finally {
      setGiftBusy('');
    }
  }

  function closeHomepageGift() {
    setGiftPost(null);
    setGiftWallet(null);
    setGiftAmount('');
    setGiftBusy('');
    setGiftError('');
    setGiftNotice('');
    giftRequestKeyRef.current = '';
  }

  async function submitHomepageGift(event) {
    event.preventDefault();

    const writerId = Number(
      giftPost?.__gift_writer_user_id ||
        giftPost?.user_id ||
        giftPost?.writer_user_id ||
        giftPost?.writer_id ||
        giftPost?.author_user_id ||
        giftPost?.writer_page_user_id ||
        postStats[Number(giftPost?.id || 0)]?.writer_id ||
        0
    );
    const postId = Number(giftPost?.id || 0);
    const credits = Number(giftAmount);
    const settings = giftWallet?.appreciation_settings || {};
    const minimum = Math.max(1, Number(settings?.minimum_credits || 1));
    const maximum =
      settings?.maximum_credits === null ||
      settings?.maximum_credits === undefined
        ? null
        : Number(settings.maximum_credits);

    if (!writerId || !postId) return;

    if (!Number.isInteger(credits) || credits < minimum) {
      setGiftError(`Enter at least ${minimum} whole Reader credits.`);
      return;
    }

    if (maximum !== null && credits > maximum) {
      setGiftError(`The maximum Gift is ${maximum} Reader credits.`);
      return;
    }

    const availableCredits = Number(giftWallet?.available_credits || 0);

    if (credits > availableCredits) {
      setGiftError(
        `You have ${availableCredits.toLocaleString()} available Reader credits.`
      );
      return;
    }

    try {
      setGiftBusy('send');
      setGiftError('');
      setGiftNotice('');

      if (!giftRequestKeyRef.current) {
        giftRequestKeyRef.current = makeHomepageGiftKey(writerId, postId);
      }

      const idempotencyKey = giftRequestKeyRef.current;

      const { data } = await api.post(
        '/api/reader/credits/appreciate',
        {
          writer_user_id: writerId,
          post_id: postId,
          credits,
          idempotency_key: idempotencyKey,
        },
        {
          headers: {
            'Idempotency-Key': idempotencyKey,
          },
        }
      );

      const nextBalance = data?.appreciation?.reader_available_credits;

      if (nextBalance !== undefined && nextBalance !== null) {
        setGiftWallet((current) => ({
          ...(current || {}),
          available_credits: Number(nextBalance),
        }));
      }

      const writerWalletCredit = Number(
        data?.appreciation?.writer_wallet_credit_usd ||
          data?.appreciation?.writer_net_usd ||
          0
      );

      setGiftNotice(
        writerWalletCredit > 0
          ? `Gift sent. The Writer received $${writerWalletCredit.toFixed(2)} in withdrawable earnings.`
          : data?.message || 'Gift sent to the Writer.'
      );

      if (!data?.appreciation?.idempotent_replay) {
        setPostStats((current) => ({
          ...current,
          [postId]: {
            ...(current[postId] || {}),
            gifts: Number(current[postId]?.gifts || 0) + 1,
          },
        }));
      }

      giftRequestKeyRef.current = '';
    } catch (actionError) {
      if (!authRedirect(actionError)) {
        setGiftError(actionError?.response?.data?.message || 'Could not send Gift.');
      }
    } finally {
      setGiftBusy('');
    }
  }
  async function followHomepageStoryWriter(post) {
    const writerId = Number(post?.user_id || 0);
    if (!writerId) return;

    try {
      const { data } = await api.post(`/api/reader/social/writers/${writerId}/follow`);

      setFollowing((current) => ({
        ...current,
        [writerId]: !!data?.following,
      }));
    } catch (actionError) {
      authRedirect(actionError);
    } finally {
      setOpenStoryMenuId(null);
    }
  }
  useEffect(() => {
    if (!isAuthenticated) return;

    let active = true;

    api
      .get('/api/customer/saved/posts')
      .then(({ data }) => {
        if (!active) return;

        const items = Array.isArray(data?.items) ? data.items : [];
        const next = {};

        items.forEach((item) => {
          const id = Number(item?.post?.id || item?.post_id || 0);
          if (id) next[id] = true;
        });

        setSavedPosts(next);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  async function loadHomepageSavedPosts() {
    return true;
  }
  async function toggleSave(post) {
    const id = Number(post?.id || 0);
    if (!id) return;

    const isSaved = !!savedPosts[id];

    try {
      if (isSaved) {
        await api.delete(`/api/customer/saved/posts/${id}`);
      } else {
        await api.post('/api/customer/saved/posts', { post_id: id });
      }

      setSavedPosts((current) => ({ ...current, [id]: !isSaved }));
    } catch (actionError) {
      authRedirect(actionError);
    }
  }

  async function toggleFollow(writer) {
    if (!writer?.id) return;

    try {
      const { data } = await api.post(`/api/reader/social/writers/${writer.id}/follow`);
      setFollowing((current) => ({
        ...current,
        [writer.id]: !!data?.following,
      }));
    } catch (actionError) {
      authRedirect(actionError);
    }
  }

  if (loading) {
    return <div className="bh-status">Loading Bloggad...</div>;
  }

  return (
    <div className="bh-page">
      <aside className="bh-sidebar">
        <div className="bh-sidebar-brand">
          <Menu size={22} />
          <Link to="/">Bloggad</Link>
        </div>

        <nav className="bh-sidebar-nav">
          <SidebarItem active to="/" icon={Home} label="Home" />
          <SidebarItem to="/reader/saved" icon={Bookmark} label="Library" />
          <SidebarItem to="/reader/profile" icon={User} label="Profile" />
          <SidebarItem to="/writer/posts" icon={BookOpen} label="Stories" />
          <SidebarItem to="/topics" icon={Tags} label="Topics" />
          <SidebarItem to="/categories" icon={LayoutGrid} label="Categories" />
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
        <section className="bh-feed-column">
          <div className="bh-tabs">
            <button
              type="button"
              className={activeTab === 'for-you' ? 'active' : ''}
              onClick={() => setActiveTab('for-you')}
            >
              For you
            </button>
            <button
              type="button"
              className={activeTab === 'featured' ? 'active' : ''}
              onClick={() => setActiveTab('featured')}
            >
              Featured
            </button>
          </div>

          {error ? <div className="bh-inline-error">{error}</div> : null}

          <div className="bh-story-list">
            {visiblePosts.length ? (
              visiblePosts.map((post) => (
                <StoryCard
                  key={post.id}
                  post={post}
                  stats={postStats[post.id]}
                  saved={!!savedPosts[post.id]}
                  loved={!!postReactionActive[post.id]?.love}
                  applauded={!!postReactionActive[post.id]?.applaud}
                  following={!!following[Number(post?.user_id || 0)]}
                  hidden={!!hiddenPosts[post.id]}
                  menuOpen={openStoryMenuId === Number(post.id)}
                  onLike={(item) => togglePostReaction(item, 'love')}
                  onApplaud={(item) => togglePostReaction(item, 'applaud')}
                  onComment={openHomepageComments}
                  onGift={openHomepageGift}
                  onFollow={followHomepageStoryWriter}
                  onSave={toggleSave}
                  onShare={shareHomepageStory}
                  onHide={hideHomepageStory}
                  onMore={toggleHomepageStoryMenu}
                />
              ))
            ) : (
              <div className="bh-empty">
                <strong>No published stories yet.</strong>
                <span>Published Writer posts will appear here automatically.</span>
              </div>
            )}
          </div>

          <div className="bh-load-sentinel" ref={loaderRef}>
            {visibleCount < filteredPosts.length ? 'Loading more stories...' : ''}
          </div>
        </section>

        <aside className="bh-right-rail">
          <section className="bh-rail-section">
            <h2>Staff Picks</h2>
            <div className="bh-staff-list">
              {staffPicks.map((post) => (
                <StaffPick key={post.id} post={post} />
              ))}
            </div>
            <Link className="bh-rail-link" to="/topics">See the full list</Link>
          </section>

          <section className="bh-rail-section bh-topics-section">
            <h2>Recommended topics</h2>
            <div className="bh-topic-pills">
              {categories.slice(0, 6).map((category) => (
                <Link key={category.id || category.slug} to={`/category/${encodeURIComponent(category.slug || '')}`}>
                  {category.name}
                </Link>
              ))}
            </div>
          </section>

          <section className="bh-rail-section">
            <h2>Who to follow</h2>
            <div className="bh-writer-list">
              {writers.map((writer) => (
                <WriterRow
                  key={writer.id}
                  writer={writer}
                  following={!!following[writer.id]}
                  onFollow={toggleFollow}
                />
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

      {giftPost ? (
        <div className="bh-gift-overlay" role="presentation" onMouseDown={closeHomepageGift}>
          <section
            className="bh-gift-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Gift this Writer"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="bh-gift-head">
              <div className="bh-gift-mark"><Gift size={20} /></div>
              <div>
                <strong>Send a Gift</strong>
                <span>{giftPost?.writer_name || giftPost?.website_name || 'Writer'}</span>
              </div>
              <button type="button" onClick={closeHomepageGift} aria-label="Close Gift">
                x
              </button>
            </div>

            <form className="bh-gift-form" onSubmit={submitHomepageGift}>
              <p>
                Gift this Writer with Reader credits for work you value.
              </p>

              <div className="bh-gift-balance">
                <span>Available credits</span>
                <strong>{Number(giftWallet?.available_credits || 0).toLocaleString()}</strong>
              </div>

              <label>
                <span>Gift amount</span>
                <input
                  type="number"
                  min={Math.max(1, Number(giftWallet?.appreciation_settings?.minimum_credits || 1))}
                  max={
                    giftWallet?.appreciation_settings?.maximum_credits === null ||
                    giftWallet?.appreciation_settings?.maximum_credits === undefined
                      ? undefined
                      : Number(giftWallet.appreciation_settings.maximum_credits)
                  }
                  step="1"
                  value={giftAmount}
                  onChange={(event) => setGiftAmount(event.target.value)}
                  disabled={giftBusy === 'send'}
                />
              </label>

              {giftError ? <div className="bh-gift-message error">{giftError}</div> : null}
              {giftNotice ? <div className="bh-gift-message success">{giftNotice}</div> : null}

              <div className="bh-gift-footer">
                <button type="button" className="secondary" onClick={closeHomepageGift}>
                  Cancel
                </button>
                <button type="submit" className="primary" disabled={giftBusy === 'send'}>
                  <Gift size={16} />
                  {giftBusy === 'send' ? 'Sending...' : 'Send Gift'}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
      <nav className="bh-mobile-bottom">
        <Link className="active" to="/"><Home size={19} /><span>Home</span></Link>
        <Link to="/reader/saved"><Bookmark size={19} /><span>Library</span></Link>
        <Link to="/writer/posts/create"><PenSquare size={19} /><span>Write</span></Link>
        <Link to="/reader/profile"><User size={19} /><span>Profile</span></Link>
      </nav>
    </div>
  );
}