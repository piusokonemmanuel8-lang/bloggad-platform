const pool = require('../../config/db');

function sanitizeWebsite(row) {
  if (!row) return null;

  return {
    id: row.id,
    user_id: row.user_id,
    website_name: row.website_name,
    slug: row.slug,
    custom_domain: row.custom_domain,
    logo: row.logo,
    banner: row.banner,
    meta_title: row.meta_title,
    meta_description: row.meta_description,
    homepage_template: row.homepage_template,
    header_style: row.header_style,
    footer_style: row.footer_style,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    owner: {
      id: row.owner_id,
      name: row.owner_name,
      email: row.owner_email,
    },
  };
}

function sanitizeProduct(row) {
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    product_image: row.product_image,
    pricing_type: row.pricing_type,
    price: row.price !== null ? Number(row.price) : null,
    min_price: row.min_price !== null ? Number(row.min_price) : null,
    max_price: row.max_price !== null ? Number(row.max_price) : null,
    homepage_cta_label: row.homepage_cta_label,
    storefront_cta_label: row.storefront_cta_label,
    short_description: row.short_description,
    status: row.status,
    website_slug: row.website_slug,
    website_url: `/${row.website_slug}`,
    affiliate_buy_url: row.affiliate_buy_url || null,
    review_url: row.post_slug ? `/${row.website_slug}/post/${row.post_slug}` : null,
    badge: null,
    category: row.category_id
      ? {
          id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
        }
      : null,
    affiliate: {
      website_name: row.website_name || null,
      website_slug: row.website_slug || null,
      name: row.owner_name || null,
    },
    read_more_url: row.post_slug ? `/${row.website_slug}/post/${row.post_slug}` : '#',
  };
}

function sanitizeSlider(row) {
  if (!row) return null;

  return {
    id: row.id,
    image: row.image,
    title: row.title,
    subtitle: row.subtitle,
    link_type: row.link_type,
    external_url: row.external_url,
    sort_order: row.sort_order,
    status: row.status,
    linked_post: row.linked_post_id
      ? {
          id: row.linked_post_id,
          title: row.post_title,
          slug: row.post_slug,
          url: `/${row.website_slug}/post/${row.post_slug}`,
        }
      : null,
    linked_product: row.linked_product_id
      ? {
          id: row.linked_product_id,
          title: row.product_title,
          slug: row.product_slug,
          url: row.product_post_slug
            ? `/${row.website_slug}/post/${row.product_post_slug}`
            : null,
        }
      : null,
  };
}

function sanitizeCategory(row, websiteSlug) {
  if (!row) return null;

  return {
    id: row.category_id,
    name: row.category_name,
    slug: row.category_slug,
    total_products: Number(row.total_products || 0),
    url: `/${websiteSlug}/category/${row.category_slug}`,
  };
}

function sanitizeMenu(row) {
  if (!row) return null;

  return {
    id: row.menu_id,
    name: row.menu_name,
    location: row.menu_location,
    items: [],
  };
}

