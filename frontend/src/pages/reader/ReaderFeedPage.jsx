import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Gift,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
} from 'lucide-react';
import api from '../../api/axios';
import ReaderUnifiedShell from '../../components/reader/ReaderUnifiedShell';
import '../public/HomePageFeed.css';
import './ReaderFeedApproved.css';

function formatCompact(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number <= 0) return '0';
  if (number >= 1000000) return `${(number / 1000000).toFixed(number >= 10000000 ? 0 : 1)}M`;
  if (number >= 1000) return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1)}K`;
  return String(number);
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

function formatFeedDate(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
  if (minutes < 10080) return `${Math.floor(minutes / 1440)}d`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function getInitials(value) {
  const words = String(value || 'Writer')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return 'W';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0] || ''}${words[1][0] || ''}`.toUpperCase();
}

function getFeedReason(post) {
  if (post?.interest_match) {
    return { label: 'Matches your interests', className: 'is-interest' };
  }

  if (post?.followed_writer) {
    return { label: 'Writer you follow', className: 'is-writer' };
  }

  if (post?.followed_publication) {
    return {
      label: 'Publication you follow',
      className: 'is-publication',
    };
  }

  return null;
}

function normalizeTopics(post) {
  if (Array.isArray(post?.topics)) {
    return post.topics
      .map((topic) => String(topic || '').trim())
      .filter(Boolean);
  }

  if (typeof post?.topics === 'string') {
    return post.topics
      .split(',')
      .map((topic) => topic.trim())
      .filter(Boolean);
  }

  return [];
}

function getPostUrl(post) {
  return post?.website_slug && post?.slug
    ? `/${post.website_slug}/post/${post.slug}`
    : '#';
}

