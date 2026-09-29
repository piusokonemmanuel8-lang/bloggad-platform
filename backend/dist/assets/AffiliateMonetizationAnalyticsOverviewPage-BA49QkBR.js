import{b as c,r as m,j as e}from"./index-D7wY-Nn2.js";function a(){return{background:"#ffffff",border:"1px solid #e5e7eb",borderRadius:20,padding:20,boxShadow:"0 12px 30px rgba(15, 23, 42, 0.05)"}}function p(o="default"){const n={success:{background:"#ecfdf3",color:"#027a48",border:"#abefc6"},warning:{background:"#fffaeb",color:"#b54708",border:"#fedf89"},danger:{background:"#fef3f2",color:"#b42318",border:"#fecdca"},info:{background:"#eff8ff",color:"#175cd3",border:"#b2ddff"},default:{background:"#f9fafb",color:"#344054",border:"#eaecf0"}},t=n[o]||n.default;return{display:"inline-flex",alignItems:"center",justifyContent:"center",minHeight:30,padding:"0 12px",borderRadius:999,fontSize:12,fontWeight:800,border:`1px solid ${t.border}`,background:t.background,color:t.color,whiteSpace:"nowrap"}}function d({label:o,value:n,helper:t}){return e.jsxs("div",{style:a(),children:[e.jsx("div",{style:{fontSize:12,color:"#6b7280",marginBottom:8},children:o}),e.jsx("div",{style:{fontSize:28,fontWeight:900,color:"#111827",lineHeight:1.1},children:n}),t?e.jsx("div",{style:{marginTop:8,fontSize:13,color:"#6b7280",lineHeight:1.5},children:t}):null]})}function s({label:o,helper:n}){return e.jsxs("article",{className:"writer-monetization-metric-card",children:[e.jsx("span",{children:o}),e.jsx("strong",{children:"-"}),e.jsx("small",{children:n})]})}function g(){const o=c(),[n,t]=m.useState("individual"),l=o.pathname==="/writer/monetization/analytics",i=n==="platform";return l?e.jsxs("div",{className:"writer-monetization-analytics-page",children:[e.jsx("style",{children:h}),e.jsx("div",{className:"writer-monetization-mobile-title",children:"Monetization Analytics"}),e.jsxs("section",{className:"writer-monetization-mode-card",children:[e.jsx("div",{className:"writer-monetization-mode-label",children:"Analytics mode"}),e.jsxs("div",{className:"writer-monetization-mode-row",children:[e.jsxs("div",{className:"writer-monetization-mode-buttons",children:[e.jsx("button",{type:"button",className:`writer-monetization-mode-button ${i?"":"active"}`,onClick:()=>t("individual"),children:"Individual"}),e.jsx("button",{type:"button",className:`writer-monetization-mode-button ${i?"active":""}`,onClick:()=>t("platform"),children:"Platform"})]}),e.jsx("span",{className:"writer-monetization-mode-helper",children:i?"BlogPulse performance and earnings":"Own-ad monetization performance"}),e.jsx("span",{className:`writer-monetization-mode-status ${i?"platform":"individual"}`,children:i?"Platform monetization":"Individual monetization"})]})]}),e.jsxs("section",{className:"writer-monetization-metrics",children:[e.jsx(s,{label:"Total Views",helper:"Tracked views"}),e.jsx(s,{label:"Unique Visitors",helper:"Audience summary"}),e.jsx(s,{label:"Valid Views",helper:"Qualified views"}),e.jsx(s,{label:i?"Estimated Earnings":"Monetization Type",helper:i?"Platform earnings summary":"Provider handles payments"})]}),e.jsxs("section",{className:"writer-monetization-content-grid",children:[e.jsxs("article",{className:"writer-monetization-trend-card",children:[e.jsxs("header",{children:[e.jsx("strong",{children:"Performance Trend"}),e.jsx("span",{children:i?"Platform activity will appear when analytics data is available.":"Activity will appear when analytics data is available."})]}),e.jsxs("div",{className:"writer-monetization-chart-placeholder",children:[e.jsx("span",{children:"Your chart will appear here"}),e.jsxs("div",{className:"writer-monetization-chart-line",children:[e.jsx("i",{className:"dot dot-one"}),e.jsx("i",{className:"dot dot-two"}),e.jsx("i",{className:"dot dot-three"}),e.jsx("i",{className:"dot dot-four"})]})]})]}),e.jsxs("aside",{className:"writer-monetization-side-stack",children:[e.jsxs("article",{className:"writer-monetization-guide-card writer-monetization-see-card",children:[e.jsx("strong",{children:"What You Will See"}),e.jsxs("div",{className:"writer-monetization-guide-list",children:[e.jsx("span",{children:"Views and visitor summary"}),e.jsx("span",{children:"Qualified activity by mode"}),e.jsx("span",{children:"Earnings when available"}),e.jsx("span",{children:"Personal ad performance"})]})]}),e.jsxs("article",{className:"writer-monetization-guide-card",children:[e.jsx("strong",{children:"Mode Guide"}),e.jsxs("div",{className:"writer-monetization-mode-guide-copy",children:[e.jsxs("span",{children:[e.jsx("b",{children:"Individual"}),"Your own ad account performance."]}),e.jsxs("span",{children:[e.jsx("b",{children:"Platform"}),"BlogPulse performance and earnings."]})]})]})]})]}),e.jsxs("section",{className:"writer-monetization-data-notice",children:[e.jsx("strong",{children:"Analytics data is not connected yet"}),e.jsx("span",{children:"The page currently preserves mode switching and placeholders. Live metrics can plug into these cards without changing the layout."})]})]}):e.jsxs("div",{style:{display:"grid",gap:24},children:[e.jsx("section",{style:{...a(),background:"linear-gradient(135deg, rgba(17,24,39,1) 0%, rgba(31,41,55,1) 55%, rgba(55,65,81,1) 100%)",color:"#ffffff"},children:e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"minmax(0, 1.2fr) minmax(280px, 0.8fr)",gap:18,alignItems:"center"},children:[e.jsxs("div",{children:[e.jsx("div",{style:{display:"inline-flex",alignItems:"center",minHeight:32,padding:"0 12px",borderRadius:999,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14},children:"Monetization Analytics"}),e.jsx("h1",{style:{margin:0,fontSize:32,lineHeight:1.15,fontWeight:900},children:"Follow your monetization performance in one place"}),e.jsx("p",{style:{margin:"12px 0 0",maxWidth:760,color:"rgba(255,255,255,0.82)",fontSize:15,lineHeight:1.7},children:"Use this page to monitor your monetization activity. Platform monetization and individual monetization are shown differently so you can easily understand what applies to your account."})]}),e.jsxs("div",{style:{display:"grid",gap:14},children:[e.jsxs("div",{style:{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:18,padding:16},children:[e.jsx("div",{style:{fontSize:12,color:"rgba(255,255,255,0.7)",marginBottom:8},children:"Current Mode"}),e.jsx("div",{style:p(i?"info":"success"),children:i?"Platform Monetization":"Individual Monetization"})]}),e.jsxs("div",{style:{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:18,padding:16},children:[e.jsx("div",{style:{fontSize:12,color:"rgba(255,255,255,0.7)",marginBottom:8},children:"Status"}),e.jsx("div",{style:{fontSize:22,fontWeight:900},children:i?"Platform Summary":"Individual Summary"})]})]})]})}),e.jsx("section",{style:a(),children:e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",gap:16,alignItems:"end"},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:13,fontWeight:800,color:"#374151",marginBottom:8},children:"Analytics Mode"}),e.jsxs("select",{value:n,onChange:r=>t(r.target.value),style:{width:"100%",minHeight:46,borderRadius:14,border:"1px solid #d1d5db",background:"#ffffff",padding:"0 14px",fontSize:14,color:"#111827",outline:"none"},children:[e.jsx("option",{value:"individual",children:"Individual monetization analytics"}),e.jsx("option",{value:"platform",children:"Platform monetization analytics"})]})]}),e.jsx("div",{style:{padding:14,borderRadius:16,background:i?"#eff8ff":"#ecfdf3",border:i?"1px solid #b2ddff":"1px solid #abefc6",color:i?"#175cd3":"#027a48",fontSize:14,fontWeight:700,lineHeight:1.6},children:i?"This area is for your BlogPulse monetization performance and earnings summary.":"This area is for the performance of ads from your own monetization account."})]})}),e.jsxs("section",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",gap:18},children:[e.jsx(d,{label:"Total Views",value:"-",helper:"Your tracked views will appear here."}),e.jsx(d,{label:"Unique Visitors",value:"-",helper:"Your audience summary will appear here."}),e.jsx(d,{label:"Valid Views",value:"-",helper:"Qualified views will appear here."}),e.jsx(d,{label:i?"Estimated Earnings":"Monetization Type",value:"-",helper:i?"Your platform earnings summary will appear here.":"Your own ad provider handles payments for this mode."})]}),e.jsxs("section",{style:{display:"grid",gridTemplateColumns:"minmax(0, 1.15fr) minmax(320px, 0.85fr)",gap:24,alignItems:"start"},children:[e.jsxs("div",{style:a(),children:[e.jsxs("div",{style:{marginBottom:18},children:[e.jsx("h2",{style:{margin:0,fontSize:22,fontWeight:900,color:"#111827"},children:"Performance Trend"}),e.jsx("p",{style:{margin:"8px 0 0",color:"#6b7280",fontSize:14,lineHeight:1.6},children:"Your activity chart will appear here when your analytics data is available."})]}),e.jsx("div",{style:{minHeight:320,borderRadius:18,border:"1px dashed #cbd5e1",background:"#f8fafc",padding:24,display:"grid",placeItems:"center",textAlign:"center"},children:e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:18,fontWeight:900,color:"#111827",marginBottom:10},children:"Your chart will appear here"}),e.jsx("div",{style:{fontSize:14,color:"#6b7280",lineHeight:1.7,maxWidth:520},children:"Once your monetization activity is available, this section will display your trend in a clear line chart."})]})})]}),e.jsxs("div",{style:{display:"grid",gap:24},children:[e.jsxs("div",{style:a(),children:[e.jsx("h3",{style:{margin:0,fontSize:20,fontWeight:900,color:"#111827"},children:"What You Will See Here"}),e.jsx("div",{style:{marginTop:16,display:"grid",gap:12},children:["Your monetization views and visitor summary.","Your qualified activity based on the selected monetization mode.","Your earnings summary for platform monetization when available.","Your personal ad performance summary for individual monetization."].map(r=>e.jsx("div",{style:{padding:14,borderRadius:16,background:"#f9fafb",border:"1px solid #eef2f7",color:"#374151",fontSize:14,lineHeight:1.6,fontWeight:600},children:r},r))})]}),e.jsxs("div",{style:a(),children:[e.jsx("h3",{style:{margin:0,fontSize:20,fontWeight:900,color:"#111827"},children:"Mode Guide"}),e.jsx("div",{style:{marginTop:16,display:"grid",gap:12},children:["Individual monetization lets you review the performance of ads from your own ad account.","Platform monetization shows your BlogPulse performance and earnings summary.","This page changes based on the monetization mode you choose above."].map(r=>e.jsx("div",{style:{padding:14,borderRadius:16,background:"#f9fafb",border:"1px solid #eef2f7",color:"#374151",fontSize:14,lineHeight:1.6,fontWeight:600},children:r},r))})]})]})]})]})}const h=`
  * {
    box-sizing: border-box;
  }

  .writer-monetization-analytics-page {
    width: 100%;
    min-width: 0;
    color: #161a20;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .writer-monetization-analytics-page button {
    font: inherit;
  }

  .writer-monetization-mobile-title {
    display: none;
  }

  .writer-monetization-mode-card,
  .writer-monetization-metric-card,
  .writer-monetization-trend-card,
  .writer-monetization-guide-card,
  .writer-monetization-data-notice {
    background: #ffffff;
    border: 1px solid #e3e6ea;
    box-shadow: none;
  }

  .writer-monetization-mode-card {
    min-height: 68px;
    margin-bottom: 12px;
    padding: 10px 14px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 7px;
  }

  .writer-monetization-mode-label {
    color: #68707c;
    font-size: 10px;
    line-height: 1.2;
    font-weight: 600;
  }

  .writer-monetization-mode-row {
    width: 100%;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .writer-monetization-mode-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .writer-monetization-mode-button {
    min-width: 88px;
    height: 28px;
    padding: 0 12px;
    border: 1px solid #e3e6ea;
    border-radius: 999px;
    background: #f7f8fa;
    color: #68707c;
    font-size: 10px;
    line-height: 1;
    font-weight: 600;
    cursor: pointer;
  }

  .writer-monetization-mode-button.active {
    border-color: #1e2329;
    background: #1e2329;
    color: #ffffff;
  }

  .writer-monetization-mode-helper {
    min-width: 0;
    flex: 1;
    color: #68707c;
    font-size: 9px;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .writer-monetization-mode-status {
    flex: 0 0 auto;
    min-height: 28px;
    padding: 0 11px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    line-height: 1;
    font-weight: 600;
    white-space: nowrap;
  }

  .writer-monetization-mode-status.individual {
    border: 1px solid #abefc6;
    background: #ecfdf3;
    color: #027a48;
  }

  .writer-monetization-mode-status.platform {
    border: 1px solid #b2ddff;
    background: #eff8ff;
    color: #175cd3;
  }

  .writer-monetization-metrics {
    margin-bottom: 12px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .writer-monetization-metric-card {
    min-width: 0;
    height: 92px;
    padding: 14px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 6px;
  }

  .writer-monetization-metric-card > span {
    color: #68707c;
    font-size: 10px;
    line-height: 1.2;
    font-weight: 600;
  }

  .writer-monetization-metric-card > strong {
    color: #161a20;
    font-size: 22px;
    line-height: 1;
    font-weight: 700;
  }

  .writer-monetization-metric-card > small {
    margin-top: auto;
    color: #8a929c;
    font-size: 8px;
    line-height: 1.3;
    font-weight: 400;
  }

  .writer-monetization-content-grid {
    margin-bottom: 12px;
    display: grid;
    grid-template-columns: minmax(0, 2.08fr) minmax(300px, 1fr);
    gap: 12px;
    align-items: stretch;
  }

  .writer-monetization-trend-card {
    min-width: 0;
    min-height: 380px;
    padding: 14px;
    border-radius: 12px;
  }

  .writer-monetization-trend-card > header {
    margin-bottom: 14px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .writer-monetization-trend-card > header > strong,
  .writer-monetization-guide-card > strong,
  .writer-monetization-data-notice > strong {
    color: #161a20;
    font-size: 12px;
    line-height: 1.3;
    font-weight: 700;
  }

  .writer-monetization-trend-card > header > span {
    color: #68707c;
    font-size: 9px;
    line-height: 1.35;
  }

  .writer-monetization-chart-placeholder {
    position: relative;
    width: 100%;
    height: 290px;
    overflow: hidden;
    border: 1px solid #e3e6ea;
    border-radius: 10px;
    background: #f7f8fa;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .writer-monetization-chart-placeholder > span {
    position: relative;
    z-index: 2;
    color: #6d7580;
    font-size: 12px;
    line-height: 1.3;
    font-weight: 600;
  }

  .writer-monetization-chart-line {
    position: absolute;
    left: 7%;
    right: 7%;
    top: 64%;
    height: 1px;
    background: #cbd2da;
  }

  .writer-monetization-chart-line .dot {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #b7bec8;
  }

  .writer-monetization-chart-line .dot-one {
    left: 8%;
    top: -16px;
  }

  .writer-monetization-chart-line .dot-two {
    left: 34%;
    top: -47px;
  }

  .writer-monetization-chart-line .dot-three {
    left: 61%;
    top: -31px;
  }

  .writer-monetization-chart-line .dot-four {
    left: 85%;
    top: -63px;
  }

  .writer-monetization-side-stack {
    min-width: 0;
    display: grid;
    grid-template-rows: 1fr 1.04fr;
    gap: 12px;
  }

  .writer-monetization-guide-card {
    min-width: 0;
    padding: 14px;
    border-radius: 12px;
  }

  .writer-monetization-guide-list {
    margin-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .writer-monetization-guide-list > span {
    min-height: 24px;
    color: #68707c;
    font-size: 9px;
    line-height: 24px;
  }

  .writer-monetization-mode-guide-copy {
    margin-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .writer-monetization-mode-guide-copy > span {
    display: flex;
    flex-direction: column;
    gap: 2px;
    color: #68707c;
    font-size: 9px;
    line-height: 1.4;
  }

  .writer-monetization-mode-guide-copy b {
    color: #68707c;
    font-size: 9px;
    line-height: 1.3;
    font-weight: 600;
  }

  .writer-monetization-data-notice {
    min-height: 72px;
    padding: 13px 14px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
  }

  .writer-monetization-data-notice > span {
    color: #68707c;
    font-size: 9px;
    line-height: 1.4;
  }

  @media (min-width: 768px) {
    .writer-monetization-mode-label {
      font-size: 12px;
    }

    .writer-monetization-mode-button {
      font-size: 11px;
    }

    .writer-monetization-mode-helper {
      font-size: 11px;
    }

    .writer-monetization-mode-status {
      font-size: 10px;
    }

    .writer-monetization-metric-card > span {
      font-size: 12px;
    }

    .writer-monetization-metric-card > small {
      font-size: 10px;
      line-height: 1.4;
    }

    .writer-monetization-trend-card > header > strong,
    .writer-monetization-guide-card > strong {
      font-size: 14px;
    }

    .writer-monetization-trend-card > header > span {
      font-size: 11px;
      line-height: 1.45;
    }

    .writer-monetization-chart-placeholder > span {
      font-size: 13px;
    }

    .writer-monetization-guide-list > span {
      min-height: 26px;
      font-size: 11px;
      line-height: 26px;
    }

    .writer-monetization-mode-guide-copy > span,
    .writer-monetization-mode-guide-copy b {
      font-size: 11px;
      line-height: 1.5;
    }

    .writer-monetization-data-notice > strong {
      font-size: 13px;
    }

    .writer-monetization-data-notice > span {
      font-size: 10px;
      line-height: 1.5;
    }
  }
  @media (max-width: 900px) {
    .writer-monetization-content-grid {
      grid-template-columns: minmax(0, 1.55fr) minmax(250px, 1fr);
    }
  }

  @media (max-width: 767px) {
    .writer-monetization-mobile-title {
      min-height: 46px;
      margin-bottom: 10px;
      padding: 0 12px;
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

    .writer-monetization-mode-card {
      min-height: 82px;
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 10px;
      gap: 10px;
    }

    .writer-monetization-mode-label {
      font-size: 9px;
    }

    .writer-monetization-mode-row {
      gap: 10px;
    }

    .writer-monetization-mode-buttons {
      gap: 8px;
      flex: 0 0 auto;
    }

    .writer-monetization-mode-button {
      min-width: 88px;
      height: 28px;
      padding: 0 10px;
      font-size: 10px;
    }

    .writer-monetization-mode-helper {
      font-size: 8px;
    }

    .writer-monetization-mode-status {
      display: none;
    }

    .writer-monetization-metrics {
      margin-bottom: 10px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .writer-monetization-metric-card {
      height: 92px;
      padding: 14px;
      border-radius: 12px;
    }

    .writer-monetization-content-grid {
      margin-bottom: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .writer-monetization-trend-card {
      min-height: 208px;
      padding: 10px;
      border-radius: 10px;
    }

    .writer-monetization-trend-card > header {
      margin-bottom: 10px;
      gap: 4px;
    }

    .writer-monetization-trend-card > header > strong,
    .writer-monetization-guide-card > strong {
      font-size: 11px;
    }

    .writer-monetization-trend-card > header > span {
      font-size: 8px;
    }

    .writer-monetization-chart-placeholder {
      height: 144px;
      border-radius: 8px;
    }

    .writer-monetization-chart-placeholder > span {
      font-size: 10px;
    }

    .writer-monetization-chart-line {
      display: none;
    }

    .writer-monetization-side-stack {
      display: block;
    }

    .writer-monetization-see-card {
      display: none;
    }

    .writer-monetization-guide-card {
      min-height: 106px;
      padding: 10px;
      border-radius: 10px;
    }

    .writer-monetization-mode-guide-copy {
      margin-top: 10px;
      gap: 5px;
    }

    .writer-monetization-mode-guide-copy > span {
      display: block;
      font-size: 8px;
      line-height: 18px;
    }

    .writer-monetization-mode-guide-copy b {
      display: inline;
      margin-right: 3px;
      font-size: 8px;
    }

    .writer-monetization-data-notice {
      min-height: 80px;
      padding: 12px 10px;
      border-radius: 10px;
      gap: 6px;
    }

    .writer-monetization-data-notice > strong {
      font-size: 10px;
    }

    .writer-monetization-data-notice > span {
      font-size: 8px;
      line-height: 1.4;
    }
  }

  @media (max-width: 390px) {
    .writer-monetization-mode-row {
      gap: 8px;
    }

    .writer-monetization-mode-button {
      min-width: 86px;
    }

    .writer-monetization-mode-helper {
      min-width: 0;
    }
  }
`;export{g as default};
