import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

// 👇 FIX 1: Thêm " = []" để mặc định là mảng rỗng, tránh lỗi crash
export function BlogSidebar({ relatedPosts = [] }) {
  
  // Kiểm tra an toàn: Có dữ liệu mới render
  const hasPosts = relatedPosts && relatedPosts.length > 0

  return (
    <View style={styles.container}>
      <View style={styles.box}>
         <Text style={styles.header}>Follow Us</Text>
         <Text>Facebook - TikTok - Youtube</Text>
      </View>

      {/* Chỉ hiện box này nếu có bài viết liên quan */}
      {hasPosts && (
        <View style={styles.box}>
           <Text style={styles.header}>Bài Viết Mới</Text>
           {/* 👇 FIX 2: Thêm dấu ? để an toàn tuyệt đối */}
           {relatedPosts?.map(post => (
             <TouchableOpacity key={post.id} style={styles.item}>
               <Text style={styles.link}>• {post.title}</Text>
             </TouchableOpacity>
           ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginTop: 0 },
  box: { 
    // 👇 FIX 3: Sửa style border cho chuẩn React Native
    borderWidth: 1, 
    borderColor: '#eee', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 20 
  },
  header: { fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
  item: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  link: { fontSize: 15 }
})