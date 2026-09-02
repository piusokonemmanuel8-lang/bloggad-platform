const pool = require('../../config/db');
const {
  startAdminPostLinkScan,
  getAdminPostLinkScan,
  resolveAdminPostLinkDomain,
  approveAdminPostsAfterLinkScan,
} = require('../../services/adminPostLinkScannerService');

function sanitizePost(row) {
  if (!row) return null;

  return {
    id: row.id,
    product_id: row.product_id,
    user_id: row.user_id,
    website_id: row.website_id,
    category_id: row.category_id,
    template_id: row.template_id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    featured_image: row.featured_image,
    media_id: row.media_id,
    status: row.status,
    review_status: row.review_status || 'not_checked',
    quality_score: Number(row.quality_score || 0),
    risk_score: Number(row.risk_score || 0),
    similarity_score: Number(row.similarity_score || 0),
    similarity_source_post_id: row.similarity_source_post_id || null,
    total_words: Number(row.total_words || 0),
    quality_checks_started: !!row.quality_checks_started,
    last_quality_checked_at: row.last_quality_checked_at,
    quality_blocked_reason: row.quality_blocked_reason || null,
    admin_review_notes: row.admin_review_notes || null,
    writer_revision_required: !!row.writer_revision_required,
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    affiliate: {
      id: row.affiliate_id,
      name: row.affiliate_name,
      email: row.affiliate_email,
      status: row.affiliate_status,
    },
    website: row.website_id ? {
      id: row.website_id,
      website_name: row.website_name,
      slug: row.website_slug,
      status: row.website_status,
    } : null,
    product: row.product_id ? {
      id: row.product_id,
      title: row.product_title,
      slug: row.product_slug,
      status: row.product_status,
    } : null,
    category: row.category_id ? {
      id: row.category_id,
      name: row.category_name,
      slug: row.category_slug,
      status: row.category_status,
    } : null,
    template: row.template_id ? {
      id: row.template_id,
      name: row.template_name,
      slug: row.template_slug,
      status: row.template_status,
    } : null,
    stats: {
      total_template_fields: Number(row.total_template_fields || 0),
      total_cta_buttons: Number(row.total_cta_buttons || 0),
    },
  };
}

function parsePositiveInteger(value, fallback, min, max) {
  const numeric = Number(value);
  if (!Number.isInteger(numeric)) return fallback;
  return Math.min(max, Math.max(min, numeric));
}

function normalizePostIds(value) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map(Number).filter((item) => Number.isInteger(item) && item > 0))).slice(0, 200);
}

function buildPostListFilter(query) {
  const where = [];
  const params = [];
  const status = ['draft', 'published', 'inactive'].includes(query?.status) ? query.status : '';
  const allowedReviewStatuses = ['not_checked', 'pending_review', 'approved', 'needs_revision', 'rejected'];
  const reviewStatus = allowedReviewStatuses.includes(query?.review_status) ? query.review_status : '';
  const search = String(query?.search || '').trim().slice(0, 200);

  if (status) {
    where.push('pp.status = ?');
    params.push(status);
  }
  if (reviewStatus) {
    where.push("COALESCE(pp.review_status, 'not_checked') = ?");
    params.push(reviewStatus);
  }
  if (search) {
    const like = `%${search}%`;
    where.push('(pp.title LIKE ? OR pp.slug LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR p.title LIKE ? OR c.name LIKE ?)');
    params.push(like, like, like, like, like, like);
  }

  return {
    whereSql: where.length ? `WHERE ${where.join(' AND ')}` : '',
    params,
    status,
    reviewStatus,
    search,
  };
}

const ADMIN_POST_LIST_FROM = `
  FROM product_posts pp
  INNER JOIN users u ON u.id = pp.user_id
  LEFT JOIN affiliate_websites aw ON aw.id = pp.website_id
  LEFT JOIN products p ON p.id = pp.product_id
  LEFT JOIN categories c ON c.id = pp.category_id
  LEFT JOIN blog_templates bt ON bt.id = pp.template_id
`;

