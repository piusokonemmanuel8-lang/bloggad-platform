const express = require('express');
const multer = require('multer');
const {
  protect,
  affiliateOnly,
} = require('../middleware/authMiddleware');
const {
  createWebinarSourceStorage,
} = require('../config/webinarStorage');
const {
  requireOwnedWebinar,
  requireWebinarUploadEntitlement,
  getCreatorCapabilities,
  listWriterWebinars,
  createWriterWebinar,
  getWriterWebinar,
  updateWriterWebinar,
  queueWebinarVideo,
  retryWebinarMedia,
  publishWriterWebinar,
  returnWriterWebinarToDraft,
  archiveWriterWebinar,
  listWriterWebinarRegistrations,
  openWriterWebinarRoom,
  endWriterWebinarRoom,
  getWriterWebinarRoom,
  sendWriterWebinarRoomChat,
  moderateWriterWebinarRoomChat,
  createWriterWebinarPoll,
  setWriterWebinarPollStatus,
  getWriterWebinarAnalyticsOverview,
  getWriterWebinarAnalytics,
  getWriterWebinarSessionAnalytics,
  suggestWriterWebinarAiCopy,
  getWriterWebinarAiAnalyticsInsights,
  buildSourceFilename,
} = require('../controllers/writerWebinarController');

const {
  initiateMultipartUpload,
  signMultipartPart,
  completeMultipartUpload,
  abortMultipartUpload,
  retryMediaConvertJob,
  syncOwnedWebinarMedia,
} = require('../services/webinarMediaConvertService');

const router = express.Router();

const maxUploadBytes = Math.max(
  10 * 1024 * 1024,
  Number(process.env.WEBINAR_MAX_UPLOAD_BYTES || 5 * 1024 * 1024 * 1024)
);

const upload = multer({
  storage: createWebinarSourceStorage({
    prefixBuilder: (req) =>
      `webinars/source/${req.user.id}/${req.params.webinarId}`,
    filenameBuilder: buildSourceFilename,
  }),
  limits: {
    fileSize: maxUploadBytes,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const isMp4 =
      file.mimetype === 'video/mp4' ||
      String(file.originalname || '').toLowerCase().endsWith('.mp4');

    if (!isMp4) {
      cb(new Error('Only MP4 webinar videos are supported.'));
      return;
    }

    cb(null, true);
  },
});

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Writer webinar routes working',
  });
});

router.get(
  '/creator/capabilities',
  protect,
  affiliateOnly,
  getCreatorCapabilities
);

router.get(
  '/analytics/overview',
  protect,
  affiliateOnly,
  getWriterWebinarAnalyticsOverview
);

router.get('/', protect, affiliateOnly, listWriterWebinars);
router.post('/', protect, affiliateOnly, createWriterWebinar);

router.get(
  '/:webinarId',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
  syncOwnedWebinarMedia,
  getWriterWebinar
);

router.patch(
  '/:webinarId',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
  updateWriterWebinar
);

router.post(
  '/:webinarId/video/multipart/initiate',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
  requireWebinarUploadEntitlement,
  initiateMultipartUpload
);

router.post(
  '/:webinarId/video/multipart/sign-part',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
  signMultipartPart
);

router.post(
  '/:webinarId/video/multipart/complete',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
  requireWebinarUploadEntitlement,
  completeMultipartUpload
);

router.post(
  '/:webinarId/video/multipart/abort',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
  abortMultipartUpload
);

router.post(
  '/:webinarId/video',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
  requireWebinarUploadEntitlement,
  upload.single('video'),
  queueWebinarVideo
);

router.post(
  '/:webinarId/media/:mediaJobId/retry',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
  retryMediaConvertJob
);

router.post(
  '/:webinarId/publish',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
  publishWriterWebinar
);

router.post(
  '/:webinarId/draft',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
  returnWriterWebinarToDraft
);

router.post(
  '/:webinarId/archive',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
  archiveWriterWebinar
);

router.get(
  '/:webinarId/registrations',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
  listWriterWebinarRegistrations
);

router.get(
  '/:webinarId/analytics',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
  getWriterWebinarAnalytics
);

router.get(
  '/:webinarId/sessions/:sessionId/analytics',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
  getWriterWebinarSessionAnalytics
);

router.post(
  '/:webinarId/ai/suggest-copy',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
  suggestWriterWebinarAiCopy
);

router.post(
  '/:webinarId/ai/analytics-insights',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
  getWriterWebinarAiAnalyticsInsights
);

router.post(
  '/:webinarId/room/open',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
  openWriterWebinarRoom
);

router.get(
  '/:webinarId/sessions/:sessionId/room',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
  getWriterWebinarRoom
);

router.post(
  '/:webinarId/sessions/:sessionId/end',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
  endWriterWebinarRoom
);

router.post(
  '/:webinarId/sessions/:sessionId/chat',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
  sendWriterWebinarRoomChat
);

router.patch(
  '/:webinarId/sessions/:sessionId/chat/:messageId/status',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
  moderateWriterWebinarRoomChat
);

router.post(
  '/:webinarId/sessions/:sessionId/polls',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
  createWriterWebinarPoll
);

router.patch(
  '/:webinarId/sessions/:sessionId/polls/:pollId/status',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
  setWriterWebinarPollStatus
);

module.exports = router;
