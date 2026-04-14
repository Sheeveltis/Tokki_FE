import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'solito/navigation'
import { ConfigProvider, FloatButton, Tooltip, message } from 'antd'
import { SettingOutlined, BookOutlined, ShareAltOutlined, FileTextOutlined, PlusOutlined } from '@ant-design/icons'

import { BlogLayout } from '../../components/blog-detail/blog-layout'
import { getBlogDetail, getAllBlogs, increaseViewCount, getCommentsByBlog } from '../../api'
import { Loading } from '../../../../../components/Loading'
import { BlogMainContent } from '../../components/blog-detail/blog-main'
import { getCurrentUser } from '../../../user/api/profile'
import { getAuthToken } from '../../../../provider/api/client'

export function BlogDetailScreen() {
  const params = useParams()
  const slug = params?.slug 

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [relatedBlogs, setRelatedBlogs] = useState([])
  const [comments, setComments] = useState([])
  const [userProfile, setUserProfile] = useState(null)
  
  // Ref để track danh sách ID blog đã tăng lượt xem, tránh gọi API 2 lần
  const increasedViewIds = useRef(new Set())

  const fetchComments = async (blogId) => {
    try {
      const data = await getCommentsByBlog(blogId)
      setComments(data || [])
    } catch (err) {
      console.warn('Failed to fetch comments:', err)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return
      setLoading(true)
      setRelatedBlogs([])
      setError(null)

      try {
        // 1. Load blog detail
        const blogDetail = await getBlogDetail(slug)
        setData(blogDetail)
        
        if (blogDetail?.id) {
          // 2. Tăng lượt xem (async) - Chỉ tăng 1 lần cho mỗi blog ID trong vòng đời component
          if (!increasedViewIds.current.has(blogDetail.id)) {
            increaseViewCount(blogDetail.id).catch(console.warn)
            increasedViewIds.current.add(blogDetail.id)
          }

          // 3. Load comments
          fetchComments(blogDetail.id)

          // 4. Load bài viết liên quan theo Category
          let related = []
          if (blogDetail.categoryId) {
            try {
              const { blogs } = await getAllBlogs({ 
                pageNumber: 1, 
                pageSize: 4, 
                categoryId: blogDetail.categoryId,
                status: 1 
              })
              related = (blogs || []).filter(b => b.id !== blogDetail.id)
            } catch (err) {
              console.warn('Failed to fetch category blogs:', err)
            }
          }

          if (related.length === 0) {
            try {
              const { blogs } = await getAllBlogs({ pageNumber: 1, pageSize: 4, status: 1 })
              related = (blogs || []).filter(b => b.id !== blogDetail.id)
            } catch (err) {
              console.warn('Failed to fetch latest blogs fallback:', err)
            }
          }
          setRelatedBlogs(related.slice(0, 3))

          // 5. Fetch current user for avatars (chỉ khi đã đăng nhập)
          const token = getAuthToken()
          if (!userProfile && token) {
            getCurrentUser().then(setUserProfile).catch(console.warn)
          }
        }
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    window.scrollTo(0, 0)
  }, [slug])

  // Render content dựa trên state
  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ minHeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
          <Loading
            size={48}
            color="#F1BE4B"
            shadowColor="#F1BE4B50"
            text="Đang tải tâm huyết kiến thức..."
          />
        </div>
      )
    }

    if (error) {
      return (
        <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#ff4d4f', fontSize: 18, textAlign: 'center', fontWeight: 600 }}>Lỗi: {error}</p>
        </div>
      )
    }

    if (!data) {
      return (
        <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#666', fontSize: 18, textAlign: 'center' }}>Không tìm thấy bài viết.</p>
        </div>
      )
    }

    return (
      <BlogMainContent 
        data={data} 
        comments={comments} 
        currentUser={userProfile}
        onCommentPosted={() => fetchComments(data.id)} 
      />
    )
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#F1BE4B',
          borderRadius: 16,
          fontFamily: "'Epilogue', sans-serif",
        },
        components: {
          Button: {
            controlHeightLG: 48,
            fontWeight: 700,
          },
          Card: {
            borderRadiusLG: 24,
          }
        },
      }}
    >
      <BlogLayout relatedPosts={relatedBlogs}>
        {renderContent()}

        {/* Floating Actions */}
        <FloatButton.BackTop visibilityHeight={400} style={{ right: 24, bottom: 24 }} />
        <FloatButton.Group
          trigger="hover"
          type="primary"
          style={{ left: 24, bottom: 175 }}
          icon={<SettingOutlined />}
        >
          <Tooltip title="Quản lý bài viết" placement="right">
            <FloatButton icon={<FileTextOutlined />} onClick={() => router.push('/blog/management')} />
          </Tooltip>
          <Tooltip title="Lưu bài viết" placement="right">
            <FloatButton icon={<BookOutlined />} onClick={() => message.info('Đã lưu vào bộ sưu tập')} />
          </Tooltip>
          <Tooltip title="Chia sẻ" placement="right">
            <FloatButton icon={<ShareAltOutlined />} onClick={() => message.success('Link đã được sao chép')} />
          </Tooltip>
          <Tooltip title="Viết bài mới" placement="right">
            <FloatButton icon={<PlusOutlined />} onClick={() => router.push('/blog/create')} />
          </Tooltip>
        </FloatButton.Group>
      </BlogLayout>
    </ConfigProvider>
  )
}



