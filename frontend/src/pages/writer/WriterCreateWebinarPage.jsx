import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, LockKeyhole } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './WriterCreateWebinarPage.css';

const INITIAL = { writer_page_id: '', title: '', description: '', webinar_type: 'evergreen', visibility: 'public', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', date: '', time: '', registration_mode: 'free', ticket_price_usd: '', allow_registration: true, allow_chat: true };
const STEPS = ['Webinar details', 'Schedule', 'Registration', 'Review'];

export default function WriterCreateWebinarPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [step, setStep] = useState(0);
  const [pages, setPages] = useState([]);
  const [capabilities, setCapabilities] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([api.get('/api/writer/pages'), api.get('/api/writer/webinars/creator/capabilities')])
      .then(([pagesResponse, capabilityResponse]) => {
        if (!active) return;
        const items = pagesResponse?.data?.pages || pagesResponse?.data?.writer_pages || [];
        const usable = Array.isArray(items) ? items.filter((item) => String(item.status || 'active') === 'active') : [];
        setPages(usable);
        setCapabilities(capabilityResponse?.data || null);
        if (usable.length) setForm((current) => ({ ...current, writer_page_id: String(usable.find((item) => item.is_primary)?.id || usable[0].id) }));
      })
      .catch((err) => setError(err?.response?.data?.message || err?.message || 'Failed to load webinar setup.'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const entitlement = capabilities?.entitlement;
  const canCreate = entitlement?.can_create === true;
  const types = useMemo(() => {
    const supported = capabilities?.creator?.publishable_webinar_types;
    return Array.isArray(supported) && supported.length ? supported.filter((type) => ['prerecorded', 'evergreen', 'hybrid'].includes(type)) : ['prerecorded', 'evergreen', 'hybrid'];
  }, [capabilities]);

  function update(name, value) { setForm((current) => ({ ...current, [name]: value })); setError(''); }
  function validate(index) {
    if (index === 0 && (!form.writer_page_id || !form.title.trim())) return 'Writer Page and webinar title are required.';
    if (index === 1 && ((form.date && !form.time) || (!form.date && form.time))) return 'Choose both the start date and start time.';
    if (index === 2 && form.registration_mode === 'paid' && !(Number(form.ticket_price_usd) > 0)) return 'Enter a valid positive ticket price.';
    return '';
  }
  function next() { const message = validate(step); if (message) { setError(message); return; } setStep((current) => Math.min(current + 1, STEPS.length - 1)); }
  function previous() { setError(''); setStep((current) => Math.max(current - 1, 0)); }

  async function submit(event) {
    event.preventDefault();
    for (let index = 0; index < 3; index += 1) { const message = validate(index); if (message) { setStep(index); setError(message); return; } }
    if (!canCreate) { setError('An active webinar plan with available capacity is required.'); return; }
    setSaving(true); setError('');
    try {
      const scheduled = form.date && form.time ? new Date(`${form.date}T${form.time}`).toISOString() : null;
      const { data } = await api.post('/api/writer/webinars', {
        writer_page_id: Number(form.writer_page_id), title: form.title.trim(), description: form.description.trim() || null,
        webinar_type: form.webinar_type, visibility: form.visibility, timezone: form.timezone,
        scheduled_start_at: scheduled, registration_mode: form.registration_mode,
        ticket_price_usd: form.registration_mode === 'paid' ? form.ticket_price_usd : '0.00',
      });
      if (data?.webinar_id && (!form.allow_registration || !form.allow_chat)) {
        await api.patch(`/api/writer/webinars/${data.webinar_id}`, {
          allow_registration: form.allow_registration,
          allow_chat: form.allow_chat,
        });
      }
      navigate(`/writer/webinars/${data.webinar_id}`, { replace: true });
    } catch (err) { setError(err?.response?.data?.message || err?.message || 'Failed to create webinar draft.'); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="writer-create-webinar-state"><span />Loading webinar setup...</div>;

  return <div className="writer-create-webinar-page">
    <header className="writer-create-webinar-head"><div><h1>Create Webinar</h1><p>Set up the core details. Your webinar begins as a draft.</p></div><button type="button" onClick={() => navigate('/writer/webinars')}><ArrowLeft size={15}/>My Webinars</button></header>
    {!canCreate ? <div className="writer-create-webinar-plan"><LockKeyhole size={18}/><div><strong>Webinar plan required</strong><span>{entitlement?.reason === 'webinar_limit_reached' ? 'Your webinar limit has been reached.' : 'Activate a webinar plan with available capacity before creating a webinar.'}</span></div></div> : null}
    {error ? <div className="writer-create-webinar-alert" role="alert">{error}</div> : null}
    <form className="writer-create-webinar-builder" onSubmit={submit}>
      <nav className="writer-create-webinar-steps" aria-label="Webinar setup steps">{STEPS.map((label,index)=><button key={label} type="button" className={`${index===step?'active ':''}${index<step?'complete':''}`} onClick={()=>{if(index<=step)setStep(index);}}><i>{index<step?<Check size={13}/>:index+1}</i><span>{label}</span></button>)}</nav>
      <section className="writer-create-webinar-form">
        {step===0?<><h2>Webinar details</h2><p>Choose where the webinar belongs and how attendees will experience it.</p><div className="writer-create-webinar-grid">
          <label className="full">Writer Page<select value={form.writer_page_id} onChange={(e)=>update('writer_page_id',e.target.value)}><option value="">Choose Writer Page</option>{pages.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="full">Webinar title<input maxLength="255" value={form.title} onChange={(e)=>update('title',e.target.value)} placeholder="Enter a clear webinar title"/></label>
          <label className="full">Description<textarea maxLength="10000" value={form.description} onChange={(e)=>update('description',e.target.value)} placeholder="Describe what attendees will learn"/></label>
          <div className="full"><span className="field-label">Webinar type</span><div className="writer-create-webinar-types">{types.map((type)=><button key={type} type="button" className={form.webinar_type===type?'active':''} onClick={()=>update('webinar_type',type)}><strong>{type}</strong><span>{type==='prerecorded'?'Scheduled playback of an uploaded video':type==='evergreen'?'Reusable experience for ongoing registrations':'Recorded presentation with interactive chat and polls'}</span></button>)}</div></div>
          <label>Visibility<select value={form.visibility} onChange={(e)=>update('visibility',e.target.value)}><option value="public">Public</option><option value="unlisted">Unlisted</option><option value="private">Private</option></select></label>
          <label>Timezone<input value={form.timezone} onChange={(e)=>update('timezone',e.target.value)} placeholder="Africa/Lagos"/></label>
        </div></>:null}
        {step===1?<><h2>Schedule</h2><p>Schedule the webinar now, or leave both fields empty and finish scheduling later.</p><div className="writer-create-webinar-grid"><label>Start date<input type="date" value={form.date} onChange={(e)=>update('date',e.target.value)}/></label><label>Start time<input type="time" value={form.time} onChange={(e)=>update('time',e.target.value)}/></label><div className="writer-create-webinar-note full">Times are saved using <strong>{form.timezone}</strong>.</div></div></>:null}
        {step===2?<><h2>Registration</h2><p>Choose free or paid access and control attendee participation.</p><div className="writer-create-webinar-grid"><label>Registration type<select value={form.registration_mode} onChange={(e)=>update('registration_mode',e.target.value)}><option value="free">Free webinar</option><option value="paid">Paid webinar</option></select></label>{form.registration_mode==='paid'?<label>Ticket price (USD)<input type="number" min="0.01" step="0.01" value={form.ticket_price_usd} onChange={(e)=>update('ticket_price_usd',e.target.value)}/></label>:<div/>}<label className="writer-create-webinar-toggle full"><input type="checkbox" checked={form.allow_registration} onChange={(e)=>update('allow_registration',e.target.checked)}/><span><strong>Allow registration</strong><small>Attendees can register through the public webinar page.</small></span></label><label className="writer-create-webinar-toggle full"><input type="checkbox" checked={form.allow_chat} onChange={(e)=>update('allow_chat',e.target.checked)}/><span><strong>Enable attendee chat</strong><small>Chat becomes available inside the webinar room.</small></span></label></div></>:null}
        {step===3?<><h2>Review</h2><p>Confirm the webinar details before creating the draft.</p><dl className="writer-create-webinar-review"><div><dt>Title</dt><dd>{form.title}</dd></div><div><dt>Writer Page</dt><dd>{pages.find((item)=>String(item.id)===form.writer_page_id)?.name||'-'}</dd></div><div><dt>Type</dt><dd>{form.webinar_type}</dd></div><div><dt>Visibility</dt><dd>{form.visibility}</dd></div><div><dt>Schedule</dt><dd>{form.date&&form.time?`${form.date} at ${form.time} (${form.timezone})`:'Schedule later'}</dd></div><div><dt>Registration</dt><dd>{form.registration_mode==='paid'?`Paid - $${Number(form.ticket_price_usd||0).toFixed(2)}`:'Free'}</dd></div></dl><div className="writer-create-webinar-note">After creating the draft, the next setup page will handle MP4 video upload, processing and publishing.</div></>:null}
        <footer><button className="secondary" type="button" onClick={step?previous:()=>navigate('/writer/webinars')}>{step?'Back':'Cancel'}</button>{step<STEPS.length-1?<button className="primary" type="button" onClick={next}>Continue<ChevronRight size={15}/></button>:<button className="primary" type="submit" disabled={saving||!canCreate}>{saving?'Creating...':'Create Webinar Draft'}</button>}</footer>
      </section>
    </form>
  </div>;
}