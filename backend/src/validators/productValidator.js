function normalizeString(value) {
  return String(value || '').trim();
}

function normalizeNumber(value) {
  if (value === undefined || value === null || value === '') return null;

  const num = Number(value);
  if (!Number.isFinite(num)) return null;

  return num;
}

function validateProductInput(payload = {}) {
  const title = normalizeString(payload.title);
  const productImage = normalizeString(payload.product_image);
  const pricingType = normalizeString(payload.pricing_type).toLowerCase();
  const price = normalizeNumber(payload.price);
  const minPrice = normalizeNumber(payload.min_price);
  const maxPrice = normalizeNumber(payload.max_price);

  if (!title) {
    return {
      ok: false,
      message: 'Product title is required',
    };
  }

  if (!productImage) {
    return {
      ok: false,
      message: 'Product image is required',
    };
  }

  if (!['simple', 'variable'].includes(pricingType)) {
    return {
      ok: false,
      message: 'Pricing type must be simple or variable',
    };
  }

  if (pricingType === 'simple') {
    if (price === null || price < 0) {
      return {
        ok: false,
        message: 'Valid price is required for simple product',
      };
    }
  }

  if (pricingType === 'variable') {
    if (minPrice === null || minPrice < 0) {
      return {
        ok: false,
        message: 'Valid minimum price is required for variable product',
      };
    }

    if (maxPrice === null || maxPrice < 0) {
      return {
        ok: false,
        message: 'Valid maximum price is required for variable product',
      };
    }

    if (maxPrice < minPrice) {
      return {
        ok: false,
        message: 'Maximum price must be greater than or equal to minimum price',
      };
    }
  }

  return {
    ok: true,
    data: {
      title,
      product_image: productImage,
      pricing_type: pricingType,
      price,
      min_price: minPrice,
      max_price: maxPrice,
    },
  };
}

module.exports = {
  validateProductInput,
};