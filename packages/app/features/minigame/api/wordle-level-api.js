import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

/**
 * Gọi API Wordle level.
 * Backend hiện trả về một mảng các level dạng:
 * [
 *   { dailyWordleId, level: 1, wordLength, isWon, attemptCount, maxAttempts, guesses: [] },
 *   ...
 * ]
 */

export const getWordleLevels = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.MINIGAME.WORDLE)
    
    // Debug: log toàn bộ response để kiểm tra structure
    console.log('[getWordleLevels] Full response:', response)
    console.log('[getWordleLevels] response.data:', response?.data)
    
    let data = response?.data

    // Nếu có data.data (nested), unwrap nó
    if (data?.data && !Array.isArray(data)) {
      data = data.data
      console.log('[getWordleLevels] Unwrapped data.data:', data)
    }

    // Hỗ trợ nhiều kiểu response:
    // 1. { levels: [...] } - format từ API hiện tại
    // 2. [...] trực tiếp - array
    // 3. { isSuccess, data: { levels: [...] } } - nested format
    if (Array.isArray(data)) {
      console.log('[getWordleLevels] Found array directly:', data)
      return data
    }
    if (data && Array.isArray(data.levels)) {
      console.log('[getWordleLevels] Found data.levels:', data.levels)
      return data.levels
    }
    
    console.warn('[getWordleLevels] No levels found in response structure:', data)
    return []
  } catch (error) {
    console.error('[getWordleLevels] Error fetching levels:', error)
    return []
  }
}

/**
 * Lấy thông tin level theo độ khó:
 * 1 = dễ, 2 = trung bình, 3 = khó
 */
export const getWordleLevelByDifficulty = async (difficultyLevel) => {
  const levels = await getWordleLevels()
  console.log('[getWordleLevelByDifficulty] All levels:', levels)
  console.log('[getWordleLevelByDifficulty] Looking for difficulty:', difficultyLevel, 'type:', typeof difficultyLevel)
  
  // Thử cả number và string comparison
  const found = levels.find((lv) => {
    const levelValue = lv.level
    console.log('[getWordleLevelByDifficulty] Checking level:', levelValue, 'type:', typeof levelValue, 'matches:', levelValue === difficultyLevel || String(levelValue) === String(difficultyLevel))
    return levelValue === difficultyLevel || Number(levelValue) === Number(difficultyLevel)
  })
  
  console.log('[getWordleLevelByDifficulty] Found level:', found)
  return found || null
}

/**
 * Gửi một lượt đoán lên backend
 * body dự kiến: { dailyWordleId, guessWord }
 * API: POST /minigame/wordle/guess
 */
export const submitWordleGuess = async (dailyWordleId, guessWord) => {
  const response = await apiClient.post(`${ENDPOINTS.MINIGAME.WORDLE}/guess`, {
    dailyWordleId,
    guessWord,
  })
  const data = response?.data
  // Trả về data chuẩn bên trong
  if (data && data.data) return data.data
  return data
}

/**
 * Lấy kết quả Wordle sau khi đoán đúng
 * API: GET /api/minigame/wordle/result/{dailyWordleId}
 */
export const getWordleResult = async (dailyWordleId) => {
  try {
    const response = await apiClient.get(`${ENDPOINTS.MINIGAME.WORDLE}/result/${dailyWordleId}`)
    const data = response?.data
    // Trả về data chuẩn bên trong
    if (data && data.data) return data.data
    return data
  } catch (error) {
    console.error('[getWordleResult] Error fetching result:', error)
    return null
  }
}

/**
 * Gửi câu văn sau khi đoán đúng từ
 * body dự kiến: { dailyWordleId, sentenceContent }
 * API: POST /api/minigame/wordle/submit-sentence
 */
export const submitWordleSentence = async (dailyWordleId, sentenceContent) => {
  try {
    // API chấm điểm câu văn dùng AI có thể chạy hơi lâu,
    // nên override timeout mặc định (10s) lên 60s cho request này.
    const response = await apiClient.post(
      `${ENDPOINTS.MINIGAME.WORDLE}/submit-sentence`,
      {
        dailyWordleId,
        sentenceContent,
      },
      {
        timeout: 60000,
      }
    )
    const data = response?.data
    // Trả về data chuẩn bên trong
    if (data && data.data) return data.data
    return data
  } catch (error) {
    console.error('[submitWordleSentence] Error submitting sentence:', error)
    throw error
  }
}

/**
 * Công khai/ẩn câu văn đã submit
 * body dự kiến: { submissionId, isPublic, isAnonymous }
 * API: PUT /api/minigame/wordle/publish-sentence
 */
export const publishWordleSentence = async (submissionId, isPublic, isAnonymous) => {
  try {
    const response = await apiClient.put(ENDPOINTS.MINIGAME.WORDLE_PUBLISH_SENTENCE, {
      submissionId,
      isPublic,
      isAnonymous,
    })
    const data = response?.data
    // Trả về data chuẩn bên trong
    if (data && data.data) return data.data
    return data
  } catch (error) {
    console.error('[publishWordleSentence] Error publishing sentence:', error)
    throw error
  }
}

/**
 * Lấy top sentences của một dailyWordleId
 * API: GET /api/minigame/wordle/{dailyWordleId}/top-sentences?top={top}
 */
export const getWordleTopSentences = async (dailyWordleId, top = 20) => {
  try {
    const response = await apiClient.get(ENDPOINTS.MINIGAME.WORDLE_TOP_SENTENCES(dailyWordleId), {
      params: { top },
    })
    const data = response?.data
    // Trả về data chuẩn bên trong
    if (data && data.data) return data.data
    if (Array.isArray(data)) return data
    return []
  } catch (error) {
    console.error('[getWordleTopSentences] Error fetching top sentences:', error)
    return []
  }
}

