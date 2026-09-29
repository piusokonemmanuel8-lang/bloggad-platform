import{r as i,j as a}from"./index-LXBBJt7I.js";import{a as g}from"./api-DFUreCUV.js";function j(s){if(!s)return"Just now";try{return new Date(s).toLocaleString()}catch{return s}}function C(s){return s==="urgent"?"afn-badge urgent":s==="important"?"afn-badge important":"afn-badge normal"}function _(){const[s,b]=i.useState([]),[m,k]=i.useState(0),[o,x]=i.useState("all"),[N,h]=i.useState(!0),[l,f]=i.useState(null),[y,c]=i.useState(""),[u,d]=i.useState(""),w=i.useMemo(()=>o==="unread"?s.filter(e=>Number(e.is_read)!==1):o==="read"?s.filter(e=>Number(e.is_read)===1):s,[s,o]);async function p(){var e,t;try{h(!0),d("");const{data:n}=await g.get("/affiliate/notifications");b(Array.isArray(n==null?void 0:n.notifications)?n.notifications:[]),k(Number((n==null?void 0:n.unread_count)||0))}catch(n){d(((t=(e=n==null?void 0:n.response)==null?void 0:e.data)==null?void 0:t.message)||"Unable to load notifications. Please try again.")}finally{h(!1)}}i.useEffect(()=>{p()},[]);async function v(e){var t,n;try{f(e),c(""),d("");const{data:r}=await g.put(`/affiliate/notifications/${e}/read`);c((r==null?void 0:r.message)||"Notification marked as read."),await p()}catch(r){d(((n=(t=r==null?void 0:r.response)==null?void 0:t.data)==null?void 0:n.message)||"Unable to mark notification as read.")}finally{f(null)}}async function z(e){var t,n;try{f(e),c(""),d("");const{data:r}=await g.put(`/affiliate/notifications/${e}/unread`);c((r==null?void 0:r.message)||"Notification marked as unread."),await p()}catch(r){d(((n=(t=r==null?void 0:r.response)==null?void 0:t.data)==null?void 0:n.message)||"Unable to mark notification as unread.")}finally{f(null)}}async function U(){var e,t;try{f("all"),c(""),d("");const{data:n}=await g.put("/affiliate/notifications/mark-all-read");c((n==null?void 0:n.message)||"All notifications marked as read."),await p()}catch(n){d(((t=(e=n==null?void 0:n.response)==null?void 0:e.data)==null?void 0:t.message)||"Unable to mark all notifications as read.")}finally{f(null)}}return a.jsxs("div",{className:"afn-page",children:[a.jsx("style",{children:R}),a.jsxs("section",{className:"afn-hero",children:[a.jsxs("div",{children:[a.jsx("span",{className:"afn-pill",children:"Notification Center"}),a.jsx("h1",{children:"Platform updates, alerts, and affiliate announcements."}),a.jsx("p",{children:"Stay updated with Bloggad changes, BlogPulse Earnings notices, template updates, maintenance alerts, and admin announcements."})]}),a.jsxs("div",{className:"afn-stats",children:[a.jsxs("div",{className:"afn-stat",children:[a.jsx("span",{children:"Total Updates"}),a.jsx("strong",{children:s.length})]}),a.jsxs("div",{className:"afn-stat unread",children:[a.jsx("span",{children:"Unread"}),a.jsx("strong",{children:m})]})]})]}),(y||u)&&a.jsx("div",{className:u?"afn-alert afn-alert-error":"afn-alert afn-alert-success",children:u||y}),a.jsxs("section",{className:"afn-card",children:[a.jsxs("div",{className:"afn-card-head",children:[a.jsxs("div",{children:[a.jsx("h2",{children:"Your Notifications"}),a.jsx("p",{children:"New updates appear first. You can mark updates as read or unread."})]}),a.jsxs("div",{className:"afn-tools",children:[a.jsx("button",{type:"button",onClick:()=>x("all"),className:o==="all"?"active":"",children:"All"}),a.jsx("button",{type:"button",onClick:()=>x("unread"),className:o==="unread"?"active":"",children:"Unread"}),a.jsx("button",{type:"button",onClick:()=>x("read"),className:o==="read"?"active":"",children:"Read"}),a.jsx("button",{type:"button",onClick:p,children:"Refresh"}),a.jsx("button",{type:"button",onClick:U,disabled:l==="all"||m===0,className:"mark-all",children:l==="all"?"Updating...":"Mark All Read"})]})]}),N?a.jsx("div",{className:"afn-empty",children:"Loading notifications..."}):w.length===0?a.jsxs("div",{className:"afn-empty",children:[a.jsx("strong",{children:o==="all"?"No notifications yet":`No ${o} notifications`}),a.jsx("span",{children:"Platform updates from admin will appear here."})]}):a.jsx("div",{className:"afn-list",children:w.map(e=>{const t=Number(e.is_read)===1;return a.jsxs("article",{className:t?"afn-item read":"afn-item unread",children:[!t&&a.jsx("span",{className:"afn-new-dot"}),a.jsxs("div",{className:"afn-badges",children:[a.jsx("span",{className:C(e.priority),children:e.priority||"normal"}),a.jsx("span",{className:"afn-badge category",children:e.category||"update"}),a.jsx("span",{className:t?"afn-badge read-status":"afn-badge new-status",children:t?"Read":"New"})]}),a.jsx("h3",{children:e.title}),a.jsx("p",{children:e.message}),a.jsxs("div",{className:"afn-meta",children:[a.jsxs("span",{children:["Published:"," ",j(e.published_at||e.created_at)]}),a.jsx("span",{children:t?`Read: ${j(e.read_at)}`:"Unread"})]}),a.jsx("div",{className:"afn-actions",children:t?a.jsx("button",{type:"button",onClick:()=>z(e.id),disabled:l===e.id,children:l===e.id?"Updating...":"Mark Unread"}):a.jsx("button",{type:"button",onClick:()=>v(e.id),disabled:l===e.id,className:"primary",children:l===e.id?"Updating...":"Mark Read"})})]},e.id)})})]})]})}const R=`
  .afn-page {
    width: 100%;
    min-height: calc(100vh - 120px);
    background:
      radial-gradient(circle at top left, rgba(34, 197, 94, 0.12), transparent 28%),
      radial-gradient(circle at top right, rgba(59, 130, 246, 0.14), transparent 26%),
      #f5f7fb;
    padding: 4px;
    color: #0f172a;
  }

  .afn-hero {
    display: grid;
    grid-template-columns: 1.25fr 0.75fr;
    gap: 24px;
    align-items: end;
    margin-bottom: 22px;
    padding: 30px;
    border-radius: 28px;
    background:
      linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(17, 24, 39, 0.98)),
      radial-gradient(circle at top right, rgba(56, 189, 248, 0.35), transparent 30%);
    color: #ffffff;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
    overflow: hidden;
  }

  .afn-pill {
    display: inline-flex;
    margin-bottom: 14px;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(56, 189, 248, 0.14);
    color: #a5f3fc;
    border: 1px solid rgba(125, 211, 252, 0.25);
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.18em;
  }

  .afn-hero h1 {
    margin: 0;
    max-width: 760px;
    font-size: 36px;
    line-height: 1.05;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .afn-hero p {
    margin: 14px 0 0;
    max-width: 680px;
    color: #cbd5e1;
    font-size: 15px;
    line-height: 1.75;
  }

  .afn-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  .afn-stat {
    padding: 20px;
    border-radius: 24px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
  }

  .afn-stat.unread {
    background: rgba(56, 189, 248, 0.13);
    border-color: rgba(125, 211, 252, 0.26);
  }

  .afn-stat span {
    display: block;
    color: #cbd5e1;
    font-size: 12px;
    font-weight: 800;
    margin-bottom: 8px;
  }

  .afn-stat strong {
    display: block;
    font-size: 34px;
    line-height: 1;
    font-weight: 950;
  }

  .afn-alert {
    margin-bottom: 18px;
    padding: 15px 18px;
    border-radius: 18px;
    font-size: 14px;
    font-weight: 800;
  }

  .afn-alert-success {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
  }

  .afn-alert-error {
    background: #fff1f2;
    border: 1px solid #fecdd3;
    color: #9f1239;
  }

  .afn-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  }

  .afn-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 22px;
  }

  .afn-card h2 {
    margin: 0;
    font-size: 25px;
    line-height: 1.15;
    font-weight: 950;
    color: #0f172a;
    letter-spacing: -0.03em;
  }

  .afn-card-head p {
    margin: 7px 0 0;
    color: #64748b;
    font-size: 14px;
    line-height: 1.5;
  }

  .afn-tools {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
  }

  .afn-tools button,
  .afn-actions button {
    border: 1px solid #e2e8f0;
    cursor: pointer;
    font-weight: 950;
    transition: 0.2s ease;
  }

  .afn-tools button {
    padding: 10px 14px;
    border-radius: 999px;
    background: #f8fafc;
    color: #0f172a;
    font-size: 12px;
  }

  .afn-tools button:hover {
    background: #e2e8f0;
  }

  .afn-tools button.active {
    background: #0f172a;
    color: #ffffff;
    border-color: #0f172a;
  }

  .afn-tools button.mark-all {
    background: linear-gradient(135deg, #06b6d4, #3b82f6);
    color: #ffffff;
    border-color: transparent;
  }

  .afn-tools button:disabled,
  .afn-actions button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .afn-empty {
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

  .afn-empty strong {
    color: #0f172a;
    font-size: 18px;
  }

  .afn-list {
    display: grid;
    gap: 15px;
  }

  .afn-item {
    position: relative;
    overflow: hidden;
    padding: 22px;
    border-radius: 26px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    transition: 0.2s ease;
  }

  .afn-item.unread {
    border-color: rgba(14, 165, 233, 0.38);
    background:
      linear-gradient(135deg, rgba(240, 249, 255, 0.98), rgba(255,255,255,1));
    box-shadow: 0 16px 40px rgba(14, 165, 233, 0.08);
  }

  .afn-item.read {
    opacity: 0.88;
  }

  .afn-new-dot {
    position: absolute;
    top: 22px;
    right: 22px;
    width: 12px;
    height: 12px;
    border-radius: 999px;
    background: #06b6d4;
    box-shadow: 0 0 0 7px rgba(6, 182, 212, 0.12);
  }

  .afn-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding-right: 28px;
    margin-bottom: 12px;
  }

  .afn-badge {
    display: inline-flex;
    padding: 7px 10px;
    border-radius: 999px;
    font-size: 10px;
    line-height: 1;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .afn-badge.urgent {
    background: #ffe4e6;
    color: #be123c;
  }

  .afn-badge.important {
    background: #fef3c7;
    color: #92400e;
  }

  .afn-badge.normal,
  .afn-badge.category {
    background: #e0f2fe;
    color: #075985;
  }

  .afn-badge.read-status {
    background: #e2e8f0;
    color: #475569;
  }

  .afn-badge.new-status {
    background: #dcfce7;
    color: #166534;
  }

  .afn-item h3 {
    margin: 0;
    max-width: 920px;
    font-size: 20px;
    font-weight: 950;
    color: #0f172a;
    letter-spacing: -0.02em;
  }

  .afn-item p {
    margin: 10px 0 0;
    max-width: 980px;
    white-space: pre-wrap;
    color: #475569;
    font-size: 14px;
    line-height: 1.75;
  }

  .afn-meta {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-top: 16px;
    color: #64748b;
    font-size: 12px;
    font-weight: 750;
  }

  .afn-actions {
    display: flex;
    gap: 10px;
    margin-top: 18px;
  }

  .afn-actions button {
    padding: 11px 16px;
    border-radius: 999px;
    background: #ffffff;
    color: #0f172a;
  }

  .afn-actions button.primary {
    background: linear-gradient(135deg, #06b6d4, #3b82f6);
    color: #ffffff;
    border-color: transparent;
    box-shadow: 0 12px 28px rgba(59, 130, 246, 0.2);
  }

  @media (max-width: 1000px) {
    .afn-hero {
      grid-template-columns: 1fr;
    }

    .afn-card-head {
      flex-direction: column;
    }

    .afn-tools {
      justify-content: flex-start;
    }
  }

  @media (max-width: 700px) {
    .afn-page {
      padding: 0;
    }

    .afn-hero,
    .afn-card {
      border-radius: 20px;
      padding: 20px;
    }

    .afn-hero h1 {
      font-size: 28px;
    }

    .afn-stats,
    .afn-meta {
      grid-template-columns: 1fr;
    }

    .afn-tools button {
      flex: 1;
    }
  }
`;export{_ as default};
