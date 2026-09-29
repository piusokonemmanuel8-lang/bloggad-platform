import{r as o,j as e,a as b}from"./index-D7wY-Nn2.js";const E=["paystack","flutterwave","paypal"];function u(t){return t==="paystack"?"Paystack":t==="flutterwave"?"Flutterwave":t==="paypal"?"PayPal":t}function L(){return{test_public_key:"",test_secret_key:"",live_public_key:"",live_secret_key:""}}function S(t){return{provider:t.provider,display_name:t.display_name||u(t.provider),enabled:!!t.enabled,active_mode:t.active_mode==="live"?"live":"test",configured:!!t.configured,test_public_configured:!!t.test_public_configured,test_secret_configured:!!t.test_secret_configured,live_public_configured:!!t.live_public_configured,live_secret_configured:!!t.live_secret_configured,supported_currencies:Array.isArray(t.supported_currencies)?t.supported_currencies:[],...L()}}function F(){const[t,f]=o.useState(null),[y,g]=o.useState({}),[_,z]=o.useState([]),[$,j]=o.useState(!0),[v,w]=o.useState(!1),[k,N]=o.useState(""),[h,p]=o.useState(null);async function P(){var a,n;j(!0),p(null);try{const r=await b.get("/api/admin/writer-finance/payment-gateways"),s=(r==null?void 0:r.data)||{},i={};for(const c of s.gateways||[])i[c.provider]=S(c);f(s.settings||null),g(i),z(Array.isArray(s.currencies)?s.currencies:[])}catch(r){p({type:"error",text:((n=(a=r==null?void 0:r.response)==null?void 0:a.data)==null?void 0:n.message)||"Failed to load payment gateway settings."})}finally{j(!1)}}o.useEffect(()=>{P()},[]);function l(a,n){f(r=>({...r||{},[a]:n}))}function x(a,n,r){g(s=>({...s,[a]:{...s[a]||{},[n]:r}}))}function A(a,n,r){g(s=>{const i=s[a]||{},c=Array.isArray(i.supported_currencies)?i.supported_currencies:[],d=r?Array.from(new Set([...c,n])):c.filter(m=>m!==n);return{...s,[a]:{...i,supported_currencies:d}}})}async function B(){var a,n,r,s;if(t){w(!0),p(null);try{const i=await b.put("/api/admin/writer-finance/reader-credit-purchase-settings",{enabled:!!t.enabled,credits_per_usd:Number(t.credits_per_usd),quick_option_one_credits:Number(t.quick_option_one_credits),quick_option_two_credits:Number(t.quick_option_two_credits),minimum_credits:Number(t.minimum_credits),maximum_credits:Number(t.maximum_credits),currency_code:t.currency_code});f(((a=i==null?void 0:i.data)==null?void 0:a.settings)||t),p({type:"success",text:((n=i==null?void 0:i.data)==null?void 0:n.message)||"Reader credit purchase settings saved."})}catch(i){p({type:"error",text:((s=(r=i==null?void 0:i.response)==null?void 0:r.data)==null?void 0:s.message)||"Failed to save Reader credit purchase settings."})}finally{w(!1)}}}async function R(a){var r,s,i,c;const n=y[a];if(n){N(a),p(null);try{const d=await b.put(`/api/admin/writer-finance/payment-gateways/${a}`,{enabled:!!n.enabled,active_mode:n.active_mode,test_public_key:n.test_public_key,test_secret_key:n.test_secret_key,live_public_key:n.live_public_key,live_secret_key:n.live_secret_key,supported_currencies:n.supported_currencies||[]}),m=S(((r=d==null?void 0:d.data)==null?void 0:r.gateway)||n);g(q=>({...q,[a]:m})),p({type:"success",text:((s=d==null?void 0:d.data)==null?void 0:s.message)||`${u(a)} settings saved.`})}catch(d){p({type:"error",text:((c=(i=d==null?void 0:d.response)==null?void 0:i.data)==null?void 0:c.message)||`Failed to save ${u(a)} settings.`})}finally{N("")}}}return $?e.jsxs("main",{className:"admin-payment-gateways-page",children:[e.jsx("style",{children:C}),e.jsx("div",{className:"apg-state",children:"Loading payment gateway settings..."})]}):e.jsxs("main",{className:"admin-payment-gateways-page",children:[e.jsx("style",{children:C}),e.jsx("header",{className:"apg-header",children:e.jsxs("div",{children:[e.jsx("span",{children:"PAYMENTS"}),e.jsx("h1",{children:"Payment Gateways"}),e.jsx("p",{children:"Manage Reader credit pricing and secure test/live gateway credentials for Reader subscriptions, Reader credit purchases, and Writer plan payments."})]})}),h?e.jsx("div",{className:`apg-notice ${h.type||""}`,role:"status",children:h.text}):null,e.jsxs("section",{className:"apg-card",children:[e.jsxs("div",{className:"apg-card-head",children:[e.jsxs("div",{children:[e.jsx("h2",{children:"Reader credit purchase settings"}),e.jsx("p",{children:"Pricing keeps USD as the accounting base and charges the active currency selected below using its administrator exchange rate."})]}),e.jsxs("label",{className:"apg-switch",children:[e.jsx("input",{type:"checkbox",checked:!!(t!=null&&t.enabled),onChange:a=>l("enabled",a.target.checked)}),e.jsx("span",{children:"Purchases enabled"})]})]}),e.jsxs("div",{className:"apg-grid",children:[e.jsxs("label",{children:[e.jsx("span",{children:"Credits per $1 USD"}),e.jsx("input",{type:"number",min:"1",step:"1",value:(t==null?void 0:t.credits_per_usd)??"",onChange:a=>l("credits_per_usd",a.target.value)})]}),e.jsxs("label",{children:[e.jsx("span",{children:"Quick option 1"}),e.jsx("input",{type:"number",min:"1",step:"1",value:(t==null?void 0:t.quick_option_one_credits)??"",onChange:a=>l("quick_option_one_credits",a.target.value)})]}),e.jsxs("label",{children:[e.jsx("span",{children:"Quick option 2"}),e.jsx("input",{type:"number",min:"1",step:"1",value:(t==null?void 0:t.quick_option_two_credits)??"",onChange:a=>l("quick_option_two_credits",a.target.value)})]}),e.jsxs("label",{children:[e.jsx("span",{children:"Minimum credits"}),e.jsx("input",{type:"number",min:"1",step:"1",value:(t==null?void 0:t.minimum_credits)??"",onChange:a=>l("minimum_credits",a.target.value)})]}),e.jsxs("label",{children:[e.jsx("span",{children:"Maximum credits"}),e.jsx("input",{type:"number",min:"1",step:"1",value:(t==null?void 0:t.maximum_credits)??"",onChange:a=>l("maximum_credits",a.target.value)})]}),e.jsxs("label",{children:[e.jsx("span",{children:"Charge currency"}),e.jsxs("select",{value:(t==null?void 0:t.currency_code)||"",onChange:a=>l("currency_code",a.target.value),children:[e.jsx("option",{value:"",children:"Select active currency"}),_.map(a=>e.jsxs("option",{value:a.currency_code,children:[a.currency_code,a.currency_name?` - ${a.currency_name}`:""]},a.currency_code))]})]})]}),e.jsx("div",{className:"apg-actions",children:e.jsx("button",{type:"button",onClick:B,disabled:v,children:v?"Saving...":"Save Reader pricing"})})]}),e.jsx("section",{className:"apg-provider-list",children:E.map(a=>{const n=y[a];if(!n)return null;const r=a==="paypal"?"Client ID":"Public key",s=a==="paypal"?"Client secret":"Secret key";return e.jsxs("article",{className:"apg-card apg-provider-card",children:[e.jsxs("div",{className:"apg-card-head",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"apg-provider-title",children:[e.jsx("h2",{children:u(a)}),e.jsx("span",{className:n.configured?"configured":"not-configured",children:n.configured?`${n.active_mode} configured`:"Active mode not configured"})]}),e.jsx("p",{children:"Credentials are encrypted before storage. Existing secrets are never returned to this page."})]}),e.jsxs("label",{className:"apg-switch",children:[e.jsx("input",{type:"checkbox",checked:!!n.enabled,onChange:i=>x(a,"enabled",i.target.checked)}),e.jsx("span",{children:"Enabled"})]})]}),e.jsxs("div",{className:"apg-mode",children:[e.jsx("span",{children:"Active mode"}),e.jsx("div",{children:["test","live"].map(i=>e.jsx("button",{type:"button",className:n.active_mode===i?"selected":"",onClick:()=>x(a,"active_mode",i),children:i==="test"?"Test / Sandbox":"Live"},i))})]}),e.jsxs("div",{className:"apg-currency-rules",children:[e.jsx("strong",{children:"Reader credit currencies"}),e.jsx("p",{children:"This gateway is shown for Reader credit checkout only when the selected purchase currency is enabled here."}),e.jsx("div",{children:_.map(i=>{var c;return e.jsxs("label",{children:[e.jsx("input",{type:"checkbox",checked:!!((c=n.supported_currencies)!=null&&c.includes(i.currency_code)),onChange:d=>A(a,i.currency_code,d.target.checked)}),e.jsx("span",{children:i.currency_code})]},i.currency_code)})})]}),e.jsx("div",{className:"apg-credential-sections",children:["test","live"].map(i=>e.jsxs("div",{className:"apg-credential-group",children:[e.jsxs("div",{className:"apg-credential-head",children:[e.jsxs("strong",{children:[i==="test"?"Test / Sandbox":"Live"," credentials"]}),e.jsx("span",{children:n[`${i}_secret_configured`]?"Secret saved":"Secret not saved"})]}),e.jsxs("label",{children:[e.jsx("span",{children:r}),e.jsx("input",{type:"password",autoComplete:"new-password",value:n[`${i}_public_key`],placeholder:n[`${i}_public_configured`]?"Configured - leave blank to keep":`Enter ${i} ${r.toLowerCase()}`,onChange:c=>x(a,`${i}_public_key`,c.target.value)})]}),e.jsxs("label",{children:[e.jsx("span",{children:s}),e.jsx("input",{type:"password",autoComplete:"new-password",value:n[`${i}_secret_key`],placeholder:n[`${i}_secret_configured`]?"Configured - leave blank to keep":`Enter ${i} ${s.toLowerCase()}`,onChange:c=>x(a,`${i}_secret_key`,c.target.value)})]})]},i))}),e.jsx("div",{className:"apg-actions",children:e.jsx("button",{type:"button",onClick:()=>R(a),disabled:k===a,children:k===a?"Saving...":`Save ${u(a)}`})})]},a)})})]})}const C=`
  .admin-payment-gateways-page {
    width: 100%;
    max-width: 1180px;
    margin: 0 auto;
    padding: 24px;
    box-sizing: border-box;
    color: #0f172a;
  }
  .apg-header {
    margin-bottom: 18px;
  }
  .apg-header span {
    color: #64748b;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.14em;
  }
  .apg-header h1 {
    margin: 5px 0 0;
    font-size: 28px;
    letter-spacing: -0.035em;
  }
  .apg-header p {
    margin: 7px 0 0;
    color: #64748b;
    font-size: 13px;
  }
  .apg-state,
  .apg-card {
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    background: #ffffff;
  }
  .apg-state {
    padding: 24px;
    color: #64748b;
  }
  .apg-card {
    padding: 20px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  }
  .apg-notice {
    margin-bottom: 14px;
    padding: 12px 14px;
    border: 1px solid #dbe4ef;
    border-radius: 10px;
    background: #f8fafc;
    color: #334155;
    font-size: 13px;
  }
  .apg-notice.success {
    border-color: #bbf7d0;
    background: #f0fdf4;
    color: #166534;
  }
  .apg-notice.error {
    border-color: #fecaca;
    background: #fef2f2;
    color: #991b1b;
  }
  .apg-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
  }
  .apg-card-head h2 {
    margin: 0;
    font-size: 17px;
  }
  .apg-card-head p {
    margin: 6px 0 0;
    color: #64748b;
    font-size: 12px;
    line-height: 1.5;
  }
  .apg-switch {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #334155;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }
  .apg-switch input {
    width: 16px;
    height: 16px;
  }
  .apg-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
  }
  .apg-grid label,
  .apg-credential-group label {
    display: grid;
    gap: 6px;
    color: #475569;
    font-size: 11px;
    font-weight: 700;
  }
  .apg-grid input,
  .apg-grid select,
  .apg-credential-group input {
    width: 100%;
    height: 42px;
    box-sizing: border-box;
    border: 1px solid #cbd5e1;
    border-radius: 9px;
    padding: 0 11px;
    background: #ffffff;
    color: #0f172a;
    font: inherit;
    font-size: 12px;
    outline: none;
  }
  .apg-grid input:focus,
  .apg-grid select:focus,
  .apg-credential-group input:focus {
    border-color: #64748b;
    box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.12);
  }
  .apg-grid input:disabled {
    background: #f8fafc;
    color: #64748b;
  }
  .apg-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
  .apg-actions button {
    min-height: 40px;
    padding: 0 15px;
    border: 0;
    border-radius: 9px;
    background: #111827;
    color: #ffffff;
    font: inherit;
    font-size: 12px;
    font-weight: 750;
    cursor: pointer;
  }
  .apg-actions button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .apg-provider-list {
    display: grid;
    gap: 14px;
    margin-top: 14px;
  }
  .apg-provider-title {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 9px;
  }
  .apg-provider-title > span {
    padding: 4px 7px;
    border-radius: 999px;
    background: #f1f5f9;
    color: #64748b;
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
  }
  .apg-provider-title > span.configured {
    background: #ecfdf5;
    color: #047857;
  }
  .apg-mode {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-top: 18px;
    padding: 11px 12px;
    border-radius: 10px;
    background: #f8fafc;
  }
  .apg-mode > span {
    color: #475569;
    font-size: 11px;
    font-weight: 750;
  }
  .apg-mode > div {
    display: flex;
    gap: 6px;
  }
  .apg-mode button {
    min-height: 34px;
    padding: 0 11px;
    border: 1px solid #dbe4ef;
    border-radius: 8px;
    background: #ffffff;
    color: #475569;
    font: inherit;
    font-size: 10px;
    font-weight: 750;
    cursor: pointer;
  }
  .apg-mode button.selected {
    border-color: #111827;
    background: #111827;
    color: #ffffff;
  }
  .apg-currency-rules {
    margin-top: 14px;
    padding: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #f8fafc;
  }
  .apg-currency-rules > strong {
    display: block;
    font-size: 11px;
  }
  .apg-currency-rules > p {
    margin: 5px 0 9px;
    color: #64748b;
    font-size: 10px;
    line-height: 1.45;
  }
  .apg-currency-rules > div {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
  }
  .apg-currency-rules label {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #334155;
    font-size: 10px;
    font-weight: 750;
  }
  .apg-currency-rules input {
    width: 15px;
    height: 15px;
  }
  .apg-credential-sections {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 14px;
  }
  .apg-credential-group {
    display: grid;
    gap: 10px;
    min-width: 0;
    padding: 14px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
  }
  .apg-credential-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .apg-credential-head strong {
    font-size: 11px;
  }
  .apg-credential-head span {
    color: #94a3b8;
    font-size: 9px;
  }
  @media (max-width: 820px) {
    .admin-payment-gateways-page {
      padding: 14px;
    }
    .apg-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .apg-credential-sections {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 560px) {
    .admin-payment-gateways-page {
      padding: 8px;
    }
    .apg-card {
      padding: 14px;
      border-radius: 12px;
    }
    .apg-card-head {
      flex-direction: column;
    }
    .apg-grid {
      grid-template-columns: 1fr;
    }
    .apg-mode {
      align-items: flex-start;
      flex-direction: column;
    }
    .apg-actions button {
      width: 100%;
    }
  }
`;export{F as default};
