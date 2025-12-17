import axios from 'axios'
import { API_BASE_URL } from './endpoints'

// Lưu token đơn giản: ưu tiên localStorage, fallback bộ nhớ tạm
const TOKEN_KEY = 'token'
let inMemoryToken = null

export const setAuthToken = (token) => {
  inMemoryToken = token || null
  if (typeof localStorage !== 'undefined') {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
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
      inMemoryToken = stored
      return stored
    }
  }
  return null
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

