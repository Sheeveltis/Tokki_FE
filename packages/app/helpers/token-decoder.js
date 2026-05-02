/**
 * Utility để decode JWT token và lấy thông tin user
 * JWT token có format: header.payload.signature
 * Payload chứa thông tin user (userId, email, role, fullName, v.v.)
 */

import { Platform } from 'react-native'
import { jwtDecode } from 'jwt-decode'

/**
 * Decode JWT token và trả về payload (không verify signature)
 * @param {string} token - JWT token cần decode
 * @returns {Object|null} - Payload object hoặc null nếu token không hợp lệ
 */
export const decodeJWT = (token) => {
  if (!token) return null

  try {
    return jwtDecode(token)
  } catch (error) {
    console.error('Error decoding JWT with jwt-decode:', error)
    return null
  }
}

/**
 * Lấy thông tin user từ token (đã giải mã từ localStorage)
 * @param {string} token - Token đã được giải mã (plain token, không phải encrypted)
 * @returns {Object|null} - Object chứa thông tin user hoặc null
 */
export const getUserInfoFromToken = (token) => {
  if (!token) return null

  const payload = decodeJWT(token)
  if (!payload) return null

  // Trả về các thông tin phổ biến từ JWT payload
  return {
    userId: payload.userId || payload.sub || payload.id || payload.user_id || null,
    email: payload.email || null,
    fullName: payload.fullName || payload.name || payload.full_name || null,
    role: payload.role || payload.roles?.[0] || null,
    avatarUrl: payload.avatarUrl || payload.avatar || payload.avatar_url || null,
    phoneNumber: payload.phoneNumber || payload.phone || payload.phone_number || null,
    dateOfBirth: payload.dateOfBirth || payload.dob || payload.date_of_birth || null,
    // Trả về toàn bộ payload để có thể truy cập các field khác
    ...payload,
  }
}

/**
 * Lấy userId từ token
 * @param {string} token - Token đã được giải mã
 * @returns {string|null} - UserId hoặc null
 */
export const getUserIdFromToken = (token) => {
  const userInfo = getUserInfoFromToken(token)
  return userInfo?.userId || null
}

/**
 * Lấy email từ token
 * @param {string} token - Token đã được giải mã
 * @returns {string|null} - Email hoặc null
 */
export const getEmailFromToken = (token) => {
  const userInfo = getUserInfoFromToken(token)
  return userInfo?.email || null
}

/**
 * Lấy fullName từ token
 * @param {string} token - Token đã được giải mã
 * @returns {string|null} - FullName hoặc null
 */
export const getFullNameFromToken = (token) => {
  const userInfo = getUserInfoFromToken(token)
  return userInfo?.fullName || null
}

/**
 * Lấy role từ token
 * @param {string} token - Token đã được giải mã
 * @returns {string|null} - Role hoặc null
 */
export const getRoleFromToken = (token) => {
  const userInfo = getUserInfoFromToken(token)
  return userInfo?.role || null
}

/**
 * Kiểm tra token có hết hạn không
 * @param {string} token - Token đã được giải mã
 * @returns {boolean} - true nếu token đã hết hạn, false nếu còn hiệu lực
 */
export const isTokenExpired = (token) => {
  if (!token) return true

  const payload = decodeJWT(token)
  if (!payload) return true

  // JWT thường có field 'exp' (expiration time) là Unix timestamp
  if (payload.exp) {
    const currentTime = Math.floor(Date.now() / 1000) // Convert to seconds
    return currentTime >= payload.exp
  }

  // Nếu không có exp, coi như token không hết hạn
  return false
}


