function normalizeString(value) {
  return String(value || '').trim();
}

function validateWebsiteInput(payload = {}) {
  const websiteName = normalizeString(payload.website_name);
  const slug = normalizeString(payload.slug);

  if (!websiteName) {
    return {
      ok: false,
      message: 'Website name is required',
    };
  }

  if (slug && !/^[a-z0-9-]+$/.test(slug)) {
    return {
      ok: false,
      message: 'Website slug can only contain lowercase letters, numbers, and hyphens',
    };
  }

  return {
    ok: true,
    data: {
      website_name: websiteName,
      slug,
    },
  };
}

module.exports = {
  validateWebsiteInput,
};