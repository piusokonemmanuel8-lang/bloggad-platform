import { useEffect, useMemo, useState } from 'react';
import CustomerPageShell from '../../components/customer/CustomerPageShell';

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
      throw new Error(affiliateData?.message || 'Failed to fetch affiliate chats.');
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
      setError('Affiliate first message is required.');
      return;
    }

    const websiteId = loginContext?.website_id || null;
    const websiteSlug = loginContext?.website_slug || '';
    const affiliateId = loginContext?.affiliate_id || null;

    if (!websiteId && !websiteSlug) {
      setError('Affiliate chat must start from a storefront context.');
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
        throw new Error(data?.message || 'Failed to start affiliate chat.');
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
      setError(err.message || 'Failed to start affiliate chat.');
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

  return (
    <CustomerPageShell
      currentPath="/customer/messages"
      badge="Inbox"
      title="Customer messages"
      subtitle="Start admin support here. Affiliate chat starts from storefront context and continues here."
      headerRight={
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              padding: '12px 16px',
              fontSize: 14,
              color: '#6b7280',
              fontWeight: 600,
            }}
          >
            My Affiliate Chats:{' '}
            <span style={{ color: '#111827', fontWeight: 800 }}>{affiliateChats.length}</span>
          </div>

          <div
            style={{
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              padding: '12px 16px',
              fontSize: 14,
              color: '#6b7280',
              fontWeight: 600,
            }}
          >
            My Admin Support Chats:{' '}
            <span style={{ color: '#111827', fontWeight: 800 }}>{adminChats.length}</span>
          </div>
        </div>
      }
    >
      <style>{`
        .customer-messages-start-grid {
          display: grid;
          gap: 24px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .customer-messages-grid {
          display: grid;
          gap: 24px;
          grid-template-columns: 360px minmax(0, 1fr);
        }

        @media (max-width: 1100px) {
          .customer-messages-start-grid,
          .customer-messages-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {error ? (
        <div
          style={{
            borderRadius: 20,
            border: '1px solid #fecaca',
            background: '#fff1f2',
            padding: '16px 18px',
            fontSize: 14,
            color: '#be123c',
          }}
        >
          {error}
        </div>
      ) : null}

      <div className="customer-messages-start-grid">
        <form
          onSubmit={handleStartAffiliateChat}
          style={{
            borderRadius: 24,
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            padding: 20,
            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.05)',
            display: 'grid',
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#111827',
            }}
          >
            Start Affiliate Chat
          </div>

          <div
            style={{
              fontSize: 14,
              color: '#6b7280',
              lineHeight: 1.7,
            }}
          >
            This uses your current storefront context. If you did not enter from a storefront, start the affiliate chat from that storefront or product first.
          </div>

          <input
            type="text"
            placeholder="Subject (optional)"
            value={affiliateForm.subject}
            onChange={(e) =>
              setAffiliateForm((prev) => ({
                ...prev,
                subject: e.target.value,
              }))
            }
            style={inputStyle}
          />

          <select
            value={affiliateForm.chat_type}
            onChange={(e) =>
              setAffiliateForm((prev) => ({
                ...prev,
                chat_type: e.target.value,
              }))
            }
            style={inputStyle}
          >
            <option value="support">support</option>
            <option value="general">general</option>
            <option value="coupon_request">coupon_request</option>
            <option value="product_question">product_question</option>
          </select>

          <textarea
            placeholder="Write your first message..."
            rows={4}
            value={affiliateForm.message}
            onChange={(e) =>
              setAffiliateForm((prev) => ({
                ...prev,
                message: e.target.value,
              }))
            }
            style={textareaStyle}
          />

          <button
            type="submit"
            disabled={startingAffiliateChat}
            style={{
              ...primaryButtonStyle,
              opacity: startingAffiliateChat ? 0.65 : 1,
              cursor: startingAffiliateChat ? 'not-allowed' : 'pointer',
            }}
          >
            {startingAffiliateChat ? 'Starting...' : 'Start Affiliate Chat'}
          </button>
        </form>

        <form
          onSubmit={handleStartAdminChat}
          style={{
            borderRadius: 24,
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            padding: 20,
            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.05)',
            display: 'grid',
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#111827',
            }}
          >
            Start Admin Chat
          </div>

          <div
            style={{
              fontSize: 14,
              color: '#6b7280',
              lineHeight: 1.7,
            }}
          >
            Use this for general marketplace help, support, complaints, or account issues.
          </div>

          <input
            type="text"
            placeholder="Subject (optional)"
            value={adminForm.subject}
            onChange={(e) =>
              setAdminForm((prev) => ({
                ...prev,
                subject: e.target.value,
              }))
            }
            style={inputStyle}
          />

          <textarea
            placeholder="Write your first message..."
            rows={4}
            value={adminForm.message}
            onChange={(e) =>
              setAdminForm((prev) => ({
                ...prev,
                message: e.target.value,
              }))
            }
            style={textareaStyle}
          />

          <button
            type="submit"
            disabled={startingAdminChat}
            style={{
              ...primaryButtonStyle,
              opacity: startingAdminChat ? 0.65 : 1,
              cursor: startingAdminChat ? 'not-allowed' : 'pointer',
            }}
          >
            {startingAdminChat ? 'Starting...' : 'Start Admin Chat'}
          </button>
        </form>
      </div>

      <div className="customer-messages-grid">
        <section
          style={{
            borderRadius: 24,
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            padding: 20,
            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.05)',
          }}
        >
          <div style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setSelectedType('affiliate');
                setSelectedId(affiliateChats[0]?.id || null);
              }}
              style={{
                minHeight: 42,
                padding: '0 14px',
                borderRadius: 14,
                border: selectedType === 'affiliate' ? '1px solid #111827' : '1px solid #d1d5db',
                background: selectedType === 'affiliate' ? '#111827' : '#ffffff',
                color: selectedType === 'affiliate' ? '#ffffff' : '#111827',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              My Affiliate Chats
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedType('admin');
                setSelectedId(adminChats[0]?.id || null);
              }}
              style={{
                minHeight: 42,
                padding: '0 14px',
                borderRadius: 14,
                border: selectedType === 'admin' ? '1px solid #111827' : '1px solid #d1d5db',
                background: selectedType === 'admin' ? '#111827' : '#ffffff',
                color: selectedType === 'admin' ? '#ffffff' : '#111827',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              My Admin Support Chats
            </button>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {loadingLists ? (
              <div
                style={{
                  borderRadius: 18,
                  border: '1px solid #e5e7eb',
                  background: '#f8fafc',
                  padding: 16,
                  fontSize: 14,
                  color: '#6b7280',
                }}
              >
                Loading chats...
              </div>
            ) : null}

            {!loadingLists &&
              selectedType === 'affiliate' &&
              affiliateChats.map((chat) => (
                <ChatListCard
                  key={`affiliate-${chat.id}`}
                  active={selectedId === chat.id && selectedType === 'affiliate'}
                  onClick={() => {
                    setSelectedType('affiliate');
                    setSelectedId(chat.id);
                  }}
                  title={
                    chat?.affiliate?.name ||
                    chat?.website?.website_name ||
                    'Affiliate'
                  }
                  subtitle={
                    chat?.product?.title ||
                    chat?.subject ||
                    chat?.website?.website_name ||
                    'Affiliate conversation'
                  }
                  meta={`${chat.chat_type || 'general'} • ${chat.status || 'open'}`}
                />
              ))}

            {!loadingLists &&
              selectedType === 'admin' &&
              adminChats.map((chat) => (
                <ChatListCard
                  key={`admin-${chat.id}`}
                  active={selectedId === chat.id && selectedType === 'admin'}
                  onClick={() => {
                    setSelectedType('admin');
                    setSelectedId(chat.id);
                  }}
                  title="Marketplace Admin"
                  subtitle={chat?.subject || 'Support conversation'}
                  meta={`${chat.status || 'open'}`}
                />
              ))}

            {!loadingLists &&
            ((selectedType === 'affiliate' && affiliateChats.length === 0) ||
              (selectedType === 'admin' && adminChats.length === 0)) ? (
              <div
                style={{
                  borderRadius: 18,
                  border: '1px dashed #d1d5db',
                  background: '#ffffff',
                  padding: 18,
                  fontSize: 14,
                  color: '#6b7280',
                }}
              >
                {selectedType === 'affiliate'
                  ? 'No affiliate chats yet.'
                  : 'No admin support chats yet.'}
              </div>
            ) : null}
          </div>
        </section>

        <section
          style={{
            display: 'flex',
            minHeight: 620,
            flexDirection: 'column',
            borderRadius: 24,
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.05)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              padding: '18px 20px',
              borderBottom: '1px solid #eef2f7',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: '#111827',
                }}
              >
                {selectedType === 'affiliate'
                  ? selectedChat?.affiliate_name ||
                    selectedChat?.affiliate?.name ||
                    selectedChat?.website_name ||
                    selectedChat?.website?.website_name ||
                    'Affiliate Chat'
                  : 'Marketplace Admin'}
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontSize: 14,
                  color: '#6b7280',
                }}
              >
                {selectedType === 'affiliate'
                  ? selectedChat?.product_title ||
                    selectedChat?.product?.title ||
                    selectedChat?.subject ||
                    selectedChat?.website_name ||
                    selectedChat?.website?.website_name ||
                    'Storefront conversation'
                  : selectedChat?.subject || 'Support conversation'}
              </div>
            </div>

            {selectedChat?.id ? (
              <button
                type="button"
                onClick={handleCloseChat}
                style={{
                  minHeight: 42,
                  padding: '0 14px',
                  borderRadius: 14,
                  border: '1px solid #fecaca',
                  background: '#fff1f2',
                  color: '#be123c',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close Chat
              </button>
            ) : null}
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 20,
              display: 'grid',
              gap: 14,
              background: '#f8fafc',
            }}
          >
            {loadingChat ? (
              <div style={{ fontSize: 14, color: '#6b7280' }}>Loading conversation...</div>
            ) : null}

            {!loadingChat && !selectedChat ? (
              <div
                style={{
                  minHeight: 280,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  fontSize: 14,
                  color: '#6b7280',
                }}
              >
                Select a chat to view messages.
              </div>
            ) : null}

            {!loadingChat &&
              messages.map((chatMessage) => {
                const isMine = chatMessage?.sender_role === 'customer';

                return (
                  <div
                    key={chatMessage.id}
                    style={{
                      display: 'flex',
                      justifyContent: isMine ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '80%',
                        borderRadius: 20,
                        padding: '14px 16px',
                        fontSize: 14,
                        lineHeight: 1.7,
                        background: isMine ? '#111827' : '#ffffff',
                        color: isMine ? '#ffffff' : '#111827',
                        border: isMine ? '1px solid #111827' : '1px solid #e5e7eb',
                        boxShadow: '0 10px 25px rgba(15, 23, 42, 0.05)',
                      }}
                    >
                      <div
                        style={{
                          marginBottom: 6,
                          fontSize: 11,
                          textTransform: 'uppercase',
                          letterSpacing: '0.12em',
                          fontWeight: 800,
                          opacity: 0.7,
                        }}
                      >
                        {chatMessage?.sender_name || chatMessage?.sender_role}
                      </div>

                      <div>{chatMessage?.message}</div>

                      {chatMessage?.coupon_code ? (
                        <div
                          style={{
                            marginTop: 10,
                            borderRadius: 12,
                            padding: '8px 10px',
                            background: isMine ? 'rgba(255,255,255,0.12)' : '#f8fafc',
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          Coupon: {chatMessage.coupon_code}
                        </div>
                      ) : null}

                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 11,
                          opacity: 0.6,
                        }}
                      >
                        {formatDateTime(chatMessage?.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <form
            onSubmit={handleSendMessage}
            style={{
              borderTop: '1px solid #eef2f7',
              padding: 16,
              background: '#ffffff',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Write your message..."
                rows={3}
                disabled={!selectedChat || selectedChat?.status === 'closed' || sending}
                style={{
                  minHeight: 88,
                  flex: 1,
                  resize: 'none',
                  borderRadius: 18,
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  padding: '14px 16px',
                  fontSize: 14,
                  color: '#111827',
                  outline: 'none',
                  minWidth: 260,
                }}
              />

              <button
                type="submit"
                disabled={
                  !selectedChat ||
                  selectedChat?.status === 'closed' ||
                  sending ||
                  !draft.trim()
                }
                style={{
                  alignSelf: 'flex-end',
                  minHeight: 48,
                  padding: '0 18px',
                  borderRadius: 16,
                  border: '1px solid #111827',
                  background: '#111827',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity:
                    !selectedChat ||
                    selectedChat?.status === 'closed' ||
                    sending ||
                    !draft.trim()
                      ? 0.6
                      : 1,
                }}
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>

            {selectedChat?.status === 'closed' ? (
              <div
                style={{
                  marginTop: 12,
                  fontSize: 14,
                  color: '#be123c',
                }}
              >
                This chat is closed.
              </div>
            ) : null}
          </form>
        </section>
      </div>
    </CustomerPageShell>
  );
}

const inputStyle = {
  width: '100%',
  minHeight: 48,
  borderRadius: 16,
  border: '1px solid #d1d5db',
  background: '#ffffff',
  padding: '0 16px',
  fontSize: 14,
  color: '#111827',
  outline: 'none',
};

const textareaStyle = {
  width: '100%',
  borderRadius: 16,
  border: '1px solid #d1d5db',
  background: '#ffffff',
  padding: 16,
  fontSize: 14,
  color: '#111827',
  outline: 'none',
  resize: 'vertical',
};