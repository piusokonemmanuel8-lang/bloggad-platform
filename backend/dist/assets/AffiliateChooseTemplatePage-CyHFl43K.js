import{f as C,i as T,r as o,j as e,R,A as N,h as v,k as P,a as _}from"./index-D7wY-Nn2.js";import{C as L}from"./circle-alert-BxSISDFL.js";import{C as A}from"./circle-check-DwQtcZzx.js";import{C as E}from"./crown-9tuqvcLd.js";function I(a=""){const i=String(a).toLowerCase();return i==="active"||i==="published"?"affiliate-choose-template-status active":i==="inactive"?"affiliate-choose-template-status inactive":i==="draft"||i==="pending"?"affiliate-choose-template-status draft":"affiliate-choose-template-status neutral"}async function B(){const{data:a}=await _.get("/api/affiliate/templates/blog");return(a==null?void 0:a.templates)||[]}function q(){const a=C(),[i]=T(),n=i.get("product_id")||"",[f,z]=o.useState([]),[s,x]=o.useState(""),[S,g]=o.useState(!0),[p,u]=o.useState(!1),[b,d]=o.useState(""),j=async(t=!1)=>{var r,y;try{d(""),t?u(!0):g(!0);const h=(await B()).filter(m=>String((m==null?void 0:m.status)||"").toLowerCase()==="active");z(h),!s&&h.length&&x(String(h[0].id))}catch(c){d(((y=(r=c==null?void 0:c.response)==null?void 0:r.data)==null?void 0:y.message)||"Failed to load affiliate blog templates")}finally{g(!1),u(!1)}};o.useEffect(()=>{j()},[]);const l=o.useMemo(()=>f.find(t=>String(t.id)===String(s))||null,[f,s]),w=()=>{if(!s){d("Please choose a template");return}const t=new URLSearchParams;n&&t.set("product_id",n),t.set("template_id",s),a(`/affiliate/posts/create?${t.toString()}`)};return S?e.jsxs("div",{className:"affiliate-choose-template-page",children:[e.jsx("style",{children:k}),e.jsx("div",{className:"affiliate-choose-template-loading-wrap",children:e.jsxs("div",{className:"affiliate-choose-template-loading-card",children:[e.jsx("div",{className:"affiliate-choose-template-spinner"}),e.jsx("p",{children:"Loading templates..."})]})})]}):e.jsxs("div",{className:"affiliate-choose-template-page",children:[e.jsx("style",{children:k}),e.jsxs("section",{className:"affiliate-choose-template-hero",children:[e.jsxs("div",{className:"affiliate-choose-template-hero-copy",children:[e.jsx("div",{className:"affiliate-choose-template-badge",children:"Blog templates"}),e.jsx("h1",{className:"affiliate-choose-template-title",children:"Choose Blog Template"}),e.jsx("p",{className:"affiliate-choose-template-subtitle",children:"Select the template you want to use for this product post before creating the content."})]}),e.jsxs("div",{className:"affiliate-choose-template-hero-actions",children:[e.jsxs("button",{type:"button",className:"affiliate-choose-template-btn secondary",onClick:()=>j(!0),disabled:p,children:[e.jsx(R,{size:16,className:p?"spin":""}),p?"Refreshing...":"Refresh"]}),e.jsxs("button",{className:"affiliate-choose-template-btn primary",type:"button",onClick:w,disabled:!s,children:["Continue",e.jsx(N,{size:16})]})]})]}),b?e.jsxs("div",{className:"affiliate-choose-template-alert error",children:[e.jsx(L,{size:18}),e.jsx("span",{children:b})]}):null,e.jsxs("section",{className:"affiliate-choose-template-grid-shell",children:[e.jsx("div",{className:"affiliate-choose-template-grid",children:f.length?f.map(t=>{const r=String(s)===String(t.id);return e.jsxs("button",{type:"button",onClick:()=>x(String(t.id)),className:`affiliate-choose-template-card${r?" active":""}`,children:[e.jsxs("div",{className:"affiliate-choose-template-image-wrap",children:[t.preview_image?e.jsx("img",{src:t.preview_image,alt:t.name,className:"affiliate-choose-template-image"}):e.jsxs("div",{className:"affiliate-choose-template-image-placeholder",children:[e.jsx(v,{size:28}),e.jsx("span",{children:"No preview"})]}),r?e.jsxs("div",{className:"affiliate-choose-template-selected-badge",children:[e.jsx(A,{size:16}),"Selected"]}):null]}),e.jsxs("div",{className:"affiliate-choose-template-card-body",children:[e.jsxs("div",{className:"affiliate-choose-template-card-top",children:[e.jsx("h3",{className:"affiliate-choose-template-card-title",children:t.name}),e.jsxs("div",{className:"affiliate-choose-template-card-tags",children:[e.jsx("span",{className:I(t.status),children:t.status||"draft"}),e.jsx("span",{className:"affiliate-choose-template-premium-pill",children:t.is_premium?e.jsxs(e.Fragment,{children:[e.jsx(E,{size:13}),"Premium"]}):e.jsxs(e.Fragment,{children:[e.jsx(P,{size:13}),"Standard"]})})]})]}),e.jsx("p",{className:"affiliate-choose-template-card-text",children:t.description||"No description"})]})]},t.id)}):e.jsxs("div",{className:"affiliate-choose-template-empty",children:[e.jsx(v,{size:32}),e.jsx("h3",{children:"No templates found"}),e.jsx("p",{children:"There are no active blog templates available for your current plan right now."})]})}),l?e.jsxs("aside",{className:"affiliate-choose-template-side-panel",children:[e.jsx("p",{className:"affiliate-choose-template-side-kicker",children:"Selected template"}),e.jsx("h2",{className:"affiliate-choose-template-side-title",children:l.name}),e.jsx("p",{className:"affiliate-choose-template-side-text",children:l.description||"No description"}),e.jsxs("div",{className:"affiliate-choose-template-side-list",children:[e.jsxs("div",{className:"affiliate-choose-template-side-row",children:[e.jsx("span",{children:"Status"}),e.jsx("strong",{children:l.status||"-"})]}),e.jsxs("div",{className:"affiliate-choose-template-side-row",children:[e.jsx("span",{children:"Premium"}),e.jsx("strong",{children:l.is_premium?"Yes":"No"})]}),e.jsxs("div",{className:"affiliate-choose-template-side-row",children:[e.jsx("span",{children:"Template ID"}),e.jsx("strong",{children:l.id})]}),e.jsxs("div",{className:"affiliate-choose-template-side-row",children:[e.jsx("span",{children:"Product link"}),e.jsx("strong",{children:n||"-"})]})]}),e.jsxs("button",{className:"affiliate-choose-template-btn primary full",type:"button",onClick:w,children:["Use This Template",e.jsx(N,{size:16})]})]}):null]})]})}const k=`
  * {
    box-sizing: border-box;
  }

  .affiliate-choose-template-page {
    width: 100%;
  }

  .affiliate-choose-template-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-choose-template-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-choose-template-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliateChooseTemplateSpin 0.8s linear infinite;
  }

  @keyframes affiliateChooseTemplateSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: affiliateChooseTemplateSpin 0.8s linear infinite;
  }

  .affiliate-choose-template-hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.05);
    margin-bottom: 20px;
  }

  .affiliate-choose-template-badge {
    display: inline-flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 999px;
    background: #111827;
    color: #ffffff;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .affiliate-choose-template-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-choose-template-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-choose-template-hero-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-choose-template-btn {
    height: 46px;
    padding: 0 16px;
    border-radius: 14px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    color: #111827;
    font-size: 14px;
    font-weight: 800;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .affiliate-choose-template-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-choose-template-btn.full {
    width: 100%;
  }

  .affiliate-choose-template-grid-shell {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) 340px;
    gap: 20px;
  }

  .affiliate-choose-template-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .affiliate-choose-template-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
    cursor: pointer;
    text-align: left;
    transition: 0.2s ease;
    padding: 0;
    color: inherit;
  }

  .affiliate-choose-template-card.active {
    border-color: #111827;
    transform: translateY(-1px);
    box-shadow: 0 22px 45px rgba(15, 23, 42, 0.08);
  }

  .affiliate-choose-template-image-wrap {
    position: relative;
    width: 100%;
    height: 240px;
    background: #f8fafc;
    border-bottom: 1px solid #eef2f7;
  }

  .affiliate-choose-template-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .affiliate-choose-template-image-placeholder {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    color: #6b7280;
    gap: 8px;
    text-align: center;
  }

  .affiliate-choose-template-selected-badge {
    position: absolute;
    top: 14px;
    right: 14px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    background: #111827;
    color: #ffffff;
    font-size: 12px;
    font-weight: 800;
  }

  .affiliate-choose-template-card-body {
    padding: 18px;
  }

  .affiliate-choose-template-card-top {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 12px;
  }

  .affiliate-choose-template-card-title {
    margin: 0;
    font-size: 19px;
    line-height: 1.3;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-choose-template-card-tags {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .affiliate-choose-template-status,
  .affiliate-choose-template-premium-pill {
    display: inline-flex;
    width: fit-content;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    text-transform: capitalize;
    border: 1px solid transparent;
    gap: 6px;
  }

  .affiliate-choose-template-status.active {
    background: #ecfdf3;
    color: #027a48;
    border-color: #abefc6;
  }

  .affiliate-choose-template-status.inactive {
    background: #fff7ed;
    color: #b54708;
    border-color: #fed7aa;
  }

  .affiliate-choose-template-status.draft {
    background: #f8fafc;
    color: #475467;
    border-color: #e4e7ec;
  }

  .affiliate-choose-template-status.neutral {
    background: #eef2f7;
    color: #344054;
    border-color: #dbe2ea;
  }

  .affiliate-choose-template-premium-pill {
    background: #f8fafc;
    color: #111827;
    border-color: #e5e7eb;
  }

  .affiliate-choose-template-card-text {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.7;
  }

  .affiliate-choose-template-side-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
    height: fit-content;
    position: sticky;
    top: 94px;
  }

  .affiliate-choose-template-side-kicker {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .affiliate-choose-template-side-title {
    margin: 0;
    font-size: 24px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-choose-template-side-text {
    margin: 12px 0 18px;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.7;
  }

  .affiliate-choose-template-side-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 18px;
  }

  .affiliate-choose-template-side-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 16px;
    font-size: 14px;
  }

  .affiliate-choose-template-side-row span {
    color: #6b7280;
    font-weight: 700;
  }

  .affiliate-choose-template-side-row strong {
    color: #111827;
    font-weight: 900;
    text-align: right;
  }

  .affiliate-choose-template-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 20px;
  }

  .affiliate-choose-template-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-choose-template-empty {
    min-height: 320px;
    border: 1px dashed #dbe2ea;
    background: #ffffff;
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
    padding: 24px;
    grid-column: 1 / -1;
  }

  .affiliate-choose-template-empty h3 {
    margin: 0;
    color: #111827;
    font-weight: 900;
  }

  .affiliate-choose-template-empty p {
    margin: 0;
    color: #6b7280;
    line-height: 1.6;
  }

  @media (max-width: 1200px) {
    .affiliate-choose-template-grid-shell {
      grid-template-columns: 1fr;
    }

    .affiliate-choose-template-side-panel {
      position: static;
    }
  }

  @media (max-width: 991px) {
    .affiliate-choose-template-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-choose-template-title {
      font-size: 26px;
    }

    .affiliate-choose-template-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-choose-template-hero-actions {
      width: 100%;
    }
  }

  @media (max-width: 767px) {
    .affiliate-choose-template-title {
      font-size: 22px;
    }

    .affiliate-choose-template-subtitle {
      font-size: 14px;
    }

    .affiliate-choose-template-hero-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-choose-template-btn {
      width: 100%;
    }

    .affiliate-choose-template-image-wrap {
      height: 220px;
    }

    .affiliate-choose-template-side-row {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;export{q as default};
