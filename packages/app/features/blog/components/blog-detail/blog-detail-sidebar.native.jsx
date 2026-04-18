import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'solito/navigation'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1547036967-23d1199d3b21?auto=format&fit=crop&w=200'

function formatShortDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long' })
}

export function BlogDetailSidebar({ relatedPosts = [] }) {
  const router = useRouter()

  if (!relatedPosts || relatedPosts.length === 0) return null

  return (
    <View style={styles.container}>
      {/* Section label */}
      <View style={styles.labelContainer}>
        <View style={styles.dot} />
        <Text style={styles.labelText}>Đề xuất đọc thêm</Text>
      </View>

      <Text style={styles.title}>Cùng chuyên mục</Text>

      <View style={styles.list}>
        {relatedPosts.slice(0, 3).map((post, idx) => (
          <View key={post.id}>
            <TouchableOpacity
              style={styles.item}
              onPress={() => router.push(`/blog/${post.slug}`)}
              activeOpacity={0.7}
            >
              <Image 
                source={{ uri: post.thumbnailUrl || FALLBACK_IMG }} 
                style={styles.thumbnail}
              />
              <View style={styles.itemContent}>
                {post.categoryName && (
                  <Text style={styles.categoryName} numberOfLines={1}>
                    {post.categoryName}
                  </Text>
                )}
                {post.title && (
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {post.title}
                  </Text>
                )}
                {post.shortDescription && (
                  <Text style={styles.itemDesc} numberOfLines={1}>
                    {post.shortDescription}
                  </Text>
                )}
                <View style={styles.meta}>
                  <Text style={styles.metaText}>{formatShortDate(post.createdAt)}</Text>
                  <Text style={styles.metaText}> • </Text>
                  <Text style={styles.metaText}>{post.viewCount || 0} lượt xem</Text>
                </View>
              </View>
            </TouchableOpacity>
            
            {idx < relatedPosts.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1BE4B',
    marginRight: 8,
  },
  labelText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#D9A635',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 20,
  },
  list: {
    flexDirection: 'column',
  },
  item: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingVertical: 8,
  },
  thumbnail: {
    width: 100,
    height: 70,
    borderRadius: 12,
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F1BE4B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
    lineHeight: 20,
  },
  itemDesc: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 8,
    marginHorizontal: 10,
  }
})
