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
import { ENDPOINTS } from '../../../provider/api/endpoints'

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
export const login = async ({ email, password }) => {
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
    const response = await apiClient.post(ENDPOINTS.ACCOUNT.LOGIN, {
      email,
      password,
    })

    // Trả về response từ API (đã được format sẵn)
    return response.data
  } catch (error) {
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


