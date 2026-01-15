import { apiClient, getCurrentUserId, getCurrentUserRole } from '../../../../../provider/api/client'
import { ENDPOINTS } from '../../../../../provider/api/endpoints'

// Lấy danh sách câu hỏi theo questionTypeId (hỗ trợ filter status)
// Status: 0 (Draft), 1 (Active), 2 (Deleted), 3 (Pending Approval), 4 (Rejected)
// Nếu là Staff:
//   - Status = 1 (Hoạt động): Xem tất cả (không filter theo userId)
//   - Status khác 1: Chỉ lấy câu hỏi do chính họ tạo (filter theo userId)
export async function fetchQuestionBanksByQuestionType(questionTypeId, status) {
  const params = {}
  if (status !== undefined) {
    params.status = status
  }
  const role = getCurrentUserRole()
  if (role === 'Staff') {
    // Nếu status = 1 (Hoạt động), không filter theo userId (xem tất cả)
    // Nếu status khác 1, chỉ lấy câu hỏi do chính họ tạo
    if (status !== 1) {
      const userId = getCurrentUserId()
      if (userId) {
        params.userId = userId
      }
    }
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

// Lấy danh sách câu hỏi có phân trang
// Return: { items: [], total: number }
// Nếu là Staff:
//   - Status = 1 (Hoạt động): Xem tất cả (không filter theo userId)
//   - Status khác 1: Chỉ lấy câu hỏi do chính họ tạo (filter theo userId)
export async function fetchQuestionBanksPaged(params = {}) {
  const role = getCurrentUserRole()
  if (role === 'Staff') {
    // Nếu status = 1 (Hoạt động), không filter theo userId (xem tất cả)
    // Nếu status khác 1, chỉ lấy câu hỏi do chính họ tạo
    const status = params.Status !== undefined ? params.Status : params.status
    if (status !== 1) {
      const userId = getCurrentUserId()
      if (userId) {
        params.userId = userId
      }
    }
  }
  const res = await apiClient.get(ENDPOINTS.QUESTION_BANK.GET_ALL, { params })
  const data = res.data?.data
  const items = data?.items || (Array.isArray(data) ? data : []) || []
  const total =
    data?.total ??
    data?.totalCount ??
    data?.totalItems ??
    data?.totalRecords ??
    (Array.isArray(items) ? items.length : 0)

  return { items, total }
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

