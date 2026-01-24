import { apiClient } from '../../../provider/api/client'
import { handleApiError } from '../../back-office/api/admin-index'
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
    const resData = response?.data

    // Backend trả về { isSuccess, data, message, errors }
    if (resData && typeof resData === 'object' && 'isSuccess' in resData) {
      if (!resData.isSuccess) {
        const message =
          resData?.message ||
          (Array.isArray(resData?.errors) && resData.errors[0]?.description) ||
          'Không thể gửi chiến dịch email'
        throw new Error(message)
      }
      // Return data kèm message để component có thể hiển thị
      return { data: resData.data ?? resData, message: resData.message }
    }

    return { data: resData, message: resData?.message }
  } catch (error) {
    // Nếu đã là Error object với message thì throw lại
    if (error instanceof Error) throw error
    handleApiError(error, 'Không thể gửi chiến dịch email')
    throw error
  }
}

/**
 * Lấy lịch sử chiến dịch email (GET /api/email-campaigns)
 * Params (theo swagger): PageNumber, PageSize, Status, TargetGroup, ScheduledFrom, ScheduledTo, CreatedFrom, CreatedTo
 */
export async function fetchEmailCampaigns(params = {}) {
  try {
    const response = await apiClient.get(ENDPOINTS.EMAIL.CAMPAIGNS_LIST, { params })
    return response.data
  } catch (error) {
    handleApiError(error, 'Không thể tải lịch sử gửi email')
  }
}


