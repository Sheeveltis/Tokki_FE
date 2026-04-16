import React from 'react'
import { View, StyleSheet } from 'react-native'
import { HomeSidebar } from './home-sidebar'

/**
 * HomeLayout (Web): Bố cục trang Home cho màn hình desktop
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
}) {
  return (
    <View style={styles.root}>
      <View style={styles.wrapper}>
        <View style={styles.leftCol}>
          {children}
        </View>

        <View style={styles.rightCol}>
          <HomeSidebar data={sidebarData} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    minHeight: '100vh',
    alignItems: 'center',
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  // Sticky footer: ScrollView content luôn "ăn" hết khoảng trống còn lại để đẩy Footer xuống đáy
  scrollContentGrow: {
    flexGrow: 1,
  },
  wrapper: {
    width: '70%',
    maxWidth: 1200,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 40,
    alignItems: 'flex-start',
    alignSelf: 'center',
  },
  leftCol: {
    flex: 1,
    minWidth: 0,
  },
  rightCol: {
    width: 300,
    flexShrink: 0,
  },
})

