import { useEffect, useMemo, useState } from 'react';
import {
  Image as ImageIcon,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Save,
  FileImage,
  FolderOpen,
  Type,
  Boxes,
} from 'lucide-react';
import api from '../../api/axios';

function emptyMedia() {
  return {
    website_id: '',
    file_name: '',
    file_path: '',
    file_type: '',
    mime_type: '',
    file_size: '',
    alt_text: '',
    title: '',
    source_type: 'general',
  };
}

function getSourceLabel(value = '') {
  const map = {
    general: 'General',
    logo: 'Logo',
    banner: 'Banner',
    slider: 'Slider',
    product: 'Product',
    post: 'Post',
    template: 'Template',
  };

  return map[String(value).toLowerCase()] || value || '-';
}

export default function AffiliateMediaLibraryPage() {
  const [media, setMedia] = useState([]);
  const [selectedMediaId, setSelectedMediaId] = useState('');
  const [form, setForm] = useState(emptyMedia());

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMedia = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await api.get('/api/affiliate/media');
      const mediaList = data?.media || [];
      setMedia(mediaList);

      if (!selectedMediaId && mediaList.length) {
        loadMediaIntoForm(mediaList[0]);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load media library');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const loadMediaIntoForm = (item) => {
    setSelectedMediaId(String(item.id));
    setForm({
      website_id: item.website_id || '',
      file_name: item.file_name || '',
      file_path: item.file_path || '',
      file_type: item.file_type || '',
      mime_type: item.mime_type || '',
      file_size: item.file_size ?? '',
      alt_text: item.alt_text || '',
      title: item.title || '',
      source_type: item.source_type || 'general',
    });
    setError('');
    setSuccess('');
  };

  const resetForNew = () => {
    setSelectedMediaId('');
    setForm(emptyMedia());
    setError('');
    setSuccess('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const refreshMedia = async (targetId = null) => {
    const { data } = await api.get('/api/affiliate/media');
    const list = data?.media || [];
    setMedia(list);

    const found = list.find((item) => String(item.id) === String(targetId || selectedMediaId));
    if (found) {
      loadMediaIntoForm(found);
    } else if (!list.length) {
      resetForNew();
    }
  };

  const validateForm = () => {
    if (!form.file_name.trim()) {
      throw new Error('File name is required');
    }

    if (!form.file_path.trim()) {
      throw new Error('File path is required');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      validateForm();

      const payload = {
        website_id: form.website_id || null,
        file_name: form.file_name,
        file_path: form.file_path,
        file_type: form.file_type,
        mime_type: form.mime_type,
        file_size: form.file_size,
        alt_text: form.alt_text,
        title: form.title,
        source_type: form.source_type,
      };

      let response;

      if (selectedMediaId) {
        response = await api.put(`/api/affiliate/media/${selectedMediaId}`, payload);
      } else {
        response = await api.post('/api/affiliate/media', payload);
      }

      const savedMedia = response?.data?.media;
      if (savedMedia?.id) {
        await refreshMedia(savedMedia.id);
      }

      setSuccess(response?.data?.message || 'Media saved successfully');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save media');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMediaId) return;

    setDeleting(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.delete(`/api/affiliate/media/${selectedMediaId}`);
      await refreshMedia();
      setSuccess(data?.message || 'Media deleted successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete media');
    } finally {
      setDeleting(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: media.length,
      images: media.filter((item) =>
        String(item.mime_type || item.file_type || '').toLowerCase().includes('image')
      ).length,
      source: getSourceLabel(form.source_type),
    };
  }, [media, form.source_type]);

  if (loading) {
    return (
      <div className="affiliate-media-page">
        <style>{styles}</style>

        <div className="affiliate-media-loading-wrap">
          <div className="affiliate-media-loading-card">
            <div className="affiliate-media-spinner" />
            <p>Loading media library...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-media-page">
      <style>{styles}</style>

      <section className="affiliate-media-hero">
        <div className="affiliate-media-hero-copy">
          <div className="affiliate-media-badge">Media manager</div>
          <h1 className="affiliate-media-title">Media Library</h1>
          <p className="affiliate-media-subtitle">
            Manage product, post, slider, banner, logo, and general media records from one place.
          </p>
        </div>

        <div className="affiliate-media-hero-actions">
          <button
            className="affiliate-media-btn secondary"
            type="button"
            onClick={() => fetchMedia(true)}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <button className="affiliate-media-btn primary" type="button" onClick={resetForNew}>
            <Plus size={16} />
            New Media
          </button>
        </div>
      </section>

      <section className="affiliate-media-stats">
        <div className="affiliate-media-stat-card">
          <span>Total Media</span>
          <strong>{stats.total}</strong>
        </div>

        <div className="affiliate-media-stat-card">
          <span>Images</span>
          <strong>{stats.images}</strong>
        </div>

        <div className="affiliate-media-stat-card">
          <span>Current Source</span>
          <strong>{stats.source}</strong>
        </div>
      </section>

      <section className="affiliate-media-grid">
        <div className="affiliate-media-panel">
          <div className="affiliate-media-panel-head">
            <div>
              <p className="affiliate-media-panel-kicker">Media items</p>
              <h2 className="affiliate-media-panel-title">Library List</h2>
            </div>
          </div>

          {media.length ? (
            <div className="affiliate-media-list">
              {media.map((item) => {
                const active = String(selectedMediaId) === String(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`affiliate-media-list-card${active ? ' active' : ''}`}
                    onClick={() => loadMediaIntoForm(item)}
                  >
                    <div className="affiliate-media-list-preview">
                      {item.file_path ? (
                        <img
                          src={item.file_path}
                          alt={item.alt_text || item.file_name}
                          className="affiliate-media-thumb"
                        />
                      ) : (
                        <div className="affiliate-media-thumb-empty">
                          <ImageIcon size={18} />
                        </div>
                      )}
                    </div>

                    <div className="affiliate-media-list-main">
                      <h3>{item.file_name}</h3>
                      <p>{getSourceLabel(item.source_type)}</p>
                      <small>{item.file_type || item.mime_type || '-'}</small>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="affiliate-media-empty-small">
              <FolderOpen size={24} />
              <p>No media yet.</p>
            </div>
          )}
        </div>

        <div className="affiliate-media-side-stack">
          <div className="affiliate-media-panel">
            <div className="affiliate-media-panel-head">
              <div>
                <p className="affiliate-media-panel-kicker">Editor</p>
                <h2 className="affiliate-media-panel-title">
                  {selectedMediaId ? 'Edit Media' : 'Create Media'}
                </h2>
              </div>
            </div>

            <form className="affiliate-media-form" onSubmit={handleSubmit}>
              <div className="affiliate-media-form-grid">
                <label className="affiliate-media-field">
                  <span className="affiliate-media-label">
                    <Type size={16} />
                    File name
                  </span>
                  <input
                    className="affiliate-media-input"
                    name="file_name"
                    placeholder="File name"
                    value={form.file_name}
                    onChange={handleChange}
                  />
                </label>

                <label className="affiliate-media-field affiliate-media-field-full">
                  <span className="affiliate-media-label">
                    <ImageIcon size={16} />
                    File path / URL
                  </span>
                  <input
                    className="affiliate-media-input"
                    name="file_path"
                    placeholder="File path / URL"
                    value={form.file_path}
                    onChange={handleChange}
                  />
                </label>

                <label className="affiliate-media-field">
                  <span className="affiliate-media-label">
                    <FileImage size={16} />
                    File type
                  </span>
                  <input
                    className="affiliate-media-input"
                    name="file_type"
                    placeholder="File type"
                    value={form.file_type}
                    onChange={handleChange}
                  />
                </label>

                <label className="affiliate-media-field">
                  <span className="affiliate-media-label">
                    <FileImage size={16} />
                    MIME type
                  </span>
                  <input
                    className="affiliate-media-input"
                    name="mime_type"
                    placeholder="MIME type"
                    value={form.mime_type}
                    onChange={handleChange}
                  />
                </label>

                <label className="affiliate-media-field">
                  <span className="affiliate-media-label">
                    <Boxes size={16} />
                    File size
                  </span>
                  <input
                    className="affiliate-media-input"
                    name="file_size"
                    type="number"
                    placeholder="File size"
                    value={form.file_size}
                    onChange={handleChange}
                  />
                </label>

                <label className="affiliate-media-field">
                  <span className="affiliate-media-label">
                    <FolderOpen size={16} />
                    Source type
                  </span>
                  <select
                    className="affiliate-media-input"
                    name="source_type"
                    value={form.source_type}
                    onChange={handleChange}
                  >
                    <option value="general">General</option>
                    <option value="logo">Logo</option>
                    <option value="banner">Banner</option>
                    <option value="slider">Slider</option>
                    <option value="product">Product</option>
                    <option value="post">Post</option>
                    <option value="template">Template</option>
                  </select>
                </label>

                <label className="affiliate-media-field">
                  <span className="affiliate-media-label">
                    <Type size={16} />
                    Title
                  </span>
                  <input
                    className="affiliate-media-input"
                    name="title"
                    placeholder="Title"
                    value={form.title}
                    onChange={handleChange}
                  />
                </label>

                <label className="affiliate-media-field">
                  <span className="affiliate-media-label">
                    <Type size={16} />
                    Alt text
                  </span>
                  <input
                    className="affiliate-media-input"
                    name="alt_text"
                    placeholder="Alt text"
                    value={form.alt_text}
                    onChange={handleChange}
                  />
                </label>
              </div>

              {error ? (
                <div className="affiliate-media-alert error">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              ) : null}

              {success ? (
                <div className="affiliate-media-alert success">
                  <CheckCircle2 size={18} />
                  <span>{success}</span>
                </div>
              ) : null}

              <div className="affiliate-media-actions">
                <button className="affiliate-media-btn primary" type="submit" disabled={saving}>
                  <Save size={16} />
                  {saving ? 'Saving...' : selectedMediaId ? 'Update Media' : 'Create Media'}
                </button>

                {selectedMediaId ? (
                  <button
                    className="affiliate-media-btn secondary"
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    <Trash2 size={16} />
                    {deleting ? 'Deleting...' : 'Delete Media'}
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <div className="affiliate-media-panel">
            <div className="affiliate-media-panel-head">
              <div>
                <p className="affiliate-media-panel-kicker">Preview</p>
                <h2 className="affiliate-media-panel-title">Media Summary</h2>
              </div>
            </div>

            <div className="affiliate-media-preview-card">
              {form.file_path ? (
                <img
                  src={form.file_path}
                  alt={form.alt_text || form.file_name || 'Media preview'}
                  className="affiliate-media-preview-image"
                />
              ) : (
                <div className="affiliate-media-preview-placeholder">
                  <ImageIcon size={26} />
                  <span>No preview</span>
                </div>
              )}

              <div className="affiliate-media-summary-list">
                <div className="affiliate-media-summary-row">
                  <span>File name</span>
                  <strong>{form.file_name || '-'}</strong>
                </div>

                <div className="affiliate-media-summary-row">
                  <span>Source</span>
                  <strong>{getSourceLabel(form.source_type)}</strong>
                </div>

                <div className="affiliate-media-summary-row">
                  <span>Type</span>
                  <strong>{form.file_type || '-'}</strong>
                </div>

                <div className="affiliate-media-summary-row">
                  <span>MIME</span>
                  <strong>{form.mime_type || '-'}</strong>
                </div>

                <div className="affiliate-media-summary-row">
                  <span>Size</span>
                  <strong>{form.file_size || '-'}</strong>
                </div>

                <div className="affiliate-media-summary-row">
                  <span>Title</span>
                  <strong>{form.title || '-'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .affiliate-media-page {
    width: 100%;
  }

  .affiliate-media-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-media-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-media-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliateMediaSpin 0.8s linear infinite;
  }

  @keyframes affiliateMediaSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: affiliateMediaSpin 0.8s linear infinite;
  }

  .affiliate-media-hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.05);
    margin-bottom: 20px;
  }

  .affiliate-media-badge {
    display: inline-flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 999px;
    background: #111827;
    color: #ffffff;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .affiliate-media-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-media-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-media-hero-actions,
  .affiliate-media-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-media-btn {
    height: 46px;
    padding: 0 16px;
    border-radius: 14px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    color: #111827;
    font-size: 14px;
    font-weight: 800;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .affiliate-media-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-media-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .affiliate-media-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .affiliate-media-stat-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 22px;
    padding: 18px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-media-stat-card span {
    color: #6b7280;
    font-size: 13px;
    font-weight: 700;
  }

  .affiliate-media-stat-card strong {
    color: #111827;
    font-size: 26px;
    font-weight: 900;
    text-transform: capitalize;
  }

  .affiliate-media-grid {
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.25fr);
    gap: 20px;
  }

  .affiliate-media-side-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .affiliate-media-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-media-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .affiliate-media-panel-kicker {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .affiliate-media-panel-title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-media-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-media-list-card {
    width: 100%;
    padding: 14px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    cursor: pointer;
    text-align: left;
    transition: 0.2s ease;
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .affiliate-media-list-card.active {
    border-color: #111827;
    background: #ffffff;
    box-shadow: inset 0 0 0 1px #111827;
  }

  .affiliate-media-list-preview {
    width: 60px;
    height: 60px;
    border-radius: 14px;
    overflow: hidden;
    flex-shrink: 0;
    background: #ffffff;
    border: 1px solid #e5e7eb;
  }

  .affiliate-media-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .affiliate-media-thumb-empty {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    color: #6b7280;
  }

  .affiliate-media-list-main h3 {
    margin: 0 0 5px;
    font-size: 15px;
    font-weight: 900;
    color: #111827;
    word-break: break-word;
  }

  .affiliate-media-list-main p,
  .affiliate-media-list-main small {
    display: block;
    margin: 0;
    color: #6b7280;
    line-height: 1.5;
  }

  .affiliate-media-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .affiliate-media-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .affiliate-media-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-media-field-full {
    grid-column: span 2;
  }

  .affiliate-media-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 800;
    color: #111827;
  }

  .affiliate-media-input {
    width: 100%;
    min-height: 50px;
    border-radius: 16px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    padding: 0 14px;
    font-size: 14px;
    color: #111827;
    outline: none;
    transition: 0.2s ease;
  }

  .affiliate-media-input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.06);
  }

  .affiliate-media-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
  }

  .affiliate-media-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-media-alert.success {
    background: #ecfdf3;
    border: 1px solid #abefc6;
    color: #027a48;
  }

  .affiliate-media-preview-card {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .affiliate-media-preview-image,
  .affiliate-media-preview-placeholder {
    width: 100%;
    height: 220px;
    border-radius: 18px;
    border: 1px solid #edf2f7;
    background: #f8fafc;
  }

  .affiliate-media-preview-image {
    object-fit: cover;
    display: block;
  }

  .affiliate-media-preview-placeholder {
    display: grid;
    place-items: center;
    color: #6b7280;
    gap: 8px;
    text-align: center;
  }

  .affiliate-media-summary-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-media-summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 16px;
  }

  .affiliate-media-summary-row span {
    color: #6b7280;
    font-weight: 700;
    font-size: 13px;
  }

  .affiliate-media-summary-row strong {
    color: #111827;
    font-weight: 900;
    text-align: right;
    word-break: break-word;
  }

  .affiliate-media-empty-small {
    min-height: 180px;
    border: 1px dashed #dbe2ea;
    background: #f8fafc;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
    padding: 22px;
  }

  .affiliate-media-empty-small p {
    margin: 0;
    color: #111827;
    font-weight: 800;
  }

  @media (max-width: 1100px) {
    .affiliate-media-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 991px) {
    .affiliate-media-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-media-title {
      font-size: 26px;
    }

    .affiliate-media-stats {
      grid-template-columns: 1fr;
    }

    .affiliate-media-panel {
      padding: 18px;
    }
  }

  @media (max-width: 767px) {
    .affiliate-media-title {
      font-size: 22px;
    }

    .affiliate-media-subtitle {
      font-size: 14px;
    }

    .affiliate-media-hero-actions,
    .affiliate-media-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-media-form-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-media-field-full {
      grid-column: span 1;
    }

    .affiliate-media-btn {
      width: 100%;
    }

    .affiliate-media-list-card,
    .affiliate-media-summary-row {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;