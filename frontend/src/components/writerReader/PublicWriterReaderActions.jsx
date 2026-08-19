import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Gift,
  Heart,
  MessageCircle,
  Send,
  Share2,
  Sparkles,
  UserPlus,
  UserRound,
} from 'lucide-react';
import ReaderReadingTools from './ReaderReadingTools';
import './ReaderToolsExperience.css';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  '';

function apiUrl(path) {
  if (!API_BASE) return path;
  return `${API_BASE}${path}`;
}

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function getReaderSession() {
  const bloggadUser = safeParse(localStorage.getItem('bloggad_user'));
  const customerUser = safeParse(localStorage.getItem('customerUser'));
  const generalUser = safeParse(localStorage.getItem('user'));
  const isReaderCapableRole = (userValue) =>
    userValue?.role === 'customer' || userValue?.role === 'affiliate';

  const user = isReaderCapableRole(bloggadUser)
    ? bloggadUser
    : isReaderCapableRole(generalUser)
      ? generalUser
      : isReaderCapableRole(customerUser)
        ? customerUser
        : null;

  if (!user) return null;

  const token =
    localStorage.getItem('bloggad_token') ||
    localStorage.getItem('customerToken') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('supgad_token') ||
    '';

  if (!token) return null;

  return { user, token };
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}

async function publicJson(path) {
  const response = await fetch(apiUrl(path), {
    method: 'GET',
    credentials: 'include',
  });

  const data = await safeJson(response);

  if (!response.ok || data?.ok === false) {
    throw new Error(data?.message || 'Request failed.');
  }

  return data || {};
}

