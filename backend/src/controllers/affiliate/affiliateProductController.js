const slugify = require('slugify');
const pool = require('../../config/db');
const { assertAndLogSupgadUrl } = require('../../services/linkValidationService');

function sanitizeProduct(row) {
  if (!row) return null;

  return {
    id: row.id,
    user_id: row.user_id,
    website_id: row.website_id,
    category_id: row.category_id,
    title: row.title,
    slug: row.slug,
    product_image: row.product_image,
    media_id: row.media_id,
    pricing_type: row.pricing_type,
    price: row.price,
    min_price: row.min_price,
    max_price: row.max_price,
    homepage_cta_label: row.homepage_cta_label,
    storefront_cta_label: row.storefront_cta_label,
    affiliate_buy_url: row.affiliate_buy_url,
    short_description: row.short_description,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    category_name: row.category_name,
    category_slug: row.category_slug,
    website_name: row.website_name,
    website_slug: row.website_slug,
  };
}

function makeSlug(value) {
  return slugify(String(value || '').trim(), {
    lower: true,
    strict: true,
    trim: true,
  });
}

function normalizeNullable(value) {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str ? str : null;
}

function normalizePrice(value) {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  return Number(num.toFixed(2));
}

function validatePricingType(pricingType, price, minPrice, maxPrice) {
  if (!['simple', 'variable'].includes(pricingType)) {
    return 'Pricing type must be simple or variable';
  }

  if (pricingType === 'simple') {
    if (price === null) {
      return 'Price is required for simple products';
    }
    return null;
  }

  if (minPrice === null) {
    return 'Minimum price is required for variable products';
  }

  if (maxPrice !== null && maxPrice < minPrice) {
    return 'Suggested maximum price must be greater than or equal to minimum price';
  }

  return null;
}

async function getAffiliateWebsite(userId) {
  const [rows] = await pool.query(
    `
    SELECT id, user_id, website_name, slug, status
    FROM affiliate_websites
    WHERE user_id = ?
    LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}

async function getCategoryById(categoryId) {
  if (!categoryId) return null;

  const [rows] = await pool.query(
    `
    SELECT id, name, slug, status
    FROM categories
    WHERE id = ?
    LIMIT 1
    `,
    [categoryId]
  );

  return rows[0] || null;
}

async function ensureUniqueProductSlug(baseSlug, websiteId, currentProductId = null) {
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const params = [websiteId, candidate];
    let sql = `
      SELECT id
      FROM products
      WHERE website_id = ?
        AND slug = ?
    `;

    if (currentProductId) {
      sql += ` AND id <> ?`;
      params.push(currentProductId);
    }

    sql += ` LIMIT 1`;

    const [rows] = await pool.query(sql, params);

    if (!rows.length) {
      return candidate;
    }

    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
}

async function getOwnedProductById(productId, userId) {
  const [rows] = await pool.query(
    `
    SELECT
      p.id,
      p.user_id,
      p.website_id,
      p.category_id,
      p.title,
      p.slug,
      p.product_image,
      p.media_id,
      p.pricing_type,
      p.price,
      p.min_price,
      p.max_price,
      p.homepage_cta_label,
      p.storefront_cta_label,
      p.affiliate_buy_url,
      p.short_description,
      p.status,
      p.created_at,
      p.updated_at,
      c.name AS category_name,
      c.slug AS category_slug,
      w.website_name,
      w.slug AS website_slug
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    INNER JOIN affiliate_websites w ON w.id = p.website_id
    WHERE p.id = ?
      AND p.user_id = ?
    LIMIT 1
    `,
    [productId, userId]
  );

  return rows[0] || null;
}

async function getMyProducts(req, res) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT
        p.id,
        p.user_id,
        p.website_id,
        p.category_id,
        p.title,
        p.slug,
        p.product_image,
        p.media_id,
        p.pricing_type,
        p.price,
        p.min_price,
        p.max_price,
        p.homepage_cta_label,
        p.storefront_cta_label,
        p.affiliate_buy_url,
        p.short_description,
        p.status,
        p.created_at,
        p.updated_at,
        c.name AS category_name,
        c.slug AS category_slug,
        w.website_name,
        w.slug AS website_slug
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      INNER JOIN affiliate_websites w ON w.id = p.website_id
      WHERE p.user_id = ?
      ORDER BY p.id DESC
      `,
      [userId]
    );

    return res.status(200).json({
      ok: true,
      products: rows.map(sanitizeProduct),
    });
  } catch (error) {
    console.error('getMyProducts error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
}

async function getMyProductById(req, res) {
  try {
    const userId = req.user.id;
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid product id',
      });
    }

    const product = await getOwnedProductById(productId, userId);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      ok: true,
      product: sanitizeProduct(product),
    });
  } catch (error) {
    console.error('getMyProductById error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch product',
      error: error.message,
    });
  }
}

