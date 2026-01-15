import axios from 'axios'
import { Platform } from 'react-native'
import { API_BASE_URL } from './endpoints'
import { encryptToken, decryptToken } from '../../helpers/token-encryption'
import {
  getUserInfoFromToken,
  getUserIdFromToken,
  getEmailFromToken,
  getFullNameFromToken,
  getRoleFromToken,
  isTokenExpired,
} from '../../helpers/token-decoder'
import { setStorageItem, getStorageItem, removeStorageItem, dispatchStorageEvent } from '../../helpers/storage'

// Lưu token đơn giản: ưu tiên storage, fallback bộ nhớ tạm
const TOKEN_KEY = 'token'
let inMemoryToken = null
let storageCache = null // Cache để tránh async call nhiều lần

export const setAuthToken = async (token) => {
  inMemoryToken = token || null
  storageCache = token || null
  
  if (token) {
    // Mã hóa token trước khi lưu vào storage
    const encryptedToken = encryptToken(token)
    await setStorageItem(TOKEN_KEY, encryptedToken)
  } else {
    await removeStorageItem(TOKEN_KEY)
  }
  
  // Dispatch event cho web
  dispatchStorageEvent('token-changed')
}

export const clearAuthToken = () => setAuthToken(null)

// Synchronous version cho backward compatibility (sử dụng cache)
export const getAuthToken = () => {
  if (inMemoryToken) return inMemoryToken
  if (storageCache) return storageCache
  
  // Nếu là web, có thể đọc sync từ localStorage
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    const stored = window.localStorage.getItem(TOKEN_KEY)
    if (stored) {
      const decryptedToken = decryptToken(stored)
      if (decryptedToken) {
        inMemoryToken = decryptedToken
        storageCache = decryptedToken
        return decryptedToken
      }
    }
  }
  
  return null
}

// Async version để đọc từ AsyncStorage trên mobile
export const getAuthTokenAsync = async () => {
  if (inMemoryToken) return inMemoryToken
  if (storageCache) return storageCache
  
  const stored = await getStorageItem(TOKEN_KEY)
  if (stored) {
    const decryptedToken = decryptToken(stored)
    if (decryptedToken) {
      inMemoryToken = decryptedToken
      storageCache = decryptedToken
      return decryptedToken
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
const handleTokenExpired = async (options = {}) => {
  // Clear token
  await clearAuthToken()
  
  // Clear from storage
  await removeStorageItem('token')
  await removeStorageItem('userId')
  
  // Dispatch event để navbar cập nhật
  dispatchStorageEvent('token-changed')
  
  // Redirect to login page (chỉ trên web)
  if (!options?.skipRedirect && Platform.OS === 'web' && typeof window !== 'undefined') {
    const currentPath = window.location.pathname
    
    // Nếu đang ở trang login hoặc register, không redirect
    if (currentPath === '/login' || currentPath === '/register') {
      return
    }
    
    // Nếu đang ở admin/staff/moderator route, redirect về route đó để hiển thị login form tương ứng
    if (currentPath.startsWith('/admin')) {
      window.location.href = '/admin'
    } else if (currentPath.startsWith('/staff')) {
      window.location.href = '/staff'
    } else if (currentPath.startsWith('/moderator')) {
      window.location.href = '/moderator'
    } else {
      // Các route khác redirect về /login
      window.location.href = '/login'
    }
  }
  // Trên mobile, navigation sẽ được xử lý bởi navigation system
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

