'use client'
import React from 'react'
import { Card, List, Space, Typography } from 'antd'

export function TopBlogsCard({ topBlogs = [] }) {
  return (
    <Card title="Top blog nhiều lượt xem" size="small">
      <List
        dataSource={topBlogs}
        locale={{ emptyText: 'Chưa có dữ liệu' }}
        renderItem={(item, idx) => (
          <List.Item style={{ padding: '8px 0' }}>
            <Space direction="vertical" size={2} style={{ width: '100%' }}>
              <Typography.Text strong>
                {idx + 1}. {item.title}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                View: {item.viewCount ?? 0} • {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '--'}
              </Typography.Text>
            </Space>
          </List.Item>
        )}
      />
    </Card>
  )
}

export default TopBlogsCard

