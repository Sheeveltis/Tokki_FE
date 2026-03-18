'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, Descriptions, Image, Tag, Space, Button, Table, Typography, Empty, Tooltip } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons'
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', paddingBottom: 24 }}>
      {/* Chi tiết từ vựng */}
      <Card 
        title={<Text strong style={{ fontSize: 20 }}>Thông tin cơ bản</Text>} 
        variant="outlined"
      >
        <div style={{ display: 'flex', gap: '32px', alignItems: 'stretch' }}>
          {/* Cột bên trái: Thông tin text */}
          <div style={{ flex: 1 }}>
            <Descriptions 
              column={{ xxl: 2, xl: 2, lg: 1, md: 1, sm: 1, xs: 1 }} 
              bordered 
              size="middle" // Chuyển từ small sang middle để tăng padding mặc định
              labelStyle={{ 
                width: '140px', 
                fontWeight: '600', 
                backgroundColor: '#fafafa',
                fontSize: '15px' // Tăng cỡ chữ nhãn
              }}
              contentStyle={{ 
                fontSize: '15px', // Tăng cỡ chữ nội dung
                // padding: '12px 16px' 
              }}
            >
              <Descriptions.Item label="Từ vựng" span={2}>
                <Text strong copyable style={{ fontSize: '18px', color: '#1890ff' }}>
                  {vocab.text}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Phiên âm" span={2}>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  {vocab.pronunciation || '-'}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Định nghĩa" span={2}>
                <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
                  {vocab.definition || '-'}
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Người tạo">
                {creatorId ? (
                  <a href={`/admin/users/${creatorId}`} target="_blank" rel="noreferrer">
                    {creatorName || creatorId}
                  </a>
                ) : '-'}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày tạo">
                {formatDate(vocab.createDate || vocab.createdDate || vocab.createdAt || vocab.createAt)}
              </Descriptions.Item>

              <Descriptions.Item label="Người cập nhật">
                {updaterId ? (
                  <a href={`/admin/users/${updaterId}`} target="_blank" rel="noreferrer">
                    {updaterName || updaterId}
                  </a>
                ) : '-'}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày cập nhật">
                {formatDate(vocab.updateDate || vocab.updatedDate || vocab.updatedAt || vocab.updateAt)}
              </Descriptions.Item>
            </Descriptions>
          </div>

          {/* Cột bên phải: Ảnh minh họa */}
          {vocab.imgURL && (
            <div style={{ 
              width: '170px', 
              display: 'flex', 
              flexDirection: 'column',
              backgroundColor: '#fdfdfd',
              padding: '10px',
              borderRadius: '12px',
              border: '1px solid #f0f0f0'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                <Text type="secondary" strong style={{ fontSize: '13px', letterSpacing: '1px' }}>
                  ẢNH MINH HỌA
                </Text>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <Image
                  src={vocab.imgURL}
                  alt="vocab"
                  style={{ 
                    width: '100%', 
                    borderRadius: 8, 
                    objectFit: 'contain',
                    maxHeight: '300px'
                  }}
                  preview={{ mask: <><EyeOutlined /> Xem lớn</> }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>


      {/* Chủ đề liên quan */}
      {topics.length > 0 && (
        <Card title="Chủ đề liên quan" size="small">
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
        </Card>
      )}

      {/* Danh sách câu mẫu */}
      <Card
        title={<Text strong>Danh sách câu mẫu ({examples.length})</Text>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={onAddExample}>
            Thêm câu mẫu
          </Button>
        }
      >
        <Table
          dataSource={examples}
          columns={columns}
          rowKey="exampleId"
          pagination={examples.length > 5 ? { pageSize: 5 } : false}
          locale={{ emptyText: <Empty description="Chưa có câu mẫu nào" /> }}
          size="middle"
          scroll={{ x: 'max-content' }}
        />
      </Card>


    </div>
  )
}

export default VocabularyInfoCard