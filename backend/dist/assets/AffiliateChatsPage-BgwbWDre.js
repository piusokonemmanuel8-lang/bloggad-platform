import{b as Ae,r as d,j as s,a as b}from"./index-D7wY-Nn2.js";import{W as be,C as we}from"./WriterReaderChatControls-BuLBrfLb.js";function he(W){if(!W)return"-";const k=new Date(W);return Number.isNaN(k.getTime())?W:k.toLocaleString()}function Be(){var ue,xe;const k=Ae().pathname==="/writer/messages",[$,ye]=d.useState([]),[T,je]=d.useState([]),[O,ve]=d.useState([]),[n,w]=d.useState("customers"),[p,c]=d.useState(null),[i,N]=d.useState(null),[B,L]=d.useState([]),[h,F]=d.useState(""),[G,J]=d.useState(!0),[V,Z]=d.useState(!1),[y,ee]=d.useState(!1),[D,se]=d.useState(!1),[I,re]=d.useState(!1),[E,g]=d.useState(""),[te,Se]=d.useState(""),[u,j]=d.useState(""),[P,q]=d.useState("customers"),[ie,C]=d.useState(!1),[ke,z]=d.useState(!1),[m,v]=d.useState({customer_id:"",subject:"",message:""}),[x,_]=d.useState({subject:"",message:""}),U=d.useMemo(()=>n==="admin"?$:T,[n,$,T]);async function S(){var R,M,A;const[e,r,t]=await Promise.all([b.get("/api/affiliate-admin-chats"),b.get("/api/customer-affiliate-chats"),b.get("/api/customer-management/affiliate/customers")]),o=((R=e==null?void 0:e.data)==null?void 0:R.chats)||[],a=((M=r==null?void 0:r.data)==null?void 0:M.chats)||[],l=((A=t==null?void 0:t.data)==null?void 0:A.customers)||[];return ye(o),je(a),ve(l),{nextAdminChats:o,nextCustomerChats:a,nextCustomers:l}}d.useEffect(()=>{let e=!0;async function r(){var t,o;try{J(!0),g("");const{nextAdminChats:a,nextCustomerChats:l}=await S();if(!e)return;l.length>0?(w("customers"),c(l[0].id)):a.length>0?(w("admin"),c(a[0].id)):(c(null),N(null),L([]))}catch(a){if(!e)return;g(((o=(t=a==null?void 0:a.response)==null?void 0:t.data)==null?void 0:o.message)||"Failed to load chats")}finally{e&&J(!1)}}return r(),()=>{e=!1}},[]),d.useEffect(()=>{let e=!0;async function r(){var t,o;if(!p){N(null),L([]);return}try{Z(!0),g("");const a=n==="admin"?`/api/affiliate-admin-chats/${p}`:`/api/customer-affiliate-chats/${p}`,{data:l}=await b.get(a);if(!e)return;N((l==null?void 0:l.chat)||null),L((l==null?void 0:l.messages)||[])}catch(a){if(!e)return;g(((o=(t=a==null?void 0:a.response)==null?void 0:t.data)==null?void 0:o.message)||"Failed to load chat")}finally{e&&Z(!1)}}return r(),()=>{e=!1}},[n,p]);async function ae(e){var r,t;if(e.preventDefault(),!(!h.trim()||!p))try{ee(!0),g("");const o=n==="admin"?`/api/affiliate-admin-chats/${p}/messages`:`/api/customer-affiliate-chats/${p}/messages`,{data:a}=await b.post(o,{message:h.trim()});F(""),N((a==null?void 0:a.chat)||null),L((a==null?void 0:a.messages)||[]),await S()}catch(o){g(((t=(r=o==null?void 0:o.response)==null?void 0:r.data)==null?void 0:t.message)||"Failed to send message")}finally{ee(!1)}}async function oe(){var e,r;if(p)try{g("");const t=n==="admin"?`/api/affiliate-admin-chats/${p}/close`:`/api/customer-affiliate-chats/${p}/close`,{data:o}=await b.patch(t);N((o==null?void 0:o.chat)||null),await S()}catch(t){g(((r=(e=t==null?void 0:t.response)==null?void 0:e.data)==null?void 0:r.message)||"Failed to close chat")}}async function ne(e){var a,l,R,M,A;if(e.preventDefault(),!m.customer_id||!m.message.trim()){g("Reader and first message are required");return}const r=O.find(f=>String(f.id)===String(m.customer_id)),t=((a=r==null?void 0:r.registered_website)==null?void 0:a.id)||(r==null?void 0:r.registered_under_website_id)||null,o=((l=r==null?void 0:r.registered_website)==null?void 0:l.slug)||"";if(!t&&!o){g("Selected Reader has no registered Writer Space context");return}try{se(!0),g("");const{data:f}=await b.post("/api/customer-affiliate-chats",{customer_id:Number(m.customer_id),website_id:t||void 0,website_slug:o||void 0,subject:m.subject.trim()||void 0,message:m.message.trim(),chat_type:"support"}),Me=((R=f==null?void 0:f.chat)==null?void 0:R.id)||null;v({customer_id:"",subject:"",message:""}),await S(),w("customers"),c(Me),k&&(j(""),z(!0))}catch(f){g(((A=(M=f==null?void 0:f.response)==null?void 0:M.data)==null?void 0:A.message)||"Failed to start Reader chat")}finally{se(!1)}}async function de(e){var r,t,o;if(e.preventDefault(),!x.message.trim()){g("Message is required");return}try{re(!0),g("");const{data:a}=await b.post("/api/affiliate-admin-chats",{subject:x.subject.trim()||void 0,message:x.message.trim()}),l=((r=a==null?void 0:a.chat)==null?void 0:r.id)||null;_({subject:"",message:""}),await S(),w("admin"),c(l),k&&(j(""),z(!0))}catch(a){g(((o=(t=a==null?void 0:a.response)==null?void 0:t.data)==null?void 0:o.message)||"Failed to start admin chat")}finally{re(!1)}}if(!k)return s.jsxs("div",{style:{display:"grid",gap:20},children:[s.jsxs("div",{style:{background:"#fff",border:"1px solid #e5e7eb",borderRadius:20,padding:20},children:[s.jsx("h1",{style:{margin:0,fontSize:28,color:"#111827"},children:"Chats"}),s.jsx("p",{style:{margin:"8px 0 0",color:"#6b7280"},children:"Manage your Reader and admin conversations from one place."})]}),E?s.jsx("div",{style:{background:"#fee2e2",color:"#991b1b",border:"1px solid #fecaca",borderRadius:14,padding:14,wordBreak:"break-word"},children:E}):null,s.jsxs("div",{className:"affiliate-chat-start-grid",style:{display:"grid",gridTemplateColumns:"repeat(2, minmax(0, 1fr))",gap:20},children:[s.jsx(be,{}),s.jsxs("form",{onSubmit:ne,style:{background:"#fff",border:"1px solid #e5e7eb",borderRadius:20,padding:20,display:"grid",gap:12},children:[s.jsx("div",{style:{fontSize:24,fontWeight:800,color:"#111827"},children:"Start Reader Chat"}),s.jsxs("select",{value:m.customer_id,onChange:e=>v(r=>({...r,customer_id:e.target.value})),style:Q,children:[s.jsx("option",{value:"",children:"Select Reader"}),O.map(e=>s.jsx("option",{value:e.id,children:(e==null?void 0:e.name)||"Reader"},e.id))]}),s.jsx("input",{type:"text",placeholder:"Subject (optional)",value:m.subject,onChange:e=>v(r=>({...r,subject:e.target.value})),style:Q}),s.jsx("textarea",{placeholder:"Write your first message...",rows:4,value:m.message,onChange:e=>v(r=>({...r,message:e.target.value})),style:X}),s.jsx("button",{type:"submit",disabled:D,style:Y,children:D?"Starting...":"Start Reader Chat"})]}),s.jsxs("form",{onSubmit:de,style:{background:"#fff",border:"1px solid #e5e7eb",borderRadius:20,padding:20,display:"grid",gap:12},children:[s.jsx("div",{style:{fontSize:24,fontWeight:800,color:"#111827"},children:"Start Admin Chat"}),s.jsx("input",{type:"text",placeholder:"Subject (optional)",value:x.subject,onChange:e=>_(r=>({...r,subject:e.target.value})),style:Q}),s.jsx("textarea",{placeholder:"Write your first message...",rows:4,value:x.message,onChange:e=>_(r=>({...r,message:e.target.value})),style:X}),s.jsx("button",{type:"submit",disabled:I,style:Y,children:I?"Starting...":"Start Admin Chat"})]})]}),s.jsxs("div",{className:"affiliate-chats-layout",style:{display:"grid",gridTemplateColumns:"minmax(0, 320px) minmax(0, 1fr)",gap:20},children:[s.jsxs("div",{style:{background:"#fff",border:"1px solid #e5e7eb",borderRadius:20,padding:16,minWidth:0},children:[s.jsxs("div",{style:{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"},children:[s.jsx("button",{type:"button",onClick:()=>{var e;w("customers"),c(((e=T[0])==null?void 0:e.id)||null)},style:{border:0,borderRadius:12,padding:"10px 14px",background:n==="customers"?"#111827":"#f3f4f6",color:n==="customers"?"#fff":"#111827",cursor:"pointer",fontWeight:700},children:"Readers"}),s.jsx("button",{type:"button",onClick:()=>{var e;w("admin"),c(((e=$[0])==null?void 0:e.id)||null)},style:{border:0,borderRadius:12,padding:"10px 14px",background:n==="admin"?"#111827":"#f3f4f6",color:n==="admin"?"#fff":"#111827",cursor:"pointer",fontWeight:700},children:"Admin"})]}),G?s.jsx("div",{style:{color:"#6b7280"},children:"Loading chats..."}):U.length===0?s.jsx("div",{style:{color:"#6b7280"},children:"No chats yet."}):s.jsx("div",{style:{display:"grid",gap:10},children:U.map(e=>{var o,a;const r=n==="admin"?"Admin Support":((o=e==null?void 0:e.customer)==null?void 0:o.name)||(e==null?void 0:e.customer_name)||(e==null?void 0:e.subject)||`Reader #${e.id}`,t=n==="admin"?(e==null?void 0:e.subject)||(e==null?void 0:e.status)||"Support conversation":(e==null?void 0:e.subject)||((a=e==null?void 0:e.website)==null?void 0:a.website_name)||"Reader conversation";return s.jsxs("button",{type:"button",onClick:()=>c(e.id),style:{textAlign:"left",border:p===e.id?"1px solid #111827":"1px solid #e5e7eb",background:p===e.id?"#f9fafb":"#fff",borderRadius:14,padding:14,cursor:"pointer",minWidth:0},children:[s.jsx("div",{style:{fontWeight:700,color:"#111827",marginBottom:6,wordBreak:"break-word"},children:r}),s.jsx("div",{style:{fontSize:13,color:"#6b7280",marginBottom:6,wordBreak:"break-word"},children:t}),s.jsx("div",{style:{fontSize:12,color:"#8c8f94"},children:(e==null?void 0:e.status)||"open"})]},`${n}-${e.id}`)})})]}),s.jsx("div",{style:{background:"#fff",border:"1px solid #e5e7eb",borderRadius:20,padding:16,minHeight:560,display:"flex",flexDirection:"column",minWidth:0},children:p?V?s.jsx("div",{style:{color:"#6b7280"},children:"Loading conversation..."}):s.jsxs(s.Fragment,{children:[s.jsxs("div",{style:{paddingBottom:14,borderBottom:"1px solid #e5e7eb",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap"},children:[s.jsxs("div",{style:{minWidth:0},children:[s.jsx("div",{style:{fontWeight:800,fontSize:18,color:"#111827",wordBreak:"break-word"},children:n==="admin"?"Admin Support":(i==null?void 0:i.customer_name)||((ue=i==null?void 0:i.customer)==null?void 0:ue.name)||(i==null?void 0:i.subject)||"Reader Chat"}),s.jsx("div",{style:{color:"#6b7280",marginTop:4,wordBreak:"break-word"},children:n==="admin"?(i==null?void 0:i.subject)||(i==null?void 0:i.status)||"Support conversation":(i==null?void 0:i.website_name)||((xe=i==null?void 0:i.website)==null?void 0:xe.website_name)||(i==null?void 0:i.subject)||(i==null?void 0:i.status)||"Reader conversation"})]}),i!=null&&i.id?s.jsx("button",{type:"button",onClick:oe,style:{border:"1px solid #d1d5db",borderRadius:12,padding:"10px 12px",background:"#fff",color:"#111827",cursor:"pointer",fontWeight:700},children:"Close Chat"}):null]}),n==="customers"&&(i!=null&&i.id)?s.jsx(we,{chatId:i.id,participantRole:"writer",onChanged:S}):null,s.jsx("div",{style:{flex:1,display:"grid",gap:12,alignContent:"start",maxHeight:380,overflowY:"auto",overflowX:"hidden",paddingRight:4},children:B.length===0?s.jsx("div",{style:{color:"#6b7280"},children:"No messages yet."}):B.map(e=>{const r=(e==null?void 0:e.sender_role)==="affiliate";return s.jsxs("div",{style:{justifySelf:r?"end":"start",maxWidth:"85%",background:r?"#111827":"#f3f4f6",borderRadius:16,padding:12,wordBreak:"break-word"},children:[s.jsx("div",{style:{fontSize:12,marginBottom:6,color:r?"rgba(255,255,255,0.72)":"rgba(29,35,39,0.72)",fontWeight:600},children:(e==null?void 0:e.sender_name)||(e==null?void 0:e.sender_role)||"User"}),s.jsx("div",{style:{color:r?"#ffffff":"#111827",lineHeight:1.6,whiteSpace:"pre-wrap"},children:e==null?void 0:e.message}),s.jsx("div",{style:{fontSize:11,marginTop:8,color:r?"rgba(255,255,255,0.72)":"rgba(29,35,39,0.72)"},children:he(e==null?void 0:e.created_at)})]},e.id)})}),s.jsxs("form",{onSubmit:ae,style:{marginTop:16,display:"grid",gap:10},children:[s.jsx("textarea",{value:h,onChange:e=>F(e.target.value),placeholder:"Write your message...",rows:4,style:X}),s.jsx("button",{type:"submit",disabled:y||!h.trim(),style:{...Y,justifySelf:"start",opacity:y?.6:1,cursor:y?"not-allowed":"pointer"},children:y?"Sending...":"Send Message"})]})]}):s.jsx("div",{style:{color:"#6b7280"},children:"Select a chat to begin."})})]}),s.jsx("style",{children:`
          @media (max-width: 1100px) {
            .affiliate-chat-start-grid {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 980px) {
            .affiliate-chats-layout {
              grid-template-columns: 1fr !important;
            }
          }
        `})]});function H(e,r=n){var t;return e?r==="admin"?"Admin Support":((t=e==null?void 0:e.customer)==null?void 0:t.name)||(e==null?void 0:e.customer_name)||(e==null?void 0:e.subject)||`Reader #${e.id}`:r==="admin"?"Admin Support":"Reader"}function le(e,r=n){var t;return e?r==="admin"?(e==null?void 0:e.subject)||(e==null?void 0:e.status)||"Support conversation":(e==null?void 0:e.last_message)||(e==null?void 0:e.subject)||((t=e==null?void 0:e.website)==null?void 0:t.website_name)||(e==null?void 0:e.status)||"Reader conversation":""}function Ne(e){if(!e)return"";const r=new Date(e);if(Number.isNaN(r.getTime()))return"";const t=new Date;return r.toDateString()===t.toDateString()?r.toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):r.toLocaleDateString([],{month:"short",day:"numeric"})}function pe(e){const r=String(e||"U").trim().split(/\s+/).filter(Boolean);return r.length?r.slice(0,2).map(t=>t.charAt(0).toUpperCase()).join(""):"U"}function Ce(e){c(e),z(!0),C(!1)}function ge(e){var t;const r=e==="admin"?$:T;w(e),c(((t=r[0])==null?void 0:t.id)||null),z(!1),C(!1)}function me(e="customers"){q(e),j("new")}function ze(e){F(r=>`${r}${String.fromCodePoint(e)}`),C(!1)}const K=te.trim().toLowerCase(),ce=U.filter(e=>{var t;return K?[H(e),le(e),e==null?void 0:e.subject,e==null?void 0:e.status,(t=e==null?void 0:e.website)==null?void 0:t.website_name].filter(Boolean).join(" ").toLowerCase().includes(K):!0}),fe=H(i),_e=n==="customers"&&(i==null?void 0:i.request_status)==="pending"?"Message request":String((i==null?void 0:i.status)||"").toLowerCase()==="closed"?"Closed":n==="admin"?"Admin support":"Reader conversation",Re=[128578,128512,128077,10084,127881,128591,128161,128293];return s.jsxs(s.Fragment,{children:[s.jsx("style",{children:`
    .writer-messages-page {
      height: calc(100vh - 66px);
      min-height: 680px;
      margin: -30px;
      display: grid;
      grid-template-columns: 318px minmax(0, 1fr);
      overflow: hidden;
      background: #ffffff;
      color: #1c1f24;
      border-top: 1px solid #e4e7ea;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .writer-messages-page *,
    .writer-messages-page *::before,
    .writer-messages-page *::after {
      box-sizing: border-box;
    }

    .writer-messages-page button,
    .writer-messages-page input,
    .writer-messages-page textarea,
    .writer-messages-drawer button,
    .writer-messages-drawer input,
    .writer-messages-drawer select,
    .writer-messages-drawer textarea {
      font: inherit;
    }

    .writer-messages-inbox {
      min-width: 0;
      min-height: 0;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border-right: 1px solid #e2e5e8;
    }

    .writer-messages-inbox-head {
      padding: 20px 18px 14px;
      border-bottom: 1px solid #edf0f2;
      background: #ffffff;
    }

    .writer-messages-inbox-title-row {
      min-height: 36px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .writer-messages-inbox-title-row h2 {
      margin: 0;
      font-size: 20px;
      line-height: 1.2;
      font-weight: 750;
      letter-spacing: -0.025em;
    }

    .writer-messages-inbox-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .writer-messages-icon-button {
      min-width: 34px;
      height: 34px;
      padding: 0 10px;
      border: 1px solid #dfe3e6;
      border-radius: 9px;
      background: #ffffff;
      color: #2e3339;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 12px;
      font-weight: 700;
    }

    .writer-messages-icon-button.primary {
      min-width: 34px;
      padding: 0;
      border-color: #1d2025;
      background: #1d2025;
      color: #ffffff;
      font-size: 18px;
      line-height: 1;
    }

    .writer-messages-search {
      width: 100%;
      height: 40px;
      margin-top: 14px;
      padding: 0 12px;
      border: 1px solid #dde1e5;
      border-radius: 10px;
      outline: none;
      background: #f8f9fa;
      color: #20242a;
      font-size: 13px;
    }

    .writer-messages-search:focus {
      border-color: #9ca3aa;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(32, 36, 42, 0.06);
    }

    .writer-messages-tabs {
      margin-top: 12px;
      padding: 3px;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 3px;
      border-radius: 9px;
      background: #f1f3f4;
    }

    .writer-messages-tab {
      height: 32px;
      border: 0;
      border-radius: 7px;
      background: transparent;
      color: #666d76;
      cursor: pointer;
      font-size: 12px;
      font-weight: 700;
    }

    .writer-messages-tab.active {
      background: #ffffff;
      color: #1e2227;
      box-shadow: 0 1px 3px rgba(24, 29, 35, 0.08);
    }

    .writer-messages-list {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      background: #ffffff;
      scrollbar-width: thin;
    }

    .writer-messages-list-state {
      padding: 26px 20px;
      color: #78808a;
      font-size: 13px;
      line-height: 1.5;
    }

    .writer-messages-row {
      width: 100%;
      min-height: 76px;
      padding: 12px 14px;
      border: 0;
      border-bottom: 1px solid #f0f1f2;
      background: #ffffff;
      display: grid;
      grid-template-columns: 42px minmax(0, 1fr) auto;
      gap: 10px;
      align-items: center;
      text-align: left;
      cursor: pointer;
    }

    .writer-messages-row:hover,
    .writer-messages-row.active {
      background: #f7f8f9;
    }

    .writer-messages-row.active {
      box-shadow: inset 3px 0 0 #1d2025;
    }

    .writer-messages-avatar {
      width: 42px;
      height: 42px;
      border-radius: 999px;
      background: #eceff1;
      color: #33383e;
      display: grid;
      place-items: center;
      flex-shrink: 0;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.02em;
    }

    .writer-messages-row-copy {
      min-width: 0;
    }

    .writer-messages-row-copy strong,
    .writer-messages-row-copy span {
      display: block;
    }

    .writer-messages-row-copy strong {
      overflow: hidden;
      color: #23272d;
      font-size: 13px;
      line-height: 1.35;
      font-weight: 750;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .writer-messages-row-copy span {
      margin-top: 4px;
      overflow: hidden;
      color: #808791;
      font-size: 11px;
      line-height: 1.4;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .writer-messages-row-meta {
      align-self: start;
      padding-top: 2px;
      display: grid;
      justify-items: end;
      gap: 8px;
      color: #8a9199;
      font-size: 10px;
      white-space: nowrap;
    }

    .writer-messages-unread {
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 999px;
      background: #1d2025;
      color: #ffffff;
      display: grid;
      place-items: center;
      font-size: 9px;
      font-weight: 800;
    }

    .writer-messages-thread {
      min-width: 0;
      min-height: 0;
      display: flex;
      flex-direction: column;
      background: #f7f8f9;
    }

    .writer-messages-thread-head {
      min-height: 68px;
      padding: 11px 18px;
      border-bottom: 1px solid #e1e4e7;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
    }

    .writer-messages-thread-person {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 11px;
    }

    .writer-messages-thread-person .writer-messages-avatar {
      width: 38px;
      height: 38px;
    }

    .writer-messages-thread-copy {
      min-width: 0;
    }

    .writer-messages-thread-copy strong,
    .writer-messages-thread-copy span {
      display: block;
    }

    .writer-messages-thread-copy strong {
      overflow: hidden;
      color: #1e2227;
      font-size: 14px;
      line-height: 1.3;
      font-weight: 750;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .writer-messages-thread-copy span {
      margin-top: 3px;
      color: #7c848d;
      font-size: 11px;
    }

    .writer-messages-mobile-back {
      display: none;
    }

    .writer-messages-thread-more {
      width: 34px;
      height: 34px;
      border: 1px solid #dfe3e6;
      border-radius: 9px;
      background: #ffffff;
      color: #454b52;
      cursor: pointer;
      font-size: 15px;
      letter-spacing: 0.08em;
    }

    .writer-messages-error {
      margin: 10px 16px 0;
      padding: 10px 12px;
      border: 1px solid #f2c9cc;
      border-radius: 9px;
      background: #fff4f5;
      color: #9f2530;
      font-size: 12px;
      line-height: 1.4;
    }

    .writer-messages-thread-body {
      flex: 1;
      min-height: 0;
      padding: 24px clamp(18px, 4vw, 52px);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 9px;
      scrollbar-width: thin;
    }

    .writer-messages-thread-state {
      margin: auto;
      max-width: 340px;
      padding: 24px;
      color: #7a828b;
      text-align: center;
      font-size: 13px;
      line-height: 1.55;
    }

    .writer-message-line {
      display: flex;
      justify-content: flex-start;
    }

    .writer-message-line.mine {
      justify-content: flex-end;
    }

    .writer-message-wrap {
      max-width: min(68%, 660px);
      display: grid;
      gap: 4px;
    }

    .writer-message-line.mine .writer-message-wrap {
      justify-items: end;
    }

    .writer-message-bubble {
      padding: 10px 13px;
      border: 1px solid #e0e3e6;
      border-radius: 15px 15px 15px 4px;
      background: #ffffff;
      color: #282c31;
      font-size: 13px;
      line-height: 1.5;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      box-shadow: 0 1px 1px rgba(23, 27, 32, 0.02);
    }

    .writer-message-line.mine .writer-message-bubble {
      border-color: #202328;
      border-radius: 15px 15px 4px 15px;
      background: #202328;
      color: #ffffff;
    }

    .writer-message-time {
      padding: 0 3px;
      color: #9299a2;
      font-size: 9px;
      line-height: 1.3;
    }

    .writer-messages-composer-wrap {
      position: relative;
      padding: 12px 16px;
      border-top: 1px solid #e1e4e7;
      background: #ffffff;
    }

    .writer-messages-composer {
      min-height: 44px;
      display: grid;
      grid-template-columns: auto auto minmax(0, 1fr) auto;
      gap: 7px;
      align-items: end;
    }

    .writer-messages-compose-button {
      height: 40px;
      min-width: 40px;
      padding: 0 9px;
      border: 1px solid #dde1e4;
      border-radius: 10px;
      background: #ffffff;
      color: #596069;
      cursor: pointer;
      font-size: 12px;
      font-weight: 700;
    }

    .writer-messages-compose-button:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }

    .writer-messages-compose-field {
      min-height: 40px;
      max-height: 120px;
      padding: 10px 12px;
      border: 1px solid #dfe2e5;
      border-radius: 12px;
      outline: none;
      resize: none;
      background: #f8f9fa;
      color: #25292e;
      font-size: 13px;
      line-height: 1.45;
    }

    .writer-messages-compose-field:focus {
      border-color: #9ea5ad;
      background: #ffffff;
    }

    .writer-messages-send {
      height: 40px;
      padding: 0 16px;
      border: 1px solid #1e2227;
      border-radius: 10px;
      background: #1e2227;
      color: #ffffff;
      cursor: pointer;
      font-size: 12px;
      font-weight: 750;
    }

    .writer-messages-send:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }

    .writer-messages-emoji-panel {
      position: absolute;
      left: 16px;
      bottom: 64px;
      z-index: 8;
      width: 232px;
      padding: 9px;
      border: 1px solid #dfe3e6;
      border-radius: 12px;
      background: #ffffff;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 5px;
      box-shadow: 0 12px 28px rgba(24, 29, 35, 0.12);
    }

    .writer-messages-emoji-panel button {
      height: 40px;
      border: 0;
      border-radius: 8px;
      background: #f7f8f9;
      cursor: pointer;
      font-size: 20px;
    }

    .writer-messages-drawer-layer {
      position: fixed;
      inset: 0;
      z-index: 4200;
      background: rgba(18, 21, 26, 0.32);
      display: flex;
      justify-content: flex-end;
    }

    .writer-messages-drawer {
      width: min(420px, 100%);
      height: 100%;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      box-shadow: -18px 0 44px rgba(18, 22, 27, 0.14);
    }

    .writer-messages-drawer-head {
      min-height: 64px;
      padding: 0 18px;
      border-bottom: 1px solid #e5e7e9;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .writer-messages-drawer-head h3 {
      margin: 0;
      color: #1e2227;
      font-size: 17px;
      font-weight: 750;
      letter-spacing: -0.015em;
    }

    .writer-messages-drawer-close {
      width: 34px;
      height: 34px;
      border: 1px solid #dfe3e6;
      border-radius: 9px;
      background: #ffffff;
      color: #5f666e;
      cursor: pointer;
      font-size: 17px;
    }

    .writer-messages-drawer-body {
      flex: 1;
      min-height: 0;
      padding: 18px;
      overflow-y: auto;
    }

    .writer-messages-drawer-tabs {
      margin-bottom: 16px;
      padding: 3px;
      border-radius: 9px;
      background: #f1f3f4;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 3px;
    }

    .writer-messages-form {
      display: grid;
      gap: 12px;
    }

    .writer-messages-form label {
      display: grid;
      gap: 6px;
      color: #596069;
      font-size: 11px;
      font-weight: 750;
    }

    .writer-messages-form input,
    .writer-messages-form select,
    .writer-messages-form textarea {
      width: 100%;
      border: 1px solid #dfe3e6;
      border-radius: 10px;
      outline: none;
      background: #ffffff;
      color: #23272d;
      font-size: 13px;
    }

    .writer-messages-form input,
    .writer-messages-form select {
      height: 42px;
      padding: 0 11px;
    }

    .writer-messages-form textarea {
      min-height: 118px;
      padding: 10px 11px;
      resize: vertical;
      line-height: 1.45;
    }

    .writer-messages-form-submit {
      height: 42px;
      border: 1px solid #1e2227;
      border-radius: 10px;
      background: #1e2227;
      color: #ffffff;
      cursor: pointer;
      font-size: 12px;
      font-weight: 750;
    }

    .writer-messages-form-submit:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .writer-messages-controls-copy {
      margin: 0 0 14px;
      color: #747c85;
      font-size: 12px;
      line-height: 1.55;
    }

    .writer-messages-close-chat {
      width: 100%;
      min-height: 42px;
      margin-top: 14px;
      border: 1px solid #e4b9bd;
      border-radius: 10px;
      background: #fff6f7;
      color: #a32935;
      cursor: pointer;
      font-size: 12px;
      font-weight: 750;
    }

    .writer-messages-mobile-fab {
      display: none;
    }

    @media (max-width: 900px) {
      .writer-messages-page {
        grid-template-columns: 286px minmax(0, 1fr);
      }
    }

    @media (max-width: 767px) {
      .writer-messages-page {
        width: 100%;
        height: calc(100dvh - 60px);
        min-height: 560px;
        margin: 0;
        display: block;
        overflow: hidden;
        border-top: 0;
      }

      .writer-messages-inbox {
        width: 100%;
        height: 100%;
        border-right: 0;
      }

      .writer-messages-inbox-head {
        padding: 14px 12px 11px;
      }

      .writer-messages-inbox-actions .writer-messages-icon-button.primary {
        display: none;
      }

      .writer-messages-search {
        margin-top: 11px;
      }

      .writer-messages-list {
        padding-bottom: 72px;
      }

      .writer-messages-row {
        min-height: 74px;
        padding: 11px 12px;
        grid-template-columns: 42px minmax(0, 1fr) auto;
      }

      .writer-messages-thread {
        display: none;
      }

      .writer-messages-page.mobile-chat-open .writer-messages-thread {
        position: fixed;
        inset: 0;
        z-index: 5000;
        width: 100vw;
        height: 100dvh;
        display: flex;
        background: #f7f8f9;
      }

      .writer-messages-thread-head {
        min-height: 58px;
        padding: 8px 10px;
      }

      .writer-messages-mobile-back {
        width: 34px;
        height: 34px;
        padding: 0;
        border: 0;
        background: transparent;
        color: #292e34;
        display: grid;
        place-items: center;
        cursor: pointer;
        font-size: 20px;
      }

      .writer-messages-thread-person {
        gap: 8px;
        flex: 1;
      }

      .writer-messages-thread-person .writer-messages-avatar {
        width: 34px;
        height: 34px;
      }

      .writer-messages-thread-body {
        padding: 18px 11px 14px;
        gap: 8px;
      }

      .writer-message-wrap {
        max-width: 82%;
      }

      .writer-message-bubble {
        padding: 9px 11px;
        font-size: 13px;
      }

      .writer-messages-composer-wrap {
        padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
      }

      .writer-messages-composer {
        grid-template-columns: auto auto minmax(0, 1fr) auto;
        gap: 5px;
      }

      .writer-messages-compose-button {
        min-width: 36px;
        height: 38px;
        padding: 0 7px;
        font-size: 11px;
      }

      .writer-messages-compose-field {
        min-height: 38px;
        padding: 9px 10px;
      }

      .writer-messages-send {
        height: 38px;
        padding: 0 11px;
      }

      .writer-messages-emoji-panel {
        left: 8px;
        bottom: 58px;
      }

      .writer-messages-mobile-fab {
        position: absolute;
        right: 16px;
        bottom: 18px;
        z-index: 6;
        width: 48px;
        height: 48px;
        border: 0;
        border-radius: 999px;
        background: #1e2227;
        color: #ffffff;
        display: grid;
        place-items: center;
        cursor: pointer;
        box-shadow: 0 10px 22px rgba(20, 24, 29, 0.2);
        font-size: 22px;
      }

      .writer-messages-drawer-layer {
        z-index: 6000;
      }

      .writer-messages-drawer {
        width: 100%;
      }
    }

    @media (max-width: 390px) {
      .writer-messages-inbox-actions .writer-messages-icon-button:not(.primary) {
        min-width: 32px;
        padding: 0 7px;
        font-size: 10px;
      }

      .writer-messages-compose-button {
        min-width: 34px;
        padding: 0 5px;
      }

      .writer-messages-send {
        padding: 0 9px;
      }
    }
  `}),s.jsxs("div",{className:`writer-messages-page${ke?" mobile-chat-open":""}`,children:[s.jsxs("aside",{className:"writer-messages-inbox","aria-label":"Conversations",children:[s.jsxs("div",{className:"writer-messages-inbox-head",children:[s.jsxs("div",{className:"writer-messages-inbox-title-row",children:[s.jsx("h2",{children:"Inbox"}),s.jsxs("div",{className:"writer-messages-inbox-actions",children:[s.jsx("button",{type:"button",className:"writer-messages-icon-button",onClick:()=>j("settings"),children:"Settings"}),s.jsx("button",{type:"button",className:"writer-messages-icon-button primary","aria-label":"New message",onClick:()=>me("customers"),children:"+"})]})]}),s.jsx("input",{className:"writer-messages-search",type:"search",value:te,onChange:e=>Se(e.target.value),placeholder:"Search conversations","aria-label":"Search conversations"}),s.jsxs("div",{className:"writer-messages-tabs",role:"tablist","aria-label":"Conversation type",children:[s.jsx("button",{type:"button",className:`writer-messages-tab${n==="customers"?" active":""}`,onClick:()=>ge("customers"),children:"Readers"}),s.jsx("button",{type:"button",className:`writer-messages-tab${n==="admin"?" active":""}`,onClick:()=>ge("admin"),children:"Admin"})]})]}),s.jsx("div",{className:"writer-messages-list",children:G?s.jsx("div",{className:"writer-messages-list-state",children:"Loading conversations..."}):ce.length?ce.map(e=>{const r=H(e),t=le(e),o=Math.max(0,Number((e==null?void 0:e.unread_count)||0));return s.jsxs("button",{type:"button",className:`writer-messages-row${p===e.id?" active":""}`,onClick:()=>Ce(e.id),children:[s.jsx("span",{className:"writer-messages-avatar","aria-hidden":"true",children:pe(r)}),s.jsxs("span",{className:"writer-messages-row-copy",children:[s.jsx("strong",{children:r}),s.jsx("span",{children:t})]}),s.jsxs("span",{className:"writer-messages-row-meta",children:[s.jsx("span",{children:Ne((e==null?void 0:e.last_message_at)||(e==null?void 0:e.updated_at)||(e==null?void 0:e.created_at))}),o>0?s.jsx("span",{className:"writer-messages-unread",children:o>99?"99+":o}):null]})]},`${n}-${e.id}`)}):s.jsx("div",{className:"writer-messages-list-state",children:K?"No matching conversations.":"No conversations yet."})}),s.jsx("button",{type:"button",className:"writer-messages-mobile-fab","aria-label":"New message",onClick:()=>me("customers"),children:"+"})]}),s.jsx("section",{className:"writer-messages-thread","aria-label":"Active conversation",children:p?s.jsxs(s.Fragment,{children:[s.jsxs("header",{className:"writer-messages-thread-head",children:[s.jsxs("div",{className:"writer-messages-thread-person",children:[s.jsx("button",{type:"button",className:"writer-messages-mobile-back","aria-label":"Back to inbox",onClick:()=>{z(!1),C(!1)},children:"<"}),s.jsx("span",{className:"writer-messages-avatar","aria-hidden":"true",children:pe(fe)}),s.jsxs("span",{className:"writer-messages-thread-copy",children:[s.jsx("strong",{children:fe}),s.jsx("span",{children:_e})]})]}),s.jsx("button",{type:"button",className:"writer-messages-thread-more","aria-label":"Conversation controls",onClick:()=>j("controls"),children:"..."})]}),E?s.jsx("div",{className:"writer-messages-error",children:E}):null,s.jsx("div",{className:"writer-messages-thread-body",children:V?s.jsx("div",{className:"writer-messages-thread-state",children:"Loading conversation..."}):B.length?B.map((e,r)=>{const t=(e==null?void 0:e.sender_role)==="affiliate";return s.jsx("div",{className:`writer-message-line${t?" mine":""}`,children:s.jsxs("div",{className:"writer-message-wrap",children:[s.jsx("div",{className:"writer-message-bubble",children:(e==null?void 0:e.message)||""}),s.jsx("div",{className:"writer-message-time",children:he(e==null?void 0:e.created_at)})]})},(e==null?void 0:e.id)||`${(e==null?void 0:e.created_at)||"message"}-${r}`)}):s.jsx("div",{className:"writer-messages-thread-state",children:"No messages yet. Start the conversation below."})}),s.jsxs("div",{className:"writer-messages-composer-wrap",children:[ie?s.jsx("div",{className:"writer-messages-emoji-panel","aria-label":"Emoji picker",children:Re.map(e=>s.jsx("button",{type:"button",onClick:()=>ze(e),"aria-label":`Insert emoji ${e}`,children:String.fromCodePoint(e)},e))}):null,s.jsxs("form",{className:"writer-messages-composer",onSubmit:ae,children:[s.jsx("button",{type:"button",className:"writer-messages-compose-button","aria-label":"Choose emoji","aria-expanded":ie,onClick:()=>C(e=>!e),children:":)"}),s.jsx("button",{type:"button",className:"writer-messages-compose-button","aria-label":"Attach file",title:"File attachments are not available yet.",disabled:!0,children:"Attach"}),s.jsx("textarea",{className:"writer-messages-compose-field",rows:1,value:h,onChange:e=>F(e.target.value),onKeyDown:e=>{var r,t;e.key==="Enter"&&!e.shiftKey&&!((r=e.nativeEvent)!=null&&r.isComposing)&&(e.preventDefault(),!y&&h.trim()&&((t=e.currentTarget.form)==null||t.requestSubmit()))},placeholder:"Message...","aria-label":"Message"}),s.jsx("button",{type:"submit",className:"writer-messages-send",disabled:y||!h.trim(),children:y?"Sending...":"Send"})]})]})]}):s.jsx("div",{className:"writer-messages-thread-state",children:"Choose a conversation from the inbox or start a new message."})})]}),u?s.jsx("div",{className:"writer-messages-drawer-layer",role:"presentation",onMouseDown:e=>{e.target===e.currentTarget&&j("")},children:s.jsxs("aside",{className:"writer-messages-drawer",role:"dialog","aria-modal":"true","aria-label":u==="new"?"New message":u==="settings"?"Message settings":"Conversation controls",children:[s.jsxs("header",{className:"writer-messages-drawer-head",children:[s.jsx("h3",{children:u==="new"?"New message":u==="settings"?"Message policy":"Conversation controls"}),s.jsx("button",{type:"button",className:"writer-messages-drawer-close","aria-label":"Close",onClick:()=>j(""),children:"x"})]}),s.jsxs("div",{className:"writer-messages-drawer-body",children:[u==="new"?s.jsxs(s.Fragment,{children:[s.jsxs("div",{className:"writer-messages-drawer-tabs",children:[s.jsx("button",{type:"button",className:`writer-messages-tab${P==="customers"?" active":""}`,onClick:()=>q("customers"),children:"Reader"}),s.jsx("button",{type:"button",className:`writer-messages-tab${P==="admin"?" active":""}`,onClick:()=>q("admin"),children:"Admin"})]}),P==="customers"?s.jsxs("form",{className:"writer-messages-form",onSubmit:ne,children:[s.jsxs("label",{children:["Reader",s.jsxs("select",{value:m.customer_id,onChange:e=>v(r=>({...r,customer_id:e.target.value})),children:[s.jsx("option",{value:"",children:"Choose a Reader"}),O.map(e=>s.jsx("option",{value:e.id,children:(e==null?void 0:e.name)||"Reader"},e.id))]})]}),s.jsxs("label",{children:["Subject",s.jsx("input",{type:"text",value:m.subject,onChange:e=>v(r=>({...r,subject:e.target.value})),placeholder:"Optional"})]}),s.jsxs("label",{children:["Message",s.jsx("textarea",{value:m.message,onChange:e=>v(r=>({...r,message:e.target.value})),placeholder:"Write your first message..."})]}),s.jsx("button",{type:"submit",className:"writer-messages-form-submit",disabled:D||!m.customer_id||!m.message.trim(),children:D?"Starting...":"Start conversation"})]}):s.jsxs("form",{className:"writer-messages-form",onSubmit:de,children:[s.jsxs("label",{children:["Subject",s.jsx("input",{type:"text",value:x.subject,onChange:e=>_(r=>({...r,subject:e.target.value})),placeholder:"Optional"})]}),s.jsxs("label",{children:["Message",s.jsx("textarea",{value:x.message,onChange:e=>_(r=>({...r,message:e.target.value})),placeholder:"Write your first message..."})]}),s.jsx("button",{type:"submit",className:"writer-messages-form-submit",disabled:I||!x.message.trim(),children:I?"Starting...":"Start admin conversation"})]})]}):null,u==="settings"?s.jsx(be,{}):null,u==="controls"?s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"writer-messages-controls-copy",children:"Manage this conversation without taking space away from your message history."}),n==="customers"&&(i!=null&&i.id)?s.jsx(we,{chatId:i.id,participantRole:"writer",onChanged:S}):null,p?s.jsx("button",{type:"button",className:"writer-messages-close-chat",onClick:oe,children:"Close conversation"}):null]}):null]})]})}):null]})}const Q={width:"100%",border:"1px solid #d1d5db",borderRadius:14,padding:14,outline:"none",color:"#111827",background:"#ffffff"},X={width:"100%",border:"1px solid #d1d5db",borderRadius:14,padding:14,resize:"vertical",outline:"none",color:"#111827",background:"#ffffff"},Y={border:0,borderRadius:14,padding:"12px 18px",background:"#111827",color:"#fff",fontWeight:700};export{Be as default};
