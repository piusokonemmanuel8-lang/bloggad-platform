import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Globe2,
  Loader2,
  Search,
  Share2,
  Tag,
  User2,
  Star,
  Check,
  X,
  Mail,
  Sparkles,
  BadgeCheck,
  BellRing,
} from 'lucide-react';
import api from '../../api/axios';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function cardStyle(extra = {}) {
  return {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 18,
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)',
    ...extra,
  };
}

function getEmailCaptureCooldownKey(websiteId) {
  return `bloggad_email_capture_cooldown_${websiteId}`;
}

function getEmailCaptureDismissKey(websiteId) {
  return `bloggad_email_capture_dismissed_${websiteId}`;
}

function shouldShowEmailPopup(capture, websiteId) {
  if (!capture?.enabled || !websiteId) return false;

  const displayMode = String(capture?.display_mode || capture?.show_mode || 'popup').toLowerCase();
  if (!['popup', 'both'].includes(displayMode)) return false;

  const dismissKey = getEmailCaptureDismissKey(websiteId);
  const cooldownKey = getEmailCaptureCooldownKey(websiteId);

  try {
    const dismissed = localStorage.getItem(dismissKey);
    const cooldownUntil = Number(localStorage.getItem(cooldownKey) || 0);

    if (dismissed === '1') return false;
    if (cooldownUntil && Date.now() < cooldownUntil) return false;
  } catch (error) {
    return true;
  }

  return true;
}

function setEmailCaptureCooldown(websiteId, minutes = 10) {
  if (!websiteId) return;

  try {
    const cooldownKey = getEmailCaptureCooldownKey(websiteId);
    localStorage.setItem(cooldownKey, String(Date.now() + minutes * 60 * 1000));
  } catch (error) {}
}

function dismissEmailCaptureForNow(websiteId, minutes = 10) {
  if (!websiteId) return;

  try {
    const dismissKey = getEmailCaptureDismissKey(websiteId);
    localStorage.setItem(dismissKey, '1');
  } catch (error) {}

  setEmailCaptureCooldown(websiteId, minutes);
}

function clearEmailCaptureDismiss(websiteId) {
  if (!websiteId) return;

  try {
    localStorage.removeItem(getEmailCaptureDismissKey(websiteId));
  } catch (error) {}
}

