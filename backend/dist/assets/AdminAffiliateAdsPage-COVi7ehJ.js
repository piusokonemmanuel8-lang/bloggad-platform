import{r as p,j as a}from"./index-D7wY-Nn2.js";import{a as u}from"./api-BnafCqf_.js";function x(i){return`$${Number(i||0).toFixed(2)}`}function m(i){const g=Number(i||0);return Number.isFinite(g)?g:0}function A(i){return i==="active"?"active":i==="pending"?"pending":i==="paused"?"paused":i==="exhausted"?"exhausted":i==="rejected"?"rejected":"neutral"}function R(){const[i,g]=p.useState([]),[y,j]=p.useState(!0),[l,d]=p.useState(null),[v,o]=p.useState(""),[b,n]=p.useState(""),h=p.useMemo(()=>({total:i.length,pending:i.filter(e=>e.approval_status==="pending").length,active:i.filter(e=>e.status==="active").length,rejected:i.filter(e=>e.approval_status==="rejected").length,spent:i.reduce((e,r)=>e+m(r.total_spent),0)}),[i]);async function f(){var e,r;try{j(!0),n("");const{data:t}=await u.get("/admin/affiliate-ads");g(Array.isArray(t==null?void 0:t.campaigns)?t.campaigns:[])}catch(t){n(((r=(e=t==null?void 0:t.response)==null?void 0:e.data)==null?void 0:r.message)||"Unable to load affiliate ads.")}finally{j(!1)}}p.useEffect(()=>{f()},[]);async function w(e){var r,t;try{d(e),o(""),n("");const{data:s}=await u.put(`/admin/affiliate-ads/${e}/approve`,{admin_note:"Approved by admin."});o((s==null?void 0:s.message)||"Ad approved successfully."),await f()}catch(s){n(((t=(r=s==null?void 0:s.response)==null?void 0:r.data)==null?void 0:t.message)||"Unable to approve ad.")}finally{d(null)}}async function k(e){var t,s;const r=window.prompt("Why are you rejecting this ad?");if(r)try{d(e),o(""),n("");const{data:c}=await u.put(`/admin/affiliate-ads/${e}/reject`,{rejection_reason:r,admin_note:r});o((c==null?void 0:c.message)||"Ad rejected successfully."),await f()}catch(c){n(((s=(t=c==null?void 0:c.response)==null?void 0:t.data)==null?void 0:s.message)||"Unable to reject ad.")}finally{d(null)}}async function N(e){var r,t;try{d(e),o(""),n("");const{data:s}=await u.put(`/admin/affiliate-ads/${e}/pause`);o((s==null?void 0:s.message)||"Ad paused successfully."),await f()}catch(s){n(((t=(r=s==null?void 0:s.response)==null?void 0:r.data)==null?void 0:t.message)||"Unable to pause ad.")}finally{d(null)}}async function _(e){var r,t;try{d(e),o(""),n("");const{data:s}=await u.put(`/admin/affiliate-ads/${e}/resume`);o((s==null?void 0:s.message)||"Ad resumed successfully."),await f()}catch(s){n(((t=(r=s==null?void 0:s.response)==null?void 0:r.data)==null?void 0:t.message)||"Unable to resume ad.")}finally{d(null)}}return a.jsxs("div",{className:"aaa-page",children:[a.jsx("style",{children:z}),a.jsxs("section",{className:"aaa-hero",children:[a.jsxs("div",{children:[a.jsx("span",{className:"aaa-pill",children:"Admin Affiliate Ads"}),a.jsx("h1",{children:"Review, approve, pause, and monitor affiliate promotions."}),a.jsx("p",{children:"Manage product, post, and website promotions created by affiliates. Approved and funded ads can run automatically."})]}),a.jsxs("div",{className:"aaa-stats",children:[a.jsxs("div",{className:"aaa-stat",children:[a.jsx("span",{children:"Total Ads"}),a.jsx("strong",{children:h.total})]}),a.jsxs("div",{className:"aaa-stat",children:[a.jsx("span",{children:"Pending"}),a.jsx("strong",{children:h.pending})]}),a.jsxs("div",{className:"aaa-stat",children:[a.jsx("span",{children:"Active"}),a.jsx("strong",{children:h.active})]}),a.jsxs("div",{className:"aaa-stat",children:[a.jsx("span",{children:"Total Spent"}),a.jsx("strong",{children:x(h.spent)})]})]})]}),(v||b)&&a.jsx("div",{className:b?"aaa-alert error":"aaa-alert success",children:b||v}),a.jsxs("section",{className:"aaa-card",children:[a.jsxs("div",{className:"aaa-card-head",children:[a.jsxs("div",{children:[a.jsx("h2",{children:"Affiliate Ad Campaigns"}),a.jsx("p",{children:"Pending ads need approval. Edited ads return to pending review."})]}),a.jsx("button",{type:"button",onClick:f,className:"aaa-soft-btn",children:"Refresh"})]}),y?a.jsx("div",{className:"aaa-empty",children:"Loading affiliate ads..."}):i.length===0?a.jsxs("div",{className:"aaa-empty",children:[a.jsx("strong",{children:"No affiliate ads yet"}),a.jsx("span",{children:"Affiliate promotions will appear here for review."})]}):a.jsx("div",{className:"aaa-list",children:i.map(e=>a.jsxs("article",{className:"aaa-item",children:[a.jsxs("div",{className:"aaa-badges",children:[a.jsx("span",{className:`aaa-badge ${A(e.status)}`,children:e.status}),a.jsx("span",{className:`aaa-badge ${e.approval_status}`,children:e.approval_status}),a.jsx("span",{className:"aaa-badge type",children:e.ad_type}),a.jsx("span",{className:"aaa-badge paid",children:e.payment_status})]}),a.jsxs("div",{className:"aaa-main",children:[e.campaign_image?a.jsx("img",{src:e.campaign_image,alt:e.campaign_title}):a.jsx("div",{className:"aaa-img",children:"AD"}),a.jsxs("div",{children:[a.jsx("h3",{children:e.campaign_title}),a.jsx("p",{children:e.campaign_description||"No description added."}),a.jsxs("div",{className:"aaa-owner",children:[a.jsxs("span",{children:["Affiliate: ",e.affiliate_name||"Unknown"]}),a.jsx("span",{children:e.affiliate_email||"-"})]})]})]}),a.jsxs("div",{className:"aaa-metrics",children:[a.jsxs("div",{children:[a.jsx("span",{children:"Budget"}),a.jsx("strong",{children:x(e.total_budget)})]}),a.jsxs("div",{children:[a.jsx("span",{children:"Remaining"}),a.jsx("strong",{children:x(e.remaining_budget)})]}),a.jsxs("div",{children:[a.jsx("span",{children:"Spent"}),a.jsx("strong",{children:x(e.total_spent)})]}),a.jsxs("div",{children:[a.jsx("span",{children:"Views"}),a.jsx("strong",{children:e.total_views||0})]}),a.jsxs("div",{children:[a.jsx("span",{children:"Clicks"}),a.jsx("strong",{children:e.total_clicks||0})]}),a.jsxs("div",{children:[a.jsx("span",{children:"CTR"}),a.jsx("strong",{children:m(e.total_views)>0?`${(m(e.total_clicks)/m(e.total_views)*100).toFixed(2)}%`:"0.00%"})]})]}),a.jsxs("div",{className:"aaa-rates",children:[a.jsxs("span",{children:["Target ID: ",e.target_id]}),a.jsxs("span",{children:["Website ID: ",e.website_id||"-"]}),a.jsxs("span",{children:["View cost: ",x(e.cost_per_view)]}),a.jsxs("span",{children:["Click cost: ",x(e.cost_per_click)]})]}),e.rejection_reason&&a.jsxs("div",{className:"aaa-rejection",children:["Rejection reason: ",e.rejection_reason]}),a.jsxs("div",{className:"aaa-actions",children:[e.approval_status==="pending"&&a.jsxs(a.Fragment,{children:[a.jsx("button",{type:"button",onClick:()=>w(e.id),disabled:l===e.id,className:"approve",children:l===e.id?"Working...":"Approve"}),a.jsx("button",{type:"button",onClick:()=>k(e.id),disabled:l===e.id,className:"reject",children:"Reject"})]}),e.approval_status==="approved"&&e.status==="paused"?a.jsx("button",{type:"button",onClick:()=>_(e.id),disabled:l===e.id,className:"approve",children:l===e.id?"Working...":"Resume"}):null,e.approval_status==="approved"&&e.status==="active"?a.jsx("button",{type:"button",onClick:()=>N(e.id),disabled:l===e.id,children:l===e.id?"Working...":"Pause"}):null]})]},e.id))})]})]})}const z=`
  .aaa-page {
    min-height: calc(100vh - 120px);
    background:
      radial-gradient(circle at top left, rgba(14, 165, 233, 0.12), transparent 28%),
      radial-gradient(circle at top right, rgba(168, 85, 247, 0.12), transparent 24%),
      #f5f7fb;
    color: #0f172a;
    padding: 4px;
  }

  .aaa-hero {
    display: grid;
    grid-template-columns: 1.08fr 0.92fr;
    gap: 28px;
    align-items: center;
    margin-bottom: 22px;
    padding: 34px;
    border-radius: 28px;
    background: linear-gradient(135deg, #07111f, #0f172a 48%, #020617);
    color: #ffffff;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
  }

  .aaa-pill {
    display: inline-flex;
    margin-bottom: 16px;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(56, 189, 248, 0.18);
    color: #cffafe;
    border: 1px solid rgba(125, 211, 252, 0.35);
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.18em;
  }

  .aaa-hero h1 {
    margin: 0;
    max-width: 760px;
    font-size: 38px;
    line-height: 1.05;
    font-weight: 950;
    letter-spacing: -0.04em;
    color: #ffffff;
  }

  .aaa-hero p {
    margin: 16px 0 0;
    max-width: 720px;
    color: #e2e8f0;
    font-size: 15px;
    line-height: 1.75;
  }

  .aaa-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .aaa-stat {
    padding: 20px;
    min-height: 112px;
    border-radius: 22px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.18);
  }

  .aaa-stat span {
    display: block;
    color: #f8fafc;
    font-size: 13px;
    font-weight: 900;
    margin-bottom: 10px;
  }

  .aaa-stat strong {
    display: block;
    color: #ffffff;
    font-size: 30px;
    line-height: 1;
    font-weight: 950;
  }

  .aaa-alert {
    margin-bottom: 18px;
    padding: 15px 18px;
    border-radius: 18px;
    font-size: 14px;
    font-weight: 800;
  }

  .aaa-alert.success {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
  }

  .aaa-alert.error {
    background: #fff1f2;
    border: 1px solid #fecdd3;
    color: #9f1239;
  }

  .aaa-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  }

  .aaa-card-head {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
    margin-bottom: 22px;
  }

  .aaa-card h2 {
    margin: 0;
    color: #0f172a;
    font-size: 24px;
    font-weight: 950;
    letter-spacing: -0.03em;
  }

  .aaa-card-head p {
    margin: 7px 0 0;
    color: #64748b;
    font-size: 14px;
    line-height: 1.5;
  }

  .aaa-soft-btn,
  .aaa-actions button {
    cursor: pointer;
    font-weight: 950;
    transition: 0.2s ease;
  }

  .aaa-soft-btn {
    border: 1px solid #e2e8f0;
    padding: 11px 15px;
    border-radius: 999px;
    background: #f1f5f9;
    color: #0f172a;
  }

  .aaa-empty {
    display: grid;
    gap: 8px;
    place-items: center;
    min-height: 260px;
    border-radius: 24px;
    background: #f8fafc;
    border: 1px dashed #cbd5e1;
    color: #64748b;
    text-align: center;
    padding: 34px;
  }

  .aaa-empty strong {
    color: #0f172a;
    font-size: 18px;
  }

  .aaa-list {
    display: grid;
    gap: 16px;
  }

  .aaa-item {
    padding: 20px;
    border-radius: 24px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
  }

  .aaa-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 14px;
  }

  .aaa-badge {
    display: inline-flex;
    padding: 7px 10px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 950;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .aaa-badge.active,
  .aaa-badge.approved,
  .aaa-badge.paid {
    background: #dcfce7;
    color: #166534;
  }

  .aaa-badge.pending {
    background: #fef3c7;
    color: #92400e;
  }

  .aaa-badge.paused {
    background: #e0f2fe;
    color: #075985;
  }

  .aaa-badge.exhausted,
  .aaa-badge.rejected {
    background: #ffe4e6;
    color: #be123c;
  }

  .aaa-badge.neutral,
  .aaa-badge.type {
    background: #e2e8f0;
    color: #334155;
  }

  .aaa-main {
    display: grid;
    grid-template-columns: 96px 1fr;
    gap: 16px;
    align-items: start;
  }

  .aaa-main img,
  .aaa-img {
    width: 96px;
    height: 96px;
    border-radius: 18px;
    object-fit: cover;
    background: #0f172a;
    color: #ffffff;
  }

  .aaa-img {
    display: grid;
    place-items: center;
    font-size: 24px;
    font-weight: 950;
  }

  .aaa-main h3 {
    margin: 0;
    color: #0f172a;
    font-size: 20px;
    font-weight: 950;
    letter-spacing: -0.02em;
  }

  .aaa-main p {
    margin: 9px 0 0;
    color: #475569;
    font-size: 14px;
    line-height: 1.7;
  }

  .aaa-owner {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 12px;
    color: #64748b;
    font-size: 12px;
    font-weight: 800;
  }

  .aaa-metrics {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
    margin-top: 18px;
  }

  .aaa-metrics div {
    border-radius: 16px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    padding: 12px;
  }

  .aaa-metrics span {
    display: block;
    color: #64748b;
    font-size: 11px;
    font-weight: 900;
    margin-bottom: 6px;
  }

  .aaa-metrics strong {
    display: block;
    color: #0f172a;
    font-size: 15px;
    font-weight: 950;
  }

  .aaa-rates {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 14px;
    color: #64748b;
    font-size: 12px;
    font-weight: 800;
  }

  .aaa-rejection {
    margin-top: 14px;
    padding: 12px 14px;
    border-radius: 16px;
    background: #fff1f2;
    border: 1px solid #fecdd3;
    color: #9f1239;
    font-size: 13px;
    font-weight: 800;
  }

  .aaa-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 16px;
  }

  .aaa-actions button {
    border: 1px solid #e2e8f0;
    padding: 10px 15px;
    border-radius: 999px;
    background: #ffffff;
    color: #0f172a;
  }

  .aaa-actions button.approve {
    background: #0f172a;
    color: #ffffff;
    border-color: #0f172a;
  }

  .aaa-actions button.reject {
    background: #fff1f2;
    color: #be123c;
    border-color: #fecdd3;
  }

  .aaa-actions button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  @media (max-width: 1100px) {
    .aaa-hero {
      grid-template-columns: 1fr;
    }

    .aaa-metrics {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 700px) {
    .aaa-page {
      padding: 0;
    }

    .aaa-hero,
    .aaa-card {
      border-radius: 20px;
      padding: 20px;
    }

    .aaa-hero h1 {
      font-size: 28px;
    }

    .aaa-stats,
    .aaa-main,
    .aaa-metrics {
      grid-template-columns: 1fr;
    }

    .aaa-main img,
    .aaa-img {
      width: 100%;
      height: 170px;
    }

    .aaa-card-head {
      flex-direction: column;
    }
  }
`;export{R as default};
