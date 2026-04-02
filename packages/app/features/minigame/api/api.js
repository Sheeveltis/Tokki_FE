// Minigame API functions
// Get games for user

import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

/**
 * Get all games for user
 * @param {number} pageNumber - Page number (default: 1)
 * @param {number} pageSize - Page size (default: 10)
 * @returns {Promise<{ isSuccess: boolean; data: { items: Array<{ gameId: string; gameName: string; gameType: number; isVip: boolean; imgUrl: string }>; pageNumber: number; pageSize: number; totalCount: number; totalPages: number }>; message: string; statusCode: number }>}
 */
export async function getUserGames(pageNumber = 1, pageSize = 10) {
  try {
    const response = await apiClient.get(ENDPOINTS.GAMES.USER_GET_ALL, {
      params: {
        pageNumber,
        pageSize,
      },
    })
    return response.data
  } catch (error) {
    console.error('[getUserGames] Error:', error)
    throw error
  }
}

/**
 * Cộng XP cho minigame theo độ khó
 * @param {'easy'|'medium'|'hard'|number|string} level
 * @returns {Promise<any>}
 */
export async function awardMinigameXP(level) {
  const levelKey = String(level || '').toLowerCase()
  const amount = levelKey === 'hard' || levelKey === '3'
    ? 50
    : levelKey === 'medium' || levelKey === '2'
      ? 40
      : 30

  try {
    const response = await apiClient.post(ENDPOINTS.GAMIFICATION.GAME_XP, { amount })
    return response.data
  } catch (error) {
    console.error('[awardMinigameXP] Error:', error)
    throw error
  }
}
