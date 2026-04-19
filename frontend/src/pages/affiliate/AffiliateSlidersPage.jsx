import { useEffect, useState } from 'react';
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

export default function AffiliateSlidersPage() {
  const [sliders, setSliders] = useState([]);
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSliderId, setSelectedSliderId] = useState('');
  const [form, setForm] = useState(emptySlider());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [slidersRes, postsRes, productsRes] = await Promise.all([
          api.get('/api/affiliate/sliders'),
          api.get('/api/affiliate/posts'),
          api.get('/api/affiliate/products'),
        ]);

        const sliderList = slidersRes?.data?.sliders || [];
        setSliders(sliderList);
        setPosts(postsRes?.data?.posts || []);
        setProducts(productsRes?.data?.products || []);

        if (sliderList.length) {
          loadSliderIntoForm(sliderList[0]);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load sliders');
      } finally {
        setLoading(false);
      }
    };

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

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading sliders...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">Sliders</h1>
          <p className="page-subtitle">
            Create homepage sliders and link them to posts, products, or Supgad URLs.
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
                Slider List
              </h2>

              <button className="btn btn-primary" type="button" onClick={resetForNew}>
                New Slider
              </button>
            </div>

            <div className="form-stack">
              {sliders.length ? (
                sliders.map((slider) => (
                  <button
                    key={slider.id}
                    type="button"
                    className="surface-card surface-card-padding"
                    onClick={() => loadSliderIntoForm(slider)}
                    style={{
                      textAlign: 'left',
                      cursor: 'pointer',
                      border:
                        String(selectedSliderId) === String(slider.id)
                          ? '1px solid rgba(122, 92, 255, 0.9)'
                          : '1px solid rgba(255,255,255,0.08)',
                      background:
                        String(selectedSliderId) === String(slider.id)
                          ? 'rgba(122, 92, 255, 0.12)'
                          : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{slider.title || 'Untitled Slider'}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Type: {slider.link_type}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Status: {slider.status}
                    </div>
                  </button>
                ))
              ) : (
                <div>No sliders yet.</div>
              )}
            </div>
          </div>

          <div className="surface-card surface-card-padding">
            <h2 className="section-title">
              {selectedSliderId ? 'Edit Slider' : 'Create Slider'}
            </h2>

            <form className="form-stack" onSubmit={handleSubmit}>
              <input
                className="input-control"
                name="image"
                placeholder="Slider image URL"
                value={form.image}
                onChange={handleChange}
              />

              <input
                className="input-control"
                name="title"
                placeholder="Slider title"
                value={form.title}
                onChange={handleChange}
              />

              <input
                className="input-control"
                name="subtitle"
                placeholder="Slider subtitle"
                value={form.subtitle}
                onChange={handleChange}
              />

              <select
                className="input-control"
                name="link_type"
                value={form.link_type}
                onChange={handleChange}
              >
                <option value="internal_post">Internal Post</option>
                <option value="product">Product</option>
                <option value="external_url">External URL</option>
              </select>

              {form.link_type === 'internal_post' ? (
                <select
                  className="input-control"
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
              ) : null}

              {form.link_type === 'product' ? (
                <select
                  className="input-control"
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
              ) : null}

              {form.link_type === 'external_url' ? (
                <input
                  className="input-control"
                  name="external_url"
                  placeholder="External URL (must be supgad.com)"
                  value={form.external_url}
                  onChange={handleChange}
                />
              ) : null}

              <input
                className="input-control"
                type="number"
                name="sort_order"
                placeholder="Sort order"
                value={form.sort_order}
                onChange={handleChange}
              />

              <select
                className="input-control"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

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
                  {saving ? 'Saving...' : selectedSliderId ? 'Update Slider' : 'Create Slider'}
                </button>

                {selectedSliderId ? (
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={handleStatusToggle}
                    disabled={statusSaving}
                  >
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
        </div>
      </div>
    </div>
  );
}