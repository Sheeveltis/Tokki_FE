/**
 * Utility để mã hóa và giải mã token
 * Sử dụng Base64 encoding kết hợp với secret key để tăng tính bảo mật
 * Hỗ trợ cả web (btoa/atob) và React Native (Buffer hoặc base64-js)
 */

import { Platform } from 'react-native'

const SECRET_KEY = 'tokki_secret_key_2024' // Secret key để mã hóa token

/**
 * Base64 encode - hỗ trợ cả web và React Native
 */
const base64Encode = (str) => {
  try {
    // Web: sử dụng btoa
    if (Platform.OS === 'web' && typeof btoa !== 'undefined') {
      return btoa(str)
    }
    
    // React Native/Node: sử dụng Buffer
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'utf-8').toString('base64')
    }
    
    // Fallback: sử dụng base64-js nếu có
    try {
      const base64js = require('base64-js')
      const bytes = new TextEncoder().encode(str)
      return base64js.fromByteArray(bytes)
    } catch {
      // Final fallback: simple base64 implementation
      console.warn('Base64 encoding not available, using fallback')
      return str
    }
  } catch (error) {
    console.error('Error in base64Encode:', error)
    return str
  }
}

/**
 * Base64 decode - hỗ trợ cả web và React Native
 */
const base64Decode = (str) => {
  try {
    // Web: sử dụng atob
    if (Platform.OS === 'web' && typeof atob !== 'undefined') {
      return atob(str)
    }
    
    // React Native/Node: sử dụng Buffer
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'base64').toString('utf-8')
    }
    
    // Fallback: sử dụng base64-js nếu có
    try {
      const base64js = require('base64-js')
      const bytes = base64js.toByteArray(str)
      return new TextDecoder().decode(bytes)
    } catch {
      // Final fallback
      console.warn('Base64 decoding not available, using fallback')
      return str
    }
  } catch (error) {
    console.error('Error in base64Decode:', error)
    return str
  }
}

/**
 * Mã hóa token trước khi lưu vào storage
 * @param {string} token - Token cần mã hóa
 * @returns {string} - Token đã được mã hóa
 */
export const encryptToken = (token) => {
  if (!token) return null
  
  try {
    // Kết hợp token với secret key
    const combined = `${SECRET_KEY}${token}${SECRET_KEY}`
    
    // Mã hóa Base64
    return base64Encode(combined)
  } catch (error) {
    console.error('Error encrypting token:', error)
    return token // Trả về token gốc nếu có lỗi
  }
}

/**
 * Giải mã token từ storage
 * @param {string} encryptedToken - Token đã được mã hóa
 * @returns {string} - Token đã được giải mã
 */
export const decryptToken = (encryptedToken) => {
  if (!encryptedToken) return null
  
  try {
    // Giải mã Base64
    const decoded = base64Decode(encryptedToken)
    
    // Loại bỏ secret key ở đầu và cuối
    if (decoded && decoded.startsWith && decoded.startsWith(SECRET_KEY) && decoded.endsWith(SECRET_KEY)) {
      const token = decoded.slice(
        SECRET_KEY.length,
        decoded.length - SECRET_KEY.length
      )
      return token
    }
    
    // Nếu không khớp format, có thể là token cũ chưa mã hóa
    // Thử trả về token gốc
    return encryptedToken
  } catch (error) {
    console.error('Error decrypting token:', error)
    // Nếu giải mã thất bại, có thể là token cũ chưa mã hóa
    // Trả về token gốc để tương thích ngược
    return encryptedToken
  }
}


