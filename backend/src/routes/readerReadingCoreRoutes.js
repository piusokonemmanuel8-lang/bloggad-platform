const express = require('express');
const {
  protect,
  customerOnly,
} = require('../middleware/authMiddleware');
const {
  getReaderInterests,
  saveReaderInterests,
  getReaderFeed,
} = require('../controllers/readingCoreController');
const {
  getReaderPostReadingState,
  togglePublicationFollow,
  toggleContentMute,
  getReaderReadingControls,
  createPostHighlight,
  deletePostHighlight,
  reportPost,
} = require('../controllers/readingInteractionController');
const {
  generateReaderPostAudio,
  streamReaderPostAudio,
} = require('../controllers/readingListenController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ ok: true, message: 'Reader Reading Core routes working' });
});

router.get('/interests', protect, getReaderInterests);
router.put('/interests', protect, saveReaderInterests);
router.get('/feed', protect, getReaderFeed);
router.get('/controls', protect, customerOnly, getReaderReadingControls);
router.get('/posts/:postId/state', protect, customerOnly, getReaderPostReadingState);
router.post('/posts/:postId/highlights', protect, customerOnly, createPostHighlight);
router.delete('/highlights/:highlightId', protect, customerOnly, deletePostHighlight);
router.post('/publications/:websiteId/follow', protect, customerOnly, togglePublicationFollow);
router.post('/mutes/:targetType/:targetId', protect, customerOnly, toggleContentMute);
router.post('/posts/:postId/report', protect, customerOnly, reportPost);
router.post('/posts/:postId/listen/generate', protect, customerOnly, generateReaderPostAudio);
router.get('/audio/:assetId', protect, customerOnly, streamReaderPostAudio);

module.exports = router;