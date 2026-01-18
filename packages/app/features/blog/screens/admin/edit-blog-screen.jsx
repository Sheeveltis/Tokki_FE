import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'solito/navigation'
import { Card, Form, Typography, message, Space, Spin } from 'antd'
import { AdminLayout } from 'app/features/back-office/components/admin/admin-layout.web'
import { StaffLayout } from 'app/features/back-office/components/staff/staff-layout.web'
import { getBlogById, updateBlog } from '../../api'
import { getCurrentUserId, getCurrentUserRole } from '../../../../provider/api/client.js'
import { BlogEditor } from '../../components/create-blog/blog-editor'
import { BlogGeneralInfo } from '../../components/create-blog/blog-general-info'
import { BlogMetaInfo } from '../../components/create-blog/blog-meta-info'
import { BlogFormActions } from '../../components/create-blog/blog-form-actions'
import { BlogPreviewModal } from '../../components/create-blog/blog-preview-modal'

const { Title } = Typography

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

  // Xác định cổng hiện tại
  const getCurrentPortal = () => {
    if (typeof window === 'undefined') return 'admin'
    const pathname = window.location.pathname
    if (pathname.startsWith('/staff/')) return 'staff'
    return 'admin'
  }
  
  const currentPortal = getCurrentPortal()
  const portalPrefix = currentPortal === 'staff' ? '/staff' : '/admin'
  const Layout = currentPortal === 'staff' ? StaffLayout : AdminLayout

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
          thumbnailUrl: data.thumbnailUrl || '',
          content: data.content || '',
          shortDescription: data.shortDescription || '',
          categoryId: data.categoryId || '',
          tags: data.tags || [],
          isPublished: data.status === 1,
        })
      } catch (error) {
        console.error('Failed to load blog:', error)
        message.error('Không thể tải bài viết')
        router.push(`${portalPrefix}?tab=blog`)
      } finally {
        setLoading(false)
      }
    }
    loadBlog()
  }, [blogId, form, router, portalPrefix])

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
      router.push(`${portalPrefix}?tab=blog`)
    } catch (error) {
      console.error(error)
      message.error('Cập nhật bài viết thất bại')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout defaultKey="blog" onNavigate={(key) => router.push(`${portalPrefix}?tab=${key}`)}>
        {/* Gắn form instance để tránh cảnh báo useForm chưa连接 Form */}
        <Form form={form} component={false} />
        <div style={{ padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Spin size="large" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout defaultKey="blog" onNavigate={(key) => router.push(`${portalPrefix}?tab=${key}`)}>
      <div style={{ padding: 24 }}>
        <Card>
          <Space orientation="vertical" size="large" style={{ width: '100%' }}>
            <Title level={3} style={{ marginBottom: 4 }}>
              Chỉnh sửa bài viết
            </Title>

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

              <BlogFormActions 
                loading={saving} 
                onCancel={() => router.push(`${portalPrefix}?tab=blog`)}
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
    </Layout>
  )
}

export default EditBlogScreen
