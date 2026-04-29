import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Loader2,
  Mail,
  Sparkles,
  Check,
  X,
  BellRing,
  BadgeCheck,
  Tag,
  Megaphone,
  ArrowRight,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import { resolvePostTemplateComponent } from './templates/posts';

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

  try {
    const dismissed = localStorage.getItem(getEmailCaptureDismissKey(websiteId));
    const cooldownUntil = Number(localStorage.getItem(getEmailCaptureCooldownKey(websiteId)) || 0);

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
    localStorage.setItem(getEmailCaptureCooldownKey(websiteId), String(Date.now() + minutes * 60 * 1000));
  } catch (error) {}
}

function dismissEmailCaptureForNow(websiteId, minutes = 10) {
  if (!websiteId) return;

  try {
    localStorage.setItem(getEmailCaptureDismissKey(websiteId), '1');
  } catch (error) {}

  setEmailCaptureCooldown(websiteId, minutes);
}

function clearEmailCaptureDismiss(websiteId) {
  if (!websiteId) return;

  try {
    localStorage.removeItem(getEmailCaptureDismissKey(websiteId));
  } catch (error) {}
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

function resolveSponsoredPostUrl(ad, fallbackWebsiteSlug = '') {
  const websiteSlug = ad?.website_slug || fallbackWebsiteSlug;
  const postSlug = ad?.post_slug || '';

  if (websiteSlug && postSlug) return `/${websiteSlug}/post/${postSlug}`;
  if (postSlug) return `/post/${postSlug}`;
  return '#';
}

function resolveSponsoredImage(ad) {
  return (
    ad?.display_image ||
    ad?.campaign_image_url ||
    ad?.campaign_image ||
    ad?.target_image ||
    ad?.featured_image ||
    ''
  );
}

function SponsoredRelatedPostCard({ ad, websiteSlug, onView, onClick, index }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onView(ad);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [ad, onView]);

  const image = resolveSponsoredImage(ad);
  const title = ad?.target_title || ad?.campaign_title || 'Sponsored Post';
  const description = ad?.campaign_description || 'Promoted article selected for readers of this category.';
  const sponsorNumber = String(index + 1).padStart(2, '0');

  return (
    <article ref={cardRef} className="sponsored-premium-card">
      <div className="sponsored-premium-image-wrap">
        <div className="sponsored-premium-top-label">Sponsored</div>

        {image ? (
          <img src={image} alt={title} className="sponsored-premium-image" />
        ) : (
          <div className="sponsored-premium-image-fallback">
            <Megaphone size={30} />
            <span>Sponsored</span>
          </div>
        )}
      </div>

      <div className="sponsored-premium-body">
        <div className="sponsored-premium-meta">
          <span>
            <Tag size={13} />
            Promoted Post
          </span>
          <strong>{sponsorNumber}</strong>
        </div>

        <h3 className="sponsored-premium-title">{title}</h3>
        <p className="sponsored-premium-description">{description}</p>

        <button
          type="button"
          onClick={() => onClick(ad, websiteSlug)}
          className="sponsored-premium-button"
        >
          Read Sponsored Post
          <ArrowRight size={16} />
        </button>
      </div>
    </article>
  );
}

