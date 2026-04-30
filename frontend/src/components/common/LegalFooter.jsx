import { Link } from 'react-router-dom';

const legalLinks = [
  { label: 'Terms and Conditions', to: '/legal/terms-and-conditions' },
  { label: 'Privacy Policy', to: '/legal/privacy-policy' },
  { label: 'Affiliate Disclosure', to: '/legal/affiliate-disclosure' },
  { label: 'BlogPulse Earnings Policy', to: '/legal/blogpulse-earnings-policy' },
  { label: 'Advertiser Policy', to: '/legal/advertiser-policy' },
  { label: 'Product Link Policy', to: '/legal/product-link-policy' },
];

export default function LegalFooter() {
  return (
    <footer className="bloggad-legal-footer">
      <div className="bloggad-legal-footer-shell">
        <div>
          <strong>Bloggad</strong>
          <p>Affiliate marketplace, product discovery, advertising, and BlogPulse Earnings platform.</p>
        </div>

        <nav>
          {legalLinks.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}