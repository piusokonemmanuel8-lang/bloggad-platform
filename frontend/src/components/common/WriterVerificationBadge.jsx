import './WriterVerificationBadge.css';

const ALLOWED_TYPES = new Set(['blue', 'purple', 'gold', 'official']);

export default function WriterVerificationBadge({ badge, size = 16, className = '' }) {
  const type = String(badge?.type || '').toLowerCase();
  if (!badge?.visible || !ALLOWED_TYPES.has(type)) return null;

  const label = badge?.label || (type === 'official' ? 'Official Bloggad platform account' : 'Verified account');
  const style = badge?.color ? { '--writer-badge-color': badge.color } : undefined;

  return (
    <span
      aria-label={label}
      className={`writer-verification-badge writer-verification-badge-${type} ${className}`.trim()}
      role="img"
      style={style}
      title={label}
    >
      {type === 'official' ? (
        <svg aria-hidden="true" height={size} viewBox="0 0 24 24" width={size}>
          <path d="M12 2.2 20 5v6.1c0 5.2-3.3 9-8 10.7-4.7-1.7-8-5.5-8-10.7V5l8-2.8Z" />
          <path className="writer-verification-check" d="m8.2 12 2.4 2.4 5.3-5.5" />
        </svg>
      ) : (
        <svg aria-hidden="true" height={size} viewBox="0 0 24 24" width={size}>
          <path d="M12 1.8 14.6 4l3.4-.2.8 3.3 2.8 1.9-1.3 3 1.3 3-2.8 1.9-.8 3.3-3.4-.2-2.6 2.2L9.4 20 6 20.2l-.8-3.3L2.4 15l1.3-3-1.3-3 2.8-1.9L6 3.8l3.4.2L12 1.8Z" />
          <path className="writer-verification-check" d="m7.8 12.1 2.6 2.6 5.8-6" />
        </svg>
      )}
    </span>
  );
}