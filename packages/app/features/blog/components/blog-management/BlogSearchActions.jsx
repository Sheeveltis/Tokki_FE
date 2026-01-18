'use client'
import React from 'react'
import { Input, Space, Select } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'

export function BlogSearchActions({ search, status, onSearchChange, onStatusChange, onCreate }) {
  return (
    <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder="Tìm theo tiêu đề, tác giả, trạng thái"
        style={{ maxWidth: 520, minWidth: 360, flex: 1 }}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Select
        allowClear
        placeholder="Lọc trạng thái"
        style={{ width: 180 }}
        value={status}
        onChange={onStatusChange}
        options={[
          { label: 'Nháp', value: 0 },
          { label: 'Đã đăng', value: 1 },
          { label: 'Đã ẩn', value: 2 },
          { label: 'Lưu trữ', value: 3 },
        ]}
      />
      <ButtonV2
        title="Thêm"
        color="#F1BE4B"
        onPress={onCreate}
        style={{ minWidth: 80, paddingVertical: 10 }}
        textStyle={{ fontSize: 14 }}
      />
    </Space>
  )
}

export default BlogSearchActions

