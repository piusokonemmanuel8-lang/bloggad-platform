import { ConversationSafetyControls } from '../../components/writerReader/WriterReaderChatControls';
import { useEffect, useMemo, useState } from 'react';
import ReaderUnifiedShell from '../../components/reader/ReaderUnifiedShell';
import './CustomerMessagesApproved.css';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  '';

function getApiUrl(path) {
  if (!API_BASE) return path;
  return `${API_BASE}${path}`;
}

function getStoredToken() {
  return (
    localStorage.getItem('customerToken') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('token') ||
    ''
  );
}

function getStoredLoginContext() {
  try {
    const raw = localStorage.getItem('customerLoginContext') || '';
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function ChatListCard({ title, subtitle, meta, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        borderRadius: 18,
        border: active ? '1px solid #111827' : '1px solid #e5e7eb',
        background: active ? '#111827' : '#ffffff',
        color: active ? '#ffffff' : '#111827',
        padding: 16,
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: '0 10px 25px rgba(15, 23, 42, 0.04)',
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 800,
          wordBreak: 'break-word',
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: 14,
          color: active ? 'rgba(255,255,255,0.72)' : '#6b7280',
          wordBreak: 'break-word',
        }}
      >
        {subtitle}
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: active ? 'rgba(255,255,255,0.55)' : '#94a3b8',
          fontWeight: 800,
        }}
      >
        {meta}
      </div>
    </button>
  );
}

