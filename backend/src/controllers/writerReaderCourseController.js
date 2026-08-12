const pool = require('../config/db');
const {
  positiveInt,
  clampPercent,
  getOwnedCourse,
  getPublishedCourseById,
  getPublishedCourseBySlug,
  getCourseStructure,
  ensureEnrollment,
  recalculateEnrollment,
} = require('../services/writerReaderCourseService');

function cleanText(value, maxLength = 500) {
  return String(value || '').trim().slice(0, maxLength);
}

async function listWriterCourses(req, res) {
  try {
    const [courses] = await pool.query(
      `
      SELECT
        ws.id,
        ws.website_id,
        ws.title,
        ws.slug,
        ws.description,
        ws.cover_image,
        ws.status,
        ws.created_at,
        ws.updated_at,
        aw.website_name,
        aw.slug AS website_slug,
        COUNT(DISTINCT m.id) AS module_count,
        COUNT(DISTINCT l.id) AS lesson_count
      FROM writer_series ws
      INNER JOIN affiliate_websites aw
        ON aw.id = ws.website_id
      LEFT JOIN writer_course_modules m
        ON m.course_series_id = ws.id
      LEFT JOIN writer_course_lessons l
        ON l.course_series_id = ws.id
      WHERE ws.user_id = ?
        AND ws.series_type = 'course'
      GROUP BY ws.id
      ORDER BY ws.id DESC
      `,
      [req.user.id]
    );

    return res.status(200).json({
      ok: true,
      courses: courses.map((course) => ({
        ...course,
        module_count: Number(course.module_count || 0),
        lesson_count: Number(course.lesson_count || 0),
      })),
    });
  } catch (error) {
    console.error('listWriterCourses error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to load Writer courses.',
      error: error.message,
    });
  }
}

async function getWriterCourse(req, res) {
  try {
    const courseId = positiveInt(req.params?.courseId);

    if (!courseId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid course ID is required.',
      });
    }

    const course = await getOwnedCourse(courseId, req.user.id);

    if (!course) {
      return res.status(404).json({
        ok: false,
        message: 'Writer course not found.',
      });
    }

    const modules = await getCourseStructure(courseId);

    return res.status(200).json({
      ok: true,
      course,
      modules,
    });
  } catch (error) {
    console.error('getWriterCourse error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to load Writer course.',
      error: error.message,
    });
  }
}

async function createCourseModule(req, res) {
  try {
    const courseId = positiveInt(req.params?.courseId);
    const title = cleanText(req.body?.title, 255);
    const description = cleanText(req.body?.description, 5000) || null;
    const requestedSort = Number(req.body?.sort_order);

    if (!courseId || !title) {
      return res.status(400).json({
        ok: false,
        message: 'Valid course ID and module title are required.',
      });
    }

    const course = await getOwnedCourse(courseId, req.user.id);

    if (!course) {
      return res.status(404).json({
        ok: false,
        message: 'Writer course not found.',
      });
    }

    let sortOrder = Number.isInteger(requestedSort) && requestedSort >= 0
      ? requestedSort
      : null;

    if (sortOrder === null) {
      const [[row]] = await pool.query(
        `
        SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_sort
        FROM writer_course_modules
        WHERE course_series_id = ?
        `,
        [courseId]
      );

      sortOrder = Number(row?.next_sort || 0);
    }

    const [result] = await pool.query(
      `
      INSERT INTO writer_course_modules (
        course_series_id,
        title,
        description,
        sort_order,
        status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, 'draft', NOW(), NOW())
      `,
      [courseId, title, description, sortOrder]
    );

    return res.status(201).json({
      ok: true,
      message: 'Course module created.',
      module_id: result.insertId,
    });
  } catch (error) {
    console.error('createCourseModule error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to create course module.',
      error: error.message,
    });
  }
}

