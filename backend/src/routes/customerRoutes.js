const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getCustomerDashboard,
  getCustomerSettings,
  saveCustomerSettings,
} = require('../controllers/customerController');
const {
  getCustomerAdvertiserProfile,
  createOrUpdateCustomerAdvertiserProfile,
  getCustomerAdvertiserWallet,
} = require('../controllers/customerAdvertiserController');
const {
  getCustomerAdvertiserPayments,
  createCustomerAdvertiserPayment,
} = require('../controllers/customerAdvertiserPaymentController');
const {
  getCustomerAdvertiserCampaigns,
  getCustomerAdvertiserCampaignById,
  createCustomerAdvertiserCampaign,
  updateCustomerAdvertiserCampaign,
  submitCustomerAdvertiserCampaignForReview,
} = require('../controllers/customerAdvertiserCampaignController');
const {
  getCustomerAdvertiserCreatives,
  createCustomerAdvertiserCreative,
  updateCustomerAdvertiserCreative,
} = require('../controllers/customerAdvertiserCreativeController');

const router = express.Router();

router.get('/dashboard', protect, getCustomerDashboard);
router.get('/settings', protect, getCustomerSettings);
router.put('/settings', protect, saveCustomerSettings);

router.get('/advertiser/profile', protect, getCustomerAdvertiserProfile);
router.post('/advertiser/profile', protect, createOrUpdateCustomerAdvertiserProfile);
router.put('/advertiser/profile', protect, createOrUpdateCustomerAdvertiserProfile);
router.get('/advertiser/wallet', protect, getCustomerAdvertiserWallet);

router.get('/advertiser/payments', protect, getCustomerAdvertiserPayments);
router.post('/advertiser/payments', protect, createCustomerAdvertiserPayment);

router.get('/advertiser/campaigns', protect, getCustomerAdvertiserCampaigns);
router.get('/advertiser/campaigns/:campaignId', protect, getCustomerAdvertiserCampaignById);
router.post('/advertiser/campaigns', protect, createCustomerAdvertiserCampaign);
router.put('/advertiser/campaigns/:campaignId', protect, updateCustomerAdvertiserCampaign);
router.patch('/advertiser/campaigns/:campaignId/submit', protect, submitCustomerAdvertiserCampaignForReview);

router.get('/advertiser/campaigns/:campaignId/creatives', protect, getCustomerAdvertiserCreatives);
router.post('/advertiser/campaigns/:campaignId/creatives', protect, createCustomerAdvertiserCreative);
router.put('/advertiser/campaigns/:campaignId/creatives/:creativeId', protect, updateCustomerAdvertiserCreative);

module.exports = router;