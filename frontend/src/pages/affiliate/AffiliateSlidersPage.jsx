import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  LayoutTemplate,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Trash2,
  UploadCloud,
  Video,
  Wallet,
} from 'lucide-react';
import api from '../../api/axios';
import validateSupgadUrl from '../../utils/validateSupgadUrl';

function emptyCampaign() {
  return {
    campaign_title: '',
    campaign_description: '',
    internal_note: '',
    media_type: 'image',
    image_url: '',
    video_url: '',
    poster_url: '',
    eyebrow_text: 'Sponsored',
    title: '',
    subtitle: '',
    promo_text: '',
    cta_label: 'Shop Now',
    cta_url: '',
    secondary_cta_label: '',
    secondary_cta_url: '',
    total_budget: '',
    daily_budget_cap: '',
    start_date: '',
    end_date: '',
    payment_reference: '',
  };
}

function formatMoney(value) {
  const number = Number(value || 0);
  return `$${number.toFixed(2)}`;
}

function formatNumber(value) {
  const number = Number(value || 0);
  return number.toLocaleString();
}

function getStatusClass(status = '') {
  const value = String(status).toLowerCase();

  if (value === 'active') return 'bha-status active';
  if (value === 'pending') return 'bha-status pending';
  if (value === 'paused') return 'bha-status paused';
  if (value === 'rejected') return 'bha-status rejected';
  if (value === 'exhausted' || value === 'ended') return 'bha-status ended';

  return 'bha-status neutral';
}

function getApprovalClass(status = '') {
  const value = String(status).toLowerCase();

  if (value === 'approved') return 'bha-approval approved';
  if (value === 'pending') return 'bha-approval pending';
  if (value === 'rejected') return 'bha-approval rejected';

  return 'bha-approval neutral';
}

function resolveUploadedUrl(data) {
  return (
    data?.url ||
    data?.file_url ||
    data?.fileUrl ||
    data?.image_url ||
    data?.video_url ||
    data?.secure_url ||
    data?.location ||
    data?.path ||
    data?.file?.url ||
    data?.file?.file_url ||
    data?.file?.path ||
    data?.data?.url ||
    data?.data?.file_url ||
    ''
  );
}

