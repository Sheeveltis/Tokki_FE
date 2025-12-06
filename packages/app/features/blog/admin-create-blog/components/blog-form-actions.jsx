'use client'
import React from 'react'
import { Form, Space } from 'antd'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx' // Đường dẫn file button của bạn

export function BlogFormActions({ loading, onCancel, onSubmit }) {
  return (
    <Form.Item style={{ marginTop: 24 }}>
      <Space>
        <ButtonV2
          title="Hủy"
          color="charcoal"
          onPress={onCancel}
          style={{ minWidth: 100, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
        />
        <ButtonV2
          title={loading ? 'Đang lưu...' : 'Đăng bài'}
          color="poppy"
          onPress={onSubmit} // Gọi hàm submit của form
          style={{ minWidth: 120, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
        />
      </Space>
    </Form.Item>
  )
}