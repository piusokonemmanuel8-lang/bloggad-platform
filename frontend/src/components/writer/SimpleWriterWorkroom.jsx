import { useMemo, useState } from 'react';

const BLOCK_OPTIONS = [
  { type: 'paragraph', label: 'Paragraph' },
  { type: 'heading', label: 'Heading' },
  { type: 'image', label: 'Image' },
  { type: 'quote', label: 'Quote' },
  { type: 'link', label: 'Link' },
  { type: 'video', label: 'Video' },
  { type: 'divider', label: 'Divider' },
];

function makeKey(type) {
  return `simple_writer_${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function parseLinkValue(value) {
  try {
    const parsed = JSON.parse(String(value || ''));
    return {
      label: String(parsed?.label || ''),
      url: String(parsed?.url || ''),
    };
  } catch (error) {
    const fallback = String(value || '');
    return { label: fallback, url: fallback };
  }
}

function encodeLinkValue(value) {
  return JSON.stringify({
    label: String(value?.label || '').trim(),
    url: String(value?.url || '').trim(),
  });
}

function isVideoBlock(block) {
  return String(block?.field_key || '')
    .toLowerCase()
    .startsWith('simple_writer_video_');
}

function resolveVideoUrl(value) {
  const raw = String(value || '').trim();
  if (!/^https?:\/\//i.test(raw)) return null;

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0] || '';
      if (/^[A-Za-z0-9_-]{6,}$/.test(id)) {
        return {
          kind: 'embed',
          provider: 'YouTube',
          src: `https://www.youtube-nocookie.com/embed/${id}`,
        };
      }
    }

    if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'youtube-nocookie.com'
    ) {
      let id = '';

      if (url.pathname === '/watch') {
        id = url.searchParams.get('v') || '';
      } else {
        const parts = url.pathname.split('/').filter(Boolean);
        if (['shorts', 'embed'].includes(parts[0])) {
          id = parts[1] || '';
        }
      }

      if (/^[A-Za-z0-9_-]{6,}$/.test(id)) {
        return {
          kind: 'embed',
          provider: 'YouTube',
          src: `https://www.youtube-nocookie.com/embed/${id}`,
        };
      }
    }

    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const parts = url.pathname.split('/').filter(Boolean);
      const id = [...parts].reverse().find((part) => /^\d+$/.test(part)) || '';

      if (id) {
        return {
          kind: 'embed',
          provider: 'Vimeo',
          src: `https://player.vimeo.com/video/${id}`,
        };
      }
    }

    if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) {
      return {
        kind: 'file',
        provider: 'Direct video',
        src: url.href,
      };
    }
  } catch (error) {}

  return null;
}

function makeBlock(type) {
  const fieldType =
    type === 'paragraph'
      ? 'textarea'
      : type === 'heading'
      ? 'heading'
      : type === 'quote'
      ? 'quote'
      : type === 'image'
      ? 'image'
      : type === 'link' || type === 'video'
      ? 'url'
      : 'divider';

  return {
    field_key: makeKey(type),
    field_type: fieldType,
    field_value: ['link', 'video'].includes(type)
      ? encodeLinkValue({ label: '', url: '' })
      : '',
    sort_order: 0,
    meta: {
      label:
        type === 'paragraph'
          ? 'Paragraph'
          : type === 'heading'
          ? 'Heading'
          : type === 'quote'
          ? 'Quote'
          : type === 'image'
          ? 'Inline image'
          : type === 'link'
          ? 'Link'
          : type === 'video'
          ? 'Video'
          : 'Divider',
      section: 'Simple Writer',
      helper_text:
        type === 'image'
          ? 'Upload an image exactly where you want it to appear in the article.'
          : type === 'link'
          ? 'Add a link label and a valid http or https destination.'
          : type === 'video'
          ? 'Paste a YouTube, Vimeo, MP4, WebM, or OGG video URL.'
          : type === 'divider'
          ? 'A visual divider between sections.'
          : 'Write freely. This block has no template word limit.',
      required: !['image', 'divider'].includes(type),
      word_rule: null,
      placeholder:
        type === 'paragraph'
          ? 'Write your paragraph...'
          : type === 'heading'
          ? 'Section heading'
          : type === 'quote'
          ? 'Quote or highlighted passage'
          : '',
      locked: false,
      simple_writer: true,
    },
  };
}

