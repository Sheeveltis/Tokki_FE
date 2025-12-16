import React, { useState, useEffect } from 'react'
import { Card, List, Avatar, Input, Typography, Tag, Tabs } from 'antd'
import { UserOutlined, SearchOutlined, TeamOutlined, CustomerServiceOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { Search } = Input

export const ChatSidebar = ({ 
  pendingRooms = [], 
  myRooms = [], 
  loading, 
  selectedRoomId, 
  onSelectRoom 
}) => {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('pending')

  // --- LOG KIỂM TRA (F12 để xem) ---
  // Kiểm tra xem dữ liệu vào có đúng cấu trúc API không
  useEffect(() => {
    console.log("Current Tab:", activeTab);
    console.log("Data Pending:", pendingRooms);
    console.log("Data MyRooms:", myRooms);
  }, [pendingRooms, myRooms, activeTab]);
  // ----------------------------------

  const currentDataSource = activeTab === 'pending' ? pendingRooms : myRooms

  const filteredData = currentDataSource.filter((room) => {
    // Thêm optional chaining (?.) để tránh crash nếu room null
    const name = room?.roomName || ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  const renderList = (data) => (
    <List
      loading={loading}
      dataSource={data}
      // QUAN TRỌNG: Antd List cần rowKey để biết đâu là ID duy nhất
      rowKey="chatRoomId" 
      style={{ maxHeight: 'calc(95vh - 350px)', overflowY: 'auto' }}
      renderItem={(room) => {
        // Lấy ID an toàn
        const currentId = room?.chatRoomId; 
        
        // Log nếu ID bị undefined
        if (!currentId) console.warn("Phòng bị thiếu ID:", room);

        // So sánh
        const isSelected = selectedRoomId === currentId;

        return (
          <List.Item
            style={{
              cursor: 'pointer',
              backgroundColor: isSelected ? '#e6f7ff' : 'transparent', // Màu xanh nhạt khi chọn
              padding: '12px',
              borderRadius: 8,
              marginBottom: 8,
              border: isSelected ? '1px solid #1890ff' : '1px solid transparent'
            }}
            onClick={() => {
              const roomDataForParent = { 
                  ...room, 
                  id: room.chatRoomId 
              };
              onSelectRoom(roomDataForParent, activeTab === 'pending');
            }}
          >
            <List.Item.Meta
              avatar={
                <Avatar 
                  icon={room?.isGroup ? <TeamOutlined /> : <UserOutlined />} 
                  src={room?.roomAvatar} 
                />
              }
              title={
                <Text strong>
                  {room?.roomName || 'Không tên'}
                </Text>
              }
              description={
                <div>
                   {/* Kiểm tra an toàn trước khi render */}
                  <div style={{ marginTop: 4 }}>
                    {room?.isSupport && <Tag color="blue">Hỗ trợ</Tag>}
                    {room?.isGroup && <Tag color="purple">Nhóm</Tag>}
                  </div>
                  <Text type="secondary" style={{ fontSize: 10 }}>
                    {room?.createdAt ? new Date(room.createdAt).toLocaleDateString('vi-VN') : ''}
                  </Text>
                </div>
              }
            />
          </List.Item>
        )
      }}
    />
  )

  const tabItems = [
    { key: 'pending', label: `Hàng chờ (${pendingRooms.length})`, children: renderList(filteredData) },
    { key: 'my-rooms', label: `Đang chat (${myRooms.length})`, children: renderList(filteredData) },
  ]

  return (
    <Card
      style={{ width: 320, flexShrink: 0 }}
      title={
        <div>
          <Title level={4} style={{ margin: 15, textAlign: 'center' }}>Khung chat</Title>
        </div>
      }
    >
      <Search
        placeholder="Tìm tên phòng..."
        allowClear
        prefix={<SearchOutlined />}
        style={{ marginBottom: 16 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Tabs 
        defaultActiveKey="pending" 
        items={tabItems} 
        onChange={setActiveTab} 
        size="small"
        tabBarStyle={{ marginBottom: 16 }}
      />
    </Card>
  )
}