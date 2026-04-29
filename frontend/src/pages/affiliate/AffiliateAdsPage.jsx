import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BadgeDollarSign,
  CalendarDays,
  Eye,
  ImagePlus,
  MousePointerClick,
  PauseCircle,
  PlayCircle,
  PlusCircle,
  Rocket,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  UploadCloud,
  Wallet,
} from 'lucide-react';
import api from '../../services/api';

const EMPTY_FORM = {
  ad_type: 'product',
  target_id: '',
  website_id: '',
  campaign_title: '',
  campaign_description: '',
  campaign_image: '',
  total_budget: '10',
  daily_budget_cap: '',
  start_date: '',
  end_date: '',
  bid_cost_per_view: '',
  bid_cost_per_click: '',
  currency: 'USD',
};

const EMPTY_TOPUP = {
  campaign_id: '',
  amount: '10',
};

function money(value, currency = 'USD') {
  const amount = Number(value || 0);
  return `${currency === 'USD' ? '$' : `${currency} `}${amount.toFixed(4)}`;
}

function shortMoney(value, currency = 'USD') {
  const amount = Number(value || 0);
  return `${currency === 'USD' ? '$' : `${currency} `}${amount.toFixed(2)}`;
}

function numberValue(value) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString();
}

function getTargetName(item) {
  return item?.title || item?.name || item?.website_name || item?.site_name || `Item #${item?.id}`;
}

function getWebsiteName(website) {
  if (!website) return 'No website found';

  return (
    website.website_name ||
    website.name ||
    website.site_name ||
    website.title ||
    website.slug ||
    `Website #${website.id}`
  );
}

function getRatesForType(settings, adType) {
  if (!settings) {
    return {
      view: 0,
      click: 0,
      minimum: 10,
      currency: 'USD',
    };
  }

  if (adType === 'product') {
    return {
      view: numberValue(settings.product_cost_per_view),
      click: numberValue(settings.product_cost_per_click),
      minimum: numberValue(settings.minimum_budget || 10),
      currency: settings.currency || 'USD',
    };
  }

  if (adType === 'post') {
    return {
      view: numberValue(settings.post_cost_per_view),
      click: numberValue(settings.post_cost_per_click),
      minimum: numberValue(settings.minimum_budget || 10),
      currency: settings.currency || 'USD',
    };
  }

  return {
    view: numberValue(settings.website_cost_per_view),
    click: numberValue(settings.website_cost_per_click),
    minimum: numberValue(settings.minimum_budget || 10),
    currency: settings.currency || 'USD',
  };
}

function getTypeMeta(type) {
  if (type === 'product') {
    return {
      title: 'Promote Product',
      short: 'Product',
      description: 'Push one selected product into sponsored product placements.',
      accent: '#2563eb',
      soft: '#eff6ff',
    };
  }

  if (type === 'post') {
    return {
      title: 'Promote Post',
      short: 'Post',
      description: 'Push one blog post into sponsored post and category placements.',
      accent: '#7c3aed',
      soft: '#f5f3ff',
    };
  }

  return {
    title: 'Promote Website',
    short: 'Website',
    description: 'Push your website into featured website placements.',
    accent: '#059669',
    soft: '#ecfdf5',
  };
}

function getStatusMeta(status) {
  const map = {
    active: { label: 'Active', className: 'is-green' },
    pending: { label: 'Pending', className: 'is-yellow' },
    paused: { label: 'Paused', className: 'is-blue' },
    daily_paused: { label: 'Daily Paused', className: 'is-purple' },
    exhausted: { label: 'Exhausted', className: 'is-red' },
    ended: { label: 'Ended', className: 'is-gray' },
    rejected: { label: 'Rejected', className: 'is-red' },
  };

  return map[status] || { label: status || 'Unknown', className: 'is-gray' };
}

function getApprovalMeta(status) {
  const map = {
    approved: { label: 'Approved', className: 'is-green' },
    pending: { label: 'Awaiting Approval', className: 'is-yellow' },
    rejected: { label: 'Rejected', className: 'is-red' },
  };

  return map[status] || { label: status || 'Unknown', className: 'is-gray' };
}

function Badge({ item }) {
  return <span className={`ads-badge ${item.className}`}>{item.label}</span>;
}

