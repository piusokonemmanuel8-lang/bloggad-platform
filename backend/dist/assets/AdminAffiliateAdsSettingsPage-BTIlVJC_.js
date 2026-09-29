import{r as c,j as e}from"./index-LXBBJt7I.js";import{a as _}from"./api-DFUreCUV.js";const h={minimum_budget:"10",product_cost_per_view:"0.0015",product_cost_per_click:"0.0700",post_cost_per_view:"0.0010",post_cost_per_click:"0.0400",website_cost_per_view:"0.0010",website_cost_per_click:"0.0500",currency:"USD"};function N(){const[a,f]=c.useState(h),[w,g]=c.useState(!0),[x,u]=c.useState(!1),[m,b]=c.useState(""),[p,n]=c.useState("");async function d(){var s,o;try{g(!0),n("");const{data:t}=await _.get("/admin/affiliate-ads-settings"),i=(t==null?void 0:t.settings)||h;f({minimum_budget:String(i.minimum_budget??"10"),product_cost_per_view:String(i.product_cost_per_view??"0.0015"),product_cost_per_click:String(i.product_cost_per_click??"0.0700"),post_cost_per_view:String(i.post_cost_per_view??"0.0010"),post_cost_per_click:String(i.post_cost_per_click??"0.0400"),website_cost_per_view:String(i.website_cost_per_view??"0.0010"),website_cost_per_click:String(i.website_cost_per_click??"0.0500"),currency:i.currency||"USD"})}catch(t){n(((o=(s=t==null?void 0:t.response)==null?void 0:s.data)==null?void 0:o.message)||"Unable to load affiliate ads settings.")}finally{g(!1)}}c.useEffect(()=>{d()},[]);function r(s,o){f(t=>({...t,[s]:o}))}async function j(s){var o,t;s.preventDefault();try{u(!0),b(""),n("");const i={minimum_budget:Number(a.minimum_budget),product_cost_per_view:Number(a.product_cost_per_view),product_cost_per_click:Number(a.product_cost_per_click),post_cost_per_view:Number(a.post_cost_per_view),post_cost_per_click:Number(a.post_cost_per_click),website_cost_per_view:Number(a.website_cost_per_view),website_cost_per_click:Number(a.website_cost_per_click),currency:a.currency},{data:l}=await _.put("/admin/affiliate-ads-settings",i);b((l==null?void 0:l.message)||"Affiliate ads settings updated successfully."),await d()}catch(i){n(((t=(o=i==null?void 0:i.response)==null?void 0:o.data)==null?void 0:t.message)||"Unable to save affiliate ads settings.")}finally{u(!1)}}return e.jsxs("div",{className:"aas-page",children:[e.jsx("style",{children:v}),e.jsxs("section",{className:"aas-hero",children:[e.jsxs("div",{children:[e.jsx("span",{className:"aas-pill",children:"Affiliate Ads Settings"}),e.jsx("h1",{children:"Set view and click prices for affiliate promotions."}),e.jsx("p",{children:"Control the minimum budget and charge rates for product, post, and website ads. Affiliates will see these prices before creating campaigns."})]}),e.jsxs("div",{className:"aas-rate-card",children:[e.jsx("span",{children:"Minimum Budget"}),e.jsxs("strong",{children:[a.currency," ",Number(a.minimum_budget||0).toFixed(2)]}),e.jsx("p",{children:"Applies to new campaigns and top-ups."})]})]}),(m||p)&&e.jsx("div",{className:p?"aas-alert error":"aas-alert success",children:p||m}),e.jsxs("form",{onSubmit:j,className:"aas-card",children:[e.jsxs("div",{className:"aas-card-head",children:[e.jsxs("div",{children:[e.jsx("h2",{children:"Pricing Rules"}),e.jsx("p",{children:"Use very small decimal prices for views and higher prices for clicks."})]}),e.jsx("button",{type:"button",onClick:d,className:"aas-soft-btn",children:"Refresh"})]}),w?e.jsx("div",{className:"aas-empty",children:"Loading settings..."}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"aas-grid",children:[e.jsxs("label",{className:"aas-field",children:[e.jsx("span",{children:"Minimum Budget"}),e.jsx("input",{type:"number",min:"0.01",step:"0.0001",value:a.minimum_budget,onChange:s=>r("minimum_budget",s.target.value)})]}),e.jsxs("label",{className:"aas-field",children:[e.jsx("span",{children:"Currency"}),e.jsxs("select",{value:a.currency,onChange:s=>r("currency",s.target.value),children:[e.jsx("option",{value:"USD",children:"USD"}),e.jsx("option",{value:"NGN",children:"NGN"})]})]})]}),e.jsxs("div",{className:"aas-sections",children:[e.jsxs("section",{className:"aas-pricing-box",children:[e.jsx("h3",{children:"Product Promotion"}),e.jsx("p",{children:"Shown inside product-featured areas."}),e.jsxs("label",{className:"aas-field",children:[e.jsx("span",{children:"Product Cost Per View"}),e.jsx("input",{type:"number",min:"0",step:"0.0001",value:a.product_cost_per_view,onChange:s=>r("product_cost_per_view",s.target.value)})]}),e.jsxs("label",{className:"aas-field",children:[e.jsx("span",{children:"Product Cost Per Click"}),e.jsx("input",{type:"number",min:"0",step:"0.0001",value:a.product_cost_per_click,onChange:s=>r("product_cost_per_click",s.target.value)})]})]}),e.jsxs("section",{className:"aas-pricing-box",children:[e.jsx("h3",{children:"Post Promotion"}),e.jsx("p",{children:"Shown inside promoted blog/post areas."}),e.jsxs("label",{className:"aas-field",children:[e.jsx("span",{children:"Post Cost Per View"}),e.jsx("input",{type:"number",min:"0",step:"0.0001",value:a.post_cost_per_view,onChange:s=>r("post_cost_per_view",s.target.value)})]}),e.jsxs("label",{className:"aas-field",children:[e.jsx("span",{children:"Post Cost Per Click"}),e.jsx("input",{type:"number",min:"0",step:"0.0001",value:a.post_cost_per_click,onChange:s=>r("post_cost_per_click",s.target.value)})]})]}),e.jsxs("section",{className:"aas-pricing-box",children:[e.jsx("h3",{children:"Website Promotion"}),e.jsx("p",{children:"Shown inside featured website sections."}),e.jsxs("label",{className:"aas-field",children:[e.jsx("span",{children:"Website Cost Per View"}),e.jsx("input",{type:"number",min:"0",step:"0.0001",value:a.website_cost_per_view,onChange:s=>r("website_cost_per_view",s.target.value)})]}),e.jsxs("label",{className:"aas-field",children:[e.jsx("span",{children:"Website Cost Per Click"}),e.jsx("input",{type:"number",min:"0",step:"0.0001",value:a.website_cost_per_click,onChange:s=>r("website_cost_per_click",s.target.value)})]})]})]}),e.jsx("button",{type:"submit",disabled:x,className:"aas-primary-btn",children:x?"Saving...":"Save Affiliate Ads Settings"})]})]})]})}const v=`
  .aas-page {
    min-height: calc(100vh - 120px);
    background:
      radial-gradient(circle at top left, rgba(14, 165, 233, 0.12), transparent 28%),
      radial-gradient(circle at top right, rgba(168, 85, 247, 0.12), transparent 24%),
      #f5f7fb;
    color: #0f172a;
    padding: 4px;
  }

  .aas-hero {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 28px;
    align-items: center;
    margin-bottom: 22px;
    padding: 34px;
    border-radius: 28px;
    background: linear-gradient(135deg, #07111f, #0f172a 48%, #020617);
    color: #ffffff;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
  }

  .aas-pill {
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

  .aas-hero h1 {
    margin: 0;
    max-width: 760px;
    font-size: 38px;
    line-height: 1.05;
    font-weight: 950;
    letter-spacing: -0.04em;
    color: #ffffff;
  }

  .aas-hero p {
    margin: 16px 0 0;
    max-width: 720px;
    color: #e2e8f0;
    font-size: 15px;
    line-height: 1.75;
  }

  .aas-rate-card {
    padding: 24px;
    border-radius: 24px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.18);
  }

  .aas-rate-card span {
    display: block;
    color: #f8fafc;
    font-size: 13px;
    font-weight: 900;
    margin-bottom: 10px;
  }

  .aas-rate-card strong {
    display: block;
    color: #ffffff;
    font-size: 34px;
    line-height: 1;
    font-weight: 950;
  }

  .aas-rate-card p {
    margin: 12px 0 0;
    color: #cbd5e1;
    font-size: 13px;
  }

  .aas-alert {
    margin-bottom: 18px;
    padding: 15px 18px;
    border-radius: 18px;
    font-size: 14px;
    font-weight: 800;
  }

  .aas-alert.success {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
  }

  .aas-alert.error {
    background: #fff1f2;
    border: 1px solid #fecdd3;
    color: #9f1239;
  }

  .aas-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  }

  .aas-card-head {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
    margin-bottom: 22px;
  }

  .aas-card h2 {
    margin: 0;
    color: #0f172a;
    font-size: 24px;
    font-weight: 950;
    letter-spacing: -0.03em;
  }

  .aas-card-head p {
    margin: 7px 0 0;
    color: #64748b;
    font-size: 14px;
    line-height: 1.5;
  }

  .aas-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    margin-bottom: 20px;
  }

  .aas-sections {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .aas-pricing-box {
    border-radius: 24px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 20px;
  }

  .aas-pricing-box h3 {
    margin: 0;
    color: #0f172a;
    font-size: 18px;
    font-weight: 950;
  }

  .aas-pricing-box p {
    margin: 7px 0 18px;
    color: #64748b;
    font-size: 13px;
    line-height: 1.5;
  }

  .aas-field {
    display: block;
    margin-bottom: 16px;
  }

  .aas-field span {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    color: #334155;
    font-weight: 900;
  }

  .aas-field input,
  .aas-field select {
    width: 100%;
    border: 1px solid #dbe3ef;
    background: #ffffff;
    border-radius: 16px;
    padding: 13px 14px;
    color: #0f172a;
    font-size: 14px;
    outline: none;
  }

  .aas-field input:focus,
  .aas-field select:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.14);
  }

  .aas-primary-btn,
  .aas-soft-btn {
    cursor: pointer;
    font-weight: 950;
    transition: 0.2s ease;
  }

  .aas-primary-btn {
    width: 100%;
    border: 0;
    margin-top: 10px;
    padding: 15px 18px;
    border-radius: 18px;
    background: linear-gradient(135deg, #06b6d4, #3b82f6);
    color: #ffffff;
    box-shadow: 0 14px 35px rgba(59, 130, 246, 0.25);
  }

  .aas-primary-btn:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .aas-soft-btn {
    border: 1px solid #e2e8f0;
    padding: 11px 15px;
    border-radius: 999px;
    background: #f1f5f9;
    color: #0f172a;
  }

  .aas-empty {
    display: grid;
    place-items: center;
    min-height: 220px;
    border-radius: 24px;
    background: #f8fafc;
    border: 1px dashed #cbd5e1;
    color: #64748b;
    text-align: center;
    padding: 34px;
  }

  @media (max-width: 1100px) {
    .aas-hero,
    .aas-sections {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 700px) {
    .aas-page {
      padding: 0;
    }

    .aas-hero,
    .aas-card {
      border-radius: 20px;
      padding: 20px;
    }

    .aas-hero h1 {
      font-size: 28px;
    }

    .aas-grid {
      grid-template-columns: 1fr;
    }

    .aas-card-head {
      flex-direction: column;
    }
  }
`;export{N as default};
