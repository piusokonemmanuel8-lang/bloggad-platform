const express = require('express');
const {
  getPublicPostSocial,
  getPublicWriterSocial,
} = require('../../controllers/writerReaderSocialController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Writer and Reader public social routes working',
  });
});

router.get('/posts/:postId', getPublicPostSocial);
router.get('/writers/:writerId', getPublicWriterSocial);

module.exports = router;