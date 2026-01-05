'use client'

import React from 'react'
import { Form, Input, Select, Space, Typography, Switch } from 'antd'

const { Title } = Typography
const { TextArea } = Input

/**
 * QuestionTypeForm Component
 * Form để nhập thông tin loại câu hỏi
 */
export function QuestionTypeForm({ form }) {
  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={4} style={{ marginBottom: 16 }}>
          Thông tin loại câu hỏi
        </Title>
      </div>

      <Form.Item
        label="Code"
        name="code"
        rules={[
          { required: true, message: 'Vui lòng nhập code' },
          { pattern: /^[A-Z0-9_]+$/, message: 'Code chỉ được chứa chữ in hoa, số và dấu gạch dưới' },
        ]}
      >
        <Input
          placeholder="VD: REA_TOP, LIS_LOC"
          size="large"
          style={{ textTransform: 'uppercase' }}
        />
      </Form.Item>

      <Form.Item
        label="Tên loại câu hỏi"
        name="name"
        rules={[{ required: true, message: 'Vui lòng nhập tên loại câu hỏi' }]}
      >
        <Input
          placeholder="VD: Reading - Identify Topic"
          size="large"
        />
      </Form.Item>

      <Form.Item
        label="Mô tả"
        name="description"
        rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
      >
        <TextArea
          rows={4}
          placeholder="Mô tả loại câu hỏi..."
          size="large"
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
            { value: 1, label: 'Nghe' },
            { value: 2, label: 'Đọc' },
            { value: 3, label: 'Viết' },
          ]}
        />
      </Form.Item>

      <Form.Item
        label="Trạng thái"
        name="isActive"
        valuePropName="checked"
        initialValue={true}
      >
        <Switch checkedChildren="Hoạt động" unCheckedChildren="Không hoạt động" />
      </Form.Item>
    </Space>
  )
}

