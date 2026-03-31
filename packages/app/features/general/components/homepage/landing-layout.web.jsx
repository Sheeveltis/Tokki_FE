import React from 'react'
import { View, ScrollView, StyleSheet, Platform } from 'react-native'
import { Navbar } from '../../../../../components/navbar'
import { Footer } from '../../../../../components/footer'
import BubbleChat from '../../api/bubble-chat-index'
import { AppShow } from '../../../../../components/appShow'

/**
 * LandingLayout (Web): Bố cục trang Landing Page toàn màn hình
 * Sử dụng Navbar và Footer chung nhưng cho phép nội dung chiếm trọn chiều rộng
 */
export function LandingLayout({
  children,
  onHomePress,
  onRoadmapPress,
  onFlashcardPress,
  onBlogPress,
  onProfilePress,
}) {
  return (
    <View style={styles.root}>
      {/* Navbar chung */}
      <Navbar
        onHomePress={onHomePress}
        onRoadmapPress={onRoadmapPress}
        onFlashcardPress={onFlashcardPress}
        onBlogPress={onBlogPress}
        onProfilePress={onProfilePress}
      />

      {/* Nội dung chiếm trọn chiều rộng cho Landing Page */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.wrapper}>
          {children}
        </View>

        {/* Footer chung */}
        <Footer style={styles.footer} />
      </ScrollView>

      {/* Các widget bổ trợ */}
      <AppShow
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          zIndex: 1000,
        }}
      />
      <BubbleChat />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    minHeight: '100vh',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  wrapper: {
    width: '100%',
    // Landing Page thường chiếm full width, không giới hạn 1200px ở lớp layout này
    // Căn lề trong đã được handle bởi các section bên trong LandingPage
  },
  footer: {
    marginTop: 0, // Reset margin top vì LandingPage đã có padding cuối
  }
})