const ADMIN_POST_LIST_SELECT = `
  SELECT
    pp.id, pp.product_id, pp.user_id, pp.website_id, pp.category_id, pp.template_id,
    pp.title, pp.slug, pp.excerpt, pp.seo_title, pp.seo_description, pp.featured_image,
    pp.media_id, pp.status, pp.review_status, pp.quality_score, pp.risk_score,
    pp.similarity_score, pp.similarity_source_post_id, pp.total_words,
    pp.quality_checks_started, pp.last_quality_checked_at, pp.quality_blocked_reason,
    pp.admin_review_notes, pp.writer_revision_required, pp.published_at, pp.created_at,
    pp.updated_at,
    u.id AS affiliate_id, u.name AS affiliate_name, u.email AS affiliate_email,
    u.status AS affiliate_status,
    aw.website_name, aw.slug AS website_slug, aw.status AS website_status,
    p.title AS product_title, p.slug AS product_slug, p.status AS product_status,
    c.name AS category_name, c.slug AS category_slug, c.status AS category_status,
    bt.name AS template_name, bt.slug AS template_slug, bt.status AS template_status,
    (SELECT COUNT(*) FROM post_template_fields ptf WHERE ptf.post_id = pp.id) AS total_template_fields,
    (SELECT COUNT(*) FROM post_cta_buttons pcb WHERE pcb.post_id = pp.id) AS total_cta_buttons
`;

async function getAdminPostById(postId) {
  const [rows] = await pool.query(`
    ${ADMIN_POST_LIST_SELECT}
    ${ADMIN_POST_LIST_FROM}
    WHERE pp.id = ?
    LIMIT 1
  `, [postId]);
  return rows[0] || null;
}

async function getQualityFieldScores(postId) {
  try {
    const [rows] = await pool.query(`
      SELECT id, post_id, post_template_field_id, field_key, field_label, section_name,
        field_type, word_count, quality_score, risk_score, similarity_score, passed,
        checks_started, warning_code, warning_message, repetition_hits, generic_phrase_hits,
        specificity_hits, compared_post_id, compared_field_key, created_at, updated_at
      FROM post_quality_field_scores
      WHERE post_id = ?
      ORDER BY id ASC
    `, [postId]);

    return rows.map((row) => ({
      ...row,
      passed: !!row.passed,
      checks_started: !!row.checks_started,
      quality_score: Number(row.quality_score || 0),
      risk_score: Number(row.risk_score || 0),
      similarity_score: Number(row.similarity_score || 0),
    }));
  } catch (error) {
    return [];
  }
}

async function getQualityWarnings(postId) {
  try {
    const [rows] = await pool.query(`
      SELECT id, post_id, post_template_field_id, field_key, warning_type, severity,
        message, suggestion, compared_post_id, compared_field_key, similarity_score,
        is_active, created_at, updated_at
      FROM post_quality_warnings
      WHERE post_id = ? AND is_active = 1
      ORDER BY id ASC
    `, [postId]);

    return rows.map((row) => ({
      ...row,
      is_active: !!row.is_active,
      similarity_score: Number(row.similarity_score || 0),
    }));
  } catch (error) {
    return [];
  }
}

