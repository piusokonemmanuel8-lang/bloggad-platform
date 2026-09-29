import{m as M,r as g,j as e,W as G,af as ye,T as je}from"./index-D7wY-Nn2.js";import{a as y}from"./api-BnafCqf_.js";import{S as ve}from"./sparkles-DniX3uPT.js";import{E as we}from"./eye--VBRzW0C.js";import{M as ke}from"./mouse-pointer-click-lKkXEnmE.js";import{T as J}from"./trending-up-CqYb75PL.js";import{R as Ne}from"./rocket-DJxQRBJZ.js";import{C as Se}from"./cloud-upload-CYBhXpEx.js";import{C as Ce}from"./calendar-days-Bxv19lUy.js";/**
 * @license lucide-react v1.8.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ze=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"10",x2:"10",y1:"15",y2:"9",key:"c1nkhi"}],["line",{x1:"14",x2:"14",y1:"15",y2:"9",key:"h65svq"}]],Pe=M("circle-pause",ze);/**
 * @license lucide-react v1.8.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ue=[["path",{d:"M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z",key:"kmsa83"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]],Me=M("circle-play",Ue);/**
 * @license lucide-react v1.8.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const De=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M8 12h8",key:"1wcyev"}],["path",{d:"M12 8v8",key:"napkw2"}]],Re=M("circle-plus",De);/**
 * @license lucide-react v1.8.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Te=[["path",{d:"M16 5h6",key:"1vod17"}],["path",{d:"M19 2v6",key:"4bpg5p"}],["path",{d:"M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5",key:"1ue2ih"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}]],K=M("image-plus",Te);/**
 * @license lucide-react v1.8.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Be=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]],Ae=M("target",Be),Q={ad_type:"product",target_id:"",website_id:"",campaign_title:"",campaign_description:"",campaign_image:"",total_budget:"10",daily_budget_cap:"",start_date:"",end_date:"",bid_cost_per_view:"",bid_cost_per_click:"",currency:"USD"},$e={campaign_id:"",amount:"10"};function $(s,c="USD"){const j=Number(s||0);return`${c==="USD"?"$":`${c} `}${j.toFixed(4)}`}function _(s,c="USD"){const j=Number(s||0);return`${c==="USD"?"$":`${c} `}${j.toFixed(2)}`}function m(s){const c=Number(s||0);return Number.isFinite(c)?c:0}function X(s){if(!s)return"-";const c=new Date(s);return Number.isNaN(c.getTime())?String(s).slice(0,10):c.toLocaleDateString()}function Z(s){return(s==null?void 0:s.title)||(s==null?void 0:s.name)||(s==null?void 0:s.website_name)||(s==null?void 0:s.site_name)||`Item #${s==null?void 0:s.id}`}function Ee(s){return s?s.website_name||s.name||s.site_name||s.title||s.slug||`Website #${s.id}`:"No website found"}function U(s,c){return s?c==="product"?{view:m(s.product_cost_per_view),click:m(s.product_cost_per_click),minimum:m(s.minimum_budget||10),currency:s.currency||"USD"}:c==="post"?{view:m(s.post_cost_per_view),click:m(s.post_cost_per_click),minimum:m(s.minimum_budget||10),currency:s.currency||"USD"}:{view:m(s.website_cost_per_view),click:m(s.website_cost_per_click),minimum:m(s.minimum_budget||10),currency:s.currency||"USD"}:{view:0,click:0,minimum:10,currency:"USD"}}function ee(s){return s==="product"?{title:"Promote Product",short:"Product",description:"Push one selected product into sponsored product placements.",accent:"#2563eb",soft:"#eff6ff"}:s==="post"?{title:"Promote Post",short:"Post",description:"Push one blog post into sponsored post and category placements.",accent:"#7c3aed",soft:"#f5f3ff"}:{title:"Promote Website",short:"Website",description:"Push your website into featured website placements.",accent:"#059669",soft:"#ecfdf5"}}function Le(s){return{active:{label:"Active",className:"is-green"},pending:{label:"Pending",className:"is-yellow"},paused:{label:"Paused",className:"is-blue"},daily_paused:{label:"Daily Paused",className:"is-purple"},exhausted:{label:"Exhausted",className:"is-red"},ended:{label:"Ended",className:"is-gray"},rejected:{label:"Rejected",className:"is-red"}}[s]||{label:s||"Unknown",className:"is-gray"}}function We(s){return{approved:{label:"Approved",className:"is-green"},pending:{label:"Awaiting Approval",className:"is-yellow"},rejected:{label:"Rejected",className:"is-red"}}[s]||{label:s||"Unknown",className:"is-gray"}}function ae({item:s}){return e.jsx("span",{className:`ads-badge ${s.className}`,children:s.label})}function Ke(){const s=g.useRef(null),[c,j]=g.useState([]),[d,ie]=g.useState(null),[l,te]=g.useState(null),[E,de]=g.useState([]),[L,re]=g.useState([]),[i,v]=g.useState(Q),[w,k]=g.useState($e),[D,I]=g.useState(null),[ne,V]=g.useState(!0),[R,T]=g.useState(!1),[B,A]=g.useState(null),[O,b]=g.useState(""),[W,x]=g.useState(""),u=g.useMemo(()=>U(d,i.ad_type),[d,i.ad_type]),F=g.useMemo(()=>ee(i.ad_type),[i.ad_type]),Y=g.useMemo(()=>i.ad_type==="website"?l:i.ad_type==="product"?E.find(a=>Number(a.id)===Number(i.target_id)):L.find(a=>Number(a.id)===Number(i.target_id)),[i.ad_type,i.target_id,l,E,L]),N=g.useMemo(()=>{const a=m(i.bid_cost_per_view);return a>0?Math.max(a,u.view):u.view},[i.bid_cost_per_view,u.view]),S=g.useMemo(()=>{const a=m(i.bid_cost_per_click);return a>0?Math.max(a,u.click):u.click},[i.bid_cost_per_click,u.click]),C=g.useMemo(()=>{const a=c.reduce((p,h)=>p+m(h.total_budget),0),t=c.reduce((p,h)=>p+m(h.remaining_budget),0),r=c.reduce((p,h)=>p+m(h.total_spent),0),o=c.reduce((p,h)=>p+m(h.total_views),0),n=c.reduce((p,h)=>p+m(h.total_clicks),0),P=o>0?(n/o*100).toFixed(2):"0.00";return{totalBudget:a,remaining:t,spent:r,views:o,clicks:n,ctr:P,active:c.filter(p=>p.status==="active").length,pending:c.filter(p=>p.approval_status==="pending").length}},[c]),ce=g.useMemo(()=>{const a=m(i.total_budget);return!a||!N?0:Math.floor(a/N)},[i.total_budget,N]),oe=g.useMemo(()=>{const a=m(i.total_budget);return!a||!S?0:Math.floor(a/S)},[i.total_budget,S]);async function H(){const{data:a}=await y.get("/affiliate/ads/options"),t=(a==null?void 0:a.settings)||null,r=(a==null?void 0:a.website)||null,o=Array.isArray(a==null?void 0:a.products)?a.products:[],n=Array.isArray(a==null?void 0:a.posts)?a.posts:[];ie(t),te(r),de(o),re(n);const P=U(t,i.ad_type);v(p=>({...p,website_id:r!=null&&r.id?String(r.id):p.website_id,target_id:p.ad_type==="website"?r!=null&&r.id?String(r.id):"":p.target_id,total_budget:p.total_budget||String(P.minimum||10),bid_cost_per_view:p.bid_cost_per_view||String(P.view||""),bid_cost_per_click:p.bid_cost_per_click||String(P.click||""),currency:(t==null?void 0:t.currency)||"USD"})),k(p=>({...p,amount:String((t==null?void 0:t.minimum_budget)||10)}))}async function z(){const{data:a}=await y.get("/affiliate/ads");j(Array.isArray(a==null?void 0:a.campaigns)?a.campaigns:[])}async function le(){var a,t;try{V(!0),x(""),await Promise.all([H(),z()])}catch(r){x(((t=(a=r==null?void 0:r.response)==null?void 0:a.data)==null?void 0:t.message)||"Unable to load affiliate ads.")}finally{V(!1)}}g.useEffect(()=>{le()},[]);function f(a,t){v(r=>({...r,[a]:t}))}function pe(a){const t=U(d,a);v(r=>({...r,ad_type:a,target_id:a==="website"&&l!=null&&l.id?String(l.id):"",website_id:l!=null&&l.id?String(l.id):r.website_id,total_budget:m(r.total_budget)>=t.minimum?r.total_budget:String(t.minimum||10),bid_cost_per_view:String(t.view||""),bid_cost_per_click:String(t.click||""),currency:t.currency||"USD"}))}function q(){const a=U(d,"product");v({...Q,total_budget:String(a.minimum||10),bid_cost_per_view:String(a.view||""),bid_cost_per_click:String(a.click||""),currency:(d==null?void 0:d.currency)||"USD",website_id:l!=null&&l.id?String(l.id):""}),I(null),x(""),s.current&&(s.current.value="")}function ge(a){const t=U(d,a.ad_type||"product");I(a.id),v({ad_type:a.ad_type||"product",target_id:a.target_id?String(a.target_id):"",website_id:a.website_id?String(a.website_id):l!=null&&l.id?String(l.id):"",campaign_title:a.campaign_title||"",campaign_description:a.campaign_description||"",campaign_image:a.campaign_image||"",total_budget:String(a.total_budget||t.minimum||10),daily_budget_cap:a.daily_budget_cap?String(a.daily_budget_cap):"",start_date:a.start_date?String(a.start_date).slice(0,10):"",end_date:a.end_date?String(a.end_date).slice(0,10):"",bid_cost_per_view:String(a.bid_cost_per_view||a.cost_per_view||t.view||""),bid_cost_per_click:String(a.bid_cost_per_click||a.cost_per_click||t.click||""),currency:a.currency||(d==null?void 0:d.currency)||"USD"}),b(""),x(""),window.scrollTo({top:0,behavior:"smooth"})}function me(a){var n;const t=(n=a.target.files)==null?void 0:n[0];if(!t)return;if(!t.type.startsWith("image/")){x("Please select a valid image file.");return}const r=2*1024*1024;if(t.size>r){x("Image is too large. Please use an image under 2MB.");return}const o=new FileReader;o.onload=()=>{x(""),f("campaign_image",String(o.result||""))},o.onerror=()=>{x("Unable to read image file.")},o.readAsDataURL(t)}function ue(){f("campaign_image",""),s.current&&(s.current.value="")}async function xe(a){var t,r;a.preventDefault();try{if(T(!0),b(""),x(""),!i.target_id){x(`Please choose the ${i.ad_type} you want to promote.`);return}const o={...i,website_id:i.website_id||(l!=null&&l.id?String(l.id):""),target_id:String(i.target_id),total_budget:String(m(i.total_budget)||u.minimum||10),daily_budget_cap:i.daily_budget_cap?String(m(i.daily_budget_cap)):"",bid_cost_per_view:String(N||u.view||0),bid_cost_per_click:String(S||u.click||0)};let n="Campaign created successfully.";D?(await y.put(`/affiliate/ads/${D}`,o),n="Campaign updated successfully."):await y.post("/affiliate/ads",o),await z(),await H(),q(),b(n),setTimeout(()=>{window.scrollTo({top:0,behavior:"smooth"})},100)}catch(o){x(((r=(t=o==null?void 0:o.response)==null?void 0:t.data)==null?void 0:r.message)||"Unable to save campaign.")}finally{T(!1)}}async function fe(a){var t,r,o;a.preventDefault();try{if(T(!0),b(""),x(""),!w.campaign_id){x("Please choose a campaign to top up.");return}const n=await y.post(`/affiliate/ads/${w.campaign_id}/top-up`,{amount:Number(w.amount),currency:(d==null?void 0:d.currency)||"USD"});b(((t=n==null?void 0:n.data)==null?void 0:t.message)||"Campaign topped up successfully."),k({campaign_id:"",amount:String((d==null?void 0:d.minimum_budget)||10)}),await z()}catch(n){x(((o=(r=n==null?void 0:n.response)==null?void 0:r.data)==null?void 0:o.message)||"Unable to top up campaign.")}finally{T(!1)}}async function be(a){var t,r,o;try{A(a),b(""),x("");const n=await y.put(`/affiliate/ads/${a}/pause`);b(((t=n==null?void 0:n.data)==null?void 0:t.message)||"Campaign paused."),await z()}catch(n){x(((o=(r=n==null?void 0:n.response)==null?void 0:r.data)==null?void 0:o.message)||"Unable to pause campaign.")}finally{A(null)}}async function he(a){var t,r,o;try{A(a),b(""),x("");const n=await y.put(`/affiliate/ads/${a}/resume`);b(((t=n==null?void 0:n.data)==null?void 0:t.message)||"Campaign resumed."),await z()}catch(n){x(((o=(r=n==null?void 0:n.response)==null?void 0:r.data)==null?void 0:o.message)||"Unable to resume campaign.")}finally{A(null)}}const _e=c.filter(a=>["active","paused","daily_paused","exhausted","ended"].includes(a.status));return ne?e.jsxs("div",{className:"ads-loading",children:[e.jsx("style",{children:se}),e.jsx("div",{children:"Loading ads studio..."})]}):e.jsxs("div",{className:"ads-page",children:[e.jsx("style",{children:se}),e.jsxs("section",{className:"ads-hero",children:[e.jsxs("div",{className:"ads-hero-copy",children:[e.jsxs("span",{className:"ads-pill",children:[e.jsx(ve,{size:14}),"Bloggad Ads Studio"]}),e.jsx("h1",{children:"Create ad campaigns with premium control"}),e.jsx("p",{children:"Promote a product, post, or website. Set your budget, daily cap, campaign duration, upload creative image, and increase your bid for stronger visibility."})]}),e.jsxs("div",{className:"ads-hero-panel",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Minimum Budget"}),e.jsx("strong",{children:_((d==null?void 0:d.minimum_budget)||10,(d==null?void 0:d.currency)||"USD")})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Currency"}),e.jsx("strong",{children:(d==null?void 0:d.currency)||"USD"})]})]})]}),(O||W)&&e.jsx("div",{className:W?"ads-alert is-error":"ads-alert is-success",children:W||O}),e.jsxs("section",{className:"ads-stats",children:[e.jsxs("div",{children:[e.jsx(G,{size:18}),e.jsx("span",{children:"Total Budget"}),e.jsx("strong",{children:_(C.totalBudget,(d==null?void 0:d.currency)||"USD")})]}),e.jsxs("div",{children:[e.jsx(ye,{size:18}),e.jsx("span",{children:"Remaining"}),e.jsx("strong",{children:_(C.remaining,(d==null?void 0:d.currency)||"USD")})]}),e.jsxs("div",{children:[e.jsx(we,{size:18}),e.jsx("span",{children:"Views"}),e.jsx("strong",{children:C.views.toLocaleString()})]}),e.jsxs("div",{children:[e.jsx(ke,{size:18}),e.jsx("span",{children:"Clicks"}),e.jsx("strong",{children:C.clicks.toLocaleString()})]}),e.jsxs("div",{children:[e.jsx(J,{size:18}),e.jsx("span",{children:"CTR"}),e.jsxs("strong",{children:[C.ctr,"%"]})]})]}),e.jsxs("section",{className:"ads-layout",children:[e.jsxs("div",{className:"ads-builder-card",children:[e.jsxs("div",{className:"ads-section-head",children:[e.jsxs("span",{children:[e.jsx(Ae,{size:15}),D?"Edit Campaign":"Create Campaign"]}),e.jsx("h2",{children:"Campaign Builder"}),e.jsx("p",{children:"Use this form to create a sponsored ad campaign."})]}),e.jsxs("form",{onSubmit:xe,className:"ads-form",children:[e.jsx("div",{className:"ads-step-title",children:"1. Choose campaign type"}),e.jsx("div",{className:"ads-type-grid",children:["product","post","website"].map(a=>{const t=ee(a),r=i.ad_type===a;return e.jsxs("button",{type:"button",onClick:()=>pe(a),className:r?"ads-type-card active":"ads-type-card",style:{"--accent":t.accent,"--soft":t.soft},children:[e.jsx(Ne,{size:18}),e.jsx("strong",{children:t.title}),e.jsx("span",{children:t.description})]},a)})}),e.jsx("div",{className:"ads-step-title",children:"2. Select target"}),i.ad_type==="website"?e.jsxs("div",{className:"ads-selected-website",children:[e.jsx("span",{children:"Selected Website"}),e.jsx("strong",{children:Ee(l)}),e.jsx("p",{children:"Website campaigns automatically use your own affiliate website."})]}):e.jsxs("label",{className:"ads-field full",children:[e.jsx("span",{children:i.ad_type==="product"?"Choose product":"Choose post"}),e.jsxs("select",{value:i.target_id,onChange:a=>f("target_id",a.target.value),children:[e.jsx("option",{value:"",children:i.ad_type==="product"?"Select one of your products":"Select one of your posts"}),(i.ad_type==="product"?E:L).map(a=>e.jsx("option",{value:a.id,children:Z(a)},a.id))]})]}),e.jsxs("div",{className:"ads-two",children:[e.jsxs("label",{className:"ads-field",children:[e.jsx("span",{children:"Campaign title"}),e.jsx("input",{value:i.campaign_title,onChange:a=>f("campaign_title",a.target.value),placeholder:"Example: Promote my best product"})]}),e.jsxs("label",{className:"ads-field",children:[e.jsx("span",{children:"Campaign image URL"}),e.jsx("input",{value:i.campaign_image.startsWith("data:image")?"Uploaded local image selected":i.campaign_image,onChange:a=>f("campaign_image",a.target.value),placeholder:"Paste image URL or upload below",disabled:i.campaign_image.startsWith("data:image")})]})]}),e.jsxs("div",{className:"ads-upload-box",children:[e.jsx("input",{ref:s,type:"file",accept:"image/*",onChange:me,hidden:!0}),e.jsxs("button",{type:"button",className:"ads-upload-button",onClick:()=>{var a;return(a=s.current)==null?void 0:a.click()},children:[e.jsx(Se,{size:18}),"Upload image from device"]}),i.campaign_image?e.jsxs("div",{className:"ads-upload-preview",children:[e.jsx("img",{src:i.campaign_image,alt:"Campaign preview"}),e.jsxs("button",{type:"button",onClick:ue,children:[e.jsx(je,{size:15}),"Remove"]})]}):e.jsxs("div",{className:"ads-upload-empty",children:[e.jsx(K,{size:24}),e.jsx("span",{children:"No image selected yet"})]})]}),e.jsxs("label",{className:"ads-field full",children:[e.jsx("span",{children:"Campaign description"}),e.jsx("textarea",{value:i.campaign_description,onChange:a=>f("campaign_description",a.target.value),rows:4,placeholder:"Add a short campaign note or description"})]}),e.jsx("div",{className:"ads-step-title",children:"3. Budget and duration"}),e.jsxs("div",{className:"ads-four",children:[e.jsxs("label",{className:"ads-field",children:[e.jsx("span",{children:"Total budget"}),e.jsx("input",{type:"number",min:u.minimum||10,step:"0.01",value:i.total_budget,onChange:a=>f("total_budget",a.target.value)}),e.jsxs("small",{children:["Minimum: ",_(u.minimum,u.currency)]})]}),e.jsxs("label",{className:"ads-field",children:[e.jsx("span",{children:"Daily spend cap"}),e.jsx("input",{type:"number",min:"0",step:"0.01",value:i.daily_budget_cap,onChange:a=>f("daily_budget_cap",a.target.value),placeholder:"Optional"}),e.jsx("small",{children:"Pauses for the day when reached."})]}),e.jsxs("label",{className:"ads-field",children:[e.jsx("span",{children:"Start date"}),e.jsx("input",{type:"date",value:i.start_date,onChange:a=>f("start_date",a.target.value)})]}),e.jsxs("label",{className:"ads-field",children:[e.jsx("span",{children:"End date"}),e.jsx("input",{type:"date",value:i.end_date,onChange:a=>f("end_date",a.target.value)})]})]}),e.jsx("div",{className:"ads-step-title",children:"4. Bid and visibility"}),e.jsxs("div",{className:"ads-bid-box",children:[e.jsxs("label",{className:"ads-field",children:[e.jsx("span",{children:"Bid cost per view"}),e.jsx("input",{type:"number",min:u.view||0,step:"0.0001",value:i.bid_cost_per_view,onChange:a=>f("bid_cost_per_view",a.target.value)}),e.jsxs("small",{children:["Base: ",$(u.view,u.currency)]})]}),e.jsxs("label",{className:"ads-field",children:[e.jsx("span",{children:"Bid cost per click"}),e.jsx("input",{type:"number",min:u.click||0,step:"0.0001",value:i.bid_cost_per_click,onChange:a=>f("bid_cost_per_click",a.target.value)}),e.jsxs("small",{children:["Base: ",$(u.click,u.currency)]})]}),e.jsxs("div",{className:"ads-strength",children:[e.jsx("span",{children:"Visibility Strength"}),e.jsx("strong",{children:S>u.click||N>u.view?"Boosted":"Base"}),e.jsx("small",{children:"Higher bid campaigns rank stronger."})]})]}),e.jsxs("div",{className:"ads-actions-row",children:[e.jsx("button",{type:"submit",disabled:R,className:"ads-primary-btn",children:R?"Saving...":D?"Update Campaign":"Submit Campaign"}),e.jsx("button",{type:"button",onClick:q,className:"ads-secondary-btn",children:"Reset"})]})]})]}),e.jsxs("aside",{className:"ads-side",children:[e.jsxs("div",{className:"ads-preview-card",children:[e.jsx("span",{className:"ads-mini-pill",style:{color:F.accent,background:F.soft},children:F.title}),e.jsx("h3",{children:i.campaign_title||"Campaign preview"}),e.jsx("p",{children:i.campaign_description||"Your campaign description will appear here."}),i.campaign_image?e.jsx("img",{src:i.campaign_image,alt:"Campaign preview"}):e.jsxs("div",{className:"ads-preview-image",children:[e.jsx(K,{size:26}),e.jsx("span",{children:"Creative image"})]}),e.jsxs("div",{className:"ads-preview-target",children:["Target: ",e.jsx("strong",{children:Y?Z(Y):"Not selected"})]})]}),e.jsxs("div",{className:"ads-mini-card",children:[e.jsx(G,{size:18}),e.jsx("h4",{children:"Budget Snapshot"}),e.jsxs("div",{className:"ads-mini-row",children:[e.jsx("span",{children:"Total"}),e.jsx("strong",{children:_(i.total_budget,u.currency)})]}),e.jsxs("div",{className:"ads-mini-row",children:[e.jsx("span",{children:"Daily cap"}),e.jsx("strong",{children:i.daily_budget_cap?_(i.daily_budget_cap,u.currency):"No cap"})]})]}),e.jsxs("div",{className:"ads-mini-card",children:[e.jsx(Ce,{size:18}),e.jsx("h4",{children:"Schedule"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Start:"})," ",i.start_date||"After approval"]}),e.jsxs("p",{children:[e.jsx("strong",{children:"End:"})," ",i.end_date||"No end date"]})]}),e.jsxs("div",{className:"ads-mini-card",children:[e.jsx(J,{size:18}),e.jsx("h4",{children:"Estimated Reach"}),e.jsxs("div",{className:"ads-mini-row",children:[e.jsx("span",{children:"Views"}),e.jsx("strong",{children:ce.toLocaleString()})]}),e.jsxs("div",{className:"ads-mini-row",children:[e.jsx("span",{children:"Clicks"}),e.jsx("strong",{children:oe.toLocaleString()})]})]}),e.jsxs("form",{onSubmit:fe,className:"ads-mini-card",children:[e.jsx("h4",{children:"Top Up Campaign"}),e.jsxs("label",{className:"ads-field",children:[e.jsx("span",{children:"Campaign"}),e.jsxs("select",{value:w.campaign_id,onChange:a=>k(t=>({...t,campaign_id:a.target.value})),children:[e.jsx("option",{value:"",children:"Choose campaign"}),_e.map(a=>e.jsx("option",{value:a.id,children:a.campaign_title},a.id))]})]}),e.jsxs("label",{className:"ads-field",children:[e.jsx("span",{children:"Amount"}),e.jsx("input",{type:"number",min:(d==null?void 0:d.minimum_budget)||10,step:"0.01",value:w.amount,onChange:a=>k(t=>({...t,amount:a.target.value}))})]}),e.jsx("button",{type:"submit",disabled:R,className:"ads-dark-btn",children:R?"Processing...":"Top Up"})]})]})]}),e.jsxs("section",{className:"ads-campaigns",children:[e.jsxs("div",{className:"ads-section-head",children:[e.jsx("h2",{children:"My Campaigns"}),e.jsx("p",{children:"Monitor approval, budget, bids, views, clicks, and campaign controls."})]}),c.length?e.jsx("div",{className:"ads-campaign-grid",children:c.map(a=>e.jsxs("article",{className:"ads-campaign-card",children:[e.jsxs("div",{className:"ads-card-top",children:[e.jsx("span",{className:"ads-mini-pill",children:a.ad_type}),e.jsxs("div",{children:[e.jsx(ae,{item:Le(a.status)}),e.jsx(ae,{item:We(a.approval_status)})]})]}),e.jsx("h3",{children:a.campaign_title}),e.jsx("p",{children:a.campaign_description||"No campaign description."}),e.jsxs("div",{className:"ads-campaign-metrics",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Budget"}),e.jsx("strong",{children:_(a.total_budget,a.currency)})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Remaining"}),e.jsx("strong",{children:_(a.remaining_budget,a.currency)})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Views"}),e.jsx("strong",{children:m(a.total_views).toLocaleString()})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Clicks"}),e.jsx("strong",{children:m(a.total_clicks).toLocaleString()})]})]}),e.jsxs("div",{className:"ads-campaign-info",children:[e.jsxs("span",{children:["Daily cap: ",a.daily_budget_cap?_(a.daily_budget_cap,a.currency):"No cap"]}),e.jsxs("span",{children:["Bid/view: ",$(a.bid_cost_per_view||a.cost_per_view,a.currency)]}),e.jsxs("span",{children:["Bid/click: ",$(a.bid_cost_per_click||a.cost_per_click,a.currency)]}),e.jsxs("span",{children:["Dates: ",a.start_date?X(a.start_date):"Immediate"," -"," ",a.end_date?X(a.end_date):"Open"]})]}),e.jsxs("div",{className:"ads-card-actions",children:[e.jsx("button",{type:"button",onClick:()=>ge(a),children:"Edit"}),a.status==="active"?e.jsxs("button",{type:"button",onClick:()=>be(a.id),disabled:B===a.id,children:[e.jsx(Pe,{size:15}),B===a.id?"Working...":"Pause"]}):e.jsxs("button",{type:"button",onClick:()=>he(a.id),disabled:B===a.id,children:[e.jsx(Me,{size:15}),B===a.id?"Working...":"Resume"]}),e.jsxs("button",{type:"button",className:"dark",onClick:()=>k({campaign_id:String(a.id),amount:String((d==null?void 0:d.minimum_budget)||10)}),children:[e.jsx(Re,{size:15}),"Top Up"]})]})]},a.id))}):e.jsx("div",{className:"ads-empty",children:"No campaigns yet. Create your first campaign above."})]})]})}const se=`
  .ads-loading {
    min-height: 60vh;
    display: grid;
    place-items: center;
    background: #f5f7fb;
  }

  .ads-loading > div {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 22px;
    padding: 24px;
    font-weight: 900;
    color: #111827;
  }

  .ads-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(37,99,235,0.08), transparent 24%),
      radial-gradient(circle at top right, rgba(124,58,237,0.08), transparent 24%),
      #f5f7fb;
    color: #111827;
    padding: 18px;
  }

  .ads-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.6fr);
    gap: 20px;
    align-items: end;
    background: linear-gradient(135deg, #111827 0%, #172033 52%, #312e81 100%);
    border-radius: 28px;
    padding: clamp(20px, 4vw, 34px);
    color: #ffffff;
    overflow: hidden;
    margin-bottom: 18px;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
  }

  .ads-pill,
  .ads-mini-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .ads-pill {
    background: rgba(255,255,255,0.12);
    color: #ffffff;
    border: 1px solid rgba(255,255,255,0.18);
    margin-bottom: 14px;
  }

  .ads-hero h1 {
    margin: 0;
    font-size: clamp(2rem, 5vw, 3.8rem);
    line-height: 1.02;
    letter-spacing: -0.06em;
    font-weight: 950;
    max-width: 820px;
  }

  .ads-hero p {
    margin: 14px 0 0;
    max-width: 850px;
    color: rgba(255,255,255,0.78);
    font-size: 15px;
    line-height: 1.75;
  }

  .ads-hero-panel {
    display: grid;
    gap: 14px;
  }

  .ads-hero-panel > div {
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.16);
    border-radius: 22px;
    padding: 18px;
  }

  .ads-hero-panel span {
    display: block;
    color: rgba(255,255,255,0.7);
    font-size: 12px;
    margin-bottom: 8px;
  }

  .ads-hero-panel strong {
    font-size: 24px;
    font-weight: 950;
  }

  .ads-alert {
    margin-bottom: 18px;
    border-radius: 16px;
    padding: 14px 16px;
    font-weight: 800;
  }

  .ads-alert.is-success {
    background: #ecfdf5;
    color: #166534;
    border: 1px solid #86efac;
  }

  .ads-alert.is-error {
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fca5a5;
  }

  .ads-stats {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 18px;
  }

  .ads-stats > div,
  .ads-builder-card,
  .ads-side > *,
  .ads-campaigns {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    box-shadow: 0 16px 38px rgba(15,23,42,0.06);
  }

  .ads-stats > div {
    padding: 16px;
  }

  .ads-stats svg {
    color: #2563eb;
    margin-bottom: 10px;
  }

  .ads-stats span {
    display: block;
    color: #64748b;
    font-size: 12px;
    margin-bottom: 6px;
  }

  .ads-stats strong {
    display: block;
    font-size: clamp(1.1rem, 2vw, 1.7rem);
    font-weight: 950;
    color: #111827;
  }

  .ads-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(340px, 0.75fr);
    gap: 18px;
    align-items: start;
    margin-bottom: 18px;
  }

  .ads-builder-card {
    overflow: hidden;
  }

  .ads-section-head {
    padding: 22px;
    border-bottom: 1px solid #eef2f7;
  }

  .ads-section-head > span {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    padding: 8px 12px;
    border-radius: 999px;
    background: #eef2ff;
    color: #4338ca;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 10px;
  }

  .ads-section-head h2 {
    margin: 0;
    font-size: clamp(1.4rem, 3vw, 2rem);
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .ads-section-head p {
    margin: 8px 0 0;
    color: #64748b;
    line-height: 1.6;
  }

  .ads-form {
    padding: 22px;
  }

  .ads-step-title {
    font-size: 14px;
    font-weight: 950;
    color: #111827;
    margin: 22px 0 12px;
  }

  .ads-step-title:first-child {
    margin-top: 0;
  }

  .ads-type-grid,
  .ads-two,
  .ads-four,
  .ads-bid-box {
    display: grid;
    gap: 14px;
  }

  .ads-type-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .ads-type-card {
    text-align: left;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    border-radius: 20px;
    padding: 16px;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .ads-type-card.active {
    border-color: var(--accent);
    background: var(--soft);
  }

  .ads-type-card svg {
    color: var(--accent);
    margin-bottom: 10px;
  }

  .ads-type-card strong,
  .ads-type-card span {
    display: block;
  }

  .ads-type-card strong {
    color: #111827;
    font-weight: 950;
    margin-bottom: 6px;
  }

  .ads-type-card span {
    color: #64748b;
    font-size: 13px;
    line-height: 1.6;
  }

  .ads-two,
  .ads-bid-box {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ads-four {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .ads-field {
    display: block;
  }

  .ads-field.full {
    grid-column: 1 / -1;
  }

  .ads-field span {
    display: block;
    margin-bottom: 8px;
    color: #334155;
    font-size: 13px;
    font-weight: 900;
  }

  .ads-field input,
  .ads-field select,
  .ads-field textarea {
    width: 100%;
    border: 1px solid #dbe3ef;
    background: #ffffff;
    border-radius: 16px;
    padding: 13px 14px;
    color: #111827;
    font-size: 14px;
    outline: none;
  }

  .ads-field input,
  .ads-field select {
    min-height: 52px;
  }

  .ads-field textarea {
    resize: vertical;
    line-height: 1.7;
  }

  .ads-field small {
    display: block;
    color: #64748b;
    margin-top: 7px;
    font-size: 12px;
  }

  .ads-selected-website,
  .ads-upload-box,
  .ads-bid-box {
    border: 1px solid #e5e7eb;
    background: #f8fafc;
    border-radius: 20px;
    padding: 16px;
  }

  .ads-selected-website span {
    display: block;
    color: #2563eb;
    font-size: 12px;
    font-weight: 950;
    margin-bottom: 6px;
  }

  .ads-selected-website strong {
    display: block;
    color: #111827;
    font-size: 18px;
    font-weight: 950;
  }

  .ads-selected-website p {
    margin: 7px 0 0;
    color: #64748b;
    line-height: 1.6;
  }

  .ads-upload-box {
    display: grid;
    gap: 12px;
    margin: 14px 0;
  }

  .ads-upload-button {
    min-height: 52px;
    border: 1px dashed #93c5fd;
    background: #eff6ff;
    color: #1d4ed8;
    border-radius: 16px;
    font-weight: 900;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .ads-upload-preview {
    display: grid;
    grid-template-columns: 130px 1fr;
    gap: 12px;
    align-items: center;
  }

  .ads-upload-preview img {
    width: 130px;
    height: 90px;
    object-fit: cover;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
  }

  .ads-upload-preview button {
    width: fit-content;
    border: 0;
    background: #fee2e2;
    color: #b91c1c;
    border-radius: 12px;
    padding: 10px 13px;
    font-weight: 900;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  .ads-upload-empty {
    min-height: 90px;
    display: grid;
    place-items: center;
    gap: 7px;
    color: #64748b;
    border: 1px dashed #cbd5e1;
    border-radius: 16px;
    background: #ffffff;
  }

  .ads-strength {
    border: 1px solid #fed7aa;
    background: #fff7ed;
    border-radius: 18px;
    padding: 15px;
  }

  .ads-strength span,
  .ads-strength small {
    display: block;
    color: #9a3412;
  }

  .ads-strength span {
    font-size: 12px;
    font-weight: 900;
    margin-bottom: 7px;
  }

  .ads-strength strong {
    display: block;
    color: #111827;
    font-size: 24px;
    font-weight: 950;
    margin-bottom: 7px;
  }

  .ads-actions-row,
  .ads-card-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 18px;
  }

  .ads-primary-btn,
  .ads-secondary-btn,
  .ads-dark-btn,
  .ads-card-actions button {
    min-height: 46px;
    border-radius: 14px;
    font-weight: 950;
    cursor: pointer;
    padding: 0 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .ads-primary-btn {
    border: 0;
    color: #ffffff;
    background: linear-gradient(90deg, #2563eb 0%, #7c3aed 100%);
  }

  .ads-secondary-btn {
    background: #ffffff;
    color: #111827;
    border: 1px solid #d1d5db;
  }

  .ads-dark-btn,
  .ads-card-actions .dark {
    border: 0;
    background: #111827;
    color: #ffffff;
  }

  .ads-side {
    display: grid;
    gap: 16px;
    position: sticky;
    top: 16px;
  }

  .ads-preview-card,
  .ads-mini-card {
    padding: 18px;
  }

  .ads-preview-card h3 {
    margin: 12px 0 8px;
    font-size: 24px;
    font-weight: 950;
    letter-spacing: -0.03em;
  }

  .ads-preview-card p {
    margin: 0 0 14px;
    color: #64748b;
    line-height: 1.6;
  }

  .ads-preview-card img,
  .ads-preview-image {
    width: 100%;
    height: 220px;
    object-fit: cover;
    border-radius: 18px;
    border: 1px solid #e5e7eb;
    background: #f8fafc;
  }

  .ads-preview-image {
    display: grid;
    place-items: center;
    color: #64748b;
  }

  .ads-preview-image span {
    display: block;
    margin-top: 6px;
    font-weight: 800;
  }

  .ads-preview-target {
    margin-top: 14px;
    padding: 12px;
    border-radius: 14px;
    background: #f8fafc;
    color: #64748b;
    line-height: 1.5;
  }

  .ads-preview-target strong {
    color: #111827;
  }

  .ads-mini-card h4 {
    margin: 10px 0 14px;
    font-size: 18px;
    font-weight: 950;
  }

  .ads-mini-card p {
    margin: 8px 0;
    color: #475569;
  }

  .ads-mini-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0;
    border-top: 1px solid #eef2f7;
    color: #64748b;
  }

  .ads-mini-row strong {
    color: #111827;
  }

  .ads-campaigns {
    padding-bottom: 22px;
  }

  .ads-campaign-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    padding: 22px;
  }

  .ads-campaign-card {
    border: 1px solid #e5e7eb;
    border-radius: 22px;
    padding: 18px;
    background: #ffffff;
  }

  .ads-card-top {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .ads-card-top > div {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    justify-content: flex-end;
  }

  .ads-badge {
    display: inline-flex;
    padding: 6px 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 900;
  }

  .ads-badge.is-green {
    background: #dcfce7;
    color: #166534;
  }

  .ads-badge.is-yellow {
    background: #fef3c7;
    color: #92400e;
  }

  .ads-badge.is-blue {
    background: #e0e7ff;
    color: #3730a3;
  }

  .ads-badge.is-purple {
    background: #ede9fe;
    color: #6d28d9;
  }

  .ads-badge.is-red {
    background: #fee2e2;
    color: #b91c1c;
  }

  .ads-badge.is-gray {
    background: #f3f4f6;
    color: #374151;
  }

  .ads-campaign-card h3 {
    margin: 0 0 8px;
    color: #111827;
    font-size: 21px;
    font-weight: 950;
  }

  .ads-campaign-card p {
    color: #64748b;
    line-height: 1.6;
    margin: 0 0 14px;
  }

  .ads-campaign-metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 14px;
  }

  .ads-campaign-metrics div {
    background: #f8fafc;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    padding: 12px;
  }

  .ads-campaign-metrics span {
    display: block;
    color: #64748b;
    font-size: 11px;
    margin-bottom: 5px;
  }

  .ads-campaign-metrics strong {
    display: block;
    color: #111827;
    font-size: 15px;
  }

  .ads-campaign-info {
    display: grid;
    gap: 6px;
    color: #475569;
    font-size: 13px;
    line-height: 1.5;
  }

  .ads-card-actions button {
    background: #ffffff;
    color: #111827;
    border: 1px solid #d1d5db;
  }

  .ads-empty {
    margin: 22px;
    padding: 28px;
    border-radius: 20px;
    border: 1px dashed #cbd5e1;
    color: #64748b;
    text-align: center;
    font-weight: 800;
  }

  @media (max-width: 1180px) {
    .ads-layout,
    .ads-hero {
      grid-template-columns: 1fr;
    }

    .ads-side {
      position: static;
    }

    .ads-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 760px) {
    .ads-page {
      padding: 10px;
    }

    .ads-hero {
      border-radius: 22px;
      padding: 18px;
    }

    .ads-hero h1 {
      font-size: clamp(1.7rem, 9vw, 2.4rem);
      line-height: 1.08;
    }

    .ads-hero p {
      font-size: 14px;
    }

    .ads-stats,
    .ads-type-grid,
    .ads-two,
    .ads-four,
    .ads-bid-box,
    .ads-campaign-grid,
    .ads-campaign-metrics {
      grid-template-columns: 1fr;
    }

    .ads-section-head,
    .ads-form,
    .ads-preview-card,
    .ads-mini-card,
    .ads-campaign-grid {
      padding: 16px;
    }

    .ads-builder-card,
    .ads-side > *,
    .ads-campaigns,
    .ads-stats > div {
      border-radius: 20px;
    }

    .ads-upload-preview {
      grid-template-columns: 1fr;
    }

    .ads-upload-preview img {
      width: 100%;
      height: 180px;
    }

    .ads-actions-row button,
    .ads-card-actions button,
    .ads-primary-btn,
    .ads-secondary-btn,
    .ads-dark-btn {
      width: 100%;
    }

    .ads-preview-card img,
    .ads-preview-image {
      height: 180px;
    }
  }
`;export{Ke as default};
