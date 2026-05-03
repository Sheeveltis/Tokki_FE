import React, { useState, useEffect, useRef } from 'react'
import { Card, Typography, Input, Button, Avatar, List, Spin, message as antMessage } from 'antd'
import { SendOutlined, UserOutlined } from '@ant-design/icons'
import { HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

import { CHAT_HUB } from '../../../../provider/api/hubConstants'
import { ENDPOINTS, API_BASE_URL } from '../../../../provider/api/endpoints'
import { getAuthToken } from '../../../../provider/api/client'

const { Title, Text } = Typography

export const ChatWindow = ({ room, loadingJoin, onCloseRoom, onJoinRoom, userRole, isMember, mode }) => {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [connection, setConnection] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const messagesEndRef = useRef(null)

  const user = room?.user || {}

  const token = getAuthToken()
  let myUserId = ''
  try {
    if (token) {
      const decoded = jwtDecode(token)
      myUserId =
        decoded.UserId ||
        decoded.sub ||
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
    }
  } catch (e) {
    console.error('Lỗi decode token:', e)
  }

  useEffect(() => {
    console.log('[ChatSupport] useEffect history – roomId, hasToken:', room?.id, !!token)
    if (!room?.id || !token) return

    const fetchHistory = async () => {
      console.log('[ChatSupport] 2. Fetch history for room:', room.id)
      setLoadingHistory(true)
      try {
        const url = `${API_BASE_URL}${ENDPOINTS.LIVE_CHAT.GET_HISTORY(room.id)}`
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.data?.data) {
          console.log('[ChatSupport] History loaded for room', room.id, res.data.data)
          setMessages(res.data.data)
        } else {
          console.log('[ChatSupport] History empty for room', room.id, res.data)
        }
      } catch (error) {
        console.error('[ChatSupport] Lỗi tải history:', error)
        antMessage.error('Không thể tải lịch sử chat')
      } finally {
        setLoadingHistory(false)
      }
    }

    fetchHistory()
  }, [room?.id, token])

  useEffect(() => {
    if (!token || !room?.id) return

    const newConnection = new HubConnectionBuilder()
      .withUrl(CHAT_HUB.HUB_URL, {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
      .build()

    newConnection
      .start()
      .then(() => {
        console.log('✅ Connected SignalR')
        newConnection.invoke(CHAT_HUB.METHODS.JOIN_ROOM, room.id)

        newConnection.on(CHAT_HUB.EVENTS.RECEIVE_MESSAGE, (msg) => {
          console.log('[ChatSupport] ReceiveMessage from hub:', msg)
          if (msg.roomId === room.id) {
            setMessages((prev) => {
              // Nếu tin nhắn này đã tồn tại (check theo nội dung và thời gian gần đây) thì bỏ qua
              const isDuplicate = prev.some(m => 
                m.content === msg.content && 
                m.senderId === msg.senderId && 
                !m.id?.toString().startsWith('temp-')
              )
              if (isDuplicate) return prev

              // Thay thế tin nhắn tạm (nếu có)
              const tempIndex = prev.findIndex(m => 
                m.content === msg.content && 
                m.senderId === msg.senderId && 
                m.id?.toString().startsWith('temp-')
              )
              
              if (tempIndex !== -1) {
                const newMsgs = [...prev]
                newMsgs[tempIndex] = msg
                return newMsgs
              }

              return [...prev, msg]
            })
          }
        })

        newConnection.onreconnected((connectionId) => {
          console.log('✅ SignalR Reconnected (Admin). Re-joining room:', room.id)
          newConnection.invoke(CHAT_HUB.METHODS.JOIN_ROOM, room.id)
            .catch(err => console.error('❌ Admin re-join failed:', err))
        })

        newConnection.onreconnecting((err) => {
          console.warn('⚠️ SignalR Reconnecting (Admin)...', err)
        })

        setConnection(newConnection)
      })
      .catch((err) => console.error('❌ Connection failed: ', err))

    return () => {
      if (newConnection) {
        newConnection.off(CHAT_HUB.EVENTS.RECEIVE_MESSAGE)
        newConnection.stop()
      }
    }
  }, [room?.id, token])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !connection) return

    const content = inputValue.trim()
    setInputValue('')

    // Hiển thị ngay lập tức (Optimistic UI)
    const tempId = `temp-${Date.now()}`
    const tempMsg = {
      id: tempId,
      content,
      senderId: myUserId,
      senderName: 'Bạn',
      createdAt: new Date().toISOString(),
      roomId: room.id
    }
    setMessages((prev) => [...prev, tempMsg])

    try {
      await connection.invoke(CHAT_HUB.METHODS.SEND_MESSAGE, room.id, content)
    } catch (e) {
      console.error('Gửi tin nhắn thất bại:', e)
      antMessage.error('Gửi lỗi!')
      // Xóa tin nhắn tạm nếu gửi lỗi
      setMessages((prev) => prev.filter(m => m.id !== tempId))
      setInputValue(content)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!room) {
    return (
      <Card style={{ flex: 1, height: '100%' }}>
        <div
          style={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#999',
          }}
        >
          <Text type="secondary">Vui lòng chọn người dùng từ danh sách bên trái</Text>
        </div>
      </Card>
    )
  }

  return (
    <Card
      style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}
      styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', padding: '12px', overflow: 'hidden' } }}
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
      extra={
        isMember && mode === 'live' && (
          <Button
            danger
            type="primary"
            loading={isClosing}
            onClick={async () => {
              setIsClosing(true)
              try {
                await onCloseRoom(room.id)
              } finally {
                setIsClosing(false)
              }
            }}
          >
            Kết thúc tư vấn
          </Button>
        )
      }
    >
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px', marginBottom: '10px' }}>
        {loadingHistory || loadingJoin ? (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Spin />
          </div>
        ) : (
          <List
            dataSource={messages}
            split={false}
            renderItem={(item, index) => {
              const isMyMessage = item.senderId === myUserId
              const currentTime = item.createdAt ? new Date(item.createdAt).getTime() : 0

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
                    <Avatar icon={<UserOutlined />} src={item.senderAvatar || undefined} style={{ marginRight: 8 }} />
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
                    <Avatar icon={<UserOutlined />} src={item.senderAvatar || undefined} style={{ marginLeft: 8 }} />
                  )}
                </List.Item>
              )
            }}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {userRole === 1 && !isMember && mode === 'live' && (
        <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#fffbe6', borderRadius: '8px', marginBottom: '10px', border: '1px solid #ffe58f' }}>
          <Text type="warning" strong>Bạn đang ở chế độ xem lịch sử.</Text>
          <Button type="primary" size="small" style={{ marginLeft: 10 }} onClick={() => onJoinRoom(room.id)}>
            Tham gia hỗ trợ
          </Button>
        </div>
      )}

      {mode === 'history' && (
        <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '8px', marginBottom: '10px' }}>
          <Text type="secondary">Đây là phòng chat đã đóng. Bạn chỉ có thể xem lại lịch sử.</Text>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
        <Input
          placeholder={mode === 'history' ? "Chế độ xem lại" : (isMember ? "Nhập tin nhắn..." : "Tham gia để bắt đầu chat")}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!connection || loadingJoin || isClosing || !isMember || mode === 'history'}
          style={{ borderRadius: '20px' }}
        />
        <Button
          type="primary"
          shape="circle"
          icon={<SendOutlined />}
          onClick={handleSendMessage}
          disabled={!connection || !inputValue.trim() || !isMember || mode === 'history'}
        />
      </div>
    </Card>
  )
}