async function updateCourseModule(req, res) {
  try {
    const moduleId = positiveInt(req.params?.moduleId);

    if (!moduleId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid module ID is required.',
      });
    }

    const [[module]] = await pool.query(
      `
      SELECT
        m.*,
        ws.user_id
      FROM writer_course_modules m
      INNER JOIN writer_series ws
        ON ws.id = m.course_series_id
        AND ws.series_type = 'course'
      WHERE m.id = ?
      LIMIT 1
      `,
      [moduleId]
    );

    if (!module || Number(module.user_id) !== Number(req.user.id)) {
      return res.status(404).json({
        ok: false,
        message: 'Writer course module not found.',
      });
    }

    const title =
      req.body?.title === undefined
        ? module.title
        : cleanText(req.body.title, 255);

    const description =
      req.body?.description === undefined
        ? module.description
        : cleanText(req.body.description, 5000) || null;

    const sortOrder =
      Number.isInteger(Number(req.body?.sort_order)) &&
      Number(req.body.sort_order) >= 0
        ? Number(req.body.sort_order)
        : Number(module.sort_order || 0);

    const status = ['draft', 'published'].includes(req.body?.status)
      ? req.body.status
      : module.status;

    if (!title) {
      return res.status(400).json({
        ok: false,
        message: 'Module title is required.',
      });
    }

    await pool.query(
      `
      UPDATE writer_course_modules
      SET
        title = ?,
        description = ?,
        sort_order = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [title, description, sortOrder, status, moduleId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Course module updated.',
    });
  } catch (error) {
    console.error('updateCourseModule error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update course module.',
      error: error.message,
    });
  }
}

async function deleteCourseModule(req, res) {
  try {
    const moduleId = positiveInt(req.params?.moduleId);

    if (!moduleId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid module ID is required.',
      });
    }

    const [[module]] = await pool.query(
      `
      SELECT m.id, ws.user_id
      FROM writer_course_modules m
      INNER JOIN writer_series ws
        ON ws.id = m.course_series_id
        AND ws.series_type = 'course'
      WHERE m.id = ?
      LIMIT 1
      `,
      [moduleId]
    );

    if (!module || Number(module.user_id) !== Number(req.user.id)) {
      return res.status(404).json({
        ok: false,
        message: 'Writer course module not found.',
      });
    }

    const [[lessonCount]] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM writer_course_lessons
      WHERE module_id = ?
      `,
      [moduleId]
    );

    if (Number(lessonCount?.total || 0) > 0) {
      return res.status(400).json({
        ok: false,
        message: 'Remove the module lessons before deleting this module.',
      });
    }

    await pool.query(
      `
      DELETE FROM writer_course_modules
      WHERE id = ?
      `,
      [moduleId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Course module deleted.',
    });
  } catch (error) {
    console.error('deleteCourseModule error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to delete course module.',
      error: error.message,
    });
  }
}

