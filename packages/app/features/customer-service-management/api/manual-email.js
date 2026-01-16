import { apiClient } from '../../../provider/api/client'
import { handleApiError } from '../../admin/api'
import { ENDPOINTS } from '../../../provider/api/endpoints'

/**
 * Gửi chiến dịch email thủ công
 * @param {Object} payload
 * @param {string} payload.subject
 * @param {string} payload.body
 * @param {number} payload.targetGroup - enum: 0 None, 1 All, 2 VipUsers, 3 FreeUsers
 * @param {string[]} [payload.specificEmails]
 * @param {string|null} [payload.scheduledTime] - ISO string hoặc null nếu gửi ngay
 */
export async function sendEmailCampaign(payload) {
  try {
    const response = await apiClient.post(ENDPOINTS.EMAIL.CAMPAIGNS_CREATE, payload)
    return response.data
  } catch (error) {
    handleApiError(error, 'Không thể gửi chiến dịch email')
  }
}


