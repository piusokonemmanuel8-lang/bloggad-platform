const express = require('express');
const {
  getMySliders,
  getMySliderById,
  createSlider,
  updateSlider,
  updateSliderStatus,
  deleteSlider,
} = require('../../controllers/affiliate/affiliateSliderController');
const { protect, affiliateOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Affiliate slider routes working',
  });
});

router.get('/', protect, affiliateOnly, getMySliders);
router.get('/:id', protect, affiliateOnly, getMySliderById);

router.post('/', protect, affiliateOnly, createSlider);
router.put('/:id', protect, affiliateOnly, updateSlider);
router.put('/:id/status', protect, affiliateOnly, updateSliderStatus);

router.delete('/:id', protect, affiliateOnly, deleteSlider);

module.exports = router;