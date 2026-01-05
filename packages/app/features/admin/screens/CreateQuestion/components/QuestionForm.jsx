'use client'

import React from 'react'
import { Form, Input, Select, Space, Typography } from 'antd'

const { Title } = Typography
const { TextArea } = Input

/**
 * QuestionForm Component
 * Form để nhập thông tin câu hỏi
 */
export function QuestionForm({ form }) {
  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={4} style={{ marginBottom: 16 }}>
          Thông tin câu hỏi
        </Title>
      </div>

      <Form.Item
        label="Nội dung câu hỏi"
        name="content"
        rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
      >
        <TextArea
          rows={4}
          placeholder="Nhập nội dung câu hỏi..."
          size="large"
        />
      </Form.Item>

      <Form.Item
        label="Loại đề"
        name="examType"
        rules={[{ required: true, message: 'Vui lòng chọn loại đề' }]}
      >
        <Select
          size="large"
          placeholder="Chọn loại đề"
          options={[
            { value: 'TOPIK I', label: 'TOPIK I' },
            { value: 'TOPIK II', label: 'TOPIK II' },
            { value: 'KLPT', label: 'KLPT' },
            { value: 'EPS-TOPIK', label: 'EPS-TOPIK' },
          ]}
        />
      </Form.Item>

      <Form.Item
        label="Mức độ"
        name="difficulty"
        rules={[{ required: true, message: 'Vui lòng chọn mức độ' }]}
      >
        <Select
          size="large"
          placeholder="Chọn mức độ"
          options={[
            { value: 'easy', label: 'Dễ' },
            { value: 'medium', label: 'Trung bình' },
            { value: 'hard', label: 'Khó' },
          ]}
        />
      </Form.Item>

      <Form.Item
        label="Loại câu hỏi"
        name="type"
        rules={[{ required: true, message: 'Vui lòng chọn loại câu hỏi' }]}
      >
        <Select
          size="large"
          placeholder="Chọn loại câu hỏi"
          options={[
            { value: 'multiple-choice', label: 'Trắc nghiệm' },
            { value: 'true-false', label: 'Đúng/Sai' },
            { value: 'fill-blank', label: 'Điền vào chỗ trống' },
            { value: 'matching', label: 'Nối câu' },
            { value: 'essay', label: 'Tự luận' },
          ]}
        />
      </Form.Item>

      <Form.Item
        label="Kỹ năng"
        name="skill"
        rules={[{ required: true, message: 'Vui lòng chọn kỹ năng' }]}
      >
        <Select
          size="large"
          placeholder="Chọn kỹ năng"
          options={[
            { value: 'listening', label: 'Nghe' },
            { value: 'reading', label: 'Đọc' },
            { value: 'writing', label: 'Viết' },
            { value: 'speaking', label: 'Nói' },
          ]}
        />
      </Form.Item>
    </Space>
  )
}

