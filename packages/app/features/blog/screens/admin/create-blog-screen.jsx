'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'solito/navigation'
import { 
  Card, Form, Typography, message, Space, Spin, Button, 
  ConfigProvider, Modal, Row, Col, Input, Select, Upload, Image, Divider 
} from 'antd'
import { 
  ArrowLeftOutlined, EyeOutlined, SaveOutlined, SendOutlined, 
  FontSizeOutlined, MenuOutlined, SettingOutlined, InfoCircleOutlined,
  UploadOutlined,
  PictureOutlined
} from '@ant-design/icons'
import { 
  getBlogAdminDetail, 
  saveBlogAdmin, 
  submitBlogForApprovalAdmin,
  getAllCategories,
  uploadBlogImageToCloudinary
} from '../../api'
import { BlogEditor } from '../../components/create-blog/blog-editor'
import { BlogPreviewModal } from '../../components/create-blog/blog-preview-modal'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

const BUTTON_STYLE = {
  borderRadius: 24,
  height: 44,
  padding: '0 24px',
  fontWeight: 600,
  fontSize: 15
}

const SECTION_TITLE_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 20,
  fontSize: '16px',
  fontWeight: 700,
  color: '#262626'
}

export function CreateBlogScreen() {
  const router = useRouter()
  const params = useParams()
  const blogId = params?.id
  const isEdit = !!blogId

  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Logic for Categories and Upload (Moved from GeneralInfo)
  const [categories, setCategories] = useState([])
  const [uploading, setUploading] = useState(false)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)

  // State quản lý Preview
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState(null)

  // Fetch initial data
  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        setLoading(true)
        // 1. Fetch Categories
        const cats = await getAllCategories()
        if (mounted) setCategories(cats)

        // 2. Fetch Blog Detail if editing
        if (blogId) {
          const data = await getBlogAdminDetail(blogId)
          if (mounted) {
            form.setFieldsValue({
              id: data.id || blogId,
              title: data.title || '',
              thumbnailUrl: data.thumbnailUrl || '',
              content: data.content || '',
              shortDescription: data.shortDescription || '',
              categoryId: data.categoryId || '',
              tags: data.tags || [],
            })
            setThumbnailPreview(data.thumbnailUrl)
          }
        }
      } catch (error) {
        console.error('Failed to init data:', error)
        if (mounted) message.error('Không thể tải dữ liệu ban đầu')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [blogId, form])

  const handleThumbnailUpload = async ({ file }) => {
    const rawFile = file?.originFileObj || file
    if (!rawFile) return

    try {
      setUploading(true)
      const url = await uploadBlogImageToCloudinary(rawFile)
      if (url) {
        form.setFieldsValue({ thumbnailUrl: url })
        form.validateFields(['thumbnailUrl'])
        setThumbnailPreview(url)
        message.success('Upload ảnh bìa thành công')
      }
    } catch (err) {
      message.error(err?.message || 'Upload ảnh bìa thất bại')
    } finally {
      setUploading(false)
    }
  }

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
        id: isEdit ? blogId : null,
        title: values.title,
        thumbnailUrl: values.thumbnailUrl,
        content: values.content,
        shortDescription: values.shortDescription,
        categoryId: values.categoryId,
        tags: values.tags || [],
      }

      const response = await saveBlogAdmin(payload)
      if (response?.isSuccess) {
        message.success('Đã lưu nội dung bài viết thành công')
        router.push('/admin?tab=blog')
      } else {
        throw new Error(response?.message || 'Có lỗi xảy ra khi lưu bài viết')
      }
    } catch (error) {
      if (error?.errorFields) return
      message.error(error.message || 'Lưu bài viết thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitForApproval = () => {
    form.validateFields().then((values) => {
      Modal.confirm({
        title: 'Gửi duyệt bài viết?',
        content: 'Bài viết sẽ được gửi để hệ thống kiểm duyệt và xuất bản. Bạn có muốn tiếp tục?',
        okText: 'Gửi duyệt ngay',
        cancelText: 'Để sau',
        centered: true,
        onOk: async () => {
          try {
            setSubmitting(true)
            const payload = {
              id: isEdit ? blogId : null,
              title: values.title,
              thumbnailUrl: values.thumbnailUrl,
              content: values.content,
              shortDescription: values.shortDescription,
              categoryId: values.categoryId,
              tags: values.tags || [],
            }

            const response = await saveBlogAdmin(payload)
            if (!response?.isSuccess) throw new Error(response?.message || 'Lưu thất bại')

            // Lấy ID từ data trả về (đối với tạo mới) hoặc dùng blogId hiện tại
            const createdId = response?.data || blogId
            
            if (!createdId) throw new Error('Không lấy được ID bài viết để gửi duyệt.')

            const submitRes = await submitBlogForApprovalAdmin(createdId)
            if (submitRes?.isSuccess) {
              message.success('Đã gửi bài viết thành công!')
              router.push('/admin?tab=blog')
            } else {
              throw new Error(submitRes?.message || 'Gửi duyệt thất bại')
            }
          } catch (error) {
            message.error(error.message || 'Gửi duyệt bài viết thất bại')
          } finally {
            setSubmitting(false)
          }
        }
      })
    })
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', flexDirection: 'column', gap: 20 }}>
        <Spin size="large" />
        <Text type="secondary">Đang tải trình soạn thảo...</Text>
      </div>
    )
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 16,
          fontFamily: "'Plus Jakarta Sans', 'Epilogue', sans-serif",
        }
      }}
    >
      <div style={{ padding: '0 0 40px 0' }}>
        {/* Header toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Space align="center" size="middle">
             <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/admin?tab=blog')}
                style={{ borderRadius: '50%', width: 40, height: 40 }}
              />
              <Title level={4} style={{ margin: 0 }}>
                {isEdit ? 'Chỉnh sửa' : 'Tạo mới'} bài viết
              </Title>
          </Space>
          
          <Space size="middle">
            <Button icon={<EyeOutlined />} onClick={handlePreview} style={BUTTON_STYLE}>Xem trước</Button>
            <Button icon={<SaveOutlined />} loading={saving} disabled={submitting} onClick={handleSaveOnly} style={BUTTON_STYLE}>Lưu tạm</Button>
            <Button type="primary" icon={<SendOutlined />} loading={submitting} disabled={saving} onClick={handleSubmitForApproval} style={BUTTON_STYLE}>Gửi duyệt</Button>
          </Space>
        </div>

        <Form form={form} layout="vertical" scrollToFirstError initialValues={{ tags: [], content: '' }}>
          <Row gutter={[24, 24]}>
            {/* Left Content Column */}
            <Col span={16}>
              <Card variant="borderless" style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '12px 0' }}>
                {/* Title Section */}
                <div style={{ padding: '0 24px' }}>
                  <div style={SECTION_TITLE_STYLE}>
                    <FontSizeOutlined style={{ color: '#1890ff' }} />
                    Tiêu đề bài viết <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>
                  </div>
                  <Form.Item
                    name="title"
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                    style={{ marginBottom: 32 }}
                  >
                    <Input 
                      placeholder="Nhập tiêu đề hấp dẫn cho bài viết của bạn..." 
                      variant="borderless"
                      style={{ fontSize: '28px', fontWeight: 700, padding: '8px 0', borderBottom: '1px solid #f0f0f0', borderRadius: 0 }} 
                    />
                  </Form.Item>

                  <div style={SECTION_TITLE_STYLE}>
                    <MenuOutlined style={{ color: '#1890ff' }} />
                    Nội dung bài viết <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>
                  </div>
                </div>

                <div style={{ padding: '0 12px' }}>
                  <BlogEditor
                    name="content"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                  />
                </div>
              </Card>
            </Col>

            {/* Right Config Column */}
            <Col span={8}>
              <Space direction="vertical" size={24} style={{ width: '100%' }}>
                <Card 
                  title={<div style={{ ...SECTION_TITLE_STYLE, marginBottom: 0 }}><SettingOutlined style={{ color: '#1890ff' }} /> Cấu hình bài viết</div>} 
                  variant="borderless" 
                  style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
                >
                  {/* Thumbnail */}
                  <div style={{ marginBottom: 24 }}>
                    <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
                      Ảnh bìa (Thumbnail)
                    </Text>
                    <Form.Item name="thumbnailUrl" rules={[{ required: true, message: 'Vui lòng chọn ảnh bìa' }]} noStyle>
                      <Upload.Dragger
                        showUploadList={false}
                        customRequest={handleThumbnailUpload}
                        accept="image/*"
                        style={{ borderRadius: 16, backgroundColor: '#fafafa', border: '2px dashed #e8e8e8' }}
                      >
                        {thumbnailPreview ? (
                          <div style={{ padding: 8 }}>
                            <Image src={thumbnailPreview} alt="Thumbnail" preview={false} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12 }} />
                            <div style={{ marginTop: 8, color: '#1890ff' }}><UploadOutlined /> Thay đổi ảnh</div>
                          </div>
                        ) : (
                          <div style={{ padding: '24px 0' }}>
                            <p className="ant-upload-drag-icon">
                              <PictureOutlined style={{ fontSize: 40, color: '#d9d9d9' }} />
                            </p>
                            <p className="ant-upload-text" style={{ fontSize: 14 }}>Click để tải ảnh lên</p>
                          </div>
                        )}
                      </Upload.Dragger>
                    </Form.Item>
                  </div>

                  {/* Category */}
                  <Form.Item
                    label={<Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase' }}>Danh mục</Text>}
                    name="categoryId"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                  >
                    <Select placeholder="Chọn danh mục" size="large" style={{ borderRadius: 12 }}>
                      {categories.map((cat) => (
                        <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  {/* Short Description */}
                  <Form.Item
                    label={<div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase' }}>Mô tả ngắn</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>{form.getFieldValue('shortDescription')?.length || 0}/300</Text>
                    </div>}
                    name="shortDescription"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                  >
                    <TextArea 
                      rows={4} 
                      placeholder="Mô tả ngắn hiển thị trên thẻ bài viết..." 
                      maxLength={300}
                      style={{ borderRadius: 12, padding: 12, backgroundColor: '#f9f9f9', border: '1px solid #f0f0f0' }}
                    />
                  </Form.Item>

                  {/* Tags */}
                  <Form.Item
                    label={<Text strong style section={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase' }}>Thẻ (Tags)</Text>}
                    name="tags"
                  >
                    <Select mode="tags" placeholder="Enter tags..." size="large" style={{ borderRadius: 12 }} />
                  </Form.Item>
                </Card>

                {/* Help/Notes Card */}
                <Card 
                  variant="borderless" 
                  style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', borderLeft: '4px solid #1890ff' }}
                >
                  <div style={{ ...SECTION_TITLE_STYLE, color: '#1890ff', marginBottom: 12 }}>
                    <InfoCircleOutlined /> Lưu ý nhỏ
                  </div>
                  <ul style={{ paddingLeft: 20, color: '#595959', fontSize: 13, lineHeight: '22px', margin: 0 }}>
                    <li>Tiêu đề nên súc tích, dưới 70 ký tự.</li>
                    <li>Ảnh bìa đẹp giúp tăng tỉ lệ click (CTR).</li>
                    <li>Nội dung nên có ít nhất 1 hình ảnh minh họa.</li>
                    <li>Sử dụng các Heading để bài viết rõ ràng.</li>
                  </ul>
                </Card>
              </Space>
            </Col>
          </Row>
        </Form>

        <BlogPreviewModal
          open={previewOpen}
          onCancel={() => setPreviewOpen(false)}
          data={previewData}
        />
      </div>
    </ConfigProvider>
  )
}

export default CreateBlogScreen