export default function AffiliateAdsPage() {
  const imageInputRef = useRef(null);

  const [campaigns, setCampaigns] = useState([]);
  const [settings, setSettings] = useState(null);
  const [website, setWebsite] = useState(null);
  const [products, setProducts] = useState([]);
  const [posts, setPosts] = useState([]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [topup, setTopup] = useState(EMPTY_TOPUP);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workingId, setWorkingId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const currentRate = useMemo(
    () => getRatesForType(settings, form.ad_type),
    [settings, form.ad_type]
  );

  const typeMeta = useMemo(() => getTypeMeta(form.ad_type), [form.ad_type]);

  const selectedTarget = useMemo(() => {
    if (form.ad_type === 'website') return website;

    if (form.ad_type === 'product') {
      return products.find((item) => Number(item.id) === Number(form.target_id));
    }

    return posts.find((item) => Number(item.id) === Number(form.target_id));
  }, [form.ad_type, form.target_id, website, products, posts]);

  const liveViewBid = useMemo(() => {
    const entered = numberValue(form.bid_cost_per_view);
    return entered > 0 ? Math.max(entered, currentRate.view) : currentRate.view;
  }, [form.bid_cost_per_view, currentRate.view]);

  const liveClickBid = useMemo(() => {
    const entered = numberValue(form.bid_cost_per_click);
    return entered > 0 ? Math.max(entered, currentRate.click) : currentRate.click;
  }, [form.bid_cost_per_click, currentRate.click]);

  const stats = useMemo(() => {
    const totalBudget = campaigns.reduce((sum, item) => sum + numberValue(item.total_budget), 0);
    const remaining = campaigns.reduce((sum, item) => sum + numberValue(item.remaining_budget), 0);
    const spent = campaigns.reduce((sum, item) => sum + numberValue(item.total_spent), 0);
    const views = campaigns.reduce((sum, item) => sum + numberValue(item.total_views), 0);
    const clicks = campaigns.reduce((sum, item) => sum + numberValue(item.total_clicks), 0);
    const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : '0.00';

    return {
      totalBudget,
      remaining,
      spent,
      views,
      clicks,
      ctr,
      active: campaigns.filter((item) => item.status === 'active').length,
      pending: campaigns.filter((item) => item.approval_status === 'pending').length,
    };
  }, [campaigns]);

  const estimatedViewReach = useMemo(() => {
    const budget = numberValue(form.total_budget);
    if (!budget || !liveViewBid) return 0;
    return Math.floor(budget / liveViewBid);
  }, [form.total_budget, liveViewBid]);

  const estimatedClickReach = useMemo(() => {
    const budget = numberValue(form.total_budget);
    if (!budget || !liveClickBid) return 0;
    return Math.floor(budget / liveClickBid);
  }, [form.total_budget, liveClickBid]);

  async function fetchOptions() {
    const { data } = await api.get('/affiliate/ads/options');

    const nextSettings = data?.settings || null;
    const nextWebsite = data?.website || null;
    const nextProducts = Array.isArray(data?.products) ? data.products : [];
    const nextPosts = Array.isArray(data?.posts) ? data.posts : [];

    setSettings(nextSettings);
    setWebsite(nextWebsite);
    setProducts(nextProducts);
    setPosts(nextPosts);

    const rate = getRatesForType(nextSettings, form.ad_type);

    setForm((current) => ({
      ...current,
      website_id: nextWebsite?.id ? String(nextWebsite.id) : current.website_id,
      target_id:
        current.ad_type === 'website'
          ? nextWebsite?.id
            ? String(nextWebsite.id)
            : ''
          : current.target_id,
      total_budget: current.total_budget || String(rate.minimum || 10),
      bid_cost_per_view: current.bid_cost_per_view || String(rate.view || ''),
      bid_cost_per_click: current.bid_cost_per_click || String(rate.click || ''),
      currency: nextSettings?.currency || 'USD',
    }));

    setTopup((current) => ({
      ...current,
      amount: String(nextSettings?.minimum_budget || 10),
    }));
  }

  async function fetchCampaigns() {
    const { data } = await api.get('/affiliate/ads');
    setCampaigns(Array.isArray(data?.campaigns) ? data.campaigns : []);
  }

  async function loadPage() {
    try {
      setLoading(true);
      setError('');
      await Promise.all([fetchOptions(), fetchCampaigns()]);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load affiliate ads.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage();
  }, []);

  function updateForm(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function changeAdType(nextType) {
    const nextRate = getRatesForType(settings, nextType);

    setForm((current) => ({
      ...current,
      ad_type: nextType,
      target_id: nextType === 'website' ? (website?.id ? String(website.id) : '') : '',
      website_id: website?.id ? String(website.id) : current.website_id,
      total_budget:
        numberValue(current.total_budget) >= nextRate.minimum
          ? current.total_budget
          : String(nextRate.minimum || 10),
      bid_cost_per_view: String(nextRate.view || ''),
      bid_cost_per_click: String(nextRate.click || ''),
      currency: nextRate.currency || 'USD',
    }));
  }

  function resetForm() {
    const rate = getRatesForType(settings, 'product');

    setForm({
      ...EMPTY_FORM,
      total_budget: String(rate.minimum || 10),
      bid_cost_per_view: String(rate.view || ''),
      bid_cost_per_click: String(rate.click || ''),
      currency: settings?.currency || 'USD',
      website_id: website?.id ? String(website.id) : '',
    });
    setEditingId(null);
    setError('');

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }

  function startEdit(campaign) {
    const baseRate = getRatesForType(settings, campaign.ad_type || 'product');

    setEditingId(campaign.id);
    setForm({
      ad_type: campaign.ad_type || 'product',
      target_id: campaign.target_id ? String(campaign.target_id) : '',
      website_id: campaign.website_id ? String(campaign.website_id) : website?.id ? String(website.id) : '',
      campaign_title: campaign.campaign_title || '',
      campaign_description: campaign.campaign_description || '',
      campaign_image: campaign.campaign_image || '',
      total_budget: String(campaign.total_budget || baseRate.minimum || 10),
      daily_budget_cap: campaign.daily_budget_cap ? String(campaign.daily_budget_cap) : '',
      start_date: campaign.start_date ? String(campaign.start_date).slice(0, 10) : '',
      end_date: campaign.end_date ? String(campaign.end_date).slice(0, 10) : '',
      bid_cost_per_view: String(campaign.bid_cost_per_view || campaign.cost_per_view || baseRate.view || ''),
      bid_cost_per_click: String(campaign.bid_cost_per_click || campaign.cost_per_click || baseRate.click || ''),
      currency: campaign.currency || settings?.currency || 'USD',
    });
    setNotice('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      setError('Image is too large. Please use an image under 2MB.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setError('');
      updateForm('campaign_image', String(reader.result || ''));
    };

    reader.onerror = () => {
      setError('Unable to read image file.');
    };

    reader.readAsDataURL(file);
  }

  function removeImage() {
    updateForm('campaign_image', '');
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setNotice('');
      setError('');

      if (!form.target_id) {
        setError(`Please choose the ${form.ad_type} you want to promote.`);
        return;
      }

      const payload = {
        ...form,
        website_id: form.website_id || (website?.id ? String(website.id) : ''),
        target_id: String(form.target_id),
        total_budget: String(numberValue(form.total_budget) || currentRate.minimum || 10),
        daily_budget_cap: form.daily_budget_cap ? String(numberValue(form.daily_budget_cap)) : '',
        bid_cost_per_view: String(liveViewBid || currentRate.view || 0),
        bid_cost_per_click: String(liveClickBid || currentRate.click || 0),
      };

      let successMessage = 'Campaign created successfully.';

      if (editingId) {
        await api.put(`/affiliate/ads/${editingId}`, payload);
        successMessage = 'Campaign updated successfully.';
      } else {
        await api.post('/affiliate/ads', payload);
      }

      await fetchCampaigns();
      await fetchOptions();
      resetForm();
      setNotice(successMessage);

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save campaign.');
    } finally {
      setSaving(false);
    }
  }

  async function handleTopup(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setNotice('');
      setError('');

      if (!topup.campaign_id) {
        setError('Please choose a campaign to top up.');
        return;
      }

      const response = await api.post(`/affiliate/ads/${topup.campaign_id}/top-up`, {
        amount: Number(topup.amount),
        currency: settings?.currency || 'USD',
      });

      setNotice(response?.data?.message || 'Campaign topped up successfully.');
      setTopup({
        campaign_id: '',
        amount: String(settings?.minimum_budget || 10),
      });
      await fetchCampaigns();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to top up campaign.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePause(campaignId) {
    try {
      setWorkingId(campaignId);
      setNotice('');
      setError('');
      const response = await api.put(`/affiliate/ads/${campaignId}/pause`);
      setNotice(response?.data?.message || 'Campaign paused.');
      await fetchCampaigns();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to pause campaign.');
    } finally {
      setWorkingId(null);
    }
  }

  async function handleResume(campaignId) {
    try {
      setWorkingId(campaignId);
      setNotice('');
      setError('');
      const response = await api.put(`/affiliate/ads/${campaignId}/resume`);
      setNotice(response?.data?.message || 'Campaign resumed.');
      await fetchCampaigns();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to resume campaign.');
    } finally {
      setWorkingId(null);
    }
  }

  const topupOptions = campaigns.filter((item) =>
    ['active', 'paused', 'daily_paused', 'exhausted', 'ended'].includes(item.status)
  );

  if (loading) {
    return (
      <div className="ads-loading">
        <style>{styles}</style>
        <div>Loading ads studio...</div>
      </div>
    );
  }

  return (
    <div className="ads-page">
      <style>{styles}</style>

      <section className="ads-hero">
        <div className="ads-hero-copy">
          <span className="ads-pill">
            <Sparkles size={14} />
            Bloggad Ads Studio
          </span>
          <h1>Create ad campaigns with premium control</h1>
          <p>
            Promote a product, post, or website. Set your budget, daily cap, campaign duration,
            upload creative image, and increase your bid for stronger visibility.
          </p>
        </div>

        <div className="ads-hero-panel">
          <div>
            <span>Minimum Budget</span>
            <strong>{shortMoney(settings?.minimum_budget || 10, settings?.currency || 'USD')}</strong>
          </div>
          <div>
            <span>Currency</span>
            <strong>{settings?.currency || 'USD'}</strong>
          </div>
        </div>
      </section>

      {(notice || error) && (
        <div className={error ? 'ads-alert is-error' : 'ads-alert is-success'}>
          {error || notice}
        </div>
      )}

      <section className="ads-stats">
        <div>
          <Wallet size={18} />
          <span>Total Budget</span>
          <strong>{shortMoney(stats.totalBudget, settings?.currency || 'USD')}</strong>
        </div>
        <div>
          <BadgeDollarSign size={18} />
          <span>Remaining</span>
          <strong>{shortMoney(stats.remaining, settings?.currency || 'USD')}</strong>
        </div>
        <div>
          <Eye size={18} />
          <span>Views</span>
          <strong>{stats.views.toLocaleString()}</strong>
        </div>
        <div>
          <MousePointerClick size={18} />
          <span>Clicks</span>
          <strong>{stats.clicks.toLocaleString()}</strong>
        </div>
        <div>
          <TrendingUp size={18} />
          <span>CTR</span>
          <strong>{stats.ctr}%</strong>
        </div>
      </section>

      <section className="ads-layout">
        <div className="ads-builder-card">
          <div className="ads-section-head">
            <span>
              <Target size={15} />
              {editingId ? 'Edit Campaign' : 'Create Campaign'}
            </span>
            <h2>Campaign Builder</h2>
            <p>Use this form to create a sponsored ad campaign.</p>
          </div>

          <form onSubmit={handleSubmit} className="ads-form">
            <div className="ads-step-title">1. Choose campaign type</div>

            <div className="ads-type-grid">
              {['product', 'post', 'website'].map((type) => {
                const meta = getTypeMeta(type);
                const active = form.ad_type === type;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => changeAdType(type)}
                    className={active ? 'ads-type-card active' : 'ads-type-card'}
                    style={{
                      '--accent': meta.accent,
                      '--soft': meta.soft,
                    }}
                  >
                    <Rocket size={18} />
                    <strong>{meta.title}</strong>
                    <span>{meta.description}</span>
                  </button>
                );
              })}
            </div>

            <div className="ads-step-title">2. Select target</div>

            {form.ad_type === 'website' ? (
              <div className="ads-selected-website">
                <span>Selected Website</span>
                <strong>{getWebsiteName(website)}</strong>
                <p>Website campaigns automatically use your own affiliate website.</p>
              </div>
            ) : (
              <label className="ads-field full">
                <span>{form.ad_type === 'product' ? 'Choose product' : 'Choose post'}</span>
                <select value={form.target_id} onChange={(event) => updateForm('target_id', event.target.value)}>
                  <option value="">
                    {form.ad_type === 'product' ? 'Select one of your products' : 'Select one of your posts'}
                  </option>

                  {(form.ad_type === 'product' ? products : posts).map((item) => (
                    <option key={item.id} value={item.id}>
                      {getTargetName(item)}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="ads-two">
              <label className="ads-field">
                <span>Campaign title</span>
                <input
                  value={form.campaign_title}
                  onChange={(event) => updateForm('campaign_title', event.target.value)}
                  placeholder="Example: Promote my best product"
                />
              </label>

              <label className="ads-field">
                <span>Campaign image URL</span>
                <input
                  value={form.campaign_image.startsWith('data:image') ? 'Uploaded local image selected' : form.campaign_image}
                  onChange={(event) => updateForm('campaign_image', event.target.value)}
                  placeholder="Paste image URL or upload below"
                  disabled={form.campaign_image.startsWith('data:image')}
                />
              </label>
            </div>

            <div className="ads-upload-box">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                hidden
              />

              <button type="button" className="ads-upload-button" onClick={() => imageInputRef.current?.click()}>
                <UploadCloud size={18} />
                Upload image from device
              </button>

              {form.campaign_image ? (
                <div className="ads-upload-preview">
                  <img src={form.campaign_image} alt="Campaign preview" />
                  <button type="button" onClick={removeImage}>
                    <Trash2 size={15} />
                    Remove
                  </button>
                </div>
              ) : (
                <div className="ads-upload-empty">
                  <ImagePlus size={24} />
                  <span>No image selected yet</span>
                </div>
              )}
            </div>

            <label className="ads-field full">
              <span>Campaign description</span>
              <textarea
                value={form.campaign_description}
                onChange={(event) => updateForm('campaign_description', event.target.value)}
                rows={4}
                placeholder="Add a short campaign note or description"
              />
            </label>

            <div className="ads-step-title">3. Budget and duration</div>

            <div className="ads-four">
              <label className="ads-field">
                <span>Total budget</span>
                <input
                  type="number"
                  min={currentRate.minimum || 10}
                  step="0.01"
                  value={form.total_budget}
                  onChange={(event) => updateForm('total_budget', event.target.value)}
                />
                <small>Minimum: {shortMoney(currentRate.minimum, currentRate.currency)}</small>
              </label>

              <label className="ads-field">
                <span>Daily spend cap</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.daily_budget_cap}
                  onChange={(event) => updateForm('daily_budget_cap', event.target.value)}
                  placeholder="Optional"
                />
                <small>Pauses for the day when reached.</small>
              </label>

              <label className="ads-field">
                <span>Start date</span>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(event) => updateForm('start_date', event.target.value)}
                />
              </label>

              <label className="ads-field">
                <span>End date</span>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(event) => updateForm('end_date', event.target.value)}
                />
              </label>
            </div>

            <div className="ads-step-title">4. Bid and visibility</div>

            <div className="ads-bid-box">
              <label className="ads-field">
                <span>Bid cost per view</span>
                <input
                  type="number"
                  min={currentRate.view || 0}
                  step="0.0001"
                  value={form.bid_cost_per_view}
                  onChange={(event) => updateForm('bid_cost_per_view', event.target.value)}
                />
                <small>Base: {money(currentRate.view, currentRate.currency)}</small>
              </label>

              <label className="ads-field">
                <span>Bid cost per click</span>
                <input
                  type="number"
                  min={currentRate.click || 0}
                  step="0.0001"
                  value={form.bid_cost_per_click}
                  onChange={(event) => updateForm('bid_cost_per_click', event.target.value)}
                />
                <small>Base: {money(currentRate.click, currentRate.currency)}</small>
              </label>

              <div className="ads-strength">
                <span>Visibility Strength</span>
                <strong>
                  {liveClickBid > currentRate.click || liveViewBid > currentRate.view ? 'Boosted' : 'Base'}
                </strong>
                <small>Higher bid campaigns rank stronger.</small>
              </div>
            </div>

            <div className="ads-actions-row">
              <button type="submit" disabled={saving} className="ads-primary-btn">
                {saving ? 'Saving...' : editingId ? 'Update Campaign' : 'Submit Campaign'}
              </button>

              <button type="button" onClick={resetForm} className="ads-secondary-btn">
                Reset
              </button>
            </div>
          </form>
        </div>

        <aside className="ads-side">
          <div className="ads-preview-card">
            <span className="ads-mini-pill" style={{ color: typeMeta.accent, background: typeMeta.soft }}>
              {typeMeta.title}
            </span>

            <h3>{form.campaign_title || 'Campaign preview'}</h3>
            <p>{form.campaign_description || 'Your campaign description will appear here.'}</p>

            {form.campaign_image ? (
              <img src={form.campaign_image} alt="Campaign preview" />
            ) : (
              <div className="ads-preview-image">
                <ImagePlus size={26} />
                <span>Creative image</span>
              </div>
            )}

            <div className="ads-preview-target">
              Target: <strong>{selectedTarget ? getTargetName(selectedTarget) : 'Not selected'}</strong>
            </div>
          </div>

          <div className="ads-mini-card">
            <Wallet size={18} />
            <h4>Budget Snapshot</h4>
            <div className="ads-mini-row">
              <span>Total</span>
              <strong>{shortMoney(form.total_budget, currentRate.currency)}</strong>
            </div>
            <div className="ads-mini-row">
              <span>Daily cap</span>
              <strong>{form.daily_budget_cap ? shortMoney(form.daily_budget_cap, currentRate.currency) : 'No cap'}</strong>
            </div>
          </div>

          <div className="ads-mini-card">
            <CalendarDays size={18} />
            <h4>Schedule</h4>
            <p>
              <strong>Start:</strong> {form.start_date || 'After approval'}
            </p>
            <p>
              <strong>End:</strong> {form.end_date || 'No end date'}
            </p>
          </div>

          <div className="ads-mini-card">
            <TrendingUp size={18} />
            <h4>Estimated Reach</h4>
            <div className="ads-mini-row">
              <span>Views</span>
              <strong>{estimatedViewReach.toLocaleString()}</strong>
            </div>
            <div className="ads-mini-row">
              <span>Clicks</span>
              <strong>{estimatedClickReach.toLocaleString()}</strong>
            </div>
          </div>

          <form onSubmit={handleTopup} className="ads-mini-card">
            <h4>Top Up Campaign</h4>

            <label className="ads-field">
              <span>Campaign</span>
              <select
                value={topup.campaign_id}
                onChange={(event) => setTopup((current) => ({ ...current, campaign_id: event.target.value }))}
              >
                <option value="">Choose campaign</option>
                {topupOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.campaign_title}
                  </option>
                ))}
              </select>
            </label>

            <label className="ads-field">
              <span>Amount</span>
              <input
                type="number"
                min={settings?.minimum_budget || 10}
                step="0.01"
                value={topup.amount}
                onChange={(event) => setTopup((current) => ({ ...current, amount: event.target.value }))}
              />
            </label>

            <button type="submit" disabled={saving} className="ads-dark-btn">
              {saving ? 'Processing...' : 'Top Up'}
            </button>
          </form>
        </aside>
      </section>

      <section className="ads-campaigns">
        <div className="ads-section-head">
          <h2>My Campaigns</h2>
          <p>Monitor approval, budget, bids, views, clicks, and campaign controls.</p>
        </div>

        {campaigns.length ? (
          <div className="ads-campaign-grid">
            {campaigns.map((campaign) => (
              <article key={campaign.id} className="ads-campaign-card">
                <div className="ads-card-top">
                  <span className="ads-mini-pill">{campaign.ad_type}</span>
                  <div>
                    <Badge item={getStatusMeta(campaign.status)} />
                    <Badge item={getApprovalMeta(campaign.approval_status)} />
                  </div>
                </div>

                <h3>{campaign.campaign_title}</h3>
                <p>{campaign.campaign_description || 'No campaign description.'}</p>

                <div className="ads-campaign-metrics">
                  <div>
                    <span>Budget</span>
                    <strong>{shortMoney(campaign.total_budget, campaign.currency)}</strong>
                  </div>
                  <div>
                    <span>Remaining</span>
                    <strong>{shortMoney(campaign.remaining_budget, campaign.currency)}</strong>
                  </div>
                  <div>
                    <span>Views</span>
                    <strong>{numberValue(campaign.total_views).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span>Clicks</span>
                    <strong>{numberValue(campaign.total_clicks).toLocaleString()}</strong>
                  </div>
                </div>

                <div className="ads-campaign-info">
                  <span>Daily cap: {campaign.daily_budget_cap ? shortMoney(campaign.daily_budget_cap, campaign.currency) : 'No cap'}</span>
                  <span>Bid/view: {money(campaign.bid_cost_per_view || campaign.cost_per_view, campaign.currency)}</span>
                  <span>Bid/click: {money(campaign.bid_cost_per_click || campaign.cost_per_click, campaign.currency)}</span>
                  <span>
                    Dates: {campaign.start_date ? formatDate(campaign.start_date) : 'Immediate'} -{' '}
                    {campaign.end_date ? formatDate(campaign.end_date) : 'Open'}
                  </span>
                </div>

                <div className="ads-card-actions">
                  <button type="button" onClick={() => startEdit(campaign)}>
                    Edit
                  </button>

                  {campaign.status === 'active' ? (
                    <button type="button" onClick={() => handlePause(campaign.id)} disabled={workingId === campaign.id}>
                      <PauseCircle size={15} />
                      {workingId === campaign.id ? 'Working...' : 'Pause'}
                    </button>
                  ) : (
                    <button type="button" onClick={() => handleResume(campaign.id)} disabled={workingId === campaign.id}>
                      <PlayCircle size={15} />
                      {workingId === campaign.id ? 'Working...' : 'Resume'}
                    </button>
                  )}

                  <button
                    type="button"
                    className="dark"
                    onClick={() =>
                      setTopup({
                        campaign_id: String(campaign.id),
                        amount: String(settings?.minimum_budget || 10),
                      })
                    }
                  >
                    <PlusCircle size={15} />
                    Top Up
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="ads-empty">No campaigns yet. Create your first campaign above.</div>
        )}
      </section>
    </div>
  );
}

const styles = `
  .ads-loading {
    min-height: 60vh;
    display: grid;
    place-items: center;
    background: #f5f7fb;
  }

  .ads-loading > div {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 22px;
    padding: 24px;
    font-weight: 900;
    color: #111827;
  }

  .ads-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(37,99,235,0.08), transparent 24%),
      radial-gradient(circle at top right, rgba(124,58,237,0.08), transparent 24%),
      #f5f7fb;
    color: #111827;
    padding: 18px;
  }

  .ads-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.6fr);
    gap: 20px;
    align-items: end;
    background: linear-gradient(135deg, #111827 0%, #172033 52%, #312e81 100%);
    border-radius: 28px;
    padding: clamp(20px, 4vw, 34px);
    color: #ffffff;
    overflow: hidden;
    margin-bottom: 18px;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
  }

  .ads-pill,
  .ads-mini-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .ads-pill {
    background: rgba(255,255,255,0.12);
    color: #ffffff;
    border: 1px solid rgba(255,255,255,0.18);
    margin-bottom: 14px;
  }

  .ads-hero h1 {
    margin: 0;
    font-size: clamp(2rem, 5vw, 3.8rem);
    line-height: 1.02;
    letter-spacing: -0.06em;
    font-weight: 950;
    max-width: 820px;
  }

  .ads-hero p {
    margin: 14px 0 0;
    max-width: 850px;
    color: rgba(255,255,255,0.78);
    font-size: 15px;
    line-height: 1.75;
  }

  .ads-hero-panel {
    display: grid;
    gap: 14px;
  }

  .ads-hero-panel > div {
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.16);
    border-radius: 22px;
    padding: 18px;
  }

  .ads-hero-panel span {
    display: block;
    color: rgba(255,255,255,0.7);
    font-size: 12px;
    margin-bottom: 8px;
  }

  .ads-hero-panel strong {
    font-size: 24px;
    font-weight: 950;
  }

  .ads-alert {
    margin-bottom: 18px;
    border-radius: 16px;
    padding: 14px 16px;
    font-weight: 800;
  }

  .ads-alert.is-success {
    background: #ecfdf5;
    color: #166534;
    border: 1px solid #86efac;
  }

  .ads-alert.is-error {
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fca5a5;
  }

  .ads-stats {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 18px;
  }

  .ads-stats > div,
  .ads-builder-card,
  .ads-side > *,
  .ads-campaigns {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    box-shadow: 0 16px 38px rgba(15,23,42,0.06);
  }

  .ads-stats > div {
    padding: 16px;
  }

  .ads-stats svg {
    color: #2563eb;
    margin-bottom: 10px;
  }

  .ads-stats span {
    display: block;
    color: #64748b;
    font-size: 12px;
    margin-bottom: 6px;
  }

  .ads-stats strong {
    display: block;
    font-size: clamp(1.1rem, 2vw, 1.7rem);
    font-weight: 950;
    color: #111827;
  }

  .ads-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(340px, 0.75fr);
    gap: 18px;
    align-items: start;
    margin-bottom: 18px;
  }

  .ads-builder-card {
    overflow: hidden;
  }

  .ads-section-head {
    padding: 22px;
    border-bottom: 1px solid #eef2f7;
  }

  .ads-section-head > span {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    padding: 8px 12px;
    border-radius: 999px;
    background: #eef2ff;
    color: #4338ca;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 10px;
  }

  .ads-section-head h2 {
    margin: 0;
    font-size: clamp(1.4rem, 3vw, 2rem);
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .ads-section-head p {
    margin: 8px 0 0;
    color: #64748b;
    line-height: 1.6;
  }

  .ads-form {
    padding: 22px;
  }

  .ads-step-title {
    font-size: 14px;
    font-weight: 950;
    color: #111827;
    margin: 22px 0 12px;
  }

  .ads-step-title:first-child {
    margin-top: 0;
  }

  .ads-type-grid,
  .ads-two,
  .ads-four,
  .ads-bid-box {
    display: grid;
    gap: 14px;
  }

  .ads-type-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .ads-type-card {
    text-align: left;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    border-radius: 20px;
    padding: 16px;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .ads-type-card.active {
    border-color: var(--accent);
    background: var(--soft);
  }

  .ads-type-card svg {
    color: var(--accent);
    margin-bottom: 10px;
  }

  .ads-type-card strong,
  .ads-type-card span {
    display: block;
  }

  .ads-type-card strong {
    color: #111827;
    font-weight: 950;
    margin-bottom: 6px;
  }

  .ads-type-card span {
    color: #64748b;
    font-size: 13px;
    line-height: 1.6;
  }

  .ads-two,
  .ads-bid-box {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ads-four {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .ads-field {
    display: block;
  }

  .ads-field.full {
    grid-column: 1 / -1;
  }

  .ads-field span {
    display: block;
    margin-bottom: 8px;
    color: #334155;
    font-size: 13px;
    font-weight: 900;
  }

  .ads-field input,
  .ads-field select,
  .ads-field textarea {
    width: 100%;
    border: 1px solid #dbe3ef;
    background: #ffffff;
    border-radius: 16px;
    padding: 13px 14px;
    color: #111827;
    font-size: 14px;
    outline: none;
  }

  .ads-field input,
  .ads-field select {
    min-height: 52px;
  }

  .ads-field textarea {
    resize: vertical;
    line-height: 1.7;
  }

  .ads-field small {
    display: block;
    color: #64748b;
    margin-top: 7px;
    font-size: 12px;
  }

  .ads-selected-website,
  .ads-upload-box,
  .ads-bid-box {
    border: 1px solid #e5e7eb;
    background: #f8fafc;
    border-radius: 20px;
    padding: 16px;
  }

  .ads-selected-website span {
    display: block;
    color: #2563eb;
    font-size: 12px;
    font-weight: 950;
    margin-bottom: 6px;
  }

  .ads-selected-website strong {
    display: block;
    color: #111827;
    font-size: 18px;
    font-weight: 950;
  }

  .ads-selected-website p {
    margin: 7px 0 0;
    color: #64748b;
    line-height: 1.6;
  }

  .ads-upload-box {
    display: grid;
    gap: 12px;
    margin: 14px 0;
  }

  .ads-upload-button {
    min-height: 52px;
    border: 1px dashed #93c5fd;
    background: #eff6ff;
    color: #1d4ed8;
    border-radius: 16px;
    font-weight: 900;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .ads-upload-preview {
    display: grid;
    grid-template-columns: 130px 1fr;
    gap: 12px;
    align-items: center;
  }

  .ads-upload-preview img {
    width: 130px;
    height: 90px;
    object-fit: cover;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
  }

  .ads-upload-preview button {
    width: fit-content;
    border: 0;
    background: #fee2e2;
    color: #b91c1c;
    border-radius: 12px;
    padding: 10px 13px;
    font-weight: 900;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  .ads-upload-empty {
    min-height: 90px;
    display: grid;
    place-items: center;
    gap: 7px;
    color: #64748b;
    border: 1px dashed #cbd5e1;
    border-radius: 16px;
    background: #ffffff;
  }

  .ads-strength {
    border: 1px solid #fed7aa;
    background: #fff7ed;
    border-radius: 18px;
    padding: 15px;
  }

  .ads-strength span,
  .ads-strength small {
    display: block;
    color: #9a3412;
  }

  .ads-strength span {
    font-size: 12px;
    font-weight: 900;
    margin-bottom: 7px;
  }

  .ads-strength strong {
    display: block;
    color: #111827;
    font-size: 24px;
    font-weight: 950;
    margin-bottom: 7px;
  }

  .ads-actions-row,
  .ads-card-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 18px;
  }

  .ads-primary-btn,
  .ads-secondary-btn,
  .ads-dark-btn,
  .ads-card-actions button {
    min-height: 46px;
    border-radius: 14px;
    font-weight: 950;
    cursor: pointer;
    padding: 0 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .ads-primary-btn {
    border: 0;
    color: #ffffff;
    background: linear-gradient(90deg, #2563eb 0%, #7c3aed 100%);
  }

  .ads-secondary-btn {
    background: #ffffff;
    color: #111827;
    border: 1px solid #d1d5db;
  }

  .ads-dark-btn,
  .ads-card-actions .dark {
    border: 0;
    background: #111827;
    color: #ffffff;
  }

  .ads-side {
    display: grid;
    gap: 16px;
    position: sticky;
    top: 16px;
  }

  .ads-preview-card,
  .ads-mini-card {
    padding: 18px;
  }

  .ads-preview-card h3 {
    margin: 12px 0 8px;
    font-size: 24px;
    font-weight: 950;
    letter-spacing: -0.03em;
  }

  .ads-preview-card p {
    margin: 0 0 14px;
    color: #64748b;
    line-height: 1.6;
  }

  .ads-preview-card img,
  .ads-preview-image {
    width: 100%;
    height: 220px;
    object-fit: cover;
    border-radius: 18px;
    border: 1px solid #e5e7eb;
    background: #f8fafc;
  }

  .ads-preview-image {
    display: grid;
    place-items: center;
    color: #64748b;
  }

  .ads-preview-image span {
    display: block;
    margin-top: 6px;
    font-weight: 800;
  }

  .ads-preview-target {
    margin-top: 14px;
    padding: 12px;
    border-radius: 14px;
    background: #f8fafc;
    color: #64748b;
    line-height: 1.5;
  }

  .ads-preview-target strong {
    color: #111827;
  }

  .ads-mini-card h4 {
    margin: 10px 0 14px;
    font-size: 18px;
    font-weight: 950;
  }

  .ads-mini-card p {
    margin: 8px 0;
    color: #475569;
  }

  .ads-mini-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0;
    border-top: 1px solid #eef2f7;
    color: #64748b;
  }

  .ads-mini-row strong {
    color: #111827;
  }

  .ads-campaigns {
    padding-bottom: 22px;
  }

  .ads-campaign-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    padding: 22px;
  }

  .ads-campaign-card {
    border: 1px solid #e5e7eb;
    border-radius: 22px;
    padding: 18px;
    background: #ffffff;
  }

  .ads-card-top {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .ads-card-top > div {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    justify-content: flex-end;
  }

  .ads-badge {
    display: inline-flex;
    padding: 6px 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 900;
  }

  .ads-badge.is-green {
    background: #dcfce7;
    color: #166534;
  }

  .ads-badge.is-yellow {
    background: #fef3c7;
    color: #92400e;
  }

  .ads-badge.is-blue {
    background: #e0e7ff;
    color: #3730a3;
  }

  .ads-badge.is-purple {
    background: #ede9fe;
    color: #6d28d9;
  }

  .ads-badge.is-red {
    background: #fee2e2;
    color: #b91c1c;
  }

  .ads-badge.is-gray {
    background: #f3f4f6;
    color: #374151;
  }

  .ads-campaign-card h3 {
    margin: 0 0 8px;
    color: #111827;
    font-size: 21px;
    font-weight: 950;
  }

  .ads-campaign-card p {
    color: #64748b;
    line-height: 1.6;
    margin: 0 0 14px;
  }

  .ads-campaign-metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 14px;
  }

  .ads-campaign-metrics div {
    background: #f8fafc;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    padding: 12px;
  }

  .ads-campaign-metrics span {
    display: block;
    color: #64748b;
    font-size: 11px;
    margin-bottom: 5px;
  }

  .ads-campaign-metrics strong {
    display: block;
    color: #111827;
    font-size: 15px;
  }

  .ads-campaign-info {
    display: grid;
    gap: 6px;
    color: #475569;
    font-size: 13px;
    line-height: 1.5;
  }

  .ads-card-actions button {
    background: #ffffff;
    color: #111827;
    border: 1px solid #d1d5db;
  }

  .ads-empty {
    margin: 22px;
    padding: 28px;
    border-radius: 20px;
    border: 1px dashed #cbd5e1;
    color: #64748b;
    text-align: center;
    font-weight: 800;
  }

  @media (max-width: 1180px) {
    .ads-layout,
    .ads-hero {
      grid-template-columns: 1fr;
    }

    .ads-side {
      position: static;
    }

    .ads-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 760px) {
    .ads-page {
      padding: 10px;
    }

    .ads-hero {
      border-radius: 22px;
      padding: 18px;
    }

    .ads-hero h1 {
      font-size: clamp(1.7rem, 9vw, 2.4rem);
      line-height: 1.08;
    }

    .ads-hero p {
      font-size: 14px;
    }

    .ads-stats,
    .ads-type-grid,
    .ads-two,
    .ads-four,
    .ads-bid-box,
    .ads-campaign-grid,
    .ads-campaign-metrics {
      grid-template-columns: 1fr;
    }

    .ads-section-head,
    .ads-form,
    .ads-preview-card,
    .ads-mini-card,
    .ads-campaign-grid {
      padding: 16px;
    }

    .ads-builder-card,
    .ads-side > *,
    .ads-campaigns,
    .ads-stats > div {
      border-radius: 20px;
    }

    .ads-upload-preview {
      grid-template-columns: 1fr;
    }

    .ads-upload-preview img {
      width: 100%;
      height: 180px;
    }

    .ads-actions-row button,
    .ads-card-actions button,
    .ads-primary-btn,
    .ads-secondary-btn,
    .ads-dark-btn {
      width: 100%;
    }

    .ads-preview-card img,
    .ads-preview-image {
      height: 180px;
    }
  }
`;