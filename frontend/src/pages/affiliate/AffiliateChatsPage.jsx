import { ConversationSafetyControls, WriterMessagePrivacySettings } from '../../components/writerReader/WriterReaderChatControls';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axios';

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function AffiliateChatsPage() {
  const location = useLocation();
  const writerRouteMode = location.pathname === '/writer/messages';
  const [adminChats, setAdminChats] = useState([]);
  const [customerChats, setCustomerChats] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [activeType, setActiveType] = useState('customers');
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState('');
  const [loadingLists, setLoadingLists] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [startingCustomerChat, setStartingCustomerChat] = useState(false);
  const [startingAdminChat, setStartingAdminChat] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidePanel, setSidePanel] = useState('');
  const [newMessageType, setNewMessageType] = useState('customers');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const [customerForm, setCustomerForm] = useState({
    customer_id: '',
    subject: '',
    message: '',
  });

  const [adminForm, setAdminForm] = useState({
    subject: '',
    message: '',
  });

  const activeList = useMemo(() => {
    return activeType === 'admin' ? adminChats : customerChats;
  }, [activeType, adminChats, customerChats]);

  async function loadLists() {
    const [adminRes, customerRes, customersRes] = await Promise.all([
      api.get('/api/affiliate-admin-chats'),
      api.get('/api/customer-affiliate-chats'),
      api.get('/api/customer-management/affiliate/customers'),
    ]);

    const nextAdminChats = adminRes?.data?.chats || [];
    const nextCustomerChats = customerRes?.data?.chats || [];
    const nextCustomers = customersRes?.data?.customers || [];

    setAdminChats(nextAdminChats);
    setCustomerChats(nextCustomerChats);
    setCustomers(nextCustomers);

    return {
      nextAdminChats,
      nextCustomerChats,
      nextCustomers,
    };
  }

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        setLoadingLists(true);
        setError('');

        const { nextAdminChats, nextCustomerChats } = await loadLists();

        if (!active) return;

        if (nextCustomerChats.length > 0) {
          setActiveType('customers');
          setSelectedChatId(nextCustomerChats[0].id);
        } else if (nextAdminChats.length > 0) {
          setActiveType('admin');
          setSelectedChatId(nextAdminChats[0].id);
        } else {
          setSelectedChatId(null);
          setSelectedChat(null);
          setMessages([]);
        }
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.message || 'Failed to load chats');
      } finally {
        if (active) setLoadingLists(false);
      }
    }

    init();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadChat() {
      if (!selectedChatId) {
        setSelectedChat(null);
        setMessages([]);
        return;
      }

      try {
        setLoadingChat(true);
        setError('');

        const endpoint =
          activeType === 'admin'
            ? `/api/affiliate-admin-chats/${selectedChatId}`
            : `/api/customer-affiliate-chats/${selectedChatId}`;

        const { data } = await api.get(endpoint);

        if (!active) return;

        setSelectedChat(data?.chat || null);
        setMessages(data?.messages || []);
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.message || 'Failed to load chat');
      } finally {
        if (active) setLoadingChat(false);
      }
    }

    loadChat();

    return () => {
      active = false;
    };
  }, [activeType, selectedChatId]);

  async function handleSend(event) {
    event.preventDefault();
    if (!message.trim() || !selectedChatId) return;

    try {
      setSending(true);
      setError('');

      const endpoint =
        activeType === 'admin'
          ? `/api/affiliate-admin-chats/${selectedChatId}/messages`
          : `/api/customer-affiliate-chats/${selectedChatId}/messages`;

      const { data } = await api.post(endpoint, {
        message: message.trim(),
      });

      setMessage('');
      setSelectedChat(data?.chat || null);
      setMessages(data?.messages || []);
      await loadLists();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  }

  async function handleCloseChat() {
    if (!selectedChatId) return;

    try {
      setError('');

      const endpoint =
        activeType === 'admin'
          ? `/api/affiliate-admin-chats/${selectedChatId}/close`
          : `/api/customer-affiliate-chats/${selectedChatId}/close`;

      const { data } = await api.patch(endpoint);

      setSelectedChat(data?.chat || null);
      await loadLists();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to close chat');
    }
  }

  async function handleStartCustomerChat(event) {
    event.preventDefault();

    if (!customerForm.customer_id || !customerForm.message.trim()) {
      setError('Reader and first message are required');
      return;
    }

    const chosenCustomer = customers.find(
      (item) => String(item.id) === String(customerForm.customer_id)
    );

    const websiteId =
      chosenCustomer?.registered_website?.id ||
      chosenCustomer?.registered_under_website_id ||
      null;

    const websiteSlug =
      chosenCustomer?.registered_website?.slug ||
      '';

    if (!websiteId && !websiteSlug) {
      setError('Selected Reader has no registered Writer Space context');
      return;
    }

    try {
      setStartingCustomerChat(true);
      setError('');

      const { data } = await api.post('/api/customer-affiliate-chats', {
        customer_id: Number(customerForm.customer_id),
        website_id: websiteId || undefined,
        website_slug: websiteSlug || undefined,
        subject: customerForm.subject.trim() || undefined,
        message: customerForm.message.trim(),
        chat_type: 'support',
      });

      const nextChatId = data?.chat?.id || null;

      setCustomerForm({
        customer_id: '',
        subject: '',
        message: '',
      });

      await loadLists();

      setActiveType('customers');
      setSelectedChatId(nextChatId);
      if (writerRouteMode) {
        setSidePanel('');
        setMobileChatOpen(true);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to start Reader chat');
    } finally {
      setStartingCustomerChat(false);
    }
  }

  async function handleStartAdminChat(event) {
    event.preventDefault();

    if (!adminForm.message.trim()) {
      setError('Message is required');
      return;
    }

    try {
      setStartingAdminChat(true);
      setError('');

      const { data } = await api.post('/api/affiliate-admin-chats', {
        subject: adminForm.subject.trim() || undefined,
        message: adminForm.message.trim(),
      });

      const nextChatId = data?.chat?.id || null;

      setAdminForm({
        subject: '',
        message: '',
      });

      await loadLists();

      setActiveType('admin');
      setSelectedChatId(nextChatId);
      if (writerRouteMode) {
        setSidePanel('');
        setMobileChatOpen(true);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to start admin chat');
    } finally {
      setStartingAdminChat(false);
    }
  }

  if (!writerRouteMode) {
    return (
      <div style={{ display: 'grid', gap: 20 }}>
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 20,
            padding: 20,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 28, color: '#111827' }}>Chats</h1>
          <p style={{ margin: '8px 0 0', color: '#6b7280' }}>
            Manage your Reader and admin conversations from one place.
          </p>
        </div>

        {error ? (
          <div
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              borderRadius: 14,
              padding: 14,
              wordBreak: 'break-word',
            }}
          >
            {error}
          </div>
        ) : null}

        <div
          className="affiliate-chat-start-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 20,
          }}
        >
          <WriterMessagePrivacySettings />

          <form
            onSubmit={handleStartCustomerChat}
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 20,
              padding: 20,
              display: 'grid',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>Start Reader Chat</div>

            <select
              value={customerForm.customer_id}
              onChange={(e) =>
                setCustomerForm((prev) => ({
                  ...prev,
                  customer_id: e.target.value,
                }))
              }
              style={inputStyle}
            >
              <option value="">Select Reader</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer?.name || 'Reader'}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Subject (optional)"
              value={customerForm.subject}
              onChange={(e) =>
                setCustomerForm((prev) => ({
                  ...prev,
                  subject: e.target.value,
                }))
              }
              style={inputStyle}
            />

            <textarea
              placeholder="Write your first message..."
              rows={4}
              value={customerForm.message}
              onChange={(e) =>
                setCustomerForm((prev) => ({
                  ...prev,
                  message: e.target.value,
                }))
              }
              style={textareaStyle}
            />

            <button
              type="submit"
              disabled={startingCustomerChat}
              style={primaryButtonStyle}
            >
              {startingCustomerChat ? 'Starting...' : 'Start Reader Chat'}
            </button>
          </form>

          <form
            onSubmit={handleStartAdminChat}
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 20,
              padding: 20,
              display: 'grid',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>Start Admin Chat</div>

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
              style={primaryButtonStyle}
            >
              {startingAdminChat ? 'Starting...' : 'Start Admin Chat'}
            </button>
          </form>
        </div>

        <div
          className="affiliate-chats-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 320px) minmax(0, 1fr)',
            gap: 20,
          }}
        >
          <div
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 20,
              padding: 16,
              minWidth: 0,
            }}
          >
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveType('customers');
                  setSelectedChatId(customerChats[0]?.id || null);
                }}
                style={{
                  border: 0,
                  borderRadius: 12,
                  padding: '10px 14px',
                  background: activeType === 'customers' ? '#111827' : '#f3f4f6',
                  color: activeType === 'customers' ? '#fff' : '#111827',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Readers
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveType('admin');
                  setSelectedChatId(adminChats[0]?.id || null);
                }}
                style={{
                  border: 0,
                  borderRadius: 12,
                  padding: '10px 14px',
                  background: activeType === 'admin' ? '#111827' : '#f3f4f6',
                  color: activeType === 'admin' ? '#fff' : '#111827',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Admin
              </button>
            </div>

            {loadingLists ? (
              <div style={{ color: '#6b7280' }}>Loading chats...</div>
            ) : activeList.length === 0 ? (
              <div style={{ color: '#6b7280' }}>No chats yet.</div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {activeList.map((chat) => {
                  const title =
                    activeType === 'admin'
                      ? 'Admin Support'
                      : chat?.customer?.name ||
                        chat?.customer_name ||
                        chat?.subject ||
                        `Reader #${chat.id}`;

                  const subtitle =
                    activeType === 'admin'
                      ? chat?.subject || chat?.status || 'Support conversation'
                      : chat?.subject ||
                        chat?.website?.website_name ||
                        'Reader conversation';

                  return (
                    <button
                      key={`${activeType}-${chat.id}`}
                      type="button"
                      onClick={() => setSelectedChatId(chat.id)}
                      style={{
                        textAlign: 'left',
                        border:
                          selectedChatId === chat.id ? '1px solid #111827' : '1px solid #e5e7eb',
                        background: selectedChatId === chat.id ? '#f9fafb' : '#fff',
                        borderRadius: 14,
                        padding: 14,
                        cursor: 'pointer',
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          color: '#111827',
                          marginBottom: 6,
                          wordBreak: 'break-word',
                        }}
                      >
                        {title}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: '#6b7280',
                          marginBottom: 6,
                          wordBreak: 'break-word',
                        }}
                      >
                        {subtitle}
                      </div>
                      <div style={{ fontSize: 12, color: '#8c8f94' }}>
                        {chat?.status || 'open'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 20,
              padding: 16,
              minHeight: 560,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
            }}
          >
            {!selectedChatId ? (
              <div style={{ color: '#6b7280' }}>Select a chat to begin.</div>
            ) : loadingChat ? (
              <div style={{ color: '#6b7280' }}>Loading conversation...</div>
            ) : (
              <>
                <div
                  style={{
                    paddingBottom: 14,
                    borderBottom: '1px solid #e5e7eb',
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 18,
                        color: '#111827',
                        wordBreak: 'break-word',
                      }}
                    >
                      {activeType === 'admin'
                        ? 'Admin Support'
                        : selectedChat?.customer_name ||
                          selectedChat?.customer?.name ||
                          selectedChat?.subject ||
                          'Reader Chat'}
                    </div>
                    <div style={{ color: '#6b7280', marginTop: 4, wordBreak: 'break-word' }}>
                      {activeType === 'admin'
                        ? selectedChat?.subject || selectedChat?.status || 'Support conversation'
                        : selectedChat?.website_name ||
                          selectedChat?.website?.website_name ||
                          selectedChat?.subject ||
                          selectedChat?.status ||
                          'Reader conversation'}
                    </div>
                  </div>

                  {selectedChat?.id ? (
                    <button
                      type="button"
                      onClick={handleCloseChat}
                      style={{
                        border: '1px solid #d1d5db',
                        borderRadius: 12,
                        padding: '10px 12px',
                        background: '#fff',
                        color: '#111827',
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      Close Chat
                    </button>
                  ) : null}
                </div>

                {activeType === 'customers' && selectedChat?.id ? (
                  <ConversationSafetyControls
                    chatId={selectedChat.id}
                    participantRole="writer"
                    onChanged={loadLists}
                  />
                ) : null}

                <div
                  style={{
                    flex: 1,
                    display: 'grid',
                    gap: 12,
                    alignContent: 'start',
                    maxHeight: 380,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    paddingRight: 4,
                  }}
                >
                  {messages.length === 0 ? (
                    <div style={{ color: '#6b7280' }}>No messages yet.</div>
                  ) : (
                    messages.map((item) => {
                      const mine = item?.sender_role === 'affiliate';

                      return (
                        <div
                          key={item.id}
                          style={{
                            justifySelf: mine ? 'end' : 'start',
                            maxWidth: '85%',
                            background: mine ? '#111827' : '#f3f4f6',
                            borderRadius: 16,
                            padding: 12,
                            wordBreak: 'break-word',
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              marginBottom: 6,
                              color: mine ? 'rgba(255,255,255,0.72)' : 'rgba(29,35,39,0.72)',
                              fontWeight: 600,
                            }}
                          >
                            {item?.sender_name || item?.sender_role || 'User'}
                          </div>

                          <div
                            style={{
                              color: mine ? '#ffffff' : '#111827',
                              lineHeight: 1.6,
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {item?.message}
                          </div>

                          <div
                            style={{
                              fontSize: 11,
                              marginTop: 8,
                              color: mine ? 'rgba(255,255,255,0.72)' : 'rgba(29,35,39,0.72)',
                            }}
                          >
                            {formatDateTime(item?.created_at)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form
                  onSubmit={handleSend}
                  style={{
                    marginTop: 16,
                    display: 'grid',
                    gap: 10,
                  }}
                >
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message..."
                    rows={4}
                    style={textareaStyle}
                  />

                  <button
                    type="submit"
                    disabled={sending || !message.trim()}
                    style={{
                      ...primaryButtonStyle,
                      justifySelf: 'start',
                      opacity: sending ? 0.6 : 1,
                      cursor: sending ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        <style>{`
          @media (max-width: 1100px) {
            .affiliate-chat-start-grid {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 980px) {
            .affiliate-chats-layout {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    );

  }


  function getConversationTitle(chat, type = activeType) {
    if (!chat) return type === 'admin' ? 'Admin Support' : 'Reader';
    if (type === 'admin') return 'Admin Support';

    return (
      chat?.customer?.name ||
      chat?.customer_name ||
      chat?.subject ||
      `Reader #${chat.id}`
    );
  }

  function getConversationPreview(chat, type = activeType) {
    if (!chat) return '';
    if (type === 'admin') {
      return chat?.subject || chat?.status || 'Support conversation';
    }

    return (
      chat?.last_message ||
      chat?.subject ||
      chat?.website?.website_name ||
      chat?.status ||
      'Reader conversation'
    );
  }

  function compactTime(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();

    if (sameDay) {
      return date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      });
    }

    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
  }

  function initials(value) {
    const parts = String(value || 'U')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!parts.length) return 'U';

    return parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  function selectConversation(chatId) {
    setSelectedChatId(chatId);
    setMobileChatOpen(true);
    setEmojiOpen(false);
  }

  function switchConversationType(type) {
    const nextList = type === 'admin' ? adminChats : customerChats;
    setActiveType(type);
    setSelectedChatId(nextList[0]?.id || null);
    setMobileChatOpen(false);
    setEmojiOpen(false);
  }

  function openNewMessage(type = 'customers') {
    setNewMessageType(type);
    setSidePanel('new');
  }

  function insertEmoji(codePoint) {
    setMessage((current) => `${current}${String.fromCodePoint(codePoint)}`);
    setEmojiOpen(false);
  }

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const visibleChats = activeList.filter((chat) => {
    if (!normalizedSearch) return true;

    const searchable = [
      getConversationTitle(chat),
      getConversationPreview(chat),
      chat?.subject,
      chat?.status,
      chat?.website?.website_name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchable.includes(normalizedSearch);
  });

  const selectedTitle = getConversationTitle(selectedChat);
  const selectedStatus =
    activeType === 'customers' && selectedChat?.request_status === 'pending'
      ? 'Message request'
      : String(selectedChat?.status || '').toLowerCase() === 'closed'
        ? 'Closed'
        : activeType === 'admin'
          ? 'Admin support'
          : 'Reader conversation';

  const emojiCodePoints = [
    0x1f642,
    0x1f600,
    0x1f44d,
    0x2764,
    0x1f389,
    0x1f64f,
    0x1f4a1,
    0x1f525,
  ];

  const writerMessagesStyles = `
    .writer-messages-page {
      height: calc(100vh - 66px);
      min-height: 680px;
      margin: -30px;
      display: grid;
      grid-template-columns: 318px minmax(0, 1fr);
      overflow: hidden;
      background: #ffffff;
      color: #1c1f24;
      border-top: 1px solid #e4e7ea;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .writer-messages-page *,
    .writer-messages-page *::before,
    .writer-messages-page *::after {
      box-sizing: border-box;
    }

    .writer-messages-page button,
    .writer-messages-page input,
    .writer-messages-page textarea,
    .writer-messages-drawer button,
    .writer-messages-drawer input,
    .writer-messages-drawer select,
    .writer-messages-drawer textarea {
      font: inherit;
    }

    .writer-messages-inbox {
      min-width: 0;
      min-height: 0;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border-right: 1px solid #e2e5e8;
    }

    .writer-messages-inbox-head {
      padding: 20px 18px 14px;
      border-bottom: 1px solid #edf0f2;
      background: #ffffff;
    }

    .writer-messages-inbox-title-row {
      min-height: 36px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .writer-messages-inbox-title-row h2 {
      margin: 0;
      font-size: 20px;
      line-height: 1.2;
      font-weight: 750;
      letter-spacing: -0.025em;
    }

    .writer-messages-inbox-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .writer-messages-icon-button {
      min-width: 34px;
      height: 34px;
      padding: 0 10px;
      border: 1px solid #dfe3e6;
      border-radius: 9px;
      background: #ffffff;
      color: #2e3339;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 12px;
      font-weight: 700;
    }

    .writer-messages-icon-button.primary {
      min-width: 34px;
      padding: 0;
      border-color: #1d2025;
      background: #1d2025;
      color: #ffffff;
      font-size: 18px;
      line-height: 1;
    }

    .writer-messages-search {
      width: 100%;
      height: 40px;
      margin-top: 14px;
      padding: 0 12px;
      border: 1px solid #dde1e5;
      border-radius: 10px;
      outline: none;
      background: #f8f9fa;
      color: #20242a;
      font-size: 13px;
    }

    .writer-messages-search:focus {
      border-color: #9ca3aa;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(32, 36, 42, 0.06);
    }

    .writer-messages-tabs {
      margin-top: 12px;
      padding: 3px;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 3px;
      border-radius: 9px;
      background: #f1f3f4;
    }

    .writer-messages-tab {
      height: 32px;
      border: 0;
      border-radius: 7px;
      background: transparent;
      color: #666d76;
      cursor: pointer;
      font-size: 12px;
      font-weight: 700;
    }

    .writer-messages-tab.active {
      background: #ffffff;
      color: #1e2227;
      box-shadow: 0 1px 3px rgba(24, 29, 35, 0.08);
    }

    .writer-messages-list {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      background: #ffffff;
      scrollbar-width: thin;
    }

    .writer-messages-list-state {
      padding: 26px 20px;
      color: #78808a;
      font-size: 13px;
      line-height: 1.5;
    }

    .writer-messages-row {
      width: 100%;
      min-height: 76px;
      padding: 12px 14px;
      border: 0;
      border-bottom: 1px solid #f0f1f2;
      background: #ffffff;
      display: grid;
      grid-template-columns: 42px minmax(0, 1fr) auto;
      gap: 10px;
      align-items: center;
      text-align: left;
      cursor: pointer;
    }

    .writer-messages-row:hover,
    .writer-messages-row.active {
      background: #f7f8f9;
    }

    .writer-messages-row.active {
      box-shadow: inset 3px 0 0 #1d2025;
    }

    .writer-messages-avatar {
      width: 42px;
      height: 42px;
      border-radius: 999px;
      background: #eceff1;
      color: #33383e;
      display: grid;
      place-items: center;
      flex-shrink: 0;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.02em;
    }

    .writer-messages-row-copy {
      min-width: 0;
    }

    .writer-messages-row-copy strong,
    .writer-messages-row-copy span {
      display: block;
    }

    .writer-messages-row-copy strong {
      overflow: hidden;
      color: #23272d;
      font-size: 13px;
      line-height: 1.35;
      font-weight: 750;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .writer-messages-row-copy span {
      margin-top: 4px;
      overflow: hidden;
      color: #808791;
      font-size: 11px;
      line-height: 1.4;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .writer-messages-row-meta {
      align-self: start;
      padding-top: 2px;
      display: grid;
      justify-items: end;
      gap: 8px;
      color: #8a9199;
      font-size: 10px;
      white-space: nowrap;
    }

    .writer-messages-unread {
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 999px;
      background: #1d2025;
      color: #ffffff;
      display: grid;
      place-items: center;
      font-size: 9px;
      font-weight: 800;
    }

    .writer-messages-thread {
      min-width: 0;
      min-height: 0;
      display: flex;
      flex-direction: column;
      background: #f7f8f9;
    }

    .writer-messages-thread-head {
      min-height: 68px;
      padding: 11px 18px;
      border-bottom: 1px solid #e1e4e7;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
    }

    .writer-messages-thread-person {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 11px;
    }

    .writer-messages-thread-person .writer-messages-avatar {
      width: 38px;
      height: 38px;
    }

    .writer-messages-thread-copy {
      min-width: 0;
    }

    .writer-messages-thread-copy strong,
    .writer-messages-thread-copy span {
      display: block;
    }

    .writer-messages-thread-copy strong {
      overflow: hidden;
      color: #1e2227;
      font-size: 14px;
      line-height: 1.3;
      font-weight: 750;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .writer-messages-thread-copy span {
      margin-top: 3px;
      color: #7c848d;
      font-size: 11px;
    }

    .writer-messages-mobile-back {
      display: none;
    }

    .writer-messages-thread-more {
      width: 34px;
      height: 34px;
      border: 1px solid #dfe3e6;
      border-radius: 9px;
      background: #ffffff;
      color: #454b52;
      cursor: pointer;
      font-size: 15px;
      letter-spacing: 0.08em;
    }

    .writer-messages-error {
      margin: 10px 16px 0;
      padding: 10px 12px;
      border: 1px solid #f2c9cc;
      border-radius: 9px;
      background: #fff4f5;
      color: #9f2530;
      font-size: 12px;
      line-height: 1.4;
    }

    .writer-messages-thread-body {
      flex: 1;
      min-height: 0;
      padding: 24px clamp(18px, 4vw, 52px);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 9px;
      scrollbar-width: thin;
    }

    .writer-messages-thread-state {
      margin: auto;
      max-width: 340px;
      padding: 24px;
      color: #7a828b;
      text-align: center;
      font-size: 13px;
      line-height: 1.55;
    }

    .writer-message-line {
      display: flex;
      justify-content: flex-start;
    }

    .writer-message-line.mine {
      justify-content: flex-end;
    }

    .writer-message-wrap {
      max-width: min(68%, 660px);
      display: grid;
      gap: 4px;
    }

    .writer-message-line.mine .writer-message-wrap {
      justify-items: end;
    }

    .writer-message-bubble {
      padding: 10px 13px;
      border: 1px solid #e0e3e6;
      border-radius: 15px 15px 15px 4px;
      background: #ffffff;
      color: #282c31;
      font-size: 13px;
      line-height: 1.5;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      box-shadow: 0 1px 1px rgba(23, 27, 32, 0.02);
    }

    .writer-message-line.mine .writer-message-bubble {
      border-color: #202328;
      border-radius: 15px 15px 4px 15px;
      background: #202328;
      color: #ffffff;
    }

    .writer-message-time {
      padding: 0 3px;
      color: #9299a2;
      font-size: 9px;
      line-height: 1.3;
    }

    .writer-messages-composer-wrap {
      position: relative;
      padding: 12px 16px;
      border-top: 1px solid #e1e4e7;
      background: #ffffff;
    }

    .writer-messages-composer {
      min-height: 44px;
      display: grid;
      grid-template-columns: auto auto minmax(0, 1fr) auto;
      gap: 7px;
      align-items: end;
    }

    .writer-messages-compose-button {
      height: 40px;
      min-width: 40px;
      padding: 0 9px;
      border: 1px solid #dde1e4;
      border-radius: 10px;
      background: #ffffff;
      color: #596069;
      cursor: pointer;
      font-size: 12px;
      font-weight: 700;
    }

    .writer-messages-compose-button:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }

    .writer-messages-compose-field {
      min-height: 40px;
      max-height: 120px;
      padding: 10px 12px;
      border: 1px solid #dfe2e5;
      border-radius: 12px;
      outline: none;
      resize: none;
      background: #f8f9fa;
      color: #25292e;
      font-size: 13px;
      line-height: 1.45;
    }

    .writer-messages-compose-field:focus {
      border-color: #9ea5ad;
      background: #ffffff;
    }

    .writer-messages-send {
      height: 40px;
      padding: 0 16px;
      border: 1px solid #1e2227;
      border-radius: 10px;
      background: #1e2227;
      color: #ffffff;
      cursor: pointer;
      font-size: 12px;
      font-weight: 750;
    }

    .writer-messages-send:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }

    .writer-messages-emoji-panel {
      position: absolute;
      left: 16px;
      bottom: 64px;
      z-index: 8;
      width: 232px;
      padding: 9px;
      border: 1px solid #dfe3e6;
      border-radius: 12px;
      background: #ffffff;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 5px;
      box-shadow: 0 12px 28px rgba(24, 29, 35, 0.12);
    }

    .writer-messages-emoji-panel button {
      height: 40px;
      border: 0;
      border-radius: 8px;
      background: #f7f8f9;
      cursor: pointer;
      font-size: 20px;
    }

    .writer-messages-drawer-layer {
      position: fixed;
      inset: 0;
      z-index: 4200;
      background: rgba(18, 21, 26, 0.32);
      display: flex;
      justify-content: flex-end;
    }

    .writer-messages-drawer {
      width: min(420px, 100%);
      height: 100%;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      box-shadow: -18px 0 44px rgba(18, 22, 27, 0.14);
    }

    .writer-messages-drawer-head {
      min-height: 64px;
      padding: 0 18px;
      border-bottom: 1px solid #e5e7e9;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .writer-messages-drawer-head h3 {
      margin: 0;
      color: #1e2227;
      font-size: 17px;
      font-weight: 750;
      letter-spacing: -0.015em;
    }

    .writer-messages-drawer-close {
      width: 34px;
      height: 34px;
      border: 1px solid #dfe3e6;
      border-radius: 9px;
      background: #ffffff;
      color: #5f666e;
      cursor: pointer;
      font-size: 17px;
    }

    .writer-messages-drawer-body {
      flex: 1;
      min-height: 0;
      padding: 18px;
      overflow-y: auto;
    }

    .writer-messages-drawer-tabs {
      margin-bottom: 16px;
      padding: 3px;
      border-radius: 9px;
      background: #f1f3f4;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 3px;
    }

    .writer-messages-form {
      display: grid;
      gap: 12px;
    }

    .writer-messages-form label {
      display: grid;
      gap: 6px;
      color: #596069;
      font-size: 11px;
      font-weight: 750;
    }

    .writer-messages-form input,
    .writer-messages-form select,
    .writer-messages-form textarea {
      width: 100%;
      border: 1px solid #dfe3e6;
      border-radius: 10px;
      outline: none;
      background: #ffffff;
      color: #23272d;
      font-size: 13px;
    }

    .writer-messages-form input,
    .writer-messages-form select {
      height: 42px;
      padding: 0 11px;
    }

    .writer-messages-form textarea {
      min-height: 118px;
      padding: 10px 11px;
      resize: vertical;
      line-height: 1.45;
    }

    .writer-messages-form-submit {
      height: 42px;
      border: 1px solid #1e2227;
      border-radius: 10px;
      background: #1e2227;
      color: #ffffff;
      cursor: pointer;
      font-size: 12px;
      font-weight: 750;
    }

    .writer-messages-form-submit:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .writer-messages-controls-copy {
      margin: 0 0 14px;
      color: #747c85;
      font-size: 12px;
      line-height: 1.55;
    }

    .writer-messages-close-chat {
      width: 100%;
      min-height: 42px;
      margin-top: 14px;
      border: 1px solid #e4b9bd;
      border-radius: 10px;
      background: #fff6f7;
      color: #a32935;
      cursor: pointer;
      font-size: 12px;
      font-weight: 750;
    }

    .writer-messages-mobile-fab {
      display: none;
    }

    @media (max-width: 900px) {
      .writer-messages-page {
        grid-template-columns: 286px minmax(0, 1fr);
      }
    }

    @media (max-width: 767px) {
      .writer-messages-page {
        width: 100%;
        height: calc(100dvh - 60px);
        min-height: 560px;
        margin: 0;
        display: block;
        overflow: hidden;
        border-top: 0;
      }

      .writer-messages-inbox {
        width: 100%;
        height: 100%;
        border-right: 0;
      }

      .writer-messages-inbox-head {
        padding: 14px 12px 11px;
      }

      .writer-messages-inbox-actions .writer-messages-icon-button.primary {
        display: none;
      }

      .writer-messages-search {
        margin-top: 11px;
      }

      .writer-messages-list {
        padding-bottom: 72px;
      }

      .writer-messages-row {
        min-height: 74px;
        padding: 11px 12px;
        grid-template-columns: 42px minmax(0, 1fr) auto;
      }

      .writer-messages-thread {
        display: none;
      }

      .writer-messages-page.mobile-chat-open .writer-messages-thread {
        position: fixed;
        inset: 0;
        z-index: 5000;
        width: 100vw;
        height: 100dvh;
        display: flex;
        background: #f7f8f9;
      }

      .writer-messages-thread-head {
        min-height: 58px;
        padding: 8px 10px;
      }

      .writer-messages-mobile-back {
        width: 34px;
        height: 34px;
        padding: 0;
        border: 0;
        background: transparent;
        color: #292e34;
        display: grid;
        place-items: center;
        cursor: pointer;
        font-size: 20px;
      }

      .writer-messages-thread-person {
        gap: 8px;
        flex: 1;
      }

      .writer-messages-thread-person .writer-messages-avatar {
        width: 34px;
        height: 34px;
      }

      .writer-messages-thread-body {
        padding: 18px 11px 14px;
        gap: 8px;
      }

      .writer-message-wrap {
        max-width: 82%;
      }

      .writer-message-bubble {
        padding: 9px 11px;
        font-size: 13px;
      }

      .writer-messages-composer-wrap {
        padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
      }

      .writer-messages-composer {
        grid-template-columns: auto auto minmax(0, 1fr) auto;
        gap: 5px;
      }

      .writer-messages-compose-button {
        min-width: 36px;
        height: 38px;
        padding: 0 7px;
        font-size: 11px;
      }

      .writer-messages-compose-field {
        min-height: 38px;
        padding: 9px 10px;
      }

      .writer-messages-send {
        height: 38px;
        padding: 0 11px;
      }

      .writer-messages-emoji-panel {
        left: 8px;
        bottom: 58px;
      }

      .writer-messages-mobile-fab {
        position: absolute;
        right: 16px;
        bottom: 18px;
        z-index: 6;
        width: 48px;
        height: 48px;
        border: 0;
        border-radius: 999px;
        background: #1e2227;
        color: #ffffff;
        display: grid;
        place-items: center;
        cursor: pointer;
        box-shadow: 0 10px 22px rgba(20, 24, 29, 0.2);
        font-size: 22px;
      }

      .writer-messages-drawer-layer {
        z-index: 6000;
      }

      .writer-messages-drawer {
        width: 100%;
      }
    }

    @media (max-width: 390px) {
      .writer-messages-inbox-actions .writer-messages-icon-button:not(.primary) {
        min-width: 32px;
        padding: 0 7px;
        font-size: 10px;
      }

      .writer-messages-compose-button {
        min-width: 34px;
        padding: 0 5px;
      }

      .writer-messages-send {
        padding: 0 9px;
      }
    }
  `;

  return (
    <>
      <style>{writerMessagesStyles}</style>

      <div className={`writer-messages-page${mobileChatOpen ? ' mobile-chat-open' : ''}`}>
        <aside className="writer-messages-inbox" aria-label="Conversations">
          <div className="writer-messages-inbox-head">
            <div className="writer-messages-inbox-title-row">
              <h2>Inbox</h2>

              <div className="writer-messages-inbox-actions">
                <button
                  type="button"
                  className="writer-messages-icon-button"
                  onClick={() => setSidePanel('settings')}
                >
                  Settings
                </button>

                <button
                  type="button"
                  className="writer-messages-icon-button primary"
                  aria-label="New message"
                  onClick={() => openNewMessage('customers')}
                >
                  +
                </button>
              </div>
            </div>

            <input
              className="writer-messages-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search conversations"
              aria-label="Search conversations"
            />

            <div className="writer-messages-tabs" role="tablist" aria-label="Conversation type">
              <button
                type="button"
                className={`writer-messages-tab${activeType === 'customers' ? ' active' : ''}`}
                onClick={() => switchConversationType('customers')}
              >
                Readers
              </button>

              <button
                type="button"
                className={`writer-messages-tab${activeType === 'admin' ? ' active' : ''}`}
                onClick={() => switchConversationType('admin')}
              >
                Admin
              </button>
            </div>
          </div>

          <div className="writer-messages-list">
            {loadingLists ? (
              <div className="writer-messages-list-state">Loading conversations...</div>
            ) : visibleChats.length ? (
              visibleChats.map((chat) => {
                const title = getConversationTitle(chat);
                const preview = getConversationPreview(chat);
                const unread = Math.max(0, Number(chat?.unread_count || 0));

                return (
                  <button
                    type="button"
                    key={`${activeType}-${chat.id}`}
                    className={`writer-messages-row${selectedChatId === chat.id ? ' active' : ''}`}
                    onClick={() => selectConversation(chat.id)}
                  >
                    <span className="writer-messages-avatar" aria-hidden="true">
                      {initials(title)}
                    </span>

                    <span className="writer-messages-row-copy">
                      <strong>{title}</strong>
                      <span>{preview}</span>
                    </span>

                    <span className="writer-messages-row-meta">
                      <span>{compactTime(chat?.last_message_at || chat?.updated_at || chat?.created_at)}</span>
                      {unread > 0 ? (
                        <span className="writer-messages-unread">
                          {unread > 99 ? '99+' : unread}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="writer-messages-list-state">
                {normalizedSearch ? 'No matching conversations.' : 'No conversations yet.'}
              </div>
            )}
          </div>

          <button
            type="button"
            className="writer-messages-mobile-fab"
            aria-label="New message"
            onClick={() => openNewMessage('customers')}
          >
            +
          </button>
        </aside>

        <section className="writer-messages-thread" aria-label="Active conversation">
          {selectedChatId ? (
            <>
              <header className="writer-messages-thread-head">
                <div className="writer-messages-thread-person">
                  <button
                    type="button"
                    className="writer-messages-mobile-back"
                    aria-label="Back to inbox"
                    onClick={() => {
                      setMobileChatOpen(false);
                      setEmojiOpen(false);
                    }}
                  >
                    &lt;
                  </button>

                  <span className="writer-messages-avatar" aria-hidden="true">
                    {initials(selectedTitle)}
                  </span>

                  <span className="writer-messages-thread-copy">
                    <strong>{selectedTitle}</strong>
                    <span>{selectedStatus}</span>
                  </span>
                </div>

                <button
                  type="button"
                  className="writer-messages-thread-more"
                  aria-label="Conversation controls"
                  onClick={() => setSidePanel('controls')}
                >
                  ...
                </button>
              </header>

              {error ? <div className="writer-messages-error">{error}</div> : null}

              <div className="writer-messages-thread-body">
                {loadingChat ? (
                  <div className="writer-messages-thread-state">Loading conversation...</div>
                ) : messages.length ? (
                  messages.map((item, index) => {
                    const mine = item?.sender_role === 'affiliate';

                    return (
                      <div
                        key={item?.id || `${item?.created_at || 'message'}-${index}`}
                        className={`writer-message-line${mine ? ' mine' : ''}`}
                      >
                        <div className="writer-message-wrap">
                          <div className="writer-message-bubble">
                            {item?.message || ''}
                          </div>
                          <div className="writer-message-time">
                            {formatDateTime(item?.created_at)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="writer-messages-thread-state">
                    No messages yet. Start the conversation below.
                  </div>
                )}
              </div>

              <div className="writer-messages-composer-wrap">
                {emojiOpen ? (
                  <div className="writer-messages-emoji-panel" aria-label="Emoji picker">
                    {emojiCodePoints.map((codePoint) => (
                      <button
                        type="button"
                        key={codePoint}
                        onClick={() => insertEmoji(codePoint)}
                        aria-label={`Insert emoji ${codePoint}`}
                      >
                        {String.fromCodePoint(codePoint)}
                      </button>
                    ))}
                  </div>
                ) : null}

                <form className="writer-messages-composer" onSubmit={handleSend}>
                  <button
                    type="button"
                    className="writer-messages-compose-button"
                    aria-label="Choose emoji"
                    aria-expanded={emojiOpen}
                    onClick={() => setEmojiOpen((current) => !current)}
                  >
                    :)
                  </button>

                  <button
                    type="button"
                    className="writer-messages-compose-button"
                    aria-label="Attach file"
                    title="File attachments are not available yet."
                    disabled
                  >
                    Attach
                  </button>

                  <textarea
                    className="writer-messages-compose-field"
                    rows={1}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (
                        event.key === 'Enter' &&
                        !event.shiftKey &&
                        !event.nativeEvent?.isComposing
                      ) {
                        event.preventDefault();

                        if (!sending && message.trim()) {
                          event.currentTarget.form?.requestSubmit();
                        }
                      }
                    }}
                    placeholder="Message..."
                    aria-label="Message"
                  />

                  <button
                    type="submit"
                    className="writer-messages-send"
                    disabled={sending || !message.trim()}
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="writer-messages-thread-state">
              Choose a conversation from the inbox or start a new message.
            </div>
          )}
        </section>
      </div>

      {sidePanel ? (
        <div
          className="writer-messages-drawer-layer"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSidePanel('');
            }
          }}
        >
          <aside
            className="writer-messages-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={
              sidePanel === 'new'
                ? 'New message'
                : sidePanel === 'settings'
                  ? 'Message settings'
                  : 'Conversation controls'
            }
          >
            <header className="writer-messages-drawer-head">
              <h3>
                {sidePanel === 'new'
                  ? 'New message'
                  : sidePanel === 'settings'
                    ? 'Message policy'
                    : 'Conversation controls'}
              </h3>

              <button
                type="button"
                className="writer-messages-drawer-close"
                aria-label="Close"
                onClick={() => setSidePanel('')}
              >
                x
              </button>
            </header>

            <div className="writer-messages-drawer-body">
              {sidePanel === 'new' ? (
                <>
                  <div className="writer-messages-drawer-tabs">
                    <button
                      type="button"
                      className={`writer-messages-tab${newMessageType === 'customers' ? ' active' : ''}`}
                      onClick={() => setNewMessageType('customers')}
                    >
                      Reader
                    </button>

                    <button
                      type="button"
                      className={`writer-messages-tab${newMessageType === 'admin' ? ' active' : ''}`}
                      onClick={() => setNewMessageType('admin')}
                    >
                      Admin
                    </button>
                  </div>

                  {newMessageType === 'customers' ? (
                    <form className="writer-messages-form" onSubmit={handleStartCustomerChat}>
                      <label>
                        Reader
                        <select
                          value={customerForm.customer_id}
                          onChange={(event) =>
                            setCustomerForm((current) => ({
                              ...current,
                              customer_id: event.target.value,
                            }))
                          }
                        >
                          <option value="">Choose a Reader</option>
                          {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer?.name || 'Reader'}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        Subject
                        <input
                          type="text"
                          value={customerForm.subject}
                          onChange={(event) =>
                            setCustomerForm((current) => ({
                              ...current,
                              subject: event.target.value,
                            }))
                          }
                          placeholder="Optional"
                        />
                      </label>

                      <label>
                        Message
                        <textarea
                          value={customerForm.message}
                          onChange={(event) =>
                            setCustomerForm((current) => ({
                              ...current,
                              message: event.target.value,
                            }))
                          }
                          placeholder="Write your first message..."
                        />
                      </label>

                      <button
                        type="submit"
                        className="writer-messages-form-submit"
                        disabled={
                          startingCustomerChat ||
                          !customerForm.customer_id ||
                          !customerForm.message.trim()
                        }
                      >
                        {startingCustomerChat ? 'Starting...' : 'Start conversation'}
                      </button>
                    </form>
                  ) : (
                    <form className="writer-messages-form" onSubmit={handleStartAdminChat}>
                      <label>
                        Subject
                        <input
                          type="text"
                          value={adminForm.subject}
                          onChange={(event) =>
                            setAdminForm((current) => ({
                              ...current,
                              subject: event.target.value,
                            }))
                          }
                          placeholder="Optional"
                        />
                      </label>

                      <label>
                        Message
                        <textarea
                          value={adminForm.message}
                          onChange={(event) =>
                            setAdminForm((current) => ({
                              ...current,
                              message: event.target.value,
                            }))
                          }
                          placeholder="Write your first message..."
                        />
                      </label>

                      <button
                        type="submit"
                        className="writer-messages-form-submit"
                        disabled={startingAdminChat || !adminForm.message.trim()}
                      >
                        {startingAdminChat ? 'Starting...' : 'Start admin conversation'}
                      </button>
                    </form>
                  )}
                </>
              ) : null}

              {sidePanel === 'settings' ? <WriterMessagePrivacySettings /> : null}

              {sidePanel === 'controls' ? (
                <>
                  <p className="writer-messages-controls-copy">
                    Manage this conversation without taking space away from your message history.
                  </p>

                  {activeType === 'customers' && selectedChat?.id ? (
                    <ConversationSafetyControls
                      chatId={selectedChat.id}
                      participantRole="writer"
                      onChanged={loadLists}
                    />
                  ) : null}

                  {selectedChatId ? (
                    <button
                      type="button"
                      className="writer-messages-close-chat"
                      onClick={handleCloseChat}
                    >
                      Close conversation
                    </button>
                  ) : null}
                </>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}


const inputStyle = {
  width: '100%',
  border: '1px solid #d1d5db',
  borderRadius: 14,
  padding: 14,
  outline: 'none',
  color: '#111827',
  background: '#ffffff',
};

const textareaStyle = {
  width: '100%',
  border: '1px solid #d1d5db',
  borderRadius: 14,
  padding: 14,
  resize: 'vertical',
  outline: 'none',
  color: '#111827',
  background: '#ffffff',
};

const primaryButtonStyle = {
  border: 0,
  borderRadius: 14,
  padding: '12px 18px',
  background: '#111827',
  color: '#fff',
  fontWeight: 700,
};
