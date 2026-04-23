export const MONETIZATION_SLOT_KEYS = [
  'storefront_top',
  'storefront_sidebar',
  'storefront_bottom',
  'post_top',
  'post_middle',
  'post_bottom',
  'post_sidebar',
];

export function getSlotSettingField(slotKey = '') {
  const fieldMap = {
    storefront_top: 'storefront_top_enabled',
    storefront_sidebar: 'storefront_sidebar_enabled',
    storefront_bottom: 'storefront_bottom_enabled',
    post_top: 'post_top_enabled',
    post_middle: 'post_middle_enabled',
    post_bottom: 'post_bottom_enabled',
    post_sidebar: 'post_sidebar_enabled',
  };

  return fieldMap[slotKey] || '';
}

export function isValidMonetizationSlot(slotKey = '') {
  return MONETIZATION_SLOT_KEYS.includes(slotKey);
}

export function isSlotEnabled(slotKey = '', settings = {}) {
  const field = getSlotSettingField(slotKey);
  if (!field) return false;
  return Number(settings?.[field] || 0) === 1;
}

export function isPlatformMode(settings = {}) {
  return settings?.monetization_mode === 'platform';
}

export function isIndividualMode(settings = {}) {
  return settings?.monetization_mode === 'individual';
}

export function isApprovedMonetization(settings = {}) {
  return settings?.review_status === 'approved';
}

export function canRenderSlot({
  slotKey = '',
  settings = {},
  placementMode = 'storefront',
  reviewRequired = true,
}) {
  if (!isValidMonetizationSlot(slotKey)) return false;
  if (!isSlotEnabled(slotKey, settings)) return false;

  if (placementMode === 'storefront' && slotKey.startsWith('post_')) return false;
  if (placementMode === 'post' && slotKey.startsWith('storefront_')) return false;

  if (reviewRequired && !isApprovedMonetization(settings)) return false;

  if (isIndividualMode(settings)) {
    const hasAdCode = String(settings?.head_code || '').trim();
    if (!hasAdCode) return false;
  }

  return true;
}

export function getSlotLabel(slotKey = '') {
  const labels = {
    storefront_top: 'Storefront Top Ad',
    storefront_sidebar: 'Storefront Sidebar Ad',
    storefront_bottom: 'Storefront Bottom Ad',
    post_top: 'Post Top Ad',
    post_middle: 'Post Middle Ad',
    post_bottom: 'Post Bottom Ad',
    post_sidebar: 'Post Sidebar Ad',
  };

  return labels[slotKey] || 'Ad Slot';
}

export function getEnabledSlots(settings = {}, placementMode = 'storefront') {
  return MONETIZATION_SLOT_KEYS.filter((slotKey) =>
    canRenderSlot({
      slotKey,
      settings,
      placementMode,
      reviewRequired: false,
    })
  );
}