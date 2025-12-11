'use client'
import React from 'react'
import { Form, Space } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx' 

export function BlogFormActions({ loading, onCancel, onPreview, onSubmit }) {
  return (
    <Form.Item style={{ marginTop: 24 }}>
      <Space>
        {/* Nút Hủy */}
        <ButtonV2
          title="Hủy"
          color="charcoal"
          onPress={onCancel}
          style={{ minWidth: 80, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
        />

        {/* 👇 Nút Xem Trước (Mới) */}
        <ButtonV2
          title="Xem trước"
          color="poppy" // Hoặc màu nào nhẹ nhàng hơn 'poppy'
          icon={<EyeOutlined style={{ color: 'white', marginRight: 5 }} />}
          onPress={onPreview}
          style={{ minWidth: 120, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
        />

        {/* Nút Đăng Bài */}
        <ButtonV2
          title={loading ? 'Đang lưu...' : 'Đăng bài'}
          color="poppy"
          onPress={onSubmit} 
          style={{ minWidth: 120, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
        />
      </Space>
    </Form.Item>
  )
}