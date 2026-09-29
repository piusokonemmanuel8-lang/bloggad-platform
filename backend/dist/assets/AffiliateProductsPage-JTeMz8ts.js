import{b as H,j as e,r,c as G,L as E,R as J,d as T,a as L,F as O}from"./index-LXBBJt7I.js";import{f as I}from"./formatCurrency-DPAzH823.js";import{v as V}from"./validateSupgadUrl-KW1pmdpE.js";import{C as B}from"./circle-alert-DsZo9igC.js";import{P as A}from"./package-BZvUXVf6.js";import{L as X}from"./layers-CY6ZhHm5.js";import{E as K}from"./eye-l-zUNvi7.js";import{T as Q}from"./tag-XMSxVyON.js";import{P as Y}from"./pencil-BZCp6GMt.js";function W(t){return t.pricing_type==="simple"?t.price!==null&&t.price!==void 0?I(t.price):"-":`${I(t.min_price||0)} - ${I(t.max_price||0)}`}function Z(t=""){const d=String(t).toLowerCase();return d==="active"||d==="published"?"affiliate-products-status active":d==="inactive"?"affiliate-products-status inactive":d==="draft"||d==="pending"?"affiliate-products-status draft":d==="rejected"||d==="suspended"?"affiliate-products-status danger":"affiliate-products-status neutral"}function ee({product:t}){return e.jsxs("div",{className:"affiliate-products-card",children:[e.jsx("div",{className:"affiliate-products-image-wrap",children:t.product_image?e.jsx("img",{src:t.product_image,alt:t.title,className:"affiliate-products-image"}):e.jsxs("div",{className:"affiliate-products-image-placeholder",children:[e.jsx(A,{size:28}),e.jsx("span",{children:"No image"})]})}),e.jsxs("div",{className:"affiliate-products-card-body",children:[e.jsx("div",{className:"affiliate-products-card-top",children:e.jsxs("div",{className:"affiliate-products-card-title-wrap",children:[e.jsx("h3",{className:"affiliate-products-card-title",children:t.title}),e.jsx("span",{className:Z(t.status),children:t.status||"draft"})]})}),e.jsxs("div",{className:"affiliate-products-meta-grid",children:[e.jsxs("div",{className:"affiliate-products-meta-box",children:[e.jsx("span",{className:"affiliate-products-meta-label",children:"Pricing type"}),e.jsx("strong",{children:t.pricing_type||"-"})]}),e.jsxs("div",{className:"affiliate-products-meta-box",children:[e.jsx("span",{className:"affiliate-products-meta-label",children:"Price"}),e.jsx("strong",{children:W(t)})]})]}),e.jsxs("div",{className:"affiliate-products-actions",children:[e.jsxs(E,{className:"affiliate-products-btn secondary",to:`/affiliate/products/${t.id}/edit`,children:[e.jsx(Y,{size:16}),"Edit"]}),e.jsxs(E,{className:"affiliate-products-btn secondary",to:`/affiliate/products/${t.id}/posts`,children:[e.jsx(O,{size:16}),"Posts"]})]})]})]})}function te(){const[t,d]=r.useState([]),[k,z]=r.useState([]),[R,N]=r.useState(!0),[C,x]=r.useState(!1),[a,w]=r.useState(""),[S,b]=r.useState(""),l=async(c=!1)=>{var j,f;try{w(""),c?x(!0):N(!0);const{data:p}=await L.get("/api/affiliate/products"),_=(p==null?void 0:p.products)||[];d(_),z(_)}catch(p){w(((f=(j=p==null?void 0:p.response)==null?void 0:j.data)==null?void 0:f.message)||"Failed to load products")}finally{N(!1),x(!1)}};r.useEffect(()=>{l()},[]),r.useEffect(()=>{const c=S.trim().toLowerCase();if(!c){z(t);return}const j=t.filter(f=>{const p=String((f==null?void 0:f.title)||"").toLowerCase(),_=String((f==null?void 0:f.status)||"").toLowerCase(),y=String((f==null?void 0:f.pricing_type)||"").toLowerCase();return p.includes(c)||_.includes(c)||y.includes(c)});z(j)},[S,t]);const h=r.useMemo(()=>{const c=t.length,j=t.filter(p=>["active","published"].includes(String(p.status||"").toLowerCase())).length,f=t.filter(p=>["draft","pending"].includes(String(p.status||"").toLowerCase())).length;return{total:c,active:j,draft:f}},[t]);return R?e.jsxs("div",{className:"affiliate-products-page",children:[e.jsx("style",{children:U}),e.jsx("div",{className:"affiliate-products-loading-wrap",children:e.jsxs("div",{className:"affiliate-products-loading-card",children:[e.jsx("div",{className:"affiliate-products-spinner"}),e.jsx("p",{children:"Loading products..."})]})})]}):e.jsxs("div",{className:"affiliate-products-page",children:[e.jsx("style",{children:U}),e.jsxs("section",{className:"affiliate-products-hero",children:[e.jsxs("div",{className:"affiliate-products-hero-copy",children:[e.jsx("div",{className:"affiliate-products-badge",children:"Product manager"}),e.jsx("h1",{className:"affiliate-products-title",children:"My Products"}),e.jsx("p",{className:"affiliate-products-subtitle",children:"Manage all products on your affiliate website from one clean dashboard page."})]}),e.jsxs("div",{className:"affiliate-products-hero-actions",children:[e.jsxs("button",{type:"button",className:"affiliate-products-btn secondary",onClick:()=>l(!0),disabled:C,children:[e.jsx(J,{size:16,className:C?"spin":""}),C?"Refreshing...":"Refresh"]}),e.jsxs(E,{className:"affiliate-products-btn primary",to:"/affiliate/products/create",children:[e.jsx(T,{size:16}),"Create Product"]})]})]}),e.jsxs("section",{className:"affiliate-products-stats",children:[e.jsx("div",{className:"affiliate-products-stat-card",children:e.jsxs("div",{className:"affiliate-products-stat-top",children:[e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-products-stat-label",children:"Total Products"}),e.jsx("h3",{className:"affiliate-products-stat-value",children:h.total})]}),e.jsx("div",{className:"affiliate-products-stat-icon",children:e.jsx(X,{size:20})})]})}),e.jsx("div",{className:"affiliate-products-stat-card",children:e.jsxs("div",{className:"affiliate-products-stat-top",children:[e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-products-stat-label",children:"Active"}),e.jsx("h3",{className:"affiliate-products-stat-value",children:h.active})]}),e.jsx("div",{className:"affiliate-products-stat-icon",children:e.jsx(K,{size:20})})]})}),e.jsx("div",{className:"affiliate-products-stat-card",children:e.jsxs("div",{className:"affiliate-products-stat-top",children:[e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-products-stat-label",children:"Draft / Pending"}),e.jsx("h3",{className:"affiliate-products-stat-value",children:h.draft})]}),e.jsx("div",{className:"affiliate-products-stat-icon",children:e.jsx(Q,{size:20})})]})})]}),e.jsx("section",{className:"affiliate-products-toolbar",children:e.jsxs("div",{className:"affiliate-products-search",children:[e.jsx(G,{size:16}),e.jsx("input",{type:"text",placeholder:"Search products by title, status or pricing type",value:S,onChange:c=>b(c.target.value)})]})}),a?e.jsxs("div",{className:"affiliate-products-alert error",children:[e.jsx(B,{size:18}),e.jsx("span",{children:a})]}):null,k.length?e.jsx("section",{className:"affiliate-products-grid",children:k.map(c=>e.jsx(ee,{product:c},c.id))}):e.jsxs("section",{className:"affiliate-products-empty",children:[e.jsx(A,{size:32}),e.jsx("h3",{children:t.length?"No matching products found":"No products yet"}),e.jsx("p",{children:t.length?"Try another search keyword.":"Create your first product to start building your affiliate store."}),t.length?null:e.jsxs(E,{className:"affiliate-products-btn primary",to:"/affiliate/products/create",children:[e.jsx(T,{size:16}),"Create Product"]})]})]})}const U=`
  * {
    box-sizing: border-box;
  }

  .affiliate-products-page {
    width: 100%;
  }

  .affiliate-products-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-products-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-products-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliateProductsSpin 0.8s linear infinite;
  }

  @keyframes affiliateProductsSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: affiliateProductsSpin 0.8s linear infinite;
  }

  .affiliate-products-hero {
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

  .affiliate-products-badge {
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

  .affiliate-products-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-products-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-products-hero-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-products-btn {
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

  .affiliate-products-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-products-btn.secondary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .affiliate-products-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .affiliate-products-stat-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 22px;
    padding: 20px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-products-stat-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .affiliate-products-stat-label {
    margin: 0 0 10px;
    font-size: 13px;
    color: #6b7280;
    font-weight: 700;
  }

  .affiliate-products-stat-value {
    margin: 0;
    font-size: 30px;
    line-height: 1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-products-stat-icon {
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

  .affiliate-products-toolbar {
    margin-bottom: 20px;
  }

  .affiliate-products-search {
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

  .affiliate-products-search input {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: #111827;
    font-size: 14px;
  }

  .affiliate-products-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 20px;
  }

  .affiliate-products-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-products-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .affiliate-products-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-products-image-wrap {
    width: 100%;
    height: 240px;
    background: #f8fafc;
    border-bottom: 1px solid #eef2f7;
  }

  .affiliate-products-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .affiliate-products-image-placeholder {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    color: #6b7280;
    gap: 8px;
    text-align: center;
  }

  .affiliate-products-card-body {
    padding: 18px;
  }

  .affiliate-products-card-top {
    margin-bottom: 14px;
  }

  .affiliate-products-card-title-wrap {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .affiliate-products-card-title {
    margin: 0;
    font-size: 18px;
    line-height: 1.35;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-products-status {
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

  .affiliate-products-status.active {
    background: #ecfdf3;
    color: #027a48;
    border-color: #abefc6;
  }

  .affiliate-products-status.inactive {
    background: #fff7ed;
    color: #b54708;
    border-color: #fed7aa;
  }

  .affiliate-products-status.draft {
    background: #f8fafc;
    color: #475467;
    border-color: #e4e7ec;
  }

  .affiliate-products-status.danger {
    background: #fef2f2;
    color: #b42318;
    border-color: #fecaca;
  }

  .affiliate-products-status.neutral {
    background: #eef2f7;
    color: #344054;
    border-color: #dbe2ea;
  }

  .affiliate-products-meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .affiliate-products-meta-box {
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 16px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-products-meta-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .affiliate-products-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .affiliate-products-empty {
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

  .affiliate-products-empty h3 {
    margin: 0;
    color: #111827;
    font-weight: 900;
  }

  .affiliate-products-empty p {
    margin: 0 0 8px;
    color: #6b7280;
    line-height: 1.6;
    max-width: 420px;
  }

  @media (max-width: 1200px) {
    .affiliate-products-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 991px) {
    .affiliate-products-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-products-title {
      font-size: 26px;
    }

    .affiliate-products-stats {
      grid-template-columns: 1fr;
    }

    .affiliate-products-hero-actions {
      width: 100%;
    }
  }

  @media (max-width: 767px) {
    .affiliate-products-grid,
    .affiliate-products-meta-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-products-title {
      font-size: 22px;
    }

    .affiliate-products-subtitle {
      font-size: 14px;
    }

    .affiliate-products-hero-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-products-btn {
      width: 100%;
    }

    .affiliate-products-image-wrap {
      height: 220px;
    }
  }
`;function ae(t=""){return String(t).toLowerCase().trim().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-")}function $(){return{category_id:"",title:"",slug:"",product_image:"",pricing_type:"simple",price:"",min_price:"",max_price:"",homepage_cta_label:"Buy Now",storefront_cta_label:"Read More",affiliate_buy_url:"",short_description:"",status:"draft"}}function ie(t={}){return{category_id:t.category_id||"",title:t.title||"",slug:t.slug||"",product_image:t.product_image||"",pricing_type:t.pricing_type||"simple",price:t.price??"",min_price:t.min_price??"",max_price:t.max_price??"",homepage_cta_label:t.homepage_cta_label||"Buy Now",storefront_cta_label:t.storefront_cta_label||"Read More",affiliate_buy_url:t.affiliate_buy_url||"",short_description:t.short_description||"",status:t.status||"draft"}}function D(t=""){const d=String(t||"").toLowerCase();return d==="published"?"wp-status published":d==="draft"?"wp-status draft":d==="inactive"?"wp-status inactive":"wp-status neutral"}function q({product:t}){return t!=null&&t.product_image?e.jsx("img",{className:"wp-product-image",src:t.product_image,alt:""}):e.jsx("span",{className:"wp-product-image wp-product-image-placeholder","aria-hidden":"true",children:e.jsx(A,{size:18})})}function se({mode:t,productId:d,categories:k,categoriesLoading:z,onCategoriesNeeded:R,onClose:N,onSaved:C}){const x=t==="edit",[a,w]=r.useState($),[S,b]=r.useState(x),[l,h]=r.useState(!1),[c,j]=r.useState(!1),[f,p]=r.useState(""),[_,y]=r.useState("");r.useEffect(()=>{let n=!0;return R(),!x||!d?(w($()),b(!1),()=>{n=!1}):((async()=>{var i,o;try{b(!0),y("");const{data:s}=await L.get(`/api/affiliate/products/${d}`);if(!n)return;if(!(s!=null&&s.product))throw new Error("Product not found");w(ie(s.product))}catch(s){n&&y(((o=(i=s==null?void 0:s.response)==null?void 0:i.data)==null?void 0:o.message)||s.message||"Failed to load product")}finally{n&&b(!1)}})(),()=>{n=!1})},[x,d]);const u=n=>{const{name:g,value:i}=n.target;w(o=>{const s={...o,[g]:i};return!x&&g==="title"&&!o.slug.trim()&&(s.slug=ae(i)),s})},M=n=>{var o;const g=(o=n.target.files)==null?void 0:o[0];if(!g)return;if(!g.type.startsWith("image/")){y("Please choose a valid image file."),n.target.value="";return}if(g.size>10*1024*1024){y("Product image must be below 10MB."),n.target.value="";return}j(!0),y(""),p(g.name);const i=new FileReader;i.onload=()=>{w(s=>({...s,product_image:String(i.result||"")})),j(!1)},i.onerror=()=>{j(!1),p(""),y("Failed to read the selected image file.")},i.readAsDataURL(g)},F=()=>{if(!a.title.trim())throw new Error("Product title is required");if(!a.product_image.trim())throw new Error("Product image is required");if(a.pricing_type==="simple"&&!a.price)throw new Error("Price is required for simple product");if(a.pricing_type==="variable"){if(!a.min_price||!a.max_price)throw new Error("Minimum and maximum price are required for variable product");if(Number(a.max_price)<Number(a.min_price))throw new Error("Maximum price must be greater than or equal to minimum price")}if(a.affiliate_buy_url.trim()){const n=V(a.affiliate_buy_url,{required:!0,allowEmpty:!1,fieldName:"Affiliate Buy URL"});if(!n.ok)throw new Error(n.message)}return{category_id:a.category_id||null,title:a.title,slug:a.slug,product_image:a.product_image,pricing_type:a.pricing_type,price:a.pricing_type==="simple"?a.price:null,min_price:a.pricing_type==="variable"?a.min_price:null,max_price:a.pricing_type==="variable"?a.max_price:null,homepage_cta_label:a.homepage_cta_label,storefront_cta_label:a.storefront_cta_label,affiliate_buy_url:a.affiliate_buy_url,short_description:a.short_description,status:a.status}},P=async n=>{var g,i,o;n.preventDefault();try{h(!0),y("");const s=F();let m;x?m=await L.put(`/api/affiliate/products/${d}`,s):m=await L.post("/api/affiliate/products",s),await C(((g=m==null?void 0:m.data)==null?void 0:g.message)||(x?"Product updated successfully":"Product created successfully"))}catch(s){y(((o=(i=s==null?void 0:s.response)==null?void 0:i.data)==null?void 0:o.message)||s.message||(x?"Failed to update product":"Failed to create product"))}finally{h(!1)}};return e.jsxs("div",{className:"wp-drawer-layer",role:"presentation",children:[e.jsx("button",{type:"button",className:"wp-drawer-backdrop","aria-label":"Close product form",onClick:N}),e.jsxs("aside",{className:"wp-drawer",role:"dialog","aria-modal":"true","aria-label":x?"Edit product":"Create product",children:[e.jsxs("div",{className:"wp-drawer-head",children:[e.jsxs("div",{children:[e.jsx("h2",{children:x?"Edit product":"Create product"}),e.jsx("p",{children:x?"Update the product details below.":"Add a product to your Writer storefront."})]}),e.jsx("button",{type:"button",className:"wp-icon-btn",onClick:N,"aria-label":"Close",children:"X"})]}),S?e.jsx("div",{className:"wp-drawer-state",children:"Loading product..."}):e.jsxs("form",{className:"wp-drawer-form",onSubmit:P,children:[e.jsxs("div",{className:"wp-form-scroll",children:[_?e.jsxs("div",{className:"wp-alert error",role:"alert",children:[e.jsx(B,{size:16}),e.jsx("span",{children:_})]}):null,e.jsxs("label",{className:"wp-field wp-field-full",children:[e.jsx("span",{children:"Category"}),e.jsxs("select",{name:"category_id",value:a.category_id,onChange:u,disabled:z||l,children:[e.jsx("option",{value:"",children:z?"Loading categories...":"Choose category"}),k.map(n=>e.jsx("option",{value:n.id,children:n.name},n.id))]})]}),e.jsxs("label",{className:"wp-field wp-field-full",children:[e.jsx("span",{children:"Product title"}),e.jsx("input",{name:"title",value:a.title,onChange:u,placeholder:"Product title",disabled:l})]}),e.jsxs("label",{className:"wp-field wp-field-full",children:[e.jsx("span",{children:"Slug"}),e.jsx("input",{name:"slug",value:a.slug,onChange:u,placeholder:"Optional custom slug",disabled:l})]}),e.jsxs("div",{className:"wp-field wp-field-full",children:[e.jsx("span",{children:"Product image"}),e.jsxs("label",{className:"wp-upload",children:[e.jsx("span",{className:"wp-upload-preview",children:a.product_image?e.jsx("img",{src:a.product_image,alt:""}):e.jsx(A,{size:20})}),e.jsxs("span",{className:"wp-upload-copy",children:[e.jsx("strong",{children:f||(a.product_image?"Current product image":"Upload image from device")}),e.jsx("small",{children:"JPG, PNG, WEBP - under 10MB"})]}),e.jsx("span",{className:"wp-upload-action",children:c?"Reading...":"Choose file"}),e.jsx("input",{type:"file",accept:"image/*",onChange:M,disabled:l||c})]}),a.product_image?e.jsx("button",{type:"button",className:"wp-remove-image",onClick:()=>{w(n=>({...n,product_image:""})),p("")},disabled:l,children:"Remove image"}):null]}),e.jsxs("label",{className:"wp-field",children:[e.jsx("span",{children:"Pricing type"}),e.jsxs("select",{name:"pricing_type",value:a.pricing_type,onChange:u,disabled:l,children:[e.jsx("option",{value:"simple",children:"Simple"}),e.jsx("option",{value:"variable",children:"Variable"})]})]}),a.pricing_type==="simple"?e.jsxs("label",{className:"wp-field",children:[e.jsx("span",{children:"Price"}),e.jsx("input",{type:"number",min:"0",step:"0.01",name:"price",value:a.price,onChange:u,placeholder:"0.00",disabled:l})]}):e.jsxs(e.Fragment,{children:[e.jsxs("label",{className:"wp-field",children:[e.jsx("span",{children:"Minimum price"}),e.jsx("input",{type:"number",min:"0",step:"0.01",name:"min_price",value:a.min_price,onChange:u,placeholder:"0.00",disabled:l})]}),e.jsxs("label",{className:"wp-field",children:[e.jsx("span",{children:"Maximum price"}),e.jsx("input",{type:"number",min:"0",step:"0.01",name:"max_price",value:a.max_price,onChange:u,placeholder:"0.00",disabled:l})]})]}),e.jsxs("label",{className:"wp-field",children:[e.jsx("span",{children:"Homepage CTA label"}),e.jsx("input",{name:"homepage_cta_label",value:a.homepage_cta_label,onChange:u,placeholder:"Buy Now",disabled:l})]}),e.jsxs("label",{className:"wp-field",children:[e.jsx("span",{children:"Storefront CTA label"}),e.jsx("input",{name:"storefront_cta_label",value:a.storefront_cta_label,onChange:u,placeholder:"Read More",disabled:l})]}),e.jsxs("label",{className:"wp-field wp-field-full",children:[e.jsx("span",{children:"Affiliate Buy URL"}),e.jsx("input",{name:"affiliate_buy_url",value:a.affiliate_buy_url,onChange:u,placeholder:"https://...",disabled:l}),e.jsx("small",{children:"External destinations are checked by Bloggad when saved."})]}),e.jsxs("label",{className:"wp-field wp-field-full",children:[e.jsx("span",{children:"Short description"}),e.jsx("textarea",{name:"short_description",value:a.short_description,onChange:u,placeholder:"Add a short product description...",rows:4,disabled:l})]}),e.jsxs("label",{className:"wp-field",children:[e.jsx("span",{children:"Status"}),e.jsxs("select",{name:"status",value:a.status,onChange:u,disabled:l,children:[e.jsx("option",{value:"draft",children:"Draft"}),e.jsx("option",{value:"published",children:"Published"}),e.jsx("option",{value:"inactive",children:"Inactive"})]})]})]}),e.jsxs("div",{className:"wp-drawer-footer",children:[e.jsx("button",{type:"button",className:"wp-btn secondary",onClick:N,disabled:l,children:"Cancel"}),e.jsx("button",{type:"submit",className:"wp-btn primary",disabled:l||c,children:l?"Saving...":x?"Save changes":"Create product"})]})]})]})]})}function re(){const[t,d]=r.useState([]),[k,z]=r.useState(""),[R,N]=r.useState(!0),[C,x]=r.useState(!1),[a,w]=r.useState(""),[S,b]=r.useState(""),[l,h]=r.useState(null),[c,j]=r.useState([]),[f,p]=r.useState(!1),[_,y]=r.useState(!1),u=async(i=!1)=>{var o,s;try{w(""),i?x(!0):N(!0);const{data:m}=await L.get("/api/affiliate/products");d((m==null?void 0:m.products)||[])}catch(m){w(((s=(o=m==null?void 0:m.response)==null?void 0:o.data)==null?void 0:s.message)||"Failed to load products")}finally{N(!1),x(!1)}};r.useEffect(()=>{u()},[]);const M=async()=>{var i,o;if(!(_||f))try{p(!0);const{data:s}=await L.get("/api/public/categories");j((s==null?void 0:s.categories)||[]),y(!0)}catch(s){w(((o=(i=s==null?void 0:s.response)==null?void 0:i.data)==null?void 0:o.message)||"Failed to load product categories")}finally{p(!1)}},F=r.useMemo(()=>{const i=k.trim().toLowerCase();return i?t.filter(o=>[o.title,o.slug,o.status,o.pricing_type,o.category_name,o.website_name].filter(Boolean).join(" ").toLowerCase().includes(i)):t},[t,k]),P=r.useMemo(()=>{const i=t.length,o=t.filter(v=>String((v==null?void 0:v.status)||"").toLowerCase()==="published").length,s=t.filter(v=>String((v==null?void 0:v.status)||"").toLowerCase()==="draft").length,m=t.filter(v=>String((v==null?void 0:v.status)||"").toLowerCase()==="inactive").length;return{total:i,published:o,draft:s,inactive:m}},[t]),n=()=>{h(null)},g=async i=>{b(i),await u(!0),n(),window.setTimeout(()=>{b("")},4500)};return e.jsxs("div",{className:"wp-page",children:[e.jsx("style",{children:le}),e.jsxs("div",{className:"wp-mobile-title-row",children:[e.jsx("h1",{children:"Products"}),e.jsx("button",{type:"button",className:"wp-btn primary compact",onClick:()=>{b(""),h({mode:"create",productId:null})},children:"+ Add"})]}),e.jsxs("section",{className:"wp-stats","aria-label":"Product summary",children:[e.jsxs("article",{className:"wp-stat",children:[e.jsx("span",{children:"Total products"}),e.jsx("strong",{children:P.total})]}),e.jsxs("article",{className:"wp-stat",children:[e.jsx("span",{children:"Published"}),e.jsx("strong",{children:P.published})]}),e.jsxs("article",{className:"wp-stat",children:[e.jsx("span",{children:"Draft"}),e.jsx("strong",{children:P.draft})]}),e.jsxs("article",{className:"wp-stat inactive",children:[e.jsx("span",{children:"Inactive"}),e.jsx("strong",{children:P.inactive})]}),e.jsxs("article",{className:"wp-stat wp-stat-context",children:[e.jsx("span",{children:"Store catalog"}),e.jsx("strong",{children:"Products shown on your Writer storefront"})]})]}),e.jsxs("div",{className:"wp-toolbar",children:[e.jsxs("label",{className:"wp-search",children:[e.jsx(G,{size:15,"aria-hidden":"true"}),e.jsx("span",{className:"wp-sr-only",children:"Search products"}),e.jsx("input",{value:k,onChange:i=>z(i.target.value),placeholder:"Search products by title, status or pricing type"})]}),e.jsxs("div",{className:"wp-toolbar-actions",children:[e.jsx("button",{type:"button",className:"wp-btn secondary",onClick:()=>u(!0),disabled:C,children:C?"Refreshing...":"Refresh"}),e.jsx("button",{type:"button",className:"wp-btn primary wp-desktop-add",onClick:()=>{b(""),h({mode:"create",productId:null})},children:"+ Add product"})]})]}),S?e.jsx("div",{className:"wp-alert success",role:"status",children:S}):null,a?e.jsxs("div",{className:"wp-alert error",role:"alert",children:[e.jsx(B,{size:16}),e.jsx("span",{children:a})]}):null,R?e.jsxs("section",{className:"wp-state",children:[e.jsx("div",{className:"wp-spinner"}),e.jsx("strong",{children:"Loading products..."})]}):F.length?e.jsxs(e.Fragment,{children:[e.jsxs("section",{className:"wp-table-wrap",children:[e.jsxs("div",{className:"wp-table-head",children:[e.jsx("span",{children:"Product"}),e.jsx("span",{children:"Price"}),e.jsx("span",{children:"Category"}),e.jsx("span",{children:"Status"}),e.jsx("span",{children:"Website"}),e.jsx("span",{children:"Actions"})]}),F.map(i=>e.jsxs("article",{className:"wp-table-row",children:[e.jsxs("div",{className:"wp-product-cell",children:[e.jsx(q,{product:i}),e.jsxs("span",{className:"wp-product-copy",children:[e.jsx("strong",{children:i.title||"Untitled product"}),e.jsx("small",{children:i.slug||"-"})]})]}),e.jsx("strong",{className:"wp-price",children:W(i)}),e.jsx("span",{children:i.category_name||"-"}),e.jsx("span",{children:e.jsx("span",{className:D(i.status),children:i.status||"draft"})}),e.jsx("span",{className:"wp-muted",children:i.website_name||"-"}),e.jsxs("div",{className:"wp-row-actions",children:[e.jsx("button",{type:"button",className:"wp-mini-btn",onClick:()=>{b(""),h({mode:"edit",productId:i.id})},children:"Edit"}),e.jsx(E,{className:"wp-mini-btn",to:`/writer/products/${i.id}/posts`,children:"Posts"})]})]},i.id))]}),e.jsx("section",{className:"wp-mobile-list",children:F.map(i=>e.jsxs("article",{className:"wp-mobile-card",children:[e.jsxs("div",{className:"wp-mobile-card-top",children:[e.jsx(q,{product:i}),e.jsxs("div",{className:"wp-mobile-card-copy",children:[e.jsx("strong",{children:i.title||"Untitled product"}),e.jsx("b",{children:W(i)}),e.jsx("span",{children:i.category_name||"-"})]}),e.jsx("span",{className:D(i.status),children:i.status||"draft"})]}),e.jsxs("div",{className:"wp-mobile-card-actions",children:[e.jsx("button",{type:"button",className:"wp-mini-btn",onClick:()=>{b(""),h({mode:"edit",productId:i.id})},children:"Edit"}),e.jsx(E,{className:"wp-mini-btn",to:`/writer/products/${i.id}/posts`,children:"Posts"})]})]},i.id))})]}):e.jsxs("section",{className:"wp-state",children:[e.jsx(A,{size:25}),e.jsx("strong",{children:t.length?"No matching products":"No products yet"}),e.jsx("span",{children:t.length?"Try another search keyword.":"Add your first product to start building your Writer catalog."}),t.length?null:e.jsx("button",{type:"button",className:"wp-btn primary",onClick:()=>h({mode:"create",productId:null}),children:"Add product"})]}),l?e.jsx(se,{mode:l.mode,productId:l.productId,categories:c,categoriesLoading:f,onCategoriesNeeded:M,onClose:n,onSaved:g},`${l.mode}-${l.productId||"new"}`):null]})}function ge(){return H().pathname.startsWith("/writer/products")?e.jsx(re,{}):e.jsx(te,{})}const le=`
  .wp-page,
  .wp-page * {
    box-sizing: border-box;
  }

  .wp-page {
    width: 100%;
    color: #171a1f;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .wp-sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .wp-mobile-title-row {
    display: none;
  }

  .wp-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr)) minmax(260px, 2.5fr);
    gap: 12px;
    margin-bottom: 14px;
  }

  .wp-stat {
    min-height: 70px;
    padding: 13px 15px;
    background: #ffffff;
    border: 1px solid #dfe3e8;
    border-radius: 9px;
  }

  .wp-stat span {
    display: block;
    margin-bottom: 7px;
    color: #748091;
    font-size: 11px;
    line-height: 1.2;
  }

  .wp-stat strong {
    display: block;
    color: #1b1f24;
    font-size: 22px;
    line-height: 1;
  }

  .wp-stat-context strong {
    font-size: 12px;
    line-height: 1.45;
    font-weight: 500;
  }

  .wp-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  .wp-search {
    flex: 1;
    min-width: 0;
    height: 42px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 14px;
    background: #ffffff;
    border: 1px solid #dfe3e8;
    border-radius: 8px;
    color: #98a2b0;
  }

  .wp-search input {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: #1d232b;
    font: inherit;
    font-size: 12px;
  }

  .wp-toolbar-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .wp-btn,
  .wp-mini-btn,
  .wp-icon-btn,
  .wp-remove-image {
    border: 0;
    font: inherit;
    cursor: pointer;
  }

  .wp-btn {
    min-height: 40px;
    padding: 0 18px;
    border-radius: 7px;
    font-size: 12px;
    font-weight: 600;
  }

  .wp-btn.compact {
    min-height: 34px;
    padding: 0 13px;
  }

  .wp-btn.primary {
    background: #1c2026;
    color: #ffffff;
  }

  .wp-btn.secondary {
    background: #ffffff;
    color: #1c2026;
    border: 1px solid #dfe3e8;
  }

  .wp-btn:disabled,
  .wp-mini-btn:disabled,
  .wp-icon-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .wp-alert {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding: 10px 12px;
    border-radius: 7px;
    font-size: 12px;
  }

  .wp-alert.error {
    border: 1px solid #fecaca;
    background: #fff7f7;
    color: #991b1b;
  }

  .wp-alert.success {
    border: 1px solid #bbf7d0;
    background: #f4fbf6;
    color: #166534;
  }

  .wp-table-wrap {
    overflow: hidden;
    background: #ffffff;
    border: 1px solid #dfe3e8;
    border-radius: 9px;
  }

  .wp-table-head,
  .wp-table-row {
    display: grid;
    grid-template-columns: minmax(280px, 2.5fr) minmax(120px, 1fr) minmax(130px, 1.1fr) minmax(110px, 0.9fr) minmax(130px, 1.1fr) minmax(150px, 1.1fr);
    align-items: center;
    gap: 14px;
  }

  .wp-table-head {
    min-height: 46px;
    padding: 0 18px;
    border-bottom: 1px solid #e5e8ec;
    color: #687382;
    font-size: 10px;
    font-weight: 600;
  }

  .wp-table-row {
    min-height: 88px;
    padding: 12px 18px;
    border-bottom: 1px solid #edf0f2;
    color: #313740;
    font-size: 11px;
  }

  .wp-table-row:last-child {
    border-bottom: 0;
  }

  .wp-product-cell {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .wp-product-image {
    flex: 0 0 52px;
    width: 52px;
    height: 52px;
    object-fit: cover;
    border-radius: 7px;
    background: #eef1f5;
  }

  .wp-product-image-placeholder {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #8b95a3;
  }

  .wp-product-copy {
    min-width: 0;
  }

  .wp-product-copy strong,
  .wp-product-copy small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .wp-product-copy strong {
    margin-bottom: 5px;
    color: #20242a;
    font-size: 12px;
    font-weight: 600;
  }

  .wp-product-copy small,
  .wp-muted {
    color: #84909f;
    font-size: 10px;
  }

  .wp-price {
    font-size: 11px;
  }

  .wp-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 72px;
    min-height: 25px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 600;
    text-transform: capitalize;
  }

  .wp-status.published {
    background: #e8f7ee;
    color: #177245;
  }

  .wp-status.draft {
    background: #fff5dd;
    color: #9a6400;
  }

  .wp-status.inactive,
  .wp-status.neutral {
    background: #eef1f4;
    color: #657180;
  }

  .wp-row-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .wp-mini-btn {
    min-width: 54px;
    min-height: 31px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 11px;
    border: 1px solid #dce1e6;
    border-radius: 6px;
    background: #ffffff;
    color: #252a31;
    font-size: 10px;
    font-weight: 600;
    text-decoration: none;
  }

  .wp-mobile-list {
    display: none;
  }

  .wp-state {
    min-height: 320px;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 10px;
    padding: 40px 24px;
    background: #ffffff;
    border: 1px solid #dfe3e8;
    border-radius: 9px;
    color: #6f7a88;
    text-align: center;
  }

  .wp-state strong {
    color: #242930;
    font-size: 14px;
  }

  .wp-state span {
    max-width: 420px;
    font-size: 12px;
  }

  .wp-spinner {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 3px solid #e3e7eb;
    border-top-color: #1c2026;
    animation: wpSpin 0.8s linear infinite;
  }

  @keyframes wpSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .wp-drawer-layer {
    position: fixed;
    inset: 0;
    z-index: 180;
  }

  .wp-drawer-backdrop {
    position: absolute;
    top: 64px;
    right: 0;
    bottom: 0;
    left: 252px;
    border: 0;
    background: rgba(25, 31, 38, 0.16);
    cursor: default;
  }

  .wp-drawer {
    position: absolute;
    top: 64px;
    right: 0;
    bottom: 0;
    width: min(530px, calc(100vw - 252px));
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border-left: 1px solid #dfe3e8;
    box-shadow: -12px 0 30px rgba(15, 23, 42, 0.08);
  }

  .wp-drawer-head {
    flex: 0 0 auto;
    min-height: 76px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    padding: 18px 22px 14px;
    border-bottom: 1px solid #e4e7eb;
  }

  .wp-drawer-head h2 {
    margin: 0 0 5px;
    color: #20242a;
    font-size: 16px;
    line-height: 1.2;
  }

  .wp-drawer-head p {
    margin: 0;
    color: #7b8694;
    font-size: 11px;
  }

  .wp-icon-btn {
    width: 30px;
    height: 30px;
    display: inline-grid;
    place-items: center;
    border-radius: 6px;
    background: transparent;
    color: #66717f;
    font-size: 11px;
    font-weight: 700;
  }

  .wp-drawer-form {
    min-height: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .wp-form-scroll {
    min-height: 0;
    flex: 1;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-content: start;
    gap: 14px;
    padding: 18px 22px 28px;
  }

  .wp-field {
    min-width: 0;
    display: grid;
    gap: 6px;
    color: #2e3339;
    font-size: 10px;
    font-weight: 600;
  }

  .wp-field-full {
    grid-column: 1 / -1;
  }

  .wp-field input,
  .wp-field select,
  .wp-field textarea {
    width: 100%;
    border: 1px solid #dce1e6;
    border-radius: 7px;
    background: #ffffff;
    color: #252a31;
    outline: none;
    font: inherit;
    font-size: 11px;
    font-weight: 400;
  }

  .wp-field input,
  .wp-field select {
    height: 40px;
    padding: 0 11px;
  }

  .wp-field textarea {
    min-height: 82px;
    resize: vertical;
    padding: 10px 11px;
  }

  .wp-field input:focus,
  .wp-field select:focus,
  .wp-field textarea:focus {
    border-color: #8993a0;
  }

  .wp-field small {
    color: #8a94a2;
    font-size: 9px;
    font-weight: 400;
    line-height: 1.4;
  }

  .wp-upload {
    position: relative;
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    min-height: 78px;
    padding: 12px;
    border: 1px solid #dce1e6;
    border-radius: 8px;
    background: #f8f9fa;
    cursor: pointer;
  }

  .wp-upload input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .wp-upload-preview {
    width: 48px;
    height: 48px;
    display: inline-grid;
    place-items: center;
    overflow: hidden;
    border-radius: 7px;
    background: #e8ecf0;
    color: #87919e;
  }

  .wp-upload-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .wp-upload-copy {
    min-width: 0;
  }

  .wp-upload-copy strong,
  .wp-upload-copy small {
    display: block;
  }

  .wp-upload-copy strong {
    margin-bottom: 4px;
    overflow: hidden;
    color: #252a31;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .wp-upload-copy small {
    color: #8a94a2;
    font-size: 9px;
    font-weight: 400;
  }

  .wp-upload-action {
    min-height: 32px;
    display: inline-flex;
    align-items: center;
    padding: 0 13px;
    border: 1px solid #d8dde3;
    border-radius: 6px;
    background: #ffffff;
    color: #32373e;
    font-size: 9px;
    font-weight: 600;
  }

  .wp-remove-image {
    justify-self: start;
    padding: 3px 0;
    background: transparent;
    color: #a33434;
    font-size: 9px;
    font-weight: 600;
  }

  .wp-drawer-footer {
    flex: 0 0 auto;
    min-height: 64px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding: 12px 22px;
    border-top: 1px solid #e4e7eb;
    background: #ffffff;
  }

  .wp-drawer-state {
    flex: 1;
    display: grid;
    place-items: center;
    color: #707b89;
    font-size: 12px;
  }

  @media (max-width: 1120px) {
    .wp-stats {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .wp-stat-context {
      grid-column: 1 / -1;
    }

    .wp-table-head,
    .wp-table-row {
      grid-template-columns: minmax(240px, 2fr) minmax(110px, 1fr) minmax(120px, 1fr) minmax(100px, 0.8fr) minmax(130px, 1fr);
    }

    .wp-table-head > span:nth-child(5),
    .wp-table-row > .wp-muted {
      display: none;
    }
  }

  @media (max-width: 767px) {
    .wp-page {
      width: calc(100% + 34px);
      margin-left: -17px;
      margin-right: -17px;
      padding: 15px 8px 42px;
    }

    .wp-mobile-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 12px;
    }

    .wp-mobile-title-row h1 {
      margin: 0;
      color: #20242a;
      font-size: 20px;
      line-height: 1.2;
    }

    .wp-stats {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 9px;
      margin-bottom: 14px;
    }

    .wp-stat {
      min-height: 68px;
      padding: 12px;
    }

    .wp-stat strong {
      font-size: 21px;
    }

    .wp-stat.inactive,
    .wp-stat-context {
      display: none;
    }

    .wp-toolbar {
      display: block;
      margin-bottom: 16px;
    }

    .wp-search {
      width: 100%;
      margin-bottom: 9px;
    }

    .wp-toolbar-actions {
      display: none;
    }

    .wp-table-wrap {
      display: none;
    }

    .wp-mobile-list {
      display: grid;
      gap: 12px;
    }

    .wp-mobile-card {
      padding: 14px;
      border: 1px solid #dfe3e8;
      border-radius: 10px;
      background: #ffffff;
    }

    .wp-mobile-card-top {
      display: grid;
      grid-template-columns: 58px minmax(0, 1fr) auto;
      align-items: start;
      gap: 13px;
    }

    .wp-mobile-card .wp-product-image {
      width: 58px;
      height: 58px;
      flex-basis: 58px;
    }

    .wp-mobile-card-copy {
      min-width: 0;
    }

    .wp-mobile-card-copy strong,
    .wp-mobile-card-copy b,
    .wp-mobile-card-copy span {
      display: block;
    }

    .wp-mobile-card-copy strong {
      margin-bottom: 7px;
      overflow: hidden;
      color: #22272e;
      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .wp-mobile-card-copy b {
      margin-bottom: 8px;
      color: #242931;
      font-size: 12px;
    }

    .wp-mobile-card-copy span {
      color: #84909e;
      font-size: 10px;
    }

    .wp-mobile-card .wp-status {
      min-width: 68px;
    }

    .wp-mobile-card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 9px;
      margin-top: 14px;
      padding-top: 10px;
      border-top: 1px solid #e5e8ec;
    }

    .wp-mobile-card-actions .wp-mini-btn {
      min-width: 62px;
    }

    .wp-drawer-layer {
      z-index: 500;
    }

    .wp-drawer-backdrop {
      display: none;
    }

    .wp-drawer {
      inset: 0;
      width: 100%;
      border-left: 0;
      box-shadow: none;
    }

    .wp-drawer-head {
      min-height: 60px;
      align-items: center;
      padding: 13px 16px;
    }

    .wp-drawer-head h2 {
      font-size: 16px;
    }

    .wp-drawer-head p {
      display: none;
    }

    .wp-form-scroll {
      grid-template-columns: 1fr;
      gap: 14px;
      padding: 18px 16px 30px;
    }

    .wp-field-full {
      grid-column: auto;
    }

    .wp-drawer-footer {
      min-height: 62px;
      padding: 10px 16px;
    }

    .wp-drawer-footer .wp-btn {
      flex: 1;
    }
  }

  @media (max-width: 390px) {
    .wp-page {
      padding-right: 8px;
      padding-left: 8px;
    }

    .wp-upload {
      grid-template-columns: 48px minmax(0, 1fr);
    }

    .wp-upload-action {
      grid-column: 1 / -1;
      justify-content: center;
    }
  }
`;export{ge as default};
