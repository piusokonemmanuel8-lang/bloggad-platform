import{r as d,j as e,a as k}from"./index-D7wY-Nn2.js";const S={name:"",slug:"",logo_url:"",banner_url:"",bio:"",about_text:"",status:"active",is_primary:!1};function se(o){if(!o)return"Updated recently";const c=new Date(o);if(Number.isNaN(c.getTime()))return"Updated recently";const l=new Date,A=Math.max(0,l.getTime()-c.getTime()),m=Math.floor(A/864e5);return m===0?"Updated today":m===1?"Updated yesterday":m<7?`Updated ${m} days ago`:m<14?"Updated 1 week ago":`Updated ${c.toLocaleDateString(void 0,{month:"short",day:"numeric",year:c.getFullYear()!==l.getFullYear()?"numeric":void 0})}`}function ne(o){const c=String(o||"").trim();return c?c.charAt(0).toUpperCase():"P"}function oe(){const[o,c]=d.useState([]),[l,A]=d.useState(null),[m,Q]=d.useState(null),[U,V]=d.useState(""),[N,Z]=d.useState("all"),[P,_]=d.useState(null),[ee,z]=d.useState(!1),[M,f]=d.useState(null),[n,b]=d.useState(S),[x,y]=d.useState(""),[j,E]=d.useState(""),[I,h]=d.useState(""),[R,C]=d.useState(""),[re,T]=d.useState(!0);async function $(){const{data:r}=await k.get("/api/writer/pages");c(Array.isArray(r==null?void 0:r.pages)?r.pages:[]),A((r==null?void 0:r.entitlement)||null),Q((r==null?void 0:r.storefront)||null)}d.useEffect(()=>{let r=!0;return T(!0),$().catch(t=>{var a,i;r&&h(((i=(a=t==null?void 0:t.response)==null?void 0:a.data)==null?void 0:i.message)||t.message||"Failed to load Writer Pages.")}).finally(()=>{r&&T(!1)}),()=>{r=!1}},[]);const p=d.useMemo(()=>o.find(r=>Number(r.id)===Number(P))||null,[o,P]),L=d.useMemo(()=>{const r=U.trim().toLowerCase();return o.filter(t=>{const a=!r||`${t.name||""} ${t.slug||""}`.toLowerCase().includes(r),i=N==="all"||String(t.status||"active")===N;return a&&i})},[o,U,N]),B=d.useMemo(()=>o.filter(r=>String(r.status||"active")==="active").length,[o]),O=o.length-B,D=(l==null?void 0:l.page_limit)===null||o.length<Number((l==null?void 0:l.page_limit)||0),Y=!!(l!=null&&l.paid_writer);function v(){h(""),C("")}function ie(){D&&(v(),_(null),f(null),b({...S,is_primary:o.length===0}),z(!0))}function ae(r){v(),_(r.id),f(null),b({name:r.name||"",slug:r.slug||"",logo_url:r.logo_url||"",banner_url:r.banner_url||"",bio:r.bio||"",about_text:r.about_text||"",status:r.status||"active",is_primary:!!r.is_primary}),z(!0)}function F(){x||(z(!1),_(null),b(S))}function u(r,t){b(a=>({...a,[r]:t}))}async function q(r,t){var a,i,s,H;if(t){if(!String(t.type||"").toLowerCase().startsWith("image/")){h("Choose an image file.");return}try{E(r),v();const w=new FormData;w.append("image",t);const{data:g}=await k.post("/api/uploads/template-image",w,{headers:{"Content-Type":"multipart/form-data"}}),J=(g==null?void 0:g.url)||(g==null?void 0:g.file_url)||(g==null?void 0:g.path)||((a=g==null?void 0:g.file)==null?void 0:a.url)||((i=g==null?void 0:g.file)==null?void 0:i.file_url)||"";if(!J)throw new Error("Upload completed but no image URL was returned.");u(r,J),C(r==="logo_url"?"Logo image uploaded.":"Banner image uploaded.")}catch(w){h(((H=(s=w==null?void 0:w.response)==null?void 0:s.data)==null?void 0:H.message)||w.message||"Unable to upload this image.")}finally{E("")}}}function X(r){r!=null&&r.slug&&window.open(`/page/${encodeURIComponent(r.slug)}`,"_blank","noopener,noreferrer")}async function te(r){var t,a;r.preventDefault();try{y("save"),v();const i={...n,name:n.name.trim(),slug:n.slug.trim(),logo_url:n.logo_url.trim(),banner_url:n.banner_url.trim(),bio:n.bio.trim(),about_text:n.about_text.trim()},{data:s}=P?await k.put(`/api/writer/pages/${P}`,i):await k.post("/api/writer/pages",i);C((s==null?void 0:s.message)||"Writer Page saved."),await $(),z(!1),_(null),b(S)}catch(i){h(((a=(t=i==null?void 0:i.response)==null?void 0:t.data)==null?void 0:a.message)||i.message||"Unable to save this Page.")}finally{y("")}}async function G(r){var t,a;if(!(!r||r.is_primary||r.status!=="active"))try{y(`primary-${r.id}`),v(),f(null);const{data:i}=await k.put(`/api/writer/pages/${r.id}/primary`);C((i==null?void 0:i.message)||"Primary Writer Page updated."),await $()}catch(i){h(((a=(t=i==null?void 0:i.response)==null?void 0:t.data)==null?void 0:a.message)||i.message||"Unable to make this Page primary.")}finally{y("")}}async function W(r){var a,i;if(!(!r||!window.confirm("Delete this Writer Page? Posts must be moved off it first.")))try{y(`delete-${r.id}`),v(),f(null);const{data:s}=await k.delete(`/api/writer/pages/${r.id}`);C((s==null?void 0:s.message)||"Writer Page deleted."),await $(),Number(P)===Number(r.id)&&(_(null),z(!1),b(S))}catch(s){h(((i=(a=s==null?void 0:s.response)==null?void 0:a.data)==null?void 0:i.message)||s.message||"Unable to delete this Page.")}finally{y("")}}return re?e.jsxs("div",{className:"writer-pages-screen writer-pages-loading",children:[e.jsx("style",{children:K}),e.jsxs("div",{className:"writer-pages-loading-card",children:[e.jsx("span",{className:"writer-pages-spinner"}),e.jsx("strong",{children:"Loading Pages..."})]})]}):e.jsxs("div",{className:"writer-pages-screen",onClick:()=>{M&&f(null)},children:[e.jsx("style",{children:K}),e.jsxs("main",{className:"writer-pages-main",children:[e.jsxs("section",{className:"writer-pages-heading",children:[e.jsxs("div",{children:[e.jsx("h2",{children:"Manage your pages"}),e.jsx("p",{children:"Create and manage the public pages where your writing is published."})]}),e.jsx("button",{type:"button",className:"writer-pages-primary-button",onClick:ie,disabled:!D,title:D?"Create a new Page":"Your current Writer plan has reached its Page limit.",children:"Create page"})]}),e.jsxs("section",{className:"writer-pages-plan-card","aria-label":"Writer Page plan",children:[e.jsxs("div",{children:[e.jsxs("strong",{children:[o.length," ",o.length===1?"page":"pages"]}),e.jsxs("span",{children:[B," active",O>0?`, ${O} inactive`:""]})]}),e.jsxs("div",{className:"writer-pages-plan-copy",children:[e.jsx("span",{className:`writer-pages-plan-badge ${Y?"paid":"free"}`,children:Y?"Pro plan":"Free plan"}),e.jsx("span",{children:(l==null?void 0:l.page_limit)===null?"Unlimited pages":`${o.length} of ${Number((l==null?void 0:l.page_limit)||1)} page used`})]})]}),m?e.jsxs("div",{className:"writer-pages-storefront-note",children:["Storefront: ",e.jsx("strong",{children:m.website_name})]}):null,I?e.jsx("div",{className:"writer-pages-alert error",role:"alert",children:I}):null,R?e.jsx("div",{className:"writer-pages-alert success",role:"status",children:R}):null,e.jsxs("section",{className:"writer-pages-tools",children:[e.jsxs("label",{className:"writer-pages-search",children:[e.jsx("span",{className:"writer-pages-search-dot","aria-hidden":"true"}),e.jsx("input",{type:"search",value:U,onChange:r=>V(r.target.value),placeholder:"Search pages","aria-label":"Search Pages"})]}),e.jsxs("select",{className:"writer-pages-status-filter",value:N,onChange:r=>Z(r.target.value),"aria-label":"Filter Pages by status",children:[e.jsx("option",{value:"all",children:"All statuses"}),e.jsx("option",{value:"active",children:"Active"}),e.jsx("option",{value:"inactive",children:"Inactive"})]}),e.jsxs("span",{className:"writer-pages-result-count",children:[L.length," ",L.length===1?"page":"pages"]})]}),e.jsxs("section",{className:"writer-pages-table-card",children:[e.jsxs("div",{className:"writer-pages-table-head","aria-hidden":"true",children:[e.jsx("span",{children:"Page"}),e.jsx("span",{children:"Status"}),e.jsx("span",{children:"Updated"}),e.jsx("span",{children:"Actions"})]}),L.length?e.jsx("div",{className:"writer-pages-list",children:L.map(r=>{const t=!!r.is_primary,a=String(r.status||"active")==="active",i=x===`primary-${r.id}`||x===`delete-${r.id}`;return e.jsxs("article",{className:"writer-pages-row",children:[e.jsxs("div",{className:"writer-pages-identity",children:[e.jsxs("div",{className:"writer-pages-avatar","aria-hidden":"true",children:[e.jsx("span",{children:ne(r.name)}),r.logo_url?e.jsx("img",{src:r.logo_url,alt:"",onError:s=>{s.currentTarget.style.display="none"}}):null]}),e.jsxs("div",{className:"writer-pages-identity-copy",children:[e.jsx("strong",{children:r.name}),e.jsxs("span",{children:["/page/",r.slug]}),e.jsx("div",{className:"writer-pages-identity-actions",children:t?e.jsx("span",{className:"writer-pages-primary-chip",children:"Primary"}):a?e.jsx("button",{type:"button",className:"writer-pages-inline-action",disabled:i,onClick:s=>{s.stopPropagation(),G(r)},children:"Make primary"}):e.jsx("span",{className:"writer-pages-inline-muted",children:"Activate to make primary"})})]})]}),e.jsx("div",{className:"writer-pages-status-cell",children:e.jsx("span",{className:`writer-pages-status ${a?"active":"inactive"}`,children:a?"Active":"Inactive"})}),e.jsx("div",{className:"writer-pages-updated",children:se(r.updated_at||r.created_at)}),e.jsxs("div",{className:"writer-pages-actions",children:[e.jsx("button",{type:"button",className:"writer-pages-action secondary",onClick:()=>X(r),children:"Preview"}),e.jsx("button",{type:"button",className:"writer-pages-action primary",onClick:()=>ae(r),children:"Edit"}),e.jsxs("div",{className:"writer-pages-more-wrap",onClick:s=>s.stopPropagation(),children:[e.jsx("button",{type:"button",className:"writer-pages-action icon","aria-label":`More actions for ${r.name}`,"aria-expanded":Number(M)===Number(r.id),onClick:()=>f(s=>Number(s)===Number(r.id)?null:r.id),children:"..."}),Number(M)===Number(r.id)?e.jsxs("div",{className:"writer-pages-menu",children:[t?null:e.jsx("button",{type:"button",disabled:!a||i,onClick:()=>G(r),children:"Make primary"}),e.jsx("button",{type:"button",disabled:o.length<=1||i,className:"danger",onClick:()=>W(r),children:"Delete page"})]}):null]})]})]},r.id)})}):e.jsxs("div",{className:"writer-pages-empty",children:[e.jsx("strong",{children:"No Pages found"}),e.jsx("p",{children:U||N!=="all"?"Try changing your search or status filter.":"Create your first Writer Page to begin publishing."})]})]}),e.jsxs("section",{className:"writer-pages-policy",children:[e.jsxs("div",{children:[e.jsx("strong",{children:"Primary page"}),e.jsx("span",{children:"One Page must always remain primary. Only active Pages can be made primary."})]}),e.jsx("p",{children:"Deletion is blocked until posts assigned to that Page are moved elsewhere."})]})]}),ee?e.jsx("div",{className:"writer-pages-drawer-layer",role:"presentation",onMouseDown:r=>{r.target===r.currentTarget&&F()},children:e.jsxs("form",{className:"writer-pages-drawer",onSubmit:te,children:[e.jsxs("header",{className:"writer-pages-drawer-head",children:[e.jsxs("div",{children:[e.jsx("span",{className:"writer-pages-mobile-back",children:"Page settings"}),e.jsx("h2",{children:p?"Edit page":"Create page"}),e.jsx("p",{children:p?p.name:"New Writer Page"})]}),e.jsxs("div",{className:"writer-pages-drawer-head-actions",children:[p?e.jsx("button",{type:"button",className:"writer-pages-action secondary",onClick:()=>X(p),children:"Preview"}):null,e.jsx("button",{type:"button",className:"writer-pages-action icon close","aria-label":"Close Page editor",onClick:F,disabled:!!x,children:"X"})]})]}),e.jsxs("div",{className:"writer-pages-drawer-scroll",children:[e.jsxs("section",{className:"writer-pages-form-intro",children:[e.jsx("h3",{children:"Page details"}),e.jsx("p",{children:p?"Update the page identity, public URL, appearance, and publishing status.":"Set up the identity and public URL for this Page."})]}),e.jsxs("label",{className:"writer-pages-field",children:[e.jsx("span",{children:"Page name"}),e.jsx("input",{value:n.name,onChange:r=>u("name",r.target.value),placeholder:"Page name",required:!0,maxLength:180,autoFocus:!0})]}),e.jsxs("label",{className:"writer-pages-field",children:[e.jsx("span",{children:"Page URL"}),e.jsx("input",{value:n.slug,onChange:r=>u("slug",r.target.value),placeholder:"page-url",maxLength:180}),e.jsxs("small",{children:["Public path: /page/",n.slug.trim()||"your-page-url"]})]}),e.jsxs("div",{className:"writer-pages-field",children:[e.jsx("span",{children:"Logo image"}),e.jsxs("div",{className:"writer-pages-image-control",children:[e.jsx("input",{type:"text",inputMode:"url",value:n.logo_url,onChange:r=>u("logo_url",r.target.value),placeholder:"Paste image URL or upload from device"}),e.jsxs("label",{className:`writer-pages-upload-button${j==="logo_url"?" busy":""}`,children:[e.jsx("input",{type:"file",accept:"image/*",disabled:!!j,onChange:r=>{var a;const t=((a=r.target.files)==null?void 0:a[0])||null;q("logo_url",t),r.target.value=""}}),j==="logo_url"?"Uploading...":"Upload"]})]}),n.logo_url?e.jsxs("div",{className:"writer-pages-image-preview logo",children:[e.jsx("img",{src:n.logo_url,alt:"Page logo preview"}),e.jsx("span",{children:"Logo preview"})]}):null]}),e.jsxs("div",{className:"writer-pages-field",children:[e.jsx("span",{children:"Banner image"}),e.jsxs("div",{className:"writer-pages-image-control",children:[e.jsx("input",{type:"text",inputMode:"url",value:n.banner_url,onChange:r=>u("banner_url",r.target.value),placeholder:"Paste image URL or upload from device"}),e.jsxs("label",{className:`writer-pages-upload-button${j==="banner_url"?" busy":""}`,children:[e.jsx("input",{type:"file",accept:"image/*",disabled:!!j,onChange:r=>{var a;const t=((a=r.target.files)==null?void 0:a[0])||null;q("banner_url",t),r.target.value=""}}),j==="banner_url"?"Uploading...":"Upload"]})]}),n.banner_url?e.jsxs("div",{className:"writer-pages-image-preview banner",children:[e.jsx("img",{src:n.banner_url,alt:"Page banner preview"}),e.jsx("span",{children:"Banner preview"})]}):null]}),e.jsxs("label",{className:"writer-pages-field",children:[e.jsx("span",{children:"Short bio"}),e.jsx("textarea",{value:n.bio,onChange:r=>u("bio",r.target.value),placeholder:"A short description of this Page.",maxLength:500,rows:3})]}),e.jsxs("label",{className:"writer-pages-field",children:[e.jsx("span",{children:"About"}),e.jsx("textarea",{value:n.about_text,onChange:r=>u("about_text",r.target.value),placeholder:"A longer description shown on the public Page.",rows:4})]}),p?e.jsxs("label",{className:"writer-pages-toggle-card",children:[e.jsxs("div",{children:[e.jsx("strong",{children:"Active page"}),e.jsx("span",{children:"Active Pages can be viewed publicly."})]}),e.jsx("input",{type:"checkbox",checked:n.status==="active",disabled:!!p.is_primary,onChange:r=>u("status",r.target.checked?"active":"inactive")})]}):null,e.jsxs("label",{className:`writer-pages-toggle-card ${p!=null&&p.is_primary?"locked":""}`,children:[e.jsxs("div",{children:[e.jsx("strong",{children:"Primary page"}),e.jsx("span",{children:"This is the default publishing destination."})]}),p!=null&&p.is_primary?e.jsx("span",{className:"writer-pages-primary-chip",children:"Primary"}):e.jsx("input",{type:"checkbox",checked:!!n.is_primary,disabled:n.status!=="active",onChange:r=>u("is_primary",r.target.checked)})]}),e.jsx("div",{className:"writer-pages-form-rule",children:"A Writer must always keep one primary Page."}),p&&o.length>1?e.jsx("button",{type:"button",className:"writer-pages-delete-mobile",disabled:x===`delete-${p.id}`,onClick:()=>W(p),children:"Delete page"}):null]}),e.jsxs("footer",{className:"writer-pages-drawer-footer",children:[p&&o.length>1?e.jsx("button",{type:"button",className:"writer-pages-delete-desktop",disabled:x===`delete-${p.id}`,onClick:()=>W(p),children:"Delete page"}):e.jsx("span",{}),e.jsxs("div",{className:"writer-pages-footer-actions",children:[e.jsx("button",{type:"button",className:"writer-pages-action secondary",onClick:F,disabled:!!x,children:"Cancel"}),e.jsx("button",{type:"submit",className:"writer-pages-action primary save",disabled:!!x||!n.name.trim(),children:x==="save"?"Saving...":p?"Save changes":"Create page"})]})]})]})}):null]})}const K=`
  .writer-pages-screen {
    min-height: 100%;
    background: #f5f6f8;
    color: #1f2329;
    font-family: Inter, Arial, sans-serif;
  }

  .writer-pages-screen *,
  .writer-pages-screen *::before,
  .writer-pages-screen *::after {
    box-sizing: border-box;
  }

  .writer-pages-main {
    width: 100%;
    max-width: 1480px;
    margin: 0;
    padding: 30px 30px 64px;
  }

  .writer-pages-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 20px;
  }

  .writer-pages-heading h2 {
    margin: 0;
    font-size: 30px;
    line-height: 1.15;
    letter-spacing: -0.7px;
    font-weight: 750;
  }

  .writer-pages-heading p {
    margin: 7px 0 0;
    color: #6f7888;
    font-size: 14px;
    line-height: 1.45;
  }

  .writer-pages-primary-button,
  .writer-pages-action {
    appearance: none;
    border: 1px solid #d8dde5;
    border-radius: 9px;
    background: #fff;
    color: #20242a;
    min-height: 38px;
    padding: 0 17px;
    font: inherit;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background 120ms ease, border-color 120ms ease, opacity 120ms ease;
  }

  .writer-pages-primary-button,
  .writer-pages-action.primary {
    border-color: #1f2329;
    background: #1f2329;
    color: #fff;
  }

  .writer-pages-primary-button {
    min-width: 160px;
    min-height: 42px;
  }

  .writer-pages-primary-button:hover:not(:disabled),
  .writer-pages-action.primary:hover:not(:disabled) {
    background: #111419;
  }

  .writer-pages-action.secondary:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #c7ced8;
  }

  .writer-pages-primary-button:disabled,
  .writer-pages-action:disabled,
  .writer-pages-inline-action:disabled,
  .writer-pages-menu button:disabled,
  .writer-pages-delete-mobile:disabled,
  .writer-pages-delete-desktop:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }

  .writer-pages-plan-card {
    min-height: 66px;
    padding: 14px 17px;
    border: 1px solid #dce1e8;
    border-radius: 12px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 20px;
  }

  .writer-pages-plan-card > div:first-child {
    display: grid;
    gap: 4px;
  }

  .writer-pages-plan-card strong {
    font-size: 15px;
  }

  .writer-pages-plan-card span {
    color: #6f7888;
    font-size: 12px;
  }

  .writer-pages-plan-copy {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .writer-pages-plan-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 27px;
    padding: 0 15px;
    border-radius: 999px;
    font-weight: 700;
  }

  .writer-pages-plan-badge.paid {
    background: #e8f7ef;
    color: #19754d;
  }

  .writer-pages-plan-badge.free {
    background: #f2f4f7;
    color: #596273;
  }

  .writer-pages-storefront-note,
  .writer-pages-alert {
    border-radius: 10px;
    padding: 11px 13px;
    font-size: 13px;
    margin-bottom: 14px;
  }

  .writer-pages-storefront-note {
    border: 1px solid #dce1e8;
    background: #fff;
    color: #687181;
  }

  .writer-pages-alert.error {
    border: 1px solid #f0caca;
    background: #fff5f5;
    color: #a82121;
  }

  .writer-pages-alert.success {
    border: 1px solid #cbe8d8;
    background: #f2fbf6;
    color: #176b46;
  }

  .writer-pages-tools {
    display: grid;
    grid-template-columns: minmax(280px, 420px) 120px 1fr;
    gap: 18px;
    align-items: center;
    margin-bottom: 22px;
  }

  .writer-pages-search {
    height: 42px;
    border: 1px solid #d8dde5;
    border-radius: 9px;
    background: #fff;
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 0 13px;
  }

  .writer-pages-search-dot {
    width: 12px;
    height: 12px;
    border: 1.5px solid #6f7888;
    border-radius: 50%;
    flex: 0 0 12px;
  }

  .writer-pages-search input {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    font: inherit;
    font-size: 13px;
    color: #1f2329;
  }

  .writer-pages-search input::placeholder {
    color: #9aa4b5;
  }

  .writer-pages-status-filter {
    width: 120px;
    height: 42px;
    border: 1px solid #d8dde5;
    border-radius: 9px;
    background: #fff;
    padding: 0 12px;
    color: #252a31;
    font: inherit;
    font-size: 13px;
    font-weight: 650;
    outline: none;
  }

  .writer-pages-result-count {
    justify-self: end;
    color: #70798a;
    font-size: 12px;
  }

  .writer-pages-table-card {
    border: 1px solid #dce1e8;
    border-radius: 13px;
    background: #fff;
    overflow: visible;
  }

  .writer-pages-table-head {
    display: grid;
    grid-template-columns: minmax(330px, 1.5fr) 135px 140px 300px;
    align-items: center;
    min-height: 52px;
    padding: 0 15px;
    border-bottom: 1px solid #edf0f4;
    background: #fafbfc;
    border-radius: 13px 13px 0 0;
  }

  .writer-pages-table-head span {
    color: #929bad;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.7px;
    text-transform: uppercase;
  }

  .writer-pages-list {
    padding: 0 15px;
  }

  .writer-pages-row {
    display: grid;
    grid-template-columns: minmax(330px, 1.5fr) 135px 140px 300px;
    align-items: center;
    min-height: 92px;
    border-bottom: 1px solid #dde2e9;
  }

  .writer-pages-row:last-child {
    border-bottom: 0;
  }

  .writer-pages-identity {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
    padding: 12px 0;
  }

  .writer-pages-avatar {
    width: 46px;
    height: 46px;
    flex: 0 0 46px;
    border-radius: 50%;
    background: #1f2329;
    color: #fff;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 750;
    position: relative;
    overflow: hidden;
  }

  .writer-pages-avatar > span {
    grid-area: 1 / 1;
  }

  .writer-pages-avatar > img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    border-radius: inherit;
    background: #eef1f4;
  }

  .writer-pages-identity-copy {
    min-width: 0;
  }

  .writer-pages-identity-copy > strong {
    display: block;
    font-size: 14px;
    line-height: 1.35;
  }

  .writer-pages-identity-copy > span {
    display: block;
    margin-top: 3px;
    color: #70798a;
    font-size: 12px;
    overflow-wrap: anywhere;
  }

  .writer-pages-identity-actions {
    min-height: 23px;
    display: flex;
    align-items: center;
    margin-top: 5px;
  }

  .writer-pages-primary-chip {
    display: inline-flex;
    align-items: center;
    min-height: 25px;
    padding: 0 11px;
    border-radius: 999px;
    background: #eaf2ff;
    color: #1e62c6;
    font-size: 11px;
    font-weight: 750;
  }

  .writer-pages-inline-action {
    border: 0;
    padding: 0;
    background: transparent;
    color: #252a31;
    font: inherit;
    font-size: 12px;
    font-weight: 750;
    cursor: pointer;
    text-decoration: underline;
    text-decoration-color: #ccd2da;
    text-underline-offset: 3px;
  }

  .writer-pages-inline-muted {
    color: #99a3b3 !important;
    font-size: 11px !important;
  }

  .writer-pages-status {
    display: inline-flex;
    min-height: 26px;
    align-items: center;
    justify-content: center;
    padding: 0 13px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 750;
  }

  .writer-pages-status.active {
    background: #e8f7ef;
    color: #19754d;
  }

  .writer-pages-status.inactive {
    border: 1px solid #d8dde5;
    background: #fff;
    color: #6f7888;
  }

  .writer-pages-updated {
    color: #6f7888;
    font-size: 12px;
  }

  .writer-pages-actions {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
  }

  .writer-pages-action {
    min-width: 86px;
  }

  .writer-pages-action.icon {
    width: 44px;
    min-width: 44px;
    padding: 0;
    letter-spacing: 1px;
  }

  .writer-pages-more-wrap {
    position: relative;
  }

  .writer-pages-menu {
    position: absolute;
    z-index: 20;
    top: calc(100% + 7px);
    right: 0;
    width: 156px;
    padding: 6px;
    border: 1px solid #d8dde5;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 14px 35px rgba(15, 23, 42, 0.12);
  }

  .writer-pages-menu button {
    width: 100%;
    min-height: 36px;
    border: 0;
    border-radius: 7px;
    padding: 0 10px;
    background: transparent;
    color: #252a31;
    text-align: left;
    font: inherit;
    font-size: 12px;
    font-weight: 650;
    cursor: pointer;
  }

  .writer-pages-menu button:hover:not(:disabled) {
    background: #f4f6f8;
  }

  .writer-pages-menu button.danger {
    color: #bd1f1f;
  }

  .writer-pages-empty {
    min-height: 220px;
    padding: 54px 24px;
    display: grid;
    place-items: center;
    align-content: center;
    text-align: center;
  }

  .writer-pages-empty strong {
    font-size: 15px;
  }

  .writer-pages-empty p {
    margin: 7px 0 0;
    color: #70798a;
    font-size: 13px;
  }

  .writer-pages-policy {
    margin-top: 20px;
    min-height: 72px;
    border: 1px solid #dce1e8;
    border-radius: 12px;
    background: #fff;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 28px;
  }

  .writer-pages-policy > div {
    display: grid;
    gap: 5px;
  }

  .writer-pages-policy strong {
    font-size: 13px;
  }

  .writer-pages-policy span,
  .writer-pages-policy p {
    color: #6f7888;
    font-size: 12px;
    line-height: 1.45;
  }

  .writer-pages-policy p {
    margin: 0;
    max-width: 470px;
    text-align: right;
  }

  .writer-pages-drawer-layer {
    position: fixed;
    z-index: 1000;
    inset: 0;
    background: rgba(25, 30, 37, 0.2);
    display: flex;
    justify-content: flex-end;
  }

  .writer-pages-drawer {
    width: min(478px, 100%);
    height: 100%;
    background: #fff;
    border-left: 1px solid #dce1e8;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    box-shadow: -12px 0 40px rgba(15, 23, 42, 0.08);
  }

  .writer-pages-drawer-head {
    min-height: 82px;
    border-bottom: 1px solid #e2e6ec;
    padding: 15px 22px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .writer-pages-drawer-head h2 {
    margin: 0;
    font-size: 20px;
    line-height: 1.25;
  }

  .writer-pages-drawer-head p {
    margin: 3px 0 0;
    color: #70798a;
    font-size: 11px;
  }

  .writer-pages-mobile-back {
    display: none;
  }

  .writer-pages-drawer-head-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .writer-pages-drawer-head-actions .writer-pages-action {
    min-width: 88px;
  }

  .writer-pages-drawer-head-actions .writer-pages-action.close {
    min-width: 40px;
    width: 40px;
  }

  .writer-pages-drawer-scroll {
    min-height: 0;
    overflow-y: auto;
    padding: 22px;
  }

  .writer-pages-form-intro {
    margin-bottom: 24px;
  }

  .writer-pages-form-intro h3 {
    margin: 0;
    font-size: 15px;
  }

  .writer-pages-form-intro p {
    margin: 5px 0 0;
    color: #70798a;
    font-size: 11px;
    line-height: 1.45;
  }

  .writer-pages-field {
    display: grid;
    gap: 7px;
    margin-bottom: 13px;
  }

  .writer-pages-field > span {
    font-size: 12px;
    font-weight: 700;
  }

  .writer-pages-field input,
  .writer-pages-field textarea {
    width: 100%;
    border: 1px solid #d5dbe4;
    border-radius: 9px;
    background: #fff;
    color: #252a31;
    padding: 10px 11px;
    outline: none;
    font: inherit;
    font-size: 13px;
    line-height: 1.45;
    resize: vertical;
  }

  .writer-pages-field input {
    min-height: 42px;
  }

  .writer-pages-field input:focus,
  .writer-pages-field textarea:focus,
  .writer-pages-status-filter:focus,
  .writer-pages-search:focus-within {
    border-color: #9aa4b2;
    box-shadow: 0 0 0 3px rgba(31, 35, 41, 0.05);
  }

  .writer-pages-field small {
    color: #7c8595;
    font-size: 10px;
  }

  .writer-pages-image-control {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 92px;
    gap: 9px;
    align-items: stretch;
  }

  .writer-pages-image-control > input {
    min-width: 0;
  }

  .writer-pages-upload-button {
    min-height: 42px;
    border: 1px solid #1f2329;
    border-radius: 9px;
    background: #1f2329;
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
    font-size: 12px;
    font-weight: 750;
    cursor: pointer;
    user-select: none;
  }

  .writer-pages-upload-button:hover {
    background: #111419;
  }

  .writer-pages-upload-button.busy {
    opacity: 0.65;
    cursor: wait;
  }

  .writer-pages-upload-button input[type='file'] {
    display: none;
  }

  .writer-pages-image-preview {
    margin-top: 2px;
    min-height: 64px;
    border: 1px solid #dce1e8;
    border-radius: 9px;
    background: #fafbfc;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px;
  }

  .writer-pages-image-preview img {
    display: block;
    object-fit: cover;
    border-radius: 6px;
    background: #eef1f4;
  }

  .writer-pages-image-preview.logo img {
    width: 48px;
    height: 48px;
  }

  .writer-pages-image-preview.banner img {
    width: 112px;
    height: 52px;
  }

  .writer-pages-image-preview span {
    color: #70798a;
    font-size: 10px;
    font-weight: 650;
  }

  .writer-pages-toggle-card {
    min-height: 66px;
    padding: 12px;
    border: 1px solid #d8dde5;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 12px;
  }

  .writer-pages-toggle-card > div {
    display: grid;
    gap: 4px;
  }

  .writer-pages-toggle-card strong {
    font-size: 12px;
  }

  .writer-pages-toggle-card span {
    color: #70798a;
    font-size: 10px;
  }

  .writer-pages-toggle-card input[type='checkbox'] {
    appearance: none;
    width: 46px;
    height: 26px;
    flex: 0 0 46px;
    border-radius: 999px;
    background: #d7dce3;
    position: relative;
    cursor: pointer;
    transition: background 120ms ease;
  }

  .writer-pages-toggle-card input[type='checkbox']::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    top: 3px;
    left: 3px;
    background: #fff;
    transition: transform 120ms ease;
  }

  .writer-pages-toggle-card input[type='checkbox']:checked {
    background: #1f2329;
  }

  .writer-pages-toggle-card input[type='checkbox']:checked::after {
    transform: translateX(20px);
  }

  .writer-pages-toggle-card input[type='checkbox']:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .writer-pages-form-rule {
    margin-top: 16px;
    padding: 13px;
    border: 1px solid #dfe3e9;
    border-radius: 9px;
    background: #fafbfc;
    color: #687181;
    font-size: 11px;
  }

  .writer-pages-drawer-footer {
    min-height: 90px;
    padding: 14px 22px;
    border-top: 1px solid #dfe3e9;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    background: #fff;
  }

  .writer-pages-footer-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .writer-pages-action.save {
    min-width: 118px;
  }

  .writer-pages-delete-desktop,
  .writer-pages-delete-mobile {
    min-height: 40px;
    border: 1px solid #d8dde5;
    border-radius: 9px;
    background: #fff;
    color: #c41f1f;
    padding: 0 14px;
    font: inherit;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }

  .writer-pages-delete-mobile {
    display: none;
  }

  .writer-pages-loading {
    min-height: 440px;
    display: grid;
    place-items: center;
  }

  .writer-pages-loading-card {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #596273;
    font-size: 13px;
  }

  .writer-pages-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid #dce1e8;
    border-top-color: #1f2329;
    border-radius: 50%;
    animation: writer-pages-spin 0.8s linear infinite;
  }

  @keyframes writer-pages-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 1100px) {
    .writer-pages-main {
      width: 100%;
      padding-left: 22px;
      padding-right: 22px;
    }

    .writer-pages-table-head,
    .writer-pages-row {
      grid-template-columns: minmax(260px, 1.3fr) 110px 125px 270px;
    }
  }

  @media (max-width: 991px) {
    .writer-pages-screen {
      width: 100%;
      max-width: none;
      overflow-x: hidden;
    }

    .writer-pages-main {
      position: relative;
      left: 50%;
      width: 100vw;
      max-width: none;
      margin-left: -50vw;
      margin-right: -50vw;
      padding: 16px 8px 48px;
    }

    .writer-pages-heading,
    .writer-pages-plan-card,
    .writer-pages-storefront-note,
    .writer-pages-alert,
    .writer-pages-tools,
    .writer-pages-table-card,
    .writer-pages-list {
      width: 100%;
      max-width: none;
    }

    .writer-pages-heading {
      align-items: center;
      margin-bottom: 16px;
    }

    .writer-pages-heading > div {
      padding-left: 8px;
    }

    .writer-pages-heading h2 {
      font-size: 24px;
      letter-spacing: -0.4px;
    }

    .writer-pages-heading p {
      font-size: 13px;
      max-width: 235px;
    }

    .writer-pages-primary-button {
      min-width: 120px;
      min-height: 40px;
    }

    .writer-pages-plan-card {
      min-height: 56px;
      padding: 10px 13px;
      margin-bottom: 16px;
    }

    .writer-pages-plan-copy {
      align-items: flex-end;
      gap: 4px;
      flex-direction: column;
    }

    .writer-pages-tools {
      grid-template-columns: 1fr;
      gap: 10px;
      margin-bottom: 16px;
    }

    .writer-pages-status-filter,
    .writer-pages-result-count {
      display: none;
    }

    .writer-pages-table-card {
      border: 0;
      background: transparent;
    }

    .writer-pages-table-head {
      display: none;
    }

    .writer-pages-list {
      padding: 0;
      display: grid;
      gap: 12px;
    }

    .writer-pages-row {
      display: grid;
      grid-template-columns: 1fr;
      min-height: 0;
      padding: 15px 13px 12px;
      border: 1px solid #d8dde5;
      border-radius: 12px;
      background: #fff;
    }

    .writer-pages-identity {
      padding: 0;
      gap: 12px;
    }

    .writer-pages-avatar {
      width: 40px;
      height: 40px;
      flex-basis: 40px;
    }

    .writer-pages-identity-actions {
      margin-top: 6px;
    }

    .writer-pages-status-cell {
      margin: -27px 0 0 52px;
      min-height: 27px;
    }

    .writer-pages-identity-actions .writer-pages-primary-chip {
      margin-right: 8px;
    }

    .writer-pages-updated {
      margin-top: 11px;
      padding-bottom: 9px;
      border-bottom: 1px solid #dde2e9;
      color: #9aa4b5;
      font-size: 11px;
    }

    .writer-pages-actions {
      display: grid;
      grid-template-columns: 1fr 1fr 72px;
      gap: 8px;
      padding-top: 9px;
    }

    .writer-pages-action {
      min-width: 0;
      width: 100%;
      min-height: 34px;
    }

    .writer-pages-action.icon {
      width: 100%;
      min-width: 0;
    }

    .writer-pages-more-wrap {
      width: 100%;
    }

    .writer-pages-menu {
      right: 0;
      bottom: calc(100% + 6px);
      top: auto;
    }

    .writer-pages-policy {
      display: none;
    }

    .writer-pages-drawer-layer {
      background: #fff;
    }

    .writer-pages-drawer {
      width: 100%;
      border-left: 0;
      box-shadow: none;
    }

    .writer-pages-drawer-head {
      min-height: 64px;
      padding: 13px 17px;
      align-items: center;
    }

    .writer-pages-drawer-head h2 {
      font-size: 17px;
    }

    .writer-pages-drawer-head p {
      display: none;
    }

    .writer-pages-mobile-back {
      display: none;
    }

    .writer-pages-drawer-head-actions .writer-pages-action.secondary {
      min-width: 84px;
    }

    .writer-pages-drawer-scroll {
      padding: 18px 17px 120px;
      background: #f7f8fa;
    }

    .writer-pages-form-intro {
      margin-bottom: 20px;
    }

    .writer-pages-form-intro h3 {
      font-size: 22px;
    }

    .writer-pages-field input,
    .writer-pages-field textarea,
    .writer-pages-toggle-card,
    .writer-pages-form-rule {
      background: #fff;
    }

    .writer-pages-image-control {
      grid-template-columns: minmax(0, 1fr) 90px;
    }

    .writer-pages-image-preview.banner img {
      width: 96px;
      height: 48px;
    }

    .writer-pages-drawer-footer {
      min-height: 74px;
      position: fixed;
      z-index: 3;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 11px 17px 16px;
    }

    .writer-pages-delete-desktop {
      display: none;
    }

    .writer-pages-delete-mobile {
      display: block;
      width: 100%;
      margin-top: 14px;
    }

    .writer-pages-footer-actions {
      width: 100%;
      display: grid;
      grid-template-columns: 92px 1fr;
    }

    .writer-pages-action.save {
      min-width: 0;
    }
  }

  @media (max-width: 480px) {
    .writer-pages-heading h2 {
      font-size: 23px;
    }

    .writer-pages-heading p {
      max-width: 218px;
    }

    .writer-pages-primary-button {
      min-width: 118px;
      padding: 0 14px;
      font-size: 12px;
    }

    .writer-pages-plan-copy > span:last-child {
      font-size: 10px;
    }
  }
`;export{oe as default};
