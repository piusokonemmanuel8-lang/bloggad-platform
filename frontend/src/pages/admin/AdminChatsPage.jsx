import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function AdminChatsPage() {
  const [affiliateChats, setAffiliateChats] = useState([]);
  const [customerChats, setCustomerChats] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [activeType, setActiveType] = useState('affiliates');
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);

  const [loadingLists, setLoadingLists] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const [message, setMessage] = useState('');
  const [startAffiliateId, setStartAffiliateId] = useState('');
  const [startCustomerId, setStartCustomerId] = useState('');
  const [startAffiliateMessage, setStartAffiliateMessage] = useState('');
  const [startCustomerMessage, setStartCustomerMessage] = useState('');
  const [startAffiliateSubject, setStartAffiliateSubject] = useState('');
  const [startCustomerSubject, setStartCustomerSubject] = useState('');

  const activeList = useMemo(() => {
    return activeType === 'customers' ? customerChats : affiliateChats;
  }, [activeType, affiliateChats, customerChats]);

  async function loadChatLists() {
    const [affiliateRes, customerRes] = await Promise.all([
      api.get('/api/affiliate-admin-chats'),
      api.get('/api/customer-admin-chats'),
    ]);

    const nextAffiliateChats = affiliateRes?.data?.chats || [];
    const nextCustomerChats = customerRes?.data?.chats || [];

    setAffiliateChats(nextAffiliateChats);
    setCustomerChats(nextCustomerChats);

    return {
      nextAffiliateChats,
      nextCustomerChats,
    };
  }

  async function loadUserLists() {
    const [affiliatesRes, customersRes] = await Promise.all([
      api.get('/api/admin/affiliates'),
      api.get('/api/customer-management/admin/customers'),
    ]);

    const affiliateRows =
      affiliatesRes?.data?.affiliates ||
      affiliatesRes?.data?.users ||
      affiliatesRes?.data?.data ||
      [];

    const customerRows =
      customersRes?.data?.customers ||
      customersRes?.data?.users ||
      customersRes?.data?.data ||
      [];

    setAffiliates(Array.isArray(affiliateRows) ? affiliateRows : []);
    setCustomers(Array.isArray(customerRows) ? customerRows : []);
  }

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        setLoadingLists(true);
        setError('');

        const [{ nextAffiliateChats, nextCustomerChats }] = await Promise.all([
          loadChatLists(),
          loadUserLists(),
        ]);

        if (!active) return;

        if (nextAffiliateChats.length > 0) {
          setActiveType('affiliates');
          setSelectedChatId(nextAffiliateChats[0].id);
        } else if (nextCustomerChats.length > 0) {
          setActiveType('customers');
          setSelectedChatId(nextCustomerChats[0].id);
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
          activeType === 'customers'
            ? `/api/customer-admin-chats/${selectedChatId}`
            : `/api/affiliate-admin-chats/${selectedChatId}`;

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
        activeType === 'customers'
          ? `/api/customer-admin-chats/${selectedChatId}/messages`
          : `/api/affiliate-admin-chats/${selectedChatId}/messages`;

      const { data } = await api.post(endpoint, {
        message: message.trim(),
      });

      setMessage('');
      setSelectedChat(data?.chat || null);
      setMessages(data?.messages || []);
      await loadChatLists();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  }

  async function handleStartAffiliateChat(event) {
    event.preventDefault();
    if (!startAffiliateId || !startAffiliateMessage.trim()) return;

    try {
      setStarting(true);
      setError('');

      const { data } = await api.post('/api/affiliate-admin-chats', {
        affiliate_id: Number(startAffiliateId),
        subject: startAffiliateSubject.trim(),
        message: startAffiliateMessage.trim(),
      });

      await loadChatLists();
      setActiveType('affiliates');
      setSelectedChatId(data?.chat?.id || null);
      setStartAffiliateMessage('');
      setStartAffiliateSubject('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to start affiliate chat');
    } finally {
      setStarting(false);
    }
  }

  async function handleStartCustomerChat(event) {
    event.preventDefault();
    if (!startCustomerId || !startCustomerMessage.trim()) return;

    try {
      setStarting(true);
      setError('');

      const { data } = await api.post('/api/customer-admin-chats', {
        customer_id: Number(startCustomerId),
        subject: startCustomerSubject.trim(),
        message: startCustomerMessage.trim(),
      });

      await loadChatLists();
      setActiveType('customers');
      setSelectedChatId(data?.chat?.id || null);
      setStartCustomerMessage('');
      setStartCustomerSubject('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to start customer chat');
    } finally {
      setStarting(false);
    }
  }

  async function handleCloseChat() {
    if (!selectedChatId) return;

    try {
      setError('');

      const endpoint =
        activeType === 'customers'
          ? `/api/customer-admin-chats/${selectedChatId}/close`
          : `/api/affiliate-admin-chats/${selectedChatId}/close`;

      const { data } = await api.patch(endpoint);

      setSelectedChat(data?.chat || null);
      await loadChatLists();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to close chat');
    }
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div
        style={{
          background: '#fff',
          border: '1px solid #dcdcde',
          borderRadius: 20,
          padding: 20,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28, color: '#1d2327' }}>Chats</h1>
        <p style={{ margin: '8px 0 0', color: '#646970' }}>
          Manage affiliate and customer conversations from one place.
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
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 20,
        }}
      >
        <form
          onSubmit={handleStartAffiliateChat}
          style={{
            background: '#fff',
            border: '1px solid #dcdcde',
            borderRadius: 20,
            padding: 16,
            display: 'grid',
            gap: 12,
          }}
        >
          <h3 style={{ margin: 0, color: '#1d2327' }}>Start chat with affiliate</h3>

          <select
            value={startAffiliateId}
            onChange={(e) => setStartAffiliateId(e.target.value)}
            style={{
              height: 44,
              borderRadius: 12,
              border: '1px solid #dcdcde',
              padding: '0 12px',
              background: '#fff',
              color: '#1d2327',
            }}
          >
            <option value="">Select affiliate</option>
            {affiliates.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name || item.email || `Affiliate #${item.id}`}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Subject (optional)"
            value={startAffiliateSubject}
            onChange={(e) => setStartAffiliateSubject(e.target.value)}
            style={{
              height: 44,
              borderRadius: 12,
              border: '1px solid #dcdcde',
              padding: '0 12px',
              background: '#fff',
              color: '#1d2327',
            }}
          />

          <textarea
            rows={4}
            placeholder="Write your first message..."
            value={startAffiliateMessage}
            onChange={(e) => setStartAffiliateMessage(e.target.value)}
            style={{
              borderRadius: 12,
              border: '1px solid #dcdcde',
              padding: 12,
              background: '#fff',
              color: '#1d2327',
              resize: 'vertical',
            }}
          />

          <button
            type="submit"
            disabled={starting || !startAffiliateId || !startAffiliateMessage.trim()}
            style={{
              border: 0,
              borderRadius: 12,
              padding: '12px 14px',
              background: '#1d2327',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              opacity: starting ? 0.6 : 1,
            }}
          >
            {starting ? 'Starting...' : 'Start Affiliate Chat'}
          </button>
        </form>

        <form
          onSubmit={handleStartCustomerChat}
          style={{
            background: '#fff',
            border: '1px solid #dcdcde',
            borderRadius: 20,
            padding: 16,
            display: 'grid',
            gap: 12,
          }}
        >
          <h3 style={{ margin: 0, color: '#1d2327' }}>Start chat with customer</h3>

          <select
            value={startCustomerId}
            onChange={(e) => setStartCustomerId(e.target.value)}
            style={{
              height: 44,
              borderRadius: 12,
              border: '1px solid #dcdcde',
              padding: '0 12px',
              background: '#fff',
              color: '#1d2327',
            }}
          >
            <option value="">Select customer</option>
            {customers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name || item.email || `Customer #${item.id}`}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Subject (optional)"
            value={startCustomerSubject}
            onChange={(e) => setStartCustomerSubject(e.target.value)}
            style={{
              height: 44,
              borderRadius: 12,
              border: '1px solid #dcdcde',
              padding: '0 12px',
              background: '#fff',
              color: '#1d2327',
            }}
          />

          <textarea
            rows={4}
            placeholder="Write your first message..."
            value={startCustomerMessage}
            onChange={(e) => setStartCustomerMessage(e.target.value)}
            style={{
              borderRadius: 12,
              border: '1px solid #dcdcde',
              padding: 12,
              background: '#fff',
              color: '#1d2327',
              resize: 'vertical',
            }}
          />

          <button
            type="submit"
            disabled={starting || !startCustomerId || !startCustomerMessage.trim()}
            style={{
              border: 0,
              borderRadius: 12,
              padding: '12px 14px',
              background: '#1d2327',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              opacity: starting ? 0.6 : 1,
            }}
          >
            {starting ? 'Starting...' : 'Start Customer Chat'}
          </button>
        </form>
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid #dcdcde',
          borderRadius: 20,
          padding: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              setActiveType('affiliates');
              setSelectedChatId(affiliateChats[0]?.id || null);
            }}
            style={{
              border: 0,
              borderRadius: 12,
              padding: '10px 14px',
              background: activeType === 'affiliates' ? '#1d2327' : '#f6f7f7',
              color: activeType === 'affiliates' ? '#fff' : '#1d2327',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Affiliates
          </button>

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
              background: activeType === 'customers' ? '#1d2327' : '#f6f7f7',
              color: activeType === 'customers' ? '#fff' : '#1d2327',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Customers
          </button>
        </div>

        <div
          className="admin-chats-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 320px) minmax(0, 1fr)',
            gap: 20,
          }}
        >
          <div style={{ minWidth: 0 }}>
            {loadingLists ? (
              <div style={{ color: '#646970' }}>Loading chats...</div>
            ) : activeList.length === 0 ? (
              <div style={{ color: '#646970' }}>No chats yet.</div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {activeList.map((chat) => {
                  const title =
                    activeType === 'customers'
                      ? chat?.customer?.name || chat?.customer_name || `Customer #${chat.id}`
                      : chat?.affiliate?.name || chat?.affiliate_name || `Affiliate #${chat.id}`;

                  const subtitle =
                    activeType === 'customers'
                      ? chat?.customer?.email || chat?.customer_email || chat?.subject || 'Customer support'
                      : chat?.affiliate?.email || chat?.affiliate_email || chat?.subject || 'Affiliate support';

                  return (
                    <button
                      key={`${activeType}-${chat.id}`}
                      type="button"
                      onClick={() => setSelectedChatId(chat.id)}
                      style={{
                        textAlign: 'left',
                        border:
                          selectedChatId === chat.id ? '1px solid #1d2327' : '1px solid #dcdcde',
                        background: selectedChatId === chat.id ? '#f6f7f7' : '#fff',
                        borderRadius: 14,
                        padding: 14,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#1d2327', marginBottom: 6 }}>
                        {title}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: '#646970',
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
              minWidth: 0,
              background: '#fff',
              border: '1px solid #dcdcde',
              borderRadius: 16,
              padding: 16,
              minHeight: 560,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {!selectedChatId ? (
              <div style={{ color: '#646970' }}>Select a chat to begin.</div>
            ) : loadingChat ? (
              <div style={{ color: '#646970' }}>Loading conversation...</div>
            ) : (
              <>
                <div
                  style={{
                    paddingBottom: 14,
                    borderBottom: '1px solid #dcdcde',
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: '#1d2327' }}>
                      {activeType === 'customers'
                        ? selectedChat?.customer_name ||
                          selectedChat?.customer?.name ||
                          'Customer Support'
                        : selectedChat?.affiliate_name ||
                          selectedChat?.affiliate?.name ||
                          'Affiliate Support'}
                    </div>
                    <div style={{ color: '#646970', marginTop: 4, wordBreak: 'break-word' }}>
                      {selectedChat?.subject || selectedChat?.status || 'Open'}
                    </div>
                  </div>

                  {selectedChat?.id ? (
                    <button
                      type="button"
                      onClick={handleCloseChat}
                      style={{
                        border: '1px solid #dcdcde',
                        borderRadius: 12,
                        padding: '10px 12px',
                        background: '#fff',
                        color: '#1d2327',
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
                    <div style={{ color: '#646970' }}>No messages yet.</div>
                  ) : (
                    messages.map((item) => {
                      const mine = item?.sender_role === 'admin';

                      return (
                        <div
                          key={item.id}
                          style={{
                            justifySelf: mine ? 'end' : 'start',
                            maxWidth: '85%',
                            background: mine ? '#1d2327' : '#f6f7f7',
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
                              color: mine ? '#ffffff' : '#1d2327',
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
                    style={{
                      width: '100%',
                      border: '1px solid #d1d5db',
                      borderRadius: 14,
                      padding: 14,
                      resize: 'vertical',
                      outline: 'none',
                      color: '#1d2327',
                      background: '#ffffff',
                    }}
                  />

                  <button
                    type="submit"
                    disabled={sending || !message.trim()}
                    style={{
                      border: 0,
                      borderRadius: 14,
                      padding: '12px 18px',
                      background: '#1d2327',
                      color: '#fff',
                      fontWeight: 700,
                      cursor: sending ? 'not-allowed' : 'pointer',
                      opacity: sending ? 0.6 : 1,
                      justifySelf: 'start',
                    }}
                  >
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .admin-chats-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}