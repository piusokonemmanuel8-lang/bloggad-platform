import{r as g,a as E,j as e,X as he,C as W,q as Q,b as ge,R as ce,F as Z}from"./index-D9V1y7dh.js";import{C as me}from"./clock-3-5GXjw4jW.js";import{M as de}from"./mouse-pointer-click-C9NAXZ9N.js";import{C as pe}from"./circle-alert-C22uOb8d.js";import{P as Y}from"./package-8vZ2iQcx.js";import{A as K}from"./activity-BB-4Myp1.js";import{E as ue}from"./eye-GJqy3mb4.js";import{L as ye}from"./layers-DEFS2XsJ.js";import{S as we}from"./shopping-cart-Cnmxnl9D.js";import{A as be}from"./arrow-up-right-wDfJEbRN.js";function ee(a){return new Intl.NumberFormat("en-US").format(Math.max(0,Math.round(Number(a)||0)))}function je(a){const i=Math.max(0,Math.floor(Number(a)||0)),t=Math.floor(i/3600),s=Math.floor(i%3600/60),r=i%60;return t?t+"h "+s+"m":s?s+"m "+r+"s":r+"s"}function ae(a){const i=Number(a);return(Number.isFinite(i)?Math.max(0,Math.min(100,i)):0).toFixed(1)+"%"}function ve({postId:a}){const[i,t]=g.useState({loading:!0,error:"",data:null});g.useEffect(()=>{const o=Number(a);if(!Number.isSafeInteger(o)||o<=0){t({loading:!1,error:"",data:null});return}let d=!0;return t({loading:!0,error:"",data:null}),E.get("/api/public/video-watch/writer/posts/"+o).then(u=>{var j;d&&t({loading:!1,error:"",data:((j=u==null?void 0:u.data)==null?void 0:j.video_analytics)||null})}).catch(()=>{d&&t({loading:!1,error:"Video analytics are currently unavailable.",data:null})}),()=>{d=!1}},[a]);const s=i.data||{},r=Math.max(0,Number(s.playback_sessions)||0),p=Math.min(r,Math.max(0,Number(s.completed_plays)||0)),m=r?p/r*100:0,x=[{label:"Video plays",value:ee(r)},{label:"Watch time",value:je(s.watched_seconds)},{label:"Completed plays",value:ee(p)},{label:"Completion rate",value:ae(m)},{label:"Average progress",value:ae(s.average_progress_percent)}];return e.jsxs("section",{"aria-label":"Video analytics",style:{padding:"20px 0",borderBottom:"1px solid #e5e7eb"},children:[e.jsxs("div",{style:{marginBottom:14},children:[e.jsx("h3",{style:{margin:0,fontSize:18},children:"Video analytics"}),e.jsx("p",{style:{margin:"6px 0 0",color:"#64748b",fontSize:13},children:"Actual playback activity recorded for this post"})]}),i.loading?e.jsx("p",{role:"status",children:"Loading video analytics..."}):i.error?e.jsx("p",{role:"status",style:{color:"#b45309"},children:i.error}):e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(145px, 1fr))",gap:12},children:x.map(o=>e.jsxs("div",{style:{border:"1px solid #e2e8f0",borderRadius:10,padding:14,background:"#f8fafc"},children:[e.jsx("div",{style:{color:"#64748b",fontSize:12,marginBottom:7},children:o.label}),e.jsx("strong",{style:{fontSize:20,color:"#0f172a"},children:o.value})]},o.label))})]})}function C(a){return new Intl.NumberFormat("en-US").format(Number(a||0))}function ie(a){const i=Math.max(0,Math.round(Number(a||0))),t=Math.floor(i/60),s=i%60;return t?s?`${t}m ${s}s`:`${t}m`:`${s}s`}function I(a){return`${Number(a||0).toFixed(1)}%`}function ke(a){const i=String(a||"ZZ").toUpperCase();if(i==="ZZ")return"Unknown";try{return new Intl.DisplayNames(["en"],{type:"region"}).of(i)||i}catch{return i}}function F({label:a,value:i,hint:t,icon:s}){return e.jsxs("article",{className:"wpa-metric",children:[e.jsxs("div",{children:[e.jsx("span",{children:a}),e.jsx("strong",{children:i}),t?e.jsx("small",{children:t}):null]}),e.jsx(s,{size:17})]})}function V({title:a,rows:i,labelFor:t=s=>s.label}){return e.jsxs("section",{className:"wpa-section",children:[e.jsx("div",{className:"wpa-section-head",children:e.jsx("h3",{children:a})}),i!=null&&i.length?e.jsx("div",{className:"wpa-breakdown",children:i.map((s,r)=>e.jsxs("div",{className:"wpa-breakdown-row",children:[e.jsxs("div",{children:[e.jsx("strong",{children:t(s)}),e.jsx("span",{children:C(s.readers||s.clicks||0)})]}),e.jsx("div",{className:"wpa-bar",children:e.jsx("span",{style:{width:`${Math.max(2,Number(s.percent||0))}%`}})}),e.jsx("b",{children:I(s.percent||0)})]},`${t(s)}-${r}`))}):e.jsx("div",{className:"wpa-empty",children:"No data yet."})]})}function Ne({post:a,data:i,loading:t,error:s,onClose:r,onRetry:p}){var y,_;if(!a)return null;const m=(i==null?void 0:i.post_analytics)||null,x=(m==null?void 0:m.access)||null,o=(m==null?void 0:m.advanced)||null,d=(o==null?void 0:o.summary)||{},u=(o==null?void 0:o.completion_funnel)||{},j=(o==null?void 0:o.reader_types)||{},N=Array.isArray(o==null?void 0:o.links)?o.links:[];return e.jsxs("div",{className:"wpa-backdrop",onMouseDown:r,children:[e.jsx("style",{children:_e}),e.jsxs("aside",{className:"wpa-drawer",onMouseDown:n=>n.stopPropagation(),"aria-label":"Post analytics",children:[e.jsxs("header",{className:"wpa-head",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Post Analytics"}),e.jsx("h2",{children:((y=m==null?void 0:m.post)==null?void 0:y.title)||(a==null?void 0:a.title)||"Post"})]}),e.jsx("button",{type:"button",onClick:r,"aria-label":"Close analytics",children:e.jsx(he,{size:18})})]}),t?e.jsxs("div",{className:"wpa-state",children:[e.jsx("div",{className:"wpa-spinner"}),e.jsx("strong",{children:"Loading post analytics..."})]}):s?e.jsxs("div",{className:"wpa-state error",children:[e.jsx("strong",{children:s}),e.jsx("button",{type:"button",onClick:p,children:"Retry"})]}):m?e.jsxs("div",{className:"wpa-content",children:[e.jsx("section",{className:"wpa-basic",children:e.jsx(F,{label:"Total views",value:C(m.total_views||0),hint:"Existing basic post analytics",icon:W})}),e.jsx(ve,{postId:a.id}),x!=null&&x.advanced_post_analytics?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"wpa-pro-label",children:[e.jsx("span",{children:"PRO POST ANALYTICS"}),e.jsxs("strong",{children:[((_=x==null?void 0:x.plan)==null?void 0:_.name)||"Pro"," access active"]})]}),e.jsxs("section",{className:"wpa-metrics",children:[e.jsx(F,{label:"Unique readers",value:C(d.unique_readers),hint:`${C(d.sessions)} reading sessions`,icon:Q}),e.jsx(F,{label:"Engaged readers",value:C(d.engaged_readers),hint:`${I(d.engagement_rate)} engagement`,icon:Q}),e.jsx(F,{label:"Average read time",value:ie(d.average_reading_time_seconds),hint:d.estimated_read_seconds?`Estimated post read: ${ie(d.estimated_read_seconds)}`:"Measured active reading time",icon:me}),e.jsx(F,{label:"Completion rate",value:I(d.completion_rate),hint:`${C(d.completed_readers)} completed readers`,icon:W}),e.jsx(F,{label:"Link clicks",value:C(d.total_link_clicks),hint:`${I(d.link_ctr)} reader CTR`,icon:de}),e.jsx(F,{label:"Average scroll",value:I(d.average_scroll_percent),hint:"Average furthest reading depth",icon:W})]}),e.jsxs("section",{className:"wpa-section",children:[e.jsxs("div",{className:"wpa-section-head",children:[e.jsx("h3",{children:"Reading completion"}),e.jsx("span",{children:"Where readers reached in the post"})]}),e.jsx("div",{className:"wpa-funnel",children:[["25%",u.reached_25],["50%",u.reached_50],["75%",u.reached_75],["100%",u.reached_100]].map(([n,w])=>{const h=Number(d.unique_readers||0),v=h?Number(w||0)/h*100:0;return e.jsxs("div",{children:[e.jsx("span",{children:n}),e.jsx("div",{children:e.jsx("b",{style:{width:`${Math.max(2,v)}%`}})}),e.jsx("strong",{children:C(w||0)})]},n)})})]}),e.jsxs("div",{className:"wpa-grid",children:[e.jsx(V,{title:"Readers by country",rows:o.countries||[],labelFor:n=>ke(n.country_code)}),e.jsx(V,{title:"Device breakdown",rows:o.devices||[],labelFor:n=>{const w=String(n.device_type||"unknown");return w.charAt(0).toUpperCase()+w.slice(1)}})]}),e.jsxs("div",{className:"wpa-grid",children:[e.jsx(V,{title:"Traffic sources",rows:o.traffic_sources||[],labelFor:n=>n.source||"Other"}),e.jsxs("section",{className:"wpa-section",children:[e.jsx("div",{className:"wpa-section-head",children:e.jsx("h3",{children:"New vs returning readers"})}),e.jsxs("div",{className:"wpa-reader-types",children:[e.jsxs("div",{children:[e.jsx("span",{children:"New readers"}),e.jsx("strong",{children:C(j.new_readers)})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Returning readers"}),e.jsx("strong",{children:C(j.returning_readers)})]})]})]})]}),e.jsxs("section",{className:"wpa-section",children:[e.jsxs("div",{className:"wpa-section-head",children:[e.jsx("h3",{children:"Link performance"}),e.jsx("span",{children:"Links clicked inside the post content"})]}),N.length?e.jsxs("div",{className:"wpa-links",children:[e.jsxs("div",{className:"wpa-link-head",children:[e.jsx("span",{children:"Link"}),e.jsx("span",{children:"Clicks"}),e.jsx("span",{children:"Unique"}),e.jsx("span",{children:"CTR"})]}),N.map(n=>e.jsxs("div",{className:"wpa-link-row",children:[e.jsxs("div",{children:[e.jsx("strong",{children:n.link_text||n.link_url}),e.jsx("small",{title:n.link_url,children:n.link_url})]}),e.jsx("b",{children:C(n.clicks)}),e.jsx("b",{children:C(n.unique_clickers)}),e.jsx("b",{children:I(n.ctr)})]},n.link_hash))]}):e.jsx("div",{className:"wpa-empty",children:"No post-content link clicks have been recorded yet."})]}),Number(d.unknown_country_readers||0)>0?e.jsx("p",{className:"wpa-note",children:"Country is reported when the hosting or proxy layer provides a trusted country header. Readers without that header are shown as Unknown."}):null]}):e.jsxs("section",{className:"wpa-lock",children:[e.jsx("span",{children:"PRO POST ANALYTICS"}),e.jsx("h3",{children:"Advanced reader behavior analytics"}),e.jsx("p",{children:"Your normal analytics remain available. Advanced post analytics, including reading time, completion, audience countries, traffic sources, devices, and link behavior, is included with Pro and Unlimited Writer plans."}),e.jsx("a",{href:"/writer/plan",children:"View Pro plans"})]})]}):null]})]})}const _e=`
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
`,ze={padding:20,marginBottom:20,border:"1px solid #dbe3ec",borderRadius:14,background:"#ffffff",color:"#172333"},te={display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(155px, 1fr))",gap:12,marginTop:18},Ae={padding:14,border:"1px solid #e5eaf0",borderRadius:10,background:"#f8fafc"},q={padding:"9px 12px",border:"1px solid #cbd5e1",borderRadius:8,background:"#ffffff",color:"#172333",maxWidth:"100%"};function se(a){const i=a.getFullYear(),t=String(a.getMonth()+1).padStart(2,"0"),s=String(a.getDate()).padStart(2,"0");return i+"-"+t+"-"+s}function Se(a){const i=new Date,t=new Date(i);return t.setDate(t.getDate()-(a-1)),{from:se(t),to:se(i)}}function X(a){const i=Number(a);return Number.isFinite(i)&&i>=0?i:0}function A(a){return Math.round(X(a)).toLocaleString()}function O(a){const i=Math.floor(X(a)),t=Math.floor(i/3600),s=Math.floor(i%3600/60),r=i%60;return t>0?t+"h "+s+"m "+r+"s":s>0?s+"m "+r+"s":r+"s"}function z({title:a,value:i,hint:t}){return e.jsxs("div",{style:Ae,children:[e.jsx("div",{style:{fontSize:12,color:"#526273"},children:a}),e.jsx("strong",{style:{display:"block",fontSize:24,marginTop:6},children:i}),t?e.jsx("small",{style:{display:"block",color:"#64748b",marginTop:5},children:t}):null]})}function Ce({enabled:a=!1}){const[i,t]=g.useState([]),[s,r]=g.useState(""),[p,m]=g.useState(30),[x,o]=g.useState(null),[d,u]=g.useState(!1),[j,N]=g.useState(!1),[y,_]=g.useState(""),[n,w]=g.useState(0);if(g.useEffect(()=>{if(!a)return;let l=!1;return u(!0),E.get("/api/writer/sales-landing").then(({data:k})=>{if(l)return;const b=Array.isArray(k==null?void 0:k.pages)?k.pages:[];t(b),r(R=>b.some(U=>String(U.id)===R)?R:b.length?String(b[0].id):""),_("")}).catch(()=>{l||_("Unable to load your sales landing pages.")}).finally(()=>{l||u(!1)}),()=>{l=!0}},[a]),g.useEffect(()=>{if(!a||!s){o(null);return}let l=!1;const k=Se(p);return N(!0),_(""),o(null),E.get("/api/writer/analytics/sales-landing/"+encodeURIComponent(s),{params:k}).then(({data:b})=>{if(!l){if((b==null?void 0:b.ok)!==!0||!(b!=null&&b.report))throw new Error("INVALID_REPORT");o(b.report)}}).catch(()=>{l||_("Sales landing analytics are not available yet.")}).finally(()=>{l||N(!1)}),()=>{l=!0}},[a,s,p,n]),!a)return null;const h=(x==null?void 0:x.metrics)||{},v=Array.isArray(x==null?void 0:x.sources)?x.sources:[],f=Array.isArray(x==null?void 0:x.daily)?x.daily:[];return e.jsxs("section",{style:ze,"aria-label":"Sales landing analytics",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12},children:[e.jsxs("div",{children:[e.jsx("h2",{style:{margin:0,fontSize:20},children:"Sales Landing Analytics"}),e.jsx("p",{style:{margin:"6px 0 0",color:"#64748b",fontSize:13},children:"Visitor journeys, active engagement, video viewing, and call-to-action clicks."})]}),e.jsxs("div",{style:{display:"flex",flexWrap:"wrap",gap:8},children:[e.jsxs("select",{"aria-label":"Sales landing page",style:q,value:s,disabled:d||i.length===0,onChange:l=>r(l.target.value),children:[i.length===0?e.jsx("option",{value:"",children:"No landing pages"}):null,i.map(l=>e.jsx("option",{value:String(l.id),children:l.title||l.slug||"Page "+l.id},l.id))]}),e.jsxs("select",{"aria-label":"Sales landing analytics period",style:q,value:p,onChange:l=>m(Number(l.target.value)),children:[e.jsx("option",{value:7,children:"Last 7 days"}),e.jsx("option",{value:30,children:"Last 30 days"}),e.jsx("option",{value:90,children:"Last 90 days"})]}),e.jsx("button",{type:"button",style:q,disabled:d||j,onClick:()=>w(l=>l+1),children:"Refresh"})]})]}),y?e.jsx("p",{role:"alert",style:{color:"#b42318"},children:y}):null,d||j?e.jsx("p",{children:"Loading sales landing statistics..."}):null,!d&&i.length===0&&!y?e.jsx("p",{children:"Create a sales landing page to view its analytics."}):null,x?e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:te,children:[e.jsx(z,{title:"Page views",value:A(h.page_views)}),e.jsx(z,{title:"Visitor sessions",value:A(h.visitor_sessions)}),e.jsx(z,{title:"Session-scoped visitors",value:A(h.session_scoped_visitors),hint:"New ID per tracking session; not unique people"}),e.jsx(z,{title:"Active engagement",value:O(h.active_seconds)}),e.jsx(z,{title:"YouTube time watched",value:O(h.video_watched_seconds)}),e.jsx(z,{title:"Video starts",value:A(h.video_starts)}),e.jsx(z,{title:"Pay To Join clicks",value:A(h.checkout_clicks)}),e.jsx(z,{title:"WhatsApp clicks",value:A(h.whatsapp_clicks)}),e.jsx(z,{title:"Other CTA clicks",value:A(h.external_cta_clicks)}),e.jsx(z,{title:"Pay To Join clicks per 100 views",value:X(h.checkout_click_rate_percent).toFixed(2),hint:"Repeat clicks count; can exceed 100 per 100 views"}),e.jsx(z,{title:"Verified purchases",value:h.verified_payments==null?"Unavailable":A(h.verified_payments),hint:"Requires server-side payment verification"})]}),e.jsx("h3",{style:{margin:"24px 0 10px",fontSize:16},children:"YouTube cumulative watch milestones"}),e.jsxs("div",{style:te,children:[e.jsx(z,{title:"25% milestone",value:A(h.video_25)}),e.jsx(z,{title:"50% milestone",value:A(h.video_50)}),e.jsx(z,{title:"75% milestone",value:A(h.video_75)}),e.jsx(z,{title:"Completed",value:A(h.video_completions)})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))",gap:20,marginTop:24},children:[e.jsxs("div",{children:[e.jsx("h3",{style:{fontSize:16},children:"Traffic sources"}),v.length===0?e.jsx("p",{children:"No source data recorded."}):e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{textAlign:"left"},children:"Source"}),e.jsx("th",{style:{textAlign:"right"},children:"Sessions"})]})}),e.jsx("tbody",{children:v.map((l,k)=>e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"8px 0"},children:l.source}),e.jsx("td",{style:{textAlign:"right"},children:A(l.visitor_sessions)})]},l.source+k))})]})]}),e.jsxs("div",{children:[e.jsx("h3",{style:{fontSize:16},children:"Daily activity by session start"}),f.length===0?e.jsx("p",{children:"No daily activity recorded."}):e.jsx("div",{style:{overflowX:"auto"},children:e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{textAlign:"left"},children:"Day"}),e.jsx("th",{style:{textAlign:"right"},children:"Sessions"}),e.jsx("th",{style:{textAlign:"right"},children:"Watch time"})]})}),e.jsx("tbody",{children:f.map((l,k)=>e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"8px 0"},children:String(l.day)}),e.jsx("td",{style:{textAlign:"right"},children:A(l.visitor_sessions)}),e.jsx("td",{style:{textAlign:"right"},children:O(l.video_watched_seconds)})]},String(l.day)+k))})]})})]})]}),e.jsx("p",{style:{fontSize:12,color:"#64748b",marginTop:20},children:"Each tracking session gets a new visitor ID. Milestones use cumulative playback time, including rewatching, not furthest video position. Button clicks are not verified payments."})]}):null]})}function T({title:a,value:i,icon:t,hint:s}){return e.jsxs("div",{className:"affiliate-analytics-stat-card",children:[e.jsxs("div",{className:"affiliate-analytics-stat-top",children:[e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-analytics-stat-label",children:a}),e.jsx("h3",{className:"affiliate-analytics-stat-value",children:i})]}),e.jsx("div",{className:"affiliate-analytics-stat-icon",children:e.jsx(t,{size:20})})]}),e.jsx("p",{className:"affiliate-analytics-stat-hint",children:s})]})}function ne({title:a,rows:i=[]}){return e.jsxs("div",{className:"affiliate-analytics-item-card",children:[e.jsx("h3",{children:a}),e.jsx("div",{className:"affiliate-analytics-item-rows",children:i.map(t=>e.jsxs("div",{className:"affiliate-analytics-item-row",children:[e.jsx("span",{children:t.label}),e.jsx("strong",{children:t.value})]},t.label))})]})}function Pe(){const[a,i]=g.useState(null),[t,s]=g.useState(!0),[r,p]=g.useState(!1),[m,x]=g.useState(""),o=async(n=!1)=>{var w,h;try{x(""),n?p(!0):s(!0);const{data:v}=await E.get("/api/affiliate/analytics");i((v==null?void 0:v.analytics)||null)}catch(v){x(((h=(w=v==null?void 0:v.response)==null?void 0:w.data)==null?void 0:h.message)||"Failed to load analytics")}finally{s(!1),p(!1)}};g.useEffect(()=>{o()},[]);const d=(a==null?void 0:a.overview)||{},u=(a==null?void 0:a.click_breakdown)||{},j=(a==null?void 0:a.top_products)||[],N=(a==null?void 0:a.top_posts)||[],y=(a==null?void 0:a.recent_activity)||[],_=g.useMemo(()=>(u.read_more||0)+(u.learn_more||0),[u]);return t?e.jsxs("div",{className:"affiliate-analytics-page",children:[e.jsx("style",{children:le}),e.jsx("div",{className:"affiliate-analytics-loading-wrap",children:e.jsxs("div",{className:"affiliate-analytics-loading-card",children:[e.jsx("div",{className:"affiliate-analytics-spinner"}),e.jsx("p",{children:"Loading analytics..."})]})})]}):e.jsxs("div",{className:"affiliate-analytics-page",children:[e.jsx("style",{children:le}),e.jsxs("section",{className:"affiliate-analytics-hero",children:[e.jsxs("div",{className:"affiliate-analytics-hero-copy",children:[e.jsx("div",{className:"affiliate-analytics-badge",children:"Performance overview"}),e.jsx("h1",{className:"affiliate-analytics-title",children:"Analytics"}),e.jsx("p",{className:"affiliate-analytics-subtitle",children:"Track product views, clicks, post performance, slider activity, and recent website events."})]}),e.jsx("div",{className:"affiliate-analytics-hero-actions",children:e.jsxs("button",{type:"button",className:"affiliate-analytics-btn secondary",onClick:()=>o(!0),disabled:r,children:[e.jsx(ce,{size:16,className:r?"spin":""}),r?"Refreshing...":"Refresh"]})})]}),m?e.jsxs("div",{className:"affiliate-analytics-alert error",children:[e.jsx(pe,{size:18}),e.jsx("span",{children:m})]}):null,e.jsxs("section",{className:"affiliate-analytics-stats-grid",children:[e.jsx(T,{title:"Products",value:d.total_products||0,icon:Y,hint:"Total products in your affiliate store"}),e.jsx(T,{title:"Posts",value:d.total_posts||0,icon:Z,hint:"Total content posts created"}),e.jsx(T,{title:"Product Views",value:d.total_product_views||0,icon:ue,hint:"All product page views"}),e.jsx(T,{title:"Product Clicks",value:d.total_product_clicks||0,icon:de,hint:"All product click actions"})]}),e.jsxs("section",{className:"affiliate-analytics-stats-grid second",children:[e.jsx(T,{title:"Post Views",value:d.total_post_views||0,icon:W,hint:"All content views across posts"}),e.jsx(T,{title:"Slider Clicks",value:d.total_slider_clicks||0,icon:ye,hint:"Clicks coming from sliders"}),e.jsx(T,{title:"Buy Now Clicks",value:u.buy_now||0,icon:we,hint:"Direct buy intent clicks"}),e.jsx(T,{title:"Read More / Learn More",value:_,icon:be,hint:"Informational CTA clicks"})]}),e.jsxs("section",{className:"affiliate-analytics-main-grid",children:[e.jsxs("div",{className:"affiliate-analytics-panel",children:[e.jsx("div",{className:"affiliate-analytics-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-analytics-panel-kicker",children:"Top products"}),e.jsx("h2",{className:"affiliate-analytics-panel-title",children:"Best performing products"})]})}),j.length?e.jsx("div",{className:"affiliate-analytics-list",children:j.map(n=>e.jsx(ne,{title:n.title,rows:[{label:"Views",value:n.total_views||0},{label:"Clicks",value:n.total_clicks||0},{label:"Posts",value:n.total_posts||0}]},n.id))}):e.jsxs("div",{className:"affiliate-analytics-empty-small",children:[e.jsx(Y,{size:24}),e.jsx("p",{children:"No product analytics yet."})]})]}),e.jsxs("div",{className:"affiliate-analytics-panel",children:[e.jsx("div",{className:"affiliate-analytics-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-analytics-panel-kicker",children:"Top posts"}),e.jsx("h2",{className:"affiliate-analytics-panel-title",children:"Best performing posts"})]})}),N.length?e.jsx("div",{className:"affiliate-analytics-list",children:N.map(n=>{var w;return e.jsx(ne,{title:n.title,rows:[{label:"Views",value:n.total_views||0},{label:"CTA Buttons",value:n.total_cta_buttons||0},{label:"Product",value:((w=n.product)==null?void 0:w.title)||"-"}]},n.id)})}):e.jsxs("div",{className:"affiliate-analytics-empty-small",children:[e.jsx(Z,{size:24}),e.jsx("p",{children:"No post analytics yet."})]})]})]}),e.jsxs("section",{className:"affiliate-analytics-panel",children:[e.jsx("div",{className:"affiliate-analytics-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-analytics-panel-kicker",children:"Recent activity"}),e.jsx("h2",{className:"affiliate-analytics-panel-title",children:"Latest tracked actions"})]})}),y.length?e.jsx("div",{className:"affiliate-analytics-activity-list",children:y.map(n=>{var w,h;return e.jsxs("div",{className:"affiliate-analytics-activity-card",children:[e.jsx("div",{className:"affiliate-analytics-activity-icon",children:e.jsx(K,{size:18})}),e.jsxs("div",{className:"affiliate-analytics-activity-main",children:[e.jsx("h3",{children:n.activity_type||"-"}),e.jsxs("div",{className:"affiliate-analytics-activity-grid",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Click Type"}),e.jsx("strong",{children:n.click_type||"-"})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Product"}),e.jsx("strong",{children:((w=n.product)==null?void 0:w.title)||"-"})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Post"}),e.jsx("strong",{children:((h=n.post)==null?void 0:h.title)||"-"})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Date"}),e.jsx("strong",{children:n.created_at||"-"})]})]})]})]},`${n.activity_type}-${n.id}`)})}):e.jsxs("div",{className:"affiliate-analytics-empty",children:[e.jsx(K,{size:30}),e.jsx("h3",{children:"No recent analytics activity yet"}),e.jsx("p",{children:"Tracked actions will appear here once users start interacting with your store."})]})]})]})}const le=`
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
`,Me=[{key:"total_activity",label:"All activity"},{key:"product_views",label:"Product views"},{key:"product_clicks",label:"Product clicks"},{key:"post_views",label:"Post views"},{key:"slider_clicks",label:"Slider clicks"}];function $(a){const i=Number(a||0);return new Intl.NumberFormat(void 0,{notation:i>=1e4?"compact":"standard",maximumFractionDigits:i>=1e4?1:0}).format(i)}function re(a,i=!1){if(!a)return"-";const t=new Date(`${a}T00:00:00Z`);return Number.isNaN(t.getTime())?a:t.toLocaleDateString(void 0,i?{month:"short",day:"numeric",timeZone:"UTC"}:{month:"short",day:"numeric",year:"numeric",timeZone:"UTC"})}function $e(a,i){return(a==null?void 0:a[i])||{current:0,previous:0,change_percent:0,direction:"flat"}}function Re({comparison:a}){const i=(a==null?void 0:a.direction)||"flat",t=Number((a==null?void 0:a.previous)||0),s=Number((a==null?void 0:a.current)||0),r=Math.abs(Number((a==null?void 0:a.change_percent)||0));let p="No change";return t===0&&s>0?p="New activity":i==="up"?p=`${r.toFixed(r>=10?0:1)}% up`:i==="down"&&(p=`${r.toFixed(r>=10?0:1)}% down`),e.jsxs("span",{className:`wa-change ${i}`,children:[e.jsx("span",{"aria-hidden":"true",children:i==="up"?"+":i==="down"?"-":"="}),p]})}function Te(a){if(!a.length)return"";if(a.length===1)return`M ${a[0].x} ${a[0].y}`;let i=`M ${a[0].x} ${a[0].y}`;for(let t=1;t<a.length;t+=1){const s=a[t-1],r=a[t],p=(s.x+r.x)/2;i+=` C ${p} ${s.y}, ${p} ${r.y}, ${r.x} ${r.y}`}return i}function Le({points:a,metricKey:i,comparison:t}){const p={top:20,right:18,bottom:42,left:48},m=820-p.left-p.right,x=292-p.top-p.bottom,o=a.map(f=>Number((f==null?void 0:f[i])||0)),d=Math.max(1,...o),u=d<=4?1:Math.ceil(d/4),j=Math.max(4,u*4),N=p.top+x,y=a.map((f,l)=>{const k=a.length<=1?p.left+m/2:p.left+l/(a.length-1)*m,b=Number((f==null?void 0:f[i])||0),R=p.top+x-b/j*x;return{...f,x:k,y:R,value:b}}),_=Te(y),n=y.length?`${_} L ${y[y.length-1].x} ${N} L ${y[0].x} ${N} Z`:"",w=[0,1,2,3,4].map(f=>u*f),h=a.length<=7?a.map((f,l)=>l):[0,Math.floor((a.length-1)*.25),Math.floor((a.length-1)*.5),Math.floor((a.length-1)*.75),a.length-1],v=[...new Set(h)];return e.jsxs("div",{className:"wa-chart-shell",children:[e.jsxs("div",{className:"wa-chart-total",children:[e.jsx("span",{children:"Selected period"}),e.jsx("strong",{children:$((t==null?void 0:t.current)||0)}),e.jsx(Re,{comparison:t})]}),e.jsx("div",{className:"wa-chart-scroll",children:e.jsxs("svg",{className:"wa-chart",viewBox:"0 0 820 292",role:"img","aria-label":"Daily analytics rise and fall chart",children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"writerAnalyticsAreaFill",x1:"0",y1:"0",x2:"0",y2:"1",children:[e.jsx("stop",{offset:"0%",stopColor:"currentColor",stopOpacity:"0.2"}),e.jsx("stop",{offset:"100%",stopColor:"currentColor",stopOpacity:"0.01"})]})}),w.map(f=>{const l=p.top+x-f/j*x;return e.jsxs("g",{children:[e.jsx("line",{x1:p.left,x2:820-p.right,y1:l,y2:l,className:"wa-chart-grid"}),e.jsx("text",{x:p.left-10,y:l+4,textAnchor:"end",className:"wa-chart-axis",children:$(f)})]},f)}),n?e.jsx("path",{d:n,className:"wa-chart-area"}):null,_?e.jsx("path",{d:_,className:"wa-chart-line"}):null,y.map((f,l)=>e.jsx("circle",{cx:f.x,cy:f.y,r:a.length>35?2.2:3,className:"wa-chart-point",children:e.jsx("title",{children:`${re(f.date)}: ${$(f.value)}`})},`${f.date}-${l}`)),v.map(f=>{const l=y[f];return l?e.jsx("text",{x:l.x,y:278,textAnchor:f===0?"start":f===a.length-1?"end":"middle",className:"wa-chart-axis",children:re(l.date,!0)},`label-${l.date}`):null})]})})]})}function B({label:a,value:i,hint:t}){return e.jsxs("article",{className:"wa-stat",children:[e.jsx("span",{children:a}),e.jsx("strong",{children:$(i)}),e.jsx("small",{children:t})]})}function De(){const[a,i]=g.useState(null),[t,s]=g.useState(30),[r,p]=g.useState("total_activity"),[m,x]=g.useState(!0),[o,d]=g.useState(!1),[u,j]=g.useState(""),[N,y]=g.useState(null),[_,n]=g.useState(null),[w,h]=g.useState(!1),[v,f]=g.useState(""),l=async({refresh:c=!1,days:P=t}={})=>{var M,S;try{j(""),c?d(!0):x(!0);const{data:D}=await E.get("/api/writer/analytics",{params:{days:P}});i((D==null?void 0:D.analytics)||null)}catch(D){j(((S=(M=D==null?void 0:D.response)==null?void 0:M.data)==null?void 0:S.message)||"Failed to load analytics")}finally{x(!1),d(!1)}},k=async c=>{var P,M;if(c!=null&&c.id){y(c),n(null),f(""),h(!0);try{const{data:S}=await E.get(`/api/writer/analytics/posts/${c.id}`);n(S||null)}catch(S){f(((M=(P=S==null?void 0:S.response)==null?void 0:P.data)==null?void 0:M.message)||"Failed to load post analytics")}finally{h(!1)}}};g.useEffect(()=>{l({days:t})},[t]);const b=(a==null?void 0:a.overview)||{},R=(a==null?void 0:a.click_breakdown)||{},U=Array.isArray(a==null?void 0:a.top_products)?a.top_products:[],J=Array.isArray(a==null?void 0:a.top_posts)?a.top_posts:[],G=Array.isArray(a==null?void 0:a.recent_activity)?a.recent_activity:[],L=(a==null?void 0:a.trend)||{},H=Array.isArray(L==null?void 0:L.points)?L.points:[],xe=$e(L==null?void 0:L.comparison,r),fe=Number(R.read_more||0)+Number(R.learn_more||0);return m?e.jsxs("div",{className:"wa-page",children:[e.jsx("style",{children:oe}),e.jsxs("section",{className:"wa-loading",children:[e.jsx("div",{className:"wa-spinner"}),e.jsx("strong",{children:"Loading analytics..."})]})]}):e.jsxs("div",{className:"wa-page",children:[e.jsx("style",{children:oe}),e.jsx(Ce,{enabled:!0}),e.jsxs("div",{className:"wa-command",children:[e.jsxs("div",{children:[e.jsx("p",{children:"Performance"}),e.jsx("span",{children:"See how Readers move through your products and stories over time."})]}),e.jsxs("div",{className:"wa-command-actions",children:[e.jsxs("select",{"aria-label":"Analytics period",value:t,onChange:c=>s(Number(c.target.value)),disabled:o,children:[e.jsx("option",{value:7,children:"Last 7 days"}),e.jsx("option",{value:30,children:"Last 30 days"}),e.jsx("option",{value:90,children:"Last 90 days"})]}),e.jsxs("button",{type:"button",className:"wa-btn",onClick:()=>l({refresh:!0,days:t}),disabled:o,children:[e.jsx(ce,{size:14,className:o?"spin":""}),o?"Refreshing...":"Refresh"]})]})]}),u?e.jsxs("div",{className:"wa-alert",role:"alert",children:[e.jsx(pe,{size:16}),e.jsx("span",{children:u})]}):null,e.jsxs("section",{className:"wa-stats","aria-label":"Analytics summary",children:[e.jsx(B,{label:"Product views",value:b.total_product_views||0,hint:"All recorded product views"}),e.jsx(B,{label:"Product clicks",value:b.total_product_clicks||0,hint:"All product click actions"}),e.jsx(B,{label:"Post views",value:b.total_post_views||0,hint:"All recorded story views"}),e.jsx(B,{label:"Slider clicks",value:b.total_slider_clicks||0,hint:"Tracked slider interactions"})]}),e.jsxs("section",{className:"wa-panel wa-trend-panel",children:[e.jsx("div",{className:"wa-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{children:"Traffic trend"}),e.jsx("h2",{children:"Rise and fall"}),e.jsx("span",{children:"Real daily activity for the selected period compared with the previous period."})]})}),e.jsx("div",{className:"wa-metric-tabs",role:"tablist","aria-label":"Chart metric",children:Me.map(c=>e.jsx("button",{type:"button",role:"tab","aria-selected":r===c.key,className:r===c.key?"is-active":"",onClick:()=>p(c.key),children:c.label},c.key))}),H.length?e.jsx(Le,{points:H,metricKey:r,comparison:xe}):e.jsxs("div",{className:"wa-empty",children:[e.jsx(W,{size:24}),e.jsx("strong",{children:"No trend activity yet"}),e.jsx("span",{children:"Daily analytics will appear here as Readers interact with your content."})]})]}),e.jsxs("section",{className:"wa-secondary-grid",children:[e.jsxs("div",{className:"wa-panel",children:[e.jsx("div",{className:"wa-panel-head compact",children:e.jsxs("div",{children:[e.jsx("p",{children:"Top products"}),e.jsx("h2",{children:"Best performing products"})]})}),U.length?e.jsx("div",{className:"wa-ranking-list",children:U.slice(0,6).map((c,P)=>e.jsxs("article",{className:"wa-ranking-row",children:[e.jsx("span",{className:"wa-rank",children:P+1}),e.jsxs("div",{children:[e.jsx("strong",{children:c.title||"Untitled product"}),e.jsxs("small",{children:[$(c.total_views||0)," views"]})]}),e.jsxs("b",{children:[$(c.total_clicks||0)," clicks"]})]},c.id))}):e.jsxs("div",{className:"wa-empty small",children:[e.jsx(Y,{size:20}),e.jsx("span",{children:"No product analytics yet."})]})]}),e.jsxs("div",{className:"wa-panel",children:[e.jsx("div",{className:"wa-panel-head compact",children:e.jsxs("div",{children:[e.jsx("p",{children:"Top posts"}),e.jsx("h2",{children:"Best performing stories"})]})}),J.length?e.jsx("div",{className:"wa-ranking-list",children:J.slice(0,6).map((c,P)=>{var M;return e.jsxs("article",{className:"wa-ranking-row",role:"button",tabIndex:0,style:{cursor:"pointer"},"aria-label":`Analyze ${c.title||"post"}`,onClick:()=>k(c),onKeyDown:S=>{(S.key==="Enter"||S.key===" ")&&(S.preventDefault(),k(c))},children:[e.jsx("span",{className:"wa-rank",children:P+1}),e.jsxs("div",{children:[e.jsx("strong",{children:c.title||"Untitled story"}),e.jsx("small",{children:((M=c.product)==null?void 0:M.title)||"Independent story"})]}),e.jsxs("b",{children:[$(c.total_views||0)," views"]})]},c.id)})}):e.jsxs("div",{className:"wa-empty small",children:[e.jsx(Z,{size:20}),e.jsx("span",{children:"No story analytics yet."})]})]})]}),e.jsxs("section",{className:"wa-bottom-grid",children:[e.jsxs("div",{className:"wa-panel",children:[e.jsx("div",{className:"wa-panel-head compact",children:e.jsxs("div",{children:[e.jsx("p",{children:"Intent"}),e.jsx("h2",{children:"Product click actions"})]})}),e.jsxs("div",{className:"wa-intent-grid",children:[e.jsxs("article",{children:[e.jsx("span",{children:"Buy now"}),e.jsx("strong",{children:$(R.buy_now||0)})]}),e.jsxs("article",{children:[e.jsx("span",{children:"Read / Learn more"}),e.jsx("strong",{children:$(fe)})]})]})]}),e.jsxs("div",{className:"wa-panel",children:[e.jsx("div",{className:"wa-panel-head compact",children:e.jsxs("div",{children:[e.jsx("p",{children:"Recent"}),e.jsx("h2",{children:"Latest tracked activity"})]})}),G.length?e.jsx("div",{className:"wa-activity-list",children:G.slice(0,8).map(c=>{var P,M;return e.jsxs("article",{children:[e.jsx("span",{className:"wa-activity-dot"}),e.jsxs("div",{children:[e.jsx("strong",{children:String(c.activity_type||"activity").replace(/_/g," ")}),e.jsx("small",{children:((P=c.product)==null?void 0:P.title)||((M=c.post)==null?void 0:M.title)||c.click_type||"Website activity"})]}),e.jsx("time",{children:c.created_at?new Date(c.created_at).toLocaleDateString():"-"})]},`${c.activity_type}-${c.id}`)})}):e.jsxs("div",{className:"wa-empty small",children:[e.jsx(K,{size:20}),e.jsx("span",{children:"No recent analytics activity yet."})]})]})]}),e.jsx(Ne,{post:N,data:_,loading:w,error:v,onClose:()=>{y(null),n(null),f("")},onRetry:()=>N&&k(N)})]})}function Ye(){return ge().pathname==="/writer/analytics"?e.jsx(De,{}):e.jsx(Pe,{})}const oe=`
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
`;export{Ye as default};
