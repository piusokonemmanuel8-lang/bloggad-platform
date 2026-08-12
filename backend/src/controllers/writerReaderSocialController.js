const pool = require('../config/db');

function toPositiveInt(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function cleanText(value, maxLength = 4000) {
  return String(value || '').trim().slice(0, maxLength);
}

async function getPublishedPost(postId) {
  const [rows] = await pool.query(
    `
    SELECT
      pp.id,
      pp.user_id AS writer_id,
      pp.website_id,
      pp.title,
      pp.slug,
      pp.status,
      u.name AS writer_name,
      aw.website_name,
      aw.slug AS website_slug
    FROM product_posts pp
    INNER JOIN users u
      ON u.id = pp.user_id
     AND u.role = 'affiliate'
     AND u.status = 'active'
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

async function getActiveWriter(writerId) {
  const [rows] = await pool.query(
    `
    SELECT
      u.id,
      u.name,
      u.status,
      u.role,
      wp.id AS writer_profile_id,
      wp.display_name,
      wp.pen_name,
      wp.slug AS profile_slug,
      wp.tagline,
      wp.bio,
      wp.avatar_url,
      wp.cover_url,
      wp.website_url,
      COALESCE(
        NULLIF(wp.pen_name, ''),
        NULLIF(wp.display_name, ''),
        NULLIF(u.name, ''),
        CONCAT('Writer ', u.id)
      ) AS public_name
    FROM users u
    LEFT JOIN writer_profiles wp
      ON wp.user_id = u.id
     AND wp.status = 'active'
    WHERE u.id = ?
      AND u.role = 'affiliate'
      AND u.status = 'active'
    LIMIT 1
    `,
    [writerId]
  );

  return rows[0] || null;
}

async function createNotification({
  recipientUserId,
  actorUserId = null,
  type,
  postId = null,
  commentId = null,
  title,
  message,
}) {
  if (!recipientUserId || !type || !title || !message) return;

  if (actorUserId && Number(actorUserId) === Number(recipientUserId)) return;

  await pool.query(
    `
    INSERT INTO user_notifications (
      recipient_user_id,
      actor_user_id,
      notification_type,
      post_id,
      comment_id,
      title,
      message,
      is_read,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW())
    `,
    [
      recipientUserId,
      actorUserId,
      cleanText(type, 60),
      postId || null,
      commentId || null,
      cleanText(title, 190),
      cleanText(message, 500),
    ]
  );
}

async function getReactionCounts(postId) {
  const [rows] = await pool.query(
    `
    SELECT
      SUM(CASE WHEN reaction_type = 'love' THEN 1 ELSE 0 END) AS love_count,
      SUM(CASE WHEN reaction_type = 'applaud' THEN 1 ELSE 0 END) AS applaud_count
    FROM post_reactions
    WHERE post_id = ?
    `,
    [postId]
  );

  return {
    love_count: Number(rows[0]?.love_count || 0),
    applaud_count: Number(rows[0]?.applaud_count || 0),
  };
}

async function getFollowerCount(writerId) {
  const [rows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM writer_follows
    WHERE writer_user_id = ?
    `,
    [writerId]
  );

  return Number(rows[0]?.total || 0);
}

async function getCommentCount(postId) {
  const [rows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM post_comments
    WHERE post_id = ?
      AND status = 'active'
    `,
    [postId]
  );

  return Number(rows[0]?.total || 0);
}

async function getPublicComments(postId) {
  const [rows] = await pool.query(
    `
    SELECT
      pc.id,
      pc.post_id,
      pc.user_id,
      pc.parent_comment_id,
      pc.quoted_comment_id,
      pc.quoted_text,
      pc.body,
      pc.created_at,
      pc.updated_at,
      u.name AS author_name,
      u.role AS internal_role,
      quoted_user.name AS quoted_author_name
    FROM post_comments pc
    INNER JOIN users u
      ON u.id = pc.user_id
    LEFT JOIN post_comments quoted_comment
      ON quoted_comment.id = pc.quoted_comment_id
     AND quoted_comment.status = 'active'
    LEFT JOIN users quoted_user
      ON quoted_user.id = quoted_comment.user_id
    WHERE pc.post_id = ?
      AND pc.status = 'active'
    ORDER BY
      COALESCE(pc.parent_comment_id, pc.id) ASC,
      CASE WHEN pc.parent_comment_id IS NULL THEN 0 ELSE 1 END ASC,
      pc.id ASC
    `,
    [postId]
  );

  const topLevel = [];
  const byId = new Map();

  for (const row of rows) {
    const item = {
      id: row.id,
      post_id: row.post_id,
      user_id: row.user_id,
      parent_comment_id: row.parent_comment_id,
      quoted_comment_id: row.quoted_comment_id ? Number(row.quoted_comment_id) : null,
      quoted_text: row.quoted_text || null,
      quoted_author_name: row.quoted_author_name || null,
      body: row.body,
      created_at: row.created_at,
      updated_at: row.updated_at,
      author: {
        id: row.user_id,
        name: row.author_name,
        role: row.internal_role === 'affiliate' ? 'writer' : 'reader',
      },
      replies: [],
    };

    byId.set(Number(item.id), item);

    if (!item.parent_comment_id) {
      topLevel.push(item);
    }
  }

  for (const row of rows) {
    if (!row.parent_comment_id) continue;

    const reply = byId.get(Number(row.id));
    const parent = byId.get(Number(row.parent_comment_id));

    if (reply && parent) {
      parent.replies.push(reply);
    }
  }

  return topLevel;
}

async function getPublicPostSocial(req, res) {
  try {
    const postId = toPositiveInt(req.params.postId);

    if (!postId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid post ID is required.',
      });
    }

    const post = await getPublishedPost(postId);

    if (!post) {
      return res.status(404).json({
        ok: false,
        message: 'Published post not found.',
      });
    }

    const [reactionCounts, followerCount, commentCount, comments] = await Promise.all([
      getReactionCounts(post.id),
      getFollowerCount(post.writer_id),
      getCommentCount(post.id),
      getPublicComments(post.id),
    ]);

    return res.status(200).json({
      ok: true,
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
      },
      writer: {
        id: post.writer_id,
        name: post.writer_name,
        follower_count: followerCount,
      },
      counts: {
        love: reactionCounts.love_count,
        applaud: reactionCounts.applaud_count,
        comments: commentCount,
        followers: followerCount,
      },
      comments,
    });
  } catch (error) {
    console.error('getPublicPostSocial error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to load post interactions.',
      error: error.message,
    });
  }
}

async function getPublicWriterSocial(req, res) {
  try {
    const writerId = toPositiveInt(req.params.writerId);

    if (!writerId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid Writer ID is required.',
      });
    }

    const writer = await getActiveWriter(writerId);

    if (!writer) {
      return res.status(404).json({
        ok: false,
        message: 'Writer not found.',
      });
    }

    const [followerCount, websiteRows, postRows] = await Promise.all([
      getFollowerCount(writer.id),
      pool.query(
        `
        SELECT
          id,
          website_name,
          slug
        FROM affiliate_websites
        WHERE user_id = ?
          AND status = 'active'
        ORDER BY id DESC
        LIMIT 1
        `,
        [writer.id]
      ),
      pool.query(
        `
        SELECT
          pp.id,
          pp.title,
          pp.slug,
          pp.excerpt,
          pp.featured_image,
          pp.content_type,
          pp.published_at,
          aw.slug AS website_slug
        FROM product_posts pp
        LEFT JOIN affiliate_websites aw ON aw.id = pp.website_id
         AND aw.status = 'active'
        WHERE pp.user_id = ?
          AND pp.status = 'published'
        ORDER BY COALESCE(pp.published_at, pp.created_at) DESC, pp.id DESC
        LIMIT 12
        `,
        [writer.id]
      ),
    ]);

    return res.status(200).json({
      ok: true,
      writer: {
        id: writer.id,
        name: writer.public_name,
        display_name: writer.display_name || null,
        pen_name: writer.pen_name || null,
        slug: writer.profile_slug || null,
        tagline: writer.tagline || null,
        bio: writer.bio || null,
        avatar_url: writer.avatar_url || null,
        cover_url: writer.cover_url || null,
        website_url: writer.website_url || null,
        follower_count: followerCount,
        website: websiteRows[0][0] || null,
        posts: postRows[0] || [],
      },
    });
  } catch (error) {
    console.error('getPublicWriterSocial error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to load Writer information.',
      error: error.message,
    });
  }
}

async function getReaderPostState(req, res) {
  try {
    const postId = toPositiveInt(req.params.postId);
    const readerId = req.user.id;

    if (!postId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid post ID is required.',
      });
    }

    const post = await getPublishedPost(postId);

    if (!post) {
      return res.status(404).json({
        ok: false,
        message: 'Published post not found.',
      });
    }

    const [followRows, reactionRows, reactionCounts, followerCount, commentCount, comments] =
      await Promise.all([
        pool.query(
          `
          SELECT id
          FROM writer_follows
          WHERE reader_user_id = ?
            AND writer_user_id = ?
          LIMIT 1
          `,
          [readerId, post.writer_id]
        ),
        pool.query(
          `
          SELECT reaction_type
          FROM post_reactions
          WHERE reader_user_id = ?
            AND post_id = ?
          `,
          [readerId, post.id]
        ),
        getReactionCounts(post.id),
        getFollowerCount(post.writer_id),
        getCommentCount(post.id),
        getPublicComments(post.id),
      ]);

    const reactionTypes = reactionRows[0].map((row) => row.reaction_type);

    return res.status(200).json({
      ok: true,
      writer: {
        id: post.writer_id,
        name: post.writer_name,
      },
      state: {
        following: followRows[0].length > 0,
        loved: reactionTypes.includes('love'),
        applauded: reactionTypes.includes('applaud'),
      },
      counts: {
        love: reactionCounts.love_count,
        applaud: reactionCounts.applaud_count,
        comments: commentCount,
        followers: followerCount,
      },
      comments,
    });
  } catch (error) {
    console.error('getReaderPostState error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to load Reader interaction state.',
      error: error.message,
    });
  }
}

async function toggleWriterFollow(req, res) {
  try {
    const writerId = toPositiveInt(req.params.writerId);
    const readerId = req.user.id;

    if (!writerId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid Writer ID is required.',
      });
    }

    if (Number(writerId) === Number(readerId)) {
      return res.status(400).json({
        ok: false,
        message: 'You cannot follow your own Writer account.',
      });
    }

    const writer = await getActiveWriter(writerId);

    if (!writer) {
      return res.status(404).json({
        ok: false,
        message: 'Writer not found.',
      });
    }

    const [existingRows] = await pool.query(
      `
      SELECT id
      FROM writer_follows
      WHERE reader_user_id = ?
        AND writer_user_id = ?
      LIMIT 1
      `,
      [readerId, writerId]
    );

    let following = false;

    if (existingRows[0]) {
      await pool.query(
        `
        DELETE FROM writer_follows
        WHERE id = ?
        `,
        [existingRows[0].id]
      );
    } else {
      await pool.query(
        `
        INSERT INTO writer_follows (
          reader_user_id,
          writer_user_id,
          created_at
        )
        VALUES (?, ?, NOW())
        `,
        [readerId, writerId]
      );

      following = true;

      await createNotification({
        recipientUserId: writerId,
        actorUserId: readerId,
        type: 'reader_followed_writer',
        title: 'New Reader follower',
        message: 'A Reader followed your Writer profile.',
      });
    }

    const followerCount = await getFollowerCount(writerId);

    return res.status(200).json({
      ok: true,
      following,
      follower_count: followerCount,
      message: following ? 'Writer followed.' : 'Writer unfollowed.',
    });
  } catch (error) {
    console.error('toggleWriterFollow error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update Writer follow.',
      error: error.message,
    });
  }
}

async function togglePostReaction(req, res) {
  try {
    const postId = toPositiveInt(req.params.postId);
    const readerId = req.user.id;
    const reactionType = cleanText(req.params.reactionType, 20).toLowerCase();

    if (!postId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid post ID is required.',
      });
    }

    if (!['love', 'applaud'].includes(reactionType)) {
      return res.status(400).json({
        ok: false,
        message: 'Reaction must be Love or Applaud.',
      });
    }

    const post = await getPublishedPost(postId);

    if (!post) {
      return res.status(404).json({
        ok: false,
        message: 'Published post not found.',
      });
    }

    const [existingRows] = await pool.query(
      `
      SELECT id
      FROM post_reactions
      WHERE post_id = ?
        AND reader_user_id = ?
        AND reaction_type = ?
      LIMIT 1
      `,
      [post.id, readerId, reactionType]
    );

    let active = false;

    if (existingRows[0]) {
      await pool.query(
        `
        DELETE FROM post_reactions
        WHERE id = ?
        `,
        [existingRows[0].id]
      );
    } else {
      await pool.query(
        `
        INSERT INTO post_reactions (
          post_id,
          reader_user_id,
          reaction_type,
          created_at
        )
        VALUES (?, ?, ?, NOW())
        `,
        [post.id, readerId, reactionType]
      );

      active = true;

      await createNotification({
        recipientUserId: post.writer_id,
        actorUserId: readerId,
        type: reactionType === 'love' ? 'reader_loved_post' : 'reader_applauded_post',
        postId: post.id,
        title: reactionType === 'love' ? 'A Reader loved your post' : 'A Reader applauded your post',
        message:
          reactionType === 'love'
            ? `A Reader loved "${post.title}".`
            : `A Reader applauded "${post.title}".`,
      });
    }

    const counts = await getReactionCounts(post.id);

    return res.status(200).json({
      ok: true,
      reaction: reactionType,
      active,
      counts: {
        love: counts.love_count,
        applaud: counts.applaud_count,
      },
    });
  } catch (error) {
    console.error('togglePostReaction error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update post reaction.',
      error: error.message,
    });
  }
}

async function createReaderComment(req, res) {
  try {
    const postId = toPositiveInt(req.params.postId);
    const readerId = req.user.id;
    const body = cleanText(req.body?.body, 5000);
    const quotedCommentId = toPositiveInt(req.body?.quoted_comment_id);
    const quotedTextInput = cleanText(req.body?.quoted_text, 1000);

    if (!postId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid post ID is required.',
      });
    }

    if (!body) {
      return res.status(400).json({
        ok: false,
        message: 'Comment is required.',
      });
    }

    const post = await getPublishedPost(postId);

    if (!post) {
      return res.status(404).json({
        ok: false,
        message: 'Published post not found.',
      });
    }

    let quotedText = null;

    if (quotedCommentId || quotedTextInput) {
      if (!quotedCommentId || !quotedTextInput) {
        return res.status(400).json({
          ok: false,
          message: 'A quoted comment and quoted text are both required.',
        });
      }

      const [quoteRows] = await pool.query(
        `
        SELECT id, post_id, body
        FROM post_comments
        WHERE id = ?
          AND post_id = ?
          AND status = 'active'
        LIMIT 1
        `,
        [quotedCommentId, post.id]
      );

      const quoteSource = quoteRows[0];

      if (!quoteSource) {
        return res.status(400).json({
          ok: false,
          message: 'The quoted comment is not available on this post.',
        });
      }

      const sourceBody = String(quoteSource.body || '');
      const maximumQuoteLength = Math.max(
        1,
        Math.min(500, Math.ceil(sourceBody.length * 0.2))
      );

      if (quotedTextInput.length > maximumQuoteLength) {
        return res.status(400).json({
          ok: false,
          message: `Quote no more than ${maximumQuoteLength} characters from this comment.`,
        });
      }

      if (!sourceBody.includes(quotedTextInput)) {
        return res.status(400).json({
          ok: false,
          message: 'Quoted text must be an exact part of the selected comment.',
        });
      }

      quotedText = quotedTextInput;
    }

    const [result] = await pool.query(
      `
      INSERT INTO post_comments (
        post_id,
        user_id,
        parent_comment_id,
        quoted_comment_id,
        quoted_text,
        body,
        status,
        created_at,
        updated_at
      )
      VALUES (?, ?, NULL, ?, ?, ?, 'active', NOW(), NOW())
      `,
      [post.id, readerId, quotedCommentId || null, quotedText, body]
    );

    await createNotification({
      recipientUserId: post.writer_id,
      actorUserId: readerId,
      type: 'reader_commented_post',
      postId: post.id,
      commentId: result.insertId,
      title: 'New Reader comment',
      message: `A Reader commented on "${post.title}".`,
    });

    const comments = await getPublicComments(post.id);
    const commentCount = await getCommentCount(post.id);

    return res.status(201).json({
      ok: true,
      message: quotedCommentId ? 'Quoted comment posted.' : 'Comment posted.',
      comment_id: result.insertId,
      comment_count: commentCount,
      comments,
    });
  } catch (error) {
    console.error('createReaderComment error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to post comment.',
      error: error.message,
    });
  }
}

async function createWriterReply(req, res) {
  try {
    const commentId = toPositiveInt(req.params.commentId);
    const writerId = req.user.id;
    const body = cleanText(req.body?.body, 5000);

    if (!commentId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid comment ID is required.',
      });
    }

    if (!body) {
      return res.status(400).json({
        ok: false,
        message: 'Reply is required.',
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
        pc.id,
        pc.post_id,
        pc.user_id AS reader_user_id,
        pc.parent_comment_id,
        pc.status,
        pp.user_id AS writer_id,
        pp.title AS post_title,
        pp.status AS post_status
      FROM post_comments pc
      INNER JOIN product_posts pp
        ON pp.id = pc.post_id
      WHERE pc.id = ?
      LIMIT 1
      `,
      [commentId]
    );

    const comment = rows[0] || null;

    if (!comment || comment.status !== 'active') {
      return res.status(404).json({
        ok: false,
        message: 'Comment not found.',
      });
    }

    if (comment.parent_comment_id) {
      return res.status(400).json({
        ok: false,
        message: 'Writer replies can only target a top-level Reader comment.',
      });
    }

    if (Number(comment.writer_id) !== Number(writerId)) {
      return res.status(403).json({
        ok: false,
        message: 'You can only reply to comments on your own posts.',
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO post_comments (
        post_id,
        user_id,
        parent_comment_id,
        body,
        status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, 'active', NOW(), NOW())
      `,
      [comment.post_id, writerId, comment.id, body]
    );

    await createNotification({
      recipientUserId: comment.reader_user_id,
      actorUserId: writerId,
      type: 'writer_replied_comment',
      postId: comment.post_id,
      commentId: result.insertId,
      title: 'Writer replied to your comment',
      message: `The Writer replied to your comment on "${comment.post_title}".`,
    });

    const comments = await getPublicComments(comment.post_id);
    const commentCount = await getCommentCount(comment.post_id);

    return res.status(201).json({
      ok: true,
      message: 'Reply posted.',
      reply_id: result.insertId,
      comment_count: commentCount,
      comments,
    });
  } catch (error) {
    console.error('createWriterReply error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to post Writer reply.',
      error: error.message,
    });
  }
}

async function getReaderFollowing(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        wf.writer_user_id,
        wf.created_at AS followed_at,
        COALESCE(NULLIF(u.name, ''), CONCAT('Writer ', u.id)) AS writer_name,
        (
          SELECT aw.slug
          FROM affiliate_websites aw
          WHERE aw.user_id = u.id
            AND aw.status = 'active'
          ORDER BY aw.id DESC
          LIMIT 1
        ) AS website_slug,
        (
          SELECT COUNT(*)
          FROM writer_follows wf2
          WHERE wf2.writer_user_id = wf.writer_user_id
        ) AS follower_count
      FROM writer_follows wf
      INNER JOIN users u
        ON u.id = wf.writer_user_id
       AND u.role = 'affiliate'
       AND u.status = 'active'
      WHERE wf.reader_user_id = ?
      ORDER BY wf.created_at DESC, wf.id DESC
      `,
      [req.user.id]
    );

    return res.status(200).json({
      ok: true,
      following: rows.map((row) => ({
        ...row,
        follower_count: Number(row.follower_count || 0),
      })),
    });
  } catch (error) {
    console.error('getReaderFollowing error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to load followed Writers.',
      error: error.message,
    });
  }
}

async function getWriterFollowers(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        wf.reader_user_id,
        u.name AS reader_name,
        wf.created_at AS followed_at
      FROM writer_follows wf
      INNER JOIN users u
        ON u.id = wf.reader_user_id
       AND u.role = 'customer'
       AND u.status = 'active'
      WHERE wf.writer_user_id = ?
      ORDER BY wf.created_at DESC, wf.id DESC
      `,
      [req.user.id]
    );

    return res.status(200).json({
      ok: true,
      followers: rows,
    });
  } catch (error) {
    console.error('getWriterFollowers error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to load Writer followers.',
      error: error.message,
    });
  }
}

async function getWriterComments(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        pc.id,
        pc.post_id,
        pc.user_id AS reader_user_id,
        pc.body,
        pc.created_at,
        pc.updated_at,
        u.name AS reader_name,
        pp.title AS post_title,
        pp.slug AS post_slug,
        aw.slug AS website_slug,
        (
          SELECT COUNT(*)
          FROM post_comments replies
          WHERE replies.parent_comment_id = pc.id
            AND replies.status = 'active'
        ) AS reply_count
      FROM post_comments pc
      INNER JOIN product_posts pp
        ON pp.id = pc.post_id
       AND pp.user_id = ?
      INNER JOIN users u
        ON u.id = pc.user_id
       AND u.role = 'customer'
      LEFT JOIN affiliate_websites aw ON aw.id = pp.website_id
      WHERE pc.parent_comment_id IS NULL
        AND pc.status = 'active'
      ORDER BY pc.created_at DESC, pc.id DESC
      LIMIT 500
      `,
      [req.user.id]
    );

    return res.status(200).json({
      ok: true,
      comments: rows.map((row) => ({
        ...row,
        reply_count: Number(row.reply_count || 0),
      })),
    });
  } catch (error) {
    console.error('getWriterComments error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to load Writer comments.',
      error: error.message,
    });
  }
}

