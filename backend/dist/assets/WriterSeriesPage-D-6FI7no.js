import{r as d,j as e,a as v}from"./index-D7wY-Nn2.js";import{f as B}from"./WorkspaceUi-Gqyyxdbb.js";const E={title:"",slug:"",description:"",cover_image:"",series_type:"series",status:"draft"},W={post_id:"",season_number:"",episode_number:"",sort_order:0};function Q(r){return{title:r.title,slug:r.slug,description:r.description,cover_image:r.cover_image,series_type:r.series_type,status:r.status}}function ne(r){return r!=null&&r.scheduled_at?`Scheduled ${B(r.scheduled_at)}`:r!=null&&r.published_at?`Published ${B(r.published_at)}`:"Not scheduled"}function R(r){const m=String(r||"series").toLowerCase();return m.charAt(0).toUpperCase()+m.slice(1)}function $(r){const m=String(r||"draft").toLowerCase();return m.charAt(0).toUpperCase()+m.slice(1)}function le(r){var m,z,P;return((m=r==null?void 0:r.file)==null?void 0:m.url)||((z=r==null?void 0:r.data)==null?void 0:z.image_url)||((P=r==null?void 0:r.data)==null?void 0:P.url)||(r==null?void 0:r.image_url)||(r==null?void 0:r.url)||""}function de(){const[r,m]=d.useState([]),[z,P]=d.useState([]),[o,C]=d.useState(""),[l,D]=d.useState(null),[y,f]=d.useState(E),[N,u]=d.useState(E),[w,g]=d.useState(W),[S,U]=d.useState(""),[x,h]=d.useState(""),[M,p]=d.useState(""),[O,c]=d.useState(""),[j,b]=d.useState(""),[k,X]=d.useState("");async function V(s=""){const{data:t}=await v.get("/api/affiliate/series"),n=Array.isArray(t==null?void 0:t.series)?t.series:Array.isArray(t==null?void 0:t.items)?t.items:[];m(n);const i=String(s||"");if(i&&n.some(a=>String(a.id)===i)){C(i);return}!o&&n[0]?C(String(n[0].id)):o&&!n.some(a=>String(a.id)===String(o))&&C(n[0]?String(n[0].id):"")}async function Y(){try{const{data:s}=await v.get("/api/affiliate/posts"),t=Array.isArray(s==null?void 0:s.posts)&&s.posts||Array.isArray(s==null?void 0:s.items)&&s.items||Array.isArray(s==null?void 0:s.data)&&s.data||[];P(t)}catch{P([])}}async function I(s){var t,n;if(!s){D(null),u(E),g(W),U("");return}try{p("");const{data:i}=await v.get(`/api/affiliate/series/${s}`),a=(i==null?void 0:i.series)||null;D(a),a&&u({title:a.title||"",slug:a.slug||"",description:a.description||"",cover_image:a.cover_image||"",series_type:a.series_type||"series",status:a.status||"draft"})}catch(i){D(null),p(((n=(t=i==null?void 0:i.response)==null?void 0:t.data)==null?void 0:n.message)||"Failed to load Writer series details.")}}async function F(s=""){var t,n;try{p(""),await V(s)}catch(i){p(((n=(t=i==null?void 0:i.response)==null?void 0:t.data)==null?void 0:n.message)||"Failed to load Writer series.")}}d.useEffect(()=>{F(),Y()},[]),d.useEffect(()=>{I(o)},[o]);function A(){b(""),S&&(U(""),g(W))}function Z(){f(E),b("create")}function G(){l&&(u({title:l.title||"",slug:l.slug||"",description:l.description||"",cover_image:l.cover_image||"",series_type:l.series_type||"series",status:l.status||"draft"}),b("edit-series"))}function H(){l&&(U(""),g(W),b("placement"))}async function J(s,t){var n,i;if(s){if(!String(s.type||"").startsWith("image/")){p("Choose a valid image file.");return}try{X(t),p(""),c("");const a=new FormData;a.append("image",s);const _=await v.post("/api/uploads/template-image",a,{headers:{"Content-Type":"multipart/form-data"}}),T=le(_==null?void 0:_.data);if(!T)throw new Error("Upload worked but no image URL was returned.");t==="create"?f(q=>({...q,cover_image:T})):u(q=>({...q,cover_image:T})),c("Cover image uploaded successfully.")}catch(a){p(((i=(n=a==null?void 0:a.response)==null?void 0:n.data)==null?void 0:i.message)||(a==null?void 0:a.message)||"Failed to upload cover image.")}finally{X("")}}}async function ee(s){var t,n,i;s.preventDefault();try{h("create"),p(""),c("");const{data:a}=await v.post("/api/affiliate/series",Q(y));f(E),c((a==null?void 0:a.message)||"Writer series created successfully."),await F(((t=a==null?void 0:a.series)==null?void 0:t.id)||(a==null?void 0:a.id)||""),b("")}catch(a){p(((i=(n=a==null?void 0:a.response)==null?void 0:n.data)==null?void 0:i.message)||"Failed to create Writer series.")}finally{h("")}}async function se(s){var t,n;if(s.preventDefault(),!!o)try{h("update-series"),p(""),c("");const{data:i}=await v.put(`/api/affiliate/series/${o}`,Q(N));c((i==null?void 0:i.message)||"Writer series updated successfully."),await F(o),await I(o),b("")}catch(i){p(((n=(t=i==null?void 0:i.response)==null?void 0:t.data)==null?void 0:n.message)||"Failed to update Writer series.")}finally{h("")}}async function te(s){var t,n;if(!(!s||!window.confirm("Delete this Writer series and its series placements?")))try{h("delete-series"),p(""),c("");const{data:i}=await v.delete(`/api/affiliate/series/${s}`);c((i==null?void 0:i.message)||"Writer series deleted successfully."),String(o)===String(s)&&(C(""),D(null)),b(""),await F()}catch(i){p(((n=(t=i==null?void 0:i.response)==null?void 0:t.data)==null?void 0:n.message)||"Failed to delete Writer series.")}finally{h("")}}function ie(s){U(String(s.post_id)),g({post_id:String(s.post_id),season_number:s.season_number??"",episode_number:s.episode_number??"",sort_order:Number(s.sort_order||0)}),b("placement")}function K(){U(""),g(W)}async function re(s){var n,i;if(s.preventDefault(),!o)return;const t=Number(w.post_id);if(!Number.isInteger(t)||t<=0){p("Choose a valid Writer post before saving its series placement.");return}try{h("save-placement"),p(""),c("");const a={post_id:t,season_number:w.season_number===""?null:Math.max(1,Number(w.season_number)||1),episode_number:w.episode_number===""?null:Math.max(1,Number(w.episode_number)||1),sort_order:Math.max(0,Number(w.sort_order)||0)},{data:_}=await v.post(`/api/affiliate/series/${o}/items`,a);c((_==null?void 0:_.message)||"Series placement saved."),K(),await I(o),await F(o),b("")}catch(a){p(((i=(n=a==null?void 0:a.response)==null?void 0:n.data)==null?void 0:i.message)||"Failed to save series placement.")}finally{h("")}}async function ae(s){var t,n;if(!(!o||!s||!window.confirm("Remove this post from the selected series?")))try{h(`remove-${s}`),p(""),c("");const{data:i}=await v.delete(`/api/affiliate/series/${o}/items/${s}`);c((i==null?void 0:i.message)||"Post removed from Writer series."),String(S)===String(s)&&K(),await I(o),await F(o)}catch(i){p(((n=(t=i==null?void 0:i.response)==null?void 0:t.data)==null?void 0:n.message)||"Failed to remove series placement.")}finally{h("")}}const L=Array.isArray(l==null?void 0:l.items)?l.items:[];return e.jsxs("div",{className:"writer-series-page",children:[e.jsx("style",{children:`
        .writer-series-page,
        .writer-series-page * {
          box-sizing: border-box;
        }

        .writer-series-page {
          width: 100%;
          max-width: 1180px;
          color: #17191f;
        }

        .wsp-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 14px;
        }

        .wsp-count {
          min-height: 30px;
          display: inline-flex;
          align-items: center;
          border: 1px solid #dfe3e6;
          border-radius: 999px;
          background: #ffffff;
          color: #2f343c;
          font-size: 11px;
          font-weight: 800;
          padding: 0 12px;
        }

        .wsp-btn {
          min-height: 38px;
          border: 1px solid #d9dde2;
          border-radius: 9px;
          background: #ffffff;
          color: #25282e;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 750;
          padding: 0 15px;
        }

        .wsp-btn:hover:not(:disabled) {
          border-color: #afb5bd;
          background: #f8f9fa;
        }

        .wsp-btn.primary {
          border-color: #1c1f24;
          background: #1c1f24;
          color: #ffffff;
        }

        .wsp-btn.primary:hover:not(:disabled) {
          background: #111318;
        }

        .wsp-btn.danger {
          border-color: #efcaca;
          background: #fffafa;
          color: #a33232;
        }

        .wsp-btn:disabled {
          cursor: default;
          opacity: 0.55;
        }

        .wsp-alert {
          margin-bottom: 12px;
          border: 1px solid #dfe3e6;
          border-radius: 10px;
          background: #ffffff;
          font-size: 12px;
          line-height: 1.45;
          padding: 11px 13px;
        }

        .wsp-alert.error {
          border-color: #ebcaca;
          background: #fffafa;
          color: #8e2d2d;
        }

        .wsp-alert.success {
          border-color: #d4e6da;
          background: #fbfefc;
          color: #2f6940;
        }

        .wsp-panel {
          border: 1px solid #dfe3e6;
          border-radius: 14px;
          background: #ffffff;
        }

        .wsp-series-table {
          overflow: hidden;
          margin-bottom: 14px;
        }

        .wsp-table-head,
        .wsp-table-row {
          display: grid;
          grid-template-columns: minmax(220px, 1.8fr) 110px 110px 90px 120px 90px;
          align-items: center;
          column-gap: 14px;
        }

        .wsp-table-head {
          min-height: 42px;
          background: #f7f8f9;
          color: #737b86;
          font-size: 10px;
          font-weight: 800;
          padding: 0 16px;
        }

        .wsp-table-row {
          min-height: 66px;
          border-top: 1px solid #e7e9ec;
          padding: 10px 16px;
        }

        .wsp-table-row:first-of-type {
          border-top: 0;
        }

        .wsp-table-row.is-selected {
          background: #fafbfb;
        }

        .wsp-series-name {
          min-width: 0;
          color: #25282e;
          font-size: 12px;
          font-weight: 800;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .wsp-cell {
          color: #6f7782;
          font-size: 11px;
          line-height: 1.35;
        }

        .wsp-cell.strong {
          color: #25282e;
          font-weight: 750;
        }

        .wsp-series-action {
          display: flex;
          justify-content: flex-end;
        }

        .wsp-series-action .wsp-btn {
          min-width: 72px;
          min-height: 32px;
          padding: 0 10px;
          font-size: 10px;
        }

        .wsp-mobile-series {
          display: none;
        }

        .wsp-selected {
          min-height: 74px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 14px;
          padding: 14px 16px;
        }

        .wsp-selected-copy {
          min-width: 0;
        }

        .wsp-selected-title {
          margin: 0;
          color: #25282e;
          font-size: 14px;
          font-weight: 800;
          line-height: 1.35;
        }

        .wsp-selected-meta {
          margin: 4px 0 0;
          color: #737b86;
          font-size: 11px;
          line-height: 1.4;
        }

        .wsp-selected-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .wsp-items {
          padding: 14px 16px 4px;
        }

        .wsp-items-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }

        .wsp-items-head h2 {
          margin: 0;
          color: #25282e;
          font-size: 13px;
          font-weight: 800;
        }

        .wsp-items-count {
          min-height: 28px;
          display: inline-flex;
          align-items: center;
          border: 1px solid #dfe3e6;
          border-radius: 999px;
          color: #525a64;
          font-size: 10px;
          font-weight: 800;
          padding: 0 10px;
        }

        .wsp-item-row {
          min-height: 84px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          border-top: 1px solid #e7e9ec;
          padding: 12px 0;
        }

        .wsp-item-row:first-of-type {
          border-top: 0;
        }

        .wsp-item-copy {
          min-width: 0;
        }

        .wsp-item-title {
          margin: 0;
          color: #25282e;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.35;
        }

        .wsp-item-meta,
        .wsp-item-time {
          margin: 3px 0 0;
          color: #737b86;
          font-size: 10px;
          line-height: 1.4;
        }

        .wsp-item-actions {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-shrink: 0;
        }

        .wsp-item-actions .wsp-btn {
          min-height: 32px;
          padding: 0 12px;
          font-size: 10px;
        }

        .wsp-empty {
          min-height: 170px;
          display: grid;
          place-items: center;
          color: #737b86;
          font-size: 12px;
          text-align: center;
          padding: 24px;
        }

        .wsp-drawer-backdrop {
          position: fixed;
          inset: 0;
          z-index: 80;
          border: 0;
          background: rgba(23, 25, 31, 0.12);
        }

        .wsp-drawer {
          position: fixed;
          top: 0;
          right: 0;
          z-index: 90;
          width: min(390px, 92vw);
          height: 100vh;
          display: flex;
          flex-direction: column;
          border-left: 1px solid #dfe3e6;
          background: #ffffff;
          box-shadow: -16px 0 48px rgba(23, 25, 31, 0.08);
        }

        .wsp-drawer-head {
          min-height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          border-bottom: 1px solid #e7e9ec;
          padding: 0 16px;
        }

        .wsp-drawer-head h2 {
          margin: 0;
          color: #25282e;
          font-size: 14px;
          font-weight: 800;
        }

        .wsp-close {
          width: 36px;
          height: 36px;
          display: inline-grid;
          place-items: center;
          border: 1px solid #dfe3e6;
          border-radius: 8px;
          background: #ffffff;
          color: #25282e;
          cursor: pointer;
          font: inherit;
          font-weight: 800;
        }

        .wsp-drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .wsp-form {
          display: grid;
          gap: 14px;
        }

        .wsp-field {
          display: grid;
          gap: 6px;
        }

        .wsp-field label {
          color: #606873;
          font-size: 10px;
          font-weight: 750;
        }

        .wsp-input,
        .wsp-select,
        .wsp-textarea {
          width: 100%;
          border: 1px solid #d9dde2;
          border-radius: 8px;
          background: #ffffff;
          color: #25282e;
          font: inherit;
          font-size: 12px;
          outline: none;
          padding: 0 11px;
        }

        .wsp-input,
        .wsp-select {
          min-height: 40px;
        }

        .wsp-textarea {
          min-height: 82px;
          resize: vertical;
          padding-top: 10px;
          padding-bottom: 10px;
        }

        .wsp-input:focus,
        .wsp-select:focus,
        .wsp-textarea:focus {
          border-color: #757c85;
        }

        .wsp-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .wsp-cover-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 8px;
          align-items: center;
        }

        .wsp-upload-btn {
          min-width: 84px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          user-select: none;
        }

        .wsp-upload-btn.disabled {
          pointer-events: none;
          opacity: 0.55;
        }

        .wsp-file-input {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          clip-path: inset(50%);
          white-space: nowrap;
        }

        .wsp-form-help {
          color: #7a828d;
          font-size: 10px;
          line-height: 1.45;
        }

        .wsp-selected-mini {
          border-radius: 9px;
          background: #f5f6f7;
          padding: 11px 12px;
        }

        .wsp-selected-mini strong {
          display: block;
          color: #25282e;
          font-size: 11px;
          line-height: 1.35;
        }

        .wsp-selected-mini span {
          display: block;
          margin-top: 3px;
          color: #737b86;
          font-size: 10px;
          line-height: 1.4;
        }

        .wsp-drawer-foot {
          min-height: 72px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          border-top: 1px solid #e7e9ec;
          padding: 12px 16px;
        }

        .wsp-drawer-foot.split {
          justify-content: space-between;
        }

        .wsp-drawer-foot-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        @media (max-width: 991px) {
          .writer-series-page {
            max-width: none;
          }

          .wsp-series-table {
            display: none;
          }

          .wsp-mobile-series {
            display: grid;
            gap: 8px;
            margin-bottom: 14px;
          }

          .wsp-series-card {
            border: 1px solid #dfe3e6;
            border-radius: 12px;
            background: #ffffff;
            padding: 13px;
          }

          .wsp-series-card.is-selected {
            border-color: #25282e;
            box-shadow: inset 0 0 0 1px #25282e;
          }

          .wsp-series-card-title {
            margin: 0;
            color: #25282e;
            font-size: 12px;
            font-weight: 800;
          }

          .wsp-series-card-meta {
            margin: 4px 0 0;
            color: #737b86;
            font-size: 10px;
            line-height: 1.4;
          }

          .wsp-series-card-actions {
            display: flex;
            gap: 7px;
            margin-top: 10px;
          }

          .wsp-series-card:not(.is-selected) .wsp-series-card-actions {
            display: none;
          }

          .wsp-selected {
            display: none;
          }

          .wsp-items {
            border: 0;
            background: transparent;
            padding: 0;
          }

          .wsp-items-head {
            margin: 16px 0 8px;
          }

          .wsp-item-row {
            display: block;
            min-height: 0;
            margin-bottom: 8px;
            border: 1px solid #dfe3e6;
            border-radius: 12px;
            background: #ffffff;
            padding: 13px;
          }

          .wsp-item-actions {
            margin-top: 10px;
          }

          .wsp-drawer {
            width: 100vw;
            max-width: none;
            border-left: 0;
            box-shadow: none;
          }

          .wsp-drawer-backdrop {
            display: none;
          }

          .wsp-drawer-head {
            min-height: 60px;
          }

          .wsp-drawer-foot {
            min-height: 68px;
          }
        }

        @media (max-width: 520px) {
          .wsp-toolbar {
            margin-bottom: 12px;
          }

          .wsp-btn {
            min-height: 36px;
          }

          .wsp-form-grid {
            grid-template-columns: 1fr 1fr;
          }

          .wsp-drawer-body {
            padding: 16px 20px;
          }

          .wsp-drawer-foot {
            padding-left: 20px;
            padding-right: 20px;
          }
        }

        @media (max-width: 360px) {
          .wsp-toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .wsp-toolbar .wsp-btn.primary {
            width: 100%;
          }

          .wsp-form-grid {
            grid-template-columns: 1fr;
          }

          .wsp-drawer-foot,
          .wsp-drawer-foot.split {
            align-items: stretch;
            flex-direction: column;
          }

          .wsp-drawer-foot-right {
            width: 100%;
          }

          .wsp-drawer-foot .wsp-btn,
          .wsp-drawer-foot-right .wsp-btn {
            flex: 1;
          }
        }
      `}),e.jsxs("div",{className:"wsp-toolbar",children:[e.jsxs("span",{className:"wsp-count",children:[r.length," ",(r.length===1,"series")]}),e.jsx("button",{type:"button",className:"wsp-btn primary",onClick:Z,children:"New series"})]}),M?e.jsx("div",{className:"wsp-alert error",role:"alert",children:M}):null,O?e.jsx("div",{className:"wsp-alert success",role:"status",children:O}):null,e.jsxs("section",{className:"wsp-panel wsp-series-table","aria-label":"Writer series",children:[e.jsxs("div",{className:"wsp-table-head",children:[e.jsx("span",{children:"Series"}),e.jsx("span",{children:"Type"}),e.jsx("span",{children:"Status"}),e.jsx("span",{children:"Items"}),e.jsx("span",{children:"Updated"}),e.jsx("span",{})]}),r.length?r.map(s=>{const t=String(o)===String(s.id);return e.jsxs("div",{className:`wsp-table-row${t?" is-selected":""}`,children:[e.jsx("span",{className:"wsp-series-name",children:s.title||"Untitled series"}),e.jsx("span",{className:"wsp-cell",children:R(s.series_type)}),e.jsx("span",{className:"wsp-cell strong",children:$(s.status)}),e.jsx("span",{className:"wsp-cell strong",children:Number(s.total_items||0)}),e.jsx("span",{className:"wsp-cell",children:B(s.updated_at)}),e.jsx("span",{className:"wsp-series-action",children:e.jsx("button",{type:"button",className:"wsp-btn",onClick:()=>C(String(s.id)),children:t?"Selected":"Open"})})]},s.id)}):e.jsx("div",{className:"wsp-empty",children:"No series yet."})]}),e.jsx("section",{className:"wsp-mobile-series","aria-label":"Writer series",children:r.length?r.map(s=>{const t=String(o)===String(s.id);return e.jsxs("div",{className:`wsp-series-card${t?" is-selected":""}`,onClick:()=>C(String(s.id)),children:[e.jsx("p",{className:"wsp-series-card-title",children:s.title||"Untitled series"}),e.jsxs("p",{className:"wsp-series-card-meta",children:[R(s.series_type)," | ",$(s.status)," | ",Number(s.total_items||0)," items"]}),t?e.jsxs("div",{className:"wsp-series-card-actions",children:[e.jsx("button",{type:"button",className:"wsp-btn",onClick:n=>{n.stopPropagation(),G()},children:"Edit"}),e.jsx("button",{type:"button",className:"wsp-btn primary",onClick:n=>{n.stopPropagation(),H()},children:"Add post"})]}):null]},s.id)}):e.jsx("div",{className:"wsp-empty wsp-panel",children:"No series yet."})}),l?e.jsxs(e.Fragment,{children:[e.jsxs("section",{className:"wsp-panel wsp-selected",children:[e.jsxs("div",{className:"wsp-selected-copy",children:[e.jsx("p",{className:"wsp-selected-title",children:l.title||"Untitled series"}),e.jsxs("p",{className:"wsp-selected-meta",children:[R(l.series_type)," | ",$(l.status)," | ",L.length," items"]})]}),e.jsxs("div",{className:"wsp-selected-actions",children:[e.jsx("button",{type:"button",className:"wsp-btn",onClick:G,children:"Edit series"}),e.jsx("button",{type:"button",className:"wsp-btn primary",onClick:H,children:"Add post"})]})]}),e.jsxs("section",{className:"wsp-panel wsp-items",children:[e.jsxs("div",{className:"wsp-items-head",children:[e.jsx("h2",{children:"Series items"}),e.jsxs("span",{className:"wsp-items-count",children:[L.length," posts"]})]}),L.length?L.map(s=>e.jsxs("div",{className:"wsp-item-row",children:[e.jsxs("div",{className:"wsp-item-copy",children:[e.jsx("p",{className:"wsp-item-title",children:s.title||`Post #${s.post_id}`}),e.jsxs("p",{className:"wsp-item-meta",children:[$(s.status)," | S",s.season_number??"-"," E",s.episode_number??"-"," | Order ",Number(s.sort_order||0)]}),e.jsx("p",{className:"wsp-item-time",children:ne(s)})]}),e.jsxs("div",{className:"wsp-item-actions",children:[e.jsx("button",{type:"button",className:"wsp-btn",onClick:()=>ie(s),children:"Edit"}),e.jsx("button",{type:"button",className:"wsp-btn",disabled:x===`remove-${s.post_id}`,onClick:()=>ae(s.post_id),children:x===`remove-${s.post_id}`?"Removing...":"Remove"})]})]},s.id||s.post_id)):e.jsx("div",{className:"wsp-empty",children:"No posts are assigned to this series yet."})]})]}):r.length?e.jsx("div",{className:"wsp-empty wsp-panel",children:"Select a series to manage it."}):null,j?e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"wsp-drawer-backdrop",onClick:A,"aria-label":"Close panel"}),e.jsxs("aside",{className:"wsp-drawer","aria-label":j==="create"?"New series":j==="edit-series"?"Edit series":S?"Edit post placement":"Add post to series",children:[e.jsxs("div",{className:"wsp-drawer-head",children:[e.jsx("h2",{children:j==="create"?"New series":j==="edit-series"?"Edit series":S?"Edit post placement":"Add post to series"}),e.jsx("button",{type:"button",className:"wsp-close",onClick:A,"aria-label":"Close",children:"X"})]}),j==="create"?e.jsxs("form",{className:"wsp-form",onSubmit:ee,children:[e.jsx("div",{className:"wsp-drawer-body",children:e.jsxs("div",{className:"wsp-form",children:[e.jsxs("div",{className:"wsp-field",children:[e.jsx("label",{htmlFor:"wsp-create-title",children:"Title"}),e.jsx("input",{id:"wsp-create-title",className:"wsp-input",value:y.title,onChange:s=>f(t=>({...t,title:s.target.value})),required:!0})]}),e.jsxs("div",{className:"wsp-field",children:[e.jsx("label",{htmlFor:"wsp-create-slug",children:"Slug"}),e.jsx("input",{id:"wsp-create-slug",className:"wsp-input",value:y.slug,onChange:s=>f(t=>({...t,slug:s.target.value}))})]}),e.jsxs("div",{className:"wsp-form-grid",children:[e.jsxs("div",{className:"wsp-field",children:[e.jsx("label",{htmlFor:"wsp-create-type",children:"Type"}),e.jsxs("select",{id:"wsp-create-type",className:"wsp-select",value:y.series_type,onChange:s=>f(t=>({...t,series_type:s.target.value})),children:[e.jsx("option",{value:"series",children:"Series"}),e.jsx("option",{value:"book",children:"Book"}),e.jsx("option",{value:"novel",children:"Novel"}),e.jsx("option",{value:"course",children:"Course"}),e.jsx("option",{value:"collection",children:"Collection"})]})]}),e.jsxs("div",{className:"wsp-field",children:[e.jsx("label",{htmlFor:"wsp-create-status",children:"Status"}),e.jsxs("select",{id:"wsp-create-status",className:"wsp-select",value:y.status,onChange:s=>f(t=>({...t,status:s.target.value})),children:[e.jsx("option",{value:"draft",children:"Draft"}),e.jsx("option",{value:"published",children:"Published"}),e.jsx("option",{value:"inactive",children:"Inactive"})]})]})]}),e.jsxs("div",{className:"wsp-field",children:[e.jsx("label",{htmlFor:"wsp-create-description",children:"Description"}),e.jsx("textarea",{id:"wsp-create-description",className:"wsp-textarea",value:y.description,onChange:s=>f(t=>({...t,description:s.target.value}))})]}),e.jsxs("div",{className:"wsp-field",children:[e.jsx("label",{htmlFor:"wsp-create-cover",children:"Cover image URL"}),e.jsxs("div",{className:"wsp-cover-row",children:[e.jsx("input",{id:"wsp-create-cover",className:"wsp-input",value:y.cover_image,onChange:s=>f(t=>({...t,cover_image:s.target.value}))}),e.jsx("label",{className:`wsp-btn wsp-upload-btn${k==="create"?" disabled":""}`,htmlFor:"wsp-create-cover-file",children:k==="create"?"Uploading...":"Upload"}),e.jsx("input",{id:"wsp-create-cover-file",className:"wsp-file-input",type:"file",accept:"image/jpeg,image/png,image/webp,image/gif",disabled:k==="create",onChange:s=>{var n;const t=(n=s.target.files)==null?void 0:n[0];t&&J(t,"create"),s.target.value=""}})]})]})]})}),e.jsxs("div",{className:"wsp-drawer-foot",children:[e.jsx("button",{type:"button",className:"wsp-btn",onClick:A,children:"Cancel"}),e.jsx("button",{type:"submit",className:"wsp-btn primary",disabled:x==="create",children:x==="create"?"Creating...":"Create series"})]})]}):null,j==="edit-series"?e.jsxs("form",{className:"wsp-form",onSubmit:se,children:[e.jsx("div",{className:"wsp-drawer-body",children:e.jsxs("div",{className:"wsp-form",children:[e.jsxs("div",{className:"wsp-field",children:[e.jsx("label",{htmlFor:"wsp-edit-title",children:"Title"}),e.jsx("input",{id:"wsp-edit-title",className:"wsp-input",value:N.title,onChange:s=>u(t=>({...t,title:s.target.value})),required:!0})]}),e.jsxs("div",{className:"wsp-field",children:[e.jsx("label",{htmlFor:"wsp-edit-slug",children:"Slug"}),e.jsx("input",{id:"wsp-edit-slug",className:"wsp-input",value:N.slug,onChange:s=>u(t=>({...t,slug:s.target.value}))})]}),e.jsxs("div",{className:"wsp-form-grid",children:[e.jsxs("div",{className:"wsp-field",children:[e.jsx("label",{htmlFor:"wsp-edit-type",children:"Type"}),e.jsxs("select",{id:"wsp-edit-type",className:"wsp-select",value:N.series_type,onChange:s=>u(t=>({...t,series_type:s.target.value})),children:[e.jsx("option",{value:"series",children:"Series"}),e.jsx("option",{value:"book",children:"Book"}),e.jsx("option",{value:"novel",children:"Novel"}),e.jsx("option",{value:"course",children:"Course"}),e.jsx("option",{value:"collection",children:"Collection"})]})]}),e.jsxs("div",{className:"wsp-field",children:[e.jsx("label",{htmlFor:"wsp-edit-status",children:"Status"}),e.jsxs("select",{id:"wsp-edit-status",className:"wsp-select",value:N.status,onChange:s=>u(t=>({...t,status:s.target.value})),children:[e.jsx("option",{value:"draft",children:"Draft"}),e.jsx("option",{value:"published",children:"Published"}),e.jsx("option",{value:"inactive",children:"Inactive"})]})]})]}),e.jsxs("div",{className:"wsp-field",children:[e.jsx("label",{htmlFor:"wsp-edit-description",children:"Description"}),e.jsx("textarea",{id:"wsp-edit-description",className:"wsp-textarea",value:N.description,onChange:s=>u(t=>({...t,description:s.target.value}))})]}),e.jsxs("div",{className:"wsp-field",children:[e.jsx("label",{htmlFor:"wsp-edit-cover",children:"Cover image URL"}),e.jsxs("div",{className:"wsp-cover-row",children:[e.jsx("input",{id:"wsp-edit-cover",className:"wsp-input",value:N.cover_image,onChange:s=>u(t=>({...t,cover_image:s.target.value}))}),e.jsx("label",{className:`wsp-btn wsp-upload-btn${k==="edit"?" disabled":""}`,htmlFor:"wsp-edit-cover-file",children:k==="edit"?"Uploading...":"Upload"}),e.jsx("input",{id:"wsp-edit-cover-file",className:"wsp-file-input",type:"file",accept:"image/jpeg,image/png,image/webp,image/gif",disabled:k==="edit",onChange:s=>{var n;const t=(n=s.target.files)==null?void 0:n[0];t&&J(t,"edit"),s.target.value=""}})]})]})]})}),e.jsxs("div",{className:"wsp-drawer-foot split",children:[e.jsx("button",{type:"button",className:"wsp-btn danger",disabled:x==="delete-series",onClick:()=>te(o),children:x==="delete-series"?"Deleting...":"Delete"}),e.jsxs("div",{className:"wsp-drawer-foot-right",children:[e.jsx("button",{type:"button",className:"wsp-btn",onClick:A,children:"Cancel"}),e.jsx("button",{type:"submit",className:"wsp-btn primary",disabled:x==="update-series",children:x==="update-series"?"Updating...":"Update series"})]})]})]}):null,j==="placement"?e.jsxs("form",{className:"wsp-form",onSubmit:re,children:[e.jsx("div",{className:"wsp-drawer-body",children:e.jsxs("div",{className:"wsp-form",children:[e.jsxs("div",{className:"wsp-selected-mini",children:[e.jsx("strong",{children:(l==null?void 0:l.title)||"Selected series"}),e.jsxs("span",{children:[R(l==null?void 0:l.series_type)," | ",$(l==null?void 0:l.status)]})]}),e.jsxs("div",{className:"wsp-field",children:[e.jsx("label",{htmlFor:"wsp-post-id",children:"Writer post"}),e.jsx("input",{id:"wsp-post-id",type:"number",min:"1",list:"writer-series-post-options",className:"wsp-input",value:w.post_id,disabled:!!S,onChange:s=>g(t=>({...t,post_id:s.target.value})),required:!0}),e.jsx("datalist",{id:"writer-series-post-options",children:z.map(s=>e.jsx("option",{value:s.id,children:s.title||`Post #${s.id}`},s.id))}),e.jsx("span",{className:"wsp-form-help",children:z.length?"Choose a post from the suggestions or enter its post ID.":"Enter the Writer post ID. Post suggestions are unavailable right now."})]}),e.jsxs("div",{className:"wsp-form-grid",children:[e.jsxs("div",{className:"wsp-field",children:[e.jsx("label",{htmlFor:"wsp-season",children:"Season"}),e.jsx("input",{id:"wsp-season",type:"number",min:"1",className:"wsp-input",value:w.season_number,onChange:s=>g(t=>({...t,season_number:s.target.value}))})]}),e.jsxs("div",{className:"wsp-field",children:[e.jsx("label",{htmlFor:"wsp-episode",children:"Episode"}),e.jsx("input",{id:"wsp-episode",type:"number",min:"1",className:"wsp-input",value:w.episode_number,onChange:s=>g(t=>({...t,episode_number:s.target.value}))})]})]}),e.jsxs("div",{className:"wsp-field",children:[e.jsx("label",{htmlFor:"wsp-order",children:"Order"}),e.jsx("input",{id:"wsp-order",type:"number",min:"0",className:"wsp-input",value:w.sort_order,onChange:s=>g(t=>({...t,sort_order:s.target.value}))})]})]})}),e.jsxs("div",{className:"wsp-drawer-foot",children:[e.jsx("button",{type:"button",className:"wsp-btn",onClick:A,children:"Cancel"}),e.jsx("button",{type:"submit",className:"wsp-btn primary",disabled:x==="save-placement",children:x==="save-placement"?"Saving...":S?"Update placement":"Add to series"})]})]}):null]})]}):null]})}export{de as default};
