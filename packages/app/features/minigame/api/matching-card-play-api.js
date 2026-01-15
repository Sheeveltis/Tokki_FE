import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

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
      imgUrl: item.imgURL || null, // Thêm trường imgURL từ API
    }))
  } catch (error) {
    console.error('Error fetching matching cards:', error)
    throw error
  }
}

/**
 * Map levelId to gameDifficulty enum
 * @param {string} levelId - Level ID (easy, medium, hard)
 * @returns {number} gameDifficulty (1=dễ, 2=trung bình, 3=khó)
 */
export const mapLevelToDifficulty = (levelId) => {
  const levelMap = {
    'easy': 1,
    'medium': 2,
    'hard': 3,
  }
  return levelMap[levelId] || 2 // Default to medium
}

/**
 * Check if user has played this level before
 * @param {string} gameId - Game ID
 * @param {string} topicId - Topic ID
 * @param {number} gameDifficulty - Game difficulty (1=dễ, 2=trung bình, 3=khó)
 * @returns {Promise<boolean>} true if user has played, false otherwise
 */
export const hasPlayedLevel = async (gameId, topicId, gameDifficulty) => {
  try {
    const response = await apiClient.get(ENDPOINTS.GAMES.HAS_PLAYED_LEVEL, {
      params: {
        gameId,
        topicId,
        gameDifficulty,
      },
    })
    
    // API returns { isSuccess: true, data: boolean }
    if (response.data?.isSuccess) {
      return response.data.data === true
    }
    return false
  } catch (error) {
    console.error('[hasPlayedLevel] Error:', error)
    // Default to false if error (treat as new play)
    return false
  }
}

/**
 * Save game result (POST - for new record)
 * @param {string} gameId - Game ID
 * @param {string} topicId - Topic ID
 * @param {number} score - Score achieved
 * @param {number} gameDifficulty - Game difficulty (1=dễ, 2=trung bình, 3=khó)
 * @returns {Promise<{ isSuccess: boolean; message: string }>}
 */
export const saveGameResult = async (gameId, topicId, score, gameDifficulty) => {
  try {
    const response = await apiClient.post(ENDPOINTS.GAMES.SAVE_RESULT, {
      gameId,
      topicId,
      score,
      gameDifficulty,
    })
    return response.data
  } catch (error) {
    console.error('[saveGameResult] Error:', error)
    throw error
  }
}

/**
 * Update game result (PUT - for existing record)
 * @param {string} gameId - Game ID
 * @param {string} topicId - Topic ID
 * @param {number} score - Score achieved
 * @param {number} gameDifficulty - Game difficulty (1=dễ, 2=trung bình, 3=khó)
 * @returns {Promise<{ isSuccess: boolean; message: string }>}
 */
export const updateGameResult = async (gameId, topicId, score, gameDifficulty) => {
  try {
    const response = await apiClient.put(ENDPOINTS.GAMES.UPDATE_RESULT, {
      gameId,
      topicId,
      score,
      gameDifficulty,
    })
    return response.data
  } catch (error) {
    console.error('[updateGameResult] Error:', error)
    throw error
  }
}

/**
 * Get all user results for leaderboard
 * @param {string} gameId - Game ID
 * @param {string} topicId - Topic ID
 * @param {number} gameDifficulty - Game difficulty (1=dễ, 2=trung bình, 3=khó)
 * @param {number} pageNumber - Page number (default: 1)
 * @param {number} pageSize - Page size (default: 10)
 * @returns {Promise<{ isSuccess: boolean; data: { items: Array<{ gameMatchSessionId: string; userId: string; gameId: string; topicId: string; bestScore: number; latestScore: number; gameDifficulty: number; createdAt: string }>; pageNumber: number; pageSize: number; totalCount: number; totalPages: number }>; message: string }>}
 */
export const getAllUserResults = async (gameId, topicId, gameDifficulty, pageNumber = 1, pageSize = 10) => {
  try {
    const response = await apiClient.get(ENDPOINTS.GAMES.GET_ALL_USER_RESULTS, {
      params: {
        gameId,
        topicId,
        gameDifficulty,
        pageNumber,
        pageSize,
      },
    })
    return response.data
  } catch (error) {
    console.error('[getAllUserResults] Error:', error)
    throw error
  }
}
