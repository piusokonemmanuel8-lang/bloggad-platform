const express = require('express');
const { protect, affiliateOnly } = require('../middleware/authMiddleware');
const {
  listWriterCourses,
  getWriterCourse,
  createCourseModule,
  updateCourseModule,
  deleteCourseModule,
  addCourseLesson,
  updateCourseLesson,
  deleteCourseLesson,
} = require('../controllers/writerReaderCourseController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Writer course routes working',
  });
});

router.get('/', protect, affiliateOnly, listWriterCourses);
router.get('/:courseId', protect, affiliateOnly, getWriterCourse);
router.post('/:courseId/modules', protect, affiliateOnly, createCourseModule);
router.patch('/modules/:moduleId', protect, affiliateOnly, updateCourseModule);
router.delete('/modules/:moduleId', protect, affiliateOnly, deleteCourseModule);
router.post(
  '/:courseId/modules/:moduleId/lessons',
  protect,
  affiliateOnly,
  addCourseLesson
);
router.patch('/lessons/:lessonId', protect, affiliateOnly, updateCourseLesson);
router.delete('/lessons/:lessonId', protect, affiliateOnly, deleteCourseLesson);

module.exports = router;