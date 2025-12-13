'use client'
import React from 'react'
import { Card, List, Space, Typography } from 'antd'

export function TopAuthorsCard({ topAuthors = [] }) {
  return (
    <Card title="Top người đăng nổi bật" size="small">
      <List
        dataSource={topAuthors}
        locale={{ emptyText: 'Chưa có dữ liệu' }}
        renderItem={(item, idx) => (
          <List.Item style={{ padding: '8px 0' }}>
            <Space direction="vertical" size={2}>
              <Typography.Text strong>
                {idx + 1}. {item.authorId}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Bài: {item.blogCount ?? 0} • View: {item.totalViews ?? 0}
              </Typography.Text>
            </Space>
          </List.Item>
        )}
      />
    </Card>
  )
}

export default TopAuthorsCard