const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const { getPublicBlogTemplates } = require('../../controllers/public/publicTemplateController');

const router = express.Router();

router.use(protect);

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Affiliate template routes working',
  });
});

router.get('/blog', getPublicBlogTemplates);

module.exports = router;