// Centralized Admin Panel business logic and mock API functions.
// Replace mock data with real API calls when backend is ready.

import {
  mockUsers,
  mockLessons,
  mockVocabularies,
  mockArticles,
  mockSystemLogs,
  mockPayments,
  mockFeedbacks,
  mockMembershipPackages,
  mockAIStatistics,
} from '../mockData.js'
import { apiErrors } from '../../../string.js'

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms))

/**
 * Helper function để xử lý lỗi API và throw error với message từ apiErrors
 * @param {Error|Response|number|string} error - Error object, Response object, status code, hoặc error key
 * @param {string} customMessage - Custom message nếu cần override
 */
function handleApiError(error, customMessage = null) {
  let message = customMessage

  // Nếu là Response object (fetch API)
  if (error?.status) {
    const status = error.status
    message = apiErrors[status] || apiErrors.unknown
  }
  // Nếu là status code number
  else if (typeof error === 'number') {
    message = apiErrors[error] || apiErrors.unknown
  }
  // Nếu là error key string
  else if (typeof error === 'string' && apiErrors[error]) {
    message = apiErrors[error]
  }
  // Nếu là Error object
  else if (error?.message) {
    // Kiểm tra xem message có phải là status code không
    const statusMatch = error.message.match(/\b([45]\d{2})\b/)
    if (statusMatch) {
      message = apiErrors[statusMatch[1]] || error.message
    } else {
      message = error.message
    }
  }
  // Network errors
  else if (error?.name === 'TypeError' && error.message.includes('fetch')) {
    message = apiErrors.network
  }
  // Timeout
  else if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
    message = apiErrors.timeout
  }
  // Default
  else {
    message = customMessage || apiErrors.unknown
  }

  const apiError = new Error(message)
  apiError.status = typeof error === 'number' ? error : error?.status
  apiError.originalError = error
  throw apiError
}

/**
 * Wrapper cho API calls với error handling
 */
async function apiCall(fn, errorMessage = null) {
  try {
    return await fn()
  } catch (error) {
    handleApiError(error, errorMessage)
  }
}

export async function fetchUsers() {
  try {
    await delay()
    // Simulate error for testing (uncomment to test)
    // if (Math.random() > 0.9) throw { status: 500 }
    return mockUsers
  } catch (error) {
    handleApiError(error, 'Không thể tải danh sách người dùng')
  }
}

export async function fetchLessons() {
  try {
    await delay()
    return mockLessons
  } catch (error) {
    handleApiError(error, 'Không thể tải danh sách bài học')
  }
}

export async function fetchVocabularies() {
  try {
    await delay()
    return mockVocabularies
  } catch (error) {
    handleApiError(error, 'Không thể tải danh sách từ vựng')
  }
}

export async function fetchArticles() {
  try {
    await delay()
    return mockArticles
  } catch (error) {
    handleApiError(error, 'Không thể tải danh sách bài viết')
  }
}

export async function fetchSystemLogs() {
  try {
    await delay()
    return mockSystemLogs
  } catch (error) {
    handleApiError(error, 'Không thể tải system logs')
  }
}

export async function updateUser(payload) {
  try {
    await delay()
    // mock: return merged
    return { ...payload }
  } catch (error) {
    handleApiError(error, 'Không thể cập nhật thông tin người dùng')
  }
}

export async function updateLesson(payload) {
  try {
    await delay()
    return { ...payload }
  } catch (error) {
    handleApiError(error, 'Không thể cập nhật bài học')
  }
}

export async function updateVocabulary(payload) {
  try {
    await delay()
    return { ...payload }
  } catch (error) {
    handleApiError(error, 'Không thể cập nhật từ vựng')
  }
}

export async function updateArticle(payload) {
  try {
    await delay()
    return { ...payload }
  } catch (error) {
    handleApiError(error, 'Không thể cập nhật bài viết')
  }
}

export async function updateSettings(payload) {
  try {
    await delay()
    return { ...payload }
  } catch (error) {
    handleApiError(error, 'Không thể cập nhật cài đặt')
  }
}

