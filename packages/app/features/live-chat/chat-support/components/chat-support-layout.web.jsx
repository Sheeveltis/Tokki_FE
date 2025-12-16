import React from 'react'
import { ChatSidebar } from './chat-sidebar'
import { ChatWindow } from './chat-window'

/**
 * ChatSupportLayout: Bố cục trang Chat Support
 * * Nguyên tắc: CHỈ sắp xếp component.
 * KHÔNG chứa logic gọi API.
 * * @param {{
 * pendingRooms: Array,
 * myRooms: Array,
 * selectedRoom: Object,
 * loading: boolean,
 * loadingJoin: boolean,
 * onSelectRoom: (room, isPending) => void
 * }} props
 */
export function ChatSupportLayout({
  // Data props
  pendingRooms,
  myRooms,
  selectedRoom,
  loading,
  loadingJoin,
  
  // Action props
  onSelectRoom,
}) {
  return (
    <div style={styles.root}>
      {/* Cột trái: Sidebar danh sách */}
      <div style={styles.leftCol}>
        <ChatSidebar 
          pendingRooms={pendingRooms}
          myRooms={myRooms}
          loading={loading}
          selectedRoomId={selectedRoom?.id}
          onSelectRoom={onSelectRoom}
        />
      </div>

      {/* Cột phải: Khung chat */}
      <div style={styles.rightCol}>
        <ChatWindow 
          room={selectedRoom}
          loadingJoin={loadingJoin}
        />
      </div>
    </div>
  )
}

// Styles object (giữ nguyên CSS bạn muốn)
const styles = {
  root: {
    padding: 24,
    display: 'flex',
    gap: 16,
    height: 'calc(100vh - 120px)', // Chiều cao cố định để scroll bên trong
    backgroundColor: '#f0f2f5', // Thêm màu nền nhẹ cho tách biệt
  },
  leftCol: {
    width: 320, // Kích thước cố định giống HomeLayout sidebar
    flexShrink: 0,
    height: '100%',
  },
  rightCol: {
    flex: 1, // Chiếm hết phần còn lại
    height: '100%',
    minWidth: 0, // Tránh lỗi flexbox overflow text
  }
}