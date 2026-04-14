'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'solito/navigation'
import { Card, Form, Typography, message, Space, Spin, Button, ConfigProvider } from 'antd'
import { ArrowLeftOutlined, EyeOutlined, SaveOutlined } from '@ant-design/icons'
import { getBlogById, saveBlog } from '../../api'
import { BlogEditor } from '../../components/create-blog/blog-editor'
import { BlogGeneralInfo } from '../../components/create-blog/blog-general-info'
import { BlogMetaInfo } from '../../components/create-blog/blog-meta-info'
import { BlogPreviewModal } from '../../components/create-blog/blog-preview-modal'

const { Title, Text } = Typography

const BUTTON_STYLE = {
  borderRadius: 24,
  height: 44,
  padding: '0 24px',
  fontWeight: 600,
  fontSize: 15
}

export function BlogEditorScreen() {
  const router = useRouter()
  const params = useParams()
  const blogId = params?.id // ID from URL if editing
  const isEdit = !!blogId

  const [form] = Form.useForm()
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  
  // State quản lý Preview
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState(null)

  // Load blog data if editing
  useEffect(() => {
    if (!isEdit) return

    const loadBlog = async () => {
      try {
        setLoading(true)
        const data = await getBlogById(blogId)
        
        // Set form values
        form.setFieldsValue({
          id: data.id || blogId,
          title: data.title || '',
          thumbnailUrl: data.thumbnailUrl || '',
          content: data.content || '',
          shortDescription: data.shortDescription || '',
          categoryId: data.categoryId || '',
          tags: data.tags || [],
          isPublished: data.status === 1,
        })
      } catch (error) {
        console.error('Failed to load blog for edit:', error)
        message.error('Không thể tải bài viết để chỉnh sửa')
        router.push('/blog/management')
      } finally {
        setLoading(false)
      }
    }
    loadBlog()
  }, [blogId, isEdit, form, router])

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
    Modal.confirm({
      title: isEdit ? 'Cập nhật bài viết?' : 'Xuất bản bài viết bài viết?',
      content: 'Nội dung sau khi xuất bản sẽ trải qua hai bước kiểm duyệt: đầu tiên là hệ thống lọc từ khóa tự động, sau đó mới đến bước phê duyệt cuối cùng của quản trị viên (admin).',
      okText: isEdit ? 'Cập nhật ngay' : 'Xuất bản ngay',
      cancelText: 'Để sau',
      centered: true,
      onOk: async () => {
        try {
          setSaving(true)
          const payload = {
            id: isEdit ? blogId : undefined,
            title: values.title,
            thumbnailUrl: values.thumbnailUrl,
            content: values.content,
            shortDescription: values.shortDescription,
            categoryId: values.categoryId,
            tags: values.tags || [],
          }
          
          const response = await saveBlog(payload)
          if (response?.isSuccess) {
            message.success(isEdit ? 'Đã cập nhật bài viết thành công' : 'Đã gửi bài viết thành công. Vui lòng chờ kiểm duyệt!')
            router.push('/blog/management')
          } else {
            throw new Error(response?.message || 'Có lỗi xảy ra khi lưu bài viết')
          }
        } catch (error) {
          console.error('Save blog error:', error)
          message.error(error.message || 'Lưu bài viết thất bại')
        } finally {
          setSaving(false)
        }
      }
    })
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', flexDirection: 'column', gap: 20, backgroundColor: '#FDFBF4' }}>
        <Spin size="large" />
        <Text type="secondary" style={{ fontSize: 16 }}>Đang chuẩn bị trình soạn thảo...</Text>
      </div>
    )
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#F1BE4B',
          borderRadius: 16,
          fontFamily: "'Plus Jakarta Sans', 'Epilogue', sans-serif",
        }
      }}
    >
      <div style={{ backgroundColor: '#FDFBF4', minHeight: '100vh', padding: '40px 24px' }}>
        <div style={{ width: '92%', maxWidth: 1200, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: 20, 
            marginBottom: 32 
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Button 
                  type="text" 
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => router.push('/blog/management')}
                  style={{ borderRadius: '50%', width: 40, height: 40 }}
                />
                <Title level={2} style={{ margin: 0 }}>
                  {isEdit ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
                </Title>
              </div>
              <Text type="secondary" style={{ fontSize: 16, marginLeft: 52 }}>
                {isEdit ? 'Cập nhật lại nội dung câu chuyện của bạn' : 'Bắt đầu chia sẻ kiến thức và đam mê của bạn'}
              </Text>
            </div>

            <Space size="middle" wrap>
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
                {isEdit ? 'Cập nhật' : 'Xuất bản'}
              </Button>
            </Space>
          </div>

          <Card bordered={false} style={{ borderRadius: 24, boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              scrollToFirstError
              initialValues={{ tags: [], content: '' }}
            >
              <BlogGeneralInfo />
              
              <BlogEditor 
                name="content" 
                label="Nội dung truyền cảm hứng"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung bài viết' }]}
              />

              <BlogMetaInfo />
            </Form>
          </Card>
        </div>

        {/* Preview Modal */}
        <BlogPreviewModal 
          open={previewOpen}
          onCancel={() => setPreviewOpen(false)}
          data={previewData}
        />
      </div>
    </ConfigProvider>
  )
}

export default BlogEditorScreen
