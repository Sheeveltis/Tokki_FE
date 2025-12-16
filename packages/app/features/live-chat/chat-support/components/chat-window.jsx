import React, { useState, useEffect, useRef } from 'react'
import { Card, Typography, Input, Button, Avatar, List, Spin, message as antMessage } from 'antd'
import { SendOutlined, UserOutlined } from '@ant-design/icons'
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode' 

import { CHAT_HUB } from '../../../../provider/api/hubConstants'
import { ENDPOINTS, API_BASE_URL } from '../../../../provider/api/endpoints' 
import { getAuthToken } from '../../../../provider/api/client'

const { Title, Text } = Typography

export const ChatWindow = ({ room, loadingJoin }) => {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [connection, setConnection] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  
  // Ref để tự cuộn xuống cuối
  const messagesEndRef = useRef(null)

  // Lấy User Info của Khách hàng
  const user = room?.user || {}

  // Lấy Token và MyUserId (ID của Staff đang đăng nhập)
  // Dùng getAuthToken để đồng bộ với toàn hệ thống (localStorage key = 'token')
  const token = getAuthToken()
  let myUserId = ''
  try {
    if (token) {
        const decoded = jwtDecode(token)
        // Lấy field ID tuỳ theo cấu hình Token của bạn (thường là 'sub', 'nameid', hoặc 'UserId')
        myUserId = decoded.UserId || decoded.sub || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
    }
  } catch (e) {
    console.error("Lỗi decode token:", e)
  }

  // 1. Load Lịch sử Chat (REST API) khi đổi phòng
  useEffect(() => {
    console.log('[ChatSupport] useEffect history – roomId, hasToken:', room?.id, !!token)
    if (!room?.id || !token) return

    const fetchHistory = async () => {
      console.log('[ChatSupport] 2. Fetch history for room:', room.id)
      setLoadingHistory(true)
      try {
        const url = `${API_BASE_URL}${ENDPOINTS.LIVE_CHAT.GET_HISTORY(room.id)}`
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        // API trả về data chuẩn OperationResult
        if (res.data?.data) {
          console.log('[ChatSupport] History loaded for room', room.id, res.data.data)
          setMessages(res.data.data)
        } else {
          console.log('[ChatSupport] History empty for room', room.id, res.data)
        }
      } catch (error) {
        console.error('[ChatSupport] Lỗi tải history:', error)
        antMessage.error("Không thể tải lịch sử chat")
      } finally {
        setLoadingHistory(false)
      }
    }

    fetchHistory()
  }, [room?.id, token])

  // 2. Kết nối SignalR (WebSocket)
  useEffect(() => {
    if (!token || !room?.id) return

    const newConnection = new HubConnectionBuilder()
      .withUrl(CHAT_HUB.HUB_URL, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None) // Tắt log cho đỡ rối console
      .build()

    newConnection.start()
      .then(() => {
        console.log('✅ Connected SignalR')
        
        // Join vào phòng chat hiện tại
        newConnection.invoke(CHAT_HUB.METHODS.JOIN_ROOM, room.id)

        // Lắng nghe tin nhắn mới
        newConnection.on(CHAT_HUB.EVENTS.RECEIVE_MESSAGE, (msg) => {
          console.log('[ChatSupport] ReceiveMessage from hub:', msg)
          // Chỉ nhận tin nhắn của phòng này
          if (msg.roomId === room.id) {
            setMessages(prev => [...prev, msg])
          }
        })

        setConnection(newConnection)
      })
      .catch(err => console.error('❌ Connection failed: ', err))

    // Cleanup khi component unmount hoặc đổi phòng
    return () => {
      if (newConnection) {
        newConnection.off(CHAT_HUB.EVENTS.RECEIVE_MESSAGE)
        newConnection.stop()
      }
    }
  }, [room?.id, token])

  // 3. Tự cuộn xuống dưới cùng khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 4. Hàm gửi tin nhắn
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !connection) return

    try {
      await connection.invoke(CHAT_HUB.METHODS.SEND_MESSAGE, room.id, inputValue)
      setInputValue('') // Xóa ô nhập
      // Lưu ý: Không cần setMessages ở đây, vì SignalR sẽ bắn event ReceiveMessage về lại cho mình
    } catch (e) {
      console.error('Gửi tin nhắn thất bại:', e)
      antMessage.error('Gửi lỗi!')
    }
  }

  // Handle phím Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // --- RENDER ---

  if (!room) {
    return (
      <Card style={{ flex: 1, height: '100%' }}>
        <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999' }}>
          <Text type="secondary">Vui lòng chọn người dùng từ danh sách bên trái</Text>
        </div>
      </Card>
    )
  }

  return (
    <Card
      style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}
      bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px', overflow: 'hidden' }} // Quan trọng để layout full chiều cao
      title={
        <div>
          <Title level={4} style={{ margin: 0 }}>
            {user.name || 'Người dùng'}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {user.email} - Room: {room.id}
          </Text>
        </div>
      }
    >
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px', marginBottom: '10px' }}>
        {loadingHistory || loadingJoin ? (
          <div style={{ textAlign: 'center', marginTop: 20 }}><Spin /></div>
        ) : (
          <List
            dataSource={messages}
            split={false}
            renderItem={(item, index) => {
              const isMyMessage = item.senderId === myUserId
              const currentTime = item.createdAt ? new Date(item.createdAt).getTime() : 0

              // Quy tắc hiển thị tên sender:
              // - Chỉ cho tin nhắn của khách (không phải staff)
              // - Hiện nếu là tin đầu tiên HOẶC khác sender HOẶC cách tin trước > 2 phút
              let showSenderName = false
              if (!isMyMessage) {
                if (index === 0) {
                  showSenderName = true
                } else {
                  const prev = messages[index - 1]
                  const sameSender = prev && prev.senderId === item.senderId
                  const prevTime = prev && prev.createdAt ? new Date(prev.createdAt).getTime() : 0
                  const diffMs = currentTime - prevTime
                  const diffMinutes = diffMs / 60000
                  if (!sameSender || diffMinutes > 2) {
                    showSenderName = true
                  }
                }
              }

              return (
                <List.Item
                  style={{
                    display: 'flex',
                    justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
                    padding: '4px 0',
                    border: 'none',
                  }}
                >
                  {!isMyMessage && (
                    <Avatar icon={<UserOutlined />} src={item.senderAvatar} style={{ marginRight: 8 }} />
                  )}

                  <div style={{ maxWidth: '70%' }}>
                    {showSenderName && (
                      <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 2, color: '#555' }}>
                        {item.senderName || 'Khách hàng'}
                      </div>
                    )}
                    <div
                      style={{
                        backgroundColor: isMyMessage ? '#1890ff' : '#f0f2f5',
                        color: isMyMessage ? '#fff' : '#000',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        borderTopRightRadius: isMyMessage ? '2px' : '12px',
                        borderTopLeftRadius: !isMyMessage ? '2px' : '12px',
                        wordWrap: 'break-word',
                      }}
                    >
                      <Text style={{ color: 'inherit' }}>{item.content}</Text>
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: '#999',
                        textAlign: isMyMessage ? 'right' : 'left',
                        marginTop: '2px',
                      }}
                    >
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </div>
                  </div>

                  {isMyMessage && (
                    <Avatar icon={<UserOutlined />} src={item.senderAvatar} style={{ marginLeft: 8 }} />
                  )}
                </List.Item>
              )
            }}
          />
        )}
        {/* Div ảo để scroll xuống cuối */}
        <div ref={messagesEndRef} />
      </div>

      {/* KHUNG NHẬP LIỆU (FOOTER) */}
      <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
        <Input
          placeholder="Nhập tin nhắn..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!connection} // Chỉ cho nhập khi đã kết nối socket
          style={{ borderRadius: '20px' }}
        />
        <Button 
            type="primary" 
            shape="circle" 
            icon={<SendOutlined />} 
            onClick={handleSendMessage}
            disabled={!connection || !inputValue.trim()}
        />
      </div>
    </Card>
  )
}