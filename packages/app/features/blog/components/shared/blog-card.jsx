import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native'

export const BlogCard = React.memo(function BlogCard({ item, onPress }) {
  const formattedDate = new Date(item.createdAt).toLocaleDateString('vi-VN')
  

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Image bên trái */}
      <Image 
        source={{ uri: item.thumbnailUrl }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      {/* Content bên phải */}
      <View style={styles.content}>
        {/* Category badge màu đỏ */}
        <View style={styles.catBadge}>
          <Text style={styles.catText}>{item.categoryName}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        
        {/* Description/Snippet */}
        <Text style={styles.desc} numberOfLines={3}>{item.shortDescription}</Text>

        {/* Created date */}
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        {/* Tags hiển thị dưới tên tác giả */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    flexDirection: 'row', // Layout ngang: image trái, content phải
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: '#f0f0f0',
    minHeight: 200,
  },
  image: {
    width: 200,
    height: '100%',
    minHeight: 200,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  catBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ff4d4f', // Màu đỏ
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  catText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f1f1f',
    marginBottom: 8,
    lineHeight: 26,
  },
  desc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
    flex: 1,
  },
  dateSection: {
    marginBottom: 8,
  },
  dateText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '400',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tagBadge: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tagText: {
    fontSize: 11,
    color: '#666',
  },
})