import React, { useState, useEffect, useRef } from 'react'
import { Typography, Input, Button, Avatar, Spin, message as antMessage } from 'antd'
import { SendOutlined, UserOutlined, ArrowLeftOutlined, MoreOutlined, CheckCircleOutlined, LogoutOutlined } from '@ant-design/icons'
import { HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

import { CHAT_HUB } from '../../../../provider/api/hubConstants'
import { ENDPOINTS, API_BASE_URL } from '../../../../provider/api/endpoints'
import { getAuthToken } from '../../../../provider/api/client'
import './chat-support-style.css'

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
    if (!room?.id || !token) return

    const fetchHistory = async () => {
      setLoadingHistory(true)
      try {
        const url = `${API_BASE_URL}${ENDPOINTS.LIVE_CHAT.GET_HISTORY(room.id)}`
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.data?.data) {
          setMessages(res.data.data)
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

    // 1. Register listeners BEFORE starting
    newConnection.on(CHAT_HUB.EVENTS.RECEIVE_MESSAGE, (...args) => {
      console.log('[AdminChat] Msg received:', args);
      
      let incoming = null;
      if (args.length === 1 && typeof args[0] === 'object') {
        incoming = args[0];
      } else {
        const [user, message, timestamp] = args;
        incoming = {
          senderId: typeof user === 'object' ? user.id : null,
          senderName: typeof user === 'object' ? user.name : user,
          content: message,
          createdAt: timestamp || new Date().toISOString(),
          roomId: room.id // Assume it belongs to current room if received here
        };
      }

      // Check if message belongs to this room (if roomId is provided in msg)
      const msgRoomId = incoming.roomId || incoming.chatRoomId;
      if (msgRoomId && msgRoomId !== room.id && msgRoomId !== room.chatRoomId) {
        console.log('[AdminChat] Ignored message from other room:', msgRoomId);
        return;
      }

      setMessages((prev) => {
        const isDuplicate = prev.some(m =>
          (m.id && incoming.id && m.id === incoming.id) ||
          (m.content === incoming.content &&
           m.senderId === incoming.senderId &&
           Math.abs(new Date(m.createdAt).getTime() - new Date(incoming.createdAt).getTime()) < 2000 &&
           !m.id?.toString().startsWith('temp-'))
        )
        if (isDuplicate) return prev

        const tempIndex = prev.findIndex(m =>
          m.content === incoming.content &&
          m.senderId === incoming.senderId &&
          m.id?.toString().startsWith('temp-')
        )

        if (tempIndex !== -1) {
          const newMsgs = [...prev]
          newMsgs[tempIndex] = incoming
          return newMsgs
        }

        return [...prev, incoming]
      })
    })

    newConnection.onreconnected(async (connectionId) => {
      console.log('[AdminChat] Reconnected. Re-joining room:', room.id);
      try {
        await newConnection.invoke(CHAT_HUB.METHODS.JOIN_ROOM, room.id);
      } catch (err) {
        console.error('[AdminChat] Re-join room failed:', err);
      }
    });

    // 2. Start connection
    newConnection
      .start()
      .then(() => {
        console.log('[AdminChat] SignalR Connected');
        newConnection.invoke(CHAT_HUB.METHODS.JOIN_ROOM, room.id)
          .catch(err => console.error('[AdminChat] JoinRoom failed:', err));
        setConnection(newConnection)
      })
      .catch((err) => console.error('[AdminChat] Connection failed: ', err))

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
      antMessage.error('Gửi lỗi!')
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
      <div className="chat-window-container">
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Text type="secondary">Vui lòng chọn người dùng từ danh sách bên trái</Text>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-window-container">
      {/* Modern Header */}
      <div className="chat-header-modern">
        <div className="chat-header-user">
          <div style={{ position: 'relative' }}>
            <Avatar size={44} icon={<UserOutlined />} src={room?.roomAvatar} />
            <div className="user-status-dot" />
          </div>
          <div>
            <Title level={5} style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              {room?.roomName || 'Người dùng'}
            </Title>
            <div className="room-id-tag">
              ROOM: {room?.id || room?.chatRoomId}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isMember && mode === 'live' && (
            <Button
              className="btn-end-session"
              loading={isClosing}
              icon={<LogoutOutlined />}
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
          )}
        </div>
      </div>

      {/* Messages List */}
      <div className="chat-messages-modern">
        {loadingHistory || loadingJoin ? (
          <div style={{ textAlign: 'center', marginTop: 40 }}><Spin /></div>
        ) : (
          messages.map((item, index) => {
            const isMyMessage = item.senderId === myUserId
            const isSystemMessage = !item.senderId || item.senderId === 'system' || item.isSystem ||
              item.content?.includes('đã tham gia') || item.content?.includes('đã kết thúc')

            if (isSystemMessage) {
              return (
                <div key={item.id || index} className="system-message-container">
                  <div className="system-message-pill">
                    <CheckCircleOutlined style={{ color: '#31a24c', fontSize: 14 }} />
                    <span className="system-message-content">{item.content}</span>
                    <span className="system-message-time">
                      {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                </div>
              )
            }

            return (
              <div key={item.id || index} className={`message-row ${isMyMessage ? 'mine' : 'theirs'}`}>
                {!isMyMessage && (
                  <Avatar
                    size={28}
                    icon={<UserOutlined />}
                    src={item.senderAvatar}
                    style={{ marginRight: 8, marginTop: 'auto', marginBottom: 12 }}
                  />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '75%' }}>
                  <div className="message-bubble-modern">
                    {item.content}
                  </div>
                  <span className="message-time-modern">
                    {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Special Status Bar */}
      {userRole === 1 && !isMember && mode === 'live' && (
        <div style={{ textAlign: 'center', padding: '12px', background: '#fffbe6', borderTop: '1px solid #ffe58f' }}>
          <Text type="warning" strong style={{ fontSize: 13 }}>Bạn đang xem lịch sử.</Text>
          <Button type="primary" size="small" style={{ marginLeft: 12, borderRadius: 12 }} onClick={() => onJoinRoom(room.id)}>
            Tham gia hỗ trợ
          </Button>
        </div>
      )}

      {mode === 'history' && (
        <div style={{ textAlign: 'center', padding: '12px', background: '#f5f5f5' }}>
          <Text type="secondary" style={{ fontSize: 13 }}>Phòng chat đã đóng.</Text>
        </div>
      )}

      {/* Modern Footer Input */}
      <div className="chat-footer-modern">
        <div className="chat-input-wrapper">
          <Input
            placeholder={mode === 'history' ? "Chế độ xem lại" : (isMember ? "Nhập tin nhắn..." : "Tham gia để bắt đầu chat")}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!connection || loadingJoin || isClosing || !isMember || mode === 'history'}
            className="chat-input-modern"
          />
          <button
            className="send-button-modern"
            onClick={handleSendMessage}
            disabled={!connection || !inputValue.trim() || !isMember || mode === 'history'}
          >
            <SendOutlined />
          </button>
        </div>
      </div>
    </div>
  )
}

