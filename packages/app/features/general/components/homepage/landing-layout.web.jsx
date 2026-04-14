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
}) {
  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.wrapper}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      <BubbleChat />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FDFBF4',
  },
  wrapper: {
    width: '100%',
  },
})
