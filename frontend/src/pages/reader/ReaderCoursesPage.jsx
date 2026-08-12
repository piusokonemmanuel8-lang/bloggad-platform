import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import ReaderUnifiedShell from '../../components/reader/ReaderUnifiedShell';
import './ReaderCoursesApproved.css';

function progressPercent(completed, total) {
  const safeCompleted = Number(completed || 0);
  const safeTotal = Number(total || 0);

  if (!safeTotal) return 0;

  return Math.max(0, Math.min(100, Math.round((safeCompleted / safeTotal) * 100)));
}

export default function ReaderCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function loadCourses(preferredId = '') {
    try {
      setError('');
      const { data } = await api.get('/api/reader/courses');
      const next = Array.isArray(data?.courses) ? data.courses : [];
      setCourses(next);

      const candidate = preferredId || selectedId || next[0]?.course_series_id || '';
      const exists = next.some((item) => String(item.course_series_id) === String(candidate));
      setSelectedId(exists ? String(candidate) : next[0] ? String(next[0].course_series_id) : '');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load Reader courses.');
    }
  }

  async function loadCourse(courseId) {
    if (!courseId) {
      setDetail(null);
      return;
    }

    try {
      setError('');
      const { data } = await api.get(`/api/reader/courses/${courseId}`);
      setDetail({
        course: data?.course || null,
        enrollment: data?.enrollment || null,
        modules: Array.isArray(data?.modules) ? data.modules : [],
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load Reader course.');
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadCourse(selectedId);
  }, [selectedId]);

  async function updateProgress(lessonId, progressPercentValue) {
    if (!selectedId || !lessonId) return;

    try {
      setBusy(`lesson-${lessonId}`);
      setError('');
      setNotice('');

      const { data } = await api.patch(
        `/api/reader/courses/${selectedId}/lessons/${lessonId}/progress`,
        { progress_percent: progressPercentValue }
      );

      setNotice(data?.message || 'Lesson progress saved.');
      await loadCourse(selectedId);
      await loadCourses(selectedId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save lesson progress.');
    } finally {
      setBusy('');
    }
  }

  const selectedCourse = useMemo(
    () =>
      courses.find(
        (course) => String(course.course_series_id) === String(selectedId)
      ) || null,
    [courses, selectedId]
  );

  const selectedCompleted = Number(selectedCourse?.completed_lessons || 0);
  const selectedTotal = Number(selectedCourse?.total_lessons || 0);
  const selectedPercent = progressPercent(selectedCompleted, selectedTotal);
  const enrollmentStatus =
    detail?.enrollment?.status ||
    selectedCourse?.enrollment_status ||
    'active';

  return (
    <ReaderUnifiedShell title="Courses" subtitle="Reader learning">
      <main className="reader-courses-page">
        <h1 className="reader-courses-mobile-title">Courses</h1>

        <div className="reader-courses-info" role="note">
          <span className="reader-courses-info-mark" aria-hidden="true">i</span>
          <span>
            Your enrolled Writer courses, published lessons, and progress are shown here.
            Premium lesson access is checked when a lesson opens.
          </span>
        </div>

        {notice ? (
          <div className="reader-courses-alert success" role="status">
            {notice}
          </div>
        ) : null}

        {error ? (
          <div className="reader-courses-alert error" role="alert">
            {error}
          </div>
        ) : null}

        <div className="reader-courses-layout">
          <aside className="reader-courses-list-column" aria-label="My enrolled courses">
            <div className="reader-courses-section-heading">
              <h2>My courses</h2>
              <p>Enrolled Writer courses</p>
            </div>

            <div className="reader-courses-list">
              {courses.map((course) => {
                const active =
                  String(course.course_series_id) === String(selectedId);
                const completed = Number(course.completed_lessons || 0);
                const total = Number(course.total_lessons || 0);
                const percent = progressPercent(completed, total);

                return (
                  <article
                    className={`reader-course-card${active ? ' active' : ''}`}
                    key={course.enrollment_id || course.course_series_id}
                  >
                    <div className="reader-course-card-top">
                      <span>{course.writer_name || 'Writer'}</span>
                      <span className="reader-course-status">
                        {course.enrollment_status || 'active'}
                      </span>
                    </div>

                    <h3>{course.title}</h3>
                    <p>{course.description || 'Writer course'}</p>

                    <div
                      className="reader-course-progress"
                      aria-label={`${percent}% complete`}
                    >
                      <span style={{ width: `${Math.max(percent, percent > 0 ? 2 : 0)}%` }} />
                    </div>

                    <div className="reader-course-card-bottom">
                      <span>
                        {completed} of {total} lessons completed
                      </span>
                      <button
                        type="button"
                        className={active ? 'primary' : 'secondary'}
                        onClick={() =>
                          setSelectedId(String(course.course_series_id))
                        }
                      >
                        {active ? 'Course open' : 'Open course'}
                      </button>
                    </div>
                  </article>
                );
              })}

              {!courses.length ? (
                <div className="reader-courses-empty-list">
                  <strong>EMPTY STATE</strong>
                  <span>
                    You have not enrolled in a Writer course yet. Open a Writer
                    profile and choose Enroll on a published course.
                  </span>
                </div>
              ) : null}
            </div>
          </aside>

          {detail?.course ? (
            <section className="reader-course-detail">
              <div className="reader-course-detail-head">
                <div>
                  <h2>{detail.course.title}</h2>
                  {detail.course.description ? (
                    <p>{detail.course.description}</p>
                  ) : (
                    <p>Published modules and lessons appear below.</p>
                  )}
                </div>

                <span className="reader-course-enrollment-pill">
                  Enrolled | {enrollmentStatus}
                </span>
              </div>

              <div className="reader-course-overall">
                <div>
                  <span className="reader-course-label">COURSE PROGRESS</span>
                  <strong>
                    {selectedCompleted} of {selectedTotal} lessons completed
                  </strong>
                </div>

                <div className="reader-course-overall-bar">
                  <span>{selectedPercent}% complete</span>
                  <div className="reader-course-progress">
                    <span
                      style={{
                        width: `${Math.max(
                          selectedPercent,
                          selectedPercent > 0 ? 2 : 0
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="reader-course-divider" />

              <div className="reader-course-modules">
                {detail.modules.map((module) => (
                  <section className="reader-course-module" key={module.id}>
                    <h3>{module.title}</h3>

                    {module.description ? (
                      <p className="reader-course-module-description">
                        {module.description}
                      </p>
                    ) : null}

                    <div className="reader-course-lessons">
                      {(module.lessons || []).map((lesson) => {
                        const percent = Number(
                          lesson?.progress?.progress_percent || 0
                        );
                        const lessonBusy = busy === `lesson-${lesson.id}`;
                        const postPath =
                          detail.course.website_slug && lesson.slug
                            ? `/${detail.course.website_slug}/post/${lesson.slug}`
                            : '';

                        return (
                          <article
                            className="reader-course-lesson"
                            key={lesson.id}
                          >
                            <div className="reader-course-lesson-top">
                              <div>
                                <strong>
                                  {lesson.title || `Lesson #${lesson.id}`}
                                </strong>
                                <span>
                                  {lesson.access_type === 'premium'
                                    ? 'Premium lesson'
                                    : 'Free lesson'}{' '}
                                  | {percent}% complete
                                </span>
                              </div>

                              {postPath ? (
                                <Link
                                  to={postPath}
                                  className="reader-course-read-link"
                                >
                                  Read lesson
                                </Link>
                              ) : null}
                            </div>

                            <div
                              className="reader-course-progress"
                              aria-label={`${percent}% complete`}
                            >
                              <span
                                style={{
                                  width: `${Math.max(
                                    percent,
                                    percent > 0 ? 2 : 0
                                  )}%`,
                                }}
                              />
                            </div>

                            <div className="reader-course-lesson-actions">
                              {percent <= 0 ? (
                                <button
                                  type="button"
                                  className="secondary"
                                  disabled={lessonBusy}
                                  onClick={() => updateProgress(lesson.id, 1)}
                                >
                                  Start lesson
                                </button>
                              ) : null}

                              {percent < 100 ? (
                                <button
                                  type="button"
                                  className="primary"
                                  disabled={lessonBusy}
                                  onClick={() => updateProgress(lesson.id, 100)}
                                >
                                  {lessonBusy ? 'Saving...' : 'Mark complete'}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="secondary"
                                  disabled={lessonBusy}
                                  onClick={() => updateProgress(lesson.id, 0)}
                                >
                                  {lessonBusy ? 'Saving...' : 'Reset progress'}
                                </button>
                              )}
                            </div>
                          </article>
                        );
                      })}

                      {!module.lessons?.length ? (
                        <div className="reader-course-empty-module">
                          <strong>EMPTY MODULE STATE</strong>
                          <span>No published lessons in this module yet.</span>
                        </div>
                      ) : null}
                    </div>
                  </section>
                ))}

                {!detail.modules.length ? (
                  <div className="reader-course-empty-module standalone">
                    <strong>EMPTY COURSE STATE</strong>
                    <span>This course has no published modules yet.</span>
                  </div>
                ) : null}
              </div>

              <div className="reader-courses-premium-note" role="note">
                <span className="reader-courses-info-mark" aria-hidden="true">
                  i
                </span>
                <span>
                  Premium lessons still require the appropriate Reader plan or
                  direct Writer membership when opened.
                </span>
              </div>
            </section>
          ) : courses.length ? (
            <section className="reader-course-detail reader-course-detail-loading">
              Select an enrolled course to open its published modules and lessons.
            </section>
          ) : null}
        </div>

        {courses.length ? (
          <div className="reader-courses-mobile-empty-reference">
            <strong>EMPTY STATE</strong>
            <span>You have not enrolled in a Writer course yet.</span>
          </div>
        ) : null}
      </main>
    </ReaderUnifiedShell>
  );
}
