import{f as U,b as A,r as x,j as e,L as l,I as _,X as D,o as I,H as B,J as F,K as q,S as Y,O as G,Q as K,Y as H,y as Q,Z as $,_ as J}from"./index-D7wY-Nn2.js";import{R as W,U as X,G as Z}from"./ReaderUnifiedShell-CcGKzkmA.js";import{S as V}from"./sparkles-DniX3uPT.js";import{C as ee}from"./crown-9tuqvcLd.js";function ae(){return localStorage.getItem("customerToken")||localStorage.getItem("authToken")||localStorage.getItem("token")||""}function re(){try{const a=localStorage.getItem("customerUser")||localStorage.getItem("user")||"";return a?JSON.parse(a):null}catch{return null}}function de(a,o="-"){const d=String(a||"").trim();return d?d.replace(/[_-]+/g," ").replace(/\b\w/g,s=>s.toUpperCase()):o}function j({value:a,tone:o}){const d=String(a||"").trim().toLowerCase(),s=o||(["active","approved","verified","paid","completed"].includes(d)?"good":["pending","review","under review","processing"].includes(d)?"warn":["rejected","failed","suspended","inactive"].includes(d)?"bad":"neutral");return e.jsx("span",{className:`reader-dashboard-pill ${s}`,children:de(a,"Not set")})}function p({label:a,value:o,helper:d,to:s}){const i=e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"reader-dashboard-metric-label",children:a}),e.jsx("strong",{children:o}),e.jsx("span",{className:"reader-dashboard-metric-helper",children:d})]});return s?e.jsx(l,{className:"reader-dashboard-metric",to:s,children:i}):e.jsx("div",{className:"reader-dashboard-metric",children:i})}const oe=[{label:"Discover",items:[{label:"Overview",to:"/reader/dashboard",icon:B},{label:"For You",to:"/reader/feed",icon:V},{label:"Interests",to:"/reader/interests",icon:F}]},{label:"Library",items:[{label:"Saved Posts",to:"/reader/saved-posts",icon:q},{label:"Saved Products",to:"/reader/saved-products",icon:Y},{label:"Following",to:"/reader/following",icon:X},{label:"Courses",to:"/reader/courses",icon:Z}]},{label:"Account",items:[{label:"Credits",to:"/reader/credits",icon:G},{label:"Premium",to:"/reader/premium",icon:ee},{label:"Notifications",to:"/reader/notifications",icon:K},{label:"Messages",to:"/reader/messages",icon:H},{label:"Settings",to:"/reader/settings",icon:Q}]},{label:"Advertiser",items:[{label:"Create Campaign",to:"/customer/advertiser/campaigns/create",icon:$}]}];function k(a){return(a==null?void 0:a.display_name)||(a==null?void 0:a.full_name)||(a==null?void 0:a.name)||(a==null?void 0:a.username)||(a==null?void 0:a.email)||"Reader"}function O(a){const o=String(a||"").trim();return o?o.charAt(0).toUpperCase():"R"}function M({onNavigate:a}){const o=A();return e.jsx("nav",{className:"reader-dashboard-nav","aria-label":"Reader navigation",children:oe.map(d=>e.jsxs("div",{className:"reader-dashboard-nav-group",children:[e.jsx("div",{className:"reader-dashboard-nav-label",children:d.label}),e.jsx("div",{className:"reader-dashboard-nav-list",children:d.items.map(s=>{const i=s.icon;return e.jsxs(J,{to:s.to,onClick:a,className:({isActive:w})=>{const m=s.to==="/reader/dashboard"&&o.pathname==="/customer/dashboard";return`reader-dashboard-nav-link${w||m?" active":""}`},children:[e.jsx("span",{className:"reader-dashboard-nav-icon","aria-hidden":"true",children:e.jsx(i,{size:16,strokeWidth:1.9})}),e.jsx("span",{children:s.label})]},s.to)})})]},d.label))})}function se({customer:a,onLogout:o}){const d=k(a);return e.jsxs("aside",{className:"reader-dashboard-sidebar",children:[e.jsxs("div",{className:"reader-dashboard-brand",children:[e.jsx("span",{className:"reader-dashboard-brand-mark",children:"B"}),e.jsxs("div",{className:"reader-dashboard-brand-copy",children:[e.jsx("strong",{children:"Bloggad"}),e.jsx("small",{children:"Reader"})]})]}),e.jsx(M,{}),e.jsxs("div",{className:"reader-dashboard-reader-card",children:[e.jsx("span",{className:"reader-dashboard-avatar","aria-hidden":"true",children:O(d)}),e.jsxs("div",{className:"reader-dashboard-reader-copy",children:[e.jsx("strong",{children:d}),e.jsx("small",{children:"Reader account"})]}),e.jsx("button",{type:"button",className:"reader-dashboard-logout",onClick:o,"aria-label":"Log out",children:e.jsx(I,{size:15})})]})]})}function u({label:a,value:o,children:d}){return e.jsxs("div",{className:"reader-dashboard-info-row",children:[e.jsx("span",{children:a}),d||e.jsx("strong",{children:o||"-"})]})}function h({eyebrow:a,title:o,description:d,to:s}){return e.jsxs(l,{className:"reader-dashboard-quick-link",to:s,children:[e.jsx("span",{children:a}),e.jsx("strong",{children:o}),e.jsx("p",{children:d}),e.jsx("b",{children:"Open"})]})}function ce(){var R,C;const a=U(),o=A(),[d,s]=x.useState(!0),[i,w]=x.useState(null),[m,N]=x.useState(""),[T,v]=x.useState(!1),y=x.useMemo(()=>ae(),[]),P=x.useMemo(()=>re(),[]);x.useEffect(()=>{if(!y){a("/reader/login",{replace:!0});return}let g=!0;async function L(){s(!0),N("");try{const f=await fetch("/api/customer/dashboard",{method:"GET",headers:{Accept:"application/json",Authorization:`Bearer ${y}`}}),b=await f.json();if(!f.ok||!(b!=null&&b.ok))throw new Error((b==null?void 0:b.message)||"Failed to fetch Reader dashboard.");g&&w(b)}catch(f){g&&N((f==null?void 0:f.message)||"Failed to fetch Reader dashboard.")}finally{g&&s(!1)}}return L(),()=>{g=!1}},[a,y]);const n=(i==null?void 0:i.customer)||P||{},c=(i==null?void 0:i.stats)||{},t=((R=i==null?void 0:i.registered_under)==null?void 0:R.affiliate)||null,r=((C=i==null?void 0:i.registered_under)==null?void 0:C.website)||null,z=r!=null&&r.slug?`/${encodeURIComponent(r.slug)}`:"/reader/feed";function S(){["customerToken","authToken","accessToken","token","customerUser","user","customerLoginContext"].forEach(g=>localStorage.removeItem(g)),a("/reader/login",{replace:!0})}return o.pathname==="/reader/dashboard"?e.jsxs(W,{title:"Overview",subtitle:"Your Reader dashboard",children:[e.jsx("style",{children:E}),e.jsxs("main",{className:"reader-dashboard-main",children:[e.jsxs("section",{className:"reader-dashboard-hero",children:[e.jsxs("div",{children:[e.jsx("span",{className:"reader-dashboard-eyebrow",children:"READER HOME"}),e.jsx("h1",{children:"Reader Dashboard"}),e.jsx("p",{children:"Keep your saved content, Writer conversations, and reading tools organized in one clear place."})]}),e.jsx(l,{className:"reader-dashboard-primary-button",to:"/reader/feed",children:"Open For You"})]}),m?e.jsx("div",{className:"reader-dashboard-alert error",children:m}):null,e.jsxs("section",{className:"reader-dashboard-metrics",children:[e.jsx(p,{label:"Saved Posts",value:d?"-":Number(c.saved_posts||0),helper:"Posts kept for later",to:"/reader/saved-posts"}),e.jsx(p,{label:"Saved Products",value:d?"-":Number(c.saved_products||0),helper:"Products you bookmarked",to:"/reader/saved-products"}),e.jsx(p,{label:"Writer Chats",value:d?"-":Number(c.affiliate_chats||0),helper:"Writer conversations",to:"/reader/messages"}),e.jsx(p,{label:"Admin Support",value:d?"-":Number(c.admin_chats||0),helper:"Support conversations",to:"/reader/messages"})]}),e.jsxs("section",{className:"reader-dashboard-two-column",children:[e.jsxs("article",{className:"reader-dashboard-panel reader-dashboard-connection-panel",children:[e.jsxs("div",{className:"reader-dashboard-panel-heading",children:[e.jsxs("div",{children:[e.jsx("span",{className:"reader-dashboard-section-kicker",children:"CONNECTION"}),e.jsx("h2",{children:"Writer & Writer Space"}),e.jsx("p",{children:"Your signup connection and the Writer Space attached to this Reader account."})]}),r!=null&&r.status?e.jsx(j,{value:r.status}):null]}),e.jsxs("div",{className:"reader-dashboard-connection-grid",children:[e.jsxs("div",{className:"reader-dashboard-connection-card",children:[e.jsx("span",{className:"reader-dashboard-card-label",children:"REGISTERED WRITER"}),e.jsx("strong",{children:(t==null?void 0:t.name)||"Main marketplace signup"}),e.jsx("p",{children:(t==null?void 0:t.email)||"No Writer connection"}),e.jsx(l,{to:"/reader/messages",children:"Message Writer"})]}),e.jsxs("div",{className:"reader-dashboard-connection-card",children:[e.jsx("span",{className:"reader-dashboard-card-label",children:"WRITER SPACE"}),e.jsx("strong",{children:(r==null?void 0:r.website_name)||"Main marketplace"}),e.jsx("p",{children:(r==null?void 0:r.slug)||"No connected Writer Space"}),e.jsx(l,{to:z,target:r!=null&&r.slug?"_blank":void 0,children:r!=null&&r.slug?"Open Writer Space":"Browse For You"})]})]})]}),e.jsxs("article",{className:"reader-dashboard-panel",children:[e.jsx("div",{className:"reader-dashboard-panel-heading simple",children:e.jsxs("div",{children:[e.jsx("span",{className:"reader-dashboard-section-kicker",children:"ACCOUNT"}),e.jsx("h2",{children:"Account overview"})]})}),e.jsxs("div",{className:"reader-dashboard-info-list",children:[e.jsx(u,{label:"Status",children:e.jsx(j,{value:(n==null?void 0:n.status)||"active"})}),e.jsx(u,{label:"Role",value:"Reader"}),e.jsx(u,{label:"Reader access",value:(n==null?void 0:n.email)||"Signed in"})]}),e.jsx(l,{className:"reader-dashboard-secondary-button full",to:"/reader/settings",children:"Manage Settings"})]})]}),e.jsxs("section",{className:"reader-dashboard-section-block",children:[e.jsxs("div",{className:"reader-dashboard-section-title",children:[e.jsxs("div",{children:[e.jsx("span",{className:"reader-dashboard-section-kicker",children:"QUICK ACCESS"}),e.jsx("h2",{children:"Your Reader tools"})]}),e.jsx(l,{to:"/reader/feed",children:"Open reading feed"})]}),e.jsxs("div",{className:"reader-dashboard-quick-grid",children:[e.jsx(h,{eyebrow:"NETWORK",title:"Following",description:"See the Writers you follow and return to their work.",to:"/reader/following"}),e.jsx(h,{eyebrow:"LEARNING",title:"Courses",description:"Continue Reader courses and learning activity.",to:"/reader/courses"}),e.jsx(h,{eyebrow:"BALANCE",title:"Credits",description:"Review Reader credits available for supported actions.",to:"/reader/credits"}),e.jsx(h,{eyebrow:"UPDATES",title:"Notifications",description:"See recent Reader notifications and account updates.",to:"/reader/notifications"})]})]})]})]}):e.jsxs("div",{className:"reader-dashboard-screen",children:[e.jsx("style",{children:E}),e.jsxs("div",{className:"reader-dashboard-layout",children:[e.jsx(se,{customer:n,onLogout:S}),e.jsxs("div",{className:"reader-dashboard-main-wrap",children:[e.jsxs("header",{className:"reader-dashboard-desktop-topbar",children:[e.jsx("h1",{children:"Overview"}),e.jsx("span",{children:"Your Reader dashboard"})]}),e.jsxs("header",{className:"reader-dashboard-mobile-topbar",children:[e.jsxs("div",{className:"reader-dashboard-mobile-brand",children:[e.jsx("span",{className:"reader-dashboard-brand-mark",children:"B"}),e.jsx("strong",{children:"Reader"})]}),e.jsxs("button",{type:"button",className:"reader-dashboard-mobile-menu-button",onClick:()=>v(!0),children:[e.jsx(_,{size:15}),e.jsx("span",{children:"Menu"})]})]}),e.jsxs("main",{className:"reader-dashboard-main",children:[e.jsxs("section",{className:"reader-dashboard-hero",children:[e.jsxs("div",{children:[e.jsx("span",{className:"reader-dashboard-eyebrow",children:"READER HOME"}),e.jsx("h1",{children:"Reader Dashboard"}),e.jsx("p",{children:"Keep your saved content, Writer conversations, and reading tools organized in one clear place."})]}),e.jsx(l,{className:"reader-dashboard-primary-button",to:"/reader/feed",children:"Open For You"})]}),m?e.jsx("div",{className:"reader-dashboard-alert error",children:m}):null,e.jsxs("section",{className:"reader-dashboard-metrics",children:[e.jsx(p,{label:"Saved Posts",value:d?"-":Number(c.saved_posts||0),helper:"Posts kept for later",to:"/reader/saved-posts"}),e.jsx(p,{label:"Saved Products",value:d?"-":Number(c.saved_products||0),helper:"Products you bookmarked",to:"/reader/saved-products"}),e.jsx(p,{label:"Writer Chats",value:d?"-":Number(c.affiliate_chats||0),helper:"Writer conversations",to:"/reader/messages"}),e.jsx(p,{label:"Admin Support",value:d?"-":Number(c.admin_chats||0),helper:"Support conversations",to:"/reader/messages"})]}),e.jsxs("section",{className:"reader-dashboard-two-column",children:[e.jsxs("article",{className:"reader-dashboard-panel reader-dashboard-connection-panel",children:[e.jsxs("div",{className:"reader-dashboard-panel-heading",children:[e.jsxs("div",{children:[e.jsx("span",{className:"reader-dashboard-section-kicker",children:"CONNECTION"}),e.jsx("h2",{children:"Writer & Writer Space"}),e.jsx("p",{children:"Your signup connection and the Writer Space attached to this Reader account."})]}),r!=null&&r.status?e.jsx(j,{value:r.status}):null]}),e.jsxs("div",{className:"reader-dashboard-connection-grid",children:[e.jsxs("div",{className:"reader-dashboard-connection-card",children:[e.jsx("span",{className:"reader-dashboard-card-label",children:"REGISTERED WRITER"}),e.jsx("strong",{children:(t==null?void 0:t.name)||"Main marketplace signup"}),e.jsx("p",{children:(t==null?void 0:t.email)||"No Writer connection"}),e.jsx(l,{to:"/reader/messages",children:"Message Writer"})]}),e.jsxs("div",{className:"reader-dashboard-connection-card",children:[e.jsx("span",{className:"reader-dashboard-card-label",children:"WRITER SPACE"}),e.jsx("strong",{children:(r==null?void 0:r.website_name)||"Main marketplace"}),e.jsx("p",{children:(r==null?void 0:r.slug)||"No connected Writer Space"}),e.jsx(l,{to:z,target:r!=null&&r.slug?"_blank":void 0,children:r!=null&&r.slug?"Open Writer Space":"Browse For You"})]})]})]}),e.jsxs("article",{className:"reader-dashboard-panel",children:[e.jsx("div",{className:"reader-dashboard-panel-heading simple",children:e.jsxs("div",{children:[e.jsx("span",{className:"reader-dashboard-section-kicker",children:"ACCOUNT"}),e.jsx("h2",{children:"Account overview"})]})}),e.jsxs("div",{className:"reader-dashboard-info-list",children:[e.jsx(u,{label:"Status",children:e.jsx(j,{value:(n==null?void 0:n.status)||"active"})}),e.jsx(u,{label:"Role",value:"Reader"}),e.jsx(u,{label:"Reader access",value:(n==null?void 0:n.email)||"Signed in"})]}),e.jsx(l,{className:"reader-dashboard-secondary-button full",to:"/reader/settings",children:"Manage Settings"})]})]}),e.jsxs("section",{className:"reader-dashboard-section-block",children:[e.jsxs("div",{className:"reader-dashboard-section-title",children:[e.jsxs("div",{children:[e.jsx("span",{className:"reader-dashboard-section-kicker",children:"QUICK ACCESS"}),e.jsx("h2",{children:"Your Reader tools"})]}),e.jsx(l,{to:"/reader/feed",children:"Open reading feed"})]}),e.jsxs("div",{className:"reader-dashboard-quick-grid",children:[e.jsx(h,{eyebrow:"NETWORK",title:"Following",description:"See the Writers you follow and return to their work.",to:"/reader/following"}),e.jsx(h,{eyebrow:"LEARNING",title:"Courses",description:"Continue Reader courses and learning activity.",to:"/reader/courses"}),e.jsx(h,{eyebrow:"BALANCE",title:"Credits",description:"Review Reader credits available for supported actions.",to:"/reader/credits"}),e.jsx(h,{eyebrow:"UPDATES",title:"Notifications",description:"See recent Reader notifications and account updates.",to:"/reader/notifications"})]})]})]})]})]}),T?e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"reader-dashboard-mobile-overlay",onClick:()=>v(!1),"aria-label":"Close Reader menu"}),e.jsxs("aside",{className:"reader-dashboard-mobile-drawer","aria-label":"Reader menu",children:[e.jsxs("div",{className:"reader-dashboard-mobile-drawer-head",children:[e.jsxs("div",{className:"reader-dashboard-brand",children:[e.jsx("span",{className:"reader-dashboard-brand-mark",children:"B"}),e.jsxs("div",{className:"reader-dashboard-brand-copy",children:[e.jsx("strong",{children:"Bloggad"}),e.jsx("small",{children:"Reader"})]})]}),e.jsx("button",{type:"button",className:"reader-dashboard-mobile-close",onClick:()=>v(!1),"aria-label":"Close menu",children:e.jsx(D,{size:17})})]}),e.jsx(M,{onNavigate:()=>v(!1)}),e.jsxs("div",{className:"reader-dashboard-reader-card",children:[e.jsx("span",{className:"reader-dashboard-avatar","aria-hidden":"true",children:O(k(n))}),e.jsxs("div",{className:"reader-dashboard-reader-copy",children:[e.jsx("strong",{children:k(n)}),e.jsx("small",{children:"Reader account"})]}),e.jsx("button",{type:"button",className:"reader-dashboard-logout",onClick:S,"aria-label":"Log out",children:e.jsx(I,{size:15})})]})]})]}):null]})}const E=`
  .reader-dashboard-screen,
  .reader-dashboard-screen * {
    box-sizing: border-box;
  }

  .reader-dashboard-screen {
    min-height: 100vh;
    background: #f5f6f8;
    color: #1c1f24;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .reader-dashboard-layout {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
  }

  .reader-dashboard-sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    border-right: 1px solid #dfe3e6;
    background: #ffffff;
    padding: 22px 16px 18px;
    display: flex;
    flex-direction: column;
  }

  .reader-dashboard-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .reader-dashboard-brand-mark {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: #1c1f24;
    display: grid;
    place-items: center;
  }

  .reader-dashboard-brand-mark i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #ffffff;
    display: block;
  }

  .reader-dashboard-reader-card {
    margin-top: 24px;
    padding: 12px;
    border: 1px solid #e4e7ea;
    border-radius: 12px;
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr);
    gap: 10px;
    align-items: center;
  }

  .reader-dashboard-reader-card strong,
  .reader-dashboard-reader-card span {
    display: block;
    min-width: 0;
  }

  .reader-dashboard-reader-card strong {
    font-size: 13px;
    line-height: 1.35;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .reader-dashboard-reader-card span {
    margin-top: 2px;
    color: #6e7378;
    font-size: 11px;
    line-height: 1.35;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .reader-dashboard-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #eef0f2;
    display: grid;
    place-items: center;
    font-size: 13px;
    font-weight: 800;
  }

  .reader-dashboard-nav {
    margin-top: 22px;
    display: grid;
    gap: 20px;
  }

  .reader-dashboard-nav-group {
    display: grid;
    gap: 3px;
  }

  .reader-dashboard-nav-label,
  .reader-dashboard-card-label,
  .reader-dashboard-section-kicker,
  .reader-dashboard-eyebrow {
    color: #777d82;
    font-size: 11px;
    line-height: 1.35;
    font-weight: 800;
    letter-spacing: 0.09em;
  }

  .reader-dashboard-nav-label {
    padding: 0 9px 5px;
  }

  .reader-dashboard-nav-link {
    min-height: 34px;
    padding: 7px 9px;
    border-radius: 8px;
    color: #51565b;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
  }

  .reader-dashboard-nav-link:hover,
  .reader-dashboard-nav-link.active {
    background: #f0f1f2;
    color: #1c1f24;
  }

  .reader-dashboard-nav-arrow {
    color: #9aa0a5;
    font-size: 16px;
    line-height: 1;
  }

  .reader-dashboard-logout {
    margin-top: auto;
    min-height: 38px;
    width: 100%;
    border: 1px solid #dfe3e6;
    background: #ffffff;
    color: #35393d;
    border-radius: 9px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }

  .reader-dashboard-main-wrap {
    min-width: 0;
  }

  .reader-dashboard-mobile-topbar {
    display: none;
  }

  .reader-dashboard-main {
    width: min(1180px, calc(100% - 48px));
    margin: 0 auto;
    padding: 42px 0 52px;
    display: grid;
    gap: 22px;
  }

  .reader-dashboard-hero {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
  }

  .reader-dashboard-hero h1 {
    margin: 5px 0 7px;
    font-size: 30px;
    line-height: 1.15;
    letter-spacing: -0.04em;
  }

  .reader-dashboard-hero p {
    max-width: 700px;
    margin: 0;
    color: #666c71;
    font-size: 13px;
    line-height: 1.65;
  }

  .reader-dashboard-primary-button,
  .reader-dashboard-secondary-button {
    min-height: 40px;
    padding: 0 15px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    font-size: 12px;
    font-weight: 750;
    white-space: nowrap;
  }

  .reader-dashboard-primary-button {
    background: #1c1f24;
    border: 1px solid #1c1f24;
    color: #ffffff;
  }

  .reader-dashboard-secondary-button {
    background: #ffffff;
    border: 1px solid #d9dde0;
    color: #2d3135;
  }

  .reader-dashboard-secondary-button.full {
    width: 100%;
    margin-top: 15px;
  }

  .reader-dashboard-alert {
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 12px;
    line-height: 1.5;
  }

  .reader-dashboard-alert.error {
    border: 1px solid #efc8c8;
    background: #fff7f7;
    color: #8b2f2f;
  }

  .reader-dashboard-metrics,
  .reader-dashboard-advertiser-metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .reader-dashboard-metric {
    min-width: 0;
    min-height: 112px;
    border: 1px solid #dfe3e6;
    border-radius: 11px;
    background: #ffffff;
    padding: 15px 16px;
    color: inherit;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  a.reader-dashboard-metric:hover {
    border-color: #bec4c8;
  }

  .reader-dashboard-metric-label {
    color: #6e7378;
    font-size: 11px;
    font-weight: 700;
  }

  .reader-dashboard-metric strong {
    margin-top: 6px;
    font-size: 25px;
    line-height: 1.1;
    letter-spacing: -0.03em;
    overflow-wrap: anywhere;
  }

  .reader-dashboard-metric-helper {
    margin-top: 6px;
    color: #858b90;
    font-size: 11px;
    line-height: 1.4;
  }

  .reader-dashboard-two-column {
    display: grid;
    grid-template-columns: minmax(0, 1.65fr) minmax(280px, 0.85fr);
    gap: 14px;
  }

  .reader-dashboard-panel,
  .reader-dashboard-section-block,
  .reader-dashboard-advertiser {
    border: 1px solid #dfe3e6;
    border-radius: 12px;
    background: #ffffff;
    padding: 20px;
  }

  .reader-dashboard-panel-heading,
  .reader-dashboard-section-title,
  .reader-dashboard-advertiser-head,
  .reader-dashboard-subpanel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .reader-dashboard-panel-heading h2,
  .reader-dashboard-section-title h2,
  .reader-dashboard-advertiser-head h2 {
    margin: 5px 0 0;
    font-size: 18px;
    line-height: 1.25;
    letter-spacing: -0.025em;
  }

  .reader-dashboard-panel-heading p,
  .reader-dashboard-advertiser-head p {
    margin: 7px 0 0;
    color: #71777c;
    font-size: 12px;
    line-height: 1.55;
  }

  .reader-dashboard-pill {
    display: inline-flex;
    min-height: 24px;
    align-items: center;
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 750;
    white-space: nowrap;
    border: 1px solid #e0e3e5;
    background: #f6f7f8;
    color: #5b6065;
  }

  .reader-dashboard-pill.good {
    border-color: #cfe2d6;
    background: #f2f8f4;
    color: #326144;
  }

  .reader-dashboard-pill.warn {
    border-color: #eadbb9;
    background: #fbf8f0;
    color: #755d22;
  }

  .reader-dashboard-pill.bad {
    border-color: #ebcccc;
    background: #fbf3f3;
    color: #884040;
  }

  .reader-dashboard-connection-grid {
    margin-top: 16px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .reader-dashboard-connection-card {
    border: 1px solid #e3e6e8;
    border-radius: 10px;
    padding: 14px;
    min-width: 0;
  }

  .reader-dashboard-connection-card strong,
  .reader-dashboard-connection-card p,
  .reader-dashboard-connection-card a {
    display: block;
  }

  .reader-dashboard-connection-card strong {
    margin-top: 9px;
    font-size: 14px;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .reader-dashboard-connection-card p {
    margin: 5px 0 12px;
    color: #747a7f;
    font-size: 12px;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  .reader-dashboard-connection-card a,
  .reader-dashboard-section-title > a,
  .reader-dashboard-subpanel-head > a {
    color: #2f3337;
    font-size: 12px;
    font-weight: 750;
    text-decoration: none;
  }

  .reader-dashboard-info-list {
    margin-top: 13px;
    border-top: 1px solid #eceeef;
  }

  .reader-dashboard-info-row {
    min-height: 43px;
    padding: 9px 0;
    border-bottom: 1px solid #eceeef;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .reader-dashboard-info-row > span:first-child {
    color: #777d82;
    font-size: 12px;
  }

  .reader-dashboard-info-row strong {
    max-width: 65%;
    font-size: 12px;
    line-height: 1.4;
    text-align: right;
    overflow-wrap: anywhere;
  }

  .reader-dashboard-section-title {
    align-items: flex-end;
  }

  .reader-dashboard-quick-grid {
    margin-top: 15px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .reader-dashboard-quick-link {
    min-height: 138px;
    border: 1px solid #e1e4e6;
    border-radius: 10px;
    padding: 14px;
    color: inherit;
    text-decoration: none;
    display: flex;
    flex-direction: column;
  }

  .reader-dashboard-quick-link > span {
    color: #81878c;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
  }

  .reader-dashboard-quick-link strong {
    margin-top: 7px;
    font-size: 14px;
  }

  .reader-dashboard-quick-link p {
    margin: 6px 0 12px;
    color: #747a7f;
    font-size: 11px;
    line-height: 1.45;
  }

  .reader-dashboard-quick-link b {
    margin-top: auto;
    font-size: 11px;
  }

  .reader-dashboard-advertiser {
    background: #fbfbfc;
  }

  .reader-dashboard-advertiser-head {
    align-items: flex-end;
  }

  .reader-dashboard-advertiser-head > div:first-child {
    max-width: 650px;
  }

  .reader-dashboard-advertiser-actions {
    display: flex;
    gap: 8px;
  }

  .reader-dashboard-advertiser-metrics {
    margin-top: 18px;
  }

  .reader-dashboard-advertiser-metrics .reader-dashboard-metric {
    min-height: 101px;
  }

  .reader-dashboard-advertiser-metrics .reader-dashboard-metric strong {
    font-size: 20px;
  }

  .reader-dashboard-advertiser-grid {
    margin-top: 12px;
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.85fr);
    gap: 12px;
  }

  .reader-dashboard-subpanel {
    min-width: 0;
    border: 1px solid #dfe3e6;
    border-radius: 11px;
    background: #ffffff;
    padding: 16px;
  }

  .reader-dashboard-subpanel-head {
    align-items: flex-end;
  }

  .reader-dashboard-subpanel-head h3 {
    margin: 5px 0 0;
    font-size: 15px;
    letter-spacing: -0.015em;
  }

  .reader-dashboard-campaign-list {
    margin-top: 12px;
    border-top: 1px solid #eceeef;
  }

  .reader-dashboard-campaign-row {
    min-height: 64px;
    padding: 10px 0;
    border-bottom: 1px solid #eceeef;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .reader-dashboard-campaign-copy {
    min-width: 0;
  }

  .reader-dashboard-campaign-copy strong,
  .reader-dashboard-campaign-copy span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .reader-dashboard-campaign-copy strong {
    font-size: 12px;
  }

  .reader-dashboard-campaign-copy span {
    margin-top: 4px;
    color: #7c8287;
    font-size: 11px;
  }

  .reader-dashboard-campaign-meta {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .reader-dashboard-campaign-meta > span:last-child {
    color: #50555a;
    font-size: 11px;
    font-weight: 700;
  }

  .reader-dashboard-empty {
    min-height: 110px;
    margin-top: 12px;
    border: 1px dashed #d9dde0;
    border-radius: 9px;
    display: grid;
    place-content: center;
    gap: 5px;
    padding: 16px;
    text-align: center;
    color: #73797e;
    font-size: 12px;
  }

  .reader-dashboard-empty strong {
    color: #34383c;
  }

  .reader-dashboard-info-list.compact-list {
    margin-top: 12px;
  }

  .reader-dashboard-footnote {
    padding: 0 2px;
    color: #7b8186;
    font-size: 11px;
    line-height: 1.55;
  }

  .reader-dashboard-mobile-overlay {
    display: none;
  }

  @media (max-width: 1180px) {
    .reader-dashboard-metrics,
    .reader-dashboard-advertiser-metrics,
    .reader-dashboard-quick-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .reader-dashboard-two-column,
    .reader-dashboard-advertiser-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 820px) {
    .reader-dashboard-layout {
      display: block;
    }

    .reader-dashboard-sidebar {
      display: none;
    }

    .reader-dashboard-mobile-topbar {
      height: 58px;
      padding: 0 12px;
      border-bottom: 1px solid #dfe3e6;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 20;
    }

    .reader-dashboard-brand.compact {
      gap: 8px;
    }

    .reader-dashboard-brand.compact .reader-dashboard-brand-mark {
      width: 27px;
      height: 27px;
    }

    .reader-dashboard-brand.compact > div {
      display: grid;
    }

    .reader-dashboard-brand.compact strong {
      font-size: 14px;
      line-height: 1.1;
    }

    .reader-dashboard-brand.compact > div > span {
      color: #747a7f;
      font-size: 10px;
      font-weight: 600;
      margin-top: 2px;
    }

    .reader-dashboard-mobile-topbar > button {
      min-height: 34px;
      padding: 0 12px;
      border-radius: 8px;
      border: 1px solid #d8dcdf;
      background: #ffffff;
      color: #2f3337;
      font-size: 12px;
      font-weight: 750;
    }

    .reader-dashboard-main {
      width: 100%;
      margin: 0;
      padding: 22px 8px 30px;
      gap: 14px;
    }

    .reader-dashboard-hero {
      padding: 0 2px;
      align-items: flex-start;
    }

    .reader-dashboard-hero h1 {
      margin-top: 4px;
      font-size: 24px;
    }

    .reader-dashboard-hero p {
      font-size: 12px;
      line-height: 1.55;
    }

    .reader-dashboard-hero .reader-dashboard-primary-button {
      min-height: 36px;
      padding: 0 11px;
      font-size: 11px;
    }

    .reader-dashboard-panel,
    .reader-dashboard-section-block,
    .reader-dashboard-advertiser {
      padding: 15px;
      border-radius: 10px;
    }

    .reader-dashboard-panel-heading h2,
    .reader-dashboard-section-title h2,
    .reader-dashboard-advertiser-head h2 {
      font-size: 17px;
    }

    .reader-dashboard-connection-grid {
      grid-template-columns: 1fr;
    }

    .reader-dashboard-advertiser-head {
      align-items: stretch;
      flex-direction: column;
    }

    .reader-dashboard-advertiser-actions {
      width: 100%;
    }

    .reader-dashboard-advertiser-actions a {
      flex: 1 1 0;
    }

    .reader-dashboard-mobile-overlay {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 100;
      background: rgba(28, 31, 36, 0.32);
    }

    .reader-dashboard-mobile-drawer {
      position: absolute;
      top: 0;
      right: 0;
      width: min(330px, 88vw);
      height: 100%;
      overflow-y: auto;
      background: #ffffff;
      border-left: 1px solid #dfe3e6;
      padding: 18px 14px;
      display: flex;
      flex-direction: column;
    }

    .reader-dashboard-mobile-drawer-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .reader-dashboard-mobile-drawer-head > div {
      display: grid;
      gap: 3px;
    }

    .reader-dashboard-mobile-drawer-head span {
      color: #777d82;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.09em;
    }

    .reader-dashboard-mobile-drawer-head strong {
      font-size: 15px;
    }

    .reader-dashboard-mobile-drawer-head button {
      min-height: 32px;
      padding: 0 10px;
      border: 1px solid #dfe3e6;
      border-radius: 8px;
      background: #ffffff;
      font-size: 11px;
      font-weight: 700;
    }

    .reader-dashboard-mobile-drawer .reader-dashboard-logout {
      margin-top: 22px;
    }
  }

  @media (max-width: 560px) {
    .reader-dashboard-metrics,
    .reader-dashboard-advertiser-metrics {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .reader-dashboard-metric {
      min-height: 100px;
      padding: 12px;
    }

    .reader-dashboard-metric strong {
      font-size: 21px;
    }

    .reader-dashboard-metric-helper {
      font-size: 10.5px;
    }

    .reader-dashboard-quick-grid {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .reader-dashboard-quick-link {
      min-height: auto;
      padding: 13px;
    }

    .reader-dashboard-quick-link p {
      margin-bottom: 9px;
      font-size: 12px;
    }

    .reader-dashboard-section-title {
      align-items: flex-start;
      flex-direction: column;
    }

    .reader-dashboard-campaign-row {
      align-items: flex-start;
      flex-direction: column;
      gap: 8px;
    }

    .reader-dashboard-campaign-meta {
      width: 100%;
      justify-content: space-between;
    }

    .reader-dashboard-info-row {
      align-items: flex-start;
    }

    .reader-dashboard-info-row strong {
      max-width: 62%;
    }
  }

  @media (max-width: 390px) {
    .reader-dashboard-advertiser-actions {
      flex-direction: column;
    }

    .reader-dashboard-advertiser-actions a {
      width: 100%;
    }
  }

  /* Shared Reader shell standard - aligned with the approved For You / Saved Posts layout. */
  .reader-dashboard-screen {
    overflow-x: hidden;
    background: #f7f8fa;
    color: #111827;
  }

  .reader-dashboard-layout {
    grid-template-columns: 236px minmax(0, 1fr);
  }

  .reader-dashboard-sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 20;
    width: 236px;
    height: 100vh;
    min-height: 100vh;
    overflow-y: auto;
    padding: 24px 18px 18px;
    border-right: 1px solid #e3e7ed;
    background: #ffffff;
  }

  .reader-dashboard-brand {
    gap: 10px;
    min-width: 0;
    font-size: inherit;
    font-weight: inherit;
    letter-spacing: normal;
  }

  .reader-dashboard-brand-mark {
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    border-radius: 10px;
    background: #111827;
    color: #ffffff;
    font-size: 14px;
    font-weight: 800;
  }

  .reader-dashboard-brand-copy {
    min-width: 0;
    display: grid;
    gap: 2px;
  }

  .reader-dashboard-brand-copy strong {
    color: #111827;
    font-size: 14px;
    line-height: 1.2;
  }

  .reader-dashboard-brand-copy small {
    color: #6b7280;
    font-size: 10px;
    line-height: 1.2;
  }

  .reader-dashboard-nav {
    margin-top: 28px;
    display: grid;
    gap: 24px;
  }

  .reader-dashboard-nav-group {
    display: grid;
    gap: 7px;
  }

  .reader-dashboard-nav-label {
    padding: 0 1px;
    color: #8a96a8;
    font-size: 10px;
    line-height: 1.2;
    font-weight: 800;
    letter-spacing: 0.035em;
    text-transform: uppercase;
  }

  .reader-dashboard-nav-list {
    display: grid;
    gap: 4px;
  }

  .reader-dashboard-nav-link {
    min-height: 42px;
    padding: 0 14px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    color: #1f2937;
    font-size: 13px;
    line-height: 1.25;
    font-weight: 550;
    text-decoration: none;
  }

  .reader-dashboard-nav-link:hover {
    background: #f3f5f7;
    color: #1f2937;
  }

  .reader-dashboard-nav-link.active {
    background: #111827;
    color: #ffffff;
    font-weight: 700;
  }

  .reader-dashboard-nav-icon {
    width: 18px;
    height: 18px;
    flex: 0 0 18px;
    display: grid;
    place-items: center;
    color: #738095;
  }

  .reader-dashboard-nav-link.active .reader-dashboard-nav-icon {
    color: #ffffff;
  }

  .reader-dashboard-reader-card {
    margin-top: auto;
    min-height: 54px;
    padding: 9px 10px;
    border: 0;
    border-radius: 12px;
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr) 28px;
    align-items: center;
    gap: 9px;
    background: #f3f4f6;
  }

  .reader-dashboard-avatar {
    width: 32px;
    height: 32px;
    border-radius: 999px;
    background: #111827;
    color: #ffffff;
    font-size: 11px;
    font-weight: 800;
  }

  .reader-dashboard-reader-copy {
    min-width: 0;
    display: grid;
    gap: 2px;
  }

  .reader-dashboard-reader-copy strong,
  .reader-dashboard-reader-copy small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .reader-dashboard-reader-copy strong {
    color: #111827;
    font-size: 11px;
  }

  .reader-dashboard-reader-copy small {
    color: #788396;
    font-size: 9px;
  }

  .reader-dashboard-logout {
    width: 28px;
    height: 28px;
    min-height: 28px;
    margin-top: 0;
    padding: 0;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: #6b7280;
  }

  .reader-dashboard-logout:hover {
    background: #ffffff;
    color: #b42318;
  }

  .reader-dashboard-main-wrap {
    grid-column: 2;
    min-width: 0;
  }

  .reader-dashboard-desktop-topbar {
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 0 32px;
    border-bottom: 1px solid #e3e7ed;
    background: rgba(255, 255, 255, 0.96);
  }

  .reader-dashboard-desktop-topbar h1 {
    margin: 0;
    font-size: 18px;
    line-height: 1.2;
    font-weight: 750;
    letter-spacing: -0.02em;
  }

  .reader-dashboard-desktop-topbar span {
    color: #667085;
    font-size: 12px;
  }

  .reader-dashboard-mobile-topbar {
    display: none;
  }

  .reader-dashboard-main {
    width: 100%;
    max-width: 1220px;
    margin: 0 auto;
    padding: 52px 32px 52px;
  }

  .reader-dashboard-mobile-overlay,
  .reader-dashboard-mobile-drawer {
    display: none;
  }

  @media (max-width: 991px) {
    .reader-dashboard-layout {
      display: block;
      min-height: 100vh;
    }

    .reader-dashboard-sidebar,
    .reader-dashboard-desktop-topbar {
      display: none;
    }

    .reader-dashboard-mobile-topbar {
      position: sticky;
      top: 0;
      z-index: 35;
      height: 56px;
      padding: 0 12px;
      border-bottom: 1px solid #e3e7ed;
      background: rgba(255, 255, 255, 0.98);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .reader-dashboard-mobile-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .reader-dashboard-mobile-brand .reader-dashboard-brand-mark {
      width: 28px;
      height: 28px;
      flex-basis: 28px;
      border-radius: 8px;
      font-size: 11px;
    }

    .reader-dashboard-mobile-brand strong {
      color: #111827;
      font-size: 12px;
    }

    .reader-dashboard-mobile-menu-button {
      min-width: 48px;
      height: 34px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border: 1px solid #dfe4eb;
      border-radius: 8px;
      background: #ffffff;
      color: #111827;
      font-size: 11px;
      font-weight: 700;
    }

    .reader-dashboard-main {
      width: calc(100% - 16px);
      max-width: none;
      margin: 0 8px;
      padding: 22px 0 30px;
    }

    .reader-dashboard-mobile-overlay {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: block;
      border: 0;
      background: rgba(15, 23, 42, 0.34);
    }

    .reader-dashboard-mobile-drawer {
      position: fixed;
      inset: 0 auto 0 0;
      z-index: 55;
      width: min(320px, calc(100% - 40px));
      height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 16px;
      overflow-y: auto;
      border-right: 1px solid #e3e7ed;
      background: #ffffff;
      box-shadow: 18px 0 42px rgba(15, 23, 42, 0.12);
    }

    .reader-dashboard-mobile-drawer-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .reader-dashboard-mobile-close {
      width: 36px;
      height: 36px;
      display: grid;
      place-items: center;
      border: 1px solid #e3e7ed;
      border-radius: 9px;
      background: #ffffff;
      color: #111827;
    }

    .reader-dashboard-mobile-drawer .reader-dashboard-nav {
      margin-top: 22px;
    }

    .reader-dashboard-mobile-drawer .reader-dashboard-reader-card {
      margin-top: 24px;
    }
  }

`;export{ce as default};
