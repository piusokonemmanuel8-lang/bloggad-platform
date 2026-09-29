import{b as J,r as b,j as e}from"./index-D7wY-Nn2.js";import{a as T}from"./api-BnafCqf_.js";function x(){return{background:"#ffffff",border:"1px solid #e5e7eb",borderRadius:20,padding:20,boxShadow:"0 12px 30px rgba(15, 23, 42, 0.05)"}}function M(h="default"){const w={success:{background:"#ecfdf3",color:"#027a48",border:"#abefc6"},warning:{background:"#fffaeb",color:"#b54708",border:"#fedf89"},danger:{background:"#fef3f2",color:"#b42318",border:"#fecdca"},info:{background:"#eff8ff",color:"#175cd3",border:"#b2ddff"},default:{background:"#f9fafb",color:"#344054",border:"#eaecf0"}},d=w[h]||w.default;return{display:"inline-flex",alignItems:"center",justifyContent:"center",minHeight:30,padding:"0 12px",borderRadius:999,fontSize:12,fontWeight:800,border:`1px solid ${d.border}`,background:d.background,color:d.color,whiteSpace:"nowrap"}}function K(h){return{width:"100%",height:12,borderRadius:999,background:"#eef2f7",overflow:"hidden",position:"relative",marginTop:10,marginBottom:8,boxShadow:"inset 0 1px 2px rgba(15, 23, 42, 0.06)"}}function y(h){return Number(h||0)===1}function Q(h){return h?1:0}function $({title:h,description:w,checked:d,onChange:_,disabled:a}){return e.jsxs("div",{style:{border:"1px solid #e5e7eb",borderRadius:18,padding:16,background:d?"#f0fdf4":"#ffffff",display:"grid",gridTemplateColumns:"minmax(0, 1fr) auto",gap:14,alignItems:"center"},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:16,fontWeight:900,color:"#111827"},children:h}),e.jsx("div",{style:{marginTop:6,color:"#6b7280",fontSize:14,lineHeight:1.55},children:w})]}),e.jsx("button",{type:"button",disabled:a,onClick:()=>_(!d),style:{width:62,height:34,borderRadius:999,border:d?"1px solid #16a34a":"1px solid #d1d5db",background:d?"#16a34a":"#e5e7eb",padding:3,cursor:a?"not-allowed":"pointer",opacity:a?.7:1,transition:"0.2s ease"},children:e.jsx("span",{style:{display:"block",width:26,height:26,borderRadius:"50%",background:"#ffffff",transform:d?"translateX(28px)":"translateX(0)",transition:"0.2s ease",boxShadow:"0 2px 8px rgba(15,23,42,0.18)"}})})]})}function Z(){return[{key:"subscription",title:"Active paid subscription",description:"Admin requires an active paid plan before BlogPulse earnings can be approved.",current:0,required:1,unit:"check",status:"in_progress",remaining:1,percent:0},{key:"storefront",title:"Active storefront",description:"Your storefront must be active and ready to receive traffic.",current:0,required:1,unit:"check",status:"in_progress",remaining:1,percent:0},{key:"policy_pages",title:"Required pages completed",description:"Admin controls how many required pages must be available.",current:0,required:4,unit:"pages",status:"in_progress",remaining:4,percent:0},{key:"published_posts",title:"Published posts target",description:"Admin controls the minimum number of published posts required.",current:0,required:15,unit:"posts",status:"in_progress",remaining:15,percent:0},{key:"valid_views",title:"Valid page views target",description:"Admin controls the minimum valid traffic required before approval.",current:0,required:1e3,unit:"views",status:"in_progress",remaining:1e3,percent:0},{key:"content_quality",title:"Original content review",description:"Admin must approve your content quality before earnings become active.",current:0,required:1,unit:"review",status:"in_progress",remaining:1,percent:0}]}function re(){const w=J().pathname==="/writer/monetization/eligibility",[d,_]=b.useState(null),[a,H]=b.useState(null),[o,S]=b.useState(null),[c,P]=b.useState({post_template_ads_enabled:0,website_ads_enabled:0,product_ads_enabled:0,revenue_share_percent:60,platform_share_percent:40,status:"active"}),[D,I]=b.useState(!0),[p,q]=b.useState(!1),[R,z]=b.useState(""),[u,v]=b.useState(""),[U,W]=b.useState(!1),N=b.useMemo(()=>{var i;return(i=o==null?void 0:o.requirements)!=null&&i.length?o.requirements:Z()},[o]),s=b.useMemo(()=>{if(o!=null&&o.summary)return{total:Number(o.summary.total||0),passed:Number(o.summary.passed||0),percent:Number(o.summary.percent||0),isEligible:!!o.summary.is_eligible};const i=N.length,r=N.filter(l=>l.status==="passed"||Number(l.current||0)>=Number(l.required||0)).length,t=i?Math.round(r/i*100):0;return{total:i,passed:r,percent:t,isEligible:r===i}},[o,N]),B=(d==null?void 0:d.review_status)||"not_applied",f=B==="approved",F=(o==null?void 0:o.publisher_revenue_message)||`Earn up to ${c.revenue_share_percent||60}% ad revenue from eligible sponsored placements.`;function Y(i){return i==="passed"?{label:"Passed",tone:"success"}:i==="pending"?{label:"Pending Review",tone:"info"}:i==="failed"?{label:"Failed",tone:"danger"}:{label:"In Progress",tone:"warning"}}function V(i){return i==="approved"?{label:"Approved",tone:"success"}:i==="pending"?{label:"Pending Admin Review",tone:"info"}:i==="rejected"?{label:"Rejected",tone:"danger"}:i==="draft"?{label:"Draft",tone:"warning"}:{label:"Not Applied Yet",tone:"warning"}}const C=V(B);async function G(){var i,r;try{I(!0),z(""),v("");const{data:t}=await T.get("/affiliate/monetization/settings"),l=(t==null?void 0:t.settings)||{},g=(l==null?void 0:l.template_ads)||{},m=(t==null?void 0:t.eligibility_progress)||null;_(l),H((t==null?void 0:t.website)||null),S(m),P({post_template_ads_enabled:Number(g.post_template_ads_enabled||0),website_ads_enabled:Number(g.website_ads_enabled||0),product_ads_enabled:Number(g.product_ads_enabled||0),revenue_share_percent:Number(g.revenue_share_percent||60),platform_share_percent:Number(g.platform_share_percent||40),status:g.status||"active"})}catch(t){v(((r=(i=t==null?void 0:t.response)==null?void 0:i.data)==null?void 0:r.message)||"Failed to load monetization settings.")}finally{I(!1)}}b.useEffect(()=>{G()},[]);function A(i,r){P(t=>({...t,[i]:Q(r)}))}async function L(){var i,r;try{q(!0),z(""),v("");const t={...d||{},template_ads:{...c,ads_enabled:c.status==="active"?1:0}},{data:l}=await T.post("/affiliate/monetization/settings",t),g=(l==null?void 0:l.settings)||{},m=(g==null?void 0:g.template_ads)||{},n=(l==null?void 0:l.eligibility_progress)||o;_(g),H((l==null?void 0:l.website)||a),S(n),P({post_template_ads_enabled:Number(m.post_template_ads_enabled||0),website_ads_enabled:Number(m.website_ads_enabled||0),product_ads_enabled:Number(m.product_ads_enabled||0),revenue_share_percent:Number(m.revenue_share_percent||60),platform_share_percent:Number(m.platform_share_percent||40),status:m.status||"active"}),z("Publisher ad settings saved successfully.")}catch(t){v(((r=(i=t==null?void 0:t.response)==null?void 0:i.data)==null?void 0:r.message)||"Failed to save publisher ad settings.")}finally{q(!1)}}async function O(){var i;try{q(!0),z(""),v("");const{data:r}=await T.post("/affiliate/monetization/submit");_((r==null?void 0:r.settings)||d),S((r==null?void 0:r.eligibility_progress)||o),z((r==null?void 0:r.message)||"Your monetization setup has been submitted for review.")}catch(r){const t=((i=r==null?void 0:r.response)==null?void 0:i.data)||{};v(t.message||"Failed to submit monetization setup."),t.eligibility_progress&&S(t.eligibility_progress)}finally{q(!1)}}if(D)return e.jsx("div",{style:{...x(),color:"#111827",fontWeight:900},children:"Loading monetization settings..."});if(w){const i=Number(c.revenue_share_percent||60),r=Number(c.platform_share_percent||40),t=B==="not_applied"?"Not applied":C.label,l=(a==null?void 0:a.website_name)||"No website found",g=(a==null?void 0:a.slug)||"-",m=a?"Active":"Not connected";return e.jsxs("div",{className:"writer-eligibility-page",children:[e.jsx("style",{children:`
          .writer-eligibility-page {
            color: #1d2025;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .writer-eligibility-page * {
            box-sizing: border-box;
          }

          .writer-eligibility-kicker {
            margin: 0 0 7px;
            color: #939ba5;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: .08em;
            text-transform: uppercase;
          }

          .writer-eligibility-heading {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 24px;
          }

          .writer-eligibility-heading h2 {
            margin: 0;
            font-size: 22px;
            line-height: 1.2;
            font-weight: 800;
            letter-spacing: -.02em;
          }

          .writer-eligibility-heading p {
            margin: 7px 0 0;
            max-width: 700px;
            color: #7a828d;
            font-size: 14px;
            line-height: 1.55;
          }

          .writer-eligibility-btn {
            min-height: 38px;
            padding: 0 16px;
            border: 1px solid #dfe3e6;
            border-radius: 8px;
            background: #fff;
            color: #1d2025;
            font: inherit;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
          }

          .writer-eligibility-btn.primary {
            border-color: #1c1f24;
            background: #1c1f24;
            color: #fff;
          }

          .writer-eligibility-btn:disabled {
            cursor: not-allowed;
            opacity: .58;
          }

          .writer-eligibility-alert {
            margin-bottom: 14px;
            padding: 12px 14px;
            border: 1px solid #dfe3e6;
            border-radius: 9px;
            background: #fff;
            font-size: 11px;
            font-weight: 600;
            line-height: 1.45;
          }

          .writer-eligibility-alert.error {
            border-color: #f3c7c4;
            background: #fff5f4;
            color: #9f2d25;
          }

          .writer-eligibility-alert.success {
            border-color: #bfe3cc;
            background: #f1fbf5;
            color: #237447;
          }

          .writer-eligibility-metrics {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 16px;
          }

          .writer-eligibility-metric,
          .writer-eligibility-panel,
          .writer-eligibility-side-card {
            border: 1px solid #dfe3e6;
            background: #fff;
          }

          .writer-eligibility-metric {
            min-height: 84px;
            padding: 15px 16px;
            border-radius: 9px;
          }

          .writer-eligibility-metric span {
            display: block;
            margin-bottom: 6px;
            color: #7a828d;
            font-size: 12px;
            font-weight: 500;
          }

          .writer-eligibility-metric strong {
            display: block;
            color: #1d2025;
            font-size: 21px;
            line-height: 1.15;
            font-weight: 800;
            letter-spacing: -.02em;
            overflow-wrap: anywhere;
          }

          .writer-eligibility-metric small {
            display: block;
            margin-top: 5px;
            color: #7a828d;
            font-size: 11px;
            line-height: 1.45;
          }

          .writer-eligibility-metric small.good {
            color: #237447;
          }

          .writer-eligibility-metric small.warn {
            color: #a26c00;
          }

          .writer-eligibility-grid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 365px;
            gap: 16px;
            align-items: start;
          }

          .writer-eligibility-main,
          .writer-eligibility-side {
            display: grid;
            gap: 16px;
          }

          .writer-eligibility-panel,
          .writer-eligibility-side-card {
            border-radius: 10px;
          }

          .writer-eligibility-panel {
            padding: 18px;
          }

          .writer-eligibility-panel-head {
            margin-bottom: 14px;
          }

          .writer-eligibility-panel-head h3,
          .writer-eligibility-side-card h3 {
            margin: 0;
            color: #1d2025;
            font-size: 16px;
            font-weight: 800;
          }

          .writer-eligibility-panel-head p,
          .writer-eligibility-side-card > p {
            margin: 5px 0 0;
            color: #7a828d;
            font-size: 12px;
            line-height: 1.55;
          }

          .writer-eligibility-requirements {
            display: grid;
            gap: 10px;
          }

          .writer-eligibility-requirement {
            padding: 12px 14px;
            border: 1px solid #dfe3e6;
            border-radius: 8px;
            background: #fff;
          }

          .writer-eligibility-requirement-top {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 12px;
            align-items: start;
          }

          .writer-eligibility-requirement h4 {
            margin: 0;
            color: #1d2025;
            font-size: 14px;
            font-weight: 700;
          }

          .writer-eligibility-requirement p {
            margin: 6px 0 0;
            color: #7a828d;
            font-size: 12px;
            line-height: 1.5;
          }

          .writer-eligibility-requirement-meta {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .writer-eligibility-chip {
            display: inline-flex;
            min-width: 92px;
            min-height: 28px;
            padding: 0 12px;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            background: #f0f1f3;
            color: #707782;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
          }

          .writer-eligibility-chip.passed {
            background: #eaf7ef;
            color: #237447;
          }

          .writer-eligibility-chip.progress,
          .writer-eligibility-chip.pending {
            background: #fff7e6;
            color: #9a6700;
          }

          .writer-eligibility-chip.failed {
            background: #fff0ef;
            color: #a23932;
          }

          .writer-eligibility-progress {
            height: 5px;
            margin-top: 12px;
            border-radius: 999px;
            background: #eef1f3;
            overflow: hidden;
          }

          .writer-eligibility-progress > span {
            display: block;
            height: 100%;
            border-radius: inherit;
            background: #a87400;
          }

          .writer-eligibility-progress > span.passed {
            background: #237447;
          }

          .writer-eligibility-progress > span.failed {
            background: #a23932;
          }

          .writer-eligibility-count {
            margin-top: 7px;
            text-align: right;
            color: #1d2025;
            font-size: 11px;
            font-weight: 700;
          }

          .writer-eligibility-side-card {
            padding: 17px;
          }

          .writer-eligibility-side-title-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
          }

          .writer-eligibility-readiness {
            display: grid;
            grid-template-columns: 92px minmax(0, 1fr);
            gap: 15px;
            align-items: center;
            margin: 15px 0;
          }

          .writer-eligibility-ring {
            width: 92px;
            height: 92px;
            border-radius: 50%;
            display: grid;
            place-items: center;
            background: conic-gradient(#a87400 var(--readiness), #eef1f3 0);
          }

          .writer-eligibility-ring > div {
            width: 76px;
            height: 76px;
            border-radius: 50%;
            display: grid;
            place-items: center;
            background: #fff;
            box-shadow: inset 0 0 0 1px #edf0f2;
            color: #1d2025;
            font-size: 22px;
            font-weight: 800;
          }

          .writer-eligibility-readiness-copy strong {
            display: block;
            font-size: 14px;
          }

          .writer-eligibility-readiness-copy p {
            margin: 7px 0 0;
            color: #7a828d;
            font-size: 11px;
            line-height: 1.5;
          }

          .writer-eligibility-side-card .writer-eligibility-btn {
            width: 100%;
          }

          .writer-eligibility-ad-lines {
            display: grid;
            gap: 10px;
            margin: 14px 0 12px;
          }

          .writer-eligibility-ad-line {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 12px;
            align-items: center;
            color: #1d2025;
            font-size: 12px;
          }

          .writer-eligibility-mini-toggle,
          .writer-eligibility-toggle {
            position: relative;
            border: 0;
            border-radius: 999px;
            background: #d7dde4;
          }

          .writer-eligibility-mini-toggle {
            width: 40px;
            height: 22px;
          }

          .writer-eligibility-toggle {
            width: 46px;
            height: 26px;
            cursor: pointer;
          }

          .writer-eligibility-mini-toggle::after,
          .writer-eligibility-toggle::after {
            content: '';
            position: absolute;
            top: 3px;
            left: 3px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #fff;
            box-shadow: 0 1px 3px rgba(15,23,42,.18);
            transition: transform .18s ease;
          }

          .writer-eligibility-toggle::after {
            width: 20px;
            height: 20px;
          }

          .writer-eligibility-mini-toggle.on,
          .writer-eligibility-toggle.on {
            background: #1c1f24;
          }

          .writer-eligibility-mini-toggle.on::after {
            transform: translateX(18px);
          }

          .writer-eligibility-toggle.on::after {
            transform: translateX(20px);
          }

          .writer-eligibility-website-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 15px;
          }

          .writer-eligibility-website-grid span {
            display: block;
            color: #7a828d;
            font-size: 11px;
            margin-bottom: 5px;
          }

          .writer-eligibility-website-grid strong {
            display: block;
            color: #1d2025;
            font-size: 12px;
            overflow-wrap: anywhere;
          }

          .writer-eligibility-revenue {
            border: 1px solid #1c1f24;
            border-radius: 10px;
            padding: 18px;
            background: #1c1f24;
            color: #fff;
          }

          .writer-eligibility-revenue span {
            display: block;
            color: #b9bec5;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .writer-eligibility-revenue strong {
            display: block;
            margin-top: 9px;
            font-size: 21px;
            font-weight: 800;
          }

          .writer-eligibility-revenue p {
            margin: 7px 0 0;
            color: #c8ccd2;
            font-size: 11px;
            line-height: 1.55;
          }

          .writer-eligibility-steps {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
            margin-top: 15px;
          }

          .writer-eligibility-step {
            display: grid;
            grid-template-columns: 28px minmax(0, 1fr);
            gap: 9px;
            align-items: start;
            color: #7a828d;
            font-size: 11px;
            line-height: 1.45;
          }

          .writer-eligibility-step b {
            width: 26px;
            height: 26px;
            border-radius: 50%;
            display: grid;
            place-items: center;
            background: #eef1f3;
            color: #7a828d;
            font-size: 9px;
          }

          .writer-eligibility-step:first-child b {
            background: #1c1f24;
            color: #fff;
          }

          .writer-eligibility-backdrop {
            position: fixed;
            top: 72px;
            right: 0;
            bottom: 0;
            left: 248px;
            z-index: 470;
            background: rgba(28,31,36,.28);
          }

          .writer-eligibility-drawer {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            z-index: 480;
            width: min(460px, calc(100vw - 248px));
            padding: 30px 28px;
            border-left: 1px solid #dfe3e6;
            background: #fff;
            overflow-y: auto;
          }

          .writer-eligibility-drawer-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 14px;
            margin-bottom: 22px;
          }

          .writer-eligibility-drawer-head h3 {
            margin: 0;
            font-size: 20px;
            font-weight: 800;
          }

          .writer-eligibility-drawer-head p {
            margin: 7px 0 0;
            color: #7a828d;
            font-size: 12px;
            line-height: 1.5;
          }

          .writer-eligibility-close {
            width: 32px;
            height: 32px;
            border: 0;
            background: transparent;
            color: #707782;
            font-size: 16px;
            cursor: pointer;
          }

          .writer-eligibility-split {
            display: grid;
            grid-template-columns: 1fr 1fr auto;
            gap: 14px;
            align-items: center;
            padding: 16px;
            border: 1px solid #dfe3e6;
            border-radius: 9px;
            background: #f8f9fa;
          }

          .writer-eligibility-split span {
            display: block;
            color: #7a828d;
            font-size: 11px;
            margin-bottom: 5px;
          }

          .writer-eligibility-split strong {
            font-size: 20px;
          }

          .writer-eligibility-drawer-list {
            display: grid;
            gap: 12px;
            margin-top: 16px;
          }

          .writer-eligibility-drawer-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 14px;
            align-items: center;
            min-height: 86px;
            padding: 15px;
            border: 1px solid #dfe3e6;
            border-radius: 9px;
          }

          .writer-eligibility-drawer-row strong {
            display: block;
            font-size: 14px;
          }

          .writer-eligibility-drawer-row p {
            margin: 6px 0 0;
            color: #7a828d;
            font-size: 12px;
            line-height: 1.5;
          }

          .writer-eligibility-drawer-warning {
            margin-top: 16px;
            padding: 14px;
            border-radius: 8px;
            background: #fff7e6;
            color: #9a6700;
            font-size: 11px;
            line-height: 1.55;
          }

          .writer-eligibility-drawer .writer-eligibility-btn.primary {
            width: 100%;
            margin-top: 16px;
            min-height: 40px;
          }

          @media (max-width: 1100px) {
            .writer-eligibility-grid {
              grid-template-columns: minmax(0, 1fr) 330px;
            }
          }

          @media (max-width: 991px) {
            .writer-eligibility-page {
              margin-left: -9px;
              margin-right: -9px;
            }

            .writer-eligibility-heading {
              align-items: center;
              margin-bottom: 16px;
              padding: 0 6px;
            }

            .writer-eligibility-kicker,
            .writer-eligibility-heading p {
              display: none;
            }

            .writer-eligibility-heading h2 {
              font-size: 20px;
            }

            .writer-eligibility-heading .writer-eligibility-btn {
              min-height: 38px;
              padding: 0 13px;
              font-size: 12px;
            }

            .writer-eligibility-alert {
              margin: 0 0 8px;
            }

            .writer-eligibility-metrics {
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 8px;
              margin-bottom: 8px;
            }

            .writer-eligibility-metric {
              min-height: 76px;
              padding: 12px;
            }

            .writer-eligibility-metric strong {
              font-size: 20px;
            }

            .writer-eligibility-grid {
              display: contents;
            }

            .writer-eligibility-main,
            .writer-eligibility-side {
              display: contents;
            }

            .writer-eligibility-panel,
            .writer-eligibility-side-card,
            .writer-eligibility-revenue {
              margin-bottom: 8px;
              border-radius: 8px;
            }

            .writer-eligibility-requirements-panel {
              order: 1;
            }

            .writer-eligibility-summary-card {
              order: 2;
            }

            .writer-eligibility-ads-card {
              order: 3;
            }

            .writer-eligibility-revenue {
              order: 4;
            }

            .writer-eligibility-website-card,
            .writer-eligibility-steps-panel {
              display: none;
            }

            .writer-eligibility-panel {
              padding: 12px 8px;
            }

            .writer-eligibility-panel-head {
              margin-bottom: 10px;
            }

            .writer-eligibility-requirements {
              gap: 9px;
            }

            .writer-eligibility-requirement {
              padding: 13px 10px;
            }

            .writer-eligibility-requirement h4 {
              font-size: 14px;
              line-height: 1.35;
            }

            .writer-eligibility-requirement p {
              font-size: 12px;
              line-height: 1.5;
            }

            .writer-eligibility-requirement-meta {
              gap: 6px;
            }

            .writer-eligibility-chip {
              min-width: 78px;
              min-height: 26px;
              padding: 0 9px;
              font-size: 10px;
            }

            .writer-eligibility-progress {
              margin-top: 9px;
            }

            .writer-eligibility-count {
              font-size: 10px;
            }

            .writer-eligibility-side-card {
              padding: 14px 10px;
            }

            .writer-eligibility-readiness {
              grid-template-columns: 1fr;
              margin: 10px 0;
            }

            .writer-eligibility-ring {
              display: none;
            }

            .writer-eligibility-readiness-copy strong {
              font-size: 24px;
            }

            .writer-eligibility-readiness-copy p {
              margin-top: 5px;
              font-size: 12px;
            }

            .writer-eligibility-revenue {
              padding: 13px 9px;
              min-height: 98px;
            }

            .writer-eligibility-revenue strong {
              font-size: 20px;
            }

            .writer-eligibility-backdrop {
              top: 60px;
              left: 0;
            }

            .writer-eligibility-drawer {
              top: 60px;
              width: 100%;
              padding: 18px 8px 28px;
              border-left: 0;
            }

            .writer-eligibility-drawer-head {
              margin-bottom: 18px;
              padding: 0 8px;
            }

            .writer-eligibility-drawer-head h3 {
              font-size: 20px;
            }

            .writer-eligibility-split {
              grid-template-columns: 1fr 1fr;
              padding: 14px;
            }

            .writer-eligibility-split .writer-eligibility-chip {
              grid-column: 1 / -1;
              width: max-content;
              min-width: 118px;
            }

            .writer-eligibility-drawer-row {
              min-height: 112px;
              padding: 14px;
            }

            .writer-eligibility-drawer-warning {
              padding: 14px;
            }
          }
        `}),e.jsxs("div",{className:"writer-eligibility-heading",children:[e.jsxs("div",{children:[e.jsx("div",{className:"writer-eligibility-kicker",children:"Monetization"}),e.jsx("h2",{children:"Eligibility & readiness"}),e.jsx("p",{children:"Complete the marketplace requirements, choose where publisher ads may appear, then apply for review."})]}),e.jsx("button",{type:"button",className:"writer-eligibility-btn",onClick:()=>W(!0),children:"Publisher ad settings"})]}),R||u?e.jsx("div",{className:`writer-eligibility-alert ${u?"error":"success"}`,children:u||R}):null,e.jsxs("section",{className:"writer-eligibility-metrics","aria-label":"Monetization summary",children:[e.jsxs("div",{className:"writer-eligibility-metric",children:[e.jsx("span",{children:"Readiness"}),e.jsxs("strong",{children:[s.percent,"%"]}),e.jsxs("small",{className:s.isEligible?"good":"warn",children:[s.passed," of ",s.total," requirements complete"]})]}),e.jsxs("div",{className:"writer-eligibility-metric",children:[e.jsx("span",{children:"Application"}),e.jsx("strong",{children:t}),e.jsx("small",{children:s.isEligible?"Ready to submit for review":"Submit when readiness reaches 100%"})]}),e.jsxs("div",{className:"writer-eligibility-metric",children:[e.jsx("span",{children:"Publisher share"}),e.jsxs("strong",{children:["Up to ",i,"%"]}),e.jsx("small",{className:"good",children:"On eligible sponsored activity"})]}),e.jsxs("div",{className:"writer-eligibility-metric",children:[e.jsx("span",{children:"Website"}),e.jsx("strong",{children:m}),e.jsx("small",{children:l})]})]}),e.jsxs("section",{className:"writer-eligibility-grid",children:[e.jsxs("div",{className:"writer-eligibility-main",children:[e.jsxs("section",{className:"writer-eligibility-panel writer-eligibility-requirements-panel",children:[e.jsxs("div",{className:"writer-eligibility-panel-head",children:[e.jsx("h3",{children:"Eligibility requirements"}),e.jsx("p",{children:"Marketplace-controlled targets update automatically."})]}),e.jsx("div",{className:"writer-eligibility-requirements",children:N.map(n=>{const j=n.percent!==void 0?Number(n.percent||0):Number(n.required||0)>0?Math.round(Number(n.current||0)/Number(n.required||1)*100):100,E=Math.max(0,Math.min(j,100)),k=Y(n.status),X=n.status==="passed"?"passed":n.status==="failed"?"failed":n.status==="pending"?"pending":"progress";return e.jsxs("article",{className:"writer-eligibility-requirement",children:[e.jsxs("div",{className:"writer-eligibility-requirement-top",children:[e.jsxs("div",{children:[e.jsx("h4",{children:n.title}),e.jsx("p",{children:n.description})]}),e.jsx("div",{className:"writer-eligibility-requirement-meta",children:e.jsx("span",{className:`writer-eligibility-chip ${X}`,children:k.label})})]}),e.jsx("div",{className:"writer-eligibility-progress",children:e.jsx("span",{className:X,style:{width:`${E}%`}})}),e.jsxs("div",{className:"writer-eligibility-count",children:[Number(n.current||0).toLocaleString()," / ",Number(n.required||0).toLocaleString()]})]},n.key)})})]}),e.jsxs("section",{className:"writer-eligibility-panel writer-eligibility-steps-panel",children:[e.jsx("div",{className:"writer-eligibility-panel-head",children:e.jsx("h3",{children:"How approval works"})}),e.jsx("div",{className:"writer-eligibility-steps",children:["Complete current marketplace requirements","Apply when readiness reaches 100%","Admin reviews account, traffic and content","Approved sponsored activity can earn revenue"].map((n,j)=>e.jsxs("div",{className:"writer-eligibility-step",children:[e.jsx("b",{children:j+1}),e.jsx("span",{children:n})]},n))})]})]}),e.jsxs("aside",{className:"writer-eligibility-side",children:[e.jsxs("section",{className:"writer-eligibility-side-card writer-eligibility-summary-card",children:[e.jsxs("div",{className:"writer-eligibility-side-title-row",children:[e.jsx("h3",{children:"Readiness summary"}),e.jsx("span",{className:`writer-eligibility-chip ${s.isEligible?"passed":"progress"}`,children:s.isEligible?"Ready":"Not ready"})]}),e.jsxs("div",{className:"writer-eligibility-readiness",children:[e.jsx("div",{className:"writer-eligibility-ring",style:{"--readiness":`${Math.max(0,Math.min(Number(s.percent||0),100))}%`},children:e.jsxs("div",{children:[s.percent,"%"]})}),e.jsxs("div",{className:"writer-eligibility-readiness-copy",children:[e.jsxs("strong",{children:[s.passed," / ",s.total," complete"]}),e.jsx("p",{children:s.isEligible?"All current requirements are complete.":"Finish the remaining targets before applying."})]})]}),e.jsx("button",{type:"button",className:"writer-eligibility-btn",disabled:!s.isEligible||p,onClick:O,children:p?"Please wait...":"Apply for Monetization"})]}),e.jsxs("section",{className:"writer-eligibility-side-card writer-eligibility-ads-card",children:[e.jsxs("div",{className:"writer-eligibility-side-title-row",children:[e.jsx("h3",{children:"Publisher ads"}),e.jsx("span",{className:`writer-eligibility-chip ${f?"passed":"progress"}`,children:f?"Approved":"Approval required"})]}),e.jsx("p",{children:"Choose where sponsored placements may appear. Preferences can be saved before approval."}),e.jsxs("div",{className:"writer-eligibility-ad-lines",children:[e.jsxs("div",{className:"writer-eligibility-ad-line",children:[e.jsx("span",{children:"Post template ads"}),e.jsx("span",{className:`writer-eligibility-mini-toggle ${y(c.post_template_ads_enabled)?"on":""}`})]}),e.jsxs("div",{className:"writer-eligibility-ad-line",children:[e.jsx("span",{children:"Website ads"}),e.jsx("span",{className:`writer-eligibility-mini-toggle ${y(c.website_ads_enabled)?"on":""}`})]}),e.jsxs("div",{className:"writer-eligibility-ad-line",children:[e.jsx("span",{children:"Product ads"}),e.jsx("span",{className:`writer-eligibility-mini-toggle ${y(c.product_ads_enabled)?"on":""}`})]})]}),e.jsx("button",{type:"button",className:"writer-eligibility-btn",onClick:()=>W(!0),children:"Manage ad settings"})]}),e.jsxs("section",{className:"writer-eligibility-side-card writer-eligibility-website-card",children:[e.jsxs("div",{className:"writer-eligibility-side-title-row",children:[e.jsx("h3",{children:"Website connected"}),e.jsx("span",{className:`writer-eligibility-chip ${a?"passed":""}`,children:m})]}),e.jsxs("div",{className:"writer-eligibility-website-grid",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Website"}),e.jsx("strong",{children:l})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Slug"}),e.jsx("strong",{children:g})]})]})]}),e.jsxs("section",{className:"writer-eligibility-revenue",children:[e.jsx("span",{children:"Revenue opportunity"}),e.jsxs("strong",{children:["Up to ",i,"%"]}),e.jsx("p",{children:F})]})]})]}),U?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"writer-eligibility-backdrop",onClick:()=>W(!1)}),e.jsxs("aside",{className:"writer-eligibility-drawer","aria-label":"Publisher ad settings",children:[e.jsxs("div",{className:"writer-eligibility-drawer-head",children:[e.jsxs("div",{children:[e.jsx("div",{className:"writer-eligibility-kicker",children:"Monetization"}),e.jsx("h3",{children:"Publisher ad settings"}),e.jsx("p",{children:"Choose where sponsored placements may appear. These preferences can be saved before approval."})]}),e.jsx("button",{type:"button",className:"writer-eligibility-close","aria-label":"Close publisher ad settings",onClick:()=>W(!1),children:"X"})]}),e.jsxs("div",{className:"writer-eligibility-split",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Publisher"}),e.jsxs("strong",{children:[i,"%"]})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Platform"}),e.jsxs("strong",{children:[r,"%"]})]}),e.jsx("span",{className:`writer-eligibility-chip ${f?"passed":"progress"}`,children:f?"Approved":"Approval required"})]}),e.jsx("div",{className:"writer-eligibility-drawer-list",children:[["post_template_ads_enabled","Post template ads","Show sponsored placements inside eligible blog post templates."],["website_ads_enabled","Website ads","Allow sponsored placements across approved storefront areas."],["product_ads_enabled","Product ads","Enable sponsored product placements in eligible product sections."]].map(([n,j,E])=>{const k=y(c[n]);return e.jsxs("div",{className:"writer-eligibility-drawer-row",children:[e.jsxs("div",{children:[e.jsx("strong",{children:j}),e.jsx("p",{children:E})]}),e.jsx("button",{type:"button",className:`writer-eligibility-toggle ${k?"on":""}`,"aria-pressed":k,"aria-label":`${k?"Disable":"Enable"} ${j}`,disabled:p,onClick:()=>A(n,!k)})]},n)})}),e.jsxs("div",{className:"writer-eligibility-drawer-warning",children:[e.jsx("strong",{children:"Preferences do not activate earnings"}),e.jsx("div",{style:{marginTop:6},children:"Sponsored earnings become active only after your monetization application is approved."})]}),e.jsx("button",{type:"button",className:"writer-eligibility-btn primary",disabled:p,onClick:L,children:p?"Saving...":"Save Publisher Ad Settings"})]})]}):null]})}return e.jsxs("div",{style:{display:"grid",gap:24},children:[e.jsx("style",{children:`
        .blogpulse-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
          gap: 24px;
          align-items: start;
        }

        .blogpulse-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.7fr);
          gap: 18px;
          align-items: center;
        }

        .blogpulse-metric-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .blogpulse-requirement-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 12px;
        }

        .publisher-ad-toggle-grid {
          display: grid;
          gap: 14px;
        }

        @media (max-width: 1000px) {
          .blogpulse-main-grid,
          .blogpulse-hero-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .blogpulse-metric-grid,
          .blogpulse-requirement-stats {
            grid-template-columns: 1fr;
          }
        }
      `}),(R||u)&&e.jsx("div",{style:{padding:"14px 16px",borderRadius:16,border:u?"1px solid #fca5a5":"1px solid #86efac",background:u?"#fef2f2":"#ecfdf5",color:u?"#b91c1c":"#166534",fontWeight:800},children:u||R}),e.jsx("section",{style:{...x(),background:"linear-gradient(135deg, rgba(17,24,39,1) 0%, rgba(31,41,55,1) 55%, rgba(55,65,81,1) 100%)",color:"#ffffff",overflow:"hidden"},children:e.jsxs("div",{className:"blogpulse-hero-grid",children:[e.jsxs("div",{children:[e.jsx("div",{style:{display:"inline-flex",alignItems:"center",minHeight:32,padding:"0 12px",borderRadius:999,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14},children:"BlogPulse Eligibility"}),e.jsx("h1",{style:{margin:0,fontSize:32,lineHeight:1.15,fontWeight:900},children:"Track monetization readiness and unlock publisher ad earnings"}),e.jsx("p",{style:{margin:"12px 0 0",maxWidth:760,color:"rgba(255,255,255,0.82)",fontSize:15,lineHeight:1.7},children:"Your requirements are controlled by the marketplace settings. Complete the current targets, activate sponsored placements, and prepare your website to earn from approved BlogPulse ad activity."})]}),e.jsxs("div",{className:"blogpulse-metric-grid",children:[e.jsxs("div",{style:{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:18,padding:16},children:[e.jsx("div",{style:{fontSize:12,color:"rgba(255,255,255,0.7)",marginBottom:8},children:"Completed Requirements"}),e.jsxs("div",{style:{fontSize:26,fontWeight:900},children:[s.passed,"/",s.total]})]}),e.jsxs("div",{style:{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:18,padding:16},children:[e.jsx("div",{style:{fontSize:12,color:"rgba(255,255,255,0.7)",marginBottom:8},children:"Readiness"}),e.jsxs("div",{style:{fontSize:26,fontWeight:900},children:[s.percent,"%"]})]}),e.jsxs("div",{style:{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:18,padding:16,gridColumn:"1 / -1"},children:[e.jsx("div",{style:{fontSize:12,color:"rgba(255,255,255,0.7)",marginBottom:8},children:"Application Status"}),e.jsx("div",{style:{...M(C.tone),background:"rgba(255,255,255,0.12)",color:"#fff",border:"1px solid rgba(255,255,255,0.18)"},children:C.label})]})]})]})}),e.jsxs("section",{className:"blogpulse-main-grid",children:[e.jsxs("div",{style:{display:"grid",gap:20},children:[e.jsxs("div",{style:x(),children:[e.jsxs("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:14,flexWrap:"wrap",marginBottom:16},children:[e.jsxs("div",{children:[e.jsx("h2",{style:{margin:0,fontSize:22,fontWeight:900,color:"#111827"},children:"BlogPulse Publisher Ads"}),e.jsx("p",{style:{margin:"8px 0 0",color:"#6b7280",fontSize:14,lineHeight:1.6},children:"Control where sponsored placements can appear across your approved publisher areas."})]}),e.jsx("div",{style:M(f?"success":"warning"),children:f?"Monetized":"Approval Required"})]}),e.jsxs("div",{style:{borderRadius:20,padding:20,background:"linear-gradient(135deg, #ecfdf5 0%, #ffffff 55%, #f8fafc 100%)",border:"1px solid #bbf7d0",marginBottom:16,boxShadow:"0 14px 30px rgba(22, 163, 74, 0.08)"},children:[e.jsx("div",{style:{display:"inline-flex",alignItems:"center",minHeight:30,padding:"0 12px",borderRadius:999,background:"#dcfce7",border:"1px solid #86efac",color:"#166534",fontSize:12,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12},children:"Revenue Opportunity"}),e.jsx("div",{style:{color:"#111827",fontSize:28,fontWeight:950,lineHeight:1.15,letterSpacing:"-0.03em"},children:F}),e.jsx("div",{style:{marginTop:12,color:"#475569",fontSize:15,lineHeight:1.75,fontWeight:700},children:"Turn on publisher ads to unlock sponsored placements across your posts, website, and product areas. Once your BlogPulse monetization is approved, eligible ad activity can start generating revenue automatically while BlogPulse handles tracking, billing, and reporting."})]}),f?null:e.jsx("div",{style:{padding:14,borderRadius:16,background:"#fffaeb",border:"1px solid #fedf89",color:"#b54708",fontSize:14,fontWeight:700,lineHeight:1.55,marginBottom:16},children:"You can set your publisher ad preferences now. Earnings become active only after your BlogPulse monetization is approved."}),e.jsxs("div",{className:"publisher-ad-toggle-grid",children:[e.jsx($,{title:"Post template ads",description:"Show sponsored placements inside your blog post templates and earn from eligible ad activity.",checked:y(c.post_template_ads_enabled),onChange:i=>A("post_template_ads_enabled",i),disabled:p}),e.jsx($,{title:"Website ads",description:"Allow sponsored website placements across approved areas of your storefront.",checked:y(c.website_ads_enabled),onChange:i=>A("website_ads_enabled",i),disabled:p}),e.jsx($,{title:"Product ads",description:"Enable sponsored product placements in eligible product sections.",checked:y(c.product_ads_enabled),onChange:i=>A("product_ads_enabled",i),disabled:p})]}),e.jsx("button",{type:"button",onClick:L,disabled:p,style:{marginTop:18,width:"100%",minHeight:50,borderRadius:14,border:0,background:"#111827",color:"#ffffff",fontSize:14,fontWeight:900,cursor:p?"not-allowed":"pointer",opacity:p?.75:1},children:p?"Saving...":"Save Publisher Ad Settings"})]}),e.jsxs("div",{style:{...x(),display:"grid",gap:16},children:[e.jsxs("div",{children:[e.jsx("h2",{style:{margin:0,fontSize:22,fontWeight:900,color:"#111827"},children:"Requirement Breakdown"}),e.jsx("p",{style:{margin:"8px 0 0",color:"#6b7280",fontSize:14,lineHeight:1.6},children:"These targets come from the marketplace monetization settings set by admin."})]}),e.jsx("div",{style:{display:"grid",gap:14},children:N.map(i=>{const r=i.percent!==void 0?Number(i.percent||0):i.required>0?Math.round(Number(i.current||0)/Number(i.required||1)*100):100,t=i.remaining!==void 0?Number(i.remaining||0):Math.max(Number(i.required||0)-Number(i.current||0),0),l=Y(i.status);return e.jsxs("div",{style:{border:"1px solid #e5e7eb",borderRadius:18,padding:18,background:"#ffffff"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:14,marginBottom:10},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:17,fontWeight:800,color:"#111827"},children:i.title}),e.jsx("div",{style:{marginTop:6,color:"#6b7280",fontSize:14,lineHeight:1.55},children:i.description})]}),e.jsx("div",{style:M(l.tone),children:l.label})]}),e.jsx("div",{style:K(),children:e.jsx("div",{style:{width:`${Math.max(0,Math.min(r,100))}%`,height:"100%",borderRadius:999,background:"linear-gradient(90deg, #111827 0%, #2563eb 55%, #7c3aed 100%)",transition:"width 0.25s ease"}})}),e.jsxs("div",{className:"blogpulse-requirement-stats",children:[e.jsxs("div",{style:{background:"#f9fafb",border:"1px solid #eef2f7",borderRadius:14,padding:12},children:[e.jsx("div",{style:{fontSize:12,color:"#6b7280",marginBottom:4},children:"Current"}),e.jsx("div",{style:{fontSize:18,fontWeight:900,color:"#111827"},children:i.current})]}),e.jsxs("div",{style:{background:"#f9fafb",border:"1px solid #eef2f7",borderRadius:14,padding:12},children:[e.jsx("div",{style:{fontSize:12,color:"#6b7280",marginBottom:4},children:"Required"}),e.jsx("div",{style:{fontSize:18,fontWeight:900,color:"#111827"},children:i.required})]}),e.jsxs("div",{style:{background:"#f9fafb",border:"1px solid #eef2f7",borderRadius:14,padding:12},children:[e.jsx("div",{style:{fontSize:12,color:"#6b7280",marginBottom:4},children:"Remaining"}),e.jsx("div",{style:{fontSize:18,fontWeight:900,color:"#111827"},children:t})]})]})]},i.key)})})]})]}),e.jsxs("div",{style:{display:"grid",gap:20},children:[e.jsxs("div",{style:x(),children:[e.jsx("h3",{style:{margin:0,fontSize:20,fontWeight:900,color:"#111827"},children:"Readiness Summary"}),e.jsx("div",{style:{marginTop:18,width:150,height:150,borderRadius:"50%",background:`conic-gradient(#111827 0% ${s.percent}%, #e5e7eb ${s.percent}% 100%)`,display:"grid",placeItems:"center",marginInline:"auto"},children:e.jsx("div",{style:{width:112,height:112,borderRadius:"50%",background:"#ffffff",display:"grid",placeItems:"center",textAlign:"center"},children:e.jsxs("div",{children:[e.jsxs("div",{style:{fontSize:30,fontWeight:900,color:"#111827"},children:[s.percent,"%"]}),e.jsx("div",{style:{fontSize:12,color:"#6b7280",fontWeight:700},children:"Ready"})]})})}),e.jsx("div",{style:{marginTop:20,padding:14,borderRadius:16,background:s.isEligible?"#ecfdf3":"#fffaeb",border:s.isEligible?"1px solid #abefc6":"1px solid #fedf89",color:s.isEligible?"#027a48":"#b54708",fontSize:14,fontWeight:700,lineHeight:1.55},children:s.isEligible?"All current marketplace requirements are complete. You can now apply for BlogPulse monetization.":"You have not met all current marketplace requirements yet. Complete the remaining items before applying."}),e.jsx("button",{type:"button",disabled:!s.isEligible||p,onClick:O,style:{marginTop:18,width:"100%",minHeight:48,borderRadius:14,border:0,background:s.isEligible?"#111827":"#d1d5db",color:s.isEligible?"#ffffff":"#6b7280",fontSize:14,fontWeight:900,cursor:s.isEligible&&!p?"pointer":"not-allowed"},children:p?"Please wait...":"Apply for Monetization"})]}),e.jsxs("div",{style:x(),children:[e.jsx("h3",{style:{margin:0,fontSize:20,fontWeight:900,color:"#111827"},children:"Website connected"}),e.jsxs("div",{style:{marginTop:16,display:"grid",gap:12},children:[e.jsxs("div",{style:{padding:14,borderRadius:16,background:"#f9fafb",border:"1px solid #eef2f7"},children:[e.jsx("div",{style:{color:"#6b7280",fontSize:12,fontWeight:800,marginBottom:6},children:"Website"}),e.jsx("div",{style:{color:"#111827",fontSize:16,fontWeight:900},children:(a==null?void 0:a.website_name)||"No website found"})]}),e.jsxs("div",{style:{padding:14,borderRadius:16,background:"#f9fafb",border:"1px solid #eef2f7"},children:[e.jsx("div",{style:{color:"#6b7280",fontSize:12,fontWeight:800,marginBottom:6},children:"Slug"}),e.jsx("div",{style:{color:"#111827",fontSize:16,fontWeight:900},children:(a==null?void 0:a.slug)||"-"})]})]})]}),e.jsxs("div",{style:x(),children:[e.jsx("h3",{style:{margin:0,fontSize:20,fontWeight:900,color:"#111827"},children:"What happens next"}),e.jsx("div",{style:{marginTop:16,display:"grid",gap:12},children:["Complete the current marketplace requirements set by admin.","Apply for BlogPulse monetization when your readiness reaches 100%.","Admin reviews your account, storefront, traffic, and content quality.","When approved, eligible sponsored activity can start generating publisher earnings.","If publisher ads are turned off, sponsored placements will not show on your templates."].map((i,r)=>e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"32px minmax(0, 1fr)",gap:12,alignItems:"start"},children:[e.jsx("div",{style:{width:32,height:32,borderRadius:999,background:"#111827",color:"#ffffff",display:"grid",placeItems:"center",fontWeight:900,fontSize:13},children:r+1}),e.jsx("div",{style:{color:"#374151",fontSize:14,lineHeight:1.6,paddingTop:4},children:i})]},i))})]})]})]})]})}export{re as default};
