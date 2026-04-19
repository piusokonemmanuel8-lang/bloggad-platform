const slugify = require('slugify');
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
  };
}

function makeWebsiteSlug(value) {
  return slugify(String(value || '').trim(), {
    lower: true,
    strict: true,
    trim: true,
  });
}

async function getWebsiteByUserId(userId) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      user_id,
      website_name,
      slug,
      custom_domain,
      logo,
      banner,
      meta_title,
      meta_description,
      homepage_template,
      header_style,
      footer_style,
      status,
      created_at,
      updated_at
    FROM affiliate_websites
    WHERE user_id = ?
    LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}

async function ensureUniqueSlug(baseSlug, userId, currentWebsiteId = null) {
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const params = [candidate, userId];
    let sql = `
      SELECT id
      FROM affiliate_websites
      WHERE slug = ?
        AND user_id <> ?
    `;

    if (currentWebsiteId) {
      sql += ` AND id <> ?`;
      params.push(currentWebsiteId);
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

async function createOrUpdateAffiliateWebsite(req, res) {
  try {
    const userId = req.user.id;
    const {
      website_name,
      slug,
      custom_domain,
      meta_title,
      meta_description,
      homepage_template,
      header_style,
      footer_style,
      status,
    } = req.body;

    if (!website_name || !String(website_name).trim()) {
      return res.status(400).json({
        ok: false,
        message: 'Website name is required',
      });
    }

    const cleanWebsiteName = String(website_name).trim();
    const desiredSlug = String(slug || cleanWebsiteName).trim();
    const baseSlug = makeWebsiteSlug(desiredSlug);

    if (!baseSlug) {
      return res.status(400).json({
        ok: false,
        message: 'A valid website slug could not be generated',
      });
    }

    const existingWebsite = await getWebsiteByUserId(userId);
    const uniqueSlug = await ensureUniqueSlug(
      baseSlug,
      userId,
      existingWebsite ? existingWebsite.id : null
    );

    const cleanStatus = ['draft', 'active', 'inactive', 'suspended'].includes(status)
      ? status
      : existingWebsite?.status || 'draft';

    if (!existingWebsite) {
      const [result] = await pool.query(
        `
        INSERT INTO affiliate_websites
        (
          user_id,
          website_name,
          slug,
          custom_domain,
          meta_title,
          meta_description,
          homepage_template,
          header_style,
          footer_style,
          status,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [
          userId,
          cleanWebsiteName,
          uniqueSlug,
          custom_domain || null,
          meta_title || null,
          meta_description || null,
          homepage_template || null,
          header_style || null,
          footer_style || null,
          cleanStatus,
        ]
      );

      const [rows] = await pool.query(
        `
        SELECT
          id,
          user_id,
          website_name,
          slug,
          custom_domain,
          logo,
          banner,
          meta_title,
          meta_description,
          homepage_template,
          header_style,
          footer_style,
          status,
          created_at,
          updated_at
        FROM affiliate_websites
        WHERE id = ?
        LIMIT 1
        `,
        [result.insertId]
      );

      return res.status(201).json({
        ok: true,
        message: 'Affiliate website created successfully',
        website: sanitizeWebsite(rows[0]),
      });
    }

    await pool.query(
      `
      UPDATE affiliate_websites
      SET
        website_name = ?,
        slug = ?,
        custom_domain = ?,
        meta_title = ?,
        meta_description = ?,
        homepage_template = ?,
        header_style = ?,
        footer_style = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        cleanWebsiteName,
        uniqueSlug,
        custom_domain || null,
        meta_title || null,
        meta_description || null,
        homepage_template || null,
        header_style || null,
        footer_style || null,
        cleanStatus,
        existingWebsite.id,
      ]
    );

    const updatedWebsite = await getWebsiteByUserId(userId);

    return res.status(200).json({
      ok: true,
      message: 'Affiliate website updated successfully',
      website: sanitizeWebsite(updatedWebsite),
    });
  } catch (error) {
    console.error('createOrUpdateAffiliateWebsite error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to save affiliate website',
      error: error.message,
    });
  }
}

async function getMyAffiliateWebsite(req, res) {
  try {
    const website = await getWebsiteByUserId(req.user.id);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate website not found',
      });
    }

    return res.status(200).json({
      ok: true,
      website: sanitizeWebsite(website),
    });
  } catch (error) {
    console.error('getMyAffiliateWebsite error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch affiliate website',
      error: error.message,
    });
  }
}

