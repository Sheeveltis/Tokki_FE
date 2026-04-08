import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

export async function fetchTitles(params = {}) {
  const queryParams = {
    PageNumber: params.page || 1,
    PageSize: params.size || 10,
    SearchTerm: params.search || '',
    Status: params.status,
    RequirementType: params.requirementType,
  }

  const res = await apiClient.get(ENDPOINTS.TITLE.GET_ALL, { params: queryParams })
  return res.data?.data
}

export async function createTitle(payload) {
  const res = await apiClient.post(ENDPOINTS.TITLE.CREATE, payload)
  const resData = res?.data

  // Backend trả về { isSuccess, data, message, errors }
  if (resData && typeof resData === 'object' && 'isSuccess' in resData) {
    if (!resData.isSuccess) {
      const message =
        resData?.message ||
        (Array.isArray(resData?.errors) && resData.errors[0]?.description) ||
        'Không thể tạo danh hiệu'
      throw new Error(message)
    }
    // Return data kèm message để component có thể hiển thị
    return { data: resData.data ?? resData, message: resData.message }
  }

  return { data: resData, message: resData?.message }
}

export async function updateTitle(id, payload) {
  const res = await apiClient.put(ENDPOINTS.TITLE.UPDATE(id), payload)
  const resData = res?.data

  // Backend trả về { isSuccess, data, message, errors }
  if (resData && typeof resData === 'object' && 'isSuccess' in resData) {
    if (!resData.isSuccess) {
      const message =
        resData?.message ||
        (Array.isArray(resData?.errors) && resData.errors[0]?.description) ||
        'Không thể cập nhật danh hiệu'
      throw new Error(message)
    }
    // Return data kèm message để component có thể hiển thị
    return { data: resData.data ?? resData, message: resData.message }
  }

  return { data: resData, message: resData?.message }
}

export async function deleteTitle(id) {
  const res = await apiClient.delete(ENDPOINTS.TITLE.DELETE(id))
  const resData = res?.data

  // Backend trả về { isSuccess, data, message, errors }
  if (resData && typeof resData === 'object' && 'isSuccess' in resData) {
    if (!resData.isSuccess) {
      const message =
        resData?.message ||
        (Array.isArray(resData?.errors) && resData.errors[0]?.description) ||
        'Không thể xóa danh hiệu'
      throw new Error(message)
    }
    // Return data kèm message để component có thể hiển thị
    return { data: resData.data ?? resData, message: resData.message }
  }

  return { data: resData, message: resData?.message }
}

export async function importTitles(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await apiClient.post(ENDPOINTS.TITLE.IMPORT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return res.data
}

export async function exportTitles() {
  const res = await apiClient.get(ENDPOINTS.TITLE.EXPORT, {
    responseType: 'blob',
  })
  return res.data
}




