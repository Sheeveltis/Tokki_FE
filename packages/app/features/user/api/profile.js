import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

/**
 * Lấy thông tin người dùng hiện tại
 * @returns {Promise<Object>} 
 */
export const getCurrentUser = async () => {
  const res = await apiClient.get(ENDPOINTS.ACCOUNT.ME)
  const response = res.data
  if (response?.isSuccess && response?.data) {
    return response.data
  }
  throw new Error(response?.message || 'Không thể lấy thông tin người dùng')
}

/**
 * Cập nhật thông tin cơ bản (first name, last name)
 * @param {Object} payload - { firstName, lastName }
 * @returns {Promise<Object>} Updated user data
 */
export const updateBasicInfo = async (payload) => {
  const res = await apiClient.put(ENDPOINTS.ACCOUNT.PROFILE, payload)
  const response = res.data
  if (response?.isSuccess && response?.data) {
    return response.data
  }
  throw new Error(response?.message || 'Không thể cập nhật thông tin')
}

/**
 * Cập nhật thông tin bảo mật (email, phone)
 * @param {Object} payload - { email, phoneNumber }
 * @returns {Promise<Object>} Updated user data
 */
export const updateSecurityInfo = async (payload) => {
  const res = await apiClient.put(ENDPOINTS.ACCOUNT.PROFILE, payload)
  const response = res.data
  if (response?.isSuccess && response?.data) {
    return response.data
  }
  throw new Error(response?.message || 'Không thể cập nhật thông tin bảo mật')
}

/**
 * Cập nhật avatar bằng cách gửi avatarUrl (base64 hoặc url) qua API profile
 * @param {string} avatarUrl - Image data (url hoặc base64 data URL)
 * @returns {Promise<Object>} Updated user data
 */
export const uploadAvatar = async (avatarUrl) => {
  if (!avatarUrl) throw new Error('Không có dữ liệu ảnh')

  const res = await apiClient.put(ENDPOINTS.ACCOUNT.PROFILE, { avatarUrl })
  const response = res.data
  if (response?.isSuccess && response?.data) {
    return response.data
  }
  throw new Error(response?.message || 'Không thể cập nhật avatar')
}

/**
 * Lấy thông tin title theo titleId
 * @param {string} titleId - ID của title
 * @returns {Promise<Object>} Title data (name, description, colorHex, iconUrl, etc.)
 */
export const getTitleById = async (titleId) => {
  if (!titleId) {
    throw new Error('TitleId không được để trống')
  }

  const res = await apiClient.get(ENDPOINTS.TITLE.GET_BY_ID(titleId))
  const response = res.data
  if (response?.isSuccess && response?.data) {
    return response.data
  }
  throw new Error(response?.message || 'Không thể lấy thông tin title')
}

/**
 * Lấy thông tin progress (level, XP, streak, title) của người dùng
 * @param {string} userId - ID của người dùng
 * @returns {Promise<Object>} Progress data (level, totalXP, xpInCurrentLevel, maxXPOfLevel, progressPercentage, streak, title)
 */
export const getProgress = async (userId) => {
  if (!userId) {
    throw new Error('UserId không được để trống')
  }

  console.log('[getProgress] Gọi API với userId:', userId)
  console.log('[getProgress] Endpoint:', ENDPOINTS.GAMIFICATION.PROGRESS(userId))
  
  const res = await apiClient.get(ENDPOINTS.GAMIFICATION.PROGRESS(userId))
  console.log('[getProgress] Raw response:', res)
  console.log('[getProgress] Response data:', res.data)
  
  const response = res.data
  
  // API có thể trả về 2 format:
  // 1. Wrapped: { isSuccess: true, data: {...} }
  // 2. Direct: { level: 2, totalXP: 200, ... }
  if (response?.isSuccess && response?.data) {
    console.log('[getProgress] Format: Wrapped, returning response.data')
    return response.data
  }
  
  // Nếu không có wrapper, trả về trực tiếp response
  if (response && typeof response === 'object' && 'level' in response) {
    console.log('[getProgress] Format: Direct, returning response directly')
    return response
  }
  
  console.error('[getProgress] Unknown response format:', response)
  throw new Error(response?.message || 'Không thể lấy thông tin progress')
}

