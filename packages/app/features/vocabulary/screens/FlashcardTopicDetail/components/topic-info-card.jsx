'use client'

import React from 'react'
import { Card, Descriptions, Tag } from 'antd'

export function TopicInfoCard({ topic }) {
  if (!topic) return null

  return (
    <Card>
      <Descriptions column={1} bordered size="middle">
        <Descriptions.Item label="Mã">{topic.id || '-'}</Descriptions.Item>
        <Descriptions.Item label="Tiêu đề">{topic.title || '-'}</Descriptions.Item>
        <Descriptions.Item label="Mô tả">{topic.subtitle || '-'}</Descriptions.Item>
        <Descriptions.Item label="Level">{topic.level ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái" >
          <Tag color={topic.muted ? 'default' : 'green'} style={{ fontSize: 12}}>{topic.muted ? 'Ẩn' : 'Đang dùng'}</Tag>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  )
}

export default TopicInfoCard

