import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

/**
 * Lấy danh sách leaderboard
 * @param {number} timeFrame - 0: Ngày, 1: Tháng, 2: Năm, 3: Tất cả
 * @param {number} top - Số lượng top users (mặc định 100)
 * @returns {Promise<Array>} Danh sách leaderboard với format: [{ rank, userId, fullName, avatarUrl, totalXP, titleName, titleColor, trend }, ...]
 */
export const getLeaderboard = async (timeFrame = 0, top = 100) => {
  try {
    console.log('Fetching leaderboard with timeFrame:', timeFrame, 'top:', top)
    const response = await apiClient.get(ENDPOINTS.LEADERBOARD.GET_ALL, {
      params: {
        timeFrame,
        top,
      },
    })

    console.log('API Response:', response.data)
    
    // Handle response structure: { isSuccess, data, errors, message, statusCode }
    if (response.data?.isSuccess && Array.isArray(response.data.data)) {
      console.log('Returning data array with length:', response.data.data.length)
      return response.data.data
    }
    
    // Fallback: check if data is directly an array
    if (Array.isArray(response.data?.data)) {
      console.log('Returning data array (fallback) with length:', response.data.data.length)
      return response.data.data
    }
    
    // Fallback: check if response.data is directly an array
    if (Array.isArray(response.data)) {
      console.log('Returning response.data as array with length:', response.data.length)
      return response.data
    }

    console.warn('Unexpected response format:', response.data)
    return []
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    console.error('Error details:', error.response?.data || error.message)
    throw error
  }
}

