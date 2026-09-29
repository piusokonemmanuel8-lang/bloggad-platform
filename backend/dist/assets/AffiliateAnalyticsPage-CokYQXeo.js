import{j as e,X as ne,C as D,p as K,b as re,r as g,R as ee,F as E,a as W}from"./index-LXBBJt7I.js";import{C as le}from"./clock-3-BV9St-rB.js";import{M as ae}from"./mouse-pointer-click-CMFK1dwY.js";import{C as ie}from"./circle-alert-DsZo9igC.js";import{P as B}from"./package-BZvUXVf6.js";import{A as Z}from"./activity-D0Teoumo.js";import{E as ce}from"./eye-l-zUNvi7.js";import{L as oe}from"./layers-CY6ZhHm5.js";import{S as de}from"./shopping-cart-B1cd11Sl.js";import{A as pe}from"./arrow-up-right-DqM_yXQr.js";function k(a){return new Intl.NumberFormat("en-US").format(Number(a||0))}function X(a){const i=Math.max(0,Math.round(Number(a||0))),s=Math.floor(i/60),r=i%60;return s?r?`${s}m ${r}s`:`${s}m`:`${r}s`}function L(a){return`${Number(a||0).toFixed(1)}%`}function xe(a){const i=String(a||"ZZ").toUpperCase();if(i==="ZZ")return"Unknown";try{return new Intl.DisplayNames(["en"],{type:"region"}).of(i)||i}catch{return i}}function M({label:a,value:i,hint:s,icon:r}){return e.jsxs("article",{className:"wpa-metric",children:[e.jsxs("div",{children:[e.jsx("span",{children:a}),e.jsx("strong",{children:i}),s?e.jsx("small",{children:s}):null]}),e.jsx(r,{size:17})]})}function U({title:a,rows:i,labelFor:s=r=>r.label}){return e.jsxs("section",{className:"wpa-section",children:[e.jsx("div",{className:"wpa-section-head",children:e.jsx("h3",{children:a})}),i!=null&&i.length?e.jsx("div",{className:"wpa-breakdown",children:i.map((r,p)=>e.jsxs("div",{className:"wpa-breakdown-row",children:[e.jsxs("div",{children:[e.jsx("strong",{children:s(r)}),e.jsx("span",{children:k(r.readers||r.clicks||0)})]}),e.jsx("div",{className:"wpa-bar",children:e.jsx("span",{style:{width:`${Math.max(2,Number(r.percent||0))}%`}})}),e.jsx("b",{children:L(r.percent||0)})]},`${s(r)}-${p}`))}):e.jsx("div",{className:"wpa-empty",children:"No data yet."})]})}function fe({post:a,data:i,loading:s,error:r,onClose:p,onRetry:c}){var w,A;if(!a)return null;const x=(i==null?void 0:i.post_analytics)||null,f=(x==null?void 0:x.access)||null,d=(x==null?void 0:x.advanced)||null,o=(d==null?void 0:d.summary)||{},u=(d==null?void 0:d.completion_funnel)||{},N=(d==null?void 0:d.reader_types)||{},j=Array.isArray(d==null?void 0:d.links)?d.links:[];return e.jsxs("div",{className:"wpa-backdrop",onMouseDown:p,children:[e.jsx("style",{children:he}),e.jsxs("aside",{className:"wpa-drawer",onMouseDown:t=>t.stopPropagation(),"aria-label":"Post analytics",children:[e.jsxs("header",{className:"wpa-head",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Post Analytics"}),e.jsx("h2",{children:((w=x==null?void 0:x.post)==null?void 0:w.title)||(a==null?void 0:a.title)||"Post"})]}),e.jsx("button",{type:"button",onClick:p,"aria-label":"Close analytics",children:e.jsx(ne,{size:18})})]}),s?e.jsxs("div",{className:"wpa-state",children:[e.jsx("div",{className:"wpa-spinner"}),e.jsx("strong",{children:"Loading post analytics..."})]}):r?e.jsxs("div",{className:"wpa-state error",children:[e.jsx("strong",{children:r}),e.jsx("button",{type:"button",onClick:c,children:"Retry"})]}):x?e.jsxs("div",{className:"wpa-content",children:[e.jsx("section",{className:"wpa-basic",children:e.jsx(M,{label:"Total views",value:k(x.total_views||0),hint:"Existing basic post analytics",icon:D})}),f!=null&&f.advanced_post_analytics?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"wpa-pro-label",children:[e.jsx("span",{children:"PRO POST ANALYTICS"}),e.jsxs("strong",{children:[((A=f==null?void 0:f.plan)==null?void 0:A.name)||"Pro"," access active"]})]}),e.jsxs("section",{className:"wpa-metrics",children:[e.jsx(M,{label:"Unique readers",value:k(o.unique_readers),hint:`${k(o.sessions)} reading sessions`,icon:K}),e.jsx(M,{label:"Engaged readers",value:k(o.engaged_readers),hint:`${L(o.engagement_rate)} engagement`,icon:K}),e.jsx(M,{label:"Average read time",value:X(o.average_reading_time_seconds),hint:o.estimated_read_seconds?`Estimated post read: ${X(o.estimated_read_seconds)}`:"Measured active reading time",icon:le}),e.jsx(M,{label:"Completion rate",value:L(o.completion_rate),hint:`${k(o.completed_readers)} completed readers`,icon:D}),e.jsx(M,{label:"Link clicks",value:k(o.total_link_clicks),hint:`${L(o.link_ctr)} reader CTR`,icon:ae}),e.jsx(M,{label:"Average scroll",value:L(o.average_scroll_percent),hint:"Average furthest reading depth",icon:D})]}),e.jsxs("section",{className:"wpa-section",children:[e.jsxs("div",{className:"wpa-section-head",children:[e.jsx("h3",{children:"Reading completion"}),e.jsx("span",{children:"Where readers reached in the post"})]}),e.jsx("div",{className:"wpa-funnel",children:[["25%",u.reached_25],["50%",u.reached_50],["75%",u.reached_75],["100%",u.reached_100]].map(([t,h])=>{const y=Number(o.unique_readers||0),b=y?Number(h||0)/y*100:0;return e.jsxs("div",{children:[e.jsx("span",{children:t}),e.jsx("div",{children:e.jsx("b",{style:{width:`${Math.max(2,b)}%`}})}),e.jsx("strong",{children:k(h||0)})]},t)})})]}),e.jsxs("div",{className:"wpa-grid",children:[e.jsx(U,{title:"Readers by country",rows:d.countries||[],labelFor:t=>xe(t.country_code)}),e.jsx(U,{title:"Device breakdown",rows:d.devices||[],labelFor:t=>{const h=String(t.device_type||"unknown");return h.charAt(0).toUpperCase()+h.slice(1)}})]}),e.jsxs("div",{className:"wpa-grid",children:[e.jsx(U,{title:"Traffic sources",rows:d.traffic_sources||[],labelFor:t=>t.source||"Other"}),e.jsxs("section",{className:"wpa-section",children:[e.jsx("div",{className:"wpa-section-head",children:e.jsx("h3",{children:"New vs returning readers"})}),e.jsxs("div",{className:"wpa-reader-types",children:[e.jsxs("div",{children:[e.jsx("span",{children:"New readers"}),e.jsx("strong",{children:k(N.new_readers)})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Returning readers"}),e.jsx("strong",{children:k(N.returning_readers)})]})]})]})]}),e.jsxs("section",{className:"wpa-section",children:[e.jsxs("div",{className:"wpa-section-head",children:[e.jsx("h3",{children:"Link performance"}),e.jsx("span",{children:"Links clicked inside the post content"})]}),j.length?e.jsxs("div",{className:"wpa-links",children:[e.jsxs("div",{className:"wpa-link-head",children:[e.jsx("span",{children:"Link"}),e.jsx("span",{children:"Clicks"}),e.jsx("span",{children:"Unique"}),e.jsx("span",{children:"CTR"})]}),j.map(t=>e.jsxs("div",{className:"wpa-link-row",children:[e.jsxs("div",{children:[e.jsx("strong",{children:t.link_text||t.link_url}),e.jsx("small",{title:t.link_url,children:t.link_url})]}),e.jsx("b",{children:k(t.clicks)}),e.jsx("b",{children:k(t.unique_clickers)}),e.jsx("b",{children:L(t.ctr)})]},t.link_hash))]}):e.jsx("div",{className:"wpa-empty",children:"No post-content link clicks have been recorded yet."})]}),Number(o.unknown_country_readers||0)>0?e.jsx("p",{className:"wpa-note",children:"Country is reported when the hosting or proxy layer provides a trusted country header. Readers without that header are shown as Unknown."}):null]}):e.jsxs("section",{className:"wpa-lock",children:[e.jsx("span",{children:"PRO POST ANALYTICS"}),e.jsx("h3",{children:"Advanced reader behavior analytics"}),e.jsx("p",{children:"Your normal analytics remain available. Advanced post analytics, including reading time, completion, audience countries, traffic sources, devices, and link behavior, is included with Pro and Unlimited Writer plans."}),e.jsx("a",{href:"/writer/plan",children:"View Pro plans"})]})]}):null]})]})}const he=`
  .wpa-backdrop,
  .wpa-backdrop * {
    box-sizing: border-box;
  }

  .wpa-backdrop {
    position: fixed;
    inset: 0;
    z-index: 2400;
    display: flex;
    justify-content: flex-end;
    background: rgba(15, 23, 42, 0.35);
  }

  .wpa-drawer {
    width: min(760px, 92vw);
    height: 100%;
    overflow-y: auto;
    background: #f8fafc;
    border-left: 1px solid #dfe3e8;
    box-shadow: -18px 0 48px rgba(15, 23, 42, 0.12);
  }

  .wpa-head {
    position: sticky;
    top: 0;
    z-index: 3;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    padding: 20px 22px;
    border-bottom: 1px solid #e5e7eb;
    background: rgba(255, 255, 255, 0.98);
  }

  .wpa-head span,
  .wpa-pro-label span,
  .wpa-lock > span {
    color: #6b7280;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.07em;
  }

  .wpa-head h2 {
    margin: 5px 0 0;
    color: #111827;
    font-size: 19px;
    line-height: 1.3;
  }

  .wpa-head button {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    border: 1px solid #dfe3e8;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
  }

  .wpa-content {
    padding: 18px 20px 28px;
  }

  .wpa-state {
    min-height: 320px;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 12px;
    color: #475569;
  }

  .wpa-state.error {
    color: #991b1b;
  }

  .wpa-state button,
  .wpa-lock a {
    min-height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 14px;
    border: 1px solid #111827;
    border-radius: 7px;
    background: #111827;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
  }

  .wpa-spinner {
    width: 26px;
    height: 26px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    border-radius: 50%;
    animation: wpaSpin .75s linear infinite;
  }

  @keyframes wpaSpin {
    to { transform: rotate(360deg); }
  }

  .wpa-basic {
    margin-bottom: 14px;
  }

  .wpa-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 14px;
  }

  .wpa-metric {
    min-width: 0;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    padding: 14px;
    border: 1px solid #e1e5e9;
    border-radius: 9px;
    background: #fff;
  }

  .wpa-metric span,
  .wpa-metric small {
    display: block;
    color: #7b8490;
    font-size: 9px;
  }

  .wpa-metric strong {
    display: block;
    margin: 7px 0 6px;
    color: #111827;
    font-size: 21px;
  }

  .wpa-metric svg {
    flex: 0 0 auto;
    color: #6b7280;
  }

  .wpa-pro-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 0 0 12px;
    padding: 10px 12px;
    border: 1px solid #dfe3e8;
    border-radius: 8px;
    background: #fff;
  }

  .wpa-pro-label strong {
    color: #166534;
    font-size: 10px;
  }

  .wpa-lock {
    padding: 24px;
    border: 1px solid #dfe3e8;
    border-radius: 10px;
    background: #fff;
  }

  .wpa-lock h3 {
    margin: 7px 0 8px;
    color: #111827;
    font-size: 18px;
  }

  .wpa-lock p {
    max-width: 620px;
    margin: 0 0 16px;
    color: #667085;
    font-size: 12px;
    line-height: 1.7;
  }

  .wpa-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 12px;
  }

  .wpa-section {
    min-width: 0;
    margin-bottom: 12px;
    padding: 16px;
    border: 1px solid #e1e5e9;
    border-radius: 9px;
    background: #fff;
  }

  .wpa-section-head {
    margin-bottom: 13px;
  }

  .wpa-section-head h3 {
    margin: 0 0 4px;
    color: #111827;
    font-size: 13px;
  }

  .wpa-section-head span {
    color: #8a94a1;
    font-size: 9px;
  }

  .wpa-funnel {
    display: grid;
    gap: 9px;
  }

  .wpa-funnel > div {
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr) 52px;
    align-items: center;
    gap: 9px;
  }

  .wpa-funnel span,
  .wpa-funnel strong {
    font-size: 10px;
  }

  .wpa-funnel > div > div {
    height: 7px;
    overflow: hidden;
    border-radius: 999px;
    background: #eef1f4;
  }

  .wpa-funnel b {
    height: 100%;
    display: block;
    border-radius: inherit;
    background: #252a31;
  }

  .wpa-breakdown {
    display: grid;
    gap: 10px;
  }

  .wpa-breakdown-row {
    display: grid;
    grid-template-columns: minmax(100px, 1fr) minmax(80px, 1fr) 44px;
    align-items: center;
    gap: 9px;
  }

  .wpa-breakdown-row > div:first-child {
    min-width: 0;
  }

  .wpa-breakdown-row strong,
  .wpa-breakdown-row span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 9px;
  }

  .wpa-breakdown-row span {
    margin-top: 2px;
    color: #98a1ab;
  }

  .wpa-breakdown-row b {
    font-size: 9px;
    text-align: right;
  }

  .wpa-bar {
    height: 6px;
    overflow: hidden;
    border-radius: 999px;
    background: #eef1f4;
  }

  .wpa-bar span {
    height: 100%;
    display: block;
    border-radius: inherit;
    background: #475569;
  }

  .wpa-reader-types {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 9px;
  }

  .wpa-reader-types > div {
    padding: 13px;
    border: 1px solid #edf0f2;
    border-radius: 8px;
  }

  .wpa-reader-types span {
    display: block;
    color: #8a94a1;
    font-size: 9px;
  }

  .wpa-reader-types strong {
    display: block;
    margin-top: 7px;
    font-size: 19px;
  }

  .wpa-links {
    overflow-x: auto;
  }

  .wpa-link-head,
  .wpa-link-row {
    min-width: 590px;
    display: grid;
    grid-template-columns: minmax(250px, 1fr) 70px 70px 70px;
    gap: 10px;
    align-items: center;
  }

  .wpa-link-head {
    padding: 0 8px 8px;
    color: #8a94a1;
    font-size: 9px;
    font-weight: 700;
  }

  .wpa-link-row {
    padding: 10px 8px;
    border-top: 1px solid #edf0f2;
  }

  .wpa-link-row > div {
    min-width: 0;
  }

  .wpa-link-row strong,
  .wpa-link-row small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .wpa-link-row strong {
    font-size: 10px;
  }

  .wpa-link-row small {
    margin-top: 3px;
    color: #98a1ab;
    font-size: 8px;
  }

  .wpa-link-row b {
    font-size: 9px;
  }

  .wpa-empty,
  .wpa-note {
    color: #8a94a1;
    font-size: 10px;
    line-height: 1.6;
  }

  .wpa-note {
    margin: 4px 0 0;
    padding: 10px 12px;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    background: #fff;
  }

  @media (max-width: 760px) {
    .wpa-drawer {
      width: 100vw;
    }

    .wpa-content {
      padding: 14px;
    }

    .wpa-metrics,
    .wpa-grid {
      grid-template-columns: 1fr;
    }

    .wpa-head {
      padding: 16px;
    }

    .wpa-head h2 {
      font-size: 16px;
    }
  }
`;function C({title:a,value:i,icon:s,hint:r}){return e.jsxs("div",{className:"affiliate-analytics-stat-card",children:[e.jsxs("div",{className:"affiliate-analytics-stat-top",children:[e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-analytics-stat-label",children:a}),e.jsx("h3",{className:"affiliate-analytics-stat-value",children:i})]}),e.jsx("div",{className:"affiliate-analytics-stat-icon",children:e.jsx(s,{size:20})})]}),e.jsx("p",{className:"affiliate-analytics-stat-hint",children:r})]})}function G({title:a,rows:i=[]}){return e.jsxs("div",{className:"affiliate-analytics-item-card",children:[e.jsx("h3",{children:a}),e.jsx("div",{className:"affiliate-analytics-item-rows",children:i.map(s=>e.jsxs("div",{className:"affiliate-analytics-item-row",children:[e.jsx("span",{children:s.label}),e.jsx("strong",{children:s.value})]},s.label))})]})}function me(){const[a,i]=g.useState(null),[s,r]=g.useState(!0),[p,c]=g.useState(!1),[x,f]=g.useState(""),d=async(t=!1)=>{var h,y;try{f(""),t?c(!0):r(!0);const{data:b}=await W.get("/api/affiliate/analytics");i((b==null?void 0:b.analytics)||null)}catch(b){f(((y=(h=b==null?void 0:b.response)==null?void 0:h.data)==null?void 0:y.message)||"Failed to load analytics")}finally{r(!1),c(!1)}};g.useEffect(()=>{d()},[]);const o=(a==null?void 0:a.overview)||{},u=(a==null?void 0:a.click_breakdown)||{},N=(a==null?void 0:a.top_products)||[],j=(a==null?void 0:a.top_posts)||[],w=(a==null?void 0:a.recent_activity)||[],A=g.useMemo(()=>(u.read_more||0)+(u.learn_more||0),[u]);return s?e.jsxs("div",{className:"affiliate-analytics-page",children:[e.jsx("style",{children:H}),e.jsx("div",{className:"affiliate-analytics-loading-wrap",children:e.jsxs("div",{className:"affiliate-analytics-loading-card",children:[e.jsx("div",{className:"affiliate-analytics-spinner"}),e.jsx("p",{children:"Loading analytics..."})]})})]}):e.jsxs("div",{className:"affiliate-analytics-page",children:[e.jsx("style",{children:H}),e.jsxs("section",{className:"affiliate-analytics-hero",children:[e.jsxs("div",{className:"affiliate-analytics-hero-copy",children:[e.jsx("div",{className:"affiliate-analytics-badge",children:"Performance overview"}),e.jsx("h1",{className:"affiliate-analytics-title",children:"Analytics"}),e.jsx("p",{className:"affiliate-analytics-subtitle",children:"Track product views, clicks, post performance, slider activity, and recent website events."})]}),e.jsx("div",{className:"affiliate-analytics-hero-actions",children:e.jsxs("button",{type:"button",className:"affiliate-analytics-btn secondary",onClick:()=>d(!0),disabled:p,children:[e.jsx(ee,{size:16,className:p?"spin":""}),p?"Refreshing...":"Refresh"]})})]}),x?e.jsxs("div",{className:"affiliate-analytics-alert error",children:[e.jsx(ie,{size:18}),e.jsx("span",{children:x})]}):null,e.jsxs("section",{className:"affiliate-analytics-stats-grid",children:[e.jsx(C,{title:"Products",value:o.total_products||0,icon:B,hint:"Total products in your affiliate store"}),e.jsx(C,{title:"Posts",value:o.total_posts||0,icon:E,hint:"Total content posts created"}),e.jsx(C,{title:"Product Views",value:o.total_product_views||0,icon:ce,hint:"All product page views"}),e.jsx(C,{title:"Product Clicks",value:o.total_product_clicks||0,icon:ae,hint:"All product click actions"})]}),e.jsxs("section",{className:"affiliate-analytics-stats-grid second",children:[e.jsx(C,{title:"Post Views",value:o.total_post_views||0,icon:D,hint:"All content views across posts"}),e.jsx(C,{title:"Slider Clicks",value:o.total_slider_clicks||0,icon:oe,hint:"Clicks coming from sliders"}),e.jsx(C,{title:"Buy Now Clicks",value:u.buy_now||0,icon:de,hint:"Direct buy intent clicks"}),e.jsx(C,{title:"Read More / Learn More",value:A,icon:pe,hint:"Informational CTA clicks"})]}),e.jsxs("section",{className:"affiliate-analytics-main-grid",children:[e.jsxs("div",{className:"affiliate-analytics-panel",children:[e.jsx("div",{className:"affiliate-analytics-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-analytics-panel-kicker",children:"Top products"}),e.jsx("h2",{className:"affiliate-analytics-panel-title",children:"Best performing products"})]})}),N.length?e.jsx("div",{className:"affiliate-analytics-list",children:N.map(t=>e.jsx(G,{title:t.title,rows:[{label:"Views",value:t.total_views||0},{label:"Clicks",value:t.total_clicks||0},{label:"Posts",value:t.total_posts||0}]},t.id))}):e.jsxs("div",{className:"affiliate-analytics-empty-small",children:[e.jsx(B,{size:24}),e.jsx("p",{children:"No product analytics yet."})]})]}),e.jsxs("div",{className:"affiliate-analytics-panel",children:[e.jsx("div",{className:"affiliate-analytics-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-analytics-panel-kicker",children:"Top posts"}),e.jsx("h2",{className:"affiliate-analytics-panel-title",children:"Best performing posts"})]})}),j.length?e.jsx("div",{className:"affiliate-analytics-list",children:j.map(t=>{var h;return e.jsx(G,{title:t.title,rows:[{label:"Views",value:t.total_views||0},{label:"CTA Buttons",value:t.total_cta_buttons||0},{label:"Product",value:((h=t.product)==null?void 0:h.title)||"-"}]},t.id)})}):e.jsxs("div",{className:"affiliate-analytics-empty-small",children:[e.jsx(E,{size:24}),e.jsx("p",{children:"No post analytics yet."})]})]})]}),e.jsxs("section",{className:"affiliate-analytics-panel",children:[e.jsx("div",{className:"affiliate-analytics-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-analytics-panel-kicker",children:"Recent activity"}),e.jsx("h2",{className:"affiliate-analytics-panel-title",children:"Latest tracked actions"})]})}),w.length?e.jsx("div",{className:"affiliate-analytics-activity-list",children:w.map(t=>{var h,y;return e.jsxs("div",{className:"affiliate-analytics-activity-card",children:[e.jsx("div",{className:"affiliate-analytics-activity-icon",children:e.jsx(Z,{size:18})}),e.jsxs("div",{className:"affiliate-analytics-activity-main",children:[e.jsx("h3",{children:t.activity_type||"-"}),e.jsxs("div",{className:"affiliate-analytics-activity-grid",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Click Type"}),e.jsx("strong",{children:t.click_type||"-"})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Product"}),e.jsx("strong",{children:((h=t.product)==null?void 0:h.title)||"-"})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Post"}),e.jsx("strong",{children:((y=t.post)==null?void 0:y.title)||"-"})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Date"}),e.jsx("strong",{children:t.created_at||"-"})]})]})]})]},`${t.activity_type}-${t.id}`)})}):e.jsxs("div",{className:"affiliate-analytics-empty",children:[e.jsx(Z,{size:30}),e.jsx("h3",{children:"No recent analytics activity yet"}),e.jsx("p",{children:"Tracked actions will appear here once users start interacting with your store."})]})]})]})}const H=`
  * {
    box-sizing: border-box;
  }

  .affiliate-analytics-page {
    width: 100%;
  }

  .affiliate-analytics-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-analytics-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-analytics-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliateAnalyticsSpin 0.8s linear infinite;
  }

  @keyframes affiliateAnalyticsSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: affiliateAnalyticsSpin 0.8s linear infinite;
  }

  .affiliate-analytics-hero {
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

  .affiliate-analytics-badge {
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

  .affiliate-analytics-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-analytics-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-analytics-hero-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-analytics-btn {
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

  .affiliate-analytics-btn.secondary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .affiliate-analytics-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 20px;
  }

  .affiliate-analytics-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-analytics-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .affiliate-analytics-stat-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 22px;
    padding: 20px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-analytics-stat-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .affiliate-analytics-stat-label {
    margin: 0 0 10px;
    font-size: 13px;
    color: #6b7280;
    font-weight: 700;
  }

  .affiliate-analytics-stat-value {
    margin: 0;
    font-size: 30px;
    line-height: 1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-analytics-stat-icon {
    width: 46px;
    height: 46px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    color: #111827;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .affiliate-analytics-stat-hint {
    margin: 14px 0 0;
    font-size: 13px;
    line-height: 1.6;
    color: #6b7280;
  }

  .affiliate-analytics-main-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }

  .affiliate-analytics-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-analytics-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .affiliate-analytics-panel-kicker {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .affiliate-analytics-panel-title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-analytics-list,
  .affiliate-analytics-activity-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .affiliate-analytics-item-card {
    padding: 16px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
  }

  .affiliate-analytics-item-card h3 {
    margin: 0 0 12px;
    font-size: 16px;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-analytics-item-rows {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .affiliate-analytics-item-row,
  .affiliate-analytics-activity-grid div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    background: #ffffff;
    border: 1px solid #edf2f7;
    border-radius: 14px;
  }

  .affiliate-analytics-item-row span,
  .affiliate-analytics-activity-grid span {
    font-size: 12px;
    color: #6b7280;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .affiliate-analytics-item-row strong,
  .affiliate-analytics-activity-grid strong {
    font-size: 14px;
    color: #111827;
    font-weight: 900;
    text-align: right;
  }

  .affiliate-analytics-activity-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
  }

  .affiliate-analytics-activity-icon {
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

  .affiliate-analytics-activity-main {
    flex: 1;
  }

  .affiliate-analytics-activity-main h3 {
    margin: 0 0 12px;
    font-size: 16px;
    font-weight: 900;
    color: #111827;
    text-transform: capitalize;
  }

  .affiliate-analytics-activity-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .affiliate-analytics-empty,
  .affiliate-analytics-empty-small {
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

  .affiliate-analytics-empty h3,
  .affiliate-analytics-empty-small p {
    margin: 0;
    color: #111827;
    font-weight: 800;
  }

  .affiliate-analytics-empty p {
    margin: 0;
    color: #6b7280;
    line-height: 1.6;
    max-width: 420px;
  }

  @media (max-width: 1200px) {
    .affiliate-analytics-stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 991px) {
    .affiliate-analytics-hero,
    .affiliate-analytics-main-grid {
      grid-template-columns: 1fr;
      display: grid;
    }

    .affiliate-analytics-hero {
      padding: 20px;
    }

    .affiliate-analytics-title {
      font-size: 26px;
    }

    .affiliate-analytics-panel {
      padding: 18px;
    }

    .affiliate-analytics-activity-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 767px) {
    .affiliate-analytics-stats-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-analytics-title {
      font-size: 22px;
    }

    .affiliate-analytics-subtitle {
      font-size: 14px;
    }

    .affiliate-analytics-hero-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-analytics-btn {
      width: 100%;
    }

    .affiliate-analytics-item-row,
    .affiliate-analytics-activity-card {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`,ge=[{key:"total_activity",label:"All activity"},{key:"product_views",label:"Product views"},{key:"product_clicks",label:"Product clicks"},{key:"post_views",label:"Post views"},{key:"slider_clicks",label:"Slider clicks"}];function P(a){const i=Number(a||0);return new Intl.NumberFormat(void 0,{notation:i>=1e4?"compact":"standard",maximumFractionDigits:i>=1e4?1:0}).format(i)}function J(a,i=!1){if(!a)return"-";const s=new Date(`${a}T00:00:00Z`);return Number.isNaN(s.getTime())?a:s.toLocaleDateString(void 0,i?{month:"short",day:"numeric",timeZone:"UTC"}:{month:"short",day:"numeric",year:"numeric",timeZone:"UTC"})}function we(a,i){return(a==null?void 0:a[i])||{current:0,previous:0,change_percent:0,direction:"flat"}}function ue({comparison:a}){const i=(a==null?void 0:a.direction)||"flat",s=Number((a==null?void 0:a.previous)||0),r=Number((a==null?void 0:a.current)||0),p=Math.abs(Number((a==null?void 0:a.change_percent)||0));let c="No change";return s===0&&r>0?c="New activity":i==="up"?c=`${p.toFixed(p>=10?0:1)}% up`:i==="down"&&(c=`${p.toFixed(p>=10?0:1)}% down`),e.jsxs("span",{className:`wa-change ${i}`,children:[e.jsx("span",{"aria-hidden":"true",children:i==="up"?"+":i==="down"?"-":"="}),c]})}function ye(a){if(!a.length)return"";if(a.length===1)return`M ${a[0].x} ${a[0].y}`;let i=`M ${a[0].x} ${a[0].y}`;for(let s=1;s<a.length;s+=1){const r=a[s-1],p=a[s],c=(r.x+p.x)/2;i+=` C ${c} ${r.y}, ${c} ${p.y}, ${p.x} ${p.y}`}return i}function be({points:a,metricKey:i,comparison:s}){const c={top:20,right:18,bottom:42,left:48},x=820-c.left-c.right,f=292-c.top-c.bottom,d=a.map(l=>Number((l==null?void 0:l[i])||0)),o=Math.max(1,...d),u=o<=4?1:Math.ceil(o/4),N=Math.max(4,u*4),j=c.top+f,w=a.map((l,m)=>{const T=a.length<=1?c.left+x/2:c.left+m/(a.length-1)*x,S=Number((l==null?void 0:l[i])||0),F=c.top+f-S/N*f;return{...l,x:T,y:F,value:S}}),A=ye(w),t=w.length?`${A} L ${w[w.length-1].x} ${j} L ${w[0].x} ${j} Z`:"",h=[0,1,2,3,4].map(l=>u*l),y=a.length<=7?a.map((l,m)=>m):[0,Math.floor((a.length-1)*.25),Math.floor((a.length-1)*.5),Math.floor((a.length-1)*.75),a.length-1],b=[...new Set(y)];return e.jsxs("div",{className:"wa-chart-shell",children:[e.jsxs("div",{className:"wa-chart-total",children:[e.jsx("span",{children:"Selected period"}),e.jsx("strong",{children:P((s==null?void 0:s.current)||0)}),e.jsx(ue,{comparison:s})]}),e.jsx("div",{className:"wa-chart-scroll",children:e.jsxs("svg",{className:"wa-chart",viewBox:"0 0 820 292",role:"img","aria-label":"Daily analytics rise and fall chart",children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"writerAnalyticsAreaFill",x1:"0",y1:"0",x2:"0",y2:"1",children:[e.jsx("stop",{offset:"0%",stopColor:"currentColor",stopOpacity:"0.2"}),e.jsx("stop",{offset:"100%",stopColor:"currentColor",stopOpacity:"0.01"})]})}),h.map(l=>{const m=c.top+f-l/N*f;return e.jsxs("g",{children:[e.jsx("line",{x1:c.left,x2:820-c.right,y1:m,y2:m,className:"wa-chart-grid"}),e.jsx("text",{x:c.left-10,y:m+4,textAnchor:"end",className:"wa-chart-axis",children:P(l)})]},l)}),t?e.jsx("path",{d:t,className:"wa-chart-area"}):null,A?e.jsx("path",{d:A,className:"wa-chart-line"}):null,w.map((l,m)=>e.jsx("circle",{cx:l.x,cy:l.y,r:a.length>35?2.2:3,className:"wa-chart-point",children:e.jsx("title",{children:`${J(l.date)}: ${P(l.value)}`})},`${l.date}-${m}`)),b.map(l=>{const m=w[l];return m?e.jsx("text",{x:m.x,y:278,textAnchor:l===0?"start":l===a.length-1?"end":"middle",className:"wa-chart-axis",children:J(m.date,!0)},`label-${m.date}`):null})]})})]})}function I({label:a,value:i,hint:s}){return e.jsxs("article",{className:"wa-stat",children:[e.jsx("span",{children:a}),e.jsx("strong",{children:P(i)}),e.jsx("small",{children:s})]})}function je(){const[a,i]=g.useState(null),[s,r]=g.useState(30),[p,c]=g.useState("total_activity"),[x,f]=g.useState(!0),[d,o]=g.useState(!1),[u,N]=g.useState(""),[j,w]=g.useState(null),[A,t]=g.useState(null),[h,y]=g.useState(!1),[b,l]=g.useState(""),m=async({refresh:n=!1,days:_=s}={})=>{var z,v;try{N(""),n?o(!0):f(!0);const{data:R}=await W.get("/api/writer/analytics",{params:{days:_}});i((R==null?void 0:R.analytics)||null)}catch(R){N(((v=(z=R==null?void 0:R.response)==null?void 0:z.data)==null?void 0:v.message)||"Failed to load analytics")}finally{f(!1),o(!1)}},T=async n=>{var _,z;if(n!=null&&n.id){w(n),t(null),l(""),y(!0);try{const{data:v}=await W.get(`/api/writer/analytics/posts/${n.id}`);t(v||null)}catch(v){l(((z=(_=v==null?void 0:v.response)==null?void 0:_.data)==null?void 0:z.message)||"Failed to load post analytics")}finally{y(!1)}}};g.useEffect(()=>{m({days:s})},[s]);const S=(a==null?void 0:a.overview)||{},F=(a==null?void 0:a.click_breakdown)||{},O=Array.isArray(a==null?void 0:a.top_products)?a.top_products:[],q=Array.isArray(a==null?void 0:a.top_posts)?a.top_posts:[],V=Array.isArray(a==null?void 0:a.recent_activity)?a.recent_activity:[],$=(a==null?void 0:a.trend)||{},Y=Array.isArray($==null?void 0:$.points)?$.points:[],te=we($==null?void 0:$.comparison,p),se=Number(F.read_more||0)+Number(F.learn_more||0);return x?e.jsxs("div",{className:"wa-page",children:[e.jsx("style",{children:Q}),e.jsxs("section",{className:"wa-loading",children:[e.jsx("div",{className:"wa-spinner"}),e.jsx("strong",{children:"Loading analytics..."})]})]}):e.jsxs("div",{className:"wa-page",children:[e.jsx("style",{children:Q}),e.jsxs("div",{className:"wa-command",children:[e.jsxs("div",{children:[e.jsx("p",{children:"Performance"}),e.jsx("span",{children:"See how Readers move through your products and stories over time."})]}),e.jsxs("div",{className:"wa-command-actions",children:[e.jsxs("select",{"aria-label":"Analytics period",value:s,onChange:n=>r(Number(n.target.value)),disabled:d,children:[e.jsx("option",{value:7,children:"Last 7 days"}),e.jsx("option",{value:30,children:"Last 30 days"}),e.jsx("option",{value:90,children:"Last 90 days"})]}),e.jsxs("button",{type:"button",className:"wa-btn",onClick:()=>m({refresh:!0,days:s}),disabled:d,children:[e.jsx(ee,{size:14,className:d?"spin":""}),d?"Refreshing...":"Refresh"]})]})]}),u?e.jsxs("div",{className:"wa-alert",role:"alert",children:[e.jsx(ie,{size:16}),e.jsx("span",{children:u})]}):null,e.jsxs("section",{className:"wa-stats","aria-label":"Analytics summary",children:[e.jsx(I,{label:"Product views",value:S.total_product_views||0,hint:"All recorded product views"}),e.jsx(I,{label:"Product clicks",value:S.total_product_clicks||0,hint:"All product click actions"}),e.jsx(I,{label:"Post views",value:S.total_post_views||0,hint:"All recorded story views"}),e.jsx(I,{label:"Slider clicks",value:S.total_slider_clicks||0,hint:"Tracked slider interactions"})]}),e.jsxs("section",{className:"wa-panel wa-trend-panel",children:[e.jsx("div",{className:"wa-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{children:"Traffic trend"}),e.jsx("h2",{children:"Rise and fall"}),e.jsx("span",{children:"Real daily activity for the selected period compared with the previous period."})]})}),e.jsx("div",{className:"wa-metric-tabs",role:"tablist","aria-label":"Chart metric",children:ge.map(n=>e.jsx("button",{type:"button",role:"tab","aria-selected":p===n.key,className:p===n.key?"is-active":"",onClick:()=>c(n.key),children:n.label},n.key))}),Y.length?e.jsx(be,{points:Y,metricKey:p,comparison:te}):e.jsxs("div",{className:"wa-empty",children:[e.jsx(D,{size:24}),e.jsx("strong",{children:"No trend activity yet"}),e.jsx("span",{children:"Daily analytics will appear here as Readers interact with your content."})]})]}),e.jsxs("section",{className:"wa-secondary-grid",children:[e.jsxs("div",{className:"wa-panel",children:[e.jsx("div",{className:"wa-panel-head compact",children:e.jsxs("div",{children:[e.jsx("p",{children:"Top products"}),e.jsx("h2",{children:"Best performing products"})]})}),O.length?e.jsx("div",{className:"wa-ranking-list",children:O.slice(0,6).map((n,_)=>e.jsxs("article",{className:"wa-ranking-row",children:[e.jsx("span",{className:"wa-rank",children:_+1}),e.jsxs("div",{children:[e.jsx("strong",{children:n.title||"Untitled product"}),e.jsxs("small",{children:[P(n.total_views||0)," views"]})]}),e.jsxs("b",{children:[P(n.total_clicks||0)," clicks"]})]},n.id))}):e.jsxs("div",{className:"wa-empty small",children:[e.jsx(B,{size:20}),e.jsx("span",{children:"No product analytics yet."})]})]}),e.jsxs("div",{className:"wa-panel",children:[e.jsx("div",{className:"wa-panel-head compact",children:e.jsxs("div",{children:[e.jsx("p",{children:"Top posts"}),e.jsx("h2",{children:"Best performing stories"})]})}),q.length?e.jsx("div",{className:"wa-ranking-list",children:q.slice(0,6).map((n,_)=>{var z;return e.jsxs("article",{className:"wa-ranking-row",role:"button",tabIndex:0,style:{cursor:"pointer"},"aria-label":`Analyze ${n.title||"post"}`,onClick:()=>T(n),onKeyDown:v=>{(v.key==="Enter"||v.key===" ")&&(v.preventDefault(),T(n))},children:[e.jsx("span",{className:"wa-rank",children:_+1}),e.jsxs("div",{children:[e.jsx("strong",{children:n.title||"Untitled story"}),e.jsx("small",{children:((z=n.product)==null?void 0:z.title)||"Independent story"})]}),e.jsxs("b",{children:[P(n.total_views||0)," views"]})]},n.id)})}):e.jsxs("div",{className:"wa-empty small",children:[e.jsx(E,{size:20}),e.jsx("span",{children:"No story analytics yet."})]})]})]}),e.jsxs("section",{className:"wa-bottom-grid",children:[e.jsxs("div",{className:"wa-panel",children:[e.jsx("div",{className:"wa-panel-head compact",children:e.jsxs("div",{children:[e.jsx("p",{children:"Intent"}),e.jsx("h2",{children:"Product click actions"})]})}),e.jsxs("div",{className:"wa-intent-grid",children:[e.jsxs("article",{children:[e.jsx("span",{children:"Buy now"}),e.jsx("strong",{children:P(F.buy_now||0)})]}),e.jsxs("article",{children:[e.jsx("span",{children:"Read / Learn more"}),e.jsx("strong",{children:P(se)})]})]})]}),e.jsxs("div",{className:"wa-panel",children:[e.jsx("div",{className:"wa-panel-head compact",children:e.jsxs("div",{children:[e.jsx("p",{children:"Recent"}),e.jsx("h2",{children:"Latest tracked activity"})]})}),V.length?e.jsx("div",{className:"wa-activity-list",children:V.slice(0,8).map(n=>{var _,z;return e.jsxs("article",{children:[e.jsx("span",{className:"wa-activity-dot"}),e.jsxs("div",{children:[e.jsx("strong",{children:String(n.activity_type||"activity").replace(/_/g," ")}),e.jsx("small",{children:((_=n.product)==null?void 0:_.title)||((z=n.post)==null?void 0:z.title)||n.click_type||"Website activity"})]}),e.jsx("time",{children:n.created_at?new Date(n.created_at).toLocaleDateString():"-"})]},`${n.activity_type}-${n.id}`)})}):e.jsxs("div",{className:"wa-empty small",children:[e.jsx(Z,{size:20}),e.jsx("span",{children:"No recent analytics activity yet."})]})]})]}),e.jsx(fe,{post:j,data:A,loading:h,error:b,onClose:()=>{w(null),t(null),l("")},onRetry:()=>j&&T(j)})]})}function Re(){return re().pathname==="/writer/analytics"?e.jsx(je,{}):e.jsx(me,{})}const Q=`
  .wa-page,
  .wa-page * {
    box-sizing: border-box;
  }

  .wa-page {
    width: 100%;
    color: #1f242b;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .wa-command {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 14px;
  }

  .wa-command p,
  .wa-panel-head p {
    margin: 0 0 4px;
    color: #778290;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .wa-command > div > span,
  .wa-panel-head > div > span {
    color: #7c8794;
    font-size: 11px;
    line-height: 1.45;
  }

  .wa-command-actions {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .wa-command select,
  .wa-btn {
    height: 38px;
    border: 1px solid #dce1e6;
    border-radius: 7px;
    background: #ffffff;
    color: #252a31;
    font: inherit;
    font-size: 11px;
  }

  .wa-command select {
    min-width: 126px;
    padding: 0 32px 0 11px;
  }

  .wa-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 13px;
    font-weight: 600;
    cursor: pointer;
  }

  .wa-btn:disabled,
  .wa-command select:disabled {
    opacity: 0.58;
    cursor: not-allowed;
  }

  .wa-alert {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding: 10px 12px;
    border: 1px solid #fecaca;
    border-radius: 7px;
    background: #fff7f7;
    color: #991b1b;
    font-size: 11px;
  }

  .wa-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 14px;
  }

  .wa-stat {
    min-height: 96px;
    padding: 15px;
    border: 1px solid #dfe3e8;
    border-radius: 9px;
    background: #ffffff;
  }

  .wa-stat > span {
    display: block;
    margin-bottom: 8px;
    color: #7a8593;
    font-size: 10px;
    font-weight: 600;
  }

  .wa-stat strong {
    display: block;
    margin-bottom: 8px;
    color: #20242a;
    font-size: 23px;
    line-height: 1;
  }

  .wa-stat small {
    color: #929aa5;
    font-size: 9px;
    line-height: 1.35;
  }

  .wa-panel {
    min-width: 0;
    padding: 18px;
    border: 1px solid #dfe3e8;
    border-radius: 9px;
    background: #ffffff;
  }

  .wa-trend-panel {
    margin-bottom: 14px;
  }

  .wa-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
  }

  .wa-panel-head.compact {
    margin-bottom: 12px;
  }

  .wa-panel-head h2 {
    margin: 0 0 5px;
    color: #20242a;
    font-size: 14px;
    line-height: 1.25;
  }

  .wa-metric-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-bottom: 10px;
  }

  .wa-metric-tabs button {
    min-height: 30px;
    padding: 0 11px;
    border: 1px solid #dce1e6;
    border-radius: 999px;
    background: #ffffff;
    color: #687382;
    font: inherit;
    font-size: 9px;
    font-weight: 600;
    cursor: pointer;
  }

  .wa-metric-tabs button.is-active {
    border-color: #20242a;
    background: #20242a;
    color: #ffffff;
  }

  .wa-chart-total {
    display: flex;
    align-items: baseline;
    gap: 10px;
    min-height: 34px;
    margin-bottom: 4px;
  }

  .wa-chart-total > span:first-child {
    color: #84909d;
    font-size: 9px;
  }

  .wa-chart-total strong {
    color: #20242a;
    font-size: 21px;
    line-height: 1;
  }

  .wa-change {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 9px;
    font-weight: 700;
  }

  .wa-change.up {
    color: #18794e;
  }

  .wa-change.down {
    color: #b42318;
  }

  .wa-change.flat {
    color: #778290;
  }

  .wa-chart-scroll {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .wa-chart {
    width: 100%;
    min-width: 680px;
    height: auto;
    aspect-ratio: 820 / 292;
    display: block;
    color: #20242a;
  }

  .wa-chart-grid {
    stroke: #e8ebee;
    stroke-width: 1;
  }

  .wa-chart-axis {
    fill: #87919d;
    font-size: 10px;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }

  .wa-chart-area {
    fill: url(#writerAnalyticsAreaFill);
    color: #20242a;
  }

  .wa-chart-line {
    fill: none;
    stroke: #20242a;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .wa-chart-point {
    fill: #ffffff;
    stroke: #20242a;
    stroke-width: 2;
  }

  .wa-secondary-grid,
  .wa-bottom-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 14px;
  }

  .wa-ranking-list,
  .wa-activity-list {
    display: grid;
  }

  .wa-ranking-row {
    min-width: 0;
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    min-height: 56px;
    border-top: 1px solid #edf0f2;
  }

  .wa-ranking-row:first-child,
  .wa-activity-list article:first-child {
    border-top: 0;
  }

  .wa-rank {
    width: 24px;
    height: 24px;
    display: grid;
    place-items: center;
    border-radius: 6px;
    background: #f0f2f4;
    color: #66717f;
    font-size: 9px;
    font-weight: 700;
  }

  .wa-ranking-row div {
    min-width: 0;
  }

  .wa-ranking-row strong,
  .wa-ranking-row small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .wa-ranking-row strong {
    margin-bottom: 4px;
    color: #292e35;
    font-size: 10px;
  }

  .wa-ranking-row small {
    color: #8b95a1;
    font-size: 9px;
  }

  .wa-ranking-row b {
    color: #4b5563;
    font-size: 9px;
    font-weight: 600;
  }

  .wa-intent-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .wa-intent-grid article {
    min-height: 74px;
    padding: 13px;
    border: 1px solid #e3e6ea;
    border-radius: 8px;
    background: #fafbfc;
  }

  .wa-intent-grid span,
  .wa-intent-grid strong {
    display: block;
  }

  .wa-intent-grid span {
    margin-bottom: 9px;
    color: #7f8995;
    font-size: 9px;
  }

  .wa-intent-grid strong {
    color: #252a31;
    font-size: 18px;
  }

  .wa-activity-list article {
    min-width: 0;
    display: grid;
    grid-template-columns: 8px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    min-height: 52px;
    border-top: 1px solid #edf0f2;
  }

  .wa-activity-dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: #697482;
  }

  .wa-activity-list div {
    min-width: 0;
  }

  .wa-activity-list strong,
  .wa-activity-list small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .wa-activity-list strong {
    margin-bottom: 3px;
    color: #30353c;
    font-size: 9px;
    text-transform: capitalize;
  }

  .wa-activity-list small,
  .wa-activity-list time {
    color: #8a94a0;
    font-size: 8px;
  }

  .wa-empty,
  .wa-loading {
    min-height: 220px;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 8px;
    color: #7e8996;
    text-align: center;
  }

  .wa-empty.small {
    min-height: 150px;
  }

  .wa-empty strong,
  .wa-loading strong {
    color: #30353c;
    font-size: 11px;
  }

  .wa-empty span {
    max-width: 360px;
    font-size: 9px;
  }

  .wa-loading {
    min-height: 55vh;
  }

  .wa-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid #e3e7eb;
    border-top-color: #20242a;
    border-radius: 999px;
    animation: waSpin 0.8s linear infinite;
  }

  @keyframes waSpin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 960px) {
    .wa-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .wa-secondary-grid,
    .wa-bottom-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 767px) {
    .wa-page {
      width: calc(100% + 34px);
      margin-left: -17px;
      margin-right: -17px;
      padding: 14px 8px 38px;
    }

    .wa-command {
      align-items: flex-start;
      gap: 12px;
    }

    .wa-command > div:first-child {
      min-width: 0;
      flex: 1;
    }

    .wa-command > div:first-child > span {
      display: none;
    }

    .wa-command-actions {
      gap: 7px;
    }

    .wa-command select {
      min-width: 112px;
      height: 34px;
      padding-left: 9px;
      font-size: 9px;
    }

    .wa-btn {
      width: 35px;
      height: 34px;
      padding: 0;
      font-size: 0;
    }

    .wa-btn svg {
      width: 14px;
      height: 14px;
    }

    .wa-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      margin-bottom: 10px;
    }

    .wa-stat {
      min-height: 82px;
      padding: 12px;
    }

    .wa-stat strong {
      font-size: 20px;
    }

    .wa-stat small {
      display: none;
    }

    .wa-panel {
      padding: 14px 12px;
      border-radius: 8px;
    }

    .wa-trend-panel,
    .wa-secondary-grid,
    .wa-bottom-grid {
      margin-bottom: 10px;
    }

    .wa-panel-head {
      margin-bottom: 10px;
    }

    .wa-panel-head > div > span {
      font-size: 9px;
    }

    .wa-metric-tabs {
      flex-wrap: nowrap;
      overflow-x: auto;
      padding-bottom: 3px;
      scrollbar-width: none;
    }

    .wa-metric-tabs::-webkit-scrollbar {
      display: none;
    }

    .wa-metric-tabs button {
      flex: 0 0 auto;
    }

    .wa-chart {
      min-width: 610px;
      height: auto;
    }

    .wa-ranking-row {
      min-height: 54px;
    }

    .wa-intent-grid {
      gap: 8px;
    }

    .wa-intent-grid article {
      min-height: 68px;
      padding: 11px;
    }
  }
`;export{Re as default};
