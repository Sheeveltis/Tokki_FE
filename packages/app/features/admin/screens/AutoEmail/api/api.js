import { apiClient } from '../../../../../provider/api/client'
import { handleApiError } from '../../../api'
import { ENDPOINTS } from '../../../../../provider/api/endpoints'

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
    return response.data
  } catch (error) {
    handleApiError(error, 'Không thể tạo email template')
  }
}


