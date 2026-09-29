import{b as C,r as s,j as e,a as W}from"./index-D7wY-Nn2.js";function p(o){if(!o)return"-";const d=new Date(o);return Number.isNaN(d.getTime())?o:d.toLocaleString()}function v(o){const d=String(o||"").trim().toLowerCase();return d==="active"?"active":d==="suspended"?"suspended":"neutral"}function M(){const d=C().pathname.startsWith("/writer/"),[g,z]=s.useState([]),[a,N]=s.useState({total_customers:0,active_customers:0,main_marketplace_signups:0}),[w,_]=s.useState(""),[c,b]=s.useState(""),[f,j]=s.useState(!0),[x,y]=s.useState(""),h=s.useMemo(()=>g||[],[g]);async function k(r=""){var i,u;try{j(!0),y("");const{data:t}=await W.get("/api/customer-management/affiliate/customers",{params:r?{search:r}:{}});z((t==null?void 0:t.customers)||[]),N((t==null?void 0:t.stats)||{total_customers:0,active_customers:0,main_marketplace_signups:0})}catch(t){y(((u=(i=t==null?void 0:t.response)==null?void 0:i.data)==null?void 0:u.message)||"Failed to load customers")}finally{j(!1)}}s.useEffect(()=>{k(w)},[w]);function m(r){r.preventDefault(),_(c.trim())}return d?e.jsxs("div",{className:"writer-readers-page",children:[e.jsx("style",{children:L}),e.jsx("div",{className:"writer-readers-mobile-title",children:"Readers"}),e.jsxs("section",{className:"writer-readers-stats",children:[e.jsxs("article",{className:"writer-readers-stat",children:[e.jsx("span",{children:"Total readers"}),e.jsx("strong",{children:a.total_customers||0})]}),e.jsxs("article",{className:"writer-readers-stat",children:[e.jsx("span",{children:"Active readers"}),e.jsx("strong",{children:a.active_customers||0})]}),e.jsxs("article",{className:"writer-readers-stat",children:[e.jsx("span",{children:"Marketplace signups"}),e.jsx("strong",{children:a.main_marketplace_signups||0})]})]}),e.jsx("section",{className:"writer-readers-search-card",children:e.jsxs("form",{className:"writer-readers-search-form",onSubmit:m,children:[e.jsx("strong",{children:"Search readers"}),e.jsxs("div",{className:"writer-readers-search-actions",children:[e.jsx("input",{type:"text",value:c,onChange:r=>b(r.target.value),placeholder:"Search name or email"}),e.jsx("button",{type:"submit",children:"Search"})]})]})}),x?e.jsx("div",{className:"writer-readers-alert",role:"alert",children:x}):null,e.jsxs("section",{className:"writer-readers-desktop-card",children:[e.jsxs("header",{className:"writer-readers-list-head",children:[e.jsx("strong",{children:"Readers"}),e.jsxs("span",{children:[a.total_customers||0," total"]})]}),e.jsx("div",{className:"writer-readers-table-wrap",children:e.jsxs("table",{className:"writer-readers-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Name"}),e.jsx("th",{children:"Email"}),e.jsx("th",{children:"Status"}),e.jsx("th",{children:"Source"}),e.jsx("th",{children:"Website"}),e.jsx("th",{children:"Last Login"}),e.jsx("th",{children:"Joined"})]})}),e.jsx("tbody",{children:f?e.jsx("tr",{children:e.jsx("td",{colSpan:7,className:"writer-readers-empty-cell",children:"Loading readers..."})}):h.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:7,className:"writer-readers-empty-cell",children:"No readers found."})}):h.map(r=>{var i;return e.jsxs("tr",{children:[e.jsx("td",{className:"writer-readers-name",children:(r==null?void 0:r.name)||"-"}),e.jsx("td",{className:"writer-readers-email",children:(r==null?void 0:r.email)||"-"}),e.jsx("td",{children:e.jsx("span",{className:`writer-readers-status ${v(r==null?void 0:r.status)}`,children:(r==null?void 0:r.status)||"-"})}),e.jsx("td",{children:(r==null?void 0:r.signup_source)||"-"}),e.jsx("td",{children:((i=r==null?void 0:r.registered_website)==null?void 0:i.website_name)||"-"}),e.jsx("td",{children:p(r==null?void 0:r.last_login_at)}),e.jsx("td",{children:p(r==null?void 0:r.created_at)})]},r.id)})})]})})]}),e.jsxs("section",{className:"writer-readers-mobile-list",children:[e.jsxs("header",{className:"writer-readers-mobile-list-head",children:[e.jsx("strong",{children:"Reader list"}),e.jsxs("span",{children:[a.total_customers||0," total"]})]}),f?e.jsx("div",{className:"writer-readers-mobile-state",children:"Loading readers..."}):h.length===0?e.jsx("div",{className:"writer-readers-mobile-state",children:"No readers found."}):e.jsx("div",{className:"writer-readers-card-list",children:h.map(r=>{var i;return e.jsxs("article",{className:"writer-reader-card",children:[e.jsxs("header",{children:[e.jsx("strong",{children:(r==null?void 0:r.name)||"-"}),e.jsx("span",{className:`writer-readers-status ${v(r==null?void 0:r.status)}`,children:(r==null?void 0:r.status)||"-"})]}),e.jsx("div",{className:"writer-reader-email",children:(r==null?void 0:r.email)||"-"}),e.jsxs("div",{className:"writer-reader-info-grid",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Source"}),e.jsx("strong",{children:(r==null?void 0:r.signup_source)||"-"})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Website"}),e.jsx("strong",{children:((i=r==null?void 0:r.registered_website)==null?void 0:i.website_name)||"-"})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Last Login"}),e.jsx("strong",{children:p(r==null?void 0:r.last_login_at)})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Joined"}),e.jsx("strong",{children:p(r==null?void 0:r.created_at)})]})]})]},r.id)})})]})]}):e.jsxs("div",{style:{display:"grid",gap:20},children:[e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",gap:16},children:[e.jsxs("div",{style:{background:"#fff",border:"1px solid #e5e7eb",borderRadius:18,padding:18},children:[e.jsx("div",{style:{fontSize:13,color:"#6b7280",marginBottom:8},children:"My Customers"}),e.jsx("div",{style:{fontSize:30,fontWeight:800,color:"#111827"},children:a.total_customers||0})]}),e.jsxs("div",{style:{background:"#fff",border:"1px solid #e5e7eb",borderRadius:18,padding:18},children:[e.jsx("div",{style:{fontSize:13,color:"#6b7280",marginBottom:8},children:"Active Customers"}),e.jsx("div",{style:{fontSize:30,fontWeight:800,color:"#111827"},children:a.active_customers||0})]}),e.jsxs("div",{style:{background:"#fff",border:"1px solid #e5e7eb",borderRadius:18,padding:18},children:[e.jsx("div",{style:{fontSize:13,color:"#6b7280",marginBottom:8},children:"Main Marketplace Signups"}),e.jsx("div",{style:{fontSize:30,fontWeight:800,color:"#111827"},children:a.main_marketplace_signups||0})]})]}),e.jsxs("div",{style:{background:"#fff",border:"1px solid #e5e7eb",borderRadius:20,padding:18},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap",marginBottom:16},children:[e.jsxs("div",{children:[e.jsx("h2",{style:{margin:0,fontSize:24,color:"#111827"},children:"My Customers"}),e.jsx("p",{style:{margin:"6px 0 0",color:"#6b7280"},children:"Customers registered under your affiliate/storefront activity."})]}),e.jsxs("form",{onSubmit:m,style:{display:"flex",gap:10,flexWrap:"wrap"},children:[e.jsx("input",{type:"text",value:c,onChange:r=>b(r.target.value),placeholder:"Search name or email",style:{width:260,maxWidth:"100%",height:44,borderRadius:12,border:"1px solid #d1d5db",padding:"0 14px",outline:"none"}}),e.jsx("button",{type:"submit",style:{height:44,border:0,borderRadius:12,padding:"0 16px",background:"#111827",color:"#fff",fontWeight:700,cursor:"pointer"},children:"Search"})]})]}),x?e.jsx("div",{style:{marginBottom:16,background:"#fee2e2",color:"#991b1b",border:"1px solid #fecaca",borderRadius:14,padding:14},children:x}):null,e.jsx("div",{style:{overflowX:"auto"},children:e.jsxs("table",{style:{width:"100%",minWidth:860,borderCollapse:"collapse"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{background:"#f8fafc"},children:[e.jsx("th",{style:n,children:"Name"}),e.jsx("th",{style:n,children:"Email"}),e.jsx("th",{style:n,children:"Status"}),e.jsx("th",{style:n,children:"Source"}),e.jsx("th",{style:n,children:"Website"}),e.jsx("th",{style:n,children:"Last Login"}),e.jsx("th",{style:n,children:"Joined"})]})}),e.jsx("tbody",{children:f?e.jsx("tr",{children:e.jsx("td",{colSpan:7,style:S,children:"Loading customers..."})}):h.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:7,style:S,children:"No customers found."})}):h.map(r=>{var i;return e.jsxs("tr",{style:{borderTop:"1px solid #f1f5f9"},children:[e.jsx("td",{style:l,children:(r==null?void 0:r.name)||"-"}),e.jsx("td",{style:l,children:(r==null?void 0:r.email)||"-"}),e.jsx("td",{style:l,children:e.jsx("span",{style:{display:"inline-flex",alignItems:"center",padding:"6px 10px",borderRadius:999,background:(r==null?void 0:r.status)==="active"?"#dcfce7":(r==null?void 0:r.status)==="suspended"?"#fee2e2":"#f3f4f6",color:(r==null?void 0:r.status)==="active"?"#166534":(r==null?void 0:r.status)==="suspended"?"#991b1b":"#374151",fontSize:12,fontWeight:700,textTransform:"capitalize"},children:(r==null?void 0:r.status)||"-"})}),e.jsx("td",{style:l,children:(r==null?void 0:r.signup_source)||"-"}),e.jsx("td",{style:l,children:((i=r==null?void 0:r.registered_website)==null?void 0:i.website_name)||"-"}),e.jsx("td",{style:l,children:p(r==null?void 0:r.last_login_at)}),e.jsx("td",{style:l,children:p(r==null?void 0:r.created_at)})]},r.id)})})]})})]})]})}const L=`
  * {
    box-sizing: border-box;
  }

  .writer-readers-page {
    width: 100%;
    color: #111827;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .writer-readers-page button,
  .writer-readers-page input {
    font: inherit;
  }

  .writer-readers-mobile-title {
    display: none;
  }

  .writer-readers-stats {
    margin-bottom: 12px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .writer-readers-stat {
    min-width: 0;
    height: 88px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
  }

  .writer-readers-stat span {
    color: #6b7280;
    font-size: 10px;
    line-height: 1.3;
    font-weight: 500;
  }

  .writer-readers-stat strong {
    color: #111827;
    font-size: 25px;
    line-height: 1.1;
    font-weight: 700;
  }

  .writer-readers-search-card {
    margin-bottom: 12px;
    padding: 14px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
  }

  .writer-readers-search-form {
    min-height: 42px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .writer-readers-search-form > strong {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    line-height: 1.3;
    font-weight: 600;
  }

  .writer-readers-search-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .writer-readers-search-actions input {
    width: 360px;
    height: 42px;
    padding: 0 12px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    outline: 0;
    background: #ffffff;
    color: #111827;
    font-size: 11px;
    font-weight: 500;
  }

  .writer-readers-search-actions input::placeholder {
    color: #6b7280;
    opacity: 1;
  }

  .writer-readers-search-actions input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.06);
  }

  .writer-readers-search-actions button {
    width: 72px;
    height: 40px;
    border: 0;
    border-radius: 10px;
    background: #1b1f25;
    color: #ffffff;
    font-size: 11px;
    line-height: 1;
    font-weight: 600;
    cursor: pointer;
  }

  .writer-readers-alert {
    margin-bottom: 12px;
    padding: 11px 13px;
    border: 1px solid #fecaca;
    border-radius: 11px;
    background: #fef2f2;
    color: #b42318;
    font-size: 11px;
    line-height: 1.45;
    font-weight: 600;
  }

  .writer-readers-desktop-card {
    overflow: hidden;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
  }

  .writer-readers-list-head {
    min-height: 52px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .writer-readers-list-head > strong {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    font-weight: 600;
  }

  .writer-readers-list-head > span,
  .writer-readers-mobile-list-head > span {
    min-height: 24px;
    padding: 0 9px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    background: #f8fafc;
    color: #6b7280;
    font-size: 9px;
    line-height: 1;
    font-weight: 600;
    white-space: nowrap;
  }

  .writer-readers-table-wrap {
    overflow-x: auto;
  }

  .writer-readers-table {
    width: 100%;
    min-width: 1000px;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .writer-readers-table thead {
    background: #f8fafc;
  }

  .writer-readers-table th {
    height: 44px;
    padding: 0 12px;
    color: #6b7280;
    font-size: 9px;
    line-height: 1.2;
    font-weight: 600;
    text-align: left;
    text-transform: uppercase;
  }

  .writer-readers-table th:nth-child(1) { width: 13%; }
  .writer-readers-table th:nth-child(2) { width: 19%; }
  .writer-readers-table th:nth-child(3) { width: 9%; }
  .writer-readers-table th:nth-child(4) { width: 12%; }
  .writer-readers-table th:nth-child(5) { width: 13%; }
  .writer-readers-table th:nth-child(6) { width: 18%; }
  .writer-readers-table th:nth-child(7) { width: 16%; }

  .writer-readers-table td {
    height: 56px;
    padding: 0 12px;
    border-top: 1px solid #f1f2f4;
    color: #111827;
    font-size: 11px;
    line-height: 1.4;
    vertical-align: middle;
    overflow-wrap: anywhere;
  }

  .writer-readers-name {
    font-weight: 600;
  }

  .writer-readers-email {
    color: #6b7280 !important;
  }

  .writer-readers-status {
    min-height: 25px;
    padding: 0 9px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    background: #f8fafc;
    color: #6b7280;
    font-size: 10px;
    line-height: 1;
    font-weight: 600;
    text-transform: capitalize;
    white-space: nowrap;
  }

  .writer-readers-status.active {
    border-color: #abefc6;
    background: #ecfdf3;
    color: #027a48;
  }

  .writer-readers-status.suspended {
    border-color: #fccac6;
    background: #fef2f2;
    color: #b42520;
  }

  .writer-readers-empty-cell {
    height: 110px !important;
    color: #6b7280 !important;
    font-size: 11px !important;
    text-align: center;
  }

  .writer-readers-mobile-list {
    display: none;
  }

  @media (max-width: 767px) {
    .writer-readers-mobile-title {
      min-height: 50px;
      margin-bottom: 10px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: #ffffff;
      font-size: 14px;
      line-height: 1.2;
      font-weight: 600;
    }

    .writer-readers-stats {
      margin-bottom: 10px;
      gap: 8px;
    }

    .writer-readers-stat {
      height: 72px;
      padding: 10px;
      gap: 3px;
      border-radius: 12px;
    }

    .writer-readers-stat span {
      font-size: 8px;
    }

    .writer-readers-stat strong {
      font-size: 19px;
    }

    .writer-readers-stat:nth-child(1) span {
      font-size: 0;
    }

    .writer-readers-stat:nth-child(1) span::after {
      content: 'Total';
      font-size: 8px;
    }

    .writer-readers-stat:nth-child(2) span {
      font-size: 0;
    }

    .writer-readers-stat:nth-child(2) span::after {
      content: 'Active';
      font-size: 8px;
    }

    .writer-readers-stat:nth-child(3) span {
      font-size: 0;
    }

    .writer-readers-stat:nth-child(3) span::after {
      content: 'Marketplace';
      font-size: 8px;
    }

    .writer-readers-search-card {
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 12px;
    }

    .writer-readers-search-form {
      min-height: 40px;
    }

    .writer-readers-search-form > strong {
      display: none;
    }

    .writer-readers-search-actions {
      width: 100%;
      gap: 8px;
    }

    .writer-readers-search-actions input {
      flex: 1;
      width: auto;
      min-width: 0;
      height: 40px;
      padding: 0 11px;
      border-radius: 9px;
      font-size: 10px;
    }

    .writer-readers-search-actions button {
      width: 74px;
      height: 40px;
      border-radius: 9px;
      font-size: 10px;
    }

    .writer-readers-desktop-card {
      display: none;
    }

    .writer-readers-mobile-list {
      display: block;
    }

    .writer-readers-mobile-list-head {
      min-height: 36px;
      margin-bottom: 8px;
      padding-left: 2px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .writer-readers-mobile-list-head > strong {
      flex: 1;
      min-width: 0;
      font-size: 11px;
      font-weight: 600;
    }

    .writer-readers-mobile-list-head > span {
      min-height: 23px;
      padding: 0 8px;
      font-size: 8px;
    }

    .writer-readers-card-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .writer-reader-card {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 9px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: #ffffff;
    }

    .writer-reader-card > header {
      min-height: 28px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .writer-reader-card > header > strong {
      flex: 1;
      min-width: 0;
      color: #111827;
      font-size: 12px;
      line-height: 1.3;
      font-weight: 600;
      overflow-wrap: anywhere;
    }

    .writer-reader-card .writer-readers-status {
      min-height: 23px;
      padding: 0 8px;
      font-size: 8px;
    }

    .writer-reader-email {
      color: #6b7280;
      font-size: 9px;
      line-height: 1.35;
      overflow-wrap: anywhere;
    }

    .writer-reader-info-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .writer-reader-info-grid > div {
      min-width: 0;
      min-height: 42px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .writer-reader-info-grid span {
      color: #6b7280;
      font-size: 7px;
      line-height: 1.2;
      font-weight: 600;
      text-transform: uppercase;
    }

    .writer-reader-info-grid strong {
      color: #111827;
      font-size: 9px;
      line-height: 1.35;
      font-weight: 500;
      overflow-wrap: anywhere;
    }

    .writer-readers-mobile-state {
      padding: 28px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: #ffffff;
      color: #6b7280;
      font-size: 10px;
      text-align: center;
    }
  }

  @media (max-width: 390px) {
    .writer-readers-page {
      min-width: 0;
    }

    .writer-readers-stats {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
`,n={textAlign:"left",padding:"14px 12px",fontSize:13,color:"#6b7280",fontWeight:700},l={padding:"14px 12px",fontSize:14,color:"#111827",verticalAlign:"top"},S={padding:"26px 12px",textAlign:"center",color:"#6b7280"};export{M as default};
