import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExternalLink, FilePlus2, Pencil, Send, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import './WriterSalesLandingPagesPage.css';

const blankForm = {
  title: '',
  slug: '',
  template_id: '',
  headline: '',
  subheadline: '',
  body: '',
  video_url: '',
  image_url: '',
  cta_text: '',
  cta_url: '',
  urgency_text: '',
  badge_text: '',
  highlight_text: '',
  vxl_sections: [],
  seo_title: '',
  seo_description: '',
};

function readContent(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function publicUrl(slug) {
  return `/sales/${encodeURIComponent(slug || '')}`;
}

export default function WriterSalesLandingPagesPage() {
  const [pages, setPages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [entitlement, setEntitlement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [step, setStep] = useState('list');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankForm);

  const load = useCallback(async () => {
    const [{ data: pageData }, { data: templateData }] = await Promise.all([
      api.get('/api/writer/sales-landing'),
      api.get('/api/writer/sales-landing/templates'),
    ]);
    setPages(Array.isArray(pageData?.pages) ? pageData.pages : []);
    setEntitlement(pageData?.entitlement || null);
    setTemplates(Array.isArray(templateData?.templates) ? templateData.templates : []);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    load()
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || err.message || 'Failed to load Sales Landing Pages.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [load]);

  const canCreate = useMemo(() => {
    if (!entitlement?.enabled) return false;
    if (entitlement.limit === null || entitlement.limit === undefined) return true;
    return pages.length < Number(entitlement.limit || 0);
  }, [entitlement, pages.length]);

  function resetMessages() {
    setError('');
    setNotice('');
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startCreate() {
    if (!canCreate) return;
    resetMessages();
    setEditingId(null);
    setForm(blankForm);
    setStep('templates');
  }

  function chooseTemplate(template) {
    setForm((current) => ({ ...current, template_id: String(template?.id || '') }));
    setStep('editor');
  }

  async function editPage(page) {
    resetMessages();
    try {
      setBusy(`edit-${page.id}`);
      const { data } = await api.get(`/api/writer/sales-landing/${page.id}`);
      const row = data?.page || page;
      const content = readContent(row.content_json);
      setEditingId(row.id);
      setForm({
        title: row.title || '',
        slug: row.slug || '',
        template_id: row.template_id ? String(row.template_id) : '',
        headline: content.headline || '',
        subheadline: content.subheadline || '',
        body: content.body || '',
        video_url: content.video_url || '',
        image_url: content.image_url || '',
        cta_text: content.cta_text || '',
        cta_url: content.cta_url || '',
        urgency_text: content.urgency_text || '',
        badge_text: content.badge_text || '',
        highlight_text: content.highlight_text || '',
        vxl_sections: Array.isArray(content.vxl_sections) ? content.vxl_sections : [],
        seo_title: row.seo_title || '',
        seo_description: row.seo_description || '',
      });
      setStep('editor');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to open this landing page.');
    } finally {
      setBusy('');
    }
  }

  async function uploadVxlImage(file, onUrl) {
    if (!file) return;
    const data = new FormData();
    data.append('image', file);
    try {
      setBusy('image-upload');
      setError('');
      const response = await api.post('/api/uploads/template-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = response?.data?.url || response?.data?.path || response?.data?.fileUrl || '';
      if (!url) throw new Error('Upload completed without an image URL.');
      onUrl(url);
      setNotice('Image uploaded.');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to upload image.');
    } finally {
      setBusy('');
    }
  }
  function addVxlSection(type = 'text') {
    const section = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      type,
      enabled: true,
      columns: type === 'two-column' ? 2 : 1,
      title: '',
      text: '',
      text_color: '#ffffff',
      image_url: '',
      image_url_2: '',
      footer_text: '',
      testimonials: type === 'testimonials' ? [{ name: '', photo_url: '', review: '' }] : []
    };
    setForm((current) => ({ ...current, vxl_sections: [...(current.vxl_sections || []), section] }));
  }

  function updateVxlSection(index, field, value) {
    setForm((current) => ({
      ...current,
      vxl_sections: (current.vxl_sections || []).map((section, i) => i === index ? { ...section, [field]: value } : section)
    }));
  }

  function removeVxlSection(index) {
    setForm((current) => ({ ...current, vxl_sections: (current.vxl_sections || []).filter((_, i) => i !== index) }));
  }

  function moveVxlSection(index, direction) {
    setForm((current) => {
      const next = [...(current.vxl_sections || [])];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...current, vxl_sections: next };
    });
  }

  function addTestimonial(sectionIndex) {
    setForm((current) => ({
      ...current,
      vxl_sections: (current.vxl_sections || []).map((section, i) => i === sectionIndex
        ? { ...section, testimonials: [...(section.testimonials || []), { name: '', photo_url: '', review: '' }] }
        : section)
    }));
  }

  function updateTestimonial(sectionIndex, reviewIndex, field, value) {
    setForm((current) => ({
      ...current,
      vxl_sections: (current.vxl_sections || []).map((section, i) => i === sectionIndex
        ? { ...section, testimonials: (section.testimonials || []).map((review, r) => r === reviewIndex ? { ...review, [field]: value } : review) }
        : section)
    }));
  }

  function removeTestimonial(sectionIndex, reviewIndex) {
    setForm((current) => ({
      ...current,
      vxl_sections: (current.vxl_sections || []).map((section, i) => i === sectionIndex
        ? { ...section, testimonials: (section.testimonials || []).filter((_, r) => r !== reviewIndex) }
        : section)
    }));
  }
  async function save(event) {
    event.preventDefault();
    resetMessages();
    if (!form.title.trim()) {
      setError('Landing page title is required.');
      return;
    }
    try {
      setBusy('save');
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        template_id: form.template_id ? Number(form.template_id) : null,
        seo_title: form.seo_title.trim(),
        seo_description: form.seo_description.trim(),
        content_json: {
          headline: form.headline.trim(),
          subheadline: form.subheadline.trim(),
          body: form.body.trim(),
          video_url: form.video_url.trim(),
          image_url: form.image_url.trim(),
          cta_text: form.cta_text.trim(),
          cta_url: form.cta_url.trim(),
          urgency_text: form.urgency_text.trim(),
          badge_text: form.badge_text.trim(),
          highlight_text: form.highlight_text.trim(),
          vxl_sections: form.vxl_sections || [],
        },
      };
      const { data } = editingId
        ? await api.put(`/api/writer/sales-landing/${editingId}`, payload)
        : await api.post('/api/writer/sales-landing', payload);
      setNotice(data?.message || 'Sales Landing Page saved.');
      await load();
      setStep('list');
      setEditingId(null);
      setForm(blankForm);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to save this landing page.');
    } finally {
      setBusy('');
    }
  }

  async function setPublished(page, publish) {
    resetMessages();
    try {
      setBusy(`${publish ? 'publish' : 'unpublish'}-${page.id}`);
      const endpoint = publish ? 'publish' : 'unpublish';
      const { data } = await api.put(`/api/writer/sales-landing/${page.id}/${endpoint}`);
      setNotice(data?.message || (publish ? 'Sales Landing Page published.' : 'Sales Landing Page returned to draft.'));
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to update publication status.');
    } finally {
      setBusy('');
    }
  }

  async function remove(page) {
    if (!window.confirm('Delete this Sales Landing Page?')) return;
    resetMessages();
    try {
      setBusy(`delete-${page.id}`);
      const { data } = await api.delete(`/api/writer/sales-landing/${page.id}`);
      setNotice(data?.message || 'Sales Landing Page deleted.');
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to delete this landing page.');
    } finally {
      setBusy('');
    }
  }

  if (loading) {
    return <div className="sales-landing-admin"><div className="sales-landing-loading">Loading Sales Landing Pages...</div></div>;
  }

  return (
    <div className="sales-landing-admin">
      {step !== 'list' ? (
        <div className="sales-landing-editor-nav">
          <button className="sales-landing-secondary" type="button" onClick={() => setStep('list')} disabled={!!busy}>
            Back to My Landing Pages
          </button>
        </div>
      ) : null}
      {error ? <div className="sales-landing-alert error">{error}</div> : null}
      {notice ? <div className="sales-landing-alert success">{notice}</div> : null}

      {step === 'list' ? (
        <section>

          {!pages.length ? (
            <div className="sales-landing-empty">
              <h3>No landing pages yet</h3>
              <p>Create your first landing page, choose a template and customize the content.</p>
              <button type="button" onClick={startCreate} disabled={!canCreate}>Create Landing Page</button>
            </div>
          ) : (
            <div className="sales-landing-grid">
              {pages.map((page) => (
                <article className="sales-landing-card" key={page.id}>
                  <div className="sales-landing-card-top">
                    <span className={`sales-landing-status ${page.status}`}>{page.status}</span>
                    <span>{page.template_name || 'Custom template'}</span>
                  </div>
                  <h3>{page.title}</h3>
                  <p className="sales-landing-slug">/sales/{page.slug}</p>
                  <div className="sales-landing-actions">
                    <button type="button" onClick={() => editPage(page)} disabled={!!busy}><Pencil size={15} /> Edit</button>
                    {page.status === 'published' ? (
                      <>
                        <button type="button" onClick={() => window.open(publicUrl(page.slug), '_blank', 'noopener,noreferrer')}>
                          <ExternalLink size={15} /> View
                        </button>
                        <button type="button" onClick={() => setPublished(page, false)} disabled={!!busy}>Draft</button>
                      </>
                    ) : (
                      <button type="button" onClick={() => setPublished(page, true)} disabled={!!busy}><Send size={15} /> Publish</button>
                    )}
                    <button className="danger" type="button" onClick={() => remove(page)} disabled={!!busy}><Trash2 size={15} /> Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {step === 'templates' ? (
        <section>
          <div className="sales-landing-section-title">
            <div><h3>Choose a Template</h3><p>Templates added later will appear here automatically.</p></div>
          </div>
          {!templates.length ? (
            <div className="sales-landing-empty">
              <h3>No templates have been added yet</h3>
              <p>The landing page system is ready. Continue with a blank page now; final templates can be added later.</p>
              <button type="button" onClick={() => chooseTemplate(null)}>Use Blank Page</button>
            </div>
          ) : (
            <div className="sales-landing-grid">
              <button className="sales-landing-template blank" type="button" onClick={() => chooseTemplate(null)}>
                <strong>Blank Page</strong><span>Start without a preset template.</span>
              </button>
              {templates.map((template) => (
                <button className="sales-landing-template" type="button" key={template.id} onClick={() => chooseTemplate(template)}>
                  {template.preview_image ? <img src={template.preview_image} alt="" /> : <div className="sales-landing-template-preview">Template Preview</div>}
                  <strong>{template.name}</strong>
                  <span>{template.description || 'Sales landing page template'}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {step === 'editor' ? (
        <form className="sales-landing-editor" onSubmit={save}>
          <div className="sales-landing-section-title">
            <div><h3>{editingId ? 'Edit Landing Page' : 'Create Landing Page'}</h3><p>Build the content shown on the public sales page.</p></div>
          </div>
          <div className="sales-landing-form-grid">
            <label>Page title<input value={form.title} onChange={(e) => update('title', e.target.value)} required /></label>
            <label>URL slug<input value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="generated-from-title" /></label>
            <label className="wide">Urgency bar text<input value={form.urgency_text} onChange={(e) => update('urgency_text', e.target.value)} /></label>
            <label>Badge text<input value={form.badge_text} onChange={(e) => update('badge_text', e.target.value)} /></label>
            <label>Highlighted headline text<input value={form.highlight_text} onChange={(e) => update('highlight_text', e.target.value)} /></label>            <label className="wide">Headline<input value={form.headline} onChange={(e) => update('headline', e.target.value)} /></label>
            <label className="wide">Subheadline<textarea rows="2" value={form.subheadline} onChange={(e) => update('subheadline', e.target.value)} /></label>
            <label className="wide">Body content<textarea rows="8" value={form.body} onChange={(e) => update('body', e.target.value)} /></label>
            <label>Image URL<input value={form.image_url} onChange={(e) => update('image_url', e.target.value)} placeholder="https://..." /></label>
            <label>Upload image from device<input type="file" accept="image/*" disabled={busy === 'image-upload'} onChange={(e) => { const file = e.target.files?.[0]; uploadVxlImage(file, (url) => update('image_url', url)); e.target.value = ''; }} /></label>
            <label className="wide">Video URL (required)<input value={form.video_url} onChange={(e) => update('video_url', e.target.value)} placeholder="Paste a YouTube or direct video URL" required /></label>
            <label className="wide">Upload video from device<input type="file" accept="video/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setError('Video file upload storage is not connected yet. Paste a YouTube or hosted video URL for now.');
              e.target.value = '';
            }} /></label>
            <label>Button text<input value={form.cta_text} onChange={(e) => update('cta_text', e.target.value)} placeholder="Buy now" /></label>
            <label>Button URL<input value={form.cta_url} onChange={(e) => update('cta_url', e.target.value)} placeholder="https://..." /></label>
            <section className="vxl-builder wide">
              <div className="vxl-builder-head">
                <div><h4>Optional page sections</h4><p>Add only the sections this campaign needs. Reorder, disable or remove them at any time.</p></div>
                <select defaultValue="" onChange={(e) => { if (e.target.value) addVxlSection(e.target.value); e.target.value = ''; }}>
                  <option value="">+ Add section</option>
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="text-image">Text + Image</option>
                  <option value="two-column">Two Columns</option>
                  <option value="testimonials">Testimonials / Reviews</option>
                  <option value="footer">Footer</option>
                </select>
              </div>
              {(form.vxl_sections || []).map((section, index) => (
                <div className="vxl-section-editor" key={section.id || index}>
                  <div className="vxl-section-toolbar">
                    <strong>{String(section.type || 'section').replace('-', ' ').toUpperCase()}</strong>
                    <label><input type="checkbox" checked={section.enabled !== false} onChange={(e) => updateVxlSection(index, 'enabled', e.target.checked)} /> Enabled</label>
                    <button type="button" onClick={() => moveVxlSection(index, -1)}>Up</button>
                    <button type="button" onClick={() => moveVxlSection(index, 1)}>Down</button>
                    <button type="button" onClick={() => removeVxlSection(index)}>Remove</button>
                  </div>
                  {section.type !== 'image' && section.type !== 'testimonials' && (
                    <>
                      <label>Section title<input value={section.title || ''} onChange={(e) => updateVxlSection(index, 'title', e.target.value)} /></label>
                      <label>Text color<input type="color" value={section.text_color || '#ffffff'} onChange={(e) => updateVxlSection(index, 'text_color', e.target.value)} /></label>
                    </>
                  )}
                  {['text','text-image','two-column'].includes(section.type) && <label className="wide">Text<textarea rows="4" value={section.text || ''} onChange={(e) => updateVxlSection(index, 'text', e.target.value)} /></label>}
                  {['image','text-image','two-column'].includes(section.type) && <>
                    <label className="wide">Image URL<input value={section.image_url || ''} onChange={(e) => updateVxlSection(index, 'image_url', e.target.value)} placeholder="https://..." /></label>
                    <label className="wide">Upload image from device<input type="file" accept="image/*" disabled={busy === 'image-upload'} onChange={(e) => { const file = e.target.files?.[0]; uploadVxlImage(file, (url) => updateVxlSection(index, 'image_url', url)); e.target.value = ''; }} /></label>
                  </>}
                  {section.type === 'two-column' && <>
                    <label className="wide">Second image URL<input value={section.image_url_2 || ''} onChange={(e) => updateVxlSection(index, 'image_url_2', e.target.value)} placeholder="Optional second-column image" /></label>
                    <label className="wide">Upload second image<input type="file" accept="image/*" disabled={busy === 'image-upload'} onChange={(e) => { const file = e.target.files?.[0]; uploadVxlImage(file, (url) => updateVxlSection(index, 'image_url_2', url)); e.target.value = ''; }} /></label>
                  </>}
                  <div className="vxl-padding-control">
                    <span>Padding top</span>
                    <div className="vxl-padding-stepper">
                      <button type="button" onClick={() => updateVxlSection(index, 'padding_top', Math.max(0, Number(section.padding_top ?? 48) - 8))}>-</button>
                      <strong>{section.padding_top ?? 48}px</strong>
                      <button type="button" onClick={() => updateVxlSection(index, 'padding_top', Math.min(160, Number(section.padding_top ?? 48) + 8))}>+</button>
                    </div>
                  </div>
                  <div className="vxl-padding-control">
                    <span>Padding bottom</span>
                    <div className="vxl-padding-stepper">
                      <button type="button" onClick={() => updateVxlSection(index, 'padding_bottom', Math.max(0, Number(section.padding_bottom ?? 48) - 8))}>-</button>
                      <strong>{section.padding_bottom ?? 48}px</strong>
                      <button type="button" onClick={() => updateVxlSection(index, 'padding_bottom', Math.min(160, Number(section.padding_bottom ?? 48) + 8))}>+</button>
                    </div>
                  </div>
                  <div className="vxl-padding-control">
                    <span>Padding left</span>
                    <div className="vxl-padding-stepper">
                      <button type="button" onClick={() => updateVxlSection(index, 'padding_left', Math.max(0, Number(section.padding_left ?? 0) - 8))}>-</button>
                      <strong>{section.padding_left ?? 0}px</strong>
                      <button type="button" onClick={() => updateVxlSection(index, 'padding_left', Math.min(160, Number(section.padding_left ?? 0) + 8))}>+</button>
                    </div>
                  </div>
                  <div className="vxl-padding-control">
                    <span>Padding right</span>
                    <div className="vxl-padding-stepper">
                      <button type="button" onClick={() => updateVxlSection(index, 'padding_right', Math.max(0, Number(section.padding_right ?? 0) - 8))}>-</button>
                      <strong>{section.padding_right ?? 0}px</strong>
                      <button type="button" onClick={() => updateVxlSection(index, 'padding_right', Math.min(160, Number(section.padding_right ?? 0) + 8))}>+</button>
                    </div>
                  </div>
                  {section.type === 'footer' && <label className="wide">Footer text<textarea rows="3" value={section.footer_text || ''} onChange={(e) => updateVxlSection(index, 'footer_text', e.target.value)} /></label>}
                  {section.type === 'testimonials' && (
                    <div className="wide">
                      <label>Review columns
                        <select value={section.review_columns || 4} onChange={(e) => updateVxlSection(index, 'review_columns', Number(e.target.value))}>
                          <option value={2}>2 columns</option>
                          <option value={3}>3 columns</option>
                          <option value={4}>4 columns</option>
                        </select>
                      </label>
                      {(section.testimonials || []).map((review, reviewIndex) => (
                        <div className="vxl-review-editor" key={reviewIndex}>
                          <label>Reviewer name<input value={review.name || ''} onChange={(e) => updateTestimonial(index, reviewIndex, 'name', e.target.value)} /></label>
                          <label>Reviewer photo URL<input value={review.photo_url || ''} onChange={(e) => updateTestimonial(index, reviewIndex, 'photo_url', e.target.value)} /></label>
                          <label>Upload reviewer photo<input type="file" accept="image/*" disabled={busy === 'image-upload'} onChange={(e) => { const file = e.target.files?.[0]; uploadVxlImage(file, (url) => updateTestimonial(index, reviewIndex, 'photo_url', url)); e.target.value = ''; }} /></label>
                          <label className="wide">Review<textarea rows="3" value={review.review || ''} onChange={(e) => updateTestimonial(index, reviewIndex, 'review', e.target.value)} /></label>
                          <label className="wide">Reviewer video URL<input value={review.video_url || ''} onChange={(e) => updateTestimonial(index, reviewIndex, 'video_url', e.target.value)} placeholder="YouTube or hosted video URL" /></label>
                          <label className="wide">Upload reviewer video<input type="file" accept="video/*" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; setError('Device video storage is not connected yet. Use a YouTube or hosted video URL for now.'); e.target.value = ''; }} /></label>
                          <button type="button" onClick={() => removeTestimonial(index, reviewIndex)}>Remove reviewer</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addTestimonial(index)}>+ Add reviewer</button>
                    </div>
                  )}
                </div>
              ))}
            </section>            <label>SEO title<input value={form.seo_title} onChange={(e) => update('seo_title', e.target.value)} /></label>
            <label>SEO description<input value={form.seo_description} onChange={(e) => update('seo_description', e.target.value)} /></label>
          </div>
          <div className="sales-landing-editor-actions">
            <button className="sales-landing-primary" type="submit" disabled={!!busy}>{busy === 'save' ? 'Saving...' : 'Save Landing Page'}</button>
            <button className="sales-landing-secondary" type="button" onClick={() => setStep('list')} disabled={!!busy}>Cancel</button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
