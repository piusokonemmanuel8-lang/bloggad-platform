import{r as n,j as e,a as d}from"./index-D7wY-Nn2.js";function E(){const[b,v]=n.useState([]),[a,y]=n.useState(""),[l,j]=n.useState(null),[u,w]=n.useState({title:"",description:"",sort_order:0}),[h,g]=n.useState({}),[N,o]=n.useState("");async function f(){var r,t;try{o("");const{data:i}=await d.get("/api/writer/courses"),s=(i==null?void 0:i.courses)||[];v(s),!a&&s[0]&&y(String(s[0].id))}catch(i){o(((t=(r=i==null?void 0:i.response)==null?void 0:r.data)==null?void 0:t.message)||"Failed to load courses.")}}async function p(r){var t,i;if(!r){j(null);return}try{o("");const{data:s}=await d.get(`/api/writer/courses/${r}`);j(s!=null&&s.course?{...s.course,modules:s.modules||s.course.modules||[]}:null)}catch(s){o(((i=(t=s==null?void 0:s.response)==null?void 0:t.data)==null?void 0:i.message)||"Failed to load course.")}}n.useEffect(()=>{f()},[]),n.useEffect(()=>{p(a)},[a]);const m=n.useMemo(()=>(l==null?void 0:l.modules)||[],[l]);async function z(r){var t,i;if(r.preventDefault(),!!a)try{o(""),await d.post(`/api/writer/courses/${a}/modules`,{...u,sort_order:Number(u.sort_order||0)}),w({title:"",description:"",sort_order:0}),await p(a),await f()}catch(s){o(((i=(t=s==null?void 0:s.response)==null?void 0:t.data)==null?void 0:i.message)||"Failed to create module.")}}async function C(r){var s,c;const t=h[r]||{},i=Number(t.post_id||0);if(!i){o("Enter a valid Course Lesson post ID.");return}try{o(""),await d.post(`/api/writer/courses/${a}/modules/${r}/lessons`,{post_id:i,sort_order:Number(t.sort_order||0)}),g(x=>({...x,[r]:{post_id:"",sort_order:0}})),await p(a)}catch(x){o(((c=(s=x==null?void 0:x.response)==null?void 0:s.data)==null?void 0:c.message)||"Failed to add lesson.")}}async function k(r){var t,i;if(window.confirm("Delete this empty module?"))try{o(""),await d.delete(`/api/writer/courses/modules/${r}`),await p(a),await f()}catch(s){o(((i=(t=s==null?void 0:s.response)==null?void 0:t.data)==null?void 0:i.message)||"Failed to delete module.")}}async function _(r){var t,i;try{o(""),await d.delete(`/api/writer/courses/lessons/${r}`),await p(a)}catch(s){o(((i=(t=s==null?void 0:s.response)==null?void 0:t.data)==null?void 0:i.message)||"Failed to remove lesson.")}}return e.jsxs("div",{className:"writer-courses-page",children:[e.jsx("style",{children:S}),e.jsx("div",{className:"writer-courses-mobile-title",children:"Courses"}),N?e.jsx("div",{className:"writer-courses-alert",role:"alert",children:N}):null,e.jsxs("section",{className:"writer-courses-selector-card",children:[e.jsx("label",{className:"writer-courses-selector-label",htmlFor:"writer-course-select",children:"Select course"}),e.jsxs("select",{id:"writer-course-select",className:"writer-courses-input writer-courses-course-select",value:a,onChange:r=>y(r.target.value),children:[e.jsx("option",{value:"",children:"Choose a course"}),b.map(r=>e.jsx("option",{value:r.id,children:r.title},r.id))]})]}),b.length?null:e.jsxs("section",{className:"writer-courses-empty",children:[e.jsx("strong",{children:"No courses yet"}),e.jsx("span",{children:"Create a series with type Course on the Series page first."})]}),a?e.jsxs("section",{className:"writer-courses-workspace",children:[e.jsxs("aside",{className:"writer-courses-tools",children:[e.jsxs("form",{className:"writer-courses-card writer-courses-add-module",onSubmit:z,children:[e.jsx("div",{className:"writer-courses-section-title",children:"Add module"}),e.jsxs("label",{className:"writer-courses-field",children:[e.jsx("span",{children:"Module title"}),e.jsx("input",{className:"writer-courses-input",placeholder:"Enter module title",value:u.title,onChange:r=>w(t=>({...t,title:r.target.value})),required:!0})]}),e.jsxs("label",{className:"writer-courses-field",children:[e.jsx("span",{children:"Description"}),e.jsx("textarea",{className:"writer-courses-input writer-courses-textarea",placeholder:"Short module description",value:u.description,onChange:r=>w(t=>({...t,description:r.target.value}))})]}),e.jsxs("label",{className:"writer-courses-field",children:[e.jsx("span",{children:"Sort order"}),e.jsx("input",{className:"writer-courses-input",type:"number",placeholder:"Sort order",value:u.sort_order,onChange:r=>w(t=>({...t,sort_order:r.target.value}))})]}),e.jsx("button",{className:"writer-courses-btn primary writer-courses-add-module-btn",children:"Add module"})]}),e.jsxs("div",{className:"writer-courses-card writer-courses-source-note",children:[e.jsx("strong",{children:"Course source"}),e.jsx("span",{children:"Courses come from Writer series with type Course."})]})]}),e.jsxs("section",{className:"writer-courses-card writer-courses-structure",children:[e.jsxs("div",{className:"writer-courses-structure-head",children:[e.jsxs("div",{className:"writer-courses-structure-title",children:[e.jsx("span",{className:"writer-courses-mobile-structure-label",children:"Course structure"}),e.jsx("strong",{children:(l==null?void 0:l.title)||"Course structure"})]}),e.jsxs("span",{className:"writer-courses-badge",children:[m.length," ",m.length===1?"module":"modules"]})]}),m.length?e.jsx("div",{className:"writer-courses-module-list",children:m.map(r=>{var t,i;return e.jsxs("article",{className:"writer-courses-module",children:[e.jsxs("div",{className:"writer-courses-module-head",children:[e.jsx("strong",{children:r.title}),e.jsx("button",{type:"button",className:"writer-courses-btn danger",onClick:()=>k(r.id),children:"Delete"})]}),e.jsx("div",{className:"writer-courses-lessons",children:(r.lessons||[]).map(s=>e.jsxs("div",{className:"writer-courses-lesson",children:[e.jsx("strong",{children:s.title||`Lesson post #${s.post_id}`}),e.jsx("button",{type:"button",className:"writer-courses-btn danger",onClick:()=>_(s.id),children:"Remove"})]},s.id))}),e.jsxs("div",{className:"writer-courses-add-lesson",children:[e.jsxs("label",{className:"writer-courses-field writer-courses-lesson-post-field",children:[e.jsx("span",{children:"Course Lesson post ID"}),e.jsx("input",{className:"writer-courses-input",placeholder:"Enter post ID",value:((t=h[r.id])==null?void 0:t.post_id)||"",onChange:s=>g(c=>({...c,[r.id]:{...c[r.id]||{},post_id:s.target.value}}))})]}),e.jsxs("label",{className:"writer-courses-field writer-courses-order-field",children:[e.jsx("span",{children:"Order"}),e.jsx("input",{className:"writer-courses-input",type:"number",placeholder:"Order",value:((i=h[r.id])==null?void 0:i.sort_order)||0,onChange:s=>g(c=>({...c,[r.id]:{...c[r.id]||{},sort_order:s.target.value}}))})]}),e.jsx("button",{type:"button",className:"writer-courses-btn primary writer-courses-add-lesson-btn",onClick:()=>C(r.id),children:"Add lesson"})]})]},r.id)})}):e.jsx("div",{className:"writer-courses-no-modules",children:"No modules yet."})]})]}):null]})}const S=`
  * {
    box-sizing: border-box;
  }

  .writer-courses-page {
    width: 100%;
    color: #111827;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .writer-courses-page button,
  .writer-courses-page input,
  .writer-courses-page select,
  .writer-courses-page textarea {
    font: inherit;
  }

  .writer-courses-mobile-title {
    display: none;
  }

  .writer-courses-alert {
    margin-bottom: 12px;
    padding: 11px 13px;
    border: 1px solid #fecaca;
    border-radius: 11px;
    background: #fef2f2;
    color: #b42318;
    font-size: 12px;
    line-height: 1.45;
    font-weight: 600;
  }

  .writer-courses-selector-card,
  .writer-courses-card,
  .writer-courses-empty {
    border: 1px solid #e5e7eb;
    background: #ffffff;
  }

  .writer-courses-selector-card {
    min-height: 66px;
    margin-bottom: 12px;
    padding: 11px 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-radius: 14px;
  }

  .writer-courses-selector-label {
    flex: 1 1 auto;
    min-width: 140px;
    font-size: 12px;
    line-height: 1.3;
    font-weight: 600;
    white-space: nowrap;
  }

  .writer-courses-course-select {
    width: 430px;
    max-width: 46%;
    flex: 0 0 430px;
  }

  .writer-courses-input {
    width: 100%;
    min-width: 0;
    min-height: 42px;
    padding: 0 12px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    outline: 0;
    background: #ffffff;
    color: #111827;
    font-size: 11px;
    line-height: 1.4;
    font-weight: 500;
    transition: border-color 140ms ease, box-shadow 140ms ease;
  }

  .writer-courses-input::placeholder {
    color: #6b7280;
    opacity: 1;
  }

  .writer-courses-input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.06);
  }

  .writer-courses-textarea {
    min-height: 76px;
    padding: 10px 12px;
    resize: vertical;
  }

  .writer-courses-empty {
    margin-bottom: 12px;
    padding: 14px;
    display: grid;
    gap: 4px;
    border-radius: 14px;
  }

  .writer-courses-empty strong {
    font-size: 12px;
    font-weight: 600;
  }

  .writer-courses-empty span {
    color: #6b7280;
    font-size: 10px;
    line-height: 1.45;
  }

  .writer-courses-workspace {
    display: grid;
    grid-template-columns: 330px minmax(0, 1fr);
    gap: 14px;
    align-items: start;
  }

  .writer-courses-tools {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .writer-courses-card {
    border-radius: 14px;
  }

  .writer-courses-add-module {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .writer-courses-section-title {
    min-height: 28px;
    display: flex;
    align-items: center;
    font-size: 13px;
    line-height: 1.3;
    font-weight: 600;
  }

  .writer-courses-field {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .writer-courses-field > span {
    color: #6b7280;
    font-size: 9px;
    line-height: 1.25;
    font-weight: 600;
    letter-spacing: 0.025em;
    text-transform: uppercase;
  }

  .writer-courses-btn {
    min-height: 36px;
    padding: 0 12px;
    border: 1px solid #d1d5db;
    border-radius: 9px;
    background: #ffffff;
    color: #111827;
    font-size: 11px;
    line-height: 1;
    font-weight: 600;
    cursor: pointer;
  }

  .writer-courses-btn.primary {
    border-color: #111827;
    background: #111827;
    color: #ffffff;
  }

  .writer-courses-btn.danger {
    border-color: #fac4bf;
    background: #fef2f2;
    color: #b42520;
  }

  .writer-courses-add-module-btn {
    align-self: flex-start;
  }

  .writer-courses-source-note {
    padding: 14px;
    display: grid;
    gap: 5px;
  }

  .writer-courses-source-note strong {
    font-size: 11px;
    line-height: 1.3;
    font-weight: 600;
  }

  .writer-courses-source-note span {
    color: #6b7280;
    font-size: 10px;
    line-height: 1.45;
  }

  .writer-courses-structure {
    min-width: 0;
    padding: 16px;
  }

  .writer-courses-structure-head {
    min-height: 28px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .writer-courses-structure-title {
    flex: 1;
    min-width: 0;
  }

  .writer-courses-structure-title strong {
    display: block;
    overflow-wrap: anywhere;
    font-size: 13px;
    line-height: 1.35;
    font-weight: 600;
  }

  .writer-courses-mobile-structure-label {
    display: none;
  }

  .writer-courses-badge {
    min-height: 24px;
    padding: 0 8px;
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
    white-space: nowrap;
  }

  .writer-courses-module-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .writer-courses-module {
    min-width: 0;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
  }

  .writer-courses-module-head {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .writer-courses-module-head > strong {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
    font-size: 13px;
    line-height: 1.35;
    font-weight: 600;
  }

  .writer-courses-lessons {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .writer-courses-lesson {
    min-height: 42px;
    padding: 3px 8px 3px 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: 9px;
    background: #f8fafc;
  }

  .writer-courses-lesson > strong {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
    font-size: 11px;
    line-height: 1.35;
    font-weight: 500;
  }

  .writer-courses-add-lesson {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 110px auto;
    gap: 8px;
    align-items: end;
  }

  .writer-courses-add-lesson-btn {
    white-space: nowrap;
  }

  .writer-courses-no-modules {
    padding: 20px 10px;
    color: #6b7280;
    font-size: 11px;
    line-height: 1.5;
    text-align: center;
  }

  @media (max-width: 1080px) {
    .writer-courses-workspace {
      grid-template-columns: 1fr;
    }

    .writer-courses-tools {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      align-items: start;
    }
  }

  @media (max-width: 767px) {
    .writer-courses-mobile-title {
      min-height: 50px;
      margin-bottom: 10px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: #ffffff;
      font-size: 14px;
      font-weight: 600;
    }

    .writer-courses-selector-card {
      min-height: 0;
      margin-bottom: 10px;
      padding: 12px;
      align-items: stretch;
      flex-direction: column;
      gap: 7px;
    }

    .writer-courses-selector-label {
      color: #6b7280;
      font-size: 8px;
      letter-spacing: 0.025em;
      text-transform: uppercase;
    }

    .writer-courses-course-select {
      width: 100%;
      max-width: none;
      flex: 0 0 auto;
      min-height: 40px;
      border-radius: 9px;
      font-size: 10px;
    }

    .writer-courses-workspace {
      width: 100%;
      min-width: 0;
      gap: 10px;
    }

    .writer-courses-tools {
      width: 100%;
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
    }

    .writer-courses-add-module,
    .writer-courses-source-note {
      width: 100%;
      min-width: 0;
    }

    .writer-courses-add-module {
      padding: 14px;
      gap: 10px;
    }

    .writer-courses-section-title {
      min-height: 26px;
      font-size: 12px;
    }

    .writer-courses-field {
      gap: 5px;
    }

    .writer-courses-field > span {
      font-size: 8px;
    }

    .writer-courses-input {
      min-height: 40px;
      padding: 0 11px;
      border-radius: 9px;
      font-size: 10px;
    }

    .writer-courses-textarea {
      min-height: 72px;
      padding: 10px 11px;
    }

    .writer-courses-add-module-btn {
      width: 100%;
      min-height: 36px;
    }

    .writer-courses-source-note {
      padding: 12px;
    }

    .writer-courses-source-note strong {
      font-size: 10px;
    }

    .writer-courses-source-note span {
      font-size: 9px;
    }

    .writer-courses-structure {
      width: 100%;
      min-width: 0;
      padding: 14px;
    }

    .writer-courses-structure-head {
      min-height: 26px;
      margin-bottom: 8px;
    }

    .writer-courses-mobile-structure-label {
      display: block;
      margin-bottom: 10px;
      font-size: 12px;
      line-height: 1.3;
      font-weight: 600;
    }

    .writer-courses-structure-title strong {
      font-size: 11px;
    }

    .writer-courses-badge {
      min-height: 24px;
      font-size: 8px;
    }

    .writer-courses-module {
      padding: 12px;
      gap: 9px;
    }

    .writer-courses-module-head > strong {
      font-size: 12px;
    }

    .writer-courses-btn {
      font-size: 10px;
    }

    .writer-courses-lesson {
      min-height: 42px;
      padding-left: 10px;
      padding-right: 6px;
      gap: 6px;
    }

    .writer-courses-lesson > strong {
      font-size: 9px;
    }

    .writer-courses-add-lesson {
      grid-template-columns: 106px minmax(0, 1fr);
      gap: 8px;
    }

    .writer-courses-lesson-post-field {
      grid-column: 1 / -1;
    }

    .writer-courses-order-field {
      grid-column: 1;
    }

    .writer-courses-add-lesson-btn {
      grid-column: 2;
      width: 100%;
      align-self: end;
    }
  }

  @media (max-width: 420px) {
    .writer-courses-module-head {
      align-items: flex-start;
    }

    .writer-courses-lesson {
      align-items: center;
    }
  }
`;export{E as default};
