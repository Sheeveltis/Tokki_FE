'use client'

import React from 'react'
import { Space, Select, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

/**
 * QuestionFilter Component
 * Component để lọc câu hỏi theo các tiêu chí
 */
export function QuestionFilter({ filters, onFilterChange, onSearchChange }) {
  const { search, status } = filters

  return (
    <Space wrap size="middle" style={{ width: '100%', marginBottom: 16 }}>
      <Input
        placeholder="Tìm kiếm theo nội dung..."
        allowClear
        prefix={<SearchOutlined />}
        style={{ width: 300 }}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <Select
        placeholder="Trạng thái"
        allowClear
        style={{ width: 180 }}
        value={status}
        onChange={(value) => onFilterChange({ ...filters, status: value })}
        options={[
          { value: 0, label: 'Nháp' },
          { value: 1, label: 'Đang hoạt động' },
          { value: 2, label: 'Đã xóa' },
        ]}
      />
    </Space>
  )
}

