import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

export const requestSupport = async () => {
  const res = await apiClient.post(ENDPOINTS.LIVE_CHAT.REQUEST_SUPPORT)
  // API tráº£ vá»: { isSuccess, data: "roomId", ... }
  return res?.data?.data
}

export const getActiveSupportRoom = async () => {
  try {
    const res = await apiClient.get(ENDPOINTS.LIVE_CHAT.GET_ACTIVE_SUPPORT)
    return res?.data?.data
  } catch (error) {
    console.error('Error fetching active support room:', error)
    return null
  }
}

/**
 * Láº¥y lá»‹ch sá»­ chat cá»§a 1 room
 * GET Chat/{roomId}/history
 */
export const getChatHistory = async (roomId) => {
  try {
    const res = await apiClient.get(ENDPOINTS.LIVE_CHAT.GET_HISTORY(roomId))
    // Giáº£ sá»­ format OperationResult: { isSuccess, data: [...] }
    return res?.data?.data || []
  } catch (error) {
    console.error('Error fetching chat history:', error)
    throw error
  }
}
/**
 * Láº¥y danh sĂ¡ch support requests Ä‘ang pending (DĂ nh cho Staff/Admin)
 */
export const getPendingSupport = async () => {
  try {
    const res = await apiClient.get(ENDPOINTS.LIVE_CHAT.GET_PENDING_SUPPORT)
    // Giáº£ sá»­ API tráº£ vá» { data: [...] } hoáº·c máº£ng trá»±c tiáº¿p
    const data = res?.data?.data || res?.data
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error fetching pending support:", error)
    return []
  }
}

/**
 * Láº¥y Táº¤T Cáº¢ cĂ¡c support requests Ä‘ang hoáº¡t Ä‘á»™ng (DĂ nh cho Admin)
 */
export const fetchActiveSupportsAll = async () => {
  try {
    const res = await apiClient.get('/Chat/support/active-all')
    const data = res?.data?.data || res?.data
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error fetching all active supports:", error)
    return []
  }
}

/**
 * Láº¥y danh sĂ¡ch rooms mĂ  Staff Ä‘ang tham gia
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
 * Staff join vĂ o support room
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
 * ÄĂ³ng phĂ²ng chat (Staff káº¿t thĂºc há»— trá»£)
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
/**
 * L?y danh sách các ph?ng support đ? đóng (L?ch s?)
 */
export const getClosedSupportRooms = async (days = 30, search = '') => {
  try {
    const res = await apiClient.get('/Chat/support/history', {
      params: { days, search }
    })
    const data = res?.data?.data || res?.data
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching closed support rooms:', error)
    return []
  }
}
