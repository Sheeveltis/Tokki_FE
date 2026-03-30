import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { HtmlViewer } from './html-viewer'
import { BlogAuthor } from './blog-author'
import { BlogTags } from './blog-tags'
import { BlogComments } from './blog-comments'

export function BlogMainContent({ data }) {
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
      <HtmlViewer html={data.content} />

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <BlogTags tags={data.tags} />
      )}

      {/* Author Info - Đặt dưới content, trên comments */}
      <BlogAuthor 
        author={data.author}
        createdAt={data.createdAt}
        viewCount={data.viewCount}
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    lineHeight: 42,
    color: '#1a1a1a',
    letterSpacing: -0.5,
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
  },
  image: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: '#f0f0f0',
  },
})