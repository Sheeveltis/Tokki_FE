import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS, API_BASE_URL } from '../../../provider/api/endpoints'
import axios from 'axios'

const extractErrorMessage = (error, fallbackMessage) => {
  const data = error?.response?.data
  return (
    data?.message ||
    (Array.isArray(data?.errors) && data.errors[0]?.description) ||
    error?.message ||
    fallbackMessage
  )
}

const extractData = (response) => {
  const payload = response?.data
  
  // Nếu payload có isSuccess = false, throw error luôn để catch block xử lý
  if (payload && typeof payload === 'object' && payload.isSuccess === false) {
    const errorMsg = payload.message || (Array.isArray(payload.errors) && payload.errors[0]?.description) || 'API Error'
    throw new Error(errorMsg)
  }

  // Nếu có bọc trong data
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = payload.data
    // Hỗ trợ paginated response (data.items)
    if (data && typeof data === 'object' && 'items' in data) {
      return data.items
    }
    return data
  }
  
  // Trả về payload nếu không có bọc data
  return payload
}

export const getPronunciationRules = async (role = 'user') => {
  try {
    const endpoint = role === 'admin' 
      ? ENDPOINTS.PRONUNCIATION_RULES.ADMIN_GET_ALL 
      : ENDPOINTS.PRONUNCIATION_RULES.USER_GET_ALL

    const res = await apiClient.get(`${API_BASE_URL}${endpoint}`)
    const data = extractData(res)

    if (!Array.isArray(data)) {
      console.warn('DEBUG: PronunciationRules API did not return an array after extraction:', data)
      return []
    }

    return data
      .slice()
      .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
      .map((item) => ({
        id: item?.pronunciationRuleId || item?.ruleId || item?.id,
        title: item?.ruleName || item?.name || 'Pronunciation Rule',
        description: item?.description || '',
        content: item?.content || '',
        sortOrder: item?.sortOrder || 0,
        progressPercent: item?.progressPercent || 0,
        _raw: item,
      }))
  } catch (error) {
    console.error('Error in getPronunciationRules:', error)
    throw new Error(extractErrorMessage(error, 'Không thể tải danh sách quy tắc phát âm'))
  }
}

export const createPronunciationRule = async (payload) => {
  try {
    const res = await apiClient.post(`${API_BASE_URL}${ENDPOINTS.PRONUNCIATION_RULES.CREATE}`, payload)
    return extractData(res)
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Không thể tạo quy tắc phát âm'))
  }
}

export const getPronunciationExamplesByRuleId = async (ruleId) => {
  if (!ruleId) return []

  try {
    const res = await apiClient.get(`${API_BASE_URL}${ENDPOINTS.PRONUNCIATION_EXAMPLE.GET_BY_RULE_ID(ruleId)}`)
    const data = extractData(res)

    if (!Array.isArray(data)) {
      console.warn('DEBUG: PronunciationExamples API did not return an array after extraction:', data)
      return []
    }

    return data.map((item) => ({
      id: item.exampleId,
      text: item.rawScript || item.targetScript || '',
      difficulty: item.difficulty || 'Medium',
      audioUrl: item.audioUrl || null,
      sortOrder: item.sortOrder || 0
    }))
  } catch (error) {
    console.error('Error in getPronunciationExamplesByRuleId:', error)
    throw new Error(extractErrorMessage(error, 'Không thể tải ví dụ phát âm'))
  }
}

export const getPronunciationExampleById = async (exampleId) => {
  if (!exampleId) return null

  try {
    const res = await apiClient.get(`${API_BASE_URL}${ENDPOINTS.PRONUNCIATION_EXAMPLE.GET_BY_ID(exampleId)}`)
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
      _raw: item,
    }
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Không thể tải chi tiết ví dụ phát âm'))
  }
}

export const evaluatePronunciation = async (formData) => {
  try {
    // Sử dụng API_BASE_URL trực tiếp để đảm bảo Domain được đính kèm như yêu cầu
    const res = await apiClient.post(`${API_BASE_URL}${ENDPOINTS.PRONUNCIATION.EVALUATE}`, formData, {
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
