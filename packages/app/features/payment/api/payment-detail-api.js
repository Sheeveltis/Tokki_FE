// Payment Detail API functions
// Get payment by ID to retrieve QR code

import { apiClient } from '../../../provider/api/client'
import { apiErrors } from '../../../string.js'
import { ENDPOINTS } from '../../../provider/api/endpoints'

/**
 * Helper function để xử lý lỗi API và throw error với message từ apiErrors
 */
function handleApiError(error, customMessage = null) {
  let message = customMessage

  // Axios error handling
  if (error?.response) {
    const status = error.response.status
    message = apiErrors[status] || error.response.data?.message || apiErrors.unknown
  } else if (error?.status) {
    const status = error.status
    message = apiErrors[status] || apiErrors.unknown
  } else if (typeof error === 'number') {
    message = apiErrors[error] || apiErrors.unknown
  } else if (typeof error === 'string' && apiErrors[error]) {
    message = apiErrors[error]
  } else if (error?.message) {
    const statusMatch = error.message.match(/\b([45]\d{2})\b/)
    if (statusMatch) {
      message = apiErrors[statusMatch[1]] || error.message
    } else {
      message = error.message
    }
  } else if (error?.name === 'TypeError' && error.message.includes('fetch')) {
    message = apiErrors.network
  } else if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
    message = apiErrors.timeout
  } else {
    message = customMessage || apiErrors.unknown
  }

  const apiError = new Error(message)
  apiError.status = error?.response?.status || (typeof error === 'number' ? error : error?.status)
  apiError.originalError = error
  throw apiError
}

/**
 * Get payment by ID to retrieve QR code
 * @param {string} paymentId
 * @returns {Promise<{ isSuccess: boolean; data: string; errors: null; message: string; statusCode: number }>}
 * Note: data is a string (QR code URL), not an object
 */
export async function getPaymentById(paymentId) {
  try {
    // Validate required fields
    if (!paymentId) {
      throw { status: 400, message: apiErrors.invalidData || 'Payment ID không hợp lệ' }
    }

    // Call API using apiClient (có interceptor tự động thêm token)
    const response = await apiClient.get(ENDPOINTS.PAYMENT.GET_QR_BY_ID(paymentId))

    return response.data
  } catch (error) {
    handleApiError(error, 'Không thể lấy thông tin thanh toán')
  }
}

/**
 * Get payment status by ID
 * @param {string} paymentId
 * @returns {Promise<{ isSuccess: boolean; data: { status: number; ... }; message: string; statusCode: number }>}
 */
export async function getPaymentStatusById(paymentId) {
  try {
    // Validate required fields
    if (!paymentId) {
      throw { status: 400, message: apiErrors.invalidData || 'Payment ID không hợp lệ' }
    }

    // Call API using apiClient (có interceptor tự động thêm token)
    const response = await apiClient.get(ENDPOINTS.PAYMENT.GET_BY_ID(paymentId))

    return response.data
  } catch (error) {
    handleApiError(error, 'Không thể lấy trạng thái thanh toán')
  }
}

/**
 * Cancel payment by ID
 * @param {string} paymentId
 * @returns {Promise<{ isSuccess: boolean; message: string; statusCode: number }>}
 */
export async function cancelPayment(paymentId) {
  try {
    if (!paymentId) {
      throw { status: 400, message: 'Payment ID không hợp lệ' }
    }

    const response = await apiClient.patch(ENDPOINTS.PAYMENT.CANCEL(paymentId))

    return response.data
  } catch (error) {
    handleApiError(error, 'Không thể hủy thanh toán')
  }
}

// Export handleApiError để các component có thể sử dụng
export { handleApiError }