function sanitizeMenuItem(row, websiteSlug) {
  let resolvedUrl = null;

  if (row.item_type === 'home') {
    resolvedUrl = `/${websiteSlug}`;
  } else if (row.item_type === 'category' && row.category_slug) {
    resolvedUrl = `/${websiteSlug}/category/${row.category_slug}`;
  } else if (row.item_type === 'custom') {
    resolvedUrl = row.custom_url;
  }

  return {
    id: row.item_id,
    label: row.item_label,
    type: row.item_type,
    linked_category_id: row.linked_category_id,
    custom_url: row.custom_url,
    sort_order: row.item_sort_order,
    resolved_url: resolvedUrl,
    category: row.linked_category_id
      ? {
          id: row.linked_category_id,
          name: row.category_name,
          slug: row.category_slug,
        }
      : null,
  };
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

async function getWebsiteBySlug(websiteSlug) {
  const [rows] = await pool.query(
    `
    SELECT
      aw.id,
      aw.user_id,
      aw.website_name,
      aw.slug,
      aw.custom_domain,
      aw.logo,
      aw.banner,
      aw.meta_title,
      aw.meta_description,
      aw.homepage_template,
      aw.header_style,
      aw.footer_style,
      aw.status,
      aw.created_at,
      aw.updated_at,
      u.id AS owner_id,
      u.name AS owner_name,
      u.email AS owner_email
    FROM affiliate_websites aw
    INNER JOIN users u
      ON u.id = aw.user_id
     AND u.role = 'affiliate'
     AND u.status = 'active'
    WHERE aw.slug = ?
      AND aw.status = 'active'
    LIMIT 1
    `,
    [websiteSlug]
  );

  return rows[0] || null;
}

async function getWebsiteProducts(websiteId, websiteSlug, limit = 24) {
  const [rows] = await pool.query(
    `
    SELECT
      p.id,
      p.title,
      p.slug,
      p.product_image,
      p.pricing_type,
      p.price,
      p.min_price,
      p.max_price,
      p.homepage_cta_label,
      p.storefront_cta_label,
      p.short_description,
      p.status,
      p.affiliate_buy_url,
      c.id AS category_id,
      c.name AS category_name,
      c.slug AS category_slug,
      ? AS website_slug,
      aw.website_name,
      u.name AS owner_name,
      (
        SELECT pp.slug
        FROM product_posts pp
        WHERE pp.website_id = p.website_id
          AND pp.product_id = p.id
          AND pp.status = 'published'
        ORDER BY pp.published_at DESC, pp.id DESC
        LIMIT 1
      ) AS post_slug
    FROM products p
    INNER JOIN affiliate_websites aw
      ON aw.id = p.website_id
    INNER JOIN users u
      ON u.id = aw.user_id
    LEFT JOIN categories c
      ON c.id = p.category_id
     AND c.status = 'active'
    WHERE p.website_id = ?
      AND p.status = 'published'
    ORDER BY p.id DESC
    LIMIT ?
    `,
    [websiteSlug, websiteId, limit]
  );

  return rows.map(sanitizeProduct);
}

async function getWebsiteSliders(websiteId, websiteSlug) {
  const [rows] = await pool.query(
    `
    SELECT
      ws.id,
      ws.image,
      ws.title,
      ws.subtitle,
      ws.link_type,
      ws.linked_post_id,
      ws.linked_product_id,
      ws.external_url,
      ws.sort_order,
      ws.status,
      pp.title AS post_title,
      pp.slug AS post_slug,
      p.title AS product_title,
      p.slug AS product_slug,
      (
        SELECT ppx.slug
        FROM product_posts ppx
        WHERE ppx.website_id = ws.website_id
          AND ppx.product_id = ws.linked_product_id
          AND ppx.status = 'published'
        ORDER BY ppx.published_at DESC, ppx.id DESC
        LIMIT 1
      ) AS product_post_slug,
      ? AS website_slug
    FROM website_sliders ws
    LEFT JOIN product_posts pp
      ON pp.id = ws.linked_post_id
     AND pp.status = 'published'
    LEFT JOIN products p
      ON p.id = ws.linked_product_id
     AND p.status = 'published'
    WHERE ws.website_id = ?
      AND ws.status = 'active'
    ORDER BY ws.sort_order ASC, ws.id DESC
    `,
    [websiteSlug, websiteId]
  );

  return rows.map(sanitizeSlider);
}

async function getWebsiteUsedCategories(websiteId, websiteSlug) {
  const [rows] = await pool.query(
    `
    SELECT
      c.id AS category_id,
      c.name AS category_name,
      c.slug AS category_slug,
      COUNT(p.id) AS total_products
    FROM categories c
    INNER JOIN products p
      ON p.category_id = c.id
     AND p.website_id = ?
     AND p.status = 'published'
    WHERE c.status = 'active'
    GROUP BY c.id, c.name, c.slug
    ORDER BY c.name ASC
    `,
    [websiteId]
  );

  return rows.map((row) => sanitizeCategory(row, websiteSlug));
}

async function getWebsiteMenus(websiteId, websiteSlug) {
  const [rows] = await pool.query(
    `
    SELECT
      wm.id AS menu_id,
      wm.name AS menu_name,
      wm.location AS menu_location,
      wmi.id AS item_id,
      wmi.label AS item_label,
      wmi.type AS item_type,
      wmi.linked_category_id,
      wmi.custom_url,
      wmi.sort_order AS item_sort_order,
      c.name AS category_name,
      c.slug AS category_slug
    FROM website_menus wm
    LEFT JOIN website_menu_items wmi
      ON wmi.menu_id = wm.id
    LEFT JOIN categories c
      ON c.id = wmi.linked_category_id
    WHERE wm.website_id = ?
    ORDER BY wm.id ASC, wmi.sort_order ASC, wmi.id ASC
    `,
    [websiteId]
  );

  const menuMap = new Map();

  for (const row of rows) {
    if (!menuMap.has(row.menu_id)) {
      menuMap.set(row.menu_id, sanitizeMenu(row));
    }

    if (row.item_id) {
      menuMap.get(row.menu_id).items.push(sanitizeMenuItem(row, websiteSlug));
    }
  }

  return Array.from(menuMap.values());
}

async function getWebsiteDesignSettings(websiteId) {
  const [rows] = await pool.query(
    `
    SELECT
      wds.id,
      wds.website_id,
      wds.website_template_id,
      wds.header_layout,
      wds.footer_layout,
      wds.mobile_menu_style,
      wds.color_scheme,
      wds.primary_color,
      wds.secondary_color,
      wds.accent_color,
      wds.font_family,
      wds.button_style,
      wds.card_style,
      wds.show_search,
      wds.show_categories_menu,
      wds.show_featured_slider,
      wds.custom_css,
      wds.template_settings_json,
      wt.name AS template_name,
      wt.slug AS template_slug,
      wt.template_code_key,
      wt.preview_image,
      wt.is_premium,
      wt.status AS template_status
    FROM website_design_settings wds
    LEFT JOIN website_templates wt
      ON wt.id = wds.website_template_id
    WHERE wds.website_id = ?
    LIMIT 1
    `,
    [websiteId]
  );

  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    website_id: row.website_id,
    website_template_id: row.website_template_id,
    header_layout: row.header_layout,
    footer_layout: row.footer_layout,
    mobile_menu_style: row.mobile_menu_style,
    color_scheme: row.color_scheme,
    primary_color: row.primary_color,
    secondary_color: row.secondary_color,
    accent_color: row.accent_color,
    font_family: row.font_family,
    button_style: row.button_style,
    card_style: row.card_style,
    show_search: !!row.show_search,
    show_categories_menu: !!row.show_categories_menu,
    show_featured_slider: !!row.show_featured_slider,
    custom_css: row.custom_css,
    template_settings_json: parseJsonSafe(row.template_settings_json, {}),
    template: row.website_template_id
      ? {
          id: row.website_template_id,
          name: row.template_name,
          slug: row.template_slug,
          template_code_key: row.template_code_key,
          preview_image: row.preview_image || null,
          is_premium: !!row.is_premium,
          status: row.template_status || null,
        }
      : null,
  };
}

