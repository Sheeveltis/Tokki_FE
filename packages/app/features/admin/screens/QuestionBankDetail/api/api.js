import { apiClient } from '../../../../../provider/api/client'
import { handleApiError } from '../../../../api'

/**
 * Fetch question detail by ID
 * @param {string} questionId - Question ID
 * @returns {Promise<Object>} Question object
 */
export async function fetchQuestion(questionId) {
  try {
    const response = await apiClient.get(`/api/admin/questions/${questionId}`)
    return response.data
  } catch (error) {
    handleApiError(error, 'Không thể tải thông tin câu hỏi')
  }
}

/**
 * Update question
 * @param {string} questionId - Question ID
 * @param {Object} payload - Question data
 * @returns {Promise<Object>} Updated question object
 */
export async function updateQuestion(questionId, payload) {
  try {
    const response = await apiClient.put(`/api/admin/questions/${questionId}`, payload)
    return response.data
  } catch (error) {
    handleApiError(error, 'Không thể cập nhật câu hỏi')
  }
}

/**
 * Delete question
 * @param {string} questionId - Question ID
 * @returns {Promise<void>}
 */
export async function deleteQuestion(questionId) {
  try {
    await apiClient.delete(`/api/admin/questions/${questionId}`)
  } catch (error) {
    handleApiError(error, 'Không thể xóa câu hỏi')
  }
}

