const express = require('express');

const {
  getAdminNotifications,
  createAdminNotification,
  updateAdminNotification,
  deleteAdminNotification,
} = require('../../controllers/admin/adminNotificationController');

const { protect, adminOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Admin notification routes working',
  });
});

router.get('/', protect, adminOnly, getAdminNotifications);

router.post('/', protect, adminOnly, createAdminNotification);

router.put('/:id', protect, adminOnly, updateAdminNotification);

router.delete('/:id', protect, adminOnly, deleteAdminNotification);

module.exports = router;