function buildTemplateSettings(designSettings) {
  const cardStyle = String(designSettings?.card_style || '').toLowerCase();
  const showCategoriesMenu = !!designSettings?.show_categories_menu;
  const showFeaturedSlider = !!designSettings?.show_featured_slider;

  return {
    allow_product_quick_view: cardStyle !== 'basic_no_popup',
    offers_per_row: cardStyle === 'compact' ? 5 : 4,
    offers_limit: cardStyle === 'compact' ? 10 : 8,
    categories_per_row: showCategoriesMenu ? 4 : 6,
    categories_limit: showCategoriesMenu ? 8 : 6,
    articles_per_row: 4,
    articles_limit: 4,
    product_image_fit: 'cover',
    product_image_ratio: '4 / 4',
    show_search: !!designSettings?.show_search,
    show_categories_menu: showCategoriesMenu,
    show_featured_slider: showFeaturedSlider,
    header_layout: designSettings?.header_layout || null,
    footer_layout: designSettings?.footer_layout || null,
    color_scheme: designSettings?.color_scheme || null,
    primary_color: designSettings?.primary_color || null,
    secondary_color: designSettings?.secondary_color || null,
    accent_color: designSettings?.accent_color || null,
    font_family: designSettings?.font_family || null,
    button_style: designSettings?.button_style || null,
    card_style: designSettings?.card_style || null,
    mobile_menu_style: designSettings?.mobile_menu_style || null,
    custom_css: designSettings?.custom_css || null,
    template_settings_json: parseJsonSafe(designSettings?.template_settings_json, {}),
  };
}

