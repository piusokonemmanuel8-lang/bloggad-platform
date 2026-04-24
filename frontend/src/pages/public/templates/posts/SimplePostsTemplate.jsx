import { useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Mail,
  Search,
  Shield,
  Star,
  Users,
  Zap,
  BarChart3,
  Box,
  Workflow,
  XCircle,
} from 'lucide-react';

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getFieldValue(field, fallback = '') {
  if (field === null || field === undefined) return fallback;

  if (typeof field === 'string' || typeof field === 'number') {
    return String(field);
  }

  return field?.value || field?.field_value || field?.content || field?.text || fallback;
}

function getButtonValue(button, key, fallback = '') {
  if (!button) return fallback;

  return button?.[key] || button?.button?.[key] || button?.settings?.[key] || fallback;
}

function useTemplateMap(templateFields, ctaButtons) {
  return useMemo(() => {
    const fieldMap = {};
    const buttonMap = {};

    normalizeArray(templateFields).forEach((field) => {
      const key = field?.key || field?.field_key || field?.name;
      if (key) fieldMap[key] = getFieldValue(field);
    });

    normalizeArray(ctaButtons).forEach((button) => {
      const key = button?.key || button?.button_key || button?.name;
      if (key) buttonMap[key] = button;
    });

    return { fieldMap, buttonMap };
  }, [templateFields, ctaButtons]);
}

function getButtonProps(button, fallbackLabel) {
  return {
    label:
      getButtonValue(button, 'label') ||
      getButtonValue(button, 'button_label') ||
      fallbackLabel,
    url:
      getButtonValue(button, 'url') ||
      getButtonValue(button, 'button_url') ||
      getButtonValue(button, 'destination_url') ||
      '#',
    target:
      getButtonValue(button, 'open_in_new_tab') === true ||
      getButtonValue(button, 'target') === '_blank'
        ? '_blank'
        : '_self',
  };
}

function getAdContent(ad) {
  if (!ad) return null;

  const image =
    ad?.image ||
    ad?.image_url ||
    ad?.banner_image ||
    ad?.banner_image_url ||
    ad?.creative_url ||
    ad?.media_url;

  const html = ad?.html || ad?.ad_html || ad?.code;
  const title = ad?.title || ad?.name || ad?.headline;
  const url = ad?.url || ad?.link || ad?.destination_url || ad?.target_url;

  if (!image && !html && !title) return null;

  return { image, html, title, url };
}

function resolvePlacementAd(placements, keys = []) {
  if (!placements || typeof placements !== 'object') return null;

  for (const key of keys) {
    const direct = placements[key];
    const nested = placements?.[key]?.ad || placements?.[key]?.campaign;

    const directContent = getAdContent(direct);
    if (directContent) return directContent;

    const nestedContent = getAdContent(nested);
    if (nestedContent) return nestedContent;
  }

  return null;
}

