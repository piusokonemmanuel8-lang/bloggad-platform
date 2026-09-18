import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, Clock3, CreditCard, LoaderCircle, LockKeyhole, Mail, Ticket, UserRound, Video } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import './PublicWebinarRegistrationPage.css';

function readable(value) {
  return String(value || '').replaceAll('_', ' ');
}

function formatSchedule(value, timezone) {
  if (!value) return 'Schedule to be announced';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Schedule to be announced';
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
      ...(timezone ? { timeZone: timezone } : {}),
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

function gatewayName(gateway) {
  return gateway?.display_name || gateway?.name || readable(gateway?.provider || gateway?.code);
}

export default function PublicWebinarRegistrationPage() {
  const { writerPageSlug, webinarSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [webinar, setWebinar] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [gateways, setGateways] = useState([]);
  const [provider, setProvider] = useState('');
  const [form, setForm] = useState({ attendee_name: '', attendee_email: '' });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const registrationToken = registration?.registration_token || searchParams.get('registration_token') || '';
  const paymentState = searchParams.get('registration_payment') || '';

  const loadRegistration = useCallback(async (token) => {
    if (!token) return;
    const { data } = await api.get(`/api/public/webinars/registrations/${encodeURIComponent(token)}`);
    setRegistration(data?.registration || null);
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/api/public/webinars/${encodeURIComponent(writerPageSlug)}/${encodeURIComponent(webinarSlug)}`);
        if (!active) return;
        setWebinar(data?.webinar || null);
        const token = searchParams.get('registration_token');
        if (token) await loadRegistration(token);
        if (data?.webinar?.registration_mode === 'paid') {
          const options = await api.get('/api/public/webinars/checkout/options');
          if (!active) return;
          const list = Array.isArray(options?.data?.gateways) ? options.data.gateways : [];
          setGateways(list.filter((item) => item?.enabled !== false));
          const first = list.find((item) => item?.enabled !== false);
          setProvider(first?.provider || first?.code || '');
        }
      } catch (requestError) {
        if (active) setError(requestError?.response?.data?.message || 'Unable to load this webinar.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [writerPageSlug, webinarSlug, loadRegistration, searchParams]);

  useEffect(() => {
    if (paymentState === 'paid') setNotice('Payment confirmed. Your webinar registration is ready.');
    if (paymentState === 'pending') setNotice('Your payment is being confirmed.');
    if (paymentState === 'cancelled') setError('Payment was cancelled. You can try again.');
    if (paymentState === 'failed') setError('Payment could not be confirmed. Please try again.');
  }, [paymentState]);

  const confirmed = useMemo(() => {
    if (!registration) return false;
    if (webinar?.registration_mode === 'paid') return registration.payment_status === 'paid' && registration.status === 'confirmed';
    return registration.status === 'confirmed';
  }, [registration, webinar]);

  async function register(event) {
    event.preventDefault();
    setBusy('register');
    setError('');
    setNotice('');
    try {
      const { data } = await api.post(`/api/public/webinars/${encodeURIComponent(writerPageSlug)}/${encodeURIComponent(webinarSlug)}/register`, {
        attendee_name: form.attendee_name.trim(),
        attendee_email: form.attendee_email.trim(),
        source: 'public_webinar',
      });
      const next = data?.registration;
      if (!next?.registration_token) throw new Error('Registration token was not returned.');
      setRegistration(next);
      const params = new URLSearchParams(searchParams);
      params.set('registration_token', next.registration_token);
      setSearchParams(params, { replace: true });
      setNotice(data?.requires_payment ? 'Registration saved. Complete payment to confirm your place.' : 'Registration confirmed. Your place is reserved.');
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError?.message || 'Registration failed.');
    } finally {
      setBusy('');
    }
  }

  async function checkout() {
    if (!registrationToken || !provider) return;
    setBusy('checkout');
    setError('');
    try {
      const { data } = await api.post(`/api/public/webinars/registrations/${encodeURIComponent(registrationToken)}/checkout/initialize`, { provider });
      if (!data?.checkout_url) throw new Error('Payment gateway did not return a checkout URL.');
      window.location.assign(data.checkout_url);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError?.message || 'Unable to open secure checkout.');
      setBusy('');
    }
  }

  if (loading) return <main className="pwr-state"><LoaderCircle className="spin" size={24}/><span>Loading webinar...</span></main>;
  if (!webinar) return <main className="pwr-state error"><Video size={30}/><h1>Webinar unavailable</h1><p>{error || 'This webinar could not be found.'}</p></main>;

  const paid = webinar.registration_mode === 'paid';
  const needsPayment = paid && registration && registration.payment_status !== 'paid';
  const schedule = formatSchedule(webinar.session?.scheduled_start_at || webinar.scheduled_start_at, webinar.timezone);

  return <main className="pwr-page">
    <section className="pwr-hero">
      <div className="pwr-brand"><span className="pwr-brand-mark">B</span><strong>Bloggad Webinars</strong></div>
      <div className="pwr-hero-content">
        <div className="pwr-copy">
          <span className="pwr-eyebrow"><Video size={14}/>{readable(webinar.webinar_type)} webinar</span>
          <h1>{webinar.title}</h1>
          <p>{webinar.description || 'Join this webinar experience and learn directly from the host.'}</p>
          <div className="pwr-meta">
            <div><CalendarDays size={17}/><span><small>Date and time</small><strong>{schedule}</strong></span></div>
            <div><UserRound size={17}/><span><small>Hosted by</small><strong>{webinar.writer_page?.name}</strong></span></div>
            <div><Ticket size={17}/><span><small>Access</small><strong>{paid ? `$${Number(webinar.ticket_price_usd || 0).toFixed(2)} ${webinar.ticket_currency_code || 'USD'}` : 'Free'}</strong></span></div>
          </div>
        </div>
        <aside className="pwr-card">
          {error ? <div className="pwr-alert error" role="alert">{error}</div> : null}
          {notice ? <div className="pwr-alert success" role="status">{notice}</div> : null}
          {confirmed ? <div className="pwr-confirmed"><span><Check size={24}/></span><h2>You are registered</h2><p>Your place is confirmed for this webinar.</p><div className="pwr-confirmed-row"><Mail size={15}/><span>{registration.attendee_email}</span></div><div className="pwr-confirmed-row"><Clock3 size={15}/><span>{schedule}</span></div></div> : needsPayment ? <div className="pwr-payment"><CreditCard size={24}/><h2>Complete payment</h2><p>Your registration is saved. Select a secure payment option.</p><div className="pwr-gateways">{gateways.map((item) => { const value = item.provider || item.code; return <button type="button" key={value} className={provider === value ? 'active' : ''} onClick={() => setProvider(value)}>{gatewayName(item)}</button>; })}</div><button className="pwr-primary" type="button" disabled={!provider || busy === 'checkout'} onClick={checkout}>{busy === 'checkout' ? 'Opening checkout...' : `Pay $${Number(webinar.ticket_price_usd || 0).toFixed(2)}`}</button><div className="pwr-secure"><LockKeyhole size={13}/>Secure payment processing</div></div> : <form onSubmit={register}><h2>Reserve your place</h2><p>{webinar.registration_open ? 'Enter your details to register.' : 'Registration is currently closed.'}</p><label>Full name<div><UserRound size={16}/><input required autoComplete="name" value={form.attendee_name} onChange={(event) => setForm((current) => ({ ...current, attendee_name: event.target.value }))} placeholder="Enter your full name"/></div></label><label>Email address<div><Mail size={16}/><input required type="email" autoComplete="email" value={form.attendee_email} onChange={(event) => setForm((current) => ({ ...current, attendee_email: event.target.value }))} placeholder="you@example.com"/></div></label><button className="pwr-primary" type="submit" disabled={!webinar.registration_open || busy === 'register'}>{busy === 'register' ? 'Registering...' : paid ? 'Continue to payment' : 'Register free'}</button><small className="pwr-consent">By registering, you agree to receive information about this webinar.</small></form>}
        </aside>
      </div>
    </section>
    <section className="pwr-trust"><div><Check size={16}/><span><strong>Simple registration</strong><small>Your details are used for webinar access.</small></span></div><div><LockKeyhole size={16}/><span><strong>Secure checkout</strong><small>Payments use configured Bloggad gateways.</small></span></div><div><Video size={16}/><span><strong>Professional experience</strong><small>Join from desktop or mobile.</small></span></div></section>
  </main>;
}