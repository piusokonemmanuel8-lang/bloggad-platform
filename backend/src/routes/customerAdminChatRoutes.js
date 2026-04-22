const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createCustomerAdminChat,
  sendCustomerAdminMessage,
  getMyCustomerAdminChats,
  getCustomerAdminChatDetails,
  closeCustomerAdminChat,
} = require('../controllers/customerAdminChatController');

const router = express.Router();

router.get('/', protect, getMyCustomerAdminChats);
router.post('/', protect, createCustomerAdminChat);
router.get('/:chatId', protect, getCustomerAdminChatDetails);
router.post('/:chatId/messages', protect, sendCustomerAdminMessage);
router.patch('/:chatId/close', protect, closeCustomerAdminChat);

module.exports = router;