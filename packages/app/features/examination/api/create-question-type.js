import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'
import { handleApiError } from '../../admin/api'

/**
 * Tạo mới bộ câu hỏi (QuestionType)
 * @param {Object} payload
 * @param {string} payload.name
 * @param {string} payload.code
 * @param {string} payload.description
 * @param {number} payload.skill      // 1=Nghe, 2=Đọc, 3=Viết
 * @param {number} payload.difficulty // 1=Dễ, 2=Trung bình, 3=Khó
 * @param {number} payload.examType   // 1=TOPIK I, 2=TOPIK II, 3=Test đầu vào
 * @param {number} payload.isActive   // 0/1
 * @returns {Promise<Object>}
 */
export async function createQuestionType(payload) {
  try {
    const response = await apiClient.post(ENDPOINTS.QUESTION_TYPE.CREATE, payload)
    return response.data
  } catch (error) {
    handleApiError(error, 'Không thể tạo bộ câu hỏi mới')
    throw error
  }
}
