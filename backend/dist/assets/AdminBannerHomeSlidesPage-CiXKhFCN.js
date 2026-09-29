import{r as p,j as e,R as ae,d as ne,x as oe,V as O,a as j}from"./index-LXBBJt7I.js";import{C as le}from"./circle-alert-DsZo9igC.js";import{C as de}from"./circle-check-ml_0upGj.js";import{I as W}from"./image-DDgd2sPC.js";import{C as I}from"./cloud-upload-CQRuyabr.js";import{S as pe}from"./save-Co8lXD7U.js";import{T as ce}from"./trash-2-BXfw28tL.js";function J(){return{slot_position:1,media_type:"image",image_url:"",video_url:"",poster_url:"",eyebrow_text:"",title:"",subtitle:"",promo_text:"",cta_label:"Shop Now",cta_url:"",secondary_cta_label:"",secondary_cta_url:"",theme_key:"",background_color:"",text_color:"",sort_order:1,status:"active"}}function K(){return{minimum_budget:200,minimum_daily_cap:20,cost_per_view:.05,cost_per_click:1,ad_insert_position:5,max_active_ads:1,allow_image:!0,allow_video:!0,video_autoplay:!0,approval_required:!0,status:"active"}}function P(i){return`$${Number(i||0).toFixed(2)}`}function he(i){var S,N,f,y,a;return(i==null?void 0:i.url)||(i==null?void 0:i.file_url)||(i==null?void 0:i.fileUrl)||(i==null?void 0:i.image_url)||(i==null?void 0:i.video_url)||(i==null?void 0:i.secure_url)||(i==null?void 0:i.location)||(i==null?void 0:i.path)||((S=i==null?void 0:i.file)==null?void 0:S.url)||((N=i==null?void 0:i.file)==null?void 0:N.file_url)||((f=i==null?void 0:i.file)==null?void 0:f.path)||((y=i==null?void 0:i.data)==null?void 0:y.url)||((a=i==null?void 0:i.data)==null?void 0:a.file_url)||""}function ve(){const i=p.useRef(null),S=p.useRef(null),N=p.useRef(null),[f,y]=p.useState([]),[a,U]=p.useState(K()),[b,T]=p.useState(""),[t,k]=p.useState(J()),[X,F]=p.useState(!0),[R,C]=p.useState(!1),[E,V]=p.useState(!1),[Z,M]=p.useState(!1),[v,q]=p.useState(""),[H,x]=p.useState(""),[D,g]=p.useState("");p.useMemo(()=>f.find(s=>String(s.id)===String(b))||null,[f,b]);const $=async(s=!1)=>{var o,n,r,h;try{s?M(!0):F(!0),x("");const[d,l]=await Promise.all([j.get("/api/admin/banner-home-ads/settings"),j.get("/api/admin/banner-home-ads/slides")]);U(((o=d==null?void 0:d.data)==null?void 0:o.settings)||K());const m=Array.isArray((n=l==null?void 0:l.data)==null?void 0:n.slides)?l.data.slides:[];y(m),!b&&m.length&&z(m[0])}catch(d){x(((h=(r=d==null?void 0:d.response)==null?void 0:r.data)==null?void 0:h.message)||"Failed to load homepage slider settings")}finally{F(!1),M(!1)}};p.useEffect(()=>{$()},[]);const z=s=>{T(String(s.id)),k({slot_position:s.slot_position||1,media_type:s.media_type||"image",image_url:s.image_url||"",video_url:s.video_url||"",poster_url:s.poster_url||"",eyebrow_text:s.eyebrow_text||"",title:s.title||"",subtitle:s.subtitle||"",promo_text:s.promo_text||"",cta_label:s.cta_label||"Shop Now",cta_url:s.cta_url||"",secondary_cta_label:s.secondary_cta_label||"",secondary_cta_url:s.secondary_cta_url||"",theme_key:s.theme_key||"",background_color:s.background_color||"",text_color:s.text_color||"",sort_order:s.sort_order||s.slot_position||1,status:s.status||"active"}),x(""),g("")},B=()=>{const s=new Set(f.map(n=>Number(n.slot_position))),o=[1,2,3,4].find(n=>!s.has(n))||1;T(""),k({...J(),slot_position:o,sort_order:o}),x(""),g("")},u=s=>{const{name:o,value:n,type:r,checked:h}=s.target;U(d=>({...d,[o]:r==="checkbox"?h:n}))},c=s=>{const{name:o,value:n}=s.target;k(r=>({...r,[o]:n}))},L=async(s,o)=>{var r,h,d;const n=(r=s.target.files)==null?void 0:r[0];if(n)try{q(o),x(""),g("");const l=new FormData;l.append("file",n),l.append("type",o),l.append("folder","admin-homepage-slides");const{data:m}=await j.post("/api/uploads",l,{headers:{"Content-Type":"multipart/form-data"}}),_=he(m);if(!_)throw new Error("Upload completed, but no file URL was returned by the server.");k(w=>({...w,[o]:_})),g("File uploaded successfully.")}catch(l){x(((d=(h=l==null?void 0:l.response)==null?void 0:h.data)==null?void 0:d.message)||l.message||"Failed to upload file")}finally{q(""),s.target.value=""}},ee=async()=>{var s,o;try{V(!0),x(""),g("");const n={...a,minimum_budget:Number(a.minimum_budget||200),minimum_daily_cap:Number(a.minimum_daily_cap||20),cost_per_view:Number(a.cost_per_view||0),cost_per_click:Number(a.cost_per_click||0),ad_insert_position:Number(a.ad_insert_position||5),max_active_ads:Number(a.max_active_ads||1)},{data:r}=await j.put("/api/admin/banner-home-ads/settings",n);U((r==null?void 0:r.settings)||a),g((r==null?void 0:r.message)||"Homepage slider settings saved successfully")}catch(n){x(((o=(s=n==null?void 0:n.response)==null?void 0:s.data)==null?void 0:o.message)||"Failed to save settings")}finally{V(!1)}},se=()=>{if(!t.title.trim())throw new Error("Slide title is required");if(!t.cta_label.trim())throw new Error("CTA label is required");if(!t.cta_url.trim())throw new Error("CTA URL is required");if(t.media_type==="image"&&!t.image_url.trim())throw new Error("Image URL is required for image slide");if(t.media_type==="video"&&!t.video_url.trim())throw new Error("Video URL is required for video slide")},ie=async s=>{var o,n,r,h,d;s.preventDefault();try{C(!0),x(""),g(""),se();const l={...t,slot_position:Number(t.slot_position||1),sort_order:Number(t.sort_order||t.slot_position||1)};let m;b?m=await j.put(`/api/admin/banner-home-ads/slides/${b}`,l):m=await j.post("/api/admin/banner-home-ads/slides",l);const _=(o=m==null?void 0:m.data)==null?void 0:o.slide,w=await j.get("/api/admin/banner-home-ads/slides"),Y=Array.isArray((n=w==null?void 0:w.data)==null?void 0:n.slides)?w.data.slides:[];if(y(Y),_!=null&&_.id){const G=Y.find(re=>String(re.id)===String(_.id));G&&z(G)}g(((r=m==null?void 0:m.data)==null?void 0:r.message)||"Homepage slide saved successfully")}catch(l){x(((d=(h=l==null?void 0:l.response)==null?void 0:h.data)==null?void 0:d.message)||l.message||"Failed to save homepage slide")}finally{C(!1)}},te=async()=>{var s,o,n;if(b)try{C(!0),x(""),g("");const{data:r}=await j.delete(`/api/admin/banner-home-ads/slides/${b}`),h=await j.get("/api/admin/banner-home-ads/slides"),d=Array.isArray((s=h==null?void 0:h.data)==null?void 0:s.slides)?h.data.slides:[];y(d),d.length?z(d[0]):B(),g((r==null?void 0:r.message)||"Homepage slide deleted successfully")}catch(r){x(((n=(o=r==null?void 0:r.response)==null?void 0:o.data)==null?void 0:n.message)||"Failed to delete homepage slide")}finally{C(!1)}},A=t.media_type==="video"?t.poster_url||t.image_url:t.image_url||t.poster_url;return X?e.jsxs("div",{className:"bhs-page",children:[e.jsx("style",{children:Q}),e.jsx("div",{className:"bhs-loading",children:"Loading homepage slider..."})]}):e.jsxs("div",{className:"bhs-page",children:[e.jsx("style",{children:Q}),e.jsx("input",{ref:i,type:"file",accept:"image/*",className:"bhs-hidden-file",onChange:s=>L(s,"image_url")}),e.jsx("input",{ref:S,type:"file",accept:"video/*,audio/*",className:"bhs-hidden-file",onChange:s=>L(s,"video_url")}),e.jsx("input",{ref:N,type:"file",accept:"image/*",className:"bhs-hidden-file",onChange:s=>L(s,"poster_url")}),e.jsxs("section",{className:"bhs-hero",children:[e.jsxs("div",{children:[e.jsx("span",{className:"bhs-badge",children:"Admin Homepage Slider"}),e.jsx("h1",{children:"Homepage Slider Control"}),e.jsx("p",{children:"Manage the 4 default homepage slides and control where paid slider ads appear in the public homepage slider."})]}),e.jsxs("div",{className:"bhs-hero-actions",children:[e.jsxs("button",{type:"button",className:"bhs-btn secondary",onClick:()=>$(!0),children:[e.jsx(ae,{size:16,className:Z?"spin":""}),"Refresh"]}),e.jsxs("button",{type:"button",className:"bhs-btn primary",onClick:B,children:[e.jsx(ne,{size:16}),"New Slide"]})]})]}),H?e.jsxs("div",{className:"bhs-alert error",children:[e.jsx(le,{size:18}),e.jsx("span",{children:H})]}):null,D?e.jsxs("div",{className:"bhs-alert success",children:[e.jsx(de,{size:18}),e.jsx("span",{children:D})]}):null,e.jsxs("section",{className:"bhs-settings-grid",children:[e.jsxs("div",{className:"bhs-panel",children:[e.jsxs("div",{className:"bhs-panel-head",children:[e.jsx("p",{children:"Slider ad settings"}),e.jsx("h2",{children:"Ad Pricing & Position"})]}),e.jsxs("div",{className:"bhs-settings-form",children:[e.jsxs("label",{children:[e.jsx("span",{children:"Minimum Budget"}),e.jsx("input",{type:"number",step:"0.01",name:"minimum_budget",value:a.minimum_budget,onChange:u})]}),e.jsxs("label",{children:[e.jsx("span",{children:"Minimum Daily Cap"}),e.jsx("input",{type:"number",step:"0.01",name:"minimum_daily_cap",value:a.minimum_daily_cap,onChange:u})]}),e.jsxs("label",{children:[e.jsx("span",{children:"Cost Per View"}),e.jsx("input",{type:"number",step:"0.0001",name:"cost_per_view",value:a.cost_per_view,onChange:u})]}),e.jsxs("label",{children:[e.jsx("span",{children:"Cost Per Click"}),e.jsx("input",{type:"number",step:"0.0001",name:"cost_per_click",value:a.cost_per_click,onChange:u})]}),e.jsxs("label",{children:[e.jsx("span",{children:"Ad Insert Position"}),e.jsxs("select",{name:"ad_insert_position",value:a.ad_insert_position,onChange:u,children:[e.jsx("option",{value:"1",children:"Position 1 — before all admin slides"}),e.jsx("option",{value:"2",children:"Position 2 — after slide 1"}),e.jsx("option",{value:"3",children:"Position 3 — after slide 2"}),e.jsx("option",{value:"4",children:"Position 4 — after slide 3"}),e.jsx("option",{value:"5",children:"Position 5 — after all 4 admin slides"})]})]}),e.jsxs("label",{children:[e.jsx("span",{children:"Max Active Ads"}),e.jsx("input",{type:"number",min:"1",max:"10",name:"max_active_ads",value:a.max_active_ads,onChange:u})]}),e.jsxs("div",{className:"bhs-toggle-grid",children:[e.jsxs("label",{children:[e.jsx("input",{type:"checkbox",name:"allow_image",checked:!!a.allow_image,onChange:u}),"Allow image ads"]}),e.jsxs("label",{children:[e.jsx("input",{type:"checkbox",name:"allow_video",checked:!!a.allow_video,onChange:u}),"Allow video ads"]}),e.jsxs("label",{children:[e.jsx("input",{type:"checkbox",name:"video_autoplay",checked:!!a.video_autoplay,onChange:u}),"Video autoplay"]}),e.jsxs("label",{children:[e.jsx("input",{type:"checkbox",name:"approval_required",checked:!!a.approval_required,onChange:u}),"Approval required"]})]}),e.jsxs("button",{type:"button",className:"bhs-btn primary",onClick:ee,disabled:E,children:[e.jsx(oe,{size:16}),E?"Saving...":"Save Settings"]})]})]}),e.jsxs("div",{className:"bhs-panel",children:[e.jsxs("div",{className:"bhs-panel-head",children:[e.jsx("p",{children:"Current pricing"}),e.jsx("h2",{children:"Live Rules"})]}),e.jsxs("div",{className:"bhs-rule-grid",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Minimum Budget"}),e.jsx("strong",{children:P(a.minimum_budget)})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Daily Cap"}),e.jsx("strong",{children:P(a.minimum_daily_cap)})]}),e.jsxs("div",{children:[e.jsx("span",{children:"View Cost"}),e.jsx("strong",{children:P(a.cost_per_view)})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Click Cost"}),e.jsx("strong",{children:P(a.cost_per_click)})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Ad Position"}),e.jsxs("strong",{children:["Slot ",a.ad_insert_position]})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Admin Slides"}),e.jsxs("strong",{children:[f.length,"/4"]})]})]})]})]}),e.jsxs("section",{className:"bhs-layout",children:[e.jsxs("aside",{className:"bhs-panel bhs-admin-slide-list-panel",children:[e.jsxs("div",{className:"bhs-panel-head",children:[e.jsx("p",{children:"Default slides"}),e.jsx("h2",{children:"Admin Slides"})]}),f.length?e.jsx("div",{className:"bhs-slide-list",children:f.map(s=>e.jsxs("button",{type:"button",className:`bhs-slide-card${String(b)===String(s.id)?" active":""}`,onClick:()=>z(s),children:[e.jsxs("div",{children:[e.jsxs("strong",{children:["Slot ",s.slot_position]}),e.jsx("span",{children:s.title})]}),e.jsx("em",{children:s.status})]},s.id))}):e.jsx("div",{className:"bhs-empty",children:"No admin slides created yet."})]}),e.jsxs("main",{className:"bhs-panel",children:[e.jsxs("div",{className:"bhs-panel-head",children:[e.jsx("p",{children:"Slide editor"}),e.jsx("h2",{children:b?"Edit Admin Slide":"Create Admin Slide"})]}),e.jsxs("form",{className:"bhs-form",onSubmit:ie,children:[e.jsxs("div",{className:"bhs-form-grid",children:[e.jsxs("label",{children:[e.jsx("span",{children:"Slot Position"}),e.jsxs("select",{name:"slot_position",value:t.slot_position,onChange:c,children:[e.jsx("option",{value:"1",children:"Slot 1"}),e.jsx("option",{value:"2",children:"Slot 2"}),e.jsx("option",{value:"3",children:"Slot 3"}),e.jsx("option",{value:"4",children:"Slot 4"})]})]}),e.jsxs("label",{children:[e.jsx("span",{children:"Status"}),e.jsxs("select",{name:"status",value:t.status,onChange:c,children:[e.jsx("option",{value:"active",children:"Active"}),e.jsx("option",{value:"inactive",children:"Inactive"})]})]}),e.jsxs("label",{children:[e.jsx("span",{children:"Media Type"}),e.jsxs("select",{name:"media_type",value:t.media_type,onChange:c,children:[e.jsx("option",{value:"image",children:"Image"}),e.jsx("option",{value:"video",children:"Video"})]})]}),e.jsxs("label",{children:[e.jsx("span",{children:"Sort Order"}),e.jsx("input",{type:"number",name:"sort_order",value:t.sort_order,onChange:c})]}),e.jsxs("label",{children:[e.jsx("span",{children:"Eyebrow Text"}),e.jsx("input",{name:"eyebrow_text",value:t.eyebrow_text,onChange:c,placeholder:"Discover curated products"})]}),e.jsxs("label",{children:[e.jsx("span",{children:"Promo Text"}),e.jsx("input",{name:"promo_text",value:t.promo_text,onChange:c,placeholder:"$3620"})]}),e.jsxs("label",{className:"full",children:[e.jsx("span",{children:"Title"}),e.jsx("input",{name:"title",value:t.title,onChange:c,placeholder:"Homepage slider title"})]}),e.jsxs("label",{className:"full",children:[e.jsx("span",{children:"Subtitle"}),e.jsx("textarea",{name:"subtitle",value:t.subtitle,onChange:c,rows:3,placeholder:"Short slider subtitle"})]}),t.media_type==="image"?e.jsxs("div",{className:"bhs-field full",children:[e.jsxs("span",{children:[e.jsx(W,{size:15})," Image Upload"]}),e.jsxs("div",{className:"bhs-upload-row",children:[e.jsx("input",{name:"image_url",value:t.image_url,onChange:c,placeholder:"Image URL or upload from device"}),e.jsxs("button",{type:"button",className:"bhs-upload-btn",onClick:()=>{var s;return(s=i.current)==null?void 0:s.click()},disabled:v==="image_url",children:[e.jsx(I,{size:16}),v==="image_url"?"Uploading...":"Pick Image"]})]}),e.jsx("small",{children:"Upload from mobile or computer, or paste an image URL manually."})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"bhs-field full",children:[e.jsxs("span",{children:[e.jsx(O,{size:15})," Video Upload"]}),e.jsxs("div",{className:"bhs-upload-row",children:[e.jsx("input",{name:"video_url",value:t.video_url,onChange:c,placeholder:"YouTube, VideoGad, direct video/audio URL, or upload from device"}),e.jsxs("button",{type:"button",className:"bhs-upload-btn",onClick:()=>{var s;return(s=S.current)==null?void 0:s.click()},disabled:v==="video_url",children:[e.jsx(I,{size:16}),v==="video_url"?"Uploading...":"Pick Video"]})]}),e.jsx("small",{children:"Upload MP4/WebM/audio from device, or paste YouTube/VideoGad/direct video URL."})]}),e.jsxs("div",{className:"bhs-field full",children:[e.jsx("span",{children:"Poster Image Upload"}),e.jsxs("div",{className:"bhs-upload-row",children:[e.jsx("input",{name:"poster_url",value:t.poster_url,onChange:c,placeholder:"Poster image URL or upload from device"}),e.jsxs("button",{type:"button",className:"bhs-upload-btn",onClick:()=>{var s;return(s=N.current)==null?void 0:s.click()},disabled:v==="poster_url",children:[e.jsx(I,{size:16}),v==="poster_url"?"Uploading...":"Pick Poster"]})]}),e.jsx("small",{children:"This image shows before the video loads and inside the preview."})]})]}),e.jsxs("label",{children:[e.jsx("span",{children:"CTA Label"}),e.jsx("input",{name:"cta_label",value:t.cta_label,onChange:c,placeholder:"Shop Now"})]}),e.jsxs("label",{children:[e.jsx("span",{children:"CTA URL"}),e.jsx("input",{name:"cta_url",value:t.cta_url,onChange:c,placeholder:"https://..."})]}),e.jsxs("label",{children:[e.jsx("span",{children:"Secondary CTA Label"}),e.jsx("input",{name:"secondary_cta_label",value:t.secondary_cta_label,onChange:c,placeholder:"Learn More"})]}),e.jsxs("label",{children:[e.jsx("span",{children:"Secondary CTA URL"}),e.jsx("input",{name:"secondary_cta_url",value:t.secondary_cta_url,onChange:c,placeholder:"https://..."})]})]}),e.jsxs("div",{className:"bhs-action-row",children:[e.jsxs("button",{type:"submit",className:"bhs-btn primary",disabled:R||!!v,children:[e.jsx(pe,{size:16}),R?"Saving...":"Save Slide"]}),b?e.jsxs("button",{type:"button",className:"bhs-btn danger",onClick:te,disabled:R,children:[e.jsx(ce,{size:16}),"Delete"]}):null]})]})]})]}),e.jsxs("section",{className:"bhs-panel bhs-preview-footer-panel",children:[e.jsxs("div",{className:"bhs-panel-head",children:[e.jsx("p",{children:"Full Preview"}),e.jsx("h2",{children:"Homepage Slider Banner Preview"})]}),e.jsxs("div",{className:"bhs-footer-preview",children:[e.jsxs("div",{className:"bhs-footer-preview-copy",children:[e.jsx("span",{children:t.eyebrow_text||"Homepage Slide"}),e.jsx("h3",{children:t.title||"Your homepage slide title"}),e.jsx("p",{children:t.subtitle||"Your subtitle will appear here."}),e.jsxs("div",{className:"bhs-footer-preview-actions",children:[e.jsx("a",{href:t.cta_url||"#",children:t.cta_label||"Shop Now"}),t.secondary_cta_label?e.jsx("a",{href:t.secondary_cta_url||"#",children:t.secondary_cta_label}):null,t.promo_text?e.jsx("strong",{children:t.promo_text}):null]})]}),e.jsxs("div",{className:"bhs-footer-preview-media",children:[e.jsx("div",{className:"bhs-footer-preview-dot dot-one"}),e.jsx("div",{className:"bhs-footer-preview-dot dot-two"}),e.jsx("div",{className:"bhs-footer-preview-dot dot-three"}),t.media_type==="video"?A?e.jsx("img",{src:A,alt:"Poster preview"}):e.jsxs("div",{className:"bhs-preview-empty-media",children:[e.jsx(O,{size:42}),e.jsx("span",{children:"Video Preview"})]}):A?e.jsx("img",{src:A,alt:"Slide preview"}):e.jsxs("div",{className:"bhs-preview-empty-media",children:[e.jsx(W,{size:42}),e.jsx("span",{children:"Image Preview"})]})]})]})]})]})}const Q=`
  .bhs-page {
    display: grid;
    gap: 18px;
  }

  .bhs-hidden-file {
    display: none;
  }

  .bhs-loading,
  .bhs-empty {
    background: #f8fafc !important;
    border: 1px dashed #94a3b8 !important;
    border-radius: 22px;
    padding: 24px;
    text-align: center;
    color: #111827 !important;
    font-size: 14px;
    font-weight: 950;
    line-height: 1.5;
    opacity: 1 !important;
    filter: none !important;
    text-shadow: none !important;
  }

  .spin {
    animation: bhsSpin 0.8s linear infinite;
  }

  @keyframes bhsSpin {
    to { transform: rotate(360deg); }
  }

  .bhs-hero {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    align-items: flex-start;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.05);
  }

  .bhs-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    border-radius: 999px;
    background: #fff7ed !important;
    color: #9a3412 !important;
    border: 1px solid #fed7aa;
    padding: 9px 14px;
    font-size: 12px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 12px;
    box-shadow: 0 10px 24px rgba(154, 52, 18, 0.08);
    opacity: 1 !important;
    filter: none !important;
  }

  .bhs-hero h1 {
    margin: 0;
    color: #111827;
    font-size: 30px;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .bhs-hero p {
    margin: 10px 0 0;
    color: #64748b;
    max-width: 760px;
    line-height: 1.7;
  }

  .bhs-hero-actions,
  .bhs-action-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .bhs-btn,
  .bhs-upload-btn {
    min-height: 44px;
    border-radius: 14px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    color: #111827;
    font-size: 14px;
    font-weight: 850;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 15px;
    cursor: pointer;
    text-decoration: none;
    white-space: nowrap;
  }

  .bhs-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .bhs-btn.secondary {
    background: #ffffff;
    color: #111827;
  }

  .bhs-btn.danger {
    background: #fff1f2;
    color: #be123c;
    border-color: #fecdd3;
  }

  .bhs-upload-btn {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
    min-width: 150px;
  }

  .bhs-btn:disabled,
  .bhs-upload-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .bhs-alert {
    display: flex;
    align-items: center;
    gap: 10px;
    border-radius: 16px;
    padding: 14px 16px;
    font-weight: 750;
  }

  .bhs-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .bhs-alert.success {
    background: #ecfdf3;
    border: 1px solid #abefc6;
    color: #027a48;
  }

  .bhs-settings-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.6fr);
    gap: 18px;
  }

  .bhs-layout {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
    gap: 18px;
    align-items: start;
  }

  .bhs-panel {
    background: #ffffff !important;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 20px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
    opacity: 1 !important;
    filter: none !important;
  }

  .bhs-panel,
  .bhs-panel * {
    text-shadow: none !important;
  }

  .bhs-panel p,
  .bhs-panel span,
  .bhs-panel label,
  .bhs-panel input,
  .bhs-panel select,
  .bhs-panel textarea {
    color: #111827;
    opacity: 1 !important;
    filter: none !important;
  }

  .bhs-panel input::placeholder,
  .bhs-panel textarea::placeholder {
    color: #64748b;
    opacity: 1;
  }

  .bhs-panel-head {
    margin-bottom: 16px;
  }

  .bhs-panel-head p {
    margin: 0 0 6px;
    color: #475569 !important;
    font-size: 12px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 1 !important;
  }

  .bhs-panel-head h2 {
    margin: 0;
    font-size: 22px;
    color: #111827 !important;
    font-weight: 950;
    opacity: 1 !important;
  }

  .bhs-settings-form,
  .bhs-form {
    display: grid;
    gap: 16px;
  }

  .bhs-settings-form {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .bhs-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .bhs-settings-form label,
  .bhs-form label,
  .bhs-field {
    display: grid;
    gap: 8px;
  }

  .bhs-settings-form label span,
  .bhs-form label span,
  .bhs-field > span {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: #111827;
    font-size: 13px;
    font-weight: 900;
  }

  .bhs-form label.full,
  .bhs-field.full {
    grid-column: span 2;
  }

  .bhs-settings-form input,
  .bhs-settings-form select,
  .bhs-form input,
  .bhs-form select,
  .bhs-form textarea,
  .bhs-field input {
    width: 100%;
    min-height: 46px;
    border-radius: 14px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    color: #111827;
    padding: 0 13px;
    outline: none;
    font-weight: 750;
  }

  .bhs-form textarea {
    padding: 13px;
    resize: vertical;
  }

  .bhs-upload-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
  }

  .bhs-field small {
    color: #64748b;
    font-size: 12px;
    font-weight: 700;
  }

  .bhs-toggle-grid {
    grid-column: span 3;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .bhs-toggle-grid label {
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 14px;
    padding: 12px;
    display: flex;
    gap: 8px;
    align-items: center;
    color: #111827;
    font-weight: 900;
  }

  .bhs-rule-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .bhs-rule-grid div {
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 16px;
    padding: 14px;
    display: grid;
    gap: 6px;
  }

  .bhs-rule-grid span {
    color: #475569;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .bhs-rule-grid strong {
    color: #111827;
    font-size: 19px;
    font-weight: 950;
  }

  .bhs-admin-slide-list-panel {
    background: #ffffff !important;
    opacity: 1 !important;
    filter: none !important;
  }

  .bhs-slide-list {
    display: grid;
    gap: 10px;
  }

  .bhs-slide-card {
    width: 100%;
    border: 1px solid #e5e7eb;
    background: #f8fafc;
    border-radius: 16px;
    padding: 14px;
    text-align: left;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }

  .bhs-slide-card.active {
    background: #ffffff;
    border-color: #111827;
    box-shadow: inset 0 0 0 1px #111827;
  }

  .bhs-slide-card div {
    display: grid;
    gap: 6px;
  }

  .bhs-slide-card strong {
    color: #111827 !important;
    font-weight: 950;
    opacity: 1 !important;
  }

  .bhs-slide-card span {
    color: #334155 !important;
    font-size: 13px;
    line-height: 1.35;
    font-weight: 800;
    opacity: 1 !important;
  }

  .bhs-slide-card em {
    font-style: normal;
    color: #027a48 !important;
    font-size: 12px;
    font-weight: 950;
    text-transform: capitalize;
    opacity: 1 !important;
  }

  .bhs-preview-footer-panel {
    margin-top: 2px;
  }

  .bhs-footer-preview {
    position: relative;
    overflow: hidden;
    min-height: 430px;
    border-radius: 28px;
    display: grid;
    grid-template-columns: 37% 63%;
    align-items: center;
    background:
      radial-gradient(circle at top left, rgba(255, 255, 255, 0.2), transparent 28%),
      linear-gradient(135deg, #e0b894 0%, #ddb38c 38%, #dcb28b 100%);
  }

  .bhs-footer-preview::before {
    content: "";
    position: absolute;
    left: -90px;
    top: 60px;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    background:
      radial-gradient(circle, rgba(255, 255, 255, 0.12) 0, rgba(255, 255, 255, 0.12) 22%, transparent 23%),
      radial-gradient(circle, rgba(255, 255, 255, 0.08) 0, rgba(255, 255, 255, 0.08) 38%, transparent 39%),
      radial-gradient(circle, rgba(111, 78, 55, 0.05) 0, rgba(111, 78, 55, 0.05) 54%, transparent 55%);
    pointer-events: none;
    z-index: 1;
  }

  .bhs-footer-preview-copy {
    position: relative;
    z-index: 5;
    padding: 46px 26px 46px 58px;
    display: grid;
    align-content: center;
    gap: 16px;
  }

  .bhs-footer-preview-copy > span {
    display: inline-flex;
    width: fit-content;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.42);
    border: 1px solid rgba(255, 255, 255, 0.55);
    color: #2d2521;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .bhs-footer-preview-copy h3 {
    margin: 0;
    color: #2d2521;
    font-size: clamp(36px, 4.8vw, 72px);
    line-height: 0.96;
    font-weight: 950;
    letter-spacing: -0.06em;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.18);
  }

  .bhs-footer-preview-copy p {
    margin: 0;
    max-width: 520px;
    color: rgba(45, 37, 33, 0.92);
    line-height: 1.7;
    font-size: 16px;
    font-weight: 850;
  }

  .bhs-footer-preview-actions {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    margin-top: 8px;
  }

  .bhs-footer-preview-actions a {
    min-height: 50px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    padding: 0 22px;
    font-size: 13px;
    font-weight: 950;
    text-decoration: none;
    background: #ffffff;
    color: #111827;
  }

  .bhs-footer-preview-actions a:nth-child(2) {
    border: 1px solid rgba(17, 24, 39, 0.2);
    background: rgba(255, 255, 255, 0.46);
    color: #2d2521;
  }

  .bhs-footer-preview-actions strong {
    color: #2d2521;
    font-size: 34px;
    font-weight: 950;
  }

  .bhs-footer-preview-media {
    position: relative;
    z-index: 2;
    min-height: 430px;
    display: grid;
    place-items: center;
    padding: 34px 46px 34px 0;
  }

  .bhs-footer-preview-media img,
  .bhs-preview-empty-media {
    position: relative;
    z-index: 4;
    width: min(880px, 94%);
    height: 330px;
    border-radius: 46px;
    object-fit: cover;
    background: rgba(255, 255, 255, 0.16);
    border: 1px solid rgba(255, 255, 255, 0.26);
    box-shadow: 0 30px 80px rgba(15, 23, 42, 0.22);
  }

  .bhs-preview-empty-media {
    display: grid;
    place-items: center;
    color: rgba(45, 37, 33, 0.9);
    font-weight: 950;
  }

  .bhs-footer-preview-dot {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 5;
    background: rgba(70, 51, 38, 0.14);
  }

  .bhs-footer-preview-dot.dot-one {
    top: 48px;
    right: 150px;
    width: 76px;
    height: 76px;
  }

  .bhs-footer-preview-dot.dot-two {
    right: 56px;
    top: 90px;
    width: 42px;
    height: 42px;
  }

  .bhs-footer-preview-dot.dot-three {
    right: 90px;
    bottom: 76px;
    width: 110px;
    height: 110px;
    background: rgba(255, 255, 255, 0.08);
  }

  @media (max-width: 1280px) {
    .bhs-settings-grid,
    .bhs-layout {
      grid-template-columns: 1fr;
    }

    .bhs-settings-form {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .bhs-toggle-grid {
      grid-column: span 2;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .bhs-footer-preview {
      grid-template-columns: 1fr;
    }

    .bhs-footer-preview-copy {
      padding: 34px 28px 12px;
    }

    .bhs-footer-preview-media {
      min-height: 320px;
      padding: 18px 28px 34px;
    }

    .bhs-footer-preview-media img,
    .bhs-preview-empty-media {
      width: 100%;
      height: 300px;
      border-radius: 34px;
    }
  }

  @media (max-width: 720px) {
    .bhs-hero,
    .bhs-hero-actions,
    .bhs-action-row {
      flex-direction: column;
      align-items: stretch;
    }

    .bhs-settings-form,
    .bhs-form-grid,
    .bhs-rule-grid,
    .bhs-toggle-grid {
      grid-template-columns: 1fr;
    }

    .bhs-toggle-grid,
    .bhs-form label.full,
    .bhs-field.full {
      grid-column: span 1;
    }

    .bhs-btn,
    .bhs-upload-btn {
      width: 100%;
    }

    .bhs-upload-row {
      grid-template-columns: 1fr;
    }

    .bhs-footer-preview-copy h3 {
      font-size: 38px;
    }
  }
`;export{ve as default};