async function getPublicWebsite(req, res) {
  try {
    const websiteSlug = String(req.params.websiteSlug || '').trim().toLowerCase();

    if (!websiteSlug) {
      return res.status(400).json({
        ok: false,
        message: 'Website slug is required',
      });
    }

    const website = await getWebsiteBySlug(websiteSlug);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Website not found',
      });
    }

    const [products, sliders, categories, menus, design_settings] = await Promise.all([
      getWebsiteProducts(website.id, website.slug),
      getWebsiteSliders(website.id, website.slug),
      getWebsiteUsedCategories(website.id, website.slug),
      getWebsiteMenus(website.id, website.slug),
      getWebsiteDesignSettings(website.id),
    ]);

    const sanitizedWebsite = sanitizeWebsite(website);
    const template = design_settings?.template || null;
    const template_settings = buildTemplateSettings(design_settings);

    return res.status(200).json({
      ok: true,
      website: {
        ...sanitizedWebsite,
        template_code_key:
          template?.template_code_key ||
          sanitizedWebsite.homepage_template ||
          'free_simple',
        selected_template_code_key:
          template?.template_code_key ||
          sanitizedWebsite.homepage_template ||
          'free_simple',
        template,
        template_settings,
        template_settings_json: design_settings?.template_settings_json || {},
      },
      design_settings,
      template,
      template_settings,
      template_settings_json: design_settings?.template_settings_json || {},
      sliders,
      menus,
      categories,
      products,
    });
  } catch (error) {
    console.error('getPublicWebsite error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch website',
      error: error.message,
    });
  }
}

async function getPublicWebsiteCategories(req, res) {
  try {
    const websiteSlug = String(req.params.websiteSlug || '').trim().toLowerCase();

    const website = await getWebsiteBySlug(websiteSlug);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Website not found',
      });
    }

    const categories = await getWebsiteUsedCategories(website.id, website.slug);

    return res.status(200).json({
      ok: true,
      website: {
        id: website.id,
        website_name: website.website_name,
        slug: website.slug,
      },
      categories,
    });
  } catch (error) {
    console.error('getPublicWebsiteCategories error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch website categories',
      error: error.message,
    });
  }
}

async function getPublicWebsiteMenus(req, res) {
  try {
    const websiteSlug = String(req.params.websiteSlug || '').trim().toLowerCase();

    const website = await getWebsiteBySlug(websiteSlug);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Website not found',
      });
    }

    const menus = await getWebsiteMenus(website.id, website.slug);

    return res.status(200).json({
      ok: true,
      website: {
        id: website.id,
        website_name: website.website_name,
        slug: website.slug,
      },
      menus,
    });
  } catch (error) {
    console.error('getPublicWebsiteMenus error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch website menus',
      error: error.message,
    });
  }
}

module.exports = {
  getPublicWebsite,
  getPublicWebsiteCategories,
  getPublicWebsiteMenus,
};