'use client'
import React, { useEffect, useState } from 'react'
import { Form, Input, Select, Row, Col } from 'antd'
import { getAllCategories } from '../../api/api'

const { TextArea } = Input

export function BlogGeneralInfo() {
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  useEffect(() => {
    let mounted = true
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories()
        if (mounted) setCategories(data)
      } catch (err) {
        console.error('Không thể tải danh mục:', err)
      } finally {
        if (mounted) setLoadingCategories(false)
      }
    }
    fetchCategories()
    return () => {
      mounted = false
    }
  }, [])

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
            <Select
              placeholder="Chọn danh mục"
              size="large"
              loading={loadingCategories}
              disabled={loadingCategories}
            >
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
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