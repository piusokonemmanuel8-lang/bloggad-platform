import{m as H,r as d,j as e,R as O,d as J,T as K,a as h}from"./index-D7wY-Nn2.js";import{I as N}from"./image-BTrYsFjv.js";import{T as v}from"./type-3Q8n5jnK.js";import{B as Q}from"./boxes-CUbqi4mZ.js";import{C as W}from"./circle-alert-BxSISDFL.js";import{C as X}from"./circle-check-DwQtcZzx.js";import{S as Y}from"./save-Csp8w2vE.js";/**
 * @license lucide-react v1.8.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z=[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["circle",{cx:"10",cy:"12",r:"2",key:"737tya"}],["path",{d:"m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22",key:"wt3hpn"}]],A=H("file-image",Z);/**
 * @license lucide-react v1.8.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ee=[["path",{d:"m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",key:"usdka0"}]],D=H("folder-open",ee);function B(){return{website_id:"",file_name:"",file_path:"",file_type:"",mime_type:"",file_size:"",alt_text:"",title:"",source_type:"general"}}function _(f=""){return{general:"General",logo:"Logo",banner:"Banner",slider:"Slider",product:"Product",post:"Post",template:"Template"}[String(f).toLowerCase()]||f||"-"}function fe(){const[f,u]=d.useState([]),[r,z]=d.useState(""),[i,b]=d.useState(B()),[U,k]=d.useState(!0),[j,S]=d.useState(!1),[M,C]=d.useState(!1),[F,L]=d.useState(!1),[E,c]=d.useState(""),[I,x]=d.useState(""),T=async(a=!1)=>{var t,l;try{a?S(!0):k(!0);const{data:s}=await h.get("/api/affiliate/media"),o=(s==null?void 0:s.media)||[];u(o),!r&&o.length&&y(o[0])}catch(s){c(((l=(t=s==null?void 0:s.response)==null?void 0:t.data)==null?void 0:l.message)||"Failed to load media library")}finally{k(!1),S(!1)}};d.useEffect(()=>{T()},[]);const y=a=>{z(String(a.id)),b({website_id:a.website_id||"",file_name:a.file_name||"",file_path:a.file_path||"",file_type:a.file_type||"",mime_type:a.mime_type||"",file_size:a.file_size??"",alt_text:a.alt_text||"",title:a.title||"",source_type:a.source_type||"general"}),c(""),x("")},R=()=>{z(""),b(B()),c(""),x("")},n=a=>{const{name:t,value:l}=a.target;b(s=>({...s,[t]:l}))},P=async(a=null)=>{const{data:t}=await h.get("/api/affiliate/media"),l=(t==null?void 0:t.media)||[];u(l);const s=l.find(o=>String(o.id)===String(a||r));s?y(s):l.length||R()},q=()=>{if(!i.file_name.trim())throw new Error("File name is required");if(!i.file_path.trim())throw new Error("File path is required")},G=async a=>{var t,l,s,o;a.preventDefault(),C(!0),c(""),x("");try{q();const p={website_id:i.website_id||null,file_name:i.file_name,file_path:i.file_path,file_type:i.file_type,mime_type:i.mime_type,file_size:i.file_size,alt_text:i.alt_text,title:i.title,source_type:i.source_type};let m;r?m=await h.put(`/api/affiliate/media/${r}`,p):m=await h.post("/api/affiliate/media",p);const g=(t=m==null?void 0:m.data)==null?void 0:t.media;g!=null&&g.id&&await P(g.id),x(((l=m==null?void 0:m.data)==null?void 0:l.message)||"Media saved successfully")}catch(p){c(((o=(s=p==null?void 0:p.response)==null?void 0:s.data)==null?void 0:o.message)||p.message||"Failed to save media")}finally{C(!1)}},V=async()=>{var a,t;if(r){L(!0),c(""),x("");try{const{data:l}=await h.delete(`/api/affiliate/media/${r}`);await P(),x((l==null?void 0:l.message)||"Media deleted successfully")}catch(l){c(((t=(a=l==null?void 0:l.response)==null?void 0:a.data)==null?void 0:t.message)||"Failed to delete media")}finally{L(!1)}}},w=d.useMemo(()=>({total:f.length,images:f.filter(a=>String(a.mime_type||a.file_type||"").toLowerCase().includes("image")).length,source:_(i.source_type)}),[f,i.source_type]);return U?e.jsxs("div",{className:"affiliate-media-page",children:[e.jsx("style",{children:$}),e.jsx("div",{className:"affiliate-media-loading-wrap",children:e.jsxs("div",{className:"affiliate-media-loading-card",children:[e.jsx("div",{className:"affiliate-media-spinner"}),e.jsx("p",{children:"Loading media library..."})]})})]}):e.jsxs("div",{className:"affiliate-media-page",children:[e.jsx("style",{children:$}),e.jsxs("section",{className:"affiliate-media-hero",children:[e.jsxs("div",{className:"affiliate-media-hero-copy",children:[e.jsx("div",{className:"affiliate-media-badge",children:"Media manager"}),e.jsx("h1",{className:"affiliate-media-title",children:"Media Library"}),e.jsx("p",{className:"affiliate-media-subtitle",children:"Manage product, post, slider, banner, logo, and general media records from one place."})]}),e.jsxs("div",{className:"affiliate-media-hero-actions",children:[e.jsxs("button",{className:"affiliate-media-btn secondary",type:"button",onClick:()=>T(!0),disabled:j,children:[e.jsx(O,{size:16,className:j?"spin":""}),j?"Refreshing...":"Refresh"]}),e.jsxs("button",{className:"affiliate-media-btn primary",type:"button",onClick:R,children:[e.jsx(J,{size:16}),"New Media"]})]})]}),e.jsxs("section",{className:"affiliate-media-stats",children:[e.jsxs("div",{className:"affiliate-media-stat-card",children:[e.jsx("span",{children:"Total Media"}),e.jsx("strong",{children:w.total})]}),e.jsxs("div",{className:"affiliate-media-stat-card",children:[e.jsx("span",{children:"Images"}),e.jsx("strong",{children:w.images})]}),e.jsxs("div",{className:"affiliate-media-stat-card",children:[e.jsx("span",{children:"Current Source"}),e.jsx("strong",{children:w.source})]})]}),e.jsxs("section",{className:"affiliate-media-grid",children:[e.jsxs("div",{className:"affiliate-media-panel",children:[e.jsx("div",{className:"affiliate-media-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-media-panel-kicker",children:"Media items"}),e.jsx("h2",{className:"affiliate-media-panel-title",children:"Library List"})]})}),f.length?e.jsx("div",{className:"affiliate-media-list",children:f.map(a=>{const t=String(r)===String(a.id);return e.jsxs("button",{type:"button",className:`affiliate-media-list-card${t?" active":""}`,onClick:()=>y(a),children:[e.jsx("div",{className:"affiliate-media-list-preview",children:a.file_path?e.jsx("img",{src:a.file_path,alt:a.alt_text||a.file_name,className:"affiliate-media-thumb"}):e.jsx("div",{className:"affiliate-media-thumb-empty",children:e.jsx(N,{size:18})})}),e.jsxs("div",{className:"affiliate-media-list-main",children:[e.jsx("h3",{children:a.file_name}),e.jsx("p",{children:_(a.source_type)}),e.jsx("small",{children:a.file_type||a.mime_type||"-"})]})]},a.id)})}):e.jsxs("div",{className:"affiliate-media-empty-small",children:[e.jsx(D,{size:24}),e.jsx("p",{children:"No media yet."})]})]}),e.jsxs("div",{className:"affiliate-media-side-stack",children:[e.jsxs("div",{className:"affiliate-media-panel",children:[e.jsx("div",{className:"affiliate-media-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-media-panel-kicker",children:"Editor"}),e.jsx("h2",{className:"affiliate-media-panel-title",children:r?"Edit Media":"Create Media"})]})}),e.jsxs("form",{className:"affiliate-media-form",onSubmit:G,children:[e.jsxs("div",{className:"affiliate-media-form-grid",children:[e.jsxs("label",{className:"affiliate-media-field",children:[e.jsxs("span",{className:"affiliate-media-label",children:[e.jsx(v,{size:16}),"File name"]}),e.jsx("input",{className:"affiliate-media-input",name:"file_name",placeholder:"File name",value:i.file_name,onChange:n})]}),e.jsxs("label",{className:"affiliate-media-field affiliate-media-field-full",children:[e.jsxs("span",{className:"affiliate-media-label",children:[e.jsx(N,{size:16}),"File path / URL"]}),e.jsx("input",{className:"affiliate-media-input",name:"file_path",placeholder:"File path / URL",value:i.file_path,onChange:n})]}),e.jsxs("label",{className:"affiliate-media-field",children:[e.jsxs("span",{className:"affiliate-media-label",children:[e.jsx(A,{size:16}),"File type"]}),e.jsx("input",{className:"affiliate-media-input",name:"file_type",placeholder:"File type",value:i.file_type,onChange:n})]}),e.jsxs("label",{className:"affiliate-media-field",children:[e.jsxs("span",{className:"affiliate-media-label",children:[e.jsx(A,{size:16}),"MIME type"]}),e.jsx("input",{className:"affiliate-media-input",name:"mime_type",placeholder:"MIME type",value:i.mime_type,onChange:n})]}),e.jsxs("label",{className:"affiliate-media-field",children:[e.jsxs("span",{className:"affiliate-media-label",children:[e.jsx(Q,{size:16}),"File size"]}),e.jsx("input",{className:"affiliate-media-input",name:"file_size",type:"number",placeholder:"File size",value:i.file_size,onChange:n})]}),e.jsxs("label",{className:"affiliate-media-field",children:[e.jsxs("span",{className:"affiliate-media-label",children:[e.jsx(D,{size:16}),"Source type"]}),e.jsxs("select",{className:"affiliate-media-input",name:"source_type",value:i.source_type,onChange:n,children:[e.jsx("option",{value:"general",children:"General"}),e.jsx("option",{value:"logo",children:"Logo"}),e.jsx("option",{value:"banner",children:"Banner"}),e.jsx("option",{value:"slider",children:"Slider"}),e.jsx("option",{value:"product",children:"Product"}),e.jsx("option",{value:"post",children:"Post"}),e.jsx("option",{value:"template",children:"Template"})]})]}),e.jsxs("label",{className:"affiliate-media-field",children:[e.jsxs("span",{className:"affiliate-media-label",children:[e.jsx(v,{size:16}),"Title"]}),e.jsx("input",{className:"affiliate-media-input",name:"title",placeholder:"Title",value:i.title,onChange:n})]}),e.jsxs("label",{className:"affiliate-media-field",children:[e.jsxs("span",{className:"affiliate-media-label",children:[e.jsx(v,{size:16}),"Alt text"]}),e.jsx("input",{className:"affiliate-media-input",name:"alt_text",placeholder:"Alt text",value:i.alt_text,onChange:n})]})]}),E?e.jsxs("div",{className:"affiliate-media-alert error",children:[e.jsx(W,{size:18}),e.jsx("span",{children:E})]}):null,I?e.jsxs("div",{className:"affiliate-media-alert success",children:[e.jsx(X,{size:18}),e.jsx("span",{children:I})]}):null,e.jsxs("div",{className:"affiliate-media-actions",children:[e.jsxs("button",{className:"affiliate-media-btn primary",type:"submit",disabled:M,children:[e.jsx(Y,{size:16}),M?"Saving...":r?"Update Media":"Create Media"]}),r?e.jsxs("button",{className:"affiliate-media-btn secondary",type:"button",onClick:V,disabled:F,children:[e.jsx(K,{size:16}),F?"Deleting...":"Delete Media"]}):null]})]})]}),e.jsxs("div",{className:"affiliate-media-panel",children:[e.jsx("div",{className:"affiliate-media-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-media-panel-kicker",children:"Preview"}),e.jsx("h2",{className:"affiliate-media-panel-title",children:"Media Summary"})]})}),e.jsxs("div",{className:"affiliate-media-preview-card",children:[i.file_path?e.jsx("img",{src:i.file_path,alt:i.alt_text||i.file_name||"Media preview",className:"affiliate-media-preview-image"}):e.jsxs("div",{className:"affiliate-media-preview-placeholder",children:[e.jsx(N,{size:26}),e.jsx("span",{children:"No preview"})]}),e.jsxs("div",{className:"affiliate-media-summary-list",children:[e.jsxs("div",{className:"affiliate-media-summary-row",children:[e.jsx("span",{children:"File name"}),e.jsx("strong",{children:i.file_name||"-"})]}),e.jsxs("div",{className:"affiliate-media-summary-row",children:[e.jsx("span",{children:"Source"}),e.jsx("strong",{children:_(i.source_type)})]}),e.jsxs("div",{className:"affiliate-media-summary-row",children:[e.jsx("span",{children:"Type"}),e.jsx("strong",{children:i.file_type||"-"})]}),e.jsxs("div",{className:"affiliate-media-summary-row",children:[e.jsx("span",{children:"MIME"}),e.jsx("strong",{children:i.mime_type||"-"})]}),e.jsxs("div",{className:"affiliate-media-summary-row",children:[e.jsx("span",{children:"Size"}),e.jsx("strong",{children:i.file_size||"-"})]}),e.jsxs("div",{className:"affiliate-media-summary-row",children:[e.jsx("span",{children:"Title"}),e.jsx("strong",{children:i.title||"-"})]})]})]})]})]})]})]})}const $=`
  * {
    box-sizing: border-box;
  }

  .affiliate-media-page {
    width: 100%;
  }

  .affiliate-media-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-media-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-media-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliateMediaSpin 0.8s linear infinite;
  }

  @keyframes affiliateMediaSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: affiliateMediaSpin 0.8s linear infinite;
  }

  .affiliate-media-hero {
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

  .affiliate-media-badge {
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

  .affiliate-media-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-media-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-media-hero-actions,
  .affiliate-media-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-media-btn {
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

  .affiliate-media-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-media-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .affiliate-media-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .affiliate-media-stat-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 22px;
    padding: 18px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-media-stat-card span {
    color: #6b7280;
    font-size: 13px;
    font-weight: 700;
  }

  .affiliate-media-stat-card strong {
    color: #111827;
    font-size: 26px;
    font-weight: 900;
    text-transform: capitalize;
  }

  .affiliate-media-grid {
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.25fr);
    gap: 20px;
  }

  .affiliate-media-side-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .affiliate-media-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-media-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .affiliate-media-panel-kicker {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .affiliate-media-panel-title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-media-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-media-list-card {
    width: 100%;
    padding: 14px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    cursor: pointer;
    text-align: left;
    transition: 0.2s ease;
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .affiliate-media-list-card.active {
    border-color: #111827;
    background: #ffffff;
    box-shadow: inset 0 0 0 1px #111827;
  }

  .affiliate-media-list-preview {
    width: 60px;
    height: 60px;
    border-radius: 14px;
    overflow: hidden;
    flex-shrink: 0;
    background: #ffffff;
    border: 1px solid #e5e7eb;
  }

  .affiliate-media-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .affiliate-media-thumb-empty {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    color: #6b7280;
  }

  .affiliate-media-list-main h3 {
    margin: 0 0 5px;
    font-size: 15px;
    font-weight: 900;
    color: #111827;
    word-break: break-word;
  }

  .affiliate-media-list-main p,
  .affiliate-media-list-main small {
    display: block;
    margin: 0;
    color: #6b7280;
    line-height: 1.5;
  }

  .affiliate-media-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .affiliate-media-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .affiliate-media-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-media-field-full {
    grid-column: span 2;
  }

  .affiliate-media-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 800;
    color: #111827;
  }

  .affiliate-media-input {
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

  .affiliate-media-input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.06);
  }

  .affiliate-media-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
  }

  .affiliate-media-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-media-alert.success {
    background: #ecfdf3;
    border: 1px solid #abefc6;
    color: #027a48;
  }

  .affiliate-media-preview-card {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .affiliate-media-preview-image,
  .affiliate-media-preview-placeholder {
    width: 100%;
    height: 220px;
    border-radius: 18px;
    border: 1px solid #edf2f7;
    background: #f8fafc;
  }

  .affiliate-media-preview-image {
    object-fit: cover;
    display: block;
  }

  .affiliate-media-preview-placeholder {
    display: grid;
    place-items: center;
    color: #6b7280;
    gap: 8px;
    text-align: center;
  }

  .affiliate-media-summary-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-media-summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 16px;
  }

  .affiliate-media-summary-row span {
    color: #6b7280;
    font-weight: 700;
    font-size: 13px;
  }

  .affiliate-media-summary-row strong {
    color: #111827;
    font-weight: 900;
    text-align: right;
    word-break: break-word;
  }

  .affiliate-media-empty-small {
    min-height: 180px;
    border: 1px dashed #dbe2ea;
    background: #f8fafc;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
    padding: 22px;
  }

  .affiliate-media-empty-small p {
    margin: 0;
    color: #111827;
    font-weight: 800;
  }

  @media (max-width: 1100px) {
    .affiliate-media-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 991px) {
    .affiliate-media-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-media-title {
      font-size: 26px;
    }

    .affiliate-media-stats {
      grid-template-columns: 1fr;
    }

    .affiliate-media-panel {
      padding: 18px;
    }
  }

  @media (max-width: 767px) {
    .affiliate-media-title {
      font-size: 22px;
    }

    .affiliate-media-subtitle {
      font-size: 14px;
    }

    .affiliate-media-hero-actions,
    .affiliate-media-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-media-form-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-media-field-full {
      grid-column: span 1;
    }

    .affiliate-media-btn {
      width: 100%;
    }

    .affiliate-media-list-card,
    .affiliate-media-summary-row {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;export{fe as default};
