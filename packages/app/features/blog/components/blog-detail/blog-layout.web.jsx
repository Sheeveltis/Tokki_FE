import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Navbar } from '../../../../../components/navbar'
import { Footer } from '../../../../../components/footer'
import { BlogSidebar } from './blog-detail-sidebar'

export function BlogLayout({ children, relatedPosts }) {
  return (
    <View style={styles.root}>
      {/* Navbar ở đầu trang */}
      <Navbar />

      {/* Nội dung chính */}
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.wrapper}>
          
          <View style={styles.leftCol}>
             {children}
          </View>

          <View style={styles.rightCol}>
             {/* Truyền relatedPosts xuống Sidebar */}
             <BlogSidebar relatedPosts={relatedPosts} />
          </View>

        </View>
      </ScrollView>

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
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { alignItems: 'center', paddingVertical: 20 },
  wrapper: { 
    width: '100%', 
    maxWidth: 1200, 
    paddingHorizontal: 16, 
    flexDirection: 'row', 
    gap: 40,
    alignItems: 'flex-start' 
  },
  leftCol: { flex: 1, minWidth: 0 }, 
  rightCol: { width: 300, flexShrink: 0 } 
})