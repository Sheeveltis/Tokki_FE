import { requestSupport, getChatHistory, getMyRooms, getActiveSupportRoom } from '../../customer-service-management/api/chat-support'
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

// Hook gói toàn bộ logic chat, tách khỏi phần JSX
export const useBubbleChatLogic = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isQueueing, setIsQueueing] = useState(false)
  const [hasSupporter, setHasSupporter] = useState(false) // Đã có nhân viên tham gia
  const [roomId, setRoomId] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isRoomClosed, setIsRoomClosed] = useState(false) // Trạng thái phòng đã đóng
  const [inputMessage, setInputMessage] = useState('')
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [messages, setMessagesState] = useState([])

  const messagesEndRef = useRef(null)

  const clearCurrentSession = () => {
    console.log('[BubbleChat] Clearing session...')
    if (typeof window !== 'undefined' && currentUserId) {
      localStorage.removeItem(`curr_chat_room_${currentUserId}`)
    }
    setRoomId(null)
    setMessagesState([])
    setIsQueueing(false)
    setHasSupporter(false)
    setIsRoomClosed(false)
  }

  const token = getAuthToken()
  const currentUserId = getUserIdFromToken(token)
  const chatStorageKey = currentUserId ? `curr_chat_room_${currentUserId}` : null
  const initialRoomIdFromLocal = (typeof window !== 'undefined' && chatStorageKey) ? localStorage.getItem(chatStorageKey) : null
  
  const { messages: signalRMessages, setMessages: setSignalRMessages, sendMessage, joinRoom, isConnected } = useChatSignalR(
    token, 
    initialRoomIdFromLocal,
    () => {
      console.log('[BubbleChat] Room was closed by server/admin')
      setIsRoomClosed(true)
    }
  )

  // Đồng bộ messages từ SignalR và local state
  useEffect(() => {
    if (signalRMessages) {
      setMessagesState(signalRMessages)
    }
  }, [signalRMessages])

  const setMessages = (setter) => {
    setSignalRMessages(setter)
    setMessagesState(setter)
  }

  const validateAndInitRoom = async () => {
    if (!token || !currentUserId) {
      clearCurrentSession()
      setIsInitializing(false)
      return
    }

    const storedRoomId = (typeof window !== 'undefined' && chatStorageKey) ? localStorage.getItem(chatStorageKey) : null
    
    if (!storedRoomId) {
      setIsInitializing(false)
      return
    }

    try {
      // 1. Kiểm tra xem trên server user thực sự đang có phòng nào active không
      const activeRoom = await getActiveSupportRoom()
      const activeRoomIdFromApi = typeof activeRoom === 'string' ? activeRoom : activeRoom?.id || activeRoom?.chatRoomId || null

      // Nếu không có phòng active trên server, nhưng trong local vẫn có roomId
      // thì ta vẫn load history để xem phòng đó đã đóng chưa (trường hợp User muốn xem lại)
      const targetRoomId = activeRoomIdFromApi || storedRoomId

      await handleLoadHistory(targetRoomId)
      setRoomId(targetRoomId)
      
      // Nếu không có trong danh sách active của server -> chắc chắn đã đóng
      if (!activeRoomIdFromApi) {
        setIsRoomClosed(true)
      }
    } catch (err) {
      console.error('Lỗi validate room:', err)
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

  useEffect(() => {
    const doJoinRoom = async () => {
      if (roomId && isConnected && !isRoomClosed) {
        try {
          await joinRoom(roomId)
        } catch (err) {
          console.error('Lỗi join room SignalR:', err)
        }
      }
    }
    doJoinRoom()
  }, [roomId, isConnected, isRoomClosed])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen, isQueueing])

  useEffect(() => {
    if (!currentUserId || !messages?.length) return
    
    const hasActualStaffMessage = messages.some((m) => {
      if (m.meta === 'queue-message') return false;
      if (m.senderId && String(m.senderId) !== String(currentUserId)) return true;
      if (m.isSystem && m.meta !== 'queue-message') return true;
      if (!m.isFromCurrentUser && m.senderId === null && !m.isSystem) return true;
      return false;
    });

    if (hasActualStaffMessage && !hasSupporter) {
      setHasSupporter(true);
      setIsQueueing(false);
      setMessages((prev) => prev.filter(m => m.meta !== 'queue-message'));
    }

    // Kiểm tra tin nhắn đóng phòng (Type 9)
    const hasClosedMsg = messages.some(m => 
      m.type === 9 || 
      (m.isSystem && m.content?.toUpperCase().includes('ĐÃ ĐƯỢC ĐÓNG'))
    );

    if (hasClosedMsg && !isRoomClosed) {
      setIsRoomClosed(true);
    }
  }, [messages, currentUserId, hasSupporter, isRoomClosed])

  const handleLoadHistory = async (id) => {
    setLoadingHistory(true)
    try {
      const data = await getChatHistory(id)
      if (Array.isArray(data)) {
        const formatted = data.map((m) => ({
          ...m,
          isFromCurrentUser: m.senderId === currentUserId,
        }))
        setMessages(formatted)

        // Kiểm tra xem trong lịch sử đã có tin nhắn đóng phòng chưa
        const hasClosedMsg = data.some(m => m.type === 9)
        if (hasClosedMsg) {
          setIsRoomClosed(true)
        }
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

  const createSupportRoom = async () => {
    const res = await requestSupport()
    return typeof res === 'string' ? res : res?.data ?? res?.chatRoomId ?? null
  }

  const handleStartConsultation = async () => {
    setLoadingHistory(true)
    try {
      const newRoomId = await createSupportRoom()
      if (!newRoomId) throw new Error('Không nhận được roomId từ server')

      setRoomId(newRoomId)
      if (typeof window !== 'undefined' && chatStorageKey) {
        localStorage.setItem(chatStorageKey, newRoomId)
      }
      setMessages([])
      setIsRoomClosed(false)

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
    if (!inputMessage.trim() || isRoomClosed) return
    if (!roomId) return
    if (!isConnected) return

    const content = inputMessage.trim()
    setInputMessage('')

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
    isOpen,
    setIsOpen,
    isQueueing,
    hasSupporter,
    roomId,
    isRoomClosed,
    inputMessage,
    setInputMessage,
    loadingHistory,
    messages,
    messagesEndRef,
    isConnected,
    currentUserId,
    isInitializing,
    clearCurrentSession,
    handleStartConsultation,
    handleSendMessage,
    handleKeyPress,
  }
}
