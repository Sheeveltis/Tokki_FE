import { apiErrors } from '../../../string.js'
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
    await delay()
    return mockFlashcardTopics
  } catch (error) {
    handleApiError(error, 'Không thể tải chủ đề flashcard')
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

