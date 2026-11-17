const express = require('express');
const pool = require('../../config/db');
const { protect, affiliateOnly } = require('../../middleware/authMiddleware');

const router = express.Router();
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function integer(value, max) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0 || number > max) {
    return null;
  }
  return number;
}

router.post('/', async (req, res) => {
  const body = req.body || {};
  const key = String(body.playback_key || '').trim();
  const postId = integer(body.post_id, 2147483647);
  const videoKey = String(body.video_key || '').trim();
  const watched = integer(body.watched_seconds, 86400);
  const progress = integer(body.max_progress_percent, 100);
  const duration = body.duration_seconds == null
    ? null
    : integer(body.duration_seconds, 86400);
  const completed = body.completed === true && progress === 100;

  if (
    !uuidPattern.test(key) ||
    !postId ||
    !/^[A-Za-z0-9:_-]{6,191}$/.test(videoKey) ||
    watched === null ||
    progress === null ||
    (body.duration_seconds != null && duration === null)
  ) {
    return res.status(400).json({ ok: false, message: 'Invalid playback event' });
  }

  try {
    const [posts] = await pool.query(
      'SELECT id, user_id FROM product_posts WHERE id = ? LIMIT 1',
      [postId]
    );
    if (!posts.length || !Number(posts[0].user_id)) {
      return res.status(404).json({ ok: false, message: 'Post unavailable' });
    }

    const playerType = videoKey.startsWith('youtube:')
      ? 'youtube'
      : videoKey.startsWith('vimeo:')
        ? 'vimeo'
        : 'html5';
    await pool.query(
      'INSERT INTO bloggad_video_watch_sessions ' +
      '(playback_key, post_id, video_key, writer_user_id, player_type, ' +
      'duration_seconds, watched_seconds, max_progress_percent, completed, completed_at) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, IF(? = 1, NOW(), NULL)) ' +
      'ON DUPLICATE KEY UPDATE ' +
      'watched_seconds = IF(post_id = VALUES(post_id) AND video_key = VALUES(video_key), ' +
      'GREATEST(watched_seconds, VALUES(watched_seconds)), watched_seconds), ' +
      'max_progress_percent = IF(post_id = VALUES(post_id) AND video_key = VALUES(video_key), ' +
      'GREATEST(max_progress_percent, VALUES(max_progress_percent)), max_progress_percent), ' +
      'duration_seconds = IF(post_id = VALUES(post_id) AND video_key = VALUES(video_key), ' +
      'COALESCE(duration_seconds, VALUES(duration_seconds)), duration_seconds), ' +
      'completed_at = IF(post_id = VALUES(post_id) AND video_key = VALUES(video_key) ' +
      'AND (completed = 1 OR VALUES(completed) = 1), ' +
      'COALESCE(completed_at, NOW()), completed_at), ' +
      'completed = IF(post_id = VALUES(post_id) AND video_key = VALUES(video_key), ' +
      'GREATEST(completed, VALUES(completed)), completed), ' +
      'last_activity_at = IF(post_id = VALUES(post_id) AND video_key = VALUES(video_key), ' +
      'NOW(), last_activity_at)',
      [key, postId, videoKey, posts[0].user_id, playerType,
        duration, watched, progress, completed ? 1 : 0, completed ? 1 : 0]
    );

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('[video-watch] Event persistence failed:', error.code || 'UNKNOWN');
    return res.status(503).json({ ok: false, message: 'Video tracking unavailable' });
  }
});

router.get('/writer/posts/:postId', protect, affiliateOnly, async (req, res) => {
  const postId = integer(req.params.postId, 2147483647);
  const userId = integer(req.user && req.user.id, 2147483647);

  if (!postId || !userId) {
    return res.status(400).json({ ok: false, message: 'Invalid request' });
  }

  try {
    const [owned] = await pool.query(
      'SELECT id FROM product_posts WHERE id = ? AND user_id = ? LIMIT 1',
      [postId, userId]
    );

    if (!owned.length) {
      return res.status(404).json({ ok: false, message: 'Post not found' });
    }

    const [[summary]] = await pool.query(
      'SELECT COUNT(*) AS playback_sessions, ' +
      'COALESCE(SUM(watched_seconds), 0) AS watched_seconds, ' +
      'COALESCE(SUM(completed = 1), 0) AS completed_plays, ' +
      'COALESCE(AVG(max_progress_percent), 0) AS average_progress_percent ' +
      'FROM bloggad_video_watch_sessions WHERE post_id = ? AND writer_user_id = ?',
      [postId, userId]
    );

    return res.json({
      ok: true,
      post_id: postId,
      video_analytics: summary
    });
  } catch (error) {
    console.error('[video-watch] Reporting failed:', error.code || 'UNKNOWN');
    return res.status(503).json({ ok: false, message: 'Video analytics unavailable' });
  }
});

module.exports = router;