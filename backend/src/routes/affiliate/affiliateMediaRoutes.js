const express = require('express');
const {
  getMyMediaLibrary,
  getMyMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
} = require('../../controllers/affiliate/affiliateMediaController');
const { protect, affiliateOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Affiliate media routes working',
  });
});

router.get('/', protect, affiliateOnly, getMyMediaLibrary);
router.get('/:id', protect, affiliateOnly, getMyMediaById);

router.post('/', protect, affiliateOnly, createMedia);
router.put('/:id', protect, affiliateOnly, updateMedia);

router.delete('/:id', protect, affiliateOnly, deleteMedia);

module.exports = router;