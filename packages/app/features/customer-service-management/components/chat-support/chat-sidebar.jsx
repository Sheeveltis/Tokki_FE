import { UserOutlined, SearchOutlined, TeamOutlined, HistoryOutlined, MessageOutlined } from '@ant-design/icons'
import { Card, List, Avatar, Input, Typography, Tag, Tabs, Radio, Select, Space } from 'antd'

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
  historyDays = 30,
  onHistoryDaysChange,
}) => {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('pending')

  const currentDataSource = mode === 'live' 
    ? (activeTab === 'pending' ? pendingRooms : myRooms)
    : closedRooms

  const filteredData = currentDataSource.filter((room) => {
    const name = room?.roomName || ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  const renderList = (data) => (
    <List
      loading={loading}
      dataSource={data}
      rowKey="chatRoomId"
      style={{ maxHeight: 'calc(95vh - 450px)', overflowY: 'auto' }}
      renderItem={(room) => {
        const currentId = room?.chatRoomId
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
              onSelectRoom(roomDataForParent, activeTab === 'pending' && mode === 'live')
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
                    {room?.isClosed && <Tag color="default">Đã đóng</Tag>}
                    {userRole === 1 && room?.staffName && (
                      <Tag color="orange">Staff: {room.staffName}</Tag>
                    )}
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

  const tabItems = mode === 'live' ? [
    { key: 'pending', label: userRole === 1 ? `Tất cả hỗ trợ (${pendingRooms.length})` : `Hàng chờ (${pendingRooms.length})`, children: renderList(filteredData) },
    { key: 'my-rooms', label: userRole === 1 ? `Đang trực tiếp (${myRooms.length})` : `Đang chat (${myRooms.length})`, children: renderList(filteredData) },
  ] : [
    { key: 'closed', label: `Lịch sử đã đóng (${closedRooms.length})`, children: renderList(filteredData) }
  ]

  return (
    <Card
      style={{ width: 320, flexShrink: 0 }}
      title={
        <Title level={4} style={{ margin: 15, textAlign: 'center' }}>
          Khung chat
        </Title>
      }
    >
      {userRole === 1 && (
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <Radio.Group value={mode} onChange={e => onModeChange(e.target.value)} buttonStyle="solid">
            <Radio.Button value="live"><MessageOutlined /> Trực tuyến</Radio.Button>
            <Radio.Button value="history"><HistoryOutlined /> Lịch sử</Radio.Button>
          </Radio.Group>
        </div>
      )}

      {mode === 'history' && (
        <div style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text size="small" type="secondary">Khoảng thời gian:</Text>
            <Select 
              value={historyDays} 
              onChange={onHistoryDaysChange} 
              style={{ width: '100%' }}
              options={[
                { value: 7, label: '7 ngày qua' },
                { value: 30, label: '30 ngày qua' },
                { value: 90, label: '3 tháng qua' },
                { value: 365, label: '1 năm qua' },
              ]}
            />
          </Space>
        </div>
      )}

      <Search
        placeholder="Tìm tên phòng..."
        allowClear
        prefix={<SearchOutlined />}
        style={{ marginBottom: 16 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      <Tabs
        activeKey={mode === 'live' ? activeTab : 'closed'}
        items={tabItems}
        onChange={setActiveTab}
        size="small"
        tabBarStyle={{ marginBottom: 16 }}
      />
    </Card>
  )
}
