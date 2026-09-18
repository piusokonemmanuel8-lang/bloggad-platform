const { getSignedCookies } = require('@aws-sdk/cloudfront-signer');

const REQUIRED_COOKIE_NAMES = [
  'CloudFront-Policy',
  'CloudFront-Signature',
  'CloudFront-Key-Pair-Id',
];

function signingEnabled() {
  return String(
    process.env.WEBINAR_CLOUDFRONT_SIGNING_ENABLED || ''
  ).trim().toLowerCase() === 'true';
}

function configError(message) {
  const error = new Error(message);
  error.code = 'WEBINAR_CLOUDFRONT_SIGNING_CONFIG_ERROR';
  error.status = 500;
  return error;
}

function signingConfig() {
  if (!signingEnabled()) return null;

  const baseUrl = String(process.env.WEBINAR_CLOUDFRONT_URL || '')
    .trim()
    .replace(/\/+$/g, '');
  const keyPairId = String(
    process.env.WEBINAR_CLOUDFRONT_KEY_PAIR_ID || ''
  ).trim();
  const privateKey = String(
    process.env.WEBINAR_CLOUDFRONT_PRIVATE_KEY || ''
  ).replace(/\\n/g, '\n');
  const cookieDomain = String(
    process.env.WEBINAR_CLOUDFRONT_COOKIE_DOMAIN || ''
  ).trim();
  const rawTtl = Number(
    process.env.WEBINAR_CLOUDFRONT_COOKIE_TTL_SECONDS || 600
  );
  const ttlSeconds =
    Number.isInteger(rawTtl) && rawTtl >= 60 && rawTtl <= 3600
      ? rawTtl
      : 600;

  if (!baseUrl || !keyPairId || !privateKey || !cookieDomain) {
    throw configError(
      'CloudFront webinar signing is enabled but signing configuration is incomplete.'
    );
  }

  let parsedBase;

  try {
    parsedBase = new URL(baseUrl);
  } catch {
    throw configError('WEBINAR_CLOUDFRONT_URL must be a valid HTTPS URL.');
  }

  if (parsedBase.protocol !== 'https:') {
    throw configError('WEBINAR_CLOUDFRONT_URL must use HTTPS.');
  }

  if (
    cookieDomain.includes('/') ||
    cookieDomain.includes(':') ||
    cookieDomain.includes(' ')
  ) {
    throw configError(
      'WEBINAR_CLOUDFRONT_COOKIE_DOMAIN must be a cookie domain, not a URL.'
    );
  }

  return {
    baseOrigin: parsedBase.origin,
    keyPairId,
    privateKey,
    cookieDomain,
    ttlSeconds,
  };
}

function findPlaybackUrl(value, depth = 0, seen = new Set()) {
  if (depth > 8 || value === null || value === undefined) return null;

  if (typeof value === 'string') {
    return value.startsWith('https://') ? value : null;
  }

  if (typeof value !== 'object' || seen.has(value)) return null;

  seen.add(value);

  if (
    typeof value.playback_url === 'string' &&
    value.playback_url.trim()
  ) {
    return value.playback_url.trim();
  }

  for (const child of Object.values(value)) {
    const found = findPlaybackUrl(child, depth + 1, seen);
    if (found) return found;
  }

  return null;
}

function buildPlaybackAuthorization(playbackUrl) {
  const config = signingConfig();

  if (!config) {
    return {
      enabled: false,
      playbackUrl: playbackUrl || null,
      cookies: null,
      cookiePath: null,
      expiresAt: null,
    };
  }

  let parsed;

  try {
    parsed = new URL(String(playbackUrl || '').trim());
  } catch {
    throw configError('Webinar playback URL is invalid.');
  }

  if (parsed.origin !== config.baseOrigin) {
    throw configError(
      'Webinar playback URL does not match WEBINAR_CLOUDFRONT_URL.'
    );
  }

  const slashIndex = parsed.pathname.lastIndexOf('/');

  if (slashIndex <= 0) {
    throw configError('Webinar playback URL does not contain an HLS directory.');
  }

  const cookiePath = parsed.pathname.slice(0, slashIndex + 1);
  const resource = `${parsed.origin}${cookiePath}*`;
  const expiresAt = Math.floor(Date.now() / 1000) + config.ttlSeconds;
  const policy = JSON.stringify({
    Statement: [
      {
        Resource: resource,
        Condition: {
          DateLessThan: {
            'AWS:EpochTime': expiresAt,
          },
        },
      },
    ],
  });

  const cookies = getSignedCookies({
    keyPairId: config.keyPairId,
    privateKey: config.privateKey,
    policy,
  });

  for (const name of REQUIRED_COOKIE_NAMES) {
    if (!cookies || !cookies[name]) {
      throw configError(`CloudFront signer did not return ${name}.`);
    }
  }

  return {
    enabled: true,
    playbackUrl: parsed.toString(),
    cookies,
    cookiePath,
    cookieDomain: config.cookieDomain,
    expiresAt,
    resource,
  };
}

function applyWebinarPlaybackCookies(res, payload) {
  if (!signingEnabled()) {
    return {
      enabled: false,
      applied: false,
    };
  }

  const playbackUrl = findPlaybackUrl(payload);

  if (!playbackUrl) {
    return {
      enabled: true,
      applied: false,
    };
  }

  if (!res || typeof res.cookie !== 'function') {
    throw configError('Express response cookie support is unavailable.');
  }

  const authorization = buildPlaybackAuthorization(playbackUrl);

  const options = {
    domain: authorization.cookieDomain,
    path: authorization.cookiePath,
    secure: true,
    httpOnly: true,
    sameSite: 'none',
  };

  for (const name of REQUIRED_COOKIE_NAMES) {
    res.cookie(name, authorization.cookies[name], options);
  }

  return {
    enabled: true,
    applied: true,
    expires_at: authorization.expiresAt,
  };
}

module.exports = {
  signingEnabled,
  findPlaybackUrl,
  buildPlaybackAuthorization,
  applyWebinarPlaybackCookies,
};