import { apiErrors } from '../../../string.js'
import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'
import { handleApiError } from '../../back-office/api/admin-index.js'
import { mockVocabularies, mockFlashcardTopics } from '../mockData'

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms))

/**
 * Lấy danh sách từ vựng với phân trang, lọc status và tìm kiếm
 * @param {Object} params - Tham số tìm kiếm
 * @param {number} params.pageNumber - Số trang (mặc định: 1)
 * @param {number} params.pageSize - Số item mỗi trang (mặc định: 20)
 * @param {number} params.status - Lọc theo status (1: Active, 0: Inactive, 2: Deleted)
 * @param {string} params.vocabId - Tìm kiếm theo vocabularyId
 * @param {string} params.searchText - Tìm kiếm theo text (tiếng Hàn)
 * @returns {Promise<Object>} - { items, pageNumber, pageSize, totalCount, totalPages, hasNextPage, hasPreviousPage }
 */
export async function fetchVocabularies(params = {}) {
  try {
    const {
      pageNumber = 1,
      pageSize = 20,
      status,
      vocabId,
      searchText,
    } = params

    const queryParams = {
      pageNumber,
      pageSize,
    }

    // Thêm status nếu có và không phải "all"
    // Khi status là "all" thì không cần gửi attribute status trong query string
    if (status !== undefined && status !== null && status !== 'all') {
      queryParams.status = status
    }

    // Thêm vocabId nếu có
    if (vocabId) {
      queryParams.vocabId = vocabId
    }

    // Thêm searchText nếu có
    if (searchText) {
      queryParams.searchText = searchText
    }

    const res = await apiClient.get(ENDPOINTS.VOCABULARY.ADMIN_GET_ALL, {
      params: queryParams,
    })

    const payload = res?.data
    if (!payload?.isSuccess) {
      const message =
        payload?.message ||
        (Array.isArray(payload?.errors) && payload.errors[0]?.description) ||
        'Không thể tải danh sách từ vựng'
      throw new Error(message)
    }

    const pagingData = payload?.data
    const items = Array.isArray(pagingData?.items) ? pagingData.items : []

    // Map data để tương thích với component
    const mappedItems = Array.isArray(items)
      ? items.map((item) => ({
          ...item,
          id: item.vocabularyId, // giữ key tương thích bảng/route cũ
        }))
      : []

    return {
      items: mappedItems,
      pageNumber: pagingData?.pageNumber || pageNumber,
      pageSize: pagingData?.pageSize || pageSize,
      totalCount: pagingData?.totalCount || 0,
      totalPages: pagingData?.totalPages || 0,
      hasNextPage: pagingData?.hasNextPage || false,
      hasPreviousPage: pagingData?.hasPreviousPage || false,
    }
  } catch (error) {
    console.error('Error fetching vocabularies:', error)
    handleApiError(error, 'Không thể tải danh sách từ vựng')
    // Trả về structure rỗng nếu có lỗi
    return {
      items: [],
      pageNumber: params.pageNumber || 1,
      pageSize: params.pageSize || 20,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    }
  }
}

/**
 * Lấy chi tiết từ vựng theo ID
 * @param {string} vocabularyId - ID của từ vựng
 * @returns {Promise<Object>} - Dữ liệu chi tiết từ vựng bao gồm topics
 */
export async function fetchVocabularyDetail(vocabularyId) {
  try {
    if (!vocabularyId) {
      throw new Error('VocabularyId là bắt buộc')
    }

    const res = await apiClient.get(ENDPOINTS.VOCABULARY.ADMIN_GET_DETAIL(vocabularyId))

    const payload = res?.data
    if (!payload?.isSuccess) {
      const message =
        payload?.message ||
        (Array.isArray(payload?.errors) && payload.errors[0]?.description) ||
        'Không thể tải chi tiết từ vựng'
      throw new Error(message)
    }

    const data = payload?.data

    // Map data để tương thích với component
    return {
      ...data,
      id: data?.vocabularyId || vocabularyId,
      vocabularyId: data?.vocabularyId || vocabularyId,
    }
  } catch (error) {
    console.error('Error fetching vocabulary detail:', error)
    handleApiError(error, 'Không thể tải chi tiết từ vựng')
    throw error
  }
}

/**
 * Lấy danh sách câu ví dụ của 1 từ vựng cho user hiện tại
 * @param {string} vocabularyId - ID từ vựng
 * @returns {Promise<Array>} - Mảng câu ví dụ [{ exampleId, sentence, translation }]
 */
export async function fetchUserVocabularyExamples(vocabularyId) {
  try {
    if (!vocabularyId) {
      throw new Error('VocabularyId là bắt buộc')
    }

    const res = await apiClient.get(ENDPOINTS.VOCABULARY.USER_GET_EXAMPLES(vocabularyId))
    const payload = res?.data

    if (!payload?.isSuccess) {
      const message =
        payload?.message ||
        (Array.isArray(payload?.errors) && payload.errors[0]?.description) ||
        'Không thể tải câu ví dụ'
      throw new Error(message)
    }

    const examples = Array.isArray(payload?.data) ? payload.data : []
    return examples
  } catch (error) {
    console.error('Error fetching user vocabulary examples:', error)
    handleApiError(error, 'Không thể tải câu ví dụ')
    return []
  }
}

