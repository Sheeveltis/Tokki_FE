import React, { useState, useMemo, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Navbar } from '../../../../../components/navbar'
import { Footer } from '../../../../../components/footer'
import { BlogSidebar } from './blog-list-sidebar'
import { CategoryFilter } from './category-filter'
import { TagFilter } from './tag-filter'
import { BlogCard } from '../shared/blog-card'
import { useRouter } from 'solito/navigation'
import { Loading } from '../../../../../components/Loading'

/**
 * BlogListLayout (Web): Layout cho trang danh sách blog
 * Tự động bao gồm Navbar và Footer
 * Layout: 4/5 content + 1/5 sidebar
 * 
 * @param {Object} props
 * @param {Array} props.blogs - Danh sách blog
 * @param {boolean} props.loading - Đang load thêm blog
 * @param {boolean} props.hasMore - Còn blog để load
 * @param {Function} props.onLoadMore - Callback khi click "Load More"
 */
export function BlogListLayout({ blogs = [], loading = false, hasMore = false, onLoadMore }) {
  const router = useRouter()
  
  // --- STATE QUẢN LÝ BỘ LỌC ---
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])

  // --- HÀM TOGGLE TAG ---
  const handleToggleTag = useCallback((tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag)
      } else {
        return [...prev, tag]
      }
    })
  }, [])

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredBlogs = useMemo(() => {
    return blogs.filter(item => {
      if (selectedCategory && item.categoryId !== selectedCategory) {
        return false
      }
      if (selectedTags.length > 0) {
        const hasMatchingTag = item.tags?.some(t => selectedTags.includes(t))
        if (!hasMatchingTag) return false
      }
      return true
    })
    // Không slice ở đây nữa vì pagination đã xử lý ở index.jsx
  }, [blogs, selectedCategory, selectedTags])

  // Lấy blog mới nhất cho sidebar (sắp xếp theo createdAt)
  const latestBlogs = useMemo(() => {
    return [...blogs]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5) // Top 5 blog mới nhất
  }, [blogs])

  return (
    <View style={styles.root}>
      {/* Navbar ở đầu trang */}
      <Navbar />

      {/* Nội dung chính với layout 4/5 + 1/5 */}
      <View style={styles.mainContent}>
        {/* Content area - 4/5 */}
        <View style={styles.contentArea}>
          {/* Filters */}
          <View style={styles.filtersContainer}>
            <CategoryFilter 
              selectedId={selectedCategory} 
              onSelect={setSelectedCategory} 
            />
            <TagFilter 
              selectedTags={selectedTags} 
              onToggle={handleToggleTag} 
            />
          </View>

          {/* Blog List - 1 hàng 1 card */}
          <ScrollView style={styles.blogList} showsVerticalScrollIndicator={false}>
            {filteredBlogs.map((item) => (
              <BlogCard
                key={item.id}
                item={item}
                onPress={() => router.push(`/blog/${item.slug}`)}
              />
            ))}
            {filteredBlogs.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Không tìm thấy bài viết phù hợp.
                </Text>
              </View>
            )}
            
            {/* Load More Button */}
            {hasMore && filteredBlogs.length > 0 && (
              <View style={styles.loadMoreContainer}>
                {loading ? (
                  <Loading size={24} color="#5E794C" shadowColor="#5E794C50" />
                ) : (
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={onLoadMore}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.loadMoreText}>Xem thêm</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        </View>

        {/* Sidebar - 1/5 */}
        <View style={styles.sidebarArea}>
          <BlogSidebar latestBlogs={latestBlogs} />
        </View>
      </View>

      {/* Footer ở cuối trang */}
      <Footer style={{}} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  },
  mainContent: {
    width: '70%',
    maxWidth: 1200,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 40,
    alignItems: 'flex-start',
    alignSelf: 'center',
    paddingVertical: 20,
  },
  contentArea: {
    flex: 4, // 4/5
    marginRight: 20,
  },
  sidebarArea: {
    flex: 1, // 1/5
    maxWidth: 280,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingBottom: 16,
    marginBottom: 16,
  },
  blogList: {
    flex: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  loadMoreContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreButton: {
    backgroundColor: '#1890ff',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 6,
    minWidth: 120,
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
})

