import { useEffect, useState } from 'react';

function parseStoredVideoUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  if (raw.startsWith('{')) {
    try {
      const parsed = JSON.parse(raw);
      return String(parsed?.url || '').trim();
    } catch (error) {}
  }

  return raw;
}

export function resolvePostVideoUrl(value) {
  const raw = parseStoredVideoUrl(value);
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
          videoId: id,
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
          videoId: id,
          src: `https://www.youtube-nocookie.com/embed/${id}`,
        };
      }
    }

    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const parts = url.pathname.split('/').filter(Boolean);
      const id =
        [...parts].reverse().find((part) => /^\d+$/.test(part)) || '';

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

export default function PostVideoEmbed({
  url,
  title = 'Post video',
  maxWidth = 1100,
}) {
  const video = resolvePostVideoUrl(url);
  const [youtubeStarted, setYoutubeStarted] = useState(false);

  useEffect(() => {
    setYoutubeStarted(false);
  }, [video?.src]);

  if (!video) return null;

  const outerStyle = {
    width: '100%',
    maxWidth,
    margin: '22px auto',
    padding: '0 16px',
    boxSizing: 'border-box',
  };

  const mediaStyle = {
    display: 'block',
    width: '100%',
    border: 0,
    borderRadius: 14,
    background: '#0f172a',
  };

  if (video.kind === 'file') {
    return (
      <div style={outerStyle}>
        <video
          src={video.src}
          controls
          preload="metadata"
          style={{
            ...mediaStyle,
            maxHeight: 680,
          }}
        >
          Your browser does not support this video.
        </video>
      </div>
    );
  }

  if (video.provider === 'YouTube' && video.videoId) {
    const thumbnail =
      `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;

    const youtubeSrc =
      `${video.src}?autoplay=1&controls=0&fs=0&iv_load_policy=3&playsinline=1&rel=0`;

    if (!youtubeStarted) {
      return (
        <div style={outerStyle}>
          <button
            type="button"
            aria-label="Play video"
            onClick={() => setYoutubeStarted(true)}
            style={{
              position: 'relative',
              display: 'block',
              width: '100%',
              aspectRatio: '16 / 9',
              padding: 0,
              overflow: 'hidden',
              border: 0,
              borderRadius: 14,
              background: '#0f172a',
              cursor: 'pointer',
            }}
          >
            <img
              src={thumbnail}
              alt=""
              loading="lazy"
              decoding="async"
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(15, 23, 42, 0.16)',
              }}
            >
              <span
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 999,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(15, 23, 42, 0.86)',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.28)',
                }}
              >
                <span
                  style={{
                    width: 0,
                    height: 0,
                    marginLeft: 5,
                    borderTop: '13px solid transparent',
                    borderBottom: '13px solid transparent',
                    borderLeft: '20px solid #ffffff',
                  }}
                />
              </span>
            </span>
          </button>
        </div>
      );
    }

    return (
      <div style={outerStyle}>
        <div
          style={{
            width: '100%',
            aspectRatio: '16 / 9',
            overflow: 'hidden',
            borderRadius: 14,
            background: '#0f172a',
          }}
        >
          <iframe
            src={youtubeSrc}
            title={title || 'YouTube video'}
            loading="eager"
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            style={{
              ...mediaStyle,
              height: '100%',
              borderRadius: 0,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={outerStyle}>
      <div
        style={{
          width: '100%',
          aspectRatio: '16 / 9',
          overflow: 'hidden',
          borderRadius: 14,
          background: '#0f172a',
        }}
      >
        <iframe
          src={video.src}
          title={title || `${video.provider} video`}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          style={{
            ...mediaStyle,
            height: '100%',
            borderRadius: 0,
          }}
        />
      </div>
    </div>
  );
}
