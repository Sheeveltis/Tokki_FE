'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { message } from 'antd'
import { ChatSupportLayout } from '../components/chat-support/chat-support-layout.web'
import { getPendingSupport, getMyRooms, joinSupport, closeSupport, fetchActiveSupportsAll, getClosedSupportRooms } from '../api/chat-support'
import { fetchSystemConfigByKey } from '../../system/api/system-config'
import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'
import { showAdminError } from 'components/HelperAdmin'

export function ChatSupportScreen() {
  const [pendingRooms, setPendingRooms] = useState([])
  const [myRooms, setMyRooms] = useState([])
  const [closedRooms, setClosedRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [loadingJoin, setLoadingJoin] = useState(false)
  const [maxChatLimit, setMaxChatLimit] = useState(1)
  const [userRole, setUserRole] = useState(null)
  const [mode, setMode] = useState('live') // 'live' | 'history'
  const [historyDays, setHistoryDays] = useState(30)

  const loadData = useCallback(async () => {
    try {
      const res = await apiClient.get(ENDPOINTS.ACCOUNT.CURRENT_ROLE)
      const role = res?.data?.role
      setUserRole(role)

      const promises = [
        getPendingSupport(),
        getMyRooms(),
        fetchSystemConfigByKey('STAFF_MAX_CHAT_ROOMS')
      ]

      if (role === 1) {
        promises.push(fetchActiveSupportsAll())
      }

      const [pending, mine, config, allActive] = await Promise.all(promises)
      
      // Lọc trùng lặp dựa trên chatRoomId
      const uniqueAllActive = allActive ? Array.from(new Map(allActive.map(item => [item.chatRoomId, item])).values()) : []
      const uniquePending = pending ? Array.from(new Map(pending.map(item => [item.chatRoomId, item])).values()) : []
      const uniqueMine = mine ? Array.from(new Map(mine.map(item => [item.chatRoomId, item])).values()) : []

      setPendingRooms(role === 1 ? uniqueAllActive : uniquePending)
      setMyRooms(uniqueMine)
      
      if (config && config.value) {
        setMaxChatLimit(parseInt(config.value))
      }
    } catch (error) {
      console.error('Load chat data failed:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadHistory = useCallback(async (days) => {
    setLoading(true)
    try {
      const closed = await getClosedSupportRooms(days)
      setClosedRooms(closed)
    } catch (error) {
      message.error('Lỗi khi tải lịch sử chat')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (mode === 'live') {
      loadData()
      const interval = setInterval(loadData, 30000)
      return () => clearInterval(interval)
    } else if (userRole === 1) {
      loadHistory(historyDays)
    }
  }, [loadData, loadHistory, mode, historyDays, userRole])

  const handleSelectRoom = async (room, isPendingList) => {
    // Nếu là phòng đã đóng (Lịch sử) hoặc Admin đang ở mode history
    if (room.isClosed || mode === 'history') {
      setSelectedRoom(room)
      return
    }

    // Nếu là Admin ở mode live, chỉ xem chứ không tự động Join
    if (userRole === 1) {
      setSelectedRoom(room)
      return
    }

    // Đối với Staff: Kiểm tra giới hạn số phòng chat
    const activeRoomsCount = myRooms.filter(r => !r.isClosed).length
    
    if (isPendingList && activeRoomsCount >= maxChatLimit) {
      showAdminError(`Bạn chỉ được hỗ trợ tối đa ${maxChatLimit} khách hàng cùng lúc. Vui lòng kết thúc phiên hỗ trợ hiện tại.`)
      return
    }

    if (isPendingList) {
      try {
        setLoadingJoin(true)
        setSelectedRoom(room)

        await joinSupport(room.id)
        message.success('Đã tiếp nhận hỗ trợ')

        await loadData()
      } catch (error) {
        message.error('Lỗi khi tham gia phòng chat')
        setSelectedRoom(null)
      } finally {
        setLoadingJoin(false)
      }
    } else {
      setSelectedRoom(room)
    }
  }

  const handleCloseRoom = async (roomId) => {
    try {
      await closeSupport(roomId)
      message.success('Đã kết thúc phiên hỗ trợ')
      setSelectedRoom(null)
      await loadData()
    } catch (error) {
      message.error('Lỗi khi đóng phòng chat')
    }
  }

  const handleJoinRoom = async (roomId) => {
    try {
      setLoadingJoin(true)
      await joinSupport(roomId)
      message.success('Đã tham gia hỗ trợ')
      await loadData()
    } catch (error) {
      message.error('Lỗi khi tham gia phòng chat')
    } finally {
      setLoadingJoin(false)
    }
  }

  const isMember = selectedRoom && myRooms.some(r => r.chatRoomId === selectedRoom.id)

  return (
    <ChatSupportLayout
      pendingRooms={pendingRooms}
      myRooms={myRooms}
      closedRooms={closedRooms}
      selectedRoom={selectedRoom}
      loading={loading}
      loadingJoin={loadingJoin}
      onSelectRoom={handleSelectRoom}
      onCloseRoom={handleCloseRoom}
      onJoinRoom={handleJoinRoom}
      userRole={userRole}
      isMember={isMember}
      mode={mode}
      onModeChange={setMode}
      historyDays={historyDays}
      onHistoryDaysChange={(days) => {
        setHistoryDays(days)
        loadHistory(days)
      }}
    />
  )
}

export default ChatSupportScreen
