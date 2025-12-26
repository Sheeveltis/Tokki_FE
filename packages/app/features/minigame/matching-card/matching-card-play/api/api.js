import { apiClient } from '../../../../../provider/api/client'
import { ENDPOINTS } from '../../../../../provider/api/endpoints'

/**
 * Get matching cards from API
 * @param {string} topicId - Topic ID
 * @param {number} quantity - Number of pairs (5 for easy, 10 for medium, 18 for hard)
 * @returns {Promise<Array<{id:string, ko:string, vi:string}>>}
 */
export const getMatchingCards = async (topicId, quantity) => {
  try {
    const response = await apiClient.get(ENDPOINTS.MINIGAME.MATCHING_CARDS, {
      params: {
        topicId,
        quantity,
      },
    })
    
    // API returns { isSuccess: true, data: [...] }
    // Each item has: vocabularyId, text, pronunciation, definition, imgURL, audioURL
    const apiData = response.data?.data || []
    
    // Map API response to component format
    return apiData.map((item) => ({
      id: item.vocabularyId,
      ko: item.text,
      vi: item.definition,
    }))
  } catch (error) {
    console.error('Error fetching matching cards:', error)
    throw error
  }
}