export default function CustomerMessagesPage() {
  const token = useMemo(() => getStoredToken(), []);
  const loginContext = useMemo(() => getStoredLoginContext(), []);

  const [affiliateChats, setAffiliateChats] = useState([]);
  const [adminChats, setAdminChats] = useState([]);
  const [selectedType, setSelectedType] = useState('affiliate');
  const [selectedId, setSelectedId] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loadingLists, setLoadingLists] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [startingAdminChat, setStartingAdminChat] = useState(false);
  const [startingAffiliateChat, setStartingAffiliateChat] = useState(false);
  const [error, setError] = useState('');
  const [composerPanel, setComposerPanel] = useState('');
  const [controlsOpen, setControlsOpen] = useState(false);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);

  const [adminForm, setAdminForm] = useState({
    subject: '',
    message: '',
  });

  const [affiliateForm, setAffiliateForm] = useState({
    subject: '',
    message: '',
    chat_type: 'support',
  });

  async function fetchChatLists(active = true) {
    const [affiliateRes, adminRes] = await Promise.all([
      fetch(getApiUrl('/api/customer-affiliate-chats'), {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      }),
      fetch(getApiUrl('/api/customer-admin-chats'), {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      }),
    ]);

    const affiliateData = await safeJson(affiliateRes);
    const adminData = await safeJson(adminRes);

    if (!affiliateRes.ok || !affiliateData?.ok) {
      throw new Error(affiliateData?.message || 'Failed to fetch Writer chats.');
    }

    if (!adminRes.ok || !adminData?.ok) {
      throw new Error(adminData?.message || 'Failed to fetch admin chats.');
    }

    if (!active) return null;

    const nextAffiliateChats = Array.isArray(affiliateData.chats) ? affiliateData.chats : [];
    const nextAdminChats = Array.isArray(adminData.chats) ? adminData.chats : [];

    setAffiliateChats(nextAffiliateChats);
    setAdminChats(nextAdminChats);

    return {
      nextAffiliateChats,
      nextAdminChats,
    };
  }

  useEffect(() => {
    if (!token) return;

    let active = true;

    async function loadLists() {
      setLoadingLists(true);
      setError('');

      try {
        const result = await fetchChatLists(active);
        if (!result || !active) return;

        const { nextAffiliateChats, nextAdminChats } = result;

        if (nextAffiliateChats.length > 0) {
          setSelectedType('affiliate');
          setSelectedId(nextAffiliateChats[0].id);
        } else if (nextAdminChats.length > 0) {
          setSelectedType('admin');
          setSelectedId(nextAdminChats[0].id);
        } else {
          setSelectedId(null);
          setSelectedChat(null);
          setMessages([]);
        }
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to fetch messages.');
      } finally {
        if (active) setLoadingLists(false);
      }
    }

    loadLists();

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!selectedId || !token) return;

    let active = true;

    async function fetchChat() {
      setLoadingChat(true);
      setError('');

      try {
        const endpoint =
          selectedType === 'affiliate'
            ? `/api/customer-affiliate-chats/${selectedId}`
            : `/api/customer-admin-chats/${selectedId}`;

        const response = await fetch(getApiUrl(endpoint), {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });

        const data = await safeJson(response);

        if (!response.ok || !data?.ok) {
          throw new Error(data?.message || 'Failed to fetch chat details.');
        }

        if (!active) return;

        setSelectedChat(data.chat || null);
        setMessages(Array.isArray(data.messages) ? data.messages : []);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to fetch chat details.');
      } finally {
        if (active) setLoadingChat(false);
      }
    }

    fetchChat();

    return () => {
      active = false;
    };
  }, [selectedId, selectedType, token]);

  async function handleStartAdminChat(event) {
    event.preventDefault();

    if (!adminForm.message.trim()) {
      setError('Admin first message is required.');
      return;
    }

    try {
      setStartingAdminChat(true);
      setError('');

      const response = await fetch(getApiUrl('/api/customer-admin-chats'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          subject: adminForm.subject.trim() || undefined,
          message: adminForm.message.trim(),
        }),
      });

      const data = await safeJson(response);

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || 'Failed to start admin chat.');
      }

      setAdminForm({
        subject: '',
        message: '',
      });

      const nextChatId = data?.chat?.id || null;

      await fetchChatLists(true);
      setSelectedType('admin');
      setSelectedId(nextChatId);
    } catch (err) {
      setError(err.message || 'Failed to start admin chat.');
    } finally {
      setStartingAdminChat(false);
    }
  }

  async function handleStartAffiliateChat(event) {
    event.preventDefault();

    if (!affiliateForm.message.trim()) {
      setError('Writer first message is required.');
      return;
    }

    const websiteId = loginContext?.website_id || null;
    const websiteSlug = loginContext?.website_slug || '';
    const affiliateId = loginContext?.affiliate_id || null;

    if (!websiteId && !websiteSlug) {
      setError('Writer chat must start from a storefront context.');
      return;
    }

    try {
      setStartingAffiliateChat(true);
      setError('');

      const response = await fetch(getApiUrl('/api/customer-affiliate-chats'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          website_id: websiteId || undefined,
          website_slug: websiteSlug || undefined,
          affiliate_id: affiliateId || undefined,
          subject: affiliateForm.subject.trim() || undefined,
          message: affiliateForm.message.trim(),
          chat_type: affiliateForm.chat_type,
        }),
      });

      const data = await safeJson(response);

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || 'Failed to start Writer chat.');
      }

      setAffiliateForm({
        subject: '',
        message: '',
        chat_type: 'support',
      });

      const nextChatId = data?.chat?.id || null;

      await fetchChatLists(true);
      setSelectedType('affiliate');
      setSelectedId(nextChatId);
    } catch (err) {
      setError(err.message || 'Failed to start Writer chat.');
    } finally {
      setStartingAffiliateChat(false);
    }
  }

  async function handleSendMessage(event) {
    event.preventDefault();

    if (!draft.trim() || !selectedId) return;

    setSending(true);
    setError('');

    try {
      const endpoint =
        selectedType === 'affiliate'
          ? `/api/customer-affiliate-chats/${selectedId}/messages`
          : `/api/customer-admin-chats/${selectedId}/messages`;

      const response = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          message: draft.trim(),
        }),
      });

      const data = await safeJson(response);

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || 'Failed to send message.');
      }

      setDraft('');
      setSelectedChat(data.chat || null);
      setMessages(Array.isArray(data.messages) ? data.messages : []);

      const refreshed = await fetchChatLists(true);
      if (refreshed) {
        if (selectedType === 'affiliate') {
          setAffiliateChats(refreshed.nextAffiliateChats);
        } else {
          setAdminChats(refreshed.nextAdminChats);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  }

  async function handleCloseChat() {
    if (!selectedId) return;

    setError('');

    try {
      const endpoint =
        selectedType === 'affiliate'
          ? `/api/customer-affiliate-chats/${selectedId}/close`
          : `/api/customer-admin-chats/${selectedId}/close`;

      const response = await fetch(getApiUrl(endpoint), {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const data = await safeJson(response);

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || 'Failed to close chat.');
      }

      setSelectedChat(data.chat || null);

      const refreshed = await fetchChatLists(true);
      if (refreshed) {
        if (selectedType === 'affiliate') {
          setAffiliateChats(refreshed.nextAffiliateChats);
        } else {
          setAdminChats(refreshed.nextAdminChats);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to close chat.');
    }
  }

  const activeChats = selectedType === 'affiliate' ? affiliateChats : adminChats;
  const totalChats = affiliateChats.length + adminChats.length;
  const conversationClosed =
    String(selectedChat?.status || '').toLowerCase() === 'closed';

  function getWriterName(chat) {
    return (
      chat?.affiliate?.name ||
      chat?.affiliate_name ||
      chat?.writer_name ||
      chat?.website?.website_name ||
      chat?.website_name ||
      'Writer'
    );
  }

  function getConversationTitle(chat, type = selectedType) {
    if (type === 'admin') {
      return chat?.admin_name || 'Bloggad Admin Support';
    }

    return getWriterName(chat);
  }

  function getConversationSubject(chat, type = selectedType) {
    if (!chat) return '';

    if (type === 'admin') {
      return chat?.subject || 'Support conversation';
    }

    return (
      chat?.product_title ||
      chat?.product?.title ||
      chat?.subject ||
      chat?.website_name ||
      chat?.website?.website_name ||
      'Writer conversation'
    );
  }

  function getConversationTime(chat) {
    return formatDateTime(
      chat?.last_message_at ||
      chat?.updated_at ||
      chat?.created_at
    );
  }

  function getInitials(value) {
    const parts = String(value || 'B')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

    if (!parts.length) return 'B';
    return parts.map((part) => part.charAt(0).toUpperCase()).join('');
  }

  function humanizeType(value) {
    return String(value || 'support')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function selectGroup(type) {
    const next = type === 'affiliate' ? affiliateChats : adminChats;
    setSelectedType(type);
    setSelectedId(next[0]?.id || null);
    setSelectedChat(null);
    setMessages([]);
    setMobileThreadOpen(false);
    setControlsOpen(false);
  }

  function openConversation(type, id) {
    setSelectedType(type);
    setSelectedId(id);
    setMobileThreadOpen(true);
    setControlsOpen(false);
  }

  function openComposer(type) {
    setComposerPanel(type);
    setControlsOpen(false);
  }

  return (
    <ReaderUnifiedShell title="Messages" subtitle="Your Reader inbox">
      <main className={`reader-messages-page${mobileThreadOpen ? ' is-mobile-thread-open' : ''}`}>
        <h1 className="reader-messages-mobile-route-title">Messages</h1>

        <section className="reader-messages-toolbar">
          <div className="reader-messages-action-buttons">
            <button
              type="button"
              className="reader-messages-button is-primary"
              onClick={() => openComposer('affiliate')}
            >
              New Writer message
            </button>
            <button
              type="button"
              className="reader-messages-button"
              onClick={() => openComposer('admin')}
            >
              Contact Admin Support
            </button>
          </div>

          <div className="reader-messages-counts" aria-label="Conversation counts">
            <span>{affiliateChats.length} Writer {affiliateChats.length === 1 ? 'chat' : 'chats'}</span>
            <span>{adminChats.length} Admin support</span>
          </div>
        </section>

        {error ? (
          <div className="reader-messages-alert" role="alert">
            {error}
          </div>
        ) : null}

        <div
          className={`reader-messages-workspace${mobileThreadOpen ? ' is-mobile-thread' : ''}`}
        >
          <aside className="reader-messages-inbox" aria-label="Message inbox">
            <div className="reader-messages-inbox-head">
              <h2>Inbox</h2>
              <span>{totalChats} {totalChats === 1 ? 'conversation' : 'conversations'}</span>
            </div>

            <div className="reader-messages-tabs" role="tablist" aria-label="Conversation type">
              <button
                type="button"
                className={selectedType === 'affiliate' ? 'is-active' : ''}
                onClick={() => selectGroup('affiliate')}
              >
                Writers
              </button>
              <button
                type="button"
                className={selectedType === 'admin' ? 'is-active' : ''}
                onClick={() => selectGroup('admin')}
              >
                Admin Support
              </button>
            </div>

            <div className="reader-messages-list">
              {loadingLists ? (
                <div className="reader-messages-list-state">Loading chats...</div>
              ) : null}

              {!loadingLists &&
                activeChats.map((chat) => {
                  const title = getConversationTitle(chat, selectedType);
                  const subject = getConversationSubject(chat, selectedType);
                  const status = String(chat?.status || 'open').toLowerCase();

                  return (
                    <button
                      type="button"
                      key={`${selectedType}-${chat.id}`}
                      className={`reader-messages-row${
                        Number(selectedId) === Number(chat.id) ? ' is-selected' : ''
                      }`}
                      onClick={() => openConversation(selectedType, chat.id)}
                    >
                      <span className="reader-messages-avatar" aria-hidden="true">
                        {getInitials(title)}
                      </span>

                      <span className="reader-messages-row-copy">
                        <span className="reader-messages-row-title">
                          <strong>{title}</strong>
                          <span className={`reader-messages-status is-${status}`}>
                            {status === 'closed' ? 'Closed' : 'Open'}
                          </span>
                        </span>

                        <small>
                          {getConversationTime(chat)}
                          {selectedType === 'affiliate'
                            ? ` - ${humanizeType(chat?.chat_type)}`
                            : ' - support'}
                        </small>
                        <span>{subject}</span>
                      </span>
                    </button>
                  );
                })}

              {!loadingLists && activeChats.length === 0 ? (
                <div className="reader-messages-list-state">
                  {selectedType === 'affiliate'
                    ? 'No Writer chats yet.'
                    : 'No Admin Support chats yet.'}
                </div>
              ) : null}
            </div>
          </aside>

          <section className="reader-messages-thread" aria-label="Active conversation">
            <button
              type="button"
              className="reader-messages-mobile-back"
              onClick={() => {
                setMobileThreadOpen(false);
                setControlsOpen(false);
              }}
            >
              &lt; Messages
            </button>

            <header className="reader-messages-thread-head">
              <div className="reader-messages-thread-person">
                <span className="reader-messages-avatar" aria-hidden="true">
                  {getInitials(getConversationTitle(selectedChat))}
                </span>
                <div>
                  <div className="reader-messages-thread-name">
                    {selectedChat
                      ? getConversationTitle(selectedChat)
                      : selectedType === 'affiliate'
                        ? 'Writer conversation'
                        : 'Admin Support'}
                  </div>
                  <div className="reader-messages-thread-subject">
                    {selectedChat
                      ? getConversationSubject(selectedChat)
                      : 'Select a conversation from your inbox.'}
                  </div>
                </div>
              </div>

              {selectedChat?.id ? (
                <div className="reader-messages-thread-actions">
                  <span className={`reader-messages-status is-${conversationClosed ? 'closed' : 'open'}`}>
                    {conversationClosed ? 'Closed' : 'Open'}
                  </span>

                  {selectedType === 'affiliate' ? (
                    <button
                      type="button"
                      className="reader-messages-button is-compact is-dark"
                      onClick={() => setControlsOpen(true)}
                    >
                      Controls
                    </button>
                  ) : null}

                  {!conversationClosed ? (
                    <button
                      type="button"
                      className="reader-messages-button is-compact"
                      onClick={handleCloseChat}
                    >
                      Close chat
                    </button>
                  ) : null}
                </div>
              ) : null}
            </header>

            <div className="reader-messages-thread-kind">
              {selectedType === 'affiliate' ? 'Writer conversation' : 'Admin Support conversation'}
            </div>

            <div className="reader-messages-conversation">
              {loadingChat ? (
                <div className="reader-messages-thread-state">Loading conversation...</div>
              ) : null}

              {!loadingChat && !selectedChat ? (
                <div className="reader-messages-thread-state is-centered">
                  Select a conversation to view messages.
                </div>
              ) : null}

              {!loadingChat && selectedChat && messages.length === 0 ? (
                <div className="reader-messages-thread-state is-centered">
                  No messages yet.
                </div>
              ) : null}

              {!loadingChat &&
                messages.map((chatMessage) => {
                  const isMine = chatMessage?.sender_role === 'customer';

                  return (
                    <div
                      key={chatMessage.id}
                      className={`reader-messages-message${isMine ? ' is-mine' : ''}`}
                    >
                      {!isMine ? (
                        <span className="reader-messages-message-avatar" aria-hidden="true">
                          {getInitials(
                            chatMessage?.sender_name ||
                            getConversationTitle(selectedChat)
                          )}
                        </span>
                      ) : null}

                      <div className="reader-messages-bubble-wrap">
                        <div className="reader-messages-bubble">
                          <div className="reader-messages-message-text">
                            {chatMessage?.message}
                          </div>
                        </div>
                        <small>
                          {isMine
                            ? 'You'
                            : chatMessage?.sender_name ||
                              chatMessage?.sender_role ||
                              getConversationTitle(selectedChat)}
                          {' - '}
                          {formatDateTime(chatMessage?.created_at)}
                        </small>
                      </div>
                    </div>
                  );
                })}
            </div>

            <form className="reader-messages-composer" onSubmit={handleSendMessage}>
              <div className="reader-messages-composer-field">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={
                    conversationClosed
                      ? 'This conversation is closed.'
                      : 'Write a message...'
                  }
                  disabled={!selectedChat || conversationClosed || sending}
                  rows={2}
                />
                <small>Text messages only</small>
              </div>

              <button
                type="submit"
                className="reader-messages-button is-primary reader-messages-send"
                disabled={
                  !selectedChat ||
                  conversationClosed ||
                  sending ||
                  !draft.trim()
                }
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </section>
        </div>

        <p className="reader-messages-footer-note">
          Closed conversations remain readable, but the composer is disabled until a new conversation is started.
        </p>
      </main>

      {composerPanel ? (
        <div
          className="reader-messages-overlay"
          role="presentation"
          onMouseDown={() => setComposerPanel('')}
        >
          <section
            className="reader-messages-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="New conversation"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="reader-messages-drawer-head">
              <div>
                <h2>New conversation</h2>
                <p>Start a Writer or Admin Support conversation.</p>
              </div>
              <button
                type="button"
                className="reader-messages-button is-compact"
                onClick={() => setComposerPanel('')}
              >
                Close
              </button>
            </header>

            <div className="reader-messages-drawer-tabs">
              <button
                type="button"
                className={composerPanel === 'affiliate' ? 'is-active' : ''}
                onClick={() => setComposerPanel('affiliate')}
              >
                Writer
              </button>
              <button
                type="button"
                className={composerPanel === 'admin' ? 'is-active' : ''}
                onClick={() => setComposerPanel('admin')}
              >
                Admin Support
              </button>
            </div>

            {composerPanel === 'affiliate' ? (
              <form className="reader-messages-form" onSubmit={handleStartAffiliateChat}>
                <div className="reader-messages-info">
                  <strong aria-hidden="true">i</strong>
                  <span>
                    This uses your current storefront context. If you did not enter from a storefront,
                    start the Writer chat from that Writer Space or product first.
                  </span>
                </div>

                <label>
                  <span>Subject</span>
                  <input
                    type="text"
                    value={affiliateForm.subject}
                    onChange={(event) =>
                      setAffiliateForm((current) => ({
                        ...current,
                        subject: event.target.value,
                      }))
                    }
                    placeholder="Subject (optional)"
                  />
                </label>

                <label>
                  <span>Conversation type</span>
                  <select
                    value={affiliateForm.chat_type}
                    onChange={(event) =>
                      setAffiliateForm((current) => ({
                        ...current,
                        chat_type: event.target.value,
                      }))
                    }
                  >
                    <option value="support">Support</option>
                    <option value="general">General</option>
                    <option value="coupon_request">Coupon request</option>
                    <option value="product_question">Product question</option>
                  </select>
                  <small>Options: support, general, coupon_request, product_question</small>
                </label>

                <label>
                  <span>First message</span>
                  <textarea
                    value={affiliateForm.message}
                    onChange={(event) =>
                      setAffiliateForm((current) => ({
                        ...current,
                        message: event.target.value,
                      }))
                    }
                    placeholder="Write your first message..."
                    rows={6}
                  />
                  <small>Required</small>
                </label>

                <div className="reader-messages-form-actions">
                  <button
                    type="button"
                    className="reader-messages-button"
                    onClick={() => setComposerPanel('')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="reader-messages-button is-primary"
                    disabled={startingAffiliateChat}
                  >
                    {startingAffiliateChat ? 'Starting...' : 'Start Writer Chat'}
                  </button>
                </div>
              </form>
            ) : (
              <form className="reader-messages-form" onSubmit={handleStartAdminChat}>
                <div className="reader-messages-info">
                  <strong aria-hidden="true">i</strong>
                  <span>
                    Use Admin Support for marketplace help, account issues, complaints, or general support.
                  </span>
                </div>

                <label>
                  <span>Subject</span>
                  <input
                    type="text"
                    value={adminForm.subject}
                    onChange={(event) =>
                      setAdminForm((current) => ({
                        ...current,
                        subject: event.target.value,
                      }))
                    }
                    placeholder="Subject (optional)"
                  />
                </label>

                <label>
                  <span>First message</span>
                  <textarea
                    value={adminForm.message}
                    onChange={(event) =>
                      setAdminForm((current) => ({
                        ...current,
                        message: event.target.value,
                      }))
                    }
                    placeholder="Write your first message..."
                    rows={7}
                  />
                  <small>Required</small>
                </label>

                <div className="reader-messages-form-actions">
                  <button
                    type="button"
                    className="reader-messages-button"
                    onClick={() => setComposerPanel('')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="reader-messages-button is-primary"
                    disabled={startingAdminChat}
                  >
                    {startingAdminChat ? 'Starting...' : 'Start Admin Support Chat'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      ) : null}

      {controlsOpen && selectedType === 'affiliate' && selectedChat?.id ? (
        <div
          className="reader-messages-overlay"
          role="presentation"
          onMouseDown={() => setControlsOpen(false)}
        >
          <section
            className="reader-messages-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Conversation controls"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="reader-messages-drawer-head">
              <div>
                <h2>Conversation controls</h2>
                <p>Manage this Writer conversation without leaving the thread.</p>
              </div>
              <button
                type="button"
                className="reader-messages-button is-compact"
                onClick={() => setControlsOpen(false)}
              >
                Close
              </button>
            </header>

            <div className="reader-messages-controls-body">
              <ConversationSafetyControls
                chatId={selectedChat.id}
                participantRole="reader"
                onChanged={() => fetchChatLists(true)}
              />
            </div>
          </section>
        </div>
      ) : null}
    </ReaderUnifiedShell>
  );
}
