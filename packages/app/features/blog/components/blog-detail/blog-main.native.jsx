import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { HtmlViewer } from './html-viewer'
import { BlogComments } from './blog-comments'

export function BlogMainContent({ data, comments, currentUser, onCommentPosted }) {
  if (!data) return null

  return (
    <View style={styles.container}>
      {/* Banner */}
      <Image 
        source={{ uri: data.thumbnailUrl || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1200' }} 
        style={styles.banner} 
      />
      
      {/* Title & Meta Info */}
      <View style={styles.header}>
        <Text style={styles.category}>{data.categoryName || 'Khác'}</Text>
        <Text style={styles.title}>{data.title}</Text>
        
        <View style={styles.meta}>
          <Image 
            source={{ uri: data?.author?.avatarUrl || 'https://api.dicebear.com/7.x/thumbs/svg?seed=tokki' }} 
            style={styles.avatar}
          />
          <View>
            <Text style={styles.author}>{data?.author?.fullName || 'Tác giả'}</Text>
            <Text style={styles.date}>
              {new Date(data.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <HtmlViewer html={data.content || '<p></p>'} />
      </View>

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {data.tags.map((tag, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Comments */}
      <View style={styles.commentsSection}>
        <BlogComments blogId={data.id} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
  },
  header: {
    marginBottom: 20,
  },
  category: {
    color: '#D9A635',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
    lineHeight: 34,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  author: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  date: {
    fontSize: 13,
    color: '#888',
  },
  content: {
    marginVertical: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
    marginTop: 20,
  },
  tag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tagText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
  commentsSection: {
    marginTop: 16,
    marginBottom: 40,
  }
})
