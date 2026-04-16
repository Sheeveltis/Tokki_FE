import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

/**
 * Lấy danh sách cấu hình hệ thống (có phân trang)
 * @param {object} params { pageNumber, pageSize, keyword }
 */
export const fetchSystemConfigs = async (params) => {
  const response = await apiClient.get(ENDPOINTS.SYSTEM_CONFIGS.GET_ALL, { params })
  return response?.data?.data || response?.data
}

export const createSystemConfig = async (data) => {
  const response = await apiClient.post(ENDPOINTS.SYSTEM_CONFIGS.CREATE, data)
  return response?.data
}

export const updateSystemConfig = async (data) => {
  const response = await apiClient.put(ENDPOINTS.SYSTEM_CONFIGS.UPDATE, data)
  return response?.data
}

/**
 * Lấy chi tiết cấu hình hệ thống bằng key
 * @param {string} key 
 */
export const fetchSystemConfigByKey = async (key) => {
  const response = await apiClient.get(ENDPOINTS.SYSTEM_CONFIGS.GET_BY_KEY(key))
  return response?.data?.data || response?.data
}