async function addCourseLesson(req, res) {
  const connection = await pool.getConnection();

  try {
    const courseId = positiveInt(req.params?.courseId);
    const moduleId = positiveInt(req.params?.moduleId);
    const postId = positiveInt(req.body?.post_id);
    const requestedSort = Number(req.body?.sort_order);

    if (!courseId || !moduleId || !postId) {
      connection.release();

      return res.status(400).json({
        ok: false,
        message: 'Valid course, module, and lesson post IDs are required.',
      });
    }

    await connection.beginTransaction();

    const course = await getOwnedCourse(courseId, req.user.id, connection);

    if (!course) {
      await connection.rollback();
      connection.release();

      return res.status(404).json({
        ok: false,
        message: 'Writer course not found.',
      });
    }

    const [[module]] = await connection.query(
      `
      SELECT *
      FROM writer_course_modules
      WHERE id = ?
        AND course_series_id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [moduleId, courseId]
    );

    if (!module) {
      await connection.rollback();
      connection.release();

      return res.status(404).json({
        ok: false,
        message: 'Course module not found.',
      });
    }

    const [[post]] = await connection.query(
      `
      SELECT
        id,
        user_id,
        website_id,
        title,
        content_type,
        status
      FROM product_posts
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [postId]
    );

    if (
      !post ||
      Number(post.user_id) !== Number(req.user.id) ||
      Number(post.website_id) !== Number(course.website_id)
    ) {
      throw new Error('Course lesson post must belong to this Writer and storefront.');
    }

    if (post.content_type !== 'course_lesson') {
      throw new Error('Only posts with content type Course Lesson can be added.');
    }

    const [[existingSeriesItem]] = await connection.query(
      `
      SELECT id, series_id
      FROM writer_series_items
      WHERE post_id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [postId]
    );

    if (
      existingSeriesItem &&
      Number(existingSeriesItem.series_id) !== Number(courseId)
    ) {
      throw new Error('This lesson post already belongs to another series.');
    }

    let sortOrder = Number.isInteger(requestedSort) && requestedSort >= 0
      ? requestedSort
      : null;

    if (sortOrder === null) {
      const [[row]] = await connection.query(
        `
        SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_sort
        FROM writer_course_lessons
        WHERE module_id = ?
        `,
        [moduleId]
      );

      sortOrder = Number(row?.next_sort || 0);
    }

    if (!existingSeriesItem) {
      await connection.query(
        `
        INSERT INTO writer_series_items (
          series_id,
          post_id,
          season_number,
          episode_number,
          sort_order,
          created_at,
          updated_at
        )
        VALUES (?, ?, NULL, NULL, ?, NOW(), NOW())
        `,
        [courseId, postId, sortOrder]
      );
    }

    const [lessonResult] = await connection.query(
      `
      INSERT INTO writer_course_lessons (
        course_series_id,
        module_id,
        post_id,
        sort_order,
        status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, 'active', NOW(), NOW())
      `,
      [courseId, moduleId, postId, sortOrder]
    );

    await connection.commit();
    connection.release();

    return res.status(201).json({
      ok: true,
      message: 'Course lesson added.',
      lesson_id: lessonResult.insertId,
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}
    connection.release();

    console.error('addCourseLesson error:', error);

    const status =
      /must belong|only posts|already belongs|duplicate/i.test(error.message || '')
        ? 400
        : 500;

    return res.status(status).json({
      ok: false,
      message: error.message || 'Failed to add course lesson.',
    });
  }
}

async function updateCourseLesson(req, res) {
  try {
    const lessonId = positiveInt(req.params?.lessonId);

    if (!lessonId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid lesson ID is required.',
      });
    }

    const [[lesson]] = await pool.query(
      `
      SELECT
        l.*,
        ws.user_id
      FROM writer_course_lessons l
      INNER JOIN writer_series ws
        ON ws.id = l.course_series_id
        AND ws.series_type = 'course'
      WHERE l.id = ?
      LIMIT 1
      `,
      [lessonId]
    );

    if (!lesson || Number(lesson.user_id) !== Number(req.user.id)) {
      return res.status(404).json({
        ok: false,
        message: 'Writer course lesson not found.',
      });
    }

    const sortOrder =
      Number.isInteger(Number(req.body?.sort_order)) &&
      Number(req.body.sort_order) >= 0
        ? Number(req.body.sort_order)
        : Number(lesson.sort_order || 0);

    const status = ['active', 'inactive'].includes(req.body?.status)
      ? req.body.status
      : lesson.status;

    await pool.query(
      `
      UPDATE writer_course_lessons
      SET
        sort_order = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [sortOrder, status, lessonId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Course lesson updated.',
    });
  } catch (error) {
    console.error('updateCourseLesson error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update course lesson.',
      error: error.message,
    });
  }
}

async function deleteCourseLesson(req, res) {
  try {
    const lessonId = positiveInt(req.params?.lessonId);

    if (!lessonId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid lesson ID is required.',
      });
    }

    const [[lesson]] = await pool.query(
      `
      SELECT
        l.*,
        ws.user_id
      FROM writer_course_lessons l
      INNER JOIN writer_series ws
        ON ws.id = l.course_series_id
        AND ws.series_type = 'course'
      WHERE l.id = ?
      LIMIT 1
      `,
      [lessonId]
    );

    if (!lesson || Number(lesson.user_id) !== Number(req.user.id)) {
      return res.status(404).json({
        ok: false,
        message: 'Writer course lesson not found.',
      });
    }

    await pool.query(
      `
      DELETE FROM writer_course_lessons
      WHERE id = ?
      `,
      [lessonId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Course lesson removed.',
    });
  } catch (error) {
    console.error('deleteCourseLesson error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to remove course lesson.',
      error: error.message,
    });
  }
}

