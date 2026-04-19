const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadRoot = path.join(__dirname, '..', 'uploads');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function resolveFolder(sourceType = 'general') {
  const map = {
    logo: 'logos',
    banner: 'banners',
    slider: 'sliders',
    product: 'products',
    post: 'posts',
    template: 'templates',
    general: 'general',
  };

  return map[sourceType] || 'general';
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const sourceType = String(req.body.source_type || req.query.source_type || 'general').trim();
    const folder = resolveFolder(sourceType);
    const destinationPath = path.join(uploadRoot, folder);

    ensureDir(destinationPath);
    cb(null, destinationPath);
  },

  filename(req, file, cb) {
    const ext = path.extname(file.originalname || '');
    const baseName = path
      .basename(file.originalname || 'file', ext)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .toLowerCase();

    const uniqueName = `${baseName || 'file'}-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${ext}`;

    cb(null, uniqueName);
  },
});

function fileFilter(req, file, cb) {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Only image uploads are allowed'));
  }

  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = {
  upload,
};