import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

/**
 * Lấy danh sách người dùng với phân trang
 * @param {{ pageNumber?: number, pageSize?: number, search?: string }} params
 * @returns {Promise<{items: Array, total: number, pageNumber: number, pageSize: number}>}
 */
export const fetchUsers = async ({ pageNumber = 1, pageSize = 10, search = '' } = {}) => {
  const query = new URLSearchParams()
  query.set('pageNumber', pageNumber)
  query.set('pageSize', pageSize)
  if (search) query.set('search', search)

  const url = `${ENDPOINTS.ACCOUNT.GET_ALL}?${query.toString()}`
  const res = await apiClient.get(url)
  const data = res?.data?.data || res?.data || {}

  const items = data.items || data.data || []
  const total = data.totalCount ?? data.total ?? items.length

  return {
    items,
    total,
    pageNumber,
    pageSize,
  }
}

