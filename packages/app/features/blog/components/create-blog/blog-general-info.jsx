'use client'
import React, { useEffect, useState } from 'react'
import { Form, Input, Select, Row, Col, Upload, Button, Image, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { getAllCategories, uploadBlogImageToCloudinary } from '../../api'

const { TextArea } = Input

export function BlogGeneralInfo() {
  const form = Form.useFormInstance()
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)

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

  const handleThumbnailUpload = async ({ file }) => {
    const rawFile = file?.originFileObj || file
    if (!rawFile) return

    try {
      setUploading(true)
      const url = await uploadBlogImageToCloudinary(rawFile)
      if (url) {
        form.setFieldsValue({ thumbnail: url })
        setThumbnailPreview(url)
        message.success('Upload ảnh bìa thành công')
      }
    } catch (err) {
      message.error(err?.message || 'Upload ảnh bìa thất bại')
    } finally {
      setUploading(false)
    }
  }

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

      {/* Hàng 2: Ảnh bìa - upload lên Cloudinary */}
      <Form.Item
        label="Ảnh bìa (Thumbnail)"
        name="thumbnail"
        rules={[{ required: true, message: 'Vui lòng upload ảnh bìa' }]}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Upload
            showUploadList={false}
            customRequest={handleThumbnailUpload}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />} loading={uploading}>
              Chọn ảnh
            </Button>
          </Upload>
          {thumbnailPreview && (
            <Image
              src={thumbnailPreview}
              alt="Thumbnail preview"
              width={80}
              height={80}
              style={{ objectFit: 'cover', borderRadius: 8 }}
            />
          )}
        </div>
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