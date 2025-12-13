/**
 * Utility function để normalize image source cho React Native và Web
 * Hỗ trợ: require('...png'), { uri: '...' }, Next.js static imports
 */
export const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) {
    return { uri: src.src }
  }
  if (typeof src === 'string') {
    return { uri: src }
  }
  return src
}

/**
 * API functions cho study feature
 * TODO: Thêm các API calls thực tế khi backend sẵn sàng
 */

/**
 * Lấy danh sách flashcard topics
 * @param {string} levelId - Level ID (optional)
 * @returns {Promise<Array>} Danh sách flashcard topics
 */
export const getFlashcardTopics = async (levelId) => {
  try {
    // TODO: Thêm endpoint vào ENDPOINTS khi backend sẵn sàng
    // const { apiClient } = await import('../../../provider/api/client')
    // const { ENDPOINTS } = await import('../../../provider/api/endpoints')
    // const params = levelId ? { levelId } : {}
    // const res = await apiClient.get(ENDPOINTS.FLASHCARD?.TOPICS || '/Flashcard/topics', { params })
    // const data = res?.data?.data || res?.data
    // return Array.isArray(data) ? data : []
    
    // Fallback về mock data nếu API chưa sẵn sàng
    const { FLASHCARD_TOPICS } = await import('../mockData')
    return Promise.resolve(FLASHCARD_TOPICS)
  } catch (error) {
    console.error('Error fetching flashcard topics:', error)
    // Fallback về mock data khi có lỗi
    const { FLASHCARD_TOPICS } = await import('../mockData')
    return FLASHCARD_TOPICS
  }
}

/**
 * Lấy danh sách flashcards theo topic
 * @param {string} topicId - Topic ID
 * @returns {Promise<Array>} Danh sách flashcards
 */
export const getFlashcardsByTopic = async (topicId) => {
  try {
    // TODO: Thêm endpoint vào ENDPOINTS khi backend sẵn sàng
    // const { apiClient } = await import('../../../provider/api/client')
    // const { ENDPOINTS } = await import('../../../provider/api/endpoints')
    // const res = await apiClient.get(ENDPOINTS.FLASHCARD?.BY_TOPIC?.(topicId) || `/Flashcard/topic/${topicId}`)
    // const data = res?.data?.data || res?.data
    // return Array.isArray(data) ? data : []
    
    // Fallback về mock data nếu API chưa sẵn sàng
    const { FLASHCARDS } = await import('../mockData')
    return Promise.resolve(FLASHCARDS)
  } catch (error) {
    console.error('Error fetching flashcards by topic:', error)
    // Fallback về mock data khi có lỗi
    const { FLASHCARDS } = await import('../mockData')
    return FLASHCARDS
  }
}

/**
 * Lưu flashcard vào danh sách yêu thích
 * @param {string} flashcardId - Flashcard ID
 * @returns {Promise<boolean>}
 */
export const toggleFavoriteFlashcard = async (flashcardId) => {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/flashcard/${flashcardId}/favorite`, { method: 'POST' })
  // return response.json()
  return Promise.resolve(true)
}

/**
 * Lấy danh sách skill modules theo level
 * @param {number} levelId - Level ID
 * @returns {Promise<Array>}
 */
export const getSkillModules = async (levelId) => {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/study/modules?level=${levelId}`)
  // return response.json()
  return Promise.resolve([])
}

