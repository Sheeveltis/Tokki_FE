'use client'

import React from 'react'
import { Form, Input, Select, Switch } from 'antd'

const { TextArea } = Input

export function QuestionTypeForm({ form }) {
  return (
    <>
      <Form.Item
        label="Code"
        name="code"
        rules={[
          { required: true, message: 'Vui lòng nhập code' },
          { pattern: /^[A-Z0-9_]+$/, message: 'Code chỉ được chứa chữ in hoa, số và gạch dưới' },
        ]}
      >
        <Input placeholder="VD: REA_TOP, LIS_LOC" size="large" style={{ textTransform: 'uppercase' }} />
      </Form.Item>

      <Form.Item
        label="Tên loại câu hỏi"
        name="name"
        rules={[{ required: true, message: 'Vui lòng nhập tên loại câu hỏi' }]}
      >
        <Input placeholder="VD: Reading - Identify Topic" size="large" />
      </Form.Item>

      <Form.Item
        label="Mô tả"
        name="description"
        rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
      >
        <TextArea rows={3} placeholder="Mô tả loại câu hỏi..." size="large" />
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
        label="Độ khó"
        name="difficulty"
        rules={[{ required: true, message: 'Vui lòng chọn độ khó' }]}
      >
        <Select
          size="large"
          placeholder="Chọn độ khó"
          options={[
            { value: 1, label: 'Dễ' },
            { value: 2, label: 'Trung bình' },
            { value: 3, label: 'Khó' },
            { value: 4, label: 'Rất khó' },
          ]}
        />
      </Form.Item>

      <Form.Item
        label="TOPIK"
        name="examType"
        rules={[{ required: true, message: 'Vui lòng chọn TOPIK' }]}
      >
        <Select
          size="large"
          placeholder="Chọn TOPIK"
          options={[
            { value: 1, label: 'TOPIK I' },
            { value: 2, label: 'TOPIK II' },
          ]}
        />
      </Form.Item>

      <Form.Item label="Trạng thái" name="isActive" valuePropName="checked" initialValue={true}>
        <Switch checkedChildren="Hoạt động" unCheckedChildren="Không hoạt động" />
      </Form.Item>
    </>
  )
}

