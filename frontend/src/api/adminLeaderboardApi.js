import api from './axios'

export async function fetchAdminLeaderboard(params = {}) {
  const response = await api.get('/api/admin/leaderboard', {
    params,
  })

  return response.data
}

export async function refreshAdminLeaderboard() {
  const response = await api.post('/api/admin/leaderboard/refresh', {})

  return response.data
}

export async function saveLeaderboardAdjustment(affiliateId, payload = {}) {
  const response = await api.put(
    `/api/admin/leaderboard/${affiliateId}/adjustment`,
    payload
  )

  return response.data
}

export async function clearLeaderboardAdjustment(affiliateId, payload = {}) {
  const response = await api.delete(
    `/api/admin/leaderboard/${affiliateId}/adjustment`,
    {
      data: payload,
    }
  )

  return response.data
}

export async function disqualifyLeaderboardAffiliate(affiliateId, payload = {}) {
  const response = await api.put(
    `/api/admin/leaderboard/${affiliateId}/disqualify`,
    payload
  )

  return response.data
}

export async function restoreLeaderboardAffiliate(affiliateId, payload = {}) {
  const response = await api.put(
    `/api/admin/leaderboard/${affiliateId}/restore`,
    payload
  )

  return response.data
}