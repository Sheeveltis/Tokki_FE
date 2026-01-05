import { apiClient } from '../../../../../provider/api/client'
import { handleApiError } from '../../../api'

/**
 * Create a new question with answers
 * @param {Object} payload - Question data
 * @param {string} payload.content - Question content
 * @param {string} payload.type - Question type (e.g., 'multiple-choice', 'true-false', 'fill-blank')
 * @param {string} payload.difficulty - Difficulty level (easy, medium, hard)
 * @param {string} payload.skill - Skill type (listening, reading, writing, speaking)
 * @param {string} payload.examType - Exam type (e.g., 'TOPIK I', 'TOPIK II')
 * @param {Array<Object>} payload.answers - Array of answer objects
 * @param {string} payload.answers[].content - Answer content
 * @param {boolean} payload.answers[].isCorrect - Whether this answer is correct
 * @returns {Promise<Object>} Created question object
 */
export async function createQuestion(payload) {
  try {
    const response = await apiClient.post('/api/admin/questions', payload)
    return response.data
  } catch (error) {
    handleApiError(error, 'Không thể tạo câu hỏi mới')
  }
}

