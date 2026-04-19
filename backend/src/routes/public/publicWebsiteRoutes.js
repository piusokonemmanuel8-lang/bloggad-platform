const express = require('express');
const {
  getPublicWebsite,
  getPublicWebsiteCategories,
  getPublicWebsiteMenus,
} = require('../../controllers/public/publicWebsiteController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Public website routes working',
  });
});

router.get('/:websiteSlug', getPublicWebsite);
router.get('/:websiteSlug/categories', getPublicWebsiteCategories);
router.get('/:websiteSlug/menus', getPublicWebsiteMenus);

module.exports = router;