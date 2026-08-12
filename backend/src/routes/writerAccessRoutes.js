const express = require('express');
const { protect, affiliateOnly } = require('../middleware/authMiddleware');
const {
  getWriterPostAccess,
  updateWriterPostAccess,
  getWriterMembershipOffer,
  updateWriterMembershipOffer,
  getMyWriterMembers,
} = require('../controllers/writerReaderAccessController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Writer access routes working',
  });
});

router.get('/posts/:postId', protect, affiliateOnly, getWriterPostAccess);
router.put('/posts/:postId', protect, affiliateOnly, updateWriterPostAccess);
router.get('/membership-offer', protect, affiliateOnly, getWriterMembershipOffer);
router.put('/membership-offer', protect, affiliateOnly, updateWriterMembershipOffer);
router.get('/members', protect, affiliateOnly, getMyWriterMembers);

module.exports = router;