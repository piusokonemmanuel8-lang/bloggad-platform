import { Link, Navigate, useParams } from 'react-router-dom';
import { legalPages } from './legalPages';

export default function LegalPage() {
  const { slug } = useParams();
  const page = legalPages[slug];

  if (!page) {
    return <Navigate to="/" replace />;
  }

  const paragraphs = String(page.content || '')
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="legal-page">
      <style>{`
        .legal-page {
          min-height: 100vh;
          background: #f8fafc;
          color: #0f172a;
          padding: 34px 16px 60px;
        }

        .legal-shell {
          width: min(980px, 100%);
          margin: 0 auto;
        }

        .legal-back-link {
          display: inline-flex;
          align-items: center;
          margin-bottom: 18px;
          color: #f97316;
          font-weight: 900;
          text-decoration: none;
        }

        .legal-card {
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 26px;
          padding: 34px;
          box-shadow: 0 22px 60px rgba(15, 23, 42, 0.08);
        }

        .legal-kicker {
          margin: 0 0 8px;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #f97316;
        }

        .legal-title {
          margin: 0;
          font-size: clamp(30px, 5vw, 48px);
          line-height: 1.05;
          letter-spacing: -0.04em;
          color: #0f172a;
        }

        .legal-updated {
          margin: 12px 0 28px;
          color: #64748b;
          font-size: 14px;
          font-weight: 800;
        }

        .legal-content {
          display: grid;
          gap: 13px;
        }

        .legal-content p {
          margin: 0;
          color: #334155;
          font-size: 15px;
          line-height: 1.85;
        }

        .legal-content p.section-heading {
          margin-top: 14px;
          color: #0f172a;
          font-size: 18px;
          font-weight: 950;
          line-height: 1.35;
        }

        @media (max-width: 640px) {
          .legal-card {
            padding: 22px;
            border-radius: 20px;
          }
        }
      `}</style>

      <main className="legal-shell">
        <Link to="/" className="legal-back-link">
          ← Back to Bloggad
        </Link>

        <article className="legal-card">
          <p className="legal-kicker">Bloggad Legal</p>
          <h1 className="legal-title">{page.title}</h1>
          <p className="legal-updated">Last updated: {page.lastUpdated}</p>

          <div className="legal-content">
            {paragraphs.map((line, index) => {
              const isHeading = /^\d+\./.test(line);

              return (
                <p key={`${line}-${index}`} className={isHeading ? 'section-heading' : ''}>
                  {line}
                </p>
              );
            })}
          </div>
        </article>
      </main>
    </div>
  );
}