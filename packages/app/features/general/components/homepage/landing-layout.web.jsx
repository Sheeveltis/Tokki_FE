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
      <View style={styles.wrapper}>
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  wrapper: {
    width: '100%',
  },
})
