const pool = require('../../config/db');

function sanitizeWebsiteTemplate(row) {
  if (!row) return null;

  return {
    id: row.id,
    type: 'website',
    name: row.name,
    slug: row.slug,
    preview_image: row.preview_image,
    template_code_key: row.template_code_key,
    description: row.description,
    is_premium: !!row.is_premium,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function sanitizeBlogTemplate(row) {
  if (!row) return null;

  return {
    id: row.id,
    type: 'blog',
    name: row.name,
    slug: row.slug,
    preview_image: row.preview_image,
    template_code_key: row.template_code_key,
    description: row.description,
    is_premium: !!row.is_premium,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeNullable(value) {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str ? str : null;
}

async function getWebsiteTemplateById(templateId) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      slug,
      preview_image,
      template_code_key,
      description,
      is_premium,
      status,
      created_at,
      updated_at
    FROM website_templates
    WHERE id = ?
    LIMIT 1
    `,
    [templateId]
  );

  return rows[0] || null;
}

async function getBlogTemplateById(templateId) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      slug,
      preview_image,
      template_code_key,
      description,
      is_premium,
      status,
      created_at,
      updated_at
    FROM blog_templates
    WHERE id = ?
    LIMIT 1
    `,
    [templateId]
  );

  return rows[0] || null;
}

async function getAllTemplates(req, res) {
  try {
    const [websiteRows] = await pool.query(
      `
      SELECT
        id,
        name,
        slug,
        preview_image,
        template_code_key,
        description,
        is_premium,
        status,
        created_at,
        updated_at
      FROM website_templates
      ORDER BY id DESC
      `
    );

    const [blogRows] = await pool.query(
      `
      SELECT
        id,
        name,
        slug,
        preview_image,
        template_code_key,
        description,
        is_premium,
        status,
        created_at,
        updated_at
      FROM blog_templates
      ORDER BY id DESC
      `
    );

    return res.status(200).json({
      ok: true,
      website_templates: websiteRows.map(sanitizeWebsiteTemplate),
      blog_templates: blogRows.map(sanitizeBlogTemplate),
    });
  } catch (error) {
    console.error('getAllTemplates error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch templates',
      error: error.message,
    });
  }
}

async function getWebsiteTemplates(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        id,
        name,
        slug,
        preview_image,
        template_code_key,
        description,
        is_premium,
        status,
        created_at,
        updated_at
      FROM website_templates
      ORDER BY id DESC
      `
    );

    return res.status(200).json({
      ok: true,
      templates: rows.map(sanitizeWebsiteTemplate),
    });
  } catch (error) {
    console.error('getWebsiteTemplates error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch website templates',
      error: error.message,
    });
  }
}

async function getBlogTemplates(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        id,
        name,
        slug,
        preview_image,
        template_code_key,
        description,
        is_premium,
        status,
        created_at,
        updated_at
      FROM blog_templates
      ORDER BY id DESC
      `
    );

    return res.status(200).json({
      ok: true,
      templates: rows.map(sanitizeBlogTemplate),
    });
  } catch (error) {
    console.error('getBlogTemplates error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch blog templates',
      error: error.message,
    });
  }
}

async function getSingleWebsiteTemplate(req, res) {
  try {
    const templateId = Number(req.params.id);

    if (!Number.isInteger(templateId) || templateId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid website template id',
      });
    }

    const template = await getWebsiteTemplateById(templateId);

    if (!template) {
      return res.status(404).json({
        ok: false,
        message: 'Website template not found',
      });
    }

    return res.status(200).json({
      ok: true,
      template: sanitizeWebsiteTemplate(template),
    });
  } catch (error) {
    console.error('getSingleWebsiteTemplate error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch website template',
      error: error.message,
    });
  }
}

async function getSingleBlogTemplate(req, res) {
  try {
    const templateId = Number(req.params.id);

    if (!Number.isInteger(templateId) || templateId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid blog template id',
      });
    }

    const template = await getBlogTemplateById(templateId);

    if (!template) {
      return res.status(404).json({
        ok: false,
        message: 'Blog template not found',
      });
    }

    return res.status(200).json({
      ok: true,
      template: sanitizeBlogTemplate(template),
    });
  } catch (error) {
    console.error('getSingleBlogTemplate error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch blog template',
      error: error.message,
    });
  }
}

