import { useMemo, useRef, useState } from 'react';

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


const RICH_TEXT_TYPE = 'bloggad_rich_text_v1';
const DEFAULT_INLINE_LINK_COLOR = '#2563eb';

function normalizeInlineLinkColor(value) {
  const color = String(value || '').trim();
  return /^#[0-9a-f]{6}$/i.test(color)
    ? color.toLowerCase()
    : DEFAULT_INLINE_LINK_COLOR;
}

function isHttpUrl(value) {
  try {
    const parsed = new URL(String(value || '').trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

export function parseSimpleWriterRichText(value) {
  const raw = String(value || '');

  if (!raw.trim().startsWith('{')) {
    return {
      rich: false,
      text: raw,
      links: [],
    };
  }

  try {
    const parsed = JSON.parse(raw);

    if (
      parsed?.type !== RICH_TEXT_TYPE ||
      typeof parsed?.text !== 'string' ||
      !Array.isArray(parsed?.links)
    ) {
      return {
        rich: false,
        text: raw,
        links: [],
      };
    }

    const text = parsed.text;
    const links = parsed.links
      .map((link) => ({
        start: Number(link?.start),
        end: Number(link?.end),
        url: String(link?.url || '').trim(),
        color: normalizeInlineLinkColor(link?.color),
      }))
      .filter(
        (link) =>
          Number.isInteger(link.start) &&
          Number.isInteger(link.end) &&
          link.start >= 0 &&
          link.end > link.start &&
          link.end <= text.length &&
          isHttpUrl(link.url)
      )
      .sort((a, b) => a.start - b.start || a.end - b.end);

    return {
      rich: true,
      text,
      links,
    };
  } catch (error) {
    return {
      rich: false,
      text: raw,
      links: [],
    };
  }
}

export function getSimpleWriterPlainText(value) {
  return parseSimpleWriterRichText(value).text;
}

function encodeSimpleWriterRichText(text, links = []) {
  const cleanText = String(text || '');
  const cleanLinks = links
    .map((link) => ({
      start: Number(link.start),
      end: Number(link.end),
      url: String(link.url || '').trim(),
      color: normalizeInlineLinkColor(link.color),
    }))
    .filter(
      (link) =>
        Number.isInteger(link.start) &&
        Number.isInteger(link.end) &&
        link.start >= 0 &&
        link.end > link.start &&
        link.end <= cleanText.length &&
        isHttpUrl(link.url)
    )
    .sort((a, b) => a.start - b.start || a.end - b.end);

  if (!cleanLinks.length) {
    return cleanText;
  }

  return JSON.stringify({
    type: RICH_TEXT_TYPE,
    text: cleanText,
    links: cleanLinks,
  });
}

function adjustInlineLinksAfterTextEdit(oldText, newText, links) {
  if (oldText === newText) return links;

  let prefix = 0;
  const prefixLimit = Math.min(oldText.length, newText.length);

  while (
    prefix < prefixLimit &&
    oldText.charAt(prefix) === newText.charAt(prefix)
  ) {
    prefix += 1;
  }

  let suffix = 0;

  while (
    suffix < oldText.length - prefix &&
    suffix < newText.length - prefix &&
    oldText.charAt(oldText.length - 1 - suffix) ===
      newText.charAt(newText.length - 1 - suffix)
  ) {
    suffix += 1;
  }

  const oldChangeEnd = oldText.length - suffix;
  const newChangeEnd = newText.length - suffix;
  const delta = newChangeEnd - oldChangeEnd;

  return links
    .map((link) => {
      if (link.end <= prefix) {
        return link;
      }

      if (link.start >= oldChangeEnd) {
        return {
          ...link,
          start: link.start + delta,
          end: link.end + delta,
        };
      }

      return null;
    })
    .filter(Boolean);
}

function RichParagraphEditor({ block, disabled, onChange }) {
  const textareaRef = useRef(null);
  const parsed = useMemo(
    () => parseSimpleWriterRichText(block?.field_value),
    [block?.field_value]
  );

  const [selection, setSelection] = useState({
    start: 0,
    end: 0,
  });
  const [linkDraft, setLinkDraft] = useState(null);
  const [linkError, setLinkError] = useState('');

  const selectedText =
    selection.end > selection.start
      ? parsed.text.slice(selection.start, selection.end)
      : '';

  const updateSelection = (event) => {
    setSelection({
      start: Number(event.currentTarget.selectionStart || 0),
      end: Number(event.currentTarget.selectionEnd || 0),
    });
  };

  const handleTextChange = (event) => {
    const nextText = event.target.value;
    const nextLinks = adjustInlineLinksAfterTextEdit(
      parsed.text,
      nextText,
      parsed.links
    );

    onChange(encodeSimpleWriterRichText(nextText, nextLinks));

    setSelection({
      start: Number(event.target.selectionStart || 0),
      end: Number(event.target.selectionEnd || 0),
    });
  };

  const beginInlineLink = () => {
    if (!selectedText) {
      setLinkError('Select the words you want to link first.');
      return;
    }

    setLinkError('');
    setLinkDraft({
      start: selection.start,
      end: selection.end,
      text: selectedText,
      url: '',
      color: DEFAULT_INLINE_LINK_COLOR,
    });
  };

  const applyInlineLink = () => {
    if (!linkDraft) return;

    if (!isHttpUrl(linkDraft.url)) {
      setLinkError('Enter a valid http or https URL.');
      return;
    }

    const nextLink = {
      start: linkDraft.start,
      end: linkDraft.end,
      url: String(linkDraft.url || '').trim(),
      color: normalizeInlineLinkColor(linkDraft.color),
    };

    const withoutOverlap = parsed.links.filter(
      (link) =>
        link.end <= nextLink.start ||
        link.start >= nextLink.end
    );

    onChange(
      encodeSimpleWriterRichText(
        parsed.text,
        [...withoutOverlap, nextLink]
      )
    );

    setLinkDraft(null);
    setLinkError('');
  };

  const removeInlineLink = (removeIndex) => {
    const nextLinks = parsed.links.filter(
      (_, index) => index !== removeIndex
    );

    onChange(
      encodeSimpleWriterRichText(parsed.text, nextLinks)
    );
  };

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <textarea
        ref={textareaRef}
        rows={8}
        value={parsed.text}
        placeholder="Write your paragraph..."
        onChange={handleTextChange}
        onSelect={updateSelection}
        onKeyUp={updateSelection}
        onMouseUp={updateSelection}
        disabled={disabled}
        style={{ width: '100%', resize: 'vertical' }}
      />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <button
          type="button"
          disabled={disabled || !selectedText}
          onMouseDown={(event) => event.preventDefault()}
          onClick={beginInlineLink}
        >
          Link selected text
        </button>

        <span
          style={{
            color: '#64748b',
            fontSize: 12,
          }}
        >
          {selectedText
            ? `Selected: ${selectedText}`
            : 'Highlight words in the paragraph first.'}
        </span>
      </div>

      {linkDraft ? (
        <div
          style={{
            display: 'grid',
            gap: 10,
            padding: 12,
            border: '1px solid #cbd5e1',
            borderRadius: 12,
            background: '#f8fafc',
          }}
        >
          <strong style={{ fontSize: 13 }}>
            Link "{linkDraft.text}"
          </strong>

          <input
            type="url"
            value={linkDraft.url}
            placeholder="https://example.com"
            onChange={(event) =>
              setLinkDraft((current) => ({
                ...current,
                url: event.target.value,
              }))
            }
            disabled={disabled}
          />

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Text color
            <input
              type="color"
              value={linkDraft.color}
              onChange={(event) =>
                setLinkDraft((current) => ({
                  ...current,
                  color: event.target.value,
                }))
              }
              disabled={disabled}
              aria-label="Linked text color"
            />
            <span style={{ color: linkDraft.color }}>
              {linkDraft.text}
            </span>
          </label>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              disabled={disabled}
              onClick={applyInlineLink}
            >
              Apply link
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setLinkDraft(null);
                setLinkError('');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {linkError ? (
        <div
          role="alert"
          style={{
            color: '#991b1b',
            fontSize: 12,
          }}
        >
          {linkError}
        </div>
      ) : null}

      {parsed.links.length ? (
        <div style={{ display: 'grid', gap: 8 }}>
          {parsed.links.map((link, index) => (
            <div
              key={`${link.start}-${link.end}-${index}`}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
              }}
            >
              <strong
                style={{
                  color: link.color,
                  fontSize: 13,
                }}
              >
                {parsed.text.slice(link.start, link.end)}
              </strong>
              <span
                style={{
                  color: '#64748b',
                  fontSize: 12,
                  overflowWrap: 'anywhere',
                }}
              >
                {link.url}
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeInlineLink(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
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
            ) : type === 'quote' ? (
              <textarea
                rows={4}
                value={block.field_value || ''}
                placeholder="Quote or highlighted passage"
                onChange={(event) => updateBlock(index, event.target.value)}
                disabled={disabled}
                style={{ width: '100%', resize: 'vertical' }}
              />
            ) : (
              <RichParagraphEditor
                block={block}
                disabled={disabled}
                onChange={(value) => updateBlock(index, value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
