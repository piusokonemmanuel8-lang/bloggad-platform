const slugify = require('slugify');
const pool = require('../../config/db');

function sanitizeCategory(row) {
  if (!row) return null;

  return {
    id: row.id,
    parent_id: row.parent_id ? Number(row.parent_id) : null,
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

function normalizeParentId(value) {
  if (
    value === undefined ||
    value === null ||
    value === '' ||
    value === 0 ||
    value === '0'
  ) {
    return null;
  }

  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error('Invalid parent category id');
    error.status = 400;
    throw error;
  }

  return id;
}

async function validateParentCategory(parentId, currentCategoryId = null) {
  if (!parentId) return null;

  if (currentCategoryId && Number(parentId) === Number(currentCategoryId)) {
    const error = new Error('A category cannot be its own parent');
    error.status = 400;
    throw error;
  }

  const [rows] = await pool.query(
    `
    SELECT id, parent_id
    FROM categories
    `
  );

  const byId = new Map(
    rows.map((row) => [
      Number(row.id),
      {
        id: Number(row.id),
        parent_id: row.parent_id ? Number(row.parent_id) : null,
      },
    ])
  );

  if (!byId.has(Number(parentId))) {
    const error = new Error('Parent category not found');
    error.status = 400;
    throw error;
  }

  let cursor = Number(parentId);
  const seen = new Set();

  while (cursor) {
    if (currentCategoryId && cursor === Number(currentCategoryId)) {
      const error = new Error('A category cannot be moved under one of its descendants');
      error.status = 400;
      throw error;
    }

    if (seen.has(cursor)) {
      const error = new Error('Category hierarchy contains a cycle');
      error.status = 400;
      throw error;
    }

    seen.add(cursor);

    const row = byId.get(cursor);
    cursor = row?.parent_id || null;
  }

  return Number(parentId);
}async function ensureUniqueCategorySlug(baseSlug, currentCategoryId = null) {
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
      parent_id,
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
        parent_id,
        name,
        slug,
        icon,
        status,
        sort_order,
        created_at,
        updated_at
      FROM categories
      ORDER BY COALESCE(parent_id, 0) ASC, sort_order ASC, name ASC, id ASC
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
        parent_id,
        name,
        slug,
        icon,
        status,
        sort_order,
        created_at,
        updated_at
      FROM categories
      WHERE status = 'active'
      ORDER BY COALESCE(parent_id, 0) ASC, sort_order ASC, name ASC, id ASC
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
    const { name, slug, icon, parent_id, status, sort_order } = req.body;

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
    const cleanParentId = normalizeParentId(parent_id);
    await validateParentCategory(cleanParentId);

    const [result] = await pool.query(
      `
      INSERT INTO categories
      (
        parent_id,
        name,
        slug,
        icon,
        status,
        sort_order,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [cleanParentId, cleanName, uniqueSlug, cleanIcon, cleanStatus, cleanSortOrder]
    );

    const category = await getCategoryById(result.insertId);

    return res.status(201).json({
      ok: true,
      message: 'Category created successfully',
      category: sanitizeCategory(category),
    });
  } catch (error) {
    console.error('createCategory error:', error);

    return res.status(error.status || 500).json({
      ok: false,
      message: error.status ? error.message : 'Failed to create category',
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

    const { name, slug, icon, parent_id, status, sort_order } = req.body;

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
    const cleanParentId =
      parent_id === undefined
        ? existingCategory.parent_id
          ? Number(existingCategory.parent_id)
          : null
        : normalizeParentId(parent_id);

    await validateParentCategory(cleanParentId, existingCategory.id);

    await pool.query(
      `
      UPDATE categories
      SET
        parent_id = ?,
        name = ?,
        slug = ?,
        icon = ?,
        status = ?,
        sort_order = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [cleanParentId, cleanName, uniqueSlug, cleanIcon, cleanStatus, cleanSortOrder, existingCategory.id]
    );

    const updatedCategory = await getCategoryById(existingCategory.id);

    return res.status(200).json({
      ok: true,
      message: 'Category updated successfully',
      category: sanitizeCategory(updatedCategory),
    });
  } catch (error) {
    console.error('updateCategory error:', error);

    return res.status(error.status || 500).json({
      ok: false,
      message: error.status ? error.message : 'Failed to update category',
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