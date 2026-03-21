'use client'

import React, { useEffect, useState } from 'react'
import { Card, Descriptions, Image, Space, Typography } from 'antd'
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
      title={<Text strong style={{ fontSize: 20 }}>Thông tin cơ bản</Text>}
      variant="outlined"
    >
      <div style={{ display: 'flex', gap: 32, alignItems: 'stretch', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 320 }}>
          <Descriptions
            column={{ xxl: 2, xl: 2, lg: 1, md: 1, sm: 1, xs: 1 }}
            bordered
            size="middle"
            labelStyle={{
              width: 140,
              fontWeight: 600,
              backgroundColor: '#fafafa',
              fontSize: 15,
            }}
            contentStyle={{
              fontSize: 15,
            }}
          >
            <Descriptions.Item label="Chủ đề" span={2}>
              <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                {topicName}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item label="Level" span={2}>
              <Text>{topicLevel}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Mô tả" span={2}>
              <div style={{ fontSize: 16, lineHeight: 1.6 }}>
                {topicDescription}
              </div>
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
              <Text>{formatDate(topic._raw?.createDate || topic.createDate)}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Người cập nhật">
              {updaterId ? (
                <a
                  href={`/admin/users/${updaterId}?tab=users-admin`}
                  onClick={(e) => {
                    e.preventDefault()
                    window.open(`/admin/users/${updaterId}?tab=users-admin`, '_blank', 'noopener noreferrer')
                  }}
                >
                  {updaterName || updaterId}
                </a>
              ) : (
                '-'
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Ngày cập nhật">
              <Text>{formatDate(topic._raw?.updateDate || topic.updateDate)}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái" span={2}>
              <Space size={8} align="center" wrap>
                <span
                  style={{
                    width: 10,
                    height: 10,
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
                  }}
                />

                {topicStatus === 3 && isAdmin && (
                  <>
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
                        padding: '2px 4px',
                        borderRadius: 4,
                        transition: 'all 0.2s ease',
                        opacity: approvalLoading ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!approvalLoading) {
                          e.currentTarget.style.backgroundColor = '#f6ffed'
                          e.currentTarget.style.transform = 'scale(1.2)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!approvalLoading) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.transform = 'scale(1)'
                        }
                      }}
                      title="Phê duyệt"
                    >
                      <CheckCircleOutlined
                        style={{ fontSize: 16, color: '#52c41a', transition: 'color 0.2s ease' }}
                      />
                    </div>

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
                        padding: '2px 4px',
                        borderRadius: 4,
                        transition: 'all 0.2s ease',
                        opacity: approvalLoading ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!approvalLoading) {
                          e.currentTarget.style.backgroundColor = '#fff1f0'
                          e.currentTarget.style.transform = 'scale(1.2)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!approvalLoading) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.transform = 'scale(1)'
                        }
                      }}
                      title="Từ chối"
                    >
                      <CloseCircleOutlined
                        style={{ fontSize: 16, color: '#ff4d4f', transition: 'color 0.2s ease' }}
                      />
                    </div>
                  </>
                )}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </div>

        {topicImage && (
          <div
            style={{
              width: 170,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#fdfdfd',
              padding: 10,
              borderRadius: 12,
              border: '1px solid #f0f0f0',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <Text type="secondary" strong style={{ fontSize: 13, letterSpacing: 1 }}>
                ẢNH MINH HỌA
              </Text>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <Image
                src={topicImage}
                alt="topic"
                style={{
                  width: '100%',
                  borderRadius: 8,
                  objectFit: 'contain',
                  maxHeight: 300,
                }}
                preview={{ mask: 'Xem lớn' }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default TopicInfoCard

