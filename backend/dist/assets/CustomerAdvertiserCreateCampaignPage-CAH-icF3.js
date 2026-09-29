import{f as K,r as o,j as e,L as E}from"./index-D7wY-Nn2.js";import{R as Q}from"./ReaderUnifiedShell-CcGKzkmA.js";import"./sparkles-DniX3uPT.js";import"./crown-9tuqvcLd.js";function V(){return localStorage.getItem("bloggad_token")||localStorage.getItem("customerToken")||localStorage.getItem("token")||localStorage.getItem("authToken")||""}function N(s,d="USD"){const m=Number(s||0);try{return new Intl.NumberFormat("en-US",{style:"currency",currency:d,maximumFractionDigits:2}).format(m)}catch{return`${d} ${m.toFixed(2)}`}}function U(s){if(!s)return"";const d=new Date(s);if(Number.isNaN(d.getTime()))return"";const m=d.getFullYear(),f=String(d.getMonth()+1).padStart(2,"0"),w=String(d.getDate()).padStart(2,"0"),b=String(d.getHours()).padStart(2,"0"),v=String(d.getMinutes()).padStart(2,"0");return`${m}-${f}-${w}T${b}:${v}`}const X={campaign_name:"",campaign_type:"banner",buying_model:"cpc",objective:"traffic",destination_url:"",display_url:"",headline:"",description_text:"",call_to_action:"Learn More",budget_total:"",budget_daily:"",bid_amount:"",start_at:"",end_at:""},Z=["Learn More","Buy Now","Shop Now","Get Offer","Sign Up","Order Now","Download","Contact Us"];function p({label:s,children:d,className:m=""}){return e.jsxs("label",{className:`reader-campaign-field ${m}`.trim(),children:[e.jsx("span",{className:"reader-campaign-label",children:s}),d]})}function u({label:s,value:d}){return e.jsxs("div",{className:"reader-campaign-preview-row",children:[e.jsx("span",{children:s}),e.jsx("strong",{children:d})]})}function ne(){const s=K(),d=o.useMemo(()=>V(),[]),[m,f]=o.useState(!1),[w,b]=o.useState(!1),[v,j]=o.useState(!1),[x,L]=o.useState(null),[_,B]=o.useState(null),[z,y]=o.useState(""),[k,S]=o.useState(""),[a,F]=o.useState(X),[h,A]=o.useState(null),[g,T]=o.useState(""),[C,I]=o.useState(""),[D,R]=o.useState("");o.useEffect(()=>{d||s("/customer/login",{replace:!0})},[s,d]),o.useEffect(()=>()=>{g&&g.startsWith("blob:")&&URL.revokeObjectURL(g)},[g]),o.useEffect(()=>{async function i(){if(d){f(!0),y("");try{const r=await fetch("/api/customer/advertiser/wallet",{method:"GET",headers:{Authorization:`Bearer ${d}`},credentials:"include"}),t=await r.json().catch(()=>({}));if(!r.ok||!(t!=null&&t.ok))throw new Error((t==null?void 0:t.message)||"Failed to load advertiser wallet.");L((t==null?void 0:t.wallet)||null)}catch(r){y(r.message||"Failed to load advertiser wallet.")}finally{f(!1)}}}i()},[d]);function l(i,r){F(t=>({...t,[i]:r}))}function $(i){var t;const r=((t=i.target.files)==null?void 0:t[0])||null;g&&g.startsWith("blob:")&&URL.revokeObjectURL(g),A(r),T(r?URL.createObjectURL(r):"")}function O(){if(!a.campaign_name.trim())throw new Error("Campaign name is required.");if(!a.destination_url.trim())throw new Error("Destination URL is required.");if(!a.headline.trim())throw new Error("Headline is required.");if(!a.call_to_action.trim())throw new Error("Call to action is required.");if(!a.budget_total||Number(a.budget_total)<=0)throw new Error("Total budget must be greater than zero.");if(!a.budget_daily||Number(a.budget_daily)<=0)throw new Error("Daily budget must be greater than zero.");if(!a.bid_amount||Number(a.bid_amount)<=0)throw new Error("Bid amount must be greater than zero.");if(a.start_at&&a.end_at){const i=new Date(a.start_at),r=new Date(a.end_at);if(!Number.isNaN(i.getTime())&&!Number.isNaN(r.getTime())&&r<=i)throw new Error("End date must be later than start date.")}if(!h)throw new Error("Banner image is required.")}async function M(){const i={campaign_name:a.campaign_name.trim(),campaign_type:a.campaign_type,buying_model:a.buying_model,objective:a.objective,destination_url:a.destination_url.trim(),display_url:a.display_url.trim(),headline:a.headline.trim(),description_text:a.description_text.trim(),call_to_action:a.call_to_action.trim(),budget_total:Number(a.budget_total||0),budget_daily:Number(a.budget_daily||0),bid_amount:Number(a.bid_amount||0),start_at:a.start_at||null,end_at:a.end_at||null},r=await fetch("/api/customer/advertiser/campaigns",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${d}`},credentials:"include",body:JSON.stringify(i)}),t=await r.json().catch(()=>({}));if(!r.ok||!(t!=null&&t.ok))throw new Error((t==null?void 0:t.message)||"Failed to create campaign.");const c=(t==null?void 0:t.campaign)||(t==null?void 0:t.data)||null;if(!(c!=null&&c.id))throw new Error("Campaign was created but no campaign id was returned.");return c}async function P(i){const r=new FormData;r.append("creative_type",a.campaign_type==="native"?"native":"image"),r.append("headline",a.headline.trim()),r.append("description_text",a.description_text.trim()),r.append("call_to_action",a.call_to_action.trim()),r.append("destination_url",a.destination_url.trim()),r.append("display_url",a.display_url.trim()),r.append("alt_text",C.trim()),r.append("admin_note",D.trim()),r.append("asset",h);const t=await fetch(`/api/customer/advertiser/campaigns/${i}/creatives`,{method:"POST",headers:{Authorization:`Bearer ${d}`},credentials:"include",body:r}),c=await t.json().catch(()=>({}));if(!t.ok||!(c!=null&&c.ok))throw new Error((c==null?void 0:c.message)||"Failed to upload creative.");return c}async function W(i){i.preventDefault(),y(""),S("");try{O(),b(!0);const r=await M();B(r),b(!1),j(!0),await P(r.id),j(!1),S("Campaign and creative submitted successfully."),setTimeout(()=>{s(`/customer/advertiser/campaigns/${r.id}`)},900)}catch(r){b(!1),j(!1),y(r.message||"Failed to create campaign.")}}const n=w||v,q=(x==null?void 0:x.currency)||"USD",H=m?"Loading...":N((x==null?void 0:x.available_balance)||0,q),Y=a.display_url.trim()||"yourwebsite.com",G=a.headline.trim()||"Your ad headline preview",J=a.description_text.trim()||"Your ad description will show here.";return e.jsxs(Q,{title:"Create Campaign",subtitle:"Advertiser",children:[e.jsx("style",{children:ee}),e.jsxs("main",{className:"reader-campaign-create-page",children:[e.jsxs("section",{className:"reader-campaign-context",children:[e.jsxs("div",{className:"reader-campaign-context-copy",children:[e.jsx("h1",{children:"Campaign setup"}),e.jsx("p",{children:"Create the campaign first, then the creative is uploaded automatically."})]}),e.jsxs("div",{className:"reader-campaign-context-actions",children:[e.jsxs("div",{className:"reader-campaign-wallet","aria-live":"polite",children:[e.jsx("span",{children:"Wallet"}),e.jsx("strong",{children:H})]}),e.jsx(E,{className:"reader-campaign-back",to:"/customer/advertiser/campaigns",children:"Back to campaigns"})]})]}),z?e.jsx("div",{className:"reader-campaign-alert error",role:"alert",children:z}):null,k?e.jsx("div",{className:"reader-campaign-alert success",role:"status",children:k}):null,e.jsxs("div",{className:"reader-campaign-layout",children:[e.jsxs("form",{className:"reader-campaign-form-card",onSubmit:W,children:[e.jsxs("header",{className:"reader-campaign-card-heading",children:[e.jsx("h2",{children:"Campaign details"}),e.jsx("p",{children:"Required fields match the live campaign creation flow."})]}),e.jsxs("div",{className:"reader-campaign-fields",children:[e.jsx(p,{label:"Campaign Name",children:e.jsx("input",{value:a.campaign_name,onChange:i=>l("campaign_name",i.target.value),placeholder:"Spring Home Banner Push",disabled:n})}),e.jsx(p,{label:"Campaign Type",children:e.jsxs("select",{value:a.campaign_type,onChange:i=>l("campaign_type",i.target.value),disabled:n,children:[e.jsx("option",{value:"banner",children:"banner"}),e.jsx("option",{value:"image",children:"image"}),e.jsx("option",{value:"native",children:"native"}),e.jsx("option",{value:"text",children:"text"}),e.jsx("option",{value:"html",children:"html"})]})}),e.jsx(p,{label:"Buying Model",children:e.jsxs("select",{value:a.buying_model,onChange:i=>l("buying_model",i.target.value),disabled:n,children:[e.jsx("option",{value:"cpc",children:"cpc"}),e.jsx("option",{value:"cpm",children:"cpm"}),e.jsx("option",{value:"fixed",children:"fixed"})]})}),e.jsx(p,{label:"Objective",children:e.jsxs("select",{value:a.objective,onChange:i=>l("objective",i.target.value),disabled:n,children:[e.jsx("option",{value:"traffic",children:"traffic"}),e.jsx("option",{value:"awareness",children:"awareness"}),e.jsx("option",{value:"conversion",children:"conversion"}),e.jsx("option",{value:"engagement",children:"engagement"})]})}),e.jsx(p,{label:"Destination URL",children:e.jsx("input",{value:a.destination_url,onChange:i=>l("destination_url",i.target.value),placeholder:"https://yourwebsite.com/product",disabled:n})}),e.jsx(p,{label:"Display URL",children:e.jsx("input",{value:a.display_url,onChange:i=>l("display_url",i.target.value),placeholder:"yourwebsite.com",disabled:n})}),e.jsx(p,{label:"Headline",children:e.jsx("input",{value:a.headline,onChange:i=>l("headline",i.target.value),placeholder:"Upgrade your living room today",disabled:n})}),e.jsx(p,{label:"Call To Action",children:e.jsx("select",{value:a.call_to_action,onChange:i=>l("call_to_action",i.target.value),disabled:n,children:Z.map(i=>e.jsx("option",{value:i,children:i},i))})}),e.jsx(p,{label:"Total Budget",children:e.jsx("input",{type:"number",min:"0",step:"0.01",value:a.budget_total,onChange:i=>l("budget_total",i.target.value),placeholder:"500",disabled:n})}),e.jsx(p,{label:"Daily Budget",children:e.jsx("input",{type:"number",min:"0",step:"0.01",value:a.budget_daily,onChange:i=>l("budget_daily",i.target.value),placeholder:"25",disabled:n})}),e.jsx(p,{label:"Bid Amount",children:e.jsx("input",{type:"number",min:"0",step:"0.01",value:a.bid_amount,onChange:i=>l("bid_amount",i.target.value),placeholder:"0.50",disabled:n})}),e.jsx(p,{label:"Start At",children:e.jsx("input",{type:"datetime-local",value:U(a.start_at),onChange:i=>l("start_at",i.target.value),disabled:n})}),e.jsx(p,{label:"End At",children:e.jsx("input",{type:"datetime-local",value:U(a.end_at),onChange:i=>l("end_at",i.target.value),disabled:n})}),e.jsx(p,{label:"Creative Alt Text",children:e.jsx("input",{value:C,onChange:i=>I(i.target.value),placeholder:"Promotional banner alt text",disabled:n})})]}),e.jsx(p,{label:"Description Text",className:"full",children:e.jsx("textarea",{value:a.description_text,onChange:i=>l("description_text",i.target.value),placeholder:"Write the supporting ad text people should see under the headline.",rows:4,disabled:n})}),e.jsxs("section",{className:"reader-campaign-upload-section",children:[e.jsx("h3",{children:"Creative upload"}),e.jsxs("label",{className:`reader-campaign-upload${n?" disabled":""}`,children:[e.jsx("input",{type:"file",accept:"image/*",onChange:$,disabled:n}),e.jsx("span",{className:"reader-campaign-upload-mark","aria-hidden":"true",children:"+"}),e.jsxs("span",{className:"reader-campaign-upload-copy",children:[e.jsx("strong",{children:(h==null?void 0:h.name)||"Choose banner image"}),e.jsx("small",{children:h?"Image selected. The creative uploads after the campaign is created.":"Image is required. The creative uploads after the campaign is created."})]})]}),e.jsx(p,{label:"Admin Note",className:"full",children:e.jsx("input",{value:D,onChange:i=>R(i.target.value),placeholder:"Optional note for admin",disabled:n})})]}),e.jsx("div",{className:"reader-campaign-workflow-note",children:"Campaign is saved first. Then the creative uploads. Successful submission opens the campaign detail page."}),e.jsxs("div",{className:"reader-campaign-actions",children:[e.jsx("button",{type:"submit",className:"reader-campaign-primary",disabled:n,children:w?"Creating Campaign...":v?"Uploading Creative...":"Create Campaign"}),e.jsx(E,{className:`reader-campaign-secondary${n?" disabled":""}`,to:"/customer/advertiser/campaigns","aria-disabled":n,onClick:i=>{n&&i.preventDefault()},children:"Cancel"})]})]}),e.jsxs("aside",{className:"reader-campaign-preview-card","aria-label":"Live campaign preview",children:[e.jsxs("header",{className:"reader-campaign-preview-head",children:[e.jsx("h2",{children:"Live preview"}),e.jsx("span",{children:"DRAFT"})]}),e.jsxs("div",{className:"reader-campaign-ad-preview",children:[e.jsx("div",{className:"reader-campaign-preview-media",children:g?e.jsx("img",{src:g,alt:C||a.headline||"Creative preview"}):e.jsx("span",{children:"Banner preview"})}),e.jsxs("div",{className:"reader-campaign-preview-copy",children:[e.jsx("small",{children:Y.toUpperCase()}),e.jsx("h3",{children:G}),e.jsx("p",{children:J}),e.jsx("button",{type:"button",tabIndex:-1,"aria-hidden":"true",children:a.call_to_action||"Learn More"})]})]}),e.jsxs("div",{className:"reader-campaign-preview-summary",children:[e.jsx(u,{label:"Type",value:a.campaign_type}),e.jsx(u,{label:"Model",value:a.buying_model}),e.jsx(u,{label:"Objective",value:a.objective}),e.jsx(u,{label:"Total Budget",value:a.budget_total?N(a.budget_total):"-"}),e.jsx(u,{label:"Daily Budget",value:a.budget_daily?N(a.budget_daily):"-"}),e.jsx(u,{label:"Bid",value:a.bid_amount||"-"}),e.jsx(u,{label:"Campaign ID",value:(_==null?void 0:_.id)||"-"})]}),e.jsx("p",{className:"reader-campaign-preview-note",children:"Preview updates from the same campaign fields shown in the form."})]})]})]})]})}const ee=`
  .reader-campaign-create-page,
  .reader-campaign-create-page * {
    box-sizing: border-box;
  }

  .reader-campaign-create-page {
    width: 100%;
    max-width: 1204px;
    margin: 0 auto;
    padding: 24px 32px 48px;
    color: #0f1421;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .reader-campaign-context {
    min-height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 12px 18px;
    border: 1px solid #e3e8f0;
    border-radius: 12px;
    background: #ffffff;
  }

  .reader-campaign-context-copy {
    min-width: 0;
  }

  .reader-campaign-context-copy h1 {
    margin: 0;
    font-size: 16px;
    line-height: 1.25;
    font-weight: 650;
    color: #0f1421;
  }

  .reader-campaign-context-copy p {
    margin: 4px 0 0;
    font-size: 12px;
    line-height: 1.4;
    color: #6e7a91;
  }

  .reader-campaign-context-actions {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .reader-campaign-wallet {
    min-width: 176px;
    min-height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 12px;
    border-radius: 8px;
    background: #f6f7fb;
    color: #333b4f;
    font-size: 12px;
    white-space: nowrap;
  }

  .reader-campaign-wallet span,
  .reader-campaign-wallet strong {
    font-weight: 650;
  }

  .reader-campaign-back,
  .reader-campaign-secondary {
    text-decoration: none;
  }

  .reader-campaign-back {
    min-width: 146px;
    min-height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 14px;
    border: 1px solid #d6dbe5;
    border-radius: 8px;
    background: #ffffff;
    color: #141a26;
    font-size: 12px;
    font-weight: 550;
  }

  .reader-campaign-alert {
    margin-top: 14px;
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 13px;
    line-height: 1.45;
  }

  .reader-campaign-alert.error {
    border: 1px solid #fecdd3;
    background: #fff1f2;
    color: #be123c;
  }

  .reader-campaign-alert.success {
    border: 1px solid #bbf7d0;
    background: #ecfdf5;
    color: #166534;
  }

  .reader-campaign-layout {
    display: grid;
    grid-template-columns: minmax(0, 752px) minmax(300px, 368px);
    align-items: start;
    gap: 20px;
    margin-top: 20px;
  }

  .reader-campaign-form-card,
  .reader-campaign-preview-card {
    min-width: 0;
    border: 1px solid #e3e8f0;
    border-radius: 14px;
    background: #ffffff;
  }

  .reader-campaign-form-card {
    display: grid;
    gap: 20px;
    padding: 22px;
  }

  .reader-campaign-card-heading h2,
  .reader-campaign-preview-head h2 {
    margin: 0;
    color: #0f1421;
    font-weight: 650;
  }

  .reader-campaign-card-heading h2 {
    font-size: 18px;
    line-height: 1.25;
  }

  .reader-campaign-card-heading p {
    margin: 4px 0 0;
    color: #6e7a91;
    font-size: 12px;
    line-height: 1.4;
  }

  .reader-campaign-fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .reader-campaign-field {
    min-width: 0;
    display: grid;
    gap: 7px;
  }

  .reader-campaign-field.full {
    grid-column: 1 / -1;
  }

  .reader-campaign-label {
    color: #20242c;
    font-size: 14px;
    line-height: 1.3;
    font-weight: 500;
  }

  .reader-campaign-field input,
  .reader-campaign-field select,
  .reader-campaign-field textarea {
    width: 100%;
    border: 1px solid #d6dbe5;
    border-radius: 8px;
    background: #ffffff;
    color: #141a26;
    font: inherit;
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .reader-campaign-field input,
  .reader-campaign-field select {
    min-height: 42px;
    padding: 0 14px;
  }

  .reader-campaign-field textarea {
    min-height: 82px;
    padding: 12px 14px;
    line-height: 1.45;
    resize: vertical;
  }

  .reader-campaign-field input:focus,
  .reader-campaign-field select:focus,
  .reader-campaign-field textarea:focus {
    border-color: #8fa6d3;
    box-shadow: 0 0 0 3px rgba(84, 118, 181, 0.12);
  }

  .reader-campaign-field input:disabled,
  .reader-campaign-field select:disabled,
  .reader-campaign-field textarea:disabled {
    cursor: not-allowed;
    background: #f8fafc;
    color: #7a8597;
  }

  .reader-campaign-field input::placeholder,
  .reader-campaign-field textarea::placeholder {
    color: #a7adb8;
  }

  .reader-campaign-upload-section {
    display: grid;
    gap: 12px;
  }

  .reader-campaign-upload-section h3 {
    margin: 0;
    color: #0f1421;
    font-size: 16px;
    line-height: 1.25;
    font-weight: 650;
  }

  .reader-campaign-upload {
    min-height: 94px;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border: 1px dashed #c7cfde;
    border-radius: 10px;
    background: #f9fafb;
    cursor: pointer;
  }

  .reader-campaign-upload.disabled {
    cursor: not-allowed;
    opacity: 0.68;
  }

  .reader-campaign-upload input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .reader-campaign-upload-mark {
    flex: 0 0 40px;
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border: 1px solid #d6dbe5;
    border-radius: 8px;
    background: #ffffff;
    color: #2e384d;
    font-size: 20px;
    font-weight: 500;
  }

  .reader-campaign-upload-copy {
    min-width: 0;
    display: grid;
    gap: 4px;
  }

  .reader-campaign-upload-copy strong {
    overflow: hidden;
    color: #141a26;
    font-size: 13px;
    font-weight: 650;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .reader-campaign-upload-copy small {
    color: #738099;
    font-size: 11px;
    line-height: 1.35;
  }

  .reader-campaign-workflow-note {
    min-height: 42px;
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border: 1px solid #d1def5;
    border-radius: 8px;
    background: #f6f9fe;
    color: #384d73;
    font-size: 11px;
    line-height: 1.4;
  }

  .reader-campaign-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .reader-campaign-primary,
  .reader-campaign-secondary {
    min-height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 650;
  }

  .reader-campaign-primary {
    min-width: 160px;
    padding: 0 18px;
    border: 1px solid #121726;
    background: #121726;
    color: #ffffff;
    cursor: pointer;
  }

  .reader-campaign-primary:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  .reader-campaign-secondary {
    min-width: 96px;
    padding: 0 16px;
    border: 1px solid #d6dbe5;
    background: #ffffff;
    color: #141a26;
    font-weight: 550;
  }

  .reader-campaign-secondary.disabled {
    pointer-events: none;
    opacity: 0.6;
  }

  .reader-campaign-preview-card {
    position: sticky;
    top: 92px;
    display: grid;
    gap: 16px;
    padding: 20px;
  }

  .reader-campaign-preview-head {
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .reader-campaign-preview-head h2 {
    font-size: 15px;
  }

  .reader-campaign-preview-head span {
    min-width: 52px;
    min-height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: #f5f6f9;
    color: #66738c;
    font-size: 9px;
    font-weight: 750;
    letter-spacing: 0.04em;
  }

  .reader-campaign-ad-preview {
    overflow: hidden;
    border: 1px solid #e0e5ed;
    border-radius: 12px;
    background: #ffffff;
  }

  .reader-campaign-preview-media {
    height: 220px;
    display: grid;
    place-items: center;
    overflow: hidden;
    background: #f2f5f9;
    color: #8c96a8;
    font-size: 13px;
    font-weight: 500;
  }

  .reader-campaign-preview-media img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .reader-campaign-preview-copy {
    min-height: 190px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 16px;
  }

  .reader-campaign-preview-copy small {
    max-width: 100%;
    overflow: hidden;
    color: #738099;
    font-size: 9px;
    font-weight: 750;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .reader-campaign-preview-copy h3 {
    width: 100%;
    margin: 0;
    color: #0f1421;
    font-size: 19px;
    line-height: 1.2;
    font-weight: 750;
    overflow-wrap: anywhere;
  }

  .reader-campaign-preview-copy p {
    min-height: 44px;
    margin: 0;
    color: #66738a;
    font-size: 12px;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .reader-campaign-preview-copy button {
    min-width: 98px;
    min-height: 34px;
    padding: 0 12px;
    border: 0;
    border-radius: 7px;
    background: #1a5cd4;
    color: #ffffff;
    font-size: 11px;
    font-weight: 650;
    pointer-events: none;
  }

  .reader-campaign-preview-summary {
    display: grid;
    gap: 4px;
    padding: 10px 12px;
    border: 1px solid #e3e8f0;
    border-radius: 10px;
    background: #f9fafb;
  }

  .reader-campaign-preview-row {
    min-height: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    border-bottom: 1px solid #f0f2f5;
    font-size: 11px;
  }

  .reader-campaign-preview-row:last-child {
    border-bottom: 0;
  }

  .reader-campaign-preview-row span {
    color: #738099;
  }

  .reader-campaign-preview-row strong {
    max-width: 58%;
    overflow: hidden;
    color: #141a26;
    font-weight: 650;
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .reader-campaign-preview-note {
    margin: 0;
    color: #7a87a1;
    font-size: 10px;
    line-height: 1.4;
  }

  @media (max-width: 1100px) {
    .reader-campaign-create-page {
      padding-right: 24px;
      padding-left: 24px;
    }

    .reader-campaign-layout {
      grid-template-columns: minmax(0, 1fr);
    }

    .reader-campaign-preview-card {
      position: static;
    }
  }

  @media (max-width: 767px) {
    .reader-campaign-create-page {
      width: calc(100% - 16px);
      margin: 0 8px;
      padding: 16px 0 32px;
    }

    .reader-campaign-context {
      min-height: 112px;
      align-items: stretch;
      flex-direction: column;
      gap: 10px;
      padding: 14px;
    }

    .reader-campaign-context-copy h1 {
      font-size: 22px;
      line-height: 1.18;
      font-weight: 750;
    }

    .reader-campaign-context-copy p {
      display: none;
    }

    .reader-campaign-context-actions {
      width: 100%;
      justify-content: space-between;
    }

    .reader-campaign-wallet {
      min-width: 0;
      min-height: 32px;
      padding: 0 12px;
      font-size: 11px;
    }

    .reader-campaign-back {
      min-width: 0;
      min-height: 32px;
      padding: 0;
      border: 0;
      background: transparent;
      color: #334f8c;
      font-size: 11px;
    }

    .reader-campaign-alert {
      margin-top: 10px;
      border-radius: 9px;
      padding: 11px 12px;
      font-size: 12px;
    }

    .reader-campaign-layout {
      gap: 16px;
      margin-top: 16px;
    }

    .reader-campaign-form-card,
    .reader-campaign-preview-card {
      border-radius: 12px;
    }

    .reader-campaign-form-card {
      gap: 14px;
      padding: 16px;
    }

    .reader-campaign-card-heading h2 {
      font-size: 16px;
    }

    .reader-campaign-card-heading p {
      font-size: 11px;
    }

    .reader-campaign-fields {
      grid-template-columns: minmax(0, 1fr);
      gap: 12px;
    }

    .reader-campaign-label {
      font-size: 13px;
    }

    .reader-campaign-field input,
    .reader-campaign-field select {
      min-height: 42px;
      padding: 0 12px;
      font-size: 13px;
    }

    .reader-campaign-field textarea {
      min-height: 82px;
      padding: 11px 12px;
      font-size: 13px;
    }

    .reader-campaign-upload-section h3 {
      font-size: 15px;
    }

    .reader-campaign-upload {
      min-height: 106px;
      align-items: flex-start;
      flex-direction: column;
      gap: 5px;
      padding: 14px;
    }

    .reader-campaign-upload-mark {
      display: none;
    }

    .reader-campaign-upload-copy {
      width: 100%;
      gap: 5px;
    }

    .reader-campaign-upload-copy strong {
      font-size: 13px;
    }

    .reader-campaign-upload-copy small {
      font-size: 10px;
      white-space: normal;
    }

    .reader-campaign-workflow-note {
      min-height: 58px;
      font-size: 10px;
    }

    .reader-campaign-actions {
      align-items: stretch;
      flex-direction: column;
    }

    .reader-campaign-primary,
    .reader-campaign-secondary {
      width: 100%;
    }

    .reader-campaign-preview-card {
      gap: 14px;
      padding: 16px;
    }

    .reader-campaign-preview-media {
      height: 180px;
      font-size: 12px;
    }

    .reader-campaign-preview-copy {
      min-height: 170px;
      gap: 7px;
      padding: 14px;
    }

    .reader-campaign-preview-copy small {
      font-size: 8px;
    }

    .reader-campaign-preview-copy h3 {
      font-size: 17px;
    }

    .reader-campaign-preview-copy p {
      min-height: 36px;
      font-size: 11px;
    }

    .reader-campaign-preview-copy button {
      min-width: 94px;
      min-height: 32px;
      font-size: 10px;
    }

    .reader-campaign-preview-summary {
      gap: 2px;
      padding: 9px 11px;
    }

    .reader-campaign-preview-row {
      min-height: 19px;
      font-size: 10px;
    }

    .reader-campaign-preview-note {
      display: none;
    }
  }
`;export{ne as default};
