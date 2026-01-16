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
  pendingRooms,
  myRooms,
  selectedRoom,
  loading,
  loadingJoin,
  onSelectRoom,
}) {
  return (
    <div style={styles.root}>
      <div style={styles.leftCol}>
        <ChatSidebar
          pendingRooms={pendingRooms}
          myRooms={myRooms}
          loading={loading}
          selectedRoomId={selectedRoom?.id}
          onSelectRoom={onSelectRoom}
        />
      </div>

      <div style={styles.rightCol}>
        <ChatWindow room={selectedRoom} loadingJoin={loadingJoin} />
      </div>
    </div>
  )
}

const styles = {
  root: {
    padding: 24,
    display: 'flex',
    gap: 16,
    height: 'calc(100vh - 120px)',
    backgroundColor: '#f0f2f5',
  },
  leftCol: {
    width: 320,
    flexShrink: 0,
    height: '100%',
  },
  rightCol: {
    flex: 1,
    height: '100%',
    minWidth: 0,
  },
}
