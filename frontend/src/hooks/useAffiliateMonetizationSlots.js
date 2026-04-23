import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const initialState = {
  monetization_mode: 'individual',
  provider_name: '',
  provider_type: 'adsense',
  publisher_id: '',
  head_code: '',
  notes: '',
  storefront_top_enabled: 0,
  storefront_sidebar_enabled: 0,
  storefront_bottom_enabled: 0,
  post_top_enabled: 0,
  post_middle_enabled: 0,
  post_bottom_enabled: 0,
  post_sidebar_enabled: 0,
  review_status: 'draft',
  submitted_at: null,
  reviewed_at: null,
  admin_review_note: '',
};

function normalizeSettings(settings = {}) {
  return {
    ...initialState,
    ...settings,
    monetization_mode: settings?.monetization_mode === 'platform' ? 'platform' : 'individual',
    provider_name: settings?.provider_name || '',
    provider_type: settings?.provider_type || 'adsense',
    publisher_id: settings?.publisher_id || '',
    head_code: settings?.head_code || '',
    notes: settings?.notes || '',
    storefront_top_enabled: Number(settings?.storefront_top_enabled || 0),
    storefront_sidebar_enabled: Number(settings?.storefront_sidebar_enabled || 0),
    storefront_bottom_enabled: Number(settings?.storefront_bottom_enabled || 0),
    post_top_enabled: Number(settings?.post_top_enabled || 0),
    post_middle_enabled: Number(settings?.post_middle_enabled || 0),
    post_bottom_enabled: Number(settings?.post_bottom_enabled || 0),
    post_sidebar_enabled: Number(settings?.post_sidebar_enabled || 0),
    review_status: settings?.review_status || 'draft',
    submitted_at: settings?.submitted_at || null,
    reviewed_at: settings?.reviewed_at || null,
    admin_review_note: settings?.admin_review_note || '',
  };
}

export default function useAffiliateMonetizationSlots(options = {}) {
  const {
    enabled = true,
    endpoint = '/api/affiliate/dashboard/monetization/settings',
  } = options;

  const [settings, setSettings] = useState(initialState);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadSlots() {
      if (!enabled) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const { data } = await api.get(endpoint);

        if (!data?.ok) {
          throw new Error(data?.message || 'Failed to load monetization slots.');
        }

        if (!ignore) {
          setSettings(normalizeSettings(data.settings || {}));
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err?.response?.data?.message ||
              err.message ||
              'Failed to load monetization slots.'
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadSlots();

    return () => {
      ignore = true;
    };
  }, [enabled, endpoint]);

  const slotFlags = useMemo(
    () => ({
      storefront_top: Number(settings.storefront_top_enabled) === 1,
      storefront_sidebar: Number(settings.storefront_sidebar_enabled) === 1,
      storefront_bottom: Number(settings.storefront_bottom_enabled) === 1,
      post_top: Number(settings.post_top_enabled) === 1,
      post_middle: Number(settings.post_middle_enabled) === 1,
      post_bottom: Number(settings.post_bottom_enabled) === 1,
      post_sidebar: Number(settings.post_sidebar_enabled) === 1,
    }),
    [settings]
  );

  const isApproved = settings.review_status === 'approved';
  const isPlatformMode = settings.monetization_mode === 'platform';
  const isIndividualMode = settings.monetization_mode === 'individual';

  return {
    settings,
    slotFlags,
    loading,
    error,
    isApproved,
    isPlatformMode,
    isIndividualMode,
    refresh: async () => {
      const { data } = await api.get(endpoint);
      if (data?.ok) {
        setSettings(normalizeSettings(data.settings || {}));
      }
      return data;
    },
  };
}