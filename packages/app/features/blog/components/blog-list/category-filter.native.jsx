import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

const CATEGORIES = [
  { id: null, name: 'Tất cả' },
  { id: 'x2bgHp432Q', name: 'Văn hóa & Đời sống' },
  { id: 'cat_topik', name: 'Luyện thi TOPIK' },
  { id: 'cat_duhoc', name: 'Du học' },
]

export const CategoryFilter = React.memo(function CategoryFilter({ selectedId, onSelect }) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Danh mục bài viết</Text>
      <View style={styles.list}>
        {CATEGORIES.map((cat) => {
          const isActive = selectedId === cat.id
          return (
            <TouchableOpacity
              key={cat.id || 'all'}
              onPress={() => onSelect(cat.id)}
              activeOpacity={0.8}
              style={[styles.item, isActive && styles.itemActive]}
            >
              <Text style={[styles.itemText, isActive && styles.itemTextActive]}>{cat.name}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24, paddingHorizontal: 16 },
  title: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#94a3b8',
    marginBottom: 12,
    letterSpacing: 1,
  },
  list: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  itemActive: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  itemText: { color: '#64748b', fontWeight: '700', fontSize: 13 },
  itemTextActive: { color: '#fff' },
})
