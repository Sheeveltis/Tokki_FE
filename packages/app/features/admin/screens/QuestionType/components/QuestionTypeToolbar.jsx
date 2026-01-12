'use client'

import React from 'react'
import { Input, Space, Select } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../../../components/buttonV2.jsx'

const { Option } = Select

export function QuestionTypeToolbar({ filters, onFilterChange, onCreate }) {
  const handleInputChange = (e) => {
    onFilterChange({ ...filters, keyword: e.target.value })
  }

  const handleSelectChange = (name, value) => {
    onFilterChange({ ...filters, [name]: value })
  }

  const handleCreate = () => {
    if (onCreate) onCreate()
  }

  return (
    <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
      <Space wrap>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm theo keyword..."
          style={{ minWidth: 250, flexGrow: 1 }}
          value={filters.keyword}
          onChange={handleInputChange}
        />
        <Select
          placeholder="Lọc theo kỹ năng"
          allowClear
          style={{ minWidth: 150 }}
          value={filters.skill}
          onChange={(value) => handleSelectChange('skill', value)}
        >
          <Option value={1}>Nghe</Option>
          <Option value={2}>Đọc</Option>
          <Option value={3}>Viết</Option>
        </Select>
        <Select
          placeholder="Lọc theo mức độ"
          allowClear
          style={{ minWidth: 150 }}
          value={filters.difficulty}
          onChange={(value) => handleSelectChange('difficulty', value)}
        >
          <Option value={1}>Dễ</Option>
          <Option value={2}>Trung bình</Option>
          <Option value={3}>Khó</Option>
        </Select>
        <Select
          placeholder="Lọc theo loại đề"
          allowClear
          style={{ minWidth: 150 }}
          value={filters.examType}
          onChange={(value) => handleSelectChange('examType', value)}
        >
          <Option value={1}>TOPIK I</Option>
          <Option value={2}>TOPIK II</Option>
          <Option value={3}>Test đầu vào</Option>
        </Select>
      </Space>

      {onCreate ? (
        <ButtonV2
          title="Thêm bộ câu hỏi"
          color="#F1BE4B"
          onPress={handleCreate}
          style={{ minWidth: 150, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
        />
      ) : null}
    </Space>
  )
}

export default QuestionTypeToolbar

