import { apiClient } from '../../../provider/api/client'
import { handleApiError } from '../../back-office/api/admin-index'
import { ENDPOINTS } from '../../../provider/api/endpoints'

/**
 * Tạo email template tự động
 * @param {Object} payload
 * @param {string} payload.templateName
 * @param {number} payload.type - EmailTemplateType enum (1=OfflineReminder, 2=VipExpiringReminder)
 * @param {number} payload.value - Số ngày (offline X ngày / VIP còn X ngày)
 * @param {number} payload.targetGroup - UserTargetGroup enum (1,2,3)
 * @param {string} payload.subject - Tiêu đề email
 * @param {string} payload.body - Nội dung email
 * @param {string} payload.description - Ghi chú
 */
export async function createEmailTemplate(payload) {
  try {
    const response = await apiClient.post(ENDPOINTS.EMAIL.TEMPLATE_CREATE, payload)
    const resData = response?.data

    // Backend trả về { isSuccess, data, message, errors }
    if (resData && typeof resData === 'object' && 'isSuccess' in resData) {
      if (!resData.isSuccess) {
        const message =
          resData?.message ||
          (Array.isArray(resData?.errors) && resData.errors[0]?.description) ||
          'Không thể tạo email template'
        throw new Error(message)
      }
      // Return data kèm message để component có thể hiển thị
      return { data: resData.data ?? resData, message: resData.message }
    }

    return { data: resData, message: resData?.message }
  } catch (error) {
    // Nếu đã là Error object với message thì throw lại
    if (error instanceof Error) throw error
    handleApiError(error, 'Không thể tạo email template')
    throw error
  }
}

/**
 * Lấy danh sách email template tự động
 * @param {Object} params
 * @param {number} [params.PageNumber]
 * @param {number} [params.PageSize]
 * @param {number} [params.Status] - EmailTemplateStatus enum (0=Draft, 1=Active, 2=Deleted)
 * @param {number} [params.Type] - EmailTemplateType enum (1=OfflineReminder, 2=VipExpiringReminder)
 * @param {number} [params.TargetGroup] - UserTargetGroup enum (0=None, 1=All, 2=VipUsers, 3=FreeUsers)
 * @param {number} [params.Value]
 * @param {string} [params.SearchName]
 * @param {string} [params.SearchSubject]
 */
export async function fetchEmailTemplates(params = {}) {
  try {
    const response = await apiClient.get(ENDPOINTS.EMAIL.TEMPLATE_LIST, { params })
    return response.data
  } catch (error) {
    handleApiError(error, 'Không thể lấy danh sách email template')
    throw error
  }
}


