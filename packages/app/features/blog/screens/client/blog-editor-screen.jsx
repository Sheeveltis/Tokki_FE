'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'solito/navigation'
import { Card, Form, Typography, message, Space, Spin, Button, ConfigProvider, Modal } from 'antd'
import { ArrowLeftOutlined, EyeOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons'
import { getBlogUserDetail, saveBlog, submitBlogForApproval } from '../../api'
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
  const [loading, setLoading] = useState(true) // Always start with loading true
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // State quản lý Preview
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState(null)

  // Load blog data if editing
  useEffect(() => {
    let mounted = true;
    
    // Nếu không phải trang edit, tắt loading ngay
    if (!blogId) {
      setLoading(false)
      return
    }

    const loadBlog = async () => {
      try {
        setLoading(true)
        const data = await getBlogUserDetail(blogId)

        if (mounted) {
          // Set form values
          form.setFieldsValue({
            id: data.id || blogId,
            title: data.title || '',
            thumbnailUrl: data.thumbnailUrl || '',
            content: data.content || '',
            shortDescription: data.shortDescription || '',
            categoryId: data.categoryId || '',
            tags: data.tags || [],
          })
        }
      } catch (error) {
        console.error('Failed to load blog for edit:', error)
        if (mounted) {
          message.error('Không thể tải bài viết để chỉnh sửa')
          router.push('/blog/management')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    loadBlog()
    
    return () => { mounted = false; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogId])

  const handlePreview = () => {
    const values = form.getFieldsValue()
    if (!values.title && !values.content) {
      message.warning('Vui lòng nhập ít nhất Tiêu đề hoặc Nội dung để xem trước')
      return
    }
    setPreviewData(values)
    setPreviewOpen(true)
  }

  const handleSaveOnly = async () => {
    try {
      const values = await form.validateFields()
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
        message.success('Đã lưu nội dung bài viết thành công')
        // Trả về management sau khi lưu
        router.push('/blog/management')
      } else {
        throw new Error(response?.message || 'Có lỗi xảy ra khi lưu bài viết')
      }
    } catch (error) {
      if (error?.errorFields) return; // Form validation failed
      console.error('Save blog error:', error)
      message.error(error.message || 'Lưu bài viết thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitForApproval = () => {
    form.validateFields().then((values) => {
      Modal.confirm({
        title: 'Gửi duyệt bài viết?',
        content: 'Bài viết sẽ được gửi để quản trị viên kiểm duyệt. Bạn không thể chỉnh sửa trong quá trình này.',
        okText: 'Gửi duyệt ngay',
        cancelText: 'Để sau',
        centered: true,
        onOk: async () => {
          try {
            setSubmitting(true)
            // Bước 1: Lưu nội dung trước
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
            if (!response?.isSuccess) {
              throw new Error(response?.message || 'Lưu bài viết thất bại, không thể gửi duyệt.')
            }

            // Bước 2: Gọi api gửi duyệt với ID (nếu tạo mới thì lấy ID từ response data)
            const createdOrUpdatedId = response?.data?.id || (response?.data && typeof response?.data === 'string' ? response.data : null) || blogId
            
            if (!createdOrUpdatedId) {
              throw new Error('Không lấy được ID bài viết để gửi duyệt.')
            }

            const submitRes = await submitBlogForApproval(createdOrUpdatedId)
            if (submitRes?.isSuccess) {
              message.success('Đã gửi bài viết thành công. Vui lòng chờ kiểm duyệt!')
              router.push('/blog/management')
            } else {
              throw new Error(submitRes?.message || 'Có lỗi xảy ra khi gửi duyệt')
            }

          } catch (error) {
            console.error('Submit for approval error:', error)
            message.error(error.message || 'Gửi duyệt bài viết thất bại')
          } finally {
            setSubmitting(false)
          }
        }
      })
    }).catch(info => {
      console.log('Validation failed:', info)
    })
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', flexDirection: 'column', gap: 20, backgroundColor: '#FDFBF4' }}>
        <Spin size="large" />
        <Text type="secondary" style={{ fontSize: 16 }}>Đang chuẩn bị trình soạn thảo (blogId: {blogId})...</Text>
      </div>
    )
  }

  // Rest of the screen is rendered when loading = false
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
                icon={<SaveOutlined />}
                loading={saving}
                disabled={submitting}
                onClick={handleSaveOnly}
                style={BUTTON_STYLE}
              >
                Lưu
              </Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={submitting}
                disabled={saving}
                onClick={handleSubmitForApproval}
                style={BUTTON_STYLE}
              >
                Gửi duyệt
              </Button>
            </Space>
          </div>

          <Card variant="borderless" style={{ borderRadius: 24, boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
            <Form
              form={form}
              layout="vertical"
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
