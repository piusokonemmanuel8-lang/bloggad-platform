const pool = require('../config/db');

function positiveInt(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function cleanText(value, maxLength = 2000) {
  return String(value || '').trim().slice(0, maxLength);
}

function sendError(res, error, fallback) {
  const status = Number(error?.status || 500);
  return res.status(status >= 400 && status <= 599 ? status : 500).json({
    ok: false,
    message: error?.message || fallback,
  });
}

function fail(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function getPublishedPost(postId) {
  const [rows] = await pool.query(
    `
    SELECT
      pp.id,
      pp.user_id AS writer_user_id,
      pp.website_id,
      pp.category_id,
      pp.title,
      pp.slug,
      aw.website_name,
      aw.slug AS website_slug
    FROM product_posts pp
    LEFT JOIN affiliate_websites aw ON aw.id = pp.website_id
     AND aw.status = 'active'
    WHERE pp.id = ?
      AND pp.status = 'published'
    LIMIT 1
    `,
    [postId]
  );

  return rows[0] || null;
}

async function getPostTopics(postId) {
  const [rows] = await pool.query(
    `
    SELECT
      c.id,
      c.name,
      c.slug,
      pca.is_primary
    FROM post_category_assignments pca
    INNER JOIN categories c
      ON c.id = pca.category_id
     AND c.status = 'active'
    WHERE pca.post_id = ?
    ORDER BY pca.is_primary DESC, c.sort_order ASC, c.name ASC
    `,
    [postId]
  );

  return rows.map((row) => ({
    id: Number(row.id),
    name: row.name,
    slug: row.slug,
    is_primary: !!row.is_primary,
  }));
}

async function getReaderPostReadingState(req, res) {
  try {
    const postId = positiveInt(req.params.postId);
    const readerId = req.user.id;

    if (!postId) throw fail('Valid post ID is required.');

    const post = await getPublishedPost(postId);
    if (!post) throw fail('Published post not found.', 404);

    const [followRows, muteRows, highlightRows, reportRows, topics] = await Promise.all([
      pool.query(
        `
        SELECT id
        FROM reader_publication_follows
        WHERE reader_user_id = ?
          AND website_id = ?
        LIMIT 1
        `,
        [readerId, post.website_id]
      ),
      pool.query(
        `
        SELECT id, target_type, target_id
        FROM reader_content_mutes
        WHERE reader_user_id = ?
          AND (
            (target_type = 'writer' AND target_id = ?)
            OR (target_type = 'publication' AND target_id = ?)
            OR (
              target_type = 'topic'
              AND target_id IN (
                SELECT category_id
                FROM post_category_assignments
                WHERE post_id = ?
              )
            )
          )
        `,
        [readerId, post.writer_user_id, post.website_id, post.id]
      ),
      pool.query(
        `
        SELECT id, selected_text, context_before, context_after, created_at, updated_at
        FROM reader_post_highlights
        WHERE reader_user_id = ?
          AND post_id = ?
        ORDER BY created_at DESC, id DESC
        `,
        [readerId, post.id]
      ),
      pool.query(
        `
        SELECT id, reason, details, status, created_at, updated_at
        FROM post_reports
        WHERE reporter_user_id = ?
          AND post_id = ?
        LIMIT 1
        `,
        [readerId, post.id]
      ),
      getPostTopics(post.id),
    ]);

    const muted = {
      writer: false,
      publication: false,
      topic_ids: [],
    };

    for (const row of muteRows[0]) {
      if (row.target_type === 'writer') muted.writer = true;
      if (row.target_type === 'publication') muted.publication = true;
      if (row.target_type === 'topic') muted.topic_ids.push(Number(row.target_id));
    }

    return res.status(200).json({
      ok: true,
      post: {
        id: Number(post.id),
        writer_user_id: Number(post.writer_user_id),
        website_id: post.website_id ? Number(post.website_id) : null,
        category_id: post.category_id ? Number(post.category_id) : null,
        title: post.title,
        slug: post.slug,
      },
      publication: {
        id: Number(post.website_id),
        name: post.website_name,
        slug: post.website_slug,
        following: followRows[0].length > 0,
      },
      topics,
      muted,
      highlights: highlightRows[0],
      report: reportRows[0][0] || null,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load Reader reading controls.');
  }
}

async function togglePublicationFollow(req, res) {
  try {
    const websiteId = positiveInt(req.params.websiteId);
    const readerId = req.user.id;
    if (!websiteId) throw fail('Valid publication ID is required.');

    const [websiteRows] = await pool.query(
      `
      SELECT id, website_name, slug
      FROM affiliate_websites
      WHERE id = ?
        AND status = 'active'
      LIMIT 1
      `,
      [websiteId]
    );

    if (!websiteRows[0]) throw fail('Publication not found.', 404);

    const [existing] = await pool.query(
      `
      SELECT id
      FROM reader_publication_follows
      WHERE reader_user_id = ?
        AND website_id = ?
      LIMIT 1
      `,
      [readerId, websiteId]
    );

    let following = false;

    if (existing[0]) {
      await pool.query(
        `DELETE FROM reader_publication_follows WHERE id = ? AND reader_user_id = ?`,
        [existing[0].id, readerId]
      );
    } else {
      await pool.query(
        `
        INSERT INTO reader_publication_follows (
          reader_user_id,
          website_id,
          created_at
        )
        VALUES (?, ?, NOW())
        `,
        [readerId, websiteId]
      );
      following = true;
    }

    return res.status(200).json({
      ok: true,
      following,
      publication: {
        id: Number(websiteRows[0].id),
        name: websiteRows[0].website_name,
        slug: websiteRows[0].slug,
      },
    });
  } catch (error) {
    return sendError(res, error, 'Failed to update publication follow.');
  }
}

async function validateMuteTarget(targetType, targetId) {
  if (targetType === 'writer') {
    const [rows] = await pool.query(
      `SELECT id FROM users WHERE id = ? AND role = 'affiliate' AND status = 'active' LIMIT 1`,
      [targetId]
    );
    return !!rows[0];
  }

  if (targetType === 'publication') {
    const [rows] = await pool.query(
      `SELECT id FROM affiliate_websites WHERE id = ? AND status = 'active' LIMIT 1`,
      [targetId]
    );
    return !!rows[0];
  }

  if (targetType === 'topic') {
    const [rows] = await pool.query(
      `SELECT id FROM categories WHERE id = ? AND status = 'active' LIMIT 1`,
      [targetId]
    );
    return !!rows[0];
  }

  return false;
}

async function toggleContentMute(req, res) {
  try {
    const readerId = req.user.id;
    const targetType = String(req.params.targetType || '').trim().toLowerCase();
    const targetId = positiveInt(req.params.targetId);

    if (!['writer', 'publication', 'topic'].includes(targetType) || !targetId) {
      throw fail('Valid mute target is required.');
    }

    if (!(await validateMuteTarget(targetType, targetId))) {
      throw fail('Mute target not found.', 404);
    }

    const [existing] = await pool.query(
      `
      SELECT id
      FROM reader_content_mutes
      WHERE reader_user_id = ?
        AND target_type = ?
        AND target_id = ?
      LIMIT 1
      `,
      [readerId, targetType, targetId]
    );

    let muted = false;

    if (existing[0]) {
      await pool.query(
        `DELETE FROM reader_content_mutes WHERE id = ? AND reader_user_id = ?`,
        [existing[0].id, readerId]
      );
    } else {
      await pool.query(
        `
        INSERT INTO reader_content_mutes (
          reader_user_id,
          target_type,
          target_id,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, NOW(), NOW())
        `,
        [readerId, targetType, targetId]
      );
      muted = true;
    }

    return res.status(200).json({
      ok: true,
      target_type: targetType,
      target_id: targetId,
      muted,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to update Reader mute.');
  }
}

async function getReaderReadingControls(req, res) {
  try {
    const readerId = req.user.id;

    const [publicationRows, muteRows, highlightRows] = await Promise.all([
      pool.query(
        `
        SELECT
          rpf.website_id,
          rpf.created_at AS followed_at,
          aw.website_name,
          aw.slug AS website_slug,
          aw.user_id AS writer_user_id,
          COALESCE(NULLIF(wp.pen_name, ''), NULLIF(wp.display_name, ''), NULLIF(u.name, ''), CONCAT('Writer ', u.id)) AS writer_name
        FROM reader_publication_follows rpf
        INNER JOIN affiliate_websites aw
          ON aw.id = rpf.website_id
         AND aw.status = 'active'
        INNER JOIN users u
          ON u.id = aw.user_id
        LEFT JOIN writer_profiles wp
          ON wp.user_id = aw.user_id
         AND wp.status = 'active'
        WHERE rpf.reader_user_id = ?
        ORDER BY rpf.created_at DESC, rpf.id DESC
        `,
        [readerId]
      ),
      pool.query(
        `
        SELECT
          rcm.id,
          rcm.target_type,
          rcm.target_id,
          rcm.created_at,
          CASE
            WHEN rcm.target_type = 'writer' THEN COALESCE(NULLIF(wp.pen_name, ''), NULLIF(wp.display_name, ''), NULLIF(wu.name, ''), CONCAT('Writer ', wu.id))
            WHEN rcm.target_type = 'publication' THEN aw.website_name
            WHEN rcm.target_type = 'topic' THEN c.name
            ELSE NULL
          END AS target_name
        FROM reader_content_mutes rcm
        LEFT JOIN users wu
          ON rcm.target_type = 'writer'
         AND wu.id = rcm.target_id
        LEFT JOIN writer_profiles wp
          ON wp.user_id = wu.id
         AND wp.status = 'active'
        LEFT JOIN affiliate_websites aw
          ON rcm.target_type = 'publication'
         AND aw.id = rcm.target_id
        LEFT JOIN categories c
          ON rcm.target_type = 'topic'
         AND c.id = rcm.target_id
        WHERE rcm.reader_user_id = ?
        ORDER BY rcm.created_at DESC, rcm.id DESC
        `,
        [readerId]
      ),
      pool.query(
        `
        SELECT
          rph.id,
          rph.post_id,
          rph.selected_text,
          rph.context_before,
          rph.context_after,
          rph.created_at,
          pp.title AS post_title,
          pp.slug AS post_slug,
          aw.slug AS website_slug
        FROM reader_post_highlights rph
        INNER JOIN product_posts pp
          ON pp.id = rph.post_id
        LEFT JOIN affiliate_websites aw ON aw.id = pp.website_id
        WHERE rph.reader_user_id = ?
        ORDER BY rph.created_at DESC, rph.id DESC
        LIMIT 500
        `,
        [readerId]
      ),
    ]);

    return res.status(200).json({
      ok: true,
      publication_follows: publicationRows[0],
      mutes: muteRows[0],
      highlights: highlightRows[0],
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load Reader reading controls.');
  }
}

async function createPostHighlight(req, res) {
  try {
    const readerId = req.user.id;
    const postId = positiveInt(req.params.postId);
    const selectedText = cleanText(req.body?.selected_text, 2000);
    const contextBefore = cleanText(req.body?.context_before, 500) || null;
    const contextAfter = cleanText(req.body?.context_after, 500) || null;

    if (!postId) throw fail('Valid post ID is required.');
    if (!selectedText) throw fail('Select text from the story before saving a highlight.');

    const post = await getPublishedPost(postId);
    if (!post) throw fail('Published post not found.', 404);

    const [result] = await pool.query(
      `
      INSERT INTO reader_post_highlights (
        reader_user_id,
        post_id,
        selected_text,
        context_before,
        context_after,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [readerId, post.id, selectedText, contextBefore, contextAfter]
    );

    return res.status(201).json({
      ok: true,
      message: 'Highlight saved.',
      highlight: {
        id: Number(result.insertId),
        post_id: Number(post.id),
        selected_text: selectedText,
        context_before: contextBefore,
        context_after: contextAfter,
      },
    });
  } catch (error) {
    return sendError(res, error, 'Failed to save highlight.');
  }
}

async function deletePostHighlight(req, res) {
  try {
    const readerId = req.user.id;
    const highlightId = positiveInt(req.params.highlightId);
    if (!highlightId) throw fail('Valid highlight ID is required.');

    const [result] = await pool.query(
      `
      DELETE FROM reader_post_highlights
      WHERE id = ?
        AND reader_user_id = ?
      `,
      [highlightId, readerId]
    );

    if (!result.affectedRows) throw fail('Highlight not found.', 404);

    return res.status(200).json({ ok: true, message: 'Highlight removed.' });
  } catch (error) {
    return sendError(res, error, 'Failed to remove highlight.');
  }
}

async function reportPost(req, res) {
  try {
    const readerId = req.user.id;
    const postId = positiveInt(req.params.postId);
    const reason = String(req.body?.reason || '').trim().toLowerCase();
    const details = cleanText(req.body?.details, 2000) || null;
    const allowedReasons = new Set([
      'spam',
      'harassment',
      'hate_or_abuse',
      'misinformation',
      'copyright',
      'adult_or_unsafe',
      'other',
    ]);

    if (!postId) throw fail('Valid post ID is required.');
    if (!allowedReasons.has(reason)) throw fail('Choose a valid report reason.');

    const post = await getPublishedPost(postId);
    if (!post) throw fail('Published post not found.', 404);

    await pool.query(
      `
      INSERT INTO post_reports (
        post_id,
        reporter_user_id,
        reason,
        details,
        status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, 'pending', NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        reason = VALUES(reason),
        details = VALUES(details),
        status = 'pending',
        admin_note = NULL,
        reviewed_by_user_id = NULL,
        reviewed_at = NULL,
        updated_at = NOW()
      `,
      [post.id, readerId, reason, details]
    );

    const [rows] = await pool.query(
      `
      SELECT id, reason, details, status, created_at, updated_at
      FROM post_reports
      WHERE post_id = ?
        AND reporter_user_id = ?
      LIMIT 1
      `,
      [post.id, readerId]
    );

    return res.status(201).json({
      ok: true,
      message: 'Story report submitted for review.',
      report: rows[0] || null,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to report story.');
  }
}

module.exports = {
  getReaderPostReadingState,
  togglePublicationFollow,
  toggleContentMute,
  getReaderReadingControls,
  createPostHighlight,
  deletePostHighlight,
  reportPost,
};