import { Link } from 'react-router-dom';
import { Check, ChevronRight, ShoppingCart, Star } from 'lucide-react';
import MonetizationAdSlot from '../../../../components/monetization/MonetizationAdSlot';
import useAffiliateMonetizationSlots from '../../../../hooks/useAffiliateMonetizationSlots';

const PAYMENT_LOGO_STRIP = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="100" viewBox="0 0 800 100">
  <rect width="800" height="100" fill="transparent"/>

  <g>
    <rect x="12" y="10" rx="4" ry="4" width="124" height="80" fill="#ffffff" stroke="#e5e7eb"/>
    <text x="74" y="57" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="700" fill="#1a73e8">VISA</text>
  </g>

  <g>
    <rect x="148" y="10" rx="4" ry="4" width="124" height="80" fill="#ffffff" stroke="#e5e7eb"/>
    <text x="210" y="55" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#16386b">PayPal</text>
  </g>

  <g>
    <rect x="284" y="10" rx="4" ry="4" width="124" height="80" fill="#ffffff" stroke="#e5e7eb"/>
    <circle cx="340" cy="48" r="20" fill="#ea001b" opacity="0.92"/>
    <circle cx="365" cy="48" r="20" fill="#f79e1b" opacity="0.92"/>
    <text x="352" y="54" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700" fill="#ffffff">MasterCard</text>
  </g>

  <g>
    <rect x="420" y="10" rx="4" ry="4" width="124" height="80" fill="#ffffff" stroke="#e5e7eb"/>
    <text x="482" y="48" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#111827">DISCOVER</text>
    <path d="M438 68 Q482 44 526 68 L526 80 L438 80 Z" fill="#f7931e"/>
  </g>

  <g>
    <rect x="556" y="10" rx="4" ry="4" width="232" height="80" fill="#ffffff" stroke="#e5e7eb"/>
    <text x="672" y="42" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#199ad6">AMERICAN</text>
    <text x="672" y="66" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#199ad6">EXPRESS</text>
  </g>
</svg>
`)}`;

function normalizeKey(value) {
  return String(value || '').trim().toLowerCase();
}

function useTemplateMap(templateFields = [], ctaButtons = []) {
  const fieldMap = {};
  const buttonMap = {};

  templateFields.forEach((field) => {
    fieldMap[normalizeKey(field.field_key)] = field?.field_value || '';
  });

  ctaButtons.forEach((button) => {
    buttonMap[normalizeKey(button.button_key)] = button || {};
  });

  return { fieldMap, buttonMap };
}

function getButtonProps(buttonMap, key, fallbackLabel = 'Order Now') {
  const button = buttonMap[normalizeKey(key)] || {};
  return {
    label: button.button_label || fallbackLabel,
    url: button.button_url || '#',
    style: button.button_style || 'primary',
    openInNewTab: !!button.open_in_new_tab,
  };
}

function cardStyle(extra = {}) {
  return {
    background: '#f3f3f3',
    border: 'none',
    borderRadius: 0,
    boxShadow: 'none',
    ...extra,
  };
}

