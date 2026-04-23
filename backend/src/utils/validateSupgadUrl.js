function normalizeUrlInput(value) {
  return String(value || '').trim();
}

function tryCreateUrl(rawValue) {
  try {
    return new URL(rawValue);
  } catch (error) {
    try {
      return new URL(`https://${rawValue}`);
    } catch (secondError) {
      return null;
    }
  }
}

function isSupgadHost(hostname) {
  return String(hostname || '').toLowerCase() === 'supgad.com';
}

function validateSupgadUrl(value, options = {}) {
  const {
    required = false,
    allowEmpty = true,
    fieldName = 'URL',
    allowExternalLinks = false,
    allowedDomains = ['supgad.com'],
  } = options;

  const rawValue = normalizeUrlInput(value);

  if (!rawValue) {
    if (required && !allowEmpty) {
      return {
        ok: false,
        message: `${fieldName} is required`,
        submitted_link: rawValue,
        detected_host: null,
        normalized_url: null,
      };
    }

    return {
      ok: true,
      message: `${fieldName} is empty`,
      submitted_link: rawValue,
      detected_host: null,
      normalized_url: null,
    };
  }

  const parsedUrl = tryCreateUrl(rawValue);

  if (!parsedUrl) {
    return {
      ok: false,
      message: `${fieldName} is not a valid URL`,
      submitted_link: rawValue,
      detected_host: null,
      normalized_url: null,
    };
  }

  const protocol = String(parsedUrl.protocol || '').toLowerCase();
  const hostname = String(parsedUrl.hostname || '').toLowerCase();
  const normalizedAllowedDomains = Array.isArray(allowedDomains)
    ? allowedDomains.map((item) => String(item || '').toLowerCase()).filter(Boolean)
    : ['supgad.com'];

  if (!['http:', 'https:'].includes(protocol)) {
    return {
      ok: false,
      message: `${fieldName} must use http or https`,
      submitted_link: rawValue,
      detected_host: hostname || null,
      normalized_url: parsedUrl.toString(),
    };
  }

  if (allowExternalLinks) {
    return {
      ok: true,
      message: `${fieldName} is valid`,
      submitted_link: rawValue,
      detected_host: hostname,
      normalized_url: parsedUrl.toString(),
      is_external_link: !normalizedAllowedDomains.includes(hostname),
      allow_external_links: true,
    };
  }

  if (!normalizedAllowedDomains.includes(hostname)) {
    return {
      ok: false,
      message: `${fieldName} must belong to ${normalizedAllowedDomains.join(', ')}`,
      submitted_link: rawValue,
      detected_host: hostname || null,
      normalized_url: parsedUrl.toString(),
      allow_external_links: false,
    };
  }

  return {
    ok: true,
    message: `${fieldName} is valid`,
    submitted_link: rawValue,
    detected_host: hostname,
    normalized_url: parsedUrl.toString(),
    is_external_link: false,
    allow_external_links: false,
  };
}

module.exports = {
  normalizeUrlInput,
  tryCreateUrl,
  isSupgadHost,
  validateSupgadUrl,
};