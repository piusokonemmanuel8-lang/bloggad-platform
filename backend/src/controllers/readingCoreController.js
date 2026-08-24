const pool = require('../config/db');
const {
  getReaderSubscriptionState,
} = require('../services/writerReaderAccessService');
const {
  fail,
  positiveInt,
  uniquePositiveInts,
  getTopicTree,
  normalizeTopicSelection,
  replacePostTopics,
  getPostTopics,
} = require('../services/readingCoreService');

const CONTENT_TYPES = new Set([
  'article',
  'story',
  'tutorial',
  'course_lesson',
  'review',
  'news',
  'opinion',
  'product_post',
]);

function sendError(res, error, fallbackMessage) {
  const status = Number(error?.status || 500);
  const safeStatus =
    Number.isInteger(status) && status >= 400 && status <= 599 ? status : 500;

  return res.status(safeStatus).json({
    ok: false,
    message: error?.message || fallbackMessage,
  });
}

async function getPublicTopics(req, res) {
  try {
    const result = await getTopicTree({ activeOnly: true });
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    return sendError(res, error, 'Failed to load topics.');
  }
}

async function getPublicTopicBySlug(req, res) {
  try {
    const topicSlug = String(req.params?.slug || '')
      .trim()
      .toLowerCase()
      .slice(0, 170);

    if (!topicSlug || !/^[a-z0-9-]+$/.test(topicSlug)) {
      throw fail('Valid topic slug is required.');
    }

    const [topicRows] = await pool.query(
      `
      SELECT
        id,
        parent_id,
        name,
        slug,
        icon,
        status,
        sort_order
      FROM categories
      WHERE slug = ?
        AND status = 'active'
      LIMIT 1
      `,
      [topicSlug]
    );

    const topic = topicRows[0];

    if (!topic) {
      throw fail('Topic not found.', 404);
    }

    const requestedLimit = Number(req.query?.limit || 40);
    const limit = Math.max(
      1,
      Math.min(80, Number.isFinite(requestedLimit) ? requestedLimit : 40)
    );

    const [childRows, postRows] = await Promise.all([
      pool.query(
        `
        SELECT
          id,
          parent_id,
          name,
          slug,
          icon,
          status,
          sort_order
        FROM categories
        WHERE parent_id = ?
          AND status = 'active'
        ORDER BY sort_order ASC, name ASC, id ASC
        `,
        [topic.id]
      ),
      pool.query(
        `
        WITH RECURSIVE topic_tree AS (
          SELECT id
          FROM categories
          WHERE id = ?
            AND status = 'active'

          UNION ALL

          SELECT child.id
          FROM categories child
          INNER JOIN topic_tree parent_topic
            ON child.parent_id = parent_topic.id
          WHERE child.status = 'active'
        )
        SELECT
          pp.id,
          pp.user_id AS writer_user_id,
          pp.website_id,
          pp.category_id,
          pp.content_type,
          pp.title,
          pp.slug,
          pp.excerpt,
          pp.featured_image,
          pp.published_at,
          pp.created_at,
          aw.website_name,
          aw.slug AS website_slug,
        primary_wp.slug AS writer_page_slug,
          c.name AS category_name,
          COALESCE(
            NULLIF(wp.pen_name, ''),
            NULLIF(wp.display_name, ''),
            NULLIF(u.name, ''),
            CONCAT('Writer ', u.id)
          ) AS writer_name,
          (
            SELECT GROUP_CONCAT(
              c2.name
              ORDER BY
                pca2.is_primary DESC,
                c2.sort_order ASC,
                c2.name ASC
              SEPARATOR ', '
            )
            FROM post_category_assignments pca2
            INNER JOIN categories c2
              ON c2.id = pca2.category_id
             AND c2.status = 'active'
            WHERE pca2.post_id = pp.id
          ) AS topic_names
        FROM product_posts pp
        INNER JOIN users u
          ON u.id = pp.user_id
         AND u.role = 'affiliate'
         AND u.status = 'active'
        LEFT JOIN affiliate_websites aw
          ON aw.id = pp.website_id
         AND aw.status = 'active'
        LEFT JOIN writer_pages primary_wp
          ON primary_wp.user_id = pp.user_id
         AND primary_wp.is_primary = 1
         AND primary_wp.status = 'active'
        LEFT JOIN writer_profiles wp
          ON wp.user_id = pp.user_id
         AND wp.status = 'active'
        LEFT JOIN categories c
          ON c.id = pp.category_id
        WHERE pp.status = 'published'
          AND (
            pp.category_id IN (SELECT id FROM topic_tree)
            OR EXISTS(
              SELECT 1
              FROM post_category_assignments pca_match
              WHERE pca_match.post_id = pp.id
                AND pca_match.category_id IN (SELECT id FROM topic_tree)
            )
          )
        ORDER BY
          COALESCE(pp.published_at, pp.created_at) DESC,
          pp.id DESC
        LIMIT ?
        `,
        [topic.id, limit]
      ),
    ]);

    return res.status(200).json({
      ok: true,
      topic: {
        ...topic,
        id: Number(topic.id),
        parent_id: topic.parent_id ? Number(topic.parent_id) : null,
        sort_order: Number(topic.sort_order || 0),
      },
      children: childRows[0].map((row) => ({
        ...row,
        id: Number(row.id),
        parent_id: row.parent_id ? Number(row.parent_id) : null,
        sort_order: Number(row.sort_order || 0),
      })),
      posts: postRows[0].map((row) => ({
        ...row,
        id: Number(row.id),
        writer_user_id: Number(row.writer_user_id),
        website_id: row.website_id ? Number(row.website_id) : null,
        category_id: row.category_id ? Number(row.category_id) : null,
        topics: row.topic_names
          ? String(row.topic_names).split(', ').filter(Boolean)
          : [],
      })),
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load topic.');
  }
}
async function getReaderInterestEntitlement(readerUserId) {
  const state = await getReaderSubscriptionState(readerUserId);
  const rawTier = String(
    state?.active_subscription?.plan_tier || ''
  ).trim().toLowerCase();

  const tier =
    rawTier === 'premium'
      ? 'premium'
      : rawTier === 'basic'
        ? 'basic'
        : 'free';

  return {
    tier,
    maxInterests: tier === 'premium' ? 20 : tier === 'basic' ? 10 : 5,
  };
}
async function getReaderInterests(req, res) {
  try {
    const readerId = req.user.id;
    const interestEntitlement = await getReaderInterestEntitlement(readerId);
    const [interestRows, topicData] = await Promise.all([
      pool.query(
        `
        SELECT
          rci.category_id,
          rci.preference_weight,
          rci.created_at,
          c.name,
          c.slug,
          c.parent_id
        FROM reader_category_interests rci
        INNER JOIN categories c
          ON c.id = rci.category_id
        WHERE rci.reader_user_id = ?
          AND c.status = 'active'
        ORDER BY
          rci.preference_weight DESC,
          c.sort_order ASC,
          c.name ASC
        `,
        [readerId]
      ),
      getTopicTree({ activeOnly: true }),
    ]);

    const interests = interestRows[0].map((row) => ({
      ...row,
      category_id: Number(row.category_id),
      parent_id: row.parent_id ? Number(row.parent_id) : null,
      preference_weight: Number(row.preference_weight || 1),
    }));

    return res.status(200).json({
      ok: true,
      interests,
      selected_category_ids: interests.map((item) => item.category_id),
      plan_tier: interestEntitlement.tier,
      max_interests: interestEntitlement.maxInterests,
      ...topicData,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load Reader interests.');
  }
}

async function saveReaderInterests(req, res) {
  const connection = await pool.getConnection();

  try {
    const readerId = req.user.id;
    const categoryIds = uniquePositiveInts(req.body?.category_ids);
    const interestEntitlement = await getReaderInterestEntitlement(readerId);

    if (categoryIds.length > interestEntitlement.maxInterests) {
      throw fail(
        `Choose no more than ${interestEntitlement.maxInterests} interests for your ${
          interestEntitlement.tier === 'premium'
            ? 'Premium'
            : interestEntitlement.tier === 'basic'
              ? 'Basic'
              : 'Free'
        } Reader tier. Leave all interests unticked to use the broad feed.`
      );
    }

    if (categoryIds.length) {
      const placeholders = categoryIds.map(() => '?').join(',');
      const [validRows] = await pool.query(
        `
        SELECT id
        FROM categories
        WHERE id IN (${placeholders})
          AND status = 'active'
        `,
        categoryIds
      );

      if (validRows.length !== categoryIds.length) {
        throw fail('One or more selected interests are invalid or inactive.');
      }
    }

    await connection.beginTransaction();

    await connection.query(
      `DELETE FROM reader_category_interests WHERE reader_user_id = ?`,
      [readerId]
    );

    for (const categoryId of categoryIds) {
      await connection.query(
        `
        INSERT INTO reader_category_interests (
          reader_user_id,
          category_id,
          preference_weight,
          created_at,
          updated_at
        )
        VALUES (?, ?, 1, NOW(), NOW())
        `,
        [readerId, categoryId]
      );
    }

    await connection.commit();

    return getReaderInterests(req, res);
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}
    return sendError(res, error, 'Failed to save Reader interests.');
  } finally {
    connection.release();
  }
}

async function getReaderFeed(req, res) {
  try {
    const readerId = req.user.id;
    const requestedLimit = Number(req.query?.limit || 20);
    const requestedOffset = Number(req.query?.offset || 0);
    const limit = Math.max(
      1,
      Math.min(80, Number.isFinite(requestedLimit) ? requestedLimit : 20)
    );
    const offset = Math.max(
      0,
      Math.min(
        1000000,
        Number.isFinite(requestedOffset)
          ? Math.trunc(requestedOffset)
          : 0
      )
    );

    const [rows] = await pool.query(
      `
      WITH RECURSIVE reader_interest_tree AS (
        SELECT
          rci.reader_user_id,
          c.id AS category_id
        FROM reader_category_interests rci
        INNER JOIN categories c
          ON c.id = rci.category_id
         AND c.status = 'active'
        WHERE rci.reader_user_id = ?

        UNION ALL

        SELECT
          rit.reader_user_id,
          child.id AS category_id
        FROM reader_interest_tree rit
        INNER JOIN categories child
          ON child.parent_id = rit.category_id
         AND child.status = 'active'
      )
      SELECT
        pp.id,
        pp.user_id AS writer_user_id,
        pp.website_id,
        pp.category_id,
        pp.content_type,
        pp.title,
        pp.slug,
        pp.excerpt,
        pp.featured_image,
        pp.published_at,
        pp.created_at,
        aw.website_name,
        aw.slug AS website_slug,
        primary_wp.slug AS writer_page_slug,
        c.name AS category_name,
        COALESCE(
          NULLIF(wp.pen_name, ''),
          NULLIF(wp.display_name, ''),
          NULLIF(u.name, ''),
          CONCAT('Writer ', u.id)
        ) AS writer_name,
        EXISTS(
          SELECT 1
          FROM reader_interest_tree rit
          WHERE
            rit.category_id = pp.category_id
            OR EXISTS(
              SELECT 1
              FROM post_category_assignments pca_match
              WHERE pca_match.post_id = pp.id
                AND pca_match.category_id = rit.category_id
            )
        ) AS interest_match,
        EXISTS(
          SELECT 1
          FROM writer_follows wf
          WHERE wf.reader_user_id = ?
            AND wf.writer_user_id = pp.user_id
        ) AS followed_writer,
        EXISTS(
          SELECT 1
          FROM reader_publication_follows rpf
          WHERE rpf.reader_user_id = ?
            AND rpf.website_id = pp.website_id
        ) AS followed_publication,
        (
          SELECT GROUP_CONCAT(
            c2.name
            ORDER BY
              pca2.is_primary DESC,
              c2.sort_order ASC,
              c2.name ASC
            SEPARATOR ', '
          )
          FROM post_category_assignments pca2
          INNER JOIN categories c2
            ON c2.id = pca2.category_id
           AND c2.status = 'active'
          WHERE pca2.post_id = pp.id
        ) AS topic_names
      FROM product_posts pp
      INNER JOIN users u
        ON u.id = pp.user_id
       AND u.status = 'active'
      LEFT JOIN affiliate_websites aw
        ON aw.id = pp.website_id
       AND aw.status = 'active'
      LEFT JOIN writer_pages primary_wp
        ON primary_wp.user_id = pp.user_id
       AND primary_wp.is_primary = 1
       AND primary_wp.status = 'active'
      LEFT JOIN writer_profiles wp
        ON wp.user_id = pp.user_id
       AND wp.status = 'active'
      LEFT JOIN categories c
        ON c.id = pp.category_id
      WHERE pp.status = 'published'
        AND (
          NOT EXISTS(
            SELECT 1
            FROM reader_category_interests rci_any
            INNER JOIN categories c_any
              ON c_any.id = rci_any.category_id
             AND c_any.status = 'active'
            WHERE rci_any.reader_user_id = ?
          )
          OR EXISTS(
            SELECT 1
            FROM reader_interest_tree rit_match
            WHERE rit_match.category_id = pp.category_id
               OR EXISTS(
                 SELECT 1
                 FROM post_category_assignments pca_interest
                 WHERE pca_interest.post_id = pp.id
                   AND pca_interest.category_id = rit_match.category_id
               )
          )
        )
        AND NOT EXISTS(
          SELECT 1
          FROM reader_content_mutes rcm
          WHERE rcm.reader_user_id = ?
            AND (
              (rcm.target_type = 'writer' AND rcm.target_id = pp.user_id)
              OR (rcm.target_type = 'publication' AND rcm.target_id = pp.website_id)
              OR (
                rcm.target_type = 'topic'
                AND (
                  rcm.target_id = pp.category_id
                  OR EXISTS(
                    SELECT 1
                    FROM post_category_assignments pca_mute
                    WHERE pca_mute.post_id = pp.id
                      AND pca_mute.category_id = rcm.target_id
                  )
                )
              )
            )
        )
      ORDER BY
        interest_match DESC,
        followed_writer DESC,
        followed_publication DESC,
        COALESCE(pp.published_at, pp.created_at) DESC,
        pp.id DESC
      LIMIT ? OFFSET ?
      `,
      [
        readerId,
        readerId,
        readerId,
        readerId,
        readerId,
        limit,
        offset,
      ]
    );

    return res.status(200).json({
      ok: true,
      feed: rows.map((row) => ({
        ...row,
        interest_match: !!row.interest_match,
        followed_writer: !!row.followed_writer,
        followed_publication: !!row.followed_publication,
        topics: row.topic_names
          ? String(row.topic_names).split(', ').filter(Boolean)
          : [],
      })),
      pagination: {
        limit,
        offset,
        returned: rows.length,
        next_offset: offset + rows.length,
        has_more: rows.length === limit,
      },
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load Reader feed.');
  }
}

async function getWriterPostTopics(req, res) {
  try {
    const postId = positiveInt(req.params.postId);

    if (!postId) throw fail('Valid post ID is required.');

    const [ownedRows] = await pool.query(
      `
      SELECT id, category_id
      FROM product_posts
      WHERE id = ?
        AND user_id = ?
      LIMIT 1
      `,
      [postId, req.user.id]
    );

    if (!ownedRows[0]) throw fail('Writer post not found.', 404);

    const topics = await getPostTopics(postId);

    return res.status(200).json({
      ok: true,
      post_id: postId,
      primary_category_id: ownedRows[0].category_id
        ? Number(ownedRows[0].category_id)
        : null,
      topic_ids: topics.map((item) => Number(item.id)),
      topics,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load post topics.');
  }
}

async function saveWriterPostTopics(req, res) {
  try {
    const postId = positiveInt(req.params.postId);

    if (!postId) throw fail('Valid post ID is required.');

    const [ownedRows] = await pool.query(
      `
      SELECT id, category_id
      FROM product_posts
      WHERE id = ?
        AND user_id = ?
      LIMIT 1
      `,
      [postId, req.user.id]
    );

    if (!ownedRows[0]) throw fail('Writer post not found.', 404);

    const categoryIds = await normalizeTopicSelection({
      primaryCategoryId: ownedRows[0].category_id,
      topicIds: req.body?.topic_ids,
    });

    const topics = await replacePostTopics({
      postId,
      writerUserId: req.user.id,
      primaryCategoryId: ownedRows[0].category_id,
      categoryIds,
    });

    return res.status(200).json({
      ok: true,
      message: 'Post topics updated.',
      topic_ids: topics.map((item) => Number(item.id)),
      topics,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to save post topics.');
  }
}

async function getAdminReadingConfig(req, res) {
  try {
    const [ruleRows] = await pool.query(
      `
      SELECT
        content_type,
        min_words,
        is_active,
        updated_by_user_id,
        created_at,
        updated_at
      FROM content_publish_rules
      ORDER BY content_type ASC
      `
    );

    return res.status(200).json({
      ok: true,
      category_management_path: '/admin/categories',
      publish_rules: ruleRows.map((row) => ({
        ...row,
        min_words: Number(row.min_words || 0),
        is_active: !!row.is_active,
      })),
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load Reading Core settings.');
  }
}

async function updatePublishRule(req, res) {
  try {
    const contentType = String(req.params.contentType || '').trim().toLowerCase();

    if (!CONTENT_TYPES.has(contentType)) {
      throw fail('Unsupported content type.');
    }

    const minWords = Number.parseInt(req.body?.min_words, 10);

    if (!Number.isInteger(minWords) || minWords < 0 || minWords > 5000) {
      throw fail('Minimum words must be between 0 and 5000.');
    }

    const isActive =
      req.body?.is_active === undefined
        ? true
        : req.body.is_active === true ||
          req.body.is_active === 1 ||
          req.body.is_active === '1';

    await pool.query(
      `
      INSERT INTO content_publish_rules (
        content_type,
        min_words,
        is_active,
        updated_by_user_id,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        min_words = VALUES(min_words),
        is_active = VALUES(is_active),
        updated_by_user_id = VALUES(updated_by_user_id),
        updated_at = NOW()
      `,
      [contentType, minWords, isActive ? 1 : 0, req.user.id]
    );

    return res.status(200).json({
      ok: true,
      message: 'Publish rule updated.',
      rule: {
        content_type: contentType,
        min_words: minWords,
        is_active: isActive,
      },
    });
  } catch (error) {
    return sendError(res, error, 'Failed to update publish rule.');
  }
}

module.exports = {
  getPublicTopics,
  getPublicTopicBySlug,
  getReaderInterests,
  saveReaderInterests,
  getReaderFeed,
  getWriterPostTopics,
  saveWriterPostTopics,
  getAdminReadingConfig,
  updatePublishRule,
};