const fs = require('fs');
const path = require('path');

function ensureUploadsDir() {
  const uploadDir = path.join(process.cwd(), 'uploads', 'template-images');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return uploadDir;
}

function buildPublicFileUrl(req, fileName) {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/template-images/${fileName}`;
}

async function uploadTemplateImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: 'Image file is required',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Image uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: buildPublicFileUrl(req, req.file.filename),
      },
    });
  } catch (error) {
    console.error('uploadTemplateImage error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to upload image',
      error: error.message,
    });
  }
}

module.exports = {
  ensureUploadsDir,
  uploadTemplateImage,
};