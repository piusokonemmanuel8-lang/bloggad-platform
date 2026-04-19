const slugify = require('slugify');
const pool = require('../../config/db');

function sanitizeCategory(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon,
    status: row.status,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
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

async function ensureUniqueCategorySlug(baseSlug, currentCategoryId = null) {
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const params = [candidate];
    let sql = `
      SELECT id
      FROM categories
      WHERE slug = ?
    `;

    if (currentCategoryId) {
      sql += ` AND id <> ?`;
      params.push(currentCategoryId);
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

async function getCategoryById(categoryId) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      slug,
      icon,
      status,
      sort_order,
      created_at,
      updated_at
    FROM categories
    WHERE id = ?
    LIMIT 1
    `,
    [categoryId]
  );

  return rows[0] || null;
}

async function getAllCategories(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        id,
        name,
        slug,
        icon,
        status,
        sort_order,
        created_at,
        updated_at
      FROM categories
      ORDER BY sort_order ASC, name ASC, id DESC
      `
    );

    return res.status(200).json({
      ok: true,
      categories: rows.map(sanitizeCategory),
    });
  } catch (error) {
    console.error('getAllCategories error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
}

async function getActiveCategories(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        id,
        name,
        slug,
        icon,
        status,
        sort_order,
        created_at,
        updated_at
      FROM categories
      WHERE status = 'active'
      ORDER BY sort_order ASC, name ASC, id DESC
      `
    );

    return res.status(200).json({
      ok: true,
      categories: rows.map(sanitizeCategory),
    });
  } catch (error) {
    console.error('getActiveCategories error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch active categories',
      error: error.message,
    });
  }
}

async function getSingleCategory(req, res) {
  try {
    const categoryId = Number(req.params.id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid category id',
      });
    }

    const category = await getCategoryById(categoryId);

    if (!category) {
      return res.status(404).json({
        ok: false,
        message: 'Category not found',
      });
    }

    return res.status(200).json({
      ok: true,
      category: sanitizeCategory(category),
    });
  } catch (error) {
    console.error('getSingleCategory error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch category',
      error: error.message,
    });
  }
}

async function createCategory(req, res) {
  try {
    const { name, slug, icon, status, sort_order } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        ok: false,
        message: 'Category name is required',
      });
    }

    const cleanName = String(name).trim();
    const desiredSlug = normalizeNullable(slug) || cleanName;
    const baseSlug = makeSlug(desiredSlug);

    if (!baseSlug) {
      return res.status(400).json({
        ok: false,
        message: 'A valid category slug could not be generated',
      });
    }

    const uniqueSlug = await ensureUniqueCategorySlug(baseSlug);
    const cleanStatus = ['active', 'inactive'].includes(status) ? status : 'active';
    const cleanSortOrder = Number.isInteger(Number(sort_order)) ? Number(sort_order) : 0;
    const cleanIcon = normalizeNullable(icon);

    const [result] = await pool.query(
      `
      INSERT INTO categories
      (
        name,
        slug,
        icon,
        status,
        sort_order,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [cleanName, uniqueSlug, cleanIcon, cleanStatus, cleanSortOrder]
    );

    const category = await getCategoryById(result.insertId);

    return res.status(201).json({
      ok: true,
      message: 'Category created successfully',
      category: sanitizeCategory(category),
    });
  } catch (error) {
    console.error('createCategory error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to create category',
      error: error.message,
    });
  }
}

async function updateCategory(req, res) {
  try {
    const categoryId = Number(req.params.id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid category id',
      });
    }

    const existingCategory = await getCategoryById(categoryId);

    if (!existingCategory) {
      return res.status(404).json({
        ok: false,
        message: 'Category not found',
      });
    }

    const { name, slug, icon, status, sort_order } = req.body;

    const cleanName = name !== undefined ? String(name).trim() : existingCategory.name;

    if (!cleanName) {
      return res.status(400).json({
        ok: false,
        message: 'Category name is required',
      });
    }

    const desiredSlug =
      slug !== undefined
        ? normalizeNullable(slug) || cleanName
        : existingCategory.slug;

    const baseSlug = makeSlug(desiredSlug);

    if (!baseSlug) {
      return res.status(400).json({
        ok: false,
        message: 'A valid category slug could not be generated',
      });
    }

    const uniqueSlug = await ensureUniqueCategorySlug(baseSlug, existingCategory.id);
    const cleanStatus = ['active', 'inactive'].includes(status)
      ? status
      : existingCategory.status;
    const cleanSortOrder =
      sort_order !== undefined && Number.isInteger(Number(sort_order))
        ? Number(sort_order)
        : existingCategory.sort_order;
    const cleanIcon = icon !== undefined ? normalizeNullable(icon) : existingCategory.icon;

    await pool.query(
      `
      UPDATE categories
      SET
        name = ?,
        slug = ?,
        icon = ?,
        status = ?,
        sort_order = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [cleanName, uniqueSlug, cleanIcon, cleanStatus, cleanSortOrder, existingCategory.id]
    );

    const updatedCategory = await getCategoryById(existingCategory.id);

    return res.status(200).json({
      ok: true,
      message: 'Category updated successfully',
      category: sanitizeCategory(updatedCategory),
    });
  } catch (error) {
    console.error('updateCategory error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update category',
      error: error.message,
    });
  }
}

async function updateCategoryStatus(req, res) {
  try {
    const categoryId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid category id',
      });
    }

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid category status',
      });
    }

    const existingCategory = await getCategoryById(categoryId);

    if (!existingCategory) {
      return res.status(404).json({
        ok: false,
        message: 'Category not found',
      });
    }

    await pool.query(
      `
      UPDATE categories
      SET
        status = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [status, categoryId]
    );

    const updatedCategory = await getCategoryById(categoryId);

    return res.status(200).json({
      ok: true,
      message: 'Category status updated successfully',
      category: sanitizeCategory(updatedCategory),
    });
  } catch (error) {
    console.error('updateCategoryStatus error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update category status',
      error: error.message,
    });
  }
}

async function deleteCategory(req, res) {
  try {
    const categoryId = Number(req.params.id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid category id',
      });
    }

    const existingCategory = await getCategoryById(categoryId);

    if (!existingCategory) {
      return res.status(404).json({
        ok: false,
        message: 'Category not found',
      });
    }

    await pool.query(
      `
      DELETE FROM categories
      WHERE id = ?
      `,
      [categoryId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('deleteCategory error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to delete category',
      error: error.message,
    });
  }
}

module.exports = {
  getAllCategories,
  getActiveCategories,
  getSingleCategory,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
};