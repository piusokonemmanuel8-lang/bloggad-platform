import{r as p,j as r}from"./index-D7wY-Nn2.js";import{a as A}from"./api-BnafCqf_.js";const O={ad_type:"product",target_id:"",website_id:"",campaign_title:"",campaign_description:"",campaign_image:"",total_budget:"10",daily_budget_cap:"",start_date:"",end_date:"",bid_cost_per_view:"",bid_cost_per_click:"",currency:"USD"},de={campaign_id:"",amount:"10"},Me=`
  .writer-ads-page,
  .writer-ads-page * {
    box-sizing: border-box;
  }

  .writer-ads-page {
    width: 100%;
    min-width: 0;
    color: #172033;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .writer-ads-page button,
  .writer-ads-page input,
  .writer-ads-page select,
  .writer-ads-page textarea {
    font: inherit;
  }

  .writer-ads-page button {
    cursor: pointer;
  }

  .writer-ads-page button:disabled {
    cursor: not-allowed;
    opacity: 0.58;
  }

  .writer-ads-workspace {
    display: grid;
    gap: 18px;
    min-width: 0;
  }

  .writer-ads-overview {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    padding: 20px 22px;
    border: 1px solid #e5e9f0;
    border-radius: 16px;
    background: #ffffff;
    box-shadow: 0 8px 26px rgba(15, 23, 42, 0.04);
  }

  .writer-ads-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 6px;
    color: #596579;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .writer-ads-overview h2,
  .writer-ads-section-heading h3,
  .writer-ads-drawer-head h3,
  .writer-ads-topup-card h3 {
    margin: 0;
    color: #121a2a;
  }

  .writer-ads-overview h2 {
    font-size: 24px;
    line-height: 1.2;
    letter-spacing: -0.025em;
  }

  .writer-ads-overview p {
    max-width: 680px;
    margin: 8px 0 0;
    color: #657084;
    font-size: 14px;
    line-height: 1.6;
  }

  .writer-ads-overview-actions {
    display: flex;
    align-items: center;
    gap: 9px;
    flex: 0 0 auto;
  }

  .writer-ads-btn {
    min-height: 40px;
    border: 1px solid #d8dee8;
    border-radius: 10px;
    padding: 0 14px;
    background: #ffffff;
    color: #1f2937;
    font-size: 13px;
    font-weight: 750;
    transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease, transform 0.15s ease;
  }

  .writer-ads-btn:hover:not(:disabled) {
    border-color: #aeb7c4;
    background: #f8fafc;
  }

  .writer-ads-btn.primary {
    border-color: #111827;
    background: #111827;
    color: #ffffff;
  }

  .writer-ads-btn.primary:hover:not(:disabled) {
    background: #202938;
  }

  .writer-ads-btn.success {
    border-color: #c8e9d5;
    background: #f0fbf4;
    color: #17633a;
  }

  .writer-ads-btn.danger-soft {
    border-color: #f0d1d1;
    background: #fff6f6;
    color: #a73535;
  }

  .writer-ads-btn.compact {
    min-height: 34px;
    padding: 0 11px;
    border-radius: 8px;
    font-size: 12px;
  }

  .writer-ads-pricing {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .writer-ads-price-card {
    min-width: 0;
    padding: 16px;
    border: 1px solid #e5e9f0;
    border-radius: 14px;
    background: #ffffff;
  }

  .writer-ads-price-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 13px;
  }

  .writer-ads-price-card-head strong {
    font-size: 14px;
    color: #182132;
  }

  .writer-ads-price-card-head span {
    padding: 4px 7px;
    border-radius: 999px;
    background: #f1f5f9;
    color: #586579;
    font-size: 10px;
    font-weight: 750;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .writer-ads-price-pair {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .writer-ads-price-pair div {
    min-width: 0;
    padding: 10px 11px;
    border-radius: 10px;
    background: #f8fafc;
  }

  .writer-ads-price-pair span {
    display: block;
    color: #748095;
    font-size: 11px;
    margin-bottom: 4px;
  }

  .writer-ads-price-pair strong {
    display: block;
    color: #172033;
    font-size: 15px;
    overflow-wrap: anywhere;
  }

  .writer-ads-stats {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 10px;
  }

  .writer-ads-stat {
    min-width: 0;
    padding: 15px 16px;
    border: 1px solid #e5e9f0;
    border-radius: 13px;
    background: #ffffff;
  }

  .writer-ads-stat span {
    display: block;
    color: #758196;
    font-size: 11px;
    font-weight: 650;
    margin-bottom: 7px;
  }

  .writer-ads-stat strong {
    display: block;
    color: #121a2a;
    font-size: 20px;
    line-height: 1.15;
    overflow-wrap: anywhere;
  }

  .writer-ads-stat small {
    display: block;
    margin-top: 6px;
    color: #8a95a6;
    font-size: 10px;
  }

  .writer-ads-alert {
    padding: 11px 13px;
    border: 1px solid #dfe4ec;
    border-radius: 10px;
    background: #f8fafc;
    color: #48566a;
    font-size: 13px;
    line-height: 1.5;
  }

  .writer-ads-alert.error {
    border-color: #f1cccc;
    background: #fff7f7;
    color: #9f3131;
  }

  .writer-ads-alert.success {
    border-color: #cce8d7;
    background: #f3fbf6;
    color: #246b43;
  }

  .writer-ads-section {
    min-width: 0;
    padding: 18px;
    border: 1px solid #e5e9f0;
    border-radius: 16px;
    background: #ffffff;
  }

  .writer-ads-section-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  .writer-ads-section-heading h3 {
    font-size: 18px;
    letter-spacing: -0.02em;
  }

  .writer-ads-section-heading p {
    margin: 5px 0 0;
    color: #748095;
    font-size: 12px;
  }

  .writer-ads-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 30px;
    height: 28px;
    padding: 0 9px;
    border-radius: 999px;
    background: #f1f5f9;
    color: #4f5d72;
    font-size: 12px;
    font-weight: 750;
  }

  .writer-ads-loading,
  .writer-ads-empty {
    display: grid;
    place-items: center;
    min-height: 220px;
    padding: 28px;
    border: 1px dashed #dbe2ea;
    border-radius: 13px;
    background: #fbfcfe;
    text-align: center;
    color: #6e7a8d;
  }

  .writer-ads-empty strong {
    display: block;
    color: #263246;
    font-size: 15px;
    margin-bottom: 6px;
  }

  .writer-ads-empty p {
    max-width: 420px;
    margin: 0;
    font-size: 12px;
    line-height: 1.6;
  }

  .writer-ads-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid #e4e8ee;
    border-top-color: #111827;
    border-radius: 50%;
    animation: writerAdsSpin 0.8s linear infinite;
  }

  @keyframes writerAdsSpin {
    to { transform: rotate(360deg); }
  }

  .writer-ads-campaign-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .writer-ads-campaign-card {
    display: grid;
    min-width: 0;
    gap: 14px;
    padding: 16px;
    border: 1px solid #e2e7ee;
    border-radius: 14px;
    background: #ffffff;
  }

  .writer-ads-campaign-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    min-width: 0;
  }

  .writer-ads-campaign-title-wrap {
    min-width: 0;
  }

  .writer-ads-campaign-title-wrap h4 {
    margin: 7px 0 0;
    color: #172033;
    font-size: 15px;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .writer-ads-badge-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }

  .writer-ads-pill {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    padding: 0 8px;
    border-radius: 999px;
    background: #eef2f7;
    color: #536174;
    font-size: 10px;
    font-weight: 750;
    text-transform: capitalize;
  }

  .writer-ads-pill.type {
    background: #eef5ff;
    color: #285a9f;
  }

  .writer-ads-pill.active,
  .writer-ads-pill.approved {
    background: #eaf8ef;
    color: #21663d;
  }

  .writer-ads-pill.pending,
  .writer-ads-pill.daily_paused {
    background: #fff6df;
    color: #8a6310;
  }

  .writer-ads-pill.paused,
  .writer-ads-pill.ended,
  .writer-ads-pill.exhausted {
    background: #f0f2f5;
    color: #596578;
  }

  .writer-ads-pill.rejected {
    background: #fff0f0;
    color: #a43b3b;
  }

  .writer-ads-target {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    min-width: 0;
    padding: 11px 12px;
    border-radius: 11px;
    background: #f8fafc;
  }

  .writer-ads-target-thumb {
    flex: 0 0 38px;
    width: 38px;
    height: 38px;
    border-radius: 9px;
    border: 1px solid #e1e6ed;
    background: #eef2f7;
    object-fit: cover;
  }

  .writer-ads-target-copy {
    min-width: 0;
  }

  .writer-ads-target-copy span {
    display: block;
    color: #8a95a6;
    font-size: 10px;
    margin-bottom: 3px;
  }

  .writer-ads-target-copy strong {
    display: block;
    color: #2a3547;
    font-size: 12px;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }

  .writer-ads-budget-block {
    display: grid;
    gap: 7px;
  }

  .writer-ads-budget-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: #647084;
    font-size: 11px;
  }

  .writer-ads-budget-row strong {
    color: #273347;
    font-size: 11px;
  }

  .writer-ads-progress {
    height: 7px;
    overflow: hidden;
    border-radius: 999px;
    background: #edf1f5;
  }

  .writer-ads-progress > span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: #2c8c58;
  }

  .writer-ads-card-metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 7px;
  }

  .writer-ads-card-metrics div {
    min-width: 0;
    padding: 8px 9px;
    border-radius: 9px;
    background: #fafbfc;
    border: 1px solid #edf0f4;
  }

  .writer-ads-card-metrics span {
    display: block;
    color: #8994a5;
    font-size: 9px;
    margin-bottom: 3px;
  }

  .writer-ads-card-metrics strong {
    display: block;
    color: #263245;
    font-size: 11px;
    overflow-wrap: anywhere;
  }

  .writer-ads-meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px 14px;
  }

  .writer-ads-meta-grid div {
    min-width: 0;
  }

  .writer-ads-meta-grid span {
    display: block;
    color: #8994a5;
    font-size: 9px;
    margin-bottom: 2px;
  }

  .writer-ads-meta-grid strong {
    display: block;
    color: #4c596d;
    font-size: 10px;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }

  .writer-ads-card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    padding-top: 2px;
  }

  .writer-ads-overlay {
    position: fixed;
    inset: 0;
    z-index: 1200;
    display: flex;
    justify-content: flex-end;
    background: rgba(15, 23, 42, 0.32);
    backdrop-filter: blur(2px);
  }

  .writer-ads-drawer {
    width: min(520px, 94vw);
    height: 100%;
    overflow-y: auto;
    background: #ffffff;
    box-shadow: -18px 0 45px rgba(15, 23, 42, 0.14);
  }

  .writer-ads-drawer-inner {
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }

  .writer-ads-drawer-head {
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 19px 20px 15px;
    border-bottom: 1px solid #e5e9f0;
    background: rgba(255, 255, 255, 0.98);
  }

  .writer-ads-drawer-head h3 {
    font-size: 18px;
  }

  .writer-ads-drawer-head p {
    margin: 5px 0 0;
    color: #7a8698;
    font-size: 11px;
    line-height: 1.5;
  }

  .writer-ads-close {
    width: 34px;
    height: 34px;
    border: 1px solid #dfe4ea;
    border-radius: 9px;
    background: #ffffff;
    color: #536174;
    font-size: 18px;
    line-height: 1;
  }

  .writer-ads-form {
    display: grid;
    gap: 17px;
    padding: 18px 20px 24px;
  }

  .writer-ads-form-section {
    display: grid;
    gap: 12px;
  }

  .writer-ads-form-section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #edf0f4;
  }

  .writer-ads-form-section-title strong {
    color: #263246;
    font-size: 12px;
  }

  .writer-ads-form-section-title span {
    color: #8a95a6;
    font-size: 10px;
  }

  .writer-ads-field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .writer-ads-field {
    display: grid;
    gap: 6px;
    min-width: 0;
  }

  .writer-ads-field.full {
    grid-column: 1 / -1;
  }

  .writer-ads-field > span {
    color: #4b586b;
    font-size: 11px;
    font-weight: 700;
  }

  .writer-ads-field small {
    color: #8b96a6;
    font-size: 10px;
    line-height: 1.45;
  }

  .writer-ads-field input,
  .writer-ads-field select,
  .writer-ads-field textarea {
    width: 100%;
    min-width: 0;
    border: 1px solid #dbe1e8;
    border-radius: 9px;
    background: #ffffff;
    color: #1f2937;
    outline: none;
  }

  .writer-ads-field input,
  .writer-ads-field select {
    min-height: 40px;
    padding: 0 11px;
  }

  .writer-ads-field textarea {
    min-height: 84px;
    resize: vertical;
    padding: 10px 11px;
    line-height: 1.5;
  }

  .writer-ads-field input:focus,
  .writer-ads-field select:focus,
  .writer-ads-field textarea:focus {
    border-color: #93a2b5;
    box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.14);
  }

  .writer-ads-type-selector {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 7px;
  }

  .writer-ads-type-btn {
    min-height: 42px;
    border: 1px solid #dfe4eb;
    border-radius: 9px;
    background: #ffffff;
    color: #566377;
    font-size: 11px;
    font-weight: 750;
  }

  .writer-ads-type-btn.active {
    border-color: #b8d5c4;
    background: #f0f8f3;
    color: #23613e;
  }

  .writer-ads-rate-note {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px;
  }

  .writer-ads-rate-note div {
    padding: 9px 10px;
    border-radius: 9px;
    background: #f8fafc;
  }

  .writer-ads-rate-note span {
    display: block;
    color: #8a95a6;
    font-size: 9px;
    margin-bottom: 3px;
  }

  .writer-ads-rate-note strong {
    display: block;
    color: #344155;
    font-size: 11px;
  }

  .writer-ads-image-preview {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    padding: 9px;
    border: 1px solid #e5e9f0;
    border-radius: 10px;
    background: #fafbfc;
  }

  .writer-ads-image-preview img {
    width: 56px;
    height: 56px;
    flex: 0 0 56px;
    border-radius: 9px;
    object-fit: cover;
    border: 1px solid #e2e7ed;
  }

  .writer-ads-image-preview span {
    min-width: 0;
    color: #6c788b;
    font-size: 10px;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  .writer-ads-drawer-actions {
    position: sticky;
    bottom: 0;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 13px 20px 17px;
    border-top: 1px solid #e5e9f0;
    background: rgba(255, 255, 255, 0.98);
  }

  .writer-ads-topup-overlay {
    position: fixed;
    inset: 0;
    z-index: 1250;
    display: grid;
    place-items: center;
    padding: 16px;
    background: rgba(15, 23, 42, 0.36);
  }

  .writer-ads-topup-card {
    width: min(420px, 100%);
    padding: 19px;
    border-radius: 15px;
    background: #ffffff;
    box-shadow: 0 18px 50px rgba(15, 23, 42, 0.18);
  }

  .writer-ads-topup-card h3 {
    font-size: 17px;
  }

  .writer-ads-topup-card p {
    margin: 6px 0 15px;
    color: #778397;
    font-size: 11px;
    line-height: 1.5;
  }

  .writer-ads-topup-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 13px;
  }

  @media (max-width: 1120px) {
    .writer-ads-stats {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .writer-ads-campaign-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 767px) {
    .writer-ads-page {
      width: calc(100% + 16px);
      margin-left: -8px;
      margin-right: -8px;
      padding: 8px 8px 34px;
      overflow-x: clip;
    }

    .writer-ads-workspace {
      gap: 12px;
    }

    .writer-ads-overview {
      display: grid;
      gap: 14px;
      padding: 15px;
      border-radius: 13px;
    }

    .writer-ads-overview h2 {
      font-size: 20px;
    }

    .writer-ads-overview p {
      font-size: 12px;
      line-height: 1.55;
    }

    .writer-ads-overview-actions {
      width: 100%;
      display: grid;
      grid-template-columns: 0.8fr 1.2fr;
    }

    .writer-ads-btn {
      min-height: 42px;
      padding: 0 11px;
      font-size: 12px;
    }

    .writer-ads-pricing {
      gap: 7px;
    }

    .writer-ads-price-card {
      padding: 10px 9px;
      border-radius: 11px;
    }

    .writer-ads-price-card-head {
      display: block;
      margin-bottom: 8px;
    }

    .writer-ads-price-card-head strong {
      display: block;
      font-size: 11px;
      margin-bottom: 4px;
    }

    .writer-ads-price-card-head span {
      display: none;
    }

    .writer-ads-price-pair {
      grid-template-columns: 1fr;
      gap: 5px;
    }

    .writer-ads-price-pair div {
      padding: 6px;
    }

    .writer-ads-price-pair span {
      font-size: 8px;
      margin-bottom: 2px;
    }

    .writer-ads-price-pair strong {
      font-size: 10px;
    }

    .writer-ads-stats {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 7px;
    }

    .writer-ads-stat {
      padding: 11px 10px;
      border-radius: 11px;
    }

    .writer-ads-stat:nth-child(3),
    .writer-ads-stat:nth-child(4) {
      display: none;
    }

    .writer-ads-stat span {
      font-size: 9px;
      margin-bottom: 5px;
    }

    .writer-ads-stat strong {
      font-size: 15px;
    }

    .writer-ads-stat small {
      font-size: 8px;
    }

    .writer-ads-section {
      padding: 12px;
      border-radius: 13px;
    }

    .writer-ads-section-heading {
      margin-bottom: 11px;
    }

    .writer-ads-section-heading h3 {
      font-size: 16px;
    }

    .writer-ads-section-heading p {
      font-size: 10px;
    }

    .writer-ads-campaign-card {
      padding: 13px;
      border-radius: 12px;
      gap: 11px;
    }

    .writer-ads-campaign-head {
      display: grid;
      gap: 8px;
    }

    .writer-ads-card-metrics {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 5px;
    }

    .writer-ads-card-metrics div {
      padding: 7px 5px;
    }

    .writer-ads-card-metrics span {
      font-size: 8px;
    }

    .writer-ads-card-metrics strong {
      font-size: 10px;
    }

    .writer-ads-card-actions {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .writer-ads-card-actions .writer-ads-btn {
      min-width: 0;
      padding: 0 6px;
      font-size: 10px;
    }

    .writer-ads-overlay {
      display: block;
      background: #ffffff;
    }

    .writer-ads-drawer {
      width: 100%;
      max-width: none;
      height: 100%;
      box-shadow: none;
    }

    .writer-ads-drawer-head {
      padding: 14px 12px 12px;
    }

    .writer-ads-form {
      padding: 14px 12px 90px;
      gap: 15px;
    }

    .writer-ads-field-grid {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .writer-ads-field.full {
      grid-column: auto;
    }

    .writer-ads-field-grid.compact-two {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .writer-ads-drawer-actions {
      padding: 10px 12px 14px;
    }

    .writer-ads-drawer-actions .writer-ads-btn {
      flex: 1 1 0;
    }

    .writer-ads-topup-overlay {
      align-items: end;
      padding: 8px;
    }

    .writer-ads-topup-card {
      width: 100%;
      border-radius: 15px 15px 10px 10px;
    }
  }
`;function c(t,n=0){const i=Number(t);return Number.isFinite(i)?i:n}function _(t,n="USD",i=2){const v=c(t),N=Number.isFinite(Number(i))?Number(i):2;try{return new Intl.NumberFormat(void 0,{style:"currency",currency:n||"USD",minimumFractionDigits:N,maximumFractionDigits:N}).format(v)}catch{return`${n||"USD"} ${v.toFixed(N)}`}}function M(t){const n=c(t);return n>=1?_(n,"USD",2):`$${n.toFixed(4)}`}function L(t){return new Intl.NumberFormat().format(Math.max(0,c(t)))}function ae(t){return`${Math.max(0,c(t)).toFixed(2)}%`}function oe(t){if(!t)return"";const n=String(t);return n.length>=10?n.slice(0,10):n}function ne(t){if(!t)return"Open";const n=new Date(t);return Number.isNaN(n.getTime())?String(t).slice(0,10):n.toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"})}function H(t,n){const i={product:{view:.0015,click:.07},post:{view:.001,click:.04},website:{view:.001,click:.05}},v=i[n]||i.product;return{view:c(t==null?void 0:t[`${n}_cost_per_view`],v.view),click:c(t==null?void 0:t[`${n}_cost_per_click`],v.click)}}function Ue(t){var n,i;return Array.isArray(t==null?void 0:t.campaigns)?t.campaigns:Array.isArray(t==null?void 0:t.ads)?t.ads:Array.isArray((n=t==null?void 0:t.data)==null?void 0:n.campaigns)?t.data.campaigns:Array.isArray((i=t==null?void 0:t.data)==null?void 0:i.ads)?t.data.ads:[]}function Pe(t){const n=(t==null?void 0:t.website)||(Array.isArray(t==null?void 0:t.websites)?t.websites[0]:null)||null;return{settings:(t==null?void 0:t.settings)||{},website:n,products:Array.isArray(t==null?void 0:t.products)?t.products:[],posts:Array.isArray(t==null?void 0:t.posts)?t.posts:[]}}function Be(t){const n=(t==null?void 0:t.spent_amount)??(t==null?void 0:t.total_spent)??(t==null?void 0:t.spent)??(t==null?void 0:t.budget_spent);return n!=null&&n!==""?Math.max(0,c(n)):Math.max(0,c(t==null?void 0:t.total_budget)-c(t==null?void 0:t.remaining_budget))}function le(t){return String((t==null?void 0:t.status)||"pending").toLowerCase()}function ce(t){return String((t==null?void 0:t.approval_status)||"pending").toLowerCase()}function k(t){return t==="daily_paused"?"Daily Paused":t==="pending"?"Pending":t==="approved"?"Approved":t==="rejected"?"Rejected":t==="exhausted"?"Exhausted":t==="ended"?"Ended":t==="paused"?"Paused":t==="active"?"Active":t?t.replace(/_/g," "):"Pending"}function $e(){const[t,n]=p.useState({}),[i,v]=p.useState(null),[N,pe]=p.useState([]),[J,xe]=p.useState([]),[h,ue]=p.useState([]),[q,K]=p.useState(!0),[Q,X]=p.useState(!1),[P,Z]=p.useState(!1),[j,B]=p.useState(""),[F,b]=p.useState(""),[ee,T]=p.useState(""),[fe,$]=p.useState(!1),[S,R]=p.useState(""),[d,C]=p.useState(O),[U,W]=p.useState(de),[we,E]=p.useState(!1),m=Math.max(0,c(t==null?void 0:t.minimum_budget,10)),f=p.useMemo(()=>({product:H(t,"product"),post:H(t,"post"),website:H(t,"website")}),[t]),z=p.useCallback(async(e=!1)=>{var a,o;try{e?X(!0):K(!0),b("");const[l,s]=await Promise.all([A.get("/affiliate/ads/options"),A.get("/affiliate/ads")]),x=Pe((l==null?void 0:l.data)||{});n(x.settings),v(x.website),pe(x.products),xe(x.posts),ue(Ue((s==null?void 0:s.data)||{}))}catch(l){b(((o=(a=l==null?void 0:l.response)==null?void 0:a.data)==null?void 0:o.message)||(l==null?void 0:l.message)||"Failed to load Ads Account.")}finally{K(!1),X(!1)}},[]);p.useEffect(()=>{z(!1)},[z]);const y=p.useMemo(()=>{const e=h.reduce((w,u)=>w+c(u==null?void 0:u.total_budget),0),a=h.reduce((w,u)=>w+c(u==null?void 0:u.remaining_budget),0),o=h.reduce((w,u)=>w+c(u==null?void 0:u.total_views),0),l=h.reduce((w,u)=>w+c(u==null?void 0:u.total_clicks),0),s=h.filter(w=>le(w)==="active").length,x=h.filter(w=>ce(w)==="pending").length;return{totalBudget:e,remaining:a,views:o,clicks:l,ctr:o>0?l/o*100:0,active:s,pending:x}},[h]);function D(){b(""),T("")}function he(e="product"){const a=f[e]||f.product;return{...O,ad_type:e,target_id:e==="website"?String((i==null?void 0:i.id)||""):"",website_id:String((i==null?void 0:i.id)||""),total_budget:String(m||10),bid_cost_per_view:String(a.view),bid_cost_per_click:String(a.click),currency:(t==null?void 0:t.currency)||"USD"}}function be(){D(),R(""),C(he("product")),$(!0)}function re(e){return String((e==null?void 0:e.target_id)??(e==null?void 0:e.product_id)??(e==null?void 0:e.post_id)??(e==null?void 0:e.website_id)??"")}function ge(e){if(!e)return;D();const a=String((e==null?void 0:e.ad_type)||"product").toLowerCase(),o=f[a]||f.product;R(String(e.id)),C({ad_type:a,target_id:re(e),website_id:String((e==null?void 0:e.website_id)||(i==null?void 0:i.id)||""),campaign_title:(e==null?void 0:e.campaign_title)||(e==null?void 0:e.title)||"",campaign_description:(e==null?void 0:e.campaign_description)||(e==null?void 0:e.description)||"",campaign_image:(e==null?void 0:e.campaign_image)||(e==null?void 0:e.image)||"",total_budget:String(c(e==null?void 0:e.total_budget,m||10)),daily_budget_cap:(e==null?void 0:e.daily_budget_cap)===null||(e==null?void 0:e.daily_budget_cap)===void 0?"":String(e.daily_budget_cap),start_date:oe(e==null?void 0:e.start_date),end_date:oe(e==null?void 0:e.end_date),bid_cost_per_view:String(c((e==null?void 0:e.bid_cost_per_view)??(e==null?void 0:e.cost_per_view),o.view)),bid_cost_per_click:String(c((e==null?void 0:e.bid_cost_per_click)??(e==null?void 0:e.cost_per_click),o.click)),currency:(e==null?void 0:e.currency)||(t==null?void 0:t.currency)||"USD"}),$(!0)}function V(){P||($(!1),R(""),C(O))}function me(e){const a=f[e]||f.product;C(o=>({...o,ad_type:e,target_id:e==="website"?String((i==null?void 0:i.id)||""):"",website_id:String((i==null?void 0:i.id)||o.website_id||""),bid_cost_per_view:String(a.view),bid_cost_per_click:String(a.click)}))}function g(e,a){C(o=>({...o,[e]:a}))}function _e(e){var l;const a=(l=e.target.files)==null?void 0:l[0];if(!a)return;if(!String(a.type||"").startsWith("image/")){b("Please choose an image file."),e.target.value="";return}if(a.size>2*1024*1024){b("Campaign image must be 2 MB or smaller."),e.target.value="";return}const o=new FileReader;o.onload=()=>{g("campaign_image",String(o.result||"")),b("")},o.onerror=()=>b("Unable to read that image."),o.readAsDataURL(a)}function je(){return d.ad_type==="product"?N:d.ad_type==="post"?J:i?[i]:[]}function ve(){if(!(d.ad_type==="website"?String((i==null?void 0:i.id)||d.target_id||""):String(d.target_id||"")))throw new Error(`Please choose the ${d.ad_type} you want to promote.`);if(d.start_date&&d.end_date&&new Date(d.start_date)>new Date(d.end_date))throw new Error("Start date cannot be after end date.")}function ye(){const e=d.ad_type,a=String(e==="website"?(i==null?void 0:i.id)||d.target_id||"":d.target_id||""),o=f[e]||f.product,l=Math.max(c(d.total_budget,m||10),m||10),s=Math.max(c(d.bid_cost_per_view,o.view),o.view),x=Math.max(c(d.bid_cost_per_click,o.click),o.click);return{ad_type:e,target_id:String(a),website_id:String(d.website_id||(i==null?void 0:i.id)||""),campaign_title:String(d.campaign_title||""),campaign_description:String(d.campaign_description||""),campaign_image:String(d.campaign_image||""),total_budget:String(l),daily_budget_cap:d.daily_budget_cap?String(c(d.daily_budget_cap)):"",start_date:d.start_date||"",end_date:d.end_date||"",bid_cost_per_view:String(s),bid_cost_per_click:String(x),currency:d.currency||(t==null?void 0:t.currency)||"USD"}}async function ke(e){var a,o,l;e.preventDefault();try{Z(!0),D(),ve();const s=ye(),x=S?await A.put(`/affiliate/ads/${S}`,s):await A.post("/affiliate/ads",s);T(((a=x==null?void 0:x.data)==null?void 0:a.message)||(S?"Campaign updated successfully.":"Campaign submitted for approval.")),$(!1),R(""),C(O),await z(!0)}catch(s){b(((l=(o=s==null?void 0:s.response)==null?void 0:o.data)==null?void 0:l.message)||(s==null?void 0:s.message)||"Unable to save this campaign.")}finally{Z(!1)}}async function te(e,a){var o,l;if(!(!(e!=null&&e.id)||!["pause","resume"].includes(a)))try{B(String(e.id)),D();const{data:s}=await A.put(`/affiliate/ads/${e.id}/${a}`);T((s==null?void 0:s.message)||(a==="pause"?"Campaign paused.":"Campaign resumed.")),await z(!0)}catch(s){b(((l=(o=s==null?void 0:s.response)==null?void 0:o.data)==null?void 0:l.message)||(s==null?void 0:s.message)||`Unable to ${a} this campaign.`)}finally{B("")}}function Ne(e){e!=null&&e.id&&(D(),W({campaign_id:String(e.id),amount:String(m||10)}),E(!0))}async function Se(e){var o,l;e.preventDefault();const a=c(U.amount);if(!U.campaign_id||a<(m||10)){b(`Top-up amount must be at least ${_(m||10,(t==null?void 0:t.currency)||"USD")}.`);return}try{B(String(U.campaign_id)),D();const{data:s}=await A.post(`/affiliate/ads/${U.campaign_id}/top-up`,{amount:a,currency:(t==null?void 0:t.currency)||"USD"});T((s==null?void 0:s.message)||"Campaign balance topped up successfully."),E(!1),W(de),await z(!0)}catch(s){b(((l=(o=s==null?void 0:s.response)==null?void 0:o.data)==null?void 0:l.message)||(s==null?void 0:s.message)||"Unable to top up this campaign.")}finally{B("")}}function Ce(e){const a=String((e==null?void 0:e.ad_type)||"product").toLowerCase(),o=Number(re(e));if(a==="website")return{title:(e==null?void 0:e.target_title)||(e==null?void 0:e.website_name)||(i==null?void 0:i.website_name)||(i==null?void 0:i.name)||(i==null?void 0:i.slug)||"Writer website",image:(e==null?void 0:e.campaign_image)||""};const s=(a==="post"?J:N).find(x=>Number(x==null?void 0:x.id)===o);return{title:(e==null?void 0:e.target_title)||(e==null?void 0:e.product_title)||(e==null?void 0:e.post_title)||(s==null?void 0:s.title)||`${k(a)} #${o||"-"}`,image:(e==null?void 0:e.campaign_image)||(s==null?void 0:s.image)||(s==null?void 0:s.product_image)||(s==null?void 0:s.featured_image)||""}}return r.jsxs("div",{className:"writer-ads-page",children:[r.jsx("style",{children:Me}),r.jsxs("main",{className:"writer-ads-workspace",children:[r.jsxs("section",{className:"writer-ads-overview",children:[r.jsxs("div",{children:[r.jsx("span",{className:"writer-ads-eyebrow",children:"Sponsored promotion"}),r.jsx("h2",{children:"Ads Account"}),r.jsx("p",{children:"Promote your own products, posts, or website. Control budget and bids while keeping campaign status, approval, views, clicks, and spend visible in one workspace."})]}),r.jsxs("div",{className:"writer-ads-overview-actions",children:[r.jsx("button",{type:"button",className:"writer-ads-btn",onClick:()=>z(!0),disabled:Q||q,children:Q?"Refreshing...":"Refresh"}),r.jsx("button",{type:"button",className:"writer-ads-btn primary",onClick:be,disabled:q,children:"+ Create Campaign"})]})]}),r.jsx("section",{className:"writer-ads-pricing","aria-label":"Base ad rates",children:["product","post","website"].map(e=>r.jsxs("article",{className:"writer-ads-price-card",children:[r.jsxs("div",{className:"writer-ads-price-card-head",children:[r.jsxs("strong",{children:[k(e)," ads"]}),r.jsx("span",{children:"Base rates"})]}),r.jsxs("div",{className:"writer-ads-price-pair",children:[r.jsxs("div",{children:[r.jsx("span",{children:"Per view"}),r.jsx("strong",{children:M(f[e].view)})]}),r.jsxs("div",{children:[r.jsx("span",{children:"Per click"}),r.jsx("strong",{children:M(f[e].click)})]})]})]},e))}),r.jsxs("section",{className:"writer-ads-stats","aria-label":"Ads account statistics",children:[r.jsxs("article",{className:"writer-ads-stat",children:[r.jsx("span",{children:"Total budget"}),r.jsx("strong",{children:_(y.totalBudget,(t==null?void 0:t.currency)||"USD")}),r.jsxs("small",{children:[h.length," campaigns"]})]}),r.jsxs("article",{className:"writer-ads-stat",children:[r.jsx("span",{children:"Remaining"}),r.jsx("strong",{children:_(y.remaining,(t==null?void 0:t.currency)||"USD")}),r.jsxs("small",{children:[y.active," active"]})]}),r.jsxs("article",{className:"writer-ads-stat",children:[r.jsx("span",{children:"Views"}),r.jsx("strong",{children:L(y.views)}),r.jsx("small",{children:"Recorded delivery"})]}),r.jsxs("article",{className:"writer-ads-stat",children:[r.jsx("span",{children:"Clicks"}),r.jsx("strong",{children:L(y.clicks)}),r.jsx("small",{children:"Recorded engagement"})]}),r.jsxs("article",{className:"writer-ads-stat",children:[r.jsx("span",{children:"CTR"}),r.jsx("strong",{children:ae(y.ctr)}),r.jsxs("small",{children:[y.pending," awaiting approval"]})]})]}),F?r.jsx("div",{className:"writer-ads-alert error",children:F}):null,ee?r.jsx("div",{className:"writer-ads-alert success",children:ee}):null,r.jsxs("section",{className:"writer-ads-section",children:[r.jsxs("div",{className:"writer-ads-section-heading",children:[r.jsxs("div",{children:[r.jsx("h3",{children:"My campaigns"}),r.jsx("p",{children:"Budget, delivery, approval, and actions stay together."})]}),r.jsx("span",{className:"writer-ads-count",children:h.length})]}),q?r.jsx("div",{className:"writer-ads-loading",children:r.jsx("div",{className:"writer-ads-spinner"})}):h.length===0?r.jsx("div",{className:"writer-ads-empty",children:r.jsxs("div",{children:[r.jsx("strong",{children:"No campaigns yet"}),r.jsx("p",{children:"Create your first sponsored campaign to promote a product, post, or your website."})]})}):r.jsx("div",{className:"writer-ads-campaign-grid",children:h.map(e=>{const a=Math.max(0,c(e==null?void 0:e.total_budget)),o=Math.max(0,c(e==null?void 0:e.remaining_budget)),l=Be(e),s=Math.max(0,c(e==null?void 0:e.total_views)),x=Math.max(0,c(e==null?void 0:e.total_clicks)),w=s>0?x/s*100:0,u=a>0?Math.max(0,Math.min(100,o/a*100)):0,Y=le(e),I=ce(e),G=Ce(e),se=String((e==null?void 0:e.ad_type)||"product").toLowerCase(),ie=f[se]||f.product,ze=c((e==null?void 0:e.bid_cost_per_view)??(e==null?void 0:e.cost_per_view),ie.view),De=c((e==null?void 0:e.bid_cost_per_click)??(e==null?void 0:e.cost_per_click),ie.click),Ae=Y==="active";return r.jsxs("article",{className:"writer-ads-campaign-card",children:[r.jsxs("div",{className:"writer-ads-campaign-head",children:[r.jsxs("div",{className:"writer-ads-campaign-title-wrap",children:[r.jsxs("div",{className:"writer-ads-badge-row",children:[r.jsx("span",{className:"writer-ads-pill type",children:k(se)}),r.jsx("span",{className:`writer-ads-pill ${Y}`,children:k(Y)})]}),r.jsx("h4",{children:(e==null?void 0:e.campaign_title)||(e==null?void 0:e.title)||"Untitled campaign"})]}),r.jsx("span",{className:`writer-ads-pill ${I}`,children:I==="pending"?"Awaiting Approval":k(I)})]}),r.jsxs("div",{className:"writer-ads-target",children:[G.image?r.jsx("img",{className:"writer-ads-target-thumb",src:G.image,alt:""}):r.jsx("div",{className:"writer-ads-target-thumb"}),r.jsxs("div",{className:"writer-ads-target-copy",children:[r.jsx("span",{children:"Promoting"}),r.jsx("strong",{children:G.title})]})]}),r.jsxs("div",{className:"writer-ads-budget-block",children:[r.jsxs("div",{className:"writer-ads-budget-row",children:[r.jsxs("span",{children:["Remaining"," ",r.jsx("strong",{children:_(o,(e==null?void 0:e.currency)||(t==null?void 0:t.currency)||"USD")})]}),r.jsxs("span",{children:["Budget"," ",r.jsx("strong",{children:_(a,(e==null?void 0:e.currency)||(t==null?void 0:t.currency)||"USD")})]})]}),r.jsx("div",{className:"writer-ads-progress",children:r.jsx("span",{style:{width:`${u}%`}})})]}),r.jsxs("div",{className:"writer-ads-card-metrics",children:[r.jsxs("div",{children:[r.jsx("span",{children:"Views"}),r.jsx("strong",{children:L(s)})]}),r.jsxs("div",{children:[r.jsx("span",{children:"Clicks"}),r.jsx("strong",{children:L(x)})]}),r.jsxs("div",{children:[r.jsx("span",{children:"CTR"}),r.jsx("strong",{children:ae(w)})]}),r.jsxs("div",{children:[r.jsx("span",{children:"Spent"}),r.jsx("strong",{children:_(l,(e==null?void 0:e.currency)||(t==null?void 0:t.currency)||"USD")})]})]}),r.jsxs("div",{className:"writer-ads-meta-grid",children:[r.jsxs("div",{children:[r.jsx("span",{children:"Daily cap"}),r.jsx("strong",{children:e!=null&&e.daily_budget_cap?_(e.daily_budget_cap,(e==null?void 0:e.currency)||(t==null?void 0:t.currency)||"USD"):"No cap"})]}),r.jsxs("div",{children:[r.jsx("span",{children:"Approval"}),r.jsx("strong",{children:k(I)})]}),r.jsxs("div",{children:[r.jsx("span",{children:"Bid / view"}),r.jsx("strong",{children:M(ze)})]}),r.jsxs("div",{children:[r.jsx("span",{children:"Bid / click"}),r.jsx("strong",{children:M(De)})]}),r.jsxs("div",{children:[r.jsx("span",{children:"Starts"}),r.jsx("strong",{children:ne(e==null?void 0:e.start_date)})]}),r.jsxs("div",{children:[r.jsx("span",{children:"Ends"}),r.jsx("strong",{children:ne(e==null?void 0:e.end_date)})]})]}),r.jsxs("div",{className:"writer-ads-card-actions",children:[r.jsx("button",{type:"button",className:"writer-ads-btn compact",onClick:()=>ge(e),disabled:String(j)===String(e.id),children:"Edit"}),Ae?r.jsx("button",{type:"button",className:"writer-ads-btn compact danger-soft",onClick:()=>te(e,"pause"),disabled:String(j)===String(e.id),children:"Pause"}):r.jsx("button",{type:"button",className:"writer-ads-btn compact success",onClick:()=>te(e,"resume"),disabled:String(j)===String(e.id),children:"Resume"}),r.jsx("button",{type:"button",className:"writer-ads-btn compact",onClick:()=>Ne(e),disabled:String(j)===String(e.id),children:"Top Up"})]})]},e.id)})})]})]}),fe?r.jsx("div",{className:"writer-ads-overlay",role:"presentation",onMouseDown:e=>{e.target===e.currentTarget&&V()},children:r.jsx("aside",{className:"writer-ads-drawer","aria-label":"Campaign editor",children:r.jsxs("div",{className:"writer-ads-drawer-inner",children:[r.jsxs("div",{className:"writer-ads-drawer-head",children:[r.jsxs("div",{children:[r.jsx("h3",{children:S?"Edit Campaign":"Create Campaign"}),r.jsx("p",{children:S?"Campaign changes may require approval before delivery resumes.":"Choose what to promote, set your budget and bids, then submit for approval."})]}),r.jsx("button",{type:"button",className:"writer-ads-close",onClick:V,"aria-label":"Close campaign editor",children:"x"})]}),r.jsxs("form",{className:"writer-ads-form",onSubmit:ke,children:[r.jsxs("section",{className:"writer-ads-form-section",children:[r.jsxs("div",{className:"writer-ads-form-section-title",children:[r.jsx("strong",{children:"Campaign type"}),r.jsx("span",{children:"Promote your own content"})]}),r.jsx("div",{className:"writer-ads-type-selector",children:["product","post","website"].map(e=>r.jsx("button",{type:"button",className:`writer-ads-type-btn ${d.ad_type===e?"active":""}`,onClick:()=>me(e),children:k(e)},e))}),r.jsxs("div",{className:"writer-ads-rate-note",children:[r.jsxs("div",{children:[r.jsx("span",{children:"Base view rate"}),r.jsx("strong",{children:M(f[d.ad_type].view)})]}),r.jsxs("div",{children:[r.jsx("span",{children:"Base click rate"}),r.jsx("strong",{children:M(f[d.ad_type].click)})]})]})]}),r.jsxs("section",{className:"writer-ads-form-section",children:[r.jsxs("div",{className:"writer-ads-form-section-title",children:[r.jsx("strong",{children:"Campaign details"}),r.jsx("span",{children:"Required fields"})]}),r.jsxs("div",{className:"writer-ads-field-grid",children:[r.jsxs("label",{className:"writer-ads-field full",children:[r.jsx("span",{children:"What do you want to promote?"}),r.jsxs("select",{value:d.ad_type==="website"?String((i==null?void 0:i.id)||d.target_id||""):d.target_id,onChange:e=>g("target_id",e.target.value),required:!0,children:[r.jsx("option",{value:"",children:"Choose target"}),je().map(e=>r.jsx("option",{value:e.id,children:e.title||e.website_name||e.name||e.slug||`Item #${e.id}`},e.id))]}),d.ad_type==="website"&&!i?r.jsx("small",{children:"Create your Writer website before promoting it."}):null]}),r.jsxs("label",{className:"writer-ads-field full",children:[r.jsx("span",{children:"Campaign title"}),r.jsx("input",{value:d.campaign_title,onChange:e=>g("campaign_title",e.target.value),placeholder:"Example: Promote my summer buying guide"})]}),r.jsxs("label",{className:"writer-ads-field full",children:[r.jsx("span",{children:"Description"}),r.jsx("textarea",{value:d.campaign_description,onChange:e=>g("campaign_description",e.target.value),placeholder:"Add a short campaign note or description."})]}),r.jsxs("label",{className:"writer-ads-field full",children:[r.jsx("span",{children:"Campaign image URL"}),r.jsx("input",{value:d.campaign_image,onChange:e=>g("campaign_image",e.target.value),placeholder:"https://..."}),r.jsx("small",{children:"Optional. Paste an image URL or choose a local image below."})]}),r.jsxs("label",{className:"writer-ads-field full",children:[r.jsx("span",{children:"Choose local image"}),r.jsx("input",{type:"file",accept:"image/*",onChange:_e}),r.jsx("small",{children:"Maximum local image size: 2 MB."})]}),d.campaign_image?r.jsxs("div",{className:"writer-ads-image-preview writer-ads-field full",children:[r.jsx("img",{src:d.campaign_image,alt:""}),r.jsx("span",{children:"Campaign creative preview. The stored value follows the existing Ads Account image field."})]}):null]})]}),r.jsxs("section",{className:"writer-ads-form-section",children:[r.jsxs("div",{className:"writer-ads-form-section-title",children:[r.jsx("strong",{children:"Budget and bids"}),r.jsxs("span",{children:["Minimum budget"," ",_(m,d.currency||"USD")]})]}),r.jsxs("div",{className:"writer-ads-field-grid compact-two",children:[r.jsxs("label",{className:"writer-ads-field",children:[r.jsx("span",{children:"Total budget"}),r.jsx("input",{type:"number",min:m,step:"0.01",value:d.total_budget,onChange:e=>g("total_budget",e.target.value),required:!0})]}),r.jsxs("label",{className:"writer-ads-field",children:[r.jsx("span",{children:"Daily cap"}),r.jsx("input",{type:"number",min:"0",step:"0.01",value:d.daily_budget_cap,onChange:e=>g("daily_budget_cap",e.target.value),placeholder:"Optional"})]}),r.jsxs("label",{className:"writer-ads-field",children:[r.jsx("span",{children:"Bid per view"}),r.jsx("input",{type:"number",min:f[d.ad_type].view,step:"0.0001",value:d.bid_cost_per_view,onChange:e=>g("bid_cost_per_view",e.target.value),required:!0})]}),r.jsxs("label",{className:"writer-ads-field",children:[r.jsx("span",{children:"Bid per click"}),r.jsx("input",{type:"number",min:f[d.ad_type].click,step:"0.0001",value:d.bid_cost_per_click,onChange:e=>g("bid_cost_per_click",e.target.value),required:!0})]})]})]}),r.jsxs("section",{className:"writer-ads-form-section",children:[r.jsxs("div",{className:"writer-ads-form-section-title",children:[r.jsx("strong",{children:"Schedule"}),r.jsx("span",{children:"Optional"})]}),r.jsxs("div",{className:"writer-ads-field-grid compact-two",children:[r.jsxs("label",{className:"writer-ads-field",children:[r.jsx("span",{children:"Start date"}),r.jsx("input",{type:"date",value:d.start_date,onChange:e=>g("start_date",e.target.value)})]}),r.jsxs("label",{className:"writer-ads-field",children:[r.jsx("span",{children:"End date"}),r.jsx("input",{type:"date",value:d.end_date,onChange:e=>g("end_date",e.target.value)})]})]})]}),F?r.jsx("div",{className:"writer-ads-alert error",children:F}):null,r.jsxs("div",{className:"writer-ads-drawer-actions",children:[r.jsx("button",{type:"button",className:"writer-ads-btn",onClick:V,disabled:P,children:"Cancel"}),r.jsx("button",{type:"submit",className:"writer-ads-btn primary",disabled:P||d.ad_type==="website"&&!i,children:P?"Saving...":S?"Save Changes":"Submit For Approval"})]})]})]})})}):null,we?r.jsx("div",{className:"writer-ads-topup-overlay",role:"presentation",onMouseDown:e=>{e.target===e.currentTarget&&!j&&E(!1)},children:r.jsxs("form",{className:"writer-ads-topup-card",onSubmit:Se,children:[r.jsx("h3",{children:"Top Up Campaign"}),r.jsx("p",{children:"Add more campaign budget using the existing Ads Account top-up flow."}),r.jsxs("label",{className:"writer-ads-field",children:[r.jsx("span",{children:"Top-up amount"}),r.jsx("input",{type:"number",min:m||10,step:"0.01",value:U.amount,onChange:e=>W(a=>({...a,amount:e.target.value})),required:!0,autoFocus:!0})]}),r.jsxs("div",{className:"writer-ads-topup-actions",children:[r.jsx("button",{type:"button",className:"writer-ads-btn",onClick:()=>E(!1),disabled:!!j,children:"Cancel"}),r.jsx("button",{type:"submit",className:"writer-ads-btn primary",disabled:!!j,children:j?"Processing...":"Top Up"})]})]})}):null]})}export{$e as default};
