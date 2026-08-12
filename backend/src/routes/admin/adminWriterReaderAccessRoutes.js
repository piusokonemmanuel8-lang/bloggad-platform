const express = require('express');
const { protect, adminOnly } = require('../../middleware/authMiddleware');
const {
  listAdminReaderPlans,
  createAdminReaderPlan,
  updateAdminReaderPlan,
  getAdminWriterMembershipPolicy,
  updateAdminWriterMembershipPolicy,
  listAdminReaderSubscriptions,
  activateAdminReaderSubscription,
  listAdminWriterMemberships,
  activateAdminWriterMembership,
} = require('../../controllers/writerReaderAccessController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Admin Writer and Reader access routes working',
  });
});

router.get('/reader-plans', protect, adminOnly, listAdminReaderPlans);
router.post('/reader-plans', protect, adminOnly, createAdminReaderPlan);
router.put('/reader-plans/:planId', protect, adminOnly, updateAdminReaderPlan);

router.get('/writer-membership-policy', protect, adminOnly, getAdminWriterMembershipPolicy);
router.put('/writer-membership-policy', protect, adminOnly, updateAdminWriterMembershipPolicy);

router.get('/reader-subscriptions', protect, adminOnly, listAdminReaderSubscriptions);
router.post(
  '/reader-subscriptions/activate',
  protect,
  adminOnly,
  activateAdminReaderSubscription
);

router.get('/writer-memberships', protect, adminOnly, listAdminWriterMemberships);
router.post(
  '/writer-memberships/activate',
  protect,
  adminOnly,
  activateAdminWriterMembership
);

module.exports = router;