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

/**
 * Lấy danh sách người chơi một từ vựng Wordle (admin)
 * @param {string} dailyWordleId
 * @param {Object} params
 */
export const fetchWordlePlayers = async (dailyWordleId, params) => {
  const response = await apiClient.get(ENDPOINTS.MINIGAME.WORDLE_ADMIN_PLAYERS(dailyWordleId), {
    params,
  })
  return response.data
}

/**
 * Lấy bảng xếp hạng cho một từ vựng Wordle (admin)
 * @param {string} dailyWordleId
 * @param {Object} params
 */
export const fetchWordleLeaderboard = async (dailyWordleId, params) => {
  const response = await apiClient.get(ENDPOINTS.MINIGAME.WORDLE_ADMIN_LEADERBOARD(dailyWordleId), {
    params,
  })
  return response.data
}

/**
 * Bật/tắt công khai câu văn Wordle
 * @param {string} submissionId
 * @param {boolean} isPublic
 */
export const toggleWordleSubmissionVisibility = async (submissionId, isPublic) => {
  const response = await apiClient.put(ENDPOINTS.MINIGAME.WORDLE_TOGGLE_VISIBILITY, {
    submissionId,
    isPublic,
  })
  return response.data
}
