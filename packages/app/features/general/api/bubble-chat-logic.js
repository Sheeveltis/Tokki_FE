import { requestSupport, getChatHistory, getMyRooms } from '../../customer-service-management/api/chat-support'
import { getAuthToken } from '../../../provider/api/client'
import { useChatSignalR } from './use-chat-signalr'
import { useEffect, useRef, useState } from 'react'

export const getUserIdFromToken = (token) => {
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload?.userId || payload?.sub || payload?.id || null
  } catch {
    return null
  }
}

// Hook gói toàn bộ logic chat, tách khỏi phần JSX render
export const useBubbleChatLogic = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isQueueing, setIsQueueing] = useState(false)
  const [hasSupporter, setHasSupporter] = useState(false) // Đã có nhân viên tham gia
  const [roomId, setRoomId] = useState(null) // Bỏ khởi tạo từ localStorage ngay lập tức
  const [isInitializing, setIsInitializing] = useState(true)
  const [inputMessage, setInputMessage] = useState('')
  const [loadingHistory, setLoadingHistory] = useState(false)

  const messagesEndRef = useRef(null)

  const token = getAuthToken()
  const currentUserId = getUserIdFromToken(token)
  const initialRoomIdFromLocal = typeof window !== 'undefined' ? localStorage.getItem('curr_chat_room') : null
  const { messages, setMessages, sendMessage, joinRoom, isConnected } = useChatSignalR(token, initialRoomIdFromLocal)

  const clearCurrentSession = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('curr_chat_room')
    }
    setRoomId(null)
    setMessages([])
    setIsQueueing(false)
    setHasSupporter(false)
  }

  // Hàm kiểm tra room hiện tại có hợp lệ với user này không
  const validateAndInitRoom = async () => {
    if (!token || !currentUserId) {
      clearCurrentSession()
      setIsInitializing(false)
      return
    }

    const storedRoomId = typeof window !== 'undefined' ? localStorage.getItem('curr_chat_room') : null
    
    if (!storedRoomId) {
      setIsInitializing(false)
      return
    }

    try {
      // Thay vì dùng getMyRooms, ta dùng handleLoadHistory để check quyền truy cập room
      // Nếu load được history -> room tồn tại và user có quyền
      await handleLoadHistory(storedRoomId)
      setRoomId(storedRoomId)
    } catch (err) {
      console.error('Lỗi validate room:', err)
      // Nếu lỗi 401, 403, 404 -> room không hợp lệ cho user này
      if (err.response && [401, 403, 404].includes(err.response.status)) {
        clearCurrentSession()
      }
    } finally {
      setIsInitializing(false)
    }
  }

  useEffect(() => {
    validateAndInitRoom()
  }, [token, currentUserId])

  // Join room SignalR khi roomId thay đổi
  useEffect(() => {
    const doJoinRoom = async () => {
      if (roomId && isConnected) {
        try {
          await joinRoom(roomId)
        } catch (err) {
          console.error('Lỗi join room SignalR:', err)
        }
      }
    }
    doJoinRoom()
  }, [roomId, isConnected])

  // Auto scroll khi có tin mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen, isQueueing])

  // Khi có tin nhắn từ staff -> đánh dấu đã có người hỗ trợ, tắt trạng thái queue
  useEffect(() => {
    if (!currentUserId || !messages?.length) return
    const hasStaffMessage = messages.some((m) => 
      (m.senderId && m.senderId !== currentUserId) || m.isSystem === true
    )
    if (hasStaffMessage) {
      setHasSupporter(true)
      setIsQueueing(false)
    }
  }, [messages, currentUserId])

  const handleLoadHistory = async (id) => {
    setLoadingHistory(true)
    try {
      const data = await getChatHistory(id) // data là mảng message từ API
      if (Array.isArray(data)) {
        const formatted = data.map((m) => ({
          ...m,
          isFromCurrentUser: m.senderId === currentUserId,
        }))
        setMessages(formatted)
      }
    } catch (e) {
      console.error('Lỗi load history:', e)
      if (e.response && (e.response.status === 404 || e.response.status === 400)) {
        clearCurrentSession()
      }
    } finally {
      setLoadingHistory(false)
    }
  }

  // Tạo room support: luôn trả về roomId string
  const createSupportRoom = async () => {
    const res = await requestSupport()
    // API: { isSuccess, data: "RbKTS...", ... }
    const roomIdFromApi = typeof res === 'string' ? res : res?.data ?? res?.chatRoomId ?? null

    return roomIdFromApi
  }

  const handleStartConsultation = async () => {
    setLoadingHistory(true)
    try {
      const newRoomId = await createSupportRoom()
      if (!newRoomId) throw new Error('Không nhận được roomId từ server')

      setRoomId(newRoomId)
      if (typeof window !== 'undefined') {
        localStorage.setItem('curr_chat_room', newRoomId)
      }
      setMessages([])

      if (isConnected) await joinRoom(newRoomId)

      setIsQueueing(true)
      setMessages([
        {
          id: `queue-${Date.now()}`,
          content: 'Đang kết nối với nhân viên tư vấn...',
          isFromCurrentUser: false,
          isSystem: true,
          meta: 'queue-message',
          timestamp: new Date().toISOString(),
        },
      ])
    } catch (err) {
      console.error('Lỗi tạo phòng:', err)
      alert('Không thể tạo phòng chat lúc này.')
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return
    if (!roomId) {
      console.error('Chưa có Room ID')
      return
    }
    if (!isConnected) {
      console.warn('Socket chưa kết nối, không thể gửi tin.')
      return
    }

    const content = inputMessage.trim()
    setInputMessage('')

    // Hiển thị tin nhắn ngay lập tức (Optimistic UI)
    const tempId = `temp-${Date.now()}`
    const newMessage = {
      id: tempId,
      content,
      isFromCurrentUser: true,
      senderId: currentUserId,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, newMessage])

    try {
      await sendMessage(roomId, content)
    } catch (err) {
      console.error('Gửi tin thất bại:', err)
      // Nếu lỗi, xóa tin nhắn tạm và khôi phục input
      setMessages((prev) => prev.filter(m => m.id !== tempId))
      setInputMessage(content)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return {
    // state
    isOpen,
    setIsOpen,
    isQueueing,
    hasSupporter,
    roomId,
    inputMessage,
    setInputMessage,
    loadingHistory,
    messages,
    messagesEndRef,
    isConnected,
    currentUserId,
    isInitializing,
    // handlers
    clearCurrentSession,
    handleStartConsultation,
    handleSendMessage,
    handleKeyPress,
  }
}
