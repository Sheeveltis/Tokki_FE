import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native'

/**
 * Mock data cho comments với avatar URLs thực tế
 */
const MOCK_COMMENTS = [
  {
    id: 'comment-1',
    authorName: 'Nguyễn Văn A',
    authorAvatar: 'https://banobagi.vn/wp-content/uploads/2025/06/avatar-bua-2.jpg',
    content: 'Bài viết rất hay và hữu ích! Cảm ơn tác giả đã chia sẻ.',
    createdAt: '2025-11-28T10:30:00+00:00',
    likes: 5,
  },
  {
    id: 'comment-2',
    authorName: 'Trần Thị B',
    authorAvatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRne4izmLRyAgZg4kHx3xDUtrFZrNPdd8XLHQ&s',
    content: 'Mình đã áp dụng một số quy tắc này khi đi ăn với đồng nghiệp Hàn Quốc, họ rất ấn tượng!',
    createdAt: '2025-11-28T14:20:00+00:00',
    likes: 3,
  },
  {
    id: 'comment-3',
    authorName: 'Lê Văn C',
    authorAvatar: 'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482740eMe/anh-mo-ta.png',
    content: 'Quy tắc về vị trí đũa mình chưa biết, cảm ơn bạn đã nhắc nhở!',
    createdAt: '2025-11-29T09:15:00+00:00',
    likes: 2,
  },
  {
    id: 'comment-4',
    authorName: 'Phạm Thị D',
    authorAvatar: 'https://i.pravatar.cc/150?img=9',
    content: 'Rất thích bài viết này! Mình sẽ chia sẻ cho bạn bè.',
    createdAt: '2025-11-29T15:45:00+00:00',
    likes: 1,
  },
]

/**
 * BlogComments: Component hiển thị và quản lý comments
 * @param {Object} props
 * @param {string} props.blogId - ID của blog
 */
export function BlogComments({ blogId }) {
  const [comments, setComments] = useState(MOCK_COMMENTS)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    
    // Mock: Thêm comment mới
    // Sau này sẽ gọi API: createComment(blogId, newComment)
    setTimeout(() => {
      const comment = {
        id: `comment-${Date.now()}`,
        authorName: 'Bạn',
        authorAvatar: 'https://i.pravatar.cc/150?img=33',
        content: newComment,
        createdAt: new Date().toISOString(),
        likes: 0,
      }
      setComments(prev => [comment, ...prev])
      setNewComment('')
      setIsSubmitting(false)
    }, 500)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays < 7) return `${diffDays} ngày trước`
    return date.toLocaleDateString('vi-VN')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bình luận ({comments.length})</Text>

      {/* Form thêm comment mới */}
      <View style={styles.commentForm}>
        <TextInput
          style={styles.input}
          placeholder="Viết bình luận..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
          numberOfLines={3}
        />
        <TouchableOpacity
          style={[styles.submitButton, (!newComment.trim() || isSubmitting) && styles.submitButtonDisabled]}
          onPress={handleSubmitComment}
          disabled={!newComment.trim() || isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách comments */}
      <ScrollView style={styles.commentsList}>
        {comments.map((comment) => (
          <View key={comment.id} style={styles.commentItem}>
            <Image 
              source={{ uri: comment.authorAvatar }} 
              style={styles.commentAvatar}
            />
            <View style={styles.commentContent}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
              </View>
              <Text style={styles.commentText}>{comment.content}</Text>
              <View style={styles.commentActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionText}>👍 {comment.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionText}>Trả lời</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f1f1f',
    marginBottom: 20,
  },
  commentForm: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#1890ff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  submitButtonDisabled: {
    backgroundColor: '#d0d0d0',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  commentsList: {
    maxHeight: 600,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f1f1f',
    marginRight: 8,
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
  },
})