function ArticleCard({ item, websiteSlug }) {
  return (
    <div style={cardStyle({ overflow: 'hidden' })}>
      {item?.featured_image ? (
        <img
          src={item.featured_image}
          alt={item.title}
          style={{
            width: '100%',
            height: 220,
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: 220,
            background: '#f8fafc',
            borderBottom: '1px solid #e5e7eb',
          }}
        />
      )}

      <div style={{ padding: 18 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#2563eb',
            marginBottom: 10,
          }}
        >
          Bloggad Article
        </div>

        <div
          style={{
            fontSize: 20,
            lineHeight: 1.35,
            fontWeight: 900,
            color: '#111827',
            marginBottom: 10,
          }}
        >
          {item?.title || 'Related post'}
        </div>

        <div
          style={{
            fontSize: 14,
            lineHeight: 1.8,
            color: '#64748b',
            marginBottom: 16,
          }}
        >
          {item?.excerpt || 'No excerpt'}
        </div>

        <Link
          to={`/${websiteSlug}/post/${item.slug}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: '#111827',
            fontWeight: 800,
            textDecoration: 'none',
          }}
        >
          Read Post
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}

function renderField(field) {
  if (!field) return null;

  if (field.field_type === 'image' && field.field_value) {
    return (
      <img
        src={field.field_value}
        alt={field.field_key}
        style={{
          width: '100%',
          maxHeight: 520,
          objectFit: 'cover',
          borderRadius: 18,
          marginTop: 14,
          border: '1px solid #e5e7eb',
        }}
      />
    );
  }

  if (field.field_type === 'url' && field.field_value) {
    return (
      <a
        href={field.field_value}
        target="_blank"
        rel="noreferrer"
        style={{
          color: '#2563eb',
          wordBreak: 'break-word',
          fontWeight: 700,
        }}
      >
        {field.field_value}
      </a>
    );
  }

  return (
    <div
      style={{
        whiteSpace: 'pre-wrap',
        color: '#334155',
        lineHeight: 1.9,
        fontSize: 16,
      }}
    >
      {field.field_value || '-'}
    </div>
  );
}

function normalizeKey(value) {
  return String(value || '').trim().toLowerCase();
}

function resolveTemplatePreset(template) {
  const codeKey = normalizeKey(template?.template_code_key);
  const slug = normalizeKey(template?.slug);
  const name = normalizeKey(template?.name);

  const matchesNeutralReview =
    ['neutral_review_template_v1', 'blog_review_locked_v1', 'dummy_review_template_v1'].includes(
      codeKey
    ) ||
    ['neutral-review-template-v1', 'dummy-review-template-v1'].includes(slug) ||
    ['neutral review template', 'dummy review template', 'blog review template'].includes(name);

  if (matchesNeutralReview) return 'neutral_review_template_v1';

  return null;
}

function useTemplateMap(templateFields = [], ctaButtons = []) {
  return useMemo(() => {
    const fieldMap = {};
    const buttonMap = {};

    templateFields.forEach((field) => {
      fieldMap[normalizeKey(field.field_key)] = field?.field_value || '';
    });

    ctaButtons.forEach((button) => {
      buttonMap[normalizeKey(button.button_key)] = button || {};
    });

    return { fieldMap, buttonMap };
  }, [templateFields, ctaButtons]);
}

function getButtonProps(buttonMap, key, fallbackLabel = 'Learn More') {
  const button = buttonMap[normalizeKey(key)] || {};
  return {
    label: button.button_label || fallbackLabel,
    url: button.button_url || '#',
    style: button.button_style || 'primary',
    openInNewTab: !!button.open_in_new_tab,
  };
}

function CtaButton({ button, fullWidth = false }) {
  const isSecondary = button.style === 'secondary';

  return (
    <a
      href={button.url || '#'}
      target={button.openInNewTab ? '_blank' : '_self'}
      rel={button.openInNewTab ? 'noreferrer' : undefined}
      style={{
        minHeight: 48,
        padding: '0 18px',
        borderRadius: 12,
        border: isSecondary ? '1px solid #d1d5db' : '1px solid #2563eb',
        background: isSecondary ? '#ffffff' : '#2563eb',
        color: isSecondary ? '#111827' : '#ffffff',
        fontWeight: 800,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        width: fullWidth ? '100%' : 'fit-content',
        textAlign: 'center',
      }}
    >
      {button.label}
    </a>
  );
}

function SectionBarTitle({ children }) {
  return (
    <div
      style={{
        background: '#0f5132',
        borderRadius: 16,
        padding: '16px 18px',
        marginBottom: 18,
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 900,
        lineHeight: 1.2,
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  );
}

function TextParagraph({ children }) {
  return (
    <p
      style={{
        margin: '0 0 16px',
        color: '#334155',
        fontSize: 16,
        lineHeight: 1.9,
      }}
    >
      {children || '-'}
    </p>
  );
}

function getCaptureTheme(capture) {
  const templateKey = String(capture?.template?.template_key || '').toLowerCase();
  const isFooter = templateKey.includes('footer');
  const isPopup = templateKey.includes('popup');

  if (isFooter) {
    return {
      accent: '#7c3aed',
      accentSoft: '#f5f3ff',
      accentBorder: '#ddd6fe',
      title: '#111827',
      text: '#6b7280',
      buttonBg: '#7c3aed',
    };
  }

  if (isPopup) {
    return {
      accent: '#2563eb',
      accentSoft: '#eff6ff',
      accentBorder: '#bfdbfe',
      title: '#111827',
      text: '#64748b',
      buttonBg: '#111827',
    };
  }

  return {
    accent: '#2563eb',
    accentSoft: '#eff6ff',
    accentBorder: '#bfdbfe',
    title: '#111827',
    text: '#64748b',
    buttonBg: '#111827',
  };
}

function EmailCapturePopup({
  open,
  onClose,
  capture,
  websiteSlug,
  websiteId,
  onSubmitted,
}) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState('');

  const theme = getCaptureTheme(capture);

  useEffect(() => {
    if (!open) {
      setEmail('');
      setSubmitting(false);
      setLocalError('');
      setSuccess('');
    }
  }, [open]);

  if (!open || !capture?.enabled) return null;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim()) {
      setLocalError('Email is required');
      return;
    }

    try {
      setSubmitting(true);
      setLocalError('');
      setSuccess('');

      const { data } = await api.post('/api/email-list/public/capture', {
        website_id: websiteId,
        website_slug: websiteSlug,
        email: email.trim(),
        source_type: 'popup',
      });

      const msg = data?.message || capture?.success_message || 'Submitted successfully';
      setSuccess(msg);
      setEmail('');
      dismissEmailCaptureForNow(websiteId, 10);
      onSubmitted?.(msg);
    } catch (err) {
      setLocalError(err?.response?.data?.message || 'Failed to save email');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.46)',
          backdropFilter: 'blur(4px)',
          zIndex: 200,
        }}
      />

      <div
        style={{
          position: 'fixed',
          inset: '50% auto auto 50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(620px, calc(100% - 24px))',
          background: '#ffffff',
          borderRadius: 28,
          border: `1px solid ${theme.accentBorder}`,
          boxShadow: '0 30px 80px rgba(15, 23, 42, 0.24)',
          zIndex: 201,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'relative',
            padding: '26px 24px 22px',
            background: `linear-gradient(135deg, ${theme.accentSoft} 0%, #ffffff 72%)`,
            borderBottom: '1px solid #eef2f7',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 42,
              height: 42,
              borderRadius: 14,
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              color: '#111827',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>

          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 18,
                background: theme.buttonBg,
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 14px 28px rgba(17,24,39,0.12)',
              }}
            >
              <Mail size={26} />
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                height: 36,
                padding: '0 12px',
                borderRadius: 999,
                border: `1px solid ${theme.accentBorder}`,
                background: '#ffffff',
                color: theme.accent,
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              <Sparkles size={14} />
              Free updates
            </div>
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              lineHeight: 1.05,
              fontWeight: 900,
              letterSpacing: '-0.05em',
              color: theme.title,
            }}
          >
            {capture?.title || 'Join our email list'}
          </h3>

          <p
            style={{
              margin: '12px 0 0',
              color: theme.text,
              fontSize: 15,
              lineHeight: 1.85,
              maxWidth: 520,
            }}
          >
            {capture?.subtitle || 'Get updates, offers, and new post alerts.'}
          </p>

          <div
            style={{
              marginTop: 16,
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            {['New posts', 'Special updates', 'Helpful offers'].map((item) => (
              <div
                key={item}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 999,
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  color: '#334155',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                <BadgeCheck size={14} color={theme.accent} />
                {item}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'grid', gap: 14 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) 170px',
              gap: 12,
            }}
            className="email-popup-form-grid"
          >
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={capture?.placeholder_text || 'Enter your email'}
              style={{
                width: '100%',
                minHeight: 56,
                borderRadius: 18,
                border: '1px solid #dbe1ea',
                background: '#ffffff',
                padding: '0 18px',
                fontSize: 15,
                color: '#111827',
                outline: 'none',
              }}
            />

            <button
              type="submit"
              disabled={submitting}
              style={{
                minHeight: 56,
                borderRadius: 18,
                border: `1px solid ${theme.buttonBg}`,
                background: theme.buttonBg,
                color: '#ffffff',
                fontSize: 15,
                fontWeight: 800,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                boxShadow: '0 14px 28px rgba(17,24,39,0.12)',
              }}
            >
              {submitting ? 'Saving...' : capture?.button_text || 'Subscribe'}
            </button>
          </div>

          {localError ? (
            <div
              style={{
                borderRadius: 14,
                border: '1px solid #fecaca',
                background: '#fff1f2',
                padding: '12px 14px',
                color: '#be123c',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {localError}
            </div>
          ) : null}

          {success ? (
            <div
              style={{
                borderRadius: 16,
                border: '1px solid #bbf7d0',
                background: '#ecfdf5',
                padding: '14px 16px',
                color: '#166534',
                fontSize: 14,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Check size={16} />
              {success}
            </div>
          ) : null}

          <div
            style={{
              color: '#94a3b8',
              fontSize: 12,
              lineHeight: 1.7,
            }}
          >
            We keep this simple. Enter your email once and continue reading.
          </div>
        </form>

        <style>{`
          @media (max-width: 640px) {
            .email-popup-form-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </>
  );
}

function EmailCaptureFooter({
  capture,
  websiteSlug,
  websiteId,
}) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState('');

  const theme = getCaptureTheme(capture);

  const displayMode = String(capture?.display_mode || capture?.show_mode || 'popup').toLowerCase();
  if (!capture?.enabled || !['footer', 'both'].includes(displayMode)) return null;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim()) {
      setLocalError('Email is required');
      return;
    }

    try {
      setSubmitting(true);
      setLocalError('');
      setSuccess('');

      const { data } = await api.post('/api/email-list/public/capture', {
        website_id: websiteId,
        website_slug: websiteSlug,
        email: email.trim(),
        source_type: 'footer',
      });

      const msg = data?.message || capture?.success_message || 'Submitted successfully';
      setSuccess(msg);
      setEmail('');
    } catch (err) {
      setLocalError(err?.response?.data?.message || 'Failed to save email');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      style={{
        ...cardStyle({
          padding: 0,
          marginTop: 24,
          overflow: 'hidden',
          background: '#ffffff',
        }),
      }}
    >
      <div
        style={{
          padding: 24,
          background: `linear-gradient(135deg, ${theme.accentSoft} 0%, #ffffff 70%)`,
          borderBottom: '1px solid #eef2f7',
        }}
      >
        <div
          className="email-capture-footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 430px)',
            gap: 24,
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 999,
                background: '#ffffff',
                border: `1px solid ${theme.accentBorder}`,
                color: theme.accent,
                fontWeight: 800,
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 14,
              }}
            >
              <BellRing size={14} />
              Stay connected
            </div>

            <h3
              style={{
                margin: 0,
                fontSize: 'clamp(1.7rem, 4vw, 2.4rem)',
                lineHeight: 1.06,
                fontWeight: 900,
                letterSpacing: '-0.05em',
                color: '#111827',
              }}
            >
              {capture?.title || 'Join our email list'}
            </h3>

            <p
              style={{
                margin: '12px 0 0',
                color: '#64748b',
                fontSize: 15,
                lineHeight: 1.8,
                maxWidth: 560,
              }}
            >
              {capture?.subtitle || 'Subscribe for new posts and important updates.'}
            </p>

            <div
              style={{
                marginTop: 16,
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              {['Fresh post alerts', 'Useful updates', 'No long process'].map((item) => (
                <div
                  key={item}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 999,
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    color: '#334155',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  <Check size={14} color={theme.accent} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={capture?.placeholder_text || 'Enter your email'}
              style={{
                width: '100%',
                minHeight: 54,
                borderRadius: 18,
                border: '1px solid #dbe1ea',
                background: '#ffffff',
                padding: '0 18px',
                fontSize: 15,
                color: '#111827',
                outline: 'none',
              }}
            />

            <button
              type="submit"
              disabled={submitting}
              style={{
                minHeight: 54,
                borderRadius: 18,
                border: `1px solid ${theme.buttonBg}`,
                background: theme.buttonBg,
                color: '#ffffff',
                fontSize: 15,
                fontWeight: 800,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                boxShadow: '0 14px 28px rgba(17,24,39,0.1)',
              }}
            >
              {submitting ? 'Saving...' : capture?.button_text || 'Subscribe'}
            </button>

            {localError ? (
              <div
                style={{
                  borderRadius: 14,
                  border: '1px solid #fecaca',
                  background: '#fff1f2',
                  padding: '12px 14px',
                  color: '#be123c',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {localError}
              </div>
            ) : null}

            {success ? (
              <div
                style={{
                  borderRadius: 16,
                  border: '1px solid #bbf7d0',
                  background: '#ecfdf5',
                  padding: '14px 16px',
                  color: '#166534',
                  fontSize: 14,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Check size={16} />
                {success}
              </div>
            ) : null}
          </form>
        </div>
      </div>

      <div
        style={{
          padding: '14px 24px',
          color: '#94a3b8',
          fontSize: 12,
          lineHeight: 1.7,
          background: '#ffffff',
        }}
      >
        Quick signup for updates related to this post.
      </div>

      <style>{`
        @media (max-width: 900px) {
          .email-capture-footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

function NeutralReviewTemplate({
  post,
  templateFields,
  ctaButtons,
  relatedPosts,
  websiteSlug,
  emailCapture,
  onOpenPopup,
}) {
  const { fieldMap, buttonMap } = useTemplateMap(templateFields, ctaButtons);

  const heroPrimaryCta = getButtonProps(buttonMap, 'hero_primary_cta', 'Buy Now');
  const heroSecondaryCta = getButtonProps(buttonMap, 'hero_secondary_cta', 'Official Website');
  const howItWorksCta = getButtonProps(buttonMap, 'how_it_works_cta', 'Official Website');
  const ingredientsCta = getButtonProps(buttonMap, 'ingredients_cta', 'Get Discount');
  const pricing1Cta = getButtonProps(buttonMap, 'pricing_card_1_cta', 'Buy Now');
  const pricing2Cta = getButtonProps(buttonMap, 'pricing_card_2_cta', 'Buy Now');
  const pricing3Cta = getButtonProps(buttonMap, 'pricing_card_3_cta', 'Buy Now');
  const specialOfferCta = getButtonProps(buttonMap, 'special_offer_cta', 'Order Now');

  const benefits = Array.from({ length: 7 }, (_, index) => ({
    title: fieldMap[`benefit_${index + 1}_title`],
    text: fieldMap[`benefit_${index + 1}_text`],
  }));

  const testimonials = Array.from({ length: 3 }, (_, index) => ({
    image: fieldMap[`testimonial_${index + 1}_image`],
    nameLine: fieldMap[`testimonial_${index + 1}_name_line`],
    text: fieldMap[`testimonial_${index + 1}_text`],
  }));

  const pricingCards = [
    {
      packageTitle: fieldMap.pricing_card_1_package_title,
      supplyLabel: fieldMap.pricing_card_1_supply_label,
      image: fieldMap.pricing_card_1_image,
      priceText: fieldMap.pricing_card_1_price_text,
      totalText: fieldMap.pricing_card_1_total_text,
      paymentsImage: fieldMap.pricing_card_1_payments_image,
      button: pricing1Cta,
    },
    {
      packageTitle: fieldMap.pricing_card_2_package_title,
      supplyLabel: fieldMap.pricing_card_2_supply_label,
      image: fieldMap.pricing_card_2_image,
      priceText: fieldMap.pricing_card_2_price_text,
      totalText: fieldMap.pricing_card_2_total_text,
      paymentsImage: fieldMap.pricing_card_2_payments_image,
      button: pricing2Cta,
    },
    {
      packageTitle: fieldMap.pricing_card_3_package_title,
      supplyLabel: fieldMap.pricing_card_3_supply_label,
      image: fieldMap.pricing_card_3_image,
      priceText: fieldMap.pricing_card_3_price_text,
      totalText: fieldMap.pricing_card_3_total_text,
      paymentsImage: fieldMap.pricing_card_3_payments_image,
      button: pricing3Cta,
    },
  ];

  const bonuses = Array.from({ length: 3 }, (_, index) => ({
    image: fieldMap[`bonus_${index + 1}_image`],
    title: fieldMap[`bonus_${index + 1}_title`],
    priceLine: fieldMap[`bonus_${index + 1}_price_line`],
    text: fieldMap[`bonus_${index + 1}_text`],
  }));

  const faqs = Array.from({ length: 10 }, (_, index) => ({
    question: fieldMap[`faq_${index + 1}_question`],
    answer: fieldMap[`faq_${index + 1}_answer`],
  }));

  const learnMoreParagraphs = Array.from({ length: 8 }, (_, index) => ({
    text: fieldMap[`learn_more_paragraph_${index + 1}`],
  }));

  const ingredients = Array.from({ length: 5 }, (_, index) => ({
    title: fieldMap[`ingredient_${index + 1}_title`],
    text: fieldMap[`ingredient_${index + 1}_text`],
  }));

  const differenceItems = Array.from({ length: 4 }, (_, index) => ({
    title: fieldMap[`difference_item_${index + 1}_title`],
    text: fieldMap[`difference_item_${index + 1}_text`],
  }));

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f6f8fb',
      }}
    >
      <style>{`
        .neutral-review-page-wrap {
          width: min(1180px, calc(100% - 24px));
          margin: 0 auto;
          padding: 18px 0 48px;
        }

        .neutral-review-hero-grid,
        .neutral-review-two-col {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 24px;
        }

        .neutral-review-pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .neutral-review-testimonial-grid,
        .neutral-review-bonus-grid,
        .neutral-review-related-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        @media (max-width: 1100px) {
          .neutral-review-hero-grid,
          .neutral-review-two-col,
          .neutral-review-pricing-grid,
          .neutral-review-testimonial-grid,
          .neutral-review-bonus-grid,
          .neutral-review-related-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="neutral-review-page-wrap">
        <div
          style={{
            background: '#0f5132',
            color: '#ffffff',
            borderRadius: 18,
            padding: '14px 18px',
            textAlign: 'center',
            fontWeight: 900,
            fontSize: 22,
            lineHeight: 1.35,
            marginBottom: 18,
          }}
        >
          {fieldMap.top_bar_title || post?.title || 'Blog Post'}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            color: '#64748b',
            fontSize: 14,
            marginBottom: 18,
            fontWeight: 700,
          }}
        >
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>
            Home
          </Link>
          <span>/</span>
          <span>{post?.category?.name || 'Category'}</span>
          <span>/</span>
          <span style={{ color: '#111827' }}>{post?.title || 'Post'}</span>
        </div>

        {emailCapture?.enabled &&
        ['popup', 'both'].includes(String(emailCapture?.display_mode || emailCapture?.show_mode || '').toLowerCase()) ? (
          <div style={{ marginBottom: 18, textAlign: 'right' }}>
            <button
              type="button"
              onClick={onOpenPopup}
              style={{
                minHeight: 46,
                padding: '0 16px',
                borderRadius: 14,
                border: '1px solid #111827',
                background: '#111827',
                color: '#ffffff',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Open Email Offer
            </button>
          </div>
        ) : null}

        <section style={cardStyle({ padding: 20, marginBottom: 22 })}>
          <div className="neutral-review-hero-grid">
            <div>
              {fieldMap.hero_product_image ? (
                <img
                  src={fieldMap.hero_product_image}
                  alt={post?.title || 'Hero product'}
                  style={{
                    width: '100%',
                    borderRadius: 16,
                    display: 'block',
                    background: '#f8fafc',
                    border: '1px solid #e5e7eb',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    minHeight: 360,
                    borderRadius: 16,
                    background: '#f8fafc',
                    border: '1px solid #e5e7eb',
                  }}
                />
              )}

              <div
                style={{
                  marginTop: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flexWrap: 'wrap',
                  color: '#111827',
                  fontWeight: 800,
                }}
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <Star key={index} size={18} fill="#f59e0b" color="#f59e0b" />
                ))}
                <span style={{ marginLeft: 6 }}>{fieldMap.hero_review_text || '-'}</span>
              </div>

              {fieldMap.hero_certification_image ? (
                <img
                  src={fieldMap.hero_certification_image}
                  alt="Certifications"
                  style={{
                    width: '100%',
                    marginTop: 16,
                    borderRadius: 12,
                    display: 'block',
                  }}
                />
              ) : null}
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  color: '#111827',
                  fontSize: 'clamp(2rem, 3.6vw, 3rem)',
                  lineHeight: 1.05,
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                }}
              >
                {fieldMap.hero_title || post?.title || 'Post'}
              </h1>

              <TextParagraph>{fieldMap.hero_intro_paragraph_1}</TextParagraph>
              <TextParagraph>{fieldMap.hero_intro_paragraph_2}</TextParagraph>

              <div
                style={{
                  margin: '10px 0 16px',
                  color: '#92400e',
                  fontWeight: 900,
                  fontSize: 18,
                  textDecoration: 'underline',
                }}
              >
                {fieldMap.hero_small_cta_line || '-'}
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  flexWrap: 'wrap',
                  marginBottom: 16,
                }}
              >
                <CtaButton button={heroPrimaryCta} />
                <CtaButton button={heroSecondaryCta} />
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 14,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  color: '#475569',
                  fontWeight: 700,
                }}
              >
                {[fieldMap.hero_trust_item_1, fieldMap.hero_trust_item_2, fieldMap.hero_trust_item_3].map(
                  (item, index) => (
                    <span
                      key={index}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <Check size={16} color="#16a34a" />
                      {item || '-'}
                    </span>
                  )
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  flexWrap: 'wrap',
                  marginTop: 18,
                  color: '#64748b',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <User2 size={15} />
                  {post?.website?.website_name || 'Bloggad'}
                </span>

                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <CalendarDays size={15} />
                  {formatDate(post?.published_at)}
                </span>

                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Clock3 size={15} />
                  6 min read
                </span>
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 22 }}>
          <SectionBarTitle>
            {fieldMap.how_this_product_works_title || 'How This Product Works'}
          </SectionBarTitle>

          <div style={cardStyle({ padding: 22 })}>
            <div className="neutral-review-two-col">
              <div>
                <TextParagraph>{fieldMap.how_this_product_works_paragraph_1}</TextParagraph>
                <TextParagraph>{fieldMap.how_this_product_works_paragraph_2}</TextParagraph>
                <TextParagraph>{fieldMap.how_this_product_works_paragraph_3}</TextParagraph>
                <CtaButton button={howItWorksCta} />
              </div>

              <div>
                {fieldMap.how_this_product_works_image ? (
                  <img
                    src={fieldMap.how_this_product_works_image}
                    alt="How this product works"
                    style={{
                      width: '100%',
                      borderRadius: 16,
                      display: 'block',
                      border: '1px solid #e5e7eb',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      minHeight: 340,
                      borderRadius: 16,
                      background: '#f8fafc',
                      border: '1px solid #e5e7eb',
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 22 }}>
          <SectionBarTitle>{fieldMap.ingredients_section_title || 'Ingredients'}</SectionBarTitle>

          <div style={cardStyle({ padding: 22 })}>
            <div className="neutral-review-two-col">
              <div>
                <TextParagraph>{fieldMap.ingredients_intro}</TextParagraph>

                <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
                  {ingredients.map((item, index) => (
                    <div key={index} style={{ color: '#334155', lineHeight: 1.8 }}>
                      <strong style={{ color: '#111827' }}>{item.title || '-'}</strong> — {item.text || '-'}
                    </div>
                  ))}
                </div>

                <TextParagraph>{fieldMap.ingredients_closing_line}</TextParagraph>
                <CtaButton button={ingredientsCta} />
              </div>

              <div>
                {fieldMap.ingredients_image ? (
                  <img
                    src={fieldMap.ingredients_image}
                    alt="Ingredients"
                    style={{
                      width: '100%',
                      borderRadius: 16,
                      display: 'block',
                      border: '1px solid #e5e7eb',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      minHeight: 340,
                      borderRadius: 16,
                      background: '#f8fafc',
                      border: '1px solid #e5e7eb',
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 22 }}>
          <SectionBarTitle>
            {fieldMap.what_makes_this_product_different_title || 'What Makes This Product Different'}
          </SectionBarTitle>

          <div style={cardStyle({ padding: 22 })}>
            <TextParagraph>{fieldMap.difference_intro}</TextParagraph>

            <div style={{ display: 'grid', gap: 16 }}>
              {differenceItems.map((item, index) => (
                <div key={index} style={{ paddingBottom: 14, borderBottom: '1px solid #eef2f7' }}>
                  <div
                    style={{
                      color: '#111827',
                      fontWeight: 900,
                      fontSize: 20,
                      marginBottom: 8,
                    }}
                  >
                    {item.title || '-'}
                  </div>
                  <TextParagraph>{item.text}</TextParagraph>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 22 }}>
          <SectionBarTitle>{fieldMap.benefits_title || 'Benefits'}</SectionBarTitle>

          <div style={cardStyle({ padding: 22 })}>
            <TextParagraph>{fieldMap.benefits_intro}</TextParagraph>

            <div style={{ display: 'grid', gap: 14 }}>
              {benefits.map((item, index) => (
                <div key={index} style={{ borderBottom: '1px solid #eef2f7', paddingBottom: 12 }}>
                  <div
                    style={{
                      color: '#111827',
                      fontWeight: 900,
                      fontSize: 18,
                      marginBottom: 6,
                    }}
                  >
                    {item.title || '-'}
                  </div>
                  <div
                    style={{
                      color: '#475569',
                      fontSize: 15,
                      lineHeight: 1.8,
                    }}
                  >
                    {item.text || '-'}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 14,
                color: '#475569',
                lineHeight: 1.8,
                fontSize: 15,
              }}
            >
              {fieldMap.benefits_closing_line || '-'}
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 22 }}>
          <SectionBarTitle>{fieldMap.testimonials_title || 'Testimonials'}</SectionBarTitle>

          <div className="neutral-review-testimonial-grid">
            {testimonials.map((item, index) => (
              <div key={index} style={cardStyle({ padding: 20 })}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.nameLine || `Testimonial ${index + 1}`}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      display: 'block',
                      margin: '0 auto 16px',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: '#f8fafc',
                      border: '1px solid #e5e7eb',
                      margin: '0 auto 16px',
                    }}
                  />
                )}

                <div
                  style={{
                    color: '#111827',
                    fontWeight: 900,
                    textAlign: 'center',
                    marginBottom: 10,
                  }}
                >
                  {item.nameLine || '-'}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 4,
                    marginBottom: 10,
                  }}
                >
                  {Array.from({ length: 5 }, (_, starIndex) => (
                    <Star key={starIndex} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>

                <div
                  style={{
                    color: '#475569',
                    lineHeight: 1.8,
                    textAlign: 'center',
                    fontSize: 15,
                  }}
                >
                  {item.text || '-'}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 22 }}>
          <SectionBarTitle>{fieldMap.pricing_title || 'Pricing'}</SectionBarTitle>

          <div className="neutral-review-pricing-grid">
            {pricingCards.map((card, index) => (
              <div key={index} style={cardStyle({ padding: 20, textAlign: 'center' })}>
                <div
                  style={{
                    fontWeight: 900,
                    color: '#111827',
                    fontSize: 22,
                    marginBottom: 6,
                  }}
                >
                  {card.packageTitle || '-'}
                </div>

                <div
                  style={{
                    color: '#64748b',
                    fontWeight: 700,
                    marginBottom: 14,
                  }}
                >
                  {card.supplyLabel || '-'}
                </div>

                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.packageTitle || `Pricing ${index + 1}`}
                    style={{
                      width: '100%',
                      maxHeight: 280,
                      objectFit: 'contain',
                      display: 'block',
                      marginBottom: 16,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      minHeight: 220,
                      borderRadius: 16,
                      background: '#f8fafc',
                      border: '1px solid #e5e7eb',
                      marginBottom: 16,
                    }}
                  />
                )}

                <div
                  style={{
                    color: '#2563eb',
                    fontWeight: 900,
                    fontSize: 28,
                    marginBottom: 10,
                  }}
                >
                  {card.priceText || '-'}
                </div>

                <div
                  style={{
                    color: '#475569',
                    fontWeight: 800,
                    marginBottom: 14,
                  }}
                >
                  {card.totalText || '-'}
                </div>

                <div style={{ marginBottom: 14 }}>
                  <CtaButton button={card.button} fullWidth />
                </div>

                {card.paymentsImage ? (
                  <img
                    src={card.paymentsImage}
                    alt="Payments"
                    style={{
                      width: '100%',
                      display: 'block',
                    }}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 22 }}>
          <SectionBarTitle>{fieldMap.bonus_section_title || 'Bonuses'}</SectionBarTitle>

          <div className="neutral-review-bonus-grid">
            {bonuses.map((bonus, index) => (
              <div key={index} style={cardStyle({ padding: 18 })}>
                {bonus.image ? (
                  <img
                    src={bonus.image}
                    alt={bonus.title || `Bonus ${index + 1}`}
                    style={{
                      width: '100%',
                      height: 220,
                      objectFit: 'cover',
                      borderRadius: 14,
                      display: 'block',
                      marginBottom: 14,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: 220,
                      borderRadius: 14,
                      background: '#f8fafc',
                      border: '1px solid #e5e7eb',
                      marginBottom: 14,
                    }}
                  />
                )}

                <div
                  style={{
                    fontSize: 20,
                    lineHeight: 1.35,
                    fontWeight: 900,
                    color: '#111827',
                    marginBottom: 10,
                  }}
                >
                  {bonus.title || '-'}
                </div>

                <div
                  style={{
                    color: '#92400e',
                    fontWeight: 800,
                    marginBottom: 12,
                  }}
                >
                  {bonus.priceLine || '-'}
                </div>

                <div
                  style={{
                    color: '#475569',
                    lineHeight: 1.8,
                    fontSize: 15,
                  }}
                >
                  {bonus.text || '-'}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 22 }}>
          <SectionBarTitle>{fieldMap.faq_section_title || 'FAQ'}</SectionBarTitle>

          <div style={cardStyle({ padding: 22 })}>
            <div style={{ display: 'grid', gap: 14 }}>
              {faqs.map((item, index) => (
                <div key={index} style={{ paddingBottom: 14, borderBottom: '1px solid #eef2f7' }}>
                  <div
                    style={{
                      color: '#111827',
                      fontWeight: 900,
                      fontSize: 18,
                      marginBottom: 8,
                    }}
                  >
                    {item.question || '-'}
                  </div>

                  <div
                    style={{
                      color: '#475569',
                      lineHeight: 1.8,
                      fontSize: 15,
                    }}
                  >
                    {item.answer || '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 22 }}>
          <div style={cardStyle({ overflow: 'hidden' })}>
            <div className="neutral-review-two-col" style={{ gap: 0 }}>
              <div
                style={{
                  background: '#0f5132',
                  padding: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {fieldMap.guarantee_badge_image ? (
                  <img
                    src={fieldMap.guarantee_badge_image}
                    alt="Guarantee"
                    style={{
                      width: '100%',
                      maxWidth: 280,
                      display: 'block',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 280,
                      height: 280,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  />
                )}
              </div>

              <div
                style={{
                  background: '#0f5132',
                  color: '#ffffff',
                  padding: 26,
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    lineHeight: 1.15,
                    fontWeight: 900,
                    marginBottom: 16,
                  }}
                >
                  {fieldMap.guarantee_title || '-'}
                </div>

                <div style={{ color: 'rgba(255,255,255,0.92)', lineHeight: 1.9, fontSize: 16 }}>
                  <p style={{ margin: '0 0 14px' }}>{fieldMap.guarantee_paragraph_1 || '-'}</p>
                  <p style={{ margin: '0 0 14px' }}>{fieldMap.guarantee_paragraph_2 || '-'}</p>
                  <p style={{ margin: 0, fontWeight: 800 }}>{fieldMap.guarantee_paragraph_3 || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 22 }}>
          <SectionBarTitle>{fieldMap.special_offer_title || 'Special Offer'}</SectionBarTitle>

          <div style={cardStyle({ padding: 22, textAlign: 'center' })}>
            {fieldMap.special_offer_image ? (
              <img
                src={fieldMap.special_offer_image}
                alt="Special offer"
                style={{
                  width: '100%',
                  maxWidth: 420,
                  display: 'block',
                  margin: '0 auto 18px',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  maxWidth: 420,
                  minHeight: 300,
                  borderRadius: 18,
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  margin: '0 auto 18px',
                }}
              />
            )}

            <div
              style={{
                color: '#111827',
                fontWeight: 900,
                fontSize: 34,
                lineHeight: 1.1,
                marginBottom: 18,
              }}
            >
              {fieldMap.special_offer_price_text || '-'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <CtaButton button={specialOfferCta} />
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 22 }}>
          <SectionBarTitle>{fieldMap.learn_more_title || 'Learn More'}</SectionBarTitle>

          <div style={cardStyle({ padding: 22 })}>
            {learnMoreParagraphs.map((item, index) => (
              <TextParagraph key={index}>{item.text}</TextParagraph>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 22 }}>
          <SectionBarTitle>
            {fieldMap.scientific_references_title || 'Scientific References'}
          </SectionBarTitle>

          <div style={cardStyle({ padding: 22 })}>
            {fieldMap.scientific_references_logo_strip ? (
              <img
                src={fieldMap.scientific_references_logo_strip}
                alt="Scientific references logos"
                style={{
                  width: '100%',
                  display: 'block',
                  marginBottom: 18,
                }}
              />
            ) : null}

            <div
              style={{
                color: '#64748b',
                lineHeight: 1.9,
                fontSize: 15,
              }}
            >
              This section uses the uploaded scientific references area for this template.
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 22 }}>
          <div style={cardStyle({ padding: 22, marginBottom: 18 })}>
            <TextParagraph>{fieldMap.advertorial_notice}</TextParagraph>
            <TextParagraph>{fieldMap.platform_notice}</TextParagraph>
          </div>

          <div style={cardStyle({ padding: 22 })}>
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: '#111827',
                marginBottom: 12,
              }}
            >
              {fieldMap.legal_disclaimer_title || 'Disclaimer'}
            </div>
            <TextParagraph>{fieldMap.legal_disclaimer_paragraph_1}</TextParagraph>
            <TextParagraph>{fieldMap.legal_disclaimer_paragraph_2}</TextParagraph>

            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: '#111827',
                margin: '18px 0 12px',
              }}
            >
              {fieldMap.affiliate_editorial_disclosure_title || '-'}
            </div>
            <TextParagraph>{fieldMap.affiliate_editorial_disclosure_paragraph_1}</TextParagraph>
            <TextParagraph>{fieldMap.affiliate_editorial_disclosure_paragraph_2}</TextParagraph>

            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: '#111827',
                margin: '18px 0 12px',
              }}
            >
              {fieldMap.trademark_disclaimer_title || '-'}
            </div>
            <TextParagraph>{fieldMap.trademark_disclaimer_paragraph}</TextParagraph>

            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: '#111827',
                margin: '18px 0 12px',
              }}
            >
              {fieldMap.fda_compliance_statement_title || '-'}
            </div>
            <TextParagraph>{fieldMap.fda_compliance_statement_paragraph_1}</TextParagraph>
            <TextParagraph>{fieldMap.fda_compliance_statement_paragraph_2}</TextParagraph>
          </div>
        </section>

        <EmailCaptureFooter
          capture={emailCapture}
          websiteSlug={websiteSlug}
          websiteId={post?.website?.id}
        />

        <section style={{ marginTop: 22 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
              marginBottom: 18,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#2563eb',
                  marginBottom: 8,
                }}
              >
                Bloggad
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 30,
                  lineHeight: 1.1,
                  fontWeight: 900,
                  color: '#111827',
                  letterSpacing: '-0.03em',
                }}
              >
                Related Posts
              </h2>
            </div>
          </div>

          <div className="neutral-review-related-grid">
            {relatedPosts.length ? (
              relatedPosts.map((item) => (
                <ArticleCard key={item.id} item={item} websiteSlug={websiteSlug} />
              ))
            ) : (
              <div
                style={{
                  ...cardStyle({
                    padding: 20,
                    color: '#64748b',
                  }),
                }}
              >
                No related posts found.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function GenericPostPage({
  post,
  templateFields,
  ctaButtons,
  relatedPosts,
  websiteSlug,
  categories,
  emailCapture,
  onOpenPopup,
}) {
  const [sidebarSearch, setSidebarSearch] = useState('');

  const filteredCategories = useMemo(() => {
    const keyword = sidebarSearch.trim().toLowerCase();
    if (!keyword) return categories;

    return categories.filter((item) =>
      String(item?.name || '')
        .toLowerCase()
        .includes(keyword)
    );
  }, [categories, sidebarSearch]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f7fb',
      }}
    >
      <style>{`
        .post-layout-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 28px;
        }

        .post-related-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        @media (max-width: 1200px) {
          .post-layout-grid,
          .post-related-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div
        style={{
          width: 'min(1460px, calc(100% - 24px))',
          margin: '0 auto',
          padding: '18px 0 40px',
        }}
      >
        <header
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 18,
            boxShadow: '0 10px 28px rgba(15, 23, 42, 0.04)',
            marginBottom: 18,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid #eef2f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                color: '#111827',
                fontWeight: 900,
                fontSize: 28,
                letterSpacing: '-0.03em',
              }}
            >
              Bloggad
            </div>

            <div
              style={{
                flex: '1 1 520px',
                maxWidth: 720,
                position: 'relative',
              }}
            >
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                }}
              />
              <input
                type="text"
                placeholder="Search Bloggad articles"
                style={{
                  width: '100%',
                  height: 52,
                  borderRadius: 14,
                  border: '1px solid #dbe1ea',
                  background: '#f8fafc',
                  padding: '0 16px 0 48px',
                  fontSize: 15,
                  color: '#111827',
                  outline: 'none',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                color: '#111827',
                fontWeight: 700,
                flexWrap: 'wrap',
              }}
            >
              <span>Blog</span>
              <span>About Us</span>
              <span>Contact Us</span>
              <span>FAQs</span>
            </div>
          </div>
        </header>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
              color: '#64748b',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <Link to="/" style={{ color: '#64748b' }}>
              Home
            </Link>
            <span>/</span>
            <span>{post?.category?.name || 'Category'}</span>
            <span>/</span>
            <span style={{ color: '#111827', fontWeight: 800 }}>{post?.title || 'Post'}</span>
          </div>

          {emailCapture?.enabled &&
          ['popup', 'both'].includes(String(emailCapture?.display_mode || emailCapture?.show_mode || '').toLowerCase()) ? (
            <button
              type="button"
              onClick={onOpenPopup}
              style={{
                minHeight: 44,
                padding: '0 16px',
                borderRadius: 14,
                border: '1px solid #111827',
                background: '#111827',
                color: '#ffffff',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Open Email Offer
            </button>
          ) : null}
        </div>

        <div className="post-layout-grid" style={{ marginBottom: 28 }}>
          <main>
            <article style={cardStyle({ overflow: 'hidden', marginBottom: 24 })}>
              {post?.featured_image ? (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  style={{
                    width: '100%',
                    maxHeight: 560,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              ) : null}

              <div style={{ padding: 26 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: 999,
                    background: '#eff6ff',
                    color: '#2563eb',
                    fontWeight: 800,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 16,
                  }}
                >
                  <Tag size={13} />
                  {post?.category?.name || 'Bloggad Story'}
                </div>

                <h1
                  style={{
                    margin: '0 0 16px',
                    fontSize: 'clamp(2rem, 4vw, 3.4rem)',
                    lineHeight: 1.08,
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    color: '#111827',
                  }}
                >
                  {post?.title || 'Post'}
                </h1>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    flexWrap: 'wrap',
                    marginBottom: 18,
                    color: '#64748b',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <User2 size={15} />
                    {post?.website?.website_name || 'Bloggad'}
                  </span>

                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <CalendarDays size={15} />
                    {formatDate(post?.published_at)}
                  </span>

                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Clock3 size={15} />
                    6 min read
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 18,
                    lineHeight: 1.85,
                    color: '#475569',
                    marginBottom: 18,
                  }}
                >
                  {post?.excerpt || 'No excerpt'}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                    paddingTop: 14,
                    borderTop: '1px solid #eef2f7',
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      color: '#111827',
                      fontWeight: 800,
                    }}
                  >
                    <Share2 size={16} />
                    Share
                  </span>

                  <button
                    type="button"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 999,
                      border: '1px solid #e5e7eb',
                      background: '#ffffff',
                      color: '#111827',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Globe2 size={16} />
                  </button>

                  <button
                    type="button"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 999,
                      border: '1px solid #e5e7eb',
                      background: '#ffffff',
                      color: '#111827',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Share2 size={16} />
                  </button>

                  <button
                    type="button"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 999,
                      border: '1px solid #e5e7eb',
                      background: '#ffffff',
                      color: '#111827',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </article>

            <section style={cardStyle({ padding: 24, marginBottom: 24 })}>
              <div
                style={{
                  fontSize: 24,
                  lineHeight: 1.2,
                  fontWeight: 900,
                  color: '#111827',
                  marginBottom: 18,
                }}
              >
                Article Content
              </div>

              <div style={{ display: 'grid', gap: 22 }}>
                {templateFields.length ? (
                  templateFields.map((field) => (
                    <div
                      key={field.id}
                      style={{
                        paddingBottom: 20,
                        borderBottom: '1px solid #eef2f7',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 900,
                          color: '#111827',
                          marginBottom: 12,
                          textTransform: 'capitalize',
                        }}
                      >
                        {field.field_key}
                      </div>
                      {renderField(field)}
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#64748b' }}>No post content fields available.</div>
                )}
              </div>
            </section>

            <section style={cardStyle({ padding: 24 })}>
              <div
                style={{
                  fontSize: 24,
                  lineHeight: 1.2,
                  fontWeight: 900,
                  color: '#111827',
                  marginBottom: 18,
                }}
              >
                Call To Action
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {ctaButtons.length ? (
                  ctaButtons.map((button) => (
                    <a
                      key={button.id}
                      href={button.button_url || '#'}
                      target={button.open_in_new_tab ? '_blank' : '_self'}
                      rel={button.open_in_new_tab ? 'noreferrer' : undefined}
                      style={{
                        padding: '12px 18px',
                        borderRadius: 14,
                        border:
                          button.button_style === 'secondary'
                            ? '1px solid #d1d5db'
                            : '1px solid #2563eb',
                        background:
                          button.button_style === 'secondary' ? '#ffffff' : '#2563eb',
                        color: button.button_style === 'secondary' ? '#111827' : '#ffffff',
                        fontWeight: 800,
                        textDecoration: 'none',
                      }}
                    >
                      {button.button_label}
                    </a>
                  ))
                ) : (
                  <div style={{ color: '#64748b' }}>No CTA buttons available.</div>
                )}
              </div>
            </section>

            <EmailCaptureFooter
              capture={emailCapture}
              websiteSlug={websiteSlug}
              websiteId={post?.website?.id}
            />
          </main>

          <aside style={{ display: 'grid', gap: 20, alignSelf: 'start' }}>
            <div style={cardStyle({ padding: 20 })}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: '#111827',
                  marginBottom: 16,
                }}
              >
                Search
              </div>

              <div style={{ position: 'relative' }}>
                <Search
                  size={18}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                  }}
                />
                <input
                  type="text"
                  value={sidebarSearch}
                  onChange={(event) => setSidebarSearch(event.target.value)}
                  placeholder="Search categories"
                  style={{
                    width: '100%',
                    height: 48,
                    borderRadius: 14,
                    border: '1px solid #dbe1ea',
                    background: '#f8fafc',
                    padding: '0 14px 0 44px',
                    fontSize: 14,
                    color: '#111827',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={cardStyle({ padding: 20 })}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: '#111827',
                  marginBottom: 16,
                }}
              >
                Categories
              </div>

              <div style={{ display: 'grid', gap: 6 }}>
                {filteredCategories.length ? (
                  filteredCategories.map((item) => (
                    <Link
                      key={item.id}
                      to={`/category/${item.slug}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: '12px 12px',
                        borderRadius: 12,
                        color: '#111827',
                        fontWeight: 700,
                        background: '#ffffff',
                        textDecoration: 'none',
                      }}
                    >
                      <span>{item.name}</span>
                      <ChevronRight size={15} />
                    </Link>
                  ))
                ) : (
                  <div style={{ color: '#64748b' }}>No categories found.</div>
                )}
              </div>
            </div>

            <div style={cardStyle({ padding: 20 })}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: '#111827',
                  marginBottom: 16,
                }}
              >
                About This Post
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                <div
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    background: '#f8fafc',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Website</div>
                  <div style={{ fontWeight: 800, color: '#111827' }}>
                    {post?.website?.website_name || 'Bloggad'}
                  </div>
                </div>

                <div
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    background: '#f8fafc',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Product</div>
                  <div style={{ fontWeight: 800, color: '#111827' }}>
                    {post?.product?.title || '-'}
                  </div>
                </div>

                <div
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    background: '#f8fafc',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Template</div>
                  <div style={{ fontWeight: 800, color: '#111827' }}>
                    {post?.template?.name || '-'}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section>
          <div
            style={{
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
              marginBottom: 18,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#2563eb',
                  marginBottom: 8,
                }}
              >
                Bloggad
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 30,
                  lineHeight: 1.1,
                  fontWeight: 900,
                  color: '#111827',
                  letterSpacing: '-0.03em',
                }}
              >
                Related Posts
              </h2>
            </div>
          </div>

          <div className="post-related-grid">
            {relatedPosts.length ? (
              relatedPosts.map((item) => (
                <ArticleCard key={item.id} item={item} websiteSlug={websiteSlug} />
              ))
            ) : (
              <div
                style={{
                  ...cardStyle({
                    padding: 20,
                    color: '#64748b',
                  }),
                }}
              >
                No related posts found.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function PostPage() {
  const { websiteSlug, slug } = useParams();

  const [postData, setPostData] = useState(null);
  const [homeData, setHomeData] = useState(null);
  const [emailCapture, setEmailCapture] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError('');

        const [postRes, homeRes, captureRes] = await Promise.all([
          api.get(`/api/public/posts/${websiteSlug}/post/${slug}`),
          api.get('/api/public/home'),
          api.get('/api/email-list/public/popup', {
            params: { website_slug: websiteSlug },
          }),
        ]);

        const nextPostData = postRes?.data || null;
        const nextCapture =
          captureRes?.data?.capture ||
          captureRes?.data?.popup ||
          null;

        setPostData(nextPostData);
        setHomeData(homeRes?.data || null);
        setEmailCapture(
          captureRes?.data?.enabled
            ? {
                enabled: true,
                ...nextCapture,
              }
            : null
        );

        const websiteId = nextPostData?.post?.website?.id || captureRes?.data?.website?.id || null;
        const delaySeconds =
          Number(nextCapture?.popup_delay_seconds ?? nextCapture?.delay_seconds ?? 8) || 8;

        if (
          websiteId &&
          captureRes?.data?.enabled &&
          shouldShowEmailPopup(
            { enabled: true, ...nextCapture },
            websiteId
          )
        ) {
          clearEmailCaptureDismiss(websiteId);

          window.setTimeout(() => {
            if (
              shouldShowEmailPopup(
                { enabled: true, ...nextCapture },
                websiteId
              )
            ) {
              setPopupOpen(true);
            }
          }, delaySeconds * 1000);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    if (websiteSlug && slug) {
      fetchPost();
    }
  }, [websiteSlug, slug]);

  const post = postData?.post;
  const templateFields = postData?.template_fields || [];
  const ctaButtons = postData?.cta_buttons || [];
  const relatedPosts = postData?.related_posts || [];
  const categories = homeData?.categories || [];

  const templatePreset = useMemo(() => resolveTemplatePreset(post?.template), [post?.template]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f5f7fb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 18,
            padding: 22,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: '#334155',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)',
          }}
        >
          <Loader2 size={18} className="spin-soft" />
          <span>Loading post...</span>
        </div>

        <style>{`
          .spin-soft {
            animation: spinSoft 0.9s linear infinite;
          }
          @keyframes spinSoft {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f5f7fb',
          padding: 24,
        }}
      >
        <div
          style={{
            width: 'min(1100px, calc(100% - 24px))',
            margin: '0 auto',
            background: '#ffffff',
            border: '1px solid #fca5a5',
            borderLeft: '4px solid #dc2626',
            borderRadius: 16,
            padding: 18,
            color: '#991b1b',
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  const sharedProps = {
    post,
    templateFields,
    ctaButtons,
    relatedPosts,
    websiteSlug,
    emailCapture,
    onOpenPopup: () => setPopupOpen(true),
  };

  return (
    <>
      {templatePreset === 'neutral_review_template_v1' ? (
        <NeutralReviewTemplate {...sharedProps} />
      ) : (
        <GenericPostPage
          {...sharedProps}
          categories={categories}
        />
      )}

      <EmailCapturePopup
        open={popupOpen}
        onClose={() => {
          dismissEmailCaptureForNow(post?.website?.id, 10);
          setPopupOpen(false);
        }}
        capture={emailCapture}
        websiteSlug={websiteSlug}
        websiteId={post?.website?.id}
        onSubmitted={() => {
          setTimeout(() => {
            setPopupOpen(false);
          }, 1600);
        }}
      />
    </>
  );
}