import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';
import PublicWriterReaderActions from '../../components/writerReader/PublicWriterReaderActions';
import ReaderReadingTools from '../../components/writerReader/ReaderReadingTools';
import PostVideoEmbed from '../../components/writer/PostVideoEmbed';
import './WriterPagePostEditorial.css';

const CONTENT_LABELS = {
  article: 'ARTICLE',
  story: 'STORY',
  tutorial: 'TUTORIAL',
  course_lesson: 'COURSE LESSON',
  review: 'REVIEW',
  news: 'NEWS',
  opinion: 'OPINION',
  product_post: 'PRODUCT POST',
};

function compactNumber(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return '0';
  if (number >= 1000000) return `${(number / 1000000).toFixed(number >= 10000000 ? 0 : 1)}M`;
  if (number >= 1000) return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1)}K`;
  return String(number);
}

function authRedirect(error) {
  if (Number(error?.response?.status || error?.status || 0) === 401) {
    window.location.assign('/reader/login');
    return true;
  }
  return false;
}

function fieldValue(field) {
  if (!field || typeof field !== 'object') return '';
  return (
    field.value ??
    field.field_value ??
    field.content ??
    field.text ??
    field.body ??
    ''
  );
}

function fieldKey(field) {
  return String(
    field?.field_key ??
    field?.key ??
    field?.name ??
    field?.slug ??
    field?.label ??
    ''
  ).trim().toLowerCase();
}

function parseStoredLinkValue(value) {
  const raw = String(value || '').trim();

  if (!raw) {
    return { label: '', url: '' };
  }

  if (raw.startsWith('{')) {
    try {
      const parsed = JSON.parse(raw);

      return {
        label: String(parsed?.label || '').trim(),
        url: String(parsed?.url || '').trim(),
      };
    } catch (error) {}
  }

  return { label: raw, url: raw };
}


const RICH_TEXT_FIELD_TYPE = 'bloggad_rich_text_v1';
const DEFAULT_INLINE_LINK_COLOR = '#2563eb';

function parseStoredRichText(value) {
  const raw = String(value || '').trim();
  if (!raw.startsWith('{')) return null;

  try {
    const parsed = JSON.parse(raw);

    if (
      parsed?.type !== RICH_TEXT_FIELD_TYPE ||
      typeof parsed?.text !== 'string' ||
      !Array.isArray(parsed?.links)
    ) {
      return null;
    }

    const links = parsed.links
      .map((link) => ({
        start: Number(link?.start),
        end: Number(link?.end),
        url: String(link?.url || '').trim(),
        color: /^#[0-9a-f]{6}$/i.test(String(link?.color || '').trim())
          ? String(link.color).trim()
          : DEFAULT_INLINE_LINK_COLOR,
      }))
      .filter(
        (link) =>
          Number.isInteger(link.start) &&
          Number.isInteger(link.end) &&
          link.start >= 0 &&
          link.end > link.start &&
          link.end <= parsed.text.length &&
          /^https?:\/\//i.test(link.url)
      )
      .sort((a, b) => a.start - b.start || a.end - b.end);

    return {
      text: parsed.text,
      links,
    };
  } catch (error) {
    return null;
  }
}

function renderRichTextNodes(richText, keyPrefix) {
  const nodes = [];
  let cursor = 0;

  richText.links.forEach((link, index) => {
    if (link.start < cursor) return;

    if (link.start > cursor) {
      nodes.push(
        richText.text.slice(cursor, link.start)
      );
    }

    nodes.push(
      <a
        key={`${keyPrefix}-link-${index}`}
        href={link.url}
        target="_blank"
        rel="sponsored noopener noreferrer"
        style={{
          color: link.color,
          textDecoration: 'none',
          cursor: 'pointer',
        }}
      >
        {richText.text.slice(link.start, link.end)}
      </a>
    );

    cursor = link.end;
  });

  if (cursor < richText.text.length) {
    nodes.push(richText.text.slice(cursor));
  }

  return nodes;
}
function stripMarkup(value) {
  return String(value || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
}

function isImageValue(key, value) {
  const text = String(value || '').trim();
  if (!/^https?:\/\//i.test(text)) return false;
  return (
    /image|photo|media|banner|cover|illustration/.test(key) ||
    /\.(png|jpe?g|gif|webp|avif)(\?|#|$)/i.test(text)
  );
}

function ArticleField({ field, index }) {
  const key = fieldKey(field);
  const raw = fieldValue(field);

  const isVideoField =
    key.startsWith('simple_writer_video_') ||
    key === 'bloggad_video_url';

  if (isVideoField && String(raw || '').trim()) {
    return (
      <PostVideoEmbed
        url={raw}
        title="Post video"
      />
    );
  }

  const isLinkField = key.startsWith('simple_writer_link_');

  if (isLinkField && String(raw || '').trim()) {
    const link = parseStoredLinkValue(raw);

    if (/^https?:\/\//i.test(link.url)) {
      return (
        <p className="wpp-body-copy">
          <a
            href={link.url}
            target="_blank"
            rel="sponsored noopener noreferrer"
            style={{
              color: '#111827',
              fontWeight: 750,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            {link.label || link.url}
          </a>
        </p>
      );
    }
  }

  const richText = key.startsWith('simple_writer_paragraph_')
    ? parseStoredRichText(raw)
    : null;

  if (richText) {
    if (!richText.text.trim()) return null;

    return (
      <p
        className="wpp-body-copy"
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {renderRichTextNodes(richText, `rich-${index}`)}
      </p>
    );
  }

  const value = stripMarkup(raw);

  if (!value) return null;

  if (
    /title|excerpt|seo|featured|thumbnail|slug|author|date|price|product/.test(key)
  ) {
    return null;
  }

  if (isImageValue(key, raw)) {
    return (
      <figure className="wpp-inline-media">
        <img src={String(raw).trim()} alt="" />
      </figure>
    );
  }

  if (/heading|headline|subtitle|subheading|section_title/.test(key)) {
    return <h2 className="wpp-body-heading">{value}</h2>;
  }

  const paragraphs = value
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  return paragraphs.map((paragraph, paragraphIndex) => (
    <p className="wpp-body-copy" key={`${index}-${paragraphIndex}`}>
      {paragraph}
    </p>
  ));
}

function Avatar({ src, name, className = '' }) {
  if (src) {
    return <img className={`wpp-avatar ${className}`} src={src} alt="" />;
  }

  return (
    <div className={`wpp-avatar wpp-avatar-fallback ${className}`}>
      {String(name || 'W').trim().slice(0, 1).toUpperCase()}
    </div>
  );
}

function CommentThread({ comment, onReply }) {
  const replies = Array.isArray(comment?.replies) ? comment.replies : [];

  return (
    <article className="wpp-comment">
      <Avatar
        src={comment?.author?.avatar_url || ''}
        name={comment?.author?.name || 'Reader'}
        className="wpp-comment-avatar"
      />

      <div className="wpp-comment-body">
        <strong>{comment?.author?.name || 'Reader'}</strong>
        <p>{comment?.body || ''}</p>

        <div className="wpp-comment-meta">
          <button type="button" onClick={() => onReply(comment)}>
            Reply
          </button>
        </div>

        {replies.length ? (
          <div className="wpp-comment-replies">
            {replies.map((reply) => (
              <div className="wpp-comment-reply" key={reply.id}>
                <Avatar
                  src={reply?.author?.avatar_url || ''}
                  name={reply?.author?.name || 'Writer'}
                  className="wpp-comment-reply-avatar"
                />
                <div>
                  <strong>{reply?.author?.name || 'Writer'}</strong>
                  <p>{reply?.body || ''}</p>
                  {reply?.author?.role === 'writer' ? (
                    <span>Writer reply</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function WriterPagePostPage() {
  const { pageSlug, postSlug } = useParams();

  const [data, setData] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [social, setSocial] = useState(null);
  const [readerState, setReaderState] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [commentText, setCommentText] = useState('');
  const [quoteDraft, setQuoteDraft] = useState(null);
  const [legacyOpen, setLegacyOpen] = useState(false);
  const [legacyTarget, setLegacyTarget] = useState('');

  const legacyRef = useRef(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');

    Promise.all([
      api.get(
        `/api/public/writer-pages/${encodeURIComponent(pageSlug || '')}/posts/${encodeURIComponent(postSlug || '')}`
      ),
      api.get(`/api/public/writer-pages/${encodeURIComponent(pageSlug || '')}`),
    ])
      .then(([postResponse, pageResponse]) => {
        if (!active) return;
        setData(postResponse?.data || null);
        setPageData(pageResponse?.data || null);
      })
      .catch((loadError) => {
        if (!active) return;
        setError(
          loadError?.response?.data?.message ||
            loadError?.message ||
            'Failed to load post.'
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [pageSlug, postSlug]);

  const post = data?.post || null;
  const fields = Array.isArray(data?.template_fields)
    ? data.template_fields
    : [];
  const page = data?.page || pageData?.page || null;
  const writer = pageData?.writer || null;
  const storefront = pageData?.storefront || null;

  const writerId = Number(post?.user_id || writer?.user_id || page?.user_id || 0);
  const postId = Number(post?.id || 0);
  const websiteSlug =
    post?.website?.slug ||
    post?.website_slug ||
    storefront?.slug ||
    '';

  useEffect(() => {
    if (!postId) return;

    let active = true;

    Promise.all([
      api.get(`/api/public/social/posts/${postId}`),
      api.get(`/api/reader/social/posts/${postId}`).catch(() => null),
      api.get('/api/customer/saved/posts').catch(() => null),
    ]).then(([publicResponse, readerResponse, savedResponse]) => {
      if (!active) return;

      setSocial(publicResponse?.data || null);
      setReaderState(readerResponse?.data || null);

      const items = Array.isArray(savedResponse?.data?.items)
        ? savedResponse.data.items
        : [];

      setSaved(
        items.some((item) => Number(item?.post?.id || item?.post_id || 0) === postId)
      );
    });

    return () => {
      active = false;
    };
  }, [postId]);

  useEffect(() => {
    if (!legacyOpen || !legacyTarget) return;

    const timer = window.setTimeout(() => {
      const root = legacyRef.current;
      if (!root) return;

      const target = legacyTarget.toLowerCase();
      const buttons = Array.from(root.querySelectorAll('button'));

      const match = buttons.find((button) =>
        String(button.textContent || '').trim().toLowerCase().includes(target)
      );

      if (match) match.click();
    }, 100);

    return () => window.clearTimeout(timer);
  }, [legacyOpen, legacyTarget]);

  const counts = {
    love: Number(
      readerState?.counts?.love ??
        social?.counts?.love ??
        post?.love_count ??
        0
    ),
    applaud: Number(
      readerState?.counts?.applaud ??
        social?.counts?.applaud ??
        post?.applaud_count ??
        0
    ),
    comments: Number(
      readerState?.counts?.comments ??
        social?.counts?.comments ??
        0
    ),
    followers: Number(
      readerState?.counts?.followers ??
        social?.counts?.followers ??
        writer?.follower_count ??
        0
    ),
  };

  const comments = Array.isArray(readerState?.comments)
    ? readerState.comments
    : Array.isArray(social?.comments)
      ? social.comments
      : [];

  const bodyFields = useMemo(
    () => fields.filter((field) => String(fieldValue(field) || '').trim()),
    [fields]
  );

  function openLegacy(target) {
    setLegacyTarget(target || '');
    setLegacyOpen(true);
  }

  async function toggleFollow() {
    if (!writerId) return;

    setBusy('follow');
    setNotice('');

    try {
      const response = await api.post(
        `/api/reader/social/writers/${writerId}/follow`
      );

      setReaderState((current) => ({
        ...(current || {}),
        following: !!response?.data?.following,
        counts: {
          ...(current?.counts || {}),
          followers: Number(response?.data?.follower_count || 0),
        },
      }));
    } catch (actionError) {
      if (!authRedirect(actionError)) {
        setNotice(
          actionError?.response?.data?.message || 'Could not update follow.'
        );
      }
    } finally {
      setBusy('');
    }
  }

  async function toggleReaction(type) {
    if (!postId) return;

    setBusy(type);
    setNotice('');

    try {
      const response = await api.post(
        `/api/reader/social/posts/${postId}/reactions/${type}`
      );

      setReaderState((current) => ({
        ...(current || {}),
        ...(type === 'love'
          ? { loved: !!response?.data?.active }
          : { applauded: !!response?.data?.active }),
        counts: {
          ...(current?.counts || {}),
          love: Number(response?.data?.counts?.love || 0),
          applaud: Number(response?.data?.counts?.applaud || 0),
          comments: Number(
            current?.counts?.comments ??
              social?.counts?.comments ??
              0
          ),
          followers: Number(
            current?.counts?.followers ??
              social?.counts?.followers ??
              writer?.follower_count ??
              0
          ),
        },
      }));
    } catch (actionError) {
      if (!authRedirect(actionError)) {
        setNotice(
          actionError?.response?.data?.message || 'Could not update reaction.'
        );
      }
    } finally {
      setBusy('');
    }
  }

  async function toggleSave() {
    if (!postId) return;

    setBusy('save');
    setNotice('');

    try {
      if (saved) {
        await api.delete(`/api/customer/saved/posts/${postId}`);
        setSaved(false);
      } else {
        await api.post('/api/customer/saved/posts', { post_id: postId });
        setSaved(true);
      }
    } catch (actionError) {
      if (!authRedirect(actionError)) {
        setNotice(
          actionError?.response?.data?.message || 'Could not update saved post.'
        );
      }
    } finally {
      setBusy('');
    }
  }

  async function sharePost() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: post?.title || 'Bloggad post',
          text: post?.excerpt || post?.title || '',
          url,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setNotice('Post link copied.');
      }
    } catch (shareError) {
      if (shareError?.name !== 'AbortError') {
        setNotice('Could not share this post.');
      }
    }
  }

  function beginReply(comment) {
    const source = String(comment?.body || '');
    if (!comment?.id || !source) return;

    const maximum = Math.max(
      1,
      Math.min(500, Math.ceil(source.length * 0.2))
    );

    setQuoteDraft({
      id: Number(comment.id),
      text: source.slice(0, maximum),
      author: comment?.author?.name || 'Reader',
    });
  }

  async function submitComment(event) {
    event.preventDefault();

    const body = commentText.trim();
    if (!body || !postId) return;

    setBusy('comment');
    setNotice('');

    try {
      const response = await api.post(
        `/api/reader/social/posts/${postId}/comments`,
        {
          body,
          quoted_comment_id: quoteDraft?.id || null,
          quoted_text: quoteDraft?.text || null,
        }
      );

      setCommentText('');
      setQuoteDraft(null);

      setReaderState((current) => ({
        ...(current || {}),
        comments: Array.isArray(response?.data?.comments)
          ? response.data.comments
          : current?.comments || [],
        counts: {
          ...(current?.counts || {}),
          comments: Number(response?.data?.comment_count || 0),
        },
      }));
    } catch (actionError) {
      if (!authRedirect(actionError)) {
        setNotice(
          actionError?.response?.data?.message || 'Could not post comment.'
        );
      }
    } finally {
      setBusy('');
    }
  }

  if (loading) {
    return (
      <main className="wpp-status-page">
        <div className="wpp-status-card">Loading post...</div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="wpp-status-page">
        <div className="wpp-status-card">
          {error || 'Post not found.'}
        </div>
      </main>
    );
  }

  const writerName =
    writer?.public_name ||
    writer?.display_name ||
    writer?.pen_name ||
    page?.name ||
    'Writer';

  const writerAvatar =
    writer?.avatar_url ||
    page?.logo_url ||
    '';

  const postDate = post?.published_at
    ? new Date(post.published_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const contentLabel =
    CONTENT_LABELS[String(post?.content_type || '').toLowerCase()] ||
    'POST';

  const following = !!readerState?.following;
  const loved = !!readerState?.loved;
  const applauded = !!readerState?.applauded;

  return (
    <main className="wpp-page">
      <header className="wpp-global-header">
        <div className="wpp-global-inner">
          <Link className="wpp-brand" to="/">Bloggad</Link>

          <div className="wpp-search-pill">Search writers, stories, topics</div>

          <nav className="wpp-global-nav">
            <Link to="/">Explore</Link>
            <Link to="/topics">Topics</Link>
            <Link to="/writer/posts/create">Write</Link>
            <span className="wpp-user-dot" />
          </nav>
        </div>
      </header>

      <section className="wpp-hero">
        <div className="wpp-hero-inner">
          <Link
            className="wpp-breadcrumb"
            to={`/page/${encodeURIComponent(page?.slug || pageSlug || '')}`}
          >
            Back to {page?.name || 'Writer Page'}
          </Link>

          <div className="wpp-content-type">{contentLabel}</div>

          <h1>{post.title}</h1>

          {post.excerpt ? (
            <p className="wpp-excerpt">{post.excerpt}</p>
          ) : null}

          <div className="wpp-author-row">
            <Avatar src={writerAvatar} name={writerName} />

            <div className="wpp-author-copy">
              <strong>{writerName}</strong>
              <span>
                {postDate || 'Published'}
                {counts.followers ? ` - ${compactNumber(counts.followers)} followers` : ''}
              </span>
            </div>

            <div className="wpp-author-spacer" />

            <button
              className={`wpp-button primary ${following ? 'active' : ''}`}
              disabled={busy === 'follow'}
              onClick={toggleFollow}
              type="button"
            >
              {following ? 'Following' : 'Follow'}
            </button>

            <button
              className="wpp-button secondary wpp-desktop-message"
              onClick={() => openLegacy('message')}
              type="button"
            >
              Message
            </button>
          </div>

          <div className="wpp-hero-tools">
            <span>{postDate || 'Published'}</span>
            <span>{compactNumber(counts.love)} likes</span>
            <span>{compactNumber(counts.applaud)} applause</span>
            <span>{compactNumber(counts.comments)} responses</span>
          </div>
        </div>
      </section>

      <div className="wpp-content-grid">
        <article className="wpp-article">
          {post.featured_image ? (
            <figure className="wpp-featured">
              <img src={post.featured_image} alt="" />
            </figure>
          ) : null}

          <div className="wpp-inline-actions">
            <button
              className={loved ? 'active' : ''}
              disabled={busy === 'love'}
              onClick={() => toggleReaction('love')}
              type="button"
            >
              Like
            </button>
            <button
              className={applauded ? 'active' : ''}
              disabled={busy === 'applaud'}
              onClick={() => toggleReaction('applaud')}
              type="button"
            >
              Applaud
            </button>
            <button
              disabled={busy === 'save'}
              onClick={toggleSave}
              type="button"
            >
              {saved ? 'Saved' : 'Save'}
            </button>
            <button onClick={sharePost} type="button">Share</button>
            <button onClick={() => openLegacy('neural listen')} type="button">
              Neural Listen
            </button>
            <button onClick={() => openLegacy('more reading controls')} type="button">
              More
            </button>
          </div>

          <div className="wpp-article-body">
            {bodyFields.length ? (
              bodyFields.map((field, index) => (
                <ArticleField field={field} index={index} key={field?.id || index} />
              ))
            ) : (
              post.excerpt ? <p className="wpp-body-copy">{post.excerpt}</p> : null
            )}
          </div>

          {post?.content_type === 'product_post' && post?.product ? (
            <section className="wpp-product-context">
              <span>PRODUCT</span>
              <h3>{post.product.title}</h3>
              <p>
                Connected product information and purchase action for this Product Post.
              </p>
              <div>
                {websiteSlug && post.product.slug ? (
                  <Link
                    className="wpp-button primary"
                    to={`/${encodeURIComponent(websiteSlug)}/product/${encodeURIComponent(post.product.slug)}`}
                  >
                    View Product
                  </Link>
                ) : null}
                <button
                  className="wpp-button secondary"
                  onClick={toggleSave}
                  type="button"
                >
                  {saved ? 'Saved' : 'Save'}
                </button>
              </div>
            </section>
          ) : null}

          {data?.access?.locked ? (
            <section className="wpp-premium-context">
              <span>PREMIUM READING</span>
              <h3>Continue the full post</h3>
              <p>
                Reader access or direct Writer membership unlocks the remaining story without leaving this page.
              </p>
              {Number(data?.access?.estimated_read_seconds || 0) > 0 ? (
                <p>
                  Free Read:{' '}
                  {Number(data?.access?.free_preview_seconds || 0) < 60
                    ? `${Math.max(1, Number(data?.access?.free_preview_seconds || 0))} sec`
                    : `${Math.ceil(Number(data?.access?.free_preview_seconds || 0) / 60)} min`}
                  {' '}of about{' '}
                  {Math.max(1, Math.ceil(Number(data?.access?.estimated_read_seconds || 0) / 60))} min.
                </p>
              ) : null}
              <div>
                <button
                  className="wpp-button dark"
                  onClick={() => openLegacy('continue')}
                  type="button"
                >
                  Unlock full post
                </button>
                <button
                  className="wpp-button secondary"
                  onClick={() => openLegacy('membership')}
                  type="button"
                >
                  View membership
                </button>
              </div>
            </section>
          ) : null}

          <div className="wpp-engagement-row">
            <button
              className={loved ? 'active' : ''}
              onClick={() => toggleReaction('love')}
              type="button"
            >
              Like {compactNumber(counts.love)}
            </button>

            <button
              className={applauded ? 'active' : ''}
              onClick={() => toggleReaction('applaud')}
              type="button"
            >
              Applaud {compactNumber(counts.applaud)}
            </button>

            <button onClick={toggleSave} type="button">
              {saved ? 'Saved' : 'Save'}
            </button>

            <button onClick={sharePost} type="button">Share</button>

            <button
              className="wpp-appreciate-link"
              onClick={() => openLegacy('appreciate')}
              type="button"
            >
              Appreciate Writer
            </button>
          </div>
        </article>

        <section className="wpp-mobile-writer">
          <h2>Writer</h2>
          <div className="wpp-writer-row">
            <Avatar src={writerAvatar} name={writerName} />
            <div>
              <strong>{writerName}</strong>
              <span>{compactNumber(counts.followers)} followers</span>
            </div>
          </div>

          <div className="wpp-writer-actions">
            <button
              className="wpp-button primary"
              onClick={toggleFollow}
              type="button"
            >
              {following ? 'Following' : 'Follow'}
            </button>
            <button
              className="wpp-button secondary"
              onClick={() => openLegacy('message')}
              type="button"
            >
              Message
            </button>
            <button
              className="wpp-button secondary"
              onClick={() => openLegacy('appreciate')}
              type="button"
            >
              Appreciate
            </button>
          </div>
        </section>

        <section className="wpp-responses">
          <div className="wpp-responses-head">
            <h2>Responses</h2>
            <span>{compactNumber(counts.comments)}</span>
            <div />
            <small>Top</small>
          </div>

          <form className="wpp-comment-form" onSubmit={submitComment}>
            {quoteDraft ? (
              <div className="wpp-quote-draft">
                Replying to {quoteDraft.author}
                <button type="button" onClick={() => setQuoteDraft(null)}>
                  Cancel
                </button>
              </div>
            ) : null}

            <textarea
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="What are your thoughts?"
              rows={2}
            />

            {commentText.trim() ? (
              <button
                className="wpp-button primary"
                disabled={busy === 'comment'}
                type="submit"
              >
                {busy === 'comment' ? 'Posting...' : 'Post response'}
              </button>
            ) : null}
          </form>

          <div className="wpp-comment-list">
            {comments.length ? (
              comments.map((comment) => (
                <CommentThread
                  comment={comment}
                  key={comment.id}
                  onReply={beginReply}
                />
              ))
            ) : (
              <p className="wpp-empty-responses">No responses yet.</p>
            )}
          </div>
        </section>

        <aside className="wpp-sidebar">
          <section className="wpp-side-card wpp-desktop-writer-card">
            <h3>About the Writer</h3>
            <div className="wpp-writer-row">
              <Avatar src={writerAvatar} name={writerName} />
              <div>
                <strong>{writerName}</strong>
                <span>{compactNumber(counts.followers)} followers</span>
              </div>
            </div>

            <div className="wpp-writer-actions">
              <button
                className="wpp-button primary"
                onClick={toggleFollow}
                type="button"
              >
                {following ? 'Following' : 'Follow'}
              </button>
              <button
                className="wpp-button secondary"
                onClick={() => openLegacy('message')}
                type="button"
              >
                Message
              </button>
            </div>
          </section>

          <section className="wpp-side-card">
            <h3>Support this Writer</h3>
            <p>
              Appreciate the Writer with Reader credits or join direct membership when available.
            </p>
            <button
              className="wpp-text-action"
              onClick={() => openLegacy('appreciate')}
              type="button"
            >
              Appreciate Writer
            </button>
            <button
              className="wpp-text-action"
              onClick={() => openLegacy('membership')}
              type="button"
            >
              View membership
            </button>
          </section>

          <section className="wpp-side-card wpp-reading-panel">
            <h3>Reading controls</h3>
            <ReaderReadingTools
              post={post}
              templateFields={fields}
              access={data?.access || null}
            />
          </section>
        </aside>
      </div>

      {notice ? <div className="wpp-notice">{notice}</div> : null}

      {legacyOpen ? (
        <div
          className="wpp-legacy-backdrop"
          onMouseDown={() => setLegacyOpen(false)}
        >
          <section
            className="wpp-legacy-dialog"
            onMouseDown={(event) => event.stopPropagation()}
            ref={legacyRef}
          >
            <div className="wpp-legacy-head">
              <strong>Reader tools</strong>
              <button onClick={() => setLegacyOpen(false)} type="button">
                Close
              </button>
            </div>

            <PublicWriterReaderActions
              post={post}
              websiteSlug={websiteSlug}
              access={data?.access || null}
              templateFields={fields}
            />
          </section>
        </div>
      ) : null}
    </main>
  );
}