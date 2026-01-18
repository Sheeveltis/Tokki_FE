import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Navbar } from '../../../../../components/navbar'
import { Footer } from '../../../../../components/footer'
import { HomeSidebar } from './home-sidebar'

/**
 * HomeLayout (Native): Bố cục trang Home cho màn hình mobile/native
 * 
 * Nguyên tắc: CHỈ import và sắp xếp các component con.
 * KHÔNG chứa logic xử lý nghiệp vụ, gọi API, hay quản lý state phức tạp.
 * 
 * @param {{
 *   children: React.ReactNode
 *   sidebarData?: any
 *   onHomePress?: () => void
 *   onRoadmapPress?: () => void
 *   onFlashcardPress?: () => void
 *   onBlogPress?: () => void
 *   onProfilePress?: () => void
 * }} props
 */
export function HomeLayout({
  children,
  sidebarData,
  onHomePress,
  onRoadmapPress,
  onFlashcardPress,
  onBlogPress,
  onProfilePress,
}) {
  return (
    <View style={styles.root}>
      {/* Navbar ở đầu trang */}
      <Navbar
        onHomePress={onHomePress}
        onRoadmapPress={onRoadmapPress}
        onFlashcardPress={onFlashcardPress}
        onBlogPress={onBlogPress}
        onProfilePress={onProfilePress}
      />

      {/* Nội dung chính */}
      <ScrollView style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.content}>
            {children}
          </View>

          <View style={styles.divider} />

          <View style={styles.sidebar}>
            <HomeSidebar data={sidebarData} />
          </View>
        </View>
      </ScrollView>

      {/* Footer ở cuối trang */}
      <Footer />
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
    backgroundColor: '#fff',
  },
  wrapper: {
    width: '70%',
    maxWidth: '100%',
    alignSelf: 'center',
    padding: 16,
  },
  content: {
    marginBottom: 30,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  sidebar: {
    paddingBottom: 50,
  },
})

