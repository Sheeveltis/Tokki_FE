'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, Descriptions, Image, Tag, Space, Button, Table, Typography, Empty, Tooltip, Tabs, Row, Col, Badge, Divider } from 'antd'
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  EyeOutlined, 
  InfoCircleOutlined, 
  FileTextOutlined, 
  HistoryOutlined, 
  GlobalOutlined,
  UserOutlined,
  CalendarOutlined,
  TagOutlined
} from '@ant-design/icons'
import { fetchUserDetail } from 'app/features/user/api/user-detail'

const { Text } = Typography

// Helper format ngày tháng
const formatDate = (date) => {
  if (!date) return '-'
  try {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return date
  }
}

// Map trạng thái
const STATUS_MAP = {
  0: { dotColor: '#bfbfbf' },
  1: { dotColor: '#52c41a' },
  2: { dotColor: '#ff4d4f' },
}

export function VocabularyInfoCard({ vocab, onAddExample, onEditExample, onDeleteExample, deletingExampleId }) {
  const [creatorName, setCreatorName] = useState('')
  const [updaterName, setUpdaterName] = useState('')
  const [exampleUserNames, setExampleUserNames] = useState({})

  const topics = useMemo(() => (Array.isArray(vocab?.topics) ? vocab.topics : []), [vocab?.topics])
  const examples = useMemo(() => (Array.isArray(vocab?.examples) ? vocab.examples : []), [vocab?.examples])


  const creatorId = vocab?.createBy || '';
  const updaterId = vocab?.updateBy || '';

  useEffect(() => {
    let isMounted = true
    const loadUser = async (id, setter) => {
      if (!id) return
      try {
        const user = await fetchUserDetail(id)
        if (isMounted && user) setter(user.fullName || user.email || id)
      } catch {
        if (isMounted) setter(id)
      }
    }

    if (creatorId && creatorId === updaterId) {
      loadUser(creatorId, (name) => {
        setCreatorName(name)
        setUpdaterName(name)
      })
    } else {
      loadUser(creatorId, setCreatorName)
      loadUser(updaterId, setUpdaterName)
    }
    return () => { isMounted = false }
  }, [creatorId, updaterId])

  useEffect(() => {
    let isMounted = true
    const uniqueUserIds = Array.from(new Set(examples.map((ex) => ex.createBy).filter(Boolean)))
    if (uniqueUserIds.length === 0) return

    const loadExampleUsers = async () => {
      const userNamesMap = {}
      await Promise.all(uniqueUserIds.map(async (userId) => {
        try {
          const user = await fetchUserDetail(userId)
          userNamesMap[userId] = user?.fullName || user?.email || userId
        } catch {
          userNamesMap[userId] = userId
        }
      }))
      if (isMounted) setExampleUserNames(userNamesMap)
    }
    loadExampleUsers()
    return () => { isMounted = false }
  }, [examples])

  if (!vocab) return null

  const columns = [
    {
      title: 'Nội dung câu mẫu',
      dataIndex: 'sentence',
      align: 'center',
      key: 'sentence',
      render: (text, record) => (
        <Space size={0} style={{ display: 'flex', flexDirection: 'column' }}>
          <Text strong style={{ color: '#1890ff', fontSize: '15px' }}>{text || '-'}</Text>
          <Text type="secondary" italic>
            {record.translation || '-'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status) => {
        const info = STATUS_MAP[status] || { dotColor: '#d9d9d9' }
        return (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: info.dotColor,
              display: 'inline-block',
            }}
          />
        )
      },
    },
    {
      title: 'Thông tin khởi tạo',
      dataIndex: 'createBy',
      key: 'createBy',
      width: 220,
      render: (userId, record) => (
        <div style={{ fontSize: '12px' }}>
          <div>
            <Text type="secondary">Bởi: </Text>
            <a href={`/admin/users/${userId}`} target="_blank" rel="noreferrer">
              {exampleUserNames[userId] || userId}
            </a>
          </div>
          <div>
            <Text type="secondary">Lúc: </Text>
            {formatDate(record.createAt)}
          </div>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 110,
      align: 'right',
      render: (_, record) => {
        const isDeleting = deletingExampleId === record.exampleId
        return (
          <Space size="middle">
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined style={{ color: '#faad14', transition: 'color 0.2s ease' }} />}
                onClick={() => onEditExample?.(record)}
                disabled={isDeleting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px 8px',
                  borderRadius: 4,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fffbe6'
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined style={{ transition: 'color 0.2s ease' }} />}
                loading={isDeleting}
                onClick={() => onDeleteExample?.(record)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px 8px',
                  borderRadius: 4,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff1f0'
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              />
            </Tooltip>
          </Space>
        )
      },
    },
  ]

  const tabItems = [
    {
      key: 'general',
      label: <Space><InfoCircleOutlined /><span style={{ fontWeight: 500 }}>Thông tin từ vựng</span></Space>,
      children: (
        <div style={{ padding: 24, backgroundColor: '#fff' }}>
          <Row gutter={[32, 32]}>
            <Col xs={24} lg={16}>
              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
                <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                <Text strong style={{ color: '#595959', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 }}>Chi tiết ý nghĩa</Text>
              </div>
              <Table
                dataSource={[
                  { key: '1', label: 'Từ vựng', value: <Space size="middle" align="center"><Text strong style={{ fontSize: '20px', color: '#1890ff' }}>{vocab.text}</Text><Badge status={vocab.status === 1 ? 'success' : vocab.status === 2 ? 'error' : 'default'} /></Space> },
                  { key: '2', label: 'Phiên âm', value: <Text type="secondary" style={{ fontSize: '16px' }}>{vocab.pronunciation || '-'}</Text> },
                  { key: '3', label: 'Định nghĩa', value: <div style={{ fontSize: '16px', lineHeight: '1.6' }}>{vocab.definition || '-'}</div> }
                ]}
                columns={[
                  { title: 'Trường thông tin', dataIndex: 'label', key: 'label', width: '250px', render: (text) => <Text type="secondary" style={{ fontWeight: 500 }}>{text}</Text> },
                  { title: 'Giá trị', dataIndex: 'value', key: 'value' }
                ]}
                pagination={false}
                bordered
                size="middle"
                showHeader={false}
              />
            </Col>
            
            <Col xs={24} lg={8}>
              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
                <GlobalOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                <Text strong style={{ color: '#595959', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 }}>Minh họa</Text>
              </div>
              <div style={{ textAlign: 'center', padding: 16, border: '1px solid #f0f0f0', borderRadius: 8 }}>
                {vocab.imgURL ? (
                  <Image
                    src={vocab.imgURL}
                    alt="vocab"
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      objectFit: 'contain',
                      maxHeight: '320px',
                    }}
                    preview={{ mask: <><EyeOutlined /> Xem lớn</> }}
                  />
                ) : (
                  <Empty description="Chưa có ảnh minh họa" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </div>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'examples',
      label: <Space><PlusOutlined /><span style={{ fontWeight: 500 }}>Câu mẫu & Ví dụ</span></Space>,
      children: (
        <div style={{ padding: 24, backgroundColor: '#fff' }}>
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <InfoCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              <Text strong style={{ color: '#595959', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 }}>Danh sách câu mẫu ({examples.length})</Text>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={onAddExample} style={{ borderRadius: 20, height: 32, padding: '0 16px', fontWeight: 600 }}>
              Thêm câu mẫu
            </Button>
          </div>
          <Table
            dataSource={examples}
            columns={columns}
            rowKey="exampleId"
            pagination={examples.length > 5 ? { pageSize: 5 } : false}
            locale={{ emptyText: <Empty description="Chưa có câu mẫu nào" /> }}
            size="middle"
            scroll={{ x: 'max-content' }}
          />
        </div>
      )
    },
    {
      key: 'system',
      label: <Space><HistoryOutlined /><span style={{ fontWeight: 500 }}>Quản trị & Chủ đề</span></Space>,
      children: (
        <div style={{ padding: 24, backgroundColor: '#fff' }}>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
                <TagOutlined style={{ marginRight: 8, color: '#faad14' }} />
                <Text strong style={{ color: '#595959', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 }}>Chủ đề liên quan</Text>
              </div>
              <div style={{ padding: 16, border: '1px solid #f0f0f0', borderRadius: 8, minHeight: 120 }}>
                {topics.length > 0 ? (
                  <Space wrap>
                    {topics.map((topic) => (
                      <Tag
                        key={topic.topicId}
                        color="blue"
                        style={{ cursor: 'pointer', padding: '4px 12px', borderRadius: 12 }}
                        onClick={() => window.open(`/admin/vocab-topic/${topic.topicId}`, '_blank')}
                      >
                        {topic.topicName}
                      </Tag>
                    ))}
                  </Space>
                ) : (
                  <Empty description="Từ vựng này chưa thuộc chủ đề nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </div>
            </Col>
            
            <Col xs={24} md={12}>
              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
                <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                <Text strong style={{ color: '#595959', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 }}>Nhật ký hệ thống</Text>
              </div>
              <Table
                dataSource={[
                  { key: '1', label: 'Người tạo', value: creatorId ? <a href={`/admin/users/${creatorId}`} target="_blank" rel="noreferrer">{creatorName || creatorId}</a> : '-' },
                  { key: '2', label: 'Ngày tạo', value: <Space><CalendarOutlined />{formatDate(vocab.createDate || vocab.createdDate || vocab.createdAt || vocab.createAt)}</Space> },
                  { key: '3', label: 'Người cập nhật', value: updaterId ? <a href={`/admin/users/${updaterId}`} target="_blank" rel="noreferrer">{updaterName || updaterId}</a> : '-' },
                  { key: '4', label: 'Cập nhật lần cuối', value: <Space><CalendarOutlined />{formatDate(vocab.updateDate || vocab.updatedDate || vocab.updatedAt || vocab.updateAt)}</Space> }
                ]}
                columns={[
                  { title: 'Trường thông tin', dataIndex: 'label', key: 'label', width: '200px', render: (text) => <Text type="secondary" style={{ fontWeight: 500 }}>{text}</Text> },
                  { title: 'Giá trị', dataIndex: 'value', key: 'value' }
                ]}
                pagination={false}
                bordered
                size="middle"
                showHeader={false}
              />
            </Col>
          </Row>
        </div>
      )
    }
  ]

  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <Tabs
          items={tabItems}
          tabBarStyle={{ padding: '16px 24px 0', borderBottom: '1px solid #f0f0f0', background: '#ffffff', margin: 0 }}
        />
      </div>
    </div>
  )
}

export default VocabularyInfoCard