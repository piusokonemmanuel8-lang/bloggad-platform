import{r as c,a as C,j as e}from"./index-LXBBJt7I.js";import{R as M}from"./ReaderUnifiedShell-Bcc4SCGW.js";import{m as U,f as Y}from"./WorkspaceUi-B9xdA3p8.js";/* empty css                                   */import"./sparkles-BjsvwlsL.js";import"./crown-CqvQp2si.js";import"./external-link-CIrc7yHB.js";function A(r){const a=Number(r||0);return Number.isFinite(a)?a.toFixed(2):"0.00"}function D(r){return r==="paystack"?"Paystack":r==="flutterwave"?"Flutterwave":r==="paypal"?"PayPal":r}function F(){const[r,a]=c.useState(null),[l,_]=c.useState(!0),[b,y]=c.useState(!1),[i,p]=c.useState(""),[u,w]=c.useState(""),[v,S]=c.useState(!1),[N,x]=c.useState(null),d=(r==null?void 0:r.settings)||{},k=Array.isArray(r==null?void 0:r.gateways)?r.gateways:[];c.useEffect(()=>{let t=!0;C.get("/api/reader/credits/top-up/options").then(s=>{var E,P;if(!t)return;const o=(s==null?void 0:s.data)||null,g=Array.isArray(o==null?void 0:o.gateways)?o.gateways:[],j=Number(((E=o==null?void 0:o.settings)==null?void 0:E.quick_option_one_credits)||0);a(o),p(j>0?String(j):""),w(((P=g[0])==null?void 0:P.provider)||"")}).catch(s=>{var o,g;t&&x({type:"error",text:((g=(o=s==null?void 0:s.response)==null?void 0:o.data)==null?void 0:g.message)||"Unable to load Reader credit purchase options."})}).finally(()=>{t&&_(!1)});const m=new URLSearchParams(window.location.search),f=String(m.get("topup")||"").toLowerCase(),n=String(m.get("purchase_ref")||"").trim();return f==="credited"?x({type:"success",text:"Payment verified. Your Reader credits have been added."}):f==="cancelled"?x({type:"error",text:"Payment was cancelled. No Reader credits were added."}):f==="failed"?x({type:"error",text:"Payment could not be verified. No Reader credits were added."}):n&&["pending","paid"].includes(f)&&C.get(`/api/reader/credits/top-up/status/${encodeURIComponent(n)}`).then(s=>{var j;if(!t)return;const o=((j=s==null?void 0:s.data)==null?void 0:j.purchase)||{},g=String(o.status||"").toLowerCase();if(g==="credited"){window.location.replace("/reader/credits?topup=credited");return}if(g==="failed"||g==="cancelled"){x({type:"error",text:o.failure_reason||"Payment was not completed. No Reader credits were added."});return}x({type:"info",text:"Payment confirmation is still pending. You can refresh this page to check again."})}).catch(()=>{t&&x({type:"info",text:"Payment confirmation is still pending. You can refresh this page to check again."})}),()=>{t=!1}},[]);const h=c.useMemo(()=>{const t=Number(i);return Number.isSafeInteger(t)&&t>0?t:0},[i]),q=c.useMemo(()=>{const t=Number(d.credits_per_usd||0);return!h||!t?0:Math.ceil(h*100/t)/100},[h,d.credits_per_usd]),R=h>=Number(d.minimum_credits||0)&&h<=Number(d.maximum_credits||0),L=!!d.enabled&&k.length>0&&R&&!!u&&!v;function T(t){p(String(t))}async function $(){var t,m,f;if(L){S(!0),x(null);try{const n=await C.post("/api/reader/credits/top-up/initialize",{credits:h,provider:u}),s=(t=n==null?void 0:n.data)==null?void 0:t.checkout_url;if(!s)throw new Error("Payment gateway did not return a checkout URL.");window.location.assign(s)}catch(n){x({type:"error",text:((f=(m=n==null?void 0:n.response)==null?void 0:m.data)==null?void 0:f.message)||(n==null?void 0:n.message)||"Unable to start payment."}),S(!1)}}}const I=[Number(d.quick_option_one_credits||0),Number(d.quick_option_two_credits||0)].filter((t,m,f)=>t>0&&f.indexOf(t)===m);return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:O}),N?e.jsx("div",{className:`reader-credit-topup-notice ${N.type||"info"}`,role:N.type==="error"?"alert":"status",children:N.text}):null,e.jsxs("section",{className:"reader-credit-topup-card",children:[e.jsxs("div",{className:"reader-credit-topup-copy",children:[e.jsx("span",{className:"reader-credit-topup-kicker",children:"READER CREDITS"}),e.jsx("h3",{children:"Top up your credits"}),e.jsxs("p",{children:[Number(d.credits_per_usd||100).toLocaleString()," credits = $1.00. Choose a quick amount or enter your own."]})]}),e.jsx("button",{type:"button",className:"reader-credit-topup-open",disabled:l||!d.enabled||k.length===0,onClick:()=>y(!0),children:l?"Loading...":k.length===0?"Payments unavailable":"Top up credits"})]}),b?e.jsx("div",{className:"reader-credit-topup-overlay",role:"presentation",onMouseDown:t=>{t.target===t.currentTarget&&!v&&y(!1)},children:e.jsxs("section",{className:"reader-credit-topup-modal",role:"dialog","aria-modal":"true","aria-label":"Top up Reader credits",children:[e.jsxs("div",{className:"reader-credit-topup-modal-head",children:[e.jsxs("div",{children:[e.jsx("span",{children:"TOP UP READER CREDITS"}),e.jsx("h3",{children:"Choose your amount"})]}),e.jsx("button",{type:"button","aria-label":"Close",disabled:v,onClick:()=>y(!1),children:"x"})]}),e.jsxs("div",{className:"reader-credit-topup-rate",children:[e.jsxs("strong",{children:[Number(d.credits_per_usd||100).toLocaleString()," credits"]}),e.jsx("span",{children:"= $1.00 USD"})]}),e.jsx("div",{className:"reader-credit-topup-quick",children:I.map(t=>e.jsxs("button",{type:"button",className:h===t?"selected":"",onClick:()=>T(t),children:[e.jsxs("strong",{children:[t.toLocaleString()," credits"]}),e.jsxs("span",{children:["$",A(Math.ceil(t*100/Number(d.credits_per_usd||100))/100)]})]},t))}),e.jsxs("label",{className:"reader-credit-topup-field",children:[e.jsx("span",{children:"Custom credits"}),e.jsx("input",{type:"number",min:Number(d.minimum_credits||1),max:Number(d.maximum_credits||1e6),step:"1",value:i,onChange:t=>p(t.target.value),disabled:v}),e.jsxs("small",{children:["Minimum ",Number(d.minimum_credits||0).toLocaleString()," ","credits. Maximum"," ",Number(d.maximum_credits||0).toLocaleString()," credits."]})]}),e.jsxs("div",{className:"reader-credit-topup-total",children:[e.jsx("span",{children:"You pay"}),e.jsxs("strong",{children:["$",A(q)," USD"]})]}),e.jsxs("div",{className:"reader-credit-topup-provider",children:[e.jsx("span",{children:"Payment method"}),e.jsx("div",{children:k.map(t=>e.jsx("button",{type:"button",className:u===t.provider?"selected":"",onClick:()=>w(t.provider),disabled:v,children:D(t.provider)},t.provider))})]}),!R&&h>0?e.jsx("div",{className:"reader-credit-topup-validation",role:"alert",children:"Enter a whole-credit amount within the allowed range."}):null,e.jsx("button",{type:"button",className:"reader-credit-topup-pay",disabled:!L,onClick:$,children:v?"Opening secure checkout...":`Continue to ${D(u)||"payment"}`}),e.jsx("p",{className:"reader-credit-topup-security",children:"Credits are added only after Bloggad verifies the payment on the server. Failed, cancelled or underpaid transactions add no credits."})]})}):null]})}const O=`
  .reader-credit-topup-notice {
    margin: 0 0 14px;
    padding: 12px 14px;
    border: 1px solid #dbe4ef;
    border-radius: 12px;
    background: #f8fafc;
    color: #334155;
    font-size: 13px;
    line-height: 1.45;
  }
  .reader-credit-topup-notice.success {
    border-color: #bbf7d0;
    background: #f0fdf4;
    color: #166534;
  }
  .reader-credit-topup-notice.error {
    border-color: #fecaca;
    background: #fef2f2;
    color: #991b1b;
  }
  .reader-credit-topup-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    margin: 0 0 16px;
    padding: 18px 20px;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    background: #ffffff;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
  }
  .reader-credit-topup-copy {
    min-width: 0;
  }
  .reader-credit-topup-kicker {
    display: block;
    margin-bottom: 5px;
    color: #64748b;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.12em;
  }
  .reader-credit-topup-copy h3 {
    margin: 0;
    color: #0f172a;
    font-size: 18px;
    line-height: 1.2;
  }
  .reader-credit-topup-copy p {
    margin: 6px 0 0;
    color: #64748b;
    font-size: 12px;
    line-height: 1.45;
  }
  .reader-credit-topup-open,
  .reader-credit-topup-pay {
    border: 0;
    border-radius: 10px;
    background: #111827;
    color: #ffffff;
    font: inherit;
    font-weight: 750;
    cursor: pointer;
  }
  .reader-credit-topup-open {
    flex: 0 0 auto;
    min-height: 42px;
    padding: 0 18px;
    font-size: 13px;
  }
  .reader-credit-topup-open:disabled,
  .reader-credit-topup-pay:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .reader-credit-topup-overlay {
    position: fixed;
    z-index: 3000;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(15, 23, 42, 0.48);
  }
  .reader-credit-topup-modal {
    width: min(100%, 520px);
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    padding: 22px;
    border-radius: 18px;
    background: #ffffff;
    box-shadow: 0 24px 80px rgba(15, 23, 42, 0.22);
  }
  .reader-credit-topup-modal-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }
  .reader-credit-topup-modal-head span {
    display: block;
    margin-bottom: 4px;
    color: #64748b;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.12em;
  }
  .reader-credit-topup-modal-head h3 {
    margin: 0;
    color: #0f172a;
    font-size: 21px;
  }
  .reader-credit-topup-modal-head > button {
    width: 34px;
    height: 34px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #ffffff;
    color: #475569;
    font-size: 16px;
    cursor: pointer;
  }
  .reader-credit-topup-rate {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 18px;
    padding: 12px 14px;
    border-radius: 12px;
    background: #f8fafc;
    color: #334155;
    font-size: 13px;
  }
  .reader-credit-topup-quick {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 14px;
  }
  .reader-credit-topup-quick button {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    min-width: 0;
    padding: 14px;
    border: 1px solid #dbe4ef;
    border-radius: 12px;
    background: #ffffff;
    color: #0f172a;
    text-align: left;
    cursor: pointer;
  }
  .reader-credit-topup-quick button.selected {
    border-color: #111827;
    box-shadow: inset 0 0 0 1px #111827;
  }
  .reader-credit-topup-quick strong {
    font-size: 13px;
  }
  .reader-credit-topup-quick span {
    color: #64748b;
    font-size: 12px;
  }
  .reader-credit-topup-field {
    display: grid;
    gap: 6px;
    margin-top: 14px;
    color: #334155;
    font-size: 12px;
    font-weight: 700;
  }
  .reader-credit-topup-field input {
    width: 100%;
    height: 44px;
    box-sizing: border-box;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    padding: 0 12px;
    background: #ffffff;
    color: #0f172a;
    font: inherit;
    font-size: 14px;
    outline: none;
  }
  .reader-credit-topup-field input:focus {
    border-color: #64748b;
    box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.12);
  }
  .reader-credit-topup-field small {
    color: #94a3b8;
    font-weight: 500;
    line-height: 1.35;
  }
  .reader-credit-topup-total {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-top: 16px;
    padding: 14px 0;
    border-top: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
  }
  .reader-credit-topup-total span {
    color: #64748b;
    font-size: 12px;
  }
  .reader-credit-topup-total strong {
    color: #0f172a;
    font-size: 20px;
  }
  .reader-credit-topup-provider {
    margin-top: 16px;
  }
  .reader-credit-topup-provider > span {
    display: block;
    margin-bottom: 8px;
    color: #334155;
    font-size: 12px;
    font-weight: 700;
  }
  .reader-credit-topup-provider > div {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .reader-credit-topup-provider button {
    min-height: 38px;
    padding: 0 13px;
    border: 1px solid #dbe4ef;
    border-radius: 9px;
    background: #ffffff;
    color: #334155;
    font: inherit;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }
  .reader-credit-topup-provider button.selected {
    border-color: #111827;
    background: #111827;
    color: #ffffff;
  }
  .reader-credit-topup-validation {
    margin-top: 12px;
    color: #b91c1c;
    font-size: 12px;
  }
  .reader-credit-topup-pay {
    width: 100%;
    min-height: 46px;
    margin-top: 18px;
    font-size: 13px;
  }
  .reader-credit-topup-security {
    margin: 10px 0 0;
    color: #94a3b8;
    font-size: 10px;
    line-height: 1.45;
    text-align: center;
  }
  @media (max-width: 767px) {
    .reader-credit-topup-card {
      align-items: stretch;
      flex-direction: column;
      margin-bottom: 10px;
      padding: 14px;
      border-radius: 12px;
    }
    .reader-credit-topup-open {
      width: 100%;
    }
    .reader-credit-topup-overlay {
      align-items: flex-end;
      padding: 8px;
    }
    .reader-credit-topup-modal {
      max-height: calc(100vh - 16px);
      padding: 16px;
      border-radius: 16px;
    }
    .reader-credit-topup-quick {
      grid-template-columns: 1fr;
    }
  }
`;function z({label:r,value:a,note:l}){return e.jsxs("article",{className:"reader-credits-stat",children:[e.jsx("span",{children:r}),e.jsx("strong",{children:a}),e.jsx("small",{children:l})]})}function B(r){const a=Number((r==null?void 0:r.credits_amount)||0).toLocaleString(),l=String((r==null?void 0:r.direction)||"").toLowerCase();return l==="credit"?`+${a} credits`:l==="debit"?`-${a} credits`:`${a} credits`}function W(r){const a=String((r==null?void 0:r.direction)||"").toLowerCase();return a==="credit"?"CREDIT IN":a==="debit"?"CREDIT OUT":String((r==null?void 0:r.direction)||"CREDIT").toUpperCase()}function ee(){const[r,a]=c.useState(null),[l,_]=c.useState("");c.useEffect(()=>{let i=!0;return C.get("/api/reader/credits").then(p=>{i&&a(p.data)}).catch(p=>{var u,w;i&&_(((w=(u=p==null?void 0:p.response)==null?void 0:u.data)==null?void 0:w.message)||"Failed to load Reader credits.")}),()=>{i=!1}},[]);const b=(r==null?void 0:r.wallet)||{},y=Array.isArray(r==null?void 0:r.transactions)?r.transactions:[];return e.jsx(M,{title:"Credits",subtitle:"Your Reader library",children:e.jsxs("main",{className:"reader-saved-page reader-credits-page",children:[e.jsx("style",{children:G}),e.jsxs("section",{className:"reader-credits-hero",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"reader-credits-desktop-title",children:"Credits wallet"}),e.jsx("h2",{className:"reader-credits-mobile-title",children:"Credits"}),e.jsx("p",{className:"reader-credits-desktop-subtitle",children:"View your Reader credit balance and recent credit activity."}),e.jsx("p",{className:"reader-credits-mobile-subtitle",children:"Your Reader credit balance and recent activity."})]}),e.jsx("span",{className:"reader-credits-wallet-pill",children:"READER WALLET"})]}),e.jsxs("div",{className:"reader-credits-info",children:[e.jsx("span",{className:"reader-credits-info-icon","aria-hidden":"true",children:"i"}),e.jsx("span",{children:"Credits are auditable value units used to appreciate Writers. Credit pricing is not hardcoded."})]}),l?e.jsx("div",{className:"reader-saved-alert error reader-credits-error",role:"alert",children:l}):null,e.jsx(F,{}),e.jsxs("section",{className:"reader-credits-metrics","aria-label":"Reader credit wallet summary",children:[e.jsx(z,{label:"Available credits",value:Number(b.available_credits||0).toLocaleString(),note:"Current spendable balance"}),e.jsx(z,{label:"Available value",value:`$${U(b.available_value_usd,2)}`,note:"USD value of current credits"}),e.jsx(z,{label:"Credits acquired",value:Number(b.total_credits_acquired||0).toLocaleString(),note:"All credits added"}),e.jsx(z,{label:"Credits spent",value:Number(b.total_credits_spent||0).toLocaleString(),note:"Credits used for appreciation"})]}),e.jsxs("section",{className:"reader-credits-activity-card",children:[e.jsxs("div",{className:"reader-credits-activity-head",children:[e.jsxs("div",{children:[e.jsx("h3",{children:"Credit activity"}),e.jsx("p",{className:"reader-credits-desktop-activity-subtitle",children:"Recent changes to your Reader credit wallet."}),e.jsx("p",{className:"reader-credits-mobile-activity-subtitle",children:"Recent Reader credit changes"})]}),e.jsx("span",{className:"reader-credits-readonly",children:"READ ONLY"})]}),y.length?e.jsx("div",{className:"reader-credits-activity-list",children:y.map(i=>{const p=String((i==null?void 0:i.direction)||"").toLowerCase(),u=p==="credit"?"credit":p==="debit"?"debit":"";return e.jsxs("article",{className:"reader-credits-activity-row",children:[e.jsxs("div",{className:"reader-credits-activity-copy",children:[e.jsx("strong",{children:i.transaction_type}),e.jsxs("span",{children:["$",U(i.usd_value,2)," ",e.jsx("b",{"aria-hidden":"true",children:"|"})," ",Y(i.created_at)]})]}),e.jsxs("div",{className:`reader-credits-activity-amount ${u}`,children:[e.jsx("strong",{children:B(i)}),e.jsx("span",{children:W(i)})]})]},i.id)})}):e.jsxs("div",{className:"reader-credits-empty",children:[e.jsx("strong",{children:"No credit activity yet."}),e.jsx("span",{children:"Shown when the transaction list is empty."})]})]})]})})}const G=`
  .reader-credits-page { max-width: 1220px; padding-top: 24px; }
  .reader-credits-hero {
    display: none;
  }
  .reader-credits-hero h2 {
    margin: 0;
    color: #111827;
    font-size: 26px;
    line-height: 1.12;
    font-weight: 780;
    letter-spacing: -0.035em;
  }
  .reader-credits-hero p {
    margin: 8px 0 0;
    color: #748096;
    font-size: 13px;
    line-height: 1.55;
  }
  .reader-credits-mobile-title,
  .reader-credits-mobile-subtitle,
  .reader-credits-mobile-activity-subtitle { display: none; }
  .reader-credits-wallet-pill,
  .reader-credits-readonly {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    border-radius: 999px;
    background: #f3f4f6;
    color: #667085;
    font-size: 9px;
    line-height: 1;
    font-weight: 800;
  }
  .reader-credits-wallet-pill {
    min-height: 26px;
    padding: 0 10px;
    border: 1px solid #dce2ea;
  }
  .reader-credits-info {
    min-height: 45px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 14px;
    border: 1px solid #c9dcf7;
    border-radius: 11px;
    background: #e9f2ff;
    color: #28384f;
    font-size: 12px;
    line-height: 1.45;
  }
  .reader-credits-info-icon {
    width: 20px;
    height: 20px;
    flex: 0 0 20px;
    display: grid;
    place-items: center;
    border: 1px solid #c9dcf7;
    border-radius: 999px;
    background: #fff;
    font-size: 10px;
    font-weight: 800;
  }
  .reader-credits-error { margin-top: 14px; }
  .reader-credits-metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }
  .reader-credits-stat {
    min-width: 0;
    min-height: 124px;
    display: flex;
    flex-direction: column;
    gap: 9px;
    padding: 18px;
    border: 1px solid #dce2ea;
    border-radius: 14px;
    background: #fff;
  }
  .reader-credits-stat > span {
    color: #667085;
    font-size: 12px;
    line-height: 1.3;
    font-weight: 550;
  }
  .reader-credits-stat > strong {
    color: #111827;
    font-size: 24px;
    line-height: 1.2;
    font-weight: 780;
    letter-spacing: -0.025em;
    overflow-wrap: anywhere;
  }
  .reader-credits-stat > small {
    margin-top: auto;
    color: #748096;
    font-size: 10px;
    line-height: 1.35;
  }
  .reader-credits-activity-card {
    min-height: 330px;
    padding: 18px;
    border: 1px solid #dce2ea;
    border-radius: 16px;
    background: #fff;
  }
  .reader-credits-activity-head {
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }
  .reader-credits-activity-head h3 {
    margin: 0;
    color: #111827;
    font-size: 18px;
    line-height: 1.25;
    font-weight: 750;
  }
  .reader-credits-activity-head p {
    margin: 4px 0 0;
    color: #667085;
    font-size: 11px;
    line-height: 1.4;
  }
  .reader-credits-readonly { min-height: 25px; padding: 0 10px; }
  .reader-credits-activity-list { display: grid; }
  .reader-credits-activity-row {
    min-height: 70px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 12px 0;
    border-bottom: 1px solid #e3e7ed;
  }
  .reader-credits-activity-copy,
  .reader-credits-activity-amount {
    min-width: 0;
    display: grid;
    gap: 5px;
  }
  .reader-credits-activity-copy strong,
  .reader-credits-activity-amount strong {
    color: #111827;
    font-size: 13px;
    line-height: 1.25;
    font-weight: 700;
  }
  .reader-credits-activity-copy span {
    color: #667085;
    font-size: 11px;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }
  .reader-credits-activity-copy b { font-weight: 400; }
  .reader-credits-activity-amount {
    flex: 0 0 auto;
    justify-items: end;
    text-align: right;
    gap: 4px;
  }
  .reader-credits-activity-amount.credit strong { color: #276749; }
  .reader-credits-activity-amount.debit strong { color: #b42318; }
  .reader-credits-activity-amount span {
    color: #748096;
    font-size: 9px;
    line-height: 1;
    font-weight: 800;
  }
  .reader-credits-empty {
    min-height: 118px;
    margin-top: 14px;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 7px;
    border: 1px solid #dce2ea;
    border-radius: 15px;
    background: #fff;
    text-align: center;
  }
  .reader-credits-empty strong {
    color: #111827;
    font-size: 13px;
    line-height: 1.3;
  }
  .reader-credits-empty span {
    color: #667085;
    font-size: 10px;
    line-height: 1.4;
  }

  @media (max-width: 767px) {
    .reader-credits-page {
      width: calc(100% - 16px);
      margin: 0 8px;
      padding: 20px 0 32px;
    }
    .reader-credits-hero {
      min-height: 82px;
      display: grid;
      gap: 6px;
      align-items: start;
    }
    .reader-credits-desktop-title,
    .reader-credits-desktop-subtitle,
    .reader-credits-desktop-activity-subtitle,
    .reader-credits-info,
    .reader-credits-readonly,
    .reader-credits-stat > small { display: none; }
    .reader-credits-mobile-title,
    .reader-credits-mobile-subtitle,
    .reader-credits-mobile-activity-subtitle { display: block; }
    .reader-credits-hero h2 { font-size: 23px; line-height: 1.15; }
    .reader-credits-hero p { margin-top: 6px; font-size: 12px; line-height: 1.4; }
    .reader-credits-wallet-pill {
      justify-self: start;
      min-height: 25px;
      padding: 0 9px;
    }
    .reader-credits-metrics {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0;
    }
    .reader-credits-stat {
      min-height: 104px;
      padding: 14px 13px;
      gap: 8px;
      border-radius: 13px;
    }
    .reader-credits-stat > span { font-size: 10px; }
    .reader-credits-stat > strong { font-size: 19px; }
    .reader-credits-activity-card {
      min-height: 360px;
      padding: 16px;
      border-radius: 15px;
    }
    .reader-credits-activity-head { min-height: auto; display: block; }
    .reader-credits-activity-head h3 { font-size: 17px; }
    .reader-credits-activity-head p { font-size: 10px; }
    .reader-credits-activity-list { margin-top: 6px; }
    .reader-credits-activity-row {
      min-height: 68px;
      gap: 12px;
      padding: 10px 0;
    }
    .reader-credits-activity-copy { gap: 4px; }
    .reader-credits-activity-copy strong,
    .reader-credits-activity-amount strong { font-size: 11px; }
    .reader-credits-activity-copy span { font-size: 9px; }
    .reader-credits-activity-amount { gap: 3px; }
    .reader-credits-activity-amount span { font-size: 8px; }
    .reader-credits-empty { min-height: 118px; margin-top: 0; }
  }

  @media (min-width: 768px) and (max-width: 1120px) {
    .reader-credits-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
`;export{ee as default};
