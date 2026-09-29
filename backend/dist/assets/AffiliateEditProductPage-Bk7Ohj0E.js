import{e as W,b as G,f as H,r as o,j as e,F as E,X as V,S as L,A as J,a as j}from"./index-LXBBJt7I.js";import{v as X}from"./validateSupgadUrl-KW1pmdpE.js";import{L as K}from"./layers-CY6ZhHm5.js";import{P as O}from"./package-BZvUXVf6.js";import{T as A}from"./tag-XMSxVyON.js";import{I as Q}from"./image-DDgd2sPC.js";import{U as Y}from"./upload-WKtBKnBi.js";import{D as m}from"./dollar-sign-DoxV_dLF.js";import{L as Z}from"./link-CCVOqyaN.js";import{C as ee}from"./circle-alert-DsZo9igC.js";import{C as ie}from"./circle-check-ml_0upGj.js";import{S as ae}from"./save-Co8lXD7U.js";function xe(){const y=W(),M=G(),{id:f}=H(),_=M.pathname.startsWith("/writer/")?"/writer":"/affiliate",[x,R]=o.useState([]),[i,u]=o.useState({category_id:"",title:"",slug:"",product_image:"",pricing_type:"simple",price:"",min_price:"",max_price:"",homepage_cta_label:"Buy Now",storefront_cta_label:"Read More",affiliate_buy_url:"",short_description:"",status:"draft"}),[I,N]=o.useState(!0),[v,w]=o.useState(!1),[k,g]=o.useState(!1),[z,h]=o.useState(""),[S,n]=o.useState(""),[P,C]=o.useState("");o.useEffect(()=>{(async()=>{var t,d,r,p;try{N(!0),n("");const[c,b]=await Promise.all([j.get(`/api/affiliate/products/${f}`),j.get("/api/public/categories")]),l=(t=c==null?void 0:c.data)==null?void 0:t.product,D=((d=b==null?void 0:b.data)==null?void 0:d.categories)||[];R(D),l&&u({category_id:l.category_id||"",title:l.title||"",slug:l.slug||"",product_image:l.product_image||"",pricing_type:l.pricing_type||"simple",price:l.price??"",min_price:l.min_price??"",max_price:l.max_price??"",homepage_cta_label:l.homepage_cta_label||"Buy Now",storefront_cta_label:l.storefront_cta_label||"Read More",affiliate_buy_url:l.affiliate_buy_url||"",short_description:l.short_description||"",status:l.status||"draft"})}catch(c){n(((p=(r=c==null?void 0:c.response)==null?void 0:r.data)==null?void 0:p.message)||"Failed to load product")}finally{N(!1)}})()},[f]);const s=a=>{const{name:t,value:d}=a.target;u(r=>({...r,[t]:d}))},B=a=>{var r;const t=(r=a.target.files)==null?void 0:r[0];if(!t)return;if(!t.type.startsWith("image/")){n("Please choose a valid image file."),a.target.value="";return}g(!0),n(""),h(t.name);const d=new FileReader;d.onload=()=>{u(p=>({...p,product_image:String(d.result||"")})),g(!1)},d.onerror=()=>{g(!1),h(""),n("Failed to read the selected image file."),a.target.value=""},d.readAsDataURL(t)},F=()=>{u(a=>({...a,product_image:""})),h(""),n("")},T=o.useMemo(()=>{const a=x.find(t=>String(t.id)===String(i.category_id));return(a==null?void 0:a.name)||"-"},[x,i.category_id]),$=o.useMemo(()=>i.pricing_type==="simple"?i.price?i.price:"-":!i.min_price&&!i.max_price?"-":`${i.min_price||0} - ${i.max_price||0}`,[i.pricing_type,i.price,i.min_price,i.max_price]),q=async a=>{var t,d;a.preventDefault(),w(!0),n(""),C("");try{if(!i.title.trim())throw new Error("Product title is required");if(!i.product_image.trim())throw new Error("Product image is required");if(i.pricing_type==="simple"&&!i.price)throw new Error("Price is required for simple product");if(i.pricing_type==="variable"){if(!i.min_price||!i.max_price)throw new Error("Minimum and maximum price are required for variable product");if(Number(i.max_price)<Number(i.min_price))throw new Error("Maximum price must be greater than or equal to minimum price")}if(i.affiliate_buy_url.trim()){const c=X(i.affiliate_buy_url,{required:!0,allowEmpty:!1,fieldName:"Affiliate Buy URL"});if(!c.ok)throw new Error(c.message)}const r={category_id:i.category_id||null,title:i.title,slug:i.slug,product_image:i.product_image,pricing_type:i.pricing_type,price:i.pricing_type==="simple"?i.price:null,min_price:i.pricing_type==="variable"?i.min_price:null,max_price:i.pricing_type==="variable"?i.max_price:null,homepage_cta_label:i.homepage_cta_label,storefront_cta_label:i.storefront_cta_label,affiliate_buy_url:i.affiliate_buy_url,short_description:i.short_description,status:i.status},{data:p}=await j.put(`/api/affiliate/products/${f}`,r);p!=null&&p.ok&&C(p.message||"Product updated successfully")}catch(r){n(((d=(t=r==null?void 0:r.response)==null?void 0:t.data)==null?void 0:d.message)||r.message||"Failed to update product")}finally{w(!1)}};return I?e.jsxs("div",{className:"affiliate-edit-product-page",children:[e.jsx("style",{children:U}),e.jsx("div",{className:"affiliate-edit-product-loading-wrap",children:e.jsxs("div",{className:"affiliate-edit-product-loading-card",children:[e.jsx("div",{className:"affiliate-edit-product-spinner"}),e.jsx("p",{children:"Loading product..."})]})})]}):e.jsxs("div",{className:"affiliate-edit-product-page",children:[e.jsx("style",{children:U}),e.jsxs("section",{className:"affiliate-edit-product-hero",children:[e.jsxs("div",{className:"affiliate-edit-product-hero-copy",children:[e.jsx("div",{className:"affiliate-edit-product-badge",children:"Product editor"}),e.jsx("h1",{className:"affiliate-edit-product-title",children:"Edit Product"}),e.jsx("p",{className:"affiliate-edit-product-subtitle",children:"Update product details, pricing, CTA text, and approved Supgad link settings."})]}),e.jsx("div",{className:"affiliate-edit-product-hero-actions",children:e.jsxs("button",{className:"affiliate-edit-product-btn secondary",type:"button",onClick:()=>y(`${_}/products/${f}/posts`),children:[e.jsx(E,{size:16}),"Manage Posts"]})})]}),e.jsxs("section",{className:"affiliate-edit-product-grid",children:[e.jsxs("div",{className:"affiliate-edit-product-panel affiliate-edit-product-panel-main",children:[e.jsx("div",{className:"affiliate-edit-product-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-edit-product-panel-kicker",children:"Product details"}),e.jsx("h2",{className:"affiliate-edit-product-panel-title",children:"Update product information"})]})}),e.jsxs("form",{className:"affiliate-edit-product-form",onSubmit:q,children:[e.jsxs("div",{className:"affiliate-edit-product-form-grid",children:[e.jsxs("label",{className:"affiliate-edit-product-field",children:[e.jsxs("span",{className:"affiliate-edit-product-label",children:[e.jsx(K,{size:16}),"Category"]}),e.jsxs("select",{className:"affiliate-edit-product-input",name:"category_id",value:i.category_id,onChange:s,children:[e.jsx("option",{value:"",children:"Select category"}),x.map(a=>e.jsx("option",{value:a.id,children:a.name},a.id))]})]}),e.jsxs("label",{className:"affiliate-edit-product-field",children:[e.jsxs("span",{className:"affiliate-edit-product-label",children:[e.jsx(O,{size:16}),"Product title"]}),e.jsx("input",{className:"affiliate-edit-product-input",name:"title",placeholder:"Product title",value:i.title,onChange:s})]}),e.jsxs("label",{className:"affiliate-edit-product-field",children:[e.jsxs("span",{className:"affiliate-edit-product-label",children:[e.jsx(A,{size:16}),"Slug"]}),e.jsx("input",{className:"affiliate-edit-product-input",name:"slug",placeholder:"Custom slug",value:i.slug,onChange:s})]}),e.jsxs("div",{className:"affiliate-edit-product-field affiliate-edit-product-field-full",children:[e.jsxs("span",{className:"affiliate-edit-product-label",children:[e.jsx(Q,{size:16}),"Product image"]}),e.jsxs("label",{className:"affiliate-edit-product-upload-box",children:[e.jsx("input",{className:"affiliate-edit-product-file-input",type:"file",accept:"image/*",onChange:B}),e.jsxs("span",{className:"affiliate-edit-product-upload-inner",children:[e.jsx("span",{className:"affiliate-edit-product-upload-icon",children:e.jsx(Y,{size:18})}),e.jsx("span",{className:"affiliate-edit-product-upload-text",children:k?"Uploading image...":"Upload image from device"}),e.jsx("span",{className:"affiliate-edit-product-upload-subtext",children:"JPG, PNG, WEBP and other image files supported"})]})]}),z?e.jsxs("div",{className:"affiliate-edit-product-file-row",children:[e.jsx("span",{className:"affiliate-edit-product-file-name",children:z}),e.jsxs("button",{type:"button",className:"affiliate-edit-product-file-remove",onClick:F,children:[e.jsx(V,{size:14}),"Remove"]})]}):null,i.product_image?e.jsx("div",{className:"affiliate-edit-product-image-preview-wrap",children:e.jsx("img",{src:i.product_image,alt:"Product preview",className:"affiliate-edit-product-image-preview"})}):null]}),e.jsxs("label",{className:"affiliate-edit-product-field",children:[e.jsxs("span",{className:"affiliate-edit-product-label",children:[e.jsx(m,{size:16}),"Pricing type"]}),e.jsxs("select",{className:"affiliate-edit-product-input",name:"pricing_type",value:i.pricing_type,onChange:s,children:[e.jsx("option",{value:"simple",children:"Simple"}),e.jsx("option",{value:"variable",children:"Variable"})]})]}),i.pricing_type==="simple"?e.jsxs("label",{className:"affiliate-edit-product-field",children:[e.jsxs("span",{className:"affiliate-edit-product-label",children:[e.jsx(m,{size:16}),"Price"]}),e.jsx("input",{className:"affiliate-edit-product-input",name:"price",type:"number",placeholder:"Price",value:i.price,onChange:s})]}):e.jsxs(e.Fragment,{children:[e.jsxs("label",{className:"affiliate-edit-product-field",children:[e.jsxs("span",{className:"affiliate-edit-product-label",children:[e.jsx(m,{size:16}),"Minimum price"]}),e.jsx("input",{className:"affiliate-edit-product-input",name:"min_price",type:"number",placeholder:"Minimum price",value:i.min_price,onChange:s})]}),e.jsxs("label",{className:"affiliate-edit-product-field",children:[e.jsxs("span",{className:"affiliate-edit-product-label",children:[e.jsx(m,{size:16}),"Maximum price"]}),e.jsx("input",{className:"affiliate-edit-product-input",name:"max_price",type:"number",placeholder:"Maximum price",value:i.max_price,onChange:s})]})]}),e.jsxs("label",{className:"affiliate-edit-product-field",children:[e.jsxs("span",{className:"affiliate-edit-product-label",children:[e.jsx(L,{size:16}),"Homepage CTA label"]}),e.jsx("input",{className:"affiliate-edit-product-input",name:"homepage_cta_label",placeholder:"Homepage CTA label",value:i.homepage_cta_label,onChange:s})]}),e.jsxs("label",{className:"affiliate-edit-product-field",children:[e.jsxs("span",{className:"affiliate-edit-product-label",children:[e.jsx(L,{size:16}),"Storefront CTA label"]}),e.jsx("input",{className:"affiliate-edit-product-input",name:"storefront_cta_label",placeholder:"Storefront CTA label",value:i.storefront_cta_label,onChange:s})]}),e.jsxs("label",{className:"affiliate-edit-product-field affiliate-edit-product-field-full",children:[e.jsxs("span",{className:"affiliate-edit-product-label",children:[e.jsx(Z,{size:16}),"Affiliate Buy URL"]}),e.jsx("input",{className:"affiliate-edit-product-input",name:"affiliate_buy_url",placeholder:"Affiliate Buy URL",value:i.affiliate_buy_url,onChange:s}),e.jsx("small",{className:"affiliate-edit-product-help",children:"External links are allowed and checked by Bloggad on save."})]}),e.jsxs("label",{className:"affiliate-edit-product-field affiliate-edit-product-field-full",children:[e.jsxs("span",{className:"affiliate-edit-product-label",children:[e.jsx(E,{size:16}),"Short description"]}),e.jsx("textarea",{className:"affiliate-edit-product-input affiliate-edit-product-textarea",name:"short_description",placeholder:"Short description",rows:"5",value:i.short_description,onChange:s})]}),e.jsxs("label",{className:"affiliate-edit-product-field",children:[e.jsxs("span",{className:"affiliate-edit-product-label",children:[e.jsx(A,{size:16}),"Status"]}),e.jsxs("select",{className:"affiliate-edit-product-input",name:"status",value:i.status,onChange:s,children:[e.jsx("option",{value:"draft",children:"Draft"}),e.jsx("option",{value:"published",children:"Published"}),e.jsx("option",{value:"inactive",children:"Inactive"})]})]})]}),S?e.jsxs("div",{className:"affiliate-edit-product-alert error",children:[e.jsx(ee,{size:18}),e.jsx("span",{children:S})]}):null,P?e.jsxs("div",{className:"affiliate-edit-product-alert success",children:[e.jsx(ie,{size:18}),e.jsx("span",{children:P})]}):null,e.jsxs("div",{className:"affiliate-edit-product-actions",children:[e.jsxs("button",{className:"affiliate-edit-product-btn primary",type:"submit",disabled:v||k,children:[e.jsx(ae,{size:16}),v?"Saving...":"Update Product"]}),e.jsxs("button",{className:"affiliate-edit-product-btn secondary",type:"button",onClick:()=>y(`${_}/products/${f}/posts`),children:[e.jsx(J,{size:16}),"Manage Product Posts"]})]})]})]}),e.jsxs("div",{className:"affiliate-edit-product-side-stack",children:[e.jsxs("div",{className:"affiliate-edit-product-panel",children:[e.jsx("div",{className:"affiliate-edit-product-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-edit-product-panel-kicker",children:"Live summary"}),e.jsx("h2",{className:"affiliate-edit-product-panel-title",children:"Preview details"})]})}),e.jsxs("div",{className:"affiliate-edit-product-summary",children:[e.jsxs("div",{className:"affiliate-edit-product-summary-row",children:[e.jsx("span",{children:"Title"}),e.jsx("strong",{children:i.title||"-"})]}),e.jsxs("div",{className:"affiliate-edit-product-summary-row",children:[e.jsx("span",{children:"Category"}),e.jsx("strong",{children:T})]}),e.jsxs("div",{className:"affiliate-edit-product-summary-row",children:[e.jsx("span",{children:"Slug"}),e.jsx("strong",{children:i.slug||"-"})]}),e.jsxs("div",{className:"affiliate-edit-product-summary-row",children:[e.jsx("span",{children:"Pricing type"}),e.jsx("strong",{children:i.pricing_type||"-"})]}),e.jsxs("div",{className:"affiliate-edit-product-summary-row",children:[e.jsx("span",{children:"Price preview"}),e.jsx("strong",{children:$})]}),e.jsxs("div",{className:"affiliate-edit-product-summary-row",children:[e.jsx("span",{children:"Status"}),e.jsx("strong",{children:i.status||"-"})]})]})]}),e.jsxs("div",{className:"affiliate-edit-product-panel",children:[e.jsx("div",{className:"affiliate-edit-product-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-edit-product-panel-kicker",children:"Rules"}),e.jsx("h2",{className:"affiliate-edit-product-panel-title",children:"Important notes"})]})}),e.jsxs("div",{className:"affiliate-edit-product-tips",children:[e.jsxs("div",{className:"affiliate-edit-product-tip",children:[e.jsx("span",{className:"dot"}),e.jsx("p",{children:"Product title and image are required."})]}),e.jsxs("div",{className:"affiliate-edit-product-tip",children:[e.jsx("span",{className:"dot"}),e.jsx("p",{children:"Simple pricing needs one price only."})]}),e.jsxs("div",{className:"affiliate-edit-product-tip",children:[e.jsx("span",{className:"dot"}),e.jsx("p",{children:"Variable pricing needs minimum and maximum values."})]}),e.jsxs("div",{className:"affiliate-edit-product-tip",children:[e.jsx("span",{className:"dot"}),e.jsx("p",{children:"Legitimate external links are allowed. Bloggad records and reviews outbound destinations for safety."})]})]})]})]})]})]})}const U=`
  * {
    box-sizing: border-box;
  }

  .affiliate-edit-product-page {
    width: 100%;
  }

  .affiliate-edit-product-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-edit-product-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-edit-product-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliateEditProductSpin 0.8s linear infinite;
  }

  @keyframes affiliateEditProductSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .affiliate-edit-product-hero {
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

  .affiliate-edit-product-badge {
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

  .affiliate-edit-product-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-edit-product-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-edit-product-hero-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-edit-product-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.8fr);
    gap: 20px;
  }

  .affiliate-edit-product-side-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .affiliate-edit-product-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-edit-product-panel-main {
    min-height: 100%;
  }

  .affiliate-edit-product-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .affiliate-edit-product-panel-kicker {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .affiliate-edit-product-panel-title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-edit-product-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .affiliate-edit-product-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .affiliate-edit-product-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-edit-product-field-full {
    grid-column: span 2;
  }

  .affiliate-edit-product-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 800;
    color: #111827;
  }

  .affiliate-edit-product-input {
    width: 100%;
    min-height: 50px;
    border-radius: 16px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    padding: 0 14px;
    font-size: 14px;
    color: #111827;
    outline: none;
    transition: 0.2s ease;
  }

  .affiliate-edit-product-input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.06);
  }

  .affiliate-edit-product-textarea {
    min-height: 130px;
    padding: 14px;
    resize: vertical;
  }

  .affiliate-edit-product-upload-box {
    position: relative;
    display: block;
    width: 100%;
    border: 1px dashed #cbd5e1;
    border-radius: 18px;
    background: #f8fafc;
    cursor: pointer;
    transition: 0.2s ease;
    overflow: hidden;
  }

  .affiliate-edit-product-upload-box:hover {
    border-color: #111827;
    background: #f3f4f6;
  }

  .affiliate-edit-product-file-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .affiliate-edit-product-upload-inner {
    min-height: 120px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-align: center;
  }

  .affiliate-edit-product-upload-icon {
    width: 42px;
    height: 42px;
    border-radius: 999px;
    background: #111827;
    color: #ffffff;
    display: grid;
    place-items: center;
  }

  .affiliate-edit-product-upload-text {
    font-size: 14px;
    font-weight: 800;
    color: #111827;
  }

  .affiliate-edit-product-upload-subtext {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.5;
  }

  .affiliate-edit-product-file-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
  }

  .affiliate-edit-product-file-name {
    font-size: 13px;
    font-weight: 700;
    color: #111827;
    word-break: break-word;
  }

  .affiliate-edit-product-file-remove {
    height: 34px;
    padding: 0 12px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    color: #111827;
    font-size: 12px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .affiliate-edit-product-image-preview-wrap {
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    background: #ffffff;
  }

  .affiliate-edit-product-image-preview {
    width: 100%;
    max-height: 320px;
    object-fit: cover;
    display: block;
  }

  .affiliate-edit-product-help {
    color: #6b7280;
    font-size: 12px;
    line-height: 1.5;
  }

  .affiliate-edit-product-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
  }

  .affiliate-edit-product-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-edit-product-alert.success {
    background: #ecfdf3;
    border: 1px solid #abefc6;
    color: #027a48;
  }

  .affiliate-edit-product-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-edit-product-btn {
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

  .affiliate-edit-product-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-edit-product-summary {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-edit-product-summary-row {
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

  .affiliate-edit-product-summary-row span {
    color: #6b7280;
    font-weight: 700;
  }

  .affiliate-edit-product-summary-row strong {
    color: #111827;
    font-weight: 900;
    text-align: right;
  }

  .affiliate-edit-product-tips {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-edit-product-tip {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 14px 16px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
  }

  .affiliate-edit-product-tip .dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: #111827;
    margin-top: 7px;
    flex-shrink: 0;
  }

  .affiliate-edit-product-tip p {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
  }

  @media (max-width: 1100px) {
    .affiliate-edit-product-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 991px) {
    .affiliate-edit-product-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-edit-product-title {
      font-size: 26px;
    }

    .affiliate-edit-product-panel {
      padding: 18px;
    }
  }

  @media (max-width: 767px) {
    .affiliate-edit-product-form-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-edit-product-field-full {
      grid-column: span 1;
    }

    .affiliate-edit-product-title {
      font-size: 22px;
    }

    .affiliate-edit-product-subtitle {
      font-size: 14px;
    }

    .affiliate-edit-product-summary-row {
      flex-direction: column;
      align-items: flex-start;
    }

    .affiliate-edit-product-actions,
    .affiliate-edit-product-hero-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-edit-product-btn {
      width: 100%;
    }

    .affiliate-edit-product-file-row {
      flex-direction: column;
      align-items: flex-start;
    }

    .affiliate-edit-product-file-remove {
      width: 100%;
      justify-content: center;
    }
  }
`;export{xe as default};
