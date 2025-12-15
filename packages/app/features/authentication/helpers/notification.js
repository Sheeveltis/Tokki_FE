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

  // Title lấy từ message (yêu cầu: message là title)
  const title = response.message || (response.isSuccess ? 'Thành công' : 'Thất bại')

  // Description:
  // - Nếu thành công: ưu tiên data (string) để hiển thị nội dung thông báo
  // - Nếu lỗi: lấy errors[].description
  let description = ''
  if (response.isSuccess && typeof response.data === 'string') {
    description = response.data
  } else if (response.errors && response.errors.length > 0) {
    description = response.errors
      .map((err) => err.description)
      .join('\n')
  }

  // Nếu không có description, fallback dùng title làm nội dung
  const body = description || title

  Alert.alert(title, body, [{ text: 'OK' }])
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
  Alert.alert('Thất bại', message, [{ text: 'OK' }])
}

