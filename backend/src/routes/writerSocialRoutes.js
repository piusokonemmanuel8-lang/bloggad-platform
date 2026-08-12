const express = require('express');
const {
  protect,
  affiliateOnly,
} = require('../middleware/authMiddleware');
const {
  createWriterReply,
  getWriterFollowers,
  getWriterComments,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/writerReaderSocialController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Writer social routes working',
  });
});

router.get('/followers', protect, affiliateOnly, getWriterFollowers);
router.get('/comments', protect, affiliateOnly, getWriterComments);

router.post(
  '/comments/:commentId/reply',
  protect,
  affiliateOnly,
  createWriterReply
);

router.get('/notifications', protect, affiliateOnly, getMyNotifications);
router.patch(
  '/notifications/mark-all-read',
  protect,
  affiliateOnly,
  markAllNotificationsRead
);
router.patch(
  '/notifications/:notificationId/read',
  protect,
  affiliateOnly,
  markNotificationRead
);

module.exports = router;