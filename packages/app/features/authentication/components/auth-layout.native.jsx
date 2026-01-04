import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'

/**
 * AuthLayout (native): trên mobile chỉ cần hiển thị form full-width,
 * không cần chia cột hero như web.
 *
 * Nhận cùng props với bản web (`hero`, `panel`), nhưng chỉ render `panel`
 * (hoặc `children` nếu không có `panel`), bỏ qua hero.
 */
export function AuthLayout({ hero, panel, children }) {
  const content = panel || children
  return (
    <ScrollView 
      style={styles.root}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {content}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 0,
  },
})


