const express = require('express');
const {
  listWriterSeries,
  getWriterSeries,
  createWriterSeries,
  updateWriterSeries,
  assignWriterSeriesItem,
  removeWriterSeriesItem,
  deleteWriterSeries,
} = require('../../controllers/affiliate/writerSeriesController');
const { protect, affiliateOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Writer series routes working',
  });
});

router.get('/', protect, affiliateOnly, listWriterSeries);
router.get('/:id', protect, affiliateOnly, getWriterSeries);
router.post('/', protect, affiliateOnly, createWriterSeries);
router.put('/:id', protect, affiliateOnly, updateWriterSeries);
router.post('/:id/items', protect, affiliateOnly, assignWriterSeriesItem);
router.delete('/:id/items/:postId', protect, affiliateOnly, removeWriterSeriesItem);
router.delete('/:id', protect, affiliateOnly, deleteWriterSeries);

module.exports = router;
