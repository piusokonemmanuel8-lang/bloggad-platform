const express = require('express');
const {
  listPublicCourses,
  getPublicCourse,
} = require('../../controllers/writerReaderCourseController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Public course routes working',
  });
});

router.get('/:websiteSlug', listPublicCourses);
router.get('/:websiteSlug/:courseSlug', getPublicCourse);

module.exports = router;