async function createProduct(req, res) {
  try {
    const userId = req.user.id;
    const website = await getAffiliateWebsite(userId);

    if (!website) {
      return res.status(400).json({
        ok: false,
        message: 'Create your website first before adding products',
      });
    }

    const {
      category_id,
      title,
      slug,
      product_image,
      media_id,
      pricing_type,
      price,
      min_price,
      max_price,
      homepage_cta_label,
      storefront_cta_label,
      affiliate_buy_url,
      short_description,
      status,
    } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        ok: false,
        message: 'Product title is required',
      });
    }

    if (!product_image || !String(product_image).trim()) {
      return res.status(400).json({
        ok: false,
        message: 'Product image is required',
      });
    }

    const cleanTitle = String(title).trim();
    const cleanProductImage = String(product_image).trim();
    const cleanHomepageCtaLabel = normalizeNullable(homepage_cta_label) || 'Buy Now';
    const cleanStorefrontCtaLabel = normalizeNullable(storefront_cta_label) || 'Read More';
    const cleanShortDescription = normalizeNullable(short_description);
    const cleanPricingType = String(pricing_type || '').trim().toLowerCase();
    const cleanPrice = normalizePrice(price);
    const cleanMinPrice = normalizePrice(min_price);
    const cleanMaxPrice = normalizePrice(max_price);
    const desiredSlug = normalizeNullable(slug) || cleanTitle;
    const baseSlug = makeSlug(desiredSlug);

    if (!baseSlug) {
      return res.status(400).json({
        ok: false,
        message: 'A valid product slug could not be generated',
      });
    }

    const pricingError = validatePricingType(
      cleanPricingType,
      cleanPrice,
      cleanMinPrice,
      cleanMaxPrice
    );

    if (pricingError) {
      return res.status(400).json({
        ok: false,
        message: pricingError,
      });
    }

    let cleanCategoryId = null;
    if (category_id !== undefined && category_id !== null && category_id !== '') {
      cleanCategoryId = Number(category_id);

      if (!Number.isInteger(cleanCategoryId) || cleanCategoryId <= 0) {
        return res.status(400).json({
          ok: false,
          message: 'Invalid category id',
        });
      }

      const category = await getCategoryById(cleanCategoryId);

      if (!category || category.status !== 'active') {
        return res.status(400).json({
          ok: false,
          message: 'Selected category is invalid or inactive',
        });
      }
    }

    let validatedBuyUrl = null;
    if (
      affiliate_buy_url !== undefined &&
      affiliate_buy_url !== null &&
      String(affiliate_buy_url).trim()
    ) {
      const result = await assertAndLogSupgadUrl({
        value: affiliate_buy_url,
        fieldName: 'Affiliate Buy URL',
        required: true,
        allowEmpty: false,
        userId,
        websiteId: website.id,
        sourceType: 'product',
        sourceId: null,
      });

      validatedBuyUrl = result.normalized_url || result.submitted_link;
    }

    const cleanStatus = ['draft', 'published', 'inactive'].includes(status)
      ? status
      : 'draft';

    const uniqueSlug = await ensureUniqueProductSlug(baseSlug, website.id);

    const [result] = await pool.query(
      `
      INSERT INTO products
      (
        user_id,
        website_id,
        category_id,
        title,
        slug,
        product_image,
        media_id,
        pricing_type,
        price,
        min_price,
        max_price,
        homepage_cta_label,
        storefront_cta_label,
        affiliate_buy_url,
        short_description,
        status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        userId,
        website.id,
        cleanCategoryId,
        cleanTitle,
        uniqueSlug,
        cleanProductImage,
        media_id || null,
        cleanPricingType,
        cleanPricingType === 'simple' ? cleanPrice : null,
        cleanPricingType === 'variable' ? cleanMinPrice : null,
        cleanPricingType === 'variable' ? cleanMaxPrice : null,
        cleanHomepageCtaLabel,
        cleanStorefrontCtaLabel,
        validatedBuyUrl,
        cleanShortDescription,
        cleanStatus,
      ]
    );

    const product = await getOwnedProductById(result.insertId, userId);

    return res.status(201).json({
      ok: true,
      message: 'Product created successfully',
      product: sanitizeProduct(product),
      next_step: {
        action: 'create_post',
        message: 'Write a post about this product',
        product_id: result.insertId,
      },
    });
  } catch (error) {
    console.error('createProduct error:', error);

    return res.status(error.status || 500).json({
      ok: false,
      message: error.message || 'Failed to create product',
      error: error.status ? undefined : error.message,
    });
  }
}

async function updateProduct(req, res) {
  try {
    const userId = req.user.id;
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid product id',
      });
    }

    const existingProduct = await getOwnedProductById(productId, userId);

    if (!existingProduct) {
      return res.status(404).json({
        ok: false,
        message: 'Product not found',
      });
    }

    const {
      category_id,
      title,
      slug,
      product_image,
      media_id,
      pricing_type,
      price,
      min_price,
      max_price,
      homepage_cta_label,
      storefront_cta_label,
      affiliate_buy_url,
      short_description,
      status,
    } = req.body;

    const cleanTitle = title !== undefined ? String(title).trim() : existingProduct.title;

    if (!cleanTitle) {
      return res.status(400).json({
        ok: false,
        message: 'Product title is required',
      });
    }

    const cleanProductImage =
      product_image !== undefined ? String(product_image).trim() : existingProduct.product_image;

    if (!cleanProductImage) {
      return res.status(400).json({
        ok: false,
        message: 'Product image is required',
      });
    }

    const cleanPricingType =
      pricing_type !== undefined
        ? String(pricing_type).trim().toLowerCase()
        : existingProduct.pricing_type;

    const cleanPrice =
      price !== undefined ? normalizePrice(price) : normalizePrice(existingProduct.price);

    const cleanMinPrice =
      min_price !== undefined ? normalizePrice(min_price) : normalizePrice(existingProduct.min_price);

    const cleanMaxPrice =
      max_price !== undefined ? normalizePrice(max_price) : normalizePrice(existingProduct.max_price);

    const pricingError = validatePricingType(
      cleanPricingType,
      cleanPrice,
      cleanMinPrice,
      cleanMaxPrice
    );

    if (pricingError) {
      return res.status(400).json({
        ok: false,
        message: pricingError,
      });
    }

    let cleanCategoryId = existingProduct.category_id;
    if (category_id !== undefined) {
      if (category_id === null || category_id === '') {
        cleanCategoryId = null;
      } else {
        cleanCategoryId = Number(category_id);

        if (!Number.isInteger(cleanCategoryId) || cleanCategoryId <= 0) {
          return res.status(400).json({
            ok: false,
            message: 'Invalid category id',
          });
        }

        const category = await getCategoryById(cleanCategoryId);

        if (!category || category.status !== 'active') {
          return res.status(400).json({
            ok: false,
            message: 'Selected category is invalid or inactive',
          });
        }
      }
    }

    const desiredSlug = slug !== undefined ? normalizeNullable(slug) || cleanTitle : existingProduct.slug;
    const baseSlug = makeSlug(desiredSlug);

    if (!baseSlug) {
      return res.status(400).json({
        ok: false,
        message: 'A valid product slug could not be generated',
      });
    }

    const uniqueSlug = await ensureUniqueProductSlug(
      baseSlug,
      existingProduct.website_id,
      existingProduct.id
    );

    let validatedBuyUrl = existingProduct.affiliate_buy_url;

    if (affiliate_buy_url !== undefined) {
      if (affiliate_buy_url === null || String(affiliate_buy_url).trim() === '') {
        validatedBuyUrl = null;
      } else {
        const result = await assertAndLogSupgadUrl({
          value: affiliate_buy_url,
          fieldName: 'Affiliate Buy URL',
          required: true,
          allowEmpty: false,
          userId,
          websiteId: existingProduct.website_id,
          sourceType: 'product',
          sourceId: existingProduct.id,
        });

        validatedBuyUrl = result.normalized_url || result.submitted_link;
      }
    }

    const cleanHomepageCtaLabel =
      homepage_cta_label !== undefined
        ? normalizeNullable(homepage_cta_label) || 'Buy Now'
        : existingProduct.homepage_cta_label;

    const cleanStorefrontCtaLabel =
      storefront_cta_label !== undefined
        ? normalizeNullable(storefront_cta_label) || 'Read More'
        : existingProduct.storefront_cta_label;

    const cleanShortDescription =
      short_description !== undefined
        ? normalizeNullable(short_description)
        : existingProduct.short_description;

    const cleanStatus = ['draft', 'published', 'inactive'].includes(status)
      ? status
      : existingProduct.status;

    await pool.query(
      `
      UPDATE products
      SET
        category_id = ?,
        title = ?,
        slug = ?,
        product_image = ?,
        media_id = ?,
        pricing_type = ?,
        price = ?,
        min_price = ?,
        max_price = ?,
        homepage_cta_label = ?,
        storefront_cta_label = ?,
        affiliate_buy_url = ?,
        short_description = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
        AND user_id = ?
      `,
      [
        cleanCategoryId,
        cleanTitle,
        uniqueSlug,
        cleanProductImage,
        media_id !== undefined ? media_id || null : existingProduct.media_id,
        cleanPricingType,
        cleanPricingType === 'simple' ? cleanPrice : null,
        cleanPricingType === 'variable' ? cleanMinPrice : null,
        cleanPricingType === 'variable' ? cleanMaxPrice : null,
        cleanHomepageCtaLabel,
        cleanStorefrontCtaLabel,
        validatedBuyUrl,
        cleanShortDescription,
        cleanStatus,
        existingProduct.id,
        userId,
      ]
    );

    const updatedProduct = await getOwnedProductById(existingProduct.id, userId);

    return res.status(200).json({
      ok: true,
      message: 'Product updated successfully',
      product: sanitizeProduct(updatedProduct),
    });
  } catch (error) {
    console.error('updateProduct error:', error);

    return res.status(error.status || 500).json({
      ok: false,
      message: error.message || 'Failed to update product',
      error: error.status ? undefined : error.message,
    });
  }
}

async function updateProductStatus(req, res) {
  try {
    const userId = req.user.id;
    const productId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid product id',
      });
    }

    if (!['draft', 'published', 'inactive'].includes(status)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid product status',
      });
    }

    const existingProduct = await getOwnedProductById(productId, userId);

    if (!existingProduct) {
      return res.status(404).json({
        ok: false,
        message: 'Product not found',
      });
    }

    await pool.query(
      `
      UPDATE products
      SET
        status = ?,
        updated_at = NOW()
      WHERE id = ?
        AND user_id = ?
      `,
      [status, productId, userId]
    );

    const updatedProduct = await getOwnedProductById(productId, userId);

    return res.status(200).json({
      ok: true,
      message: 'Product status updated successfully',
      product: sanitizeProduct(updatedProduct),
    });
  } catch (error) {
    console.error('updateProductStatus error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update product status',
      error: error.message,
    });
  }
}

async function deleteProduct(req, res) {
  try {
    const userId = req.user.id;
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid product id',
      });
    }

    const existingProduct = await getOwnedProductById(productId, userId);

    if (!existingProduct) {
      return res.status(404).json({
        ok: false,
        message: 'Product not found',
      });
    }

    await pool.query(
      `
      DELETE FROM products
      WHERE id = ?
        AND user_id = ?
      `,
      [productId, userId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('deleteProduct error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to delete product',
      error: error.message,
    });
  }
}

module.exports = {
  getMyProducts,
  getMyProductById,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
};