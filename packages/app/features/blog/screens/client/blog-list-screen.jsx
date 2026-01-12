import React, { useState, useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { BlogListLayout } from '../../components/blog-list/blog-list-layout'
import { useBlogsInfinite } from '../../api/hooks'
import { LoadingWithContainer } from '../../../../../components/Loading'

const PAGE_SIZE = 10 // 10 blog mỗi trang

export function BlogListScreen() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useBlogsInfinite({
    pageSize: PAGE_SIZE,
    status: 1, // Chỉ lấy blog đã publish
  })

  // Flatten tất cả blogs từ các pages
  const blogs = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flatMap((page) => page.blogs || [])
  }, [data])

  const hasMore = hasNextPage || false
  const loading = isLoading

  // Load more blogs
  const handleLoadMore = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage()
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
          <Text style={styles.errorText}>
            {error?.message || 'Không thể tải danh sách blog'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => window.location.reload()}
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
      loading={isFetchingNextPage}
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
