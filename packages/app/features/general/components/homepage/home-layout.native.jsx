import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { NavbarMobile } from '../../../../../components/navbar-mobile'
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
      <NavbarMobile
        onHomePress={onHomePress}
        onRoadmapPress={onRoadmapPress}
        onFlashcardPress={onFlashcardPress}
        onBlogPress={onBlogPress}
        onProfilePress={onProfilePress}
      />
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
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'center',
    padding: 16,
    paddingBottom: 50,
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

