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

const TOKEN_KEY = 'token'
let inMemoryToken = null
let storageCache = null
let isLoggingOut = false // Cờ chặn gọi hàm redirect nhiều lần

export const setAuthToken = async (token) => {
  inMemoryToken = token || null
  storageCache = token || null
  
  if (token) {
    const encryptedToken = encryptToken(token)
    await setStorageItem(TOKEN_KEY, encryptedToken)
  } else {
    await removeStorageItem(TOKEN_KEY)
  }
  
  dispatchStorageEvent('token-changed')
}

// THAY ĐỔI: Thêm async/await để đảm bảo dọn dẹp xong mới đi tiếp
export const clearAuthToken = async () => {
  inMemoryToken = null
  storageCache = null
  await setAuthToken(null)
}

// Kiểm tra nhanh xem token có đúng định dạng JWT không (bắt đầu bằng eyJ)
const isValidJWTFormat = (token) => {
  return token && typeof token === 'string' && token.startsWith('eyJ');
}

export const getAuthToken = () => {
  if (inMemoryToken) return inMemoryToken
  if (storageCache) return storageCache
  
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    const stored = window.localStorage.getItem(TOKEN_KEY)
    if (stored) {
      const decryptedToken = decryptToken(stored)

      // 1) Token đã mã hóa đúng chuẩn
      if (decryptedToken && isValidJWTFormat(decryptedToken)) {
        inMemoryToken = decryptedToken
        storageCache = decryptedToken
        return decryptedToken
      }

      // 2) Fallback: token lưu dạng plain JWT (để tương thích dữ liệu cũ)
      if (isValidJWTFormat(stored)) {
        inMemoryToken = stored
        storageCache = stored
        return stored
      }

      // 3) Giá trị rác
      inMemoryToken = null
      storageCache = null
    }
  }
  return null
}

export const getAuthTokenAsync = async () => {
  if (inMemoryToken) return inMemoryToken
  if (storageCache) return storageCache
  
  const stored = await getStorageItem(TOKEN_KEY)
  if (stored) {
    const decryptedToken = decryptToken(stored)
    if (decryptedToken && decryptedToken !== stored && isValidJWTFormat(decryptedToken)) {
      inMemoryToken = decryptedToken
      storageCache = decryptedToken
      return decryptedToken
    }
  }
  return null
}

export const getCurrentUserInfo = () => {
  const token = getAuthToken()
  return token ? getUserInfoFromToken(token) : null
}

export const getCurrentUserId = () => {
  const token = getAuthToken()
  return token ? getUserIdFromToken(token) : null
}

export const getCurrentUserEmail = () => {
  const token = getAuthToken()
  return token ? getEmailFromToken(token) : null
}

export const getCurrentUserFullName = () => {
  const token = getAuthToken()
  return token ? getFullNameFromToken(token) : null
}

export const getCurrentUserRole = () => {
  const token = getAuthToken()
  return token ? getRoleFromToken(token) : null
}

export const isCurrentTokenExpired = () => {
  const token = getAuthToken()
  if (!token) return true
  return isTokenExpired(token)
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// THAY ĐỔI: Chuyển sang async để hỗ trợ đọc token trên Mobile mượt mà hơn
apiClient.interceptors.request.use(
  async (config) => {
    // Ưu tiên đọc sync (cho Web/Memory), nếu không có và là Mobile thì đọc async
    let token = getAuthToken()
    if (!token && Platform.OS !== 'web') {
      token = await getAuthTokenAsync()
    }
    
    // Bật log này lên khi debug, comment lại khi lên production
    // console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, token ? "✅ Token Found" : "❌ No Token");

    if (token && isValidJWTFormat(token)) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

const handleTokenExpired = async (options = {}) => {
  // THAY ĐỔI: Chặn gọi nhiều lần nếu trang bắn nhiều API cùng lúc bị 401
  if (isLoggingOut) return; 
  isLoggingOut = true;

  await clearAuthToken()
  await removeStorageItem('userId') // Token_key đã được xóa trong clearAuthToken
  
  if (!options?.skipRedirect && Platform.OS === 'web' && typeof window !== 'undefined') {
    const currentPath = window.location.pathname
    if (currentPath === '/login' || currentPath === '/register') {
      isLoggingOut = false;
      return;
    }
    
    if (currentPath.startsWith('/admin')) {
      window.location.href = '/admin'
    } else if (currentPath.startsWith('/staff')) {
      window.location.href = '/staff'
    } else if (currentPath.startsWith('/moderator')) {
      window.location.href = '/moderator'
    } else {
      window.location.href = '/login'
    }
  } else {
    // Trả lại cờ cho Mobile (vì Mobile dùng React Navigation)
    isLoggingOut = false; 
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    
    // Log lỗi gọn gàng hơn
    console.error(`[API Error ${status}]`, error.config?.url, error.response?.data?.message || '');
    
    if (status === 401) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
      if (currentPath.includes('/admin') || currentPath.includes('/staff') || currentPath.includes('/moderator')) {
        handleTokenExpired()
      }
    }
    
    if (status === 404) {
      const token = getAuthToken()
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
      if (!token && (currentPath.startsWith('/admin') || currentPath.startsWith('/staff'))) {
        console.warn('404 error on protected route with null token. Possible sync issue.')
      }
    }
    
    return Promise.reject(error)
  }
)