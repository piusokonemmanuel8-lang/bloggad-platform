import{g as _,r as d,j as t,R,L as x,d as N,F as g,h as E,c as F,a as T,e as $}from"./index-D7wY-Nn2.js";import{F as M}from"./folder-kanban-BIrS0zl3.js";import{P as A}from"./package-CWs9dl4A.js";import{C as D}from"./circle-alert-BxSISDFL.js";function K(s=""){const o=String(s).toLowerCase();return o==="published"||o==="active"?"affiliate-product-posts-status active":o==="draft"||o==="pending"?"affiliate-product-posts-status draft":o==="inactive"?"affiliate-product-posts-status inactive":o==="rejected"||o==="suspended"?"affiliate-product-posts-status danger":"affiliate-product-posts-status neutral"}function q({post:s}){return t.jsxs("div",{className:"affiliate-product-posts-card",children:[t.jsx("div",{className:"affiliate-product-posts-image-wrap",children:s.featured_image?t.jsx("img",{src:s.featured_image,alt:s.title,className:"affiliate-product-posts-image"}):t.jsxs("div",{className:"affiliate-product-posts-image-placeholder",children:[t.jsx(g,{size:28}),t.jsx("span",{children:"No image"})]})}),t.jsxs("div",{className:"affiliate-product-posts-card-body",children:[t.jsxs("div",{className:"affiliate-product-posts-card-top",children:[t.jsx("h3",{className:"affiliate-product-posts-card-title",children:s.title}),t.jsx("span",{className:K(s.status),children:s.status||"draft"})]}),t.jsxs("div",{className:"affiliate-product-posts-meta-grid",children:[t.jsxs("div",{className:"affiliate-product-posts-meta-box",children:[t.jsx("span",{className:"affiliate-product-posts-meta-label",children:"Template"}),t.jsx("strong",{children:s.template_name||"-"})]}),t.jsxs("div",{className:"affiliate-product-posts-meta-box",children:[t.jsx("span",{className:"affiliate-product-posts-meta-label",children:"Category"}),t.jsx("strong",{children:s.category_name||"-"})]})]}),t.jsx("div",{className:"affiliate-product-posts-actions",children:t.jsxs(x,{className:"affiliate-product-posts-btn secondary",to:`/affiliate/posts/${s.id}/edit`,children:[t.jsx($,{size:16}),"Edit"]})})]})]})}function J(){const{id:s}=_(),[o,P]=d.useState(null),[r,z]=d.useState([]),[m,c]=d.useState([]),[k,h]=d.useState(!0),[f,b]=d.useState(!1),[j,w]=d.useState(""),[n,S]=d.useState(""),y=async(i=!1)=>{var l,e;try{w(""),i?b(!0):h(!0);const{data:a}=await T.get(`/api/affiliate/posts/product/${s}`),p=(a==null?void 0:a.posts)||[];P((a==null?void 0:a.product)||null),z(p),c(p)}catch(a){w(((e=(l=a==null?void 0:a.response)==null?void 0:l.data)==null?void 0:e.message)||"Failed to load product posts")}finally{h(!1),b(!1)}};d.useEffect(()=>{y()},[s]),d.useEffect(()=>{const i=n.trim().toLowerCase();if(!i){c(r);return}const l=r.filter(e=>{const a=String((e==null?void 0:e.title)||"").toLowerCase(),p=String((e==null?void 0:e.status)||"").toLowerCase(),C=String((e==null?void 0:e.template_name)||"").toLowerCase(),L=String((e==null?void 0:e.category_name)||"").toLowerCase();return a.includes(i)||p.includes(i)||C.includes(i)||L.includes(i)});c(l)},[n,r]);const u=d.useMemo(()=>{const i=r.length,l=r.filter(a=>["published","active"].includes(String(a.status||"").toLowerCase())).length,e=r.filter(a=>["draft","pending"].includes(String(a.status||"").toLowerCase())).length;return{total:i,published:l,drafts:e}},[r]);return k?t.jsxs("div",{className:"affiliate-product-posts-page",children:[t.jsx("style",{children:v}),t.jsx("div",{className:"affiliate-product-posts-loading-wrap",children:t.jsxs("div",{className:"affiliate-product-posts-loading-card",children:[t.jsx("div",{className:"affiliate-product-posts-spinner"}),t.jsx("p",{children:"Loading product posts..."})]})})]}):t.jsxs("div",{className:"affiliate-product-posts-page",children:[t.jsx("style",{children:v}),t.jsxs("section",{className:"affiliate-product-posts-hero",children:[t.jsxs("div",{className:"affiliate-product-posts-hero-copy",children:[t.jsx("div",{className:"affiliate-product-posts-badge",children:"Product content"}),t.jsx("h1",{className:"affiliate-product-posts-title",children:"Product Posts"}),t.jsx("p",{className:"affiliate-product-posts-subtitle",children:o?`Manage posts for ${o.title}.`:"Manage posts for this product."})]}),t.jsxs("div",{className:"affiliate-product-posts-hero-actions",children:[t.jsxs("button",{type:"button",className:"affiliate-product-posts-btn secondary",onClick:()=>y(!0),disabled:f,children:[t.jsx(R,{size:16,className:f?"spin":""}),f?"Refreshing...":"Refresh"]}),t.jsxs(x,{className:"affiliate-product-posts-btn primary",to:`/affiliate/posts/create?product_id=${s}`,children:[t.jsx(N,{size:16}),"Create Post"]})]})]}),t.jsxs("section",{className:"affiliate-product-posts-stats",children:[t.jsx("div",{className:"affiliate-product-posts-stat-card",children:t.jsxs("div",{className:"affiliate-product-posts-stat-top",children:[t.jsxs("div",{children:[t.jsx("p",{className:"affiliate-product-posts-stat-label",children:"Total Posts"}),t.jsx("h3",{className:"affiliate-product-posts-stat-value",children:u.total})]}),t.jsx("div",{className:"affiliate-product-posts-stat-icon",children:t.jsx(g,{size:20})})]})}),t.jsx("div",{className:"affiliate-product-posts-stat-card",children:t.jsxs("div",{className:"affiliate-product-posts-stat-top",children:[t.jsxs("div",{children:[t.jsx("p",{className:"affiliate-product-posts-stat-label",children:"Published"}),t.jsx("h3",{className:"affiliate-product-posts-stat-value",children:u.published})]}),t.jsx("div",{className:"affiliate-product-posts-stat-icon",children:t.jsx(E,{size:20})})]})}),t.jsx("div",{className:"affiliate-product-posts-stat-card",children:t.jsxs("div",{className:"affiliate-product-posts-stat-top",children:[t.jsxs("div",{children:[t.jsx("p",{className:"affiliate-product-posts-stat-label",children:"Draft / Pending"}),t.jsx("h3",{className:"affiliate-product-posts-stat-value",children:u.drafts})]}),t.jsx("div",{className:"affiliate-product-posts-stat-icon",children:t.jsx(M,{size:20})})]})})]}),o?t.jsx("section",{className:"affiliate-product-posts-product-strip",children:t.jsxs("div",{className:"affiliate-product-posts-product-pill",children:[t.jsx(A,{size:16}),t.jsx("span",{children:"Product:"}),t.jsx("strong",{children:o.title})]})}):null,t.jsx("section",{className:"affiliate-product-posts-toolbar",children:t.jsxs("div",{className:"affiliate-product-posts-search",children:[t.jsx(F,{size:16}),t.jsx("input",{type:"text",placeholder:"Search posts by title, status, template, or category",value:n,onChange:i=>S(i.target.value)})]})}),j?t.jsxs("div",{className:"affiliate-product-posts-alert error",children:[t.jsx(D,{size:18}),t.jsx("span",{children:j})]}):null,m.length?t.jsx("section",{className:"affiliate-product-posts-grid",children:m.map(i=>t.jsx(q,{post:i},i.id))}):t.jsxs("section",{className:"affiliate-product-posts-empty",children:[t.jsx(g,{size:32}),t.jsx("h3",{children:r.length?"No matching posts found":"No posts yet for this product"}),t.jsx("p",{children:r.length?"Try another search keyword.":"Create the first content piece for this product."}),r.length?null:t.jsxs(x,{className:"affiliate-product-posts-btn primary",to:`/affiliate/posts/create?product_id=${s}`,children:[t.jsx(N,{size:16}),"Create Post"]})]})]})}const v=`
  * {
    box-sizing: border-box;
  }

  .affiliate-product-posts-page {
    width: 100%;
  }

  .affiliate-product-posts-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-product-posts-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-product-posts-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliateProductPostsSpin 0.8s linear infinite;
  }

  @keyframes affiliateProductPostsSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: affiliateProductPostsSpin 0.8s linear infinite;
  }

  .affiliate-product-posts-hero {
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

  .affiliate-product-posts-badge {
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

  .affiliate-product-posts-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-product-posts-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-product-posts-hero-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-product-posts-btn {
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

  .affiliate-product-posts-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-product-posts-btn.secondary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .affiliate-product-posts-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .affiliate-product-posts-stat-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 22px;
    padding: 20px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-product-posts-stat-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .affiliate-product-posts-stat-label {
    margin: 0 0 10px;
    font-size: 13px;
    color: #6b7280;
    font-weight: 700;
  }

  .affiliate-product-posts-stat-value {
    margin: 0;
    font-size: 30px;
    line-height: 1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-product-posts-stat-icon {
    width: 46px;
    height: 46px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    color: #111827;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .affiliate-product-posts-product-strip {
    margin-bottom: 20px;
  }

  .affiliate-product-posts-product-pill {
    width: fit-content;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 42px;
    padding: 0 14px;
    border-radius: 999px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
    color: #111827;
    font-size: 14px;
  }

  .affiliate-product-posts-product-pill span {
    color: #6b7280;
    font-weight: 700;
  }

  .affiliate-product-posts-product-pill strong {
    font-weight: 900;
  }

  .affiliate-product-posts-toolbar {
    margin-bottom: 20px;
  }

  .affiliate-product-posts-search {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 52px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    padding: 0 14px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-product-posts-search input {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: #111827;
    font-size: 14px;
  }

  .affiliate-product-posts-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 20px;
  }

  .affiliate-product-posts-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-product-posts-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .affiliate-product-posts-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-product-posts-image-wrap {
    width: 100%;
    height: 240px;
    background: #f8fafc;
    border-bottom: 1px solid #eef2f7;
  }

  .affiliate-product-posts-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .affiliate-product-posts-image-placeholder {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    color: #6b7280;
    gap: 8px;
    text-align: center;
  }

  .affiliate-product-posts-card-body {
    padding: 18px;
  }

  .affiliate-product-posts-card-top {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 14px;
  }

  .affiliate-product-posts-card-title {
    margin: 0;
    font-size: 18px;
    line-height: 1.35;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-product-posts-status {
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
  }

  .affiliate-product-posts-status.active {
    background: #ecfdf3;
    color: #027a48;
    border-color: #abefc6;
  }

  .affiliate-product-posts-status.inactive {
    background: #fff7ed;
    color: #b54708;
    border-color: #fed7aa;
  }

  .affiliate-product-posts-status.draft {
    background: #f8fafc;
    color: #475467;
    border-color: #e4e7ec;
  }

  .affiliate-product-posts-status.danger {
    background: #fef2f2;
    color: #b42318;
    border-color: #fecaca;
  }

  .affiliate-product-posts-status.neutral {
    background: #eef2f7;
    color: #344054;
    border-color: #dbe2ea;
  }

  .affiliate-product-posts-meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .affiliate-product-posts-meta-box {
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 16px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-product-posts-meta-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .affiliate-product-posts-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .affiliate-product-posts-empty {
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
  }

  .affiliate-product-posts-empty h3 {
    margin: 0;
    color: #111827;
    font-weight: 900;
  }

  .affiliate-product-posts-empty p {
    margin: 0 0 8px;
    color: #6b7280;
    line-height: 1.6;
    max-width: 420px;
  }

  @media (max-width: 1200px) {
    .affiliate-product-posts-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 991px) {
    .affiliate-product-posts-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-product-posts-title {
      font-size: 26px;
    }

    .affiliate-product-posts-stats {
      grid-template-columns: 1fr;
    }

    .affiliate-product-posts-hero-actions {
      width: 100%;
    }
  }

  @media (max-width: 767px) {
    .affiliate-product-posts-grid,
    .affiliate-product-posts-meta-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-product-posts-title {
      font-size: 22px;
    }

    .affiliate-product-posts-subtitle {
      font-size: 14px;
    }

    .affiliate-product-posts-hero-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-product-posts-btn {
      width: 100%;
    }

    .affiliate-product-posts-image-wrap {
      height: 220px;
    }
  }
`;export{J as default};
