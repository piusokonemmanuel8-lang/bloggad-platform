const express = require('express');
const {
  getHomepage,
  getHomepageFeaturedProducts,
  getHomepageCategoriesList,
} = require('../../controllers/public/publicHomeController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Public home routes working',
  });
});

router.get('/', getHomepage);
router.get('/featured-products', getHomepageFeaturedProducts);
router.get('/categories', getHomepageCategoriesList);

module.exports = router;