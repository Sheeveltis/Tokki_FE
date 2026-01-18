import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'solito/navigation'

/**
 * BlogTags: Component hiển thị tags của blog
 * @param {Object} props
 * @param {Array<string>} props.tags - Danh sách tags
 */
export function BlogTags({ tags = [] }) {
  const router = useRouter()

  if (!tags || tags.length === 0) {
    return null
  }

  const handleTagPress = (tag) => {
    // Có thể navigate đến trang filter theo tag
    // router.push(`/blog?tag=${encodeURIComponent(tag)}`)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tags:</Text>
      <View style={styles.tagsContainer}>
        {tags.map((tag, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tagBadge}
            onPress={() => handleTagPress(tag)}
            activeOpacity={0.7}
          >
            <Text style={styles.tagText}>#{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  tagText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
})

