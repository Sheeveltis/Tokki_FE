import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'
import { handleApiError } from '../../admin/api'

export async function fetchQuestionTypes(params = {}) {
  try {
    const res = await apiClient.get(ENDPOINTS.QUESTION_TYPE.GET_ALL, { params })
    console.log('[QuestionType API] GET_ALL params:', params)
    console.log('[QuestionType API] GET_ALL response:', res?.data)
    return res.data?.data || []
  } catch (error) {
    console.error('[QuestionType API] GET_ALL error:', error?.response?.data || error)
    throw error
  }
}

export async function fetchQuestionTypeById(id) {
  const res = await apiClient.get(ENDPOINTS.QUESTION_TYPE.GET_BY_ID(id))
  return res.data?.data || null
}

/**
 * Update a question type
 * @param {string} id - Question type ID
 * @param {Object} payload - Question type data
 * @param {string} payload.name - Question type name
 * @param {string} payload.code - Question type code
 * @param {string} payload.description - Description
 * @param {number} payload.skill - Skill enum (1: Nghe, 2: Đọc, 3: Viết)
 * @param {number} payload.difficulty - Difficulty enum (1: Dễ, 2: Trung bình, 3: Khó)
 * @param {number} payload.examType - Exam type enum (1: TOPIK I, 2: TOPIK II, 3: Test đầu vào)
 * @param {number} payload.status - Status enum (0: Không hoạt động, 1: Hoạt động)
 * @returns {Promise<Object>} Updated question type object
 */
export async function updateQuestionType(id, payload) {
  try {
    const response = await apiClient.put(ENDPOINTS.QUESTION_TYPE.UPDATE(id), payload)
    return response.data
  } catch (error) {
    handleApiError(error, 'Không thể cập nhật loại câu hỏi')
  }
}

/**
 * Delete a question type
 * @param {string} id - Question type ID
 */
export async function deleteQuestionType(id) {
  try {
    const response = await apiClient.delete(ENDPOINTS.QUESTION_TYPE.DELETE(id))
    return response.data
  } catch (error) {
    // Backend đã trả lỗi theo các điều kiện (đã có message)
    handleApiError(error, 'Không thể xóa loại câu hỏi')
  }
}
