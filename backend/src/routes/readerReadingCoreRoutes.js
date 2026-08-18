const express = require('express');
const {
  protect,
  readerOrWriter,
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
router.get('/controls', protect, readerOrWriter, getReaderReadingControls);
router.get('/posts/:postId/state', protect, readerOrWriter, getReaderPostReadingState);
router.post('/posts/:postId/highlights', protect, readerOrWriter, createPostHighlight);
router.delete('/highlights/:highlightId', protect, readerOrWriter, deletePostHighlight);
router.post('/publications/:websiteId/follow', protect, readerOrWriter, togglePublicationFollow);
router.post('/mutes/:targetType/:targetId', protect, readerOrWriter, toggleContentMute);
router.post('/posts/:postId/report', protect, readerOrWriter, reportPost);
router.post('/posts/:postId/listen/generate', protect, readerOrWriter, generateReaderPostAudio);
router.get('/audio/:assetId', protect, readerOrWriter, streamReaderPostAudio);

module.exports = router;