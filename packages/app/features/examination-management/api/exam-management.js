import { apiClient } from '../../../provider/api/client.js'
import { ENDPOINTS } from '../../../provider/api/endpoints'

/**
 * Lấy danh sách exams với thống kê cho admin với phân trang và filter
 * @param {Object} params - Query parameters
 * @param {number} params.PageNumber - Số trang (mặc định: 1)
 * @param {number} params.PageSize - Số items mỗi trang (mặc định: 20)
 * @param {string} params.SearchTerm - Tìm kiếm theo từ khóa
 * @param {number} params.Status - Filter theo status
 * @param {number} params.Type - Filter theo type
 * @param {number} params.CreatorFilter - Filter theo người tạo (0=All, 1=AI, 2=Human)
 * @param {number} params.SortBy - Sắp xếp theo (0=CreatedAt, 1=Participants, 2=PdfDownload, 3=AverageScore)
 * @param {boolean} params.IsDescending - Sắp xếp giảm dần (mặc định: true)
 * @returns {Promise<Object>} - { items: [], pageNumber, pageSize, totalCount, totalPages, hasNextPage, hasPreviousPage }
 */
export async function fetchExamsAdmin(params = {}) {
  const {
    PageNumber = 1,
    PageSize = 20,
    SearchTerm,
    Status,
    Type,
    CreatorFilter,
    SortBy = 0,
    IsDescending = true
  } = params

  const res = await apiClient.get(ENDPOINTS.EXAMS.ADMIN_STATS_LIST, {
    params: {
      PageNumber,
      PageSize,
      SearchTerm,
      Status,
      Type,
      CreatorFilter,
      SortBy,
      IsDescending
    }
  })
  
  const data = res.data?.data || {}
  const items = data?.items || []
  const total = data?.totalCount || 0

  return {
    items,
    total,
    pageNumber: data?.pageNumber || PageNumber,
    pageSize: data?.pageSize || PageSize,
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
 * Lấy dữ liệu thống kê của kì thi (admin)
 * @param {string} examId - ID của exam
 * @returns {Promise<Object|null>} - Thống kê exam hoặc null
 */
export async function fetchExamStatsAdmin(examId) {
  const res = await apiClient.get(ENDPOINTS.EXAMS.ADMIN_STATS(examId))
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
 * @param {Object} payload.skillDurations - Thời gian làm bài theo kỹ năng { "Listening": 60, "Reading": 60 }
 * @param {string} payload.examTemplateId - ID của exam template
 * @returns {Promise<string>} - ID của exam vừa tạo
 */
export async function createExam(payload) {
  const res = await apiClient.post(ENDPOINTS.EXAMS.CREATE, payload)
  return res.data?.data || res.data || null
}

/**
 * Cập nhật thông tin exam (tiêu đề, thời lượng, template)
 *
 * @param {Object} payload
 * @param {string} payload.examId - ID đề thi cần cập nhật
 * @param {string} payload.title - Tiêu đề đề thi
 * @param {Object} payload.skillDurations - Thời gian làm bài theo kỹ năng
 * @param {string} payload.examTemplateId - ID exam template
 * @returns {Promise<any>} - Response từ API
 */
export async function updateExamInfo({ examId, title, skillDurations, examTemplateId }) {
  if (!examId) {
    throw new Error('examId is required to update exam info')
  }

  const res = await apiClient.put(ENDPOINTS.EXAMS.UPDATE(examId), {
    title,
    skillDurations,
    examTemplateId,
  })

  return res.data
}

/**
 * Xuất đề thi ra PDF
 * @param {string} examId - ID của exam
 * @returns {Promise<Blob>} - File PDF content
 */
export async function exportExamPdf(examId) {
  const res = await apiClient.get(ENDPOINTS.EXAMS.EXPORT_PDF(examId), {
    responseType: 'blob'
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
    questionTypeCode: data.questionTypeCode,
    questionTypeName: data.questionTypeName,
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

/**
 * Lấy danh sách người tham gia thi
 * @param {Object} params
 * @param {string} params.examId
 * @param {number} [params.PageNumber=1]
 * @param {number} [params.PageSize=10]
 * @param {number} [params.SortBy=0] - 0: SubmitTime, 1: Score
 * @param {boolean} [params.IsDescending=true]
 * @returns {Promise<Object>}
 */
export async function fetchExamParticipantsAdmin(params = {}) {
  const { examId, PageNumber = 1, PageSize = 10, SortBy = 0, IsDescending = true } = params
  
  const res = await apiClient.get(ENDPOINTS.EXAMS.ADMIN_PARTICIPANTS(examId), {
    params: {
      pageNumber: PageNumber,
      pageSize: PageSize,
      sortBy: SortBy,
      isDescending: IsDescending
    }
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