/**
 * Tạo từ vựng mới
 * @param {Object} payload - Dữ liệu từ vựng
 * @param {string} payload.text - Từ vựng (tiếng Hàn)
 * @param {string} payload.pronunciation - Phiên âm
 * @param {string} payload.definition - Định nghĩa
 * @param {string} payload.imgURL - URL ảnh minh họa
 * @param {string} payload.exampleSentence - Câu ví dụ (sẽ được convert sang examples array)
 * @param {Array} payload.examples - Mảng các ví dụ [{ sentence, translation }]
 * @returns {Promise<Object>} - Dữ liệu từ vựng đã được tạo
 */
export async function createVocabulary(payload) {
  try {
    if (!payload?.text || !payload?.definition) {
      throw { status: 400, message: 'Text và Definition là bắt buộc' }
    }

    // Chuẩn bị payload cho API
    const apiPayload = {
      text: payload.text || '',
      pronunciation: payload.pronunciation || '',
      definition: payload.definition || '',
      imgURL: payload.imgURL || null,
      examples: [],
    }

    // Xử lý examples: nếu có exampleSentence thì convert sang examples array
    if (payload.examples && Array.isArray(payload.examples) && payload.examples.length > 0) {
      apiPayload.examples = payload.examples
    } else if (payload.exampleSentence) {
      // Nếu có exampleSentence, tách thành sentence và translation nếu có format "sentence (translation)"
      const exampleText = payload.exampleSentence.trim()
      if (exampleText) {
        // Tìm pattern: "sentence (translation)" hoặc chỉ có sentence
        const match = exampleText.match(/^(.+?)\s*\((.+?)\)$/)
        if (match) {
          apiPayload.examples = [
            {
              sentence: match[1].trim(),
              translation: match[2].trim(),
            },
          ]
        } else {
          apiPayload.examples = [
            {
              sentence: exampleText,
              translation: '',
            },
          ]
        }
      }
    }

    const res = await apiClient.post(ENDPOINTS.VOCABULARY.ADMIN_CREATE, apiPayload)

    const responseData = res?.data
    if (!responseData?.isSuccess) {
      const message =
        responseData?.message ||
        (Array.isArray(responseData?.errors) && responseData.errors[0]?.description) ||
        'Không thể tạo từ vựng mới'
      throw { status: responseData?.statusCode || 400, message, responseData }
    }

    const createdData = responseData?.data
    return {
      ...createdData,
      vocabularyId: createdData?.vocabularyId,
      id: createdData?.vocabularyId,
    }
  } catch (error) {
    console.error('Error creating vocabulary:', error)

    const apiMessage =
      error?.response?.data?.message ||
      (Array.isArray(error?.response?.data?.errors) && error.response.data.errors[0]?.description) ||
      error?.responseData?.message ||
      (Array.isArray(error?.responseData?.errors) && error.responseData.errors[0]?.description)

    if (apiMessage) {
      const enrichedError = new Error(apiMessage)
      enrichedError.status = error?.response?.status || error?.status || 400
      enrichedError.errors = error?.response?.data?.errors || error?.responseData?.errors || error?.errors
      throw enrichedError
    }

    // Ném error để component có thể xử lý và hiển thị thông báo
    if (error?.response) {
      throw error.response
    }
    if (error?.responseData) {
      throw error.responseData
    }
    if (error?.response?.data) {
      throw error.response.data
    }
    throw error
  }
}

/**
 * Cập nhật từ vựng
 * @param {Object} payload - Dữ liệu cập nhật
 * @param {string} payload.vocabularyId - ID của từ vựng (hoặc payload.id)
 * @param {string} payload.text - Từ vựng (tiếng Hàn)
 * @param {string} payload.pronunciation - Phiên âm
 * @param {string} payload.definition - Định nghĩa
 * @param {string} payload.imgURL - URL ảnh minh họa
 * @returns {Promise<Object>} - Dữ liệu từ vựng đã được cập nhật
 */
export async function updateVocabulary(payload) {
  try {
    const vocabularyId = payload?.vocabularyId || payload?.id
    if (!vocabularyId) {
      throw { status: 400, message: apiErrors.invalidData }
    }

    // Chỉ gửi các field mà API yêu cầu
    const updatePayload = {
      text: payload?.text || '',
      pronunciation: payload?.pronunciation || '',
      definition: payload?.definition || '',
      imgURL: payload?.imgURL || null,
      status: payload?.status !== undefined ? payload.status : 1,
    }

    // Đảm bảo các field bắt buộc có giá trị
    if (!updatePayload.text || !updatePayload.definition) {
      throw { status: 400, message: 'Text và Definition là bắt buộc' }
    }

    const res = await apiClient.put(ENDPOINTS.VOCABULARY.UPDATE(vocabularyId), updatePayload)

    const responseData = res?.data
    if (!responseData?.isSuccess) {
      const message =
        responseData?.message ||
        (Array.isArray(responseData?.errors) && responseData.errors[0]?.description) ||
        'Không thể cập nhật từ vựng'
      throw { status: responseData?.statusCode || 400, message, response: responseData }
    }

    const updatedData = responseData?.data
    return {
      ...updatedData,
      vocabularyId: updatedData?.vocabularyId || vocabularyId,
      id: updatedData?.vocabularyId || vocabularyId,
    }
  } catch (error) {
    console.error('Error updating vocabulary:', error)
    // Ném error để component có thể xử lý và hiển thị thông báo
    if (error?.response) {
      throw error.response
    }
    throw error
  }
}

