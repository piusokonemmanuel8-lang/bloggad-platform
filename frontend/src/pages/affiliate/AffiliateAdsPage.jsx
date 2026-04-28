import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const EMPTY_FORM = {
  ad_type: 'product',
  target_id: '',
  website_id: '',
  campaign_title: '',
  campaign_description: '',
  campaign_image: '',
  total_budget: '10',
  currency: 'USD',
};

const EMPTY_TOPUP = {
  campaign_id: '',
  amount: '10',
};

function money(value, currency = 'USD') {
  const amount = Number(value || 0);
  return `${currency === 'USD' ? '$' : currency + ' '}${amount.toFixed(4)}`;
}

function numberValue(value) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
}

function statusClass(status) {
  if (status === 'active') return 'active';
  if (status === 'pending') return 'pending';
  if (status === 'paused') return 'paused';
  if (status === 'exhausted') return 'exhausted';
  if (status === 'rejected') return 'rejected';
  return 'neutral';
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

export default function AffiliateAdsPage() {
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

  const currentRate = useMemo(() => {
    if (!settings) {
      return {
        view: 0,
        click: 0,
        minimum: 10,
        currency: 'USD',
      };
    }

    if (form.ad_type === 'product') {
      return {
        view: settings.product_cost_per_view,
        click: settings.product_cost_per_click,
        minimum: settings.minimum_budget,
        currency: settings.currency || 'USD',
      };
    }

    if (form.ad_type === 'post') {
      return {
        view: settings.post_cost_per_view,
        click: settings.post_cost_per_click,
        minimum: settings.minimum_budget,
        currency: settings.currency || 'USD',
      };
    }

    return {
      view: settings.website_cost_per_view,
      click: settings.website_cost_per_click,
      minimum: settings.minimum_budget,
      currency: settings.currency || 'USD',
    };
  }, [settings, form.ad_type]);

  const selectedTarget = useMemo(() => {
    if (form.ad_type === 'website') return website;

    if (form.ad_type === 'product') {
      return products.find((item) => Number(item.id) === Number(form.target_id));
    }

    return posts.find((item) => Number(item.id) === Number(form.target_id));
  }, [form.ad_type, form.target_id, website, products, posts]);

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

    setForm((current) => {
      if (current.ad_type === 'website' && nextWebsite?.id) {
        return {
          ...current,
          target_id: String(nextWebsite.id),
          website_id: String(nextWebsite.id),
          currency: nextSettings?.currency || 'USD',
          total_budget: String(nextSettings?.minimum_budget || 10),
        };
      }

      return {
        ...current,
        currency: nextSettings?.currency || 'USD',
        total_budget: String(nextSettings?.minimum_budget || current.total_budget || 10),
      };
    });

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
    setForm((current) => {
      if (nextType === 'website') {
        return {
          ...current,
          ad_type: nextType,
          target_id: website?.id ? String(website.id) : '',
          website_id: website?.id ? String(website.id) : '',
        };
      }

      return {
        ...current,
        ad_type: nextType,
        target_id: '',
        website_id: website?.id ? String(website.id) : current.website_id,
      };
    });
  }

  function resetForm() {
    setForm({
      ...EMPTY_FORM,
      total_budget: String(settings?.minimum_budget || 10),
      currency: settings?.currency || 'USD',
    });
    setEditingId(null);
    setNotice('');
    setError('');
  }

  function startEdit(campaign) {
    setEditingId(campaign.id);
    setForm({
      ad_type: campaign.ad_type || 'product',
      target_id: campaign.target_id || '',
      website_id: campaign.website_id || '',
      campaign_title: campaign.campaign_title || '',
      campaign_description: campaign.campaign_description || '',
      campaign_image: campaign.campaign_image || '',
      total_budget: String(campaign.total_budget || settings?.minimum_budget || '10'),
      currency: campaign.currency || settings?.currency || 'USD',
    });
    setNotice('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setNotice('');
      setError('');

      if (!form.target_id) {
        setError('Please choose the exact product, post, or website you want to promote.');
        return;
      }

      const payload = {
        ...form,
        target_id: Number(form.target_id),
        website_id: form.website_id ? Number(form.website_id) : null,
        total_budget: Number(form.total_budget),
      };

      if (editingId) {
        const { data } = await api.put(`/affiliate/ads/${editingId}`, payload);
        setNotice(data?.message || 'Ad updated successfully.');
      } else {
        const { data } = await api.post('/affiliate/ads', payload);
        setNotice(data?.message || 'Ad submitted successfully.');
      }

      resetForm();
      await Promise.all([fetchOptions(), fetchCampaigns()]);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save ad campaign.');
    } finally {
      setSaving(false);
    }
  }

  async function topUpCampaign(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setNotice('');
      setError('');

      if (!topup.campaign_id) {
        setError('Select an ad campaign to top up.');
        return;
      }

      const { data } = await api.post(`/affiliate/ads/${topup.campaign_id}/top-up`, {
        amount: Number(topup.amount),
        currency: settings?.currency || 'USD',
      });

      setNotice(data?.message || 'Ad balance topped up successfully.');
      setTopup({
        campaign_id: '',
        amount: String(settings?.minimum_budget || 10),
      });
      await fetchCampaigns();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to top up ad campaign.');
    } finally {
      setSaving(false);
    }
  }

  async function pauseCampaign(id) {
    try {
      setWorkingId(id);
      setNotice('');
      setError('');

      const { data } = await api.put(`/affiliate/ads/${id}/pause`);
      setNotice(data?.message || 'Ad paused successfully.');
      await fetchCampaigns();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to pause ad.');
    } finally {
      setWorkingId(null);
    }
  }

  async function resumeCampaign(id) {
    try {
      setWorkingId(id);
      setNotice('');
      setError('');

      const { data } = await api.put(`/affiliate/ads/${id}/resume`);
      setNotice(data?.message || 'Ad resumed successfully.');
      await fetchCampaigns();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to resume ad.');
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div className="afa-page">
      <style>{styles}</style>

      <section className="afa-hero">
        <div>
          <span className="afa-pill">Affiliate Ads Account</span>
          <h1>Promote your products, posts, or website.</h1>
          <p>
            Choose what you want to promote, select the exact item, set your budget,
            and submit for admin approval.
          </p>
        </div>

        <div className="afa-stats">
          <div className="afa-stat">
            <span>Total Budget</span>
            <strong>{money(stats.totalBudget, settings?.currency)}</strong>
          </div>
          <div className="afa-stat">
            <span>Remaining</span>
            <strong>{money(stats.remaining, settings?.currency)}</strong>
          </div>
          <div className="afa-stat">
            <span>Views</span>
            <strong>{stats.views}</strong>
          </div>
          <div className="afa-stat">
            <span>Clicks</span>
            <strong>{stats.clicks}</strong>
          </div>
        </div>
      </section>

      {(notice || error) && (
        <div className={error ? 'afa-alert error' : 'afa-alert success'}>
          {error || notice}
        </div>
      )}

      <section className="afa-grid">
        <div className="afa-left">
          <form onSubmit={handleSubmit} className="afa-card">
            <div className="afa-card-head">
              <div>
                <h2>{editingId ? 'Edit Ad' : 'Create New Ad'}</h2>
                <p>
                  Minimum budget: {money(currentRate.minimum, currentRate.currency)} · View:{' '}
                  {money(currentRate.view, currentRate.currency)} · Click:{' '}
                  {money(currentRate.click, currentRate.currency)}
                </p>
              </div>

              {editingId && (
                <button type="button" onClick={resetForm} className="afa-soft-btn">
                  Cancel
                </button>
              )}
            </div>

            <label className="afa-field">
              <span>What do you want to promote?</span>
              <select
                value={form.ad_type}
                onChange={(event) => changeAdType(event.target.value)}
                disabled={!!editingId}
              >
                <option value="product">Promote Product</option>
                <option value="post">Promote Post</option>
                <option value="website">Promote Website</option>
              </select>
            </label>

            {form.ad_type === 'product' && (
              <label className="afa-field">
                <span>Choose Product</span>
                <select
                  value={form.target_id}
                  onChange={(event) => updateForm('target_id', event.target.value)}
                  disabled={!!editingId}
                >
                  <option value="">Select one of your products</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      #{product.id} — {getTargetName(product)}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {form.ad_type === 'post' && (
              <label className="afa-field">
                <span>Choose Post</span>
                <select
                  value={form.target_id}
                  onChange={(event) => updateForm('target_id', event.target.value)}
                  disabled={!!editingId}
                >
                  <option value="">Select one of your posts</option>
                  {posts.map((post) => (
                    <option key={post.id} value={post.id}>
                      #{post.id} — {getTargetName(post)}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {form.ad_type === 'website' && (
              <div className="afa-selected-website">
                <span>Website Selected</span>
                <strong>{getWebsiteName(website)}</strong>
                <p>
                  Website promotion uses your affiliate website automatically. You do not need
                  to choose another target.
                </p>
              </div>
            )}

            {selectedTarget && (
              <div className="afa-preview-box">
                {selectedTarget.image ? <img src={selectedTarget.image} alt="" /> : <div>AD</div>}
                <section>
                  <span>Selected Target</span>
                  <strong>{getTargetName(selectedTarget)}</strong>
                  <small>ID: {selectedTarget.id}</small>
                </section>
              </div>
            )}

            <label className="afa-field">
              <span>Campaign Title</span>
              <input
                value={form.campaign_title}
                onChange={(event) => updateForm('campaign_title', event.target.value)}
                placeholder="Example: Promote my best product"
              />
            </label>

            <label className="afa-field">
              <span>Description</span>
              <textarea
                value={form.campaign_description}
                onChange={(event) => updateForm('campaign_description', event.target.value)}
                rows={5}
                placeholder="Short message users will see..."
              />
            </label>

            <label className="afa-field">
              <span>Campaign Image URL / Base64</span>
              <input
                value={form.campaign_image}
                onChange={(event) => updateForm('campaign_image', event.target.value)}
                placeholder="Optional ad image"
              />
            </label>

            {!editingId && (
              <div className="afa-row">
                <label className="afa-field">
                  <span>Budget</span>
                  <input
                    type="number"
                    min={Number(currentRate.minimum || 10)}
                    step="0.01"
                    value={form.total_budget}
                    onChange={(event) => updateForm('total_budget', event.target.value)}
                  />
                </label>

                <label className="afa-field">
                  <span>Currency</span>
                  <input value={currentRate.currency || 'USD'} disabled />
                </label>
              </div>
            )}

            <button type="submit" disabled={saving || loading} className="afa-primary-btn">
              {saving ? 'Saving...' : editingId ? 'Update Ad For Review' : 'Submit Ad + Mark Paid'}
            </button>
          </form>

          <form onSubmit={topUpCampaign} className="afa-card">
            <div className="afa-card-head">
              <div>
                <h2>Top Up Balance</h2>
                <p>Adding money does not require admin approval.</p>
              </div>
            </div>

            <label className="afa-field">
              <span>Select Campaign</span>
              <select
                value={topup.campaign_id}
                onChange={(event) =>
                  setTopup((current) => ({ ...current, campaign_id: event.target.value }))
                }
              >
                <option value="">Choose campaign</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    #{campaign.id} — {campaign.campaign_title}
                  </option>
                ))}
              </select>
            </label>

            <label className="afa-field">
              <span>Top Up Amount</span>
              <input
                type="number"
                min={Number(settings?.minimum_budget || 10)}
                step="0.01"
                value={topup.amount}
                onChange={(event) =>
                  setTopup((current) => ({ ...current, amount: event.target.value }))
                }
              />
            </label>

            <button type="submit" disabled={saving} className="afa-primary-btn">
              {saving ? 'Processing...' : 'Top Up + Mark Paid'}
            </button>
          </form>
        </div>

        <div className="afa-card">
          <div className="afa-card-head">
            <div>
              <h2>Your Ads</h2>
              <p>
                Active: {stats.active} · Pending review: {stats.pending} · CTR: {stats.ctr}%
              </p>
            </div>

            <button type="button" onClick={loadPage} className="afa-soft-btn">
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="afa-empty">Loading ads...</div>
          ) : campaigns.length === 0 ? (
            <div className="afa-empty">
              <strong>No ads yet</strong>
              <span>Create your first product, post, or website promotion.</span>
            </div>
          ) : (
            <div className="afa-list">
              {campaigns.map((campaign) => (
                <article key={campaign.id} className="afa-item">
                  <div className="afa-badges">
                    <span className={`afa-badge ${statusClass(campaign.status)}`}>
                      {campaign.status}
                    </span>
                    <span className={`afa-badge ${campaign.approval_status}`}>
                      {campaign.approval_status}
                    </span>
                    <span className="afa-badge type">{campaign.ad_type}</span>
                  </div>

                  <div className="afa-item-main">
                    {campaign.campaign_image ? (
                      <img src={campaign.campaign_image} alt={campaign.campaign_title} />
                    ) : (
                      <div className="afa-image-fallback">AD</div>
                    )}

                    <div>
                      <h3>{campaign.campaign_title}</h3>
                      <p>{campaign.campaign_description || 'No description added.'}</p>
                    </div>
                  </div>

                  <div className="afa-metrics">
                    <div>
                      <span>Budget</span>
                      <strong>{money(campaign.total_budget, campaign.currency)}</strong>
                    </div>
                    <div>
                      <span>Remaining</span>
                      <strong>{money(campaign.remaining_budget, campaign.currency)}</strong>
                    </div>
                    <div>
                      <span>Spent</span>
                      <strong>{money(campaign.total_spent, campaign.currency)}</strong>
                    </div>
                    <div>
                      <span>Views</span>
                      <strong>{campaign.total_views || 0}</strong>
                    </div>
                    <div>
                      <span>Clicks</span>
                      <strong>{campaign.total_clicks || 0}</strong>
                    </div>
                    <div>
                      <span>CTR</span>
                      <strong>
                        {numberValue(campaign.total_views) > 0
                          ? `${(
                              (numberValue(campaign.total_clicks) /
                                numberValue(campaign.total_views)) *
                              100
                            ).toFixed(2)}%`
                          : '0.00%'}
                      </strong>
                    </div>
                  </div>

                  <div className="afa-rates">
                    <span>Target ID: {campaign.target_id}</span>
                    <span>View cost: {money(campaign.cost_per_view, campaign.currency)}</span>
                    <span>Click cost: {money(campaign.cost_per_click, campaign.currency)}</span>
                  </div>

                  {campaign.rejection_reason && (
                    <div className="afa-rejection">
                      Rejection reason: {campaign.rejection_reason}
                    </div>
                  )}

                  <div className="afa-actions">
                    <button type="button" onClick={() => startEdit(campaign)}>
                      Edit
                    </button>

                    {campaign.status === 'paused' ? (
                      <button
                        type="button"
                        onClick={() => resumeCampaign(campaign.id)}
                        disabled={workingId === campaign.id}
                        className="primary"
                      >
                        {workingId === campaign.id ? 'Working...' : 'Resume'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => pauseCampaign(campaign.id)}
                        disabled={workingId === campaign.id}
                      >
                        {workingId === campaign.id ? 'Working...' : 'Pause'}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const styles = `
  .afa-page {
    min-height: calc(100vh - 120px);
    background:
      radial-gradient(circle at top left, rgba(14, 165, 233, 0.12), transparent 28%),
      radial-gradient(circle at top right, rgba(168, 85, 247, 0.12), transparent 24%),
      #f5f7fb;
    color: #0f172a;
    padding: 4px;
  }

  .afa-hero {
    display: grid;
    grid-template-columns: 1.08fr 0.92fr;
    gap: 28px;
    align-items: center;
    margin-bottom: 22px;
    padding: 34px;
    border-radius: 28px;
    background: linear-gradient(135deg, #07111f, #0f172a 48%, #020617);
    color: #ffffff;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
  }

  .afa-pill {
    display: inline-flex;
    margin-bottom: 16px;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(56, 189, 248, 0.18);
    color: #cffafe;
    border: 1px solid rgba(125, 211, 252, 0.35);
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.18em;
  }

  .afa-hero h1 {
    margin: 0;
    max-width: 720px;
    font-size: 38px;
    line-height: 1.05;
    font-weight: 950;
    letter-spacing: -0.04em;
    color: #ffffff;
  }

  .afa-hero p {
    margin: 16px 0 0;
    max-width: 720px;
    color: #e2e8f0;
    font-size: 15px;
    line-height: 1.75;
  }

  .afa-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .afa-stat {
    padding: 20px;
    min-height: 112px;
    border-radius: 22px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.18);
  }

  .afa-stat span {
    display: block;
    color: #f8fafc;
    font-size: 13px;
    font-weight: 900;
    margin-bottom: 10px;
  }

  .afa-stat strong {
    display: block;
    color: #ffffff;
    font-size: 28px;
    line-height: 1;
    font-weight: 950;
  }

  .afa-alert {
    margin-bottom: 18px;
    padding: 15px 18px;
    border-radius: 18px;
    font-size: 14px;
    font-weight: 800;
  }

  .afa-alert.success {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
  }

  .afa-alert.error {
    background: #fff1f2;
    border: 1px solid #fecdd3;
    color: #9f1239;
  }

  .afa-grid {
    display: grid;
    grid-template-columns: 0.82fr 1.18fr;
    gap: 22px;
    align-items: start;
  }

  .afa-left {
    display: grid;
    gap: 22px;
  }

  .afa-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  }

  .afa-card-head {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
    margin-bottom: 22px;
  }

  .afa-card h2 {
    margin: 0;
    color: #0f172a;
    font-size: 24px;
    font-weight: 950;
    letter-spacing: -0.03em;
  }

  .afa-card-head p {
    margin: 7px 0 0;
    color: #64748b;
    font-size: 14px;
    line-height: 1.5;
  }

  .afa-field {
    display: block;
    margin-bottom: 16px;
  }

  .afa-field span {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    color: #334155;
    font-weight: 900;
  }

  .afa-field input,
  .afa-field textarea,
  .afa-field select {
    width: 100%;
    border: 1px solid #dbe3ef;
    background: #f8fafc;
    border-radius: 16px;
    padding: 13px 14px;
    color: #0f172a;
    font-size: 14px;
    outline: none;
  }

  .afa-field textarea {
    resize: vertical;
    line-height: 1.7;
  }

  .afa-field input:focus,
  .afa-field textarea:focus,
  .afa-field select:focus {
    border-color: #38bdf8;
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.14);
  }

  .afa-selected-website {
    padding: 15px;
    border-radius: 18px;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    margin-bottom: 16px;
  }

  .afa-selected-website span {
    display: block;
    color: #0369a1;
    font-size: 12px;
    font-weight: 950;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .afa-selected-website strong {
    display: block;
    color: #0f172a;
    font-size: 17px;
    font-weight: 950;
  }

  .afa-selected-website p {
    margin: 7px 0 0;
    color: #475569;
    font-size: 13px;
    line-height: 1.6;
  }

  .afa-preview-box {
    display: grid;
    grid-template-columns: 70px 1fr;
    gap: 12px;
    align-items: center;
    padding: 12px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    margin-bottom: 16px;
  }

  .afa-preview-box img,
  .afa-preview-box > div {
    width: 70px;
    height: 70px;
    border-radius: 16px;
    object-fit: cover;
    background: #0f172a;
    color: #ffffff;
    display: grid;
    place-items: center;
    font-weight: 950;
  }

  .afa-preview-box section span {
    display: block;
    color: #64748b;
    font-size: 11px;
    font-weight: 950;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .afa-preview-box section strong {
    display: block;
    color: #0f172a;
    font-size: 15px;
    font-weight: 950;
  }

  .afa-preview-box section small {
    color: #64748b;
    font-size: 12px;
    font-weight: 800;
  }

  .afa-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  .afa-primary-btn,
  .afa-soft-btn,
  .afa-actions button {
    cursor: pointer;
    font-weight: 950;
    transition: 0.2s ease;
  }

  .afa-primary-btn {
    width: 100%;
    border: 0;
    margin-top: 4px;
    padding: 15px 18px;
    border-radius: 18px;
    background: linear-gradient(135deg, #06b6d4, #3b82f6);
    color: #ffffff;
    box-shadow: 0 14px 35px rgba(59, 130, 246, 0.25);
  }

  .afa-primary-btn:disabled,
  .afa-actions button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .afa-soft-btn {
    border: 1px solid #e2e8f0;
    padding: 11px 15px;
    border-radius: 999px;
    background: #f1f5f9;
    color: #0f172a;
  }

  .afa-empty {
    display: grid;
    gap: 8px;
    place-items: center;
    min-height: 260px;
    border-radius: 24px;
    background: #f8fafc;
    border: 1px dashed #cbd5e1;
    color: #64748b;
    text-align: center;
    padding: 34px;
  }

  .afa-empty strong {
    color: #0f172a;
    font-size: 18px;
  }

  .afa-list {
    display: grid;
    gap: 16px;
  }

  .afa-item {
    padding: 20px;
    border-radius: 24px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
  }

  .afa-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 14px;
  }

  .afa-badge {
    display: inline-flex;
    padding: 7px 10px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 950;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .afa-badge.active,
  .afa-badge.approved {
    background: #dcfce7;
    color: #166534;
  }

  .afa-badge.pending {
    background: #fef3c7;
    color: #92400e;
  }

  .afa-badge.paused {
    background: #e0f2fe;
    color: #075985;
  }

  .afa-badge.exhausted,
  .afa-badge.rejected {
    background: #ffe4e6;
    color: #be123c;
  }

  .afa-badge.neutral,
  .afa-badge.type {
    background: #e2e8f0;
    color: #334155;
  }

  .afa-item-main {
    display: grid;
    grid-template-columns: 92px 1fr;
    gap: 16px;
    align-items: start;
  }

  .afa-item-main img,
  .afa-image-fallback {
    width: 92px;
    height: 92px;
    border-radius: 18px;
    object-fit: cover;
    background: #0f172a;
    color: #ffffff;
  }

  .afa-image-fallback {
    display: grid;
    place-items: center;
    font-weight: 950;
    font-size: 24px;
  }

  .afa-item h3 {
    margin: 0;
    color: #0f172a;
    font-size: 19px;
    font-weight: 950;
  }

  .afa-item p {
    margin: 9px 0 0;
    color: #475569;
    font-size: 14px;
    line-height: 1.7;
  }

  .afa-metrics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 18px;
  }

  .afa-metrics div {
    border-radius: 16px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    padding: 12px;
  }

  .afa-metrics span {
    display: block;
    color: #64748b;
    font-size: 11px;
    font-weight: 900;
    margin-bottom: 6px;
  }

  .afa-metrics strong {
    display: block;
    color: #0f172a;
    font-size: 16px;
    font-weight: 950;
  }

  .afa-rates {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 14px;
    color: #64748b;
    font-size: 12px;
    font-weight: 800;
  }

  .afa-rejection {
    margin-top: 14px;
    padding: 12px 14px;
    border-radius: 16px;
    background: #fff1f2;
    border: 1px solid #fecdd3;
    color: #9f1239;
    font-size: 13px;
    font-weight: 800;
  }

  .afa-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 16px;
  }

  .afa-actions button {
    border: 1px solid #e2e8f0;
    padding: 10px 15px;
    border-radius: 999px;
    background: #ffffff;
    color: #0f172a;
  }

  .afa-actions button.primary {
    background: #0f172a;
    color: #ffffff;
    border-color: #0f172a;
  }

  @media (max-width: 1100px) {
    .afa-hero,
    .afa-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 700px) {
    .afa-page {
      padding: 0;
    }

    .afa-hero,
    .afa-card {
      border-radius: 20px;
      padding: 20px;
    }

    .afa-hero h1 {
      font-size: 28px;
    }

    .afa-stats,
    .afa-row,
    .afa-metrics,
    .afa-item-main,
    .afa-preview-box {
      grid-template-columns: 1fr;
    }

    .afa-item-main img,
    .afa-image-fallback,
    .afa-preview-box img,
    .afa-preview-box > div {
      width: 100%;
      height: 170px;
    }

    .afa-card-head {
      flex-direction: column;
    }
  }
`;