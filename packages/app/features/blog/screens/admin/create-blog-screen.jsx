'use client'

import React, { useState } from 'react'
import { useRouter } from 'solito/navigation'
import { Card, Form, Typography, message, Space } from 'antd'
import { AdminLayout } from 'app/features/admin/components/admin-layout.web'
import { createBlog } from '../../api'
import { BlogEditor } from '../../components/create-blog/blog-editor'
import { BlogGeneralInfo } from '../../components/create-blog/blog-general-info'
import { BlogMetaInfo } from '../../components/create-blog/blog-meta-info'
import { BlogFormActions } from '../../components/create-blog/blog-form-actions'
import { BlogPreviewModal } from '../../components/create-blog/blog-preview-modal'

const { Title } = Typography

export function CreateBlogScreen() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  
  // State quản lý Preview
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState(null)

  // Hàm xử lý khi ấn nút "Xem trước"
  const handlePreview = () => {
    // Lấy dữ liệu hiện tại từ form (kể cả khi chưa validate xong cũng lấy được)
    const values = form.getFieldsValue()
    
    // Validate sơ bộ: Ít nhất phải có tiêu đề hoặc nội dung mới cho xem
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
        thumbnailUrl: values.thumbnail, // FE dùng thumbnail, API vẫn nhận thumbnailUrl
        content: values.content,
        shortDescription: values.shortDescription,
        status: values.isPublished ? 1 : 0,
        categoryId: values.categoryId,
        tags: values.tags || [],
      }
      
      await createBlog(payload)
      message.success('Đã tạo bài viết mới thành công')
      router.push('/admin?tab=blog')
    } catch (error) {
      console.error(error)
      message.error('Tạo bài viết thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout defaultKey="blog" onNavigate={(key) => router.push(`/admin?tab=${key}`)}>
      <div style={{ padding: 24 }}>
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title level={3} style={{ marginBottom: 4 }}>
              Tạo bài viết mới
            </Title>

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

              <BlogFormActions 
                loading={loading} 
                onCancel={() => router.push('/admin?tab=blog')}
                onPreview={handlePreview}
                onSubmit={() => form.submit()}
              />
            </Form>
          </Space>
        </Card>

        {/* Render Modal Preview */}
        <BlogPreviewModal 
          open={previewOpen}
          onCancel={() => setPreviewOpen(false)}
          data={previewData}
        />
      </div>
    </AdminLayout>
  )
}

export default CreateBlogScreen
