import{r as n,j as i,a as F}from"./index-LXBBJt7I.js";function S(t){if(!t)return"-";const o=new Date(t);return Number.isNaN(o.getTime())?t:o.toLocaleString(void 0,{year:"numeric",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}function h(t){const o=String(t||"").trim();return o?o.replace(/[_-]+/g," ").replace(/\b\w/g,l=>l.toUpperCase()):"Unknown"}function C(t){var l,p;const o=((l=t==null?void 0:t.customer)==null?void 0:l.name)||(t==null?void 0:t.email)||((p=t==null?void 0:t.customer)==null?void 0:p.email)||"L";return String(o).trim().charAt(0).toUpperCase()||"L"}function M(){const[t,o]=n.useState([]),[l,p]=n.useState(""),[d,g]=n.useState(""),[m,L]=n.useState("all"),[w,f]=n.useState(!0),[u,b]=n.useState(""),x=n.useMemo(()=>{const e=t.length,s=t.filter(a=>!!(a!=null&&a.customer_user_id)).length,r=new Set(t.map(a=>a==null?void 0:a.website_id).filter(Boolean)).size;return{totalLeads:e,totalCustomers:s,totalWebsites:r}},[t]),_=n.useMemo(()=>{const e=new Set;return t.forEach(s=>{const r=String((s==null?void 0:s.source_type)||"").trim();r&&e.add(r)}),Array.from(e).sort((s,r)=>s.localeCompare(r))},[t]),c=n.useMemo(()=>{const e=l.trim().toLowerCase();return(t||[]).filter(s=>{var y,v,N,z,k;const r=!e||String((s==null?void 0:s.email)||"").toLowerCase().includes(e)||String(((y=s==null?void 0:s.website)==null?void 0:y.website_name)||"").toLowerCase().includes(e)||String(((v=s==null?void 0:s.website)==null?void 0:v.slug)||"").toLowerCase().includes(e)||String(((N=s==null?void 0:s.customer)==null?void 0:N.name)||"").toLowerCase().includes(e)||String(((z=s==null?void 0:s.customer)==null?void 0:z.email)||"").toLowerCase().includes(e)||String(((k=s==null?void 0:s.template)==null?void 0:k.name)||"").toLowerCase().includes(e)||String((s==null?void 0:s.source_type)||"").toLowerCase().includes(e),a=m==="all"||String((s==null?void 0:s.source_type)||"")===m;return r&&a})},[t,l,m]);async function j(){var e,s;try{f(!0),b("");const{data:r}=await F.get("/api/email-list/leads");o(Array.isArray(r==null?void 0:r.leads)?r.leads:[])}catch(r){b(((s=(e=r==null?void 0:r.response)==null?void 0:e.data)==null?void 0:s.message)||"Failed to load email lists")}finally{f(!1)}}n.useEffect(()=>{j()},[]);function E(e){e.preventDefault(),p(d.trim())}function A(){g(""),p("")}return i.jsxs("div",{className:"writer-email-lists-screen",children:[i.jsx("style",{children:T}),i.jsxs("main",{className:"writer-email-lists-main",children:[i.jsxs("section",{className:"writer-email-lists-stats","aria-label":"Email audience summary",children:[i.jsxs("article",{className:"writer-email-lists-stat-card",children:[i.jsx("span",{className:"writer-email-lists-stat-icon",children:"E"}),i.jsxs("div",{children:[i.jsx("span",{children:"My email leads"}),i.jsx("strong",{children:x.totalLeads}),i.jsx("small",{children:"Captured contacts"})]})]}),i.jsxs("article",{className:"writer-email-lists-stat-card",children:[i.jsx("span",{className:"writer-email-lists-stat-icon",children:"C"}),i.jsxs("div",{children:[i.jsx("span",{children:"Linked to customers"}),i.jsx("strong",{children:x.totalCustomers}),i.jsx("small",{children:"Known customer accounts"})]})]}),i.jsxs("article",{className:"writer-email-lists-stat-card",children:[i.jsx("span",{className:"writer-email-lists-stat-icon",children:"W"}),i.jsxs("div",{children:[i.jsx("span",{children:"Websites with leads"}),i.jsx("strong",{children:x.totalWebsites}),i.jsx("small",{children:"Active capture sources"})]})]})]}),u?i.jsxs("div",{className:"writer-email-lists-alert",role:"alert",children:[i.jsxs("div",{children:[i.jsx("strong",{children:"Unable to load email leads"}),i.jsx("span",{children:u})]}),i.jsx("button",{type:"button",onClick:j,children:"Try again"})]}):null,i.jsxs("section",{className:"writer-email-lists-card",children:[i.jsxs("header",{className:"writer-email-lists-card-head",children:[i.jsxs("div",{children:[i.jsx("h3",{children:"Email leads"}),i.jsx("p",{children:"Every captured lead, with its website, customer, source, and template."})]}),i.jsxs("div",{className:"writer-email-lists-card-actions",children:[i.jsxs("div",{className:"writer-email-lists-readonly",children:[i.jsx("span",{className:"writer-email-lists-readonly-dot"}),"Read only"]}),i.jsxs("span",{className:"writer-email-lists-count",children:[c.length," ",c.length===1?"lead":"leads"]})]})]}),i.jsxs("div",{className:"writer-email-lists-tools",children:[i.jsxs("form",{className:"writer-email-lists-search",onSubmit:E,children:[i.jsx("span",{className:"writer-email-lists-search-icon","aria-hidden":"true"}),i.jsx("input",{type:"search",value:d,onChange:e=>g(e.target.value),placeholder:"Search email, website, customer, source","aria-label":"Search email leads"}),d||l?i.jsx("button",{type:"button",className:"writer-email-lists-clear",onClick:A,"aria-label":"Clear search",children:"X"}):null,i.jsx("button",{type:"submit",className:"writer-email-lists-search-button",children:"Search"})]}),i.jsxs("select",{className:"writer-email-lists-filter",value:m,onChange:e=>L(e.target.value),"aria-label":"Filter leads by source",children:[i.jsx("option",{value:"all",children:"All sources"}),_.map(e=>i.jsx("option",{value:e,children:h(e)},e))]})]}),i.jsxs("div",{className:"writer-email-lists-desktop-table",children:[i.jsxs("div",{className:"writer-email-lists-table-head","aria-hidden":"true",children:[i.jsx("span",{children:"Email"}),i.jsx("span",{children:"Website"}),i.jsx("span",{children:"Customer"}),i.jsx("span",{children:"Source"}),i.jsx("span",{children:"Template"}),i.jsx("span",{children:"Captured"})]}),w?i.jsxs("div",{className:"writer-email-lists-state",children:[i.jsx("span",{className:"writer-email-lists-spinner"}),i.jsx("strong",{children:"Loading email leads..."})]}):c.length===0?i.jsxs("div",{className:"writer-email-lists-state",children:[i.jsx("strong",{children:"No email leads found"}),i.jsx("p",{children:l||m!=="all"?"Try changing your search or source filter.":"Captured email leads will appear here."})]}):i.jsx("div",{className:"writer-email-lists-table-body",children:c.map(e=>{var s,r,a;return i.jsxs("article",{className:"writer-email-lists-row",children:[i.jsxs("div",{className:"writer-email-lists-email-cell",children:[i.jsx("span",{className:"writer-email-lists-avatar",children:C(e)}),i.jsxs("div",{children:[i.jsx("strong",{children:(e==null?void 0:e.email)||"-"}),i.jsxs("small",{children:["Lead #",e.id]})]})]}),i.jsxs("div",{className:"writer-email-lists-two-line",children:[i.jsx("strong",{children:((s=e==null?void 0:e.website)==null?void 0:s.website_name)||"-"}),i.jsx("span",{children:((r=e==null?void 0:e.website)==null?void 0:r.slug)||"-"})]}),i.jsx("div",{className:"writer-email-lists-two-line",children:e!=null&&e.customer?i.jsxs(i.Fragment,{children:[i.jsx("strong",{children:e.customer.name||"-"}),i.jsx("span",{children:e.customer.email||"-"})]}):i.jsxs(i.Fragment,{children:[i.jsx("strong",{children:"Guest lead"}),i.jsx("span",{children:"No linked account"})]})}),i.jsx("div",{children:i.jsx("span",{className:"writer-email-lists-source-badge",children:h(e==null?void 0:e.source_type)})}),i.jsx("div",{className:"writer-email-lists-template",children:((a=e==null?void 0:e.template)==null?void 0:a.name)||"-"}),i.jsx("div",{className:"writer-email-lists-date",children:S(e==null?void 0:e.captured_at)})]},e.id)})})]}),i.jsx("div",{className:"writer-email-lists-mobile-list",children:w?i.jsxs("div",{className:"writer-email-lists-state mobile",children:[i.jsx("span",{className:"writer-email-lists-spinner"}),i.jsx("strong",{children:"Loading email leads..."})]}):c.length===0?i.jsxs("div",{className:"writer-email-lists-state mobile",children:[i.jsx("strong",{children:"No email leads found"}),i.jsx("p",{children:l||m!=="all"?"Try changing your search or source filter.":"Captured email leads will appear here."})]}):c.map(e=>{var s,r,a;return i.jsxs("article",{className:"writer-email-lists-mobile-card",children:[i.jsxs("div",{className:"writer-email-lists-mobile-card-top",children:[i.jsxs("div",{className:"writer-email-lists-email-cell",children:[i.jsx("span",{className:"writer-email-lists-avatar",children:C(e)}),i.jsxs("div",{children:[i.jsx("strong",{children:(e==null?void 0:e.email)||"-"}),i.jsx("small",{children:S(e==null?void 0:e.captured_at)})]})]}),i.jsx("span",{className:"writer-email-lists-source-badge",children:h(e==null?void 0:e.source_type)})]}),i.jsxs("dl",{className:"writer-email-lists-mobile-details",children:[i.jsxs("div",{children:[i.jsx("dt",{children:"Website"}),i.jsxs("dd",{children:[i.jsx("strong",{children:((s=e==null?void 0:e.website)==null?void 0:s.website_name)||"-"}),i.jsx("span",{children:((r=e==null?void 0:e.website)==null?void 0:r.slug)||"-"})]})]}),i.jsxs("div",{children:[i.jsx("dt",{children:"Customer"}),i.jsx("dd",{children:e!=null&&e.customer?i.jsxs(i.Fragment,{children:[i.jsx("strong",{children:e.customer.name||"-"}),i.jsx("span",{children:e.customer.email||"-"})]}):i.jsxs(i.Fragment,{children:[i.jsx("strong",{children:"Guest lead"}),i.jsx("span",{children:"No linked account"})]})})]}),i.jsxs("div",{children:[i.jsx("dt",{children:"Template"}),i.jsx("dd",{children:i.jsx("strong",{children:((a=e==null?void 0:e.template)==null?void 0:a.name)||"-"})})]})]})]},e.id)})})]}),i.jsx("section",{className:"writer-email-lists-note",children:i.jsxs("div",{children:[i.jsx("strong",{children:"About this list"}),i.jsx("span",{children:"This view is read only. Leads appear automatically when they are captured through your storefront email forms."})]})})]})]})}const T=`
  .writer-email-lists-screen {
    min-height: 100%;
    background: #f5f6f8;
    color: #20242a;
    font-family: Inter, Arial, sans-serif;
  }

  .writer-email-lists-screen *,
  .writer-email-lists-screen *::before,
  .writer-email-lists-screen *::after {
    box-sizing: border-box;
  }

  .writer-email-lists-main {
    width: 100%;
    max-width: none;
    margin: 0;
    padding: 24px 28px 48px;
  }

  .writer-email-lists-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 22px;
  }

  .writer-email-lists-heading h2 {
    margin: 0;
    font-size: 30px;
    line-height: 1.15;
    letter-spacing: -0.7px;
    font-weight: 760;
  }

  .writer-email-lists-heading p {
    max-width: 630px;
    margin: 7px 0 0;
    color: #737c8c;
    font-size: 14px;
    line-height: 1.5;
  }

  .writer-email-lists-readonly {
    min-height: 34px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 0 13px;
    border: 1px solid #dbe0e7;
    border-radius: 999px;
    background: #fff;
    color: #636d7d;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }

  .writer-email-lists-readonly-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #7b8492;
  }

  .writer-email-lists-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 20px;
  }

  .writer-email-lists-stat-card {
    min-height: 124px;
    border: 1px solid #dce1e8;
    border-radius: 13px;
    background: #fff;
    padding: 17px;
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .writer-email-lists-stat-icon {
    width: 38px;
    height: 38px;
    flex: 0 0 38px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: #f0f2f5;
    color: #394150;
    font-size: 12px;
    font-weight: 800;
  }

  .writer-email-lists-stat-card > div {
    min-width: 0;
    display: grid;
    gap: 3px;
  }

  .writer-email-lists-stat-card > div > span {
    color: #737c8c;
    font-size: 12px;
    font-weight: 650;
  }

  .writer-email-lists-stat-card strong {
    margin-top: 2px;
    color: #20242a;
    font-size: 29px;
    line-height: 1;
    font-weight: 780;
  }

  .writer-email-lists-stat-card small {
    margin-top: 4px;
    color: #9aa3b2;
    font-size: 10px;
  }

  .writer-email-lists-alert {
    min-height: 58px;
    margin-bottom: 16px;
    padding: 11px 13px;
    border: 1px solid #efcaca;
    border-radius: 11px;
    background: #fff5f5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .writer-email-lists-alert > div {
    display: grid;
    gap: 3px;
  }

  .writer-email-lists-alert strong {
    color: #9e2424;
    font-size: 12px;
  }

  .writer-email-lists-alert span {
    color: #a94a4a;
    font-size: 11px;
  }

  .writer-email-lists-alert button {
    min-height: 34px;
    border: 1px solid #e1b9b9;
    border-radius: 8px;
    background: #fff;
    color: #9e2424;
    padding: 0 12px;
    font: inherit;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
  }

  .writer-email-lists-card {
    border: 1px solid #dce1e8;
    border-radius: 13px;
    background: #fff;
    overflow: hidden;
  }

  .writer-email-lists-card-head {
    min-height: 82px;
    padding: 17px 18px;
    border-bottom: 1px solid #e4e8ee;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .writer-email-lists-card-head h3 {
    margin: 0;
    font-size: 17px;
    font-weight: 750;
  }

  .writer-email-lists-card-head p {
    margin: 5px 0 0;
    color: #7a8392;
    font-size: 12px;
  }

  .writer-email-lists-card-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;
  }

  .writer-email-lists-count {
    min-height: 28px;
    display: inline-flex;
    align-items: center;
    padding: 0 11px;
    border-radius: 999px;
    background: #f2f4f7;
    color: #657080;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
  }

  .writer-email-lists-tools {
    min-height: 68px;
    padding: 12px 16px;
    border-bottom: 1px solid #e9ecf1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 180px;
    gap: 12px;
    align-items: center;
  }

  .writer-email-lists-search {
    width: 100%;
    height: 42px;
    max-width: none;
    border: 1px solid #d6dce4;
    border-radius: 9px;
    background: #fff;
    display: flex;
    align-items: center;
    padding-left: 12px;
  }

  .writer-email-lists-search:focus-within,
  .writer-email-lists-filter:focus {
    border-color: #929cab;
    box-shadow: 0 0 0 3px rgba(31, 35, 41, 0.05);
  }

  .writer-email-lists-search-icon {
    width: 12px;
    height: 12px;
    flex: 0 0 12px;
    border: 1.5px solid #7f8897;
    border-radius: 50%;
  }

  .writer-email-lists-search input {
    min-width: 0;
    flex: 1;
    height: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    padding: 0 10px;
    color: #20242a;
    font: inherit;
    font-size: 12px;
  }

  .writer-email-lists-search input::placeholder {
    color: #9da6b5;
  }

  .writer-email-lists-clear {
    width: 30px;
    height: 30px;
    flex: 0 0 30px;
    border: 0;
    border-radius: 7px;
    background: transparent;
    color: #8b94a3;
    font: inherit;
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;
  }

  .writer-email-lists-clear:hover {
    background: #f4f6f8;
  }

  .writer-email-lists-search-button {
    align-self: stretch;
    min-width: 78px;
    border: 0;
    border-radius: 0 8px 8px 0;
    background: #20242a;
    color: #fff;
    padding: 0 14px;
    font: inherit;
    font-size: 11px;
    font-weight: 750;
    cursor: pointer;
  }

  .writer-email-lists-search-button:hover {
    background: #111419;
  }

  .writer-email-lists-filter {
    width: 180px;
    height: 42px;
    border: 1px solid #d6dce4;
    border-radius: 9px;
    background: #fff;
    color: #353b45;
    padding: 0 11px;
    outline: none;
    font: inherit;
    font-size: 12px;
    font-weight: 650;
  }

  .writer-email-lists-table-head,
  .writer-email-lists-row {
    display: grid;
    grid-template-columns:
      minmax(0, 1.45fr)
      minmax(0, 1.05fr)
      minmax(0, 1.15fr)
      minmax(0, 0.72fr)
      minmax(0, 0.88fr)
      minmax(0, 0.9fr);
    column-gap: 18px;
    align-items: center;
  }

  .writer-email-lists-table-head > *,
  .writer-email-lists-row > * {
    min-width: 0;
  }

  .writer-email-lists-table-head {
    min-height: 48px;
    padding: 0 16px;
    background: #fafbfc;
    border-bottom: 1px solid #eaedf1;
  }

  .writer-email-lists-table-head span {
    color: #929baa;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.6px;
    text-transform: uppercase;
  }

  .writer-email-lists-table-body {
    padding: 0 16px;
  }

  .writer-email-lists-row {
    min-height: 86px;
    border-bottom: 1px solid #e5e9ee;
  }

  .writer-email-lists-row:last-child {
    border-bottom: 0;
  }

  .writer-email-lists-email-cell {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 11px;
  }

  .writer-email-lists-avatar {
    width: 36px;
    height: 36px;
    flex: 0 0 36px;
    border-radius: 50%;
    background: #20242a;
    color: #fff;
    display: grid;
    place-items: center;
    font-size: 11px;
    font-weight: 800;
  }

  .writer-email-lists-email-cell > div,
  .writer-email-lists-two-line {
    min-width: 0;
  }

  .writer-email-lists-email-cell strong,
  .writer-email-lists-two-line strong {
    display: block;
    overflow-wrap: anywhere;
    color: #252a31;
    font-size: 12px;
    line-height: 1.35;
    font-weight: 700;
  }

  .writer-email-lists-email-cell small,
  .writer-email-lists-two-line span {
    display: block;
    margin-top: 3px;
    overflow-wrap: anywhere;
    color: #8a93a2;
    font-size: 10px;
    line-height: 1.35;
  }

  .writer-email-lists-source-badge {
    min-height: 25px;
    display: inline-flex;
    align-items: center;
    padding: 0 10px;
    border-radius: 999px;
    background: #eaf2ff;
    color: #2763ad;
    font-size: 10px;
    font-weight: 750;
    white-space: nowrap;
  }

  .writer-email-lists-template,
  .writer-email-lists-date {
    min-width: 0;
    overflow-wrap: anywhere;
    color: #626c7b;
    font-size: 11px;
    line-height: 1.4;
  }

  .writer-email-lists-state {
    min-height: 230px;
    padding: 40px 20px;
    display: grid;
    place-items: center;
    align-content: center;
    text-align: center;
  }

  .writer-email-lists-state strong {
    color: #343a43;
    font-size: 13px;
  }

  .writer-email-lists-state p {
    margin: 6px 0 0;
    color: #838c9b;
    font-size: 11px;
  }

  .writer-email-lists-spinner {
    width: 18px;
    height: 18px;
    margin-bottom: 10px;
    border: 2px solid #dce1e8;
    border-top-color: #20242a;
    border-radius: 50%;
    animation: writer-email-lists-spin 0.8s linear infinite;
  }

  @keyframes writer-email-lists-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .writer-email-lists-mobile-list {
    display: none;
  }

  .writer-email-lists-note {
    margin-top: 18px;
    padding: 13px 15px;
    border: 1px solid #dce1e8;
    border-radius: 11px;
    background: #fff;
  }

  .writer-email-lists-note > div {
    display: grid;
    gap: 4px;
  }

  .writer-email-lists-note strong {
    font-size: 12px;
  }

  .writer-email-lists-note span {
    color: #737c8c;
    font-size: 11px;
    line-height: 1.45;
  }

  @media (max-width: 1180px) {
    .writer-email-lists-main {
      padding-left: 18px;
      padding-right: 18px;
    }

    .writer-email-lists-table-head,
    .writer-email-lists-row {
      grid-template-columns:
        minmax(0, 1.35fr)
        minmax(0, 1fr)
        minmax(0, 1.08fr)
        minmax(0, 0.7fr)
        minmax(0, 0.8fr)
        minmax(0, 0.9fr);
      column-gap: 12px;
    }
  }

  @media (max-width: 991px) {
    .writer-email-lists-main {
      width: 100%;
      max-width: none;
      padding: 18px 0 48px;
    }

    .writer-email-lists-heading {
      align-items: center;
      margin-bottom: 16px;
    }

    .writer-email-lists-heading h2 {
      font-size: 24px;
      letter-spacing: -0.4px;
    }

    .writer-email-lists-heading p {
      max-width: 245px;
      margin-top: 5px;
      font-size: 12px;
    }

    .writer-email-lists-readonly {
      min-height: 30px;
      padding: 0 10px;
      font-size: 10px;
    }

    .writer-email-lists-stats {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 7px;
      margin-bottom: 14px;
    }

    .writer-email-lists-stat-card {
      min-height: 82px;
      padding: 10px 9px;
      border-radius: 10px;
      display: grid;
      gap: 5px;
    }

    .writer-email-lists-stat-icon {
      width: 25px;
      height: 25px;
      flex-basis: 25px;
      border-radius: 7px;
      font-size: 9px;
    }

    .writer-email-lists-stat-card > div {
      gap: 1px;
    }

    .writer-email-lists-stat-card > div > span {
      font-size: 9px;
      line-height: 1.2;
    }

    .writer-email-lists-stat-card strong {
      margin-top: 2px;
      font-size: 20px;
    }

    .writer-email-lists-stat-card small {
      display: none;
    }

    .writer-email-lists-card {
      border-radius: 11px;
    }

    .writer-email-lists-card-head {
      min-height: 66px;
      padding: 13px 12px;
    }

    .writer-email-lists-card-head h3 {
      font-size: 15px;
    }

    .writer-email-lists-card-head p {
      margin-top: 4px;
      font-size: 10px;
      line-height: 1.4;
    }

    .writer-email-lists-count {
      min-height: 25px;
      padding: 0 9px;
      font-size: 9px;
    }

    .writer-email-lists-tools {
      min-height: 0;
      padding: 10px;
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .writer-email-lists-search {
      width: 100%;
      max-width: none;
      height: 40px;
    }

    .writer-email-lists-filter {
      width: 100%;
      height: 39px;
    }

    .writer-email-lists-desktop-table {
      display: none;
    }

    .writer-email-lists-mobile-list {
      display: grid;
      gap: 10px;
      padding: 10px;
      background: #f7f8fa;
    }

    .writer-email-lists-mobile-card {
      border: 1px solid #dce1e8;
      border-radius: 10px;
      background: #fff;
      padding: 12px;
    }

    .writer-email-lists-mobile-card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
      padding-bottom: 11px;
      border-bottom: 1px solid #e8ebef;
    }

    .writer-email-lists-mobile-card-top .writer-email-lists-email-cell {
      min-width: 0;
      flex: 1;
    }

    .writer-email-lists-mobile-card-top .writer-email-lists-email-cell strong {
      font-size: 12px;
    }

    .writer-email-lists-mobile-details {
      display: grid;
      gap: 10px;
      margin: 11px 0 0;
    }

    .writer-email-lists-mobile-details > div {
      display: grid;
      grid-template-columns: 72px minmax(0, 1fr);
      gap: 9px;
      align-items: start;
    }

    .writer-email-lists-mobile-details dt {
      color: #98a1af;
      font-size: 9px;
      font-weight: 750;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .writer-email-lists-mobile-details dd {
      min-width: 0;
      margin: 0;
    }

    .writer-email-lists-mobile-details strong {
      display: block;
      overflow-wrap: anywhere;
      color: #343a43;
      font-size: 10px;
      line-height: 1.35;
    }

    .writer-email-lists-mobile-details span {
      display: block;
      margin-top: 2px;
      overflow-wrap: anywhere;
      color: #858e9d;
      font-size: 9px;
      line-height: 1.35;
    }

    .writer-email-lists-state.mobile {
      min-height: 170px;
      border: 1px solid #dce1e8;
      border-radius: 10px;
      background: #fff;
    }

    .writer-email-lists-note {
      margin-top: 12px;
      padding: 11px 12px;
    }
  }

  @media (max-width: 480px) {
    .writer-email-lists-main {
      padding-left: 0;
      padding-right: 0;
    }

    .writer-email-lists-heading {
      gap: 10px;
    }

    .writer-email-lists-heading h2 {
      font-size: 22px;
    }

    .writer-email-lists-heading p {
      max-width: 220px;
    }

    .writer-email-lists-stats {
      gap: 5px;
    }

    .writer-email-lists-stat-card {
      padding: 9px 7px;
    }

    .writer-email-lists-readonly {
      padding: 0 8px;
    }
  }
`;export{M as default};
