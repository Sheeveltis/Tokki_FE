'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'solito/navigation'
import { 
  Button, 
  Space, 
  Tag, 
  Popconfirm, 
  message, 
  Dropdown, 
  Spin, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Tabs, 
  Descriptions, 
  Avatar, 
  Divider,
  Alert,
  Statistic
} from 'antd'
import { 
  EditOutlined, 
  ArrowLeftOutlined, 
  DeleteOutlined, 
  MoreOutlined, 
  EyeOutlined, 
  CalendarOutlined, 
  UserOutlined, 
  FileTextOutlined,
  CommentOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SwapOutlined
} from '@ant-design/icons'
import { getBlogById, deleteBlog, updateBlog } from '../../api'
import { getCurrentUserId, getCurrentUserRole } from '../../../../provider/api/client.js'
import { BlogComments } from '../../components/blog-detail/blog-comments'
import { HtmlViewer } from '../../components/blog-detail/html-viewer'
import { BlogTags } from '../../components/blog-detail/blog-tags'

const { Title, Text } = Typography

// BlogStatus enum mapping
const BLOG_STATUS = {
  0: { label: 'Nháp', color: 'orange', icon: <ClockCircleOutlined /> },
  1: { label: 'Đã xuất bản', color: 'success', icon: <CheckCircleOutlined /> },
  2: { label: 'Đã ẩn', color: 'default', icon: <EyeOutlined /> },
  3: { label: 'Lưu trữ', color: 'blue', icon: <FileTextOutlined /> },
  4: { label: 'Chờ phê duyệt', color: 'gold', icon: <ClockCircleOutlined /> },
  5: { label: 'Đã từ chối', color: 'error', icon: <InfoCircleOutlined /> },
}

const BUTTON_STYLE = {
  borderRadius: 20,
  height: 40,
  padding: '0 20px',
  fontWeight: 600
}

const ICON_THEME_COLOR = '#1890ff' // Standard color for all icons as requested

