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
      isLearned: Boolean(item.isLearned),
      vocabularyCount: item.vocabularyCount ?? null,
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

    // Map về shape dùng trong FE: { id, word, meaning, pronunciation, imageUrl, audioUrl }
    return items.map((item) => ({
      id: item.vocabularyId,
      word: item.text,
      meaning: item.definition,
      pronunciation: item.pronunciation || null,
      imageUrl: item.imgURL || null,
      audioUrl: item.audioUrl || null,
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
 * Lấy danh sách từ vựng yêu thích
 * @param {Object} [options]
 * @param {number} [options.pageNumber=1] - Số trang
 * @param {number} [options.pageSize=100] - Số lượng từ vựng mỗi trang
 * @param {string} [options.searchTerm] - Từ khóa tìm kiếm
 * @returns {Promise<Array>} Danh sách từ vựng yêu thích
 */
export const getFavoriteVocabularies = async ({ pageNumber = 1, pageSize = 100, searchTerm } = {}) => {
  try {
    const params = {
      PageNumber: pageNumber,
      PageSize: pageSize,
    }

    if (searchTerm) {
      params.SearchTerm = searchTerm
    }

    const res = await apiClient.get(ENDPOINTS.FAVORITES.GET_ALL, { params })
    const payload = res?.data

    if (!payload?.isSuccess) {
      const message =
        payload?.message ||
        (Array.isArray(payload?.errors) && payload.errors[0]?.description) ||
        'Không thể tải danh sách từ vựng yêu thích'
      throw new Error(message)
    }

    const pagingData = payload?.data
    const items = Array.isArray(pagingData?.items) ? pagingData.items : []

    // Map về shape dùng trong FE: { id, word, meaning, imageUrl, audioUrl }
    return items.map((item) => ({
      id: item.vocabularyId || item.id,
      word: item.text || item.word,
      meaning: item.definition || item.meaning,
      imageUrl: item.imgURL || item.imageUrl || null,
      audioUrl: item.audioURL || item.audioUrl || null, // API trả về audioURL
      _raw: item,
    }))
  } catch (error) {
    console.error('Error fetching favorite vocabularies:', error)
    if (error?.response?.data) {
      const data = error.response.data
      const message =
        data?.message ||
        (Array.isArray(data?.errors) && data.errors[0]?.description) ||
        'Không thể tải danh sách từ vựng yêu thích'
      throw new Error(message)
    }
    throw error
  }
}

/**
 * Thêm từ vựng vào danh sách yêu thích
 * @param {string} vocabularyId - Vocabulary ID
 * @returns {Promise<boolean>}
 */
export const addFavorite = async (vocabularyId) => {
  try {
    const res = await apiClient.post(ENDPOINTS.FAVORITES.ADD, {
      vocabularyId,
    })
    return res?.data?.isSuccess || false
  } catch (error) {
    console.error('Error adding favorite:', error)
    throw error
  }
}

/**
 * Xóa từ vựng khỏi danh sách yêu thích
 * @param {string} vocabularyId - Vocabulary ID
 * @returns {Promise<boolean>}
 */
export const removeFavorite = async (vocabularyId) => {
  try {
    const res = await apiClient.delete(ENDPOINTS.FAVORITES.REMOVE, {
      data: { vocabularyId },
    })
    return res?.data?.isSuccess || false
  } catch (error) {
    console.error('Error removing favorite:', error)
    throw error
  }
}

/**
 * Submit kết quả spaced repetition
 * @param {string} vocabularyId - Vocabulary ID
 * @param {number} quality - QualityVocab enum: 0 (Again), 1 (Good), 2 (Easy)
 * @returns {Promise<{vocabularyId: string, isMastered: boolean}>}
 */
export const submitSpacedRepetition = async (vocabularyId, quality) => {
  try {
    const res = await apiClient.post(ENDPOINTS.SPACED_REPETITION.SUBMIT, {
      vocabularyId,
      quality,
    })
    return res?.data?.data || { vocabularyId, isMastered: false }
  } catch (error) {
    console.error('Error submitting spaced repetition:', error)
    throw error
  }
}

/**
 * Đánh dấu hoàn thành topic (khi học xong toàn bộ từ trong topic)
 * @param {string} topicId
 * @returns {Promise<boolean>}
 */
export const completeTopic = async (topicId) => {
  try {
    const res = await apiClient.post(ENDPOINTS.SPACED_REPETITION.COMPLETE_TOPIC, {
      topicId,
    })
    return Boolean(res?.data?.data)
  } catch (error) {
    console.error('Error completing topic:', error)
    throw error
  }
}

/**
 * Lấy danh sách từ vựng đã học
 * @param {Object} [options]
 * @param {number} [options.limit=100] - Số lượng từ vựng tối đa
 * @returns {Promise<Array>} Danh sách từ vựng đã học
 */
export const getLearnedVocabularies = async ({ limit = 100 } = {}) => {
  try {
    const params = {
      limit,
    }

    const res = await apiClient.get(ENDPOINTS.SPACED_REPETITION.GET_LEARNED, { params })
    const payload = res?.data

    if (!payload?.isSuccess) {
      const message =
        payload?.message ||
        (Array.isArray(payload?.errors) && payload.errors[0]?.description) ||
        'Không thể tải danh sách từ vựng đã học'
      throw new Error(message)
    }

    // API trả về mảng trực tiếp trong data
    const items = Array.isArray(payload?.data) ? payload.data : []

    // Map về shape dùng trong FE: { id, word, meaning, imageUrl, audioUrl, pronunciation, boxLevel, streak, nextReviewAt }
    return items.map((item) => ({
      id: item.vocabularyId,
      userVocabProgressId: item.userVocabProgressId,
      word: item.text,
      meaning: item.definition,
      pronunciation: item.pronunciation || null,
      imageUrl: item.imageUrl || null,
      audioUrl: item.audioUrl || null,
      boxLevel: item.boxLevel || 1,
      streak: item.streak || 0,
      nextReviewAt: item.nextReviewAt || null,
      _raw: item,
    }))
  } catch (error) {
    console.error('Error fetching learned vocabularies:', error)
    if (error?.response?.data) {
      const data = error.response.data
      const message =
        data?.message ||
        (Array.isArray(data?.errors) && data.errors[0]?.description) ||
        'Không thể tải danh sách từ vựng đã học'
      throw new Error(message)
    }
    throw error
  }
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

