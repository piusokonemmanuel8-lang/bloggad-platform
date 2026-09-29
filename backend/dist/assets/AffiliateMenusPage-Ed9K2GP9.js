import{r as d,j as e,R as se,d as B,k as K,a as h,H as ne}from"./index-LXBBJt7I.js";import{v as ie}from"./validateSupgadUrl-KW1pmdpE.js";import{C as ae}from"./circle-alert-DsZo9igC.js";import{C as oe}from"./circle-check-ml_0upGj.js";import{S as D}from"./save-Co8lXD7U.js";import{T as le}from"./trash-2-BXfw28tL.js";import{L as me,R as de}from"./rows-3-2URhPYoD.js";import{S as ce}from"./smartphone-C1M_iyWC.js";import{F as ue}from"./folder-kanban-DTsEeGVX.js";import{L as pe}from"./link-CCVOqyaN.js";function w(l=1){return{label:"",type:"custom",linked_category_id:"",custom_url:"",sort_order:l}}function xe(l=""){const o=String(l).toLowerCase();return o==="header"?me:o==="mobile"?ce:o==="sidebar"?de:K}function fe(l=""){const o=String(l).toLowerCase();return o==="category"?ue:o==="home"?ne:pe}function ge(l=""){const o=String(l).toLowerCase();return o==="custom"?"Custom Link":o==="category"?"Category":o==="home"?"Home":o==="page"?"Page":o||"Item"}function Me(){const[l,o]=d.useState([]),[O,G]=d.useState([]),[c,j]=d.useState(""),[u,v]=d.useState({name:"",location:"header"}),[x,f]=d.useState([w(1)]),[J,M]=d.useState(!0),[S,z]=d.useState(!1),[C,I]=d.useState(!1),[L,E]=d.useState(!1),[R,p]=d.useState(""),[F,g]=d.useState(""),T=typeof window<"u"&&window.location.pathname.startsWith("/writer/"),q=async(t=!1)=>{var s,r,n,i,a;try{p(""),t?z(!0):M(!0);const[m,k]=await Promise.all([h.get("/api/affiliate/menus"),h.get("/api/public/categories")]),_=((s=m==null?void 0:m.data)==null?void 0:s.menus)||[],te=((r=k==null?void 0:k.data)==null?void 0:r.categories)||[];if(o(_),G(te),!c&&_.length){const y=_[0];j(String(y.id)),v({name:y.name||"",location:y.location||"header"}),f((n=y.items)!=null&&n.length?y.items.map((b,re)=>({label:b.label||"",type:b.type||"custom",linked_category_id:b.linked_category_id||"",custom_url:b.custom_url||"",sort_order:b.sort_order||re+1})):[w(1)])}}catch(m){p(((a=(i=m==null?void 0:m.response)==null?void 0:i.data)==null?void 0:a.message)||"Failed to load menus")}finally{M(!1),z(!1)}};d.useEffect(()=>{q()},[]);const P=t=>{const{name:s,value:r}=t.target;v(n=>({...n,[s]:r}))},U=t=>{var s;j(String(t.id)),v({name:t.name||"",location:t.location||"header"}),f((s=t.items)!=null&&s.length?t.items.map((r,n)=>({label:r.label||"",type:r.type||"custom",linked_category_id:r.linked_category_id||"",custom_url:r.custom_url||"",sort_order:r.sort_order||n+1})):[w(1)]),p(""),g("")},N=(t,s,r)=>{f(n=>{const i=[...n];return i[t]={...i[t],[s]:r},s==="type"&&(r==="category"&&(i[t].custom_url=""),r==="custom"&&(i[t].linked_category_id=""),(r==="home"||r==="page")&&(i[t].linked_category_id="",i[t].custom_url="")),i})},Q=()=>{f(t=>[...t,w(t.length+1)])},V=t=>{f(s=>{const r=s.filter((n,i)=>i!==t);return r.length?r.map((n,i)=>({...n,sort_order:i+1})):[w(1)]})},$=async(t=null)=>{const{data:s}=await h.get("/api/affiliate/menus"),r=(s==null?void 0:s.menus)||[];o(r);const n=t||c,i=r.find(a=>String(a.id)===String(n));i?U(i):r.length||H()},X=async t=>{var s,r,n,i;t.preventDefault(),I(!0),p(""),g("");try{if(!u.name.trim())throw new Error("Menu name is required");let a;c?a=await h.put(`/api/affiliate/menus/${c}`,u):a=await h.post("/api/affiliate/menus",u);const m=(s=a==null?void 0:a.data)==null?void 0:s.menu;m!=null&&m.id&&(await $(String(m.id)),j(String(m.id))),g(((r=a==null?void 0:a.data)==null?void 0:r.message)||"Menu saved successfully")}catch(a){p(((i=(n=a==null?void 0:a.response)==null?void 0:n.data)==null?void 0:i.message)||a.message||"Failed to save menu")}finally{I(!1)}},Y=()=>{for(const t of x){if(!String(t.label||"").trim())throw new Error("Every menu item must have a label");if(t.type==="category"&&!t.linked_category_id)throw new Error(`Category is required for "${t.label}"`);if(t.type==="custom"){if(!String(t.custom_url||"").trim())throw new Error(`Custom URL is required for "${t.label}"`);const s=ie(t.custom_url,{required:!0,allowEmpty:!1,fieldName:`Menu item URL (${t.label})`});if(!s.ok)throw new Error(s.message)}}},Z=async()=>{var t,s;E(!0),p(""),g("");try{if(!c)throw new Error("Create or select a menu first");Y();const r={items:x.map((i,a)=>({label:i.label,type:i.type,linked_category_id:i.type==="category"?Number(i.linked_category_id):null,custom_url:i.type==="custom"?i.custom_url:null,sort_order:a+1}))},{data:n}=await h.put(`/api/affiliate/menus/${c}/items`,r);await $(c),g((n==null?void 0:n.message)||"Menu items saved successfully")}catch(r){p(((s=(t=r==null?void 0:r.response)==null?void 0:t.data)==null?void 0:s.message)||r.message||"Failed to save menu items")}finally{E(!1)}},H=()=>{j(""),v({name:"",location:"header"}),f([w(1)]),p(""),g("")},A=d.useMemo(()=>({totalMenus:l.length,totalItems:x.length}),[l.length,x.length]),ee=u.name.trim()||(c?"Selected Menu":"New Menu");return J?e.jsxs("div",{className:"writer-menus-page",children:[e.jsx("style",{children:W}),T?e.jsx("div",{className:"writer-menus-mobile-title",children:"Menus"}):null,e.jsxs("div",{className:"writer-menus-loading",children:[e.jsx("div",{className:"writer-menus-spinner"}),e.jsx("span",{children:"Loading menus..."})]})]}):e.jsxs("div",{className:"writer-menus-page",children:[e.jsx("style",{children:W}),T?e.jsx("div",{className:"writer-menus-mobile-title",children:"Menus"}):null,e.jsxs("section",{className:"writer-menus-command",children:[e.jsxs("div",{className:"writer-menus-command-copy",children:[e.jsx("strong",{children:ee}),e.jsx("span",{children:u.location||"header"})]}),e.jsxs("div",{className:"writer-menus-command-actions",children:[e.jsxs("button",{className:"writer-menus-btn secondary",type:"button",onClick:()=>q(!0),disabled:S,children:[e.jsx(se,{size:15,className:S?"writer-menus-spin":""}),S?"Refreshing...":"Refresh"]}),e.jsxs("button",{className:"writer-menus-btn primary",type:"button",onClick:H,children:[e.jsx(B,{size:15}),"New Menu"]})]})]}),R?e.jsxs("div",{className:"writer-menus-alert error",children:[e.jsx(ae,{size:17}),e.jsx("span",{children:R})]}):null,F?e.jsxs("div",{className:"writer-menus-alert success",children:[e.jsx(oe,{size:17}),e.jsx("span",{children:F})]}):null,e.jsxs("section",{className:"writer-menus-stats",children:[e.jsxs("div",{className:"writer-menus-stat",children:[e.jsx("span",{children:"Total menus"}),e.jsx("strong",{children:A.totalMenus})]}),e.jsxs("div",{className:"writer-menus-stat",children:[e.jsx("span",{children:"Items in editor"}),e.jsx("strong",{children:A.totalItems})]}),e.jsxs("div",{className:"writer-menus-stat",children:[e.jsx("span",{children:"Current location"}),e.jsx("strong",{className:"location",children:u.location||"-"})]})]}),e.jsxs("section",{className:"writer-menus-workspace",children:[e.jsxs("div",{className:"writer-menus-list-panel",children:[e.jsxs("div",{className:"writer-menus-panel-head",children:[e.jsx("strong",{children:"Existing menus"}),e.jsxs("span",{children:[l.length," total"]})]}),l.length?e.jsx("div",{className:"writer-menus-menu-list",children:l.map(t=>{var n;const s=String(c)===String(t.id),r=xe(t.location);return e.jsxs("button",{type:"button",className:`writer-menus-menu-card${s?" active":""}`,onClick:()=>U(t),children:[e.jsx("div",{className:"writer-menus-menu-icon",children:e.jsx(r,{size:16})}),e.jsxs("div",{className:"writer-menus-menu-copy",children:[e.jsx("strong",{children:t.name}),e.jsxs("span",{children:[t.location||"header"," - ",((n=t.items)==null?void 0:n.length)||0," items"]})]}),s?e.jsx("span",{className:"writer-menus-selected",children:"Selected"}):null]},t.id)})}):e.jsxs("div",{className:"writer-menus-empty",children:[e.jsx(K,{size:22}),e.jsx("strong",{children:"No menus yet."}),e.jsx("span",{children:"Create your first menu to begin."})]}),l.length?e.jsx("p",{className:"writer-menus-list-note",children:"Select a menu to edit its details and items."}):null]}),e.jsxs("div",{className:"writer-menus-editor",children:[e.jsxs("section",{className:"writer-menus-panel writer-menus-details",children:[e.jsxs("div",{className:"writer-menus-panel-head",children:[e.jsx("strong",{children:"Menu details"}),e.jsx("span",{children:c?"Editing":"New"})]}),e.jsxs("form",{className:"writer-menus-form",onSubmit:X,children:[e.jsxs("div",{className:"writer-menus-form-grid",children:[e.jsxs("label",{className:"writer-menus-field",children:[e.jsx("span",{children:"Menu name"}),e.jsx("input",{className:"writer-menus-control",name:"name",placeholder:"Menu name",value:u.name,onChange:P})]}),e.jsxs("label",{className:"writer-menus-field",children:[e.jsx("span",{children:"Location"}),e.jsxs("select",{className:"writer-menus-control",name:"location",value:u.location,onChange:P,children:[e.jsx("option",{value:"header",children:"Header"}),e.jsx("option",{value:"footer",children:"Footer"}),e.jsx("option",{value:"sidebar",children:"Sidebar"}),e.jsx("option",{value:"mobile",children:"Mobile"})]})]})]}),e.jsx("div",{className:"writer-menus-form-actions",children:e.jsxs("button",{className:"writer-menus-btn primary",type:"submit",disabled:C,children:[e.jsx(D,{size:15}),C?"Saving...":c?"Update Menu":"Create Menu"]})})]})]}),e.jsxs("section",{className:"writer-menus-panel writer-menus-items-panel",children:[e.jsxs("div",{className:"writer-menus-panel-head",children:[e.jsx("strong",{children:"Build items"}),e.jsxs("span",{children:[x.length," items"]})]}),e.jsx("div",{className:"writer-menus-items-list",children:x.map((t,s)=>{const r=fe(t.type);return e.jsxs("div",{className:"writer-menus-item-card",children:[e.jsxs("div",{className:"writer-menus-item-head",children:[e.jsxs("span",{className:"writer-menus-item-badge",children:[e.jsx(r,{size:13}),"Item ",s+1]}),e.jsxs("button",{className:"writer-menus-btn secondary compact",type:"button",onClick:()=>V(s),children:[e.jsx(le,{size:14}),"Remove"]})]}),e.jsxs("div",{className:"writer-menus-form-grid item-grid",children:[e.jsxs("label",{className:"writer-menus-field",children:[e.jsx("span",{children:"Label"}),e.jsx("input",{className:"writer-menus-control",placeholder:"Label",value:t.label,onChange:n=>N(s,"label",n.target.value)})]}),e.jsxs("label",{className:"writer-menus-field",children:[e.jsx("span",{children:"Type"}),e.jsxs("select",{className:"writer-menus-control",value:t.type,onChange:n=>N(s,"type",n.target.value),children:[e.jsx("option",{value:"custom",children:"Custom Link"}),e.jsx("option",{value:"category",children:"Category"}),e.jsx("option",{value:"home",children:"Home"}),e.jsx("option",{value:"page",children:"Page"})]})]}),t.type==="category"?e.jsxs("label",{className:"writer-menus-field full",children:[e.jsx("span",{children:"Category"}),e.jsxs("select",{className:"writer-menus-control",value:t.linked_category_id,onChange:n=>N(s,"linked_category_id",n.target.value),children:[e.jsx("option",{value:"",children:"Select category"}),O.map(n=>e.jsx("option",{value:n.id,children:n.name},n.id))]})]}):null,t.type==="custom"?e.jsxs("label",{className:"writer-menus-field full",children:[e.jsx("span",{children:"Custom URL"}),e.jsx("input",{className:"writer-menus-control",placeholder:"https://example.com/page",value:t.custom_url,onChange:n=>N(s,"custom_url",n.target.value)}),e.jsx("small",{children:"External links are allowed and checked by Bloggad on save."})]}):null,t.type==="home"||t.type==="page"?e.jsxs("div",{className:"writer-menus-type-note full",children:[e.jsx("span",{children:ge(t.type)}),e.jsx("small",{children:"No additional destination field is required for this item type."})]}):null]})]},s)})}),e.jsxs("div",{className:"writer-menus-item-actions",children:[e.jsxs("button",{className:"writer-menus-btn secondary",type:"button",onClick:Q,children:[e.jsx(B,{size:15}),"Add Item"]}),e.jsxs("button",{className:"writer-menus-btn primary save-items",type:"button",onClick:Z,disabled:L,children:[e.jsx(D,{size:15}),L?"Saving...":"Save Menu Items"]})]})]})]})]})]})}const W=`
  * {
    box-sizing: border-box;
  }

  .writer-menus-page {
    width: 100%;
    color: #111827;
    font-family: inherit;
    padding: 18px 30px 34px;
  }

  .writer-menus-mobile-title {
    display: none;
  }

  .writer-menus-command,
  .writer-menus-stat,
  .writer-menus-list-panel,
  .writer-menus-panel,
  .writer-menus-alert {
    background: #ffffff;
    border: 1px solid #dde3ea;
  }

  .writer-menus-command {
    min-height: 58px;
    border-radius: 14px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .writer-menus-command-copy {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .writer-menus-command-copy strong {
    font-size: 13px;
    line-height: 1.3;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .writer-menus-command-copy span,
  .writer-menus-panel-head span,
  .writer-menus-selected,
  .writer-menus-item-badge {
    min-height: 24px;
    border: 1px solid #e2e7ec;
    background: #f7f8fa;
    border-radius: 999px;
    padding: 0 9px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #667085;
    font-size: 10px;
    line-height: 1;
    font-weight: 600;
    text-transform: capitalize;
    flex-shrink: 0;
  }

  .writer-menus-command-actions,
  .writer-menus-form-actions,
  .writer-menus-item-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .writer-menus-btn {
    min-height: 38px;
    border-radius: 9px;
    padding: 0 14px;
    border: 1px solid #d5dce4;
    background: #ffffff;
    color: #161b22;
    font: inherit;
    font-size: 12px;
    font-weight: 650;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    cursor: pointer;
    white-space: nowrap;
  }

  .writer-menus-btn.primary {
    background: #1f2328;
    border-color: #1f2328;
    color: #ffffff;
  }

  .writer-menus-btn.compact {
    min-height: 34px;
    padding: 0 12px;
    font-size: 11px;
  }

  .writer-menus-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .writer-menus-alert {
    margin-top: 10px;
    min-height: 44px;
    border-radius: 11px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 12px;
    font-weight: 600;
  }

  .writer-menus-alert.error {
    border-color: #f2c5b7;
    background: #fff8f5;
    color: #8f2d18;
  }

  .writer-menus-alert.success {
    border-color: #b8e3c8;
    background: #f5fbf7;
    color: #17663a;
  }

  .writer-menus-stats {
    margin-top: 12px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .writer-menus-stat {
    min-height: 82px;
    border-radius: 14px;
    padding: 15px 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
  }

  .writer-menus-stat span {
    color: #667085;
    font-size: 11px;
    font-weight: 500;
  }

  .writer-menus-stat strong {
    font-size: 23px;
    line-height: 1.1;
    font-weight: 750;
  }

  .writer-menus-stat strong.location {
    font-size: 18px;
    text-transform: capitalize;
  }

  .writer-menus-workspace {
    margin-top: 12px;
    display: grid;
    grid-template-columns: 330px minmax(0, 1fr);
    gap: 12px;
    align-items: start;
  }

  .writer-menus-list-panel,
  .writer-menus-panel {
    border-radius: 14px;
    padding: 14px;
    min-width: 0;
  }

  .writer-menus-editor {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .writer-menus-panel-head {
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 12px;
  }

  .writer-menus-panel-head strong {
    font-size: 13px;
    font-weight: 700;
  }

  .writer-menus-menu-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .writer-menus-menu-card {
    width: 100%;
    min-height: 62px;
    padding: 9px 10px;
    border-radius: 11px;
    border: 1px solid #e1e6ec;
    background: #f7f8fa;
    color: #111827;
    font: inherit;
    cursor: pointer;
    text-align: left;
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr) auto;
    gap: 9px;
    align-items: center;
  }

  .writer-menus-menu-card.active {
    border-color: #1f2328;
    background: #ffffff;
    box-shadow: inset 0 0 0 1px #1f2328;
  }

  .writer-menus-menu-icon {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    border: 1px solid #e2e7ec;
    background: #ffffff;
    display: grid;
    place-items: center;
  }

  .writer-menus-menu-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .writer-menus-menu-copy strong {
    font-size: 12px;
    font-weight: 700;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .writer-menus-menu-copy span,
  .writer-menus-list-note,
  .writer-menus-field small,
  .writer-menus-type-note small {
    color: #7b8491;
    font-size: 10px;
    line-height: 1.45;
  }

  .writer-menus-list-note {
    margin: 12px 0 0;
  }

  .writer-menus-empty {
    min-height: 150px;
    border: 1px dashed #d5dce4;
    background: #f8f9fb;
    border-radius: 11px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    text-align: center;
    padding: 18px;
  }

  .writer-menus-empty strong {
    font-size: 12px;
  }

  .writer-menus-empty span {
    color: #7b8491;
    font-size: 10px;
  }

  .writer-menus-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .writer-menus-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .writer-menus-field {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .writer-menus-field.full,
  .writer-menus-type-note.full {
    grid-column: 1 / -1;
  }

  .writer-menus-field > span,
  .writer-menus-type-note > span {
    color: #667085;
    font-size: 9px;
    line-height: 1.2;
    font-weight: 700;
    text-transform: uppercase;
  }

  .writer-menus-control {
    width: 100%;
    min-width: 0;
    height: 42px;
    border-radius: 9px;
    border: 1px solid #ccd5df;
    background: #ffffff;
    color: #111827;
    padding: 0 11px;
    outline: none;
    font: inherit;
    font-size: 12px;
  }

  .writer-menus-control:focus {
    border-color: #667085;
    box-shadow: 0 0 0 2px rgba(31, 35, 40, 0.08);
  }

  .writer-menus-items-panel {
    padding-bottom: 16px;
  }

  .writer-menus-items-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .writer-menus-item-card {
    border: 1px solid #e1e6ec;
    background: #f7f8fa;
    border-radius: 11px;
    padding: 10px;
  }

  .writer-menus-item-head {
    min-height: 34px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 8px;
  }

  .writer-menus-item-badge {
    gap: 5px;
  }

  .writer-menus-type-note {
    min-height: 42px;
    border: 1px dashed #d7dee6;
    border-radius: 9px;
    background: #ffffff;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 3px;
  }

  .writer-menus-item-actions {
    margin-top: 10px;
    justify-content: space-between;
  }

  .writer-menus-btn.save-items {
    min-width: 160px;
  }

  .writer-menus-loading {
    min-height: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #667085;
    font-size: 12px;
  }

  .writer-menus-spinner {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid #dde3ea;
    border-top-color: #1f2328;
    animation: writerMenusSpin 0.8s linear infinite;
  }

  .writer-menus-spin {
    animation: writerMenusSpin 0.8s linear infinite;
  }

  @keyframes writerMenusSpin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 1100px) {
    .writer-menus-page {
      padding-left: 18px;
      padding-right: 18px;
    }

    .writer-menus-workspace {
      grid-template-columns: 280px minmax(0, 1fr);
    }
  }

  @media (max-width: 900px) {
    .writer-menus-workspace {
      grid-template-columns: 1fr;
    }

    .writer-menus-menu-list {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 767px) {
    .writer-menus-page {
      width: 100%;
      max-width: none;
      min-width: 0;
      padding: 0 0 24px;
      margin: 0;
    }

    .writer-menus-command,
    .writer-menus-stats,
    .writer-menus-workspace,
    .writer-menus-list-panel,
    .writer-menus-editor,
    .writer-menus-panel,
    .writer-menus-items-panel,
    .writer-menus-items-list,
    .writer-menus-item-card {
      width: 100%;
      max-width: none;
      min-width: 0;
    }

    .writer-menus-mobile-title {
      min-height: 50px;
      margin-bottom: 10px;
      border: 1px solid #dde3ea;
      border-radius: 10px;
      background: #ffffff;
      padding: 0 12px;
      display: flex;
      align-items: center;
      font-size: 15px;
      font-weight: 700;
    }

    .writer-menus-command {
      min-height: auto;
      padding: 8px;
      align-items: stretch;
      flex-direction: column;
      gap: 8px;
    }

    .writer-menus-command-copy {
      min-height: 30px;
      justify-content: space-between;
    }

    .writer-menus-command-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .writer-menus-btn {
      min-height: 38px;
      padding: 0 10px;
      font-size: 11px;
    }

    .writer-menus-stats {
      gap: 7px;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .writer-menus-stat {
      min-height: 72px;
      padding: 10px;
    }

    .writer-menus-stat span {
      font-size: 9px;
    }

    .writer-menus-stat strong {
      font-size: 20px;
    }

    .writer-menus-stat strong.location {
      font-size: 16px;
    }

    .writer-menus-workspace {
      gap: 10px;
    }

    .writer-menus-list-panel,
    .writer-menus-panel {
      padding: 10px;
      border-radius: 11px;
    }

    .writer-menus-menu-list {
      display: flex;
    }

    .writer-menus-menu-card {
      min-height: 56px;
      grid-template-columns: minmax(0, 1fr) auto;
      padding: 8px;
    }

    .writer-menus-menu-icon {
      display: none;
    }

    .writer-menus-menu-copy strong {
      font-size: 11px;
    }

    .writer-menus-menu-copy span {
      font-size: 9px;
    }

    .writer-menus-list-note {
      display: none;
    }

    .writer-menus-form-grid,
    .writer-menus-form-grid.item-grid {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .writer-menus-field.full,
    .writer-menus-type-note.full {
      grid-column: auto;
    }

    .writer-menus-control {
      height: 40px;
      font-size: 11px;
    }

    .writer-menus-form-actions .writer-menus-btn {
      width: 100%;
    }

    .writer-menus-item-card {
      padding: 8px;
    }

    .writer-menus-item-head {
      margin-bottom: 6px;
    }

    .writer-menus-item-actions {
      display: grid;
      grid-template-columns: 1fr;
      gap: 7px;
    }

    .writer-menus-btn.save-items {
      width: 100%;
      min-width: 0;
    }
  }

  @media (max-width: 390px) {
    .writer-menus-command-copy strong {
      max-width: 210px;
    }

    .writer-menus-stat {
      padding: 9px 8px;
    }

    .writer-menus-stat strong.location {
      font-size: 15px;
    }
  }
`;export{Me as default};
