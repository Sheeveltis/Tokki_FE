import React from 'react'
import { View, Text, Image, StyleSheet, Platform } from 'react-native'
import { HtmlViewer } from './html-viewer'
import { BlogAuthor } from './blog-author'
import { BlogTags } from './blog-tags'
import { BlogComments } from './blog-comments'

export function BlogMainContent({ data }) {
  if (!data) return null

  return (
    <View>
      {/* Category Badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{data.categoryName || data.category}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{data.title}</Text>

      {/* Thumbnail */}
      {data.thumbnailUrl && (
        <Image
          source={{ uri: data.thumbnailUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      {/* Content */}
      <HtmlViewer html={data.content || ''} />

      {/* Tags */}
      {Array.isArray(data.tags) && data.tags.length > 0 && (
        <BlogTags tags={data.tags} />
      )}

      {/* Author Info - Đặt dưới content, trên comments */}
      <BlogAuthor
        author={data.author || null}
        createdAt={data.createdAt}
        viewCount={data.viewCount || 0}
      />

      {/* Comments */}
      <BlogComments blogId={data.id} />
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#ff4d4f', // Màu đỏ
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 16,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: Platform.OS === 'web' ? 32 : 24,
    fontWeight: 'bold',
    marginBottom: 20,
    lineHeight: Platform.OS === 'web' ? 42 : 32,
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  image: {
    width: '100%',
    height: Platform.OS === 'web' ? 400 : 250,
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: '#f0f0f0',
  },
})