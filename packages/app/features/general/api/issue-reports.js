import { apiClient } from '../../../../provider/api/client'
import { ENDPOINTS } from '../../../../provider/api/endpoints'

/**
 * Tạo báo cáo lỗi
 * @param {Object} payload - {
 *   userId: string
 *   description: string
 *   imageUrl?: string
 *   targetUrl?: string
 *   reportType: string
 *   questionBankId?: string
 *   vocabularyId?: string
 * }
 * @returns {Promise<Object>}
 */
export const createReport = async (payload) => {
  try {
    const res = await apiClient.post(ENDPOINTS.REPORT.CREATE, payload)
    const response = res.data
    if (response?.isSuccess) {
      return response.data || response
    }
    throw new Error(response?.message || 'Không thể tạo báo cáo')
  } catch (error) {
    console.error('Error creating report:', error)
    throw error
  }
}


