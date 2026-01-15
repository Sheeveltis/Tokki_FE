// Payment Package API functions
// Create payment transaction

import axios from 'axios'
import { apiErrors } from '../../../string.js'
import { API_BASE_URL, ENDPOINTS } from '../../../provider/api/endpoints.js'

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
 * Create payment transaction using axios
 * @param {{ amount: number; description?: string; userId?: string }} payload
 * @returns {Promise<{ isSuccess: boolean; data: { paymentId: string; paymentUrl: string }; message: string; statusCode: number }>}
 */
export async function createPayment(payload) {
  try {
    // Validate required fields
    if (!payload.amount || payload.amount <= 0) {
      throw { status: 400, message: apiErrors.invalidData || 'Số tiền không hợp lệ' }
    }

    // Call API using axios
    const response = await axios.post(
      `${API_BASE_URL}${ENDPOINTS.PAYMENT.CREATE}`,
      {
        amount: payload.amount,
        description: payload.description || 'test',
        userId: payload.userId || '1',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*',
        },
      }
    )

    return response.data
  } catch (error) {
    handleApiError(error, 'Không thể tạo giao dịch thanh toán')
  }
}

// Export handleApiError để các component có thể sử dụng
export { handleApiError }


