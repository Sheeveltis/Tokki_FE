import React from 'react'
import { View, StyleSheet } from 'react-native'

/**
 * AuthLayout (native): trên mobile chỉ cần hiển thị form full-width,
 * không cần chia cột hero như web.
 *
 * Nhận cùng props với bản web (`hero`, `panel`), nhưng chỉ render `panel`
 * (hoặc `children` nếu không có `panel`), bỏ qua hero.
 */
export function AuthLayout({ hero, panel, children }) {
  const content = panel || children
  return <View style={styles.root}>{content}</View>
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: 'center',
  },
})


