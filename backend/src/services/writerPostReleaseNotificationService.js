const pool = require('../config/db');

function positiveInt(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

async function publishPostAndNotifyFollowersOnce({
  postId,
  writerUserId,
}) {
  const safePostId = positiveInt(postId);
  const safeWriterId = positiveInt(writerUserId);

  if (!safePostId || !safeWriterId) {
    throw new Error('Valid post and Writer IDs are required for release.');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[post]] = await connection.query(
      `
      SELECT
        id,
        user_id,
        title,
        status,
        published_at
      FROM product_posts
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [safePostId]
    );

    if (!post || Number(post.user_id) !== safeWriterId) {
      throw new Error('Writer post not found for release.');
    }

    const wasAlreadyPublished = post.status === 'published';

    await connection.query(
      `
      UPDATE product_posts
      SET
        status = 'published',
        published_at = COALESCE(published_at, NOW()),
        updated_at = NOW()
      WHERE id = ?
        AND user_id = ?
      `,
      [safePostId, safeWriterId]
    );

    const [[existingEvent]] = await connection.query(
      `
      SELECT
        id,
        release_kind,
        released_at,
        follower_count,
        notifications_created
      FROM writer_post_release_events
      WHERE post_id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [safePostId]
    );

    if (existingEvent) {
      await connection.commit();

      return {
        published_now: !wasAlreadyPublished,
        release_recorded: true,
        release_kind: existingEvent.release_kind,
        notifications_created: Number(existingEvent.notifications_created || 0),
      };
    }

    const releaseKind = wasAlreadyPublished
      ? 'existing_published'
      : 'first_publish';

    let notificationsCreated = 0;

    if (!wasAlreadyPublished) {
      const safeTitle = String(post.title || 'Untitled post').slice(0, 420);
      const notificationMessage = `A Writer you follow published "${safeTitle}".`;

      const [notificationResult] = await connection.query(
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
        SELECT
          wf.reader_user_id,
          ?,
          'writer_post_published',
          ?,
          NULL,
          'New post from a Writer',
          ?,
          0,
          NOW()
        FROM writer_follows wf
        INNER JOIN users reader
          ON reader.id = wf.reader_user_id
         AND reader.role = 'customer'
         AND reader.status = 'active'
        WHERE wf.writer_user_id = ?
        `,
        [
          safeWriterId,
          safePostId,
          notificationMessage,
          safeWriterId,
        ]
      );

      notificationsCreated = Number(notificationResult.affectedRows || 0);
    }

    await connection.query(
      `
      INSERT INTO writer_post_release_events (
        post_id,
        writer_user_id,
        release_kind,
        released_at,
        follower_count,
        notifications_created,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, COALESCE(?, NOW()), ?, ?, NOW(), NOW())
      `,
      [
        safePostId,
        safeWriterId,
        releaseKind,
        post.published_at || null,
        notificationsCreated,
        notificationsCreated,
      ]
    );

    await connection.commit();

    return {
      published_now: !wasAlreadyPublished,
      release_recorded: true,
      release_kind: releaseKind,
      notifications_created: notificationsCreated,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  publishPostAndNotifyFollowersOnce,
};