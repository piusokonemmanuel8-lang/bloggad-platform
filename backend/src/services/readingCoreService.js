const pool = require('../config/db');

function fail(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function positiveInt(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function uniquePositiveInts(values) {
  const seen = new Set();
  const result = [];

  for (const value of Array.isArray(values) ? values : []) {
    const id = positiveInt(value);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    result.push(id);
  }

  return result;
}

function buildCategoryTree(rows = []) {
  const items = rows.map((row) => ({
    id: Number(row.id),
    parent_id: row.parent_id ? Number(row.parent_id) : null,
    name: row.name,
    slug: row.slug,
    icon: row.icon || null,
    status: row.status,
    sort_order: Number(row.sort_order || 0),
    children: [],
  }));

  const byId = new Map(items.map((item) => [item.id, item]));
  const roots = [];

  for (const item of items) {
    if (item.parent_id && byId.has(item.parent_id) && item.parent_id !== item.id) {
      byId.get(item.parent_id).children.push(item);
    } else {
      roots.push(item);
    }
  }

  const sortBranch = (branch) => {
    branch.sort((a, b) => {
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return a.name.localeCompare(b.name);
    });

    for (const item of branch) sortBranch(item.children);
  };

  sortBranch(roots);
  return roots;
}

async function getCategoryRows({ activeOnly = false } = {}) {
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
    ${activeOnly ? "WHERE status = 'active'" : ''}
    ORDER BY
      COALESCE(parent_id, 0) ASC,
      sort_order ASC,
      name ASC,
      id ASC
    `
  );

  return rows;
}

async function getTopicTree({ activeOnly = true } = {}) {
  const rows = await getCategoryRows({ activeOnly });
  return {
    categories: rows.map((row) => ({
      ...row,
      id: Number(row.id),
      parent_id: row.parent_id ? Number(row.parent_id) : null,
      sort_order: Number(row.sort_order || 0),
    })),
    tree: buildCategoryTree(rows),
  };
}

async function normalizeTopicSelection({
  primaryCategoryId = null,
  topicIds = [],
  maxTopics = 5,
}) {
  const ids = uniquePositiveInts(topicIds);
  const primaryId = positiveInt(primaryCategoryId);

  if (primaryId && !ids.includes(primaryId)) ids.unshift(primaryId);

  if (ids.length > maxTopics) {
    throw fail(`Choose no more than ${maxTopics} topics for one post.`);
  }

  if (!ids.length) return [];

  const placeholders = ids.map(() => '?').join(',');
  const [rows] = await pool.query(
    `
    SELECT id
    FROM categories
    WHERE id IN (${placeholders})
      AND status = 'active'
    `,
    ids
  );

  const active = new Set(rows.map((row) => Number(row.id)));
  const invalid = ids.filter((id) => !active.has(id));

  if (invalid.length) {
    throw fail('One or more selected topics are invalid or inactive.');
  }

  return ids;
}

async function replacePostTopics({
  postId,
  writerUserId,
  primaryCategoryId = null,
  categoryIds = [],
}) {
  const cleanPostId = positiveInt(postId);
  const cleanWriterId = positiveInt(writerUserId);

  if (!cleanPostId || !cleanWriterId) {
    throw fail('Valid post and Writer IDs are required.');
  }

  const [postRows] = await pool.query(
    `
    SELECT id, category_id
    FROM product_posts
    WHERE id = ?
      AND user_id = ?
    LIMIT 1
    `,
    [cleanPostId, cleanWriterId]
  );

  const post = postRows[0];

  if (!post) {
    throw fail('Writer post not found.', 404);
  }

  const normalized = await normalizeTopicSelection({
    primaryCategoryId:
      primaryCategoryId === undefined ? post.category_id : primaryCategoryId,
    topicIds: categoryIds,
  });

  const primaryId =
    positiveInt(primaryCategoryId) || positiveInt(post.category_id) || null;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `DELETE FROM post_category_assignments WHERE post_id = ?`,
      [cleanPostId]
    );

    for (const categoryId of normalized) {
      await connection.query(
        `
        INSERT INTO post_category_assignments (
          post_id,
          category_id,
          is_primary,
          created_at
        )
        VALUES (?, ?, ?, NOW())
        `,
        [cleanPostId, categoryId, primaryId === categoryId ? 1 : 0]
      );
    }

    await connection.commit();
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}
    throw error;
  } finally {
    connection.release();
  }

  return getPostTopics(cleanPostId);
}

async function getPostTopics(postId) {
  const cleanPostId = positiveInt(postId);
  if (!cleanPostId) return [];

  const [rows] = await pool.query(
    `
    SELECT
      pca.category_id AS id,
      c.parent_id,
      c.name,
      c.slug,
      c.icon,
      c.status,
      c.sort_order,
      pca.is_primary
    FROM post_category_assignments pca
    INNER JOIN categories c
      ON c.id = pca.category_id
    WHERE pca.post_id = ?
    ORDER BY
      pca.is_primary DESC,
      c.sort_order ASC,
      c.name ASC,
      c.id ASC
    `,
    [cleanPostId]
  );

  return rows.map((row) => ({
    ...row,
    id: Number(row.id),
    parent_id: row.parent_id ? Number(row.parent_id) : null,
    sort_order: Number(row.sort_order || 0),
    is_primary: !!row.is_primary,
  }));
}

async function getPublishRuleForContentType(contentType) {
  const normalized = String(contentType || '').trim().toLowerCase();

  if (!normalized) {
    return {
      content_type: '',
      min_words: 0,
      is_active: false,
    };
  }

  const [rows] = await pool.query(
    `
    SELECT
      content_type,
      min_words,
      is_active,
      updated_by_user_id,
      created_at,
      updated_at
    FROM content_publish_rules
    WHERE content_type = ?
    LIMIT 1
    `,
    [normalized]
  );

  if (!rows[0]) {
    return {
      content_type: normalized,
      min_words: 0,
      is_active: false,
    };
  }

  return {
    ...rows[0],
    min_words: Number(rows[0].min_words || 0),
    is_active: !!rows[0].is_active,
  };
}

module.exports = {
  fail,
  positiveInt,
  uniquePositiveInts,
  buildCategoryTree,
  getCategoryRows,
  getTopicTree,
  normalizeTopicSelection,
  replacePostTopics,
  getPostTopics,
  getPublishRuleForContentType,
};