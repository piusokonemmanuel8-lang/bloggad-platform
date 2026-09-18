import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Archive, CalendarDays, MoreHorizontal, Plus, RefreshCw, Search, Video } from 'lucide-react';
import api from '../../api/axios';
import './WriterWebinarsPage.css';

const FILTERS = ['all', 'draft', 'ready', 'scheduled', 'live', 'ended', 'archived'];

function number(value) { return Number(value || 0).toLocaleString(); }
function bytes(value) {
  const amount = Number(value || 0);
  if (!amount) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(amount) / Math.log(1024)), units.length - 1);
  return `${(amount / (1024 ** index)).toFixed(index > 2 ? 1 : 0)} ${units[index]}`;
}
function hours(value) { return `${(Number(value || 0) / 3600).toFixed(1)} hrs`; }
function statusOf(item) {
  if (['queued', 'processing'].includes(String(item.media_status || ''))) return 'processing';
  if (item.media_status === 'failed') return 'error';
  return String(item.status || 'draft').toLowerCase();
}
function scheduleOf(item) {
  if (!item.scheduled_start_at) return { main: 'Not scheduled', sub: item.timezone || 'No date selected' };
  const date = new Date(item.scheduled_start_at);
  if (Number.isNaN(date.getTime())) return { main: 'Schedule unavailable', sub: item.timezone || '' };
  return {
    main: new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date),
    sub: item.timezone || 'UTC',
  };
}
function nextAction(item) {
  const step = item.creator_state?.next_step;
  const labels = {
    complete_details: 'Complete Setup', upload_video: 'Upload Video', processing_video: 'Processing',
    retry_video: 'Retry Upload', publish: 'Publish', scheduled: 'Manage', live: 'Open Room',
    ended: 'View Analytics', archived: 'View',
  };
  return labels[step] || 'Manage';
}

