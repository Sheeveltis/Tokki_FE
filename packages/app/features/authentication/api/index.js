/**
 * Authentication API: Xử lý logic nghiệp vụ và gọi API để đăng nhập, đăng ký, etc.
 * 
 * Nguyên tắc:
 * - Chứa các hàm gọi API để xử lý authentication
 * - Định dạng dữ liệu trả về từ API
 * - Xử lý lỗi và format response
 * - KHÔNG chứa mã giao diện (JSX)
 */

import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS, API_BASE_URL } from '../../../provider/api/endpoints'

/**
 * Xác thực OTP cho email (đăng ký / xác thực email)
 * message: title, data (success) hoặc errors[].description (error) là description
 */
export const verifyEmailOtp = async (email, otpCode) => {
  try {
    if (!email || !otpCode) {
      return {
        isSuccess: false,
        data: null,
        errors: [
          {
            code: 'Error.Validation',
            description: 'Email và OTP không được để trống.',
          },
        ],
        message: 'Thất bại',
        statusCode: 400,
      }
    }

    const response = await apiClient.post(ENDPOINTS.OTP.VERIFY_LOGIN_OTP, {
      email,
      otpCode,
    })
    return response.data
  } catch (error) {
    if (error.response?.data) {
      return error.response.data
    }

    const rawMsg = (typeof error?.message === 'string' && error.message) || ''
    const lowerMsg = rawMsg.toLowerCase()
    const isConnRefused = lowerMsg.includes('err_connection_refused')
    const isNetworkError = lowerMsg.includes('network error')
    const fallbackMsg = 'Không thể kết nối đến server. Vui lòng thử lại sau.'
    const finalMsg = isConnRefused || isNetworkError ? fallbackMsg : rawMsg || fallbackMsg

    return {
      isSuccess: false,
      data: null,
      errors: [
        {
          code: 'Error.Network',
          description: finalMsg,
        },
      ],
      message: finalMsg || 'Thất bại',
      statusCode: error.response?.status || 500,
    }
  }
}

/**
 * Gửi OTP xác thực email (dùng cho đăng ký)
 * @param {string} email
 */
export const sendEmailVerificationOtp = async (email) => {
  try {
    if (!email) {
      return {
        isSuccess: false,
        data: null,
        errors: [
          {
            code: 'Error.Validation',
            description: 'Vui lòng nhập email.',
          },
        ],
        message: 'Vui lòng nhập email.',
        statusCode: 400,
      }
    }

    const response = await apiClient.post(ENDPOINTS.OTP.SEND_EMAIL_VERIFICATION, {
      email,
    })
    return response.data
  } catch (error) {
    if (error.response?.data) {
      return error.response.data
    }

    const rawMsg = (typeof error?.message === 'string' && error.message) || ''
    const lowerMsg = rawMsg.toLowerCase()
    const isConnRefused = lowerMsg.includes('err_connection_refused')
    const isNetworkError = lowerMsg.includes('network error')
    const fallbackMsg = 'Không thể kết nối đến server. Vui lòng thử lại sau.'
    const finalMsg = isConnRefused || isNetworkError ? fallbackMsg : rawMsg || fallbackMsg

    return {
      isSuccess: false,
      data: null,
      errors: [
        {
          code: 'Error.Network',
          description: finalMsg,
        },
      ],
      message: finalMsg,
      statusCode: error.response?.status || 500,
    }
  }
}

/**
 * Đăng nhập
 * 
 * @param {Object} credentials - Thông tin đăng nhập
 * @param {string} credentials.email - Email người dùng
 * @param {string} credentials.password - Mật khẩu
 * @returns {Promise<Object>} Response từ API với format:
 *   - Success: { isSuccess: true, data: { token, fullName, role, avatarUrl }, message, statusCode: 200 }
 *   - Error: { isSuccess: false, data: null, errors: [...], message, statusCode: 400 }
 */
export const login = async ({ email, password, rememberMe = false }) => {
  try {
    // Validate input
    if (!email || !password) {
      return {
        isSuccess: false,
        data: null,
        errors: [
          {
            code: 'Error.Validation',
            description: 'Email và mật khẩu không được để trống.',
          },
        ],
        message: 'Email và mật khẩu không được để trống.',
        statusCode: 400,
      }
    }

    // Gọi API
    console.log('[Login API] Calling:', ENDPOINTS.ACCOUNT.LOGIN)
    console.log('[Login API] Payload:', { email, password: '***', rememberMe })
    const response = await apiClient.post(ENDPOINTS.ACCOUNT.LOGIN, {
      email,
      password,
      rememberMe,
    }, { withCredentials: true })
    console.log('[Login API] Response:', response.data)

    // Trả về response từ API (đã được format sẵn)
    return response.data
  } catch (error) {
    console.error('[Login API] Error:', error)
    console.error('[Login API] Error response:', error.response)
    console.error('[Login API] Error status:', error.response?.status)
    console.error('[Login API] Error data:', error.response?.data)
    
    // Nếu backend có trả về body chuẩn thì ưu tiên dùng luôn
    if (error.response?.data) {
      return error.response.data
    }

    // Chuẩn hoá lỗi network / lỗi không mong đợi
    const rawMsg = (typeof error?.message === 'string' && error.message) || ''
    const lowerMsg = rawMsg.toLowerCase()
    const isConnRefused = lowerMsg.includes('err_connection_refused')
    const isNetworkError = lowerMsg.includes('network error')
    const fallbackMsg = 'Không thể kết nối đến server. Vui lòng thử lại sau.'
    const finalMsg = isConnRefused || isNetworkError ? fallbackMsg : rawMsg || fallbackMsg

    return {
      isSuccess: false,
      data: null,
      errors: [
        {
          code: 'Error.Network',
          description: finalMsg,
        },
      ],
      message: finalMsg,
      statusCode: error.response?.status || 500,
    }
  }
}

