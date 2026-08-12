const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pool = require('../config/db');
const { getUploadDir, getUploadsRoot } = require('../config/uploads');
const {
  getReaderPostAccess,
  getPostAccessSetting,
  getPostFields,
} = require('./writerReaderAccessService');

function fail(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function positiveInt(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function cleanVoice(value) {
  const voice = String(value || 'default').trim().toLowerCase();
  const safe = voice.replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  return safe.slice(0, 80) || 'default';
}

function stripMarkup(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function readableFieldValue(field) {
  const type = String(field?.field_type || 'text').trim().toLowerCase();
  const raw = String(field?.field_value || '').trim();

  if (!raw || ['image', 'divider'].includes(type)) return '';

  if (type === 'url') {
    try {
      const parsed = JSON.parse(raw);
      return stripMarkup(parsed?.label || '');
    } catch {
      return '';
    }
  }

  return stripMarkup(raw);
}

async function getPostMeta(postId) {
  const [rows] = await pool.query(
    `
    SELECT
      pp.id,
      pp.user_id AS writer_user_id,
      pp.title,
      pp.excerpt,
      pp.status
    FROM product_posts pp
    WHERE pp.id = ?
      AND pp.status = 'published'
    LIMIT 1
    `,
    [postId]
  );

  return rows[0] || null;
}

function buildReadableText({ post, fields }) {
  const parts = [
    stripMarkup(post?.title),
    stripMarkup(post?.excerpt),
    ...(Array.isArray(fields) ? fields.map(readableFieldValue) : []),
  ].filter(Boolean);

  return parts.join('. ').replace(/\s+/g, ' ').trim();
}

function contentHash(text) {
  return crypto.createHash('sha256').update(String(text || ''), 'utf8').digest('hex');
}

function providerConfig(provider) {
  if (provider === 'external') {
    return {
      endpoint: String(process.env.BLOGGAD_TTS_EXTERNAL_ENDPOINT || '').trim(),
      apiKey: String(process.env.BLOGGAD_TTS_EXTERNAL_API_KEY || '').trim(),
    };
  }

  if (provider === 'self_hosted') {
    return {
      endpoint: String(process.env.BLOGGAD_TTS_SELF_HOSTED_ENDPOINT || '').trim(),
      apiKey: String(process.env.BLOGGAD_TTS_SELF_HOSTED_API_KEY || '').trim(),
    };
  }

  return { endpoint: '', apiKey: '' };
}

function availableProviders() {
  return {
    browser: true,
    external: !!providerConfig('external').endpoint,
    self_hosted: !!providerConfig('self_hosted').endpoint,
  };
}

function extensionForMime(mimeType) {
  const mime = String(mimeType || '').split(';')[0].trim().toLowerCase();
  if (mime === 'audio/wav' || mime === 'audio/x-wav') return 'wav';
  if (mime === 'audio/ogg') return 'ogg';
  if (mime === 'audio/mp4' || mime === 'audio/x-m4a') return 'm4a';
  if (mime === 'audio/aac') return 'aac';
  return 'mp3';
}

async function getListenManifest(postId) {
  const cleanPostId = positiveInt(postId);
  if (!cleanPostId) throw fail('Valid post ID is required.');

  const post = await getPostMeta(cleanPostId);
  if (!post) throw fail('Published post not found.', 404);

  const access = await getPostAccessSetting(cleanPostId);

  return {
    post: {
      id: Number(post.id),
      title: post.title,
    },
    access_type: access.access_type,
    neural_requires_reader_access: true,
    providers: availableProviders(),
    cached_audio: [],
  };
}

async function getEntitledReadableText(readerUserId, postId) {
  const cleanPostId = positiveInt(postId);
  const cleanReaderId = positiveInt(readerUserId);

  if (!cleanPostId || !cleanReaderId) {
    throw fail('Valid Reader and post IDs are required.');
  }

  const post = await getPostMeta(cleanPostId);
  if (!post) throw fail('Published post not found.', 404);

  const access = await getReaderPostAccess(cleanReaderId, cleanPostId);

  if (!access?.entitled) {
    throw fail('Full Reader access is required before generating audio for this premium post.', 403);
  }

  const text = buildReadableText({
    post,
    fields: access.template_fields || [],
  });

  if (!text) throw fail('This post does not have readable text yet.');

  return {
    post,
    text,
    hash: contentHash(text),
  };
}

async function generateAndCacheAudio({ readerUserId, postId, provider, voice }) {
  const normalizedProvider = String(provider || '').trim().toLowerCase();

  if (!['external', 'self_hosted'].includes(normalizedProvider)) {
    throw fail('Choose external or self_hosted neural TTS.');
  }

  const config = providerConfig(normalizedProvider);
  if (!config.endpoint) {
    throw fail(`${normalizedProvider} TTS is not configured on this Bloggad server.`, 503);
  }

  const voiceKey = cleanVoice(voice);
  const readable = await getEntitledReadableText(readerUserId, postId);

  const [existing] = await pool.query(
    `
    SELECT id, audio_path, mime_type, duration_seconds, generated_at
    FROM post_audio_assets
    WHERE post_id = ?
      AND provider = ?
      AND voice_key = ?
      AND content_hash = ?
      AND status = 'ready'
    LIMIT 1
    `,
    [readable.post.id, normalizedProvider, voiceKey, readable.hash]
  );

  if (existing[0]) {
    return {
      reused: true,
      provider: normalizedProvider,
      voice_key: voiceKey,
      content_hash: readable.hash,
      ...existing[0],
    };
  }

  await pool.query(
    `
    INSERT INTO post_audio_assets (
      post_id,
      provider,
      voice_key,
      content_hash,
      status,
      audio_path,
      mime_type,
      duration_seconds,
      last_error,
      generated_at,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, 'generating', NULL, NULL, NULL, NULL, NULL, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      status = 'generating',
      last_error = NULL,
      updated_at = NOW()
    `,
    [readable.post.id, normalizedProvider, voiceKey, readable.hash]
  );

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        text: readable.text,
        voice: voiceKey,
        format: 'mp3',
        post_id: Number(readable.post.id),
      }),
    });

    if (!response.ok) {
      const message = (await response.text()).slice(0, 500);
      throw new Error(`TTS provider returned HTTP ${response.status}${message ? `: ${message}` : ''}`);
    }

    const mimeType =
      String(response.headers.get('content-type') || 'audio/mpeg')
        .split(';')[0]
        .trim()
        .toLowerCase() || 'audio/mpeg';

    if (!mimeType.startsWith('audio/') && mimeType !== 'application/octet-stream') {
      throw new Error(`TTS provider returned unsupported content type ${mimeType}.`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (!buffer.length) throw new Error('TTS provider returned an empty audio file.');
    if (buffer.length > 25 * 1024 * 1024) {
      throw new Error('Generated audio exceeded the 25 MB Bloggad cache limit.');
    }

    const extension = extensionForMime(mimeType);
    const dir = getUploadDir('.tts-cache');
    const randomToken = crypto.randomBytes(16).toString('hex');
    const filename =
      `post-${readable.post.id}-${readable.hash.slice(0, 16)}-${normalizedProvider}-${voiceKey}-${randomToken}.${extension}`;
    const finalPath = path.join(dir, filename);
    const tempPath = `${finalPath}.tmp-${process.pid}-${Date.now()}`;

    fs.writeFileSync(tempPath, buffer);
    fs.renameSync(tempPath, finalPath);

    const storedPath = `.tts-cache/${filename}`;

    await pool.query(
      `
      INSERT INTO post_audio_assets (
        post_id,
        provider,
        voice_key,
        content_hash,
        status,
        audio_path,
        mime_type,
        duration_seconds,
        last_error,
        generated_at,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, 'ready', ?, ?, NULL, NULL, NOW(), NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        status = 'ready',
        audio_path = VALUES(audio_path),
        mime_type = VALUES(mime_type),
        last_error = NULL,
        generated_at = NOW(),
        updated_at = NOW()
      `,
      [
        readable.post.id,
        normalizedProvider,
        voiceKey,
        readable.hash,
        storedPath,
        mimeType === 'application/octet-stream' ? 'audio/mpeg' : mimeType,
      ]
    );

    const [assetRows] = await pool.query(
      `
      SELECT id, audio_path, mime_type, duration_seconds, generated_at
      FROM post_audio_assets
      WHERE post_id = ?
        AND provider = ?
        AND voice_key = ?
        AND content_hash = ?
        AND status = 'ready'
      LIMIT 1
      `,
      [readable.post.id, normalizedProvider, voiceKey, readable.hash]
    );

    return {
      reused: false,
      provider: normalizedProvider,
      voice_key: voiceKey,
      content_hash: readable.hash,
      ...(assetRows[0] || {}),
    };
  } catch (error) {
    await pool.query(
      `
      UPDATE post_audio_assets
      SET
        status = 'failed',
        last_error = ?,
        updated_at = NOW()
      WHERE post_id = ?
        AND provider = ?
        AND voice_key = ?
        AND content_hash = ?
      `,
      [
        String(error.message || 'TTS generation failed.').slice(0, 1000),
        readable.post.id,
        normalizedProvider,
        voiceKey,
        readable.hash,
      ]
    );

    throw error;
  }
}


