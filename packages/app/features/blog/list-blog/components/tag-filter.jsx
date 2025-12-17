import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

// Giả lập list Tags phổ biến
const POPULAR_TAGS = [
  "Văn hóa Hàn Quốc", "Quy tắc bàn ăn", "Kỹ năng sống", 
  "Du lịch Seoul", "Ẩm thực", "Ngữ pháp sơ cấp"
]

export const TagFilter = React.memo(function TagFilter({ selectedTags = [], onToggle }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Lọc theo thẻ (Chọn nhiều):</Text>
      <View style={styles.wrap}>
        {POPULAR_TAGS.map(tag => {
          // Kiểm tra xem tag này có đang được chọn không
          const isSelected = selectedTags.includes(tag)
          
          return (
            <TouchableOpacity 
              key={tag}
              style={[styles.tag, isSelected && styles.tagActive]}
              onPress={() => onToggle(tag)}
            >
              <Text style={[styles.text, isSelected && styles.textActive]}>
                {isSelected ? '✓ ' : ''}#{tag}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginBottom: 10 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, // flexWrap để tự xuống dòng
  tag: { 
    paddingHorizontal: 12, paddingVertical: 6, 
    borderRadius: 6, borderWidth: 1, borderColor: '#ddd',
    backgroundColor: '#fff'
  },
  tagActive: { backgroundColor: '#e6f7ff', borderColor: '#1890ff' },
  text: { fontSize: 12, color: '#666' },
  textActive: { color: '#1890ff', fontWeight: 'bold' }
})