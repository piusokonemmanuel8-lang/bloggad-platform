const express = require('express');
const {
  protect,
  authorize,
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
const readerOrWriterSocial = authorize('customer', 'affiliate');

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Reader social routes working',
  });
});

router.get('/posts/:postId', protect, readerOrWriterSocial, getReaderPostState);
router.get('/following', protect, readerOrWriterSocial, getReaderFollowing);
router.post('/writers/:writerId/follow', protect, readerOrWriterSocial, toggleWriterFollow);
router.post(
  '/posts/:postId/reactions/:reactionType',
  protect,
  readerOrWriterSocial,
  togglePostReaction
);
router.post('/posts/:postId/comments', protect, readerOrWriterSocial, createReaderComment);

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