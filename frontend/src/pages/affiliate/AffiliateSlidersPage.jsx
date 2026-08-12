import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  FileText,
  Image as ImageIcon,
  Link2,
  MousePointerClick,
  Package,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Trash2,
  UploadCloud,
  Video,
  Wallet,
  X,
} from 'lucide-react';
import api from '../../api/axios';
import validateSupgadUrl from '../../utils/validateSupgadUrl';
import AffiliateSlidersLegacyPage from './AffiliateSlidersLegacyPage';

function emptyStoreSlider() {
  return {
    image: '',
    title: '',
    subtitle: '',
    link_type: 'internal_post',
    linked_post_id: '',
    linked_product_id: '',
    external_url: '',
    sort_order: 1,
    status: 'active',
  };
}

function emptyCampaign(minimumBudget = 200) {
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
    total_budget: minimumBudget,
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
  return Number(value || 0).toLocaleString();
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

function normalizeDate(value) {
  return value ? String(value).slice(0, 10) : '';
}

function statusClass(status = '') {
  const value = String(status).toLowerCase();

  if (['active', 'approved', 'published'].includes(value)) return 'success';
  if (['pending', 'daily_paused'].includes(value)) return 'warning';
  if (['paused', 'inactive'].includes(value)) return 'muted';
  if (['rejected', 'ended', 'exhausted'].includes(value)) return 'danger';

  return 'neutral';
}

function destinationLabel(slider) {
  if (slider?.link_type === 'product') {
    return slider?.linked_product?.title || 'Product';
  }

  if (slider?.link_type === 'external_url') {
    return slider?.external_url || 'External URL';
  }

  return slider?.linked_post?.title || 'Post';
}

function StoreSliderCard({
  slider,
  onEdit,
  onStatus,
  onDelete,
  busyId,
}) {
  const isActive = String(slider?.status || '').toLowerCase() === 'active';

  return (
    <article className="writer-slider-card">
      <div className="writer-slider-image">
        {slider?.image ? (
          <img src={slider.image} alt={slider?.title || 'Storefront slider'} />
        ) : (
          <div className="writer-slider-image-empty">
            <ImageIcon size={30} />
            <span>No image</span>
          </div>
        )}
        <span className={`writer-slider-pill ${statusClass(slider?.status)}`}>
          {slider?.status || 'inactive'}
        </span>
      </div>

      <div className="writer-slider-card-body">
        <div className="writer-slider-card-title-row">
          <div>
            <h3>{slider?.title || 'Untitled slider'}</h3>
            <p>{slider?.subtitle || 'No subtitle added.'}</p>
          </div>
          <span className="writer-slider-order">#{Number(slider?.sort_order || 0)}</span>
        </div>

        <div className="writer-slider-meta">
          <div>
            <span>Destination</span>
            <strong title={destinationLabel(slider)}>{destinationLabel(slider)}</strong>
          </div>
          <div>
            <span>Type</span>
            <strong>{String(slider?.link_type || 'internal_post').replace(/_/g, ' ')}</strong>
          </div>
        </div>

        <div className="writer-slider-actions">
          <button type="button" className="writer-sliders-btn secondary" onClick={() => onEdit(slider)}>
            <Pencil size={15} />
            Edit
          </button>
          <button
            type="button"
            className="writer-sliders-btn secondary"
            disabled={String(busyId) === String(slider?.id)}
            onClick={() => onStatus(slider)}
          >
            {isActive ? <Pause size={15} /> : <Play size={15} />}
            {isActive ? 'Disable' : 'Enable'}
          </button>
          <button
            type="button"
            className="writer-sliders-btn danger-ghost"
            disabled={String(busyId) === String(slider?.id)}
            onClick={() => onDelete(slider)}
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function CampaignCard({
  campaign,
  onEdit,
  onStatus,
  onTopUp,
  onDelete,
  busyId,
}) {
  const status = String(campaign?.status || '').toLowerCase();
  const canPause = status === 'active' || status === 'daily_paused';
  const canResume = status === 'paused';
  const canEdit = !['active', 'ended', 'exhausted'].includes(status);
  const canDelete = !['active', 'daily_paused'].includes(status);

  return (
    <article className="writer-ad-card">
      <div className="writer-ad-card-head">
        <div>
          <div className="writer-ad-card-pills">
            <span className={`writer-slider-pill ${statusClass(campaign?.status)}`}>
              {campaign?.status || 'pending'}
            </span>
            <span className={`writer-slider-pill ${statusClass(campaign?.approval_status)}`}>
              {campaign?.approval_status || 'pending'}
            </span>
          </div>
          <h3>{campaign?.campaign_title || 'Untitled campaign'}</h3>
          <p>{campaign?.title || 'Homepage slider ad'}</p>
        </div>

        <div className="writer-ad-budget">
          <span>Remaining</span>
          <strong>{formatMoney(campaign?.remaining_budget)}</strong>
        </div>
      </div>

      <div className="writer-ad-metrics">
        <div>
          <Eye size={15} />
          <span>Views</span>
          <strong>{formatNumber(campaign?.total_views)}</strong>
        </div>
        <div>
          <MousePointerClick size={15} />
          <span>Clicks</span>
          <strong>{formatNumber(campaign?.total_clicks)}</strong>
        </div>
        <div>
          <Wallet size={15} />
          <span>Budget</span>
          <strong>{formatMoney(campaign?.total_budget)}</strong>
        </div>
      </div>

      <div className="writer-slider-actions">
        <button
          type="button"
          className="writer-sliders-btn secondary"
          disabled={!canEdit || String(busyId) === String(campaign?.id)}
          onClick={() => onEdit(campaign)}
          title={canEdit ? 'Edit campaign' : 'Pause the campaign before editing'}
        >
          <Pencil size={15} />
          Edit
        </button>

        {canPause ? (
          <button
            type="button"
            className="writer-sliders-btn secondary"
            disabled={String(busyId) === String(campaign?.id)}
            onClick={() => onStatus(campaign, 'pause')}
          >
            <Pause size={15} />
            Pause
          </button>
        ) : null}

        {canResume ? (
          <button
            type="button"
            className="writer-sliders-btn secondary"
            disabled={String(busyId) === String(campaign?.id)}
            onClick={() => onStatus(campaign, 'resume')}
          >
            <Play size={15} />
            Resume
          </button>
        ) : null}

        <button
          type="button"
          className="writer-sliders-btn secondary"
          disabled={String(busyId) === String(campaign?.id)}
          onClick={() => onTopUp(campaign)}
        >
          <Wallet size={15} />
          Top Up
        </button>

        <button
          type="button"
          className="writer-sliders-btn danger-ghost"
          disabled={!canDelete || String(busyId) === String(campaign?.id)}
          onClick={() => onDelete(campaign)}
          title={canDelete ? 'Delete campaign' : 'Pause the campaign before deleting'}
        >
          <Trash2 size={15} />
          Delete
        </button>
      </div>
    </article>
  );
}

function WriterSlidersWorkspace() {
  const storeImageRef = useRef(null);
  const adImageRef = useRef(null);
  const adVideoRef = useRef(null);
  const adPosterRef = useRef(null);

  const [activeTab, setActiveTab] = useState('storefront');

  const [sliders, setSliders] = useState([]);
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [storeLoading, setStoreLoading] = useState(true);
  const [storeRefreshing, setStoreRefreshing] = useState(false);
  const [storeError, setStoreError] = useState('');
  const [storeSuccess, setStoreSuccess] = useState('');
  const [storeBusyId, setStoreBusyId] = useState('');
  const [storeSaving, setStoreSaving] = useState(false);
  const [storeUploading, setStoreUploading] = useState(false);
  const [storeDrawerOpen, setStoreDrawerOpen] = useState(false);
  const [storeEditingId, setStoreEditingId] = useState('');
  const [storeForm, setStoreForm] = useState(emptyStoreSlider());

  const [campaigns, setCampaigns] = useState([]);
  const [settings, setSettings] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [adsLoaded, setAdsLoaded] = useState(false);
  const [adsLoading, setAdsLoading] = useState(false);
  const [adsRefreshing, setAdsRefreshing] = useState(false);
  const [adsError, setAdsError] = useState('');
  const [adsSuccess, setAdsSuccess] = useState('');
  const [adBusyId, setAdBusyId] = useState('');
  const [adSaving, setAdSaving] = useState(false);
  const [adUploadingField, setAdUploadingField] = useState('');
  const [fundingWallet, setFundingWallet] = useState(false);
  const [walletFundAmount, setWalletFundAmount] = useState('');
  const [adDrawerOpen, setAdDrawerOpen] = useState(false);
  const [adEditingId, setAdEditingId] = useState('');
  const [adForm, setAdForm] = useState(emptyCampaign());
  const [topUpAmount, setTopUpAmount] = useState('');

  const storeStats = useMemo(() => {
    const total = sliders.length;
    const active = sliders.filter((item) => String(item?.status || '').toLowerCase() === 'active').length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [sliders]);

  const minimumBudget = Number(settings?.minimum_budget || 200);
  const minimumDailyCap = Number(settings?.minimum_daily_cap || 20);
  const walletBalance = Number(wallet?.available_balance || 0);

  const loadStorefront = async (refresh = false) => {
    try {
      refresh ? setStoreRefreshing(true) : setStoreLoading(true);
      setStoreError('');

      const results = await Promise.allSettled([
        api.get('/api/affiliate/sliders'),
        api.get('/api/affiliate/posts'),
        api.get('/api/affiliate/products'),
      ]);

      const sliderResult = results[0];
      const postsResult = results[1];
      const productsResult = results[2];

      if (sliderResult.status === 'rejected') {
        throw sliderResult.reason;
      }

      setSliders(Array.isArray(sliderResult.value?.data?.sliders) ? sliderResult.value.data.sliders : []);

      if (postsResult.status === 'fulfilled') {
        setPosts(Array.isArray(postsResult.value?.data?.posts) ? postsResult.value.data.posts : []);
      }

      if (productsResult.status === 'fulfilled') {
        setProducts(Array.isArray(productsResult.value?.data?.products) ? productsResult.value.data.products : []);
      }
    } catch (err) {
      setStoreError(err?.response?.data?.message || err?.message || 'Failed to load storefront sliders');
    } finally {
      setStoreLoading(false);
      setStoreRefreshing(false);
    }
  };

  const loadAds = async (refresh = false) => {
    try {
      refresh ? setAdsRefreshing(true) : setAdsLoading(true);
      setAdsError('');

      const { data } = await api.get('/api/affiliate/banner-home-ads');
      setCampaigns(Array.isArray(data?.campaigns) ? data.campaigns : []);
      setSettings(data?.settings || null);
      setWallet(data?.wallet || null);
      setAnalytics(data?.analytics || null);
      setWalletTransactions(Array.isArray(data?.wallet_transactions) ? data.wallet_transactions : []);
      setAdsLoaded(true);
    } catch (err) {
      setAdsError(err?.response?.data?.message || err?.message || 'Failed to load homepage slider ads');
    } finally {
      setAdsLoading(false);
      setAdsRefreshing(false);
    }
  };

  useEffect(() => {
    loadStorefront();
  }, []);

  useEffect(() => {
    if (activeTab === 'homepage' && !adsLoaded && !adsLoading) {
      loadAds();
    }
  }, [activeTab, adsLoaded, adsLoading]);

  const openStoreCreate = () => {
    setStoreEditingId('');
    setStoreForm({
      ...emptyStoreSlider(),
      sort_order: Math.max(1, sliders.length + 1),
    });
    setStoreError('');
    setStoreSuccess('');
    setStoreDrawerOpen(true);
  };

  const openStoreEdit = (slider) => {
    setStoreEditingId(String(slider.id));
    setStoreForm({
      image: slider.image || '',
      title: slider.title || '',
      subtitle: slider.subtitle || '',
      link_type: slider.link_type || 'internal_post',
      linked_post_id: slider.linked_post_id || '',
      linked_product_id: slider.linked_product_id || '',
      external_url: slider.external_url || '',
      sort_order: Number(slider.sort_order || 0),
      status: slider.status || 'active',
    });
    setStoreError('');
    setStoreSuccess('');
    setStoreDrawerOpen(true);
  };

  const handleStoreChange = (event) => {
    const { name, value } = event.target;
    setStoreForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'link_type'
        ? {
            linked_post_id: '',
            linked_product_id: '',
            external_url: '',
          }
        : {}),
    }));
  };

  const uploadStoreImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setStoreUploading(true);
      setStoreError('');
      const body = new FormData();
      body.append('file', file);
      body.append('type', 'image_url');
      body.append('folder', 'website-sliders');

      const { data } = await api.post('/api/uploads', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = resolveUploadedUrl(data);
      if (!url) throw new Error('Upload completed, but no image URL was returned.');

      setStoreForm((prev) => ({ ...prev, image: url }));
      setStoreSuccess('Slider image uploaded.');
    } catch (err) {
      setStoreError(err?.response?.data?.message || err?.message || 'Failed to upload slider image');
    } finally {
      setStoreUploading(false);
      event.target.value = '';
    }
  };

  const validateStoreForm = () => {
    if (!String(storeForm.image || '').trim()) {
      throw new Error('Slider image is required');
    }

    if (storeForm.link_type === 'internal_post' && !Number(storeForm.linked_post_id || 0)) {
      throw new Error('Choose a post destination');
    }

    if (storeForm.link_type === 'product' && !Number(storeForm.linked_product_id || 0)) {
      throw new Error('Choose a product destination');
    }

    if (storeForm.link_type === 'external_url') {
      const result = validateSupgadUrl(storeForm.external_url, {
        required: true,
        allowEmpty: false,
        fieldName: 'External URL',
      });

      if (!result.ok) throw new Error(result.message);
    }
  };

  const saveStoreSlider = async (event) => {
    event.preventDefault();

    try {
      setStoreSaving(true);
      setStoreError('');
      setStoreSuccess('');
      validateStoreForm();

      const payload = {
        image: String(storeForm.image || '').trim(),
        title: String(storeForm.title || '').trim(),
        subtitle: String(storeForm.subtitle || '').trim(),
        link_type: storeForm.link_type,
        linked_post_id: storeForm.link_type === 'internal_post' ? Number(storeForm.linked_post_id) : null,
        linked_product_id: storeForm.link_type === 'product' ? Number(storeForm.linked_product_id) : null,
        external_url: storeForm.link_type === 'external_url' ? String(storeForm.external_url || '').trim() : null,
        sort_order: Number(storeForm.sort_order || 0),
        status: storeForm.status,
      };

      const response = storeEditingId
        ? await api.put(`/api/affiliate/sliders/${storeEditingId}`, payload)
        : await api.post('/api/affiliate/sliders', payload);

      setStoreSuccess(response?.data?.message || 'Slider saved successfully');
      setStoreDrawerOpen(false);
      await loadStorefront(true);
    } catch (err) {
      setStoreError(err?.response?.data?.message || err?.message || 'Failed to save storefront slider');
    } finally {
      setStoreSaving(false);
    }
  };

  const toggleStoreStatus = async (slider) => {
    const nextStatus = String(slider?.status || '').toLowerCase() === 'active' ? 'inactive' : 'active';

    try {
      setStoreBusyId(String(slider.id));
      setStoreError('');
      const { data } = await api.put(`/api/affiliate/sliders/${slider.id}/status`, {
        status: nextStatus,
      });
      setStoreSuccess(data?.message || 'Slider status updated');
      await loadStorefront(true);
    } catch (err) {
      setStoreError(err?.response?.data?.message || err?.message || 'Failed to update slider status');
    } finally {
      setStoreBusyId('');
    }
  };

  const deleteStoreSlider = async (slider) => {
    if (!window.confirm(`Delete "${slider?.title || 'this slider'}" permanently?`)) return;

    try {
      setStoreBusyId(String(slider.id));
      setStoreError('');
      const { data } = await api.delete(`/api/affiliate/sliders/${slider.id}`);
      setStoreSuccess(data?.message || 'Slider deleted');
      await loadStorefront(true);
    } catch (err) {
      setStoreError(err?.response?.data?.message || err?.message || 'Failed to delete slider');
    } finally {
      setStoreBusyId('');
    }
  };

  const openAdCreate = () => {
    setAdEditingId('');
    setAdForm(emptyCampaign(minimumBudget));
    setTopUpAmount('');
    setAdsError('');
    setAdsSuccess('');
    setAdDrawerOpen(true);
  };

  const openAdEdit = (campaign) => {
    setAdEditingId(String(campaign.id));
    setAdForm({
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
      total_budget: campaign.total_budget || minimumBudget,
      daily_budget_cap: campaign.daily_budget_cap || '',
      start_date: normalizeDate(campaign.start_date),
      end_date: normalizeDate(campaign.end_date),
      payment_reference: '',
    });
    setTopUpAmount('');
    setAdsError('');
    setAdsSuccess('');
    setAdDrawerOpen(true);
  };

  const handleAdChange = (event) => {
    const { name, value } = event.target;
    setAdForm((prev) => ({ ...prev, [name]: value }));
  };

  const uploadAdMedia = async (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setAdUploadingField(field);
      setAdsError('');
      const body = new FormData();
      body.append('file', file);
      body.append('type', field);
      body.append('folder', 'banner-home-ads');

      const { data } = await api.post('/api/uploads', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = resolveUploadedUrl(data);
      if (!url) throw new Error('Upload completed, but no file URL was returned.');

      setAdForm((prev) => ({ ...prev, [field]: url }));
      setAdsSuccess('Media uploaded successfully.');
    } catch (err) {
      setAdsError(err?.response?.data?.message || err?.message || 'Failed to upload media');
    } finally {
      setAdUploadingField('');
      event.target.value = '';
    }
  };

  const validateAdForm = () => {
    if (!String(adForm.campaign_title || '').trim()) throw new Error('Campaign title is required');
    if (!String(adForm.title || '').trim()) throw new Error('Slider headline is required');
    if (!String(adForm.cta_label || '').trim()) throw new Error('CTA label is required');

    const mainUrl = validateSupgadUrl(adForm.cta_url, {
      required: true,
      allowEmpty: false,
      fieldName: 'CTA URL',
    });

    if (!mainUrl.ok) throw new Error(mainUrl.message);

    if (String(adForm.secondary_cta_url || '').trim()) {
      const secondaryUrl = validateSupgadUrl(adForm.secondary_cta_url, {
        required: false,
        allowEmpty: true,
        fieldName: 'Secondary CTA URL',
      });

      if (!secondaryUrl.ok) throw new Error(secondaryUrl.message);
    }

    if (adForm.media_type === 'image' && !String(adForm.image_url || '').trim()) {
      throw new Error('Image is required for an image slider ad');
    }

    if (adForm.media_type === 'video' && !String(adForm.video_url || '').trim()) {
      throw new Error('Video is required for a video slider ad');
    }

    if (!adEditingId && walletBalance < minimumBudget) {
      throw new Error(`Fund your homepage slider ads wallet with at least ${formatMoney(minimumBudget)} first`);
    }

    if (!adEditingId && Number(adForm.total_budget || 0) < minimumBudget) {
      throw new Error(`Minimum homepage slider ad budget is ${formatMoney(minimumBudget)}`);
    }

    if (!adEditingId && Number(adForm.total_budget || 0) > walletBalance) {
      throw new Error(`Campaign budget cannot exceed your wallet balance of ${formatMoney(walletBalance)}`);
    }

    if (adForm.daily_budget_cap && Number(adForm.daily_budget_cap) < minimumDailyCap) {
      throw new Error(`Minimum daily budget cap is ${formatMoney(minimumDailyCap)}`);
    }
  };

  const buildAdPayload = () => ({
    campaign_title: adForm.campaign_title,
    campaign_description: adForm.campaign_description,
    internal_note: adForm.internal_note,
    media_type: adForm.media_type,
    image_url: adForm.image_url,
    video_url: adForm.media_type === 'video' ? adForm.video_url : '',
    poster_url: adForm.poster_url,
    eyebrow_text: adForm.eyebrow_text,
    title: adForm.title,
    subtitle: adForm.subtitle,
    promo_text: adForm.promo_text,
    cta_label: adForm.cta_label,
    cta_url: adForm.cta_url,
    secondary_cta_label: adForm.secondary_cta_label,
    secondary_cta_url: adForm.secondary_cta_url,
    total_budget: Number(adForm.total_budget || minimumBudget),
    daily_budget_cap: adForm.daily_budget_cap === '' ? null : Number(adForm.daily_budget_cap || 0),
    start_date: adForm.start_date || null,
    end_date: adForm.end_date || null,
    payment_reference: adForm.payment_reference,
  });

  const saveAd = async (event) => {
    event.preventDefault();

    try {
      setAdSaving(true);
      setAdsError('');
      setAdsSuccess('');
      validateAdForm();

      const payload = buildAdPayload();
      const response = adEditingId
        ? await api.put(`/api/affiliate/banner-home-ads/${adEditingId}`, payload)
        : await api.post('/api/affiliate/banner-home-ads', payload);

      setAdsSuccess(response?.data?.message || 'Homepage slider ad saved');
      setAdDrawerOpen(false);
      await loadAds(true);
    } catch (err) {
      setAdsError(err?.response?.data?.message || err?.message || 'Failed to save homepage slider ad');
    } finally {
      setAdSaving(false);
    }
  };

  const fundWallet = async () => {
    const amount = Number(walletFundAmount || 0);

    if (!amount || amount <= 0) {
      setAdsError('Enter a valid wallet funding amount');
      return;
    }

    try {
      setFundingWallet(true);
      setAdsError('');
      const { data } = await api.post('/api/affiliate/banner-home-ads/wallet/fund', {
        amount,
        note: 'Writer funded homepage slider ads wallet',
      });
      setWalletFundAmount('');
      setAdsSuccess(data?.message || 'Wallet funded successfully');
      await loadAds(true);
    } catch (err) {
      setAdsError(err?.response?.data?.message || err?.message || 'Failed to fund wallet');
    } finally {
      setFundingWallet(false);
    }
  };

  const changeAdStatus = async (campaign, action) => {
    try {
      setAdBusyId(String(campaign.id));
      setAdsError('');
      const { data } = await api.put(`/api/affiliate/banner-home-ads/${campaign.id}/status`, {
        action,
      });
      setAdsSuccess(data?.message || 'Campaign status updated');
      await loadAds(true);
    } catch (err) {
      setAdsError(err?.response?.data?.message || err?.message || 'Failed to update campaign status');
    } finally {
      setAdBusyId('');
    }
  };

  const openTopUp = (campaign) => {
    const status = String(campaign?.status || '').toLowerCase();
    if (['active', 'ended', 'exhausted'].includes(status)) {
      setAdEditingId(String(campaign.id));
      setAdForm({
        ...emptyCampaign(minimumBudget),
        campaign_title: campaign.campaign_title || '',
        title: campaign.title || '',
      });
    } else {
      openAdEdit(campaign);
    }
    setTopUpAmount('');
    setAdDrawerOpen(true);
  };

  const topUpAd = async () => {
    if (!adEditingId) return;

    const amount = Number(topUpAmount || 0);

    if (!amount || amount <= 0) {
      setAdsError('Enter a valid top-up amount');
      return;
    }

    if (amount > walletBalance) {
      setAdsError(`Top-up amount cannot exceed wallet balance ${formatMoney(walletBalance)}`);
      return;
    }

    try {
      setAdBusyId(String(adEditingId));
      setAdsError('');
      const { data } = await api.post(`/api/affiliate/banner-home-ads/${adEditingId}/top-up`, {
        amount,
        note: 'Writer homepage slider ad top-up from wallet',
      });
      setTopUpAmount('');
      setAdsSuccess(data?.message || 'Campaign topped up successfully');
      await loadAds(true);
    } catch (err) {
      setAdsError(err?.response?.data?.message || err?.message || 'Failed to top up campaign');
    } finally {
      setAdBusyId('');
    }
  };

  const deleteAd = async (campaign) => {
    if (!window.confirm(`Delete "${campaign?.campaign_title || 'this campaign'}" permanently?`)) return;

    try {
      setAdBusyId(String(campaign.id));
      setAdsError('');
      const { data } = await api.delete(`/api/affiliate/banner-home-ads/${campaign.id}`);
      setAdsSuccess(data?.message || 'Campaign deleted');
      await loadAds(true);
    } catch (err) {
      setAdsError(err?.response?.data?.message || err?.message || 'Failed to delete campaign');
    } finally {
      setAdBusyId('');
    }
  };

  const closeDrawers = () => {
    setStoreDrawerOpen(false);
    setAdDrawerOpen(false);
  };

  return (
    <div className="writer-sliders-page">
      <style>{styles}</style>

      <input
        ref={storeImageRef}
        className="writer-sliders-hidden-file"
        type="file"
        accept="image/*"
        onChange={uploadStoreImage}
      />
      <input
        ref={adImageRef}
        className="writer-sliders-hidden-file"
        type="file"
        accept="image/*"
        onChange={(event) => uploadAdMedia(event, 'image_url')}
      />
      <input
        ref={adVideoRef}
        className="writer-sliders-hidden-file"
        type="file"
        accept="video/*"
        onChange={(event) => uploadAdMedia(event, 'video_url')}
      />
      <input
        ref={adPosterRef}
        className="writer-sliders-hidden-file"
        type="file"
        accept="image/*"
        onChange={(event) => uploadAdMedia(event, 'poster_url')}
      />

      <div className="writer-sliders-tabs" role="tablist" aria-label="Slider workspaces">
        <button
          type="button"
          className={activeTab === 'storefront' ? 'active' : ''}
          onClick={() => setActiveTab('storefront')}
        >
          Storefront Sliders
        </button>
        <button
          type="button"
          className={activeTab === 'homepage' ? 'active' : ''}
          onClick={() => setActiveTab('homepage')}
        >
          Homepage Ads
        </button>
      </div>

      {activeTab === 'storefront' ? (
        <>
          <section className="writer-sliders-command">
            <div>
              <span className="writer-sliders-kicker">Storefront display</span>
              <h2>Storefront sliders</h2>
              <p>Create clean promotional slides for your own storefront and connect each one to a post, product, or external destination.</p>
            </div>
            <div className="writer-sliders-command-actions">
              <button
                type="button"
                className="writer-sliders-btn secondary"
                onClick={() => loadStorefront(true)}
                disabled={storeRefreshing}
              >
                <RefreshCw size={16} className={storeRefreshing ? 'writer-spin' : ''} />
                {storeRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button type="button" className="writer-sliders-btn primary" onClick={openStoreCreate}>
                <Plus size={16} />
                New Slider
              </button>
            </div>
          </section>

          <section className="writer-sliders-stats three">
            <div>
              <span>Total sliders</span>
              <strong>{storeStats.total}</strong>
              <small>All storefront slides</small>
            </div>
            <div>
              <span>Active</span>
              <strong>{storeStats.active}</strong>
              <small>Currently visible</small>
            </div>
            <div>
              <span>Inactive</span>
              <strong>{storeStats.inactive}</strong>
              <small>Hidden from visitors</small>
            </div>
          </section>

          {storeError ? (
            <div className="writer-sliders-alert error">
              <AlertCircle size={17} />
              <span>{storeError}</span>
            </div>
          ) : null}

          {storeSuccess ? (
            <div className="writer-sliders-alert success">
              <CheckCircle2 size={17} />
              <span>{storeSuccess}</span>
            </div>
          ) : null}

          {storeLoading ? (
            <div className="writer-sliders-loading">
              <div className="writer-sliders-spinner" />
              <span>Loading storefront sliders...</span>
            </div>
          ) : sliders.length ? (
            <section className="writer-slider-grid">
              {sliders.map((slider) => (
                <StoreSliderCard
                  key={slider.id}
                  slider={slider}
                  onEdit={openStoreEdit}
                  onStatus={toggleStoreStatus}
                  onDelete={deleteStoreSlider}
                  busyId={storeBusyId}
                />
              ))}
            </section>
          ) : (
            <section className="writer-sliders-empty">
              <div className="writer-sliders-empty-icon">
                <ImageIcon size={26} />
              </div>
              <h3>No storefront sliders yet</h3>
              <p>Create your first slide and connect it to a post, product, or external destination.</p>
              <button type="button" className="writer-sliders-btn primary" onClick={openStoreCreate}>
                <Plus size={16} />
                Create Slider
              </button>
            </section>
          )}
        </>
      ) : (
        <>
          <section className="writer-sliders-command">
            <div>
              <span className="writer-sliders-kicker">Paid homepage placement</span>
              <h2>Homepage slider ads</h2>
              <p>Fund your ads wallet, submit homepage campaigns, and manage approval, budget, views, clicks, and campaign status.</p>
            </div>
            <div className="writer-sliders-command-actions">
              <button
                type="button"
                className="writer-sliders-btn secondary"
                onClick={() => loadAds(true)}
                disabled={adsRefreshing}
              >
                <RefreshCw size={16} className={adsRefreshing ? 'writer-spin' : ''} />
                {adsRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                type="button"
                className="writer-sliders-btn primary"
                onClick={openAdCreate}
                disabled={walletBalance < minimumBudget}
                title={walletBalance < minimumBudget ? `Fund at least ${formatMoney(minimumBudget)} first` : ''}
              >
                <Plus size={16} />
                Create Homepage Ad
              </button>
            </div>
          </section>

          <section className="writer-sliders-wallet">
            <div className="writer-sliders-wallet-summary">
              <div className="writer-sliders-wallet-icon">
                <Wallet size={22} />
              </div>
              <div>
                <span>Homepage Ads Wallet</span>
                <strong>{formatMoney(walletBalance)}</strong>
                <small>Minimum campaign budget {formatMoney(minimumBudget)}</small>
              </div>
            </div>
            <div className="writer-sliders-wallet-fund">
              <input
                type="number"
                min="1"
                step="0.01"
                value={walletFundAmount}
                onChange={(event) => setWalletFundAmount(event.target.value)}
                placeholder="Funding amount"
              />
              <button
                type="button"
                className="writer-sliders-btn primary"
                onClick={fundWallet}
                disabled={fundingWallet}
              >
                <Wallet size={16} />
                {fundingWallet ? 'Funding...' : 'Fund Wallet'}
              </button>
            </div>
          </section>

          <section className="writer-sliders-stats four">
            <div>
              <span>Total spent</span>
              <strong>{formatMoney(analytics?.total_spent || wallet?.total_spent)}</strong>
              <small>Across homepage ads</small>
            </div>
            <div>
              <span>Total views</span>
              <strong>{formatNumber(analytics?.total_views)}</strong>
              <small>Recorded impressions</small>
            </div>
            <div>
              <span>Total clicks</span>
              <strong>{formatNumber(analytics?.total_clicks)}</strong>
              <small>Recorded clicks</small>
            </div>
            <div>
              <span>Active ads</span>
              <strong>{formatNumber(analytics?.active_campaigns)}</strong>
              <small>{formatNumber(analytics?.pending_campaigns)} pending approval</small>
            </div>
          </section>

          <section className="writer-sliders-settings-row">
            <span><Settings size={15} /> Cost/view {formatMoney(settings?.cost_per_view)}</span>
            <span><Settings size={15} /> Cost/click {formatMoney(settings?.cost_per_click)}</span>
            <span><Settings size={15} /> Daily cap min {formatMoney(minimumDailyCap)}</span>
            <span><Settings size={15} /> Position {settings?.ad_insert_position || 5}</span>
          </section>

          {adsError ? (
            <div className="writer-sliders-alert error">
              <AlertCircle size={17} />
              <span>{adsError}</span>
            </div>
          ) : null}

          {adsSuccess ? (
            <div className="writer-sliders-alert success">
              <CheckCircle2 size={17} />
              <span>{adsSuccess}</span>
            </div>
          ) : null}

          {adsLoading ? (
            <div className="writer-sliders-loading">
              <div className="writer-sliders-spinner" />
              <span>Loading homepage slider ads...</span>
            </div>
          ) : campaigns.length ? (
            <section className="writer-ad-grid">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onEdit={openAdEdit}
                  onStatus={changeAdStatus}
                  onTopUp={openTopUp}
                  onDelete={deleteAd}
                  busyId={adBusyId}
                />
              ))}
            </section>
          ) : (
            <section className="writer-sliders-empty">
              <div className="writer-sliders-empty-icon">
                <Link2 size={26} />
              </div>
              <h3>No homepage slider ads yet</h3>
              <p>Fund your ads wallet, then create a campaign for homepage placement.</p>
              <button
                type="button"
                className="writer-sliders-btn primary"
                onClick={openAdCreate}
                disabled={walletBalance < minimumBudget}
              >
                <Plus size={16} />
                Create Homepage Ad
              </button>
            </section>
          )}

          {walletTransactions.length ? (
            <section className="writer-sliders-history">
              <div>
                <h3>Recent wallet activity</h3>
                <p>Your latest homepage slider ads wallet transactions.</p>
              </div>
              <div className="writer-sliders-history-list">
                {walletTransactions.slice(0, 5).map((item) => (
                  <div key={item.id}>
                    <span>{String(item.transaction_type || 'transaction').replace(/_/g, ' ')}</span>
                    <strong>{formatMoney(item.amount)}</strong>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}

      {storeDrawerOpen ? (
        <div className="writer-sliders-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setStoreDrawerOpen(false);
        }}>
          <aside className="writer-sliders-drawer" aria-label={storeEditingId ? 'Edit slider' : 'Create slider'}>
            <div className="writer-sliders-drawer-head">
              <div>
                <span>Storefront slider</span>
                <h3>{storeEditingId ? 'Edit Slider' : 'New Slider'}</h3>
              </div>
              <button type="button" onClick={() => setStoreDrawerOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <form className="writer-sliders-drawer-body" onSubmit={saveStoreSlider}>
              <div className="writer-sliders-upload-card">
                <div className="writer-sliders-upload-preview">
                  {storeForm.image ? (
                    <img src={storeForm.image} alt="Slider preview" />
                  ) : (
                    <ImageIcon size={28} />
                  )}
                </div>
                <div>
                  <strong>Slider image</strong>
                  <span>Use a clear wide image for the best storefront result.</span>
                </div>
                <button
                  type="button"
                  className="writer-sliders-btn secondary"
                  onClick={() => storeImageRef.current?.click()}
                  disabled={storeUploading}
                >
                  <UploadCloud size={16} />
                  {storeUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>

              <label className="writer-sliders-field full">
                <span>Image URL</span>
                <input
                  name="image"
                  value={storeForm.image}
                  onChange={handleStoreChange}
                  placeholder="/uploads/... or https://..."
                />
              </label>

              <div className="writer-sliders-form-grid">
                <label className="writer-sliders-field full">
                  <span>Title</span>
                  <input name="title" value={storeForm.title} onChange={handleStoreChange} placeholder="Slider title" />
                </label>

                <label className="writer-sliders-field full">
                  <span>Subtitle</span>
                  <textarea
                    name="subtitle"
                    value={storeForm.subtitle}
                    onChange={handleStoreChange}
                    rows={3}
                    placeholder="Short supporting text"
                  />
                </label>

                <label className="writer-sliders-field">
                  <span>Destination type</span>
                  <select name="link_type" value={storeForm.link_type} onChange={handleStoreChange}>
                    <option value="internal_post">Post</option>
                    <option value="product">Product</option>
                    <option value="external_url">External URL</option>
                  </select>
                </label>

                {storeForm.link_type === 'internal_post' ? (
                  <label className="writer-sliders-field">
                    <span>Post</span>
                    <select name="linked_post_id" value={storeForm.linked_post_id} onChange={handleStoreChange}>
                      <option value="">Choose post</option>
                      {posts.map((post) => (
                        <option key={post.id} value={post.id}>{post.title || `Post ${post.id}`}</option>
                      ))}
                    </select>
                  </label>
                ) : null}

                {storeForm.link_type === 'product' ? (
                  <label className="writer-sliders-field">
                    <span>Product</span>
                    <select name="linked_product_id" value={storeForm.linked_product_id} onChange={handleStoreChange}>
                      <option value="">Choose product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>{product.title || `Product ${product.id}`}</option>
                      ))}
                    </select>
                  </label>
                ) : null}

                {storeForm.link_type === 'external_url' ? (
                  <label className="writer-sliders-field full">
                    <span>External URL</span>
                    <input
                      name="external_url"
                      value={storeForm.external_url}
                      onChange={handleStoreChange}
                      placeholder="https://example.com/page"
                    />
                  </label>
                ) : null}

                <label className="writer-sliders-field">
                  <span>Display order</span>
                  <input
                    type="number"
                    name="sort_order"
                    value={storeForm.sort_order}
                    onChange={handleStoreChange}
                  />
                </label>

                <label className="writer-sliders-field">
                  <span>Status</span>
                  <select name="status" value={storeForm.status} onChange={handleStoreChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
              </div>

              {storeError ? (
                <div className="writer-sliders-alert error compact">
                  <AlertCircle size={16} />
                  <span>{storeError}</span>
                </div>
              ) : null}

              <div className="writer-sliders-drawer-actions">
                <button type="button" className="writer-sliders-btn secondary" onClick={() => setStoreDrawerOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="writer-sliders-btn primary"
                  disabled={storeSaving || storeUploading}
                >
                  <Save size={16} />
                  {storeSaving ? 'Saving...' : storeEditingId ? 'Save Changes' : 'Create Slider'}
                </button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}

      {adDrawerOpen ? (
        <div className="writer-sliders-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setAdDrawerOpen(false);
        }}>
          <aside className="writer-sliders-drawer wide" aria-label={adEditingId ? 'Edit homepage ad' : 'Create homepage ad'}>
            <div className="writer-sliders-drawer-head">
              <div>
                <span>Homepage slider ad</span>
                <h3>{adEditingId ? 'Campaign Details' : 'Create Homepage Ad'}</h3>
              </div>
              <button type="button" onClick={() => setAdDrawerOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <form className="writer-sliders-drawer-body" onSubmit={saveAd}>
              <div className="writer-sliders-form-grid">
                <label className="writer-sliders-field full">
                  <span>Campaign title</span>
                  <input
                    name="campaign_title"
                    value={adForm.campaign_title}
                    onChange={handleAdChange}
                    placeholder="Campaign title"
                    disabled={adEditingId && ['active', 'ended', 'exhausted'].includes(String(campaigns.find((item) => String(item.id) === String(adEditingId))?.status || '').toLowerCase())}
                  />
                </label>

                <label className="writer-sliders-field">
                  <span>Media type</span>
                  <select name="media_type" value={adForm.media_type} onChange={handleAdChange}>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </label>

                <label className="writer-sliders-field">
                  <span>Eyebrow text</span>
                  <input name="eyebrow_text" value={adForm.eyebrow_text} onChange={handleAdChange} placeholder="Sponsored" />
                </label>

                <label className="writer-sliders-field full">
                  <span>Main headline</span>
                  <input name="title" value={adForm.title} onChange={handleAdChange} placeholder="Slider headline" />
                </label>

                <label className="writer-sliders-field full">
                  <span>Subtitle</span>
                  <textarea name="subtitle" value={adForm.subtitle} onChange={handleAdChange} rows={3} placeholder="Short supporting text" />
                </label>

                <label className="writer-sliders-field full">
                  <span>Campaign description</span>
                  <textarea
                    name="campaign_description"
                    value={adForm.campaign_description}
                    onChange={handleAdChange}
                    rows={3}
                    placeholder="Description for review"
                  />
                </label>

                <label className="writer-sliders-field">
                  <span>Promo text</span>
                  <input name="promo_text" value={adForm.promo_text} onChange={handleAdChange} placeholder="Limited offer" />
                </label>

                <label className="writer-sliders-field">
                  <span>Internal note</span>
                  <input name="internal_note" value={adForm.internal_note} onChange={handleAdChange} placeholder="Optional note" />
                </label>
              </div>

              {adForm.media_type === 'image' ? (
                <div className="writer-sliders-upload-card">
                  <div className="writer-sliders-upload-preview">
                    {adForm.image_url ? <img src={adForm.image_url} alt="Ad preview" /> : <ImageIcon size={28} />}
                  </div>
                  <div>
                    <strong>Campaign image</strong>
                    <span>Upload an image or paste its URL below.</span>
                  </div>
                  <button
                    type="button"
                    className="writer-sliders-btn secondary"
                    onClick={() => adImageRef.current?.click()}
                    disabled={adUploadingField === 'image_url'}
                  >
                    <UploadCloud size={16} />
                    {adUploadingField === 'image_url' ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="writer-sliders-upload-card">
                    <div className="writer-sliders-upload-preview"><Video size={28} /></div>
                    <div>
                      <strong>Campaign video</strong>
                      <span>Upload a video or paste its URL below.</span>
                    </div>
                    <button
                      type="button"
                      className="writer-sliders-btn secondary"
                      onClick={() => adVideoRef.current?.click()}
                      disabled={adUploadingField === 'video_url'}
                    >
                      <UploadCloud size={16} />
                      {adUploadingField === 'video_url' ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>

                  <div className="writer-sliders-upload-card">
                    <div className="writer-sliders-upload-preview">
                      {adForm.poster_url ? <img src={adForm.poster_url} alt="Poster preview" /> : <ImageIcon size={28} />}
                    </div>
                    <div>
                      <strong>Poster image</strong>
                      <span>Optional preview image for your video.</span>
                    </div>
                    <button
                      type="button"
                      className="writer-sliders-btn secondary"
                      onClick={() => adPosterRef.current?.click()}
                      disabled={adUploadingField === 'poster_url'}
                    >
                      <UploadCloud size={16} />
                      {adUploadingField === 'poster_url' ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </>
              )}

              <div className="writer-sliders-form-grid">
                {adForm.media_type === 'image' ? (
                  <label className="writer-sliders-field full">
                    <span>Image URL</span>
                    <input name="image_url" value={adForm.image_url} onChange={handleAdChange} placeholder="/uploads/... or https://..." />
                  </label>
                ) : (
                  <>
                    <label className="writer-sliders-field full">
                      <span>Video URL</span>
                      <input name="video_url" value={adForm.video_url} onChange={handleAdChange} placeholder="/uploads/... or https://..." />
                    </label>
                    <label className="writer-sliders-field full">
                      <span>Poster URL</span>
                      <input name="poster_url" value={adForm.poster_url} onChange={handleAdChange} placeholder="/uploads/... or https://..." />
                    </label>
                  </>
                )}

                <label className="writer-sliders-field">
                  <span>CTA label</span>
                  <input name="cta_label" value={adForm.cta_label} onChange={handleAdChange} placeholder="Shop Now" />
                </label>

                <label className="writer-sliders-field">
                  <span>CTA URL</span>
                  <input name="cta_url" value={adForm.cta_url} onChange={handleAdChange} placeholder="https://example.com/page" />
                </label>

                <label className="writer-sliders-field">
                  <span>Secondary CTA label</span>
                  <input
                    name="secondary_cta_label"
                    value={adForm.secondary_cta_label}
                    onChange={handleAdChange}
                    placeholder="Learn More"
                  />
                </label>

                <label className="writer-sliders-field">
                  <span>Secondary CTA URL</span>
                  <input
                    name="secondary_cta_url"
                    value={adForm.secondary_cta_url}
                    onChange={handleAdChange}
                    placeholder="https://example.com/page"
                  />
                </label>

                {!adEditingId ? (
                  <label className="writer-sliders-field">
                    <span>Campaign budget</span>
                    <input
                      type="number"
                      min={minimumBudget}
                      max={walletBalance || undefined}
                      step="0.01"
                      name="total_budget"
                      value={adForm.total_budget}
                      onChange={handleAdChange}
                    />
                    <small>Wallet balance {formatMoney(walletBalance)}</small>
                  </label>
                ) : null}

                <label className="writer-sliders-field">
                  <span>Daily budget cap</span>
                  <input
                    type="number"
                    min={minimumDailyCap}
                    step="0.01"
                    name="daily_budget_cap"
                    value={adForm.daily_budget_cap}
                    onChange={handleAdChange}
                    placeholder={`Optional, min ${minimumDailyCap}`}
                  />
                </label>

                <label className="writer-sliders-field">
                  <span>Start date</span>
                  <input type="date" name="start_date" value={adForm.start_date} onChange={handleAdChange} />
                </label>

                <label className="writer-sliders-field">
                  <span>End date</span>
                  <input type="date" name="end_date" value={adForm.end_date} onChange={handleAdChange} />
                </label>

                {!adEditingId ? (
                  <label className="writer-sliders-field full">
                    <span>Payment reference</span>
                    <input
                      name="payment_reference"
                      value={adForm.payment_reference}
                      onChange={handleAdChange}
                      placeholder="Optional payment reference"
                    />
                  </label>
                ) : null}
              </div>

              {adEditingId ? (
                <section className="writer-sliders-topup-box">
                  <div>
                    <strong>Campaign funding</strong>
                    <span>Add budget from your homepage ads wallet.</span>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      max={walletBalance || undefined}
                      value={topUpAmount}
                      onChange={(event) => setTopUpAmount(event.target.value)}
                      placeholder={`Top-up amount - ${formatMoney(walletBalance)} available`}
                    />
                    <button
                      type="button"
                      className="writer-sliders-btn secondary"
                      onClick={topUpAd}
                      disabled={String(adBusyId) === String(adEditingId)}
                    >
                      <Wallet size={16} />
                      Top Up
                    </button>
                  </div>
                </section>
              ) : null}

              {adsError ? (
                <div className="writer-sliders-alert error compact">
                  <AlertCircle size={16} />
                  <span>{adsError}</span>
                </div>
              ) : null}

              <div className="writer-sliders-drawer-actions">
                <button type="button" className="writer-sliders-btn secondary" onClick={() => setAdDrawerOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="writer-sliders-btn primary"
                  disabled={
                    adSaving ||
                    !!adUploadingField ||
                    (!adEditingId && walletBalance < minimumBudget) ||
                    (adEditingId && ['active', 'ended', 'exhausted'].includes(String(campaigns.find((item) => String(item.id) === String(adEditingId))?.status || '').toLowerCase()))
                  }
                >
                  <Save size={16} />
                  {adSaving ? 'Saving...' : adEditingId ? 'Save Changes' : 'Submit For Approval'}
                </button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

export default function AffiliateSlidersPage() {
  const location = useLocation();

  if (location.pathname.startsWith('/affiliate/')) {
    return <AffiliateSlidersLegacyPage />;
  }

  return <WriterSlidersWorkspace />;
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .writer-sliders-page {
    width: 100%;
    max-width: none;
    min-width: 0;
    margin: 0;
    padding: 24px 28px 48px;
    color: #111827;
    overflow-x: hidden;
  }

  .writer-sliders-page button,
  .writer-sliders-page input,
  .writer-sliders-page select,
  .writer-sliders-page textarea {
    font: inherit;
  }

  .writer-sliders-hidden-file {
    display: none;
  }

  .writer-sliders-tabs {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
    margin-bottom: 20px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #ffffff;
  }

  .writer-sliders-tabs button {
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: #6b7280;
    font-size: 14px;
    font-weight: 700;
    padding: 9px 14px;
    cursor: pointer;
  }

  .writer-sliders-tabs button.active {
    background: #111827;
    color: #ffffff;
  }

  .writer-sliders-command {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 22px;
    margin-bottom: 18px;
  }

  .writer-sliders-kicker {
    display: block;
    margin-bottom: 6px;
    color: #6b7280;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .writer-sliders-command h2 {
    margin: 0;
    color: #111827;
    font-size: 25px;
    line-height: 1.15;
    font-weight: 800;
  }

  .writer-sliders-command p {
    max-width: 760px;
    margin: 8px 0 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
  }

  .writer-sliders-command-actions,
  .writer-slider-actions,
  .writer-sliders-drawer-actions {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-wrap: wrap;
  }

  .writer-sliders-btn {
    min-height: 40px;
    border-radius: 9px;
    padding: 0 13px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border: 1px solid transparent;
    font-size: 13px;
    font-weight: 750;
    cursor: pointer;
    transition: 0.16s ease;
    white-space: nowrap;
  }

  .writer-sliders-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .writer-sliders-btn.primary {
    background: #111827;
    border-color: #111827;
    color: #ffffff;
  }

  .writer-sliders-btn.primary:not(:disabled):hover {
    background: #000000;
  }

  .writer-sliders-btn.secondary {
    background: #ffffff;
    border-color: #d1d5db;
    color: #374151;
  }

  .writer-sliders-btn.secondary:not(:disabled):hover {
    border-color: #9ca3af;
    background: #f9fafb;
  }

  .writer-sliders-btn.danger-ghost {
    background: #ffffff;
    border-color: #fecaca;
    color: #b91c1c;
  }

  .writer-sliders-stats {
    display: grid;
    gap: 12px;
    margin-bottom: 20px;
  }

  .writer-sliders-stats.three {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .writer-sliders-stats.four {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .writer-sliders-stats > div {
    min-width: 0;
    border: 1px solid #e5e7eb;
    border-radius: 13px;
    background: #ffffff;
    padding: 15px 16px;
  }

  .writer-sliders-stats span {
    display: block;
    color: #6b7280;
    font-size: 12px;
    font-weight: 650;
  }

  .writer-sliders-stats strong {
    display: block;
    margin-top: 7px;
    color: #111827;
    font-size: 24px;
    line-height: 1;
  }

  .writer-sliders-stats small {
    display: block;
    margin-top: 7px;
    color: #9ca3af;
    font-size: 11px;
  }

  .writer-slider-grid,
  .writer-ad-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    min-width: 0;
  }

  .writer-slider-card,
  .writer-ad-card {
    min-width: 0;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
  }

  .writer-slider-image {
    position: relative;
    aspect-ratio: 16 / 6.6;
    overflow: hidden;
    background: #f3f4f6;
  }

  .writer-slider-image img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .writer-slider-image-empty {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 8px;
    color: #9ca3af;
    font-size: 12px;
  }

  .writer-slider-image .writer-slider-pill {
    position: absolute;
    top: 12px;
    right: 12px;
  }

  .writer-slider-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 26px;
    border-radius: 999px;
    padding: 0 9px;
    font-size: 10px;
    font-weight: 800;
    text-transform: capitalize;
    border: 1px solid transparent;
  }

  .writer-slider-pill.success {
    background: #ecfdf3;
    color: #166534;
    border-color: #bbf7d0;
  }

  .writer-slider-pill.warning {
    background: #fffbeb;
    color: #92400e;
    border-color: #fde68a;
  }

  .writer-slider-pill.muted {
    background: #f3f4f6;
    color: #4b5563;
    border-color: #e5e7eb;
  }

  .writer-slider-pill.danger {
    background: #fef2f2;
    color: #b91c1c;
    border-color: #fecaca;
  }

  .writer-slider-pill.neutral {
    background: #f9fafb;
    color: #6b7280;
    border-color: #e5e7eb;
  }

  .writer-slider-card-body,
  .writer-ad-card {
    padding: 16px;
  }

  .writer-slider-card-title-row,
  .writer-ad-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .writer-slider-card-title-row > div,
  .writer-ad-card-head > div {
    min-width: 0;
  }

  .writer-slider-card h3,
  .writer-ad-card h3 {
    margin: 0;
    color: #111827;
    font-size: 16px;
    line-height: 1.3;
    font-weight: 800;
    overflow-wrap: anywhere;
  }

  .writer-slider-card p,
  .writer-ad-card p {
    margin: 5px 0 0;
    color: #6b7280;
    font-size: 12px;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .writer-slider-order {
    flex: 0 0 auto;
    min-width: 31px;
    height: 31px;
    display: grid;
    place-items: center;
    border-radius: 8px;
    background: #f3f4f6;
    color: #4b5563;
    font-size: 11px;
    font-weight: 800;
  }

  .writer-slider-meta {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.75fr);
    gap: 9px;
    margin: 14px 0;
  }

  .writer-slider-meta > div {
    min-width: 0;
    border-radius: 9px;
    background: #f9fafb;
    padding: 10px 11px;
  }

  .writer-slider-meta span,
  .writer-ad-budget span {
    display: block;
    color: #9ca3af;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .writer-slider-meta strong {
    display: block;
    margin-top: 4px;
    color: #374151;
    font-size: 12px;
    font-weight: 700;
    text-transform: capitalize;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .writer-slider-actions {
    padding-top: 13px;
    border-top: 1px solid #f3f4f6;
  }

  .writer-ad-card-pills {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  .writer-ad-budget {
    flex: 0 0 auto;
    text-align: right;
  }

  .writer-ad-budget strong {
    display: block;
    margin-top: 3px;
    color: #111827;
    font-size: 15px;
  }

  .writer-ad-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin: 15px 0;
  }

  .writer-ad-metrics > div {
    min-width: 0;
    border-radius: 9px;
    background: #f9fafb;
    padding: 10px;
  }

  .writer-ad-metrics svg {
    color: #9ca3af;
  }

  .writer-ad-metrics span {
    display: block;
    margin-top: 5px;
    color: #9ca3af;
    font-size: 10px;
  }

  .writer-ad-metrics strong {
    display: block;
    margin-top: 2px;
    color: #374151;
    font-size: 12px;
  }

  .writer-sliders-wallet {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(330px, 0.78fr);
    gap: 12px;
    margin-bottom: 12px;
  }

  .writer-sliders-wallet-summary,
  .writer-sliders-wallet-fund {
    min-width: 0;
    border: 1px solid #e5e7eb;
    border-radius: 13px;
    background: #ffffff;
    padding: 15px 16px;
  }

  .writer-sliders-wallet-summary {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .writer-sliders-wallet-icon {
    width: 42px;
    height: 42px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: #f3f4f6;
    color: #111827;
  }

  .writer-sliders-wallet-summary span,
  .writer-sliders-wallet-summary small {
    display: block;
    color: #6b7280;
    font-size: 11px;
  }

  .writer-sliders-wallet-summary strong {
    display: block;
    margin: 3px 0;
    color: #111827;
    font-size: 22px;
  }

  .writer-sliders-wallet-fund {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 9px;
    align-items: center;
  }

  .writer-sliders-wallet-fund input,
  .writer-sliders-topup-box input {
    width: 100%;
    min-width: 0;
    height: 40px;
    border: 1px solid #d1d5db;
    border-radius: 9px;
    background: #ffffff;
    color: #111827;
    padding: 0 11px;
    outline: none;
  }

  .writer-sliders-settings-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin: 0 0 18px;
  }

  .writer-sliders-settings-row span {
    min-height: 30px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    background: #ffffff;
    color: #6b7280;
    padding: 0 10px;
    font-size: 11px;
    font-weight: 650;
  }

  .writer-sliders-alert {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    border-radius: 10px;
    padding: 11px 12px;
    margin-bottom: 14px;
    font-size: 12px;
    line-height: 1.5;
  }

  .writer-sliders-alert.error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
  }

  .writer-sliders-alert.success {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #166534;
  }

  .writer-sliders-alert.compact {
    margin: 0;
  }

  .writer-sliders-loading,
  .writer-sliders-empty {
    min-height: 310px;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 9px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
    text-align: center;
    padding: 24px;
  }

  .writer-sliders-spinner {
    width: 34px;
    height: 34px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    animation: writerSliderSpin 0.8s linear infinite;
  }

  .writer-spin {
    animation: writerSliderSpin 0.8s linear infinite;
  }

  @keyframes writerSliderSpin {
    to { transform: rotate(360deg); }
  }

  .writer-sliders-empty-icon {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: #f3f4f6;
    color: #6b7280;
  }

  .writer-sliders-empty h3 {
    margin: 2px 0 0;
    font-size: 17px;
  }

  .writer-sliders-empty p {
    max-width: 430px;
    margin: 0 0 5px;
    color: #6b7280;
    font-size: 12px;
    line-height: 1.55;
  }

  .writer-sliders-history {
    margin-top: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
    padding: 16px;
  }

  .writer-sliders-history h3 {
    margin: 0;
    font-size: 14px;
  }

  .writer-sliders-history > div > p {
    margin: 4px 0 0;
    color: #9ca3af;
    font-size: 11px;
  }

  .writer-sliders-history-list {
    display: grid;
    gap: 0;
    margin-top: 12px;
  }

  .writer-sliders-history-list > div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 9px 0;
    border-top: 1px solid #f3f4f6;
    color: #6b7280;
    font-size: 11px;
    text-transform: capitalize;
  }

  .writer-sliders-history-list strong {
    color: #374151;
  }

  .writer-sliders-overlay {
    position: fixed;
    inset: 0;
    z-index: 1400;
    display: flex;
    justify-content: flex-end;
    background: rgba(17, 24, 39, 0.22);
  }

  .writer-sliders-drawer {
    width: min(500px, calc(100vw - 280px));
    min-width: 420px;
    height: 100vh;
    background: #ffffff;
    border-left: 1px solid #e5e7eb;
    box-shadow: -16px 0 45px rgba(17, 24, 39, 0.12);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .writer-sliders-drawer.wide {
    width: min(590px, calc(100vw - 260px));
  }

  .writer-sliders-drawer-head {
    min-height: 72px;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 18px;
    border-bottom: 1px solid #e5e7eb;
  }

  .writer-sliders-drawer-head span {
    display: block;
    color: #9ca3af;
    font-size: 10px;
    font-weight: 750;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .writer-sliders-drawer-head h3 {
    margin: 3px 0 0;
    font-size: 18px;
    color: #111827;
  }

  .writer-sliders-drawer-head > button {
    width: 36px;
    height: 36px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border: 1px solid #e5e7eb;
    border-radius: 9px;
    background: #ffffff;
    color: #4b5563;
    cursor: pointer;
  }

  .writer-sliders-drawer-body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 18px;
    display: grid;
    align-content: start;
    gap: 16px;
  }

  .writer-sliders-upload-card {
    display: grid;
    grid-template-columns: 74px minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #f9fafb;
    padding: 11px;
  }

  .writer-sliders-upload-preview {
    width: 74px;
    height: 54px;
    display: grid;
    place-items: center;
    overflow: hidden;
    border-radius: 9px;
    background: #e5e7eb;
    color: #6b7280;
  }

  .writer-sliders-upload-preview img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .writer-sliders-upload-card strong,
  .writer-sliders-upload-card span {
    display: block;
  }

  .writer-sliders-upload-card strong {
    color: #111827;
    font-size: 12px;
  }

  .writer-sliders-upload-card span {
    margin-top: 3px;
    color: #9ca3af;
    font-size: 10px;
    line-height: 1.4;
  }

  .writer-sliders-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 13px;
  }

  .writer-sliders-field {
    min-width: 0;
    display: grid;
    gap: 6px;
  }

  .writer-sliders-field.full {
    grid-column: 1 / -1;
  }

  .writer-sliders-field > span {
    color: #374151;
    font-size: 11px;
    font-weight: 750;
  }

  .writer-sliders-field input,
  .writer-sliders-field select,
  .writer-sliders-field textarea {
    width: 100%;
    min-width: 0;
    border: 1px solid #d1d5db;
    border-radius: 9px;
    background: #ffffff;
    color: #111827;
    outline: none;
    padding: 10px 11px;
    font-size: 12px;
  }

  .writer-sliders-field input,
  .writer-sliders-field select {
    height: 40px;
  }

  .writer-sliders-field textarea {
    resize: vertical;
    min-height: 82px;
    line-height: 1.5;
  }

  .writer-sliders-field input:focus,
  .writer-sliders-field select:focus,
  .writer-sliders-field textarea:focus,
  .writer-sliders-wallet-fund input:focus,
  .writer-sliders-topup-box input:focus {
    border-color: #6b7280;
    box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.10);
  }

  .writer-sliders-field small {
    color: #9ca3af;
    font-size: 9px;
  }

  .writer-sliders-topup-box {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #f9fafb;
    padding: 12px;
  }

  .writer-sliders-topup-box > div:first-child strong,
  .writer-sliders-topup-box > div:first-child span {
    display: block;
  }

  .writer-sliders-topup-box > div:first-child strong {
    font-size: 12px;
  }

  .writer-sliders-topup-box > div:first-child span {
    margin-top: 3px;
    color: #9ca3af;
    font-size: 10px;
  }

  .writer-sliders-topup-box > div:last-child {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    margin-top: 10px;
  }

  .writer-sliders-drawer-actions {
    justify-content: flex-end;
    padding-top: 4px;
  }

  @media (max-width: 1180px) {
    .writer-sliders-page {
      padding-left: 18px;
      padding-right: 18px;
    }

    .writer-sliders-wallet {
      grid-template-columns: 1fr;
    }

    .writer-sliders-stats.four {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .writer-slider-grid,
    .writer-ad-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 767px) {
    .writer-sliders-page {
      width: 100%;
      max-width: 100%;
      min-width: 0;
      padding: 14px 8px 32px;
      overflow-x: hidden;
    }

    .writer-sliders-tabs {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      margin-bottom: 16px;
    }

    .writer-sliders-tabs button {
      min-width: 0;
      padding-left: 8px;
      padding-right: 8px;
      font-size: 12px;
    }

    .writer-sliders-command {
      display: grid;
      gap: 14px;
    }

    .writer-sliders-command h2 {
      font-size: 21px;
    }

    .writer-sliders-command p {
      font-size: 12px;
    }

    .writer-sliders-command-actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      width: 100%;
    }

    .writer-sliders-command-actions .writer-sliders-btn {
      width: 100%;
      min-width: 0;
    }

    .writer-sliders-stats.three,
    .writer-sliders-stats.four {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .writer-sliders-stats.three > div:first-child {
      grid-column: 1 / -1;
    }

    .writer-sliders-stats > div {
      padding: 12px;
    }

    .writer-sliders-stats strong {
      font-size: 20px;
    }

    .writer-slider-grid,
    .writer-ad-grid {
      width: 100%;
      min-width: 0;
      grid-template-columns: minmax(0, 1fr);
      gap: 10px;
    }

    .writer-slider-card,
    .writer-ad-card {
      width: 100%;
      max-width: 100%;
      min-width: 0;
      border-radius: 12px;
    }

    .writer-slider-card-body,
    .writer-ad-card {
      padding: 13px;
    }

    .writer-slider-actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .writer-slider-actions .writer-sliders-btn {
      width: 100%;
      min-width: 0;
    }

    .writer-ad-metrics {
      gap: 6px;
    }

    .writer-ad-metrics > div {
      padding: 8px;
    }

    .writer-sliders-wallet {
      gap: 8px;
    }

    .writer-sliders-wallet-summary,
    .writer-sliders-wallet-fund {
      padding: 12px;
    }

    .writer-sliders-wallet-fund {
      grid-template-columns: 1fr;
    }

    .writer-sliders-wallet-fund .writer-sliders-btn {
      width: 100%;
    }

    .writer-sliders-settings-row {
      gap: 6px;
    }

    .writer-sliders-settings-row span {
      max-width: 100%;
    }

    .writer-sliders-overlay {
      background: #ffffff;
    }

    .writer-sliders-drawer,
    .writer-sliders-drawer.wide {
      width: 100vw;
      max-width: 100vw;
      min-width: 0;
      height: 100dvh;
      border-left: 0;
      box-shadow: none;
    }

    .writer-sliders-drawer-head {
      min-height: 64px;
      padding: 12px;
    }

    .writer-sliders-drawer-body {
      padding: 12px 8px 24px;
    }

    .writer-sliders-form-grid {
      grid-template-columns: minmax(0, 1fr);
      gap: 11px;
    }

    .writer-sliders-field.full {
      grid-column: auto;
    }

    .writer-sliders-upload-card {
      grid-template-columns: 60px minmax(0, 1fr);
      gap: 9px;
    }

    .writer-sliders-upload-preview {
      width: 60px;
      height: 50px;
    }

    .writer-sliders-upload-card .writer-sliders-btn {
      grid-column: 1 / -1;
      width: 100%;
    }

    .writer-sliders-topup-box > div:last-child {
      grid-template-columns: 1fr;
    }

    .writer-sliders-topup-box .writer-sliders-btn {
      width: 100%;
    }

    .writer-sliders-drawer-actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      width: 100%;
    }

    .writer-sliders-drawer-actions .writer-sliders-btn {
      width: 100%;
      min-width: 0;
    }
  }
`;