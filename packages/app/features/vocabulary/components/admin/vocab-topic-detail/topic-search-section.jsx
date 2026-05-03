'use client'

import React from 'react'
import { Card, Space, Input, Select, Table, Tag } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

const { Option } = Select

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 0, label: 'Bản nháp' },
  { value: 1, label: 'Đang hoạt động' },
  { value: 2, label: 'Đã xóa' },
  { value: 3, label: 'Chờ phê duyệt' },
  { value: 4, label: 'Bị từ chối phê duyệt' },
]

export function TopicSearchSection({
  searchTerm,
  level,
  status,
  onSearchTermChange,
  onLevelChange,
  onStatusChange,
  onSearch,
  searching,
  dataSource,
  pagination,
  onTableChange,
}) {
  const columns = [
    { title: 'Mã', dataIndex: 'topicId', key: 'topicId', width: 200 },
    { title: 'Tên chủ đề', dataIndex: 'topicName', key: 'topicName' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    { title: 'Level', dataIndex: 'level', key: 'level', width: 100, align: 'center' },
    {
      title: 'Số từ vựng',
      dataIndex: 'vocabularyCount',
      key: 'vocabularyCount',
      width: 120,
      align: 'center',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      align: 'center',
      render: (status) => {
        const statusMap = {
          0: { label: 'Bản nháp', color: 'default' },
          1: { label: 'Đang hoạt động', color: 'green' },
          2: { label: 'Đã xóa', color: 'red' },
          3: { label: 'Chờ phê duyệt', color: 'orange' },
          4: { label: 'Bị từ chối phê duyệt', color: 'red' },
        }
        const statusInfo = statusMap[status] || { label: 'Không xác định', color: 'default' }
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
      },
    },
  ]

  return (
    <Card title="Tìm kiếm chủ đề">
      <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
        <Space style={{ width: '100%' }} wrap>
          <Input
            placeholder="Tìm kiếm theo tên chủ đề..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            onPressEnter={onSearch}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            placeholder="Chọn level"
            value={level}
            onChange={onLevelChange}
            style={{ width: 150 }}
            allowClear
          >
            {[1, 2, 3, 4, 5, 6].map((lvl) => (
              <Option key={lvl} value={lvl}>
                Level {lvl}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Chọn trạng thái"
            value={status}
            onChange={onStatusChange}
            style={{ width: 150 }}
          >
            {STATUS_OPTIONS.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Space>
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={searching}
          pagination={pagination}
          onChange={onTableChange}
          locale={{ emptyText: 'Chưa có dữ liệu' }}
          rowKey="topicId"
        />
      </Space>
    </Card>
  )
}

export default TopicSearchSection

