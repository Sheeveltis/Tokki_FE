import React, { useEffect } from 'react'
import { notification } from 'antd'

/**
 * Component xử lý hiển thị thông báo lỗi cho Admin & Staff
 * 
 * @param {{
 *   response?: {
 *     isSuccess?: boolean;
 *     data?: any;
 *     errors?: Array<{code: string; description: string}>;
 *     message?: string;
 *     statusCode?: number;
 *   };
 *   type?: 'error' | 'success' | 'info' | 'warning';
 *   duration?: number;
 *   placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
 *   hideStatusCode?: boolean; // Ẩn statusCode khi dùng cho user
 *   hideErrorCode?: boolean; // Ẩn error code trong description khi dùng cho user
 * }} props
 */
export function HelperAdmin({
  response,
  type = 'error',
  duration = 4.5,
  placement = 'topRight',
  hideStatusCode = false,
  hideErrorCode = false,
}) {
  useEffect(() => {
    // Nếu không có response, không hiển thị gì
    if (!response) {
      return
    }

    // Xác định loại thông báo dựa trên response
    const notificationType = response.isSuccess ? 'success' : type

    // Lấy message từ response
    const message = response.message || 'Đã xảy ra lỗi'

    // Lấy statusCode (chỉ hiển thị nếu không ẩn)
    const statusCode = hideStatusCode ? null : response.statusCode

    // Tạo description từ errors nếu có
    let description = ''
    if (response.errors && response.errors.length > 0) {
      description = response.errors
        .map((err) => hideErrorCode ? err.description : `${err.code}: ${err.description}`)
        .join('\n')
    }

    // Hiển thị notification
    notification[notificationType]({
      message: statusCode ? `[${statusCode}] ${message}` : message,
      description: description || undefined,
      placement,
      duration,
    })
  }, [response, type, duration, placement])

  return null
}

/**
 * Helper function để hiển thị thông báo lỗi nhanh
 * 
 * @param {Object} response - Response object từ API
 * @param {Object} options - Options cho notification
 */
export function showAdminNotification(response, options = {}) {
  HelperAdmin({ response, ...options })
}

/**
 * Helper function để hiển thị thông báo thành công
 * 
 * @param {string} message - Thông điệp thành công
 * @param {Object} options - Options cho notification
 */
export function showAdminSuccess(message, options = {}) {
  notification.success({
    message: 'Thành công',
    description: message,
    placement: options.placement || 'topRight',
    duration: options.duration || 3,
  })
}

/**
 * Helper function để hiển thị thông báo lỗi
 * 
 * @param {string} message - Thông điệp lỗi
 * @param {number} statusCode - Mã lỗi (optional)
 * @param {Object} options - Options cho notification
 */
export function showAdminError(message, statusCode, options = {}) {
  notification.error({
    message: statusCode ? `[${statusCode}] ${message}` : message,
    placement: options.placement || 'topRight',
    duration: options.duration || 4.5,
  })
}

export default HelperAdmin

