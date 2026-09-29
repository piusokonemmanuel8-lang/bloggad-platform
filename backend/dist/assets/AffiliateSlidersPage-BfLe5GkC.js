import{r as c,j as e,R as Ze,d as Re,W as Q,x as Fe,g as ur,V as er,a as j,b as Tr,X as hr}from"./index-LXBBJt7I.js";import{v as Le}from"./validateSupgadUrl-KW1pmdpE.js";import{C as Ne}from"./circle-alert-DsZo9igC.js";import{C as rr}from"./circle-check-ml_0upGj.js";import{I as me}from"./image-DDgd2sPC.js";import{C as xe}from"./cloud-upload-CQRuyabr.js";import{S as sr}from"./save-Co8lXD7U.js";import{P as tr}from"./pause-DmIuCfGq.js";import{P as ar}from"./play-CumiPpGq.js";import{T as lr}from"./trash-2-BXfw28tL.js";import{L as Pr}from"./link-2-c46va36m.js";import{P as jr}from"./pencil-BZCp6GMt.js";import{E as $r}from"./eye-l-zUNvi7.js";import{M as Dr}from"./mouse-pointer-click-CMFK1dwY.js";function mr(){return{campaign_title:"",campaign_description:"",internal_note:"",media_type:"image",image_url:"",video_url:"",poster_url:"",eyebrow_text:"Sponsored",title:"",subtitle:"",promo_text:"",cta_label:"Shop Now",cta_url:"",secondary_cta_label:"",secondary_cta_url:"",total_budget:"",daily_budget_cap:"",start_date:"",end_date:"",payment_reference:""}}function E(r){return`$${Number(r||0).toFixed(2)}`}function Ye(r){return Number(r||0).toLocaleString()}function Wr(r=""){const f=String(r).toLowerCase();return f==="active"?"bha-status active":f==="pending"?"bha-status pending":f==="paused"?"bha-status paused":f==="rejected"?"bha-status rejected":f==="exhausted"||f==="ended"?"bha-status ended":"bha-status neutral"}function Ir(r=""){const f=String(r).toLowerCase();return f==="approved"?"bha-approval approved":f==="pending"?"bha-approval pending":f==="rejected"?"bha-approval rejected":"bha-approval neutral"}function Mr(r){var f,k,R,C,g;return(r==null?void 0:r.url)||(r==null?void 0:r.file_url)||(r==null?void 0:r.fileUrl)||(r==null?void 0:r.image_url)||(r==null?void 0:r.video_url)||(r==null?void 0:r.secure_url)||(r==null?void 0:r.location)||(r==null?void 0:r.path)||((f=r==null?void 0:r.file)==null?void 0:f.url)||((k=r==null?void 0:r.file)==null?void 0:k.file_url)||((R=r==null?void 0:r.file)==null?void 0:R.path)||((C=r==null?void 0:r.data)==null?void 0:C.url)||((g=r==null?void 0:r.data)==null?void 0:g.file_url)||""}function Hr(){const r=c.useRef(null),f=c.useRef(null),k=c.useRef(null),[R,C]=c.useState([]),[g,D]=c.useState(null),[P,B]=c.useState(null),[N,O]=c.useState(null),[Te,ae]=c.useState([]),[Ge,fe]=c.useState(!1),[Pe,le]=c.useState(200),[h,ke]=c.useState(""),[a,be]=c.useState(mr()),[ge,Ce]=c.useState(!0),[we,je]=c.useState(!1),[ye,_e]=c.useState(!1),[Y,se]=c.useState(!1),[ze,b]=c.useState(!1),[ne,de]=c.useState(!1),[Z,z]=c.useState(""),[$e,G]=c.useState(""),[De,A]=c.useState(""),[We,y]=c.useState(""),[Ie,F]=c.useState(""),ie=c.useMemo(()=>R.find(i=>String(i.id)===String(h))||null,[R,h]),U=Number((g==null?void 0:g.minimum_budget)||Pe||200),oe=Number((g==null?void 0:g.minimum_daily_cap)||20),L=Number((P==null?void 0:P.available_balance)||0),Ae=!h&&L<U,ve=(i,d=!0)=>{var l;const o=Array.isArray(i==null?void 0:i.campaigns)?i.campaigns:[];if(C(o),D((i==null?void 0:i.settings)||null),B((i==null?void 0:i.wallet)||null),O((i==null?void 0:i.analytics)||null),ae(Array.isArray(i==null?void 0:i.wallet_transactions)?i.wallet_transactions:[]),fe(!!(i!=null&&i.can_create)),le(Number((i==null?void 0:i.minimum_required)||((l=i==null?void 0:i.settings)==null?void 0:l.minimum_budget)||200)),d&&h){const n=o.find(W=>String(W.id)===String(h));if(n){ce(n);return}}!h&&o.length&&ce(o[0])},_=async(i=!1)=>{var d,o;try{i?je(!0):Ce(!0),y("");const{data:l}=await j.get("/api/affiliate/banner-home-ads");ve(l)}catch(l){y(((o=(d=l==null?void 0:l.response)==null?void 0:d.data)==null?void 0:o.message)||"Failed to load homepage slider ads")}finally{Ce(!1),je(!1)}};c.useEffect(()=>{_()},[]);const ce=i=>{ke(String(i.id)),be({campaign_title:i.campaign_title||"",campaign_description:i.campaign_description||"",internal_note:i.internal_note||"",media_type:i.media_type||"image",image_url:i.image_url||"",video_url:i.video_url||"",poster_url:i.poster_url||"",eyebrow_text:i.eyebrow_text||"Sponsored",title:i.title||"",subtitle:i.subtitle||"",promo_text:i.promo_text||"",cta_label:i.cta_label||"Shop Now",cta_url:i.cta_url||"",secondary_cta_label:i.secondary_cta_label||"",secondary_cta_url:i.secondary_cta_url||"",total_budget:i.total_budget||"",daily_budget_cap:i.daily_budget_cap||"",start_date:i.start_date?String(i.start_date).slice(0,10):"",end_date:i.end_date?String(i.end_date).slice(0,10):"",payment_reference:""}),G(""),y(""),F("")},q=()=>{ke(""),be({...mr(),total_budget:U}),G(""),y(""),F("")},v=i=>{const{name:d,value:o}=i.target;be(l=>({...l,[d]:o}))},X=async(i,d)=>{var l,n,W;const o=(l=i.target.files)==null?void 0:l[0];if(o)try{z(d),y(""),F("");const I=new FormData;I.append("file",o),I.append("type",d),I.append("folder","banner-home-ads");const{data:J}=await j.post("/api/uploads",I,{headers:{"Content-Type":"multipart/form-data"}}),M=Mr(J);if(!M)throw new Error("Upload completed, but no file URL was returned by the server.");be(x=>({...x,[d]:M})),F("File uploaded successfully.")}catch(I){y(((W=(n=I==null?void 0:I.response)==null?void 0:n.data)==null?void 0:W.message)||I.message||"Failed to upload file")}finally{z(""),i.target.value=""}},te=async(i=null)=>{var n;const{data:d}=await j.get("/api/affiliate/banner-home-ads"),o=Array.isArray(d==null?void 0:d.campaigns)?d.campaigns:[];C(o),D((d==null?void 0:d.settings)||null),B((d==null?void 0:d.wallet)||null),O((d==null?void 0:d.analytics)||null),ae(Array.isArray(d==null?void 0:d.wallet_transactions)?d.wallet_transactions:[]),fe(!!(d!=null&&d.can_create)),le(Number((d==null?void 0:d.minimum_required)||((n=d==null?void 0:d.settings)==null?void 0:n.minimum_budget)||200));const l=o.find(W=>String(W.id)===String(i||h));l?ce(l):o.length||q()},Me=async()=>{var d,o;const i=Number(De||0);if(!i||i<=0){y("Enter a valid wallet funding amount");return}try{de(!0),y(""),F("");const{data:l}=await j.post("/api/affiliate/banner-home-ads/wallet/fund",{amount:i,note:"Affiliate funded homepage slider ads wallet"});B((l==null?void 0:l.wallet)||null),ae(Array.isArray(l==null?void 0:l.wallet_transactions)?l.wallet_transactions:[]),A(""),F((l==null?void 0:l.message)||"Wallet funded successfully"),await te(h)}catch(l){y(((o=(d=l==null?void 0:l.response)==null?void 0:d.data)==null?void 0:o.message)||"Failed to fund homepage slider ads wallet")}finally{de(!1)}},ee=()=>{if(!a.campaign_title.trim())throw new Error("Campaign title is required");if(!a.title.trim())throw new Error("Slider headline is required");if(!a.cta_label.trim())throw new Error("CTA label is required");const i=Le(a.cta_url,{required:!0,allowEmpty:!1,fieldName:"CTA URL"});if(!i.ok)throw new Error(i.message);if(a.secondary_cta_url.trim()){const d=Le(a.secondary_cta_url,{required:!1,allowEmpty:!0,fieldName:"Secondary CTA URL"});if(!d.ok)throw new Error(d.message)}if(a.media_type==="image"&&!a.image_url.trim())throw new Error("Image URL is required for image slider ads");if(a.media_type==="video"&&!a.video_url.trim())throw new Error("Video URL is required for video slider ads");if(!h&&L<U)throw new Error(`Fund your Banner Home Ads Wallet with at least ${E(U)} before creating a slider ad`);if(!h&&Number(a.total_budget||0)<U)throw new Error(`Minimum homepage slider ad campaign budget is ${E(U)}`);if(!h&&Number(a.total_budget||0)>L)throw new Error(`Campaign budget cannot be higher than your wallet balance of ${E(L)}`);if(a.daily_budget_cap&&Number(a.daily_budget_cap||0)<oe)throw new Error(`Minimum daily cap is ${E(oe)}`)},He=()=>({campaign_title:a.campaign_title,campaign_description:a.campaign_description,internal_note:a.internal_note,media_type:a.media_type,image_url:a.image_url,video_url:a.media_type==="video"?a.video_url:"",poster_url:a.poster_url,eyebrow_text:a.eyebrow_text,title:a.title,subtitle:a.subtitle,promo_text:a.promo_text,cta_label:a.cta_label,cta_url:a.cta_url,secondary_cta_label:a.secondary_cta_label,secondary_cta_url:a.secondary_cta_url,total_budget:Number(a.total_budget||U),daily_budget_cap:a.daily_budget_cap===""?null:Number(a.daily_budget_cap||0),start_date:a.start_date||null,end_date:a.end_date||null,payment_reference:a.payment_reference}),qe=async i=>{var d,o,l,n,W,I,J;i.preventDefault();try{_e(!0),y(""),F(""),ee();const M=He();let x;h?x=await j.put(`/api/affiliate/banner-home-ads/${h}`,M):x=await j.post("/api/affiliate/banner-home-ads",M);const K=(d=x==null?void 0:x.data)==null?void 0:d.campaign;(o=x==null?void 0:x.data)!=null&&o.wallet&&B(x.data.wallet),(l=x==null?void 0:x.data)!=null&&l.analytics&&O(x.data.analytics),Array.isArray((n=x==null?void 0:x.data)==null?void 0:n.wallet_transactions)&&ae(x.data.wallet_transactions),K!=null&&K.id&&await te(K.id),F(((W=x==null?void 0:x.data)==null?void 0:W.message)||"Homepage slider ad saved successfully")}catch(M){y(((J=(I=M==null?void 0:M.response)==null?void 0:I.data)==null?void 0:J.message)||M.message||"Failed to save homepage slider ad")}finally{_e(!1)}},Ue=async i=>{var d,o;if(h)try{se(!0),y(""),F("");const{data:l}=await j.put(`/api/affiliate/banner-home-ads/${h}/status`,{action:i});l!=null&&l.wallet&&B(l.wallet),l!=null&&l.analytics&&O(l.analytics),await te(h),F((l==null?void 0:l.message)||"Homepage slider ad status updated")}catch(l){y(((o=(d=l==null?void 0:l.response)==null?void 0:d.data)==null?void 0:o.message)||"Failed to update homepage slider ad status")}finally{se(!1)}},Ve=async()=>{var d,o;if(!h)return;const i=Number($e||0);if(!i||i<=0){y("Enter a valid top-up amount");return}if(i>L){y(`Top-up amount cannot be higher than your wallet balance of ${E(L)}`);return}try{b(!0),y(""),F("");const{data:l}=await j.post(`/api/affiliate/banner-home-ads/${h}/top-up`,{amount:i,note:"Affiliate homepage slider ad top-up from wallet"});l!=null&&l.wallet&&B(l.wallet),l!=null&&l.analytics&&O(l.analytics),Array.isArray(l==null?void 0:l.wallet_transactions)&&ae(l.wallet_transactions),await te(h),G(""),F((l==null?void 0:l.message)||"Homepage slider ad topped up successfully")}catch(l){y(((o=(d=l==null?void 0:l.response)==null?void 0:d.data)==null?void 0:o.message)||"Failed to top up homepage slider ad")}finally{b(!1)}},Be=async()=>{var i,d;if(h)try{_e(!0),y(""),F("");const{data:o}=await j.delete(`/api/affiliate/banner-home-ads/${h}`);o!=null&&o.wallet&&B(o.wallet),o!=null&&o.analytics&&O(o.analytics),await te(),F((o==null?void 0:o.message)||"Homepage slider ad deleted successfully")}catch(o){y(((d=(i=o==null?void 0:o.response)==null?void 0:i.data)==null?void 0:d.message)||"Failed to delete homepage slider ad")}finally{_e(!1)}};return ge?e.jsxs("div",{className:"bha-page",children:[e.jsx("style",{children:xr}),e.jsx("div",{className:"bha-loading-wrap",children:e.jsxs("div",{className:"bha-loading-card",children:[e.jsx("div",{className:"bha-spinner"}),e.jsx("p",{children:"Loading homepage slider ads..."})]})})]}):e.jsxs("div",{className:"bha-page",children:[e.jsx("style",{children:xr}),e.jsx("input",{ref:r,type:"file",accept:"image/*",className:"bha-hidden-file",onChange:i=>X(i,"image_url")}),e.jsx("input",{ref:f,type:"file",accept:"video/*",className:"bha-hidden-file",onChange:i=>X(i,"video_url")}),e.jsx("input",{ref:k,type:"file",accept:"image/*",className:"bha-hidden-file",onChange:i=>X(i,"poster_url")}),e.jsxs("section",{className:"bha-hero",children:[e.jsxs("div",{children:[e.jsx("div",{className:"bha-badge",children:"Homepage Slider Ads"}),e.jsx("h1",{className:"bha-title",children:"Banner Home Ads"}),e.jsx("p",{className:"bha-subtitle",children:"Fund your Banner Home Ads Wallet, create image or video homepage slider ads, and track views, clicks, budget, and spend from one page."})]}),e.jsxs("div",{className:"bha-hero-actions",children:[e.jsxs("button",{type:"button",className:"bha-btn secondary",onClick:()=>_(!0),disabled:we,children:[e.jsx(Ze,{size:16,className:we?"spin":""}),we?"Refreshing...":"Refresh"]}),e.jsxs("button",{type:"button",className:"bha-btn primary",onClick:q,children:[e.jsx(Re,{size:16}),"New Slider Ad"]})]})]}),e.jsxs("section",{className:"bha-wallet-grid",children:[e.jsxs("div",{className:"bha-wallet-card",children:[e.jsx("div",{className:"bha-wallet-icon",children:e.jsx(Q,{size:26})}),e.jsxs("div",{children:[e.jsx("span",{children:"Banner Home Ads Wallet"}),e.jsx("strong",{children:E(P==null?void 0:P.available_balance)}),e.jsxs("p",{children:["Minimum required to create: ",e.jsx("b",{children:E(U)})]})]}),e.jsx("div",{className:L>=U?"bha-wallet-ready":"bha-wallet-locked",children:L>=U?"Ready to create":"Fund wallet to create"})]}),e.jsxs("div",{className:"bha-wallet-fund-card",children:[e.jsxs("label",{children:[e.jsx("span",{children:"Fund Wallet"}),e.jsx("input",{type:"number",min:"1",step:"0.01",value:De,onChange:i=>A(i.target.value),placeholder:"Enter amount, e.g. 500 or 1000"})]}),e.jsxs("button",{type:"button",className:"bha-btn primary",onClick:Me,disabled:ne,children:[e.jsx(Q,{size:16}),ne?"Funding...":"Fund Wallet"]})]})]}),e.jsxs("section",{className:"bha-settings-strip",children:[e.jsxs("div",{className:"bha-setting-card",children:[e.jsx(Fe,{size:18}),e.jsx("span",{children:"Minimum Budget"}),e.jsx("strong",{children:E(U)})]}),e.jsxs("div",{className:"bha-setting-card",children:[e.jsx(Q,{size:18}),e.jsx("span",{children:"Cost Per View"}),e.jsx("strong",{children:E((g==null?void 0:g.cost_per_view)||0)})]}),e.jsxs("div",{className:"bha-setting-card",children:[e.jsx(Q,{size:18}),e.jsx("span",{children:"Cost Per Click"}),e.jsx("strong",{children:E((g==null?void 0:g.cost_per_click)||0)})]}),e.jsxs("div",{className:"bha-setting-card",children:[e.jsx(ur,{size:18}),e.jsx("span",{children:"Slider Position"}),e.jsxs("strong",{children:["Slot ",(g==null?void 0:g.ad_insert_position)||5]})]})]}),e.jsxs("section",{className:"bha-analytics-strip",children:[e.jsxs("div",{className:"bha-analytics-card",children:[e.jsx("span",{children:"Total Funded"}),e.jsx("strong",{children:E(P==null?void 0:P.total_funded)})]}),e.jsxs("div",{className:"bha-analytics-card",children:[e.jsx("span",{children:"Total Spent"}),e.jsx("strong",{children:E((N==null?void 0:N.total_spent)||(P==null?void 0:P.total_spent))})]}),e.jsxs("div",{className:"bha-analytics-card",children:[e.jsx("span",{children:"Total Views"}),e.jsx("strong",{children:Ye(N==null?void 0:N.total_views)})]}),e.jsxs("div",{className:"bha-analytics-card",children:[e.jsx("span",{children:"Total Clicks"}),e.jsx("strong",{children:Ye(N==null?void 0:N.total_clicks)})]}),e.jsxs("div",{className:"bha-analytics-card",children:[e.jsx("span",{children:"Active Ads"}),e.jsx("strong",{children:Ye(N==null?void 0:N.active_campaigns)})]}),e.jsxs("div",{className:"bha-analytics-card",children:[e.jsx("span",{children:"Pending Ads"}),e.jsx("strong",{children:Ye(N==null?void 0:N.pending_campaigns)})]})]}),We?e.jsxs("div",{className:"bha-alert error bha-page-alert",children:[e.jsx(Ne,{size:18}),e.jsx("span",{children:We})]}):null,Ie?e.jsxs("div",{className:"bha-alert success bha-page-alert",children:[e.jsx(rr,{size:18}),e.jsx("span",{children:Ie})]}):null,e.jsxs("section",{className:"bha-grid",children:[e.jsxs("aside",{className:"bha-panel",children:[e.jsx("div",{className:"bha-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{children:"Campaign list"}),e.jsx("h2",{children:"Your Slider Ads"})]})}),R.length?e.jsx("div",{className:"bha-campaign-list",children:R.map(i=>{const d=String(h)===String(i.id);return e.jsxs("button",{type:"button",className:`bha-campaign-card${d?" active":""}`,onClick:()=>ce(i),children:[e.jsxs("div",{className:"bha-campaign-top",children:[e.jsxs("div",{children:[e.jsx("h3",{children:i.campaign_title||"Untitled Campaign"}),e.jsx("p",{children:i.media_type==="video"?"Video slider ad":"Image slider ad"})]}),e.jsx("span",{className:Wr(i.status),children:i.status||"-"})]}),e.jsxs("div",{className:"bha-campaign-metrics",children:[e.jsxs("span",{children:["Views: ",i.total_views||0]}),e.jsxs("span",{children:["Clicks: ",i.total_clicks||0]}),e.jsxs("span",{children:["Left: ",E(i.remaining_budget)]})]}),e.jsx("span",{className:Ir(i.approval_status),children:i.approval_status||"pending"})]},i.id)})}):e.jsxs("div",{className:"bha-empty",children:[e.jsx(ur,{size:28}),e.jsx("strong",{children:"No homepage slider ads yet."}),e.jsx("span",{children:"Create your first slider ad."})]}),Te.length?e.jsxs("div",{className:"bha-wallet-history",children:[e.jsx("h3",{children:"Wallet History"}),e.jsx("div",{className:"bha-wallet-history-list",children:Te.slice(0,8).map(i=>e.jsxs("div",{className:"bha-wallet-history-item",children:[e.jsxs("div",{children:[e.jsx("strong",{children:String(i.transaction_type||"").replace(/_/g," ")}),e.jsx("span",{children:i.note||"Wallet transaction"})]}),e.jsx("em",{children:E(i.amount)})]},i.id))})]}):null]}),e.jsxs("main",{className:"bha-main-stack",children:[e.jsxs("section",{className:"bha-panel",children:[e.jsx("div",{className:"bha-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{children:"Editor"}),e.jsx("h2",{children:h?"Edit Slider Ad":"Create Slider Ad"})]})}),Ae?e.jsxs("div",{className:"bha-create-lock",children:[e.jsx(Ne,{size:18}),e.jsxs("span",{children:["Your wallet balance is ",E(L),". Fund at least ",E(U),"before creating a homepage slider ad."]})]}):null,e.jsxs("form",{className:"bha-form",onSubmit:qe,children:[e.jsxs("div",{className:"bha-form-grid",children:[e.jsxs("label",{className:"bha-field",children:[e.jsx("span",{children:"Campaign Title"}),e.jsx("input",{name:"campaign_title",value:a.campaign_title,onChange:v,placeholder:"Campaign title"})]}),e.jsxs("label",{className:"bha-field",children:[e.jsx("span",{children:"Media Type"}),e.jsxs("select",{name:"media_type",value:a.media_type,onChange:v,children:[e.jsx("option",{value:"image",children:"Image"}),e.jsx("option",{value:"video",children:"Video"})]})]}),e.jsxs("label",{className:"bha-field",children:[e.jsx("span",{children:"Eyebrow Text"}),e.jsx("input",{name:"eyebrow_text",value:a.eyebrow_text,onChange:v,placeholder:"Sponsored"})]}),e.jsxs("label",{className:"bha-field",children:[e.jsx("span",{children:"Promo Text"}),e.jsx("input",{name:"promo_text",value:a.promo_text,onChange:v,placeholder:"Limited offer"})]}),e.jsxs("label",{className:"bha-field bha-field-full",children:[e.jsx("span",{children:"Main Headline"}),e.jsx("input",{name:"title",value:a.title,onChange:v,placeholder:"Your slider headline"})]}),e.jsxs("label",{className:"bha-field bha-field-full",children:[e.jsx("span",{children:"Subtitle"}),e.jsx("textarea",{name:"subtitle",value:a.subtitle,onChange:v,placeholder:"Short text to support your slider headline",rows:3})]}),e.jsxs("label",{className:"bha-field bha-field-full",children:[e.jsx("span",{children:"Campaign Description"}),e.jsx("textarea",{name:"campaign_description",value:a.campaign_description,onChange:v,placeholder:"Describe this ad for admin review",rows:3})]}),a.media_type==="image"?e.jsxs("div",{className:"bha-field bha-field-full",children:[e.jsxs("span",{children:[e.jsx(me,{size:15}),"Image Upload"]}),e.jsxs("div",{className:"bha-upload-row",children:[e.jsx("input",{name:"image_url",value:a.image_url,onChange:v,placeholder:"Image URL or upload from device"}),e.jsxs("button",{type:"button",className:"bha-upload-btn",onClick:()=>{var i;return(i=r.current)==null?void 0:i.click()},disabled:Z==="image_url",children:[e.jsx(xe,{size:16}),Z==="image_url"?"Uploading...":"Pick Image"]})]}),e.jsx("small",{children:"Upload from mobile or computer, or paste an image URL manually."})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"bha-field bha-field-full",children:[e.jsxs("span",{children:[e.jsx(er,{size:15}),"Video Upload"]}),e.jsxs("div",{className:"bha-upload-row",children:[e.jsx("input",{name:"video_url",value:a.video_url,onChange:v,placeholder:"YouTube, VideoGad, direct video URL, or upload from device"}),e.jsxs("button",{type:"button",className:"bha-upload-btn",onClick:()=>{var i;return(i=f.current)==null?void 0:i.click()},disabled:Z==="video_url",children:[e.jsx(xe,{size:16}),Z==="video_url"?"Uploading...":"Pick Video"]})]}),e.jsx("small",{children:"Upload MP4/WebM from device, or paste YouTube/VideoGad/direct video URL."})]}),e.jsxs("div",{className:"bha-field bha-field-full",children:[e.jsx("span",{children:"Poster Image Upload"}),e.jsxs("div",{className:"bha-upload-row",children:[e.jsx("input",{name:"poster_url",value:a.poster_url,onChange:v,placeholder:"Poster image URL or upload from device"}),e.jsxs("button",{type:"button",className:"bha-upload-btn",onClick:()=>{var i;return(i=k.current)==null?void 0:i.click()},disabled:Z==="poster_url",children:[e.jsx(xe,{size:16}),Z==="poster_url"?"Uploading...":"Pick Poster"]})]}),e.jsx("small",{children:"This image shows before the video loads and inside the preview."})]})]}),e.jsxs("label",{className:"bha-field",children:[e.jsx("span",{children:"CTA Label"}),e.jsx("input",{name:"cta_label",value:a.cta_label,onChange:v,placeholder:"Shop Now"})]}),e.jsxs("label",{className:"bha-field",children:[e.jsx("span",{children:"CTA URL"}),e.jsx("input",{name:"cta_url",value:a.cta_url,onChange:v,placeholder:"https://example.com/your-link"})]}),e.jsxs("label",{className:"bha-field",children:[e.jsx("span",{children:"Secondary CTA Label"}),e.jsx("input",{name:"secondary_cta_label",value:a.secondary_cta_label,onChange:v,placeholder:"Learn More"})]}),e.jsxs("label",{className:"bha-field",children:[e.jsx("span",{children:"Secondary CTA URL"}),e.jsx("input",{name:"secondary_cta_url",value:a.secondary_cta_url,onChange:v,placeholder:"https://example.com/your-link"})]}),h?null:e.jsxs("label",{className:"bha-field",children:[e.jsx("span",{children:"Campaign Budget From Wallet"}),e.jsx("input",{type:"number",min:U,max:L,step:"0.01",name:"total_budget",value:a.total_budget,onChange:v,placeholder:String(U)}),e.jsxs("small",{children:["Available wallet balance: ",E(L)]})]}),e.jsxs("label",{className:"bha-field",children:[e.jsx("span",{children:"Daily Budget Cap"}),e.jsx("input",{type:"number",min:oe,step:"0.01",name:"daily_budget_cap",value:a.daily_budget_cap,onChange:v,placeholder:`Optional, min ${oe}`})]}),e.jsxs("label",{className:"bha-field",children:[e.jsx("span",{children:"Start Date"}),e.jsx("input",{type:"date",name:"start_date",value:a.start_date,onChange:v})]}),e.jsxs("label",{className:"bha-field",children:[e.jsx("span",{children:"End Date"}),e.jsx("input",{type:"date",name:"end_date",value:a.end_date,onChange:v})]}),h?null:e.jsxs("label",{className:"bha-field bha-field-full",children:[e.jsx("span",{children:"Payment Reference"}),e.jsx("input",{name:"payment_reference",value:a.payment_reference,onChange:v,placeholder:"Optional payment reference"})]})]}),e.jsxs("div",{className:"bha-actions",children:[e.jsxs("button",{type:"submit",className:"bha-btn primary",disabled:ye||!!Z||Ae,children:[e.jsx(sr,{size:16}),ye?"Saving...":h?"Update Ad":"Submit For Approval"]}),h&&(ie==null?void 0:ie.status)==="active"?e.jsxs("button",{type:"button",className:"bha-btn secondary",disabled:Y,onClick:()=>Ue("pause"),children:[e.jsx(tr,{size:16}),Y?"Updating...":"Pause"]}):null,h&&(ie==null?void 0:ie.status)==="paused"?e.jsxs("button",{type:"button",className:"bha-btn secondary",disabled:Y,onClick:()=>Ue("resume"),children:[e.jsx(ar,{size:16}),Y?"Updating...":"Resume"]}):null,h?e.jsxs("button",{type:"button",className:"bha-btn danger",disabled:ye,onClick:Be,children:[e.jsx(lr,{size:16}),"Delete"]}):null]})]})]}),h?e.jsxs("section",{className:"bha-panel",children:[e.jsx("div",{className:"bha-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{children:"Funding"}),e.jsx("h2",{children:"Top Up Campaign From Wallet"})]})}),e.jsxs("div",{className:"bha-topup-row",children:[e.jsx("input",{type:"number",step:"0.01",min:"1",max:L,value:$e,onChange:i=>G(i.target.value),placeholder:`Top-up amount, wallet balance ${E(L)}`}),e.jsxs("button",{type:"button",className:"bha-btn primary",onClick:Ve,disabled:ze,children:[e.jsx(Q,{size:16}),ze?"Adding...":"Top Up"]})]})]}):null]})]}),e.jsxs("section",{className:"bha-panel bha-preview-footer-panel",children:[e.jsx("div",{className:"bha-panel-head",children:e.jsxs("div",{children:[e.jsx("p",{children:"Live Preview"}),e.jsx("h2",{children:"Homepage Slider Banner Preview"})]})}),e.jsxs("div",{className:"bha-footer-preview",children:[e.jsxs("div",{className:"bha-footer-preview-left",children:[e.jsx("span",{className:"bha-preview-eyebrow",children:a.eyebrow_text||"Sponsored"}),e.jsx("h3",{children:a.title||"Your slider headline appears here"}),e.jsx("p",{children:a.subtitle||"Your slider subtitle will appear here as users view the homepage banner."}),e.jsxs("div",{className:"bha-footer-preview-actions",children:[e.jsx("span",{children:a.cta_label||"Shop Now"}),a.secondary_cta_label?e.jsx("em",{children:a.secondary_cta_label}):null,a.promo_text?e.jsx("strong",{children:a.promo_text}):null]})]}),e.jsxs("div",{className:"bha-footer-preview-media",children:[e.jsx("div",{className:"bha-footer-preview-shape bha-footer-preview-shape-one"}),e.jsx("div",{className:"bha-footer-preview-shape bha-footer-preview-shape-two"}),a.media_type==="video"?a.poster_url?e.jsx("img",{src:a.poster_url,alt:"Video poster preview"}):e.jsxs("div",{className:"bha-preview-video-box",children:[e.jsx(er,{size:42}),e.jsx("span",{children:"Video Preview"})]}):a.image_url?e.jsx("img",{src:a.image_url,alt:"Slider ad preview"}):e.jsxs("div",{className:"bha-preview-video-box",children:[e.jsx(me,{size:42}),e.jsx("span",{children:"Image Preview"})]})]})]})]})]})}const xr=`
  * {
    box-sizing: border-box;
  }

  .bha-page {
    width: 100%;
  }

  .bha-hidden-file {
    display: none;
  }

  .bha-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .bha-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .bha-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: bhaSpin 0.8s linear infinite;
  }

  @keyframes bhaSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: bhaSpin 0.8s linear infinite;
  }

  .bha-hero {
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

  .bha-badge {
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

  .bha-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .bha-subtitle {
    margin: 12px 0 0;
    max-width: 800px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .bha-hero-actions,
  .bha-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .bha-wallet-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
    gap: 16px;
    margin-bottom: 20px;
  }

  .bha-wallet-card,
  .bha-wallet-fund-card {
    background: #111827;
    color: #ffffff;
    border-radius: 26px;
    padding: 22px;
    box-shadow: 0 20px 45px rgba(17, 24, 39, 0.18);
  }

  .bha-wallet-card {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 18px;
  }

  .bha-wallet-icon {
    width: 58px;
    height: 58px;
    border-radius: 20px;
    display: grid;
    place-items: center;
    background: rgba(255,255,255,0.12);
  }

  .bha-wallet-card span,
  .bha-wallet-fund-card span {
    display: block;
    font-size: 13px;
    font-weight: 800;
    color: rgba(255,255,255,0.72);
    margin-bottom: 6px;
  }

  .bha-wallet-card strong {
    display: block;
    font-size: clamp(30px, 4vw, 46px);
    line-height: 1;
    font-weight: 950;
  }

  .bha-wallet-card p {
    margin: 8px 0 0;
    color: rgba(255,255,255,0.72);
    font-weight: 700;
  }

  .bha-wallet-ready,
  .bha-wallet-locked {
    border-radius: 999px;
    padding: 10px 14px;
    font-size: 12px;
    font-weight: 900;
    white-space: nowrap;
  }

  .bha-wallet-ready {
    background: #ecfdf3;
    color: #027a48;
  }

  .bha-wallet-locked {
    background: #fff7ed;
    color: #b54708;
  }

  .bha-wallet-fund-card {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    align-items: end;
  }

  .bha-wallet-fund-card label {
    display: grid;
    gap: 8px;
  }

  .bha-wallet-fund-card input {
    width: 100%;
    min-height: 48px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.18);
    background: rgba(255,255,255,0.1);
    color: #ffffff;
    padding: 0 14px;
    outline: none;
    font-weight: 800;
  }

  .bha-wallet-fund-card input::placeholder {
    color: rgba(255,255,255,0.55);
  }

  .bha-settings-strip,
  .bha-analytics-strip {
    display: grid;
    gap: 14px;
    margin-bottom: 20px;
  }

  .bha-settings-strip {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .bha-analytics-strip {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .bha-setting-card,
  .bha-analytics-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    padding: 16px;
    display: grid;
    gap: 8px;
    color: #111827;
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.04);
  }

  .bha-setting-card svg {
    color: #ff2b05;
  }

  .bha-setting-card span,
  .bha-analytics-card span {
    color: #6b7280;
    font-size: 13px;
    font-weight: 700;
  }

  .bha-setting-card strong,
  .bha-analytics-card strong {
    font-size: 22px;
    font-weight: 900;
  }

  .bha-page-alert {
    margin-bottom: 16px;
  }

  .bha-grid {
    display: grid;
    grid-template-columns: minmax(260px, 0.7fr) minmax(520px, 1.8fr);
    gap: 20px;
    align-items: start;
  }

  .bha-main-stack {
    display: grid;
    gap: 20px;
  }

  .bha-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .bha-preview-footer-panel {
    margin-top: 20px;
  }

  .bha-panel-head {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .bha-panel-head p {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .bha-panel-head h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
  }

  .bha-btn,
  .bha-upload-btn {
    height: 46px;
    padding: 0 16px;
    border-radius: 14px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    color: #111827;
    font-size: 14px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: 0.2s ease;
    white-space: nowrap;
  }

  .bha-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .bha-btn.secondary {
    background: #ffffff;
    color: #111827;
  }

  .bha-btn.danger {
    background: #fff1f2;
    color: #be123c;
    border-color: #fecdd3;
  }

  .bha-btn:disabled,
  .bha-upload-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .bha-upload-btn {
    background: #111827;
    border-color: #111827;
    color: #ffffff;
    min-width: 150px;
  }

  .bha-upload-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
  }

  .bha-field small {
    color: #64748b;
    font-size: 12px;
    font-weight: 700;
  }

  .bha-create-lock {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    background: #fff7ed;
    color: #9a3412;
    border: 1px solid #fed7aa;
    border-radius: 18px;
    padding: 14px 16px;
    margin-bottom: 18px;
    font-weight: 800;
    line-height: 1.5;
  }

  .bha-campaign-list {
    display: grid;
    gap: 12px;
  }

  .bha-campaign-card {
    width: 100%;
    padding: 16px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    cursor: pointer;
    text-align: left;
    display: grid;
    gap: 12px;
  }

  .bha-campaign-card.active {
    border-color: #111827;
    background: #ffffff;
    box-shadow: inset 0 0 0 1px #111827;
  }

  .bha-campaign-top {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  .bha-campaign-top h3 {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 900;
    color: #111827;
  }

  .bha-campaign-top p {
    margin: 0;
    color: #6b7280;
    font-size: 13px;
  }

  .bha-campaign-metrics {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .bha-campaign-metrics span {
    font-size: 11px;
    font-weight: 800;
    color: #334155;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    padding: 6px 8px;
    border-radius: 999px;
  }

  .bha-status,
  .bha-approval {
    display: inline-flex;
    width: fit-content;
    align-items: center;
    justify-content: center;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 900;
    text-transform: capitalize;
    border: 1px solid transparent;
    white-space: nowrap;
  }

  .bha-status.active,
  .bha-approval.approved {
    background: #ecfdf3;
    color: #027a48;
    border-color: #abefc6;
  }

  .bha-status.pending,
  .bha-approval.pending {
    background: #fff7ed;
    color: #b54708;
    border-color: #fed7aa;
  }

  .bha-status.paused {
    background: #eff6ff;
    color: #1d4ed8;
    border-color: #bfdbfe;
  }

  .bha-status.rejected,
  .bha-approval.rejected {
    background: #fff1f2;
    color: #be123c;
    border-color: #fecdd3;
  }

  .bha-status.ended {
    background: #f1f5f9;
    color: #475569;
    border-color: #cbd5e1;
  }

  .bha-status.neutral,
  .bha-approval.neutral {
    background: #eef2f7;
    color: #344054;
    border-color: #dbe2ea;
  }

  .bha-wallet-history {
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid #edf2f7;
  }

  .bha-wallet-history h3 {
    margin: 0 0 12px;
    color: #111827;
    font-size: 16px;
    font-weight: 900;
  }

  .bha-wallet-history-list {
    display: grid;
    gap: 10px;
  }

  .bha-wallet-history-item {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 14px;
    padding: 12px;
  }

  .bha-wallet-history-item strong {
    display: block;
    color: #111827;
    font-size: 13px;
    text-transform: capitalize;
  }

  .bha-wallet-history-item span {
    display: block;
    color: #64748b;
    font-size: 12px;
    margin-top: 3px;
    line-height: 1.4;
  }

  .bha-wallet-history-item em {
    font-style: normal;
    color: #111827;
    font-weight: 900;
    white-space: nowrap;
  }

  .bha-form {
    display: grid;
    gap: 18px;
  }

  .bha-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .bha-field {
    display: grid;
    gap: 8px;
  }

  .bha-field-full {
    grid-column: span 2;
  }

  .bha-field span {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    font-weight: 800;
    color: #111827;
  }

  .bha-field input,
  .bha-field select,
  .bha-field textarea,
  .bha-topup-row input {
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

  .bha-field textarea {
    padding: 14px;
    resize: vertical;
  }

  .bha-field input:focus,
  .bha-field select:focus,
  .bha-field textarea:focus,
  .bha-topup-row input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.06);
  }

  .bha-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
  }

  .bha-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .bha-alert.success {
    background: #ecfdf3;
    border: 1px solid #abefc6;
    color: #027a48;
  }

  .bha-topup-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
  }

  .bha-empty {
    min-height: 220px;
    border: 1px dashed #dbe2ea;
    background: #f8fafc;
    border-radius: 20px;
    display: grid;
    place-items: center;
    text-align: center;
    padding: 22px;
    color: #6b7280;
  }

  .bha-empty strong {
    color: #111827;
  }

  .bha-footer-preview {
    position: relative;
    overflow: hidden;
    min-height: 430px;
    border-radius: 28px;
    display: grid;
    grid-template-columns: 37% 63%;
    align-items: center;
    background:
      radial-gradient(circle at top left, rgba(255, 255, 255, 0.18), transparent 28%),
      linear-gradient(135deg, #e0b894 0%, #ddb38c 38%, #dcb28b 100%);
  }

  .bha-footer-preview::before {
    content: "";
    position: absolute;
    left: -90px;
    top: 60px;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    background:
      radial-gradient(circle, rgba(255, 255, 255, 0.12) 0, rgba(255, 255, 255, 0.12) 22%, transparent 23%),
      radial-gradient(circle, rgba(255, 255, 255, 0.08) 0, rgba(255, 255, 255, 0.08) 38%, transparent 39%),
      radial-gradient(circle, rgba(111, 78, 55, 0.05) 0, rgba(111, 78, 55, 0.05) 54%, transparent 55%);
    pointer-events: none;
  }

  .bha-footer-preview-left {
    position: relative;
    z-index: 3;
    padding: 46px 26px 46px 58px;
    display: grid;
    align-content: center;
    gap: 16px;
  }

  .bha-preview-eyebrow {
    display: inline-flex;
    width: fit-content;
    border-radius: 999px;
    background: rgba(255,255,255,0.24);
    border: 1px solid rgba(255,255,255,0.32);
    color: #3f332c;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .bha-footer-preview-left h3 {
    margin: 0;
    color: #3a322e;
    font-size: clamp(34px, 4.8vw, 68px);
    line-height: 0.96;
    font-weight: 950;
    letter-spacing: -0.06em;
  }

  .bha-footer-preview-left p {
    margin: 0;
    max-width: 520px;
    color: rgba(58, 50, 46, 0.78);
    line-height: 1.7;
    font-size: 16px;
    font-weight: 750;
  }

  .bha-footer-preview-actions {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    margin-top: 8px;
  }

  .bha-footer-preview-actions span,
  .bha-footer-preview-actions em {
    min-height: 50px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    padding: 0 22px;
    font-size: 13px;
    font-weight: 900;
    font-style: normal;
  }

  .bha-footer-preview-actions span {
    background: #ffffff;
    color: #111827;
  }

  .bha-footer-preview-actions em {
    border: 1px solid rgba(17, 24, 39, 0.18);
    background: rgba(255, 255, 255, 0.34);
    color: #3a322e;
  }

  .bha-footer-preview-actions strong {
    color: #3a322e;
    font-size: 34px;
    font-weight: 950;
  }

  .bha-footer-preview-media {
    position: relative;
    z-index: 2;
    min-height: 430px;
    display: grid;
    place-items: center;
    padding: 34px 46px 34px 0;
  }

  .bha-footer-preview-media img,
  .bha-preview-video-box {
    position: relative;
    z-index: 4;
    width: min(880px, 94%);
    height: 330px;
    border-radius: 46px;
    object-fit: cover;
    background: rgba(255,255,255,0.16);
    border: 1px solid rgba(255,255,255,0.26);
    box-shadow: 0 30px 80px rgba(15, 23, 42, 0.22);
  }

  .bha-preview-video-box {
    display: grid;
    place-items: center;
    color: rgba(58, 50, 46, 0.72);
    font-weight: 900;
  }

  .bha-footer-preview-shape {
    position: absolute;
    pointer-events: none;
    border-radius: 50%;
    z-index: 5;
    background: rgba(70, 51, 38, 0.14);
  }

  .bha-footer-preview-shape-one {
    top: 48px;
    right: 150px;
    width: 76px;
    height: 76px;
  }

  .bha-footer-preview-shape-two {
    right: 56px;
    top: 90px;
    width: 42px;
    height: 42px;
  }

  @media (max-width: 1280px) {
    .bha-grid,
    .bha-wallet-grid {
      grid-template-columns: 1fr;
    }

    .bha-settings-strip {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .bha-analytics-strip {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 900px) {
    .bha-footer-preview {
      grid-template-columns: 1fr;
    }

    .bha-footer-preview-left {
      padding: 32px 24px 12px;
    }

    .bha-footer-preview-media {
      min-height: 300px;
      padding: 16px 24px 32px;
    }

    .bha-footer-preview-media img,
    .bha-preview-video-box {
      width: 100%;
      height: 280px;
      border-radius: 30px;
    }
  }

  @media (max-width: 767px) {
    .bha-hero,
    .bha-actions,
    .bha-hero-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .bha-settings-strip,
    .bha-analytics-strip,
    .bha-form-grid,
    .bha-wallet-card,
    .bha-wallet-fund-card {
      grid-template-columns: 1fr;
    }

    .bha-wallet-card {
      align-items: start;
    }

    .bha-field-full {
      grid-column: span 1;
    }

    .bha-topup-row,
    .bha-upload-row {
      grid-template-columns: 1fr;
    }

    .bha-btn,
    .bha-upload-btn {
      width: 100%;
    }

    .bha-title {
      font-size: 24px;
    }

    .bha-panel {
      padding: 18px;
    }
  }
`;function fr(){return{image:"",title:"",subtitle:"",link_type:"internal_post",linked_post_id:"",linked_product_id:"",external_url:"",sort_order:1,status:"active"}}function Qe(r=200){return{campaign_title:"",campaign_description:"",internal_note:"",media_type:"image",image_url:"",video_url:"",poster_url:"",eyebrow_text:"Sponsored",title:"",subtitle:"",promo_text:"",cta_label:"Shop Now",cta_url:"",secondary_cta_label:"",secondary_cta_url:"",total_budget:r,daily_budget_cap:"",start_date:"",end_date:"",payment_reference:""}}function T(r){return`$${Number(r||0).toFixed(2)}`}function Se(r){return Number(r||0).toLocaleString()}function br(r){var f,k,R,C,g;return(r==null?void 0:r.url)||(r==null?void 0:r.file_url)||(r==null?void 0:r.fileUrl)||(r==null?void 0:r.image_url)||(r==null?void 0:r.video_url)||(r==null?void 0:r.secure_url)||(r==null?void 0:r.location)||(r==null?void 0:r.path)||((f=r==null?void 0:r.file)==null?void 0:f.url)||((k=r==null?void 0:r.file)==null?void 0:k.file_url)||((R=r==null?void 0:r.file)==null?void 0:R.path)||((C=r==null?void 0:r.data)==null?void 0:C.url)||((g=r==null?void 0:r.data)==null?void 0:g.file_url)||""}function gr(r){return r?String(r).slice(0,10):""}function ir(r=""){const f=String(r).toLowerCase();return["active","approved","published"].includes(f)?"success":["pending","daily_paused"].includes(f)?"warning":["paused","inactive"].includes(f)?"muted":["rejected","ended","exhausted"].includes(f)?"danger":"neutral"}function wr(r){var f,k;return(r==null?void 0:r.link_type)==="product"?((f=r==null?void 0:r.linked_product)==null?void 0:f.title)||"Product":(r==null?void 0:r.link_type)==="external_url"?(r==null?void 0:r.external_url)||"External URL":((k=r==null?void 0:r.linked_post)==null?void 0:k.title)||"Post"}function qr({slider:r,onEdit:f,onStatus:k,onDelete:R,busyId:C}){const g=String((r==null?void 0:r.status)||"").toLowerCase()==="active";return e.jsxs("article",{className:"writer-slider-card",children:[e.jsxs("div",{className:"writer-slider-image",children:[r!=null&&r.image?e.jsx("img",{src:r.image,alt:(r==null?void 0:r.title)||"Storefront slider"}):e.jsxs("div",{className:"writer-slider-image-empty",children:[e.jsx(me,{size:30}),e.jsx("span",{children:"No image"})]}),e.jsx("span",{className:`writer-slider-pill ${ir(r==null?void 0:r.status)}`,children:(r==null?void 0:r.status)||"inactive"})]}),e.jsxs("div",{className:"writer-slider-card-body",children:[e.jsxs("div",{className:"writer-slider-card-title-row",children:[e.jsxs("div",{children:[e.jsx("h3",{children:(r==null?void 0:r.title)||"Untitled slider"}),e.jsx("p",{children:(r==null?void 0:r.subtitle)||"No subtitle added."})]}),e.jsxs("span",{className:"writer-slider-order",children:["#",Number((r==null?void 0:r.sort_order)||0)]})]}),e.jsxs("div",{className:"writer-slider-meta",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Destination"}),e.jsx("strong",{title:wr(r),children:wr(r)})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Type"}),e.jsx("strong",{children:String((r==null?void 0:r.link_type)||"internal_post").replace(/_/g," ")})]})]}),e.jsxs("div",{className:"writer-slider-actions",children:[e.jsxs("button",{type:"button",className:"writer-sliders-btn secondary",onClick:()=>f(r),children:[e.jsx(jr,{size:15}),"Edit"]}),e.jsxs("button",{type:"button",className:"writer-sliders-btn secondary",disabled:String(C)===String(r==null?void 0:r.id),onClick:()=>k(r),children:[g?e.jsx(tr,{size:15}):e.jsx(ar,{size:15}),g?"Disable":"Enable"]}),e.jsxs("button",{type:"button",className:"writer-sliders-btn danger-ghost",disabled:String(C)===String(r==null?void 0:r.id),onClick:()=>R(r),children:[e.jsx(lr,{size:15}),"Delete"]})]})]})]})}function Vr({campaign:r,onEdit:f,onStatus:k,onTopUp:R,onDelete:C,busyId:g}){const D=String((r==null?void 0:r.status)||"").toLowerCase(),P=D==="active"||D==="daily_paused",B=D==="paused",N=!["active","ended","exhausted"].includes(D),O=!["active","daily_paused"].includes(D);return e.jsxs("article",{className:"writer-ad-card",children:[e.jsxs("div",{className:"writer-ad-card-head",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"writer-ad-card-pills",children:[e.jsx("span",{className:`writer-slider-pill ${ir(r==null?void 0:r.status)}`,children:(r==null?void 0:r.status)||"pending"}),e.jsx("span",{className:`writer-slider-pill ${ir(r==null?void 0:r.approval_status)}`,children:(r==null?void 0:r.approval_status)||"pending"})]}),e.jsx("h3",{children:(r==null?void 0:r.campaign_title)||"Untitled campaign"}),e.jsx("p",{children:(r==null?void 0:r.title)||"Homepage slider ad"})]}),e.jsxs("div",{className:"writer-ad-budget",children:[e.jsx("span",{children:"Remaining"}),e.jsx("strong",{children:T(r==null?void 0:r.remaining_budget)})]})]}),e.jsxs("div",{className:"writer-ad-metrics",children:[e.jsxs("div",{children:[e.jsx($r,{size:15}),e.jsx("span",{children:"Views"}),e.jsx("strong",{children:Se(r==null?void 0:r.total_views)})]}),e.jsxs("div",{children:[e.jsx(Dr,{size:15}),e.jsx("span",{children:"Clicks"}),e.jsx("strong",{children:Se(r==null?void 0:r.total_clicks)})]}),e.jsxs("div",{children:[e.jsx(Q,{size:15}),e.jsx("span",{children:"Budget"}),e.jsx("strong",{children:T(r==null?void 0:r.total_budget)})]})]}),e.jsxs("div",{className:"writer-slider-actions",children:[e.jsxs("button",{type:"button",className:"writer-sliders-btn secondary",disabled:!N||String(g)===String(r==null?void 0:r.id),onClick:()=>f(r),title:N?"Edit campaign":"Pause the campaign before editing",children:[e.jsx(jr,{size:15}),"Edit"]}),P?e.jsxs("button",{type:"button",className:"writer-sliders-btn secondary",disabled:String(g)===String(r==null?void 0:r.id),onClick:()=>k(r,"pause"),children:[e.jsx(tr,{size:15}),"Pause"]}):null,B?e.jsxs("button",{type:"button",className:"writer-sliders-btn secondary",disabled:String(g)===String(r==null?void 0:r.id),onClick:()=>k(r,"resume"),children:[e.jsx(ar,{size:15}),"Resume"]}):null,e.jsxs("button",{type:"button",className:"writer-sliders-btn secondary",disabled:String(g)===String(r==null?void 0:r.id),onClick:()=>R(r),children:[e.jsx(Q,{size:15}),"Top Up"]}),e.jsxs("button",{type:"button",className:"writer-sliders-btn danger-ghost",disabled:!O||String(g)===String(r==null?void 0:r.id),onClick:()=>C(r),title:O?"Delete campaign":"Pause the campaign before deleting",children:[e.jsx(lr,{size:15}),"Delete"]})]})]})}function Br(){var cr,pr;const r=c.useRef(null),f=c.useRef(null),k=c.useRef(null),R=c.useRef(null),[C,g]=c.useState("storefront"),[D,P]=c.useState([]),[B,N]=c.useState([]),[O,Te]=c.useState([]),[ae,Ge]=c.useState(!0),[fe,Pe]=c.useState(!1),[le,h]=c.useState(""),[ke,a]=c.useState(""),[be,ge]=c.useState(""),[Ce,we]=c.useState(!1),[je,ye]=c.useState(!1),[_e,Y]=c.useState(!1),[se,ze]=c.useState(""),[b,ne]=c.useState(fr()),[de,Z]=c.useState([]),[z,$e]=c.useState(null),[G,De]=c.useState(null),[A,We]=c.useState(null),[y,Ie]=c.useState([]),[F,ie]=c.useState(!1),[U,oe]=c.useState(!1),[L,Ae]=c.useState(!1),[ve,_]=c.useState(""),[ce,q]=c.useState(""),[v,X]=c.useState(""),[te,Me]=c.useState(!1),[ee,He]=c.useState(""),[qe,Ue]=c.useState(!1),[Ve,Be]=c.useState(""),[i,d]=c.useState(!1),[o,l]=c.useState(""),[n,W]=c.useState(Qe()),[I,J]=c.useState(""),M=c.useMemo(()=>{const s=D.length,u=D.filter(t=>String((t==null?void 0:t.status)||"").toLowerCase()==="active").length,m=s-u;return{total:s,active:u,inactive:m}},[D]),x=Number((z==null?void 0:z.minimum_budget)||200),K=Number((z==null?void 0:z.minimum_daily_cap)||20),H=Number((G==null?void 0:G.available_balance)||0),Ee=async(s=!1)=>{var u,m,t,p,w,$,ue,he;try{s?Pe(!0):Ge(!0),h("");const V=await Promise.allSettled([j.get("/api/affiliate/sliders"),j.get("/api/affiliate/posts"),j.get("/api/affiliate/products")]),Oe=V[0],Je=V[1],Ke=V[2];if(Oe.status==="rejected")throw Oe.reason;P(Array.isArray((m=(u=Oe.value)==null?void 0:u.data)==null?void 0:m.sliders)?Oe.value.data.sliders:[]),Je.status==="fulfilled"&&N(Array.isArray((p=(t=Je.value)==null?void 0:t.data)==null?void 0:p.posts)?Je.value.data.posts:[]),Ke.status==="fulfilled"&&Te(Array.isArray(($=(w=Ke.value)==null?void 0:w.data)==null?void 0:$.products)?Ke.value.data.products:[])}catch(V){h(((he=(ue=V==null?void 0:V.response)==null?void 0:ue.data)==null?void 0:he.message)||(V==null?void 0:V.message)||"Failed to load storefront sliders")}finally{Ge(!1),Pe(!1)}},pe=async(s=!1)=>{var u,m;try{s?Ae(!0):oe(!0),_("");const{data:t}=await j.get("/api/affiliate/banner-home-ads");Z(Array.isArray(t==null?void 0:t.campaigns)?t.campaigns:[]),$e((t==null?void 0:t.settings)||null),De((t==null?void 0:t.wallet)||null),We((t==null?void 0:t.analytics)||null),Ie(Array.isArray(t==null?void 0:t.wallet_transactions)?t.wallet_transactions:[]),ie(!0)}catch(t){_(((m=(u=t==null?void 0:t.response)==null?void 0:u.data)==null?void 0:m.message)||(t==null?void 0:t.message)||"Failed to load homepage slider ads")}finally{oe(!1),Ae(!1)}};c.useEffect(()=>{Ee()},[]),c.useEffect(()=>{C==="homepage"&&!F&&!U&&pe()},[C,F,U]);const nr=()=>{ze(""),ne({...fr(),sort_order:Math.max(1,D.length+1)}),h(""),a(""),Y(!0)},yr=s=>{ze(String(s.id)),ne({image:s.image||"",title:s.title||"",subtitle:s.subtitle||"",link_type:s.link_type||"internal_post",linked_post_id:s.linked_post_id||"",linked_product_id:s.linked_product_id||"",external_url:s.external_url||"",sort_order:Number(s.sort_order||0),status:s.status||"active"}),h(""),a(""),Y(!0)},re=s=>{const{name:u,value:m}=s.target;ne(t=>({...t,[u]:m,...u==="link_type"?{linked_post_id:"",linked_product_id:"",external_url:""}:{}}))},_r=async s=>{var m,t,p;const u=(m=s.target.files)==null?void 0:m[0];if(u)try{ye(!0),h("");const w=new FormData;w.append("file",u),w.append("type","image_url"),w.append("folder","website-sliders");const{data:$}=await j.post("/api/uploads",w,{headers:{"Content-Type":"multipart/form-data"}}),ue=br($);if(!ue)throw new Error("Upload completed, but no image URL was returned.");ne(he=>({...he,image:ue})),a("Slider image uploaded.")}catch(w){h(((p=(t=w==null?void 0:w.response)==null?void 0:t.data)==null?void 0:p.message)||(w==null?void 0:w.message)||"Failed to upload slider image")}finally{ye(!1),s.target.value=""}},vr=()=>{if(!String(b.image||"").trim())throw new Error("Slider image is required");if(b.link_type==="internal_post"&&!Number(b.linked_post_id||0))throw new Error("Choose a post destination");if(b.link_type==="product"&&!Number(b.linked_product_id||0))throw new Error("Choose a product destination");if(b.link_type==="external_url"){const s=Le(b.external_url,{required:!0,allowEmpty:!1,fieldName:"External URL"});if(!s.ok)throw new Error(s.message)}},Nr=async s=>{var u,m,t;s.preventDefault();try{we(!0),h(""),a(""),vr();const p={image:String(b.image||"").trim(),title:String(b.title||"").trim(),subtitle:String(b.subtitle||"").trim(),link_type:b.link_type,linked_post_id:b.link_type==="internal_post"?Number(b.linked_post_id):null,linked_product_id:b.link_type==="product"?Number(b.linked_product_id):null,external_url:b.link_type==="external_url"?String(b.external_url||"").trim():null,sort_order:Number(b.sort_order||0),status:b.status},w=se?await j.put(`/api/affiliate/sliders/${se}`,p):await j.post("/api/affiliate/sliders",p);a(((u=w==null?void 0:w.data)==null?void 0:u.message)||"Slider saved successfully"),Y(!1),await Ee(!0)}catch(p){h(((t=(m=p==null?void 0:p.response)==null?void 0:m.data)==null?void 0:t.message)||(p==null?void 0:p.message)||"Failed to save storefront slider")}finally{we(!1)}},Sr=async s=>{var m,t;const u=String((s==null?void 0:s.status)||"").toLowerCase()==="active"?"inactive":"active";try{ge(String(s.id)),h("");const{data:p}=await j.put(`/api/affiliate/sliders/${s.id}/status`,{status:u});a((p==null?void 0:p.message)||"Slider status updated"),await Ee(!0)}catch(p){h(((t=(m=p==null?void 0:p.response)==null?void 0:m.data)==null?void 0:t.message)||(p==null?void 0:p.message)||"Failed to update slider status")}finally{ge("")}},kr=async s=>{var u,m;if(window.confirm(`Delete "${(s==null?void 0:s.title)||"this slider"}" permanently?`))try{ge(String(s.id)),h("");const{data:t}=await j.delete(`/api/affiliate/sliders/${s.id}`);a((t==null?void 0:t.message)||"Slider deleted"),await Ee(!0)}catch(t){h(((m=(u=t==null?void 0:t.response)==null?void 0:u.data)==null?void 0:m.message)||(t==null?void 0:t.message)||"Failed to delete slider")}finally{ge("")}},dr=()=>{l(""),W(Qe(x)),J(""),_(""),q(""),d(!0)},or=s=>{l(String(s.id)),W({campaign_title:s.campaign_title||"",campaign_description:s.campaign_description||"",internal_note:s.internal_note||"",media_type:s.media_type||"image",image_url:s.image_url||"",video_url:s.video_url||"",poster_url:s.poster_url||"",eyebrow_text:s.eyebrow_text||"Sponsored",title:s.title||"",subtitle:s.subtitle||"",promo_text:s.promo_text||"",cta_label:s.cta_label||"Shop Now",cta_url:s.cta_url||"",secondary_cta_label:s.secondary_cta_label||"",secondary_cta_url:s.secondary_cta_url||"",total_budget:s.total_budget||x,daily_budget_cap:s.daily_budget_cap||"",start_date:gr(s.start_date),end_date:gr(s.end_date),payment_reference:""}),J(""),_(""),q(""),d(!0)},S=s=>{const{name:u,value:m}=s.target;W(t=>({...t,[u]:m}))},Xe=async(s,u)=>{var t,p,w;const m=(t=s.target.files)==null?void 0:t[0];if(m)try{He(u),_("");const $=new FormData;$.append("file",m),$.append("type",u),$.append("folder","banner-home-ads");const{data:ue}=await j.post("/api/uploads",$,{headers:{"Content-Type":"multipart/form-data"}}),he=br(ue);if(!he)throw new Error("Upload completed, but no file URL was returned.");W(V=>({...V,[u]:he})),q("Media uploaded successfully.")}catch($){_(((w=(p=$==null?void 0:$.response)==null?void 0:p.data)==null?void 0:w.message)||($==null?void 0:$.message)||"Failed to upload media")}finally{He(""),s.target.value=""}},Cr=()=>{if(!String(n.campaign_title||"").trim())throw new Error("Campaign title is required");if(!String(n.title||"").trim())throw new Error("Slider headline is required");if(!String(n.cta_label||"").trim())throw new Error("CTA label is required");const s=Le(n.cta_url,{required:!0,allowEmpty:!1,fieldName:"CTA URL"});if(!s.ok)throw new Error(s.message);if(String(n.secondary_cta_url||"").trim()){const u=Le(n.secondary_cta_url,{required:!1,allowEmpty:!0,fieldName:"Secondary CTA URL"});if(!u.ok)throw new Error(u.message)}if(n.media_type==="image"&&!String(n.image_url||"").trim())throw new Error("Image is required for an image slider ad");if(n.media_type==="video"&&!String(n.video_url||"").trim())throw new Error("Video is required for a video slider ad");if(!o&&H<x)throw new Error(`Fund your homepage slider ads wallet with at least ${T(x)} first`);if(!o&&Number(n.total_budget||0)<x)throw new Error(`Minimum homepage slider ad budget is ${T(x)}`);if(!o&&Number(n.total_budget||0)>H)throw new Error(`Campaign budget cannot exceed your wallet balance of ${T(H)}`);if(n.daily_budget_cap&&Number(n.daily_budget_cap)<K)throw new Error(`Minimum daily budget cap is ${T(K)}`)},zr=()=>({campaign_title:n.campaign_title,campaign_description:n.campaign_description,internal_note:n.internal_note,media_type:n.media_type,image_url:n.image_url,video_url:n.media_type==="video"?n.video_url:"",poster_url:n.poster_url,eyebrow_text:n.eyebrow_text,title:n.title,subtitle:n.subtitle,promo_text:n.promo_text,cta_label:n.cta_label,cta_url:n.cta_url,secondary_cta_label:n.secondary_cta_label,secondary_cta_url:n.secondary_cta_url,total_budget:Number(n.total_budget||x),daily_budget_cap:n.daily_budget_cap===""?null:Number(n.daily_budget_cap||0),start_date:n.start_date||null,end_date:n.end_date||null,payment_reference:n.payment_reference}),Ar=async s=>{var u,m,t;s.preventDefault();try{Me(!0),_(""),q(""),Cr();const p=zr(),w=o?await j.put(`/api/affiliate/banner-home-ads/${o}`,p):await j.post("/api/affiliate/banner-home-ads",p);q(((u=w==null?void 0:w.data)==null?void 0:u.message)||"Homepage slider ad saved"),d(!1),await pe(!0)}catch(p){_(((t=(m=p==null?void 0:p.response)==null?void 0:m.data)==null?void 0:t.message)||(p==null?void 0:p.message)||"Failed to save homepage slider ad")}finally{Me(!1)}},Ur=async()=>{var u,m;const s=Number(Ve||0);if(!s||s<=0){_("Enter a valid wallet funding amount");return}try{Ue(!0),_("");const{data:t}=await j.post("/api/affiliate/banner-home-ads/wallet/fund",{amount:s,note:"Writer funded homepage slider ads wallet"});Be(""),q((t==null?void 0:t.message)||"Wallet funded successfully"),await pe(!0)}catch(t){_(((m=(u=t==null?void 0:t.response)==null?void 0:u.data)==null?void 0:m.message)||(t==null?void 0:t.message)||"Failed to fund wallet")}finally{Ue(!1)}},Er=async(s,u)=>{var m,t;try{X(String(s.id)),_("");const{data:p}=await j.put(`/api/affiliate/banner-home-ads/${s.id}/status`,{action:u});q((p==null?void 0:p.message)||"Campaign status updated"),await pe(!0)}catch(p){_(((t=(m=p==null?void 0:p.response)==null?void 0:m.data)==null?void 0:t.message)||(p==null?void 0:p.message)||"Failed to update campaign status")}finally{X("")}},Rr=s=>{const u=String((s==null?void 0:s.status)||"").toLowerCase();["active","ended","exhausted"].includes(u)?(l(String(s.id)),W({...Qe(x),campaign_title:s.campaign_title||"",title:s.title||""})):or(s),J(""),d(!0)},Fr=async()=>{var u,m;if(!o)return;const s=Number(I||0);if(!s||s<=0){_("Enter a valid top-up amount");return}if(s>H){_(`Top-up amount cannot exceed wallet balance ${T(H)}`);return}try{X(String(o)),_("");const{data:t}=await j.post(`/api/affiliate/banner-home-ads/${o}/top-up`,{amount:s,note:"Writer homepage slider ad top-up from wallet"});J(""),q((t==null?void 0:t.message)||"Campaign topped up successfully"),await pe(!0)}catch(t){_(((m=(u=t==null?void 0:t.response)==null?void 0:u.data)==null?void 0:m.message)||(t==null?void 0:t.message)||"Failed to top up campaign")}finally{X("")}},Lr=async s=>{var u,m;if(window.confirm(`Delete "${(s==null?void 0:s.campaign_title)||"this campaign"}" permanently?`))try{X(String(s.id)),_("");const{data:t}=await j.delete(`/api/affiliate/banner-home-ads/${s.id}`);q((t==null?void 0:t.message)||"Campaign deleted"),await pe(!0)}catch(t){_(((m=(u=t==null?void 0:t.response)==null?void 0:u.data)==null?void 0:m.message)||(t==null?void 0:t.message)||"Failed to delete campaign")}finally{X("")}};return e.jsxs("div",{className:"writer-sliders-page",children:[e.jsx("style",{children:Or}),e.jsx("input",{ref:r,className:"writer-sliders-hidden-file",type:"file",accept:"image/*",onChange:_r}),e.jsx("input",{ref:f,className:"writer-sliders-hidden-file",type:"file",accept:"image/*",onChange:s=>Xe(s,"image_url")}),e.jsx("input",{ref:k,className:"writer-sliders-hidden-file",type:"file",accept:"video/*",onChange:s=>Xe(s,"video_url")}),e.jsx("input",{ref:R,className:"writer-sliders-hidden-file",type:"file",accept:"image/*",onChange:s=>Xe(s,"poster_url")}),e.jsxs("div",{className:"writer-sliders-tabs",role:"tablist","aria-label":"Slider workspaces",children:[e.jsx("button",{type:"button",className:C==="storefront"?"active":"",onClick:()=>g("storefront"),children:"Storefront Sliders"}),e.jsx("button",{type:"button",className:C==="homepage"?"active":"",onClick:()=>g("homepage"),children:"Homepage Ads"})]}),C==="storefront"?e.jsxs(e.Fragment,{children:[e.jsxs("section",{className:"writer-sliders-command",children:[e.jsxs("div",{children:[e.jsx("span",{className:"writer-sliders-kicker",children:"Storefront display"}),e.jsx("h2",{children:"Storefront sliders"}),e.jsx("p",{children:"Create clean promotional slides for your own storefront and connect each one to a post, product, or external destination."})]}),e.jsxs("div",{className:"writer-sliders-command-actions",children:[e.jsxs("button",{type:"button",className:"writer-sliders-btn secondary",onClick:()=>Ee(!0),disabled:fe,children:[e.jsx(Ze,{size:16,className:fe?"writer-spin":""}),fe?"Refreshing...":"Refresh"]}),e.jsxs("button",{type:"button",className:"writer-sliders-btn primary",onClick:nr,children:[e.jsx(Re,{size:16}),"New Slider"]})]})]}),e.jsxs("section",{className:"writer-sliders-stats three",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Total sliders"}),e.jsx("strong",{children:M.total}),e.jsx("small",{children:"All storefront slides"})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Active"}),e.jsx("strong",{children:M.active}),e.jsx("small",{children:"Currently visible"})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Inactive"}),e.jsx("strong",{children:M.inactive}),e.jsx("small",{children:"Hidden from visitors"})]})]}),le?e.jsxs("div",{className:"writer-sliders-alert error",children:[e.jsx(Ne,{size:17}),e.jsx("span",{children:le})]}):null,ke?e.jsxs("div",{className:"writer-sliders-alert success",children:[e.jsx(rr,{size:17}),e.jsx("span",{children:ke})]}):null,ae?e.jsxs("div",{className:"writer-sliders-loading",children:[e.jsx("div",{className:"writer-sliders-spinner"}),e.jsx("span",{children:"Loading storefront sliders..."})]}):D.length?e.jsx("section",{className:"writer-slider-grid",children:D.map(s=>e.jsx(qr,{slider:s,onEdit:yr,onStatus:Sr,onDelete:kr,busyId:be},s.id))}):e.jsxs("section",{className:"writer-sliders-empty",children:[e.jsx("div",{className:"writer-sliders-empty-icon",children:e.jsx(me,{size:26})}),e.jsx("h3",{children:"No storefront sliders yet"}),e.jsx("p",{children:"Create your first slide and connect it to a post, product, or external destination."}),e.jsxs("button",{type:"button",className:"writer-sliders-btn primary",onClick:nr,children:[e.jsx(Re,{size:16}),"Create Slider"]})]})]}):e.jsxs(e.Fragment,{children:[e.jsxs("section",{className:"writer-sliders-command",children:[e.jsxs("div",{children:[e.jsx("span",{className:"writer-sliders-kicker",children:"Paid homepage placement"}),e.jsx("h2",{children:"Homepage slider ads"}),e.jsx("p",{children:"Fund your ads wallet, submit homepage campaigns, and manage approval, budget, views, clicks, and campaign status."})]}),e.jsxs("div",{className:"writer-sliders-command-actions",children:[e.jsxs("button",{type:"button",className:"writer-sliders-btn secondary",onClick:()=>pe(!0),disabled:L,children:[e.jsx(Ze,{size:16,className:L?"writer-spin":""}),L?"Refreshing...":"Refresh"]}),e.jsxs("button",{type:"button",className:"writer-sliders-btn primary",onClick:dr,disabled:H<x,title:H<x?`Fund at least ${T(x)} first`:"",children:[e.jsx(Re,{size:16}),"Create Homepage Ad"]})]})]}),e.jsxs("section",{className:"writer-sliders-wallet",children:[e.jsxs("div",{className:"writer-sliders-wallet-summary",children:[e.jsx("div",{className:"writer-sliders-wallet-icon",children:e.jsx(Q,{size:22})}),e.jsxs("div",{children:[e.jsx("span",{children:"Homepage Ads Wallet"}),e.jsx("strong",{children:T(H)}),e.jsxs("small",{children:["Minimum campaign budget ",T(x)]})]})]}),e.jsxs("div",{className:"writer-sliders-wallet-fund",children:[e.jsx("input",{type:"number",min:"1",step:"0.01",value:Ve,onChange:s=>Be(s.target.value),placeholder:"Funding amount"}),e.jsxs("button",{type:"button",className:"writer-sliders-btn primary",onClick:Ur,disabled:qe,children:[e.jsx(Q,{size:16}),qe?"Funding...":"Fund Wallet"]})]})]}),e.jsxs("section",{className:"writer-sliders-stats four",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Total spent"}),e.jsx("strong",{children:T((A==null?void 0:A.total_spent)||(G==null?void 0:G.total_spent))}),e.jsx("small",{children:"Across homepage ads"})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Total views"}),e.jsx("strong",{children:Se(A==null?void 0:A.total_views)}),e.jsx("small",{children:"Recorded impressions"})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Total clicks"}),e.jsx("strong",{children:Se(A==null?void 0:A.total_clicks)}),e.jsx("small",{children:"Recorded clicks"})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Active ads"}),e.jsx("strong",{children:Se(A==null?void 0:A.active_campaigns)}),e.jsxs("small",{children:[Se(A==null?void 0:A.pending_campaigns)," pending approval"]})]})]}),e.jsxs("section",{className:"writer-sliders-settings-row",children:[e.jsxs("span",{children:[e.jsx(Fe,{size:15})," Cost/view ",T(z==null?void 0:z.cost_per_view)]}),e.jsxs("span",{children:[e.jsx(Fe,{size:15})," Cost/click ",T(z==null?void 0:z.cost_per_click)]}),e.jsxs("span",{children:[e.jsx(Fe,{size:15})," Daily cap min ",T(K)]}),e.jsxs("span",{children:[e.jsx(Fe,{size:15})," Position ",(z==null?void 0:z.ad_insert_position)||5]})]}),ve?e.jsxs("div",{className:"writer-sliders-alert error",children:[e.jsx(Ne,{size:17}),e.jsx("span",{children:ve})]}):null,ce?e.jsxs("div",{className:"writer-sliders-alert success",children:[e.jsx(rr,{size:17}),e.jsx("span",{children:ce})]}):null,U?e.jsxs("div",{className:"writer-sliders-loading",children:[e.jsx("div",{className:"writer-sliders-spinner"}),e.jsx("span",{children:"Loading homepage slider ads..."})]}):de.length?e.jsx("section",{className:"writer-ad-grid",children:de.map(s=>e.jsx(Vr,{campaign:s,onEdit:or,onStatus:Er,onTopUp:Rr,onDelete:Lr,busyId:v},s.id))}):e.jsxs("section",{className:"writer-sliders-empty",children:[e.jsx("div",{className:"writer-sliders-empty-icon",children:e.jsx(Pr,{size:26})}),e.jsx("h3",{children:"No homepage slider ads yet"}),e.jsx("p",{children:"Fund your ads wallet, then create a campaign for homepage placement."}),e.jsxs("button",{type:"button",className:"writer-sliders-btn primary",onClick:dr,disabled:H<x,children:[e.jsx(Re,{size:16}),"Create Homepage Ad"]})]}),y.length?e.jsxs("section",{className:"writer-sliders-history",children:[e.jsxs("div",{children:[e.jsx("h3",{children:"Recent wallet activity"}),e.jsx("p",{children:"Your latest homepage slider ads wallet transactions."})]}),e.jsx("div",{className:"writer-sliders-history-list",children:y.slice(0,5).map(s=>e.jsxs("div",{children:[e.jsx("span",{children:String(s.transaction_type||"transaction").replace(/_/g," ")}),e.jsx("strong",{children:T(s.amount)})]},s.id))})]}):null]}),_e?e.jsx("div",{className:"writer-sliders-overlay",onMouseDown:s=>{s.target===s.currentTarget&&Y(!1)},children:e.jsxs("aside",{className:"writer-sliders-drawer","aria-label":se?"Edit slider":"Create slider",children:[e.jsxs("div",{className:"writer-sliders-drawer-head",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Storefront slider"}),e.jsx("h3",{children:se?"Edit Slider":"New Slider"})]}),e.jsx("button",{type:"button",onClick:()=>Y(!1),"aria-label":"Close",children:e.jsx(hr,{size:20})})]}),e.jsxs("form",{className:"writer-sliders-drawer-body",onSubmit:Nr,children:[e.jsxs("div",{className:"writer-sliders-upload-card",children:[e.jsx("div",{className:"writer-sliders-upload-preview",children:b.image?e.jsx("img",{src:b.image,alt:"Slider preview"}):e.jsx(me,{size:28})}),e.jsxs("div",{children:[e.jsx("strong",{children:"Slider image"}),e.jsx("span",{children:"Use a clear wide image for the best storefront result."})]}),e.jsxs("button",{type:"button",className:"writer-sliders-btn secondary",onClick:()=>{var s;return(s=r.current)==null?void 0:s.click()},disabled:je,children:[e.jsx(xe,{size:16}),je?"Uploading...":"Upload"]})]}),e.jsxs("label",{className:"writer-sliders-field full",children:[e.jsx("span",{children:"Image URL"}),e.jsx("input",{name:"image",value:b.image,onChange:re,placeholder:"/uploads/... or https://..."})]}),e.jsxs("div",{className:"writer-sliders-form-grid",children:[e.jsxs("label",{className:"writer-sliders-field full",children:[e.jsx("span",{children:"Title"}),e.jsx("input",{name:"title",value:b.title,onChange:re,placeholder:"Slider title"})]}),e.jsxs("label",{className:"writer-sliders-field full",children:[e.jsx("span",{children:"Subtitle"}),e.jsx("textarea",{name:"subtitle",value:b.subtitle,onChange:re,rows:3,placeholder:"Short supporting text"})]}),e.jsxs("label",{className:"writer-sliders-field",children:[e.jsx("span",{children:"Destination type"}),e.jsxs("select",{name:"link_type",value:b.link_type,onChange:re,children:[e.jsx("option",{value:"internal_post",children:"Post"}),e.jsx("option",{value:"product",children:"Product"}),e.jsx("option",{value:"external_url",children:"External URL"})]})]}),b.link_type==="internal_post"?e.jsxs("label",{className:"writer-sliders-field",children:[e.jsx("span",{children:"Post"}),e.jsxs("select",{name:"linked_post_id",value:b.linked_post_id,onChange:re,children:[e.jsx("option",{value:"",children:"Choose post"}),B.map(s=>e.jsx("option",{value:s.id,children:s.title||`Post ${s.id}`},s.id))]})]}):null,b.link_type==="product"?e.jsxs("label",{className:"writer-sliders-field",children:[e.jsx("span",{children:"Product"}),e.jsxs("select",{name:"linked_product_id",value:b.linked_product_id,onChange:re,children:[e.jsx("option",{value:"",children:"Choose product"}),O.map(s=>e.jsx("option",{value:s.id,children:s.title||`Product ${s.id}`},s.id))]})]}):null,b.link_type==="external_url"?e.jsxs("label",{className:"writer-sliders-field full",children:[e.jsx("span",{children:"External URL"}),e.jsx("input",{name:"external_url",value:b.external_url,onChange:re,placeholder:"https://example.com/page"})]}):null,e.jsxs("label",{className:"writer-sliders-field",children:[e.jsx("span",{children:"Display order"}),e.jsx("input",{type:"number",name:"sort_order",value:b.sort_order,onChange:re})]}),e.jsxs("label",{className:"writer-sliders-field",children:[e.jsx("span",{children:"Status"}),e.jsxs("select",{name:"status",value:b.status,onChange:re,children:[e.jsx("option",{value:"active",children:"Active"}),e.jsx("option",{value:"inactive",children:"Inactive"})]})]})]}),le?e.jsxs("div",{className:"writer-sliders-alert error compact",children:[e.jsx(Ne,{size:16}),e.jsx("span",{children:le})]}):null,e.jsxs("div",{className:"writer-sliders-drawer-actions",children:[e.jsx("button",{type:"button",className:"writer-sliders-btn secondary",onClick:()=>Y(!1),children:"Cancel"}),e.jsxs("button",{type:"submit",className:"writer-sliders-btn primary",disabled:Ce||je,children:[e.jsx(sr,{size:16}),Ce?"Saving...":se?"Save Changes":"Create Slider"]})]})]})]})}):null,i?e.jsx("div",{className:"writer-sliders-overlay",onMouseDown:s=>{s.target===s.currentTarget&&d(!1)},children:e.jsxs("aside",{className:"writer-sliders-drawer wide","aria-label":o?"Edit homepage ad":"Create homepage ad",children:[e.jsxs("div",{className:"writer-sliders-drawer-head",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Homepage slider ad"}),e.jsx("h3",{children:o?"Campaign Details":"Create Homepage Ad"})]}),e.jsx("button",{type:"button",onClick:()=>d(!1),"aria-label":"Close",children:e.jsx(hr,{size:20})})]}),e.jsxs("form",{className:"writer-sliders-drawer-body",onSubmit:Ar,children:[e.jsxs("div",{className:"writer-sliders-form-grid",children:[e.jsxs("label",{className:"writer-sliders-field full",children:[e.jsx("span",{children:"Campaign title"}),e.jsx("input",{name:"campaign_title",value:n.campaign_title,onChange:S,placeholder:"Campaign title",disabled:o&&["active","ended","exhausted"].includes(String(((cr=de.find(s=>String(s.id)===String(o)))==null?void 0:cr.status)||"").toLowerCase())})]}),e.jsxs("label",{className:"writer-sliders-field",children:[e.jsx("span",{children:"Media type"}),e.jsxs("select",{name:"media_type",value:n.media_type,onChange:S,children:[e.jsx("option",{value:"image",children:"Image"}),e.jsx("option",{value:"video",children:"Video"})]})]}),e.jsxs("label",{className:"writer-sliders-field",children:[e.jsx("span",{children:"Eyebrow text"}),e.jsx("input",{name:"eyebrow_text",value:n.eyebrow_text,onChange:S,placeholder:"Sponsored"})]}),e.jsxs("label",{className:"writer-sliders-field full",children:[e.jsx("span",{children:"Main headline"}),e.jsx("input",{name:"title",value:n.title,onChange:S,placeholder:"Slider headline"})]}),e.jsxs("label",{className:"writer-sliders-field full",children:[e.jsx("span",{children:"Subtitle"}),e.jsx("textarea",{name:"subtitle",value:n.subtitle,onChange:S,rows:3,placeholder:"Short supporting text"})]}),e.jsxs("label",{className:"writer-sliders-field full",children:[e.jsx("span",{children:"Campaign description"}),e.jsx("textarea",{name:"campaign_description",value:n.campaign_description,onChange:S,rows:3,placeholder:"Description for review"})]}),e.jsxs("label",{className:"writer-sliders-field",children:[e.jsx("span",{children:"Promo text"}),e.jsx("input",{name:"promo_text",value:n.promo_text,onChange:S,placeholder:"Limited offer"})]}),e.jsxs("label",{className:"writer-sliders-field",children:[e.jsx("span",{children:"Internal note"}),e.jsx("input",{name:"internal_note",value:n.internal_note,onChange:S,placeholder:"Optional note"})]})]}),n.media_type==="image"?e.jsxs("div",{className:"writer-sliders-upload-card",children:[e.jsx("div",{className:"writer-sliders-upload-preview",children:n.image_url?e.jsx("img",{src:n.image_url,alt:"Ad preview"}):e.jsx(me,{size:28})}),e.jsxs("div",{children:[e.jsx("strong",{children:"Campaign image"}),e.jsx("span",{children:"Upload an image or paste its URL below."})]}),e.jsxs("button",{type:"button",className:"writer-sliders-btn secondary",onClick:()=>{var s;return(s=f.current)==null?void 0:s.click()},disabled:ee==="image_url",children:[e.jsx(xe,{size:16}),ee==="image_url"?"Uploading...":"Upload"]})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"writer-sliders-upload-card",children:[e.jsx("div",{className:"writer-sliders-upload-preview",children:e.jsx(er,{size:28})}),e.jsxs("div",{children:[e.jsx("strong",{children:"Campaign video"}),e.jsx("span",{children:"Upload a video or paste its URL below."})]}),e.jsxs("button",{type:"button",className:"writer-sliders-btn secondary",onClick:()=>{var s;return(s=k.current)==null?void 0:s.click()},disabled:ee==="video_url",children:[e.jsx(xe,{size:16}),ee==="video_url"?"Uploading...":"Upload"]})]}),e.jsxs("div",{className:"writer-sliders-upload-card",children:[e.jsx("div",{className:"writer-sliders-upload-preview",children:n.poster_url?e.jsx("img",{src:n.poster_url,alt:"Poster preview"}):e.jsx(me,{size:28})}),e.jsxs("div",{children:[e.jsx("strong",{children:"Poster image"}),e.jsx("span",{children:"Optional preview image for your video."})]}),e.jsxs("button",{type:"button",className:"writer-sliders-btn secondary",onClick:()=>{var s;return(s=R.current)==null?void 0:s.click()},disabled:ee==="poster_url",children:[e.jsx(xe,{size:16}),ee==="poster_url"?"Uploading...":"Upload"]})]})]}),e.jsxs("div",{className:"writer-sliders-form-grid",children:[n.media_type==="image"?e.jsxs("label",{className:"writer-sliders-field full",children:[e.jsx("span",{children:"Image URL"}),e.jsx("input",{name:"image_url",value:n.image_url,onChange:S,placeholder:"/uploads/... or https://..."})]}):e.jsxs(e.Fragment,{children:[e.jsxs("label",{className:"writer-sliders-field full",children:[e.jsx("span",{children:"Video URL"}),e.jsx("input",{name:"video_url",value:n.video_url,onChange:S,placeholder:"/uploads/... or https://..."})]}),e.jsxs("label",{className:"writer-sliders-field full",children:[e.jsx("span",{children:"Poster URL"}),e.jsx("input",{name:"poster_url",value:n.poster_url,onChange:S,placeholder:"/uploads/... or https://..."})]})]}),e.jsxs("label",{className:"writer-sliders-field",children:[e.jsx("span",{children:"CTA label"}),e.jsx("input",{name:"cta_label",value:n.cta_label,onChange:S,placeholder:"Shop Now"})]}),e.jsxs("label",{className:"writer-sliders-field",children:[e.jsx("span",{children:"CTA URL"}),e.jsx("input",{name:"cta_url",value:n.cta_url,onChange:S,placeholder:"https://example.com/page"})]}),e.jsxs("label",{className:"writer-sliders-field",children:[e.jsx("span",{children:"Secondary CTA label"}),e.jsx("input",{name:"secondary_cta_label",value:n.secondary_cta_label,onChange:S,placeholder:"Learn More"})]}),e.jsxs("label",{className:"writer-sliders-field",children:[e.jsx("span",{children:"Secondary CTA URL"}),e.jsx("input",{name:"secondary_cta_url",value:n.secondary_cta_url,onChange:S,placeholder:"https://example.com/page"})]}),o?null:e.jsxs("label",{className:"writer-sliders-field",children:[e.jsx("span",{children:"Campaign budget"}),e.jsx("input",{type:"number",min:x,max:H||void 0,step:"0.01",name:"total_budget",value:n.total_budget,onChange:S}),e.jsxs("small",{children:["Wallet balance ",T(H)]})]}),e.jsxs("label",{className:"writer-sliders-field",children:[e.jsx("span",{children:"Daily budget cap"}),e.jsx("input",{type:"number",min:K,step:"0.01",name:"daily_budget_cap",value:n.daily_budget_cap,onChange:S,placeholder:`Optional, min ${K}`})]}),e.jsxs("label",{className:"writer-sliders-field",children:[e.jsx("span",{children:"Start date"}),e.jsx("input",{type:"date",name:"start_date",value:n.start_date,onChange:S})]}),e.jsxs("label",{className:"writer-sliders-field",children:[e.jsx("span",{children:"End date"}),e.jsx("input",{type:"date",name:"end_date",value:n.end_date,onChange:S})]}),o?null:e.jsxs("label",{className:"writer-sliders-field full",children:[e.jsx("span",{children:"Payment reference"}),e.jsx("input",{name:"payment_reference",value:n.payment_reference,onChange:S,placeholder:"Optional payment reference"})]})]}),o?e.jsxs("section",{className:"writer-sliders-topup-box",children:[e.jsxs("div",{children:[e.jsx("strong",{children:"Campaign funding"}),e.jsx("span",{children:"Add budget from your homepage ads wallet."})]}),e.jsxs("div",{children:[e.jsx("input",{type:"number",min:"1",step:"0.01",max:H||void 0,value:I,onChange:s=>J(s.target.value),placeholder:`Top-up amount - ${T(H)} available`}),e.jsxs("button",{type:"button",className:"writer-sliders-btn secondary",onClick:Fr,disabled:String(v)===String(o),children:[e.jsx(Q,{size:16}),"Top Up"]})]})]}):null,ve?e.jsxs("div",{className:"writer-sliders-alert error compact",children:[e.jsx(Ne,{size:16}),e.jsx("span",{children:ve})]}):null,e.jsxs("div",{className:"writer-sliders-drawer-actions",children:[e.jsx("button",{type:"button",className:"writer-sliders-btn secondary",onClick:()=>d(!1),children:"Cancel"}),e.jsxs("button",{type:"submit",className:"writer-sliders-btn primary",disabled:te||!!ee||!o&&H<x||o&&["active","ended","exhausted"].includes(String(((pr=de.find(s=>String(s.id)===String(o)))==null?void 0:pr.status)||"").toLowerCase()),children:[e.jsx(sr,{size:16}),te?"Saving...":o?"Save Changes":"Submit For Approval"]})]})]})]})}):null]})}function ns(){return Tr().pathname.startsWith("/affiliate/")?e.jsx(Hr,{}):e.jsx(Br,{})}const Or=`
  * {
    box-sizing: border-box;
  }

  .writer-sliders-page {
    width: 100%;
    max-width: none;
    min-width: 0;
    margin: 0;
    padding: 24px 28px 48px;
    color: #111827;
    overflow-x: hidden;
  }

  .writer-sliders-page button,
  .writer-sliders-page input,
  .writer-sliders-page select,
  .writer-sliders-page textarea {
    font: inherit;
  }

  .writer-sliders-hidden-file {
    display: none;
  }

  .writer-sliders-tabs {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
    margin-bottom: 20px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #ffffff;
  }

  .writer-sliders-tabs button {
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: #6b7280;
    font-size: 14px;
    font-weight: 700;
    padding: 9px 14px;
    cursor: pointer;
  }

  .writer-sliders-tabs button.active {
    background: #111827;
    color: #ffffff;
  }

  .writer-sliders-command {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 22px;
    margin-bottom: 18px;
  }

  .writer-sliders-kicker {
    display: block;
    margin-bottom: 6px;
    color: #6b7280;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .writer-sliders-command h2 {
    margin: 0;
    color: #111827;
    font-size: 25px;
    line-height: 1.15;
    font-weight: 800;
  }

  .writer-sliders-command p {
    max-width: 760px;
    margin: 8px 0 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
  }

  .writer-sliders-command-actions,
  .writer-slider-actions,
  .writer-sliders-drawer-actions {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-wrap: wrap;
  }

  .writer-sliders-btn {
    min-height: 40px;
    border-radius: 9px;
    padding: 0 13px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border: 1px solid transparent;
    font-size: 13px;
    font-weight: 750;
    cursor: pointer;
    transition: 0.16s ease;
    white-space: nowrap;
  }

  .writer-sliders-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .writer-sliders-btn.primary {
    background: #111827;
    border-color: #111827;
    color: #ffffff;
  }

  .writer-sliders-btn.primary:not(:disabled):hover {
    background: #000000;
  }

  .writer-sliders-btn.secondary {
    background: #ffffff;
    border-color: #d1d5db;
    color: #374151;
  }

  .writer-sliders-btn.secondary:not(:disabled):hover {
    border-color: #9ca3af;
    background: #f9fafb;
  }

  .writer-sliders-btn.danger-ghost {
    background: #ffffff;
    border-color: #fecaca;
    color: #b91c1c;
  }

  .writer-sliders-stats {
    display: grid;
    gap: 12px;
    margin-bottom: 20px;
  }

  .writer-sliders-stats.three {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .writer-sliders-stats.four {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .writer-sliders-stats > div {
    min-width: 0;
    border: 1px solid #e5e7eb;
    border-radius: 13px;
    background: #ffffff;
    padding: 15px 16px;
  }

  .writer-sliders-stats span {
    display: block;
    color: #6b7280;
    font-size: 12px;
    font-weight: 650;
  }

  .writer-sliders-stats strong {
    display: block;
    margin-top: 7px;
    color: #111827;
    font-size: 24px;
    line-height: 1;
  }

  .writer-sliders-stats small {
    display: block;
    margin-top: 7px;
    color: #9ca3af;
    font-size: 11px;
  }

  .writer-slider-grid,
  .writer-ad-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    min-width: 0;
  }

  .writer-slider-card,
  .writer-ad-card {
    min-width: 0;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
  }

  .writer-slider-image {
    position: relative;
    aspect-ratio: 16 / 6.6;
    overflow: hidden;
    background: #f3f4f6;
  }

  .writer-slider-image img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .writer-slider-image-empty {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 8px;
    color: #9ca3af;
    font-size: 12px;
  }

  .writer-slider-image .writer-slider-pill {
    position: absolute;
    top: 12px;
    right: 12px;
  }

  .writer-slider-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 26px;
    border-radius: 999px;
    padding: 0 9px;
    font-size: 10px;
    font-weight: 800;
    text-transform: capitalize;
    border: 1px solid transparent;
  }

  .writer-slider-pill.success {
    background: #ecfdf3;
    color: #166534;
    border-color: #bbf7d0;
  }

  .writer-slider-pill.warning {
    background: #fffbeb;
    color: #92400e;
    border-color: #fde68a;
  }

  .writer-slider-pill.muted {
    background: #f3f4f6;
    color: #4b5563;
    border-color: #e5e7eb;
  }

  .writer-slider-pill.danger {
    background: #fef2f2;
    color: #b91c1c;
    border-color: #fecaca;
  }

  .writer-slider-pill.neutral {
    background: #f9fafb;
    color: #6b7280;
    border-color: #e5e7eb;
  }

  .writer-slider-card-body,
  .writer-ad-card {
    padding: 16px;
  }

  .writer-slider-card-title-row,
  .writer-ad-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .writer-slider-card-title-row > div,
  .writer-ad-card-head > div {
    min-width: 0;
  }

  .writer-slider-card h3,
  .writer-ad-card h3 {
    margin: 0;
    color: #111827;
    font-size: 16px;
    line-height: 1.3;
    font-weight: 800;
    overflow-wrap: anywhere;
  }

  .writer-slider-card p,
  .writer-ad-card p {
    margin: 5px 0 0;
    color: #6b7280;
    font-size: 12px;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .writer-slider-order {
    flex: 0 0 auto;
    min-width: 31px;
    height: 31px;
    display: grid;
    place-items: center;
    border-radius: 8px;
    background: #f3f4f6;
    color: #4b5563;
    font-size: 11px;
    font-weight: 800;
  }

  .writer-slider-meta {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.75fr);
    gap: 9px;
    margin: 14px 0;
  }

  .writer-slider-meta > div {
    min-width: 0;
    border-radius: 9px;
    background: #f9fafb;
    padding: 10px 11px;
  }

  .writer-slider-meta span,
  .writer-ad-budget span {
    display: block;
    color: #9ca3af;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .writer-slider-meta strong {
    display: block;
    margin-top: 4px;
    color: #374151;
    font-size: 12px;
    font-weight: 700;
    text-transform: capitalize;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .writer-slider-actions {
    padding-top: 13px;
    border-top: 1px solid #f3f4f6;
  }

  .writer-ad-card-pills {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  .writer-ad-budget {
    flex: 0 0 auto;
    text-align: right;
  }

  .writer-ad-budget strong {
    display: block;
    margin-top: 3px;
    color: #111827;
    font-size: 15px;
  }

  .writer-ad-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin: 15px 0;
  }

  .writer-ad-metrics > div {
    min-width: 0;
    border-radius: 9px;
    background: #f9fafb;
    padding: 10px;
  }

  .writer-ad-metrics svg {
    color: #9ca3af;
  }

  .writer-ad-metrics span {
    display: block;
    margin-top: 5px;
    color: #9ca3af;
    font-size: 10px;
  }

  .writer-ad-metrics strong {
    display: block;
    margin-top: 2px;
    color: #374151;
    font-size: 12px;
  }

  .writer-sliders-wallet {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(330px, 0.78fr);
    gap: 12px;
    margin-bottom: 12px;
  }

  .writer-sliders-wallet-summary,
  .writer-sliders-wallet-fund {
    min-width: 0;
    border: 1px solid #e5e7eb;
    border-radius: 13px;
    background: #ffffff;
    padding: 15px 16px;
  }

  .writer-sliders-wallet-summary {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .writer-sliders-wallet-icon {
    width: 42px;
    height: 42px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: #f3f4f6;
    color: #111827;
  }

  .writer-sliders-wallet-summary span,
  .writer-sliders-wallet-summary small {
    display: block;
    color: #6b7280;
    font-size: 11px;
  }

  .writer-sliders-wallet-summary strong {
    display: block;
    margin: 3px 0;
    color: #111827;
    font-size: 22px;
  }

  .writer-sliders-wallet-fund {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 9px;
    align-items: center;
  }

  .writer-sliders-wallet-fund input,
  .writer-sliders-topup-box input {
    width: 100%;
    min-width: 0;
    height: 40px;
    border: 1px solid #d1d5db;
    border-radius: 9px;
    background: #ffffff;
    color: #111827;
    padding: 0 11px;
    outline: none;
  }

  .writer-sliders-settings-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin: 0 0 18px;
  }

  .writer-sliders-settings-row span {
    min-height: 30px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    background: #ffffff;
    color: #6b7280;
    padding: 0 10px;
    font-size: 11px;
    font-weight: 650;
  }

  .writer-sliders-alert {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    border-radius: 10px;
    padding: 11px 12px;
    margin-bottom: 14px;
    font-size: 12px;
    line-height: 1.5;
  }

  .writer-sliders-alert.error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
  }

  .writer-sliders-alert.success {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #166534;
  }

  .writer-sliders-alert.compact {
    margin: 0;
  }

  .writer-sliders-loading,
  .writer-sliders-empty {
    min-height: 310px;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 9px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
    text-align: center;
    padding: 24px;
  }

  .writer-sliders-spinner {
    width: 34px;
    height: 34px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    animation: writerSliderSpin 0.8s linear infinite;
  }

  .writer-spin {
    animation: writerSliderSpin 0.8s linear infinite;
  }

  @keyframes writerSliderSpin {
    to { transform: rotate(360deg); }
  }

  .writer-sliders-empty-icon {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: #f3f4f6;
    color: #6b7280;
  }

  .writer-sliders-empty h3 {
    margin: 2px 0 0;
    font-size: 17px;
  }

  .writer-sliders-empty p {
    max-width: 430px;
    margin: 0 0 5px;
    color: #6b7280;
    font-size: 12px;
    line-height: 1.55;
  }

  .writer-sliders-history {
    margin-top: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
    padding: 16px;
  }

  .writer-sliders-history h3 {
    margin: 0;
    font-size: 14px;
  }

  .writer-sliders-history > div > p {
    margin: 4px 0 0;
    color: #9ca3af;
    font-size: 11px;
  }

  .writer-sliders-history-list {
    display: grid;
    gap: 0;
    margin-top: 12px;
  }

  .writer-sliders-history-list > div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 9px 0;
    border-top: 1px solid #f3f4f6;
    color: #6b7280;
    font-size: 11px;
    text-transform: capitalize;
  }

  .writer-sliders-history-list strong {
    color: #374151;
  }

  .writer-sliders-overlay {
    position: fixed;
    inset: 0;
    z-index: 1400;
    display: flex;
    justify-content: flex-end;
    background: rgba(17, 24, 39, 0.22);
  }

  .writer-sliders-drawer {
    width: min(500px, calc(100vw - 280px));
    min-width: 420px;
    height: 100vh;
    background: #ffffff;
    border-left: 1px solid #e5e7eb;
    box-shadow: -16px 0 45px rgba(17, 24, 39, 0.12);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .writer-sliders-drawer.wide {
    width: min(590px, calc(100vw - 260px));
  }

  .writer-sliders-drawer-head {
    min-height: 72px;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 18px;
    border-bottom: 1px solid #e5e7eb;
  }

  .writer-sliders-drawer-head span {
    display: block;
    color: #9ca3af;
    font-size: 10px;
    font-weight: 750;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .writer-sliders-drawer-head h3 {
    margin: 3px 0 0;
    font-size: 18px;
    color: #111827;
  }

  .writer-sliders-drawer-head > button {
    width: 36px;
    height: 36px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border: 1px solid #e5e7eb;
    border-radius: 9px;
    background: #ffffff;
    color: #4b5563;
    cursor: pointer;
  }

  .writer-sliders-drawer-body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 18px;
    display: grid;
    align-content: start;
    gap: 16px;
  }

  .writer-sliders-upload-card {
    display: grid;
    grid-template-columns: 74px minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #f9fafb;
    padding: 11px;
  }

  .writer-sliders-upload-preview {
    width: 74px;
    height: 54px;
    display: grid;
    place-items: center;
    overflow: hidden;
    border-radius: 9px;
    background: #e5e7eb;
    color: #6b7280;
  }

  .writer-sliders-upload-preview img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .writer-sliders-upload-card strong,
  .writer-sliders-upload-card span {
    display: block;
  }

  .writer-sliders-upload-card strong {
    color: #111827;
    font-size: 12px;
  }

  .writer-sliders-upload-card span {
    margin-top: 3px;
    color: #9ca3af;
    font-size: 10px;
    line-height: 1.4;
  }

  .writer-sliders-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 13px;
  }

  .writer-sliders-field {
    min-width: 0;
    display: grid;
    gap: 6px;
  }

  .writer-sliders-field.full {
    grid-column: 1 / -1;
  }

  .writer-sliders-field > span {
    color: #374151;
    font-size: 11px;
    font-weight: 750;
  }

  .writer-sliders-field input,
  .writer-sliders-field select,
  .writer-sliders-field textarea {
    width: 100%;
    min-width: 0;
    border: 1px solid #d1d5db;
    border-radius: 9px;
    background: #ffffff;
    color: #111827;
    outline: none;
    padding: 10px 11px;
    font-size: 12px;
  }

  .writer-sliders-field input,
  .writer-sliders-field select {
    height: 40px;
  }

  .writer-sliders-field textarea {
    resize: vertical;
    min-height: 82px;
    line-height: 1.5;
  }

  .writer-sliders-field input:focus,
  .writer-sliders-field select:focus,
  .writer-sliders-field textarea:focus,
  .writer-sliders-wallet-fund input:focus,
  .writer-sliders-topup-box input:focus {
    border-color: #6b7280;
    box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.10);
  }

  .writer-sliders-field small {
    color: #9ca3af;
    font-size: 9px;
  }

  .writer-sliders-topup-box {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #f9fafb;
    padding: 12px;
  }

  .writer-sliders-topup-box > div:first-child strong,
  .writer-sliders-topup-box > div:first-child span {
    display: block;
  }

  .writer-sliders-topup-box > div:first-child strong {
    font-size: 12px;
  }

  .writer-sliders-topup-box > div:first-child span {
    margin-top: 3px;
    color: #9ca3af;
    font-size: 10px;
  }

  .writer-sliders-topup-box > div:last-child {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    margin-top: 10px;
  }

  .writer-sliders-drawer-actions {
    justify-content: flex-end;
    padding-top: 4px;
  }

  @media (max-width: 1180px) {
    .writer-sliders-page {
      padding-left: 18px;
      padding-right: 18px;
    }

    .writer-sliders-wallet {
      grid-template-columns: 1fr;
    }

    .writer-sliders-stats.four {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .writer-slider-grid,
    .writer-ad-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 767px) {
    .writer-sliders-page {
      width: 100%;
      max-width: 100%;
      min-width: 0;
      padding: 14px 8px 32px;
      overflow-x: hidden;
    }

    .writer-sliders-tabs {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      margin-bottom: 16px;
    }

    .writer-sliders-tabs button {
      min-width: 0;
      padding-left: 8px;
      padding-right: 8px;
      font-size: 12px;
    }

    .writer-sliders-command {
      display: grid;
      gap: 14px;
    }

    .writer-sliders-command h2 {
      font-size: 21px;
    }

    .writer-sliders-command p {
      font-size: 12px;
    }

    .writer-sliders-command-actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      width: 100%;
    }

    .writer-sliders-command-actions .writer-sliders-btn {
      width: 100%;
      min-width: 0;
    }

    .writer-sliders-stats.three,
    .writer-sliders-stats.four {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .writer-sliders-stats.three > div:first-child {
      grid-column: 1 / -1;
    }

    .writer-sliders-stats > div {
      padding: 12px;
    }

    .writer-sliders-stats strong {
      font-size: 20px;
    }

    .writer-slider-grid,
    .writer-ad-grid {
      width: 100%;
      min-width: 0;
      grid-template-columns: minmax(0, 1fr);
      gap: 10px;
    }

    .writer-slider-card,
    .writer-ad-card {
      width: 100%;
      max-width: 100%;
      min-width: 0;
      border-radius: 12px;
    }

    .writer-slider-card-body,
    .writer-ad-card {
      padding: 13px;
    }

    .writer-slider-actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .writer-slider-actions .writer-sliders-btn {
      width: 100%;
      min-width: 0;
    }

    .writer-ad-metrics {
      gap: 6px;
    }

    .writer-ad-metrics > div {
      padding: 8px;
    }

    .writer-sliders-wallet {
      gap: 8px;
    }

    .writer-sliders-wallet-summary,
    .writer-sliders-wallet-fund {
      padding: 12px;
    }

    .writer-sliders-wallet-fund {
      grid-template-columns: 1fr;
    }

    .writer-sliders-wallet-fund .writer-sliders-btn {
      width: 100%;
    }

    .writer-sliders-settings-row {
      gap: 6px;
    }

    .writer-sliders-settings-row span {
      max-width: 100%;
    }

    .writer-sliders-overlay {
      background: #ffffff;
    }

    .writer-sliders-drawer,
    .writer-sliders-drawer.wide {
      width: 100vw;
      max-width: 100vw;
      min-width: 0;
      height: 100dvh;
      border-left: 0;
      box-shadow: none;
    }

    .writer-sliders-drawer-head {
      min-height: 64px;
      padding: 12px;
    }

    .writer-sliders-drawer-body {
      padding: 12px 8px 24px;
    }

    .writer-sliders-form-grid {
      grid-template-columns: minmax(0, 1fr);
      gap: 11px;
    }

    .writer-sliders-field.full {
      grid-column: auto;
    }

    .writer-sliders-upload-card {
      grid-template-columns: 60px minmax(0, 1fr);
      gap: 9px;
    }

    .writer-sliders-upload-preview {
      width: 60px;
      height: 50px;
    }

    .writer-sliders-upload-card .writer-sliders-btn {
      grid-column: 1 / -1;
      width: 100%;
    }

    .writer-sliders-topup-box > div:last-child {
      grid-template-columns: 1fr;
    }

    .writer-sliders-topup-box .writer-sliders-btn {
      width: 100%;
    }

    .writer-sliders-drawer-actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      width: 100%;
    }

    .writer-sliders-drawer-actions .writer-sliders-btn {
      width: 100%;
      min-width: 0;
    }
  }
`;export{ns as default};
