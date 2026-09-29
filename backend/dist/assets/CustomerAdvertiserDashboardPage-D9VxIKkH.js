import{f as L,r as b,j as e,L as x}from"./index-D7wY-Nn2.js";import{R as U}from"./ReaderUnifiedShell-CcGKzkmA.js";import"./sparkles-DniX3uPT.js";import"./crown-9tuqvcLd.js";function T(){return localStorage.getItem("customerToken")||localStorage.getItem("authToken")||localStorage.getItem("token")||""}function m(l,r="USD"){const t=Number(l||0);try{return new Intl.NumberFormat("en-US",{style:"currency",currency:r||"USD",maximumFractionDigits:2}).format(t)}catch{return`${r||"USD"} ${t.toFixed(2)}`}}function j({label:l,value:r,subtext:t}){return e.jsxs("div",{className:"advertiser-dashboard-stat-card",children:[e.jsx("div",{className:"advertiser-dashboard-stat-label",children:l}),e.jsx("div",{className:"advertiser-dashboard-stat-value",children:r}),t?e.jsx("div",{className:"advertiser-dashboard-stat-subtext",children:t}):null]})}function k({value:l}){const r=String(l||"draft").toLowerCase();let t="advertiser-dashboard-status advertiser-dashboard-status-neutral";return r==="approved"||r==="paid"||r==="verified"?t="advertiser-dashboard-status advertiser-dashboard-status-positive":r==="pending"?t="advertiser-dashboard-status advertiser-dashboard-status-pending":r==="rejected"||r==="failed"?t="advertiser-dashboard-status advertiser-dashboard-status-danger":r==="paused"&&(t="advertiser-dashboard-status advertiser-dashboard-status-warning"),e.jsx("span",{className:t,children:l||"draft"})}function c({label:l,value:r}){return e.jsxs("div",{className:"advertiser-dashboard-detail-row",children:[e.jsx("span",{children:l}),e.jsx("strong",{children:r})]})}function V(){const l=L(),r=b.useMemo(()=>T(),[]),[t,w]=b.useState(!0),[z,_]=b.useState(""),[s,B]=b.useState(null),[d,E]=b.useState(null),[N,q]=b.useState([]),[f,F]=b.useState([]);b.useEffect(()=>{if(!r){l("/customer/login",{replace:!0});return}let a=!0;async function y(){w(!0),_("");try{const[u,i,P,R]=await Promise.all([fetch("/api/customer/advertiser/profile",{headers:{Authorization:`Bearer ${r}`},credentials:"include"}),fetch("/api/customer/advertiser/wallet",{headers:{Authorization:`Bearer ${r}`},credentials:"include"}),fetch("/api/customer/advertiser/payments",{headers:{Authorization:`Bearer ${r}`},credentials:"include"}),fetch("/api/customer/advertiser/campaigns",{headers:{Authorization:`Bearer ${r}`},credentials:"include"})]),[o,n,h,v]=await Promise.all([u.json(),i.json(),P.json(),R.json()]);if(!u.ok||!(o!=null&&o.ok))throw new Error((o==null?void 0:o.message)||"Failed to load advertiser profile.");if(!i.ok||!(n!=null&&n.ok))throw new Error((n==null?void 0:n.message)||"Failed to load advertiser wallet.");if(!P.ok||!(h!=null&&h.ok))throw new Error((h==null?void 0:h.message)||"Failed to load advertiser payments.");if(!R.ok||!(v!=null&&v.ok))throw new Error((v==null?void 0:v.message)||"Failed to load advertiser campaigns.");if(!a)return;B((o==null?void 0:o.advertiser_profile)||(n==null?void 0:n.advertiser_profile)||null),E((n==null?void 0:n.wallet)||(o==null?void 0:o.advertiser_wallet)||null),q((h==null?void 0:h.payments)||[]),F((v==null?void 0:v.campaigns)||[])}catch(u){if(!a)return;_(u.message||"Failed to load advertiser dashboard.")}finally{a&&w(!1)}}return y(),()=>{a=!1}},[l,r]);const g=b.useMemo(()=>{const a=f.filter(i=>(i==null?void 0:i.approval_status)==="approved").length,y=f.filter(i=>(i==null?void 0:i.approval_status)==="pending").length,u=N.filter(i=>(i==null?void 0:i.payment_status)==="paid").length;return{totalCampaigns:f.length,approvedCampaigns:a,pendingCampaigns:y,paidPayments:u}},[f,N]),p=(d==null?void 0:d.currency_code)||"USD",C=f.slice(0,8),S=N.slice(0,8),A=(s==null?void 0:s.verification_status)||"unverified";return e.jsxs(U,{title:"Advertiser",subtitle:"Advertiser",children:[e.jsx("style",{children:`
        .advertiser-dashboard-page {
          display: grid;
          gap: 16px;
          color: #0e121f;
        }

        .advertiser-dashboard-quickbar,
        .advertiser-dashboard-card,
        .advertiser-dashboard-stat-card {
          background: #ffffff;
          border: 1px solid #e6eaf0;
          box-shadow: none;
        }

        .advertiser-dashboard-quickbar {
          min-height: 60px;
          border-radius: 12px;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .advertiser-dashboard-overview-label {
          font-size: 15px;
          font-weight: 700;
        }

        .advertiser-dashboard-mobile-heading {
          display: none;
        }

        .advertiser-dashboard-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          flex-wrap: wrap;
        }

        .advertiser-dashboard-action {
          min-height: 36px;
          border-radius: 8px;
          border: 1px solid #e6eaf0;
          background: #ffffff;
          color: #0e121f;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 14px;
          white-space: nowrap;
        }

        .advertiser-dashboard-action-primary {
          min-width: 148px;
          border-color: #121727;
          background: #121727;
          color: #ffffff;
          font-weight: 700;
        }

        .advertiser-dashboard-alert {
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 13px;
          line-height: 1.5;
        }

        .advertiser-dashboard-alert-error {
          border: 1px solid #fecaca;
          background: #fff1f2;
          color: #be123c;
        }

        .advertiser-dashboard-alert-loading {
          border: 1px solid #e6eaf0;
          background: #ffffff;
          color: #748098;
        }

        .advertiser-dashboard-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .advertiser-dashboard-stat-card {
          min-height: 100px;
          border-radius: 12px;
          padding: 16px;
        }

        .advertiser-dashboard-stat-label {
          color: #748098;
          font-size: 12px;
        }

        .advertiser-dashboard-stat-value {
          margin-top: 7px;
          color: #0e121f;
          font-size: 24px;
          line-height: 1.15;
          font-weight: 800;
          letter-spacing: -0.03em;
          overflow-wrap: anywhere;
        }

        .advertiser-dashboard-stat-subtext {
          margin-top: 6px;
          color: #748098;
          font-size: 10px;
        }

        .advertiser-dashboard-body {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(290px, 1fr);
          gap: 16px;
          align-items: start;
        }

        .advertiser-dashboard-card {
          border-radius: 14px;
          padding: 18px;
          min-width: 0;
        }

        .advertiser-dashboard-campaigns {
          grid-column: 1;
          grid-row: 1 / span 2;
        }

        .advertiser-dashboard-wallet {
          grid-column: 2;
          grid-row: 1;
        }

        .advertiser-dashboard-profile {
          grid-column: 2;
          grid-row: 2;
        }

        .advertiser-dashboard-funding {
          grid-column: 1;
          grid-row: 3;
        }

        .advertiser-dashboard-card-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
        }

        .advertiser-dashboard-card-title {
          margin: 0;
          color: #0e121f;
          font-size: 16px;
          line-height: 1.25;
          font-weight: 700;
        }

        .advertiser-dashboard-card-hint {
          margin-top: 5px;
          color: #748098;
          font-size: 11px;
          line-height: 1.4;
        }

        .advertiser-dashboard-text-link {
          color: #1a5cd4;
          text-decoration: none;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .advertiser-dashboard-list {
          margin-top: 14px;
          display: grid;
          gap: 12px;
        }

        .advertiser-dashboard-campaign-item,
        .advertiser-dashboard-funding-item {
          border: 1px solid #e6eaf0;
          background: #f7f8fa;
          border-radius: 10px;
        }

        .advertiser-dashboard-campaign-item {
          padding: 14px;
        }

        .advertiser-dashboard-campaign-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .advertiser-dashboard-campaign-name {
          color: #0e121f;
          font-size: 14px;
          line-height: 1.35;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .advertiser-dashboard-campaign-meta {
          margin-top: 5px;
          color: #748098;
          font-size: 10px;
          text-transform: lowercase;
        }

        .advertiser-dashboard-status {
          min-height: 24px;
          border-radius: 999px;
          padding: 0 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          line-height: 1;
          font-weight: 800;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .advertiser-dashboard-status-positive {
          background: #ecfbf3;
          color: #166534;
        }

        .advertiser-dashboard-status-pending {
          background: #eff6ff;
          color: #1a5cd4;
        }

        .advertiser-dashboard-status-danger {
          background: #fff1f2;
          color: #be123c;
        }

        .advertiser-dashboard-status-warning {
          background: #fff7ed;
          color: #c2410c;
        }

        .advertiser-dashboard-status-neutral {
          background: #f5f6f9;
          color: #748098;
        }

        .advertiser-dashboard-metrics {
          margin-top: 17px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .advertiser-dashboard-metric-label {
          color: #748098;
          font-size: 9px;
          font-weight: 800;
        }

        .advertiser-dashboard-metric-value {
          margin-top: 5px;
          color: #0e121f;
          font-size: 13px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .advertiser-dashboard-detail-list {
          margin-top: 10px;
        }

        .advertiser-dashboard-detail-row {
          min-height: 57px;
          border-bottom: 1px solid #e6eaf0;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(120px, 0.8fr);
          align-items: center;
          gap: 14px;
          color: #748098;
          font-size: 10px;
        }

        .advertiser-dashboard-detail-row:last-child {
          border-bottom: 0;
        }

        .advertiser-dashboard-detail-row strong {
          color: #0e121f;
          font-size: 12px;
          line-height: 1.35;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .advertiser-dashboard-verification {
          margin-top: 14px;
        }

        .advertiser-dashboard-funding-item {
          min-height: 78px;
          padding: 12px 14px;
          display: grid;
          grid-template-columns: minmax(150px, 1fr) minmax(150px, 1fr) auto;
          align-items: center;
          gap: 14px;
        }

        .advertiser-dashboard-funding-amount {
          color: #0e121f;
          font-size: 14px;
          font-weight: 700;
        }

        .advertiser-dashboard-funding-provider,
        .advertiser-dashboard-funding-reference {
          margin-top: 5px;
          color: #748098;
          font-size: 10px;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        .advertiser-dashboard-empty {
          border: 1px solid #e6eaf0;
          background: #f7f8fa;
          border-radius: 10px;
          padding: 16px;
          color: #748098;
          font-size: 12px;
          line-height: 1.5;
        }

        @media (max-width: 1100px) {
          .advertiser-dashboard-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .advertiser-dashboard-body {
            grid-template-columns: 1fr;
          }

          .advertiser-dashboard-campaigns,
          .advertiser-dashboard-wallet,
          .advertiser-dashboard-profile,
          .advertiser-dashboard-funding {
            grid-column: 1;
            grid-row: auto;
          }
        }

        @media (max-width: 767px) {
          .advertiser-dashboard-page {
            gap: 10px;
          }

          .advertiser-dashboard-quickbar {
            min-height: 96px;
            padding: 12px 14px;
            display: block;
          }

          .advertiser-dashboard-overview-label {
            display: none;
          }

          .advertiser-dashboard-mobile-heading {
            display: block;
          }

          .advertiser-dashboard-mobile-title {
            font-size: 22px;
            line-height: 1.1;
            font-weight: 800;
            letter-spacing: -0.03em;
          }

          .advertiser-dashboard-mobile-subtitle {
            margin-top: 2px;
            color: #748098;
            font-size: 10px;
          }

          .advertiser-dashboard-actions {
            margin-top: 8px;
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 6px;
          }

          .advertiser-dashboard-action,
          .advertiser-dashboard-action-primary {
            min-width: 0;
            min-height: 34px;
            padding: 0 7px;
            font-size: 10px;
          }

          .advertiser-dashboard-action-primary {
            font-size: 0;
          }

          .advertiser-dashboard-action-primary::after {
            content: '+ Create';
            font-size: 10px;
          }

          .advertiser-dashboard-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }

          .advertiser-dashboard-stat-card {
            min-height: 74px;
            padding: 11px 12px;
          }

          .advertiser-dashboard-stat-label {
            font-size: 10px;
          }

          .advertiser-dashboard-stat-value {
            margin-top: 5px;
            font-size: 20px;
          }

          .advertiser-dashboard-stat-subtext {
            display: none;
          }

          .advertiser-dashboard-body {
            gap: 10px;
          }

          .advertiser-dashboard-card {
            border-radius: 12px;
            padding: 14px;
          }

          .advertiser-dashboard-campaigns { order: 1; }
          .advertiser-dashboard-wallet { order: 2; }
          .advertiser-dashboard-profile { order: 3; }
          .advertiser-dashboard-funding { order: 4; }

          .advertiser-dashboard-card-title {
            font-size: 15px;
          }

          .advertiser-dashboard-card-hint,
          .advertiser-dashboard-text-link {
            font-size: 10px;
          }

          .advertiser-dashboard-list {
            margin-top: 12px;
            gap: 8px;
          }

          .advertiser-dashboard-campaign-item {
            padding: 12px;
          }

          .advertiser-dashboard-campaign-name {
            font-size: 13px;
          }

          .advertiser-dashboard-campaign-meta {
            font-size: 9px;
          }

          .advertiser-dashboard-status {
            min-height: 22px;
            padding: 0 8px;
            font-size: 8px;
          }

          .advertiser-dashboard-metrics {
            margin-top: 16px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px 16px;
          }

          .advertiser-dashboard-metric-label {
            font-size: 8px;
          }

          .advertiser-dashboard-metric-value {
            margin-top: 3px;
            font-size: 11px;
          }

          .advertiser-dashboard-detail-row {
            min-height: 55px;
            grid-template-columns: minmax(0, 1fr) minmax(150px, 1.15fr);
            gap: 10px;
            font-size: 9px;
          }

          .advertiser-dashboard-detail-row strong {
            font-size: 11px;
          }

          .advertiser-dashboard-funding-item {
            min-height: 70px;
            padding: 10px 11px;
            grid-template-columns: minmax(90px, 1fr) minmax(90px, 1fr) auto;
            gap: 8px;
          }

          .advertiser-dashboard-funding-amount {
            font-size: 12px;
          }

          .advertiser-dashboard-funding-provider,
          .advertiser-dashboard-funding-reference {
            font-size: 9px;
          }
        }

        @media (max-width: 380px) {
          .advertiser-dashboard-actions {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .advertiser-dashboard-quickbar {
            min-height: 136px;
          }

          .advertiser-dashboard-detail-row {
            grid-template-columns: 1fr;
            gap: 4px;
            padding: 10px 0;
          }

          .advertiser-dashboard-funding-item {
            grid-template-columns: 1fr auto;
          }

          .advertiser-dashboard-funding-reference {
            grid-column: 1;
          }
        }
      `}),e.jsxs("main",{className:"advertiser-dashboard-page",children:[e.jsxs("section",{className:"advertiser-dashboard-quickbar",children:[e.jsx("div",{className:"advertiser-dashboard-overview-label",children:"Advertiser overview"}),e.jsxs("div",{className:"advertiser-dashboard-mobile-heading",children:[e.jsx("div",{className:"advertiser-dashboard-mobile-title",children:"Advertiser"}),e.jsx("div",{className:"advertiser-dashboard-mobile-subtitle",children:"Overview"})]}),e.jsxs("div",{className:"advertiser-dashboard-actions",children:[e.jsx(x,{className:"advertiser-dashboard-action",to:"/customer/advertiser/profile",children:"Profile"}),e.jsx(x,{className:"advertiser-dashboard-action",to:"/customer/advertiser/wallet",children:"Wallet"}),e.jsx(x,{className:"advertiser-dashboard-action",to:"/customer/advertiser/campaigns",children:"Campaigns"}),e.jsx(x,{className:"advertiser-dashboard-action advertiser-dashboard-action-primary",to:"/customer/advertiser/campaigns/create",children:"+ Create Campaign"})]})]}),z?e.jsx("div",{className:"advertiser-dashboard-alert advertiser-dashboard-alert-error",children:z}):null,t?e.jsx("div",{className:"advertiser-dashboard-alert advertiser-dashboard-alert-loading",children:"Loading advertiser dashboard..."}):null,e.jsxs("section",{className:"advertiser-dashboard-stats","aria-label":"Advertiser summary",children:[e.jsx(j,{label:"Available Balance",value:m((d==null?void 0:d.available_balance)||0,p),subtext:"Ready for campaigns"}),e.jsx(j,{label:"Total Campaigns",value:g.totalCampaigns,subtext:"All campaigns"}),e.jsx(j,{label:"Approved",value:g.approvedCampaigns,subtext:"Ready to run"}),e.jsx(j,{label:"Pending Review",value:g.pendingCampaigns,subtext:"Awaiting review"})]}),e.jsxs("section",{className:"advertiser-dashboard-body",children:[e.jsxs("section",{className:"advertiser-dashboard-card advertiser-dashboard-campaigns",children:[e.jsxs("div",{className:"advertiser-dashboard-card-head",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"advertiser-dashboard-card-title",children:"Recent campaigns"}),e.jsx("div",{className:"advertiser-dashboard-card-hint",children:"Latest campaign performance and review status"})]}),e.jsx(x,{className:"advertiser-dashboard-text-link",to:"/customer/advertiser/campaigns",children:"View all"})]}),e.jsx("div",{className:"advertiser-dashboard-list",children:C.length?C.map(a=>e.jsxs("article",{className:"advertiser-dashboard-campaign-item",children:[e.jsxs("div",{className:"advertiser-dashboard-campaign-head",children:[e.jsxs("div",{children:[e.jsx("div",{className:"advertiser-dashboard-campaign-name",children:(a==null?void 0:a.campaign_name)||"Untitled Campaign"}),e.jsxs("div",{className:"advertiser-dashboard-campaign-meta",children:[(a==null?void 0:a.campaign_type)||"banner"," / ",(a==null?void 0:a.buying_model)||"cpc"," /"," ",(a==null?void 0:a.objective)||"traffic"]})]}),e.jsx(k,{value:(a==null?void 0:a.approval_status)||"draft"})]}),e.jsxs("div",{className:"advertiser-dashboard-metrics",children:[e.jsxs("div",{children:[e.jsx("div",{className:"advertiser-dashboard-metric-label",children:"Budget"}),e.jsx("div",{className:"advertiser-dashboard-metric-value",children:m((a==null?void 0:a.budget_total)||0,p)})]}),e.jsxs("div",{children:[e.jsx("div",{className:"advertiser-dashboard-metric-label",children:"Spent"}),e.jsx("div",{className:"advertiser-dashboard-metric-value",children:m((a==null?void 0:a.spent_amount)||0,p)})]}),e.jsxs("div",{children:[e.jsx("div",{className:"advertiser-dashboard-metric-label",children:"Clicks"}),e.jsx("div",{className:"advertiser-dashboard-metric-value",children:(a==null?void 0:a.clicks_count)||0})]}),e.jsxs("div",{children:[e.jsx("div",{className:"advertiser-dashboard-metric-label",children:"Impressions"}),e.jsx("div",{className:"advertiser-dashboard-metric-value",children:(a==null?void 0:a.impressions_count)||0})]})]})]},a.id)):e.jsx("div",{className:"advertiser-dashboard-empty",children:"No campaigns yet."})})]}),e.jsxs("section",{className:"advertiser-dashboard-card advertiser-dashboard-wallet",children:[e.jsxs("div",{className:"advertiser-dashboard-card-head",children:[e.jsx("h2",{className:"advertiser-dashboard-card-title",children:"Wallet summary"}),e.jsx(x,{className:"advertiser-dashboard-text-link",to:"/customer/advertiser/wallet",children:"Wallet"})]}),e.jsxs("div",{className:"advertiser-dashboard-detail-list",children:[e.jsx(c,{label:"Available balance",value:m((d==null?void 0:d.available_balance)||0,p)}),e.jsx(c,{label:"Locked balance",value:m((d==null?void 0:d.locked_balance)||0,p)}),e.jsx(c,{label:"Total funded",value:m((d==null?void 0:d.total_funded)||0,p)}),e.jsx(c,{label:"Paid funding requests",value:g.paidPayments})]})]}),e.jsxs("section",{className:"advertiser-dashboard-card advertiser-dashboard-profile",children:[e.jsxs("div",{className:"advertiser-dashboard-card-head",children:[e.jsx("h2",{className:"advertiser-dashboard-card-title",children:"Advertiser profile"}),e.jsx(x,{className:"advertiser-dashboard-text-link",to:"/customer/advertiser/profile",children:"Profile"})]}),e.jsxs("div",{className:"advertiser-dashboard-detail-list",children:[e.jsx(c,{label:"Business Name",value:(s==null?void 0:s.business_name)||"Not set yet"}),e.jsx(c,{label:"Brand Name",value:(s==null?void 0:s.brand_name)||"Not set yet"}),e.jsx(c,{label:"Business Type",value:(s==null?void 0:s.business_type)||"individual"}),e.jsx(c,{label:"Verification",value:A}),e.jsx(c,{label:"Contact Name",value:(s==null?void 0:s.contact_name)||"-"}),e.jsx(c,{label:"Contact Email",value:(s==null?void 0:s.contact_email)||"-"})]}),e.jsx("div",{className:"advertiser-dashboard-verification",children:e.jsx(k,{value:A})})]}),e.jsxs("section",{className:"advertiser-dashboard-card advertiser-dashboard-funding",children:[e.jsx("div",{className:"advertiser-dashboard-card-head",children:e.jsxs("div",{children:[e.jsx("h2",{className:"advertiser-dashboard-card-title",children:"Recent funding requests"}),e.jsx("div",{className:"advertiser-dashboard-card-hint",children:"Latest advertiser wallet funding activity"})]})}),e.jsx("div",{className:"advertiser-dashboard-list",children:S.length?S.map(a=>e.jsxs("article",{className:"advertiser-dashboard-funding-item",children:[e.jsxs("div",{children:[e.jsx("div",{className:"advertiser-dashboard-funding-amount",children:m((a==null?void 0:a.amount)||0,(a==null?void 0:a.currency_code)||p)}),e.jsx("div",{className:"advertiser-dashboard-funding-provider",children:(a==null?void 0:a.provider_name)||(a==null?void 0:a.payment_method)||"manual"})]}),e.jsx("div",{className:"advertiser-dashboard-funding-reference",children:(a==null?void 0:a.provider_reference)||"No payment reference"}),e.jsx(k,{value:(a==null?void 0:a.payment_status)||"pending"})]},a.id)):e.jsx("div",{className:"advertiser-dashboard-empty",children:"No funding requests yet."})})]})]})]})]})}export{V as default};
