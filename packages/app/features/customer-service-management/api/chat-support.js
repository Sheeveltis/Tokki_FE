import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

export const requestSupport = async () => {
  const res = await apiClient.post(ENDPOINTS.LIVE_CHAT.REQUEST_SUPPORT)
  // API trả về: { isSuccess, data: "roomId", ... }
  return res?.data?.data
}

/**
 * Lấy lịch sử chat của 1 room
 * GET Chat/{roomId}/history
 */
export const getChatHistory = async (roomId) => {
  try {
    const res = await apiClient.get(ENDPOINTS.LIVE_CHAT.GET_HISTORY(roomId))
    // Giả sử format OperationResult: { isSuccess, data: [...] }
    return res?.data?.data || []
  } catch (error) {
    console.error('Error fetching chat history:', error)
    throw error
  }
}
/**
 * Lấy danh sách support requests đang pending (Dành cho Staff/Admin)
 */
export const getPendingSupport = async () => {
  try {
    const res = await apiClient.get(ENDPOINTS.LIVE_CHAT.GET_PENDING_SUPPORT)
    // Giả sử API trả về { data: [...] } hoặc mảng trực tiếp
    const data = res?.data?.data || res?.data
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error fetching pending support:", error)
    return []
  }
}

/**
 * Lấy danh sách rooms mà Staff đang tham gia
 */
export const getMyRooms = async () => {
  try {
    const res = await apiClient.get(ENDPOINTS.LIVE_CHAT.GET_MY_ROOMS)
    const data = res?.data?.data || res?.data
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error fetching my rooms:", error)
    return []
  }
}

/**
 * Staff join vào support room
 */
export const joinSupport = async (roomId) => {
  try {
    const res = await apiClient.post(ENDPOINTS.LIVE_CHAT.JOIN_SUPPORT(roomId))
    return res?.data?.data || res?.data
  } catch (error) {
    console.error("Error joining support room:", error)
    throw error
  }
}

/**
 * Đóng phòng chat (Staff kết thúc hỗ trợ)
 */
export const closeSupport = async (roomId) => {
  try {
    const res = await apiClient.put(ENDPOINTS.LIVE_CHAT.CLOSE_SUPPORT(roomId))
    return res?.data?.data || res?.data
  } catch (error) {
    console.error("Error closing support room:", error)
    throw error
  }
}