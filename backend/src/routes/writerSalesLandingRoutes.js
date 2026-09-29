const express = require('express');
const { protect, affiliateOnly } = require('../middleware/authMiddleware');
const c = require('../controllers/writerSalesLandingController');
const router = express.Router();

router.get('/public/:slug', c.publicPage);
router.get('/templates', protect, affiliateOnly, c.listTemplates);
router.get('/', protect, affiliateOnly, c.listMine);
router.post('/', protect, affiliateOnly, c.createPage);
router.get('/:pageId', protect, affiliateOnly, c.getMine);
router.put('/:pageId', protect, affiliateOnly, c.updatePage);
router.put('/:pageId/publish', protect, affiliateOnly, c.publishPage);
router.put('/:pageId/unpublish', protect, affiliateOnly, c.unpublishPage);
router.delete('/:pageId', protect, affiliateOnly, c.deletePage);

module.exports = router;