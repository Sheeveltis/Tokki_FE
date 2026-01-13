import { apiClient } from '../../../../../provider/api/client'
import { ENDPOINTS } from '../../../../../provider/api/endpoints'

// Lấy danh sách câu hỏi theo questionTypeId (hỗ trợ filter status)
// Status: 0 (Draft), 1 (Active), 2 (Deleted)
export async function fetchQuestionBanksByQuestionType(questionTypeId, status) {
  const params = {}
  if (status !== undefined) {
    params.status = status
  }
  const res = await apiClient.get(ENDPOINTS.QUESTION_BANK.GET_BY_QUESTION_TYPE(questionTypeId), { params })
  return res.data?.data || []
}

export async function fetchPassageById(id) {
  const res = await apiClient.get(ENDPOINTS.PASSAGE.GET_BY_ID(id))
  return res.data?.data || null
}

export async function fetchPassages(params = {}) {
  const res = await apiClient.get(ENDPOINTS.PASSAGE.GET_ALL, { params })
  const data = res.data?.data
  // Handle both paginated ({ items: [] }) and non-paginated ([]) responses
  return Array.isArray(data) ? data : data?.items || []
}

export async function fetchQuestionTypes(params = {}) {
  const res = await apiClient.get(ENDPOINTS.QUESTION_TYPE.GET_ALL, { params })
  return res.data?.data || []
}

// Lấy danh sách câu hỏi trong ngân hàng câu hỏi
// Query hỗ trợ: SearchTerm, Skill, DifficultyLevel, QuestionTypeId, PassageId, Status, PageNumber, PageSize
export async function fetchQuestionBanks(params = {}) {
  const res = await apiClient.get(ENDPOINTS.QUESTION_BANK.GET_ALL, { params })
  return res.data?.data?.items || res.data?.data || []
}

export async function updateQuestionBank(payload) {
  const res = await apiClient.put(ENDPOINTS.QUESTION_BANK.UPDATE, payload)
  return res.data
}

export async function updateQuestionBankOption(questionBankId, optionId, payload) {
  const res = await apiClient.put(
    ENDPOINTS.QUESTION_BANK_OPTION.UPDATE(questionBankId, optionId),
    payload,
  )
  return res.data
}

export async function createQuestionBankOption(questionBankId, payload) {
  const res = await apiClient.post(ENDPOINTS.QUESTION_BANK_OPTION.CREATE(questionBankId), payload)
  return res.data
}

export async function deleteQuestionBankOption(questionBankId, optionId) {
  const res = await apiClient.delete(ENDPOINTS.QUESTION_BANK_OPTION.DELETE(questionBankId, optionId))
  return res.data
}

export async function deleteQuestionBank(questionBankId) {
  const res = await apiClient.delete(ENDPOINTS.QUESTION_BANK.DELETE(questionBankId))
  return res.data
}

export async function activateQuestionBanks(questionBankIds = []) {
  const res = await apiClient.put(ENDPOINTS.QUESTION_BANK.ACTIVATE, { questionBankIds })
  return res.data
}

