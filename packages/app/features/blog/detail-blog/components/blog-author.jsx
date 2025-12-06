import React, { useState, useEffect } from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'

/**
 * Mock data cho authors - sau này sẽ lấy từ API
 */
const MOCK_AUTHORS = {
  'ACC-Gum': {
    id: 'ACC-Gum',
    name: 'Thảo Trần',
    avatar: 'https://banobagi.vn/wp-content/uploads/2025/06/avatar-bua-19.jpg',
    bio: 'Chuyên gia về văn hóa Hàn Quốc',
  },
  'ACC-Admin': {
    id: 'ACC-Admin',
    name: 'Admin Tokki',
    avatar: 'https://via.placeholder.com/60?text=AT',
    bio: 'Quản trị viên hệ thống',
  },
  // Default fallback
  default: {
    id: 'unknown',
    name: 'Tác giả',
    avatar: 'https://via.placeholder.com/60?text=AU',
    bio: '',
  },
}

/**
 * BlogAuthor: Component hiển thị thông tin tác giả
 * @param {Object} props
 * @param {string} props.authorId - ID của author
 * @param {string} props.createdAt - Ngày đăng bài
 * @param {string} props.viewCount - Số lượt xem
 */
export function BlogAuthor({ authorId, createdAt, viewCount = 0 }) {
  const [author, setAuthor] = useState(MOCK_AUTHORS.default)

  useEffect(() => {
    // Lấy thông tin author từ mock data
    // Sau này sẽ gọi API: getAuthorById(authorId)
    if (authorId && MOCK_AUTHORS[authorId]) {
      setAuthor(MOCK_AUTHORS[authorId])
    } else {
      setAuthor(MOCK_AUTHORS.default)
    }
  }, [authorId])

  const formattedDate = new Date(createdAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: author.avatar }} 
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.authorName}>{author.name}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>📅 {formattedDate}</Text>
          <Text style={styles.metaText}> • </Text>
          <Text style={styles.metaText}>👁️ {viewCount} lượt xem</Text>
        </View>
        {author.bio && (
          <Text style={styles.bio}>{author.bio}</Text>
        )}
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