export default function ReaderFeedPage() {
  const navigate = useNavigate();

  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [postStats, setPostStats] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
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

  useEffect(() => {
    let active = true;

    async function loadFeed() {
      setLoading(true);
      setError('');

      try {
        const { data } = await api.get('/api/reader/reading/feed');
        if (!active) return;

        const rows = Array.isArray(data?.posts)
          ? data.posts
          : Array.isArray(data?.feed)
            ? data.feed
            : Array.isArray(data)
              ? data
              : [];

        setFeed(rows);
      } catch (err) {
        if (!active) return;

        if (err?.response?.status === 401 || err?.response?.status === 403) {
          navigate('/reader/login', { replace: true });
          return;
        }

        setError(err?.response?.data?.message || 'Failed to load your feed.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFeed();

    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    const ids = feed
      .map((post) => Number(post?.id || 0))
      .filter((id) => id > 0);

    if (!ids.length) return;

    let active = true;

    Promise.all(
      ids.map((id) =>
        api
          .get(`/api/public/social/posts/${id}`)
          .then(({ data }) => ({ id, data }))
          .catch(() => ({ id, data: null }))
      )
    ).then((results) => {
      if (!active) return;

      const next = {};

      results.forEach(({ id, data }) => {
        next[id] = {
          love: Number(data?.counts?.love || 0),
          applaud: Number(data?.counts?.applaud || 0),
          comments: Number(data?.counts?.comments || 0),
        };
      });

      setPostStats(next);
    });

    return () => {
      active = false;
    };
  }, [feed]);

  useEffect(() => {
    if (!feed.length) return;

    let active = true;

    Promise.all(
      feed.map((post) => {
        const id = Number(post?.id || 0);

        if (!id) {
          return Promise.resolve({ post, data: null });
        }

        return api
          .get(`/api/reader/social/posts/${id}`)
          .then(({ data }) => ({ post, data }))
          .catch(() => ({ post, data: null }));
      })
    ).then((rows) => {
      if (!active) return;

      const next = {};

      rows.forEach(({ post, data }) => {
        const id = Number(post?.id || 0);
        if (!id || !data) return;

        next[id] = {
          love: !!(data?.state?.loved ?? data?.loved),
          applaud: !!(data?.state?.applauded ?? data?.applauded),
        };
      });

      setPostReactionActive(next);
    });

    return () => {
      active = false;
    };
  }, [feed]);

  useEffect(() => {
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
  }, []);

  function handleActionError(actionError) {
    if (
      actionError?.response?.status === 401 ||
      actionError?.response?.status === 403
    ) {
      navigate('/reader/login', { replace: true });
      return true;
    }

    return false;
  }

  async function togglePostReaction(post, reactionType) {
    const id = Number(post?.id || 0);
    if (!id) return;

    try {
      const { data } = await api.post(
        `/api/reader/social/posts/${id}/reactions/${reactionType}`
      );

      setPostStats((current) => ({
        ...current,
        [id]: {
          ...(current[id] || {}),
          love: Number(data?.counts?.love ?? current[id]?.love ?? 0),
          applaud: Number(
            data?.counts?.applaud ?? current[id]?.applaud ?? 0
          ),
          comments: Number(current[id]?.comments || 0),
        },
      }));

      setPostReactionActive((current) => ({
        ...current,
        [id]: {
          ...(current[id] || {}),
          [reactionType]: !!data?.active,
        },
      }));
    } catch (actionError) {
      handleActionError(actionError);
    }
  }

  function openComments(post) {
    const target = getPostUrl(post);
    if (!target || target === '#') return;

    window.location.assign(`${target}#responses`);
  }

  async function shareStory(post) {
    const path = getPostUrl(post);
    if (!path || path === '#') return;

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
        // Keep Reader Feed usable if browser sharing is unavailable.
      }
    } finally {
      setOpenStoryMenuId(null);
    }
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

      setSavedPosts((current) => ({
        ...current,
        [id]: !isSaved,
      }));
    } catch (actionError) {
      handleActionError(actionError);
    }
  }

  function hideStory(post) {
    const id = Number(post?.id || 0);
    if (!id) return;

    setHiddenPosts((current) => ({
      ...current,
      [id]: true,
    }));

    setOpenStoryMenuId(null);
  }

  function toggleStoryMenu(post) {
    const id = Number(post?.id || 0);
    if (!id) return;

    setOpenStoryMenuId((current) => (current === id ? null : id));
  }

  function makeGiftKey(writerId, postId) {
    const random =
      globalThis.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    return `reader-gift-${writerId}-${postId}-${random}`;
  }

  async function openGift(post) {
    const writerId = Number(
      post?.writer_user_id || post?.user_id || 0
    );
    const postId = Number(post?.id || 0);

    if (!writerId || !postId) return;

    try {
      setGiftBusy('load');
      setGiftError('');
      setGiftNotice('');

      const { data } = await api.get('/api/reader/credits');
      const settings = data?.appreciation_settings || {};
      const minimum = Math.max(
        1,
        Number(settings?.minimum_credits || 1)
      );

      setGiftPost(post);
      setGiftWallet(data || null);
      setGiftAmount(String(minimum));
      giftRequestKeyRef.current = '';
    } catch (actionError) {
      if (!handleActionError(actionError)) {
        setGiftError(
          actionError?.response?.data?.message || 'Could not open Gift.'
        );
      }
    } finally {
      setGiftBusy('');
    }
  }

  function closeGift() {
    setGiftPost(null);
    setGiftWallet(null);
    setGiftAmount('');
    setGiftBusy('');
    setGiftError('');
    setGiftNotice('');
    giftRequestKeyRef.current = '';
  }

  async function submitGift(event) {
    event.preventDefault();

    const writerId = Number(
      giftPost?.writer_user_id || giftPost?.user_id || 0
    );
    const postId = Number(giftPost?.id || 0);
    const credits = Number(giftAmount);
    const settings = giftWallet?.appreciation_settings || {};
    const minimum = Math.max(
      1,
      Number(settings?.minimum_credits || 1)
    );
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

    try {
      setGiftBusy('send');
      setGiftError('');
      setGiftNotice('');

      if (!giftRequestKeyRef.current) {
        giftRequestKeyRef.current = makeGiftKey(writerId, postId);
      }

      const idempotencyKey = giftRequestKeyRef.current;

      const { data } = await api.post(
        '/api/reader/credits/appreciate',
        {
          writer_user_id: writerId,
          post_id: postId,
          credits_amount: credits,
          idempotency_key: idempotencyKey,
        },
        {
          headers: {
            'Idempotency-Key': idempotencyKey,
          },
        }
      );

      const nextBalance =
        data?.appreciation?.reader_available_credits;

      if (nextBalance !== undefined && nextBalance !== null) {
        setGiftWallet((current) => ({
          ...(current || {}),
          available_credits: Number(nextBalance),
        }));
      }

      setGiftNotice(
        data?.message || 'Gift sent to the Writer.'
      );
      giftRequestKeyRef.current = '';
    } catch (actionError) {
      if (!handleActionError(actionError)) {
        setGiftError(
          actionError?.response?.data?.message || 'Could not send Gift.'
        );
      }
    } finally {
      setGiftBusy('');
    }
  }

  return (
    <ReaderUnifiedShell
      title="For You"
      subtitle="Your personalized Reader feed"
    >
      <main className="reader-feed-approved-page">
        <section className="reader-feed-approved-compact-top">
          <div className="reader-feed-approved-compact-copy">
            <strong>For You</strong>
            <span>Personalized from your interests and following.</span>
          </div>

          <div className="reader-feed-approved-compact-actions">
            <Link to="/reader/interests">Edit interests</Link>
            <Link to="/reader/reading-controls">Reading controls</Link>
            <Link to="/reader/following">Following</Link>
          </div>
        </section>

        <div className="reader-feed-approved-heading-row">
          <h2>Reading feed</h2>
          <span>
            {loading
              ? 'Loading'
              : `${feed.length} ${feed.length === 1 ? 'post' : 'posts'}`}
          </span>
        </div>

        {error ? (
          <div
            className="reader-feed-approved-state is-error"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="reader-feed-approved-state">
            Loading your personalized reading feed...
          </div>
        ) : null}

        {!loading && !error && feed.length ? (
          <section
            className="reader-feed-approved-list"
            aria-label="Personalized reading feed"
          >
            {feed.map((post) => {
              const postId = Number(post?.id || 0);
              if (hiddenPosts[postId]) return null;

              const reason = getFeedReason(post);
              const topics = normalizeTopics(post);
              const postUrl = getPostUrl(post);
              const dateLabel = formatFeedDate(
                post.published_at || post.created_at
              );
              const publicationLine = [
                post.website_name,
                dateLabel,
              ]
                .filter(Boolean)
                .join(' - ');

              const stats = postStats[postId];
              const loved =
                !!postReactionActive[postId]?.love;
              const applauded =
                !!postReactionActive[postId]?.applaud;
              const saved = !!savedPosts[postId];
              const menuOpen =
                openStoryMenuId === postId;

              return (
                <article
                  className="reader-feed-approved-card"
                  key={post.id}
                >
                  <div className="reader-feed-approved-card-top">
                    <div className="reader-feed-approved-author">
                      <span
                        className="reader-feed-approved-avatar"
                        aria-hidden="true"
                      >
                        {getInitials(post.writer_name)}
                      </span>

                      <div className="reader-feed-approved-author-copy">
                        <strong>
                          {post.writer_name || 'Writer'}
                        </strong>
                        {publicationLine ? (
                          <span>{publicationLine}</span>
                        ) : null}
                      </div>
                    </div>

                    {reason ? (
                      <span
                        className={`reader-feed-approved-reason ${reason.className}`}
                      >
                        {reason.label}
                      </span>
                    ) : null}
                  </div>

                  <div className="reader-feed-approved-kicker">
                    {post.category_name ? (
                      <span>{post.category_name}</span>
                    ) : null}

                    {post.category_name && post.content_type ? (
                      <span aria-hidden="true">-</span>
                    ) : null}

                    {post.content_type ? (
                      <span>
                        {String(post.content_type).replace(/_/g, ' ')}
                      </span>
                    ) : null}
                  </div>

                  <div
                    className={`reader-feed-approved-body ${
                      post.featured_image ? '' : 'no-media'
                    }`}
                  >
                    <div className="reader-feed-approved-story">
                      <h3>
                        <Link to={postUrl}>{post.title}</Link>
                      </h3>

                      {post.excerpt ? (
                        <p className="reader-feed-approved-excerpt">
                          {post.excerpt}
                        </p>
                      ) : null}
                    </div>

                    {post.featured_image ? (
                      <Link
                        className="reader-feed-approved-media"
                        to={postUrl}
                        aria-label={`Read ${post.title}`}
                      >
                        <img
                          src={post.featured_image}
                          alt=""
                          loading="lazy"
                        />
                      </Link>
                    ) : null}
                  </div>

                  <div className="bh-story-bottom bh-story-social-bar">
                    <div className="bh-story-stats bh-primary-social">
                      <button
                        type="button"
                        className={loved ? 'active' : ''}
                        title="Like"
                        aria-label="Like"
                        onClick={() =>
                          togglePostReaction(post, 'love')
                        }
                      >
                        <Heart
                          size={17}
                          fill={
                            loved ? 'currentColor' : 'none'
                          }
                        />
                        <span className="bh-action-label">
                          Like
                        </span>
                        <span className="bh-action-count">
                          {formatCompact(stats?.love)}
                        </span>
                      </button>

                      <button
                        type="button"
                        className={applauded ? 'active' : ''}
                        title="Applaud"
                        aria-label="Applaud"
                        onClick={() =>
                          togglePostReaction(post, 'applaud')
                        }
                      >
                        <ClapIcon size={18} />
                        <span className="bh-action-label">
                          Applaud
                        </span>
                        <span className="bh-action-count">
                          {formatCompact(stats?.applaud)}
                        </span>
                      </button>

                      <button
                        type="button"
                        title="Comment"
                        aria-label="Comment"
                        onClick={() => openComments(post)}
                      >
                        <MessageCircle size={17} />
                        <span className="bh-action-label">
                          Comment
                        </span>
                        <span className="bh-action-count">
                          {formatCompact(stats?.comments)}
                        </span>
                      </button>

                      <button
                        type="button"
                        className="bh-gift-action"
                        title="Gift this Writer"
                        aria-label="Gift this Writer"
                        onClick={() => openGift(post)}
                      >
                        <Gift size={17} />
                        <span className="bh-action-label">
                          Gift
                        </span>
                      </button>
                    </div>

                    <div className="bh-story-actions bh-secondary-social">
                      <button
                        type="button"
                        title="Share"
                        aria-label="Share"
                        onClick={() => shareStory(post)}
                      >
                        <Share2 size={18} />
                      </button>

                      <button
                        type="button"
                        className={saved ? 'active' : ''}
                        title={saved ? 'Saved' : 'Save'}
                        aria-label={saved ? 'Saved' : 'Save'}
                        onClick={() => toggleSave(post)}
                      >
                        <Bookmark
                          size={18}
                          fill={
                            saved ? 'currentColor' : 'none'
                          }
                        />
                      </button>

                      <div className="bh-more-wrap">
                        <button
                          type="button"
                          title="More"
                          aria-label="More"
                          onClick={() => toggleStoryMenu(post)}
                        >
                          <MoreHorizontal size={20} />
                        </button>

                        {menuOpen ? (
                          <div className="bh-story-menu">
                            <button
                              type="button"
                              onClick={() => hideStory(post)}
                            >
                              Show less like this
                            </button>
                            <Link to={postUrl}>
                              Open story
                            </Link>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="reader-feed-approved-card-footer">
                    <div className="reader-feed-approved-topics">
                      {topics.slice(0, 3).map((topic) => (
                        <span
                          className="reader-feed-approved-topic"
                          key={`${post.id}-${topic}`}
                        >
                          {topic}
                        </span>
                      ))}
                    </div>

                    <Link
                      className="reader-feed-approved-read"
                      to={postUrl}
                    >
                      Read story{' '}
                      <span aria-hidden="true">-&gt;</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        ) : null}

        {!loading && !feed.length && !error ? (
          <section className="reader-feed-approved-empty">
            <strong>
              Your personalized feed is ready for more stories.
            </strong>
            <p>
              Update your interests or follow more Writers and
              Publications to strengthen what appears here.
            </p>
            <div>
              <Link to="/reader/interests">
                Edit interests
              </Link>
              <Link to="/reader/following">
                Manage following
              </Link>
            </div>
          </section>
        ) : null}
      </main>

      {giftPost ? (
        <div
          className="bh-gift-overlay"
          role="presentation"
          onMouseDown={closeGift}
        >
          <section
            className="bh-gift-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Gift this Writer"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="bh-gift-head">
              <div className="bh-gift-mark">
                <Gift size={20} />
              </div>

              <div>
                <strong>Send a Gift</strong>
                <span>
                  {giftPost?.writer_name ||
                    giftPost?.website_name ||
                    'Writer'}
                </span>
              </div>

              <button
                type="button"
                onClick={closeGift}
                aria-label="Close Gift"
              >
                x
              </button>
            </div>

            <form
              className="bh-gift-form"
              onSubmit={submitGift}
            >
              <p>
                Gift this Writer with Reader credits for work you
                value.
              </p>

              <div className="bh-gift-balance">
                <span>Available credits</span>
                <strong>
                  {Number(
                    giftWallet?.available_credits || 0
                  ).toLocaleString()}
                </strong>
              </div>

              <label>
                <span>Gift amount</span>
                <input
                  type="number"
                  min={Math.max(
                    1,
                    Number(
                      giftWallet?.appreciation_settings
                        ?.minimum_credits || 1
                    )
                  )}
                  max={
                    giftWallet?.appreciation_settings
                      ?.maximum_credits === null ||
                    giftWallet?.appreciation_settings
                      ?.maximum_credits === undefined
                      ? undefined
                      : Number(
                          giftWallet.appreciation_settings
                            .maximum_credits
                        )
                  }
                  step="1"
                  value={giftAmount}
                  onChange={(event) =>
                    setGiftAmount(event.target.value)
                  }
                  disabled={giftBusy === 'send'}
                />
              </label>

              {giftError ? (
                <div className="bh-gift-message error">
                  {giftError}
                </div>
              ) : null}

              {giftNotice ? (
                <div className="bh-gift-message success">
                  {giftNotice}
                </div>
              ) : null}

              <div className="bh-gift-footer">
                <button
                  type="button"
                  className="secondary"
                  onClick={closeGift}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                  disabled={giftBusy === 'send'}
                >
                  <Gift size={16} />
                  {giftBusy === 'send'
                    ? 'Sending...'
                    : 'Send Gift'}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </ReaderUnifiedShell>
  );
}