function SponsoredRelatedPosts({ ads, websiteSlug, onView, onClick }) {
  if (!ads?.length) return null;

  return (
    <section className="sponsored-premium-section">
      <style>{`
        .sponsored-premium-section {
          width: 100%;
          margin: 24px 0;
          border-radius: 30px;
          padding: 22px;
          background:
            radial-gradient(circle at top left, rgba(37, 99, 235, 0.18), transparent 32%),
            linear-gradient(135deg, #07111f 0%, #111827 48%, #1e1b4b 100%);
          border: 1px solid rgba(191, 219, 254, 0.28);
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
          overflow: hidden;
        }

        .sponsored-premium-header {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 18px;
          align-items: end;
          margin-bottom: 18px;
        }

        .sponsored-premium-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #bfdbfe;
          font-size: 11px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 10px;
        }

        .sponsored-premium-heading {
          margin: 0;
          color: #ffffff;
          font-size: clamp(1.4rem, 3vw, 2.2rem);
          line-height: 1.05;
          font-weight: 950;
          letter-spacing: -0.04em;
        }

        .sponsored-premium-subtitle {
          margin: 8px 0 0;
          color: rgba(226, 232, 240, 0.82);
          font-size: 14px;
          line-height: 1.7;
          max-width: 760px;
        }

        .sponsored-premium-count {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 14px;
          border-radius: 999px;
          background: #ffffff;
          color: #111827;
          font-size: 13px;
          font-weight: 900;
          white-space: nowrap;
        }

        .sponsored-premium-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .sponsored-premium-card {
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 24px;
          overflow: hidden;
          min-height: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: 0 18px 44px rgba(2, 6, 23, 0.18);
          position: relative;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .sponsored-premium-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 24px 58px rgba(2, 6, 23, 0.24);
        }

        .sponsored-premium-image-wrap {
          position: relative;
          width: 100%;
          height: 210px;
          background: #e5e7eb;
          overflow: hidden;
        }

        .sponsored-premium-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transform: scale(1.01);
        }

        .sponsored-premium-image-fallback {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #1d4ed8, #7c3aed);
          color: #ffffff;
          font-weight: 950;
        }

        .sponsored-premium-top-label {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          min-height: 30px;
          padding: 0 11px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.95);
          color: #1d4ed8;
          border: 1px solid rgba(37, 99, 235, 0.2);
          font-size: 11px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.1);
        }

        .sponsored-premium-body {
          padding: 17px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .sponsored-premium-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }

        .sponsored-premium-meta span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          width: fit-content;
          padding: 7px 10px;
          border-radius: 999px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 11px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .sponsored-premium-meta strong {
          width: 34px;
          height: 34px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #111827;
          color: #ffffff;
          font-size: 12px;
          font-weight: 950;
        }

        .sponsored-premium-title {
          margin: 0 0 9px;
          color: #111827;
          font-size: 19px;
          line-height: 1.28;
          font-weight: 950;
          letter-spacing: -0.02em;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .sponsored-premium-description {
          margin: 0 0 15px;
          color: #475569;
          font-size: 13px;
          line-height: 1.65;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .sponsored-premium-button {
          margin-top: auto;
          border: 0;
          min-height: 48px;
          width: 100%;
          border-radius: 16px;
          background: linear-gradient(90deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%);
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 950;
          cursor: pointer;
          box-shadow: 0 14px 26px rgba(37, 99, 235, 0.22);
        }

        @media (max-width: 1100px) {
          .sponsored-premium-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .sponsored-premium-section {
            border-radius: 24px;
            padding: 16px;
          }

          .sponsored-premium-header {
            grid-template-columns: 1fr;
            align-items: start;
          }

          .sponsored-premium-count {
            width: fit-content;
          }

          .sponsored-premium-grid {
            display: flex;
            overflow-x: auto;
            gap: 14px;
            padding: 2px 2px 8px;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }

          .sponsored-premium-card {
            min-width: 82%;
            scroll-snap-align: start;
          }

          .sponsored-premium-image-wrap {
            height: 190px;
          }
        }

        @media (max-width: 440px) {
          .sponsored-premium-card {
            min-width: 90%;
          }

          .sponsored-premium-image-wrap {
            height: 175px;
          }
        }
      `}</style>

      <div className="sponsored-premium-header">
        <div>
          <div className="sponsored-premium-kicker">
            <Megaphone size={14} />
            Sponsored Picks
          </div>

          <h2 className="sponsored-premium-heading">Promoted stories you may like</h2>

          <p className="sponsored-premium-subtitle">
            Rotated sponsored posts from approved campaigns. Each view and click is tracked for fair delivery.
          </p>
        </div>

        <div className="sponsored-premium-count">{ads.length} shown now</div>
      </div>

      <div className="sponsored-premium-grid">
        {ads.map((ad, index) => (
          <SponsoredRelatedPostCard
            key={ad.id}
            ad={ad}
            index={index}
            websiteSlug={websiteSlug}
            onView={onView}
            onClick={onClick}
          />
        ))}
      </div>
    </section>
  );
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

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
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

          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
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

          <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.7 }}>
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

