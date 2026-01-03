// Premium Package API functions
// Get VIP packages

import { apiClient } from '../../../../provider/api/client'
import { ENDPOINTS } from '../../../../provider/api/endpoints'

/**
 * Get all VIP packages
 * @returns {Promise<{ isSuccess: boolean; data: Array<{ id: string; name: string; packageType: string; price: number; durationDays: number; description: string; isActive: boolean; createdAt: string }>; message: string; statusCode: number }>}
 */
export async function getVipPackages() {
  try {
    const response = await apiClient.get(ENDPOINTS.VIP_PACKAGE.GET_ALL)
    return response.data
  } catch (error) {
    console.error('[getVipPackages] Error:', error)
    throw error
  }
}

/**
 * Create payment for VIP package
 * @param {string} userId - User ID
 * @param {string} vipPackageId - VIP Package ID
 * @returns {Promise<{ isSuccess: boolean; data: { paymentId: string; paymentUrl: string }; message: string; statusCode: number }>}
 */
export async function createVipPackagePayment(userId, vipPackageId) {
  try {
    const response = await apiClient.post(ENDPOINTS.PAYMENT.CREATE, {
      userId,
      vipPackageId,
    })
    return response.data
  } catch (error) {
    console.error('[createVipPackagePayment] Error:', error)
    throw error
  }
}

