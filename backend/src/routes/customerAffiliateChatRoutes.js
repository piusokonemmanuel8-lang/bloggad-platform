const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createCustomerAffiliateChat,
  sendCustomerAffiliateMessage,
  getMyCustomerAffiliateChats,
  getCustomerAffiliateChatDetails,
  closeCustomerAffiliateChat,
} = require('../controllers/customerAffiliateChatController');

const router = express.Router();

router.get('/', protect, getMyCustomerAffiliateChats);
router.post('/', protect, createCustomerAffiliateChat);
router.get('/:chatId', protect, getCustomerAffiliateChatDetails);
router.post('/:chatId/messages', protect, sendCustomerAffiliateMessage);
router.patch('/:chatId/close', protect, closeCustomerAffiliateChat);

module.exports = router;