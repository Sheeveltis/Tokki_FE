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

/**
 * Vô hiệu hóa / xoá tài khoản theo userId (DELETE /Account/{userId})
 */
export const deleteUserById = async (userId) => {
  if (!userId) throw new Error('userId is required')
  const res = await apiClient.delete(ENDPOINTS.ACCOUNT.DELETE(userId))
  return res?.data
}

/**
 * Upload ảnh avatar lên Cloudinary
 * @param {File} file - File ảnh cần upload
 * @returns {Promise<string>} URL của ảnh trên Cloudinary
 */
export const uploadAvatarToCloudinary = async (file) => {
  if (!file) throw new Error('File is required')
  
  const formData = new FormData()
  formData.append('file', file)
  
  const res = await apiClient.post(ENDPOINTS.CLOUDINARY.UPLOAD_AVATAR, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  
  const response = res?.data
  if (response?.isSuccess && response?.data) {
    return response.data
  }
  throw new Error(response?.message || 'Không thể upload ảnh lên Cloudinary')
}


