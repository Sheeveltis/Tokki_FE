import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

// GET /api/Passages
// Query: SearchTerm, MediaType, Status, PageNumber, PageSize
export async function fetchPassages(params = {}) {
  const res = await apiClient.get(ENDPOINTS.PASSAGE.GET_ALL, { params })
  const data = res.data?.data

  // backend trả paging: { items, pageNumber, pageSize, totalCount ... }
  if (data?.items) return data

  // fallback non-paging
  return { items: Array.isArray(data) ? data : [] }
}

// POST /api/Passages
// Body: { title, content, imageUrl, mediaType }
// - Text (mediaType=0): content bắt buộc, imageUrl = null
// - Image (mediaType=1) / Audio (mediaType=2): imageUrl bắt buộc, content = null
export async function createPassage(payload) {
  const res = await apiClient.post(ENDPOINTS.PASSAGE.CREATE, payload)
  return res.data
}

// PUT /api/Passages/update
export async function updatePassage(payload) {
  const res = await apiClient.put(ENDPOINTS.PASSAGE.UPDATE, payload)
  return res.data
}

// DELETE /api/Passages/{id}
export async function deletePassage(id) {
  const res = await apiClient.delete(ENDPOINTS.PASSAGE.DELETE(id))
  return res.data
}

