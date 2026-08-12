const express = require('express');
const {
  getPublicTopics,
  getPublicTopicBySlug,
} = require('../../controllers/readingCoreController');
const {
  getPublicListenManifest,
} = require('../../controllers/readingListenController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ ok: true, message: 'Public Reading Core routes working' });
});

router.get('/topics', getPublicTopics);
router.get('/topics/:slug', getPublicTopicBySlug);
router.get('/posts/:postId/listen', getPublicListenManifest);

module.exports = router;