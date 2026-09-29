import{e as Ve,b as Ke,h as Qe,r as f,j as e,F as ke,g as Ye,i as Je,L as Xe,a as R}from"./index-LXBBJt7I.js";import{r as Ne,e as Ze,b as et,W as tt,a as at,L as X,S as it,c as st,d as rt,g as lt}from"./index-B9QkUffi.js";import{S as Se}from"./save-Co8lXD7U.js";import{P as ot}from"./package-BZvUXVf6.js";import{F as nt}from"./folder-kanban-DTsEeGVX.js";import{T as ct}from"./type-B_PWcmvg.js";import{L as pt}from"./link-CCVOqyaN.js";import{I as Ce}from"./image-DDgd2sPC.js";import{C as dt}from"./circle-alert-DsZo9igC.js";import{C as ft}from"./circle-check-ml_0upGj.js";import{L as mt}from"./loader-circle-CwBAc5Ia.js";import{U as ut}from"./upload-WKtBKnBi.js";import"./clock-3-BV9St-rB.js";import"./crown-CqvQp2si.js";function ze(r=""){const l=String(r).toLowerCase();return l==="published"||l==="active"?"affiliate-create-post-status active":l==="draft"||l==="pending"?"affiliate-create-post-status draft":l==="inactive"?"affiliate-create-post-status inactive":"affiliate-create-post-status neutral"}function H(r){return lt(r).replace(/\s+/g," ").trim()}function K(r){const l=H(r);return l?l.split(" ").filter(Boolean).length:0}function Pe(r){return r?r.mode==="exact"?`${r.exact_words} words exact`:`min ${r.min_words} words - suggested max ${r.max_words}`:""}function ie(r,l){if(!l)return{ok:!0,count:K(r),message:""};const p=K(r);if(l.mode==="exact")return p!==Number(l.exact_words||0)?{ok:!1,count:p,message:`${l.label} must be exactly ${l.exact_words} words`}:{ok:!0,count:p,message:""};const u=Number(l.min_words||0),c=Number(l.max_words||0);return p<u?{ok:!1,count:p,message:`${l.label} must be at least ${u} words`}:{ok:!0,count:p,message:c>0&&p>c?`${l.label} is above suggested max ${c} words`:""}}const ht="simple_writer_template_v1";function O(r){return String((r==null?void 0:r.template_code_key)||"").toLowerCase()===ht}function Le(){return[{field_key:"headline",field_type:"text",field_value:"",sort_order:1,meta:{label:"Headline",section:"Generic fields",helper_text:"Generic text field.",required:!0,word_rule:null,placeholder:"Enter headline",locked:!1}},{field_key:"subheadline",field_type:"text",field_value:"",sort_order:2,meta:{label:"Subheadline",section:"Generic fields",helper_text:"Generic text field.",required:!0,word_rule:null,placeholder:"Enter subheadline",locked:!1}},{field_key:"content_block_1",field_type:"textarea",field_value:"",sort_order:3,meta:{label:"Content block 1",section:"Generic fields",helper_text:"Generic textarea field.",required:!0,word_rule:null,placeholder:"Enter content",locked:!1}},{field_key:"content_block_2",field_type:"textarea",field_value:"",sort_order:4,meta:{label:"Content block 2",section:"Generic fields",helper_text:"Generic textarea field.",required:!0,word_rule:null,placeholder:"Enter content",locked:!1}}]}function Ee(){return[{button_key:"primary_cta",button_label:"Buy Now",button_url:"",button_style:"primary",open_in_new_tab:!0,sort_order:1,meta:{label:"Primary CTA",helper_text:"Generic CTA button.",required:!0,locked:!1}},{button_key:"secondary_cta",button_label:"Learn More",button_url:"",button_style:"secondary",open_in_new_tab:!0,sort_order:2,meta:{label:"Secondary CTA",helper_text:"Generic CTA button.",required:!0,locked:!1}}]}function Te({label:r,value:l,placeholder:p,uploading:u,onChange:c,onUpload:x,inputRef:_,previewHeight:E=120}){return e.jsxs("div",{className:"affiliate-create-post-upload-field",children:[e.jsx("label",{className:"affiliate-create-post-label",children:r}),e.jsxs("div",{className:"affiliate-create-post-upload-row",children:[e.jsx("input",{className:"affiliate-create-post-input",placeholder:p,value:l,onChange:c}),e.jsxs("button",{type:"button",className:"affiliate-create-post-upload-btn",disabled:u,onClick:()=>{var g;return(g=_==null?void 0:_.current)==null?void 0:g.click()},children:[u?e.jsx(mt,{size:16,className:"affiliate-create-post-spin"}):e.jsx(ut,{size:16}),u?"Uploading...":"Upload"]}),e.jsx("input",{ref:_,type:"file",accept:"image/*",hidden:!0,onChange:x})]}),l?e.jsx("div",{className:"affiliate-create-post-inline-preview",children:e.jsx("img",{src:l,alt:"Preview",style:{width:"100%",height:E,objectFit:"cover",borderRadius:14}})}):null]})}function Fe(r){const l=String(r||"").trim();if(!l)return!1;try{const p=/^https?:\/\//i.test(l)?l:`https://${l}`;return!!new URL(p).hostname}catch{return!1}}function xt(r){const l=String((r==null?void 0:r.field_type)||"").trim().toLowerCase(),p=String((r==null?void 0:r.field_key)||"").trim().toLowerCase();return l==="url"?!0:p.endsWith("_url")||p.endsWith("_link_url")||p==="url"||p==="link_url"||p==="destination_url"}function gt(r){const l=String((r==null?void 0:r.field_key)||"").trim().toLowerCase();return l.startsWith("simple_writer_link_")||l.startsWith("simple_writer_video_")}function bt(r){const l=String((r==null?void 0:r.field_value)||"").trim();if(!l||!gt(r))return l;try{const p=JSON.parse(l);if(p&&typeof p=="object"&&typeof p.url=="string")return p.url.trim()}catch{}return l}function _t(r){const l=H(r).toLowerCase().replace(/[^a-z0-9\s]/g," ").split(/\s+/).filter(Boolean);if(!l.length)return 0;const p=new Map;l.forEach(c=>p.set(c,(p.get(c)||0)+1));let u=0;return p.forEach(c=>{c>2&&(u+=c-2)}),u}function yt(r){const l=H(r).toLowerCase();return["in today's world","when it comes to","one of the best","game changer","unlock the power","this product is designed to","take your journey to the next level","whether you are","it is important to note","helps support your overall wellness"].reduce((u,c)=>u+(l.includes(c)?1:0),0)}function wt(r,l=""){const p=H(r);let u=0;return p?(/\d/.test(p)&&(u+=1),/%|\$|\u2026|\u00A3|\u20AC/.test(p)&&(u+=1),/\bfor example\b|\bfor instance\b|\bsuch as\b|\bespecially\b/i.test(p)&&(u+=1),p.includes(":")&&(u+=1),H(l).toLowerCase().split(/\s+/).filter(x=>x.length>2).forEach(x=>{p.toLowerCase().includes(x)&&(u+=1)}),u):0}function V(r){return r>=75?"good":r>=60?"warn":"bad"}function vt(r){const l={};if(!r)return l;const p=Array.isArray(r.field_scores)?r.field_scores:[],u=Array.isArray(r.warnings)?r.warnings:[];return p.forEach(c=>{l[c.field_key]={...l[c.field_key]||{},quality_score:Number(c.quality_score||0),risk_score:Number(c.risk_score||0),similarity_score:Number(c.similarity_score||0),passed:!!c.passed,warning_code:c.warning_code||null,warning_message:c.warning_message||""}}),u.forEach(c=>{var x,_;l[c.field_key]={...l[c.field_key]||{},warning_type:c.warning_type||null,warning_message:c.message||((x=l[c.field_key])==null?void 0:x.warning_message)||"",warning_suggestion:c.suggestion||"",similarity_score:Number(c.similarity_score||((_=l[c.field_key])==null?void 0:_.similarity_score)||0)}}),l}function jt({field:r,totalTextWords:l,productTitle:p}){const u=r.meta||{},c=String(r.field_type||"").toLowerCase(),x=String(r.field_value||""),_=H(x),E=c==="text"||c==="textarea"?K(x):0,g=u.word_rule||null,Q=ie(x,g),C=c==="text"||c==="textarea"?yt(x):0,W=c==="text"||c==="textarea"?_t(x):0,F=c==="text"||c==="textarea"?wt(x,p):0;if(c==="image"){const b=!!_;return{score:b?100:0,tone:b?"good":"bad",message:b?"Image slot filled.":"This image slot is required.",suggestion:b?"":"Upload an image or paste an image URL.",wordCount:0,started:l>=100,passed:b}}if(!_)return{score:0,tone:"bad",message:`${u.label||r.field_key} is empty.`,suggestion:"Add content to continue.",wordCount:E,started:l>=100,passed:!1};let j=100,N="Strong section.",z="",i=!0;return g&&!Q.ok&&(j-=45,N=Q.message,z="Add more words before saving.",i=!1),C>0&&(j-=C*10,i&&(N="This section sounds too generic.",z="Add a real example or a clearer product-specific point.")),W>0&&(j-=Math.min(18,W*4),i&&!C&&(N="This section repeats wording too much.",z="Vary sentence pattern and remove repeated phrases.")),F<1&&E>=20&&(j-=12,i&&!C&&!W&&(N="This section needs more original detail.",z="Add a concrete detail, number, example, or product reference.")),(g==null?void 0:g.mode)==="range"&&g.max_words&&E>Number(g.max_words)&&i&&!C&&!W&&(N=`${u.label||r.field_key} is above suggested max ${g.max_words} words.`,z="You can keep it, but shorter text may fit the template better."),l<100&&i&&(N="Live quality preview is warming up.",z="Similarity review starts properly after the post reaches 100 total words."),j=Math.max(0,Math.min(100,j)),{score:j,tone:V(j),message:N,suggestion:z,wordCount:E,started:l>=100,passed:i}}function Rt(){const r=Ve(),l=Ke(),[p]=Qe(),u=l.pathname.startsWith("/writer")?"/writer":"/affiliate",c=p.get("product_id")||"",x=p.get("template_id")||"",[_,E]=f.useState([]),[g,Q]=f.useState([]),[C,W]=f.useState([]),[F,j]=f.useState({access_type:"free",free_preview_seconds:0}),[N,z]=f.useState({loaded:!1,can_use_premium_posts:!1}),[i,b]=f.useState({content_type:c?"product_post":"article",product_id:c,category_id:"",topic_ids:[],page_ids:[],show_on_storefront:!1,template_id:x,title:"",slug:"",excerpt:"",seo_title:"",seo_description:"",featured_image:"",status:"draft",comments_enabled:!0,scheduled_at:"",template_fields:Le(),cta_buttons:Ee()}),[Ue,se]=f.useState(!0),[q,re]=f.useState(!1),[le,T]=f.useState(""),[oe,U]=f.useState(""),[Me,ne]=f.useState(!1),[$e,ce]=f.useState(""),[P,B]=f.useState(null),[kt,Ae]=f.useState({loaded:!1,allow_external_links:!1}),Re=f.useRef(null),Z=f.useRef({});f.useEffect(()=>{(async()=>{var s,a,n,o,d,h,m;try{se(!0);const[w,I,G,L]=await Promise.all([R.get("/api/affiliate/products"),R.get("/api/affiliate/templates/blog"),R.get("/api/public/categories"),R.get("/api/writer/access/publishing").catch(()=>null)]);E(((s=w==null?void 0:w.data)==null?void 0:s.products)||[]),Q(((a=I==null?void 0:I.data)==null?void 0:a.templates)||[]),W(((n=G==null?void 0:G.data)==null?void 0:n.categories)||[]),z({loaded:!!((o=L==null?void 0:L.data)!=null&&o.ok),can_use_premium_posts:!!((d=L==null?void 0:L.data)!=null&&d.can_use_premium_posts)})}catch(w){T(((m=(h=w==null?void 0:w.response)==null?void 0:h.data)==null?void 0:m.message)||"Failed to load post setup data")}finally{se(!1)}})()},[]),f.useEffect(()=>{if(x||c||i.template_id||!g.length)return;const t=g.find(s=>O(s));t!=null&&t.id&&b(s=>({...s,template_id:String(t.id)}))},[g,x,c,i.template_id]);const M=f.useMemo(()=>_.find(t=>String(t.id)===String(i.product_id)),[_,i.product_id]),y=f.useMemo(()=>g.find(t=>String(t.id)===String(i.template_id)),[g,i.template_id]),ee=f.useMemo(()=>C.find(t=>String(t.id)===String(i.category_id)),[C,i.category_id]),$=f.useMemo(()=>Ne(y),[y]),We=f.useMemo(()=>i.template_fields.reduce((t,s,a)=>{var o;const n=((o=s==null?void 0:s.meta)==null?void 0:o.section)||"Template fields";return t[n]||(t[n]=[]),t[n].push({...s,__index:a}),t},{}),[i.template_fields]),te=f.useMemo(()=>i.template_fields.reduce((t,s)=>{const a=String(s.field_type||"").toLowerCase();return a!=="text"&&a!=="textarea"?t:t+K(s.field_value)},0),[i.template_fields]),D=f.useMemo(()=>Ze(i.template_fields),[i.template_fields]);f.useEffect(()=>{j(t=>{if(t.access_type!=="premium")return t;const s=Math.max(0,D-1),a=Number(t.free_preview_seconds||0),n=s>0?Math.min(s,Math.max(1,a||rt(D))):0;return n===a?t:{...t,free_preview_seconds:n}})},[D]);const v=f.useMemo(()=>{const t={};return i.template_fields.forEach(s=>{t[s.field_key]=jt({field:s,totalTextWords:te,productTitle:(M==null?void 0:M.title)||i.title})}),t},[i.template_fields,te,M,i.title]),S=f.useMemo(()=>vt(P),[P]),Be=f.useMemo(()=>{const t=Object.values(v);return t.length?Math.round(t.reduce((s,a)=>s+Number(a.score||0),0)/t.length):0},[v]),Ie=f.useMemo(()=>Object.values(v).filter(t=>t.passed).length,[v]);f.useEffect(()=>{if(!y)return;const t=Ne(y),s=O(y);b(a=>{if(s)return{...a,template_fields:et(),cta_buttons:[]};const n=!a.template_fields.length||a.template_fields.every(o=>["headline","subheadline","content_block_1","content_block_2"].includes(o.field_key));return!t&&n?{...a,template_fields:Le(),cta_buttons:Ee()}:!t||!n?a:{...a,template_fields:t.fields.map(o=>({field_key:o.field_key,field_type:o.field_type,field_value:o.field_value,sort_order:o.sort_order,meta:o.meta})),cta_buttons:t.ctaButtons.map(o=>({button_key:o.button_key,button_label:o.button_label,button_url:o.button_url,button_style:o.button_style,open_in_new_tab:o.open_in_new_tab,sort_order:o.sort_order,meta:o.meta}))}})},[y]),f.useEffect(()=>{B(null)},[y]);const k=t=>{const{name:s,value:a}=t.target;B(null),b(n=>({...n,[s]:a}))},Y=(t,s,a)=>{B(null),b(n=>{const o=[...n.template_fields];return o[t]={...o[t],[s]:a},{...n,template_fields:o}})},J=(t,s,a)=>{B(null),b(n=>{const o=[...n.cta_buttons];return o[t]={...o[t],[s]:a},{...n,cta_buttons:o}})},ae=async t=>{var o;const s=new FormData;s.append("image",t);const{data:a}=await R.post("/api/uploads/template-image",s,{headers:{"Content-Type":"multipart/form-data"}}),n=((o=a==null?void 0:a.file)==null?void 0:o.url)||"";if(!n)throw new Error("Upload did not return image url");return n},Ge=async t=>{var a,n,o;const s=(a=t.target.files)==null?void 0:a[0];if(s){ne(!0),T(""),U("");try{const d=await ae(s);b(h=>({...h,featured_image:d})),U("Featured image uploaded")}catch(d){T(((o=(n=d==null?void 0:d.response)==null?void 0:n.data)==null?void 0:o.message)||(d==null?void 0:d.message)||"Failed to upload featured image")}finally{ne(!1),t.target.value=""}}},Oe=async(t,s,a)=>{var o,d,h;const n=(o=a.target.files)==null?void 0:o[0];if(n){ce(s),T(""),U("");try{const m=await ae(n);Y(t,"field_value",m),U(`${s} uploaded`)}catch(m){T(((h=(d=m==null?void 0:m.response)==null?void 0:d.data)==null?void 0:h.message)||(m==null?void 0:m.message)||"Failed to upload image")}finally{ce(""),a.target.value=""}}},He=()=>{if(i.content_type==="product_post"&&!i.product_id)throw new Error("Product Post requires a product");if(!i.template_id)throw new Error("Template is required");if(!i.title.trim())throw new Error("Post title is required");for(const t of i.template_fields){const s=t.meta||{},a=s.label||t.field_key||"Field",n=String(t.field_value||"");if(!String(t.field_key||"").trim())throw new Error("Every template field must have a field key");if(s.required&&!n.trim())throw new Error(`${a} is required`);if(t.field_type==="image"&&s.required&&!n.trim())throw new Error(`${a} image is required`);if((t.field_type==="text"||t.field_type==="textarea")&&s.word_rule){const d=ie(n,s.word_rule);if(!d.ok)throw new Error(d.message)}const o=bt(t);if(xt(t)&&o.trim()&&!Fe(o))throw new Error(`${a} must be a valid URL`)}for(const t of i.cta_buttons){const s=t.meta||{},a=s.label||t.button_key||"CTA button";if(s.required&&!String(t.button_label||"").trim())throw new Error(`${a} label is required`);if(!String(t.button_url||"").trim())throw new Error(`${a} URL is required`);if(!Fe(t.button_url))throw new Error(`${a} URL must be valid`);if($){const n=K(t.button_label);if(t.button_key==="hero_primary_cta"&&n!==4)throw new Error("Hero primary CTA must be exactly 4 words");if(["hero_secondary_cta","how_it_works_cta","pricing_card_1_cta","pricing_card_2_cta","pricing_card_3_cta"].includes(t.button_key)&&n!==2)throw new Error(`${a} must be exactly 2 words`);if(t.button_key==="ingredients_cta"&&n!==3)throw new Error("Ingredients CTA must be exactly 3 words");if(t.button_key==="special_offer_cta"&&n!==5)throw new Error("Special offer CTA must be exactly 5 words")}}},pe=t=>{t!=null&&t.quality_review&&B(t.quality_review),t!=null&&t.link_permissions&&Ae({loaded:!0,allow_external_links:!!t.link_permissions.allow_external_links})},De=async t=>{var s,a,n,o;t.preventDefault(),re(!0),T(""),U("");try{He();const d={content_type:i.content_type,product_id:i.product_id?Number(i.product_id):null,category_id:i.category_id||null,topic_ids:i.topic_ids,page_ids:i.page_ids||[],show_on_storefront:!!i.show_on_storefront,template_id:Number(i.template_id),title:i.title,slug:i.slug,excerpt:i.excerpt,seo_title:i.seo_title,seo_description:i.seo_description,featured_image:i.featured_image,status:i.status,comments_enabled:!!i.comments_enabled,scheduled_at:i.scheduled_at||null,template_fields:i.template_fields.map((m,w)=>({field_key:m.field_key,field_type:m.field_type,field_value:m.field_value,sort_order:w+1})),cta_buttons:i.cta_buttons.map((m,w)=>({button_key:m.button_key,button_label:m.button_label,button_url:m.button_url,button_style:m.button_style,open_in_new_tab:!!m.open_in_new_tab,sort_order:w+1}))},{data:h}=await R.post("/api/affiliate/posts",d);if(pe(h),h!=null&&h.ok&&((s=h==null?void 0:h.post)!=null&&s.id)){try{await R.put(`/api/writer/access/posts/${h.post.id}`,{access_type:F.access_type,free_preview_seconds:F.access_type==="premium"?Number(F.free_preview_seconds||0):D})}catch(m){U("Post created. It remains Free until Premium Post settings are saved."),T(((n=(a=m==null?void 0:m.response)==null?void 0:a.data)==null?void 0:n.message)||(m==null?void 0:m.message)||"Premium Post settings could not be saved.");return}U("Post created successfully. Redirecting..."),setTimeout(()=>{r(`${u}/posts/${h.post.id}/edit`)},700)}}catch(d){const h=(o=d==null?void 0:d.response)==null?void 0:o.data;pe(h),T((h==null?void 0:h.message)||d.message||"Failed to create post")}finally{re(!1)}};return Ue?e.jsxs("div",{className:"affiliate-create-post-page",children:[e.jsx("style",{children:qe}),e.jsx("div",{className:"affiliate-create-post-loading-wrap",children:e.jsxs("div",{className:"affiliate-create-post-loading-card",children:[e.jsx("div",{className:"affiliate-create-post-spinner"}),e.jsx("p",{children:"Loading post setup..."})]})})]}):e.jsxs("div",{className:"affiliate-create-post-page",children:[e.jsx("style",{children:qe}),e.jsxs("section",{className:"affiliate-create-post-command",children:[e.jsxs("div",{className:"affiliate-create-post-command-left",children:[e.jsx("strong",{children:"Create post"}),e.jsx("span",{className:ze(i.status),children:i.status||"draft"})]}),e.jsxs("div",{className:"affiliate-create-post-command-actions",children:[e.jsx("button",{className:"affiliate-create-post-btn secondary",type:"button",onClick:()=>r(`${u}/posts`),children:"Back to Posts"}),e.jsxs("button",{className:"affiliate-create-post-btn primary",type:"submit",form:"affiliate-create-post-form",disabled:q,children:[e.jsx(Se,{size:15}),q?"Saving...":"Create Post"]})]})]}),e.jsxs("section",{className:"affiliate-create-post-grid",children:[e.jsxs("div",{className:"affiliate-create-post-panel affiliate-create-post-panel-main",children:[e.jsx("div",{className:"affiliate-create-post-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-create-post-panel-kicker",children:"Post details"}),e.jsx("h2",{className:"affiliate-create-post-panel-title",children:"Post setup"})]})}),e.jsxs("form",{id:"affiliate-create-post-form",className:"affiliate-create-post-form",onSubmit:De,children:[e.jsxs("div",{className:"affiliate-create-post-form-grid",children:[e.jsxs("label",{className:"affiliate-create-post-field",children:[e.jsxs("span",{className:"affiliate-create-post-label",children:[e.jsx(ke,{size:16}),"Content type"]}),e.jsxs("select",{className:"affiliate-create-post-input",name:"content_type",value:i.content_type,onChange:k,children:[e.jsx("option",{value:"article",children:"Article"}),e.jsx("option",{value:"story",children:"Story"}),e.jsx("option",{value:"tutorial",children:"Tutorial"}),e.jsx("option",{value:"course_lesson",children:"Course Lesson"}),e.jsx("option",{value:"review",children:"Review"}),e.jsx("option",{value:"news",children:"News"}),e.jsx("option",{value:"opinion",children:"Opinion"}),e.jsx("option",{value:"product_post",children:"Product Post"})]})]}),e.jsxs("label",{className:"affiliate-create-post-field",children:[e.jsxs("span",{className:"affiliate-create-post-label",children:[e.jsx(ot,{size:16}),"Product (optional)"]}),e.jsxs("select",{className:"affiliate-create-post-input",name:"product_id",value:i.product_id,onChange:k,children:[e.jsx("option",{value:"",children:"No product"}),_.map(t=>e.jsx("option",{value:t.id,children:t.title},t.id))]})]}),e.jsxs("label",{className:"affiliate-create-post-field",children:[e.jsxs("span",{className:"affiliate-create-post-label",children:[e.jsx(nt,{size:16}),"Category"]}),e.jsxs("select",{className:"affiliate-create-post-input",name:"category_id",value:i.category_id,onChange:k,children:[e.jsx("option",{value:"",children:"Select category"}),C.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})]}),e.jsx(tt,{value:i.topic_ids,primaryCategoryId:i.category_id,onChange:t=>b(s=>({...s,topic_ids:t})),disabled:q}),e.jsx(at,{pageIds:i.page_ids||[],showOnStorefront:!!i.show_on_storefront,contentType:i.content_type,onChange:({page_ids:t,show_on_storefront:s})=>b(a=>({...a,page_ids:t,show_on_storefront:s}))}),e.jsxs("label",{className:"affiliate-create-post-field",children:[e.jsxs("span",{className:"affiliate-create-post-label",children:[e.jsx(Ye,{size:16}),"Template"]}),e.jsxs("select",{className:"affiliate-create-post-input",name:"template_id",value:i.template_id,onChange:k,children:[e.jsx("option",{value:"",children:"Select blog template"}),g.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})]}),e.jsxs("label",{className:"affiliate-create-post-field",children:[e.jsxs("span",{className:"affiliate-create-post-label",children:[e.jsx(ct,{size:16}),"Post title"]}),e.jsx("input",{className:"affiliate-create-post-input",name:"title",placeholder:"Post title",value:i.title,onChange:k})]}),e.jsxs("label",{className:"affiliate-create-post-field",children:[e.jsxs("span",{className:"affiliate-create-post-label",children:[e.jsx(pt,{size:16}),"Slug"]}),e.jsx("input",{className:"affiliate-create-post-input",name:"slug",placeholder:"Custom slug",value:i.slug,onChange:k})]}),e.jsx(Te,{label:e.jsxs("span",{className:"affiliate-create-post-label",children:[e.jsx(Ce,{size:16}),"Featured image"]}),value:i.featured_image,placeholder:"Upload image or paste image URL",uploading:Me,onChange:t=>k({target:{name:"featured_image",value:t.target.value}}),onUpload:Ge,inputRef:Re,previewHeight:130}),e.jsxs("label",{className:"affiliate-create-post-field affiliate-create-post-field-full",children:[e.jsxs("span",{className:"affiliate-create-post-label",children:[e.jsx(ke,{size:16}),"Excerpt"]}),e.jsx("textarea",{className:"affiliate-create-post-input affiliate-create-post-textarea",name:"excerpt",placeholder:"Excerpt",rows:"3",value:i.excerpt,onChange:k})]}),e.jsxs("label",{className:"affiliate-create-post-field",children:[e.jsx("span",{className:"affiliate-create-post-label",children:"SEO title"}),e.jsx("input",{className:"affiliate-create-post-input",name:"seo_title",placeholder:"SEO title",value:i.seo_title,onChange:k})]}),e.jsxs("label",{className:"affiliate-create-post-field",children:[e.jsx("span",{className:"affiliate-create-post-label",children:"Status"}),e.jsxs("select",{className:"affiliate-create-post-input",name:"status",value:i.status,onChange:k,children:[e.jsx("option",{value:"draft",children:"Draft"}),e.jsx("option",{value:"published",children:"Published"}),e.jsx("option",{value:"inactive",children:"Inactive"})]})]}),e.jsxs("label",{className:"affiliate-create-post-field",children:[e.jsx("span",{className:"affiliate-create-post-label",children:"Comments"}),e.jsxs("span",{style:{display:"flex",alignItems:"center",gap:10,minHeight:42},children:[e.jsx("input",{type:"checkbox",checked:!!i.comments_enabled,onChange:t=>b(s=>({...s,comments_enabled:t.target.checked}))}),e.jsx("span",{children:i.comments_enabled?"Comments allowed":"Comments turned off"})]})]}),e.jsxs("label",{className:"affiliate-create-post-field",children:[e.jsx("span",{className:"affiliate-create-post-label",children:"Schedule release"}),e.jsx("input",{className:"affiliate-create-post-input",type:"datetime-local",name:"scheduled_at",value:i.scheduled_at,onChange:k})]}),e.jsxs("label",{className:"affiliate-create-post-field affiliate-create-post-field-full",children:[e.jsx("span",{className:"affiliate-create-post-label",children:"SEO description"}),e.jsx("textarea",{className:"affiliate-create-post-input affiliate-create-post-textarea",name:"seo_description",placeholder:"SEO description",rows:"3",value:i.seo_description,onChange:k})]})]}),e.jsxs("div",{className:"affiliate-create-post-block",children:[e.jsxs("div",{className:"affiliate-create-post-block-head",children:[e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-create-post-panel-kicker",children:"Template fields"}),e.jsx("h3",{className:"affiliate-create-post-block-title",children:$?"Locked content blocks":"Content blocks"})]}),$?e.jsxs("div",{className:"affiliate-create-post-lock-note",children:[e.jsx(X,{size:15}),e.jsx("span",{children:"Structure locked"})]}):null]}),$?e.jsxs("div",{className:"affiliate-create-post-preset-note",children:[e.jsx(Je,{size:16}),e.jsx("span",{children:"All fields are compulsory. Replace every Lepresium value. Minimum words are enforced, suggested maximum is shown only."})]}):null,O(y)?e.jsx(it,{blocks:i.template_fields,onChange:t=>{B(null),b(s=>({...s,template_fields:t}))},uploadImage:ae,disabled:q}):e.jsx("div",{className:"affiliate-create-post-stack",children:Object.entries(We).map(([t,s])=>e.jsxs("div",{className:"affiliate-create-post-section-group",children:[e.jsx("div",{className:"affiliate-create-post-section-title",children:t}),e.jsx("div",{className:"affiliate-create-post-stack",children:s.map(a=>{var h,m,w,I,G,L,de,fe,me,ue,he,xe,ge,be,_e,ye,we,ve,je;const n=a.meta||{},o=n.word_rule,d=a.field_type==="text"||a.field_type==="textarea"?ie(a.field_value,o):null;return Z.current[a.field_key]||(Z.current[a.field_key]={current:null}),e.jsxs("div",{className:"affiliate-create-post-card",children:[e.jsxs("div",{className:"affiliate-create-post-card-top",children:[e.jsx("div",{className:"affiliate-create-post-chip",children:n.label||a.field_key}),e.jsxs("div",{className:`affiliate-create-post-score-pill ${V(((h=S[a.field_key])==null?void 0:h.quality_score)??((m=v[a.field_key])==null?void 0:m.score)??0)}`,children:["Score ",Math.round(((w=S[a.field_key])==null?void 0:w.quality_score)??((I=v[a.field_key])==null?void 0:I.score)??0)]}),n.locked?e.jsxs("div",{className:"affiliate-create-post-chip muted",children:[e.jsx(X,{size:13}),"Locked slot"]}):null]}),e.jsx("div",{className:"affiliate-create-post-form-grid single",children:a.field_type==="image"?e.jsx(Te,{label:n.label||a.field_key,value:a.field_value,placeholder:n.placeholder||"Upload image or paste image URL",uploading:$e===a.field_key,onChange:A=>Y(a.__index,"field_value",A.target.value),onUpload:A=>Oe(a.__index,a.field_key,A),inputRef:Z.current[a.field_key],previewHeight:150}):e.jsxs("label",{className:"affiliate-create-post-field affiliate-create-post-field-full",children:[e.jsx("span",{className:"affiliate-create-post-label",children:n.label||a.field_key}),a.field_type==="textarea"?e.jsx("textarea",{className:"affiliate-create-post-input affiliate-create-post-textarea",rows:"4",placeholder:n.placeholder||"Enter value",value:a.field_value,onChange:A=>Y(a.__index,"field_value",A.target.value)}):e.jsx("input",{className:"affiliate-create-post-input",placeholder:n.placeholder||"Enter value",value:a.field_value,onChange:A=>Y(a.__index,"field_value",A.target.value)})]})}),e.jsxs("div",{className:"affiliate-create-post-review-box",children:[e.jsxs("div",{className:"affiliate-create-post-review-top",children:[e.jsx("div",{className:`affiliate-create-post-review-state ${V(((G=S[a.field_key])==null?void 0:G.quality_score)??((L=v[a.field_key])==null?void 0:L.score)??0)}`,children:V(((de=S[a.field_key])==null?void 0:de.quality_score)??((fe=v[a.field_key])==null?void 0:fe.score)??0)==="good"?"Strong":V(((me=S[a.field_key])==null?void 0:me.quality_score)??((ue=v[a.field_key])==null?void 0:ue.score)??0)==="warn"?"Needs polish":"Fix"}),e.jsxs("div",{className:"affiliate-create-post-review-meta",children:[a.field_type==="text"||a.field_type==="textarea"?`${((he=v[a.field_key])==null?void 0:he.wordCount)||0} words`:"Image field",o?` - ${Pe(o)}`:""]})]}),e.jsx("div",{className:"affiliate-create-post-review-message",children:((xe=S[a.field_key])==null?void 0:xe.warning_message)||((ge=v[a.field_key])==null?void 0:ge.message)||n.helper_text||"Required field"}),(be=S[a.field_key])!=null&&be.warning_suggestion||(_e=v[a.field_key])!=null&&_e.suggestion?e.jsx("div",{className:"affiliate-create-post-review-suggestion",children:((ye=S[a.field_key])==null?void 0:ye.warning_suggestion)||((we=v[a.field_key])==null?void 0:we.suggestion)}):null,((ve=S[a.field_key])==null?void 0:ve.similarity_score)>=1?e.jsxs("div",{className:"affiliate-create-post-review-tag",children:["Similarity check: ",Math.round(((je=S[a.field_key])==null?void 0:je.similarity_score)||0),"%"]}):null]}),e.jsxs("div",{className:"affiliate-create-post-field-meta",children:[e.jsxs("div",{children:[n.helper_text||"Required field",d!=null&&d.message?e.jsx("div",{className:"affiliate-create-post-suggested-note",children:d.message}):null]}),o?e.jsxs("div",{className:`affiliate-create-post-word-rule ${d!=null&&d.ok?"valid":"invalid"}`,children:[e.jsx("span",{children:Pe(o)}),e.jsxs("strong",{children:[(d==null?void 0:d.count)||0," words"]})]}):e.jsx("div",{className:"affiliate-create-post-required-tag",children:n.required?"Required":"Optional"})]})]},a.field_key)})})]},t))})]}),e.jsxs("div",{className:"affiliate-create-post-block",style:O(y)?{display:"none"}:void 0,children:[e.jsxs("div",{className:"affiliate-create-post-block-head",children:[e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-create-post-panel-kicker",children:"CTA buttons"}),e.jsx("h3",{className:"affiliate-create-post-block-title",children:$?"Locked action buttons":"Action buttons"})]}),$?e.jsxs("div",{className:"affiliate-create-post-lock-note",children:[e.jsx(X,{size:15}),e.jsx("span",{children:"Button count locked"})]}):null]}),e.jsx("div",{className:"affiliate-create-post-stack",children:i.cta_buttons.map((t,s)=>{var a,n;return e.jsxs("div",{className:"affiliate-create-post-card",children:[e.jsxs("div",{className:"affiliate-create-post-card-top",children:[e.jsx("div",{className:"affiliate-create-post-chip",children:((a=t==null?void 0:t.meta)==null?void 0:a.label)||t.button_key}),(n=t==null?void 0:t.meta)!=null&&n.locked?e.jsxs("div",{className:"affiliate-create-post-chip muted",children:[e.jsx(X,{size:13}),"Locked slot"]}):null]}),e.jsxs("div",{className:"affiliate-create-post-form-grid",children:[e.jsxs("label",{className:"affiliate-create-post-field",children:[e.jsx("span",{className:"affiliate-create-post-label",children:"Button label"}),e.jsx("input",{className:"affiliate-create-post-input",placeholder:"Button label",value:t.button_label,onChange:o=>J(s,"button_label",o.target.value)})]}),e.jsxs("label",{className:"affiliate-create-post-field",children:[e.jsx("span",{className:"affiliate-create-post-label",children:"Button style"}),e.jsxs("select",{className:"affiliate-create-post-input",value:t.button_style,onChange:o=>J(s,"button_style",o.target.value),children:[e.jsx("option",{value:"primary",children:"Primary"}),e.jsx("option",{value:"secondary",children:"Secondary"})]})]}),e.jsxs("label",{className:"affiliate-create-post-field affiliate-create-post-field-full",children:[e.jsx("span",{className:"affiliate-create-post-label",children:"Button URL"}),e.jsx("input",{className:"affiliate-create-post-input",placeholder:"Button URL",value:t.button_url,onChange:o=>J(s,"button_url",o.target.value)})]}),e.jsxs("label",{className:"affiliate-create-post-check",children:[e.jsx("input",{type:"checkbox",checked:!!t.open_in_new_tab,onChange:o=>J(s,"open_in_new_tab",o.target.checked)}),e.jsx("span",{children:"Open in new tab"})]})]}),e.jsxs("div",{className:"affiliate-create-post-field-meta",children:[e.jsx("div",{children:"External links are allowed. Bloggad checks and records outbound destinations when you save."}),e.jsx("div",{className:"affiliate-create-post-required-tag",children:"Required"})]})]},t.button_key||s)})})]}),le?e.jsxs("div",{className:"affiliate-create-post-alert error",children:[e.jsx(dt,{size:18}),e.jsx("span",{children:le})]}):null,oe?e.jsxs("div",{className:"affiliate-create-post-alert success",children:[e.jsx(ft,{size:18}),e.jsx("span",{children:oe})]}):null,e.jsxs("div",{className:"affiliate-create-post-actions",children:[e.jsxs("button",{className:"affiliate-create-post-btn primary",type:"submit",disabled:q,children:[e.jsx(Se,{size:16}),q?"Saving...":"Create Post"]}),e.jsx(Xe,{className:"affiliate-create-post-btn secondary",to:`${u}/posts`,children:"View My Posts"})]})]})]}),e.jsxs("div",{className:"affiliate-create-post-side-stack",children:[e.jsx(st,{accessType:F.access_type,canUsePremiumPosts:N.can_use_premium_posts,capabilityLoaded:N.loaded,estimatedReadSeconds:D,freePreviewSeconds:F.free_preview_seconds,disabled:q,onAccessTypeChange:t=>j(s=>({...s,access_type:t})),onFreePreviewSecondsChange:t=>j(s=>({...s,free_preview_seconds:t})),onUpgrade:()=>r(u==="/writer"?"/writer/plan":"/affiliate/subscription")}),e.jsxs("div",{className:"affiliate-create-post-panel",children:[e.jsx("div",{className:"affiliate-create-post-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-create-post-panel-kicker",children:"Summary"}),e.jsx("h2",{className:"affiliate-create-post-panel-title",children:"Post overview"})]})}),e.jsxs("div",{className:"affiliate-create-post-summary",children:[e.jsxs("div",{className:"affiliate-create-post-summary-row",children:[e.jsx("span",{children:"Title"}),e.jsx("strong",{children:i.title||"-"})]}),e.jsxs("div",{className:"affiliate-create-post-summary-row",children:[e.jsx("span",{children:"Product"}),e.jsx("strong",{children:(M==null?void 0:M.title)||"-"})]}),e.jsxs("div",{className:"affiliate-create-post-summary-row",children:[e.jsx("span",{children:"Category"}),e.jsx("strong",{children:(ee==null?void 0:ee.name)||"-"})]}),e.jsxs("div",{className:"affiliate-create-post-summary-row",children:[e.jsx("span",{children:"Template"}),e.jsx("strong",{children:(y==null?void 0:y.name)||"-"})]}),e.jsxs("div",{className:"affiliate-create-post-summary-row",children:[e.jsx("span",{children:"Mode"}),e.jsx("strong",{children:O(y)?"Simple Writer workroom":$?"Locked template editor":"Generic field editor"})]}),e.jsxs("div",{className:"affiliate-create-post-summary-row",children:[e.jsx("span",{children:"Status"}),e.jsx("strong",{children:e.jsx("span",{className:ze(i.status),children:i.status||"-"})})]}),e.jsxs("div",{className:"affiliate-create-post-summary-row",children:[e.jsx("span",{children:"Fields"}),e.jsx("strong",{children:i.template_fields.length})]}),e.jsxs("div",{className:"affiliate-create-post-summary-row",children:[e.jsx("span",{children:"CTA Buttons"}),e.jsx("strong",{children:i.cta_buttons.length})]})]})]}),e.jsxs("div",{className:"affiliate-create-post-panel",style:O(y)?{display:"none"}:void 0,children:[e.jsx("div",{className:"affiliate-create-post-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-create-post-panel-kicker",children:"Live quality"}),e.jsx("h2",{className:"affiliate-create-post-panel-title",children:"Score board"})]})}),e.jsxs("div",{className:"affiliate-create-post-quality-box",children:[e.jsx("div",{className:"affiliate-create-post-quality-score",children:Be}),e.jsxs("div",{className:"affiliate-create-post-quality-text",children:[Ie,"/",i.template_fields.length," fields currently passing"]}),e.jsxs("div",{className:"affiliate-create-post-quality-meta",children:["Total text words: ",te," - Similarity review starts fully from 100 words"]})]})]}),e.jsxs("div",{className:"affiliate-create-post-panel",children:[e.jsx("div",{className:"affiliate-create-post-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-create-post-panel-kicker",children:"Link policy"}),e.jsx("h2",{className:"affiliate-create-post-panel-title",children:"Outbound links"})]})}),e.jsx("div",{className:"affiliate-create-post-summary",children:e.jsx("div",{className:"affiliate-create-post-plan-note",children:"Free and paid Writers can use legitimate external links. Prohibited destinations may be blocked or reviewed."})})]}),P?e.jsxs("div",{className:"affiliate-create-post-panel",children:[e.jsx("div",{className:"affiliate-create-post-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-create-post-panel-kicker",children:"Latest server review"}),e.jsx("h2",{className:"affiliate-create-post-panel-title",children:"Review result"})]})}),e.jsxs("div",{className:"affiliate-create-post-summary",children:[e.jsxs("div",{className:"affiliate-create-post-summary-row",children:[e.jsx("span",{children:"Review status"}),e.jsx("strong",{children:P.review_status||"-"})]}),e.jsxs("div",{className:"affiliate-create-post-summary-row",children:[e.jsx("span",{children:"Quality score"}),e.jsx("strong",{children:Math.round(P.quality_score||0)})]}),e.jsxs("div",{className:"affiliate-create-post-summary-row",children:[e.jsx("span",{children:"Risk score"}),e.jsx("strong",{children:Math.round(P.risk_score||0)})]}),e.jsxs("div",{className:"affiliate-create-post-summary-row",children:[e.jsx("span",{children:"Similarity score"}),e.jsxs("strong",{children:[Math.round(P.similarity_score||0),"%"]})]}),P.blocked_reason?e.jsx("div",{className:"affiliate-create-post-server-warning",children:P.blocked_reason}):null]})]}):null,e.jsxs("div",{className:"affiliate-create-post-panel",children:[e.jsx("div",{className:"affiliate-create-post-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-create-post-panel-kicker",children:"Preview"}),e.jsx("h2",{className:"affiliate-create-post-panel-title",children:"Featured image"})]})}),i.featured_image?e.jsx("img",{src:i.featured_image,alt:i.title||"Post preview",className:"affiliate-create-post-preview-image"}):e.jsxs("div",{className:"affiliate-create-post-preview-empty",children:[e.jsx(Ce,{size:26}),e.jsx("span",{children:"No featured image"})]})]})]})]})]})}const qe=`
  * {
    box-sizing: border-box;
  }

  .affiliate-create-post-page {
    width: 100%;
    color: #111827;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .affiliate-create-post-page button,
  .affiliate-create-post-page input,
  .affiliate-create-post-page select,
  .affiliate-create-post-page textarea {
    font: inherit;
  }

  .affiliate-create-post-loading-wrap {
    min-height: 58vh;
    display: grid;
    place-items: center;
  }

  .affiliate-create-post-loading-card {
    min-width: 230px;
    padding: 22px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
    text-align: center;
  }

  .affiliate-create-post-loading-card p {
    margin: 10px 0 0;
    color: #6b7280;
    font-size: 11px;
    font-weight: 600;
  }

  .affiliate-create-post-spinner,
  .affiliate-create-post-spin {
    animation: affiliateCreatePostSpin 0.8s linear infinite;
  }

  .affiliate-create-post-spinner {
    width: 32px;
    height: 32px;
    margin: 0 auto;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    border-radius: 999px;
  }

  @keyframes affiliateCreatePostSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .affiliate-create-post-command {
    min-height: 60px;
    margin-bottom: 12px;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
  }

  .affiliate-create-post-command-left,
  .affiliate-create-post-command-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .affiliate-create-post-command-left {
    min-width: 0;
  }

  .affiliate-create-post-command-left > strong {
    font-size: 16px;
    line-height: 1.2;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .affiliate-create-post-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
    gap: 12px;
    align-items: start;
  }

  .affiliate-create-post-side-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: sticky;
    top: 12px;
  }

  .affiliate-create-post-panel {
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
    box-shadow: none;
  }

  .affiliate-create-post-panel-head,
  .affiliate-create-post-block-head {
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .affiliate-create-post-panel-kicker {
    display: none;
  }

  .affiliate-create-post-panel-title,
  .affiliate-create-post-block-title {
    margin: 0;
    color: #111827;
    font-size: 13px;
    line-height: 1.25;
    font-weight: 600;
    letter-spacing: 0;
  }

  .affiliate-create-post-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-create-post-form-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 10px;
  }

  .affiliate-create-post-form-grid > :nth-child(1),
  .affiliate-create-post-form-grid > :nth-child(2),
  .affiliate-create-post-form-grid > :nth-child(3) {
    grid-column: span 2;
  }

  .affiliate-create-post-form-grid > :nth-child(4),
  .affiliate-create-post-form-grid > :nth-child(5),
  .affiliate-create-post-form-grid > :nth-child(6),
  .affiliate-create-post-form-grid > :nth-child(7) {
    grid-column: span 3;
  }

  .affiliate-create-post-form-grid > :nth-child(8),
  .affiliate-create-post-form-grid > :nth-child(12),
  .affiliate-create-post-form-grid > :nth-child(13) {
    grid-column: span 2;
  }

  .affiliate-create-post-form-grid > :nth-child(9),
  .affiliate-create-post-form-grid > :nth-child(10),
  .affiliate-create-post-form-grid > :nth-child(11),
  .affiliate-create-post-form-grid > :nth-child(14) {
    grid-column: span 3;
  }

  .affiliate-create-post-form-grid.single {
    grid-template-columns: 1fr;
  }

  .affiliate-create-post-form-grid.single > * {
    grid-column: auto;
  }

  .affiliate-create-post-field,
  .affiliate-create-post-upload-field {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .affiliate-create-post-field-full {
    grid-column: 1 / -1 !important;
  }

  .affiliate-create-post-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #6b7280;
    font-size: 9px;
    line-height: 1.2;
    font-weight: 600;
    letter-spacing: 0.025em;
    text-transform: uppercase;
  }

  .affiliate-create-post-label svg {
    width: 13px;
    height: 13px;
    color: #6b7280;
  }

  .affiliate-create-post-input {
    width: 100%;
    min-height: 42px;
    padding: 0 12px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    outline: 0;
    background: #ffffff;
    color: #111827;
    font-size: 11px;
    line-height: 1.4;
    font-weight: 500;
    transition: border-color 140ms ease, box-shadow 140ms ease;
  }

  .affiliate-create-post-input::placeholder {
    color: #6b7280;
    opacity: 1;
  }

  .affiliate-create-post-input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.06);
  }

  .affiliate-create-post-textarea {
    min-height: 78px;
    padding: 10px 12px;
    resize: vertical;
  }

  .affiliate-create-post-upload-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    align-items: end;
  }

  .affiliate-create-post-upload-btn {
    min-height: 38px;
    padding: 0 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: 1px solid #111827;
    border-radius: 10px;
    background: #111827;
    color: #ffffff;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
  }

  .affiliate-create-post-upload-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .affiliate-create-post-inline-preview {
    width: 100%;
    padding: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #f8fafc;
  }

  .affiliate-create-post-inline-preview img {
    border-radius: 9px !important;
  }

  .affiliate-create-post-block {
    width: 100%;
    min-width: 0;
    margin-top: 2px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    border: 1px solid #dfe3e8;
    border-radius: 14px;
    background: #ffffff;
  }

  .affiliate-create-post-block + .affiliate-create-post-block {
    margin-top: 0;
  }

  .affiliate-create-post-block-head {
    width: 100%;
    margin-bottom: 0;
    padding-bottom: 2px;
  }

  .affiliate-create-post-block-title {
    font-size: 15px;
    line-height: 1.35;
    font-weight: 650;
  }

  .affiliate-create-post-stack {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .affiliate-create-post-section-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .affiliate-create-post-section-title {
    padding: 2px 0;
    color: #111827;
    font-size: 11px;
    line-height: 1.3;
    font-weight: 600;
  }

  .affiliate-create-post-card {
    padding: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #ffffff;
  }

  .affiliate-create-post-card-top {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .affiliate-create-post-chip,
  .affiliate-create-post-lock-note,
  .affiliate-create-post-score-pill,
  .affiliate-create-post-review-state,
  .affiliate-create-post-word-rule,
  .affiliate-create-post-required-tag,
  .affiliate-create-post-status {
    min-height: 25px;
    padding: 0 9px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    background: #f8fafc;
    color: #6b7280;
    font-size: 9px;
    line-height: 1;
    font-weight: 600;
  }

  .affiliate-create-post-score-pill {
    margin-left: auto;
  }

  .affiliate-create-post-status {
    text-transform: capitalize;
  }

  .affiliate-create-post-status.active,
  .affiliate-create-post-score-pill.good,
  .affiliate-create-post-review-state.good,
  .affiliate-create-post-word-rule.valid {
    border-color: #abefc6;
    background: #ecfdf3;
    color: #027a48;
  }

  .affiliate-create-post-status.draft,
  .affiliate-create-post-status.neutral {
    border-color: #e5e7eb;
    background: #f8fafc;
    color: #6b7280;
  }

  .affiliate-create-post-status.inactive,
  .affiliate-create-post-score-pill.warn,
  .affiliate-create-post-review-state.warn,
  .affiliate-create-post-word-rule.invalid {
    border-color: #fed7aa;
    background: #fff7ed;
    color: #b54708;
  }

  .affiliate-create-post-score-pill.bad,
  .affiliate-create-post-review-state.bad {
    border-color: #fecaca;
    background: #fef2f2;
    color: #b42318;
  }

  .affiliate-create-post-preset-note {
    margin-bottom: 10px;
    padding: 10px 12px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    border: 1px solid #fde68a;
    border-radius: 10px;
    background: #fffbeb;
    color: #92400e;
    font-size: 10px;
    line-height: 1.5;
    font-weight: 600;
  }

  .affiliate-create-post-field-meta,
  .affiliate-create-post-review-top {
    margin-top: 9px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
    color: #6b7280;
    font-size: 9px;
    line-height: 1.45;
  }

  .affiliate-create-post-review-box {
    margin-top: 9px;
    padding: 10px;
    display: grid;
    gap: 6px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #ffffff;
  }

  .affiliate-create-post-review-message {
    color: #111827;
    font-size: 10px;
    line-height: 1.45;
    font-weight: 600;
  }

  .affiliate-create-post-review-suggestion,
  .affiliate-create-post-review-meta,
  .affiliate-create-post-suggested-note {
    color: #6b7280;
    font-size: 9px;
    line-height: 1.45;
  }

  .affiliate-create-post-review-tag {
    width: fit-content;
    padding: 5px 8px;
    border-radius: 999px;
    background: #f8fafc;
    color: #6b7280;
    font-size: 9px;
    font-weight: 600;
  }

  .affiliate-create-post-check {
    min-height: 42px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    background: #ffffff;
    color: #111827;
    font-size: 10px;
    font-weight: 600;
  }

  .affiliate-create-post-alert {
    padding: 11px 12px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    border-radius: 10px;
    font-size: 11px;
    line-height: 1.45;
    font-weight: 600;
  }

  .affiliate-create-post-alert.error {
    border: 1px solid #fed7aa;
    background: #fff7ed;
    color: #9a3412;
  }

  .affiliate-create-post-alert.success {
    border: 1px solid #abefc6;
    background: #ecfdf3;
    color: #027a48;
  }

  .affiliate-create-post-actions {
    padding-top: 2px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .affiliate-create-post-btn {
    min-height: 38px;
    padding: 0 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    background: #ffffff;
    color: #111827;
    font-size: 11px;
    line-height: 1;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
  }

  .affiliate-create-post-btn.primary {
    border-color: #111827;
    background: #111827;
    color: #ffffff;
  }

  .affiliate-create-post-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .affiliate-create-post-summary {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .affiliate-create-post-summary-row {
    min-height: 32px;
    padding: 5px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  .affiliate-create-post-summary-row span {
    color: #6b7280;
    font-size: 10px;
    line-height: 1.3;
    font-weight: 500;
  }

  .affiliate-create-post-summary-row strong {
    max-width: 62%;
    color: #111827;
    font-size: 10px;
    line-height: 1.35;
    font-weight: 600;
    text-align: right;
    overflow-wrap: anywhere;
  }

  .affiliate-create-post-preview-image,
  .affiliate-create-post-preview-empty {
    width: 100%;
    height: 190px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #f8fafc;
  }

  .affiliate-create-post-preview-image {
    display: block;
    object-fit: cover;
  }

  .affiliate-create-post-preview-empty {
    display: grid;
    place-items: center;
    gap: 6px;
    color: #6b7280;
    font-size: 10px;
    text-align: center;
  }

  .affiliate-create-post-quality-box {
    padding: 0;
    border-radius: 0;
    background: transparent;
    color: #111827;
  }

  .affiliate-create-post-quality-score {
    margin-bottom: 7px;
    color: #111827;
    font-size: 34px;
    line-height: 1;
    font-weight: 700;
  }

  .affiliate-create-post-quality-text {
    margin-bottom: 4px;
    color: #111827;
    font-size: 10px;
    line-height: 1.4;
    font-weight: 600;
  }

  .affiliate-create-post-quality-meta,
  .affiliate-create-post-plan-note,
  .affiliate-create-post-server-warning {
    color: #6b7280;
    font-size: 9px;
    line-height: 1.5;
  }

  .affiliate-create-post-server-warning {
    color: #b42318;
    font-weight: 600;
  }

  .affiliate-create-post-block > div[style] {
    width: 100% !important;
    min-width: 0 !important;
    gap: 12px !important;
    align-items: stretch !important;
  }

  .affiliate-create-post-block > div[style] > * {
    min-width: 0 !important;
  }

  .affiliate-create-post-block button:not(.affiliate-create-post-upload-btn) {
    min-height: 32px !important;
    padding: 0 11px !important;
    border: 1px solid #dfe3e8 !important;
    border-radius: 9px !important;
    background: #f8fafc !important;
    color: #475467 !important;
    font-size: 11px !important;
    line-height: 1 !important;
    font-weight: 600 !important;
    box-shadow: none !important;
  }

  .affiliate-create-post-block button:not(.affiliate-create-post-upload-btn):hover {
    border-color: #c8cfd8 !important;
    background: #f3f4f6 !important;
    color: #111827 !important;
  }

  .affiliate-create-post-block input:not([type="file"]),
  .affiliate-create-post-block textarea {
    width: 100% !important;
    min-width: 0 !important;
    border: 1px solid #cfd5dd !important;
    border-radius: 10px !important;
    background: #ffffff !important;
    color: #111827 !important;
    font-size: 15px !important;
    line-height: 1.55 !important;
    font-weight: 400 !important;
    box-shadow: none !important;
  }

  .affiliate-create-post-block input:not([type="file"]) {
    min-height: 44px !important;
    padding: 0 12px !important;
  }

  .affiliate-create-post-block textarea {
    min-height: 132px !important;
    padding: 12px 13px !important;
    resize: vertical !important;
  }

  .affiliate-create-post-block input:not([type="file"])::placeholder,
  .affiliate-create-post-block textarea::placeholder {
    color: #98a2b3 !important;
    opacity: 1 !important;
  }

  .affiliate-create-post-block input:not([type="file"]):focus,
  .affiliate-create-post-block textarea:focus {
    border-color: #111827 !important;
    outline: 0 !important;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.06) !important;
  }

  .affiliate-create-post-block input[type="file"] {
    width: 100% !important;
    min-height: 42px !important;
    padding: 5px !important;
    border: 1px solid #d1d5db !important;
    border-radius: 10px !important;
    background: #ffffff !important;
    color: #475467 !important;
    font-size: 11px !important;
  }

  .affiliate-create-post-block input[type="file"]::file-selector-button {
    min-height: 30px;
    margin-right: 10px;
    padding: 0 11px;
    border: 0;
    border-radius: 7px;
    background: #111827;
    color: #ffffff;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
  }

  .affiliate-create-post-block label,
  .affiliate-create-post-block .affiliate-create-post-label {
    font-size: 10px !important;
    line-height: 1.3 !important;
  }

  .affiliate-create-post-block img {
    width: 100%;
    max-width: 100%;
    border-radius: 10px !important;
  }

  @media (max-width: 1100px) {
    .affiliate-create-post-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-create-post-side-stack {
      position: static;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 767px) {
    .affiliate-create-post-command {
      min-height: 52px;
      margin-bottom: 10px;
      padding: 8px 12px;
      border-radius: 12px;
    }

    .affiliate-create-post-command-left > strong {
      font-size: 14px;
    }

    .affiliate-create-post-command-left .affiliate-create-post-status {
      display: none;
    }

    .affiliate-create-post-command-actions {
      gap: 6px;
    }

    .affiliate-create-post-command-actions .affiliate-create-post-btn {
      min-height: 36px;
      padding: 0 11px;
      font-size: 10px;
    }

    .affiliate-create-post-command-actions .affiliate-create-post-btn svg {
      display: none;
    }

    .affiliate-create-post-grid {
      gap: 10px;
    }

    .affiliate-create-post-panel {
      padding: 14px;
      border-radius: 14px;
    }

    .affiliate-create-post-form-grid {
      grid-template-columns: 1fr;
      gap: 9px;
    }

    .affiliate-create-post-form-grid > * {
      grid-column: auto !important;
    }

    .affiliate-create-post-label {
      font-size: 8px;
    }

    .affiliate-create-post-input {
      min-height: 40px;
      border-radius: 9px;
      font-size: 10px;
    }

    .affiliate-create-post-textarea {
      min-height: 72px;
    }

    .affiliate-create-post-upload-row {
      grid-template-columns: 1fr;
    }

    .affiliate-create-post-upload-btn {
      width: 100%;
      min-height: 36px;
      border-radius: 9px;
      font-size: 10px;
    }

    .affiliate-create-post-block {
      padding: 13px;
      gap: 10px;
    }

    .affiliate-create-post-block-title {
      font-size: 14px;
    }

    .affiliate-create-post-block input:not([type="file"]),
    .affiliate-create-post-block textarea {
      font-size: 14px !important;
    }

    .affiliate-create-post-block textarea {
      min-height: 120px !important;
    }

    .affiliate-create-post-block button:not(.affiliate-create-post-upload-btn) {
      min-height: 32px !important;
      font-size: 11px !important;
    }

    .affiliate-create-post-card {
      padding: 11px;
    }

    .affiliate-create-post-side-stack {
      display: flex;
    }

    .affiliate-create-post-summary-row {
      min-height: 30px;
    }

    .affiliate-create-post-preview-image,
    .affiliate-create-post-preview-empty {
      height: 170px;
    }

    .affiliate-create-post-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-create-post-actions .affiliate-create-post-btn {
      width: 100%;
      min-height: 36px;
    }

    .affiliate-create-post-panel-main .affiliate-create-post-panel-head {
      margin-bottom: 10px;
    }

    .affiliate-create-post-block-head {
      align-items: center;
      flex-direction: row;
    }
  }

  @media (max-width: 420px) {
    .affiliate-create-post-command {
      gap: 8px;
    }

    .affiliate-create-post-command-actions .affiliate-create-post-btn {
      padding: 0 9px;
    }

    .affiliate-create-post-panel {
      padding: 12px;
    }

    .affiliate-create-post-block {
      padding: 12px;
    }

    .affiliate-create-post-block textarea {
      min-height: 112px !important;
    }
  }
`;export{Rt as default};
