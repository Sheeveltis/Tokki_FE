import { apiClient } from '../../../../../provider/api/client'
import { handleApiError } from '../../../api'

/**
 * Create a new question type
 * @param {Object} payload - QuestionType data
 * @param {string} payload.code - QuestionType code (e.g., 'REA_TOP', 'LIS_LOC')
 * @param {string} payload.name - QuestionType name (e.g., 'Reading - Identify Topic')
 * @param {string} payload.description - QuestionType description
 * @param {number} payload.skill - Skill enum (1=Nghe, 2=Đọc, 3=Viết)
 * @param {number} payload.isActive - Active status (0 or 1)
 * @returns {Promise<Object>} Created question type object
 */
export async function createQuestionType(payload) {
  try {
    const response = await apiClient.post('/api/admin/question-types', payload)
    return response.data
  } catch (error) {
    handleApiError(error, 'Không thể tạo loại câu hỏi mới')
  }
}