async function getAllPosts(req, res) {
  try {
    const page = parsePositiveInteger(req.query?.page, 1, 1, 1000000);
    const limit = parsePositiveInteger(req.query?.limit, 20, 10, 20);
    const { whereSql, params, status, reviewStatus, search } = buildPostListFilter(req.query || {});

    const [countRows] = await pool.query(`SELECT COUNT(*) AS total ${ADMIN_POST_LIST_FROM} ${whereSql}`, params);
    const total = Number(countRows[0]?.total || 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const safeOffset = (safePage - 1) * limit;

    const [rows] = await pool.query(`
      ${ADMIN_POST_LIST_SELECT}
      ${ADMIN_POST_LIST_FROM}
      ${whereSql}
      ORDER BY pp.id DESC
      LIMIT ${limit}
      OFFSET ${safeOffset}
    `, params);

    const [summaryRows] = await pool.query(`
      SELECT COUNT(*) AS total,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draft,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS inactive
      FROM product_posts
    `);
    const summary = summaryRows[0] || {};

    return res.status(200).json({
      ok: true,
      posts: rows.map(sanitizePost),
      pagination: {
        page: safePage,
        limit,
        total,
        total_pages: totalPages,
        has_previous: safePage > 1,
        has_next: safePage < totalPages,
      },
      counts: {
        total: Number(summary.total || 0),
        published: Number(summary.published || 0),
        draft: Number(summary.draft || 0),
        inactive: Number(summary.inactive || 0),
      },
      filters: {
        status: status || null,
        review_status: reviewStatus || null,
        search: search || null,
      },
    });
  } catch (error) {
    console.error('getAllPosts error:', error);
    return res.status(500).json({ ok: false, message: 'Failed to fetch posts', error: error.message });
  }
}

async function getSinglePost(req, res) {
  try {
    const postId = Number(req.params.id);
    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({ ok: false, message: 'Invalid post id' });
    }

    const post = await getAdminPostById(postId);
    if (!post) return res.status(404).json({ ok: false, message: 'Post not found' });

    const [templateFields] = await pool.query(`
      SELECT id, field_key, field_type, field_value, sort_order, created_at, updated_at
      FROM post_template_fields
      WHERE post_id = ?
      ORDER BY sort_order ASC, id ASC
    `, [postId]);

    const [ctaButtons] = await pool.query(`
      SELECT id, button_key, button_label, button_url, button_style, open_in_new_tab,
        sort_order, created_at, updated_at
      FROM post_cta_buttons
      WHERE post_id = ?
      ORDER BY sort_order ASC, id ASC
    `, [postId]);

    const fieldScores = await getQualityFieldScores(postId);
    const warnings = await getQualityWarnings(postId);

    return res.status(200).json({
      ok: true,
      post: {
        ...sanitizePost(post),
        template_fields: templateFields,
        cta_buttons: ctaButtons.map((row) => ({ ...row, open_in_new_tab: !!row.open_in_new_tab })),
        quality_review: {
          review_status: post.review_status || 'not_checked',
          quality_score: Number(post.quality_score || 0),
          risk_score: Number(post.risk_score || 0),
          similarity_score: Number(post.similarity_score || 0),
          similarity_source_post_id: post.similarity_source_post_id || null,
          total_words: Number(post.total_words || 0),
          checks_started: !!post.quality_checks_started,
          blocked_reason: post.quality_blocked_reason || null,
          field_scores: fieldScores,
          warnings,
        },
      },
    });
  } catch (error) {
    console.error('getSinglePost error:', error);
    return res.status(500).json({ ok: false, message: 'Failed to fetch post', error: error.message });
  }
}

async function updatePostStatus(req, res) {
  try {
    const postId = Number(req.params.id);
    const { status } = req.body;
    if (!Number.isInteger(postId) || postId <= 0) return res.status(400).json({ ok: false, message: 'Invalid post id' });
    if (!['draft', 'published', 'inactive'].includes(status)) return res.status(400).json({ ok: false, message: 'Invalid post status' });

    const existingPost = await getAdminPostById(postId);
    if (!existingPost) return res.status(404).json({ ok: false, message: 'Post not found' });

    if (status === 'published') {
      const approval = await approveAdminPostsAfterLinkScan({
        ids: [postId],
        adminId: req.user?.id || null,
      });

      if (!approval.ok) {
        return res.status(409).json({
          ok: false,
          message: approval.message,
          results: approval.results,
        });
      }

      const updatedPost = await getAdminPostById(postId);
      return res.status(200).json({
        ok: true,
        message: 'Post scanned, approved, and published successfully',
        post: sanitizePost(updatedPost),
      });
    }

    await pool.query(
      `UPDATE product_posts
       SET status = ?, published_at = NULL, updated_at = NOW()
       WHERE id = ?`,
      [status, postId]
    );
    const updatedPost = await getAdminPostById(postId);

    return res.status(200).json({ ok: true, message: 'Post status updated successfully', post: sanitizePost(updatedPost) });
  } catch (error) {
    console.error('updatePostStatus error:', error);
    return res.status(500).json({ ok: false, message: 'Failed to update post status', error: error.message });
  }
}