async function readerJson(path, options = {}) {
  const session = getReaderSession();

  if (!session) {
    const error = new Error('Sign in as a Reader to use this action.');
    error.code = 'READER_AUTH_REQUIRED';
    throw error;
  }

  const headers = {
    Authorization: `Bearer ${session.token}`,
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(apiUrl(path), {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await safeJson(response);

  if (!response.ok || data?.ok === false) {
    const error = new Error(data?.message || 'Request failed.');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data || {};
}

function makeRequestKey(writerId, postId) {
  const random =
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

  return `reader-appreciation-${writerId}-${postId}-${random}`;
}

function ActionButton({
  active = false,
  disabled = false,
  children,
  onClick,
  icon: Icon,
  tone = 'default',
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`brt-action-button${active ? ' is-active' : ''} brt-tone-${tone}`}
    >
      {Icon ? (
        <span className="brt-action-icon" aria-hidden="true">
          <Icon size={19} strokeWidth={1.9} />
        </span>
      ) : null}
      <span className="brt-action-label">{children}</span>
    </button>
  );
}
function CommentCard({ comment, onQuote }) {
  const replies = Array.isArray(comment?.replies) ? comment.replies : [];

  function QuoteBlock({ item }) {
    if (!item?.quoted_text) return null;

    return (
      <blockquote className="brt-comment-quote">
        <span>Quoting {item?.quoted_author_name || 'comment'}</span>
        <u>{item.quoted_text}</u>
      </blockquote>
    );
  }

  return (
    <article className="brt-comment-card">
      <div className="brt-comment-author">
        <span className="brt-comment-avatar" aria-hidden="true">
          {String(
            comment?.author?.name ||
            (comment?.author?.role === 'writer' ? 'Writer' : 'Reader')
          ).trim().slice(0, 1).toUpperCase()}
        </span>
        <div>
          <strong>
            {comment?.author?.name ||
              (comment?.author?.role === 'writer' ? 'Writer' : 'Reader')}
          </strong>
          <small>{comment?.author?.role === 'writer' ? 'Writer' : 'Reader'}</small>
        </div>
      </div>

      <QuoteBlock item={comment} />

      <div className="brt-comment-copy">{comment?.body || ''}</div>

      <button
        type="button"
        className="brt-quote-button"
        onClick={() => onQuote?.(comment)}
      >
        Quote
      </button>

      {replies.length ? (
        <div className="brt-comment-replies">
          {replies.map((reply) => (
            <div className="brt-comment-reply" key={reply.id}>
              <div className="brt-comment-author compact">
                <span className="brt-comment-avatar" aria-hidden="true">
                  {String(reply?.author?.name || 'Writer').trim().slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <strong>{reply?.author?.name || 'Writer'}</strong>
                  <small>{reply?.author?.role === 'writer' ? 'Writer reply' : 'Reader reply'}</small>
                </div>
              </div>
              <QuoteBlock item={reply} />
              <div className="brt-comment-copy">{reply?.body || ''}</div>
              <button
                type="button"
                className="brt-quote-button"
                onClick={() => onQuote?.(reply)}
              >
                Quote
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
export default function PublicWriterReaderActions({
  post,
  websiteSlug,
  access,
  templateFields = [],
  onUnlocked,
}) {
  const postId = Number(post?.id || 0);
  const writerId = Number(post?.user_id || 0);
  const readerSession = useMemo(() => getReaderSession(), [postId]);
  const [social, setSocial] = useState(null);
  const [readerState, setReaderState] = useState(null);
  const [saved, setSaved] = useState(false);
  const [membership, setMembership] = useState(null);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [quoteDraft, setQuoteDraft] = useState(null);
  const [appreciationOpen, setAppreciationOpen] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [appreciationSettings, setAppreciationSettings] = useState(null);
  const [credits, setCredits] = useState('1');
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messagingEligibility, setMessagingEligibility] = useState(null);
  const appreciationKeyRef = useRef('');

  useEffect(() => {
    let active = true;

    async function load() {
      if (!postId || !writerId) return;

      try {
        setError('');

        const [publicSocial, publicMembership] = await Promise.all([
          publicJson(`/api/public/social/posts/${postId}`),
          publicJson(`/api/public/access/writers/${writerId}/membership`).catch(() => null),
        ]);

        if (!active) return;

        setSocial(publicSocial);
        setMembership(publicMembership?.membership || null);

        if (!readerSession) return;

        const [stateData, savedData, messagingData] = await Promise.all([
          readerJson(`/api/reader/social/posts/${postId}`),
          readerJson('/api/customer/saved/posts').catch(() => ({ items: [] })),
          readerJson(`/api/customer-affiliate-chats/writer/${writerId}/eligibility`).catch(() => null),
        ]);

        if (!active) return;

        setReaderState(stateData);
        setMessagingEligibility(messagingData?.messaging || null);
        setSaved(
          Array.isArray(savedData?.items) &&
            savedData.items.some((item) => Number(item?.post?.id) === postId)
        );
      } catch (loadError) {
        if (active) {
          setError(loadError.message || 'Failed to load Reader interactions.');
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [postId, writerId, readerSession?.token]);

  function authRequired(errorValue) {
    if (errorValue?.code === 'READER_AUTH_REQUIRED' || errorValue?.status === 401) {
      setNotice('Sign in as a Reader to use this action.');
      return true;
    }

    return false;
  }

  async function toggleFollow() {
    try {
      setBusy('follow');
      setError('');
      setNotice('');

      const data = await readerJson(`/api/reader/social/writers/${writerId}/follow`, {
        method: 'POST',
      });

      setReaderState((prev) => ({
        ...(prev || {}),
        state: {
          ...(prev?.state || {}),
          following: !!data.following,
        },
        counts: {
          ...(prev?.counts || {}),
          followers: Number(data.follower_count || 0),
        },
      }));

      setSocial((prev) => ({
        ...(prev || {}),
        counts: {
          ...(prev?.counts || {}),
          followers: Number(data.follower_count || 0),
        },
      }));
    } catch (actionError) {
      if (!authRequired(actionError)) setError(actionError.message);
    } finally {
      setBusy('');
    }
  }

  async function toggleReaction(type) {
    try {
      setBusy(type);
      setError('');
      setNotice('');

      const data = await readerJson(`/api/reader/social/posts/${postId}/reactions/${type}`, {
        method: 'POST',
      });

      setReaderState((prev) => ({
        ...(prev || {}),
        state: {
          ...(prev?.state || {}),
          ...(type === 'love' ? { loved: !!data.active } : { applauded: !!data.active }),
        },
        counts: {
          ...(prev?.counts || {}),
          love: Number(data?.counts?.love || 0),
          applaud: Number(data?.counts?.applaud || 0),
        },
      }));

      setSocial((prev) => ({
        ...(prev || {}),
        counts: {
          ...(prev?.counts || {}),
          love: Number(data?.counts?.love || 0),
          applaud: Number(data?.counts?.applaud || 0),
        },
      }));
    } catch (actionError) {
      if (!authRequired(actionError)) setError(actionError.message);
    } finally {
      setBusy('');
    }
  }

  async function toggleSave() {
    try {
      setBusy('save');
      setError('');
      setNotice('');

      if (saved) {
        await readerJson(`/api/customer/saved/posts/${postId}`, {
          method: 'DELETE',
        });
        setSaved(false);
      } else {
        await readerJson('/api/customer/saved/posts', {
          method: 'POST',
          body: JSON.stringify({ post_id: postId }),
        });
        setSaved(true);
      }
    } catch (actionError) {
      if (!authRequired(actionError)) setError(actionError.message);
    } finally {
      setBusy('');
    }
  }

  async function sharePost() {
    const url = window.location.href;
    const shareData = {
      title: post?.title || 'Bloggad post',
      text: post?.excerpt || post?.title || 'Read this post on Bloggad.',
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setNotice('Share sheet opened.');
        return;
      }

      await navigator.clipboard.writeText(url);
      setNotice('Post link copied.');
    } catch (shareError) {
      if (shareError?.name !== 'AbortError') {
        setError('Could not share this post.');
      }
    }
  }

  function beginQuote(comment) {
    const sourceBody = String(comment?.body || '');
    if (!comment?.id || !sourceBody) return;

    const maximum = Math.max(1, Math.min(500, Math.ceil(sourceBody.length * 0.2)));
    const selected = String(globalThis.getSelection?.()?.toString() || '').trim();
    const exactSelection = selected && sourceBody.includes(selected)
      ? selected.slice(0, maximum)
      : sourceBody.slice(0, maximum);

    setQuoteDraft({
      commentId: Number(comment.id),
      text: exactSelection,
      author: comment?.author?.name || 'comment',
      maximum,
    });
  }

  async function submitComment(event) {
    event.preventDefault();

    if (!commentText.trim()) return;

    try {
      setBusy('comment');
      setError('');
      setNotice('');

      const data = await readerJson(`/api/reader/social/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          body: commentText.trim(),
          quoted_comment_id: quoteDraft?.commentId || null,
          quoted_text: quoteDraft?.text || null,
        }),
      });

      setCommentText('');
      setQuoteDraft(null);
      setSocial((prev) => ({
        ...(prev || {}),
        comments: data?.comments || [],
        counts: {
          ...(prev?.counts || {}),
          comments: Number(data?.comment_count || 0),
        },
      }));

      setReaderState((prev) => ({
        ...(prev || {}),
        comments: data?.comments || [],
        counts: {
          ...(prev?.counts || {}),
          comments: Number(data?.comment_count || 0),
        },
      }));
    } catch (actionError) {
      if (!authRequired(actionError)) setError(actionError.message);
    } finally {
      setBusy('');
    }
  }

  async function openAppreciation() {
    try {
      setBusy('appreciation-load');
      setError('');
      setNotice('');

      const data = await readerJson('/api/reader/credits');
      setWallet(data?.wallet || null);
      setAppreciationSettings(data?.appreciation_settings || null);

      const minimum = Number(data?.appreciation_settings?.minimum_credits || 1);
      setCredits(String(Math.max(1, minimum)));
      setAppreciationOpen(true);
    } catch (actionError) {
      if (!authRequired(actionError)) setError(actionError.message);
    } finally {
      setBusy('');
    }
  }

  async function submitAppreciation(event) {
    event.preventDefault();

    const creditCount = Number(credits);

    if (!Number.isInteger(creditCount) || creditCount <= 0) {
      setError('Enter a valid whole-number credit amount.');
      return;
    }

    if (!appreciationKeyRef.current) {
      appreciationKeyRef.current = makeRequestKey(writerId, postId);
    }

    try {
      setBusy('appreciate');
      setError('');
      setNotice('');

      const data = await readerJson('/api/reader/credits/appreciate', {
        method: 'POST',
        headers: {
          'Idempotency-Key': appreciationKeyRef.current,
        },
        body: JSON.stringify({
          writer_user_id: writerId,
          post_id: postId,
          credits: creditCount,
          idempotency_key: appreciationKeyRef.current,
        }),
      });

      const nextBalance = data?.appreciation?.reader_available_credits;

      setWallet((prev) =>
        prev
          ? {
              ...prev,
              available_credits:
                nextBalance === undefined ? prev.available_credits : Number(nextBalance),
            }
          : prev
      );

      setNotice(data?.message || 'Writer appreciated.');
      appreciationKeyRef.current = '';
    } catch (actionError) {
      if (!authRequired(actionError)) setError(actionError.message);
    } finally {
      setBusy('');
    }
  }

  async function checkPremiumAccess() {
    try {
      setBusy('unlock');
      setError('');
      setNotice('');

      const data = await readerJson(`/api/reader/access/posts/${postId}`);

      if (data?.entitled) {
        onUnlocked?.(data);
        setNotice('Full Reader access unlocked.');
      } else {
        setNotice('This premium post still requires an active Reader plan or direct Writer membership.');
      }
    } catch (actionError) {
      if (!authRequired(actionError)) setError(actionError.message);
    } finally {
      setBusy('');
    }
  }

  async function submitMessage(event) {
    event.preventDefault();

    if (messagingEligibility?.allowed === false) {
      setError(messagingEligibility.reason || 'This Writer is not accepting this message.');
      return;
    }

    if (!messageText.trim()) return;

    try {
      setBusy('message');
      setError('');
      setNotice('');

      const data = await readerJson('/api/customer-affiliate-chats', {
        method: 'POST',
        body: JSON.stringify({
          website_slug: websiteSlug,
          affiliate_id: writerId,
          chat_type: 'general',
          subject: post?.title ? `Post: ${post.title}` : 'Message to Writer',
          message: messageText.trim(),
        }),
      });

      setMessageText('');
      setNotice(data?.message || 'Message sent.');
    } catch (actionError) {
      if (
        actionError?.status === 409 &&
        actionError?.data?.request_status === 'pending'
      ) {
        setNotice(actionError?.data?.message || 'Your message request is already pending.');
      } else if (!authRequired(actionError)) {
        setError(actionError.message);
      }
    } finally {
      setBusy('');
    }
  }

  const state = readerState?.state || {};
  const counts = readerState?.counts || social?.counts || {};
  const comments = readerState?.comments || social?.comments || [];
  const profilePath = `/${encodeURIComponent(websiteSlug || '')}/writer/${writerId}`;
  const locked = !!access?.locked;
  const membershipAvailable = !!membership?.available && !!membership?.offer;
  const minimumCredits = Number(appreciationSettings?.minimum_credits || 1);
  const maximumCredits =
    appreciationSettings?.maximum_credits === null ||
    appreciationSettings?.maximum_credits === undefined
      ? null
      : Number(appreciationSettings.maximum_credits);

  if (!postId || !writerId) return null;
  return (
    <section className="brt-shell">
      {locked ? (
        <section className="brt-premium-card">
          <div className="brt-premium-copy">
            <span className="brt-kicker blue">Premium reading</span>
            <h3>Continue the full post</h3>
            <p>
              This Writer chose a {Number(access?.preview_percent || 0)}% public preview.
              Reader platform access or an active direct membership with this Writer can unlock the full post.
            </p>
          </div>
          <div className="brt-premium-actions">
            <ActionButton
              disabled={busy === 'unlock'}
              onClick={checkPremiumAccess}
              icon={Sparkles}
            >
              {busy === 'unlock' ? 'Checking...' : 'Check Reader access'}
            </ActionButton>
            <Link to="/reader/premium" className="brt-primary-link">
              Reader Premium
            </Link>
          </div>
        </section>
      ) : null}

      <div className="brt-panel">
        <header className="brt-header">
          <div className="brt-header-copy">
            <span className="brt-kicker">Reader space</span>
            <h2>Reader tools</h2>
            <p>React, save, listen, support the Writer, and join the conversation.</p>
          </div>

          <Link to={profilePath} className="brt-profile-link">
            <UserRound size={17} strokeWidth={1.9} />
            <span>Writer profile</span>
          </Link>
        </header>

        <div className="brt-actions-grid" aria-label="Reader actions">
          <ActionButton
            active={!!state.loved}
            disabled={busy === 'love'}
            onClick={() => toggleReaction('love')}
            icon={Heart}
          >
            Love <b>{Number(counts.love || 0)}</b>
          </ActionButton>

          <ActionButton
            active={!!state.applauded}
            disabled={busy === 'applaud'}
            onClick={() => toggleReaction('applaud')}
            icon={Sparkles}
          >
            Applaud <b>{Number(counts.applaud || 0)}</b>
          </ActionButton>

          <ActionButton
            active={!!state.following}
            disabled={busy === 'follow'}
            onClick={toggleFollow}
            icon={UserPlus}
          >
            {state.following ? 'Following' : 'Follow'} <b>{Number(counts.followers || 0)}</b>
          </ActionButton>

          <ActionButton
            active={saved}
            disabled={busy === 'save'}
            onClick={toggleSave}
            icon={Bookmark}
          >
            {saved ? 'Saved' : 'Save'}
          </ActionButton>

          <ActionButton onClick={sharePost} icon={Share2}>
            Share
          </ActionButton>

          <ActionButton
            disabled={busy === 'appreciation-load'}
            onClick={openAppreciation}
            icon={Gift}
            tone="support"
          >
            Appreciate
          </ActionButton>

          <ActionButton
            disabled={!!readerSession && messagingEligibility?.allowed === false}
            onClick={() => setMessageOpen((value) => !value)}
            icon={MessageCircle}
            tone="message"
          >
            {messagingEligibility?.request_status === 'pending'
              ? 'Message request'
              : 'Message Writer'}
          </ActionButton>
        </div>

        {!readerSession ? (
          <div className="brt-info-banner">
            <span>Reader actions require a Reader account.</span>
            <Link to="/reader/login">Sign in as Reader</Link>
          </div>
        ) : null}

        {readerSession && messagingEligibility?.allowed === false ? (
          <div className="brt-info-banner warning">
            {messagingEligibility.reason || 'Messaging is not currently available for this Writer.'}
          </div>
        ) : null}

        {readerSession && messagingEligibility?.allowed === true ? (
          <div className="brt-info-banner quiet">
            {messagingEligibility.request_status === 'accepted'
              ? 'Your message can go directly to this Writer.'
              : 'Your first message will be sent as a request for the Writer to accept.'}
          </div>
        ) : null}

        {membershipAvailable ? (
          <div className="brt-membership">
            <span>Writer membership</span>
            <strong>
              ${Number(membership.offer.monthly_price_usd || 0).toFixed(2)} / month
            </strong>
            <p>Direct membership is available inside Bloggad Reader membership tools.</p>
          </div>
        ) : null}

        {appreciationOpen ? (
          <form onSubmit={submitAppreciation} className="brt-inline-drawer appreciation">
            <div className="brt-drawer-heading">
              <div>
                <span className="brt-kicker amber">Support the Writer</span>
                <strong>Send Reader credits</strong>
              </div>
              <span className="brt-balance">
                {Number(wallet?.available_credits || 0)} credits available
              </span>
            </div>

            <div className="brt-drawer-fields">
              <input
                type="number"
                min={Math.max(1, minimumCredits)}
                max={maximumCredits || undefined}
                step="1"
                value={credits}
                onChange={(event) => setCredits(event.target.value)}
                aria-label="Reader credits to send"
              />
              <button
                type="submit"
                className="brt-submit amber"
                disabled={busy === 'appreciate'}
              >
                <Gift size={17} />
                {busy === 'appreciate' ? 'Sending...' : 'Send appreciation'}
              </button>
              <Link to="/reader/credits" className="brt-text-link">
                Open credits
              </Link>
            </div>
          </form>
        ) : null}

        {messageOpen ? (
          <form onSubmit={submitMessage} className="brt-inline-drawer message">
            <div className="brt-drawer-heading">
              <div>
                <span className="brt-kicker blue">Private message</span>
                <strong>Message this Writer</strong>
              </div>
            </div>

            <textarea
              rows={4}
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              placeholder="Write your message..."
            />

            <div className="brt-drawer-fields">
              <button
                type="submit"
                className="brt-submit blue"
                disabled={busy === 'message' || !messageText.trim()}
              >
                <Send size={17} />
                {busy === 'message' ? 'Sending...' : 'Send message'}
              </button>
              <Link to="/reader/messages" className="brt-text-link">
                Open messages
              </Link>
            </div>
          </form>
        ) : null}

        {notice ? <div className="brt-feedback success">{notice}</div> : null}
        {error ? <div className="brt-feedback error">{error}</div> : null}

        <div className="brt-content-grid">
          <section className="brt-reading-card">
            <ReaderReadingTools
              post={post}
              templateFields={templateFields}
              locked={locked}
            />
          </section>

          <section className="brt-comments-card">
            <div className="brt-comments-head">
              <div>
                <span className="brt-kicker">Conversation</span>
                <h3>Comments</h3>
              </div>
              <span className="brt-count-pill">{Number(counts.comments || 0)}</span>
            </div>

            {readerSession ? (
              <form onSubmit={submitComment} className="brt-comment-form">
                {quoteDraft ? (
                  <div className="brt-quote-draft">
                    <span>
                      Quote from {quoteDraft.author} - max {quoteDraft.maximum} characters
                    </span>
                    <u>{quoteDraft.text}</u>
                    <button type="button" onClick={() => setQuoteDraft(null)}>
                      Remove quote
                    </button>
                  </div>
                ) : null}

                <textarea
                  rows={3}
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Join the conversation..."
                />

                <button
                  type="submit"
                  className="brt-comment-submit"
                  disabled={busy === 'comment' || !commentText.trim()}
                >
                  <Send size={16} />
                  {busy === 'comment' ? 'Posting...' : 'Post comment'}
                </button>
              </form>
            ) : null}

            <div className="brt-comment-list">
              {comments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} onQuote={beginQuote} />
              ))}
              {!comments.length ? (
                <div className="brt-empty-comments">
                  <MessageCircle size={22} strokeWidth={1.7} />
                  <span>No comments yet.</span>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}