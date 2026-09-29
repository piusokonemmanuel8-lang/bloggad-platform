import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import './PublicSalesLandingPage.css';

function readJson(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return {}; }
}
function youtubeEmbed(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const match = raw.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0&playsinline=1&fs=0&disablekb=1` : '';
}

export default function PublicSalesLandingPage() {
  const { landingSlug } = useParams();
  const [page, setPage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get(`/api/writer/sales-landing/public/${encodeURIComponent(landingSlug || '')}`, { skipGlobalLoader: true })
      .then(({ data }) => { if (active) setPage(data?.page || null); })
      .catch((err) => { if (active) setError(err?.response?.data?.message || 'Landing page not found.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [landingSlug]);

  const content = useMemo(() => readJson(page?.content_json), [page]);
  const video = youtubeEmbed(content.video_url);

  useEffect(() => {
    if (!page) return;
    document.title = page.seo_title || page.title || 'Sales Landing Page';
    const description = page.seo_description || content.subheadline || '';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
  }, [page, content.subheadline]);

  if (loading) return <main className="public-sales-landing state">Loading...</main>;
  if (error || !page) return <main className="public-sales-landing state"><h1>Page unavailable</h1><p>{error}</p></main>;

  return (
    <main className="public-sales-landing">
      {content.urgency_text ? <div className="public-sales-urgency">{content.urgency_text}</div> : null}
      <section className="public-sales-hero">
        <div className="public-sales-copy">
          {content.badge_text ? <div className="public-sales-badge">{content.badge_text}</div> : null}
          <h1>
            {content.headline || page.title}
            {content.highlight_text ? <span className="public-sales-highlight">{content.highlight_text}</span> : null}
          </h1>
          {content.subheadline ? <p className="public-sales-subheadline">{content.subheadline}</p> : null}
          {content.cta_text && content.cta_url ? (
            <a className="public-sales-cta" href={content.cta_url}>{content.cta_text}</a>
          ) : null}
        </div>
        {content.image_url ? <img className="public-sales-image" src={content.image_url} alt="" loading="lazy" decoding="async" /> : null}
      </section>
      {video ? (
        <section className="public-sales-video"><iframe src={video} title={page.title} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></section>
      ) : content.video_url ? (
        <section className="public-sales-video-link"><a href={content.video_url}>Watch video</a></section>
      ) : null}
      {content.body ? <section className="public-sales-body">{content.body.split('\n').map((line, index) => <p key={index}>{line}</p>)}</section> : null}
      {(Array.isArray(content.vxl_sections) ? content.vxl_sections : []).filter((section) => section?.enabled !== false).map((section, index) => (
        <section className={`vxl-dynamic-section vxl-section-${section.type || 'text'}`} key={section.id || index} style={{ color: section.text_color || '#ffffff', paddingTop: `${section.padding_top ?? 48}px`, paddingBottom: `${section.padding_bottom ?? 48}px`, paddingLeft: `${section.padding_left ?? 0}px`, paddingRight: `${section.padding_right ?? 0}px` }}>
          {section.type === 'testimonials' ? (
            <div className="vxl-testimonial-grid" style={{ '--review-columns': Math.min(4, Math.max(2, Number(section.review_columns) || 4)) }}>
              {(section.testimonials || []).map((review, reviewIndex) => (
                <article className="vxl-testimonial" key={reviewIndex}>
                  {review.photo_url ? <img src={review.photo_url} alt="" loading="lazy" decoding="async" /> : null}
                  {review.name ? <strong>{review.name}</strong> : null}
                  {review.review ? <p>{review.review}</p> : null}{review.video_url ? (youtubeEmbed(review.video_url) ? <div className="vxl-review-video"><iframe src={youtubeEmbed(review.video_url)} title={`${review.name || 'Reviewer'} video`} loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div> : <video className="vxl-review-video-file" src={review.video_url} controls playsInline preload="none" />) : null}
                </article>
              ))}
            </div>
          ) : section.type === 'footer' ? (
            <footer>{section.title ? <h2>{section.title}</h2> : null}<p>{section.footer_text}</p></footer>
          ) : (
            <div className={section.type === 'two-column' || section.type === 'text-image' ? 'vxl-columns' : ''}>
              <div>
                {section.title ? <h2>{section.title}</h2> : null}
                {section.text ? <p>{section.text}</p> : null}
                {section.image_url && section.type === 'image' ? <img src={section.image_url} alt="" loading="lazy" decoding="async" /> : null}
              </div>
              {(section.type === 'two-column' || section.type === 'text-image') && section.image_url ? <div><img src={section.image_url} alt="" loading="lazy" decoding="async" />{section.image_url_2 ? <img src={section.image_url_2} alt="" loading="lazy" decoding="async" /> : null}</div> : null}
            </div>
          )}
        </section>
      ))}
      {content.cta_text && content.cta_url ? (
        <section className="public-sales-bottom-cta"><a className="public-sales-cta" href={content.cta_url}>{content.cta_text}</a></section>
      ) : null}
    </main>
  );
}