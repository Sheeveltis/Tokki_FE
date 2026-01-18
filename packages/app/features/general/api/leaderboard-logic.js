import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

/**
 * Lấy danh sách leaderboard
 * @param {number} timeFrame - 0: ngày, 1: tuần, 2: tháng, 3: tất cả
 * @param {number} top - Số lượng top users (mặc định 100)
 * @returns {Promise<Array>} Danh sách leaderboard
 */
export const getLeaderboard = async (timeFrame = 0, top = 100) => {
  try {
    const response = await apiClient.get(ENDPOINTS.LEADERBOARD.GET_ALL, {
      params: {
        timeFrame,
        top,
      },
    })

    if (response.data?.isSuccess && Array.isArray(response.data.data)) {
      return response.data.data
    }
    return []
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    throw error
  }
}

