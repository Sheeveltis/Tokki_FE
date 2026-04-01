import React, { useState, useMemo, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { NavbarMobile } from '../../../../../components/navbar-mobile'
import { CategoryFilter } from './category-filter'
import { TagFilter } from './tag-filter'
import { BlogCard } from '../shared/blog-card'
import { useRouter } from 'solito/navigation'
import { Loading } from '../../../../../components/Loading'

/**
 * BlogListLayout (Native): Layout cho trang danh sách blog trên mobile
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
  }, [blogs, selectedCategory, selectedTags])

  return (
    <View style={styles.root}>
      {/* Content area */}
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header/Title */}
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Blog & Tin tức</Text>
            <Text style={styles.headerSubtitle}>Khám phá văn hóa và kiến thức tiếng Hàn</Text>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <CategoryFilter 
            selectedId={selectedCategory} 
            onSelect={setSelectedCategory} 
          />
          <View style={styles.tagFilterItem}>
              <TagFilter 
                selectedTags={selectedTags} 
                onToggle={handleToggleTag} 
              />
          </View>
        </View>

        {/* Blog List */}
        <View style={styles.blogList}>
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
          
          {/* Load More Section */}
          {hasMore && (
            <View style={styles.loadMoreContainer}>
              {loading ? (
                <Loading size={24} color="#5E794C" shadowColor="#5E794C50" />
              ) : (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={onLoadMore}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loadMoreText}>Xem thêm bài viết</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Spacer for bottom navbar */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Navbar ở cuối trang */}
      <NavbarMobile />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    backgroundColor: '#F9FBF7',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3A20',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#5E794C',
    opacity: 0.8,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  tagFilterItem: {
    marginTop: -5,
  },
  blogList: {
    paddingHorizontal: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
  },
  loadMoreContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreButton: {
    backgroundColor: '#F0F4ED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#D8E2D1',
  },
  loadMoreText: {
    color: '#5E794C',
    fontSize: 15,
    fontWeight: '600',
  },
})