/**
 * Upload ảnh từ vựng lên Cloudinary
 * @param {File} file - File ảnh cần upload
 * @returns {Promise<string>} - URL của ảnh sau khi upload
 */
export async function uploadVocabularyImageToCloudinary(file) {
  try {
    if (!file) {
      throw new Error('File ảnh là bắt buộc')
    }

    // Tạo FormData để gửi file
    const formData = new FormData()
    formData.append('file', file)

    const res = await apiClient.post(ENDPOINTS.CLOUDINARY.UPLOAD_VOCABULARY_IMAGE, formData, {
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
    console.error('Error uploading vocabulary image to Cloudinary:', error)
    handleApiError(error, 'Không thể upload ảnh lên Cloudinary')
    throw error
  }
}

/**
 * Upload ảnh chủ đề lên Cloudinary
 * @param {File} file - File ảnh cần upload
 * @returns {Promise<string>} - URL của ảnh sau khi upload
 */
export async function uploadTopicImageToCloudinary(file) {
  try {
    if (!file) {
      throw new Error('File ảnh là bắt buộc')
    }

    // Tạo FormData để gửi file
    const formData = new FormData()
    formData.append('file', file)

    const res = await apiClient.post(ENDPOINTS.CLOUDINARY.UPLOAD_TOPIC_IMAGE, formData, {
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
    console.error('Error uploading topic image to Cloudinary:', error)
    handleApiError(error, 'Không thể upload ảnh lên Cloudinary')
    throw error
  }
}

/**
 * Tìm kiếm topics với filter
 * @param {Object} params - Tham số tìm kiếm
 * @param {number} params.pageNumber - Số trang (mặc định: 1)
 * @param {number} params.pageSize - Số item mỗi trang (mặc định: 10)
 * @param {string} params.searchTerm - Từ khóa tìm kiếm
 * @param {number} params.level - Lọc theo level
 * @param {number|string} params.status - Lọc theo status (0: draft, 1: active, 2: deleted, 3: pending approval, 'all': tất cả)
 * @returns {Promise<Object>} - { items, pageNumber, pageSize, totalCount, totalPages, hasNextPage, hasPreviousPage }
 */
export async function searchFlashcardTopics(params = {}) {
  try {
    const {
      pageNumber = 1,
      pageSize = 10,
      searchTerm,
      level,
      status,
    } = params

    const queryParams = {
      pageNumber,
      pageSize,
    }

    // Thêm searchTerm nếu có
    if (searchTerm) {
      queryParams.searchTerm = searchTerm
    }

    // Thêm level nếu có
    if (level !== undefined && level !== null) {
      queryParams.level = level
    }

    // Thêm status nếu có và không phải "all"
    if (status !== undefined && status !== null && status !== 'all') {
      queryParams.status = status
    }

    const res = await apiClient.get(ENDPOINTS.TOPIC.ADMIN_GET_ALL, {
      params: queryParams,
    })

    const payload = res?.data
    if (!payload?.isSuccess) {
      const message =
        payload?.message ||
        (Array.isArray(payload?.errors) && payload.errors[0]?.description) ||
        'Không thể tìm kiếm chủ đề flashcard'
      throw new Error(message)
    }

    const pagingData = payload?.data
    const items = Array.isArray(pagingData?.items) ? pagingData.items : []

    return {
      items: items.map((item) => ({
        id: item.topicId,
        topicId: item.topicId,
        title: item.topicName,
        subtitle: item.description || '',
        level: item.level,
        orderIndex: item.orderIndex,
        imgUrl: item.imgUrl,
        vocabularyCount: item.vocabularyCount,
        status: item.status,
        muted: item.status === 0, // status 0 = draft = muted
        _raw: item,
      })),
      pageNumber: pagingData?.pageNumber || pageNumber,
      pageSize: pagingData?.pageSize || pageSize,
      totalCount: pagingData?.totalCount || 0,
      totalPages: pagingData?.totalPages || 0,
      hasNextPage: pagingData?.hasNextPage || false,
      hasPreviousPage: pagingData?.hasPreviousPage || false,
    }
  } catch (error) {
    console.error('Error searching flashcard topics:', error)
    handleApiError(error, 'Không thể tìm kiếm chủ đề flashcard')
    return {
      items: [],
      pageNumber: params.pageNumber || 1,
      pageSize: params.pageSize || 10,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    }
  }
}

export async function fetchFlashcardTopics() {
  try {
    const res = await apiClient.get(ENDPOINTS.TOPIC.ADMIN_GET_ALL, {
      params: {
        pageNumber: 1,
        pageSize: 50,
      },
    })

    const payload = res?.data
    if (!payload?.isSuccess) {
      const message =
        payload?.message ||
        (Array.isArray(payload?.errors) && payload.errors[0]?.description) ||
        'Không thể tải chủ đề flashcard'
      throw new Error(message)
    }

    const pagingData = payload?.data
    const items = Array.isArray(pagingData?.items) ? pagingData.items : []

    return items.map((item) => ({
      id: item.topicId,
      title: item.topicName,
      subtitle:
        item.description ||
        (typeof item.vocabularyCount === 'number'
          ? `Có ${item.vocabularyCount} từ vựng`
          : ''),
      level: item.level,
      muted: false,
      vocabularyCount: item.vocabularyCount,
      imgUrl: item.imgUrl,
      _raw: item,
    }))
  } catch (error) {
    console.error('Error fetching flashcard topics (admin):', error)
    handleApiError(error, 'Không thể tải chủ đề flashcard')
    return mockFlashcardTopics
  }
}

/**
 * Lấy chi tiết 1 chủ đề kèm danh sách vocabularies
 * @param {string} topicId
 */
export async function fetchFlashcardTopicDetail(topicId) {
  try {
    const res = await apiClient.get(ENDPOINTS.TOPIC.GET_BY_ID(topicId))
    const payload = res?.data

    if (!payload?.isSuccess) {
      const message =
        payload?.message ||
        (Array.isArray(payload?.errors) && payload.errors[0]?.description) ||
        'Không thể tải chi tiết chủ đề'
      throw new Error(message)
    }

    const data = payload?.data
    const vocabularies = Array.isArray(data?.vocabularies) ? data.vocabularies : []

    const topic = {
      id: data?.topicId,
      title: data?.topicName,
      subtitle: data?.description || '',
      level: data?.level,
      imgUrl: data?.imgUrl,
      vocabularyCount: data?.vocabularyCount,
      vocabIds: vocabularies.map((v) => v.vocabularyId),
      muted: false,
      _raw: data,
    }

    const mappedVocabs = vocabularies.map((v) => ({
      ...v,
      id: v.vocabularyId,
      vocabularyId: v.vocabularyId,
    }))

    return { topic, vocabularies: mappedVocabs }
  } catch (error) {
    console.error('Error fetching flashcard topic detail:', error)
    handleApiError(error, 'Không thể tải chi tiết chủ đề')
    throw error
  }
}

/**
 * Tạo chủ đề flashcard mới
 * @param {Object} payload - Dữ liệu chủ đề
 * @param {string} payload.topicName - Tên chủ đề (hoặc payload.title)
 * @param {string} payload.description - Mô tả (hoặc payload.subtitle)
 * @param {number} payload.level - Level
 * @param {string} payload.imgUrl - URL ảnh
 * @returns {Promise<Object>} - Dữ liệu chủ đề đã được tạo
 */
export async function createFlashcardTopic(payload) {
  try {
    // Map từ format component sang format API
    const apiPayload = {
      topicName: payload?.topicName || payload?.title || '',
      description: payload?.description || payload?.subtitle || '',
      level: payload?.level || 1,
      imgUrl: payload?.imgUrl || payload?.imgURL || null,
    }

    if (!apiPayload.topicName || !apiPayload.description) {
      throw { status: 400, message: 'TopicName và Description là bắt buộc' }
    }

    const res = await apiClient.post(ENDPOINTS.TOPIC.CREATE, apiPayload)

    const responseData = res?.data
    if (!responseData?.isSuccess) {
      const message =
        responseData?.message ||
        (Array.isArray(responseData?.errors) && responseData.errors[0]?.description) ||
        'Không thể tạo chủ đề flashcard'
      throw { status: responseData?.statusCode || 400, message, response: responseData }
    }

    // API trả về topicId trong data
    const topicId = responseData?.data

    return {
      id: topicId,
      topicId,
      title: apiPayload.topicName,
      subtitle: apiPayload.description,
      level: apiPayload.level,
      imgUrl: apiPayload.imgUrl,
      status: 0, // Chủ đề mới tạo có status = 0 (Nháp/Ẩn)
      muted: true, // status 0 = draft = muted
      vocabularyCount: 0,
    }
  } catch (error) {
    console.error('Error creating flashcard topic:', error)
    // Ném error để component có thể xử lý và hiển thị thông báo
    if (error?.response) {
      throw error.response
    }
    throw error
  }
}

/**
 * Cập nhật chủ đề flashcard
 * @param {string} topicId - ID của chủ đề
 * @param {Object} payload - Dữ liệu cập nhật
 * @param {string} payload.topicName - Tên chủ đề
 * @param {string} payload.description - Mô tả
 * @param {number} payload.level - Level
 * @param {number} payload.status - Trạng thái (0: Draft, 1: Active, 2: Deleted, 3: PendingApproval)
 * @param {string} payload.imgUrl - URL ảnh
 * @returns {Promise<Object>} - Response từ API
 */
export async function updateFlashcardTopic(topicId, payload) {
  try {
    if (!topicId) {
      throw { status: 400, message: 'TopicId là bắt buộc' }
    }

    const apiPayload = {
      topicId,
      topicName: payload?.topicName || payload?.title || '',
      description: payload?.description || payload?.subtitle || '',
      level: payload?.level || 1,
      status: payload?.status !== undefined ? payload.status : 1,
      imgUrl: payload?.imgUrl || payload?.imgURL || null,
    }

    if (!apiPayload.topicName || !apiPayload.description) {
      throw { status: 400, message: 'TopicName và Description là bắt buộc' }
    }

    const res = await apiClient.put(ENDPOINTS.TOPIC.UPDATE, apiPayload)

    const responseData = res?.data
    if (!responseData?.isSuccess) {
      const message =
        responseData?.message ||
        (Array.isArray(responseData?.errors) && responseData.errors[0]?.description) ||
        'Không thể cập nhật chủ đề flashcard'
      throw { status: responseData?.statusCode || 400, message, response: responseData }
    }

    return responseData
  } catch (error) {
    console.error('Error updating flashcard topic:', error)
    // Ném error để component có thể xử lý và hiển thị thông báo
    if (error?.response) {
      throw error.response
    }
    throw error
  }
}

/**
 * Tìm kiếm từ vựng để thêm vào chủ đề
 * @param {string} keyword - Từ khóa tìm kiếm (có thể rỗng để lấy 10 từ đầu tiên)
 * @param {Object} options - Tùy chọn
 * @param {number} options.pageSize - Số lượng kết quả (mặc định: 10)
 * @returns {Promise<Array>} - Mảng các từ vựng
 */
export async function updateTopicOrderIndex(topicId, orderIndex) {
  try {
    if (!topicId) {
      throw { status: 400, message: 'TopicId là bắt buộc' }
    }

    if (orderIndex === undefined || orderIndex === null || Number.isNaN(Number(orderIndex))) {
      throw { status: 400, message: 'OrderIndex không hợp lệ' }
    }

    const apiPayload = {
      topicId,
      orderIndex: Number(orderIndex),
    }

    const res = await apiClient.put(ENDPOINTS.TOPIC.UPDATE_ORDER_INDEX, apiPayload)

    const responseData = res?.data
    if (!responseData?.isSuccess) {
      const message =
        responseData?.message ||
        (Array.isArray(responseData?.errors) && responseData.errors[0]?.description) ||
        'Không thể cập nhật thứ tự chủ đề'
      throw { status: responseData?.statusCode || 400, message, response: responseData }
    }

    return responseData
  } catch (error) {
    console.error('Error updating topic order index:', error)
    if (error?.response) {
      throw error.response
    }
    throw error
  }
}

/**
 * Tìm kiếm từ vựng để thêm vào chủ đề
 * @param {string} keyword - Từ khóa tìm kiếm (có thể rỗng để lấy 10 từ đầu tiên)
 * @param {Object} options - Tùy chọn
 * @param {number} options.pageSize - Số lượng kết quả (mặc định: 10)
 * @returns {Promise<Array>} - Mảng các từ vựng
 */
export async function searchVocabulariesForTopic(keyword = '', options = {}) {
  try {
    const { pageSize = 10 } = options
    const trimmedKeyword = keyword?.trim() || ''
    
    const params = {
      pageNumber: 1,
      pageSize,
      status: 1,
    }
    
    // Chỉ thêm searchText nếu có từ khóa
    if (trimmedKeyword) {
      params.searchText = trimmedKeyword
    }
    
    const res = await fetchVocabularies(params)
    // Trả về items từ kết quả
    return Array.isArray(res?.items) ? res.items : []
  } catch (error) {
    console.error('Error searching vocabularies for topic:', error)
    return []
  }
}

/**
 * Thêm từ vựng vào chủ đề flashcard
 * @param {string} topicId - ID của chủ đề
 * @param {string[]} vocabularyIds - Mảng các ID từ vựng cần thêm
 * @returns {Promise<Object>} - Response từ API { isSuccess, data, message, errors, statusCode }
 */
export async function addVocabulariesToTopic(topicId, vocabularyIds) {
  try {
    if (!topicId) {
      throw { status: 400, message: 'TopicId là bắt buộc' }
    }

    if (!Array.isArray(vocabularyIds) || vocabularyIds.length === 0) {
      throw { status: 400, message: 'Danh sách từ vựng không được để trống' }
    }

    const payload = {
      topicId,
      vocabularyIds,
    }

    const res = await apiClient.post(ENDPOINTS.TOPIC.ADD_VOCABULARIES, payload)

    const responseData = res?.data
    // Trả về toàn bộ response để component có thể xử lý và hiển thị thông báo
    return responseData
  } catch (error) {
    console.error('Error adding vocabularies to topic:', error)
    // Nếu error có response data, trả về nó
    if (error?.response?.data) {
      return error.response.data
    }
    // Nếu không, tạo response error format
    throw {
      isSuccess: false,
      message: error?.message || 'Không thể thêm từ vựng vào chủ đề',
      errors: error?.errors || [],
      statusCode: error?.status || 500,
    }
  }
}

/**
 * Thêm từ vựng vào chủ đề và reload lại dữ liệu chủ đề
 * @param {string} topicId - ID của chủ đề
 * @param {string[]} vocabularyIds - Mảng các ID từ vựng cần thêm
 * @returns {Promise<Object>} - { response, topicDetail } - Response từ API và chi tiết chủ đề đã reload
 */
export async function addVocabulariesToTopicAndReload(topicId, vocabularyIds) {
  try {
    // Thêm từ vựng vào chủ đề
    const response = await addVocabulariesToTopic(topicId, vocabularyIds)
    
    // Nếu thành công, reload lại chi tiết chủ đề
    let topicDetail = null
    if (response?.isSuccess) {
      try {
        topicDetail = await fetchFlashcardTopicDetail(topicId)
      } catch (reloadError) {
        console.error('Error reloading topic detail after adding vocabularies:', reloadError)
        // Không throw error, vì việc thêm đã thành công
      }
    }
    
    return {
      response,
      topicDetail,
    }
  } catch (error) {
    console.error('Error in addVocabulariesToTopicAndReload:', error)
    // Nếu error có response data, trả về nó
    if (error?.response?.data) {
      return {
        response: error.response.data,
        topicDetail: null,
      }
    }
    // Nếu không, tạo response error format
    return {
      response: {
        isSuccess: false,
        message: error?.message || 'Không thể thêm từ vựng vào chủ đề',
        errors: error?.errors || [],
        statusCode: error?.status || 500,
      },
      topicDetail: null,
    }
  }
}

/**
 * Gỡ từ vựng khỏi chủ đề flashcard
 * @param {string} topicId - ID của chủ đề
 * @param {string[]} vocabularyIds - Mảng các ID từ vựng cần gỡ
 * @returns {Promise<Object>} - Response từ API { isSuccess, data, message, errors, statusCode }
 */
export async function removeVocabulariesFromTopic(topicId, vocabularyIds) {
  try {
    if (!topicId) {
      throw { status: 400, message: 'TopicId là bắt buộc' }
    }

    if (!Array.isArray(vocabularyIds) || vocabularyIds.length === 0) {
      throw { status: 400, message: 'Danh sách từ vựng không được để trống' }
    }

    const payload = {
      topicId,
      vocabularyIds,
    }

    const res = await apiClient.delete(ENDPOINTS.TOPIC.ADMIN_REMOVE_VOCABULARIES, {
      data: payload,
    })

    const responseData = res?.data
    return responseData
  } catch (error) {
    console.error('Error removing vocabularies from topic:', error)
    if (error?.response?.data) {
      return error.response.data
    }
    throw {
      isSuccess: false,
      message: error?.message || 'Không thể gỡ từ vựng khỏi chủ đề',
      errors: error?.errors || [],
      statusCode: error?.status || 500,
    }
  }
}

/**
 * Gỡ từ vựng khỏi chủ đề và reload lại dữ liệu chủ đề
 * @param {string} topicId - ID của chủ đề
 * @param {string[]} vocabularyIds - Mảng các ID từ vựng cần gỡ
 * @returns {Promise<Object>} - { response, topicDetail } - Response từ API và chi tiết chủ đề đã reload
 */
export async function removeVocabulariesFromTopicAndReload(topicId, vocabularyIds) {
  try {
    const response = await removeVocabulariesFromTopic(topicId, vocabularyIds)

    let topicDetail = null
    if (response?.isSuccess) {
      try {
        topicDetail = await fetchFlashcardTopicDetail(topicId)
      } catch (reloadError) {
        console.error('Error reloading topic detail after removing vocabularies:', reloadError)
      }
    }

    return {
      response,
      topicDetail,
    }
  } catch (error) {
    console.error('Error in removeVocabulariesFromTopicAndReload:', error)
    if (error?.response?.data) {
      return {
        response: error.response.data,
        topicDetail: null,
      }
    }
    return {
      response: {
        isSuccess: false,
        message: error?.message || 'Không thể gỡ từ vựng khỏi chủ đề',
        errors: error?.errors || [],
        statusCode: error?.status || 500,
      },
      topicDetail: null,
    }
  }
}

/**
 * Publish chủ đề flashcard (chuyển từ status 0 sang 1)
 * @param {string} topicId - ID của chủ đề
 * @returns {Promise<Object>} - Response từ API
 */
export async function publishTopic(topicId) {
  try {
    if (!topicId) {
      throw new Error('TopicId là bắt buộc')
    }

    const res = await apiClient.put(ENDPOINTS.TOPIC.PUBLISH(topicId))

    const responseData = res?.data
    if (!responseData?.isSuccess) {
      const message =
        responseData?.message ||
        (Array.isArray(responseData?.errors) && responseData.errors[0]?.description) ||
        'Không thể công khai chủ đề'
      throw { status: responseData?.statusCode || 400, message, response: responseData }
    }

    return responseData
  } catch (error) {
    console.error('Error publishing topic:', error)
    // Ném error để component có thể xử lý và hiển thị thông báo
    if (error?.response) {
      throw error.response
    }
    throw error
  }
}

/**
 * Staff gửi chủ đề flashcard chờ moderator phê duyệt
 * Chỉ áp dụng cho topic ở trạng thái Draft và đã có từ vựng
 * @param {string} topicId - ID của chủ đề
 * @returns {Promise<Object>} - Response từ API
 */
export async function submitTopicForApproval(topicId) {
  try {
    if (!topicId) {
      throw new Error('TopicId là bắt buộc')
    }

    const res = await apiClient.post(ENDPOINTS.TOPIC.STAFF_SUBMIT_FOR_APPROVAL(topicId))

    const responseData = res?.data
    if (!responseData?.isSuccess) {
      const message =
        responseData?.message ||
        (Array.isArray(responseData?.errors) && responseData.errors[0]?.description) ||
        'Không thể gửi chủ đề chờ phê duyệt'
      throw { status: responseData?.statusCode || 400, message, response: responseData }
    }

    return responseData
  } catch (error) {
    console.error('Error submitting topic for approval:', error)
    // Ném error để component có thể xử lý và hiển thị thông báo
    if (error?.response) {
      throw error.response
    }
    throw error
  }
}

/**
 * Moderator phê duyệt chủ đề flashcard
 * @param {string} topicId - ID của chủ đề
 * @returns {Promise<Object>} - Response từ API
 */
export async function approveTopic(topicId) {
  try {
    if (!topicId) {
      throw new Error('TopicId là bắt buộc')
    }

    const res = await apiClient.put(ENDPOINTS.TOPIC.MODERATOR_APPROVE(topicId))

    const responseData = res?.data
    if (!responseData?.isSuccess) {
      const message =
        responseData?.message ||
        (Array.isArray(responseData?.errors) && responseData.errors[0]?.description) ||
        'Không thể phê duyệt chủ đề'
      throw { status: responseData?.statusCode || 400, message, response: responseData }
    }

    return responseData
  } catch (error) {
    console.error('Error approving topic:', error)
    if (error?.response) {
      throw error.response
    }
    throw error
  }
}

/**
 * Moderator từ chối phê duyệt chủ đề flashcard
 * @param {string} topicId - ID của chủ đề
 * @param {string} rejectReason - Lý do từ chối (tên field theo API backend)
 * @returns {Promise<Object>} - Response từ API
 */
export async function rejectTopic(topicId, rejectReason) {
  try {
    if (!topicId) {
      throw new Error('TopicId là bắt buộc')
    }

    if (!rejectReason || rejectReason.trim().length < 10) {
      throw new Error('Lý do từ chối phải có ít nhất 10 ký tự')
    }

    const res = await apiClient.put(ENDPOINTS.TOPIC.MODERATOR_REJECT(topicId), {
      rejectReason: rejectReason.trim(),
    })

    const responseData = res?.data
    if (!responseData?.isSuccess) {
      const message =
        responseData?.message ||
        (Array.isArray(responseData?.errors) && responseData.errors[0]?.description) ||
        'Không thể từ chối phê duyệt chủ đề'
      throw { status: responseData?.statusCode || 400, message, response: responseData }
    }

    return responseData
  } catch (error) {
    console.error('Error rejecting topic:', error)
    if (error?.response) {
      throw error.response
    }
    throw error
  }
}

/**
 * Xóa chủ đề flashcard
 * @param {string} topicId - ID của chủ đề cần xóa
 * @returns {Promise<Object>} - Response từ API
 */
export async function deleteTopic(topicId) {
  try {
    if (!topicId) {
      throw new Error('TopicId là bắt buộc')
    }

    const res = await apiClient.delete(ENDPOINTS.TOPIC.DELETE(topicId))

    const payload = res?.data
    if (!payload?.isSuccess) {
      const message =
        payload?.message ||
        (Array.isArray(payload?.errors) && payload.errors[0]?.description) ||
        'Không thể xóa chủ đề'
      throw { status: payload?.statusCode || 400, message, errors: payload?.errors, response: payload }
    }

    return payload
  } catch (error) {
    console.error('Error deleting topic:', error)
    // Ném error để component có thể xử lý và hiển thị thông báo
    if (error?.response) {
      throw error.response
    }
    throw error
  }
}

/**
 * Xóa từ vựng
 * @param {string} vocabularyId - ID của từ vựng cần xóa
 * @returns {Promise<boolean>} - true nếu xóa thành công
 */
export async function deleteVocabulary(vocabularyId) {
  try {
    if (!vocabularyId) {
      throw new Error('VocabularyId là bắt buộc')
    }

    const res = await apiClient.delete(ENDPOINTS.VOCABULARY.DELETE(vocabularyId))

    const payload = res?.data
    if (!payload?.isSuccess) {
      const message =
        payload?.message ||
        (Array.isArray(payload?.errors) && payload.errors[0]?.description) ||
        'Không thể xóa từ vựng'
      throw { status: payload?.statusCode || 400, message, errors: payload?.errors, response: payload }
    }

    return true
  } catch (error) {
    console.error('Error deleting vocabulary:', error)
    // Ném error để component có thể xử lý và hiển thị thông báo
    if (error?.response) {
      throw error.response
    }
    throw error
  }
}

/**
 * Thêm câu mẫu vào từ vựng
 * @param {string} vocabularyId - ID của từ vựng
 * @param {Object} example - Câu mẫu cần thêm
 * @param {string} example.sentence - Câu mẫu
 * @param {string} example.translation - Bản dịch
 * @returns {Promise<Object>} - Response từ API
 */
export async function addExampleToVocabulary(vocabularyId, example) {
  try {
    if (!vocabularyId) {
      throw new Error('VocabularyId là bắt buộc')
    }

    if (!example?.sentence) {
      throw { status: 400, message: 'Sentence là bắt buộc' }
    }

    const payload = {
      vocabularyId,
      examples: [
        {
          sentence: example.sentence || '',
          translation: example.translation || '',
        },
      ],
    }

    const res = await apiClient.post(ENDPOINTS.VOCABULARY.ADD_EXAMPLES, payload)

    const responseData = res?.data
    if (!responseData?.isSuccess) {
      const message =
        responseData?.message ||
        (Array.isArray(responseData?.errors) && responseData.errors[0]?.description) ||
        'Không thể thêm câu mẫu'
      throw { status: responseData?.statusCode || 400, message, response: responseData }
    }

    return responseData
  } catch (error) {
    console.error('Error adding example to vocabulary:', error)
    // Ném error để component có thể xử lý và hiển thị thông báo
    if (error?.response) {
      throw error.response
    }
    throw error
  }
}

/**
 * Cập nhật câu mẫu
 * @param {string} exampleId - ID của câu mẫu
 * @param {Object} example - Dữ liệu cập nhật
 * @param {string} example.sentence - Câu mẫu
 * @param {string} example.translation - Bản dịch
 * @param {number} example.status - Trạng thái (0: Draft, 1: Active, 2: Deleted)
 * @returns {Promise<Object>} - Response từ API
 */
export async function updateExample(exampleId, example) {
  try {
    if (!exampleId) {
      throw new Error('ExampleId là bắt buộc')
    }

    if (!example?.sentence) {
      throw { status: 400, message: 'Sentence là bắt buộc' }
    }

    const payload = {
      sentence: example.sentence || '',
      translation: example.translation || '',
      status: example.status !== undefined ? example.status : 1,
    }

    const res = await apiClient.put(ENDPOINTS.VOCABULARY.UPDATE_EXAMPLE(exampleId), payload)

    const responseData = res?.data
    if (!responseData?.isSuccess) {
      const message =
        responseData?.message ||
        (Array.isArray(responseData?.errors) && responseData.errors[0]?.description) ||
        'Không thể cập nhật câu mẫu'
      throw { status: responseData?.statusCode || 400, message, response: responseData }
    }

    return responseData
  } catch (error) {
    console.error('Error updating example:', error)
    // Ném error để component có thể xử lý và hiển thị thông báo
    if (error?.response) {
      throw error.response
    }
    throw error
  }
}

/**
 * Xóa câu mẫu
 * @param {string} exampleId - ID của câu mẫu cần xóa
 * @returns {Promise<Object>} - Response từ API
 */
export async function deleteExample(exampleId) {
  try {
    if (!exampleId) {
      throw new Error('ExampleId là bắt buộc')
    }

    const res = await apiClient.delete(ENDPOINTS.VOCABULARY.DELETE_EXAMPLE(exampleId))

    const responseData = res?.data
    if (!responseData?.isSuccess) {
      const message =
        responseData?.message ||
        (Array.isArray(responseData?.errors) && responseData.errors[0]?.description) ||
        'Không thể xóa câu mẫu'
      throw { status: responseData?.statusCode || 400, message, response: responseData }
    }

    return responseData
  } catch (error) {
    console.error('Error deleting example:', error)
    // Ném error để component có thể xử lý và hiển thị thông báo
    if (error?.response) {
      throw error.response
    }
    throw error
  }
}

/**
 * Import từ vựng từ file Excel vào chủ đề
 * @param {string} topicId - ID của chủ đề
 * @param {File} file - File Excel cần import
 * @returns {Promise<Object>} - Response từ API với successList và failureList
 */
export async function uploadExcelToTopic(topicId, file) {
  try {
    if (!topicId) {
      throw new Error('TopicId là bắt buộc')
    }

    if (!file) {
      throw new Error('File Excel là bắt buộc')
    }

    // Tạo FormData để gửi file
    const formData = new FormData()
    formData.append('file', file)

    const res = await apiClient.post(ENDPOINTS.EXCEL.ADD_VOCAB_TO_TOPIC(topicId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 0, // Không giới hạn thời gian cho import Excel vì backend xử lý lâu
    })

    const payload = res?.data
    if (!payload?.isSuccess) {
      const message =
        payload?.message ||
        (Array.isArray(payload?.errors) && payload.errors[0]?.description) ||
        'Không thể import từ vựng từ Excel'
      throw { status: payload?.statusCode || 400, message, errors: payload?.errors, response: payload }
    }

    return payload
  } catch (error) {
    console.error('Error uploading Excel to topic:', error)
    // Ném error để component có thể xử lý và hiển thị thông báo
    if (error?.response) {
      throw error.response
    }
    throw error
  }
}

/**
 * Export từ vựng theo chủ đề ra file Excel
 * @param {string} topicId - ID của chủ đề
 * @returns {Promise<Blob>} - File Excel dưới dạng Blob
 */
export async function exportTopicToExcel(topicId) {
  try {
    if (!topicId) {
      throw new Error('TopicId là bắt buộc')
    }

    const res = await apiClient.get(ENDPOINTS.EXCEL.EXPORT_BY_TOPIC(topicId), {
      responseType: 'blob', // Quan trọng: phải set responseType là 'blob' để nhận file binary
      headers: {
        // Có thể để */* hoặc mime Excel, backend sẽ tự set Content-Type phù hợp
        accept: '*/*',
      },
    })

    // Kiểm tra xem response có phải là blob không
    if (res?.data instanceof Blob) {
      return res.data
    }

    throw new Error('Không thể tải file Excel')
  } catch (error) {
    console.error('Error exporting topic to Excel:', error)
    
    // Nếu có response data từ error, có thể là error message từ server
    if (error?.response?.data) {
      // Nếu response là blob (có thể là error message từ server), thử đọc text
      if (error.response.data instanceof Blob) {
        try {
          const text = await error.response.data.text()
          const errorData = JSON.parse(text)
          throw {
            status: error.response.status || 500,
            message: errorData?.message || 'Không thể export file Excel',
            errors: errorData?.errors || [],
          }
        } catch (parseError) {
          throw {
            status: error.response.status || 500,
            message: 'Không thể export file Excel',
          }
        }
      }
    }
    
    throw {
      status: error?.status || 500,
      message: error?.message || 'Không thể export file Excel',
      errors: error?.errors || [],
    }
  }
}

