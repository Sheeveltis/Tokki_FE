'use client'

import React, { useEffect, useState } from 'react'
import { Card, Descriptions, Image, Space, Typography, Tooltip } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { fetchUserDetail } from 'app/features/user/api/user-detail'

export function TopicInfoCard({ topic, isAdmin, onApprove, onReject, approvalLoading }) {
  if (!topic) return null

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  // Xác định status từ topic._raw hoặc topic.status
  const topicStatus = topic._raw?.status ?? topic.status
  const { Text } = Typography

  // Map status để hiển thị
  const getStatusInfo = (status) => {
    const statusMap = {
      0: { label: 'Bản nháp', color: 'default' },
      1: { label: 'Đang hoạt động', color: 'green' },
      2: { label: 'Đã xóa', color: 'red' },
      3: { label: 'Chờ phê duyệt', color: 'orange' },
      4: { label: 'Bị từ chối phê duyệt', color: 'red' },
    }
    return statusMap[status] || { label: 'Không xác định', color: 'default' }
  }
  const statusInfo = getStatusInfo(topicStatus)

  const topicName = topic.title || topic._raw?.topicName || '-'
  const topicDescription = topic.subtitle || topic._raw?.description || '-'
  const topicLevel = topic.level ?? topic._raw?.level ?? '-'
  const topicImage = topic.imgUrl || topic._raw?.imgUrl

  const creatorId = topic._raw?.createBy || topic.createBy || ''
  const updaterId = topic._raw?.updateBy || topic.updateBy || ''
  const [creatorName, setCreatorName] = useState('')
  const [updaterName, setUpdaterName] = useState('')

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

  return (
    <Card
      title={<Text strong style={{ fontSize: 18 }}>Thông tin cơ bản</Text>}
      variant="outlined"
      style={{ width: '100%' }}
      styles={{ body: { padding: 24 } }}
    >
      <div style={{ width: '100%' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 32,
            width: '100%',
            flexWrap: 'wrap'
          }}
        >
          {/* Phần ảnh minh họa */}
          {topicImage && (
            <div
              style={{
                flex: '0 0 300px',
                maxWidth: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#fdfdfd',
                padding: 12,
                borderRadius: 12,
                border: '1px solid #f0f0f0',
                height: 'fit-content'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  src={topicImage}
                  alt="topic"
                  style={{
                    width: '100%',
                    maxHeight: 250,
                    borderRadius: 8,
                    objectFit: 'contain',
                  }}
                  preview={{ mask: 'Xem lớn' }}
                />
              </div>
            </div>
          )}

          {/* Phần thông tin chi tiết */}
          <div style={{ flex: '1 1 400px', minWidth: 0 }}>
            <Descriptions
              column={1}
              bordered
              size="middle"
              labelStyle={{
                width: 140,
                fontWeight: 600,
                backgroundColor: '#fafafa',
                fontSize: 14,
              }}
              contentStyle={{
                fontSize: 14,
                backgroundColor: '#fff',
              }}
              style={{ width: '100%' }}
            >
              <Descriptions.Item label="Chủ đề">
                <Space size={8} align="center" wrap>
                  <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                    {topicName}
                  </Text>

                  <Tooltip title={statusInfo.label}>
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        display: 'inline-block',
                        backgroundColor:
                          topicStatus === 1
                            ? '#52c41a'
                            : topicStatus === 2
                              ? '#ff4d4f'
                              : topicStatus === 3
                                ? '#faad14'
                                : topicStatus === 4
                                  ? '#ff4d4f'
                                  : '#bfbfbf',
                        boxShadow: '0 0 2px rgba(0,0,0,0.2)',
                      }}
                    />
                  </Tooltip>

                  {topicStatus === 3 && isAdmin && (
                    <Space size={8} style={{ marginLeft: 8 }}>
                      <Tooltip title="Phê duyệt">
                        <div
                          onClick={(e) => {
                            e?.stopPropagation?.()
                            onApprove?.()
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: approvalLoading ? 'not-allowed' : 'pointer',
                            padding: '4px 8px',
                            borderRadius: 6,
                            backgroundColor: '#f6ffed',
                            border: '1px solid #b7eb8f',
                            transition: 'all 0.2s ease',
                            opacity: approvalLoading ? 0.5 : 1,
                          }}
                          onMouseEnter={(e) => {
                            if (!approvalLoading) {
                              e.currentTarget.style.transform = 'scale(1.05)'
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(82, 196, 26, 0.2)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!approvalLoading) {
                              e.currentTarget.style.transform = 'scale(1)'
                              e.currentTarget.style.boxShadow = 'none'
                            }
                          }}
                        >
                          <CheckCircleOutlined style={{ fontSize: 16, color: '#52c41a' }} />
                          <Text style={{ marginLeft: 6, color: '#52c41a', fontSize: 14, fontWeight: 500 }}>Phê duyệt</Text>
                        </div>
                      </Tooltip>

                      <Tooltip title="Từ chối">
                        <div
                          onClick={(e) => {
                            e?.stopPropagation?.()
                            onReject?.()
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: approvalLoading ? 'not-allowed' : 'pointer',
                            padding: '4px 8px',
                            borderRadius: 6,
                            backgroundColor: '#fff1f0',
                            border: '1px solid #ffa39e',
                            transition: 'all 0.2s ease',
                            opacity: approvalLoading ? 0.5 : 1,
                          }}
                          onMouseEnter={(e) => {
                            if (!approvalLoading) {
                              e.currentTarget.style.transform = 'scale(1.05)'
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 77, 79, 0.2)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!approvalLoading) {
                              e.currentTarget.style.transform = 'scale(1)'
                              e.currentTarget.style.boxShadow = 'none'
                            }
                          }}
                        >
                          <CloseCircleOutlined style={{ fontSize: 16, color: '#ff4d4f' }} />
                          <Text style={{ marginLeft: 6, color: '#ff4d4f', fontSize: 14, fontWeight: 500 }}>Từ chối</Text>
                        </div>
                      </Tooltip>
                    </Space>
                  )}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Level">
                <Text strong>{topicLevel}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Mô tả">
                <div style={{ fontSize: 14, lineHeight: 1.6, color: '#434343' }}>
                  {topicDescription}
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Người tạo">
                {creatorId ? (
                  <Space>
                    <a
                      href={`/admin/users/${creatorId}?tab=users-admin`}
                      onClick={(e) => {
                        e.preventDefault()
                        window.open(`/admin/users/${creatorId}?tab=users-admin`, '_blank', 'noopener,noreferrer')
                      }}
                      style={{ fontWeight: 500 }}
                    >
                      {creatorName || creatorId}
                    </a>
                    <Text type="secondary" style={{ fontSize: 12 }}>({formatDate(topic._raw?.createDate || topic.createDate)})</Text>
                  </Space>
                ) : (
                  '-'
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Người cập nhật">
                {updaterId ? (
                  <Space>
                    <a
                      href={`/admin/users/${updaterId}?tab=users-admin`}
                      onClick={(e) => {
                        e.preventDefault()
                        window.open(`/admin/users/${updaterId}?tab=users-admin`, '_blank', 'noopener noreferrer')
                      }}
                      style={{ fontWeight: 500 }}
                    >
                      {updaterName || updaterId}
                    </a>
                    <Text type="secondary" style={{ fontSize: 12 }}>({formatDate(topic._raw?.updateDate || topic.updateDate)})</Text>
                  </Space>
                ) : (
                  '-'
                )}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default TopicInfoCard

