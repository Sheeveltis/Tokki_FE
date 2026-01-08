// Centralized Admin Panel business logic and mock API functions.
// Replace mock data with real API calls when backend is ready.

import {
  mockUsers,
  mockLessons,
  mockArticles,
  mockSystemLogs,
  mockPayments,
  mockFeedbacks,
  mockMembershipPackages,
  mockAIStatistics,
} from '../mockData.js'
import { apiErrors } from '../../../string.js'

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms))

/**
 * Helper function để xử lý lỗi API và throw error với message từ apiErrors
 * @param {Error|Response|number|string} error - Error object, Response object, status code, hoặc error key
 * @param {string} customMessage - Custom message nếu cần override
 */
function handleApiError(error, customMessage = null) {
  let message = customMessage

  // Nếu là Response object (fetch API)
  if (error?.status) {
    const status = error.status
    message = apiErrors[status] || apiErrors.unknown
  }
  // Nếu là status code number
  else if (typeof error === 'number') {
    message = apiErrors[error] || apiErrors.unknown
  }
  // Nếu là error key string
  else if (typeof error === 'string' && apiErrors[error]) {
    message = apiErrors[error]
  }
  // Nếu là Error object
  else if (error?.message) {
    // Kiểm tra xem message có phải là status code không
    const statusMatch = error.message.match(/\b([45]\d{2})\b/)
    if (statusMatch) {
      message = apiErrors[statusMatch[1]] || error.message
    } else {
      message = error.message
    }
  }
  // Network errors
  else if (error?.name === 'TypeError' && error.message.includes('fetch')) {
    message = apiErrors.network
  }
  // Timeout
  else if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
    message = apiErrors.timeout
  }
  // Default
  else {
    message = customMessage || apiErrors.unknown
  }

  const apiError = new Error(message)
  apiError.status = typeof error === 'number' ? error : error?.status
  apiError.originalError = error
  throw apiError
}

/**
 * Wrapper cho API calls với error handling
 */
async function apiCall(fn, errorMessage = null) {
  try {
    return await fn()
  } catch (error) {
    handleApiError(error, errorMessage)
  }
}

export async function fetchUsers() {
  try {
    await delay()
    // Simulate error for testing (uncomment to test)
    // if (Math.random() > 0.9) throw { status: 500 }
    return mockUsers
  } catch (error) {
    handleApiError(error, 'Không thể tải danh sách người dùng')
  }
}

export async function fetchLessons() {
  try {
    await delay()
    return mockLessons
  } catch (error) {
    handleApiError(error, 'Không thể tải danh sách bài học')
  }
}

export async function fetchArticles() {
  try {
    await delay()
    return mockArticles
  } catch (error) {
    handleApiError(error, 'Không thể tải danh sách bài viết')
  }
}

export async function fetchSystemLogs() {
  try {
    await delay()
    return mockSystemLogs
  } catch (error) {
    handleApiError(error, 'Không thể tải system logs')
  }
}

export async function updateUser(payload) {
  try {
    await delay()
    // mock: return merged
    return { ...payload }
  } catch (error) {
    handleApiError(error, 'Không thể cập nhật thông tin người dùng')
  }
}

export async function updateLesson(payload) {
  try {
    await delay()
    return { ...payload }
  } catch (error) {
    handleApiError(error, 'Không thể cập nhật bài học')
  }
}

export async function updateArticle(payload) {
  try {
    await delay()
    return { ...payload }
  } catch (error) {
    handleApiError(error, 'Không thể cập nhật bài viết')
  }
}

export async function updateSettings(payload) {
  try {
    await delay()
    return { ...payload }
  } catch (error) {
    handleApiError(error, 'Không thể cập nhật cài đặt')
  }
}

