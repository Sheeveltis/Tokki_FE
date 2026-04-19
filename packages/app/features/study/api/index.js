import { apiClient } from '@tokki/app/provider/api/client'
import { ENDPOINTS } from '@tokki/app/provider/api/endpoints'
import DefaultBunny from 'assets/bunny/14.png'

/**
 * Utility function để normalize image source cho React Native và Web
 * Hỗ trợ: require('...png'), { uri: '...' }, Next.js static imports
 */
export const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  // Xử lý object có src property (SVG component thường có)
  if (typeof src === 'object' && src.src) {
    return { uri: src.src }
  }
  // Xử lý object có default property (một số bundler wrap SVG như vậy)
  if (typeof src === 'object' && src.default) {
    const defaultSrc = src.default
    if (typeof defaultSrc === 'string') {
      return { uri: defaultSrc }
    }
    if (typeof defaultSrc === 'object' && defaultSrc.src) {
      return { uri: defaultSrc.src }
    }
    if (typeof defaultSrc === 'object' && defaultSrc.uri) {
      return { uri: defaultSrc.uri }
    }
    return defaultSrc
  }
  if (typeof src === 'string') {
    return { uri: src }
  }
  // Trả về nguyên bản nếu không xử lý được
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
    let rawItems = Array.isArray(pagingData?.items) ? pagingData.items : []

    // Map về shape mà UI đang dùng (id, title, subtitle, icon, level, muted, vocabIds)
    const items = rawItems.map((item) => ({
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
      progress: typeof item.progress === 'number' ? item.progress : 0,
      vocabularyCount: item.vocabularyCount ?? null,
      // Giữ raw để sau này nếu cần thêm thông tin
      _raw: item,
    }))

    return {
      items,
      totalPages: pagingData?.totalPages || 1,
      totalCount: pagingData?.totalCount || 0,
      pageNumber: pagingData?.pageNumber || pageNumber,
      pageSize: pagingData?.pageSize || pageSize,
    }
  } catch (error) {
    console.error('Error fetching flashcard topics:', error)
    // Fallback về mock data khi có lỗi hoặc backend chưa sẵn sàng
    const { FLASHCARD_TOPICS } = await import('@tokki/app/features/vocabulary/mockData')

    let filteredMock = FLASHCARD_TOPICS
    if (levelId !== undefined && levelId !== null && levelId !== '') {
      const levelNumber = Number(levelId)
      if (!Number.isNaN(levelNumber)) {
        filteredMock = FLASHCARD_TOPICS.filter((x) => Number(x.level) === levelNumber)
      }
    }

    // Manual paging for mock data
    const startIndex = (pageNumber - 1) * pageSize
    const paginatedItems = filteredMock.slice(startIndex, startIndex + pageSize)

    return {
      items: paginatedItems,
      totalPages: Math.ceil(filteredMock.length / pageSize) || 1,
      totalCount: filteredMock.length,
      pageNumber,
      pageSize,
    }
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
    // Fallback về mock data khi có lỗi (để test trên mobile khi chưa có backend)
    console.warn('Using mock data for topic:', topicId)
    try {
      const { getMockVocabulariesByTopic } = await import('@tokki/app/features/vocabulary/mockData')
      const mockData = getMockVocabulariesByTopic(topicId)
      if (mockData && mockData.length > 0) {
        return mockData
      }
    } catch (mockError) {
      console.error('Error loading mock data:', mockError)
    }
    
    // Nếu không có mock data, ném lỗi
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
 * Lấy danh sách từ vựng để học (batch learning)
 * @param {string} topicId - Topic ID
 * @param {number} count - Số lượng từ vựng cần lấy (mặc định 5)
 * @returns {Promise<Array>} Danh sách flashcards
 */
export const getFlashcardsForStudy = async (topicId, count = 5) => {
  try {
    const res = await apiClient.get(ENDPOINTS.TOPIC.USER_STUDY, {
      params: { topicId, count },
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
    console.error('Error fetching flashcards for study:', error)
    // Fallback về mock data khi có lỗi (để test trên mobile khi chưa có backend)
    console.warn('Using mock data for study topic:', topicId)
    try {
      const { getMockVocabulariesByTopic } = await import('@tokki/app/features/vocabulary/mockData')
      const mockData = getMockVocabulariesByTopic(topicId)
      if (mockData && mockData.length > 0) {
        // Trả về số lượng theo count, nhưng không quá số lượng có sẵn
        return mockData.slice(0, count)
      }
    } catch (mockError) {
      console.error('Error loading mock data:', mockError)
    }
    
    // Nếu không có mock data, ném lỗi
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
    // Fallback về mock data khi có lỗi (để test trên mobile khi chưa có backend)
    console.warn('Using mock data for favorite vocabularies')
    try {
      const { getMockFavoriteVocabularies } = await import('@tokki/app/features/vocabulary/mockData')
      const mockData = getMockFavoriteVocabularies()
      if (mockData && mockData.length > 0) {
        // Áp dụng pagination và search nếu có
        let filtered = mockData
        if (searchTerm) {
          const term = searchTerm.toLowerCase()
          filtered = mockData.filter(
            (v) =>
              v.word.toLowerCase().includes(term) ||
              v.meaning.toLowerCase().includes(term)
          )
        }
        // Pagination
        const startIndex = (pageNumber - 1) * pageSize
        const endIndex = startIndex + pageSize
        const paginated = filtered.slice(startIndex, endIndex)
        return paginated
      }
    } catch (mockError) {
      console.error('Error loading mock data:', mockError)
    }
    
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
 * Submit kết quả spaced repetition với isCorrect (dùng cho flashcard-first-learn)
 * @param {string} vocabularyId - Vocabulary ID
 * @param {boolean} isCorrect - Kết quả học tập: true nếu đúng, false nếu sai
 * @returns {Promise<{vocabularyId: string, isMastered: boolean}>}
 */
export const submitSpacedRepetitionWithCorrect = async (vocabularyId, isCorrect) => {
  try {
    const res = await apiClient.post(ENDPOINTS.SPACED_REPETITION.SUBMIT, {
      vocabularyId,
      isCorrect,
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
 * Lấy danh sách từ vựng đã học có phân trang (dùng cho hiển thị danh sách)
 * @param {Object} [options]
 * @param {number} [options.pageIndex=1]
 * @param {number} [options.pageSize=30]
 * @returns {Promise<Object>} Object chứa mảng items và thông tin phân trang
 */
export const getLearnedVocabulariesPaginated = async ({ pageIndex = 1, pageSize = 30 } = {}) => {
  try {
    const params = {
      pageIndex,
      pageSize,
    }

    const res = await apiClient.get(ENDPOINTS.SPACED_REPETITION.GET_REVIEW_PAGINATED, { params })
    const payload = res?.data

    if (!payload?.isSuccess) {
      const message =
        payload?.message ||
        (Array.isArray(payload?.errors) && payload.errors[0]?.description) ||
        'Không thể tải danh sách từ vựng từ server'
      throw new Error(message)
    }

    const pagingData = payload?.data
    const items = Array.isArray(pagingData?.items) ? pagingData.items : []

    return {
      items: items.map((item) => ({
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
      })),
      totalPages: pagingData?.totalPages || 1,
      totalCount: pagingData?.totalCount || 0,
      pageIndex: pagingData?.pageIndex || pageIndex,
      pageSize: pagingData?.pageSize || pageSize,
    }
  } catch (error) {
    console.error('Error fetching paginated learned vocabularies:', error)
    // Fallback về mock data
    try {
      const { getMockLearnedVocabularies } = await import('@tokki/app/features/vocabulary/mockData')
      const mockData = getMockLearnedVocabularies()
      const startIndex = (pageIndex - 1) * pageSize
      const paginated = mockData.slice(startIndex, startIndex + pageSize)
      
      return {
        items: paginated,
        totalPages: Math.ceil(mockData.length / pageSize),
        totalCount: mockData.length,
        pageIndex,
        pageSize,
      }
    } catch (mockError) {
      throw error
    }
  }
}

/**
 * Lấy danh sách từ vựng cho practice (không phân trang, có limit)
 * @param {Object} [options]
 * @param {number} [options.limit=10] - Số lượng từ vựng tối đa
 * @returns {Promise<Array>} Danh sách từ vựng đã học cho practice
 */
export const getLearnedVocabularies = async ({ limit = 10 } = {}) => {
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
        'Không thể tải danh sách từ vựng cho practice'
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
    console.error('Error fetching learned vocabularies for practice:', error)
    // Fallback về mock data
    try {
      const { getMockLearnedVocabularies } = await import('@tokki/app/features/vocabulary/mockData')
      const mockData = getMockLearnedVocabularies()
      return mockData.slice(0, limit)
    } catch (mockError) {
      throw error
    }
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

let roadmapProgressPromise = null

/**
 * Lấy tiến độ lộ trình tuần hiện tại
 * @returns {Promise<Object|null>}
 */
export const getCurrentWeekProgress = async () => {
  if (roadmapProgressPromise) return roadmapProgressPromise

  roadmapProgressPromise = (async () => {
    try {
      const res = await apiClient.get(ENDPOINTS.ROADMAP.CURRENT_WEEK_PROGRESS)
      if (res?.data?.isSuccess) {
        return res.data.data
      }
      return null
    } catch (error) {
      // Chỉ log lỗi nếu không phải là 404 (404 có nghĩa là chưa có lộ trình, là bình thường)
      if (error?.response?.status !== 404) {
        console.error('Error fetching current week progress:', error)
      }
      return null
    } finally {
      // Xóa promise sau một thời gian ngắn để cho phép fetch lại khi cần (ví dụ khi chuyển trang)
      setTimeout(() => {
        roadmapProgressPromise = null
      }, 5000)
    }
  })()

  return roadmapProgressPromise
}

/**
 * Lấy thông tin cấp độ và kinh nghiệm của người dùng
 * @returns {Promise<Object|null>}
 */
export const getGamificationProgress = async () => {
  try {
    const res = await apiClient.get(ENDPOINTS.GAMIFICATION.PROGRESS)
    if (res?.data) {
      return res.data
    }
    return null
  } catch (error) {
    console.error('Error fetching gamification progress:', error)
    return null
  }
}

/**
 * Lấy danh sách bảng xếp hạng
 * @param {number} timeFrame - 0: All time, 1: Weekly, 2: Monthly
 * @param {number} top - Số lượng người dùng đứng đầu
 * @returns {Promise<Array>}
 */
export const getLeaderboardData = async (timeFrame = 0, top = 20) => {
  try {
    const res = await apiClient.get(ENDPOINTS.LEADERBOARD.GET_ALL, {
      params: { timeFrame, top }
    })
    if (res?.data?.isSuccess) {
      return res.data.data
    }
    return []
  } catch (error) {
    console.error('Error fetching leaderboard data:', error)
    return []
  }
}