async function getMyAffiliateWebsitePublicPreview(req, res) {
  try {
    const website = await getWebsiteByUserId(req.user.id);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate website not found',
      });
    }

    return res.status(200).json({
      ok: true,
      preview: {
        website: sanitizeWebsite(website),
        public_url: `/${website.slug}`,
      },
    });
  } catch (error) {
    console.error('getMyAffiliateWebsitePublicPreview error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch website preview',
      error: error.message,
    });
  }
}

async function updateAffiliateWebsiteBranding(req, res) {
  try {
    const userId = req.user.id;
    const { logo, banner, homepage_template, header_style, footer_style } = req.body;

    const website = await getWebsiteByUserId(userId);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate website not found',
      });
    }

    await pool.query(
      `
      UPDATE affiliate_websites
      SET
        logo = ?,
        banner = ?,
        homepage_template = ?,
        header_style = ?,
        footer_style = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        logo ?? website.logo,
        banner ?? website.banner,
        homepage_template ?? website.homepage_template,
        header_style ?? website.header_style,
        footer_style ?? website.footer_style,
        website.id,
      ]
    );

    const updatedWebsite = await getWebsiteByUserId(userId);

    return res.status(200).json({
      ok: true,
      message: 'Website branding updated successfully',
      website: sanitizeWebsite(updatedWebsite),
    });
  } catch (error) {
    console.error('updateAffiliateWebsiteBranding error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update website branding',
      error: error.message,
    });
  }
}

async function updateAffiliateWebsiteSeo(req, res) {
  try {
    const userId = req.user.id;
    const { meta_title, meta_description, custom_domain } = req.body;

    const website = await getWebsiteByUserId(userId);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate website not found',
      });
    }

    await pool.query(
      `
      UPDATE affiliate_websites
      SET
        meta_title = ?,
        meta_description = ?,
        custom_domain = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        meta_title ?? website.meta_title,
        meta_description ?? website.meta_description,
        custom_domain ?? website.custom_domain,
        website.id,
      ]
    );

    const updatedWebsite = await getWebsiteByUserId(userId);

    return res.status(200).json({
      ok: true,
      message: 'Website SEO updated successfully',
      website: sanitizeWebsite(updatedWebsite),
    });
  } catch (error) {
    console.error('updateAffiliateWebsiteSeo error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update website SEO',
      error: error.message,
    });
  }
}

async function updateAffiliateWebsiteStatus(req, res) {
  try {
    const userId = req.user.id;
    const { status } = req.body;

    if (!['draft', 'active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid website status',
      });
    }

    const website = await getWebsiteByUserId(userId);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate website not found',
      });
    }

    await pool.query(
      `
      UPDATE affiliate_websites
      SET
        status = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [status, website.id]
    );

    const updatedWebsite = await getWebsiteByUserId(userId);

    return res.status(200).json({
      ok: true,
      message: 'Website status updated successfully',
      website: sanitizeWebsite(updatedWebsite),
    });
  } catch (error) {
    console.error('updateAffiliateWebsiteStatus error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update website status',
      error: error.message,
    });
  }
}

module.exports = {
  createOrUpdateAffiliateWebsite,
  getMyAffiliateWebsite,
  getMyAffiliateWebsitePublicPreview,
  updateAffiliateWebsiteBranding,
  updateAffiliateWebsiteSeo,
  updateAffiliateWebsiteStatus,
};