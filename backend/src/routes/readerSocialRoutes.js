const express = require('express');
const {
  protect,
  customerOnly,
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

router.get('/posts/:postId', protect, customerOnly, getReaderPostState);
router.get('/following', protect, customerOnly, getReaderFollowing);
router.post('/writers/:writerId/follow', protect, customerOnly, toggleWriterFollow);
router.post(
  '/posts/:postId/reactions/:reactionType',
  protect,
  customerOnly,
  togglePostReaction
);
router.post('/posts/:postId/comments', protect, customerOnly, createReaderComment);

router.get('/notifications', protect, customerOnly, getMyNotifications);
router.patch(
  '/notifications/mark-all-read',
  protect,
  customerOnly,
  markAllNotificationsRead
);
router.patch(
  '/notifications/:notificationId/read',
  protect,
  customerOnly,
  markNotificationRead
);

module.exports = router;