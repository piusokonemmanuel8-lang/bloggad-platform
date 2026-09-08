const express = require('express');
const {
  getPublicPost,
  getWebsitePublishedPosts,
  trackPublicPostEngagement,
  trackPublicPostLinkClick,
} = require('../../controllers/public/publicPostController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Public post routes working',
  });
});

router.post('/analytics/:postId/engagement', trackPublicPostEngagement);
router.post('/analytics/:postId/link-click', trackPublicPostLinkClick);

router.get('/:websiteSlug/post/:slug', getPublicPost);
router.get('/:websiteSlug/posts', getWebsitePublishedPosts);

module.exports = router;