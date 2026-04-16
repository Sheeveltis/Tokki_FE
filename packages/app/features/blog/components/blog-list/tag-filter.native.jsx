import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

const POPULAR_TAGS = [
  'Văn hóa Hàn Quốc',
  'Quy tắc bàn ăn',
  'Kỹ năng sống',
  'Du lịch Seoul',
  'Ẩm thực',
  'Ngữ pháp sơ cấp',
]

export const TagFilter = React.memo(function TagFilter({ selectedTags = [], onToggle }) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Tìm theo thẻ</Text>

      <View style={styles.list}>
        {POPULAR_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag)

          return (
            <TouchableOpacity
              key={tag}
              onPress={() => onToggle(tag)}
              activeOpacity={0.8}
              style={[styles.item, isSelected && styles.itemSelected]}
            >
              <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>#{tag}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    marginTop: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#94a3b8',
    marginBottom: 12,
    letterSpacing: 1,
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  item: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  itemSelected: {
    backgroundColor: '#F1BE4B',
    borderColor: '#F1BE4B',
  },
  itemText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 12,
  },
  itemTextSelected: {
    color: '#fff',
  },
})
