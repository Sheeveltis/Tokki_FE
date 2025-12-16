import { apiErrors } from '../../../string.js'
import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'
import { handleApiError } from '../../admin/api'
import { mockVocabularies, mockFlashcardTopics } from '../mockData'

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms))

export async function fetchVocabularies(searchText) {
  try {
    await delay()
    const list = mockVocabularies.map((item) => ({
      ...item,
      id: item.vocabularyId, // giữ key tương thích bảng/route cũ
    }))
    if (!searchText) return list
    const q = searchText.trim().toLowerCase()
    return list.filter(
      (item) =>
        (item.text || '').toLowerCase().includes(q) ||
        (item.definition || '').toLowerCase().includes(q) ||
        (item.pronunciation || '').toLowerCase().includes(q),
    )
  } catch (error) {
    handleApiError(error, 'Không thể tải danh sách từ vựng')
  }
}

export async function createVocabulary(payload) {
  try {
    await delay()
    if (!payload?.text || !payload?.definition) {
      throw { status: 400, message: apiErrors.invalidData }
    }
    const vocabularyId = payload.vocabularyId || `v${Date.now()}`
    return {
      vocabularyId,
      id: vocabularyId,
      ...payload,
    }
  } catch (error) {
    handleApiError(error, 'Không thể tạo từ vựng mới')
  }
}

export async function updateVocabulary(payload) {
  try {
    await delay()
    if (!payload?.vocabularyId && !payload?.id) {
      throw { status: 400, message: apiErrors.invalidData }
    }
    const vocabularyId = payload.vocabularyId || payload.id
    return { ...payload, vocabularyId, id: vocabularyId }
  } catch (error) {
    handleApiError(error, 'Không thể cập nhật từ vựng')
  }
}

export async function fetchFlashcardTopics() {
  try {
    const res = await apiClient.get(ENDPOINTS.TOPIC.ADMIN_GET_ALL, {
      params: {
        pageNumber: 1,
        pageSize: 50,
      },
    })

    const payload = res?.data
    if (!payload?.isSuccess) {
      const message =
        payload?.message ||
        (Array.isArray(payload?.errors) && payload.errors[0]?.description) ||
        'Không thể tải chủ đề flashcard'
      throw new Error(message)
    }

    const pagingData = payload?.data
    const items = Array.isArray(pagingData?.items) ? pagingData.items : []

    return items.map((item) => ({
      id: item.topicId,
      title: item.topicName,
      subtitle:
        item.description ||
        (typeof item.vocabularyCount === 'number'
          ? `Có ${item.vocabularyCount} từ vựng`
          : ''),
      level: item.level,
      muted: false,
      vocabularyCount: item.vocabularyCount,
      imgUrl: item.imgUrl,
      _raw: item,
    }))
  } catch (error) {
    console.error('Error fetching flashcard topics (admin):', error)
    handleApiError(error, 'Không thể tải chủ đề flashcard')
    return mockFlashcardTopics
  }
}

/**
 * Lấy chi tiết 1 chủ đề kèm danh sách vocabularies
 * @param {string} topicId
 */
export async function fetchFlashcardTopicDetail(topicId) {
  try {
    const res = await apiClient.get(ENDPOINTS.TOPIC.GET_BY_ID(topicId))
    const payload = res?.data

    if (!payload?.isSuccess) {
      const message =
        payload?.message ||
        (Array.isArray(payload?.errors) && payload.errors[0]?.description) ||
        'Không thể tải chi tiết chủ đề'
      throw new Error(message)
    }

    const data = payload?.data
    const vocabularies = Array.isArray(data?.vocabularies) ? data.vocabularies : []

    const topic = {
      id: data?.topicId,
      title: data?.topicName,
      subtitle: data?.description || '',
      level: data?.level,
      imgUrl: data?.imgUrl,
      vocabularyCount: data?.vocabularyCount,
      vocabIds: vocabularies.map((v) => v.vocabularyId),
      muted: false,
      _raw: data,
    }

    const mappedVocabs = vocabularies.map((v) => ({
      ...v,
      id: v.vocabularyId,
      vocabularyId: v.vocabularyId,
    }))

    return { topic, vocabularies: mappedVocabs }
  } catch (error) {
    console.error('Error fetching flashcard topic detail:', error)
    handleApiError(error, 'Không thể tải chi tiết chủ đề')
    throw error
  }
}

export async function createFlashcardTopic(payload) {
  try {
    await delay()
    if (!payload?.title || !payload?.subtitle) {
      throw { status: 400, message: apiErrors.invalidData }
    }
    return {
      id: payload.id || `t${Date.now()}`,
      ...payload,
    }
  } catch (error) {
    handleApiError(error, 'Không thể tạo chủ đề flashcard')
  }
}

export async function updateFlashcardTopic(id, payload) {
  try {
    await delay()
    if (!id) throw { status: 400, message: apiErrors.invalidData }
    return {
      id,
      ...payload,
    }
  } catch (error) {
    handleApiError(error, 'Không thể cập nhật chủ đề flashcard')
  }
}

