import React from 'react'
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native'

// Giả lập data danh mục (Sau này lấy từ API)
const CATEGORIES = [
  { id: null, name: 'Tất cả' },
  { id: 'x2bgHp432Q', name: 'Văn hóa & Đời sống' },
  { id: 'cat_topik', name: 'Luyện thi TOPIK' },
  { id: 'cat_duhoc', name: 'Du học' },
]

export const CategoryFilter = React.memo(function CategoryFilter({ selectedId, onSelect }) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map(cat => {
        const isActive = selectedId === cat.id
        return (
          <TouchableOpacity 
            key={cat.id || 'all'}
            style={[styles.item, isActive && styles.itemActive]}
            onPress={() => onSelect(cat.id)}
          >
            <Text style={[styles.text, isActive && styles.textActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
})

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  item: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0' },
  itemActive: { backgroundColor: '#111' },
  text: { fontSize: 14, fontWeight: '500', color: '#333' },
  textActive: { color: '#fff' }
})