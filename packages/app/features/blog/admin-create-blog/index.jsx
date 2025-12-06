'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Form, Typography, message, Space } from 'antd'
import { AdminLayout } from 'app/features/admin/components/admin-layout.web'
import { createArticle } from 'app/features/admin/api'

// Import các mảnh ghép đã tách
import { BlogEditor } from 'app/features/blog/admin-create-blog/components/blog-editor'
import { BlogGeneralInfo } from 'app/features/blog/admin-create-blog/components/blog-general-info'
import { BlogMetaInfo } from 'app/features/blog/admin-create-blog/components/blog-meta-info'
import { BlogFormActions } from 'app/features/blog/admin-create-blog/components/blog-form-actions'

const { Title } = Typography

export function CreateBlogScreen() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // Logic xử lý Submit
  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      const payload = {
        title: values.title,
        thumbnailUrl: values.thumbnailUrl,
        content: values.content,
        shortDescription: values.shortDescription,
        status: values.isPublished ? 1 : 0,
        categoryId: values.categoryId,
        tags: values.tags || [],
      }
      
      await createArticle(payload)
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
            >
              {/* 1. Thông tin chung */}
              <BlogGeneralInfo />

              {/* 2. Soạn thảo nội dung */}
              <BlogEditor 
                name="content" 
                label="Nội dung chi tiết"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
              />

              {/* 3. Thông tin meta (Tags, Status) */}
              <BlogMetaInfo />

              {/* 4. Nút bấm Action */}
              <BlogFormActions 
                loading={loading} 
                onCancel={() => router.push('/admin?tab=blog')}
                onSubmit={() => form.submit()}
              />
            </Form>
          </Space>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default CreateBlogScreen