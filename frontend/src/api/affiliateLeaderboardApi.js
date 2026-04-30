import api from './axios'

export async function fetchAffiliateLeaderboard(params = {}) {
  const response = await api.get('/api/affiliate/leaderboard', {
    params,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('bloggad_token') || ''}`,
    },
  })

  return response.data
}

export async function fetchMyLeaderboardRank(params = {}) {
  const response = await api.get('/api/affiliate/leaderboard/me', {
    params,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('bloggad_token') || ''}`,
    },
  })

  return response.data
}

export async function refreshAffiliateLeaderboard() {
  const response = await api.post(
    '/api/affiliate/leaderboard/refresh',
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('bloggad_token') || ''}`,
      },
    }
  )

  return response.data
}