// Create APIs
export async function createUser(payload) {
  try {
    await delay()
    // Validate required fields
    if (!payload.name || !payload.email) {
      throw { status: 400, message: apiErrors.invalidData }
    }
    return {
      id: `u${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
    }
  } catch (error) {
    handleApiError(error, 'Không thể tạo người dùng mới')
  }
}

export async function createLesson(payload) {
  try {
    await delay()
    if (!payload.title) {
      throw { status: 400, message: apiErrors.invalidData }
    }
    return {
      id: `l${Date.now()}`,
      ...payload,
      updatedAt: new Date().toISOString().split('T')[0],
    }
  } catch (error) {
    handleApiError(error, 'Không thể tạo bài học mới')
  }
}

export async function createVocabulary(payload) {
  try {
    await delay()
    if (!payload.word) {
      throw { status: 400, message: apiErrors.invalidData }
    }
    return {
      id: `v${Date.now()}`,
      ...payload,
    }
  } catch (error) {
    handleApiError(error, 'Không thể tạo từ vựng mới')
  }
}

export async function createArticle(payload) {
  try {
    await delay()
    if (!payload.title) {
      throw { status: 400, message: apiErrors.invalidData }
    }
    return {
      id: `a${Date.now()}`,
      ...payload,
    }
  } catch (error) {
    handleApiError(error, 'Không thể tạo bài viết mới')
  }
}

// Payment Management APIs
export async function fetchPayments() {
  try {
    await delay()
    return mockPayments
  } catch (error) {
    handleApiError(error, 'Không thể tải danh sách thanh toán')
  }
}

export async function approvePayment(id) {
  try {
    await delay()
    if (!id) throw { status: 400 }
    return {
      id,
      status: 'completed',
      completedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    }
  } catch (error) {
    handleApiError(error, 'Không thể duyệt thanh toán')
  }
}

export async function rejectPayment(id) {
  try {
    await delay()
    if (!id) throw { status: 400 }
    return {
      id,
      status: 'failed',
    }
  } catch (error) {
    handleApiError(error, 'Không thể từ chối thanh toán')
  }
}

// Feedback Management APIs
export async function fetchFeedbacks() {
  try {
    await delay()
    return mockFeedbacks
  } catch (error) {
    handleApiError(error, 'Không thể tải danh sách feedback')
  }
}

export async function updateFeedbackStatus(feedbackId, newStatus) {
  try {
    await delay()
    if (!feedbackId || !newStatus) throw { status: 400 }
    return {
      id: feedbackId,
      status: newStatus,
    }
  } catch (error) {
    handleApiError(error, 'Không thể cập nhật trạng thái feedback')
  }
}

// Membership Package Management APIs
export async function fetchPackages() {
  try {
    await delay()
    return mockMembershipPackages
  } catch (error) {
    handleApiError(error, 'Không thể tải danh sách gói thành viên')
  }
}

export async function createPackage(payload) {
  try {
    await delay()
    if (!payload.name || !payload.price) {
      throw { status: 400, message: apiErrors.invalidData }
    }
    return {
      id: `p${Date.now()}`,
      ...payload,
      status: 'active',
    }
  } catch (error) {
    handleApiError(error, 'Không thể tạo gói thành viên mới')
  }
}

export async function updatePackage(id, payload) {
  try {
    await delay()
    if (!id) throw { status: 400 }
    return {
      id,
      ...payload,
    }
  } catch (error) {
    handleApiError(error, 'Không thể cập nhật gói thành viên')
  }
}

export async function deletePackage(id) {
  try {
    await delay()
    if (!id) throw { status: 400 }
    return { id }
  } catch (error) {
    handleApiError(error, 'Không thể xóa gói thành viên')
  }
}

// Auto Email APIs
export async function sendEmail(payload) {
  try {
    await delay()
    if (!payload.to || !payload.subject) {
      throw { status: 400, message: apiErrors.invalidData }
    }
    return {
      success: true,
      message: 'Email đã được gửi thành công',
      ...payload,
    }
  } catch (error) {
    handleApiError(error, 'Không thể gửi email')
  }
}

// AI Statistics APIs
export async function fetchAIStatistics() {
  try {
    await delay()
    return mockAIStatistics
  } catch (error) {
    handleApiError(error, 'Không thể tải thống kê A.I')
  }
}

// Export handleApiError để các screen có thể sử dụng
export { handleApiError }
