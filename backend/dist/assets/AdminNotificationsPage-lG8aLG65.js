import{r as i,j as e}from"./index-D7wY-Nn2.js";import{a as h}from"./api-BnafCqf_.js";const j={title:"",message:"",category:"update",priority:"normal",status:"published"};function D(s){if(!s)return"Not published yet";try{return new Date(s).toLocaleString()}catch{return s}}function T(){const[s,y]=i.useState([]),[l,f]=i.useState(j),[p,u]=i.useState(null),[z,v]=i.useState(!0),[N,w]=i.useState(!1),[k,d]=i.useState(""),[m,r]=i.useState(""),g=i.useMemo(()=>({total:s.length,published:s.filter(a=>a.status==="published").length,drafts:s.filter(a=>a.status==="draft").length,urgent:s.filter(a=>a.priority==="urgent").length}),[s]);async function x(){var a,o;try{v(!0),r("");const{data:t}=await h.get("/admin/notifications");y(Array.isArray(t==null?void 0:t.notifications)?t.notifications:[])}catch(t){r(((o=(a=t==null?void 0:t.response)==null?void 0:a.data)==null?void 0:o.message)||"Unable to load notifications. Please try again.")}finally{v(!1)}}i.useEffect(()=>{x()},[]);function b(a,o){f(t=>({...t,[a]:o}))}function C(){f(j),u(null),d(""),r("")}function P(a){u(a.id),f({title:a.title||"",message:a.message||"",category:a.category||"update",priority:a.priority||"normal",status:a.status||"published"}),d(""),r(""),window.scrollTo({top:0,behavior:"smooth"})}async function S(a){var o,t;a.preventDefault();try{if(w(!0),d(""),r(""),p){const{data:n}=await h.put(`/admin/notifications/${p}`,l);d((n==null?void 0:n.message)||"Notification updated successfully.")}else{const{data:n}=await h.post("/admin/notifications",l);d((n==null?void 0:n.message)||"Notification created successfully.")}f(j),u(null),await x()}catch(n){r(((t=(o=n==null?void 0:n.response)==null?void 0:o.data)==null?void 0:t.message)||"Unable to save notification. Please check the form and try again.")}finally{w(!1)}}async function E(a){var t,n;if(window.confirm("Delete this notification permanently?"))try{d(""),r("");const{data:c}=await h.delete(`/admin/notifications/${a}`);d((c==null?void 0:c.message)||"Notification deleted successfully."),await x()}catch(c){r(((n=(t=c==null?void 0:c.response)==null?void 0:t.data)==null?void 0:n.message)||"Unable to delete notification. Please try again.")}}return e.jsxs("div",{className:"bn-page",children:[e.jsx("style",{children:U}),e.jsxs("section",{className:"bn-hero",children:[e.jsxs("div",{children:[e.jsx("span",{className:"bn-pill",children:"Admin Notification Center"}),e.jsx("h1",{children:"Send updates to every affiliate dashboard."}),e.jsx("p",{children:"Create announcements, important alerts, BlogPulse notices, template updates, and platform messages."})]}),e.jsxs("div",{className:"bn-stats",children:[e.jsxs("div",{className:"bn-stat",children:[e.jsx("span",{children:"Total"}),e.jsx("strong",{children:g.total})]}),e.jsxs("div",{className:"bn-stat",children:[e.jsx("span",{children:"Published"}),e.jsx("strong",{children:g.published})]}),e.jsxs("div",{className:"bn-stat",children:[e.jsx("span",{children:"Drafts"}),e.jsx("strong",{children:g.drafts})]}),e.jsxs("div",{className:"bn-stat",children:[e.jsx("span",{children:"Urgent"}),e.jsx("strong",{children:g.urgent})]})]})]}),(k||m)&&e.jsx("div",{className:m?"bn-alert bn-alert-error":"bn-alert bn-alert-success",children:m||k}),e.jsxs("section",{className:"bn-grid",children:[e.jsxs("form",{onSubmit:S,className:"bn-card",children:[e.jsxs("div",{className:"bn-card-head",children:[e.jsxs("div",{children:[e.jsx("h2",{children:p?"Edit Notification":"Create Notification"}),e.jsx("p",{children:"Publish instantly or save as draft."})]}),p&&e.jsx("button",{type:"button",onClick:C,className:"bn-ghost-btn",children:"Cancel"})]}),e.jsxs("label",{className:"bn-field",children:[e.jsx("span",{children:"Title"}),e.jsx("input",{value:l.title,onChange:a=>b("title",a.target.value),placeholder:"Example: New BlogPulse Earnings update"})]}),e.jsxs("label",{className:"bn-field",children:[e.jsx("span",{children:"Message"}),e.jsx("textarea",{value:l.message,onChange:a=>b("message",a.target.value),rows:8,placeholder:"Write the update affiliates should see..."})]}),e.jsxs("div",{className:"bn-form-row",children:[e.jsxs("label",{className:"bn-field",children:[e.jsx("span",{children:"Category"}),e.jsxs("select",{value:l.category,onChange:a=>b("category",a.target.value),children:[e.jsx("option",{value:"update",children:"Update"}),e.jsx("option",{value:"earning",children:"Earning"}),e.jsx("option",{value:"template",children:"Template"}),e.jsx("option",{value:"policy",children:"Policy"}),e.jsx("option",{value:"maintenance",children:"Maintenance"})]})]}),e.jsxs("label",{className:"bn-field",children:[e.jsx("span",{children:"Priority"}),e.jsxs("select",{value:l.priority,onChange:a=>b("priority",a.target.value),children:[e.jsx("option",{value:"normal",children:"Normal"}),e.jsx("option",{value:"important",children:"Important"}),e.jsx("option",{value:"urgent",children:"Urgent"})]})]}),e.jsxs("label",{className:"bn-field",children:[e.jsx("span",{children:"Status"}),e.jsxs("select",{value:l.status,onChange:a=>b("status",a.target.value),children:[e.jsx("option",{value:"published",children:"Published"}),e.jsx("option",{value:"draft",children:"Draft"})]})]})]}),e.jsx("button",{type:"submit",disabled:N,className:"bn-primary-btn",children:N?"Saving...":p?"Update Notification":"Publish Notification"})]}),e.jsxs("div",{className:"bn-card",children:[e.jsxs("div",{className:"bn-card-head",children:[e.jsxs("div",{children:[e.jsx("h2",{children:"All Notifications"}),e.jsx("p",{children:"Manage updates shown to affiliates."})]}),e.jsx("button",{type:"button",onClick:x,className:"bn-ghost-btn",children:"Refresh"})]}),z?e.jsx("div",{className:"bn-empty",children:"Loading notifications..."}):s.length===0?e.jsxs("div",{className:"bn-empty",children:[e.jsx("strong",{children:"No notifications yet"}),e.jsx("span",{children:"Create the first update for affiliates."})]}):e.jsx("div",{className:"bn-list",children:s.map(a=>e.jsxs("article",{className:"bn-item",children:[e.jsxs("div",{className:"bn-badges",children:[e.jsx("span",{className:`bn-badge ${a.status}`,children:a.status}),e.jsx("span",{className:`bn-badge ${a.priority}`,children:a.priority}),e.jsx("span",{className:"bn-badge category",children:a.category})]}),e.jsx("h3",{children:a.title}),e.jsx("p",{children:a.message}),e.jsxs("div",{className:"bn-meta",children:[e.jsxs("span",{children:["Published: ",D(a.published_at)]}),e.jsxs("span",{children:["Reads: ",a.total_reads||0]})]}),e.jsxs("div",{className:"bn-actions",children:[e.jsx("button",{type:"button",onClick:()=>P(a),children:"Edit"}),e.jsx("button",{type:"button",onClick:()=>E(a.id),className:"danger",children:"Delete"})]})]},a.id))})]})]})]})}const U=`
  .bn-page {
    width: 100%;
    min-height: calc(100vh - 120px);
    background:
      radial-gradient(circle at top left, rgba(59, 130, 246, 0.18), transparent 28%),
      radial-gradient(circle at top right, rgba(236, 72, 153, 0.14), transparent 25%),
      #f5f7fb;
    padding: 4px;
    color: #0f172a;
  }

  .bn-hero {
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    gap: 34px;
    align-items: center;
    margin-bottom: 22px;
    padding: 34px;
    border-radius: 28px;
    background: linear-gradient(135deg, #07111f, #0f172a 48%, #020617);
    color: #ffffff;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
    overflow: hidden;
  }

  .bn-pill {
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

  .bn-hero h1 {
    margin: 0;
    max-width: 720px;
    font-size: 36px;
    line-height: 1.08;
    font-weight: 950;
    letter-spacing: -0.04em;
    color: #ffffff;
  }

  .bn-hero p {
    margin: 16px 0 0;
    max-width: 720px;
    color: #e2e8f0;
    font-size: 15px;
    line-height: 1.75;
  }

  .bn-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .bn-stat {
    padding: 20px;
    min-height: 112px;
    border-radius: 22px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.18);
  }

  .bn-stat span {
    display: block;
    color: #f8fafc;
    font-size: 13px;
    font-weight: 900;
    margin-bottom: 10px;
  }

  .bn-stat strong {
    display: block;
    color: #ffffff;
    font-size: 34px;
    line-height: 1;
    font-weight: 950;
  }

  .bn-alert {
    margin-bottom: 18px;
    padding: 15px 18px;
    border-radius: 18px;
    font-size: 14px;
    font-weight: 800;
  }

  .bn-alert-success {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
  }

  .bn-alert-error {
    background: #fff1f2;
    border: 1px solid #fecdd3;
    color: #9f1239;
  }

  .bn-grid {
    display: grid;
    grid-template-columns: 0.9fr 1.1fr;
    gap: 22px;
    align-items: start;
  }

  .bn-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  }

  .bn-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 22px;
  }

  .bn-card h2 {
    margin: 0;
    font-size: 24px;
    line-height: 1.15;
    font-weight: 950;
    color: #0f172a;
    letter-spacing: -0.03em;
  }

  .bn-card-head p {
    margin: 7px 0 0;
    color: #64748b;
    font-size: 14px;
    line-height: 1.5;
  }

  .bn-field {
    display: block;
    margin-bottom: 16px;
  }

  .bn-field span {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    color: #334155;
    font-weight: 900;
  }

  .bn-field input,
  .bn-field textarea,
  .bn-field select {
    width: 100%;
    border: 1px solid #dbe3ef;
    background: #f8fafc;
    border-radius: 16px;
    padding: 13px 14px;
    color: #0f172a;
    font-size: 14px;
    outline: none;
    transition: 0.2s ease;
  }

  .bn-field textarea {
    resize: vertical;
    min-height: 180px;
    line-height: 1.7;
  }

  .bn-field input:focus,
  .bn-field textarea:focus,
  .bn-field select:focus {
    border-color: #38bdf8;
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.14);
  }

  .bn-form-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .bn-primary-btn,
  .bn-ghost-btn,
  .bn-actions button {
    border: 0;
    cursor: pointer;
    font-weight: 950;
    transition: 0.2s ease;
  }

  .bn-primary-btn {
    width: 100%;
    margin-top: 4px;
    padding: 15px 18px;
    border-radius: 18px;
    background: linear-gradient(135deg, #06b6d4, #3b82f6);
    color: #ffffff;
    box-shadow: 0 14px 35px rgba(59, 130, 246, 0.25);
  }

  .bn-primary-btn:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  .bn-ghost-btn {
    padding: 11px 15px;
    border-radius: 999px;
    background: #f1f5f9;
    color: #0f172a;
    border: 1px solid #e2e8f0;
  }

  .bn-ghost-btn:hover {
    background: #e2e8f0;
  }

  .bn-empty {
    display: grid;
    gap: 8px;
    place-items: center;
    min-height: 220px;
    border-radius: 22px;
    background: #f8fafc;
    border: 1px dashed #cbd5e1;
    color: #64748b;
    text-align: center;
    padding: 30px;
  }

  .bn-empty strong {
    color: #0f172a;
    font-size: 18px;
  }

  .bn-list {
    display: grid;
    gap: 14px;
    max-height: 720px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .bn-item {
    border-radius: 24px;
    padding: 20px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
  }

  .bn-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  .bn-badge {
    display: inline-flex;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 10px;
    line-height: 1;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .bn-badge.published {
    background: #dcfce7;
    color: #166534;
  }

  .bn-badge.draft {
    background: #fef3c7;
    color: #92400e;
  }

  .bn-badge.urgent {
    background: #ffe4e6;
    color: #be123c;
  }

  .bn-badge.important {
    background: #fae8ff;
    color: #86198f;
  }

  .bn-badge.normal,
  .bn-badge.category {
    background: #e0f2fe;
    color: #075985;
  }

  .bn-item h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 950;
    color: #0f172a;
  }

  .bn-item p {
    margin: 10px 0 0;
    white-space: pre-wrap;
    color: #475569;
    font-size: 14px;
    line-height: 1.7;
  }

  .bn-meta {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-top: 15px;
    color: #64748b;
    font-size: 12px;
    font-weight: 700;
  }

  .bn-actions {
    display: flex;
    gap: 10px;
    margin-top: 16px;
  }

  .bn-actions button {
    padding: 10px 15px;
    border-radius: 999px;
    background: #0f172a;
    color: #ffffff;
  }

  .bn-actions button.danger {
    background: #fff1f2;
    color: #be123c;
    border: 1px solid #fecdd3;
  }

  @media (max-width: 1100px) {
    .bn-hero,
    .bn-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 700px) {
    .bn-page {
      padding: 0;
    }

    .bn-hero,
    .bn-card {
      border-radius: 20px;
      padding: 20px;
    }

    .bn-hero h1 {
      font-size: 28px;
    }

    .bn-stats,
    .bn-form-row,
    .bn-meta {
      grid-template-columns: 1fr;
    }

    .bn-card-head {
      flex-direction: column;
    }
  }
`;export{T as default};