export function ViewBlogScreen() {
  const router = useRouter()
  const params = useParams()
  const blogId = params?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [blogData, setBlogData] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState('content')

  // Xác định portal hiện tại
  const getCurrentPortal = () => {
    if (typeof window === 'undefined') return 'admin'
    const pathname = window.location.pathname
    if (pathname.startsWith('/staff/')) return 'staff'
    if (pathname.startsWith('/moderator/')) return 'moderator'
    return 'admin'
  }
  
  const currentPortal = getCurrentPortal()
  const portalPrefix = currentPortal === 'staff' ? '/staff' : currentPortal === 'moderator' ? '/moderator' : '/admin'

  // Load blog data
  useEffect(() => {
    const loadBlog = async () => {
      if (!blogId) return
      try {
        setLoading(true)
        setError(null)
        const data = await getBlogById(blogId)
        setBlogData(data)
      } catch (err) {
        console.error('Failed to load blog:', err)
        setError(err.message || 'Không thể tải bài viết')
      } finally {
        setLoading(false)
      }
    }
    loadBlog()
  }, [blogId])

  const canEdit = () => {
    if (!blogData) return false
    const currentUserId = getCurrentUserId()
    const currentUserRole = getCurrentUserRole()
    const isAdmin = currentUserRole === 'Admin'
    const isAuthor = blogData.author?.id === currentUserId
    return (isAdmin || isAuthor) && blogData.status === 0
  }

  const canDelete = () => {
    if (!blogData) return false
    const currentUserRole = getCurrentUserRole()
    const currentUserId = getCurrentUserId()
    const isAdmin = currentUserRole === 'Admin'
    const isAuthor = blogData.author?.id === currentUserId
    return isAdmin || isAuthor
  }

  const handleEdit = () => {
    router.push(`${portalPrefix}/blog/${blogId}/edit`)
  }

  const handleDelete = async () => {
    try {
      setUpdating(true)
      await deleteBlog(blogId)
      message.success('Đã xóa bài viết thành công')
      router.push(`${portalPrefix}?tab=blog`)
    } catch (error) {
      console.error('Failed to delete blog:', error)
      message.error('Xóa bài viết thất bại')
      setUpdating(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true)
      await updateBlog(blogId, {
        ...blogData,
        status: newStatus,
      })
      message.success(`Đã cập nhật trạng thái thành "${BLOG_STATUS[newStatus]?.label}"`)
      const data = await getBlogById(blogId)
      setBlogData(data)
    } catch (error) {
      message.error('Cập nhật trạng thái thất bại')
    } finally {
      setUpdating(false)
    }
  }

  const statusMenuItems = useMemo(() => {
    if (!blogData) return []
    return Object.entries(BLOG_STATUS)
      .filter(([status]) => parseInt(status) !== blogData.status)
      .map(([status, info]) => ({
        key: status,
        label: info.label,
        icon: info.icon,
        onClick: () => handleStatusChange(parseInt(status))
      }))
  }, [blogData])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
        <Spin size="large" />
        <Text type="secondary">Đang tải dữ liệu bài viết...</Text>
      </div>
    )
  }

  if (error || !blogData) {
    return (
      <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
        <Alert
          message={error || 'Không tìm thấy bài viết'}
          type="error"
          showIcon
          action={<Button onClick={() => router.back()}>Quay lại</Button>}
          style={{ maxWidth: 600, width: '100%' }}
        />
      </div>
    )
  }

  const statusInfo = BLOG_STATUS[blogData.status] || BLOG_STATUS[0]

  const tabItems = [
    {
      key: 'content',
      label: <Space><FileTextOutlined />Nội dung bài viết</Space>,
      children: (
        <div style={{ padding: '0 12px' }}>
          {blogData.thumbnailUrl && (
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
              <img 
                src={blogData.thumbnailUrl} 
                alt="Thumbnail" 
                style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
              />
            </div>
          )}
          <HtmlViewer html={blogData.content} />
          {blogData.tags && blogData.tags.length > 0 && (
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
              <BlogTags tags={blogData.tags} />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'info',
      label: <Space><InfoCircleOutlined />Thông tin cơ bản</Space>,
      children: (
        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label="Tiêu đề">{blogData.title}</Descriptions.Item>
          <Descriptions.Item label="Slug">{blogData.slug}</Descriptions.Item>
          <Descriptions.Item label="Danh mục">{blogData.categoryName}</Descriptions.Item>
          <Descriptions.Item label="Mô tả ngắn">{blogData.shortDescription}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">{new Date(blogData.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
          <Descriptions.Item label="Lượt xem">{blogData.viewCount} lượt</Descriptions.Item>
        </Descriptions>
      )
    },
    {
      key: 'comments',
      label: <Space><CommentOutlined />Bình luận</Space>,
      children: <BlogComments blogId={blogData.id} />
    }
  ]

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
            Chi tiết bài viết
          </Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Text type="secondary">ID: {blogData.id}</Text>
            <Tag color={statusInfo.color} style={{ borderRadius: 4, margin: 0 }}>
              {statusInfo.label}
            </Tag>
          </div>
        </div>

        <Space size="small" wrap>
          {canEdit() && (
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={handleEdit}
              style={BUTTON_STYLE}
            >
              Chỉnh sửa
            </Button>
          )}
          <Dropdown menu={{ items: statusMenuItems }} trigger={['click']}>
            <Button icon={<SwapOutlined />} style={BUTTON_STYLE}>
              Trạng thái
            </Button>
          </Dropdown>
          {canDelete() && (
            <Popconfirm
              title="Xác nhận xóa bài viết?"
              onConfirm={handleDelete}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />} style={BUTTON_STYLE}>
                Xóa
              </Button>
            </Popconfirm>
          )}
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.back()}
            style={BUTTON_STYLE}
          >
            Quay lại
          </Button>
        </Space>
      </div>

      {/* Stats Bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Lượt xem', value: blogData.viewCount, suffix: 'lượt', icon: <EyeOutlined style={{ color: ICON_THEME_COLOR }} />, border: '#91d5ff', bgColor: '#e6f7ff' },
            { label: 'Bình luận', value: '-', suffix: 'lượt', icon: <CommentOutlined style={{ color: ICON_THEME_COLOR }} />, border: '#ffe58f', bgColor: '#fffbe6' },
            { label: 'Danh mục', value: blogData.categoryName, suffix: '', icon: <GlobalOutlined style={{ color: ICON_THEME_COLOR }} />, border: '#ffadd2', bgColor: '#fff0f6' },
            { label: 'Ngày đăng', value: new Date(blogData.createdAt).toLocaleDateString('vi-VN'), suffix: '', icon: <CalendarOutlined style={{ color: ICON_THEME_COLOR }} />, border: '#b7eb8f', bgColor: '#f6ffed' },
          ].map((item, idx) => (
            <div key={idx} style={{ flex: '1 1 200px' }}>
              <Card
                style={{
                  borderRadius: 8,
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  borderBottom: `2px solid ${item.border}`,
                  height: '100%'
                }}
                bodyStyle={{ padding: 16 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div
                    style={{
                      width: 48, height: 48, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, flexShrink: 0,
                      backgroundColor: item.bgColor,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      type="secondary"
                      style={{
                        display: 'block', marginBottom: 4, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'
                      }}
                    >
                      {item.label}
                    </Text>
                    <Statistic
                      value={item.value}
                      suffix={<span style={{ fontSize: 13, marginLeft: 4 }}>{item.suffix}</span>}
                      valueStyle={{ fontSize: 20, fontWeight: 'bold', color: '#262626' }}
                    />
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <Row gutter={24}>
        <Col xs={24} lg={17}>
          <Card bordered={false} style={{ borderRadius: 16, minHeight: 600, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab} 
              items={tabItems}
              tabBarStyle={{ marginBottom: 24 }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={7}>
          <Space direction="vertical" style={{ width: '100%' }} size={24}>
            {/* Author Card */}
            <Card 
              title={<span style={{ fontWeight: 600 }}>Tác giả</span>} 
              bordered={false} 
              style={{ borderRadius: 16, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}
            >
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <Avatar 
                  size={80} 
                  src={blogData.author?.avatarUrl} 
                  icon={<UserOutlined />} 
                  style={{ marginBottom: 16, border: '4px solid #f0f2f5' }}
                />
                <Title level={5} style={{ margin: 0 }}>{blogData.author?.fullName || 'Ẩn danh'}</Title>
                <Text type="secondary" style={{ fontSize: 13 }}>ID: {blogData.author?.id}</Text>
              </div>
              <Divider style={{ margin: '16px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <Text type="secondary">Vai trò:</Text>
                <Tag color="cyan">Tác giả</Tag>
              </div>
            </Card>

            {/* Attributes Card */}
            <Card 
              title={<span style={{ fontWeight: 600 }}>Thuộc tính</span>} 
              bordered={false} 
              style={{ borderRadius: 16, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Ngày tạo:</Text>
                  <Text strong>{new Date(blogData.createdAt).toLocaleDateString('vi-VN')}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Độ dài tóm tắt:</Text>
                  <Text strong>{blogData.shortDescription?.length || 0} ký tự</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Chế độ:</Text>
                  <Tag color={blogData.status === 1 ? 'green' : 'gold'}>
                    {blogData.status === 1 ? 'Công khai' : 'Bản nháp'}
                  </Tag>
                </div>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  )
}

export default ViewBlogScreen
