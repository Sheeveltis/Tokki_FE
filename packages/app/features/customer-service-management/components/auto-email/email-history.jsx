'use client'

import React from 'react'
import { Card, Typography, Table, Tag, Space } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'

const { Text } = Typography

/**
 * EmailHistory Component
 * Hiển thị lịch sử gửi email
 */
export function EmailHistory() {
  // TODO: Replace with actual API call
  const emailHistory = []

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
    },
    {
      title: 'Người nhận',
      dataIndex: 'recipients',
      key: 'recipients',
      render: (recipients) => {
        if (Array.isArray(recipients)) {
          return recipients.length > 0 ? `${recipients.length} người nhận` : '-'
        }
        return recipients || '-'
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          success: { color: 'green', icon: <CheckCircleOutlined />, text: 'Thành công' },
          failed: { color: 'red', icon: <CloseCircleOutlined />, text: 'Thất bại' },
          pending: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Đang chờ' },
        }
        const statusInfo = statusMap[status] || { color: 'default', text: status || '-' }
        return (
          <Tag color={statusInfo.color} icon={statusInfo.icon}>
            {statusInfo.text}
          </Tag>
        )
      },
    },
    {
      title: 'Thời gian gửi',
      dataIndex: 'sentAt',
      key: 'sentAt',
      render: (sentAt) => (sentAt ? new Date(sentAt).toLocaleString('vi-VN') : '-'),
    },
  ]

  if (!emailHistory || emailHistory.length === 0) {
    return (
      <Card title="Lịch sử gửi email">
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
          <Text type="secondary">Chưa có lịch sử gửi email</Text>
        </div>
      </Card>
    )
  }

  return (
    <Card title="Lịch sử gửi email">
      <Table
        columns={columns}
        dataSource={emailHistory}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} email`,
        }}
      />
    </Card>
  )
}

