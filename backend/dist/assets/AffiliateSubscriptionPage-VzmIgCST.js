import{m as ni,r as d,j as i,R as li,ab as K,k as ci,a7 as oi,G as di,a as j,b as pi}from"./index-D7wY-Nn2.js";import{f as I}from"./formatCurrency-DPAzH823.js";import{R as Q}from"./rocket-DJxQRBJZ.js";import{C as fi}from"./circle-alert-BxSISDFL.js";import{C as ui}from"./circle-check-DwQtcZzx.js";import{S as xi}from"./sparkles-DniX3uPT.js";import{C as hi}from"./crown-9tuqvcLd.js";import{L as X}from"./layers-CpcBwM5V.js";import{C as mi}from"./calendar-days-Bxv19lUy.js";/**
 * @license lucide-react v1.8.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bi=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}],["path",{d:"M12 7v5l4 2",key:"1fdv2h"}]],gi=ni("history",bi);function Z(s=""){const n=String(s).toLowerCase();return n==="active"?"affiliate-subscription-status active":n==="trial"||n==="trialing"?"affiliate-subscription-status trial":n==="inactive"||n==="expired"?"affiliate-subscription-status inactive":n==="cancelled"||n==="suspended"?"affiliate-subscription-status danger":"affiliate-subscription-status neutral"}function T(s){return s==null||s===""?"-":s}function ji(){var $,U,Y,R;const[s,n]=d.useState(null),[f,y]=d.useState([]),[O,A]=d.useState(!0),[z,W]=d.useState(!1),[h,k]=d.useState(!1),[_,w]=d.useState(""),[m,P]=d.useState(""),S=async(a=!1)=>{var e,t,l;try{a?W(!0):A(!0);const[c,u]=await Promise.all([j.get("/api/affiliate/subscription"),j.get("/api/affiliate/subscription/history")]);n({current_subscription:((e=c==null?void 0:c.data)==null?void 0:e.current_subscription)||null,available_plans:((t=c==null?void 0:c.data)==null?void 0:t.available_plans)||[]}),y(((l=u==null?void 0:u.data)==null?void 0:l.subscriptions)||[])}finally{A(!1),W(!1)}};d.useEffect(()=>{(async()=>{var e,t;try{w(""),await S()}catch(l){w(((t=(e=l==null?void 0:l.response)==null?void 0:e.data)==null?void 0:t.message)||"Failed to load subscription data")}})()},[]);const g=async()=>{var a,e;try{k(!0),w(""),P("");const{data:t}=await j.post("/api/affiliate/subscription/start-trial");t!=null&&t.ok&&(await S(!0),P(t.message||"Free trial started successfully"))}catch(t){w(((e=(a=t==null?void 0:t.response)==null?void 0:a.data)==null?void 0:e.message)||"Failed to start free trial")}finally{k(!1)}},D=async a=>{var e,t;try{k(!0),w(""),P("");const{data:l}=await j.post("/api/affiliate/subscription/change-plan",{plan_id:a});l!=null&&l.ok&&(await S(!0),P(l.message||"Plan changed successfully"))}catch(l){w(((t=(e=l==null?void 0:l.response)==null?void 0:e.data)==null?void 0:t.message)||"Failed to change plan")}finally{k(!1)}},r=(s==null?void 0:s.current_subscription)||null,L=(s==null?void 0:s.available_plans)||[],o=d.useMemo(()=>{var a;return(a=r==null?void 0:r.plan)!=null&&a.id?String(r.plan.id):""},[r]);return O?i.jsxs("div",{className:"affiliate-subscription-page",children:[i.jsx("style",{children:ii}),i.jsx("div",{className:"affiliate-subscription-loading-wrap",children:i.jsxs("div",{className:"affiliate-subscription-loading-card",children:[i.jsx("div",{className:"affiliate-subscription-spinner"}),i.jsx("p",{children:"Loading subscription..."})]})})]}):i.jsxs("div",{className:"affiliate-subscription-page",children:[i.jsx("style",{children:ii}),i.jsxs("section",{className:"affiliate-subscription-hero",children:[i.jsxs("div",{className:"affiliate-subscription-hero-copy",children:[i.jsx("div",{className:"affiliate-subscription-badge",children:"Subscription manager"}),i.jsx("h1",{className:"affiliate-subscription-title",children:"Subscription"}),i.jsx("p",{className:"affiliate-subscription-subtitle",children:"Manage your trial, active plan, billing access, and subscription history from one place."})]}),i.jsxs("div",{className:"affiliate-subscription-hero-actions",children:[i.jsxs("button",{type:"button",className:"affiliate-subscription-btn secondary",onClick:()=>S(!0),disabled:z,children:[i.jsx(li,{size:16,className:z?"spin":""}),z?"Refreshing...":"Refresh"]}),r?null:i.jsxs("button",{className:"affiliate-subscription-btn primary",type:"button",onClick:g,disabled:h,children:[i.jsx(Q,{size:16}),h?"Please wait...":"Start Free Trial"]})]})]}),_?i.jsxs("div",{className:"affiliate-subscription-alert error",children:[i.jsx(fi,{size:18}),i.jsx("span",{children:_})]}):null,m?i.jsxs("div",{className:"affiliate-subscription-alert success",children:[i.jsx(ui,{size:18}),i.jsx("span",{children:m})]}):null,i.jsxs("section",{className:"affiliate-subscription-top-grid",children:[i.jsxs("div",{className:"affiliate-subscription-panel",children:[i.jsx("div",{className:"affiliate-subscription-panel-head",children:i.jsxs("div",{children:[i.jsx("p",{className:"affiliate-subscription-panel-kicker",children:"Current plan"}),i.jsx("h2",{className:"affiliate-subscription-panel-title",children:"Current Subscription"})]})}),r?i.jsxs("div",{className:"affiliate-subscription-current-wrap",children:[i.jsxs("div",{className:"affiliate-subscription-current-top",children:[i.jsxs("div",{children:[i.jsx("h3",{className:"affiliate-subscription-current-name",children:(($=r.plan)==null?void 0:$.name)||"Unknown Plan"}),i.jsx("div",{className:Z(r.status),children:r.status||"-"})]}),i.jsx("div",{className:"affiliate-subscription-current-icon",children:i.jsx(K,{size:22})})]}),i.jsxs("div",{className:"affiliate-subscription-info-grid",children:[i.jsxs("div",{className:"affiliate-subscription-info-box",children:[i.jsx("span",{children:"Price"}),i.jsx("strong",{children:((U=r.plan)==null?void 0:U.price)!==null&&((Y=r.plan)==null?void 0:Y.price)!==void 0?I(r.plan.price):"-"})]}),i.jsxs("div",{className:"affiliate-subscription-info-box",children:[i.jsx("span",{children:"Billing Cycle"}),i.jsx("strong",{children:((R=r.plan)==null?void 0:R.billing_cycle)||"-"})]}),i.jsxs("div",{className:"affiliate-subscription-info-box",children:[i.jsx("span",{children:"Trial Start"}),i.jsx("strong",{children:r.trial_start||"-"})]}),i.jsxs("div",{className:"affiliate-subscription-info-box",children:[i.jsx("span",{children:"Trial End"}),i.jsx("strong",{children:r.trial_end||"-"})]}),i.jsxs("div",{className:"affiliate-subscription-info-box",children:[i.jsx("span",{children:"Start Date"}),i.jsx("strong",{children:r.start_date||"-"})]}),i.jsxs("div",{className:"affiliate-subscription-info-box",children:[i.jsx("span",{children:"End Date"}),i.jsx("strong",{children:r.end_date||"-"})]}),i.jsxs("div",{className:"affiliate-subscription-info-box affiliate-subscription-info-box-wide",children:[i.jsx("span",{children:"Amount Paid"}),i.jsx("strong",{children:r.amount_paid!==null&&r.amount_paid!==void 0?I(r.amount_paid):"-"})]})]})]}):i.jsxs("div",{className:"affiliate-subscription-empty",children:[i.jsx(K,{size:30}),i.jsx("h3",{children:"No subscription yet"}),i.jsx("p",{children:"Start your free trial or choose a plan below to unlock affiliate access."}),i.jsxs("button",{className:"affiliate-subscription-btn primary",type:"button",onClick:g,disabled:h,children:[i.jsx(Q,{size:16}),h?"Please wait...":"Start Free Trial"]})]})]}),i.jsxs("div",{className:"affiliate-subscription-panel",children:[i.jsx("div",{className:"affiliate-subscription-panel-head",children:i.jsxs("div",{children:[i.jsx("p",{className:"affiliate-subscription-panel-kicker",children:"Access limits"}),i.jsx("h2",{className:"affiliate-subscription-panel-title",children:"Plan Limits"})]})}),r!=null&&r.plan?i.jsxs("div",{className:"affiliate-subscription-limits-list",children:[i.jsxs("div",{className:"affiliate-subscription-limit-row",children:[i.jsx("span",{children:"Product Limit"}),i.jsx("strong",{children:r.plan.product_limit??"-"})]}),i.jsxs("div",{className:"affiliate-subscription-limit-row",children:[i.jsx("span",{children:"Post Limit"}),i.jsx("strong",{children:r.plan.post_limit??"-"})]}),i.jsxs("div",{className:"affiliate-subscription-limit-row",children:[i.jsx("span",{children:"Website Limit"}),i.jsx("strong",{children:r.plan.website_limit??"-"})]}),i.jsxs("div",{className:"affiliate-subscription-limit-row",children:[i.jsx("span",{children:"Slider Limit"}),i.jsx("strong",{children:r.plan.slider_limit??"-"})]}),i.jsxs("div",{className:"affiliate-subscription-limit-row",children:[i.jsx("span",{children:"Menu Limit"}),i.jsx("strong",{children:r.plan.menu_limit??"-"})]}),i.jsxs("div",{className:"affiliate-subscription-limit-row",children:[i.jsx("span",{children:"Premium Templates Only"}),i.jsx("strong",{children:r.plan.premium_templates_only?"Yes":"No"})]})]}):i.jsxs("div",{className:"affiliate-subscription-empty-small",children:[i.jsx(ci,{size:24}),i.jsx("p",{children:"No active plan limits yet."})]})]})]}),i.jsxs("section",{className:"affiliate-subscription-panel",style:{marginBottom:20},children:[i.jsx("div",{className:"affiliate-subscription-panel-head",children:i.jsxs("div",{children:[i.jsx("p",{className:"affiliate-subscription-panel-kicker",children:"Upgrade options"}),i.jsx("h2",{className:"affiliate-subscription-panel-title",children:"Available Plans"})]})}),L.length?i.jsx("div",{className:"affiliate-subscription-plans-grid",children:L.map(a=>{const e=o&&String(a.id)===o;return i.jsxs("div",{className:`affiliate-subscription-plan-card${e?" current":""}`,children:[i.jsx("div",{className:"affiliate-subscription-plan-card-glow"}),e?i.jsxs("div",{className:"affiliate-subscription-plan-ribbon",children:[i.jsx(xi,{size:14}),i.jsx("span",{children:"Current Plan"})]}):null,i.jsxs("div",{className:"affiliate-subscription-plan-top",children:[i.jsxs("div",{className:"affiliate-subscription-plan-top-copy",children:[i.jsx("h3",{className:"affiliate-subscription-plan-name",children:a.name}),i.jsx("p",{className:"affiliate-subscription-plan-billing",children:a.billing_cycle||"-"})]}),i.jsx("div",{className:"affiliate-subscription-plan-icon",children:a.is_premium||a.premium_templates_only?i.jsx(hi,{size:20}):i.jsx(X,{size:20})})]}),i.jsxs("div",{className:"affiliate-subscription-plan-price-block",children:[i.jsx("div",{className:"affiliate-subscription-plan-price",children:a.price!==null&&a.price!==void 0?I(a.price):"-"}),i.jsxs("div",{className:"affiliate-subscription-plan-price-note",children:["Per ",String(a.billing_cycle||"yearly").toLowerCase()]})]}),i.jsxs("div",{className:"affiliate-subscription-plan-feature-grid",children:[i.jsxs("div",{className:"affiliate-subscription-plan-feature-item",children:[i.jsx("span",{children:"Products"}),i.jsx("strong",{children:T(a.product_limit)})]}),i.jsxs("div",{className:"affiliate-subscription-plan-feature-item",children:[i.jsx("span",{children:"Posts"}),i.jsx("strong",{children:T(a.post_limit)})]}),i.jsxs("div",{className:"affiliate-subscription-plan-feature-item",children:[i.jsx("span",{children:"Website"}),i.jsx("strong",{children:T(a.website_limit)})]}),i.jsxs("div",{className:"affiliate-subscription-plan-feature-item",children:[i.jsx("span",{children:"Sliders"}),i.jsx("strong",{children:T(a.slider_limit)})]}),i.jsxs("div",{className:"affiliate-subscription-plan-feature-item",children:[i.jsx("span",{children:"Menus"}),i.jsx("strong",{children:T(a.menu_limit)})]}),i.jsxs("div",{className:"affiliate-subscription-plan-feature-item",children:[i.jsx("span",{children:"Premium Templates"}),i.jsx("strong",{children:a.premium_templates_only?"Yes":"No"})]})]}),i.jsxs("div",{className:"affiliate-subscription-plan-perks",children:[i.jsxs("div",{className:"affiliate-subscription-plan-perk",children:[i.jsx("div",{className:"affiliate-subscription-plan-perk-icon",children:i.jsx(oi,{size:14})}),i.jsxs("div",{className:"affiliate-subscription-plan-perk-text",children:["Premium Templates: ",a.premium_templates_only?"Enabled":"Not Included"]})]}),i.jsxs("div",{className:"affiliate-subscription-plan-perk",children:[i.jsx("div",{className:"affiliate-subscription-plan-perk-icon",children:i.jsx(di,{size:14})}),i.jsx("div",{className:"affiliate-subscription-plan-perk-text",children:"Outbound Links: Allowed and monitored"})]})]}),i.jsx("button",{className:`affiliate-subscription-btn ${e?"secondary":"primary"} full affiliate-subscription-plan-btn`,type:"button",onClick:()=>D(a.id),disabled:h||e,children:e?"Current Plan":h?"Please wait...":"Choose Plan"})]},a.id)})}):i.jsxs("div",{className:"affiliate-subscription-empty-small",children:[i.jsx(X,{size:24}),i.jsx("p",{children:"No plans available."})]})]}),i.jsxs("section",{className:"affiliate-subscription-panel",children:[i.jsx("div",{className:"affiliate-subscription-panel-head",children:i.jsxs("div",{children:[i.jsx("p",{className:"affiliate-subscription-panel-kicker",children:"History"}),i.jsx("h2",{className:"affiliate-subscription-panel-title",children:"Subscription History"})]})}),f.length?i.jsx("div",{className:"affiliate-subscription-history-list",children:f.map(a=>{var e;return i.jsxs("div",{className:"affiliate-subscription-history-card",children:[i.jsxs("div",{className:"affiliate-subscription-history-top",children:[i.jsx("div",{className:"affiliate-subscription-history-icon",children:i.jsx(gi,{size:18})}),i.jsxs("div",{className:"affiliate-subscription-history-main",children:[i.jsx("h3",{children:((e=a.plan)==null?void 0:e.name)||"Unknown Plan"}),i.jsx("span",{className:Z(a.status),children:a.status||"-"})]})]}),i.jsxs("div",{className:"affiliate-subscription-history-grid",children:[i.jsxs("div",{children:[i.jsx("span",{children:"Amount Paid"}),i.jsx("strong",{children:a.amount_paid!==null?I(a.amount_paid):"-"})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Trial End"}),i.jsx("strong",{children:a.trial_end||"-"})]}),i.jsxs("div",{children:[i.jsx("span",{children:"End Date"}),i.jsx("strong",{children:a.end_date||"-"})]})]})]},a.id)})}):i.jsxs("div",{className:"affiliate-subscription-empty-small",children:[i.jsx(mi,{size:24}),i.jsx("p",{children:"No subscription history yet."})]})]})]})}const ii=`
  * {
    box-sizing: border-box;
  }

  .affiliate-subscription-page {
    width: 100%;
  }

  .affiliate-subscription-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-subscription-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-subscription-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliateSubscriptionSpin 0.8s linear infinite;
  }

  @keyframes affiliateSubscriptionSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: affiliateSubscriptionSpin 0.8s linear infinite;
  }

  .affiliate-subscription-hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.05);
    margin-bottom: 20px;
  }

  .affiliate-subscription-badge {
    display: inline-flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 999px;
    background: #111827;
    color: #ffffff;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .affiliate-subscription-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-subscription-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-subscription-hero-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-subscription-btn {
    height: 46px;
    padding: 0 16px;
    border-radius: 14px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    color: #111827;
    font-size: 14px;
    font-weight: 800;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .affiliate-subscription-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-subscription-btn.secondary {
    background: #ffffff;
    color: #111827;
    border-color: #dbe2ea;
  }

  .affiliate-subscription-btn.full {
    width: 100%;
  }

  .affiliate-subscription-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .affiliate-subscription-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 20px;
  }

  .affiliate-subscription-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-subscription-alert.success {
    background: #ecfdf3;
    border: 1px solid #abefc6;
    color: #027a48;
  }

  .affiliate-subscription-top-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.85fr);
    gap: 20px;
    margin-bottom: 20px;
  }

  .affiliate-subscription-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-subscription-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .affiliate-subscription-panel-kicker {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .affiliate-subscription-panel-title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-subscription-current-wrap {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .affiliate-subscription-current-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .affiliate-subscription-current-name {
    margin: 0 0 10px;
    font-size: 24px;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-subscription-current-icon {
    width: 50px;
    height: 50px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    display: grid;
    place-items: center;
    color: #111827;
    flex-shrink: 0;
  }

  .affiliate-subscription-status {
    display: inline-flex;
    width: fit-content;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    text-transform: capitalize;
    border: 1px solid transparent;
  }

  .affiliate-subscription-status.active {
    background: #ecfdf3;
    color: #027a48;
    border-color: #abefc6;
  }

  .affiliate-subscription-status.trial {
    background: #eef2ff;
    color: #4338ca;
    border-color: #c7d2fe;
  }

  .affiliate-subscription-status.inactive {
    background: #fff7ed;
    color: #b54708;
    border-color: #fed7aa;
  }

  .affiliate-subscription-status.danger {
    background: #fef2f2;
    color: #b42318;
    border-color: #fecaca;
  }

  .affiliate-subscription-status.neutral {
    background: #eef2f7;
    color: #344054;
    border-color: #dbe2ea;
  }

  .affiliate-subscription-info-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .affiliate-subscription-info-box {
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 18px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-subscription-info-box-wide {
    grid-column: span 2;
  }

  .affiliate-subscription-info-box span,
  .affiliate-subscription-limit-row span,
  .affiliate-subscription-history-grid span {
    font-size: 12px;
    color: #6b7280;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .affiliate-subscription-info-box strong,
  .affiliate-subscription-limit-row strong,
  .affiliate-subscription-history-grid strong {
    font-size: 15px;
    color: #111827;
    font-weight: 900;
  }

  .affiliate-subscription-limits-list,
  .affiliate-subscription-history-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-subscription-limit-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 16px;
  }

  .affiliate-subscription-plans-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .affiliate-subscription-plan-card {
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(circle at top right, rgba(15, 23, 42, 0.06), transparent 35%),
      linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #dbe2ea;
    border-radius: 30px;
    padding: 18px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }

  .affiliate-subscription-plan-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 22px 40px rgba(15, 23, 42, 0.08);
  }

  .affiliate-subscription-plan-card.current {
    border-color: #111827;
    background:
      radial-gradient(circle at top right, rgba(15, 23, 42, 0.08), transparent 35%),
      linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    box-shadow:
      inset 0 0 0 1px #111827,
      0 20px 40px rgba(15, 23, 42, 0.08);
  }

  .affiliate-subscription-plan-card-glow {
    position: absolute;
    top: -60px;
    right: -60px;
    width: 150px;
    height: 150px;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(17, 24, 39, 0.08) 0%, rgba(17, 24, 39, 0) 70%);
    pointer-events: none;
  }

  .affiliate-subscription-plan-ribbon {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    background: #111827;
    color: #ffffff;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 14px;
    position: relative;
    z-index: 1;
  }

  .affiliate-subscription-plan-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 14px;
    position: relative;
    z-index: 1;
  }

  .affiliate-subscription-plan-top-copy {
    min-width: 0;
  }

  .affiliate-subscription-plan-name {
    margin: 0 0 4px;
    font-size: 18px;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-subscription-plan-billing {
    margin: 0;
    font-size: 13px;
    color: #6b7280;
    text-transform: lowercase;
  }

  .affiliate-subscription-plan-icon {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid #e5e7eb;
    display: grid;
    place-items: center;
    color: #111827;
    flex-shrink: 0;
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
  }

  .affiliate-subscription-plan-price-block {
    margin-bottom: 16px;
    position: relative;
    z-index: 1;
  }

  .affiliate-subscription-plan-price {
    font-size: 40px;
    font-weight: 900;
    color: #0f172a;
    line-height: 1;
    letter-spacing: -0.03em;
    margin-bottom: 6px;
  }

  .affiliate-subscription-plan-price-note {
    font-size: 12px;
    color: #6b7280;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .affiliate-subscription-plan-feature-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 14px;
    position: relative;
    z-index: 1;
  }

  .affiliate-subscription-plan-feature-item {
    min-height: 74px;
    padding: 14px;
    background: rgba(255, 255, 255, 0.88);
    border: 1px solid #e8edf3;
    border-radius: 18px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 10px;
    backdrop-filter: blur(8px);
  }

  .affiliate-subscription-plan-feature-item span {
    font-size: 11px;
    color: #64748b;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    line-height: 1.2;
  }

  .affiliate-subscription-plan-feature-item strong {
    font-size: 21px;
    color: #0f172a;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.02em;
    word-break: break-word;
  }

  .affiliate-subscription-plan-perks {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;
    position: relative;
    z-index: 1;
  }

  .affiliate-subscription-plan-perk {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 46px;
    padding: 12px 14px;
    background: rgba(255, 255, 255, 0.88);
    border: 1px solid #e8edf3;
    border-radius: 16px;
  }

  .affiliate-subscription-plan-perk-icon {
    width: 28px;
    height: 28px;
    border-radius: 999px;
    background: #111827;
    color: #ffffff;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .affiliate-subscription-plan-perk-text {
    font-size: 13px;
    color: #0f172a;
    font-weight: 700;
    line-height: 1.4;
  }

  .affiliate-subscription-plan-btn {
    position: relative;
    z-index: 1;
    min-height: 48px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 900;
  }

  .affiliate-subscription-history-card {
    padding: 16px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
  }

  .affiliate-subscription-history-top {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 14px;
  }

  .affiliate-subscription-history-icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    color: #111827;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .affiliate-subscription-history-main {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-subscription-history-main h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-subscription-history-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .affiliate-subscription-history-grid div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    background: #ffffff;
    border: 1px solid #edf2f7;
    border-radius: 14px;
  }

  .affiliate-subscription-empty,
  .affiliate-subscription-empty-small {
    min-height: 180px;
    border: 1px dashed #dbe2ea;
    background: #f8fafc;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
    padding: 22px;
  }

  .affiliate-subscription-empty h3,
  .affiliate-subscription-empty-small p {
    margin: 0;
    color: #111827;
    font-weight: 800;
  }

  .affiliate-subscription-empty p {
    margin: 0 0 8px;
    color: #6b7280;
    line-height: 1.6;
    max-width: 420px;
  }

  @media (max-width: 1200px) {
    .affiliate-subscription-plans-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 1100px) {
    .affiliate-subscription-top-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 991px) {
    .affiliate-subscription-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-subscription-title {
      font-size: 26px;
    }

    .affiliate-subscription-hero-actions {
      width: 100%;
    }

    .affiliate-subscription-panel {
      padding: 18px;
    }
  }

  @media (max-width: 767px) {
    .affiliate-subscription-title {
      font-size: 22px;
    }

    .affiliate-subscription-subtitle {
      font-size: 14px;
    }

    .affiliate-subscription-hero-actions,
    .affiliate-subscription-info-grid,
    .affiliate-subscription-plans-grid,
    .affiliate-subscription-history-grid,
    .affiliate-subscription-plan-feature-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-subscription-hero-actions {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-subscription-btn {
      width: 100%;
    }

    .affiliate-subscription-info-box-wide {
      grid-column: span 1;
    }

    .affiliate-subscription-limit-row,
    .affiliate-subscription-history-grid div,
    .affiliate-subscription-current-top {
      flex-direction: column;
      align-items: flex-start;
    }

    .affiliate-subscription-plan-price {
      font-size: 34px;
    }
  }
`;function b(s){if(s==null||s==="")return"Unlimited";const n=Number(s);return Number.isFinite(n)?String(n):String(s)}function B(s){if(!s)return"-";const n=new Date(s);return Number.isNaN(n.getTime())?String(s):new Intl.DateTimeFormat("en-US",{day:"2-digit",month:"short",year:"numeric"}).format(n)}function G(s){const n=String(s||"").toLowerCase();return n==="active"?"is-active":n==="trial"||n==="trialing"?"is-trial":n==="cancelled"||n==="suspended"?"is-danger":n==="inactive"||n==="expired"?"is-muted":"is-neutral"}function M(s){return s==null||s===""?"-":I(Number(s))}function ei(s){return s==="paystack"?"Paystack":s==="flutterwave"?"Flutterwave":s==="paypal"?"PayPal":s||"payment"}function H(s,n){if(!s)return"-";const f=String(s[`${n}_templates_mode`]||"unlimited").toLowerCase(),y=Array.isArray(s[`allowed_${n}_templates`])?s[`allowed_${n}_templates`]:[];return n==="website"&&Number(s.website_limit||0)===0?"No access":f==="unlimited"?"All":`${y.length} selected`}function si(s){var n;return((n=s==null?void 0:s.features_json)==null?void 0:n.can_receive_gifts)===!0?"Yes":"No"}function ai(s){var f;return String(((f=s==null?void 0:s.features_json)==null?void 0:f.analytics_level)||"basic").toLowerCase()==="full"?"Full":"Basic"}function q(s,n){var y;const f=(y=s==null?void 0:s.features_json)==null?void 0:y[n];return f===!0||f===1||String(f||"").toLowerCase()==="true"}function ti(s){return q(s,"can_offer_paid_membership")?"Included - unlocks automatically at 25,000 followers":"Not included"}function yi(){const[s,n]=d.useState(null),[f,y]=d.useState([]),[O,A]=d.useState(!0),[z,W]=d.useState(!1),[h,k]=d.useState(""),[_,w]=d.useState([]),[m,P]=d.useState(""),[S,g]=d.useState(""),[D,r]=d.useState(""),L=async(e=!1)=>{var t,l,c,u,v,F,E;e?W(!0):A(!0),g("");try{const[p,x,N]=await Promise.all([j.get("/api/affiliate/subscription"),j.get("/api/affiliate/subscription/history"),j.get("/api/affiliate/subscription/checkout/options")]);n({current_subscription:((t=p==null?void 0:p.data)==null?void 0:t.current_subscription)||null,free_plan:((l=p==null?void 0:p.data)==null?void 0:l.free_plan)||null,available_plans:((c=p==null?void 0:p.data)==null?void 0:c.available_plans)||[]}),y(((u=x==null?void 0:x.data)==null?void 0:u.subscriptions)||[]);const C=Array.isArray((v=N==null?void 0:N.data)==null?void 0:v.gateways)?N.data.gateways:[];w(C),P(V=>{var J;return C.some(ri=>ri.provider===V)?V:((J=C[0])==null?void 0:J.provider)||""})}catch(p){g(((E=(F=p==null?void 0:p.response)==null?void 0:F.data)==null?void 0:E.message)||"Failed to load Writer plan data.")}finally{e?W(!1):A(!1)}};d.useEffect(()=>{L()},[]),d.useEffect(()=>{const e=new URLSearchParams(window.location.search),t=String(e.get("writer_subscription_payment")||"").toLowerCase(),l=String(e.get("purchase_ref")||"").trim();if(!t&&!l)return;let c=!0;async function u(){var F,E,p;try{if(l){const x=await j.get(`/api/affiliate/subscription/checkout/status/${encodeURIComponent(l)}`);if(!c)return;const N=((F=x==null?void 0:x.data)==null?void 0:F.purchase)||{},C=String(N.status||t).toLowerCase();C==="paid"?(r(`${N.plan_name||"Writer plan"} payment verified. Your Writer plan is active.`),await L(!0)):C==="cancelled"?r("Checkout was cancelled. No Writer plan was activated."):C==="failed"?g(N.failure_reason||"Payment could not be verified. No Writer plan was activated."):r("Payment is still pending verification. Refresh this page after the gateway confirms it.")}else t==="cancelled"&&r("Checkout was cancelled. No Writer plan was activated.")}catch(x){c&&g(((p=(E=x==null?void 0:x.response)==null?void 0:E.data)==null?void 0:p.message)||"Unable to confirm the Writer subscription payment.")}const v=new URL(window.location.href);v.searchParams.delete("writer_subscription_payment"),v.searchParams.delete("purchase_ref"),window.history.replaceState({},"",`${v.pathname}${v.search}${v.hash}`)}return u(),()=>{c=!1}},[]);const o=(s==null?void 0:s.current_subscription)||null,$=(s==null?void 0:s.available_plans)||[],U=d.useMemo(()=>{var e;return(e=o==null?void 0:o.plan)!=null&&e.id?String(o.plan.id):""},[o]),Y=async()=>{r(""),await L(!0)},R=async e=>{var t,l;if(!(h||!m||_.length===0)){k(String(e)),g(""),r("");try{const{data:c}=await j.post("/api/affiliate/subscription/checkout/initialize",{plan_id:e,provider:m}),u=c==null?void 0:c.checkout_url;if(!u)throw new Error("Payment gateway did not return a checkout URL.");window.location.assign(u)}catch(c){g(((l=(t=c==null?void 0:c.response)==null?void 0:t.data)==null?void 0:l.message)||(c==null?void 0:c.message)||"Failed to open secure Writer plan checkout."),k("")}}};if(O)return i.jsx("div",{className:"writer-plan-page",children:i.jsxs("div",{className:"writer-plan-loading-card",children:[i.jsx("span",{className:"writer-plan-spinner"}),i.jsxs("div",{children:[i.jsx("strong",{children:"Loading Writer plan"}),i.jsx("p",{children:"Checking your subscription and publishing limits."})]})]})});const a=(o==null?void 0:o.plan)||(s==null?void 0:s.free_plan)||null;return i.jsxs("div",{className:"writer-plan-page",children:[i.jsxs("section",{className:"writer-plan-section-head",children:[i.jsxs("div",{children:[i.jsx("span",{className:"writer-plan-kicker",children:"Account"}),i.jsx("h2",{children:"Your Writer plan"}),i.jsx("p",{children:"Plan access, publishing limits, available upgrades, and subscription history."})]}),i.jsx("div",{className:"writer-plan-head-actions",children:i.jsx("button",{type:"button",className:"writer-plan-btn writer-plan-btn-secondary",onClick:Y,disabled:z,children:z?"Refreshing...":"Refresh"})})]}),S?i.jsx("div",{className:"writer-plan-alert writer-plan-alert-error",children:S}):null,D?i.jsx("div",{className:"writer-plan-alert writer-plan-alert-success",children:D}):null,i.jsxs("section",{className:"writer-plan-top-grid",children:[i.jsxs("article",{className:"writer-plan-card writer-plan-current-card",children:[i.jsxs("div",{className:"writer-plan-card-head",children:[i.jsxs("div",{children:[i.jsx("span",{className:"writer-plan-kicker",children:"Current plan"}),i.jsx("h3",{children:(a==null?void 0:a.name)||"No active Writer plan"}),i.jsx("p",{children:o?"Your current Writer subscription.":"Your free Writer access. Upgrade whenever you want."})]}),o?i.jsx("span",{className:`writer-plan-status ${G(o.status)}`,children:o.status||"Unknown"}):null]}),o&&a?i.jsxs(i.Fragment,{children:[i.jsxs("div",{className:"writer-plan-price-row",children:[i.jsx("strong",{children:M(a.price)}),i.jsxs("span",{children:["/ ",String(a.billing_cycle||"yearly").toLowerCase()]})]}),i.jsxs("div",{className:"writer-plan-info-grid",children:[i.jsxs("div",{className:"writer-plan-info-box",children:[i.jsx("span",{children:"Billing cycle"}),i.jsx("strong",{children:a.billing_cycle||"-"})]}),i.jsxs("div",{className:"writer-plan-info-box",children:[i.jsx("span",{children:"Plan starts"}),i.jsx("strong",{children:B(o.start_date)})]}),i.jsxs("div",{className:"writer-plan-info-box",children:[i.jsx("span",{children:"Plan ends"}),i.jsx("strong",{children:B(o.end_date)})]}),i.jsxs("div",{className:"writer-plan-info-box",children:[i.jsx("span",{children:"Amount paid"}),i.jsx("strong",{children:M(o.amount_paid)})]})]})]}):i.jsxs("div",{className:"writer-plan-empty-current",children:[i.jsx("strong",{children:"Free Writer"}),i.jsx("p",{children:"Write and publish on your Writer Page with the Simple Writer template. Upgrade for Storefront, products, gifts, premium templates, and full analytics."})]})]}),i.jsxs("article",{className:"writer-plan-card writer-plan-access-card",children:[i.jsx("div",{className:"writer-plan-card-head",children:i.jsxs("div",{children:[i.jsx("span",{className:"writer-plan-kicker",children:"Access limits"}),i.jsx("h3",{children:"Plan access"}),i.jsx("p",{children:"Publishing limits returned by your current Writer plan."})]})}),a?i.jsxs("div",{className:"writer-plan-limit-list",children:[i.jsxs("div",{children:[i.jsx("span",{children:"Products"}),i.jsx("strong",{children:b(a.product_limit)})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Posts"}),i.jsx("strong",{children:b(a.post_limit)})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Storefronts"}),i.jsx("strong",{children:b(a.website_limit)})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Sliders"}),i.jsx("strong",{children:b(a.slider_limit)})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Menus"}),i.jsx("strong",{children:b(a.menu_limit)})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Premium post templates"}),i.jsx("strong",{children:a.premium_templates_only?"Included":"Not included"})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Post templates"}),i.jsx("strong",{children:H(a,"blog")})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Storefront templates"}),i.jsx("strong",{children:H(a,"website")})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Receive gifts"}),i.jsx("strong",{children:si(a)})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Analytics"}),i.jsx("strong",{children:ai(a)})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Premium Post publishing"}),i.jsx("strong",{children:q(a,"can_publish_premium_posts")?"Included":"Not included"})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Direct Paid Membership"}),i.jsx("strong",{children:ti(a)})]})]}):i.jsx("div",{className:"writer-plan-empty-small",children:i.jsx("p",{children:"No current plan limits yet."})})]})]}),a?i.jsxs("section",{className:"writer-plan-card",style:{marginBottom:20},"aria-label":"Writer plan payment method",children:[i.jsx("div",{className:"writer-plan-card-head",children:i.jsxs("div",{children:[i.jsx("span",{className:"writer-plan-kicker",children:"Payment"}),i.jsx("h3",{children:"Payment method"}),i.jsx("p",{children:"Choose one of the payment gateways enabled by Bloggad. The active test or live mode is controlled securely by Admin."})]})}),_.length?i.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:10,marginTop:14},children:_.map(e=>i.jsx("button",{type:"button",className:`writer-plan-btn ${m===e.provider?"writer-plan-btn-primary":"writer-plan-btn-secondary"}`,onClick:()=>P(e.provider),"aria-pressed":m===e.provider,children:ei(e.provider)},e.provider))}):i.jsx("div",{className:"writer-plan-empty-small",style:{marginTop:14},children:i.jsx("p",{children:"No payment gateway is currently configured and enabled."})})]}):null,i.jsxs("section",{className:"writer-plan-available-section",children:[i.jsx("div",{className:"writer-plan-subhead",children:i.jsxs("div",{children:[i.jsx("span",{className:"writer-plan-kicker",children:"Upgrade options"}),i.jsx("h3",{children:"Available plans"}),i.jsx("p",{children:"Choose Starter, Pro, or Unlimited and pay directly. No trial is required."})]})}),$.length?i.jsx("div",{className:"writer-plan-plans-grid",children:$.map(e=>{const t=U&&String(e.id)===U&&String((o==null?void 0:o.status)||"").toLowerCase()==="active",l=String(h)===String(e.id);return i.jsxs("article",{className:`writer-plan-plan-card${t?" is-current":""}`,children:[i.jsxs("div",{className:"writer-plan-plan-head",children:[i.jsxs("div",{children:[i.jsx("h4",{children:e.name||"Writer Plan"}),i.jsxs("span",{children:[e.billing_cycle||"yearly"," billing"]})]}),t?i.jsx("span",{className:"writer-plan-current-pill",children:"Current"}):null]}),i.jsxs("div",{className:"writer-plan-plan-price",children:[i.jsx("strong",{children:M(e.price)}),i.jsx("span",{children:"/ year"})]}),i.jsxs("div",{className:"writer-plan-plan-features",children:[i.jsxs("div",{children:[i.jsx("span",{children:"Products"}),i.jsx("strong",{children:b(e.product_limit)})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Posts"}),i.jsx("strong",{children:b(e.post_limit)})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Storefronts"}),i.jsx("strong",{children:b(e.website_limit)})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Sliders"}),i.jsx("strong",{children:b(e.slider_limit)})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Menus"}),i.jsx("strong",{children:b(e.menu_limit)})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Premium post templates"}),i.jsx("strong",{children:e.premium_templates_only?"Included":"Not included"})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Post templates"}),i.jsx("strong",{children:H(e,"blog")})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Storefront templates"}),i.jsx("strong",{children:H(e,"website")})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Receive gifts"}),i.jsx("strong",{children:si(e)})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Analytics"}),i.jsx("strong",{children:ai(e)})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Premium Post publishing"}),i.jsx("strong",{children:q(e,"can_publish_premium_posts")?"Included":"Not included"})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Direct Paid Membership"}),i.jsx("strong",{children:ti(e)})]})]}),i.jsx("button",{type:"button",className:`writer-plan-btn writer-plan-plan-btn ${t?"writer-plan-btn-secondary":"writer-plan-btn-primary"}`,disabled:t||!!h||!m||_.length===0,onClick:()=>R(e.id),children:t?"Current Plan":l?"Opening checkout...":m?`Pay with ${ei(m)}`:"Select payment method"})]},e.id)})}):i.jsx("div",{className:"writer-plan-card writer-plan-empty-small",children:i.jsx("p",{children:"No active Writer plans are currently available."})})]}),i.jsxs("section",{className:"writer-plan-card writer-plan-history",children:[i.jsx("div",{className:"writer-plan-card-head",children:i.jsxs("div",{children:[i.jsx("span",{className:"writer-plan-kicker",children:"History"}),i.jsx("h3",{children:"Subscription history"}),i.jsx("p",{children:"Previous Writer plan changes on this account. Legacy records remain visible for audit."})]})}),f.length?i.jsxs(i.Fragment,{children:[i.jsx("div",{className:"writer-plan-history-table-wrap",children:i.jsxs("table",{className:"writer-plan-history-table",children:[i.jsx("thead",{children:i.jsxs("tr",{children:[i.jsx("th",{children:"Plan"}),i.jsx("th",{children:"Status"}),i.jsx("th",{children:"Amount paid"}),i.jsx("th",{children:"Subscription end"})]})}),i.jsx("tbody",{children:f.map(e=>{var t;return i.jsxs("tr",{children:[i.jsx("td",{children:((t=e.plan)==null?void 0:t.name)||"Unknown Plan"}),i.jsx("td",{children:i.jsx("span",{className:`writer-plan-status ${G(e.status)}`,children:e.status||"-"})}),i.jsx("td",{children:M(e.amount_paid)}),i.jsx("td",{children:B(e.end_date)})]},e.id)})})]})}),i.jsx("div",{className:"writer-plan-history-mobile",children:f.map(e=>{var t;return i.jsxs("article",{className:"writer-plan-history-mobile-card",children:[i.jsxs("div",{className:"writer-plan-history-mobile-head",children:[i.jsx("strong",{children:((t=e.plan)==null?void 0:t.name)||"Unknown Plan"}),i.jsx("span",{className:`writer-plan-status ${G(e.status)}`,children:e.status||"-"})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Amount paid"}),i.jsx("strong",{children:M(e.amount_paid)})]}),i.jsxs("div",{children:[i.jsx("span",{children:"Subscription end"}),i.jsx("strong",{children:B(e.end_date)})]})]},e.id)})})]}):i.jsx("div",{className:"writer-plan-empty-small",children:i.jsx("p",{children:"No subscription history yet."})})]})]})}function Li(){return pi().pathname.startsWith("/affiliate/")?i.jsx(ji,{}):i.jsx(yi,{})}export{Li as default};