async function listPublicCourses(req, res) {
  try {
    const websiteSlug = cleanText(req.params?.websiteSlug, 255);

    const [courses] = await pool.query(
      `
      SELECT
        ws.id,
        ws.title,
        ws.slug,
        ws.description,
        ws.cover_image,
        ws.created_at,
        ws.updated_at,
        aw.website_name,
        aw.slug AS website_slug,
        u.id AS writer_id,
        u.name AS writer_name,
        COUNT(DISTINCT m.id) AS module_count,
        COUNT(DISTINCT l.id) AS lesson_count
      FROM writer_series ws
      INNER JOIN affiliate_websites aw
        ON aw.id = ws.website_id
        AND aw.status = 'active'
      INNER JOIN users u
        ON u.id = ws.user_id
        AND u.role = 'affiliate'
        AND u.status = 'active'
      LEFT JOIN writer_course_modules m
        ON m.course_series_id = ws.id
        AND m.status = 'published'
      LEFT JOIN writer_course_lessons l
        ON l.course_series_id = ws.id
        AND l.status = 'active'
      LEFT JOIN product_posts p
        ON p.id = l.post_id
        AND p.status = 'published'
      WHERE aw.slug = ?
        AND ws.series_type = 'course'
        AND ws.status = 'published'
      GROUP BY ws.id
      ORDER BY ws.id DESC
      `,
      [websiteSlug]
    );

    return res.status(200).json({
      ok: true,
      courses: courses.map((course) => ({
        ...course,
        module_count: Number(course.module_count || 0),
        lesson_count: Number(course.lesson_count || 0),
      })),
    });
  } catch (error) {
    console.error('listPublicCourses error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to load published courses.',
      error: error.message,
    });
  }
}

async function getPublicCourse(req, res) {
  try {
    const websiteSlug = cleanText(req.params?.websiteSlug, 255);
    const courseSlug = cleanText(req.params?.courseSlug, 255);

    const course = await getPublishedCourseBySlug(websiteSlug, courseSlug);

    if (!course) {
      return res.status(404).json({
        ok: false,
        message: 'Published course not found.',
      });
    }

    const modules = await getCourseStructure(course.id, { publicOnly: true });

    return res.status(200).json({
      ok: true,
      course,
      modules,
    });
  } catch (error) {
    console.error('getPublicCourse error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to load published course.',
      error: error.message,
    });
  }
}

async function enrollReaderInCourse(req, res) {
  const connection = await pool.getConnection();

  try {
    const courseId = positiveInt(req.params?.courseId);

    if (!courseId) {
      connection.release();

      return res.status(400).json({
        ok: false,
        message: 'Valid course ID is required.',
      });
    }

    await connection.beginTransaction();

    const course = await getPublishedCourseById(courseId, connection);

    if (!course) {
      await connection.rollback();
      connection.release();

      return res.status(404).json({
        ok: false,
        message: 'Published course not found.',
      });
    }

    const enrollment = await ensureEnrollment(
      req.user.id,
      courseId,
      connection
    );

    if (enrollment.status === 'cancelled') {
      await connection.query(
        `
        UPDATE reader_course_enrollments
        SET
          status = 'active',
          completed_at = NULL,
          updated_at = NOW()
        WHERE id = ?
        `,
        [enrollment.id]
      );
    }

    await connection.commit();
    connection.release();

    return res.status(201).json({
      ok: true,
      message: 'Reader enrolled in course.',
      enrollment_id: enrollment.id,
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}
    connection.release();

    console.error('enrollReaderInCourse error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to enroll Reader in course.',
      error: error.message,
    });
  }
}

