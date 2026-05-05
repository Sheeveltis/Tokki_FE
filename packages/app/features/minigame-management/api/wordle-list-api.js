import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

/**
 * Lấy danh sách từ vựng Wordle (admin)
 * @param {Object} params
 * @param {number} params.PageNumber
 * @param {number} params.PageSize
 * @param {string} params.Date
 * @param {number} params.Level
 * @param {string} params.SearchTerm
 */
export const fetchWordleVocabularies = async (params) => {
  const response = await apiClient.get(ENDPOINTS.MINIGAME.WORDLE_ADMIN_PAGINATION, {
    params,
  })
  return response.data
}

/**
 * Đổi ngẫu nhiên từ vựng Wordle mới
 * @param {string} dailyWordleId
 */
export const rerollWordle = async (dailyWordleId) => {
  const response = await apiClient.post(ENDPOINTS.MINIGAME.WORDLE_REROLL, {
    dailyWordleId,
  })
  return response.data
}

/**
 * Lấy danh sách từ vựng phù hợp để chọn thủ công
 * @param {Object} params
 */
export const fetchSuitableVocabs = async (params) => {
  const response = await apiClient.get(ENDPOINTS.MINIGAME.WORDLE_SUITABLE_VOCABS, {
    params,
  })
  return response.data
}

/**
 * Gán một từ vựng cụ thể cho ngày chơi Wordle
 * @param {string} dailyWordleId
 * @param {string} vocabularyId
 */
export const assignWordleVocab = async (dailyWordleId, vocabularyId) => {
  const response = await apiClient.post(ENDPOINTS.MINIGAME.WORDLE_ASSIGN_VOCAB, {
    dailyWordleId,
    vocabularyId,
  })
  return response.data
}