/**
 * Đăng nhập bằng Google
 * @param {{ idToken: string; isComfirmToMergeAcc?: boolean }} payload
 */
export const loginWithGoogle = async ({ idToken, isComfirmToMergeAcc = false }) => {
  try {
    if (!idToken) {
      return {
        isSuccess: false,
        data: null,
        errors: [
          { code: 'Error.Validation', description: 'Thiếu idToken từ Google.' },
        ],
        message: 'Thiếu idToken từ Google.',
        statusCode: 400,
      }
    }

    const response = await apiClient.post(ENDPOINTS.ACCOUNT.GOOGLE_LOGIN, {
      idToken,
      isComfirmToMergeAcc,
    }, { withCredentials: true })

    return response.data
  } catch (error) {
    if (error.response?.data) {
      return error.response.data
    }

    const rawMsg = (typeof error?.message === 'string' && error.message) || ''
    const lowerMsg = rawMsg.toLowerCase()
    const isConnRefused = lowerMsg.includes('err_connection_refused')
    const isNetworkError = lowerMsg.includes('network error')
    const fallbackMsg = 'Không thể kết nối đến server. Vui lòng thử lại sau.'
    const finalMsg = isConnRefused || isNetworkError ? fallbackMsg : rawMsg || fallbackMsg

    return {
      isSuccess: false,
      data: null,
      errors: [
        {
          code: 'Error.Network',
          description: finalMsg,
        },
      ],
      message: finalMsg,
      statusCode: error.response?.status || 500,
    }
  }
}

/**
 * Đăng ký
 * 
 * @param {Object} userData - Thông tin đăng ký
 * @param {string} userData.email - Email người dùng
 * @param {string} userData.phoneNumber - Số điện thoại
 * @param {string} userData.password - Mật khẩu
 * @param {string} userData.fullName - Họ và tên
 * @param {string} userData.dateOfBirth - Ngày sinh (format: YYYY-MM-DD)
 * @returns {Promise<Object>} Response từ API với format:
 *   - Success: { isSuccess: true, data: userId, message, statusCode: 201 }
 *   - Error: { isSuccess: false, data: null, errors: [...], message, statusCode: 400 }
 */
export const register = async ({ email, phoneNumber, password, fullName, dateOfBirth }) => {
  try {
    // Validate input
    if (!email || !phoneNumber || !password || !fullName || !dateOfBirth) {
      return {
        isSuccess: false,
        data: null,
        errors: [
          {
            code: 'Error.Validation',
            description: 'Vui lòng nhập đầy đủ thông tin.',
          },
        ],
        message: 'Vui lòng nhập đầy đủ thông tin.',
        statusCode: 400,
      }
    }

    // Gọi API
    const response = await apiClient.post(ENDPOINTS.ACCOUNT.REGISTER, {
      email,
      phoneNumber,
      password,
      fullName,
      dateOfBirth,
    })

    // Trả về response từ API (đã được format sẵn)
    return response.data
  } catch (error) {
    // Xử lý lỗi từ API
    if (error.response?.data) {
      // Response có format chuẩn từ backend
      return error.response.data
    }

    // Lỗi network hoặc lỗi khác
    return {
      isSuccess: false,
      data: null,
      errors: [
        {
          code: 'Error.Network',
          description: error.message || 'Không thể kết nối đến server. Vui lòng thử lại sau.',
        },
      ],
      message: error.message || 'Đăng ký thất bại, vui lòng thử lại.',
      statusCode: error.response?.status || 500,
    }
  }
}

/**
 * Gửi heartbeat để track thời gian học tập
 * @param {string} userId - ID của người dùng
 * @param {number} durationInSeconds - Thời gian học tập tính bằng giây (mặc định 300)
 * @returns {Promise<Object>} Response từ API
 */
export const sendHeartbeat = async (userId, durationInSeconds = 300) => {
  try {
    if (!userId) {
      console.warn('sendHeartbeat: userId is required')
      return { isSuccess: false, message: 'UserId không được để trống' }
    }

    console.log('[Heartbeat API] Đang gửi heartbeat:', { userId, durationInSeconds, endpoint: ENDPOINTS.GAMIFICATION.HEARTBEAT })
    const response = await apiClient.post(ENDPOINTS.GAMIFICATION.HEARTBEAT, {
      userId,
      durationInSeconds,
    })
    console.log('[Heartbeat API] Heartbeat đã được gửi thành công:', response.data)
    return response.data
  } catch (error) {
    // Không throw error để tránh làm gián đoạn flow chính
    // Chỉ log để debug
    console.error('Error sending heartbeat:', error)
    return {
      isSuccess: false,
      message: error.response?.data?.message || error.message || 'Không thể gửi heartbeat',
    }
  }
}



/**
 * ============================================
 * FORGOT PASSWORD API
 * ============================================
 */

import axios from 'axios'
import { apiErrors } from '../../../string.js'

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

