import{r as a,j as e,a as f}from"./index-LXBBJt7I.js";import{m as T,f as C}from"./WorkspaceUi-B9xdA3p8.js";function F(s){const h=String(s||"").trim().toLowerCase();return h==="active"?"active":h==="inactive"?"inactive":"neutral"}function W(){var N,v;const[s,h]=a.useState(null),[d,A]=a.useState(null),[p,L]=a.useState([]),[c,x]=a.useState({monthly_price_usd:"",status:"inactive"}),[w,b]=a.useState(""),g=a.useMemo(()=>p.filter(r=>String((r==null?void 0:r.status)||"").toLowerCase()==="active").length,[p]);async function u(){var r,t,o,l,k,z,_,S,E,M;try{b("");const[i,n]=await Promise.all([f.get("/api/writer/access/membership-offer"),f.get("/api/writer/access/members")]);h(((r=i==null?void 0:i.data)==null?void 0:r.eligibility)||null),A(((t=i==null?void 0:i.data)==null?void 0:t.offer)||null),L(((o=n==null?void 0:n.data)==null?void 0:o.members)||((l=n==null?void 0:n.data)==null?void 0:l.memberships)||[]),x({monthly_price_usd:((z=(k=i==null?void 0:i.data)==null?void 0:k.offer)==null?void 0:z.monthly_price_usd)||"",status:((S=(_=i==null?void 0:i.data)==null?void 0:_.offer)==null?void 0:S.status)||"inactive"})}catch(i){b(((M=(E=i==null?void 0:i.response)==null?void 0:E.data)==null?void 0:M.message)||"Failed to load Writer memberships.")}}a.useEffect(()=>{u()},[]);async function O(r){var t,o;r.preventDefault();try{b(""),await f.put("/api/writer/access/membership-offer",{monthly_price_usd:Number(c.monthly_price_usd),status:c.status}),await u()}catch(l){b(((o=(t=l==null?void 0:l.response)==null?void 0:t.data)==null?void 0:o.message)||"Failed to save membership offer.")}}const m=!!(s!=null&&s.eligible),j=m?"Eligible":"Not eligible yet",y=d?`$${T(d.monthly_price_usd)} / month`:"Not set",$=d?`$${T(d.monthly_price_usd)}/mo`:"-";return e.jsxs("div",{className:"writer-memberships-page",children:[e.jsx("style",{children:D}),e.jsx("div",{className:"writer-memberships-mobile-title",children:"Memberships"}),w?e.jsx("div",{className:"writer-memberships-alert",role:"alert",children:w}):null,e.jsxs("section",{className:"writer-memberships-summary",children:[e.jsxs("article",{className:"writer-memberships-stat",children:[e.jsx("span",{className:"writer-memberships-stat-desktop-label",children:"Eligibility"}),e.jsx("span",{className:"writer-memberships-stat-mobile-label",children:"Eligible"}),e.jsx("strong",{className:"writer-memberships-stat-desktop-value",children:j}),e.jsx("strong",{className:"writer-memberships-stat-mobile-value",children:m?"Yes":"No"})]}),e.jsxs("article",{className:"writer-memberships-stat",children:[e.jsx("span",{className:"writer-memberships-stat-desktop-label",children:"Current offer"}),e.jsx("span",{className:"writer-memberships-stat-mobile-label",children:"Offer"}),e.jsx("strong",{className:"writer-memberships-stat-desktop-value",children:y}),e.jsx("strong",{className:"writer-memberships-stat-mobile-value",children:$})]}),e.jsxs("article",{className:"writer-memberships-stat",children:[e.jsx("span",{className:"writer-memberships-stat-desktop-label",children:"Active members"}),e.jsx("span",{className:"writer-memberships-stat-mobile-label",children:"Members"}),e.jsx("strong",{children:g})]})]}),e.jsxs("section",{className:"writer-memberships-workspace",children:[e.jsxs("article",{className:"writer-memberships-offer-card",children:[e.jsxs("header",{className:"writer-memberships-card-head",children:[e.jsx("strong",{children:"Membership offer"}),e.jsx("span",{className:`writer-memberships-pill ${m?"eligible":"neutral"}`,children:j})]}),e.jsx("p",{className:"writer-memberships-helper",children:m?"Set the monthly direct membership offer.":(s==null?void 0:s.reason)||"Direct Paid Membership is not available yet."}),!m&&((N=s==null?void 0:s.policy)==null?void 0:N.minimum_followers)!==null?e.jsxs("div",{className:"writer-memberships-current-offer",children:[e.jsx("span",{children:"FOLLOWER REQUIREMENT"}),e.jsxs("strong",{children:[Number((s==null?void 0:s.follower_count)||0).toLocaleString()," / ",Number(((v=s==null?void 0:s.policy)==null?void 0:v.minimum_followers)||0).toLocaleString()," followers"]})]}):null,e.jsxs("form",{className:"writer-memberships-form",onSubmit:O,children:[e.jsxs("label",{className:"writer-memberships-field",children:[e.jsx("span",{children:"MONTHLY PRICE (USD)"}),e.jsxs("div",{className:"writer-memberships-price-control",children:[e.jsx("span",{className:"writer-memberships-currency-prefix",children:"$"}),e.jsx("input",{type:"number",min:"0",step:"0.01",placeholder:"0.00",disabled:!m,value:c.monthly_price_usd,onChange:r=>x(t=>({...t,monthly_price_usd:r.target.value}))})]})]}),e.jsxs("label",{className:"writer-memberships-field",children:[e.jsx("span",{children:"OFFER STATUS"}),e.jsxs("select",{value:c.status,disabled:!m,onChange:r=>x(t=>({...t,status:r.target.value})),children:[e.jsx("option",{value:"inactive",children:"Inactive"}),e.jsx("option",{value:"active",children:"Active"})]})]}),e.jsxs("div",{className:"writer-memberships-current-offer",children:[e.jsx("span",{className:"writer-memberships-current-desktop",children:"CURRENT OFFER"}),e.jsx("span",{className:"writer-memberships-current-mobile",children:"Current"}),e.jsx("strong",{children:y})]}),e.jsx("button",{type:"submit",className:"writer-memberships-save",disabled:!m,children:"Save offer"})]})]}),e.jsxs("article",{className:"writer-memberships-members-card",children:[e.jsxs("header",{className:"writer-memberships-card-head",children:[e.jsx("strong",{children:"Members"}),e.jsxs("span",{className:"writer-memberships-pill neutral",children:[g," active"]})]}),e.jsxs("div",{className:"writer-memberships-desktop-list",children:[e.jsxs("div",{className:"writer-memberships-table-head",children:[e.jsx("span",{children:"READER"}),e.jsx("span",{children:"STATUS"}),e.jsx("span",{children:"STARTED"})]}),p.length?p.map(r=>e.jsxs("div",{className:"writer-memberships-member-row",children:[e.jsxs("strong",{children:["Reader #",r.reader_user_id]}),e.jsx("span",{className:`writer-memberships-pill ${F(r.status)}`,children:r.status||"-"}),e.jsx("span",{className:"writer-memberships-member-date",children:C(r.starts_at)})]},r.id)):e.jsx("div",{className:"writer-memberships-empty",children:"No active Writer members yet."})]}),e.jsx("div",{className:"writer-memberships-mobile-list",children:p.length?p.map(r=>e.jsxs("div",{className:"writer-memberships-member-card",children:[e.jsxs("div",{className:"writer-memberships-member-card-head",children:[e.jsxs("strong",{children:["Reader #",r.reader_user_id]}),e.jsx("span",{className:`writer-memberships-pill ${F(r.status)}`,children:r.status||"-"})]}),e.jsxs("span",{children:["Started ",C(r.starts_at)]})]},r.id)):e.jsx("div",{className:"writer-memberships-empty",children:"No active Writer members yet."})})]})]})]})}const D=`
  * {
    box-sizing: border-box;
  }

  .writer-memberships-page {
    width: 100%;
    color: #111827;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .writer-memberships-page input,
  .writer-memberships-page select,
  .writer-memberships-page button {
    font: inherit;
  }

  .writer-memberships-mobile-title,
  .writer-memberships-stat-mobile-label,
  .writer-memberships-stat-mobile-value,
  .writer-memberships-current-mobile,
  .writer-memberships-mobile-list {
    display: none;
  }

  .writer-memberships-alert {
    margin-bottom: 12px;
    padding: 11px 13px;
    border: 1px solid #fecaca;
    border-radius: 11px;
    background: #fef2f2;
    color: #b42318;
    font-size: 11px;
    line-height: 1.45;
    font-weight: 600;
  }

  .writer-memberships-summary {
    margin-bottom: 12px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .writer-memberships-stat {
    min-width: 0;
    height: 82px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
  }

  .writer-memberships-stat > span {
    color: #6b7280;
    font-size: 10px;
    line-height: 1.3;
    font-weight: 500;
  }

  .writer-memberships-stat > strong {
    min-width: 0;
    color: #111827;
    font-size: 23px;
    line-height: 1.15;
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  .writer-memberships-workspace {
    display: grid;
    grid-template-columns: minmax(320px, 430px) minmax(0, 1fr);
    gap: 14px;
    align-items: start;
  }

  .writer-memberships-offer-card,
  .writer-memberships-members-card {
    min-width: 0;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
  }

  .writer-memberships-card-head {
    min-height: 30px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .writer-memberships-card-head > strong {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    line-height: 1.3;
    font-weight: 600;
  }

  .writer-memberships-pill {
    min-height: 24px;
    padding: 0 9px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    background: #f8fafc;
    color: #6b7280;
    font-size: 9px;
    line-height: 1;
    font-weight: 600;
    text-transform: capitalize;
    white-space: nowrap;
  }

  .writer-memberships-pill.eligible,
  .writer-memberships-pill.active {
    border-color: #abefc6;
    background: #ecfdf3;
    color: #027a48;
  }

  .writer-memberships-pill.inactive,
  .writer-memberships-pill.neutral {
    border-color: #e5e7eb;
    background: #f8fafc;
    color: #6b7280;
  }

  .writer-memberships-helper {
    margin: 8px 0 12px;
    color: #6b7280;
    font-size: 10px;
    line-height: 1.4;
  }

  .writer-memberships-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .writer-memberships-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .writer-memberships-field > span {
    color: #6b7280;
    font-size: 9px;
    line-height: 1.2;
    font-weight: 600;
  }

  .writer-memberships-price-control {
    height: 42px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    gap: 2px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    background: #ffffff;
  }

  .writer-memberships-currency-prefix {
    flex: 0 0 auto;
    color: #111827;
    font-size: 11px;
    line-height: 1;
    font-weight: 500;
  }

  .writer-memberships-price-control input,
  .writer-memberships-field select {
    width: 100%;
    height: 42px;
    min-width: 0;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    outline: 0;
    background: #ffffff;
    color: #111827;
    font-size: 11px;
    font-weight: 500;
  }

  .writer-memberships-price-control input {
    height: 40px;
    padding: 0;
    border: 0;
    border-radius: 0;
  }

  .writer-memberships-field select {
    padding: 0 12px;
  }

  .writer-memberships-price-control:focus-within,
  .writer-memberships-field select:focus {
    border-color: #111827;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.06);
  }

  .writer-memberships-current-offer {
    min-height: 60px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #f8fafc;
  }

  .writer-memberships-current-offer > span {
    color: #6b7280;
    font-size: 8px;
    line-height: 1.2;
    font-weight: 600;
  }

  .writer-memberships-current-offer > strong {
    color: #111827;
    font-size: 15px;
    line-height: 1.25;
    font-weight: 600;
  }

  .writer-memberships-save {
    width: 104px;
    height: 38px;
    border: 1px solid #1b1f25;
    border-radius: 10px;
    background: #1b1f25;
    color: #ffffff;
    font-size: 11px;
    line-height: 1;
    font-weight: 600;
    cursor: pointer;
  }

  .writer-memberships-members-card {
    display: flex;
    flex-direction: column;
  }

  .writer-memberships-desktop-list {
    margin-top: 0;
  }

  .writer-memberships-table-head {
    height: 34px;
    padding: 0 12px;
    display: grid;
    grid-template-columns: 180px 90px minmax(0, 1fr);
    align-items: center;
    background: #f8fafc;
  }

  .writer-memberships-table-head span {
    color: #6b7280;
    font-size: 9px;
    line-height: 1.2;
    font-weight: 600;
  }

  .writer-memberships-table-head span:last-child {
    text-align: right;
  }

  .writer-memberships-member-row {
    min-height: 58px;
    padding: 0 12px;
    display: grid;
    grid-template-columns: 180px 90px minmax(0, 1fr);
    align-items: center;
    gap: 8px;
    border-top: 1px solid #f1f2f4;
  }

  .writer-memberships-member-row > strong {
    color: #111827;
    font-size: 11px;
    line-height: 1.35;
    font-weight: 600;
  }

  .writer-memberships-member-row .writer-memberships-pill {
    justify-self: start;
  }

  .writer-memberships-member-date {
    color: #6b7280;
    font-size: 10px;
    line-height: 1.35;
    text-align: right;
  }

  .writer-memberships-empty {
    padding: 30px 12px;
    color: #6b7280;
    font-size: 10px;
    line-height: 1.4;
    text-align: center;
  }

  @media (max-width: 900px) {
    .writer-memberships-workspace {
      grid-template-columns: minmax(280px, 40%) minmax(0, 1fr);
    }

    .writer-memberships-table-head,
    .writer-memberships-member-row {
      grid-template-columns: 145px 78px minmax(0, 1fr);
    }
  }

  @media (max-width: 767px) {
    .writer-memberships-mobile-title {
      min-height: 50px;
      margin-bottom: 10px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: #ffffff;
      color: #111827;
      font-size: 14px;
      line-height: 1.2;
      font-weight: 600;
    }

    .writer-memberships-alert {
      margin-bottom: 10px;
    }

    .writer-memberships-summary {
      margin-bottom: 10px;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }

    .writer-memberships-stat {
      height: 72px;
      padding: 10px;
      gap: 4px;
      border-radius: 14px;
    }

    .writer-memberships-stat-desktop-label,
    .writer-memberships-stat-desktop-value {
      display: none;
    }

    .writer-memberships-stat-mobile-label,
    .writer-memberships-stat-mobile-value {
      display: block;
    }

    .writer-memberships-stat > span {
      font-size: 8px;
    }

    .writer-memberships-stat > strong {
      font-size: 18px;
      line-height: 1.15;
    }

    .writer-memberships-workspace {
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: stretch;
    }

    .writer-memberships-offer-card,
    .writer-memberships-members-card {
      width: 100%;
      padding: 14px;
      border-radius: 14px;
    }

    .writer-memberships-card-head > strong {
      font-size: 13px;
    }

    .writer-memberships-helper {
      display: none;
    }

    .writer-memberships-form {
      gap: 10px;
    }

    .writer-memberships-field > span {
      font-size: 9px;
    }

    .writer-memberships-price-control,
    .writer-memberships-field select {
      height: 42px;
      font-size: 11px;
    }

    .writer-memberships-current-desktop {
      display: none;
    }

    .writer-memberships-current-mobile {
      display: block;
    }

    .writer-memberships-current-offer {
      min-height: 54px;
      padding: 10px;
      gap: 3px;
    }

    .writer-memberships-current-offer > strong {
      font-size: 13px;
    }

    .writer-memberships-save {
      width: 100%;
      height: 38px;
    }

    .writer-memberships-desktop-list {
      display: none;
    }

    .writer-memberships-mobile-list {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .writer-memberships-member-card {
      width: 100%;
      padding: 11px;
      display: flex;
      flex-direction: column;
      gap: 7px;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      background: #ffffff;
    }

    .writer-memberships-member-card-head {
      min-height: 24px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .writer-memberships-member-card-head > strong {
      flex: 1;
      min-width: 0;
      color: #111827;
      font-size: 11px;
      line-height: 1.3;
      font-weight: 600;
    }

    .writer-memberships-member-card > span {
      color: #6b7280;
      font-size: 9px;
      line-height: 1.35;
    }

    .writer-memberships-pill {
      min-height: 24px;
      padding: 0 9px;
      font-size: 9px;
    }
  }
`;export{W as default};