async function createWebsiteTemplate(req, res) {
  try {
    const {
      name,
      slug,
      preview_image,
      template_code_key,
      description,
      is_premium,
      status,
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        ok: false,
        message: 'Website template name is required',
      });
    }

    if (!slug || !String(slug).trim()) {
      return res.status(400).json({
        ok: false,
        message: 'Website template slug is required',
      });
    }

    if (!template_code_key || !String(template_code_key).trim()) {
      return res.status(400).json({
        ok: false,
        message: 'Website template code key is required',
      });
    }

    const cleanName = String(name).trim();
    const cleanSlug = String(slug).trim();
    const cleanTemplateCodeKey = String(template_code_key).trim();
    const cleanPreviewImage = normalizeNullable(preview_image);
    const cleanDescription = normalizeNullable(description);
    const cleanIsPremium = is_premium ? 1 : 0;
    const cleanStatus = ['active', 'inactive'].includes(status) ? status : 'active';

    const [result] = await pool.query(
      `
      INSERT INTO website_templates
      (
        name,
        slug,
        preview_image,
        template_code_key,
        description,
        is_premium,
        status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        cleanName,
        cleanSlug,
        cleanPreviewImage,
        cleanTemplateCodeKey,
        cleanDescription,
        cleanIsPremium,
        cleanStatus,
      ]
    );

    const template = await getWebsiteTemplateById(result.insertId);

    return res.status(201).json({
      ok: true,
      message: 'Website template created successfully',
      template: sanitizeWebsiteTemplate(template),
    });
  } catch (error) {
    console.error('createWebsiteTemplate error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to create website template',
      error: error.message,
    });
  }
}

async function createBlogTemplate(req, res) {
  try {
    const {
      name,
      slug,
      preview_image,
      template_code_key,
      description,
      is_premium,
      status,
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        ok: false,
        message: 'Blog template name is required',
      });
    }

    if (!slug || !String(slug).trim()) {
      return res.status(400).json({
        ok: false,
        message: 'Blog template slug is required',
      });
    }

    if (!template_code_key || !String(template_code_key).trim()) {
      return res.status(400).json({
        ok: false,
        message: 'Blog template code key is required',
      });
    }

    const cleanName = String(name).trim();
    const cleanSlug = String(slug).trim();
    const cleanTemplateCodeKey = String(template_code_key).trim();
    const cleanPreviewImage = normalizeNullable(preview_image);
    const cleanDescription = normalizeNullable(description);
    const cleanIsPremium = is_premium ? 1 : 0;
    const cleanStatus = ['active', 'inactive'].includes(status) ? status : 'active';

    const [result] = await pool.query(
      `
      INSERT INTO blog_templates
      (
        name,
        slug,
        preview_image,
        template_code_key,
        description,
        is_premium,
        status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        cleanName,
        cleanSlug,
        cleanPreviewImage,
        cleanTemplateCodeKey,
        cleanDescription,
        cleanIsPremium,
        cleanStatus,
      ]
    );

    const template = await getBlogTemplateById(result.insertId);

    return res.status(201).json({
      ok: true,
      message: 'Blog template created successfully',
      template: sanitizeBlogTemplate(template),
    });
  } catch (error) {
    console.error('createBlogTemplate error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to create blog template',
      error: error.message,
    });
  }
}

async function updateWebsiteTemplate(req, res) {
  try {
    const templateId = Number(req.params.id);

    if (!Number.isInteger(templateId) || templateId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid website template id',
      });
    }

    const existingTemplate = await getWebsiteTemplateById(templateId);

    if (!existingTemplate) {
      return res.status(404).json({
        ok: false,
        message: 'Website template not found',
      });
    }

    const {
      name,
      slug,
      preview_image,
      template_code_key,
      description,
      is_premium,
      status,
    } = req.body;

    const cleanName = name !== undefined ? String(name).trim() : existingTemplate.name;
    const cleanSlug = slug !== undefined ? String(slug).trim() : existingTemplate.slug;
    const cleanTemplateCodeKey =
      template_code_key !== undefined
        ? String(template_code_key).trim()
        : existingTemplate.template_code_key;

    if (!cleanName || !cleanSlug || !cleanTemplateCodeKey) {
      return res.status(400).json({
        ok: false,
        message: 'Name, slug, and template code key are required',
      });
    }

    const cleanPreviewImage =
      preview_image !== undefined ? normalizeNullable(preview_image) : existingTemplate.preview_image;
    const cleanDescription =
      description !== undefined ? normalizeNullable(description) : existingTemplate.description;
    const cleanIsPremium =
      is_premium !== undefined ? (is_premium ? 1 : 0) : Number(existingTemplate.is_premium);
    const cleanStatus =
      ['active', 'inactive'].includes(status) ? status : existingTemplate.status;

    await pool.query(
      `
      UPDATE website_templates
      SET
        name = ?,
        slug = ?,
        preview_image = ?,
        template_code_key = ?,
        description = ?,
        is_premium = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        cleanName,
        cleanSlug,
        cleanPreviewImage,
        cleanTemplateCodeKey,
        cleanDescription,
        cleanIsPremium,
        cleanStatus,
        templateId,
      ]
    );

    const template = await getWebsiteTemplateById(templateId);

    return res.status(200).json({
      ok: true,
      message: 'Website template updated successfully',
      template: sanitizeWebsiteTemplate(template),
    });
  } catch (error) {
    console.error('updateWebsiteTemplate error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update website template',
      error: error.message,
    });
  }
}

async function updateBlogTemplate(req, res) {
  try {
    const templateId = Number(req.params.id);

    if (!Number.isInteger(templateId) || templateId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid blog template id',
      });
    }

    const existingTemplate = await getBlogTemplateById(templateId);

    if (!existingTemplate) {
      return res.status(404).json({
        ok: false,
        message: 'Blog template not found',
      });
    }

    const {
      name,
      slug,
      preview_image,
      template_code_key,
      description,
      is_premium,
      status,
    } = req.body;

    const cleanName = name !== undefined ? String(name).trim() : existingTemplate.name;
    const cleanSlug = slug !== undefined ? String(slug).trim() : existingTemplate.slug;
    const cleanTemplateCodeKey =
      template_code_key !== undefined
        ? String(template_code_key).trim()
        : existingTemplate.template_code_key;

    if (!cleanName || !cleanSlug || !cleanTemplateCodeKey) {
      return res.status(400).json({
        ok: false,
        message: 'Name, slug, and template code key are required',
      });
    }

    const cleanPreviewImage =
      preview_image !== undefined ? normalizeNullable(preview_image) : existingTemplate.preview_image;
    const cleanDescription =
      description !== undefined ? normalizeNullable(description) : existingTemplate.description;
    const cleanIsPremium =
      is_premium !== undefined ? (is_premium ? 1 : 0) : Number(existingTemplate.is_premium);
    const cleanStatus =
      ['active', 'inactive'].includes(status) ? status : existingTemplate.status;

    await pool.query(
      `
      UPDATE blog_templates
      SET
        name = ?,
        slug = ?,
        preview_image = ?,
        template_code_key = ?,
        description = ?,
        is_premium = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        cleanName,
        cleanSlug,
        cleanPreviewImage,
        cleanTemplateCodeKey,
        cleanDescription,
        cleanIsPremium,
        cleanStatus,
        templateId,
      ]
    );

    const template = await getBlogTemplateById(templateId);

    return res.status(200).json({
      ok: true,
      message: 'Blog template updated successfully',
      template: sanitizeBlogTemplate(template),
    });
  } catch (error) {
    console.error('updateBlogTemplate error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update blog template',
      error: error.message,
    });
  }
}

