import { apiErrors } from '../../../string.js'
import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'
import { handleApiError } from '../../admin/api'
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

    // Thêm status nếu có
    if (status !== undefined && status !== null) {
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

export async function createVocabulary(payload) {
  try {
    await delay()
    if (!payload?.text || !payload?.definition) {
      throw { status: 400, message: apiErrors.invalidData }
    }
    const vocabularyId = payload.vocabularyId || `v${Date.now()}`
    return {
      vocabularyId,
      id: vocabularyId,
      ...payload,
    }
  } catch (error) {
    handleApiError(error, 'Không thể tạo từ vựng mới')
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
      muted: false,
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

export async function updateFlashcardTopic(id, payload) {
  try {
    await delay()
    if (!id) throw { status: 400, message: apiErrors.invalidData }
    return {
      id,
      ...payload,
    }
  } catch (error) {
    handleApiError(error, 'Không thể cập nhật chủ đề flashcard')
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

