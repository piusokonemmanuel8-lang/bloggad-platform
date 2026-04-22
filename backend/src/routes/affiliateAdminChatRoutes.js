const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createAffiliateAdminChat,
  sendAffiliateAdminMessage,
  getMyAffiliateAdminChats,
  getAffiliateAdminChatDetails,
  closeAffiliateAdminChat,
} = require('../controllers/affiliateAdminChatController');

const router = express.Router();

router.get('/', protect, getMyAffiliateAdminChats);
router.post('/', protect, createAffiliateAdminChat);
router.get('/:chatId', protect, getAffiliateAdminChatDetails);
router.post('/:chatId/messages', protect, sendAffiliateAdminMessage);
router.patch('/:chatId/close', protect, closeAffiliateAdminChat);

module.exports = router;