async function listReaderCourses(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        e.id AS enrollment_id,
        e.course_series_id,
        e.status AS enrollment_status,
        e.enrolled_at,
        e.completed_at,
        ws.title,
        ws.slug,
        ws.description,
        ws.cover_image,
        aw.slug AS website_slug,
        u.id AS writer_id,
        u.name AS writer_name,
        COUNT(DISTINCT l.id) AS total_lessons,
        COUNT(
          DISTINCT CASE
            WHEN pr.status = 'completed'
            THEN l.id
            ELSE NULL
          END
        ) AS completed_lessons
      FROM reader_course_enrollments e
      INNER JOIN writer_series ws
        ON ws.id = e.course_series_id
        AND ws.series_type = 'course'
      INNER JOIN affiliate_websites aw
        ON aw.id = ws.website_id
      INNER JOIN users u
        ON u.id = ws.user_id
      LEFT JOIN writer_course_lessons l
        ON l.course_series_id = ws.id
        AND l.status = 'active'
      LEFT JOIN reader_course_lesson_progress pr
        ON pr.course_lesson_id = l.id
        AND pr.enrollment_id = e.id
      WHERE e.reader_user_id = ?
      GROUP BY e.id
      ORDER BY e.updated_at DESC, e.id DESC
      `,
      [req.user.id]
    );

    return res.status(200).json({
      ok: true,
      courses: rows.map((row) => ({
        ...row,
        total_lessons: Number(row.total_lessons || 0),
        completed_lessons: Number(row.completed_lessons || 0),
      })),
    });
  } catch (error) {
    console.error('listReaderCourses error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to load Reader courses.',
      error: error.message,
    });
  }
}

async function getReaderCourse(req, res) {
  try {
    const courseId = positiveInt(req.params?.courseId);

    if (!courseId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid course ID is required.',
      });
    }

    const course = await getPublishedCourseById(courseId);

    if (!course) {
      return res.status(404).json({
        ok: false,
        message: 'Published course not found.',
      });
    }

    const [[enrollment]] = await pool.query(
      `
      SELECT *
      FROM reader_course_enrollments
      WHERE reader_user_id = ?
        AND course_series_id = ?
      LIMIT 1
      `,
      [req.user.id, courseId]
    );

    const modules = await getCourseStructure(courseId, { publicOnly: true });

    let progressMap = new Map();

    if (enrollment) {
      const [progressRows] = await pool.query(
        `
        SELECT
          course_lesson_id,
          progress_percent,
          status,
          started_at,
          completed_at,
          last_viewed_at
        FROM reader_course_lesson_progress
        WHERE enrollment_id = ?
        `,
        [enrollment.id]
      );

      progressMap = new Map(
        progressRows.map((row) => [
          Number(row.course_lesson_id),
          {
            progress_percent: Number(row.progress_percent || 0),
            status: row.status,
            started_at: row.started_at,
            completed_at: row.completed_at,
            last_viewed_at: row.last_viewed_at,
          },
        ])
      );
    }

    const personalizedModules = modules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => ({
        ...lesson,
        progress: progressMap.get(Number(lesson.id)) || {
          progress_percent: 0,
          status: 'not_started',
          started_at: null,
          completed_at: null,
          last_viewed_at: null,
        },
      })),
    }));

    return res.status(200).json({
      ok: true,
      course,
      enrollment: enrollment || null,
      modules: personalizedModules,
    });
  } catch (error) {
    console.error('getReaderCourse error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to load Reader course.',
      error: error.message,
    });
  }
}

async function updateReaderLessonProgress(req, res) {
  const connection = await pool.getConnection();

  try {
    const courseId = positiveInt(req.params?.courseId);
    const lessonId = positiveInt(req.params?.lessonId);
    const progressPercent = clampPercent(req.body?.progress_percent);

    if (!courseId || !lessonId || progressPercent === null) {
      connection.release();

      return res.status(400).json({
        ok: false,
        message: 'Valid course, lesson, and progress percentage are required.',
      });
    }

    await connection.beginTransaction();

    const course = await getPublishedCourseById(courseId, connection);

    if (!course) {
      await connection.rollback();
      connection.release();

      return res.status(404).json({
        ok: false,
        message: 'Published course not found.',
      });
    }

    const enrollment = await ensureEnrollment(
      req.user.id,
      courseId,
      connection
    );

    const [[lesson]] = await connection.query(
      `
      SELECT
        l.id,
        l.course_series_id,
        l.module_id,
        l.post_id,
        l.status,
        m.status AS module_status,
        p.status AS post_status
      FROM writer_course_lessons l
      INNER JOIN writer_course_modules m
        ON m.id = l.module_id
      INNER JOIN product_posts p
        ON p.id = l.post_id
      WHERE l.id = ?
        AND l.course_series_id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [lessonId, courseId]
    );

    if (
      !lesson ||
      lesson.status !== 'active' ||
      lesson.module_status !== 'published' ||
      lesson.post_status !== 'published'
    ) {
      throw new Error('Published course lesson not found.');
    }

    const status =
      progressPercent >= 100
        ? 'completed'
        : progressPercent > 0
        ? 'in_progress'
        : 'not_started';

    await connection.query(
      `
      INSERT INTO reader_course_lesson_progress (
        enrollment_id,
        reader_user_id,
        course_series_id,
        course_lesson_id,
        post_id,
        progress_percent,
        status,
        started_at,
        completed_at,
        last_viewed_at,
        created_at,
        updated_at
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        CASE WHEN ? > 0 THEN NOW() ELSE NULL END,
        CASE WHEN ? >= 100 THEN NOW() ELSE NULL END,
        NOW(),
        NOW(),
        NOW()
      )
      ON DUPLICATE KEY UPDATE
        progress_percent = VALUES(progress_percent),
        status = VALUES(status),
        started_at = CASE
          WHEN started_at IS NULL AND VALUES(progress_percent) > 0
          THEN NOW()
          ELSE started_at
        END,
        completed_at = CASE
          WHEN VALUES(progress_percent) >= 100
          THEN COALESCE(completed_at, NOW())
          ELSE NULL
        END,
        last_viewed_at = NOW(),
        updated_at = NOW()
      `,
      [
        enrollment.id,
        req.user.id,
        courseId,
        lessonId,
        lesson.post_id,
        progressPercent,
        status,
        progressPercent,
        progressPercent,
      ]
    );

    const completion = await recalculateEnrollment(
      connection,
      enrollment
    );

    if (completion.is_completed && enrollment.status !== 'completed') {
      await connection.query(
        `
        INSERT INTO user_notifications (
          recipient_user_id,
          actor_user_id,
          notification_type,
          title,
          message,
          is_read,
          created_at
        )
        VALUES (?, NULL, 'reader_course_completed', 'Course completed', ?, 0, NOW())
        `,
        [
          req.user.id,
          `You completed "${course.title}".`,
        ]
      );
    }

    await connection.commit();
    connection.release();

    return res.status(200).json({
      ok: true,
      message: completion.is_completed
        ? 'Lesson progress saved. Course completed.'
        : 'Lesson progress saved.',
      progress_percent: progressPercent,
      status,
      enrollment: completion,
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}
    connection.release();

    console.error('updateReaderLessonProgress error:', error);

    const statusCode = /not found/i.test(error.message || '') ? 404 : 500;

    return res.status(statusCode).json({
      ok: false,
      message: error.message || 'Failed to update lesson progress.',
    });
  }
}

module.exports = {
  listWriterCourses,
  getWriterCourse,
  createCourseModule,
  updateCourseModule,
  deleteCourseModule,
  addCourseLesson,
  updateCourseLesson,
  deleteCourseLesson,
  listPublicCourses,
  getPublicCourse,
  enrollReaderInCourse,
  listReaderCourses,
  getReaderCourse,
  updateReaderLessonProgress,
};