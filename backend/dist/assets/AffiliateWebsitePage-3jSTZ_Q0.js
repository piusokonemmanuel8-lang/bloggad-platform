import{r as f,j as e,G as se,g as C,i as ie,F as J,a2 as te,M as K,a as k}from"./index-LXBBJt7I.js";import{E as le}from"./external-link-CIrc7yHB.js";import{P as ne}from"./pencil-line-CrhORjSV.js";import{L as re}from"./link-CCVOqyaN.js";import{T as L}from"./type-B_PWcmvg.js";import{C as Q}from"./circle-alert-DsZo9igC.js";import{C as T}from"./circle-check-ml_0upGj.js";import{S as q}from"./save-Co8lXD7U.js";import{C as oe}from"./clock-3-BV9St-rB.js";function fe(a){return a?`/${a}`:""}function R(a){return a?a.name||a.template_key||`Template #${a.id}`:"Select template"}function ge(){const[a,E]=f.useState({website_name:"",slug:"",custom_domain:"",meta_title:"",meta_description:"",homepage_template:"",header_style:"",footer_style:"",status:"draft"}),[s,P]=f.useState({enabled:!1,selected_template_id:"",show_mode:"popup",delay_seconds:8,show_once_per_session:!0,title:"",subtitle:"",placeholder_text:"Enter your email",button_text:"Subscribe",success_message:"Saved successfully"}),[W,X]=f.useState([]),[r,F]=f.useState(null),[Z,M]=f.useState(!0),[S,U]=f.useState(!1),[A,D]=f.useState(!1),[G,z]=f.useState(""),[H,$]=f.useState(""),[B,v]=f.useState(""),[O,Y]=f.useState("");f.useEffect(()=>{(async()=>{var m,b,o,c,t,y,N;try{M(!0),z(""),v("");const d=await k.get("/api/affiliate/website/me"),u=(d==null?void 0:d.data)||null;let n=null;u!=null&&u.ok&&(u!=null&&u.website)&&(n=u.website,F(n),E({website_name:n.website_name||"",slug:n.slug||"",custom_domain:n.custom_domain||"",meta_title:n.meta_title||"",meta_description:n.meta_description||"",homepage_template:n.homepage_template||"",header_style:n.header_style||"",footer_style:n.footer_style||"",status:n.status||"draft"}));const _=await k.get("/api/email-list/public/templates"),j=((m=_==null?void 0:_.data)==null?void 0:m.templates)||[];if(X(j),n!=null&&n.id)try{const i=await k.get(`/api/email-list/settings/${n.id}`),p=((b=i==null?void 0:i.data)==null?void 0:b.settings)||null;p&&P({enabled:!!p.enabled,selected_template_id:p.selected_template_id||"",show_mode:p.show_mode||p.display_mode||"popup",delay_seconds:p.delay_seconds??p.popup_delay_seconds??8,show_once_per_session:p.show_once_per_session!==!1,title:p.title||"",subtitle:p.subtitle||"",placeholder_text:p.placeholder_text||"Enter your email",button_text:p.button_text||"Subscribe",success_message:p.success_message||"Saved successfully"})}catch(i){v(((c=(o=i==null?void 0:i.response)==null?void 0:o.data)==null?void 0:c.message)||"Failed to load email capture settings")}}catch(d){((t=d==null?void 0:d.response)==null?void 0:t.status)!==404&&z(((N=(y=d==null?void 0:d.response)==null?void 0:y.data)==null?void 0:N.message)||"Failed to load website")}finally{M(!1)}})()},[]);const h=l=>{const{name:m,value:b}=l.target;E(o=>({...o,[m]:b}))},x=l=>{const{name:m,value:b,type:o,checked:c}=l.target;P(t=>({...t,[m]:o==="checkbox"?c:b}))},ee=async l=>{var m,b,o,c,t,y,N,d,u,n,_;l.preventDefault(),U(!0),z(""),$("");try{const j=r?"put":"post",{data:i}=await k[j]("/api/affiliate/website/me",a);i!=null&&i.ok&&(F(i.website),$(i.message||"Website saved successfully"),E({website_name:((m=i.website)==null?void 0:m.website_name)||"",slug:((b=i.website)==null?void 0:b.slug)||"",custom_domain:((o=i.website)==null?void 0:o.custom_domain)||"",meta_title:((c=i.website)==null?void 0:c.meta_title)||"",meta_description:((t=i.website)==null?void 0:t.meta_description)||"",homepage_template:((y=i.website)==null?void 0:y.homepage_template)||"",header_style:((N=i.website)==null?void 0:N.header_style)||"",footer_style:((d=i.website)==null?void 0:d.footer_style)||"",status:((u=i.website)==null?void 0:u.status)||"draft"}))}catch(j){z(((_=(n=j==null?void 0:j.response)==null?void 0:n.data)==null?void 0:_.message)||"Failed to save website")}finally{U(!1)}},ae=async l=>{var m,b;if(l.preventDefault(),!(r!=null&&r.id)){v("Create or save your website first before saving email capture settings");return}D(!0),v(""),Y("");try{const o={website_id:r.id,enabled:s.enabled,selected_template_id:s.selected_template_id||null,show_mode:s.show_mode,delay_seconds:Number(s.delay_seconds||0),show_once_per_session:s.show_once_per_session,title:s.title,subtitle:s.subtitle,placeholder_text:s.placeholder_text,button_text:s.button_text,success_message:s.success_message},{data:c}=await k.post(`/api/email-list/settings/${r.id}`,o),t=(c==null?void 0:c.settings)||null;t&&P({enabled:!!t.enabled,selected_template_id:t.selected_template_id||"",show_mode:t.show_mode||t.display_mode||"popup",delay_seconds:t.delay_seconds??t.popup_delay_seconds??8,show_once_per_session:t.show_once_per_session!==!1,title:t.title||"",subtitle:t.subtitle||"",placeholder_text:t.placeholder_text||"Enter your email",button_text:t.button_text||"Subscribe",success_message:t.success_message||"Saved successfully"}),Y((c==null?void 0:c.message)||"Email capture settings saved successfully")}catch(o){v(((b=(m=o==null?void 0:o.response)==null?void 0:m.data)==null?void 0:b.message)||"Failed to save email capture settings")}finally{D(!1)}},g=f.useMemo(()=>(r==null?void 0:r.public_url)||fe(a.slug),[r,a.slug]),I=f.useMemo(()=>{const l=(a.status||"").toLowerCase();return l==="active"?"affiliate-website-status active":l==="inactive"?"affiliate-website-status inactive":l==="suspended"?"affiliate-website-status suspended":"affiliate-website-status draft"},[a.status]),w=f.useMemo(()=>W.find(l=>String(l.id)===String(s.selected_template_id)),[W,s.selected_template_id]);return Z?e.jsxs("div",{className:"affiliate-website-page",children:[e.jsx("style",{children:V}),e.jsx("div",{className:"affiliate-website-loading-wrap",children:e.jsxs("div",{className:"affiliate-website-loading-card",children:[e.jsx("div",{className:"affiliate-website-spinner"}),e.jsx("p",{children:"Loading website..."})]})})]}):e.jsxs("div",{className:"affiliate-website-page",children:[e.jsx("style",{children:V}),e.jsxs("section",{className:"affiliate-website-hero",children:[e.jsxs("div",{className:"affiliate-website-hero-copy",children:[e.jsx("div",{className:"affiliate-website-badge",children:"Website manager"}),e.jsx("h1",{className:"affiliate-website-title",children:"My Website"}),e.jsx("p",{className:"affiliate-website-subtitle",children:"Create and manage your Bloggad storefront website with a clean admin-style setup that works well on desktop and mobile."})]}),e.jsxs("div",{className:"affiliate-website-hero-side",children:[e.jsx("div",{className:I,children:a.status||"draft"}),g?e.jsxs("a",{href:g,target:"_blank",rel:"noreferrer",className:"affiliate-website-preview-btn",children:[e.jsx(le,{size:16}),"Preview"]}):null]})]}),e.jsxs("section",{className:"writer-storefront-command","aria-label":"Storefront controls",children:[e.jsxs("div",{className:"writer-storefront-command-copy",children:[e.jsx("div",{className:"writer-storefront-command-status",children:e.jsx("span",{className:I,children:a.status||"draft"})}),e.jsxs("div",{className:"writer-storefront-command-text",children:[e.jsx("strong",{children:(r==null?void 0:r.website_name)||a.website_name||"Your Storefront"}),e.jsx("span",{children:g||"Choose a Storefront URL to create your public address."})]})]}),e.jsxs("div",{className:"writer-storefront-command-actions",children:[e.jsx("a",{className:"writer-storefront-command-button secondary",href:g||void 0,target:"_blank",rel:"noreferrer","aria-disabled":!g,onClick:l=>{g||l.preventDefault()},children:"Preview"}),e.jsx("button",{className:"writer-storefront-command-button primary",type:"submit",form:"writer-storefront-settings-form",disabled:S,children:S?"Saving...":r?"Save changes":"Create Storefront"})]})]}),e.jsx("div",{className:"writer-storefront-plan-note",children:"Storefront publishing is available with an active paid Writer plan."}),e.jsxs("section",{className:"affiliate-website-grid",children:[e.jsxs("div",{className:"affiliate-website-main-stack",children:[e.jsxs("div",{className:"affiliate-website-panel affiliate-website-panel-main",children:[e.jsx("div",{className:"affiliate-website-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-website-panel-kicker",children:"Storefront details"}),e.jsx("h2",{className:"affiliate-website-panel-title",children:r?"Update your website":"Create your website"})]})}),e.jsxs("form",{id:"writer-storefront-settings-form",className:"affiliate-website-form",onSubmit:ee,children:[e.jsxs("div",{className:"affiliate-website-form-grid",children:[e.jsxs("label",{className:"affiliate-website-field",children:[e.jsxs("span",{className:"affiliate-website-label",children:[e.jsx(se,{size:16}),"Website name"]}),e.jsx("input",{className:"affiliate-website-input",name:"website_name",placeholder:"Enter website name",value:a.website_name,onChange:h})]}),e.jsxs("label",{className:"affiliate-website-field",children:[e.jsxs("span",{className:"affiliate-website-label",children:[e.jsx(ne,{size:16}),"Website slug"]}),e.jsx("input",{className:"affiliate-website-input",name:"slug",placeholder:"your-store-slug",value:a.slug,onChange:h})]}),e.jsxs("label",{className:"affiliate-website-field affiliate-website-field-full",children:[e.jsxs("span",{className:"affiliate-website-label",children:[e.jsx(re,{size:16}),"Custom domain"]}),e.jsx("input",{className:"affiliate-website-input",name:"custom_domain",placeholder:"supgad.com/your-store",value:a.custom_domain,onChange:h}),e.jsx("small",{className:"affiliate-website-help",children:"Only approved platform domain format should be used."})]}),e.jsxs("label",{className:"affiliate-website-field",children:[e.jsxs("span",{className:"affiliate-website-label",children:[e.jsx(L,{size:16}),"Meta title"]}),e.jsx("input",{className:"affiliate-website-input",name:"meta_title",placeholder:"Meta title for SEO",value:a.meta_title,onChange:h})]}),e.jsxs("label",{className:"affiliate-website-field",children:[e.jsxs("span",{className:"affiliate-website-label",children:[e.jsx(C,{size:16}),"Homepage template"]}),e.jsx("input",{className:"affiliate-website-input",name:"homepage_template",placeholder:"Homepage template",value:a.homepage_template,onChange:h})]}),e.jsxs("label",{className:"affiliate-website-field",children:[e.jsxs("span",{className:"affiliate-website-label",children:[e.jsx(C,{size:16}),"Header style"]}),e.jsx("input",{className:"affiliate-website-input",name:"header_style",placeholder:"Header style",value:a.header_style,onChange:h})]}),e.jsxs("label",{className:"affiliate-website-field",children:[e.jsxs("span",{className:"affiliate-website-label",children:[e.jsx(C,{size:16}),"Footer style"]}),e.jsx("input",{className:"affiliate-website-input",name:"footer_style",placeholder:"Footer style",value:a.footer_style,onChange:h})]}),e.jsxs("label",{className:"affiliate-website-field",children:[e.jsxs("span",{className:"affiliate-website-label",children:[e.jsx(ie,{size:16}),"Status"]}),e.jsxs("select",{className:"affiliate-website-input",name:"status",value:a.status,onChange:h,children:[e.jsx("option",{value:"draft",children:"Draft"}),e.jsx("option",{value:"active",children:"Active"}),e.jsx("option",{value:"inactive",children:"Inactive"}),e.jsx("option",{value:"suspended",children:"Suspended"})]})]}),e.jsxs("label",{className:"affiliate-website-field affiliate-website-field-full",children:[e.jsxs("span",{className:"affiliate-website-label",children:[e.jsx(J,{size:16}),"Meta description"]}),e.jsx("textarea",{className:"affiliate-website-input affiliate-website-textarea",name:"meta_description",placeholder:"Short website description",rows:"5",value:a.meta_description,onChange:h})]})]}),G?e.jsxs("div",{className:"affiliate-website-alert error",children:[e.jsx(Q,{size:18}),e.jsx("span",{children:G})]}):null,H?e.jsxs("div",{className:"affiliate-website-alert success",children:[e.jsx(T,{size:18}),e.jsx("span",{children:H})]}):null,e.jsx("div",{className:"affiliate-website-actions",children:e.jsxs("button",{className:"affiliate-website-save-btn",type:"submit",disabled:S,children:[e.jsx(q,{size:16}),S?"Saving...":r?"Update Website":"Create Website"]})})]})]}),e.jsxs("div",{className:"affiliate-website-panel affiliate-email-panel",children:[e.jsx("div",{className:"affiliate-website-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-website-panel-kicker",children:"Email capture"}),e.jsx("h2",{className:"affiliate-website-panel-title",children:"Post page email template"}),e.jsx("p",{className:"affiliate-email-panel-subtext",children:"Choose whether email capture shows as popup, footer, or both on post pages only."})]})}),e.jsxs("form",{className:"affiliate-website-form",onSubmit:ae,children:[e.jsxs("div",{className:"affiliate-website-form-grid",children:[e.jsxs("label",{className:"affiliate-website-checkbox-row affiliate-website-field-full",children:[e.jsx("input",{type:"checkbox",name:"enabled",checked:s.enabled,onChange:x}),e.jsx("span",{children:"Enable email capture on post pages"})]}),e.jsxs("label",{className:"affiliate-website-field",children:[e.jsxs("span",{className:"affiliate-website-label",children:[e.jsx(C,{size:16}),"Email template"]}),e.jsxs("select",{className:"affiliate-website-input",name:"selected_template_id",value:s.selected_template_id,onChange:x,children:[e.jsx("option",{value:"",children:"Select template"}),W.map(l=>e.jsx("option",{value:l.id,children:R(l)},l.id))]})]}),e.jsxs("label",{className:"affiliate-website-field",children:[e.jsxs("span",{className:"affiliate-website-label",children:[e.jsx(te,{size:16}),"Display mode"]}),e.jsxs("select",{className:"affiliate-website-input",name:"show_mode",value:s.show_mode,onChange:x,children:[e.jsx("option",{value:"popup",children:"Popup only"}),e.jsx("option",{value:"footer",children:"Footer only"}),e.jsx("option",{value:"both",children:"Popup and footer"})]})]}),e.jsxs("label",{className:"affiliate-website-field",children:[e.jsxs("span",{className:"affiliate-website-label",children:[e.jsx(oe,{size:16}),"Popup delay seconds"]}),e.jsx("input",{className:"affiliate-website-input",type:"number",min:"0",name:"delay_seconds",value:s.delay_seconds,onChange:x})]}),e.jsxs("label",{className:"affiliate-website-field",children:[e.jsxs("span",{className:"affiliate-website-label",children:[e.jsx(K,{size:16}),"Cooldown"]}),e.jsx("input",{className:"affiliate-website-input",value:"10 minutes",readOnly:!0}),e.jsx("small",{className:"affiliate-website-help",children:"Popup should reappear after 5 to 10 minutes. Current frontend target uses 10 minutes."})]}),e.jsxs("label",{className:"affiliate-website-checkbox-row affiliate-website-field-full",children:[e.jsx("input",{type:"checkbox",name:"show_once_per_session",checked:s.show_once_per_session,onChange:x}),e.jsx("span",{children:"Show only once per session where possible"})]}),e.jsxs("label",{className:"affiliate-website-field",children:[e.jsxs("span",{className:"affiliate-website-label",children:[e.jsx(L,{size:16}),"Title"]}),e.jsx("input",{className:"affiliate-website-input",name:"title",placeholder:"Join our email list",value:s.title,onChange:x})]}),e.jsxs("label",{className:"affiliate-website-field",children:[e.jsxs("span",{className:"affiliate-website-label",children:[e.jsx(L,{size:16}),"Button text"]}),e.jsx("input",{className:"affiliate-website-input",name:"button_text",placeholder:"Subscribe",value:s.button_text,onChange:x})]}),e.jsxs("label",{className:"affiliate-website-field affiliate-website-field-full",children:[e.jsxs("span",{className:"affiliate-website-label",children:[e.jsx(J,{size:16}),"Subtitle"]}),e.jsx("textarea",{className:"affiliate-website-input affiliate-website-textarea affiliate-website-textarea-small",name:"subtitle",placeholder:"Get updates, deals, and new post alerts.",rows:"3",value:s.subtitle,onChange:x})]}),e.jsxs("label",{className:"affiliate-website-field",children:[e.jsxs("span",{className:"affiliate-website-label",children:[e.jsx(K,{size:16}),"Placeholder text"]}),e.jsx("input",{className:"affiliate-website-input",name:"placeholder_text",placeholder:"Enter your email",value:s.placeholder_text,onChange:x})]}),e.jsxs("label",{className:"affiliate-website-field",children:[e.jsxs("span",{className:"affiliate-website-label",children:[e.jsx(T,{size:16}),"Success message"]}),e.jsx("input",{className:"affiliate-website-input",name:"success_message",placeholder:"Saved successfully",value:s.success_message,onChange:x})]})]}),w?e.jsxs("div",{className:"affiliate-email-template-preview",children:[e.jsxs("div",{className:"affiliate-email-template-preview-head",children:[e.jsx("strong",{children:w.name||"Selected template"}),e.jsx("span",{children:w.template_key||"-"})]}),w.preview_image?e.jsx("img",{src:w.preview_image,alt:w.name||"Email template preview",className:"affiliate-email-template-image"}):null,e.jsx("p",{className:"affiliate-email-template-description",children:w.description||"No description"})]}):null,B?e.jsxs("div",{className:"affiliate-website-alert error",children:[e.jsx(Q,{size:18}),e.jsx("span",{children:B})]}):null,O?e.jsxs("div",{className:"affiliate-website-alert success",children:[e.jsx(T,{size:18}),e.jsx("span",{children:O})]}):null,e.jsx("div",{className:"affiliate-website-actions",children:e.jsxs("button",{className:"affiliate-website-save-btn",type:"submit",disabled:A,children:[e.jsx(q,{size:16}),A?"Saving...":"Save Email Capture Settings"]})})]})]})]}),e.jsxs("div",{className:"affiliate-website-side-stack",children:[e.jsxs("div",{className:"affiliate-website-panel",children:[e.jsx("div",{className:"affiliate-website-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-website-panel-kicker",children:"Quick preview"}),e.jsx("h2",{className:"affiliate-website-panel-title",children:"Website summary"})]})}),e.jsxs("div",{className:"affiliate-website-summary",children:[e.jsxs("div",{className:"affiliate-website-summary-row",children:[e.jsx("span",{children:"Name"}),e.jsx("strong",{children:a.website_name||"-"})]}),e.jsxs("div",{className:"affiliate-website-summary-row",children:[e.jsx("span",{children:"Slug"}),e.jsx("strong",{children:a.slug||"-"})]}),e.jsxs("div",{className:"affiliate-website-summary-row",children:[e.jsx("span",{children:"Status"}),e.jsx("strong",{children:a.status||"-"})]}),e.jsxs("div",{className:"affiliate-website-summary-row column",children:[e.jsx("span",{children:"Public URL"}),e.jsx("strong",{className:"wrap",children:g||"-"})]})]})]}),e.jsxs("div",{className:"affiliate-website-panel",children:[e.jsx("div",{className:"affiliate-website-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-website-panel-kicker",children:"Email setup summary"}),e.jsx("h2",{className:"affiliate-website-panel-title",children:"Current email capture"})]})}),e.jsxs("div",{className:"affiliate-website-summary",children:[e.jsxs("div",{className:"affiliate-website-summary-row",children:[e.jsx("span",{children:"Enabled"}),e.jsx("strong",{children:s.enabled?"Yes":"No"})]}),e.jsxs("div",{className:"affiliate-website-summary-row",children:[e.jsx("span",{children:"Display"}),e.jsx("strong",{children:s.show_mode||"-"})]}),e.jsxs("div",{className:"affiliate-website-summary-row",children:[e.jsx("span",{children:"Delay"}),e.jsxs("strong",{children:[s.delay_seconds||0,"s"]})]}),e.jsxs("div",{className:"affiliate-website-summary-row column",children:[e.jsx("span",{children:"Template"}),e.jsx("strong",{className:"wrap",children:R(w)})]}),e.jsxs("div",{className:"affiliate-website-summary-row",children:[e.jsx("span",{children:"Page target"}),e.jsx("strong",{children:"Post pages only"})]})]})]}),e.jsxs("div",{className:"affiliate-website-panel",children:[e.jsx("div",{className:"affiliate-website-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-website-panel-kicker",children:"Guide"}),e.jsx("h2",{className:"affiliate-website-panel-title",children:"Before you save"})]})}),e.jsxs("div",{className:"affiliate-website-tips",children:[e.jsxs("div",{className:"affiliate-website-tip",children:[e.jsx("span",{className:"dot"}),e.jsx("p",{children:"Choose a clean website name users can remember easily."})]}),e.jsxs("div",{className:"affiliate-website-tip",children:[e.jsx("span",{className:"dot"}),e.jsx("p",{children:"Use a short slug because it becomes part of your public store link."})]}),e.jsxs("div",{className:"affiliate-website-tip",children:[e.jsx("span",{className:"dot"}),e.jsx("p",{children:"Keep your meta title and description readable for search results."})]}),e.jsxs("div",{className:"affiliate-website-tip",children:[e.jsx("span",{className:"dot"}),e.jsx("p",{children:"Email capture for this setup is meant for post pages, not homepage."})]})]})]})]})]})]})}const V=`
  * {
    box-sizing: border-box;
  }

  .affiliate-website-page {
    width: 100%;
  }

  .affiliate-website-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-website-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-website-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliateWebsiteSpin 0.8s linear infinite;
  }

  @keyframes affiliateWebsiteSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .affiliate-website-hero {
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

  .affiliate-website-badge {
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

  .affiliate-website-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-website-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-website-hero-side {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-website-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    padding: 0 14px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 800;
    text-transform: capitalize;
    border: 1px solid transparent;
  }

  .affiliate-website-status.active {
    background: #ecfdf3;
    color: #027a48;
    border-color: #abefc6;
  }

  .affiliate-website-status.inactive {
    background: #fff7ed;
    color: #b54708;
    border-color: #fed7aa;
  }

  .affiliate-website-status.suspended {
    background: #fef2f2;
    color: #b42318;
    border-color: #fecaca;
  }

  .affiliate-website-status.draft {
    background: #f8fafc;
    color: #475467;
    border-color: #e4e7ec;
  }

  .affiliate-website-preview-btn,
  .affiliate-website-save-btn {
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

  .affiliate-website-save-btn {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-website-save-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .affiliate-website-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.8fr);
    gap: 20px;
  }

  .affiliate-website-main-stack,
  .affiliate-website-side-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .affiliate-website-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-website-panel-main {
    min-height: 100%;
  }

  .affiliate-website-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .affiliate-website-panel-kicker {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .affiliate-website-panel-title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-email-panel-subtext {
    margin: 8px 0 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
  }

  .affiliate-website-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .affiliate-website-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .affiliate-website-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-website-field-full {
    grid-column: span 2;
  }

  .affiliate-website-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 800;
    color: #111827;
  }

  .affiliate-website-input {
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

  .affiliate-website-input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.06);
  }

  .affiliate-website-textarea {
    min-height: 130px;
    padding: 14px;
    resize: vertical;
  }

  .affiliate-website-textarea-small {
    min-height: 96px;
  }

  .affiliate-website-help {
    color: #6b7280;
    font-size: 12px;
    line-height: 1.5;
  }

  .affiliate-website-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
  }

  .affiliate-website-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-website-alert.success {
    background: #ecfdf3;
    border: 1px solid #abefc6;
    color: #027a48;
  }

  .affiliate-website-actions {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  .affiliate-website-summary {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-website-summary-row {
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

  .affiliate-website-summary-row.column {
    flex-direction: column;
    align-items: flex-start;
  }

  .affiliate-website-summary-row span {
    color: #6b7280;
    font-weight: 700;
  }

  .affiliate-website-summary-row strong {
    color: #111827;
    font-weight: 900;
    text-align: right;
  }

  .affiliate-website-summary-row strong.wrap {
    width: 100%;
    text-align: left;
    word-break: break-word;
  }

  .affiliate-website-tips {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-website-tip {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 14px 16px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
  }

  .affiliate-website-tip .dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: #111827;
    margin-top: 7px;
    flex-shrink: 0;
  }

  .affiliate-website-tip p {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
  }

  .affiliate-website-checkbox-row {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 50px;
    border: 1px solid #dbe2ea;
    border-radius: 16px;
    background: #ffffff;
    padding: 0 14px;
    font-size: 14px;
    font-weight: 700;
    color: #111827;
  }

  .affiliate-website-checkbox-row input {
    width: 16px;
    height: 16px;
  }

  .affiliate-email-template-preview {
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    background: #f8fafc;
    padding: 16px;
  }

  .affiliate-email-template-preview-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }

  .affiliate-email-template-preview-head strong {
    color: #111827;
    font-size: 16px;
    font-weight: 900;
  }

  .affiliate-email-template-preview-head span {
    color: #6b7280;
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .affiliate-email-template-image {
    width: 100%;
    border-radius: 14px;
    display: block;
    border: 1px solid #e5e7eb;
    margin-bottom: 12px;
  }

  .affiliate-email-template-description {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
  }

  @media (max-width: 1100px) {
    .affiliate-website-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 991px) {
    .affiliate-website-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-website-title {
      font-size: 26px;
    }

    .affiliate-website-panel {
      padding: 18px;
    }
  }

  @media (max-width: 767px) {
    .affiliate-website-form-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-website-field-full {
      grid-column: span 1;
    }

    .affiliate-website-title {
      font-size: 22px;
    }

    .affiliate-website-subtitle {
      font-size: 14px;
    }

    .affiliate-website-preview-btn,
    .affiliate-website-save-btn {
      width: 100%;
    }

    .affiliate-website-hero-side,
    .affiliate-website-actions {
      width: 100%;
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-website-summary-row {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;export{ge as default};
