import { apiClient } from '../../../provider/api/client.js'
import { ENDPOINTS } from '../../../provider/api/endpoints'

/**
 * Lấy danh sách exams cho admin với phân trang và filter
 * @param {Object} params - Query parameters
 * @param {number} params.PageNumber - Số trang (mặc định: 1)
 * @param {number} params.PageSize - Số items mỗi trang (mặc định: 20)
 * @param {string} params.SearchTerm - Tìm kiếm theo từ khóa
 * @param {number} params.Status - Filter theo status (0=Draft, 1=Published, 2=Deleted)
 * @param {number} params.Type - Filter theo type (1=TopikI, 2=TopikII, 3=EntranceTest)
 * @returns {Promise<Object>} - { items: [], pageNumber, pageSize, totalCount, totalPages, hasNextPage, hasPreviousPage }
 */
export async function fetchExamsAdmin(params = {}) {
  const res = await apiClient.get(ENDPOINTS.EXAMS.ADMIN_LIST, { params })
  const data = res.data?.data || {}
  const items = data?.items || []
  const total = data?.totalCount || 0

  return {
    items,
    total,
    pageNumber: data?.pageNumber || params.PageNumber || 1,
    pageSize: data?.pageSize || params.PageSize || 20,
    totalPages: data?.totalPages || 1,
    hasNextPage: data?.hasNextPage || false,
    hasPreviousPage: data?.hasPreviousPage || false,
  }
}

/**
 * Lấy chi tiết exam theo ID (admin)
 * @param {string} examId - ID của exam
 * @returns {Promise<Object|null>} - Thông tin exam hoặc null
 */
export async function fetchExamDetailAdmin(examId) {
  const res = await apiClient.get(ENDPOINTS.EXAMS.ADMIN_DETAIL, { params: { examId } })
  return res.data?.data || null
}

/**
 * Lấy chi tiết exam theo ID
 * @param {string} examId - ID của exam
 * @returns {Promise<Object|null>} - Thông tin exam hoặc null
 */
export async function fetchExamById(examId) {
  const res = await apiClient.get(ENDPOINTS.EXAMS.GET_BY_ID(examId))
  return res.data?.data || null
}

/**
 * Tạo exam mới
 * @param {Object} payload - Dữ liệu exam
 * @param {string} payload.title - Tiêu đề đề thi
 * @param {number} payload.duration - Thời gian làm bài (phút)
 * @param {string} payload.examTemplateId - ID của exam template
 * @returns {Promise<string>} - ID của exam vừa tạo
 */
export async function createExam(payload) {
  const res = await apiClient.post(ENDPOINTS.EXAMS.CREATE, payload)
  // API trả về { data: "examId" } hoặc { data: { data: "examId" } }
  return res.data?.data || res.data || null
}

/**
 * Cập nhật thông tin exam (tiêu đề, thời lượng, template)
 * Backend định nghĩa body:
 *  {
 *    "title": "string",
 *    "duration": 0,
 *    "examTemplateId": "string"
 *  }
 *
 * @param {Object} payload
 * @param {string} payload.examId - ID đề thi cần cập nhật
 * @param {string} payload.title - Tiêu đề đề thi
 * @param {number} payload.duration - Thời gian làm bài (phút)
 * @param {string} payload.examTemplateId - ID exam template
 * @returns {Promise<any>} - Response từ API
 */
export async function updateExamInfo({ examId, title, duration, examTemplateId }) {
  if (!examId) {
    throw new Error('examId is required to update exam info')
  }

  const res = await apiClient.put(ENDPOINTS.EXAMS.UPDATE(examId), {
    title,
    duration,
    examTemplateId,
  })

  return res.data
}

/**
 * Xóa exam theo examId
 * @param {string} examId - ID của exam
 * @returns {Promise<any>} - response payload
 */
export async function deleteExam(examId) {
  const res = await apiClient.delete(ENDPOINTS.EXAMS.DELETE(examId))
  return res.data
}

/**
 * Cập nhật trạng thái exam
 * @param {string} examId - ID của exam
 * @param {number} status - 0: Draft, 1: Published, 2: Deleted
 * @returns {Promise<any>} - response payload
 */
export async function updateExamStatus(examId, status) {
  const res = await apiClient.put(ENDPOINTS.EXAMS.UPDATE_STATUS(examId), { status })
  return res.data
}

/**
 * Cập nhật 1 câu hỏi trong đề thi (đổi sang questionBankId mới theo questionNo)
 * @param {Object} payload
 * @param {string} payload.examId
 * @param {string} payload.questionBankId
 * @param {number} payload.questionNo
 * @returns {Promise<any>}
 */
export async function updateExamQuestion(payload) {
  const res = await apiClient.put(ENDPOINTS.EXAMS.UPDATE_EXAM_QUESTION, payload)
  return res.data
}

/**
 * Lấy danh sách câu hỏi theo templatePartId (dùng cho màn chỉnh sửa câu hỏi trong đề)
 * @param {Object} params
 * @param {string} params.templatePartId - ID của template part trong đề
 * @param {number} [params.PageNumber=1] - Số trang
 * @param {number} [params.PageSize=10] - Số item mỗi trang
 * @param {string} [params.Search] - Từ khóa tìm kiếm nội dung câu hỏi
 * @returns {Promise<Object>} - { items, pageNumber, pageSize, totalCount, totalPages, hasNextPage, hasPreviousPage }
 */
export async function fetchQuestionsByPart(params = {}) {
  const {
    templatePartId,
    PageNumber = 1,
    PageSize = 10,
    Search,
  } = params

  const res = await apiClient.get(ENDPOINTS.EXAMS.GET_QUESTIONS_BY_PART, {
    params: {
      templatePartId,
      pageNumber: PageNumber,
      pageSize: PageSize,
      search: Search,
    },
  })

  const data = res.data?.data || {}

  return {
    items: data.items || [],
    pageNumber: data.pageNumber || PageNumber,
    pageSize: data.pageSize || PageSize,
    totalCount: data.totalCount || 0,
    totalPages: data.totalPages || 1,
    hasNextPage: data.hasNextPage || false,
    hasPreviousPage: data.hasPreviousPage || false,
  }
}

/**
 * Regenerate (random lại) bộ câu hỏi của một phần trong đề thi
 * @param {Object} payload
 * @param {string} payload.examId
 * @param {string} payload.templatePartId
 * @returns {Promise<any>}
 */
export async function regenerateExamPart(payload) {
  const res = await apiClient.post(ENDPOINTS.EXAMS.REGENERATE_PART, payload)
  return res.data
}
