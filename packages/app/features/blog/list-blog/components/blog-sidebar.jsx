import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'solito/navigation'

/**
 * BlogSidebar: Sidebar hiển thị blog mới nhất
 * Chiếm 1/5 chiều rộng
 */
export const BlogSidebar = React.memo(function BlogSidebar({ latestBlogs }) {
  const router = useRouter()

  if (!latestBlogs || latestBlogs.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blog Mới Nhất</Text>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {latestBlogs.map((blog) => (
          <TouchableOpacity
            key={blog.id}
            style={styles.blogItem}
            onPress={() => router.push(`/blog/${blog.slug}`)}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: blog.thumbnailUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <View style={styles.blogContent}>
              <Text style={styles.blogTitle} numberOfLines={2}>
                {blog.title}
              </Text>
              <Text style={styles.blogDate}>
                {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f1f1f',
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  blogItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  blogContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  blogTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f1f1f',
    marginBottom: 8,
    lineHeight: 20,
  },
  blogDate: {
    fontSize: 12,
    color: '#999',
  },
})

