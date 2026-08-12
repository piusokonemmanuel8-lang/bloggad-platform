const express = require('express');
const path = require('path');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const {
  uploadTemplateImage,
} = require('../controllers/uploadController');
const { createS3MulterStorage } = require('../config/s3Storage');

const router = express.Router();

const allowedExtensions = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.mp4',
  '.webm',
  '.mov',
  '.m4v',
  '.ogg',
  '.mp3',
  '.wav',
  '.m4a',
  '.aac',
];

const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',

  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-m4v',
  'video/ogg',

  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/m4a',
  'audio/aac',
  'audio/ogg',
];

function buildSafeFileName(originalName = 'upload-file') {
  const originalExt = path.extname(originalName || '').toLowerCase();
  const safeExt = allowedExtensions.includes(originalExt) ? originalExt : '.bin';

  const base =
    path
      .basename(originalName || 'upload-file', originalExt)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'upload-file';

  return `${Date.now()}-${base}${safeExt}`;
}

const storage = createS3MulterStorage({
  prefix: 'template-images',
  filenameBuilder: buildSafeFileName,
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();

  if (!allowedMimeTypes.includes(file.mimetype) || !allowedExtensions.includes(ext)) {
    return cb(new Error('Only image, video, and audio files are allowed'));
  }

  cb(null, true);
};

const uploadAnyMedia = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 150 * 1024 * 1024,
  },
});

const uploadImageOnly = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();

    const allowedImageMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

    if (!allowedImageMimeTypes.includes(file.mimetype) || !allowedImageExtensions.includes(ext)) {
      return cb(new Error('Only image files are allowed'));
    }

    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

function buildFileUrl(_req, filename) {
  return `/uploads/template-images/${filename}`;
}

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Upload routes working',
  });
});

router.post(
  '/',
  protect,
  (req, res, next) => {
    uploadAnyMedia.single('file')(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          ok: false,
          message: error.message || 'Upload failed',
        });
      }

      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: 'No file uploaded',
      });
    }

    const fileUrl = buildFileUrl(req, req.file.filename);

    return res.status(201).json({
      ok: true,
      message: 'File uploaded successfully',
      url: fileUrl,
      file_url: fileUrl,
      path: `/uploads/template-images/${req.file.filename}`,
      filename: req.file.filename,
      original_name: req.file.originalname,
      mime_type: req.file.mimetype,
      size: req.file.size,
    });
  }
);

router.post(
  '/template-image',
  protect,
  (req, res, next) => {
    uploadImageOnly.single('image')(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          ok: false,
          message: error.message || 'Upload failed',
        });
      }

      next();
    });
  },
  uploadTemplateImage
);

module.exports = router;