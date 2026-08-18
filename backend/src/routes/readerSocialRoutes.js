const express = require('express');
const {
  protect,
  readerOrWriter,
} = require('../middleware/authMiddleware');
const {
  getReaderPostState,
  getReaderFollowing,
  toggleWriterFollow,
  togglePostReaction,
  createReaderComment,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/writerReaderSocialController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Reader social routes working',
  });
});

router.get('/posts/:postId', protect, readerOrWriter, getReaderPostState);
router.get('/following', protect, readerOrWriter, getReaderFollowing);
router.post('/writers/:writerId/follow', protect, readerOrWriter, toggleWriterFollow);
router.post(
  '/posts/:postId/reactions/:reactionType',
  protect,
  readerOrWriter,
  togglePostReaction
);
router.post('/posts/:postId/comments', protect, readerOrWriter, createReaderComment);

router.get('/notifications', protect, readerOrWriter, getMyNotifications);
router.patch(
  '/notifications/mark-all-read',
  protect,
  readerOrWriter,
  markAllNotificationsRead
);
router.patch(
  '/notifications/:notificationId/read',
  protect,
  readerOrWriter,
  markNotificationRead
);

module.exports = router;