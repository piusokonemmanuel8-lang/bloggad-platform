const { getUploadDir } = require('../config/uploads');

function ensureUploadsDir() {
  return getUploadDir('template-images');
}

function buildPublicFileUrl(_req, fileName) {
  return `/uploads/template-images/${fileName}`;
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