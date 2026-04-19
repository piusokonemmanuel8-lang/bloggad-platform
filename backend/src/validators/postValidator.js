function normalizeString(value) {
  return String(value || '').trim();
}

function validatePostInput(payload = {}) {
  const productId = Number(payload.product_id);
  const templateId = Number(payload.template_id);
  const title = normalizeString(payload.title);

  if (!Number.isInteger(productId) || productId <= 0) {
    return {
      ok: false,
      message: 'Valid product id is required',
    };
  }

  if (!Number.isInteger(templateId) || templateId <= 0) {
    return {
      ok: false,
      message: 'Valid template id is required',
    };
  }

  if (!title) {
    return {
      ok: false,
      message: 'Post title is required',
    };
  }

  return {
    ok: true,
    data: {
      product_id: productId,
      template_id: templateId,
      title,
    },
  };
}

module.exports = {
  validatePostInput,
};