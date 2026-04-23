import { Link } from 'react-router-dom';
import {
  Check,
  ChevronRight,
  Star,
} from 'lucide-react';

function cardStyle(extra = {}) {
  return {
    background: '#ffffff',
    border: '1px solid #d9e3dc',
    borderRadius: 0,
    boxShadow: 'none',
    ...extra,
  };
}

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

function CtaButton({ button, wide = false, className = '' }) {
  return (
    <a
      href={button.url || '#'}
      target={button.openInNewTab ? '_blank' : '_self'}
      rel={button.openInNewTab ? 'noreferrer' : undefined}
      className={`dxt-cta-button ${className}`.trim()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 58,
        padding: '0 24px',
        borderRadius: 999,
        border: '2px solid #facc15',
        background: '#facc15',
        color: '#111827',
        fontWeight: 900,
        fontSize: 15,
        textDecoration: 'none',
        width: wide ? '100%' : 'fit-content',
        boxShadow: '0 8px 18px rgba(250, 204, 21, 0.25)',
        textAlign: 'center',
        lineHeight: 1.2,
      }}
    >
      {button.label}
    </a>
  );
}

function SectionHeader({ children }) {
  return (
    <div
      style={{
        background: '#0b6b3a',
        color: '#ffffff',
        textAlign: 'center',
        fontWeight: 900,
        fontSize: 24,
        lineHeight: 1.2,
        padding: '12px 18px',
        marginBottom: 18,
      }}
    >
      {children}
    </div>
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

function ProductImage({ src, alt, maxWidth = 360 }) {
  if (!src) {
    return (
      <div
        style={{
          width: '100%',
          maxWidth,
          minHeight: 320,
          background: '#f8fafc',
          border: '1px solid #d9e3dc',
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
      }}
    />
  );
}

function HeroBadgeLogoRow({ logos = [] }) {
  const filledLogos = logos.filter(Boolean);
  if (!filledLogos.length) return null;

  return (
    <div
      style={{
        width: '100%',
        marginTop: 16,
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div
        style={{
          minWidth: 'max-content',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 18,
          flexWrap: 'nowrap',
          padding: '2px 2px 10px',
        }}
      >
        {filledLogos.map((src, index) => (
          <div
            key={`${src}-${index}`}
            style={{
              width: 124,
              height: 124,
              borderRadius: '50%',
              border: '2px solid #6b7280',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flex: '0 0 124px',
            }}
          >
            <img
              src={src}
              alt={`Badge logo ${index + 1}`}
              style={{
                width: '78%',
                height: '78%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonialCard({ item }) {
  return (
    <div
      style={{
        ...cardStyle({
          padding: 16,
          textAlign: 'center',
          border: '1px solid #d9e3dc',
        }),
      }}
    >
      {item.image ? (
        <img
          src={item.image}
          alt={item.name || 'Testimonial'}
          style={{
            width: 92,
            height: 92,
            borderRadius: '50%',
            objectFit: 'cover',
            display: 'block',
            margin: '0 auto 12px',
          }}
        />
      ) : (
        <div
          style={{
            width: 92,
            height: 92,
            borderRadius: '50%',
            background: '#f5f5f5',
            border: '1px solid #d9e3dc',
            margin: '0 auto 12px',
          }}
        />
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 4,
          marginBottom: 10,
        }}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <Star key={index} size={16} fill="#facc15" color="#facc15" />
        ))}
      </div>

      <div
        style={{
          fontWeight: 900,
          color: '#111827',
          marginBottom: 10,
          fontSize: 16,
        }}
      >
        {item.name || '-'}
      </div>

      <div
        style={{
          color: '#334155',
          lineHeight: 1.75,
          fontSize: 14,
        }}
      >
        {item.text || '-'}
      </div>
    </div>
  );
}

function PricingCard({ item }) {
  return (
    <div
      style={{
        ...cardStyle({
          padding: 20,
          textAlign: 'center',
          border: '1px solid #d9e3dc',
          background: item.highlight ? '#f7fff9' : '#ffffff',
        }),
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 900,
          color: '#0f172a',
          marginBottom: 6,
        }}
      >
        {item.title || '-'}
      </div>

      <div
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: '#0b6b3a',
          marginBottom: 14,
        }}
      >
        {item.subtitle || '-'}
      </div>

      <ProductImage src={item.image} alt={item.title} maxWidth={220} />

      <div
        style={{
          fontSize: 34,
          fontWeight: 900,
          color: '#111827',
          margin: '12px 0 8px',
        }}
      >
        {item.price || '-'}
      </div>

      <div
        style={{
          color: '#334155',
          fontSize: 14,
          fontWeight: 700,
          marginBottom: 14,
        }}
      >
        {item.totalText || '-'}
      </div>

      <CtaButton button={item.button} wide />

      {item.paymentsImage ? (
        <img
          src={item.paymentsImage}
          alt="Payments"
          style={{
            width: '100%',
            maxWidth: 220,
            display: 'block',
            margin: '14px auto 0',
          }}
        />
      ) : null}
    </div>
  );
}

function RelatedCard({ item, websiteSlug }) {
  return (
    <div style={cardStyle({ overflow: 'hidden', border: '1px solid #d9e3dc' })}>
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
        <div
          style={{
            width: '100%',
            height: 200,
            background: '#f8fafc',
            borderBottom: '1px solid #d9e3dc',
          }}
        />
      )}

      <div style={{ padding: 16 }}>
        <div
          style={{
            fontSize: 18,
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
            lineHeight: 1.7,
            color: '#475569',
            marginBottom: 14,
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
            color: '#0b6b3a',
            fontWeight: 900,
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

function FullWidthSection({ children, innerStyle = {}, sectionStyle = {} }) {
  return (
    <section
      style={{
        width: '100%',
        marginBottom: 22,
        ...sectionStyle,
      }}
    >
      <div
        style={{
          width: 'calc(100% - 24px)',
          margin: '0 12px',
          ...innerStyle,
        }}
      >
        {children}
      </div>
    </section>
  );
}

export default function DxtTemplate({
  post,
  templateFields,
  ctaButtons,
  relatedPosts,
  websiteSlug,
  emailCaptureFooter,
}) {
  const { fieldMap, buttonMap } = useTemplateMap(templateFields, ctaButtons);

  const heroPrimaryButton = getButtonProps(buttonMap, 'hero_primary_cta', 'ORDER NOW');
  const heroSecondaryButton = getButtonProps(buttonMap, 'hero_secondary_cta', 'GET DISCOUNT');
  const worksButton = getButtonProps(buttonMap, 'how_it_works_cta', 'ORDER NOW');
  const ingredientsButton = getButtonProps(buttonMap, 'ingredients_cta', 'CLAIM OFFER');
  const specialOfferButton = getButtonProps(buttonMap, 'special_offer_cta', 'ORDER NOW');

  const heroBadgeLogos = [
    fieldMap.hero_badge_logo_1,
    fieldMap.hero_badge_logo_2,
    fieldMap.hero_badge_logo_3,
    fieldMap.hero_badge_logo_4,
    fieldMap.hero_badge_logo_5,
  ];

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
      totalText: fieldMap.pricing_card_1_total_text,
      paymentsImage: fieldMap.pricing_card_1_payments_image,
      button: getButtonProps(buttonMap, 'pricing_card_1_cta', 'ORDER NOW'),
      highlight: false,
    },
    {
      title: fieldMap.pricing_card_2_package_title,
      subtitle: fieldMap.pricing_card_2_supply_label,
      image: fieldMap.pricing_card_2_image,
      price: fieldMap.pricing_card_2_price_text,
      totalText: fieldMap.pricing_card_2_total_text,
      paymentsImage: fieldMap.pricing_card_2_payments_image,
      button: getButtonProps(buttonMap, 'pricing_card_2_cta', 'ORDER NOW'),
      highlight: true,
    },
    {
      title: fieldMap.pricing_card_3_package_title,
      subtitle: fieldMap.pricing_card_3_supply_label,
      image: fieldMap.pricing_card_3_image,
      price: fieldMap.pricing_card_3_price_text,
      totalText: fieldMap.pricing_card_3_total_text,
      paymentsImage: fieldMap.pricing_card_3_payments_image,
      button: getButtonProps(buttonMap, 'pricing_card_3_cta', 'ORDER NOW'),
      highlight: false,
    },
  ];

  const faqs = Array.from({ length: 10 }, (_, index) => ({
    question: fieldMap[`faq_${index + 1}_question`],
    answer: fieldMap[`faq_${index + 1}_answer`],
  }));

  const learnMoreParagraphs = Array.from({ length: 8 }, (_, index) => fieldMap[`learn_more_paragraph_${index + 1}`]);

  const ingredients = Array.from({ length: 5 }, (_, index) => ({
    title: fieldMap[`ingredient_${index + 1}_title`],
    text: fieldMap[`ingredient_${index + 1}_text`],
  }));

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#eef5ef',
      }}
    >
      <style>{`
        .dxt-page {
          width: 100%;
        }

        .dxt-top-bar {
          width: 100%;
          background: #0b7f4b;
          color: #ffffff;
          padding: 14px 18px;
          text-align: center;
          font-weight: 900;
          font-size: clamp(18px, 1.8vw, 28px);
          line-height: 1.25;
        }

        .dxt-hero-grid {
          display: grid;
          grid-template-columns: 40% 60%;
          gap: 40px;
          align-items: start;
        }

        .dxt-two-col {
          display: grid;
          grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
          gap: 34px;
          align-items: start;
        }

        .dxt-hero-grid > *,
        .dxt-two-col > * {
          min-width: 0;
        }

        .dxt-three-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .dxt-faq-grid {
          display: grid;
          gap: 14px;
        }

        .dxt-hero-copy {
          width: 100%;
          min-width: 0;
          max-width: none;
          padding-top: 8px;
        }

        .dxt-hero-copy-top {
          display: block;
        }

        .dxt-hero-title {
          display: block;
          width: 100%;
          min-width: 0;
          max-width: none;
          overflow-wrap: break-word;
          word-break: break-word;
        }

        .dxt-hero-text-wrap {
          width: 100%;
          min-width: 0;
          max-width: none;
        }

        .dxt-hero-paragraph {
          font-size: 20px;
          line-height: 1.7;
          color: #111827;
          font-weight: 500;
        }

        .dxt-hero-cta-wrap {
          width: 100%;
          display: grid;
          gap: 16px;
          margin-top: 22px;
        }

        .dxt-hero-cta-buttons {
          width: 100%;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(240px, 0.58fr);
          gap: 16px;
          align-items: stretch;
        }

        .dxt-hero-trust-row {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          align-items: start;
        }

        .dxt-hero-trust-item {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          color: #111827;
          font-weight: 700;
          font-size: 15px;
          line-height: 1.6;
        }

        .dxt-hero-trust-item span {
          overflow-wrap: break-word;
          word-break: break-word;
        }

        .dxt-cta-button {
          transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
          will-change: transform;
        }

        .dxt-cta-button:hover {
          transform: scale(1.04);
          box-shadow: 0 14px 28px rgba(250, 204, 21, 0.35);
          filter: brightness(1.02);
        }

        @media (max-width: 980px) {
          .dxt-hero-grid,
          .dxt-two-col,
          .dxt-three-grid,
          .dxt-hero-cta-buttons,
          .dxt-hero-trust-row {
            grid-template-columns: 1fr;
          }

          .dxt-top-bar {
            font-size: 20px;
            padding: 12px 14px;
          }

          .dxt-hero-paragraph {
            font-size: 18px;
            line-height: 1.7;
            font-weight: 500;
          }

          .dxt-hero-copy {
            padding-top: 0;
          }
        }
      `}</style>

      <div className="dxt-page">
        <div className="dxt-top-bar">
          {fieldMap.top_bar_title || post?.title || 'Post'}
        </div>

        <FullWidthSection sectionStyle={{ marginBottom: 0 }}>
          <div
            style={{
              ...cardStyle({
                padding: '26px 20px 22px',
                borderTop: '0',
                borderLeft: '0',
                borderRight: '0',
                background: '#f3f6f3',
              }),
            }}
          >
            <div className="dxt-hero-grid">
              <div>
                <ProductImage
                  src={fieldMap.hero_product_image || post?.featured_image}
                  alt={post?.title || 'Product'}
                  maxWidth={680}
                />

                {fieldMap.hero_review_text ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      flexWrap: 'wrap',
                      marginTop: 18,
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star key={index} size={18} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>

                    <div
                      style={{
                        color: '#6b7280',
                        fontWeight: 700,
                        fontSize: 15,
                      }}
                    >
                      {fieldMap.hero_review_text}
                    </div>
                  </div>
                ) : null}

                <HeroBadgeLogoRow logos={heroBadgeLogos} />
              </div>

              <div className="dxt-hero-copy">
                <div className="dxt-hero-copy-top">
                  <div
                    className="dxt-hero-title"
                    style={{
                      fontSize: 'clamp(1.55rem, 2.2vw, 2.35rem)',
                      lineHeight: 1.16,
                      fontWeight: 900,
                      color: '#0b7f4b',
                      marginBottom: 18,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {fieldMap.hero_title || post?.title || 'Post'}
                  </div>

                  <div className="dxt-hero-text-wrap">
                    <TextBlock className="dxt-hero-paragraph" style={{ marginBottom: 22 }}>
                      {fieldMap.hero_intro_paragraph_1}
                    </TextBlock>

                    <TextBlock className="dxt-hero-paragraph" style={{ marginBottom: 0 }}>
                      {fieldMap.hero_intro_paragraph_2}
                    </TextBlock>
                  </div>
                </div>

                <div className="dxt-hero-cta-wrap">
                  <div
                    style={{
                      color: '#0b7f4b',
                      fontWeight: 900,
                      fontSize: 18,
                      lineHeight: 1.45,
                      margin: '4px 0 0',
                      textDecoration: 'underline',
                      textUnderlineOffset: '4px',
                    }}
                  >
                    {fieldMap.hero_small_cta_line || '-'}
                  </div>

                  <div className="dxt-hero-cta-buttons">
                    <CtaButton button={heroPrimaryButton} wide />
                    <CtaButton button={heroSecondaryButton} wide />
                  </div>

                  <div className="dxt-hero-trust-row">
                    {[fieldMap.hero_trust_item_1, fieldMap.hero_trust_item_2, fieldMap.hero_trust_item_3]
                      .filter(Boolean)
                      .map((item, index) => (
                        <div key={index} className="dxt-hero-trust-item">
                          <Check size={18} color="#0b6b3a" />
                          <span>{item}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FullWidthSection>

        <FullWidthSection>
          <SectionHeader>{fieldMap.how_this_product_works_title || 'How This Product Works'}</SectionHeader>

          <div style={cardStyle({ padding: 20 })}>
            <div className="dxt-two-col">
              <div>
                <TextBlock>{fieldMap.how_this_product_works_paragraph_1}</TextBlock>
                <TextBlock>{fieldMap.how_this_product_works_paragraph_2}</TextBlock>
                <TextBlock>{fieldMap.how_this_product_works_paragraph_3}</TextBlock>
                <CtaButton button={worksButton} />
              </div>

              <div>
                <ProductImage
                  src={fieldMap.how_this_product_works_image}
                  alt="How this product works"
                  maxWidth={420}
                />
              </div>
            </div>
          </div>
        </FullWidthSection>

        <FullWidthSection>
          <SectionHeader>{fieldMap.ingredients_section_title || 'Ingredients'}</SectionHeader>

          <div style={cardStyle({ padding: 20 })}>
            <div className="dxt-two-col">
              <div>
                <TextBlock>{fieldMap.ingredients_intro}</TextBlock>

                <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
                  {ingredients.map((item, index) => (
                    <div key={index}>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: '#111827',
                          marginBottom: 6,
                        }}
                      >
                        {item.title || '-'}
                      </div>
                      <div
                        style={{
                          color: '#334155',
                          fontSize: 15,
                          lineHeight: 1.8,
                        }}
                      >
                        {item.text || '-'}
                      </div>
                    </div>
                  ))}
                </div>

                <TextBlock>{fieldMap.ingredients_closing_line}</TextBlock>
                <CtaButton button={ingredientsButton} />
              </div>

              <div>
                <ProductImage
                  src={fieldMap.ingredients_image}
                  alt="Ingredients"
                  maxWidth={420}
                />
              </div>
            </div>
          </div>
        </FullWidthSection>

        <FullWidthSection>
          <SectionHeader>{fieldMap.benefits_title || 'Benefits'}</SectionHeader>

          <div style={cardStyle({ padding: 20 })}>
            <TextBlock>{fieldMap.benefits_intro}</TextBlock>

            <div style={{ display: 'grid', gap: 12 }}>
              {benefits.map((item, index) => (
                <div
                  key={index}
                  style={{
                    borderBottom: '1px solid #e5efe6',
                    paddingBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: '#111827',
                      marginBottom: 6,
                    }}
                  >
                    {item.title || '-'}
                  </div>
                  <div
                    style={{
                      color: '#334155',
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
                color: '#334155',
                fontSize: 15,
                lineHeight: 1.8,
                fontWeight: 700,
              }}
            >
              {fieldMap.benefits_closing_line || '-'}
            </div>
          </div>
        </FullWidthSection>

        <FullWidthSection>
          <SectionHeader>{fieldMap.testimonials_title || 'What Users Are Saying'}</SectionHeader>

          <div className="dxt-three-grid">
            {testimonials.map((item, index) => (
              <TestimonialCard key={index} item={item} />
            ))}
          </div>
        </FullWidthSection>

        <FullWidthSection>
          <SectionHeader>{fieldMap.pricing_title || 'How Much Does It Cost?'}</SectionHeader>

          <div className="dxt-three-grid">
            {pricingCards.map((item, index) => (
              <PricingCard key={index} item={item} />
            ))}
          </div>
        </FullWidthSection>

        <FullWidthSection>
          <SectionHeader>{fieldMap.faq_section_title || 'Frequently Asked Questions'}</SectionHeader>

          <div style={cardStyle({ padding: 20 })}>
            <div className="dxt-faq-grid">
              {faqs.map((item, index) => (
                <div
                  key={index}
                  style={{
                    borderBottom: '1px solid #e5efe6',
                    paddingBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: '#111827',
                      marginBottom: 6,
                    }}
                  >
                    {item.question || '-'}
                  </div>
                  <div
                    style={{
                      color: '#334155',
                      fontSize: 15,
                      lineHeight: 1.8,
                    }}
                  >
                    {item.answer || '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FullWidthSection>

        <FullWidthSection>
          <div
            style={{
              ...cardStyle({
                padding: 24,
                background: '#8eb295',
                border: '1px solid #7aa784',
                textAlign: 'center',
              }),
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 'none',
                margin: '0 auto',
              }}
            >
              <div
                style={{
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: 28,
                  lineHeight: 1.15,
                  marginBottom: 14,
                }}
              >
                {fieldMap.guarantee_title || 'Guarantee'}
              </div>

              <TextBlock center>{fieldMap.guarantee_paragraph_1}</TextBlock>
              <TextBlock center>{fieldMap.guarantee_paragraph_2}</TextBlock>
              <TextBlock center bold>{fieldMap.guarantee_paragraph_3}</TextBlock>
            </div>
          </div>
        </FullWidthSection>

        <FullWidthSection>
          <div
            style={{
              ...cardStyle({
                padding: 24,
                textAlign: 'center',
              }),
            }}
          >
            <ProductImage
              src={fieldMap.special_offer_image}
              alt="Special offer"
              maxWidth={280}
            />

            <div
              style={{
                color: '#111827',
                fontWeight: 900,
                fontSize: 40,
                lineHeight: 1.05,
                margin: '12px 0 16px',
              }}
            >
              {fieldMap.special_offer_price_text || '-'}
            </div>

            <CtaButton button={specialOfferButton} />
          </div>
        </FullWidthSection>

        <FullWidthSection>
          <SectionHeader>{fieldMap.learn_more_title || 'Learn More'}</SectionHeader>

          <div style={cardStyle({ padding: 20 })}>
            {learnMoreParagraphs.map((item, index) => (
              <TextBlock key={index}>{item}</TextBlock>
            ))}
          </div>
        </FullWidthSection>

        {emailCaptureFooter ? (
          <FullWidthSection sectionStyle={{ marginBottom: 22 }}>
            {emailCaptureFooter}
          </FullWidthSection>
        ) : null}

        <FullWidthSection sectionStyle={{ marginBottom: 0 }}>
          <SectionHeader>Related Posts</SectionHeader>

          <div className="dxt-three-grid">
            {relatedPosts.length ? (
              relatedPosts.map((item) => (
                <RelatedCard key={item.id} item={item} websiteSlug={websiteSlug} />
              ))
            ) : (
              <div style={cardStyle({ padding: 20, color: '#64748b' })}>
                No related posts found.
              </div>
            )}
          </div>
        </FullWidthSection>
      </div>
    </div>
  );
}