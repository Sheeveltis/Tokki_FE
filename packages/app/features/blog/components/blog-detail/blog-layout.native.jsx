import React from 'react'
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native'
import { NavbarMobile } from '../../../../../components/navbar-mobile'
import { BlogSidebar } from './blog-detail-sidebar'
import { useRouter } from 'solito/navigation'

/**
 * BlogLayout (Native): Layout cho trang chi tiết blog trên mobile
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Nội dung bài viết
 * @param {Array} props.relatedPosts - Các bài viết liên quan
 */
export function BlogLayout({ children, relatedPosts }) {
  const router = useRouter()

  return (
    <View style={styles.root}>
      {/* Top Header with Back Button */}
      <View style={styles.topHeader}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Content */}
        <View style={styles.content}>
           {children}
        </View>

        <View style={styles.divider} />

        {/* Related Posts Section (Formerly Sidebar) */}
        <View style={styles.relatedSection}>
           <BlogSidebar relatedPosts={relatedPosts} />
        </View>

        {/* Spacer for bottom navbar */}
        <View style={{ height: 100 }} />
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
  topHeader: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#5E794C',
    fontSize: 16,
    fontWeight: '600',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  scrollContent: {
    paddingTop: 10,
  },
  content: { 
    paddingHorizontal: 16,
    marginBottom: 20 
  },
  divider: { 
    height: 8, 
    backgroundColor: '#F9FBF7', 
    marginVertical: 10 
  },
  relatedSection: { 
    padding: 16,
    paddingBottom: 30 
  } 
})