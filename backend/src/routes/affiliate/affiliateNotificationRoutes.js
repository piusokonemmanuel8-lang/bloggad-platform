const express = require('express');

const {
  getAffiliateNotifications,
  markAffiliateNotificationRead,
  markAffiliateNotificationUnread,
  markAllAffiliateNotificationsRead,
} = require('../../controllers/affiliate/affiliateNotificationController');

const { protect, affiliateOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Affiliate notification routes working',
  });
});

router.get('/', protect, affiliateOnly, getAffiliateNotifications);

router.put('/mark-all-read', protect, affiliateOnly, markAllAffiliateNotificationsRead);

router.put('/:id/read', protect, affiliateOnly, markAffiliateNotificationRead);

router.put('/:id/unread', protect, affiliateOnly, markAffiliateNotificationUnread);

module.exports = router;