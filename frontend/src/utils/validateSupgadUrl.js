export function normalizeUrlInput(value) {
  return String(value || '').trim();
}

export function tryCreateUrl(rawValue) {
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

export function isSupgadHost(hostname) {
  return String(hostname || '').toLowerCase() === 'supgad.com';
}

export function validateSupgadUrl(value, options = {}) {
  const {
    required = false,
    allowEmpty = true,
    fieldName = 'URL',
  } = options;

  const rawValue = normalizeUrlInput(value);

  if (!rawValue) {
    if (required && !allowEmpty) {
      return {
        ok: false,
        message: `${fieldName} is required`,
        submitted_link: rawValue,
        detected_host: null,
      };
    }

    return {
      ok: true,
      message: `${fieldName} is empty`,
      submitted_link: rawValue,
      detected_host: null,
    };
  }

  const parsedUrl = tryCreateUrl(rawValue);

  if (!parsedUrl) {
    return {
      ok: false,
      message: `${fieldName} is not a valid URL`,
      submitted_link: rawValue,
      detected_host: null,
    };
  }

  const hostname = String(parsedUrl.hostname || '').toLowerCase();

  if (!isSupgadHost(hostname)) {
    return {
      ok: false,
      message: `${fieldName} must belong to supgad.com`,
      submitted_link: rawValue,
      detected_host: hostname || null,
    };
  }

  return {
    ok: true,
    message: `${fieldName} is valid`,
    submitted_link: rawValue,
    detected_host: hostname,
    normalized_url: parsedUrl.toString(),
  };
}

export default validateSupgadUrl;