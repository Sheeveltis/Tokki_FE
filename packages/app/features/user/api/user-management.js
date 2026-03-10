import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

/**
 * Lấy danh sách người dùng với phân trang và bộ lọc từ Backend
 */
export const fetchUsers = async ({ 
  pageNumber = 1, 
  pageSize = 10, 
  searchName = '', 
  status = null, 
  role = null 
} = {}) => {
  const query = new URLSearchParams()
  query.set('PageNumber', pageNumber)
  query.set('PageSize', pageSize)
  
  // Chỉ gắn param vào URL nếu có giá trị (tránh gửi null lên BE)
  if (searchName) query.set('SearchName', searchName)
  if (status !== null && status !== undefined && status !== '') query.set('Status', status)
  if (role !== null && role !== undefined && role !== '') query.set('Role', role)

  const url = `${ENDPOINTS.ACCOUNT.GET_ALL}?${query.toString()}`
  const res = await apiClient.get(url)
  const data = res?.data?.data || res?.data || {}

  const items = data.items || data.data || []
  const total = data.totalCount ?? data.total ?? items.length

  return { items, total, pageNumber, pageSize }
}