function AdSlot({ placements, keys, className = '', label = '' }) {
  const ad = resolvePlacementAd(placements, keys);

  if (!ad) return null;

  const content = ad.image ? (
    <img src={ad.image} alt={ad.title || label || 'Advertisement'} />
  ) : ad.html ? (
    <div dangerouslySetInnerHTML={{ __html: ad.html }} />
  ) : (
    <span>{ad.title}</span>
  );

  if (ad.url && ad.url !== '#') {
    return (
      <a className={`sp-ad-slot ${className}`} href={ad.url} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }

  return <div className={`sp-ad-slot ${className}`}>{content}</div>;
}

function CtaButton({ button, fallbackLabel, className = '' }) {
  const props = getButtonProps(button, fallbackLabel);

  return (
    <a className={`sp-cta-btn ${className}`} href={props.url || '#'} target={props.target} rel="noreferrer">
      {props.label}
      <span>→</span>
    </a>
  );
}

function ImageBox({ src, icon: Icon = Box, alt = '' }) {
  if (src) {
    return (
      <div className="sp-image-box has-image">
        <img src={src} alt={alt || 'Blog visual'} />
      </div>
    );
  }

  return (
    <div className="sp-image-box">
      <Icon size={54} strokeWidth={1.8} />
    </div>
  );
}

function FeatureItem({ icon: Icon, title, text }) {
  if (!title && !text) return null;

  return (
    <div className="sp-feature-item">
      <div className="sp-feature-icon">
        <Icon size={21} />
      </div>
      <div>
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
    </div>
  );
}

function ProsConsBox({ title, items, type }) {
  const cleanItems = items.filter(Boolean);
  if (!title && cleanItems.length === 0) return null;

  return (
    <div className={`sp-pros-cons-box ${type}`}>
      <h4>
        <span>{title}</span>
        {type === 'pros' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
      </h4>
      <ul>
        {cleanItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  if (!question && !answer) return null;

  return (
    <div className="sp-faq-item">
      <button type="button" onClick={() => setOpen((value) => !value)}>
        <span>{question}</span>
        <ChevronDown size={16} className={open ? 'is-open' : ''} />
      </button>

      {open ? <p>{answer}</p> : null}
    </div>
  );
}

function RelatedCard({ title, image, meta, url }) {
  if (!title && !image) return null;

  const card = (
    <article className="sp-related-card">
      <ImageBox src={image} alt={title} />
      <div className="sp-related-content">
        <h4>{title}</h4>
        <p>{meta}</p>
      </div>
    </article>
  );

  if (url) {
    return (
      <a href={url} className="sp-related-link">
        {card}
      </a>
    );
  }

  return card;
}

function EmailCaptureBox({ fieldMap }) {
  const title = fieldMap.email_capture_title || 'Stay Updated';
  const text =
    fieldMap.email_capture_text ||
    'Get the latest reviews, guides, and deals straight to your inbox.';
  const placeholder = fieldMap.email_capture_placeholder || 'Enter your email';
  const buttonLabel = fieldMap.email_capture_button_label || 'Subscribe';
  const privacy = fieldMap.email_capture_privacy_text || 'We respect your privacy.';

  return (
    <div className="sp-email-box">
      <div className="sp-email-icon">
        <Mail size={28} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      <form onSubmit={(event) => event.preventDefault()}>
        <input type="email" placeholder={placeholder} />
        <button type="submit">{buttonLabel}</button>
      </form>
      <small>{privacy}</small>
    </div>
  );
}

export default function SimplePostsTemplate({
  post,
  templateFields,
  ctaButtons,
  relatedPosts,
  website,
  websiteSlug,
  adPlacements,
  placements,
  platformPlacements,
  directPlacements,
}) {
  const { fieldMap, buttonMap } = useTemplateMap(templateFields, ctaButtons);

  const allPlacements = {
    ...(placements || {}),
    ...(adPlacements || {}),
    ...(platformPlacements || {}),
    ...(directPlacements || {}),
  };

  const blogName =
    website?.store_name ||
    website?.website_name ||
    website?.name ||
    post?.website_name ||
    post?.store_name ||
    websiteSlug ||
    'DemoBlog';

  const title =
    fieldMap.hero_title ||
    post?.title ||
    'ProductX Review: The All-in-One Tool for Modern Teams';

  const subtitle =
    fieldMap.hero_subtitle ||
    post?.excerpt ||
    'Deep dive into features, pricing, pros and cons, and who it’s best for.';

  const heroImage =
    fieldMap.hero_image ||
    post?.featured_image ||
    post?.image_url ||
    post?.cover_image;

  const summaryButton = buttonMap.summary_cta;
  const finalButton = buttonMap.final_verdict_cta;

  const faqItems = [
    [fieldMap.faq_1_question, fieldMap.faq_1_answer],
    [fieldMap.faq_2_question, fieldMap.faq_2_answer],
    [fieldMap.faq_3_question, fieldMap.faq_3_answer],
    [fieldMap.faq_4_question, fieldMap.faq_4_answer],
  ];

  const liveRelatedPosts = normalizeArray(relatedPosts);

  return (
    <div className="simple-posts-template">
      <style>{`
        .simple-posts-template {
          --sp-blue: #1f73ea;
          --sp-blue-dark: #155bd6;
          --sp-blue-soft: #eaf3ff;
          --sp-border: #d8e2f1;
          --sp-border-soft: #eef3fa;
          --sp-text: #0f172a;
          --sp-muted: #607089;
          --sp-soft: #f8fbff;
          width: 100%;
          min-height: 100vh;
          background: #ffffff;
          color: var(--sp-text);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .simple-posts-template * {
          box-sizing: border-box;
        }

        .sp-shell {
          width: min(1500px, calc(100% - 32px));
          margin: 0 auto;
          border: 1px solid var(--sp-border);
          border-radius: 10px;
          overflow: hidden;
          background: #fff;
        }

        .sp-top-notice {
          min-height: 54px;
          padding: 12px 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          border-bottom: 1px solid var(--sp-border);
          background: #fbfdff;
          color: #1f2937;
          font-size: 16px;
          font-weight: 800;
          text-align: center;
        }

        .sp-top-notice a {
          color: var(--sp-blue);
          text-decoration: none;
          font-weight: 900;
        }

        .sp-nav {
          min-height: 68px;
          padding: 0 42px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--sp-border);
          background: #fff;
          gap: 22px;
        }

        .sp-logo {
          min-width: 210px;
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 20px;
          font-weight: 950;
          color: #111827;
          white-space: nowrap;
        }

        .sp-logo-mark {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: var(--sp-blue-soft);
          color: var(--sp-blue);
          display: grid;
          place-items: center;
          font-weight: 950;
        }

        .sp-nav-links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 44px;
          font-size: 15px;
          font-weight: 900;
          color: #111827;
          flex: 1;
        }

        .sp-nav-actions {
          min-width: 210px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 22px;
        }

        .sp-subscribe-btn {
          border: 0;
          border-radius: 7px;
          background: var(--sp-blue);
          color: #fff;
          padding: 13px 24px;
          font-size: 14px;
          font-weight: 950;
          cursor: pointer;
        }

        .sp-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 400px;
          gap: 34px;
          padding: 36px 42px 30px;
        }

        .sp-main {
          min-width: 0;
          width: 100%;
          max-width: none;
        }

        .sp-sidebar {
          border-left: 1px solid var(--sp-border-soft);
          padding-left: 34px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          min-width: 0;
        }

        .sp-category {
          display: inline-flex;
          align-items: center;
          background: var(--sp-blue-soft);
          color: var(--sp-blue);
          font-size: 14px;
          font-weight: 950;
          padding: 7px 15px;
          border-radius: 999px;
          margin-bottom: 18px;
        }

        .sp-title {
          font-size: clamp(44px, 4.2vw, 62px);
          line-height: .98;
          letter-spacing: -0.065em;
          margin: 0 0 14px;
          max-width: 980px;
          color: #0b1220;
        }

        .sp-subtitle {
          color: #596985;
          font-size: 18px;
          font-weight: 800;
          line-height: 1.55;
          margin: 0 0 28px;
          max-width: 940px;
        }

        .sp-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          color: #475467;
          font-size: 15px;
          font-weight: 900;
          margin-bottom: 30px;
        }

        .sp-author-avatar {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          background: #e7edf7;
          overflow: hidden;
          display: grid;
          place-items: center;
          color: #5d6c82;
        }

        .sp-author-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sp-author-name {
          color: var(--sp-blue);
        }

        .sp-hero-image {
          width: 100%;
          height: clamp(260px, 27vw, 390px);
          border: 1px solid #9fc1f4;
          border-radius: 8px;
          overflow: hidden;
          background: #ffffff;
          margin-bottom: 18px;
          display: grid;
          place-items: center;
        }

        .sp-hero-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center center;
          display: block;
          background: #ffffff;
        }

        .sp-placeholder-mountain {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          color: #98b6e5;
          background: linear-gradient(180deg, #eaf3ff 0%, #e6f0ff 100%);
        }

        .sp-summary-card {
          display: grid;
          grid-template-columns: 180px minmax(0, 1fr);
          border: 1px solid #b9cff0;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 22px;
          background: #fff;
        }

        .sp-summary-left {
          border-right: 1px solid #b9cff0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 24px 16px;
          text-align: center;
          color: var(--sp-blue);
          font-size: 14px;
          font-weight: 950;
          background: #fbfdff;
        }

        .sp-star-circle {
          width: 70px;
          height: 70px;
          border-radius: 999px;
          border: 2px solid var(--sp-blue);
          background: var(--sp-blue-soft);
          display: grid;
          place-items: center;
        }

        .sp-summary-body {
          padding: 24px 26px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 24px;
          align-items: center;
        }

        .sp-summary-body p {
          margin: 0 0 12px;
          color: #111827;
          font-size: 15px;
          line-height: 1.55;
          font-weight: 700;
        }

        .sp-summary-body strong {
          color: #0f172a;
          margin-right: 10px;
          font-weight: 950;
        }

        .sp-check-list {
          display: grid;
          gap: 9px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .sp-check-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14px;
          line-height: 1.35;
          font-weight: 750;
          color: #344054;
        }

        .sp-check-list svg {
          color: var(--sp-blue);
          flex: 0 0 auto;
          margin-top: 1px;
        }

        .sp-cta-btn {
          height: 50px;
          min-width: 210px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: var(--sp-blue);
          color: #fff;
          border-radius: 7px;
          padding: 0 24px;
          text-decoration: none;
          font-size: 15px;
          font-weight: 950;
          white-space: nowrap;
          box-shadow: 0 12px 22px rgba(31, 115, 234, .18);
        }

        .sp-cta-btn:hover {
          background: var(--sp-blue-dark);
        }

        .sp-section {
          margin-top: 22px;
        }

        .sp-section h2 {
          margin: 0 0 8px;
          font-size: 24px;
          letter-spacing: -0.035em;
          line-height: 1.1;
          color: #0f172a;
        }

        .sp-section p {
          margin: 0 0 11px;
          color: #1f2937;
          font-size: 15.5px;
          line-height: 1.58;
          font-weight: 650;
        }

        .sp-content-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 330px;
          gap: 28px;
          align-items: center;
          border-top: 1px solid var(--sp-border-soft);
          padding-top: 20px;
          margin-top: 18px;
        }

        .sp-image-box {
          min-height: 130px;
          border: 1px solid #a9c5ef;
          background: var(--sp-blue-soft);
          color: #8daee1;
          border-radius: 7px;
          display: grid;
          place-items: center;
          overflow: hidden;
        }

        .sp-image-box.has-image img,
        .sp-related-card .sp-image-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .sp-ad-slot {
          width: 100%;
          border: 1px dashed #9fb4d4;
          background: #f5f9ff;
          color: #111827;
          display: grid;
          place-items: center;
          text-decoration: none;
          overflow: hidden;
          font-size: 18px;
          font-weight: 800;
          text-align: center;
        }

        .sp-ad-slot img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .sp-inline-ad {
          height: 90px;
          margin: 24px 0 20px;
          border-radius: 7px;
        }

        .sp-sidebar-ad {
          height: 250px;
          border-style: solid;
          border-color: #9fc1f4;
          border-radius: 8px;
        }

        .sp-sticky-ad {
          min-height: 600px;
          border-style: solid;
          border-color: #9fc1f4;
          border-radius: 8px;
          position: sticky;
          top: 18px;
        }

        .sp-features-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 28px 42px;
          margin-top: 22px;
        }

        .sp-feature-item {
          display: grid;
          grid-template-columns: 58px minmax(0, 1fr);
          gap: 16px;
          align-items: start;
          max-width: 100%;
        }

        .sp-feature-icon {
          width: 58px;
          height: 58px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: var(--sp-blue-soft);
          color: var(--sp-blue);
          flex: 0 0 auto;
        }

        .sp-feature-item h4 {
          margin: 3px 0 7px;
          font-size: 16px;
          line-height: 1.25;
          letter-spacing: -0.01em;
          color: #111827;
        }

        .sp-feature-item p {
          margin: 0;
          font-size: 14.5px;
          line-height: 1.55;
          color: #475467;
          font-weight: 650;
        }

        .sp-pros-cons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-top: 28px;
        }

        .sp-pros-cons-box {
          border-radius: 7px;
          padding: 18px 22px;
          min-height: 140px;
        }

        .sp-pros-cons-box.pros {
          background: #f3fff3;
          border: 1px solid #bfe7c1;
        }

        .sp-pros-cons-box.cons {
          background: #fff6f6;
          border: 1px solid #ffc5c5;
        }

        .sp-pros-cons-box h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 10px;
          font-size: 15px;
        }

        .sp-pros-cons-box.pros h4 svg {
          color: #35b653;
        }

        .sp-pros-cons-box.cons h4 svg {
          color: #ff5964;
        }

        .sp-pros-cons-box ul {
          margin: 0;
          padding-left: 18px;
          display: grid;
          gap: 6px;
        }

        .sp-pros-cons-box li {
          font-size: 13.5px;
          line-height: 1.4;
          color: #1f2937;
          font-weight: 700;
        }

        .sp-faq-list {
          border: 1px solid var(--sp-border);
          border-radius: 7px;
          overflow: hidden;
          background: #fff;
        }

        .sp-faq-item + .sp-faq-item {
          border-top: 1px solid var(--sp-border);
        }

        .sp-faq-item button {
          width: 100%;
          border: 0;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 42px;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 950;
          color: #111827;
          cursor: pointer;
          text-align: left;
        }

        .sp-faq-item svg {
          transition: transform .2s ease;
        }

        .sp-faq-item svg.is-open {
          transform: rotate(180deg);
        }

        .sp-faq-item p {
          padding: 0 18px 14px;
          margin: 0;
          color: #475467;
          font-size: 14px;
          line-height: 1.55;
        }

        .sp-final-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 24px;
          align-items: center;
          margin-top: 26px;
        }

        .sp-related-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-top: 12px;
        }

        .sp-related-link {
          color: inherit;
          text-decoration: none;
        }

        .sp-related-card {
          border: 1px solid #c8d6eb;
          border-radius: 7px;
          overflow: hidden;
          background: #fff;
          height: 100%;
        }

        .sp-related-card .sp-image-box {
          border: 0;
          border-radius: 0;
          min-height: 110px;
        }

        .sp-related-content {
          padding: 13px 14px 15px;
        }

        .sp-related-card h4 {
          margin: 0 0 8px;
          font-size: 15px;
          line-height: 1.18;
          letter-spacing: -0.02em;
          color: #111827;
        }

        .sp-related-card p {
          margin: 0;
          color: #667085;
          font-size: 12.5px;
          font-weight: 800;
        }

        .sp-email-box {
          border: 1px solid var(--sp-border);
          border-radius: 10px;
          padding: 34px 26px;
          text-align: center;
          background: #fff;
        }

        .sp-email-icon {
          width: 72px;
          height: 72px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: var(--sp-blue-soft);
          color: var(--sp-blue);
          margin: 0 auto 18px;
        }

        .sp-email-box h3 {
          margin: 0 0 10px;
          font-size: 24px;
          line-height: 1.15;
          letter-spacing: -0.035em;
        }

        .sp-email-box p {
          margin: 0 auto 22px;
          color: #475467;
          font-size: 14.5px;
          line-height: 1.48;
          font-weight: 700;
          max-width: 280px;
        }

        .sp-email-box form {
          display: grid;
          gap: 11px;
        }

        .sp-email-box input {
          width: 100%;
          height: 48px;
          border: 1px solid var(--sp-border);
          border-radius: 6px;
          padding: 0 15px;
          font-size: 14px;
          outline: none;
        }

        .sp-email-box button {
          height: 48px;
          border: 0;
          border-radius: 6px;
          background: var(--sp-blue);
          color: #fff;
          font-size: 15px;
          font-weight: 950;
          cursor: pointer;
        }

        .sp-email-box small {
          display: block;
          margin-top: 14px;
          color: #667085;
          font-size: 12px;
          font-weight: 750;
        }

        @media (max-width: 1180px) {
          .sp-shell {
            width: calc(100% - 20px);
          }

          .sp-layout {
            grid-template-columns: minmax(0, 1fr) 340px;
            gap: 26px;
            padding: 30px 28px 26px;
          }

          .sp-sidebar {
            padding-left: 24px;
          }

          .sp-title {
            font-size: clamp(38px, 4.4vw, 54px);
          }

          .sp-features-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 24px 30px;
          }
        }

        @media (max-width: 980px) {
          .sp-layout {
            grid-template-columns: 1fr;
          }

          .sp-main {
            max-width: none;
          }

          .sp-sidebar {
            border-left: 0;
            padding-left: 0;
          }

          .sp-sticky-ad {
            position: static;
            min-height: 260px;
          }

          .sp-nav-links {
            display: none;
          }

          .sp-nav {
            padding: 0 22px;
          }

          .sp-logo,
          .sp-nav-actions {
            min-width: auto;
          }

          .sp-summary-body,
          .sp-final-row,
          .sp-content-row {
            grid-template-columns: 1fr;
          }

          .sp-summary-card {
            grid-template-columns: 1fr;
          }

          .sp-summary-left {
            border-right: 0;
            border-bottom: 1px solid #b9cff0;
          }

          .sp-summary-body {
            align-items: start;
          }

          .sp-cta-btn {
            width: fit-content;
          }
        }

        @media (max-width: 720px) {
          .sp-shell {
            width: calc(100% - 12px);
            border-radius: 8px;
          }

          .sp-layout {
            padding: 22px 16px;
          }

          .sp-top-notice {
            min-height: 42px;
            font-size: 11.5px;
            line-height: 1.25;
            padding: 8px 10px;
            flex-wrap: nowrap;
            gap: 8px;
            white-space: nowrap;
            overflow: hidden;
          }

          .sp-top-notice span {
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .sp-top-notice a {
            flex: 0 0 auto;
            font-size: 11.5px;
          }

          .sp-nav {
            min-height: 66px;
            padding: 12px 14px;
            flex-wrap: nowrap;
            gap: 10px;
          }

          .sp-logo {
            min-width: 0;
            width: auto;
            flex: 1;
            justify-content: flex-start;
            gap: 8px;
            font-size: 16px;
            overflow: hidden;
          }

          .sp-logo-mark {
            width: 32px;
            height: 32px;
            border-radius: 10px;
            flex: 0 0 auto;
          }

          .sp-logo span:last-child {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .sp-nav-actions {
            min-width: 0;
            width: auto;
            flex: 0 0 auto;
            justify-content: flex-end;
            gap: 10px;
          }

          .sp-nav-actions svg {
            width: 22px;
            height: 22px;
            flex: 0 0 auto;
          }

          .sp-subscribe-btn {
            padding: 10px 14px;
            font-size: 12px;
            border-radius: 8px;
            white-space: nowrap;
          }

          .sp-title {
            font-size: 34px;
            letter-spacing: -0.05em;
          }

          .sp-subtitle {
            font-size: 15px;
          }

          .sp-hero-image {
            height: 220px;
          }

          .sp-summary-body {
            padding: 20px;
          }

          .sp-cta-btn {
            width: 100%;
          }

          .sp-features-grid,
          .sp-pros-cons,
          .sp-related-grid {
            grid-template-columns: 1fr;
          }

          .sp-feature-item {
            grid-template-columns: 58px minmax(0, 1fr);
          }

          .sp-content-row {
            gap: 16px;
          }

          .sp-sidebar-ad {
            height: 220px;
          }
        }
      `}</style>

      <div className="sp-shell">
        {(fieldMap.top_notice_text || fieldMap.top_notice_link_label) && (
          <div className="sp-top-notice">
            <Bell size={17} />
            <span>{fieldMap.top_notice_text || 'Limited time: Get 20% off all tools this week!'}</span>
            {fieldMap.top_notice_link_label ? (
              <a href={fieldMap.top_notice_link_url || '#'}>{fieldMap.top_notice_link_label} →</a>
            ) : null}
          </div>
        )}

        <header className="sp-nav">
          <div className="sp-logo">
            <span className="sp-logo-mark">{String(blogName).charAt(0).toUpperCase()}</span>
            <span>{blogName}</span>
          </div>

          <nav className="sp-nav-links">
            <span>Home</span>
            <span>Categories⌄</span>
            <span>Reviews</span>
            <span>Guides</span>
            <span>About</span>
          </nav>

          <div className="sp-nav-actions">
            <Search size={24} />
            <button type="button" className="sp-subscribe-btn">Subscribe</button>
          </div>
        </header>

        <div className="sp-layout">
          <main className="sp-main">
            <section>
              <span className="sp-category">{fieldMap.hero_category_label || post?.category_name || 'Productivity'}</span>
              <h1 className="sp-title">{title}</h1>
              <p className="sp-subtitle">{subtitle}</p>

              <div className="sp-meta">
                <span className="sp-author-avatar">
                  {fieldMap.hero_author_image ? (
                    <img src={fieldMap.hero_author_image} alt={fieldMap.hero_author_name || 'Author'} />
                  ) : (
                    <Users size={22} />
                  )}
                </span>
                <span>By <span className="sp-author-name">{fieldMap.hero_author_name || post?.author_name || 'Jane Doe'}</span></span>
                <span>·</span>
                <span>{fieldMap.hero_date_text || post?.published_at_text || post?.created_at || 'May 15, 2024'}</span>
                <span>·</span>
                <span>{fieldMap.hero_read_time || post?.read_time || '8 min read'}</span>
              </div>

              <div className="sp-hero-image">
                {heroImage ? (
                  <img src={heroImage} alt={title} />
                ) : (
                  <div className="sp-placeholder-mountain">
                    <Box size={72} strokeWidth={1.5} />
                  </div>
                )}
              </div>
            </section>

            <section className="sp-summary-card">
              <div className="sp-summary-left">
                <span className="sp-star-circle">
                  <Star size={30} fill="currentColor" />
                </span>
                <span>{fieldMap.summary_label || 'Quick Summary'}</span>
              </div>

              <div className="sp-summary-body">
                <div>
                  <p>
                    <strong>{fieldMap.summary_verdict_label || 'Short Verdict:'}</strong>
                    {fieldMap.summary_verdict_text ||
                      'ProductX is a powerful all-in-one platform that simplifies workflows and boosts team productivity.'}
                  </p>

                  <ul className="sp-check-list">
                    {[fieldMap.summary_point_1, fieldMap.summary_point_2, fieldMap.summary_point_3]
                      .filter(Boolean)
                      .map((item) => (
                        <li key={item}>
                          <CheckCircle2 size={18} />
                          {item}
                        </li>
                      ))}
                  </ul>
                </div>

                <CtaButton button={summaryButton} fallbackLabel="Visit Official Site" />
              </div>
            </section>

            <section className="sp-section">
              <h2>{fieldMap.intro_title || 'Introduction'}</h2>
              <p>{fieldMap.intro_paragraph_1 || post?.content_intro || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec convallis, enim at facilisis mollis, velit justo cursus nibh, ut hendrerit leo justo sed libero.'}</p>
              <p>{fieldMap.intro_paragraph_2 || 'In this review, we will explore what it is, how it works, key features, pricing, benefits, drawbacks, and who it is best for.'}</p>
            </section>

            <section className="sp-section sp-content-row">
              <div>
                <h2>{fieldMap.content_block_1_title || 'What It Is'}</h2>
                <p>{fieldMap.content_block_1_text || 'ProductX is an all-in-one platform designed to help teams manage projects, collaborate in real-time, and automate repetitive tasks.'}</p>
              </div>
              <ImageBox src={fieldMap.content_block_1_image} icon={Box} />
            </section>

            <section className="sp-section sp-content-row">
              <div>
                <h2>{fieldMap.content_block_2_title || 'How It Works'}</h2>
                <p>{fieldMap.content_block_2_text || 'ProductX connects your tools and centralizes your data so your team can stay aligned and move faster.'}</p>
              </div>
              <ImageBox src={fieldMap.content_block_2_image} icon={Workflow} />
            </section>

            <AdSlot
              placements={allPlacements}
              keys={['post_inline_728x90', 'inline_728x90', 'content_728x90', 'blog_post_inline']}
              className="sp-inline-ad"
              label="Ad Slot 728x90"
            />

            <section className="sp-section">
              <h2>{fieldMap.features_title || 'Benefits / Key Features'}</h2>
              <p>{fieldMap.features_intro || 'ProductX comes with a wide range of features that help teams save time and get more done.'}</p>

              <div className="sp-features-grid">
                <FeatureItem icon={Zap} title={fieldMap.feature_1_title || 'Automation'} text={fieldMap.feature_1_text || 'Automate repetitive tasks and workflows.'} />
                <FeatureItem icon={Users} title={fieldMap.feature_2_title || 'Collaboration'} text={fieldMap.feature_2_text || 'Real-time collaboration across teams.'} />
                <FeatureItem icon={BarChart3} title={fieldMap.feature_3_title || 'Analytics'} text={fieldMap.feature_3_text || 'Powerful insights to track performance.'} />
                <FeatureItem icon={Shield} title={fieldMap.feature_4_title || 'Security'} text={fieldMap.feature_4_text || 'Enterprise-grade security and privacy.'} />
              </div>
            </section>

            <section className="sp-pros-cons">
              <ProsConsBox
                type="pros"
                title={fieldMap.pros_title || 'Pros'}
                items={[
                  fieldMap.pros_item_1 || 'Easy to use and intuitive interface',
                  fieldMap.pros_item_2 || 'Feature-rich and highly customizable',
                  fieldMap.pros_item_3 || 'Excellent customer support',
                  fieldMap.pros_item_4 || 'Great value for the price',
                ]}
              />

              <ProsConsBox
                type="cons"
                title={fieldMap.cons_title || 'Cons'}
                items={[
                  fieldMap.cons_item_1 || 'Steeper learning curve for advanced features',
                  fieldMap.cons_item_2 || 'Some integrations could be improved',
                  fieldMap.cons_item_3 || 'Mobile app lacks a few features',
                ]}
              />
            </section>

            <section className="sp-section">
              <h2>{fieldMap.faq_title || 'Frequently Asked Questions'}</h2>
              <div className="sp-faq-list">
                {faqItems.map(([question, answer], index) => (
                  <FaqItem
                    key={`faq-${index}`}
                    question={question || [
                      'Is ProductX suitable for small teams?',
                      'Does ProductX offer a free trial?',
                      'What integrations does ProductX support?',
                      'Is my data secure with ProductX?',
                    ][index]}
                    answer={answer || 'Yes. This section can be edited by the affiliate from the template editor.'}
                  />
                ))}
              </div>
            </section>

            <section className="sp-section sp-final-row">
              <div>
                <h2>{fieldMap.final_verdict_title || 'Final Verdict'}</h2>
                <p>{fieldMap.final_verdict_text || 'ProductX is a robust, all-in-one solution for teams looking to streamline workflows, collaborate better, and achieve more.'}</p>
              </div>

              <CtaButton button={finalButton} fallbackLabel="Try ProductX Now" />
            </section>

            <section className="sp-section">
              <h2>{fieldMap.related_posts_title || 'Related Posts'}</h2>

              <div className="sp-related-grid">
                {liveRelatedPosts.length > 0 ? (
                  liveRelatedPosts.slice(0, 3).map((item) => (
                    <RelatedCard
                      key={item?.id || item?.slug || item?.title}
                      title={item?.title}
                      image={item?.featured_image || item?.image_url || item?.cover_image}
                      meta={item?.meta || item?.date_text || item?.created_at}
                      url={item?.url || item?.public_url}
                    />
                  ))
                ) : (
                  <>
                    <RelatedCard
                      title={fieldMap.related_post_1_title || 'Best Project Management Tools for 2024'}
                      image={fieldMap.related_post_1_image}
                      meta={fieldMap.related_post_1_meta || 'May 1, 2024 · 7 min read'}
                      url={fieldMap.related_post_1_url}
                    />
                    <RelatedCard
                      title={fieldMap.related_post_2_title || 'ProductX vs Competitor Y: Which Is Better?'}
                      image={fieldMap.related_post_2_image}
                      meta={fieldMap.related_post_2_meta || 'Apr 22, 2024 · 10 min read'}
                      url={fieldMap.related_post_2_url}
                    />
                    <RelatedCard
                      title={fieldMap.related_post_3_title || 'How to Boost Team Productivity with Automation'}
                      image={fieldMap.related_post_3_image}
                      meta={fieldMap.related_post_3_meta || 'Apr 10, 2024 · 6 min read'}
                      url={fieldMap.related_post_3_url}
                    />
                  </>
                )}
              </div>
            </section>
          </main>

          <aside className="sp-sidebar">
            <AdSlot
              placements={allPlacements}
              keys={['post_sidebar_300x250', 'sidebar_300x250', 'blog_sidebar_top', 'sidebar_top']}
              className="sp-sidebar-ad"
              label="Sidebar Ad 300x250"
            />

            <AdSlot
              placements={allPlacements}
              keys={['post_sticky_300x600', 'sticky_300x600', 'blog_sidebar_sticky', 'sidebar_sticky']}
              className="sp-sticky-ad"
              label="Sticky Ad 300x600"
            />

            <EmailCaptureBox fieldMap={fieldMap} />
          </aside>
        </div>
      </div>
    </div>
  );
}