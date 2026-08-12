const express = require('express');
const {
  getPublicWriterMembership,
} = require('../../controllers/writerReaderAccessController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Public Writer access routes working',
  });
});

router.get('/writers/:writerId/membership', getPublicWriterMembership);

module.exports = router;