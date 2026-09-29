import{u as F,r as c,j as r,L as h,R as U,S as g,F as w,A as x,G as H,P as O,C as Q,a as B}from"./index-LXBBJt7I.js";import{f as V}from"./formatCurrency-DPAzH823.js";import{E as Y}from"./eye-l-zUNvi7.js";import{M as q}from"./mouse-pointer-click-CMFK1dwY.js";import{E as J}from"./external-link-CIrc7yHB.js";import{I as K}from"./image-DDgd2sPC.js";import{L as X}from"./layers-CY6ZhHm5.js";function Z(e){if(!e)return"Writer";const t=(e==null?void 0:e.name)||(e==null?void 0:e.full_name)||(e==null?void 0:e.fullName)||(e==null?void 0:e.username)||(e==null?void 0:e.first_name)||(e==null?void 0:e.firstName)||"";return!t||typeof t!="string"?"Writer":t.trim().split(" ")[0]||"Writer"}function rr(e=""){const t=new Date().getHours();return t<12?`Good morning, ${e}`:t<17?`Good afternoon, ${e}`:`Good evening, ${e}`}function f(e){const t=String(e||"").trim().toLowerCase();return t==="active"||t==="published"?" is-active":t==="trial"||t==="trialing"?" is-trial":""}function b({title:e,value:t,icon:d,hint:o}){return r.jsxs("article",{className:"writer-dashboard-stat",children:[r.jsxs("div",{className:"writer-dashboard-stat-top",children:[r.jsxs("div",{children:[r.jsx("p",{className:"writer-dashboard-stat-label",children:e}),r.jsx("strong",{className:"writer-dashboard-stat-value",children:t})]}),r.jsx("span",{className:"writer-dashboard-stat-icon","aria-hidden":"true",children:r.jsx(d,{size:17,strokeWidth:1.7})})]}),r.jsx("p",{className:"writer-dashboard-stat-hint",children:o})]})}function p({title:e,text:t,to:d,icon:o}){return r.jsxs(h,{to:d,className:"writer-dashboard-action-card",children:[r.jsx("span",{className:"writer-dashboard-action-icon","aria-hidden":"true",children:r.jsx(o,{size:17,strokeWidth:1.7})}),r.jsxs("span",{className:"writer-dashboard-action-copy",children:[r.jsx("strong",{children:e}),r.jsx("span",{children:t})]}),r.jsx(x,{size:15,strokeWidth:1.7,className:"writer-dashboard-action-arrow","aria-hidden":"true"})]})}function E({items:e,kind:t,emptyIcon:d,emptyText:o}){return e.length?r.jsx("div",{className:"writer-dashboard-activity-list",children:e.map(n=>r.jsxs("div",{className:"writer-dashboard-activity-row",children:[r.jsxs("div",{className:"writer-dashboard-activity-copy",children:[r.jsx("strong",{children:n.title||(t==="product"?"Untitled product":"Untitled post")}),r.jsx("span",{children:t==="product"?"Product item":"Post item"})]}),r.jsx("span",{className:`writer-dashboard-status${f(n.status)}`,children:n.status||"Draft"})]},n.id))}):r.jsxs("div",{className:"writer-dashboard-empty-compact",children:[r.jsx(d,{size:19,strokeWidth:1.6}),r.jsx("span",{children:o})]})}function nr(){var k,z,W,S,P,C,_,L,R;const{user:e}=F(),[t,d]=c.useState(null),[o,n]=c.useState(!0),[m,u]=c.useState(!1),[j,y]=c.useState(""),v=c.useMemo(()=>Z(e),[e]),G=c.useMemo(()=>rr(v),[v]),N=async(T=!1)=>{var D,A;try{y(""),T?u(!0):n(!0);const{data:l}=await B.get("/api/affiliate/dashboard");d((l==null?void 0:l.dashboard)||null)}catch(l){y(((A=(D=l==null?void 0:l.response)==null?void 0:D.data)==null?void 0:A.message)||"Failed to load dashboard")}finally{n(!1),u(!1)}};c.useEffect(()=>{N()},[]);const a=(t==null?void 0:t.stats)||{},s=(t==null?void 0:t.website)||null,i=(t==null?void 0:t.subscription)||null,$=((k=t==null?void 0:t.recent)==null?void 0:k.products)||[],I=((z=t==null?void 0:t.recent)==null?void 0:z.posts)||[];return o?r.jsxs("div",{className:"writer-dashboard-page",children:[r.jsx("style",{children:M}),r.jsxs("div",{className:"writer-dashboard-loading",children:[r.jsx("span",{className:"writer-dashboard-spinner"}),r.jsx("strong",{children:"Loading dashboard..."}),r.jsx("span",{children:"Preparing your Writer overview."})]})]}):r.jsxs("div",{className:"writer-dashboard-page",children:[r.jsx("style",{children:M}),r.jsxs("section",{className:"writer-dashboard-hero",children:[r.jsxs("div",{className:"writer-dashboard-hero-copy",children:[r.jsx("p",{className:"writer-dashboard-eyebrow",children:"Writer overview"}),r.jsx("h1",{children:G}),r.jsx("p",{className:"writer-dashboard-lead",children:"Manage your Writer Space, publishing, products, audience and performance from one clear workspace."})]}),r.jsxs("div",{className:"writer-dashboard-hero-actions",children:[r.jsx(h,{to:"/affiliate/products/create",className:"writer-dashboard-button primary",children:"Add product"}),r.jsxs("button",{type:"button",className:"writer-dashboard-button secondary",onClick:()=>N(!0),disabled:m,children:[r.jsx(U,{size:15,strokeWidth:1.8,className:m?"spin":""}),m?"Refreshing...":"Refresh"]})]})]}),j?r.jsxs("div",{className:"writer-dashboard-error",role:"alert",children:[r.jsx("strong",{children:"Dashboard could not refresh."}),r.jsx("span",{children:j})]}):null,r.jsxs("section",{className:"writer-dashboard-stats","aria-label":"Writer statistics",children:[r.jsx(b,{title:"Products",value:((W=a==null?void 0:a.products)==null?void 0:W.total_products)||0,icon:g,hint:"Total products inside your store"}),r.jsx(b,{title:"Posts",value:((S=a==null?void 0:a.posts)==null?void 0:S.total_posts)||0,icon:w,hint:"Published and drafted blog content"}),r.jsx(b,{title:"Product views",value:((P=a==null?void 0:a.analytics)==null?void 0:P.total_product_views)||0,icon:Y,hint:"How many times visitors viewed products"}),r.jsx(b,{title:"Product clicks",value:((C=a==null?void 0:a.analytics)==null?void 0:C.total_product_clicks)||0,icon:q,hint:"Writer click activity from your pages"})]}),r.jsxs("section",{className:"writer-dashboard-overview-grid",children:[r.jsxs("article",{className:"writer-dashboard-panel writer-dashboard-store-panel",children:[r.jsxs("div",{className:"writer-dashboard-panel-head",children:[r.jsxs("div",{children:[r.jsx("p",{className:"writer-dashboard-panel-kicker",children:"Storefront"}),r.jsx("h2",{children:"Store overview"})]}),r.jsxs(h,{to:"/affiliate/website",className:"writer-dashboard-text-link",children:["Open page",r.jsx(x,{size:14,strokeWidth:1.7})]})]}),s?r.jsxs("div",{className:"writer-dashboard-store-grid",children:[r.jsxs("div",{className:"writer-dashboard-detail",children:[r.jsx("span",{children:"Website name"}),r.jsx("strong",{children:s.website_name||"-"})]}),r.jsxs("div",{className:"writer-dashboard-detail",children:[r.jsx("span",{children:"Slug"}),r.jsx("strong",{children:s.slug||"-"})]}),r.jsxs("div",{className:"writer-dashboard-detail",children:[r.jsx("span",{children:"Status"}),r.jsx("strong",{className:`writer-dashboard-status${f(s.status)}`,children:s.status||"Draft"})]}),r.jsxs("div",{className:"writer-dashboard-detail wide",children:[r.jsx("span",{children:"Public URL"}),s.public_url?r.jsxs("a",{href:s.public_url,target:"_blank",rel:"noreferrer",className:"writer-dashboard-public-link",children:[r.jsx("span",{children:s.public_url}),r.jsx(J,{size:13,strokeWidth:1.7})]}):r.jsx("strong",{children:"-"})]})]}):r.jsxs("div",{className:"writer-dashboard-empty",children:[r.jsx("span",{className:"writer-dashboard-empty-icon",children:r.jsx(H,{size:20,strokeWidth:1.6})}),r.jsxs("div",{children:[r.jsx("strong",{children:"No website created yet"}),r.jsx("p",{children:"Create your Writer Space to start showing products and posts."})]}),r.jsx(h,{to:"/affiliate/website",className:"writer-dashboard-button secondary compact",children:"Set up website"})]})]}),r.jsxs("article",{className:"writer-dashboard-panel",children:[r.jsxs("div",{className:"writer-dashboard-panel-head",children:[r.jsxs("div",{children:[r.jsx("p",{className:"writer-dashboard-panel-kicker",children:"Subscription"}),r.jsx("h2",{children:"Plan details"})]}),r.jsxs(h,{to:"/affiliate/subscription",className:"writer-dashboard-text-link",children:["Manage",r.jsx(x,{size:14,strokeWidth:1.7})]})]}),i?r.jsxs("div",{className:"writer-dashboard-plan-list",children:[r.jsxs("div",{children:[r.jsx("span",{children:"Status"}),r.jsx("strong",{className:`writer-dashboard-status${f(i.status)}`,children:i.status||"-"})]}),r.jsxs("div",{children:[r.jsx("span",{children:"Plan"}),r.jsx("strong",{children:((_=i.plan)==null?void 0:_.name)||"-"})]}),r.jsxs("div",{children:[r.jsx("span",{children:"Price"}),r.jsx("strong",{children:((L=i.plan)==null?void 0:L.price)!==null&&((R=i.plan)==null?void 0:R.price)!==void 0?V(i.plan.price):"-"})]}),r.jsxs("div",{children:[r.jsx("span",{children:"Ends"}),r.jsx("strong",{children:i.end_date||i.trial_end||"-"})]})]}):r.jsx("div",{className:"writer-dashboard-empty-compact plan-empty",children:r.jsx("span",{children:"No subscription yet."})})]})]}),r.jsxs("section",{className:"writer-dashboard-section",children:[r.jsx("div",{className:"writer-dashboard-section-head",children:r.jsxs("div",{children:[r.jsx("p",{className:"writer-dashboard-panel-kicker",children:"Shortcuts"}),r.jsx("h2",{children:"Quick actions"})]})}),r.jsxs("div",{className:"writer-dashboard-actions-grid",children:[r.jsx(p,{title:"Manage products",text:"Add products, edit details, and prepare links for your storefront.",to:"/affiliate/products",icon:g}),r.jsx(p,{title:"Create post",text:"Write content that supports your products and drives clicks.",to:"/affiliate/posts/create",icon:w}),r.jsx(p,{title:"Customize design",text:"Control the look and feel of your Writer Space.",to:"/affiliate/design",icon:O}),r.jsx(p,{title:"Media library",text:"Manage images and media used across your Writer Space.",to:"/affiliate/media",icon:K}),r.jsx(p,{title:"Analytics",text:"Review product views, clicks and performance.",to:"/affiliate/analytics",icon:Q}),r.jsx(p,{title:"Templates",text:"Choose the layout style for your Writer Space.",to:"/affiliate/templates/choose",icon:X})]})]}),r.jsxs("section",{className:"writer-dashboard-activity-grid",children:[r.jsxs("article",{className:"writer-dashboard-panel",children:[r.jsxs("div",{className:"writer-dashboard-panel-head",children:[r.jsxs("div",{children:[r.jsx("p",{className:"writer-dashboard-panel-kicker",children:"Recent products"}),r.jsx("h2",{children:"Latest product activity"})]}),r.jsxs(h,{to:"/affiliate/products",className:"writer-dashboard-text-link",children:["View all",r.jsx(x,{size:14,strokeWidth:1.7})]})]}),r.jsx(E,{items:$,kind:"product",emptyIcon:g,emptyText:"No products yet."})]}),r.jsxs("article",{className:"writer-dashboard-panel",children:[r.jsxs("div",{className:"writer-dashboard-panel-head",children:[r.jsxs("div",{children:[r.jsx("p",{className:"writer-dashboard-panel-kicker",children:"Recent posts"}),r.jsx("h2",{children:"Latest content activity"})]}),r.jsxs(h,{to:"/affiliate/posts/create",className:"writer-dashboard-text-link",children:["Open posts",r.jsx(x,{size:14,strokeWidth:1.7})]})]}),r.jsx(E,{items:I,kind:"post",emptyIcon:w,emptyText:"No posts yet."})]})]})]})}const M=`
  * {
    box-sizing: border-box;
  }

  .writer-dashboard-page {
    width: 100%;
    max-width: 1320px;
    margin: 0 auto;
    color: #17191f;
  }

  .writer-dashboard-hero {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 28px;
    margin-bottom: 24px;
  }

  .writer-dashboard-hero-copy {
    min-width: 0;
    max-width: 720px;
  }

  .writer-dashboard-eyebrow,
  .writer-dashboard-panel-kicker {
    margin: 0 0 7px;
    color: #8a929c;
    font-size: 9px;
    line-height: 1.35;
    font-weight: 800;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  .writer-dashboard-hero h1 {
    margin: 0;
    color: #17191f;
    font-size: clamp(28px, 3vw, 38px);
    line-height: 1.08;
    font-weight: 760;
    letter-spacing: -0.035em;
  }

  .writer-dashboard-lead {
    margin: 11px 0 0;
    color: #69727e;
    max-width: 660px;
    font-size: 13px;
    line-height: 1.55;
  }

  .writer-dashboard-hero-actions {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-shrink: 0;
  }

  .writer-dashboard-button {
    min-height: 39px;
    border-radius: 8px;
    padding: 0 14px;
    border: 1px solid transparent;
    font: inherit;
    font-size: 11px;
    line-height: 1;
    font-weight: 700;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  .writer-dashboard-button.primary {
    background: #1c1f24;
    border-color: #1c1f24;
    color: #ffffff;
  }

  .writer-dashboard-button.primary:hover {
    background: #292d33;
  }

  .writer-dashboard-button.secondary {
    background: #ffffff;
    border-color: #d9dde1;
    color: #3f4752;
  }

  .writer-dashboard-button.secondary:hover {
    background: #f8f9fa;
    border-color: #cbd0d5;
  }

  .writer-dashboard-button:disabled {
    cursor: not-allowed;
    opacity: 0.62;
  }

  .writer-dashboard-button.compact {
    min-height: 34px;
    padding-inline: 12px;
  }

  .writer-dashboard-error {
    margin: 0 0 18px;
    min-height: 48px;
    padding: 11px 14px;
    border: 1px solid #edd3d0;
    border-radius: 8px;
    background: #fff8f7;
    display: flex;
    align-items: center;
    gap: 9px;
    flex-wrap: wrap;
    color: #7d332e;
    font-size: 11px;
  }

  .writer-dashboard-error strong {
    color: #612520;
  }

  .writer-dashboard-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    border: 1px solid #dfe3e6;
    border-radius: 10px;
    overflow: hidden;
    background: #ffffff;
    margin-bottom: 18px;
  }

  .writer-dashboard-stat {
    min-width: 0;
    min-height: 120px;
    padding: 18px 19px;
    background: #ffffff;
  }

  .writer-dashboard-stat + .writer-dashboard-stat {
    border-left: 1px solid #e6e9eb;
  }

  .writer-dashboard-stat-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .writer-dashboard-stat-label {
    margin: 0 0 8px;
    color: #717a85;
    font-size: 10px;
    line-height: 1.3;
    font-weight: 650;
  }

  .writer-dashboard-stat-value {
    display: block;
    color: #17191f;
    font-size: 28px;
    line-height: 1;
    font-weight: 730;
    letter-spacing: -0.035em;
  }

  .writer-dashboard-stat-icon {
    width: 30px;
    height: 30px;
    border-radius: 7px;
    display: grid;
    place-items: center;
    background: #f4f5f6;
    color: #717984;
    flex-shrink: 0;
  }

  .writer-dashboard-stat-hint {
    margin: 14px 0 0;
    color: #979ea7;
    font-size: 9.5px;
    line-height: 1.4;
  }

  .writer-dashboard-overview-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.55fr) minmax(280px, 0.75fr);
    gap: 18px;
    margin-bottom: 22px;
  }

  .writer-dashboard-panel {
    min-width: 0;
    border: 1px solid #dfe3e6;
    border-radius: 10px;
    background: #ffffff;
    padding: 19px;
  }

  .writer-dashboard-panel-head,
  .writer-dashboard-section-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .writer-dashboard-panel-head {
    padding-bottom: 15px;
    border-bottom: 1px solid #eceeef;
  }

  .writer-dashboard-panel h2,
  .writer-dashboard-section-head h2 {
    margin: 0;
    color: #24272c;
    font-size: 14px;
    line-height: 1.3;
    font-weight: 720;
    letter-spacing: -0.015em;
  }

  .writer-dashboard-text-link {
    color: #5c6570;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 10.5px;
    line-height: 1.3;
    font-weight: 700;
    white-space: nowrap;
  }

  .writer-dashboard-text-link:hover {
    color: #17191f;
  }

  .writer-dashboard-store-grid {
    padding-top: 16px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .writer-dashboard-detail {
    min-width: 0;
    min-height: 66px;
    padding: 12px;
    border: 1px solid #ebedef;
    border-radius: 8px;
    background: #fafafa;
    display: grid;
    align-content: start;
    gap: 6px;
  }

  .writer-dashboard-detail.wide {
    grid-column: 1 / -1;
  }

  .writer-dashboard-detail > span,
  .writer-dashboard-plan-list > div > span {
    color: #949ba4;
    font-size: 9px;
    line-height: 1.3;
    font-weight: 650;
  }

  .writer-dashboard-detail > strong,
  .writer-dashboard-plan-list > div > strong {
    min-width: 0;
    color: #353a42;
    font-size: 11px;
    line-height: 1.4;
    font-weight: 680;
    overflow-wrap: anywhere;
  }

  .writer-dashboard-public-link {
    min-width: 0;
    color: #4d5968;
    font-size: 10.5px;
    line-height: 1.4;
    font-weight: 650;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    text-decoration: none;
  }

  .writer-dashboard-public-link span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .writer-dashboard-status {
    width: fit-content;
    max-width: 100%;
    min-height: 22px;
    padding: 0 8px;
    border: 1px solid #dde1e5;
    border-radius: 999px;
    background: #f5f6f7;
    color: #6b737d;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 9px !important;
    line-height: 1;
    font-weight: 750 !important;
    text-transform: capitalize;
    white-space: nowrap;
  }

  .writer-dashboard-status.is-active {
    border-color: #d5e2d9;
    background: #f2f7f3;
    color: #496653;
  }

  .writer-dashboard-status.is-trial {
    border-color: #e6dfcf;
    background: #faf8f2;
    color: #746545;
  }

  .writer-dashboard-plan-list {
    padding-top: 6px;
    display: grid;
  }

  .writer-dashboard-plan-list > div {
    min-height: 47px;
    border-bottom: 1px solid #eff1f2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .writer-dashboard-plan-list > div:last-child {
    border-bottom: 0;
  }

  .writer-dashboard-plan-list > div > strong {
    text-align: right;
  }

  .writer-dashboard-empty {
    min-height: 142px;
    display: grid;
    grid-template-columns: 38px minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
    padding-top: 14px;
  }

  .writer-dashboard-empty-icon {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    background: #f4f5f6;
    color: #727b86;
  }

  .writer-dashboard-empty strong {
    color: #343941;
    font-size: 12px;
  }

  .writer-dashboard-empty p {
    margin: 5px 0 0;
    color: #8a929c;
    font-size: 10px;
    line-height: 1.45;
  }

  .writer-dashboard-empty-compact {
    min-height: 90px;
    color: #8b939d;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 10.5px;
  }

  .writer-dashboard-empty-compact.plan-empty {
    min-height: 146px;
  }

  .writer-dashboard-section {
    margin-bottom: 22px;
  }

  .writer-dashboard-section-head {
    margin-bottom: 11px;
  }

  .writer-dashboard-actions-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .writer-dashboard-action-card {
    min-width: 0;
    min-height: 82px;
    padding: 14px;
    border: 1px solid #dfe3e6;
    border-radius: 9px;
    background: #ffffff;
    color: inherit;
    text-decoration: none;
    display: grid;
    grid-template-columns: 31px minmax(0, 1fr) 16px;
    align-items: center;
    gap: 11px;
    transition: border-color 0.15s ease, transform 0.15s ease;
  }

  .writer-dashboard-action-card:hover {
    border-color: #cbd0d5;
    transform: translateY(-1px);
  }

  .writer-dashboard-action-icon {
    width: 31px;
    height: 31px;
    border-radius: 7px;
    display: grid;
    place-items: center;
    background: #f4f5f6;
    color: #626c78;
  }

  .writer-dashboard-action-copy {
    min-width: 0;
    display: grid;
    gap: 4px;
  }

  .writer-dashboard-action-copy strong {
    color: #343940;
    font-size: 11px;
    line-height: 1.3;
    font-weight: 710;
  }

  .writer-dashboard-action-copy > span {
    color: #9299a2;
    font-size: 9px;
    line-height: 1.45;
  }

  .writer-dashboard-action-arrow {
    color: #a0a6ad;
  }

  .writer-dashboard-activity-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .writer-dashboard-activity-list {
    display: grid;
  }

  .writer-dashboard-activity-row {
    min-height: 61px;
    border-bottom: 1px solid #eff1f2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .writer-dashboard-activity-row:last-child {
    border-bottom: 0;
  }

  .writer-dashboard-activity-copy {
    min-width: 0;
    display: grid;
    gap: 3px;
  }

  .writer-dashboard-activity-copy strong {
    color: #353a41;
    font-size: 11px;
    line-height: 1.35;
    font-weight: 690;
    overflow-wrap: anywhere;
  }

  .writer-dashboard-activity-copy span {
    color: #9aa1a9;
    font-size: 9px;
    line-height: 1.3;
  }

  .writer-dashboard-loading {
    min-height: 62vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 7px;
    color: #747d88;
    font-size: 10px;
    text-align: center;
  }

  .writer-dashboard-loading strong {
    color: #333941;
    font-size: 12px;
  }

  .writer-dashboard-spinner {
    width: 26px;
    height: 26px;
    margin-bottom: 5px;
    border-radius: 999px;
    border: 2px solid #dfe3e6;
    border-top-color: #343940;
    animation: writerDashboardSpin 0.75s linear infinite;
  }

  .spin {
    animation: writerDashboardSpin 0.75s linear infinite;
  }

  @keyframes writerDashboardSpin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 1120px) {
    .writer-dashboard-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .writer-dashboard-stat + .writer-dashboard-stat {
      border-left: 0;
    }

    .writer-dashboard-stat:nth-child(even) {
      border-left: 1px solid #e6e9eb;
    }

    .writer-dashboard-stat:nth-child(n + 3) {
      border-top: 1px solid #e6e9eb;
    }

    .writer-dashboard-overview-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 800px) {
    .writer-dashboard-actions-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .writer-dashboard-activity-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 600px) {
    .writer-dashboard-page {
      max-width: none;
    }

    .writer-dashboard-hero {
      display: grid;
      gap: 18px;
      margin-bottom: 18px;
    }

    .writer-dashboard-eyebrow {
      margin-bottom: 6px;
    }

    .writer-dashboard-hero h1 {
      font-size: 29px;
      line-height: 1.08;
    }

    .writer-dashboard-lead {
      margin-top: 9px;
      font-size: 12px;
      line-height: 1.5;
    }

    .writer-dashboard-hero-actions {
      width: 100%;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
    }

    .writer-dashboard-button {
      min-height: 42px;
    }

    .writer-dashboard-hero-actions .writer-dashboard-button.primary {
      grid-column: 1;
      grid-row: 1;
    }

    .writer-dashboard-hero-actions .writer-dashboard-button.secondary {
      grid-column: 2;
      grid-row: 1;
      padding-inline: 12px;
    }

    .writer-dashboard-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      margin-bottom: 14px;
    }

    .writer-dashboard-stat {
      min-height: 110px;
      padding: 15px;
    }

    .writer-dashboard-stat-value {
      font-size: 25px;
    }

    .writer-dashboard-stat-hint {
      margin-top: 12px;
      font-size: 9px;
    }

    .writer-dashboard-overview-grid {
      gap: 13px;
      margin-bottom: 18px;
    }

    .writer-dashboard-panel {
      padding: 16px;
    }

    .writer-dashboard-store-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .writer-dashboard-detail:nth-child(3) {
      grid-column: 1 / -1;
    }

    .writer-dashboard-empty {
      grid-template-columns: 38px minmax(0, 1fr);
      align-items: start;
    }

    .writer-dashboard-empty .writer-dashboard-button {
      grid-column: 1 / -1;
      width: 100%;
    }

    .writer-dashboard-actions-grid {
      grid-template-columns: 1fr;
    }

    .writer-dashboard-action-card {
      min-height: 74px;
    }

    .writer-dashboard-activity-grid {
      gap: 13px;
    }
  }
`;export{nr as default};
