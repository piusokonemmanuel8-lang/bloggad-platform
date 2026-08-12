import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ReaderReadingTools from './ReaderReadingTools';

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
  const customerUser = safeParse(localStorage.getItem('customerUser'));
  const generalUser = safeParse(localStorage.getItem('user'));
  const user =
    customerUser?.role === 'customer'
      ? customerUser
      : generalUser?.role === 'customer'
      ? generalUser
      : null;

  if (!user) return null;

  const token =
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

function ActionButton({ active = false, disabled = false, children, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        minHeight: 42,
        borderRadius: 999,
        border: active ? '1px solid #111827' : '1px solid #dbe3ee',
        background: active ? '#111827' : '#ffffff',
        color: active ? '#ffffff' : '#111827',
        padding: '0 15px',
        fontWeight: 800,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.58 : 1,
      }}
    >
      {children}
    </button>
  );
}

function CommentCard({ comment, onQuote }) {
  const replies = Array.isArray(comment?.replies) ? comment.replies : [];

  function QuoteBlock({ item }) {
    if (!item?.quoted_text) return null;

    return (
      <blockquote
        style={{
          margin: '8px 0 0',
          padding: '8px 10px',
          borderLeft: '3px solid #94a3b8',
          background: '#f8fafc',
          color: '#475569',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800 }}>
          Quoting {item?.quoted_author_name || 'comment'}
        </div>
        <u style={{ display: 'block', marginTop: 3, textDecorationThickness: 1 }}>
          {item.quoted_text}
        </u>
      </blockquote>
    );
  }

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 16,
        padding: 14,
        background: '#ffffff',
      }}
    >
      <div style={{ fontWeight: 800, color: '#111827' }}>
        {comment?.author?.name || (comment?.author?.role === 'writer' ? 'Writer' : 'Reader')}
      </div>
      <QuoteBlock item={comment} />
      <div style={{ marginTop: 6, color: '#334155', whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>
        {comment?.body || ''}
      </div>
      <button
        type="button"
        onClick={() => onQuote?.(comment)}
        style={{
          marginTop: 8,
          border: 0,
          background: 'transparent',
          padding: 0,
          color: '#1d4ed8',
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        Quote
      </button>

      {replies.length ? (
        <div style={{ marginTop: 12, display: 'grid', gap: 8, paddingLeft: 16 }}>
          {replies.map((reply) => (
            <div
              key={reply.id}
              style={{
                borderLeft: '3px solid #dbeafe',
                padding: '8px 0 8px 12px',
              }}
            >
              <div style={{ fontWeight: 800, color: '#1d4ed8' }}>
                {reply?.author?.name || 'Writer'}
              </div>
              <QuoteBlock item={reply} />
              <div style={{ marginTop: 4, color: '#475569', whiteSpace: 'pre-wrap' }}>
                {reply?.body || ''}
              </div>
              <button
                type="button"
                onClick={() => onQuote?.(reply)}
                style={{
                  marginTop: 6,
                  border: 0,
                  background: 'transparent',
                  padding: 0,
                  color: '#1d4ed8',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Quote
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
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
    <section
      style={{
        maxWidth: 1180,
        margin: '24px auto 40px',
        padding: '0 18px',
      }}
    >
      {locked ? (
        <div
          style={{
            border: '1px solid #bfdbfe',
            background: '#eff6ff',
            borderRadius: 22,
            padding: 20,
            marginBottom: 18,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.08em', color: '#1d4ed8' }}>
            PREMIUM READING
          </div>
          <h2 style={{ margin: '8px 0 6px', color: '#0f172a' }}>Continue the full post</h2>
          <p style={{ margin: 0, color: '#475569', lineHeight: 1.65 }}>
            This Writer chose a {Number(access?.preview_percent || 0)}% public preview.
            Reader platform access or an active direct membership with this Writer can unlock the full post.
          </p>
          <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <ActionButton disabled={busy === 'unlock'} onClick={checkPremiumAccess}>
              {busy === 'unlock' ? 'Checking...' : 'Check my Reader access'}
            </ActionButton>
            <Link
              to="/reader/premium"
              style={{
                minHeight: 42,
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: 999,
                padding: '0 15px',
                background: '#2563eb',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 800,
              }}
            >
              Reader Premium
            </Link>
          </div>
        </div>
      ) : null}

      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: 24,
          background: '#f8fafc',
          padding: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.08em', color: '#64748b' }}>
              READER ACTIONS
            </div>
            <h2 style={{ margin: '6px 0 0', color: '#0f172a' }}>Read, respond, and support the Writer</h2>
          </div>

          <Link
            to={profilePath}
            style={{
              color: '#1d4ed8',
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            View Writer profile
          </Link>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 9, flexWrap: 'wrap' }}>
          <ActionButton
            active={!!state.loved}
            disabled={busy === 'love'}
            onClick={() => toggleReaction('love')}
          >
            Love {Number(counts.love || 0)}
          </ActionButton>
          <ActionButton
            active={!!state.applauded}
            disabled={busy === 'applaud'}
            onClick={() => toggleReaction('applaud')}
          >
            Applaud {Number(counts.applaud || 0)}
          </ActionButton>
          <ActionButton
            active={!!state.following}
            disabled={busy === 'follow'}
            onClick={toggleFollow}
          >
            {state.following ? 'Following' : 'Follow'} {Number(counts.followers || 0)}
          </ActionButton>
          <ActionButton active={saved} disabled={busy === 'save'} onClick={toggleSave}>
            {saved ? 'Saved' : 'Save'}
          </ActionButton>
          <ActionButton onClick={sharePost}>Share</ActionButton>
          <ActionButton disabled={busy === 'appreciation-load'} onClick={openAppreciation}>
            Appreciate Writer
          </ActionButton>
          <ActionButton
            disabled={!!readerSession && messagingEligibility?.allowed === false}
            onClick={() => setMessageOpen((value) => !value)}
          >
            {messagingEligibility?.request_status === 'pending'
              ? 'Send message request'
              : 'Message Writer'}
          </ActionButton>
        </div>

        {!readerSession ? (
          <div style={{ marginTop: 14, color: '#64748b', fontSize: 14 }}>
            Reader actions require a Reader account.{' '}
            <Link to="/reader/login" style={{ color: '#1d4ed8', fontWeight: 800 }}>
              Sign in as Reader
            </Link>
          </div>
        ) : null}

        {readerSession && messagingEligibility?.allowed === false ? (
          <div style={{ marginTop: 14, color: '#92400e', fontSize: 14, fontWeight: 700 }}>
            {messagingEligibility.reason || 'Messaging is not currently available for this Writer.'}
          </div>
        ) : null}

        {readerSession && messagingEligibility?.allowed === true ? (
          <div style={{ marginTop: 14, color: '#475569', fontSize: 13 }}>
            {messagingEligibility.request_status === 'accepted'
              ? 'Your message can go directly to this Writer.'
              : 'Your first message will be sent as a request for the Writer to accept.'}
          </div>
        ) : null}

        {membershipAvailable ? (
          <div
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 16,
              border: '1px solid #ddd6fe',
              background: '#f5f3ff',
              color: '#4c1d95',
            }}
          >
            Direct Writer membership is available at $
            {Number(membership.offer.monthly_price_usd || 0).toFixed(2)} / month.
            Membership activation remains inside Bloggad Reader membership tools.
          </div>
        ) : null}

        {appreciationOpen ? (
          <form
            onSubmit={submitAppreciation}
            style={{
              marginTop: 16,
              padding: 16,
              border: '1px solid #fde68a',
              borderRadius: 18,
              background: '#fffbeb',
              display: 'grid',
              gap: 10,
            }}
          >
            <strong style={{ color: '#92400e' }}>Appreciate the Writer with Reader credits</strong>
            <div style={{ color: '#78716c', fontSize: 14 }}>
              Available credits: {Number(wallet?.available_credits || 0)}
            </div>
            <input
              type="number"
              min={Math.max(1, minimumCredits)}
              max={maximumCredits || undefined}
              step="1"
              value={credits}
              onChange={(event) => setCredits(event.target.value)}
              style={{
                minHeight: 44,
                borderRadius: 12,
                border: '1px solid #d6d3d1',
                padding: '0 12px',
                maxWidth: 220,
              }}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="submit"
                disabled={busy === 'appreciate'}
                style={{
                  minHeight: 42,
                  border: 0,
                  borderRadius: 999,
                  background: '#92400e',
                  color: '#ffffff',
                  padding: '0 15px',
                  fontWeight: 800,
                  cursor: busy === 'appreciate' ? 'not-allowed' : 'pointer',
                  opacity: busy === 'appreciate' ? 0.6 : 1,
                }}
              >
                {busy === 'appreciate' ? 'Sending...' : 'Send appreciation'}
              </button>
              <Link to="/reader/credits" style={{ alignSelf: 'center', color: '#92400e', fontWeight: 800 }}>
                Open Reader credits
              </Link>
            </div>
          </form>
        ) : null}

        {messageOpen ? (
          <form
            onSubmit={submitMessage}
            style={{
              marginTop: 16,
              padding: 16,
              border: '1px solid #dbeafe',
              borderRadius: 18,
              background: '#eff6ff',
              display: 'grid',
              gap: 10,
            }}
          >
            <strong style={{ color: '#1e3a8a' }}>Message this Writer</strong>
            <textarea
              rows={4}
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              placeholder="Write your first message..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                border: '1px solid #bfdbfe',
                borderRadius: 12,
                padding: 12,
                resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="submit"
                disabled={busy === 'message' || !messageText.trim()}
                style={{
                  minHeight: 42,
                  border: 0,
                  borderRadius: 999,
                  background: '#2563eb',
                  color: '#ffffff',
                  padding: '0 15px',
                  fontWeight: 800,
                  cursor: busy === 'message' ? 'not-allowed' : 'pointer',
                  opacity: busy === 'message' ? 0.6 : 1,
                }}
              >
                {busy === 'message' ? 'Sending...' : 'Send message'}
              </button>
              <Link to="/reader/messages" style={{ alignSelf: 'center', color: '#1d4ed8', fontWeight: 800 }}>
                Open Reader messages
              </Link>
            </div>
          </form>
        ) : null}

        {notice ? (
          <div style={{ marginTop: 14, color: '#166534', fontWeight: 700 }}>
            {notice}
          </div>
        ) : null}

        {error ? (
          <div style={{ marginTop: 14, color: '#b91c1c', fontWeight: 700 }}>
            {error}
          </div>
        ) : null}

        <ReaderReadingTools
          post={post}
          templateFields={templateFields}
          locked={locked}
        />

        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: 0, color: '#0f172a' }}>
            Comments ({Number(counts.comments || 0)})
          </h3>

          {readerSession ? (
            <form onSubmit={submitComment} style={{ marginTop: 12, display: 'grid', gap: 9 }}>
              {quoteDraft ? (
                <div
                  style={{
                    borderLeft: '3px solid #94a3b8',
                    background: '#f8fafc',
                    padding: '9px 11px',
                    color: '#475569',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 800 }}>
                    Quote from {quoteDraft.author} - max {quoteDraft.maximum} characters
                  </div>
                  <u style={{ display: 'block', marginTop: 4 }}>{quoteDraft.text}</u>
                  <button
                    type="button"
                    onClick={() => setQuoteDraft(null)}
                    style={{
                      marginTop: 6,
                      border: 0,
                      background: 'transparent',
                      padding: 0,
                      color: '#b91c1c',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Remove quote
                  </button>
                </div>
              ) : null}
              <textarea
                rows={3}
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Add a Reader comment..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  border: '1px solid #cbd5e1',
                  borderRadius: 14,
                  padding: 12,
                  resize: 'vertical',
                  background: '#ffffff',
                }}
              />
              <button
                type="submit"
                disabled={busy === 'comment' || !commentText.trim()}
                style={{
                  justifySelf: 'start',
                  minHeight: 40,
                  border: 0,
                  borderRadius: 999,
                  padding: '0 15px',
                  background: '#111827',
                  color: '#ffffff',
                  fontWeight: 800,
                  cursor: busy === 'comment' ? 'not-allowed' : 'pointer',
                }}
              >
                {busy === 'comment' ? 'Posting...' : 'Post comment'}
              </button>
            </form>
          ) : null}

          <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
            {comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} onQuote={beginQuote} />
            ))}
            {!comments.length ? (
              <div style={{ color: '#64748b' }}>No comments yet.</div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}