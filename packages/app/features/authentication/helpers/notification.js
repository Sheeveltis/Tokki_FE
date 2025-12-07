import { Alert } from 'react-native'

/**
 * Helper function để hiển thị thông báo từ API response (tương tự HelperAdmin cho React Native)
 * 
 * @param {Object} response - Response object từ API
 * @param {boolean} response.isSuccess - Trạng thái thành công
 * @param {any} response.data - Dữ liệu trả về
 * @param {Array} response.errors - Danh sách lỗi
 * @param {string} response.message - Thông điệp
 * @param {number} response.statusCode - Mã trạng thái HTTP
 */
export const showApiNotification = (response) => {
  if (!response) {
    return
  }

  const title = response.isSuccess ? 'Thành công' : 'Lỗi'
  // Chỉ hiển thị message, không hiển thị statusCode cho user
  const message = response.message || (response.isSuccess ? 'Thành công' : 'Đã xảy ra lỗi')

  // Chỉ hiển thị description từ errors (không hiển thị code)
  let description = ''
  if (response.errors && response.errors.length > 0) {
    description = response.errors
      .map((err) => err.description) // Chỉ lấy description, bỏ code
      .join('\n')
  }

  // Hiển thị Alert
  Alert.alert(
    title,
    description ? `${message}\n\n${description}` : message,
    [{ text: 'OK' }]
  )
}

/**
 * Helper function để hiển thị thông báo thành công
 * 
 * @param {string} message - Thông điệp thành công
 */
export const showSuccess = (message) => {
  Alert.alert('Thành công', message, [{ text: 'OK' }])
}

/**
 * Helper function để hiển thị thông báo lỗi
 * 
 * @param {string} message - Thông điệp lỗi
 * @param {number} statusCode - Mã lỗi (optional, không hiển thị cho user)
 */
export const showError = (message, statusCode = null) => {
  // Không hiển thị statusCode cho user, chỉ hiển thị message
  Alert.alert('Lỗi', message, [{ text: 'OK' }])
}

