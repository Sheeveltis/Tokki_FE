import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { BlogListLayout } from './components/blog-list-layout'
import { getAllBlogs } from '../api/api'
import { LoadingWithContainer } from '../../../../components/Loading'

const PAGE_SIZE = 10 // 10 blog mỗi trang

export function BlogListScreen() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Fetch blogs từ API
  const fetchBlogs = useCallback(async (page = 1, append = false) => {
    try {
      setLoading(true)
      setError(null)

      const { blogs: newBlogs, totalPages: total } = await getAllBlogs({
        pageNumber: page,
        pageSize: PAGE_SIZE,
        status: 1, // Chỉ lấy blog đã publish
      })

      if (append) {
        setBlogs(prev => [...prev, ...newBlogs])
      } else {
        setBlogs(newBlogs)
      }

      setTotalPages(total)
      setCurrentPage(page)
      setHasMore(newBlogs.length === PAGE_SIZE || page < total)
    } catch (err) {
      console.error('Error fetching blogs:', err)
      setError(err.message || 'Không thể tải danh sách blog')
      setBlogs([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Load initial data
  useEffect(() => {
    fetchBlogs(1, false)
  }, [fetchBlogs])

  // Load more blogs
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchBlogs(currentPage + 1, true)
    }
  }

  // Render loading state
  if (loading && blogs.length === 0) {
    return (
      <LoadingWithContainer
        size={48}
        color="#5E794C"
        shadowColor="#5E794C50"
        text="Đang tải danh sách blog..."
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
    )
  }

  // Render error state
  if (error && blogs.length === 0) {
    return (
      <BlogListLayout blogs={[]}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchBlogs(1, false)}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </BlogListLayout>
    )
  }

  return (
    <BlogListLayout 
      blogs={blogs}
      loading={loading}
      hasMore={hasMore}
      onLoadMore={handleLoadMore}
    />
  )
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4d4f',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1890ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
})