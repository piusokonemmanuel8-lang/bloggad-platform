const express = require('express');
const {
  getAllTemplates,
  getWebsiteTemplates,
  getBlogTemplates,
  getSingleWebsiteTemplate,
  getSingleBlogTemplate,
  createWebsiteTemplate,
  createBlogTemplate,
  updateWebsiteTemplate,
  updateBlogTemplate,
  updateWebsiteTemplateStatus,
  updateBlogTemplateStatus,
  deleteWebsiteTemplate,
  deleteBlogTemplate,
} = require('../../controllers/admin/adminTemplateController');
const { protect, adminOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Admin template routes working',
  });
});

router.get('/', protect, adminOnly, getAllTemplates);

router.get('/website', protect, adminOnly, getWebsiteTemplates);
router.get('/website/:id', protect, adminOnly, getSingleWebsiteTemplate);
router.post('/website', protect, adminOnly, createWebsiteTemplate);
router.put('/website/:id', protect, adminOnly, updateWebsiteTemplate);
router.put('/website/:id/status', protect, adminOnly, updateWebsiteTemplateStatus);
router.delete('/website/:id', protect, adminOnly, deleteWebsiteTemplate);

router.get('/blog', protect, adminOnly, getBlogTemplates);
router.get('/blog/:id', protect, adminOnly, getSingleBlogTemplate);
router.post('/blog', protect, adminOnly, createBlogTemplate);
router.put('/blog/:id', protect, adminOnly, updateBlogTemplate);
router.put('/blog/:id/status', protect, adminOnly, updateBlogTemplateStatus);
router.delete('/blog/:id', protect, adminOnly, deleteBlogTemplate);

module.exports = router;