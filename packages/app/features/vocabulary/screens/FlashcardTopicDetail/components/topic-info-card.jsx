'use client'

import React, { useEffect, useState } from 'react'
import { Card, Descriptions, Tag, Image } from 'antd'
import { fetchUserDetail } from 'app/features/admin/screens/UserDetail/api/api'

export function TopicInfoCard({ topic }) {
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
  const isMuted = topicStatus === 0

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
    <Card>
      <Descriptions column={1} bordered size="middle">
        <Descriptions.Item label="Mã">{topic.id || topic._raw?.topicId || '-'}</Descriptions.Item>
        <Descriptions.Item label="Tiêu đề">{topic.title || topic._raw?.topicName || '-'}</Descriptions.Item>
        <Descriptions.Item label="Mô tả">{topic.subtitle || topic._raw?.description || '-'}</Descriptions.Item>
        <Descriptions.Item label="Level">{topic.level ?? topic._raw?.level ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={isMuted ? 'default' : 'green'} style={{ fontSize: 12 }}>
            {isMuted ? 'Ẩn' : 'Hoạt động'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Ảnh minh họa">
          {(() => {
            const imgUrl = topic.imgUrl || topic._raw?.imgUrl
            if (!imgUrl) return '-'
            return (
              <Image
                src={imgUrl}
                alt="Topic image"
                style={{ maxWidth: 200, maxHeight: 200, objectFit: 'contain' }}
                preview={{
                  mask: 'Xem ảnh',
                }}
              />
            )
          })()}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">
          {formatDate(topic._raw?.createDate || topic.createDate)}
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
        <Descriptions.Item label="Ngày cập nhật">
          {formatDate(topic._raw?.updateDate || topic.updateDate)}
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
      </Descriptions>
    </Card>
  )
}

export default TopicInfoCard