export default function AffiliateSlidersPage() {
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const posterInputRef = useRef(null);

  const [campaigns, setCampaigns] = useState([]);
  const [settings, setSettings] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [canCreate, setCanCreate] = useState(false);
  const [minimumRequired, setMinimumRequired] = useState(200);

  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [form, setForm] = useState(emptyCampaign());

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [topUpSaving, setTopUpSaving] = useState(false);
  const [fundingWallet, setFundingWallet] = useState(false);
  const [uploadingField, setUploadingField] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [walletFundAmount, setWalletFundAmount] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedCampaign = useMemo(
    () => campaigns.find((item) => String(item.id) === String(selectedCampaignId)) || null,
    [campaigns, selectedCampaignId]
  );

  const minimumBudget = Number(settings?.minimum_budget || minimumRequired || 200);
  const minimumDailyCap = Number(settings?.minimum_daily_cap || 20);
  const walletBalance = Number(wallet?.available_balance || 0);
  const createLocked = !selectedCampaignId && walletBalance < minimumBudget;

  const applyPageData = (data, keepSelection = true) => {
    const list = Array.isArray(data?.campaigns) ? data.campaigns : [];

    setCampaigns(list);
    setSettings(data?.settings || null);
    setWallet(data?.wallet || null);
    setAnalytics(data?.analytics || null);
    setWalletTransactions(Array.isArray(data?.wallet_transactions) ? data.wallet_transactions : []);
    setCanCreate(!!data?.can_create);
    setMinimumRequired(Number(data?.minimum_required || data?.settings?.minimum_budget || 200));

    if (keepSelection && selectedCampaignId) {
      const found = list.find((item) => String(item.id) === String(selectedCampaignId));

      if (found) {
        loadCampaignIntoForm(found);
        return;
      }
    }

    if (!selectedCampaignId && list.length) {
      loadCampaignIntoForm(list[0]);
    }
  };

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const { data } = await api.get('/api/affiliate/banner-home-ads');

      applyPageData(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load homepage slider ads');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const loadCampaignIntoForm = (campaign) => {
    setSelectedCampaignId(String(campaign.id));
    setForm({
      campaign_title: campaign.campaign_title || '',
      campaign_description: campaign.campaign_description || '',
      internal_note: campaign.internal_note || '',
      media_type: campaign.media_type || 'image',
      image_url: campaign.image_url || '',
      video_url: campaign.video_url || '',
      poster_url: campaign.poster_url || '',
      eyebrow_text: campaign.eyebrow_text || 'Sponsored',
      title: campaign.title || '',
      subtitle: campaign.subtitle || '',
      promo_text: campaign.promo_text || '',
      cta_label: campaign.cta_label || 'Shop Now',
      cta_url: campaign.cta_url || '',
      secondary_cta_label: campaign.secondary_cta_label || '',
      secondary_cta_url: campaign.secondary_cta_url || '',
      total_budget: campaign.total_budget || '',
      daily_budget_cap: campaign.daily_budget_cap || '',
      start_date: campaign.start_date ? String(campaign.start_date).slice(0, 10) : '',
      end_date: campaign.end_date ? String(campaign.end_date).slice(0, 10) : '',
      payment_reference: '',
    });
    setTopUpAmount('');
    setError('');
    setSuccess('');
  };

  const resetForNew = () => {
    setSelectedCampaignId('');
    setForm({
      ...emptyCampaign(),
      total_budget: minimumBudget,
    });
    setTopUpAmount('');
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

  const handleLocalUpload = async (event, targetField) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploadingField(targetField);
      setError('');
      setSuccess('');

      const uploadForm = new FormData();
      uploadForm.append('file', file);
      uploadForm.append('type', targetField);
      uploadForm.append('folder', 'banner-home-ads');

      const { data } = await api.post('/api/uploads', uploadForm, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedUrl = resolveUploadedUrl(data);

      if (!uploadedUrl) {
        throw new Error('Upload completed, but no file URL was returned by the server.');
      }

      setForm((prev) => ({
        ...prev,
        [targetField]: uploadedUrl,
      }));

      setSuccess('File uploaded successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to upload file');
    } finally {
      setUploadingField('');
      event.target.value = '';
    }
  };

  const refreshCampaigns = async (targetId = null) => {
    const { data } = await api.get('/api/affiliate/banner-home-ads');
    const list = Array.isArray(data?.campaigns) ? data.campaigns : [];

    setCampaigns(list);
    setSettings(data?.settings || null);
    setWallet(data?.wallet || null);
    setAnalytics(data?.analytics || null);
    setWalletTransactions(Array.isArray(data?.wallet_transactions) ? data.wallet_transactions : []);
    setCanCreate(!!data?.can_create);
    setMinimumRequired(Number(data?.minimum_required || data?.settings?.minimum_budget || 200));

    const found = list.find((item) => String(item.id) === String(targetId || selectedCampaignId));

    if (found) {
      loadCampaignIntoForm(found);
    } else if (!list.length) {
      resetForNew();
    }
  };

  const handleFundWallet = async () => {
    const amount = Number(walletFundAmount || 0);

    if (!amount || amount <= 0) {
      setError('Enter a valid wallet funding amount');
      return;
    }

    try {
      setFundingWallet(true);
      setError('');
      setSuccess('');

      const { data } = await api.post('/api/affiliate/banner-home-ads/wallet/fund', {
        amount,
        note: 'Affiliate funded homepage slider ads wallet',
      });

      setWallet(data?.wallet || null);
      setWalletTransactions(Array.isArray(data?.wallet_transactions) ? data.wallet_transactions : []);
      setWalletFundAmount('');
      setSuccess(data?.message || 'Wallet funded successfully');

      await refreshCampaigns(selectedCampaignId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fund homepage slider ads wallet');
    } finally {
      setFundingWallet(false);
    }
  };

  const validateForm = () => {
    if (!form.campaign_title.trim()) {
      throw new Error('Campaign title is required');
    }

    if (!form.title.trim()) {
      throw new Error('Slider headline is required');
    }

    if (!form.cta_label.trim()) {
      throw new Error('CTA label is required');
    }

    const urlResult = validateSupgadUrl(form.cta_url, {
      required: true,
      allowEmpty: false,
      fieldName: 'CTA URL',
    });

    if (!urlResult.ok) {
      throw new Error(urlResult.message);
    }

    if (form.secondary_cta_url.trim()) {
      const secondaryResult = validateSupgadUrl(form.secondary_cta_url, {
        required: false,
        allowEmpty: true,
        fieldName: 'Secondary CTA URL',
      });

      if (!secondaryResult.ok) {
        throw new Error(secondaryResult.message);
      }
    }

    if (form.media_type === 'image' && !form.image_url.trim()) {
      throw new Error('Image URL is required for image slider ads');
    }

    if (form.media_type === 'video' && !form.video_url.trim()) {
      throw new Error('Video URL is required for video slider ads');
    }

    if (!selectedCampaignId && walletBalance < minimumBudget) {
      throw new Error(`Fund your Banner Home Ads Wallet with at least ${formatMoney(minimumBudget)} before creating a slider ad`);
    }

    if (!selectedCampaignId && Number(form.total_budget || 0) < minimumBudget) {
      throw new Error(`Minimum homepage slider ad campaign budget is ${formatMoney(minimumBudget)}`);
    }

    if (!selectedCampaignId && Number(form.total_budget || 0) > walletBalance) {
      throw new Error(`Campaign budget cannot be higher than your wallet balance of ${formatMoney(walletBalance)}`);
    }

    if (form.daily_budget_cap && Number(form.daily_budget_cap || 0) < minimumDailyCap) {
      throw new Error(`Minimum daily cap is ${formatMoney(minimumDailyCap)}`);
    }
  };

  const buildPayload = () => ({
    campaign_title: form.campaign_title,
    campaign_description: form.campaign_description,
    internal_note: form.internal_note,
    media_type: form.media_type,
    image_url: form.image_url,
    video_url: form.media_type === 'video' ? form.video_url : '',
    poster_url: form.poster_url,
    eyebrow_text: form.eyebrow_text,
    title: form.title,
    subtitle: form.subtitle,
    promo_text: form.promo_text,
    cta_label: form.cta_label,
    cta_url: form.cta_url,
    secondary_cta_label: form.secondary_cta_label,
    secondary_cta_url: form.secondary_cta_url,
    total_budget: Number(form.total_budget || minimumBudget),
    daily_budget_cap: form.daily_budget_cap === '' ? null : Number(form.daily_budget_cap || 0),
    start_date: form.start_date || null,
    end_date: form.end_date || null,
    payment_reference: form.payment_reference,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      validateForm();

      const payload = buildPayload();
      let response;

      if (selectedCampaignId) {
        response = await api.put(`/api/affiliate/banner-home-ads/${selectedCampaignId}`, payload);
      } else {
        response = await api.post('/api/affiliate/banner-home-ads', payload);
      }

      const savedCampaign = response?.data?.campaign;

      if (response?.data?.wallet) setWallet(response.data.wallet);
      if (response?.data?.analytics) setAnalytics(response.data.analytics);
      if (Array.isArray(response?.data?.wallet_transactions)) {
        setWalletTransactions(response.data.wallet_transactions);
      }

      if (savedCampaign?.id) {
        await refreshCampaigns(savedCampaign.id);
      }

      setSuccess(response?.data?.message || 'Homepage slider ad saved successfully');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save homepage slider ad');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusAction = async (action) => {
    if (!selectedCampaignId) return;

    try {
      setStatusSaving(true);
      setError('');
      setSuccess('');

      const { data } = await api.put(`/api/affiliate/banner-home-ads/${selectedCampaignId}/status`, {
        action,
      });

      if (data?.wallet) setWallet(data.wallet);
      if (data?.analytics) setAnalytics(data.analytics);

      await refreshCampaigns(selectedCampaignId);
      setSuccess(data?.message || 'Homepage slider ad status updated');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update homepage slider ad status');
    } finally {
      setStatusSaving(false);
    }
  };

  const handleTopUp = async () => {
    if (!selectedCampaignId) return;

    const amount = Number(topUpAmount || 0);

    if (!amount || amount <= 0) {
      setError('Enter a valid top-up amount');
      return;
    }

    if (amount > walletBalance) {
      setError(`Top-up amount cannot be higher than your wallet balance of ${formatMoney(walletBalance)}`);
      return;
    }

    try {
      setTopUpSaving(true);
      setError('');
      setSuccess('');

      const { data } = await api.post(`/api/affiliate/banner-home-ads/${selectedCampaignId}/top-up`, {
        amount,
        note: 'Affiliate homepage slider ad top-up from wallet',
      });

      if (data?.wallet) setWallet(data.wallet);
      if (data?.analytics) setAnalytics(data.analytics);
      if (Array.isArray(data?.wallet_transactions)) setWalletTransactions(data.wallet_transactions);

      await refreshCampaigns(selectedCampaignId);
      setTopUpAmount('');
      setSuccess(data?.message || 'Homepage slider ad topped up successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to top up homepage slider ad');
    } finally {
      setTopUpSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCampaignId) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const { data } = await api.delete(`/api/affiliate/banner-home-ads/${selectedCampaignId}`);

      if (data?.wallet) setWallet(data.wallet);
      if (data?.analytics) setAnalytics(data.analytics);

      await refreshCampaigns();
      setSuccess(data?.message || 'Homepage slider ad deleted successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete homepage slider ad');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bha-page">
        <style>{styles}</style>

        <div className="bha-loading-wrap">
          <div className="bha-loading-card">
            <div className="bha-spinner" />
            <p>Loading homepage slider ads...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bha-page">
      <style>{styles}</style>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="bha-hidden-file"
        onChange={(event) => handleLocalUpload(event, 'image_url')}
      />

      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="bha-hidden-file"
        onChange={(event) => handleLocalUpload(event, 'video_url')}
      />

      <input
        ref={posterInputRef}
        type="file"
        accept="image/*"
        className="bha-hidden-file"
        onChange={(event) => handleLocalUpload(event, 'poster_url')}
      />

      <section className="bha-hero">
        <div>
          <div className="bha-badge">Homepage Slider Ads</div>
          <h1 className="bha-title">Banner Home Ads</h1>
          <p className="bha-subtitle">
            Fund your Banner Home Ads Wallet, create image or video homepage slider ads, and track views,
            clicks, budget, and spend from one page.
          </p>
        </div>

        <div className="bha-hero-actions">
          <button
            type="button"
            className="bha-btn secondary"
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <button type="button" className="bha-btn primary" onClick={resetForNew}>
            <Plus size={16} />
            New Slider Ad
          </button>
        </div>
      </section>

      <section className="bha-wallet-grid">
        <div className="bha-wallet-card">
          <div className="bha-wallet-icon">
            <Wallet size={26} />
          </div>

          <div>
            <span>Banner Home Ads Wallet</span>
            <strong>{formatMoney(wallet?.available_balance)}</strong>
            <p>
              Minimum required to create: <b>{formatMoney(minimumBudget)}</b>
            </p>
          </div>

          <div className={walletBalance >= minimumBudget ? 'bha-wallet-ready' : 'bha-wallet-locked'}>
            {walletBalance >= minimumBudget ? 'Ready to create' : 'Fund wallet to create'}
          </div>
        </div>

        <div className="bha-wallet-fund-card">
          <label>
            <span>Fund Wallet</span>
            <input
              type="number"
              min="1"
              step="0.01"
              value={walletFundAmount}
              onChange={(event) => setWalletFundAmount(event.target.value)}
              placeholder="Enter amount, e.g. 500 or 1000"
            />
          </label>

          <button type="button" className="bha-btn primary" onClick={handleFundWallet} disabled={fundingWallet}>
            <Wallet size={16} />
            {fundingWallet ? 'Funding...' : 'Fund Wallet'}
          </button>
        </div>
      </section>

      <section className="bha-settings-strip">
        <div className="bha-setting-card">
          <Settings size={18} />
          <span>Minimum Budget</span>
          <strong>{formatMoney(minimumBudget)}</strong>
        </div>

        <div className="bha-setting-card">
          <Wallet size={18} />
          <span>Cost Per View</span>
          <strong>{formatMoney(settings?.cost_per_view || 0)}</strong>
        </div>

        <div className="bha-setting-card">
          <Wallet size={18} />
          <span>Cost Per Click</span>
          <strong>{formatMoney(settings?.cost_per_click || 0)}</strong>
        </div>

        <div className="bha-setting-card">
          <LayoutTemplate size={18} />
          <span>Slider Position</span>
          <strong>Slot {settings?.ad_insert_position || 5}</strong>
        </div>
      </section>

      <section className="bha-analytics-strip">
        <div className="bha-analytics-card">
          <span>Total Funded</span>
          <strong>{formatMoney(wallet?.total_funded)}</strong>
        </div>

        <div className="bha-analytics-card">
          <span>Total Spent</span>
          <strong>{formatMoney(analytics?.total_spent || wallet?.total_spent)}</strong>
        </div>

        <div className="bha-analytics-card">
          <span>Total Views</span>
          <strong>{formatNumber(analytics?.total_views)}</strong>
        </div>

        <div className="bha-analytics-card">
          <span>Total Clicks</span>
          <strong>{formatNumber(analytics?.total_clicks)}</strong>
        </div>

        <div className="bha-analytics-card">
          <span>Active Ads</span>
          <strong>{formatNumber(analytics?.active_campaigns)}</strong>
        </div>

        <div className="bha-analytics-card">
          <span>Pending Ads</span>
          <strong>{formatNumber(analytics?.pending_campaigns)}</strong>
        </div>
      </section>

      {error ? (
        <div className="bha-alert error bha-page-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      {success ? (
        <div className="bha-alert success bha-page-alert">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      ) : null}

      <section className="bha-grid">
        <aside className="bha-panel">
          <div className="bha-panel-head">
            <div>
              <p>Campaign list</p>
              <h2>Your Slider Ads</h2>
            </div>
          </div>

          {campaigns.length ? (
            <div className="bha-campaign-list">
              {campaigns.map((campaign) => {
                const active = String(selectedCampaignId) === String(campaign.id);

                return (
                  <button
                    key={campaign.id}
                    type="button"
                    className={`bha-campaign-card${active ? ' active' : ''}`}
                    onClick={() => loadCampaignIntoForm(campaign)}
                  >
                    <div className="bha-campaign-top">
                      <div>
                        <h3>{campaign.campaign_title || 'Untitled Campaign'}</h3>
                        <p>{campaign.media_type === 'video' ? 'Video slider ad' : 'Image slider ad'}</p>
                      </div>

                      <span className={getStatusClass(campaign.status)}>
                        {campaign.status || '-'}
                      </span>
                    </div>

                    <div className="bha-campaign-metrics">
                      <span>Views: {campaign.total_views || 0}</span>
                      <span>Clicks: {campaign.total_clicks || 0}</span>
                      <span>Left: {formatMoney(campaign.remaining_budget)}</span>
                    </div>

                    <span className={getApprovalClass(campaign.approval_status)}>
                      {campaign.approval_status || 'pending'}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bha-empty">
              <LayoutTemplate size={28} />
              <strong>No homepage slider ads yet.</strong>
              <span>Create your first slider ad.</span>
            </div>
          )}

          {walletTransactions.length ? (
            <div className="bha-wallet-history">
              <h3>Wallet History</h3>

              <div className="bha-wallet-history-list">
                {walletTransactions.slice(0, 8).map((item) => (
                  <div key={item.id} className="bha-wallet-history-item">
                    <div>
                      <strong>{String(item.transaction_type || '').replace(/_/g, ' ')}</strong>
                      <span>{item.note || 'Wallet transaction'}</span>
                    </div>

                    <em>{formatMoney(item.amount)}</em>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </aside>

        <main className="bha-main-stack">
          <section className="bha-panel">
            <div className="bha-panel-head">
              <div>
                <p>Editor</p>
                <h2>{selectedCampaignId ? 'Edit Slider Ad' : 'Create Slider Ad'}</h2>
              </div>
            </div>

            {createLocked ? (
              <div className="bha-create-lock">
                <AlertCircle size={18} />
                <span>
                  Your wallet balance is {formatMoney(walletBalance)}. Fund at least {formatMoney(minimumBudget)}
                  before creating a homepage slider ad.
                </span>
              </div>
            ) : null}

            <form className="bha-form" onSubmit={handleSubmit}>
              <div className="bha-form-grid">
                <label className="bha-field">
                  <span>Campaign Title</span>
                  <input
                    name="campaign_title"
                    value={form.campaign_title}
                    onChange={handleChange}
                    placeholder="Campaign title"
                  />
                </label>

                <label className="bha-field">
                  <span>Media Type</span>
                  <select name="media_type" value={form.media_type} onChange={handleChange}>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </label>

                <label className="bha-field">
                  <span>Eyebrow Text</span>
                  <input
                    name="eyebrow_text"
                    value={form.eyebrow_text}
                    onChange={handleChange}
                    placeholder="Sponsored"
                  />
                </label>

                <label className="bha-field">
                  <span>Promo Text</span>
                  <input
                    name="promo_text"
                    value={form.promo_text}
                    onChange={handleChange}
                    placeholder="Limited offer"
                  />
                </label>

                <label className="bha-field bha-field-full">
                  <span>Main Headline</span>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Your slider headline"
                  />
                </label>

                <label className="bha-field bha-field-full">
                  <span>Subtitle</span>
                  <textarea
                    name="subtitle"
                    value={form.subtitle}
                    onChange={handleChange}
                    placeholder="Short text to support your slider headline"
                    rows={3}
                  />
                </label>

                <label className="bha-field bha-field-full">
                  <span>Campaign Description</span>
                  <textarea
                    name="campaign_description"
                    value={form.campaign_description}
                    onChange={handleChange}
                    placeholder="Describe this ad for admin review"
                    rows={3}
                  />
                </label>

                {form.media_type === 'image' ? (
                  <div className="bha-field bha-field-full">
                    <span>
                      <ImageIcon size={15} />
                      Image Upload
                    </span>

                    <div className="bha-upload-row">
                      <input
                        name="image_url"
                        value={form.image_url}
                        onChange={handleChange}
                        placeholder="Image URL or upload from device"
                      />

                      <button
                        type="button"
                        className="bha-upload-btn"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={uploadingField === 'image_url'}
                      >
                        <UploadCloud size={16} />
                        {uploadingField === 'image_url' ? 'Uploading...' : 'Pick Image'}
                      </button>
                    </div>

                    <small>Upload from mobile or computer, or paste an image URL manually.</small>
                  </div>
                ) : (
                  <>
                    <div className="bha-field bha-field-full">
                      <span>
                        <Video size={15} />
                        Video Upload
                      </span>

                      <div className="bha-upload-row">
                        <input
                          name="video_url"
                          value={form.video_url}
                          onChange={handleChange}
                          placeholder="YouTube, VideoGad, direct video URL, or upload from device"
                        />

                        <button
                          type="button"
                          className="bha-upload-btn"
                          onClick={() => videoInputRef.current?.click()}
                          disabled={uploadingField === 'video_url'}
                        >
                          <UploadCloud size={16} />
                          {uploadingField === 'video_url' ? 'Uploading...' : 'Pick Video'}
                        </button>
                      </div>

                      <small>Upload MP4/WebM from device, or paste YouTube/VideoGad/direct video URL.</small>
                    </div>

                    <div className="bha-field bha-field-full">
                      <span>Poster Image Upload</span>

                      <div className="bha-upload-row">
                        <input
                          name="poster_url"
                          value={form.poster_url}
                          onChange={handleChange}
                          placeholder="Poster image URL or upload from device"
                        />

                        <button
                          type="button"
                          className="bha-upload-btn"
                          onClick={() => posterInputRef.current?.click()}
                          disabled={uploadingField === 'poster_url'}
                        >
                          <UploadCloud size={16} />
                          {uploadingField === 'poster_url' ? 'Uploading...' : 'Pick Poster'}
                        </button>
                      </div>

                      <small>This image shows before the video loads and inside the preview.</small>
                    </div>
                  </>
                )}

                <label className="bha-field">
                  <span>CTA Label</span>
                  <input
                    name="cta_label"
                    value={form.cta_label}
                    onChange={handleChange}
                    placeholder="Shop Now"
                  />
                </label>

                <label className="bha-field">
                  <span>CTA URL</span>
                  <input
                    name="cta_url"
                    value={form.cta_url}
                    onChange={handleChange}
                    placeholder="https://supgad.com/..."
                  />
                </label>

                <label className="bha-field">
                  <span>Secondary CTA Label</span>
                  <input
                    name="secondary_cta_label"
                    value={form.secondary_cta_label}
                    onChange={handleChange}
                    placeholder="Learn More"
                  />
                </label>

                <label className="bha-field">
                  <span>Secondary CTA URL</span>
                  <input
                    name="secondary_cta_url"
                    value={form.secondary_cta_url}
                    onChange={handleChange}
                    placeholder="https://supgad.com/..."
                  />
                </label>

                {!selectedCampaignId ? (
                  <label className="bha-field">
                    <span>Campaign Budget From Wallet</span>
                    <input
                      type="number"
                      min={minimumBudget}
                      max={walletBalance}
                      step="0.01"
                      name="total_budget"
                      value={form.total_budget}
                      onChange={handleChange}
                      placeholder={String(minimumBudget)}
                    />
                    <small>Available wallet balance: {formatMoney(walletBalance)}</small>
                  </label>
                ) : null}

                <label className="bha-field">
                  <span>Daily Budget Cap</span>
                  <input
                    type="number"
                    min={minimumDailyCap}
                    step="0.01"
                    name="daily_budget_cap"
                    value={form.daily_budget_cap}
                    onChange={handleChange}
                    placeholder={`Optional, min ${minimumDailyCap}`}
                  />
                </label>

                <label className="bha-field">
                  <span>Start Date</span>
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                  />
                </label>

                <label className="bha-field">
                  <span>End Date</span>
                  <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                  />
                </label>

                {!selectedCampaignId ? (
                  <label className="bha-field bha-field-full">
                    <span>Payment Reference</span>
                    <input
                      name="payment_reference"
                      value={form.payment_reference}
                      onChange={handleChange}
                      placeholder="Optional payment reference"
                    />
                  </label>
                ) : null}
              </div>

              <div className="bha-actions">
                <button
                  type="submit"
                  className="bha-btn primary"
                  disabled={saving || !!uploadingField || createLocked}
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : selectedCampaignId ? 'Update Ad' : 'Submit For Approval'}
                </button>

                {selectedCampaignId && selectedCampaign?.status === 'active' ? (
                  <button
                    type="button"
                    className="bha-btn secondary"
                    disabled={statusSaving}
                    onClick={() => handleStatusAction('pause')}
                  >
                    <Pause size={16} />
                    {statusSaving ? 'Updating...' : 'Pause'}
                  </button>
                ) : null}

                {selectedCampaignId && selectedCampaign?.status === 'paused' ? (
                  <button
                    type="button"
                    className="bha-btn secondary"
                    disabled={statusSaving}
                    onClick={() => handleStatusAction('resume')}
                  >
                    <Play size={16} />
                    {statusSaving ? 'Updating...' : 'Resume'}
                  </button>
                ) : null}

                {selectedCampaignId ? (
                  <button
                    type="button"
                    className="bha-btn danger"
                    disabled={saving}
                    onClick={handleDelete}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          {selectedCampaignId ? (
            <section className="bha-panel">
              <div className="bha-panel-head">
                <div>
                  <p>Funding</p>
                  <h2>Top Up Campaign From Wallet</h2>
                </div>
              </div>

              <div className="bha-topup-row">
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={walletBalance}
                  value={topUpAmount}
                  onChange={(event) => setTopUpAmount(event.target.value)}
                  placeholder={`Top-up amount, wallet balance ${formatMoney(walletBalance)}`}
                />

                <button type="button" className="bha-btn primary" onClick={handleTopUp} disabled={topUpSaving}>
                  <Wallet size={16} />
                  {topUpSaving ? 'Adding...' : 'Top Up'}
                </button>
              </div>
            </section>
          ) : null}
        </main>
      </section>

      <section className="bha-panel bha-preview-footer-panel">
        <div className="bha-panel-head">
          <div>
            <p>Live Preview</p>
            <h2>Homepage Slider Banner Preview</h2>
          </div>
        </div>

        <div className="bha-footer-preview">
          <div className="bha-footer-preview-left">
            <span className="bha-preview-eyebrow">{form.eyebrow_text || 'Sponsored'}</span>

            <h3>{form.title || 'Your slider headline appears here'}</h3>

            <p>{form.subtitle || 'Your slider subtitle will appear here as users view the homepage banner.'}</p>

            <div className="bha-footer-preview-actions">
              <span>{form.cta_label || 'Shop Now'}</span>
              {form.secondary_cta_label ? <em>{form.secondary_cta_label}</em> : null}
              {form.promo_text ? <strong>{form.promo_text}</strong> : null}
            </div>
          </div>

          <div className="bha-footer-preview-media">
            <div className="bha-footer-preview-shape bha-footer-preview-shape-one" />
            <div className="bha-footer-preview-shape bha-footer-preview-shape-two" />

            {form.media_type === 'video' ? (
              form.poster_url ? (
                <img src={form.poster_url} alt="Video poster preview" />
              ) : (
                <div className="bha-preview-video-box">
                  <Video size={42} />
                  <span>Video Preview</span>
                </div>
              )
            ) : form.image_url ? (
              <img src={form.image_url} alt="Slider ad preview" />
            ) : (
              <div className="bha-preview-video-box">
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
  * {
    box-sizing: border-box;
  }

  .bha-page {
    width: 100%;
  }

  .bha-hidden-file {
    display: none;
  }

  .bha-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .bha-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .bha-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: bhaSpin 0.8s linear infinite;
  }

  @keyframes bhaSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: bhaSpin 0.8s linear infinite;
  }

  .bha-hero {
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

  .bha-badge {
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

  .bha-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .bha-subtitle {
    margin: 12px 0 0;
    max-width: 800px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .bha-hero-actions,
  .bha-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .bha-wallet-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
    gap: 16px;
    margin-bottom: 20px;
  }

  .bha-wallet-card,
  .bha-wallet-fund-card {
    background: #111827;
    color: #ffffff;
    border-radius: 26px;
    padding: 22px;
    box-shadow: 0 20px 45px rgba(17, 24, 39, 0.18);
  }

  .bha-wallet-card {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 18px;
  }

  .bha-wallet-icon {
    width: 58px;
    height: 58px;
    border-radius: 20px;
    display: grid;
    place-items: center;
    background: rgba(255,255,255,0.12);
  }

  .bha-wallet-card span,
  .bha-wallet-fund-card span {
    display: block;
    font-size: 13px;
    font-weight: 800;
    color: rgba(255,255,255,0.72);
    margin-bottom: 6px;
  }

  .bha-wallet-card strong {
    display: block;
    font-size: clamp(30px, 4vw, 46px);
    line-height: 1;
    font-weight: 950;
  }

  .bha-wallet-card p {
    margin: 8px 0 0;
    color: rgba(255,255,255,0.72);
    font-weight: 700;
  }

  .bha-wallet-ready,
  .bha-wallet-locked {
    border-radius: 999px;
    padding: 10px 14px;
    font-size: 12px;
    font-weight: 900;
    white-space: nowrap;
  }

  .bha-wallet-ready {
    background: #ecfdf3;
    color: #027a48;
  }

  .bha-wallet-locked {
    background: #fff7ed;
    color: #b54708;
  }

  .bha-wallet-fund-card {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    align-items: end;
  }

  .bha-wallet-fund-card label {
    display: grid;
    gap: 8px;
  }

  .bha-wallet-fund-card input {
    width: 100%;
    min-height: 48px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.18);
    background: rgba(255,255,255,0.1);
    color: #ffffff;
    padding: 0 14px;
    outline: none;
    font-weight: 800;
  }

  .bha-wallet-fund-card input::placeholder {
    color: rgba(255,255,255,0.55);
  }

  .bha-settings-strip,
  .bha-analytics-strip {
    display: grid;
    gap: 14px;
    margin-bottom: 20px;
  }

  .bha-settings-strip {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .bha-analytics-strip {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .bha-setting-card,
  .bha-analytics-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    padding: 16px;
    display: grid;
    gap: 8px;
    color: #111827;
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.04);
  }

  .bha-setting-card svg {
    color: #ff2b05;
  }

  .bha-setting-card span,
  .bha-analytics-card span {
    color: #6b7280;
    font-size: 13px;
    font-weight: 700;
  }

  .bha-setting-card strong,
  .bha-analytics-card strong {
    font-size: 22px;
    font-weight: 900;
  }

  .bha-page-alert {
    margin-bottom: 16px;
  }

  .bha-grid {
    display: grid;
    grid-template-columns: minmax(260px, 0.7fr) minmax(520px, 1.8fr);
    gap: 20px;
    align-items: start;
  }

  .bha-main-stack {
    display: grid;
    gap: 20px;
  }

  .bha-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .bha-preview-footer-panel {
    margin-top: 20px;
  }

  .bha-panel-head {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .bha-panel-head p {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .bha-panel-head h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
  }

  .bha-btn,
  .bha-upload-btn {
    height: 46px;
    padding: 0 16px;
    border-radius: 14px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    color: #111827;
    font-size: 14px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: 0.2s ease;
    white-space: nowrap;
  }

  .bha-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .bha-btn.secondary {
    background: #ffffff;
    color: #111827;
  }

  .bha-btn.danger {
    background: #fff1f2;
    color: #be123c;
    border-color: #fecdd3;
  }

  .bha-btn:disabled,
  .bha-upload-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .bha-upload-btn {
    background: #111827;
    border-color: #111827;
    color: #ffffff;
    min-width: 150px;
  }

  .bha-upload-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
  }

  .bha-field small {
    color: #64748b;
    font-size: 12px;
    font-weight: 700;
  }

  .bha-create-lock {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    background: #fff7ed;
    color: #9a3412;
    border: 1px solid #fed7aa;
    border-radius: 18px;
    padding: 14px 16px;
    margin-bottom: 18px;
    font-weight: 800;
    line-height: 1.5;
  }

  .bha-campaign-list {
    display: grid;
    gap: 12px;
  }

  .bha-campaign-card {
    width: 100%;
    padding: 16px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    cursor: pointer;
    text-align: left;
    display: grid;
    gap: 12px;
  }

  .bha-campaign-card.active {
    border-color: #111827;
    background: #ffffff;
    box-shadow: inset 0 0 0 1px #111827;
  }

  .bha-campaign-top {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  .bha-campaign-top h3 {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 900;
    color: #111827;
  }

  .bha-campaign-top p {
    margin: 0;
    color: #6b7280;
    font-size: 13px;
  }

  .bha-campaign-metrics {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .bha-campaign-metrics span {
    font-size: 11px;
    font-weight: 800;
    color: #334155;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    padding: 6px 8px;
    border-radius: 999px;
  }

  .bha-status,
  .bha-approval {
    display: inline-flex;
    width: fit-content;
    align-items: center;
    justify-content: center;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 900;
    text-transform: capitalize;
    border: 1px solid transparent;
    white-space: nowrap;
  }

  .bha-status.active,
  .bha-approval.approved {
    background: #ecfdf3;
    color: #027a48;
    border-color: #abefc6;
  }

  .bha-status.pending,
  .bha-approval.pending {
    background: #fff7ed;
    color: #b54708;
    border-color: #fed7aa;
  }

  .bha-status.paused {
    background: #eff6ff;
    color: #1d4ed8;
    border-color: #bfdbfe;
  }

  .bha-status.rejected,
  .bha-approval.rejected {
    background: #fff1f2;
    color: #be123c;
    border-color: #fecdd3;
  }

  .bha-status.ended {
    background: #f1f5f9;
    color: #475569;
    border-color: #cbd5e1;
  }

  .bha-status.neutral,
  .bha-approval.neutral {
    background: #eef2f7;
    color: #344054;
    border-color: #dbe2ea;
  }

  .bha-wallet-history {
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid #edf2f7;
  }

  .bha-wallet-history h3 {
    margin: 0 0 12px;
    color: #111827;
    font-size: 16px;
    font-weight: 900;
  }

  .bha-wallet-history-list {
    display: grid;
    gap: 10px;
  }

  .bha-wallet-history-item {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 14px;
    padding: 12px;
  }

  .bha-wallet-history-item strong {
    display: block;
    color: #111827;
    font-size: 13px;
    text-transform: capitalize;
  }

  .bha-wallet-history-item span {
    display: block;
    color: #64748b;
    font-size: 12px;
    margin-top: 3px;
    line-height: 1.4;
  }

  .bha-wallet-history-item em {
    font-style: normal;
    color: #111827;
    font-weight: 900;
    white-space: nowrap;
  }

  .bha-form {
    display: grid;
    gap: 18px;
  }

  .bha-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .bha-field {
    display: grid;
    gap: 8px;
  }

  .bha-field-full {
    grid-column: span 2;
  }

  .bha-field span {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    font-weight: 800;
    color: #111827;
  }

  .bha-field input,
  .bha-field select,
  .bha-field textarea,
  .bha-topup-row input {
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

  .bha-field textarea {
    padding: 14px;
    resize: vertical;
  }

  .bha-field input:focus,
  .bha-field select:focus,
  .bha-field textarea:focus,
  .bha-topup-row input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.06);
  }

  .bha-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
  }

  .bha-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .bha-alert.success {
    background: #ecfdf3;
    border: 1px solid #abefc6;
    color: #027a48;
  }

  .bha-topup-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
  }

  .bha-empty {
    min-height: 220px;
    border: 1px dashed #dbe2ea;
    background: #f8fafc;
    border-radius: 20px;
    display: grid;
    place-items: center;
    text-align: center;
    padding: 22px;
    color: #6b7280;
  }

  .bha-empty strong {
    color: #111827;
  }

  .bha-footer-preview {
    position: relative;
    overflow: hidden;
    min-height: 430px;
    border-radius: 28px;
    display: grid;
    grid-template-columns: 37% 63%;
    align-items: center;
    background:
      radial-gradient(circle at top left, rgba(255, 255, 255, 0.18), transparent 28%),
      linear-gradient(135deg, #e0b894 0%, #ddb38c 38%, #dcb28b 100%);
  }

  .bha-footer-preview::before {
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
  }

  .bha-footer-preview-left {
    position: relative;
    z-index: 3;
    padding: 46px 26px 46px 58px;
    display: grid;
    align-content: center;
    gap: 16px;
  }

  .bha-preview-eyebrow {
    display: inline-flex;
    width: fit-content;
    border-radius: 999px;
    background: rgba(255,255,255,0.24);
    border: 1px solid rgba(255,255,255,0.32);
    color: #3f332c;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .bha-footer-preview-left h3 {
    margin: 0;
    color: #3a322e;
    font-size: clamp(34px, 4.8vw, 68px);
    line-height: 0.96;
    font-weight: 950;
    letter-spacing: -0.06em;
  }

  .bha-footer-preview-left p {
    margin: 0;
    max-width: 520px;
    color: rgba(58, 50, 46, 0.78);
    line-height: 1.7;
    font-size: 16px;
    font-weight: 750;
  }

  .bha-footer-preview-actions {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    margin-top: 8px;
  }

  .bha-footer-preview-actions span,
  .bha-footer-preview-actions em {
    min-height: 50px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    padding: 0 22px;
    font-size: 13px;
    font-weight: 900;
    font-style: normal;
  }

  .bha-footer-preview-actions span {
    background: #ffffff;
    color: #111827;
  }

  .bha-footer-preview-actions em {
    border: 1px solid rgba(17, 24, 39, 0.18);
    background: rgba(255, 255, 255, 0.34);
    color: #3a322e;
  }

  .bha-footer-preview-actions strong {
    color: #3a322e;
    font-size: 34px;
    font-weight: 950;
  }

  .bha-footer-preview-media {
    position: relative;
    z-index: 2;
    min-height: 430px;
    display: grid;
    place-items: center;
    padding: 34px 46px 34px 0;
  }

  .bha-footer-preview-media img,
  .bha-preview-video-box {
    position: relative;
    z-index: 4;
    width: min(880px, 94%);
    height: 330px;
    border-radius: 46px;
    object-fit: cover;
    background: rgba(255,255,255,0.16);
    border: 1px solid rgba(255,255,255,0.26);
    box-shadow: 0 30px 80px rgba(15, 23, 42, 0.22);
  }

  .bha-preview-video-box {
    display: grid;
    place-items: center;
    color: rgba(58, 50, 46, 0.72);
    font-weight: 900;
  }

  .bha-footer-preview-shape {
    position: absolute;
    pointer-events: none;
    border-radius: 50%;
    z-index: 5;
    background: rgba(70, 51, 38, 0.14);
  }

  .bha-footer-preview-shape-one {
    top: 48px;
    right: 150px;
    width: 76px;
    height: 76px;
  }

  .bha-footer-preview-shape-two {
    right: 56px;
    top: 90px;
    width: 42px;
    height: 42px;
  }

  @media (max-width: 1280px) {
    .bha-grid,
    .bha-wallet-grid {
      grid-template-columns: 1fr;
    }

    .bha-settings-strip {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .bha-analytics-strip {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 900px) {
    .bha-footer-preview {
      grid-template-columns: 1fr;
    }

    .bha-footer-preview-left {
      padding: 32px 24px 12px;
    }

    .bha-footer-preview-media {
      min-height: 300px;
      padding: 16px 24px 32px;
    }

    .bha-footer-preview-media img,
    .bha-preview-video-box {
      width: 100%;
      height: 280px;
      border-radius: 30px;
    }
  }

  @media (max-width: 767px) {
    .bha-hero,
    .bha-actions,
    .bha-hero-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .bha-settings-strip,
    .bha-analytics-strip,
    .bha-form-grid,
    .bha-wallet-card,
    .bha-wallet-fund-card {
      grid-template-columns: 1fr;
    }

    .bha-wallet-card {
      align-items: start;
    }

    .bha-field-full {
      grid-column: span 1;
    }

    .bha-topup-row,
    .bha-upload-row {
      grid-template-columns: 1fr;
    }

    .bha-btn,
    .bha-upload-btn {
      width: 100%;
    }

    .bha-title {
      font-size: 24px;
    }

    .bha-panel {
      padding: 18px;
    }
  }
`;