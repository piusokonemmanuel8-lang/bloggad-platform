import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

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
  } catch {
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

  return token ? { user, token } : null;
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function requestJson(path, options = {}, requireReader = false) {
  const session = getReaderSession();

  if (requireReader && !session) {
    const error = new Error('Sign in as a Reader to use this action.');
    error.status = 401;
    throw error;
  }

  const response = await fetch(apiUrl(path), {
    ...options,
    credentials: 'include',
    headers: {
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await safeJson(response);

  if (!response.ok || data?.ok === false) {
    const error = new Error(data?.message || 'Request failed.');
    error.status = response.status;
    throw error;
  }

  return data || {};
}

function stripMarkup(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function readableField(field) {
  const type = String(field?.field_type || 'text').toLowerCase();
  const raw = String(field?.field_value || '').trim();

  if (!raw || ['image', 'divider'].includes(type)) return '';

  if (type === 'url') {
    try {
      const parsed = JSON.parse(raw);
      return stripMarkup(parsed?.label || '');
    } catch {
      return '';
    }
  }

  return stripMarkup(raw);
}

const READING_WORDS_PER_MINUTE = 225;

function buildVisibleSpeechText(post, templateFields) {
  return [
    stripMarkup(post?.title),
    stripMarkup(post?.excerpt),
    ...(Array.isArray(templateFields) ? templateFields.map(readableField) : []),
  ]
    .filter(Boolean)
    .join('. ')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateApproximateReadMinutes(text) {
  const words = String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / READING_WORDS_PER_MINUTE));
}

function ToolButton({ active = false, disabled = false, onClick, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        minHeight: 38,
        borderRadius: 999,
        border: active ? '1px solid #111827' : '1px solid #cbd5e1',
        background: active ? '#111827' : '#fff',
        color: active ? '#fff' : '#0f172a',
        padding: '0 13px',
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {children}
    </button>
  );
}

export default function ReaderReadingTools({
  post,
  templateFields = [],
  locked = false,
}) {
  const postId = Number(post?.id || 0);
  const readerSession = useMemo(() => getReaderSession(), [postId]);
  const [readingState, setReadingState] = useState(null);
  const [manifest, setManifest] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDetails, setReportDetails] = useState('');
  const [busy, setBusy] = useState('');
  const [rate, setRate] = useState(1);
  const [speechState, setSpeechState] = useState('idle');
  const [speechIndex, setSpeechIndex] = useState(0);
  const [audioSrc, setAudioSrc] = useState('');
  const utteranceRef = useRef(null);
  const audioRef = useRef(null);

  const speechText = useMemo(
    () => buildVisibleSpeechText(post, templateFields),
    [post?.id, post?.title, post?.excerpt, templateFields]
  );

  const readMinutes = useMemo(
    () => calculateApproximateReadMinutes(speechText),
    [speechText]
  );

  useEffect(() => {
    let active = true;

    async function load() {
      if (!postId) return;

      try {
        const publicManifest = await requestJson(
          `/api/public/reading/posts/${postId}/listen`
        ).catch(() => null);

        if (!active) return;
        setManifest(publicManifest || null);

        if (readerSession) {
          const state = await requestJson(
            `/api/reader/reading/posts/${postId}/state`,
            {},
            true
          );

          if (active) setReadingState(state || null);
        }
      } catch (loadError) {
        if (active) setError(loadError.message || 'Failed to load reading tools.');
      }
    }

    load();

    return () => {
      active = false;
      if (globalThis.speechSynthesis) globalThis.speechSynthesis.cancel();
    };
  }, [postId, readerSession?.token]);

  useEffect(() => {
    const saved = Number(localStorage.getItem(`bloggad-listen-${postId}`) || 0);
    if (Number.isFinite(saved) && saved > 0) setSpeechIndex(saved);
  }, [postId]);

  function requireReader() {
    if (readerSession) return true;
    setNotice('Sign in as a Reader to use this reading control.');
    return false;
  }

  async function reloadState() {
    if (!readerSession || !postId) return;

    const state = await requestJson(
      `/api/reader/reading/posts/${postId}/state`,
      {},
      true
    );
    setReadingState(state || null);
  }

  async function togglePublication() {
    if (!requireReader()) return;

    try {
      setBusy('publication');
      setError('');
      setNotice('');
      const websiteId = Number(readingState?.publication?.id || 0);
      if (!websiteId) throw new Error('Publication information is not available.');

      const data = await requestJson(
        `/api/reader/reading/publications/${websiteId}/follow`,
        { method: 'POST' },
        true
      );

      setReadingState((current) => ({
        ...(current || {}),
        publication: {
          ...(current?.publication || {}),
          following: !!data.following,
        },
      }));
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusy('');
    }
  }

  async function toggleMute(targetType, targetId) {
    if (!requireReader()) return;

    try {
      setBusy(`mute-${targetType}-${targetId}`);
      setError('');
      setNotice('');

      await requestJson(
        `/api/reader/reading/mutes/${targetType}/${targetId}`,
        { method: 'POST' },
        true
      );

      await reloadState();
      setNotice('Reading preference updated.');
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusy('');
    }
  }

  async function saveHighlight() {
    if (!requireReader()) return;

    const selected = String(globalThis.getSelection?.()?.toString() || '').trim();

    if (!selected) {
      setNotice('Select text in the story first, then choose Highlight.');
      return;
    }

    try {
      setBusy('highlight');
      setError('');
      setNotice('');

      await requestJson(
        `/api/reader/reading/posts/${postId}/highlights`,
        {
          method: 'POST',
          body: JSON.stringify({ selected_text: selected }),
        },
        true
      );

      await reloadState();
      setNotice('Highlight saved.');
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusy('');
    }
  }

  async function submitReport(event) {
    event.preventDefault();
    if (!requireReader()) return;

    try {
      setBusy('report');
      setError('');
      setNotice('');

      const data = await requestJson(
        `/api/reader/reading/posts/${postId}/report`,
        {
          method: 'POST',
          body: JSON.stringify({
            reason: reportReason,
            details: reportDetails.trim(),
          }),
        },
        true
      );

      setReadingState((current) => ({
        ...(current || {}),
        report: data?.report || current?.report || null,
      }));
      setReportOpen(false);
      setNotice('Story report submitted for review.');
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusy('');
    }
  }

  function startBrowserSpeech(fromIndex = speechIndex) {
    if (!globalThis.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') {
      setError('Browser Listen is not supported by this browser.');
      return;
    }

    if (!speechText) {
      setError('No readable text is available on this page yet.');
      return;
    }

    globalThis.speechSynthesis.cancel();

    const safeStart = Math.max(0, Math.min(Number(fromIndex || 0), speechText.length - 1));
    const utterance = new SpeechSynthesisUtterance(speechText.slice(safeStart));
    utterance.rate = Number(rate || 1);

    utterance.onboundary = (event) => {
      if (typeof event.charIndex !== 'number') return;
      const nextIndex = safeStart + event.charIndex;
      setSpeechIndex(nextIndex);
      localStorage.setItem(`bloggad-listen-${postId}`, String(nextIndex));
    };

    utterance.onend = () => {
      setSpeechState('idle');
      setSpeechIndex(0);
      localStorage.removeItem(`bloggad-listen-${postId}`);
    };

    utterance.onerror = () => {
      setSpeechState('idle');
    };

    utteranceRef.current = utterance;
    setSpeechState('playing');
    globalThis.speechSynthesis.speak(utterance);
  }

  function toggleBrowserSpeech() {
    if (!globalThis.speechSynthesis) {
      setError('Browser Listen is not supported by this browser.');
      return;
    }

    if (speechState === 'playing') {
      globalThis.speechSynthesis.pause();
      setSpeechState('paused');
      return;
    }

    if (speechState === 'paused') {
      globalThis.speechSynthesis.resume();
      setSpeechState('playing');
      return;
    }

    startBrowserSpeech();
  }

  function restartAtNewRate(nextRate) {
    setRate(nextRate);

    if (speechState === 'playing' || speechState === 'paused') {
      setTimeout(() => startBrowserSpeech(speechIndex), 0);
    }
  }

  async function loadProtectedAudio(streamUrl) {
    const session = getReaderSession();
    if (!session || !streamUrl) return;

    const response = await fetch(apiUrl(streamUrl), {
      method: 'GET',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });

    if (!response.ok) {
      const data = await safeJson(response);
      throw new Error(data?.message || 'Failed to load protected audio.');
    }

    const blob = await response.blob();
    const nextUrl = URL.createObjectURL(blob);

    setAudioSrc((current) => {
      if (current?.startsWith('blob:')) URL.revokeObjectURL(current);
      return nextUrl;
    });
  }

  async function generateNeural(provider) {
    if (!requireReader()) return;

    try {
      setBusy(`tts-${provider}`);
      setError('');
      setNotice('');

      const data = await requestJson(
        `/api/reader/reading/posts/${postId}/listen/generate`,
        {
          method: 'POST',
          body: JSON.stringify({
            provider,
            voice: 'default',
          }),
        },
        true
      );

      if (data?.audio?.stream_url) {
        await loadProtectedAudio(data.audio.stream_url);
        setNotice(data.message || 'Audio is ready.');
      }
    } catch (actionError) {
      setError(`${actionError.message} Browser Listen remains available.`);
    } finally {
      setBusy('');
    }
  }

  const publication = readingState?.publication || null;
  const topics = Array.isArray(readingState?.topics) ? readingState.topics : [];
  const muted = readingState?.muted || {};
  const highlightCount = Array.isArray(readingState?.highlights)
    ? readingState.highlights.length
    : 0;
  const providers = manifest?.providers || { browser: true };

  return (
    <div
      style={{
        marginTop: 18,
        paddingTop: 16,
        borderTop: '1px solid #e2e8f0',
      }}
    >
      <div
        style={{
          marginBottom: 10,
          color: '#64748b',
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        Approx. {readMinutes} min read
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <ToolButton onClick={toggleBrowserSpeech}>
          {speechState === 'playing'
            ? 'Pause Listen'
            : speechState === 'paused'
            ? 'Resume Listen'
            : speechIndex > 0
            ? 'Resume Listen'
            : 'Listen'}
        </ToolButton>

        <select
          value={rate}
          onChange={(event) => restartAtNewRate(Number(event.target.value))}
          aria-label="Listen speed"
          style={{ minHeight: 38, borderRadius: 999, border: '1px solid #cbd5e1', padding: '0 10px' }}
        >
          {[0.75, 1, 1.25, 1.5, 2].map((value) => (
            <option key={value} value={value}>{value}x</option>
          ))}
        </select>

        <ToolButton disabled={busy === 'highlight'} onClick={saveHighlight}>
          Highlight{highlightCount ? ` (${highlightCount})` : ''}
        </ToolButton>

        {publication ? (
          <ToolButton
            active={!!publication.following}
            disabled={busy === 'publication'}
            onClick={togglePublication}
          >
            {publication.following ? 'Following Publication' : 'Follow Publication'}
          </ToolButton>
        ) : null}

        <ToolButton onClick={() => setMoreOpen((value) => !value)}>
          {moreOpen ? 'Close Reading Controls' : 'More Reading Controls'}
        </ToolButton>
      </div>

      {speechText ? (
        <div style={{ marginTop: 8, color: '#64748b', fontSize: 12 }}>
          Browser Listen progress: {Math.min(100, Math.round((speechIndex / Math.max(1, speechText.length)) * 100))}%
          {locked ? ' | Current public preview only until Reader access is unlocked.' : ''}
        </div>
      ) : null}

      {audioSrc ? (
        <div style={{ marginTop: 12 }}>
          <audio
            ref={audioRef}
            controls
            src={audioSrc}
            style={{ width: '100%', maxWidth: 560 }}
          />
        </div>
      ) : null}

      {(providers.external || providers.self_hosted) && readerSession ? (
        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {providers.external ? (
            <ToolButton
              disabled={busy === 'tts-external'}
              onClick={() => generateNeural('external')}
            >
              {busy === 'tts-external' ? 'Preparing...' : 'Neural Listen'}
            </ToolButton>
          ) : null}
          {providers.self_hosted ? (
            <ToolButton
              disabled={busy === 'tts-self_hosted'}
              onClick={() => generateNeural('self_hosted')}
            >
              {busy === 'tts-self_hosted' ? 'Preparing...' : 'Self-hosted Listen'}
            </ToolButton>
          ) : null}
        </div>
      ) : null}

      {moreOpen ? (
        <div
          style={{
            marginTop: 12,
            border: '1px solid #dbe3ee',
            borderRadius: 16,
            background: '#fff',
            padding: 14,
            display: 'grid',
            gap: 10,
          }}
        >
          {!readerSession ? (
            <div style={{ color: '#64748b' }}>
              Sign in as a Reader to follow publications, save highlights, mute content, or report a story.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {readingState?.post?.writer_user_id ? (
                  <ToolButton
                    active={!!muted.writer}
                    onClick={() => toggleMute('writer', readingState.post.writer_user_id)}
                  >
                    {muted.writer ? 'Unmute Writer' : 'Mute Writer'}
                  </ToolButton>
                ) : null}

                {publication?.id ? (
                  <ToolButton
                    active={!!muted.publication}
                    onClick={() => toggleMute('publication', publication.id)}
                  >
                    {muted.publication ? 'Unmute Publication' : 'Mute Publication'}
                  </ToolButton>
                ) : null}

                {topics.map((topic) => {
                  const topicMuted = Array.isArray(muted.topic_ids)
                    && muted.topic_ids.includes(Number(topic.id));

                  return (
                    <ToolButton
                      key={topic.id}
                      active={topicMuted}
                      onClick={() => toggleMute('topic', topic.id)}
                    >
                      {topicMuted ? `Unmute ${topic.name}` : `Mute ${topic.name}`}
                    </ToolButton>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <ToolButton onClick={() => setReportOpen((value) => !value)}>
                  Report Story
                </ToolButton>
                <Link to="/reader/reading-controls" style={{ color: '#1d4ed8', fontWeight: 700 }}>
                  Manage highlights and reading controls
                </Link>
              </div>
            </>
          )}
        </div>
      ) : null}

      {reportOpen && readerSession ? (
        <form
          onSubmit={submitReport}
          style={{
            marginTop: 12,
            border: '1px solid #fecaca',
            background: '#fff7f7',
            borderRadius: 16,
            padding: 14,
            display: 'grid',
            gap: 10,
          }}
        >
          <strong>Report this story</strong>
          <select
            value={reportReason}
            onChange={(event) => setReportReason(event.target.value)}
          >
            <option value="spam">Spam</option>
            <option value="harassment">Harassment</option>
            <option value="hate_or_abuse">Hate or abuse</option>
            <option value="misinformation">Misinformation</option>
            <option value="copyright">Copyright</option>
            <option value="adult_or_unsafe">Adult or unsafe content</option>
            <option value="other">Other</option>
          </select>
          <textarea
            rows={3}
            value={reportDetails}
            onChange={(event) => setReportDetails(event.target.value)}
            placeholder="Optional details for the moderation team"
          />
          <button type="submit" disabled={busy === 'report'}>
            {busy === 'report' ? 'Submitting...' : 'Submit report'}
          </button>
          {readingState?.report ? (
            <div style={{ color: '#64748b', fontSize: 13 }}>
              Existing report status: {readingState.report.status}
            </div>
          ) : null}
        </form>
      ) : null}

      {notice ? <div style={{ marginTop: 10, color: '#166534', fontWeight: 700 }}>{notice}</div> : null}
      {error ? <div style={{ marginTop: 10, color: '#b91c1c', fontWeight: 700 }}>{error}</div> : null}
    </div>
  );
}