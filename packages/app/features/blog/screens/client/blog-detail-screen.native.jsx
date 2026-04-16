import React, { useEffect, useState, useRef } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useParams } from 'solito/navigation'
import { BlogLayout } from '../../components/blog-detail/blog-layout.native'
import { getBlogDetail, getAllBlogs, increaseViewCount, getCommentsByBlog } from '../../api'
import { LoadingWithContainer } from '../../../../../components/Loading'
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
        const blogDetail = await getBlogDetail(slug)
        setData(blogDetail)
        
        if (blogDetail?.id) {
          if (!increasedViewIds.current.has(blogDetail.id)) {
            increaseViewCount(blogDetail.id).catch(console.warn)
            increasedViewIds.current.add(blogDetail.id)
          }

          fetchComments(blogDetail.id)

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
  }, [slug])

  const renderContent = () => {
    if (loading) {
      return (
        <LoadingWithContainer
          size={48}
          color="#F1BE4B"
          shadowColor="#F1BE4B50"
          text="Đang tải bài viết..."
          style={styles.centerContainer}
        />
      )
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Lỗi: {error}</Text>
        </View>
      )
    }

    if (!data) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.notFoundText}>Không tìm thấy bài viết.</Text>
        </View>
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
    <BlogLayout relatedPosts={relatedBlogs}>
      {renderContent()}
    </BlogLayout>
  )
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600'
  },
  notFoundText: {
    color: '#666',
    fontSize: 18,
    textAlign: 'center'
  }
})
