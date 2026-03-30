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
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data
  }
  return payload
}

export const getPronunciationRules = async () => {
  try {
    const res = await apiClient.get(`${API_BASE_URL}${ENDPOINTS.PRONUNCIATION_RULES.GET_ALL}`)
    const data = extractData(res)

    if (!Array.isArray(data)) {
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
        _raw: item,
      }))
  } catch (error) {
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
      return []
    }

    return data.map((item) => ({
      id: item.exampleId,
      text: item.rawScript,
      sortOrder: item.sortOrder
    }))
  } catch (error) {
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
