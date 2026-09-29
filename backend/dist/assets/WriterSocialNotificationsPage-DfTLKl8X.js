import{r as c,j as i,a as w}from"./index-D7wY-Nn2.js";import{f as h}from"./WorkspaceUi-Gqyyxdbb.js";function k(t){return t===!0||t===1||t==="1"}function v(t){if(!t)return"-";const d=new Date(t).getTime();if(Number.isNaN(d))return h(t);const r=Date.now()-d;if(r<0)return h(t);const p=Math.floor(r/1e3);if(p<60)return"Just now";const l=Math.floor(p/60);if(l<60)return`${l} ${l===1?"minute":"minutes"} ago`;const o=Math.floor(l/60);return o<24?`${o} ${o===1?"hour":"hours"} ago`:o<48?"Yesterday":h(t)}function M(){const[t,m]=c.useState([]),[d,r]=c.useState(""),[p,l]=c.useState(!0),[o,g]=c.useState(null),[f,u]=c.useState(!1);async function x(e=!0){var a,n;e&&l(!0);try{r("");const{data:s}=await w.get("/api/writer/social/notifications");m((s==null?void 0:s.notifications)||[])}catch(s){r(((n=(a=s==null?void 0:s.response)==null?void 0:a.data)==null?void 0:n.message)||"Failed to load Writer notifications.")}finally{e&&l(!1)}}c.useEffect(()=>{x()},[]);async function y(e){var a,n;if(!(!e||o!==null||f)){g(e);try{r(""),await w.patch(`/api/writer/social/notifications/${e}/read`),await x(!1)}catch(s){r(((n=(a=s==null?void 0:s.response)==null?void 0:a.data)==null?void 0:n.message)||"Failed to mark the notification as read.")}finally{g(null)}}}async function N(){var e,a;if(!(f||o!==null)){u(!0);try{r(""),await w.patch("/api/writer/social/notifications/mark-all-read"),await x(!1)}catch(n){r(((a=(e=n==null?void 0:n.response)==null?void 0:e.data)==null?void 0:a.message)||"Failed to mark notifications as read.")}finally{u(!1)}}}const b=c.useMemo(()=>t.reduce((e,a)=>e+(k(a==null?void 0:a.is_read)?0:1),0),[t]),j=b===0||f||o!==null;return i.jsxs("div",{className:"writer-social-notifications-page",children:[i.jsx("style",{children:`
        .writer-social-notifications-page {
          width: 100%;
          max-width: 920px;
          color: #17191f;
        }

        .writer-social-notifications-page,
        .writer-social-notifications-page * {
          box-sizing: border-box;
        }

        .wsn-actions-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          min-height: 40px;
          margin-bottom: 14px;
        }

        .wsn-left-actions {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .wsn-unread-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 32px;
          border: 1px solid #dfe3e6;
          border-radius: 999px;
          background: #ffffff;
          color: #17191f;
          font-size: 12px;
          font-weight: 800;
          line-height: 1;
          padding: 0 10px;
          white-space: nowrap;
        }

        .wsn-unread-dot,
        .wsn-row-dot {
          width: 7px;
          height: 7px;
          flex: 0 0 7px;
          border-radius: 999px;
          background: #1c1f24;
        }

        .wsn-status-copy {
          margin: 0;
          color: #6f7782;
          font-size: 12px;
          line-height: 1.45;
        }

        .wsn-mark-all {
          min-width: 126px;
          min-height: 40px;
          border: 1px solid #1c1f24;
          border-radius: 9px;
          background: #1c1f24;
          color: #ffffff;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 800;
          line-height: 1;
          padding: 0 15px;
          transition: background 140ms ease, border-color 140ms ease;
        }

        .wsn-mark-all:hover:not(:disabled) {
          background: #111318;
          border-color: #111318;
        }

        .wsn-mark-all:disabled {
          border-color: #d7dce2;
          background: #d7dce2;
          color: #6f7782;
          cursor: default;
        }

        .wsn-mark-all:focus-visible,
        .wsn-notification:focus-visible {
          outline: 2px solid #1c1f24;
          outline-offset: 2px;
        }

        .wsn-error {
          width: 100%;
          margin: 0 0 14px;
          border: 1px solid #ebcaca;
          border-radius: 10px;
          background: #fffafa;
          color: #8e2d2d;
          font-size: 13px;
          line-height: 1.5;
          padding: 11px 13px;
        }

        .wsn-list-shell {
          width: 100%;
          border: 1px solid #dfe3e6;
          border-radius: 15px;
          background: #ffffff;
          padding: 12px;
        }

        .wsn-list {
          display: grid;
          gap: 8px;
        }

        .wsn-notification {
          width: 100%;
          min-height: 82px;
          display: grid;
          grid-template-columns: 34px minmax(0, 1fr) 7px;
          align-items: center;
          gap: 12px;
          border: 1px solid #e3e6e9;
          border-radius: 11px;
          appearance: none;
          background: #ffffff;
          color: #17191f;
          cursor: default;
          font: inherit;
          padding: 12px 15px;
          text-align: left;
        }

        .wsn-notification.is-unread {
          background: #fbfcfc;
          cursor: pointer;
        }

        .wsn-notification.is-working {
          opacity: 0.62;
          cursor: wait;
        }

        .wsn-marker {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #f1f3f5;
          color: #6f7782;
          font-size: 11px;
          font-weight: 800;
          line-height: 1;
        }

        .wsn-notification.is-unread .wsn-marker {
          background: #1c1f24;
          color: #ffffff;
        }

        .wsn-copy {
          min-width: 0;
        }

        .wsn-item-title {
          display: block;
          margin: 0;
          color: #17191f;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.35;
        }

        .wsn-item-message {
          display: block;
          margin: 3px 0 0;
          color: #6f7782;
          font-size: 12px;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        .wsn-item-time {
          display: block;
          margin: 4px 0 0;
          color: #8a919b;
          font-size: 10px;
          line-height: 1.35;
        }

        .wsn-row-dot-placeholder {
          width: 7px;
          height: 7px;
        }

        .wsn-state {
          min-height: 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          color: #6f7782;
          padding: 28px 20px;
          text-align: center;
        }

        .wsn-state-title {
          margin: 0;
          color: #17191f;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.4;
        }

        .wsn-state-copy {
          margin: 0;
          max-width: 380px;
          font-size: 11px;
          line-height: 1.5;
        }

        @media (max-width: 991px) {
          .writer-social-notifications-page {
            max-width: none;
          }

          .wsn-actions-row {
            margin-bottom: 12px;
          }

          .wsn-status-copy {
            display: none;
          }

          .wsn-list-shell {
            border-radius: 13px;
            padding: 10px;
          }
        }

        @media (max-width: 520px) {
          .wsn-actions-row {
            gap: 10px;
          }

          .wsn-mark-all {
            min-width: 112px;
            min-height: 38px;
            padding: 0 12px;
          }

          .wsn-notification {
            grid-template-columns: 32px minmax(0, 1fr) 7px;
            gap: 11px;
            min-height: 82px;
            padding: 12px 13px;
          }

          .wsn-marker {
            width: 32px;
            height: 32px;
          }
        }

        @media (max-width: 360px) {
          .wsn-actions-row {
            align-items: stretch;
            flex-direction: column;
          }

          .wsn-left-actions {
            width: 100%;
          }

          .wsn-mark-all {
            width: 100%;
          }
        }
      `}),i.jsxs("div",{className:"wsn-actions-row",children:[i.jsxs("div",{className:"wsn-left-actions",children:[i.jsxs("div",{className:"wsn-unread-pill","aria-live":"polite",children:[i.jsx("span",{className:"wsn-unread-dot","aria-hidden":"true"}),i.jsxs("span",{children:[b," unread"]})]}),i.jsx("p",{className:"wsn-status-copy",children:"New activity appears first. Select an unread item to mark it as read."})]}),i.jsx("button",{type:"button",className:"wsn-mark-all",onClick:N,disabled:j,children:f?"Marking...":"Mark all read"})]}),d?i.jsx("div",{className:"wsn-error",role:"alert",children:d}):null,i.jsx("section",{className:"wsn-list-shell","aria-label":"Writer social notifications",children:p?i.jsx("div",{className:"wsn-state","aria-live":"polite",children:i.jsx("p",{className:"wsn-state-title",children:"Loading notifications..."})}):t.length?i.jsx("div",{className:"wsn-list",children:t.map(e=>{const a=k(e==null?void 0:e.is_read),n=o===e.id;return i.jsxs("button",{type:"button",className:`wsn-notification${a?" is-read":" is-unread"}${n?" is-working":""}`,onClick:()=>{a||y(e.id)},"aria-disabled":a||n,"aria-label":`${e.title||"Notification"}${a?", read":", unread. Select to mark as read."}`,tabIndex:a?-1:0,children:[i.jsx("span",{className:"wsn-marker","aria-hidden":"true",children:"N"}),i.jsxs("span",{className:"wsn-copy",children:[i.jsx("span",{className:"wsn-item-title",children:e.title||"Notification"}),e.message?i.jsx("span",{className:"wsn-item-message",children:e.message}):null,i.jsx("span",{className:"wsn-item-time",children:v(e.created_at)})]}),a?i.jsx("span",{className:"wsn-row-dot-placeholder","aria-hidden":"true"}):i.jsx("span",{className:"wsn-row-dot","aria-hidden":"true"})]},e.id)})}):i.jsxs("div",{className:"wsn-state",children:[i.jsx("p",{className:"wsn-state-title",children:"No social notifications yet."}),i.jsx("p",{className:"wsn-state-copy",children:"New Reader activity will appear here when it is available."})]})})]})}export{M as default};
