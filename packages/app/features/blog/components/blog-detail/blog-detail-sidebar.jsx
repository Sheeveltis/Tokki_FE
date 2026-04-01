import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { useRouter } from 'solito/navigation'

// 👇 FIX 1: Thêm " = []" để mặc định là mảng rỗng, tránh lỗi crash
export function BlogSidebar({ relatedPosts = [] }) {
  const router = useRouter()

  // Kiểm tra an toàn: Có dữ liệu mới render
  const hasPosts = relatedPosts && relatedPosts.length > 0

  const handlePostClick = (post) => {
    if (post.slug) {
      router.push(`/blog/${post.slug}`)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.header}>Follow Us</Text>
        <Text>Facebook - TikTok - Youtube</Text>
      </View>

      {/* Chỉ hiện box này nếu có bài viết liên quan */}
      {hasPosts && (
        <View style={styles.box}>
          <Text style={styles.header}>Bài Viết Mới</Text>
          {/* 👇 FIX 2: Thêm dấu ? để an toàn tuyệt đối */}
          {relatedPosts?.map(post => (
            <TouchableOpacity
              key={post.id}
              style={styles.item}
              onPress={() => handlePostClick(post)}
            >
              <View style={styles.itemContent}>
                {post.thumbnailUrl && (
                  <Image
                    source={{ uri: post.thumbnailUrl }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                )}
                <Text style={styles.link} numberOfLines={2}>{post.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginTop: 0 },
  box: {
    // 👇 FIX 3: Sửa style border cho chuẩn React Native
    borderWidth: 1,
    borderColor: '#eee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20
  },
  header: { fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
  item: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    flexShrink: 0,
  },
  link: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  }
})