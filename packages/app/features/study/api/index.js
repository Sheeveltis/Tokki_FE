import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'
import DefaultBunny from '../../../../assets/bunny/14.png'

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
 */

/**
 * Lấy danh sách flashcard topics (backend thật)
 * @param {string|number} levelId - Level ID (optional)
 * @param {Object} [options]
 * @param {number} [options.pageNumber=1]
 * @param {number} [options.pageSize=6]
 * @param {string} [options.searchTerm]
 * @returns {Promise<Array>} Danh sách flashcard topics đã map về cùng shape với FLASHCARD_TOPICS mock
 */
export const getFlashcardTopics = async (
  levelId,
  { pageNumber = 1, pageSize = 6, searchTerm } = {}
) => {
  try {
    const params = {
      pageNumber,
      pageSize,
    }

    // Backend yêu cầu query "level"
    if (levelId !== undefined && levelId !== null && levelId !== '') {
      params.level = levelId
    }

    if (searchTerm) {
      params.searchTerm = searchTerm
    }

    const res = await apiClient.get(ENDPOINTS.TOPIC.USER_GET_ALL, { params })
    const pagingData = res?.data?.data
    let items = Array.isArray(pagingData?.items) ? pagingData.items : []

    // Nếu backend chưa filter theo level thì filter lại trên FE cho chắc
    if (levelId !== undefined && levelId !== null && levelId !== '') {
      const levelNumber = Number(levelId)
      if (!Number.isNaN(levelNumber)) {
        items = items.filter((x) => Number(x.level) === levelNumber)
      }
    }

    // Map về shape mà UI đang dùng (id, title, subtitle, icon, level, muted, vocabIds)
    const topics = items.map((item) => ({
      id: item.topicId,
      title: item.topicName,
      subtitle:
        item.description ||
        (typeof item.vocabularyCount === 'number'
          ? `Có ${item.vocabularyCount} từ vựng`
          : ''),
      level: item.level,
      icon: item.imgUrl || DefaultBunny,
      muted: false,
      vocabIds: [],
      // Giữ raw để sau này nếu cần thêm thông tin
      _raw: item,
    }))

    return topics
  } catch (error) {
    console.error('Error fetching flashcard topics:', error)
    // Fallback về mock data khi có lỗi hoặc backend chưa sẵn sàng
    const { FLASHCARD_TOPICS } = await import('../../vocabulary/mockData')

    if (levelId === undefined || levelId === null || levelId === '') {
      return FLASHCARD_TOPICS
    }

    const levelNumber = Number(levelId)
    if (Number.isNaN(levelNumber)) {
      return FLASHCARD_TOPICS
    }

    // Filter mock theo level cho đồng nhất behaviour với API thật
    return FLASHCARD_TOPICS.filter((x) => Number(x.level) === levelNumber)
  }
}

/**
 * Lấy danh sách flashcards theo topic
 * @param {string} topicId - Topic ID
 * @returns {Promise<Array>} Danh sách flashcards
 */
export const getFlashcardsByTopic = async (topicId) => {
  try {
    const res = await apiClient.get(ENDPOINTS.VOCABULARY.FLASH_CARD_TOPIC, {
      params: { TopicId: topicId },
    })

    const payload = res?.data

    if (!payload?.isSuccess) {
      const message =
        payload?.message ||
        (Array.isArray(payload?.errors) && payload.errors[0]?.description) ||
        'Không thể tải danh sách từ vựng'
      throw new Error(message)
    }

    const items = Array.isArray(payload?.data) ? payload.data : []

    // Map về shape dùng trong FE: { word, meaning, imageUrl }
    return items.map((item) => ({
      word: item.text,
      meaning: item.definition,
      imageUrl: item.imgURL || null,
      _raw: item,
    }))
  } catch (error) {
    console.error('Error fetching flashcards by topic:', error)
    // Ném lỗi ra cho layer sử dụng tự xử lý (hiển thị message / fallback)
    if (error?.response?.data) {
      const data = error.response.data
      const message =
        data?.message ||
        (Array.isArray(data?.errors) && data.errors[0]?.description) ||
        'Không thể tải danh sách từ vựng'
      throw new Error(message)
    }
    throw error
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

