'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'solito/navigation'
import { Card, Descriptions, Image, Tag, Space, Button, Table } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { fetchUserDetail } from 'app/features/user/screens/UserDetail/api/api'
import { ButtonV2 } from 'components/buttonV2.jsx'

export function VocabularyInfoCard({ vocab, onAddExample, onEditExample, onDeleteExample, deletingExampleId }) {
  const router = useRouter()
  
  if (!vocab) return null

  const topics = Array.isArray(vocab?.topics) ? vocab.topics : []
  const examples = Array.isArray(vocab?.examples) ? vocab.examples : []

  const creatorId = vocab.createBy || ''
  const updaterId = vocab.updateBy || ''
  const [creatorName, setCreatorName] = useState('')
  const [updaterName, setUpdaterName] = useState('')
  const [exampleUserNames, setExampleUserNames] = useState({}) // Mapping userId -> userName cho examples

  // Fetch user names cho vocabulary creator/updater
  useEffect(() => {
    let isMounted = true

    const loadUser = async (id, setter) => {
      try {
        if (!id) return
        const user = await fetchUserDetail(id)
        if (isMounted && user) {
          setter(user.fullName || user.email || id)
        }
      } catch (error) {
        if (isMounted) {
          setter(id)
        }
      }
    }

    // Nếu người tạo và người cập nhật giống nhau thì chỉ gọi 1 lần
    if (creatorId && creatorId === updaterId) {
      loadUser(creatorId, (name) => {
        setCreatorName(name)
        setUpdaterName(name)
      })
    } else {
      if (creatorId) loadUser(creatorId, setCreatorName)
      if (updaterId) loadUser(updaterId, setUpdaterName)
    }

    return () => {
      isMounted = false
    }
  }, [creatorId, updaterId])

  // Fetch user names cho examples
  useEffect(() => {
    let isMounted = true

    // Lấy tất cả unique user IDs từ examples
    const uniqueUserIds = Array.from(
      new Set(examples.map((ex) => ex.createBy).filter(Boolean))
    )

    if (uniqueUserIds.length === 0) {
      return
    }

    const loadExampleUsers = async () => {
      const userNamesMap = {}
      
      // Fetch tất cả users song song
      const promises = uniqueUserIds.map(async (userId) => {
        try {
          const user = await fetchUserDetail(userId)
          if (isMounted && user) {
            userNamesMap[userId] = user.fullName || user.email || userId
          } else if (isMounted) {
            userNamesMap[userId] = userId
          }
        } catch (error) {
          if (isMounted) {
            userNamesMap[userId] = userId
          }
        }
      })

      await Promise.all(promises)

      if (isMounted) {
        setExampleUserNames(userNamesMap)
      }
    }

    loadExampleUsers()

    return () => {
      isMounted = false
    }
  }, [examples])

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Descriptions column={1} bordered size="middle">
          <Descriptions.Item label="Từ">{vocab.text || '-'}</Descriptions.Item>
          <Descriptions.Item label="Phiên âm">{vocab.pronunciation || '-'}</Descriptions.Item>
          <Descriptions.Item label="Định nghĩa">{vocab.definition || '-'}</Descriptions.Item>
          <Descriptions.Item label="Ảnh minh họa">
            {vocab.imgURL ? (
              <Image
                src={vocab.imgURL}
                alt={vocab.text || 'Vocabulary image'}
                style={{ maxWidth: 400, maxHeight: 300, objectFit: 'contain' }}
                preview={{
                  mask: 'Xem ảnh',
                }}
              />
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {(() => {
              const status = vocab.status
              const statusMap = {
                0: { text: 'Bản nháp', color: 'default' },
                1: { text: 'Hoạt động', color: 'success' },
                2: { text: 'Đã xóa', color: 'error' },
              }
              const statusInfo = statusMap[status] || { text: 'Không xác định', color: 'default' }
              return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
            })()}
          </Descriptions.Item>
          <Descriptions.Item label="Người tạo">
            {creatorId ? (
              <a
                href={`/admin/users/${creatorId}?tab=users-admin`}
                onClick={(e) => {
                  e.preventDefault()
                  window.open(`/admin/users/${creatorId}?tab=users-admin`, '_blank', 'noopener,noreferrer')
                }}
              >
                {creatorName || creatorId}
              </a>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {vocab.createDate
              ? (() => {
                  try {
                    const dateObj = new Date(vocab.createDate)
                    return dateObj.toLocaleString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })
                  } catch {
                    return vocab.createDate
                  }
                })()
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Người cập nhật">
            {updaterId ? (
              <a
                href={`/admin/users/${updaterId}?tab=users-admin`}
                onClick={(e) => {
                  e.preventDefault()
                  window.open(`/admin/users/${updaterId}?tab=users-admin`, '_blank', 'noopener,noreferrer')
                }}
              >
                {updaterName || updaterId}
              </a>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày cập nhật">
            {vocab.updateDate
              ? (() => {
                  try {
                    const dateObj = new Date(vocab.updateDate)
                    return dateObj.toLocaleString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })
                  } catch {
                    return vocab.updateDate
                  }
                })()
              : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {topics.length > 0 && (
        <Card title="Danh sách chủ đề" style={{ marginTop: 16 }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {topics.map((topic) => (
              <div
                key={topic.topicId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  border: '1px solid #f0f0f0',
                  borderRadius: 6,
                  backgroundColor: '#fafafa',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#8c8c8c', marginRight: 8 }}>ID:</span>
                    <span style={{ fontSize: 12, color: '#595959', fontFamily: 'monospace' }}>
                      {topic.topicId || '-'}
                    </span>
                  </div>
                  <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                    {topic.topicName || '-'}
                  </Tag>
                </div>
                <ButtonV2
                  title="Xem chi tiết"
                  color="mint"
                  onPress={() => window.open(`/admin/vocab-topic/${topic.topicId}`, '_blank')}
                  style={{ marginLeft: 12, minWidth: 140, paddingVertical: 10 }}
                  textStyle={{ fontSize: 14 }}
                />
              </div>
            ))}
          </Space>
        </Card>
      )}

      <Card
        title="Câu mẫu"
        extra={
          onAddExample ? (
            <ButtonV2
              title="Thêm câu mẫu"
              color="poppy"
              onPress={onAddExample}
              style={{ minWidth: 140, paddingVertical: 8 }}
              textStyle={{ fontSize: 14 }}
            />
          ) : null
        }
        style={{ marginTop: 16 }}
      >
        {examples.length > 0 ? (
          <Table
            dataSource={examples}
            rowKey="exampleId"
            pagination={false}
            columns={[
              {
                title: 'Câu',
                dataIndex: 'sentence',
                key: 'sentence',
                render: (text) => text || '-',
              },
              {
                title: 'Bản dịch',
                dataIndex: 'translation',
                key: 'translation',
                render: (text) => text || '-',
              },
              {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                width: 120,
                render: (status) => {
                  const statusMap = {
                    0: { text: 'Bản nháp', color: 'default' },
                    1: { text: 'Hoạt động', color: 'success' },
                    2: { text: 'Đã xóa', color: 'error' },
                  }
                  const statusInfo = statusMap[status] || { text: 'Không xác định', color: 'default' }
                  return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
                },
              },
              {
                title: 'Ngày tạo',
                dataIndex: 'createAt',
                key: 'createAt',
                width: 180,
                render: (date) => {
                  if (!date) return '-'
                  try {
                    const dateObj = new Date(date)
                    return dateObj.toLocaleString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  } catch {
                    return date
                  }
                },
              },
              {
                title: 'Người tạo',
                dataIndex: 'createBy',
                key: 'createBy',
                width: 150,
                render: (text) => {
                  if (!text) return '-'
                  const userName = exampleUserNames[text] || text
                  return (
                    <a
                      href={`/admin/users/${text}?tab=users-admin`}
                      onClick={(e) => {
                        e.preventDefault()
                        window.open(`/admin/users/${text}?tab=users-admin`, '_blank', 'noopener,noreferrer')
                      }}
                      style={{ fontFamily: userName === text ? 'monospace' : 'inherit', fontSize: 12 }}
                    >
                      {userName}
                    </a>
                  )
                },
              },
              {
                title: 'Thao tác',
                key: 'action',
                width: 150,
                render: (_, record) => {
                  const isDeleting = deletingExampleId === record.exampleId
                  return (
                    <Space>
                      {onEditExample && (
                        <Button
                          type="link"
                          icon={<EditOutlined />}
                          onClick={() => onEditExample(record)}
                          disabled={isDeleting}
                          style={{ padding: 0 }}
                          title="Chỉnh sửa"
                        />
                      )}
                      {onDeleteExample && (
                        <Button
                          type="link"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => onDeleteExample(record)}
                          disabled={isDeleting}
                          loading={isDeleting}
                          style={{ padding: 0 }}
                          title="Xóa"
                        />
                      )}
                    </Space>
                  )
                },
              },
            ]}
            size="middle"
          />
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: '#8c8c8c' }}>
            Chưa có câu mẫu nào
          </div>
        )}
      </Card>
    </Space>
  )
}

export default VocabularyInfoCard