function FullWidthSection({ children, style = {} }) {
  return (
    <section
      style={{
        width: '100%',
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function PageContainer({ children, style = {} }) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '100%',
        margin: '0',
        padding: '0 14px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function ProductImage({ src, alt, maxWidth = '100%', imgStyle = {} }) {
  if (!src) {
    return (
      <div
        style={{
          width: '100%',
          maxWidth,
          minHeight: 320,
          background: '#ececec',
          margin: '0 auto',
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'Product'}
      style={{
        width: '100%',
        maxWidth,
        display: 'block',
        margin: '0 auto',
        objectFit: 'contain',
        ...imgStyle,
      }}
    />
  );
}

function SectionHeader({ children }) {
  return (
    <FullWidthSection style={{ background: '#0b7f4b', marginTop: 22 }}>
      <PageContainer>
        <div
          style={{
            color: '#ffffff',
            textAlign: 'center',
            fontWeight: 800,
            fontSize: 24,
            lineHeight: 1.25,
            padding: '24px 10px',
          }}
        >
          {children}
        </div>
      </PageContainer>
    </FullWidthSection>
  );
}

function TextBlock({ children, center = false, bold = false, className = '', style = {} }) {
  return (
    <p
      className={className}
      style={{
        margin: '0 0 16px',
        color: '#1f2937',
        fontSize: 16,
        lineHeight: 1.8,
        textAlign: center ? 'center' : 'left',
        fontWeight: bold ? 800 : 500,
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
        ...style,
      }}
    >
      {children || '-'}
    </p>
  );
}

function CTAButton({ button, full = false, className = '' }) {
  return (
    <a
      href={button.url || '#'}
      target={button.openInNewTab ? '_blank' : '_self'}
      rel={button.openInNewTab ? 'noreferrer' : undefined}
      className={`dxt-btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        minHeight: 56,
        padding: '0 26px',
        width: full ? '100%' : 'auto',
        maxWidth: '100%',
        borderRadius: 9999,
        background: '#facc15',
        color: '#111827',
        textDecoration: 'none',
        fontWeight: 700,
        fontSize: 15,
        lineHeight: 1.2,
        boxShadow: '0 3px 12px rgba(0,0,0,0.18)',
        border: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <span>{button.label}</span>
      <ShoppingCart size={17} strokeWidth={2.4} />
    </a>
  );
}

function TrustLine({ items = [] }) {
  const safeItems = items.filter(Boolean);
  if (!safeItems.length) return null;

  return (
    <div className="dxt-hero-trust-line">
      {safeItems.map((item, index) => (
        <div key={`${item}-${index}`} className="dxt-hero-trust-item">
          <Check size={18} strokeWidth={2.4} />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function ReviewRow({ text }) {
  if (!text) return null;

  return (
    <div
      className="dxt-review-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        flexWrap: 'wrap',
        marginTop: 16,
        marginBottom: 18,
      }}
    >
      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} size={18} fill="#f59e0b" color="#f59e0b" />
        ))}
      </div>

      <div
        className="dxt-review-text"
        style={{
          color: '#6b7280',
          fontSize: 15,
          fontWeight: 700,
          lineHeight: 1.2,
        }}
      >
        {text}
      </div>
    </div>
  );
}

function HeroCircleBadges({ images = [] }) {
  const safeImages = images.filter(Boolean);
  if (!safeImages.length) return null;

  return (
    <div
      style={{
        width: '100%',
        marginTop: 18,
      }}
    >
      <div className="dxt-circle-badges-wrap">
        <div className="dxt-circle-badges-row">
          {safeImages.map((src, index) => (
            <div key={`${src}-${index}`} className="dxt-circle-badge">
              <img
                src={src}
                alt={`Badge ${index + 1}`}
                style={{
                  width: '74%',
                  height: '74%',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureBullets({ items = [] }) {
  const safeItems = items.filter(Boolean);
  if (!safeItems.length) return null;

  return (
    <div className="dxt-feature-bullets">
      {safeItems.map((item, index) => (
        <div key={`${item}-${index}`} className="dxt-feature-bullet">
          <Check size={17} strokeWidth={2.4} />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function TestimonialCard({ item }) {
  return (
    <div
      style={{
        background: '#ffffff',
        padding: 16,
        textAlign: 'center',
        border: '1px solid #d9e3dc',
      }}
    >
      {item.image ? (
        <img
          src={item.image}
          alt={item.name || 'Testimonial'}
          style={{
            width: 86,
            height: 86,
            borderRadius: '50%',
            objectFit: 'cover',
            display: 'block',
            margin: '0 auto 12px',
          }}
        />
      ) : (
        <div
          style={{
            width: 86,
            height: 86,
            borderRadius: '50%',
            background: '#f1f5f9',
            margin: '0 auto 12px',
          }}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginBottom: 10 }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} size={15} fill="#f59e0b" color="#f59e0b" />
        ))}
      </div>

      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#111827',
          marginBottom: 8,
          lineHeight: 1.3,
        }}
      >
        {item.name || '-'}
      </div>

      <div
        style={{
          color: '#334155',
          fontSize: 14,
          lineHeight: 1.75,
        }}
      >
        {item.text || '-'}
      </div>
    </div>
  );
}

function PaymentMethodsRow() {
  return (
    <div className="dxt-payment-row">
      <div className="dxt-payment-strip-card">
        <img
          src={PAYMENT_LOGO_STRIP}
          alt="Visa, PayPal, Mastercard, Discover and American Express"
          className="dxt-payment-strip-image"
        />
      </div>
    </div>
  );
}

function PricingCard({ item, featured = false }) {
  return (
    <div className={`dxt-pricing-card ${featured ? 'is-featured' : ''}`}>
      <div className="dxt-pricing-title">{item.title || '-'}</div>
      <div className="dxt-pricing-subtitle">{item.subtitle || '-'}</div>

      <div className="dxt-pricing-image-wrap">
        <ProductImage
          src={item.image}
          alt={item.title}
          maxWidth="100%"
          imgStyle={{
            maxHeight: 320,
          }}
        />
        {featured && item.badgeText ? (
          <div className="dxt-pricing-badge">{item.badgeText}</div>
        ) : null}
      </div>

      <div className="dxt-pricing-price-line">
        <span className="dxt-pricing-price-main">{item.price || '-'}</span>
        <span className="dxt-pricing-price-suffix">{item.priceSuffix || ''}</span>
      </div>

      <div className="dxt-pricing-btn-wrap">
        <CTAButton button={item.button} className="dxt-pricing-btn" />
      </div>

      <div className="dxt-pricing-total-line">
        <span className="dxt-pricing-total-label">{item.totalLabel || 'TOTAL:'}</span>{' '}
        <span className="dxt-pricing-total-old">{item.totalOldPrice || '-'}</span>{' '}
        <span className="dxt-pricing-total-new">{item.totalNewPrice || '-'}</span>
      </div>

      <PaymentMethodsRow />
    </div>
  );
}

function RelatedCard({ item, websiteSlug }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #d9e3dc',
        overflow: 'hidden',
      }}
    >
      {item?.featured_image ? (
        <img
          src={item.featured_image}
          alt={item.title}
          style={{
            width: '100%',
            height: 200,
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <div style={{ height: 200, background: '#e5e7eb' }} />
      )}

      <div style={{ padding: 16 }}>
        <div
          style={{
            fontSize: 18,
            lineHeight: 1.35,
            fontWeight: 700,
            color: '#111827',
            marginBottom: 10,
          }}
        >
          {item?.title || 'Related post'}
        </div>

        <div
          style={{
            color: '#475569',
            fontSize: 14,
            lineHeight: 1.75,
            marginBottom: 12,
          }}
        >
          {item?.excerpt || 'No excerpt'}
        </div>

        <Link
          to={`/${websiteSlug}/post/${item.slug}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#0b7f4b',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Read More
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}

function StorefrontAdBlock({
  slotKey,
  monetizationSettings,
  websiteId,
  affiliateUserId,
}) {
  return (
    <MonetizationAdSlot
      slotKey={slotKey}
      monetizationSettings={monetizationSettings}
      placementMode="storefront"
      reviewRequired={true}
      darkMode={false}
      websiteId={websiteId}
      affiliateUserId={affiliateUserId}
    />
  );
}

export default function DxtTemplate({
  post,
  templateFields,
  ctaButtons,
  relatedPosts = [],
  websiteSlug,
  emailCaptureFooter,
  website,
  settings,
  sponsoredRelatedPostsSlot,
}) {
  const { fieldMap, buttonMap } = useTemplateMap(templateFields, ctaButtons);
  const { settings: monetizationSettings } = useAffiliateMonetizationSlots({ enabled: true });

  const resolvedWebsiteId =
    website?.id ||
    settings?.website_id ||
    settings?.website?.id ||
    monetizationSettings?.website_id ||
    '';

  const resolvedAffiliateUserId =
    website?.user_id ||
    website?.affiliate_id ||
    settings?.affiliate_id ||
    settings?.user_id ||
    monetizationSettings?.affiliate_user_id ||
    monetizationSettings?.user_id ||
    '';

  const heroPrimaryButton = getButtonProps(buttonMap, 'hero_primary_cta', 'Get Discount');
  const heroSecondaryButton = getButtonProps(buttonMap, 'hero_secondary_cta', 'Official Website');
  const worksButton = getButtonProps(buttonMap, 'how_it_works_cta', 'Official Website');
  const ingredientsButton = getButtonProps(buttonMap, 'ingredients_cta', 'Get A Discount');
  const specialOfferButton = getButtonProps(buttonMap, 'special_offer_cta', 'Claim Offer');
  const pricingCard1Button = getButtonProps(buttonMap, 'pricing_card_1_cta', 'Buy Now');
  const pricingCard2Button = getButtonProps(buttonMap, 'pricing_card_2_cta', 'Buy Now');
  const pricingCard3Button = getButtonProps(buttonMap, 'pricing_card_3_cta', 'Buy Now');

  const heroTrustItems = [
    fieldMap.hero_trust_item_1,
    fieldMap.hero_trust_item_2,
    fieldMap.hero_trust_item_3,
  ];

  const heroCircleImages = [
    fieldMap.hero_badge_logo_1,
    fieldMap.hero_badge_logo_2,
    fieldMap.hero_badge_logo_3,
    fieldMap.hero_badge_logo_4,
    fieldMap.hero_badge_logo_5,
  ];

  const featureBulletItems = [
    fieldMap.feature_bullet_1,
    fieldMap.feature_bullet_2,
    fieldMap.feature_bullet_3,
  ];

  const ingredients = Array.from({ length: 5 }, (_, index) => ({
    title: fieldMap[`ingredient_${index + 1}_title`],
    text: fieldMap[`ingredient_${index + 1}_text`],
  }));

  const benefits = Array.from({ length: 6 }, (_, index) => ({
    title: fieldMap[`benefit_${index + 1}_title`],
    text: fieldMap[`benefit_${index + 1}_text`],
  }));

  const testimonials = Array.from({ length: 3 }, (_, index) => ({
    image: fieldMap[`testimonial_${index + 1}_image`],
    name: fieldMap[`testimonial_${index + 1}_name_line`],
    text: fieldMap[`testimonial_${index + 1}_text`],
  }));

  const pricingCards = [
    {
      title: fieldMap.pricing_card_1_package_title,
      subtitle: fieldMap.pricing_card_1_supply_label,
      image: fieldMap.pricing_card_1_image,
      price: fieldMap.pricing_card_1_price_text,
      priceSuffix: fieldMap.pricing_card_1_price_suffix || '',
      totalLabel: fieldMap.pricing_card_1_total_label || 'TOTAL:',
      totalOldPrice: fieldMap.pricing_card_1_total_old_price,
      totalNewPrice: fieldMap.pricing_card_1_total_new_price,
      button: pricingCard1Button,
    },
    {
      title: fieldMap.pricing_card_2_package_title,
      subtitle: fieldMap.pricing_card_2_supply_label,
      image: fieldMap.pricing_card_2_image,
      price: fieldMap.pricing_card_2_price_text,
      priceSuffix: fieldMap.pricing_card_2_price_suffix || '',
      totalLabel: fieldMap.pricing_card_2_total_label || 'TOTAL:',
      totalOldPrice: fieldMap.pricing_card_2_total_old_price,
      totalNewPrice: fieldMap.pricing_card_2_total_new_price,
      badgeText: fieldMap.pricing_card_2_badge_text || 'BEST VALUE',
      button: pricingCard2Button,
    },
    {
      title: fieldMap.pricing_card_3_package_title,
      subtitle: fieldMap.pricing_card_3_supply_label,
      image: fieldMap.pricing_card_3_image,
      price: fieldMap.pricing_card_3_price_text,
      priceSuffix: fieldMap.pricing_card_3_price_suffix || '',
      totalLabel: fieldMap.pricing_card_3_total_label || 'TOTAL:',
      totalOldPrice: fieldMap.pricing_card_3_total_old_price,
      totalNewPrice: fieldMap.pricing_card_3_total_new_price,
      button: pricingCard3Button,
    },
  ];

  const faqs = Array.from({ length: 10 }, (_, index) => ({
    question: fieldMap[`faq_${index + 1}_question`],
    answer: fieldMap[`faq_${index + 1}_answer`],
  }));

  const learnMoreParagraphs = Array.from(
    { length: 10 },
    (_, index) => fieldMap[`learn_more_paragraph_${index + 1}`]
  ).filter(Boolean);

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#f3f3f3',
        overflowX: 'hidden',
      }}
    >
      <style>{`
        * {
          box-sizing: border-box;
        }

        html, body {
          overflow-x: hidden;
        }

        .dxt-btn {
          transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
        }

        .dxt-btn:hover {
          transform: scale(1.04);
          box-shadow: 0 6px 18px rgba(0,0,0,0.22);
          filter: brightness(1.02);
        }

        .dxt-ad-top-wrap {
          margin: 0 0 22px;
        }

        .dxt-ad-sidebar-wrap {
          margin-top: 22px;
          width: 100%;
        }

        .dxt-ad-bottom-wrap {
          margin: 28px 0 18px;
        }

        .dxt-sponsored-related-wrap {
          margin: 28px 0 24px;
        }

        .dxt-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 44%) minmax(0, 56%);
          gap: 28px;
          align-items: start;
          width: 100%;
        }

        .dxt-hero-grid > div,
        .dxt-two-col > div,
        .dxt-works-grid > div,
        .dxt-three-grid > div,
        .dxt-pricing-grid > div {
          min-width: 0;
        }

        .dxt-hero-title {
          font-size: 30px;
          line-height: 1.3;
          font-weight: 600;
          color: #0b7f4b;
          margin: 0 0 24px;
          overflow-wrap: anywhere;
          word-break: break-word;
          hyphens: auto;
          max-width: 100%;
        }

        .dxt-hero-description {
          font-size: 20px;
          line-height: 1.6;
          font-weight: 400;
          color: #111827;
          overflow-wrap: anywhere;
          word-break: break-word;
          hyphens: auto;
          margin: 0;
          min-width: 0;
          max-width: 100%;
        }

        .dxt-hero-description p {
          margin: 0 0 34px;
          overflow-wrap: anywhere;
          word-break: break-word;
          hyphens: auto;
          max-width: 100%;
        }

        .dxt-hero-cta-group {
          width: 100%;
          padding-left: 64px;
          min-width: 0;
          max-width: 100%;
        }

        .dxt-hero-cta-line {
          margin: 0 0 22px;
          color: #0b7f4b;
          font-size: 18px;
          line-height: 1.4;
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 3px;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-hero-cta-buttons {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 22px;
          min-width: 0;
          max-width: 100%;
        }

        .dxt-hero-trust-line {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 18px;
          min-width: 0;
          max-width: 100%;
        }

        .dxt-hero-trust-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #111827;
          font-size: 15px;
          line-height: 1.4;
          font-weight: 400;
          min-width: 0;
        }

        .dxt-circle-badges-wrap {
          width: 100%;
          display: flex;
          justify-content: center;
          padding-left: 28px;
          min-width: 0;
          max-width: 100%;
        }

        .dxt-circle-badges-row {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: nowrap;
          justify-content: center;
          overflow-x: auto;
          overflow-y: hidden;
          padding-bottom: 6px;
          max-width: 100%;
          min-width: 0;
          scrollbar-width: thin;
        }

        .dxt-circle-badge {
          width: 112px;
          height: 112px;
          min-width: 112px;
          border-radius: 50%;
          border: 4px solid #ef4444;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .dxt-feature-bullets {
          display: flex;
          align-items: center;
          gap: 26px;
          flex-wrap: wrap;
          margin-top: 18px;
          min-width: 0;
          max-width: 100%;
        }

        .dxt-feature-bullet {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #111827;
          font-size: 15px;
          line-height: 1.45;
          font-weight: 500;
          min-width: 0;
        }

        .dxt-two-col {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 30px;
          align-items: center;
        }

        .dxt-three-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .dxt-faq-item {
          margin-bottom: 24px;
        }

        .dxt-faq-item h3 {
          margin: 0 0 8px;
          font-size: 24px;
          line-height: 1.3;
          font-weight: 600;
          color: #1e293b;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .dxt-faq-item p {
          margin: 0;
          font-size: 16px;
          line-height: 1.75;
          color: #334155;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .dxt-works-grid {
          display: grid;
          grid-template-columns: minmax(0, 46%) minmax(0, 54%);
          gap: 40px;
          align-items: center;
          width: 100%;
        }

        .dxt-works-text {
          width: 100%;
          min-width: 0;
          max-width: 100%;
        }

        .dxt-works-paragraph {
          margin: 0 0 26px;
          color: #111827;
          font-size: 20px;
          line-height: 1.6;
          font-weight: 400;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-ingredients-intro {
          margin: 0 0 22px;
          color: #111827;
          font-size: 22px;
          line-height: 1.65;
          font-weight: 400;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-ingredient-item {
          margin-bottom: 18px;
        }

        .dxt-ingredient-title {
          font-size: 24px;
          line-height: 1.35;
          font-weight: 800;
          color: #111827;
          margin-bottom: 8px;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-ingredient-text {
          color: #334155;
          font-size: 19px;
          line-height: 1.7;
          font-weight: 400;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-ingredient-closing {
          margin-top: 10px;
          margin-bottom: 24px;
          color: #111827;
          font-size: 21px;
          line-height: 1.65;
          font-weight: 500;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-benefits-intro {
          margin: 0 0 24px;
          color: #111827;
          font-size: 22px;
          line-height: 1.65;
          font-weight: 400;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-benefit-item {
          margin-bottom: 24px;
        }

        .dxt-benefit-title {
          font-size: 24px;
          line-height: 1.35;
          font-weight: 800;
          color: #111827;
          margin-bottom: 8px;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-benefit-text {
          color: #334155;
          font-size: 19px;
          line-height: 1.7;
          font-weight: 400;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-benefit-closing {
          margin-top: 14px;
          color: #111827;
          font-size: 21px;
          line-height: 1.65;
          font-weight: 500;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
          align-items: stretch;
        }

        .dxt-pricing-card {
          border: 3px solid #3b4b63;
          background: #f3f3f3;
          padding: 18px 18px 22px;
          text-align: center;
          position: relative;
          min-height: 100%;
          min-width: 0;
          overflow: hidden;
        }

        .dxt-pricing-title {
          color: #0b7f4b;
          font-size: 32px;
          line-height: 1.15;
          font-weight: 800;
          margin-bottom: 22px;
          text-transform: uppercase;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-pricing-subtitle {
          color: #111827;
          font-size: 26px;
          line-height: 1.2;
          font-weight: 800;
          margin-bottom: 22px;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-pricing-image-wrap {
          position: relative;
          margin-bottom: 18px;
          min-height: 330px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          min-width: 0;
        }

        .dxt-pricing-badge {
          position: absolute;
          right: 8%;
          top: 8%;
          width: 122px;
          height: 122px;
          border-radius: 50%;
          background: #ff6a5e;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 18px;
          line-height: 1.05;
          font-weight: 900;
          padding: 10px;
          box-shadow: 0 6px 16px rgba(0,0,0,0.18);
          border: 4px solid #ffd6d2;
        }

        .dxt-pricing-price-line {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 6px;
          margin-bottom: 18px;
          flex-wrap: wrap;
          min-width: 0;
        }

        .dxt-pricing-price-main {
          color: #0b7f4b;
          font-size: 58px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .dxt-pricing-price-suffix {
          color: #0b7f4b;
          font-size: 28px;
          line-height: 1.15;
          font-weight: 500;
          padding-bottom: 7px;
        }

        .dxt-pricing-btn-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 18px;
          min-width: 0;
        }

        .dxt-pricing-btn {
          min-width: 290px;
          min-height: 64px;
          font-size: 22px;
          font-weight: 800;
          box-shadow: 0 7px 18px rgba(0,0,0,0.2);
          max-width: 100%;
        }

        .dxt-pricing-total-line {
          color: #111827;
          font-size: 24px;
          line-height: 1.3;
          font-weight: 900;
          margin-bottom: 18px;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-pricing-total-label {
          text-transform: uppercase;
        }

        .dxt-pricing-total-old {
          text-decoration: line-through;
        }

        .dxt-pricing-total-new {
          color: #111827;
        }

        .dxt-payment-row {
          width: 100%;
          margin-top: 6px;
          min-width: 0;
        }

        .dxt-payment-strip-card {
          width: 100%;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 0;
        }

        .dxt-payment-strip-image {
          width: 100%;
          max-width: 540px;
          height: auto;
          display: block;
          object-fit: contain;
        }

        .dxt-works-image-wrap {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 10px 24px 10px 12px;
          min-width: 0;
        }

        .dxt-works-image {
          width: 100%;
          max-width: 620px;
          display: block;
          margin: 0 auto;
          object-fit: contain;
        }

        @media (max-width: 1100px) {
          .dxt-hero-grid,
          .dxt-two-col,
          .dxt-three-grid,
          .dxt-works-grid,
          .dxt-pricing-grid {
            grid-template-columns: 1fr;
          }

          .dxt-hero-title {
            font-size: 28px;
          }

          .dxt-hero-description {
            font-size: 18px;
          }

          .dxt-works-paragraph,
          .dxt-ingredients-intro,
          .dxt-ingredient-text,
          .dxt-ingredient-closing,
          .dxt-benefits-intro,
          .dxt-benefit-text,
          .dxt-benefit-closing {
            font-size: 18px;
          }

          .dxt-ingredient-title,
          .dxt-benefit-title {
            font-size: 22px;
          }

          .dxt-pricing-title {
            font-size: 28px;
          }

          .dxt-pricing-subtitle {
            font-size: 22px;
          }

          .dxt-pricing-price-main {
            font-size: 52px;
          }

          .dxt-pricing-price-suffix {
            font-size: 24px;
          }

          .dxt-pricing-btn {
            min-width: 260px;
            font-size: 20px;
          }

          .dxt-pricing-total-line {
            font-size: 22px;
          }

          .dxt-hero-cta-group {
            padding-left: 0;
          }

          .dxt-circle-badges-wrap {
            justify-content: flex-start;
            padding-left: 0;
          }

          .dxt-circle-badges-row {
            justify-content: flex-start;
          }

          .dxt-works-image-wrap {
            padding: 0;
          }

          .dxt-works-image {
            max-width: 560px;
          }

          .dxt-ad-sidebar-wrap {
            margin-top: 18px;
          }
        }

        @media (max-width: 767px) {
          .dxt-hero-grid,
          .dxt-two-col,
          .dxt-three-grid,
          .dxt-works-grid,
          .dxt-pricing-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .dxt-hero-title {
            font-size: 17px;
            line-height: 1.5;
            margin-bottom: 12px;
            letter-spacing: 0;
          }

          .dxt-hero-description {
            font-size: 14px;
            line-height: 1.7;
          }

          .dxt-hero-description p {
            margin: 0 0 14px;
          }

          .dxt-works-paragraph,
          .dxt-ingredients-intro,
          .dxt-ingredient-text,
          .dxt-ingredient-closing,
          .dxt-benefits-intro,
          .dxt-benefit-text,
          .dxt-benefit-closing {
            font-size: 15px;
            line-height: 1.7;
          }

          .dxt-ingredient-title,
          .dxt-benefit-title {
            font-size: 18px;
          }

          .dxt-pricing-title {
            font-size: 22px;
          }

          .dxt-pricing-subtitle {
            font-size: 18px;
          }

          .dxt-pricing-image-wrap {
            min-height: 220px;
          }

          .dxt-pricing-price-main {
            font-size: 38px;
          }

          .dxt-pricing-price-suffix {
            font-size: 20px;
            padding-bottom: 4px;
          }

          .dxt-pricing-btn {
            min-width: 100%;
            width: 100%;
            font-size: 17px;
            padding: 0 18px;
          }

          .dxt-pricing-total-line {
            font-size: 18px;
          }

          .dxt-pricing-badge {
            width: 82px;
            height: 82px;
            font-size: 13px;
            top: 6px;
            right: 6px;
          }

          .dxt-payment-strip-image {
            max-width: 100%;
          }

          .dxt-hero-cta-buttons,
          .dxt-hero-trust-line,
          .dxt-feature-bullets {
            gap: 10px;
          }

          .dxt-hero-cta-group {
            padding-left: 0;
          }

          .dxt-hero-cta-line {
            font-size: 15px;
            line-height: 1.5;
            margin-bottom: 14px;
          }

          .dxt-circle-badges-wrap {
            justify-content: flex-start;
            padding-left: 0;
          }

          .dxt-circle-badges-row {
            justify-content: flex-start;
            gap: 12px;
          }

          .dxt-circle-badge {
            width: 78px;
            height: 78px;
            min-width: 78px;
            border-width: 3px;
          }

          .dxt-works-image-wrap {
            padding: 0;
          }

          .dxt-works-image {
            max-width: 100%;
          }

          .dxt-review-row {
            justify-content: flex-start !important;
            gap: 6px !important;
            margin-top: 10px !important;
            margin-bottom: 14px !important;
            flex-wrap: nowrap !important;
            overflow: hidden;
            min-width: 0;
            max-width: 100%;
          }

          .dxt-review-text {
            font-size: 12px !important;
            line-height: 1.2 !important;
            min-width: 0;
            flex: 1 1 auto;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .dxt-feature-bullet,
          .dxt-hero-trust-item {
            font-size: 14px;
          }

          .dxt-pricing-card {
            padding: 14px 12px 18px;
          }

          .dxt-faq-item h3 {
            font-size: 20px;
          }

          .dxt-faq-item p {
            font-size: 15px;
            line-height: 1.7;
          }

          .dxt-ad-top-wrap {
            margin-bottom: 16px;
          }

          .dxt-ad-sidebar-wrap {
            margin-top: 16px;
          }

          .dxt-ad-bottom-wrap {
            margin-top: 22px;
            margin-bottom: 12px;
          }

          .dxt-sponsored-related-wrap {
            margin-top: 22px;
            margin-bottom: 18px;
          }

          section,
          div,
          p,
          h1,
          h2,
          h3,
          a,
          span {
            max-width: 100%;
          }
        }
      `}</style>

      <FullWidthSection style={{ background: '#0b7f4b', marginBottom: 30 }}>
        <PageContainer>
          <h1
            style={{
              margin: 0,
              padding: '18px 0',
              textAlign: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 36,
              lineHeight: 1.25,
            }}
          >
            {fieldMap.top_bar_title || post?.title || '-'}
          </h1>
        </PageContainer>
      </FullWidthSection>

      <PageContainer>
        <div className="dxt-ad-top-wrap">
          <StorefrontAdBlock
            slotKey="storefront_top"
            monetizationSettings={monetizationSettings}
            websiteId={resolvedWebsiteId}
            affiliateUserId={resolvedAffiliateUserId}
          />
        </div>
      </PageContainer>

      <PageContainer style={{ marginBottom: 34 }}>
        <div style={cardStyle()}>
          <div className="dxt-hero-grid">
            <div>
              <a
                href={heroPrimaryButton.url || '#'}
                target={heroPrimaryButton.openInNewTab ? '_blank' : '_self'}
                rel={heroPrimaryButton.openInNewTab ? 'noreferrer' : undefined}
                style={{ display: 'block', textDecoration: 'none', minWidth: 0 }}
              >
                <ProductImage
                  src={fieldMap.hero_product_image || post?.featured_image}
                  alt={post?.title || 'Product'}
                  maxWidth="100%"
                />
              </a>

              <ReviewRow text={fieldMap.hero_review_text} />
            </div>

            <div>
              <h2 className="dxt-hero-title">
                {fieldMap.hero_title || post?.title || '-'}
              </h2>

              <div className="dxt-hero-description">
                <p>{fieldMap.hero_intro_paragraph_1 || '-'}</p>
                <p>{fieldMap.hero_intro_paragraph_2 || '-'}</p>
              </div>

              <div className="dxt-hero-cta-group">
                <div className="dxt-hero-cta-line">
                  {fieldMap.hero_small_cta_line || '-'}
                </div>

                <div className="dxt-hero-cta-buttons">
                  <CTAButton button={heroPrimaryButton} />
                  <CTAButton button={heroSecondaryButton} />
                </div>

                <TrustLine items={heroTrustItems} />
                <HeroCircleBadges images={heroCircleImages} />

                <div className="dxt-ad-sidebar-wrap">
                  <StorefrontAdBlock
                    slotKey="storefront_sidebar"
                    monetizationSettings={monetizationSettings}
                    websiteId={resolvedWebsiteId}
                    affiliateUserId={resolvedAffiliateUserId}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      <SectionHeader>{fieldMap.how_this_product_works_title || 'How This Product Works'}</SectionHeader>
      <PageContainer style={{ marginTop: 26, marginBottom: 30 }}>
        <div className="dxt-works-grid">
          <div className="dxt-works-text">
            <p className="dxt-works-paragraph">{fieldMap.how_this_product_works_paragraph_1 || '-'}</p>
            <p className="dxt-works-paragraph">{fieldMap.how_this_product_works_paragraph_2 || '-'}</p>
            <p className="dxt-works-paragraph">{fieldMap.how_this_product_works_paragraph_3 || '-'}</p>
            <CTAButton button={worksButton} />
          </div>

          <div className="dxt-works-image-wrap">
            {fieldMap.how_this_product_works_image ? (
              <img
                src={fieldMap.how_this_product_works_image}
                alt="How it works"
                className="dxt-works-image"
              />
            ) : (
              <ProductImage
                src=""
                alt="How it works"
                maxWidth="100%"
                imgStyle={{ objectFit: 'contain' }}
              />
            )}
          </div>
        </div>
      </PageContainer>

      <SectionHeader>{fieldMap.ingredients_section_title || 'A Thoughtfully Selected Blend'}</SectionHeader>
      <PageContainer style={{ marginTop: 26, marginBottom: 30 }}>
        <div className="dxt-two-col">
          <div>
            <p className="dxt-ingredients-intro">{fieldMap.ingredients_intro || '-'}</p>

            {ingredients.map((item, index) => (
              <div key={index} className="dxt-ingredient-item">
                <div className="dxt-ingredient-title">{item.title || '-'}</div>
                <div className="dxt-ingredient-text">{item.text || '-'}</div>
              </div>
            ))}

            <div className="dxt-ingredient-closing">{fieldMap.ingredients_closing_line || '-'}</div>
            <CTAButton button={ingredientsButton} />
          </div>

          <div>
            <ProductImage
              src={fieldMap.ingredients_image}
              alt="Ingredients"
              maxWidth="100%"
            />
          </div>
        </div>
      </PageContainer>

      <SectionHeader>{fieldMap.benefits_title || 'Benefits Of This Product'}</SectionHeader>
      <PageContainer style={{ marginTop: 26, marginBottom: 30 }}>
        <div style={{ background: '#f3f3f3' }}>
          <p className="dxt-benefits-intro">{fieldMap.benefits_intro || '-'}</p>

          {benefits.map((item, index) => (
            <div key={index} className="dxt-benefit-item">
              <div className="dxt-benefit-title">{item.title || '-'}</div>
              <div className="dxt-benefit-text">{item.text || '-'}</div>
            </div>
          ))}

          <div className="dxt-benefit-closing">{fieldMap.benefits_closing_line || '-'}</div>
        </div>
      </PageContainer>

      <SectionHeader>{fieldMap.feature_row_title || 'See What Users Are Saying'}</SectionHeader>
      <PageContainer style={{ marginTop: 26, marginBottom: 30 }}>
        <div>
          <div className="dxt-hero-cta-line" style={{ marginBottom: 18 }}>
            {fieldMap.hero_small_cta_line || fieldMap.feature_row_cta_line || '-'}
          </div>

          <div className="dxt-hero-cta-buttons" style={{ marginBottom: 16 }}>
            <CTAButton button={heroPrimaryButton} />
            <CTAButton button={heroSecondaryButton} />
          </div>

          <FeatureBullets items={featureBulletItems} />
        </div>
      </PageContainer>

      <SectionHeader>{fieldMap.testimonials_title || 'What Users Are Saying'}</SectionHeader>
      <PageContainer style={{ marginTop: 26, marginBottom: 30 }}>
        <div className="dxt-three-grid">
          {testimonials.map((item, index) => (
            <TestimonialCard key={index} item={item} />
          ))}
        </div>
      </PageContainer>

      <SectionHeader>{fieldMap.pricing_title || 'How Much Does It Cost?'}</SectionHeader>
      <PageContainer style={{ marginTop: 26, marginBottom: 30 }}>
        <div className="dxt-pricing-grid">
          <PricingCard item={pricingCards[0]} />
          <PricingCard item={pricingCards[1]} featured />
          <PricingCard item={pricingCards[2]} />
        </div>
      </PageContainer>

      <FullWidthSection style={{ background: '#8db08e', marginTop: 22, marginBottom: 26 }}>
        <PageContainer style={{ paddingTop: 30, paddingBottom: 30 }}>
          <div
            style={{
              color: '#ffffff',
              textAlign: 'center',
              fontSize: 28,
              lineHeight: 1.25,
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            {fieldMap.guarantee_title || 'Guarantee'}
          </div>

          <div
            style={{
              maxWidth: 980,
              margin: '0 auto',
              color: '#ffffff',
              textAlign: 'center',
            }}
          >
            <TextBlock center style={{ color: '#ffffff' }}>{fieldMap.guarantee_paragraph_1}</TextBlock>
            <TextBlock center style={{ color: '#ffffff' }}>{fieldMap.guarantee_paragraph_2}</TextBlock>
            <TextBlock center style={{ color: '#ffffff', fontWeight: 700 }}>{fieldMap.guarantee_paragraph_3}</TextBlock>
          </div>
        </PageContainer>
      </FullWidthSection>

      <PageContainer style={{ marginBottom: 34 }}>
        <div style={{ textAlign: 'center' }}>
          <ProductImage src={fieldMap.special_offer_image} alt="Special offer" maxWidth={280} />

          <div
            style={{
              fontSize: 42,
              lineHeight: 1.05,
              fontWeight: 800,
              color: '#111827',
              margin: '12px 0 16px',
            }}
          >
            {fieldMap.special_offer_price_text || '-'}
          </div>

          <CTAButton button={specialOfferButton} />
        </div>
      </PageContainer>

      <SectionHeader>{fieldMap.learn_more_title || 'Learn More About This Product'}</SectionHeader>
      <PageContainer style={{ marginTop: 26, marginBottom: 30 }}>
        {learnMoreParagraphs.length ? (
          learnMoreParagraphs.map((item, index) => (
            <TextBlock key={index}>{item}</TextBlock>
          ))
        ) : (
          <TextBlock>-</TextBlock>
        )}
      </PageContainer>

      <SectionHeader>{fieldMap.faq_section_title || 'ProDentim FAQ'}</SectionHeader>
      <PageContainer style={{ marginTop: 26, marginBottom: 30 }}>
        {faqs.map((item, index) => (
          <div key={index} className="dxt-faq-item">
            <h3>{item.question || '-'}</h3>
            <p>{item.answer || '-'}</p>
          </div>
        ))}
      </PageContainer>

      {emailCaptureFooter ? (
        <PageContainer style={{ marginBottom: 30 }}>
          {emailCaptureFooter}
        </PageContainer>
      ) : null}

      <PageContainer>
        <div className="dxt-ad-bottom-wrap">
          <StorefrontAdBlock
            slotKey="storefront_bottom"
            monetizationSettings={monetizationSettings}
            websiteId={resolvedWebsiteId}
            affiliateUserId={resolvedAffiliateUserId}
          />
        </div>
      </PageContainer>

      {sponsoredRelatedPostsSlot ? (
        <PageContainer>
          <div className="dxt-sponsored-related-wrap">
            {sponsoredRelatedPostsSlot}
          </div>
        </PageContainer>
      ) : null}

      <SectionHeader>Related Posts</SectionHeader>
      <PageContainer style={{ marginTop: 26, paddingBottom: 40 }}>
        <div className="dxt-three-grid">
          {relatedPosts.length ? (
            relatedPosts.map((item) => (
              <RelatedCard key={item.id} item={item} websiteSlug={websiteSlug} />
            ))
          ) : (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #d9e3dc',
                padding: 20,
                color: '#64748b',
              }}
            >
              No related posts found.
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}