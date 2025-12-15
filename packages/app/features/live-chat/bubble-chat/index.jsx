import React from 'react'
import { useBubbleChatLogic } from './bubbleChatLogic'
import ChatboxIcon from '../../../../assets/icon/icon-mainflow/chatbox.svg'
import './BubbleChat.css'

const BubbleChat = () => {
  const renderMessageList = () => {
    return messages.map((msg, index) => {
      const isMine = msg.isFromCurrentUser || (currentUserId && msg.senderId === currentUserId)
      const messageContent = msg.content || msg.message || msg.text || msg.contentText || ''

      if (!messageContent && !isMine) return null
      
      let isSequence = false
      if (index > 0) {
        const prevMsg = messages[index - 1]
        const prevIsMine = prevMsg.isFromCurrentUser || (currentUserId && prevMsg.senderId === currentUserId)
        if (isMine === prevIsMine) isSequence = true 
      }

      return (
        <div key={index} className={`message ${isMine ? 'message-sent' : 'message-received'} ${isSequence ? 'middle-of-group' : 'first-of-group'}`}>
          {!isMine && !isSequence && messageContent && <div className="message-avatar">🐰</div>}
          <div className="message-content message-bubble">{messageContent}</div>
          {(!isSequence) && (
             <div className="message-time">
                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : ''}
             </div>
          )}
        </div>
      )
    })
  }

  const {
    isOpen,
    setIsOpen,
    isQueueing,
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

  return (
    <div className="bubble-chat-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <h3>CSKH Tokki</h3>
              <span className="chat-status" style={{color: isConnected ? '#4caf50' : '#f44336'}}>
                {isConnected ? '● Trực tuyến' : '○ Mất kết nối'}
              </span>
            </div>
            <div style={{display: 'flex', gap: '5px'}}>
                {roomId && (
                    <button className="close-btn" style={{fontSize: '12px', width: 'auto', padding: '0 5px'}} onClick={clearCurrentSession}>
                        Kết thúc
                    </button>
                )}
                <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
            </div>
          </div>

          {isQueueing && isConnected && (
            <div className="chat-queue-status">
              Đang kết nối nhân viên tư vấn... <br/>
            </div>
          )}

          <div className="chat-messages">
            {!roomId ? (
              <div className="welcome-message">
                <p>Xin chào! 👋</p>
                <p>Tokki Support rất vui được hỗ trợ bạn.</p>
                <button 
                  className="send-btn start-chat-btn" 
                  onClick={handleStartConsultation} 
                  disabled={loadingHistory || !isConnected}
                >
                  {loadingHistory ? 'Đang tải...' : 'Bắt đầu tư vấn'}
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
                placeholder="Nhập tin nhắn..."
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
                Gửi
              </button>
            </div>
          )}
        </div>
      )}

      <button className="chat-bubble-btn" onClick={() => setIsOpen(!isOpen)}>
        {/* ChatboxIcon có thể là string URL hoặc object (Next static import) */}
        <img
          src={typeof ChatboxIcon === 'string' ? ChatboxIcon : ChatboxIcon?.src}
          alt="Chat"
          className="chat-icon"
        />
        {!isOpen && messages.length > 0 && (
          <span className="notification-badge">{messages.length}</span>
        )}
      </button>
    </div>
  )
}

export default BubbleChat