import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Star,
  User2,
} from 'lucide-react';

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

export default function NeutralReviewTemplate({
  post,
  templateFields,
  ctaButtons,
  relatedPosts,
  websiteSlug,
  emailCaptureFooter,
  onOpenPopup,
  emailCapture,
  sponsoredRelatedPostsSlot,
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

        {sponsoredRelatedPostsSlot ? (
          <section style={{ margin: '26px 0 22px' }}>
            {sponsoredRelatedPostsSlot}
          </section>
        ) : null}

        {emailCaptureFooter}

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