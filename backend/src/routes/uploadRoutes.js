const express = require('express');
const path = require('path');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const {
  ensureUploadsDir,
  uploadTemplateImage,
} = require('../controllers/uploadController');

const router = express.Router();

const uploadDir = ensureUploadsDir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.png';

    const base = path
      .basename(file.originalname || 'template-image', ext)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'template-image';

    cb(null, `${Date.now()}-${base}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Only image files are allowed'));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  '/template-image',
  protect,
  (req, res, next) => {
    upload.single('image')(req, res, (error) => {
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