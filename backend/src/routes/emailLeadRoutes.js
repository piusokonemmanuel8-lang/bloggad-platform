const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createEmailPopupTemplate,
  updateEmailPopupTemplate,
  getAdminEmailPopupTemplates,
  getPublicEmailPopupTemplates,
  getAffiliateEmailListSettings,
  saveAffiliateEmailListSettings,
  getPublicWebsiteEmailPopup,
  captureStorefrontEmailLead,
  getAffiliateEmailLeads,
  getAdminEmailLeadStats,
} = require('../controllers/emailLeadController');

const router = express.Router();

// public
router.get('/public/templates', getPublicEmailPopupTemplates);
router.get('/public/popup', getPublicWebsiteEmailPopup);
router.post('/public/capture', captureStorefrontEmailLead);

// admin templates
router.get('/admin/templates', protect, getAdminEmailPopupTemplates);
router.post('/admin/templates', protect, createEmailPopupTemplate);
router.put('/admin/templates/:templateId', protect, updateEmailPopupTemplate);

// affiliate/admin website settings
router.get('/settings/:websiteId', protect, getAffiliateEmailListSettings);
router.post('/settings/:websiteId', protect, saveAffiliateEmailListSettings);

// leads
router.get('/leads', protect, getAffiliateEmailLeads);
router.get('/admin/stats', protect, getAdminEmailLeadStats);

module.exports = router;