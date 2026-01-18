import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import UserIcon from '../../../../../assets/user.png'

/**
 * BlogAuthor: Component hiển thị thông tin tác giả
 * @param {Object} props
 * @param {Object} props.author - Thông tin author từ API { id, fullName, avatarUrl }
 * @param {string} props.createdAt - Ngày đăng bài
 * @param {number} props.viewCount - Số lượt xem
 */
export function BlogAuthor({ author, createdAt, viewCount = 0 }) {
  // Sử dụng default avatar nếu avatarUrl là null hoặc không có
  const avatarSource = author?.avatarUrl 
    ? { uri: author.avatarUrl }
    : UserIcon

  const authorName = author?.fullName || 'Tác giả'

  const formattedDate = new Date(createdAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <View style={styles.container}>
      <Image 
        source={avatarSource}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.authorName}>{authorName}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>📅 {formattedDate}</Text>
          <Text style={styles.metaText}> • </Text>
          <Text style={styles.metaText}>👁️ {viewCount} lượt xem</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 24,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#e0e0e0',
  },
  info: {
    flex: 1,
  },
  authorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f1f1f',
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  bio: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 4,
  },
})