async function bulkUpdatePostStatus(req, res) {
  try {
    const ids = normalizePostIds(req.body?.ids);
    const status = req.body?.status;
    if (!ids.length) return res.status(400).json({ ok: false, message: 'Select at least one valid post' });
    if (!['draft', 'published', 'inactive'].includes(status)) return res.status(400).json({ ok: false, message: 'Invalid post status' });

    const placeholders = ids.map(() => '?').join(',');
    const [existingRows] = await pool.query(`SELECT id FROM product_posts WHERE id IN (${placeholders})`, ids);
    const foundIds = existingRows.map((row) => Number(row.id));
    const foundSet = new Set(foundIds);
    const missingIds = ids.filter((id) => !foundSet.has(id));
    if (!foundIds.length) return res.status(404).json({ ok: false, message: 'No selected posts were found' });

    if (status === 'published') {
      const approval = await approveAdminPostsAfterLinkScan({
        ids: foundIds,
        adminId: req.user?.id || null,
      });

      if (!approval.ok) {
        return res.status(409).json({
          ok: false,
          message: approval.message,
          results: approval.results,
        });
      }

      return res.status(200).json({
        ok: true,
        message: `${foundIds.length} post(s) scanned, approved, and published successfully`,
        result: {
          requested_count: ids.length,
          matched_count: foundIds.length,
          changed_count: foundIds.length,
          missing_ids: missingIds,
          status,
        },
      });
    }

    const foundPlaceholders = foundIds.map(() => '?').join(',');
    const [result] = await pool.query(`
      UPDATE product_posts
      SET status = ?, published_at = NULL, updated_at = NOW()
      WHERE id IN (${foundPlaceholders})
    `, [status, ...foundIds]);

    return res.status(200).json({
      ok: true,
      message: `${foundIds.length} post(s) processed successfully`,
      result: {
        requested_count: ids.length,
        matched_count: foundIds.length,
        changed_count: Number(result.changedRows ?? result.affectedRows ?? 0),
        missing_ids: missingIds,
        status,
      },
    });
  } catch (error) {
    console.error('bulkUpdatePostStatus error:', error);
    return res.status(500).json({ ok: false, message: 'Failed to update selected posts', error: error.message });
  }
}

async function startBulkLinkScan(req, res) {
  try {
    const ids = normalizePostIds(req.body?.ids);
    if (!ids.length) return res.status(400).json({ ok: false, message: 'Select at least one valid post' });
    if (ids.length > 20) return res.status(400).json({ ok: false, message: 'A maximum of 20 posts can be scanned at once' });

    const job = startAdminPostLinkScan({ ids, adminId: req.user?.id || null });
    return res.status(202).json({ ok: true, message: 'Bulk link scan started', job });
  } catch (error) {
    console.error('startBulkLinkScan error:', error);
    return res.status(500).json({ ok: false, message: 'Failed to start link scan', error: error.message });
  }
}

async function getBulkLinkScanStatus(req, res) {
  try {
    const job = getAdminPostLinkScan({ jobId: req.params.jobId, adminId: req.user?.id || null });
    if (!job) return res.status(404).json({ ok: false, message: 'Link scan job not found or expired' });
    return res.status(200).json({ ok: true, job });
  } catch (error) {
    console.error('getBulkLinkScanStatus error:', error);
    return res.status(500).json({ ok: false, message: 'Failed to read link scan status', error: error.message });
  }
}

