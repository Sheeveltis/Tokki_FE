import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS, API_BASE_URL } from '../../../provider/api/endpoints'

const extractData = (res) => res.data?.data || res.data

const extractErrorMessage = (error, fallback) => {
  return error.response?.data?.message || 
         (Array.isArray(error.response?.data?.errors) && error.response.data.errors[0]?.description) ||
         error.message || 
         fallback
}

export const getPronunciationRules = async (role = 'user', params = {}) => {
  const endpoint = role === 'admin' 
    ? ENDPOINTS.PRONUNCIATION_RULES.ADMIN_GET_ALL 
    : ENDPOINTS.PRONUNCIATION_RULES.USER_GET_ALL

  try {
    const res = await apiClient.get(endpoint, { 
      params: typeof params === 'object' ? params : {} 
    })
    const data = extractData(res)

    // Map data để tương thích với component (admin dùng ruleName, user có thể dùng title)
    if (Array.isArray(data)) {
      return data.map(item => ({
        ...item,
        id: item.id || item.pronunciationRuleId,
        title: item.title || item.ruleName,
        description: item.description || item.ruleDescription
      }))
    }

    if (data && typeof data === 'object' && Array.isArray(data.items)) {
      return {
        ...data,
        items: data.items.map(item => ({
          ...item,
          id: item.id || item.pronunciationRuleId,
          title: item.title || item.ruleName,
          description: item.description || item.ruleDescription
        }))
      }
    }

    return data
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Không thể tải danh sách quy tắc phát âm'))
  }
}

export const createPronunciationRule = async (payload) => {
  try {
    const res = await apiClient.post(ENDPOINTS.PRONUNCIATION_RULES.CREATE, payload)
    return extractData(res)
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Không thể tạo quy tắc phát âm'))
  }
}

export const deletePronunciationRule = async (id) => {
  try {
    const res = await apiClient.delete(ENDPOINTS.PRONUNCIATION_RULES.DELETE(id))
    return extractData(res)
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Không thể xóa quy tắc phát âm'))
  }
}

export const reorderPronunciationRule = async (pronunciationRuleId, newSortOrder) => {
  try {
    const res = await apiClient.post(ENDPOINTS.PRONUNCIATION_RULES.REORDER, {
      pronunciationRuleId,
      newSortOrder
    })
    return extractData(res)
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Không thể thay đổi vị trí quy tắc'))
  }
}

export const getPronunciationExamples = async (incomingParams) => {
  try {
    const rawParams = typeof incomingParams === 'object' ? incomingParams : {}
    const ruleId = rawParams.pronunciationRuleId || rawParams.PronunciationRuleId
    
    const params = {
      pronunciationRuleId: ruleId,
      pageNumber: rawParams.pageNumber || rawParams.PageNumber || 1,
      pageSize: rawParams.pageSize || rawParams.PageSize || 100,
      searchTerm: rawParams.searchTerm || rawParams.SearchTerm
    }

    const res = await apiClient.get(ENDPOINTS.PRONUNCIATION_EXAMPLE.GET_BY_RULE_ID(ruleId), { params })
    return extractData(res)
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Không thể tải danh sách ví dụ'))
  }
}

export const getPronunciationExamplesByRuleId = async (ruleId) => {
  if (!ruleId) return []

  try {
    const res = await apiClient.get(ENDPOINTS.PRONUNCIATION_EXAMPLE.GET_BY_RULE_ID(ruleId))
    const data = extractData(res)

    let items = []
    if (Array.isArray(data)) {
      items = data
    } else if (data && typeof data === 'object' && Array.isArray(data.items)) {
      items = data.items
    } else {
      console.warn('DEBUG: PronunciationExamples API did not return an array or items:', data)
      return []
    }

    return items.map((item) => ({
      id: item.exampleId,
      text: item.rawScript || item.targetScript || '',
      difficulty: item.difficulty || 'Medium',
      audioUrl: item.audioUrl || null,
      sortOrder: item.sortOrder || 0,
      isLearned: item.isLearned || item.IsLearned || false
    }))
  } catch (error) {
    console.error('Error in getPronunciationExamplesByRuleId:', error)
    throw new Error(extractErrorMessage(error, 'Không thể tải ví dụ phát âm'))
  }
}

export const updatePronunciationRule = async (id, payload) => {
  try {
    const res = await apiClient.put(ENDPOINTS.PRONUNCIATION_RULES.UPDATE(id), payload)
    return extractData(res)
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Không thể cập nhật quy tắc phát âm'))
  }
}

export const importPronunciationRulesFromExcel = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await apiClient.post(ENDPOINTS.PRONUNCIATION_RULES.IMPORT_EXCEL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return extractData(res)
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Không thể import quy tắc phát âm'))
  }
}

export const exportPronunciationRulesToExcel = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.PRONUNCIATION_RULES.EXPORT_EXCEL, {
      responseType: 'blob'
    })
    return response.data
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Không thể xuất dữ liệu quy tắc phát âm'))
  }
}

export const downloadPronunciationTemplate = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.PRONUNCIATION_RULES.IMPORT_TEMPLATE, {
      responseType: 'blob'
    })
    return response.data
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Không thể tải template mẫu'))
  }
}

export const getPronunciationExampleById = async (exampleId) => {
  if (!exampleId) return null

  try {
    const res = await apiClient.get(ENDPOINTS.PRONUNCIATION_EXAMPLE.GET_BY_ID(exampleId))
    const item = extractData(res)

    if (!item) return null

    return {
      id: item.exampleId,
      targetScript: item.targetScript || '',
      rawScript: item.rawScript || '',
      phoneticScript: item.phoneticScript || '',
      meaning: item.meaning || '',
      audioUrl: item.audioUrl || null,
      difficulty: item.difficulty || 'Medium',
      ruleName: item.ruleName || '',
      ruleDescription: item.ruleDescription || '',
      ruleContent: item.ruleContent || '',
      isLearned: item.isLearned || false,
      _raw: item,
    }
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Không thể tải chi tiết ví dụ phát âm'))
  }
}

export const evaluatePronunciation = async (formData) => {
  try {
    // Sử dụng API_BASE_URL trực tiếp để đảm bảo Domain được đính kèm như yêu cầu
    const res = await apiClient.post(ENDPOINTS.PRONUNCIATION.EVALUATE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // Tăng timeout lên 60s cho AI đánh giá
    })
    const data = extractData(res)

    if (!data || typeof data !== 'object') {
     throw new Error('Dữ liệu đánh giá không hợp lệ')
    }

    return {
      score: data.accuracyScore ?? 0,
      accuracyScore: data.accuracyScore ?? 0,
      fluencyScore: data.fluencyScore ?? 0,
      completenessScore: data.completenessScore ?? 0,
      prosodyScore: data.prosodyScore ?? 0,
      aiFeedback: data.aiFeedback || 'Đã nhận kết quả đánh giá',
      words: data.words || [],
      _raw: data,
    }
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Không thể đánh giá phát âm'))
  }
}
