import{e as w,r as l,j as e,L as f}from"./index-LXBBJt7I.js";import{R as C}from"./ReaderUnifiedShell-Bcc4SCGW.js";import"./sparkles-BjsvwlsL.js";import"./crown-CqvQp2si.js";import"./external-link-CIrc7yHB.js";function z(){return localStorage.getItem("customerToken")||localStorage.getItem("authToken")||localStorage.getItem("token")||""}function R(){try{const s=localStorage.getItem("customerUser")||localStorage.getItem("user")||"";return s?JSON.parse(s):null}catch{return null}}function v(s,r="USD"){const i=Number(s||0);try{return new Intl.NumberFormat("en-US",{style:"currency",currency:r||"USD",maximumFractionDigits:2}).format(i)}catch{return`${r||"USD"} ${i.toFixed(2)}`}}function T({value:s}){const r=String(s||"draft").toLowerCase();let i="#f3f4f6",n="#374151";return r==="approved"?(i="#ecfdf5",n="#166534"):r==="pending"?(i="#eff6ff",n="#1d4ed8"):r==="rejected"?(i="#fff1f2",n="#be123c"):r==="paused"&&(i="#fff7ed",n="#c2410c"),e.jsx("span",{style:{minHeight:32,padding:"0 12px",borderRadius:999,background:i,color:n,display:"inline-flex",alignItems:"center",fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.08em"},children:s||"draft"})}function E(){const s=w(),r=l.useMemo(()=>z(),[]);l.useMemo(()=>R(),[]);const[i,n]=l.useState(!0),[m,g]=l.useState(""),[a,j]=l.useState(null),[h,S]=l.useState([]);return l.useEffect(()=>{if(!r){s("/customer/login",{replace:!0});return}let t=!0;async function k(){n(!0),g("");try{const[c,y]=await Promise.all([fetch("/api/customer/advertiser/campaigns",{method:"GET",headers:{Authorization:`Bearer ${r}`},credentials:"include"}),fetch("/api/customer/advertiser/wallet",{method:"GET",headers:{Authorization:`Bearer ${r}`},credentials:"include"})]),[o,d]=await Promise.all([c.json(),y.json()]);if(!c.ok||!(o!=null&&o.ok))throw new Error((o==null?void 0:o.message)||"Failed to load campaigns.");if(!y.ok||!(d!=null&&d.ok))throw new Error((d==null?void 0:d.message)||"Failed to load wallet.");if(!t)return;S((o==null?void 0:o.campaigns)||[]),j((d==null?void 0:d.wallet)||null)}catch(c){if(!t)return;g(c.message||"Failed to load campaigns.")}finally{t&&n(!1)}}return k(),()=>{t=!1}},[s,r]),e.jsx(C,{title:"Campaigns",subtitle:"Advertiser",children:e.jsxs("div",{className:"reader-advertiser-campaigns-page",children:[e.jsx("style",{children:`
        .reader-advertiser-campaigns-page {
          width: min(1220px, calc(100% - 64px));
          margin: 0 auto;
          padding: 24px 0 48px;
        }

        .customer-advertiser-campaigns-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 0;
          align-items: start;
        }

        .customer-advertiser-campaigns-list-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .customer-advertiser-campaigns-list-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .customer-advertiser-campaigns-back-link {
          min-height: 38px;
          padding: 0 4px;
          display: inline-flex;
          align-items: center;
          color: #64748b;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
        }

        .customer-advertiser-campaigns-create-link {
          min-height: 38px;
          padding: 0 15px;
          border-radius: 10px;
          background: #111827;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
        }

        @media (max-width: 767px) {
          .reader-advertiser-campaigns-page {
            width: calc(100% - 16px);
            margin: 0 8px;
            padding: 16px 0 32px;
          }

          .customer-advertiser-campaigns-list-head {
            align-items: flex-start;
          }

          .customer-advertiser-campaigns-list-actions {
            width: 100%;
            justify-content: space-between;
          }

          .customer-advertiser-campaigns-create-link {
            min-height: 40px;
            padding: 0 14px;
          }
        }
      `}),e.jsx("div",{style:{width:"100%",maxWidth:1280,margin:"0 auto"},children:e.jsx("div",{className:"customer-advertiser-campaigns-layout",children:e.jsxs("main",{style:{display:"grid",gap:24},children:[m?e.jsx("div",{style:{borderRadius:20,border:"1px solid #fecaca",background:"#fff1f2",padding:"16px 18px",fontSize:14,color:"#be123c"},children:m}):null,i?e.jsx("div",{style:{borderRadius:20,border:"1px solid #e5e7eb",background:"#ffffff",padding:"18px 20px",fontSize:14,color:"#6b7280"},children:"Loading campaigns..."}):null,e.jsxs("section",{style:{borderRadius:24,border:"1px solid #e5e7eb",background:"#ffffff",padding:20,boxShadow:"0 18px 45px rgba(15, 23, 42, 0.05)"},children:[e.jsxs("div",{className:"customer-advertiser-campaigns-list-head",children:[e.jsx("div",{style:{fontSize:24,fontWeight:800,letterSpacing:"-0.03em",color:"#111827"},children:"Campaign list"}),e.jsxs("div",{className:"customer-advertiser-campaigns-list-actions",children:[e.jsx(f,{to:"/customer/advertiser",className:"customer-advertiser-campaigns-back-link",children:"Back to Advertiser"}),e.jsx(f,{to:"/customer/advertiser/campaigns/create",className:"customer-advertiser-campaigns-create-link",children:"+ Create Campaign"})]})]}),e.jsx("div",{style:{marginTop:20,display:"grid",gap:14},children:h.length?h.map(t=>e.jsxs("div",{style:{borderRadius:18,border:"1px solid #e5e7eb",background:"#f8fafc",padding:18},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap",alignItems:"flex-start"},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:18,fontWeight:700,color:"#111827"},children:(t==null?void 0:t.campaign_name)||"Untitled Campaign"}),e.jsxs("div",{style:{marginTop:6,fontSize:14,color:"#6b7280"},children:[(t==null?void 0:t.campaign_type)||"banner"," • ",(t==null?void 0:t.buying_model)||"cpc"," • ",(t==null?void 0:t.objective)||"traffic"]})]}),e.jsx(T,{value:(t==null?void 0:t.approval_status)||"draft"})]}),e.jsxs("div",{style:{marginTop:16,display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))",gap:14},children:[e.jsxs("div",{style:u,children:[e.jsx("div",{style:p,children:"Budget"}),e.jsx("div",{style:x,children:v((t==null?void 0:t.budget_total)||0,(a==null?void 0:a.currency_code)||"USD")})]}),e.jsxs("div",{style:u,children:[e.jsx("div",{style:p,children:"Spent"}),e.jsx("div",{style:x,children:v((t==null?void 0:t.spent_amount)||0,(a==null?void 0:a.currency_code)||"USD")})]}),e.jsxs("div",{style:u,children:[e.jsx("div",{style:p,children:"Clicks"}),e.jsx("div",{style:x,children:(t==null?void 0:t.clicks_count)||0})]}),e.jsxs("div",{style:u,children:[e.jsx("div",{style:p,children:"Impressions"}),e.jsx("div",{style:x,children:(t==null?void 0:t.impressions_count)||0})]})]}),e.jsxs("div",{style:{marginTop:16,display:"flex",gap:12,flexWrap:"wrap"},children:[e.jsx(f,{to:`/customer/advertiser/campaigns/${t.id}`,style:b,children:"Open Campaign"}),e.jsx(f,{to:`/customer/advertiser/campaigns/${t.id}/creatives`,style:b,children:"Manage Creatives"})]})]},t.id)):e.jsx("div",{style:{borderRadius:18,border:"1px solid #e5e7eb",background:"#f8fafc",padding:16,color:"#6b7280",fontSize:14},children:"No campaigns yet."})})]})]})})})]})})}const b={display:"inline-flex",alignItems:"center",justifyContent:"center",minHeight:48,padding:"0 18px",borderRadius:16,border:"1px solid #d1d5db",background:"#ffffff",color:"#111827",fontSize:14,fontWeight:700,textDecoration:"none"},u={borderRadius:16,border:"1px solid #e5e7eb",background:"#ffffff",padding:14},p={fontSize:12,textTransform:"uppercase",letterSpacing:"0.14em",color:"#6b7280",fontWeight:800},x={marginTop:10,fontSize:15,fontWeight:600,color:"#111827"};export{E as default};
