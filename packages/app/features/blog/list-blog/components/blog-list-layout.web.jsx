import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { Navbar } from 'components/navbar'
import { Footer } from 'components/footer'
import { BlogSidebar } from './blog-sidebar'
import { CategoryFilter } from './category-filter'
import { TagFilter } from './tag-filter'
import { BlogCard } from './blog-card'
import { useRouter } from 'solito/navigation'

/**
 * BlogListLayout (Web): Layout cho trang danh sách blog
 * Tự động bao gồm Navbar và Footer
 * Layout: 4/5 content + 1/5 sidebar
 */
export function BlogListLayout({ blogs = [] }) {
  const router = useRouter()
  
  // --- STATE QUẢN LÝ BỘ LỌC ---
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])

  // --- HÀM TOGGLE TAG ---
  const handleToggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag))
    } else {
      setSelectedTags(prev => [...prev, tag])
    }
  }

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
    }).slice(0, 10) // Giới hạn tối đa 10 blog
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
            {filteredBlogs.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Không tìm thấy bài viết phù hợp.
                </Text>
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
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    maxWidth: 1400,
    alignSelf: 'center',
    paddingHorizontal: 16,
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
})

