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
  0: { text: 'Bản nháp', color: 'default' },
  1: { text: 'Hoạt động', color: 'success' },
  2: { text: 'Đã xóa', color: 'error' },
}

export function VocabularyInfoCard({ vocab, onAddExample, onEditExample, onDeleteExample, deletingExampleId }) {
  const [creatorName, setCreatorName] = useState('')
  const [updaterName, setUpdaterName] = useState('')
  const [exampleUserNames, setExampleUserNames] = useState({})

  const topics = useMemo(() => (Array.isArray(vocab?.topics) ? vocab.topics : []), [vocab?.topics])
  const examples = useMemo(() => (Array.isArray(vocab?.examples) ? vocab.examples : []), [vocab?.examples])

  const creatorId = vocab?.createBy || ''
  const updaterId = vocab?.updateBy || ''

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
      key: 'sentence',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: '#1890ff', fontSize: '15px' }}>{text || '-'}</Text>
          <Text type="secondary" italic>{record.translation || '-'}</Text>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const info = STATUS_MAP[status] || { text: 'N/A', color: 'default' }
        return <Tag color={info.color}>{info.text}</Tag>
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
                icon={<EditOutlined style={{ color: '#faad14' }} />} 
                onClick={() => onEditExample?.(record)}
                disabled={isDeleting}
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                loading={isDeleting}
                onClick={() => onDeleteExample?.(record)}
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
      <Card title={<Text strong fontSize={18}>Thông tin cơ bản</Text>} variant="outlined">
        <Descriptions column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} bordered size="small">
          <Descriptions.Item label="Từ vựng"><Text strong copyable>{vocab.text}</Text></Descriptions.Item>
          <Descriptions.Item label="Phiên âm"><Text type="secondary">{vocab.pronunciation || '-'}</Text></Descriptions.Item>
          <Descriptions.Item label="Định nghĩa" span={2}>{vocab.definition || '-'}</Descriptions.Item>
          <Descriptions.Item label="Ảnh minh họa" span={2}>
            {vocab.imgURL ? (
              <Image
                src={vocab.imgURL}
                alt="vocab"
                style={{ maxWidth: 200, borderRadius: 8 }}
                preview={{ mask: <><EyeOutlined /> Xem ảnh</> }}
              />
            ) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Người tạo">
             <a href={`/admin/users/${creatorId}`} target="_blank" rel="noreferrer">{creatorName || creatorId}</a>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">{formatDate(vocab.createDate)}</Descriptions.Item>
        </Descriptions>
      </Card>

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
    </div>
  )
}

export default VocabularyInfoCard