function EmailCaptureFooter({ capture, websiteSlug, websiteId }) {
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
    <section style={cardStyle({ padding: 0, marginTop: 24, overflow: 'hidden', background: '#ffffff' })}>
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

            <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
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

      <div style={{ padding: '14px 24px', color: '#94a3b8', fontSize: 12, lineHeight: 1.7, background: '#ffffff' }}>
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

export default function PostPage() {
  const { websiteSlug, slug } = useParams();

  const [postData, setPostData] = useState(null);
  const [homeData, setHomeData] = useState(null);
  const [emailCapture, setEmailCapture] = useState(null);
  const [sponsoredAds, setSponsoredAds] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const trackedSponsoredViewsRef = useRef(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    let popupTimer = null;

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError('');
        setSponsoredAds([]);
        trackedSponsoredViewsRef.current = new Set();

        const [postRes, homeRes, captureRes] = await Promise.all([
          api.get(`/api/public/posts/${websiteSlug}/post/${slug}`),
          api.get('/api/public/home'),
          api.get('/api/email-list/public/popup', {
            params: { website_slug: websiteSlug },
          }),
        ]);

        if (ignore) return;

        const nextPostData = postRes?.data || null;
        const nextPost = nextPostData?.post || null;
        const nextCapture = captureRes?.data?.capture || captureRes?.data?.popup || null;

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

        const rawCategoryId =
          nextPost?.category?.id ||
          nextPost?.category_id ||
          nextPost?.post_category_id ||
          nextPost?.product?.category_id ||
          nextPost?.product_category_id ||
          nextPost?.categoryId ||
          null;

        const categoryId = Number(rawCategoryId || 0);

        try {
          const adsParams = {
            ad_type: 'post',
            placement_key: 'post_page_related_posts',
            publisher_website_slug: websiteSlug,
            publisher_website_id: nextPost?.website?.id || '',
            publisher_affiliate_id: nextPost?.website?.user_id || '',
            limit: 6,
          };

          if (categoryId > 0) {
            adsParams.category_id = categoryId;
          }

          const adsRes = await api.get('/api/public/affiliate-ads', {
            params: adsParams,
          });

          if (!ignore) {
            setSponsoredAds(Array.isArray(adsRes?.data?.ads) ? adsRes.data.ads : []);
          }
        } catch (adsError) {
          if (!ignore) {
            setSponsoredAds([]);
          }
        }

        const websiteId = nextPostData?.post?.website?.id || captureRes?.data?.website?.id || null;
        const delaySeconds = Number(nextCapture?.popup_delay_seconds ?? nextCapture?.delay_seconds ?? 8) || 8;

        if (
          websiteId &&
          captureRes?.data?.enabled &&
          shouldShowEmailPopup({ enabled: true, ...nextCapture }, websiteId)
        ) {
          clearEmailCaptureDismiss(websiteId);

          popupTimer = window.setTimeout(() => {
            if (!ignore && shouldShowEmailPopup({ enabled: true, ...nextCapture }, websiteId)) {
              setPopupOpen(true);
            }
          }, delaySeconds * 1000);
        }
      } catch (err) {
        if (!ignore) {
          setError(err?.response?.data?.message || 'Failed to load post');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    if (websiteSlug && slug) {
      fetchPost();
    }

    return () => {
      ignore = true;
      if (popupTimer) {
        window.clearTimeout(popupTimer);
      }
    };
  }, [websiteSlug, slug]);

  const post = postData?.post;
  const templateFields = postData?.template_fields || [];
  const ctaButtons = postData?.cta_buttons || [];
  const relatedPosts = postData?.related_posts || [];
  const categories = homeData?.categories || [];

  const TemplateComponent = useMemo(() => {
    return resolvePostTemplateComponent(post?.template);
  }, [post?.template]);

  const trackSponsoredView = useCallback(
    async (ad) => {
      if (!ad?.id || trackedSponsoredViewsRef.current.has(ad.id)) return;

      trackedSponsoredViewsRef.current.add(ad.id);

      try {
        await api.post(`/api/public/affiliate-ads/${ad.id}/view`, {
          placement_key: 'post_page_related_posts',
          page_url: window.location.href,
          publisher_website_slug: websiteSlug,
          publisher_website_id: post?.website?.id || '',
          publisher_affiliate_id: post?.website?.user_id || '',
        });
      } catch (err) {}
    },
    [post?.website?.id, post?.website?.user_id, websiteSlug]
  );

  const trackSponsoredClick = useCallback(
    async (ad, fallbackWebsiteSlug = '') => {
      if (!ad?.id) return;

      const targetUrl = resolveSponsoredPostUrl(ad, fallbackWebsiteSlug);

      try {
        await api.post(`/api/public/affiliate-ads/${ad.id}/click`, {
          placement_key: 'post_page_related_posts',
          page_url: window.location.href,
          destination_url: targetUrl,
          publisher_website_slug: websiteSlug,
          publisher_website_id: post?.website?.id || '',
          publisher_affiliate_id: post?.website?.user_id || '',
        });
      } catch (err) {}

      if (targetUrl && targetUrl !== '#') {
        window.location.href = targetUrl;
      }
    },
    [post?.website?.id, post?.website?.user_id, websiteSlug]
  );

  const sponsoredRelatedPostsSlot = (
    <SponsoredRelatedPosts
      ads={sponsoredAds}
      websiteSlug={websiteSlug}
      onView={trackSponsoredView}
      onClick={trackSponsoredClick}
    />
  );

  const emailCaptureFooter = (
    <EmailCaptureFooter
      capture={emailCapture}
      websiteSlug={websiteSlug}
      websiteId={post?.website?.id}
    />
  );

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
      <div style={{ minHeight: '100vh', background: '#f5f7fb', padding: 24 }}>
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

  return (
    <>
      <TemplateComponent
        post={post}
        templateFields={templateFields}
        ctaButtons={ctaButtons}
        relatedPosts={relatedPosts}
        websiteSlug={websiteSlug}
        categories={categories}
        emailCapture={emailCapture}
        emailCaptureFooter={emailCaptureFooter}
        sponsoredRelatedPostsSlot={sponsoredRelatedPostsSlot}
        onOpenPopup={() => setPopupOpen(true)}
      />

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