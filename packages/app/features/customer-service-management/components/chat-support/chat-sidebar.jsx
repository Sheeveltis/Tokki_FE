import React, { useState } from 'react'
import { UserOutlined, SearchOutlined, TeamOutlined, HistoryOutlined, MessageOutlined } from '@ant-design/icons'
import { Card, List, Avatar, Input, Typography, Tag, Tabs, Radio, Select, Space, Button, Modal } from 'antd'
import { LoginOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { Search } = Input

export const ChatSidebar = ({
  pendingRooms = [],
  myRooms = [],
  closedRooms = [],
  loading,
  selectedRoomId,
  onSelectRoom,
  userRole,
  mode = 'live',
  onModeChange,
  onJoinRoom,
  historyDays = 30,
  onHistoryDaysChange,
}) => {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('pending')

  const renderList = (data) => (
    <List
      loading={loading}
      dataSource={data}
      rowKey="chatRoomId"
      style={{ paddingBottom: 20 }}
      renderItem={(room) => {
        const currentId = room?.chatRoomId
        const isSelected = selectedRoomId === currentId
        const isJoined = myRooms.some(r => r.chatRoomId === currentId)

        return (
          <div
            className={isSelected ? 'chat-room-item-active' : ''}
            style={{
              cursor: 'pointer',
              padding: '16px',
              borderRadius: 16,
              marginBottom: 12,
              background: isSelected ? '#edf5ff' : '#f9f9f9',
              transition: 'all 0.2s ease',
              border: isSelected ? '1px solid #c2e0ff' : '1px solid transparent',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={() => {
              const roomDataForParent = { ...room, id: room.chatRoomId }
              onSelectRoom(roomDataForParent, activeTab === 'pending' && mode === 'live')
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div className="avatar-wrapper">
                  <Avatar
                    size={48}
                    icon={room?.isGroup ? <TeamOutlined /> : <UserOutlined />}
                    src={room?.roomAvatar}
                  />
                  <div className="avatar-status-dot" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#050505' }}>
                    {room?.roomName || 'Không tên'}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Tag color="blue" style={{ borderRadius: 8, border: 'none', background: '#e7f3ff', color: '#1877f2', fontWeight: 600 }}>Hỗ trợ</Tag>
                  </div>
                  {userRole === 1 && room?.staffName && (
                    <div style={{ fontSize: 12, color: '#65676b', marginTop: 4, fontStyle: 'italic' }}>
                      Staff: {room.staffName}
                    </div>
                  )}
                </div>
              </div>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {room?.createdAt ? new Date(room.createdAt).toLocaleDateString('vi-VN') : ''}
              </Text>
            </div>

            {activeTab === 'pending' && mode === 'live' && userRole === 1 && (
              <div className="join-btn-container">
                {isJoined ? (
                  <Button className="btn-joined-modern">
                    Đang tham gia
                  </Button>
                ) : (
                  <Button 
                    className="btn-join-modern"
                    onClick={(e) => {
                      e.stopPropagation();
                      Modal.confirm({
                        title: 'Xác nhận tham gia',
                        content: `Bạn có chắc chắn muốn tham gia hỗ trợ phòng của ${room?.roomName || 'người dùng này'}?`,
                        okText: 'Tham gia',
                        cancelText: 'Hủy',
                        onOk: () => onJoinRoom(room.chatRoomId)
                      });
                    }}
                  >
                    Tham gia
                  </Button>
                )}
              </div>
            )}
          </div>
        )
      }}
    />
  )

  const getFilteredData = (dataSource) => {
    return dataSource.filter((room) => {
      const name = room?.roomName || ''
      return name.toLowerCase().includes(search.toLowerCase())
    })
  }

  const tabItems = mode === 'live' ? [
    { 
      key: 'pending', 
      label: userRole === 1 ? `Tất cả hỗ trợ (${pendingRooms.length})` : `Hàng chờ (${pendingRooms.length})`, 
    },
    { 
      key: 'my-rooms', 
      label: userRole === 1 ? `Đang trực tiếp (${myRooms.length})` : `Đang chat (${myRooms.length})`, 
    },
  ] : [
    { 
      key: 'closed', 
      label: `Lịch sử đã đóng (${closedRooms.length})`, 
    }
  ]

  return (
    <div className="chat-sidebar-card" style={{ width: 350, flexShrink: 0, display: 'flex', flexDirection: 'column', background: '#fff', borderRight: '1px solid #f0f2f5' }}>
      <div style={{ padding: '24px 20px 16px' }}>
        {userRole === 1 && (
          <div className="mode-toggle-container">
            <div 
              className={`mode-toggle-item ${mode === 'live' ? 'active' : ''}`}
              onClick={() => onModeChange('live')}
            >
              <div className="status-dot-icon" />
              Trực tuyến
            </div>
            <div 
              className={`mode-toggle-item ${mode === 'history' ? 'active' : ''}`}
              onClick={() => onModeChange('history')}
            >
              <HistoryOutlined style={{ fontSize: 16 }} />
              Lịch sử
            </div>
          </div>
        )}

        <Input
          placeholder="Tìm tên phòng..."
          allowClear
          prefix={<SearchOutlined />}
          className="chat-search-modern"
          style={{ marginBottom: 16 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <Tabs
          activeKey={mode === 'live' ? activeTab : 'closed'}
          items={tabItems}
          onChange={setActiveTab}
          size="middle"
          centered
          tabBarStyle={{ marginBottom: 8, borderBottom: 'none' }}
        />
      </div>

      <div className="chat-list-container">
        {mode === 'history' && (
          <div style={{ paddingBottom: '12px' }}>
            <Select 
              value={historyDays} 
              onChange={onHistoryDaysChange} 
              style={{ width: '100%' }}
              bordered={false}
              className="chat-history-select"
              options={[
                { value: 7, label: '7 ngày qua' },
                { value: 30, label: '30 ngày qua' },
                { value: 90, label: '3 tháng qua' },
                { value: 365, label: '1 năm qua' },
              ]}
            />
          </div>
        )}
        {renderList(getFilteredData(
          mode === 'live' 
            ? (activeTab === 'pending' ? pendingRooms : myRooms)
            : closedRooms
        ))}
      </div>
    </div>
  )
}


