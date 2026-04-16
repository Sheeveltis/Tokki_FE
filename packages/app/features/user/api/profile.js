import { apiClient, getCurrentUserId } from '../../../provider/api/client'
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
 * Upload ảnh avatar lên Cloudinary
 * @param {File|Blob} file - File ảnh cần upload
 * @returns {Promise<string>} URL Cloudinary
 */
export const uploadAvatarToCloudinary = async (file) => {
  if (!file) throw new Error('Không có file ảnh')
  
  console.log('Finalizing upload for file:', file.name, 'Size:', file.size, 'Type:', file.type)

  const formData = new FormData()
  // Sử dụng 'File' viết hoa để khớp chính xác với property trong backend RuleFor(x => x.File)
  formData.append('File', file, file.name)

  const res = await apiClient.post(ENDPOINTS.CLOUDINARY.UPLOAD_AVATAR, formData)

  const response = res.data
  if (response?.isSuccess && response?.data) {
    return response.data
  }
  throw new Error(response?.message || 'Không thể upload ảnh lên Cloudinary')
}

/**
 * Cập nhật avatarUrl vào profile account hiện tại
 * @param {Object} payload - Payload chứa avatarUrl và các thông tin cá nhân hiện có
 * @returns {Promise<Object>} Updated user data
 */
export const uploadAvatar = async (payload) => {
  if (!payload?.avatarUrl) throw new Error('Không có avatarUrl')

  const res = await apiClient.put(ENDPOINTS.ACCOUNT.PROFILE, payload)
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
 * Lấy thông tin progress (level, XP, streak, title) của người dùng hiện tại
 * @returns {Promise<Object>} Progress data (level, totalXP, xpInCurrentLevel, maxXPOfLevel, progressPercentage, streak, title)
 */
export const getProgress = async () => {
  const res = await apiClient.get(ENDPOINTS.GAMIFICATION.PROGRESS)
  const response = res.data
  
  if (response?.isSuccess && response?.data) {
    return response.data
  }
  
  if (response && typeof response === 'object' && 'level' in response) {
    return response
  }
  
  throw new Error(response?.message || 'Không thể lấy thông tin progress')
}

/**
 * Lấy danh sách danh hiệu của người dùng hiện tại
 * @param {number} pageNumber - Trang hiện tại
 * @param {number} pageSize - Số danh hiệu mỗi trang
 * @returns {Promise<Object>} Response từ API chứa danh sách danh hiệu
 */
export const getMyTitles = async (pageNumber = 1, pageSize = 10) => {
  const res = await apiClient.get(ENDPOINTS.TITLE.MY_TITLES, {
    params: {
      pageNumber,
      pageSize,
    },
  })
  const response = res.data
  if (response?.isSuccess && response?.data) {
    return response.data
  }
  throw new Error(response?.message || 'Không thể lấy danh sách danh hiệu')
}

/**
 * Cập nhật danh hiệu hiện tại của người dùng
 * @param {string} titleId - ID của danh hiệu muốn sử dụng
 * @returns {Promise<Object>} Updated user data
 */
export const updateCurrentTitle = async (titleId) => {
  const userId = getCurrentUserId()
  if (!userId) throw new Error('Không tìm thấy thông tin người dùng')
  
  const res = await apiClient.put(ENDPOINTS.TITLE.EQUIP, { titleId, userId })
  const response = res.data
  if (response?.isSuccess) {
    return response.data
  }
  throw new Error(response?.message || 'Không thể cập nhật danh hiệu')
}

/**
 * Lấy lịch sử làm bài thi của người dùng hiện tại
 * @param {number} pageNumber - Trang hiện tại
 * @param {number} pageSize - Số bản ghi mỗi trang
 * @returns {Promise<Object>} Response chứa danh sách lịch sử thi
 */
export const getExamHistory = async (pageNumber = 1, pageSize = 10) => {
  const res = await apiClient.get(ENDPOINTS.USER_EXAM.HISTORY, {
    params: {
      pageNumber,
      pageSize,
    },
  })
  const response = res.data
  if (response?.isSuccess && response?.data) {
    return response.data
  }
  throw new Error(response?.message || 'Không thể lấy lịch sử làm bài')
}
