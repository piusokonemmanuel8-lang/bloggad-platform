const express = require('express');
const { protect, customerOnly } = require('../middleware/authMiddleware');
const {
  enrollReaderInCourse,
  listReaderCourses,
  getReaderCourse,
  updateReaderLessonProgress,
} = require('../controllers/writerReaderCourseController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Reader course routes working',
  });
});

router.get('/', protect, customerOnly, listReaderCourses);
router.post('/:courseId/enroll', protect, customerOnly, enrollReaderInCourse);
router.get('/:courseId', protect, customerOnly, getReaderCourse);
router.patch(
  '/:courseId/lessons/:lessonId/progress',
  protect,
  customerOnly,
  updateReaderLessonProgress
);

module.exports = router;