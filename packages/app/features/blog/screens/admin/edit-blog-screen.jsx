'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'solito/navigation'
import { Card, Form, Typography, message, Space, Spin, Button } from 'antd'
import { ArrowLeftOutlined, EyeOutlined, SaveOutlined } from '@ant-design/icons'
import { getBlogById, updateBlog } from '../../api'
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

export function EditBlogScreen() {
  const router = useRouter()
  const params = useParams()
  const blogId = params?.id
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [blogData, setBlogData] = useState(null)
  
  // State quản lý Preview
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState(null)

  // Load blog data
  useEffect(() => {
    const loadBlog = async () => {
      if (!blogId) return
      try {
        setLoading(true)
        const data = await getBlogById(blogId)
        setBlogData(data)
        
        // Set form values
        form.setFieldsValue({
          title: data.title || '',
          thumbnailUrl: data.thumbnailUrl || '', // Back-end should use thumbnailUrl
          content: data.content || '',
          shortDescription: data.shortDescription || '',
          categoryId: data.categoryId || '',
          tags: data.tags || [],
          isPublished: data.status === 1,
        })
      } catch (error) {
        console.error('Failed to load blog:', error)
        message.error('Không thể tải bài viết')
        router.back()
      } finally {
        setLoading(false)
      }
    }
    loadBlog()
  }, [blogId, form])

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
      setSaving(true)
      const payload = {
        title: values.title,
        thumbnailUrl: values.thumbnailUrl,
        content: values.content,
        shortDescription: values.shortDescription,
        status: values.isPublished ? 1 : 0,
        categoryId: values.categoryId,
        tags: values.tags || [],
      }
      
      await updateBlog(blogId, payload)
      message.success('Đã cập nhật bài viết thành công')
      router.back()
    } catch (error) {
      console.error(error)
      message.error('Cập nhật bài viết thất bại')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
        <Spin size="large" />
        <Text type="secondary">Đang tải dữ liệu bài viết...</Text>
      </div>
    )
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
            Chỉnh sửa bài viết
          </Title>
          <Text type="secondary">Sửa đổi thông tin và cập nhật nội dung bài viết</Text>
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
            loading={saving}
            onClick={() => form.submit()}
            style={BUTTON_STYLE}
          >
            Lưu thay đổi
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
        >
          <BlogGeneralInfo />
          
          <BlogEditor 
            name="content" 
            label="Nội dung chi tiết"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          />

          <BlogMetaInfo />
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

export default EditBlogScreen
