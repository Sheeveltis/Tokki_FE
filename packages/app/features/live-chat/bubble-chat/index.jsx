import React, { useState } from 'react'
import { useBubbleChatLogic } from './bubbleChatLogic'
import ChatboxIcon from '../../../../assets/icon/icon-mainflow/chatbox.svg'
import PointDownSide from '../../../../assets/bunny/point-down-side.png'
import WaitingBubbleChat from '../../../../assets/bunny/waitting-bubble-chat.png'
import LogoText from '../../../../assets/logo-text.png'
import MinimizeIcon from '../../../../assets/icon/icon-mainflow/minimize.png'
import SendMessageIcon from '../../../../assets/icon/icon-mainflow/send-message.png'
import UserAvatar from '../../../../assets/user.png'
import './BubbleChat.css'
import { LoginRequest } from '../../../../components/loginRequest'
import { getAuthToken } from '../../../provider/api/client'

const BubbleChat = () => {
  const [showLoginRequest, setShowLoginRequest] = useState(false)

  const {
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
    clearCurrentSession,
    handleStartConsultation,
    handleSendMessage,
    handleKeyPress,
  } = useBubbleChatLogic()

  const handleToggleChat = () => {
    if (isOpen) {
      setIsOpen(false)
      return
    }

    const token = getAuthToken()
    if (token) {
      setIsOpen(true)
    } else {
      setShowLoginRequest(true)
    }
  }

  const renderMessageList = () => {
    const result = []
    
    messages.forEach((msg, index) => {
      const isMine = msg.isFromCurrentUser || (currentUserId && msg.senderId === currentUserId)
      const messageContent = msg.content || msg.message || msg.text || msg.contentText || ''

      if (!messageContent && !isMine) return

      // Tính thời gian tin nhắn
      const currentTime = msg.timestamp 
        ? new Date(msg.timestamp).getTime()
        : msg.createdAt
        ? new Date(msg.createdAt).getTime()
        : Date.now()

      const messageTime = msg.timestamp 
        ? new Date(msg.timestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})
        : msg.createdAt
        ? new Date(msg.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})
        : ''

      // Kiểm tra tin nhắn trước đó
      let isSequence = false
      let showTimeSeparator = false
      let isLastInGroup = true
      
      if (index > 0) {
        const prevMsg = messages[index - 1]
        const prevIsMine = prevMsg.isFromCurrentUser || (currentUserId && prevMsg.senderId === currentUserId)
        const prevTime = prevMsg.timestamp 
          ? new Date(prevMsg.timestamp).getTime()
          : prevMsg.createdAt
          ? new Date(prevMsg.createdAt).getTime()
          : Date.now()
        
        const timeDiff = (currentTime - prevTime) / 1000 / 60 // phút
        
        // Nếu cùng sender và cách nhau < 5 phút: grouping
        if (isMine === prevIsMine && timeDiff < 5) {
          isSequence = true
        } else {
          // Nếu cách nhau >= 5 phút hoặc khác sender: hiển thị thời gian
          showTimeSeparator = true
        }
      } else {
        // Tin nhắn đầu tiên luôn hiển thị thời gian
        showTimeSeparator = true
      }

      // Kiểm tra tin nhắn tiếp theo để xác định có phải là tin nhắn cuối trong nhóm không
      if (index < messages.length - 1) {
        const nextMsg = messages[index + 1]
        const nextIsMine = nextMsg.isFromCurrentUser || (currentUserId && nextMsg.senderId === currentUserId)
        const nextTime = nextMsg.timestamp 
          ? new Date(nextMsg.timestamp).getTime()
          : nextMsg.createdAt
          ? new Date(nextMsg.createdAt).getTime()
          : Date.now()
        
        const timeDiff = (nextTime - currentTime) / 1000 / 60 // phút
        
        // Nếu tin nhắn tiếp theo cùng sender và cách nhau < 5 phút: không phải cuối nhóm
        if (isMine === nextIsMine && timeDiff < 5) {
          isLastInGroup = false
        }
      }

      const senderName = !isMine ? (msg.senderName || 'Nhân viên hỗ trợ') : null
      const senderAvatar = !isMine ? (msg.senderAvatar || UserAvatar) : null

      // Hiển thị thời gian ở giữa nếu cần
      if (showTimeSeparator && index > 0) {
        result.push(
          <div key={`time-${index}`} className="message-time-separator">
            <span>{messageTime}</span>
          </div>
        )
      }

      // Render tin nhắn
      result.push(
        <div key={index} className={`message ${isMine ? 'message-sent' : 'message-received'} ${isSequence ? 'middle-of-group' : 'first-of-group'}`}>
          {!isMine && isLastInGroup && messageContent && (
            <div className="message-avatar-container">
              <img 
                src={senderAvatar} 
                alt={senderName} 
                className="message-avatar"
                onError={(e) => {
                  e.target.src = UserAvatar
                }}
              />
            </div>
          )}
          <div className="message-content-wrapper">
            {!isMine && !isSequence && messageContent && (
              <div className="message-sender-name">{senderName}</div>
            )}
            <div className="message-content message-bubble">{messageContent}</div>
            {!isSequence && (
              <div className="message-time">
                {messageTime}
              </div>
            )}
          </div>
        </div>
      )
    })

    return result
  }

  return (
    <div className="bubble-chat-container">
      {showLoginRequest && (
        <div 
          style={{
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            zIndex: 99999, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
          }}
          onClick={() => setShowLoginRequest(false)} 
        >
          <div onClick={(e) => e.stopPropagation()}>
             <LoginRequest onClose={() => setShowLoginRequest(false)} />
          </div>
        </div>
      )}

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <img src={LogoText} alt="Tokki" className="chat-logo" />
            </div>
            <div style={{position: 'absolute', right: '16px', display: 'flex', gap: '5px', alignItems: 'center'}}>
                <button className="close-btn minimize-btn" onClick={() => setIsOpen(false)}>
                  <img src={MinimizeIcon} alt="Minimize" className="minimize-icon" />
                </button>
            </div>
          </div>

          {isQueueing && isConnected && !hasSupporter && (
            <div className="chat-queue-status">
              <div className="waiting-bunny-container">
                <img src={WaitingBubbleChat} alt="Waiting" className="waiting-bunny" />
              </div>
              <p>Đang kết nối nhân viên tư vấn... <br/>
              Bạn có thể để lại lời nhắn, nhân viên sẽ trả lời ngay khi vào phòng.</p>
            </div>
          )}

          <div className="chat-messages">
            {!roomId ? (
              <div className="welcome-message">
                <div className="point-down-bunny-container">
                  <img src={PointDownSide} alt="Point down" className="point-down-bunny" />
                </div>
                <p>Xin chào! 👋</p>
                <p>Tokki Support rất vui được hỗ trợ bạn.</p>
                <button 
                  className="send-btn start-chat-btn" 
                  onClick={handleStartConsultation} 
                  disabled={loadingHistory || !isConnected}
                >
                  {loadingHistory ? 'Đang tải...' : 'Tư vấn ngay'}
                </button>
              </div>
            ) : (
              <>
                 {renderMessageList()}
                 <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {roomId && (
            <div className="chat-input-container">
              <input
                type="text"
                className="chat-input"
                placeholder="Vui lòng nhập tin nhắn..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!isConnected}
              />
              <button
                className="send-btn"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || !isConnected}
              >
                <img src={SendMessageIcon} alt="Send" className="send-icon" />
              </button>
            </div>
          )}
        </div>
      )}

      <button 
        className="chat-bubble-btn" 
        onClick={handleToggleChat}
      >
        <img
          src={typeof ChatboxIcon === 'string' ? ChatboxIcon : ChatboxIcon?.src}
          alt="Chat"
          className="chat-icon"
        />
        {!isOpen && messages && messages.length > 0 && (
          <span className="notification-badge">{messages.length}</span>
        )}
      </button>
    </div>
  )
}

export default BubbleChat