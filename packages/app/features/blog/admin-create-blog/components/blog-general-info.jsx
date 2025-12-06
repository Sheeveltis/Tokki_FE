'use client'
import React from 'react'
import { Form, Input, Select, Row, Col } from 'antd'

const { TextArea } = Input

export function BlogGeneralInfo() {
  return (
    <>
      {/* Hàng 1: Tiêu đề + Danh mục */}
      <Row gutter={16}>
        <Col span={16}>
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề bài viết" size="large" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Danh mục"
            name="categoryId"
            rules={[{ required: true, message: 'Chọn danh mục' }]}
          >
            <Select placeholder="Chọn danh mục" size="large">
              <Select.Option value="cat_korea_culture">Văn hóa Hàn Quốc</Select.Option>
              <Select.Option value="cat_topik_exam">Luyện thi TOPIK</Select.Option>
              <Select.Option value="cat_fashion">Thời trang</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* Hàng 2: Ảnh bìa */}
      <Form.Item
        label="Link ảnh bìa (Thumbnail URL)"
        name="thumbnailUrl"
        rules={[{ required: true, message: 'Vui lòng nhập link ảnh' }]}
      >
        <Input placeholder="https://example.com/image.jpg" size="large" />
      </Form.Item>

      {/* Hàng 3: Mô tả ngắn */}
      <Form.Item
        label="Mô tả ngắn"
        name="shortDescription"
        rules={[{ required: true, message: 'Vui lòng nhập mô tả ngắn' }]}
      >
        <TextArea 
          rows={3} 
          placeholder="Đoạn tóm tắt hiển thị trên thẻ bài viết..." 
          maxLength={300}
          showCount
        />
      </Form.Item>
    </>
  )
}