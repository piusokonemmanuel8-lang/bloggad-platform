const express = require('express');
const { protect, readerOrWriter } = require('../middleware/authMiddleware');
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

router.get('/', protect, readerOrWriter, listReaderCourses);
router.post('/:courseId/enroll', protect, readerOrWriter, enrollReaderInCourse);
router.get('/:courseId', protect, readerOrWriter, getReaderCourse);
router.patch(
  '/:courseId/lessons/:lessonId/progress',
  protect,
  readerOrWriter,
  updateReaderLessonProgress
);

module.exports = router;