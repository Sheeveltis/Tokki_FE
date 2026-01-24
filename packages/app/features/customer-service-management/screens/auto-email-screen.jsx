'use client'

import React from 'react'
import { Space, Typography } from 'antd'
import { SendEmailForm } from '../components/auto-email/send-email-form'
import { EmailHistory } from '../components/manual-email/email-history'

const { Title, Text } = Typography

export function AutoEmail() {
  return (
    <div style={{ padding: 24 }}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            Gửi mail tự động
          </Title>
          <Text type="secondary">Cấu hình và gửi email tự động cho người dùng</Text>
        </div>

        <SendEmailForm />

        <EmailHistory />
      </Space>
    </div>
  )
}

export default AutoEmail


