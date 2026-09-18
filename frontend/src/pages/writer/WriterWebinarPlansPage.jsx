import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, CreditCard, Gauge, HardDrive, LoaderCircle, RefreshCw, Users, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './WriterWebinarPlansPage.css';

function bytes(value) {
  if (value === null || value === undefined) return 'Unlimited';
  const amount = Number(value || 0);
  if (!amount) return '0 B';
  const units = ['B','KB','MB','GB','TB'];
  const index = Math.min(Math.floor(Math.log(amount) / Math.log(1024)), units.length - 1);
  return `${(amount / (1024 ** index)).toFixed(index > 2 ? 1 : 0)} ${units[index]}`;
}
function count(value, suffix = '') { return value === null || value === undefined ? 'Unlimited' : `${Number(value).toLocaleString()}${suffix}`; }
function duration(value) {
  if (value === null || value === undefined) return 'Unlimited';
  const hours = Number(value || 0) / 3600;
  return hours >= 1 ? `${hours.toFixed(hours % 1 ? 1 : 0)} hours` : `${Math.round(Number(value || 0) / 60)} minutes`;
}
function providerName(value) { return value === 'paypal' ? 'PayPal' : value ? value[0].toUpperCase() + value.slice(1) : 'Payment'; }
function formatDate(value) { if (!value) return '-'; const date = new Date(value); return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'}); }

export default function WriterWebinarPlansPage() {
  const navigate = useNavigate();
  const [plans,setPlans] = useState([]);
  const [overview,setOverview] = useState(null);
  const [gateways,setGateways] = useState([]);
  const [provider,setProvider] = useState('');
  const [loading,setLoading] = useState(true);
  const [refreshing,setRefreshing] = useState(false);
  const [busyPlan,setBusyPlan] = useState('');
  const [error,setError] = useState('');

  async function load(refresh = false) {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const [plansResponse,overviewResponse,checkoutResponse] = await Promise.all([
        api.get('/api/writer/webinar-subscription/plans'),
        api.get('/api/writer/webinar-subscription/me'),
        api.get('/api/writer/webinar-subscription/checkout/options'),
      ]);
      const nextGateways = Array.isArray(checkoutResponse?.data?.gateways) ? checkoutResponse.data.gateways : [];
      setPlans(Array.isArray(plansResponse?.data?.plans) ? plansResponse.data.plans : []);
      setOverview(overviewResponse?.data || null);
      setGateways(nextGateways);
      setProvider((current) => nextGateways.some((item) => item.provider === current) ? current : (nextGateways[0]?.provider || ''));
    } catch (requestError) { setError(requestError?.response?.data?.message || 'Failed to load webinar plans.'); }
    finally { setLoading(false); setRefreshing(false); }
  }
  useEffect(() => { load(); }, []);
  const subscription = overview?.subscription || null;
  const currentPlanId = useMemo(() => String(subscription?.plan?.id || ''),[subscription]);

  async function buy(plan) {
    if (!provider || busyPlan) return;
    setBusyPlan(String(plan.id)); setError('');
    try {
      const { data } = await api.post('/api/writer/webinar-subscription/checkout/initialize',{plan_id:plan.id,provider});
      if (!data?.checkout_url) throw new Error('Payment gateway did not return a checkout URL.');
      window.location.assign(data.checkout_url);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError?.message || 'Failed to open webinar plan checkout.');
      setBusyPlan('');
    }
  }

  if (loading) return <div className="wwp-state"><LoaderCircle className="wwp-spin" size={23}/>Loading webinar plans...</div>;
  return <div className="wwp-page">
    <header className="wwp-head"><div><h1>Webinar Plans</h1><p>Choose the capacity and usage limits that match your webinar program.</p></div><div><button className="secondary" onClick={() => navigate('/writer/webinars')}><ArrowLeft size={15}/>My Webinars</button><button className="secondary icon" aria-label="Refresh plans" disabled={refreshing} onClick={() => load(true)}><RefreshCw size={15}/></button></div></header>
    {error ? <div className="wwp-alert" role="alert">{error}</div> : null}
    <section className="wwp-current"><div><span>Current webinar plan</span><strong>{subscription?.plan?.name || 'No active plan'}</strong><small>{subscription ? `${formatDate(subscription.current_period_start)} - ${formatDate(subscription.current_period_end)}` : 'Select a plan below to activate webinar creation.'}</small></div><div><span>Status</span><strong className={subscription ? 'active' : ''}>{subscription?.status || 'Inactive'}</strong></div><div><span>Amount paid</span><strong>${Number(subscription?.amount_paid_usd || 0).toFixed(2)}</strong></div><div><span>Provider</span><strong>{subscription?.provider ? providerName(subscription.provider) : '-'}</strong></div></section>
    <section className="wwp-payment"><div><CreditCard size={18}/><span><strong>Payment method</strong><small>Select an enabled secure gateway before choosing a plan.</small></span></div><div className="wwp-gateways">{gateways.length ? gateways.map((gateway) => <button key={gateway.provider} className={provider === gateway.provider ? 'active' : ''} onClick={() => setProvider(gateway.provider)}>{providerName(gateway.provider)}</button>) : <span>No payment gateway is currently enabled.</span>}</div></section>
    <section className="wwp-plans">{plans.length ? plans.map((plan,index) => {
      const current = currentPlanId === String(plan.id) && subscription?.status === 'active';
      const features = plan.features && typeof plan.features === 'object' ? Object.values(plan.features).filter((item) => typeof item === 'string').slice(0,3) : [];
      return <article key={plan.id} className={current ? 'current' : ''}><div className="wwp-plan-top"><div><span>{index === 1 ? 'Popular plan' : 'Webinar plan'}</span><h2>{plan.name}</h2></div>{current ? <b>Current</b> : null}</div><div className="wwp-price"><strong>${Number(plan.price_usd || 0).toFixed(2)}</strong><span>/ {String(plan.billing_cycle || 'monthly').toLowerCase()}</span></div><div className="wwp-features"><div><Video size={15}/><span><strong>{count(plan.max_webinars)}</strong> webinars</span></div><div><Users size={15}/><span><strong>{count(plan.max_concurrent_attendees)}</strong> concurrent attendees</span></div><div><HardDrive size={15}/><span><strong>{bytes(plan.storage_limit_bytes)}</strong> storage</span></div><div><Gauge size={15}/><span><strong>{duration(plan.monthly_playback_seconds_limit)}</strong> attendee-hours</span></div><div><Check size={15}/><span><strong>{duration(plan.max_video_duration_seconds)}</strong> maximum video</span></div>{features.map((feature) => <div key={feature}><Check size={15}/><span>{feature}</span></div>)}</div><button className="primary" disabled={current || !provider || !!busyPlan} onClick={() => buy(plan)}>{current ? 'Current Plan' : busyPlan === String(plan.id) ? 'Opening checkout...' : provider ? `Choose with ${providerName(provider)}` : 'Select payment method'}</button></article>;
    }) : <div className="wwp-empty">No active webinar plans are available.</div>}</section>
    <footer className="wwp-foot"><Check size={14}/>Your plan activates only after the payment gateway verifies the payment.</footer>
  </div>;
}