'use client'

import React from 'react'
import { Space, Select, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

const { Search } = Input

/**
 * QuestionFilter Component
 * Component để lọc câu hỏi theo các tiêu chí
 */
export function QuestionFilter({ filters, onFilterChange, onSearchChange }) {
  const { examType, difficulty, type, skill, search } = filters

  return (
    <Space wrap size="middle" style={{ width: '100%', marginBottom: 16 }}>
      <Search
        placeholder="Tìm kiếm theo nội dung..."
        allowClear
        prefix={<SearchOutlined />}
        style={{ width: 300 }}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onSearch={(value) => onSearchChange(value)}
      />

      <Select
        placeholder="Loại đề"
        allowClear
        style={{ width: 150 }}
        value={examType}
        onChange={(value) => onFilterChange({ ...filters, examType: value })}
        options={[
          { value: 'TOPIK I', label: 'TOPIK I' },
          { value: 'TOPIK II', label: 'TOPIK II' },
          { value: 'KLPT', label: 'KLPT' },
          { value: 'EPS-TOPIK', label: 'EPS-TOPIK' },
        ]}
      />

      <Select
        placeholder="Mức độ"
        allowClear
        style={{ width: 150 }}
        value={difficulty}
        onChange={(value) => onFilterChange({ ...filters, difficulty: value })}
        options={[
          { value: 'easy', label: 'Dễ' },
          { value: 'medium', label: 'Trung bình' },
          { value: 'hard', label: 'Khó' },
        ]}
      />

      <Select
        placeholder="Loại câu hỏi"
        allowClear
        style={{ width: 180 }}
        value={type}
        onChange={(value) => onFilterChange({ ...filters, type: value })}
        options={[
          { value: 'multiple-choice', label: 'Trắc nghiệm' },
          { value: 'true-false', label: 'Đúng/Sai' },
          { value: 'fill-blank', label: 'Điền vào chỗ trống' },
          { value: 'matching', label: 'Nối câu' },
          { value: 'essay', label: 'Tự luận' },
        ]}
      />

      <Select
        placeholder="Kỹ năng"
        allowClear
        style={{ width: 150 }}
        value={skill}
        onChange={(value) => onFilterChange({ ...filters, skill: value })}
        options={[
          { value: 'listening', label: 'Nghe' },
          { value: 'reading', label: 'Đọc' },
          { value: 'writing', label: 'Viết' },
          { value: 'speaking', label: 'Nói' },
        ]}
      />
    </Space>
  )
}

