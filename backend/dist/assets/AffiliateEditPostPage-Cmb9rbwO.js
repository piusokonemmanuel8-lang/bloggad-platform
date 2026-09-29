import{e as He,b as Ve,f as Ke,r as h,j as e,F as be,g as Qe,i as Ye,L as Je,a as U}from"./index-LXBBJt7I.js";import{r as de,e as Xe,b as Ze,W as et,a as tt,L as ee,S as it,c as at,d as st,g as lt}from"./index-B9QkUffi.js";import{S as ye}from"./save-Co8lXD7U.js";import{P as ot}from"./package-BZvUXVf6.js";import{F as rt}from"./folder-kanban-DTsEeGVX.js";import{T as nt}from"./type-B_PWcmvg.js";import{L as dt}from"./link-CCVOqyaN.js";import{I as we}from"./image-DDgd2sPC.js";import{C as pt}from"./circle-alert-DsZo9igC.js";import{C as ft}from"./circle-check-ml_0upGj.js";import{A as ct}from"./arrow-left-DFMkwbNZ.js";import{L as mt}from"./loader-circle-CwBAc5Ia.js";import{U as ut}from"./upload-WKtBKnBi.js";import"./clock-3-BV9St-rB.js";import"./crown-CqvQp2si.js";function je(s=""){const l=String(s).toLowerCase();return l==="published"||l==="active"?"affiliate-edit-post-status active":l==="draft"||l==="pending"?"affiliate-edit-post-status draft":l==="inactive"?"affiliate-edit-post-status inactive":"affiliate-edit-post-status neutral"}function R(s){return lt(s).replace(/\s+/g," ").trim()}function V(s){const l=R(s);return l?l.split(" ").filter(Boolean).length:0}function ht(s){return s?s.mode==="exact"?`${s.exact_words} words exact`:`min ${s.min_words} words - suggested max ${s.max_words}`:""}function pe(s,l){if(!l)return{ok:!0,count:V(s),message:""};const d=V(s);if(l.mode==="exact")return d!==Number(l.exact_words||0)?{ok:!1,count:d,message:`${l.label} must be exactly ${l.exact_words} words`}:{ok:!0,count:d,message:""};const p=Number(l.min_words||0),r=Number(l.max_words||0);return d<p?{ok:!1,count:d,message:`${l.label} must be at least ${p} words`}:{ok:!0,count:d,message:r>0&&d>r?`${l.label} is above suggested max ${r} words`:""}}const xt="simple_writer_template_v1";function H(s){return String((s==null?void 0:s.template_code_key)||"").toLowerCase()===xt}function gt(s){if(!s)return"";const l=new Date(s);return Number.isNaN(l.getTime())?"":new Date(l.getTime()-l.getTimezoneOffset()*6e4).toISOString().slice(0,16)}function _t(){return[{field_key:"headline",field_type:"text",field_value:"",sort_order:1,meta:{label:"Headline",section:"Generic fields",helper_text:"Generic text field.",required:!0,word_rule:null,placeholder:"Enter headline",locked:!1}},{field_key:"subheadline",field_type:"text",field_value:"",sort_order:2,meta:{label:"Subheadline",section:"Generic fields",helper_text:"Generic text field.",required:!0,word_rule:null,placeholder:"Enter subheadline",locked:!1}},{field_key:"content_block_1",field_type:"textarea",field_value:"",sort_order:3,meta:{label:"Content block 1",section:"Generic fields",helper_text:"Generic textarea field.",required:!0,word_rule:null,placeholder:"Enter content",locked:!1}},{field_key:"content_block_2",field_type:"textarea",field_value:"",sort_order:4,meta:{label:"Content block 2",section:"Generic fields",helper_text:"Generic textarea field.",required:!0,word_rule:null,placeholder:"Enter content",locked:!1}}]}function bt(){return[{button_key:"primary_cta",button_label:"Buy Now",button_url:"",button_style:"primary",open_in_new_tab:!0,sort_order:1,meta:{label:"Primary CTA",helper_text:"Generic CTA button.",required:!0,locked:!1}},{button_key:"secondary_cta",button_label:"Learn More",button_url:"",button_style:"secondary",open_in_new_tab:!0,sort_order:2,meta:{label:"Secondary CTA",helper_text:"Generic CTA button.",required:!0,locked:!1}}]}function ve(s,l){const d=new Map((l||[]).map(p=>[String(p.field_key||"").trim(),p]));return s.map(p=>{const r=d.get(String(p.field_key||"").trim());return{field_key:p.field_key,field_type:p.field_type,field_value:r&&r.field_value!==void 0&&r.field_value!==null?r.field_value:p.field_value,sort_order:p.sort_order,meta:p.meta}})}function ke(s,l){const d=new Map((l||[]).map(p=>[String(p.button_key||"").trim(),p]));return s.map(p=>{const r=d.get(String(p.button_key||"").trim());return{button_key:p.button_key,button_label:r&&r.button_label!==void 0&&r.button_label!==null?r.button_label:p.button_label,button_url:r&&r.button_url!==void 0&&r.button_url!==null?r.button_url:p.button_url,button_style:r&&r.button_style!==void 0&&r.button_style!==null?r.button_style:p.button_style,open_in_new_tab:r&&r.open_in_new_tab!==void 0?!!r.open_in_new_tab:p.open_in_new_tab,sort_order:p.sort_order,meta:p.meta}})}function Ne({label:s,value:l,placeholder:d,uploading:p,onChange:r,onUpload:_,inputRef:j,previewHeight:M=120}){return e.jsxs("div",{className:"affiliate-edit-post-upload-field",children:[e.jsx("label",{className:"affiliate-edit-post-label",children:s}),e.jsxs("div",{className:"affiliate-edit-post-upload-row",children:[e.jsx("input",{className:"affiliate-edit-post-input",placeholder:d,value:l,onChange:r}),e.jsxs("button",{type:"button",className:"affiliate-edit-post-upload-btn",disabled:p,onClick:()=>{var w;return(w=j==null?void 0:j.current)==null?void 0:w.click()},children:[p?e.jsx(mt,{size:16,className:"affiliate-edit-post-spin"}):e.jsx(ut,{size:16}),p?"Uploading...":"Upload"]}),e.jsx("input",{ref:j,type:"file",accept:"image/*",hidden:!0,onChange:_})]}),l?e.jsx("div",{className:"affiliate-edit-post-inline-preview",children:e.jsx("img",{src:l,alt:"Preview",style:{width:"100%",height:M,objectFit:"cover",borderRadius:14}})}):null]})}function Se(s){const l=String(s||"").trim();if(!l)return!1;try{const d=/^https?:\/\//i.test(l)?l:`https://${l}`;return!!new URL(d).hostname}catch{return!1}}function yt(s){const l=String((s==null?void 0:s.field_key)||"").trim().toLowerCase();return l.startsWith("simple_writer_link_")||l.startsWith("simple_writer_video_")}function wt(s){const l=String((s==null?void 0:s.field_value)||"").trim();if(!l||!yt(s))return l;try{const d=JSON.parse(l);if(d&&typeof d=="object"&&typeof d.url=="string")return d.url.trim()}catch{}return l}function jt(s){const l=String((s==null?void 0:s.field_type)||"").trim().toLowerCase(),d=String((s==null?void 0:s.field_key)||"").trim().toLowerCase();return l==="url"?!0:d.endsWith("_url")||d.endsWith("_link_url")||d==="url"||d==="link_url"||d==="destination_url"}function vt(s){const l=R(s).toLowerCase().replace(/[^a-z0-9\s]/g," ").split(/\s+/).filter(Boolean);if(!l.length)return 0;const d=new Map;l.forEach(r=>d.set(r,(d.get(r)||0)+1));let p=0;return d.forEach(r=>{r>2&&(p+=r-2)}),p}function kt(s){const l=R(s).toLowerCase();return["in today's world","when it comes to","one of the best","game changer","unlock the power","this product is designed to","take your journey to the next level","whether you are","it is important to note","helps support your overall wellness"].reduce((p,r)=>p+(l.includes(r)?1:0),0)}function Nt(s,l=""){const d=R(s);let p=0;return d?(/\d/.test(d)&&(p+=1),/%|\$|\u2026|\u00A3|\u20AC/.test(d)&&(p+=1),/\bfor example\b|\bfor instance\b|\bsuch as\b|\bespecially\b/i.test(d)&&(p+=1),d.includes(":")&&(p+=1),R(l).toLowerCase().split(/\s+/).filter(_=>_.length>2).forEach(_=>{d.toLowerCase().includes(_)&&(p+=1)}),p):0}function ze(s){return s>=75?"good":s>=60?"warn":"bad"}function St(s){const l={};if(!s)return l;const d=Array.isArray(s.field_scores)?s.field_scores:[],p=Array.isArray(s.warnings)?s.warnings:[];return d.forEach(r=>{l[r.field_key]={...l[r.field_key]||{},quality_score:Number(r.quality_score||0),risk_score:Number(r.risk_score||0),similarity_score:Number(r.similarity_score||0),passed:!!r.passed,warning_code:r.warning_code||null,warning_message:r.warning_message||""}}),p.forEach(r=>{var _,j;l[r.field_key]={...l[r.field_key]||{},warning_type:r.warning_type||null,warning_message:r.message||((_=l[r.field_key])==null?void 0:_.warning_message)||"",warning_suggestion:r.suggestion||"",similarity_score:Number(r.similarity_score||((j=l[r.field_key])==null?void 0:j.similarity_score)||0)}}),l}function Ct({field:s,totalTextWords:l,productTitle:d}){const p=s.meta||{},r=String(s.field_type||"").toLowerCase(),_=String(s.field_value||""),j=R(_),M=r==="text"||r==="textarea"?V(_):0,w=p.word_rule||null,K=pe(_,w),v=r==="text"||r==="textarea"?kt(_):0,L=r==="text"||r==="textarea"?vt(_):0,B=r==="text"||r==="textarea"?Nt(_,d):0;if(r==="image"){const b=!!j;return{score:b?100:0,tone:b?"good":"bad",message:b?"Image slot filled.":"This image slot is required.",suggestion:b?"":"Upload an image or paste an image URL.",wordCount:0,started:l>=100,passed:b}}if(!j)return{score:0,tone:"bad",message:`${p.label||s.field_key} is empty.`,suggestion:"Add content to continue.",wordCount:M,started:l>=100,passed:!1};let C=100,P="Strong section.",k="",i=!0;return w&&!K.ok&&(C-=45,P=K.message,k="Add more words before saving.",i=!1),v>0&&(C-=v*10,i&&(P="This section sounds too generic.",k="Add a real example or a clearer product-specific point.")),L>0&&(C-=Math.min(18,L*4),i&&!v&&(P="This section repeats wording too much.",k="Vary sentence pattern and remove repeated phrases.")),B<1&&M>=20&&(C-=12,i&&!v&&!L&&(P="This section needs more original detail.",k="Add a concrete detail, number, example, or product reference.")),(w==null?void 0:w.mode)==="range"&&w.max_words&&M>Number(w.max_words)&&i&&!v&&!L&&(P=`${p.label||s.field_key} is above suggested max ${w.max_words} words.`,k="You can keep it, but shorter text may fit the template better."),l<100&&i&&(P="Live quality preview is warming up.",k="Similarity review starts properly after the post reaches 100 total words."),C=Math.max(0,Math.min(100,C)),{score:C,tone:ze(C),message:P,suggestion:k,wordCount:M,started:l>=100,passed:i}}function Rt(){const s=He(),l=Ve(),{id:d}=Ke(),p=l.pathname.startsWith("/writer")?"/writer":"/affiliate",[r,_]=h.useState([]),[j,M]=h.useState([]),[w,K]=h.useState([]),[v,L]=h.useState({access_type:"free",free_preview_seconds:0,preview_percent:100}),[B,C]=h.useState({loaded:!1,can_use_premium_posts:!1}),[P,k]=h.useState(!1),[i,b]=h.useState({content_type:"article",product_id:"",category_id:"",topic_ids:[],page_ids:[],show_on_storefront:!1,template_id:"",title:"",slug:"",excerpt:"",seo_title:"",seo_description:"",featured_image:"",status:"draft",comments_enabled:!0,scheduled_at:"",template_fields:[],cta_buttons:[]}),[Le,fe]=h.useState(!0),[q,ce]=h.useState(!1),[me,F]=h.useState(""),[ue,A]=h.useState(""),[Pe,he]=h.useState(!1),[Te,xe]=h.useState(""),[T,G]=h.useState(null),[zt,Ee]=h.useState({loaded:!1,allow_external_links:!1}),Me=h.useRef(null),te=h.useRef({}),$=h.useMemo(()=>r.find(t=>String(t.id)===String(i.product_id)),[r,i.product_id]),S=h.useMemo(()=>j.find(t=>String(t.id)===String(i.template_id)),[j,i.template_id]),ie=h.useMemo(()=>w.find(t=>String(t.id)===String(i.category_id)),[w,i.category_id]),W=h.useMemo(()=>de(S),[S]),Fe=h.useMemo(()=>i.template_fields.reduce((t,o,a)=>{var f;const n=((f=o==null?void 0:o.meta)==null?void 0:f.section)||"Template fields";return t[n]||(t[n]=[]),t[n].push({...o,__index:a}),t},{}),[i.template_fields]),Q=h.useMemo(()=>i.template_fields.reduce((t,o)=>{const a=String(o.field_type||"").toLowerCase();return a!=="text"&&a!=="textarea"?t:t+V(o.field_value)},0),[i.template_fields]),I=h.useMemo(()=>Xe(i.template_fields),[i.template_fields]);h.useEffect(()=>{L(t=>{if(t.access_type!=="premium")return t;const o=Math.max(0,I-1),a=Number(t.free_preview_seconds||0),n=Math.max(0,Math.min(95,Number(t.preview_percent||0))),f=o>0&&n>0?Math.max(1,Math.floor(I*n/100)):0,c=o>0?Math.min(o,Math.max(1,a||f||st(I))):0;return c===a?t:{...t,free_preview_seconds:c}})},[I]);const D=h.useMemo(()=>{const t={};return i.template_fields.forEach(o=>{t[o.field_key]=Ct({field:o,totalTextWords:Q,productTitle:($==null?void 0:$.title)||i.title})}),t},[i.template_fields,Q,$,i.title]),Ue=h.useMemo(()=>St(T),[T]),qe=h.useMemo(()=>{const t=Object.values(D);return t.length?Math.round(t.reduce((o,a)=>o+Number(a.score||0),0)/t.length):0},[D]),Ae=h.useMemo(()=>Object.values(D).filter(t=>t.passed).length,[D]),ae=t=>{t!=null&&t.quality_review&&G(t.quality_review),t!=null&&t.link_permissions&&Ee({loaded:!0,allow_external_links:!!t.link_permissions.allow_external_links})};h.useEffect(()=>{(async()=>{var o,a,n,f,c,u,m,y,ge;try{fe(!0);const[z,le,oe,re,E]=await Promise.all([U.get(`/api/affiliate/posts/${d}`),U.get("/api/affiliate/products"),U.get("/api/affiliate/templates/blog"),U.get("/api/public/categories"),U.get(`/api/writer/access/posts/${d}`).catch(()=>null)]),x=(o=z==null?void 0:z.data)==null?void 0:o.post,Ie=((a=le==null?void 0:le.data)==null?void 0:a.products)||[],_e=((n=oe==null?void 0:oe.data)==null?void 0:n.templates)||[],Oe=((f=re==null?void 0:re.data)==null?void 0:f.categories)||[];_(Ie),M(_e),K(Oe);const X=((c=E==null?void 0:E.data)==null?void 0:c.access)||null;if(C({loaded:!!((u=E==null?void 0:E.data)!=null&&u.ok),can_use_premium_posts:!!((m=E==null?void 0:E.data)!=null&&m.can_use_premium_posts)}),X&&L({access_type:X.access_type==="premium"?"premium":"free",free_preview_seconds:Number(X.free_preview_seconds||0),preview_percent:Number(X.preview_percent||0)}),k(!1),ae(z==null?void 0:z.data),x){const ne=_e.find(g=>String(g.id)===String(x.template_id))||null,Z=de(ne),Re=(x.template_fields||[]).map((g,O)=>({field_key:g.field_key||"",field_type:g.field_type||"text",field_value:g.field_value||"",sort_order:g.sort_order||O+1,meta:{label:g.field_key||`Field ${O+1}`,section:"Generic fields",helper_text:"Generic field",required:!["image","divider"].includes(String(g.field_type||"").toLowerCase()),word_rule:null,simple_writer:H(ne),placeholder:"Enter value",locked:!1}}))||[],De=(x.cta_buttons||[]).map((g,O)=>({button_key:g.button_key||`cta_${O+1}`,button_label:g.button_label||"",button_url:g.button_url||"",button_style:g.button_style||"primary",open_in_new_tab:!!g.open_in_new_tab,sort_order:g.sort_order||O+1,meta:{label:g.button_key||`Button ${O+1}`,helper_text:"Generic CTA button.",required:!0,locked:!1}}))||[];b({content_type:x.content_type||(x.product_id?"product_post":"article"),product_id:x.product_id||"",category_id:x.category_id||"",topic_ids:Array.isArray(x.topics)?x.topics.map(g=>Number(g.id)):[],template_id:x.template_id||"",title:x.title||"",slug:x.slug||"",excerpt:x.excerpt||"",seo_title:x.seo_title||"",seo_description:x.seo_description||"",featured_image:x.featured_image||"",status:x.status||"draft",comments_enabled:x.comments_enabled!==!1&&Number(x.comments_enabled)!==0,scheduled_at:gt(x.scheduled_at),template_fields:Z?ve(Z.fields,x.template_fields||[]):Re,cta_buttons:H(ne)?[]:Z?ke(Z.ctaButtons,x.cta_buttons||[]):De}),x.quality_review&&G(x.quality_review)}}catch(z){F(((ge=(y=z==null?void 0:z.response)==null?void 0:y.data)==null?void 0:ge.message)||"Failed to load post")}finally{fe(!1)}})()},[d]),h.useEffect(()=>{if(!S)return;const t=de(S),o=H(S);b(a=>{if(o){const c=a.template_fields.some(u=>{var m;return(m=u==null?void 0:u.meta)==null?void 0:m.simple_writer});return{...a,template_fields:c?a.template_fields:Ze(),cta_buttons:[]}}if(!t){const c=a.template_fields.some(m=>{var y;return(y=m==null?void 0:m.meta)==null?void 0:y.locked}),u=a.cta_buttons.some(m=>{var y;return(y=m==null?void 0:m.meta)==null?void 0:y.locked});return!c&&!u?a:{...a,template_fields:_t(),cta_buttons:bt()}}const n=ve(t.fields,a.template_fields||[]),f=ke(t.ctaButtons,a.cta_buttons||[]);return{...a,template_fields:n,cta_buttons:f}})},[S]);const N=t=>{const{name:o,value:a}=t.target;G(null),b(n=>({...n,[o]:a}))},Y=(t,o,a)=>{G(null),b(n=>{const f=[...n.template_fields];return f[t]={...f[t],[o]:a},{...n,template_fields:f}})},J=(t,o,a)=>{G(null),b(n=>{const f=[...n.cta_buttons];return f[t]={...f[t],[o]:a},{...n,cta_buttons:f}})},se=async t=>{var f;const o=new FormData;o.append("image",t);const{data:a}=await U.post("/api/uploads/template-image",o,{headers:{"Content-Type":"multipart/form-data"}}),n=((f=a==null?void 0:a.file)==null?void 0:f.url)||"";if(!n)throw new Error("Upload did not return image url");return n},$e=async t=>{var a,n,f;const o=(a=t.target.files)==null?void 0:a[0];if(o){he(!0),F(""),A("");try{const c=await se(o);b(u=>({...u,featured_image:c})),A("Featured image uploaded")}catch(c){F(((f=(n=c==null?void 0:c.response)==null?void 0:n.data)==null?void 0:f.message)||(c==null?void 0:c.message)||"Failed to upload featured image")}finally{he(!1),t.target.value=""}}},We=async(t,o,a)=>{var f,c,u;const n=(f=a.target.files)==null?void 0:f[0];if(n){xe(o),F(""),A("");try{const m=await se(n);Y(t,"field_value",m),A(`${o} uploaded`)}catch(m){F(((u=(c=m==null?void 0:m.response)==null?void 0:c.data)==null?void 0:u.message)||(m==null?void 0:m.message)||"Failed to upload image")}finally{xe(""),a.target.value=""}}},Be=()=>{if(i.content_type==="product_post"&&!i.product_id)throw new Error("Product Post requires a product");if(!i.template_id)throw new Error("Template is required");if(!i.title.trim())throw new Error("Post title is required");for(const t of i.template_fields){const o=t.meta||{},a=o.label||t.field_key||"Field",n=String(t.field_value||"");if(!String(t.field_key||"").trim())throw new Error("Every template field must have a field key");if(o.required&&!n.trim())throw new Error(`${a} is required`);if(t.field_type==="image"&&o.required&&!n.trim())throw new Error(`${a} image is required`);if((t.field_type==="text"||t.field_type==="textarea")&&o.word_rule){const c=pe(n,o.word_rule);if(!c.ok)throw new Error(c.message)}const f=wt(t);if(jt(t)&&f.trim()&&!Se(f))throw new Error(`${a} must be a valid URL`)}for(const t of i.cta_buttons){const o=t.meta||{},a=o.label||t.button_key||"CTA button";if(o.required&&!String(t.button_label||"").trim())throw new Error(`${a} label is required`);if(!String(t.button_url||"").trim())throw new Error(`${a} URL is required`);if(!Se(t.button_url))throw new Error(`${a} URL must be a valid URL`);if(W){const n=V(t.button_label);if(t.button_key==="hero_primary_cta"&&n!==4)throw new Error("Hero primary CTA must be exactly 4 words");if(["hero_secondary_cta","how_it_works_cta","pricing_card_1_cta","pricing_card_2_cta","pricing_card_3_cta"].includes(t.button_key)&&n!==2)throw new Error(`${a} must be exactly 2 words`);if(t.button_key==="ingredients_cta"&&n!==3)throw new Error("Ingredients CTA must be exactly 3 words");if(t.button_key==="special_offer_cta"&&n!==5)throw new Error("Special offer CTA must be exactly 5 words")}}},Ge=async t=>{var o,a,n;t.preventDefault(),ce(!0),F(""),A("");try{Be();const f={content_type:i.content_type,product_id:i.product_id?Number(i.product_id):null,category_id:i.category_id||null,topic_ids:i.topic_ids,page_ids:i.page_ids||[],show_on_storefront:!!i.show_on_storefront,template_id:Number(i.template_id),title:i.title,slug:i.slug,excerpt:i.excerpt,seo_title:i.seo_title,seo_description:i.seo_description,featured_image:i.featured_image,status:i.status,comments_enabled:!!i.comments_enabled,scheduled_at:i.scheduled_at||null,template_fields:i.template_fields.map((u,m)=>({field_key:u.field_key,field_type:u.field_type,field_value:u.field_value,sort_order:m+1})),cta_buttons:i.cta_buttons.map((u,m)=>({button_key:u.button_key,button_label:u.button_label,button_url:u.button_url,button_style:u.button_style,open_in_new_tab:!!u.open_in_new_tab,sort_order:m+1}))},{data:c}=await U.put(`/api/affiliate/posts/${d}`,f);if(ae(c),c!=null&&c.ok){if(B.loaded&&(v.access_type==="free"||B.can_use_premium_posts||P))try{await U.put(`/api/writer/access/posts/${d}`,{access_type:v.access_type,free_preview_seconds:v.access_type==="premium"?Number(v.free_preview_seconds||0):I}),k(!1)}catch(m){A("Post content updated."),F(((a=(o=m==null?void 0:m.response)==null?void 0:o.data)==null?void 0:a.message)||(m==null?void 0:m.message)||"Premium Post settings could not be updated.");return}A(c.message||"Post updated successfully")}}catch(f){const c=(n=f==null?void 0:f.response)==null?void 0:n.data;ae(c),F((c==null?void 0:c.message)||f.message||"Failed to update post")}finally{ce(!1)}};return Le?e.jsxs("div",{className:"affiliate-edit-post-page",children:[e.jsx("style",{children:Ce}),e.jsx("div",{className:"affiliate-edit-post-loading-wrap",children:e.jsxs("div",{className:"affiliate-edit-post-loading-card",children:[e.jsx("div",{className:"affiliate-edit-post-spinner"}),e.jsx("p",{children:"Loading post..."})]})})]}):e.jsxs("div",{className:"affiliate-edit-post-page",children:[e.jsx("style",{children:Ce}),e.jsxs("section",{className:"affiliate-edit-post-command",children:[e.jsxs("div",{className:"affiliate-edit-post-command-left",children:[e.jsx("strong",{children:"Edit post"}),e.jsx("span",{className:je(i.status),children:i.status||"draft"})]}),e.jsxs("div",{className:"affiliate-edit-post-command-actions",children:[e.jsx("button",{className:"affiliate-edit-post-btn secondary",type:"button",onClick:()=>s(`${p}/posts`),children:"Back to Posts"}),e.jsxs("button",{className:"affiliate-edit-post-btn primary",type:"submit",form:"affiliate-edit-post-form",disabled:q,children:[e.jsx(ye,{size:15}),q?"Saving...":"Save Changes"]})]})]}),e.jsxs("section",{className:"affiliate-edit-post-grid",children:[e.jsxs("div",{className:"affiliate-edit-post-panel affiliate-edit-post-panel-main",children:[e.jsx("div",{className:"affiliate-edit-post-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-edit-post-panel-kicker",children:"Post details"}),e.jsx("h2",{className:"affiliate-edit-post-panel-title",children:"Update content"})]})}),e.jsxs("form",{id:"affiliate-edit-post-form",className:"affiliate-edit-post-form",onSubmit:Ge,children:[e.jsxs("div",{className:"affiliate-edit-post-form-grid",children:[e.jsxs("label",{className:"affiliate-edit-post-field",children:[e.jsxs("span",{className:"affiliate-edit-post-label",children:[e.jsx(be,{size:16}),"Content type"]}),e.jsxs("select",{className:"affiliate-edit-post-input",name:"content_type",value:i.content_type,onChange:N,children:[e.jsx("option",{value:"article",children:"Article"}),e.jsx("option",{value:"story",children:"Story"}),e.jsx("option",{value:"tutorial",children:"Tutorial"}),e.jsx("option",{value:"course_lesson",children:"Course Lesson"}),e.jsx("option",{value:"review",children:"Review"}),e.jsx("option",{value:"news",children:"News"}),e.jsx("option",{value:"opinion",children:"Opinion"}),e.jsx("option",{value:"product_post",children:"Product Post"})]})]}),e.jsxs("label",{className:"affiliate-edit-post-field",children:[e.jsxs("span",{className:"affiliate-edit-post-label",children:[e.jsx(ot,{size:16}),"Product (optional)"]}),e.jsxs("select",{className:"affiliate-edit-post-input",name:"product_id",value:i.product_id,onChange:N,children:[e.jsx("option",{value:"",children:"No product"}),r.map(t=>e.jsx("option",{value:t.id,children:t.title},t.id))]})]}),e.jsxs("label",{className:"affiliate-edit-post-field",children:[e.jsxs("span",{className:"affiliate-edit-post-label",children:[e.jsx(rt,{size:16}),"Category"]}),e.jsxs("select",{className:"affiliate-edit-post-input",name:"category_id",value:i.category_id,onChange:N,children:[e.jsx("option",{value:"",children:"Select category"}),w.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})]}),e.jsx(et,{value:i.topic_ids,primaryCategoryId:i.category_id,postId:d,onChange:t=>b(o=>({...o,topic_ids:t})),disabled:q}),e.jsx(tt,{postId:d,pageIds:i.page_ids||[],showOnStorefront:!!i.show_on_storefront,contentType:i.content_type,onChange:({page_ids:t,show_on_storefront:o})=>b(a=>({...a,page_ids:t,show_on_storefront:o}))}),e.jsxs("label",{className:"affiliate-edit-post-field",children:[e.jsxs("span",{className:"affiliate-edit-post-label",children:[e.jsx(Qe,{size:16}),"Template"]}),e.jsxs("select",{className:"affiliate-edit-post-input",name:"template_id",value:i.template_id,onChange:N,children:[e.jsx("option",{value:"",children:"Select blog template"}),j.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})]}),e.jsxs("label",{className:"affiliate-edit-post-field",children:[e.jsxs("span",{className:"affiliate-edit-post-label",children:[e.jsx(nt,{size:16}),"Post title"]}),e.jsx("input",{className:"affiliate-edit-post-input",name:"title",placeholder:"Post title",value:i.title,onChange:N})]}),e.jsxs("label",{className:"affiliate-edit-post-field",children:[e.jsxs("span",{className:"affiliate-edit-post-label",children:[e.jsx(dt,{size:16}),"Slug"]}),e.jsx("input",{className:"affiliate-edit-post-input",name:"slug",placeholder:"Custom slug",value:i.slug,onChange:N})]}),e.jsx(Ne,{label:e.jsxs("span",{className:"affiliate-edit-post-label",children:[e.jsx(we,{size:16}),"Featured image"]}),value:i.featured_image,placeholder:"Upload image or paste image URL",uploading:Pe,onChange:t=>N({target:{name:"featured_image",value:t.target.value}}),onUpload:$e,inputRef:Me,previewHeight:130}),e.jsxs("label",{className:"affiliate-edit-post-field affiliate-edit-post-field-full",children:[e.jsxs("span",{className:"affiliate-edit-post-label",children:[e.jsx(be,{size:16}),"Excerpt"]}),e.jsx("textarea",{className:"affiliate-edit-post-input affiliate-edit-post-textarea",name:"excerpt",placeholder:"Excerpt",rows:"3",value:i.excerpt,onChange:N})]}),e.jsxs("label",{className:"affiliate-edit-post-field",children:[e.jsx("span",{className:"affiliate-edit-post-label",children:"SEO title"}),e.jsx("input",{className:"affiliate-edit-post-input",name:"seo_title",placeholder:"SEO title",value:i.seo_title,onChange:N})]}),e.jsxs("label",{className:"affiliate-edit-post-field",children:[e.jsx("span",{className:"affiliate-edit-post-label",children:"Status"}),e.jsxs("select",{className:"affiliate-edit-post-input",name:"status",value:i.status,onChange:N,children:[e.jsx("option",{value:"draft",children:"Draft"}),e.jsx("option",{value:"published",children:"Published"}),e.jsx("option",{value:"inactive",children:"Inactive"})]})]}),e.jsxs("label",{className:"affiliate-edit-post-field",children:[e.jsx("span",{className:"affiliate-edit-post-label",children:"Comments"}),e.jsxs("span",{style:{display:"flex",alignItems:"center",gap:10,minHeight:42},children:[e.jsx("input",{type:"checkbox",checked:!!i.comments_enabled,onChange:t=>b(o=>({...o,comments_enabled:t.target.checked}))}),e.jsx("span",{children:i.comments_enabled?"Comments allowed":"Comments turned off"})]})]}),e.jsxs("label",{className:"affiliate-edit-post-field",children:[e.jsx("span",{className:"affiliate-edit-post-label",children:"Schedule release"}),e.jsx("input",{className:"affiliate-edit-post-input",type:"datetime-local",name:"scheduled_at",value:i.scheduled_at,onChange:N})]}),e.jsxs("label",{className:"affiliate-edit-post-field affiliate-edit-post-field-full",children:[e.jsx("span",{className:"affiliate-edit-post-label",children:"SEO description"}),e.jsx("textarea",{className:"affiliate-edit-post-input affiliate-edit-post-textarea",name:"seo_description",placeholder:"SEO description",rows:"3",value:i.seo_description,onChange:N})]})]}),e.jsxs("div",{className:"affiliate-edit-post-block",children:[e.jsxs("div",{className:"affiliate-edit-post-block-head",children:[e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-edit-post-panel-kicker",children:"Template fields"}),e.jsx("h3",{className:"affiliate-edit-post-block-title",children:W?"Locked content blocks":"Content blocks"})]}),W?e.jsxs("div",{className:"affiliate-edit-post-lock-note",children:[e.jsx(ee,{size:15}),e.jsx("span",{children:"Structure locked"})]}):null]}),W?e.jsxs("div",{className:"affiliate-edit-post-preset-note",children:[e.jsx(Ye,{size:16}),e.jsx("span",{children:"Template structure is locked. Fill the content, image, and CTA slots before saving."})]}):null,H(S)?e.jsx(it,{blocks:i.template_fields,onChange:t=>{G(null),b(o=>({...o,template_fields:t}))},uploadImage:se,disabled:q}):e.jsx("div",{className:"affiliate-edit-post-stack",children:Object.entries(Fe).map(([t,o])=>e.jsxs("div",{className:"affiliate-edit-post-section-group",children:[e.jsx("div",{className:"affiliate-edit-post-section-title",children:t}),e.jsx("div",{className:"affiliate-edit-post-stack",children:o.map(a=>{const n=a.meta||{},f=n.word_rule,c=a.field_type==="text"||a.field_type==="textarea"?pe(a.field_value,f):null;te.current[a.field_key]||(te.current[a.field_key]={current:null});const u=D[a.field_key],m=Ue[a.field_key];return e.jsxs("div",{className:"affiliate-edit-post-card",children:[e.jsxs("div",{className:"affiliate-edit-post-card-top",children:[e.jsx("div",{className:"affiliate-edit-post-chip",children:n.label||a.field_key}),e.jsxs("div",{className:`affiliate-edit-post-score-pill ${ze((m==null?void 0:m.quality_score)??(u==null?void 0:u.score)??0)}`,children:["Score ",Math.round((m==null?void 0:m.quality_score)??(u==null?void 0:u.score)??0)]}),n.locked?e.jsxs("div",{className:"affiliate-edit-post-chip muted",children:[e.jsx(ee,{size:13}),"Locked slot"]}):null]}),e.jsx("div",{className:"affiliate-edit-post-form-grid single",children:a.field_type==="image"?e.jsx(Ne,{label:n.label||a.field_key,value:a.field_value,placeholder:n.placeholder||"Upload image or paste image URL",uploading:Te===a.field_key,onChange:y=>Y(a.__index,"field_value",y.target.value),onUpload:y=>We(a.__index,a.field_key,y),inputRef:te.current[a.field_key],previewHeight:150}):e.jsxs("label",{className:"affiliate-edit-post-field affiliate-edit-post-field-full",children:[e.jsx("span",{className:"affiliate-edit-post-label",children:n.label||a.field_key}),a.field_type==="textarea"?e.jsx("textarea",{className:"affiliate-edit-post-input affiliate-edit-post-textarea",rows:"4",placeholder:n.placeholder||"Enter value",value:a.field_value,onChange:y=>Y(a.__index,"field_value",y.target.value)}):e.jsx("input",{className:"affiliate-edit-post-input",placeholder:n.placeholder||"Enter value",value:a.field_value,onChange:y=>Y(a.__index,"field_value",y.target.value)})]})}),e.jsxs("div",{className:"affiliate-edit-post-field-meta",children:[e.jsxs("div",{children:[n.helper_text||"Required field",c!=null&&c.message?e.jsx("div",{className:"affiliate-edit-post-suggested-note",children:c.message}):null]}),f?e.jsxs("div",{className:`affiliate-edit-post-word-rule ${c!=null&&c.ok?"valid":"invalid"}`,children:[e.jsx("span",{children:ht(f)}),e.jsxs("strong",{children:[(c==null?void 0:c.count)||0," words"]})]}):e.jsx("div",{className:"affiliate-edit-post-required-tag",children:n.required?"Required":"Optional"})]})]},a.field_key)})})]},t))})]}),e.jsxs("div",{className:"affiliate-edit-post-block",children:[e.jsxs("div",{className:"affiliate-edit-post-block-head",children:[e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-edit-post-panel-kicker",children:"CTA buttons"}),e.jsx("h3",{className:"affiliate-edit-post-block-title",children:W?"Locked action buttons":"Action buttons"})]}),W?e.jsxs("div",{className:"affiliate-edit-post-lock-note",children:[e.jsx(ee,{size:15}),e.jsx("span",{children:"Button count locked"})]}):null]}),e.jsx("div",{className:"affiliate-edit-post-stack",children:i.cta_buttons.map((t,o)=>{var a,n;return e.jsxs("div",{className:"affiliate-edit-post-card",children:[e.jsxs("div",{className:"affiliate-edit-post-card-top",children:[e.jsx("div",{className:"affiliate-edit-post-chip",children:((a=t==null?void 0:t.meta)==null?void 0:a.label)||t.button_key}),(n=t==null?void 0:t.meta)!=null&&n.locked?e.jsxs("div",{className:"affiliate-edit-post-chip muted",children:[e.jsx(ee,{size:13}),"Locked slot"]}):null]}),e.jsxs("div",{className:"affiliate-edit-post-form-grid",children:[e.jsxs("label",{className:"affiliate-edit-post-field",children:[e.jsx("span",{className:"affiliate-edit-post-label",children:"Button label"}),e.jsx("input",{className:"affiliate-edit-post-input",placeholder:"Button label",value:t.button_label,onChange:f=>J(o,"button_label",f.target.value)})]}),e.jsxs("label",{className:"affiliate-edit-post-field",children:[e.jsx("span",{className:"affiliate-edit-post-label",children:"Button style"}),e.jsxs("select",{className:"affiliate-edit-post-input",value:t.button_style,onChange:f=>J(o,"button_style",f.target.value),children:[e.jsx("option",{value:"primary",children:"Primary"}),e.jsx("option",{value:"secondary",children:"Secondary"})]})]}),e.jsxs("label",{className:"affiliate-edit-post-field affiliate-edit-post-field-full",children:[e.jsx("span",{className:"affiliate-edit-post-label",children:"Button URL"}),e.jsx("input",{className:"affiliate-edit-post-input",placeholder:"Button URL",value:t.button_url,onChange:f=>J(o,"button_url",f.target.value)})]}),e.jsxs("label",{className:"affiliate-edit-post-check",children:[e.jsx("input",{type:"checkbox",checked:!!t.open_in_new_tab,onChange:f=>J(o,"open_in_new_tab",f.target.checked)}),e.jsx("span",{children:"Open in new tab"})]})]}),e.jsxs("div",{className:"affiliate-edit-post-field-meta",children:[e.jsx("div",{children:"External links are allowed. Bloggad checks and records outbound destinations when you save."}),e.jsx("div",{className:"affiliate-edit-post-required-tag",children:"Required"})]})]},t.button_key||o)})})]}),me?e.jsxs("div",{className:"affiliate-edit-post-alert error",children:[e.jsx(pt,{size:18}),e.jsx("span",{children:me})]}):null,ue?e.jsxs("div",{className:"affiliate-edit-post-alert success",children:[e.jsx(ft,{size:18}),e.jsx("span",{children:ue})]}):null,e.jsxs("div",{className:"affiliate-edit-post-actions",children:[e.jsxs("button",{className:"affiliate-edit-post-btn primary",type:"submit",disabled:q,children:[e.jsx(ye,{size:16}),q?"Saving...":"Update Post"]}),e.jsx(Je,{className:"affiliate-edit-post-btn secondary",to:"/affiliate/posts",children:"View My Posts"}),e.jsxs("button",{className:"affiliate-edit-post-btn secondary",type:"button",onClick:()=>s("/affiliate/products"),children:[e.jsx(ct,{size:16}),"Back to Products"]})]})]})]}),e.jsxs("div",{className:"affiliate-edit-post-side-stack",children:[e.jsx(at,{accessType:v.access_type,canUsePremiumPosts:B.can_use_premium_posts,capabilityLoaded:B.loaded,estimatedReadSeconds:I,freePreviewSeconds:v.free_preview_seconds,disabled:q,onAccessTypeChange:t=>{k(!0),L(o=>({...o,access_type:t}))},onFreePreviewSecondsChange:t=>{k(!0),L(o=>({...o,free_preview_seconds:t}))},onUpgrade:()=>s(p==="/writer"?"/writer/plan":"/affiliate/subscription")}),e.jsxs("div",{className:"affiliate-edit-post-panel",children:[e.jsx("div",{className:"affiliate-edit-post-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-edit-post-panel-kicker",children:"Summary"}),e.jsx("h2",{className:"affiliate-edit-post-panel-title",children:"Post overview"})]})}),e.jsxs("div",{className:"affiliate-edit-post-summary",children:[e.jsxs("div",{className:"affiliate-edit-post-summary-row",children:[e.jsx("span",{children:"Title"}),e.jsx("strong",{children:i.title||"-"})]}),e.jsxs("div",{className:"affiliate-edit-post-summary-row",children:[e.jsx("span",{children:"Product"}),e.jsx("strong",{children:($==null?void 0:$.title)||"-"})]}),e.jsxs("div",{className:"affiliate-edit-post-summary-row",children:[e.jsx("span",{children:"Category"}),e.jsx("strong",{children:(ie==null?void 0:ie.name)||"-"})]}),e.jsxs("div",{className:"affiliate-edit-post-summary-row",children:[e.jsx("span",{children:"Template"}),e.jsx("strong",{children:(S==null?void 0:S.name)||"-"})]}),e.jsxs("div",{className:"affiliate-edit-post-summary-row",children:[e.jsx("span",{children:"Mode"}),e.jsx("strong",{children:H(S)?"Simple Writer workroom":W?"Locked template editor":"Generic field editor"})]}),e.jsxs("div",{className:"affiliate-edit-post-summary-row",children:[e.jsx("span",{children:"Status"}),e.jsx("strong",{children:e.jsx("span",{className:je(i.status),children:i.status||"-"})})]}),e.jsxs("div",{className:"affiliate-edit-post-summary-row",children:[e.jsx("span",{children:"Fields"}),e.jsx("strong",{children:i.template_fields.length})]}),e.jsxs("div",{className:"affiliate-edit-post-summary-row",children:[e.jsx("span",{children:"CTA Buttons"}),e.jsx("strong",{children:i.cta_buttons.length})]})]})]}),e.jsxs("div",{className:"affiliate-edit-post-panel",children:[e.jsx("div",{className:"affiliate-edit-post-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-edit-post-panel-kicker",children:"Live quality"}),e.jsx("h2",{className:"affiliate-edit-post-panel-title",children:"Score snapshot"})]})}),e.jsxs("div",{className:"affiliate-edit-post-summary-card",children:[e.jsx("div",{className:"affiliate-edit-post-summary-score",children:qe}),e.jsxs("div",{className:"affiliate-edit-post-summary-line",children:[Ae,"/",i.template_fields.length," fields currently passing"]})]}),e.jsxs("div",{className:"affiliate-edit-post-summary",children:[e.jsxs("div",{className:"affiliate-edit-post-summary-row",children:[e.jsx("span",{children:"Total text words"}),e.jsx("strong",{children:Q})]}),e.jsxs("div",{className:"affiliate-edit-post-summary-row",children:[e.jsx("span",{children:"Similarity review"}),e.jsx("strong",{children:Q>=100?"Ready on save":"Starts at 100 words"})]}),e.jsxs("div",{className:"affiliate-edit-post-summary-row",children:[e.jsx("span",{children:"Minimum words"}),e.jsx("strong",{children:"Enforced"})]}),e.jsxs("div",{className:"affiliate-edit-post-summary-row",children:[e.jsx("span",{children:"Maximum words"}),e.jsx("strong",{children:"Suggested only"})]})]})]}),e.jsxs("div",{className:"affiliate-edit-post-panel",children:[e.jsx("div",{className:"affiliate-edit-post-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-edit-post-panel-kicker",children:"Link policy"}),e.jsx("h2",{className:"affiliate-edit-post-panel-title",children:"Outbound links"})]})}),e.jsx("div",{className:"affiliate-edit-post-plan-note",children:"Free and paid Writers can use legitimate external links. Prohibited destinations may be blocked or reviewed."})]}),T?e.jsxs("div",{className:"affiliate-edit-post-panel",children:[e.jsx("div",{className:"affiliate-edit-post-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-edit-post-panel-kicker",children:"Latest server review"}),e.jsx("h2",{className:"affiliate-edit-post-panel-title",children:"Review result"})]})}),e.jsxs("div",{className:"affiliate-edit-post-summary",children:[e.jsxs("div",{className:"affiliate-edit-post-summary-row",children:[e.jsx("span",{children:"Review status"}),e.jsx("strong",{children:T.review_status||"-"})]}),e.jsxs("div",{className:"affiliate-edit-post-summary-row",children:[e.jsx("span",{children:"Quality score"}),e.jsx("strong",{children:Math.round(T.quality_score||0)})]}),e.jsxs("div",{className:"affiliate-edit-post-summary-row",children:[e.jsx("span",{children:"Risk score"}),e.jsx("strong",{children:Math.round(T.risk_score||0)})]}),e.jsxs("div",{className:"affiliate-edit-post-summary-row",children:[e.jsx("span",{children:"Similarity score"}),e.jsxs("strong",{children:[Math.round(T.similarity_score||0),"%"]})]}),T.blocked_reason?e.jsx("div",{className:"affiliate-edit-post-server-warning",children:T.blocked_reason}):null]})]}):null,e.jsxs("div",{className:"affiliate-edit-post-panel",children:[e.jsx("div",{className:"affiliate-edit-post-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{className:"affiliate-edit-post-panel-kicker",children:"Preview"}),e.jsx("h2",{className:"affiliate-edit-post-panel-title",children:"Featured image"})]})}),i.featured_image?e.jsx("img",{src:i.featured_image,alt:i.title||"Post preview",className:"affiliate-edit-post-preview-image"}):e.jsxs("div",{className:"affiliate-edit-post-preview-empty",children:[e.jsx(we,{size:26}),e.jsx("span",{children:"No featured image"})]})]})]})]})]})}const Ce=`
  * {
    box-sizing: border-box;
  }

  .affiliate-edit-post-page {
    width: 100%;
    color: #111827;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .affiliate-edit-post-page button,
  .affiliate-edit-post-page input,
  .affiliate-edit-post-page select,
  .affiliate-edit-post-page textarea {
    font: inherit;
  }

  .affiliate-edit-post-loading-wrap {
    min-height: 58vh;
    display: grid;
    place-items: center;
  }

  .affiliate-edit-post-loading-card {
    min-width: 230px;
    padding: 22px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
    text-align: center;
  }

  .affiliate-edit-post-loading-card p {
    margin: 10px 0 0;
    color: #6b7280;
    font-size: 11px;
    font-weight: 600;
  }

  .affiliate-edit-post-spinner,
  .affiliate-edit-post-spin {
    animation: affiliateEditPostSpin 0.8s linear infinite;
  }

  .affiliate-edit-post-spinner {
    width: 32px;
    height: 32px;
    margin: 0 auto;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    border-radius: 999px;
  }

  @keyframes affiliateEditPostSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .affiliate-edit-post-command {
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

  .affiliate-edit-post-command-left,
  .affiliate-edit-post-command-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .affiliate-edit-post-command-left {
    min-width: 0;
  }

  .affiliate-edit-post-command-left > strong {
    font-size: 16px;
    line-height: 1.2;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .affiliate-edit-post-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
    gap: 12px;
    align-items: start;
  }

  .affiliate-edit-post-side-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: sticky;
    top: 12px;
  }

  .affiliate-edit-post-panel {
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
    box-shadow: none;
  }

  .affiliate-edit-post-panel-head,
  .affiliate-edit-post-block-head {
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .affiliate-edit-post-panel-kicker {
    display: none;
  }

  .affiliate-edit-post-panel-title,
  .affiliate-edit-post-block-title {
    margin: 0;
    color: #111827;
    font-size: 13px;
    line-height: 1.25;
    font-weight: 600;
    letter-spacing: 0;
  }

  .affiliate-edit-post-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-edit-post-form-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 10px;
  }

  .affiliate-edit-post-form-grid > :nth-child(1),
  .affiliate-edit-post-form-grid > :nth-child(2),
  .affiliate-edit-post-form-grid > :nth-child(3) {
    grid-column: span 2;
  }

  .affiliate-edit-post-form-grid > :nth-child(4),
  .affiliate-edit-post-form-grid > :nth-child(5),
  .affiliate-edit-post-form-grid > :nth-child(6),
  .affiliate-edit-post-form-grid > :nth-child(7) {
    grid-column: span 3;
  }

  .affiliate-edit-post-form-grid > :nth-child(8),
  .affiliate-edit-post-form-grid > :nth-child(12),
  .affiliate-edit-post-form-grid > :nth-child(13) {
    grid-column: span 2;
  }

  .affiliate-edit-post-form-grid > :nth-child(9),
  .affiliate-edit-post-form-grid > :nth-child(10),
  .affiliate-edit-post-form-grid > :nth-child(11),
  .affiliate-edit-post-form-grid > :nth-child(14) {
    grid-column: span 3;
  }

  .affiliate-edit-post-form-grid.single {
    grid-template-columns: 1fr;
  }

  .affiliate-edit-post-form-grid.single > * {
    grid-column: auto;
  }

  .affiliate-edit-post-field,
  .affiliate-edit-post-upload-field {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .affiliate-edit-post-field-full {
    grid-column: 1 / -1 !important;
  }

  .affiliate-edit-post-label {
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

  .affiliate-edit-post-label svg {
    width: 13px;
    height: 13px;
    color: #6b7280;
  }

  .affiliate-edit-post-input {
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

  .affiliate-edit-post-input::placeholder {
    color: #6b7280;
    opacity: 1;
  }

  .affiliate-edit-post-input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.06);
  }

  .affiliate-edit-post-textarea {
    min-height: 78px;
    padding: 10px 12px;
    resize: vertical;
  }

  .affiliate-edit-post-upload-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    align-items: end;
  }

  .affiliate-edit-post-upload-btn {
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

  .affiliate-edit-post-upload-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .affiliate-edit-post-inline-preview {
    width: 100%;
    padding: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #f8fafc;
  }

  .affiliate-edit-post-inline-preview img {
    border-radius: 9px !important;
  }

  .affiliate-edit-post-block {
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

  .affiliate-edit-post-block + .affiliate-edit-post-block {
    margin-top: 0;
  }

  .affiliate-edit-post-block-head {
    width: 100%;
    margin-bottom: 0;
    padding-bottom: 2px;
  }

  .affiliate-edit-post-block-title {
    font-size: 15px;
    line-height: 1.35;
    font-weight: 650;
  }

  .affiliate-edit-post-stack {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .affiliate-edit-post-section-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .affiliate-edit-post-section-title {
    padding: 2px 0;
    color: #111827;
    font-size: 11px;
    line-height: 1.3;
    font-weight: 600;
  }

  .affiliate-edit-post-card {
    padding: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #ffffff;
  }

  .affiliate-edit-post-card-top {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .affiliate-edit-post-chip,
  .affiliate-edit-post-lock-note,
  .affiliate-edit-post-score-pill,
  .affiliate-edit-post-review-state,
  .affiliate-edit-post-word-rule,
  .affiliate-edit-post-required-tag,
  .affiliate-edit-post-status {
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

  .affiliate-edit-post-score-pill {
    margin-left: auto;
  }

  .affiliate-edit-post-status {
    text-transform: capitalize;
  }

  .affiliate-edit-post-status.active,
  .affiliate-edit-post-score-pill.good,
  .affiliate-edit-post-review-state.good,
  .affiliate-edit-post-word-rule.valid {
    border-color: #abefc6;
    background: #ecfdf3;
    color: #027a48;
  }

  .affiliate-edit-post-status.draft,
  .affiliate-edit-post-status.neutral {
    border-color: #e5e7eb;
    background: #f8fafc;
    color: #6b7280;
  }

  .affiliate-edit-post-status.inactive,
  .affiliate-edit-post-score-pill.warn,
  .affiliate-edit-post-review-state.warn,
  .affiliate-edit-post-word-rule.invalid {
    border-color: #fed7aa;
    background: #fff7ed;
    color: #b54708;
  }

  .affiliate-edit-post-score-pill.bad,
  .affiliate-edit-post-review-state.bad {
    border-color: #fecaca;
    background: #fef2f2;
    color: #b42318;
  }

  .affiliate-edit-post-preset-note {
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

  .affiliate-edit-post-field-meta,
  .affiliate-edit-post-review-top {
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

  .affiliate-edit-post-review-box {
    margin-top: 9px;
    padding: 10px;
    display: grid;
    gap: 6px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #ffffff;
  }

  .affiliate-edit-post-review-message {
    color: #111827;
    font-size: 10px;
    line-height: 1.45;
    font-weight: 600;
  }

  .affiliate-edit-post-review-suggestion,
  .affiliate-edit-post-review-meta,
  .affiliate-edit-post-suggested-note {
    color: #6b7280;
    font-size: 9px;
    line-height: 1.45;
  }

  .affiliate-edit-post-review-tag {
    width: fit-content;
    padding: 5px 8px;
    border-radius: 999px;
    background: #f8fafc;
    color: #6b7280;
    font-size: 9px;
    font-weight: 600;
  }

  .affiliate-edit-post-check {
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

  .affiliate-edit-post-alert {
    padding: 11px 12px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    border-radius: 10px;
    font-size: 11px;
    line-height: 1.45;
    font-weight: 600;
  }

  .affiliate-edit-post-alert.error {
    border: 1px solid #fed7aa;
    background: #fff7ed;
    color: #9a3412;
  }

  .affiliate-edit-post-alert.success {
    border: 1px solid #abefc6;
    background: #ecfdf3;
    color: #027a48;
  }

  .affiliate-edit-post-actions {
    padding-top: 2px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .affiliate-edit-post-btn {
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

  .affiliate-edit-post-btn.primary {
    border-color: #111827;
    background: #111827;
    color: #ffffff;
  }

  .affiliate-edit-post-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .affiliate-edit-post-summary {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .affiliate-edit-post-summary-row {
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

  .affiliate-edit-post-summary-row span {
    color: #6b7280;
    font-size: 10px;
    line-height: 1.3;
    font-weight: 500;
  }

  .affiliate-edit-post-summary-row strong {
    max-width: 62%;
    color: #111827;
    font-size: 10px;
    line-height: 1.35;
    font-weight: 600;
    text-align: right;
    overflow-wrap: anywhere;
  }

  .affiliate-edit-post-preview-image,
  .affiliate-edit-post-preview-empty {
    width: 100%;
    height: 190px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #f8fafc;
  }

  .affiliate-edit-post-preview-image {
    display: block;
    object-fit: cover;
  }

  .affiliate-edit-post-preview-empty {
    display: grid;
    place-items: center;
    gap: 6px;
    color: #6b7280;
    font-size: 10px;
    text-align: center;
  }

  .affiliate-edit-post-quality-box {
    padding: 0;
    border-radius: 0;
    background: transparent;
    color: #111827;
  }

  .affiliate-edit-post-quality-score {
    margin-bottom: 7px;
    color: #111827;
    font-size: 34px;
    line-height: 1;
    font-weight: 700;
  }

  .affiliate-edit-post-quality-text {
    margin-bottom: 4px;
    color: #111827;
    font-size: 10px;
    line-height: 1.4;
    font-weight: 600;
  }

  .affiliate-edit-post-quality-meta,
  .affiliate-edit-post-plan-note,
  .affiliate-edit-post-server-warning {
    color: #6b7280;
    font-size: 9px;
    line-height: 1.5;
  }

  .affiliate-edit-post-server-warning {
    color: #b42318;
    font-weight: 600;
  }

  .affiliate-edit-post-block > div[style] {
    width: 100% !important;
    min-width: 0 !important;
    gap: 12px !important;
    align-items: stretch !important;
  }

  .affiliate-edit-post-block > div[style] > * {
    min-width: 0 !important;
  }

  .affiliate-edit-post-block button:not(.affiliate-edit-post-upload-btn) {
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

  .affiliate-edit-post-block button:not(.affiliate-edit-post-upload-btn):hover {
    border-color: #c8cfd8 !important;
    background: #f3f4f6 !important;
    color: #111827 !important;
  }

  .affiliate-edit-post-block input:not([type="file"]),
  .affiliate-edit-post-block textarea {
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

  .affiliate-edit-post-block input:not([type="file"]) {
    min-height: 44px !important;
    padding: 0 12px !important;
  }

  .affiliate-edit-post-block textarea {
    min-height: 132px !important;
    padding: 12px 13px !important;
    resize: vertical !important;
  }

  .affiliate-edit-post-block input:not([type="file"])::placeholder,
  .affiliate-edit-post-block textarea::placeholder {
    color: #98a2b3 !important;
    opacity: 1 !important;
  }

  .affiliate-edit-post-block input:not([type="file"]):focus,
  .affiliate-edit-post-block textarea:focus {
    border-color: #111827 !important;
    outline: 0 !important;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.06) !important;
  }

  .affiliate-edit-post-block input[type="file"] {
    width: 100% !important;
    min-height: 42px !important;
    padding: 5px !important;
    border: 1px solid #d1d5db !important;
    border-radius: 10px !important;
    background: #ffffff !important;
    color: #475467 !important;
    font-size: 11px !important;
  }

  .affiliate-edit-post-block input[type="file"]::file-selector-button {
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

  .affiliate-edit-post-block label,
  .affiliate-edit-post-block .affiliate-edit-post-label {
    font-size: 10px !important;
    line-height: 1.3 !important;
  }

  .affiliate-edit-post-block img {
    width: 100%;
    max-width: 100%;
    border-radius: 10px !important;
  }

  @media (max-width: 1100px) {
    .affiliate-edit-post-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-edit-post-side-stack {
      position: static;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 767px) {
    .affiliate-edit-post-command {
      min-height: 52px;
      margin-bottom: 10px;
      padding: 8px 12px;
      border-radius: 12px;
    }

    .affiliate-edit-post-command-left > strong {
      font-size: 14px;
    }

    .affiliate-edit-post-command-left .affiliate-edit-post-status {
      display: none;
    }

    .affiliate-edit-post-command-actions {
      gap: 6px;
    }

    .affiliate-edit-post-command-actions .affiliate-edit-post-btn {
      min-height: 36px;
      padding: 0 11px;
      font-size: 10px;
    }

    .affiliate-edit-post-command-actions .affiliate-edit-post-btn svg {
      display: none;
    }

    .affiliate-edit-post-grid {
      gap: 10px;
    }

    .affiliate-edit-post-panel {
      padding: 14px;
      border-radius: 14px;
    }

    .affiliate-edit-post-form-grid {
      grid-template-columns: 1fr;
      gap: 9px;
    }

    .affiliate-edit-post-form-grid > * {
      grid-column: auto !important;
    }

    .affiliate-edit-post-label {
      font-size: 8px;
    }

    .affiliate-edit-post-input {
      min-height: 40px;
      border-radius: 9px;
      font-size: 10px;
    }

    .affiliate-edit-post-textarea {
      min-height: 72px;
    }

    .affiliate-edit-post-upload-row {
      grid-template-columns: 1fr;
    }

    .affiliate-edit-post-upload-btn {
      width: 100%;
      min-height: 36px;
      border-radius: 9px;
      font-size: 10px;
    }

    .affiliate-edit-post-block {
      padding: 13px;
      gap: 10px;
    }

    .affiliate-edit-post-block-title {
      font-size: 14px;
    }

    .affiliate-edit-post-block input:not([type="file"]),
    .affiliate-edit-post-block textarea {
      font-size: 14px !important;
    }

    .affiliate-edit-post-block textarea {
      min-height: 120px !important;
    }

    .affiliate-edit-post-block button:not(.affiliate-edit-post-upload-btn) {
      min-height: 32px !important;
      font-size: 11px !important;
    }

    .affiliate-edit-post-card {
      padding: 11px;
    }

    .affiliate-edit-post-side-stack {
      display: flex;
    }

    .affiliate-edit-post-summary-row {
      min-height: 30px;
    }

    .affiliate-edit-post-preview-image,
    .affiliate-edit-post-preview-empty {
      height: 170px;
    }

    .affiliate-edit-post-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-edit-post-actions .affiliate-edit-post-btn {
      width: 100%;
      min-height: 36px;
    }

    .affiliate-edit-post-panel-main .affiliate-edit-post-panel-head {
      margin-bottom: 10px;
    }

    .affiliate-edit-post-block-head {
      align-items: center;
      flex-direction: row;
    }
  }

  @media (max-width: 420px) {
    .affiliate-edit-post-command {
      gap: 8px;
    }

    .affiliate-edit-post-command-actions .affiliate-edit-post-btn {
      padding: 0 9px;
    }

    .affiliate-edit-post-panel {
      padding: 12px;
    }

    .affiliate-edit-post-block {
      padding: 12px;
    }

    .affiliate-edit-post-block textarea {
      min-height: 112px !important;
    }
  }
  .affiliate-edit-post-summary-card {
    margin-bottom: 10px;
    padding: 14px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #f9fafb;
  }

  .affiliate-edit-post-summary-score {
    margin-bottom: 6px;
    color: #111827;
    font-size: 28px;
    line-height: 1;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .affiliate-edit-post-summary-line {
    color: #6b7280;
    font-size: 12px;
    line-height: 1.45;
    font-weight: 500;
  }
`;export{Rt as default};
