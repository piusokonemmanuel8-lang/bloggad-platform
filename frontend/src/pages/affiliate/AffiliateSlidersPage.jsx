import { useEffect, useMemo, useState } from 'react';
import {
  Image as ImageIcon,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Link as LinkIcon,
  FileText,
  Package,
  ToggleLeft,
  ToggleRight,
  Pencil,
  LayoutTemplate,
} from 'lucide-react';
import api from '../../api/axios';
import validateSupgadUrl from '../../utils/validateSupgadUrl';

function emptySlider() {
  return {
    image: '',
    title: '',
    subtitle: '',
    link_type: 'internal_post',
    linked_post_id: '',
    linked_product_id: '',
    external_url: '',
    sort_order: 0,
    status: 'active',
  };
}

function getStatusClass(status = '') {
  const value = String(status).toLowerCase();

  if (value === 'active') return 'affiliate-sliders-status active';
  if (value === 'inactive') return 'affiliate-sliders-status inactive';

  return 'affiliate-sliders-status neutral';
}

function getLinkTypeLabel(value = '') {
  if (value === 'internal_post') return 'Internal Post';
  if (value === 'product') return 'Product';
  if (value === 'external_url') return 'External URL';
  return value || '-';
}

export default function AffiliateSlidersPage() {
  const [sliders, setSliders] = useState([]);
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSliderId, setSelectedSliderId] = useState('');
  const [form, setForm] = useState(emptySlider());

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [slidersRes, postsRes, productsRes] = await Promise.all([
        api.get('/api/affiliate/sliders'),
        api.get('/api/affiliate/posts'),
        api.get('/api/affiliate/products'),
      ]);

      const sliderList = slidersRes?.data?.sliders || [];
      setSliders(sliderList);
      setPosts(postsRes?.data?.posts || []);
      setProducts(productsRes?.data?.products || []);

      if (!selectedSliderId && sliderList.length) {
        loadSliderIntoForm(sliderList[0]);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load sliders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const loadSliderIntoForm = (slider) => {
    setSelectedSliderId(String(slider.id));
    setForm({
      image: slider.image || '',
      title: slider.title || '',
      subtitle: slider.subtitle || '',
      link_type: slider.link_type || 'internal_post',
      linked_post_id: slider.linked_post_id || '',
      linked_product_id: slider.linked_product_id || '',
      external_url: slider.external_url || '',
      sort_order: slider.sort_order ?? 0,
      status: slider.status || 'active',
    });
    setError('');
    setSuccess('');
  };

  const resetForNew = () => {
    setSelectedSliderId('');
    setForm(emptySlider());
    setError('');
    setSuccess('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (name === 'link_type') {
        if (value === 'internal_post') {
          next.linked_product_id = '';
          next.external_url = '';
        }
        if (value === 'product') {
          next.linked_post_id = '';
          next.external_url = '';
        }
        if (value === 'external_url') {
          next.linked_post_id = '';
          next.linked_product_id = '';
        }
      }

      return next;
    });
  };

  const refreshSliders = async (targetId = null) => {
    const { data } = await api.get('/api/affiliate/sliders');
    const list = data?.sliders || [];
    setSliders(list);

    const found = list.find((item) => String(item.id) === String(targetId || selectedSliderId));

    if (found) {
      loadSliderIntoForm(found);
    } else if (!list.length) {
      resetForNew();
    }
  };

  const validateForm = () => {
    if (!form.image.trim()) {
      throw new Error('Slider image is required');
    }

    if (form.link_type === 'internal_post' && !form.linked_post_id) {
      throw new Error('Select a linked post');
    }

    if (form.link_type === 'product' && !form.linked_product_id) {
      throw new Error('Select a linked product');
    }

    if (form.link_type === 'external_url') {
      const result = validateSupgadUrl(form.external_url, {
        required: true,
        allowEmpty: false,
        fieldName: 'Slider external URL',
      });

      if (!result.ok) {
        throw new Error(result.message);
      }
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
        image: form.image,
        title: form.title,
        subtitle: form.subtitle,
        link_type: form.link_type,
        linked_post_id: form.link_type === 'internal_post' ? Number(form.linked_post_id) : null,
        linked_product_id: form.link_type === 'product' ? Number(form.linked_product_id) : null,
        external_url: form.link_type === 'external_url' ? form.external_url : null,
        sort_order: Number(form.sort_order || 0),
        status: form.status,
      };

      let response;

      if (selectedSliderId) {
        response = await api.put(`/api/affiliate/sliders/${selectedSliderId}`, payload);
      } else {
        response = await api.post('/api/affiliate/sliders', payload);
      }

      const savedSlider = response?.data?.slider;

      if (savedSlider?.id) {
        await refreshSliders(savedSlider.id);
      }

      setSuccess(response?.data?.message || 'Slider saved successfully');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save slider');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!selectedSliderId) return;

    setStatusSaving(true);
    setError('');
    setSuccess('');

    try {
      const nextStatus = form.status === 'active' ? 'inactive' : 'active';

      const { data } = await api.put(`/api/affiliate/sliders/${selectedSliderId}/status`, {
        status: nextStatus,
      });

      await refreshSliders(selectedSliderId);
      setSuccess(data?.message || 'Slider status updated successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update slider status');
    } finally {
      setStatusSaving(false);
    }
  };

  const selectedPostTitle = useMemo(() => {
    const found = posts.find((item) => String(item.id) === String(form.linked_post_id));
    return found?.title || '-';
  }, [posts, form.linked_post_id]);

  const selectedProductTitle = useMemo(() => {
    const found = products.find((item) => String(item.id) === String(form.linked_product_id));
    return found?.title || '-';
  }, [products, form.linked_product_id]);

  if (loading) {
    return (
      <div className="affiliate-sliders-page">
        <style>{styles}</style>

        <div className="affiliate-sliders-loading-wrap">
          <div className="affiliate-sliders-loading-card">
            <div className="affiliate-sliders-spinner" />
            <p>Loading sliders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-sliders-page">
      <style>{styles}</style>

      <section className="affiliate-sliders-hero">
        <div className="affiliate-sliders-hero-copy">
          <div className="affiliate-sliders-badge">Homepage sliders</div>
          <h1 className="affiliate-sliders-title">Sliders</h1>
          <p className="affiliate-sliders-subtitle">
            Create homepage sliders and link them to posts, products, or approved Supgad URLs.
          </p>
        </div>

        <div className="affiliate-sliders-hero-actions">
          <button
            type="button"
            className="affiliate-sliders-btn secondary"
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <button className="affiliate-sliders-btn primary" type="button" onClick={resetForNew}>
            <Plus size={16} />
            New Slider
          </button>
        </div>
      </section>

      <section className="affiliate-sliders-grid">
        <div className="affiliate-sliders-panel">
          <div className="affiliate-sliders-panel-head">
            <div>
              <p className="affiliate-sliders-panel-kicker">Slider list</p>
              <h2 className="affiliate-sliders-panel-title">Existing Sliders</h2>
            </div>
          </div>

          {sliders.length ? (
            <div className="affiliate-sliders-list">
              {sliders.map((slider) => {
                const active = String(selectedSliderId) === String(slider.id);

                return (
                  <button
                    key={slider.id}
                    type="button"
                    className={`affiliate-sliders-list-card${active ? ' active' : ''}`}
                    onClick={() => loadSliderIntoForm(slider)}
                  >
                    <div className="affiliate-sliders-list-card-top">
                      <div>
                        <h3>{slider.title || 'Untitled Slider'}</h3>
                        <p>{getLinkTypeLabel(slider.link_type)}</p>
                      </div>

                      <span className={getStatusClass(slider.status)}>
                        {slider.status || '-'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="affiliate-sliders-empty-small">
              <LayoutTemplate size={24} />
              <p>No sliders yet.</p>
            </div>
          )}
        </div>

        <div className="affiliate-sliders-side-stack">
          <div className="affiliate-sliders-panel">
            <div className="affiliate-sliders-panel-head">
              <div>
                <p className="affiliate-sliders-panel-kicker">Editor</p>
                <h2 className="affiliate-sliders-panel-title">
                  {selectedSliderId ? 'Edit Slider' : 'Create Slider'}
                </h2>
              </div>
            </div>

            <form className="affiliate-sliders-form" onSubmit={handleSubmit}>
              <div className="affiliate-sliders-form-grid">
                <label className="affiliate-sliders-field affiliate-sliders-field-full">
                  <span className="affiliate-sliders-label">
                    <ImageIcon size={16} />
                    Slider image URL
                  </span>
                  <input
                    className="affiliate-sliders-input"
                    name="image"
                    placeholder="Slider image URL"
                    value={form.image}
                    onChange={handleChange}
                  />
                </label>

                <label className="affiliate-sliders-field">
                  <span className="affiliate-sliders-label">
                    <Pencil size={16} />
                    Slider title
                  </span>
                  <input
                    className="affiliate-sliders-input"
                    name="title"
                    placeholder="Slider title"
                    value={form.title}
                    onChange={handleChange}
                  />
                </label>

                <label className="affiliate-sliders-field">
                  <span className="affiliate-sliders-label">
                    <Pencil size={16} />
                    Slider subtitle
                  </span>
                  <input
                    className="affiliate-sliders-input"
                    name="subtitle"
                    placeholder="Slider subtitle"
                    value={form.subtitle}
                    onChange={handleChange}
                  />
                </label>

                <label className="affiliate-sliders-field">
                  <span className="affiliate-sliders-label">
                    <LinkIcon size={16} />
                    Link type
                  </span>
                  <select
                    className="affiliate-sliders-input"
                    name="link_type"
                    value={form.link_type}
                    onChange={handleChange}
                  >
                    <option value="internal_post">Internal Post</option>
                    <option value="product">Product</option>
                    <option value="external_url">External URL</option>
                  </select>
                </label>

                {form.link_type === 'internal_post' ? (
                  <label className="affiliate-sliders-field">
                    <span className="affiliate-sliders-label">
                      <FileText size={16} />
                      Linked post
                    </span>
                    <select
                      className="affiliate-sliders-input"
                      name="linked_post_id"
                      value={form.linked_post_id}
                      onChange={handleChange}
                    >
                      <option value="">Select post</option>
                      {posts.map((post) => (
                        <option key={post.id} value={post.id}>
                          {post.title}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                {form.link_type === 'product' ? (
                  <label className="affiliate-sliders-field">
                    <span className="affiliate-sliders-label">
                      <Package size={16} />
                      Linked product
                    </span>
                    <select
                      className="affiliate-sliders-input"
                      name="linked_product_id"
                      value={form.linked_product_id}
                      onChange={handleChange}
                    >
                      <option value="">Select product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.title}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                {form.link_type === 'external_url' ? (
                  <label className="affiliate-sliders-field affiliate-sliders-field-full">
                    <span className="affiliate-sliders-label">
                      <LinkIcon size={16} />
                      External URL
                    </span>
                    <input
                      className="affiliate-sliders-input"
                      name="external_url"
                      placeholder="External URL (must be supgad.com)"
                      value={form.external_url}
                      onChange={handleChange}
                    />
                    <small className="affiliate-sliders-help">
                      Only supgad.com links are allowed.
                    </small>
                  </label>
                ) : null}

                <label className="affiliate-sliders-field">
                  <span className="affiliate-sliders-label">Sort order</span>
                  <input
                    className="affiliate-sliders-input"
                    type="number"
                    name="sort_order"
                    placeholder="Sort order"
                    value={form.sort_order}
                    onChange={handleChange}
                  />
                </label>

                <label className="affiliate-sliders-field">
                  <span className="affiliate-sliders-label">Status</span>
                  <select
                    className="affiliate-sliders-input"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
              </div>

              {error ? (
                <div className="affiliate-sliders-alert error">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              ) : null}

              {success ? (
                <div className="affiliate-sliders-alert success">
                  <CheckCircle2 size={18} />
                  <span>{success}</span>
                </div>
              ) : null}

              <div className="affiliate-sliders-actions">
                <button className="affiliate-sliders-btn primary" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : selectedSliderId ? 'Update Slider' : 'Create Slider'}
                </button>

                {selectedSliderId ? (
                  <button
                    className="affiliate-sliders-btn secondary"
                    type="button"
                    onClick={handleStatusToggle}
                    disabled={statusSaving}
                  >
                    {form.status === 'active' ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                    {statusSaving
                      ? 'Updating...'
                      : form.status === 'active'
                      ? 'Set Inactive'
                      : 'Set Active'}
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <div className="affiliate-sliders-panel">
            <div className="affiliate-sliders-panel-head">
              <div>
                <p className="affiliate-sliders-panel-kicker">Preview</p>
                <h2 className="affiliate-sliders-panel-title">Slider Summary</h2>
              </div>
            </div>

            <div className="affiliate-sliders-preview-card">
              {form.image ? (
                <img
                  src={form.image}
                  alt={form.title || 'Slider preview'}
                  className="affiliate-sliders-preview-image"
                />
              ) : (
                <div className="affiliate-sliders-preview-placeholder">
                  <ImageIcon size={26} />
                  <span>No image preview</span>
                </div>
              )}

              <div className="affiliate-sliders-summary-list">
                <div className="affiliate-sliders-summary-row">
                  <span>Title</span>
                  <strong>{form.title || '-'}</strong>
                </div>

                <div className="affiliate-sliders-summary-row">
                  <span>Subtitle</span>
                  <strong>{form.subtitle || '-'}</strong>
                </div>

                <div className="affiliate-sliders-summary-row">
                  <span>Link type</span>
                  <strong>{getLinkTypeLabel(form.link_type)}</strong>
                </div>

                {form.link_type === 'internal_post' ? (
                  <div className="affiliate-sliders-summary-row">
                    <span>Linked post</span>
                    <strong>{selectedPostTitle}</strong>
                  </div>
                ) : null}

                {form.link_type === 'product' ? (
                  <div className="affiliate-sliders-summary-row">
                    <span>Linked product</span>
                    <strong>{selectedProductTitle}</strong>
                  </div>
                ) : null}

                {form.link_type === 'external_url' ? (
                  <div className="affiliate-sliders-summary-row">
                    <span>External URL</span>
                    <strong className="wrap">{form.external_url || '-'}</strong>
                  </div>
                ) : null}

                <div className="affiliate-sliders-summary-row">
                  <span>Status</span>
                  <strong>{form.status || '-'}</strong>
                </div>

                <div className="affiliate-sliders-summary-row">
                  <span>Sort order</span>
                  <strong>{form.sort_order || 0}</strong>
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

  .affiliate-sliders-page {
    width: 100%;
  }

  .affiliate-sliders-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-sliders-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-sliders-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliateSlidersSpin 0.8s linear infinite;
  }

  @keyframes affiliateSlidersSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: affiliateSlidersSpin 0.8s linear infinite;
  }

  .affiliate-sliders-hero {
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

  .affiliate-sliders-badge {
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

  .affiliate-sliders-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-sliders-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-sliders-hero-actions,
  .affiliate-sliders-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-sliders-btn {
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

  .affiliate-sliders-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-sliders-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .affiliate-sliders-grid {
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.25fr);
    gap: 20px;
  }

  .affiliate-sliders-side-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .affiliate-sliders-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-sliders-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .affiliate-sliders-panel-kicker {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .affiliate-sliders-panel-title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-sliders-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-sliders-list-card {
    width: 100%;
    padding: 16px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    cursor: pointer;
    text-align: left;
    transition: 0.2s ease;
  }

  .affiliate-sliders-list-card.active {
    border-color: #111827;
    background: #ffffff;
    box-shadow: inset 0 0 0 1px #111827;
  }

  .affiliate-sliders-list-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .affiliate-sliders-list-card h3 {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-sliders-list-card p {
    margin: 0;
    color: #6b7280;
    font-size: 13px;
  }

  .affiliate-sliders-status {
    display: inline-flex;
    width: fit-content;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    text-transform: capitalize;
    border: 1px solid transparent;
    white-space: nowrap;
  }

  .affiliate-sliders-status.active {
    background: #ecfdf3;
    color: #027a48;
    border-color: #abefc6;
  }

  .affiliate-sliders-status.inactive {
    background: #fff7ed;
    color: #b54708;
    border-color: #fed7aa;
  }

  .affiliate-sliders-status.neutral {
    background: #eef2f7;
    color: #344054;
    border-color: #dbe2ea;
  }

  .affiliate-sliders-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .affiliate-sliders-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .affiliate-sliders-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-sliders-field-full {
    grid-column: span 2;
  }

  .affiliate-sliders-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 800;
    color: #111827;
  }

  .affiliate-sliders-input {
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

  .affiliate-sliders-input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.06);
  }

  .affiliate-sliders-help {
    color: #6b7280;
    font-size: 12px;
    line-height: 1.5;
  }

  .affiliate-sliders-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
  }

  .affiliate-sliders-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-sliders-alert.success {
    background: #ecfdf3;
    border: 1px solid #abefc6;
    color: #027a48;
  }

  .affiliate-sliders-preview-card {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .affiliate-sliders-preview-image,
  .affiliate-sliders-preview-placeholder {
    width: 100%;
    height: 220px;
    border-radius: 18px;
    border: 1px solid #edf2f7;
    background: #f8fafc;
  }

  .affiliate-sliders-preview-image {
    object-fit: cover;
    display: block;
  }

  .affiliate-sliders-preview-placeholder {
    display: grid;
    place-items: center;
    color: #6b7280;
    gap: 8px;
    text-align: center;
  }

  .affiliate-sliders-summary-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-sliders-summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 16px;
  }

  .affiliate-sliders-summary-row span {
    color: #6b7280;
    font-weight: 700;
    font-size: 13px;
  }

  .affiliate-sliders-summary-row strong {
    color: #111827;
    font-weight: 900;
    text-align: right;
  }

  .affiliate-sliders-summary-row strong.wrap {
    word-break: break-word;
  }

  .affiliate-sliders-empty-small {
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

  .affiliate-sliders-empty-small p {
    margin: 0;
    color: #111827;
    font-weight: 800;
  }

  @media (max-width: 1100px) {
    .affiliate-sliders-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 991px) {
    .affiliate-sliders-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-sliders-title {
      font-size: 26px;
    }

    .affiliate-sliders-panel {
      padding: 18px;
    }
  }

  @media (max-width: 767px) {
    .affiliate-sliders-form-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-sliders-field-full {
      grid-column: span 1;
    }

    .affiliate-sliders-title {
      font-size: 22px;
    }

    .affiliate-sliders-subtitle {
      font-size: 14px;
    }

    .affiliate-sliders-hero-actions,
    .affiliate-sliders-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-sliders-btn {
      width: 100%;
    }

    .affiliate-sliders-summary-row,
    .affiliate-sliders-list-card-top {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;