'use client'

import React from 'react'
import { Card, Space, Typography } from 'antd'

const { Title, Text } = Typography

export function Settings() {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Title level={4} style={{ fontFamily: 'Epilogue, sans-serif' }}>
          Cài đặt
        </Title>
        <Text type="secondary">Hiện chưa có tuỳ chọn thay đổi theme.</Text>
      </Card>
    </Space>
  )
}

export default Settings