async function resolveBulkLinkReview(req, res) {
  try {
    const domain = String(req.body?.domain || '').trim();
    const decision = req.body?.decision;
    const reason = String(req.body?.reason || '').trim().slice(0, 500);

    if (!domain) return res.status(400).json({ ok: false, message: 'Domain is required' });
    if (!['allow', 'block'].includes(decision)) return res.status(400).json({ ok: false, message: 'Decision must be allow or block' });

    const rule = await resolveAdminPostLinkDomain({ domain, decision, reason, adminId: req.user?.id || null });
    return res.status(200).json({
      ok: true,
      message: decision === 'allow' ? 'Domain marked not suspicious' : 'Domain blocked',
      rule,
    });
  } catch (error) {
    console.error('resolveBulkLinkReview error:', error);
    return res.status(500).json({ ok: false, message: 'Failed to update domain decision', error: error.message });
  }
}

async function approveBulkAfterLinkScan(req, res) {
  try {
    const ids = normalizePostIds(req.body?.ids);
    if (!ids.length) return res.status(400).json({ ok: false, message: 'Select at least one valid post' });
    if (ids.length > 20) return res.status(400).json({ ok: false, message: 'A maximum of 20 posts can be approved at once' });

    const approval = await approveAdminPostsAfterLinkScan({ ids, adminId: req.user?.id || null });

    if (!approval.ok) {
      return res.status(409).json({
        ok: false,
        message: approval.message,
        results: approval.results,
      });
    }

    return res.status(200).json({
      ok: true,
      message: `${approval.approved_count} post(s) approved successfully`,
      approved_count: approval.approved_count,
      results: approval.results,
    });
  } catch (error) {
    console.error('approveBulkAfterLinkScan error:', error);
    return res.status(500).json({ ok: false, message: 'Failed to approve selected posts', error: error.message });
  }
}

async function deletePost(req, res) {
  try {
    const postId = Number(req.params.id);
    if (!Number.isInteger(postId) || postId <= 0) return res.status(400).json({ ok: false, message: 'Invalid post id' });
    const existingPost = await getAdminPostById(postId);
    if (!existingPost) return res.status(404).json({ ok: false, message: 'Post not found' });
    await pool.query('DELETE FROM product_posts WHERE id = ?', [postId]);
    return res.status(200).json({ ok: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('deletePost error:', error);
    return res.status(500).json({ ok: false, message: 'Failed to delete post', error: error.message });
  }
}

async function bulkDeletePosts(req, res) {
  try {
    const ids = normalizePostIds(req.body?.ids);
    if (!ids.length) return res.status(400).json({ ok: false, message: 'Select at least one valid post' });

    const placeholders = ids.map(() => '?').join(',');
    const [existingRows] = await pool.query(`SELECT id FROM product_posts WHERE id IN (${placeholders})`, ids);
    const foundIds = existingRows.map((row) => Number(row.id));
    const foundSet = new Set(foundIds);
    const missingIds = ids.filter((id) => !foundSet.has(id));
    if (!foundIds.length) return res.status(404).json({ ok: false, message: 'No selected posts were found' });

    const foundPlaceholders = foundIds.map(() => '?').join(',');
    const [result] = await pool.query(`DELETE FROM product_posts WHERE id IN (${foundPlaceholders})`, foundIds);

    return res.status(200).json({
      ok: true,
      message: `${Number(result.affectedRows || 0)} post(s) deleted successfully`,
      result: {
        requested_count: ids.length,
        matched_count: foundIds.length,
        deleted_count: Number(result.affectedRows || 0),
        missing_ids: missingIds,
      },
    });
  } catch (error) {
    console.error('bulkDeletePosts error:', error);
    return res.status(500).json({ ok: false, message: 'Failed to delete selected posts', error: error.message });
  }
}

module.exports = {
  getAllPosts,
  getSinglePost,
  updatePostStatus,
  bulkUpdatePostStatus,
  startBulkLinkScan,
  getBulkLinkScanStatus,
  resolveBulkLinkReview,
  approveBulkAfterLinkScan,
  deletePost,
  bulkDeletePosts,
};
