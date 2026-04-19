function normalizeString(value) {
  return String(value || '').trim();
}

function validateSliderInput(payload = {}) {
  const image = normalizeString(payload.image);
  const linkType = normalizeString(payload.link_type).toLowerCase();
  const linkedPostId = Number(payload.linked_post_id);
  const linkedProductId = Number(payload.linked_product_id);
  const externalUrl = normalizeString(payload.external_url);

  if (!image) {
    return {
      ok: false,
      message: 'Slider image is required',
    };
  }

  if (!['internal_post', 'external_url', 'product'].includes(linkType)) {
    return {
      ok: false,
      message: 'Link type must be internal_post, external_url, or product',
    };
  }

  if (linkType === 'internal_post') {
    if (!Number.isInteger(linkedPostId) || linkedPostId <= 0) {
      return {
        ok: false,
        message: 'Valid linked post id is required for internal post slider',
      };
    }
  }

  if (linkType === 'product') {
    if (!Number.isInteger(linkedProductId) || linkedProductId <= 0) {
      return {
        ok: false,
        message: 'Valid linked product id is required for product slider',
      };
    }
  }

  if (linkType === 'external_url' && !externalUrl) {
    return {
      ok: false,
      message: 'External URL is required for external slider',
    };
  }

  return {
    ok: true,
    data: {
      image,
      link_type: linkType,
      linked_post_id: Number.isInteger(linkedPostId) && linkedPostId > 0 ? linkedPostId : null,
      linked_product_id:
        Number.isInteger(linkedProductId) && linkedProductId > 0 ? linkedProductId : null,
      external_url: externalUrl || null,
    },
  };
}

module.exports = {
  validateSliderInput,
};