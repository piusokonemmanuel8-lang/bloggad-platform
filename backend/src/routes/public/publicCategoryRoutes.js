const express = require('express');
const {
  getAllPublicCategories,
  getPublicCategoryBySlug,
  getWebsiteCategoryProducts,
} = require('../../controllers/public/publicCategoryController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Public category routes working',
  });
});

router.get('/', getAllPublicCategories);
router.get('/:slug', getPublicCategoryBySlug);
router.get('/:websiteSlug/:slug', getWebsiteCategoryProducts);

module.exports = router;