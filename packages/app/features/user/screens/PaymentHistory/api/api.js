import { apiClient } from '../../../../../provider/api/client'
import { ENDPOINTS } from '../../../../../provider/api/endpoints'

/**
 * Lấy lịch sử thanh toán của user hiện tại
 * @returns {Promise<Array<{ paymentId: string; amount: number; description: string; status: number; createdAt: string; paidAt: string | null; vipPackageId: string; currentVipExpirationDate: string; currentRemainingDays: number; statusDisplay: string }>>}
 */
export const getPaymentHistory = async () => {
  try {
    const res = await apiClient.get(ENDPOINTS.PAYMENT.HISTORY_TOKEN_USER)
    const response = res.data
    if (response?.isSuccess && response?.data) {
      return response.data
    }
    throw new Error(response?.message || 'Không thể lấy lịch sử thanh toán')
  } catch (error) {
    console.error('[getPaymentHistory] Error:', error)
    throw error
  }
}

