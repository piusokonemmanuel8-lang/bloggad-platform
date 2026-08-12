const pool = require('../config/db');

function positiveInt(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function clampPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(0, Math.min(100, Number(number.toFixed(2))));
}

async function getOwnedCourse(courseId, writerUserId, connection = pool) {
  const [rows] = await connection.query(
    `
    SELECT
      ws.id,
      ws.user_id,
      ws.website_id,
      ws.title,
      ws.slug,
      ws.description,
      ws.cover_image,
      ws.series_type,
      ws.status,
      ws.created_at,
      ws.updated_at,
      aw.website_name,
      aw.slug AS website_slug
    FROM writer_series ws
    INNER JOIN affiliate_websites aw
      ON aw.id = ws.website_id
    WHERE ws.id = ?
      AND ws.user_id = ?
      AND ws.series_type = 'course'
    LIMIT 1
    `,
    [courseId, writerUserId]
  );

  return rows[0] || null;
}

async function getPublishedCourseById(courseId, connection = pool) {
  const [rows] = await connection.query(
    `
    SELECT
      ws.id,
      ws.user_id,
      ws.website_id,
      ws.title,
      ws.slug,
      ws.description,
      ws.cover_image,
      ws.series_type,
      ws.status,
      ws.created_at,
      ws.updated_at,
      aw.website_name,
      aw.slug AS website_slug,
      u.name AS writer_name
    FROM writer_series ws
    INNER JOIN affiliate_websites aw
      ON aw.id = ws.website_id
      AND aw.status = 'active'
    INNER JOIN users u
      ON u.id = ws.user_id
      AND u.role = 'affiliate'
      AND u.status = 'active'
    WHERE ws.id = ?
      AND ws.series_type = 'course'
      AND ws.status = 'published'
    LIMIT 1
    `,
    [courseId]
  );

  return rows[0] || null;
}

async function getPublishedCourseBySlug(websiteSlug, courseSlug, connection = pool) {
  const [rows] = await connection.query(
    `
    SELECT
      ws.id,
      ws.user_id,
      ws.website_id,
      ws.title,
      ws.slug,
      ws.description,
      ws.cover_image,
      ws.series_type,
      ws.status,
      ws.created_at,
      ws.updated_at,
      aw.website_name,
      aw.slug AS website_slug,
      u.name AS writer_name
    FROM writer_series ws
    INNER JOIN affiliate_websites aw
      ON aw.id = ws.website_id
      AND aw.status = 'active'
    INNER JOIN users u
      ON u.id = ws.user_id
      AND u.role = 'affiliate'
      AND u.status = 'active'
    WHERE aw.slug = ?
      AND ws.slug = ?
      AND ws.series_type = 'course'
      AND ws.status = 'published'
    LIMIT 1
    `,
    [websiteSlug, courseSlug]
  );

  return rows[0] || null;
}

async function getCourseStructure(courseId, options = {}, connection = pool) {
  const publicOnly = Boolean(options.publicOnly);

  const moduleWhere = publicOnly
    ? "AND m.status = 'published'"
    : '';

  const lessonWhere = publicOnly
    ? "AND l.status = 'active' AND p.status = 'published'"
    : '';

  const [modules] = await connection.query(
    `
    SELECT
      m.id,
      m.course_series_id,
      m.title,
      m.description,
      m.sort_order,
      m.status,
      m.created_at,
      m.updated_at
    FROM writer_course_modules m
    WHERE m.course_series_id = ?
      ${moduleWhere}
    ORDER BY m.sort_order ASC, m.id ASC
    `,
    [courseId]
  );

  const [lessons] = await connection.query(
    `
    SELECT
      l.id,
      l.course_series_id,
      l.module_id,
      l.post_id,
      l.sort_order,
      l.status,
      l.created_at,
      l.updated_at,
      p.title,
      p.slug,
      p.excerpt,
      p.featured_image,
      p.content_type,
      p.status AS post_status,
      p.published_at,
      p.scheduled_at,
      COALESCE(pas.access_type, 'free') AS access_type,
      COALESCE(pas.preview_percent, 25) AS preview_percent
    FROM writer_course_lessons l
    INNER JOIN product_posts p
      ON p.id = l.post_id
    LEFT JOIN post_access_settings pas
      ON pas.post_id = p.id
    WHERE l.course_series_id = ?
      ${lessonWhere}
    ORDER BY l.module_id ASC, l.sort_order ASC, l.id ASC
    `,
    [courseId]
  );

  const byModule = new Map();

  for (const module of modules) {
    byModule.set(Number(module.id), {
      ...module,
      lessons: [],
    });
  }

  for (const lesson of lessons) {
    const bucket = byModule.get(Number(lesson.module_id));
    if (!bucket) continue;

    bucket.lessons.push({
      ...lesson,
      preview_percent: Number(lesson.preview_percent || 0),
    });
  }

  return Array.from(byModule.values());
}

async function ensureEnrollment(readerUserId, courseId, connection) {
  await connection.query(
    `
    INSERT IGNORE INTO reader_course_enrollments (
      reader_user_id,
      course_series_id,
      status,
      enrolled_at,
      created_at,
      updated_at
    )
    VALUES (?, ?, 'active', NOW(), NOW(), NOW())
    `,
    [readerUserId, courseId]
  );

  const [rows] = await connection.query(
    `
    SELECT *
    FROM reader_course_enrollments
    WHERE reader_user_id = ?
      AND course_series_id = ?
    LIMIT 1
    FOR UPDATE
    `,
    [readerUserId, courseId]
  );

  return rows[0] || null;
}

async function recalculateEnrollment(connection, enrollment) {
  const [[totals]] = await connection.query(
    `
    SELECT
      COUNT(*) AS total_lessons,
      SUM(
        CASE
          WHEN p.status = 'published'
            AND m.status = 'published'
            AND l.status = 'active'
          THEN 1
          ELSE 0
        END
      ) AS active_lessons
    FROM writer_course_lessons l
    INNER JOIN writer_course_modules m
      ON m.id = l.module_id
    INNER JOIN product_posts p
      ON p.id = l.post_id
    WHERE l.course_series_id = ?
    `,
    [enrollment.course_series_id]
  );

  const activeLessons = Number(totals?.active_lessons || 0);

  const [[progress]] = await connection.query(
    `
    SELECT COUNT(*) AS completed_lessons
    FROM reader_course_lesson_progress p
    INNER JOIN writer_course_lessons l
      ON l.id = p.course_lesson_id
    INNER JOIN writer_course_modules m
      ON m.id = l.module_id
    INNER JOIN product_posts pp
      ON pp.id = l.post_id
    WHERE p.enrollment_id = ?
      AND p.status = 'completed'
      AND l.status = 'active'
      AND m.status = 'published'
      AND pp.status = 'published'
    `,
    [enrollment.id]
  );

  const completedLessons = Number(progress?.completed_lessons || 0);
  const completed = activeLessons > 0 && completedLessons >= activeLessons;

  await connection.query(
    `
    UPDATE reader_course_enrollments
    SET
      status = ?,
      completed_at = ?,
      updated_at = NOW()
    WHERE id = ?
    `,
    [
      completed ? 'completed' : 'active',
      completed ? new Date() : null,
      enrollment.id,
    ]
  );

  return {
    active_lessons: activeLessons,
    completed_lessons: completedLessons,
    is_completed: completed,
  };
}

module.exports = {
  positiveInt,
  clampPercent,
  getOwnedCourse,
  getPublishedCourseById,
  getPublishedCourseBySlug,
  getCourseStructure,
  ensureEnrollment,
  recalculateEnrollment,
};