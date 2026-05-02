import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

export const fetchTopikConfigs = async (params) => {
  const response = await apiClient.get('/TopikLevelConfig', { 
    params: {
      pageNumber: params?.pageNumber || 1,
      pageSize: params?.pageSize || 20,
    } 
  })
  return response?.data?.data || response?.data
}

export const createTopikConfig = async (data) => {
  const response = await apiClient.post('/TopikLevelConfig', data)
  return response?.data
}

export const updateTopikConfig = async (id, data) => {
  const response = await apiClient.put(`/TopikLevelConfig/${id}`, data)
  return response?.data
}

export const deleteTopikConfig = async (id) => {
  const response = await apiClient.delete(`/TopikLevelConfig/${id}`)
  return response?.data
}
