/**
 * Utility để mã hóa và giải mã token
 * Sử dụng Base64 encoding kết hợp với secret key để tăng tính bảo mật
 */

const SECRET_KEY = 'tokki_secret_key_2024' // Secret key để mã hóa token

/**
 * Mã hóa token trước khi lưu vào localStorage
 * @param {string} token - Token cần mã hóa
 * @returns {string} - Token đã được mã hóa
 */
export const encryptToken = (token) => {
  if (!token) return null
  
  try {
    // Kết hợp token với secret key
    const combined = `${SECRET_KEY}${token}${SECRET_KEY}`
    
    // Mã hóa Base64
    if (typeof btoa !== 'undefined') {
      // Browser environment
      return btoa(combined)
    } else if (typeof Buffer !== 'undefined') {
      // Node.js environment
      return Buffer.from(combined).toString('base64')
    } else {
      // Fallback: trả về token gốc nếu không có phương thức mã hóa
      console.warn('Token encryption not available, returning plain token')
      return token
    }
  } catch (error) {
    console.error('Error encrypting token:', error)
    return token // Trả về token gốc nếu có lỗi
  }
}

/**
 * Giải mã token từ localStorage
 * @param {string} encryptedToken - Token đã được mã hóa
 * @returns {string} - Token đã được giải mã
 */
export const decryptToken = (encryptedToken) => {
  if (!encryptedToken) return null
  
  try {
    // Giải mã Base64
    let decoded
    if (typeof atob !== 'undefined') {
      // Browser environment
      decoded = atob(encryptedToken)
    } else if (typeof Buffer !== 'undefined') {
      // Node.js environment
      decoded = Buffer.from(encryptedToken, 'base64').toString('utf-8')
    } else {
      // Fallback: trả về token gốc
      console.warn('Token decryption not available, returning plain token')
      return encryptedToken
    }
    
    // Loại bỏ secret key ở đầu và cuối
    if (decoded.startsWith(SECRET_KEY) && decoded.endsWith(SECRET_KEY)) {
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

