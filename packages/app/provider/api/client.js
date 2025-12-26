import axios from 'axios'
import { API_BASE_URL } from './endpoints'
import { encryptToken, decryptToken } from '../../features/authentication/helpers/token-encryption'
import {
  getUserInfoFromToken,
  getUserIdFromToken,
  getEmailFromToken,
  getFullNameFromToken,
  getRoleFromToken,
  isTokenExpired,
} from '../../features/authentication/helpers/token-decoder'

// Lưu token đơn giản: ưu tiên localStorage, fallback bộ nhớ tạm
const TOKEN_KEY = 'token'
let inMemoryToken = null

export const setAuthToken = (token) => {
  inMemoryToken = token || null
  if (typeof localStorage !== 'undefined') {
    if (token) {
      // Mã hóa token trước khi lưu vào localStorage
      const encryptedToken = encryptToken(token)
      localStorage.setItem(TOKEN_KEY, encryptedToken)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }
}

export const clearAuthToken = () => setAuthToken(null)

export const getAuthToken = () => {
  if (inMemoryToken) return inMemoryToken
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(TOKEN_KEY)
    if (stored) {
      // Giải mã token từ localStorage
      const decryptedToken = decryptToken(stored)
      if (decryptedToken) {
        inMemoryToken = decryptedToken
        return decryptedToken
      }
    }
  }
  return null
}

/**
 * Lấy thông tin user từ token đã lưu
 * @returns {Object|null} - Object chứa thông tin user (userId, email, fullName, role, v.v.) hoặc null
 */
export const getCurrentUserInfo = () => {
  const token = getAuthToken()
  if (!token) return null
  return getUserInfoFromToken(token)
}

/**
 * Lấy userId từ token đã lưu
 * @returns {string|null} - UserId hoặc null
 */
export const getCurrentUserId = () => {
  const token = getAuthToken()
  if (!token) return null
  return getUserIdFromToken(token)
}

/**
 * Lấy email từ token đã lưu
 * @returns {string|null} - Email hoặc null
 */
export const getCurrentUserEmail = () => {
  const token = getAuthToken()
  if (!token) return null
  return getEmailFromToken(token)
}

/**
 * Lấy fullName từ token đã lưu
 * @returns {string|null} - FullName hoặc null
 */
export const getCurrentUserFullName = () => {
  const token = getAuthToken()
  if (!token) return null
  return getFullNameFromToken(token)
}

/**
 * Lấy role từ token đã lưu
 * @returns {string|null} - Role hoặc null
 */
export const getCurrentUserRole = () => {
  const token = getAuthToken()
  if (!token) return null
  return getRoleFromToken(token)
}

/**
 * Kiểm tra token hiện tại có hết hạn không
 * @returns {boolean} - true nếu token đã hết hạn, false nếu còn hiệu lực
 */
export const isCurrentTokenExpired = () => {
  const token = getAuthToken()
  if (!token) return true
  return isTokenExpired(token)
}

/**
 * API Client sử dụng axios
 * Tự động thêm base URL và xử lý request/response
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - tự động thêm token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Helper function để tự động logout khi token hết hạn
 */
const handleTokenExpired = () => {
  // Clear token
  clearAuthToken()
  
  // Clear from localStorage
  if (typeof window !== 'undefined') {
    window.localStorage?.removeItem('token')
    window.localStorage?.removeItem('userId')
    // Dispatch event để navbar cập nhật
    window.dispatchEvent(new Event('token-changed'))
    
    // Redirect to login page
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      window.location.href = '/login'
    }
  }
}

// Response interceptor - xử lý error chung
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Xử lý error chung ở đây
    console.error('API Error:', error.response?.data || error.message)
    
    // Nếu token hết hạn (401 Unauthorized), tự động logout
    if (error.response?.status === 401) {
      handleTokenExpired()
    }
    
    return Promise.reject(error)
  }
)

