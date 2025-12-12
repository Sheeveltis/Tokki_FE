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
 * @param {string} levelId - Level ID
 * @returns {Promise<Array>}
 */
export const getFlashcardTopics = async (levelId) => {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/flashcard/topics?level=${levelId}`)
  // return response.json()
  return Promise.resolve([])
}

/**
 * Lấy danh sách flashcards theo topic
 * @param {string} topicId - Topic ID
 * @returns {Promise<Array>}
 */
export const getFlashcardsByTopic = async (topicId) => {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/flashcard/${topicId}`)
  // return response.json()
  return Promise.resolve([])
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