async function updateWebsiteTemplateStatus(req, res) {
  try {
    const templateId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(templateId) || templateId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid website template id',
      });
    }

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid website template status',
      });
    }

    const existingTemplate = await getWebsiteTemplateById(templateId);

    if (!existingTemplate) {
      return res.status(404).json({
        ok: false,
        message: 'Website template not found',
      });
    }

    await pool.query(
      `
      UPDATE website_templates
      SET
        status = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [status, templateId]
    );

    const template = await getWebsiteTemplateById(templateId);

    return res.status(200).json({
      ok: true,
      message: 'Website template status updated successfully',
      template: sanitizeWebsiteTemplate(template),
    });
  } catch (error) {
    console.error('updateWebsiteTemplateStatus error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update website template status',
      error: error.message,
    });
  }
}

async function updateBlogTemplateStatus(req, res) {
  try {
    const templateId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(templateId) || templateId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid blog template id',
      });
    }

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid blog template status',
      });
    }

    const existingTemplate = await getBlogTemplateById(templateId);

    if (!existingTemplate) {
      return res.status(404).json({
        ok: false,
        message: 'Blog template not found',
      });
    }

    await pool.query(
      `
      UPDATE blog_templates
      SET
        status = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [status, templateId]
    );

    const template = await getBlogTemplateById(templateId);

    return res.status(200).json({
      ok: true,
      message: 'Blog template status updated successfully',
      template: sanitizeBlogTemplate(template),
    });
  } catch (error) {
    console.error('updateBlogTemplateStatus error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update blog template status',
      error: error.message,
    });
  }
}

async function deleteWebsiteTemplate(req, res) {
  try {
    const templateId = Number(req.params.id);

    if (!Number.isInteger(templateId) || templateId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid website template id',
      });
    }

    const existingTemplate = await getWebsiteTemplateById(templateId);

    if (!existingTemplate) {
      return res.status(404).json({
        ok: false,
        message: 'Website template not found',
      });
    }

    await pool.query(
      `
      DELETE FROM website_templates
      WHERE id = ?
      `,
      [templateId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Website template deleted successfully',
    });
  } catch (error) {
    console.error('deleteWebsiteTemplate error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to delete website template',
      error: error.message,
    });
  }
}

async function deleteBlogTemplate(req, res) {
  try {
    const templateId = Number(req.params.id);

    if (!Number.isInteger(templateId) || templateId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid blog template id',
      });
    }

    const existingTemplate = await getBlogTemplateById(templateId);

    if (!existingTemplate) {
      return res.status(404).json({
        ok: false,
        message: 'Blog template not found',
      });
    }

    await pool.query(
      `
      DELETE FROM blog_templates
      WHERE id = ?
      `,
      [templateId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Blog template deleted successfully',
    });
  } catch (error) {
    console.error('deleteBlogTemplate error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to delete blog template',
      error: error.message,
    });
  }
}

module.exports = {
  getAllTemplates,
  getWebsiteTemplates,
  getBlogTemplates,
  getSingleWebsiteTemplate,
  getSingleBlogTemplate,
  createWebsiteTemplate,
  createBlogTemplate,
  updateWebsiteTemplate,
  updateBlogTemplate,
  updateWebsiteTemplateStatus,
  updateBlogTemplateStatus,
  deleteWebsiteTemplate,
  deleteBlogTemplate,
};