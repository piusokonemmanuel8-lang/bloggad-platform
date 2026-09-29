import{r as c,j as e,a as B}from"./index-LXBBJt7I.js";function S(d){const o=Number(d||0);try{return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2}).format(o)}catch{return`USD ${o.toFixed(2)}`}}function N(d){if(!d)return"-";const o=new Date(d);return Number.isNaN(o.getTime())?"-":o.toLocaleString()}function M(d){const o=String(d||"pending").toLowerCase();return o==="approved"?{background:"#eff6ff",color:"#1d4ed8",border:"#bfdbfe"}:o==="paid"?{background:"#ecfdf5",color:"#166534",border:"#bbf7d0"}:o==="rejected"?{background:"#fff1f2",color:"#be123c",border:"#fecdd3"}:{background:"#fff7ed",color:"#c2410c",border:"#fed7aa"}}function H({status:d}){const o=M(d);return e.jsx("span",{style:{display:"inline-flex",alignItems:"center",minHeight:30,padding:"0 11px",borderRadius:999,background:o.background,color:o.color,border:`1px solid ${o.border}`,fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.06em"},children:d||"pending"})}function j({label:d,value:o,helper:p}){return e.jsxs("div",{style:{background:"#ffffff",border:"1px solid #e5e7eb",borderRadius:18,padding:18,minWidth:0},children:[e.jsx("div",{style:{color:"#6b7280",fontSize:13,fontWeight:600},children:d}),e.jsx("div",{style:{marginTop:8,color:"#111827",fontSize:27,fontWeight:800,letterSpacing:"-0.03em"},children:o}),p?e.jsx("div",{style:{marginTop:6,color:"#9ca3af",fontSize:12,lineHeight:1.5},children:p}):null]})}function h({label:d,value:o,mono:p=!1}){return e.jsxs("div",{style:{border:"1px solid #e5e7eb",borderRadius:14,background:"#f9fafb",padding:13,minWidth:0},children:[e.jsx("div",{style:{color:"#6b7280",fontSize:11,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase"},children:d}),e.jsx("div",{style:{marginTop:7,color:"#111827",fontSize:14,fontWeight:600,lineHeight:1.5,wordBreak:"break-word",fontFamily:p?"monospace":"inherit",whiteSpace:"pre-wrap"},children:o||"-"})]})}function Y(){const[d,o]=c.useState(!0),[p,z]=c.useState(null),[A,g]=c.useState(""),[_,T]=c.useState(""),[u,F]=c.useState([]),[b,L]=c.useState(""),[W,E]=c.useState(""),[n,y]=c.useState(null);async function v(r=b){var t,l;o(!0),g("");try{const i=new URLSearchParams;r&&i.set("status",r);const{data:a}=await B.get(`/api/admin/writer-finance/withdrawals${i.toString()?`?${i.toString()}`:""}`);if(!(a!=null&&a.ok))throw new Error((a==null?void 0:a.message)||"Failed to load Writer withdrawals.");const f=Array.isArray(a==null?void 0:a.withdrawals)?a.withdrawals:[];if(F(f),n){const m=f.find(s=>Number(s==null?void 0:s.id)===Number(n==null?void 0:n.id));y(m||null)}}catch(i){g(((l=(t=i==null?void 0:i.response)==null?void 0:t.data)==null?void 0:l.message)||(i==null?void 0:i.message)||"Failed to load Writer withdrawals.")}finally{o(!1)}}c.useEffect(()=>{v("")},[]);const k=c.useMemo(()=>{const r=W.trim().toLowerCase();return r?u.filter(t=>[t==null?void 0:t.id,t==null?void 0:t.writer_name,t==null?void 0:t.writer_email,t==null?void 0:t.payment_method,t==null?void 0:t.payment_details,t==null?void 0:t.status,t==null?void 0:t.admin_note].map(l=>String(l||"").toLowerCase()).some(l=>l.includes(r))):u},[W,u]),w=c.useMemo(()=>{const r=u.filter(a=>(a==null?void 0:a.status)==="pending"),t=u.filter(a=>(a==null?void 0:a.status)==="approved"),l=u.filter(a=>(a==null?void 0:a.status)==="paid"),i=u.filter(a=>(a==null?void 0:a.status)==="rejected");return{pendingCount:r.length,approvedCount:t.length,paidCount:l.length,rejectedCount:i.length,pendingAmount:r.reduce((a,f)=>a+Number((f==null?void 0:f.amount)||0),0)}},[u]);async function x(r,t){var f,m;const l=t==="approve"?"approve":t==="paid"?"mark paid":"reject";if(!window.confirm(`Confirm ${l} for withdrawal #${r.id} (${S(r.amount)})?`))return;const a=window.prompt(t==="reject"?"Enter the rejection reason or Admin note":"Optional Admin note",(r==null?void 0:r.admin_note)||"");if(a!==null){if(t==="reject"&&!String(a||"").trim()){g("A rejection reason is required before rejecting a withdrawal.");return}z(r.id),g(""),T("");try{const{data:s}=await B.patch(`/api/admin/writer-finance/withdrawals/${r.id}/${t}`,{admin_note:String(a||"").trim()});if(!(s!=null&&s.ok))throw new Error((s==null?void 0:s.message)||"Failed to review Writer withdrawal.");T((s==null?void 0:s.message)||"Writer withdrawal updated."),await v(b)}catch(s){g(((m=(f=s==null?void 0:s.response)==null?void 0:f.data)==null?void 0:m.message)||(s==null?void 0:s.message)||"Failed to review Writer withdrawal.")}finally{z(null)}}}return e.jsxs("div",{className:"admin-writer-withdrawals-page",children:[e.jsx("style",{children:`
        .admin-writer-withdrawals-page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 20px 16px 42px;
          color: #111827;
        }

        .aww-shell {
          width: 100%;
          max-width: 1380px;
          margin: 0 auto;
          display: grid;
          gap: 18px;
        }

        .aww-topbar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
        }

        .aww-stats {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
        }

        .aww-filters {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 210px auto;
          gap: 10px;
        }

        .aww-table-wrap {
          overflow-x: auto;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          background: #ffffff;
        }

        .aww-table {
          width: 100%;
          min-width: 980px;
          border-collapse: collapse;
        }

        .aww-table th {
          text-align: left;
          padding: 13px 14px;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
          color: #6b7280;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .aww-table td {
          padding: 15px 14px;
          border-bottom: 1px solid #f0f2f5;
          vertical-align: top;
          font-size: 14px;
        }

        .aww-table tr:last-child td {
          border-bottom: 0;
        }

        .aww-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .aww-drawer-overlay {
          position: fixed;
          inset: 0;
          z-index: 500;
          background: rgba(15, 23, 42, 0.42);
          display: flex;
          justify-content: flex-end;
        }

        .aww-drawer {
          width: min(560px, 94vw);
          height: 100%;
          overflow-y: auto;
          background: #ffffff;
          color: #111827;
          box-shadow: -20px 0 60px rgba(15, 23, 42, 0.18);
          padding: 22px;
        }

        .aww-info-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        @media (max-width: 1180px) {
          .aww-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .admin-writer-withdrawals-page {
            padding: 14px 10px 28px;
          }

          .aww-stats,
          .aww-filters,
          .aww-info-grid {
            grid-template-columns: 1fr;
          }

          .aww-drawer {
            width: 100%;
          }
        }
      `}),e.jsxs("div",{className:"aww-shell",children:[e.jsx("section",{style:{background:"#ffffff",border:"1px solid #e5e7eb",borderRadius:20,padding:20},children:e.jsxs("div",{className:"aww-topbar",children:[e.jsxs("div",{children:[e.jsx("div",{style:{color:"#6b7280",fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.1em"},children:"Writer Finance"}),e.jsx("h1",{style:{margin:"7px 0 0",fontSize:30,lineHeight:1.15,letterSpacing:"-0.03em"},children:"Writer Withdrawals"}),e.jsx("p",{style:{margin:"9px 0 0",color:"#6b7280",fontSize:14,lineHeight:1.7,maxWidth:760},children:"Review Writer payout requests, approve valid requests, mark completed payouts as paid, or reject a request and restore its reserved balance."})]}),e.jsx("button",{type:"button",onClick:()=>v(b),disabled:d,style:R,children:d?"Refreshing...":"Refresh"})]})}),A?e.jsx("div",{style:K,children:A}):null,_?e.jsx("div",{style:Q,children:_}):null,e.jsxs("div",{className:"aww-stats",children:[e.jsx(j,{label:"Pending",value:w.pendingCount,helper:S(w.pendingAmount)}),e.jsx(j,{label:"Approved",value:w.approvedCount,helper:"Waiting to be paid"}),e.jsx(j,{label:"Paid",value:w.paidCount,helper:"Completed payouts"}),e.jsx(j,{label:"Rejected",value:w.rejectedCount,helper:"Returned to Writer balance"}),e.jsx(j,{label:"Loaded",value:u.length,helper:"Maximum 500 newest requests"})]}),e.jsx("section",{style:{background:"#ffffff",border:"1px solid #e5e7eb",borderRadius:18,padding:16},children:e.jsxs("div",{className:"aww-filters",children:[e.jsx("input",{value:W,onChange:r=>E(r.target.value),placeholder:"Search writer, email, ID, payment method or details",style:P}),e.jsxs("select",{value:b,onChange:r=>L(r.target.value),style:P,children:[e.jsx("option",{value:"",children:"All statuses"}),e.jsx("option",{value:"pending",children:"Pending"}),e.jsx("option",{value:"approved",children:"Approved"}),e.jsx("option",{value:"paid",children:"Paid"}),e.jsx("option",{value:"rejected",children:"Rejected"})]}),e.jsx("button",{type:"button",onClick:()=>v(b),disabled:d,style:U,children:"Apply"})]})}),e.jsxs("section",{style:{background:"#ffffff",border:"1px solid #e5e7eb",borderRadius:18,padding:16},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",marginBottom:14},children:[e.jsx("div",{style:{fontSize:20,fontWeight:800},children:"Withdrawal requests"}),e.jsxs("div",{style:{color:"#6b7280",fontSize:13},children:[k.length," visible"]})]}),d?e.jsx("div",{style:I,children:"Loading Writer withdrawals..."}):k.length?e.jsx("div",{className:"aww-table-wrap",children:e.jsxs("table",{className:"aww-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"ID"}),e.jsx("th",{children:"Writer"}),e.jsx("th",{children:"Amount"}),e.jsx("th",{children:"Payment"}),e.jsx("th",{children:"Requested"}),e.jsx("th",{children:"Status"}),e.jsx("th",{children:"Actions"})]})}),e.jsx("tbody",{children:k.map(r=>{const t=Number(p)===Number(r.id),l=(r==null?void 0:r.status)==="pending",i=(r==null?void 0:r.status)==="pending"||(r==null?void 0:r.status)==="approved",a=(r==null?void 0:r.status)==="pending"||(r==null?void 0:r.status)==="approved";return e.jsxs("tr",{children:[e.jsx("td",{children:e.jsxs("strong",{children:["#",r.id]})}),e.jsxs("td",{children:[e.jsx("div",{style:{fontWeight:700},children:(r==null?void 0:r.writer_name)||"Writer"}),e.jsx("div",{style:{marginTop:4,color:"#6b7280",fontSize:12},children:(r==null?void 0:r.writer_email)||"-"})]}),e.jsx("td",{children:e.jsx("strong",{children:S(r==null?void 0:r.amount)})}),e.jsxs("td",{children:[e.jsx("div",{style:{fontWeight:600},children:(r==null?void 0:r.payment_method)||"-"}),e.jsx("div",{style:{marginTop:4,color:"#6b7280",fontSize:12,maxWidth:220,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},title:(r==null?void 0:r.payment_details)||"",children:(r==null?void 0:r.payment_details)||"-"})]}),e.jsx("td",{children:N(r==null?void 0:r.created_at)}),e.jsx("td",{children:e.jsx(H,{status:r==null?void 0:r.status})}),e.jsx("td",{children:e.jsxs("div",{className:"aww-actions",children:[e.jsx("button",{type:"button",onClick:()=>y(r),style:O,children:"View"}),l?e.jsx("button",{type:"button",onClick:()=>x(r,"approve"),disabled:t,style:V,children:t?"Working...":"Approve"}):null,i?e.jsx("button",{type:"button",onClick:()=>x(r,"paid"),disabled:t,style:G,children:t?"Working...":"Mark Paid"}):null,a?e.jsx("button",{type:"button",onClick:()=>x(r,"reject"),disabled:t,style:J,children:t?"Working...":"Reject"}):null]})})]},r.id)})})]})}):e.jsx("div",{style:I,children:"No Writer withdrawal requests found."})]})]}),n?e.jsx("div",{className:"aww-drawer-overlay",role:"presentation",onMouseDown:r=>{r.target===r.currentTarget&&y(null)},children:e.jsxs("aside",{className:"aww-drawer",role:"dialog","aria-modal":"true","aria-label":`Writer withdrawal ${n.id}`,children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:14},children:[e.jsxs("div",{children:[e.jsxs("div",{style:{color:"#6b7280",fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.08em"},children:["Withdrawal #",n.id]}),e.jsx("div",{style:{marginTop:7,fontSize:27,fontWeight:800,letterSpacing:"-0.03em"},children:S(n==null?void 0:n.amount)}),e.jsx("div",{style:{marginTop:9},children:e.jsx(H,{status:n==null?void 0:n.status})})]}),e.jsx("button",{type:"button",onClick:()=>y(null),style:R,children:"Close"})]}),e.jsxs("div",{style:{marginTop:22},className:"aww-info-grid",children:[e.jsx(h,{label:"Writer",value:n==null?void 0:n.writer_name}),e.jsx(h,{label:"Writer Email",value:n==null?void 0:n.writer_email}),e.jsx(h,{label:"Payment Method",value:n==null?void 0:n.payment_method}),e.jsx(h,{label:"Requested",value:N(n==null?void 0:n.created_at)}),e.jsx(h,{label:"Reviewed",value:N(n==null?void 0:n.reviewed_at)}),e.jsx(h,{label:"Reviewed By",value:n==null?void 0:n.reviewed_by})]}),e.jsxs("div",{style:{marginTop:10,display:"grid",gap:10},children:[e.jsx(h,{label:"Payment Details",value:(n==null?void 0:n.payment_details)||"No payment details supplied.",mono:!0}),e.jsx(h,{label:"Admin Note",value:(n==null?void 0:n.admin_note)||"No Admin note yet."})]}),(n==null?void 0:n.status)==="pending"||(n==null?void 0:n.status)==="approved"?e.jsxs("div",{style:{marginTop:22,borderTop:"1px solid #e5e7eb",paddingTop:18},children:[e.jsx("div",{style:{fontWeight:800,marginBottom:12,color:"#111827"},children:"Review actions"}),e.jsxs("div",{className:"aww-actions",children:[(n==null?void 0:n.status)==="pending"?e.jsx("button",{type:"button",onClick:()=>x(n,"approve"),disabled:Number(p)===Number(n.id),style:$,children:"Approve"}):null,e.jsx("button",{type:"button",onClick:()=>x(n,"paid"),disabled:Number(p)===Number(n.id),style:q,children:"Mark Paid"}),e.jsx("button",{type:"button",onClick:()=>x(n,"reject"),disabled:Number(p)===Number(n.id),style:D,children:"Reject"})]})]}):null]})}):null]})}const P={width:"100%",minHeight:42,borderRadius:10,border:"1px solid #d1d5db",background:"#ffffff",color:"#111827",padding:"0 12px",fontSize:14,outline:"none"},U={minHeight:42,border:0,borderRadius:10,background:"#111827",color:"#ffffff",padding:"0 17px",fontWeight:800,cursor:"pointer"},R={minHeight:40,border:"1px solid #d1d5db",borderRadius:10,background:"#ffffff",color:"#374151",padding:"0 14px",fontWeight:700,cursor:"pointer"},O={...R,minHeight:34,padding:"0 10px",fontSize:12},C={minHeight:36,borderRadius:9,padding:"0 12px",fontWeight:800,fontSize:12,cursor:"pointer"},$={...C,minHeight:42,border:"1px solid #bfdbfe",background:"#eff6ff",color:"#1d4ed8"},q={...C,minHeight:42,border:"1px solid #bbf7d0",background:"#ecfdf5",color:"#166534"},D={...C,minHeight:42,border:"1px solid #fecdd3",background:"#fff1f2",color:"#be123c"},V={...$,minHeight:34,padding:"0 10px"},G={...q,minHeight:34,padding:"0 10px"},J={...D,minHeight:34,padding:"0 10px"},I={border:"1px dashed #d1d5db",borderRadius:14,background:"#f9fafb",padding:20,color:"#6b7280",fontSize:14,textAlign:"center"},K={border:"1px solid #fecaca",borderRadius:14,background:"#fff1f2",padding:"13px 15px",color:"#be123c",fontSize:14},Q={border:"1px solid #bbf7d0",borderRadius:14,background:"#ecfdf5",padding:"13px 15px",color:"#166534",fontSize:14};export{Y as default};
