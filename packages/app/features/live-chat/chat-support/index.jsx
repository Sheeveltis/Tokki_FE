'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { message } from 'antd'
import { ChatSupportLayout } from './components/chat-support-layout.web'
import { getPendingSupport, getMyRooms, joinSupport } from '../api/chatApi'
import { showAdminError } from 'components/HelperAdmin'

export function ChatSupport() {
  const [pendingRooms, setPendingRooms] = useState([])
  const [myRooms, setMyRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [loadingJoin, setLoadingJoin] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [pending, mine] = await Promise.all([
        getPendingSupport(),
        getMyRooms()
      ])
      setPendingRooms(pending)
      setMyRooms(mine)
    } catch (error) {
      console.error("Load chat data failed:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [loadData])

  const handleSelectRoom = async (room, isPendingList) => {
    // Không cho staff mở nhiều room cùng lúc
    if (selectedRoom && selectedRoom.id && selectedRoom.id !== room.id) {
      showAdminError(
        'Bạn chỉ được hỗ trợ 1 khách hàng tại một thời điểm. Vui lòng kết thúc phòng hiện tại trước.'
      )
      return
    }

    if (isPendingList) {
      try {
        setLoadingJoin(true)
        setSelectedRoom(room) 
        
        await joinSupport(room.id)
        message.success("Đã tiếp nhận hỗ trợ")
        
        await loadData() 
      } catch (error) {
        message.error("Lỗi khi tham gia phòng chat")
        setSelectedRoom(null)
      } finally {
        setLoadingJoin(false)
      }
    } else {
      setSelectedRoom(room)
    }
  }

  // --- 4. Render Layout ---
  return (
    <ChatSupportLayout 
      pendingRooms={pendingRooms}
      myRooms={myRooms}
      selectedRoom={selectedRoom}
      loading={loading}
      loadingJoin={loadingJoin}
      onSelectRoom={handleSelectRoom}
    />
  )
}

export default ChatSupport