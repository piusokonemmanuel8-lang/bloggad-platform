import{b as $,r as u,j as e,a as R}from"./index-LXBBJt7I.js";function v(){return{background:"#ffffff",border:"1px solid #e5e7eb",borderRadius:20,padding:20,boxShadow:"0 12px 30px rgba(15, 23, 42, 0.05)"}}function w(){return{display:"block",fontSize:13,fontWeight:800,color:"#374151",marginBottom:8}}function I(){return{width:"100%",minHeight:46,borderRadius:14,border:"1px solid #d1d5db",background:"#ffffff",padding:"0 14px",fontSize:14,color:"#111827",outline:"none"}}function Y(){return{width:"100%",minHeight:150,borderRadius:14,border:"1px solid #d1d5db",background:"#ffffff",padding:14,fontSize:14,color:"#111827",outline:"none",resize:"vertical",fontFamily:"inherit"}}function D(r="default"){const i={success:{background:"#ecfdf3",color:"#027a48",border:"#abefc6"},warning:{background:"#fffaeb",color:"#b54708",border:"#fedf89"},info:{background:"#eff8ff",color:"#175cd3",border:"#b2ddff"},danger:{background:"#fef3f2",color:"#b42318",border:"#fecdca"},default:{background:"#f9fafb",color:"#344054",border:"#eaecf0"}},l=i[r]||i.default;return{display:"inline-flex",alignItems:"center",justifyContent:"center",minHeight:30,padding:"0 12px",borderRadius:999,fontSize:12,fontWeight:800,border:`1px solid ${l.border}`,background:l.background,color:l.color,whiteSpace:"nowrap"}}function x(r,i,l,f=""){return e.jsxs("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:18,padding:"16px 0",borderBottom:"1px solid #eef2f7"},children:[e.jsxs("div",{style:{flex:1},children:[e.jsx("div",{style:{fontSize:15,fontWeight:800,color:"#111827"},children:r}),f?e.jsx("div",{style:{marginTop:6,fontSize:13,lineHeight:1.5,color:"#6b7280"},children:f}):null]}),e.jsx("button",{type:"button",onClick:()=>l(i?0:1),style:{width:58,height:32,borderRadius:999,border:0,background:i?"#2563eb":"#d1d5db",position:"relative",cursor:"pointer",flexShrink:0,transition:"background 0.2s ease",marginTop:2},children:e.jsx("span",{style:{position:"absolute",top:4,left:i?30:4,width:24,height:24,borderRadius:"50%",background:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.16)",transition:"left 0.2s ease"}})})]})}function g({label:r,helper:i,value:l,onChange:f}){const b=Number(l)===1;return e.jsxs("div",{className:"writer-myads-placement-row",children:[e.jsxs("div",{className:"writer-myads-placement-copy",children:[e.jsx("strong",{children:r}),e.jsx("span",{children:i})]}),e.jsx("button",{type:"button",className:`writer-myads-switch ${b?"is-on":""}`,"aria-pressed":b,onClick:()=>f(b?0:1),children:e.jsx("span",{})})]})}const L={monetization_mode:"individual",provider_name:"Google AdSense",provider_type:"adsense",publisher_id:"",head_code:"",notes:"",storefront_top_enabled:1,storefront_sidebar_enabled:0,storefront_bottom_enabled:1,post_top_enabled:1,post_middle_enabled:1,post_bottom_enabled:1,post_sidebar_enabled:0,review_status:"draft",submitted_at:null,reviewed_at:null,admin_review_note:""};function M(r={}){return{...L,...r,monetization_mode:(r==null?void 0:r.monetization_mode)==="platform"?"platform":"individual",provider_name:(r==null?void 0:r.provider_name)||"Google AdSense",provider_type:(r==null?void 0:r.provider_type)||"adsense",publisher_id:(r==null?void 0:r.publisher_id)||"",head_code:(r==null?void 0:r.head_code)||"",notes:(r==null?void 0:r.notes)||"",storefront_top_enabled:Number((r==null?void 0:r.storefront_top_enabled)??1),storefront_sidebar_enabled:Number((r==null?void 0:r.storefront_sidebar_enabled)??0),storefront_bottom_enabled:Number((r==null?void 0:r.storefront_bottom_enabled)??1),post_top_enabled:Number((r==null?void 0:r.post_top_enabled)??1),post_middle_enabled:Number((r==null?void 0:r.post_middle_enabled)??1),post_bottom_enabled:Number((r==null?void 0:r.post_bottom_enabled)??1),post_sidebar_enabled:Number((r==null?void 0:r.post_sidebar_enabled)??0),review_status:(r==null?void 0:r.review_status)||"draft",submitted_at:(r==null?void 0:r.submitted_at)||null,reviewed_at:(r==null?void 0:r.reviewed_at)||null,admin_review_note:(r==null?void 0:r.admin_review_note)||""}}function O(r){const i={monetization_mode:r.monetization_mode,storefront_top_enabled:Number(r.storefront_top_enabled),storefront_sidebar_enabled:Number(r.storefront_sidebar_enabled),storefront_bottom_enabled:Number(r.storefront_bottom_enabled),post_top_enabled:Number(r.post_top_enabled),post_middle_enabled:Number(r.post_middle_enabled),post_bottom_enabled:Number(r.post_bottom_enabled),post_sidebar_enabled:Number(r.post_sidebar_enabled)};return r.monetization_mode==="individual"?{...i,provider_name:r.provider_name,provider_type:r.provider_type,publisher_id:r.publisher_id,head_code:r.head_code,notes:r.notes}:i}function q(r){return r==="approved"?{label:"Approved",tone:"success",helper:"Your monetization setup has been approved."}:r==="pending"?{label:"Pending Review",tone:"info",helper:"Your monetization setup has been submitted and is waiting for admin review."}:r==="rejected"?{label:"Rejected",tone:"danger",helper:"Your submission was reviewed and needs correction before resubmission."}:{label:"Draft",tone:"warning",helper:"Save your setup, then submit it for review when you are ready."}}function T(r){if(!r)return"";const i=new Date(r);return Number.isNaN(i.getTime())?"":i.toLocaleString()}function J(){const r=$(),[i,l]=u.useState(L),[f,b]=u.useState(""),[_,j]=u.useState(""),[z,W]=u.useState(""),[S,N]=u.useState(""),[k,C]=u.useState(""),[A,E]=u.useState(!0),[h,F]=u.useState(!1),[c,B]=u.useState(!1),s=i.monetization_mode==="individual",n=u.useMemo(()=>q(i.review_status),[i.review_status]),G=r.pathname==="/writer/monetization/my-ads";u.useEffect(()=>{let a=!1;async function p(){var m,t;E(!0),W("");try{const{data:d}=await R.get("/api/affiliate/dashboard/monetization/settings");if(!(d!=null&&d.ok))throw new Error((d==null?void 0:d.message)||"Failed to load your monetization settings.");a||l(M(d.settings||{}))}catch(d){a||W(((t=(m=d==null?void 0:d.response)==null?void 0:m.data)==null?void 0:t.message)||d.message||"Failed to load your monetization settings.")}finally{a||E(!1)}}return p(),()=>{a=!0}},[]);function o(a,p){b(""),j(""),N(""),C(""),l(m=>({...m,[a]:p}))}async function H(a){var p,m;a.preventDefault(),F(!0),b(""),j(""),N(""),C("");try{const{data:t}=await R.put("/api/affiliate/dashboard/monetization/settings",O(i));if(!(t!=null&&t.ok))throw new Error((t==null?void 0:t.message)||"Failed to save your monetization settings.");l(M(t.settings||{})),b(s?"Your ad settings have been saved.":"Your platform ad preferences have been saved.")}catch(t){N(((m=(p=t==null?void 0:t.response)==null?void 0:p.data)==null?void 0:m.message)||t.message||"Failed to save your monetization settings.")}finally{F(!1)}}async function P(){var a,p,m,t;B(!0),b(""),j(""),N(""),C("");try{const d=await R.put("/api/affiliate/dashboard/monetization/settings",O(i));if(!((a=d==null?void 0:d.data)!=null&&a.ok))throw new Error(((p=d==null?void 0:d.data)==null?void 0:p.message)||"Failed to save your monetization settings.");const{data:y}=await R.post("/api/affiliate/dashboard/monetization/submit-review");if(!(y!=null&&y.ok))throw new Error((y==null?void 0:y.message)||"Failed to submit your monetization setup for review.");l(M(y.settings||{})),j(y.message||"Your monetization setup has been submitted for review.")}catch(d){C(((t=(m=d==null?void 0:d.response)==null?void 0:m.data)==null?void 0:t.message)||d.message||"Failed to submit your monetization setup for review.")}finally{B(!1)}}if(G){const m=s?["Choose individual monetization if you already have your own ad account.","Enter your provider details and paste your approved code.","Choose where those ads should display.","Save your setup, then submit it for admin review.","After approval, your review status updates here."]:["Choose platform monetization if you want BlogPulse ads on your pages.","No provider name, publisher ID, or ad code is required.","Choose where platform ads should display.","Save your platform placement preferences.","Your metrics and earnings appear in your monetization pages."];return e.jsxs("form",{className:"writer-myads-page",onSubmit:H,children:[e.jsx("style",{children:U}),e.jsx("div",{className:"writer-myads-mobile-title",children:"My Ads"}),e.jsxs("section",{className:"writer-myads-command",children:[e.jsxs("div",{className:"writer-myads-mode-area",children:[e.jsx("span",{className:"writer-myads-eyebrow",children:"Monetization mode"}),e.jsxs("div",{className:"writer-myads-mode-row",children:[e.jsxs("div",{className:"writer-myads-mode-buttons",children:[e.jsx("button",{type:"button",className:`writer-myads-mode-button ${s?"active":""}`,onClick:()=>o("monetization_mode","individual"),children:"Individual"}),e.jsx("button",{type:"button",className:`writer-myads-mode-button ${s?"":"active"}`,onClick:()=>o("monetization_mode","platform"),children:"Platform"})]}),e.jsx("span",{className:"writer-myads-mode-helper",children:s?"Use your own approved ad account":"Use BlogPulse platform monetization"})]})]}),e.jsxs("div",{className:"writer-myads-command-actions",children:[e.jsx("span",{className:`writer-myads-status-pill ${n.tone}`,children:n.label}),e.jsx("button",{type:"submit",className:"writer-myads-primary-button",disabled:h,children:h?"Saving...":"Save My Ads"}),s?e.jsx("button",{type:"button",className:"writer-myads-secondary-button",onClick:P,disabled:c||i.review_status==="pending",children:c?"Submitting...":i.review_status==="pending"?"Submitted For Review":"Submit For Review"}):null]})]}),z?e.jsx("div",{className:"writer-myads-message error",children:z}):null,f?e.jsx("div",{className:"writer-myads-message success",children:f}):null,_?e.jsx("div",{className:"writer-myads-message success",children:_}):null,S?e.jsx("div",{className:"writer-myads-message error",children:S}):null,k?e.jsx("div",{className:"writer-myads-message error",children:k}):null,e.jsxs("div",{className:"writer-myads-layout",children:[e.jsxs("div",{className:"writer-myads-main-column",children:[e.jsxs("section",{className:"writer-myads-card writer-myads-setup-card",children:[e.jsxs("div",{className:"writer-myads-section-heading",children:[e.jsx("strong",{children:"Monetization Setup"}),e.jsx("span",{children:s?"Your own provider pays you directly in Individual mode.":"BlogPulse handles ad serving in Platform mode."})]}),A?e.jsx("div",{className:"writer-myads-loading",children:"Loading your saved settings..."}):null,e.jsxs("div",{className:"writer-myads-inline-review",children:[e.jsx("span",{className:`writer-myads-status-pill ${n.tone}`,children:n.label}),e.jsx("strong",{children:n.helper})]}),e.jsxs("div",{className:"writer-myads-fields-grid",children:[e.jsxs("label",{className:"writer-myads-field",children:[e.jsx("span",{children:"MONETIZATION MODE"}),e.jsxs("select",{value:i.monetization_mode,onChange:t=>o("monetization_mode",t.target.value),children:[e.jsx("option",{value:"individual",children:"Individual monetization"}),e.jsx("option",{value:"platform",children:"Platform monetization"})]})]}),s?e.jsxs(e.Fragment,{children:[e.jsxs("label",{className:"writer-myads-field",children:[e.jsx("span",{children:"PROVIDER NAME"}),e.jsx("input",{value:i.provider_name,onChange:t=>o("provider_name",t.target.value),placeholder:"Google AdSense"})]}),e.jsxs("label",{className:"writer-myads-field",children:[e.jsx("span",{children:"PROVIDER TYPE"}),e.jsxs("select",{value:i.provider_type,onChange:t=>o("provider_type",t.target.value),children:[e.jsx("option",{value:"adsense",children:"AdSense"}),e.jsx("option",{value:"generic",children:"Generic network"}),e.jsx("option",{value:"manual",children:"Manual / direct ad"})]})]}),e.jsxs("label",{className:"writer-myads-field",children:[e.jsx("span",{children:"PUBLISHER ID"}),e.jsx("input",{value:i.publisher_id,onChange:t=>o("publisher_id",t.target.value),placeholder:"pub-xxxxxxxxxxxxxxxx"})]})]}):null]}),s?e.jsxs(e.Fragment,{children:[e.jsxs("label",{className:"writer-myads-field writer-myads-field-full",children:[e.jsx("span",{children:"HEAD CODE"}),e.jsx("textarea",{className:"writer-myads-code",value:i.head_code,onChange:t=>o("head_code",t.target.value),placeholder:"<script async src='...'><\/script>"})]}),e.jsxs("label",{className:"writer-myads-field writer-myads-field-full",children:[e.jsx("span",{children:"NOTES"}),e.jsx("textarea",{className:"writer-myads-notes",value:i.notes,onChange:t=>o("notes",t.target.value),placeholder:"Optional note about your ad setup..."})]})]}):e.jsx("div",{className:"writer-myads-platform-note",children:"BlogPulse platform monetization does not require provider name, publisher ID, or ad code. Once approved, the platform handles ad serving. Choose only where platform ads should appear."})]}),e.jsxs("section",{className:"writer-myads-card writer-myads-positions-card",children:[e.jsxs("div",{className:"writer-myads-section-heading",children:[e.jsx("strong",{children:"Ad Positions"}),e.jsx("span",{children:"Choose where ads should appear."})]}),e.jsxs("div",{className:"writer-myads-position-groups",children:[e.jsxs("div",{children:[e.jsx("span",{className:"writer-myads-group-label",children:"STOREFRONT"}),e.jsx(g,{label:"Storefront top ad",helper:"Near the top of your storefront.",value:i.storefront_top_enabled,onChange:t=>o("storefront_top_enabled",t)}),e.jsx(g,{label:"Storefront sidebar ad",helper:"Where your template supports a sidebar.",value:i.storefront_sidebar_enabled,onChange:t=>o("storefront_sidebar_enabled",t)}),e.jsx(g,{label:"Storefront bottom ad",helper:"Lower on your storefront page.",value:i.storefront_bottom_enabled,onChange:t=>o("storefront_bottom_enabled",t)})]}),e.jsxs("div",{children:[e.jsx("span",{className:"writer-myads-group-label",children:"POST PAGES"}),e.jsx(g,{label:"Post top ad",helper:"Near the top of a detailed post.",value:i.post_top_enabled,onChange:t=>o("post_top_enabled",t)}),e.jsx(g,{label:"Post middle ad",helper:"Inside article body where supported.",value:i.post_middle_enabled,onChange:t=>o("post_middle_enabled",t)}),e.jsx(g,{label:"Post bottom ad",helper:"Near the end of a blog post.",value:i.post_bottom_enabled,onChange:t=>o("post_bottom_enabled",t)}),e.jsx(g,{label:"Post sidebar ad",helper:"Where the selected template supports it.",value:i.post_sidebar_enabled,onChange:t=>o("post_sidebar_enabled",t)})]})]}),e.jsxs("div",{className:"writer-myads-desktop-actions",children:[e.jsx("button",{type:"submit",className:"writer-myads-primary-button",disabled:h,children:h?"Saving...":"Save My Ads"}),s?e.jsx("button",{type:"button",className:"writer-myads-secondary-button",onClick:P,disabled:c||i.review_status==="pending",children:c?"Submitting...":i.review_status==="pending"?"Submitted For Review":"Submit For Review"}):null]})]}),e.jsxs("section",{className:"writer-myads-card writer-myads-mobile-actions",children:[e.jsx("button",{type:"submit",className:"writer-myads-primary-button",disabled:h,children:h?"Saving...":"Save My Ads"}),s?e.jsx("button",{type:"button",className:"writer-myads-secondary-button",onClick:P,disabled:c||i.review_status==="pending",children:c?"Submitting...":i.review_status==="pending"?"Submitted For Review":"Submit For Review"}):null]})]}),e.jsxs("aside",{className:"writer-myads-side-column",children:[e.jsxs("section",{className:"writer-myads-card writer-myads-review-card",children:[e.jsx("h3",{children:"Review Status"}),e.jsx("span",{className:`writer-myads-status-pill ${n.tone}`,children:n.label}),e.jsx("p",{children:n.helper}),e.jsxs("div",{className:"writer-myads-review-times",children:[e.jsxs("span",{children:["Submitted: ",i.submitted_at?T(i.submitted_at):"--"]}),e.jsxs("span",{children:["Reviewed: ",i.reviewed_at?T(i.reviewed_at):"--"]})]}),i.admin_review_note?e.jsxs("div",{className:"writer-myads-admin-note",children:[e.jsx("strong",{children:"Admin note:"})," ",i.admin_review_note]}):null]}),e.jsxs("section",{className:"writer-myads-card writer-myads-how-card",children:[e.jsx("h3",{children:"How this works"}),e.jsx("div",{className:"writer-myads-steps",children:m.map((t,d)=>e.jsxs("div",{className:"writer-myads-step",children:[e.jsx("span",{children:d+1}),e.jsxs("p",{children:[e.jsx("b",{children:d+1}),t]})]},t))})]}),e.jsxs("section",{className:"writer-myads-card writer-myads-important-card",children:[e.jsx("h3",{children:"Important Note"}),e.jsx("div",{children:s?"Your provider pays you directly in Individual mode. BlogPulse wallet earnings do not apply to this mode.":"BlogPulse platform monetization uses platform-managed ads and platform earnings rules."})]}),e.jsxs("section",{className:"writer-myads-card writer-myads-type-card",children:[e.jsx("span",{children:"Monetization Type"}),e.jsx("strong",{children:s?"Individual Ads":"Platform Monetization"}),e.jsx("p",{children:s?"Provider details and approval are required before your own code can go live.":"The platform manages ad serving after approval."})]})]})]})]})}return e.jsxs("div",{style:{display:"grid",gap:24},children:[e.jsx("section",{style:{...v(),background:"linear-gradient(135deg, rgba(17,24,39,1) 0%, rgba(31,41,55,1) 55%, rgba(55,65,81,1) 100%)",color:"#ffffff"},children:e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"minmax(0, 1.25fr) minmax(280px, 0.75fr)",gap:18,alignItems:"center"},children:[e.jsxs("div",{children:[e.jsx("div",{style:{display:"inline-flex",alignItems:"center",minHeight:32,padding:"0 12px",borderRadius:999,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14},children:"My Ads"}),e.jsx("h1",{style:{margin:0,fontSize:32,lineHeight:1.15,fontWeight:900},children:"Manage your monetization setup and choose where ads should appear"}),e.jsx("p",{style:{margin:"12px 0 0",maxWidth:760,color:"rgba(255,255,255,0.82)",fontSize:15,lineHeight:1.7},children:"Choose whether you want to use your own ad provider or BlogPulse platform monetization. The fields shown below will change based on the monetization option you select."})]}),e.jsxs("div",{style:{display:"grid",gap:14},children:[e.jsxs("div",{style:{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:18,padding:16},children:[e.jsx("div",{style:{fontSize:12,color:"rgba(255,255,255,0.7)",marginBottom:8},children:"Current Status"}),e.jsx("div",{style:{...D(n.tone),background:"rgba(255,255,255,0.12)",color:"#fff",border:"1px solid rgba(255,255,255,0.18)"},children:n.label})]}),e.jsxs("div",{style:{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:18,padding:16},children:[e.jsx("div",{style:{fontSize:12,color:"rgba(255,255,255,0.7)",marginBottom:8},children:"Monetization Type"}),e.jsx("div",{style:{fontSize:22,fontWeight:900},children:s?"Individual Ads":"Platform Monetization"})]})]})]})}),z?e.jsx("section",{style:v(),children:e.jsx("div",{style:{padding:14,borderRadius:14,background:"#fef3f2",border:"1px solid #fecdca",color:"#b42318",fontSize:14,fontWeight:700,lineHeight:1.6},children:z})}):null,e.jsxs("section",{style:{display:"grid",gridTemplateColumns:"minmax(0, 1.15fr) minmax(320px, 0.85fr)",gap:24,alignItems:"start"},children:[e.jsx("form",{onSubmit:H,style:{display:"grid",gap:24},children:e.jsxs("div",{style:v(),children:[e.jsxs("div",{style:{marginBottom:18},children:[e.jsx("h2",{style:{margin:0,fontSize:22,fontWeight:900,color:"#111827"},children:"Monetization Setup"}),e.jsx("p",{style:{margin:"8px 0 0",color:"#6b7280",fontSize:14,lineHeight:1.6},children:s?"Set up your own ad account details here. Your own provider pays you directly.":"Platform monetization uses BlogPulse ads. You only need to decide where platform ads should appear on your pages."})]}),A?e.jsx("div",{style:{padding:14,borderRadius:14,background:"#f9fafb",border:"1px solid #eef2f7",color:"#6b7280",fontSize:14,fontWeight:700},children:"Loading your saved settings..."}):null,e.jsxs("div",{style:{marginBottom:18,padding:14,borderRadius:16,background:"#f8fafc",border:"1px solid #e2e8f0"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"},children:[e.jsx("div",{style:D(n.tone),children:n.label}),e.jsx("div",{style:{fontSize:14,fontWeight:700,color:"#374151"},children:n.helper})]}),i.submitted_at?e.jsxs("div",{style:{marginTop:10,fontSize:13,color:"#6b7280"},children:["Submitted: ",T(i.submitted_at)]}):null,i.reviewed_at?e.jsxs("div",{style:{marginTop:6,fontSize:13,color:"#6b7280"},children:["Reviewed: ",T(i.reviewed_at)]}):null,i.admin_review_note?e.jsxs("div",{style:{marginTop:10,padding:12,borderRadius:12,background:"#ffffff",border:"1px solid #e5e7eb",fontSize:13,color:"#374151",lineHeight:1.6},children:[e.jsx("strong",{children:"Admin note:"})," ",i.admin_review_note]}):null]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",gap:16},children:[e.jsxs("div",{children:[e.jsx("label",{style:w(),children:"Monetization mode"}),e.jsxs("select",{style:I(),value:i.monetization_mode,onChange:a=>o("monetization_mode",a.target.value),children:[e.jsx("option",{value:"individual",children:"Individual monetization"}),e.jsx("option",{value:"platform",children:"Platform monetization"})]})]}),s?e.jsxs(e.Fragment,{children:[e.jsxs("div",{children:[e.jsx("label",{style:w(),children:"Provider name"}),e.jsx("input",{style:I(),value:i.provider_name,onChange:a=>o("provider_name",a.target.value),placeholder:"Google AdSense"})]}),e.jsxs("div",{children:[e.jsx("label",{style:w(),children:"Provider type"}),e.jsxs("select",{style:I(),value:i.provider_type,onChange:a=>o("provider_type",a.target.value),children:[e.jsx("option",{value:"adsense",children:"AdSense"}),e.jsx("option",{value:"generic",children:"Generic network"}),e.jsx("option",{value:"manual",children:"Manual / direct ad"})]})]}),e.jsxs("div",{children:[e.jsx("label",{style:w(),children:"Publisher ID"}),e.jsx("input",{style:I(),value:i.publisher_id,onChange:a=>o("publisher_id",a.target.value),placeholder:"pub-xxxxxxxxxxxxxxxx"})]})]}):null]}),s?e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{marginTop:18},children:[e.jsx("label",{style:w(),children:"Head code"}),e.jsx("textarea",{style:Y(),value:i.head_code,onChange:a=>o("head_code",a.target.value),placeholder:"<script async src='...'><\/script>"})]}),e.jsxs("div",{style:{marginTop:18},children:[e.jsx("label",{style:w(),children:"Notes"}),e.jsx("textarea",{style:{...Y(),minHeight:110},value:i.notes,onChange:a=>o("notes",a.target.value),placeholder:"Optional note about your ad setup..."})]})]}):e.jsx("div",{style:{marginTop:18,padding:16,borderRadius:16,background:"#eff8ff",border:"1px solid #b2ddff",color:"#175cd3",fontSize:14,fontWeight:700,lineHeight:1.6},children:"BlogPulse platform monetization does not require provider name, publisher ID, or ad code from you. Once approved, the platform handles the ad serving. You only choose where platform ads should appear."}),e.jsxs("div",{style:{marginTop:22},children:[e.jsx("h3",{style:{margin:"0 0 10px",fontSize:18,fontWeight:900,color:"#111827"},children:"Ad Positions"}),e.jsxs("div",{style:{display:"grid",gap:0},children:[x("Storefront top ad",Number(i.storefront_top_enabled),a=>o("storefront_top_enabled",a),"Shows near the top of your storefront homepage."),x("Storefront sidebar ad",Number(i.storefront_sidebar_enabled),a=>o("storefront_sidebar_enabled",a),"Shows on storefront side sections where the template supports it."),x("Storefront bottom ad",Number(i.storefront_bottom_enabled),a=>o("storefront_bottom_enabled",a),"Shows lower on your storefront page."),x("Post top ad",Number(i.post_top_enabled),a=>o("post_top_enabled",a),"Shows near the top of your detailed blog post page."),x("Post middle ad",Number(i.post_middle_enabled),a=>o("post_middle_enabled",a),"Shows inside the article body when the template supports mid-content ads."),x("Post bottom ad",Number(i.post_bottom_enabled),a=>o("post_bottom_enabled",a),"Shows near the end of the blog post."),e.jsx("div",{style:{borderBottom:"1px solid #eef2f7"},children:x("Post sidebar ad",Number(i.post_sidebar_enabled),a=>o("post_sidebar_enabled",a),"Shows in the post sidebar where the selected template has sidebar support.")})]})]}),e.jsxs("div",{style:{marginTop:18,display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"},children:[e.jsx("button",{type:"submit",disabled:h,style:{minWidth:170,height:46,borderRadius:14,border:0,background:h?"#93c5fd":"#111827",color:"#ffffff",fontSize:14,fontWeight:900,cursor:h?"not-allowed":"pointer"},children:h?"Saving...":"Save My Ads"}),s?e.jsx("button",{type:"button",onClick:P,disabled:c||i.review_status==="pending",style:{minWidth:190,height:46,borderRadius:14,border:"1px solid #d1d5db",background:c||i.review_status==="pending"?"#f3f4f6":"#ffffff",color:c||i.review_status==="pending"?"#6b7280":"#111827",fontSize:14,fontWeight:900,cursor:c||i.review_status==="pending"?"not-allowed":"pointer"},children:c?"Submitting...":i.review_status==="pending"?"Submitted For Review":"Submit For Review"}):null,f?e.jsx("div",{style:{fontSize:14,color:"#027a48",fontWeight:800},children:f}):null,_?e.jsx("div",{style:{fontSize:14,color:"#027a48",fontWeight:800},children:_}):null,S?e.jsx("div",{style:{fontSize:14,color:"#b42318",fontWeight:800},children:S}):null,k?e.jsx("div",{style:{fontSize:14,color:"#b42318",fontWeight:800},children:k}):null]})]})}),e.jsxs("div",{style:{display:"grid",gap:24},children:[e.jsxs("div",{style:v(),children:[e.jsx("h3",{style:{margin:0,fontSize:20,fontWeight:900,color:"#111827"},children:"How this works"}),e.jsx("div",{style:{marginTop:16,display:"grid",gap:12},children:(s?["Choose individual monetization if you already have your own ad account.","Enter your provider details and paste your approved code.","Choose where those ads should display on your storefront and post pages.","Save your setup, then submit it for admin review.","After approval, your review status will update here."]:["Choose platform monetization if you want BlogPulse ads on your pages.","You do not need to enter provider name, publisher ID, or code.","Just choose where platform ads should display.","Once approved, BlogPulse handles the ad serving automatically.","Your metrics and earnings will appear in your monetization pages."]).map((a,p)=>e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"32px minmax(0, 1fr)",gap:12,alignItems:"start"},children:[e.jsx("div",{style:{width:32,height:32,borderRadius:999,background:"#111827",color:"#ffffff",display:"grid",placeItems:"center",fontWeight:900,fontSize:13},children:p+1}),e.jsx("div",{style:{color:"#374151",fontSize:14,lineHeight:1.6,paddingTop:4},children:a})]},a))})]}),e.jsxs("div",{style:v(),children:[e.jsx("h3",{style:{margin:0,fontSize:20,fontWeight:900,color:"#111827"},children:"Important Note"}),e.jsx("div",{style:{marginTop:16,padding:14,borderRadius:16,background:"#eff8ff",border:"1px solid #b2ddff",color:"#175cd3",fontSize:14,fontWeight:700,lineHeight:1.6},children:s?"If you use your own ad account, your provider pays you directly. BlogPulse wallet earnings do not apply to this mode.":"If you use BlogPulse platform monetization, the platform manages the ads for you. Your placement choices help decide where those ads should appear."})]})]})]})]})}const U=`
  * {
    box-sizing: border-box;
  }

  .writer-myads-page {
    width: 100%;
    min-width: 0;
    margin: 0;
    color: #161a20;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .writer-myads-page button,
  .writer-myads-page input,
  .writer-myads-page select,
  .writer-myads-page textarea {
    font: inherit;
  }

  .writer-myads-mobile-title,
  .writer-myads-mobile-actions {
    display: none;
  }

  .writer-myads-command,
  .writer-myads-card,
  .writer-myads-message {
    background: #ffffff;
    border: 1px solid #e3e6ea;
    border-radius: 12px;
  }

  .writer-myads-command {
    position: relative;
    min-height: 70px;
    margin-bottom: 12px;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }

  .writer-myads-mode-area {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .writer-myads-eyebrow {
    color: #68707c;
    font-size: 12px;
    line-height: 1.2;
    font-weight: 600;
  }

  .writer-myads-mode-row {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .writer-myads-mode-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .writer-myads-mode-button {
    min-width: 92px;
    height: 30px;
    padding: 0 12px;
    border: 1px solid #e3e6ea;
    border-radius: 999px;
    background: #f7f8fa;
    color: #68707c;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .writer-myads-mode-button.active {
    border-color: #1e2329;
    background: #1e2329;
    color: #ffffff;
  }

  .writer-myads-mode-helper {
    min-width: 0;
    color: #68707c;
    font-size: 12px;
    line-height: 1.35;
  }

  .writer-myads-command-actions,
  .writer-myads-desktop-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .writer-myads-status-pill {
    min-height: 30px;
    padding: 0 12px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #eaecf0;
    background: #f9fafb;
    color: #344054;
    font-size: 11px;
    line-height: 1;
    font-weight: 700;
    white-space: nowrap;
  }

  .writer-myads-status-pill.warning {
    border-color: #fedf89;
    background: #fffaeb;
    color: #b54708;
  }

  .writer-myads-status-pill.success {
    border-color: #abefc6;
    background: #ecfdf3;
    color: #027a48;
  }

  .writer-myads-status-pill.info {
    border-color: #b2ddff;
    background: #eff8ff;
    color: #175cd3;
  }

  .writer-myads-status-pill.danger {
    border-color: #fecdca;
    background: #fef3f2;
    color: #b42318;
  }

  .writer-myads-primary-button,
  .writer-myads-secondary-button {
    min-height: 40px;
    padding: 0 16px;
    border-radius: 9px;
    font-size: 12px;
    line-height: 1;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
  }

  .writer-myads-primary-button {
    border: 1px solid #1e2329;
    background: #1e2329;
    color: #ffffff;
  }

  .writer-myads-secondary-button {
    border: 1px solid #d1d5db;
    background: #ffffff;
    color: #161a20;
  }

  .writer-myads-primary-button:disabled,
  .writer-myads-secondary-button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .writer-myads-message {
    margin-bottom: 12px;
    padding: 11px 13px;
    font-size: 12px;
    line-height: 1.45;
    font-weight: 600;
  }

  .writer-myads-message.success {
    border-color: #abefc6;
    background: #ecfdf3;
    color: #027a48;
  }

  .writer-myads-message.error {
    border-color: #fecdca;
    background: #fef3f2;
    color: #b42318;
  }

  .writer-myads-layout {
    display: grid;
    grid-template-columns: minmax(0, 2.06fr) minmax(320px, 0.98fr);
    gap: 12px;
    align-items: start;
  }

  .writer-myads-main-column,
  .writer-myads-side-column {
    min-width: 0;
    display: grid;
    gap: 12px;
  }

  .writer-myads-card {
    min-width: 0;
    padding: 14px;
  }

  .writer-myads-section-heading {
    margin-bottom: 14px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .writer-myads-section-heading > strong {
    color: #161a20;
    font-size: 15px;
    line-height: 1.3;
    font-weight: 700;
  }

  .writer-myads-section-heading > span {
    color: #68707c;
    font-size: 12px;
    line-height: 1.4;
  }

  .writer-myads-loading {
    margin-bottom: 12px;
    padding: 11px 12px;
    border: 1px solid #e3e6ea;
    border-radius: 9px;
    background: #f7f8fa;
    color: #68707c;
    font-size: 12px;
    font-weight: 600;
  }

  .writer-myads-inline-review {
    min-height: 66px;
    margin-bottom: 14px;
    padding: 12px;
    border: 1px solid #e3e6ea;
    border-radius: 10px;
    background: #f8fafc;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .writer-myads-inline-review > strong {
    color: #374151;
    font-size: 12px;
    line-height: 1.45;
    font-weight: 600;
  }

  .writer-myads-fields-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 16px;
  }

  .writer-myads-field {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .writer-myads-field > span,
  .writer-myads-group-label {
    color: #667085;
    font-size: 11px;
    line-height: 1.2;
    font-weight: 700;
  }

  .writer-myads-field input,
  .writer-myads-field select,
  .writer-myads-field textarea {
    width: 100%;
    min-width: 0;
    border: 1px solid #ccd5df;
    border-radius: 9px;
    background: #ffffff;
    color: #111827;
    outline: none;
    font-size: 12px;
    line-height: 1.45;
  }

  .writer-myads-field input,
  .writer-myads-field select {
    height: 42px;
    padding: 0 11px;
  }

  .writer-myads-field textarea {
    padding: 10px 11px;
    resize: vertical;
    font-family: inherit;
  }

  .writer-myads-field-full {
    margin-top: 12px;
  }

  .writer-myads-code {
    min-height: 78px;
  }

  .writer-myads-notes {
    min-height: 66px;
  }

  .writer-myads-platform-note {
    margin-top: 14px;
    padding: 13px;
    border: 1px solid #b2ddff;
    border-radius: 10px;
    background: #eff8ff;
    color: #175cd3;
    font-size: 12px;
    line-height: 1.5;
    font-weight: 600;
  }

  .writer-myads-position-groups {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 32px;
  }

  .writer-myads-group-label {
    display: block;
    margin-bottom: 4px;
    color: #9aa1aa;
  }

  .writer-myads-placement-row {
    min-height: 70px;
    padding: 10px 0;
    border-bottom: 1px solid #edf0f2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .writer-myads-placement-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .writer-myads-placement-copy > strong {
    color: #161a20;
    font-size: 12px;
    line-height: 1.35;
    font-weight: 600;
  }

  .writer-myads-placement-copy > span {
    color: #7b8491;
    font-size: 11px;
    line-height: 1.35;
  }

  .writer-myads-switch {
    position: relative;
    flex: 0 0 auto;
    width: 44px;
    height: 24px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: #d5dbe2;
    cursor: pointer;
  }

  .writer-myads-switch > span {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.18);
    transition: left 0.18s ease;
  }

  .writer-myads-switch.is-on {
    background: #1e2329;
  }

  .writer-myads-switch.is-on > span {
    left: 23px;
  }

  .writer-myads-desktop-actions {
    margin-top: 14px;
  }

  .writer-myads-review-card h3,
  .writer-myads-how-card h3,
  .writer-myads-important-card h3 {
    margin: 0 0 12px;
    color: #161a20;
    font-size: 14px;
    line-height: 1.3;
    font-weight: 700;
  }

  .writer-myads-review-card > p {
    margin: 10px 0 0;
    color: #68707c;
    font-size: 12px;
    line-height: 1.45;
  }

  .writer-myads-review-times {
    margin-top: 16px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .writer-myads-review-times > span {
    color: #8a929c;
    font-size: 11px;
    line-height: 1.35;
  }

  .writer-myads-admin-note {
    margin-top: 12px;
    padding: 10px;
    border: 1px solid #e3e6ea;
    border-radius: 9px;
    background: #f8fafc;
    color: #374151;
    font-size: 11px;
    line-height: 1.45;
  }

  .writer-myads-steps {
    display: grid;
    gap: 14px;
  }

  .writer-myads-step {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr);
    gap: 10px;
    align-items: start;
  }

  .writer-myads-step > span {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #1e2329;
    color: #ffffff;
    display: grid;
    place-items: center;
    font-size: 11px;
    line-height: 1;
    font-weight: 700;
  }

  .writer-myads-step > p {
    margin: 2px 0 0;
    color: #374151;
    font-size: 12px;
    line-height: 1.45;
  }

  .writer-myads-step > p > b {
    display: none;
  }

  .writer-myads-important-card > div {
    padding: 12px;
    border: 1px solid #b2ddff;
    border-radius: 10px;
    background: #eff8ff;
    color: #175cd3;
    font-size: 12px;
    line-height: 1.45;
    font-weight: 600;
  }

  .writer-myads-type-card {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .writer-myads-type-card > span {
    color: #68707c;
    font-size: 12px;
    line-height: 1.3;
    font-weight: 600;
  }

  .writer-myads-type-card > strong {
    color: #161a20;
    font-size: 22px;
    line-height: 1.2;
    font-weight: 700;
  }

  .writer-myads-type-card > p {
    margin: 0;
    color: #68707c;
    font-size: 11px;
    line-height: 1.45;
  }

  @media (max-width: 900px) {
    .writer-myads-layout {
      grid-template-columns: minmax(0, 1.55fr) minmax(280px, 1fr);
    }
  }

  @media (max-width: 767px) {
    .writer-myads-mobile-title {
      min-height: 46px;
      margin-bottom: 10px;
      padding: 0 11px;
      display: flex;
      align-items: center;
      border: 1px solid #e3e6ea;
      border-radius: 10px;
      background: #ffffff;
      color: #161a20;
      font-size: 13px;
      line-height: 1.2;
      font-weight: 600;
    }

    .writer-myads-command {
      min-height: 114px;
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 10px;
      align-items: stretch;
    }

    .writer-myads-eyebrow {
      font-size: 10px;
    }

    .writer-myads-mode-area {
      width: 100%;
    }

    .writer-myads-mode-row {
      flex-wrap: wrap;
      gap: 10px;
    }

    .writer-myads-mode-button {
      min-width: 92px;
      height: 30px;
      font-size: 11px;
    }

    .writer-myads-mode-helper {
      width: 100%;
      font-size: 10px;
    }

    .writer-myads-command-actions {
      position: absolute;
      right: 20px;
      margin-top: 28px;
    }

    .writer-myads-command-actions .writer-myads-primary-button,
    .writer-myads-command-actions .writer-myads-secondary-button {
      display: none;
    }

    .writer-myads-status-pill {
      min-height: 28px;
      padding: 0 10px;
      font-size: 10px;
    }

    .writer-myads-layout {
      display: block;
    }

    .writer-myads-main-column,
    .writer-myads-side-column {
      display: block;
    }

    .writer-myads-card {
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 10px;
    }

    .writer-myads-section-heading {
      margin-bottom: 12px;
    }

    .writer-myads-section-heading > strong {
      font-size: 13px;
    }

    .writer-myads-section-heading > span {
      font-size: 10px;
    }

    .writer-myads-inline-review {
      display: none;
    }

    .writer-myads-fields-grid {
      display: block;
    }

    .writer-myads-field {
      margin-bottom: 10px;
      gap: 5px;
    }

    .writer-myads-field > span,
    .writer-myads-group-label {
      font-size: 10px;
    }

    .writer-myads-field input,
    .writer-myads-field select {
      height: 40px;
      font-size: 11px;
    }

    .writer-myads-field textarea {
      font-size: 11px;
    }

    .writer-myads-field-full {
      margin-top: 0;
    }

    .writer-myads-code {
      min-height: 82px;
    }

    .writer-myads-notes {
      min-height: 70px;
    }

    .writer-myads-position-groups {
      display: block;
    }

    .writer-myads-position-groups > div + div {
      margin-top: 0;
    }

    .writer-myads-group-label {
      display: none;
    }

    .writer-myads-placement-row {
      min-height: 64px;
      padding: 9px 0;
    }

    .writer-myads-placement-copy > strong {
      font-size: 11px;
    }

    .writer-myads-placement-copy > span {
      font-size: 9px;
    }

    .writer-myads-desktop-actions {
      display: none;
    }

    .writer-myads-mobile-actions {
      display: grid;
      gap: 6px;
    }

    .writer-myads-mobile-actions .writer-myads-primary-button,
    .writer-myads-mobile-actions .writer-myads-secondary-button {
      width: 100%;
      min-height: 38px;
    }

    .writer-myads-side-column {
      margin-top: 0;
    }

    .writer-myads-review-card h3,
    .writer-myads-how-card h3,
    .writer-myads-important-card h3 {
      margin-bottom: 10px;
      font-size: 12px;
    }

    .writer-myads-review-card > p {
      font-size: 10px;
    }

    .writer-myads-review-times,
    .writer-myads-admin-note {
      display: none;
    }

    .writer-myads-how-card .writer-myads-steps {
      gap: 4px;
    }

    .writer-myads-step {
      display: block;
    }

    .writer-myads-step > span {
      display: none;
    }

    .writer-myads-step > p {
      margin: 0;
      color: #68707c;
      font-size: 9px;
      line-height: 1.35;
    }

    .writer-myads-step > p > b {
      display: inline;
      margin-right: 8px;
      color: #68707c;
      font-weight: 600;
    }

    .writer-myads-important-card > div {
      padding: 0;
      border: 0;
      background: transparent;
      font-size: 10px;
      line-height: 1.4;
    }

    .writer-myads-type-card {
      display: none;
    }

    .writer-myads-platform-note {
      font-size: 10px;
    }

    .writer-myads-message {
      margin-bottom: 10px;
      font-size: 10px;
    }
  }
`;export{J as default};
