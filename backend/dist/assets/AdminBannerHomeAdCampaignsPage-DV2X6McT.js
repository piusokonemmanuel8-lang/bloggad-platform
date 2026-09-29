import{r as d,j as e,R as V,c as B,V as E,k as D,a as c}from"./index-D7wY-Nn2.js";import{C as H}from"./circle-alert-BxSISDFL.js";import{C as q}from"./circle-check-DwQtcZzx.js";import{I as L}from"./image-BTrYsFjv.js";import{C as U}from"./circle-x-CdiZtEkJ.js";import{P as M}from"./pause-CXVSikF5.js";import{P as W}from"./play-BHwEioBS.js";import{E as X}from"./eye--VBRzW0C.js";function h(t){return`$${Number(t||0).toFixed(2)}`}function F(t=""){const l=String(t).toLowerCase();return l==="active"||l==="approved"?"abh-status active":l==="pending"?"abh-status pending":l==="paused"?"abh-status paused":l==="rejected"?"abh-status rejected":l==="ended"||l==="exhausted"?"abh-status ended":"abh-status neutral"}function Y(t){return(t==null?void 0:t.media_type)==="video"?(t==null?void 0:t.poster_url)||(t==null?void 0:t.image_url)||"":(t==null?void 0:t.image_url)||(t==null?void 0:t.poster_url)||""}function te(){const[t,l]=d.useState([]),[x,b]=d.useState(""),[p,$]=d.useState({search:"",approval_status:"",status:"",owner_type:""}),[w,k]=d.useState(""),[y,N]=d.useState(""),[I,z]=d.useState(!0),[m,C]=d.useState(!1),[S,u]=d.useState(""),[A,R]=d.useState(""),a=d.useMemo(()=>t.find(r=>String(r.id)===String(x))||null,[t,x]),_=async()=>{var r,o;try{z(!0),u("");const n={};Object.entries(p).forEach(([f,g])=>{g&&(n[f]=g)});const{data:s}=await c.get("/api/admin/banner-home-ad-campaigns",{params:n}),i=Array.isArray(s==null?void 0:s.campaigns)?s.campaigns:[];l(i),!x&&i.length&&b(String(i[0].id))}catch(n){u(((o=(r=n==null?void 0:n.response)==null?void 0:r.data)==null?void 0:o.message)||"Failed to load banner home ad campaigns")}finally{z(!1)}};d.useEffect(()=>{_()},[]);const O=async(r=x)=>{const o={};Object.entries(p).forEach(([f,g])=>{g&&(o[f]=g)});const{data:n}=await c.get("/api/admin/banner-home-ad-campaigns",{params:o}),s=Array.isArray(n==null?void 0:n.campaigns)?n.campaigns:[];l(s);const i=s.find(f=>String(f.id)===String(r));i?b(String(i.id)):s.length?b(String(s[0].id)):b("")},j=r=>{const{name:o,value:n}=r.target;$(s=>({...s,[o]:n}))},v=async r=>{var o,n,s;if(a!=null&&a.id)try{C(!0),u(""),R("");let i;if(r==="approve"&&(i=await c.put(`/api/admin/banner-home-ad-campaigns/${a.id}/approve`,{admin_note:w})),r==="reject"){if(!y.trim())throw new Error("Rejection reason is required");i=await c.put(`/api/admin/banner-home-ad-campaigns/${a.id}/reject`,{rejection_reason:y,admin_note:w})}r==="pause"&&(i=await c.put(`/api/admin/banner-home-ad-campaigns/${a.id}/pause`)),r==="resume"&&(i=await c.put(`/api/admin/banner-home-ad-campaigns/${a.id}/resume`)),await O(a.id),R(((o=i==null?void 0:i.data)==null?void 0:o.message)||"Campaign updated successfully"),k(""),N("")}catch(i){u(((s=(n=i==null?void 0:i.response)==null?void 0:n.data)==null?void 0:s.message)||i.message||"Failed to update campaign")}finally{C(!1)}},P=Y(a);return e.jsxs("div",{className:"abh-page",children:[e.jsx("style",{children:G}),e.jsxs("section",{className:"abh-hero",children:[e.jsxs("div",{children:[e.jsx("span",{className:"abh-badge",children:"Admin Slider Ads"}),e.jsx("h1",{children:"Banner Home Ad Campaigns"}),e.jsx("p",{children:"Approve, reject, pause, resume, and monitor paid homepage slider ad campaigns."})]}),e.jsxs("button",{type:"button",className:"abh-btn secondary",onClick:_,children:[e.jsx(V,{size:16}),"Refresh"]})]}),e.jsxs("section",{className:"abh-filter-bar",children:[e.jsxs("label",{children:[e.jsx(B,{size:16}),e.jsx("input",{name:"search",value:p.search,onChange:j,placeholder:"Search title, URL, affiliate..."})]}),e.jsxs("select",{name:"approval_status",value:p.approval_status,onChange:j,children:[e.jsx("option",{value:"",children:"All approval"}),e.jsx("option",{value:"pending",children:"Pending"}),e.jsx("option",{value:"approved",children:"Approved"}),e.jsx("option",{value:"rejected",children:"Rejected"})]}),e.jsxs("select",{name:"status",value:p.status,onChange:j,children:[e.jsx("option",{value:"",children:"All status"}),e.jsx("option",{value:"pending",children:"Pending"}),e.jsx("option",{value:"active",children:"Active"}),e.jsx("option",{value:"paused",children:"Paused"}),e.jsx("option",{value:"daily_paused",children:"Daily paused"}),e.jsx("option",{value:"exhausted",children:"Exhausted"}),e.jsx("option",{value:"ended",children:"Ended"}),e.jsx("option",{value:"rejected",children:"Rejected"})]}),e.jsxs("select",{name:"owner_type",value:p.owner_type,onChange:j,children:[e.jsx("option",{value:"",children:"All owners"}),e.jsx("option",{value:"affiliate",children:"Affiliate"}),e.jsx("option",{value:"admin",children:"Admin"})]}),e.jsx("button",{type:"button",className:"abh-btn primary",onClick:_,children:"Apply"})]}),S?e.jsxs("div",{className:"abh-alert error",children:[e.jsx(H,{size:18}),e.jsx("span",{children:S})]}):null,A?e.jsxs("div",{className:"abh-alert success",children:[e.jsx(q,{size:18}),e.jsx("span",{children:A})]}):null,I?e.jsx("div",{className:"abh-loading",children:"Loading campaigns..."}):e.jsxs(e.Fragment,{children:[e.jsxs("section",{className:"abh-layout",children:[e.jsxs("aside",{className:"abh-list-panel",children:[e.jsxs("div",{className:"abh-panel-head",children:[e.jsx("p",{children:"Campaigns"}),e.jsxs("h2",{children:[t.length," results"]})]}),t.length?e.jsx("div",{className:"abh-campaign-list",children:t.map(r=>{const o=String(x)===String(r.id);return e.jsxs("button",{type:"button",onClick:()=>b(String(r.id)),className:`abh-campaign-card${o?" active":""}`,children:[e.jsxs("div",{className:"abh-campaign-title-row",children:[e.jsx("strong",{children:r.campaign_title||"Untitled campaign"}),r.media_type==="video"?e.jsx(E,{size:15}):e.jsx(L,{size:15})]}),e.jsxs("p",{children:[r.affiliate_name||r.owner_type||"Admin"," •"," ",r.website_name||"Platform"]}),e.jsxs("div",{className:"abh-mini-row",children:[e.jsx("span",{className:F(r.status),children:r.status||"pending"}),e.jsx("span",{className:F(r.approval_status),children:r.approval_status||"pending"})]}),e.jsxs("div",{className:"abh-metrics",children:[e.jsxs("span",{children:["Views ",r.total_views||0]}),e.jsxs("span",{children:["Clicks ",r.total_clicks||0]}),e.jsxs("span",{children:["Left ",h(r.remaining_budget)]})]})]},r.id)})}):e.jsx("div",{className:"abh-empty",children:"No banner home ad campaigns found."})]}),e.jsx("main",{className:"abh-detail-panel",children:a?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"abh-panel-head",children:[e.jsx("p",{children:"Campaign Detail"}),e.jsx("h2",{children:a.campaign_title})]}),e.jsxs("div",{className:"abh-info-grid",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Owner"}),e.jsx("strong",{children:a.owner_type})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Affiliate"}),e.jsx("strong",{children:a.affiliate_name||"-"})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Website"}),e.jsx("strong",{children:a.website_name||"-"})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Status"}),e.jsx("strong",{children:a.status})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Approval"}),e.jsx("strong",{children:a.approval_status})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Budget"}),e.jsx("strong",{children:h(a.total_budget)})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Remaining"}),e.jsx("strong",{children:h(a.remaining_budget)})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Spent"}),e.jsx("strong",{children:h(a.total_spent)})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Cost/View"}),e.jsx("strong",{children:h(a.cost_per_view)})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Cost/Click"}),e.jsx("strong",{children:h(a.cost_per_click)})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Views"}),e.jsx("strong",{children:a.total_views||0})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Clicks"}),e.jsx("strong",{children:a.total_clicks||0})]})]}),e.jsxs("div",{className:"abh-review-box",children:[e.jsxs("label",{children:[e.jsx("span",{children:"Admin note"}),e.jsx("textarea",{value:w,onChange:r=>k(r.target.value),placeholder:"Optional note",rows:3})]}),e.jsxs("label",{children:[e.jsx("span",{children:"Rejection reason"}),e.jsx("textarea",{value:y,onChange:r=>N(r.target.value),placeholder:"Required only when rejecting",rows:3})]}),e.jsxs("div",{className:"abh-action-row",children:[e.jsxs("button",{type:"button",className:"abh-btn approve",disabled:m,onClick:()=>v("approve"),children:[e.jsx(D,{size:16}),"Approve"]}),e.jsxs("button",{type:"button",className:"abh-btn reject",disabled:m,onClick:()=>v("reject"),children:[e.jsx(U,{size:16}),"Reject"]}),a.status==="active"||a.status==="daily_paused"?e.jsxs("button",{type:"button",className:"abh-btn secondary",disabled:m,onClick:()=>v("pause"),children:[e.jsx(M,{size:16}),"Pause"]}):null,a.status==="paused"?e.jsxs("button",{type:"button",className:"abh-btn secondary",disabled:m,onClick:()=>v("resume"),children:[e.jsx(W,{size:16}),"Resume"]}):null,e.jsxs("a",{href:a.cta_url||"#",target:"_blank",rel:"noreferrer",className:"abh-btn secondary",children:[e.jsx(X,{size:16}),"Open Link"]})]})]})]}):e.jsx("div",{className:"abh-empty",children:"Select a campaign to review."})})]}),a?e.jsxs("section",{className:"abh-preview-footer-panel",children:[e.jsxs("div",{className:"abh-panel-head",children:[e.jsx("p",{children:"Banner Preview"}),e.jsx("h2",{children:"Homepage Slider Display"})]}),e.jsxs("div",{className:"abh-footer-preview-card",children:[e.jsxs("div",{className:"abh-footer-preview-copy",children:[e.jsx("span",{children:a.eyebrow_text||"Sponsored"}),e.jsx("h3",{children:a.title||a.campaign_title}),e.jsx("p",{children:a.subtitle||a.campaign_description||"Campaign subtitle will appear here."}),e.jsxs("div",{className:"abh-footer-preview-actions",children:[e.jsx("a",{href:a.cta_url||"#",target:"_blank",rel:"noreferrer",children:a.cta_label||"Shop Now"}),a.secondary_cta_label&&a.secondary_cta_url?e.jsx("a",{href:a.secondary_cta_url,target:"_blank",rel:"noreferrer",children:a.secondary_cta_label}):null,a.promo_text?e.jsx("strong",{children:a.promo_text}):null]})]}),e.jsxs("div",{className:"abh-footer-preview-media",children:[e.jsx("div",{className:"abh-footer-preview-dot dot-one"}),e.jsx("div",{className:"abh-footer-preview-dot dot-two"}),e.jsx("div",{className:"abh-footer-preview-dot dot-three"}),P?e.jsx("img",{src:P,alt:a.title||"Campaign preview"}):e.jsxs("div",{className:"abh-preview-empty",children:[a.media_type==="video"?e.jsx(E,{size:40}):e.jsx(L,{size:40}),e.jsx("span",{children:a.media_type||"media"})]})]})]})]}):null]})]})}const G=`
  .abh-page {
    display: grid;
    gap: 18px;
  }

  .abh-page,
  .abh-page * {
    text-shadow: none !important;
  }

  .abh-hero,
  .abh-filter-bar,
  .abh-list-panel,
  .abh-detail-panel,
  .abh-preview-footer-panel {
    opacity: 1 !important;
    filter: none !important;
  }

  .abh-hero {
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

  .abh-badge {
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
    opacity: 1 !important;
    filter: none !important;
    box-shadow: 0 10px 24px rgba(154, 52, 18, 0.08);
  }

  .abh-hero h1 {
    margin: 0;
    font-size: 30px;
    font-weight: 950;
    color: #111827;
    letter-spacing: -0.04em;
  }

  .abh-hero p {
    margin: 10px 0 0;
    color: #64748b;
    line-height: 1.7;
    max-width: 760px;
  }

  .abh-btn {
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
  }

  .abh-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .abh-btn.approve {
    background: #027a48;
    color: #ffffff;
    border-color: #027a48;
  }

  .abh-btn.reject {
    background: #be123c;
    color: #ffffff;
    border-color: #be123c;
  }

  .abh-btn.secondary {
    background: #ffffff;
    color: #111827;
  }

  .abh-filter-bar {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 22px;
    padding: 14px;
    display: grid;
    grid-template-columns: minmax(260px, 1fr) 170px 170px 150px auto;
    gap: 12px;
  }

  .abh-filter-bar label {
    position: relative;
    display: block;
  }

  .abh-filter-bar label svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
  }

  .abh-filter-bar input,
  .abh-filter-bar select,
  .abh-review-box textarea {
    width: 100%;
    min-height: 44px;
    border-radius: 14px;
    border: 1px solid #dbe2ea;
    outline: none;
    color: #111827 !important;
    padding: 0 13px;
    background: #ffffff;
    font-weight: 750;
    opacity: 1 !important;
  }

  .abh-filter-bar input {
    padding-left: 42px;
  }

  .abh-filter-bar input::placeholder,
  .abh-review-box textarea::placeholder {
    color: #64748b;
    opacity: 1;
  }

  .abh-alert {
    display: flex;
    align-items: center;
    gap: 10px;
    border-radius: 16px;
    padding: 14px 16px;
    font-weight: 750;
  }

  .abh-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .abh-alert.success {
    background: #ecfdf3;
    border: 1px solid #abefc6;
    color: #027a48;
  }

  .abh-loading,
  .abh-empty {
    background: #f8fafc !important;
    border: 1px dashed #94a3b8 !important;
    border-radius: 22px;
    padding: 24px;
    color: #111827 !important;
    text-align: center;
    font-size: 14px;
    font-weight: 950;
    line-height: 1.5;
    opacity: 1 !important;
    filter: none !important;
  }

  .abh-layout {
    display: grid;
    grid-template-columns: 360px minmax(0, 1fr);
    gap: 18px;
    align-items: start;
  }

  .abh-list-panel,
  .abh-detail-panel,
  .abh-preview-footer-panel {
    background: #ffffff !important;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 20px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .abh-panel-head {
    margin-bottom: 16px;
  }

  .abh-panel-head p {
    margin: 0 0 6px;
    color: #475569 !important;
    font-size: 12px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 1 !important;
  }

  .abh-panel-head h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 950;
    color: #111827 !important;
    opacity: 1 !important;
  }

  .abh-campaign-list {
    display: grid;
    gap: 12px;
    max-height: 760px;
    overflow: auto;
    padding-right: 3px;
  }

  .abh-campaign-card {
    width: 100%;
    text-align: left;
    border: 1px solid #e5e7eb;
    background: #f8fafc;
    border-radius: 18px;
    padding: 15px;
    cursor: pointer;
    display: grid;
    gap: 10px;
    opacity: 1 !important;
    filter: none !important;
  }

  .abh-campaign-card.active {
    background: #ffffff;
    border-color: #111827;
    box-shadow: inset 0 0 0 1px #111827;
  }

  .abh-campaign-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: #111827;
  }

  .abh-campaign-title-row strong {
    font-size: 15px;
    line-height: 1.35;
    color: #111827 !important;
    font-weight: 950;
    opacity: 1 !important;
  }

  .abh-campaign-card p {
    margin: 0;
    color: #334155 !important;
    font-size: 13px;
    font-weight: 800;
    opacity: 1 !important;
  }

  .abh-mini-row,
  .abh-metrics,
  .abh-action-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .abh-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 26px;
    padding: 0 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 900;
    text-transform: capitalize;
    border: 1px solid transparent;
    opacity: 1 !important;
  }

  .abh-status.active {
    background: #ecfdf3;
    color: #027a48;
    border-color: #abefc6;
  }

  .abh-status.pending {
    background: #fff7ed;
    color: #b54708;
    border-color: #fed7aa;
  }

  .abh-status.paused {
    background: #eff6ff;
    color: #1d4ed8;
    border-color: #bfdbfe;
  }

  .abh-status.rejected {
    background: #fff1f2;
    color: #be123c;
    border-color: #fecdd3;
  }

  .abh-status.ended,
  .abh-status.neutral {
    background: #f1f5f9;
    color: #475569;
    border-color: #cbd5e1;
  }

  .abh-metrics span {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    color: #334155 !important;
    font-size: 11px;
    font-weight: 900;
    border-radius: 999px;
    padding: 6px 8px;
    opacity: 1 !important;
  }

  .abh-info-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 18px;
  }

  .abh-info-grid div {
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 16px;
    padding: 13px;
    display: grid;
    gap: 6px;
  }

  .abh-info-grid span,
  .abh-review-box label span {
    color: #475569 !important;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .abh-info-grid strong {
    color: #111827 !important;
    font-size: 15px;
    font-weight: 950;
    overflow-wrap: anywhere;
  }

  .abh-review-box {
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 20px;
    padding: 16px;
    display: grid;
    gap: 12px;
  }

  .abh-review-box label {
    display: grid;
    gap: 8px;
  }

  .abh-review-box textarea {
    padding: 12px;
    resize: vertical;
  }

  .abh-footer-preview-card {
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

  .abh-footer-preview-card::before {
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

  .abh-footer-preview-copy {
    position: relative;
    z-index: 5;
    padding: 46px 26px 46px 58px;
    display: grid;
    align-content: center;
    gap: 16px;
  }

  .abh-footer-preview-copy > span {
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

  .abh-footer-preview-copy h3 {
    margin: 0;
    color: #2d2521;
    font-size: clamp(36px, 4.8vw, 72px);
    line-height: 0.96;
    font-weight: 950;
    letter-spacing: -0.06em;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.18) !important;
  }

  .abh-footer-preview-copy p {
    margin: 0;
    max-width: 520px;
    color: rgba(45, 37, 33, 0.92);
    line-height: 1.7;
    font-size: 16px;
    font-weight: 850;
  }

  .abh-footer-preview-actions {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    margin-top: 8px;
  }

  .abh-footer-preview-actions a {
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

  .abh-footer-preview-actions a:nth-child(2) {
    border: 1px solid rgba(17, 24, 39, 0.2);
    background: rgba(255, 255, 255, 0.46);
    color: #2d2521;
  }

  .abh-footer-preview-actions strong {
    color: #2d2521;
    font-size: 34px;
    font-weight: 950;
  }

  .abh-footer-preview-media {
    position: relative;
    z-index: 2;
    min-height: 430px;
    display: grid;
    place-items: center;
    padding: 34px 46px 34px 0;
  }

  .abh-footer-preview-media img,
  .abh-preview-empty {
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

  .abh-preview-empty {
    display: grid;
    place-items: center;
    color: rgba(45, 37, 33, 0.9);
    font-weight: 950;
  }

  .abh-footer-preview-dot {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 5;
    background: rgba(70, 51, 38, 0.14);
  }

  .abh-footer-preview-dot.dot-one {
    top: 48px;
    right: 150px;
    width: 76px;
    height: 76px;
  }

  .abh-footer-preview-dot.dot-two {
    right: 56px;
    top: 90px;
    width: 42px;
    height: 42px;
  }

  .abh-footer-preview-dot.dot-three {
    right: 90px;
    bottom: 76px;
    width: 110px;
    height: 110px;
    background: rgba(255, 255, 255, 0.08);
  }

  @media (max-width: 1200px) {
    .abh-layout {
      grid-template-columns: 1fr;
    }

    .abh-filter-bar {
      grid-template-columns: 1fr 1fr;
    }

    .abh-info-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .abh-footer-preview-card {
      grid-template-columns: 1fr;
    }

    .abh-footer-preview-copy {
      padding: 34px 28px 12px;
    }

    .abh-footer-preview-media {
      min-height: 320px;
      padding: 18px 28px 34px;
    }

    .abh-footer-preview-media img,
    .abh-preview-empty {
      width: 100%;
      height: 300px;
      border-radius: 34px;
    }
  }

  @media (max-width: 720px) {
    .abh-hero,
    .abh-action-row {
      flex-direction: column;
      align-items: stretch;
    }

    .abh-filter-bar,
    .abh-info-grid {
      grid-template-columns: 1fr;
    }

    .abh-btn {
      width: 100%;
    }

    .abh-footer-preview-copy h3 {
      font-size: 38px;
    }
  }
`;export{te as default};
