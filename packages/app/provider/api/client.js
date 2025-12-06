import axios from 'axios'
import { API_BASE_URL } from './endpoints'

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

// Request interceptor - có thể thêm token, logging, etc.
apiClient.interceptors.request.use(
  (config) => {
    // Có thể thêm token vào đây nếu cần
    // const token = getToken()
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - xử lý error chung
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Xử lý error chung ở đây
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

