import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Trash2,
  Video,
} from 'lucide-react';
import api from '../../api/axios';

function emptySlide() {
  return {
    slot_position: 1,
    media_type: 'image',
    image_url: '',
    video_url: '',
    poster_url: '',
    eyebrow_text: '',
    title: '',
    subtitle: '',
    promo_text: '',
    cta_label: 'Shop Now',
    cta_url: '',
    secondary_cta_label: '',
    secondary_cta_url: '',
    theme_key: '',
    background_color: '',
    text_color: '',
    sort_order: 1,
    status: 'active',
  };
}

function defaultSettings() {
  return {
    minimum_budget: 200,
    minimum_daily_cap: 20,
    cost_per_view: 0.05,
    cost_per_click: 1,
    ad_insert_position: 5,
    max_active_ads: 1,
    allow_image: true,
    allow_video: true,
    video_autoplay: true,
    approval_required: true,
    status: 'active',
  };
}

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function AdminBannerHomeSlidesPage() {
  const [slides, setSlides] = useState([]);
  const [settings, setSettings] = useState(defaultSettings());
  const [selectedSlideId, setSelectedSlideId] = useState('');
  const [slideForm, setSlideForm] = useState(emptySlide());

  const [loading, setLoading] = useState(true);
  const [savingSlide, setSavingSlide] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedSlide = useMemo(
    () => slides.find((item) => String(item.id) === String(selectedSlideId)) || null,
    [slides, selectedSlideId]
  );

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError('');

      const [settingsRes, slidesRes] = await Promise.all([
        api.get('/api/admin/banner-home-ads/settings'),
        api.get('/api/admin/banner-home-ads/slides'),
      ]);

      setSettings(settingsRes?.data?.settings || defaultSettings());

      const list = Array.isArray(slidesRes?.data?.slides) ? slidesRes.data.slides : [];
      setSlides(list);

      if (!selectedSlideId && list.length) {
        loadSlide(list[0]);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load homepage slider settings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const loadSlide = (slide) => {
    setSelectedSlideId(String(slide.id));
    setSlideForm({
      slot_position: slide.slot_position || 1,
      media_type: slide.media_type || 'image',
      image_url: slide.image_url || '',
      video_url: slide.video_url || '',
      poster_url: slide.poster_url || '',
      eyebrow_text: slide.eyebrow_text || '',
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      promo_text: slide.promo_text || '',
      cta_label: slide.cta_label || 'Shop Now',
      cta_url: slide.cta_url || '',
      secondary_cta_label: slide.secondary_cta_label || '',
      secondary_cta_url: slide.secondary_cta_url || '',
      theme_key: slide.theme_key || '',
      background_color: slide.background_color || '',
      text_color: slide.text_color || '',
      sort_order: slide.sort_order || slide.slot_position || 1,
      status: slide.status || 'active',
    });
    setError('');
    setSuccess('');
  };

  const resetNewSlide = () => {
    const usedSlots = new Set(slides.map((item) => Number(item.slot_position)));
    const nextSlot = [1, 2, 3, 4].find((slot) => !usedSlots.has(slot)) || 1;

    setSelectedSlideId('');
    setSlideForm({
      ...emptySlide(),
      slot_position: nextSlot,
      sort_order: nextSlot,
    });
    setError('');
    setSuccess('');
  };

  const handleSettingsChange = (event) => {
    const { name, value, type, checked } = event.target;

    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSlideChange = (event) => {
    const { name, value } = event.target;

    setSlideForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveSettings = async () => {
    try {
      setSavingSettings(true);
      setError('');
      setSuccess('');

      const payload = {
        ...settings,
        minimum_budget: Number(settings.minimum_budget || 200),
        minimum_daily_cap: Number(settings.minimum_daily_cap || 20),
        cost_per_view: Number(settings.cost_per_view || 0),
        cost_per_click: Number(settings.cost_per_click || 0),
        ad_insert_position: Number(settings.ad_insert_position || 5),
        max_active_ads: Number(settings.max_active_ads || 1),
      };

      const { data } = await api.put('/api/admin/banner-home-ads/settings', payload);

      setSettings(data?.settings || settings);
      setSuccess(data?.message || 'Homepage slider settings saved successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const validateSlide = () => {
    if (!slideForm.title.trim()) throw new Error('Slide title is required');
    if (!slideForm.cta_label.trim()) throw new Error('CTA label is required');
    if (!slideForm.cta_url.trim()) throw new Error('CTA URL is required');

    if (slideForm.media_type === 'image' && !slideForm.image_url.trim()) {
      throw new Error('Image URL is required for image slide');
    }

    if (slideForm.media_type === 'video' && !slideForm.video_url.trim()) {
      throw new Error('Video URL is required for video slide');
    }
  };

  const saveSlide = async (event) => {
    event.preventDefault();

    try {
      setSavingSlide(true);
      setError('');
      setSuccess('');

      validateSlide();

      const payload = {
        ...slideForm,
        slot_position: Number(slideForm.slot_position || 1),
        sort_order: Number(slideForm.sort_order || slideForm.slot_position || 1),
      };

      let response;

      if (selectedSlideId) {
        response = await api.put(`/api/admin/banner-home-ads/slides/${selectedSlideId}`, payload);
      } else {
        response = await api.post('/api/admin/banner-home-ads/slides', payload);
      }

      const saved = response?.data?.slide;

      const slidesRes = await api.get('/api/admin/banner-home-ads/slides');
      const list = Array.isArray(slidesRes?.data?.slides) ? slidesRes.data.slides : [];

      setSlides(list);

      if (saved?.id) {
        const fresh = list.find((item) => String(item.id) === String(saved.id));
        if (fresh) loadSlide(fresh);
      }

      setSuccess(response?.data?.message || 'Homepage slide saved successfully');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save homepage slide');
    } finally {
      setSavingSlide(false);
    }
  };

  const deleteSlide = async () => {
    if (!selectedSlideId) return;

    try {
      setSavingSlide(true);
      setError('');
      setSuccess('');

      const { data } = await api.delete(`/api/admin/banner-home-ads/slides/${selectedSlideId}`);

      const slidesRes = await api.get('/api/admin/banner-home-ads/slides');
      const list = Array.isArray(slidesRes?.data?.slides) ? slidesRes.data.slides : [];

      setSlides(list);

      if (list.length) loadSlide(list[0]);
      else resetNewSlide();

      setSuccess(data?.message || 'Homepage slide deleted successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete homepage slide');
    } finally {
      setSavingSlide(false);
    }
  };

  const previewImage =
    slideForm.media_type === 'video'
      ? slideForm.poster_url || slideForm.image_url
      : slideForm.image_url || slideForm.poster_url;

  if (loading) {
    return (
      <div className="bhs-page">
        <style>{styles}</style>
        <div className="bhs-loading">Loading homepage slider...</div>
      </div>
    );
  }

  return (
    <div className="bhs-page">
      <style>{styles}</style>

      <section className="bhs-hero">
        <div>
          <span className="bhs-badge">Admin Homepage Slider</span>
          <h1>Homepage Slider Control</h1>
          <p>
            Manage the 4 default homepage slides and control where paid slider ads appear in the public homepage
            slider.
          </p>
        </div>

        <div className="bhs-hero-actions">
          <button type="button" className="bhs-btn secondary" onClick={() => fetchData(true)}>
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            Refresh
          </button>

          <button type="button" className="bhs-btn primary" onClick={resetNewSlide}>
            <Plus size={16} />
            New Slide
          </button>
        </div>
      </section>

      {error ? (
        <div className="bhs-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      {success ? (
        <div className="bhs-alert success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      ) : null}

      <section className="bhs-settings-grid">
        <div className="bhs-panel">
          <div className="bhs-panel-head">
            <p>Slider ad settings</p>
            <h2>Ad Pricing & Position</h2>
          </div>

          <div className="bhs-settings-form">
            <label>
              <span>Minimum Budget</span>
              <input
                type="number"
                step="0.01"
                name="minimum_budget"
                value={settings.minimum_budget}
                onChange={handleSettingsChange}
              />
            </label>

            <label>
              <span>Minimum Daily Cap</span>
              <input
                type="number"
                step="0.01"
                name="minimum_daily_cap"
                value={settings.minimum_daily_cap}
                onChange={handleSettingsChange}
              />
            </label>

            <label>
              <span>Cost Per View</span>
              <input
                type="number"
                step="0.0001"
                name="cost_per_view"
                value={settings.cost_per_view}
                onChange={handleSettingsChange}
              />
            </label>

            <label>
              <span>Cost Per Click</span>
              <input
                type="number"
                step="0.0001"
                name="cost_per_click"
                value={settings.cost_per_click}
                onChange={handleSettingsChange}
              />
            </label>

            <label>
              <span>Ad Insert Position</span>
              <select
                name="ad_insert_position"
                value={settings.ad_insert_position}
                onChange={handleSettingsChange}
              >
                <option value="1">Position 1 — before all admin slides</option>
                <option value="2">Position 2 — after slide 1</option>
                <option value="3">Position 3 — after slide 2</option>
                <option value="4">Position 4 — after slide 3</option>
                <option value="5">Position 5 — after all 4 admin slides</option>
              </select>
            </label>

            <label>
              <span>Max Active Ads</span>
              <input
                type="number"
                min="1"
                max="10"
                name="max_active_ads"
                value={settings.max_active_ads}
                onChange={handleSettingsChange}
              />
            </label>

            <div className="bhs-toggle-grid">
              <label>
                <input
                  type="checkbox"
                  name="allow_image"
                  checked={!!settings.allow_image}
                  onChange={handleSettingsChange}
                />
                Allow image ads
              </label>

              <label>
                <input
                  type="checkbox"
                  name="allow_video"
                  checked={!!settings.allow_video}
                  onChange={handleSettingsChange}
                />
                Allow video ads
              </label>

              <label>
                <input
                  type="checkbox"
                  name="video_autoplay"
                  checked={!!settings.video_autoplay}
                  onChange={handleSettingsChange}
                />
                Video autoplay
              </label>

              <label>
                <input
                  type="checkbox"
                  name="approval_required"
                  checked={!!settings.approval_required}
                  onChange={handleSettingsChange}
                />
                Approval required
              </label>
            </div>

            <button type="button" className="bhs-btn primary" onClick={saveSettings} disabled={savingSettings}>
              <Settings size={16} />
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        <div className="bhs-panel">
          <div className="bhs-panel-head">
            <p>Current pricing</p>
            <h2>Live Rules</h2>
          </div>

          <div className="bhs-rule-grid">
            <div>
              <span>Minimum Budget</span>
              <strong>{money(settings.minimum_budget)}</strong>
            </div>
            <div>
              <span>Daily Cap</span>
              <strong>{money(settings.minimum_daily_cap)}</strong>
            </div>
            <div>
              <span>View Cost</span>
              <strong>{money(settings.cost_per_view)}</strong>
            </div>
            <div>
              <span>Click Cost</span>
              <strong>{money(settings.cost_per_click)}</strong>
            </div>
            <div>
              <span>Ad Position</span>
              <strong>Slot {settings.ad_insert_position}</strong>
            </div>
            <div>
              <span>Admin Slides</span>
              <strong>{slides.length}/4</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="bhs-layout">
        <aside className="bhs-panel bhs-admin-slide-list-panel">
          <div className="bhs-panel-head">
            <p>Default slides</p>
            <h2>Admin Slides</h2>
          </div>

          {slides.length ? (
            <div className="bhs-slide-list">
              {slides.map((slide) => (
                <button
                  key={slide.id}
                  type="button"
                  className={`bhs-slide-card${String(selectedSlideId) === String(slide.id) ? ' active' : ''}`}
                  onClick={() => loadSlide(slide)}
                >
                  <div>
                    <strong>Slot {slide.slot_position}</strong>
                    <span>{slide.title}</span>
                  </div>
                  <em>{slide.status}</em>
                </button>
              ))}
            </div>
          ) : (
            <div className="bhs-empty">No admin slides created yet.</div>
          )}
        </aside>

        <main className="bhs-panel">
          <div className="bhs-panel-head">
            <p>Slide editor</p>
            <h2>{selectedSlideId ? 'Edit Admin Slide' : 'Create Admin Slide'}</h2>
          </div>

          <form className="bhs-form" onSubmit={saveSlide}>
            <div className="bhs-form-grid">
              <label>
                <span>Slot Position</span>
                <select name="slot_position" value={slideForm.slot_position} onChange={handleSlideChange}>
                  <option value="1">Slot 1</option>
                  <option value="2">Slot 2</option>
                  <option value="3">Slot 3</option>
                  <option value="4">Slot 4</option>
                </select>
              </label>

              <label>
                <span>Status</span>
                <select name="status" value={slideForm.status} onChange={handleSlideChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>

              <label>
                <span>Media Type</span>
                <select name="media_type" value={slideForm.media_type} onChange={handleSlideChange}>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </label>

              <label>
                <span>Sort Order</span>
                <input
                  type="number"
                  name="sort_order"
                  value={slideForm.sort_order}
                  onChange={handleSlideChange}
                />
              </label>

              <label>
                <span>Eyebrow Text</span>
                <input
                  name="eyebrow_text"
                  value={slideForm.eyebrow_text}
                  onChange={handleSlideChange}
                  placeholder="Discover curated products"
                />
              </label>

              <label>
                <span>Promo Text</span>
                <input
                  name="promo_text"
                  value={slideForm.promo_text}
                  onChange={handleSlideChange}
                  placeholder="$3620"
                />
              </label>

              <label className="full">
                <span>Title</span>
                <input
                  name="title"
                  value={slideForm.title}
                  onChange={handleSlideChange}
                  placeholder="Homepage slider title"
                />
              </label>

              <label className="full">
                <span>Subtitle</span>
                <textarea
                  name="subtitle"
                  value={slideForm.subtitle}
                  onChange={handleSlideChange}
                  rows={3}
                  placeholder="Short slider subtitle"
                />
              </label>

              {slideForm.media_type === 'image' ? (
                <label className="full">
                  <span>
                    <ImageIcon size={15} /> Image URL
                  </span>
                  <input
                    name="image_url"
                    value={slideForm.image_url}
                    onChange={handleSlideChange}
                    placeholder="https://..."
                  />
                </label>
              ) : (
                <>
                  <label className="full">
                    <span>
                      <Video size={15} /> Video URL
                    </span>
                    <input
                      name="video_url"
                      value={slideForm.video_url}
                      onChange={handleSlideChange}
                      placeholder="https://..."
                    />
                  </label>

                  <label className="full">
                    <span>Poster Image URL</span>
                    <input
                      name="poster_url"
                      value={slideForm.poster_url}
                      onChange={handleSlideChange}
                      placeholder="https://..."
                    />
                  </label>
                </>
              )}

              <label>
                <span>CTA Label</span>
                <input
                  name="cta_label"
                  value={slideForm.cta_label}
                  onChange={handleSlideChange}
                  placeholder="Shop Now"
                />
              </label>

              <label>
                <span>CTA URL</span>
                <input
                  name="cta_url"
                  value={slideForm.cta_url}
                  onChange={handleSlideChange}
                  placeholder="https://..."
                />
              </label>

              <label>
                <span>Secondary CTA Label</span>
                <input
                  name="secondary_cta_label"
                  value={slideForm.secondary_cta_label}
                  onChange={handleSlideChange}
                  placeholder="Learn More"
                />
              </label>

              <label>
                <span>Secondary CTA URL</span>
                <input
                  name="secondary_cta_url"
                  value={slideForm.secondary_cta_url}
                  onChange={handleSlideChange}
                  placeholder="https://..."
                />
              </label>
            </div>

            <div className="bhs-action-row">
              <button type="submit" className="bhs-btn primary" disabled={savingSlide}>
                <Save size={16} />
                {savingSlide ? 'Saving...' : 'Save Slide'}
              </button>

              {selectedSlideId ? (
                <button type="button" className="bhs-btn danger" onClick={deleteSlide} disabled={savingSlide}>
                  <Trash2 size={16} />
                  Delete
                </button>
              ) : null}
            </div>
          </form>
        </main>
      </section>

      <section className="bhs-panel bhs-preview-footer-panel">
        <div className="bhs-panel-head">
          <p>Full Preview</p>
          <h2>Homepage Slider Banner Preview</h2>
        </div>

        <div className="bhs-footer-preview">
          <div className="bhs-footer-preview-copy">
            <span>{slideForm.eyebrow_text || 'Homepage Slide'}</span>

            <h3>{slideForm.title || 'Your homepage slide title'}</h3>

            <p>{slideForm.subtitle || 'Your subtitle will appear here.'}</p>

            <div className="bhs-footer-preview-actions">
              <a href={slideForm.cta_url || '#'}>{slideForm.cta_label || 'Shop Now'}</a>

              {slideForm.secondary_cta_label ? (
                <a href={slideForm.secondary_cta_url || '#'}>{slideForm.secondary_cta_label}</a>
              ) : null}

              {slideForm.promo_text ? <strong>{slideForm.promo_text}</strong> : null}
            </div>
          </div>

          <div className="bhs-footer-preview-media">
            <div className="bhs-footer-preview-dot dot-one" />
            <div className="bhs-footer-preview-dot dot-two" />
            <div className="bhs-footer-preview-dot dot-three" />

            {slideForm.media_type === 'video' ? (
              previewImage ? (
                <img src={previewImage} alt="Poster preview" />
              ) : (
                <div className="bhs-preview-empty-media">
                  <Video size={42} />
                  <span>Video Preview</span>
                </div>
              )
            ) : previewImage ? (
              <img src={previewImage} alt="Slide preview" />
            ) : (
              <div className="bhs-preview-empty-media">
                <ImageIcon size={42} />
                <span>Image Preview</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = `
  .bhs-page {
    display: grid;
    gap: 18px;
  }

  .bhs-loading,
  .bhs-empty {
    background: #f8fafc !important;
    border: 1px dashed #94a3b8 !important;
    border-radius: 22px;
    padding: 24px;
    text-align: center;
    color: #111827 !important;
    font-size: 14px;
    font-weight: 950;
    line-height: 1.5;
    opacity: 1 !important;
    filter: none !important;
    text-shadow: none !important;
  }

  .spin {
    animation: bhsSpin 0.8s linear infinite;
  }

  @keyframes bhsSpin {
    to { transform: rotate(360deg); }
  }

  .bhs-hero {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    align-items: flex-start;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.05);
  }

  .bhs-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    border-radius: 999px;
    background: #fff7ed !important;
    color: #9a3412 !important;
    border: 1px solid #fed7aa;
    padding: 9px 14px;
    font-size: 12px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 12px;
    box-shadow: 0 10px 24px rgba(154, 52, 18, 0.08);
    opacity: 1 !important;
    filter: none !important;
  }

  .bhs-hero h1 {
    margin: 0;
    color: #111827;
    font-size: 30px;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .bhs-hero p {
    margin: 10px 0 0;
    color: #64748b;
    max-width: 760px;
    line-height: 1.7;
  }

  .bhs-hero-actions,
  .bhs-action-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .bhs-btn {
    min-height: 44px;
    border-radius: 14px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    color: #111827;
    font-size: 14px;
    font-weight: 850;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 15px;
    cursor: pointer;
    text-decoration: none;
  }

  .bhs-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .bhs-btn.secondary {
    background: #ffffff;
    color: #111827;
  }

  .bhs-btn.danger {
    background: #fff1f2;
    color: #be123c;
    border-color: #fecdd3;
  }

  .bhs-alert {
    display: flex;
    align-items: center;
    gap: 10px;
    border-radius: 16px;
    padding: 14px 16px;
    font-weight: 750;
  }

  .bhs-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .bhs-alert.success {
    background: #ecfdf3;
    border: 1px solid #abefc6;
    color: #027a48;
  }

  .bhs-settings-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.6fr);
    gap: 18px;
  }

  .bhs-layout {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
    gap: 18px;
    align-items: start;
  }

  .bhs-panel {
    background: #ffffff !important;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 20px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
    opacity: 1 !important;
    filter: none !important;
  }

  .bhs-panel,
  .bhs-panel * {
    text-shadow: none !important;
  }

  .bhs-panel p,
  .bhs-panel span,
  .bhs-panel label,
  .bhs-panel input,
  .bhs-panel select,
  .bhs-panel textarea {
    color: #111827;
    opacity: 1 !important;
    filter: none !important;
  }

  .bhs-panel input::placeholder,
  .bhs-panel textarea::placeholder {
    color: #64748b;
    opacity: 1;
  }

  .bhs-panel-head {
    margin-bottom: 16px;
  }

  .bhs-panel-head p {
    margin: 0 0 6px;
    color: #475569 !important;
    font-size: 12px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 1 !important;
  }

  .bhs-panel-head h2 {
    margin: 0;
    font-size: 22px;
    color: #111827 !important;
    font-weight: 950;
    opacity: 1 !important;
  }

  .bhs-settings-form,
  .bhs-form {
    display: grid;
    gap: 16px;
  }

  .bhs-settings-form {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .bhs-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .bhs-settings-form label,
  .bhs-form label {
    display: grid;
    gap: 8px;
  }

  .bhs-settings-form label span,
  .bhs-form label span {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: #111827;
    font-size: 13px;
    font-weight: 900;
  }

  .bhs-form label.full {
    grid-column: span 2;
  }

  .bhs-settings-form input,
  .bhs-settings-form select,
  .bhs-form input,
  .bhs-form select,
  .bhs-form textarea {
    width: 100%;
    min-height: 46px;
    border-radius: 14px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    color: #111827;
    padding: 0 13px;
    outline: none;
    font-weight: 750;
  }

  .bhs-form textarea {
    padding: 13px;
    resize: vertical;
  }

  .bhs-toggle-grid {
    grid-column: span 3;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .bhs-toggle-grid label {
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 14px;
    padding: 12px;
    display: flex;
    gap: 8px;
    align-items: center;
    color: #111827;
    font-weight: 900;
  }

  .bhs-rule-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .bhs-rule-grid div {
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 16px;
    padding: 14px;
    display: grid;
    gap: 6px;
  }

  .bhs-rule-grid span {
    color: #475569;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .bhs-rule-grid strong {
    color: #111827;
    font-size: 19px;
    font-weight: 950;
  }

  .bhs-admin-slide-list-panel {
    background: #ffffff !important;
    opacity: 1 !important;
    filter: none !important;
  }

  .bhs-slide-list {
    display: grid;
    gap: 10px;
  }

  .bhs-slide-card {
    width: 100%;
    border: 1px solid #e5e7eb;
    background: #f8fafc;
    border-radius: 16px;
    padding: 14px;
    text-align: left;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }

  .bhs-slide-card.active {
    background: #ffffff;
    border-color: #111827;
    box-shadow: inset 0 0 0 1px #111827;
  }

  .bhs-slide-card div {
    display: grid;
    gap: 6px;
  }

  .bhs-slide-card strong {
    color: #111827 !important;
    font-weight: 950;
    opacity: 1 !important;
  }

  .bhs-slide-card span {
    color: #334155 !important;
    font-size: 13px;
    line-height: 1.35;
    font-weight: 800;
    opacity: 1 !important;
  }

  .bhs-slide-card em {
    font-style: normal;
    color: #027a48 !important;
    font-size: 12px;
    font-weight: 950;
    text-transform: capitalize;
    opacity: 1 !important;
  }

  .bhs-preview-footer-panel {
    margin-top: 2px;
  }

  .bhs-footer-preview {
    position: relative;
    overflow: hidden;
    min-height: 430px;
    border-radius: 28px;
    display: grid;
    grid-template-columns: 37% 63%;
    align-items: center;
    background:
      radial-gradient(circle at top left, rgba(255, 255, 255, 0.2), transparent 28%),
      linear-gradient(135deg, #e0b894 0%, #ddb38c 38%, #dcb28b 100%);
  }

  .bhs-footer-preview::before {
    content: "";
    position: absolute;
    left: -90px;
    top: 60px;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    background:
      radial-gradient(circle, rgba(255, 255, 255, 0.12) 0, rgba(255, 255, 255, 0.12) 22%, transparent 23%),
      radial-gradient(circle, rgba(255, 255, 255, 0.08) 0, rgba(255, 255, 255, 0.08) 38%, transparent 39%),
      radial-gradient(circle, rgba(111, 78, 55, 0.05) 0, rgba(111, 78, 55, 0.05) 54%, transparent 55%);
    pointer-events: none;
    z-index: 1;
  }

  .bhs-footer-preview-copy {
    position: relative;
    z-index: 5;
    padding: 46px 26px 46px 58px;
    display: grid;
    align-content: center;
    gap: 16px;
  }

  .bhs-footer-preview-copy > span {
    display: inline-flex;
    width: fit-content;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.42);
    border: 1px solid rgba(255, 255, 255, 0.55);
    color: #2d2521;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .bhs-footer-preview-copy h3 {
    margin: 0;
    color: #2d2521;
    font-size: clamp(36px, 4.8vw, 72px);
    line-height: 0.96;
    font-weight: 950;
    letter-spacing: -0.06em;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.18);
  }

  .bhs-footer-preview-copy p {
    margin: 0;
    max-width: 520px;
    color: rgba(45, 37, 33, 0.92);
    line-height: 1.7;
    font-size: 16px;
    font-weight: 850;
  }

  .bhs-footer-preview-actions {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    margin-top: 8px;
  }

  .bhs-footer-preview-actions a {
    min-height: 50px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    padding: 0 22px;
    font-size: 13px;
    font-weight: 950;
    text-decoration: none;
    background: #ffffff;
    color: #111827;
  }

  .bhs-footer-preview-actions a:nth-child(2) {
    border: 1px solid rgba(17, 24, 39, 0.2);
    background: rgba(255, 255, 255, 0.46);
    color: #2d2521;
  }

  .bhs-footer-preview-actions strong {
    color: #2d2521;
    font-size: 34px;
    font-weight: 950;
  }

  .bhs-footer-preview-media {
    position: relative;
    z-index: 2;
    min-height: 430px;
    display: grid;
    place-items: center;
    padding: 34px 46px 34px 0;
  }

  .bhs-footer-preview-media img,
  .bhs-preview-empty-media {
    position: relative;
    z-index: 4;
    width: min(880px, 94%);
    height: 330px;
    border-radius: 46px;
    object-fit: cover;
    background: rgba(255, 255, 255, 0.16);
    border: 1px solid rgba(255, 255, 255, 0.26);
    box-shadow: 0 30px 80px rgba(15, 23, 42, 0.22);
  }

  .bhs-preview-empty-media {
    display: grid;
    place-items: center;
    color: rgba(45, 37, 33, 0.9);
    font-weight: 950;
  }

  .bhs-footer-preview-dot {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 5;
    background: rgba(70, 51, 38, 0.14);
  }

  .bhs-footer-preview-dot.dot-one {
    top: 48px;
    right: 150px;
    width: 76px;
    height: 76px;
  }

  .bhs-footer-preview-dot.dot-two {
    right: 56px;
    top: 90px;
    width: 42px;
    height: 42px;
  }

  .bhs-footer-preview-dot.dot-three {
    right: 90px;
    bottom: 76px;
    width: 110px;
    height: 110px;
    background: rgba(255, 255, 255, 0.08);
  }

  @media (max-width: 1280px) {
    .bhs-settings-grid,
    .bhs-layout {
      grid-template-columns: 1fr;
    }

    .bhs-settings-form {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .bhs-toggle-grid {
      grid-column: span 2;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .bhs-footer-preview {
      grid-template-columns: 1fr;
    }

    .bhs-footer-preview-copy {
      padding: 34px 28px 12px;
    }

    .bhs-footer-preview-media {
      min-height: 320px;
      padding: 18px 28px 34px;
    }

    .bhs-footer-preview-media img,
    .bhs-preview-empty-media {
      width: 100%;
      height: 300px;
      border-radius: 34px;
    }
  }

  @media (max-width: 720px) {
    .bhs-hero,
    .bhs-hero-actions,
    .bhs-action-row {
      flex-direction: column;
      align-items: stretch;
    }

    .bhs-settings-form,
    .bhs-form-grid,
    .bhs-rule-grid,
    .bhs-toggle-grid {
      grid-template-columns: 1fr;
    }

    .bhs-toggle-grid,
    .bhs-form label.full {
      grid-column: span 1;
    }

    .bhs-btn {
      width: 100%;
    }

    .bhs-footer-preview-copy h3 {
      font-size: 38px;
    }
  }
`;