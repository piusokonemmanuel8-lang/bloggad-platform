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
  buildSourceFilename,
} = require('../controllers/writerWebinarController');

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

router.get('/', protect, affiliateOnly, listWriterWebinars);
router.post('/', protect, affiliateOnly, createWriterWebinar);

router.get(
  '/:webinarId',
  protect,
  affiliateOnly,
  requireOwnedWebinar,
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
  retryWebinarMedia
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

module.exports = router;
