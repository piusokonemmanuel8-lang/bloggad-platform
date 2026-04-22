import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

export default function CustomerAuthPopup({
  open,
  onClose,
  websiteSlug = '',
  websiteId = '',
  affiliateId = '',
}) {
  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (websiteId) params.set('website_id', String(websiteId));
    if (websiteSlug) params.set('website_slug', String(websiteSlug));
    if (affiliateId) params.set('affiliate_id', String(affiliateId));

    const built = params.toString();
    return built ? `?${built}` : '';
  }, [websiteId, websiteSlug, affiliateId]);

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(6px)',
          zIndex: 500,
        }}
      />

      <div
        style={{
          position: 'fixed',
          inset: '50% auto auto 50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(520px, calc(100% - 24px))',
          background: '#ffffff',
          borderRadius: 28,
          border: '1px solid #e5e7eb',
          boxShadow: '0 28px 90px rgba(15, 23, 42, 0.22)',
          zIndex: 501,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid #eef2f7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: '#64748b',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              Customer Access
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: '#111827',
                letterSpacing: '-0.03em',
              }}
            >
              Sign in or create account
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
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
        </div>

        <div
          style={{
            padding: 20,
            display: 'grid',
            gap: 14,
          }}
        >
          <div
            style={{
              borderRadius: 22,
              background: '#f8fafc',
              border: '1px solid #e5e7eb',
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 15,
                lineHeight: 1.7,
                color: '#475569',
              }}
            >
              Continue as a customer for this storefront. Your store context will be carried automatically.
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            <Link
              to={`/customer/register${queryString}`}
              onClick={onClose}
              style={{
                minHeight: 54,
                borderRadius: 18,
                background: '#2563eb',
                color: '#ffffff',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 15,
                fontWeight: 800,
              }}
            >
              Register as Customer
            </Link>

            <Link
              to={`/customer/login${queryString}`}
              onClick={onClose}
              style={{
                minHeight: 54,
                borderRadius: 18,
                border: '1px solid #d1d5db',
                background: '#ffffff',
                color: '#111827',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 15,
                fontWeight: 800,
              }}
            >
              Login as Customer
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}