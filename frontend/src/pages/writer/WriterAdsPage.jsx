import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const EMPTY_FORM = {
  ad_type: 'product',
  target_id: '',
  website_id: '',
  campaign_title: '',
  campaign_description: '',
  campaign_image: '',
  total_budget: '10',
  daily_budget_cap: '',
  start_date: '',
  end_date: '',
  bid_cost_per_view: '',
  bid_cost_per_click: '',
  currency: 'USD',
};

const EMPTY_TOPUP = {
  campaign_id: '',
  amount: '10',
};

const writerAdsCss = `
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
`;

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatMoney(value, currency = 'USD', digits = 2) {
  const amount = toNumber(value);
  const safeDigits = Number.isFinite(Number(digits)) ? Number(digits) : 2;

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: safeDigits,
      maximumFractionDigits: safeDigits,
    }).format(amount);
  } catch {
    return `${currency || 'USD'} ${amount.toFixed(safeDigits)}`;
  }
}

function formatRate(value) {
  const amount = toNumber(value);
  if (amount >= 1) return formatMoney(amount, 'USD', 2);
  return `$${amount.toFixed(4)}`;
}

function formatCount(value) {
  return new Intl.NumberFormat().format(Math.max(0, toNumber(value)));
}

function formatPercent(value) {
  return `${Math.max(0, toNumber(value)).toFixed(2)}%`;
}

function dateInput(value) {
  if (!value) return '';
  const raw = String(value);
  return raw.length >= 10 ? raw.slice(0, 10) : raw;
}

