import{m as W,r as l,W as L,j as e,R as H,X as Y,k as U,a as E}from"./index-D7wY-Nn2.js";import{T as B}from"./trending-up-CqYb75PL.js";import{D as K}from"./dollar-sign-BG2jRcML.js";import{A as X}from"./arrow-up-right-CUsVj62x.js";/**
 * @license lucide-react v1.8.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J=[["path",{d:"m7 7 10 10",key:"1fmybs"}],["path",{d:"M17 7v10H7",key:"6fjiku"}]],Q=W("arrow-down-right",J);/**
 * @license lucide-react v1.8.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 6v6l4 2",key:"mmk7yg"}]],ee=W("clock",Z);/**
 * @license lucide-react v1.8.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const re=[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]],M=W("download",re);function t(a,s=2){const d=Number(a||0);return Number.isFinite(d)?d.toLocaleString(void 0,{minimumFractionDigits:s,maximumFractionDigits:s}):0 .toFixed(s)}function T(a){if(!a)return"No date";const s=new Date(a);return Number.isNaN(s.getTime())?String(a):s.toLocaleString(void 0,{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"})}function P(a){const s=String(a||"").toLowerCase();return s==="approved"||s==="paid"||s==="completed"?"is-success":s==="rejected"||s==="failed"?"is-danger":"is-pending"}function ae(a){const s=String((a==null?void 0:a.reference_type)||"").toLowerCase(),d=String((a==null?void 0:a.type)||"").toLowerCase();return s==="writer_appreciation"?"Reader appreciation":s==="writer_membership"?"Direct Writer membership":d==="withdrawal_request"?"Withdrawal requested":d==="withdrawal_paid"?"Withdrawal paid":d==="withdrawal_rejected"?"Withdrawal rejected":(a==null?void 0:a.description)||"Wallet activity"}function F(a){return String((a==null?void 0:a.type)||"").toLowerCase().startsWith("withdrawal")}function I({mobile:a=!1}){return e.jsxs("section",{className:`ww-card ww-rules-card ${a?"ww-rules-mobile":"ww-rules-desktop"}`,children:[e.jsxs("div",{className:"ww-card-head compact",children:[e.jsxs("div",{children:[e.jsx("span",{className:"ww-card-kicker",children:"Wallet rules"}),e.jsx("h2",{children:"How withdrawals move"})]}),e.jsx(U,{size:20,"aria-hidden":"true"})]}),e.jsxs("ol",{className:"ww-rules-list",children:[e.jsxs("li",{children:[e.jsx("span",{children:"1"}),e.jsxs("div",{children:[e.jsx("strong",{children:"Requested funds are reserved immediately"}),e.jsx("p",{children:"Your available balance drops when the request is submitted."})]})]}),e.jsxs("li",{children:[e.jsx("span",{children:"2"}),e.jsxs("div",{children:[e.jsx("strong",{children:"Platform review follows"}),e.jsx("p",{children:"The request stays visible while it is pending or approved."})]})]}),e.jsxs("li",{children:[e.jsx("span",{children:"3"}),e.jsxs("div",{children:[e.jsx("strong",{children:"Rejected funds return"}),e.jsx("p",{children:"A rejected request restores the reserved amount to your available balance."})]})]})]})]})}function oe(){const[a,s]=l.useState(null),[d,y]=l.useState({amount:"",payment_method:"",payment_details:""}),[j,p]=l.useState(""),[S,k]=l.useState(""),[x,R]=l.useState(!0),[u,$]=l.useState(!1),[N,m]=l.useState(!1);async function z(r=!0){var i,c;try{r&&R(!0),p("");const h=await E.get("/api/writer/wallet");s(h.data||null)}catch(h){p(((c=(i=h==null?void 0:h.response)==null?void 0:i.data)==null?void 0:c.message)||"Failed to load Writer wallet.")}finally{r&&R(!1)}}l.useEffect(()=>{z()},[]),l.useEffect(()=>{if(!N)return;const r=document.body.style.overflow;function i(c){c.key==="Escape"&&!u&&m(!1)}return document.body.style.overflow="hidden",window.addEventListener("keydown",i),()=>{document.body.style.overflow=r,window.removeEventListener("keydown",i)}},[N,u]);const f=(a==null?void 0:a.wallet)||{},n=(a==null?void 0:a.appreciation)||{},v=Array.isArray(a==null?void 0:a.transactions)?a.transactions:[],_=Array.isArray(a==null?void 0:a.withdrawals)?a.withdrawals:[],w=Number(f.available_balance||0),o=Number((a==null?void 0:a.withdrawal_threshold)||0),A=(a==null?void 0:a.currency)||"USD",b=w>0&&(o<=0||w>=o),O=o>0?Math.min(100,Math.max(0,w/o*100)):w>0?100:0,q=l.useMemo(()=>v.reduce((r,i)=>(String((i==null?void 0:i.reference_type)||"").toLowerCase()==="writer_membership"&&!F(i)&&(r.count+=1,r.amount+=Number((i==null?void 0:i.amount)||0)),r),{count:0,amount:0}),[v]);async function G(r){var c,h,C;r.preventDefault();const i=Number(d.amount);if(!Number.isFinite(i)||i<=0){p("Enter a withdrawal amount greater than zero.");return}if(o>0&&i<o){p(`Minimum withdrawal is USD ${t(o)}.`);return}if(i>w){p(`Insufficient Writer wallet balance. Available: USD ${t(w)}.`);return}try{$(!0),p(""),k("");const g=await E.post("/api/writer/wallet/withdrawals",{amount:Number(d.amount),payment_method:d.payment_method,payment_details:d.payment_details});y({amount:"",payment_method:"",payment_details:""}),k(((c=g==null?void 0:g.data)==null?void 0:c.message)||"Withdrawal request submitted."),m(!1),await z(!1)}catch(g){p(((C=(h=g==null?void 0:g.response)==null?void 0:h.data)==null?void 0:C.message)||"Failed to request withdrawal.")}finally{$(!1)}}function D(){p(""),k(""),m(!0)}const V=[{label:"Available",value:x?"--":`$${t(f.available_balance)}`,helper:"Ready funds",icon:L},{label:"Pending",value:x?"--":`$${t(f.pending_balance)}`,helper:"Still settling",icon:ee},{label:"Total earned",value:x?"--":`$${t(f.total_earned)}`,helper:"All Writer earnings",icon:B},{label:"Withdrawn",value:x?"--":`$${t(f.total_withdrawn)}`,helper:"Paid out",icon:K}];return e.jsxs("div",{className:"writer-wallet-page",children:[e.jsx("style",{children:ie}),e.jsxs("section",{className:"ww-page-head",children:[e.jsxs("div",{children:[e.jsx("span",{className:"ww-eyebrow",children:"Writer finances"}),e.jsx("h1",{children:"Writer Wallet"}),e.jsx("p",{children:"Track earnings from Reader appreciation and direct memberships, review wallet activity, and request withdrawals from your available USD balance."})]}),e.jsxs("button",{type:"button",className:"ww-primary-button ww-desktop-request",onClick:D,disabled:!b,children:[e.jsx(M,{size:17,"aria-hidden":"true"}),"Request withdrawal"]})]}),j?e.jsx("div",{className:"ww-alert is-error",role:"alert",children:j}):null,S?e.jsx("div",{className:"ww-alert is-success",role:"status",children:S}):null,e.jsx("section",{className:"ww-stats-grid","aria-label":"Writer wallet balances",children:V.map(r=>{const i=r.icon;return e.jsxs("article",{className:"ww-stat-card",children:[e.jsx("div",{className:"ww-stat-icon",children:e.jsx(i,{size:19,"aria-hidden":"true"})}),e.jsx("span",{className:"ww-stat-label",children:r.label}),e.jsx("strong",{className:"ww-stat-value",children:r.value}),e.jsx("span",{className:"ww-stat-helper",children:r.helper})]},r.label)})}),e.jsxs("div",{className:"ww-content-grid",children:[e.jsxs("section",{className:"ww-card ww-activity-card",children:[e.jsxs("div",{className:"ww-card-head",children:[e.jsxs("div",{children:[e.jsx("span",{className:"ww-card-kicker",children:"Recent movement"}),e.jsx("h2",{children:"Wallet Activity"}),e.jsx("p",{children:"Credits and withdrawal events recorded in your Writer wallet."})]}),e.jsx("button",{type:"button",className:"ww-icon-button",onClick:()=>z(!1),disabled:x,"aria-label":"Refresh wallet activity",title:"Refresh",children:e.jsx(H,{size:17,"aria-hidden":"true"})})]}),x?e.jsxs("div",{className:"ww-state",children:[e.jsx("span",{className:"ww-spinner","aria-hidden":"true"}),e.jsx("strong",{children:"Loading wallet activity..."})]}):v.length?e.jsx("div",{className:"ww-activity-list",children:v.slice(0,8).map(r=>{const i=F(r),c=Math.abs(Number((r==null?void 0:r.amount)||0));return e.jsxs("article",{className:"ww-activity-row",children:[e.jsx("div",{className:`ww-activity-direction ${i?"is-debit":"is-credit"}`,children:i?e.jsx(Q,{size:17,"aria-hidden":"true"}):e.jsx(X,{size:17,"aria-hidden":"true"})}),e.jsxs("div",{className:"ww-activity-copy",children:[e.jsxs("div",{className:"ww-activity-title-line",children:[e.jsx("strong",{children:ae(r)}),e.jsx("span",{className:`ww-status-pill ${P(r==null?void 0:r.status)}`,children:(r==null?void 0:r.status)||"pending"})]}),e.jsx("p",{children:(r==null?void 0:r.description)||"Wallet transaction"}),e.jsx("span",{children:T(r==null?void 0:r.created_at)})]}),e.jsxs("strong",{className:`ww-activity-amount ${i?"is-debit":"is-credit"}`,children:[i?"-":"+","$",t(c)]})]},r.id)})}):e.jsxs("div",{className:"ww-state",children:[e.jsx(L,{size:28,"aria-hidden":"true"}),e.jsx("strong",{children:"No wallet activity yet"}),e.jsx("p",{children:"Your Writer credits and withdrawal activity will appear here."})]})]}),e.jsxs("section",{className:"ww-card ww-readiness-card",children:[e.jsxs("div",{className:"ww-card-head compact",children:[e.jsxs("div",{children:[e.jsx("span",{className:"ww-card-kicker",children:"Withdrawal readiness"}),e.jsx("h2",{children:b?"Ready to withdraw":"Not ready yet"})]}),e.jsx("span",{className:`ww-readiness-dot ${b?"is-ready":""}`})]}),e.jsxs("div",{className:"ww-readiness-amounts",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Available balance"}),e.jsxs("strong",{children:["$",t(w)]})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Minimum withdrawal"}),e.jsxs("strong",{children:["$",t(o)]})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Currency"}),e.jsx("strong",{children:A})]})]}),e.jsx("div",{className:"ww-progress-track","aria-hidden":"true",children:e.jsx("span",{style:{width:`${O}%`}})}),e.jsx("p",{className:"ww-readiness-copy",children:b?"Your available balance meets the current withdrawal requirement.":o>0?`Reach ${t(o)} USD in available funds before requesting a withdrawal.`:"Available funds are required before a withdrawal can be requested."}),e.jsx("button",{type:"button",className:"ww-secondary-button",onClick:D,disabled:!b,children:"Request withdrawal"})]}),e.jsxs("section",{className:"ww-card ww-earnings-card",children:[e.jsx("div",{className:"ww-card-head compact",children:e.jsxs("div",{children:[e.jsx("span",{className:"ww-card-kicker",children:"Earnings sources"}),e.jsx("h2",{children:"Where earnings came from"})]})}),e.jsxs("div",{className:"ww-source-list",children:[e.jsxs("div",{className:"ww-source-row",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Reader appreciation"}),e.jsxs("small",{children:[Number((n==null?void 0:n.count)||0).toLocaleString()," appreciations"," | ",Number((n==null?void 0:n.credits)||0).toLocaleString()," credits"]})]}),e.jsxs("strong",{children:["$",t(n==null?void 0:n.writer_net_usd)]})]}),e.jsxs("div",{className:"ww-source-row",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Direct memberships"}),e.jsxs("small",{children:[q.count.toLocaleString()," wallet credits"]})]}),e.jsxs("strong",{children:["$",t(q.amount)]})]})]}),e.jsxs("div",{className:"ww-appreciation-breakdown",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Appreciation gross"}),e.jsxs("strong",{children:["$",t(n==null?void 0:n.gross_usd)]})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Platform fee"}),e.jsxs("strong",{children:["$",t(n==null?void 0:n.platform_fee_usd)]})]})]})]}),e.jsx(I,{})]}),e.jsxs("section",{className:"ww-card ww-history-card",children:[e.jsxs("div",{className:"ww-card-head",children:[e.jsxs("div",{children:[e.jsx("span",{className:"ww-card-kicker",children:"Payout records"}),e.jsx("h2",{children:"Withdrawal History"}),e.jsx("p",{children:"Your most recent Writer withdrawal requests and their review status."})]}),e.jsx("span",{className:"ww-count-badge",children:_.length})]}),x?e.jsxs("div",{className:"ww-state",children:[e.jsx("span",{className:"ww-spinner","aria-hidden":"true"}),e.jsx("strong",{children:"Loading withdrawal history..."})]}):_.length?e.jsxs("div",{className:"ww-history-list",children:[e.jsxs("div",{className:"ww-history-header","aria-hidden":"true",children:[e.jsx("span",{children:"Requested"}),e.jsx("span",{children:"Method"}),e.jsx("span",{children:"Amount"}),e.jsx("span",{children:"Status"})]}),_.slice(0,8).map(r=>e.jsxs("article",{className:"ww-history-row",children:[e.jsxs("div",{children:[e.jsx("span",{className:"ww-mobile-label",children:"Requested"}),e.jsx("strong",{children:T(r==null?void 0:r.created_at)})]}),e.jsxs("div",{children:[e.jsx("span",{className:"ww-mobile-label",children:"Method"}),e.jsx("strong",{children:(r==null?void 0:r.payment_method)||"Not specified"}),r!=null&&r.admin_note?e.jsx("small",{children:r.admin_note}):null]}),e.jsxs("div",{children:[e.jsx("span",{className:"ww-mobile-label",children:"Amount"}),e.jsxs("strong",{children:["$",t(r==null?void 0:r.amount)]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"ww-mobile-label",children:"Status"}),e.jsx("span",{className:`ww-status-pill ${P(r==null?void 0:r.status)}`,children:(r==null?void 0:r.status)||"pending"})]})]},r.id))]}):e.jsxs("div",{className:"ww-state",children:[e.jsx(M,{size:27,"aria-hidden":"true"}),e.jsx("strong",{children:"No withdrawals yet"}),e.jsx("p",{children:"Submitted withdrawal requests will appear here."})]})]}),e.jsx(I,{mobile:!0}),N?e.jsx("div",{className:"ww-dialog-backdrop",role:"presentation",onMouseDown:r=>{r.target===r.currentTarget&&!u&&m(!1)},children:e.jsxs("section",{className:"ww-withdrawal-drawer",role:"dialog","aria-modal":"true","aria-labelledby":"ww-withdrawal-title",children:[e.jsxs("div",{className:"ww-drawer-head",children:[e.jsxs("div",{children:[e.jsx("span",{className:"ww-card-kicker",children:"Writer payout"}),e.jsx("h2",{id:"ww-withdrawal-title",children:"Request Withdrawal"}),e.jsx("p",{children:"Submit a payout request from your available Writer wallet balance."})]}),e.jsx("button",{type:"button",className:"ww-icon-button",onClick:()=>m(!1),disabled:u,"aria-label":"Close withdrawal form",children:e.jsx(Y,{size:20,"aria-hidden":"true"})})]}),e.jsxs("div",{className:"ww-drawer-summary",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Available"}),e.jsxs("strong",{children:["$",t(w)]})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Minimum"}),e.jsxs("strong",{children:["$",t(o)]})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Currency"}),e.jsx("strong",{children:A})]})]}),j?e.jsx("div",{className:"ww-drawer-error",role:"alert",children:j}):null,e.jsxs("form",{className:"ww-withdrawal-form",onSubmit:G,children:[e.jsxs("label",{children:[e.jsx("span",{children:"Amount in USD"}),e.jsx("input",{type:"number",min:o>0?o:.01,max:w||void 0,step:"0.01",placeholder:"0.00",value:d.amount,onChange:r=>y(i=>({...i,amount:r.target.value})),required:!0,autoFocus:!0}),e.jsx("small",{children:"Enter an amount no higher than your available balance."})]}),e.jsxs("label",{children:[e.jsx("span",{children:"Payment method"}),e.jsx("input",{type:"text",maxLength:50,placeholder:"Bank transfer, PayPal, or another method",value:d.payment_method,onChange:r=>y(i=>({...i,payment_method:r.target.value}))})]}),e.jsxs("label",{children:[e.jsx("span",{children:"Payment details"}),e.jsx("textarea",{rows:5,maxLength:2e3,placeholder:"Add the payout details the platform team should use.",value:d.payment_details,onChange:r=>y(i=>({...i,payment_details:r.target.value}))})]}),e.jsxs("div",{className:"ww-reserve-note",children:[e.jsx(U,{size:18,"aria-hidden":"true"}),e.jsx("p",{children:"Submitted funds are reserved immediately. If the request is rejected, the reserved amount is restored to your available balance."})]}),e.jsxs("div",{className:"ww-drawer-actions",children:[e.jsx("button",{type:"button",className:"ww-secondary-button",onClick:()=>m(!1),disabled:u,children:"Cancel"}),e.jsx("button",{type:"submit",className:"ww-primary-button",disabled:u,children:u?"Submitting...":"Submit request"})]})]})]})}):null]})}const ie=`
  /* BLOGGAD WRITER WALLET FIGMA APPROVED V1 START */
  .writer-wallet-page {
    width: 100%;
    color: #172033;
    font-size: 14px;
    line-height: 1.5;
  }

  .writer-wallet-page * {
    box-sizing: border-box;
  }

  .ww-page-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 20px;
  }

  .ww-page-head h1,
  .ww-card h2,
  .ww-drawer-head h2 {
    margin: 0;
    color: #101828;
    letter-spacing: -0.025em;
  }

  .ww-page-head h1 {
    margin-top: 5px;
    font-size: 26px;
    line-height: 1.15;
    font-weight: 750;
  }

  .ww-page-head p {
    max-width: 760px;
    margin: 8px 0 0;
    color: #667085;
    font-size: 14px;
    line-height: 1.6;
  }

  .ww-eyebrow,
  .ww-card-kicker {
    display: inline-block;
    color: #667085;
    font-size: 12px;
    line-height: 1.25;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .ww-primary-button,
  .ww-secondary-button,
  .ww-icon-button {
    appearance: none;
    border: 0;
    font: inherit;
    cursor: pointer;
  }

  .ww-primary-button,
  .ww-secondary-button {
    min-height: 42px;
    border-radius: 10px;
    padding: 0 16px;
    font-size: 13px;
    font-weight: 700;
    transition: background 160ms ease, border-color 160ms ease, opacity 160ms ease;
  }

  .ww-primary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: #2563eb;
    color: #ffffff;
  }

  .ww-primary-button:hover:not(:disabled) {
    background: #1d4ed8;
  }

  .ww-secondary-button {
    background: #ffffff;
    border: 1px solid #d0d5dd;
    color: #344054;
  }

  .ww-secondary-button:hover:not(:disabled) {
    background: #f8fafc;
  }

  .ww-primary-button:disabled,
  .ww-secondary-button:disabled,
  .ww-icon-button:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }

  .ww-alert {
    margin-bottom: 16px;
    border: 1px solid;
    border-radius: 12px;
    padding: 12px 14px;
    font-size: 13px;
    font-weight: 650;
  }

  .ww-alert.is-error {
    border-color: #fecaca;
    background: #fef2f2;
    color: #b42318;
  }

  .ww-alert.is-success {
    border-color: #bbf7d0;
    background: #f0fdf4;
    color: #166534;
  }

  .ww-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 14px;
  }

  .ww-stat-card,
  .ww-card {
    border: 1px solid #e4e7ec;
    background: #ffffff;
    box-shadow: 0 1px 2px rgba(16, 24, 40, 0.02);
  }

  .ww-stat-card {
    position: relative;
    min-height: 132px;
    border-radius: 14px;
    padding: 17px;
  }

  .ww-stat-icon {
    position: absolute;
    top: 15px;
    right: 15px;
    display: grid;
    width: 34px;
    height: 34px;
    place-items: center;
    border-radius: 9px;
    background: #f2f4f7;
    color: #475467;
  }

  .ww-stat-label,
  .ww-stat-helper {
    display: block;
    color: #667085;
  }

  .ww-stat-label {
    padding-right: 40px;
    font-size: 13px;
    font-weight: 650;
  }

  .ww-stat-value {
    display: block;
    margin-top: 13px;
    color: #101828;
    font-size: 23px;
    line-height: 1.1;
    font-weight: 760;
    letter-spacing: -0.025em;
  }

  .ww-stat-helper {
    margin-top: 8px;
    font-size: 12px;
  }

  .ww-content-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.62fr) minmax(300px, 0.72fr);
    gap: 14px;
    align-items: start;
  }

  .ww-activity-card {
    grid-column: 1;
    grid-row: 1 / span 3;
  }

  .ww-readiness-card {
    grid-column: 2;
    grid-row: 1;
  }

  .ww-earnings-card {
    grid-column: 2;
    grid-row: 2;
  }

  .ww-rules-desktop {
    grid-column: 2;
    grid-row: 3;
  }

  .ww-rules-mobile {
    display: none;
  }

  .ww-card {
    border-radius: 14px;
    padding: 18px;
  }

  .ww-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 15px;
  }

  .ww-card-head.compact {
    margin-bottom: 13px;
  }

  .ww-card h2 {
    margin-top: 3px;
    font-size: 18px;
    line-height: 1.25;
    font-weight: 730;
  }

  .ww-card-head p {
    margin: 5px 0 0;
    color: #667085;
    font-size: 13px;
    line-height: 1.5;
  }

  .ww-icon-button {
    display: grid;
    flex: 0 0 auto;
    width: 38px;
    height: 38px;
    place-items: center;
    border: 1px solid #e4e7ec;
    border-radius: 10px;
    background: #ffffff;
    color: #475467;
  }

  .ww-icon-button:hover:not(:disabled) {
    background: #f8fafc;
  }

  .ww-activity-list {
    border-top: 1px solid #eaecf0;
  }

  .ww-activity-row {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
    min-height: 76px;
    padding: 12px 0;
    border-bottom: 1px solid #eaecf0;
  }

  .ww-activity-row:last-child {
    border-bottom: 0;
    padding-bottom: 2px;
  }

  .ww-activity-direction {
    display: grid;
    width: 34px;
    height: 34px;
    place-items: center;
    border-radius: 10px;
  }

  .ww-activity-direction.is-credit {
    background: #ecfdf3;
    color: #027a48;
  }

  .ww-activity-direction.is-debit {
    background: #fff4ed;
    color: #b54708;
  }

  .ww-activity-copy {
    min-width: 0;
  }

  .ww-activity-title-line {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .ww-activity-title-line strong {
    color: #344054;
    font-size: 13px;
    font-weight: 700;
  }

  .ww-activity-copy p {
    overflow: hidden;
    margin: 3px 0 0;
    color: #667085;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ww-activity-copy > span {
    display: block;
    margin-top: 3px;
    color: #98a2b3;
    font-size: 12px;
  }

  .ww-activity-amount {
    padding-left: 10px;
    font-size: 13px;
    font-weight: 760;
    white-space: nowrap;
  }

  .ww-activity-amount.is-credit {
    color: #027a48;
  }

  .ww-activity-amount.is-debit {
    color: #b54708;
  }

  .ww-status-pill {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    border-radius: 999px;
    padding: 3px 8px;
    font-size: 12px;
    line-height: 1;
    font-weight: 700;
    text-transform: capitalize;
  }

  .ww-status-pill.is-success {
    background: #ecfdf3;
    color: #027a48;
  }

  .ww-status-pill.is-pending {
    background: #fffaeb;
    color: #b54708;
  }

  .ww-status-pill.is-danger {
    background: #fef3f2;
    color: #b42318;
  }

  .ww-readiness-card {
    background: #fbfcff;
  }

  .ww-readiness-dot {
    flex: 0 0 auto;
    width: 10px;
    height: 10px;
    margin-top: 6px;
    border-radius: 999px;
    background: #f79009;
    box-shadow: 0 0 0 4px #fff7ed;
  }

  .ww-readiness-dot.is-ready {
    background: #12b76a;
    box-shadow: 0 0 0 4px #ecfdf3;
  }

  .ww-readiness-amounts {
    display: grid;
    gap: 0;
    margin-top: 4px;
    border-top: 1px solid #eaecf0;
    border-bottom: 1px solid #eaecf0;
  }

  .ww-readiness-amounts > div,
  .ww-appreciation-breakdown > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 42px;
  }

  .ww-readiness-amounts span,
  .ww-appreciation-breakdown span {
    color: #667085;
    font-size: 12px;
  }

  .ww-readiness-amounts strong,
  .ww-appreciation-breakdown strong {
    color: #344054;
    font-size: 13px;
  }

  .ww-progress-track {
    overflow: hidden;
    height: 7px;
    margin-top: 15px;
    border-radius: 999px;
    background: #eaecf0;
  }

  .ww-progress-track span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: #2563eb;
  }

  .ww-readiness-copy {
    margin: 10px 0 13px;
    color: #667085;
    font-size: 12px;
    line-height: 1.55;
  }

  .ww-readiness-card .ww-secondary-button {
    width: 100%;
  }

  .ww-source-list {
    display: grid;
    gap: 0;
    border-top: 1px solid #eaecf0;
    border-bottom: 1px solid #eaecf0;
  }

  .ww-source-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    min-height: 62px;
    padding: 9px 0;
  }

  .ww-source-row + .ww-source-row {
    border-top: 1px solid #eaecf0;
  }

  .ww-source-row span {
    display: block;
    color: #344054;
    font-size: 13px;
    font-weight: 680;
  }

  .ww-source-row small {
    display: block;
    margin-top: 3px;
    color: #667085;
    font-size: 12px;
  }

  .ww-source-row > strong {
    color: #101828;
    font-size: 14px;
    white-space: nowrap;
  }

  .ww-appreciation-breakdown {
    margin-top: 9px;
  }

  .ww-rules-card .ww-card-head > svg {
    color: #2563eb;
  }

  .ww-rules-list {
    display: grid;
    gap: 13px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .ww-rules-list li {
    display: grid;
    grid-template-columns: 26px minmax(0, 1fr);
    gap: 10px;
  }

  .ww-rules-list li > span {
    display: grid;
    width: 25px;
    height: 25px;
    place-items: center;
    border-radius: 999px;
    background: #eff6ff;
    color: #1d4ed8;
    font-size: 12px;
    font-weight: 750;
  }

  .ww-rules-list strong {
    color: #344054;
    font-size: 12px;
  }

  .ww-rules-list p {
    margin: 2px 0 0;
    color: #667085;
    font-size: 12px;
    line-height: 1.5;
  }

  .ww-history-card {
    margin-top: 14px;
  }

  .ww-count-badge {
    display: grid;
    min-width: 34px;
    height: 34px;
    place-items: center;
    border-radius: 999px;
    background: #f2f4f7;
    color: #475467;
    font-size: 12px;
    font-weight: 750;
  }

  .ww-history-list {
    overflow: hidden;
    border: 1px solid #eaecf0;
    border-radius: 11px;
  }

  .ww-history-header,
  .ww-history-row {
    display: grid;
    grid-template-columns: 1.35fr 1fr 0.72fr 0.72fr;
    gap: 14px;
    align-items: center;
    padding: 0 14px;
  }

  .ww-history-header {
    min-height: 38px;
    background: #f8fafc;
    color: #667085;
    font-size: 12px;
    font-weight: 700;
  }

  .ww-history-row {
    min-height: 64px;
    border-top: 1px solid #eaecf0;
  }

  .ww-history-row > div {
    min-width: 0;
  }

  .ww-history-row strong {
    display: block;
    overflow: hidden;
    color: #344054;
    font-size: 12px;
    font-weight: 680;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ww-history-row small {
    display: block;
    overflow: hidden;
    margin-top: 3px;
    color: #667085;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ww-mobile-label {
    display: none;
  }

  .ww-state {
    display: grid;
    min-height: 180px;
    place-items: center;
    align-content: center;
    gap: 8px;
    padding: 24px;
    color: #667085;
    text-align: center;
  }

  .ww-state strong {
    color: #344054;
    font-size: 14px;
  }

  .ww-state p {
    max-width: 360px;
    margin: 0;
    font-size: 12px;
  }

  .ww-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #d0d5dd;
    border-top-color: #2563eb;
    border-radius: 999px;
    animation: ww-spin 0.85s linear infinite;
  }

  @keyframes ww-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .ww-dialog-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1300;
    display: flex;
    justify-content: flex-end;
    background: rgba(15, 23, 42, 0.34);
  }

  .ww-withdrawal-drawer {
    width: min(440px, 100%);
    height: 100%;
    overflow-y: auto;
    background: #ffffff;
    box-shadow: -18px 0 40px rgba(15, 23, 42, 0.16);
  }

  .ww-drawer-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 22px 22px 18px;
    border-bottom: 1px solid #eaecf0;
  }

  .ww-drawer-head h2 {
    margin-top: 4px;
    font-size: 21px;
    line-height: 1.2;
    font-weight: 750;
  }

  .ww-drawer-head p {
    margin: 6px 0 0;
    color: #667085;
    font-size: 13px;
    line-height: 1.55;
  }

  .ww-drawer-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    margin: 18px 22px 0;
    overflow: hidden;
    border: 1px solid #eaecf0;
    border-radius: 11px;
    background: #eaecf0;
  }

  .ww-drawer-summary > div {
    min-width: 0;
    padding: 12px 10px;
    background: #f8fafc;
  }

  .ww-drawer-summary span,
  .ww-drawer-summary strong {
    display: block;
  }

  .ww-drawer-summary span {
    color: #667085;
    font-size: 12px;
  }

  .ww-drawer-summary strong {
    overflow: hidden;
    margin-top: 4px;
    color: #101828;
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ww-drawer-error {
    margin: 14px 22px 0;
    border: 1px solid #fecaca;
    border-radius: 10px;
    padding: 10px 12px;
    background: #fef2f2;
    color: #b42318;
    font-size: 12px;
    font-weight: 650;
  }

  .ww-withdrawal-form {
    display: grid;
    gap: 16px;
    padding: 20px 22px 26px;
  }

  .ww-withdrawal-form label {
    display: grid;
    gap: 7px;
  }

  .ww-withdrawal-form label > span {
    color: #344054;
    font-size: 13px;
    font-weight: 680;
  }

  .ww-withdrawal-form input,
  .ww-withdrawal-form textarea {
    width: 100%;
    border: 1px solid #d0d5dd;
    border-radius: 10px;
    background: #ffffff;
    color: #101828;
    font: inherit;
    font-size: 14px;
    outline: none;
  }

  .ww-withdrawal-form input {
    min-height: 44px;
    padding: 0 12px;
  }

  .ww-withdrawal-form textarea {
    min-height: 112px;
    resize: vertical;
    padding: 11px 12px;
    line-height: 1.55;
  }

  .ww-withdrawal-form input:focus,
  .ww-withdrawal-form textarea:focus {
    border-color: #84adff;
    box-shadow: 0 0 0 3px #eff4ff;
  }

  .ww-withdrawal-form small {
    color: #667085;
    font-size: 12px;
  }

  .ww-reserve-note {
    display: grid;
    grid-template-columns: 20px minmax(0, 1fr);
    gap: 9px;
    border: 1px solid #bfdbfe;
    border-radius: 11px;
    padding: 12px;
    background: #eff6ff;
    color: #1d4ed8;
  }

  .ww-reserve-note p {
    margin: 0;
    color: #475467;
    font-size: 12px;
    line-height: 1.55;
  }

  .ww-drawer-actions {
    display: grid;
    grid-template-columns: 1fr 1.35fr;
    gap: 10px;
    padding-top: 4px;
  }

  @media (max-width: 1080px) {
    .ww-content-grid {
      grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.8fr);
    }

    .ww-stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 800px) {
    .ww-content-grid {
      grid-template-columns: 1fr;
    }

    .ww-readiness-card {
      grid-column: 1;
      grid-row: 1;
    }

    .ww-activity-card {
      grid-column: 1;
      grid-row: 2;
    }

    .ww-earnings-card {
      grid-column: 1;
      grid-row: 3;
    }

    .ww-rules-desktop {
      display: none;
    }

    .ww-rules-mobile {
      display: block;
      margin-top: 14px;
    }

    .ww-history-header {
      display: none;
    }

    .ww-history-row {
      grid-template-columns: 1fr 1fr;
      gap: 12px 20px;
      padding: 14px;
    }

    .ww-mobile-label {
      display: block;
      margin-bottom: 3px;
      color: #98a2b3;
      font-size: 12px;
      font-weight: 650;
    }
  }

  @media (max-width: 767px) {
    .writer-wallet-page {
      width: auto;
      margin-right: -9px;
      margin-left: -9px;
      font-size: 14px;
    }

    .ww-page-head {
      display: block;
      margin-bottom: 15px;
      padding: 0 1px;
    }

    .ww-page-head h1 {
      font-size: 23px;
    }

    .ww-page-head p {
      margin-top: 7px;
      font-size: 13px;
      line-height: 1.55;
    }

    .ww-desktop-request {
      display: none;
    }

    .ww-stats-grid {
      gap: 8px;
      margin-bottom: 8px;
    }

    .ww-stat-card {
      min-height: 120px;
      border-radius: 12px;
      padding: 14px;
    }

    .ww-stat-icon {
      top: 12px;
      right: 12px;
      width: 31px;
      height: 31px;
    }

    .ww-stat-label {
      font-size: 12px;
    }

    .ww-stat-value {
      margin-top: 14px;
      font-size: 20px;
    }

    .ww-stat-helper {
      font-size: 12px;
    }

    .ww-content-grid {
      gap: 8px;
    }

    .ww-rules-mobile {
      margin-top: 8px;
    }

    .ww-card {
      border-radius: 12px;
      padding: 14px;
    }

    .ww-card h2 {
      font-size: 17px;
    }

    .ww-card-head p {
      font-size: 12px;
    }

    .ww-activity-row {
      grid-template-columns: 34px minmax(0, 1fr);
      gap: 10px;
      align-items: start;
      padding: 13px 0;
    }

    .ww-activity-amount {
      grid-column: 2;
      padding: 0;
    }

    .ww-activity-copy p {
      white-space: normal;
    }

    .ww-history-card {
      margin-top: 8px;
    }

    .ww-history-row {
      grid-template-columns: 1fr 1fr;
      gap: 13px;
      padding: 13px;
    }

    .ww-history-row strong,
    .ww-history-row small {
      white-space: normal;
    }

    .ww-dialog-backdrop {
      align-items: flex-end;
    }

    .ww-withdrawal-drawer {
      width: 100%;
      height: auto;
      max-height: 92vh;
      border-radius: 20px 20px 0 0;
      box-shadow: 0 -18px 40px rgba(15, 23, 42, 0.16);
    }

    .ww-drawer-head {
      padding: 18px 16px 14px;
    }

    .ww-drawer-head h2 {
      font-size: 20px;
    }

    .ww-drawer-summary {
      margin: 14px 16px 0;
    }

    .ww-drawer-error {
      margin: 12px 16px 0;
    }

    .ww-withdrawal-form {
      gap: 14px;
      padding: 16px 16px calc(20px + env(safe-area-inset-bottom));
    }
  }

  @media (max-width: 420px) {
    .ww-stat-value {
      font-size: 19px;
    }

    .ww-history-row {
      grid-template-columns: 1fr;
    }

    .ww-drawer-summary {
      grid-template-columns: 1fr 1fr 0.85fr;
    }

    .ww-drawer-actions {
      grid-template-columns: 1fr;
    }

    .ww-drawer-actions .ww-primary-button {
      order: -1;
    }
  }
  /* BLOGGAD WRITER WALLET FIGMA APPROVED V1 END */
`;export{oe as default};
