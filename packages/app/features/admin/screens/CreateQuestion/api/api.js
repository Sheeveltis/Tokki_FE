import { apiClient } from '../../../../../provider/api/client'
import { handleApiError } from '../../../api'
import { ENDPOINTS } from '../../../../../provider/api/endpoints'

/**
 * Fetch all passages
 * @returns {Promise<Array>} Array of passage objects
 */
export async function fetchPassages() {
  try {
    const response = await apiClient.get(ENDPOINTS.PASSAGE.GET_ALL)
    return response.data?.data?.items || []
  } catch (error) {
    handleApiError(error, 'Không thể tải danh sách đoạn văn')
    return []
  }
}

/**
 * Fetch question type by ID
 * @param {string} questionTypeId
 * @returns {Promise<Object|null>} Question type object
 */
export async function fetchQuestionTypeById(questionTypeId) {
  try {
    const response = await apiClient.get(ENDPOINTS.QUESTION_TYPE.GET_BY_ID(questionTypeId))
    return response.data?.data || null
  } catch (error) {
    handleApiError(error, 'Không thể tải thông tin loại câu hỏi')
    return null
  }
}

/**
 * Create a new question with answers
 * @param {Object} payload - Question data
 * @param {string} payload.passageId - Passage ID (optional)
 * @param {string} payload.questionTypeId - Question Type ID
 * @param {string} payload.content - Question content
 * @param {string} payload.mediaUrl - Media URL (image or audio)
 * @param {string} payload.explanation - Explanation text
 * @param {Array<Object>} payload.options - Array of answer options
 * @param {string} payload.options[].keyOption - Option key (1, 2, 3, 4...)
 * @param {string} payload.options[].content - Option content
 * @param {string} payload.options[].imageUrl - Option image URL (optional)
 * @param {boolean} payload.options[].isCorrect - Whether this option is correct
 * @returns {Promise<Object>} Created question object
 */
export async function createQuestion(payload) {
  try {
    const response = await apiClient.post(ENDPOINTS.QUESTION_BANK.CREATE, payload)
    return response.data
  } catch (error) {
    handleApiError(error, 'Không thể tạo câu hỏi mới')
  }
}

/**
 * Activate question banks (set status to Active)
 * @param {Array<string>} questionBankIds
 */
export async function activateQuestionBanks(questionBankIds = []) {
  try {
    const res = await apiClient.put(ENDPOINTS.QUESTION_BANK.ACTIVATE, { questionBankIds })
    return res.data
  } catch (error) {
    handleApiError(error, 'Không thể kích hoạt câu hỏi')
  }
}

/**
 * Submit question banks for approval (status pending)
 * @param {Array<string>} questionBankIds
 */
export async function submitQuestionBanksForApproval(questionBankIds = []) {
  try {
    const res = await apiClient.put(ENDPOINTS.QUESTION_BANK.SUBMIT_TO_APPROVAL, { questionBankIds })
    return res.data
  } catch (error) {
    handleApiError(error, 'Không thể gửi duyệt câu hỏi')
  }
}

/**
 * Approve question banks (Admin)
 * @param {Array<string>} questionBankIds
 */
export async function approveQuestionBanks(questionBankIds = []) {
  try {
    const res = await apiClient.put(ENDPOINTS.QUESTION_BANK.APPROVE, { questionBankIds })
    return res.data
  } catch (error) {
    handleApiError(error, 'Không thể duyệt câu hỏi')
  }
}

/**
 * Reject question banks (Admin)
 * @param {Array<string>} questionBankIds
 * @param {string} rejectReason
 */
export async function rejectQuestionBanks(questionBankIds = [], rejectReason = '') {
  try {
    const res = await apiClient.put(ENDPOINTS.QUESTION_BANK.REJECT, { questionBankIds, rejectReason })
    return res.data
  } catch (error) {
    handleApiError(error, 'Không thể từ chối câu hỏi')
  }
}

