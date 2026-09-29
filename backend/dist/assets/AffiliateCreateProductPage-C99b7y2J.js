import{e as M,b as q,r as c,j as e,X as B,S,F as D,a as P}from"./index-LXBBJt7I.js";import{v as $}from"./validateSupgadUrl-KW1pmdpE.js";import{P as L}from"./package-BZvUXVf6.js";import{L as W}from"./layers-CY6ZhHm5.js";import{T as E}from"./tag-XMSxVyON.js";import{I as G}from"./image-DDgd2sPC.js";import{U as H}from"./upload-WKtBKnBi.js";import{D as p}from"./dollar-sign-DoxV_dLF.js";import{L as V}from"./link-CCVOqyaN.js";import{C as J}from"./circle-alert-DsZo9igC.js";import{C as X}from"./circle-check-ml_0upGj.js";import{S as K}from"./save-Co8lXD7U.js";function O(f=""){return String(f).toLowerCase().trim().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-")}function pe(){const f=M(),R=q().pathname.startsWith("/writer/")?"/writer":"/affiliate",[u,h]=c.useState([]),[a,m]=c.useState({category_id:"",title:"",slug:"",product_image:"",pricing_type:"simple",price:"",min_price:"",max_price:"",homepage_cta_label:"Buy Now",storefront_cta_label:"Read More",affiliate_buy_url:"",short_description:"",status:"draft"}),[b,j]=c.useState(!0),[y,N]=c.useState(!1),[v,x]=c.useState(!1),[_,g]=c.useState(""),[w,n]=c.useState(""),[k,z]=c.useState("");c.useEffect(()=>{(async()=>{try{j(!0);const{data:t}=await P.get("/api/public/categories");h((t==null?void 0:t.categories)||[])}catch{h([])}finally{j(!1)}})()},[]);const r=i=>{const{name:t,value:s}=i.target;m(o=>{const l={...o,[t]:s};return t==="title"&&!o.slug.trim()&&(l.slug=O(s)),l})},A=i=>{var o;const t=(o=i.target.files)==null?void 0:o[0];if(!t)return;if(!t.type.startsWith("image/")){n("Please choose a valid image file."),i.target.value="";return}x(!0),n(""),g(t.name);const s=new FileReader;s.onload=()=>{m(l=>({...l,product_image:String(s.result||"")})),x(!1)},s.onerror=()=>{x(!1),g(""),n("Failed to read the selected image file."),i.target.value=""},s.readAsDataURL(t)},F=()=>{m(i=>({...i,product_image:""})),g(""),n("")},I=c.useMemo(()=>{const i=u.find(t=>String(t.id)===String(a.category_id));return(i==null?void 0:i.name)||"-"},[u,a.category_id]),T=c.useMemo(()=>a.pricing_type==="simple"?a.price?a.price:"-":!a.min_price&&!a.max_price?"-":`${a.min_price||0} - ${a.max_price||0}`,[a.pricing_type,a.price,a.min_price,a.max_price]),U=async i=>{var t,s,o;i.preventDefault(),N(!0),n(""),z("");try{if(!a.title.trim())throw new Error("Product title is required");if(!a.product_image.trim())throw new Error("Product image is required");if(a.pricing_type==="simple"&&!a.price)throw new Error("Price is required for simple product");if(a.pricing_type==="variable"){if(!a.min_price||!a.max_price)throw new Error("Minimum and maximum price are required for variable product");if(Number(a.max_price)<Number(a.min_price))throw new Error("Maximum price must be greater than or equal to minimum price")}if(a.affiliate_buy_url.trim()){const C=$(a.affiliate_buy_url,{required:!0,allowEmpty:!1,fieldName:"Affiliate Buy URL"});if(!C.ok)throw new Error(C.message)}const l={category_id:a.category_id||null,title:a.title,slug:a.slug,product_image:a.product_image,pricing_type:a.pricing_type,price:a.pricing_type==="simple"?a.price:null,min_price:a.pricing_type==="variable"?a.min_price:null,max_price:a.pricing_type==="variable"?a.max_price:null,homepage_cta_label:a.homepage_cta_label,storefront_cta_label:a.storefront_cta_label,affiliate_buy_url:a.affiliate_buy_url,short_description:a.short_description,status:a.status},{data:d}=await P.post("/api/affiliate/products",l);d!=null&&d.ok&&((t=d==null?void 0:d.product)!=null&&t.id)&&(z("Product created successfully. Redirecting..."),setTimeout(()=>{f(`${R}/products/${d.product.id}/posts`)},700))}catch(l){n(((o=(s=l==null?void 0:l.response)==null?void 0:s.data)==null?void 0:o.message)||l.message||"Failed to create product")}finally{N(!1)}};return e.jsxs("div",{className:"affiliate-create-product-page",children:[e.jsx("style",{children:Q}),e.jsxs("section",{className:"affiliate-create-product-hero",children:[e.jsxs("div",{className:"affiliate-create-product-hero-copy",children:[e.jsx("div",{className:"affiliate-create-product-badge",children:"Product creator"}),e.jsx("h1",{className:"affiliate-create-product-title",children:"Create Product"}),e.jsx("p",{className:"affiliate-create-product-subtitle",children:"Add a product, choose pricing, and connect only approved Supgad links."})]}),e.jsx("div",{className:"affiliate-create-product-hero-icon",children:e.jsx(L,{size:28})})]}),e.jsxs("section",{className:"affiliate-create-product-grid",children:[e.jsxs("div",{className:"affiliate-create-product-panel affiliate-create-product-panel-main",children:[e.jsx("div",{className:"affiliate-create-product-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-create-product-panel-kicker",children:"Product details"}),e.jsx("h2",{className:"affiliate-create-product-panel-title",children:"Fill in the product information"})]})}),e.jsxs("form",{className:"affiliate-create-product-form",onSubmit:U,children:[e.jsxs("div",{className:"affiliate-create-product-form-grid",children:[e.jsxs("label",{className:"affiliate-create-product-field",children:[e.jsxs("span",{className:"affiliate-create-product-label",children:[e.jsx(W,{size:16}),"Category"]}),e.jsxs("select",{className:"affiliate-create-product-input",name:"category_id",value:a.category_id,onChange:r,disabled:b,children:[e.jsx("option",{value:"",children:b?"Loading categories...":"Select category"}),u.map(i=>e.jsx("option",{value:i.id,children:i.name},i.id))]})]}),e.jsxs("label",{className:"affiliate-create-product-field",children:[e.jsxs("span",{className:"affiliate-create-product-label",children:[e.jsx(L,{size:16}),"Product title"]}),e.jsx("input",{className:"affiliate-create-product-input",name:"title",placeholder:"Product title",value:a.title,onChange:r})]}),e.jsxs("label",{className:"affiliate-create-product-field",children:[e.jsxs("span",{className:"affiliate-create-product-label",children:[e.jsx(E,{size:16}),"Slug"]}),e.jsx("input",{className:"affiliate-create-product-input",name:"slug",placeholder:"Custom slug (optional)",value:a.slug,onChange:r})]}),e.jsxs("div",{className:"affiliate-create-product-field affiliate-create-product-field-full",children:[e.jsxs("span",{className:"affiliate-create-product-label",children:[e.jsx(G,{size:16}),"Product image"]}),e.jsxs("label",{className:"affiliate-create-product-upload-box",children:[e.jsx("input",{className:"affiliate-create-product-file-input",type:"file",accept:"image/*",onChange:A}),e.jsxs("span",{className:"affiliate-create-product-upload-inner",children:[e.jsx("span",{className:"affiliate-create-product-upload-icon",children:e.jsx(H,{size:18})}),e.jsx("span",{className:"affiliate-create-product-upload-text",children:v?"Uploading image...":"Upload image from device"}),e.jsx("span",{className:"affiliate-create-product-upload-subtext",children:"JPG, PNG, WEBP and other image files supported"})]})]}),_?e.jsxs("div",{className:"affiliate-create-product-file-row",children:[e.jsx("span",{className:"affiliate-create-product-file-name",children:_}),e.jsxs("button",{type:"button",className:"affiliate-create-product-file-remove",onClick:F,children:[e.jsx(B,{size:14}),"Remove"]})]}):null,a.product_image?e.jsx("div",{className:"affiliate-create-product-image-preview-wrap",children:e.jsx("img",{src:a.product_image,alt:"Product preview",className:"affiliate-create-product-image-preview"})}):null]}),e.jsxs("label",{className:"affiliate-create-product-field",children:[e.jsxs("span",{className:"affiliate-create-product-label",children:[e.jsx(p,{size:16}),"Pricing type"]}),e.jsxs("select",{className:"affiliate-create-product-input",name:"pricing_type",value:a.pricing_type,onChange:r,children:[e.jsx("option",{value:"simple",children:"Simple"}),e.jsx("option",{value:"variable",children:"Variable"})]})]}),a.pricing_type==="simple"?e.jsxs("label",{className:"affiliate-create-product-field",children:[e.jsxs("span",{className:"affiliate-create-product-label",children:[e.jsx(p,{size:16}),"Price"]}),e.jsx("input",{className:"affiliate-create-product-input",name:"price",type:"number",placeholder:"Price",value:a.price,onChange:r})]}):e.jsxs(e.Fragment,{children:[e.jsxs("label",{className:"affiliate-create-product-field",children:[e.jsxs("span",{className:"affiliate-create-product-label",children:[e.jsx(p,{size:16}),"Minimum price"]}),e.jsx("input",{className:"affiliate-create-product-input",name:"min_price",type:"number",placeholder:"Minimum price",value:a.min_price,onChange:r})]}),e.jsxs("label",{className:"affiliate-create-product-field",children:[e.jsxs("span",{className:"affiliate-create-product-label",children:[e.jsx(p,{size:16}),"Maximum price"]}),e.jsx("input",{className:"affiliate-create-product-input",name:"max_price",type:"number",placeholder:"Maximum price",value:a.max_price,onChange:r})]})]}),e.jsxs("label",{className:"affiliate-create-product-field",children:[e.jsxs("span",{className:"affiliate-create-product-label",children:[e.jsx(S,{size:16}),"Homepage CTA label"]}),e.jsx("input",{className:"affiliate-create-product-input",name:"homepage_cta_label",placeholder:"Homepage CTA label",value:a.homepage_cta_label,onChange:r})]}),e.jsxs("label",{className:"affiliate-create-product-field",children:[e.jsxs("span",{className:"affiliate-create-product-label",children:[e.jsx(S,{size:16}),"Storefront CTA label"]}),e.jsx("input",{className:"affiliate-create-product-input",name:"storefront_cta_label",placeholder:"Storefront CTA label",value:a.storefront_cta_label,onChange:r})]}),e.jsxs("label",{className:"affiliate-create-product-field affiliate-create-product-field-full",children:[e.jsxs("span",{className:"affiliate-create-product-label",children:[e.jsx(V,{size:16}),"Affiliate Buy URL"]}),e.jsx("input",{className:"affiliate-create-product-input",name:"affiliate_buy_url",placeholder:"Product / destination URL",value:a.affiliate_buy_url,onChange:r}),e.jsx("small",{className:"affiliate-create-product-help",children:"External links are allowed and checked by Bloggad on save."})]}),e.jsxs("label",{className:"affiliate-create-product-field affiliate-create-product-field-full",children:[e.jsxs("span",{className:"affiliate-create-product-label",children:[e.jsx(D,{size:16}),"Short description"]}),e.jsx("textarea",{className:"affiliate-create-product-input affiliate-create-product-textarea",name:"short_description",placeholder:"Short description",rows:"5",value:a.short_description,onChange:r})]}),e.jsxs("label",{className:"affiliate-create-product-field",children:[e.jsxs("span",{className:"affiliate-create-product-label",children:[e.jsx(E,{size:16}),"Status"]}),e.jsxs("select",{className:"affiliate-create-product-input",name:"status",value:a.status,onChange:r,children:[e.jsx("option",{value:"draft",children:"Draft"}),e.jsx("option",{value:"published",children:"Published"}),e.jsx("option",{value:"inactive",children:"Inactive"})]})]})]}),w?e.jsxs("div",{className:"affiliate-create-product-alert error",children:[e.jsx(J,{size:18}),e.jsx("span",{children:w})]}):null,k?e.jsxs("div",{className:"affiliate-create-product-alert success",children:[e.jsx(X,{size:18}),e.jsx("span",{children:k})]}):null,e.jsx("div",{className:"affiliate-create-product-actions",children:e.jsxs("button",{className:"affiliate-create-product-save-btn",type:"submit",disabled:y||v,children:[e.jsx(K,{size:16}),y?"Saving...":"Create Product"]})})]})]}),e.jsxs("div",{className:"affiliate-create-product-side-stack",children:[e.jsxs("div",{className:"affiliate-create-product-panel",children:[e.jsx("div",{className:"affiliate-create-product-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-create-product-panel-kicker",children:"Live summary"}),e.jsx("h2",{className:"affiliate-create-product-panel-title",children:"Preview details"})]})}),e.jsxs("div",{className:"affiliate-create-product-summary",children:[e.jsxs("div",{className:"affiliate-create-product-summary-row",children:[e.jsx("span",{children:"Title"}),e.jsx("strong",{children:a.title||"-"})]}),e.jsxs("div",{className:"affiliate-create-product-summary-row",children:[e.jsx("span",{children:"Category"}),e.jsx("strong",{children:I})]}),e.jsxs("div",{className:"affiliate-create-product-summary-row",children:[e.jsx("span",{children:"Slug"}),e.jsx("strong",{children:a.slug||"-"})]}),e.jsxs("div",{className:"affiliate-create-product-summary-row",children:[e.jsx("span",{children:"Pricing type"}),e.jsx("strong",{children:a.pricing_type||"-"})]}),e.jsxs("div",{className:"affiliate-create-product-summary-row",children:[e.jsx("span",{children:"Price preview"}),e.jsx("strong",{children:T})]}),e.jsxs("div",{className:"affiliate-create-product-summary-row",children:[e.jsx("span",{children:"Status"}),e.jsx("strong",{children:a.status||"-"})]})]})]}),e.jsxs("div",{className:"affiliate-create-product-panel",children:[e.jsx("div",{className:"affiliate-create-product-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-create-product-panel-kicker",children:"Rules"}),e.jsx("h2",{className:"affiliate-create-product-panel-title",children:"Important notes"})]})}),e.jsxs("div",{className:"affiliate-create-product-tips",children:[e.jsxs("div",{className:"affiliate-create-product-tip",children:[e.jsx("span",{className:"dot"}),e.jsx("p",{children:"Product title and image are required."})]}),e.jsxs("div",{className:"affiliate-create-product-tip",children:[e.jsx("span",{className:"dot"}),e.jsx("p",{children:"Simple pricing needs one price only."})]}),e.jsxs("div",{className:"affiliate-create-product-tip",children:[e.jsx("span",{className:"dot"}),e.jsx("p",{children:"Variable pricing needs minimum and maximum values."})]}),e.jsxs("div",{className:"affiliate-create-product-tip",children:[e.jsx("span",{className:"dot"}),e.jsx("p",{children:"Legitimate external links are allowed. Bloggad records and reviews outbound destinations for safety."})]})]})]})]})]})]})}const Q=`
  * {
    box-sizing: border-box;
  }

  .affiliate-create-product-page {
    width: 100%;
  }

  .affiliate-create-product-hero {
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

  .affiliate-create-product-badge {
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

  .affiliate-create-product-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-create-product-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-create-product-hero-icon {
    width: 62px;
    height: 62px;
    border-radius: 20px;
    background: #111827;
    color: #ffffff;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .affiliate-create-product-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.8fr);
    gap: 20px;
  }

  .affiliate-create-product-side-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .affiliate-create-product-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-create-product-panel-main {
    min-height: 100%;
  }

  .affiliate-create-product-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .affiliate-create-product-panel-kicker {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .affiliate-create-product-panel-title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-create-product-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .affiliate-create-product-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .affiliate-create-product-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-create-product-field-full {
    grid-column: span 2;
  }

  .affiliate-create-product-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 800;
    color: #111827;
  }

  .affiliate-create-product-input {
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

  .affiliate-create-product-input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.06);
  }

  .affiliate-create-product-textarea {
    min-height: 130px;
    padding: 14px;
    resize: vertical;
  }

  .affiliate-create-product-upload-box {
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

  .affiliate-create-product-upload-box:hover {
    border-color: #111827;
    background: #f3f4f6;
  }

  .affiliate-create-product-file-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .affiliate-create-product-upload-inner {
    min-height: 120px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-align: center;
  }

  .affiliate-create-product-upload-icon {
    width: 42px;
    height: 42px;
    border-radius: 999px;
    background: #111827;
    color: #ffffff;
    display: grid;
    place-items: center;
  }

  .affiliate-create-product-upload-text {
    font-size: 14px;
    font-weight: 800;
    color: #111827;
  }

  .affiliate-create-product-upload-subtext {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.5;
  }

  .affiliate-create-product-file-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
  }

  .affiliate-create-product-file-name {
    font-size: 13px;
    font-weight: 700;
    color: #111827;
    word-break: break-word;
  }

  .affiliate-create-product-file-remove {
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

  .affiliate-create-product-image-preview-wrap {
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    background: #ffffff;
  }

  .affiliate-create-product-image-preview {
    width: 100%;
    max-height: 320px;
    object-fit: cover;
    display: block;
  }

  .affiliate-create-product-help {
    color: #6b7280;
    font-size: 12px;
    line-height: 1.5;
  }

  .affiliate-create-product-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
  }

  .affiliate-create-product-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-create-product-alert.success {
    background: #ecfdf3;
    border: 1px solid #abefc6;
    color: #027a48;
  }

  .affiliate-create-product-actions {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  .affiliate-create-product-save-btn {
    height: 46px;
    padding: 0 16px;
    border-radius: 14px;
    border: 1px solid #111827;
    background: #111827;
    color: #ffffff;
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

  .affiliate-create-product-save-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .affiliate-create-product-summary {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-create-product-summary-row {
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

  .affiliate-create-product-summary-row span {
    color: #6b7280;
    font-weight: 700;
  }

  .affiliate-create-product-summary-row strong {
    color: #111827;
    font-weight: 900;
    text-align: right;
  }

  .affiliate-create-product-tips {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-create-product-tip {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 14px 16px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
  }

  .affiliate-create-product-tip .dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: #111827;
    margin-top: 7px;
    flex-shrink: 0;
  }

  .affiliate-create-product-tip p {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
  }

  @media (max-width: 1100px) {
    .affiliate-create-product-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 991px) {
    .affiliate-create-product-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-create-product-title {
      font-size: 26px;
    }

    .affiliate-create-product-panel {
      padding: 18px;
    }
  }

  @media (max-width: 767px) {
    .affiliate-create-product-form-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-create-product-field-full {
      grid-column: span 1;
    }

    .affiliate-create-product-title {
      font-size: 22px;
    }

    .affiliate-create-product-subtitle {
      font-size: 14px;
    }

    .affiliate-create-product-summary-row {
      flex-direction: column;
      align-items: flex-start;
    }

    .affiliate-create-product-save-btn {
      width: 100%;
    }

    .affiliate-create-product-file-row {
      flex-direction: column;
      align-items: flex-start;
    }

    .affiliate-create-product-file-remove {
      width: 100%;
      justify-content: center;
    }
  }
`;export{pe as default};
