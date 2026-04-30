import api from '../api/axios';

export async function getAdminCurrencies() {
  const { data } = await api.get('/api/admin/currencies');
  return data;
}

export async function createAdminCurrency(payload) {
  const { data } = await api.post('/api/admin/currencies', payload);
  return data;
}

export async function updateAdminCurrency(id, payload) {
  const { data } = await api.put(`/api/admin/currencies/${id}`, payload);
  return data;
}

export async function deleteAdminCurrency(id) {
  const { data } = await api.delete(`/api/admin/currencies/${id}`);
  return data;
}

export async function setDefaultAdminCurrency(id) {
  const { data } = await api.patch(`/api/admin/currencies/${id}/default`);
  return data;
}

export async function toggleAdminCurrencyStatus(id) {
  const { data } = await api.patch(`/api/admin/currencies/${id}/status`);
  return data;
}