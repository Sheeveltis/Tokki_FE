// Forgot Password API functions
// Send OTP to email for forgot password

import axios from 'axios'
import { apiErrors } from '../../../../string.js'
import { API_BASE_URL, ENDPOINTS } from '../../../../provider/api/endpoints'

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
 * Send OTP to email for forgot password
 * @param {string} email
 * @returns {Promise<{ isSuccess: boolean; data: any; errors: null; message: string; statusCode: number }>}
 */
export async function sendForgotPasswordOtp(email) {
  try {
    // Validate required fields
    if (!email) {
      throw { status: 400, message: apiErrors.invalidData || 'Email không hợp lệ' }
    }

    // Call API using axios
    const response = await axios.post(
      `${API_BASE_URL}${ENDPOINTS.OTP.SEND_FORGOT_PASSWORD}`,
      {
        email: email,
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
    handleApiError(error, 'Không thể gửi OTP')
  }
}

/**
 * Verify OTP for forgot password
 * @param {string} email
 * @param {string} otpCode
 * @returns {Promise<{ isSuccess: boolean; data: any; errors: null; message: string; statusCode: number }>}
 */
export async function verifyForgotPasswordOtp(email, otpCode) {
  try {
    // Validate required fields
    if (!email) {
      throw { status: 400, message: apiErrors.invalidData || 'Email không hợp lệ' }
    }
    if (!otpCode) {
      throw { status: 400, message: apiErrors.invalidData || 'OTP không hợp lệ' }
    }

    // Call API using axios
    const response = await axios.post(
      `${API_BASE_URL}${ENDPOINTS.OTP.VERIFY_FORGOT_PASSWORD}`,
      {
        email: email,
        otpCode: otpCode,
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
    handleApiError(error, 'Không thể xác thực OTP')
  }
}

/**
 * Reset mật khẩu sau khi xác thực OTP
 * @param {{ email: string; newPassword: string; confirmPassword: string }} payload
 */
export async function resetForgotPassword(payload) {
  const { email, newPassword, confirmPassword } = payload || {}
  try {
    if (!email || !newPassword || !confirmPassword) {
      throw { status: 400, message: apiErrors.invalidData || 'Dữ liệu không hợp lệ' }
    }

    const response = await axios.post(
      `${API_BASE_URL}${ENDPOINTS.ACCOUNT.FORGOT_PASSWORD_RESET}`,
      {
        email,
        newPassword,
        confirmPassword,
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
    handleApiError(error, 'Không thể đặt lại mật khẩu')
  }
}

// Export handleApiError để các component có thể sử dụng
export { handleApiError }

