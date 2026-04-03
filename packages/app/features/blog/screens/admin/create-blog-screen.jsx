'use client'

import React, { useState } from 'react'
import { useRouter } from 'solito/navigation'
import { Card, Form, Typography, message, Space, Button } from 'antd'
import { ArrowLeftOutlined, EyeOutlined, SaveOutlined } from '@ant-design/icons'
import { createBlog } from '../../api'
import { BlogEditor } from '../../components/create-blog/blog-editor'
import { BlogGeneralInfo } from '../../components/create-blog/blog-general-info'
import { BlogMetaInfo } from '../../components/create-blog/blog-meta-info'
import { BlogPreviewModal } from '../../components/create-blog/blog-preview-modal'

const { Title, Text } = Typography

const BUTTON_STYLE = {
  borderRadius: 20,
  height: 40,
  padding: '0 20px',
  fontWeight: 600
}

export function CreateBlogScreen() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  
  // State quản lý Preview
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState(null)

  // Hàm xử lý khi ấn nút "Xem trước"
  const handlePreview = () => {
    const values = form.getFieldsValue()
    if (!values.title && !values.content) {
      message.warning('Vui lòng nhập ít nhất Tiêu đề hoặc Nội dung để xem trước')
      return
    }
    setPreviewData(values)
    setPreviewOpen(true)
  }

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      const payload = {
        title: values.title,
        thumbnailUrl: values.thumbnailUrl, // Back-end expects thumbnailUrl
        content: values.content,
        shortDescription: values.shortDescription,
        status: values.isPublished ? 1 : 0,
        categoryId: values.categoryId,
        tags: values.tags || [],
      }
      
      await createBlog(payload)
      message.success('Đã tạo bài bài viết mới thành công')
      router.push('/admin?tab=blog')
    } catch (error) {
      console.error(error)
      message.error('Tạo bài viết thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header Section */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: 12, 
          marginBottom: 24 
        }}
      >
        <div>
          <Title level={3} style={{ marginBottom: 4, marginTop: 0 }}>
            Tạo bài viết mới
          </Title>
          <Text type="secondary">Cung cấp thông tin để xuất bản bài viết mới</Text>
        </div>

        <Space size="small" wrap>
          <Button 
            icon={<EyeOutlined />} 
            onClick={handlePreview}
            style={BUTTON_STYLE}
          >
            Xem trước
          </Button>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            loading={loading}
            onClick={() => form.submit()}
            style={BUTTON_STYLE}
          >
            Lưu bài viết
          </Button>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.back()}
            style={BUTTON_STYLE}
          >
            Quay lại
          </Button>
        </Space>
      </div>

      <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ isPublished: false, tags: [] }}
        >
          <BlogGeneralInfo />
          
          <BlogEditor 
            name="content" 
            label="Nội dung chi tiết"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          />

          <BlogMetaInfo />
          
          {/* We keep the actions in the header, but could also keep a copy at the bottom if the form is long */}
        </Form>
      </Card>

      {/* Render Modal Preview */}
      <BlogPreviewModal 
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        data={previewData}
      />
    </div>
  )
}

export default CreateBlogScreen