async function getAudioAssetForReader(readerUserId, assetId) {
  const cleanReaderId = positiveInt(readerUserId);
  const cleanAssetId = positiveInt(assetId);

  if (!cleanReaderId || !cleanAssetId) {
    throw fail('Valid Reader and audio asset IDs are required.');
  }

  const [rows] = await pool.query(
    `
    SELECT
      id,
      post_id,
      provider,
      voice_key,
      content_hash,
      status,
      audio_path,
      mime_type
    FROM post_audio_assets
    WHERE id = ?
      AND status = 'ready'
    LIMIT 1
    `,
    [cleanAssetId]
  );

  const asset = rows[0];
  if (!asset) throw fail('Audio asset not found.', 404);

  const access = await getReaderPostAccess(cleanReaderId, asset.post_id);
  if (!access?.entitled) {
    throw fail('Reader access is required for this audio.', 403);
  }

  const root = path.resolve(getUploadsRoot());
  const absolutePath = path.resolve(root, String(asset.audio_path || ''));
  const relative = path.relative(root, absolutePath);

  if (!asset.audio_path || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw fail('Audio asset path is invalid.', 500);
  }

  if (!fs.existsSync(absolutePath)) {
    throw fail('Cached audio file is missing.', 404);
  }

  return {
    ...asset,
    id: Number(asset.id),
    post_id: Number(asset.post_id),
    absolute_path: absolutePath,
  };
}

module.exports = {
  availableProviders,
  getListenManifest,
  generateAndCacheAudio,
  getAudioAssetForReader,
};