import{r as s,j as e,Y as x,q as z,X as F,a0 as $,a as y}from"./index-D7wY-Nn2.js";import{f as k}from"./WorkspaceUi-Gqyyxdbb.js";function w(i){return i!=null&&i.reader_name?i.reader_name:i!=null&&i.reader_user_id?`Reader #${i.reader_user_id}`:"Reader"}function C(i){return(w(i).trim().charAt(0)||"R").toUpperCase()}function P(){const[i,h]=s.useState([]),[d,S]=s.useState([]),[u,f]=s.useState({}),[c,g]=s.useState("comments"),[W,l]=s.useState(null),[b,j]=s.useState(null),[v,p]=s.useState("");async function N(){var t,o,n,a;try{p("");const[r,m]=await Promise.all([y.get("/api/writer/social/followers"),y.get("/api/writer/social/comments")]);h(((t=r==null?void 0:r.data)==null?void 0:t.followers)||[]),S(((o=m==null?void 0:m.data)==null?void 0:o.comments)||[])}catch(r){p(((a=(n=r==null?void 0:r.response)==null?void 0:n.data)==null?void 0:a.message)||"Failed to load Writer community.")}}s.useEffect(()=>{N()},[]);async function _(t){var n,a;const o=String(u[t]||"").trim();if(!(!o||b!==null))try{j(t),p(""),await y.post(`/api/writer/social/comments/${t}/reply`,{body:o}),f(r=>({...r,[t]:""})),l(null),await N()}catch(r){p(((a=(n=r==null?void 0:r.response)==null?void 0:n.data)==null?void 0:a.message)||"Failed to reply.")}finally{j(null)}}function R(t){l(o=>o===t?null:t)}return e.jsxs("div",{className:"writer-community-page",children:[e.jsx("div",{className:"writer-community-mobile-title",children:"Community"}),v?e.jsx("div",{className:"writer-community-alert",role:"alert",children:v}):null,e.jsxs("section",{className:"writer-community-panel",children:[e.jsxs("div",{className:"writer-community-tabs",role:"tablist","aria-label":"Community views",children:[e.jsxs("button",{type:"button",className:`writer-community-tab${c==="comments"?" active":""}`,role:"tab","aria-selected":c==="comments",onClick:()=>g("comments"),children:[e.jsx(x,{size:15,strokeWidth:1.9}),e.jsx("span",{children:"Reader comments"}),e.jsx("span",{className:"writer-community-count",children:d.length})]}),e.jsxs("button",{type:"button",className:`writer-community-tab${c==="followers"?" active":""}`,role:"tab","aria-selected":c==="followers",onClick:()=>g("followers"),children:[e.jsx(z,{size:15,strokeWidth:1.9}),e.jsx("span",{children:"Followers"}),e.jsx("span",{className:"writer-community-count",children:i.length})]})]}),c==="comments"?e.jsx("div",{className:"writer-community-comments",role:"tabpanel",children:d.length?d.map(t=>{const o=Number(W)===Number(t.id),n=Number(b)===Number(t.id),a=Number(t.reply_count||0);return e.jsxs("article",{className:"writer-community-comment",children:[e.jsxs("div",{className:"writer-community-comment-top",children:[e.jsxs("div",{className:"writer-community-reader",children:[e.jsx("div",{className:"writer-community-avatar","aria-hidden":"true",children:C(t)}),e.jsxs("div",{className:"writer-community-reader-copy",children:[e.jsx("strong",{children:w(t)}),e.jsx("span",{children:k(t.created_at)})]})]}),e.jsxs("button",{type:"button",className:`writer-community-reply-trigger${o?" active":""}`,onClick:()=>R(t.id),"aria-expanded":o,children:[e.jsx(x,{size:14,strokeWidth:1.9}),"Reply"]})]}),e.jsx("div",{className:"writer-community-post-title",children:t.post_title||"Post"}),e.jsx("p",{className:"writer-community-comment-body",children:t.body}),a>0?e.jsxs("div",{className:"writer-community-reply-count",children:[a," ",a===1?"reply":"replies"]}):null,o?e.jsxs("div",{className:"writer-community-composer",children:[e.jsxs("div",{className:"writer-community-composer-head",children:[e.jsx("strong",{children:"Reply as Writer"}),e.jsx("button",{type:"button",className:"writer-community-composer-close",onClick:()=>l(null),"aria-label":"Close reply",children:e.jsx(F,{size:15,strokeWidth:1.9})})]}),e.jsx("textarea",{className:"writer-community-textarea",rows:4,placeholder:"Write your reply...",value:u[t.id]||"",onChange:r=>f(m=>({...m,[t.id]:r.target.value})),disabled:n}),e.jsxs("div",{className:"writer-community-composer-actions",children:[e.jsx("button",{type:"button",className:"writer-community-btn secondary",onClick:()=>l(null),disabled:n,children:"Cancel"}),e.jsxs("button",{type:"button",className:"writer-community-btn primary",onClick:()=>_(t.id),disabled:n||!String(u[t.id]||"").trim(),children:[e.jsx($,{size:14,strokeWidth:1.9}),n?"Sending...":"Send reply"]})]})]}):null]},t.id)}):e.jsxs("div",{className:"writer-community-empty",children:[e.jsx("span",{className:"writer-community-empty-icon",children:e.jsx(x,{size:18,strokeWidth:1.8})}),e.jsx("strong",{children:"No Reader comments yet."}),e.jsx("span",{children:"New comments on your posts will appear here."})]})}):e.jsx("div",{className:"writer-community-followers",role:"tabpanel",children:i.length?i.map(t=>e.jsx("div",{className:"writer-community-follower",children:e.jsxs("div",{className:"writer-community-reader",children:[e.jsx("div",{className:"writer-community-avatar","aria-hidden":"true",children:C(t)}),e.jsxs("div",{className:"writer-community-reader-copy",children:[e.jsx("strong",{children:w(t)}),e.jsxs("span",{children:["Followed ",k(t.followed_at)]})]})]})},t.reader_user_id)):e.jsxs("div",{className:"writer-community-empty",children:[e.jsx("span",{className:"writer-community-empty-icon",children:e.jsx(z,{size:18,strokeWidth:1.8})}),e.jsx("strong",{children:"No followers yet."}),e.jsx("span",{children:"Readers who follow your Writer profile will appear here."})]})})]}),e.jsx("style",{children:E})]})}const E=`
  .writer-community-page {
    width: 100%;
    max-width: 1180px;
    margin: 0 auto;
    color: #1d2025;
  }

  .writer-community-mobile-title {
    display: none;
  }

  .writer-community-alert {
    margin-bottom: 14px;
    padding: 11px 13px;
    border: 1px solid #fecaca;
    border-radius: 9px;
    background: #fff7f7;
    color: #b42318;
    font-size: 12px;
    line-height: 1.5;
    font-weight: 650;
  }

  .writer-community-panel {
    min-width: 0;
    overflow: hidden;
    border: 1px solid #e1e4e8;
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 1px 2px rgba(20, 24, 31, 0.02);
  }

  .writer-community-tabs {
    min-height: 54px;
    padding: 0 18px;
    border-bottom: 1px solid #e7e9ec;
    display: flex;
    align-items: stretch;
    gap: 6px;
  }

  .writer-community-tab {
    min-width: 0;
    padding: 0 9px;
    border: 0;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: #717983;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font: inherit;
    font-size: 12px;
    line-height: 1;
    font-weight: 680;
    cursor: pointer;
  }

  .writer-community-tab:hover {
    color: #2e343c;
  }

  .writer-community-tab.active {
    border-bottom-color: #20242a;
    color: #1d2025;
  }

  .writer-community-count {
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 999px;
    background: #f0f2f4;
    color: #6f7781;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: 800;
  }

  .writer-community-tab.active .writer-community-count {
    background: #e9ebee;
    color: #30363d;
  }

  .writer-community-comments,
  .writer-community-followers {
    min-width: 0;
  }

  .writer-community-comment {
    padding: 19px 22px 20px;
  }

  .writer-community-comment + .writer-community-comment {
    border-top: 1px solid #eceef0;
  }

  .writer-community-comment-top {
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .writer-community-reader {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .writer-community-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #eceef0;
    color: #424951;
    display: grid;
    place-items: center;
    flex: 0 0 34px;
    font-size: 11px;
    font-weight: 800;
  }

  .writer-community-reader-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .writer-community-reader-copy strong {
    min-width: 0;
    overflow: hidden;
    color: #282d33;
    font-size: 12px;
    line-height: 1.25;
    font-weight: 730;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .writer-community-reader-copy span {
    color: #8a919a;
    font-size: 10px;
    line-height: 1.35;
    font-weight: 550;
  }

  .writer-community-reply-trigger {
    min-height: 30px;
    padding: 0 9px;
    border: 1px solid #e0e3e6;
    border-radius: 7px;
    background: #ffffff;
    color: #5f6873;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex-shrink: 0;
    font: inherit;
    font-size: 10px;
    font-weight: 680;
    cursor: pointer;
  }

  .writer-community-reply-trigger:hover,
  .writer-community-reply-trigger.active {
    border-color: #cfd4d9;
    background: #f6f7f8;
    color: #20242a;
  }

  .writer-community-post-title {
    margin: 14px 0 7px 44px;
    color: #8c939c;
    font-size: 9px;
    line-height: 1.4;
    font-weight: 760;
    letter-spacing: 0.045em;
    text-transform: uppercase;
  }

  .writer-community-comment-body {
    margin: 0 0 0 44px;
    max-width: 830px;
    color: #3c434b;
    font-size: 12px;
    line-height: 1.65;
    font-weight: 450;
    overflow-wrap: anywhere;
  }

  .writer-community-reply-count {
    margin: 9px 0 0 44px;
    color: #90969e;
    font-size: 9px;
    line-height: 1.4;
    font-weight: 650;
  }

  .writer-community-composer {
    margin: 15px 0 0 44px;
    max-width: 760px;
    padding: 13px;
    border: 1px solid #dde1e5;
    border-radius: 9px;
    background: #fafbfb;
  }

  .writer-community-composer-head {
    margin-bottom: 9px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .writer-community-composer-head strong {
    color: #3b424a;
    font-size: 10px;
    line-height: 1.3;
    font-weight: 740;
  }

  .writer-community-composer-close {
    width: 25px;
    height: 25px;
    padding: 0;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: #838b94;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .writer-community-composer-close:hover {
    background: #eceff1;
    color: #333a42;
  }

  .writer-community-textarea {
    width: 100%;
    min-height: 88px;
    padding: 10px 11px;
    border: 1px solid #d9dde1;
    border-radius: 8px;
    outline: 0;
    background: #ffffff;
    color: #24292f;
    font: inherit;
    font-size: 11px;
    line-height: 1.55;
    resize: vertical;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .writer-community-textarea::placeholder {
    color: #a0a6ad;
  }

  .writer-community-textarea:focus {
    border-color: #8d949c;
    box-shadow: 0 0 0 2px rgba(32, 36, 42, 0.06);
  }

  .writer-community-textarea:disabled {
    background: #f5f6f7;
    color: #818891;
  }

  .writer-community-composer-actions {
    margin-top: 9px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 7px;
  }

  .writer-community-btn {
    min-height: 31px;
    padding: 0 11px;
    border-radius: 7px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font: inherit;
    font-size: 10px;
    line-height: 1;
    font-weight: 700;
    cursor: pointer;
  }

  .writer-community-btn.secondary {
    border: 1px solid #dfe3e6;
    background: #ffffff;
    color: #5f6873;
  }

  .writer-community-btn.primary {
    border: 1px solid #20242a;
    background: #20242a;
    color: #ffffff;
  }

  .writer-community-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .writer-community-follower {
    min-height: 64px;
    padding: 14px 22px;
    display: flex;
    align-items: center;
  }

  .writer-community-follower + .writer-community-follower {
    border-top: 1px solid #eceef0;
  }

  .writer-community-empty {
    min-height: 210px;
    padding: 40px 22px;
    color: #858d96;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .writer-community-empty-icon {
    width: 36px;
    height: 36px;
    margin-bottom: 11px;
    border-radius: 50%;
    background: #f0f2f4;
    color: #737b85;
    display: grid;
    place-items: center;
  }

  .writer-community-empty strong {
    margin-bottom: 4px;
    color: #444b53;
    font-size: 12px;
    line-height: 1.4;
    font-weight: 730;
  }

  .writer-community-empty > span:last-child {
    max-width: 340px;
    color: #9399a1;
    font-size: 10px;
    line-height: 1.55;
    font-weight: 500;
  }

  @media (max-width: 767px) {
    .writer-community-page {
      max-width: none;
    }

    .writer-community-mobile-title {
      display: block;
      margin: 1px 0 15px;
      color: #20242a;
      font-size: 18px;
      line-height: 1.2;
      font-weight: 760;
      letter-spacing: -0.02em;
    }

    .writer-community-alert {
      margin-bottom: 11px;
      font-size: 11px;
    }

    .writer-community-panel {
      border-radius: 10px;
    }

    .writer-community-tabs {
      min-height: 50px;
      padding: 0 10px;
      gap: 2px;
    }

    .writer-community-tab {
      padding: 0 7px;
      gap: 5px;
      font-size: 10px;
    }

    .writer-community-count {
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      font-size: 8px;
    }

    .writer-community-comment {
      padding: 15px 14px 16px;
    }

    .writer-community-comment-top {
      gap: 10px;
      align-items: flex-start;
    }

    .writer-community-avatar {
      width: 32px;
      height: 32px;
      flex-basis: 32px;
      font-size: 10px;
    }

    .writer-community-reader {
      gap: 9px;
    }

    .writer-community-reader-copy strong {
      font-size: 11px;
    }

    .writer-community-reader-copy span {
      font-size: 9px;
    }

    .writer-community-reply-trigger {
      min-height: 29px;
      padding: 0 8px;
      font-size: 9px;
    }

    .writer-community-post-title,
    .writer-community-comment-body,
    .writer-community-reply-count,
    .writer-community-composer {
      margin-left: 41px;
    }

    .writer-community-post-title {
      margin-top: 11px;
      font-size: 8px;
    }

    .writer-community-comment-body {
      font-size: 11px;
      line-height: 1.6;
    }

    .writer-community-composer {
      margin-top: 12px;
      padding: 11px;
    }

    .writer-community-textarea {
      min-height: 82px;
      font-size: 10px;
    }

    .writer-community-btn {
      min-height: 30px;
      font-size: 9px;
    }

    .writer-community-follower {
      min-height: 60px;
      padding: 13px 14px;
    }

    .writer-community-empty {
      min-height: 180px;
      padding: 34px 18px;
    }
  }

  @media (max-width: 420px) {
    .writer-community-tab svg {
      display: none;
    }

    .writer-community-tab {
      flex: 1 1 auto;
      justify-content: center;
    }

    .writer-community-comment-top {
      align-items: center;
    }

    .writer-community-reply-trigger {
      padding: 0 7px;
    }

    .writer-community-reply-trigger svg {
      display: none;
    }

    .writer-community-post-title,
    .writer-community-comment-body,
    .writer-community-reply-count,
    .writer-community-composer {
      margin-left: 0;
    }

    .writer-community-post-title {
      margin-top: 12px;
    }

    .writer-community-composer-actions {
      justify-content: stretch;
    }

    .writer-community-btn {
      flex: 1 1 0;
    }
  }
`;export{P as default};
