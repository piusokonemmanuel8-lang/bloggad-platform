import{b as H,r as s,j as e,a as W}from"./index-D7wY-Nn2.js";function b(){return{background:"#ffffff",border:"1px solid #e5e7eb",borderRadius:20,padding:20,boxShadow:"0 12px 30px rgba(15, 23, 42, 0.05)"}}function S(){return{display:"block",fontSize:13,fontWeight:800,color:"#374151",marginBottom:8}}function R(){return{width:"100%",minHeight:46,borderRadius:14,border:"1px solid #d1d5db",background:"#ffffff",padding:"0 14px",fontSize:14,color:"#111827",outline:"none"}}function A(){return{width:"100%",minHeight:46,borderRadius:14,border:"1px solid #d1d5db",background:"#ffffff",padding:"0 14px",fontSize:14,color:"#111827",outline:"none"}}function E(t="default"){const d={success:{background:"#ecfdf3",color:"#027a48",border:"#abefc6"},warning:{background:"#fffaeb",color:"#b54708",border:"#fedf89"},info:{background:"#eff8ff",color:"#175cd3",border:"#b2ddff"},default:{background:"#f9fafb",color:"#344054",border:"#eaecf0"}},r=d[t]||d.default;return{display:"inline-flex",alignItems:"center",justifyContent:"center",minHeight:30,padding:"0 12px",borderRadius:999,fontSize:12,fontWeight:800,border:`1px solid ${r.border}`,background:r.background,color:r.color,whiteSpace:"nowrap"}}function F(t,d,r,h=""){return e.jsxs("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:18,padding:"16px 0",borderBottom:"1px solid #eef2f7"},children:[e.jsxs("div",{style:{flex:1},children:[e.jsx("div",{style:{fontSize:15,fontWeight:800,color:"#111827"},children:t}),h?e.jsx("div",{style:{marginTop:6,fontSize:13,lineHeight:1.5,color:"#6b7280"},children:h}):null]}),e.jsx("button",{type:"button",onClick:()=>r(d?0:1),style:{width:58,height:32,borderRadius:999,border:0,background:d?"#2563eb":"#d1d5db",position:"relative",cursor:"pointer",flexShrink:0,transition:"background 0.2s ease",marginTop:2},children:e.jsx("span",{style:{position:"absolute",top:4,left:d?30:4,width:24,height:24,borderRadius:"50%",background:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.16)",transition:"left 0.2s ease"}})})]})}const B={monetization_mode:"individual",selected_template:"current-template",storefront_top_enabled:1,storefront_sidebar_enabled:0,storefront_bottom_enabled:1,post_top_enabled:1,post_middle_enabled:1,post_bottom_enabled:1,post_sidebar_enabled:0,post_middle_insert_after:"2"};function M(t={}){return{...B,monetization_mode:(t==null?void 0:t.monetization_mode)==="platform"?"platform":"individual",selected_template:(t==null?void 0:t.selected_template)||"current-template",storefront_top_enabled:Number((t==null?void 0:t.storefront_top_enabled)??1),storefront_sidebar_enabled:Number((t==null?void 0:t.storefront_sidebar_enabled)??0),storefront_bottom_enabled:Number((t==null?void 0:t.storefront_bottom_enabled)??1),post_top_enabled:Number((t==null?void 0:t.post_top_enabled)??1),post_middle_enabled:Number((t==null?void 0:t.post_middle_enabled)??1),post_bottom_enabled:Number((t==null?void 0:t.post_bottom_enabled)??1),post_sidebar_enabled:Number((t==null?void 0:t.post_sidebar_enabled)??0),post_middle_insert_after:String((t==null?void 0:t.post_middle_insert_after)??"2")}}function L(t){return{monetization_mode:t.monetization_mode,storefront_top_enabled:Number(t.storefront_top_enabled),storefront_sidebar_enabled:Number(t.storefront_sidebar_enabled),storefront_bottom_enabled:Number(t.storefront_bottom_enabled),post_top_enabled:Number(t.post_top_enabled),post_middle_enabled:Number(t.post_middle_enabled),post_bottom_enabled:Number(t.post_bottom_enabled),post_sidebar_enabled:Number(t.post_sidebar_enabled)}}function p(t,d,r){return{minHeight:58,borderRadius:14,background:t,color:d,display:"grid",placeItems:"center",fontSize:13,fontWeight:900,padding:12,textAlign:"center"}}function G(){const d=H().pathname==="/writer/monetization/ad-placement",[r,h]=s.useState(B),[g,y]=s.useState(""),[x,v]=s.useState(""),[u,z]=s.useState(""),[m,N]=s.useState(!0),[f,k]=s.useState(!1),[_,P]=s.useState("storefront"),C=s.useMemo(()=>[{title:"Storefront placements",items:[{key:"storefront_top_enabled",label:"Storefront top slot",helper:"Shows near the top section of the storefront homepage."},{key:"storefront_sidebar_enabled",label:"Storefront sidebar slot",helper:"Shows in the storefront sidebar when the chosen template supports it."},{key:"storefront_bottom_enabled",label:"Storefront bottom slot",helper:"Shows near the lower section of the storefront homepage."}]},{title:"Post detail placements",items:[{key:"post_top_enabled",label:"Post top slot",helper:"Shows below post title or opening content area."},{key:"post_middle_enabled",label:"Post middle slot",helper:"Shows inside article content after a chosen paragraph."},{key:"post_bottom_enabled",label:"Post bottom slot",helper:"Shows after the article body ends."},{key:"post_sidebar_enabled",label:"Post sidebar slot",helper:"Shows in sidebar when the selected template has a sidebar layout."}]}],[]);s.useEffect(()=>{let a=!1;async function i(){var n,o;N(!0),z("");try{const{data:l}=await W.get("/api/affiliate/dashboard/monetization/settings");if(!(l!=null&&l.ok))throw new Error((l==null?void 0:l.message)||"Failed to load your saved ad placement settings.");a||h(M(l.settings||{}))}catch(l){a||z(((o=(n=l==null?void 0:l.response)==null?void 0:n.data)==null?void 0:o.message)||l.message||"Failed to load your saved ad placement settings.")}finally{a||N(!1)}}return i(),()=>{a=!0}},[]);function c(a,i){y(""),v(""),h(n=>({...n,[a]:i}))}async function T(a){var i,n;a.preventDefault(),k(!0),y(""),v("");try{const{data:o}=await W.put("/api/affiliate/dashboard/monetization/settings",L(r));if(!(o!=null&&o.ok))throw new Error((o==null?void 0:o.message)||"Failed to save your ad placement settings.");h(l=>M({...o.settings,selected_template:l.selected_template,post_middle_insert_after:l.post_middle_insert_after})),y("Your ad placement settings have been saved.")}catch(o){v(((n=(i=o==null?void 0:o.response)==null?void 0:i.data)==null?void 0:n.message)||o.message||"Failed to save your ad placement settings.")}finally{k(!1)}}const w=r.monetization_mode==="platform",j=[r.storefront_top_enabled,r.storefront_sidebar_enabled,r.storefront_bottom_enabled,r.post_top_enabled,r.post_middle_enabled,r.post_bottom_enabled,r.post_sidebar_enabled].filter(a=>Number(a)===1).length,I={"current-template":"Current active template","minimal-template":"Minimal template","electronics-template":"Electronics template"}[r.selected_template]||"Current active template";return d?e.jsxs("form",{className:"writer-ad-placement-page",onSubmit:T,children:[e.jsx("style",{children:String.raw`
          .writer-ad-placement-page,
          .writer-ad-placement-page * { box-sizing: border-box; }
          .writer-ad-placement-page {
            width: 100%;
            color: #1d2025;
            font-family: inherit;
          }
          .writer-ad-placement-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 24px;
            margin-bottom: 16px;
          }
          .writer-ad-placement-eyebrow {
            margin: 0 0 6px;
            color: #8a929d;
            font-size: 11px;
            line-height: 1.2;
            font-weight: 800;
            letter-spacing: .06em;
            text-transform: uppercase;
          }
          .writer-ad-placement-head h2 {
            margin: 0;
            color: #1d2025;
            font-size: 24px;
            line-height: 1.2;
            font-weight: 800;
          }
          .writer-ad-placement-subtitle {
            max-width: 760px;
            margin: 6px 0 0;
            color: #6f7782;
            font-size: 14px;
            line-height: 1.5;
          }
          .writer-ad-placement-save {
            min-width: 152px;
            height: 40px;
            padding: 0 18px;
            border: 0;
            border-radius: 8px;
            background: #1c1f24;
            color: #fff;
            font: inherit;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
          }
          .writer-ad-placement-save:disabled { opacity: .55; cursor: not-allowed; }
          .writer-ad-placement-feedback {
            margin: 6px 0 0;
            font-size: 13px;
            line-height: 1.4;
            font-weight: 600;
          }
          .writer-ad-placement-feedback.ok { color: #237447; }
          .writer-ad-placement-feedback.error { color: #b42318; }
          .writer-ad-placement-alert {
            margin-bottom: 14px;
            padding: 12px 14px;
            border: 1px solid #f0c7c2;
            border-radius: 8px;
            background: #fff4f2;
            color: #a3362b;
            font-size: 13px;
            line-height: 1.45;
            font-weight: 600;
          }
          .writer-ad-placement-stats {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 16px;
          }
          .writer-ad-placement-stat,
          .writer-ad-placement-card {
            border: 1px solid #dfe3e6;
            background: #fff;
            border-radius: 10px;
          }
          .writer-ad-placement-stat { min-height: 78px; padding: 14px; }
          .writer-ad-placement-stat span {
            display: block;
            color: #737c87;
            font-size: 12px;
            line-height: 1.3;
            font-weight: 600;
          }
          .writer-ad-placement-stat strong {
            display: block;
            margin-top: 4px;
            color: #1d2025;
            font-size: 18px;
            line-height: 1.25;
            font-weight: 800;
          }
          .writer-ad-placement-stat small {
            display: block;
            margin-top: 2px;
            color: #89919b;
            font-size: 12px;
            line-height: 1.35;
          }
          .writer-ad-placement-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.62fr) minmax(340px, .9fr);
            gap: 16px;
            align-items: start;
          }
          .writer-ad-placement-left,
          .writer-ad-placement-right { display: grid; gap: 16px; min-width: 0; }
          .writer-ad-placement-right { position: sticky; top: 86px; }
          .writer-ad-placement-card { padding: 16px; }
          .writer-ad-placement-card h3 {
            margin: 0;
            color: #1d2025;
            font-size: 17px;
            line-height: 1.3;
            font-weight: 800;
          }
          .writer-ad-placement-card-copy {
            margin: 5px 0 0;
            color: #727b86;
            font-size: 13px;
            line-height: 1.45;
          }
          .writer-ad-placement-setup-grid {
            display: grid;
            grid-template-columns: 1fr 1.2fr 1fr;
            gap: 12px;
            margin-top: 16px;
          }
          .writer-ad-placement-field label {
            display: block;
            margin: 0 0 7px;
            color: #606975;
            font-size: 12px;
            line-height: 1.3;
            font-weight: 600;
          }
          .writer-ad-placement-field select,
          .writer-ad-placement-field input {
            width: 100%;
            height: 42px;
            padding: 0 12px;
            border: 1px solid #d8dde2;
            border-radius: 8px;
            background: #fff;
            color: #1d2025;
            font: inherit;
            font-size: 13px;
            outline: none;
          }
          .writer-ad-placement-field select:focus,
          .writer-ad-placement-field input:focus { border-color: #89919b; }
          .writer-ad-placement-group-head { margin-bottom: 12px; }
          .writer-ad-placement-toggle-list { display: grid; gap: 7px; }
          .writer-ad-placement-toggle-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            min-height: 66px;
            padding: 10px 12px;
            border: 1px solid #dfe3e6;
            border-radius: 8px;
            background: #fff;
          }
          .writer-ad-placement-toggle-copy { min-width: 0; }
          .writer-ad-placement-toggle-copy strong {
            display: block;
            color: #1d2025;
            font-size: 14px;
            line-height: 1.35;
            font-weight: 700;
          }
          .writer-ad-placement-toggle-copy span {
            display: block;
            margin-top: 3px;
            color: #737c87;
            font-size: 12px;
            line-height: 1.4;
          }
          .writer-ad-placement-switch {
            position: relative;
            width: 42px;
            height: 24px;
            flex: 0 0 42px;
            padding: 0;
            border: 0;
            border-radius: 999px;
            background: #d6dce2;
            cursor: pointer;
          }
          .writer-ad-placement-switch::after {
            content: '';
            position: absolute;
            top: 3px;
            left: 3px;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #fff;
            box-shadow: 0 1px 2px rgba(0,0,0,.16);
            transition: left .15s ease;
          }
          .writer-ad-placement-switch.on { background: #1c1f24; }
          .writer-ad-placement-switch.on::after { left: 21px; }
          .writer-ad-placement-preview-tabs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: 12px;
          }
          .writer-ad-placement-preview-tab {
            height: 34px;
            border: 1px solid #dfe3e6;
            border-radius: 7px;
            background: #fff;
            color: #1d2025;
            font: inherit;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
          }
          .writer-ad-placement-preview-tab.active {
            border-color: #1c1f24;
            background: #1c1f24;
            color: #fff;
          }
          .writer-ad-placement-preview-canvas { margin-top: 14px; }
          .writer-ad-placement-preview-label {
            margin-bottom: 8px;
            color: #8a929d;
            font-size: 11px;
            line-height: 1.3;
            font-weight: 800;
            text-transform: uppercase;
          }
          .writer-ad-placement-preview-slot {
            display: grid;
            place-items: center;
            min-height: 54px;
            padding: 10px;
            border-radius: 7px;
            background: #1c1f24;
            color: #fff;
            text-align: center;
            font-size: 12px;
            line-height: 1.35;
            font-weight: 600;
          }
          .writer-ad-placement-preview-slot.soft {
            border: 1px solid #dfe3e6;
            background: #edf4fc;
            color: #265c9e;
          }
          .writer-ad-placement-preview-slot.off {
            border: 1px solid #dfe3e6;
            background: #fff;
            color: #9aa2ac;
          }
          .writer-ad-placement-preview-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 94px;
            gap: 9px;
            margin-top: 9px;
          }
          .writer-ad-placement-preview-stack { display: grid; gap: 9px; }
          .writer-ad-placement-rule-list {
            display: grid;
            gap: 10px;
            margin: 14px 0 0;
            padding: 0;
            list-style: none;
          }
          .writer-ad-placement-rule-list li {
            position: relative;
            padding-left: 18px;
            color: #3f4751;
            font-size: 12px;
            line-height: 1.45;
          }
          .writer-ad-placement-rule-list li::before {
            content: '';
            position: absolute;
            top: 7px;
            left: 0;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #a5adb6;
          }
          .writer-ad-placement-rule-list li:first-child::before { background: #1c1f24; }
          .writer-ad-placement-loading {
            margin-top: 12px;
            color: #68717d;
            font-size: 13px;
            font-weight: 600;
          }
          @media (max-width: 1180px) {
            .writer-ad-placement-grid { grid-template-columns: minmax(0, 1.35fr) minmax(310px, .9fr); }
            .writer-ad-placement-setup-grid { grid-template-columns: 1fr 1fr; }
            .writer-ad-placement-field:first-child { grid-column: 1 / -1; }
          }
          @media (max-width: 991px) {
            .writer-ad-placement-page {
              width: calc(100% + 18px);
              margin-left: -9px;
              margin-right: -9px;
            }
            .writer-ad-placement-head { gap: 12px; margin-bottom: 14px; }
            .writer-ad-placement-eyebrow { display: none; }
            .writer-ad-placement-head h2 { font-size: 20px; }
            .writer-ad-placement-subtitle { margin-top: 5px; font-size: 12px; line-height: 1.4; }
            .writer-ad-placement-save { min-width: 68px; height: 38px; padding: 0 14px; font-size: 13px; }
            .writer-ad-placement-stats { grid-template-columns: 1fr 1fr; gap: 10px; }
            .writer-ad-placement-stat { min-height: 82px; padding: 12px; }
            .writer-ad-placement-stat.template { display: none; }
            .writer-ad-placement-stat span { font-size: 12px; }
            .writer-ad-placement-stat strong { font-size: 18px; }
            .writer-ad-placement-stat small { font-size: 12px; }
            .writer-ad-placement-grid { display: block; }
            .writer-ad-placement-left,
            .writer-ad-placement-right { gap: 12px; }
            .writer-ad-placement-right { position: static; margin-top: 12px; }
            .writer-ad-placement-card { padding: 12px; border-radius: 9px; }
            .writer-ad-placement-card h3 { font-size: 16px; }
            .writer-ad-placement-card-copy { font-size: 12px; line-height: 1.45; }
            .writer-ad-placement-setup-grid { grid-template-columns: 1fr 110px; gap: 9px; margin-top: 14px; }
            .writer-ad-placement-field:first-child { grid-column: 1 / -1; }
            .writer-ad-placement-field label { font-size: 12px; }
            .writer-ad-placement-field select,
            .writer-ad-placement-field input { height: 42px; font-size: 13px; }
            .writer-ad-placement-toggle-list { gap: 7px; }
            .writer-ad-placement-toggle-row { min-height: 68px; padding: 10px 12px; }
            .writer-ad-placement-toggle-copy strong { font-size: 14px; }
            .writer-ad-placement-toggle-copy span { font-size: 12px; }
            .writer-ad-placement-preview-row { grid-template-columns: minmax(0, 1fr) 94px; }
            .writer-ad-placement-rule-list li { font-size: 12px; }
          }
          @media (max-width: 420px) {
            .writer-ad-placement-page { width: calc(100% + 18px); }
            .writer-ad-placement-head h2 { font-size: 19px; }
            .writer-ad-placement-subtitle { max-width: 235px; }
          }
        `}),e.jsxs("div",{className:"writer-ad-placement-head",children:[e.jsxs("div",{children:[e.jsx("p",{className:"writer-ad-placement-eyebrow",children:"Monetization"}),e.jsx("h2",{children:"Ad placement"}),e.jsx("p",{className:"writer-ad-placement-subtitle",children:"Choose where ads can appear across your storefront and post pages. Changes are saved to your current monetization settings."}),g?e.jsx("p",{className:"writer-ad-placement-feedback ok",children:g}):null,x?e.jsx("p",{className:"writer-ad-placement-feedback error",children:x}):null]}),e.jsx("button",{className:"writer-ad-placement-save",type:"submit",disabled:f||m,children:f?"Saving...":"Save placement"})]}),u?e.jsx("div",{className:"writer-ad-placement-alert",children:u}):null,e.jsxs("div",{className:"writer-ad-placement-stats",children:[e.jsxs("div",{className:"writer-ad-placement-stat",children:[e.jsx("span",{children:"Current mode"}),e.jsx("strong",{children:w?"Platform monetization":"Individual monetization"}),e.jsx("small",{children:w?"Bloggad managed ads":"Your own ad setup"})]}),e.jsxs("div",{className:"writer-ad-placement-stat",children:[e.jsx("span",{children:"Active placements"}),e.jsxs("strong",{children:[j," / 7"]}),e.jsx("small",{children:j===7?"All placement slots enabled":String(7-j)+" placement slots off"})]}),e.jsxs("div",{className:"writer-ad-placement-stat template",children:[e.jsx("span",{children:"Template preview"}),e.jsx("strong",{children:I}),e.jsx("small",{children:"Preview follows supported slots"})]})]}),e.jsxs("div",{className:"writer-ad-placement-grid",children:[e.jsxs("div",{className:"writer-ad-placement-left",children:[e.jsxs("section",{className:"writer-ad-placement-card",children:[e.jsx("h3",{children:"Placement setup"}),e.jsx("p",{className:"writer-ad-placement-card-copy",children:"Set the monetization mode and preview context before choosing individual ad slots."}),m?e.jsx("div",{className:"writer-ad-placement-loading",children:"Loading your saved placement settings..."}):null,e.jsxs("div",{className:"writer-ad-placement-setup-grid",children:[e.jsxs("div",{className:"writer-ad-placement-field",children:[e.jsx("label",{children:"Monetization mode"}),e.jsxs("select",{value:r.monetization_mode,onChange:a=>c("monetization_mode",a.target.value),disabled:m,children:[e.jsx("option",{value:"individual",children:"Individual monetization"}),e.jsx("option",{value:"platform",children:"Platform monetization"})]})]}),e.jsxs("div",{className:"writer-ad-placement-field",children:[e.jsx("label",{children:"Selected template"}),e.jsxs("select",{value:r.selected_template,onChange:a=>c("selected_template",a.target.value),disabled:m,children:[e.jsx("option",{value:"current-template",children:"Current active template"}),e.jsx("option",{value:"minimal-template",children:"Minimal template"}),e.jsx("option",{value:"electronics-template",children:"Electronics template"})]})]}),e.jsxs("div",{className:"writer-ad-placement-field",children:[e.jsx("label",{children:"Middle insert after"}),e.jsx("input",{value:r.post_middle_insert_after,onChange:a=>c("post_middle_insert_after",a.target.value),placeholder:"2",disabled:m})]})]})]}),C.map(a=>e.jsxs("section",{className:"writer-ad-placement-card",children:[e.jsxs("div",{className:"writer-ad-placement-group-head",children:[e.jsx("h3",{children:a.title}),e.jsx("p",{className:"writer-ad-placement-card-copy",children:a.title==="Storefront placements"?"Control positions on the storefront homepage. Unsupported template slots remain hidden.":"Choose positions inside detailed blog posts. The middle slot uses the selected paragraph insertion point when supported."})]}),e.jsx("div",{className:"writer-ad-placement-toggle-list",children:a.items.map(i=>{const n=Number(r[i.key])===1;return e.jsxs("div",{className:"writer-ad-placement-toggle-row",children:[e.jsxs("div",{className:"writer-ad-placement-toggle-copy",children:[e.jsx("strong",{children:i.label}),e.jsx("span",{children:i.helper})]}),e.jsx("button",{className:"writer-ad-placement-switch"+(n?" on":""),type:"button",role:"switch","aria-checked":n,"aria-label":i.label,onClick:()=>c(i.key,n?0:1),disabled:m})]},i.key)})})]},a.title))]}),e.jsxs("div",{className:"writer-ad-placement-right",children:[e.jsxs("section",{className:"writer-ad-placement-card",children:[e.jsx("h3",{children:"Placement preview"}),e.jsx("p",{className:"writer-ad-placement-card-copy",children:"A guide to where enabled slots can appear. Actual placement depends on template support."}),e.jsxs("div",{className:"writer-ad-placement-preview-tabs",children:[e.jsx("button",{className:"writer-ad-placement-preview-tab"+(_==="storefront"?" active":""),type:"button",onClick:()=>P("storefront"),children:"Storefront"}),e.jsx("button",{className:"writer-ad-placement-preview-tab"+(_==="post"?" active":""),type:"button",onClick:()=>P("post"),children:"Post detail"})]}),_==="storefront"?e.jsxs("div",{className:"writer-ad-placement-preview-canvas",children:[e.jsx("div",{className:"writer-ad-placement-preview-label",children:"Storefront"}),e.jsx("div",{className:"writer-ad-placement-preview-slot"+(Number(r.storefront_top_enabled)?"":" off"),children:Number(r.storefront_top_enabled)?"Storefront top slot":"Storefront top off"}),e.jsxs("div",{className:"writer-ad-placement-preview-row",children:[e.jsx("div",{className:"writer-ad-placement-preview-slot soft",children:"Main storefront content"}),e.jsx("div",{className:"writer-ad-placement-preview-slot"+(Number(r.storefront_sidebar_enabled)?" soft":" off"),children:Number(r.storefront_sidebar_enabled)?"Sidebar slot":"Sidebar off"})]}),e.jsx("div",{className:"writer-ad-placement-preview-slot"+(Number(r.storefront_bottom_enabled)?" soft":" off"),style:{marginTop:9},children:Number(r.storefront_bottom_enabled)?"Storefront bottom slot":"Storefront bottom off"})]}):e.jsxs("div",{className:"writer-ad-placement-preview-canvas",children:[e.jsx("div",{className:"writer-ad-placement-preview-label",children:"Post detail"}),e.jsx("div",{className:"writer-ad-placement-preview-slot"+(Number(r.post_top_enabled)?"":" off"),children:Number(r.post_top_enabled)?"Post top slot":"Post top off"}),e.jsxs("div",{className:"writer-ad-placement-preview-stack",style:{marginTop:9},children:[e.jsx("div",{className:"writer-ad-placement-preview-slot soft",children:"Article content"}),e.jsx("div",{className:"writer-ad-placement-preview-slot"+(Number(r.post_middle_enabled)?" soft":" off"),children:Number(r.post_middle_enabled)?"Post middle after paragraph "+r.post_middle_insert_after:"Post middle off"}),e.jsx("div",{className:"writer-ad-placement-preview-slot soft",children:"Article content continues"}),e.jsx("div",{className:"writer-ad-placement-preview-slot"+(Number(r.post_bottom_enabled)?" soft":" off"),children:Number(r.post_bottom_enabled)?"Post bottom slot":"Post bottom off"}),e.jsx("div",{className:"writer-ad-placement-preview-slot"+(Number(r.post_sidebar_enabled)?" soft":" off"),children:Number(r.post_sidebar_enabled)?"Post sidebar slot":"Post sidebar off"})]})]})]}),e.jsxs("section",{className:"writer-ad-placement-card",children:[e.jsx("h3",{children:"Slot rules"}),e.jsx("p",{className:"writer-ad-placement-card-copy",children:"These rules come from the current placement behavior."}),e.jsxs("ul",{className:"writer-ad-placement-rule-list",children:[e.jsx("li",{children:"Storefront slots appear only on storefront pages."}),e.jsx("li",{children:"Post slots appear only on detailed blog post pages."}),e.jsx("li",{children:"Post middle uses the chosen paragraph insertion point when supported."}),e.jsx("li",{children:"Only positions supported by the current template can display an ad."}),e.jsx("li",{children:"Saved settings determine which approved ads may show in each slot."})]})]})]})]})]}):e.jsxs("div",{style:{display:"grid",gap:24},children:[e.jsx("section",{style:{...b(),background:"linear-gradient(135deg, rgba(17,24,39,1) 0%, rgba(31,41,55,1) 55%, rgba(55,65,81,1) 100%)",color:"#ffffff"},children:e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"minmax(0, 1.2fr) minmax(280px, 0.8fr)",gap:18,alignItems:"center"},children:[e.jsxs("div",{children:[e.jsx("div",{style:{display:"inline-flex",alignItems:"center",minHeight:32,padding:"0 12px",borderRadius:999,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14},children:"Ad Placement"}),e.jsx("h1",{style:{margin:0,fontSize:32,lineHeight:1.15,fontWeight:900},children:"Choose exactly where ads should appear on storefront and post pages"}),e.jsx("p",{style:{margin:"12px 0 0",maxWidth:760,color:"rgba(255,255,255,0.82)",fontSize:15,lineHeight:1.7},children:"Manage the positions where your ads should display across your storefront and blog post pages. Your saved choices will be used for the monetization mode you select."})]}),e.jsxs("div",{style:{display:"grid",gap:14},children:[e.jsxs("div",{style:{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:18,padding:16},children:[e.jsx("div",{style:{fontSize:12,color:"rgba(255,255,255,0.7)",marginBottom:8},children:"Current Mode"}),e.jsx("div",{style:E(w?"info":"success"),children:w?"Platform Monetization":"Individual Monetization"})]}),e.jsxs("div",{style:{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:18,padding:16},children:[e.jsx("div",{style:{fontSize:12,color:"rgba(255,255,255,0.7)",marginBottom:8},children:"Save Status"}),e.jsx("div",{style:{fontSize:22,fontWeight:900},children:f?"Saving...":"Ready"})]})]})]})}),u?e.jsx("section",{style:b(),children:e.jsx("div",{style:{padding:14,borderRadius:14,background:"#fef3f2",border:"1px solid #fecdca",color:"#b42318",fontSize:14,fontWeight:700,lineHeight:1.6},children:u})}):null,e.jsxs("section",{style:{display:"grid",gridTemplateColumns:"minmax(0, 1.15fr) minmax(320px, 0.85fr)",gap:24,alignItems:"start"},children:[e.jsxs("form",{onSubmit:T,style:{display:"grid",gap:24},children:[e.jsxs("div",{style:b(),children:[e.jsxs("div",{style:{marginBottom:18},children:[e.jsx("h2",{style:{margin:0,fontSize:22,fontWeight:900,color:"#111827"},children:"Placement Controls"}),e.jsx("p",{style:{margin:"8px 0 0",color:"#6b7280",fontSize:14,lineHeight:1.6},children:"Turn ad positions on or off based on where you want ads to appear in your selected layout."})]}),m?e.jsx("div",{style:{padding:14,borderRadius:14,background:"#f9fafb",border:"1px solid #eef2f7",color:"#6b7280",fontSize:14,fontWeight:700},children:"Loading your saved ad placement settings..."}):null,e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",gap:16,marginBottom:18},children:[e.jsxs("div",{children:[e.jsx("label",{style:S(),children:"Monetization mode"}),e.jsxs("select",{style:R(),value:r.monetization_mode,onChange:a=>c("monetization_mode",a.target.value),children:[e.jsx("option",{value:"individual",children:"Individual monetization"}),e.jsx("option",{value:"platform",children:"Platform monetization"})]})]}),e.jsxs("div",{children:[e.jsx("label",{style:S(),children:"Selected template"}),e.jsxs("select",{style:R(),value:r.selected_template,onChange:a=>c("selected_template",a.target.value),children:[e.jsx("option",{value:"current-template",children:"Current active template"}),e.jsx("option",{value:"minimal-template",children:"Minimal template"}),e.jsx("option",{value:"electronics-template",children:"Electronics template"})]})]}),e.jsxs("div",{children:[e.jsx("label",{style:S(),children:"Post middle insert after paragraph"}),e.jsx("input",{style:A(),value:r.post_middle_insert_after,onChange:a=>c("post_middle_insert_after",a.target.value),placeholder:"2"})]})]}),C.map(a=>e.jsxs("div",{style:{marginTop:10},children:[e.jsx("div",{style:{fontSize:16,fontWeight:900,color:"#111827",marginBottom:6},children:a.title}),e.jsx("div",{style:{display:"grid",gap:0},children:a.items.map((i,n)=>{const o=F(i.label,Number(r[i.key]),l=>c(i.key,l),i.helper);return n===a.items.length-1?e.jsx("div",{style:{borderBottom:"1px solid #eef2f7"},children:o},i.key):e.jsx("div",{children:o},i.key)})})]},a.title)),e.jsxs("div",{style:{marginTop:18,display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"},children:[e.jsx("button",{type:"submit",disabled:f,style:{minWidth:170,height:46,borderRadius:14,border:0,background:f?"#93c5fd":"#111827",color:"#ffffff",fontSize:14,fontWeight:900,cursor:f?"not-allowed":"pointer"},children:f?"Saving...":"Save Placement"}),g?e.jsx("div",{style:{fontSize:14,color:"#027a48",fontWeight:800},children:g}):null,x?e.jsx("div",{style:{fontSize:14,color:"#b42318",fontWeight:800},children:x}):null]})]}),e.jsxs("div",{style:b(),children:[e.jsxs("div",{style:{marginBottom:18},children:[e.jsx("h2",{style:{margin:0,fontSize:22,fontWeight:900,color:"#111827"},children:"Slot Rules"}),e.jsx("p",{style:{margin:"8px 0 0",color:"#6b7280",fontSize:14,lineHeight:1.6},children:"These rules help the layout know where and when ads should render."})]}),e.jsx("div",{style:{display:"grid",gap:12},children:["Storefront slots should appear only on storefront pages.","Post slots should appear only on detailed blog post pages.","Post middle slot should use the chosen paragraph insertion point when supported.","If your selected layout has no sidebar, sidebar ad positions will not display.","Your saved settings decide which approved ads should show in each slot."].map(a=>e.jsx("div",{style:{padding:14,borderRadius:16,background:"#f9fafb",border:"1px solid #eef2f7",color:"#374151",fontSize:14,lineHeight:1.6,fontWeight:600},children:a},a))})]})]}),e.jsxs("div",{style:{display:"grid",gap:24},children:[e.jsxs("div",{style:b(),children:[e.jsx("h3",{style:{margin:0,fontSize:20,fontWeight:900,color:"#111827"},children:"Placement Preview Guide"}),e.jsxs("div",{style:{marginTop:16,display:"grid",gap:14},children:[e.jsxs("div",{style:{border:"1px dashed #cbd5e1",borderRadius:18,padding:16,background:"#f8fafc"},children:[e.jsx("div",{style:{fontWeight:900,color:"#111827",marginBottom:10},children:"Storefront page"}),e.jsx("div",{style:p("#111827","#ffffff")}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"minmax(0, 1fr) 220px",gap:12,marginTop:12},children:[e.jsx("div",{style:p("#e5e7eb","#111827")}),e.jsx("div",{style:p("#dbeafe","#1d4ed8")})]}),e.jsx("div",{style:{...p("#ede9fe","#6d28d9"),marginTop:12}})]}),e.jsxs("div",{style:{border:"1px dashed #cbd5e1",borderRadius:18,padding:16,background:"#f8fafc"},children:[e.jsx("div",{style:{fontWeight:900,color:"#111827",marginBottom:10},children:"Post detail page"}),e.jsx("div",{style:p("#111827","#ffffff")}),e.jsx("div",{style:{...p("#e5e7eb","#111827"),marginTop:12}}),e.jsx("div",{style:{...p("#dbeafe","#1d4ed8"),marginTop:12}}),e.jsx("div",{style:{...p("#e5e7eb","#111827"),marginTop:12}}),e.jsx("div",{style:{...p("#ede9fe","#6d28d9"),marginTop:12}})]})]})]}),e.jsxs("div",{style:b(),children:[e.jsx("h3",{style:{margin:0,fontSize:20,fontWeight:900,color:"#111827"},children:"Important Note"}),e.jsx("div",{style:{marginTop:16,padding:14,borderRadius:16,background:"#eff8ff",border:"1px solid #b2ddff",color:"#175cd3",fontSize:14,fontWeight:700,lineHeight:1.6},children:"Ads will display only in positions supported by your current template. Some placements, like sidebar ads, may not appear if that layout is not available. If you use your own ad account, your provider pays you directly."})]})]})]})]})}export{G as default};
