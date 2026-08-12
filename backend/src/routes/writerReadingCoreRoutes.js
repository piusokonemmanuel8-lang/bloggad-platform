const express = require('express');
const {
  protect,
  affiliateOnly,
} = require('../middleware/authMiddleware');
const {
  getWriterPostTopics,
  saveWriterPostTopics,
} = require('../controllers/readingCoreController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ ok: true, message: 'Writer Reading Core routes working' });
});

router.get('/posts/:postId/topics', protect, affiliateOnly, getWriterPostTopics);
router.put('/posts/:postId/topics', protect, affiliateOnly, saveWriterPostTopics);

module.exports = router;