// Create APIs
export async function createUser(payload) {
  try {
    await delay()
    // Validate required fields
    if (!payload.name || !payload.email) {
      throw { status: 400, message: apiErrors.invalidData }
    }
    return {
      id: `u${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
    }
  } catch (error) {
    handleApiError(error, 'Không thể tạo người dùng mới')
  }
}

export async function createLesson(payload) {
  try {
    await delay()
    if (!payload.title) {
      throw { status: 400, message: apiErrors.invalidData }
    }
    return {
      id: `l${Date.now()}`,
      ...payload,
      updatedAt: new Date().toISOString().split('T')[0],
    }
  } catch (error) {
    handleApiError(error, 'Không thể tạo bài học mới')
  }
}

export async function createVocabulary(payload) {
  try {
    await delay()
    if (!payload.word) {
      throw { status: 400, message: apiErrors.invalidData }
    }
    return {
      id: `v${Date.now()}`,
      ...payload,
    }
  } catch (error) {
    handleApiError(error, 'Không thể tạo từ vựng mới')
  }
}

export async function createArticle(payload) {
  try {
    await delay()
    if (!payload.title) {
      throw { status: 400, message: apiErrors.invalidData }
    }
    return {
      id: `a${Date.now()}`,
      ...payload,
    }
  } catch (error) {
    handleApiError(error, 'Không thể tạo bài viết mới')
  }
}

// Payment Management APIs
export async function fetchPayments() {
  try {
    await delay()
    return mockPayments
  } catch (error) {
    handleApiError(error, 'Không thể tải danh sách thanh toán')
  }
}

export async function approvePayment(id) {
  try {
    await delay()
    if (!id) throw { status: 400 }
    return {
      id,
      status: 'completed',
      completedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    }
  } catch (error) {
    handleApiError(error, 'Không thể duyệt thanh toán')
  }
}

export async function rejectPayment(id) {
  try {
    await delay()
    if (!id) throw { status: 400 }
    return {
      id,
      status: 'failed',
    }
  } catch (error) {
    handleApiError(error, 'Không thể từ chối thanh toán')
  }
}

// Feedback Management APIs
export async function fetchFeedbacks() {
  try {
    await delay()
    return mockFeedbacks
  } catch (error) {
    handleApiError(error, 'Không thể tải danh sách feedback')
  }
}

export async function updateFeedbackStatus(feedbackId, newStatus) {
  try {
    await delay()
    if (!feedbackId || !newStatus) throw { status: 400 }
    return {
      id: feedbackId,
      status: newStatus,
    }
  } catch (error) {
    handleApiError(error, 'Không thể cập nhật trạng thái feedback')
  }
}

// Membership Package Management APIs
export async function fetchPackages() {
  try {
    await delay()
    return mockMembershipPackages
  } catch (error) {
    handleApiError(error, 'Không thể tải danh sách gói thành viên')
  }
}

export async function createPackage(payload) {
  try {
    await delay()
    if (!payload.name || !payload.price) {
      throw { status: 400, message: apiErrors.invalidData }
    }
    return {
      id: `p${Date.now()}`,
      ...payload,
      status: 'active',
    }
  } catch (error) {
    handleApiError(error, 'Không thể tạo gói thành viên mới')
  }
}

export async function updatePackage(id, payload) {
  try {
    await delay()
    if (!id) throw { status: 400 }
    return {
      id,
      ...payload,
    }
  } catch (error) {
    handleApiError(error, 'Không thể cập nhật gói thành viên')
  }
}

export async function deletePackage(id) {
  try {
    await delay()
    if (!id) throw { status: 400 }
    return { id }
  } catch (error) {
    handleApiError(error, 'Không thể xóa gói thành viên')
  }
}

// Auto Email APIs
export async function sendEmail(payload) {
  try {
    await delay()
    if (!payload.to || !payload.subject) {
      throw { status: 400, message: apiErrors.invalidData }
    }
    return {
      success: true,
      message: 'Email đã được gửi thành công',
      ...payload,
    }
  } catch (error) {
    handleApiError(error, 'Không thể gửi email')
  }
}

// AI Statistics APIs
export async function fetchAIStatistics() {
  try {
    await delay()
    return mockAIStatistics
  } catch (error) {
    handleApiError(error, 'Không thể tải thống kê A.I')
  }
}

// Exam Template Management APIs
import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

export async function fetchExamTemplates(params = {}) {
  try {
    const {
      pageNumber = 1,
      pageSize = 10,
      searchTerm = '',
      status = 1, // Mặc định là Published (1)
      type = null, // null = lấy tất cả
    } = params

    const queryParams = {
      PageNumber: pageNumber,
      PageSize: pageSize,
    }

    if (searchTerm) {
      queryParams.SearchTerm = searchTerm
    }

    if (status !== null && status !== undefined) {
      queryParams.Status = status
    }

    if (type !== null && type !== undefined) {
      queryParams.Type = type
    }

    const res = await apiClient.get(ENDPOINTS.EXAM_TEMPLATES.ADMIN_LIST, {
      params: queryParams,
    })

    const payload = res?.data
    if (!payload?.isSuccess) {
      const message =
        payload?.message ||
        (Array.isArray(payload?.errors) && payload.errors[0]?.description) ||
        'Không thể tải danh sách mẫu đề'
      throw new Error(message)
    }

    const pagingData = payload?.data
    const items = Array.isArray(pagingData?.items) ? pagingData.items : []

    // Map data từ API response về format component đang sử dụng
    const mappedItems = items.map((item) => ({
      ExamTemplateId: item.examTemplateId,
      id: item.examTemplateId,
      name: item.name,
      Name: item.name,
      description: item.description,
      Description: item.description,
      examType: item.type === 1 ? 'TOPIK I' : item.type === 2 ? 'TOPIK II' : item.type === 3 ? 'Test đầu vào' : '',
      ExamType: item.type === 1 ? 'TOPIK I' : item.type === 2 ? 'TOPIK II' : item.type === 3 ? 'Test đầu vào' : '',
      status: item.status,
      type: item.type,
      totalParts: item.totalParts || 0,
      totalQuestions: item.totalQuestions || 0,
      createdAt: item.createdAt,
      updatedAt: item.createdAt, // API chỉ trả về createdAt
      isActive: item.status === 1, // Published = active
    }))

    return {
      items: mappedItems,
      pageNumber: pagingData?.pageNumber || pageNumber,
      pageSize: pagingData?.pageSize || pageSize,
      totalCount: pagingData?.totalCount || 0,
      totalPages: pagingData?.totalPages || 1,
      hasNextPage: pagingData?.hasNextPage || false,
      hasPreviousPage: pagingData?.hasPreviousPage || false,
    }
  } catch (error) {
    handleApiError(error, 'Không thể tải danh sách mẫu đề')
  }
}

export async function fetchExamTemplate(examTemplateId) {
  try {
    if (!examTemplateId) throw { status: 400 }

    const res = await apiClient.get(ENDPOINTS.EXAM_TEMPLATES.GET_BY_ID(examTemplateId))

    const payload = res?.data
    if (!payload?.isSuccess) {
      const message =
        payload?.message ||
        (Array.isArray(payload?.errors) && payload.errors[0]?.description) ||
        'Không thể tải thông tin mẫu đề'
      throw new Error(message)
    }

    const apiData = payload?.data
    if (!apiData) {
      throw new Error('Không tìm thấy dữ liệu mẫu đề')
    }

    // Map type number sang string
    const examTypeMap = {
      1: 'TOPIK I',
      2: 'TOPIK II',
      3: 'Test đầu vào',
    }

    // Map parts từ API format sang format component đang sử dụng
    const transformParts = (parts) => {
      if (!parts || !Array.isArray(parts)) return []
      
      // Group parts theo skill
      const groupedBySkill = {}
      parts.forEach((part) => {
        const skill = part.skill
        if (!groupedBySkill[skill]) {
          groupedBySkill[skill] = []
        }
        // Map từ API format sang component format
        groupedBySkill[skill].push({
          Skill: part.skill,
          QuestionFrom: part.questionFrom,
          QuestionTo: part.questionTo,
          PartTitle: part.partTitle,
          Instruction: part.instruction,
          Mark: part.mark,
          ExampleUrl: part.exampleUrl,
          QuestionTypeId: part.questionTypeId || '',
          TemplatePartId: part.templatePartId, // Giữ lại để có thể update/delete
        })
      })
      
      // Convert thành mảng parts với QuestionGroups
      return Object.keys(groupedBySkill).map((skill) => ({
        Skill: parseInt(skill),
        QuestionGroups: groupedBySkill[skill],
      }))
    }

    // Map dữ liệu từ API response về format component đang sử dụng
    return {
      ExamTemplateId: apiData.examTemplateId,
      id: apiData.examTemplateId,
      Name: apiData.name,
      name: apiData.name,
      Description: apiData.description,
      description: apiData.description,
      ExamType: examTypeMap[apiData.type] || `Type ${apiData.type}`,
      examType: examTypeMap[apiData.type] || `Type ${apiData.type}`,
      type: apiData.type,
      status: apiData.status ?? apiData.Status ?? 0, // Mặc định là 0 (Draft) nếu không có
      Status: apiData.status ?? apiData.Status ?? 0, // Thêm PascalCase để tương thích
      IsActive: (apiData.status ?? apiData.Status ?? 0) === 1, // Published = active
      isActive: (apiData.status ?? apiData.Status ?? 0) === 1,
      CreatedAt: apiData.createdAt,
      createdAt: apiData.createdAt,
      UpdatedAt: apiData.createdAt, // API chỉ trả về createdAt
      updatedAt: apiData.createdAt,
      totalParts: apiData.totalParts || 0,
      totalQuestions: apiData.totalQuestions || 0,
      Parts: transformParts(apiData.parts), // Đã được transform thành cấu trúc form
      parts: apiData.parts, // Giữ nguyên để có thể sử dụng nếu cần
    }
  } catch (error) {
    handleApiError(error, 'Không thể tải thông tin mẫu đề')
  }
}

export async function updateExamTemplate(examTemplateId, payload) {
  try {
    if (!examTemplateId || !payload) throw { status: 400 }

    // Map ExamType string sang type number
    const examTypeToNumber = {
      'TOPIK I': 1,
      'TOPIK II': 2,
      'Test đầu vào': 3,
    }

    // Format payload từ component format sang API format
    const apiPayload = {
      name: payload.Name || payload.name,
      description: payload.Description || payload.description || '',
      type: examTypeToNumber[payload.ExamType || payload.examType] || payload.type,
    }

    // Đảm bảo các field bắt buộc có giá trị
    if (!apiPayload.name) {
      throw { status: 400, message: 'Tên mẫu đề là bắt buộc' }
    }

    const res = await apiClient.put(ENDPOINTS.EXAM_TEMPLATES.UPDATE(examTemplateId), apiPayload)

    const responseData = res?.data
    if (!responseData?.isSuccess) {
      const message =
        responseData?.message ||
        (Array.isArray(responseData?.errors) && responseData.errors[0]?.description) ||
        'Không thể cập nhật mẫu đề'
      throw new Error(message)
    }

    const updatedData = responseData?.data
    if (!updatedData) {
      return { examTemplateId, ...apiPayload }
    }

    // Map lại về format component đang sử dụng
    const examTypeMap = {
      1: 'TOPIK I',
      2: 'TOPIK II',
      3: 'Test đầu vào',
    }

    return {
      ExamTemplateId: updatedData.examTemplateId || examTemplateId,
      id: updatedData.examTemplateId || examTemplateId,
      Name: updatedData.name,
      name: updatedData.name,
      Description: updatedData.description,
      description: updatedData.description,
      ExamType: examTypeMap[updatedData.type] || `Type ${updatedData.type}`,
      examType: examTypeMap[updatedData.type] || `Type ${updatedData.type}`,
      type: updatedData.type,
      status: updatedData.status,
      IsActive: updatedData.status === 1,
      isActive: updatedData.status === 1,
      CreatedAt: updatedData.createdAt,
      createdAt: updatedData.createdAt,
      UpdatedAt: updatedData.createdAt,
      updatedAt: updatedData.createdAt,
    }
  } catch (error) {
    handleApiError(error, 'Không thể cập nhật mẫu đề')
  }
}

export async function deleteExamTemplate(examTemplateId) {
  try {
    if (!examTemplateId) throw { status: 400 }

    const res = await apiClient.delete(ENDPOINTS.EXAM_TEMPLATES.DELETE(examTemplateId))

    const responseData = res?.data
    if (!responseData?.isSuccess) {
      const message =
        responseData?.message ||
        (Array.isArray(responseData?.errors) && responseData.errors[0]?.description) ||
        'Không thể xóa mẫu đề'
      throw new Error(message)
    }

    return { ExamTemplateId: examTemplateId }
  } catch (error) {
    handleApiError(error, 'Không thể xóa mẫu đề')
  }
}

// Question Type APIs
export async function fetchQuestionTypes(params = {}) {
  try {
    const { skill = null, examType = null } = params

    const queryParams = {}
    if (skill !== null && skill !== undefined) {
      queryParams.skill = skill
    }
    if (examType !== null && examType !== undefined) {
      queryParams.examType = examType
    }

    const res = await apiClient.get(ENDPOINTS.QUESTION_TYPE.GET_ALL, {
      params: queryParams,
    })

    const payload = res?.data
    if (!payload?.isSuccess) {
      const message =
        payload?.message ||
        (Array.isArray(payload?.errors) && payload.errors[0]?.description) ||
        'Không thể tải danh sách dạng câu hỏi'
      throw new Error(message)
    }

    const items = Array.isArray(payload?.data) ? payload.data : []

    // Map dữ liệu từ API response về format component đang sử dụng
    return items.map((item) => ({
      QuestionTypeId: item.questionTypeId,
      questionTypeId: item.questionTypeId,
      Code: item.code,
      code: item.code,
      Name: item.name,
      name: item.name,
      Description: item.description,
      description: item.description,
      Skill: item.skill,
      skill: item.skill,
      Difficulty: item.difficulty,
      difficulty: item.difficulty,
      ExamType: item.examType,
      examType: item.examType,
      IsActive: item.isActive,
      isActive: item.isActive,
    }))
  } catch (error) {
    handleApiError(error, 'Không thể tải danh sách dạng câu hỏi')
  }
}

// Create Exam Template API
export async function createExamTemplate(payload) {
  try {
    if (!payload || !payload.name) {
      throw { status: 400, message: 'Tên mẫu đề là bắt buộc' }
    }

    // Map ExamType string sang number
    const examTypeToNumber = {
      'TOPIK I': 1,
      'TOPIK II': 2,
      'Test đầu vào': 3,
    }

    // Format payload từ component format sang API format
    const apiPayload = {
      name: payload.name,
      description: payload.description || '',
      type: examTypeToNumber[payload.examType] || payload.type,
    }

    // Đảm bảo type có giá trị
    if (!apiPayload.type) {
      throw { status: 400, message: 'Loại đề là bắt buộc' }
    }

    const res = await apiClient.post(ENDPOINTS.EXAM_TEMPLATES.CREATE, apiPayload)

    const responseData = res?.data
    if (!responseData?.isSuccess) {
      // Xử lý error từ API
      const errorMessage = 
        responseData?.message ||
        (Array.isArray(responseData?.errors) && responseData.errors[0]?.description) ||
        'Không thể tạo mẫu đề'
      
      // Tạo error object với message
      const error = new Error(errorMessage)
      error.status = responseData?.statusCode || 400
      error.errors = responseData?.errors || []
      throw error
    }

    // API trả về examTemplateId trong data
    const examTemplateId = responseData?.data

    return {
      examTemplateId: examTemplateId,
      ExamTemplateId: examTemplateId,
    }
  } catch (error) {
    // Nếu error đã có message thì throw luôn
    if (error.message) {
      throw error
    }
    handleApiError(error, 'Không thể tạo mẫu đề')
  }
}

// Add Exam Template Parts API (chỉ add parts mới, không update parts cũ)
export async function updateExamTemplateParts(examTemplateId, parts) {
  try {
    if (!examTemplateId) {
      throw { status: 400, message: 'Exam Template ID là bắt buộc' }
    }

    if (!Array.isArray(parts)) {
      throw { status: 400, message: 'Parts phải là một mảng' }
    }

    // Format payload từ component format sang API format
    // Chỉ gửi các parts mới (không có TemplatePartId)
    const apiParts = parts.map((part) => ({
      skill: part.Skill || part.skill,
      questionFrom: part.QuestionFrom || part.questionFrom,
      questionTo: part.QuestionTo || part.questionTo,
      partTitle: part.PartTitle || part.partTitle || '',
      instruction: part.Instruction || part.instruction || '',
      mark: part.Mark || part.mark || 0,
      questionTypeId: part.QuestionTypeId || part.questionTypeId || '',
      exampleUrl: part.ExampleUrl || part.exampleUrl || null,
    }))

    // Validate required fields
    for (const part of apiParts) {
      if (part.skill === undefined || part.skill === null) {
        throw { status: 400, message: 'Skill là bắt buộc cho mỗi part' }
      }
      if (part.questionFrom === undefined || part.questionFrom === null) {
        throw { status: 400, message: 'QuestionFrom là bắt buộc cho mỗi part' }
      }
      if (part.questionTo === undefined || part.questionTo === null) {
        throw { status: 400, message: 'QuestionTo là bắt buộc cho mỗi part' }
      }
      if (!part.questionTypeId) {
        throw { status: 400, message: 'QuestionTypeId là bắt buộc cho mỗi part' }
      }
    }

    const apiPayload = {
      examTemplateId: examTemplateId,
      parts: apiParts,
    }

    const res = await apiClient.post(ENDPOINTS.EXAM_TEMPLATES.TEMPLATE_PARTS, apiPayload)

    const responseData = res?.data
    if (!responseData?.isSuccess) {
      const message =
        responseData?.message ||
        (Array.isArray(responseData?.errors) && responseData.errors[0]?.description) ||
        'Không thể thêm các phần của đề thi'
      throw new Error(message)
    }

    return responseData?.data || true
  } catch (error) {
    // Nếu error đã có message thì throw luôn
    if (error.message) {
      throw error
    }
    handleApiError(error, 'Không thể thêm các phần của đề thi')
  }
}

// Upload Template Part Image to Cloudinary
export async function uploadTemplatePartImageToCloudinary(file) {
  try {
    if (!file) {
      throw new Error('File ảnh là bắt buộc')
    }

    // Tạo FormData để gửi file
    const formData = new FormData()
    formData.append('file', file)

    const res = await apiClient.post(ENDPOINTS.CLOUDINARY.UPLOAD_TEMPLATE_PART_IMAGE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    const payload = res?.data
    if (!payload?.isSuccess) {
      const message =
        payload?.message ||
        (Array.isArray(payload?.errors) && payload.errors[0]?.description) ||
        'Không thể upload ảnh'
      throw new Error(message)
    }

    // Trả về URL của ảnh
    return payload?.data || null
  } catch (error) {
    console.error('Error uploading template part image to Cloudinary:', error)
    handleApiError(error, 'Không thể upload ảnh lên Cloudinary')
    throw error
  }
}

// Export handleApiError để các screen có thể sử dụng
export { handleApiError }
