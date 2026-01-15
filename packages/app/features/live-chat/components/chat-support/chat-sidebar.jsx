import React, { useState, useEffect } from 'react'
import { Card, List, Avatar, Input, Typography, Tag, Tabs } from 'antd'
import { UserOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { Search } = Input

export const ChatSidebar = ({
  pendingRooms = [],
  myRooms = [],
  loading,
  selectedRoomId,
  onSelectRoom,
}) => {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    console.log('Current Tab:', activeTab)
    console.log('Data Pending:', pendingRooms)
    console.log('Data MyRooms:', myRooms)
  }, [pendingRooms, myRooms, activeTab])

  const currentDataSource = activeTab === 'pending' ? pendingRooms : myRooms

  const filteredData = currentDataSource.filter((room) => {
    const name = room?.roomName || ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  const renderList = (data) => (
    <List
      loading={loading}
      dataSource={data}
      rowKey="chatRoomId"
      style={{ maxHeight: 'calc(95vh - 350px)', overflowY: 'auto' }}
      renderItem={(room) => {
        const currentId = room?.chatRoomId

        if (!currentId) console.warn('Phòng bị thiếu ID:', room)

        const isSelected = selectedRoomId === currentId

        return (
          <List.Item
            style={{
              cursor: 'pointer',
              backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
              padding: '12px',
              borderRadius: 8,
              marginBottom: 8,
              border: isSelected ? '1px solid #1890ff' : '1px solid transparent',
            }}
            onClick={() => {
              const roomDataForParent = {
                ...room,
                id: room.chatRoomId,
              }
              onSelectRoom(roomDataForParent, activeTab === 'pending')
            }}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  icon={room?.isGroup ? <TeamOutlined /> : <UserOutlined />}
                  src={room?.roomAvatar}
                />
              }
              title={<Text strong>{room?.roomName || 'Không tên'}</Text>}
              description={
                <div>
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
          <Title level={4} style={{ margin: 15, textAlign: 'center' }}>
            Khung chat
          </Title>
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
