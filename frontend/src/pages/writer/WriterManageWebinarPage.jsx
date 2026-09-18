import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Archive, BarChart3, Check, LoaderCircle, Play, RefreshCw, Send, Upload, Users, Video } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import './WriterManageWebinarPage.css';

const TABS=['overview','media','registration','room','attendees','analytics'];
function dateParts(value){if(!value)return{date:'',time:''};const d=new Date(value);if(Number.isNaN(d.getTime()))return{date:'',time:''};const pad=(n)=>String(n).padStart(2,'0');return{date:`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,time:`${pad(d.getHours())}:${pad(d.getMinutes())}`};}
function status(value){return String(value||'draft').replaceAll('_',' ');}
function formatBytes(value){const bytes=Number(value||0);if(!bytes)return '0 B';const units=['B','KB','MB','GB'];const index=Math.min(Math.floor(Math.log(bytes)/Math.log(1024)),units.length-1);const amount=bytes/Math.pow(1024,index);return `${amount>=10||index===0?amount.toFixed(0):amount.toFixed(1)} ${units[index]}`;}
function mediaStageLabel(media){const stage=String(media?.processing_stage||media?.status||'').replaceAll('_',' ');return stage||'No video uploaded';}

export default function WriterManageWebinarPage(){
 const {id}=useParams();const navigate=useNavigate();const fileRef=useRef(null);
 const [webinar,setWebinar]=useState(null);const [form,setForm]=useState(null);const [tab,setTab]=useState('overview');const [registrations,setRegistrations]=useState(null);const [analytics,setAnalytics]=useState(null);const [loading,setLoading]=useState(true);const [busy,setBusy]=useState('');const [error,setError]=useState('');const [notice,setNotice]=useState('');
 const [uploadProgress,setUploadProgress]=useState(null);
 const load=useCallback(async()=>{setError('');try{const {data}=await api.get(`/api/writer/webinars/${id}`,{params:{_fresh:Date.now()},headers:{'Cache-Control':'no-cache','Pragma':'no-cache'}});const item=data?.webinar;if(!item)throw new Error('Webinar not found.');const parts=dateParts(item.scheduled_start_at);setWebinar(item);setForm({writer_page_id:item.writer_page_id,title:item.title||'',description:item.description||'',webinar_type:item.webinar_type||'evergreen',visibility:item.visibility||'public',timezone:item.timezone||'UTC',date:parts.date,time:parts.time,registration_mode:item.registration_mode||'free',ticket_price_usd:item.ticket_price_usd||'',allow_registration:Number(item.allow_registration)===1,allow_chat:Number(item.allow_chat)===1});}catch(err){setError(err?.response?.data?.message||err?.message||'Failed to load webinar.');}finally{setLoading(false);}},[id]);
 useEffect(()=>{load();},[load]);
 useEffect(()=>{if(tab==='attendees'&&!registrations){api.get(`/api/writer/webinars/${id}/registrations`).then(({data})=>setRegistrations(data)).catch(err=>setError(err?.response?.data?.message||'Failed to load registrations.'));}if(tab==='analytics'&&!analytics){api.get(`/api/writer/webinars/${id}/analytics`).then(({data})=>setAnalytics(data?.analytics||{})).catch(err=>setError(err?.response?.data?.message||'Failed to load analytics.'));}},[tab,id,registrations,analytics]);
 const creator=webinar?.creator_state||{};const media=webinar?.media;const session=webinar?.session;const stats=webinar?.stats||{};
 const mediaIsProcessing=['queued','processing'].includes(String(media?.status||''));
 useEffect(()=>{if(!mediaIsProcessing)return undefined;const timer=window.setInterval(()=>{load();},4000);return()=>window.clearInterval(timer);},[mediaIsProcessing,load]);
 // WEBINAR_UPLOAD_99_PROCESSING_DUPLICATE_FIX_V1
 const readiness=useMemo(()=>[{label:'Webinar details',ok:Boolean(form?.title)},{label:'Schedule',ok:Boolean(form?.date&&form?.time)},{label:'MP4 video',ok:media?.status==='ready'},{label:'Registration',ok:Boolean(form?.allow_registration)},{label:'Chat',ok:Boolean(form?.allow_chat)}],[form,media]);
 function update(name,value){setForm(current=>({...current,[name]:value}));setError('');setNotice('');}
 async function save(){setBusy('save');setError('');setNotice('');try{const scheduled=form.date&&form.time?new Date(`${form.date}T${form.time}`).toISOString():null;const {data}=await api.patch(`/api/writer/webinars/${id}`,{writer_page_id:Number(form.writer_page_id),title:form.title.trim(),description:form.description.trim()||null,webinar_type:form.webinar_type,visibility:form.visibility,timezone:form.timezone,scheduled_start_at:scheduled,registration_mode:form.registration_mode,ticket_price_usd:form.registration_mode==='paid'?form.ticket_price_usd:'0.00',allow_registration:form.allow_registration,allow_chat:form.allow_chat});setNotice(data?.message||'Webinar updated.');await load();}catch(err){setError(err?.response?.data?.message||err?.message||'Failed to update webinar.');}finally{setBusy('');}}
 async function lifecycle(action){if(action==='archive'&&!window.confirm('Archive this webinar?'))return;setBusy(action);setError('');try{const {data}=await api.post(`/api/writer/webinars/${id}/${action}`);setNotice(data?.message||'Webinar updated.');await load();}catch(err){setError(err?.response?.data?.message||err?.message||'Webinar action failed.');}finally{setBusy('');}}
 // BLOGGAD_DIRECT_MULTIPART_UPLOAD_V1
 async function upload(){
  const file=fileRef.current?.files?.[0];
  if(!file){setError('Choose an MP4 video first.');return;}
  if(mediaIsProcessing){setError('This webinar already has a video queued or processing. Wait for it to finish before uploading another file.');return;}
  if(file.type!=='video/mp4'&&!file.name.toLowerCase().endsWith('.mp4')){setError('Only MP4 webinar videos are supported.');return;}

  setBusy('upload');setError('');setNotice('');
  setUploadProgress({percent:0,loaded:0,total:file.size,fileName:file.name,phase:'uploading'});

  let uploadSession=null;
  const partProgress=new Map();
  const updateProgress=()=>{
   const loaded=Math.min(file.size,Array.from(partProgress.values()).reduce((sum,value)=>sum+Number(value||0),0));
   const percent=file.size>0?Math.min(99,Math.round((loaded/file.size)*100)):0;
   setUploadProgress({percent,loaded,total:file.size,fileName:file.name,phase:'uploading'});
  };
  const putPart=(url,blob,partNumber)=>new Promise((resolve,reject)=>{
   const request=new XMLHttpRequest();
   request.open('PUT',url,true);
   request.upload.onprogress=(event)=>{partProgress.set(partNumber,Number(event.loaded||0));updateProgress();};
   request.onerror=()=>reject(new Error(`Network error while uploading part ${partNumber}.`));
   request.onabort=()=>reject(new Error(`Upload part ${partNumber} was aborted.`));
   request.onload=()=>{
    if(request.status<200||request.status>=300){reject(new Error(`Upload part ${partNumber} failed with status ${request.status}.`));return;}
    const etag=request.getResponseHeader('ETag');
    if(!etag){reject(new Error(`Amazon S3 did not return an ETag for part ${partNumber}.`));return;}
    partProgress.set(partNumber,blob.size);updateProgress();resolve({part_number:partNumber,etag});
   };
   request.send(blob);
  });

  try{
   const {data:init}=await api.post(`/api/writer/webinars/${id}/video/multipart/initiate`,{filename:file.name,content_type:file.type||'video/mp4',size:file.size});
   uploadSession=init;
   const partSize=Number(init?.part_size||16*1024*1024);
   const partCount=Math.ceil(file.size/partSize);
   const completed=new Array(partCount);
   let nextPart=0;

   const worker=async()=>{
    while(true){
     const index=nextPart++;
     if(index>=partCount)return;
     const partNumber=index+1;
     const start=index*partSize;
     const blob=file.slice(start,Math.min(file.size,start+partSize));
     let lastError=null;
     for(let attempt=1;attempt<=3;attempt+=1){
      try{
       const {data:signed}=await api.post(`/api/writer/webinars/${id}/video/multipart/sign-part`,{upload_id:init.upload_id,key:init.key,part_number:partNumber});
       completed[index]=await putPart(signed.url,blob,partNumber);
       lastError=null;
       break;
      }catch(error){
       lastError=error;
       partProgress.set(partNumber,0);updateProgress();
      }
     }
     if(lastError)throw lastError;
    }
   };

   await Promise.all(Array.from({length:Math.min(4,partCount)},()=>worker()));
   setUploadProgress({percent:100,loaded:file.size,total:file.size,fileName:file.name,phase:'waiting'});

   const {data}=await api.post(`/api/writer/webinars/${id}/video/multipart/complete`,{upload_id:init.upload_id,key:init.key,filename:file.name,content_type:file.type||'video/mp4',size:file.size,parts:completed});
   setUploadProgress({percent:100,loaded:file.size,total:file.size,fileName:file.name,phase:'processing'});
   setNotice(data?.message||'Upload confirmed. MediaConvert processing has started.');
   if(fileRef.current)fileRef.current.value='';
   await load();
  }catch(err){
   if(uploadSession?.upload_id&&uploadSession?.key){
    try{await api.post(`/api/writer/webinars/${id}/video/multipart/abort`,{upload_id:uploadSession.upload_id,key:uploadSession.key});}catch{}
   }
   setUploadProgress(current=>current?{...current,phase:'failed'}:null);
   setError(err?.response?.data?.message||err?.message||'Video upload failed.');
  }finally{setBusy('');}
 }
 // WEBINAR_UPLOAD_CONFIRMATION_CACHE_RECOVERY_V1
 async function retry(){setBusy('retry');try{const {data}=await api.post(`/api/writer/webinars/${id}/media/${media.id||media.media_job_id}/retry`);setNotice(data?.message||'Video retry queued.');await load();}catch(err){setError(err?.response?.data?.message||'Retry failed.');}finally{setBusy('');}}
 async function roomAction(action){setBusy(action);try{if(action==='open'){await api.post(`/api/writer/webinars/${id}/room/open`,session?.id?{session_id:session.id}:{});}else{await api.post(`/api/writer/webinars/${id}/sessions/${session.id}/end`);}setNotice(action==='open'?'Webinar room opened.':'Webinar room ended.');await load();}catch(err){setError(err?.response?.data?.message||`Failed to ${action} room.`);}finally{setBusy('');}}
 if(loading)return <div className="wmw-state"><LoaderCircle size={20}/>Loading webinar...</div>;
 if(!webinar||!form)return <div className="wmw-state error">{error||'Webinar not found.'}<button onClick={()=>navigate('/writer/webinars')}>My Webinars</button></div>;
 return <div className="wmw-page"><header className="wmw-head"><div><h1>{webinar.title}</h1><p>{webinar.writer_page_name||'Writer Page'} - {status(webinar.webinar_type)} - Last updated {new Date(webinar.updated_at||Date.now()).toLocaleString()}</p></div><div className="wmw-head-actions"><button className="secondary" onClick={()=>navigate('/writer/webinars')}><ArrowLeft size={15}/>My Webinars</button>{creator.can_publish?<button className="primary" disabled={busy} onClick={()=>lifecycle('publish')}><Send size={15}/>Publish</button>:null}</div></header>
 {error?<div className="wmw-alert error" role="alert">{error}</div>:null}{notice?<div className="wmw-alert success" role="status">{notice}</div>:null}
 <section className="wmw-summary"><div><span>Webinar status</span><strong className="pill">{status(webinar.status)}</strong></div><div><span>Registrations</span><strong>{Number(stats.total_registrations||0).toLocaleString()}</strong></div><div><span>Attendees</span><strong>{Number(stats.total_attendees||0).toLocaleString()}</strong></div><div><span>Media status</span><strong>{status(media?.status||'not uploaded')}</strong></div></section>
 <nav className="wmw-tabs">{TABS.map(name=><button key={name} className={tab===name?'active':''} onClick={()=>setTab(name)}>{name}</button>)}</nav>
 <div className="wmw-workspace"><section className="wmw-panel main">
 {tab==='overview'?<><h2>Webinar overview</h2><p>Edit the core details and schedule.</p><div className="wmw-grid"><label className="full">Webinar title<input value={form.title} onChange={e=>update('title',e.target.value)}/></label><label className="full">Description<textarea value={form.description} onChange={e=>update('description',e.target.value)}/></label><label>Webinar type<select value={form.webinar_type} onChange={e=>update('webinar_type',e.target.value)}><option value="prerecorded">Prerecorded</option><option value="evergreen">Evergreen</option><option value="hybrid">Hybrid</option></select></label><label>Visibility<select value={form.visibility} onChange={e=>update('visibility',e.target.value)}><option value="public">Public</option><option value="unlisted">Unlisted</option><option value="private">Private</option></select></label><label>Start date<input type="date" value={form.date} onChange={e=>update('date',e.target.value)}/></label><label>Start time<input type="time" value={form.time} onChange={e=>update('time',e.target.value)}/></label><label className="full">Timezone<input value={form.timezone} onChange={e=>update('timezone',e.target.value)}/></label></div><div className="wmw-save"><button className="primary" disabled={busy||!creator.can_edit} onClick={save}>{busy==='save'?'Saving...':'Save Changes'}</button></div></>:null}
 {tab==='media'?<><h2>Webinar media</h2><p>Upload one MP4 video. Processing status updates automatically.</p><div className="wmw-video">{media?.playback_url?<video controls src={media.playback_url}/>:<><Video size={30}/><strong>{media?mediaStageLabel(media):'No video uploaded'}</strong>{media?.error_message?<span>{media.error_message}</span>:null}</>}</div><div className="wmw-upload"><input ref={fileRef} type="file" accept="video/mp4,.mp4" disabled={busy==='upload'||mediaIsProcessing}/><button className="primary" onClick={upload} disabled={busy||mediaIsProcessing||!creator.can_upload_video}><Upload size={15}/>{busy==='upload'?(uploadProgress?.phase==='waiting'?'Confirming upload...':`${uploadProgress?.percent||0}% uploaded`):mediaIsProcessing?'Processing video':'Upload MP4'}</button>{media?.status==='failed'?<button className="secondary" onClick={retry} disabled={busy}><RefreshCw size={15}/>Retry</button>:null}</div>{uploadProgress?<div className={`wmw-upload-progress ${uploadProgress.phase}`} role="status" aria-live="polite"><div className="wmw-upload-progress-head"><div><strong>{uploadProgress.phase==='uploading'?`Uploading ${uploadProgress.percent}%`:uploadProgress.phase==='waiting'?'100% uploaded - waiting for Bloggad confirmation':uploadProgress.phase==='processing'?'Upload confirmed - preparing HLS playback':'Upload failed'}</strong><span>{uploadProgress.fileName}</span></div><b>{uploadProgress.percent}%</b></div><div className="wmw-upload-progress-track" role="progressbar" aria-label="Video upload progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={uploadProgress.percent}><i style={{width:`${uploadProgress.percent}%`}}/></div><div className="wmw-upload-progress-meta"><span>{formatBytes(uploadProgress.loaded)} of {formatBytes(uploadProgress.total)}</span><span>{uploadProgress.phase==='uploading'?'Keep this page open until the upload reaches 100%.':uploadProgress.phase==='waiting'?'The file has been sent. Bloggad is confirming storage and creating the media job.':uploadProgress.phase==='processing'?'HLS processing continues automatically. This page checks the status every 4 seconds.':'Choose the file and try again.'}</span></div></div>:null}{mediaIsProcessing&&!uploadProgress?<div className="wmw-media-processing" role="status"><LoaderCircle size={17}/><div><strong>{mediaStageLabel(media)}</strong><span>{Number(media.progress_percent||0)}% complete. Status refreshes automatically every 4 seconds.</span><div className="wmw-stage-track"><i style={{width:`${Number(media.progress_percent||0)}%`}}/></div></div></div>:null}</>:null}
 {tab==='registration'?<><h2>Registration settings</h2><p>Pricing locks after the first registration.</p><div className="wmw-grid"><label>Registration type<select value={form.registration_mode} onChange={e=>update('registration_mode',e.target.value)}><option value="free">Free</option><option value="paid">Paid</option></select></label>{form.registration_mode==='paid'?<label>Ticket price (USD)<input type="number" min="0.01" step="0.01" value={form.ticket_price_usd} onChange={e=>update('ticket_price_usd',e.target.value)}/></label>:<div/>}<label className="toggle full"><input type="checkbox" checked={form.allow_registration} onChange={e=>update('allow_registration',e.target.checked)}/><span><strong>Allow registration</strong><small>Accept registrations on the public page.</small></span></label><label className="toggle full"><input type="checkbox" checked={form.allow_chat} onChange={e=>update('allow_chat',e.target.checked)}/><span><strong>Enable chat</strong><small>Allow attendee chat in the room.</small></span></label></div><div className="wmw-save"><button className="primary" onClick={save} disabled={busy||!creator.can_edit}>Save Settings</button></div></>:null}
 {tab==='room'?<><h2>Webinar room</h2><p>Open the interactive room when the webinar is ready.</p><div className="wmw-room"><Play size={25}/><div><strong>{session?status(session.status):'Room not opened'}</strong><span>{session?.scheduled_start_at?new Date(session.scheduled_start_at).toLocaleString():'No active session'}</span></div></div><div className="wmw-save">{session&&['open','live'].includes(session.status)?<button className="danger" disabled={busy} onClick={()=>roomAction('end')}>End Room</button>:<button className="primary" disabled={busy||!media||media.status!=='ready'} onClick={()=>navigate(`/writer/webinars/${id}/room`)}>Open Host Room</button>}</div></>:null}
 {tab==='attendees'?<><h2>Registrations</h2><p>Confirmed, paid and attendance information from this webinar.</p><div className="wmw-mini-stats"><div><span>Total</span><strong>{registrations?.summary?.total_registrations||0}</strong></div><div><span>Confirmed</span><strong>{registrations?.summary?.confirmed_registrations||0}</strong></div><div><span>Paid</span><strong>{registrations?.summary?.paid_registrations||0}</strong></div></div><div className="wmw-list">{registrations?.registrations?.length?registrations.registrations.slice(0,8).map(item=><div key={item.id}><span>{item.name||item.email||`Registrant ${item.id}`}</span><strong>{status(item.status)}</strong></div>):<div className="empty"><Users size={22}/>No registrations yet.</div>}</div></>:null}
 {tab==='analytics'?<><h2>Webinar analytics</h2><p>Real performance data generated from registrations and attendance.</p><div className="wmw-analytics"><BarChart3 size={32}/><strong>{analytics?'Analytics loaded':'Loading analytics...'}</strong><span>{analytics?'Detailed charts will use the verified analytics response.':'Please wait.'}</span></div></>:null}
 </section><aside className="wmw-panel side"><h2>Setup progress</h2><p>Required items before publishing.</p><div className="wmw-readiness">{readiness.map(item=><div key={item.label}><span>{item.label}</span><strong className={item.ok?'ok':''}>{item.ok?<><Check size={13}/>Ready</>:'Required'}</strong></div>)}</div><div className="wmw-side-actions">{creator.can_return_to_draft?<button className="secondary" disabled={busy} onClick={()=>lifecycle('draft')}>Return to Draft</button>:null}{creator.can_archive?<button className="danger" disabled={busy} onClick={()=>lifecycle('archive')}><Archive size={14}/>Archive</button>:null}</div></aside></div></div>;
}