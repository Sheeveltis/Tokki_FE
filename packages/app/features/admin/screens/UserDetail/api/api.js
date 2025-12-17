import { apiClient } from '../../../../../provider/api/client'
import { ENDPOINTS } from '../../../../../provider/api/endpoints'

/**
 * Lấy chi tiết tài khoản theo userId
 * @param {string} userId
 */
export const fetchUserDetail = async (userId) => {
  if (!userId) throw new Error('userId is required')
  const url = ENDPOINTS.ACCOUNT.DETAIL(userId)
  const res = await apiClient.get(url)
  const data = res?.data?.data || res?.data || {}
  return data
}

/**
 * Cập nhật thông tin tài khoản (update-user)
 * Body: { targetUserId, fullName, phoneNumber, dateOfBirth, avatarUrl, role, status }
 */
export const updateUserProfile = async (payload) => {
  const res = await apiClient.put(ENDPOINTS.ACCOUNT.UPDATE_USER, payload)
  return res?.data
}
