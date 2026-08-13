export const SUPGAD_RETURN_ROLE_KEY = 'bloggad_supgad_return_role';

const SUPGAD_ROLE_DASHBOARDS = Object.freeze({
  vendor: '/vendor/dashboard',
  affiliate: '/affiliate/dashboard',
  affiliate_manager: '/affiliate-manager/dashboard',
  freelancer: '/freelancer/dashboard',
  employer: '/employer/dashboard',
  customer: '/customer/dashboard',
  admin: '/admin/dashboard',
});

export function normalizeSupgadReturnRole(value) {
  const role = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_');

  return SUPGAD_ROLE_DASHBOARDS[role] ? role : '';
}

export function saveSupgadReturnRole(value) {
  const role = normalizeSupgadReturnRole(value);

  if (role) {
    localStorage.setItem(SUPGAD_RETURN_ROLE_KEY, role);
  } else {
    localStorage.removeItem(SUPGAD_RETURN_ROLE_KEY);
  }
}

export function clearSupgadReturnRole() {
  localStorage.removeItem(SUPGAD_RETURN_ROLE_KEY);
}

export function getSupgadReturnUrl() {
  if (typeof window === 'undefined') return '';

  const role = normalizeSupgadReturnRole(
    localStorage.getItem(SUPGAD_RETURN_ROLE_KEY)
  );

  const dashboardPath = SUPGAD_ROLE_DASHBOARDS[role];

  return dashboardPath ? `https://supgad.com${dashboardPath}` : '';
}