async function getMyNotifications(req, res) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT
        n.id,
        n.recipient_user_id,
        n.actor_user_id,
        n.notification_type,
        n.post_id,
        n.comment_id,
        n.title,
        n.message,
        n.is_read,
        n.read_at,
        n.created_at,
        actor.name AS actor_name,
        actor.role AS actor_internal_role,
        pp.title AS post_title,
        pp.slug AS post_slug,
        aw.slug AS website_slug
      FROM user_notifications n
      LEFT JOIN users actor
        ON actor.id = n.actor_user_id
      LEFT JOIN product_posts pp
        ON pp.id = n.post_id
      LEFT JOIN affiliate_websites aw
        ON aw.id = pp.website_id
      WHERE n.recipient_user_id = ?
      ORDER BY n.created_at DESC, n.id DESC
      LIMIT 200
      `,
      [userId]
    );

    return res.status(200).json({
      ok: true,
      notifications: rows.map((row) => ({
        id: row.id,
        type: row.notification_type,
        title: row.title,
        message: row.message,
        is_read: Boolean(row.is_read),
        read_at: row.read_at,
        created_at: row.created_at,
        actor: row.actor_user_id
          ? {
              id: row.actor_user_id,
              name: row.actor_name,
              role: row.actor_internal_role === 'affiliate' ? 'writer' : 'reader',
            }
          : null,
        post: row.post_id
          ? {
              id: row.post_id,
              title: row.post_title,
              slug: row.post_slug,
              website_slug: row.website_slug,
            }
          : null,
        comment_id: row.comment_id || null,
      })),
    });
  } catch (error) {
    console.error('getMyNotifications error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to load notifications.',
      error: error.message,
    });
  }
}

async function markNotificationRead(req, res) {
  try {
    const notificationId = toPositiveInt(req.params.notificationId);

    if (!notificationId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid notification ID is required.',
      });
    }

    const [result] = await pool.query(
      `
      UPDATE user_notifications
      SET
        is_read = 1,
        read_at = COALESCE(read_at, NOW())
      WHERE id = ?
        AND recipient_user_id = ?
      `,
      [notificationId, req.user.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        ok: false,
        message: 'Notification not found.',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Notification marked as read.',
    });
  } catch (error) {
    console.error('markNotificationRead error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update notification.',
      error: error.message,
    });
  }
}

async function markAllNotificationsRead(req, res) {
  try {
    await pool.query(
      `
      UPDATE user_notifications
      SET
        is_read = 1,
        read_at = COALESCE(read_at, NOW())
      WHERE recipient_user_id = ?
        AND is_read = 0
      `,
      [req.user.id]
    );

    return res.status(200).json({
      ok: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    console.error('markAllNotificationsRead error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update notifications.',
      error: error.message,
    });
  }
}

module.exports = {
  getPublicPostSocial,
  getPublicWriterSocial,
  getReaderPostState,
  getReaderFollowing,
  getWriterFollowers,
  getWriterComments,
  toggleWriterFollow,
  togglePostReaction,
  createReaderComment,
  createWriterReply,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};