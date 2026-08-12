const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createCustomerAffiliateChat,
  sendCustomerAffiliateMessage,
  getMyCustomerAffiliateChats,
  getCustomerAffiliateChatDetails,
  closeCustomerAffiliateChat,
  getWriterMessagingSettings,
  updateWriterMessagingSettings,
  getWriterMessagingEligibility,
  decideMessageRequest,
  updateMessageControl,
  reportConversation,
} = require('../controllers/customerAffiliateChatController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Reader and Writer message routes working',
  });
});

router.get('/message-settings', protect, getWriterMessagingSettings);
router.put('/message-settings', protect, updateWriterMessagingSettings);
router.get('/writer/:writerId/eligibility', protect, getWriterMessagingEligibility);

router.get('/', protect, getMyCustomerAffiliateChats);
router.post('/', protect, createCustomerAffiliateChat);
router.get('/:chatId', protect, getCustomerAffiliateChatDetails);
router.post('/:chatId/messages', protect, sendCustomerAffiliateMessage);
router.patch('/:chatId/request/:action', protect, decideMessageRequest);
router.patch('/:chatId/control/:action', protect, updateMessageControl);
router.post('/:chatId/report', protect, reportConversation);
router.patch('/:chatId/close', protect, closeCustomerAffiliateChat);

module.exports = router;