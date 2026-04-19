const slugifyText = require('../utils/slugifyText');

function buildUniqueSlug(baseText, existingSlugs = []) {
  const baseSlug = slugifyText(baseText);

  if (!baseSlug) {
    return '';
  }

  const used = new Set(
    (existingSlugs || []).map((item) => String(item || '').trim().toLowerCase())
  );

  if (!used.has(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  let candidate = `${baseSlug}-${counter}`;

  while (used.has(candidate)) {
    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }

  return candidate;
}

module.exports = {
  buildUniqueSlug,
};