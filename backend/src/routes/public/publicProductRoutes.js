const express = require('express');
const {
  getPublicProduct,
  getPublicProductPosts,
  trackPublicProductClick,
} = require('../../controllers/public/publicProductController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Public product routes working',
  });
});

router.get('/:websiteSlug/product/:slug', getPublicProduct);
router.get('/:websiteSlug/product/:slug/posts', getPublicProductPosts);
router.post('/:websiteSlug/product/:slug/click', trackPublicProductClick);

module.exports = router;