export function buildInitialSimpleWriterBlocks() {
  return [makeBlock('paragraph')];
}

export default function SimpleWriterWorkroom({
  blocks = [],
  onChange,
  uploadImage,
  disabled = false,
}) {
  const [uploadingKey, setUploadingKey] = useState('');

  const orderedBlocks = useMemo(
    () => (Array.isArray(blocks) ? blocks : []).map((block, index) => ({ ...block, sort_order: index + 1 })),
    [blocks]
  );

  const commit = (next) => {
    if (disabled) return;
    onChange(next.map((block, index) => ({ ...block, sort_order: index + 1 })));
  };

  const addBlock = (type) => {
    commit([...orderedBlocks, makeBlock(type)]);
  };

  const updateBlock = (index, value) => {
    const next = [...orderedBlocks];
    next[index] = { ...next[index], field_value: value };
    commit(next);
  };

  const removeBlock = (index) => {
    const next = orderedBlocks.filter((_, itemIndex) => itemIndex !== index);
    commit(next.length ? next : buildInitialSimpleWriterBlocks());
  };

  const moveBlock = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= orderedBlocks.length) return;

    const next = [...orderedBlocks];
    const current = next[index];
    next[index] = next[target];
    next[target] = current;
    commit(next);
  };

  const handleImageUpload = async (index, event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !uploadImage) return;

    const block = orderedBlocks[index];
    setUploadingKey(block.field_key);

    try {
      const url = await uploadImage(file);
      updateBlock(index, url);
    } finally {
      setUploadingKey('');
    }
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          padding: 12,
          border: '1px solid #dbe3ef',
          borderRadius: 14,
          background: '#f8fafc',
        }}
      >
        {BLOCK_OPTIONS.map((option) => (
          <button
            key={option.type}
            type="button"
            disabled={disabled}
            onClick={() => addBlock(option.type)}
            style={{
              minHeight: 38,
              padding: '0 13px',
              borderRadius: 10,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontWeight: 700,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            + {option.label}
          </button>
        ))}
      </div>

      {orderedBlocks.map((block, index) => {
        const type = String(block.field_type || '').toLowerCase();
        const videoBlock = type === 'url' && isVideoBlock(block);
        const storedUrlValue = type === 'url' ? parseLinkValue(block.field_value) : null;
        const resolvedVideo = videoBlock ? resolveVideoUrl(storedUrlValue?.url) : null;

        return (
          <div
            key={block.field_key || index}
            style={{
              padding: 16,
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              background: '#ffffff',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 12,
              }}
            >
              <strong style={{ textTransform: 'capitalize' }}>
                {type === 'textarea'
                  ? 'Paragraph'
                  : videoBlock
                  ? 'Video'
                  : type === 'url'
                  ? 'Link'
                  : type}
              </strong>

              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" disabled={disabled || index === 0} onClick={() => moveBlock(index, -1)}>
                  Up
                </button>
                <button
                  type="button"
                  disabled={disabled || index === orderedBlocks.length - 1}
                  onClick={() => moveBlock(index, 1)}
                >
                  Down
                </button>
                <button type="button" disabled={disabled} onClick={() => removeBlock(index)}>
                  Remove
                </button>
              </div>
            </div>

            {type === 'divider' ? (
              <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: 8, color: '#64748b' }}>
                Divider
              </div>
            ) : type === 'image' ? (
              <div style={{ display: 'grid', gap: 10 }}>
                <input
                  type="text"
                  value={block.field_value || ''}
                  placeholder="Paste image URL or upload below"
                  onChange={(event) => updateBlock(index, event.target.value)}
                  disabled={disabled}
                />
                <input
                  type="file"
                  accept="image/*"
                  disabled={disabled || uploadingKey === block.field_key}
                  onChange={(event) => handleImageUpload(index, event)}
                />
                {uploadingKey === block.field_key ? <span>Uploading image...</span> : null}
                {block.field_value ? (
                  <img
                    src={block.field_value}
                    alt="Inline article"
                    style={{ width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: 12 }}
                  />
                ) : null}
              </div>
            ) : type === 'url' ? (
              videoBlock ? (
                <div style={{ display: 'grid', gap: 10 }}>
                  <input
                    type="url"
                    value={storedUrlValue?.url || ''}
                    placeholder="https://www.youtube.com/watch?v=..."
                    onChange={(event) =>
                      updateBlock(
                        index,
                        encodeLinkValue({ label: '', url: event.target.value })
                      )
                    }
                    disabled={disabled}
                    style={{ width: '100%' }}
                  />
                  <span style={{ color: '#64748b', fontSize: 12, lineHeight: 1.5 }}>
                    Supports YouTube, Vimeo, MP4, WebM and OGG URLs.
                  </span>

                  {storedUrlValue?.url && !resolvedVideo ? (
                    <div
                      role="alert"
                      style={{
                        border: '1px solid #fecaca',
                        borderRadius: 10,
                        background: '#fff7f7',
                        color: '#991b1b',
                        padding: '10px 12px',
                        fontSize: 12,
                      }}
                    >
                      Paste a valid YouTube, Vimeo, MP4, WebM, or OGG video URL.
                    </div>
                  ) : null}

                  {resolvedVideo?.kind === 'embed' ? (
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '16 / 9',
                        overflow: 'hidden',
                        borderRadius: 12,
                        background: '#0f172a',
                      }}
                    >
                      <iframe
                        src={resolvedVideo.src}
                        title={`${resolvedVideo.provider} video preview`}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                        style={{ width: '100%', height: '100%', border: 0 }}
                      />
                    </div>
                  ) : resolvedVideo?.kind === 'file' ? (
                    <video
                      src={resolvedVideo.src}
                      controls
                      preload="metadata"
                      style={{ width: '100%', maxHeight: 460, borderRadius: 12, background: '#0f172a' }}
                    />
                  ) : null}
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  <input
                    type="text"
                    value={parseLinkValue(block.field_value).label}
                    placeholder="Link label"
                    onChange={(event) => {
                      const current = parseLinkValue(block.field_value);
                      updateBlock(
                        index,
                        encodeLinkValue({ ...current, label: event.target.value })
                      );
                    }}
                    disabled={disabled}
                    style={{ width: '100%' }}
                  />
                  <input
                    type="url"
                    value={parseLinkValue(block.field_value).url}
                    placeholder="https://example.com"
                    onChange={(event) => {
                      const current = parseLinkValue(block.field_value);
                      updateBlock(
                        index,
                        encodeLinkValue({ ...current, url: event.target.value })
                      );
                    }}
                    disabled={disabled}
                    style={{ width: '100%' }}
                  />
                </div>
              )
            ) : type === 'heading' ? (
              <input
                type="text"
                value={block.field_value || ''}
                placeholder="Section heading"
                onChange={(event) => updateBlock(index, event.target.value)}
                disabled={disabled}
                style={{ width: '100%' }}
              />
            ) : (
              <textarea
                rows={type === 'quote' ? 4 : 8}
                value={block.field_value || ''}
                placeholder={type === 'quote' ? 'Quote or highlighted passage' : 'Write your paragraph...'}
                onChange={(event) => updateBlock(index, event.target.value)}
                disabled={disabled}
                style={{ width: '100%', resize: 'vertical' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
