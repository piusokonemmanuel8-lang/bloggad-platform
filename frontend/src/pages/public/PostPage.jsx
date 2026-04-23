import { useEffect, useMemo, useState } from 'react';
import { Loader2, Mail, Sparkles, Check, X, BellRing, BadgeCheck } from 'lucide-react';
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

  const TemplateComponent = useMemo(() => {
    return resolvePostTemplateComponent(post?.template);
  }, [post?.template]);

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