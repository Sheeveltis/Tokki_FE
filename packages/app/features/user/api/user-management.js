import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

/**
 * Lấy danh sách người dùng với phân trang và bộ lọc từ Backend
 */
export const fetchUsers = async ({ 
  pageNumber = 1, 
  pageSize = 10, 
  searchText = '', 
  status = null, 
  role = null,
  vipStatus = null
} = {}) => {
  const query = new URLSearchParams()
  query.set('PageNumber', pageNumber)
  query.set('PageSize', pageSize)
  
  // Chỉ gắn param vào URL nếu có giá trị (tránh gửi null lên BE)
  if (searchText) query.set('SearchText', searchText)
  if (status !== null && status !== undefined && status !== '') query.set('Status', status)
  if (role !== null && role !== undefined && role !== '') query.set('Role', role)
  if (vipStatus !== null && vipStatus !== undefined && vipStatus !== '') query.set('VipStatus', vipStatus)

  const url = `${ENDPOINTS.ACCOUNT.GET_ALL}?${query.toString()}`
  const res = await apiClient.get(url)
  const data = res?.data?.data || res?.data || {}

  const items = data.items || data.data || []
  const total = data.totalCount ?? data.total ?? items.length

  return { items, total, pageNumber, pageSize }
}

/**
 * Import danh sách người dùng từ Excel
 */
export const importAccount = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const res = await apiClient.post(ENDPOINTS.EXCEL.IMPORT_ACCOUNT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return res?.data
}

/**
 * Export toàn bộ danh sách người dùng ra file Excel
 */
export const exportAccount = async () => {
  const res = await apiClient.get(ENDPOINTS.EXCEL.EXPORT_ACCOUNT, {
    responseType: 'blob',
    timeout: 30000, // Export file có thể lâu hơn chút
  })
  return res.data // Trả về Blob object
}