import{a as z,b as A,r as d,j as e}from"./index-D7wY-Nn2.js";async function S(i={}){return(await z.get("/api/affiliate/leaderboard",{params:i,headers:{Authorization:`Bearer ${localStorage.getItem("bloggad_token")||""}`}})).data}async function T(i={}){return(await z.get("/api/affiliate/leaderboard/me",{params:i,headers:{Authorization:`Bearer ${localStorage.getItem("bloggad_token")||""}`}})).data}function o(i){return Number(i||0).toLocaleString()}function a(i){const n=Number(i||0);if(n<1e3)return o(n);const t=[{value:1e12,suffix:"t"},{value:1e9,suffix:"b"},{value:1e6,suffix:"m"},{value:1e3,suffix:"k"}].find(b=>n>=b.value);if(!t)return o(n);const p=Math.floor(n/t.value*10)/10;return`${p.toLocaleString(void 0,{minimumFractionDigits:p%1===0?0:1,maximumFractionDigits:1})}${t.suffix}`}function c(i){return`$${Number(i||0).toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}`}function _(i){return i===1?"ali-lb-rank ali-lb-rank-gold":i===2?"ali-lb-rank ali-lb-rank-silver":i===3?"ali-lb-rank ali-lb-rank-bronze":"ali-lb-rank"}function k(i){return i===1?"gold":i===2?"silver":i===3?"bronze":"standard"}function j(i){return(i==null?void 0:i.full_name)||(i==null?void 0:i.name)||`Writer ${(i==null?void 0:i.affiliate_id)||""}`.trim()}function v({label:i,value:n,helper:h}){return e.jsxs("article",{className:"writer-lb-metric",children:[e.jsx("span",{children:i}),e.jsx("strong",{children:n}),e.jsx("small",{children:h})]})}function B(){const i=A(),[n,h]=d.useState([]),[t,p]=d.useState(null),[b,C]=d.useState(0),[x,L]=d.useState(""),[g,y]=d.useState(!0),[f,N]=d.useState("");async function M(){var l,w;try{y(!0),N("");const[s,u]=await Promise.all([S({limit:50}),T()]);h(s.leaderboard||[]),L(s.month||""),p(u.rank||null),C(u.points_away_from_top_50||0)}catch(s){N(((w=(l=s==null?void 0:s.response)==null?void 0:l.data)==null?void 0:w.message)||"Failed to load leaderboard. Please try again.")}finally{y(!1)}}d.useEffect(()=>{M()},[]);const m=d.useMemo(()=>n.slice(0,3),[n]);if(i.pathname==="/writer/leaderboard"){const l=t!=null&&t.current_rank?`#${t.current_rank}`:"#--",w=t?a(t.leaderboard_score):"--",s=t?c(t.possible_monthly_earnings):"$--",u=(t==null?void 0:t.badge)||"Keep Climbing";return e.jsxs("div",{className:"writer-lb-page",children:[e.jsx("style",{children:R}),e.jsx("div",{className:"writer-lb-mobile-title",children:"Leaderboard"}),e.jsxs("section",{className:"writer-lb-month-bar",children:[e.jsxs("div",{children:[e.jsx("strong",{className:"writer-lb-desktop-month",children:"Bloggad Monthly Leaderboard"}),e.jsx("strong",{className:"writer-lb-mobile-month",children:"Monthly Leaderboard"}),e.jsxs("span",{children:[x||"Current month"," - rankings update automatically each day"]})]}),e.jsxs("span",{className:"writer-lb-auto-pill",children:[e.jsx("span",{className:"writer-lb-desktop-auto",children:"Daily Auto Ranking"}),e.jsx("span",{className:"writer-lb-mobile-auto",children:"Daily Auto"})]})]}),f?e.jsx("div",{className:"writer-lb-error",children:f}):null,e.jsxs("section",{className:"writer-lb-metrics",children:[e.jsx(v,{label:"Your Rank This Month",value:l,helper:"Monthly position"}),e.jsx(v,{label:"Your Score",value:w,helper:"Leaderboard score"}),e.jsx(v,{label:"Possible Monthly Earnings",value:s,helper:"Current estimate"}),e.jsx(v,{label:"Badge",value:u,helper:"Current badge"})]}),t&&Number(t.current_rank||0)>50?e.jsxs("div",{className:"writer-lb-progress",children:["You are ",a(b)," points away from entering the Top 50."]}):null,!g&&m.length>0?e.jsx("section",{className:"writer-lb-podium",children:m.map(r=>e.jsxs("article",{className:`writer-lb-podium-card ${k(Number(r.current_rank))}`,children:[e.jsxs("span",{className:"writer-lb-podium-rank",children:["#",r.current_rank]}),e.jsxs("div",{children:[e.jsx("strong",{children:j(r)}),e.jsx("span",{children:r.badge}),e.jsxs("b",{title:o(r.leaderboard_score),children:[a(r.leaderboard_score)," pts"]})]})]},r.id))}):null,e.jsxs("section",{className:"writer-lb-list-card",children:[e.jsxs("header",{className:"writer-lb-list-heading",children:[e.jsxs("div",{children:[e.jsx("strong",{children:"Leaderboard"}),e.jsx("span",{children:x||"Current Month"})]}),e.jsx("span",{className:"writer-lb-top-pill",children:"Top 50"})]}),g?e.jsx("div",{className:"writer-lb-state",children:"Loading leaderboard..."}):n.length===0?e.jsx("div",{className:"writer-lb-state",children:"No leaderboard data yet. The system will generate rankings automatically."}):e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"writer-lb-desktop-table-wrap",children:e.jsxs("table",{className:"writer-lb-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Rank"}),e.jsx("th",{children:"Writer"}),e.jsx("th",{children:"Traffic"}),e.jsx("th",{children:"CTA Clicks"}),e.jsx("th",{children:"Product Clicks"}),e.jsx("th",{children:"Possible Earnings"}),e.jsx("th",{children:"Score"}),e.jsx("th",{children:"Badge"})]})}),e.jsx("tbody",{children:n.map(r=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsxs("span",{className:`writer-lb-rank-chip ${k(Number(r.current_rank))}`,children:["#",r.current_rank]})}),e.jsx("td",{children:e.jsxs("div",{className:"writer-lb-user",children:[e.jsx("div",{className:"writer-lb-avatar",children:j(r).charAt(0).toUpperCase()}),e.jsxs("div",{children:[e.jsx("strong",{children:j(r)}),e.jsx("span",{children:r.email||"-"})]})]})}),e.jsx("td",{children:a(r.monthly_traffic)}),e.jsx("td",{children:a(r.cta_clicks)}),e.jsx("td",{children:a(r.product_clicks)}),e.jsx("td",{children:c(r.possible_monthly_earnings)}),e.jsx("td",{children:e.jsx("strong",{title:o(r.leaderboard_score),children:a(r.leaderboard_score)})}),e.jsx("td",{children:e.jsx("span",{className:"writer-lb-badge",children:r.badge})})]},r.id))})]})}),e.jsx("div",{className:"writer-lb-mobile-list",children:n.map(r=>e.jsxs("article",{className:"writer-lb-mobile-card",children:[e.jsxs("div",{className:"writer-lb-mobile-card-head",children:[e.jsxs("div",{className:"writer-lb-mobile-writer",children:[e.jsxs("span",{className:`writer-lb-rank-chip ${k(Number(r.current_rank))}`,children:["#",r.current_rank]}),e.jsxs("div",{children:[e.jsx("strong",{children:j(r)}),e.jsx("small",{children:r.email||"-"})]})]}),e.jsx("span",{className:"writer-lb-badge",children:r.badge})]}),e.jsxs("div",{className:"writer-lb-mobile-details",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Traffic"}),e.jsx("strong",{children:a(r.monthly_traffic)})]}),e.jsxs("div",{children:[e.jsx("span",{children:"CTA Clicks"}),e.jsx("strong",{children:a(r.cta_clicks)})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Product Clicks"}),e.jsx("strong",{children:a(r.product_clicks)})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Possible Earnings"}),e.jsx("strong",{children:c(r.possible_monthly_earnings)})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Score"}),e.jsx("strong",{title:o(r.leaderboard_score),children:a(r.leaderboard_score)})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Month"}),e.jsx("strong",{children:x||"Current"})]})]})]},r.id))})]})]})]})}return e.jsxs("div",{className:"ali-lb-page",children:[e.jsxs("div",{className:"ali-lb-hero",children:[e.jsxs("div",{children:[e.jsx("p",{className:"ali-lb-kicker",children:"Bloggad Monthly Leaderboard"}),e.jsx("h1",{children:"Top 50 Affiliates This Month"}),e.jsx("p",{className:"ali-lb-subtitle",children:"Rankings update daily from real traffic, clicks, posts, and BlogPulse monetization earnings."})]}),e.jsx("div",{className:"ali-lb-auto-pill",children:"Daily Auto Ranking"})]}),f?e.jsx("div",{className:"ali-lb-error",children:f}):null,t?e.jsxs("div",{className:"ali-lb-my-rank",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Your Rank This Month"}),e.jsxs("strong",{children:["#",t.current_rank||"-"]})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Your Score"}),e.jsx("strong",{title:o(t.leaderboard_score),children:a(t.leaderboard_score)})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Possible Monthly Earnings"}),e.jsx("strong",{children:c(t.possible_monthly_earnings)})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Badge"}),e.jsx("strong",{children:t.badge||"Keep Climbing"})]})]}):null,t&&Number(t.current_rank||0)>50?e.jsxs("div",{className:"ali-lb-encourage",children:["You are ",a(b)," points away from entering the Top 50."]}):null,!g&&m.length>0?e.jsx("div",{className:"ali-lb-podium",children:m.map(l=>e.jsxs("div",{className:"ali-lb-podium-card",children:[e.jsxs("div",{className:_(Number(l.current_rank)),children:["#",l.current_rank]}),e.jsx("h3",{children:l.full_name||l.name||`Affiliate ${l.affiliate_id}`}),e.jsx("p",{children:l.badge}),e.jsxs("strong",{title:o(l.leaderboard_score),children:[a(l.leaderboard_score)," pts"]})]},l.id))}):null,e.jsxs("div",{className:"ali-lb-table-card",children:[e.jsx("div",{className:"ali-lb-table-head",children:e.jsxs("div",{children:[e.jsx("h2",{children:"Leaderboard"}),e.jsx("p",{children:x||"Current Month"})]})}),g?e.jsx("div",{className:"ali-lb-empty",children:"Loading leaderboard..."}):n.length===0?e.jsx("div",{className:"ali-lb-empty",children:"No leaderboard data yet. The system will generate rankings automatically."}):e.jsx("div",{className:"ali-lb-table-wrap",children:e.jsxs("table",{className:"ali-lb-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Rank"}),e.jsx("th",{children:"Affiliate"}),e.jsx("th",{children:"Traffic"}),e.jsx("th",{children:"CTA Clicks"}),e.jsx("th",{children:"Product Clicks"}),e.jsx("th",{children:"Possible Earnings"}),e.jsx("th",{children:"Score"}),e.jsx("th",{children:"Badge"})]})}),e.jsx("tbody",{children:n.map(l=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsxs("span",{className:_(Number(l.current_rank)),children:["#",l.current_rank]})}),e.jsx("td",{children:e.jsxs("div",{className:"ali-lb-user",children:[e.jsx("div",{className:"ali-lb-avatar",children:(l.full_name||l.name||"A").charAt(0).toUpperCase()}),e.jsxs("div",{children:[e.jsx("strong",{children:l.full_name||l.name||`Affiliate ${l.affiliate_id}`}),e.jsx("span",{children:l.email})]})]})}),e.jsx("td",{children:a(l.monthly_traffic)}),e.jsx("td",{children:a(l.cta_clicks)}),e.jsx("td",{children:a(l.product_clicks)}),e.jsx("td",{children:c(l.possible_monthly_earnings)}),e.jsx("td",{children:e.jsx("strong",{title:o(l.leaderboard_score),children:a(l.leaderboard_score)})}),e.jsx("td",{children:e.jsx("span",{className:"ali-lb-badge",children:l.badge})})]},l.id))})]})})]})]})}const R=`
  * {
    box-sizing: border-box;
  }

  .writer-lb-page {
    width: 100%;
    min-width: 0;
    color: #161a20;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .writer-lb-mobile-title,
  .writer-lb-mobile-month,
  .writer-lb-mobile-auto,
  .writer-lb-mobile-list {
    display: none;
  }

  .writer-lb-month-bar,
  .writer-lb-metric,
  .writer-lb-podium-card,
  .writer-lb-list-card,
  .writer-lb-mobile-card {
    background: #ffffff;
    border: 1px solid #e3e6ea;
    box-shadow: none;
  }

  .writer-lb-month-bar {
    min-height: 64px;
    margin-bottom: 12px;
    padding: 12px 14px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .writer-lb-month-bar > div {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .writer-lb-month-bar strong {
    color: #161a20;
    font-size: 12px;
    line-height: 1.3;
    font-weight: 600;
  }

  .writer-lb-month-bar > div > span {
    color: #68707c;
    font-size: 10px;
    line-height: 1.4;
  }

  .writer-lb-auto-pill {
    min-height: 28px;
    padding: 0 14px;
    border: 1px solid #abefc6;
    border-radius: 999px;
    background: #ecfdf3;
    color: #027a48;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    line-height: 1;
    font-weight: 600;
    white-space: nowrap;
  }

  .writer-lb-error {
    margin-bottom: 12px;
    padding: 11px 13px;
    border: 1px solid #fecdca;
    border-radius: 10px;
    background: #fef3f2;
    color: #b42318;
    font-size: 12px;
    line-height: 1.45;
    font-weight: 600;
  }

  .writer-lb-metrics {
    margin-bottom: 12px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .writer-lb-metric {
    min-width: 0;
    min-height: 88px;
    padding: 13px 14px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .writer-lb-metric > span {
    color: #68707c;
    font-size: 11px;
    line-height: 1.25;
    font-weight: 600;
  }

  .writer-lb-metric > strong {
    min-width: 0;
    color: #161a20;
    font-size: 22px;
    line-height: 1.08;
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  .writer-lb-metric > small {
    margin-top: auto;
    color: #98a2b3;
    font-size: 10px;
    line-height: 1.3;
  }

  .writer-lb-progress {
    min-height: 46px;
    margin-bottom: 12px;
    padding: 0 14px;
    border: 1px solid #b2ddff;
    border-radius: 10px;
    background: #eff8ff;
    color: #175cd3;
    display: flex;
    align-items: center;
    font-size: 11px;
    line-height: 1.4;
    font-weight: 600;
  }

  .writer-lb-podium {
    margin-bottom: 12px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .writer-lb-podium-card {
    min-width: 0;
    min-height: 126px;
    padding: 14px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .writer-lb-podium-card.gold {
    background: #fff8e7;
  }

  .writer-lb-podium-card.silver {
    background: #f3f4f6;
  }

  .writer-lb-podium-card.bronze {
    background: #fff1e8;
  }

  .writer-lb-podium-rank {
    flex: 0 0 auto;
    width: 48px;
    height: 48px;
    border: 1px solid #e3e6ea;
    border-radius: 12px;
    background: #ffffff;
    color: #161a20;
    display: grid;
    place-items: center;
    font-size: 16px;
    line-height: 1;
    font-weight: 700;
  }

  .writer-lb-podium-card > div {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .writer-lb-podium-card > div > strong {
    color: #161a20;
    font-size: 13px;
    line-height: 1.3;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .writer-lb-podium-card > div > span {
    color: #68707c;
    font-size: 10px;
    line-height: 1.3;
  }

  .writer-lb-podium-card > div > b {
    color: #161a20;
    font-size: 12px;
    line-height: 1.3;
    font-weight: 700;
  }

  .writer-lb-list-card {
    min-width: 0;
    padding: 14px;
    border-radius: 12px;
  }

  .writer-lb-list-heading {
    min-height: 38px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .writer-lb-list-heading > div {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .writer-lb-list-heading > div > strong {
    color: #161a20;
    font-size: 14px;
    line-height: 1.3;
    font-weight: 700;
  }

  .writer-lb-list-heading > div > span {
    color: #68707c;
    font-size: 10px;
    line-height: 1.3;
  }

  .writer-lb-top-pill,
  .writer-lb-badge,
  .writer-lb-rank-chip {
    min-height: 28px;
    padding: 0 11px;
    border: 1px solid #e3e6ea;
    border-radius: 999px;
    background: #f8fafc;
    color: #68707c;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    line-height: 1;
    font-weight: 600;
    white-space: nowrap;
  }

  .writer-lb-rank-chip {
    min-width: 46px;
    color: #161a20;
    background: #ffffff;
  }

  .writer-lb-rank-chip.gold {
    background: #fff8e7;
  }

  .writer-lb-rank-chip.silver {
    background: #f3f4f6;
  }

  .writer-lb-rank-chip.bronze {
    background: #fff1e8;
  }

  .writer-lb-state {
    min-height: 180px;
    padding: 24px;
    border: 1px dashed #cbd5e1;
    border-radius: 10px;
    background: #f8fafc;
    color: #68707c;
    display: grid;
    place-items: center;
    text-align: center;
    font-size: 12px;
    line-height: 1.5;
  }

  .writer-lb-desktop-table-wrap {
    width: 100%;
    overflow-x: auto;
  }

  .writer-lb-table {
    width: 100%;
    min-width: 980px;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .writer-lb-table thead {
    background: #f8fafc;
  }

  .writer-lb-table th {
    height: 38px;
    padding: 0 8px;
    color: #68707c;
    font-size: 10px;
    line-height: 1.2;
    font-weight: 700;
    text-align: left;
  }

  .writer-lb-table th:nth-child(1) {
    width: 70px;
  }

  .writer-lb-table th:nth-child(2) {
    width: 220px;
  }

  .writer-lb-table th:nth-child(3),
  .writer-lb-table th:nth-child(4) {
    width: 104px;
  }

  .writer-lb-table th:nth-child(5) {
    width: 120px;
  }

  .writer-lb-table th:nth-child(6) {
    width: 146px;
  }

  .writer-lb-table th:nth-child(7) {
    width: 92px;
  }

  .writer-lb-table th:nth-child(8) {
    width: 145px;
  }

  .writer-lb-table td {
    height: 62px;
    padding: 0 8px;
    border-bottom: 1px solid #e3e6ea;
    color: #68707c;
    font-size: 10px;
    line-height: 1.35;
    vertical-align: middle;
  }

  .writer-lb-table tbody tr:last-child td {
    border-bottom: 0;
  }

  .writer-lb-table td > strong {
    color: #161a20;
    font-size: 10px;
    font-weight: 600;
  }

  .writer-lb-user {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .writer-lb-avatar {
    flex: 0 0 auto;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #1e2329;
    color: #ffffff;
    display: grid;
    place-items: center;
    font-size: 10px;
    font-weight: 700;
  }

  .writer-lb-user > div:last-child {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .writer-lb-user strong {
    color: #161a20;
    font-size: 11px;
    line-height: 1.25;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .writer-lb-user span {
    color: #98a2b3;
    font-size: 9px;
    line-height: 1.25;
    overflow-wrap: anywhere;
  }

  @media (max-width: 767px) {
    .writer-lb-mobile-title {
      min-height: 46px;
      margin-bottom: 10px;
      padding: 0 10px;
      border: 1px solid #e3e6ea;
      border-radius: 10px;
      background: #ffffff;
      color: #161a20;
      display: flex;
      align-items: center;
      font-size: 13px;
      line-height: 1.2;
      font-weight: 600;
    }

    .writer-lb-month-bar {
      min-height: 74px;
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 10px;
    }

    .writer-lb-desktop-month,
    .writer-lb-desktop-auto,
    .writer-lb-desktop-table-wrap {
      display: none;
    }

    .writer-lb-mobile-month,
    .writer-lb-mobile-auto,
    .writer-lb-mobile-list {
      display: block;
    }

    .writer-lb-month-bar strong {
      font-size: 11px;
    }

    .writer-lb-month-bar > div > span {
      max-width: 180px;
      font-size: 9px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .writer-lb-auto-pill {
      min-height: 28px;
      padding: 0 12px;
      font-size: 10px;
    }

    .writer-lb-error {
      margin-bottom: 10px;
      font-size: 10px;
    }

    .writer-lb-metrics {
      margin-bottom: 10px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .writer-lb-metric {
      min-height: 82px;
      padding: 11px 12px;
      border-radius: 10px;
    }

    .writer-lb-metric > span {
      font-size: 10px;
    }

    .writer-lb-metric > strong {
      font-size: 20px;
    }

    .writer-lb-metric > small {
      font-size: 9px;
    }

    .writer-lb-progress {
      min-height: 48px;
      margin-bottom: 10px;
      padding: 0 10px;
      font-size: 9px;
    }

    .writer-lb-podium {
      margin-bottom: 10px;
      gap: 6px;
    }

    .writer-lb-podium-card {
      min-height: 108px;
      padding: 9px;
      border-radius: 10px;
      display: block;
    }

    .writer-lb-podium-rank {
      width: auto;
      height: auto;
      margin-bottom: 6px;
      border: 0;
      border-radius: 0;
      background: transparent;
      display: block;
      font-size: 13px;
    }

    .writer-lb-podium-card > div {
      gap: 4px;
    }

    .writer-lb-podium-card > div > strong {
      font-size: 10px;
    }

    .writer-lb-podium-card > div > span {
      font-size: 8px;
    }

    .writer-lb-podium-card > div > b {
      font-size: 9px;
    }

    .writer-lb-list-card {
      padding: 10px;
      border-radius: 10px;
    }

    .writer-lb-list-heading {
      min-height: 34px;
      margin-bottom: 8px;
    }

    .writer-lb-list-heading > div > strong {
      font-size: 12px;
    }

    .writer-lb-list-heading > div > span {
      display: none;
    }

    .writer-lb-top-pill,
    .writer-lb-badge,
    .writer-lb-rank-chip {
      min-height: 28px;
      padding: 0 10px;
      font-size: 10px;
    }

    .writer-lb-state {
      min-height: 140px;
      padding: 18px;
      font-size: 10px;
    }

    .writer-lb-mobile-list {
      display: grid;
      gap: 8px;
    }

    .writer-lb-mobile-card {
      padding: 10px;
      border-radius: 9px;
      background: #f8fafc;
    }

    .writer-lb-mobile-card-head {
      min-width: 0;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .writer-lb-mobile-writer {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .writer-lb-mobile-writer > div {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .writer-lb-mobile-writer strong {
      color: #161a20;
      font-size: 11px;
      line-height: 1.25;
      font-weight: 600;
      overflow-wrap: anywhere;
    }

    .writer-lb-mobile-writer small {
      max-width: 140px;
      color: #98a2b3;
      font-size: 8px;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .writer-lb-mobile-details {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;
    }

    .writer-lb-mobile-details > div {
      min-width: 0;
      min-height: 42px;
      padding: 4px 6px;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .writer-lb-mobile-details span {
      color: #98a2b3;
      font-size: 8px;
      line-height: 1.2;
    }

    .writer-lb-mobile-details strong {
      color: #161a20;
      font-size: 10px;
      line-height: 1.25;
      font-weight: 600;
      overflow-wrap: anywhere;
    }
  }
`;export{B as default};
