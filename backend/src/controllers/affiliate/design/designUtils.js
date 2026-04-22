function normalizeNullable(value) {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str ? str : null;
}

function normalizeBooleanFlag(value, fallback = 0) {
  if (value === undefined) return fallback;
  if (value === true || value === 1 || value === '1' || value === 'true') return 1;
  if (value === false || value === 0 || value === '0' || value === 'false') return 0;
  return fallback;
}

function normalizeCodeKey(value = '') {
  return String(value || '').trim().toLowerCase();
}

function normalizeInteger(value, fallback, min = 1, max = 100) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function parseJsonSafe(value, fallback = {}) {
  if (!value) return fallback;

  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
}

module.exports = {
  normalizeNullable,
  normalizeBooleanFlag,
  normalizeCodeKey,
  normalizeInteger,
  parseJsonSafe,
};