'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'solito/navigation'
import { View, Text, StyleSheet, Image } from 'react-native'
import { Button, Space, Tag, Popconfirm, message, Dropdown, Spin } from 'antd'
import { EditOutlined, ArrowLeftOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons'
import { getBlogById, deleteBlog, updateBlog } from '../../api'
import { getCurrentUserId, getCurrentUserRole } from '../../../../provider/api/client'
import { BlogComments } from '../../components/blog-detail/blog-comments'
import { HtmlViewer } from '../../components/blog-detail/html-viewer'
import { BlogTags } from '../../components/blog-detail/blog-tags'
import { BlogAuthor } from '../../components/blog-detail/blog-author'
import { AdminLayout } from 'app/features/back-office/components/admin/admin-layout.web'
import { StaffLayout } from 'app/features/back-office/components/staff/staff-layout.web'
import { ModeratorLayout } from 'app/features/moderator/components/moderator-layout.web'
import { Row, Col } from 'antd'

// BlogStatus enum mapping
const BLOG_STATUS = {
  0: { label: 'Nháp', color: 'orange' },
  1: { label: 'Đã đăng', color: 'green' },
  2: { label: 'Đã ẩn', color: 'default' },
  3: { label: 'Lưu trữ', color: 'blue' },
  4: { label: 'Chờ phê duyệt', color: 'gold' },
  5: { label: 'Đã từ chối', color: 'red' },
}

export function ViewBlogScreen() {
  const router = useRouter()
  const params = useParams()
  const blogId = params?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [blogData, setBlogData] = useState(null)
  const [updating, setUpdating] = useState(false)

  // Xác định cổng hiện tại
  const getCurrentPortal = () => {
    if (typeof window === 'undefined') return 'admin'
    const pathname = window.location.pathname
    if (pathname.startsWith('/staff/')) return 'staff'
    if (pathname.startsWith('/moderator/')) return 'moderator'
    return 'admin'
  }
  
  const currentPortal = getCurrentPortal()
  const portalPrefix = currentPortal === 'staff' ? '/staff' : currentPortal === 'moderator' ? '/moderator' : '/admin'
  const Layout = currentPortal === 'staff' ? StaffLayout : currentPortal === 'moderator' ? ModeratorLayout : AdminLayout

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

  // Kiểm tra quyền chỉnh sửa (chỉ khi status là Draft)
  const canEdit = () => {
    if (!blogData) return false
    const currentUserId = getCurrentUserId()
    const currentUserRole = getCurrentUserRole()
    const isAdmin = currentUserRole === 'Admin'
    const isAuthor = blogData.author?.id === currentUserId
    
    // Chỉ cho phép edit nếu là admin hoặc là tác giả, và status là draft (0)
    return (isAdmin || isAuthor) && blogData.status === 0
  }

  // Kiểm tra quyền xóa
  const canDelete = () => {
    if (!blogData) return false
    const currentUserRole = getCurrentUserRole()
    const currentUserId = getCurrentUserId()
    const isAdmin = currentUserRole === 'Admin'
    const isAuthor = blogData.author?.id === currentUserId
    
    // Admin hoặc tác giả có thể xóa
    return isAdmin || isAuthor
  }

  const handleEdit = () => {
    router.push(`${portalPrefix}/blog/${blogId}/edit`)
  }

  const handleBack = () => {
    router.push(`${portalPrefix}?tab=blog`)
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
      
      // Reload blog data
      const data = await getBlogById(blogId)
      setBlogData(data)
    } catch (error) {
      console.error('Failed to update status:', error)
      message.error('Cập nhật trạng thái thất bại')
    } finally {
      setUpdating(false)
    }
  }

  // Status menu items
  const getStatusMenuItems = () => {
    if (!blogData) return []
    
    const currentStatus = blogData.status
    const items = []
    
    // Chỉ hiển thị các status có thể chuyển đổi
    Object.entries(BLOG_STATUS).forEach(([status, info]) => {
      const statusNum = parseInt(status)
      // Không hiển thị status hiện tại
      if (statusNum !== currentStatus) {
        items.push({
          key: status,
          label: (
            <span onClick={() => handleStatusChange(statusNum)}>
              {info.label}
            </span>
          ),
        })
      }
    })
    
    return items
  }

  const handleNavigate = (key) => {
    if (currentPortal === 'staff') {
      router.push(`/staff?tab=${key}`)
    } else if (currentPortal === 'moderator') {
      router.push(`/moderator?tab=${key}`)
    } else {
      router.push(`/admin?tab=${key}`)
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Spin size="large" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      )
    }

    if (error || !blogData) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Không tìm thấy bài viết'}</Text>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            style={{ marginTop: 16 }}
          >
            Quay lại
          </Button>
        </View>
      )
    }

    const currentStatus = blogData.status || 0
    const statusInfo = BLOG_STATUS[currentStatus] || BLOG_STATUS[0]

    return (
      <View style={styles.contentWrapper}>
        {/* Header với action buttons */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              style={styles.backButton}
            >
              Quay lại
            </Button>
            <Tag color={statusInfo.color} style={styles.statusTag}>
              {statusInfo.label}
            </Tag>
          </View>
          <Space>
            {canEdit() && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
                loading={updating}
              >
                Chỉnh sửa
              </Button>
            )}
            
            <Dropdown
              menu={{ items: getStatusMenuItems() }}
              trigger={['click']}
              disabled={updating}
            >
              <Button icon={<MoreOutlined />} loading={updating}>
                Cập nhật trạng thái
              </Button>
            </Dropdown>
            
            {canDelete() && (
              <Popconfirm
                title="Xác nhận xóa"
                description="Bạn có chắc chắn muốn xóa bài viết này?"
                onConfirm={handleDelete}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  loading={updating}
                >
                  Xóa
                </Button>
              </Popconfirm>
            )}
          </Space>
        </View>

        {/* Blog Content với Comments sidebar bên phải */}
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <View style={styles.blogContent}>
              {/* Chỉ hiển thị nội dung chính, không có comments */}
              <View>
                {/* Category Badge */}
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{blogData.categoryName || blogData.category}</Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>{blogData.title}</Text>

                {/* Thumbnail */}
                {blogData.thumbnailUrl && (
                  <Image 
                    source={{ uri: blogData.thumbnailUrl }} 
                    style={styles.image} 
                    resizeMode="cover"
                  />
                )}

                {/* Content */}
                <HtmlViewer html={blogData.content} />

                {/* Tags */}
                {blogData.tags && blogData.tags.length > 0 && (
                  <BlogTags tags={blogData.tags} />
                )}

                {/* Author Info */}
                <BlogAuthor 
                  author={blogData.author}
                  createdAt={blogData.createdAt}
                  viewCount={blogData.viewCount}
                />
              </View>
            </View>
          </Col>
          <Col xs={24} lg={8}>
            <View style={styles.commentsSidebar}>
              <BlogComments blogId={blogData.id} />
            </View>
          </Col>
        </Row>
      </View>
    )
  }

  const screens = {
    blog: renderContent(),
  }

  return (
    <Layout
      screens={screens}
      defaultKey="blog"
      onNavigate={handleNavigate}
      onLogout={() => router.push('/login')}
    />
  )
}

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    marginRight: 8,
  },
  statusTag: {
    fontSize: 14,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    gap: 16,
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 16,
    marginBottom: 16,
  },
  blogContent: {
    width: '100%',
  },
  commentsSidebar: {
    position: 'sticky',
    top: 100,
    maxHeight: 'calc(100vh - 120px)',
    overflowY: 'auto',
  },
  badge: {
    backgroundColor: '#ff4d4f',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 16,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    lineHeight: 42,
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  image: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: '#f0f0f0',
  },
})

export default ViewBlogScreen