function displayDate(value) {
  if (!value) return 'Open';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function baseRate(settings, type) {
  const defaults = {
    product: { view: 0.0015, click: 0.07 },
    post: { view: 0.001, click: 0.04 },
    website: { view: 0.001, click: 0.05 },
  };

  const fallback = defaults[type] || defaults.product;

  return {
    view: toNumber(settings?.[`${type}_cost_per_view`], fallback.view),
    click: toNumber(settings?.[`${type}_cost_per_click`], fallback.click),
  };
}

function normalizeCampaigns(payload) {
  if (Array.isArray(payload?.campaigns)) return payload.campaigns;
  if (Array.isArray(payload?.ads)) return payload.ads;
  if (Array.isArray(payload?.data?.campaigns)) return payload.data.campaigns;
  if (Array.isArray(payload?.data?.ads)) return payload.data.ads;
  return [];
}

function normalizeOptions(payload) {
  const rawWebsite =
    payload?.website ||
    (Array.isArray(payload?.websites) ? payload.websites[0] : null) ||
    null;

  return {
    settings: payload?.settings || {},
    website: rawWebsite,
    products: Array.isArray(payload?.products) ? payload.products : [],
    posts: Array.isArray(payload?.posts) ? payload.posts : [],
  };
}

function spentForCampaign(campaign) {
  const explicit =
    campaign?.spent_amount ??
    campaign?.total_spent ??
    campaign?.spent ??
    campaign?.budget_spent;

  if (explicit !== undefined && explicit !== null && explicit !== '') {
    return Math.max(0, toNumber(explicit));
  }

  return Math.max(
    0,
    toNumber(campaign?.total_budget) - toNumber(campaign?.remaining_budget)
  );
}

function campaignStatus(campaign) {
  return String(campaign?.status || 'pending').toLowerCase();
}

function approvalStatus(campaign) {
  return String(campaign?.approval_status || 'pending').toLowerCase();
}

function statusLabel(value) {
  if (value === 'daily_paused') return 'Daily Paused';
  if (value === 'pending') return 'Pending';
  if (value === 'approved') return 'Approved';
  if (value === 'rejected') return 'Rejected';
  if (value === 'exhausted') return 'Exhausted';
  if (value === 'ended') return 'Ended';
  if (value === 'paused') return 'Paused';
  if (value === 'active') return 'Active';
  return value ? value.replace(/_/g, ' ') : 'Pending';
}

export default function WriterAdsPage() {
  const [settings, setSettings] = useState({});
  const [website, setWebsite] = useState(null);
  const [products, setProducts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [topup, setTopup] = useState(EMPTY_TOPUP);
  const [topupOpen, setTopupOpen] = useState(false);

  const minimumBudget = Math.max(0, toNumber(settings?.minimum_budget, 10));

  const rates = useMemo(
    () => ({
      product: baseRate(settings, 'product'),
      post: baseRate(settings, 'post'),
      website: baseRate(settings, 'website'),
    }),
    [settings]
  );

  const load = useCallback(async (refresh = false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      setError('');

      const [optionsResponse, campaignsResponse] = await Promise.all([
        api.get('/affiliate/ads/options'),
        api.get('/affiliate/ads'),
      ]);

      const options = normalizeOptions(optionsResponse?.data || {});
      setSettings(options.settings);
      setWebsite(options.website);
      setProducts(options.products);
      setPosts(options.posts);
      setCampaigns(normalizeCampaigns(campaignsResponse?.data || {}));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load Ads Account.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const stats = useMemo(() => {
    const totalBudget = campaigns.reduce(
      (sum, campaign) => sum + toNumber(campaign?.total_budget),
      0
    );
    const remaining = campaigns.reduce(
      (sum, campaign) => sum + toNumber(campaign?.remaining_budget),
      0
    );
    const views = campaigns.reduce(
      (sum, campaign) => sum + toNumber(campaign?.total_views),
      0
    );
    const clicks = campaigns.reduce(
      (sum, campaign) => sum + toNumber(campaign?.total_clicks),
      0
    );
    const active = campaigns.filter(
      (campaign) => campaignStatus(campaign) === 'active'
    ).length;
    const pending = campaigns.filter(
      (campaign) => approvalStatus(campaign) === 'pending'
    ).length;

    return {
      totalBudget,
      remaining,
      views,
      clicks,
      ctr: views > 0 ? (clicks / views) * 100 : 0,
      active,
      pending,
    };
  }, [campaigns]);

  function resetMessages() {
    setError('');
    setNotice('');
  }

  function createDefaults(type = 'product') {
    const rate = rates[type] || rates.product;

    return {
      ...EMPTY_FORM,
      ad_type: type,
      target_id:
        type === 'website'
          ? String(website?.id || '')
          : '',
      website_id: String(website?.id || ''),
      total_budget: String(minimumBudget || 10),
      bid_cost_per_view: String(rate.view),
      bid_cost_per_click: String(rate.click),
      currency: settings?.currency || 'USD',
    };
  }

  function openCreate() {
    resetMessages();
    setEditingId('');
    setForm(createDefaults('product'));
    setDrawerOpen(true);
  }

  function targetIdFromCampaign(campaign) {
    return String(
      campaign?.target_id ??
      campaign?.product_id ??
      campaign?.post_id ??
      campaign?.website_id ??
      ''
    );
  }

  function openEdit(campaign) {
    if (!campaign) return;
    resetMessages();

    const type = String(campaign?.ad_type || 'product').toLowerCase();
    const rate = rates[type] || rates.product;

    setEditingId(String(campaign.id));
    setForm({
      ad_type: type,
      target_id: targetIdFromCampaign(campaign),
      website_id: String(campaign?.website_id || website?.id || ''),
      campaign_title: campaign?.campaign_title || campaign?.title || '',
      campaign_description:
        campaign?.campaign_description || campaign?.description || '',
      campaign_image: campaign?.campaign_image || campaign?.image || '',
      total_budget: String(toNumber(campaign?.total_budget, minimumBudget || 10)),
      daily_budget_cap:
        campaign?.daily_budget_cap === null ||
        campaign?.daily_budget_cap === undefined
          ? ''
          : String(campaign.daily_budget_cap),
      start_date: dateInput(campaign?.start_date),
      end_date: dateInput(campaign?.end_date),
      bid_cost_per_view: String(
        toNumber(
          campaign?.bid_cost_per_view ?? campaign?.cost_per_view,
          rate.view
        )
      ),
      bid_cost_per_click: String(
        toNumber(
          campaign?.bid_cost_per_click ?? campaign?.cost_per_click,
          rate.click
        )
      ),
      currency: campaign?.currency || settings?.currency || 'USD',
    });
    setDrawerOpen(true);
  }

  function closeDrawer() {
    if (saving) return;
    setDrawerOpen(false);
    setEditingId('');
    setForm(EMPTY_FORM);
  }

  function changeType(type) {
    const rate = rates[type] || rates.product;

    setForm((current) => ({
      ...current,
      ad_type: type,
      target_id:
        type === 'website'
          ? String(website?.id || '')
          : '',
      website_id: String(website?.id || current.website_id || ''),
      bid_cost_per_view: String(rate.view),
      bid_cost_per_click: String(rate.click),
    }));
  }

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function onImageFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!String(file.type || '').startsWith('image/')) {
      setError('Please choose an image file.');
      event.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Campaign image must be 2 MB or smaller.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateField('campaign_image', String(reader.result || ''));
      setError('');
    };
    reader.onerror = () => setError('Unable to read that image.');
    reader.readAsDataURL(file);
  }

  function currentTargetOptions() {
    if (form.ad_type === 'product') return products;
    if (form.ad_type === 'post') return posts;
    return website ? [website] : [];
  }

  function validateForm() {
    const targetId =
      form.ad_type === 'website'
        ? String(website?.id || form.target_id || '')
        : String(form.target_id || '');

    if (!targetId) {
      throw new Error(`Please choose the ${form.ad_type} you want to promote.`);
    }

    if (
      form.start_date &&
      form.end_date &&
      new Date(form.start_date) > new Date(form.end_date)
    ) {
      throw new Error('Start date cannot be after end date.');
    }
  }

  function payloadFromForm() {
    const type = form.ad_type;
    const targetId =
      type === 'website'
        ? String(website?.id || form.target_id || '')
        : String(form.target_id || '');
    const rate = rates[type] || rates.product;
    const safeBudget = Math.max(
      toNumber(form.total_budget, minimumBudget || 10),
      minimumBudget || 10
    );
    const safeViewBid = Math.max(
      toNumber(form.bid_cost_per_view, rate.view),
      rate.view
    );
    const safeClickBid = Math.max(
      toNumber(form.bid_cost_per_click, rate.click),
      rate.click
    );

    return {
      ad_type: type,
      target_id: String(targetId),
      website_id: String(form.website_id || website?.id || ''),
      campaign_title: String(form.campaign_title || ''),
      campaign_description: String(form.campaign_description || ''),
      campaign_image: String(form.campaign_image || ''),
      total_budget: String(safeBudget),
      daily_budget_cap: form.daily_budget_cap
        ? String(toNumber(form.daily_budget_cap))
        : '',
      start_date: form.start_date || '',
      end_date: form.end_date || '',
      bid_cost_per_view: String(safeViewBid),
      bid_cost_per_click: String(safeClickBid),
      currency: form.currency || settings?.currency || 'USD',
    };
  }

  async function saveCampaign(event) {
    event.preventDefault();

    try {
      setSaving(true);
      resetMessages();
      validateForm();

      const payload = payloadFromForm();

      const response = editingId
        ? await api.put(`/affiliate/ads/${editingId}`, payload)
        : await api.post('/affiliate/ads', payload);

      setNotice(
        response?.data?.message ||
          (editingId
            ? 'Campaign updated successfully.'
            : 'Campaign submitted for approval.')
      );
      setDrawerOpen(false);
      setEditingId('');
      setForm(EMPTY_FORM);
      await load(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to save this campaign.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(campaign, action) {
    if (!campaign?.id || !['pause', 'resume'].includes(action)) return;

    try {
      setBusyId(String(campaign.id));
      resetMessages();

      const { data } = await api.put(
        `/affiliate/ads/${campaign.id}/${action}`
      );

      setNotice(
        data?.message ||
          (action === 'pause'
            ? 'Campaign paused.'
            : 'Campaign resumed.')
      );

      await load(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          `Unable to ${action} this campaign.`
      );
    } finally {
      setBusyId('');
    }
  }

  function openTopup(campaign) {
    if (!campaign?.id) return;
    resetMessages();
    setTopup({
      campaign_id: String(campaign.id),
      amount: String(minimumBudget || 10),
    });
    setTopupOpen(true);
  }

  async function submitTopup(event) {
    event.preventDefault();

    const amount = toNumber(topup.amount);

    if (!topup.campaign_id || amount < (minimumBudget || 10)) {
      setError(
        `Top-up amount must be at least ${formatMoney(
          minimumBudget || 10,
          settings?.currency || 'USD'
        )}.`
      );
      return;
    }

    try {
      setBusyId(String(topup.campaign_id));
      resetMessages();

      const { data } = await api.post(
        `/affiliate/ads/${topup.campaign_id}/top-up`,
        {
          amount,
          currency: settings?.currency || 'USD',
        }
      );

      setNotice(data?.message || 'Campaign balance topped up successfully.');
      setTopupOpen(false);
      setTopup(EMPTY_TOPUP);
      await load(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to top up this campaign.'
      );
    } finally {
      setBusyId('');
    }
  }

  function targetMeta(campaign) {
    const type = String(campaign?.ad_type || 'product').toLowerCase();
    const id = Number(targetIdFromCampaign(campaign));

    if (type === 'website') {
      return {
        title:
          campaign?.target_title ||
          campaign?.website_name ||
          website?.website_name ||
          website?.name ||
          website?.slug ||
          'Writer website',
        image: campaign?.campaign_image || '',
      };
    }

    const source = type === 'post' ? posts : products;
    const match = source.find((item) => Number(item?.id) === id);

    return {
      title:
        campaign?.target_title ||
        campaign?.product_title ||
        campaign?.post_title ||
        match?.title ||
        `${statusLabel(type)} #${id || '-'}`,
      image:
        campaign?.campaign_image ||
        match?.image ||
        match?.product_image ||
        match?.featured_image ||
        '',
    };
  }

  return (
    <div className="writer-ads-page">
      <style>{writerAdsCss}</style>

      <main className="writer-ads-workspace">
        <section className="writer-ads-overview">
          <div>
            <span className="writer-ads-eyebrow">Sponsored promotion</span>
            <h2>Ads Account</h2>
            <p>
              Promote your own products, posts, or website. Control budget and
              bids while keeping campaign status, approval, views, clicks, and
              spend visible in one workspace.
            </p>
          </div>

          <div className="writer-ads-overview-actions">
            <button
              type="button"
              className="writer-ads-btn"
              onClick={() => load(true)}
              disabled={refreshing || loading}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>

            <button
              type="button"
              className="writer-ads-btn primary"
              onClick={openCreate}
              disabled={loading}
            >
              + Create Campaign
            </button>
          </div>
        </section>

        <section className="writer-ads-pricing" aria-label="Base ad rates">
          {['product', 'post', 'website'].map((type) => (
            <article className="writer-ads-price-card" key={type}>
              <div className="writer-ads-price-card-head">
                <strong>{statusLabel(type)} ads</strong>
                <span>Base rates</span>
              </div>
              <div className="writer-ads-price-pair">
                <div>
                  <span>Per view</span>
                  <strong>{formatRate(rates[type].view)}</strong>
                </div>
                <div>
                  <span>Per click</span>
                  <strong>{formatRate(rates[type].click)}</strong>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="writer-ads-stats" aria-label="Ads account statistics">
          <article className="writer-ads-stat">
            <span>Total budget</span>
            <strong>{formatMoney(stats.totalBudget, settings?.currency || 'USD')}</strong>
            <small>{campaigns.length} campaigns</small>
          </article>
          <article className="writer-ads-stat">
            <span>Remaining</span>
            <strong>{formatMoney(stats.remaining, settings?.currency || 'USD')}</strong>
            <small>{stats.active} active</small>
          </article>
          <article className="writer-ads-stat">
            <span>Views</span>
            <strong>{formatCount(stats.views)}</strong>
            <small>Recorded delivery</small>
          </article>
          <article className="writer-ads-stat">
            <span>Clicks</span>
            <strong>{formatCount(stats.clicks)}</strong>
            <small>Recorded engagement</small>
          </article>
          <article className="writer-ads-stat">
            <span>CTR</span>
            <strong>{formatPercent(stats.ctr)}</strong>
            <small>{stats.pending} awaiting approval</small>
          </article>
        </section>

        {error ? <div className="writer-ads-alert error">{error}</div> : null}
        {notice ? <div className="writer-ads-alert success">{notice}</div> : null}

        <section className="writer-ads-section">
          <div className="writer-ads-section-heading">
            <div>
              <h3>My campaigns</h3>
              <p>Budget, delivery, approval, and actions stay together.</p>
            </div>
            <span className="writer-ads-count">{campaigns.length}</span>
          </div>

          {loading ? (
            <div className="writer-ads-loading">
              <div className="writer-ads-spinner" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="writer-ads-empty">
              <div>
                <strong>No campaigns yet</strong>
                <p>
                  Create your first sponsored campaign to promote a product,
                  post, or your website.
                </p>
              </div>
            </div>
          ) : (
            <div className="writer-ads-campaign-grid">
              {campaigns.map((campaign) => {
                const totalBudget = Math.max(
                  0,
                  toNumber(campaign?.total_budget)
                );
                const remaining = Math.max(
                  0,
                  toNumber(campaign?.remaining_budget)
                );
                const spent = spentForCampaign(campaign);
                const views = Math.max(0, toNumber(campaign?.total_views));
                const clicks = Math.max(0, toNumber(campaign?.total_clicks));
                const ctr = views > 0 ? (clicks / views) * 100 : 0;
                const remainingPercent =
                  totalBudget > 0
                    ? Math.max(0, Math.min(100, (remaining / totalBudget) * 100))
                    : 0;
                const status = campaignStatus(campaign);
                const approval = approvalStatus(campaign);
                const meta = targetMeta(campaign);
                const type = String(campaign?.ad_type || 'product').toLowerCase();
                const rate = rates[type] || rates.product;
                const viewBid = toNumber(
                  campaign?.bid_cost_per_view ?? campaign?.cost_per_view,
                  rate.view
                );
                const clickBid = toNumber(
                  campaign?.bid_cost_per_click ?? campaign?.cost_per_click,
                  rate.click
                );
                const canPause = status === 'active';

                return (
                  <article className="writer-ads-campaign-card" key={campaign.id}>
                    <div className="writer-ads-campaign-head">
                      <div className="writer-ads-campaign-title-wrap">
                        <div className="writer-ads-badge-row">
                          <span className="writer-ads-pill type">
                            {statusLabel(type)}
                          </span>
                          <span className={`writer-ads-pill ${status}`}>
                            {statusLabel(status)}
                          </span>
                        </div>
                        <h4>
                          {campaign?.campaign_title ||
                            campaign?.title ||
                            'Untitled campaign'}
                        </h4>
                      </div>

                      <span className={`writer-ads-pill ${approval}`}>
                        {approval === 'pending'
                          ? 'Awaiting Approval'
                          : statusLabel(approval)}
                      </span>
                    </div>

                    <div className="writer-ads-target">
                      {meta.image ? (
                        <img
                          className="writer-ads-target-thumb"
                          src={meta.image}
                          alt=""
                        />
                      ) : (
                        <div className="writer-ads-target-thumb" />
                      )}
                      <div className="writer-ads-target-copy">
                        <span>Promoting</span>
                        <strong>{meta.title}</strong>
                      </div>
                    </div>

                    <div className="writer-ads-budget-block">
                      <div className="writer-ads-budget-row">
                        <span>
                          Remaining{' '}
                          <strong>
                            {formatMoney(
                              remaining,
                              campaign?.currency || settings?.currency || 'USD'
                            )}
                          </strong>
                        </span>
                        <span>
                          Budget{' '}
                          <strong>
                            {formatMoney(
                              totalBudget,
                              campaign?.currency || settings?.currency || 'USD'
                            )}
                          </strong>
                        </span>
                      </div>
                      <div className="writer-ads-progress">
                        <span style={{ width: `${remainingPercent}%` }} />
                      </div>
                    </div>

                    <div className="writer-ads-card-metrics">
                      <div>
                        <span>Views</span>
                        <strong>{formatCount(views)}</strong>
                      </div>
                      <div>
                        <span>Clicks</span>
                        <strong>{formatCount(clicks)}</strong>
                      </div>
                      <div>
                        <span>CTR</span>
                        <strong>{formatPercent(ctr)}</strong>
                      </div>
                      <div>
                        <span>Spent</span>
                        <strong>
                          {formatMoney(
                            spent,
                            campaign?.currency || settings?.currency || 'USD'
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="writer-ads-meta-grid">
                      <div>
                        <span>Daily cap</span>
                        <strong>
                          {campaign?.daily_budget_cap
                            ? formatMoney(
                                campaign.daily_budget_cap,
                                campaign?.currency || settings?.currency || 'USD'
                              )
                            : 'No cap'}
                        </strong>
                      </div>
                      <div>
                        <span>Approval</span>
                        <strong>{statusLabel(approval)}</strong>
                      </div>
                      <div>
                        <span>Bid / view</span>
                        <strong>{formatRate(viewBid)}</strong>
                      </div>
                      <div>
                        <span>Bid / click</span>
                        <strong>{formatRate(clickBid)}</strong>
                      </div>
                      <div>
                        <span>Starts</span>
                        <strong>{displayDate(campaign?.start_date)}</strong>
                      </div>
                      <div>
                        <span>Ends</span>
                        <strong>{displayDate(campaign?.end_date)}</strong>
                      </div>
                    </div>

                    <div className="writer-ads-card-actions">
                      <button
                        type="button"
                        className="writer-ads-btn compact"
                        onClick={() => openEdit(campaign)}
                        disabled={String(busyId) === String(campaign.id)}
                      >
                        Edit
                      </button>

                      {canPause ? (
                        <button
                          type="button"
                          className="writer-ads-btn compact danger-soft"
                          onClick={() => changeStatus(campaign, 'pause')}
                          disabled={String(busyId) === String(campaign.id)}
                        >
                          Pause
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="writer-ads-btn compact success"
                          onClick={() => changeStatus(campaign, 'resume')}
                          disabled={String(busyId) === String(campaign.id)}
                        >
                          Resume
                        </button>
                      )}

                      <button
                        type="button"
                        className="writer-ads-btn compact"
                        onClick={() => openTopup(campaign)}
                        disabled={String(busyId) === String(campaign.id)}
                      >
                        Top Up
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {drawerOpen ? (
        <div
          className="writer-ads-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDrawer();
          }}
        >
          <aside className="writer-ads-drawer" aria-label="Campaign editor">
            <div className="writer-ads-drawer-inner">
              <div className="writer-ads-drawer-head">
                <div>
                  <h3>{editingId ? 'Edit Campaign' : 'Create Campaign'}</h3>
                  <p>
                    {editingId
                      ? 'Campaign changes may require approval before delivery resumes.'
                      : 'Choose what to promote, set your budget and bids, then submit for approval.'}
                  </p>
                </div>
                <button
                  type="button"
                  className="writer-ads-close"
                  onClick={closeDrawer}
                  aria-label="Close campaign editor"
                >
                  x
                </button>
              </div>

              <form className="writer-ads-form" onSubmit={saveCampaign}>
                <section className="writer-ads-form-section">
                  <div className="writer-ads-form-section-title">
                    <strong>Campaign type</strong>
                    <span>Promote your own content</span>
                  </div>

                  <div className="writer-ads-type-selector">
                    {['product', 'post', 'website'].map((type) => (
                      <button
                        type="button"
                        key={type}
                        className={`writer-ads-type-btn ${
                          form.ad_type === type ? 'active' : ''
                        }`}
                        onClick={() => changeType(type)}
                      >
                        {statusLabel(type)}
                      </button>
                    ))}
                  </div>

                  <div className="writer-ads-rate-note">
                    <div>
                      <span>Base view rate</span>
                      <strong>{formatRate(rates[form.ad_type].view)}</strong>
                    </div>
                    <div>
                      <span>Base click rate</span>
                      <strong>{formatRate(rates[form.ad_type].click)}</strong>
                    </div>
                  </div>
                </section>

                <section className="writer-ads-form-section">
                  <div className="writer-ads-form-section-title">
                    <strong>Campaign details</strong>
                    <span>Required fields</span>
                  </div>

                  <div className="writer-ads-field-grid">
                    <label className="writer-ads-field full">
                      <span>What do you want to promote?</span>
                      <select
                        value={
                          form.ad_type === 'website'
                            ? String(website?.id || form.target_id || '')
                            : form.target_id
                        }
                        onChange={(event) =>
                          updateField('target_id', event.target.value)
                        }
                        required
                      >
                        <option value="">Choose target</option>
                        {currentTargetOptions().map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.title ||
                              item.website_name ||
                              item.name ||
                              item.slug ||
                              `Item #${item.id}`}
                          </option>
                        ))}
                      </select>
                      {form.ad_type === 'website' && !website ? (
                        <small>
                          Create your Writer website before promoting it.
                        </small>
                      ) : null}
                    </label>

                    <label className="writer-ads-field full">
                      <span>Campaign title</span>
                      <input
                        value={form.campaign_title}
                        onChange={(event) =>
                          updateField('campaign_title', event.target.value)
                        }
                        placeholder="Example: Promote my summer buying guide"
                      />
                    </label>

                    <label className="writer-ads-field full">
                      <span>Description</span>
                      <textarea
                        value={form.campaign_description}
                        onChange={(event) =>
                          updateField('campaign_description', event.target.value)
                        }
                        placeholder="Add a short campaign note or description."
                      />
                    </label>

                    <label className="writer-ads-field full">
                      <span>Campaign image URL</span>
                      <input
                        value={form.campaign_image}
                        onChange={(event) =>
                          updateField('campaign_image', event.target.value)
                        }
                        placeholder="https://..."
                      />
                      <small>
                        Optional. Paste an image URL or choose a local image below.
                      </small>
                    </label>

                    <label className="writer-ads-field full">
                      <span>Choose local image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onImageFile}
                      />
                      <small>Maximum local image size: 2 MB.</small>
                    </label>

                    {form.campaign_image ? (
                      <div className="writer-ads-image-preview writer-ads-field full">
                        <img src={form.campaign_image} alt="" />
                        <span>
                          Campaign creative preview. The stored value follows the
                          existing Ads Account image field.
                        </span>
                      </div>
                    ) : null}
                  </div>
                </section>

                <section className="writer-ads-form-section">
                  <div className="writer-ads-form-section-title">
                    <strong>Budget and bids</strong>
                    <span>
                      Minimum budget{' '}
                      {formatMoney(minimumBudget, form.currency || 'USD')}
                    </span>
                  </div>

                  <div className="writer-ads-field-grid compact-two">
                    <label className="writer-ads-field">
                      <span>Total budget</span>
                      <input
                        type="number"
                        min={minimumBudget}
                        step="0.01"
                        value={form.total_budget}
                        onChange={(event) =>
                          updateField('total_budget', event.target.value)
                        }
                        required
                      />
                    </label>

                    <label className="writer-ads-field">
                      <span>Daily cap</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.daily_budget_cap}
                        onChange={(event) =>
                          updateField('daily_budget_cap', event.target.value)
                        }
                        placeholder="Optional"
                      />
                    </label>

                    <label className="writer-ads-field">
                      <span>Bid per view</span>
                      <input
                        type="number"
                        min={rates[form.ad_type].view}
                        step="0.0001"
                        value={form.bid_cost_per_view}
                        onChange={(event) =>
                          updateField('bid_cost_per_view', event.target.value)
                        }
                        required
                      />
                    </label>

                    <label className="writer-ads-field">
                      <span>Bid per click</span>
                      <input
                        type="number"
                        min={rates[form.ad_type].click}
                        step="0.0001"
                        value={form.bid_cost_per_click}
                        onChange={(event) =>
                          updateField('bid_cost_per_click', event.target.value)
                        }
                        required
                      />
                    </label>
                  </div>
                </section>

                <section className="writer-ads-form-section">
                  <div className="writer-ads-form-section-title">
                    <strong>Schedule</strong>
                    <span>Optional</span>
                  </div>

                  <div className="writer-ads-field-grid compact-two">
                    <label className="writer-ads-field">
                      <span>Start date</span>
                      <input
                        type="date"
                        value={form.start_date}
                        onChange={(event) =>
                          updateField('start_date', event.target.value)
                        }
                      />
                    </label>

                    <label className="writer-ads-field">
                      <span>End date</span>
                      <input
                        type="date"
                        value={form.end_date}
                        onChange={(event) =>
                          updateField('end_date', event.target.value)
                        }
                      />
                    </label>
                  </div>
                </section>

                {error ? <div className="writer-ads-alert error">{error}</div> : null}

                <div className="writer-ads-drawer-actions">
                  <button
                    type="button"
                    className="writer-ads-btn"
                    onClick={closeDrawer}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="writer-ads-btn primary"
                    disabled={
                      saving ||
                      (form.ad_type === 'website' && !website)
                    }
                  >
                    {saving
                      ? 'Saving...'
                      : editingId
                        ? 'Save Changes'
                        : 'Submit For Approval'}
                  </button>
                </div>
              </form>
            </div>
          </aside>
        </div>
      ) : null}

      {topupOpen ? (
        <div
          className="writer-ads-topup-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busyId) {
              setTopupOpen(false);
            }
          }}
        >
          <form className="writer-ads-topup-card" onSubmit={submitTopup}>
            <h3>Top Up Campaign</h3>
            <p>
              Add more campaign budget using the existing Ads Account top-up
              flow.
            </p>

            <label className="writer-ads-field">
              <span>Top-up amount</span>
              <input
                type="number"
                min={minimumBudget || 10}
                step="0.01"
                value={topup.amount}
                onChange={(event) =>
                  setTopup((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
                required
                autoFocus
              />
            </label>

            <div className="writer-ads-topup-actions">
              <button
                type="button"
                className="writer-ads-btn"
                onClick={() => setTopupOpen(false)}
                disabled={!!busyId}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="writer-ads-btn primary"
                disabled={!!busyId}
              >
                {busyId ? 'Processing...' : 'Top Up'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
