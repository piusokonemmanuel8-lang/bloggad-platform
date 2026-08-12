import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

export default function WriterCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [course, setCourse] = useState(null);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', sort_order: 0 });
  const [lessonForms, setLessonForms] = useState({});
  const [error, setError] = useState('');

  async function loadCourses() {
    try {
      setError('');
      const { data } = await api.get('/api/writer/courses');
      const next = data?.courses || [];
      setCourses(next);
      if (!selectedId && next[0]) setSelectedId(String(next[0].id));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load courses.');
    }
  }

  async function loadCourse(id) {
    if (!id) {
      setCourse(null);
      return;
    }

    try {
      setError('');
      const { data } = await api.get(`/api/writer/courses/${id}`);
      setCourse(
        data?.course
          ? { ...data.course, modules: data.modules || data.course.modules || [] }
          : null
      );
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load course.');
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadCourse(selectedId);
  }, [selectedId]);

  const modules = useMemo(() => course?.modules || [], [course]);

  async function createModule(event) {
    event.preventDefault();
    if (!selectedId) return;

    try {
      setError('');
      await api.post(`/api/writer/courses/${selectedId}/modules`, {
        ...moduleForm,
        sort_order: Number(moduleForm.sort_order || 0),
      });
      setModuleForm({ title: '', description: '', sort_order: 0 });
      await loadCourse(selectedId);
      await loadCourses();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create module.');
    }
  }

  async function addLesson(moduleId) {
    const value = lessonForms[moduleId] || {};
    const postId = Number(value.post_id || 0);

    if (!postId) {
      setError('Enter a valid Course Lesson post ID.');
      return;
    }

    try {
      setError('');
      await api.post(`/api/writer/courses/${selectedId}/modules/${moduleId}/lessons`, {
        post_id: postId,
        sort_order: Number(value.sort_order || 0),
      });
      setLessonForms((previous) => ({
        ...previous,
        [moduleId]: { post_id: '', sort_order: 0 },
      }));
      await loadCourse(selectedId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add lesson.');
    }
  }

  async function deleteModule(moduleId) {
    if (!window.confirm('Delete this empty module?')) return;

    try {
      setError('');
      await api.delete(`/api/writer/courses/modules/${moduleId}`);
      await loadCourse(selectedId);
      await loadCourses();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete module.');
    }
  }

  async function deleteLesson(lessonId) {
    try {
      setError('');
      await api.delete(`/api/writer/courses/lessons/${lessonId}`);
      await loadCourse(selectedId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to remove lesson.');
    }
  }

  return (
    <div className="writer-courses-page">
      <style>{styles}</style>

      <div className="writer-courses-mobile-title">Courses</div>

      {error ? (
        <div className="writer-courses-alert" role="alert">
          {error}
        </div>
      ) : null}

      <section className="writer-courses-selector-card">
        <label className="writer-courses-selector-label" htmlFor="writer-course-select">
          Select course
        </label>

        <select
          id="writer-course-select"
          className="writer-courses-input writer-courses-course-select"
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
        >
          <option value="">Choose a course</option>
          {courses.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </section>

      {!courses.length ? (
        <section className="writer-courses-empty">
          <strong>No courses yet</strong>
          <span>Create a series with type Course on the Series page first.</span>
        </section>
      ) : null}

      {selectedId ? (
        <section className="writer-courses-workspace">
          <aside className="writer-courses-tools">
            <form className="writer-courses-card writer-courses-add-module" onSubmit={createModule}>
              <div className="writer-courses-section-title">Add module</div>

              <label className="writer-courses-field">
                <span>Module title</span>
                <input
                  className="writer-courses-input"
                  placeholder="Enter module title"
                  value={moduleForm.title}
                  onChange={(event) =>
                    setModuleForm((previous) => ({
                      ...previous,
                      title: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label className="writer-courses-field">
                <span>Description</span>
                <textarea
                  className="writer-courses-input writer-courses-textarea"
                  placeholder="Short module description"
                  value={moduleForm.description}
                  onChange={(event) =>
                    setModuleForm((previous) => ({
                      ...previous,
                      description: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="writer-courses-field">
                <span>Sort order</span>
                <input
                  className="writer-courses-input"
                  type="number"
                  placeholder="Sort order"
                  value={moduleForm.sort_order}
                  onChange={(event) =>
                    setModuleForm((previous) => ({
                      ...previous,
                      sort_order: event.target.value,
                    }))
                  }
                />
              </label>

              <button className="writer-courses-btn primary writer-courses-add-module-btn">
                Add module
              </button>
            </form>

            <div className="writer-courses-card writer-courses-source-note">
              <strong>Course source</strong>
              <span>Courses come from Writer series with type Course.</span>
            </div>
          </aside>

          <section className="writer-courses-card writer-courses-structure">
            <div className="writer-courses-structure-head">
              <div className="writer-courses-structure-title">
                <span className="writer-courses-mobile-structure-label">Course structure</span>
                <strong>{course?.title || 'Course structure'}</strong>
              </div>

              <span className="writer-courses-badge">
                {modules.length} {modules.length === 1 ? 'module' : 'modules'}
              </span>
            </div>

            {modules.length ? (
              <div className="writer-courses-module-list">
                {modules.map((module) => (
                  <article className="writer-courses-module" key={module.id}>
                    <div className="writer-courses-module-head">
                      <strong>{module.title}</strong>

                      <button
                        type="button"
                        className="writer-courses-btn danger"
                        onClick={() => deleteModule(module.id)}
                      >
                        Delete
                      </button>
                    </div>

                    <div className="writer-courses-lessons">
                      {(module.lessons || []).map((lesson) => (
                        <div className="writer-courses-lesson" key={lesson.id}>
                          <strong>{lesson.title || `Lesson post #${lesson.post_id}`}</strong>

                          <button
                            type="button"
                            className="writer-courses-btn danger"
                            onClick={() => deleteLesson(lesson.id)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="writer-courses-add-lesson">
                      <label className="writer-courses-field writer-courses-lesson-post-field">
                        <span>Course Lesson post ID</span>
                        <input
                          className="writer-courses-input"
                          placeholder="Enter post ID"
                          value={lessonForms[module.id]?.post_id || ''}
                          onChange={(event) =>
                            setLessonForms((previous) => ({
                              ...previous,
                              [module.id]: {
                                ...(previous[module.id] || {}),
                                post_id: event.target.value,
                              },
                            }))
                          }
                        />
                      </label>

                      <label className="writer-courses-field writer-courses-order-field">
                        <span>Order</span>
                        <input
                          className="writer-courses-input"
                          type="number"
                          placeholder="Order"
                          value={lessonForms[module.id]?.sort_order || 0}
                          onChange={(event) =>
                            setLessonForms((previous) => ({
                              ...previous,
                              [module.id]: {
                                ...(previous[module.id] || {}),
                                sort_order: event.target.value,
                              },
                            }))
                          }
                        />
                      </label>

                      <button
                        type="button"
                        className="writer-courses-btn primary writer-courses-add-lesson-btn"
                        onClick={() => addLesson(module.id)}
                      >
                        Add lesson
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="writer-courses-no-modules">No modules yet.</div>
            )}
          </section>
        </section>
      ) : null}
    </div>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .writer-courses-page {
    width: 100%;
    color: #111827;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .writer-courses-page button,
  .writer-courses-page input,
  .writer-courses-page select,
  .writer-courses-page textarea {
    font: inherit;
  }

  .writer-courses-mobile-title {
    display: none;
  }

  .writer-courses-alert {
    margin-bottom: 12px;
    padding: 11px 13px;
    border: 1px solid #fecaca;
    border-radius: 11px;
    background: #fef2f2;
    color: #b42318;
    font-size: 12px;
    line-height: 1.45;
    font-weight: 600;
  }

  .writer-courses-selector-card,
  .writer-courses-card,
  .writer-courses-empty {
    border: 1px solid #e5e7eb;
    background: #ffffff;
  }

  .writer-courses-selector-card {
    min-height: 66px;
    margin-bottom: 12px;
    padding: 11px 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-radius: 14px;
  }

  .writer-courses-selector-label {
    flex: 1 1 auto;
    min-width: 140px;
    font-size: 12px;
    line-height: 1.3;
    font-weight: 600;
    white-space: nowrap;
  }

  .writer-courses-course-select {
    width: 430px;
    max-width: 46%;
    flex: 0 0 430px;
  }

  .writer-courses-input {
    width: 100%;
    min-width: 0;
    min-height: 42px;
    padding: 0 12px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    outline: 0;
    background: #ffffff;
    color: #111827;
    font-size: 11px;
    line-height: 1.4;
    font-weight: 500;
    transition: border-color 140ms ease, box-shadow 140ms ease;
  }

  .writer-courses-input::placeholder {
    color: #6b7280;
    opacity: 1;
  }

  .writer-courses-input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.06);
  }

  .writer-courses-textarea {
    min-height: 76px;
    padding: 10px 12px;
    resize: vertical;
  }

  .writer-courses-empty {
    margin-bottom: 12px;
    padding: 14px;
    display: grid;
    gap: 4px;
    border-radius: 14px;
  }

  .writer-courses-empty strong {
    font-size: 12px;
    font-weight: 600;
  }

  .writer-courses-empty span {
    color: #6b7280;
    font-size: 10px;
    line-height: 1.45;
  }

  .writer-courses-workspace {
    display: grid;
    grid-template-columns: 330px minmax(0, 1fr);
    gap: 14px;
    align-items: start;
  }

  .writer-courses-tools {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .writer-courses-card {
    border-radius: 14px;
  }

  .writer-courses-add-module {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .writer-courses-section-title {
    min-height: 28px;
    display: flex;
    align-items: center;
    font-size: 13px;
    line-height: 1.3;
    font-weight: 600;
  }

  .writer-courses-field {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .writer-courses-field > span {
    color: #6b7280;
    font-size: 9px;
    line-height: 1.25;
    font-weight: 600;
    letter-spacing: 0.025em;
    text-transform: uppercase;
  }

  .writer-courses-btn {
    min-height: 36px;
    padding: 0 12px;
    border: 1px solid #d1d5db;
    border-radius: 9px;
    background: #ffffff;
    color: #111827;
    font-size: 11px;
    line-height: 1;
    font-weight: 600;
    cursor: pointer;
  }

  .writer-courses-btn.primary {
    border-color: #111827;
    background: #111827;
    color: #ffffff;
  }

  .writer-courses-btn.danger {
    border-color: #fac4bf;
    background: #fef2f2;
    color: #b42520;
  }

  .writer-courses-add-module-btn {
    align-self: flex-start;
  }

  .writer-courses-source-note {
    padding: 14px;
    display: grid;
    gap: 5px;
  }

  .writer-courses-source-note strong {
    font-size: 11px;
    line-height: 1.3;
    font-weight: 600;
  }

  .writer-courses-source-note span {
    color: #6b7280;
    font-size: 10px;
    line-height: 1.45;
  }

  .writer-courses-structure {
    min-width: 0;
    padding: 16px;
  }

  .writer-courses-structure-head {
    min-height: 28px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .writer-courses-structure-title {
    flex: 1;
    min-width: 0;
  }

  .writer-courses-structure-title strong {
    display: block;
    overflow-wrap: anywhere;
    font-size: 13px;
    line-height: 1.35;
    font-weight: 600;
  }

  .writer-courses-mobile-structure-label {
    display: none;
  }

  .writer-courses-badge {
    min-height: 24px;
    padding: 0 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    background: #f8fafc;
    color: #6b7280;
    font-size: 9px;
    line-height: 1;
    font-weight: 600;
    white-space: nowrap;
  }

  .writer-courses-module-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .writer-courses-module {
    min-width: 0;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
  }

  .writer-courses-module-head {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .writer-courses-module-head > strong {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
    font-size: 13px;
    line-height: 1.35;
    font-weight: 600;
  }

  .writer-courses-lessons {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .writer-courses-lesson {
    min-height: 42px;
    padding: 3px 8px 3px 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: 9px;
    background: #f8fafc;
  }

  .writer-courses-lesson > strong {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
    font-size: 11px;
    line-height: 1.35;
    font-weight: 500;
  }

  .writer-courses-add-lesson {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 110px auto;
    gap: 8px;
    align-items: end;
  }

  .writer-courses-add-lesson-btn {
    white-space: nowrap;
  }

  .writer-courses-no-modules {
    padding: 20px 10px;
    color: #6b7280;
    font-size: 11px;
    line-height: 1.5;
    text-align: center;
  }

  @media (max-width: 1080px) {
    .writer-courses-workspace {
      grid-template-columns: 1fr;
    }

    .writer-courses-tools {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      align-items: start;
    }
  }

  @media (max-width: 767px) {
    .writer-courses-mobile-title {
      min-height: 50px;
      margin-bottom: 10px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: #ffffff;
      font-size: 14px;
      font-weight: 600;
    }

    .writer-courses-selector-card {
      min-height: 0;
      margin-bottom: 10px;
      padding: 12px;
      align-items: stretch;
      flex-direction: column;
      gap: 7px;
    }

    .writer-courses-selector-label {
      color: #6b7280;
      font-size: 8px;
      letter-spacing: 0.025em;
      text-transform: uppercase;
    }

    .writer-courses-course-select {
      width: 100%;
      max-width: none;
      flex: 0 0 auto;
      min-height: 40px;
      border-radius: 9px;
      font-size: 10px;
    }

    .writer-courses-workspace {
      width: 100%;
      min-width: 0;
      gap: 10px;
    }

    .writer-courses-tools {
      width: 100%;
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
    }

    .writer-courses-add-module,
    .writer-courses-source-note {
      width: 100%;
      min-width: 0;
    }

    .writer-courses-add-module {
      padding: 14px;
      gap: 10px;
    }

    .writer-courses-section-title {
      min-height: 26px;
      font-size: 12px;
    }

    .writer-courses-field {
      gap: 5px;
    }

    .writer-courses-field > span {
      font-size: 8px;
    }

    .writer-courses-input {
      min-height: 40px;
      padding: 0 11px;
      border-radius: 9px;
      font-size: 10px;
    }

    .writer-courses-textarea {
      min-height: 72px;
      padding: 10px 11px;
    }

    .writer-courses-add-module-btn {
      width: 100%;
      min-height: 36px;
    }

    .writer-courses-source-note {
      padding: 12px;
    }

    .writer-courses-source-note strong {
      font-size: 10px;
    }

    .writer-courses-source-note span {
      font-size: 9px;
    }

    .writer-courses-structure {
      width: 100%;
      min-width: 0;
      padding: 14px;
    }

    .writer-courses-structure-head {
      min-height: 26px;
      margin-bottom: 8px;
    }

    .writer-courses-mobile-structure-label {
      display: block;
      margin-bottom: 10px;
      font-size: 12px;
      line-height: 1.3;
      font-weight: 600;
    }

    .writer-courses-structure-title strong {
      font-size: 11px;
    }

    .writer-courses-badge {
      min-height: 24px;
      font-size: 8px;
    }

    .writer-courses-module {
      padding: 12px;
      gap: 9px;
    }

    .writer-courses-module-head > strong {
      font-size: 12px;
    }

    .writer-courses-btn {
      font-size: 10px;
    }

    .writer-courses-lesson {
      min-height: 42px;
      padding-left: 10px;
      padding-right: 6px;
      gap: 6px;
    }

    .writer-courses-lesson > strong {
      font-size: 9px;
    }

    .writer-courses-add-lesson {
      grid-template-columns: 106px minmax(0, 1fr);
      gap: 8px;
    }

    .writer-courses-lesson-post-field {
      grid-column: 1 / -1;
    }

    .writer-courses-order-field {
      grid-column: 1;
    }

    .writer-courses-add-lesson-btn {
      grid-column: 2;
      width: 100%;
      align-self: end;
    }
  }

  @media (max-width: 420px) {
    .writer-courses-module-head {
      align-items: flex-start;
    }

    .writer-courses-lesson {
      align-items: center;
    }
  }
`;