export default function WriterWebinarsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [webinars, setWebinars] = useState([]);
  const [overview, setOverview] = useState(null);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const [listResponse, overviewResponse] = await Promise.all([
        api.get('/api/writer/webinars'),
        api.get('/api/writer/webinar-subscription/me'),
      ]);
      setWebinars(Array.isArray(listResponse?.data?.webinars) ? listResponse.data.webinars : []);
      setOverview(overviewResponse?.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load webinars.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const paymentStatus = String(searchParams.get('webinar_subscription_payment') || '').toLowerCase();
    const reference = String(searchParams.get('purchase_ref') || '').trim();
    if (!paymentStatus && !reference) return;
    let active = true;
    async function verifyPayment() {
      try {
        let status = paymentStatus;
        let purchase = null;
        if (reference) {
          const response = await api.get(`/api/writer/webinar-subscription/checkout/status/${encodeURIComponent(reference)}`);
          purchase = response?.data?.purchase || null;
          status = String(purchase?.status || paymentStatus).toLowerCase();
        }
        if (!active) return;
        if (status === 'paid') { setNotice(`${purchase?.plan_name || 'Webinar plan'} payment verified. Your webinar plan is active.`); await load(true); }
        else if (status === 'cancelled') setNotice('Checkout was cancelled. No webinar plan was activated.');
        else if (status === 'failed') setError(purchase?.failure_reason || 'Payment could not be verified. No webinar plan was activated.');
        else setNotice('Payment is pending verification. Refresh after the gateway confirms it.');
      } catch (requestError) { if (active) setError(requestError?.response?.data?.message || 'Unable to confirm webinar plan payment.'); }
      const next = new URLSearchParams(searchParams); next.delete('webinar_subscription_payment'); next.delete('purchase_ref'); setSearchParams(next,{replace:true});
    }
    verifyPayment();
    return () => { active = false; };
  }, []);

  const counts = useMemo(() => webinars.reduce((result, item) => {
    const status = statusOf(item);
    result.all += 1;
    result[status] = (result[status] || 0) + 1;
    return result;
  }, { all: 0 }), [webinars]);

  const visible = useMemo(() => webinars.filter((item) => {
    const matchesFilter = filter === 'all' || statusOf(item) === filter;
    const text = `${item.title || ''} ${item.writer_page_name || ''} ${item.webinar_type || ''}`.toLowerCase();
    return matchesFilter && text.includes(query.trim().toLowerCase());
  }), [webinars, filter, query]);

  async function lifecycle(item, action) {
    if (!window.confirm(`${action === 'archive' ? 'Archive' : 'Return'} "${item.title}"?`)) return;
    setBusyId(item.id);
    setError('');
    setNotice('');
    try {
      const { data } = await api.post(`/api/writer/webinars/${item.id}/${action}`);
      setNotice(data?.message || 'Webinar updated.');
      setOpenMenu(null);
      await load(true);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to update webinar.');
    } finally { setBusyId(null); }
  }

  const subscription = overview?.subscription;
  const usage = overview?.usage;
  const limits = usage?.limits || {};

  return (
    <div className="writer-webinars-page">
      <header className="writer-webinars-header">
        <div><h1>Webinars</h1><p>Create, schedule and manage your webinar experiences.</p></div>
        <button className="writer-webinars-plans" type="button" onClick={() => navigate('/writer/webinars/plans')}>View Plans</button>
        <button className="writer-webinars-primary" type="button" onClick={() => navigate('/writer/webinars/create')}>
          <Plus size={16} /> Create Webinar
        </button>
      </header>

      <section className="writer-webinars-usage" aria-label="Webinar plan and usage">
        <div><span>Current plan</span><strong className="plan">{subscription?.plan?.name || 'No active plan'}</strong></div>
        <div><span>Webinars</span><strong>{number(usage?.webinar_count)}{limits.max_webinars ? ` of ${number(limits.max_webinars)}` : ''}</strong></div>
        <div><span>Storage</span><strong>{bytes(usage?.storage_bytes)}{limits.storage_bytes ? ` of ${bytes(limits.storage_bytes)}` : ''}</strong></div>
        <div><span>Attendee-hours</span><strong>{hours(usage?.playback_seconds)}{limits.monthly_playback_seconds ? ` of ${hours(limits.monthly_playback_seconds)}` : ''}</strong></div>
        <div><span>Concurrent limit</span><strong>{limits.max_concurrent_attendees ? `${number(limits.max_concurrent_attendees)} attendees` : 'Not available'}</strong></div>
      </section>

      <div className="writer-webinars-toolbar">
        <div className="writer-webinars-tabs" role="tablist" aria-label="Webinar status">
          {FILTERS.map((name) => (
            <button key={name} type="button" className={filter === name ? 'active' : ''} onClick={() => setFilter(name)}>
              {name[0].toUpperCase() + name.slice(1)} <span>{counts[name] || 0}</span>
            </button>
          ))}
        </div>
        <div className="writer-webinars-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search webinars" aria-label="Search webinars" /></div>
        <button className="writer-webinars-refresh" type="button" onClick={() => load(true)} disabled={refreshing}><RefreshCw size={15} />{refreshing ? 'Refreshing' : 'Refresh'}</button>
      </div>

      {error ? <div className="writer-webinars-alert error" role="alert">{error}</div> : null}
      {notice ? <div className="writer-webinars-alert success" role="status">{notice}</div> : null}

      {loading ? <div className="writer-webinars-state"><span className="writer-webinars-spinner" />Loading webinars...</div> : (
        <section className="writer-webinars-list" aria-label="Webinar list">
          <div className="writer-webinars-row heading"><div>Webinar</div><div>Schedule</div><div>Registration</div><div>Status</div><div /></div>
          {visible.length ? visible.map((item) => {
            const schedule = scheduleOf(item);
            const status = statusOf(item);
            const disabled = ['processing_video'].includes(item.creator_state?.next_step);
            return (
              <article className="writer-webinars-row" key={item.id}>
                <div className="writer-webinars-title-cell"><span className="writer-webinars-thumb"><Video size={19} /></span><span><strong>{item.title || 'Untitled webinar'}</strong><small>{item.writer_page_name || 'Writer Page'} - {item.webinar_type || 'Webinar'}</small></span></div>
                <div className="writer-webinars-cell" data-label="Schedule"><span>{schedule.main}</span><small>{schedule.sub}</small></div>
                <div className="writer-webinars-cell" data-label="Registration"><span>{number(item.total_registrations)} registered</span><small>{item.registration_mode === 'paid' ? `Paid: $${Number(item.ticket_price_usd || 0).toFixed(2)}` : 'Free access'}</small></div>
                <div className="writer-webinars-cell" data-label="Status"><span className={`writer-webinars-status ${status}`}><i />{status}</span></div>
                <div className="writer-webinars-actions">
                  <button type="button" disabled={disabled} onClick={() => navigate(`/writer/webinars/${item.id}`)}>{nextAction(item)}</button>
                  <button className="icon" type="button" aria-label={`Actions for ${item.title}`} onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}><MoreHorizontal size={17} /></button>
                  {openMenu === item.id ? <div className="writer-webinars-menu">
                    <button type="button" onClick={() => navigate(`/writer/webinars/${item.id}`)}>Manage</button>
                    <button type="button" onClick={() => setNotice('Webinar registrations are being built next.')}>Registrations</button>
                    <button type="button" onClick={() => setNotice('Webinar analytics is being built next.')}>Analytics</button>
                    {item.creator_state?.can_return_to_draft ? <button type="button" disabled={busyId === item.id} onClick={() => lifecycle(item, 'draft')}>Return to draft</button> : null}
                    {item.creator_state?.can_archive ? <button className="danger" type="button" disabled={busyId === item.id} onClick={() => lifecycle(item, 'archive')}><Archive size={14} /> Archive</button> : null}
                  </div> : null}
                </div>
              </article>
            );
          }) : <div className="writer-webinars-state"><CalendarDays size={24} /><strong>{webinars.length ? 'No webinars match this view' : 'No webinars yet'}</strong><span>{webinars.length ? 'Change the filter or search term.' : 'Create your first professional webinar.'}</span></div>}
        </section>
      )}
    </div>
  );
}