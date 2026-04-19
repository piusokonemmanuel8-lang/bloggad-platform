import { useEffect, useState } from 'react';
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

export default function AffiliateMediaLibraryPage() {
  const [media, setMedia] = useState([]);
  const [selectedMediaId, setSelectedMediaId] = useState('');
  const [form, setForm] = useState(emptyMedia());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/affiliate/media');
        const mediaList = data?.media || [];
        setMedia(mediaList);

        if (mediaList.length) {
          loadMediaIntoForm(mediaList[0]);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load media library');
      } finally {
        setLoading(false);
      }
    };

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

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading media library...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">Media Library</h1>
          <p className="page-subtitle">
            Manage product, post, slider, banner, logo, and general media records.
          </p>
        </div>

        <div className="grid-2">
          <div className="surface-card surface-card-padding">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <h2 className="section-title" style={{ margin: 0 }}>
                Media Items
              </h2>

              <button className="btn btn-primary" type="button" onClick={resetForNew}>
                New Media
              </button>
            </div>

            <div className="form-stack">
              {media.length ? (
                media.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="surface-card surface-card-padding"
                    onClick={() => loadMediaIntoForm(item)}
                    style={{
                      textAlign: 'left',
                      cursor: 'pointer',
                      border:
                        String(selectedMediaId) === String(item.id)
                          ? '1px solid rgba(122, 92, 255, 0.9)'
                          : '1px solid rgba(255,255,255,0.08)',
                      background:
                        String(selectedMediaId) === String(item.id)
                          ? 'rgba(122, 92, 255, 0.12)'
                          : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{item.file_name}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Source: {item.source_type}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Type: {item.file_type || '-'}
                    </div>
                  </button>
                ))
              ) : (
                <div>No media yet.</div>
              )}
            </div>
          </div>

          <div className="surface-card surface-card-padding">
            <h2 className="section-title">
              {selectedMediaId ? 'Edit Media' : 'Create Media'}
            </h2>

            <form className="form-stack" onSubmit={handleSubmit}>
              <input
                className="input-control"
                name="file_name"
                placeholder="File name"
                value={form.file_name}
                onChange={handleChange}
              />

              <input
                className="input-control"
                name="file_path"
                placeholder="File path / URL"
                value={form.file_path}
                onChange={handleChange}
              />

              <div className="grid-2">
                <input
                  className="input-control"
                  name="file_type"
                  placeholder="File type"
                  value={form.file_type}
                  onChange={handleChange}
                />
                <input
                  className="input-control"
                  name="mime_type"
                  placeholder="MIME type"
                  value={form.mime_type}
                  onChange={handleChange}
                />
              </div>

              <div className="grid-2">
                <input
                  className="input-control"
                  name="file_size"
                  type="number"
                  placeholder="File size"
                  value={form.file_size}
                  onChange={handleChange}
                />
                <select
                  className="input-control"
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
              </div>

              <input
                className="input-control"
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleChange}
              />

              <input
                className="input-control"
                name="alt_text"
                placeholder="Alt text"
                value={form.alt_text}
                onChange={handleChange}
              />

              {error ? (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: 'rgba(255, 80, 80, 0.12)',
                    border: '1px solid rgba(255, 80, 80, 0.22)',
                  }}
                >
                  {error}
                </div>
              ) : null}

              {success ? (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: 'rgba(80, 200, 120, 0.12)',
                    border: '1px solid rgba(80, 200, 120, 0.22)',
                  }}
                >
                  {success}
                </div>
              ) : null}

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : selectedMediaId ? 'Update Media' : 'Create Media'}
                </button>

                {selectedMediaId ? (
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Delete Media'}
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}