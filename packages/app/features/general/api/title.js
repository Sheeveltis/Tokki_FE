import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

export async function fetchTitles(params = {}) {
  const res = await apiClient.get(ENDPOINTS.TITLE.GET_ALL, { params })
  const data = res.data?.data
  // handle paged ({ items }) or array responses
  return Array.isArray(data) ? data : data?.items || []
}

export async function createTitle(payload) {
  const res = await apiClient.post(ENDPOINTS.TITLE.CREATE, payload)
  return res.data
}

export async function updateTitle(id, payload) {
  const res = await apiClient.put(ENDPOINTS.TITLE.UPDATE(id), payload)
  return res.data
}

export async function deleteTitle(id) {
  const res = await apiClient.delete(ENDPOINTS.TITLE.DELETE(id))
  return res.data
}



