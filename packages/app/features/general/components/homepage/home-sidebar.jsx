import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

/**
 * HomeSidebar: Component sidebar cho trang Home
 * 
 * Nguyên tắc:
 * - Xử lý hiển thị giao diện sidebar
 * - Có thể quản lý state cục bộ nếu cần
 * - Nhận dữ liệu từ props (không tự gọi API)
 * 
 * @param {{
 *   data?: any
 * }} props
 */
export function HomeSidebar({ data }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thông Tin</Text>
      
      {data && (
        <View style={styles.content}>
          {data.description && (
            <Text style={styles.description}>{data.description}</Text>
          )}
          
          {data.links && data.links.length > 0 && (
            <View style={styles.linksContainer}>
              {data.links.map((link, index) => (
                <Text key={index} style={styles.link}>
                  • {link}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {!data && (
        <Text style={styles.emptyText}>Chưa có thông tin</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Lexend, sans-serif',
    color: '#000',
    marginBottom: 8,
  },
  content: {
    gap: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  linksContainer: {
    gap: 8,
  },
  link: {
    fontSize: 14,
    color: '#5E794C',
    fontFamily: 'Epilogue, sans-serif',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
    fontStyle: 'italic',
  },
})

