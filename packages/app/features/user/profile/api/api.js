import { apiClient } from '../../../../provider/api/client'
import { ENDPOINTS } from '../../../../provider/api/endpoints'

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

