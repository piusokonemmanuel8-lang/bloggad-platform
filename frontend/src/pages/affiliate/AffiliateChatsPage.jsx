import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function AffiliateChatsPage() {
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
      setError('Customer and first message are required');
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
      setError('Selected customer has no registered storefront context');
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
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to start customer chat');
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
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to start admin chat');
    } finally {
      setStartingAdminChat(false);
    }
  }

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
          Manage your customer and admin conversations from one place.
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
          <div style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>Start Customer Chat</div>

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
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer?.name || 'Customer'} {customer?.email ? `- ${customer.email}` : ''}
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
            {startingCustomerChat ? 'Starting...' : 'Start Customer Chat'}
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
              Customers
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
                      `Customer #${chat.id}`;

                const subtitle =
                  activeType === 'admin'
                    ? chat?.subject || chat?.status || 'Support conversation'
                    : chat?.customer?.email ||
                      chat?.customer_email ||
                      chat?.subject ||
                      chat?.website?.website_name ||
                      'Customer conversation';

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
                        'Customer Chat'}
                  </div>
                  <div style={{ color: '#6b7280', marginTop: 4, wordBreak: 'break-word' }}>
                    {activeType === 'admin'
                      ? selectedChat?.subject || selectedChat?.status || 'Support conversation'
                      : selectedChat?.website_name ||
                        selectedChat?.website?.website_name ||
                        selectedChat?.subject ||
                        selectedChat?.status ||
                        'Customer conversation'}
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