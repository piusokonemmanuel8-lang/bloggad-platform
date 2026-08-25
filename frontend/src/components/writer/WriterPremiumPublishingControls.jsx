import { useMemo, useState } from 'react';
import { Crown, Clock3, LockKeyhole } from 'lucide-react';
import { getSimpleWriterPlainText } from './SimpleWriterWorkroom';
import './WriterPremiumPublishingControls.css';

const READ_WORDS_PER_MINUTE = 200;
const READABLE_TYPES = new Set([
  'text',
  'textarea',
  'paragraph',
  'heading',
  'quote',
  'rich_text',
]);

function readableText(field) {
  const type = String(field?.field_type || '').trim().toLowerCase();
  if (!READABLE_TYPES.has(type)) return '';
  return getSimpleWriterPlainText(field?.field_value || '');
}

export function estimateWriterReadSeconds(fields = []) {
  const words = (Array.isArray(fields) ? fields : [])
    .map(readableText)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean).length;

  if (!words) return 0;
  return Math.max(1, Math.ceil((words * 60) / READ_WORDS_PER_MINUTE));
}

export function defaultWriterFreePreviewSeconds(totalSeconds) {
  const total = Math.max(0, Number(totalSeconds || 0));
  if (total <= 1) return 0;

  const target = total >= 600 ? 300 : Math.floor(total / 2);
  return Math.max(1, Math.min(total - 1, target));
}

export function formatWriterReadDuration(seconds) {
  const safe = Math.max(0, Math.round(Number(seconds || 0)));
  if (safe <= 0) return '0 min';
  if (safe < 60) return `${safe} sec`;

  const minutes = Math.floor(safe / 60);
  const remaining = safe % 60;

  if (!remaining) return `${minutes} min`;
  return `${minutes} min ${remaining} sec`;
}

export default function WriterPremiumPublishingControls({
  accessType = 'free',
  canUsePremiumPosts = false,
  capabilityLoaded = true,
  estimatedReadSeconds = 0,
  freePreviewSeconds = 0,
  disabled = false,
  onAccessTypeChange,
  onFreePreviewSecondsChange,
  onUpgrade,
}) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const premium = accessType === 'premium';
  const maxPreview = Math.max(0, Number(estimatedReadSeconds || 0) - 1);

  const safePreview = useMemo(() => {
    if (!premium || maxPreview <= 0) return 0;

    const current = Number(freePreviewSeconds || 0);
    if (current > 0) return Math.min(maxPreview, Math.max(1, current));
    return defaultWriterFreePreviewSeconds(estimatedReadSeconds);
  }, [premium, maxPreview, freePreviewSeconds, estimatedReadSeconds]);

  const sliderStep = maxPreview >= 120 ? 60 : maxPreview >= 30 ? 15 : 1;

  const togglePremium = () => {
    if (disabled) return;

    if (!capabilityLoaded || !canUsePremiumPosts) {
      setShowUpgrade(true);
      return;
    }

    if (premium) {
      onAccessTypeChange?.('free');
      return;
    }

    const initialPreview = defaultWriterFreePreviewSeconds(estimatedReadSeconds);
    onFreePreviewSecondsChange?.(initialPreview);
    onAccessTypeChange?.('premium');
    setShowUpgrade(false);
  };

  return (
    <section className="writer-premium-publishing">
      <div className="writer-premium-publishing-head">
        <div>
          <div className="writer-premium-publishing-kicker">Publishing access</div>
          <h3>Premium Post</h3>
        </div>

        <button
          type="button"
          className={`writer-premium-toggle${premium ? ' active' : ''}`}
          role="switch"
          aria-checked={premium}
          aria-label="Toggle Premium Post"
          disabled={disabled}
          onClick={togglePremium}
        >
          <span />
        </button>
      </div>

      <div className="writer-premium-read-time">
        <Clock3 size={16} />
        <span>Estimated read</span>
        <strong>{formatWriterReadDuration(estimatedReadSeconds)}</strong>
      </div>

      {!canUsePremiumPosts ? (
        <div className="writer-premium-plan-note">
          <LockKeyhole size={16} />
          <span>
            Premium Post stays visible on Free. Upgrade is required before it can be turned on.
          </span>
        </div>
      ) : (
        <div className="writer-premium-plan-note ready">
          <Crown size={16} />
          <span>Your Writer plan includes Premium Post publishing.</span>
        </div>
      )}

      {showUpgrade && !canUsePremiumPosts ? (
        <div className="writer-premium-upgrade">
          <strong>Premium Post requires a paid Writer plan.</strong>
          <span>Your ordinary Free posts are not affected.</span>
          <button type="button" onClick={onUpgrade}>
            View Writer plans
          </button>
        </div>
      ) : null}

      {premium ? (
        <div className="writer-premium-preview">
          <div className="writer-premium-preview-title">
            <span>Free Read</span>
            <strong>{formatWriterReadDuration(safePreview)}</strong>
          </div>

          {maxPreview > 0 ? (
            <>
              <input
                type="range"
                min="1"
                max={maxPreview}
                step={sliderStep}
                value={safePreview}
                disabled={disabled}
                onChange={(event) =>
                  onFreePreviewSecondsChange?.(Number(event.target.value))
                }
              />
              <div className="writer-premium-preview-scale">
                <span>1 sec</span>
                <span>
                  Less than {formatWriterReadDuration(estimatedReadSeconds)}
                </span>
              </div>
              <p>
                Readers can read this amount for free. The remaining content is locked for
                eligible Premium Readers or direct Writer members.
              </p>
            </>
          ) : (
            <p>Add readable post content before configuring the Free Read duration.</p>
          )}
        </div>
      ) : (
        <p className="writer-premium-free-copy">
          This post is Free. Everyone can read the full content.
        </p>
      )}
    </section>
  );
}
