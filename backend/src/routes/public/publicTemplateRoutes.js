const express = require('express');
const { getPublicBlogTemplates } = require('../../controllers/public/publicTemplateController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Public template routes working',
  });
});

router.get('/blog-templates', getPublicBlogTemplates);

module.exports = router;